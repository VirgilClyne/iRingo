// 判断是否是重写
const isRequest = typeof $request != "undefined";
const isResponse = typeof $response != "undefined";
// 判断是否是Surge
const isSurge = typeof $httpClient != "undefined";
// 判断是否是QuanX
const isQuanX = typeof $task != "undefined";
// 判断是否是Loon
const isLoon = typeof $loon != "undefined";
// 关闭请求
const done = (value = {}) => {
    if (isQuanX) return $done(value);
    if (isSurge) isRequest ? $done(value) : $done();
};

/*
README:https://github.com/VirgilClyne/iRingo
*/

// Default GeoCountryCode: US
let GeoCountryCode = "US";
// Default Location Services Configs (test)
//let GEOAddressCorrectionEnabled = true;
//let ShouldEnableLagunaBeach = true;
//let PedestrianAREnabled = true;

// Argument Function Supported
if (typeof $argument != "undefined") {
    let arg = Object.fromEntries($argument.split("&").map((item) => item.split("=")));
    console.log(JSON.stringify(arg));
    //GeoCountryCode = arg.GeoCountryCode;
    //EnableAlberta = arg.EnableAlberta;
    //GEOAddressCorrectionEnabled = arg.GEOAddressCorrectionEnabled;
    //ShouldEnableLagunaBeach = arg.ShouldEnableLagunaBeach;
    //PedestrianAREnabled = arg.PedestrianAREnabled;
};

const url = $request.url;

const path0 = "/config/defaults";
const path1 = "/pep/gcc";
const path2 = "/dispatcher";

//
if (url.indexOf(path0) != -1) {
    console.log(path0);
    if (isRequest && !isResponse) {
        var headers = $request.headers;
        headers['If-None-Match'] = '';
        done({ headers });
    } else if (isResponse) {
        var body = $response.body;
        if (isQuanX) {
            var x2js = new X2JS();
            body = x2js.xml2js(body);
            //body = PlistParser.toPlist(config);
        } else if (isSurge || isLoon) {
            //var comappleGEO = /(<plist version="1\.0">(?:\n\s{0,})<dict>(?:\n\s{0,})<key>com\.apple\.GEO<\/key>(?:\n\s{0,})<dict>(?:\n\s{0,}))(.*)((?:\n\s{0,})<\/dict>(?:\n\s{0,})<\/plist>)/m;
            //var CountryProviders = /<key>CountryProviders<\/key>/m;
            var CN = /(<key>CountryProviders<\/key>(?:\n\s{0,})<dict>(?:\n\s.*)*<key>CN<\/key>(?:\n\s{0,})<dict>(?:\n\s{0,}))(.*)((?:\n\s.*)*<\/dict>(?:\n\s{0,})<key>CO<\/key>)/m;
            var EnableAlberta = /((?:<plist version="1\.0">(?:\n\s{0,})<dict>(?:\n\s{0,})<key>com\.apple\.GEO<\/key>(?:\n\s{0,})<dict>(?:\n\s.*)*<key>CountryProviders<\/key>(?:\n\s{0,})<dict>(?:\n\s.*)*<key>CN<\/key>(?:\n\s{0,})<dict>(?:\n\s.*)*)<key>EnableAlberta<\/key>(?:\n\s{0,})<)(true|false)(\/>((?:\n\s.*)*<\/dict>(?:\n\s{0,})<key>CO<\/key>))/m;
            var GEOAddressCorrectionEnabled = /((?:<plist version="1\.0">(?:\n\s{0,})<dict>(?:\n\s{0,})<key>com\.apple\.GEO<\/key>(?:\n\s{0,})<dict>(?:\n\s.*)*<key>CountryProviders<\/key>(?:\n\s{0,})<dict>(?:\n\s.*)*<key>CN<\/key>(?:\n\s{0,})<dict>(?:\n\s.*)*)<key>GEOAddressCorrectionEnabled<\/key>(?:\n\s{0,})<)(true|false)(\/>((?:\n\s.*)*<\/dict>(?:\n\s{0,})<key>CO<\/key>))/m;
            var GEOGeocoderIsEncrypted = /((?:<plist version="1\.0">(?:\n\s{0,})<dict>(?:\n\s{0,})<key>com\.apple\.GEO<\/key>(?:\n\s{0,})<dict>(?:\n\s.*)*<key>CountryProviders<\/key>(?:\n\s{0,})<dict>(?:\n\s.*)*<key>CN<\/key>(?:\n\s{0,})<dict>(?:\n\s.*)*)<key>GEOGeocoderIsEncrypted<\/key>(?:\n\s{0,})<)(true|false)(\/>((?:\n\s.*)*<\/dict>(?:\n\s{0,})<key>CO<\/key>))/m;
            var LocalitiesAndLandmarksSupported = /((?:<plist version="1\.0">(?:\n\s{0,})<dict>(?:\n\s{0,})<key>com\.apple\.GEO<\/key>(?:\n\s{0,})<dict>(?:\n\s.*)*<key>CountryProviders<\/key>(?:\n\s{0,})<dict>(?:\n\s.*)*<key>CN<\/key>(?:\n\s{0,})<dict>(?:\n\s.*)*)<key>LocalitiesAndLandmarksSupported<\/key>(?:\n\s{0,})<)(true|false)(\/>((?:\n\s.*)*<\/dict>(?:\n\s{0,})<key>CO<\/key>))/m;
            var PedestrianAREnabled = /((?:<plist version="1\.0">(?:\n\s{0,})<dict>(?:\n\s{0,})<key>com\.apple\.GEO<\/key>(?:\n\s{0,})<dict>(?:\n\s.*)*<key>CountryProviders<\/key>(?:\n\s{0,})<dict>(?:\n\s.*)*<key>CN<\/key>(?:\n\s{0,})<dict>(?:\n\s.*)*)<key>PedestrianAREnabled<\/key>(?:\n\s{0,})<)(true|false)(\/>((?:\n\s.*)*<\/dict>(?:\n\s{0,})<key>CO<\/key>))/m;

            //body = config.replace(variable, parameter);
            //body = body.replace(EnableAlberta, '$1false$3');
            body = body.replace(GEOAddressCorrectionEnabled, '$1true$3');
            body = body.replace(GEOGeocoderIsEncrypted, '$1true$3');
            body = body.replace(LocalitiesAndLandmarksSupported, '$1true$3');
            body = body.replace(PedestrianAREnabled, '$1true$3');
            body = body.replace(CN, '$1<key>ShouldEnableLagunaBeach</key>\n				<true/>\n				<key>GEOShouldSpeakWrittenAddresses</key>\n				<true/>\n				<key>GEOShouldSpeakWrittenPlaceNames</key>\n				<true/>\n				$2$3');
        };
        done({ body });
    }
};

