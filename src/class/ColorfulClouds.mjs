import ENV from "../ENV/ENV.mjs";
import providerNameToLogo from "../function/providerNameToLogo.mjs";

export default class ColorfulClouds {
    constructor($ = new ENV("ColorfulClouds"), options = { "url": new URL() }) {
        this.Name = "ColorfulClouds";
        this.Version = "1.0.5";
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
            "url": `https://api.caiyunapp.com/${version}/${token}/${this.longitude},${this.latitude}/minutely`,
            "header": header,
        };
        let forecastNextHour;
        try {
            const body = await this.$.fetch(request).then(response => JSON.parse(response?.body ?? "{}"));
            console.log(`🚧 body: ${JSON.stringify(body, null, 2)}`);
            switch (body?.status) {
                case "ok":
                    switch (body?.result?.minutely?.status) {
                        case "ok":
                            forecastNextHour = {
                                "metadata": {
                                    "attributionUrl": "https://www.caiyunapp.com/h5",
                                    "expireTime": new Date().getTime() / 1000 + 60 * 60,
                                    "language": body?.lang,
                                    "latitude": body?.location?.[0],
                                    "longitude": body?.location?.[1],
                                    "providerLogo": providerNameToLogo("彩云天气", this.version),
                                    "providerName": `彩云天气`,
                                    "readTime": new Date().getTime() / 1000,
                                    "reportedTime": body?.server_time,
                                    "temporarilyUnavailable": false,
                                    "sourceType": "MODELED",
                                },
                                "condition": [],
                                "forecastEnd": 0,
                                "forecastStart": new Date().setMinutes(0, 0, 0).getTime() / 1000,
                                "minutes": body?.result?.minutely?.precipitation_2h?.map((precipitationIntensity, index) => {
                                    const minute = {
                                        "perceivedPrecipitationIntensity": precipitationIntensity,
                                        "precipitationChance": 0,
                                        "precipitationIntensity": precipitationIntensity,
                                        "startTime": new Date().setMinutes(index, 0, 0).getTime() / 1000,
                                    };
                                    if (index < 30) minute.precipitationChance = data?.result?.minutely?.probability?.[0]
                                    else if (index < 60) minute.precipitationChance = data?.result?.minutely?.probability?.[1]
                                    else if (index < 90) minute.precipitationChance = data?.result?.minutely?.probability?.[2]
                                    else minute.precipitationChance = data?.result?.minutely?.probability?.[3];
                                    return minute;
                                }),
                                "summary": []
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
    }
};
