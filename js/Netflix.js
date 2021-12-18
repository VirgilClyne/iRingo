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

// Argument Function Supported
if (typeof $argument != "undefined") {
    let arg = Object.fromEntries($argument.split("&").map((item) => item.split("=")));
    console.log(JSON.stringify(arg));
    location.region_name = arg.region_name ? arg.region_name : "";
    location.type = arg.type ? arg.type : "COUNTRY_CODE";
    location.zip_code = arg.zip_code ? arg.zip_code : "";
    location.asn = arg.asn ? arg.asn : 41378;
    location.country_code = arg.country_code ? arg.country_code : "SG";
    location.carrier = arg.carrier ? arg.carrier : "kirino llc";
    location.city_name = arg.city_name? arg.city_name : "";
    location.connection_type = arg.connection_type ? arg.connection_type : "";
    location.dma = arg.dma ? arg.dma : 0;
    home_location.country_code = arg.country_code ? arg.country_code : "SG";
};

const url = $request.url;

const path1 = "/iosui/user/";

if (url.search(path1) != -1) {
  let body = $response.body;
  console.log(path1);
  let content = JSON.parse(body);
  content.value?.config?.allowWidevinePlayback = content.value?.config?.allowWidevinePlayback ? arg.allowWidevinePlayback : true;
  content.value?.config?.airPlayDisabledEnabledOnBuild = content.value?.config?.airPlayDisabledEnabledOnBuild ? arg.airPlayDisabledEnabledOnBuild : "99.99.0";
  content.value?.config?.preferRichWebVTTOverImageBasedSubtitle= content.value?.config?.preferRichWebVTTOverImageBasedSubtitle ? arg.preferRichWebVTTOverImageBasedSubtitle : true;
  body = JSON.stringify(content);
  done({ body });
};
