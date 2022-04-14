/*
README:https://github.com/VirgilClyne/iRingo
*/

const $ = new Env("Apple Weather v2.2.0-beta");
const DataBase = {"Apple":{"Weather":{"Mode":"WAQI Public","Location":"Station","Verify":{"Mode":"Token","Content":null},"Scale":"EPA_NowCast.2201"}}};
const { url } = $request;

/***************** Async *****************/
!(async () => {
	const { Parameter, Settings } = await setENV("iRingo", url, DataBase)
	const Mode = Settings.Weather.Mode
	const Location = Settings.Weather.Location
	//const Parameter = await getOrigin(url)
	const Status = await getAQIstatus(Parameter.Version, $response.body)
	if (Status == true) {
		if (Mode == "WAQI Public") {
			$.log("工作模式: waqi.info 公共API")
			//var [NOW, idx] = await getNearestNOW(Parameter.Version, Parameter.lat, Parameter.lng)
			var { NOW, idx } = await WAQI("Nearest", { api: Parameter.Version, lat: Parameter.lat, lng: Parameter.lng });
			//let Token = await getToken(idx)
			let Token = await WAQI("Token", { idx: idx });
			//var NOW = await getStationNOW(Token, idx)
			//var AQI = await getStationAQI(Token, idx)
			var AQI = await WAQI("AQI", { token:Token, idx: idx });
		} else if (Mode == "WAQI Private") {
			$.log("工作模式: waqi.info 私有API")
			let Token = Settings.Weather.Verify.Content
			if (Location == "Station") {
				$.log("定位精度: 观测站")
				//var [NOW, idx] = await getNearestNOW(Parameter.Version, Parameter.lat, Parameter.lng)
				var { NOW, idx } = await WAQI("Nearest", { api: Parameter.Version, lat: Parameter.lat, lng: Parameter.lng });
				//var AQI = await getStationFeed(Token, idx)
				var AQI = await WAQI("StationFeed", { token:Token, idx: idx });
			} else if (Location == "City") {
				$.log("定位精度: 城市")
				//var AQI = await getCityFeed(Token, Parameter.lat, Parameter.lng)
				var AQI = await WAQI("CityFeed", { token:Token, lat: Parameter.lat, lng: Parameter.lng });
			}
		}
		/*
		let [now, idx] = await getNearestNOW(Parameter.Version, Parameter.lat, Parameter.lng)
		let token = (Mode == "WAQI Public API") ? await getToken(idx)
			: (Mode == "WAQI Private API") ? Settings.Weather.Verify.Content
				: $.log(`⚠️ ${$.name}, 无可用令牌`, `令牌: ${Mode}`, '');
		let obs = (Mode == "WAQI Public API") ? await getStation(token, idx)
			: (Mode == "WAQI Private API" && Location == "Station") ? getStationFeed(token, idx)
				: (Mode == "WAQI Private API" && Location == "City") ? getCityFeed(token, lat, lng)
					: $.log(`⚠️ ${$.name}, 无可用获取模式`, `获取模式: ${Mode}`, '');
		*/
		let body = await outputData(Parameter.Version, NOW, AQI, $response.body, Settings);
		await $.done({ body });
	} else $.log(`⚠️ ${$.name}, 无须替换, 跳过`, '');
})()
	.catch((e) => $.logErr(e))
	.finally(() => $.done())

/***************** Async Function *****************/
/**
 * Set Environment Variables
 * @author VirgilClyne
 * @param {String} url - url
 * @param {Object} database - database
 * @return {Promise<*>}
 */
async function setENV(name, url, database) {
	$.log(`⚠ ${$.name}, Set Environment Variables`, "");
	/***************** Parameter *****************/
	const Regular = /^https?:\/\/(?<dataServer>weather-data|weather-data-origin)\.apple\.com\/(?<Version>v1|v2)\/weather\/(?<language>[\w-_]+)\/(?<lat>-?\d+\.\d+)\/(?<lng>-?\d+\.\d+).*(?<countryCode>country=[A-Z]{2})?.*/i;
	const Parameter = url.match(Regular).groups;
	/***************** BoxJs *****************/
	// 包装为局部变量，用完释放内存
	// BoxJs的清空操作返回假值空字符串, 逻辑或操作符会在左侧操作数为假值时返回右侧操作数。
	let BoxJs = $.getjson(name, database)
	//$.log(`🚧 ${$.name}, Set Environment Variables`, `$.BoxJs类型: ${typeof $.BoxJs}`, `$.BoxJs内容: ${JSON.stringify($.BoxJs)}`, "");
	/***************** Settings *****************/
	let Settings = BoxJs?.Apple || database.Apple;
	//if (typeof Apple == "string") Apple = JSON.parse(Apple)
	$.log(`🎉 ${$.name}, Set Environment Variables`, `Settings: ${typeof Settings}`, `Settings内容: ${JSON.stringify(Settings)}`, "");
	/***************** Argument *****************/
	if (typeof $argument != "undefined") {
		$.log(`🎉 ${$.name}, $Argument`);
		let arg = Object.fromEntries($argument.split("&").map((item) => item.split("=")));
		$.log(JSON.stringify(arg));
		Settings.Weather.Mode = arg.Mode;
		Settings.Weather.Location = arg.Location;
		Settings.Weather.Verify.Mode = arg.VerifyMode;
		Settings.Weather.Verify.Content = arg.Token;
	}
	//$.log(`🚧 ${$.name}, 调试信息, Settings.Weather类型: ${typeof Settings.Weather}`, `Settings.Weather内容: ${JSON.stringify(Settings.Weather)}`, "");
	return { Parameter, Settings };
};

