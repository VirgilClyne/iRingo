/*
README:https://github.com/VirgilClyne/iRingo
*/

const $ = new Env("Apple Weather AQI v3.2.0-beta");
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
			$.log(`🚧 ${$.name}, 下小时降水强度 ` +
						`providerName = ${data?.forecastNextHour?.providerName ?? data?.next_hour?.provider_name}`, "");

			if (Params.ver === "v1") {
				$.log(`🚧 ${$.name}, 检测到API版本为${Params.ver}，适配尚处于测试阶段，将输出所有下一小时降水强度信息。`, "");
				$.log(`🚧 ${$.name}, next_hour = ${JSON.stringify(data?.next_hour)}`, "");
			}

			if (
				url.params?.dataSets?.includes("forecastNextHour") ||
				url.params?.include?.includes("next_hour_forecast")
			) {
				if (!(data?.forecastNextHour?.metadata?.providerName || data?.next_hour?.provider_name)) {
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
					$.log(`🚧 ${$.name}, data = ${JSON.stringify(data?.forecastNextHour ?? data?.next_hour)}`, "");
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
 * https://github.com/wandergis/coordtransform/blob/master/index.js#L134
 * 判断是否在国内
 * @param lng
 * @param lat
 * @returns {boolean}
 */
function out_of_china(lng, lat) {
  var lat = +lat;
  var lng = +lng;
  // 纬度 3.86~53.55, 经度 73.66~135.05 
  return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55);
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
 * ColorfulClouds
 * @author WordlessEcho
 * @param {object} headers - HTTP headers
 * @param {Object} input - location & token: { lat, lng, token }
 * @param {Number} timestamp - get old data
 * @return {Promise<*>}
 */
async function ColorfulClouds(
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_1_1 like Mac OS X) " +
                                    "AppleWebKit/605.1.15 (KHTML, like Gecko) " +
                                    "Version/15.1 Mobile/15E148 Safari/604.1",
    },
    // Colorful Clouds example token
    input = { lat: 0, lng: 0, token: "TAkhjf8d1nlSlspN" },
    paramLang = Parameter.language,
    timestamp = null,
) {
    // $.log(`🚧 ${$.name}, input = ${JSON.stringify(input)}`, "");
    // Build request
    const toColorfulCloudsLang = paramLang => {
        if (paramLang.toLowerCase().includes("hant")) {
            return "zh_TW";
        } else if (paramLang.toLowerCase().includes("us")) {
            return "en_US";
        } else if (paramLang.toLowerCase().includes("gb")) {
            return "en_GB";
        } else if (paramLang.toLowerCase().includes("ja")) {
            return "ja";
        } else {
            return "zh_CN";
        }
    };
    
    const request = {
        "url": `https://api.caiyunapp.com/v2.5/` +
                     `${ input.token !== null ? input.token : "TAkhjf8d1nlSlspN" }/` +
                     `${input.lng},${input.lat}/` +
                     // https://docs.caiyunapp.com/docs/tables/unit/
                     `weather?alert=true&dailysteps=1&hourlysteps=24&unit=metric:v2` +
                     `&lang=` + toColorfulCloudsLang(paramLang) +
                     `${ timestamp !== null ? `&begin=${timestamp}` : '' }`,
                    // TODO: detect language
                    //  `&lang=${ navigator.language }`,
        "headers": headers,
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
                } else if (data) {
                    $.log(`🎉 ${$.name}, ColorfulClouds: 获取完成`,
                                `timestamp = ${timestamp}`,
                                `realtime = ${JSON.stringify(_data?.result?.realtime)}`, '');
                    resolve(_data);
                }
            } catch (e) {
                $.logErr(`❗️${$.name}, ColorfulClouds: 无法获取数据 `,
                                 `request = ${JSON.stringify(request)}`,
                                 `error = ${error || e} `,
                                 `response = ${JSON.stringify(response)} `,
                                 `data = ${data}`, '');
            } finally {
                $.log(`🚧 ${$.name}, ColorfulClouds: ${type}调试信息 `,
                            ` request = ${JSON.stringify(request)} `,
                            `data = ${data}`, '');
                resolve();
            }
        });
    });
}

// Output Data
// 
/**
 * Output Air Quality Data
 * @author VirgilClyne
 * @param {String} api - API Version
 * @param {Object} now - minutelyData
 * @param {Object} obs - weather
 * @param {Object} weather - weather
 * @param {Object} Settings - Settings
 * @return {Promise<*>}
 */
