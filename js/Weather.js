/*
README:https://github.com/VirgilClyne/iRingo
*/

const $ = new Env("Apple Weather v3.2.9");
const URL = new URLs();
const DataBase = {
	"Weather":{"Switch":true,"NextHour":{"Switch":true,"Mode":"www.weatherol.cn","HTTPHeaders":{"Content-Type":"application/x-www-form-urlencoded","User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 15_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1"},"ColorfulClouds":{"Auth":null},},"AQI":{"Switch":true,"Mode":"WAQI Public","Location":"Station","Auth":null,"Scale":"EPA_NowCast.2204"},"Map":{"AQI":false}},
	"Siri":{"Switch":true,"CountryCode":"TW","Domains":["web","itunes","app_store","movies","restaurants","maps"],"Functions":["flightutilities","lookup","mail","messages","news","safari","siri","spotlight","visualintelligence"],"Safari_Smart_History":true},
	"Pollutants":{"co":"CO","no":"NO","no2":"NO2","so2":"SO2","o3":"OZONE","nox":"NOX","pm25":"PM2.5","pm10":"PM10","other":"OTHER"}
};
var { url } = $request;
var { body } = $response;

const WEATHER_TYPES = { CLEAR: "clear", RAIN: "rain", SNOW: "snow", SLEET: "sleet" };
const PRECIPITATION_LEVEL = { INVALID: -1, NO: 0, LIGHT: 1, MODERATE: 2, HEAVY: 3, STORM: 4 };

// https://docs.caiyunapp.com/docs/tables/precip
const RADAR_PRECIPITATION_RANGE = {
	NO: { LOWER: 0, UPPER: 0.031 },
	LIGHT: { LOWER: 0.031, UPPER: 0.25 },
	MODERATE: { LOWER: 0.25, UPPER: 0.35 },
	HEAVY: { LOWER: 0.35, UPPER: 0.48 },
	STORM: { LOWER: 0.48, UPPER: Number.MAX_VALUE },
};
const MMPERHR_PRECIPITATION_RANGE = {
	NO: { LOWER: 0, UPPER: 0.08 },
	LIGHT: { LOWER: 0.08, UPPER: 3.44 },
	MODERATE: { LOWER: 3.44, UPPER: 11.33 },
	HEAVY: { LOWER: 11.33, UPPER: 51.30 },
	STORM: { LOWER: 51.30, UPPER: Number.MAX_VALUE },
};

