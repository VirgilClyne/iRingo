import { fetch, log, logError } from "../utils/utils.mjs";
import { parseWeatherKitURL, providerNameToLogo } from "../function/WeatherKitUtils.mjs";
import AirQuality from "../class/AirQuality.mjs";
import ForecastNextHour from "./ForecastNextHour.mjs";

export default class QWeather {
    constructor(options) {
        this.Name = "QWeather";
        this.Version = "2.0.3";
        log(`\n🟧 ${this.Name} v${this.Version}\n`, "");
        this.url = new URL($request.url);
        this.host = "devapi.qweather.com";
        this.header = { "Content-Type": "application/json" };
        const Parameters = parseWeatherKitURL(this.url);
        Object.assign(this, Parameters, options);
    };

    #Config = {
        "Pollutants": {
            "co": "CO",
            "no": "NO",
            "no2": "NO2",
            "so2": "SO2",
            "o3": "OZONE",
            "nox": "NOX",
            "pm25": "PM2_5",
            "pm2p5": "PM2_5",
            "pm10": "PM10",
            "other": "NOT_AVAILABLE",
            "na": "NOT_AVAILABLE"
        },
    };

    async AirNow(token = this.token) {
        log(`☑️ AirNow`, "");
        const request = {
            "url": `https://${this.host}/v7/air/now?location=${this.longitude},${this.latitude}&key=${token}`,
            "header": this.header,
        };
        let airQuality;
        try {
            const body = await fetch(request).then(response => JSON.parse(response?.body ?? "{}"));
            const timeStamp = Math.round(Date.now() / 1000);
            switch (body?.code) {
                case "200":
                    airQuality = {
                        "metadata": {
                            "attributionUrl": body?.fxLink,
                            "expireTime": timeStamp + 60 * 60,
                            "language": `${this.language}-${this.country}`,
                            "latitude": this.latitude,
                            "longitude": this.longitude,
                            "providerLogo": providerNameToLogo("和风天气", this.version),
                            "providerName": "和风天气",
                            "readTime": timeStamp,
                            "reportedTime": Math.round(new Date(body?.now?.pubTime).valueOf() / 1000),
                            "temporarilyUnavailable": false,
                            "sourceType": "STATION",
                        },
                        "categoryIndex": parseInt(body?.now?.level, 10),
                        "index": parseInt(body?.now?.aqi, 10),
                        "pollutants": this.#CreatePollutants(body?.now),
                        "previousDayComparison": "UNKNOWN",
                        "primaryPollutant": this.#Config.Pollutants[body?.now?.primary] || "NOT_AVAILABLE",
                        "scale": "HJ6332012"
                    };
                    if (body?.refer?.sources?.[0]) airQuality.metadata.providerName += `\n数据源: ${body?.refer?.sources?.[0]}`;
                    break;
                case "204":
                case "400":
                case "401":
                case "402":
                case "403":
                case "404":
                case "429":
                case "500":
                case undefined:
                    throw JSON.stringify({ "status": body?.status, "reason": body?.error });
            };
        } catch (error) {
            logError(error);
        } finally {
            //log(`🚧 AirNow airQuality: ${JSON.stringify(airQuality, null, 2)}`, "");
            log(`✅ AirNow`, "");
            return airQuality;
        };
    };

    async Minutely(token = this.token) {
        log(`☑️ Minutely, host: ${this.host}`, "");
        const request = {
            "url": `https://${this.host}/v7/minutely/5m?location=${this.longitude},${this.latitude}&key=${token}`,
            "header": this.header,
        };
        let forecastNextHour;
        try {
            const body = await fetch(request).then(response => JSON.parse(response?.body ?? "{}"));
            const timeStamp = Math.round(Date.now() / 1000);
            switch (body?.code) {
                case "200":
                    let minuteStemp = new Date(body?.updateTime).setSeconds(0, 0);
                    minuteStemp = minuteStemp.valueOf() / 1000;
                    forecastNextHour = {
                        "metadata": {
                            "attributionUrl": body?.fxLink,
                            "expireTime": timeStamp + 60 * 60,
                            "language": `${this.language}-${this.country}`, // body?.lang,
                            "latitude": this.latitude,
                            "longitude": this.longitude,
                            "providerLogo": providerNameToLogo("和风天气", this.version),
                            "providerName": "和风天气",
                            "readTime": timeStamp,
                            "reportedTime": minuteStemp,
                            "temporarilyUnavailable": false,
                            "sourceType": "MODELED",
                        },
                        "condition": [],
                        "forecastEnd": 0,
                        "forecastStart": minuteStemp,
                        "minutes": body?.minutely?.map((minutely, index) => {
                            const minute = {
                                "perceivedPrecipitationIntensity": 0,
                                "precipitationChance": 0,
                                "precipitationIntensity": parseFloat(minutely.precip),
                                "startTime": new Date(minutely.fxTime) / 1000,
                            };
                            let minutes = [{ ...minute }, { ...minute }, { ...minute }, { ...minute }, { ...minute }];
                            minutes = minutes.map((minute, index) => {
                                minute.startTime = minute.startTime + index * 60;
                                return minute;
                            });
                            return minutes;
                        }).flat(Infinity),
                        "summary": []
                    };
                    forecastNextHour.minutes.length = Math.min(85, forecastNextHour.minutes.length);
                    forecastNextHour.forecastEnd = minuteStemp + 60 * forecastNextHour.minutes.length;
                    forecastNextHour.minutes = ForecastNextHour.Minute(forecastNextHour.minutes, body?.summary, "mmph");
                    forecastNextHour.summary = ForecastNextHour.Summary(forecastNextHour.minutes);
                    forecastNextHour.condition = ForecastNextHour.Condition(forecastNextHour.minutes);
                    break;
                case "204":
                case "400":
                case "401":
                case "402":
                case "403":
                case "404":
                case "429":
                case "500":
                case undefined:
                    throw JSON.stringify({ "status": body?.code, "reason": body?.error });
            };
        } catch (error) {
            logError(error);
        } finally {
            //log(`🚧 forecastNextHour: ${JSON.stringify(forecastNextHour, null, 2)}`, "");
            log(`✅ Minutely`, "");
            return forecastNextHour;
        };
    };

    #CreatePollutants(pollutantsObj = {}) {
        log(`☑️ CreatePollutants`, "");
        let pollutants = [];
        for (const [key, value] of Object.entries(pollutantsObj)) {
            switch (key) {
                case "co":
                case "no":
                case "no2":
                case "so2":
                case "o3":
                case "nox":
                case "pm25":
                case "pm2p5":
                case "pm10":
                    pollutants.push({
                        "amount": value ?? -1,
                        "pollutantType": this.#Config.Pollutants[key],
                        "units": "MICROGRAMS_PER_CUBIC_METER",
                    });
                    break;
            };
        };
        //log(`🚧 CreatePollutants, pollutants: ${JSON.stringify(pollutants, null, 2)}`, "");
        log(`✅ CreatePollutants`, "");
        return pollutants;
    };
};
