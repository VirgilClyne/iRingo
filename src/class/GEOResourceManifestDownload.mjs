import { log } from "../utils/utils.mjs";
//import { MESSAGE_TYPE, reflectionMergePartial, BinaryReader, WireType, UnknownFieldHandler, isJsonObject, typeofJsonValue, jsonWriteOptions, MessageType } from "@protobuf-ts/runtime";
import { Resources, Resource_ResourceType, ResourceFilter_Scale, ResourceFilter_Scenario, Resource_ConnectionType, Resource_ValidationMethod, Resource_UpdateMethod } from "../protobuf/GEOResourceManifestDownload.js";
import { TileSetStyle, TileScale, TileSize, GenericTileType, TileSet_TileSetVersionUpdateBehavior, TileSet_TileSetChecksumType, TileSet_TileRequestStyle } from "../protobuf/com.apple.geobuf.geo.proto.js";

export default class GEOResourceManifestDownload {
    static Name = "GEOResourceManifestDownload";
    static Version = "1.0.6";
	static Author = "Virgil Clyne";
    static decode(rawBody = new Uint8Array([])) {
        log("☑️ GEOResourceManifestDownload.decode", "");
        const body = Resources.fromBinary(rawBody);
        if (body.tileSet) body.tileSet = body.tileSet.map((tile) => {
            if (typeof tile.style !== "undefined") tile.style = TileSetStyle[tile.style];
            if (typeof tile.validVersion !== "undefined") tile.validVersion = tile.validVersion.map(version => {
                if (typeof version.genericTile?.tileType !== "undefined") version.genericTile.tileType = GenericTileType[version.genericTile.tileType];
                return version;
            });
            if (typeof tile.scale !== "undefined") tile.scale = TileScale[tile.scale];
            if (typeof tile.size !== "undefined") tile.size = TileSize[tile.size];
            if (typeof tile.updateBehavior !== "undefined") tile.updateBehavior = TileSet_TileSetVersionUpdateBehavior[tile.updateBehavior];
            if (typeof tile.checksumType !== "undefined") tile.checksumType = TileSet_TileSetChecksumType[tile.checksumType];
            if (typeof tile.requestStyle !== "undefined") tile.requestStyle = TileSet_TileRequestStyle[tile.requestStyle];
            return tile;
        });
        if (typeof body.attribution !== "undefined") body.attribution = body.attribution.map(attribution => {
            if (typeof attribution.resource !== "undefined") attribution.resource = attribution.resource.map(resource => {
                if (typeof resource.resourceType !== "undefined") resource.resourceType = Resource_ResourceType[resource.resourceType];
                if (typeof resource.filter !== "undefined") resource.filter = resource.filter.map(filter => {
                    if (typeof filter.scale !== "undefined") filter.scale = filter.scale.map(scale => ResourceFilter_Scale[scale]);
                    if (typeof filter.scenario !== "undefined") filter.scenario = filter.scenario.map(scenario => ResourceFilter_Scenario[scenario]);
                    return filter;
                });
                if (typeof resource.connectionType !== "undefined") resource.connectionType = Resource_ConnectionType[resource.connectionType];
                if (typeof resource.validationMethod !== "undefined") resource.validationMethod = Resource_ValidationMethod[resource.validationMethod];
                if (typeof resource.updateMethod !== "undefined") resource.updateMethod = Resource_UpdateMethod[resource.updateMethod];
                return resource;
            });
            return attribution;
        });
        if (typeof body.resource !== "undefined") body.resource = body.resource.map(resource => {
            if (typeof resource.resourceType !== "undefined") resource.resourceType = Resource_ResourceType[resource.resourceType];
            if (typeof resource.filter !== "undefined") resource.filter = resource.filter.map(filter => {
                if (typeof filter.scale !== "undefined") filter.scale = filter.scale.map(scale => ResourceFilter_Scale[scale]);
                if (typeof filter.scenario !== "undefined") filter.scenario = filter.scenario.map(scenario => ResourceFilter_Scenario[scenario]);
                return filter;
            });
            if (typeof resource.connectionType !== "undefined") resource.connectionType = Resource_ConnectionType[resource.connectionType];
            if (typeof resource.validationMethod !== "undefined") resource.validationMethod = Resource_ValidationMethod[resource.validationMethod];
            if (typeof resource.updateMethod !== "undefined") resource.updateMethod = Resource_UpdateMethod[resource.updateMethod];
            return resource;
        });
        log("✅ GEOResourceManifestDownload.decode", "");
        return body;
    };

