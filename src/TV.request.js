/*
README: https://github.com/VirgilClyne/iRingo
*/

import ENVs from "./ENV/ENV.mjs";
import URIs from "./URI/URI.mjs";
import setENV from "./function/setENV.mjs";

import * as Default from "./database/Default.json";
import * as Location from "./database/Location.json";
import * as News from "./database/News.json";
import * as PrivateRelay from "./database/PrivateRelay.json";
import * as Siri from "./database/Siri.json";
import * as TestFlight from "./database/TestFlight.json";
import * as TV from "./database/TV.json";

const $ = new ENVs(" iRingo: 📺 TV v3.2.2(1) request");
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
	const { Settings, Caches, Configs } = setENV("iRingo", "TV", DataBase);
	$.log(`⚠ ${$.name}`, `Settings.Switch: ${Settings?.Switch}`, "");
	switch (Settings.Switch) {
		case true:
		default:
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
						case "text/html":
						default:
							// 主机判断
							switch (HOST) {
								case "uts-api.itunes.apple.com":
									// 路径判断
									switch (PATH) {
										case "uts/v3/favorite-people":
										case "uts/v3/favorite-teams":
										case "uts/v2/favorites":
										case "uts/v2/favorites/add":
										case "uts/v2/favorites/remove":
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
							// 主机判断
							switch (HOST) {
								case "uts-api.itunes.apple.com":
									// 路径判断
									switch (PATH) {
										case "uts/v3/user/settings":
											Type = "Settings";
											break;
									};
									break;
								case "umc-tempo-api.apple.com":
									// 路径判断
									switch (PATH) {
										case "v3/channels/scoreboard":
										case "v3/channels/scoreboard/":
											Type = "Sports";
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
							const Version = parseInt(URL.query?.v, 10), Platform = URL.query?.pfm, Locale = ($request.headers?.["X-Apple-I-Locale"] ?? $request.headers?.["x-apple-i-locale"])?.split('_')?.[0] ?? "zh";
							// 路径判断
							switch (PATH) {
								case "uts/v3/configurations":
									Type = "Configs";
									if (Settings.CountryCode[Type] !== "AUTO") {
										if (URL.query.region) URL.query.region = Settings.CountryCode[Type] ?? URL.query.region;
										if (URL.query.country) URL.query.country = Settings.CountryCode[Type] ?? URL.query.country;
										if (URL.query.sfh) URL.query.sfh = URL.query.sfh.replace(/\d{6}/, Configs.Storefront.get(Settings.CountryCode[Type]));
									};
									break;
								case "uts/v3/user/settings":
									Type = "Settings";
									break;
								case "uts/v3/canvases/Roots/watchNow":
								case "uts/v3/canvases/roots/tahoma_watchnow":
								case "uts/v3/shelves/uts.col.UpNext":
									Type = "WatchNow";
									if (Settings["Third-Party"]) URL.query.pfm = (Platform === "desktop") ? "appletv" : Platform;
									break;
								case "uts/v3/canvases/Channels/tvs.sbd.4000":
								case "uts/v3/shelves/uts.col.ChannelUpNext.tvs.sbd.4000":
								case "uts/v2/brands/appleTvPlus":
									Type = "Originals";
									break;
								case "uts/v3/canvases/Channels/tvs.sbd.7000":
								case "uts/v3/shelves/uts.col.ChannelUpNext.tvs.sbd.7000":
								case "uts/v3/shelves/edt.col.63bf2052-50b9-44c8-a67e-30e196e19c60":
									Type = "Originals";
									break;	
								case "uts/v3/channels":
								case "uts/v2/brands":
									Type = "Channels";
									break;
								case "uts/v3/canvases/Roots/sports":
								case "uts/v3/shelves/uts.col.PersonalizedLiveSports":
								case "uts/v3/clock-scores":
								case "uts/v3/leagues":
								case "uts/v2/sports/clockscore":
								case "uts/v2/sports/competitors":
								case "uts/v2/sports/league":
								case "uts/v2/sports/leagues":
								case "uts/v2/sports/statsIdLookup":
								case "uts/v2/sports/teamsNearMe":
								case "uts/v3/canvases/Rooms/edt.item.633e0768-2135-43ac-a878-28965b853ec5": // FIFA World Cup 2022
								case "uts/v3/canvases/Rooms/edt.item.635968ac-89d7-4619-8f5d-8c7890aef813": // NFL THANKSGIVING 2022
								case "uts/v3/canvases/Rooms/edt.item.62327df1-6874-470e-98b2-a5bbeac509a2": // Friday Night Baseball - MLB - Apple TV+
									Type = "Sports";
									//if (Settings["Third-Party"]) 
									URL.query.pfm = (Platform === "desktop") ? "ipad" : Platform;
									break;
								case "uts/v3/canvases/Roots/kids":
									Type = "Kids";
									break;
								case "uts/v3/canvases/Roots/store":
								case "uts/v3/canvases/Roots/tahoma_store":
									Type = "Store";
									break;
								case "uts/v3/canvases/Roots/movies":
									Type = "Movies";
									if (Settings["Third-Party"]) URL.query.pfm = (Platform === "desktop") ? "ipad" : Platform;
									break;
								case "uts/v3/canvases/Roots/tv":
									Type = "TV";
									if (Settings["Third-Party"]) URL.query.pfm = (Platform === "desktop") ? "ipad" : Platform;
									break;
								case "uts/v3/favorite-people":
								case "uts/v3/favorite-teams":
								case "uts/v2/favorites":
								case "uts/v2/favorites/add":
								case "uts/v2/favorites/remove":
									Type = "Sports";
									break;
								case "uts/v3/canvases/Roots/tahoma_searchlanding":
								case "uts/v3/search":
								case "uts/v3/search/landing":
								case "uts/v2/search/incremental":
								case "uts/v2/search/landing":
									Type = "Search";
									break;
								case "uts/v3/watchlist":
								case "uts/v2/watchlist/contains":
								case "uts/v2/watchlist/search":
									if (Settings["Third-Party"]) URL.query.pfm = (Platform === "desktop") ? "ipad" : Platform;
									break;
								default:
									//if (Settings["Third-Party"]) URL.query.pfm = (Platform === "desktop") ? "ipad" : Platform;
									if (URL.query?.ctx_brand === "tvs.sbd.4000") Type = "Originals";
									else if (PATH.includes("uts/v3/canvases/Channels/")) Type = "Channels";
									else if (PATH.includes("uts/v2/brands/")) Type = "Channels";
									else if (PATH.includes("uts/v3/movies/")) Type = "Movies";
									else if (PATH.includes("uts/v3/shows/")) Type = "TV";
									else if (PATH.includes("uts/v3/sporting-events/")) {
										Type = "Sports";
										//if (Settings["Third-Party"])
										URL.query.pfm = (Platform === "desktop") ? "ipad" : Platform;
									}
									else if (PATH.includes("uts/v3/canvases/Sports/")) {
										Type = "Sports";
										//if (Settings["Third-Party"])
										URL.query.pfm = (Platform === "desktop") ? "ipad" : Platform;
									}
									else if (PATH.includes("uts/v3/canvases/Persons/")) Type = "Persons";
									else if (PATH.includes("uts/v3/canvases/Rooms/")) Type = "Others";
									//else if (PATH.includes("uts/v3/playables/")) Type = "Others";
									//else if (PATH.includes("uts/v3/shelves/")) Type = "Others";
									else Type = "Others";
									break;
							};
							break;
						case "umc-tempo-api.apple.com":
							switch (PATH) {
								case "v3/register":
								case "v3/channels/scoreboard":
								case "v3/channels/scoreboard/":
									Type = "Sports";
									break;
								default:
									if (PATH.includes("v3/register/")) Type = "Sports";
									break;
							};
							break;
					};
					$.log(`⚠ ${$.name}, Type = ${Type}, CC = ${Settings.CountryCode[Type]}`);
					break;
				case "CONNECT":
				case "TRACE":
					break;
			};
			if ($request.headers?.["X-Apple-Store-Front"]) $request.headers["X-Apple-Store-Front"] = (Configs.Storefront.get(Settings.CountryCode[Type])) ? $request.headers["X-Apple-Store-Front"].replace(/\d{6}/, Configs.Storefront.get(Settings.CountryCode[Type])) : $request.headers["X-Apple-Store-Front"];
			if ($request.headers?.["x-apple-store-front"]) $request.headers["x-apple-store-front"] = (Configs.Storefront.get(Settings.CountryCode[Type])) ? $request.headers["x-apple-store-front"].replace(/\d{6}/, Configs.Storefront.get(Settings.CountryCode[Type])) : $request.headers["x-apple-store-front"];
			if (URL.query?.sf) URL.query.sf = Configs.Storefront.get(Settings.CountryCode[Type]) ?? URL.query.sf
			if (URL.query?.locale) URL.query.locale = Configs.Locale.get(Settings.CountryCode[Type]) ?? URL.query.locale
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
			default: { // 有构造回复数据，返回构造的回复数据
				const FORMAT = ($response?.headers?.["Content-Type"] ?? $response?.headers?.["content-type"])?.split(";")?.[0];
				$.log(`🎉 ${$.name}, finally`, `echo $response`, `FORMAT: ${FORMAT}`, "");
				//$.log(`🚧 ${$.name}, finally`, `echo $response: ${JSON.stringify($response)}`, "");
				if ($response?.headers?.["Content-Encoding"]) $response.headers["Content-Encoding"] = "identity";
				if ($response?.headers?.["content-encoding"]) $response.headers["content-encoding"] = "identity";
				if ($.isQuanX()) {
					$response.status = "HTTP/1.1 200 OK";
					delete $response?.headers?.["Content-Length"];
					delete $response?.headers?.["content-length"];
					delete $response?.headers?.["Transfer-Encoding"];
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
							$.done({ status: $response.status, headers: $response.headers, bodyBytes: $response.bodyBytes });
							break;
					};
				} else $.done({ response: $response });
				break;
			};
			case undefined: { // 无构造回复数据，发送修改的请求数据
				$.log(`🎉 ${$.name}, finally`, `$request`, `FORMAT: ${FORMAT}`, "");
				//$.log(`🚧 ${$.name}, finally`, `$request: ${JSON.stringify($request)}`, "");
				if ($.isQuanX()) {
					switch (FORMAT) {
						case undefined: // 视为无body
							// 返回普通数据
							$.done({ url: $request.url, headers: $request.headers })
							break;
						default:
							// 返回普通数据
							$.done({ url: $request.url, headers: $request.headers, body: $request.body })
							break;
						case "application/protobuf":
						case "application/x-protobuf":
						case "application/vnd.google.protobuf":
						case "application/grpc":
						case "application/grpc+proto":
						case "applecation/octet-stream":
							// 返回二进制数据
							//$.log(`${$request.bodyBytes.byteLength}---${$request.bodyBytes.buffer.byteLength}`);
							$.done({ url: $request.url, headers: $request.headers, bodyBytes: $request.bodyBytes.buffer.slice($request.bodyBytes.byteOffset, $request.bodyBytes.byteLength + $request.bodyBytes.byteOffset) });
							break;
					};
				} else $.done($request);
				break;
			};
		};
	})

/***************** Function *****************/
