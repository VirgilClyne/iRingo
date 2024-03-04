import _ from './ENV/Lodash.mjs'
import $Storage from './ENV/$Storage.mjs'
import ENV from "./ENV/ENV.mjs";
import URI from "./URI/URI.mjs";

import Database from "./database/index.mjs";
import setENV from "./function/setENV.mjs";

const $ = new ENV(" iRingo: 🔍 Siri v3.0.4(2) response");

/***************** Processing *****************/
// 解构URL
const URL = URI.parse($request.url);
$.log(`⚠ URL: ${JSON.stringify(URL)}`, "");
// 获取连接参数
const METHOD = $request.method, HOST = URL.host, PATH = URL.path, PATHs = URL.paths;
$.log(`⚠ METHOD: ${METHOD}`, "");
// 解析格式
const FORMAT = ($response.headers?.["Content-Type"] ?? $response.headers?.["content-type"])?.split(";")?.[0];
$.log(`⚠ FORMAT: ${FORMAT}`, "");
(async () => {
	const { Settings, Caches, Configs } = setENV("iRingo", "Siri", Database);
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
					break;
				case "application/x-mpegURL":
				case "application/x-mpegurl":
				case "application/vnd.apple.mpegurl":
				case "audio/mpegurl":
						break;
				case "text/xml":
				case "text/html":
				case "text/plist":
				case "application/xml":
				case "application/plist":
				case "application/x-plist":
					break;
				case "text/vtt":
				case "application/vtt":
					break;
				case "text/json":
				case "application/json":
					body = JSON.parse($response.body ?? "{}");
					// 主机判断
					switch (HOST) {
						case "api.smoot.apple.com":
						case "api.smoot.apple.cn":
							// 路径判断
							switch (PATH) {
								case "bag": // 配置
									body.enabled = true;
									body.feedback_enabled = true;
									if (body?.enabled_domains) {
										body.enabled_domains = [...new Set([...body?.enabled_domains ?? [], ...Settings.Domains])];
										$.log(`🎉 领域列表`, `enabled_domains: ${JSON.stringify(body.enabled_domains)}`, "");
									}
									if (body?.scene_aware_lookup_enabled_domains) {
										body.scene_aware_lookup_enabled_domains = [...new Set([...body?.scene_aware_lookup_enabled_domains ?? [], ...Settings.Domains])];
										$.log(`🎉 领域列表`, `scene_aware_lookup_enabled_domains: ${JSON.stringify(body.scene_aware_lookup_enabled_domains)}`, "");
									}
									body.min_query_len = 3;
									let Overrides = body?.overrides;
									if (Overrides) {
										Settings.Functions.forEach(app => {
											let APP = Overrides?.[`${app}`];
											if (APP) {
												APP.enabled = true;
												APP.feedback_enabled = true;
											} else APP = { enabled: true, feedback_enabled: true };
										});
										let FlightUtilities = Overrides?.flightutilities;
										if (FlightUtilities) {
										};
										let Lookup = Overrides?.lookup;
										if (Lookup) {
											Lookup.min_query_len = 2;
										};
										let Mail = Overrides?.mail;
										let Messages = Overrides?.messages;
										let News = Overrides?.news;
										let Safari = Overrides?.safari;
										if (Safari) {
											Safari.experiments_custom_feedback_enabled = true;
										};
										let Spotlight = Overrides?.spotlight;
										if (Spotlight) {
											Spotlight.use_twolayer_ranking = true;
											Spotlight.experiments_custom_feedback_enabled = true;
											Spotlight.min_query_len = 2;
											Spotlight.collect_scores = true;
											Spotlight.collect_anonymous_metadata = true;
										};
										let VisualIntelligence = Overrides?.visualintelligence;
										if (VisualIntelligence) {
											VisualIntelligence.enabled_domains = [...new Set([...VisualIntelligence.enabled_domains ?? [], ...Configs.VisualIntelligence.enabled_domains])];
											VisualIntelligence.supported_domains = [...new Set([...VisualIntelligence.supported_domains ?? [], ...Configs.VisualIntelligence.supported_domains])];
										};
									};
									// Safari Smart History
									body.safari_smart_history_enabled = (Settings.Safari_Smart_History) ? true : false;
									body.smart_history_feature_feedback_enabled = (Settings.Safari_Smart_History) ? true : false;
									break;
							};
							break;
						case "fbs.smoot.apple.com":
							break;
						case "cdn.smoot.apple.com":
							break;
						default: // 其他主机
							// 路径判断
							switch (PATH) {
								case "warm":
								case "render":
								case "flight": // 航班
									break;
								case "search": // 搜索
									break;
								case "card": // 卡片
									break;
							};
							break;
					};
					$response.body = JSON.stringify(body);
					break;
				case "application/protobuf":
				case "application/x-protobuf":
				case "application/vnd.google.protobuf":
				case "application/grpc":
				case "application/grpc+proto":
				case "application/octet-stream":
					break;
			};
			break;
		case false:
			break;
	};
})()
	.catch((e) => $.logErr(e))
	.finally(() => $.done($response))
