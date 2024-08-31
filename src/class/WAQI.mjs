import ENV from "../ENV/ENV.mjs";
import parseWeatherKitURL from "../function/parseWeatherKitURL.mjs"
import providerNameToLogo from "../function/providerNameToLogo.mjs";

export default class WAQI {
    constructor($ = new ENV("WAQI"), options = { "url": new URL($request.url) }) {
        this.Name = "WAQI";
        this.Version = "1.2.0";
        $.log(`\n🟧 ${this.Name} v${this.Version}\n`, "");
        const Parameters = parseWeatherKitURL(options.url);
        Object.assign(this, Parameters, options);
        this.$ = $;
    };

    #Configs = {
        "Pollutants": {
            "co": "CO",
            "no": "NO",
            "no2": "NO2",
            "so2": "SO2",
            "o3": "OZONE",
            "nox": "NOX",
            "pm25": "PM2_5",
            "pm10": "PM10",
            "other": "NOT_AVAILABLE"
        },
    };

    async Nearest(mapqVersion = "mapq", header = { "Content-Type": "application/json" }) {
        this.$.log(`☑️ Nearest, mapqVersion: ${mapqVersion}`, "");
        const request = {
            "url": `https://api.waqi.info/${mapqVersion}/nearest?n=1&geo=1/${this.latitude}/${this.longitude}`,
            //"url": `https://mapq.waqi.info/${mapqVersion}/nearest/station/${stationId}?n=1`,
            "header": header,
        };
        let airQuality;
        try {
            const body = await this.$.fetch(request).then(response => JSON.parse(response?.body ?? "{}"));
            const timeStamp = Math.round(Date.now() / 1000);
            switch (mapqVersion) {
                case "mapq":
                    switch (body?.status) {
                        default:
                        case undefined:
                            airQuality = {
                                "metadata": {
                                    "attributionUrl": request.url,
                                    "expireTime": timeStamp + 60 * 60,
                                    "language": `${this.language}-${this.country}`,
                                    "latitude": body?.d?.[0]?.geo?.[0],
                                    "longitude": body?.d?.[0]?.geo?.[1],
                                    "providerLogo": providerNameToLogo("WAQI", this.version),
                                    "providerName": `World Air Quality Index Project\n监测站：${body?.d?.[0]?.nna}`,
                                    "readTime": timeStamp,
                                    "reportedTime": body?.d?.[0]?.t,
                                    "temporarilyUnavailable": false,
                                    "sourceType": "STATION",
                                    "stationId": parseInt(body?.d?.[0]?.x, 10),
                                    "stationKey": body?.d?.[0]?.k,
                                },
                                "categoryIndex": 1,
                                "index": parseInt(body?.d?.[0]?.v, 10),
                                "isSignificant": true,
                                //"previousDayComparison": "UNKNOWN",
                                "primaryPollutant": this.#Configs.Pollutants[body?.d?.[0]?.pol] || "NOT_AVAILABLE",
                                "scale": "EPA_NowCast"
                            };
                            break;
                        case "error":
                            throw { "status": body?.status, "reason": body?.message };
                    };
                    break;
                case "mapq2":
                    switch (body?.status) {
                        case "ok":
                            airQuality = {
                                "metadata": {
                                    "attributionUrl": request.url,
                                    "language": `${this.language}-${this.country}`,
                                    "latitude": body?.data?.stations?.[0]?.geo?.[0],
                                    "longitude": body?.data?.stations?.[0]?.geo?.[1],
                                    "expireTime": timeStamp + 60 * 60,
                                    "providerLogo": providerNameToLogo("WAQI", this.version),
                                    "providerName": `World Air Quality Index Project\n监测站：${body?.data?.stations?.[0]?.name}`,
                                    "readTime": timeStamp,
                                    "reportedTime": Math.round(new Date(body?.data?.stations?.[0]?.utime).getTime() / 1000),
                                    "temporarilyUnavailable": false,
                                    "sourceType": "STATION",
                                    "stationId": parseInt(body?.data?.stations?.[0]?.idx, 10),
                                },
                                "categoryIndex": 1,
                                "index": parseInt(body?.data?.stations?.[0]?.aqi, 10),
                                "isSignificant": true,
                                //"previousDayComparison": "UNKNOWN",
                                "primaryPollutant": "NOT_AVAILABLE",
                                "scale": "EPA_NowCast"
                            };
                            break;
                        case "error":
                        case undefined:
                            throw { "status": body?.status, "reason": body?.reason };
                    };
                    break;
                default:
                    break;
            };
        } catch (error) {
            this.logErr(error);
        } finally {
            this.$.log(`🚧 airQuality: ${JSON.stringify(airQuality, null, 2)}`, "");
            this.$.log(`✅ Nearest`, "");
            return airQuality;
        };
    };

    async Token(stationId = new Number, header = { "Content-Type": "application/json" }) {
        this.$.log(`☑️ Token, stationId: ${stationId}`, "");
        const request = {
            "url": `https://api.waqi.info/api/token/${stationId}`,
            "header": header,
        };
        let token;
        try {
            const body = await this.$.fetch(request).then(response => JSON.parse(response?.body ?? "{}"));
            const timeStamp = Math.round(Date.now() / 1000);
            switch (body?.status) {
                case "error":
                    throw { "status": body?.status, "reason": body?.data };
                default:
                    switch (body?.rxs?.status) {
                        case "ok":
                            switch (body?.rxs?.obs?.[0]?.status) {
                                case "ok":
                                    token = body?.rxs?.obs?.[0]?.msg?.token;
                                    //uid = body?.rxs?.obs?.[0]?.uid;
                                    break;
                                case "error":
                                    throw { "status": body?.rxs?.obs?.[0]?.status, "reason": body?.rxs?.obs?.[0]?.msg };
                            };
                            break;
                        case "error":
                        case undefined:
                            throw { "status": body?.rxs?.status, "reason": body?.rxs };
                    };
                    break;
            };
        } catch (error) {
            this.logErr(error);
        } finally {
            this.$.log(`🚧 token: ${token}`, "");
            this.$.log(`✅ Token`, "");
            return token;
        };
    };

    async AQI(stationId = new Number, token = "na", header = { "Content-Type": "application/json" }) {
        this.$.log(`☑️ AQI, stationId: ${stationId}, token: ${token}`, "");
        const request = {
            "url": `https://api.waqi.info/api/feed/@${stationId}/aqi.json`,
            "header": header,
            "body": `token=${token}&id=${stationId}`,
        };
        let airQuality;
        try {
            const body = await this.$.fetch(request).then(response => JSON.parse(response?.body ?? "{}"));
            const timeStamp = Math.round(Date.now() / 1000);
            switch (body?.status) {
                case "error":
                    throw { "status": body?.status, "reason": body?.data };
                default:
                case undefined:
                    switch (body?.rxs?.status) {
                        case "ok":
                            switch (body?.rxs?.obs?.[0]?.status) {
                                case "ok":
                                    airQuality = {
                                        "metadata": {
                                            "attributionUrl": body?.rxs?.obs?.[0]?.msg?.city?.url,
                                            "expireTime": timeStamp + 60 * 60,
                                            "language": `${this.language}-${this.country}`,
                                            "latitude": body?.rxs?.obs?.[0]?.msg?.city?.geo?.[0],
                                            "longitude": body?.rxs?.obs?.[0]?.msg?.city?.geo?.[1],
                                            "providerLogo": providerNameToLogo("WAQI", this.version),
                                            "providerName": `World Air Quality Index Project\n监测站：${body?.rxs?.obs?.[0]?.msg?.city?.name}`,
                                            "readTime": timeStamp,
                                            "reportedTime": body?.rxs?.obs?.[0]?.msg?.time?.v,
                                            "temporarilyUnavailable": false,
                                            "sourceType": "STATION",
                                            "stationId": stationId,
                                        },
                                        "categoryIndex": 1,
                                        "index": parseInt(body?.rxs?.obs?.[0]?.msg?.aqi, 10),
                                        "isSignificant": true,
                                        //"previousDayComparison": "UNKNOWN",
                                        "primaryPollutant": this.#Configs.Pollutants[body?.rxs?.obs?.[0]?.msg?.dominentpol] || "NOT_AVAILABLE",
                                        "scale": "EPA_NowCast"
                                    };
                                    break;
                                case "error":
                                case undefined:
                                    throw { "status": body?.rxs?.[0]?.status, "reason": body?.rxs?.obs?.[0]?.msg };
                            };
                            break;
                        case "error":
                        case undefined:
                            throw { "status": body?.rxs?.status, "reason": body?.rxs };
                    };
                    break;
            };
        } catch (error) {
            this.logErr(error);
        } finally {
            this.$.log(`🚧 airQuality: ${JSON.stringify(airQuality, null, 2)}`, "");
            this.$.log(`✅ AQI`, "");
            return airQuality;
        };
    }

    async AQI2(token = "na", stationId, header = { "Content-Type": "application/json" }) {
        this.$.log(`☑️ AQI2, token: ${token}, stationId: ${stationId}`, "");
        const request = {
            "url": `https://api2.waqi.info/feed/geo:${this.latitude};${this.longitude}/?token=${token}`,
            "header": header,
        };
        if (stationId) request.url = `https://api2.waqi.info/feed/@${stationId}/?token=${token}`;
        let airQuality;
        try {
            const body = await this.$.fetch(request).then(response => JSON.parse(response?.body ?? "{}"));
            const timeStamp = Math.round(Date.now() / 1000);
            switch (body?.status) {
                case "ok":
                    airQuality = {
                        "metadata": {
                            "attributionUrl": body?.data?.city?.url,
                            "expireTime": timeStamp + 60 * 60,
                            "language": `${this.language}-${this.country}`,
                            "latitude": body?.data?.city?.geo?.[0],
                            "longitude": body?.data?.city?.geo?.[1],
                            "providerLogo": providerNameToLogo("WAQI", this.version),
                            "providerName": `World Air Quality Index Project\n监测站：${body?.data?.city?.name}`,
                            "readTime": timeStamp,
                            "reportedTime": body?.data?.time?.v,
                            "temporarilyUnavailable": false,
                            "sourceType": "STATION",
                            "stationId": stationId || parseInt(body?.data?.idx, 10),
                        },
                        "categoryIndex": 1,
                        "index": parseInt(body?.data?.aqi, 10),
                        "isSignificant": true,
                        //"previousDayComparison": "UNKNOWN",
                        "primaryPollutant": this.#Configs.Pollutants[body?.data?.dominentpol] || "NOT_AVAILABLE",
                        "scale": "EPA_NowCast"
                    };
                    break;
                case "error":
                case undefined:
                    throw { "status": body?.status, "reason": body?.data };
            };
        } catch (error) {
            this.logErr(error);
        } finally {
            this.$.log(`🚧 airQuality: ${JSON.stringify(airQuality, null, 2)}`, "");
            this.$.log(`✅ AQI2`, "");
            return airQuality;
        };
    }
};
