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

let params = getParams($argument);
console.log(JSON.stringify(params));

// Default GeoCountryCode: US
GeoCountryCode = params.GeoCountryCode ? params.GeoCountryCode : "US";

const url = $request.url;

const path1 = "/pep/gcc";

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

// Argument Function Supported
function getParams(param) {
    if (typeof $argument != "undefined")
    return Object.fromEntries(
      $argument
        .split("&")
        .map((item) => item.split("="))
        .map(([k, v]) => [k, decodeURIComponent(v)])
    );
  }