async function outputAQI(api, now, obs, weather, Settings) {
	$.log(`⚠️ ${$.name}, ${outputAQI.name}检测`, `AQI data ${api}`, '');
	const AQIname = (api == "v1") ? "air_quality"
		: (api == "v2") ? "airQuality"
			: "airQuality";
	const unit = (api == "v1") ? "μg\/m3"
		: (api == "v2") ? "microgramsPerM3"
			: "microgramsPerM3";
	//创建对象
	if (!weather[`${AQIname}`]) {
		$.log(`⚠️ ${$.name}, 没有空气质量数据, 创建`, '');
		weather[`${AQIname}`] = {
			"isSignificant": true, // 重要/置顶
			"pollutants": {},
			"metadata": {},
			"name": "AirQuality",
		};
		if (api == "v1") {
			weather[`${AQIname}`].metadata.version = 1;
			weather[`${AQIname}`].metadata.data_source = 0; //来自XX读数 0:监测站 1:模型
		}
		else if (api == "v2") {
			weather[`${AQIname}`].metadata.units = "m";
			weather[`${AQIname}`].metadata.version = 2;
			weather[`${AQIname}`].sourceType = "station"; //station:监测站 modeled:模型
		}
	};
	// 注入数据
	//条件运算符 & 可选链操作符
	weather[`${AQIname}`].source = obs?.city?.name ?? now?.name ?? now?.u ?? now?.nna ?? now?.nlo;
	weather[`${AQIname}`].learnMoreURL = obs?.city?.url + `/${now?.country ?? now?.cca2}/m`.toLowerCase();
	weather[`${AQIname}`].primaryPollutant = switchPollutantsType(obs?.dominentpol ?? now?.pol);
	weather[`${AQIname}`].pollutants.CO = { "name": "CO", "amount": obs?.iaqi?.co?.v || -1, "unit": unit };
	weather[`${AQIname}`].pollutants.NO = { "name": "NO", "amount": obs?.iaqi?.no?.v || -1, "unit": unit };
	weather[`${AQIname}`].pollutants.NO2 = { "name": "NO2", "amount": obs?.iaqi?.no2?.v || -1, "unit": unit };
	weather[`${AQIname}`].pollutants.SO2 = { "name": "SO2", "amount": obs?.iaqi?.so2?.v || -1, "unit": unit };
	weather[`${AQIname}`].pollutants.OZONE = { "name": "OZONE", "amount": obs?.iaqi?.o3?.v || -1, "unit": unit };
	weather[`${AQIname}`].pollutants.NOX = { "name": "NOX", "amount": obs?.iaqi?.nox?.v || -1, "unit": unit };
	weather[`${AQIname}`].pollutants["PM2.5"] = { "name": "PM2.5", "amount": obs?.iaqi?.pm25?.v || -1, "unit": unit };
	weather[`${AQIname}`].pollutants.PM10 = { "name": "PM10", "amount": obs?.iaqi?.pm10?.v || -1, "unit": unit };
	weather[`${AQIname}`].metadata.longitude = obs?.city?.geo?.[0] ?? now?.geo?.[0];
	weather[`${AQIname}`].metadata.latitude = obs?.city?.geo?.[1] ?? now?.geo?.[1];
	weather[`${AQIname}`].metadata.language = weather?.[`${AQIname}`]?.metadata?.language ?? weather?.currentWeather?.metadata?.language ?? weather?.current_observations?.metadata?.language;
	if (api == "v1") {
		weather.air_quality.airQualityIndex = obs?.aqi ?? now?.aqi ?? now?.v;
		weather.air_quality.airQualityScale = Settings?.AQI?.Scale || "EPA_NowCast.2201";
		weather.air_quality.airQualityCategoryIndex = classifyAirQualityLevel(obs?.aqi ?? now?.aqi ?? now?.v);
		weather.air_quality.metadata.reported_time = convertTime(new Date(obs?.time?.v ?? now?.t), 'remain', api);
		//weather.air_quality.metadata.provider_name = obs?.attributions?.[obs.attributions.length - 1]?.name;
		weather.air_quality.metadata.provider_name = obs?.attributions?.[0]?.name;
		weather.air_quality.metadata.expire_time = convertTime(new Date(obs?.time?.v ?? now?.t), 'add-1h-floor', api);
		weather.air_quality.metadata.provider_logo = "https:\/\/waqi.info\/images\/logo.png";
		weather.air_quality.metadata.read_time = convertTime(new Date(), 'remain', api);
	} else if (api == "v2") {
		weather.airQuality.index = obs?.aqi ?? now?.aqi ?? now?.v;
		weather.airQuality.scale = Settings?.AQI?.Scale || "EPA_NowCast.2201";
		weather.airQuality.categoryIndex = classifyAirQualityLevel(obs?.aqi ?? now?.aqi ?? now?.v);
		weather.airQuality.metadata.providerLogo = "https:\/\/waqi.info\/images\/logo.png";
		//weather.airQuality.metadata.providerName = obs?.attributions?.[obs.attributions.length - 1]?.name;
		weather.airQuality.metadata.providerName = obs?.attributions?.[0]?.name;
		weather.airQuality.metadata.expireTime = convertTime(new Date(obs?.time?.iso ?? now?.utime), 'add-1h-floor', api);
		weather.airQuality.metadata.reportedTime = convertTime(new Date(obs?.time?.iso ?? now?.utime), 'remain', api);
		weather.airQuality.metadata.readTime = convertTime(new Date(), 'remain', api);
	}
	$.log(`🎉 ${$.name}, ${outputAQI.name}完成`, '');
	return weather
};

