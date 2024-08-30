import ENV from "../ENV/ENV.mjs";
import providerNameToLogo from "../function/providerNameToLogo.mjs";

export default class ColorfulClouds {
    constructor($ = new ENV("ColorfulClouds"), options = { "url": new URL() }) {
        this.Name = "ColorfulClouds";
        this.Version = "1.6.9";
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

    #Minute(minutes = [], description = "") {
        console.log(`☑️ #Minute`);
        const PrecipitationType = this.#PrecipitationType(description);
        minutes = minutes.map(minute => {
            minute.condition = this.#ConditionType(minute.precipitationIntensity, PrecipitationType);
            minute.perceivedPrecipitationIntensity = this.#toPerceivedPrecipitationIntensity(minute.precipitationIntensity, minute.condition);
            if (minute.perceivedPrecipitationIntensity >= 0.001) minute.precipitationType = PrecipitationType;
            else minute.precipitationType = "CLEAR";
            return minute;
        });
        console.log(`✅ #Minute`);
        return minutes;
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
        console.log(`✅ #Summary`);
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
                    switch (minute.precipitationType) {
                        case "CLEAR": //✅
                            Condition.forecastToken = "CLEAR";
                            break;
                        default: //✅
                            Condition.forecastToken = "CONSTANT";
                            break;
                    };
                    Condition.parameters = [];
                    console.log(`⚠️ 0, minute: ${JSON.stringify(minute, null, 2)}\nCondition: ${JSON.stringify(Condition, null, 2)}`);
                    break;
                default:
                    switch (minute?.precipitationType) {
                        case previousMinute?.precipitationType: // ✅与前次相同
                            break;
                        default: // 与前次不同
                            switch (Condition.forecastToken) {
                                case "CLEAR": // ✅当前RAIN
                                    // ✅START
                                    Condition.beginCondition = minute.condition;
                                    Condition.endCondition = minute.condition;
                                    Condition.forecastToken = "START"; // ✅不推送，可能变为START_STOP
                                    Condition.endTime = minute.startTime; // ✅更新结束时间
                                    Condition.parameters.push({ "date": Condition.endTime, "type": "FIRST_AT" });
                                    break;
                                case "CONSTANT": // ✅当前CLEAR
                                    // ✅STOP
                                    Condition.endCondition = previousMinute.condition; // ✅更新结束条件
                                    Condition.forecastToken = "STOP"; // ✅不推送，可能变为STOP_START
                                    Condition.endTime = minute.startTime; // ✅更新结束时间
                                    Condition.parameters.push({ "date": Condition.endTime, "type": "FIRST_AT" });
                                    break;
                                case "START": // ✅当前CLEAR
                                    // ✅START_STOP
                                    Condition.endCondition = previousMinute.condition; // ✅更新结束条件
                                    Condition.forecastToken = "START_STOP";
                                    Condition.parameters.push({ "date": minute.startTime, "type": "SECOND_AT" });
                                    Conditions.push({ ...Condition });
                                    // ✅STOP
                                    Condition.beginCondition = previousMinute.condition;
                                    Condition.endCondition = previousMinute.condition;
                                    Condition.forecastToken = "STOP"; // ✅不推送，可能变为STOP_START
                                    Condition.startTime = Condition.endTime;
                                    Condition.endTime = minute.startTime; // ✅更新结束时间
                                    Condition.parameters = [{ "date": Condition.endTime, "type": "FIRST_AT" }];
                                    break;
                                case "STOP": // ✅当前RAIN
                                    // ✅STOP_START
                                    Condition.forecastToken = "STOP_START";
                                    Condition.parameters.push({ "date": minute.startTime, "type": "SECOND_AT" });
                                    // ✅START
                                    Condition.beginCondition = previousMinute.condition;
                                    Condition.endCondition = previousMinute.condition;
                                    Condition.forecastToken = "START"; // ✅不推送，可能变为START_STOP
                                    Condition.startTime = Condition.endTime;
                                    Condition.endTime = minute.startTime; // ✅更新结束时间
                                    Condition.parameters = [{ "date": Condition.endTime, "type": "FIRST_AT" }];
                                    break;
                                case "START_STOP": // ✅当前RAIN
                                    console.log(`⚠️ START_STOP\nminute: ${JSON.stringify(minute, null, 2)}\nCondition: ${JSON.stringify(Condition, null, 2)}`);
                                    break;
                                case "STOP_START": // ✅当前CLEAR
                                    console.log(`⚠️ STOP_START\nminute: ${JSON.stringify(minute, null, 2)}\nCondition: ${JSON.stringify(Condition, null, 2)}`);
                                    break;
                            };
                            break;
                    };
                    break;
                case Length - 1:
                    switch (Condition.forecastToken) {
                        case "CLEAR": // ✅当前CLEAR
                            // ✅确定CLEAR
                            Condition.beginCondition = "CLEAR";
                            Condition.endCondition = "CLEAR";
                            Condition.forecastToken = "CLEAR";
                            delete Condition.endTime;
                            Condition.parameters = [];
                            Conditions.push({ ...Condition });
                            break;
                        case "CONSTANT": // ✅当前RAIN
                            // ✅确定CONSTANT
                            Condition.endTime = minute.startTime; // ✅更新结束时间
                            Condition.parameters.push({ "date": Condition.endTime, "type": "FIRST_AT" });
                            Conditions.push({ ...Condition });
                            // ✅补充CONSTANT
                            Condition.beginCondition = minute.condition;
                            Condition.endCondition = minute.condition;
                            Condition.startTime = Condition.endTime;
                            delete Condition.endTime;
                            Condition.parameters = [];
                            Conditions.push({ ...Condition });
                            break;
                        case "START": // ✅当前RAIN
                            // ✅确定START
                            Conditions.push({ ...Condition });
                            // ✅补充CONSTANT
                            Condition.forecastToken = "CONSTANT";
                            Condition.startTime = Condition.endTime;
                            delete Condition.endTime;
                            Condition.parameters = [];
                            Conditions.push({ ...Condition });
                            break;
                        case "STOP": // ✅当前CLEAR
                            // ✅确定STOP
                            Conditions.push({ ...Condition });
                            // ✅补充CLEAR
                            Condition.beginCondition = "CLEAR";
                            Condition.endCondition = "CLEAR";
                            Condition.forecastToken = "CLEAR";
                            Condition.startTime = Condition.endTime;
                            delete Condition.endTime;
                            Condition.parameters = [];
                            Conditions.push({ ...Condition });
                            break;
                        case "START_STOP": // ✅当前CLEAR
                            console.log(`⚠️ START_STOP\nminute: ${JSON.stringify(minute, null, 2)}\nCondition: ${JSON.stringify(Condition, null, 2)}`);
                            break;
                        case "STOP_START": // ✅当前RAIN
                            console.log(`⚠️ STOP_START\nminute: ${JSON.stringify(minute, null, 2)}\nCondition: ${JSON.stringify(Condition, null, 2)}`);
                            break;
                    };
                    break;
            };
        };
        console.log(`✅ #Condition`);
        return Conditions;
    };

    #toPerceivedPrecipitationIntensity(precipitationIntensity, condition) {
        let perceivedPrecipitationIntensity = 0;
        let level = 0; // full level = 3;
        switch (condition) {
            case "CLEAR":
                level = 0;
                perceivedPrecipitationIntensity = Math.min(10, precipitationIntensity) / 3 * level;
                break;
            case "POSSIBLE_DRIZZLE":
            case "POSSIBLE_FLURRIES":
                level = 0.1;
                perceivedPrecipitationIntensity = Math.min(10, precipitationIntensity) / 3 * level;
                break;
            case "DRIZZLE":
            case "FLURRIES":
                level = 0.5;
                perceivedPrecipitationIntensity = Math.min(10, precipitationIntensity) / 3 * level;
                break;
            case "RAIN":
            case "SNOW":
                level = 1.5;
                perceivedPrecipitationIntensity = Math.min(10, precipitationIntensity) / 3 * level;
                break;
            case "HEAVY_RAIN":
            case "HEAVY_SNOW":
                level = 2.5;
                perceivedPrecipitationIntensity = Math.min(10, precipitationIntensity) / 3 * level;
                break;
        };
        perceivedPrecipitationIntensity = Math.round(perceivedPrecipitationIntensity * 1000) / 1000;
        return perceivedPrecipitationIntensity;
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
                            forecastNextHour.minutes = this.#Minute(forecastNextHour.minutes, body?.result?.minutely?.description);
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
