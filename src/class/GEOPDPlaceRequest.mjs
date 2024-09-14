import { log } from "../utils/utils.mjs";
//import { MESSAGE_TYPE, reflectionMergePartial, BinaryReader, WireType, UnknownFieldHandler, isJsonObject, typeofJsonValue, jsonWriteOptions, MessageType } from "@protobuf-ts/runtime";
import { PDPlaceRequest, RequestType } from "../protobuf/GEOPDPlaceRequest.js";
//import { GeoServiceTag_ServiceType } from "../protobuf/GEOPDAnalyticMetadata.js";
import { ComponentType } from "../protobuf/GEOPDComponentInfo.js";
export default class GEOPDPlaceRequest {
    static Name = "GEOPDPlaceRequest";
    static Version = "1.0.4";
	static Author = "VirgilClyne";
    static decode(rawBody = new Uint8Array([])) {
        log("☑️ GEOPDPlaceRequest.decode", "");
        const body = PDPlaceRequest.fromBinary(rawBody);
        if (typeof body?.analyticMetadata?.serviceTag !== "undefined") body.analyticMetadata.serviceTag.map(serviceTag => {
            if (typeof serviceTag.serviceType !== "undefined") serviceTag.serviceType = GeoServiceTag_ServiceType[serviceTag.serviceType];
            return serviceTag;
        });
        if (typeof body?.requestedComponents !== "undefined") body.requestedComponents.map(requestedComponent => {
            if (typeof requestedComponent.type !== "undefined") requestedComponent.type = ComponentType[requestedComponent.type];
            return requestedComponent;
        });
        if (typeof body.requestType !== "undefined") body.requestType = RequestType[body.requestType];
        log("✅ GEOPDPlaceRequest.decode", "");
        return body;
    };

    static encode(body = {}) {
        log("☑️ GEOPDPlaceRequest.encode", "");
        if (typeof body?.analyticMetadata?.serviceTag !== "undefined") body.analyticMetadata.serviceTag.map(serviceTag => {
            if (typeof serviceTag.serviceType !== "undefined") serviceTag.serviceType = GeoServiceTag_ServiceType[serviceTag.serviceType];
            return serviceTag;
        });
        if (typeof body?.requestedComponents !== "undefined") body.requestedComponents.map(requestedComponent => {
            if (typeof requestedComponent.type !== "undefined") requestedComponent.type = ComponentType[requestedComponent.type];
            return requestedComponent;
        });
        if (typeof body.requestType !== "undefined") body.requestType = RequestType[body.requestType];
        const rawBody = PDPlaceRequest.toBinary(body);
        log("✅ GEOPDPlaceRequest.encode", "");
        return rawBody;
    };
};
