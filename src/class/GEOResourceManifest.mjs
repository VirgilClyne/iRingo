import { $platform, _, Storage, fetch, log, logError } from "../utils/utils.mjs";
import GEOResourceManifestDownload from "./GEOResourceManifestDownload.mjs";

export default class GEOResourceManifest {
    static Name = "GEOResourceManifest";
    static Version = "1.2.3";
    static Author = "Virgil Clyne";

    static async downloadResourceManifest(request = $request, countryCode = "CN") {
        log(`☑️ Download ResourceManifest`, "");
        const newRequest = { ...request };
        newRequest.url = new URL(newRequest.url);
        newRequest.url.searchParams.set("country_code", countryCode);
        newRequest.url = newRequest.url.toString();
        newRequest["binary-mode"] = true;
        return fetch(newRequest).then(response => {
            let rawBody = ($platform === "Quantumult X") ? new Uint8Array(response.bodyBytes ?? []) : response.body ?? new Uint8Array();
            log(`✅ Download ResourceManifest`, "");
            return { "ETag": response.headers?.["Etag"] ?? response.headers?.["etag"], "body": GEOResourceManifestDownload.decode(rawBody) };
        });
    };

    static cacheResourceManifest(body = {}, cache = {}, countryCode = "CN", ETag = "") {
        log(`☑️ Cache ResourceManifest`, "");
        switch (countryCode) {
            case "CN":
                if (ETag !== cache?.CN?.ETag) {
                    cache.CN = { ...body, ETag };
                    Storage.setItem("@iRingo.Maps.Caches", cache);
                    log(`✅ Cache ResourceManifest`, "");
                };
                break;
            case "KR":
                if (ETag !== cache?.KR?.ETag) {
                    cache.KR = { ...body, ETag };
                    Storage.setItem("@iRingo.Maps.Caches", cache);
                    log(`✅ Cache ResourceManifest`, "");
                };
                break;
            default:
                if (ETag !== cache?.XX?.ETag) {
                    cache.XX = { ...body, ETag };
                    Storage.setItem("@iRingo.Maps.Caches", cache);
                    log(`✅ Cache ResourceManifest`, "");
                };
                break;
        };
    };

