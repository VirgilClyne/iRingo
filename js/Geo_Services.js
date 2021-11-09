// 判断是否是重写
const isRequest = typeof $request != "undefined";
// 判断是否是Surge
const isSurge = typeof $httpClient != "undefined";
// 判断是否是QuanX
const isQuanX = typeof $task != "undefined";
// 判断是否是Loon
const isLoon = typeof $loon != "undefined";

/*
README:https://github.com/VirgilClyne/iRingo
*/

let GeoCountryCode = "US";

if (typeof $argument != "undefined") {
    let arg = Object.fromEntries($argument.split("&").map((item) => item.split("=")));
    console.log(JSON.stringify(arg));
    GeoCountryCode = arg.GeoCountryCode;
};

const url = $request.url;

const path1 = "/pep/gcc";

if (url.indexOf(path1) != -1) {
    var today = new Date();
    var UTCstring = today.toUTCString();
    var response = {};
    if (isQuanX) response.status = 'HTTP/1.1 200 OK';
    if (isSurge || isLoon) response.status = 200;
    response.headers = {
        'Content-Type': 'text/html',
        'Date': UTCstring,
        'Connection': 'keep-alive',
        'Content-Encoding': 'identity'
    };
    response.body = GeoCountryCode;
    $done({response});
}
else {
    done({})
}
