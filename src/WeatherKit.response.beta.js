import _ from './ENV/Lodash.mjs'
import $Storage from './ENV/$Storage.mjs'
import ENV from "./ENV/ENV.mjs";

import Database from "./database/index.mjs";
import setENV from "./function/setENV.mjs";

import * as flatbuffers from 'flatbuffers';
import * as WK2 from "./flatbuffers/wk2.js";

const $ = new ENV(" iRingo: 🌤 WeatherKit v1.0.8(4039) response.beta");

/***************** Processing *****************/
// 解构URL
const url = new URL($request.url);
$.log(`⚠ url: ${url.toJSON()}`, "");
// 获取连接参数
const METHOD = $request.method, HOST = url.hostname, PATH = url.pathname, PATHs = url.pathname.split("/").filter(Boolean);
$.log(`⚠ METHOD: ${METHOD}, HOST: ${HOST}, PATH: ${PATH}, PATHs: ${PATHs}`, "");
// 解析格式
const FORMAT = ($response.headers?.["Content-Type"] ?? $response.headers?.["content-type"])?.split(";")?.[0];
$.log(`⚠ FORMAT: ${FORMAT}`, "");
!(async () => {
	const { Settings, Caches, Configs } = setENV("iRingo", "Weather", Database);
	$.log(`⚠ Settings.Switch: ${Settings?.Switch}`, "");
	switch (Settings.Switch) {
		case true:
		default:
			// 创建空数据
			let body = {};
			// 格式判断
			switch (FORMAT) {
				case undefined: // 视为无body
					break;
				case "application/x-www-form-urlencoded":
				case "text/plain":
				default:
					//$.log(`🚧 body: ${body}`, "");
					break;
				case "application/x-mpegURL":
				case "application/x-mpegurl":
				case "application/vnd.apple.mpegurl":
				case "audio/mpegurl":
					//body = M3U8.parse($response.body);
					//$.log(`🚧 body: ${JSON.stringify(body)}`, "");
					//$response.body = M3U8.stringify(body);
					break;
				case "text/xml":
				case "text/html":
				case "text/plist":
				case "application/xml":
				case "application/plist":
				case "application/x-plist":
					//body = XML.parse($response.body);
					//$.log(`🚧 body: ${JSON.stringify(body)}`, "");
					//$response.body = XML.stringify(body);
					break;
				case "text/vtt":
				case "application/vtt":
					//body = VTT.parse($response.body);
					//$.log(`🚧 body: ${JSON.stringify(body)}`, "");
					//$response.body = VTT.stringify(body);
					break;
				case "text/json":
				case "application/json":
					//body = JSON.parse($response.body ?? "{}");
					//$.log(`🚧 body: ${JSON.stringify(body)}`, "");
					//$response.body = JSON.stringify(body);
					break;
				case "application/vnd.apple.flatbuffer":
				case "application/protobuf":
				case "application/x-protobuf":
				case "application/vnd.google.protobuf":
				case "application/grpc":
				case "application/grpc+proto":
				case "application/octet-stream":
					//$.log(`🚧 $response: ${JSON.stringify($response, null, 2)}`, "");
					let rawBody = $.isQuanX() ? new Uint8Array($response.bodyBytes ?? []) : $response.body ?? new Uint8Array();
					//$.log(`🚧 isBuffer? ${ArrayBuffer.isView(rawBody)}: ${JSON.stringify(rawBody)}`, "");
					switch (FORMAT) {
						case "application/vnd.apple.flatbuffer":
							// 解析FlatBuffer
							body = new flatbuffers.ByteBuffer(rawBody);
							let builder = new flatbuffers.Builder();
							// 主机判断
							switch (HOST) {
								case "weatherkit.apple.com":
									// 路径判断
									switch (PATHs[0]) {
										case "api":
											switch (PATHs[1]) {
												case "v2":
													/******************  initialization start  *******************/
													/******************  initialization finish  *******************/
													switch (PATHs[2]) {
														case "weather":
															/******************  initialization start  *******************/
															let weather = WK2.Weather.getRootAsWeather(body);
															WK2.Weather.startWeather(builder);
															if (url.searchParams.get("dataSets").includes("airQuality")) {
																/******************  initialization start  *******************/
																let airQuality = {
																	"categoryIndex": weather.airQuality()?.categoryIndex(),
																	"index": weather.airQuality()?.index(),
																	"isSignificant": weather.airQuality()?.isSignificant(),
																	"metadata": {
																		"attributionUrl": weather.airQuality()?.metadata()?.attributionUrl(),
																		"expireTime": weather.airQuality()?.metadata()?.expireTime(),
																		"language": weather.airQuality()?.metadata()?.language(),
																		"latitude": weather.airQuality()?.metadata()?.latitude(),
																		"longitude": weather.airQuality()?.metadata()?.longitude(),
																		"providerName": weather.airQuality()?.metadata()?.providerName(),
																		"readTime": weather.airQuality()?.metadata()?.readTime(),
																		"reportedTime": weather.airQuality()?.metadata()?.reportedTime(),
																		"sourceType": WK2.SourceType[weather.airQuality()?.metadata()?.sourceType()],
																		//"temporarilyUnavailable": weather.airQuality()?.metadata()?.temporarilyUnavailable(),
																	},
																	"pollutants": [],
																	"previousDayComparison": WK2.ComparisonType[weather.airQuality()?.previousDayComparison()],
																	"primaryPollutant": WK2.PollutantType[weather.airQuality()?.primaryPollutant()],
																	"scale": weather.airQuality()?.scale(),
																};
																for (i = 0; i < weather.airQuality()?.pollutantsLength(); i++) airQuality.pollutants.push({
																	"amount": weather.airQuality()?.pollutants(i)?.amount(),
																	"pollutantType": WK2.PollutantType[weather.airQuality()?.pollutants(i)?.pollutantType()],
																	"units": WK2.UnitType[weather.airQuality()?.pollutants(i)?.units()],
																});
																/******************  initialization finish  *******************/
																$.log(`🚧 airQuality: ${JSON.stringify(airQuality)}`, "");
																//WK2.Weather.addAirQuality(builder, WK2.AirQuality.createAirQuality(builder, airQuality.categoryIndex, airQuality.index, airQuality.isSignificant, WK2.MetacreateMetadata(builder, builder.createString(airQuality.metaattributionUrl), airQuality.metaexpireTime, builder.createString(airQuality.metalanguage), airQuality.metalatitude, airQuality.metalongitude, builder.createString(airQuality.metaproviderName), airQuality.metareadTime, airQuality.metareportedTime, WK2.SourceType[airQuality.metasourceType], airQuality.metatemporarilyUnavailable), airQuality.pollutants.map(p => WK2.Pollutant.createPollutant(builder, p.amount, WK2.PollutantType[p.pollutantType], WK2.UnitType[p.units])), WK2.ComparisonType[airQuality.previousDayComparison], WK2.PollutantType[airQuality.primaryPollutant], airQuality.scale));
															};
															if (url.searchParams.get("dataSets").includes("currentWeather")) {
																//WK2.Weather.addCurrentWeather(builder, weather.currentWeather());
															};
															if (url.searchParams.get("dataSets").includes("forecastDaily")) {
																//WK2.Weather.addForecastDaily(builder, weather.forecastDaily());
															};
															if (url.searchParams.get("dataSets").includes("forecastHourly")) {
																//WK2.Weather.addForecastHourly(builder, weather.forecastHourly());
															};
															if (url.searchParams.get("dataSets").includes("forecastNextHour")) {
																/******************  initialization start  *******************/
																let forecastNextHour = {
																	"condition": [],
																	"forecastEnd": weather.forecastNextHour()?.forecastEnd(),
																	"forecastStart": weather.forecastNextHour()?.forecastStart(),
																	"metadata": {
																		"attributionUrl": weather.forecastNextHour()?.metadata()?.attributionUrl(),
																		"expireTime": weather.forecastNextHour()?.metadata()?.expireTime(),
																		"language": weather.forecastNextHour()?.metadata()?.language(),
																		"latitude": weather.forecastNextHour()?.metadata()?.latitude(),
																		"longitude": weather.forecastNextHour()?.metadata()?.longitude(),
																		"providerName": weather.forecastNextHour()?.metadata()?.providerName(),
																		"readTime": weather.forecastNextHour()?.metadata()?.readTime(),
																		"reportedTime": weather.forecastNextHour()?.metadata()?.reportedTime(),
																		"sourceType": WK2.SourceType[weather.forecastNextHour()?.metadata()?.sourceType()],
																		//"temporarilyUnavailable": weather.forecastNextHour()?.metadata()?.temporarilyUnavailable(),
																	},
																	"minutes": [],
																	"summary": []
																};
																for (i = 0; i < weather.forecastNextHour()?.conditionLength(); i++) {
																	let condition = {
																		"beginCondition": WK2.WeatherCondition[weather.forecastNextHour()?.condition(i)?.beginCondition()],
																		"endCondition": WK2.WeatherCondition[weather.forecastNextHour()?.condition(i)?.endCondition()],
																		"forecastToken": WK2.ForecastToken[weather.forecastNextHour()?.condition(i)?.forecastToken()],
																		"parameters": [],
																		"startTime": weather.forecastNextHour()?.condition(i)?.startTime(),
																	}
																	for (j = 0; j < weather.forecastNextHour()?.condition(i)?.parametersLength(); j++) condition.parameters.push({
																		"date": weather.forecastNextHour()?.condition(i)?.parameters(j)?.date(),
																		"type": WK2.ParameterType[weather.forecastNextHour()?.condition(i)?.parameters(j)?.type()],
																	});
																	forecastNextHour.condition.push(condition);
																};
																for (i = 0; i < weather.forecastNextHour()?.minutesLength(); i++) forecastNextHour.minutes.push({
																	"perceivedPrecipitationIntensity": weather.forecastNextHour()?.minutes(i)?.perceivedPrecipitationIntensity(),
																	"precipitationChance": weather.forecastNextHour()?.minutes(i)?.precipitationChance(),
																	"precipitationIntensity": weather.forecastNextHour()?.minutes(i)?.precipitationIntensity(),
																	"startTime": weather.forecastNextHour()?.minutes(i)?.startTime(),
																});
																for (i = 0; i < weather.forecastNextHour()?.summaryLength(); i++) forecastNextHour.summary.push({
																	"condition": WK2.PrecipitationType[weather.forecastNextHour()?.summary(i)?.condition()],
																	"precipitationChance": weather.forecastNextHour()?.summary(i)?.precipitationChance(),
																	"precipitationIntensity": weather.forecastNextHour()?.summary(i)?.precipitationIntensity(),
																	"startTime": weather.forecastNextHour()?.summary(i)?.startTime(),
																});
																/******************  initialization finish  *******************/
																$.log(`🚧 forecastNextHour: ${JSON.stringify(forecastNextHour)}`, "");
																//WK2.Weather.addForecastNextHour(builder, WK2.ForecastNextHour.createForecastNextHour(builder, forecastNextHour.condition.map(c => WK2.Condition.createCondition(builder, WK2.WeatherCondition[c.beginCondition], WK2.WeatherCondition[c.endCondition], WK2.ForecastToken[c.forecastToken], c.parameters.map(p => WK2.Parameter.createParameter(builder, p.date, WK2.ParameterType[p.type])), c.startTime)), forecastNextHour.forecastEnd, forecastNextHour.forecastStart, WK2.MetacreateMetadata(builder, builder.createString(forecastNextHour.metaattributionUrl), forecastNextHour.metaexpireTime, builder.createString(forecastNextHour.metalanguage), forecastNextHour.metalatitude, forecastNextHour.metalongitude, builder.createString(forecastNextHour.metaproviderName), forecastNextHour.metareadTime, forecastNextHour.metareportedTime, WK2.SourceType[forecastNextHour.metasourceType], forecastNextHour.metatemporarilyUnavailable), forecastNextHour.minutes.map(m => WK2.Minute.createMinute(builder, m.perceivedPrecipitationIntensity, m.precipitationChance, m.precipitationIntensity, m.startTime)), forecastNextHour.summary.map(s => WK2.Summary.createSummary(builder, WK2.PrecipitationType[s.condition], s.precipitationChance, s.precipitationIntensity, s.startTime))));
															};
															if (url.searchParams.get("dataSets").includes("news")) {
																//WK2.Weather.addNews(builder, weather.news());
															}
															if (url.searchParams.get("dataSets").includes("weatherAlerts")) {
																//WK2.Weather.addWeatherAlerts(builder, weather.weatherAlerts())
															};
															if (url.searchParams.get("dataSets").includes("weatherChange")) {
																//WK2.Weather.addWeatherChanges(builder, weather.weatherChanges())
															};
															if (url.searchParams.get("dataSets").includes("trendComparison")) {
																//WK2.Weather.addHistoricalComparisons(builder, weather.historicalComparisons())
															};
															let data = WK2.Weather.endWeather(builder);
															//$.log(`🚧 data: ${JSON.stringify(data)}`, "");
															builder.finish(data);
															break;
													};
													break;
											};
											break;
									};
									break;
							};
							//rawBody = builder.asUint8Array(); // Of type `Uint8Array`.
							break;
						case "application/protobuf":
						case "application/x-protobuf":
						case "application/vnd.google.protobuf":
							break;
						case "application/grpc":
						case "application/grpc+proto":
							break;
						case "application/octet-stream":
							break;
					};
					// 写入二进制数据
					$response.body = rawBody;
					break;
			};
			break;
		case false:
			break;
	};
})()
	.catch((e) => $.logErr(e))
	.finally(() => $.done($response))
