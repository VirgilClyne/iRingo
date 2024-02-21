/*
README: https://github.com/VirgilClyne/iRingo
*/

import ENVs from "./ENV/ENV.mjs";
import URIs from "./URI/URI.mjs";

import Database from "./database/index.mjs";
import setENV from "./function/setENV.mjs";

const $ = new ENVs(" iRingo: 🔍 Siri v3.0.3(3) request");
const URI = new URIs();

// 构造回复数据
let $response = undefined;

/***************** Processing *****************/
// 解构URL
const URL = URI.parse($request.url);
$.log(`⚠ ${$.name}`, `URL: ${JSON.stringify(URL)}`, "");
// 获取连接参数
const METHOD = $request.method, HOST = URL.host, PATH = URL.path, PATHs = URL.paths;
$.log(`⚠ ${$.name}`, `METHOD: ${METHOD}`, "");
// 解析格式
const FORMAT = ($request.headers?.["Content-Type"] ?? $request.headers?.["content-type"])?.split(";")?.[0];
$.log(`⚠ ${$.name}`, `FORMAT: ${FORMAT}`, "");
(async () => {
	const { Settings, Caches, Configs } = setENV($, "iRingo", "Siri", Database);
	$.log(`⚠ ${$.name}`, `Settings.Switch: ${Settings?.Switch}`, "");
	switch (Settings.Switch) {
		case true:
		default:
			// 创建空数据
			let body = {};
			// 方法判断
			switch (METHOD) {
				case "POST":
				case "PUT":
				case "PATCH":
				case "DELETE":
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
								break;
						case "text/xml":
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
							break;
						case "application/protobuf":
						case "application/x-protobuf":
						case "application/vnd.google.protobuf":
						case "application/grpc":
						case "application/grpc+proto":
						case "applecation/octet-stream":
							// 路径判断
							switch (PATH) {
								case "apple.parsec.spotlight.v1alpha.ZkwSuggestService/Suggest": // 新闻建议
									break;
							};
							break;
					};
					//break; // 不中断，继续处理URL
				case "GET":
				case "HEAD":
				case "OPTIONS":
				case undefined: // QX牛逼，script-echo-response不返回method
				default:
					const LOCALE = URL.query?.locale;
					$.log(`🚧 ${$.name}, LOCALE: ${LOCALE}`, "");
					if (URL.query?.card_locale) URL.query.card_locale = LOCALE;
					if (Settings.CountryCode == "AUTO") Settings.CountryCode = LOCALE?.match(/[A-Z]{2}$/)?.[0] ?? Settings.CountryCode;
					if (URL.query?.cc) URL.query.cc = URL.query.cc.replace(/[A-Z]{2}/, Settings.CountryCode);
					// 主机判断
					switch (HOST) {
						case "api.smoot.apple.com":
						case "api.smoot.apple.cn":
							// 路径判断
							switch (PATH) {
								case "bag": // 配置
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
									switch (URL.query?.qtype) {
										case "zkw": // 处理"新闻"小组件
											["CN", "HK", "MO", "TW", "SG"].includes(Settings.CountryCode) ? URL.query.locale = `${URL.query.esl}_SG`
												: ["US", "CA", "UK", "AU"].includes(Settings.CountryCode) ? URL.query.locale = URL.query.locale
													: URL.query.locale = `${URL.query.esl}_US`
											break;
										default: // 其他搜索
											if (/^%E5%A4%A9%E6%B0%94%20/.test(URL.query.q)) { // 处理"天气"搜索，搜索词"天气 "开头
												console.log("Type A", ``);
												URL.query.q = URL.query.q.replace(/%E5%A4%A9%E6%B0%94/, "weather"); // "天气"替换为"weather"
												if (/^weather%20.*%E5%B8%82$/.test(URL.query.q)) URL.query.q = URL.query.q.replace(/$/, "%E5%B8%82");
											} else if (/%20%E5%A4%A9%E6%B0%94$/.test(URL.query.q)) {// 处理"天气"搜索，搜索词" 天气"结尾
												console.log("Type B", ``);
												URL.query.q = URL.query.q.replace(/%E5%A4%A9%E6%B0%94/, "weather"); // "天气"替换为"weather"
												if (/.*%E5%B8%82%20weather$/.test(URL.query.q)) URL.query.q = URL.query.q.replace(/%20weather$/, "%E5%B8%82%20weather");
											};
											break;
									};
									break;
								case "card": // 卡片
									switch (URL.query?.include) {
										case "tv":
										case "movies":
											switch (URL.query?.storefront?.match(/[\d]{6}/g)) { //StoreFront ID, from App Store Region
												case "143463": // CN
													URL.query.q = URL.query.q.replace(/%2F[a-z]{2}-[A-Z]{2}/, "%2Fzh-HK")
													break;
												case "143470": // TW
													URL.query.q = URL.query.q.replace(/%2F[a-z]{2}-[A-Z]{2}/, "%2Fzh-TW")
													break;
												case "143464": // SG
													URL.query.q = URL.query.q.replace(/%2F[a-z]{2}-[A-Z]{2}/, "%2Fzh-SG")
													break;
											};
											break;
										case "apps":
										case "music":
										default:
											break;
									};
									break;
							};
							break;
					};
					break;
				case "CONNECT":
				case "TRACE":
					break;
			};
			if ($request.headers?.Host) $request.headers.Host = URL.host;
			$request.url = URI.stringify(URL);
			$.log(`🚧 ${$.name}, 调试信息`, `$request.url: ${$request.url}`, "");
			break;
		case false:
			break;
	};
})()
	.catch((e) => $.logErr(e))
	.finally(() => {
		switch ($response) {
			default: // 有构造回复数据，返回构造的回复数据
				if ($.isQuanX()) {
					if (!$response.status) $response.status = "HTTP/1.1 200 OK";
					delete $response.headers?.["Transfer-Encoding"];
					$.done($response);
				} else $.done({ response: $response });
				break;
			case undefined: // 无构造回复数据，发送修改的请求数据
				$.done($request);
				break;
		};
	})