    static encode(body = {}) {
        log("☑️ GEOResourceManifestDownload.encode", "");
        if (body.tileSet) body.tileSet = body.tileSet.map((tile) => {
            if (typeof tile.style !== "undefined") tile.style = TileSetStyle[tile.style];
            if (typeof tile.validVersion !== "undefined") tile.validVersion = tile.validVersion.map(version => {
                if (typeof version.genericTile?.tileType !== "undefined") version.genericTile.tileType = GenericTileType[version.genericTile.tileType];
                return version;
            });
            if (typeof tile.scale !== "undefined") tile.scale = TileScale[tile.scale];
            if (typeof tile.size !== "undefined") tile.size = TileSize[tile.size];
            if (typeof tile.updateBehavior !== "undefined") tile.updateBehavior = TileSet_TileSetVersionUpdateBehavior[tile.updateBehavior];
            if (typeof tile.checksumType !== "undefined") tile.checksumType = TileSet_TileSetChecksumType[tile.checksumType];
            if (typeof tile.requestStyle !== "undefined") tile.requestStyle = TileSet_TileRequestStyle[tile.requestStyle];
            return tile;
        });
        if (typeof body.attribution !== "undefined") body.attribution = body.attribution.map(attribution => {
            if (typeof attribution.resource !== "undefined") attribution.resource = attribution.resource.map(resource => {
                if (typeof resource.resourceType !== "undefined") resource.resourceType = Resource_ResourceType[resource.resourceType];
                if (typeof resource.filter !== "undefined") resource.filter = resource.filter.map(filter => {
                    if (typeof filter.scale !== "undefined") filter.scale = filter.scale.map(scale => ResourceFilter_Scale[scale]);
                    if (typeof filter.scenario !== "undefined") filter.scenario = filter.scenario.map(scenario => ResourceFilter_Scenario[scenario]);
                    return filter;
                });
                if (typeof resource.connectionType !== "undefined") resource.connectionType = Resource_ConnectionType[resource.connectionType];
                if (typeof resource.validationMethod !== "undefined") resource.validationMethod = Resource_ValidationMethod[resource.validationMethod];
                if (typeof resource.updateMethod !== "undefined") resource.updateMethod = Resource_UpdateMethod[resource.updateMethod];
                return resource;
            });
            return attribution;
        });
        if (typeof body.resource !== "undefined") body.resource = body.resource.map(resource => {
            if (typeof resource.resourceType !== "undefined") resource.resourceType = Resource_ResourceType[resource.resourceType];
            if (typeof resource.filter !== "undefined") resource.filter = resource.filter.map(filter => {
                if (typeof filter.scale !== "undefined") filter.scale = filter.scale.map(scale => ResourceFilter_Scale[scale]);
                if (typeof filter.scenario !== "undefined") filter.scenario = filter.scenario.map(scenario => ResourceFilter_Scenario[scenario]);
                return filter;
            });
            if (typeof resource.connectionType !== "undefined") resource.connectionType = Resource_ConnectionType[resource.connectionType];
            if (typeof resource.validationMethod !== "undefined") resource.validationMethod = Resource_ValidationMethod[resource.validationMethod];
            if (typeof resource.updateMethod !== "undefined") resource.updateMethod = Resource_UpdateMethod[resource.updateMethod];
            return resource;
        });
        const rawBody = Resources.toBinary(body);
        log("✅ GEOResourceManifestDownload.encode", "");
        return rawBody;
    };
};
