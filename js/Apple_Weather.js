/*
README:https://github.com/VirgilClyne/iRingo
*/

const url = $request.url;
var body = $response.body;

const path1 = "/v1/weather/";
const path2 = "/v2/weather/";

if (url.indexOf(path1) != -1) {
    let weather = JSON.parse(body);
        if (weather.airQuality && weather.airQuality.airQualityScale) weather.airQuality.airQualityScale = "EPA_NowCast.2115";
    body = JSON.stringify(weather);
    console.log('/v1/weather');
};

if (url.indexOf(path2) != -1) {
    let weather = JSON.parse(body);
        if (weather.airQuality && weather.airQuality.scale) weather.airQuality.scale = "EPA_NowCast.2115";
    body = JSON.stringify(weather);
    console.log('/v2/weather/');
};

$done({body});