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

/* 
//🇭🇰HongKong
location = {
    "region_name": "",
    "type": "COUNTRY_CODE",
    "asn": 141677,
    "zip_code": "",
    "state_name": "",
    "country_code": "HK",
    "carrier": "nathosts limited",
    "city_name": "",
    "connection_type": "",
    "dma": 0
  };
//🇸🇬Singapore
"location": {
    "region_name": "",
    "type": "COUNTRY_CODE",
    "asn": 41378,
    "zip_code": "",
    "state_name": "",
    "country_code": "SG",
    "carrier": "kirino llc",
    "city_name": "",
    "connection_type": "",
    "dma": 0
  },
//🇹🇼TaiWan 1
  "location": {
    "region_name": "",
    "type": "ZIP_CODE",
    "asn": 3462,
    "zip_code": "100",
    "state_name": "taipei",
    "country_code": "TW",
    "carrier": "data communication business group",
    "city_name": "zhongzheng district",
    "connection_type": "dsl",
    "dma": 0
  },
//🇹🇼TaiWan 2
    "location": {
    "region_name": "",
    "type": "COUNTRY_CODE",
    "asn": 9304,
    "zip_code": "",
    "state_name": "",
    "country_code": "HK",
    "carrier": "hgc global communications limited",
    "city_name": "",
    "connection_type": "mobile wireless",
    "dma": 0
  },
//🇹🇼🇺🇸UnitedStates
  "location": {
    "region_name": "northeast",
    "type": "ZIP_CODE",
    "asn": 46997,
    "zip_code": "13235",
    "state_name": "new york",
    "country_code": "US",
    "carrier": "black mesa corporation",
    "city_name": "syracuse",
    "connection_type": "",
    "dma": 555
  },
*/

// Default location
let location = {
  "region_name": "",
  "type": "COUNTRY_CODE",
  "asn": 41378,
  "zip_code": "",
  "state_name": "",
  "country_code": "SG",
  "carrier": "kirino llc",
  "city_name": "",
  "connection_type": "",
  "dma": 0
};
let home_location = { "country_code": "SG" };

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

const path1 = "/token";
const path2 = "/session";
const path3 = "/v1/public/graphql";
const path4 = "/svc/content/DmcVideo";

/*
if (url.search(path1) != -1) {
    let status = $response.status;
    let body = $response.body;
    let token = JSON.parse(body);
    console.log(path1);
    if (isLoon && (status = 400)){
        if (token.error) console.log(token.error);
        if (token.error_description) console.log(token.error_description);
        $done({})
    } else if (isQuanX && (status = "HTTP/1.1 400 Bad Request")){
        if (token.error) console.log(token.error);
        if (token.error_description) console.log(token.error_description);
        $done({})
    } else if (isSurge && (status = 400)){
        if (token.error) console.log(token.error);
        if (token.error_description) console.log(token.error_description);
        $done({})
    } else {
        if (token.refresh_token) console.log(token.refresh_token);
        if (token.token_type) console.log(token.token_type);
        if (token.access_token) console.log(token.access_token);
        if (token.expires_in) console.log(token.expires_in);
        $done({})
    }
};
*/

if (url.search(path2) != -1) {
    let body = $response.body;
    console.log(path2);
    let session = JSON.parse(body);
    if (session.location) session.location = location;
    if (session.home_location) session.home_location = home_location;
    body = JSON.stringify(session);
    done({ body });
};

if (url.search(path3) != -1) {
    let body = $response.body;
    console.log(path3);
    let graphql = JSON.parse(body);
    if (graphql.data?.login?.activeSession?.location) graphql.data.login.activeSession.location = location;
    if (graphql.data?.login?.activeSession?.homeLocation) graphql.data.login.activeSession.homeLocation = home_location;
    if (graphql.data?.me?.activeSession?.location) graphql.data.me.activeSession.location = location;
    if (graphql.data?.me?.activeSession?.homeLocation) graphql.data.me.activeSession.homeLocation = home_location;
    if (graphql.data?.activeSession?.location) graphql.data.activeSession.location = location;
    if (graphql.data?.activeSession?.homeLocation) graphql.data.activeSession.homeLocation = home_location;
    if (graphql.extensions?.sdk?.session?.location) graphql.extensions.sdk.session.location = location;
    if (graphql.extensions?.sdk?.session?.homeLocation) graphql.extensions.sdk.session.homeLocation = home_location;
    body = JSON.stringify(graphql);
    done({ body });
};

if (url.search(path4) != -1) {
  let body = $response.body;
  console.log(path4);
  let content = JSON.parse(body);
  if (content.data?.DmcVideo?.video?.currentAvailability?.region) content.data.DmcVideo.video.currentAvailability.region = location.country_code;
  body = JSON.stringify(content);
  done({ body });
};
