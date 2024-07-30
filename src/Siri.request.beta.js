import _ from './ENV/Lodash.mjs'
import $Storage from './ENV/$Storage.mjs'
import ENV from "./ENV/ENV.mjs";

import Database from "./database/index.mjs";
import setENV from "./function/setENV.mjs";
import pako from "./pako/dist/pako.esm.mjs";
import addgRPCHeader from "./function/addgRPCHeader.mjs";

import { WireType, UnknownFieldHandler, reflectionMergePartial, MESSAGE_TYPE, MessageType, BinaryReader, isJsonObject, typeofJsonValue, jsonWriteOptions } from "../node_modules/@protobuf-ts/runtime/build/es2015/index.js";

const $ = new ENV(" iRingo: 🔍 Siri v4.0.0(4018) request.beta");

// 构造回复数据
let $response = undefined;

/***************** Processing *****************/
// 解构URL
const url = new URL($request.url);
$.log(`⚠ url: ${url.toJSON()}`, "");
// 获取连接参数
const METHOD = $request.method, HOST = url.hostname, PATH = url.pathname, PATHs = url.pathname.split("/").filter(Boolean);
$.log(`⚠ METHOD: ${METHOD}, HOST: ${HOST}, PATH: ${PATH}` , "");
// 解析格式
const FORMAT = ($request.headers?.["Content-Type"] ?? $request.headers?.["content-type"])?.split(";")?.[0];
$.log(`⚠ FORMAT: ${FORMAT}`, "");
!(async () => {
	const { Settings, Caches, Configs } = setENV("iRingo", "Siri", Database);
	$.log(`⚠ Settings.Switch: ${Settings?.Switch}`, "");
	switch (Settings.Switch) {
		case true:
		default:
			// 创建空数据
			let Locale, Language, CountryCode;
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
						default:
							//$.log(`🚧 body: ${body}`, "");
							break;
						case "application/x-mpegURL":
						case "application/x-mpegurl":
						case "application/vnd.apple.mpegurl":
						case "audio/mpegurl":
							//body = M3U8.parse($request.body);
							//$.log(`🚧 body: ${JSON.stringify(body)}`, "");
							//$request.body = M3U8.stringify(body);
							break;
						case "text/xml":
						case "text/html":
						case "text/plist":
						case "application/xml":
						case "application/plist":
						case "application/x-plist":
							//body = XML.parse($request.body);
							//$.log(`🚧 body: ${JSON.stringify(body)}`, "");
							//$request.body = XML.stringify(body);
							break;
						case "text/vtt":
						case "application/vtt":
							//body = VTT.parse($request.body);
							//$.log(`🚧 body: ${JSON.stringify(body)}`, "");
							//$request.body = VTT.stringify(body);
							break;
						case "text/json":
						case "application/json":
							//body = JSON.parse($request.body ?? "{}");
							//$.log(`🚧 body: ${JSON.stringify(body)}`, "");
							//$request.body = JSON.stringify(body);
							break;
						case "application/protobuf":
						case "application/x-protobuf":
						case "application/vnd.google.protobuf":
						case "application/grpc":
						case "application/grpc+proto":
						case "applecation/octet-stream":
							//$.log(`🚧 $request.body: ${JSON.stringify($request.body)}`, "");
							let rawBody = $.isQuanX() ? new Uint8Array($request.bodyBytes ?? []) : $request.body ?? new Uint8Array();
							//$.log(`🚧 isBuffer? ${ArrayBuffer.isView(rawBody)}: ${JSON.stringify(rawBody)}`, "");
							switch (FORMAT) {
								case "application/protobuf":
								case "application/x-protobuf":
								case "application/vnd.google.protobuf":
									break;
								case "application/grpc":
								case "application/grpc+proto":
									// 先拆分B站gRPC校验头和protobuf数据体
									let header = rawBody.slice(0, 5);
									body = rawBody.slice(5);
									// 处理request压缩protobuf数据体
									switch (header?.[0]) {
										case 0: // unGzip
											break;
										case 1: // Gzip
											body = pako.ungzip(body);
											header[0] = 0; // unGzip
											break;
									};
									// 解析链接并处理protobuf数据
									// 主机判断
									switch (HOST) {
										case "guzzoni.smoot.apple.com":
										case "api-siri.smoot.apple.com":
										case "api2.smoot.apple.com":
										default:
											// 路径判断
											switch (PATH) {
												case "/apple.parsec.siri.v2alpha.SiriSearch/SiriSearch": // Siri搜索
													/******************  initialization start  *******************/
													class SiriPegasusRequest$Type extends MessageType {
														constructor() {
															super("SiriPegasusRequest", [
																{ no: 1, name: "queries", kind: "message", T: () => Content },
																{ no: 2, name: "queryContext", kind: "message", T: () => PegasusQueryContext },
																{ no: 5, name: "siriPegasusContext", kind: "message", T: () => SiriPegasusContext }
															]);
														}
													}
													const SiriPegasusRequest = new SiriPegasusRequest$Type();
													class Content$Type extends MessageType {
														constructor() {
															super("Content", [
																{ no: 1, name: "keyword", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
															]);
														}
													}
													const Content = new Content$Type();
													class PegasusQueryContext$Type extends MessageType {
														constructor() {
															super("PegasusQueryContext", [
																{ no: 1, name: "secretKey", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
																{ no: 2, name: "countryCode", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
																{ no: 3, name: "locale", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
																{ no: 4, name: "effectiveSystemLanguage", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
																{ no: 5, name: "preferredLanguages", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
																{ no: 6, name: "storeFront", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
																{ no: 8, name: "timeZone", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
																{ no: 9, name: "skuRegion", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
																{ no: 14, name: "location", kind: "message", T: () => Location },
																{ no: 18, name: "installedAppsSignature", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
																{ no: 19, name: "uiScale", kind: "scalar", T: 2 /*ScalarType.FLOAT*/ },
																{ no: 22, name: "hsEnabled", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
																{ no: 26, name: "region", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
																{ no: 28, name: "trialIdentifiers", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
															]);
														}
													}
													const PegasusQueryContext = new PegasusQueryContext$Type();
													class Location$Type extends MessageType {
														constructor() {
															super("Location", [
																{ no: 1, name: "latitude", kind: "scalar", opt: true, T: 2 /*ScalarType.FLOAT*/ },
																{ no: 2, name: "longitude", kind: "scalar", opt: true, T: 2 /*ScalarType.FLOAT*/ },
																{ no: 4, name: "altitude", kind: "scalar", opt: true, T: 2 /*ScalarType.FLOAT*/ }
															]);
														}
													}
													const Location = new Location$Type();
													class SiriPegasusContext$Type extends MessageType {
														constructor() {
															super("SiriPegasusContext", [
																{ no: 14, name: "conversationContext", kind: "message", T: () => M5M14 }
															]);
														}
													}
													const SiriPegasusContext = new SiriPegasusContext$Type();
													class M5M14$Type extends MessageType {
														constructor() {
															super("M5M14", [
																{ no: 1, name: "cc", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
															]);
														}
													}
													const M5M14 = new M5M14$Type();
													/******************  initialization finish  *******************/
													let data = SiriPegasusRequest.fromBinary(body);
													$.log(`🚧 data: ${JSON.stringify(data)}`, "");
													let UF = UnknownFieldHandler.list(data);
													//$.log(`🚧 UF: ${JSON.stringify(UF)}`, "");
													if (UF) {
														UF = UF.map(uf => {
															//uf.no; // 22
															//uf.wireType; // WireType.Varint
															// use the binary reader to decode the raw data:
															let reader = new BinaryReader(uf.data);
															let addedNumber = reader.int32(); // 7777
															$.log(`🚧 no: ${uf.no}, wireType: ${uf.wireType}, addedNumber: ${addedNumber}`, "");
														});
													};
													Locale = data.queryContext.locale;
													[Language, CountryCode] = Locale?.split("_") ?? [];
													$.log(`🚧 Locale: ${Locale}, Language: ${Language}, CountryCode: ${CountryCode}`, "");
													switch (Settings.CountryCode) {
														case "AUTO":
															Settings.CountryCode = CountryCode;
														//break;
														default:
															if (data?.queryContext?.countryCode) data.queryContext.countryCode = Settings.CountryCode;
															//if (data?.queryContext?.region) data.queryContext.region = `${Language}_${Settings.CountryCode}`;
															if (data?.siriPegasusContext?.conversationContext?.cc) data.siriPegasusContext.conversationContext.cc = Settings.CountryCode;
															break;
													};
													if (data?.queryContext?.skuRegion) data.queryContext.skuRegion = "LL";
													delete data?.queryContext?.location;
													$.log(`🚧 data: ${JSON.stringify(data)}`, "");
													body = SiriPegasusRequest.toBinary(data);
													break;
												case "/apple.parsec.spotlight.v1alpha.ZkwSuggestService/Suggest": // 新闻建议
													/******************  initialization start  *******************/
													/******************  initialization finish  *******************/
													break;
											};
											break;
									};
									rawBody = addgRPCHeader({ header, body }); // gzip压缩有问题，别用
									//rawBody = body;
									break;
							};
							// 写入二进制数据
							$request.body = rawBody;
							break;
					};
					//break; // 不中断，继续处理URL
				case "GET":
				case "HEAD":
				case "OPTIONS":
				default:
					Locale = Locale ?? url.searchParams.get("locale");
					[Language, CountryCode] = Locale?.split("_") ?? [];
					$.log(`🚧 Locale: ${Locale}, Language: ${Language}, CountryCode: ${CountryCode}`, "");
					switch (Settings.CountryCode) {
						case "AUTO":
							Settings.CountryCode = CountryCode;
							break;
						default:
							if (url.searchParams.has("cc")) url.searchParams.set("cc", Settings.CountryCode);
							break;
					};
					// 主机判断
					switch (HOST) {
						case "api.smoot.apple.com":
						case "api.smoot.apple.cn":
							// 路径判断
							switch (PATH) {
								case "/bag": // 配置
									break;
							};
							break;
						case "guzzoni.smoot.apple.com":
							break;
						case "fbs.smoot.apple.com":
							break;
						case "cdn.smoot.apple.com":
							break;
						case "api-siri.smoot.apple.com":
						default: // 其他主机
							let q = url.searchParams.get("q");
							// 路径判断
							switch (PATH) {
								case "/search": // 搜索
									switch (url.searchParams.get("qtype")) {
										case "zkw": // 处理"新闻"小组件
											switch (Settings.CountryCode) {
												case "CN":
												case "HK":
												case "MO":
												case "TW":
												case "SG":
													url.searchParams.set("locale", `${Language}_SG`);
													break;
												case "US":
												case "CA":
												case "UK":
												case "AU":
													// 不做修正
													break;
												default:
													url.searchParams.set("locale", `${Language}_US`);
													break;
											};
											break;
										default: // 其他搜索
											if (q?.startsWith?.("%E5%A4%A9%E6%B0%94%20")) { // 处理"天气"搜索，搜索词"天气 "开头
												console.log("'天气 '开头");
												url.searchParams.set("q", q.replace(/%E5%A4%A9%E6%B0%94/, "weather")); // "天气"替换为"weather"
												if (/^weather%20.*%E5%B8%82$/.test(q)) url.searchParams.set("q", q.replace(/$/, "%E5%B8%82"));
											} else if (q?.endsWith?.("%20%E5%A4%A9%E6%B0%94")) {// 处理"天气"搜索，搜索词" 天气"结尾
												console.log("' 天气'结尾");
												url.searchParams.set("q", q.replace(/%E5%A4%A9%E6%B0%94/, "weather")); // "天气"替换为"weather"
												if (/.*%E5%B8%82%20weather$/.test(q)) url.searchParams.set("q", q.replace(/%20weather$/, "%E5%B8%82%20weather"));
											};
											break;
									};
									break;
								case "/card": // 卡片
									switch (url.searchParams.get("include")) {
										case "tv":
										case "movies":
											url.searchParams.set("card_locale", `${Language}_${Settings.CountryCode}`);
											const storefront = url.searchParams.get("storefront")?.match(/[\d]{6}/g);
											switch (storefront) { //StoreFront ID, from App Store Region
												case "143463": // HK
													url.searchParams.set("q", q.replace(/%2F[a-z]{2}-[A-Z]{2}/, "%2Fzh-HK"));
													break;
												case "143464": // SG
													url.searchParams.set("q", q.replace(/%2F[a-z]{2}-[A-Z]{2}/, "%2Fzh-SG"));
													break;
												case "143465": // CN
													url.searchParams.set("q", q.replace(/%2F[a-z]{2}-[A-Z]{2}/, "%2Fzh-HK"));
													break;
												case "143470": // TW
													url.searchParams.set("q", q.replace(/%2F[a-z]{2}-[A-Z]{2}/, "%2Fzh-TW"));
													break;
											};
											break;
										case "apps":
										case "music":
											url.searchParams.set("card_locale", `${Language}_${Settings.CountryCode}`);
											break;
										case "dictionary":
											switch (Language) {
												case "zh-Hans":
												case "zh-Hant":
													url.searchParams.set("card_locale", `en_${Settings.CountryCode}`);
													break;
											};
											break;
										default:
											url.searchParams.set("card_locale", `${Language}_${Settings.CountryCode}`);
											break;
									};
									break;
								case "/warm":
									break;
								case "/render":
									break;
								case "/flight": // 航班
									break;
							};
							break;
					};
					break;
				case "CONNECT":
				case "TRACE":
					break;
			};
			$request.url = url.toString();
			$.log(`🚧 调试信息`, `$request.url: ${$request.url}`, "");
			break;
		case false:
			break;
	};
})()
	.catch((e) => $.logErr(e))
	.finally(() => {
		switch ($response) {
			default: // 有构造回复数据，返回构造的回复数据
				//$.log(`🚧 finally`, `echo $response: ${JSON.stringify($response, null, 2)}`, "");
				if ($response.headers?.["Content-Encoding"]) $response.headers["Content-Encoding"] = "identity";
				if ($response.headers?.["content-encoding"]) $response.headers["content-encoding"] = "identity";
				if ($.isQuanX()) {
					if (!$response.status) $response.status = "HTTP/1.1 200 OK";
					delete $response.headers?.["Content-Length"];
					delete $response.headers?.["content-length"];
					delete $response.headers?.["Transfer-Encoding"];
					$.done($response);
				} else $.done({ response: $response });
				break;
			case undefined: // 无构造回复数据，发送修改的请求数据
				//$.log(`🚧 finally`, `$request: ${JSON.stringify($request, null, 2)}`, "");
				$.done($request);
				break;
		};
	})
