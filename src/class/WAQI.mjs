import ENV from "../ENV/ENV.mjs";
import providerNameToLogo from "../function/providerNameToLogo.mjs";

export default class WAQI {
    constructor($ = new ENV("WAQI"), options = { "url": new URL() }) {
        this.Name = "WAQI";
        this.Version = "1.0.7";
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

    async Nearest(mapqVersion = "mapq2", header = { "Content-Type": "application/json" }) {
        console.log(`☑️ Nearest, mapqVersion: ${mapqVersion}`);
        const request = {
            "url": `https://api.waqi.info/${mapqVersion}/nearest?n=1&geo=1/${this.latitude}/${this.longitude}`,
            "header": header,
        };
        let airQuality;
        try {
            const body = await this.$.fetch(request).then(response => JSON.parse(response?.body ?? "{}"));
            switch (mapqVersion) {
                case "mapq2":
                    if (body?.status === "ok") {
                        airQuality = {
                            "metadata": {
                                "attributionUrl": request.url,
                                "latitude": body?.data?.stations?.[0]?.geo?.[0],
                                "longitude": body?.data?.stations?.[0]?.geo?.[1],
                                "providerLogo": providerNameToLogo("WAQI", this.version),
                                "providerName": `World Air Quality Index Project - ${body?.data?.stations?.[0]?.name}`,
                                "temporarilyUnavailable": false,
                                "sourceType": "STATION",
                                "stationId": parseInt(body?.data?.stations?.[0]?.idx, 10),
                            },
                            "index": parseInt(body?.data?.stations?.[0]?.aqi, 10),
                            "primaryPollutant": null,
                            "scale": "EPA_NowCast.2302"
                        };
                    } else {
                        airQuality = {
                            "metadata": {
                                "attributionUrl": request.url,
                                "providerLogo": providerNameToLogo("WAQI", this.version),
                                "providerName": "World Air Quality Index Project",
                                "temporarilyUnavailable": true,
                            }
                        };
                        throw { "status": "error", "reason": error.reason };
                    };
                    break;
                case "mapq":
                    if (body?.d) {
                        airQuality = {
                            "metadata": {
                                "attributionUrl": request.url,
                                "latitude": body?.d?.[0]?.geo?.[0],
                                "longitude": body?.d?.[0]?.geo?.[1],
                                "providerLogo": providerNameToLogo("WAQI", this.version),
                                "providerName": `World Air Quality Index Project - ${body?.d?.[0]?.nna}`,
                                "temporarilyUnavailable": false,
                                "sourceType": "STATION",
                                "stationId": parseInt(body?.d?.[0]?.x, 10),
                            },
                            "index": parseInt(body?.d?.[0]?.v, 10),
                            "primaryPollutant": this.#Configs.Pollutants[body?.d?.[0]?.pol] || "NOT_AVAILABLE",
                            "scale": "EPA_NowCast.2302"
                        };
                    } else {
                        airQuality = {
                            "metadata": {
                                "attributionUrl": request.url,
                                "providerLogo": providerNameToLogo("WAQI", this.version),
                                "providerName": "World Air Quality Index Project",
                                "temporarilyUnavailable": true,
                            }
                        };
                        throw { "status": "error", "reason": error.message };
                    };
                    break;
                default:
                    break;
            };
        } catch (error) {
            this.logErr(error);
        } finally {
            console.log(`airQuality: ${JSON.stringify(airQuality, null, 2)}`);
            console.log(`✅ Nearest`);
            return airQuality;
        };
    };
};
