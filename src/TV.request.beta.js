import _ from './ENV/Lodash.mjs'
import $Storage from './ENV/$Storage.mjs'
import ENV from "./ENV/ENV.mjs";
import URL from "./URL/URL.mjs";

import Database from "./database/index.mjs";
import setENV from "./function/setENV.mjs";

const $ = new ENV(" iRingo: 📺 TV v3.3.0(3) request.beta");

// 构造回复数据
let $response = undefined;

/***************** Processing *****************/
// 解构URL
const url = new URL($request.url);
$.log(`⚠ url: ${url.toJSON()}`, "");
// 获取连接参数
const METHOD = $request.method, HOST = url.hostname, PATH = url.pathname;
$.log(`⚠ METHOD: ${METHOD}, HOST: ${HOST}, PATH: ${PATH}` , "");
// 解析格式
const FORMAT = ($request.headers?.["Content-Type"] ?? $request.headers?.["content-type"])?.split(";")?.[0];
$.log(`⚠ FORMAT: ${FORMAT}`, "");
!(async () => {
	const { Settings, Caches, Configs } = setENV("iRingo", "TV", Database);
	$.log(`⚠ Settings.Switch: ${Settings?.Switch}`, "");
	switch (Settings.Switch) {
		case true:
		default:
			// 解析参数
			const StoreFront = url.searchParams.get("sf");
			const Locale = ($request.headers?.["X-Apple-I-Locale"] ?? $request.headers?.["x-apple-i-locale"])?.split('_')?.[0] ?? "zh";
			$.log(`🚧 调试信息, StoreFront = ${StoreFront}, Locale = ${Locale}`, "")
			// 创建空数据
			let body = {};
			// 设置默认类型
			let Type = "Other";
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
							// 主机判断
							switch (HOST) {
								case "uts-api.itunes.apple.com":
									// 路径判断
									switch (PATH) {
										case "/uts/v3/favorite-people":
										case "/uts/v3/favorite-teams":
										case "/uts/v2/favorites":
										case "/uts/v2/favorites/add":
										case "/uts/v2/favorites/remove":
											Type = "Sports";
											if ($request.body) $request.body = $request.body.replace(/sf=[\d]{6}/, `sf=${Configs.Storefront.get(Settings.CountryCode[Type])}`);
											break;
									};
									break;
							};
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
							body = JSON.parse($request.body ?? "{}");
							// 主机判断
							switch (HOST) {
								case "uts-api.itunes.apple.com":
									// 路径判断
									switch (PATH) {
										case "/uts/v3/user/settings":
											Type = "Settings";
											$.log(`🚧 调试信息`, JSON.stringify(body), "")
											break;
									};
									break;
								case "umc-tempo-api.apple.com":
									// 路径判断
									switch (PATH) {
										case "/v3/channels/scoreboard":
										case "/v3/channels/scoreboard/":
											Type = "Sports";
											$.log(`🚧 调试信息`, JSON.stringify(body), "")
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
						case "uts-api.itunes.apple.com":
							const Version = parseInt(url.searchParams.get("v"), 10), Platform = url.searchParams.get("pfm"), Caller = url.searchParams.get("caller");
							$.log(`🚧 调试信息, Version = ${Version}, Platform = ${Platform}, Caller = ${Caller}`, "")
							// 路径判断
							switch (PATH) {
								case "/uts/v3/configurations":
									Type = "Configs";
									const Region = url.searchParams.get("region"), Country = url.searchParams.get("country"), StoreFrontH = url.searchParams.get("sfh");
									$.log(`🚧 调试信息`, `Region = ${Region}, Country = ${Country}, StoreFrontH = ${StoreFrontH}`, "")
									if (Settings.CountryCode[Type] !== "AUTO") {
										if (Region) url.searchParams.set("region", Settings.CountryCode[Type] ?? Region);
										if (Country) url.searchParams.set("country", Settings.CountryCode[Type] ?? Country);
										if (StoreFrontH) url.searchParams.set("sfh", StoreFrontH.replace(/\d{6}/, Configs.Storefront.get(Settings.CountryCode[Type])));
									};
									break;
								case "/uts/v3/user/settings":
									Type = "Settings";
									break;
								case "/uts/v3/canvases/Roots/watchNow":
								case "/uts/v3/canvases/roots/tahoma_watchnow":
								case "/uts/v3/shelves/uts.col.UpNext":
									Type = "WatchNow";
									if (Settings["Third-Party"]) url.searchParams.set("pfm", (Platform === "desktop") ? "appletv" : Platform);
									break;
								case "/uts/v3/canvases/Channels/tvs.sbd.4000":
								case "/uts/v3/shelves/uts.col.ChannelUpNext.tvs.sbd.4000":
								case "/uts/v2/brands/appleTvPlus":
									Type = "Originals";
									break;
								case "/uts/v3/canvases/Channels/tvs.sbd.7000":
								case "/uts/v3/shelves/uts.col.ChannelUpNext.tvs.sbd.7000":
								case "/uts/v3/shelves/edt.col.63bf2052-50b9-44c8-a67e-30e196e19c60":
									Type = "Originals";
									break;	
								case "/uts/v3/channels":
								case "/uts/v2/brands":
									Type = "Channels";
									break;
								case "/uts/v3/canvases/Roots/sports":
								case "/uts/v3/shelves/uts.col.PersonalizedLiveSports":
								case "/uts/v3/clock-scores":
								case "/uts/v3/leagues":
								case "/uts/v2/sports/clockscore":
								case "/uts/v2/sports/competitors":
								case "/uts/v2/sports/league":
								case "/uts/v2/sports/leagues":
								case "/uts/v2/sports/statsIdLookup":
								case "/uts/v2/sports/teamsNearMe":
								case "/uts/v3/canvases/Rooms/edt.item.633e0768-2135-43ac-a878-28965b853ec5": // FIFA World Cup 2022
								case "/uts/v3/canvases/Rooms/edt.item.635968ac-89d7-4619-8f5d-8c7890aef813": // NFL THANKSGIVING 2022
								case "/uts/v3/canvases/Rooms/edt.item.62327df1-6874-470e-98b2-a5bbeac509a2": // Friday Night Baseball - MLB - Apple TV+
									Type = "Sports";
									//if (Settings["Third-Party"]) 
									url.searchParams.set("pfm", (Platform === "desktop") ? "ipad" : Platform);
									break;
								case "/uts/v3/canvases/Roots/kids":
									Type = "Kids";
									break;
								case "/uts/v3/canvases/Roots/store":
								case "/uts/v3/canvases/Roots/tahoma_store":
									Type = "Store";
									break;
								case "/uts/v3/canvases/Roots/movies":
									Type = "Movies";
									if (Settings["Third-Party"]) url.searchParams.set("pfm", (Platform === "desktop") ? "ipad" : Platform);
									break;
								case "/uts/v3/canvases/Roots/tv":
									Type = "TV";
									if (Settings["Third-Party"]) url.searchParams.set("pfm", (Platform === "desktop") ? "ipad" : Platform);
									break;
								case "/uts/v3/favorite-people":
								case "/uts/v3/favorite-teams":
								case "/uts/v2/favorites":
								case "/uts/v2/favorites/add":
								case "/uts/v2/favorites/remove":
									Type = "Sports";
									break;
								case "/uts/v3/canvases/Roots/tahoma_searchlanding":
								case "/uts/v3/search":
								case "/uts/v3/search/landing":
								case "/uts/v2/search/incremental":
								case "/uts/v2/search/landing":
									Type = "Search";
									break;
								case "/uts/v3/watchlist":
								case "/uts/v2/watchlist/contains":
								case "/uts/v2/watchlist/search":
									if (Settings["Third-Party"]) url.searchParams.set("pfm", (Platform === "desktop") ? "ipad" : Platform);
									break;
								default:
									//if (Settings["Third-Party"]) url.searchParams.set("pfm", (Platform === "desktop") ? "ipad" : Platform);
									if (url.searchParams.get("ctx_brand") === "tvs.sbd.4000") Type = "Originals";
									else if (PATH.includes("/uts/v3/canvases/Channels/")) Type = "Channels";
									else if (PATH.includes("/uts/v2/brands/")) Type = "Channels";
									else if (PATH.includes("/uts/v3/movies/")) Type = "Movies";
									else if (PATH.includes("/uts/v3/shows/")) Type = "TV";
									else if (PATH.includes("/uts/v3/sporting-events/")) {
										Type = "Sports";
										//if (Settings["Third-Party"])
										url.searchParams.set("pfm", (Platform === "desktop") ? "ipad" : Platform);
									}
									else if (PATH.includes("/uts/v3/canvases/Sports/")) {
										Type = "Sports";
										//if (Settings["Third-Party"])
										url.searchParams.set("pfm", (Platform === "desktop") ? "ipad" : Platform);
									}
									else if (PATH.includes("/uts/v3/canvases/Persons/")) Type = "Persons";
									else if (PATH.includes("/uts/v3/canvases/Rooms/")) Type = "Others";
									//else if (PATH.includes("/uts/v3/playables/")) Type = "Others";
									//else if (PATH.includes("/uts/v3/shelves/")) Type = "Others";
									else Type = "Others";
									break;
							};
							break;
						case "umc-tempo-api.apple.com":
							switch (PATH) {
								case "/v3/register":
								case "/v3/channels/scoreboard":
								case "/v3/channels/scoreboard/":
									Type = "Sports";
									break;
								default:
									if (PATH.includes("/v3/register/")) Type = "Sports";
									break;
							};
							break;
					};
					$.log(`⚠ Type = ${Type}, CC = ${Settings.CountryCode[Type]}`);
					break;
				case "CONNECT":
				case "TRACE":
					break;
			};
			if ($request.headers?.["X-Apple-Store-Front"]) $request.headers["X-Apple-Store-Front"] = (Configs.Storefront.get(Settings.CountryCode[Type])) ? $request.headers["X-Apple-Store-Front"].replace(/\d{6}/, Configs.Storefront.get(Settings.CountryCode[Type])) : $request.headers["X-Apple-Store-Front"];
			if ($request.headers?.["x-apple-store-front"]) $request.headers["x-apple-store-front"] = (Configs.Storefront.get(Settings.CountryCode[Type])) ? $request.headers["x-apple-store-front"].replace(/\d{6}/, Configs.Storefront.get(Settings.CountryCode[Type])) : $request.headers["x-apple-store-front"];
			if (StoreFront) url.searchParams.set("sf", Configs.Storefront.get(Settings.CountryCode[Type]) ?? StoreFront);
			if (Locale) url.searchParams.set("locale", Configs.Locale.get(Settings.CountryCode[Type]) ?? Locale);
			$.log(`🚧 调试信息`, `StoreFront = ${url.searchParams.get("sf")}, Locale = ${url.searchParams.get("locale")}`, "")
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
