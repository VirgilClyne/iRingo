import { log } from "../utils/utils.mjs";
export default class ForecastNextHour {
	Name = "ForecastNextHour";
	Version = "v1.2.6";
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
			"other": "NOT_AVAILABLE",
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
		},
		"Precipitation": {
			"Level": {
				"INVALID": -1,
				"NO": 0,
				"LIGHT": 1,
				"MODERATE": 2,
				"HEAVY": 3,
				"STORM": 4,
			},
			"Range": {
				/**
				 * [降水强度 | 彩云天气 API]{@link https://docs.caiyunapp.com/weather-api/v2/v2.6/tables/precip.html}
				*/
				"radar": {
					"NO": [0, 0.031],
					"LIGHT": [0.031, 0.25],
					"MODERATE": [0.25, 0.35],
					"HEAVY": [0.35, 0.48],
					"STORM": [0.48, Number.MAX_VALUE],
				},
				"mmph": {
					"NO": [0, 0.08],
					"LIGHT": [0.08, 3.44],
					"MODERATE": [3.44, 11.33],
					"HEAVY": [11.33, 51.30],
					"STORM": [51.30, Number.MAX_VALUE],
				},
				/* 新标准不好用
				"mmph": {
					"NO": [0, 0.0606],
					"LIGHT": [0.0606, 0.8989],
					"MODERATE": [0.8989, 2.87],
					"HEAVY": [2.87, 12.8638],
					"STORM": [12.8638, Number.MAX_VALUE],
				},
				*/
			},
		},
	};

	static WeatherCondition(sentence) {
		log(`☑️ WeatherCondition, sentence: ${sentence}`, "");
		let weatherCondition = "CLEAR";
		Object.keys(this.#Configs.WeatherCondition).forEach(key => {
			if (sentence.includes(key)) weatherCondition = this.#Configs.WeatherCondition[key];
		});
		log(`✅ WeatherCondition: ${weatherCondition}`, "");
		return weatherCondition;
	};

	static PrecipitationType(sentence) {
		log(`☑️ PrecipitationType, sentence: ${sentence}`, "");
		let precipitationType = "CLEAR";
		Object.keys(this.#Configs.PrecipitationType).forEach(key => {
			if (sentence.includes(key)) precipitationType = this.#Configs.PrecipitationType[key];
		});
		log(`✅ PrecipitationType: ${precipitationType}`, "");
		return precipitationType;
	};

	static ConditionType(precipitationIntensity, precipitationType, units = "mmph") {
		// refer: https://docs.caiyunapp.com/weather-api/v2/v2.6/tables/precip.html
		//log(`☑️ ConditionType`, "");
		//log(`☑️ ConditionType, precipitationIntensity: ${precipitationIntensity}, precipitationChance: ${precipitationChance}, precipitationType: ${precipitationType}`, "");
		const Range = this.#Configs.Precipitation.Range[units];
		let condition = "CLEAR";
		if (precipitationIntensity >= Range.NO[0] && precipitationIntensity <= 0.001) condition = "CLEAR"
		else if (precipitationIntensity > 0.001 && precipitationIntensity <= Range.NO[1]) {
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
		} else if (precipitationIntensity > Range.LIGHT[0] && precipitationIntensity <= Range.LIGHT[1]) {
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
		} else if (precipitationIntensity > Range.MODERATE[0] && precipitationIntensity <= Range.MODERATE[1]) {
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
		} else if (precipitationIntensity > Range.HEAVY[0]) {
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
		//log(`✅ #ConditionType: ${condition}`, "");
		return condition;
	};

	static Minute(minutes = [], description = "", units = "mmph") {
		log(`☑️ Minute`, "");
		const PrecipitationType = this.PrecipitationType(description);
		minutes = minutes.map(minute => {
			//minute.precipitationIntensity = Math.round(minute.precipitationIntensity * 1000000) / 1000000; // 六位小数
			minute.condition = this.ConditionType(minute.precipitationIntensity, PrecipitationType, units);
			minute.perceivedPrecipitationIntensity = this.ConvertPrecipitationIntensity(minute.precipitationIntensity, minute.condition, units);
			if (minute.perceivedPrecipitationIntensity >= 0.001) minute.precipitationType = PrecipitationType;
			else minute.precipitationType = "CLEAR";
			return minute;
		});
		log(`✅ Minute`, "");
		return minutes;
	};

	static Summary(minutes = []) {
		log(`☑️ Summary`, "");
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
		log(`✅ Summary`, "");
		return Summaries;
	};

	static Condition(minutes = []) {
		log(`☑️ Condition`, "");
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
			//log(`⚠️ ${i}, before, minute: ${JSON.stringify(minute, null, 2)}\nCondition: ${JSON.stringify(Condition, null, 2)}`, "");
			switch (i) {
				case 0:
					//log(`⚠️ ${i}, before, minute: ${JSON.stringify(minute, null, 2)}\nCondition: ${JSON.stringify(Condition, null, 2)}`, "");
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
					//log(`⚠️ ${i}, after, minute: ${JSON.stringify(minute, null, 2)}\nCondition: ${JSON.stringify(Condition, null, 2)}`, "");
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
									log(`⚠️ START_STOP\nminute: ${JSON.stringify(minute, null, 2)}\nCondition: ${JSON.stringify(Condition, null, 2)}`, "");
									break;
								case "STOP_START": // ✅当前CLEAR
									log(`⚠️ STOP_START\nminute: ${JSON.stringify(minute, null, 2)}\nCondition: ${JSON.stringify(Condition, null, 2)}`, "");
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
							Condition.endCondition = previousMinute.condition;
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
							log(`⚠️ START_STOP\nminute: ${JSON.stringify(minute, null, 2)}\nCondition: ${JSON.stringify(Condition, null, 2)}`);
							break;
						case "STOP_START": // ✅当前RAIN
							log(`⚠️ STOP_START\nminute: ${JSON.stringify(minute, null, 2)}\nCondition: ${JSON.stringify(Condition, null, 2)}`);
							break;
					};
					break;
			};
			//log(`⚠️ ${i}, after, minute: ${JSON.stringify(minute, null, 2)}\nCondition: ${JSON.stringify(Condition, null, 2)}`, "");
		};
		log(`✅ Condition`, "");
		return Conditions;
	};

	static ConvertPrecipitationIntensity(precipitationIntensity, condition, units = "mmph") {
		//log(`☑️ ConvertPrecipitationIntensity`, "");
		let perceivedPrecipitationIntensity = 0;
		const Range = this.#Configs.Precipitation.Range[units];
		let level = 0;
		let range = [];
		switch (condition) {
			case "CLEAR":
				level = 0;
				range = [Range.NO[0], 0.001];
				break;
			case "POSSIBLE_DRIZZLE":
			case "POSSIBLE_FLURRIES":
				level = 0;
				range = [0.001, Range.NO[1]];
				break;
			case "DRIZZLE":
			case "FLURRIES":
				level = 0;
				range = Range.LIGHT;
				break;
			case "RAIN":
			case "SNOW":
				level = 1;
				range = Range.MODERATE;
				break;
			case "HEAVY_RAIN":
			case "HEAVY_SNOW":
				level = 2;
				range = Range.HEAVY;
				break;
		};
		perceivedPrecipitationIntensity = level + (precipitationIntensity - range[0]) / (range[1] - range[0]);
		perceivedPrecipitationIntensity = Math.min(3, perceivedPrecipitationIntensity);
		//log(`✅ ConvertPrecipitationIntensity: ${perceivedPrecipitationIntensity}`, "");
		return perceivedPrecipitationIntensity;
	};
};
