import _ from './ENV/Lodash.mjs'
import $Storage from './ENV/$Storage.mjs'
import ENV from "./ENV/ENV.mjs";
import URL from "./URL/URL.mjs";

import Database from "./database/index.mjs";
import setENV from "./function/setENV.mjs";

const $ = new ENV(" iRingo: 📺 TV v3.3.0(1005) response.beta");

/***************** Processing *****************/
// 解构URL
const url = new URL($request.url);
$.log(`⚠ url: ${url.toJSON()}`, "");
// 获取连接参数
const METHOD = $request.method, HOST = url.hostname, PATH = url.pathname, PATHs = url.paths;
$.log(`⚠ METHOD: ${METHOD}, HOST: ${HOST}, PATH: ${PATH}` , "");
// 解析格式
const FORMAT = ($response.headers?.["Content-Type"] ?? $response.headers?.["content-type"])?.split(";")?.[0];
$.log(`⚠ FORMAT: ${FORMAT}`, "");
!(async () => {
	const { Settings, Caches, Configs } = setENV("iRingo", "TV", Database);
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
					body = JSON.parse($response.body);
					// 主机判断
					switch (HOST) {
						case "uts-api.itunes.apple.com":
							const Version = parseInt(url.searchParams.get("v"), 10), Platform = url.searchParams.get("pfm"), Caller = url.searchParams.get("caller");
							$.log(`🚧 调试信息, Version = ${Version}, Platform = ${Platform}, Caller = ${Caller}`, "")
							const StoreFront = url.searchParams.get("sf");
							const Locale = ($request.headers?.["X-Apple-I-Locale"] ?? $request.headers?.["x-apple-i-locale"])?.split('_')?.[0] ?? "zh";
							$.log(`🚧 调试信息, StoreFront = ${StoreFront}, Locale = ${Locale}`, "")
							// 路径判断
							switch (PATH) {
								case "/uts/v3/configurations":
									if (Caller !== "wta") { // 不修改caller=wta的configurations数据
										if (body?.data?.applicationProps) {
											//body.data.applicationProps.requiredParamsMap.WithoutUtsk.locale = "zh_Hans";
											//body.data.applicationProps.requiredParamsMap.Default.locale = "zh_Hans";
											let newTabs = [];
											Settings.Tabs.forEach((type) => {
												if (body.data.applicationProps.tabs.some(Tab => Tab?.type === type)) {
													let tab = body.data.applicationProps.tabs.find(Tab => Tab?.type === type);
													$.log(`🚧 oTab: ${JSON.stringify(tab)}`, "");
													let index = body.data.applicationProps.tabs.findIndex(Tab => Tab?.type === type);
													$.log(`🚧 oIndex: ${index}`, "");
													if (index === 0) newTabs.unshift(tab);
													else newTabs.push(tab);
												} else if (Configs.Tabs.some(Tab => Tab?.type === type)) {
													let tab = Configs.Tabs.find(Tab => Tab?.type === type);
													$.log(`🚧 aTab: ${JSON.stringify(tab)}`, "");
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
											$.log(`🚧 newTabs: ${JSON.stringify(newTabs)}`, "");
											body.data.applicationProps.tabs = newTabs;
											/*
											body.data.applicationProps.tabs = Configs.Tabs.map((tab, index) => {
												if (Settings.Tabs.includes(tab?.type)) {
													tab = body.data.applicationProps.tabs.find(Tab => Tab?.type === tab?.type);
													$.log(JSON.stringify(tab));
													if (!tab) tab = Configs.Tabs.find(Tab => Tab?.type === tab?.type);
												} else {
													tab = Configs.Tabs.find(Tab => Tab?.type === tab?.type);
													body.data.applicationProps.tabs.splice(index, 0,);
												};
											});
											body.data.applicationProps.tabs = Configs.Tabs.map(tab => {
												if (Settings.Tabs.includes(tab?.type)) {
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
															return tab;
														case "Store":
															if (Version >= 54) {
																if (Version >= 74) {
																	tab.destinationType = "Target";
																	tab.target = { "id": "tahoma_store", "type": "Root", "url": "https://tv.apple.com/store" };
																	tab.universalLinks = ["https://tv.apple.com/store", "https://tv.apple.com/movies", "https://tv.apple.com/tv-shows"];
																	delete tab?.subTabs;
																}
																return tab;
															} else return;
														case "Movies":
														case "TV":
															if (Version < 54) tab.secondaryEnabled = true;
															if (Version < 54) return tab;
															else return;
														case "MLS":
															if (Version >= 64) {
																switch (Platform) {
																	case "atv":
																	case "ipad":
																	case "appletv":
																	case "desktop":
																	default:
																		return tab;
																	case "iphone":
																		return;
																};
															} else return;
														case "Sports":
														case "Kids":
															if (Version < 54) tab.secondaryEnabled = true;
															if (Version < 54) return tab;
															else {
																switch (Platform) {
																	case "atv":
																	case "ipad":
																	case "appletv":
																	case "desktop":
																	default:
																		return tab;
																	case "iphone":
																		return;
																};
															};
														case "Search":
															if (Version >= 74) tab.target.id = "tahoma_searchlanding";
															return tab;
														case "Library":
														default:
															return tab;
													};
												};
											}).filter(Boolean);
											*/
											//body.data.applicationProps.tabs = createTabsGroup("Tabs", caller, platform, locale, region);
											//body.data.applicationProps.tvAppEnabledInStorefront = true;
											//body.data.applicationProps.enabledClientFeatures = (Version > 53) ? [{ "domain": "tvapp", "name": "snwpcr" }, { "domain": "tvapp", "name": "store_tab" }]
											//	: [{ "domain": "tvapp", "name": "expanse" }, { "domain": "tvapp", "name": "syndication" }, { "domain": "tvapp", "name": "snwpcr" }];
											//body.data.applicationProps.storefront.localesSupported = ["zh_Hans", "zh_Hant", "yue-Hant", "en_US", "en_GB"];
											//body.data.applicationProps.storefront.storefrontId = 143470;
											//body.data.applicationProps.featureEnablers["topShelf"] = true;
											//body.data.applicationProps.featureEnablers["sports"] = true;
											//body.data.applicationProps.featureEnablers["sportsFavorites"] = true;
											//body.data.applicationProps.featureEnablers["unw"] = true;
											//body.data.applicationProps.featureEnablers["imageBasedSubtitles"] = false;
											//body.data.applicationProps.featureEnablers["ageVerification"] = false;
											//body.data.applicationProps.featureEnablers["seasonTitles"] = false;
											//body.data.userProps.activeUser = true;
											//body.data.userProps.utsc = "1:18943";
											//body.data.userProps.country = country;
											//body.data.userProps.gac = true;
										};
									};
									break;
								case "/uts/v3/user/settings":
									break;
								case "/uts/v3/canvases/Roots/watchNow": // 立即观看
								case "/uts/v3/canvases/Channels/tvs.sbd.4000": // Apple TV+
								case "/uts/v3/canvases/Channels/tvs.sbd.7000": // MLS Season Pass
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
								case "/uts/v3/shelves/uts.col.UpNext": // 待播清單
								case "/uts/v3/shelves/uts.col.ChannelUpNext.tvs.sbd.4000": // Apple TV+ 待播節目
								case "/uts/v3/shelves/uts.col.ChannelUpNext.tvs.sbd.7000": // MLS Season Pass 待播節目
								case "/uts/v3/shelves/edt.col.62d7229e-d9a1-4f00-98e5-458c11ed3938": // 精選推薦
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
														case "episodes": // uts/v3/episodes/
														case "sporting-events": // uts/v3/sporting-events/
															let shelves = body?.data?.canvas?.shelves;
															let backgroundVideo = body?.data?.content?.backgroundVideo;
															let playables = body?.data?.playables;
															if (shelves) {
																shelves = shelves.map(shelf => {
																	if (shelf?.items) {
																		shelf.items = shelf.items.map(item => {
																			let playable = item?.playable || item?.videos?.shelfVideoTall;
																			if (playable) playable = setPlayable(playable, Settings?.HLSUrl, Settings?.ServerUrl);
																			let playables = item?.playables;
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
									//if (PATH.includes("/uts/v3/canvases/Channels/")) $response.body = await getData("View", Settings, Configs);
									//else if (PATH.includes("/uts/v2/brands/")) $response.body = await getData("View", Settings, Configs);
									//else if (PATH.includes("/uts/v3/movies/")) $response.body = await getData("View", Settings, Configs);
									//else if (PATH.includes("/uts/v3/shows/")) $response.body = await getData("View", Settings, Configs);
									//else if (PATH.includes("/uts/v3/shelves/")) $response.body = await getData("View", Settings, Configs);
									//else if (PATH.includes("/uts/v3/playables/")) $response.body = await getData("View", Settings, Configs);
									break;
							};
							break;
						case "umc-tempo-api.apple.com":
							// 路径判断
							switch (PATH) {
								case "/v3/register":
								case "/v3/channels/scoreboard":
								case "/v3/channels/scoreboard/":
									$.log(JSON.stringify(body));
									//body.channels.storeFront = "UNITED_STATES";
									//body.channels.storeFront = "TAIWAN";
									break;
								default:
									//if (PATH.includes("v3/register/")) Type = "Sports";
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

/***************** Function *****************/
function setPlayable(playable, HLSUrl, ServerUrl) {
	$.log(`☑️ Set Playable Content`, "");
	let assets = playable?.assets;
	let itunesMediaApiData = playable?.itunesMediaApiData;
	if (assets) assets = setUrl(assets, HLSUrl, ServerUrl);
	if (itunesMediaApiData?.movieClips) itunesMediaApiData.movieClips = itunesMediaApiData.movieClips.map(movieClip => setUrl(movieClip, HLSUrl, ServerUrl));
	if (itunesMediaApiData?.offers) itunesMediaApiData.offers = itunesMediaApiData.offers.map(offer => setUrl(offer, HLSUrl, ServerUrl));
	if (itunesMediaApiData?.personalizedOffers) itunesMediaApiData.personalizedOffers = itunesMediaApiData.personalizedOffers.map(personalizedOffer => setUrl(personalizedOffer, HLSUrl, ServerUrl));
	$.log(`✅ Set Playable Content`, "");
	return playable;

	function setUrl(asset, HLSUrl, ServerUrl) {
		$.log(`☑️ Set Url`, "");
		if (asset?.hlsUrl) {
			let hlsUrl = new URL(asset.hlsUrl);
			switch (hlsUrl.pathname) {
				case "WebObjects/MZPlay.woa/hls/playlist.m3u8":
					//hlsUrl.hostname = HLSUrl || "play.itunes.apple.com";
					break;
				case "WebObjects/MZPlayLocal.woa/hls/subscription/playlist.m3u8":
					hlsUrl.hostname = HLSUrl || "play-edge.itunes.apple.com";
					break;
				case "WebObjects/MZPlay.woa/hls/workout/playlist.m3u8":
					//hlsUrl.hostname = HLSUrl || "play.itunes.apple.com";
					break;
			};
			asset.hlsUrl = hlsUrl.toString();
		};
		if (asset?.fpsKeyServerUrl) {
			let fpsKeyServerUrl = new URL(asset.fpsKeyServerUrl);
			fpsKeyServerUrl.hostname = ServerUrl || "play.itunes.apple.com";
			asset.fpsKeyServerUrl = fpsKeyServerUrl.toString();
		};
		if (asset?.fpsNonceServerUrl) {
			let fpsNonceServerUrl = new URL(asset.fpsNonceServerUrl);
			fpsNonceServerUrl.hostname = ServerUrl || "play.itunes.apple.com";
			asset.fpsNonceServerUrl = fpsNonceServerUrl.toString();
		};
		$.log(`✅ Set Url`, "");
		return asset;
	};
};

async function getData(type, settings, database) {
	$.log(`⚠ Get View Data`, "");
	let CCs = [settings.CountryCode[type], "US", "GB"].flat(Infinity);
	$.log(`CCs=${CCs}`)
	//查询是否有符合语言的字幕
	let data = [];
	for await (const CC of CCs) {
		let request = {
			"url": $request.url,
			"headers": $request.headers
		}
		request.url = new URL(request.url);
		request.url.searchParams.set("sf", database.Storefront[CC]);
		$.log(`sf=${request.url.searchParams.get("sf")}`)
		request.url.searchParams.set("locale", database.Locale[CC]);
		$.log(`locale=${request.url.searchParams.get("locale")}`)
		request.url = request.url.toString();
		$.log(`request.url=${request.url}`)
		request.headers["X-Surge-Skip-Scripting"] = "true"
		data = await $.fetch(request).then(data => data);
		$.log(`data=${JSON.stringify(data)}`)
		if (data.statusCode === 200 || data.status === 200 ) break;
	};
	$.log(`🎉 调试信息`, "Get EXT-X-MEDIA Data", `datas: ${JSON.stringify(data.body)}`, "");
	return data.body
};
