/*
README: https://github.com/VirgilClyne/iRingo
*/

import ENVs from "./ENV/ENV.mjs";
import URIs from "./URI/URI.mjs";

import Database from "./database/index.mjs";
import setENV from "./function/setENV.mjs";

const $ = new ENVs(" iRingo: 📺 TV v3.2.3(2) response");
const URI = new URIs();

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
	const { Settings, Caches, Configs } = setENV("iRingo", "TV", Database);
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
					body = JSON.parse($response.body);
					// 主机判断
					switch (HOST) {
						case "uts-api.itunes.apple.com":
							// 路径判断
							switch (PATH) {
								case "uts/v3/configurations":
									const Version = parseInt(URL.query?.v, 10), Platform = URL.query?.pfm, Locale = ($request.headers?.["X-Apple-I-Locale"] ?? $request.headers?.["x-apple-i-locale"])?.split('_')?.[0] ?? "zh";
									if (URL.query.caller !== "wta") { // 不修改caller=wta的configurations数据
										$.log(`⚠ ${$.name}`, `Locale: ${Locale}`, `Platform: ${Platform}`, `Version: ${Version}`, "");
										if (body?.data?.applicationProps) {
											let newTabs = [];
											Settings.Tabs.forEach((type) => {
												if (body.data.applicationProps.tabs.some(Tab => Tab?.type === type)) {
													let tab = body.data.applicationProps.tabs.find(Tab => Tab?.type === type);
													let index = body.data.applicationProps.tabs.findIndex(Tab => Tab?.type === type);
													if (index === 0) newTabs.unshift(tab);
													else newTabs.push(tab);
												} else if (Configs.Tabs.some(Tab => Tab?.type === type)) {
													let tab = Configs.Tabs.find(Tab => Tab?.type === type);
													switch (tab?.destinationType) {
														case "SubTabs":
															tab.subTabs = tab.subTabs.map(subTab => {
																subTab.title = Configs.i18n?.[subTab.type]?.get(Locale) ?? tab.title;
																return subTab;
															});
														case "Target":
														case "Client":
															tab.title = Configs.i18n?.[tab.type]?.get(Locale) ?? tab.title;
															break;
													};
													switch (tab?.type) {
														case "WatchNow":
														case "Originals":
															newTabs.push(tab);
															break;
														case "Store":
															if (Version >= 54) {
																if (Version >= 74) {
																	tab.destinationType = "Target";
																	tab.target = { "id": "tahoma_store", "type": "Root", "url": "https://tv.apple.com/store" };
																	tab.universalLinks = ["https://tv.apple.com/store", "https://tv.apple.com/movies", "https://tv.apple.com/tv-shows"];
																	delete tab?.subTabs;
																}
																newTabs.push(tab);
															};
															break;
														case "Movies":
														case "TV":
															if (Version < 54) tab.secondaryEnabled = true;
															if (Version < 54) newTabs.push(tab);
															break;
														case "MLS":
															if (Version >= 64) {
																switch (Platform) {
																	case "atv":
																	case "ipad":
																	case "appletv":
																	case "desktop":
																	default:
																		newTabs.push(tab);
																	case "iphone":
																		return;
																};
															};
															break;
														case "Sports":
														case "Kids":
															if (Version < 54) tab.secondaryEnabled = true;
															if (Version < 54) newTabs.push(tab);
															else {
																switch (Platform) {
																	case "atv":
																	case "ipad":
																	case "appletv":
																	case "desktop":
																	default:
																		newTabs.push(tab);
																		break;
																	case "iphone":
																		break;;
																};
															};
															break;
														case "Search":
															if (Version >= 74) tab.target.id = "tahoma_searchlanding";
															newTabs.push(tab);
															break;
														case "ChannelsAndApps":
															if (Version >= 74) {
																switch (Platform) {
																	case "atv":
																	case "ipad":
																	case "appletv":
																		newTabs.push(tab);
																		break;
																	case "desktop":
																	case "iphone":
																	default:
																		break;
																};
															};
															break;
														case "Library":
														default:
															newTabs.push(tab);
															break;
													};
												};
											});
											body.data.applicationProps.tabs = newTabs;
										};
									};
									break;
								case "uts/v3/user/settings":
									break;
								case "uts/v3/canvases/Roots/watchNow": // 立即观看
								case "uts/v3/canvases/Channels/tvs.sbd.4000": // Apple TV+
								case "uts/v3/canvases/Channels/tvs.sbd.7000": // MLS Season Pass
									let shelves = body?.data?.canvas?.shelves;
									if (shelves) {
										shelves = shelves.map(shelf => {
											if (shelf?.items) {
												shelf.items = shelf.items.map(item => {
													let playable = item?.playable || item?.videos?.shelfVideoTall;
													let playables = item?.playables;
													if (playable) playable = setPlayable(playable, Settings?.HLSUrl, Settings?.ServerUrl);
													if (playables) Object.keys(playables).forEach(playable => playables[playable] = setPlayable(playables[playable], Settings?.HLSUrl, Settings?.ServerUrl));
													return item;
												});
											};
											return shelf;
										});
										body.data.canvas.shelves = shelves;
									};
									break;
								case "uts/v3/shelves/uts.col.UpNext": // 待播清單
								case "uts/v3/shelves/uts.col.ChannelUpNext.tvs.sbd.4000": // Apple TV+ 待播節目
								case "uts/v3/shelves/uts.col.ChannelUpNext.tvs.sbd.7000": // MLS Season Pass 待播節目
								case "uts/v3/shelves/edt.col.62d7229e-d9a1-4f00-98e5-458c11ed3938": // 精選推薦
									let shelf = body?.data?.shelf;
									if (shelf?.items) {
										shelf.items = shelf.items.map(item => {
											let playable = item?.playable || item?.videos?.shelfVideoTall;
											let playables = item?.playables;
											if (playable) playable = setPlayable(playable, Settings?.HLSUrl, Settings?.ServerUrl);
											if (playables) Object.keys(playables).forEach(playable => playables[playable] = setPlayable(playables[playable], Settings?.HLSUrl, Settings?.ServerUrl));
											return item;
										});
									};
									break;
								default:
									switch (PATHs[0]) {
										case "uts":
											switch (PATHs[1]) {
												case "v3":
													switch (PATHs[2]) {
														case "movies": // uts/v3/movies/
														case "shows": // uts/v3/shows/
														case "sporting-events": // uts/v3/sporting-events/
															let shelves = body?.data?.canvas?.shelves;
															let backgroundVideo = body?.data?.content?.backgroundVideo;
															let playables = body?.data?.playables;
															if (shelves) {
																shelves = shelves.map(shelf => {
																	if (shelf?.items) {
																		shelf.items = shelf.items.map(item => {
																			let playable = item?.playable || item?.videos?.shelfVideoTall;
																			let playables = item?.playables;
																			if (playable) playable = setPlayable(playable, Settings?.HLSUrl, Settings?.ServerUrl);
																			if (playables) Object.keys(playables).forEach(playable => playables[playable] = setPlayable(playables[playable], Settings?.HLSUrl, Settings?.ServerUrl));
																			return item;
																		});
																	};
																	return shelf;
																});
																body.data.canvas.shelves = shelves;
															};
															if (backgroundVideo) backgroundVideo = setPlayable(backgroundVideo, Settings?.HLSUrl, Settings?.ServerUrl);
															if (playables) Object.keys(playables).forEach(playable => playables[playable] = setPlayable(playables[playable], Settings?.HLSUrl, Settings?.ServerUrl));
															break;
													};
													break;
											};
											break;
									};
									break;
							};
							break;
						case "umc-tempo-api.apple.com":
							// 路径判断
							switch (PATH) {
								case "v3/register":
								case "v3/channels/scoreboard":
								case "v3/channels/scoreboard/":
									$.log(JSON.stringify(body));
									break;
								default:
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
function setPlayable(playable, HLSUrl, ServerUrl) {
	$.log(`☑️ ${$.name}, Set Playable Content`, "");
	let assets = playable?.assets;
	let itunesMediaApiData = playable?.itunesMediaApiData;
	if (assets) assets = setUrl(assets, HLSUrl, ServerUrl);
	if (itunesMediaApiData?.movieClips) itunesMediaApiData.movieClips = itunesMediaApiData.movieClips.map(movieClip => setUrl(movieClip, HLSUrl, ServerUrl));
	if (itunesMediaApiData?.offers) itunesMediaApiData.offers = itunesMediaApiData.offers.map(offer => setUrl(offer, HLSUrl, ServerUrl));
	if (itunesMediaApiData?.personalizedOffers) itunesMediaApiData.personalizedOffers = itunesMediaApiData.personalizedOffers.map(personalizedOffer => setUrl(personalizedOffer, HLSUrl, ServerUrl));
	$.log(`✅ ${$.name}, Set Playable Content`, "");
	return playable;

	function setUrl(asset, HLSUrl, ServerUrl) {
		$.log(`☑️ ${$.name}, Set Url`, "");
		if (asset?.hlsUrl) {
			let hlsUrl = URI.parse(asset.hlsUrl);
			switch (hlsUrl.path) {
				case "WebObjects/MZPlay.woa/hls/playlist.m3u8":
					break;
				case "WebObjects/MZPlayLocal.woa/hls/subscription/playlist.m3u8":
					hlsUrl.host = HLSUrl || "play-edge.itunes.apple.com";
					break;
				case "WebObjects/MZPlay.woa/hls/workout/playlist.m3u8":
					break;
			};
			asset.hlsUrl = URI.stringify(hlsUrl);
		};
		if (asset?.fpsKeyServerUrl) {
			let fpsKeyServerUrl = URI.parse(asset.fpsKeyServerUrl);
			fpsKeyServerUrl.host = ServerUrl || "play.itunes.apple.com";
			asset.fpsKeyServerUrl = URI.stringify(fpsKeyServerUrl);
		};
		if (asset?.fpsNonceServerUrl) {
			let fpsNonceServerUrl = URI.parse(asset.fpsNonceServerUrl);
			fpsNonceServerUrl.host = ServerUrl || "play.itunes.apple.com";
			asset.fpsNonceServerUrl = URI.stringify(fpsNonceServerUrl);
		};
		$.log(`✅ ${$.name}, Set Url`, "");
		return asset;
	};
};
