import ENV from "../ENV/ENV.mjs";
import AirQuality from "../class/AirQuality.mjs";
import ForecastNextHour from "./ForecastNextHour.mjs";
import parseWeatherKitURL from "../function/parseWeatherKitURL.mjs"
import providerNameToLogo from "../function/providerNameToLogo.mjs";

export default class ColorfulClouds {
    constructor($ = new ENV("ColorfulClouds"), options) {
        this.Name = "ColorfulClouds";
        this.Version = "2.1.3";
        $.log(`\n🟧 ${this.Name} v${this.Version}\n`, "");
        this.url = options.url || new URL($request.url);
        this.token = options.token || "Y2FpeXVuX25vdGlmeQ==";
        this.header = options.header || { "Content-Type": "application/json" };
        this.convertUnits = options.convertUnits || false;
        const Parameters = parseWeatherKitURL(this.url);
        Object.assign(this, Parameters);
        this.$ = $;
    };

    async AQI(token = this.token, version = "v2.6", convertUnits = this.convertUnits) {
        this.$.log(`☑️ AQI, token: ${token}, version: ${version}`, "");
        const request = {
            "url": `https://api.caiyunapp.com/${version}/${token}/${this.longitude},${this.latitude}/realtime`,
            "header": this.header,
        };
        let airQuality;
        try {
            const body = await this.$.fetch(request).then(response => JSON.parse(response?.body ?? "{}"));
            const timeStamp = Math.round(Date.now() / 1000);
            switch (body?.status) {
                case "ok":
                    switch (body?.result?.realtime?.status) {
                        case "ok":
                            const pollutant = AirQuality.CreatePollutants(body?.result?.realtime?.air_quality);
                            airQuality = AirQuality.ConvertScale(pollutant, "EPA_NowCast");
                            if (!convertUnits) airQuality.pollutants = pollutant;
                            airQuality.metadata = {
                                "attributionUrl": "https://www.caiyunapp.com/h5",
                                "expireTime": timeStamp + 60 * 60,
                                "language": `${this.language}-${this.country}`,
                                "latitude": body?.location?.[0],
                                "longitude": body?.location?.[1],
                                "providerLogo": providerNameToLogo("彩云天气", this.version),
                                "providerName": "彩云天气",
                                "readTime": timeStamp,
                                "reportedTime": body?.server_time,
                                "temporarilyUnavailable": false,
                                "sourceType": "STATION",
                            };
                            break;
                        case "error":
                        case undefined:
                            throw JSON.stringify({ "status": body?.result?.realtime?.status, "reason": body?.result?.realtime });
                    };
                    break;
                case "error":
                case "failed":
                case undefined:
                    throw JSON.stringify({ "status": body?.status, "reason": body?.error });
            };
        } catch (error) {
            this.logErr(error);
        } finally {
            //this.$.log(`🚧 airQuality: ${JSON.stringify(airQuality, null, 2)}`, "");
            this.$.log(`✅ AQI`, "");
            return airQuality;
        };
    };

    async Minutely(token = this.token, version = "v2.6") {
        this.$.log(`☑️ Minutely, token: ${token}, version: ${version}`, "");
        const request = {
            "url": `https://api.caiyunapp.com/${version}/${token}/${this.longitude},${this.latitude}/minutely?unit=metric:v2`,
            "header": this.header,
        };
        let forecastNextHour;
        try {
            const body = await this.$.fetch(request).then(response => JSON.parse(response?.body ?? "{}"));
            const timeStamp = Math.round(Date.now() / 1000);
            switch (body?.status) {
                case "ok":
                    switch (body?.result?.minutely?.status) {
                        case "ok":
                            body.result.minutely.probability = body.result.minutely.probability.map(probability => Math.round(probability * 100));
                            let minuteStemp = new Date(body?.server_time * 1000).setSeconds(0, 0);
                            minuteStemp = minuteStemp.valueOf() / 1000 - 60;
                            forecastNextHour = {
                                "metadata": {
                                    "attributionUrl": "https://www.caiyunapp.com/h5",
                                    "expireTime": timeStamp + 60 * 60,
                                    "language": `${this.language}-${this.country}`, // body?.lang,
                                    "latitude": body?.location?.[0],
                                    "longitude": body?.location?.[1],
                                    "providerLogo": providerNameToLogo("彩云天气", this.version),
                                    "providerName": "彩云天气",
                                    "readTime": timeStamp,
                                    "reportedTime": body?.server_time,
                                    "temporarilyUnavailable": false,
                                    "sourceType": "MODELED",
                                },
                                "condition": [],
                                "forecastEnd": 0,
                                "forecastStart": minuteStemp,
                                "minutes": body?.result?.minutely?.precipitation_2h?.map((precipitationIntensity, index) => {
                                    const minute = {
                                        "perceivedPrecipitationIntensity": 0,
                                        "precipitationChance": 0,
                                        "precipitationIntensity": precipitationIntensity,
                                        "startTime": minuteStemp + 60 * index,
                                    };
                                    if (index < 30) minute.precipitationChance = body?.result?.minutely?.probability?.[0]
                                    else if (index < 60) minute.precipitationChance = body?.result?.minutely?.probability?.[1]
                                    else if (index < 90) minute.precipitationChance = body?.result?.minutely?.probability?.[2]
                                    else minute.precipitationChance = body?.result?.minutely?.probability?.[3];
                                    return minute;
                                }),
                                "summary": []
                            };
                            forecastNextHour.minutes.length = Math.min(85, forecastNextHour.minutes.length);
                            forecastNextHour.forecastEnd = minuteStemp + 60 * forecastNextHour.minutes.length;
                            forecastNextHour.minutes = ForecastNextHour.Minute(forecastNextHour.minutes, body?.result?.minutely?.description, "mmph");
                            forecastNextHour.summary = ForecastNextHour.Summary(forecastNextHour.minutes);
                            forecastNextHour.condition = ForecastNextHour.Condition(forecastNextHour.minutes);
                            break;
                        case "error":
                        case "failed":
                        case undefined:
                            throw JSON.stringify({ "status": body?.result?.minutely?.status, "reason": body?.result?.minutely });
                    };
                    break;
                case "error":
                case "failed":
                case undefined:
                    throw JSON.stringify({ "status": body?.status, "reason": body?.error });
            };
        } catch (error) {
            this.$.logErr(error);
        } finally {
            //this.$.log(`🚧 forecastNextHour: ${JSON.stringify(forecastNextHour, null, 2)}`, "");
            this.$.log(`✅ Minutely`, "");
            return forecastNextHour;
        };
    };
};
