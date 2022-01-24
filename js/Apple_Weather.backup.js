/*
README:https://github.com/VirgilClyne/iRingo
*/

const $ = new Env('Apple_Weather');
var url = $request.url;
$.VAL_headers =  {
    'Content-Type': `application/x-www-form-urlencoded`,
    'Origin': `https://waqi.info`,
    'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/605.1.15`,
    'Referer': `https://waqi.info/`,
}

!(async () => {
    await getOrigin(url)
    await getAQIstatus($.apiVer, $response.body)
    await getNearest($.apiVer, $.lat, $.lng)
    await getToken($.idx)
    await getStation($.token, $.idx)
    await outputData($.apiVer, $.stations, $.obs)
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())

// Step 1
// Get Origin Parameter
function getOrigin(url) {
    return new Promise((resove) => {
        const Regular = /^https?:\/\/(weather-data|weather-data-origin)\.apple\.com\/(v1|v2)\/weather\/([\w-_]+)\/(-?\d+\.\d+)\/(-?\d+\.\d+).*(country=[A-Z]{2})?.*/;
        try {
            [$.url, $.dataServer, $.apiVer, $.language, $.lat, $.lng, $.countryCode] = url.match(Regular);
            $.log(`🎉 ${$.name}, getOrigin, Finish`, $.url, `${$.dataServer}, ${$.apiVer}, ${$.language}, ${$.lat}, ${$.lng}, ${$.countryCode}`, '')
        } catch (e) {
            $.log(`❗️ ${$.name}, getAQIstatus, Failure`, ` error = ${e}`, '')
        } finally {
            $.log(`🎉 ${$.name}, getOrigin, Finish`, '')
            resove()
        }
    })
};

// Step 2
// Get AQI Source Status
function getAQIstatus(api, body) {
    return new Promise((resove) => {
        const weather = JSON.parse(body);
        const provider = ['和风天气', 'QWeather']
        try {
            if (api == 'v1' && weather.air_quality) {
                $.log(`⚠️ ${$.name}, getAQIstatus, AQ data ${api}`, '');
                if (provider.includes(weather.air_quality.metadata.provider_name)) {
                    $.log(`🎉 ${$.name}, getAQIstatus, Continue`, `${weather.air_quality.metadata.provider_name}`, '')
                    resove()
                } else {
                    $.log(`⚠️ ${$.name}, getAQIstatus, Abort`, `${weather.air_quality.metadata.provider_name}`, '');
                    $.done()
                }
            } else if (api == 'v2' && weather.airQuality) {
                $.log(`⚠️ ${$.name}, getAQIstatus, AQ data ${api}`, '');
                if (provider.includes(weather.airQuality.metadata.providerName)) {
                    $.log(`🎉 ${$.name}, getAQIstatus, Continue`, `${weather.airQuality.metadata.providerName}`, '')
                    resove()
                } else {
                    $.log(`⚠️ ${$.name}, getAQIstatus, Abort`, `${weather.airQuality.metadata.providerName}`, '');
                    $.done()
                }
            } else {
                $.log(`🎉 ${$.name}, getAQIstatus, non-existent AQI data, Continue`, '')
                resove()
            }
        } catch (e) {
            $.log(`❗️ ${$.name}, getAQIstatus, Failure`, ` error = ${e}`, '')
            } finally {
                $.log(`🎉 ${$.name}, getAQIstatus, Finish`, '')
                resove()
            }
    })
};



// Step 3
// Search Nearest Observation Station
// https://api.waqi.info/mapq/nearest/?n=1&geo=1/lat/lng
// https://api.waqi.info/mapq2/nearest?n=1&geo=1/lat/lng
function getNearest(api, lat, lng) {
    return new Promise((resove) => {
        if (api == "v1") mapq = 'mapq'
        else if (api == "v2") mapq = 'mapq2'
        const url = { url: `https://api.waqi.info/${mapq}/nearest?n=1&geo=1/${lat}/${lng}`, headers: $.VAL_headers }
        $.get(url, (error, response, data) => {
            try {
                const _data = JSON.parse(data)
                if (error) throw new Error(error)
                else if (api == "v1" && _data.d[0]) {
                    $.stations = _data.d[0];
                    $.idx = $.stations.x;
                    $.country = $.stations.cca2
                    resove()
                } else if (api == "v2" && _data.status == "ok") {
                    $.stations = _data.data.stations[0];
                    $.idx = $.stations.idx;
                    $.country = $.stations.country
                    resove()
                } else {
                    $.log(`❗️ ${$.name}, getNearest, Error, api: ${api}`, `station: ${_data.d[0]}`, `data = ${data}`, '')
                    $.done()
                }
            } catch (e) {
                $.log(`❗️ ${$.name}, getNearest, Failure`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
            } finally {
                $.log(`🎉 ${$.name}, getNearest, Finish`, `data = ${data}`, '')
                resove()
            }
        })
    })
};

// Step 4
// Get Nearest Observation Station Token
// https://api.waqi.info/api/token/station.uid
function getToken(idx) {
    return new Promise((resove) => {
        const url = { url: `https://api.waqi.info/api/token/${idx}`, headers: $.VAL_headers }
        $.get(url, (error, response, data) => {
            try {
                const _data = JSON.parse(data)
                if (error) throw new Error(error)
                else if (_data.rxs.status == "ok") {
                    $.token = _data.rxs.obs[0].msg.token;
                    resove()
                } else {
                    $.log(`⚠️ ${$.name}, getToken, Error, status: ${_data.rxs.status}`, `data = ${data}`, '')
                    $.token = "na";
                    resove()
                }
            } catch (e) {
                $.log(`❗️ ${$.name}, getToken, Failure`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
            } finally {
                $.log(`🎉 ${$.name}, getToken, Finish`, '')
                resove()
            }
        });
    })
};

// Step 5
// Get Nearest Observation Station AQI Data
// https://api.waqi.info/api/feed/@station.uid/now.json
// https://api.waqi.info/api/feed/@station.uid/aqi.json
function getStation(token = "na", idx) {
    return new Promise((resove) => {
            const url = { url: `https://api.waqi.info/api/feed/@${idx}/aqi.json`, body: `token=${token}&id=${idx}`, headers: $.VAL_headers }
            $.post(url, (error, response, data) => {
                try {
                    const _data = JSON.parse(data)
                    if (error) throw new Error(error)
                    else if (_data.rxs.status == "ok") {
                        if (_data.rxs.obs.some(o => o.status == 'ok')) {
                            let i = _data.rxs.obs.findIndex(o => o.status == 'ok')
                            let m = _data.rxs.obs.findIndex(o => o.msg)
                            $.obs = _data.rxs.obs[i].msg;
                            if (i >= 0 && m >= 0) $.log(`🎉 ${$.name}, getStation,  i = ${i}, m = ${m}`, '')
                            else if (i < 0 || m < 0) $.log(`❗️ ${$.name}, getStation`, `OBS Get Error`, `i = ${i}, m = ${m}`, `空数据，浏览器访问 https://api.waqi.info/api/feed/@${idx}/aqi.json 查看获取结果`, '')
                            resove()
                        } else {
                            $.log(`❗️ ${$.name}, getStation`, `OBS Status Error`, `obs.status: ${_data.rxs.obs[0].status}`, `data = ${data}`, '')
                            resove()
                        }
                    } else {
                        $.log(`❗️ ${$.name}, getStation`, `RXS Status Error`, `status: ${_data.rxs.status}`, `data = ${data}`, '')
                        resove()
                    }
                } catch (e) {
                    $.log(`❗️ ${$.name}, getStation执行失败!`, `浏览器访问 https://api.waqi.info/api/feed/@${idx}/aqi.json 看看是不是空数据`, `原因：网络不畅或者获取太频繁导致被封`, `error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
                } finally {
                    $.log(`🎉 ${$.name}, getStation, Finish`, '')
                    resove()
                }
            })
    })
};

// Step 6
// Output Data
function outputData(api, stations, obs) {
    return new Promise((resove) => {
        // Input Data
        let body = $response.body
        let weather = JSON.parse(body);
        try {
            if (api == "v1") {
                $.log(`⚠️ ${$.name}, outputData, Detect`, `data ${api}`, '');
                if (!weather.air_quality) {
                    $.log(`⚠️ ${$.name}, non-existent Air Quality data, creating`, '');
                    weather.air_quality = {
                        "isSignificant": true, //重要/置顶
                        "pollutants": {},
                        "metadata": {
                            "version": 1,
                            "data_source": 0, //来自XX读数 0:监测站 1:模型
                        },
                        "name": "AirQuality",
                    };
                };
                if (obs?.aqi) { // From Observation Station
                    weather.air_quality.source = obs.city.name;
                    weather.air_quality.learnMoreURL = obs.city.url + `/${$.country}/m`.toLowerCase();
                    weather.air_quality.airQualityIndex = obs.aqi;
                    weather.air_quality.airQualityScale = "EPA_NowCast.2115";
                    weather.air_quality.primaryPollutant = switchPollutantsType(obs.dominentpol);
                    weather.air_quality.airQualityCategoryIndex = classifyAirQualityLevel(obs.aqi);
                    weather.air_quality.pollutants.CO = { "name": "CO", "amount": obs.iaqi.co?.v || -1, "unit": "μg\/m3" };
                    weather.air_quality.pollutants.NO = { "name": "NO", "amount": obs.iaqi.no?.v || -1, "unit": "μg\/m3" };
                    weather.air_quality.pollutants.NO2 = { "name": "NO2", "amount": obs.iaqi.no2?.v || -1, "unit": "μg\/m3" };
                    weather.air_quality.pollutants.SO2 = { "name": "SO2", "amount": obs.iaqi.so2?.v || -1, "unit": "μg\/m3" };
                    weather.air_quality.pollutants.OZONE = { "name": "OZONE", "amount": obs.iaqi.o3?.v || -1, "unit": "μg\/m3" };
                    weather.air_quality.pollutants.NOX = { "name": "NOX", "amount": obs.iaqi.nox?.v || -1, "unit": "μg\/m3" };
                    weather.air_quality.pollutants["PM2.5"] = { "name": "PM2.5", "amount": obs.iaqi.pm25?.v || -1, "unit": "μg\/m3" };
                    weather.air_quality.pollutants.PM10 = { "name": "PM10", "amount": obs.iaqi.pm10?.v || -1, "unit": "μg\/m3" };
                    weather.air_quality.metadata.reported_time = convertTime(new Date(obs.time.v), 'remain', api);
                    weather.air_quality.metadata.longitude = obs.city.geo[0];
                    weather.air_quality.metadata.provider_name = obs.attributions[obs.attributions.length - 1].name;
                    weather.air_quality.metadata.expire_time = convertTime(new Date(obs.time.v), 'add-1h-floor', api);
                    weather.air_quality.metadata.provider_logo = "https:\/\/waqi.info\/images\/logo.png";
                    weather.air_quality.metadata.read_time = convertTime(new Date(), 'remain', api);
                    weather.air_quality.metadata.latitude = obs.city.geo[1];
                    //weather.air_quality.metadata.version = "";
                    weather.air_quality.metadata.language ? weather.air_quality.metadata.language : weather.current_observations.metadata.language
                    //weather.air_quality.metadata.language = $.language;
                    //weather.air_quality.metadata.data_source = 0;
                } else if (stations) { // From Nearest List
                    weather.air_quality.source = stations.nna;
                    weather.air_quality.airQualityIndex = stations.v;
                    weather.air_quality.airQualityScale = "EPA_NowCast.2115";
                    weather.air_quality.primaryPollutant = switchPollutantsType(stations.pol); //mapq1
                    weather.air_quality.airQualityCategoryIndex = classifyAirQualityLevel(stations.v);
                    weather.air_quality.metadata.reported_time = convertTime(new Date(stations.t), 'remain', api);
                    weather.air_quality.metadata.expire_time = convertTime(new Date(stations.t), 'add-1h-floor', api);
                    weather.air_quality.metadata.read_time = convertTime(new Date(), 'remain', api);
                    weather.air_quality.metadata.longitude = stations.geo[0];
                    weather.air_quality.metadata.latitude = stations.geo[1];
                    weather.air_quality.metadata.language ? weather.air_quality.metadata.language : weather.current_observations.metadata.language
                }
            }
            else if (api == "v2") {
                $.log(`⚠️ ${$.name}, outputData, Detect`, `data ${api}`, '');
                if (!weather.airQuality) {
                    $.log(`⚠️ ${$.name}, non-existent Air Quality data, creating`, '');
                    weather.airQuality = {
                        "pollutants": {},
                        "metadata": {
                            "units": "m",
                            "version": 2,
                        },
                        "sourceType": "station", //station:监测站 modeled:模型
                        "isSignificant": true, //重要/置顶
                        "name": "AirQuality",
                    }
                };
                if (obs?.aqi) { // From Observation Station
                    weather.airQuality.source = obs.city.name;
                    weather.airQuality.learnMoreURL = obs.city.url + `/${$.country}/m`.toLowerCase();
                    weather.airQuality.index = obs.aqi;
                    weather.airQuality.scale = "EPA_NowCast.2115";
                    weather.airQuality.primaryPollutant = switchPollutantsType(obs.dominentpol);
                    weather.airQuality.categoryIndex = classifyAirQualityLevel(obs.aqi);
                    weather.airQuality.pollutants.CO = { "name": "CO", "amount": obs.iaqi.co?.v || -1, "unit": "microgramsPerM3" };
                    weather.airQuality.pollutants.NO = { "name": "NO", "amount": obs.iaqi.no?.v || -1, "unit": "microgramsPerM3" };
                    weather.airQuality.pollutants.NO2 = { "name": "NO2", "amount": obs.iaqi.no2?.v || -1, "unit": "microgramsPerM3" };
                    weather.airQuality.pollutants.SO2 = { "name": "SO2", "amount": obs.iaqi.so2?.v || -1, "unit": "microgramsPerM3" };
                    weather.airQuality.pollutants.OZONE = { "name": "OZONE", "amount": obs.iaqi.o3?.v || -1, "unit": "microgramsPerM3" };
                    weather.airQuality.pollutants.NOX = { "name": "NOX", "amount": obs.iaqi.nox?.v || -1, "unit": "microgramsPerM3" };
                    weather.airQuality.pollutants["PM2.5"] = { "name": "PM2.5", "amount": obs.iaqi.pm25?.v || -1, "unit": "microgramsPerM3" };
                    weather.airQuality.pollutants.PM10 = { "name": "PM10", "amount": obs.iaqi.pm10?.v || -1, "unit": "microgramsPerM3" };
                    weather.airQuality.metadata.longitude = obs.city.geo[0];
                    weather.airQuality.metadata.providerLogo = "https:\/\/waqi.info\/images\/logo.png";
                    weather.airQuality.metadata.providerName = obs.attributions[obs.attributions.length - 1].name;
                    weather.airQuality.metadata.expireTime = convertTime(new Date(obs.time.iso), 'add-1h-floor', api);
                    weather.airQuality.metadata.language ? weather.airQuality.metadata.language : weather.currentWeather.metadata.language;
                    //weather.airQuality.metadata.language = $.language;
                    weather.airQuality.metadata.latitude = obs.city.geo[1];
                    weather.airQuality.metadata.reportedTime = convertTime(new Date(obs.time.iso), 'remain', api);
                    weather.airQuality.metadata.readTime = convertTime(new Date(), 'remain', api);
                    //weather.airQuality.metadata.units = "m";
                } else if (stations) { // From Nearest List
                    weather.airQuality.source = stations.name;
                    weather.airQuality.index = stations.aqi;
                    weather.airQuality.scale = "EPA_NowCast.2115";
                    //weather.airQuality.primaryPollutant = switchPollutantsType(stations.pol); //mapq1
                    weather.airQuality.categoryIndex = classifyAirQualityLevel(stations.aqi);
                    weather.airQuality.metadata.longitude = stations.geo[0];
                    weather.airQuality.metadata.latitude = stations.geo[1];
                    weather.airQuality.metadata.language ? weather.airQuality.metadata.language : weather.currentWeather.metadata.language;
                    weather.airQuality.metadata.expireTime = convertTime(new Date(stations.utime), 'add-1h-floor', api);
                    weather.airQuality.metadata.reportedTime = convertTime(new Date(stations.utime), 'remain', api);
                    weather.airQuality.metadata.readTime = convertTime(new Date(), 'remain', api);
                };
            } else $.done()
        } catch (e) {
            $.log(`❗️ ${$.name}, outputData执行失败!`, `浏览器访问 https://api.waqi.info/api/feed/@${idx}/aqi.json 看看是不是空数据`, `原因：网络不畅或者获取太频繁导致被封`, `error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
        } finally {
            // Output Data
            body = JSON.stringify(weather);
            $done({ body });
            $.log(`🎉 ${$.name}, outputData, Finish`, '')
            resove()
        }
    })
}

// Step 6.1
// Switch Pollutants Type
// https://github.com/Hackl0us/SS-Rule-Snippet/blob/master/Scripts/Surge/weather_aqi_us/iOS15_Weather_AQI_US.js
function switchPollutantsType(pollutant) {
    switch (pollutant) {
        case 'co': return 'CO';
        case 'no': return 'NO';
        case 'no2': return 'NO2';
        case 'so2': return 'SO2';
        case 'o3': return 'OZONE';
        case 'nox': return 'NOX';
        case 'pm25': return 'PM2.5';
        case 'pm10': return 'PM10';
        default: return "OTHER";
    }
};

// Step 6.2
// Convert Time Format
// https://github.com/Hackl0us/SS-Rule-Snippet/blob/master/Scripts/Surge/weather_aqi_us/iOS15_Weather_AQI_US.js
function convertTime(time, action, api) {
    switch (action) {
        case 'remain':
            time.setMilliseconds(0);
            break;
        case 'add-1h-floor':
            time.setHours(time.getHours() + 1);
            time.setMinutes(0, 0, 0);
            break;
        default:
            $.log(`⚠️ ${$.name}, Time Converter, Error`, `time: ${time}`, '');
    }
    if (api == "v1") {
        let timeString = time.getTime() / 1000;
        return timeString;
    }
    if (api == "v2") {
        let timeString = time.toISOString().split('.')[0] + 'Z';
        return timeString;
    }
};

// Step 6.3
// Calculate Air Quality Level
// https://github.com/Hackl0us/SS-Rule-Snippet/blob/master/Scripts/Surge/weather_aqi_us/iOS15_Weather_AQI_US.js
function classifyAirQualityLevel(aqiIndex) {
    if (aqiIndex >= 0 && aqiIndex <= 50) return 1;
    else if (aqiIndex >= 51 && aqiIndex <= 100) return 2;
    else if (aqiIndex >= 101 && aqiIndex <= 150) return 3;
    else if (aqiIndex >= 151 && aqiIndex <= 200) return 4;
    else if (aqiIndex >= 201 && aqiIndex <= 300) return 5;
    else if (aqiIndex >= 301 && aqiIndex <= 500) return 6;
    else {
        $.log(`⚠️ ${$.name}, classifyAirQualityLevel, Error`, `aqiIndex: ${aqiIndex}`, '');
        return 0;
    }
};

/***************** Env *****************/
// prettier-ignore
// https://github.com/chavyleung/scripts/blob/master/Env.min.js
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){if(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:i,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:i,statusCode:r,headers:o,rawBody:h},s.decode(h,this.encoding))},t=>{const{message:i,response:r}=t;e(i,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let i=require("iconv-lite");this.initGotEnv(t);const{url:r,...o}=t;this.got[s](r,o).then(t=>{const{statusCode:s,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:s,statusCode:r,headers:o,rawBody:h},i.decode(h,this.encoding))},t=>{const{message:s,response:r}=t;e(s,r,r&&i.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,i=rawOpts["update-pasteboard"]||rawOpts.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":i}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
