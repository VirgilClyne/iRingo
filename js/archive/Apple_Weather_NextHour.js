/*
README:https://github.com/VirgilClyne/iRingo
*/

//你的KEY，参见https://dev.qweather.com/docs/resource/get-key/
const key = '123456789ABC'

const $ = new Env('Apple_Weather');
!(async () => {
    await getOrigin($request.url)
    await getNextHourStatus($response.body)
    await getGridWeatherMinutely($.lat, $.lng, key, switchLanguage($.language))
    await outputData($.lat, $.lng, $.GridWeather)
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())

// Step 1
// Get Origin Parameter
function getOrigin(url) {
    const Regular = /^https?:\/\/(weather-data)\.apple\.com\/(v1|v2)\/weather\/([\w-_]+)\/(-?\d+\.\d+)\/(-?\d+\.\d+).*(next_hour_forecast|forecastNextHour).*(country=[A-Z]{2})?.*/;
    [$.url, $.dataServer, $.apiVer, $.language, $.lat, $.lng, $.NextHour, $.countryCode] = url.match(Regular);
    //return parameter = $request.url.match(url);
    $.log(`🎉 ${$.name}, getOrigin`, `Finish`, $.url, $.dataServer, $.apiVer, $.language, $.lat, $.lng, $.NextHour, $.countryCode, '')
}

// Step 2
// forecastNextHour Source Status
function getNextHourStatus(body) {
    return new Promise((resove) => {
        const weather = JSON.parse(body);
        try {
            if ($.apiVer == 'v1') {
                $.log(`⚠️ ${$.name}, getNextHourStatus`, `AQ data ${$.apiVer}`, '');
                if (weather.next_hour_forecast.metadata) {
                    $.log(`⚠️ ${$.name}, getNextHourStatus, Abort`, `${weather.next_hour_forecast.metadata.provider_name}`, '');
                    $.done()
                } else {
                    $.log(`🎉 ${$.name}, getNextHourStatus, Continue`, `目前没有v1版数据，Abort`, '')
                    $.done()
                }
            } else if ($.apiVer == 'v2') {
                $.log(`⚠️ ${$.name}, getNextHourStatus`, `AQ data ${$.apiVer}`, '');
                if (weather.forecastNextHour.metadata) {
                    $.log(`⚠️ ${$.name}, getNextHourStatus, Abort`, `${weather.forecastNextHour.metadata.providerName}`, '');
                    $.done()
                } else {
                    $.log(`🎉 ${$.name}, getNextHourStatus, Continue`, '')
                    resove()
                }
            } else {
                $.log(`🎉 ${$.name}, getAQIstatus, non-existent Next Hour Forecast data, Continue`, '')
                resove()
            }
        } catch (e) {
            $.log(`❗️ ${$.name}, getAQIstatus`, `Failure`, ` error = ${e}`, '')
        }
    })
};

// Step 3
// Get Nearest forecast Next Hour Station AQI Data
// https://dev.qweather.com/docs/api/grid-weather/minutely/
// https://api.qweather.com/v7/minutely/5m?location=${lng},${lat}&key=${key}&lang=${lang}
function getGridWeatherMinutely(lat, lng, key, lang, timeout = 0) {
    return new Promise((resove) => {
        if ($.countryCode = 'CN') {
            setTimeout( ()=>{
                const url = {
                    url: `https://api.qweather.com/v7/minutely/5m?location=${lng},${lat}&key=${key}&lang=${lang}`,
                }
                $.get(url, (error, response, data) => {
                    try {
                        const _data = JSON.parse(data)
                        if (error) throw new Error(error)
                        if (_data.code == "200") {
                            $.GridWeather = _data
                            $.Minutely = _data.minutely
                            /*                           
                            if (_data.minutely[0]) {
                                $.Minutely = _data;
                                resove()
                            } else {
                                $.log(`❗️ ${$.name}, getGridWeatherMinutely`, `minutely Empty`, `code: ${_data.code}`, `data = ${data}`, `连接正常，数据为空`, '')
                                resove()
                            }
                            */
                        } else {
                            $.log(`❗️ ${$.name}, getGridWeatherMinutely`, `Code Error`, `code: ${_data.code}`, `data = ${data}`, '')
                            resove()
                        }
                    } catch (e) {
                        $.log(`❗️ ${$.name}, getGridWeatherMinutely执行失败!`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
                    } finally {
                        //$.log(`⚠️ ${$.name}, getStation`, `Finish`, `data = ${data}`, '')
                        $.log(`🎉 ${$.name}, getGridWeatherMinutely`, `Finish`, '')
                        resove()
                    }
                })
            },timeout)
        }
    })
};

// Step 6
// Output Data
function outputData(lat, lng, obs) {
    let body = $response.body
    let weather = JSON.parse(body);

    // Input Data
    if ($.apiVer == "v1") {
        $.log(`⚠️ ${$.name}, Detect`, `AQ next_hour_forecast ${$.apiVer}`, `没有V1版数据`, '');
        $.done()
    };
    if ($.apiVer == "v2") {
        $.log(`⚠️ ${$.name}, Detect`, `forecastNextHour data ${$.apiVer}`, '');
        if (!weather.forecastNextHour) {
            $.log(`⚠️ ${$.name}, non-existent forecastNextHour data`, `creating`, '');
            weather.forecastNextHour = {
                "metadata": {
                    "units": "m",
                    "version": 2,
                },
                "startTime": "",
                "condition": [],
                "minutes": [],
                "name": "NextHourForecast",
                "summary": []
            }
        }
        if (obs) { // From Observation Station
            weather.forecastNextHour.source = obs.refer.sources[0];
            weather.forecastNextHour.learnMoreURL = obs.fxLink;
            weather.forecastNextHour.metadata.longitude = lng;
            weather.forecastNextHour.metadata.providerLogo = "";
            weather.forecastNextHour.metadata.providerName = obs.refer.sources[0];
            weather.forecastNextHour.metadata.expireTime = convertTime(new Date(obs.updateTime), 'add-1h-floor');
            weather.forecastNextHour.metadata.language ? weather.forecastNextHour.metadata.language : weather.currentWeather.metadata.language;
            //weather.forecastNextHour.metadata.language = $.language;
            weather.forecastNextHour.metadata.latitude = lat;
            weather.forecastNextHour.metadata.reportedTime = convertTime(new Date(obs.updateTime), 'remain');
            weather.forecastNextHour.metadata.readTime = convertTime(new Date(), 'remain');
            //weather.forecastNextHour.metadata.units = "m";
        }
        if (obs.minutely) { // From Observation Station
            /*
            var maps= new Map([['fxTime','startTime'],['precip','precipIntensity']]);
            obs.minutely = obs.minutely.map(element =>{
                element.placeCode = maps.get(element.placeCode);
                return element;
            });
            weather.forecastNextHour.minutes = obs.minutely
            */
            obs.minutely = obs.minutely.map(element =>{
                return {
                    startTime: convertTime(new Date(element.fxTime), 'remain'), //五分钟
                    precipChance: element.precipChance, //没有概率
                    precipIntensityPerceived: element.precipIntensityPerceived, //没有体感
                    precipIntensity: element.precip, //只有降水量
                }
            })
        }
    };
    body = JSON.stringify(weather);
    $.log(`🎉 ${$.name}, outputData`, `Finish`, '')
    $done({ body });
};

// Step 6.1
// Switch Language
function switchLanguage(lang) {
    const languageCode = ['zh','zh-Hans', 'zh-Hant']
    if (lang.includes(languageCode)) return 'zh';
    else return 'en'
    /*
    switch (lang) {
        case lang.includes(language):
            return 'zh';
        case 'zh-Hans-CN':
            return 'zh';
        case 'zh-Hans-HK':
            return 'zh';
        case 'zh-Hans-TW':
            return 'zh';
        case 'zh-Hans-US':
            return 'zh'
        default:
            return 'en';
    }
    */
};

// Step 6.2
// Convert Time Format
// https://github.com/Hackl0us/SS-Rule-Snippet/blob/master/Scripts/Surge/weather_aqi_us/iOS15_Weather_AQI_US.js
function convertTime(time, action) {
    switch (action) {
        case 'remain':
            time.setMilliseconds(0);
            break;
        case 'add-1h-floor':
            time.setHours(time.getHours() + 1);
            time.setMinutes(0, 0, 0);
            break;
        default:
            $.log(`⚠️ ${$.name}, Time Converter`, `Error`, '');
    }
    if ($.apiVer == "v1") {
        let timeString = time.getTime() / 1000;
        return timeString;
    }
    if ($.apiVer == "v2") {
        let timeString = time.toISOString().split('.')[0] + 'Z';
        return timeString;
    }
};

// Step 6.3
// Calculate Air Quality Level
// https://github.com/Hackl0us/SS-Rule-Snippet/blob/master/Scripts/Surge/weather_aqi_us/iOS15_Weather_AQI_US.js
function classifyAirQualityLevel(aqiIndex) {
	if (aqiIndex >= 0 && aqiIndex <= 50) {
		return 1;
	} else if (aqiIndex >= 51 && aqiIndex <= 100) {
		return 2;
	} else if (aqiIndex >= 101 && aqiIndex <= 150) {
		return 3;
	} else if (aqiIndex >= 151 && aqiIndex <= 200) {
		return 4;
	} else if (aqiIndex >= 201 && aqiIndex <= 300) {
		return 5;
	} else if (aqiIndex >= 301) {
		return 6;
	}
};

/***************** Env *****************/
// prettier-ignore
// https://github.com/chavyleung/scripts/blob/master/Env.min.js
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){if(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:i,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:i,statusCode:r,headers:o,rawBody:h},s.decode(h,this.encoding))},t=>{const{message:i,response:r}=t;e(i,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let i=require("iconv-lite");this.initGotEnv(t);const{url:r,...o}=t;this.got[s](r,o).then(t=>{const{statusCode:s,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:s,statusCode:r,headers:o,rawBody:h},i.decode(h,this.encoding))},t=>{const{message:s,response:r}=t;e(s,r,r&&i.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,i=rawOpts["update-pasteboard"]||rawOpts.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":i}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