if (url.indexOf(path1) != -1) {
    console.log(path1);
    var today = new Date();
    var UTCstring = today.toUTCString();
    var response = {};
    response.headers = {
        'Content-Type': 'text/html',
        'Date': UTCstring,
        'Connection': 'keep-alive',
        'Content-Encoding': 'identity'
    };
    response.body = GeoCountryCode;
    if (isQuanX) {
        response.status = "HTTP/1.1 200 OK";
        done(response);
    }
    if (isSurge || isLoon) {
        response.status = 200;
        done({ response });
    }
} else done();

if (url.indexOf(path2) != -1) {
    console.log(path2);
    if (isRequest) {
        var body = $request.rawBody;
        //var compass = /com\.apple\.compass/
        const isCompass = typeof body.includes("com.apple.compass");
        if (isCompass) body = body.replace(/CN/g, 'US');
        done({ rawBody });
    }
};

/***************** fast-xml-parser *****************/
// prettier-ignore
// https://github.com/x2js/x2js/blob/development/x2js.js
/*
    Copyright 2015 Axinom
    Copyright 2011-2013 Abdulla Abdurakhmanov
    Original sources are available at https://code.google.com/p/x2js/

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/
function X2JS(config) {
    var VERSION = "3.4.0";

    config = config || {};

    function initConfigDefaults() {
        // If set to "property" then <element>_asArray will be created
        // to allow you to access any element as an array (even if there is only one of it).
        config.arrayAccessForm = config.arrayAccessForm || "none";

        // If "text" then <empty></empty> will be transformed to "".
        // If "object" then <empty></empty> will be transformed to {}.
        config.emptyNodeForm = config.emptyNodeForm || "text";

        // Function that will be called for each elements, if the function returns true, the element will be skipped
        // function(name, value) { return true; };
        config.jsAttributeFilter = config.jsAttributeFilter;

        // Function that will be called for each elements, the element value will be replaced by the returned value
        // function(name, value) { return parseFloat(value); };
        config.jsAttributeConverter = config.jsAttributeConverter;

        // Allows attribute values to be converted on the fly during parsing to objects.
        // 	"test": function(name, value) { return true; }
        //	"convert": function(name, value) { return parseFloat(value); };
        // convert() will be called for every attribute where test() returns true
        // and the return value from convert() will replace the original value of the attribute.
        config.attributeConverters = config.attributeConverters || [];

        // Any elements that match the paths here will have their text parsed
        // as an XML datetime value (2011-11-12T13:00:00-07:00 style).
        // The path can be a plain string (parent.child1.child2),
        // a regex (/.*\.child2/) or function(elementPath).
        config.datetimeAccessFormPaths = config.datetimeAccessFormPaths || [];

        // Any elements that match the paths listed here will be stored in JavaScript objects
        // as arrays even if there is only one of them. The path can be a plain string
        // (parent.child1.child2), a regex (/.*\.child2/) or function(elementName, elementPath).
        config.arrayAccessFormPaths = config.arrayAccessFormPaths || [];

        // xmldom constructor arguments
        // @see https://github.com/jindw/xmldom#api-reference
        config.xmldomOptions = config.xmldomOptions || {};

        // If true, a toString function is generated to print nodes containing text or cdata.
        // Useful if you want to accept both plain text and CData as equivalent inputs.
        if (config.enableToStringFunc === undefined) {
            config.enableToStringFunc = true;
        }

        // If true, empty text tags are ignored for elements with child nodes.
        if (config.skipEmptyTextNodesForObj === undefined) {
            config.skipEmptyTextNodesForObj = true;
        }

        // If true, whitespace is trimmed from text nodes.
        if (config.stripWhitespaces === undefined) {
            config.stripWhitespaces = true;
        }

        // If true, double quotes are used in generated XML.
        if (config.useDoubleQuotes === undefined) {
            config.useDoubleQuotes = true;
        }

        // If true, the root element of the XML document is ignored when converting to objects.
        // The result will directly have the root element's children as its own properties.
        if (config.ignoreRoot === undefined) {
            config.ignoreRoot = false;
        }

        // Whether XML characters in text are escaped when reading/writing XML.
        if (config.escapeMode === undefined) {
            config.escapeMode = true;
        }

        // Prefix to use for properties that are created to represent XML attributes.
        if (config.attributePrefix === undefined) {
            config.attributePrefix = "_";
        }

        // If true, empty elements will created as self closing elements (<element />)
        // If false, empty elements will be created with start and end tags (<element></element>)
        if (config.selfClosingElements === undefined) {
            config.selfClosingElements = true;
        }

        // If this property defined as false and an XML element has CData node ONLY, it will be converted to text without additional property "__cdata"
        if (config.keepCData === undefined) {
            config.keepCData = false;
        }

        // If this property defined as true, use { __text: 'abc' } over 'abc'
        if (config.keepText === undefined) {
            config.keepText = false;
        }

        // If true, will output dates in UTC
        if (config.jsDateUTC === undefined) {
            config.jsDateUTC = false;
        }
    }

    function initRequiredPolyfills() {
        function pad(number) {
            var r = String(number);
            if (r.length === 1) {
                r = '0' + r;
            }
            return r;
        }
        // Hello IE8-
        if (typeof String.prototype.trim !== 'function') {
            String.prototype.trim = function trim() {
                return this.replace(/^\s+|^\n+|(\s|\n)+$/g, '');
            };
        }
        if (typeof Date.prototype.toISOString !== 'function') {
            // Implementation from http://stackoverflow.com/questions/2573521/how-do-i-output-an-iso-8601-formatted-string-in-javascript
            Date.prototype.toISOString = function toISOString() {
                var MS_IN_S = 1000;

                return this.getUTCFullYear()
                    + '-' + pad(this.getUTCMonth() + 1)
                    + '-' + pad(this.getUTCDate())
                    + 'T' + pad(this.getUTCHours())
                    + ':' + pad(this.getUTCMinutes())
                    + ':' + pad(this.getUTCSeconds())
                    + '.' + String((this.getUTCMilliseconds() / MS_IN_S).toFixed(3)).slice(2, 5)
                    + 'Z';
            };
        }
    }

    initConfigDefaults();
    initRequiredPolyfills();

    var DOMNodeTypes = {
        "ELEMENT_NODE": 1,
        "TEXT_NODE": 3,
        "CDATA_SECTION_NODE": 4,
        "COMMENT_NODE": 8,
        "DOCUMENT_NODE": 9
    };

    function getDomNodeLocalName(domNode) {
        var localName = domNode.localName;
        if (localName == null) {
            // Yeah, this is IE!!
            localName = domNode.baseName;
        }
        if (localName == null || localName === "") {
            // ==="" is IE too
            localName = domNode.nodeName;
        }
        return localName;
    }

    function getDomNodeNamespacePrefix(node) {
        return node.prefix;
    }

    function escapeXmlChars(str) {
        if (typeof str === "string")
            return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
        else
            return str;
    }

    function unescapeXmlChars(str) {
        return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&');
    }

    function ensureProperArrayAccessForm(element, childName, elementPath) {
        switch (config.arrayAccessForm) {
            case "property":
                if (!(element[childName] instanceof Array))
                    element[childName + "_asArray"] = [element[childName]];
                else
                    element[childName + "_asArray"] = element[childName];
                break;
        }

        if (!(element[childName] instanceof Array) && config.arrayAccessFormPaths.length > 0) {
            var match = false;

            for (var i = 0; i < config.arrayAccessFormPaths.length; i++) {
                var arrayPath = config.arrayAccessFormPaths[i];
                if (typeof arrayPath === "string") {
                    if (arrayPath === elementPath) {
                        match = true;
                        break;
                    }
                } else if (arrayPath instanceof RegExp) {
                    if (arrayPath.test(elementPath)) {
                        match = true;
                        break;
                    }
                } else if (typeof arrayPath === "function") {
                    if (arrayPath(childName, elementPath)) {
                        match = true;
                        break;
                    }
                }
            }

            if (match)
                element[childName] = [element[childName]];
        }
    }

    function xmlDateTimeToDate(prop) {
        // Implementation based up on http://stackoverflow.com/questions/8178598/xml-datetime-to-javascript-date-object
        // Improved to support full spec and optional parts
        var MINUTES_PER_HOUR = 60;

        var bits = prop.split(/[-T:+Z]/g);

        var d = new Date(bits[0], bits[1] - 1, bits[2]);
        var secondBits = bits[5].split("\.");
        d.setHours(bits[3], bits[4], secondBits[0]);
        if (secondBits.length > 1)
            d.setMilliseconds(secondBits[1]);

        // Get supplied time zone offset in minutes
        if (bits[6] && bits[7]) {
            var offsetMinutes = bits[6] * MINUTES_PER_HOUR + Number(bits[7]);
            var sign = /\d\d-\d\d:\d\d$/.test(prop) ? '-' : '+';

            // Apply the sign
            offsetMinutes = 0 + (sign === '-' ? -1 * offsetMinutes : offsetMinutes);

            // Apply offset and local timezone
            d.setMinutes(d.getMinutes() - offsetMinutes - d.getTimezoneOffset());
        } else if (prop.indexOf("Z", prop.length - 1) !== -1) {
            d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()));
        }

        // d is now a local time equivalent to the supplied time
        return d;
    }

    function convertToDateIfRequired(value, childName, fullPath) {
        if (config.datetimeAccessFormPaths.length > 0) {
            var pathWithoutTextNode = fullPath.split("\.#")[0];

            for (var i = 0; i < config.datetimeAccessFormPaths.length; i++) {
                var candidatePath = config.datetimeAccessFormPaths[i];
                if (typeof candidatePath === "string") {
                    if (candidatePath === pathWithoutTextNode)
                        return xmlDateTimeToDate(value);
                } else if (candidatePath instanceof RegExp) {
                    if (candidatePath.test(pathWithoutTextNode))
                        return xmlDateTimeToDate(value);
                } else if (typeof candidatePath === "function") {
                    if (candidatePath(pathWithoutTextNode))
                        return xmlDateTimeToDate(value);
                }
            }
        }

        return value;
    }

    function deserializeRootElementChildren(rootElement) {
        var result = {};
        var children = rootElement.childNodes;

        // Alternative for firstElementChild which is not supported in some environments
        for (var i = 0; i < children.length; i++) {
            var child = children.item(i);
            if (child.nodeType === DOMNodeTypes.ELEMENT_NODE) {
                var childName = getDomNodeLocalName(child);

                if (config.ignoreRoot)
                    result = deserializeDomChildren(child, childName);
                else
                    result[childName] = deserializeDomChildren(child, childName);
            }
        }

        return result;
    }

    function deserializeElementChildren(element, elementPath) {
        var result = {};
        result.__cnt = 0;

        var nodeChildren = element.childNodes;

        // Child nodes.
        for (var iChild = 0; iChild < nodeChildren.length; iChild++) {
            var child = nodeChildren.item(iChild);
            var childName = getDomNodeLocalName(child);

            if (child.nodeType === DOMNodeTypes.COMMENT_NODE)
                continue;

            result.__cnt++;

            // We deliberately do not accept everything falsey here because
            // elements that resolve to empty string should still be preserved.
            if (result[childName] == null) {
                result[childName] = deserializeDomChildren(child, elementPath + "." + childName);
                ensureProperArrayAccessForm(result, childName, elementPath + "." + childName);
            } else {
                if (!(result[childName] instanceof Array)) {
                    result[childName] = [result[childName]];
                    ensureProperArrayAccessForm(result, childName, elementPath + "." + childName);
                }

                result[childName][result[childName].length] = deserializeDomChildren(child, elementPath + "." + childName);
            }
        }

        // Attributes
        for (var iAttribute = 0; iAttribute < element.attributes.length; iAttribute++) {
            var attribute = element.attributes.item(iAttribute);
            result.__cnt++;

            var adjustedValue = attribute.value;
            for (var iConverter = 0; iConverter < config.attributeConverters.length; iConverter++) {
                var converter = config.attributeConverters[iConverter];
                if (converter.test.call(null, attribute.name, attribute.value))
                    adjustedValue = converter.convert.call(null, attribute.name, attribute.value);
            }

            result[config.attributePrefix + attribute.name] = adjustedValue;
        }

        // Node namespace prefix
        var namespacePrefix = getDomNodeNamespacePrefix(element);
        if (namespacePrefix) {
            result.__cnt++;
            result.__prefix = namespacePrefix;
        }

        if (result["#text"]) {
            result.__text = result["#text"];

            if (result.__text instanceof Array) {
                result.__text = result.__text.join("\n");
            }

            if (config.escapeMode)
                result.__text = unescapeXmlChars(result.__text);

            if (config.stripWhitespaces)
                result.__text = result.__text.trim();

            delete result["#text"];

            if (config.arrayAccessForm === "property")
                delete result["#text_asArray"];

            result.__text = convertToDateIfRequired(result.__text, "#text", elementPath + ".#text");
        }

        if (result.hasOwnProperty('#cdata-section')) {
            result.__cdata = result["#cdata-section"];
            delete result["#cdata-section"];

            if (config.arrayAccessForm === "property")
                delete result["#cdata-section_asArray"];
        }

        if (result.__cnt === 1 && result.__text && !config.keepText) {
            result = result.__text;
        } else if (result.__cnt === 0 && config.emptyNodeForm === "text") {
            result = '';
        } else if (result.__cnt > 1 && result.__text !== undefined && config.skipEmptyTextNodesForObj) {
            if (config.stripWhitespaces && result.__text === "" || result.__text.trim() === "") {
                delete result.__text;
            }
        }
        delete result.__cnt;

        /**
         * We are checking if we are creating a __cdata property or if we just add the content of cdata inside result.
         * But, if we have a property inside xml tag (<tag PROPERTY="1"></tag>), and a cdata inside, we can't ignore it.
         * In this case we are keeping __cdata property.
         */
        if (!config.keepCData && (!result.hasOwnProperty('__text') && result.hasOwnProperty('__cdata') && Object.keys(result).length === 1)) {
            return (result.__cdata ? result.__cdata : '');
        }

        if (config.enableToStringFunc && (result.__text || result.__cdata)) {
            result.toString = function toString() {
                return (this.__text ? this.__text : '') + (this.__cdata ? this.__cdata : '');
            };
        }

        return result;
    }

    function deserializeDomChildren(node, parentPath) {
        if (node.nodeType === DOMNodeTypes.DOCUMENT_NODE) {
            return deserializeRootElementChildren(node);
        } else if (node.nodeType === DOMNodeTypes.ELEMENT_NODE) {
            return deserializeElementChildren(node, parentPath);
        } else if (node.nodeType === DOMNodeTypes.TEXT_NODE || node.nodeType === DOMNodeTypes.CDATA_SECTION_NODE) {
            return node.nodeValue;
        } else {
            return null;
        }
    }

    function serializeStartTag(jsObject, elementName, attributeNames, selfClosing) {
        var resultStr = "<" + ((jsObject && jsObject.__prefix) ? (jsObject.__prefix + ":") : "") + elementName;

        if (attributeNames) {
            for (var i = 0; i < attributeNames.length; i++) {
                var attributeName = attributeNames[i];
                var attributeValue = jsObject[attributeName];

                if (config.escapeMode)
                    attributeValue = escapeXmlChars(attributeValue);

                resultStr += " " + attributeName.substr(config.attributePrefix.length) + "=";

                if (config.useDoubleQuotes)
                    resultStr += '"' + attributeValue + '"';
                else
                    resultStr += "'" + attributeValue + "'";
            }
        }

        if (!selfClosing)
            resultStr += ">";
        else
            resultStr += " />";

        return resultStr;
    }

    function serializeEndTag(jsObject, elementName) {
        return "</" + ((jsObject && jsObject.__prefix) ? (jsObject.__prefix + ":") : "") + elementName + ">";
    }

    function endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    function isSpecialProperty(jsonObj, propertyName) {
        if ((config.arrayAccessForm === "property" && endsWith(propertyName.toString(), ("_asArray")))
            || propertyName.toString().indexOf(config.attributePrefix) === 0
            || propertyName.toString().indexOf("__") === 0
            || (jsonObj[propertyName] instanceof Function))
            return true;
        else
            return false;
    }

    function getDataElementCount(jsObject) {
        var count = 0;

        if (jsObject instanceof Object) {
            for (var propertyName in jsObject) {
                if (isSpecialProperty(jsObject, propertyName))
                    continue;

                count++;
            }
        }

        return count;
    }

    function getDataAttributeNames(jsObject) {
        var names = [];

        if (jsObject instanceof Object) {
            for (var attributeName in jsObject) {
                if (attributeName.toString().indexOf("__") === -1
                    && attributeName.toString().indexOf(config.attributePrefix) === 0) {
                    names.push(attributeName);
                }
            }
        }

        return names;
    }

    function serializeComplexTextNodeContents(textNode) {
        var result = "";

        if (textNode.__cdata) {
            result += "<![CDATA[" + textNode.__cdata + "]]>";
        }

        if (textNode.__text || typeof (textNode.__text) === 'number' || typeof (textNode.__text) === 'boolean') {
            if (config.escapeMode)
                result += escapeXmlChars(textNode.__text);
            else
                result += textNode.__text;
        }

        return result;
    }

    function serializeTextNodeContents(textNode) {
        var result = "";

        if (textNode instanceof Object) {
            result += serializeComplexTextNodeContents(textNode);
        } else if (textNode !== null) {
            if (config.escapeMode)
                result += escapeXmlChars(textNode);
            else
                result += textNode;
        }

        return result;
    }

    function serializeArray(elementArray, elementName, attributes) {
        var result = "";

        if (elementArray.length === 0) {
            result += serializeStartTag(elementArray, elementName, attributes, true);
        } else {
            for (var i = 0; i < elementArray.length; i++) {
                result += serializeJavaScriptObject(elementArray[i], elementName, getDataAttributeNames(elementArray[i]));
            }
        }

        return result;
    }

    function serializeJavaScriptObject(element, elementName, attributes) {
        var result = "";

        // Filter out elements
        if (config.jsAttributeFilter && config.jsAttributeFilter.call(null, elementName, element)) {
            return result;
        }
        // Convert element
        if (config.jsAttributeConverter) {
            element = config.jsAttributeConverter.call(null, elementName, element);
        }
        if ((element === undefined || element === null || element === '') && config.selfClosingElements) {
            result += serializeStartTag(element, elementName, attributes, true);
        } else if (typeof element === 'object') {
            if (Object.prototype.toString.call(element) === '[object Array]') {
                result += serializeArray(element, elementName, attributes);
            } else if (element instanceof Date) {
                result += serializeStartTag(element, elementName, attributes, false);
                // Serialize date
                result += config.jsDateUTC ? element.toUTCString() : element.toISOString();
                result += serializeEndTag(element, elementName);
            } else {
                var childElementCount = getDataElementCount(element);
                if (childElementCount > 0 || typeof (element.__text) === 'number' || typeof (element.__text) === 'boolean' || element.__text || element.__cdata) {
                    result += serializeStartTag(element, elementName, attributes, false);
                    result += serializeJavaScriptObjectChildren(element);
                    result += serializeEndTag(element, elementName);
                } else if (config.selfClosingElements) {
                    result += serializeStartTag(element, elementName, attributes, true);
                } else {
                    result += serializeStartTag(element, elementName, attributes, false);
                    result += serializeEndTag(element, elementName);
                }
            }
        } else {
            result += serializeStartTag(element, elementName, attributes, false);
            result += serializeTextNodeContents(element);
            result += serializeEndTag(element, elementName);
        }

        return result;
    }

    function serializeJavaScriptObjectChildren(jsObject) {
        var result = "";

        var elementCount = getDataElementCount(jsObject);

        if (elementCount > 0) {
            for (var elementName in jsObject) {
                if (isSpecialProperty(jsObject, elementName))
                    continue;

                var element = jsObject[elementName];
                var attributes = getDataAttributeNames(element);

                result += serializeJavaScriptObject(element, elementName, attributes);
            }
        }

        result += serializeTextNodeContents(jsObject);

        return result;
    }

    function parseXml(xml) {
        if (xml === undefined) {
            return null;
        }

        if (typeof xml !== "string") {
            return null;
        }

        var parser = null;
        var domNode = null;
        if (DOMParser) {
            parser = new DOMParser(config.xmldomOptions);

            domNode = parser.parseFromString(xml, "text/xml");
        } else if (CustomDOMParser) {
            // This branch is used for node.js, with the xmldom parser.
            parser = new CustomDOMParser(config.xmldomOptions);

            domNode = parser.parseFromString(xml, "text/xml");
        } else if (window && window.DOMParser) {
            parser = new window.DOMParser();
            var parsererrorNS = null;

            var isIEParser = window.ActiveXObject || "ActiveXObject" in window;

            // IE9+ now is here
            if (!isIEParser && document.all && !document.addEventListener) {
                try {
                    parsererrorNS = parser.parseFromString("INVALID", "text/xml").childNodes[0].namespaceURI;
                } catch (err) {
                    parsererrorNS = null;
                }
            }

            try {
                domNode = parser.parseFromString(xml, "text/xml");
                if (parsererrorNS !== null && domNode.getElementsByTagNameNS(parsererrorNS, "parsererror").length > 0) {
                    domNode = null;
                }
            } catch (err) {
                domNode = null;
            }
        } else {
            // IE :(
            if (xml.indexOf("<?") === 0) {
                xml = xml.substr(xml.indexOf("?>") + 2);
            }

            /* global ActiveXObject */
            domNode = new ActiveXObject("Microsoft.XMLDOM");
            domNode.async = "false";
            domNode.loadXML(xml);
        }

        return domNode;
    }

    this.asArray = function asArray(prop) {
        if (prop === undefined || prop === null) {
            return [];
        } else if (prop instanceof Array) {
            return prop;
        } else {
            return [prop];
        }
    };

    this.toXmlDateTime = function toXmlDateTime(dt) {
        if (dt instanceof Date) {
            return dt.toISOString();
        } else if (typeof (dt) === 'number') {
            return new Date(dt).toISOString();
        } else {
            return null;
        }
    };

    this.asDateTime = function asDateTime(prop) {
        if (typeof (prop) === "string") {
            return xmlDateTimeToDate(prop);
        } else {
            return prop;
        }
    };

    /*
        Internally the logic works in a cycle:
        DOM->JS - implemented by custom logic (deserialization).
        JS->XML - implemented by custom logic (serialization).
        XML->DOM - implemented by browser.
    */

    // Transformns an XML string into DOM-tree
    this.xml2dom = function xml2dom(xml) {
        return parseXml(xml);
    };

    // Transforms a DOM tree to JavaScript objects.
    this.dom2js = function dom2js(domNode) {
        return deserializeDomChildren(domNode, null);
    };

    // Transforms JavaScript objects to a DOM tree.
    this.js2dom = function js2dom(jsObject) {
        var xml = this.js2xml(jsObject);
        return parseXml(xml);
    };

    // Transformns an XML string into JavaScript objects.
    this.xml2js = function xml2js(xml) {
        var domNode = parseXml(xml);
        if (domNode != null)
            return this.dom2js(domNode);
        else
            return null;
    };

    // Transforms JavaScript objects into an XML string.
    this.js2xml = function js2xml(jsObject) {
        return serializeJavaScriptObjectChildren(jsObject);
    };

    this.getVersion = function getVersion() {
        return VERSION;
    };
};
