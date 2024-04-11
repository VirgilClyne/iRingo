import _ from './ENV/Lodash.mjs'
import $Storage from './ENV/$Storage.mjs'
import ENV from "./ENV/ENV.mjs";
import URI from "./URL/URI.mjs";
import XML from "./XML/XML.mjs";

import Database from "./database/index.mjs";
import setENV from "./function/setENV.mjs";

import { WireType, UnknownFieldHandler, reflectionMergePartial, MESSAGE_TYPE, MessageType, BinaryReader, isJsonObject, typeofJsonValue, jsonWriteOptions } from "../node_modules/@protobuf-ts/runtime/build/es2015/index.js";

const $ = new ENV(" iRingo: 📍 GeoServices.framework v3.4.5(3) response");

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
!(async () => {
	const { Settings, Caches, Configs } = setENV("iRingo", ["Location", "Maps"], Database);
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
					// 主机判断
					switch (HOST) {
						case "gspe1-ssl.ls.apple.com":
							//body = new DOMParser().parseFromString($response.body, FORMAT);
							// 路径判断
							switch (PATH) {
								case "pep/gcc":
									_.set(Caches, "pep.gcc", $response.body);
									$Storage.setItem("@iRingo.Location.Caches", Caches);
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
							$.log(`🚧 body: ${JSON.stringify(body)}`, "");
							// 路径判断
							switch (PATH) {
								case "config/defaults":
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
							$.log(`🚧 body: ${JSON.stringify(body)}`, "");
							//$response.body = await PLISTs("json2plist", body); // json2plist
							$response.body = XML.stringify(body);
							break;
					};
					break;
				case "text/vtt":
				case "application/vtt":
					//body = VTT.parse($response.body);
					//$.log(`🚧 body: ${JSON.stringify(body)}`, "");
					//$response.body = VTT.stringify(body);
					break;
				case "text/json":
				case "application/json":
					body = JSON.parse($response.body ?? "{}");
					$.log(`🚧 body: ${JSON.stringify(body)}`, "");
					$response.body = JSON.stringify(body);
					break;
				case "application/protobuf":
				case "application/x-protobuf":
				case "application/vnd.google.protobuf":
				case "application/grpc":
				case "application/grpc+proto":
				case "application/octet-stream":
					//$.log(`🚧 $response: ${JSON.stringify($response, null, 2)}`, "");
					let rawBody = $.isQuanX() ? new Uint8Array($response.bodyBytes ?? []) : $response.body ?? new Uint8Array();
					//$.log(`🚧 isBuffer? ${ArrayBuffer.isView(rawBody)}: ${JSON.stringify(rawBody)}`, "");
					switch (FORMAT) {
						case "application/protobuf":
						case "application/x-protobuf":
						case "application/vnd.google.protobuf":
						case "application/octet-stream":
							/******************  initialization start  *******************/
							/******************  initialization finish  *******************/
							switch (HOST) {
								case "gspe35-ssl.ls.apple.com":
									switch (PATH) {
										case "config/announcements":
											break;
										case "geo_manifest/dynamic/config":
											/******************  initialization start  *******************/
											// @generated by protobuf-ts 2.9.3 with parameter long_type_string,output_javascript,optimize_code_size
											/**
											 * @generated from protobuf enum com.apple.geo.protobuf.geo.TileSet.TileSetVersionUpdateBehavior
											 */
											var TileSet_TileSetVersionUpdateBehavior;
											(function (TileSet_TileSetVersionUpdateBehavior) {
												/**
												 * @generated from protobuf enum value: TILE_UPDATE_BEHAVIOR_FLUSH = 0;
												 */
												TileSet_TileSetVersionUpdateBehavior[TileSet_TileSetVersionUpdateBehavior["TILE_UPDATE_BEHAVIOR_FLUSH"] = 0] = "TILE_UPDATE_BEHAVIOR_FLUSH";
												/**
												 * @generated from protobuf enum value: TILE_UPDATE_BEHAVIOR_ETAG = 1;
												 */
												TileSet_TileSetVersionUpdateBehavior[TileSet_TileSetVersionUpdateBehavior["TILE_UPDATE_BEHAVIOR_ETAG"] = 1] = "TILE_UPDATE_BEHAVIOR_ETAG";
											})(TileSet_TileSetVersionUpdateBehavior || (TileSet_TileSetVersionUpdateBehavior = {}));
											/**
											 * @generated from protobuf enum com.apple.geo.protobuf.geo.TileSet.TileSetChecksumType
											 */
											var TileSet_TileSetChecksumType;
											(function (TileSet_TileSetChecksumType) {
												/**
												 * @generated from protobuf enum value: CHECKSUM_TYPE_NONE = 0;
												 */
												TileSet_TileSetChecksumType[TileSet_TileSetChecksumType["CHECKSUM_TYPE_NONE"] = 0] = "CHECKSUM_TYPE_NONE";
												/**
												 * @generated from protobuf enum value: CHECKSUM_TYPE_APPENDED_MD5 = 1;
												 */
												TileSet_TileSetChecksumType[TileSet_TileSetChecksumType["CHECKSUM_TYPE_APPENDED_MD5"] = 1] = "CHECKSUM_TYPE_APPENDED_MD5";
											})(TileSet_TileSetChecksumType || (TileSet_TileSetChecksumType = {}));
											/**
											 * @generated from protobuf enum com.apple.geo.protobuf.geo.TileSet.TileRequestStyle
											 */
											var TileSet_TileRequestStyle;
											(function (TileSet_TileRequestStyle) {
												/**
												 * @generated from protobuf enum value: REQUEST_STYLE_LEGACY = 0;
												 */
												TileSet_TileRequestStyle[TileSet_TileRequestStyle["REQUEST_STYLE_LEGACY"] = 0] = "REQUEST_STYLE_LEGACY";
												/**
												 * @generated from protobuf enum value: REQUEST_STYLE_HEADER_PARAMS_VERSION_BASED_HMAC_AUTH = 1;
												 */
												TileSet_TileRequestStyle[TileSet_TileRequestStyle["REQUEST_STYLE_HEADER_PARAMS_VERSION_BASED_HMAC_AUTH"] = 1] = "REQUEST_STYLE_HEADER_PARAMS_VERSION_BASED_HMAC_AUTH";
											})(TileSet_TileRequestStyle || (TileSet_TileRequestStyle = {}));
											/**
											 * @generated from protobuf enum com.apple.geo.protobuf.geo.ResourceFilter.Scale
											 */
											var ResourceFilter_Scale;
											(function (ResourceFilter_Scale) {
												/**
												 * @generated from protobuf enum value: RESOURCE_FILTER_SCALE_UNKNOWN = 0;
												 */
												ResourceFilter_Scale[ResourceFilter_Scale["RESOURCE_FILTER_SCALE_UNKNOWN"] = 0] = "RESOURCE_FILTER_SCALE_UNKNOWN";
												/**
												 * @generated from protobuf enum value: RESOURCE_FILTER_SCALE_1X = 1;
												 */
												ResourceFilter_Scale[ResourceFilter_Scale["RESOURCE_FILTER_SCALE_1X"] = 1] = "RESOURCE_FILTER_SCALE_1X";
												/**
												 * @generated from protobuf enum value: RESOURCE_FILTER_SCALE_2X = 2;
												 */
												ResourceFilter_Scale[ResourceFilter_Scale["RESOURCE_FILTER_SCALE_2X"] = 2] = "RESOURCE_FILTER_SCALE_2X";
												/**
												 * @generated from protobuf enum value: RESOURCE_FILTER_SCALE_3X = 3;
												 */
												ResourceFilter_Scale[ResourceFilter_Scale["RESOURCE_FILTER_SCALE_3X"] = 3] = "RESOURCE_FILTER_SCALE_3X";
											})(ResourceFilter_Scale || (ResourceFilter_Scale = {}));
											/**
											 * @generated from protobuf enum com.apple.geo.protobuf.geo.ResourceFilter.Scenario
											 */
											var ResourceFilter_Scenario;
											(function (ResourceFilter_Scenario) {
												/**
												 * @generated from protobuf enum value: RESOURCE_FILTER_SCENARIO_UNKNOWN = 0;
												 */
												ResourceFilter_Scenario[ResourceFilter_Scenario["RESOURCE_FILTER_SCENARIO_UNKNOWN"] = 0] = "RESOURCE_FILTER_SCENARIO_UNKNOWN";
												/**
												 * @generated from protobuf enum value: RESOURCE_FILTER_SCENARIO_CARPLAY = 1;
												 */
												ResourceFilter_Scenario[ResourceFilter_Scenario["RESOURCE_FILTER_SCENARIO_CARPLAY"] = 1] = "RESOURCE_FILTER_SCENARIO_CARPLAY";
												/**
												 * @generated from protobuf enum value: RESOURCE_FILTER_SCENARIO_NAVIGATION = 2;
												 */
												ResourceFilter_Scenario[ResourceFilter_Scenario["RESOURCE_FILTER_SCENARIO_NAVIGATION"] = 2] = "RESOURCE_FILTER_SCENARIO_NAVIGATION";
												/**
												 * @generated from protobuf enum value: RESOURCE_FILTER_SCENARIO_HIGHVISIBILITY = 3;
												 */
												ResourceFilter_Scenario[ResourceFilter_Scenario["RESOURCE_FILTER_SCENARIO_HIGHVISIBILITY"] = 3] = "RESOURCE_FILTER_SCENARIO_HIGHVISIBILITY";
												/**
												 * @generated from protobuf enum value: RESOURCE_FILTER_SCENARIO_EXPLICIT = 4;
												 */
												ResourceFilter_Scenario[ResourceFilter_Scenario["RESOURCE_FILTER_SCENARIO_EXPLICIT"] = 4] = "RESOURCE_FILTER_SCENARIO_EXPLICIT";
											})(ResourceFilter_Scenario || (ResourceFilter_Scenario = {}));
											/**
											 * @generated from protobuf enum com.apple.geo.protobuf.geo.Resource.ResourceType
											 */
											var Resource_ResourceType;
											(function (Resource_ResourceType) {
												/**
												 * @generated from protobuf enum value: RESOURCE_TYPE_STYLESHEET = 0;
												 */
												Resource_ResourceType[Resource_ResourceType["STYLESHEET"] = 0] = "STYLESHEET";
												/**
												 * @generated from protobuf enum value: RESOURCE_TYPE_TEXTURE = 1;
												 */
												Resource_ResourceType[Resource_ResourceType["TEXTURE"] = 1] = "TEXTURE";
												/**
												 * @generated from protobuf enum value: RESOURCE_TYPE_FONT = 2;
												 */
												Resource_ResourceType[Resource_ResourceType["FONT"] = 2] = "FONT";
												/**
												 * @generated from protobuf enum value: RESOURCE_TYPE_ICON = 3;
												 */
												Resource_ResourceType[Resource_ResourceType["ICON"] = 3] = "ICON";
												/**
												 * @generated from protobuf enum value: RESOURCE_TYPE_XML = 4;
												 */
												Resource_ResourceType[Resource_ResourceType["XML"] = 4] = "XML";
												/**
												 * @generated from protobuf enum value: RESOURCE_TYPE_ATTRIBUTION_LOGO = 5;
												 */
												Resource_ResourceType[Resource_ResourceType["ATTRIBUTION_LOGO"] = 5] = "ATTRIBUTION_LOGO";
												/**
												 * @generated from protobuf enum value: RESOURCE_TYPE_ATTRIBUTION_BADGE = 6;
												 */
												Resource_ResourceType[Resource_ResourceType["ATTRIBUTION_BADGE"] = 6] = "ATTRIBUTION_BADGE";
												/**
												 * @generated from protobuf enum value: RESOURCE_TYPE_OTHER = 7;
												 */
												Resource_ResourceType[Resource_ResourceType["OTHER"] = 7] = "OTHER";
											})(Resource_ResourceType || (Resource_ResourceType = {}));
											/**
											 * @generated from protobuf enum com.apple.geo.protobuf.geo.Resource.ConnectionType
											 */
											var Resource_ConnectionType;
											(function (Resource_ConnectionType) {
												/**
												 * @generated from protobuf enum value: RESOURCE_DOWNLOAD_CONNECTION_TYPE_UNKNOWN = 0;
												 */
												Resource_ConnectionType[Resource_ConnectionType["RESOURCE_DOWNLOAD_CONNECTION_TYPE_UNKNOWN"] = 0] = "RESOURCE_DOWNLOAD_CONNECTION_TYPE_UNKNOWN";
												/**
												 * @generated from protobuf enum value: RESOURCE_DOWNLOAD_CONNECTION_TYPE_CELLULAR = 1;
												 */
												Resource_ConnectionType[Resource_ConnectionType["RESOURCE_DOWNLOAD_CONNECTION_TYPE_CELLULAR"] = 1] = "RESOURCE_DOWNLOAD_CONNECTION_TYPE_CELLULAR";
												/**
												 * @generated from protobuf enum value: RESOURCE_DOWNLOAD_CONNECTION_TYPE_PREFER_WIFI = 2;
												 */
												Resource_ConnectionType[Resource_ConnectionType["RESOURCE_DOWNLOAD_CONNECTION_TYPE_PREFER_WIFI"] = 2] = "RESOURCE_DOWNLOAD_CONNECTION_TYPE_PREFER_WIFI";
												/**
												 * @generated from protobuf enum value: RESOURCE_DOWNLOAD_CONNECTION_TYPE_WIFI_ONLY = 3;
												 */
												Resource_ConnectionType[Resource_ConnectionType["RESOURCE_DOWNLOAD_CONNECTION_TYPE_WIFI_ONLY"] = 3] = "RESOURCE_DOWNLOAD_CONNECTION_TYPE_WIFI_ONLY";
											})(Resource_ConnectionType || (Resource_ConnectionType = {}));
											/**
											 * @generated from protobuf enum com.apple.geo.protobuf.geo.Resource.ValidationMethod
											 */
											var Resource_ValidationMethod;
											(function (Resource_ValidationMethod) {
												/**
												 * @generated from protobuf enum value: SHA1 = 0;
												 */
												Resource_ValidationMethod[Resource_ValidationMethod["SHA1"] = 0] = "SHA1";
												/**
												 * @generated from protobuf enum value: CMS = 1;
												 */
												Resource_ValidationMethod[Resource_ValidationMethod["CMS"] = 1] = "CMS";
											})(Resource_ValidationMethod || (Resource_ValidationMethod = {}));
											/**
											 * @generated from protobuf enum com.apple.geo.protobuf.geo.Resource.UpdateMethod
											 */
											var Resource_UpdateMethod;
											(function (Resource_UpdateMethod) {
												/**
												 * @generated from protobuf enum value: VERSIONED = 0;
												 */
												Resource_UpdateMethod[Resource_UpdateMethod["VERSIONED"] = 0] = "VERSIONED";
												/**
												 * @generated from protobuf enum value: ETAG = 1;
												 */
												Resource_UpdateMethod[Resource_UpdateMethod["ETAG"] = 1] = "ETAG";
											})(Resource_UpdateMethod || (Resource_UpdateMethod = {}));
											/**
											 * @generated from protobuf enum com.apple.geo.protobuf.geo.TileSetStyle
											 */
											var TileSetStyle;
											(function (TileSetStyle) {
												/**
												 * @generated from protobuf enum value: RASTER_STANDARD = 0;
												 */
												TileSetStyle[TileSetStyle["RASTER_STANDARD"] = 0] = "RASTER_STANDARD";
												/**
												 * @generated from protobuf enum value: VECTOR_STANDARD = 1;
												 */
												TileSetStyle[TileSetStyle["VECTOR_STANDARD"] = 1] = "VECTOR_STANDARD";
												/**
												 * @generated from protobuf enum value: VECTOR_TRAFFIC_SEGMENTS_FOR_RASTER = 2;
												 */
												TileSetStyle[TileSetStyle["VECTOR_TRAFFIC_SEGMENTS_FOR_RASTER"] = 2] = "VECTOR_TRAFFIC_SEGMENTS_FOR_RASTER";
												/**
												 * @generated from protobuf enum value: VECTOR_TRAFFIC_INCIDENTS_FOR_RASTER = 3;
												 */
												TileSetStyle[TileSetStyle["VECTOR_TRAFFIC_INCIDENTS_FOR_RASTER"] = 3] = "VECTOR_TRAFFIC_INCIDENTS_FOR_RASTER";
												/**
												 * @generated from protobuf enum value: VECTOR_TRAFFIC_SEGMENTS_AND_INCIDENTS_FOR_RASTER = 4;
												 */
												TileSetStyle[TileSetStyle["VECTOR_TRAFFIC_SEGMENTS_AND_INCIDENTS_FOR_RASTER"] = 4] = "VECTOR_TRAFFIC_SEGMENTS_AND_INCIDENTS_FOR_RASTER";
												/**
												 * @generated from protobuf enum value: RASTER_STANDARD_BACKGROUND = 5;
												 */
												TileSetStyle[TileSetStyle["RASTER_STANDARD_BACKGROUND"] = 5] = "RASTER_STANDARD_BACKGROUND";
												/**
												 * @generated from protobuf enum value: RASTER_HYBRID = 6;
												 */
												TileSetStyle[TileSetStyle["RASTER_HYBRID"] = 6] = "RASTER_HYBRID";
												/**
												 * @generated from protobuf enum value: RASTER_SATELLITE = 7;
												 */
												TileSetStyle[TileSetStyle["RASTER_SATELLITE"] = 7] = "RASTER_SATELLITE";
												/**
												 * @generated from protobuf enum value: RASTER_TERRAIN = 8;
												 */
												TileSetStyle[TileSetStyle["RASTER_TERRAIN"] = 8] = "RASTER_TERRAIN";
												/**
												 * @generated from protobuf enum value: VECTOR_BUILDINGS = 11;
												 */
												TileSetStyle[TileSetStyle["VECTOR_BUILDINGS"] = 11] = "VECTOR_BUILDINGS";
												/**
												 * @generated from protobuf enum value: VECTOR_TRAFFIC = 12;
												 */
												TileSetStyle[TileSetStyle["VECTOR_TRAFFIC"] = 12] = "VECTOR_TRAFFIC";
												/**
												 * @generated from protobuf enum value: VECTOR_POI = 13;
												 */
												TileSetStyle[TileSetStyle["VECTOR_POI"] = 13] = "VECTOR_POI";
												/**
												 * @generated from protobuf enum value: SPUTNIK_METADATA = 14;
												 */
												TileSetStyle[TileSetStyle["SPUTNIK_METADATA"] = 14] = "SPUTNIK_METADATA";
												/**
												 * @generated from protobuf enum value: SPUTNIK_C3M = 15;
												 */
												TileSetStyle[TileSetStyle["SPUTNIK_C3M"] = 15] = "SPUTNIK_C3M";
												/**
												 * @generated from protobuf enum value: SPUTNIK_DSM = 16;
												 */
												TileSetStyle[TileSetStyle["SPUTNIK_DSM"] = 16] = "SPUTNIK_DSM";
												/**
												 * @generated from protobuf enum value: SPUTNIK_DSM_GLOBAL = 17;
												 */
												TileSetStyle[TileSetStyle["SPUTNIK_DSM_GLOBAL"] = 17] = "SPUTNIK_DSM_GLOBAL";
												/**
												 * @generated from protobuf enum value: VECTOR_REALISTIC = 18;
												 */
												TileSetStyle[TileSetStyle["VECTOR_REALISTIC"] = 18] = "VECTOR_REALISTIC";
												/**
												 * @generated from protobuf enum value: VECTOR_LEGACY_REALISTIC = 19;
												 */
												TileSetStyle[TileSetStyle["VECTOR_LEGACY_REALISTIC"] = 19] = "VECTOR_LEGACY_REALISTIC";
												/**
												 * @generated from protobuf enum value: VECTOR_ROADS = 20;
												 */
												TileSetStyle[TileSetStyle["VECTOR_ROADS"] = 20] = "VECTOR_ROADS";
												/**
												 * @generated from protobuf enum value: RASTER_VEGETATION = 21;
												 */
												TileSetStyle[TileSetStyle["RASTER_VEGETATION"] = 21] = "RASTER_VEGETATION";
												/**
												 * @generated from protobuf enum value: VECTOR_TRAFFIC_SKELETON = 22;
												 */
												TileSetStyle[TileSetStyle["VECTOR_TRAFFIC_SKELETON"] = 22] = "VECTOR_TRAFFIC_SKELETON";
												/**
												 * @generated from protobuf enum value: RASTER_COASTLINE_MASK = 23;
												 */
												TileSetStyle[TileSetStyle["RASTER_COASTLINE_MASK"] = 23] = "RASTER_COASTLINE_MASK";
												/**
												 * @generated from protobuf enum value: RASTER_HILLSHADE = 24;
												 */
												TileSetStyle[TileSetStyle["RASTER_HILLSHADE"] = 24] = "RASTER_HILLSHADE";
												/**
												 * @generated from protobuf enum value: VECTOR_TRAFFIC_WITH_GREEN = 25;
												 */
												TileSetStyle[TileSetStyle["VECTOR_TRAFFIC_WITH_GREEN"] = 25] = "VECTOR_TRAFFIC_WITH_GREEN";
												/**
												 * @generated from protobuf enum value: VECTOR_TRAFFIC_STATIC = 26;
												 */
												TileSetStyle[TileSetStyle["VECTOR_TRAFFIC_STATIC"] = 26] = "VECTOR_TRAFFIC_STATIC";
												/**
												 * @generated from protobuf enum value: RASTER_COASTLINE_DROP_MASK = 27;
												 */
												TileSetStyle[TileSetStyle["RASTER_COASTLINE_DROP_MASK"] = 27] = "RASTER_COASTLINE_DROP_MASK";
												/**
												 * @generated from protobuf enum value: VECTOR_TRAFFIC_SKELETON_WITH_HISTORICAL = 28;
												 */
												TileSetStyle[TileSetStyle["VECTOR_TRAFFIC_SKELETON_WITH_HISTORICAL"] = 28] = "VECTOR_TRAFFIC_SKELETON_WITH_HISTORICAL";
												/**
												 * @generated from protobuf enum value: VECTOR_SPEED_PROFILES = 29;
												 */
												TileSetStyle[TileSetStyle["VECTOR_SPEED_PROFILES"] = 29] = "VECTOR_SPEED_PROFILES";
												/**
												 * @generated from protobuf enum value: VECTOR_VENUES = 30;
												 */
												TileSetStyle[TileSetStyle["VECTOR_VENUES"] = 30] = "VECTOR_VENUES";
												/**
												 * @generated from protobuf enum value: RASTER_DOWN_SAMPLED = 31;
												 */
												TileSetStyle[TileSetStyle["RASTER_DOWN_SAMPLED"] = 31] = "RASTER_DOWN_SAMPLED";
												/**
												 * @generated from protobuf enum value: RASTER_COLOR_BALANCED = 32;
												 */
												TileSetStyle[TileSetStyle["RASTER_COLOR_BALANCED"] = 32] = "RASTER_COLOR_BALANCED";
												/**
												 * @generated from protobuf enum value: RASTER_SATELLITE_NIGHT = 33;
												 */
												TileSetStyle[TileSetStyle["RASTER_SATELLITE_NIGHT"] = 33] = "RASTER_SATELLITE_NIGHT";
												/**
												 * @generated from protobuf enum value: SPUTNIK_VECTOR_BORDER = 34;
												 */
												TileSetStyle[TileSetStyle["SPUTNIK_VECTOR_BORDER"] = 34] = "SPUTNIK_VECTOR_BORDER";
												/**
												 * @generated from protobuf enum value: RASTER_SATELLITE_DIGITIZE = 35;
												 */
												TileSetStyle[TileSetStyle["RASTER_SATELLITE_DIGITIZE"] = 35] = "RASTER_SATELLITE_DIGITIZE";
												/**
												 * @generated from protobuf enum value: RASTER_HILLSHADE_PARKS = 36;
												 */
												TileSetStyle[TileSetStyle["RASTER_HILLSHADE_PARKS"] = 36] = "RASTER_HILLSHADE_PARKS";
												/**
												 * @generated from protobuf enum value: VECTOR_TRANSIT = 37;
												 */
												TileSetStyle[TileSetStyle["VECTOR_TRANSIT"] = 37] = "VECTOR_TRANSIT";
												/**
												 * @generated from protobuf enum value: RASTER_STANDARD_BASE = 38;
												 */
												TileSetStyle[TileSetStyle["RASTER_STANDARD_BASE"] = 38] = "RASTER_STANDARD_BASE";
												/**
												 * @generated from protobuf enum value: RASTER_STANDARD_LABELS = 39;
												 */
												TileSetStyle[TileSetStyle["RASTER_STANDARD_LABELS"] = 39] = "RASTER_STANDARD_LABELS";
												/**
												 * @generated from protobuf enum value: RASTER_HYBRID_ROADS = 40;
												 */
												TileSetStyle[TileSetStyle["RASTER_HYBRID_ROADS"] = 40] = "RASTER_HYBRID_ROADS";
												/**
												 * @generated from protobuf enum value: RASTER_HYBRID_LABELS = 41;
												 */
												TileSetStyle[TileSetStyle["RASTER_HYBRID_LABELS"] = 41] = "RASTER_HYBRID_LABELS";
												/**
												 * @generated from protobuf enum value: FLYOVER_C3M_MESH = 42;
												 */
												TileSetStyle[TileSetStyle["FLYOVER_C3M_MESH"] = 42] = "FLYOVER_C3M_MESH";
												/**
												 * @generated from protobuf enum value: FLYOVER_C3M_JPEG_TEXTURE = 43;
												 */
												TileSetStyle[TileSetStyle["FLYOVER_C3M_JPEG_TEXTURE"] = 43] = "FLYOVER_C3M_JPEG_TEXTURE";
												/**
												 * @generated from protobuf enum value: FLYOVER_C3M_ASTC_TEXTURE = 44;
												 */
												TileSetStyle[TileSetStyle["FLYOVER_C3M_ASTC_TEXTURE"] = 44] = "FLYOVER_C3M_ASTC_TEXTURE";
												/**
												 * @generated from protobuf enum value: RASTER_SATELLITE_ASTC = 45;
												 */
												TileSetStyle[TileSetStyle["RASTER_SATELLITE_ASTC"] = 45] = "RASTER_SATELLITE_ASTC";
												/**
												 * @generated from protobuf enum value: RASTER_HYBRID_ROADS_AND_LABELS = 46;
												 */
												TileSetStyle[TileSetStyle["RASTER_HYBRID_ROADS_AND_LABELS"] = 46] = "RASTER_HYBRID_ROADS_AND_LABELS";
												/**
												 * @generated from protobuf enum value: VECTOR_TRANSIT_SELECTION = 47;
												 */
												TileSetStyle[TileSetStyle["VECTOR_TRANSIT_SELECTION"] = 47] = "VECTOR_TRANSIT_SELECTION";
												/**
												 * @generated from protobuf enum value: VECTOR_COVERAGE = 48;
												 */
												TileSetStyle[TileSetStyle["VECTOR_COVERAGE"] = 48] = "VECTOR_COVERAGE";
												/**
												 * @generated from protobuf enum value: FLYOVER_VISIBILITY = 49;
												 */
												TileSetStyle[TileSetStyle["FLYOVER_VISIBILITY"] = 49] = "FLYOVER_VISIBILITY";
												/**
												 * @generated from protobuf enum value: FLYOVER_SKYBOX = 50;
												 */
												TileSetStyle[TileSetStyle["FLYOVER_SKYBOX"] = 50] = "FLYOVER_SKYBOX";
												/**
												 * @generated from protobuf enum value: FLYOVER_NAVGRAPH = 51;
												 */
												TileSetStyle[TileSetStyle["FLYOVER_NAVGRAPH"] = 51] = "FLYOVER_NAVGRAPH";
												/**
												 * @generated from protobuf enum value: FLYOVER_METADATA = 52;
												 */
												TileSetStyle[TileSetStyle["FLYOVER_METADATA"] = 52] = "FLYOVER_METADATA";
												/**
												 * @generated from protobuf enum value: VECTOR_ROAD_NETWORK = 53;
												 */
												TileSetStyle[TileSetStyle["VECTOR_ROAD_NETWORK"] = 53] = "VECTOR_ROAD_NETWORK";
												/**
												 * @generated from protobuf enum value: VECTOR_LAND_COVER = 54;
												 */
												TileSetStyle[TileSetStyle["VECTOR_LAND_COVER"] = 54] = "VECTOR_LAND_COVER";
												/**
												 * @generated from protobuf enum value: VECTOR_DEBUG = 55;
												 */
												TileSetStyle[TileSetStyle["VECTOR_DEBUG"] = 55] = "VECTOR_DEBUG";
												/**
												 * @generated from protobuf enum value: VECTOR_STREET_POI = 56;
												 */
												TileSetStyle[TileSetStyle["VECTOR_STREET_POI"] = 56] = "VECTOR_STREET_POI";
												/**
												 * @generated from protobuf enum value: MUNIN_METADATA = 57;
												 */
												TileSetStyle[TileSetStyle["MUNIN_METADATA"] = 57] = "MUNIN_METADATA";
												/**
												 * @generated from protobuf enum value: VECTOR_SPR_MERCATOR = 58;
												 */
												TileSetStyle[TileSetStyle["VECTOR_SPR_MERCATOR"] = 58] = "VECTOR_SPR_MERCATOR";
												/**
												 * @generated from protobuf enum value: VECTOR_SPR_MODELS = 59;
												 */
												TileSetStyle[TileSetStyle["VECTOR_SPR_MODELS"] = 59] = "VECTOR_SPR_MODELS";
												/**
												 * @generated from protobuf enum value: VECTOR_SPR_MATERIALS = 60;
												 */
												TileSetStyle[TileSetStyle["VECTOR_SPR_MATERIALS"] = 60] = "VECTOR_SPR_MATERIALS";
												/**
												 * @generated from protobuf enum value: VECTOR_SPR_METADATA = 61;
												 */
												TileSetStyle[TileSetStyle["VECTOR_SPR_METADATA"] = 61] = "VECTOR_SPR_METADATA";
												/**
												 * @generated from protobuf enum value: VECTOR_TRACKS = 62;
												 */
												TileSetStyle[TileSetStyle["VECTOR_TRACKS"] = 62] = "VECTOR_TRACKS";
												/**
												 * @generated from protobuf enum value: VECTOR_RESERVED_2 = 63;
												 */
												TileSetStyle[TileSetStyle["VECTOR_RESERVED_2"] = 63] = "VECTOR_RESERVED_2";
												/**
												 * @generated from protobuf enum value: VECTOR_STREET_LANDMARKS = 64;
												 */
												TileSetStyle[TileSetStyle["VECTOR_STREET_LANDMARKS"] = 64] = "VECTOR_STREET_LANDMARKS";
												/**
												 * @generated from protobuf enum value: COARSE_LOCATION_POLYGONS = 65;
												 */
												TileSetStyle[TileSetStyle["COARSE_LOCATION_POLYGONS"] = 65] = "COARSE_LOCATION_POLYGONS";
												/**
												 * @generated from protobuf enum value: VECTOR_SPR_ROADS = 66;
												 */
												TileSetStyle[TileSetStyle["VECTOR_SPR_ROADS"] = 66] = "VECTOR_SPR_ROADS";
												/**
												 * @generated from protobuf enum value: VECTOR_SPR_STANDARD = 67;
												 */
												TileSetStyle[TileSetStyle["VECTOR_SPR_STANDARD"] = 67] = "VECTOR_SPR_STANDARD";
												/**
												 * @generated from protobuf enum value: VECTOR_POI_V2 = 68;
												 */
												TileSetStyle[TileSetStyle["VECTOR_POI_V2"] = 68] = "VECTOR_POI_V2";
												/**
												 * @generated from protobuf enum value: VECTOR_POLYGON_SELECTION = 69;
												 */
												TileSetStyle[TileSetStyle["VECTOR_POLYGON_SELECTION"] = 69] = "VECTOR_POLYGON_SELECTION";
												/**
												 * @generated from protobuf enum value: VL_METADATA = 70;
												 */
												TileSetStyle[TileSetStyle["VL_METADATA"] = 70] = "VL_METADATA";
												/**
												 * @generated from protobuf enum value: VL_DATA = 71;
												 */
												TileSetStyle[TileSetStyle["VL_DATA"] = 71] = "VL_DATA";
												/**
												 * @generated from protobuf enum value: PROACTIVE_APP_CLIP = 72;
												 */
												TileSetStyle[TileSetStyle["PROACTIVE_APP_CLIP"] = 72] = "PROACTIVE_APP_CLIP";
												/**
												 * @generated from protobuf enum value: VECTOR_BUILDINGS_V2 = 73;
												 */
												TileSetStyle[TileSetStyle["VECTOR_BUILDINGS_V2"] = 73] = "VECTOR_BUILDINGS_V2";
												/**
												 * @generated from protobuf enum value: POI_BUSYNESS = 74;
												 */
												TileSetStyle[TileSetStyle["POI_BUSYNESS"] = 74] = "POI_BUSYNESS";
												/**
												 * @generated from protobuf enum value: POI_DP_BUSYNESS = 75;
												 */
												TileSetStyle[TileSetStyle["POI_DP_BUSYNESS"] = 75] = "POI_DP_BUSYNESS";
												/**
												 * @generated from protobuf enum value: SMART_INTERFACE_SELECTION = 76;
												 */
												TileSetStyle[TileSetStyle["SMART_INTERFACE_SELECTION"] = 76] = "SMART_INTERFACE_SELECTION";
												/**
												 * @generated from protobuf enum value: VECTOR_ASSETS = 77;
												 */
												TileSetStyle[TileSetStyle["VECTOR_ASSETS"] = 77] = "VECTOR_ASSETS";
												/**
												 * @generated from protobuf enum value: SPR_ASSET_METADATA = 78;
												 */
												TileSetStyle[TileSetStyle["SPR_ASSET_METADATA"] = 78] = "SPR_ASSET_METADATA";
												/**
												 * @generated from protobuf enum value: VECTOR_SPR_POLAR = 79;
												 */
												TileSetStyle[TileSetStyle["VECTOR_SPR_POLAR"] = 79] = "VECTOR_SPR_POLAR";
												/**
												 * @generated from protobuf enum value: SMART_DATA_MODE = 80;
												 */
												TileSetStyle[TileSetStyle["SMART_DATA_MODE"] = 80] = "SMART_DATA_MODE";
												/**
												 * @generated from protobuf enum value: CELLULAR_PERFORMANCE_SCORE = 81;
												 */
												TileSetStyle[TileSetStyle["CELLULAR_PERFORMANCE_SCORE"] = 81] = "CELLULAR_PERFORMANCE_SCORE";
												/**
												 * @generated from protobuf enum value: VECTOR_SPR_MODELS_OCCLUSION = 82;
												 */
												TileSetStyle[TileSetStyle["VECTOR_SPR_MODELS_OCCLUSION"] = 82] = "VECTOR_SPR_MODELS_OCCLUSION";
												/**
												 * @generated from protobuf enum value: VECTOR_TOPOGRAPHIC = 83;
												 */
												TileSetStyle[TileSetStyle["VECTOR_TOPOGRAPHIC"] = 83] = "VECTOR_TOPOGRAPHIC";
												/**
												 * @generated from protobuf enum value: VECTOR_POI_V2_UPDATE = 84;
												 */
												TileSetStyle[TileSetStyle["VECTOR_POI_V2_UPDATE"] = 84] = "VECTOR_POI_V2_UPDATE";
												/**
												 * @generated from protobuf enum value: VECTOR_LIVE_DATA_UPDATES = 85;
												 */
												TileSetStyle[TileSetStyle["VECTOR_LIVE_DATA_UPDATES"] = 85] = "VECTOR_LIVE_DATA_UPDATES";
												/**
												 * @generated from protobuf enum value: VECTOR_TRAFFIC_V2 = 86;
												 */
												TileSetStyle[TileSetStyle["VECTOR_TRAFFIC_V2"] = 86] = "VECTOR_TRAFFIC_V2";
												/**
												 * @generated from protobuf enum value: VECTOR_ROAD_SELECTION = 87;
												 */
												TileSetStyle[TileSetStyle["VECTOR_ROAD_SELECTION"] = 87] = "VECTOR_ROAD_SELECTION";
												/**
												 * @generated from protobuf enum value: VECTOR_REGION_METADATA = 88;
												 */
												TileSetStyle[TileSetStyle["VECTOR_REGION_METADATA"] = 88] = "VECTOR_REGION_METADATA";
												/**
												 * @generated from protobuf enum value: RAY_TRACING = 89;
												 */
												TileSetStyle[TileSetStyle["RAY_TRACING"] = 89] = "RAY_TRACING";
												/**
												 * @generated from protobuf enum value: VECTOR_CONTOURS = 90;
												 */
												TileSetStyle[TileSetStyle["VECTOR_CONTOURS"] = 90] = "VECTOR_CONTOURS";
												/**
												 * @generated from protobuf enum value: UNUSED_91 = 91;
												 */
												TileSetStyle[TileSetStyle["UNUSED_91"] = 91] = "UNUSED_91";
												/**
												 * @generated from protobuf enum value: UNUSED_92 = 92;
												 */
												TileSetStyle[TileSetStyle["UNUSED_92"] = 92] = "UNUSED_92";
												/**
												 * @generated from protobuf enum value: UNUSED_93 = 93;
												 */
												TileSetStyle[TileSetStyle["UNUSED_93"] = 93] = "UNUSED_93";
												/**
												 * @generated from protobuf enum value: UNUSED_94 = 94;
												 */
												TileSetStyle[TileSetStyle["UNUSED_94"] = 94] = "UNUSED_94";
												/**
												 * @generated from protobuf enum value: UNUSED_95 = 95;
												 */
												TileSetStyle[TileSetStyle["UNUSED_95"] = 95] = "UNUSED_95";
												/**
												 * @generated from protobuf enum value: UNUSED_96 = 96;
												 */
												TileSetStyle[TileSetStyle["UNUSED_96"] = 96] = "UNUSED_96";
												/**
												 * @generated from protobuf enum value: UNUSED_97 = 97;
												 */
												TileSetStyle[TileSetStyle["UNUSED_97"] = 97] = "UNUSED_97";
												/**
												 * @generated from protobuf enum value: UNUSED_98 = 98;
												 */
												TileSetStyle[TileSetStyle["UNUSED_98"] = 98] = "UNUSED_98";
												/**
												 * @generated from protobuf enum value: UNUSED_99 = 99;
												 */
												TileSetStyle[TileSetStyle["UNUSED_99"] = 99] = "UNUSED_99";
												/**
												 * @generated from protobuf enum value: VECTOR_SPR_MERCATOR = 58;
												 */
												TileSetStyle[TileSetStyle["DAVINCI_DEV1"] = 58] = "DAVINCI_DEV1";
												/**
												 * @generated from protobuf enum value: VECTOR_SPR_MODELS = 59;
												 */
												TileSetStyle[TileSetStyle["DAVINCI_DEV2"] = 59] = "DAVINCI_DEV2";
												/**
												 * @generated from protobuf enum value: VECTOR_SPR_MATERIALS = 60;
												 */
												TileSetStyle[TileSetStyle["DAVINCI_DEV3"] = 60] = "DAVINCI_DEV3";
												/**
												 * @generated from protobuf enum value: VECTOR_SPR_METADATA = 61;
												 */
												TileSetStyle[TileSetStyle["DAVINCI_DEV4"] = 61] = "DAVINCI_DEV4";
												/**
												 * @generated from protobuf enum value: VECTOR_RESERVED_2 = 63;
												 */
												TileSetStyle[TileSetStyle["DAVINCI_DEV6"] = 63] = "DAVINCI_DEV6";
												/**
												 * @generated from protobuf enum value: VECTOR_SPR_ROADS = 66;
												 */
												TileSetStyle[TileSetStyle["DAVINCI_DEV7"] = 66] = "DAVINCI_DEV7";
												/**
												 * @generated from protobuf enum value: VECTOR_SPR_STANDARD = 67;
												 */
												TileSetStyle[TileSetStyle["DAVINCI_DEV8"] = 67] = "DAVINCI_DEV8";
												/**
												 * @generated from protobuf enum value: VECTOR_POI_V2 = 68;
												 */
												TileSetStyle[TileSetStyle["DAVINCI_DEV9"] = 68] = "DAVINCI_DEV9";
												/**
												 * @generated from protobuf enum value: VECTOR_BUILDINGS_V2 = 73;
												 */
												TileSetStyle[TileSetStyle["DAVINCI_BUILDINGS"] = 73] = "DAVINCI_BUILDINGS";
												/**
												 * @generated from protobuf enum value: VECTOR_TRACKS = 62;
												 */
												TileSetStyle[TileSetStyle["VECTOR_RESERVED_1"] = 62] = "VECTOR_RESERVED_1";
											})(TileSetStyle || (TileSetStyle = {}));
											/**
											 * @generated from protobuf enum com.apple.geo.protobuf.geo.TileScale
											 */
											var TileScale;
											(function (TileScale) {
												/**
												 * @generated from protobuf enum value: NODPI = 0;
												 */
												TileScale[TileScale["NODPI"] = 0] = "NODPI";
												/**
												 * @generated from protobuf enum value: LODPI = 1;
												 */
												TileScale[TileScale["LODPI"] = 1] = "LODPI";
												/**
												 * @generated from protobuf enum value: HIDPI = 2;
												 */
												TileScale[TileScale["HIDPI"] = 2] = "HIDPI";
											})(TileScale || (TileScale = {}));
											/**
											 * @generated from protobuf enum com.apple.geo.protobuf.geo.TileSize
											 */
											var TileSize;
											(function (TileSize) {
												/**
												 * @generated from protobuf enum value: PX128 = 0;
												 */
												TileSize[TileSize["PX128"] = 0] = "PX128";
												/**
												 * @generated from protobuf enum value: PX256 = 1;
												 */
												TileSize[TileSize["PX256"] = 1] = "PX256";
												/**
												 * @generated from protobuf enum value: PX512 = 2;
												 */
												TileSize[TileSize["PX512"] = 2] = "PX512";
											})(TileSize || (TileSize = {}));
											/**
											 * @generated from protobuf enum com.apple.geo.protobuf.geo.GenericTileType
											 */
											var GenericTileType;
											(function (GenericTileType) {
												/**
												 * @generated from protobuf enum value: UNKNOWN = 0;
												 */
												GenericTileType[GenericTileType["UNKNOWN"] = 0] = "UNKNOWN";
												/**
												 * @generated from protobuf enum value: WATER = 1;
												 */
												GenericTileType[GenericTileType["WATER"] = 1] = "WATER";
												/**
												 * @generated from protobuf enum value: NO_TILE = 2;
												 */
												GenericTileType[GenericTileType["NO_TILE"] = 2] = "NO_TILE";
											})(GenericTileType || (GenericTileType = {}));
											// @generated message type with reflection information, may provide speed optimized methods
											class RegionalResource$Type extends MessageType {
												constructor() {
													super("com.apple.geo.protobuf.geo.RegionalResource", [
														{ no: 1, name: "x", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 2, name: "y", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 3, name: "z", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 4, name: "icon", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
														{ no: 6, name: "attribution", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Attribution },
														{ no: 7, name: "iconChecksum", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
														{ no: 29, name: "tileRange", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => TileSetRegion },
														{ no: 30, name: "validSubManifestVersion", kind: "scalar", repeat: 1 /*RepeatType.PACKED*/, T: 13 /*ScalarType.UINT32*/ }
													]);
												}
											}
											/**
											 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.RegionalResource
											 */
											const RegionalResource = new RegionalResource$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class RegionalResourceIndex$Type extends MessageType {
												constructor() {
													super("com.apple.geo.protobuf.geo.RegionalResourceIndex", []);
												}
											}
											/**
											 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.RegionalResourceIndex
											 */
											const RegionalResourceIndex = new RegionalResourceIndex$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class RegionalResourceTile$Type extends MessageType {
												constructor() {
													super("com.apple.geo.protobuf.geo.RegionalResourceTile", []);
												}
											}
											/**
											 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.RegionalResourceTile
											 */
											const RegionalResourceTile = new RegionalResourceTile$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class RegionalResourceRegion$Type extends MessageType {
												constructor() {
													super("com.apple.geo.protobuf.geo.RegionalResourceRegion", []);
												}
											}
											/**
											 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.RegionalResourceRegion
											 */
											const RegionalResourceRegion = new RegionalResourceRegion$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class TileGroup$Type extends MessageType {
												constructor() {
													super("com.apple.geo.protobuf.geo.TileGroup", [
														{ no: 1, name: "identifier", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 2, name: "tileSet", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => TileGroup_VersionedTileSet },
														{ no: 3, name: "styleSheetIndex", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 13 /*ScalarType.UINT32*/ },
														{ no: 4, name: "textureIndex", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 13 /*ScalarType.UINT32*/ },
														{ no: 5, name: "fontIndex", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 13 /*ScalarType.UINT32*/ },
														{ no: 6, name: "iconIndex", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 13 /*ScalarType.UINT32*/ },
														{ no: 7, name: "regionalResourceIndex", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => RegionalResourceIndex },
														{ no: 8, name: "xmlIndex", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 13 /*ScalarType.UINT32*/ },
														{ no: 10, name: "attributionIndex", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 13 /*ScalarType.UINT32*/ },
														{ no: 11, name: "hybridUnavailableRegion", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => TileSetRegion },
														{ no: 12, name: "resourceIndex", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 13 /*ScalarType.UINT32*/ },
														{ no: 14, name: "muninVersion", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 15, name: "offlineMetadataIndex", kind: "scalar", T: 13 /*ScalarType.UINT32*/ }
													]);
												}
											}
											/**
											 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.TileGroup
											 */
											const TileGroup = new TileGroup$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class TileGroup_VersionedTileSet$Type extends MessageType {
												constructor() {
													super("com.apple.geo.protobuf.geo.TileGroup.VersionedTileSet", [
														{ no: 1, name: "tileSetIndex", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 2, name: "identifier", kind: "scalar", T: 13 /*ScalarType.UINT32*/ }
													]);
												}
											}
											/**
											 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.TileGroup.VersionedTileSet
											 */
											const TileGroup_VersionedTileSet = new TileGroup_VersionedTileSet$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class GenericTile$Type extends MessageType {
												constructor() {
													super("com.apple.geo.protobuf.geo.GenericTile", [
														{ no: 1, name: "tileType", kind: "enum", T: () => ["com.apple.geo.protobuf.geo.GenericTileType", GenericTileType] },
														{ no: 2, name: "textureIndex", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 3, name: "resourceIndex", kind: "scalar", T: 13 /*ScalarType.UINT32*/ }
													]);
												}
											}
											/**
											 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.GenericTile
											 */
											const GenericTile = new GenericTile$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class TileSetRegion$Type extends MessageType {
												constructor() {
													super("com.apple.geo.protobuf.geo.TileSetRegion", [
														{ no: 1, name: "minX", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 2, name: "minY", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 3, name: "maxX", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 4, name: "maxY", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 5, name: "minZ", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 6, name: "maxZ", kind: "scalar", T: 13 /*ScalarType.UINT32*/ }
													]);
												}
											}
											/**
											 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.TileSetRegion
											 */
											const TileSetRegion = new TileSetRegion$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class TileSetVersion$Type extends MessageType {
												constructor() {
													super("com.apple.geo.protobuf.geo.TileSetVersion", [
														{ no: 1, name: "identifier", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 2, name: "availableTiles", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => TileSetRegion },
														{ no: 3, name: "timeToLiveSeconds", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ },
														{ no: 4, name: "genericTile", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => GenericTile },
														{ no: 5, name: "supportedLanguagesVersion", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ }
													]);
												}
											}
											/**
											 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.TileSetVersion
											 */
											const TileSetVersion = new TileSetVersion$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class TileSet$Type extends MessageType {
												constructor() {
													super("com.apple.geo.protobuf.geo.TileSet", [
														{ no: 1, name: "baseURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 2, name: "multiTileURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 3, name: "style", kind: "enum", T: () => ["com.apple.geo.protobuf.geo.TileSetStyle", TileSetStyle] },
														{ no: 5, name: "validVersion", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => TileSetVersion },
														{ no: 6, name: "scale", kind: "enum", T: () => ["com.apple.geo.protobuf.geo.TileScale", TileScale] },
														{ no: 7, name: "size", kind: "enum", T: () => ["com.apple.geo.protobuf.geo.TileSize", TileSize] },
														{ no: 9, name: "localizationURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 10, name: "supportedLanguage", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => TileSet_Language },
														{ no: 11, name: "multiTileURLUsesStatusCodes", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
														{ no: 12, name: "updateBehavior", kind: "enum", opt: true, T: () => ["com.apple.geo.protobuf.geo.TileSet.TileSetVersionUpdateBehavior", TileSet_TileSetVersionUpdateBehavior] },
														{ no: 13, name: "countryRegionWhitelist", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => TileSet_CountryRegionTuple },
														{ no: 14, name: "checksumType", kind: "enum", T: () => ["com.apple.geo.protobuf.geo.TileSet.TileSetChecksumType", TileSet_TileSetChecksumType] },
														{ no: 15, name: "dataSet", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ },
														{ no: 16, name: "requestStyle", kind: "enum", T: () => ["com.apple.geo.protobuf.geo.TileSet.TileRequestStyle", TileSet_TileRequestStyle] },
														{ no: 17, name: "useAuthProxy", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
														{ no: 18, name: "supportsMultipathTCP", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
														{ no: 19, name: "alternativeMultipathTCPPort", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ },
														{ no: 20, name: "deviceSKUWhitelist", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ }
													]);
												}
											}
											/**
											 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.TileSet
											 */
											const TileSet = new TileSet$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class TileSet_Language$Type extends MessageType {
												constructor() {
													super("com.apple.geo.protobuf.geo.TileSet.Language", [
														{ no: 1, name: "identifier", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 2, name: "language", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ }
													]);
												}
											}
											/**
											 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.TileSet.Language
											 */
											const TileSet_Language = new TileSet_Language$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class TileSet_CountryRegionTuple$Type extends MessageType {
												constructor() {
													super("com.apple.geo.protobuf.geo.TileSet.CountryRegionTuple", [
														{ no: 1, name: "countryCode", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
														{ no: 2, name: "region", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
													]);
												}
											}
											/**
											 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.TileSet.CountryRegionTuple
											 */
											const TileSet_CountryRegionTuple = new TileSet_CountryRegionTuple$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class ResourceFilter$Type extends MessageType {
												constructor() {
													super("com.apple.geo.protobuf.geo.ResourceFilter", [
														{ no: 1, name: "scale", kind: "enum", repeat: 1 /*RepeatType.PACKED*/, T: () => ["com.apple.geo.protobuf.geo.ResourceFilter.Scale", ResourceFilter_Scale] },
														{ no: 2, name: "scenario", kind: "enum", repeat: 1 /*RepeatType.PACKED*/, T: () => ["com.apple.geo.protobuf.geo.ResourceFilter.Scenario", ResourceFilter_Scenario] }
													]);
												}
											}
											/**
											 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.ResourceFilter
											 */
											const ResourceFilter = new ResourceFilter$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class Resource$Type extends MessageType {
												constructor() {
													super("com.apple.geo.protobuf.geo.Resource", [
														{ no: 1, name: "resourceType", kind: "enum", T: () => ["com.apple.geo.protobuf.geo.Resource.ResourceType", Resource_ResourceType, "RESOURCE_TYPE_"] },
														{ no: 2, name: "filename", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
														{ no: 3, name: "checksum", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
														{ no: 4, name: "region", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => TileSetRegion },
														{ no: 5, name: "filter", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => ResourceFilter },
														{ no: 6, name: "connectionType", kind: "enum", opt: true, T: () => ["com.apple.geo.protobuf.geo.Resource.ConnectionType", Resource_ConnectionType] },
														{ no: 7, name: "preferWiFiAllowedStaleThreshold", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ },
														{ no: 8, name: "validationMethod", kind: "enum", T: () => ["com.apple.geo.protobuf.geo.Resource.ValidationMethod", Resource_ValidationMethod] },
														{ no: 9, name: "alternateResourceURLIndex", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ },
														{ no: 10, name: "updateMethod", kind: "enum", T: () => ["com.apple.geo.protobuf.geo.Resource.UpdateMethod", Resource_UpdateMethod] },
														{ no: 11, name: "timeToLiveSeconds", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ }
													]);
												}
											}
											/**
											 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.Resource
											 */
											const Resource = new Resource$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class Attribution$Type extends MessageType {
												constructor() {
													super("com.apple.geo.protobuf.geo.Attribution", [
														{ no: 1, name: "badge", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 2, name: "logo", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 3, name: "name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
														{ no: 4, name: "url", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
														{ no: 5, name: "badgeChecksum", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 6, name: "logoChecksum", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 7, name: "resource", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Resource },
														{ no: 8, name: "region", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => TileSetRegion },
														{ no: 9, name: "dataSet", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ },
														{ no: 10, name: "linkDisplayStringIndex", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ },
														{ no: 11, name: "plainTextURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 12, name: "plainTextURLSHA256Checksum", kind: "scalar", opt: true, T: 12 /*ScalarType.BYTES*/ }
													]);
												}
											}
											/**
											 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.Attribution
											 */
											const Attribution = new Attribution$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class ServiceVersion$Type extends MessageType {
												constructor() {
													super("com.apple.geo.protobuf.geo.ServiceVersion", [
														{ no: 1, name: "versionDomain", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
														{ no: 2, name: "minimumVersion", kind: "scalar", T: 13 /*ScalarType.UINT32*/ }
													]);
												}
											}
											/**
											 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.ServiceVersion
											 */
											const ServiceVersion = new ServiceVersion$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class VersionManifest$Type extends MessageType {
												constructor() {
													super("com.apple.geo.protobuf.geo.VersionManifest", [
														{ no: 1, name: "serviceVersion", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => ServiceVersion }
													]);
												}
											}
											/**
											 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.VersionManifest
											 */
											const VersionManifest = new VersionManifest$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class DataSetDescription$Type extends MessageType {
												constructor() {
													super("com.apple.geo.protobuf.geo.DataSetDescription", [
														{ no: 1, name: "identifier", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 2, name: "dataSetDescription", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
													]);
												}
											}
											/**
											 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.DataSetDescription
											 */
											const DataSetDescription = new DataSetDescription$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class DataSetURLOverride$Type extends MessageType {
												constructor() {
													super("com.apple.geo.protobuf.geo.DataSetURLOverride", []);
												}
											}
											/**
											 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.DataSetURLOverride
											 */
											const DataSetURLOverride = new DataSetURLOverride$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class MuninVersion$Type extends MessageType {
												constructor() {
													super("com.apple.geo.protobuf.geo.MuninVersion", []);
												}
											}
											/**
											 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.MuninVersion
											 */
											const MuninVersion = new MuninVersion$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class URLInfo$Type extends MessageType {
												constructor() {
													super("com.apple.geo.protobuf.geo.URLInfo", [
														{ no: 1, name: "url", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
														{ no: 2, name: "useAuthProxy", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
														{ no: 3, name: "supportsMultipathTCP", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
														{ no: 4, name: "alternativeMultipathTCPPort", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ }
													]);
												}
											}
											/**
											 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.URLInfo
											 */
											const URLInfo = new URLInfo$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class URLInfoSet$Type extends MessageType {
												constructor() {
													super("com.apple.geo.protobuf.geo.URLInfoSet", [
														{ no: 1, name: "dataSet", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ },
														{ no: 2, name: "resourcesURL", kind: "message", T: () => URLInfo },
														{ no: 3, name: "searchAttributionManifestURL", kind: "message", T: () => URLInfo },
														{ no: 4, name: "directionsURL", kind: "message", T: () => URLInfo },
														{ no: 5, name: "etaURL", kind: "message", T: () => URLInfo },
														{ no: 6, name: "batchReverseGeocoderURL", kind: "message", T: () => URLInfo },
														{ no: 7, name: "simpleETAURL", kind: "message", T: () => URLInfo },
														{ no: 8, name: "addressCorrectionInitURL", kind: "message", T: () => URLInfo },
														{ no: 9, name: "addressCorrectionUpdateURL", kind: "message", T: () => URLInfo },
														{ no: 10, name: "polyLocationShiftURL", kind: "message", T: () => URLInfo },
														{ no: 11, name: "problemSubmissionURL", kind: "message", T: () => URLInfo },
														{ no: 12, name: "problemStatusURL", kind: "message", T: () => URLInfo },
														{ no: 13, name: "reverseGeocoderVersionsURL", kind: "message", T: () => URLInfo },
														{ no: 14, name: "problemCategoriesURL", kind: "message", T: () => URLInfo },
														{ no: 15, name: "announcementsURL", kind: "message", T: () => URLInfo },
														{ no: 16, name: "dispatcherURL", kind: "message", T: () => URLInfo },
														{ no: 17, name: "problemOptInURL", kind: "message", T: () => URLInfo },
														{ no: 18, name: "abExperimentURL", kind: "message", T: () => URLInfo },
														{ no: 19, name: "businessPortalBaseURL", kind: "message", T: () => URLInfo },
														{ no: 20, name: "logMessageUsageURL", kind: "message", T: () => URLInfo },
														{ no: 21, name: "spatialLookupURL", kind: "message", T: () => URLInfo },
														{ no: 22, name: "realtimeTrafficProbeURL", kind: "message", T: () => URLInfo },
														{ no: 23, name: "batchTrafficProbeURL", kind: "message", T: () => URLInfo },
														{ no: 24, name: "proactiveRoutingURL", kind: "message", T: () => URLInfo },
														{ no: 25, name: "logMessageUsageV3URL", kind: "message", T: () => URLInfo },
														{ no: 26, name: "backgroundDispatcherURL", kind: "message", T: () => URLInfo },
														{ no: 27, name: "bluePOIDispatcherURL", kind: "message", T: () => URLInfo },
														{ no: 28, name: "backgroundRevGeoURL", kind: "message", T: () => URLInfo },
														{ no: 29, name: "wifiConnectionQualityProbeURL", kind: "message", T: () => URLInfo },
														{ no: 30, name: "muninBaseURL", kind: "message", T: () => URLInfo },
														{ no: 31, name: "authProxyURL", kind: "message", T: () => URLInfo },
														{ no: 32, name: "wifiQualityURL", kind: "message", T: () => URLInfo },
														{ no: 33, name: "feedbackSubmissionURL", kind: "message", T: () => URLInfo },
														{ no: 34, name: "feedbackLookupURL", kind: "message", T: () => URLInfo },
														{ no: 35, name: "junctionImageServiceURL", kind: "message", T: () => URLInfo },
														{ no: 36, name: "analyticsCohortSessionURL", kind: "message", T: () => URLInfo },
														{ no: 37, name: "analyticsLongSessionURL", kind: "message", T: () => URLInfo },
														{ no: 38, name: "analyticsShortSessionURL", kind: "message", T: () => URLInfo },
														{ no: 39, name: "analyticsSessionlessURL", kind: "message", T: () => URLInfo },
														{ no: 40, name: "webModuleBaseURL", kind: "message", T: () => URLInfo },
														{ no: 41, name: "wifiQualityTileURL", kind: "message", T: () => URLInfo },
														{ no: 42, name: "alternateResourcesURL", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => URLInfo },
														{ no: 43, name: "tokenAuthenticationURL", kind: "message", T: () => URLInfo },
														{ no: 44, name: "authenticatedClientFeatureFlagURL", kind: "message", T: () => URLInfo },
														{ no: 45, name: "addressCorrectionTaggedLocationURL", kind: "message", T: () => URLInfo },
														{ no: 46, name: "proactiveAppClipURL", kind: "message", T: () => URLInfo },
														{ no: 47, name: "enrichmentSubmissionURL", kind: "message", T: () => URLInfo },
														{ no: 48, name: "ugcLogDiscardURL", kind: "message", T: () => URLInfo },
														{ no: 49, name: "batchReverseGeocoderPlaceRequestURL", kind: "message", T: () => URLInfo },
														{ no: 50, name: "pressureProbeDataURL", kind: "message", T: () => URLInfo },
														{ no: 51, name: "poiBusynessActivityCollectionURL", kind: "message", T: () => URLInfo },
														{ no: 52, name: "rapWebBundleURL", kind: "message", T: () => URLInfo },
														{ no: 53, name: "networkSelectionHarvestURL", kind: "message", T: () => URLInfo },
														{ no: 54, name: "offlineDataBatchListURL", kind: "message", T: () => URLInfo },
														{ no: 55, name: "offlineDataSizeURL", kind: "message", T: () => URLInfo },
														{ no: 56, name: "offlineDataDownloadBaseURL", kind: "message", T: () => URLInfo },
														{ no: 57, name: "bcxDispatcherURL", kind: "message", T: () => URLInfo }
													]);
												}
											}
											/**
											 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.URLInfoSet
											 */
											const URLInfoSet = new URLInfoSet$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class MuninBucket$Type extends MessageType {
												constructor() {
													super("com.apple.geo.protobuf.geo.MuninBucket", [
														{ no: 3, name: "bucketID", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 4, name: "bucketURL", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
														{ no: 5, name: "lodLevel", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ }
													]);
												}
											}
											/**
											 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.MuninBucket
											 */
											const MuninBucket = new MuninBucket$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class DisplayString$Type extends MessageType {
												constructor() {
													super("com.apple.geo.protobuf.geo.DisplayString", [
														{ no: 1, name: "localizedString", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => LocalizedString }
													]);
												}
											}
											/**
											 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.DisplayString
											 */
											const DisplayString = new DisplayString$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class LocalizedString$Type extends MessageType {
												constructor() {
													super("com.apple.geo.protobuf.geo.LocalizedString", [
														{ no: 1, name: "locale", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
														{ no: 3, name: "stringValue", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
													]);
												}
											}
											/**
											 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.LocalizedString
											 */
											const LocalizedString = new LocalizedString$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class MapRegion$Type extends MessageType {
												constructor() {
													super("com.apple.geo.protobuf.geo.MapRegion", []);
												}
											}
											/**
											 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.MapRegion
											 */
											const MapRegion = new MapRegion$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class OfflineMetadata$Type extends MessageType {
												constructor() {
													super("com.apple.geo.protobuf.geo.OfflineMetadata", [
														{ no: 1, name: "dataVersion", kind: "scalar", T: 4 /*ScalarType.UINT64*/ },
														{ no: 2, name: "regulatoryRegionId", kind: "scalar", T: 13 /*ScalarType.UINT32*/ }
													]);
												}
											}
											/**
											 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.OfflineMetadata
											 */
											const OfflineMetadata = new OfflineMetadata$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class Resources$Type extends MessageType {
												constructor() {
													super("com.apple.geo.protobuf.geo.Resources", [
														{ no: 1, name: "tileGroup", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => TileGroup },
														{ no: 2, name: "tileSet", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => TileSet },
														{ no: 3, name: "styleSheet", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
														{ no: 4, name: "texture", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
														{ no: 5, name: "font", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
														{ no: 6, name: "icon", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
														{ no: 8, name: "regionalResource", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => RegionalResource },
														{ no: 9, name: "xml", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
														{ no: 11, name: "attribution", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Attribution },
														{ no: 30, name: "authToken", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
														{ no: 31, name: "resourcesURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 32, name: "searchURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 33, name: "searchAttributionManifestURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 34, name: "autocompleteURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 35, name: "reverseGeocoderURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 36, name: "forwardGeocoderURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 37, name: "directionsURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 38, name: "etaURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 39, name: "locationShiftURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 40, name: "releaseInfo", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
														{ no: 41, name: "batchReverseGeocoderURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 42, name: "mapMatchURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 43, name: "simpleETAURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 44, name: "styleSheetChecksum", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
														{ no: 45, name: "textureChecksum", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
														{ no: 46, name: "fontChecksum", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
														{ no: 47, name: "iconChecksum", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
														{ no: 48, name: "xmlChecksum", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
														{ no: 49, name: "addressCorrectionInitURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 50, name: "addressCorrectionUpdateURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 51, name: "polyLocationShiftURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 52, name: "problemSubmissionURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 53, name: "problemStatusURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 54, name: "reverseGeocoderVersionsURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 55, name: "problemCategoriesURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 56, name: "usageURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 58, name: "businessCallerIDURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 59, name: "problemNotificationAvailabilityURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 61, name: "announcementsURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 62, name: "announcementsSupportedLanguage", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
														{ no: 63, name: "businessNameResolutionURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 64, name: "dispatcherURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 65, name: "problemOptInURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 66, name: "versionManifest", kind: "message", T: () => VersionManifest },
														{ no: 67, name: "abExperimentURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 68, name: "businessPortalBaseURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 69, name: "logMessageUsageURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 70, name: "locationShiftEnabledRegion", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => MapRegion },
														{ no: 71, name: "locationShiftVersion", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ },
														{ no: 72, name: "resource", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Resource },
														{ no: 73, name: "spatialLookupURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 74, name: "dataSet", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => DataSetDescription },
														{ no: 75, name: "dataSetURLOverride", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => DataSetURLOverride },
														{ no: 77, name: "realtimeTrafficProbeURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 78, name: "batchTrafficProbeURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 79, name: "proactiveRoutingURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 80, name: "logMessageUsageV3URL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 81, name: "backgroundDispatcherURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 82, name: "bluePOIDispatcherURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 83, name: "backgroundRevGeoURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 85, name: "wifiConnectionQualityProbeURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 88, name: "muninBaseURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 89, name: "muninVersion", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => MuninVersion },
														{ no: 91, name: "authProxyURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 92, name: "urlInfoSet", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => URLInfoSet },
														{ no: 93, name: "muninBucket", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => MuninBucket },
														{ no: 94, name: "displayString", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => DisplayString },
														{ no: 95, name: "offlineMetadata", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => OfflineMetadata }
													]);
												}
											}
											/**
											 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.Resources
											 */
											const Resources = new Resources$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class ResourceManifestDownload$Type extends MessageType {
												constructor() {
													super("com.apple.geo.protobuf.geo.ResourceManifestDownload", [
														{ no: 1, name: "resources", kind: "message", T: () => Resources }
													]);
												}
											}
											/**
											 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.ResourceManifestDownload
											 */
											const ResourceManifestDownload = new ResourceManifestDownload$Type();
											/******************  initialization finish  *******************/
											body = Resources.fromBinary(rawBody);
											//$.log(`🚧 调试信息`, `body before: ${JSON.stringify(body)}`, "");
											/*
											let UF = UnknownFieldHandler.list(body);
											//$.log(`🚧 调试信息`, `UF: ${JSON.stringify(UF)}`, "");
											if (UF) {
												UF = UF.map(uf => {
													//uf.no; // 22
													//uf.wireType; // WireType.Varint
													// use the binary reader to decode the raw data:
													let reader = new BinaryReader(uf.data);
													let addedNumber = reader.int32(); // 7777
													$.log(`🚧 no: ${uf.no}, wireType: ${uf.wireType}, reader: ${reader}, addedNumber: ${addedNumber}`, "");
												});
											};
											*/
											switch (URL.query.country_code) {
												case "CN":
													setCache(Caches, "CN", body);
													if (!Caches.XX) Caches.XX = Configs.XX;
													// announcementsSupportedLanguage
													//body.announcementsSupportedLanguage?.push?.("zh-CN");
													//body.announcementsSupportedLanguage?.push?.("zh-TW");
													break;
												default:
													setCache(Caches, "XX", body);
													if (!Caches.CN) Caches.CN = Configs.CN;
													// resource
													body.resource.push({ "resourceType": 7, "filename": "POITypeMapping-CN-1.json", "checksum": { "0": 242, "1": 10, "2": 179, "3": 107, "4": 214, "5": 41, "6": 50, "7": 223, "8": 62, "9": 204, "10": 134, "11": 7, "12": 103, "13": 206, "14": 96, "15": 242, "16": 24, "17": 42, "18": 79, "19": 223 }, "region": [], "filter": [], "validationMethod": 0, "updateMethod": 0 });
													body.resource.push({ "resourceType": 7, "filename": "China.cms-lpr", "checksum": { "0": 196, "1": 139, "2": 158, "3": 17, "4": 250, "5": 132, "6": 138, "7": 10, "8": 138, "9": 38, "10": 96, "11": 130, "12": 82, "13": 80, "14": 4, "15": 239, "16": 11, "17": 107, "18": 183, "19": 236 }, "region": [{ "minX": 1, "minY": 0, "maxX": 1, "maxY": 0, "minZ": 1, "maxZ": 25 }], "filter": [{ "scale": [], "scenario": [4] }], "connectionType": 0, "preferWiFiAllowedStaleThreshold": 0, "validationMethod": 1, "alternateResourceURLIndex": 1, "updateMethod": 1, "timeToLiveSeconds": 0 });
													break;
											};
											body.tileSet = tileSets(body.tileSet, Settings, Caches);
											body.attribution = attributions(body.attribution, URL, Caches);
											//body.dataSet = dataSets(body.dataSet, Settings, Caches);
											body.urlInfoSet = urlInfoSets(body.urlInfoSet, URL, Settings, Caches);
											body.muninBucket = muninBuckets(body.muninBucket, Settings, Caches);
											// releaseInfo
											//body.releaseInfo = body.releaseInfo.replace(/(\d+\.\d+)/, `$1.${String(Date.now()/1000)}`);
											$.log(`🚧 releaseInfo: ${body.releaseInfo}`, "");
											body = SetTileGroup(body);
											//$.log(`🚧 调试信息`, `body after: ${JSON.stringify(body)}`, "");
											rawBody = Resources.toBinary(body);
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
	.catch((e) => $.logErr(e))
	.finally(() => $.done($response))

/***************** Function *****************/
function setCache(cache, path, body) {
	$.log(`☑️ Set Cache, path: ${path}`, "");
	if (Date.now() - _.get(cache, `${path}.timeStamp`, 0) > 86400000) {
		_.set(cache, `${path}.tileSet`, body.tileSet);
		_.set(cache, `${path}.attribution`, body.attribution);
		_.set(cache, `${path}.urlInfoSet`, body.urlInfoSet);
		_.set(cache, `${path}.muninBucket`, body.muninBucket);
		_.set(cache, `${path}.timeStamp`, Date.now());
		$Storage.setItem("@iRingo.Maps.Caches", cache);
		$.log(`✅ Set Cache`, "");
	} else $.log(`❎ Set Cache`, "");
};

function SetTileGroup(body = {}) {
	$.log(`☑️ Set TileGroups`, "");
	body.tileGroup = body.tileGroup.map(tileGroup => {
		$.log(`🚧 tileGroup.identifier: ${tileGroup.identifier}`);
		tileGroup.identifier += Math.floor(Math.random() * 100) + 1;
		$.log(`🚧 tileGroup.identifier: ${tileGroup.identifier}`);
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
	$.log(`✅ Set TileGroups`, "");
	return body;
};

function tileSets(tileSets = [], settings = {}, caches = {}) {
	$.log(`☑️ Set TileSets`, "");
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
						tileSet.validVersion[0].availableTiles = [{ "minX": 0, "minY": 0, "maxX": 1, "maxY": 1, "minZ": 1, "maxZ": 22 }];
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
	$.log(`✅ Set TileSets`, "");
	return tileSets;
};

function attributions(attributions = [], url = {}, caches = {}) {
	$.log(`☑️ Set Attributions`, "");
	switch (url.query.country_code) {
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
				attribution.name = `${$.name}\n${new Date()}`;
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
	$.log(`✅ Set Attributions`, "");
	return attributions;
};

function dataSets(dataSets = [], settings = {}, caches = {}) {
	$.log(`☑️ Set DataSets`, "");
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
	$.log(`✅ Set DataSets`, "");
	return body;
};

function urlInfoSets(urlInfoSets = [], url = {}, settings = {}, caches = {}) {
	$.log(`☑️ Set UrlInfoSets`, "");
	urlInfoSets = urlInfoSets.map((urlInfoSet, index) => {
		switch (url.query?.country_code) {
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
	$.log(`✅ Set UrlInfoSets`, "");
	return urlInfoSets;
};

function muninBuckets(muninBuckets = [], settings = {}, caches = {}) {
	$.log(`☑️ Set MuninBuckets`, "");
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
	$.log(`✅ Set MuninBuckets`, "");
	return muninBuckets;
};