// Step 1
// Get Origin Parameter
function getOrigin(url) {
	return new Promise((resolve) => {
		//const Regular = /^https?:\/\/(weather-data|weather-data-origin)\.apple\.com\/(v1|v2)\/weather\/([\w-_]+)\/(-?\d+\.\d+)\/(-?\d+\.\d+).*(country=[A-Z]{2})?.*/i;
		const Regular = /^https?:\/\/(?<dataServer>weather-data|weather-data-origin)\.apple\.com\/(?<Version>v1|v2)\/weather\/(?<language>[\w-_]+)\/(?<lat>-?\d+\.\d+)\/(?<lng>-?\d+\.\d+).*(?<countryCode>country=[A-Z]{2})?.*/i;
		try {
			//$.log(`🎉 ${$.name}, getOrigin, Finish`, $.url, `${$.dataServer}, ${$.Version}, ${$.language}, ${$.lat}, ${$.lng}, ${$.countryCode}`, '');
			//[$.url, $.dataServer, $.Version, $.language, $.lat, $.lng, $.countryCode] = url.match(Regular);
			//$.log(`🚧 ${$.name}, ${getOrigin.name}`, url.match(Regular), '');
			var Parameter = url.match(Regular).groups;
		} catch (e) {
			$.log(`❗️${$.name}, ${getOrigin.name}执行失败`, `error = ${e}`, '');
		} finally {
			$.log(`🎉 ${$.name}, ${getOrigin.name}完成`, JSON.stringify(Parameter), '');
			resolve(Parameter);
		}
	})
};

// Step 2
// Get AQI Source Status
function getAQIstatus(api, body) {
	return new Promise((resolve) => {
		const weather = JSON.parse(body);
		const provider = ['和风天气', 'QWeather']
		try {
			var result = (api == "v1" && weather.air_quality) ? provider.includes(weather.air_quality?.metadata?.provider_name)
				: (api == "v2" && weather.airQuality) ? provider.includes(weather.airQuality?.metadata?.providerName)
					: true
			/*
			if (api == 'v1' && weather.air_quality) {
				$.log(`⚠️ ${$.name}, ${getAQIstatus.name}检测`, `AQ data ${api}, ${weather.air_quality?.metadata?.provider_name}`, '');
				var result = provider.includes(weather.air_quality.metadata.provider_name);
			} else if (api == 'v2' && weather.airQuality) {
				$.log(`⚠️ ${$.name}, ${getAQIstatus.name}检测`, `AQ data ${api}, ${weather.airQuality?.metadata?.providerName}`, '');
				var result = provider.includes(weather.airQuality.metadata.providerName);
			} else {
				$.log(`🎉 ${$.name}, ${getAQIstatus.name}检测`, "不存在 AQI data", '');
				var result = true;
			}
			*/
		} catch (e) {
			$.log(`❗️${$.name}, ${getAQIstatus.name}执行失败`, `error = ${e}`, '');
		} finally {
			$.log(`🎉 ${$.name}, ${getAQIstatus.name}完成`, `AQ data ${api ?? "None"}, ${weather.air_quality?.metadata?.provider_name ?? weather.airQuality?.metadata?.providerName}`, '');
			resolve(result || false)
		}
	})
};



/**
 * WAQI
 * @author VirgilClyne
 * @param {String} type - type
 * @param {Object} input - verify
 * @return {Promise<*>}
 */
