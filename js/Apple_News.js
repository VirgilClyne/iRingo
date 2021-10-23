/*
README:https://github.com/VirgilClyne/iRingo
*/

const url = $request.url;
var body = $request.body;

const path1 = "/v1/configs";
const path2 = "/analyticseventsv2/async";

if (url.indexOf(path1) != -1) {
    let obj = JSON.parse(body);  
        obj["deviceInfo"]["preferredLanguages"] = ["zh-CN","zh-HK","zh-US","en-US"];
        obj["deviceInfo"]["countryCode"] = "US";
    body = JSON.stringify(obj);
};

if (url.indexOf(path2) != -1) {
    let obj = JSON.parse(body);
        obj["data"]["session"]["mobileData"]["countryCode"] = "310";
        obj["data"]["session"]["mobileData"]["carrier"] = "Google Fi";
        obj["data"]["session"]["mobileData"]["networkCode"] = "260";
    body = JSON.stringify(obj);
};

$done({body});
