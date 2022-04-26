/*
README:https://github.com/VirgilClyne/iRingo
*/

const $ = new Env("Apple Weather AQI v3.0.0-beta");
const URL = new URLSearch();
const DataBase = {
	"Weather":{"Switch":true,"NextHour":{"Switch":true},"AQI":{"Switch":true,"Mode":"WAQI Public","Location":"Station","Auth":null,"Scale":"EPA_NowCast.2201"},"Map":{"AQI":false}},
	"Siri":{"Switch":true,"CountryCode":"TW","Domains":["web","itunes","app_store","movies","restaurants","maps"],"Functions":["flightutilities","lookup","mail","messages","news","safari","siri","spotlight","visualintelligence"],"Safari_Smart_History":true}
};
var { url } = $request;
var { body } = $response;

/***************** Processing *****************/
!(async () => {
	const Settings = await setENV("iRingo", "Weather", DataBase);
	if (Settings.Switch) {
		url = URL.parse(url);
		const Params = await getParams(url.path);
		let data = JSON.parse(body);
		const Status = await getStatus(data);
		// AQI
		if (Settings.AQI.Switch) {
			if (url.params?.include?.includes("air_quality") || url.params?.dataSets?.includes("airQuality")) {
				if (Status == true) {
					$.log(`🎉 ${$.name}, 需要替换AQI`, "");
					if (Settings.AQI.Mode == "WAQI Public") {
						$.log(`🚧 ${$.name}, 工作模式: waqi.info 公共API`, "")
						var { Station, idx } = await WAQI("Nearest", { api: Params.ver, lat: Params.lat, lng: Params.lng });
						const Token = await WAQI("Token", { idx: idx });
						//var NOW = await WAQI("NOW", { token:Token, idx: idx });
						var AQI = await WAQI("AQI", { token: Token, idx: idx });
					} else if (Settings.AQI.Mode == "WAQI Private") {
						$.log(`🚧 ${$.name}, 工作模式: waqi.info 私有API`, "")
						const Token = Settings.AQI.Auth;
						if (Settings.AQI.Location == "Station") {
							$.log(`🚧 ${$.name}, 定位精度: 观测站`, "")
							var { Station, idx } = await WAQI("Nearest", { api: Params.ver, lat: Params.lat, lng: Params.lng });
							var AQI = await WAQI("StationFeed", { token: Token, idx: idx });
						} else if (Settings.AQI.Location == "City") {
							$.log(`🚧 ${$.name}, 定位精度: 城市`, "")
							var AQI = await WAQI("CityFeed", { token: Token, lat: Params.lat, lng: Params.lng });
						}
					};
					data = await outputAQI(Params.ver, Station, AQI, data, Settings);
				} else $.log(`🎉 ${$.name}, 无须替换, 跳过`, "");
			}
		};
		// NextHour
		if (Settings.NextHour.Switch) {
			if (url.params?.dataSets?.includes("forecastNextHour")) {
				if (!data?.forecastNextHour?.metadata?.providerName) {
					$.log(`🚧 ${$.name}, 没有下一小时降水强度信息, `,
						`providerName = ${data?.forecastNextHour?.providerName}`, "");

					let minutelyData;
					let providerName;
					if (!out_of_china(parseFloat(Params.lng), parseFloat(Params.lat))) {
						minutelyData = await getGridWeatherMinutely(Params.lat, Params.lng);
						providerName = "气象在线";
					}

					if (minutelyData) {
						data = await outputNextHour(Params.ver, providerName, minutelyData, data, Settings);
					} else {
						$.log(`🚧 ${$.name}, 没有找到合适的API, 跳过`, "");
					}
				} else {
					$.log(`🚧 ${$.name}, forecastNextHour = ${JSON.stringify(data?.forecastNextHour)}`, "");
					$.log(`🎉 ${$.name}, 不替换下一小时降水强度信息, 跳过`, "");
				}
			}
		};
		body = JSON.stringify(data);
	}
})()
	.catch((e) => $.logErr(e))
	.finally(() => $.done({ body }))

/***************** Async Function *****************/
/**
 * Set Environment Variables
 * @author VirgilClyne
 * @param {String} name - Persistent Store Key
 * @param {String} platform - Platform Name
 * @param {Object} database - Default DataBase
 * @return {Promise<*>}
 */
 async function setENV(name, platform, database) {
	$.log(`⚠ ${$.name}, Set Environment Variables`, "");
	let Settings = await getENV(name, platform, database);
	/***************** Prase *****************/
	Settings.Switch = JSON.parse(Settings.Switch) // BoxJs字符串转Boolean
	Settings.NextHour.Switch = JSON.parse(Settings.NextHour.Switch) // BoxJs字符串转Boolean
	Settings.AQI.Switch = JSON.parse(Settings.AQI.Switch) // BoxJs字符串转Boolean
	Settings.Map.AQI = JSON.parse(Settings.Map.AQI) // BoxJs字符串转Boolean
	$.log(`🎉 ${$.name}, Set Environment Variables`, `Settings: ${typeof Settings}`, `Settings内容: ${JSON.stringify(Settings)}`, "");
	return Settings
	async function getENV(t,e,n){let i=$.getjson(t,n),r=i?.[e]||i?.Settings?.[e]||n[e];if("undefined"!=typeof $argument){if($argument){let t=Object.fromEntries($argument.split("&").map((t=>t.split("=")))),e={};for(var s in t)f(e,s,t[s]);Object.assign(r,e)}function f(t,e,n){e.split(".").reduce(((t,i,r)=>t[i]=e.split(".").length===++r?n:t[i]||{}),t)}}return r}
};

/**
 * Get Origin Parameters
 * @author VirgilClyne
 * @param {String} url - Request URL
 * @return {Promise<*>}
 */
async function getParams(path) {
	const Regular = /^(?<ver>v1|v2)\/weather\/(?<language>[\w-_]+)\/(?<lat>-?\d+\.\d+)\/(?<lng>-?\d+\.\d+).*(?<countryCode>country=[A-Z]{2})?.*/i;
	const Params = path.match(Regular).groups;
	// TODO: add debug switch (lat, lng)
	$.log(`🚧 ${$.name}`, `Params: ${JSON.stringify(Params)}`, "");
	return Params
};

/**
 * Get AQI Source Status
 * @author VirgilClyne
 * @param {Object} data - Parsed response body JSON
 * @return {Promise<*>}
 */
