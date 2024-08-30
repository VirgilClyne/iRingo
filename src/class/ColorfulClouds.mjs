import ENV from "../ENV/ENV.mjs";
import ForecastNextHour from "./ForecastNextHour.mjs";
import providerNameToLogo from "../function/providerNameToLogo.mjs";

export default class ColorfulClouds {
    constructor($ = new ENV("ColorfulClouds"), options = { "url": new URL() }) {
        this.Name = "ColorfulClouds";
        this.Version = "1.6.10";
        $.log(`\n🟧 ${this.Name} v${this.Version}\n`, "");
        this.url = $request.url;
        const RegExp = /^\/api\/(?<version>v1|v2|v3)\/(availability|weather)\/(?<language>[\w-_]+)\/(?<latitude>-?\d+\.\d+)\/(?<longitude>-?\d+\.\d+).*(?<countryCode>country=[A-Z]{2})?.*/i;
        const Parameters = (options?.url?.pathname ?? options?.url).match(RegExp)?.groups;
        this.version = options?.version ?? Parameters?.version;
        this.language = options?.language ?? Parameters?.language;
        this.latitude = options?.latitude ?? Parameters?.latitude;
        this.longitude = options?.longitude ?? Parameters?.longitude;
        this.country = options?.country ?? Parameters?.countryCode ?? options?.url?.searchParams?.get("country");
        //Object.assign(this, options);
        $.log(`\n🟧 version: ${this.version} language: ${this.language}\n🟧 latitude: ${this.latitude} longitude: ${this.longitude}\n🟧 country: ${this.country}\n`, "");
        this.$ = $;
    };

    async Minutely(token = "Y2FpeXVuX25vdGlmeQ==", version = "v2.6", header = { "Content-Type": "application/json" }) {
        this.$.log(`☑️ Minutely, token: ${token}, version: ${version}`, "");
        const request = {
            "url": `https://api.caiyunapp.com/${version}/${token}/${this.longitude},${this.latitude}/minutely?unit=metric:v2`,
            "header": header,
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
                            minuteStemp = minuteStemp.valueOf() / 1000;
                            forecastNextHour = {
                                "metadata": {
                                    "attributionUrl": "https://www.caiyunapp.com/h5",
                                    "expireTime": timeStamp + 60 * 60,
                                    //"language": body?.lang,
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
                            forecastNextHour.minutes.length = 90;
                            forecastNextHour.forecastEnd = minuteStemp + 60 * forecastNextHour.minutes.length;
                            forecastNextHour.minutes = ForecastNextHour.Minute(forecastNextHour.minutes, body?.result?.minutely?.description);
                            forecastNextHour.summary = ForecastNextHour.Summary(forecastNextHour.minutes);
                            forecastNextHour.condition = ForecastNextHour.Condition(forecastNextHour.minutes);
                            break;
                        case "error":
                        case "failed":
                        case undefined:
                            throw { "status": body?.result?.minutely?.status, "reason": body?.result?.minutely };
                    };
                    break;
                case "error":
                case "failed":
                case undefined:
                    throw { "status": body?.status, "reason": body?.error };
            };
        } catch (error) {
            this.logErr(error);
        } finally {
            //this.$.log(`🚧 forecastNextHour: ${JSON.stringify(forecastNextHour, null, 2)}`, "");
            this.$.log(`✅ Minutely`, "");
            return forecastNextHour;
        };
    };
};
