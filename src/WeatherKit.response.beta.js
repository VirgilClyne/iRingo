import _ from './ENV/Lodash.mjs'
import $Storage from './ENV/$Storage.mjs'
import ENV from "./ENV/ENV.mjs";

import Database from "./database/index.mjs";
import setENV from "./function/setENV.mjs";
import WeatherKit2 from "./class/WeatherKit2.mjs";

import * as flatbuffers from 'flatbuffers';

const $ = new ENV(" iRingo: 🌤 WeatherKit v1.1.0(4070) response.beta");

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
							const ByteBuffer = new flatbuffers.ByteBuffer(rawBody);
							const Builder = new flatbuffers.Builder();
							// 主机判断
							switch (HOST) {
								case "weatherkit.apple.com":
									// 路径判断
									if (PATH.startsWith("/api/v2/weather/")) {
										/******************  initialization start  *******************/
										//const weatherData = WK2.Weather.getRootAsWeather(body);
										const weatherKit2 = new WeatherKit2({ "bb": ByteBuffer, "initialSize": 10240 });
										const Offset = {};
										if (url.searchParams.get("dataSets").includes("airQuality")) {
											body.airQuality = weatherKit2.decode("airQuality");
											$.log(`🚧 body.airQuality: ${JSON.stringify(body.airQuality, null, 2)}`, "");
											Offset.airQualityOffset = weatherKit2.encode(Builder, "airQuality", body.airQuality);
										};
										if (url.searchParams.get("dataSets").includes("currentWeather")) {
											body.currentWeather = weatherKit2.decode("currentWeather");
											$.log(`🚧 body.currentWeather: ${JSON.stringify(body.currentWeather, null, 2)}`, "");
											Offset.currentWeatherOffset = weatherKit2.encode(Builder, "currentWeather", body.currentWeather);
										};
										if (url.searchParams.get("dataSets").includes("forecastDaily")) {
											body.forecastDaily = weatherKit2.decode("forecastDaily");
											//$.log(`🚧 body.forecastDaily: ${JSON.stringify(body.forecastDaily, null, 2)}`, "");
										};
										if (url.searchParams.get("dataSets").includes("forecastHourly")) {
											body.forecastHourly = weatherKit2.decode("forecastHourly");
											//$.log(`🚧 body.forecastHourly: ${JSON.stringify(body.forecastHourly, null, 2)}`, "");
										};
										if (url.searchParams.get("dataSets").includes("forecastNextHour")) {
											body.forecastNextHour = weatherKit2.decode("forecastNextHour");
											//$.log(`🚧 body.forecastNextHour: ${JSON.stringify(body.forecastNextHour, null, 2)}`, "");
										};
										if (url.searchParams.get("dataSets").includes("news")) {
											body.news = weatherKit2.decode("news");
											$.log(`🚧 body.news: ${JSON.stringify(body.news, null, 2)}`, "");
										};
										if (url.searchParams.get("dataSets").includes("weatherAlerts")) {
											body.weatherAlerts = weatherKit2.decode("weatherAlerts");
											$.log(`🚧 body.weatherAlerts: ${JSON.stringify(body.weatherAlerts, null, 2)}`, "");
										};
										if (url.searchParams.get("dataSets").includes("weatherChange")) {
											body.weatherChanges = weatherKit2.decode("weatherChange");
											$.log(`🚧 body.weatherChanges: ${JSON.stringify(body.weatherChanges, null, 2)}`, "");
										};
										if (url.searchParams.get("dataSets").includes("trendComparison")) {
											body.historicalComparisons = weatherKit2.decode("trendComparison");
											$.log(`🚧 body.historicalComparisons: ${JSON.stringify(body.historicalComparisons, null, 2)}`, "");
										};
										//$.log(`🚧 body: ${JSON.stringify(body)}`, "");
										let WeatherData = WeatherKit2.createWeather(Builder, Offset.airQualityOffset, Offset.currentWeatherOffset, Offset.forecastDailyOffset, Offset.forecastHourlyOffset, Offset.forecastNextHourOffset, Offset.newsOffset, Offset.weatherAlertsOffset, Offset.weatherChangesOffset, Offset.historicalComparisonsOffset);
										Builder.finish(WeatherData);
										break;
									};
									break;
							};
							//rawBody = Builder.asUint8Array(); // Of type `Uint8Array`.
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
