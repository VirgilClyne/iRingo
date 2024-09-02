export default class ForecastNextHour {
    Name = "forecastNextHour";
    Version = "v1.1.11";
    Author = "iRingo";

    static #Configs = {
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
            "rain": "RAIN",
            "雨": "RAIN",
            "snow": "SNOW",
            "雪": "SNOW",
            "冰雹": "HAIL",
        }
    };

    static WeatherCondition(sentence) {
        console.log(`☑️ WeatherCondition, sentence: ${sentence}`, "");
        let weatherCondition = "CLEAR";
        Object.keys(this.#Configs.WeatherCondition).forEach(key => {
            if (sentence.includes(key)) weatherCondition = this.#Configs.WeatherCondition[key];
        });
        console.log(`✅ WeatherCondition: ${weatherCondition}`, "");
        return weatherCondition;
    };

    static PrecipitationType(sentence) {
        console.log(`☑️ PrecipitationType, sentence: ${sentence}`, "");
        let precipitationType = "CLEAR";
        Object.keys(this.#Configs.PrecipitationType).forEach(key => {
            if (sentence.includes(key)) precipitationType = this.#Configs.PrecipitationType[key];
        });
        console.log(`✅ PrecipitationType: ${precipitationType}`, "");
        return precipitationType;
    };

    static ConditionType(precipitationIntensity, precipitationType) {
        // refer: https://docs.caiyunapp.com/weather-api/v2/v2.6/tables/precip.html
        //console.log(`☑️ ConditionType`, "");
        //console.log(`☑️ ConditionType, precipitationIntensity: ${precipitationIntensity}, precipitationChance: ${precipitationChance}, precipitationType: ${precipitationType}`, "");
        let condition = "CLEAR";
        if (precipitationIntensity >= 0 && precipitationIntensity < 0.002 ) condition = "CLEAR"
        else if (precipitationIntensity >= 0.002 && precipitationIntensity < 0.0606) {
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
        } else if (precipitationIntensity >=2.87){
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
        //console.log(`✅ #ConditionType: ${condition}`, "");
        return condition;
    };

    static Minute(minutes = [], description = "") {
        console.log(`☑️ #Minute`, "");
        const PrecipitationType = this.PrecipitationType(description);
        minutes = minutes.map(minute => {
            minute.precipitationIntensity = Math.round(minute.precipitationIntensity * 1000000) / 1000000; // 六位小数
            minute.condition = this.ConditionType(minute.precipitationIntensity, PrecipitationType);
            minute.perceivedPrecipitationIntensity = this.toPerceivedPrecipitationIntensity(minute.precipitationIntensity, minute.condition); // 三位小数
            if (minute.perceivedPrecipitationIntensity >= 0.001) minute.precipitationType = PrecipitationType;
            else minute.precipitationType = "CLEAR";
            return minute;
        });
        console.log(`✅ Minute`, "");
        return minutes;
    };

    static Summary(minutes = []) {
        console.log(`☑️ Summary`, "");
        const Summaries = [];
        const Summary = {
            "condition": "CLEAR",
            "precipitationChance": 0,
            "startTime": 0,
            "precipitationIntensity": 0
        };
        const Length = Math.min(71, minutes.length);
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
                    Summary.endTime = 0;// ⚠️空值必须写零！
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
        console.log(`✅ Summary`, "");
        return Summaries;
    };

    static Condition(minutes = []) {
        console.log(`☑️ Condition`, "");
        const Conditions = [];
        const Condition = {
            "beginCondition": "CLEAR",
            "endCondition": "CLEAR",
            "forecastToken": "CLEAR",
            "parameters": [],
            "startTime": 0
        };
        const Length = Math.min(71, minutes.length);
        for (let i = 0; i < Length; i++) {
            const minute = minutes[i];
            const previousMinute = minutes[i - 1];
            //console.log(`⚠️ ${i}, before, minute: ${JSON.stringify(minute, null, 2)}\nCondition: ${JSON.stringify(Condition, null, 2)}`, "");
            switch (i) {
                case 0:
                    console.log(`⚠️ ${i}, before, minute: ${JSON.stringify(minute, null, 2)}\nCondition: ${JSON.stringify(Condition, null, 2)}`, "");
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
                    console.log(`⚠️ ${i}, after, minute: ${JSON.stringify(minute, null, 2)}\nCondition: ${JSON.stringify(Condition, null, 2)}`, "");
                    break;
                default:
                    switch (minute?.precipitationType) {
                        case previousMinute?.precipitationType: // ✅与前次相同
                            switch (minute?.condition) {
                                case previousMinute?.condition: // ✅与前次相同
                                    break;
                                default: // ✅与前次不同
                                    switch (Condition.forecastToken) {
                                        case "CONSTANT":
                                            Condition.endTime = minute.startTime; // ✅更新结束时间
                                            switch (Condition.beginCondition) {
                                                case Condition.endCondition: // ✅与begin相同
                                                    Condition.parameters = [];
                                                    Conditions.push({ ...Condition });
                                                    break;
                                                default: // ✅与begin不同
                                                    Condition.endCondition = previousMinute.condition;
                                                    Condition.parameters = [{ "date": Condition.endTime, "type": "FIRST_AT" }];
                                                    Conditions.push({ ...Condition });
                                                    // ✅CONSTANT
                                                    Condition.beginCondition = minute.condition;
                                                    break;
                                            };
                                            Condition.endCondition = minute.condition;
                                            Condition.startTime = Condition.endTime; // ✅更新开始时间
                                            Condition.parameters = [];
                                            break;
                                    };
                                    break;
                            };
                            break;
                        default: // 与前次不同
                            switch (Condition.forecastToken) {
                                case "CLEAR": // ✅当前RAIN
                                    // ✅START
                                    Condition.beginCondition = minute.condition;
                                    Condition.endCondition = minute.condition;
                                    Condition.forecastToken = "START"; // ✅不推送，可能变为START_STOP
                                    Condition.endTime = minute.startTime; // ✅更新结束时间
                                    Condition.parameters = [{ "date": Condition.endTime, "type": "FIRST_AT" }];
                                    break;
                                case "CONSTANT": // ✅当前CLEAR
                                    Conditions.length = 0; // ✅清空
                                    // ✅STOP
                                    Condition.beginCondition = minutes[0].condition; // ✅更新结束条件
                                    Condition.endCondition = previousMinute.condition; // ✅更新结束条件
                                    Condition.forecastToken = "STOP"; // ✅不推送，可能变为STOP_START
                                    Condition.endTime = minute.startTime; // ✅更新结束时间
                                    Condition.parameters = [{ "date": Condition.endTime, "type": "FIRST_AT" }];
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
                                    Conditions.push({ ...Condition });
                                    // ✅START
                                    Condition.beginCondition = minute.condition;
                                    Condition.endCondition = minute.condition;
                                    Condition.forecastToken = "START"; // ✅不推送，可能变为START_STOP
                                    Condition.startTime = Condition.endTime;
                                    Condition.endTime = minute.startTime; // ✅更新结束时间
                                    Condition.parameters = [{ "date": Condition.endTime, "type": "FIRST_AT" }];
                                    break;
                                case "START_STOP": // ✅当前RAIN
                                    console.log(`⚠️ START_STOP\nminute: ${JSON.stringify(minute, null, 2)}\nCondition: ${JSON.stringify(Condition, null, 2)}`, "");
                                    break;
                                case "STOP_START": // ✅当前CLEAR
                                    console.log(`⚠️ STOP_START\nminute: ${JSON.stringify(minute, null, 2)}\nCondition: ${JSON.stringify(Condition, null, 2)}`, "");
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
                            Condition.endTime = 0; // ⚠️空值必须写零！
                            Condition.parameters = [];
                            Conditions.push({ ...Condition });
                            break;
                        case "CONSTANT": // ✅当前RAIN
                            // ✅确定CONSTANT
                            Condition.endCondition = minute.condition;
                            Condition.endTime = 0; // ⚠️空值必须写零！
                            Condition.parameters = [];
                            Conditions.push({ ...Condition });
                            break;
                        case "START": // ✅当前RAIN
                            // ✅确定START
                            Conditions.push({ ...Condition });
                            // ✅补充CONSTANT
                            Condition.forecastToken = "CONSTANT";
                            Condition.startTime = Condition.endTime;
                            Condition.endTime = 0; // ⚠️空值必须写零！
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
                            Condition.endTime = 0;// ⚠️空值必须写零！
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
            //console.log(`⚠️ ${i}, after, minute: ${JSON.stringify(minute, null, 2)}\nCondition: ${JSON.stringify(Condition, null, 2)}`, "");
        };
        console.log(`✅ Condition`, "");
        return Conditions;
    };

    static toPerceivedPrecipitationIntensity(precipitationIntensity, condition) {
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
        perceivedPrecipitationIntensity = Math.round(Math.min(3, perceivedPrecipitationIntensity) * 1000) / 1000; // 三位小数
        return perceivedPrecipitationIntensity;
    };
};
