/*
README：https://github.com/VirgilClyne/iRingo
 */

const path1 = "/v1/configs";
const path2 = "/analyticseventsv2/async";

const url = $request.url;
var body = $request.body;

if (url.indexOf(path1) != -1) {
    var obj = JSON.parse(body);
    if (obj.countryCode) countryCode = "US";
    body = JSON.stringify(obj);
}

if (url.indexOf(path2) != -1) {
    let SIM = /"mobileData": \{.*\}/;
    body = body.match(SIM);
    var obj = JSON.parse(body);
    if (obj.countryCode) obj.countryCode = "310";
    if (obj.carrier) obj.carrier = "Google Fi";
    if (obj.networkCode) obj.networkCode = "260";
    body = JSON.stringify(obj);
}

$done({body});