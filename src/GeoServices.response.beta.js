import { $platform, _, Storage, fetch, notification, log, logError, wait, done, getScript, runScript } from "./utils/utils.mjs";
import XML from "./XML/XML.mjs";
import Database from "./database/index.mjs";
import setENV from "./function/setENV.mjs";
import { BinaryReader, UnknownFieldHandler } from "@protobuf-ts/runtime";
import GEOResourceManifestDownload from "./class/GEOResourceManifestDownload.mjs";
log("v3.6.0(1009)");
/***************** Processing *****************/
// 解构URL
const url = new URL($request.url);
log(`⚠ url: ${url.toJSON()}`, "");
// 获取连接参数
const METHOD = $request.method, HOST = url.hostname, PATH = url.pathname;
log(`⚠ METHOD: ${METHOD}, HOST: ${HOST}, PATH: ${PATH}` , "");
// 解析格式
const FORMAT = ($response.headers?.["Content-Type"] ?? $response.headers?.["content-type"])?.split(";")?.[0];
log(`⚠ FORMAT: ${FORMAT}`, "");
!(async () => {
	const { Settings, Caches, Configs } = setENV("iRingo", ["Location", "Maps"], Database);
	log(`⚠ Settings.Switch: ${Settings?.Switch}`, "");
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
					//log(`🚧 body: ${body}`, "");
					break;
				case "application/x-mpegURL":
				case "application/x-mpegurl":
				case "application/vnd.apple.mpegurl":
				case "audio/mpegurl":
					//body = M3U8.parse($response.body);
					//log(`🚧 body: ${JSON.stringify(body)}`, "");
					//$response.body = M3U8.stringify(body);
					break;
				case "text/xml":
				case "text/html":
				case "text/plist":
				case "application/xml":
				case "application/plist":
				case "application/x-plist":
					// 主机判断
					switch (HOST) {
						case "gspe1-ssl.ls.apple.com":
							//body = new DOMParser().parseFromString($response.body, FORMAT);
							// 路径判断
							switch (PATH) {
								case "/pep/gcc":
									_.set(Caches, "pep.gcc", $response.body);
									Storage.setItem("@iRingo.Location.Caches", Caches);
									switch (Settings.PEP.GCC) {
										case "AUTO":
											break;
										default:
											$response.body = Settings.PEP.GCC;
											break;
									};
									break;
							};
							//$repsonse.body = new XMLSerializer().serializeToString(body);
							break;
						case "configuration.ls.apple.com":
							//body = await PLISTs("plist2json", $response.body);
							BigInt.prototype.toJSON = function () { return this.toString() };
							body = XML.parse($response.body);
							log(`🚧 body: ${JSON.stringify(body)}`, "");
							// 路径判断
							switch (PATH) {
								case "/config/defaults":
									const PLIST = body.plist;
									if (PLIST) {
										// CN
										PLIST["com.apple.GEO"].CountryProviders.CN.ShouldEnableLagunaBeach = true; // XX
										PLIST["com.apple.GEO"].CountryProviders.CN.DrivingMultiWaypointRoutesEnabled = true; // 驾驶导航途径点
										//PLIST["com.apple.GEO"].CountryProviders.CN.EnableAlberta = false; // CN
										PLIST["com.apple.GEO"].CountryProviders.CN.EnableClientDrapedVectorPolygons = true; // CN
										PLIST["com.apple.GEO"].CountryProviders.CN.GEOAddressCorrectionEnabled = true; // CN
										delete PLIST["com.apple.GEO"].CountryProviders.CN.GEOBatchSpatialEventLookupMaxParametersCount // CN
										delete PLIST["com.apple.GEO"].CountryProviders.CN.GEOBatchSpatialPlaceLookupMaxParametersCount // CN
										PLIST["com.apple.GEO"].CountryProviders.CN.LocalitiesAndLandmarksSupported = true; // CN
										PLIST["com.apple.GEO"].CountryProviders.CN.NavigationShowHeadingKey = true;
										PLIST["com.apple.GEO"].CountryProviders.CN.POIBusynessDifferentialPrivacy = true; // CN
										PLIST["com.apple.GEO"].CountryProviders.CN.POIBusynessRealTime = true; // CN
										PLIST["com.apple.GEO"].CountryProviders.CN.TransitPayEnabled = true; // CN
										//PLIST["com.apple.GEO"].CountryProviders.CN.WiFiQualityNetworkDisabled = Settings?.Config?.Defaults?.WiFiQualityNetworkDisabled ?? true; // CN
										//PLIST["com.apple.GEO"].CountryProviders.CN.WiFiQualityTileDisabled = Settings?.Config?.Defaults?.WiFiQualityTileDisabled ?? true; // CN
										PLIST["com.apple.GEO"].CountryProviders.CN.SupportsOffline = true; // CN
										PLIST["com.apple.GEO"].CountryProviders.CN.SupportsCarIntegration = true; // CN
										// TW
										PLIST["com.apple.GEO"].CountryProviders.CN.GEOShouldSpeakWrittenAddresses = true; // TW
										PLIST["com.apple.GEO"].CountryProviders.CN.GEOShouldSpeakWrittenPlaceNames = true; // TW
										// US
										PLIST["com.apple.GEO"].CountryProviders.CN["6694982d2b14e95815e44e970235e230"] = true; // US
										PLIST["com.apple.GEO"].CountryProviders.CN.PedestrianAREnabled = true; // 现实世界中的线路
										PLIST["com.apple.GEO"].CountryProviders.CN.OpticalHeadingEnabled = true; // 举起以查看
										PLIST["com.apple.GEO"].CountryProviders.CN.UseCLPedestrianMapMatchedLocations = true; // 导航准确性-增强
									};
									break;
							};
							log(`🚧 body: ${JSON.stringify(body)}`, "");
							//$response.body = await PLISTs("json2plist", body); // json2plist
							$response.body = XML.stringify(body);
							break;
					};
					break;
				case "text/vtt":
				case "application/vtt":
					//body = VTT.parse($response.body);
					//log(`🚧 body: ${JSON.stringify(body)}`, "");
					//$response.body = VTT.stringify(body);
					break;
				case "text/json":
				case "application/json":
					body = JSON.parse($response.body ?? "{}");
					log(`🚧 body: ${JSON.stringify(body)}`, "");
					$response.body = JSON.stringify(body);
					break;
				case "application/protobuf":
				case "application/x-protobuf":
				case "application/vnd.google.protobuf":
				case "application/grpc":
				case "application/grpc+proto":
				case "application/octet-stream":
					//log(`🚧 $response: ${JSON.stringify($response, null, 2)}`, "");
					let rawBody = ($platform === "Quantumult X") ? new Uint8Array($response.bodyBytes ?? []) : $response.body ?? new Uint8Array();
					//log(`🚧 isBuffer? ${ArrayBuffer.isView(rawBody)}: ${JSON.stringify(rawBody)}`, "");
					switch (FORMAT) {
						case "application/protobuf":
						case "application/x-protobuf":
						case "application/vnd.google.protobuf":
						case "application/octet-stream":
							switch (HOST) {
								case "gspe35-ssl.ls.apple.com":
									switch (PATH) {
										case "/config/announcements":
											break;
										case "/geo_manifest/dynamic/config":
											body = GEOResourceManifestDownload.decode(rawBody);
											log(`🚧 调试信息`, `body before: ${JSON.stringify(body)}`, "");
											
											let UF = UnknownFieldHandler.list(body);
											log(`🚧 调试信息`, `UF: ${JSON.stringify(UF)}`, "");
											if (UF) {
												UF = UF.map(uf => {
													uf.no; // 22
													uf.wireType; // WireType.Varint
													// use the binary reader to decode the raw data:
													let reader = new BinaryReader(uf.data);
													let addedNumber = reader.int32(); // 7777
													log(`🚧 no: ${uf.no}, wireType: ${uf.wireType}, reader: ${reader}, addedNumber: ${addedNumber}`, "");
												});
											};
											
											/*
											switch (url.searchParams.get("country_code")) {
												case "CN":
													setCache(Caches, "CN", body);
													Caches.XX = Caches.XX || Configs.XX;
													// announcementsSupportedLanguage
													//body.announcementsSupportedLanguage?.push?.("zh-CN");
													//body.announcementsSupportedLanguage?.push?.("zh-TW");
													break;
												default:
													setCache(Caches, "XX", body);
													Caches.CN = Caches.CN || Configs.CN;
													// resource
													body.resource.push({ "resourceType": 7, "filename": "POITypeMapping-CN-1.json", "checksum": { "0": 242, "1": 10, "2": 179, "3": 107, "4": 214, "5": 41, "6": 50, "7": 223, "8": 62, "9": 204, "10": 134, "11": 7, "12": 103, "13": 206, "14": 96, "15": 242, "16": 24, "17": 42, "18": 79, "19": 223 }, "region": [], "filter": [], "validationMethod": 0, "updateMethod": 0 });
													body.resource.push({ "resourceType": 7, "filename": "China.cms-lpr", "checksum": { "0": 196, "1": 139, "2": 158, "3": 17, "4": 250, "5": 132, "6": 138, "7": 10, "8": 138, "9": 38, "10": 96, "11": 130, "12": 82, "13": 80, "14": 4, "15": 239, "16": 11, "17": 107, "18": 183, "19": 236 }, "region": [{ "minX": 1, "minY": 0, "maxX": 1, "maxY": 0, "minZ": 1, "maxZ": 25 }], "filter": [{ "scale": [], "scenario": [4] }], "connectionType": 0, "preferWiFiAllowedStaleThreshold": 0, "validationMethod": 1, "alternateResourceURLIndex": 1, "updateMethod": 1, "timeToLiveSeconds": 0 });
													break;
											};
											body.tileSet = tileSets(body.tileSet, Settings, Caches);
											body.attribution = attributions(body.attribution, url, Caches);
											//body.dataSet = dataSets(body.dataSet, Settings, Caches);
											body.dataSet = body.dataSet || Caches.XX?.dataSet || Configs.XX?.dataSet;
											body.urlInfoSet = urlInfoSets(body.urlInfoSet, url, Settings, Caches);
											body.muninBucket = muninBuckets(body.muninBucket, Settings, Caches);
											// releaseInfo
											//body.releaseInfo = body.releaseInfo.replace(/(\d+\.\d+)/, `$1.${String(Date.now()/1000)}`);
											log(`🚧 releaseInfo: ${body.releaseInfo}`, "");
											body = SetTileGroup(body);
											*/
											//log(`🚧 调试信息`, `body after: ${JSON.stringify(body)}`, "");
											rawBody = GEOResourceManifestDownload.encode(body);
											break;
									};
									break;
							};
							break;
						case "application/grpc":
						case "application/grpc+proto":
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
	.catch((e) => logError(e))
	.finally(() => done($response))

/***************** Function *****************/
function setCache(cache, path, body) {
	log(`☑️ Set Cache, path: ${path}`, "");
	if (Date.now() - _.get(cache, `${path}.timeStamp`, 0) > 86400000) {
		_.set(cache, `${path}.tileSet`, body.tileSet);
		_.set(cache, `${path}.attribution`, body.attribution);
		_.set(cache, `${path}.urlInfoSet`, body.urlInfoSet);
		_.set(cache, `${path}.muninBucket`, body.muninBucket);
		_.set(cache, `${path}.timeStamp`, Date.now());
		Storage.setItem("@iRingo.Maps.Caches", cache);
		log(`✅ Set Cache`, "");
	} else log(`❎ Set Cache`, "");
};

function SetTileGroup(body = {}) {
	log(`☑️ Set TileGroups`, "");
	body.tileGroup = body.tileGroup.map(tileGroup => {
		log(`🚧 tileGroup.identifier: ${tileGroup.identifier}`);
		tileGroup.identifier += Math.floor(Math.random() * 100) + 1;
		log(`🚧 tileGroup.identifier: ${tileGroup.identifier}`);
		tileGroup.tileSet = body.tileSet.map((tileSet, index) => {
			return {
				"tileSetIndex": index,
				"identifier": tileSet.validVersion?.[0]?.identifier
			};
		});
		tileGroup.attributionIndex = body.attribution.map((attribution, index) => {
			return index;
		});
		tileGroup.resourceIndex = body.resource.map((resource, index) => {
			return index;
		});
		return tileGroup;
	});
	log(`✅ Set TileGroups`, "");
	return body;
};

function tileSets(tileSets = [], settings = {}, caches = {}) {
	log(`☑️ Set TileSets`, "");
	/*
	// 填补数据组
	if (caches?.CN?.tileSet) caches.CN.tileSet = caches.CN.tileSet.map(tile => {
		tile.dataSet = 2;
		return tile;
	});
	*/
	// 填补空缺图源
	caches?.XX?.tileSet?.forEach(tile => {
		if (!tileSets.some(i => i.style === tile.style)) tileSets.push(tile);
	});
	// 按需更改图源
	tileSets = tileSets.map((tileSet, index) => {
		switch (tileSet.style) {
			case 1: // VECTOR_STANDARD 标准地图
			case 8: // RASTER_TERRAIN 地貌与地势（绿地/城市/水体/山地不同颜色的区域）
			case 11: // VECTOR_BUILDINGS 建筑模型（3D/白模）
			case 20: // VECTOR_ROADS 道路（卫星地图:显示标签）
			case 30: // VECTOR_VENUES 室内地图
			case 37: // VECTOR_TRANSIT 公共交通
			case 47: // VECTOR_TRANSIT_SELECTION
			case 64: // VECTOR_STREET_LANDMARKS
			case 73: // VECTOR_BUILDINGS_V2 建筑模型V2（3D/上色）
				switch (settings.TileSet.Map) {
					case "AUTO":
					default:
						break;
					case "CN":
						tileSet = caches?.CN?.tileSet?.find(i => i.style === tileSet.style);
						break;
					case "XX":
						tileSet = caches?.XX?.tileSet?.find(i => i.style === tileSet.style);
						break;
				};
				break;
			case 7: // RASTER_SATELLITE 卫星地图（2D）
				switch (settings.TileSet.Satellite) {
					case "AUTO":
						break;
					case "HYBRID":
						tileSet = caches?.CN?.tileSet?.find(i => (i.style === tileSet.style && i.scale === tileSet.scale && i.size === tileSet.size));
						if (tileSet.validVersion?.[0]) tileSet.validVersion[0].availableTiles = [{ "minX": 0, "minY": 0, "maxX": 1, "maxY": 1, "minZ": 1, "maxZ": 22 }];
						break;
					case "CN":
						tileSet = caches?.CN?.tileSet?.find(i => (i.style === tileSet.style && i.scale === tileSet.scale && i.size === tileSet.size));
						break;
					case "XX":
					default:
						tileSet = caches?.XX?.tileSet?.find(i => (i.style === tileSet.style && i.scale === tileSet.scale && i.size === tileSet.size));
						break;
				};
				break;
			case 14: // SPUTNIK_METADATA 卫星地图（3D/俯瞰）元数据
			case 15: // SPUTNIK_C3M 卫星地图（3D/俯瞰）C3模型
			case 16: // SPUTNIK_DSM 卫星地图（3D/俯瞰）数字表面模型
			case 17: // SPUTNIK_DSM_GLOBAL 卫星地图（3D/俯瞰）全球数字表面模型
			case 33: // RASTER_SATELLITE_NIGHT 卫星地图（2D/夜间）
			case 34: // SPUTNIK_VECTOR_BORDER 卫星地图（3D/俯瞰）边界
			case 35: // RASTER_SATELLITE_DIGITIZE 卫星地图（2D/数字化）
			case 45: // RASTER_SATELLITE_ASTC 卫星地图（2D/ASTC）
				switch (settings.TileSet.Satellite) {
					case "AUTO":
						break;
					case "HYBRID":
						tileSet = caches?.XX?.tileSet?.find(i => (i.style === tileSet.style && i.scale === tileSet.scale && i.size === tileSet.size));
						break;
					case "CN":
						tileSet = caches?.CN?.tileSet?.find(i => (i.style === tileSet.style && i.scale === tileSet.scale && i.size === tileSet.size));
						break;
					case "XX":
					default:
						tileSet = caches?.XX?.tileSet?.find(i => (i.style === tileSet.style && i.scale === tileSet.scale && i.size === tileSet.size));
						break;
				};
				break;
			case 12: // VECTOR_TRAFFIC 交通状况
			case 22: // VECTOR_TRAFFIC_SKELETON 交通状况骨架（卫星地图:显示交通状况）
			case 25: // VECTOR_TRAFFIC_WITH_GREEN
			case 26: // VECTOR_TRAFFIC_STATIC
			case 28: // VECTOR_TRAFFIC_SKELETON_WITH_HISTORICAL
			case 86: // VECTOR_TRAFFIC_V2 交通状况V2
				switch (settings.TileSet.Traffic) {
					case "AUTO":
					default:
						break;
					case "CN":
						tileSet = caches?.CN?.tileSet?.find(i => i.style === tileSet.style);
						break;
					case "XX":
						tileSet = caches?.XX?.tileSet?.find(i => i.style === tileSet.style);
						break;
				};
				break;
			case 13: // VECTOR_POI 兴趣点
			case 68: // VECTOR_POI_V2 兴趣点V2
			case 69: // VECTOR_POLYGON_SELECTION 多边形选区（兴趣点）
			case 84: // VECTOR_POI_V2_UPDATE 兴趣点V2更新
				switch (settings.TileSet.POI) {
					case "AUTO":
					default:
						break;
					case "CN":
						tileSet = caches?.CN?.tileSet?.find(i => i.style === tileSet.style);
						break;
					case "XX":
						tileSet = caches?.XX?.tileSet?.find(i => i.style === tileSet.style);
						break;
				};
				break;
			case 42: // FLYOVER_C3M_MESH
			case 43: // FLYOVER_C3M_JPEG_TEXTURE
			case 44: // FLYOVER_C3M_ASTC_TEXTURE
			case 49: // FLYOVER_VISIBILITY
			case 50: // FLYOVER_SKYBOX
			case 51: // FLYOVER_NAVGRAPH
			case 52: // FLYOVER_METADATA 俯瞰元数据
				switch (settings.TileSet.Flyover) {
					case "AUTO":
					default:
						break;
					case "CN":
						tileSet = caches?.CN?.tileSet?.find(i => i.style === tileSet.style);
						break;
					case "XX":
						tileSet = caches?.XX?.tileSet?.find(i => i.style === tileSet.style);
						break;
				};
				break;
			case 53: // VECTOR_ROAD_NETWORK 道路网络（四处看看）
			case 56: // VECTOR_STREET_POI 街道兴趣点（四处看看）
			case 57: // MUNIN_METADATA 四处看看 元数据
			case 58: // VECTOR_SPR_MERCATOR
			case 59: // VECTOR_SPR_MODELS
			case 60: // VECTOR_SPR_MATERIALS
			case 61: // VECTOR_SPR_METADATA
			case 66: // VECTOR_SPR_ROADS
			case 67: // VECTOR_SPR_STANDARD
				switch (settings.TileSet.Munin) {
					case "AUTO":
					default:
						break;
					case "CN":
						tileSet = caches?.CN?.tileSet?.find(i => i.style === tileSet.style);
						break;
					case "XX":
						tileSet = caches?.XX?.tileSet?.find(i => i.style === tileSet.style);
						break;
				};
				break;
			case 99:
				/*
				switch (settings.TileSet.Map) {
					case "AUTO":
					default:
						break;
					case "CN":
						tileSet = caches?.CN?.tileSet?.find(i => i.style === tileSet.style);
						break;
					case "XX":
						tileSet = caches?.XX?.tileSet?.find(i => i.style === tileSet.style);
						break;
				};
				break;
				*/
		};
		return tileSet;
	}).flat(Infinity).filter(Boolean);
	log(`✅ Set TileSets`, "");
	return tileSets;
};

function attributions(attributions = [], url = {}, caches = {}) {
	log(`☑️ Set Attributions`, "");
	switch (url.searchParams.get("country_code")) {
		case "CN":
			caches?.XX?.attribution?.forEach(attribution => {
				if (!attributions.some(i => i.name === attribution.name)) attributions.unshift(attribution);
			});
			break;
		case "KR":
			caches?.KR?.attribution?.forEach(attribution => {
				if (!attributions.some(i => i.name === attribution.name)) attributions.unshift(attribution);
			});
			break;
		default:
			caches?.CN?.attribution?.forEach(attribution => {
				if (!attributions.some(i => i.name === attribution.name)) attributions.push(attribution);
			});
			break;
	};
	attributions.sort((a, b)=>{
		switch (a.name) {
			case "‎":
				return -1;
			case "AutoNavi":
				return 0;
			default:
				return 1;
		};
	});
	attributions = attributions.map((attribution, index) => {
		switch (attribution.name) {
			case "‎":
				attribution.name = ` iRingo: 📍 GeoServices.framework β Response\n${new Date()}`;
				delete attribution.plainTextURLSHA256Checksum;
				break;
			case "AutoNavi":
				attribution.resource = attribution.resource.filter(i => i.resourceType !== 6);
				attribution.region = [
					{ "minX": 214, "minY": 82, "maxX": 216, "maxY": 82, "minZ": 8, "maxZ": 21 },
					{ "minX": 213, "minY": 83, "maxX": 217, "maxY": 83, "minZ": 8, "maxZ": 21 },
					{ "minX": 213, "minY": 84, "maxX": 218, "maxY": 84, "minZ": 8, "maxZ": 21 },
					{ "minX": 213, "minY": 85, "maxX": 218, "maxY": 85, "minZ": 8, "maxZ": 21 },
					{ "minX": 212, "minY": 86, "maxX": 218, "maxY": 86, "minZ": 8, "maxZ": 21 },
					{ "minX": 189, "minY": 87, "maxX": 190, "maxY": 87, "minZ": 8, "maxZ": 21 },
					{ "minX": 210, "minY": 87, "maxX": 220, "maxY": 87, "minZ": 8, "maxZ": 21 },
					{ "minX": 188, "minY": 88, "maxX": 191, "maxY": 88, "minZ": 8, "maxZ": 21 },
					{ "minX": 210, "minY": 88, "maxX": 223, "maxY": 88, "minZ": 8, "maxZ": 21 },
					{ "minX": 188, "minY": 89, "maxX": 192, "maxY": 89, "minZ": 8, "maxZ": 21 },
					{ "minX": 210, "minY": 89, "maxX": 223, "maxY": 89, "minZ": 8, "maxZ": 21 },
					{ "minX": 186, "minY": 90, "maxX": 192, "maxY": 90, "minZ": 8, "maxZ": 21 },
					{ "minX": 210, "minY": 90, "maxX": 223, "maxY": 90, "minZ": 8, "maxZ": 21 },
					{ "minX": 209, "minY": 91, "maxX": 222, "maxY": 91, "minZ": 8, "maxZ": 21 },
					{ "minX": 186, "minY": 91, "maxX": 192, "maxY": 91, "minZ": 8, "maxZ": 21 },
					{ "minX": 184, "minY": 92, "maxX": 195, "maxY": 92, "minZ": 8, "maxZ": 21 },
					{ "minX": 207, "minY": 92, "maxX": 221, "maxY": 92, "minZ": 8, "maxZ": 21 },
					{ "minX": 185, "minY": 93, "maxX": 196, "maxY": 93, "minZ": 8, "maxZ": 21 },
					{ "minX": 206, "minY": 93, "maxX": 221, "maxY": 93, "minZ": 8, "maxZ": 21 },
					{ "minX": 185, "minY": 94, "maxX": 200, "maxY": 94, "minZ": 8, "maxZ": 21 },
					{ "minX": 203, "minY": 94, "maxX": 221, "maxY": 94, "minZ": 8, "maxZ": 21 },
					{ "minX": 182, "minY": 94, "maxX": 219, "maxY": 95, "minZ": 8, "maxZ": 21 },
					{ "minX": 180, "minY": 96, "maxX": 217, "maxY": 96, "minZ": 8, "maxZ": 21 },
					{ "minX": 180, "minY": 97, "maxX": 216, "maxY": 97, "minZ": 8, "maxZ": 21 },
					{ "minX": 180, "minY": 98, "maxX": 214, "maxY": 98, "minZ": 8, "maxZ": 21 },
					{ "minX": 180, "minY": 99, "maxX": 215, "maxY": 99, "minZ": 8, "maxZ": 21 },
					{ "minX": 182, "minY": 100, "maxX": 214, "maxY": 100, "minZ": 8, "maxZ": 21 },
					{ "minX": 183, "minY": 101, "maxX": 213, "maxY": 101, "minZ": 8, "maxZ": 21 },
					{ "minX": 184, "minY": 102, "maxX": 214, "maxY": 102, "minZ": 8, "maxZ": 21 },
					{ "minX": 183, "minY": 103, "maxX": 214, "maxY": 103, "minZ": 8, "maxZ": 21 },
					{ "minX": 184, "minY": 104, "maxX": 215, "maxY": 104, "minZ": 8, "maxZ": 21 },
					{ "minX": 185, "minY": 105, "maxX": 215, "maxY": 105, "minZ": 8, "maxZ": 21 },
					{ "minX": 187, "minY": 106, "maxX": 215, "maxY": 106, "minZ": 8, "maxZ": 21 },
					{ "minX": 189, "minY": 107, "maxX": 193, "maxY": 107, "minZ": 8, "maxZ": 21 },
					{ "minX": 197, "minY": 107, "maxX": 214, "maxY": 107, "minZ": 8, "maxZ": 21 },
					{ "minX": 198, "minY": 108, "maxX": 214, "maxY": 108, "minZ": 8, "maxZ": 21 },
					{ "minX": 110, "minY": 109, "maxX": 214, "maxY": 109, "minZ": 8, "maxZ": 21 },
					{ "minX": 197, "minY": 110, "maxX": 214, "maxY": 110, "minZ": 8, "maxZ": 21 },
					{ "minX": 198, "minY": 111, "maxX": 214, "maxY": 111, "minZ": 8, "maxZ": 21 },
					{ "minX": 204, "minY": 112, "maxX": 209, "maxY": 112, "minZ": 8, "maxZ": 21 },
					{ "minX": 213, "minY": 112, "maxX": 214, "maxY": 112, "minZ": 8, "maxZ": 21 },
					{ "minX": 205, "minY": 113, "maxX": 207, "maxY": 113, "minZ": 8, "maxZ": 21 },
					{ "minX": 205, "minY": 114, "maxX": 206, "maxY": 114, "minZ": 8, "maxZ": 21 },
					{ "minX": 204, "minY": 115, "maxX": 212, "maxY": 128, "minZ": 8, "maxZ": 21 },
				];
				break;
		};
		return attribution;
	}).flat(Infinity).filter(Boolean);
	log(`✅ Set Attributions`, "");
	return attributions;
};

function dataSets(dataSets = [], settings = {}, caches = {}) {
	log(`☑️ Set DataSets`, "");
	dataSets = dataSets.map((dataSet, index) => {
		switch (dataSet.identifier) {
			case 0:
				dataSet.dataSetDescription = "TomTom";
				break;
			case 1:
				dataSet.dataSetDescription = "KittyHawk";
				break;
			case 2:
				dataSet.dataSetDescription = "AutoNavi";
				break;
		};
		return dataSet;
	});
	log(`✅ Set DataSets`, "");
	return body;
};

function urlInfoSets(urlInfoSets = [], url = {}, settings = {}, caches = {}) {
	log(`☑️ Set UrlInfoSets`, "");
	urlInfoSets = urlInfoSets.map((urlInfoSet, index) => {
		switch (url.searchParams.get("country_code")) {
			case "CN":
				urlInfoSet = { ...caches.XX.urlInfoSet[0], ...caches.CN.urlInfoSet[0] };
				break;
			case "KR":
				urlInfoSet = { ...caches.KR.urlInfoSet[0], ...caches.CN.urlInfoSet[0] };
				break;
			default:
				urlInfoSet = { ...caches.CN.urlInfoSet[0], ...caches.XX.urlInfoSet[0] };
				urlInfoSet.alternateResourcesURL = caches.CN.urlInfoSet[0].alternateResourcesURL;
				delete urlInfoSet.polyLocationShiftURL;
				break;
		};
		switch (settings.Config?.Announcements?.Environment?.default) {
			case "AUTO":
			default:
				break;
			case "CN":
				// Announcements
				urlInfoSet.announcementsURL = caches.CN.urlInfoSet[0].announcementsURL;
				break;
			case "XX":
				// Announcements
				urlInfoSet.announcementsURL = caches.XX.urlInfoSet[0].announcementsURL;
				break;
		};
		switch (settings.UrlInfoSet.Dispatcher) {
			case "AUTO":
			default:
				break;
			case "AutoNavi":
				// PlaceData Dispatcher
				urlInfoSet.directionsURL = caches.CN.urlInfoSet[0].dispatcherURL;
				// Background Dispatcher
				urlInfoSet.backgroundDispatcherURL = caches.CN.urlInfoSet[0].backgroundDispatcherURL;
				// Background Reverse Geocoder
				urlInfoSet.backgroundRevGeoURL = caches.CN.urlInfoSet[0].backgroundRevGeoURL;
				// Batch Reverse Geocoder
				urlInfoSet.batchReverseGeocoderPlaceRequestURL = caches.CN.urlInfoSet[0].batchReverseGeocoderPlaceRequestURL;
				break;
			case "Apple":
				// PlaceData Dispatcher
				urlInfoSet.dispatcherURL = caches.XX.urlInfoSet[0].dispatcherURL;
				// Background Dispatcher
				urlInfoSet.backgroundDispatcherURL = caches.XX.urlInfoSet[0].backgroundDispatcherURL;
				// Background Reverse Geocoder
				urlInfoSet.backgroundRevGeoURL = caches.XX.urlInfoSet[0].backgroundRevGeoURL;
				// Batch Reverse Geocoder
				urlInfoSet.batchReverseGeocoderPlaceRequestURL = caches.XX.urlInfoSet[0].batchReverseGeocoderPlaceRequestURL;
				break;
		};
		switch (settings.UrlInfoSet.Directions) {
			case "AUTO":
			default:
				break;
			case "AutoNavi":
				// Directions
				urlInfoSet.directionsURL = caches.CN.urlInfoSet[0].directionsURL;
				// ETA
				urlInfoSet.etaURL = caches.CN.urlInfoSet[0].etaURL;
				// Simple ETA
				urlInfoSet.simpleETAURL = caches.CN.urlInfoSet[0].simpleETAURL;
				break;
			case "Apple":
				// Directions
				urlInfoSet.directionsURL = caches.XX.urlInfoSet[0].directionsURL;
				// ETA
				urlInfoSet.etaURL = caches.XX.urlInfoSet[0].etaURL;
				// Simple ETA
				urlInfoSet.simpleETAURL = caches.XX.urlInfoSet[0].simpleETAURL;
				break;
		};
		switch (settings.UrlInfoSet.RAP) {
			case "AUTO":
			default:
				// RAP Submission
				urlInfoSet.problemSubmissionURL = caches.XX.urlInfoSet[0].problemSubmissionURL;
				// RAP Status
				urlInfoSet.problemStatusURL = caches.XX.urlInfoSet[0].problemStatusURL;
				// RAP Opt-Ins
				urlInfoSet.problemOptInURL = caches.XX.urlInfoSet[0].problemOptInURL;
				// RAP V4 Submission
				urlInfoSet.feedbackSubmissionURL = caches.XX.urlInfoSet[0].feedbackSubmissionURL;
				// RAP V4 Lookup
				urlInfoSet.feedbackLookupURL = caches.XX.urlInfoSet[0].feedbackLookupURL;
				break;
			case "AutoNavi":
				// RAP Submission
				urlInfoSet.problemSubmissionURL = caches.CN.urlInfoSet[0].problemSubmissionURL;
				// RAP Status
				urlInfoSet.problemStatusURL = caches.CN.urlInfoSet[0].problemStatusURL;
				// RAP V4 Submission
				urlInfoSet.feedbackSubmissionURL = caches.CN.urlInfoSet[0].feedbackSubmissionURL;
				// RAP V4 Lookup
				urlInfoSet.feedbackLookupURL = caches.CN.urlInfoSet[0].feedbackLookupURL;
				break;
			case "Apple":
				// RAP Submission
				urlInfoSet.problemSubmissionURL = caches.XX.urlInfoSet[0].problemSubmissionURL;
				// RAP Status
				urlInfoSet.problemStatusURL = caches.XX.urlInfoSet[0].problemStatusURL;
				// RAP Opt-Ins
				urlInfoSet.problemOptInURL = caches.XX.urlInfoSet[0].problemOptInURL;
				// RAP V4 Submission
				urlInfoSet.feedbackSubmissionURL = caches.XX.urlInfoSet[0].feedbackSubmissionURL;
				// RAP V4 Lookup
				urlInfoSet.feedbackLookupURL = caches.XX.urlInfoSet[0].feedbackLookupURL;
				break;
		};
		switch (settings.UrlInfoSet.LocationShift) {
			case "AUTO":
			default:
				break;
			case "AutoNavi":
				// Location Shift (polynomial)
				urlInfoSet.polyLocationShiftURL = caches.CN.urlInfoSet[0].polyLocationShiftURL;
				break;
			case "Apple":
				// Location Shift (polynomial)
				urlInfoSet.polyLocationShiftURL = caches.XX.urlInfoSet[0].polyLocationShiftURL;
				break;
		};
		return urlInfoSet;
	});
	log(`✅ Set UrlInfoSets`, "");
	return urlInfoSets;
};

function muninBuckets(muninBuckets = [], settings = {}, caches = {}) {
	log(`☑️ Set MuninBuckets`, "");
	switch (settings.TileSet.Munin) {
		case "AUTO":
		default:
			break;
		case "CN":
			muninBuckets = caches.CN.muninBucket;
			break;
		case "XX":
			muninBuckets = caches.XX.muninBucket;
			break;
	};
	log(`✅ Set MuninBuckets`, "");
	return muninBuckets;
};