/**
 * output forecast NextHour Data
 * @author WordlessEcho
 * @param {String} apiVersion - Apple API Version
 * @param {Object} minutelyData - minutely data from API
 * @param {Object} weather - weather data from Apple
 * @param {Object} Settings - Settings config in Box.js
 * @return {Promise<*>}
 */
 async function outputNextHour(apiVersion, providerName, minutelyData, weather, Settings) {
	// iOS weather can only display data in an hour
	const DISPLAYABLE_MINUTES = 60;

	const minutely = minutelyData?.result?.minutely;
	const addMinutes = (date, minutes) => (new Date()).setTime(date.getTime() + (1000 * 60 * minutes));

	const zeroSecondTime = (new Date(minutelyData?.server_time * 1000)).setSeconds(0);
	const nextMinuteWithoutSecond = addMinutes(new Date(zeroSecondTime), 1);
	// use next minute and clean seconds as next hour forecast as start time
	const startTimeIos = convertTime(new Date(nextMinuteWithoutSecond), 'remain', apiVersion);

	const SUMMARY_CONDITION_TYPES = { CLEAR: "clear", RAIN: "rain", SNOW: "snow" };

	const initializeNextHour = apiVersion => {
		switch (apiVersion) {
			case "v1":
				return {
					"name": "NextHourForecast",
					"metadata": {
						"temporarilyUnavailable": true,
					},
					"condition": [],
      		"summary": [],
      		"startTime": "",
      		"minutes": [],
				};
			case "v2":
				return {
					"name": "NextHourForecast",
      		"metadata": {
						"temporarilyUnavailable": true,
					},
      		"condition": [],
      		"summary": [],
      		"startTime": "",
      		"minutes": [],
				};
			default:
				throw new Error(`unsupport api version ${apiVersion}`);
		}
	};

	// https://docs.caiyunapp.com/docs/tables/skycon/
	const getWeatherType = hourly => {
		// enough for us, add more in future?
		const CAIYUN_SKYCON_KEYWORDS = { CLEAR: "CLEAR", RAIN: "RAIN", SNOW: "SNOW" };

		// FOR DEBUG
		if (Settings?.NextHour?.Debug?.Switch) {
			return Settings.NextHour.Debug?.WeatherType ?? "rain";
		}

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

	$.log(`⚠️ ${$.name}, ${outputNextHour.name}检测, `, `forecastNextHour data ${apiVersion}`, '');
	let nextHour;
	switch (apiVersion) {
		case "v1":
			if (!weather.next_hour) {
				$.log(`⚠️ ${$.name}, 没有下一小时降水强度数据，正在创建`, '');
				nextHour = initializeNextHour(apiVersion);
			} else {
				nextHour = weather.next_hour;
			}
			break;
		case "v2":
			if (!weather.forecastNextHour) {
				$.log(`⚠️ ${$.name}, 没有下一小时降水强度数据，正在创建`, '');
				nextHour = initializeNextHour(apiVersion);
			} else {
				nextHour = weather.forecastNextHour;
			}
			break;
		default:
			$.logErr(`❗️ ${$.name}, 不支持此版本的Apple天气，请尝试升级脚本。` +
							 `apiVersion = ${apiVersion}`, '');
			return weather;
	}

	if (minutelyData?.status !== "ok" || minutely?.status !== "ok") {
		$.logErr(`❗️ ${$.name}, 分钟级降水信息获取失败, `, `minutely = ${JSON.stringify(minutelyData)}`, '');
		return weather;
	}

	delete nextHour.metadata.temporarilyUnavailable;

	//
	// handle metadata
	//
	// TODO: split API logic from this function
	// this API doesn't support language switch
	// replace `zh_CN` to `zh-CN`
	nextHour.metadata.language = minutelyData?.lang?.replace('_', '-') ?? "en-US";
	nextHour.metadata.longitude = minutelyData?.location[1];
	nextHour.metadata.latitude = minutelyData?.location[0];

	nextHour.startTime = startTimeIos;

	switch (apiVersion) {
		case "v1":
			nextHour.metadata.read_time = convertTime(new Date(), 'remain', apiVersion);
			nextHour.metadata.expire_time = convertTime(new Date(), 'add-1h-floor', apiVersion);
			nextHour.metadata.version = 1;
			nextHour.metadata.provider_name = providerName;
			// untested: I guess is the same as AQI data_source
			nextHour.metadata.data_source = 0;
			break;
		case "v2":
		default:
			nextHour.metadata.expireTime =
				convertTime(new Date(minutelyData?.server_time * 1000), 'add-1h-floor', apiVersion);
			nextHour.metadata.providerName = providerName;
			nextHour.metadata.readTime = convertTime(new Date(), 'remain', apiVersion);
			// actually we use radar data directly
			// it looks like Apple doesn't care this data
			// nextHour.metadata.units = "m";
			nextHour.metadata.units = "radar";
			nextHour.metadata.version = 2;
			break;
	}

	//
	// handle minutes
	//
	const startTimeDate = new Date(startTimeIos);
	// FOR DEBUG
	const debugChance = parseInt(Settings?.NextHour?.Debug?.Chance) ?? 100;
	const debugDelay = parseInt(Settings?.NextHour?.Debug?.Delay) ?? 0;
	const debugPrecipLower = parseFloat(Settings?.NextHour?.Debug?.PrecipLower) ?? 0.031;
	const debugPrecipUpper = parseFloat(Settings?.NextHour?.Debug?.PrecipUpper) ?? 0.48;
	const debugIntensityLower = parseFloat(Settings?.NextHour?.Debug?.IntensityLower) ?? 0;
	const debugIntensityUpper = parseFloat(Settings?.NextHour?.Debug?.IntensityUpper) ?? 4;
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values
	function getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min)) + min; //不含最大值，含最小值
	}
	const getRandomPrecip = () => getRandomInt(debugPrecipLower * 10000, debugPrecipUpper * 10000) / 10000;
	const getRandomIntensity = () => getRandomInt(debugIntensityLower * 1000, debugIntensityUpper * 1000) / 1000;

	if (Settings?.NextHour?.Debug?.Switch) {
		$.log(`⚠️ ${$.name}, debug模式已开启`, '');
		$.log(`⚠️ ${$.name}, debug: WeatherType = ${Settings.NextHour.Debug?.WeatherType}, ` +
					`Chance = ${Settings.NextHour.Debug?.Chance}, ` +
					`Delay = ${Settings.NextHour.Debug?.Delay}, ` +
					`PrecipLower = ${Settings.NextHour.Debug?.PrecipLower}, ` +
					`PrecipUpper = ${Settings.NextHour.Debug?.PrecipUpper}, ` +
					`IntensityLower = ${Settings.NextHour.Debug?.IntensityLower}, ` +
					`IntensityUpper = ${Settings.NextHour.Debug?.IntensityUpper}, ` +
					`parsed Chance = ${debugChance}, ` +
					`parsed Delay = ${debugDelay}, ` +
					`parsed PrecipLower = ${debugIntensityLower}, ` +
					`parsed PrecipUpper = ${debugIntensityUpper}, ` +
					`parsed IntensityLower = ${debugIntensityLower}, ` +
					`parsed IntensityUpper = ${debugIntensityUpper}`, "");
	}

	minutely.precipitation_2h.forEach((value, index) => {
		const nextMinuteTime = addMinutes(startTimeDate, index);
		const minute = {
			// it looks like Apple doesn't care precipIntensity
			"precipIntensity": !Settings?.NextHour?.Debug?.Switch ? value : getRandomPrecip(),
		};

		// FOR DEBUG
		if (Settings?.NextHour?.Debug?.Switch) {
			minute.precipChance = debugChance ?? 100;
		} else {
			minute.precipChance = value > 0 ? parseInt(minutely.probability[parseInt(index / 30)] * 100) : 0;
		}

		switch (apiVersion) {
			case "v1":
				minute.startAt = convertTime(new Date(nextMinuteTime), 'remain', apiVersion);
				// TODO: find out the limit of perceivedIntensity
				// FOR DEBUG
				if (Settings?.NextHour?.Debug?.Switch) {
					if (index < debugDelay) {
						minute.perceivedIntensity = 0;
					} else {
						minute.perceivedIntensity = getRandomIntensity();
					}
				} else {
					minute.perceivedIntensity = radarToApplePrecipitation(value);
				}
				break;
			case "v2":
			default:
				minute.startTime = convertTime(new Date(nextMinuteTime), 'remain', apiVersion);
				// FOR DEBUG
				if (Settings?.NextHour?.Debug?.Switch) {
					if (index < debugDelay) {
						minute.precipIntensityPerceived = 0;
					} else {
						minute.precipIntensityPerceived = getRandomIntensity();
					}
				} else {
					minute.precipIntensityPerceived = radarToApplePrecipitation(value);
				}
				break;
		}

		nextHour.minutes.push(minute);
	});

	const getConditions = (apiVersion, minutelyData, minutes) => {
		// $.log(`🚧 ${$.name}, 开始设置conditions`, '');
		// TODO: when to add possible
		const ADD_POSSIBLE_UPPER = 0;
		const POSSIBILITY = { POSSIBLE: "possible" };
		const WEATHER_STATUS = {
			CLEAR: "clear",
			// precipIntensityPerceived < 1
			DRIZZLE: "drizzle",
			RAIN: "rain",
			// precipIntensityPerceived > 2
			HEAVY_RAIN: "heavy-rain-to-rain",
			// TODO: untested, check if it is `snow`
			SNOW: "snow",
			HEAVY_SNOW: "heavy-snow-to-snow",
		};
		const TIME_STATUS = {
			CONSTANT: "constant",
			START: "start",
			STOP: "stop"
		};

		const toToken = (weatherAndPossiblity, timeStatus) => {
			const { possibility, weatherStatus } = weatherAndPossiblity;

			const tokenLeft = possibility ? `${possibility}-${weatherStatus}` : `${weatherStatus}`;
			const tokenRight = timeStatus.join('-');

			return timeStatus.length > 0 ? `${tokenLeft}.${tokenRight}` : `${tokenLeft}`;
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
		const weatherAndPossiblity = {
			possibility: needPossible(minutes[0].precipChance) ? POSSIBILITY.POSSIBLE : null,
			// little trick for origin data
			weatherStatus: toWeatherStatus(minutes[0].precipIntensity, weatherType),
		};
		let timeStatus = [];
		let condition = {};

		switch (apiVersion) {
			case "v1":
				break;
			case "v2":
			default:
				condition.startTime = minutes[0].startTime;
				break;
		}

		for (let i = 0; i < minutes.length; i++) {
			// Apple weather could only display one hour data
			// drop useless data to avoid display empty graph or rain nearly stop after one hour
			if (i + 1 >= DISPLAYABLE_MINUTES) {
				if (weatherAndPossiblity.weatherStatus !== WEATHER_STATUS.CLEAR) {
					timeStatus = [TIME_STATUS.CONSTANT];
				}

				condition.token = toToken(weatherAndPossiblity, timeStatus);
				condition.longTemplate = forecast_keypoint ?? description;
				condition.shortTemplate = description;
				condition.parameters = {};

				conditions.push(condition);

				$.log(`🚧 ${$.name}, conditions = ${JSON.stringify(conditions)}`, '');
				return conditions;
			}

			// this loop will handle previous condition and create the condition for next condition
			// `startAt` for APIv1, `startTime` for APIv2
			// is this too dirty?
			const { startAt, startTime, precipIntensity } = minutes[i];
			if (weatherAndPossiblity.weatherStatus !== toWeatherStatus(precipIntensity, weatherType)) {
				switch (toWeatherStatus(precipIntensity, weatherType)) {
					case WEATHER_STATUS.CLEAR:
						switch (apiVersion) {
							case "v1":
								condition.validUntil = startAt;
								break;
							case "v2":
							default:
								condition.endTime = startTime;
								break;
						}

						timeStatus.push(TIME_STATUS.STOP);
						condition.token = toToken(weatherAndPossiblity, timeStatus);
						condition.longTemplate = forecast_keypoint ?? description;
						condition.shortTemplate = description;
						condition.parameters = {};

						// done for the previous condition
						conditions.push(condition);

						// reset the condition
						weatherAndPossiblity.possibility =
							needPossible(minutes[0].precipChance) ? POSSIBILITY.POSSIBLE : null;
						weatherAndPossiblity.weatherStatus = toWeatherStatus(precipIntensity, weatherType);
						timeStatus = [];
						switch (apiVersion) {
							case "v1":
								condition = {};
								break;
							case "v2":
							default:
								condition = { startTime };
								break;
						}
						break;
					case WEATHER_STATUS.HEAVY_RAIN:
					case WEATHER_STATUS.HEAVY_SNOW:
						if (
							weatherAndPossiblity.weatherStatus === WEATHER_STATUS.RAIN ||
							weatherAndPossiblity.weatherStatus === WEATHER_STATUS.SNOW ||
							// TODO: untested, heavy rain to heavy snow OR heavy snow to heavy rain?
							weatherAndPossiblity.weatherStatus === WEATHER_STATUS.HEAVY_RAIN ||
							weatherAndPossiblity.weatherStatus === WEATHER_STATUS.HEAVY_SNOW
						) {
							timeStatus = [TIME_STATUS.CONSTANT];
						} else if (weatherAndPossiblity.weatherStatus === WEATHER_STATUS.CLEAR) {
							// but how...?
							// change clear to heavy-rain-to-rain.start or heavy-snow-to-snow.start
							weatherAndPossiblity.weatherStatus = toWeatherStatus(precipIntensity, weatherType);
							timeStatus.push(TIME_STATUS.START);
						} else {
							// for drizzle or something else?
							timeStatus.push(TIME_STATUS.STOP);
						}
	
						condition.token = toToken(weatherAndPossiblity, timeStatus);
						condition.longTemplate = forecast_keypoint ?? description;
						condition.shortTemplate = description;
						condition.parameters = {
							// maybe useless
							"firstAt": startTime,
						};
	
						conditions.push(condition);

						weatherAndPossiblity.possibility =
							needPossible(minutes[0].precipChance) ? POSSIBILITY.POSSIBLE : null;
						weatherAndPossiblity.weatherStatus = toWeatherStatus(precipIntensity, weatherType);
						timeStatus = [TIME_STATUS.START];
						switch (apiVersion) {
							case "v1":
								condition = {};
								break;
							case "v2":
							default:
								condition = { startTime };
								break;
						}
						break;
					case WEATHER_STATUS.DRIZZLE:
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
						switch (apiVersion) {
							case "v1":
								condition.validUntil = startAt;
								break;
							case "v2":
							default:
								condition.endTime = startTime;
								break;
						}

						if (weatherAndPossiblity.weatherStatus === WEATHER_STATUS.CLEAR) {
							// change clear to rain.start or snow.start
							weatherAndPossiblity.weatherStatus = toWeatherStatus(precipIntensity, weatherType);
							timeStatus.push(TIME_STATUS.START);
						} else if (
							weatherAndPossiblity.weatherStatus === WEATHER_STATUS.HEAVY_RAIN ||
							weatherAndPossiblity.weatherStatus === WEATHER_STATUS.HEAVY_SNOW ||
							// TODO: untested rain to snow OR snow to rain?
							weatherAndPossiblity.weatherStatus === WEATHER_STATUS.RAIN ||
							weatherAndPossiblity.weatherStatus === WEATHER_STATUS.SNOW
						) {
							timeStatus = [TIME_STATUS.CONSTANT];
						} else {
							// for drizzle or something else?
							timeStatus.push(TIME_STATUS.STOP);
						}

						condition.token = toToken(weatherAndPossiblity, timeStatus);
						condition.longTemplate = forecast_keypoint ?? description;
						condition.shortTemplate = description;
						condition.parameters = {
							// maybe useless
							"firstAt": startTime,
						};

						conditions.push(condition);

						weatherAndPossiblity.possibility =
							needPossible(minutes[0].precipChance) ? POSSIBILITY.POSSIBLE : null;
						weatherAndPossiblity.weatherStatus = toWeatherStatus(precipIntensity, weatherType);
						timeStatus = [TIME_STATUS.START];
						switch (apiVersion) {
							case "v1":
								condition = {};
								break;
							case "v2":
							default:
								condition = { startTime };
								break;
						}
						break;
				}
			}
		}

		$.log(`🚧 ${$.name}, conditions = ${JSON.stringify(conditions)}`, '');
		return conditions;
	};

	const conditions = getConditions(apiVersion, minutelyData, nextHour.minutes);
	nextHour.condition = nextHour.condition.concat(conditions);

	const getSummary = (apiVersion, minutes) => {
		// $.log(`🚧 ${$.name}, 开始设置summary`, '');
		const weatherType = getWeatherType(minutelyData?.result?.hourly);
		$.log(`🚧 ${$.name}, weatherType = ${weatherType}`, '');

		const summaries = [];

		// initialize data
		let lastIndex = 0;
		// little trick for origin data
		let isRainOrSnow = minutes[0].precipIntensity > 0;
		let summary = {
			// I guess data from weatherType is not always reliable
			condition: isRainOrSnow ? weatherType : SUMMARY_CONDITION_TYPES.CLEAR,
		};

		switch (apiVersion) {
			case "v1":
				break;
			case "v2":
			default:
				summary.startTime = minutes[0].startTime;
				break;
		}

		for (let i = 0; i < minutes.length; i++) {
			// clear in an hour
			// Apple weather could only display one hour data
			// drop useless data to avoid display empty graph
			if (i + 1 >= DISPLAYABLE_MINUTES && lastIndex === 0 && !isRainOrSnow) {
				summaries.push(summary);

				$.log(`🚧 ${$.name}, summaries = ${JSON.stringify(summaries)}`, '');
				return summaries;
			}

			// this loop will handle previous condition and create the condition for next condition
			// `startAt` for APIv1, `startTime` for APIv2
			// is this too dirty?
			const { startAt, startTime, precipIntensity } = minutes[i];
			if (isRainOrSnow) {
				if (
					// end of rain
					radarToPrecipitationLevel(precipIntensity) === PRECIPITATION_LEVEL.NO_RAIN_OR_SNOW ||
					// constant of rain
					// we always need precipChance and precipIntensity data
					i + 1 === minutes.length
				) {
					// for find the max value of precipChance and precipIntensity
					const range = minutes.slice(lastIndex, i + 1);

					// we reach the data end but cannot find the end of rain
					if (radarToPrecipitationLevel(precipIntensity) === PRECIPITATION_LEVEL.NO_RAIN_OR_SNOW) {
						switch (apiVersion) {
							case "v1":
								summary.validUntil = startAt;
								break;
							case "v2":
							default:
								summary.endTime = startTime;
								break;
						}
					}

					switch (apiVersion) {
						case "v1":
							summary.probability = Math.max(...range.map(value => value.precipChance));
							// it looks like Apple doesn't care precipIntensity
							summary.maxIntensity = Math.max(...range.map(value => value.precipIntensity));
							summary.minIntensity = Math.min(...range.map(value => value.precipIntensity));
							break;
						case "v2":
						default:
							summary.precipChance = Math.max(...range.map(value => value.precipChance));
							// it looks like Apple doesn't care precipIntensity
							summary.precipIntensity = Math.max(...range.map(value => value.precipIntensity));
							break;
					}

					summaries.push(summary);

					// reset summary
					isRainOrSnow = !isRainOrSnow;
					lastIndex = i;
					switch (apiVersion) {
						case "v1":
							summary = { condition: SUMMARY_CONDITION_TYPES.CLEAR };
							break;
						case "v2":
						default:
							summary = {
								startTime: startTime,
								condition: SUMMARY_CONDITION_TYPES.CLEAR,
							};
							break;
					}
				}
			} else {
				if (radarToPrecipitationLevel(precipIntensity) > PRECIPITATION_LEVEL.NO_RAIN_OR_SNOW) {
					switch (apiVersion) {
						case "v1":
							summary.validUntil = startAt;
							break;
						case "v2":
						default:
							summary.endTime = startTime;
							break;
					}

					summaries.push(summary);

					isRainOrSnow = !isRainOrSnow;
					lastIndex = i;
					switch (apiVersion) {
						case "v1":
							summary = { condition: weatherType };
							break;
						case "v2":
						default:
							summary = {
								startTime: startTime,
								condition: weatherType,
							};
							break;
					}
				}
			}
		}

		$.log(`🚧 ${$.name}, summaries = ${JSON.stringify(summaries)}`, '');
		return summaries;
	};

	const summaries = getSummary(apiVersion, nextHour.minutes);
	nextHour.summary = nextHour.summary.concat(summaries);

	// $.log(`🚧 ${$.name}, forecastNextHour = ${JSON.stringify(nextHour)}`, '');

	if (apiVersion === "v1") {
		$.log(`🚧 ${$.name}, 检测到API版本为${apiVersion}，适配尚处于测试阶段，将输出修改后的内容。`, "");
		$.log(`🚧 ${$.name}, (edited) nextHour = ${JSON.stringify(nextHour)}`, "");
	} else if (Settings?.NextHour?.Debug?.Switch) {
		$.log(`⚠️ ${$.name}, debug: nextHour = ${JSON.stringify(nextHour)}`, '');
	}

	switch (apiVersion) {
		case "v1":
			weather.next_hour = nextHour;
			break;
		case "v2":
		default:
			weather.forecastNextHour = nextHour;
			break;
	}

	$.log(`🎉 ${$.name}, 下一小时降水强度替换完成`, '');
	return weather;
};

