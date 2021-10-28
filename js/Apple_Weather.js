/*
README:https://github.com/VirgilClyne/iRingo
*/
let languagev1 = "zh-CN_CN"
let languagev2 = "zh-Hans-CN"
let include = "air_quality,current_observations,hourly_forecast,daily_forecast,now_links,severe_weather,next_hour_forecast"
let dataSets = "currentWeather,forecastDaily,forecastHourly,severeWeather,airQuality,forecastNextHour";
let country = "CN";

if (typeof $argument != "undefined") {
    let arg = Object.fromEntries($argument.split("&").map((item) => item.split("=")));
    console.log(JSON.stringify(arg));
    languagev1 = arg.languagev1;
    languagev2 = arg.languagev2;
    include = arg.include;
    dataSets = arg.dataSets;
    country = arg.country;
};

const url = $request.url;
var body = $response.body;

const path1 = "/v1/weather/";
const path2 = "/v2/weather/";

if (url.indexOf(path1) != -1) {
    let weather = JSON.parse(body);
        if (weather.air_quality && weather.air_quality.airQualityScale) weather.air_quality.airQualityScale = "EPA_NowCast.2115";
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