/*
README: https://github.com/VirgilClyne/iRingo
*/

import ENVs from "./ENV/ENV.mjs";
import URIs from "./URI/URI.mjs";

import Database from "./database/index.mjs";
import setENV from "./function/setENV.mjs";

const $ = new ENVs(" iRingo: ✈ TestFlight v3.1.1(3) request");
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
	const { Settings, Caches, Configs } = setENV($, "iRingo", "TestFlight", Database);
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
							body = JSON.parse($request.body ?? "{}");
							switch (HOST) {
								case "testflight.apple.com":
									switch (PATH) {
										case "v1/session/authenticate":
											if (Settings.CountryCode !== "AUTO") body.storeFrontIdentifier = body.storeFrontIdentifier.replace(/\d{6}/, Configs.Storefront.get(Settings.CountryCode));
											break;
										case "v1/properties/testflight":
											break;
										case "v1/devices":
										case "v1/devices/apns":
										case "v1/devices/add":
										case "v1/devices/remove":
											break;
										default:
											switch (PATHs[0]) {
												case "v1":
												case "v2":
												case "v3":
													switch (PATHs[1]) {
														case "accounts":
															switch (PATHs[2]) {
																case "settings":
																	break;
																case Caches?.data?.accountId: // UUID
																default:
																	switch (PATHs[3]) {
																		case "apps":
																			$.log(`🚧 ${$.name}, ${PATHs[0]}/accounts/${PATHs[2]}/apps/`, "");
																			switch (PATHs[4]) {
																				default:
																					switch (PATHs[5]) {
																						case "builds":
																							switch (PATHs[7]) {
																								case undefined:
																									$.log(`🚧 ${$.name}, ${PATHs[0]}/accounts/${PATHs[2]}/apps/${PATHs[4]}/builds/${PATHs[6]}`, "");
																									break;
																								case "install":
																									$.log(`🚧 ${$.name}, ${PATHs[0]}/accounts/${PATHs[2]}/apps/${PATHs[4]}/builds/${PATHs[6]}/install`, "");
																									if (Settings.CountryCode !== "AUTO") body.storefrontId = body.storefrontId.replace(/\d{6}/, Configs.Storefront.get(Settings.CountryCode));
																									break;
																								default:
																									$.log(`🚧 ${$.name}, ${PATHs[0]}/accounts/${PATHs[2]}/apps/${PATHs[4]}/builds/${PATHs[6]}/${PATHs[7]}`, "");
																									break;
																							};
																							break;
																					};
																					break;
																			};
																			break;
																	};
																	break;
															};
															break;
													};
													break;
											};
											break;
									};
									break;
							};
							$request.body = JSON.stringify(body);
							break;
						case "application/protobuf":
						case "application/x-protobuf":
						case "application/vnd.google.protobuf":
						case "application/grpc":
						case "application/grpc+proto":
						case "applecation/octet-stream":
							break;
					};
					//break; // 不中断，继续处理URL
				case "GET":
				case "HEAD":
				case "OPTIONS":
				case undefined: // QX牛逼，script-echo-response不返回method
				default:
					// 主机判断
					switch (HOST) {
						case "testflight.apple.com":
							// 路径判断
							switch (PATH) {
								case "v1/session/authenticate":
									break;
								case "v1/properties/testflight":
									//$request.headers["X-Apple-Rosetta-Available"] = Settings.Rosetta;
									break;
								case "v1/devices":
								case "v1/devices/apns":
								case "v1/devices/add":
								case "v1/devices/remove":
									break;
								default:
									// headers auth mod
									switch (Settings.MultiAccount) { // MultiAccount
										case true:
											$.log(`⚠ ${$.name}, 启用多账号支持`, "");
											const IfNoneMatch = $request?.headers?.["If-None-Match"] ?? $request?.headers?.["if-none-match"];
											const XRequestId = $request?.headers?.["X-Request-Id"] ?? $request?.headers?.["x-request-id"];
											const XSessionId = $request?.headers?.["X-Session-Id"] ?? $request?.headers?.["x-session-id"];
											const XSessionDigest = $request?.headers?.["X-Session-Digest"] ?? $request?.headers?.["x-session-digest"];
											if (Caches.data) { // Caches.data存在
												$.log(`⚠ ${$.name}, Caches.data存在，读取`, "");
												switch (PATHs[0]) {
													case "v1":
													case "v2":
													case "v3":
														switch (PATHs[1]) {
															case "accounts":
															case "messages":
															case "apps":
															default:
																switch (PATHs[2]) {
																	case "settings":
																	case undefined:
																	default:
																		switch (/[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}/.test(PATHs[2])) {
																			case true: // PATHs[2]是UUID
																				$.log(`⚠ ${$.name}, PATHs[2]是UUID，替换URL.path`, "");
																				URL.path = PATH.replace(/\/[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}\//i, `/${Caches.data.accountId}/`);
																				//break; // 不中断，继续处理
																				case false: // PATHs[2]不是UUID
																				if (XSessionId !== Caches.headers["X-Session-Id"]) { // sessionId不同
																					$.log(`⚠ ${$.name}, sessionId不同，替换$request.headers`, "");
																					if (IfNoneMatch) {
																						delete $request.headers?.["If-None-Match"];
																						delete $request.headers?.["if-none-match"];
																					};
																					if (XRequestId) {
																						if ($request.headers?.["X-Request-Id"]) $request.headers["X-Request-Id"] = Caches.headers["X-Request-Id"];
																						if ($request.headers?.["x-request-id"]) $request.headers["x-request-id"] = Caches.headers["X-Request-Id"];
																					};
																					if (XSessionId) {
																						if ($request.headers?.["X-Session-Id"]) $request.headers["X-Session-Id"] = Caches.headers["X-Session-Id"];
																						if ($request.headers?.["x-session-id"]) $request.headers["x-session-id"] = Caches.headers["X-Session-Id"];
																					};
																					if (XSessionDigest) {
																						if ($request.headers?.["X-Session-Digest"]) $request.headers["X-Session-Digest"] = Caches.headers["X-Session-Digest"];
																						if ($request.headers?.["x-session-digest"]) $request.headers["x-session-digest"] = Caches.headers["X-Session-Digest"];
																					};
																				};
																		};
																		break;
																		case Caches?.data?.accountId: // PATHs[2]有UUID且与accountId相同
																		$.log(`⚠ ${$.name}, PATHs[2]与accountId相同，更新Caches`, "");
																		Caches.headers = {
																			"X-Request-Id": XRequestId,
																			"X-Session-Id": XSessionId,
																			"X-Session-Digest": XSessionDigest
																		};
																		$.setjson(Caches, "@iRingo.TestFlight.Caches");
																		break;
																};
																break;
															case "tc": // termsAndConditions
																break;
														};
														break;
												};
												break;
											} else { // Caches空
												$.log(`⚠ ${$.name}, Caches空，新写入`, "");
												Caches.headers = {
													"X-Request-Id": XRequestId,
													"X-Session-Id": XSessionId,
													"X-Session-Digest": XSessionDigest
												};
												if (/[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}/.test(PATHs[2])) {
													Caches.data = {
														"accountId": PATHs[2],
														"sessionId": XSessionId
													};
												};
												$.setjson(Caches, "@iRingo.TestFlight.Caches");
											};
											break;
										case false:
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
			break;
		case false:
			break;
	};
})()
	.catch((e) => $.logErr(e))
	.finally(() => {
		switch ($response) {
			default: // 有构造回复数据，返回构造的回复数据
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
				$.done($request);
				break;
		};
	})
