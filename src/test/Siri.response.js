/*
README: https://github.com/VirgilClyne/iRingo
*/

import ENVs from "../ENV/ENV.mjs";
import URIs from "../URI/URI.mjs";

import * as Default from "../database/Default.json";
import * as Location from "../database/Location.json";
import * as News from "../database/News.json";
import * as PrivateRelay from "../database/PrivateRelay.json";
import * as Siri from "../database/Siri.json";
import * as TestFlight from "../database/TestFlight.json";
import * as TV from "../database/TV.json";

const $ = new ENVs(" iRingo: 🔍 Siri v3.0.3(1) response.beta");
const URI = new URIs();
const DataBase = {
	"Default": Default,
	"Location": Location,
	"News": News,
	"PrivateRelay": PrivateRelay,
	"Siri": Siri,
	"TestFlight": TestFlight,
	"TV": TV,
};

/***************** Processing *****************/
// 解构URL
const URL = URI.parse($request.url);
$.log(`⚠ ${$.name}`, `URL: ${JSON.stringify(URL)}`, "");
// 获取连接参数
const METHOD = $request.method, HOST = URL.host, PATH = URL.path, PATHs = URL.paths;
$.log(`⚠ ${$.name}`, `METHOD: ${METHOD}`, "");
// 解析格式
const FORMAT = ($response.headers?.["Content-Type"] ?? $response.headers?.["content-type"])?.split(";")?.[0];
$.log(`⚠ ${$.name}`, `FORMAT: ${FORMAT}`, "");
(async () => {
	const { Settings, Caches, Configs } = setENV("iRingo", "Siri", DataBase);
	$.log(`⚠ ${$.name}`, `Settings.Switch: ${Settings?.Switch}`, "");
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
				case "text/html":
				default:
					break;
				case "application/x-mpegURL":
				case "application/x-mpegurl":
				case "application/vnd.apple.mpegurl":
				case "audio/mpegurl":
					//body = M3U8.parse($response.body);
					//$.log(`🚧 ${$.name}`, `body: ${JSON.stringify(body)}`, "");
					//$response.body = M3U8.stringify(body);
					break;
				case "text/xml":
				case "text/plist":
				case "application/xml":
				case "application/plist":
				case "application/x-plist":
					//body = XML.parse($response.body);
					//$.log(`🚧 ${$.name}`, `body: ${JSON.stringify(body)}`, "");
					break;
				case "text/vtt":
				case "application/vtt":
					//body = VTT.parse($response.body);
					//$.log(`🚧 ${$.name}`, `body: ${JSON.stringify(body)}`, "");
					//$response.body = VTT.stringify(body);
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
									//body.search_url = body?.search_url || "https:\/\/api-glb-apne1c.smoot.apple.com\/search";
									//body.feedback_url = body?.feedback_url || "https:\/\/fbs.smoot.apple.com\/fb";
									if (body?.enabled_domains) {
										body.enabled_domains = [...new Set([...body?.enabled_domains ?? [], ...Settings.Domains])];
										$.log(`🎉 ${$.name}, 领域列表`, `enabled_domains: ${JSON.stringify(body.enabled_domains)}`, "");
									}
									if (body?.scene_aware_lookup_enabled_domains) {
										body.scene_aware_lookup_enabled_domains = [...new Set([...body?.scene_aware_lookup_enabled_domains ?? [], ...Settings.Domains])];
										$.log(`🎉 ${$.name}, 领域列表`, `scene_aware_lookup_enabled_domains: ${JSON.stringify(body.scene_aware_lookup_enabled_domains)}`, "");
									}
									body.min_query_len = 3;
									let Overrides = body?.overrides;
									if (Overrides) {
										Settings.Functions.forEach(app => {
											let APP = Overrides?.[`${app}`];
											if (APP) {
												APP.enabled = true;
												APP.feedback_enabled = true;
												//APP.min_query_len = 2;
												//APP.search_render_timeout = 200;
												//APP.first_use_description = "";
												//APP.first_use_learn_more = "";
											} else APP = { enabled: true, feedback_enabled: true };
										});
										let FlightUtilities = Overrides?.flightutilities;
										if (FlightUtilities) {
											//FlightUtilities.fallback_flight_url = "https:\/\/api-glb-aps1b.smoot.apple.com\/flight";
											//FlightUtilities.flight_url = "https:\/\/api-glb-apse1c.smoot.apple.com\/flight";
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
									/*
									if (body?.mescal_enabled) {
										body.mescal_enabled = true;
										body.mescal_version = 200;
										body.mescal_cert_url = "https://init.itunes.apple.com/WebObjects/MZInit.woa/wa/signSapSetupCert";
										body.mescal_setup_url = "https://play.itunes.apple.com/WebObjects/MZPlay.woa/wa/signSapSetup";
									}
									let smart_search_v2 = body?.smart_search_v2_parameters;
									if (smart_search_v2) {
										smart_search_v2.smart_history_score_v2_enabled = true;
										smart_search_v2.smart_history_score_v2_enable_count = true;
									};
									body.session_experiment_metadata_enabled = true;
									//body.sample_features = true;
									//body.use_ledbelly = true;
									*/
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
				case "applecation/octet-stream":
					break;
			};
			break;
		case false:
			break;
	};
})()
	.catch((e) => $.logErr(e))
	.finally(() => {
		switch ($response) {
			default: { // 有回复数据，返回回复数据
				//const FORMAT = ($response?.headers?.["Content-Type"] ?? $response?.headers?.["content-type"])?.split(";")?.[0];
				$.log(`🎉 ${$.name}, finally`, `$response`, `FORMAT: ${FORMAT}`, "");
				//$.log(`🚧 ${$.name}, finally`, `$response: ${JSON.stringify($response)}`, "");
				if ($response?.headers?.["Content-Encoding"]) $response.headers["Content-Encoding"] = "identity";
				if ($response?.headers?.["content-encoding"]) $response.headers["content-encoding"] = "identity";
				if ($.isQuanX()) {
					switch (FORMAT) {
						case undefined: // 视为无body
							// 返回普通数据
							$.done({ status: $response.status, headers: $response.headers });
							break;
						default:
							// 返回普通数据
							$.done({ status: $response.status, headers: $response.headers, body: $response.body });
							break;
						case "application/protobuf":
						case "application/x-protobuf":
						case "application/vnd.google.protobuf":
						case "application/grpc":
						case "application/grpc+proto":
						case "applecation/octet-stream":
							// 返回二进制数据
							//$.log(`${$response.bodyBytes.byteLength}---${$response.bodyBytes.buffer.byteLength}`);
							$.done({ status: $response.status, headers: $response.headers, bodyBytes: $response.bodyBytes.buffer.slice($response.bodyBytes.byteOffset, $response.bodyBytes.byteLength + $response.bodyBytes.byteOffset) });
							break;
					};
				} else $.done($response);
				break;
			};
			case undefined: { // 无回复数据
				break;
			};
		};
	})

