/*
README:https://github.com/VirgilClyne/iRingo
*/

/*
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
*/

const url = $request.url;
var body = $response.body;

// Get Origin Parameter
const OriginParameter = /^https?:\/\/(weather-data|weather-data-origin)\.apple\.com\/(v1|v2)\/weather\/([\w-_]+)\/(-?\d+\.\d?)\/(-?\d+\.\d?).*(country=[A-Z]{2})?.*/
const [dataServer， apiVer, language, lat, lng, countryCode] = url.match(OriginParameter)

//Search Nearest WeatherStation
//https://api.waqi.info/mapq/nearest/?geo=1/lat/lng
const nearest = search(lat, lng)

//Show Nearest WeatherStation
//https://api.waqi.info/api/feed/@station.uid/aqi.json
const station = showStation(nearest.d.x)

/*
const pathv1 = "/v1/weather/";
const pathv2 = "/v2/weather/";
*/


if (apiVer == "V1") {
    //let weather = JSON.parse(showStation);
            weather.air_quality.source = nearest.d.nna;
            weather.air_quality.learnMoreURL = "";
            weather.air_quality.airQualityIndex = "nearest.d.v";
            weather.air_quality.airQualityScale = "EPA_NowCast.2115";
            weather.air_quality.primaryPollutant = nearest.d.pol;
            weather.air_quality.pollutants.CO.amount = "";
            weather.air_quality.pollutants.SO2.amount = "";
            weather.air_quality.pollutants.NO2.amount = "";
            weather.air_quality.pollutants.["PM2.5"].amount = "";
            weather.air_quality.pollutants.OZONE.amount = "";
            weather.air_quality.pollutants.PM10.amount = "";
            weather.air_quality.metadata.reported_time = "";
            weather.air_quality.metadata.longitude = "";
            weather.air_quality.metadata.provider_name = "";
            weather.air_quality.metadata.expire_time = "";
            weather.air_quality.metadata.provider_logo = "";
            weather.air_quality.metadata.read_time = "";
            weather.air_quality.metadata.latitude = "";
            weather.air_quality.metadata.version = "";
            weather.air_quality.metadata.language = "";
            weather.air_quality.metadata.data_source = "";
    //    body = JSON.stringify(weather);
    console.log('/v1/weather');
};

if (apiVer == "V2") {
    let weather = JSON.parse(body);
        weather.airQuality.scale = "EPA_NowCast.2115";
    body = JSON.stringify(weather);
    console.log('/v2/weather/');
};

$done({body});


//Search Nearest WeatherStation Function
//https://api.waqi.info/mapq/nearest/?geo=1/lat/lng
function search(lat, lng) {   
    $.getJSON(
      "//api.waqi.info/mapq/nearest/?&geo=1/" + lat + "/" + lng,
      );
    console.log("Geo:" + lat + "/" + lng );
}

//Show Nearest WeatherStation Function
//https://api.waqi.info/api/feed/@station.uid/aqi.json
function showStation(idx) {   
    $.getJSON(
      "//api.waqi.info/api/feed/@" + idx + "/aqi.json",
      );
    console.log("station.uid:" + idx );
}
