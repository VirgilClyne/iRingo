import _ from './ENV/Lodash.mjs'
import $Storage from './ENV/$Storage.mjs'
import ENV from "./ENV/ENV.mjs";
import URI from "./URI/URI.mjs";
import XML from "./XML/XML.mjs";

import Database from "./database/index.mjs";
import setENV from "./function/setENV.mjs";

import { WireType, UnknownFieldHandler, reflectionMergePartial, MESSAGE_TYPE, MessageType, BinaryReader, isJsonObject, typeofJsonValue, jsonWriteOptions } from "../node_modules/@protobuf-ts/runtime/build/es2015/index.js";

const $ = new ENV(" iRingo: 📍 GeoServices.framework v3.1.0(14) response.beta");

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
											class RegionalResource$Type extends MessageType {
												constructor() {
													super("RegionalResource", [
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
											const RegionalResource = new RegionalResource$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class RegionalResourceIndex$Type extends MessageType {
												constructor() {
													super("RegionalResourceIndex", []);
												}
											}
											const RegionalResourceIndex = new RegionalResourceIndex$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class RegionalResourceTile$Type extends MessageType {
												constructor() {
													super("RegionalResourceTile", []);
												}
											}
											const RegionalResourceTile = new RegionalResourceTile$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class RegionalResourceRegion$Type extends MessageType {
												constructor() {
													super("RegionalResourceRegion", []);
												}
											}
											const RegionalResourceRegion = new RegionalResourceRegion$Type();
											// @generated message type with reflection information, may provide speed optimized methods
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
											// @generated message type with reflection information, may provide speed optimized methods
											class TileGroup$Type extends MessageType {
												constructor() {
													super("TileGroup", [
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
											const TileGroup = new TileGroup$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class TileGroup_VersionedTileSet$Type extends MessageType {
												constructor() {
													super("TileGroup.VersionedTileSet", [
														{ no: 1, name: "tileSetIndex", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 2, name: "identifier", kind: "scalar", T: 13 /*ScalarType.UINT32*/ }
													]);
												}
											}
											const TileGroup_VersionedTileSet = new TileGroup_VersionedTileSet$Type();
											// @generated message type with reflection information, may provide speed optimized methods
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
											// @generated message type with reflection information, may provide speed optimized methods
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
											// @generated message type with reflection information, may provide speed optimized methods
											class Language$Type extends MessageType {
												constructor() {
													super("Language", [
														{ no: 1, name: "identifier", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 2, name: "language", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ }
													]);
												}
											}
											const Language = new Language$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class CountryRegionTuple$Type extends MessageType {
												constructor() {
													super("CountryRegionTuple", [
														{ no: 1, name: "countryCode", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
														{ no: 2, name: "region", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
													]);
												}
											}
											const CountryRegionTuple = new CountryRegionTuple$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class TileSet$Type extends MessageType {
												constructor() {
													super("TileSet", [
														{ no: 1, name: "baseURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
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
											// @generated message type with reflection information, may provide speed optimized methods
											class ResourceFilter$Type extends MessageType {
												constructor() {
													super("ResourceFilter", [
														{ no: 1, name: "scale", kind: "enum", repeat: 1 /*RepeatType.PACKED*/, T: () => ["ResourceFilter.Scale", ResourceFilter_Scale] },
														{ no: 2, name: "scenario", kind: "enum", repeat: 1 /*RepeatType.PACKED*/, T: () => ["ResourceFilter.Scenario", ResourceFilter_Scenario] }
													]);
												}
											}
											const ResourceFilter = new ResourceFilter$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class Resource$Type extends MessageType {
												constructor() {
													super("Resource", [
														{ no: 1, name: "resourceType", kind: "enum", T: () => ["Resource.ResourceType", Resource_ResourceType, "RESOURCE_TYPE_"] },
														{ no: 2, name: "filename", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
														{ no: 3, name: "checksum", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
														{ no: 4, name: "region", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => TileSetRegion },
														{ no: 5, name: "filter", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => ResourceFilter },
														{ no: 6, name: "connectionType", kind: "enum", opt: true, T: () => ["Resource.ConnectionType", Resource_ConnectionType] },
														{ no: 7, name: "preferWiFiAllowedStaleThreshold", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ },
														{ no: 8, name: "validationMethod", kind: "enum", T: () => ["Resource.ValidationMethod", Resource_ValidationMethod] },
														{ no: 9, name: "alternateResourceURLIndex", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ },
														{ no: 10, name: "updateMethod", kind: "enum", T: () => ["Resource.UpdateMethod", Resource_UpdateMethod] },
														{ no: 11, name: "timeToLiveSeconds", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ }
													]);
												}
											}
											const Resource = new Resource$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class Attribution$Type extends MessageType {
												constructor() {
													super("Attribution", [
														{ no: 1, name: "badge", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 2, name: "logo", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 3, name: "name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
														{ no: 4, name: "url", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
														{ no: 5, name: "badgeChecksum", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 6, name: "logoChecksum", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 7, name: "resource", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Resource },
														{ no: 8, name: "region", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => TileSetRegion },
														{ no: 9, name: "dataSet", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ },
														{ no: 10, name: "linkDisplayStringIndex", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 11, name: "plainTextURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
														{ no: 12, name: "plainTextURLSHA256Checksum", kind: "scalar", opt: true, T: 12 /*ScalarType.BYTES*/ }
													]);
												}
											}
											const Attribution = new Attribution$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class ServiceVersion$Type extends MessageType {
												constructor() {
													super("ServiceVersion", [
														{ no: 1, name: "versionDomain", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
														{ no: 2, name: "minimumVersion", kind: "scalar", T: 13 /*ScalarType.UINT32*/ }
													]);
												}
											}
											const ServiceVersion = new ServiceVersion$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class VersionManifest$Type extends MessageType {
												constructor() {
													super("VersionManifest", [
														{ no: 1, name: "serviceVersion", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => ServiceVersion }
													]);
												}
											}
											const VersionManifest = new VersionManifest$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class DataSetDescription$Type extends MessageType {
												constructor() {
													super("DataSetDescription", [
														{ no: 1, name: "identifier", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 2, name: "dataSetDescription", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
													]);
												}
											}
											const DataSetDescription = new DataSetDescription$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class DataSetURLOverride$Type extends MessageType {
												constructor() {
													super("DataSetURLOverride", []);
												}
											}
											const DataSetURLOverride = new DataSetURLOverride$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class MuninVersion$Type extends MessageType {
												constructor() {
													super("MuninVersion", []);
												}
											}
											const MuninVersion = new MuninVersion$Type();
											// @generated message type with reflection information, may provide speed optimized methods
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
											// @generated message type with reflection information, may provide speed optimized methods
											class URLInfoSet$Type extends MessageType {
												constructor() {
													super("URLInfoSet", [
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
											const URLInfoSet = new URLInfoSet$Type();
											// @generated message type with reflection information, may provide speed optimized methods
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
											// @generated message type with reflection information, may provide speed optimized methods
											class DisplayString$Type extends MessageType {
												constructor() {
													super("DisplayString", [
														{ no: 1, name: "localizedString", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => LocalizedString }
													]);
												}
											}
											const DisplayString = new DisplayString$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class LocalizedString$Type extends MessageType {
												constructor() {
													super("LocalizedString", [
														{ no: 1, name: "locale", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
														{ no: 3, name: "stringValue", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
													]);
												}
											}
											const LocalizedString = new LocalizedString$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class MapRegion$Type extends MessageType {
												constructor() {
													super("MapRegion", []);
												}
											}
											const MapRegion = new MapRegion$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class OfflineMetadata$Type extends MessageType {
												constructor() {
													super("OfflineMetadata", [
														{ no: 1, name: "dataVersion", kind: "scalar", T: 4 /*ScalarType.UINT64*/ },
														{ no: 2, name: "regulatoryRegionId", kind: "scalar", T: 13 /*ScalarType.UINT32*/ }
													]);
												}
											}
											const OfflineMetadata = new OfflineMetadata$Type();
											// @generated message type with reflection information, may provide speed optimized methods
											class Resources$Type extends MessageType {
												constructor() {
													super("Resources", [
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
											const Resources = new Resources$Type();
											class ResourceManifestDownload$Type extends MessageType {
												constructor() {
													super("ResourceManifestDownload", [
														{ no: 1, name: "resources", kind: "message", T: () => Resources }
													]);
												}
											}
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
											switch (Settings.GeoManifest.Dynamic.Config.CountryCode.default) {
												case "AUTO":
													break;
												case "CN":
													//_.set(Caches, "TileGroup.CN", body.tileGroup);
													//$Storage.setItem("@iRingo.Maps.Caches")
													// releaseInfo
													//body.releaseInfo = body.releaseInfo.replace("PROD-CN ", "PROD ");
													// announcementsSupportedLanguage
													//body.announcementsSupportedLanguage?.push?.("zh-CN");
													//body.announcementsSupportedLanguage?.push?.("zh-TW");
													break;
												default:
													//_.set(Caches, "TileGroup.XX", body.tileGroup);
													//$Storage.setItem("@iRingo.Maps.Caches")
													// resource
													body.resource.push({ "resourceType": 7, "filename": "POITypeMapping-CN-1.json", "checksum": { "0": 242, "1": 10, "2": 179, "3": 107, "4": 214, "5": 41, "6": 50, "7": 223, "8": 62, "9": 204, "10": 134, "11": 7, "12": 103, "13": 206, "14": 96, "15": 242, "16": 24, "17": 42, "18": 79, "19": 223 }, "region": [], "filter": [], "validationMethod": 0, "updateMethod": 0 });
													body.resource.push({ "resourceType": 7, "filename": "China.cms-lpr", "checksum": { "0": 196, "1": 139, "2": 158, "3": 17, "4": 250, "5": 132, "6": 138, "7": 10, "8": 138, "9": 38, "10": 96, "11": 130, "12": 82, "13": 80, "14": 4, "15": 239, "16": 11, "17": 107, "18": 183, "19": 236 }, "region": [{ "minX": 1, "minY": 0, "maxX": 1, "maxY": 0, "minZ": 1, "maxZ": 25 }], "filter": [{ "scale": [], "scenario": [4] }], "connectionType": 0, "preferWiFiAllowedStaleThreshold": 0, "validationMethod": 1, "alternateResourceURLIndex": 1, "updateMethod": 1, "timeToLiveSeconds": 0 });
													break;
											};
											body = setTileSet(body, Settings, Configs);
											//$.log(`🚧 调试信息`, `body middle: ${JSON.stringify(body)}`, "");
											body = setTileGroup(body, Settings, Configs);
											//body = setDataSet(body, Settings, Configs);
											body = setUrlInfoSet(body, Settings, Configs);
											body = setMuninBucket(body, Settings, Configs);
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
function setTileGroup(body = {}, settings = {}, configs = {}) {
	$.log(`☑️ Set TileGroup`, "");
	body.tileGroup[0].tileSet = body.tileSet.map((tileSet, index) => {
		return {
			"tileSetIndex": index,
			"identifier": tileSet.validVersion?.[0]?.identifier
		};
	});
	// tileGroup[0].attributionIndex
	//if (!body.tileGroup?.[0]?.attributionIndex.includes(2)) body.tileGroup?.[0]?.attributionIndex?.push?.(2);
	$.log(`✅ Set TileGroup`, "");
	return body;
};

function setTileSet(body = {}, settings = {}, caches = {}) {
	$.log(`☑️ Set TileSet`, "");
	// 全部已知图源
	const tileSet = {
		"CN": [{"baseURL":"https://gspe19-cn-ssl.ls.apple.com/tiles?flags=8","style":1,"validVersion":[{"identifier":2107,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":31,"maxY":31,"minZ":5,"maxZ":5},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[{"countryCode":"AE","region":"AE"},{"countryCode":"AE","region":"SA"},{"countryCode":"IN","region":"IN"},{"countryCode":"JP","region":"JP"},{"countryCode":"KR","region":"KR"},{"countryCode":"MA","region":"MA"},{"countryCode":"RU","region":"RU"},{"countryCode":"SA","region":"AE"},{"countryCode":"SA","region":"SA"}],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe11-2-cn-ssl.ls.apple.com/2/tiles","style":7,"validVersion":[{"identifier":51,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":7},{"minX":179,"minY":80,"maxX":224,"maxY":128,"minZ":8,"maxZ":8},{"minX":359,"minY":161,"maxX":449,"maxY":257,"minZ":9,"maxZ":9},{"minX":719,"minY":323,"maxX":898,"maxY":915,"minZ":10,"maxZ":10},{"minX":1438,"minY":646,"maxX":1797,"maxY":1031,"minZ":11,"maxZ":11},{"minX":2876,"minY":1292,"maxX":3594,"maxY":2062,"minZ":12,"maxZ":12},{"minX":5752,"minY":2584,"maxX":7188,"maxY":4124,"minZ":13,"maxZ":13},{"minX":11504,"minY":5168,"maxX":14376,"maxY":8248,"minZ":14,"maxZ":14},{"minX":23008,"minY":10336,"maxX":28752,"maxY":16496,"minZ":15,"maxZ":15},{"minX":46016,"minY":20672,"maxX":57504,"maxY":32992,"minZ":16,"maxZ":16},{"minX":92032,"minY":41344,"maxX":115008,"maxY":65984,"minZ":17,"maxZ":17},{"minX":184064,"minY":82668,"maxX":230016,"maxY":131976,"minZ":18,"maxZ":18}],"timeToLiveSeconds":0,"genericTile":[{"tileType":2,"textureIndex":0,"resourceIndex":1971}],"supportedLanguagesVersion":0}],"scale":1,"size":1,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe11-2-cn-ssl.ls.apple.com/2/tiles","style":7,"validVersion":[{"identifier":51,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":7},{"minX":179,"minY":80,"maxX":224,"maxY":128,"minZ":8,"maxZ":8},{"minX":359,"minY":161,"maxX":449,"maxY":257,"minZ":9,"maxZ":9},{"minX":719,"minY":323,"maxX":898,"maxY":915,"minZ":10,"maxZ":10},{"minX":1438,"minY":646,"maxX":1797,"maxY":1031,"minZ":11,"maxZ":11},{"minX":2876,"minY":1292,"maxX":3594,"maxY":2062,"minZ":12,"maxZ":12},{"minX":5752,"minY":2584,"maxX":7188,"maxY":4124,"minZ":13,"maxZ":13},{"minX":11504,"minY":5168,"maxX":14376,"maxY":8248,"minZ":14,"maxZ":14},{"minX":23008,"minY":10336,"maxX":28752,"maxY":16496,"minZ":15,"maxZ":15},{"minX":46016,"minY":20672,"maxX":57504,"maxY":32992,"minZ":16,"maxZ":16},{"minX":92032,"minY":41344,"maxX":115008,"maxY":65984,"minZ":17,"maxZ":17},{"minX":184064,"minY":82668,"maxX":230016,"maxY":131976,"minZ":18,"maxZ":18}],"timeToLiveSeconds":0,"genericTile":[{"tileType":2,"textureIndex":0,"resourceIndex":1971}],"supportedLanguagesVersion":0}],"scale":2,"size":1,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-cn-ssl.ls.apple.com/tiles?flags=1","style":11,"validVersion":[{"identifier":469,"availableTile":[{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe12-cn-ssl.ls.apple.com/traffic","style":12,"validVersion":[{"identifier":2106,"availableTile":[{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12}],"timeToLiveSeconds":120,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-cn-ssl.ls.apple.com/tiles?flags=2","style":13,"validVersion":[{"identifier":2087,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":2},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":10},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":15},{"minX":0,"minY":0,"maxX":65535,"maxY":65535,"minZ":16,"maxZ":16},{"minX":0,"minY":0,"maxX":131071,"maxY":131071,"minZ":17,"maxZ":17}],"timeToLiveSeconds":604800,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-cn-ssl.ls.apple.com/tiles","style":18,"validVersion":[{"identifier":2107,"availableTile":[{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-cn-ssl.ls.apple.com/tiles","style":20,"validVersion":[{"identifier":2107,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":31,"maxY":31,"minZ":5,"maxZ":5},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":2047,"maxY":2047,"minZ":11,"maxZ":11},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[{"countryCode":"AE","region":"AE"},{"countryCode":"AE","region":"SA"},{"countryCode":"IN","region":"IN"},{"countryCode":"JP","region":"JP"},{"countryCode":"KR","region":"KR"},{"countryCode":"MA","region":"MA"},{"countryCode":"RU","region":"RU"},{"countryCode":"SA","region":"AE"},{"countryCode":"SA","region":"SA"}],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-cn-ssl.ls.apple.com/tiles","style":22,"validVersion":[{"identifier":2107,"availableTile":[{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-cn-ssl.ls.apple.com/tiles","style":30,"validVersion":[{"identifier":145,"availableTile":[{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15},{"minX":0,"minY":0,"maxX":262143,"maxY":262143,"minZ":18,"maxZ":18}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-cn-ssl.ls.apple.com/tiles?flags=2","style":37,"validVersion":[{"identifier":1902,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":31,"maxY":31,"minZ":5,"maxZ":5},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":2047,"maxY":2047,"minZ":11,"maxZ":11},{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-cn-ssl.ls.apple.com/tiles","style":47,"validVersion":[{"identifier":1902,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":31,"maxY":31,"minZ":5,"maxZ":5},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":2047,"maxY":2047,"minZ":11,"maxZ":11},{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-cn-ssl.ls.apple.com/tiles","style":48,"validVersion":[{"identifier":1902,"availableTile":[{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-cn-ssl.ls.apple.com/tiles","style":53,"validVersion":[{"identifier":2107,"availableTile":[{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-cn-ssl.ls.apple.com/tiles","style":54,"validVersion":[{"identifier":2107,"availableTile":[{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-cn-ssl.ls.apple.com/tiles","style":56,"validVersion":[{"identifier":15,"availableTile":[{"minX":0,"minY":0,"maxX":131071,"maxY":131071,"minZ":17,"maxZ":17}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gsp76-cn-ssl.ls.apple.com/api/tile","style":57,"validVersion":[{"identifier":0,"availableTile":[{"minX":0,"minY":0,"maxX":131071,"maxY":131071,"minZ":17,"maxZ":17}],"timeToLiveSeconds":3600,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-cn-ssl.ls.apple.com/tiles","style":58,"validVersion":[{"identifier":136,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":31,"maxY":31,"minZ":5,"maxZ":5},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":2047,"maxY":2047,"minZ":11,"maxZ":11},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15},{"minX":0,"minY":0,"maxX":65535,"maxY":65535,"minZ":16,"maxZ":16},{"minX":0,"minY":0,"maxX":131071,"maxY":131071,"minZ":17,"maxZ":17}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-cn-ssl.ls.apple.com/asset/v3/model","style":59,"validVersion":[{"identifier":79,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-cn-ssl.ls.apple.com/asset/v3/material","style":60,"validVersion":[{"identifier":29,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":31,"maxY":31,"minZ":5,"maxZ":5},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-cn-ssl.ls.apple.com/tiles","style":61,"validVersion":[{"identifier":29,"availableTile":[{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-cn-ssl.ls.apple.com/tiles","style":64,"validVersion":[{"identifier":15,"availableTile":[{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe79-cn-ssl.ls.apple.com/65/v1","style":65,"validVersion":[{"identifier":2,"availableTile":[{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8}],"timeToLiveSeconds":3600,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-cn-ssl.ls.apple.com/tiles","style":66,"validVersion":[{"identifier":2107,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":31,"maxY":31,"minZ":5,"maxZ":5},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":2047,"maxY":2047,"minZ":11,"maxZ":11},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[{"countryCode":"AE","region":"AE"},{"countryCode":"AE","region":"SA"},{"countryCode":"IN","region":"IN"},{"countryCode":"JP","region":"JP"},{"countryCode":"KR","region":"KR"},{"countryCode":"MA","region":"MA"},{"countryCode":"RU","region":"RU"},{"countryCode":"SA","region":"AE"},{"countryCode":"SA","region":"SA"}],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-cn-ssl.ls.apple.com/tiles","style":67,"validVersion":[{"identifier":2107,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":31,"maxY":31,"minZ":5,"maxZ":5},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[{"countryCode":"AE","region":"AE"},{"countryCode":"AE","region":"SA"},{"countryCode":"IN","region":"IN"},{"countryCode":"JP","region":"JP"},{"countryCode":"KR","region":"KR"},{"countryCode":"MA","region":"MA"},{"countryCode":"RU","region":"RU"},{"countryCode":"SA","region":"AE"},{"countryCode":"SA","region":"SA"}],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-cn-ssl.ls.apple.com/tiles","style":68,"validVersion":[{"identifier":2087,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15},{"minX":0,"minY":0,"maxX":65535,"maxY":65535,"minZ":16,"maxZ":16},{"minX":0,"minY":0,"maxX":131071,"maxY":131071,"minZ":17,"maxZ":17}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-cn-ssl.ls.apple.com/tiles","style":69,"validVersion":[{"identifier":20,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"","style":72,"validVersion":[{"identifier":2,"availableTile":[{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13}],"timeToLiveSeconds":3600,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-cn-ssl.ls.apple.com/tiles","style":73,"validVersion":[{"identifier":469,"availableTile":[{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe79-cn-ssl.ls.apple.com/sis/v1","style":76,"validVersion":[{"identifier":0,"availableTile":[{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":524287,"maxY":524287,"minZ":19,"maxZ":19}],"timeToLiveSeconds":86400,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-cn-ssl.ls.apple.com/tiles","style":79,"validVersion":[{"identifier":28,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":31,"maxY":31,"minZ":5,"maxZ":5},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-2-cn-ssl.ls.apple.com/poi_update","style":84,"validVersion":[{"identifier":2087,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15},{"minX":0,"minY":0,"maxX":65535,"maxY":65535,"minZ":16,"maxZ":16},{"minX":0,"minY":0,"maxX":131071,"maxY":131071,"minZ":17,"maxZ":17}],"timeToLiveSeconds":1800,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]}],
		"XX": [{"baseURL":"https://gspe19-ssl.ls.apple.com/tile.vf?flags=8","style":1,"validVersion":[{"identifier":16013285,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":31,"maxY":31,"minZ":5,"maxZ":5},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","es-US","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[{"countryCode":"AE","region":"AE"},{"countryCode":"AE","region":"SA"},{"countryCode":"IN","region":""},{"countryCode":"JP","region":"JP"},{"countryCode":"KR","region":"KR"},{"countryCode":"MA","region":"MA"},{"countryCode":"RU","region":"RU"},{"countryCode":"SA","region":"AE"},{"countryCode":"SA","region":"SA"},{"countryCode":"VN","region":"VN"}],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf?flags=8","style":1,"validVersion":[{"identifier":16014045,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":31,"maxY":31,"minZ":5,"maxZ":5},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","es-US","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[{"countryCode":"AE","region":"AE"},{"countryCode":"AE","region":"SA"},{"countryCode":"IN","region":""},{"countryCode":"JP","region":"JP"},{"countryCode":"KR","region":"KR"},{"countryCode":"MA","region":"MA"},{"countryCode":"RU","region":"RU"},{"countryCode":"SA","region":"AE"},{"countryCode":"SA","region":"SA"},{"countryCode":"VN","region":"VN"}],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe11-ssl.ls.apple.com/tile","style":7,"validVersion":[{"identifier":9701,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":22}],"timeToLiveSeconds":0,"genericTile":[{"tileType":2,"textureIndex":0,"resourceIndex":1971}],"supportedLanguagesVersion":0}],"scale":1,"size":1,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe11-ssl.ls.apple.com/tile","style":7,"validVersion":[{"identifier":9701,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":22}],"timeToLiveSeconds":0,"genericTile":[{"tileType":2,"textureIndex":0,"resourceIndex":1971}],"supportedLanguagesVersion":0}],"scale":2,"size":1,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-ssl.ls.apple.com/tile.vf?flags=1","style":11,"validVersion":[{"identifier":16013285,"availableTile":[{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf?flags=1","style":11,"validVersion":[{"identifier":16014045,"availableTile":[{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe12-ssl.ls.apple.com/traffic","style":12,"validVersion":[{"identifier":16013285,"availableTile":[{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12}],"timeToLiveSeconds":120,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe12-kittyhawk-ssl.ls.apple.com/traffic","style":12,"validVersion":[{"identifier":16014045,"availableTile":[{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12}],"timeToLiveSeconds":120,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe19-ssl.ls.apple.com/tile.vf?flags=2","style":13,"validVersion":[{"identifier":16013285,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15},{"minX":0,"minY":0,"maxX":65535,"maxY":65535,"minZ":16,"maxZ":16},{"minX":0,"minY":0,"maxX":131071,"maxY":131071,"minZ":17,"maxZ":17}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","es-US","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf?flags=2","style":13,"validVersion":[{"identifier":16014045,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15},{"minX":0,"minY":0,"maxX":65535,"maxY":65535,"minZ":16,"maxZ":16},{"minX":0,"minY":0,"maxX":131071,"maxY":131071,"minZ":17,"maxZ":17}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","es-US","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe11-ssl.ls.apple.com/tile","style":14,"validVersion":[{"identifier":1,"availableTile":[],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe11-ssl.ls.apple.com/tile","style":15,"validVersion":[{"identifier":1,"availableTile":[],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe11-ssl.ls.apple.com/tile","style":16,"validVersion":[{"identifier":1,"availableTile":[],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe11-ssl.ls.apple.com/tile","style":17,"validVersion":[{"identifier":27,"availableTile":[{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":2047,"maxY":2047,"minZ":11,"maxZ":11},{"minX":408,"minY":2760,"maxX":2583,"maxY":3659,"minZ":13,"maxZ":13},{"minX":3848,"minY":2332,"maxX":4535,"maxY":3235,"minZ":13,"maxZ":13}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":1,"size":1,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-ssl.ls.apple.com/tile.vf","style":18,"validVersion":[{"identifier":16013285,"availableTile":[{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","es-US","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf","style":18,"validVersion":[{"identifier":16014045,"availableTile":[{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","es-US","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe19-ssl.ls.apple.com/tile.vf","style":20,"validVersion":[{"identifier":16013285,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":31,"maxY":31,"minZ":5,"maxZ":5},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":2047,"maxY":2047,"minZ":11,"maxZ":11},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","es-US","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[{"countryCode":"AE","region":"AE"},{"countryCode":"AE","region":"SA"},{"countryCode":"IN","region":""},{"countryCode":"JP","region":"JP"},{"countryCode":"KR","region":"KR"},{"countryCode":"MA","region":"MA"},{"countryCode":"RU","region":"RU"},{"countryCode":"SA","region":"AE"},{"countryCode":"SA","region":"SA"},{"countryCode":"VN","region":"VN"}],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf","style":20,"validVersion":[{"identifier":16014045,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":31,"maxY":31,"minZ":5,"maxZ":5},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":2047,"maxY":2047,"minZ":11,"maxZ":11},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","es-US","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[{"countryCode":"AE","region":"AE"},{"countryCode":"AE","region":"SA"},{"countryCode":"IN","region":""},{"countryCode":"JP","region":"JP"},{"countryCode":"KR","region":"KR"},{"countryCode":"MA","region":"MA"},{"countryCode":"RU","region":"RU"},{"countryCode":"SA","region":"AE"},{"countryCode":"SA","region":"SA"},{"countryCode":"VN","region":"VN"}],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe19-ssl.ls.apple.com/tile.vf","style":22,"validVersion":[{"identifier":16013285,"availableTile":[{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":2047,"maxY":2047,"minZ":11,"maxZ":11},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf","style":22,"validVersion":[{"identifier":16014045,"availableTile":[{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":2047,"maxY":2047,"minZ":11,"maxZ":11},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe19-ssl.ls.apple.com/tile.vf","style":30,"validVersion":[{"identifier":16013285,"availableTile":[{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15},{"minX":0,"minY":0,"maxX":262143,"maxY":262143,"minZ":18,"maxZ":18}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","es-US","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf","style":30,"validVersion":[{"identifier":16014045,"availableTile":[{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15},{"minX":0,"minY":0,"maxX":262143,"maxY":262143,"minZ":18,"maxZ":18}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","es-US","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe11-ssl.ls.apple.com/tile","style":33,"validVersion":[{"identifier":4,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":7}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":1,"size":1,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-ssl.ls.apple.com/tile.vf?flags=2","style":37,"validVersion":[{"identifier":16013285,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":31,"maxY":31,"minZ":5,"maxZ":5},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":2047,"maxY":2047,"minZ":11,"maxZ":11},{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","es-US","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf?flags=2","style":37,"validVersion":[{"identifier":16014045,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":31,"maxY":31,"minZ":5,"maxZ":5},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":2047,"maxY":2047,"minZ":11,"maxZ":11},{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","es-US","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe11-ssl.ls.apple.com/tile","style":42,"validVersion":[{"identifier":1,"availableTile":[],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe11-ssl.ls.apple.com/tile","style":43,"validVersion":[{"identifier":1,"availableTile":[],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe11-ssl.ls.apple.com/tile","style":44,"validVersion":[{"identifier":1,"availableTile":[],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-ssl.ls.apple.com/tile.vf","style":47,"validVersion":[{"identifier":16013285,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":31,"maxY":31,"minZ":5,"maxZ":5},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":2047,"maxY":2047,"minZ":11,"maxZ":11},{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","es-US","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf","style":47,"validVersion":[{"identifier":16014045,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":31,"maxY":31,"minZ":5,"maxZ":5},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":2047,"maxY":2047,"minZ":11,"maxZ":11},{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","es-US","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe19-ssl.ls.apple.com/tile.vf","style":48,"validVersion":[{"identifier":11201196,"availableTile":[{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf","style":48,"validVersion":[{"identifier":11201196,"availableTile":[{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe11-ssl.ls.apple.com/tile","style":52,"validVersion":[{"identifier":1,"availableTile":[],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-ssl.ls.apple.com/tile.vf","style":53,"validVersion":[{"identifier":16013285,"availableTile":[{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","es-US","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf","style":53,"validVersion":[{"identifier":16014045,"availableTile":[{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","es-US","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe19-ssl.ls.apple.com/tile.vf","style":54,"validVersion":[{"identifier":13658945,"availableTile":[{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf","style":54,"validVersion":[{"identifier":13659050,"availableTile":[{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe19-ssl.ls.apple.com/tile.vf","style":56,"validVersion":[{"identifier":16013285,"availableTile":[{"minX":0,"minY":0,"maxX":131071,"maxY":131071,"minZ":17,"maxZ":17}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","es-US","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf","style":56,"validVersion":[{"identifier":16014045,"availableTile":[{"minX":0,"minY":0,"maxX":131071,"maxY":131071,"minZ":17,"maxZ":17}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","es-US","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe76-ssl.ls.apple.com/api/tile","style":57,"validVersion":[{"identifier":0,"availableTile":[{"minX":0,"minY":0,"maxX":131071,"maxY":131071,"minZ":17,"maxZ":17}],"timeToLiveSeconds":3600,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-ssl.ls.apple.com/tile.vf","style":58,"validVersion":[{"identifier":16013285,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":31,"maxY":31,"minZ":5,"maxZ":5},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":2047,"maxY":2047,"minZ":11,"maxZ":11},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15},{"minX":0,"minY":0,"maxX":65535,"maxY":65535,"minZ":16,"maxZ":16},{"minX":0,"minY":0,"maxX":131071,"maxY":131071,"minZ":17,"maxZ":17}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf","style":58,"validVersion":[{"identifier":16014045,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":31,"maxY":31,"minZ":5,"maxZ":5},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":2047,"maxY":2047,"minZ":11,"maxZ":11},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15},{"minX":0,"minY":0,"maxX":65535,"maxY":65535,"minZ":16,"maxZ":16},{"minX":0,"minY":0,"maxX":131071,"maxY":131071,"minZ":17,"maxZ":17}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe19-ssl.ls.apple.com/asset/v3/model","style":59,"validVersion":[{"identifier":16013285,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-kittyhawk-ssl.ls.apple.com/asset/v3/model","style":59,"validVersion":[{"identifier":16014045,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe19-ssl.ls.apple.com/asset/v3/material","style":60,"validVersion":[{"identifier":16013285,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":31,"maxY":31,"minZ":5,"maxZ":5},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-kittyhawk-ssl.ls.apple.com/asset/v3/material","style":60,"validVersion":[{"identifier":16014045,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":31,"maxY":31,"minZ":5,"maxZ":5},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe19-ssl.ls.apple.com/tile.vf","style":61,"validVersion":[{"identifier":16013285,"availableTile":[{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf","style":61,"validVersion":[{"identifier":16014045,"availableTile":[{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe19-ssl.ls.apple.com/tile.vf","style":62,"validVersion":[{"identifier":16013285,"availableTile":[{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf","style":62,"validVersion":[{"identifier":16014045,"availableTile":[{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe19-ssl.ls.apple.com/tile.vf","style":64,"validVersion":[{"identifier":16013285,"availableTile":[{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","es-US","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf","style":64,"validVersion":[{"identifier":16014045,"availableTile":[{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","es-US","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe79-ssl.ls.apple.com/65/v1","style":65,"validVersion":[{"identifier":2,"availableTile":[{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8}],"timeToLiveSeconds":3600,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-ssl.ls.apple.com/tile.vf","style":66,"validVersion":[{"identifier":16013285,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":31,"maxY":31,"minZ":5,"maxZ":5},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":2047,"maxY":2047,"minZ":11,"maxZ":11},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","es-US","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[{"countryCode":"AE","region":"AE"},{"countryCode":"AE","region":"SA"},{"countryCode":"IN","region":""},{"countryCode":"JP","region":"JP"},{"countryCode":"KR","region":"KR"},{"countryCode":"MA","region":"MA"},{"countryCode":"RU","region":"RU"},{"countryCode":"SA","region":"AE"},{"countryCode":"SA","region":"SA"},{"countryCode":"VN","region":"VN"}],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf","style":66,"validVersion":[{"identifier":16014045,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":31,"maxY":31,"minZ":5,"maxZ":5},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":2047,"maxY":2047,"minZ":11,"maxZ":11},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","es-US","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[{"countryCode":"AE","region":"AE"},{"countryCode":"AE","region":"SA"},{"countryCode":"IN","region":""},{"countryCode":"JP","region":"JP"},{"countryCode":"KR","region":"KR"},{"countryCode":"MA","region":"MA"},{"countryCode":"RU","region":"RU"},{"countryCode":"SA","region":"AE"},{"countryCode":"SA","region":"SA"},{"countryCode":"VN","region":"VN"}],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe19-ssl.ls.apple.com/tile.vf","style":67,"validVersion":[{"identifier":16013285,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":31,"maxY":31,"minZ":5,"maxZ":5},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","es-US","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[{"countryCode":"AE","region":"AE"},{"countryCode":"AE","region":"SA"},{"countryCode":"IN","region":""},{"countryCode":"JP","region":"JP"},{"countryCode":"KR","region":"KR"},{"countryCode":"MA","region":"MA"},{"countryCode":"RU","region":"RU"},{"countryCode":"SA","region":"AE"},{"countryCode":"SA","region":"SA"},{"countryCode":"VN","region":"VN"}],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf","style":67,"validVersion":[{"identifier":16014045,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":31,"maxY":31,"minZ":5,"maxZ":5},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","es-US","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[{"countryCode":"AE","region":"AE"},{"countryCode":"AE","region":"SA"},{"countryCode":"IN","region":""},{"countryCode":"JP","region":"JP"},{"countryCode":"KR","region":"KR"},{"countryCode":"MA","region":"MA"},{"countryCode":"RU","region":"RU"},{"countryCode":"SA","region":"AE"},{"countryCode":"SA","region":"SA"},{"countryCode":"VN","region":"VN"}],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe19-ssl.ls.apple.com/tile.vf","style":68,"validVersion":[{"identifier":16013285,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15},{"minX":0,"minY":0,"maxX":65535,"maxY":65535,"minZ":16,"maxZ":16},{"minX":0,"minY":0,"maxX":131071,"maxY":131071,"minZ":17,"maxZ":17}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","es-US","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf","style":68,"validVersion":[{"identifier":16014045,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15},{"minX":0,"minY":0,"maxX":65535,"maxY":65535,"minZ":16,"maxZ":16},{"minX":0,"minY":0,"maxX":131071,"maxY":131071,"minZ":17,"maxZ":17}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","es-US","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe19-ssl.ls.apple.com/tile.vf","style":69,"validVersion":[{"identifier":16013285,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf","style":69,"validVersion":[{"identifier":16014045,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe76-ssl.ls.apple.com/api/vltile","style":70,"validVersion":[{"identifier":1,"availableTile":[{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13}],"timeToLiveSeconds":86400,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe92-ssl.ls.apple.com","style":71,"validVersion":[{"identifier":1,"availableTile":[{"minX":0,"minY":0,"maxX":2097151,"maxY":2097151,"minZ":21,"maxZ":21}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe79-ssl.ls.apple.com/72/v2","style":72,"validVersion":[{"identifier":2,"availableTile":[{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13}],"timeToLiveSeconds":3600,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-ssl.ls.apple.com/tile.vf","style":73,"validVersion":[{"identifier":16013285,"availableTile":[{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf","style":73,"validVersion":[{"identifier":16014045,"availableTile":[{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe79-ssl.ls.apple.com/pbz/v1","style":74,"validVersion":[{"identifier":0,"availableTile":[{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":2097151,"maxY":2097151,"minZ":21,"maxZ":21}],"timeToLiveSeconds":86400,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe79-ssl.ls.apple.com/pbz/v1","style":75,"validVersion":[{"identifier":0,"availableTile":[{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":131071,"maxY":131071,"minZ":17,"maxZ":17}],"timeToLiveSeconds":86400,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe79-ssl.ls.apple.com/sis/v1","style":76,"validVersion":[{"identifier":0,"availableTile":[{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":524287,"maxY":524287,"minZ":19,"maxZ":19}],"timeToLiveSeconds":86400,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-ssl.ls.apple.com/tile.vf","style":78,"validVersion":[{"identifier":16013285,"availableTile":[{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf","style":78,"validVersion":[{"identifier":16014045,"availableTile":[{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe19-ssl.ls.apple.com/tile.vf","style":79,"validVersion":[{"identifier":16013285,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":31,"maxY":31,"minZ":5,"maxZ":5},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf","style":79,"validVersion":[{"identifier":16014045,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":31,"maxY":31,"minZ":5,"maxZ":5},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe79-ssl.ls.apple.com/sdm/v1","style":80,"validVersion":[{"identifier":0,"availableTile":[{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":65535,"maxY":65535,"minZ":16,"maxZ":16}],"timeToLiveSeconds":86400,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-ssl.ls.apple.com/asset/v3/model-occlusion","style":82,"validVersion":[{"identifier":16013285,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-kittyhawk-ssl.ls.apple.com/asset/v3/model-occlusion","style":82,"validVersion":[{"identifier":16014045,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe19-2-ssl.ls.apple.com/poi_update","style":84,"validVersion":[{"identifier":16013285,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15},{"minX":0,"minY":0,"maxX":65535,"maxY":65535,"minZ":16,"maxZ":16},{"minX":0,"minY":0,"maxX":131071,"maxY":131071,"minZ":17,"maxZ":17}],"timeToLiveSeconds":1800,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","es-US","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-2-ssl.ls.apple.com/poi_update","style":84,"validVersion":[{"identifier":16014045,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15},{"minX":0,"minY":0,"maxX":65535,"maxY":65535,"minZ":16,"maxZ":16},{"minX":0,"minY":0,"maxX":131071,"maxY":131071,"minZ":17,"maxZ":17}],"timeToLiveSeconds":1800,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","es-US","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe19-2-ssl.ls.apple.com/live_tile.vf","style":85,"validVersion":[{"identifier":16013285,"availableTile":[{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-2-ssl.ls.apple.com/live_tile.vf","style":85,"validVersion":[{"identifier":16014045,"availableTile":[{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe19-ssl.ls.apple.com/tile.vf","style":87,"validVersion":[{"identifier":16013285,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":31,"maxY":31,"minZ":5,"maxZ":5},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":2047,"maxY":2047,"minZ":11,"maxZ":11},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","es-US","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf","style":87,"validVersion":[{"identifier":16014045,"availableTile":[{"minX":0,"minY":0,"maxX":1,"maxY":1,"minZ":1,"maxZ":1},{"minX":0,"minY":0,"maxX":3,"maxY":3,"minZ":2,"maxZ":2},{"minX":0,"minY":0,"maxX":7,"maxY":7,"minZ":3,"maxZ":3},{"minX":0,"minY":0,"maxX":15,"maxY":15,"minZ":4,"maxZ":4},{"minX":0,"minY":0,"maxX":31,"maxY":31,"minZ":5,"maxZ":5},{"minX":0,"minY":0,"maxX":63,"maxY":63,"minZ":6,"maxZ":6},{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":255,"maxY":255,"minZ":8,"maxZ":8},{"minX":0,"minY":0,"maxX":511,"maxY":511,"minZ":9,"maxZ":9},{"minX":0,"minY":0,"maxX":1023,"maxY":1023,"minZ":10,"maxZ":10},{"minX":0,"minY":0,"maxX":2047,"maxY":2047,"minZ":11,"maxZ":11},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12},{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":16383,"maxY":16383,"minZ":14,"maxZ":14},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":1}],"scale":0,"size":2,"supportedLanguage":[{"identifier":1,"language":["ar","ca","cs","da","de","el","en","en-AU","en-GB","es","es-MX","es-US","fi","fr","fr-CA","he","hi","hr","hu","id","it","ja","ko","ms","nb","nl","pl","pt","pt-PT","ro","ru","sk","sv","th","tr","uk","vi","zh-Hans","zh-Hant","zh-HK"]}],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe19-ssl.ls.apple.com/tile.vf","style":88,"validVersion":[{"identifier":16013285,"availableTile":[{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf","style":88,"validVersion":[{"identifier":16014045,"availableTile":[{"minX":0,"minY":0,"maxX":127,"maxY":127,"minZ":7,"maxZ":7},{"minX":0,"minY":0,"maxX":4095,"maxY":4095,"minZ":12,"maxZ":12}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1},{"baseURL":"https://gspe79-ssl.ls.apple.com/ray/v1","style":89,"validVersion":[{"identifier":1,"availableTile":[{"minX":0,"minY":0,"maxX":262143,"maxY":262143,"minZ":18,"maxZ":18}],"timeToLiveSeconds":86400,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":1,"supportsMultipathTCP":false,"deviceSKUWhitelist":[]},{"baseURL":"https://gspe19-ssl.ls.apple.com/tile.vf","style":90,"validVersion":[{"identifier":16013285,"availableTile":[{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":0},{"baseURL":"https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf","style":90,"validVersion":[{"identifier":16014045,"availableTile":[{"minX":0,"minY":0,"maxX":8191,"maxY":8191,"minZ":13,"maxZ":13},{"minX":0,"minY":0,"maxX":32767,"maxY":32767,"minZ":15,"maxZ":15}],"timeToLiveSeconds":0,"genericTile":[],"supportedLanguagesVersion":0}],"scale":0,"size":2,"supportedLanguage":[],"countryRegionWhitelist":[],"checksumType":0,"requestStyle":0,"supportsMultipathTCP":false,"deviceSKUWhitelist":[],"dataSet":1}]
	};
	/*
	// 填补数据组
	tileSet.CN = tileSet.CN.map(tile => {
		tile.dataSet = 2;
		return tile;
	});
	*/
	// 填补空缺图源
	tileSet.XX.forEach(tile => {
		if (!body.tileSet.some(i => i.style === tile.style)) body.tileSet.push(tile);
	});
	// 按需更改图源
	body.tileSet = body.tileSet.map(tile => {
		switch (tile.style) {
			case 1: // VECTOR_STANDARD
				switch (settings.TileSet.Map) {
					case "AUTO":
					default:
						break;
					case "CN":
						tile = tileSet.CN.find(i => i.style === 1);
						break;
					case "XX":
						tile = tileSet.XX.find(i => i.style === 1);
						break;
				};
				break;
			case 12: // VECTOR_TRAFFIC
				switch (settings.TileSet.Traffic) {
					case "AUTO":
					default:
						break;
					case "CN":
						tile = tileSet.CN.find(i => i.style === 12);
						break;
					case "XX":
						tile = tileSet.XX.find(i => i.style === 12);
						break;
				};
				break;
			case 13: // VECTOR_POI
				switch (settings.TileSet.POI) {
					case "AUTO":
					default:
						break;
					case "CN":
						tile = tileSet.CN.find(i => i.style === 13);
						break;
					case "XX":
						tile = tileSet.XX.find(i => i.style === 13);
						break;
				};
				break;
			case 20: // VECTOR_ROADS
				switch (settings.TileSet.Map) {
					case "AUTO":
					default:
						break;
					case "CN":
						tile = tileSet.CN.find(i => i.style === 20);
						break;
					case "XX":
						tile = tileSet.XX.find(i => i.style === 20);
						break;
				};
				break;
			case 30: // VECTOR_VENUES
				switch (settings.TileSet.Map) {
					case "AUTO":
					default:
						break;
					case "CN":
						tile = tileSet.CN.find(i => i.style === 30);
						break;
					case "XX":
						tile = tileSet.XX.find(i => i.style === 30);
						break;
				};
				break;
			case 52: // FLYOVER_METADATA
				switch (settings.TileSet.Flyover) {
					case "AUTO":
					default:
						tile = tileSet.XX.find(i => i.style === 52);
						break;
					case "CN":
						tile = tileSet.CN.find(i => i.style === 52);
						break;
					case "XX":
						tile = tileSet.XX.find(i => i.style === 52);
						break;
				};
				break;
			case 56: // VECTOR_STREET_POI
				switch (settings.TileSet.POI) {
					case "AUTO":
					default:
						break;
					case "CN":
						tile = tileSet.CN.find(i => i.style === 56);
						break;
					case "XX":
						tile = tileSet.XX.find(i => i.style === 56);
						break;
				};
				break;
			case 57: // MUNIN_METADATA
				switch (settings.TileSet.Munin) {
					case "AUTO":
					default:
						break;
					case "CN":
						tile = tileSet.CN.find(i => i.style === 57);
						break;
					case "XX":
						tile = tileSet.XX.find(i => i.style === 57);
						break;
				};
				break;
			case 68: // DAVINCI_DEV9
				switch (settings.TileSet.Map) {
					case "AUTO":
					default:
						break;
					case "CN":
						tile = tileSet.CN.find(i => i.style === 68);
						break;
					case "XX":
						tile = tileSet.XX.find(i => i.style === 68);
						break;
				};
				break;
			case 73: // VECTOR_BUILDINGS_V2
				switch (settings.TileSet.Map) {
					case "AUTO":
					default:
						break;
					case "CN":
						tile = tileSet.CN.find(i => i.style === 73);
						break;
					case "XX":
						tile = tileSet.XX.find(i => i.style === 73);
						break;
				};
				break;
			case 84: // VECTOR_POI_V2_UPDATE
				switch (settings.TileSet.POI) {
					case "AUTO":
					default:
						break;
					case "CN":
						tile = tileSet.CN.find(i => i.style === 84);
						break;
					case "XX":
						tile = tileSet.XX.find(i => i.style === 84);
						break;
				};
				break;
		};
		return tile;
	});
	$.log(`✅ Set TileSet`, "");
	return body;
};

function setDataSet(body = {}, settings = {}, configs = {}) {
	$.log(`☑️ Set DataSet`, "");
	_.set(body, "dataSet[0].identifier", 0);
	_.set(body, "dataSet[0].dataSetDescription", "TomTom");
	_.set(body, "dataSet[1].identifier", 1);
	_.set(body, "dataSet[1].dataSetDescription", "KittyHawk");
	_.set(body, "dataSet[2].identifier", 2);
	_.set(body, "dataSet[2].dataSetDescription", "AutoNavi");
	$.log(`✅ Set DataSet`, "");
	return body;
};

function setUrlInfoSet(body = {}, settings = {}, configs = {}) {
	$.log(`☑️ Set UrlInfoSet`, "");
	switch (settings.GeoManifest.Dynamic.Config.CountryCode.default) {
		case "AUTO":
			// Alternate Resources
			body.urlInfoSet[0].alternateResourcesURL.push({ url: "https://limit-rule.is.autonavi.com/lpr/rules/download", supportsMultipathTCP: false });
			break;
		case "CN":
			// Address Correction Init
			_.set(body, "urlInfoSet[0].addressCorrectionInitURL.url", "https://gsp47-ssl.ls.apple.com/ac");
			_.set(body, "urlInfoSet[0].addressCorrectionInitURL.supportsMultipathTCP", false);
			// Address Correction Update
			_.set(body, "urlInfoSet[0].addressCorrectionUpdateURL.url", "https://gsp47-ssl.ls.apple.com/ac");
			_.set(body, "urlInfoSet[0].addressCorrectionUpdateURL.supportsMultipathTCP", false);
			// Business Portal Base URL
			_.set(body, "urlInfoSet[0].businessPortalBaseURL.url", "https://mapsconnect.apple.com/business/ui/claimPlace");
			_.set(body, "urlInfoSet[0].businessPortalBaseURL.supportsMultipathTCP", false);
			// Proactive Routing
			_.set(body, "urlInfoSet[0].proactiveRoutingURL.url", "https://gsp-ssl-commute.ls.apple.com/directions.arpc");
			_.set(body, "urlInfoSet[0].proactiveRoutingURL.supportsMultipathTCP", true);
			_.set(body, "urlInfoSet[0].proactiveRoutingURL.alternativeMultipathTCPPort", 5228);
			// Blue POI
			_.set(body, "urlInfoSet[0].bluePOIDispatcherURL.url", "https://gsp57-ssl-locus.ls.apple.com/dispatcher.arpc");
			_.set(body, "urlInfoSet[0].bluePOIDispatcherURL.supportsMultipathTCP", true);
			_.set(body, "urlInfoSet[0].bluePOIDispatcherURL.alternativeMultipathTCPPort", 5228);
			// Address Correction Tagged Location
			_.set(body, "urlInfoSet[0].addressCorrectionTaggedLocationURL.url", "https://gsp47-ssl.ls.apple.com/ac");
			_.set(body, "urlInfoSet[0].addressCorrectionTaggedLocationURL.supportsMultipathTCP", false);
			// Proactive App Clip
			_.set(body, "urlInfoSet[0].proactiveAppClipURL.url", "https://gspe79-ssl.ls.apple.com/72/v2");
			_.set(body, "urlInfoSet[0].proactiveAppClipURL.supportsMultipathTCP", false);
			// Ratings and Photos Submission URL
			_.set(body, "urlInfoSet[0].enrichmentSubmissionURL.url", "https://sundew.ls.apple.com/v1/feedback/submission.arpc");
			_.set(body, "urlInfoSet[0].enrichmentSubmissionURL.supportsMultipathTCP", false);
			// UGC Log Discard
			_.set(body, "urlInfoSet[0].ugcLogDiscardURL.url", "https://sundew.ls.apple.com/v1/log_message");
			_.set(body, "urlInfoSet[0].ugcLogDiscardURL.supportsMultipathTCP", false);
			// Pressure Probe Data
			_.set(body, "urlInfoSet[0].pressureProbeDataURL.url", "https://gsp10-ssl.ls.apple.com/hvr/cpr");
			_.set(body, "urlInfoSet[0].pressureProbeDataURL.supportsMultipathTCP", false);
			// Network Selection Harvest
			_.set(body, "urlInfoSet[0].networkSelectionHarvestURL.url", "https://gsp10-ssl.ls.apple.com/hvr/strn");
			_.set(body, "urlInfoSet[0].networkSelectionHarvestURL.supportsMultipathTCP", false);
			// bcx Dispatcher
			_.set(body, "urlInfoSet[0].bcxDispatcherURL.url", "https://gsp57-ssl-bcx.ls.apple.com/dispatcher.arpc");
			_.set(body, "urlInfoSet[0].bcxDispatcherURL.supportsMultipathTCP", false);
			break;
		default:
			// Location Shift (polynomial)
			_.set(body, "urlInfoSet[0].polyLocationShiftURL.url", "https://shift.is.autonavi.com/localshift");
			_.set(body, "urlInfoSet[0].polyLocationShiftURL.supportsMultipathTCP", false);
			// Junction Image Service
			_.set(body, "urlInfoSet[0].junctionImageServiceURL.url", "https://direction2.is.autonavi.com/direction");
			_.set(body, "urlInfoSet[0].junctionImageServiceURL.supportsMultipathTCP", false);
			body.urlInfoSet[0].alternateResourcesURL.push({ url: "https://limit-rule.is.autonavi.com/lpr/rules/download", supportsMultipathTCP: false });
			break;
	};
	switch (settings.Config.Announcements.Environment.default) {
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
	switch (settings.UrlInfoSet.Dispatcher) {
		case "AUTO":
		default:
			break;
		case "AutoNavi":
			// PlaceData Dispatcher
			_.set(body, "urlInfoSet[0].dispatcherURL.url", "https://dispatcher.is.autonavi.com/dispatcher");
			_.set(body, "urlInfoSet[0].dispatcherURL.supportsMultipathTCP", false);
			// Background Dispatcher
			_.set(body, "urlInfoSet[0].backgroundDispatcherURL.url", "https://dispatcher.is.autonavi.com/dispatcher");
			_.set(body, "urlInfoSet[0].backgroundDispatcherURL.supportsMultipathTCP", false);
			// Background Reverse Geocoder
			_.set(body, "urlInfoSet[0].backgroundRevGeoURL.url", "https://dispatcher.is.autonavi.com/dispatcher");
			_.set(body, "urlInfoSet[0].backgroundRevGeoURL.supportsMultipathTCP", false);
			// Batch Reverse Geocoder
			_.set(body, "urlInfoSet[0].batchReverseGeocoderPlaceRequestURL.url", "https://dispatcher.is.autonavi.com/dispatcher");
			_.set(body, "urlInfoSet[0].batchReverseGeocoderPlaceRequestURL.supportsMultipathTCP", false);
			break;
		case "Apple":
			// PlaceData Dispatcher
			_.set(body, "urlInfoSet[0].dispatcherURL.url", "https://gsp-ssl.ls.apple.com/dispatcher.arpc");
			_.set(body, "urlInfoSet[0].dispatcherURL.supportsMultipathTCP", true);
			_.set(body, "urlInfoSet[0].dispatcherURL.alternativeMultipathTCPPort", 5228);
			// Background Dispatcher
			_.set(body, "urlInfoSet[0].backgroundDispatcherURL.url", "https://gsp57-ssl-background.ls.apple.com/dispatcher.arpc");
			_.set(body, "urlInfoSet[0].backgroundDispatcherURL.supportsMultipathTCP", true);
			_.set(body, "urlInfoSet[0].backgroundDispatcherURL.alternativeMultipathTCPPort", 5228);
			// Background Reverse Geocoder
			_.set(body, "urlInfoSet[0].backgroundRevGeoURL.url", "https://gsp57-ssl-revgeo.ls.apple.com/dispatcher.arpc");
			_.set(body, "urlInfoSet[0].backgroundRevGeoURL.supportsMultipathTCP", false);
			// Batch Reverse Geocoder
			_.set(body, "urlInfoSet[0].batchReverseGeocoderPlaceRequestURL.url", "https://gsp36-ssl.ls.apple.com/revgeo_pr.arpc");
			_.set(body, "urlInfoSet[0].batchReverseGeocoderPlaceRequestURL.supportsMultipathTCP", false);
			break;
	};
	switch (settings.UrlInfoSet.Directions) {
		case "AUTO":
		default:
			break;
		case "AutoNavi":
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
		case "Apple":
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
	switch (settings.UrlInfoSet.RAP) {
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
		case "AutoNavi":
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
		case "Apple":
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
	_.unset(body, "urlInfoSet[0].abExperimentURL");
	/*
	switch (settings.UrlInfoSet.Experiments) {
		case "AUTO":
		default:
			break;
		case true:
			break;
		case false:
			// Experiments
			_.unset(body, "urlInfoSet[0].abExperimentURL");
			break;
	};
	*/
	$.log(`✅ Set UrlInfoSet`, "");
	return body;
};

function setMuninBucket(body = {}, settings = {}, configs = {}) {
	$.log(`☑️ Set MuninBucket`, "");
	switch (settings.TileSet.Munin) {
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
	$.log(`✅ Set MuninBucket`, "");
	return body;
};