/***************** Function *****************/
/**
 * Set Environment Variables
 * @author VirgilClyne
 * @param {String} name - Persistent Store Key
 * @param {Array} platforms - Platform Names
 * @param {Object} database - Default DataBase
 * @return {Object} { Settings, Caches, Configs }
 */
function setENV(name, platforms, database) {
	$.log(`☑️ ${$.name}, Set Environment Variables`, "");
	let { Settings, Caches, Configs } = $.getENV(name, platforms, database);
	/***************** Settings *****************/
	// 单值或空值转换为数组
	if (!Array.isArray(Settings?.Domains)) $.lodash_set(Settings, "Domains", (Settings?.Domains) ? [Settings.Domains.toString()] : []);
	if (!Array.isArray(Settings?.Functions)) $.lodash_set(Settings, "Functions", (Settings?.Functions) ? [Settings.Functions.toString()] : []);
	$.log(`✅ ${$.name}, Set Environment Variables`, `Settings: ${typeof Settings}`, `Settings内容: ${JSON.stringify(Settings)}`, "");
	/***************** Caches *****************/
	//$.log(`✅ ${$.name}, Set Environment Variables`, `Caches: ${typeof Caches}`, `Caches内容: ${JSON.stringify(Caches)}`, "");
	/***************** Configs *****************/
	Configs.Storefront = new Map(Configs.Storefront);
	return { Settings, Caches, Configs };
};
