import ENV from "../ENV/ENV.mjs";
import providerNameToLogo from "../function/providerNameToLogo.mjs";

export default class ColorfulClouds {
    constructor($ = new ENV("ColorfulClouds"), options = { "url": new URL() }) {
        this.Name = "ColorfulClouds";
        this.Version = "1.1.6";
        console.log(`\n🟧 ${this.Name} v${this.Version}\n`);
        this.url = $request.url;
        const RegExp = /^\/api\/(?<version>v1|v2|v3)\/(availability|weather)\/(?<language>[\w-_]+)\/(?<latitude>-?\d+\.\d+)\/(?<longitude>-?\d+\.\d+).*(?<countryCode>country=[A-Z]{2})?.*/i;
        const Parameters = (options?.url?.pathname ?? options?.url).match(RegExp)?.groups;
        this.version = options?.version ?? Parameters?.version;
        this.language = options?.language ?? Parameters?.language;
        this.latitude = options?.latitude ?? Parameters?.latitude;
        this.longitude = options?.longitude ?? Parameters?.longitude;
        this.country = options?.country ?? Parameters?.countryCode ?? options?.url?.searchParams?.get("country");
        //Object.assign(this, options);
        console.log(`\n🟧 version: ${this.version} language: ${this.language}\n🟧 latitude: ${this.latitude} longitude: ${this.longitude}\n🟧 country: ${this.country}\n`);
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
        "Status": {
            "clear": "CLEAR",
            "sleet": "SLEET",
            "drizzle": "RAIN",
            "rain": "RAIN",
            "heavy_rain": "RAIN",
            "flurries": "SNOW",
            "snow": "SNOW",
            "heavy_snow": "SNOW"
        },
        "Precipitation": {
            "Level": {
                "INVALID": -1,
                "NO": 0,
                "LIGHT": 1,
                "MODERATE": 2,
                "HEAVY": 3,
                "STORM": 4
            },
            "Range": {
                "RADAR": {
                    "NO": [
                        0,
                        0.031
                    ],
                    "LIGHT": [
                        0.031,
                        0.25
                    ],
                    "MODERATE": [
                        0.25,
                        0.35
                    ],
                    "HEAVY": [
                        0.35,
                        0.48
                    ],
                    "STORM": [
                        0.48,
                        1
                    ]
                },
                "MMPERHR": {
                    "NO": [
                        0,
                        0.08
                    ],
                    "LIGHT": [
                        0.08,
                        3.44
                    ],
                    "MODERATE": [
                        3.44,
                        11.33
                    ],
                    "HEAVY": [
                        11.33,
                        51.30
                    ],
                    "STORM": [
                        51.30,
                        100
                    ]
                }
            }
        }
    };

    async Minutely(token = "Y2FpeXVuX25vdGlmeQ==", version = "v2.6", header = { "Content-Type": "application/json" }) {
        console.log(`☑️ Minutely, token: ${token}, version: ${version}`);
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
                            let minuteStemp = new Date(timeStamp * 1000).setMinutes(0, 0, 0);
                            minuteStemp = minuteStemp.valueOf() / 1000;
                            let condition = "CLEAR";
                            if (body?.result?.minutely?.description.includes("雨")) condition = "RAIN";
                            else if (body?.result?.minutely?.description.includes("雪")) condition = "SNOW"
                            else if (body?.result?.minutely?.description.includes("雨夹雪")) condition = "SLEET"
                            else if (body?.result?.minutely?.description.includes("冰雹")) condition = "HAIL"
                            forecastNextHour = {
                                "metadata": {
                                    "attributionUrl": "https://www.caiyunapp.com/h5",
                                    "expireTime": timeStamp + 60 * 60,
                                    "language": body?.lang,
                                    "latitude": body?.location?.[0],
                                    "longitude": body?.location?.[1],
                                    "providerLogo": providerNameToLogo("彩云天气", this.version),
                                    "providerName": "彩云天气",
                                    "readTime": minuteStemp,
                                    "reportedTime": body?.server_time,
                                    "temporarilyUnavailable": false,
                                    "sourceType": "MODELED",
                                },
                                "condition": [],
                                "forecastEnd": 0,
                                "forecastStart": timeStamp,
                                "minutes": body?.result?.minutely?.precipitation_2h?.map((precipitationIntensity, index) => {
                                    const minute = {
                                        "perceivedPrecipitationIntensity": precipitationIntensity,
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
                            const Summary = {
                                "condition": "CLEAR",
                                "precipitationChance": 0,
                                "startTime": 0,
                                "endTime": 0,
                                "precipitationIntensity": 0
                            };
                            for (let i = 0; i < forecastNextHour?.minutes?.length; i++) {
                                const minute = forecastNextHour?.minutes?.[i];
                                const previousMinute = forecastNextHour?.minutes?.[i - 1];
                                let maxPrecipitationIntensity = Math.max(minute?.precipitationIntensity ?? 0, previousMinute?.precipitationIntensity ?? 0);
                                let maxPrecipitationChance = Math.max(minute?.precipitationChance ?? 0, previousMinute?.precipitationChance ?? 0);
                                switch (i) {
                                    case 0:
                                        Summary.startTime = minute.startTime;
                                        if (minute?.precipitationIntensity > 0) {
                                            Summary.condition = condition;
                                            Summary.precipitationChance = maxPrecipitationChance;
                                            Summary.precipitationIntensity = maxPrecipitationIntensity;
                                        };
                                        break;
                                    default:
                                        if (Boolean(minute?.perceivedPrecipitationIntensity) !== Boolean(previousMinute?.perceivedPrecipitationIntensity)) {
                                            Summary.endTime = minute.startTime;
                                            switch (Summary.condition) {
                                                case "CLEAR":
                                                    break;
                                                default:
                                                    Summary.precipitationChance = maxPrecipitationChance;
                                                    Summary.precipitationIntensity = maxPrecipitationIntensity;
                                                    break;
                                            };
                                            forecastNextHour.summary.push({ ...Summary });
                                            Summary.startTime = minute.startTime;
                                            switch (Summary.condition) {
                                                case "CLEAR":
                                                    Summary.condition = condition;
                                                    Summary.precipitationChance = maxPrecipitationChance;
                                                    Summary.precipitationIntensity = maxPrecipitationIntensity;
                                                    break;
                                                default:
                                                    Summary.condition = "CLEAR"
                                                    Summary.precipitationChance = 0;
                                                    Summary.precipitationIntensity = 0;
                                                    break;
                                            };
                                            maxPrecipitationChance = 0;
                                            maxPrecipitationIntensity = 0;
                                        };
                                        break;
                                    case forecastNextHour?.minutes?.length - 1:
                                        forecastNextHour.forecastEnd = minute.startTime + 60;
                                        delete Summary.endTime;
                                        switch (Summary.condition) {
                                            case "CLEAR":
                                                break;
                                            default:
                                                Summary.precipitationChance = maxPrecipitationChance;
                                                Summary.precipitationIntensity = maxPrecipitationIntensity;
                                                break;
                                        };
                                        forecastNextHour.summary.push({ ...Summary });
                                        break;
                                };
                            };
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
            console.log(`🚧 forecastNextHour: ${JSON.stringify(forecastNextHour, null, 2)}`);
            console.log(`✅ Minutely`);
            return forecastNextHour;
        };
    };
};
