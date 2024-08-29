import ENV from "../ENV/ENV.mjs";
import providerNameToLogo from "../function/providerNameToLogo.mjs";

export default class ColorfulClouds {
    constructor($ = new ENV("ColorfulClouds"), options = { "url": new URL() }) {
        this.Name = "ColorfulClouds";
        this.Version = "1.4.10";
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
            "小雨": "DRIZZLE",
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
                    condition = "DRIZZLE";
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

    #Summary(minutes = []) {
        console.log(`☑️ #Summary`);
        const Summaries = [];
        const Summary = {
            "condition": "CLEAR",
            "precipitationChance": 0,
            "startTime": 0,
            "precipitationIntensity": 0
        };
        const Length = Math.min(60, minutes.length);
        for (let i = 0; i < Length; i++) {
            const minute = minutes[i];
            const previousMinute = minutes[i - 1];
            let maxPrecipitationIntensity = Math.max(minute?.precipitationIntensity ?? 0, previousMinute?.precipitationIntensity ?? 0);
            let maxPrecipitationChance = Math.max(minute?.precipitationChance ?? 0, previousMinute?.precipitationChance ?? 0);
            switch (i) {
                case 0:
                    Summary.startTime = minute.startTime;
                    if (minute?.precipitationIntensity > 0) {
                        Summary.condition = minute.precipitationType;
                        Summary.precipitationChance = maxPrecipitationChance;
                        Summary.precipitationIntensity = maxPrecipitationIntensity;;
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
                        Summaries.push({ ...Summary });
                        // reset
                        Summary.startTime = minute.startTime;
                        switch (Summary.condition) {
                            case "CLEAR":
                                Summary.condition = minute.precipitationType;
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
                    break;
                case Length - 1:
                    delete Summary.endTime;
                    switch (Summary.condition) {
                        case "CLEAR":
                            break;
                        default:
                            Summary.precipitationChance = maxPrecipitationChance;
                            Summary.precipitationIntensity = maxPrecipitationIntensity;
                            break;
                    };
                    Summaries.push({ ...Summary });
                    break;
            };
        };
        console.log(`✅ Summaries`);
        return Summaries;
    };

    Condition(minutes = []) {
        console.log(`☑️ #Condition`);
        const Conditions = [];
        const Condition = {
            "beginCondition": "CLEAR",
            "endCondition": "CLEAR",
            "forecastToken": "CLEAR",
            "parameters": [],
            "startTime": 0
        };
        const Length = Math.min(60, minutes.length);
        for (let i = 0; i < Length; i++) {
            const minute = minutes[i];
            const previousMinute = minutes[i - 1];
            switch (i) {
                case 0:
                    Condition.beginCondition = minute.condition;
                    Condition.endCondition = minute.condition;
                    Condition.startTime = minute.startTime;
                    switch (Condition.beginCondition) {
                        case "CLEAR": //✅
                            Condition.forecastToken = "CLEAR";
                            break;
                        default: //✅
                            Condition.forecastToken = "CONSTANT";
                            break;
                    };
                    Condition.parameters = [];
                    break;
                default:
                    if (minute.condition !== previousMinute.condition) {
                        Condition.endTime = minute.startTime;
                        Condition.endCondition = previousMinute.condition;
                        switch (Condition.forecastToken) {
                            case "CLEAR": //✅
                                // START
                                Condition.beginCondition = minute.condition;
                                Condition.endCondition = minute.condition;
                                Condition.forecastToken = "START";
                                Condition.startTime = Condition.endTime;
                                Condition.parameters = [];
                                break;
                            case "CONSTANT": //✅
                                switch (minute?.precipitationType) {
                                    case "CLEAR":
                                        // STOP
                                        Condition.endCondition = previousMinute.condition;
                                        Condition.forecastToken = "STOP";
                                        Condition.startTime = Condition.endTime;
                                        Condition.parameters = [];
                                        break;
                                    default:
                                        //Condition.parameters.push({ "date": minute.startTime, "type": "FIRST_AT" });
                                        //Conditions.push({ ...Condition });
                                        // CONSTANT
                                        Condition.endCondition = minute.condition;
                                        Condition.forecastToken = "CONSTANT";
                                        Condition.parameters = [];
                                        break;
                                };
                                break;
                            case "START": //✅
                                Condition.parameters.push({ "date": minute.startTime, "type": "FIRST_AT" });
                                switch (minute?.precipitationType) {
                                    case "CLEAR":
                                        // START_STOP
                                        Condition.forecastToken = "START_STOP";
                                        Conditions.push({ ...Condition });
                                        // CLEAR
                                        Condition.beginCondition = "CLEAR";
                                        Condition.endCondition = "CLEAR";
                                        Condition.forecastToken = "CLEAR";
                                        Condition.startTime = Condition.endTime;
                                        Condition.parameters = [];
                                        break;
                                    default:
                                        Conditions.push({ ...Condition });
                                        // CONSTANT
                                        Condition.forecastToken = "CONSTANT";
                                        Condition.startTime = Condition.endTime;
                                        Condition.parameters = [];
                                        break;
                                };
                                break;
                            case "STOP": //✅
                                Condition.parameters.push({ "date": minute.startTime, "type": "FIRST_AT" });
                                // STOP_START
                                switch (minute?.precipitationType) {
                                    case "CLEAR":
                                        Conditions.push({ ...Condition });
                                        // CLEAR
                                        Condition.beginCondition = "CLEAR";
                                        Condition.endCondition = "CLEAR";
                                        Condition.forecastToken = "CLEAR";
                                        Condition.startTime = Condition.endTime;
                                        Condition.parameters = [];
                                        break;
                                    default:
                                        Condition.forecastToken = "STOP_START";
                                        break;
                                };
                                break;
                            case "START_STOP": //✅
                                Condition.parameters.push({ "date": minute.startTime, "type": "SECOND_AT" });
                                Conditions.push({ ...Condition });
                                // CLEAR
                                Condition.beginCondition = "CLEAR";
                                Condition.endCondition = "CLEAR";
                                Condition.forecastToken = "CLEAR";
                                Condition.startTime = Condition.endTime;
                                Condition.parameters = [];
                                break;
                            case "STOP_START": //✅
                                Condition.parameters.push({ "date": minute.startTime, "type": "SECOND_AT" });
                                Conditions.push({ ...Condition });
                                // CONSTANT
                                Condition.forecastToken = "CONSTANT";
                                Condition.startTime = Condition.endTime;
                                Condition.parameters = [];
                                break;
                        };
                        delete Condition.endTime;
                    };
                    break;
                case Length - 1:
                    Condition.endTime = minute.startTime;
                    Condition.endCondition = previousMinute.condition;
                    switch (Condition.forecastToken) {
                        case "CLEAR": //✅
                            Condition.beginCondition = "CLEAR";
                            Condition.endCondition = "CLEAR";
                            Condition.forecastToken = "CLEAR";
                            delete Condition.endTime;
                            Condition.parameters = [];
                            Conditions.push({ ...Condition });
                            break;
                        case "CONSTANT": //✅
                            Condition.parameters.push({ "date": minute.startTime, "type": "FIRST_AT" });
                            Conditions.push({ ...Condition });
                            // CONSTANT
                            Condition.beginCondition = minute.condition;
                            Condition.endCondition = minute.condition;
                            Condition.startTime = Condition.endTime;
                            delete Condition.endTime;
                            Condition.parameters = [];
                            Conditions.push({ ...Condition });
                            break;
                        case "START": //✅
                            Conditions.push({ ...Condition });
                            // CONSTANT
                            Condition.forecastToken = "CONSTANT";
                            Condition.startTime = Condition.endTime;
                            delete Condition.endTime;
                            Condition.parameters = [];
                            Conditions.push({ ...Condition });
                            break;
                        case "STOP": //✅
                            Conditions.push({ ...Condition });
                            // CLEAR
                            Condition.beginCondition = "CLEAR";
                            Condition.endCondition = "CLEAR";
                            Condition.forecastToken = "CLEAR";
                            Condition.startTime = Condition.endTime;
                            delete Condition.endTime;
                            Condition.parameters = [];
                            Conditions.push({ ...Condition });
                            break;
                        case "START_STOP": //✅
                            Condition.parameters.push({ "date": minute.startTime, "type": "SECOND_AT" });
                            Conditions.push({ ...Condition });
                            // CLEAR
                            Condition.beginCondition = "CLEAR";
                            Condition.endCondition = "CLEAR";
                            Condition.forecastToken = "CLEAR";
                            Condition.startTime = Condition.endTime;
                            delete Condition.endTime;
                            Condition.parameters = [];
                            Conditions.push({ ...Condition });
                            break;
                        case "STOP_START": //✅
                            Condition.parameters.push({ "date": minute.startTime, "type": "SECOND_AT" });
                            Conditions.push({ ...Condition })
                            // CONSTANT
                            Condition.startTime = Condition.endTime;
                            delete Condition.endTime;
                            Condition.forecastToken = "CONSTANT";
                            Condition.parameters = [];
                            Conditions.push({ ...Condition });
                            break;
                    };
                    break;
            };
        };
        console.log(`✅ Condition`);
        return Conditions;
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
                                        "perceivedPrecipitationIntensity": precipitationIntensity, //* 0.65,
                                        "precipitationChance": 0,
                                        "precipitationIntensity": precipitationIntensity,
                                        "startTime": minuteStemp + 60 * index,
                                    };
                                    if (index < 30) minute.precipitationChance = body?.result?.minutely?.probability?.[0]
                                    else if (index < 60) minute.precipitationChance = body?.result?.minutely?.probability?.[1]
                                    else if (index < 90) minute.precipitationChance = body?.result?.minutely?.probability?.[2]
                                    else minute.precipitationChance = body?.result?.minutely?.probability?.[3];
                                    if (minute.perceivedPrecipitationIntensity >= 0.001) minute.precipitationType = PrecipitationType;
                                    else minute.precipitationType = "CLEAR";
                                    minute.condition = this.#ConditionType(minute.perceivedPrecipitationIntensity, PrecipitationType);
                                    return minute;
                                }),
                                "summary": []
                            };
                            forecastNextHour.minutes.length = 90;
                            forecastNextHour.forecastEnd = minuteStemp + 60 * forecastNextHour.minutes.length;
                            forecastNextHour.summary = this.#Summary(forecastNextHour.minutes);
                            forecastNextHour.condition = this.Condition(forecastNextHour.minutes);
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
