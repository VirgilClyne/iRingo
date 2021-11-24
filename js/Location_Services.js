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
    
    // 创建一个x2js对象进行转换
    const x2js = new X2JS();

    var config = x2js.xml2js(body);
    body = JSON.stringify(config);

    //var body = x2js.xml2js(config)

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

/***************** X2JS *****************/
// prettier-ignore
// https://github.com/x2js/x2js/blob/master/x2js.js
function X2JS(t){function e(t){var e=t.localName;return null==e&&(e=t.baseName),null!=e&&""!==e||(e=t.nodeName),e}function r(t){return t.prefix}function n(t){return"string"==typeof t?t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;"):t}function i(t){return t.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&amp;/g,"&")}function o(e,r,n){switch(t.arrayAccessForm){case"property":e[r]instanceof Array?e[r+"_asArray"]=e[r]:e[r+"_asArray"]=[e[r]]}if(!(e[r]instanceof Array)&&t.arrayAccessFormPaths.length>0){for(var i=!1,o=0;o<t.arrayAccessFormPaths.length;o++){var a=t.arrayAccessFormPaths[o];if("string"==typeof a){if(a===n){i=!0;break}}else if(a instanceof RegExp){if(a.test(n)){i=!0;break}}else if("function"==typeof a&&a(r,n)){i=!0;break}}i&&(e[r]=[e[r]])}}function a(t){var e=t.split(/[-T:+Z]/g),r=new Date(e[0],e[1]-1,e[2]),n=e[5].split(".");if(r.setHours(e[3],e[4],n[0]),n.length>1&&r.setMilliseconds(n[1]),e[6]&&e[7]){var i=60*e[6]+Number(e[7]);i=0+("-"===(/\d\d-\d\d:\d\d$/.test(t)?"-":"+")?-1*i:i),r.setMinutes(r.getMinutes()-i-r.getTimezoneOffset())}else-1!==t.indexOf("Z",t.length-1)&&(r=new Date(Date.UTC(r.getFullYear(),r.getMonth(),r.getDate(),r.getHours(),r.getMinutes(),r.getSeconds(),r.getMilliseconds())));return r}function s(e,r,n){if(t.datetimeAccessFormPaths.length>0)for(var i=n.split(".#")[0],o=0;o<t.datetimeAccessFormPaths.length;o++){var s=t.datetimeAccessFormPaths[o];if("string"==typeof s){if(s===i)return a(e)}else if(s instanceof RegExp){if(s.test(i))return a(e)}else if("function"==typeof s&&s(i))return a(e)}return e}function c(r){for(var n={},i=r.childNodes,o=0;o<i.length;o++){var a=i.item(o);if(a.nodeType===T.ELEMENT_NODE){var s=e(a);t.ignoreRoot?n=u(a,s):n[s]=u(a,s)}}return n}function l(n,a){var c={};c.__cnt=0;for(var l=n.childNodes,f=0;f<l.length;f++){var _=l.item(f),p=e(_);_.nodeType!==T.COMMENT_NODE&&(c.__cnt++,null==c[p]?(c[p]=u(_,a+"."+p),o(c,p,a+"."+p)):(c[p]instanceof Array||(c[p]=[c[p]],o(c,p,a+"."+p)),c[p][c[p].length]=u(_,a+"."+p)))}for(var d=0;d<n.attributes.length;d++){var g=n.attributes.item(d);c.__cnt++;for(var m=g.value,x=0;x<t.attributeConverters.length;x++){var v=t.attributeConverters[x];v.test.call(null,g.name,g.value)&&(m=v.convert.call(null,g.name,g.value))}c[t.attributePrefix+g.name]=m}var h=r(n);return h&&(c.__cnt++,c.__prefix=h),c["#text"]&&(c.__text=c["#text"],c.__text instanceof Array&&(c.__text=c.__text.join("\n")),t.escapeMode&&(c.__text=i(c.__text)),t.stripWhitespaces&&(c.__text=c.__text.trim()),delete c["#text"],"property"===t.arrayAccessForm&&delete c["#text_asArray"],c.__text=s(c.__text,"#text",a+".#text")),c.hasOwnProperty("#cdata-section")&&(c.__cdata=c["#cdata-section"],delete c["#cdata-section"],"property"===t.arrayAccessForm&&delete c["#cdata-section_asArray"]),1===c.__cnt&&c.__text&&!t.keepText?c=c.__text:0===c.__cnt&&"text"===t.emptyNodeForm?c="":c.__cnt>1&&void 0!==c.__text&&t.skipEmptyTextNodesForObj&&(t.stripWhitespaces&&""===c.__text||""===c.__text.trim())&&delete c.__text,delete c.__cnt,t.keepCData||c.hasOwnProperty("__text")||!c.hasOwnProperty("__cdata")||1!==Object.keys(c).length?(t.enableToStringFunc&&(c.__text||c.__cdata)&&(c.toString=function(){return(this.__text?this.__text:"")+(this.__cdata?this.__cdata:"")}),c):c.__cdata?c.__cdata:""}function u(t,e){return t.nodeType===T.DOCUMENT_NODE?c(t):t.nodeType===T.ELEMENT_NODE?l(t,e):t.nodeType===T.TEXT_NODE||t.nodeType===T.CDATA_SECTION_NODE?t.nodeValue:null}function f(e,r,i,o){var a="<"+(e&&e.__prefix?e.__prefix+":":"")+r;if(i)for(var s=0;s<i.length;s++){var c=i[s],l=e[c];t.escapeMode&&(l=n(l)),a+=" "+c.substr(t.attributePrefix.length)+"=",t.useDoubleQuotes?a+='"'+l+'"':a+="'"+l+"'"}return a+=o?" />":">"}function _(t,e){return"</"+(t&&t.__prefix?t.__prefix+":":"")+e+">"}function p(t,e){return-1!==t.indexOf(e,t.length-e.length)}function d(e,r){return!!("property"===t.arrayAccessForm&&p(r.toString(),"_asArray")||0===r.toString().indexOf(t.attributePrefix)||0===r.toString().indexOf("__")||e[r]instanceof Function)}function g(t){var e=0;if(t instanceof Object)for(var r in t)d(t,r)||e++;return e}function m(e){var r=[];if(e instanceof Object)for(var n in e)-1===n.toString().indexOf("__")&&0===n.toString().indexOf(t.attributePrefix)&&r.push(n);return r}function x(e){var r="";return e.__cdata&&(r+="<![CDATA["+e.__cdata+"]]>"),(e.__text||"number"==typeof e.__text||"boolean"==typeof e.__text)&&(t.escapeMode?r+=n(e.__text):r+=e.__text),r}function v(e){var r="";return e instanceof Object?r+=x(e):null!==e&&(t.escapeMode?r+=n(e):r+=e),r}function h(t,e,r){var n="";if(0===t.length)n+=f(t,e,r,!0);else for(var i=0;i<t.length;i++)n+=y(t[i],e,m(t[i]));return n}function y(e,r,n){var i="";if(t.jsAttributeFilter&&t.jsAttributeFilter.call(null,r,e))return i;if(t.jsAttributeConverter&&(e=t.jsAttributeConverter.call(null,r,e)),void 0!==e&&null!==e&&""!==e||!t.selfClosingElements)if("object"==typeof e)if("[object Array]"===Object.prototype.toString.call(e))i+=h(e,r,n);else if(e instanceof Date)i+=f(e,r,n,!1),i+=t.jsDateUTC?e.toUTCString():e.toISOString(),i+=_(e,r);else{var o=g(e);o>0||"number"==typeof e.__text||"boolean"==typeof e.__text||e.__text||e.__cdata?(i+=f(e,r,n,!1),i+=O(e),i+=_(e,r)):t.selfClosingElements?i+=f(e,r,n,!0):(i+=f(e,r,n,!1),i+=_(e,r))}else i+=f(e,r,n,!1),i+=v(e),i+=_(e,r);else i+=f(e,r,n,!0);return i}function O(t){var e="";if(g(t)>0)for(var r in t)if(!d(t,r)){var n=t[r],i=m(n);e+=y(n,r,i)}return e+=v(t)}function b(e){if(void 0===e)return null;if("string"!=typeof e)return null;var r=null,n=null;if(CustomDOMParser)r=new CustomDOMParser(t.xmldomOptions),n=r.parseFromString(e,"text/xml");else if(window&&window.DOMParser){r=new window.DOMParser;var i=null,o=window.ActiveXObject||"ActiveXObject"in window;if(!o&&document.all&&!document.addEventListener)try{i=r.parseFromString("INVALID","text/xml").childNodes[0].namespaceURI}catch(t){i=null}try{n=r.parseFromString(e,"text/xml"),null!==i&&n.getElementsByTagNameNS(i,"parsererror").length>0&&(n=null)}catch(t){n=null}}else 0===e.indexOf("<?")&&(e=e.substr(e.indexOf("?>")+2)),n=new ActiveXObject("Microsoft.XMLDOM"),n.async="false",n.loadXML(e);return n}t=t||{},function(){t.arrayAccessForm=t.arrayAccessForm||"none",t.emptyNodeForm=t.emptyNodeForm||"text",t.jsAttributeFilter=t.jsAttributeFilter,t.jsAttributeConverter=t.jsAttributeConverter,t.attributeConverters=t.attributeConverters||[],t.datetimeAccessFormPaths=t.datetimeAccessFormPaths||[],t.arrayAccessFormPaths=t.arrayAccessFormPaths||[],t.xmldomOptions=t.xmldomOptions||{},void 0===t.enableToStringFunc&&(t.enableToStringFunc=!0),void 0===t.skipEmptyTextNodesForObj&&(t.skipEmptyTextNodesForObj=!0),void 0===t.stripWhitespaces&&(t.stripWhitespaces=!0),void 0===t.useDoubleQuotes&&(t.useDoubleQuotes=!0),void 0===t.ignoreRoot&&(t.ignoreRoot=!1),void 0===t.escapeMode&&(t.escapeMode=!0),void 0===t.attributePrefix&&(t.attributePrefix="_"),void 0===t.selfClosingElements&&(t.selfClosingElements=!0),void 0===t.keepCData&&(t.keepCData=!1),void 0===t.keepText&&(t.keepText=!1),void 0===t.jsDateUTC&&(t.jsDateUTC=!1)}(),function(){function t(t){var e=String(t);return 1===e.length&&(e="0"+e),e}"function"!=typeof String.prototype.trim&&(String.prototype.trim=function(){return this.replace(/^\s+|^\n+|(\s|\n)+$/g,"")}),"function"!=typeof Date.prototype.toISOString&&(Date.prototype.toISOString=function(){return this.getUTCFullYear()+"-"+t(this.getUTCMonth()+1)+"-"+t(this.getUTCDate())+"T"+t(this.getUTCHours())+":"+t(this.getUTCMinutes())+":"+t(this.getUTCSeconds())+"."+String((this.getUTCMilliseconds()/1e3).toFixed(3)).slice(2,5)+"Z"})}();var T={ELEMENT_NODE:1,TEXT_NODE:3,CDATA_SECTION_NODE:4,COMMENT_NODE:8,DOCUMENT_NODE:9};this.asArray=function(t){return void 0===t||null===t?[]:t instanceof Array?t:[t]},this.toXmlDateTime=function(t){return t instanceof Date?t.toISOString():"number"==typeof t?new Date(t).toISOString():null},this.asDateTime=function(t){return"string"==typeof t?a(t):t},this.xml2dom=function(t){return b(t)},this.dom2js=function(t){return u(t,null)},this.js2dom=function(t){return b(this.js2xml(t))},this.xml2js=function(t){var e=b(t);return null!=e?this.dom2js(e):null},this.js2xml=function(t){return O(t)},this.getVersion=function(){return"3.4.0"}}