const WEATHER_STATUS = {
	// precipIntensityPerceived <= 0
	CLEAR: "clear",

	// precipIntensityPerceived < 1
	DRIZZLE: "drizzle",
	FLURRIES: "flurries",
	SLEET: "sleet",

	// between
	RAIN: "rain",
	SNOW: "snow",

	// precipIntensityPerceived > 2
	HEAVY_RAIN: "heavy-rain",
	// TODO: untested, check if it is `heavy-snow`
	HEAVY_SNOW: "heavy-snow",
};

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
						var { Station, idx } = await WAQI("Nearest", { api: "v1", lat: Params.lat, lng: Params.lng });
						const Token = await WAQI("Token", { idx: idx });
						//var NOW = await WAQI("NOW", { token:Token, idx: idx });
						var AQI = await WAQI("AQI", { token: Token, idx: idx });
					} else if (Settings.AQI.Mode == "WAQI Private") {
						$.log(`🚧 ${$.name}, 工作模式: waqi.info 私有API`, "")
						const Token = Settings.AQI.Auth;
						if (Settings.AQI.Location == "Station") {
							$.log(`🚧 ${$.name}, 定位精度: 观测站`, "")
							var { Station, idx } = await WAQI("Nearest", { api: "v1", lat: Params.lat, lng: Params.lng });
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
			if (
				url.params?.dataSets?.includes("forecastNextHour") ||
				url.params?.include?.includes("next_hour_forecast")
			) {
				$.log(
					`🚧 ${$.name}, 下小时降水强度, ` +
					`providerName = ${
						data?.forecastNextHour?.providerName ?? data?.next_hour?.provider_name
					}`, ""
				);

				if (!(data?.forecastNextHour?.metadata?.providerName || data?.next_hour?.provider_name)) {
					const NEXT_HOUR = (Params.ver === "v1") ? "next_hour" : "forecastNextHour";
					if (Settings.NextHour?.Mode === "api.caiyunapp.com") {
						const CC_API_VERSION = "v2.6";
						const token = Settings.NextHour?.ColorfulClouds?.Auth;
						const languageWithReigon = Params.language;

						if (token) {
							// No official name for Japanese
							let providerName = "ColorfulClouds";
							if (/zh-(Hans|CN)/.test(languageWithReigon)) {
								providerName = "彩云天气";
							} else if (/zh-(Hant|HK|TW)/.test(languageWithReigon)) {
								providerName = "彩雲天氣";
							}

							const weatherData = await colorfulClouds(
								Settings.NextHour?.HTTPHeaders,
								CC_API_VERSION,
								token,
								{ latitude: Params.lat, longitude: Params.lng },
								// get hourly.skycon data to detect the weather type
								"weather",
								// unit for calculate precipitations
								// https://docs.caiyunapp.com/docs/tables/precip
								{ "unit": "metric:v2", "lang": toColorfulCloudsLang(languageWithReigon) },
							);

							// no data for current location, skip
							if (
								weatherData &&
								weatherData?.result?.minutely?.datasource &&
								weatherData.result.minutely.datasource !== "gfs"
							) {
								data[NEXT_HOUR] = await outputNextHour(
									Params.ver,
									colorfulCloudsToNextHour(
										providerName,
										weatherData.result?.hourly?.skycon,
										weatherData,
									),
									null,
								);
							}
						}
					} else {
						const providerName = "气象在线";
						const weatherData = await weatherOl(
              Settings.NextHour?.HTTPHeaders,
              "forecast",
              { latitude: Params.lat, longitude: Params.lng },
            );

						// no data for current location, skip
						if (
							weatherData &&
							weatherData?.result?.minutely?.datasource &&
							weatherData.result.minutely.datasource !== "gfs"
						) {
							data[NEXT_HOUR] = await outputNextHour(
								Params.ver,
								colorfulCloudsToNextHour(
									providerName,
									weatherData.result?.hourly?.skycon,
									weatherData,
								),
								null,
							);
						}
					}

					if (!(
						data?.forecastNextHour?.metadata?.providerName ||
						data?.next_hour?.provider_name
					)) {
						$.log(`🚧 ${$.name}, 没有找到合适的API, 跳过`, "");
					}
				} else {
					//$.log(`🚧 ${$.name}, data = ${JSON.stringify(data?.forecastNextHour ?? data?.next_hour)}`, "");
					$.log(`🎉 ${$.name}, 已有下一小时降水强度信息, 跳过`, "");
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
	Settings.NextHour.HTTPHeaders = typeof Settings.NextHour?.HTTPHeaders === "string" ||
		Settings.NextHour?.HTTPHeaders instanceof String ?
			JSON.parse(Settings.NextHour.HTTPHeaders) : database.Weather.NextHour.HTTPHeaders // BoxJs字符串转Object
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
	//$.log(`🚧 ${$.name}, WAQI`, `output: ${JSON.stringify(output)}`, "");
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
								$.log(`🎉 ${$.name}, GetData:${type}完成`, `idx: ${idx}`, `观测站: ${name}`, `AQI: ${aqi}`, '')
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
 * Get data from "气象在线"
 * https://docs.caiyunapp.com/docs/v2.2/intro
 * https://open.caiyunapp.com/%E9%80%9A%E7%94%A8%E9%A2%84%E6%8A%A5%E6%8E%A5%E5%8F%A3/v2.2
 * @author VirgilClyne
 * @author WordlessEcho
 * @param {Object} headers - HTTP headers
 * @param {string} type - `forecast` or `realtime`
 * @param {Object} location - { latitude, longitude }
 * @return {Promise<*>} data from "气象在线"
 */
 function weatherOl(
	headers = {
		"Content-Type": "application/x-www-form-urlencoded",
		"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_1_1 like Mac OS X) " +
			"AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1",
	},
	type,
	location,
) {
	// this API could be considered as unconfigurable ColorfulClouds API
	const request = {
		"headers": headers,
		"url": "https://www.weatherol.cn/api/minute/getPrecipitation" +
			`?type=${type}` +
			`&ll=${location.longitude},${location.latitude}`,
	};

	return new Promise((resolve) => {
		$.get(request, (error, response, data) => {
			try {
				const _data = JSON.parse(data)

				if (error) {
					throw new Error(error);
				}

				if (_data?.status === "ok") {
					$.log(`🎉 ${$.name}, ${weatherOl.name}: 获取完成`, '');
					resolve(_data);
				} else {
					$.logErr(
						`❗️ ${$.name}, ${weatherOl.name}: API返回失败, `,
						`status = ${_data?.status}, `, ''
					);

					throw new Error(
						_data?.error ??
						`API returned status: ${_data?.status}` ??
						"Failed to request www.weatherol.cn"
					);
				}
			} catch (e) {
				$.logErr(
					`❗️ ${$.name}, ${weatherOl.name}执行失败！`,
					`error = ${error || e}, `,
					`response = ${JSON.stringify(response)}, `,
					`data = ${JSON.stringify(data)}`, ''
				);
			} finally {
				// $.log(
				// 	`🚧 ${$.name}, ${weatherOl.name}: 调试信息 `,
				//   `request = ${JSON.stringify(request)}, `,
				//   `data = ${data}`, ''
				// );
				resolve();
			}
		});
	});
};

/**
 * get data from ColorfulClouds
 * https://docs.caiyunapp.com/docs/intro/
 * @author WordlessEcho
 * @author shindgewongxj
 * @param {Object} headers - HTTP headers
 * @param {string} apiVersion - ColorfulClouds API version
 * @param {string} token - token for ColorfulClouds API
 * @param {Object} location - { latitude, longitude }
 * @param {Object} parameters - parameters pass to URL
 * @return {Promise<*>} data from ColorfulClouds
 */
async function colorfulClouds(
	headers = {
		"Content-Type": "application/x-www-form-urlencoded",
		"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_1_1 like Mac OS X) " +
			"AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1",
	},
	apiVersion,
	token,
	location,
	path = "weather",
	parameters = { "alert": true, "dailysteps": 1, "hourlysteps": 24 },
) {
	$.log(`🚧 ${$.name}, 正在使用彩云天气 API`, "");

	const parametersArray = [];
	for (const [key, value] of Object.entries(parameters)) {
		parametersArray.push(key + '=' + value);
	}

	// Build request
	const request = {
		"headers": headers,
		"url": `https://api.caiyunapp.com/${apiVersion}/${token}/` +
			`${location.longitude},${location.latitude}/` +
			// https://docs.caiyunapp.com/docs/weather/
			`${path}` +
			`${parametersArray.length > 0 ? '?' + parametersArray.join('&') : ''}`,
	};

  // $.log(`🚧 ${$.name}, request = ${JSON.stringify(request)}`, "");

	// API Document
	// https://docs.caiyunapp.com/docs/introreturn
	return new Promise(resolve => {
		$.get(request, (error, response, data) => {
			try {
				const _data = JSON.parse(data);

				if (error) {
					throw new Error(error);
				}
				
				if (_data?.status === "ok") {
					$.log(`🎉 ${$.name}, ${colorfulClouds.name}: 获取完成`, '');
					resolve(_data);
				} else {
					$.logErr(
						`❗️ ${$.name}, ${colorfulClouds.name}: API返回失败, `,
						`status = ${_data?.status}, `, ''
					);

					throw new Error(
						_data?.error ??
						`API returned status: ${_data?.status}` ??
						"Failed to request api.caiyunapp.com"
					);
				}
			} catch (e) {
				$.logErr(
					`❗️${$.name}, ${colorfulClouds.name}: 无法获取数据 `,
					`request = ${JSON.stringify(request)}, `,
					`error = ${error || e}, `,
					`response = ${JSON.stringify(response)}, `,
					`data = ${JSON.stringify(data)}`, ''
				);
			} finally {
				// $.log(
				// 	`🚧 ${$.name}, ${colorfulClouds.name}: 调试信息 `,
				//   `request = ${JSON.stringify(request)}, `,
				//   `data = ${data}`, ''
				// );
				resolve();
			}
		});
	});
}

/**
 * differ rain or snow from ColorfulClouds hourly skycons
 * https://docs.caiyunapp.com/docs/tables/skycon/
 * @author WordlessEcho
 * @param {Array} skycons - skycon array from ColorfulClouds
 * @return {string} one of WEATHER_TYPES
 */
 function getCcWeatherType(skycons) {
	// enough for us
	const SKY_CONDITION_KEYWORDS = { CLEAR: "CLEAR", RAIN: "RAIN", SNOW: "SNOW" };
	const skyCondition = skycons?.map(skycon => skycon.value)?.find(condition =>
		condition.includes(SKY_CONDITION_KEYWORDS.RAIN) ||
		condition.includes(SKY_CONDITION_KEYWORDS.SNOW)
	);

	if (!skyCondition) {
		// although this function is designed for find out rain or snow
		return WEATHER_TYPES.CLEAR;
	} else {
		if (skyCondition.includes(SKY_CONDITION_KEYWORDS.SNOW)) {
			return WEATHER_TYPES.SNOW;
		} else {
			return WEATHER_TYPES.RAIN;
		}
	}
};

/**
 * Covert data from ColorfulClouds to NextHour object
 * @author WordlessEcho
 * @param {Object} dataWithMinutely - data with minutely
 * @param {Array} hourlySkycons - skycon array in hourly
 * @return {Object} object for `outputNextHour()`
 */
 function colorfulCloudsToNextHour(providerName, hourlySkycons, dataWithMinutely) {
	const SUPPORTED_APIS = [ 2 ];
	// words that used to insert into description
	const AFTER = {
		"zh_CN": "再过",
		"zh_TW": "再過",
		"ja": "その後",
		"en_US": "after that",
		// ColorfulClouds seems not prefer to display multiple times in en_GB
		"en_GB": "after that",
	};
	// splitors for description
	const SPLITORS = {
		"en_US": ["but ", "and "],
		"en_GB": ["but ", "and "],
		"zh_CN": ["，"],
		"zh_TW": ["，"],
		"ja": ["、"],
	};

	// version from API is beginning with `v`
	function getMajorVersion(apiVersion) { return parseInt(apiVersion.slice(1)) };

	const apiVersion = dataWithMinutely?.api_version;
	const majorVersion = getMajorVersion(apiVersion);
	if (!SUPPORTED_APIS.includes(majorVersion)) {
		$.logErr(
			`❗️${$.name}, ${colorfulCloudsToNextHour.name}: 不支持此版本的API, `,
			`api_version = ${apiVersion}`, ''
		);
		throw new Error(`Unsupported API version ${apiVersion}`);
	}

	// the unit of server_time is second
	const serverTime = parseInt(dataWithMinutely?.server_time);
	const serverTimestamp = !isNaN(serverTime) ? serverTime * 1000 : (+ new Date());
	const ccLanguage = dataWithMinutely?.lang;
	// example: replace `zh_CN` to `zh-CN`
	const language = ccLanguage?.replace('_', '-') ?? "en-US";
	const location = {
		latitude: Array.isArray(dataWithMinutely?.location) ? dataWithMinutely.location[0] : -1,
		longitude: Array.isArray(dataWithMinutely?.location) && dataWithMinutely.location.length > 1
			? dataWithMinutely.location[1] : -1,
	}
	const minutely = dataWithMinutely?.result?.minutely;
	const minutelyDescription = minutely?.description;
	const precipitationTwoHr = minutely?.precipitation_2h;
	const probability = minutely?.probability;
	const forecastKeypoint = dataWithMinutely?.result?.forecast_keypoint;

	let unit = "radar";
	let precipStandard = RADAR_PRECIPITATION_RANGE;
	// https://docs.caiyunapp.com/docs/tables/unit/
	switch (dataWithMinutely?.unit) {
		case "SI":
			unit = "metersPerSecond";
			// TODO: find out the standard of this unit
			precipStandard = RADAR_PRECIPITATION_RANGE;
			break;
		case "imperial":
			unit = "inchesPerHour";
			// TODO: find out the standard of this unit
			precipStandard = RADAR_PRECIPITATION_RANGE;
			break;
		case "metric:v2":
			unit = "millimetersPerHour";
			precipStandard = MMPERHR_PRECIPITATION_RANGE;
			break;
		case "metric:v1":
		case "metric":
		default:
			unit = "radar";
			precipStandard = RADAR_PRECIPITATION_RANGE;
			break;
	}

	function toMinutes(standard, weatherType, minutelyDescription, precipitations, probability) {
		if (!Array.isArray(precipitations)) return [];

		// initialze 0 as first bound
		const bounds = [0];
		for (const lastBound of bounds) {
			const precipitationLevel = calculatePL(standard, precipitations[lastBound]);
			// find different precipitation level as next bound
			// this will ignore differences between the light and rain to avoid too many light weather
			const relativeBound = precipitations.slice(lastBound).findIndex(value => {
				if (precipitationLevel < PRECIPITATION_LEVEL.LIGHT) {
					return calculatePL(standard, value) > PRECIPITATION_LEVEL.NO;
				} else if (precipitationLevel > PRECIPITATION_LEVEL.MODERATE) {
					return calculatePL(standard, value) < PRECIPITATION_LEVEL.HEAVY;
				} else {
					return calculatePL(standard, value) < PRECIPITATION_LEVEL.LIGHT ||
						calculatePL(standard, value) > PRECIPITATION_LEVEL.MODERATE;
				}
			});

			if (relativeBound !== -1) {
				bounds.push(lastBound + relativeBound);
			}
		}

		// detect weather change by description
		// ignore clear
		if (Math.max(...precipitations) >= standard.NO.UPPER) {
			const times = minutelyDescription?.match(/\d+/g);
			times?.forEach(timeInString => {
				const time = parseInt(timeInString);

				if (!isNaN(time) && !(bounds.includes(time))) {
					// array start from 0
					bounds.push(time - 1);
				}
			});

			bounds.sort((a, b) => a - b);
		}

		// initialize minutes
		const minutes = [];
		bounds.forEach((bound, index, bounds) => {
			const sameStatusMinutes = precipitations.slice(
				bound,
				// use last index of precipitations if is last bound
				index + 1 < bounds.length ? bounds[index + 1] : precipitations.length - 1,
			);
			const precipitationLevel = calculatePL(standard, Math.max(...sameStatusMinutes));

			sameStatusMinutes.forEach((minute, index) => minutes.push({
				weatherStatus: precipLevelToStatus(weatherType, precipitationLevel),
				precipitation: minute,
				// set chance to zero if clear
				chance: precipitationLevel > PRECIPITATION_LEVEL.NO
					// calculate order, 1 as first index
					// index here is relative to bound, plus bound for real index in precipitations
					// we have only 4 chances per half hour from API
					? parseInt(probability[parseInt((1 + bound + index) / 30)] * 100) : 0
			}));
		});

		return minutes;
	};

	// extract minute times that helpful for Apple to use cache data
	function toDescriptions(isClear, forecastKeypoint, minutelyDescription, language) {
		let longDescription = minutelyDescription ?? forecastKeypoint;
		// match all numbers in descriptions to array
		const parameters = {};

		function getSentenceSplitors(language) {
			switch (language) {
				case "en_GB":
					return SPLITORS.en_GB;
				case "zh_CN":
					return SPLITORS.zh_CN;
				case "zh_TW":
					return SPLITORS.zh_TW;
				case "ja":
					return SPLITORS.ja;
				case "en_US":
				default:
					return SPLITORS.en_US;
			}
		};

		function insertAfterToDescription(language, description) {
			const FIRST_AT = "{firstAt}";
			// split into two part at `{firstAt}`
			const splitedDescriptions = description?.split(FIRST_AT);

			switch (language) {
				case "en_GB":
					// take second part to skip firstAt
					// append `after that` to description
					splitedDescriptions[splitedDescriptions.length - 1] =
						splitedDescriptions[splitedDescriptions.length - 1]
							// remove stopping & later
							// (.*?) will match `*At`
							.replaceAll("} min later", `} min later ${AFTER.en_GB}`);
					break;
				case "zh_CN":
					splitedDescriptions[splitedDescriptions.length - 1] =
						splitedDescriptions[splitedDescriptions.length - 1]
							.replaceAll("直到{", '{');

					splitedDescriptions[splitedDescriptions.length - 1] =
						splitedDescriptions[splitedDescriptions.length - 1]
							.replaceAll("{", `${AFTER.zh_CN}{`);
					break;
				case "zh_TW":
					splitedDescriptions[splitedDescriptions.length - 1] =
						splitedDescriptions[splitedDescriptions.length - 1]
							.replaceAll("直到{", '{');

					splitedDescriptions[splitedDescriptions.length - 1] =
						splitedDescriptions[splitedDescriptions.length - 1]
							.replaceAll("{", `${AFTER.zh_TW}{`);
					break;
				case "ja":
					// Japanese support from ColorfulClouds is broken for sometime
					// https://lolic.at/notice/AJNH316TTSy1fRlOka

					// TODO: I am not familiar for Japanese, contributions welcome
					splitedDescriptions[splitedDescriptions.length - 1] =
						splitedDescriptions[splitedDescriptions.length - 1]
							.replaceAll("{", `${AFTER.ja}{`);
					break;
				case "en_US":
				default:
					splitedDescriptions[splitedDescriptions.length - 1] =
						splitedDescriptions[splitedDescriptions.length - 1]
							.replaceAll("} min later", `} min later ${AFTER.en_US}`);
					break;
			}

			return splitedDescriptions.join(FIRST_AT);
		};

		// https://stackoverflow.com/a/20426113
		// transfer numbers into ordinal numerals
		function stringifyNumber(n) {
			const special = [
				'zeroth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth',
				'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth',
				'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth',
			];
			const deca = ['twent', 'thirt', 'fort', 'fift', 'sixt', 'sevent', 'eight', 'ninet'];

			if (n < 20) return special[n];
			if (n % 10 === 0) return deca[Math.floor(n / 10) - 2] + 'ieth';
			return deca[Math.floor(n / 10) - 2] + 'y-' + special[n % 10];
		};

		const descriptions = [];
		descriptions.push({
			long: longDescription,
			short: forecastKeypoint ?? minutelyDescription,
			parameters,
		});

		if (!isClear) {
			// split sentence by time
			const allTimes = longDescription?.match(/\d+/g);
			allTimes?.forEach(timeInString => {
				const startIndex = longDescription.indexOf(timeInString) + timeInString.length;
				const splitors = getSentenceSplitors(language);

				let splitIndex = 0;
				for (const splitor of splitors) {
					const index = longDescription.indexOf(splitor, startIndex) + splitor.length;

					if (index !== -1 && (splitIndex === 0 || index < splitIndex)) {
						splitIndex = index;
					}
				}

				descriptions.push({
					long: longDescription.slice(splitIndex),
					short: forecastKeypoint ?? minutelyDescription,
					parameters,
				});
			});

			// format description.long and add parameters
			for (const description of descriptions) {
				const times = description.long?.match(/\d+/g);
				times?.forEach((timeInString, index) => {
					const time = parseInt(timeInString);
	
					if (!isNaN(time)) {
						const key = `${stringifyNumber(index + 1)}At`;
	
						description.long = description.long.replace(timeInString, '{' + key + '}');
						// times after {firstAt} is lasting time in Apple Weather
						// and will be displayed as `lasting for {secondAt} - {firstAt} min`
						description.long = insertAfterToDescription(language, description.long);
						description.parameters[key] = time;
					}
				});
			}
		}

		return descriptions;
	};

	return toNextHourObject(
		serverTimestamp,
		language,
		location,
		providerName,
		unit,
		precipStandard,
		toMinutes(
			precipStandard,
			getCcWeatherType(hourlySkycons),
			minutelyDescription,
			precipitationTwoHr,
			probability,
		),
		toDescriptions(
			// display description only rain in one hour
			!(Math.max(...precipitationTwoHr.slice(0, 59) ?? [0]) >= precipStandard.NO.UPPER),
			forecastKeypoint,
			minutelyDescription,
			ccLanguage,
		),
	);
};

/**
 * Produce a object for `outputNextHour()`
 * @author WordlessEcho
 * @param {Number} timestamp - UNIX timestamp when you get data
 * @param {string} language - ISO 3166-1 language tag
 * @param {Object} location - `{ latitude, longitude }`
 * @param {string} providerName - provider name
 * @param {string} unit - example: "mmPerHour"
 * @param {Object} precipStandard - `*_PRECIPITATION_RANGE`
 * @param {Array} minutes - array of `{ weatherStatus: one of WEATHER_STATUS, precipitation,
 * chance: percentage (0 to 100) }`
 * @param {Array} descriptions - array of `{ long: "Rain starting in {firstAt} min",
 * short: "Rain for the next hour", parameters: (can be empty) { "firstAt": minutesNumber } }`
 * @return {Object} object for `outputNextHour()`
 */
function toNextHourObject(
	timestamp = (+ new Date()),
	language,
	location,
	providerName,
	unit,
	precipStandard,
	minutes,
	descriptions,
) {
	// it looks like Apple doesn't care unit

	// description can be more than one and relative to summary
	// but there are too much works to collect different language of templates of Apple Weather
	// I wish Apple could provide description from app but not API
	const nextHourObject =  {
		timestamp,
		language,
		location,
		providerName,
		unit,
		precipStandard,
		minutes,
		descriptions,
	};

	// $.log(
	// 	`⚠️ ${$.name}, ${toNextHourObject.name}: `,
	// 	`nextHourObject = ${JSON.stringify(nextHourObject)}`, ''
	// );

	return nextHourObject;
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
		"Time": (apiVersion == "v1") ? obs?.time?.v ?? now?.t : obs?.time?.iso ?? now?.utime ?? Date(),
		"Expire": 60,
		"Longitude": obs?.city?.geo?.[0] ?? now?.geo?.[0] ?? weather?.currentWeather?.metadata?.longitude ?? weather?.current_observations?.metadata?.longitude,
		"Latitude": obs?.city?.geo?.[1] ?? now?.geo?.[1] ?? weather?.currentWeather?.metadata?.latitude ?? weather?.current_observations?.metadata?.latitude,
		"Language": weather?.[NAME]?.metadata?.language ?? weather?.currentWeather?.metadata?.language ?? weather?.current_observations?.metadata?.language,
		"Name": obs?.attributions?.[0]?.name ?? "WAQI.info",
		//"Name": obs?.attributions?.[obs.attributions.length - 1]?.name,
		"Logo": (apiVersion == "v1") ? "https://waqi.info/images/logo.png" : "https://raw.githubusercontent.com/VirgilClyne/iRingo/main/image/waqi.info.logo.png",
		"Unit": "m",
		"Source": 0, //来自XX读数 0:监测站 1:模型
	};
	weather[NAME].metadata = Metadata(metadata);
	// 固定数据
	weather[NAME].primaryPollutant = DataBase.Pollutants[obs?.dominentpol ?? now?.pol ?? "other"];
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
 * @author VirgilClyne
 * @param {String} apiVersion - Apple Weather API Version
 * @param {Object} nextHourObject - generated by `toNextHourObject()`
 * @param {Object} debugOptions - nullable, debug settings configs in Box.js
 * @return {Promise<*>} a `Promise` that returned edited Apple data
 */
async function outputNextHour(apiVersion, nextHourObject, debugOptions) {
	$.log(`⚠️ ${$.name}, ${outputNextHour.name}检测`, `API: ${apiVersion}`, '');
	// 3 demical places in `precipIntensityPerceived`
	const PERCEIVED_DECIMAL_PLACES = 1000;
	// 2 demical places in `precipIntensity`
	const _INTENSITY_DECIMAL_PLACES = 100;
	// the graph of Apple weather is divided into three parts
	const PERCEIVED_DIVIDERS = { INVALID: -1, BEGINNING: 0, BOTTOM: 1, MIDDLE: 2, TOP: 3, };

	// 创建对象
	const nextHour = {
		"name": "NextHourForecast",
		//"isSignificant": true, // 重要/置顶
		"metadata": {},
		"startTime": "",
		"summary": [],
		"condition": [],
		"minutes": [],
	};

	// 创建metadata
	let metadata = {
		"Version": (apiVersion == "v1") ? 1 : 2,
		"Time": nextHourObject.timestamp,
		"Expire": 15,
		"Longitude": nextHourObject.location.longitude,
		"Latitude": nextHourObject.location.latitude,
		"Language": nextHourObject.language,
		"Name": nextHourObject.providerName,
		// should be no Logo as same as the Apple Weather in nextHour
		"Logo": "https://www.weatherol.cn/images/logo.png",
		"Unit": nextHourObject.units,
		// untested: I guess this is as same as the data_source in AQI
		"Source": 0, //来自XX读数 0:监测站 1:模型
	};
	// 注入数据
	nextHour.metadata = Metadata(metadata);

	// use next minute and set second to zero as start time in next hour forecast
	const startTimestamp = nextHourObject.timestamp + 1000 * 60;
	nextHour.startTime = convertTime(apiVersion, new Date(startTimestamp));
	nextHour.minutes = getMinutes(apiVersion, nextHourObject.minutes, startTimestamp);
	nextHour.condition = getConditions(
		apiVersion,
		nextHourObject.minutes,
		startTimestamp,
		nextHourObject.descriptions,
	);
	nextHour.summary = getSummaries(apiVersion, nextHourObject.minutes, startTimestamp);

	$.log(`🎉 ${$.name}, 下一小时降水强度替换完成`, "");
	return nextHour;

	/***************** Fuctions *****************/
	// mapping the standard preciptation level to 3 level standard of Apple
	function toApplePrecipitation(standard, precipitation) {
		const {
			NO,
			LIGHT,
			MODERATE,
			HEAVY,
		} = standard;

		switch (calculatePL(standard, precipitation)) {
			case PRECIPITATION_LEVEL.INVALID:
				return PERCEIVED_DIVIDERS.INVALID;
			case PRECIPITATION_LEVEL.NO:
				return PERCEIVED_DIVIDERS.BEGINNING;
			case PRECIPITATION_LEVEL.LIGHT:
				return (
					// multiple 1000 (PERCEIVED_DECIMAL_PLACES) for precision of calculation
					// base of previous levels and plus the percentage of value at its level
					PERCEIVED_DIVIDERS.BEGINNING +
					// from the lower of range to the value
					(((precipitation - NO.UPPER) * PERCEIVED_DECIMAL_PLACES) /
						// sum of the range
						((LIGHT.UPPER - LIGHT.LOWER) * PERCEIVED_DECIMAL_PLACES))
					// divided them to get percentage
					// then calculate Apple standard value by percentage
					// because Apple divided graph into 3 parts, value limitation is also 3
					// we omit the "multiple one"
				);
			case PRECIPITATION_LEVEL.MODERATE:
				return (
					PERCEIVED_DIVIDERS.BOTTOM +
					(((precipitation - LIGHT.UPPER) * PERCEIVED_DECIMAL_PLACES) /
						((MODERATE.UPPER - MODERATE.LOWER) * PERCEIVED_DECIMAL_PLACES))
				);
			case PRECIPITATION_LEVEL.HEAVY:
				return (
					PERCEIVED_DIVIDERS.MIDDLE +
					(((precipitation - MODERATE.UPPER) * PERCEIVED_DECIMAL_PLACES) /
						((HEAVY.UPPER - HEAVY.LOWER) * PERCEIVED_DECIMAL_PLACES))
				);
			case PRECIPITATION_LEVEL.STORM:
			default:
				return PERCEIVED_DIVIDERS.TOP;
		}
	};

	function getMinutes(apiVersion, minutesData, startTimestamp) {
		// $.log(`🚧 ${$.name}, 开始设置Minutes`, '');
		const minutes = minutesData.map(({ precipitation, chance }, index) => {
			const minute = {
				"precipIntensity": precipitation,
				"precipChance": chance,
			};

			if (apiVersion == "v1") {
				minute.startAt = convertTime(apiVersion, new Date(startTimestamp), index);
				minute.perceivedIntensity = toApplePrecipitation(
					nextHourObject.precipStandard, precipitation,
				);
			} else {
				minute.startTime = convertTime(apiVersion, new Date(startTimestamp), index);
				minute.precipIntensityPerceived = toApplePrecipitation(
					nextHourObject.precipStandard, precipitation,
				);
			}

			return minute;
		});

		// $.log(`🚧 ${$.name}, minutes = ${JSON.stringify(minutes)}`, '');
		return minutes;
	};

	function getConditions(apiVersion, minutesData, startTimestamp, descriptions) {
		$.log(`🚧 ${$.name}, 开始设置conditions`, "");
		// TODO: when to add possible
		const ADD_POSSIBLE_UPPER = 0;
		const POSSIBILITY = { POSSIBLE: "possible" };
		const TIME_STATUS = {
			CONSTANT: "constant",
			START: "start",
			STOP: "stop"
		};

		function toToken(possibleClear, weatherStatus, timeStatus) {
			const tokenLeft =
				`${possibleClear ? POSSIBILITY.POSSIBLE + '-' : ''}${weatherStatus.join('-to-')}`;

			if (timeStatus.length > 0 && weatherStatus[0] !== WEATHER_STATUS.CLEAR) {
				return `${tokenLeft}.${timeStatus.join('-')}`;
			} else {
				// weatherStatus is clear, no timeStatus needed
				return tokenLeft;
			}
		};

		function needPossible(precipChance) { return precipChance < ADD_POSSIBLE_UPPER };

		// initialize data
		const slicedMinutes = minutesData.slice(0, 59);
		// empty object for loop
		const conditions = [{}];

		let lastBoundIndex = 0;
		let weatherStatus = [slicedMinutes[lastBoundIndex].weatherStatus];

		for (const _condition of conditions) {
			// initialize data
			const index = conditions.length - 1;
			const lastWeather = weatherStatus[weatherStatus.length - 1];
			const minutesForConditions = slicedMinutes.slice(lastBoundIndex);
			const boundIndex = minutesForConditions
				.findIndex(minute => minute.weatherStatus !== lastWeather);

			let timeStatus = [TIME_STATUS.START];
			// set descriptions as more as possible
			const descriptionsIndex = index < descriptions.length ? index : descriptions.length - 1;
			const condition = {
				longTemplate: descriptions[descriptionsIndex].long,
				shortTemplate: descriptions[descriptionsIndex].short,
				parameters: {},
			};
			if (apiVersion !== "v1") {
				condition.startTime = convertTime(apiVersion, new Date(startTimestamp), lastBoundIndex);
			}
			// time provided by nextHourObject is relative of startTimestamp
			for (const [key, value] of Object.entries(descriptions[descriptionsIndex].parameters)) {
				// $.log(
				// 	`🚧 ${$.name}, `,
				// 	`descriptions[${descriptionsIndex}].parameters.${key} = ${value}, `,
				// 	`startTimestamp = ${startTimestamp}, `,
				// 	`new Date(startTimestamp) = ${new Date(startTimestamp)}`, ""
				// );

				condition.parameters[key] = convertTime(apiVersion, new Date(startTimestamp), value);
			};

			if (boundIndex === -1) {
				// cannot find the next bound
				const chance = Math.max(...minutesForConditions.map(minute => minute.chance));
				// $.log(`🚧 ${$.name}, max chance = ${chance}`, '');
				const possibleClear = needPossible(chance);
				timeStatus = [TIME_STATUS.CONSTANT];

				condition.token = toToken(possibleClear, weatherStatus, timeStatus);

				conditions.push(condition);

				// avoid endless loop
				lastBoundIndex = slicedMinutes.length - 1;
				break;
			} else {
				const chance = Math.max(
					...minutesForConditions.slice(0, boundIndex).map(minute => minute.chance)
				);
				// $.log(`🚧 ${$.name}, max chance = ${chance}`, '');
				const possibleClear = needPossible(chance);
				const currentWeather = minutesForConditions[boundIndex].weatherStatus;
				const endTime =
					convertTime(apiVersion, new Date(startTimestamp), lastBoundIndex + boundIndex);

				switch (apiVersion) {
					case "v1":
						condition.validUntil = endTime;
						break;
					case "v2":
					default:
						condition.endTime = endTime;
						break;
				}

				switch (currentWeather) {
					case WEATHER_STATUS.CLEAR:
						timeStatus.push(TIME_STATUS.STOP);
						break;
					// TODO: drizzle & flurries
					case WEATHER_STATUS.DRIZZLE:
					case WEATHER_STATUS.FLURRIES:
					case WEATHER_STATUS.SLEET:
					case WEATHER_STATUS.RAIN:
					case WEATHER_STATUS.SNOW:
					case WEATHER_STATUS.HEAVY_RAIN:
					case WEATHER_STATUS.HEAVY_SNOW:
					default:
						if (lastWeather !== WEATHER_STATUS.CLEAR) {
							timeStatus = [TIME_STATUS.CONSTANT];
						}
						break;
				}

				switch (lastWeather) {
					case WEATHER_STATUS.CLEAR:
						condition.token = toToken(possibleClear, [currentWeather], timeStatus);
						break;
					case WEATHER_STATUS.HEAVY_RAIN:
					case WEATHER_STATUS.HEAVY_SNOW:
						weatherStatus.push(currentWeather);
						// no break as intend
					// TODO: drizzle & flurries
					case WEATHER_STATUS.DRIZZLE:
					case WEATHER_STATUS.FLURRIES:
					case WEATHER_STATUS.SLEET:
					case WEATHER_STATUS.RAIN:
					case WEATHER_STATUS.SNOW:
					default:
						condition.token = toToken(possibleClear, weatherStatus, timeStatus);
						break;
				}

				conditions.push(condition);

				lastBoundIndex += boundIndex;
				weatherStatus = [minutesForConditions[boundIndex].weatherStatus];
			}
		}

		// shift first empty object
		conditions.shift();
		$.log(`🚧 ${$.name}, conditions = ${JSON.stringify(conditions)}`, '');
		return conditions;
	};

	function getSummaries(apiVersion, minutesData, startTimestamp) {
		$.log(`🚧 ${$.name}, 开始设置summary`, "");
		const slicedMinutes = minutesData.slice(0, 59);

		// initialize data
		// empty object for loop
		let summaries = [{}];
		let lastBoundIndex = 0;

		for (const _summary of summaries) {
			// initialize data
			const isClear = slicedMinutes[lastBoundIndex].weatherStatus === WEATHER_STATUS.CLEAR;
			const minutesForSummary = slicedMinutes.slice(lastBoundIndex);
			const boundIndex = minutesForSummary.findIndex(minute =>
				isClear ? minute.weatherStatus !== WEATHER_STATUS.CLEAR
					: minute.weatherStatus === WEATHER_STATUS.CLEAR
			);

			const summary = {
				condition: weatherStatusToType(slicedMinutes[lastBoundIndex].weatherStatus),
			};
			if (apiVersion !== "v1") {
				summary.startTime = convertTime(apiVersion, new Date(startTimestamp), lastBoundIndex);
			}

			if (!isClear) {
				const minutesForNotClear = minutesForSummary.slice(
					0,
					boundIndex === -1 ? slicedMinutes.length - 1 : boundIndex,
				);
				const chance = Math.max(...minutesForNotClear.map(minute => minute.chance));
				const precipitations = minutesForNotClear.map(minute => minute.precipitation);

				switch (apiVersion) {
					case "v1":
						summary.probability = chance;
						summary.maxIntensity = Math.max(...precipitations);
						summary.minIntensity = Math.min(...precipitations);
						break;
					case "v2":
					default:
						summary.precipChance = chance;
						summary.precipIntensity = Math.max(...precipitations);
						break;
				}
			}

			if (boundIndex === -1) {
				summaries.push(summary);

				// avoid endless loop
				lastBoundIndex = slicedMinutes.length - 1;
				break;
			} else {
				const endTime =
					convertTime(apiVersion, new Date(startTimestamp), lastBoundIndex + boundIndex);
				switch (apiVersion) {
					case "v1":
						summary.validUntil = endTime;
					case "v2":
						summary.endTime = endTime;
				}

				summaries.push(summary);

				lastBoundIndex += boundIndex;
			}
		};

		summaries.shift();
		$.log(`🚧 ${$.name}, summaries = ${JSON.stringify(summaries)}`, "");
		return summaries;
	};
};

/***************** Fuctions *****************/
/**
 * Convert Time
 * @author VirgilClyne
 * @param {String} apiVersion - Apple Weather API Version
 * @param {Time} time - Time
 * @param {Number} addMinutes - add Minutes Number
 * @param {Number} addSeconds - add Seconds Number
 * @returns {String}
 */
function convertTime(apiVersion, time, addMinutes = 0, addSeconds = "") {
	time.setMinutes(time.getMinutes() + addMinutes, (addSeconds) ? time.getSeconds() + addSeconds : 0, 0);
	let timeString = (apiVersion == "v1") ? time.getTime() / 1000 : time.toISOString().split(".")[0] + "Z"
	return timeString;
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
 * Calculate Precipitation Level
 * https://docs.caiyunapp.com/docs/tables/precip
 * @author VirgilClyne
 * @author WordlessEcho
 * @param {object} standard - `*_PRECIPITATION_RANGE`
 * @param {Number} pptn - precipitation
 * @returns {Number} one of `PRECIPITATION_LEVEL`
 */
function calculatePL(standard, pptn) {
	const {
		NO,
		LIGHT,
		MODERATE,
		HEAVY,
	} = standard;

	if (typeof pptn !== "number") return PRECIPITATION_LEVEL.INVALID;
	else if (pptn < NO.UPPER) return PRECIPITATION_LEVEL.NO;
	else if (pptn < LIGHT.UPPER) return PRECIPITATION_LEVEL.LIGHT;
	else if (pptn < MODERATE.UPPER) return PRECIPITATION_LEVEL.MODERATE;
	else if (pptn < HEAVY.UPPER) return PRECIPITATION_LEVEL.HEAVY;
	else return PRECIPITATION_LEVEL.STORM;
};

/**
 * Convert PRECIPITATION_LEVEL to WEATHER_TYPES
 * @author WordlessEcho
 * @param {string} weatherType - one of `WEATHER_TYPES`
 * @param {Number} precipitationLevel - one of `PRECIPITATION_LEVEL`
 * @returns {string} one of `WEATHER_STATUS`
 */
function precipLevelToStatus(weatherType, precipitationLevel) {
	const {
		INVALID,
		NO,
		LIGHT,
		MODERATE,
		HEAVY,
		STORM,
	} = PRECIPITATION_LEVEL;

	if (
		weatherType === WEATHER_TYPES.CLEAR ||
		precipitationLevel === INVALID ||
		precipitationLevel === NO
	) {
		return WEATHER_STATUS.CLEAR;
	}

	switch (precipitationLevel) {
		case LIGHT:
			return weatherType === WEATHER_TYPES.RAIN ? WEATHER_STATUS.DRIZZLE : WEATHER_STATUS.FLURRIES;
		case MODERATE:
			return weatherType === WEATHER_TYPES.RAIN ? WEATHER_STATUS.RAIN : WEATHER_STATUS.SNOW;
		case HEAVY:
		case STORM:
			return weatherType === WEATHER_TYPES.RAIN
				? WEATHER_STATUS.HEAVY_RAIN : WEATHER_STATUS.HEAVY_SNOW;
		default:
			$.logErr(
				`❗️${$.name}, unexpeted precipitation level, `,
				`precipitationLevel = ${precipitationLevel}`
			);
			return WEATHER_STATUS.CLEAR;
	}
};

/**
 * Convert WEATHER_STATUS to WEATHER_TYPES
 * @author WordlessEcho
 * @param {string} weatherStatus - one of `WEATHER_STATUS`
 * @returns {string} one of `WEATHER_TYPES`
 */
function weatherStatusToType(weatherStatus) {
	const {
		CLEAR,
		DRIZZLE,
		FLURRIES,
		SLEET,
		RAIN,
		SNOW,
		HEAVY_RAIN,
		HEAVY_SNOW,
	} = WEATHER_STATUS;

	switch (weatherStatus) {
		case CLEAR:
			return WEATHER_TYPES.CLEAR;
		case SLEET:
			return WEATHER_TYPES.SLEET;
		case FLURRIES:
		case SNOW:
		case HEAVY_SNOW:
			return WEATHER_TYPES.SNOW;
		case DRIZZLE:
		case RAIN:
		case HEAVY_RAIN:
		default:
			return WEATHER_TYPES.RAIN;
	}
};

/**
 * create Metadata
 * @author VirgilClyne
 * @param {Object} input - input
 * @returns {Object}
 */
function Metadata(input = { "Version": new Number, "Time": new Date, "Expire": new Number, "Report": true, "Latitude": new Number, "Longitude": new Number, "Language": "", "Name": "", "Logo": "", "Unit": "", "Source": new Number }) {
	let metadata = {
		"version": input.Version,
		"language": input.Language,
		"longitude": input.Longitude,
		"latitude": input.Latitude,
	}
	if (input.Version == 1) {
		metadata.read_time = convertTime("v"+input.Version, new Date(), 0, 0);
		metadata.expire_time = convertTime("v"+input.Version, new Date(input?.Time), input.Expire, 0);
		if (input.Report) metadata.reported_time = convertTime("v"+input.Version, new Date(input?.Time), 0, 0);
		metadata.provider_name = input.Name;
		if (input.Logo) metadata.provider_logo = input.Logo;
		metadata.data_source = input.Source;
	} else {
		metadata.readTime = convertTime("v"+input.Version, new Date(), 0, 0);
		metadata.expireTime = convertTime("v"+input.Version, new Date(input?.Time), input.Expire, 0);
		if (input.Report) metadata.reportedTime = convertTime("v"+input.Version, new Date(input?.Time), 0, 0);
		metadata.providerName = input.Name;
		if (input.Logo) metadata.providerLogo = input.Logo;
		metadata.units = input.Unit;
	}
	return metadata
};

/**
 * convert iOS language into ColorfulClouds style
 * @author shindgewongxj
 * @author WordlessEcho
 * @param {string} languageWithReigon - "zh-Hans-CA", "en-US", "ja-CA" from Apple URL
 * @returns {string} https://docs.caiyunapp.com/docs/tables/lang
 */
 function toColorfulCloudsLang(languageWithReigon) {
	if (languageWithReigon.includes("en-US")) {
		return "en_US";
	} else if (/zh-(Hans|CN)/.test(languageWithReigon)) {
		return "zh_CN";
	} else if (/zh-(Hant|HK|TW)/.test(languageWithReigon)) {
		return "zh_TW";
	} else if (languageWithReigon.includes("en-GB")) {
		return "en_GB";
	} else if (languageWithReigon.includes("ja")) {
		return "ja";
	} else {
		$.log(
			`⚠ ${$.name}, ColorfulClouds: unsupported language detected, fallback to en_US. `,
			`languageWithReigon = ${languageWithReigon}`, ""
		);
		return "en_US";
	}
};

/***************** Env *****************/
// prettier-ignore
// https://github.com/chavyleung/scripts/blob/master/Env.min.js
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}isStash(){return"undefined"!=typeof $environment&&$environment["stash-version"]}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,a]=i.split("@"),n={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),a=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(a);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){if(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)});else if(this.isQuanX())this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t&&t.error||"UndefinedError"));else if(this.isNode()){let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:i,statusCode:r,headers:o,rawBody:a}=t,n=s.decode(a,this.encoding);e(null,{status:i,statusCode:r,headers:o,rawBody:a,body:n},n)},t=>{const{message:i,response:r}=t;e(i,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t&&t.error||"UndefinedError"));else if(this.isNode()){let i=require("iconv-lite");this.initGotEnv(t);const{url:r,...o}=t;this.got[s](r,o).then(t=>{const{statusCode:s,statusCode:r,headers:o,rawBody:a}=t,n=i.decode(a,this.encoding);e(null,{status:s,statusCode:r,headers:o,rawBody:a,body:n},n)},t=>{const{message:s,response:r}=t;e(s,r,r&&i.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,i=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":i}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),this.isSurge()||this.isQuanX()||this.isLoon()?$done(t):this.isNode()&&process.exit(1)}}(t,e)}

// https://github.com/VirgilClyne/VirgilClyne/blob/main/function/URL/URLs.embedded.min.js
function URLs(s){return new class{constructor(s=[]){this.name="URL v1.0.0",this.opts=s,this.json={url:{scheme:"",host:"",path:""},params:{}}}parse(s){let t=s.match(/(?<scheme>.+):\/\/(?<host>[^/]+)\/?(?<path>[^?]+)?\??(?<params>.*)?/)?.groups??null;return t?.params&&(t.params=Object.fromEntries(t.params.split("&").map((s=>s.split("="))))),t}stringify(s=this.json){return s?.params?s.scheme+"://"+s.host+"/"+s.path+"?"+Object.entries(s.params).map((s=>s.join("="))).join("&"):s.scheme+"://"+s.host+"/"+s.path}}(s)}
