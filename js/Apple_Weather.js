/*
README:https://github.com/VirgilClyne/iRingo
*/

const $ = new Env('Apple_Weather');
!(async () => {
  await getOrigin($request.url)
  await getNearest($.lat, $.lng)
  await getToken($.idx)
  await getStation($.idx, undefined, $.token, $.uid, undefined)
  await outputData($.stations, $.obs)
})()
  .catch((e) => $.logErr(e))
  .finally(() => $.done())

// Get Origin Parameter
function getOrigin(url) {
    const Regular = /^https?:\/\/(weather-data|weather-data-origin)\.apple\.com\/(v1|v2)\/weather\/([\w-_]+)\/(-?\d+\.\d+)\/(-?\d+\.\d+).*(country=[A-Z]{2})?.*/;
    [$.url, $.dataServer, $.apiVer, $.language, $.lat, $.lng, $.countryCode] = url.match(Regular);
    //return parameter = $request.url.match(url);
    $.log(`⚠️ ${$.name}, getOrigin`, `Finish`, $.url, $.dataServer, $.apiVer, $.language, $.lat, $.lng, $.countryCode, '')
}

//Search Nearest WeatherStation
//https://api.waqi.info/mapq2/nearest/?geo=1/lat/lng
function getNearest(lat,lng) {
    if ($.apiVer == "v1") {
        return new Promise((resove) => {
            const url = { 
                url: `https://api.waqi.info/mapq/nearest/?n=1&geo=1/${lat}/${lng}`, 
                headers: {
                  'origin': `https://aqicn.org`,
                  'referer': `https://aqicn.org/`
                }
            }
            $.get(url, (error, response, data) => {
                try {
                    const _data = JSON.parse(data)
                    if (error) throw new Error(error)
                    //if (_data.status == 'ok') {
                    $.stations = _data.d[0];
                    $.idx = $.stations.x;
                    $.country = $.stations.cca2
                    //}
                } catch (e) {
                    $.log(`❗️ ${$.name}, getNearest执行失败!`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
                } finally {
                    $.log(`⚠️ ${$.name}, getNearest`, `Finish`,  `data = ${data}`, '')
                    resove()
                }
            })
        })
    }
    if ($.apiVer == "v2") {
        return new Promise((resove) => {
            const url = { 
                url: `https://api.waqi.info/mapq2/nearest?n=1&geo=1/${lat}/${lng}`, 
                headers: {
                  'origin': `https://aqicn.org`,
                  'referer': `https://aqicn.org/`
                }
            }
            $.get(url, (error, response, data) => {
                try {
                    const _data = JSON.parse(data)
                    if (error) throw new Error(error)
                    if (_data.status == 'ok') {
                    $.stations = _data.data.stations[0];
                    $.idx = $.stations.idx;
                    $.country = $.stations.country
                    }
                } catch (e) {
                    $.log(`❗️ ${$.name}, getNearest执行失败!`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
                } finally {
                    $.log(`⚠️ ${$.name}, getNearest`, `Finish`,  `data = ${data}`, '')
                    resove()
                }
            })
        })
    }
};

//Get Nearest WeatherStation Token
//https://api.waqi.info/api/token/station.uid
function getToken(idx) {
  //if ($.country = 'CN')
    return new Promise((resove) => {
        const url = {
          url: `https://api.waqi.info/api/token/${idx}`,
          headers: {}
        }
        $.get(url, (error, response, data) => {
            try {
                const _data = JSON.parse(data)

                if (error) throw new Error(error)
                if (_data.rxs.obs[0].status == "ok") {
                  $.token = _data.rxs.obs[0].msg.token;
                  $.uid = _data.rxs.obs[0].msg.uid;
                }
                else{
                  $.token = "na";
                  $.uid = "-1";
                }
            } catch (e) {
                $.log(`❗️ ${$.name}, getToken执行失败!`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
            } finally {
                $.log(`⚠️ ${$.name}, getToken`, `Finish`, `data = ${data}`, '')
                resove()
            }
        });
    })
}


//Show Nearest WeatherStation
//https://api.waqi.info/api/feed/@station.uid/aqi.json
function getStation(idx, key = "-1", token = "na", uid = "-1") {
  //if ($.country = 'CN')
    return new Promise((resove) => {
        const url = { 
          url: `https://api.waqi.info/api/feed/@${idx}/aqi.json`,
          body: `key=${key}&token=${token}&uid=${uid}&rqc=4`,
          headers: {
            'origin': `https://aqicn.org`,
            'referer': `https://aqicn.org/`
          }
        }
        $.post(url, (error, response, data) => {
            try {
                const _data = JSON.parse(data)
                if (error) throw new Error(error)
                //if (_data.rxs.status == `OK`) {
                $.obs = _data.rxs.obs[0].msg;
                //}
            } catch (e) {
                $.log(`❗️ ${$.name}, getStation执行失败!`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
            } finally {
                $.log(`⚠️ ${$.name}, getStation`, `Finish`, `data = ${data}`, '')
                resove()
            }
        })
    })
}

//Switch Pollutants Type
//https://github.com/Hackl0us/SS-Rule-Snippet/blob/master/Scripts/Surge/weather_aqi_us/iOS15_Weather_AQI_US.js
function SwitchPollutantsType(pollutant) {
	switch (pollutant) {
		case 'co':
			return 'CO2';
		case 'so2':
			return 'SO2';
		case 'no2':
			return 'NO2';
		case 'nox':
			return 'NOX'
		case 'pm25':
			return 'PM2.5';
		case 'pm10':
			return 'PM10';
		case 'o3':
			return 'OZONE';
		default:
			return "OTHER";
	}
};

//Convert Time Format
//https://github.com/Hackl0us/SS-Rule-Snippet/blob/master/Scripts/Surge/weather_aqi_us/iOS15_Weather_AQI_US.js
function TimeConverter(time, action) {
    switch (action) {
		case 'remain':
			time.setMilliseconds(0);
			break;
		case 'add-1h-floor':
			time.setHours(time.getHours() + 1);
			time.setMinutes(0, 0, 0);
			break;
		default:
			console.log('Error time converting action.');
	}
    if ($.apiVer == "v1" ) {
        let timeString = time.getTime() / 1000;
        return timeString;
    }
    if ($.apiVer == "v2" ) {
	    let timeString = time.toISOString().split('.')[0] + 'Z';
        return timeString;
    }
};


//Output Data
function outputData(stations, obs) { 
    let body = $response.body
    let weather = JSON.parse(body);
    
    //Input Data
    if ($.apiVer == "v1" ) {
    console.log('/v1/weather');
        if (!weather.air_quality) {
            console.log('⚠️ ${$.name}, non-existent AQ data ver.1 , creating');
            weather.air_quality = {
                "isSignificant": true,
                "airQualityCategoryIndex": 2,
                "pollutants": { "CO": { "name": "CO", "amount": 0, "unit": "μg\/m3" }, "SO2": { "name": "SO2", "amount": 0, "unit": "μg\/m3" }, "NO2": { "name": "NO2", "amount": 0, "unit": "μg\/m3" }, "PM2.5": { "name": "PM2.5", "amount": 0, "unit": "μg\/m3" }, "OZONE": { "name": "OZONE", "amount": 0, "unit": "μg\/m3" }, "PM10": { "name": "PM10", "amount": 0, "unit": "μg\/m3" } },
                "metadata": {
                    "version": 1,
                },
                "name": "AirQuality",
            };
        }
        if (stations) { //From Nearest List
            weather.air_quality.source = stations.nna;
            weather.air_quality.airQualityIndex = stations.v;
            weather.air_quality.airQualityScale = "EPA_NowCast.2115";
            weather.air_quality.primaryPollutant = SwitchPollutantsType(stations.pol); //mapq1
            weather.air_quality.metadata.reported_time = TimeConverter(new Date(stations.t), 'remain');
            weather.air_quality.metadata.expire_time = TimeConverter(new Date(stations.t), 'add-1h-floor');
            weather.air_quality.metadata.read_time = TimeConverter(new Date(), 'remain');
            weather.air_quality.metadata.longitude = stations.geo[0];
            weather.air_quality.metadata.latitude = stations.geo[1];
            if(!weather.air_quality.metadata.language) weather.air_quality.metadata.language = weather.current_observations.metadata.language
        }
        if (obs) { //From Observation Station
            weather.air_quality.source = obs.city.name;
            weather.air_quality.learnMoreURL = obs.city.url;
            weather.air_quality.airQualityIndex = obs.aqi;
            weather.air_quality.airQualityScale = "EPA_NowCast.2115";
            weather.air_quality.primaryPollutant = SwitchPollutantsType(obs.dominentpol);
            if (obs.iaqi.co) weather.air_quality.pollutants.CO.amount = obs.iaqi.co.v;
            if (obs.iaqi.so2) weather.air_quality.pollutants.SO2.amount = obs.iaqi.so2.v;
            if (obs.iaqi.no2) weather.air_quality.pollutants.NO2.amount = obs.iaqi.no2.v;
            if (obs.iaqi.nox) weather.air_quality.pollutants.NOX.amount = obs.iaqi.nox.v;
            if (obs.iaqi.pm25) weather.air_quality.pollutants["PM2.5"].amount = obs.iaqi.pm25.v;
            if (obs.iaqi.o3) weather.air_quality.pollutants.OZONE.amount = obs.iaqi.o3.v;
            if (obs.iaqi.pm10) weather.air_quality.pollutants.PM10.amount = obs.iaqi.pm10.v;
            weather.air_quality.metadata.reported_time = TimeConverter(new Date(obs.time.v), 'remain');
            weather.air_quality.metadata.longitude = obs.city.geo[0];
            weather.air_quality.metadata.provider_name = obs.attributions[$.obs.attributions.length - 1].name;
            weather.air_quality.metadata.expire_time = TimeConverter(new Date(obs.time.v), 'add-1h-floor');
            weather.air_quality.metadata.provider_logo = "https:\/\/waqi.info\/images\/logo.png";
            weather.air_quality.metadata.read_time = TimeConverter(new Date(), 'remain');
            weather.air_quality.metadata.latitude = obs.city.geo[1];
            //weather.air_quality.metadata.version = "";
            if(!weather.air_quality.metadata.language) weather.air_quality.metadata.language = weather.current_observations.metadata.language
            //weather.air_quality.metadata.language = $.language;
            weather.air_quality.metadata.data_source = obs.attributions[$.obs.attributions.length - 1].name;
        }
    };
    if ($.apiVer == "v2") {
    console.log('/v2/weather/');
        if (!weather.airQuality) {
            console.log('⚠️ ${$.name}, non-existent AQ data ver.2 , creating');
            weather.airQuality = {
                "pollutants": { "CO": { "name": "CO", "amount": 0, "unit": "microgramsPerM3" }, "NO": { "name": "NO", "amount": 0, "unit": "microgramsPerM3" }, "NO2": { "name": "NO2", "amount": 0, "unit": "microgramsPerM3" }, "SO2": { "name": "SO2", "amount": 0, "unit": "microgramsPerM3" }, "NOX": { "name": "NOX", "amount": 0, "unit": "microgramsPerM3" }, "OZONE": { "name": "OZONE", "amount": 0, "unit": "microgramsPerM3" }, "PM10": { "name": "PM10", "amount": 0, "unit": "microgramsPerM3" }, "PM2.5": { "name": "PM2.5", "amount": 0, "unit": "microgramsPerM3" } },
                "metadata": {
                    "units": "m",
                    "version": 2,
                },
                "sourceType": "station",
                "isSignificant": true,
                "name": "AirQuality",
                "categoryIndex": 2,
            }
        }
        if (stations) { //From Nearest List
            weather.airQuality.source = stations.name;
            weather.airQuality.index = stations.aqi;
            weather.airQuality.scale = "EPA_NowCast.2115";
            //weather.airQuality.primaryPollutant = SwitchPollutantsType(nearest.pol); //mapq1
            weather.airQuality.metadata.longitude = stations.geo[0];
            weather.airQuality.metadata.latitude = stations.geo[1];
            if(!weather.airQuality.metadata.language) weather.airQuality.metadata.language = weather.currentWeather.metadata.language;
            weather.airQuality.metadata.expireTime = TimeConverter(new Date(stations.utime), 'add-1h-floor');
            weather.airQuality.metadata.reportedTime = TimeConverter(new Date(stations.utime), 'remain');
            weather.airQuality.metadata.readTime = TimeConverter(new Date(), 'remain');
        }
        if (obs) { //From Observation Station
            weather.airQuality.source = obs.city.name;
            weather.airQuality.learnMoreURL = obs.city.url;
            weather.airQuality.index = obs.aqi;
            weather.airQuality.primaryPollutant = SwitchPollutantsType(obs.dominentpol);
            if (obs.iaqi.co) weather.airQuality.pollutants.CO.amount = obs.iaqi.co.v;
            if (obs.iaqi.so2) weather.airQuality.pollutants.SO2.amount = obs.iaqi.so2.v;
            if (obs.iaqi.no2) weather.airQuality.pollutants.NO2.amount = obs.iaqi.no2.v;
            if (obs.iaqi.nox) weather.airQuality.pollutants.NOX.amount = obs.iaqi.nox.v;
            if (obs.iaqi.pm25) weather.airQuality.pollutants["PM2.5"].amount = obs.iaqi.pm25.v;
            if (obs.iaqi.o3) weather.airQuality.pollutants.OZONE.amount = obs.iaqi.o3.v;
            if (obs.iaqi.pm10) weather.airQuality.pollutants.PM10.amount = obs.iaqi.pm10.v;
            weather.airQuality.metadata.longitude = obs.city.geo[0];
            weather.airQuality.metadata.providerLogo = "https:\/\/waqi.info\/images\/logo.png";
            weather.airQuality.metadata.providerName = obs.attributions[obs.attributions.length - 1].name;
            weather.airQuality.metadata.expireTime = TimeConverter(new Date(obs.time.iso), 'add-1h-floor');
            if(!weather.airQuality.metadata.language) weather.airQuality.metadata.language = weather.currentWeather.metadata.language;
            //weather.airQuality.metadata.language = $.language;
            weather.airQuality.metadata.latitude = obs.city.geo[1];
            weather.airQuality.metadata.reportedTime = TimeConverter(new Date(obs.time.iso), 'remain');
            weather.airQuality.metadata.readTime = TimeConverter(new Date(), 'remain');
            //weather.airQuality.metadata.units = "m";
        }
    };
body = JSON.stringify(weather);
$.log(`⚠️ ${$.name}, outputData`, $.apiVer, `Finish`)
$done({body});
}

/***************** Env *****************/
// prettier-ignore
// https://github.com/chavyleung/scripts/blob/master/Env.min.js
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){if(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:i,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:i,statusCode:r,headers:o,rawBody:h},s.decode(h,this.encoding))},t=>{const{message:i,response:r}=t;e(i,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let i=require("iconv-lite");this.initGotEnv(t);const{url:r,...o}=t;this.got[s](r,o).then(t=>{const{statusCode:s,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:s,statusCode:r,headers:o,rawBody:h},i.decode(h,this.encoding))},t=>{const{message:s,response:r}=t;e(s,r,r&&i.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}