/***************** Fuctions *****************/
// Function 1
// Switch Pollutants Type
// https://github.com/Hackl0us/SS-Rule-Snippet/blob/master/Scripts/Surge/weather_aqi_us/iOS15_Weather_AQI_US.js
function switchPollutantsType(pollutant) {
	const pollutant_map = { "co": "CO", "no": "NO", "no2": "NO2", "so2": "SO2", "o3": "OZONE", "nox": "NOX", "pm25": "PM2.5", "pm10": "PM10" };
	return pollutant_map?.[pollutant] ?? "OTHER";
};

// Function 2
// Convert Time Format
// https://github.com/Hackl0us/SS-Rule-Snippet/blob/master/Scripts/Surge/weather_aqi_us/iOS15_Weather_AQI_US.js
function convertTime(time, action, api) {
	switch (action) {
		case 'remain':
			time.setMilliseconds(0);
			break;
		case 'add-1h-floor':
			time.setHours(time.getHours() + 1);
			time.setMinutes(0, 0, 0);
			break;
		default:
			$.log(`⚠️ ${$.name}, Time Converter, Error`, `time: ${time}`, '');
	}
	if (api == "v1") {
		let timeString = time.getTime() / 1000;
		return timeString;
	}
	if (api == "v2") {
		let timeString = time.toISOString().split('.')[0] + 'Z';
		return timeString;
	}
};

