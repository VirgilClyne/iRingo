// 判断是否是重写
const isRequest = typeof $request != "undefined";
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

    // 创建一个x2js对象进行转换
    const x2js = new globalThis.X2JS();

// Default GeoCountryCode: US
let GeoCountryCode = "US";
// Default Location Services Configs (test)
let GEOAddressCorrectionEnabled = true;
let ShouldEnableLagunaBeach = true;
let PedestrianAREnabled = true;

// Argument Function Supported
if (typeof $argument != "undefined") {
    let arg = Object.fromEntries($argument.split("&").map((item) => item.split("=")));
    console.log(JSON.stringify(arg));
    GeoCountryCode = arg.GeoCountryCode;
    GEOAddressCorrectionEnabled = arg.GEOAddressCorrectionEnabled;
    ShouldEnableLagunaBeach = arg.ShouldEnableLagunaBeach;
    PedestrianAREnabled = arg.PedestrianAREnabled;
};

const url = $request.url;

const path0 = "/config/defaults";
const path1 = "/pep/gcc";

if (url.indexOf(path0) != -1) {
    console.log(path0);
    var body = $response.body;

    var config = x2js.xml_str2json(body);
    body = JSON.stringify(config);

    var body = x2js.json2xml_str(config)

    done({ body });
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

/***************** Env *****************/
// prettier-ignore
// https://github.com/x2js/x2js/blob/master/x2js.js
!function(t,e){"use strict";"function"==typeof define&&define.amd?define([],e):"object"==typeof module&&module.exports?module.exports=e(require("@xmldom/xmldom").DOMParser):t.X2JS=e()}(this,function(t){"use strict";return function(e){function r(t){var e=t.localName;return null==e&&(e=t.baseName),null!=e&&""!==e||(e=t.nodeName),e}function n(t){return t.prefix}function i(t){return"string"==typeof t?t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;"):t}function o(t){return t.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&amp;/g,"&")}function a(t,r,n){switch(e.arrayAccessForm){case"property":t[r]instanceof Array?t[r+"_asArray"]=t[r]:t[r+"_asArray"]=[t[r]]}if(!(t[r]instanceof Array)&&e.arrayAccessFormPaths.length>0){for(var i=!1,o=0;o<e.arrayAccessFormPaths.length;o++){var a=e.arrayAccessFormPaths[o];if("string"==typeof a){if(a===n){i=!0;break}}else if(a instanceof RegExp){if(a.test(n)){i=!0;break}}else if("function"==typeof a&&a(r,n)){i=!0;break}}i&&(t[r]=[t[r]])}}function s(t){var e=t.split(/[-T:+Z]/g),r=new Date(e[0],e[1]-1,e[2]),n=e[5].split(".");if(r.setHours(e[3],e[4],n[0]),n.length>1&&r.setMilliseconds(n[1]),e[6]&&e[7]){var i=60*e[6]+Number(e[7]);i=0+("-"===(/\d\d-\d\d:\d\d$/.test(t)?"-":"+")?-1*i:i),r.setMinutes(r.getMinutes()-i-r.getTimezoneOffset())}else-1!==t.indexOf("Z",t.length-1)&&(r=new Date(Date.UTC(r.getFullYear(),r.getMonth(),r.getDate(),r.getHours(),r.getMinutes(),r.getSeconds(),r.getMilliseconds())));return r}function c(t,r,n){if(e.datetimeAccessFormPaths.length>0)for(var i=n.split(".#")[0],o=0;o<e.datetimeAccessFormPaths.length;o++){var a=e.datetimeAccessFormPaths[o];if("string"==typeof a){if(a===i)return s(t)}else if(a instanceof RegExp){if(a.test(i))return s(t)}else if("function"==typeof a&&a(i))return s(t)}return t}function l(t){for(var n={},i=t.childNodes,o=0;o<i.length;o++){var a=i.item(o);if(a.nodeType===A.ELEMENT_NODE){var s=r(a);e.ignoreRoot?n=f(a,s):n[s]=f(a,s)}}return n}function u(t,i){var s={};s.__cnt=0;for(var l=t.childNodes,u=0;u<l.length;u++){var _=l.item(u),d=r(_);_.nodeType!==A.COMMENT_NODE&&(s.__cnt++,null==s[d]?(s[d]=f(_,i+"."+d),a(s,d,i+"."+d)):(s[d]instanceof Array||(s[d]=[s[d]],a(s,d,i+"."+d)),s[d][s[d].length]=f(_,i+"."+d)))}for(var p=0;p<t.attributes.length;p++){var g=t.attributes.item(p);s.__cnt++;for(var m=g.value,x=0;x<e.attributeConverters.length;x++){var h=e.attributeConverters[x];h.test.call(null,g.name,g.value)&&(m=h.convert.call(null,g.name,g.value))}s[e.attributePrefix+g.name]=m}var v=n(t);return v&&(s.__cnt++,s.__prefix=v),s["#text"]&&(s.__text=s["#text"],s.__text instanceof Array&&(s.__text=s.__text.join("\n")),e.escapeMode&&(s.__text=o(s.__text)),e.stripWhitespaces&&(s.__text=s.__text.trim()),delete s["#text"],"property"===e.arrayAccessForm&&delete s["#text_asArray"],s.__text=c(s.__text,"#text",i+".#text")),s.hasOwnProperty("#cdata-section")&&(s.__cdata=s["#cdata-section"],delete s["#cdata-section"],"property"===e.arrayAccessForm&&delete s["#cdata-section_asArray"]),1===s.__cnt&&s.__text&&!e.keepText?s=s.__text:0===s.__cnt&&"text"===e.emptyNodeForm?s="":s.__cnt>1&&void 0!==s.__text&&e.skipEmptyTextNodesForObj&&(e.stripWhitespaces&&""===s.__text||""===s.__text.trim())&&delete s.__text,delete s.__cnt,e.keepCData||s.hasOwnProperty("__text")||!s.hasOwnProperty("__cdata")||1!==Object.keys(s).length?(e.enableToStringFunc&&(s.__text||s.__cdata)&&(s.toString=function(){return(this.__text?this.__text:"")+(this.__cdata?this.__cdata:"")}),s):s.__cdata?s.__cdata:""}function f(t,e){return t.nodeType===A.DOCUMENT_NODE?l(t):t.nodeType===A.ELEMENT_NODE?u(t,e):t.nodeType===A.TEXT_NODE||t.nodeType===A.CDATA_SECTION_NODE?t.nodeValue:null}function _(t,r,n,o){var a="<"+(t&&t.__prefix?t.__prefix+":":"")+r;if(n)for(var s=0;s<n.length;s++){var c=n[s],l=t[c];e.escapeMode&&(l=i(l)),a+=" "+c.substr(e.attributePrefix.length)+"=",e.useDoubleQuotes?a+='"'+l+'"':a+="'"+l+"'"}return a+=o?" />":">"}function d(t,e){return"</"+(t&&t.__prefix?t.__prefix+":":"")+e+">"}function p(t,e){return-1!==t.indexOf(e,t.length-e.length)}function g(t,r){return!!("property"===e.arrayAccessForm&&p(r.toString(),"_asArray")||0===r.toString().indexOf(e.attributePrefix)||0===r.toString().indexOf("__")||t[r]instanceof Function)}function m(t){var e=0;if(t instanceof Object)for(var r in t)g(t,r)||e++;return e}function x(t){var r=[];if(t instanceof Object)for(var n in t)-1===n.toString().indexOf("__")&&0===n.toString().indexOf(e.attributePrefix)&&r.push(n);return r}function h(t){var r="";return t.__cdata&&(r+="<![CDATA["+t.__cdata+"]]>"),(t.__text||"number"==typeof t.__text||"boolean"==typeof t.__text)&&(e.escapeMode?r+=i(t.__text):r+=t.__text),r}function v(t){var r="";return t instanceof Object?r+=h(t):null!==t&&(e.escapeMode?r+=i(t):r+=t),r}function y(t,e,r){var n="";if(0===t.length)n+=_(t,e,r,!0);else for(var i=0;i<t.length;i++)n+=b(t[i],e,x(t[i]));return n}function b(t,r,n){var i="";if(e.jsAttributeFilter&&e.jsAttributeFilter.call(null,r,t))return i;if(e.jsAttributeConverter&&(t=e.jsAttributeConverter.call(null,r,t)),void 0!==t&&null!==t&&""!==t||!e.selfClosingElements)if("object"==typeof t)if("[object Array]"===Object.prototype.toString.call(t))i+=y(t,r,n);else if(t instanceof Date)i+=_(t,r,n,!1),i+=e.jsDateUTC?t.toUTCString():t.toISOString(),i+=d(t,r);else{var o=m(t);o>0||"number"==typeof t.__text||"boolean"==typeof t.__text||t.__text||t.__cdata?(i+=_(t,r,n,!1),i+=O(t),i+=d(t,r)):e.selfClosingElements?i+=_(t,r,n,!0):(i+=_(t,r,n,!1),i+=d(t,r))}else i+=_(t,r,n,!1),i+=v(t),i+=d(t,r);else i+=_(t,r,n,!0);return i}function O(t){var e="";if(m(t)>0)for(var r in t)if(!g(t,r)){var n=t[r],i=x(n);e+=b(n,r,i)}return e+=v(t)}function T(r){if(void 0===r)return null;if("string"!=typeof r)return null;var n=null,i=null;if(t)n=new t(e.xmldomOptions),i=n.parseFromString(r,"text/xml");else if(window&&window.DOMParser){n=new window.DOMParser;var o=null,a=window.ActiveXObject||"ActiveXObject"in window;if(!a&&document.all&&!document.addEventListener)try{o=n.parseFromString("INVALID","text/xml").childNodes[0].namespaceURI}catch(t){o=null}try{i=n.parseFromString(r,"text/xml"),null!==o&&i.getElementsByTagNameNS(o,"parsererror").length>0&&(i=null)}catch(t){i=null}}else 0===r.indexOf("<?")&&(r=r.substr(r.indexOf("?>")+2)),i=new ActiveXObject("Microsoft.XMLDOM"),i.async="false",i.loadXML(r);return i}e=e||{},function(){e.arrayAccessForm=e.arrayAccessForm||"none",e.emptyNodeForm=e.emptyNodeForm||"text",e.jsAttributeFilter=e.jsAttributeFilter,e.jsAttributeConverter=e.jsAttributeConverter,e.attributeConverters=e.attributeConverters||[],e.datetimeAccessFormPaths=e.datetimeAccessFormPaths||[],e.arrayAccessFormPaths=e.arrayAccessFormPaths||[],e.xmldomOptions=e.xmldomOptions||{},void 0===e.enableToStringFunc&&(e.enableToStringFunc=!0),void 0===e.skipEmptyTextNodesForObj&&(e.skipEmptyTextNodesForObj=!0),void 0===e.stripWhitespaces&&(e.stripWhitespaces=!0),void 0===e.useDoubleQuotes&&(e.useDoubleQuotes=!0),void 0===e.ignoreRoot&&(e.ignoreRoot=!1),void 0===e.escapeMode&&(e.escapeMode=!0),void 0===e.attributePrefix&&(e.attributePrefix="_"),void 0===e.selfClosingElements&&(e.selfClosingElements=!0),void 0===e.keepCData&&(e.keepCData=!1),void 0===e.keepText&&(e.keepText=!1),void 0===e.jsDateUTC&&(e.jsDateUTC=!1)}(),function(){function t(t){var e=String(t);return 1===e.length&&(e="0"+e),e}"function"!=typeof String.prototype.trim&&(String.prototype.trim=function(){return this.replace(/^\s+|^\n+|(\s|\n)+$/g,"")}),"function"!=typeof Date.prototype.toISOString&&(Date.prototype.toISOString=function(){return this.getUTCFullYear()+"-"+t(this.getUTCMonth()+1)+"-"+t(this.getUTCDate())+"T"+t(this.getUTCHours())+":"+t(this.getUTCMinutes())+":"+t(this.getUTCSeconds())+"."+String((this.getUTCMilliseconds()/1e3).toFixed(3)).slice(2,5)+"Z"})}();var A={ELEMENT_NODE:1,TEXT_NODE:3,CDATA_SECTION_NODE:4,COMMENT_NODE:8,DOCUMENT_NODE:9};this.asArray=function(t){return void 0===t||null===t?[]:t instanceof Array?t:[t]},this.toXmlDateTime=function(t){return t instanceof Date?t.toISOString():"number"==typeof t?new Date(t).toISOString():null},this.asDateTime=function(t){return"string"==typeof t?s(t):t},this.xml2dom=function(t){return T(t)},this.dom2js=function(t){return f(t,null)},this.js2dom=function(t){return T(this.js2xml(t))},this.xml2js=function(t){var e=T(t);return null!=e?this.dom2js(e):null},this.js2xml=function(t){return O(t)},this.getVersion=function(){return"3.4.0"}}});