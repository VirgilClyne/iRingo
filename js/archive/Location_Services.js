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

if (url.indexOf(path0) != -1) {
    console.log(path0);
    if (isRequest && !isResponse) {
        var headers = $request.headers;
        headers['If-None-Match'] = '';
        done({ headers });
    }
    if (isResponse) {
        var body = $response.body;
        //var comappleGEO = /(<plist version="1\.0">(?:\n\s{0,})<dict>(?:\n\s{0,})<key>com\.apple\.GEO<\/key>(?:\n\s{0,})<dict>(?:\n\s{0,}))(.*)((?:\n\s{0,})<\/dict>(?:\n\s{0,})<\/plist>)/m;
        //var CountryProviders = /<key>CountryProviders<\/key>/m;
        var CN = /(<key>CountryProviders<\/key>(?:\n\s{0,})<dict>(?:\n\s.*)*<key>CN<\/key>(?:\n\s{0,})<dict>(?:\n\s{0,}))(.*)((?:\n\s.*)*<\/dict>(?:\n\s{0,})<key>CO<\/key>)/m;
        var EnableAlberta = /((?:<plist version="1\.0">(?:\n\s{0,})<dict>(?:\n\s{0,})<key>com\.apple\.GEO<\/key>(?:\n\s{0,})<dict>(?:\n\s.*)*<key>CountryProviders<\/key>(?:\n\s{0,})<dict>(?:\n\s.*)*<key>CN<\/key>(?:\n\s{0,})<dict>(?:\n\s.*)*)<key>EnableAlberta<\/key>(?:\n\s{0,})<)(true|false)(\/>((?:\n\s.*)*<\/dict>(?:\n\s{0,})<key>CO<\/key>))/m;
        var GEOAddressCorrectionEnabled = /((?:<plist version="1\.0">(?:\n\s{0,})<dict>(?:\n\s{0,})<key>com\.apple\.GEO<\/key>(?:\n\s{0,})<dict>(?:\n\s.*)*<key>CountryProviders<\/key>(?:\n\s{0,})<dict>(?:\n\s.*)*<key>CN<\/key>(?:\n\s{0,})<dict>(?:\n\s.*)*)<key>GEOAddressCorrectionEnabled<\/key>(?:\n\s{0,})<)(true|false)(\/>((?:\n\s.*)*<\/dict>(?:\n\s{0,})<key>CO<\/key>))/m;
        var LocalitiesAndLandmarksSupported = /((?:<plist version="1\.0">(?:\n\s{0,})<dict>(?:\n\s{0,})<key>com\.apple\.GEO<\/key>(?:\n\s{0,})<dict>(?:\n\s.*)*<key>CountryProviders<\/key>(?:\n\s{0,})<dict>(?:\n\s.*)*<key>CN<\/key>(?:\n\s{0,})<dict>(?:\n\s.*)*)<key>LocalitiesAndLandmarksSupported<\/key>(?:\n\s{0,})<)(true|false)(\/>((?:\n\s.*)*<\/dict>(?:\n\s{0,})<key>CO<\/key>))/m;
        var PedestrianAREnabled = /((?:<plist version="1\.0">(?:\n\s{0,})<dict>(?:\n\s{0,})<key>com\.apple\.GEO<\/key>(?:\n\s{0,})<dict>(?:\n\s.*)*<key>CountryProviders<\/key>(?:\n\s{0,})<dict>(?:\n\s.*)*<key>CN<\/key>(?:\n\s{0,})<dict>(?:\n\s.*)*)<key>PedestrianAREnabled<\/key>(?:\n\s{0,})<)(true|false)(\/>((?:\n\s.*)*<\/dict>(?:\n\s{0,})<key>CO<\/key>))/m;

        //body = config.replace(variable, parameter);
        //body = body.replace(EnableAlberta, '$1false$3');
        body = body.replace(GEOAddressCorrectionEnabled, '$1true$3');
        body = body.replace(LocalitiesAndLandmarksSupported, '$1true$3');
        body = body.replace(PedestrianAREnabled, '$1true$3');
        body = body.replace(CN, '$1<key>ShouldEnableLagunaBeach</key>\n				<true/>\n$2$3');
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

function xmlReplace(body, variable, parameter) {
    xml = body.replace(variable, parameter);
    return xml;
};
