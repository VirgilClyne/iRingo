/*
README:https://github.com/VirgilClyne/iRingo
*/

const url = $request.url;
const method = $request.method;
var body = $request.body;

const path1 = "/v1/configs";
const path2 = "/analyticseventsv2/async";

if (url.indexOf(path1) != -1) {
    let configs = JSON.parse(body);
        configs.deviceInfo.preferredLanguages = ["zh-CN","zh-HK","zh-US","en-US"];
        configs.deviceInfo.countryCode = "US";
    body = JSON.stringify(configs);
    console.log('configs');
};

if (url.indexOf(path2) != -1) {
    let async = JSON.parse(body);
        if (async.data.session.mobileData) {
            async.data.session.mobileData.countryCode = "310";
            async.data.session.mobileData.carrier = "Google Fi";
            async.data.session.mobileData.networkCode = "260";
        };
    body = JSON.stringify(async);
    console.log('async');
};

$done({body});
