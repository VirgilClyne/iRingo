import _ from './ENV/Lodash.mjs'
import $Storage from './ENV/$Storage.mjs'
import ENV from "./ENV/ENV.mjs";
import URI from "./URI/URI.mjs";
import XML from "./XML/XML.mjs";

import Database from "./database/index.mjs";
import setENV from "./function/setENV.mjs";

import { WireType, UnknownFieldHandler, reflectionMergePartial, MESSAGE_TYPE, MessageType, BinaryReader, isJsonObject, typeofJsonValue, jsonWriteOptions } from "../node_modules/@protobuf-ts/runtime/build/es2015/index.js";

const $ = new ENV(" iRingo: 📍 GeoServices.framework v3.0.3(3) response.beta");

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
(async () => {
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
					$.log(`🚧 body: ${body}`, "");
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
							body = XML.parse($response.body);
							$.log(`🚧 body: ${JSON.stringify(body)}`, "");
							// 路径判断
							switch (PATH) {
								case "config/defaults":
									const PLIST = body.plist;
									if (PLIST) {
										// set settings
										// CN
										PLIST["com.apple.GEO"].CountryProviders.CN.ShouldEnableLagunaBeach = Settings?.Config?.Defaults?.LagunaBeach ?? true; // XX
										PLIST["com.apple.GEO"].CountryProviders.CN.DrivingMultiWaypointRoutesEnabled = Settings?.Config?.Defaults?.DrivingMultiWaypointRoutesEnabled ?? true; // 驾驶导航途径点
										//PLIST["com.apple.GEO"].CountryProviders.CN.EnableAlberta = false; // CN
										//PLIST["com.apple.GEO"].CountryProviders.CN.EnableClientDrapedVectorPolygons = false; // CN
										PLIST["com.apple.GEO"].CountryProviders.CN.GEOAddressCorrectionEnabled = Settings?.Config?.Defaults?.GEOAddressCorrection ?? true; // CN
										if (Settings?.Config?.Defaults?.LookupMaxParametersCount ?? true) {
											delete PLIST["com.apple.GEO"].CountryProviders.CN.GEOBatchSpatialEventLookupMaxParametersCount // CN
											delete PLIST["com.apple.GEO"].CountryProviders.CN.GEOBatchSpatialPlaceLookupMaxParametersCount // CN
										}
										PLIST["com.apple.GEO"].CountryProviders.CN.LocalitiesAndLandmarksSupported = Settings?.Config?.Defaults?.LocalitiesAndLandmarks ?? true; // CN
										//PLIST["com.apple.GEO"].CountryProviders.CN.NavigationShowHeadingKey = true;
										PLIST["com.apple.GEO"].CountryProviders.CN.POIBusynessDifferentialPrivacy = Settings?.Config?.Defaults?.POIBusyness ?? true; // CN
										PLIST["com.apple.GEO"].CountryProviders.CN.POIBusynessRealTime = Settings?.Config?.Defaults?.POIBusyness ?? true; // CN
										PLIST["com.apple.GEO"].CountryProviders.CN.TransitPayEnabled = Settings?.Config?.Defaults?.TransitPayEnabled ?? true; // CN
										//PLIST["com.apple.GEO"].CountryProviders.CN.WiFiQualityNetworkDisabled = Settings?.Config?.Defaults?.WiFiQualityNetworkDisabled ?? true; // CN
										//PLIST["com.apple.GEO"].CountryProviders.CN.WiFiQualityTileDisabled = Settings?.Config?.Defaults?.WiFiQualityTileDisabled ?? true; // CN
										PLIST["com.apple.GEO"].CountryProviders.CN.SupportsOffline = Settings?.Config?.Defaults?.SupportsOffline ?? true; // CN
										PLIST["com.apple.GEO"].CountryProviders.CN.SupportsCarIntegration = Settings?.Config?.Defaults?.SupportsCarIntegration ?? true; // CN
										// TW
										//PLIST["com.apple.GEO"].CountryProviders.CN.GEOShouldSpeakWrittenAddresses = true; // TW
										//PLIST["com.apple.GEO"].CountryProviders.CN.GEOShouldSpeakWrittenPlaceNames = true; // TW
										// US
										PLIST["com.apple.GEO"].CountryProviders.CN["6694982d2b14e95815e44e970235e230"] = Settings?.Config?.Defaults?.["6694982d2b14e95815e44e970235e230"] ?? true; // US
										PLIST["com.apple.GEO"].CountryProviders.CN.PedestrianAREnabled = Settings?.Config?.Defaults?.PedestrianAR ?? true; // 现实世界中的线路
										PLIST["com.apple.GEO"].CountryProviders.CN.OpticalHeadingEnabled = Settings?.Config?.Defaults?.OpticalHeading ?? true; // 举起以查看
										PLIST["com.apple.GEO"].CountryProviders.CN.UseCLPedestrianMapMatchedLocations = Settings?.Config?.Defaults?.UseCLPedestrianMapMatchedLocations ?? true; // 导航准确性-增强
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
											class Resources$Type extends MessageType {
												constructor() {
													super("Resources", [
														{ no: 2, name: "tileSet", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => TileSet },
														{ no: 3, name: "styleSheet", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
														{ no: 4, name: "texture", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
														{ no: 5, name: "font", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
														{ no: 6, name: "icon", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
														{ no: 9, name: "xml", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
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
														{ no: 71, name: "locationShiftVersion", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ },
														//{ no: 72, name: "resource", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Resource },
														{ no: 73, name: "spatialLookupURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 77, name: "realtimeTrafficProbeURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 78, name: "batchTrafficProbeURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 79, name: "proactiveRoutingURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 80, name: "logMessageUsageV3URL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 81, name: "backgroundDispatcherURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 82, name: "bluePOIDispatcherURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 83, name: "backgroundRevGeoURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 85, name: "wifiConnectionQualityProbeURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 88, name: "muninBaseURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 91, name: "authProxyURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 92, name: "urlInfoSet", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => URLInfoSet },
														{ no: 93, name: "muninBucket", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => MuninBucket }
													]);
												}
											}
											const Resources = new Resources$Type();
											class TileSet$Type extends MessageType {
												constructor() {
													super("TileSet", [
														{ no: 1, name: "baseURL", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
														{ no: 2, name: "multiTileURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 3, name: "style", kind: "enum", T: () => ["TileSet.Style", TileSet_Style] },
														{ no: 5, name: "validVersion", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => TileSetVersion },
														{ no: 6, name: "scale", kind: "enum", T: () => ["TileSet.Scale", TileSet_Scale] },
														{ no: 7, name: "size", kind: "enum", T: () => ["TileSet.Size", TileSet_Size] },
														{ no: 9, name: "localizationURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 10, name: "supportedLanguage", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Language },
														{ no: 11, name: "multiTileURLUsesStatusCodes", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
														{ no: 12, name: "updateBehavior", kind: "enum", opt: true, T: () => ["TileSet.UpdateBehavior", TileSet_UpdateBehavior] },
														{ no: 13, name: "countryRegionWhitelist", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => CountryRegionTuple },
														{ no: 14, name: "checksumType", kind: "enum", T: () => ["TileSet.ChecksumType", TileSet_ChecksumType, "CHECKSUM_TYPE_"] },
														{ no: 15, name: "dataSet", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ },
														{ no: 16, name: "requestStyle", kind: "enum", T: () => ["TileSet.RequestStyle", TileSet_RequestStyle, "REQUEST_STYLE_"] },
														{ no: 17, name: "useAuthProxy", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
														{ no: 18, name: "supportsMultipathTCP", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
														{ no: 19, name: "alternativeMultipathTCPPort", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ },
														{ no: 20, name: "deviceSKUWhitelist", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ }
													]);
												}
											}
											const TileSet = new TileSet$Type();
											class TileSetRegion$Type extends MessageType {
												constructor() {
													super("TileSetRegion", [
														{ no: 1, name: "minX", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 2, name: "minY", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 3, name: "maxX", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 4, name: "maxY", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 5, name: "minZ", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 6, name: "maxZ", kind: "scalar", T: 13 /*ScalarType.UINT32*/ }
													]);
												}
											}
											const TileSetRegion = new TileSetRegion$Type();
											class GenericTile$Type extends MessageType {
												constructor() {
													super("GenericTile", [
														{ no: 1, name: "tileType", kind: "enum", T: () => ["GenericTile.TileType", GenericTile_TileType] },
														{ no: 2, name: "textureIndex", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 3, name: "resourceIndex", kind: "scalar", T: 13 /*ScalarType.UINT32*/ }
													]);
												}
											}
											const GenericTile = new GenericTile$Type();
											class TileSetVersion$Type extends MessageType {
												constructor() {
													super("TileSetVersion", [
														{ no: 1, name: "identifier", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 2, name: "availableTile", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => TileSetRegion },
														{ no: 3, name: "timeToLiveSeconds", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 4, name: "genericTile", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => GenericTile },
														{ no: 5, name: "supportedLanguagesVersion", kind: "scalar", T: 13 /*ScalarType.UINT32*/ }
													]);
												}
											}
											const TileSetVersion = new TileSetVersion$Type();
											class Language$Type extends MessageType {
												constructor() {
													super("Language", [
														{ no: 1, name: "identifier", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 2, name: "language", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ }
													]);
												}
											}
											const Language = new Language$Type();
											class CountryRegionTuple$Type extends MessageType {
												constructor() {
													super("CountryRegionTuple", [
														{ no: 1, name: "countryCode", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
														{ no: 2, name: "region", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
													]);
												}
											}
											const CountryRegionTuple = new CountryRegionTuple$Type();
											class VersionManifest$Type extends MessageType {
												constructor() {
													super("VersionManifest", [
														{ no: 1, name: "serviceVersion", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => ServiceVersion }
													]);
												}
											}
											const VersionManifest = new VersionManifest$Type();
											class ServiceVersion$Type extends MessageType {
												constructor() {
													super("ServiceVersion", [
														{ no: 1, name: "versionDomain", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
														{ no: 2, name: "minimumVersion", kind: "scalar", T: 13 /*ScalarType.UINT32*/ }
													]);
												}
											}
											const ServiceVersion = new ServiceVersion$Type();
											class URLInfoSet$Type extends MessageType {
												constructor() {
													super("URLInfoSet", [
														{ no: 1, name: "dataSet", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
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
											const URLInfoSet = new URLInfoSet$Type();
											class URLInfo$Type extends MessageType {
												constructor() {
													super("URLInfo", [
														{ no: 1, name: "url", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
														{ no: 2, name: "useAuthProxy", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
														{ no: 3, name: "supportsMultipathTCP", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
														{ no: 4, name: "alternativeMultipathTCPPort", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ }
													]);
												}
											}
											
											const URLInfo = new URLInfo$Type();
											class MuninBucket$Type extends MessageType {
												constructor() {
													super("MuninBucket", [
														{ no: 3, name: "bucketID", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 4, name: "bucketURL", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
														{ no: 5, name: "lodLevel", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ }
													]);
												}
											}
											const MuninBucket = new MuninBucket$Type();
											/******************  initialization finish  *******************/
											body = Resources.fromBinary(rawBody);
											$.log(`🚧 调试信息`, `body: ${JSON.stringify(body)}`, "");
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
											switch (Settings.GeoManifest.Dynamic.Config.CountryCode.default) {
												case "AUTO":
													// Batch Reverse Geocoder (Legacy)
													_.set(body, "urlInfoSet[0].batchReverseGeocoderURL.url", "https://batch-rgeo.is.autonavi.com/batchRGeo");
													_.set(body, "urlInfoSet[0].batchReverseGeocoderURL.supportsMultipathTCP", false);
													// Alternate Resources
													body.urlInfoSet[0].alternateResourcesURL = [
														{ "url": "https://limit-rule.is.autonavi.com/lpr/rules/download", "supportsMultipathTCP": false }, // Limit Rule
														{ "url": "https://cdn.apple-mapkit.com/rap", "supportsMultipathTCP": false }
													]
													break;
												case "CN":
													// Batch Reverse Geocoder (Legacy)
													//_.set(body, "urlInfoSet[0].batchReverseGeocoderURL.url", "https://batch-rgeo.is.autonavi.com/batchRGeo");
													//_.set(body, "urlInfoSet[0].batchReverseGeocoderURL.supportsMultipathTCP", false);
													body.urlInfoSet[0].alternateResourcesURL.push({ "url": "https://cdn.apple-mapkit.com/rap", "supportsMultipathTCP": false });
													break;
												default:
													// Batch Reverse Geocoder (Legacy)
													//_.set(body, "urlInfoSet[0].batchReverseGeocoderURL.url", "https://gsp36-ssl.ls.apple.com/revgeo.arpc");
													//_.set(body, "urlInfoSet[0].batchReverseGeocoderURL.supportsMultipathTCP", false);
													body.urlInfoSet[0].polyLocationShiftURL = { "url": "https://shift.is.autonavi.com/localshift", "supportsMultipathTCP": false };
													body.urlInfoSet[0].alternateResourcesURL.push({ url: "https://limit-rule.is.autonavi.com/lpr/rules/download", supportsMultipathTCP: false });
													break;
											};
											switch (Settings.Config.Announcements.Environment.default) {
												case "AUTO":
												default:
													break;
												case "CN":
													// Announcements
													_.set(body, "urlInfoSet[0].announcementsURL.url", "https://gspe35-ssl.ls.apple.com/config/announcements?environment=prod-cn");
													_.set(body, "urlInfoSet[0].announcementsURL.supportsMultipathTCP", false);
													break;
												case "XX":
													// Announcements
													_.set(body, "urlInfoSet[0].announcementsURL.url", "https://gspe35-ssl.ls.apple.com/config/announcements?environment=prod");
													_.set(body, "urlInfoSet[0].announcementsURL.supportsMultipathTCP", false);
													break;
											};
											if (body.tileSet) body.tileSet = body.tileSet.map(tile => {
												switch (tile.style) {
													case 1: // VECTOR_STANDARD
														switch (Settings.TileSet.Standard) {
															case "AUTO":
															default:
																break;
															case "CN":
																tile.baseURL = "https://gspe19-cn-ssl.ls.apple.com/tiles?flags=8"
																break;
															case "XX":
																tile.baseURL = "https://gspe19-ssl.ls.apple.com/tile.vf?flags=8";
																break;
														};
														break;
													case 12: // VECTOR_TRAFFIC
														switch (Settings.TileSet.Traffic) {
															case "AUTO":
															default:
																break;
															case "CN":
																tile.baseURL = "https://gspe12-cn-ssl.ls.apple.com/traffic";
																break;
															case "XX":
																tile.baseURL = "https://gspe12-ssl.ls.apple.com/traffic";
																break;
														};
														break;
													case 13: // VECTOR_POI
														switch (Settings.Services.POI) {
															case "AUTO":
															default:
																break;
															case "CN":
																tile.baseURL = "https://gspe19-cn-ssl.ls.apple.com/tiles?flags=2";
																break;
															case "XX":
																tile.baseURL = "https://gspe19-ssl.ls.apple.com/tile.vf?flags=2";
																break;
														};
														break;
													case 52: // FLYOVER_METADATA
														switch (Settings.TileSet.Flyover) {
															case "AUTO":
															default:
																tile.baseURL = "https://gspe11-ssl.ls.apple.com/tile";
																tile.style = 52;
																_.set(tile, "validVersion.identifier", 1);
																tile.scale = 0;
																tile.size = 2;
																tile.checksumType = 0;
																tile.requestStyle = 0;
																tile.supportsMultipathTCP = 0;
																break;
															case "CN":
																tile.baseURL = "https://gspe11-cn-ssl.ls.apple.com/tile";
																break;
															case "XX":
																tile.baseURL = "https://gspe11-ssl.ls.apple.com/tile";
																break;
														};
														break;
													case 56: // VECTOR_STREET_POI
														switch (Settings.TileSet.POI) {
															case "AUTO":
															default:
																break;
															case "CN":
																tile.baseURL = "https://gspe19-cn-ssl.ls.apple.com/tiles";
																break;
															case "XX":
																tile.baseURL = "https://gspe19-ssl.ls.apple.com/tile.vf";
																break;
														};
														break;
													case 57: // MUNIN_METADATA
														switch (Settings.TileSet.Munin) {
															case "AUTO":
															default:
																break;
															case "CN":
																tile.baseURL = "https://gsp76-cn-ssl.ls.apple.com/api/tile";
																break;
															case "XX":
																tile.baseURL = "https://gspe76-ssl.ls.apple.com/api/tile";
																break;
														};
														break;
													case 84: // VECTOR_POI_V2_UPDATE
														switch (Settings.TileSet.POI) {
															case "AUTO":
															default:
																break;
															case "CN":
																tile.baseURL = "https://gspe19-2-cn-ssl.ls.apple.com/poi_update";
																break;
															case "XX":
																tile.baseURL = "https://gspe19-2-ssl.ls.apple.com/poi_update";
																break;
														};
														break;
												};
												return tile;
											});
											switch (Settings.UrlInfoSet.Dispatcher) {
												case "AUTO":
												default:
													break;
												case "CN":
													// PlaceData Dispatcher
													_.set(body, "urlInfoSet[0].dispatcherURL.url", "https://dispatcher.is.autonavi.com/dispatcher");
													_.set(body, "urlInfoSet[0].dispatcherURL.supportsMultipathTCP", false);
													// Background Dispatcher
													_.set(body, "urlInfoSet[0].backgroundDispatcherURL.url", "https://dispatcher.is.autonavi.com/dispatcher");
													_.set(body, "urlInfoSet[0].backgroundDispatcherURL.supportsMultipathTCP", false);
													// Blue POI
													_.set(body, "urlInfoSet[0].bluePOIDispatcherURL.url", "https://gsp57-ssl-locus.ls.apple.com/dispatcher.arpc");
													_.set(body, "urlInfoSet[0].bluePOIDispatcherURL.supportsMultipathTCP", true);
													_.set(body, "urlInfoSet[0].bluePOIDispatcherURL.alternativeMultipathTCPPort", 5228);
													break;
												case "XX":
													// PlaceData Dispatcher
													_.set(body, "urlInfoSet[0].dispatcherURL.url", "https://gsp-ssl.ls.apple.com/dispatcher.arpc");
													_.set(body, "urlInfoSet[0].dispatcherURL.supportsMultipathTCP", true);
													_.set(body, "urlInfoSet[0].dispatcherURL.alternativeMultipathTCPPort", 5228);
													// Background Dispatcher
													_.set(body, "urlInfoSet[0].backgroundDispatcherURL.url", "https://gsp57-ssl-background.ls.apple.com/dispatcher.arpc");
													_.set(body, "urlInfoSet[0].backgroundDispatcherURL.supportsMultipathTCP", true);
													_.set(body, "urlInfoSet[0].backgroundDispatcherURL.alternativeMultipathTCPPort", 5228);
													// Blue POI
													_.set(body, "urlInfoSet[0].bluePOIDispatcherURL.url", "https://gsp57-ssl-locus.ls.apple.com/dispatcher.arpc");
													_.set(body, "urlInfoSet[0].bluePOIDispatcherURL.supportsMultipathTCP", true);
													_.set(body, "urlInfoSet[0].bluePOIDispatcherURL.alternativeMultipathTCPPort", 5228);
													break;
											};
											switch (Settings.UrlInfoSet.Directions) {
												case "AUTO":
												default:
													break;
												case "CN":
													// Directions
													_.set(body, "urlInfoSet[0].directionsURL.url", "https://direction2.is.autonavi.com/direction");
													_.set(body, "urlInfoSet[0].directionsURL.supportsMultipathTCP", false);
													// ETA
													_.set(body, "urlInfoSet[0].etaURL.url", "https://direction2.is.autonavi.com/direction");
													_.set(body, "urlInfoSet[0].etaURL.supportsMultipathTCP", false);
													// Simple ETA
													_.set(body, "urlInfoSet[0].simpleETAURL.url", "https://direction2.is.autonavi.com/direction");
													_.set(body, "urlInfoSet[0].simpleETAURL.supportsMultipathTCP", false);
													break;
												case "XX":
													// Directions
													_.set(body, "urlInfoSet[0].directionsURL.url", "https://gsp-ssl.ls.apple.com/directions.arpc");
													_.set(body, "urlInfoSet[0].directionsURL.supportsMultipathTCP", true);
													_.set(body, "urlInfoSet[0].directionsURL.alternativeMultipathTCPPort", 5228);
													// ETA
													_.set(body, "urlInfoSet[0].etaURL.url", "https://gsp-ssl.ls.apple.com/directions.arpc");
													_.set(body, "urlInfoSet[0].etaURL.supportsMultipathTCP", true);
													_.set(body, "urlInfoSet[0].etaURL.alternativeMultipathTCPPort", 5228);
													// Simple ETA
													_.set(body, "urlInfoSet[0].simpleETAURL.url", "https://gsp-ssl.ls.apple.com/directions.arpc");
													_.set(body, "urlInfoSet[0].simpleETAURL.supportsMultipathTCP", true);
													_.set(body, "urlInfoSet[0].simpleETAURL.alternativeMultipathTCPPort", 5228);
													break;
											};
											switch (Settings.UrlInfoSet.RAP) {
												case "AUTO":
												default:
													// RAP Submission
													_.set(body, "urlInfoSet[0].problemSubmissionURL.url", "https://sundew.ls.apple.com/v1/feedback/submission.arpc");
													_.set(body, "urlInfoSet[0].problemSubmissionURL.supportsMultipathTCP", false);
													// RAP Status
													_.set(body, "urlInfoSet[0].problemStatusURL.url", "https://gsp-ssl.ls.apple.com/feedback.arpc");
													_.set(body, "urlInfoSet[0].problemStatusURL.supportsMultipathTCP", false);
													// RAP Opt-Ins
													_.set(body, "urlInfoSet[0].problemOptInURL.url", "https://jana-mpr.ls.apple.com/grp/oi");
													_.set(body, "urlInfoSet[0].problemOptInURL.supportsMultipathTCP", false);
													// RAP V4 Submission
													_.set(body, "urlInfoSet[0].feedbackSubmissionURL.url", "https://sundew.ls.apple.com/v1/feedback/submission.arpc");
													_.set(body, "urlInfoSet[0].feedbackSubmissionURL.supportsMultipathTCP", false);
													// RAP V4 Lookup
													_.set(body, "urlInfoSet[0].feedbackLookupURL.url", "https://gsp-ssl.ls.apple.com/feedback.arpc");
													_.set(body, "urlInfoSet[0].feedbackLookupURL.supportsMultipathTCP", false);
													break;
												case "CN":
													// RAP Submission
													_.set(body, "urlInfoSet[0].problemSubmissionURL.url", "https://rap.is.autonavi.com/rap");
													_.set(body, "urlInfoSet[0].problemSubmissionURL.supportsMultipathTCP", false);
													// RAP Status
													_.set(body, "urlInfoSet[0].problemStatusURL.url", "https://rap.is.autonavi.com/rapstatus");
													_.set(body, "urlInfoSet[0].problemStatusURL.supportsMultipathTCP", false);
													// RAP V4 Submission
													_.set(body, "urlInfoSet[0].feedbackSubmissionURL.url", "https://rap.is.autonavi.com/rap");
													_.set(body, "urlInfoSet[0].feedbackSubmissionURL.supportsMultipathTCP", false);
													// RAP V4 Lookup
													_.set(body, "urlInfoSet[0].feedbackLookupURL.url", "https://rap.is.autonavi.com/lookup");
													_.set(body, "urlInfoSet[0].feedbackLookupURL.supportsMultipathTCP", false);
													break;
												case "XX":
													// RAP Submission
													_.set(body, "urlInfoSet[0].problemSubmissionURL.url", "https://sundew.ls.apple.com/v1/feedback/submission.arpc");
													_.set(body, "urlInfoSet[0].problemSubmissionURL.supportsMultipathTCP", false);
													// RAP Status
													_.set(body, "urlInfoSet[0].problemStatusURL.url", "https://gsp-ssl.ls.apple.com/feedback.arpc");
													_.set(body, "urlInfoSet[0].problemStatusURL.supportsMultipathTCP", false);
													// RAP Opt-Ins
													_.set(body, "urlInfoSet[0].problemOptInURL.url", "https://jana-mpr.ls.apple.com/grp/oi");
													_.set(body, "urlInfoSet[0].problemOptInURL.supportsMultipathTCP", false);
													// RAP V4 Submission
													_.set(body, "urlInfoSet[0].feedbackSubmissionURL.url", "https://sundew.ls.apple.com/v1/feedback/submission.arpc");
													_.set(body, "urlInfoSet[0].feedbackSubmissionURL.supportsMultipathTCP", false);
													// RAP V4 Lookup
													_.set(body, "urlInfoSet[0].feedbackLookupURL.url", "https://gsp-ssl.ls.apple.com/feedback.arpc");
													_.set(body, "urlInfoSet[0].feedbackLookupURL.supportsMultipathTCP", false);
													break;
											};
											switch (Settings.TileSet.Munin) {
												case "AUTO":
												default:
													break;
												case "CN":
													_.set(body, "muninBucket[0].bucketID", 2);
													_.set(body, "muninBucket[0].bucketURL", "https://gspe72-cn-ssl.ls.apple.com/mnn_us");
													_.set(body, "muninBucket[1].bucketID", 6);
													_.set(body, "muninBucket[1].bucketURL", "https://gspe72-cn-ssl.ls.apple.com/mnn_us");
													break;
												case "XX":
													_.set(body, "muninBucket[0].bucketID", 2);
													_.set(body, "muninBucket[0].bucketURL", "https://gspe72-ssl.ls.apple.com/mnn_us");
													_.set(body, "muninBucket[1].bucketID", 6);
													_.set(body, "muninBucket[1].bucketURL", "https://gspe72-ssl.ls.apple.com/mnn_us");
													break;
											};
											$.log(`🚧 调试信息`, `body: ${JSON.stringify(body)}`, "");
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
