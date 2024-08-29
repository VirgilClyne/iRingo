import ENV from "../ENV/ENV.mjs";
import providerNameToLogo from "../function/providerNameToLogo.mjs";

export default class ColorfulClouds {
    constructor($ = new ENV("ColorfulClouds"), options = { "url": new URL() }) {
        this.Name = "ColorfulClouds";
        this.Version = "1.2.19";
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
        "WeatherCondition": {
            "晴朗": "CLEAR",
            "雨夹雪": "SLEET",
            "小雨": "DIZZLE",
            "下雨": "RAIN",
            "中雨": "RAIN",
            "大雨": "HEAVY_RAIN",
            "小雪": "FLURRIES",
            "下雪": "SNOW",
            "中雪": "SNOW",
            "大雪": "HEAVY_SNOW",
            "冰雹": "HAIL",
        },
        "PrecipitationType": {
            "晴朗": "CLEAR",
            "雨夹雪": "SLEET",
            "雨": "RAIN",
            "雪": "SNOW",
            "冰雹": "HAIL",
        }
    };

    #WeatherCondition(sentence) {
        console.log(`☑️ #WeatherCondition, sentence: ${sentence}`);
        let weatherCondition = "CLEAR";
        Object.keys(this.#Configs.WeatherCondition).forEach(key => {
            if (sentence.includes(key)) weatherCondition = this.#Configs.WeatherCondition[key];
        });
        console.log(`✅ #WeatherCondition: ${weatherCondition}`);
        return weatherCondition;
    };

    #PrecipitationType(sentence) {
        console.log(`☑️ #PrecipitationType, sentence: ${sentence}`);
        let precipitationType = "CLEAR";
        Object.keys(this.#Configs.PrecipitationType).forEach(key => {
            if (sentence.includes(key)) precipitationType = this.#Configs.PrecipitationType[key];
        });
        console.log(`✅ #PrecipitationType: ${precipitationType}`);
        return precipitationType;
    };
    #ConditionType(precipitationIntensity, precipitationType) {
        // refer: https://docs.caiyunapp.com/weather-api/v2/v2.6/tables/precip.html
        //console.log(`☑️ #ConditionType, precipitationIntensity: ${precipitationIntensity}, precipitationChance: ${precipitationChance}, precipitationType: ${precipitationType}`);
        let condition = "CLEAR";
        if (precipitationIntensity === 0) condition = "CLEAR"
        else if (precipitationIntensity > 0 && precipitationIntensity < 0.0606) {
            switch (precipitationType) {
                case "RAIN":
                    condition = "POSSIBLE_DRIZZLE";
                    break;
                case "SNOW":
                    condition = "POSSIBLE_FLURRIES";
                    break;
                default:
                    condition = `POSSIBLE_${precipitationType}`;
                    break;
            };
        } else if (precipitationIntensity >= 0.0606 && precipitationIntensity < 0.8989) {
            switch (precipitationType) {
                case "RAIN":
                    condition = "DIZZLE";
                    break;
                case "SNOW":
                    condition = "FLURRIES";
                    break;
                default:
                    condition = precipitationType;
                    break;
            };
        } else if (precipitationIntensity >= 0.8989 && precipitationIntensity < 2.87) {
            switch (precipitationType) {
                case "RAIN":
                    condition = "RAIN";
                    break;
                case "SNOW":
                    condition = "SNOW";
                    break;
                default:
                    condition = precipitationType;
                    break;
            };
        } else {
            switch (precipitationType) {
                case "RAIN":
                    condition = "HEAVY_RAIN";
                    break;
                case "SNOW":
                    condition = "HEAVY_SNOW";
                    break;
                default:
                    condition = precipitationType;
                    break;
            };
        };
        //console.log(`✅ #ConditionType: ${condition}`);
        return condition;
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
                            const PrecipitationType = this.#PrecipitationType(body?.result?.minutely?.description);
                            const WeatherCondition = this.#WeatherCondition(body?.result?.minutely?.description);
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
                                        "perceivedPrecipitationIntensity": precipitationIntensity,
                                        "precipitationChance": 0,
                                        "precipitationIntensity": precipitationIntensity,
                                        "startTime": minuteStemp + 60 * index,
                                    };
                                    if (index < 30) minute.precipitationChance = body?.result?.minutely?.probability?.[0]
                                    else if (index < 60) minute.precipitationChance = body?.result?.minutely?.probability?.[1]
                                    else if (index < 90) minute.precipitationChance = body?.result?.minutely?.probability?.[2]
                                    else minute.precipitationChance = body?.result?.minutely?.probability?.[3];
                                    if (minute.perceivedPrecipitationIntensity !== 0) minute.precipitationType = PrecipitationType;
                                    else minute.precipitationType = "CLEAR";
                                    minute.condition = this.#ConditionType(minute.perceivedPrecipitationIntensity, PrecipitationType);
                                    return minute;
                                }),
                                "summary": []
                            };
                            forecastNextHour.minutes.length = 90;
                            const Summary = {
                                "condition": "CLEAR",
                                "precipitationChance": 0,
                                "startTime": 0,
                                "endTime": 0,
                                "precipitationIntensity": 0
                            };
                            const Condition = {
                                "beginCondition": "CLEAR",
                                "endCondition": "CLEAR",
                                "endTime": 0,
                                "forecastToken": "CLEAR",
                                "parameters": [],
                                "startTime": minuteStemp
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
                                            /******** Summary ********/
                                            Summary.condition = PrecipitationType;
                                            Summary.precipitationChance = maxPrecipitationChance;
                                            Summary.precipitationIntensity = maxPrecipitationIntensity;;
                                        };
                                        /******** Condition ********/
                                        Condition.beginCondition = minute.condition;
                                        Condition.endCondition = minute.condition;
                                        switch (Condition.beginCondition) {
                                            case "CLEAR":
                                                Condition.forecastToken = "CLEAR";
                                                break;
                                            case "POSSIBLE_DRIZZLE":
                                            case "POSSIBLE_FLURRIES":
                                            case "POSSIBLE_SLEET":
                                            case "POSSIBLE_HAIL":
                                                Condition.forecastToken = "CONSTANT";
                                                Condition.parameters = [];
;                                                break;
                                            default:
                                                Condition.forecastToken = "CONSTANT";
                                                Condition.parameters = [];
                                                break;
                                        };
                                        break;
                                    default:
                                        /******** Summary ********/
                                        if (minute?.precipitationType !== previousMinute?.precipitationType) {
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
                                            // reset
                                            Summary.startTime = minute.startTime;
                                            switch (Summary.condition) {
                                                case "CLEAR":
                                                    Summary.condition = PrecipitationType;
                                                    Summary.precipitationChance = minute.precipitationChance;
                                                    Summary.precipitationIntensity = minute.precipitationIntensity;
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
                                        /******** Condition ********/
                                        if (minute.condition !== previousMinute.condition) {
                                            Condition.endTime = minute.startTime;
                                            Condition.endCondition = previousMinute.condition;
                                            switch (Condition.forecastToken) {
                                                case "CLEAR":
                                                    forecastNextHour.condition.push({ ...Condition });
                                                    // reset
                                                    if (minute?.precipitationType !== previousMinute?.precipitationType) Condition.forecastToken = "START";
                                                    else Condition.forecastToken = "CLEAR";
                                                    Condition.parameters = [];
                                                    break;
                                                case "CONSTANT":
                                                    Condition.parameters.push({ "date": Condition.endTime, "type": "FIRST_AT" });
                                                    if (minute?.precipitationType !== previousMinute?.precipitationType) {
                                                        Condition.forecastToken = "STOP";
                                                        forecastNextHour.condition.push({ ...Condition });
                                                        //reset
                                                        Condition.forecastToken = "CLEAR";
                                                        Condition.parameters = [];
                                                    } else {
                                                        forecastNextHour.condition.push({ ...Condition });
                                                        Condition.parameters = [];
                                                    };
                                                    break;
                                                case "START":
                                                    Condition.parameters.push({ "date": Condition.endTime, "type": "FIRST_AT" });
                                                    if (minute?.precipitationType !== previousMinute?.precipitationType) {
                                                        // reset
                                                        Condition.forecastToken = "START_STOP";
                                                    } else {
                                                        forecastNextHour.condition.push({ ...Condition });
                                                        // reset
                                                        Condition.forecastToken = "CONSTANT";
                                                        Condition.parameters = [];
                                                    };
                                                    break;
                                                case "STOP":
                                                    Condition.parameters.push({ "date": Condition.endTime, "type": "FIRST_AT" });
                                                    if (minute?.precipitationType !== previousMinute?.precipitationType) {
                                                        // reset
                                                        Condition.forecastToken = "STOP_START";
                                                    } else {
                                                        forecastNextHour.condition.push({ ...Condition });
                                                        // reset
                                                        Condition.forecastToken = "CLEAR";
                                                        Condition.parameters = [];
                                                    };
                                                    break;
                                                case "START_STOP":
                                                    Condition.parameters.push({ "date": Condition.endTime, "type": "SECOND_AT" });
                                                    forecastNextHour.condition.push({ ...Condition });
                                                    // reset
                                                    Condition.forecastToken = "STOP";
                                                    Condition.parameters = [];
                                                    break;
                                                case "STOP_START":
                                                    Condition.parameters.push({ "date": Condition.endTime, "type": "SECOND_AT" });
                                                    forecastNextHour.condition.push({ ...Condition });
                                                    // reset
                                                    Condition.forecastToken = "START";
                                                    Condition.parameters = [];
                                                    break;
                                            };
                                            // reset
                                            Condition.beginCondition = minute.condition;
                                            Condition.endCondition = minute.condition;
                                            Condition.startTime = minute.startTime;
                                            Condition.endTime = 0;
                                        };
                                        break;
                                    case forecastNextHour?.minutes?.length - 1:
                                        /******** Summary ********/
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
                                        /******** Condition ********/
                                        Condition.endTime = minute.startTime;
                                        Condition.endCondition = previousMinute.condition;
                                        switch (Condition.forecastToken) {
                                            case "CLEAR":
                                                Condition.beginCondition = "CLEAR";
                                                Condition.endCondition = "CLEAR";
                                                Condition.forecastToken = "CLEAR";
                                                delete Condition.endTime;
                                                Condition.parameters = [];
                                                forecastNextHour.condition.push({ ...Condition });
                                                break;
                                            case "CONSTANT":
                                                delete Condition.endTime;
                                                Condition.parameters = [];
                                                forecastNextHour.condition.push({ ...Condition });
                                                break;
                                            case "START":
                                                forecastNextHour.condition.push({ ...Condition });
                                                // reset
                                                Condition.startTime = Condition.endTime;
                                                Condition.forecastToken = "CONSTANT";
                                                Condition.parameters = [];
                                                forecastNextHour.condition.push({ ...Condition });
                                                break;
                                            case "STOP":
                                                forecastNextHour.condition.push({ ...Condition });
                                                // reset
                                                Condition.beginCondition = "CLEAR";
                                                Condition.endCondition = "CLEAR";
                                                Condition.startTime = Condition.endTime;
                                                delete Condition.endTime;
                                                Condition.forecastToken = "CONSTANT";
                                                Condition.parameters = [];
                                                forecastNextHour.condition.push({ ...Condition });
                                                break;
                                            case "START_STOP":
                                                Condition.parameters.push({ "date": Condition.endTime, "type": "SECOND_AT" });
                                                forecastNextHour.condition.push({ ...Condition });
                                                break;
                                            case "STOP_START":
                                                Condition.parameters.push({ "date": Condition.endTime, "type": "SECOND_AT" });
                                                forecastNextHour.condition.push({ ...Condition });
                                                break;
                                        };
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
            //console.log(`🚧 forecastNextHour: ${JSON.stringify(forecastNextHour, null, 2)}`);
            console.log(`✅ Minutely`);
            return forecastNextHour;
        };
    };
};
