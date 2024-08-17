import _ from './ENV/Lodash.mjs'
import $Storage from './ENV/$Storage.mjs'
import ENV from "./ENV/ENV.mjs";

import Database from "./database/index.mjs";
import setENV from "./function/setENV.mjs";

import * as flatbuffers from "../node_modules/flatbuffers/mjs/flatbuffers.js";
import * as WK2 from "./flatbuffers/wk2.js";

const $ = new ENV(" iRingo: 🌤 WeatherKit v1.0.6(4028) response.beta");

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
							let data = {};
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
															if (url.searchParams.get("dataSets").includes("airQuality")) {
																data.airQuality = {
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
																for (i = 0; i < weather.airQuality()?.pollutantsLength(); i++) data.airQuality.pollutants.push({
																	"amount": weather.airQuality()?.pollutants(i)?.amount(),
																	"pollutantType": WK2.PollutantType[weather.airQuality()?.pollutants(i)?.pollutantType()],
																	"units": WK2.UnitType[weather.airQuality()?.pollutants(i)?.units()],
																});
															};
															if (url.searchParams.get("dataSets").includes("forecastNextHour")) {
																data.forecastNextHour = {
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
																	data.forecastNextHour.condition.push(condition);
																};
																for (i = 0; i < weather.forecastNextHour()?.minutesLength(); i++) data.forecastNextHour.minutes.push({
																	"perceivedPrecipitationIntensity": weather.forecastNextHour()?.minutes(i)?.perceivedPrecipitationIntensity(),
																	"precipitationChance": weather.forecastNextHour()?.minutes(i)?.precipitationChance(),
																	"precipitationIntensity": weather.forecastNextHour()?.minutes(i)?.precipitationIntensity(),
																	"startTime": weather.forecastNextHour()?.minutes(i)?.startTime(),
																});
																for (i = 0; i < weather.forecastNextHour()?.summaryLength(); i++) data.forecastNextHour.summary.push({
																	"condition": WK2.PrecipitationType[weather.forecastNextHour()?.summary(i)?.condition()],
																	"precipitationChance": weather.forecastNextHour()?.summary(i)?.precipitationChance(),
																	"precipitationIntensity": weather.forecastNextHour()?.summary(i)?.precipitationIntensity(),
																	"startTime": weather.forecastNextHour()?.summary(i)?.startTime(),
																});
															};
															/******************  initialization finish  *******************/
															$.log(`🚧 data: ${JSON.stringify(data)}`, "");
															/******************  initialization start  *******************/
															/******************  initialization finish  *******************/
															break;
													};
													break;
											};
											break;
									};
									break;
							};
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