// Function 3
// Calculate Air Quality Level
// https://github.com/Hackl0us/SS-Rule-Snippet/blob/master/Scripts/Surge/weather_aqi_us/iOS15_Weather_AQI_US.js
function classifyAirQualityLevel(aqiIndex) {
	if (aqiIndex >= 0 && aqiIndex <= 50) return 1;
	else if (aqiIndex >= 51 && aqiIndex <= 100) return 2;
	else if (aqiIndex >= 101 && aqiIndex <= 150) return 3;
	else if (aqiIndex >= 151 && aqiIndex <= 200) return 4;
	else if (aqiIndex >= 201 && aqiIndex <= 300) return 5;
	else if (aqiIndex >= 301 && aqiIndex <= 500) return 6;
	else {
		$.log(`⚠️ ${$.name}, classifyAirQualityLevel, Error`, `aqiIndex: ${aqiIndex}`, '');
		return 6;
	}
};

/***************** Env *****************/
// prettier-ignore
// https://github.com/chavyleung/scripts/blob/master/Env.min.js
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}isStash(){return"undefined"!=typeof $environment&&$environment["stash-version"]}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){if(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:i,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:i,statusCode:r,headers:o,rawBody:h},s.decode(h,this.encoding))},t=>{const{message:i,response:r}=t;e(i,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let i=require("iconv-lite");this.initGotEnv(t);const{url:r,...o}=t;this.got[s](r,o).then(t=>{const{statusCode:s,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:s,statusCode:r,headers:o,rawBody:h},i.decode(h,this.encoding))},t=>{const{message:s,response:r}=t;e(s,r,r&&i.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,i=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":i}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}

// https://github.com/VirgilClyne/iRingo/blob/main/function/URLSearch.min.js
function URLSearch(s){return new class{constructor(s=[]){this.name="urlParams v1.0.0",this.opts=s,this.json={url:{scheme:"",host:"",path:""},params:{}}}parse(s){let t=s.match(/(?<scheme>.+):\/\/(?<host>[^/]+)\/?(?<path>[^?]+)?\??(?<params>.*)?/)?.groups??null;return t?.params&&(t.params=Object.fromEntries(t.params.split("&").map((s=>s.split("="))))),t}stringify(s=this.json){return s?.params?s.scheme+"://"+s.host+"/"+s.path+"?"+Object.entries(s.params).map((s=>s.join("="))).join("&"):s.scheme+"://"+s.host+"/"+s.path}}(s)}