async function getStatus(data) {
	const result = ["和风天气", "QWeather"].includes(data.air_quality?.metadata?.provider_name ?? data.airQuality?.metadata?.providerName ?? "QWeather");
	$.log(`🚧 ${$.name}, providerName = ${data.air_quality?.metadata?.provider_name ?? data.airQuality?.metadata?.providerName}`, '');
	return (result || false)
};

/**
 * WAQI
 * @author VirgilClyne
 * @param {String} type - type
 * @param {Object} input - verify
 * @return {Promise<*>}
 */
async function WAQI(type = "", input = {}) {
	// TODO: add debug switch (lat, lng)
	$.log(`⚠ ${$.name}, WAQI`, `input: ${JSON.stringify(input)}`, "");
	// 构造请求
	let request = await GetRequest(type, input);
	// 发送请求
	let output = await GetData(type, request);
	// TODO: add debug switch (geo)
	$.log(`🚧 ${$.name}, WAQI`, `output: ${JSON.stringify(output)}`, "");
	return output
	/***************** Fuctions *****************/
	async function GetRequest(type = "", input = { api: "v2", lat: 0, lng: 0, idx: 0, token: "na" }) {
		$.log(`⚠ ${$.name}, Get WAQI Request, type: ${type}`, "");
		let request = {
			"url": "https://api.waqi.info",
			"headers": {
				"Content-Type": "application/x-www-form-urlencoded",
				"Origin": "https://waqi.info",
				"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1",
				"Referer": "https://waqi.info/"
			}
		};
		if (type == "Nearest") {
			$.log('获取最近站点');
			if (input.api == "v1") mapq = "mapq";
			else if (input.api == "v2") mapq = "mapq2";
			request.url = `${request.url}/${mapq}/nearest?n=1&geo=1/${input.lat}/${input.lng}`;
		} else if (type == "Token") {
			$.log('获取令牌');
			request.url = `${request.url}/api/token/${input.idx}`
		} else if (type == "NOW") {
			$.log('获取即时信息');
			request.url = `${request.url}/api/feed/@${input.idx}/now.json`
			request.body = `token=${input.token}&id=${input.idx}`
		} else if (type == "AQI") {
			$.log('获取空气质量信息');
			request.url = `${request.url}/api/feed/@${input.idx}/aqi.json`
			request.body = `token=${input.token}&id=${input.idx}`
		} else if (type == "CityFeed") {
			$.log('获取城市信息');
			request.url = `${request.url}/feed/geo:${input.lat};${input.lng}/?token=${input.token}`
		} else if (type == "StationFeed") {
			$.log('获取站点信息');
			request.url = `${request.url}/feed/@${input.idx}/?token=${input.token}`
		}
		//$.log(`🎉 ${$.name}, Get WAQI Request`, `request: ${JSON.stringify(request)}`, "");
		return request
	};

	function GetData(type, request) {
		$.log(`⚠ ${$.name}, Get WAQI Data, type: ${type}`, "");
		return new Promise(resolve => {
			if (type == "NOW" || type == "AQI") {
				$.post(request, (error, response, data) => {
					try {
						if (error) throw new Error(error)
						else if (data) {
							const _data = JSON.parse(data)
							// Get Nearest Observation Station AQI Data
							// https://api.waqi.info/api/feed/@station.uid/now.json
							// https://api.waqi.info/api/feed/@station.uid/aqi.json
							if (type == "NOW" || type == "AQI") {
								if (_data.rxs.status == "ok") {
									if (_data.rxs.obs.some(o => o.status == 'ok')) {
										let i = _data.rxs.obs.findIndex(o => o.status == 'ok')
										let m = _data.rxs.obs.findIndex(o => o.msg)
										//$.obs = _data.rxs.obs[i].msg;
										if (i >= 0 && m >= 0) {
											$.log(`🎉 ${$.name}, GetData:${type}完成`, `i = ${i}, m = ${m}`, '')
											resolve(_data.rxs.obs[i].msg)
										} else if (i < 0 || m < 0) {
											$.log(`❗️ ${$.name}, GetData:${type}失败`, `OBS Get Error`, `i = ${i}, m = ${m}`, `空数据，浏览器访问 https://api.waqi.info/api/feed/@${idx}/aqi.json 查看获取结果`, '')
											resolve(_data.rxs.obs[i].msg)
										}
									} else $.log(`❗️ ${$.name}, GetData:${type}失败`, `OBS Status Error`, `obs.status: ${_data.rxs.obs[0].status}`, `data = ${data}`, '')
								} else $.log(`❗️ ${$.name}, GetData:${type}失败`, `RXS Status Error`, `status: ${_data.rxs.status}`, `data = ${data}`, '')
							}
						} else throw new Error(response);
					} catch (e) {
						$.logErr(`❗️${$.name}, GetData:${type}执行失败`, ` request = ${JSON.stringify(request)}`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
					} finally {
						//$.log(`🚧 ${$.name}, GetData:${type}调试信息`, ` request = ${JSON.stringify(request)}`, `data = ${data}`, '')
						resolve()
					}
				})
			} else {
				$.get(request, (error, response, data) => {
					try {
						if (error) throw new Error(error)
						else if (data) {
							const _data = JSON.parse(data)
							// Search Nearest Observation Station
							// https://api.waqi.info/mapq/nearest/?n=1&geo=1/lat/lng
							// https://api.waqi.info/mapq2/nearest?n=1&geo=1/lat/lng
							if (type == "Nearest") {
								// 空值合并运算符
								var station = _data?.data?.stations?.[0] ?? _data?.d?.[0] ?? null;
								var idx = station?.idx ?? station?.x ?? null;
								var name = station?.name ?? station?.u ?? station?.nna ?? station?.nlo ?? null;
								var aqi = station?.aqi ?? station?.v ?? null;
								var distance = station?.distance ?? station?.d ?? null;
								// var country = station?.cca2 ?? station?.country ?? null;
								// TODO: add debug switch (distance)
								$.log(`🎉 ${$.name}, GetData:${type}完成`, `idx: ${idx}`, `观测站: ${name}`, `AQI: ${aqi}`, `距离: ${distance}`, '')
								resolve({ station, idx })
							}
							// Get Nearest Observation Station Token
							// https://api.waqi.info/api/token/station.uid
							else if (type == "Token") {
								var token = _data.rxs?.obs[0]?.msg?.token ?? "na"
								$.log(`🎉 ${$.name}, GetData:${type}完成`, `token = ${token}`, '')
								resolve(token)
							}
							// Geolocalized Feed
							// https://aqicn.org/json-api/doc/#api-Geolocalized_Feed-GetGeolocFeed
							// https://api.waqi.info/feed/geo::lat;:lng/?token=:token
							else if (type == "CityFeed") {
								var city = (_data.status == 'ok') ? _data?.data : null;
								$.log(`🎉 ${$.name}, GetData:${type}完成`, `idx: ${city?.idx}`, `观测站: ${city?.city?.name}`, `AQI: ${city?.aqi}`, '')
								resolve(city)
							}
							// Station Feed
							// https://api.waqi.info/feed/@station.uid/?token=:token
							else if (type == "StationFeed") {
								var station = (_data.status == 'ok') ? _data?.data : null;
								$.log(`🎉 ${$.name}, GetData:${type}完成`, `idx: ${station?.idx}`, `观测站: ${station?.city?.name}`, `AQI: ${station?.aqi}`, '')
								resolve(station)
							}
						} else throw new Error(response);
					} catch (e) {
						$.logErr(`❗️${$.name}, GetData:${type}执行失败`, ` request = ${JSON.stringify(request)}`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
					} finally {
						//$.log(`🚧 ${$.name}, GetData:${type}调试信息`, ` request = ${JSON.stringify(request)}`, `data = ${data}`, '')
						resolve()
					}
				})
			};
		});
	};
};

/**
 * Get minutely data from "气象在线"
 * @author WordlessEcho
 * @param {Number} lat - latitude
 * @param {Number} lng - longitude
 * @return {Promise<*>} minutely data
 */
function getGridWeatherMinutely(lat, lng) {
	// this API could be considered as unconfigurable ColorfulClouds API
	const request = {
		"url": `https://www.weatherol.cn/api/minute/getPrecipitation?type=forecast&ll=${lng},${lat}`
	};

	return new Promise((resolve) => {
		$.get(request, (error, response, data) => {
			try {
				const _data = JSON.parse(data)

				if (error) {
					throw new Error(error);
				}

				if (_data.status === "ok") {
					resolve(_data);
				} else {
					throw new Error(`API returned the status: ${_data?.status}`);
				}
			} catch (e) {
				$.log(`❗️ ${$.name}, getGridWeatherMinutely执行失败！`,
					`error = ${JSON.stringify(error || e)}, `,
					`response = ${JSON.stringify(response)}, `,
					`data = ${JSON.stringify(data)}`, '');
			} finally {
					$.log(`🎉 ${$.name}, getGridWeatherMinutely执行完成`, '');
			}
		});
	});
};

/**
 * Output Air Quality Data
 * @author VirgilClyne
 * @param {String} apiVersion - Apple Weather API Version
 * @param {Object} now - now weather data from Third-Party
 * @param {Object} obs - observation station data from Third-Party
 * @param {Object} weather - weather data from Apple
 * @param {Object} Settings - Settings config in Box.js
 * @return {Promise<*>}
 */
async function outputAQI(apiVersion, now, obs, weather, Settings) {
	$.log(`⚠️ ${$.name}, ${outputAQI.name}检测`, `AQI data ${apiVersion}`, '');
	const NAME = (apiVersion == "v1") ? "air_quality" : "airQuality";
	const UNIT = (apiVersion == "v1") ? "μg\/m3" : "microgramsPerM3";
	// 创建对象
	if (!weather[NAME]) {
		$.log(`⚠️ ${$.name}, 没有空气质量数据, 创建`, '');
		weather[NAME] = {
			"name": "AirQuality",
			"isSignificant": true, // 重要/置顶
			"pollutants": {},
			"previousDayComparison": "unknown", // 昨日同期对比
			"metadata": {},
		};
	};
	// 创建metadata
	let metadata = {
		"Version": (apiVersion == "v1") ? 1 : 2,
		"Time": (apiVersion == "v1") ? obs?.time?.v ?? now?.t : obs?.time?.iso ?? now?.utime,
		"Expire": 60,
		"Longitude": obs?.city?.geo?.[0] ?? now?.geo?.[0] ?? weather?.currentWeather?.metadata?.longitude ?? weather?.current_observations?.metadata?.longitude,
		"Latitude": obs?.city?.geo?.[1] ?? now?.geo?.[1] ?? weather?.currentWeather?.metadata?.latitude ?? weather?.current_observations?.metadata?.latitude,
		"Language": weather?.[NAME]?.metadata?.language ?? weather?.currentWeather?.metadata?.language ?? weather?.current_observations?.metadata?.language,
		"Name": obs?.attributions?.[0]?.name ?? "WAQI.info",
		//"Name": obs?.attributions?.[obs.attributions.length - 1]?.name,
		"Logo": "https:\/\/waqi.info\/images\/logo.png",
		"Unit": "m",
		"Source": 0, //来自XX读数 0:监测站 1:模型
	};
	weather[NAME].metadata = Metadata(metadata);
	// 固定数据
	weather[NAME].primaryPollutant = switchPollutantsType(obs?.dominentpol ?? now?.pol ?? "unknown");
	weather[NAME].source = obs?.city?.name ?? now?.name ?? now?.u ?? now?.nna ?? now?.nlo ?? "WAQI";
	weather[NAME].learnMoreURL = obs?.city?.url ? `${obs?.city?.url}/${now?.country ?? now?.cca2 ?? weather[NAME].metadata.language}/m`.toLowerCase() : "https://aqicn.org/";
	// 注入数据
	if (now || obs) {
		//条件运算符 & 可选链操作符
		if (apiVersion == "v1") {
			weather[NAME].airQualityIndex = obs?.aqi ?? now?.aqi ?? now?.v;
			weather[NAME].airQualityScale = Settings?.AQI?.Scale || "EPA_NowCast.2201";
			weather[NAME].airQualityCategoryIndex = calculateAQI(obs?.aqi ?? now?.aqi ?? now?.v);
		} else if (apiVersion == "v2") {
			weather[NAME].index = obs?.aqi ?? now?.aqi ?? now?.v;
			weather[NAME].scale = Settings?.AQI?.Scale || "EPA_NowCast.2201";
			weather[NAME].categoryIndex = calculateAQI(obs?.aqi ?? now?.aqi ?? now?.v);
			weather[NAME].sourceType = "station"; //station:监测站 modeled:模型
		}
		//weather[NAME].pollutants.CO = { "name": "CO", "amount": obs?.iaqi?.co?.v || -1, "unit": UNIT };
		//weather[NAME].pollutants.NO = { "name": "NO", "amount": obs?.iaqi?.no?.v || -1, "unit": UNIT };
		//weather[NAME].pollutants.NO2 = { "name": "NO2", "amount": obs?.iaqi?.no2?.v || -1, "unit": UNIT };
		//weather[NAME].pollutants.SO2 = { "name": "SO2", "amount": obs?.iaqi?.so2?.v || -1, "unit": UNIT };
		//weather[NAME].pollutants.OZONE = { "name": "OZONE", "amount": obs?.iaqi?.o3?.v || -1, "unit": UNIT };
		//weather[NAME].pollutants.NOX = { "name": "NOX", "amount": obs?.iaqi?.nox?.v || -1, "unit": UNIT };
		//weather[NAME].pollutants["PM2.5"] = { "name": "PM2.5", "amount": obs?.iaqi?.pm25?.v || -1, "UNIT": UNIT };
		//weather[NAME].pollutants.PM10 = { "name": "PM10", "amount": obs?.iaqi?.pm10?.v || -1, "unit": UNIT };
	} else weather[NAME].metadata.temporarilyUnavailable = true;
	$.log(`🎉 ${$.name}, ${outputAQI.name}完成`, '');
	return weather
};

/**
 * output forecast NextHour Data
 * @author WordlessEcho
 * @param {String} api - Apple API Version
 * @param {Object} minutelyData - minutely data from API
 * @param {Object} weather - weather data from Apple
 * @param {Object} Settings - Settings config in Box.js
 * @return {Promise<*>}
 */
async function outputNextHour(api, providerName, minutelyData, weather, Settings) {
	// iOS weather can only display data in an hour
	const DISPLAYABLE_MINUTES = 60;

	const minutely = minutelyData?.result?.minutely;
	const addMinutes = (date, minutes) => (new Date()).setTime(date.getTime() + (1000 * 60 * minutes));

	const zeroSecondTime = (new Date(minutelyData?.server_time * 1000)).setSeconds(0);
	const nextMinuteWithoutSecond = addMinutes(new Date(zeroSecondTime), 1);
	// use next minute and clean seconds as next hour forecast as start time
	const startTimeIos = convertTime(new Date(nextMinuteWithoutSecond), 'remain', api);

	const SUMMARY_CONDITION_TYPES = { CLEAR: "clear", RAIN: "rain", SNOW: "snow" };

	// https://docs.caiyunapp.com/docs/tables/skycon/
	const getWeatherType = hourly => {
		// enough for us, add more in future?
		const CAIYUN_SKYCON_KEYWORDS = { CLEAR: "CLEAR", RAIN: "RAIN", SNOW: "SNOW" };

		if (hourly?.skycon?.find(
			hourlySkycon => hourlySkycon?.value?.includes(CAIYUN_SKYCON_KEYWORDS.RAIN)
		)) {
			return SUMMARY_CONDITION_TYPES.RAIN;
		} else if (hourly?.skycon?.find(
			hourlySkycon => hourlySkycon?.value?.includes(CAIYUN_SKYCON_KEYWORDS.SNOW)
		)) {
			return SUMMARY_CONDITION_TYPES.SNOW;
		} else {
			// although getWeatherType() is designed for find out rain or snow
			return SUMMARY_CONDITION_TYPES.CLEAR;
		}
	}

	// 4 decimals in API
	const PRECIPITATION_DECIMALS_LENGTH = 10000;
	const PRECIPITATION_LEVEL = {
		NO_RAIN_OR_SNOW: 0,
		LIGHT_RAIN_OR_SNOW: 1,
		MODERATE_RAIN_OR_SNOW: 2,
		HEAVY_RAIN_OR_SNOW: 3,
		STORM_RAIN_OR_SNOW: 4,
	};
	// https://docs.caiyunapp.com/docs/tables/precip
	const RADAR_PRECIPITATION_RANGE = {
		noRainOrSnow: { lower: 0, upper: 0.031 },
		lightRainOrSnow: { lower: 0.031, upper: 0.25 },
		moderateRainOrSnow: { lower: 0.25, upper: 0.35 },
		heavyRainOrSnow: { lower: 0.35, upper: 0.48 },
		stormRainOrSnow: { lower: 0.48, upper: Number.MAX_VALUE },
	};
	// the graph of Apple weather is divided into three parts
	const PRECIP_INTENSITY_PERCEIVED_DIVIDER = {
		beginning: 0, levelBottom: 1, levelMiddle: 2, levelTop: 3,
	};

	const radarToPrecipitationLevel = value => {
		const {
			noRainOrSnow,
			lightRainOrSnow,
			moderateRainOrSnow,
			heavyRainOrSnow,
			_stormRainOrSnow,
		} = RADAR_PRECIPITATION_RANGE;

		if (value < noRainOrSnow.upper) {
			if (value < noRainOrSnow.lower) {
				$.log(`⚠️ ${$.name}, 降水强度不应为负值`, `minutely = ${JSON.stringify(minutely)}`, '');
			}

			return PRECIPITATION_LEVEL.NO_RAIN_OR_SNOW;
		} else if (value < lightRainOrSnow.upper) {
			return PRECIPITATION_LEVEL.LIGHT_RAIN_OR_SNOW;
		} else if (value < moderateRainOrSnow.upper) {
			return PRECIPITATION_LEVEL.MODERATE_RAIN_OR_SNOW;
		} else if (value < heavyRainOrSnow.upper) {
			return PRECIPITATION_LEVEL.HEAVY_RAIN_OR_SNOW;
		} else {
			return PRECIPITATION_LEVEL.STORM_RAIN_OR_SNOW;
		}
	};

	// mapping the standard preciptation level to 3 level standard of Apple
	const radarToApplePrecipitation = value => {
		const {
			noRainOrSnow,
			lightRainOrSnow,
			moderateRainOrSnow,
			heavyRainOrSnow,
			_stormRainOrSnow
		} = RADAR_PRECIPITATION_RANGE;

		switch (radarToPrecipitationLevel(value)) {
			case PRECIPITATION_LEVEL.NO_RAIN_OR_SNOW:
				return PRECIP_INTENSITY_PERCEIVED_DIVIDER.beginning;
			case PRECIPITATION_LEVEL.LIGHT_RAIN_OR_SNOW:
			return (
				// multiple 10000 for precision of calculation
				// base of previous levels + percentage of the value in its level
				PRECIP_INTENSITY_PERCEIVED_DIVIDER.beginning +
				// from the lower of range to value
				(((value - noRainOrSnow.upper) * PRECIPITATION_DECIMALS_LENGTH) /
				// sum of range
					((lightRainOrSnow.upper - lightRainOrSnow.lower) * PRECIPITATION_DECIMALS_LENGTH))
				// then divided them and multiple Apple level range
				// because Apple divided graph into 3 parts, value limitation is 3
				// we omit the "multiple one"
				);
			case PRECIPITATION_LEVEL.MODERATE_RAIN_OR_SNOW:
				return (
					PRECIP_INTENSITY_PERCEIVED_DIVIDER.levelBottom +
					(((value - lightRainOrSnow.upper) * PRECIPITATION_DECIMALS_LENGTH) /
					((moderateRainOrSnow.upper - moderateRainOrSnow.lower) * PRECIPITATION_DECIMALS_LENGTH))
				);
			case PRECIPITATION_LEVEL.HEAVY_RAIN_OR_SNOW:
				return (
					PRECIP_INTENSITY_PERCEIVED_DIVIDER.levelMiddle +
					(((value - moderateRainOrSnow.upper) * PRECIPITATION_DECIMALS_LENGTH) /
					((heavyRainOrSnow.upper - heavyRainOrSnow.lower) * PRECIPITATION_DECIMALS_LENGTH))
				);
			case PRECIPITATION_LEVEL.STORM_RAIN_OR_SNOW:
			// impossible
			default:
				return PRECIP_INTENSITY_PERCEIVED_DIVIDER.levelTop;
		}
	};

	if (minutelyData?.status !== "ok" || minutely?.status !== "ok") {
		$.log(`❗️ ${$.name}, 分钟级降水信息获取失败, `, `minutely = ${JSON.stringify(minutelyData)}`, '');
		return weather;
	}

	$.log(`⚠️ ${$.name}, ${outputNextHour.name}检测, `, `forecastNextHour data ${api}`, '');
  if (!weather.forecastNextHour) {
    $.log(`⚠️ ${$.name}, 没有下一小时降水强度数据，正在创建`, '');
    weather.forecastNextHour = {
      "name": "NextHourForecast",
      "metadata": {},
      "condition": [],
      "summary": [],
      "startTime": "",
      "minutes": [],
    }
  }

	// TODO: split API logic from this function
	weather.forecastNextHour.metadata.expireTime = convertTime(new Date(minutelyData?.server_time * 1000), 'add-1h-floor', api);
	// this API doesn't support language switch
	// replace `zh_CN` to `zh-CN`
	weather.forecastNextHour.metadata.language = minutelyData?.lang?.replace('_', '-') ?? "en-US";
	weather.forecastNextHour.metadata.longitude = minutelyData?.location[1];
	weather.forecastNextHour.metadata.latitude = minutelyData?.location[0];
	weather.forecastNextHour.metadata.providerName = providerName;
	weather.forecastNextHour.metadata.readTime = convertTime(new Date(), 'remain', api);
	// actually we use radar data directly
	// it looks like Apple doesn't care this data
	// weather.forecastNextHour.metadata.units = "m";
	weather.forecastNextHour.metadata.units = "radar";
	weather.forecastNextHour.metadata.version = 2;

	weather.forecastNextHour.startTime = startTimeIos;

	const startTimeDate = new Date(startTimeIos);
	minutely.precipitation_2h.forEach((value, index) => {
		const nextMinuteTime = addMinutes(startTimeDate, index);

		weather.forecastNextHour.minutes.push({
			"startTime": convertTime(new Date(nextMinuteTime), 'remain', api),
			// we only have per half hour probability data
			// `index / 30` => use one probability for 30 minutes
			// `* 100` => convert to percentages
			"precipChance": value > 0 ? parseInt(minutely.probability[parseInt(index / 30)] * 100) : 0,
			// it looks like Apple doesn't care precipIntensity
			"precipIntensity": value,
			"precipIntensityPerceived": radarToApplePrecipitation(value),
		});
	});

	const getConditions = (minutelyData, minutes) => {
		// $.log(`🚧 ${$.name}, 开始设置conditions`, '');
		// TODO: when to add possible
		const ADD_POSSIBLE_UPPER = 0;
		const POSSIBILITY = { POSSIBLE: "possible" };
		const WEATHER_STATUS = {
			// precipIntensityPerceived <= 0
			CLEAR: "clear",
			// precipIntensityPerceived < 1
			DRIZZLE: "drizzle",
			FLURRIES: "flurries",
			// unsupport in ColorfulClouds
			SLEET: "sleet",
			// between
			RAIN: "rain",
			SNOW: "snow",
			// precipIntensityPerceived > 2
			HEAVY_RAIN: "heavy-rain",
			// TODO: untested, check if it is `heavy-snow`
			HEAVY_SNOW: "heavy-snow",
		};
		const TIME_STATUS = {
			CONSTANT: "constant",
			START: "start",
			STOP: "stop"
		};

		const toToken = (isPossible, weatherStatus, timeStatus) => {
			const tokenLeft = `${isPossible ? POSSIBILITY.POSSIBLE + '-' : ''}${weatherStatus.join('-to-')}`;
			if (timeStatus.length > 0) {
				return `${tokenLeft}.${timeStatus.join('-')}`;
			} else {
				return tokenLeft;
			}
		}

		const toWeatherStatus = (precipitation, weatherType) => {
			// although weatherType is not reliable
			// if (weatherType === SUMMARY_CONDITION_TYPES.CLEAR) {
			// 	return WEATHER_STATUS.CLEAR;
			// }

			const level = radarToPrecipitationLevel(precipitation);

			switch (level) {
				case PRECIPITATION_LEVEL.LIGHT_RAIN_OR_SNOW:
					// is there a `drizzle snow`?
					// https://en.wikipedia.org/wiki/Snow_flurry
					return WEATHER_STATUS.DRIZZLE;
				case PRECIPITATION_LEVEL.MODERATE_RAIN_OR_SNOW:
					// fallback to rain if weatherType is rain
					return weatherType === SUMMARY_CONDITION_TYPES.SNOW ?
						WEATHER_STATUS.SNOW :
						WEATHER_STATUS.RAIN;
				case PRECIPITATION_LEVEL.HEAVY_RAIN_OR_SNOW:
				case PRECIPITATION_LEVEL.STORM_RAIN_OR_SNOW:
					return weatherType === SUMMARY_CONDITION_TYPES.SNOW ?
						WEATHER_STATUS.HEAVY_SNOW :
						WEATHER_STATUS.HEAVY_RAIN;
				case PRECIPITATION_LEVEL.NO_RAIN_OR_SNOW:
				default:
					return WEATHER_STATUS.CLEAR;
			}
		};

		const needPossible = precipChance => precipChance < ADD_POSSIBLE_UPPER;

		const weatherType = getWeatherType(minutelyData?.result?.hourly);
		const forecast_keypoint = minutelyData?.result?.forecast_keypoint;
		const description = minutelyData?.result?.minutely?.description;
		const conditions = [];

		// initialize data
		let isPossible = needPossible(minutes[0].precipChance);
		// little trick for origin data
		let weatherStatus = [toWeatherStatus(minutes[0].precipIntensity, weatherType)];
		let timeStatus = [];
		let condition = { startTime: minutes[0].startTime };

		for (let i = 0; i < minutes.length; i++) {
			// Apple weather could only display one hour data
			// drop useless data to avoid display empty graph or rain nearly stop after one hour
			if (i + 1 >= DISPLAYABLE_MINUTES) {
				// compare with last weather status
				if (weatherStatus[weatherStatus.length - 1] !== WEATHER_STATUS.CLEAR) {
					timeStatus = [TIME_STATUS.CONSTANT];
				}

				condition.token = toToken(isPossible, weatherStatus, timeStatus);
				condition.longTemplate = forecast_keypoint ?? description;
				condition.shortTemplate = description;
				condition.parameters = {};

				conditions.push(condition);
				return conditions;
			}

			// this loop will handle previous condition and create the condition for next condition
			// `startAt` for APIv1, `startTime` for APIv2
			// is this too dirty?
			const { startAt, startTime, precipIntensity } = minutes[i];
			if (weatherStatus[weatherStatus.length - 1] !== toWeatherStatus(precipIntensity, weatherType)) {
				switch (toWeatherStatus(precipIntensity, weatherType)) {
					case WEATHER_STATUS.CLEAR:
						condition.endTime = startTime;

						timeStatus.push(TIME_STATUS.STOP);
						condition.token = toToken(isPossible, weatherStatus, timeStatus);
						condition.longTemplate = forecast_keypoint ?? description;
						condition.shortTemplate = description;
						condition.parameters = {};

						// done for the previous condition
						conditions.push(condition);

						// reset the condition
						isPossible = needPossible(minutes[i].precipChance);
						weatherStatus = [toWeatherStatus(precipIntensity, weatherType)];
						timeStatus = [];
						condition = { startTime };
						break;
					case WEATHER_STATUS.HEAVY_RAIN:
					case WEATHER_STATUS.HEAVY_SNOW:
						if (
							weatherStatus[weatherStatus.length - 1] === WEATHER_STATUS.RAIN ||
							weatherStatus[weatherStatus.length - 1] === WEATHER_STATUS.SNOW
						) {
							timeStatus = [TIME_STATUS.CONSTANT];
						} else if (
							// TODO: untested, heavy rain to heavy snow OR heavy snow to heavy rain?
							weatherStatus[weatherStatus.length - 1] === WEATHER_STATUS.HEAVY_RAIN ||
							weatherStatus[weatherStatus.length - 1] === WEATHER_STATUS.HEAVY_SNOW
						) {
							timeStatus = [TIME_STATUS.CONSTANT];
						} else if (weatherStatus[weatherStatus.length - 1] === WEATHER_STATUS.CLEAR) {
							// but how...?
							// change clear to heavy-rain.start or heavy-snow.start
							weatherStatus[weatherStatus.length - 1] = toWeatherStatus(precipIntensity, weatherType);
							timeStatus.push(TIME_STATUS.START);
						} else {
							// for drizzle or something else?
							timeStatus.push(TIME_STATUS.STOP);
						}
	
						condition.token = toToken(isPossible, weatherStatus, timeStatus);
						condition.longTemplate = forecast_keypoint ?? description;
						condition.shortTemplate = description;
						condition.parameters = {
							// maybe useless
							"firstAt": startTime,
						};
	
						conditions.push(condition);

						isPossible = needPossible(minutes[0].precipChance);
						weatherStatus = [toWeatherStatus(precipIntensity, weatherType)];
						timeStatus = [TIME_STATUS.START];
						condition = { startTime };
						break;
					case WEATHER_STATUS.DRIZZLE:
					case WEATHER_STATUS.FLURRIES:
						// unfortunately we cannot distinguish the drizzle without helping of API
						// should we consider light rain as drizzle?

						// begin of an rain
						// if (weatherAndPossiblity.weatherStatus === WEATHER_STATUS.CLEAR) {
						// 	condition.endTime = startTime;

						// 	// change clear to drizzle.start-stop
						// 	weatherAndPossiblity.weatherStatus = WEATHER_STATUS.DRIZZLE;
						// 	timeStatus.push(TIME_STATUS.START);
						// 	timeStatus.push(TIME_STATUS.STOP);

						// 	condition.token = toToken(weatherAndPossiblity, timeStatus);
						// 	condition.longTemplate = forecast_keypoint ?? description;
						// 	condition.shortTemplate = description;
						// 	condition.parameters = {
						// 		// maybe useless
						// 		"firstAt": startTime,
						// 	};
	
						// 	conditions.push(condition);
						// }

						// weatherAndPossiblity.weatherStatus = toWeatherStatus(precipIntensity, weatherType);
						// timeStatus = [TIME_STATUS.START];
						// condition = { startTime };
						// break;
					case WEATHER_STATUS.RAIN:
					case WEATHER_STATUS.SNOW:
					default:
						// if (weatherAndPossiblity.weatherStatus === WEATHER_STATUS.DRIZZLE) {}
						condition.endTime = startTime;

						if (weatherStatus[weatherStatus.length - 1] === WEATHER_STATUS.CLEAR) {
							// change clear to rain.start or snow.start
							weatherStatus[weatherStatus.length - 1] = toWeatherStatus(precipIntensity, weatherType);
							timeStatus.push(TIME_STATUS.START);
						} else if (
							weatherStatus[weatherStatus.length - 1] === WEATHER_STATUS.HEAVY_RAIN ||
							weatherStatus[weatherStatus.length - 1] === WEATHER_STATUS.HEAVY_SNOW
						) {
							// heavy-rain -> heavy-rain-to-rain
							weatherStatus.push(toWeatherStatus(precipIntensity, weatherType));
							timeStatus = [TIME_STATUS.CONSTANT];
						} else if (
							weatherStatus[weatherStatus.length - 1] === WEATHER_STATUS.DRIZZLE ||
							weatherStatus[weatherStatus.length - 1] === WEATHER_STATUS.FLURRIES
						) {
							if (
								toWeatherStatus(precipIntensity, weatherType) !== WEATHER_STATUS.FLURRIES &&
								toWeatherStatus(precipIntensity, weatherType) !== WEATHER_STATUS.DRIZZLE
							) {
								// TODO
								// we don't want begin or end of the rain split into drizzle or flurries
								weatherStatus[weatherStatus.length - 1] = toWeatherStatus(precipIntensity, weatherType);
							} else {
								timeStatus.push(TIME_STATUS.STOP);
							}
						} else if (
							// TODO: untested rain to snow OR snow to rain?
							weatherStatus[weatherStatus.length - 1] === WEATHER_STATUS.RAIN ||
							weatherStatus[weatherStatus.length - 1] === WEATHER_STATUS.SNOW
						) {
							timeStatus = [TIME_STATUS.CONSTANT];
						} else {
							// for drizzle or something else?
							timeStatus = [TIME_STATUS.CONSTANT];
						}

						condition.token = toToken(isPossible, weatherStatus, timeStatus);
						condition.longTemplate = forecast_keypoint ?? description;
						condition.shortTemplate = description;
						condition.parameters = {
							// maybe useless
							"firstAt": startTime,
						};

						conditions.push(condition);

						isPossible = needPossible(minutes[0].precipChance);
						weatherStatus = [toWeatherStatus(precipIntensity, weatherType)];
						timeStatus = [TIME_STATUS.START];
						condition = { startTime };
						break;
				}
			}
		}

		// $.log(`🚧 ${$.name}, result: conditions = ${JSON.stringify(conditions)}`, '');
		return conditions;
	};

	const conditions = getConditions(minutelyData, weather.forecastNextHour.minutes);
	weather.forecastNextHour.condition = weather.forecastNextHour.condition.concat(conditions);

	const getSummary = minutes => {
		// $.log(`🚧 ${$.name}, 开始设置summary`, '');
		const weatherType = getWeatherType(minutelyData?.result?.hourly);
		$.log(`🚧 ${$.name}, weatherType = ${weatherType}`, '');

		const summaries = [];

		// initialize data
		let lastIndex = 0;
		// little trick for origin data
		let isRainOrSnow = minutes[0].precipIntensity > 0;
		let summary = {
			startTime: minutes[0].startTime,
			// I guess data from weatherType is not always reliable
			condition: isRainOrSnow ? weatherType : SUMMARY_CONDITION_TYPES.CLEAR,
		};

		for (let i = 0; i < minutes.length; i++) {
			// clear in an hour
			// Apple weather could only display one hour data
			// drop useless data to avoid display empty graph
			if (i + 1 >= DISPLAYABLE_MINUTES && lastIndex === 0 && !isRainOrSnow) {
				summaries.push(summary);
				return summaries;
			}

			// this loop will handle previous condition and create the condition for next condition
			const { startTime, precipIntensity } = minutes[i];
			if (isRainOrSnow) {
				if (
					// end of rain
					radarToPrecipitationLevel(precipIntensity) === PRECIPITATION_LEVEL.NO_RAIN_OR_SNOW ||
					// constant of rain
					// we always need precipChance and precipIntensity data
					// limit end time in an hour
					// to avoid displaying "raining nearly stop" even if longer than an hour
					i + 1 >= DISPLAYABLE_MINUTES
				) {
					// for find the max value of precipChance and precipIntensity
					const range = minutes.slice(lastIndex, i + 1);

					// we reach the data end but cannot find the end of rain
					if (radarToPrecipitationLevel(precipIntensity) === PRECIPITATION_LEVEL.NO_RAIN_OR_SNOW) {
						summary.endTime = startTime;
					}
					summary.precipChance = Math.max(...range.map(value => value.precipChance));
					// it looks like Apple doesn't care precipIntensity
					summary.precipIntensity = Math.max(...range.map(value => value.precipIntensity));

					summaries.push(summary);

					// reset summary
					isRainOrSnow = !isRainOrSnow;
					lastIndex = i;
					summary = {
						startTime: startTime,
						condition: SUMMARY_CONDITION_TYPES.CLEAR,
					};
				}
			} else {
				if (radarToPrecipitationLevel(precipIntensity) > PRECIPITATION_LEVEL.NO_RAIN_OR_SNOW) {
					summary.endTime = startTime;

					summaries.push(summary);

					isRainOrSnow = !isRainOrSnow;
					lastIndex = i;
					summary = {
						startTime: startTime,
						condition: weatherType,
					};
				}
			}
		}

		// $.log(`🚧 ${$.name}, result: summaries = ${JSON.stringify(summaries)}`, '');
		return summaries;
	};

	const summaries = getSummary(weather.forecastNextHour.minutes);
	weather.forecastNextHour.summary = weather.forecastNextHour.summary.concat(summaries);

	// $.log(`🚧 ${$.name}, forecastNextHour = ${JSON.stringify(weather.forecastNextHour)}`, '');
	$.log(`🎉 ${$.name}, 下一小时降水强度替换完成`, '');
	return weather;
};

/***************** Fuctions *****************/
/**
 * 判断是否在国内
 * https://github.com/wandergis/coordtransform/blob/master/index.js#L134
 * @author wandergis
 * @param {Number} lat - latitude
 * @param {Number} lng - longitude
 * @returns {boolean}
 */
function out_of_china(lng, lat) {
	var lat = +lat;
	var lng = +lng;
	// 纬度 3.86~53.55, 经度 73.66~135.05 
	return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55);
};

/**
 * Switch Pollutants Type
 * https://github.com/Hackl0us/SS-Rule-Snippet/blob/master/Scripts/Surge/weather_aqi_us/iOS15_Weather_AQI_US.js
 * @author Hackl0us
 * @param {String} pollutant - pollutant
 * @returns {String}
 */
function switchPollutantsType(pollutant) {
	const pollutant_map = { "co": "CO", "no": "NO", "no2": "NO2", "so2": "SO2", "o3": "OZONE", "nox": "NOX", "pm25": "PM2.5", "pm10": "PM10" };
	return pollutant_map?.[pollutant] ?? "OTHER";
};

/**
 * Convert Time Format
 * https://github.com/Hackl0us/SS-Rule-Snippet/blob/master/Scripts/Surge/weather_aqi_us/iOS15_Weather_AQI_US.js
 * @author Hackl0us
 * @param {Time} time - time
 * @param {String} action - action
 * @param {String} apiVersion - apiVersion - Apple Weather API Version
 * @returns {String}
 */
function convertTime(time, action, apiVersion) {
	switch (action) {
		case 'remain':
			time.setMilliseconds(0);
			break;
		case 'add-30m-floor':
			time.setMinutes(time.getMinutes() + 30, 0, 0);
			break;
		case 'add-1h-floor':
			time.setHours(time.getHours() + 1);
			time.setMinutes(0, 0, 0);
			break;
		default:
			$.log(`⚠️ ${$.name}, Time Converter, Error`, `time: ${time}`, '');
	}
	if (apiVersion == "v1") {
		let timeString = time.getTime() / 1000;
		return timeString;
	}
	if (apiVersion == "v2") {
		let timeString = time.toISOString().split('.')[0] + 'Z';
		return timeString;
	}
};

/**
 * Calculate Air Quality Level
 * @author VirgilClyne
 * @param {Number} AQI - Air Quality index
 * @returns {Number}
 */
 function calculateAQI(AQI) {
	 if (!AQI) return -1
	 else if (AQI <= 200) return Math.ceil(AQI / 50);
	 else if (AQI <= 300) return 5;
	 else return 6;
};

/**
 * Calculate Air Quality Level
 * https://github.com/Hackl0us/SS-Rule-Snippet/blob/master/Scripts/Surge/weather_aqi_us/iOS15_Weather_AQI_US.js
 * @author Hackl0us
 * @param {Number} aqiIndex - aqiIndex
 * @returns {Number}
 */
function classifyAirQualityLevel(aqiIndex) {
	if (!aqiIndex) return -1;
	else if (aqiIndex >= 0 && aqiIndex <= 50) return 1;
	else if (aqiIndex >= 51 && aqiIndex <= 100) return 2;
	else if (aqiIndex >= 101 && aqiIndex <= 150) return 3;
	else if (aqiIndex >= 151 && aqiIndex <= 200) return 4;
	else if (aqiIndex >= 201 && aqiIndex <= 300) return 5;
	else if (aqiIndex >= 301 && aqiIndex <= 500) return 6;
	else return 6;
};

/**
 * create Metadata
 * @author VirgilClyne
 * @param {Object} input - input
 * @returns {Object}
 */
function Metadata(input = { Version: new Number, Time: new Date, Expire: new Number, Latitude: new Number, Longitude: new Number, Language: "", Name: "", Logo: "", Unit: "", Source: new Number }) {
	let metadata = {
		"version": input.Version,
		"language": input.Language,
		"longitude": input.Longitude,
		"latitude": input.Latitude,
	}
	if (input.Version == 1) {
		metadata.read_time = convertTime(input.Version, new Date(), 0);
		metadata.expire_time = convertTime(input.Version, new Date(input.Time), input.Expire);
		metadata.reported_time = convertTime(input.Version, new Date(input.Time), 0);
		metadata.provider_name = input.Name;
		metadata.provider_logo = input.Logo;
		metadata.data_source = input.Source;
	} else {
		metadata.readTime = convertTime(input.Version, new Date(), 0);
		metadata.expireTime = convertTime(input.Version, new Date(input.Time), input.Expire);
		metadata.reportedTime = convertTime(input.Version, new Date(input.Time), 0);
		metadata.providerName = input.Name;
		metadata.providerLogo = input.Logo;
		metadata.units = input.Unit;
	}
	return metadata

	/**
	 * Convert Time
	 * @author VirgilClyne
	 * @param {String} version - Metadata Version
	 * @param {Time} time - Time
	 * @param {Number} addMinutes - add Minutes Number
	 * @returns {String}
	 */
	function convertTime(version, time, addMinutes) {
		time.setMinutes(time.getMinutes() + addMinutes, 0, 0);
		let timeString = (version == 1) ? time.getTime() / 1000 : time.toISOString().split(".")[0] + "Z"
		return timeString;
	};
};

/***************** Env *****************/
// prettier-ignore
// https://github.com/chavyleung/scripts/blob/master/Env.min.js
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}isStash(){return"undefined"!=typeof $environment&&$environment["stash-version"]}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){if(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:i,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:i,statusCode:r,headers:o,rawBody:h},s.decode(h,this.encoding))},t=>{const{message:i,response:r}=t;e(i,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let i=require("iconv-lite");this.initGotEnv(t);const{url:r,...o}=t;this.got[s](r,o).then(t=>{const{statusCode:s,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:s,statusCode:r,headers:o,rawBody:h},i.decode(h,this.encoding))},t=>{const{message:s,response:r}=t;e(s,r,r&&i.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,i=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":i}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}

// https://github.com/VirgilClyne/iRingo/blob/main/function/URLSearch.min.js
function URLSearch(s){return new class{constructor(s=[]){this.name="urlParams v1.0.0",this.opts=s,this.json={url:{scheme:"",host:"",path:""},params:{}}}parse(s){let t=s.match(/(?<scheme>.+):\/\/(?<host>[^/]+)\/?(?<path>[^?]+)?\??(?<params>.*)?/)?.groups??null;return t?.params&&(t.params=Object.fromEntries(t.params.split("&").map((s=>s.split("="))))),t}stringify(s=this.json){return s?.params?s.scheme+"://"+s.host+"/"+s.path+"?"+Object.entries(s.params).map((s=>s.join("="))).join("&"):s.scheme+"://"+s.host+"/"+s.path}}(s)}
