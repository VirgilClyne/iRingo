import { $platform, _, Storage, fetch, notification, log, logError, wait, done, getScript, runScript } from "./utils/utils.mjs";
import XML from "./XML/XML.mjs";
import Database from "./database/index.mjs";
import setENV from "./function/setENV.mjs";
import GEOResourceManifest from "./class/GEOResourceManifest.mjs";
import GEOResourceManifestDownload from "./class/GEOResourceManifestDownload.mjs";
log("v4.0.3(1016)");
Storage.setItem("@iRingo.Maps.Caches", "");
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
					break;
				case "application/x-mpegURL":
				case "application/x-mpegurl":
				case "application/vnd.apple.mpegurl":
				case "audio/mpegurl":
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
							break;
						case "configuration.ls.apple.com":
							BigInt.prototype.toJSON = function () { return this.toString() };
							body = XML.parse($response.body);
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
							$response.body = XML.stringify(body);
							break;
					};
					break;
				case "text/vtt":
				case "application/vtt":
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
					let rawBody = ($platform === "Quantumult X") ? new Uint8Array($response.bodyBytes ?? []) : $response.body ?? new Uint8Array();
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
											const CountryCode = url.searchParams.get("country_code");
											const ETag = $response.headers?.["Etag"] ?? $response.headers?.["etag"];
											switch (CountryCode) {
												case "CN":
													//GEOResourceManifest.cacheResourceManifest(body, Caches, "CN", ETag);
													Caches.CN = body;
													const { ETag: XXETag, body: XXBody } = await GEOResourceManifest.downloadResourceManifest($request, "US");
													Caches.XX = XXBody;
													break;
												case "KR": {
													//GEOResourceManifest.cacheResourceManifest(body, Caches, "KR", ETag);
													Caches.KR = body;
													const { ETag: CNETag, body: CNBody } = await GEOResourceManifest.downloadResourceManifest($request, "CN");
													Caches.CN = CNBody;
													break;
												};
												default: {
													//GEOResourceManifest.cacheResourceManifest(body, Caches, "XX", ETag);
													Caches.XX = body;
													const { ETag: CNETag, body: CNBody } = await GEOResourceManifest.downloadResourceManifest($request, "CN");
													Caches.CN = CNBody;
													break;
												};
											};
											body.tileSet = GEOResourceManifest.tileSets(body.tileSet, Caches, Settings);
											body.attribution = GEOResourceManifest.attributions(body.attribution, Caches, CountryCode);
											body.resource = GEOResourceManifest.resources(body.resource, Caches, Settings, CountryCode);
											body.dataSet = GEOResourceManifest.dataSets(body.dataSet, Caches, Settings);
											body.urlInfoSet = GEOResourceManifest.urlInfoSets(body.urlInfoSet, Caches, Settings, CountryCode);
											body.muninBucket = GEOResourceManifest.muninBuckets(body.muninBucket, Caches, Settings);
											log(`🚧 releaseInfo: ${body.releaseInfo}`, "");
											body = GEOResourceManifest.SetTileGroup(body);
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