async function WAQI(type = "", input = {}) {
	$.log(`⚠ ${$.name}, WAQI`, `input: ${JSON.stringify(input)}`, "");
	// 构造请求
	let request = await GetRequest(type, input);
	// 发送请求
	let output = await GetData(type, request);
	$.log(`🚧 ${$.name}, WAQI`, `output: ${output}`, "");
	return output
	/***************** Fuctions *****************/
	async function GetRequest(type = "", input = { api: "v2", lat: 0, lng: 0, idx: 0, token: "na" }) {
		$.log(`⚠ ${$.name}, Get Weather Request`, "");
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
		} else if (type == "Now") {
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
	};

	function GetData(type, request) {
		$.log(`⚠ ${$.name}, Get Weather Data`, "");
		return new Promise(resolve => {
			if (type == "Now" || type == "AQI") {
				$.post(request, (error, response, data) => {
					try {
						if (error) throw new Error(error)
						else if (data) {
							const _data = JSON.parse(data)
							// Step 5A
							// Get Nearest Observation Station AQI Data
							// https://api.waqi.info/api/feed/@station.uid/now.json
							// https://api.waqi.info/api/feed/@station.uid/aqi.json
							if (type == "Now" || type == "AQI") {
								if (_data.rxs.status == "ok") {
									if (_data.rxs.obs.some(o => o.status == 'ok')) {
										let i = _data.rxs.obs.findIndex(o => o.status == 'ok')
										let m = _data.rxs.obs.findIndex(o => o.msg)
										//$.obs = _data.rxs.obs[i].msg;
										if (i >= 0 && m >= 0) {
											$.log(`🎉 ${$.name}, ${getStationAQI.name}`, `i = ${i}, m = ${m}`, '')
											resolve(_data.rxs.obs[i].msg)
										} else if (i < 0 || m < 0) {
											$.log(`❗️ ${$.name}, ${getStationAQI.name}`, `OBS Get Error`, `i = ${i}, m = ${m}`, `空数据，浏览器访问 https://api.waqi.info/api/feed/@${idx}/aqi.json 查看获取结果`, '')
											resolve(_data.rxs.obs[i].msg)
										}
									} else $.log(`❗️ ${$.name}, ${getStationAQI.name}`, `OBS Status Error`, `obs.status: ${_data.rxs.obs[0].status}`, `data = ${data}`, '')
								} else $.log(`❗️ ${$.name}, ${getStationAQI.name}`, `RXS Status Error`, `status: ${_data.rxs.status}`, `data = ${data}`, '')
							}
						} else throw new Error(response);
					} catch (e) {
						$.logErr(`❗️${$.name}, ${fatchWAQIjson.name}执行失败`, ` url = ${JSON.stringify(url)}`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
					} finally {
						//$.log(`🚧 ${$.name}, ${fatchWAQIjson.name}调试信息`, ` url = ${JSON.stringify(url)}`, `data = ${data}`, '')
						resolve()
					}
				})
			} else {
				$.get(request, (error, response, data) => {
					try {
						if (error) throw new Error(error)
						else if (data) {
							const _data = JSON.parse(data)
							// Step 3
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
								//var country = station?.cca2 ?? station?.country ?? null;
								/*
								if (url.url.search("/mapq/") != -1 && _data.d[0]) {
									var station = _data.d[0];
									var idx = station.x;
									var name = station.nna;
									var distance = station.d;
									//var country = station.cca2;
								} else if (url.url.search("/mapq2/") != -1 && _data.status == "ok") {
									var station = _data.data.stations[0];
									var idx = station.idx;
									var name = station.name;
									var distance = station.distance;
									//var country = station.country;
								} else {
									$.log(`❗️ ${$.name}, ${getNearestNOW.name}执行失败`, `api: ${api}`, `data = ${data}`, '');
									$.done();
								}
								*/
								$.log(`🎉 ${$.name}, ${getNearestNOW.name}完成`, `idx: ${idx}`, `观测站: ${name}`, `AQI: ${aqi}`, `距离: ${distance}`, '')
								resolve({ station, idx })
							}
							// Step 4
							// Get Nearest Observation Station Token
							// https://api.waqi.info/api/token/station.uid
							else if (type == "Token") {
								var token = _data.rxs?.obs[0]?.msg?.token ?? "na"
								$.log(`🎉 ${$.name}, ${getToken.name}完成`, `token = ${token}`, '')
								resolve(token)
								/*
								if (_data.rxs.status == "ok") {
									var token = _data.rxs.obs[0].msg.token;
									$.log(`🎉 ${$.name}, ${getToken.name}完成`, `token = ${token}`, '')
								} else {
									var token = "na";
									$.log(`⚠️ ${$.name}, ${getToken.name}执行失败`, `status: ${_data.rxs.status}`, `data = ${data}`, '')
								} resolve(token)
								*/
							}
							// Step 5B
							// Geolocalized Feed
							// https://aqicn.org/json-api/doc/#api-Geolocalized_Feed-GetGeolocFeed
							// https://api.waqi.info/feed/geo::lat;:lng/?token=:token
							else if (type == "CityFeed") {
								var city = (_data.status == 'ok') ? _data?.data : null;
								$.log(`🎉 ${$.name}, ${getCityFeed.name}完成`, `idx: ${city?.idx}`, `观测站: ${city?.city?.name}`, `AQI: ${city?.aqi}`, '')
								resolve(city)
							}
							// Step 5C
							// Station Feed
							// https://api.waqi.info/feed/@station.uid/?token=:token
							else if (type == "StationFeed") {
								var station = (_data.status == 'ok') ? _data?.data : null;
								$.log(`🎉 ${$.name}, ${getStationFeed.name}完成`, `idx: ${station?.idx}`, `观测站: ${station?.city?.name}`, `AQI: ${station?.aqi}`, '')
								resolve(station)
							}
						} else throw new Error(response);
					} catch (e) {
						$.logErr(`❗️${$.name}, ${getWAQIjson.name}执行失败`, ` url = ${JSON.stringify(url)}`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
					} finally {
						//$.log(`🚧 ${$.name}, ${getWAQIjson.name}调试信息`, ` url = ${JSON.stringify(url)}`, `data = ${data}`, '')
						resolve()
					}
				})
			};
		});
	};
};
// Step 3
// Search Nearest Observation Station
// https://api.waqi.info/mapq/nearest/?n=1&geo=1/lat/lng
// https://api.waqi.info/mapq2/nearest?n=1&geo=1/lat/lng
async function getNearestNOW(api, lat, lng) {
	$.log('获取最近站点');
	if (api == "v1") mapq = "mapq";
	else if (api == "v2") mapq = "mapq2";
	const url = { url: `${$.VAL.url}/${mapq}/nearest?n=1&geo=1/${lat}/${lng}`, headers: $.VAL.headers };
	return await getWAQIjson(url);
}

// Step 4
// Get Nearest Observation Station Token
// https://api.waqi.info/api/token/station.uid
async function getToken(idx) {
	$.log('获取令牌');
	const url = { url: `${$.VAL.url}/api/token/${idx}`, headers: $.VAL.headers };
	return await getWAQIjson(url);
}

// Step 5A
// Get Observation Station NOW JSON
// https://api.waqi.info/api/feed/@station.uid/now.json
async function getStationNOW(token = "na", idx) {
	$.log('获取站点信息');
	const url = { method: 'post', url: `${$.VAL.url}/api/feed/@${idx}/now.json`, headers: $.VAL.headers, body: `token=${token}&id=${idx}` };
	return await fatchWAQIjson(url);
}

// Step 5B
// Get Observation Station AQI JSON
// https://api.waqi.info/api/feed/@station.uid/aqi.json
async function getStationAQI(token = "na", idx) {
	$.log('获取站点信息');
	const url = { method: 'post', url: `${$.VAL.url}/api/feed/@${idx}/aqi.json`, headers: $.VAL.headers, body: `token=${token}&id=${idx}` };
	return await fatchWAQIjson(url);
}


// Step 5C
// Get Geolocalized Feed
// https://aqicn.org/json-api/doc/#api-Geolocalized_Feed-GetGeolocFeed
// https://api.waqi.info/feed/geo::lat;:lng/?token=:token
async function getCityFeed(token, lat, lng) {
	$.log('获取最近源信息');
	const url = { url: `${$.VAL.url}/feed/geo:${lat};${lng}/?token=${token}`, headers: $.VAL.headers };
	return await getWAQIjson(url);
}

// Step 5D
// Get Observation Station Feed
// https://api.waqi.info/feed/@station.uid/?token=:token
async function getStationFeed(token, idx) {
	$.log('获取最近源信息');
	const url = { url: `${$.VAL.url}/feed/@${idx}/?token=${token}`, headers: $.VAL.headers };
	return await getWAQIjson(url);
}

// Step 6
// Output Data
function outputData(api, now, obs, body, Settings) {
	return new Promise((resolve) => {
		// Input Data
		let weather = JSON.parse(body);
		try {
			//检测版本
			$.log(`⚠️ ${$.name}, ${outputData.name}检测`, `AQ data ${api}`, '');
			var AQIname = (api == "v1") ? "air_quality"
				: (api == "v2") ? "airQuality"
					: "airQuality";
			var unit = (api == "v1") ? "μg\/m3"
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
			weather[`${AQIname}`].pollutants.CO = { "name": "CO", "amount": obs.iaqi.co?.v || -1, "unit": unit };
			weather[`${AQIname}`].pollutants.NO = { "name": "NO", "amount": obs.iaqi.no?.v || -1, "unit": unit };
			weather[`${AQIname}`].pollutants.NO2 = { "name": "NO2", "amount": obs.iaqi.no2?.v || -1, "unit": unit };
			weather[`${AQIname}`].pollutants.SO2 = { "name": "SO2", "amount": obs.iaqi.so2?.v || -1, "unit": unit };
			weather[`${AQIname}`].pollutants.OZONE = { "name": "OZONE", "amount": obs.iaqi.o3?.v || -1, "unit": unit };
			weather[`${AQIname}`].pollutants.NOX = { "name": "NOX", "amount": obs.iaqi.nox?.v || -1, "unit": unit };
			weather[`${AQIname}`].pollutants["PM2.5"] = { "name": "PM2.5", "amount": obs.iaqi.pm25?.v || -1, "unit": unit };
			weather[`${AQIname}`].pollutants.PM10 = { "name": "PM10", "amount": obs.iaqi.pm10?.v || -1, "unit": unit };
			weather[`${AQIname}`].metadata.longitude = obs?.city?.geo?.[0] ?? now?.geo?.[0];
			weather[`${AQIname}`].metadata.latitude = obs?.city?.geo?.[1] ?? now?.geo?.[1];
			weather[`${AQIname}`].metadata.language = weather?.[`${AQIname}`]?.metadata?.language ?? weather?.currentWeather?.metadata?.language ?? weather?.current_observations?.metadata?.language;
			if (api == "v1") {				
				weather.air_quality.airQualityIndex = obs?.aqi ?? now?.aqi ?? now?.v;
				weather.air_quality.airQualityScale = Settings.Weather.Scale ?? "EPA_NowCast.2201";
				weather.air_quality.airQualityCategoryIndex = classifyAirQualityLevel(obs?.aqi ?? now?.aqi ?? now?.v);
				weather.air_quality.metadata.reported_time = convertTime(new Date(obs?.time?.v ?? now?.t), 'remain', api);
				//weather.air_quality.metadata.provider_name = obs?.attributions?.[obs.attributions.length - 1]?.name;
				weather.air_quality.metadata.provider_name = obs?.attributions?.[0]?.name;
				weather.air_quality.metadata.expire_time = convertTime(new Date(obs?.time?.v ?? now?.t), 'add-1h-floor', api);
				weather.air_quality.metadata.provider_logo = "https:\/\/waqi.info\/images\/logo.png";
				weather.air_quality.metadata.read_time = convertTime(new Date(), 'remain', api);
			} else if (api == "v2") {
				weather.airQuality.index = obs?.aqi ?? now?.aqi ?? now?.v;
				weather.airQuality.scale = Settings.Weather.Scale ?? "EPA_NowCast.2201";
				weather.airQuality.categoryIndex = classifyAirQualityLevel(obs?.aqi ?? now?.aqi ?? now?.v);
				weather.airQuality.metadata.providerLogo = "https:\/\/waqi.info\/images\/logo.png";
				//weather.airQuality.metadata.providerName = obs?.attributions?.[obs.attributions.length - 1]?.name;
				weather.airQuality.metadata.providerName = obs?.attributions?.[0]?.name;
				weather.airQuality.metadata.expireTime = convertTime(new Date(obs?.time?.iso ?? now?.utime), 'add-1h-floor', api);				
				weather.airQuality.metadata.reportedTime = convertTime(new Date(obs?.time?.iso ?? now?.utime), 'remain', api);
				weather.airQuality.metadata.readTime = convertTime(new Date(), 'remain', api);
			}

			/*
			if (api == "v1") {
				$.log(`⚠️ ${$.name}, ${outputData.name}检测`, `AQ data ${api}`, '');
				if (!weather.air_quality) {
					$.log(`⚠️ ${$.name}, non-existent Air Quality data, creating`, '');
					weather.air_quality = {
						"isSignificant": true, //重要/置顶
						"pollutants": {},
						"metadata": {
							"version": 1,
							"data_source": 0, //来自XX读数 0:监测站 1:模型
						},
						"name": "AirQuality",
					};
				};
				if (obs?.aqi) { // From Observation Station
					weather.air_quality.source = obs.city.name;
					weather.air_quality.learnMoreURL = obs.city.url + `/${now.cca2}/m`.toLowerCase();
					weather.air_quality.airQualityIndex = obs.aqi;
					weather.air_quality.airQualityScale = "EPA_NowCast.2115";
					weather.air_quality.primaryPollutant = switchPollutantsType(obs.dominentpol);
					weather.air_quality.airQualityCategoryIndex = classifyAirQualityLevel(obs.aqi);
					weather.air_quality.pollutants.CO = { "name": "CO", "amount": obs.iaqi.co?.v || -1, "unit": "μg\/m3" };
					weather.air_quality.pollutants.NO = { "name": "NO", "amount": obs.iaqi.no?.v || -1, "unit": "μg\/m3" };
					weather.air_quality.pollutants.NO2 = { "name": "NO2", "amount": obs.iaqi.no2?.v || -1, "unit": "μg\/m3" };
					weather.air_quality.pollutants.SO2 = { "name": "SO2", "amount": obs.iaqi.so2?.v || -1, "unit": "μg\/m3" };
					weather.air_quality.pollutants.OZONE = { "name": "OZONE", "amount": obs.iaqi.o3?.v || -1, "unit": "μg\/m3" };
					weather.air_quality.pollutants.NOX = { "name": "NOX", "amount": obs.iaqi.nox?.v || -1, "unit": "μg\/m3" };
					weather.air_quality.pollutants["PM2.5"] = { "name": "PM2.5", "amount": obs.iaqi.pm25?.v || -1, "unit": "μg\/m3" };
					weather.air_quality.pollutants.PM10 = { "name": "PM10", "amount": obs.iaqi.pm10?.v || -1, "unit": "μg\/m3" };
					weather.air_quality.metadata.reported_time = convertTime(new Date(obs.time.v), 'remain', api);
					weather.air_quality.metadata.longitude = obs.city.geo[0];
					weather.air_quality.metadata.provider_name = obs.attributions[obs.attributions.length - 1].name;
					weather.air_quality.metadata.expire_time = convertTime(new Date(obs.time.v), 'add-1h-floor', api);
					weather.air_quality.metadata.provider_logo = "https:\/\/waqi.info\/images\/logo.png";
					weather.air_quality.metadata.read_time = convertTime(new Date(), 'remain', api);
					weather.air_quality.metadata.latitude = obs.city.geo[1];
					//weather.air_quality.metadata.version = "";
					weather.air_quality.metadata.language ? weather.air_quality.metadata.language : weather.current_observations.metadata.language
					//weather.air_quality.metadata.language = $.language;
					//weather.air_quality.metadata.data_source = 0;
				} else if (now) { // From Nearest List
					weather.air_quality.source = now.nna;
					weather.air_quality.airQualityIndex = now.v;
					weather.air_quality.airQualityScale = "EPA_NowCast.2115";
					weather.air_quality.primaryPollutant = switchPollutantsType(now.pol); //mapq1
					weather.air_quality.airQualityCategoryIndex = classifyAirQualityLevel(now.v);
					weather.air_quality.metadata.reported_time = convertTime(new Date(now.t), 'remain', api);
					weather.air_quality.metadata.expire_time = convertTime(new Date(now.t), 'add-1h-floor', api);
					weather.air_quality.metadata.read_time = convertTime(new Date(), 'remain', api);
					weather.air_quality.metadata.longitude = now.geo[0];
					weather.air_quality.metadata.latitude = now.geo[1];
					weather.air_quality.metadata.language ? weather.air_quality.metadata.language : weather.current_observations.metadata.language
				}
			} else if (api == "v2") {
				$.log(`⚠️ ${$.name}, ${outputData.name}检测`, `AQ data ${api}`, '');
				if (!weather.airQuality) {
					$.log(`⚠️ ${$.name}, non-existent Air Quality data, creating`, '');
					weather.airQuality = {
						"pollutants": {},
						"metadata": {
							"units": "m",
							"version": 2,
						},
						"sourceType": "station", //station:监测站 modeled:模型
						"isSignificant": true, //重要/置顶
						"name": "AirQuality",
					}
				};
				if (obs?.aqi) { // From Observation Station
					weather.airQuality.source = obs.city.name;
					weather.airQuality.learnMoreURL = obs.city.url + `/${now.country}/m`.toLowerCase();
					weather.airQuality.index = obs.aqi;
					weather.airQuality.scale = "EPA_NowCast.2115";
					weather.airQuality.primaryPollutant = switchPollutantsType(obs.dominentpol);
					weather.airQuality.categoryIndex = classifyAirQualityLevel(obs.aqi);
					weather.airQuality.pollutants.CO = { "name": "CO", "amount": obs.iaqi.co?.v || -1, "unit": "microgramsPerM3" };
					weather.airQuality.pollutants.NO = { "name": "NO", "amount": obs.iaqi.no?.v || -1, "unit": "microgramsPerM3" };
					weather.airQuality.pollutants.NO2 = { "name": "NO2", "amount": obs.iaqi.no2?.v || -1, "unit": "microgramsPerM3" };
					weather.airQuality.pollutants.SO2 = { "name": "SO2", "amount": obs.iaqi.so2?.v || -1, "unit": "microgramsPerM3" };
					weather.airQuality.pollutants.OZONE = { "name": "OZONE", "amount": obs.iaqi.o3?.v || -1, "unit": "microgramsPerM3" };
					weather.airQuality.pollutants.NOX = { "name": "NOX", "amount": obs.iaqi.nox?.v || -1, "unit": "microgramsPerM3" };
					weather.airQuality.pollutants["PM2.5"] = { "name": "PM2.5", "amount": obs.iaqi.pm25?.v || -1, "unit": "microgramsPerM3" };
					weather.airQuality.pollutants.PM10 = { "name": "PM10", "amount": obs.iaqi.pm10?.v || -1, "unit": "microgramsPerM3" };
					weather.airQuality.metadata.longitude = obs.city.geo[0];
					weather.airQuality.metadata.providerLogo = "https:\/\/waqi.info\/images\/logo.png";
					weather.airQuality.metadata.providerName = obs.attributions[obs.attributions.length - 1].name;
					weather.airQuality.metadata.expireTime = convertTime(new Date(obs.time.iso), 'add-1h-floor', api);
					weather.airQuality.metadata.language ? weather.airQuality.metadata.language : weather.currentWeather.metadata.language;
					//weather.airQuality.metadata.language = $.language;
					weather.airQuality.metadata.latitude = obs.city.geo[1];
					weather.airQuality.metadata.reportedTime = convertTime(new Date(obs.time.iso), 'remain', api);
					weather.airQuality.metadata.readTime = convertTime(new Date(), 'remain', api);
					//weather.airQuality.metadata.units = "m";
				} else if (now) { // From Nearest List
					weather.airQuality.source = now.name;
					weather.airQuality.index = now.aqi;
					weather.airQuality.scale = "EPA_NowCast.2115";
					//weather.airQuality.primaryPollutant = switchPollutantsType(now.pol); //mapq1
					weather.airQuality.categoryIndex = classifyAirQualityLevel(now.aqi);
					weather.airQuality.metadata.longitude = now.geo[0];
					weather.airQuality.metadata.latitude = now.geo[1];
					weather.airQuality.metadata.language ? weather.airQuality.metadata.language : weather.currentWeather.metadata.language;
					weather.airQuality.metadata.expireTime = convertTime(new Date(now.utime), 'add-1h-floor', api);
					weather.airQuality.metadata.reportedTime = convertTime(new Date(now.utime), 'remain', api);
					weather.airQuality.metadata.readTime = convertTime(new Date(), 'remain', api);
				};
			}
			*/
		} catch (e) {
			$.log(`❗️${$.name}, ${outputData.name}执行失败`, `浏览器访问 https://api.waqi.info/api/feed/@${idx}/aqi.json 看看是不是空数据`, `原因：网络不畅或者获取太频繁导致被封`, `error = ${error || e}`, '')
		} finally {
			// Output Data
			body = JSON.stringify(weather);
			$.log(`🎉 ${$.name}, ${outputData.name}完成`, '');
			resolve(body)
		}
	})
}

/***************** Fuctions *****************/
// Function 0A
// Get WAQI JSON
function getWAQIjson(url) {
	return new Promise((resolve) => {
		$.get(url, (error, response, data) => {
			try {
				if (error) throw new Error(error)
				else if (data) {
					const _data = JSON.parse(data)
					// Step 3
					// Search Nearest Observation Station
					// https://api.waqi.info/mapq/nearest/?n=1&geo=1/lat/lng
					// https://api.waqi.info/mapq2/nearest?n=1&geo=1/lat/lng
					if (url.url.search("/nearest") != -1) {
						// 空值合并运算符
						var station = _data?.data?.stations?.[0] ?? _data?.d?.[0] ?? null;
						var idx = station?.idx ?? station?.x ?? null;
						var name = station?.name ?? station?.u ?? station?.nna ?? station?.nlo ?? null;
						var aqi = station?.aqi ?? station?.v ?? null;
						var distance = station?.distance ?? station?.d ?? null;
						//var country = station?.cca2 ?? station?.country ?? null;
						/*
						if (url.url.search("/mapq/") != -1 && _data.d[0]) {
							var station = _data.d[0];
							var idx = station.x;
							var name = station.nna;
							var distance = station.d;
							//var country = station.cca2;
						} else if (url.url.search("/mapq2/") != -1 && _data.status == "ok") {
							var station = _data.data.stations[0];
							var idx = station.idx;
							var name = station.name;
							var distance = station.distance;
							//var country = station.country;
						} else {
							$.log(`❗️ ${$.name}, ${getNearestNOW.name}执行失败`, `api: ${api}`, `data = ${data}`, '');
							$.done();
						}
						*/
						$.log(`🎉 ${$.name}, ${getNearestNOW.name}完成`, `idx: ${idx}`, `观测站: ${name}`, `AQI: ${aqi}`, `距离: ${distance}`, '')		
						resolve([station, idx])
					}
					// Step 4
					// Get Nearest Observation Station Token
					// https://api.waqi.info/api/token/station.uid
					else if (url.url.search("/api/token/") != -1) {
						var token = _data.rxs?.obs[0]?.msg?.token ?? "na"
						$.log(`🎉 ${$.name}, ${getToken.name}完成`, `token = ${token}`, '')
						resolve(token)
						/*
						if (_data.rxs.status == "ok") {
							var token = _data.rxs.obs[0].msg.token;
							$.log(`🎉 ${$.name}, ${getToken.name}完成`, `token = ${token}`, '')
						} else {
							var token = "na";
							$.log(`⚠️ ${$.name}, ${getToken.name}执行失败`, `status: ${_data.rxs.status}`, `data = ${data}`, '')
						} resolve(token)
						*/
					}
					// Step 5B
					// Geolocalized Feed
					// https://aqicn.org/json-api/doc/#api-Geolocalized_Feed-GetGeolocFeed
					// https://api.waqi.info/feed/geo::lat;:lng/?token=:token
					else if (url.url.search("/feed/geo:") != -1) {
						var city = (_data.status == 'ok') ? _data?.data : null;
						$.log(`🎉 ${$.name}, ${getCityFeed.name}完成`, `idx: ${city?.idx}`, `观测站: ${city?.city?.name}`, `AQI: ${city?.aqi}`, '')
						resolve(city)
					}
					// Step 5C
					// Station Feed
					// https://api.waqi.info/feed/@station.uid/?token=:token
					else if (url.url.search("/feed/@") != -1) {
						var station = (_data.status == 'ok') ? _data?.data : null;
						$.log(`🎉 ${$.name}, ${getStationFeed.name}完成`, `idx: ${station?.idx}`, `观测站: ${station?.city?.name}`, `AQI: ${station?.aqi}`, '')
						resolve(station)
					}
				} else throw new Error(response);
			} catch (e) {
				$.logErr(`❗️${$.name}, ${getWAQIjson.name}执行失败`, ` url = ${JSON.stringify(url)}`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
			} finally {
				//$.log(`🚧 ${$.name}, ${getWAQIjson.name}调试信息`, ` url = ${JSON.stringify(url)}`, `data = ${data}`, '')
				resolve()
			}
		})
	})
};

// Function 0B
// Fatch WAQI JSON
function fatchWAQIjson(url) {
	return new Promise((resolve) => {
		$.post(url, (error, response, data) => {
			try {
				if (error) throw new Error(error)
				else if (data) {
					const _data = JSON.parse(data)
					// Step 5A
					// Get Nearest Observation Station AQI Data
					// https://api.waqi.info/api/feed/@station.uid/now.json
					// https://api.waqi.info/api/feed/@station.uid/aqi.json
					if (url.url.search("/api/feed/") != -1) {
						if (_data.rxs.status == "ok") {
							if (_data.rxs.obs.some(o => o.status == 'ok')) {
								let i = _data.rxs.obs.findIndex(o => o.status == 'ok')
								let m = _data.rxs.obs.findIndex(o => o.msg)
								//$.obs = _data.rxs.obs[i].msg;
								if (i >= 0 && m >= 0) {
									$.log(`🎉 ${$.name}, ${getStationAQI.name}`, `i = ${i}, m = ${m}`, '')
									resolve(_data.rxs.obs[i].msg)
								} else if (i < 0 || m < 0) {
									$.log(`❗️ ${$.name}, ${getStationAQI.name}`, `OBS Get Error`, `i = ${i}, m = ${m}`, `空数据，浏览器访问 https://api.waqi.info/api/feed/@${idx}/aqi.json 查看获取结果`, '')
									resolve(_data.rxs.obs[i].msg)
								}
							} else $.log(`❗️ ${$.name}, ${getStationAQI.name}`, `OBS Status Error`, `obs.status: ${_data.rxs.obs[0].status}`, `data = ${data}`, '')
						} else $.log(`❗️ ${$.name}, ${getStationAQI.name}`, `RXS Status Error`, `status: ${_data.rxs.status}`, `data = ${data}`, '')
					}
				} else throw new Error(response);
			} catch (e) {
				$.logErr(`❗️${$.name}, ${fatchWAQIjson.name}执行失败`, ` url = ${JSON.stringify(url)}`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
			} finally {
				//$.log(`🚧 ${$.name}, ${fatchWAQIjson.name}调试信息`, ` url = ${JSON.stringify(url)}`, `data = ${data}`, '')
				resolve()
			}
		})
	})
};

// Function 1
// Switch Pollutants Type
// https://github.com/Hackl0us/SS-Rule-Snippet/blob/master/Scripts/Surge/weather_aqi_us/iOS15_Weather_AQI_US.js
function switchPollutantsType(pollutant) {
	// Way 3
	// Array Dictionary
	const pollutant_map = { "co": "CO", "no": "NO", "no2": "NO2", "so2": "SO2", "o3": "OZONE", "nox": "NOX", "pm25": "PM2.5", "pm10": "PM10" };
	return pollutant_map?.[pollutant] ?? "OTHER";
	/*
	// Way 2
	// Array Map
	const pollutant_map = {'co':'CO','no':'NO','no2':'NO2','so2':'SO2','o3':'OZONE','nox':'NOX','pm25':'PM2.5','pm10':'PM10'}
	const pollutant_group = [pollutant]
	var [pollutant] = pollutant_group.map(x => pollutant_map[x]);
	return pollutant;
	*/
	/*
	// Way 1
	// Switch Case
	switch (pollutant) {
		case 'co': return 'CO';
		case 'no': return 'NO';
		case 'no2': return 'NO2';
		case 'so2': return 'SO2';
		case 'o3': return 'OZONE';
		case 'nox': return 'NOX';
		case 'pm25': return 'PM2.5';
		case 'pm10': return 'PM10';
		default: return "OTHER";
	}
	*/
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
		return 0;
	}
};

/***************** Env *****************/
// prettier-ignore
// https://github.com/chavyleung/scripts/blob/master/Env.min.js
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){if(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:i,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:i,statusCode:r,headers:o,rawBody:h},s.decode(h,this.encoding))},t=>{const{message:i,response:r}=t;e(i,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let i=require("iconv-lite");this.initGotEnv(t);const{url:r,...o}=t;this.got[s](r,o).then(t=>{const{statusCode:s,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:s,statusCode:r,headers:o,rawBody:h},i.decode(h,this.encoding))},t=>{const{message:s,response:r}=t;e(s,r,r&&i.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,i=rawOpts["update-pasteboard"]||rawOpts.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":i}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