    static tileSets(tileSet = [], caches = {}, settings = {}, countryCode = "CN") {
        log(`☑️ Set TileSets`, "");
        //let tileNames = [];
        //caches.XX.tileSet.forEach(tile => tileNames.push(tile.style));
        //caches.CN.tileSet.forEach(tile => tileNames.push(tile.style));
        //tileNames = [...new Set(tileNames)];
        // 填补空缺图源
        switch (countryCode) {
            case "CN":
                /*
                // 填补数据组
                caches.CN.tileSet = caches.CN.tileSet.map(tile => {
                    tile.dataSet = 0;
                    return tile;
                });
                */
                caches.XX.tileSet.forEach(tile => {
                    if (!caches.CN.tileSet.some(i => i.style === tile.style)) {
                        log(`⚠️ Missing style: ${tile?.style}`, "");
                        delete tile.dataSet; // 移除数据组
                        tileSet.push(tile);
                    };
                });
                break;
            case "KR":
            default:
                caches.CN.tileSet.forEach(tile => {
                    if (!caches.XX.tileSet.some(i => i.style === tile.style)) {
                        log(`⚠️ Missing style: ${tile?.style}`, "");
                        tile.dataSet = 0; // 填补数据组
                        tileSet.push(tile);
                    };
                });
                break;
        };
        // 按需更改图源
        tileSet = tileSet.map((tile, index) => {
            switch (tile.style) {
                case "VECTOR_STANDARD": // 1 标准地图
                case "RASTER_TERRAIN": // 8 地貌与地势（绿地/城市/水体/山地不同颜色的区域）
                case "VECTOR_BUILDINGS": // 11 建筑模型（3D/白模）
                case "VECTOR_ROADS": // 20 道路（卫星地图:显示标签）
                case "VECTOR_VENUES": // 30 室内地图
                case "VECTOR_TRANSIT": // 37 公共交通
                case "VECTOR_ROAD_NETWORK": // 53 道路网络
                case "VECTOR_TRANSIT_SELECTION": // 47 公共交通选区?
                case "VECTOR_STREET_LANDMARKS": // 64 街道地标?
                case "VECTOR_BUILDINGS_V2": // 73 建筑模型V2（3D/上色）
                    //log(`⚠️ Basic style: ${tile?.style}`, "");
                    //tile = caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style)) || tile;
                    //log(`⚠️ Basic baseURL: ${tile?.baseURL}`, "");
                    break;
                case "RASTER_SATELLITE": // 7 卫星地图（2D）
                case "RASTER_SATELLITE_NIGHT": // 33 卫星地图（2D/夜间）
                case "RASTER_SATELLITE_DIGITIZE": // 35 卫星地图（2D/数字化）
                case "RASTER_SATELLITE_ASTC": // 45 卫星地图（2D/ASTC）
                case "RASTER_SATELLITE_POLAR": // 91 卫星地图（2D/极地）
                case "RASTER_SATELLITE_POLAR_NIGHT": // 95 卫星地图（2D/极地/夜间）
                    //log(`⚠️ Satellite style: ${tile?.style}`, "");
                    switch (settings.TileSet.Satellite) {
                        case "HYBRID":
                        default:
                            break;
                        case "CN":
                            tile = caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style)) || tile;
                            break;
                        case "XX":
                            tile = caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style)) || tile;
                            break;
                    };
                    //log(`⚠️ Satellite baseURL: ${tile?.baseURL}`, "");
                    break;
                case "VECTOR_TRAFFIC_SEGMENTS_FOR_RASTER": // 2 交通状况分段（卫星地图:显示交通状况）?
                case "VECTOR_TRAFFIC_INCIDENTS_FOR_RASTER": // 3 交通状况事件（卫星地图:显示交通状况）?
                case "VECTOR_TRAFFIC_SEGMENTS_AND_INCIDENTS_FOR_RASTER": // 4 交通状况分段和事件（卫星地图:显示交通状况）?
                case "VECTOR_TRAFFIC": // 12 交通状况
                case "VECTOR_TRAFFIC_SKELETON": // 22 交通状况骨架（卫星地图:显示交通状况）
                case "VECTOR_TRAFFIC_WITH_GREEN": // 25 交通状况（卫星地图:显示绿灯）?
                case "VECTOR_TRAFFIC_STATIC": // 26 交通状况静态?
                case "VECTOR_TRAFFIC_SKELETON_WITH_HISTORICAL": // 28 交通状况骨架（卫星地图:显示历史交通状况）?
                case "VECTOR_TRAFFIC_V2": // 86 交通状况V2
                    //log(`⚠️ Traffic style: ${tile?.style}`, "");
                    //tile = caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style)) || tile;
                    /*
                    switch (settings.TileSet.Traffic) {
                        case "HYBRID":
                        default:
                            break;
                        case "CN":
                            tile = caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style)) || tile;
                            break;
                        case "XX":
                            tile = caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style)) || tile;
                            break;
                    };
                    */
                    //log(`⚠️ Traffic baseURL: ${tile?.baseURL}`, "");
                    break;
                case "VECTOR_POI": // 13 兴趣点
                case "VECTOR_STREET_POI": // 56 街道兴趣点
                case "VECTOR_POI_V2": // 68 兴趣点V2
                case "VECTOR_POLYGON_SELECTION": // 69 多边形选区（兴趣点）
                case "POI_BUSYNESS": // 74 兴趣点繁忙程度?
                case "POI_DP_BUSYNESS": // 75 兴趣点DP繁忙程度?
                case "VECTOR_POI_V2_UPDATE": // 84 兴趣点V2更新
                    //log(`⚠️ POI style: ${tile?.style}`, "");
                    //tile = caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style)) || tile;
                    /*
                    switch (settings.TileSet.POI) {
                        case "HYBRID":
                        default:
                            break;
                        case "CN":
                            tile = caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style)) || tile;
                            break;
                        case "XX":
                            tile = caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style)) || tile;
                            break;
                    };
                    */
                    //log(`⚠️ POI baseURL: ${tile?.baseURL}`, "");
                    break;
                case "SPUTNIK_METADATA": // 14 卫星地图（3D/俯瞰）元数据
                case "SPUTNIK_C3M": // 15 卫星地图（3D/俯瞰）C3模型
                case "SPUTNIK_DSM": // 16 卫星地图（3D/俯瞰）数字表面模型
                case "SPUTNIK_DSM_GLOBAL": // 17 卫星地图（3D/俯瞰）全球数字表面模型
                case "SPUTNIK_VECTOR_BORDER": // 34 卫星地图（3D/俯瞰）边界
                case "FLYOVER_C3M_MESH": // 42 俯瞰C3模型（四处看看）?
                case "FLYOVER_C3M_JPEG_TEXTURE": // 43 俯瞰C3模型纹理（四处看看）?
                case "FLYOVER_C3M_ASTC_TEXTURE": // 44 俯瞰C3模型纹理（四处看看）?
                case "FLYOVER_VISIBILITY": // 49 俯瞰可见性（四处看看）?
                case "FLYOVER_SKYBOX": // 50 俯瞰天空盒（四处看看）?
                case "FLYOVER_NAVGRAPH": // 51 俯瞰导航图（四处看看）?
                case "FLYOVER_METADATA": // 52 俯瞰元数据
                    //log(`⚠️ Flyover style: ${tile?.style}`, "");
                    switch (settings.TileSet.Flyover) {
                        case "HYBRID":
                        default:
                            break;
                        case "CN":
                            tile = caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style)) || tile;
                            break;
                        case "XX":
                            tile = caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style)) || tile;
                            break;
                    };
                    //log(`⚠️ Flyover baseURL: ${tile?.baseURL}`, "");
                    break;
                case "MUNIN_METADATA": // 57 四处看看 元数据
                case "VECTOR_SPR_MERCATOR": // 58
                case "VECTOR_SPR_MODELS": // 59
                case "VECTOR_SPR_MATERIALS": // 60
                case "VECTOR_SPR_METADATA": // 61
                case "VECTOR_SPR_ROADS": // 66
                case "VECTOR_SPR_STANDARD": // 67
                case "SPR_ASSET_METADATA": // 78?
                case "VECTOR_SPR_POLAR": // 79
                case "VECTOR_SPR_MODELS_OCCLUSION": // 82?
                    //log(`⚠️ Munin style: ${tile?.style}`, "");
                    switch (settings.TileSet.Munin) {
                        case "HYBRID":
                        default:
                            break;
                        case "CN":
                            tile = caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style)) || tile;
                            break;
                        case "XX":
                            tile = caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style)) || tile;
                            break;
                    };
                    //log(`⚠️ Munin baseURL: ${tile?.baseURL}`, "");
                    break;
                case "VECTOR_REALISTIC": // 18 逼真地图?
                case "VECTOR_COVERAGE": // 48 覆盖范围?
                case "VECTOR_LAND_COVER": // 54 土地覆盖?
                case "SMART_DATA_MODE": // 80 智能数据模式?
                case "VECTOR_TOPOGRAPHIC": // 83 地形图?
                case "VECTOR_ROAD_SELECTION": // 87 道路选区?
                case "VECTOR_REGION_METADATA": // 88 区域元数据?
                    //log(`⚠️ TEST style: ${tile?.style}`, "");
                    //tile = caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style)) || tile;
                    //log(`⚠️ TEST baseURL: ${tile?.baseURL}`, "");
                    break;
                case "VECTOR_TRACKS": // 62 轨道?
                case "COARSE_LOCATION_POLYGONS": // 65 粗略位置多边形?
                case "VL_METADATA": // 70 VL 元数据?
                case "VL_DATA": // 71 VL 数据?
                case "PROACTIVE_APP_CLIP": // 72 主动式App剪辑?
                case "SMART_INTERFACE_SELECTION": // 76 智能界面选区?
                case "VECTOR_LIVE_DATA_UPDATES": // 85 实时数据更新?
                case "RAY_TRACING": // 89 光线追踪?
                case "VECTOR_CONTOURS": // 90 等高线?
                case "UNUSED_91": // 91 未使用
                case "UNUSED_92": // 92 未使用
                case "UNUSED_93": // 93 未使用
                case "UNUSED_94": // 94 未使用
                case "UNUSED_95": // 95 未使用
                case "UNUSED_99": // 99 未使用
                default:
                    log(`⚠️ default style: ${tile?.style}`, "");
                    /*
                    switch (countryCode) {
                        case "CN":
                            tile = caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style)) || tile;
                            break;
                        case "KR":
                        default:
                            tile = caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style)) || tile;
                            break;
                    };
                    */
                    log(`⚠️ default baseURL: ${tile?.baseURL}`, "");
                    break;
            };
            return tile;
        }).flat(Infinity).filter(Boolean);
        log(`✅ Set TileSets`, "");
        return tileSet;
    };

    static attributions(attributions = [], caches = {}, countryCode = "CN") {
        log(`☑️ Set Attributions`, "");
        switch (countryCode) {
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
        attributions.sort((a, b) => {
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
                    attribution.name = ` iRingo: 📍 GEOResourceManifest\n${new Date()}`;
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

    static resources(resources = [], caches = {}, countryCode = "CN") {
        log(`☑️ Set Resources`, "");
        switch (countryCode) {
            case "CN":
                break;
            case "KR":
            default:
                caches.CN.resource.forEach((resource, index) => {
                    if (resource.filename === "POITypeMapping-CN-1.json") resources.push(resource);
                    if (resource.filename === "POITypeMapping-CN-2.json") resources.push(resource);
                    if (resource.filename === "China.cms-lpr") resources.push(resource);
                });
                break;
        };
        return resources;
    };

    static dataSets(dataSets = [], caches = {}, countryCode = "CN") {
        log(`☑️ Set DataSets`, "");
        switch (countryCode) {
            case "CN":
                dataSets = caches?.XX?.dataSet;
                break;
            case "KR":
            default:
                break;
        };
        //dataSets.push({ "dataSetDescription": "AutoNavi", "identifier": 10 });
        log(`✅ Set DataSets`, "");
        return dataSets;
    };

    static urlInfoSets(urlInfoSets = [], caches = {}, settings = {}, countryCode = "CN") {
        log(`☑️ Set UrlInfoSets`, "");
        urlInfoSets = urlInfoSets.map((urlInfoSet, index) => {
            switch (countryCode) {
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

    static muninBuckets(muninBuckets = [], caches = {}, settings = {}) {
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

    static displayStrings(displayStrings = [], caches = {}, countryCode = "CN") {
        log(`☑️ Set DisplayStrings`, "");
        switch (countryCode) {
            case "CN":
                displayStrings = caches.XX.displayStrings.map((displayString, index) => {
                    return displayString;
                });
                break;
            case "KR":
                //displayStrings = caches.KR.displayStrings;
                break;
            default:
                //displayStrings = caches.XX.displayStrings;
                break;
        };
        log(`✅ Set DisplayStrings`, "");
        return displayStrings;
    };

    static SetTileGroups(body = {}) {
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
            if (body.attribution) tileGroup.attributionIndex = body.attribution.map((attribution, index) => {
                return index;
            });
            if (body.resource) tileGroup.resourceIndex = body.resource.map((resource, index) => {
                return index;
            });
            return tileGroup;
        });
        log(`✅ Set TileGroups`, "");
        return body;
    };


};
