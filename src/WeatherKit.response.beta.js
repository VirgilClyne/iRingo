import _ from './ENV/Lodash.mjs'
import $Storage from './ENV/$Storage.mjs'
import ENV from "./ENV/ENV.mjs";

import Database from "./database/index.mjs";
import setENV from "./function/setENV.mjs";

import * as flatbuffers from 'flatbuffers';
import * as WK2 from "./flatbuffers/wk2.js";

const $ = new ENV(" iRingo: 🌤 WeatherKit v1.0.11(4049) response.beta");

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
									if (PATH.startsWith("/api/v2/weather/")) {
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
													"providerLogo": weather.airQuality()?.metadata()?.providerLogo(),
													"providerName": weather.airQuality()?.metadata()?.providerName(),
													"readTime": weather.airQuality()?.metadata()?.readTime(),
													"reportedTime": weather.airQuality()?.metadata()?.reportedTime(),
													"unknown9": weather.airQuality()?.metadata()?.unknown9(),
													"sourceType": WK2.SourceType[weather.airQuality()?.metadata()?.sourceType()],
													"unknown11": weather.airQuality()?.metadata()?.unknown11(),
													//"temporarilyUnavailable": weather.airQuality()?.metadata()?.temporarilyUnavailable(),
												},
												"pollutants": [],
												"previousDayComparison": WK2.ComparisonTrend[weather.airQuality()?.previousDayComparison()],
												"primaryPollutant": WK2.PollutantType[weather.airQuality()?.primaryPollutant()],
												"scale": weather.airQuality()?.scale(),
											};
											for (i = 0; i < weather.airQuality()?.pollutantsLength(); i++) airQuality.pollutants.push({
												"amount": weather.airQuality()?.pollutants(i)?.amount(),
												"pollutantType": WK2.PollutantType[weather.airQuality()?.pollutants(i)?.pollutantType()],
												"units": WK2.UnitType[weather.airQuality()?.pollutants(i)?.units()],
											});
											/******************  initialization finish  *******************/
											$.log(`🚧 airQuality: ${JSON.stringify(airQuality, null, 2)}`, "");
											//WK2.Weather.addAirQuality(builder, WK2.AirQuality.createAirQuality(builder, airQuality.categoryIndex, airQuality.index, airQuality.isSignificant, WK2.MetacreateMetadata(builder, builder.createString(airQuality.metaattributionUrl), airQuality.metaexpireTime, builder.createString(airQuality.metalanguage), airQuality.metalatitude, airQuality.metalongitude, builder.createString(airQuality.metaproviderName), airQuality.metareadTime, airQuality.metareportedTime, WK2.SourceType[airQuality.metasourceType], airQuality.metatemporarilyUnavailable), airQuality.pollutants.map(p => WK2.Pollutant.createPollutant(builder, p.amount, WK2.PollutantType[p.pollutantType], WK2.UnitType[p.units])), WK2.ComparisonType[airQuality.previousDayComparison], WK2.PollutantType[airQuality.primaryPollutant], airQuality.scale));
										};
										if (url.searchParams.get("dataSets").includes("currentWeather")) {
											/******************  initialization start  *******************/
											let currentWeather = {
												"conditionCode": WK2.ConditionCode[weather.currentWeather()?.conditionCode()],
												"metadata": {
													"attributionUrl": weather.currentWeather()?.metadata()?.attributionUrl(),
													"expireTime": weather.currentWeather()?.metadata()?.expireTime(),
													"language": weather.currentWeather()?.metadata()?.language(),
													"latitude": weather.currentWeather()?.metadata()?.latitude(),
													"longitude": weather.currentWeather()?.metadata()?.longitude(),
													"providerLogo": weather.currentWeather()?.metadata()?.providerLogo(),
													"providerName": weather.currentWeather()?.metadata()?.providerName(),
													"readTime": weather.currentWeather()?.metadata()?.readTime(),
													"reportedTime": weather.currentWeather()?.metadata()?.reportedTime(),
													"unknown9": weather.currentWeather()?.metadata()?.unknown9(),
													"sourceType": WK2.SourceType[weather.currentWeather()?.metadata()?.sourceType()],
													"unknown11": weather.currentWeather()?.metadata()?.unknown11(),
													//"temporarilyUnavailable": weather.currentWeather()?.metadata()?.temporarilyUnavailable(),
												},
												"unknown34": weather.currentWeather()?.unknown34(),
											};
											/******************  initialization finish  *******************/
											$.log(`🚧 currentWeather: ${JSON.stringify(currentWeather, null, 2)}`, "");
											//WK2.Weather.addCurrentWeather(builder, weather.currentWeather());
										};
										if (url.searchParams.get("dataSets").includes("forecastDaily")) {
											/******************  initialization start  *******************/
											let forecastDaily = {
												"days": [],
												"metadata": {
													"attributionUrl": weather.forecastDaily()?.metadata()?.attributionUrl(),
													"expireTime": weather.forecastDaily()?.metadata()?.expireTime(),
													"language": weather.forecastDaily()?.metadata()?.language(),
													"latitude": weather.forecastDaily()?.metadata()?.latitude(),
													"longitude": weather.forecastDaily()?.metadata()?.longitude(),
													"providerLogo": weather.forecastDaily()?.metadata()?.providerLogo(),
													"providerName": weather.forecastDaily()?.metadata()?.providerName(),
													"readTime": weather.forecastDaily()?.metadata()?.readTime(),
													"reportedTime": weather.forecastDaily()?.metadata()?.reportedTime(),
													"unknown9": weather.forecastDaily()?.metadata()?.unknown9(),
													"sourceType": WK2.SourceType[weather.forecastDaily()?.metadata()?.sourceType()],
													"unknown11": weather.forecastDaily()?.metadata()?.unknown11(),
													//"temporarilyUnavailable": weather.forecastDaily()?.metadata()?.temporarilyUnavailable(),
												},
											};
											for (i = 0; i < weather.forecastDaily()?.daysLength(); i++) {
												let day = {
													"conditionCode": WK2.ConditionCode[weather.forecastDaily()?.days(i)?.conditionCode()],
													"moonPhase": WK2.MoonPhase[weather.forecastDaily()?.days(i)?.moonPhase()],
													"precipitationType": WK2.PrecipitationType[weather.forecastDaily()?.days(i)?.precipitationType()],

												};
												forecastDaily.days.push(day);
											};
											/******************  initialization finish  *******************/
											$.log(`🚧 forecastDaily: ${JSON.stringify(forecastDaily, null, 2)}`, "");
											//WK2.Weather.addForecastDaily(builder, weather.forecastDaily());
										};
										if (url.searchParams.get("dataSets").includes("forecastHourly")) {
											/******************  initialization start  *******************/
											let forecastHourly = {
												"metadata": {
													"attributionUrl": weather.forecastHourly()?.metadata()?.attributionUrl(),
													"expireTime": weather.forecastHourly()?.metadata()?.expireTime(),
													"language": weather.forecastHourly()?.metadata()?.language(),
													"latitude": weather.forecastHourly()?.metadata()?.latitude(),
													"longitude": weather.forecastHourly()?.metadata()?.longitude(),
													"providerLogo": weather.forecastHourly()?.metadata()?.providerLogo(),
													"providerName": weather.forecastHourly()?.metadata()?.providerName(),
													"readTime": weather.forecastHourly()?.metadata()?.readTime(),
													"reportedTime": weather.forecastHourly()?.metadata()?.reportedTime(),
													"unknown9": weather.forecastHourly()?.metadata()?.unknown9(),
													"sourceType": WK2.SourceType[weather.forecastHourly()?.metadata()?.sourceType()],
													"unknown11": weather.forecastHourly()?.metadata()?.unknown11(),
													//"temporarilyUnavailable": weather.forecastHourly()?.metadata()?.temporarilyUnavailable(),
												},
												"hours": [],
											};
											for (i = 0; i < weather.forecastHourly()?.hoursLength(); i++) forecastHourly.hours.push({
												"conditionCode": WK2.ConditionCode[weather.forecastHourly()?.hours(i)?.conditionCode()],
												"precipitationType": WK2.PrecipitationType[weather.forecastHourly()?.hours(i)?.precipitationType()],
												"snowfallAmount": weather.forecastHourly()?.hours(i)?.snowfallAmount(),
												"snowfallIntensity": weather.forecastHourly()?.hours(i)?.snowfallIntensity(),
											});
											/******************  initialization finish  *******************/
											$.log(`🚧 forecastHourly: ${JSON.stringify(forecastHourly, null, 2)}`, "");
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
													"providerLogo": weather.forecastNextHour()?.metadata()?.providerLogo(),
													"providerName": weather.forecastNextHour()?.metadata()?.providerName(),
													"readTime": weather.forecastNextHour()?.metadata()?.readTime(),
													"reportedTime": weather.forecastNextHour()?.metadata()?.reportedTime(),
													"unknown9": weather.forecastNextHour()?.metadata()?.unknown9(),
													"sourceType": WK2.SourceType[weather.forecastNextHour()?.metadata()?.sourceType()],
													"unknown11": weather.forecastNextHour()?.metadata()?.unknown11(),
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
											$.log(`🚧 forecastNextHour: ${JSON.stringify(forecastNextHour, null, 2)}`, "");
											//WK2.Weather.addForecastNextHour(builder, WK2.ForecastNextHour.createForecastNextHour(builder, forecastNextHour.condition.map(c => WK2.Condition.createCondition(builder, WK2.WeatherCondition[c.beginCondition], WK2.WeatherCondition[c.endCondition], WK2.ForecastToken[c.forecastToken], c.parameters.map(p => WK2.Parameter.createParameter(builder, p.date, WK2.ParameterType[p.type])), c.startTime)), forecastNextHour.forecastEnd, forecastNextHour.forecastStart, WK2.MetacreateMetadata(builder, builder.createString(forecastNextHour.metaattributionUrl), forecastNextHour.metaexpireTime, builder.createString(forecastNextHour.metalanguage), forecastNextHour.metalatitude, forecastNextHour.metalongitude, builder.createString(forecastNextHour.metaproviderName), forecastNextHour.metareadTime, forecastNextHour.metareportedTime, WK2.SourceType[forecastNextHour.metasourceType], forecastNextHour.metatemporarilyUnavailable), forecastNextHour.minutes.map(m => WK2.Minute.createMinute(builder, m.perceivedPrecipitationIntensity, m.precipitationChance, m.precipitationIntensity, m.startTime)), forecastNextHour.summary.map(s => WK2.Summary.createSummary(builder, WK2.PrecipitationType[s.condition], s.precipitationChance, s.precipitationIntensity, s.startTime))));
										};
										if (url.searchParams.get("dataSets").includes("news")) {
											/******************  initialization start  *******************/
											let news = {
												"metadata": {
													"attributionUrl": weather.news()?.metadata()?.attributionUrl(),
													"expireTime": weather.news()?.metadata()?.expireTime(),
													"language": weather.news()?.metadata()?.language(),
													"latitude": weather.news()?.metadata()?.latitude(),
													"longitude": weather.news()?.metadata()?.longitude(),
													"providerLogo": weather.news()?.metadata()?.providerLogo(),
													"providerName": weather.news()?.metadata()?.providerName(),
													"readTime": weather.news()?.metadata()?.readTime(),
													"reportedTime": weather.news()?.metadata()?.reportedTime(),
													"unknown9": weather.news()?.metadata()?.unknown9(),
													"sourceType": WK2.SourceType[weather.news()?.metadata()?.sourceType()],
													"unknown11": weather.news()?.metadata()?.unknown11(),
													//"temporarilyUnavailable": weather.news()?.metadata()?.temporarilyUnavailable(),
												},
												"placements": [],
											};
											for (i = 0; i < weather.news()?.placementsLength(); i++) {
												let placement = {
													"articles": [],
													"placement": WK2.PlacementType[weather.news()?.placements(i)?.placement()],
													"priority": weather.news()?.placements(i)?.priority(),
												};
												for (j = 0; j < weather.news()?.placements(i)?.articlesLength(); j++) {
													let article = {
														"alertIds": [],
														"headlineOverride": weather.news()?.placements(i)?.articles(j)?.headlineOverride(),
														"id": weather.news()?.placements(i)?.articles(j)?.id(),
														"locale": weather.news()?.placements(i)?.articles(j)?.locale(),
														"phenomena": [],
														"supportedStorefronts": [],
													};
													for (k = 0; k < weather.news()?.placements(i)?.articles(j)?.alertIdsLength(); k++) article.alertIds.push(weather.news()?.placements(i)?.articles(j)?.alertIds(k));
													for (k = 0; k < weather.news()?.placements(i)?.articles(j)?.phenomenaLength(); k++) article.phenomena.push(weather.news()?.placements(i)?.articles(j)?.phenomena(k));
													for (k = 0; k < weather.news()?.placements(i)?.articles(j)?.supportedStorefrontsLength(); k++) article.supportedStorefronts.push(weather.news()?.placements(i)?.articles(j)?.supportedStorefronts(k));
													placement.articles.push(article);
												};
												news.placements.push(placement);
											};
											/******************  initialization finish  *******************/
											$.log(`🚧 news: ${JSON.stringify(news, null, 2)}`, "");
											//WK2.Weather.addNews(builder, weather.news());
										}
										if (url.searchParams.get("dataSets").includes("weatherAlerts")) {
											/******************  initialization start  *******************/
											let weatherAlerts = {
												"alerts": [],
												"detailsUrl": weather.weatherAlerts()?.detailsUrl(),
												"metadata": {
													"attributionUrl": weather.weatherAlerts()?.metadata()?.attributionUrl(),
													"expireTime": weather.weatherAlerts()?.metadata()?.expireTime(),
													"language": weather.weatherAlerts()?.metadata()?.language(),
													"latitude": weather.weatherAlerts()?.metadata()?.latitude(),
													"longitude": weather.weatherAlerts()?.metadata()?.longitude(),
													"providerLogo": weather.weatherAlerts()?.metadata()?.providerLogo(),
													"providerName": weather.weatherAlerts()?.metadata()?.providerName(),
													"readTime": weather.weatherAlerts()?.metadata()?.readTime(),
													"reportedTime": weather.weatherAlerts()?.metadata()?.reportedTime(),
													"unknown9": weather.weatherAlerts()?.metadata()?.unknown9(),
													"sourceType": WK2.SourceType[weather.weatherAlerts()?.metadata()?.sourceType()],
													"unknown11": weather.weatherAlerts()?.metadata()?.unknown11(),
													//"temporarilyUnavailable": weather.weatherAlerts()?.metadata()?.temporarilyUnavailable(),
												},
											};
											for (i = 0; i < weather.weatherAlerts()?.alertsLength(); i++) {
												let alert = {
													"areaId": weather.weatherAlerts()?.alerts(i)?.areaId(),
													"attributionUrl": weather.weatherAlerts()?.alerts(i)?.attributionUrl(),
													"certainty": WK2.Certainty[weather.weatherAlerts()?.alerts(i)?.certainty()],
													"countryCode": weather.weatherAlerts()?.alerts(i)?.countryCode(),
													"description": weather.weatherAlerts()?.alerts(i)?.description(),
													"detailsUrl": weather.weatherAlerts()?.alerts(i)?.detailsUrl(),
													"effectiveTime": weather.weatherAlerts()?.alerts(i)?.effectiveTime(),
													"eventEndTime": weather.weatherAlerts()?.alerts(i)?.eventEndTime(),
													"eventOnsetTime": weather.weatherAlerts()?.alerts(i)?.eventOnsetTime(),
													"eventSource": weather.weatherAlerts()?.alerts(i)?.eventSource(),
													"expireTime": weather.weatherAlerts()?.alerts(i)?.expireTime(),
													"id": weather.weatherAlerts()?.alerts(i)?.id(),
													"importance": WK2.ImportanceType[weather.weatherAlerts()?.alerts(i)?.importance()],
													"issuedTime": weather.weatherAlerts()?.alerts(i)?.issuedTime(),
													"phenomenon": weather.weatherAlerts()?.alerts(i)?.phenomenon(),
													"responses": [],
													"severity": WK2.Severity[weather.weatherAlerts()?.alerts(i)?.severity()],
													"significance": WK2.SignificanceType[weather.weatherAlerts()?.alerts(i)?.significance()],
													"source": weather.weatherAlerts()?.alerts(i)?.source(),
													"token": weather.weatherAlerts()?.alerts(i)?.token(),
													"urgency": WK2.Urgency[weather.weatherAlerts()?.alerts(i)?.urgency()],
												};
												for (j = 0; j < weather.weatherAlerts()?.alerts(i)?.responsesLength(); j++) alert.responses.push(WK2.ResponseType[weather.weatherAlerts()?.alerts(i)?.responses(j)]);
												weatherAlerts.alerts.push(alert);
											};
											/******************  initialization finish  *******************/
											$.log(`🚧 weatherAlerts: ${JSON.stringify(weatherAlerts, null, 2)}`, "");
											//WK2.Weather.addWeatherAlerts(builder, weather.weatherAlerts())
										};
										if (url.searchParams.get("dataSets").includes("weatherChange")) {
											/******************  initialization start  *******************/
											let weatherChanges = {
												"changes": [],
												"forecastEnd": weather.weatherChanges()?.forecastEnd(),
												"forecastStart": weather.weatherChanges()?.forecastStart(),
												"metadata": {
													"attributionUrl": weather.weatherChanges()?.metadata()?.attributionUrl(),
													"expireTime": weather.weatherChanges()?.metadata()?.expireTime(),
													"language": weather.weatherChanges()?.metadata()?.language(),
													"latitude": weather.weatherChanges()?.metadata()?.latitude(),
													"longitude": weather.weatherChanges()?.metadata()?.longitude(),
													"providerLogo": weather.weatherChanges()?.metadata()?.providerLogo(),
													"providerName": weather.weatherChanges()?.metadata()?.providerName(),
													"readTime": weather.weatherChanges()?.metadata()?.readTime(),
													"reportedTime": weather.weatherChanges()?.metadata()?.reportedTime(),
													"unknown9": weather.weatherChanges()?.metadata()?.unknown9(),
													"sourceType": WK2.SourceType[weather.weatherChanges()?.metadata()?.sourceType()],
													"unknown11": weather.weatherChanges()?.metadata()?.unknown11(),
													//"temporarilyUnavailable": weather.weatherChanges()?.metadata()?.temporarilyUnavailable(),
												},
											};
											for (i = 0; i < weather.weatherChanges()?.changesLength(); i++) {
												let change = {
													"dayPrecipitationChange": WK2.ChangeTrend[weather.weatherChanges()?.changes(i)?.dayPrecipitationChange()],
													"forecastEnd": weather.weatherChanges()?.changes(i)?.forecastEnd(),
													"forecastStart": weather.weatherChanges()?.changes(i)?.forecastStart(),
													"maxTemperatureChange": WK2.ChangeTrend[weather.weatherChanges()?.changes(i)?.maxTemperatureChange()],
													"minTemperatureChange": WK2.ChangeTrend[weather.weatherChanges()?.changes(i)?.minTemperatureChange()],
													"nightPrecipitationChange": WK2.ChangeTrend[weather.weatherChanges()?.changes(i)?.nightPrecipitationChange()],
												};
												weatherChanges.changes.push(change);
											};
											/******************  initialization finish  *******************/
											$.log(`🚧 weatherChanges: ${JSON.stringify(weatherChanges, null, 2)}`, "");
											//WK2.Weather.addWeatherChanges(builder, weather.weatherChanges())
										};
										if (url.searchParams.get("dataSets").includes("trendComparison")) {
											/******************  initialization start  *******************/
											let historicalComparisons = {
												"comparisons": [],
												"metadata": {
													"attributionUrl": weather.historicalComparisons()?.metadata()?.attributionUrl(),
													"expireTime": weather.historicalComparisons()?.metadata()?.expireTime(),
													"language": weather.historicalComparisons()?.metadata()?.language(),
													"latitude": weather.historicalComparisons()?.metadata()?.latitude(),
													"longitude": weather.historicalComparisons()?.metadata()?.longitude(),
													"providerLogo": weather.historicalComparisons()?.metadata()?.providerLogo(),
													"providerName": weather.historicalComparisons()?.metadata()?.providerName(),
													"readTime": weather.historicalComparisons()?.metadata()?.readTime(),
													"reportedTime": weather.historicalComparisons()?.metadata()?.reportedTime(),
													"unknown9": weather.historicalComparisons()?.metadata()?.unknown9(),
													"sourceType": WK2.SourceType[weather.historicalComparisons()?.metadata()?.sourceType()],
													"unknown11": weather.historicalComparisons()?.metadata()?.unknown11(),
													//"temporarilyUnavailable": weather.historicalComparisons()?.metadata()?.temporarilyUnavailable(),
												},
											};
											for (i = 0; i < weather.historicalComparisons()?.comparisonsLength(); i++) {
												let comparison = {
													"baselineStartDate": weather.historicalComparisons()?.comparisons(i)?.baselineStartDate(),
													"baselineType": weather.historicalComparisons()?.comparisons(i)?.baselineType(),
													"baselineValue": weather.historicalComparisons()?.comparisons(i)?.baselineValue(),
													"condition": WK2.ComparisonType[weather.historicalComparisons()?.comparisons(i)?.condition()],
													"currentValue": weather.historicalComparisons()?.comparisons(i)?.currentValue(),
													"deviation": WK2.DeviationType[weather.historicalComparisons()?.comparisons(i)?.deviation()],
												};
												historicalComparisons.comparisons.push(comparison);
											};
											/******************  initialization finish  *******************/
											$.log(`🚧 historicalComparisons: ${JSON.stringify(historicalComparisons, null, 2)}`, "");
											//WK2.Weather.addHistoricalComparisons(builder, weather.historicalComparisons())
										};
										let data = WK2.Weather.endWeather(builder);
										//$.log(`🚧 data: ${JSON.stringify(data)}`, "");
										builder.finish(data);
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
