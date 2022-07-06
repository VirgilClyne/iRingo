// README: https://github.com/VirgilClyne/iRingo

// https://github.com/chavyleung/scripts/blob/master/Env.min.js
// prettier-ignore
// noinspection
// eslint-disable-next-line
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}isStash(){return"undefined"!=typeof $environment&&$environment["stash-version"]}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){if(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:i,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:i,statusCode:r,headers:o,rawBody:h},s.decode(h,this.encoding))},t=>{const{message:i,response:r}=t;e(i,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let i=require("iconv-lite");this.initGotEnv(t);const{url:r,...o}=t;this.got[s](r,o).then(t=>{const{statusCode:s,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:s,statusCode:r,headers:o,rawBody:h},i.decode(h,this.encoding))},t=>{const{message:s,response:r}=t;e(s,r,r&&i.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,i=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":i}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}

const $ = new Env('Apple Weather v3.2.9');

// https://github.com/VirgilClyne/VirgilClyne/blob/main/function/URL/URLs.embedded.min.js
// noinspection
// eslint-disable-next-line
function URLs(s){return new class{constructor(s=[]){this.name="URL v1.0.0",this.opts=s,this.json={url:{scheme:"",host:"",path:""},params:{}}}parse(s){let t=s.match(/(?<scheme>.+):\/\/(?<host>[^/]+)\/?(?<path>[^?]+)?\??(?<params>.*)?/)?.groups??null;return t?.params&&(t.params=Object.fromEntries(t.params.split("&").map((s=>s.split("="))))),t}stringify(s=this.json){return s?.params?s.scheme+"://"+s.host+"/"+s.path+"?"+Object.entries(s.params).map((s=>s.join("="))).join("&"):s.scheme+"://"+s.host+"/"+s.path}}(s)}

/**
 * Get Environment Variables
 * @author VirgilClyne
 * @param {String} t - Persistent Store Key
 * @param {String} e - Platform Name
 * @param {Object} n - Default DataBase
 * @return {Promise<*>}
 */
// noinspection
// eslint-disable-next-line
function getENV(t, e, n) { const i = $.getjson(t, n); const s = i?.[e]?.Settings || n?.[e]?.Settings || n?.Default?.Settings; const g = i?.[e]?.Configs || n?.[e]?.Configs || n?.Default?.Configs; let f = i?.[e]?.Caches || void 0; if (typeof f === 'string' && (f = JSON.parse(f)), typeof $argument !== 'undefined') { if ($argument) { const t = Object.fromEntries($argument.split('&').map(((t) => t.split('=')))); const e = {}; for (const a in t)o(e, a, t[a]); Object.assign(s, e); } function o(t, e, n) { e.split('.').reduce(((t, i, s) => t[i] = e.split('.').length === ++s ? n : t[i] || {}), t); } } return { Settings: s, Caches: f, Configs: g }; }

const database = {
  Location: {
    Settings: {
      Switch: true,
      CountryCode: 'US',
      Config: {
        GEOAddressCorrection: true, LookupMaxParametersCount: true, LocalitiesAndLandmarks: true, PedestrianAR: true, '6694982d2b14e95815e44e970235e230': true, OpticalHeading: true, UseCLPedestrianMapMatchedLocations: true,
      },
    },
  },
  Weather: {
    Settings: {
      Version: 1,
      Switch: true,
      NextHour: { Switch: true, Source: 'www.weatherol.cn' },
      AQI: {
        Switch: true, Targets: ['HJ6332012'], Local: { Switch: true, Standard: 'WAQI_InstantCast' }, Source: 'WAQI Public', Comparison: { Switch: true, Source: 'Local' },
      },
      Map: { AQI: false },
      APIs: {
        WeatherOL: { HTTPHeaders: { 'Content-Type': 'application/json' } },
        ColorfulClouds: {
          HTTPHeaders: { 'Content-Type': 'application/json' },
          Token: null,
          ForceCNForAQI: true,
          ForceCNForComparison: false,
        },
        WAQI: { HTTPHeaders: { 'Content-Type': 'application/json' }, Token: null, Mode: 'Location' },
      },
    },
    Configs: {
      Version: 1,
      Pollutants: {
        co: 'CO', no: 'NO', no2: 'NO2', so2: 'SO2', o3: 'OZONE', nox: 'NOX', pm25: 'PM2.5', pm10: 'PM10', other: 'OTHER',
      },
    },
    Cache: {
      Version: 1,
      aqis: {},
    },
  },
  Siri: {
    Settings: {
      Switch: true, CountryCode: 'SG', Domains: ['web', 'itunes', 'app_store', 'movies', 'restaurants', 'maps'], Functions: ['flightutilities', 'lookup', 'mail', 'messages', 'news', 'safari', 'siri', 'spotlight', 'visualintelligence'], Safari_Smart_History: true,
    },
  },
};

/** @typedef {1|2} supportedIosApi */
/** @typedef {{ latitude: number, longitude: number }} coordinate */
// TODO
/** @typedef { "EPA_NowCast.2204" | "HJ6332012.2204" } iosAqiScale */
/** @typedef { "EPA_NowCast" | "HJ6332012" } scaleName */
/** @typedef { forV2: string, forV1: string } providerLogo */

/**
 * AQI info in cache
 * @typedef {Object} cachedAqi
 *
 * @property {coordinate} location - Coordinate of AQI
 * @property {string} [stationName] - `AirQuality.source` from QWeather
 * @property {scaleName} scaleName - Part before the '.' in iOS `AirQuality.scale`
 * @property {number} aqi - Air quality index
 */

/**
 * Supported VOCs by {@link toEpaAqis}
 * @typedef { "NO2" | "NO" | "SO2" | "OZONE" | "CO" } supportedVocs
 */
/** @typedef { supportedVocs | "PM2.5" | "PM10" } iosPollutantNames */
/** @typedef { "ppb" | "µg/m3" } pollutantUnitsIosV1 */
/** @typedef { "ppb" | "microgramsPerM3" } pollutantUnitsIosV2 */
/** @typedef { pollutantUnitsIosV1 | "ppm" | "mg/m3" } pollutantUnitsSlash */
/** @typedef { pollutantUnitsIosV2 | "ppm" | "milligramsPerM3" } pollutantUnitsText */

/**
 * Base pollutant type for `AirQuality.pollutants`
 * @typedef {Object} pollutantBase
 *
 * @property {iosPollutantNames} name - Name of pollutant
 * @property {number} amount - Amount of pollutant
 */

/**
 * Pollutant for `air_quality.pollutants` in Apple APIv1
 * @typedef {pollutantBase} pollutantV1
 *
 * @property {pollutantUnitsIosV1} unit - Unit of pollutant
 */

/**
 * Pollutant for `airQuality.pollutants` in Apple APIv2
 * @typedef {pollutantBase} pollutantV2
 *
 * @property {pollutantUnitsIosV2} unit - Unit of pollutant
 */

/**
 * @typedef {Object} aqiInfo
 *
 * @property {number} index - Air quality index
 * @property {[{ name: string, aqi: number }]} pollutants - Aqi of each pollutant
 * @property {iosPollutantNames} [primary] - Primary pollutant
 */

/** @typedef { "unknown" | "worse" | "same" | "better" } aqiComparison */
/** @typedef { "station" | "modeled" } sourceType */
/** @typedef { -1 | 0 | 1 } dataSource */

// TODO: Type of metadata and scale
/**
 * Object for {@link toAirQuality}
 * @typedef {Object} airQualityObject
 *
 * @property {Object} metadata - Metadata that generated by {@link toMetadata}
 * @property {number} categoryIndex - AQI level starts from 1
 * @property {number} aqi - Air quality index
 * @property {boolean} isSignificant - Importance of AQI info
 * @property {string} url - URL to the website of AQI details
 * @property {pollutantV2[]} pollutants - Array of pollutant
 * @property {aqiComparison} previousDayComparison - Comparison to the previous day
 * @property {iosPollutantNames} primary - Name of the primary pollutant
 * @property {string} scale - Name of AQI standard
 * @property {string} sourceName - Name of the source
 * @property {sourceType} sourceType - Source type of the info
 */

/** @typedef {
 * 'clear' | 'precipitation' | 'rain' | 'snow' | 'sleet' | 'hail' | 'mixed'
 * } precipitationType */
/** @typedef {
 *    'clear' | 'precipitation' | 'drizzle' | 'flurries' | 'rain'
 *    | 'snow' | 'heavy-rain' | 'heavy-snow' | 'sleet' | 'hail' | 'mixed'
 * } weatherStatus
 */
/** @typedef { "NO" | "LIGHT" | "MODERATE" | "HEAVY" | "STORM" } precipitationLevelNames */

// TODO: Description and parameters
/**
 * Minutely precipitation data for {@link toNextHour}
 * @typedef {Object} minute
 *
 * @property {weatherStatus} weatherStatus - Weather status of this minute
 * @property {number} precipitation - Precipitation of this minute
 * @property {number} chance - Integer from 0 to 100, percentage of chance to rain or snow
 */

// TODO
/**
 * Description for {@link toNextHour}
 * @typedef {Object} description
 *
 * @property {string} long - Long description with dynamic time by `{firstAt}`, `{secondAt}`, etc
 * for `parameters`
 * @property {string} short - As same as `long`, but no dynamic time support and will be display
 * in city list
 * @property {Object.<string, number>} parameters - Key should be `firstAt`, `secondAt`, etc.
 * Value should be the minutes relative to `startTime`
 */

/**
 * Object for {@link toNextHour}
 * @typedef {Object} nextHourObject
 *
 * @property {Object} metadata - Metadata that generated by {@link toMetadata}
 * @property {number} readTimestamp - UNIX timestamp when user read
 * @property {precipitationLevels} precipitationLevels - `*_PRECIPITATION_RANGE`
 * @property {minute[]} minutes - Array of precipitation info of every minute
 */

/**
 * Base minute type for `NextHourForecast.minutes`
 * @typedef {Object} nextHourMinuteBase
 *
 * @property {number} precipChance - Integer from 0 to 100, percentage of chance to rain or snow
 * @property {number} precipIntensity - 2 decimal places from Apple. Actually could be any number.
 */

/**
 * Minute for `next_hour.minutes` in Apple APIv1
 * @typedef {nextHourMinuteBase} nextHourMinuteV1
 *
 * @property {number} startAt - Time of the start time (in seconds)
 * @property {number} perceivedIntensity - 3 decimal places from 0 to 3,
 * can be generated by `toApplePrecipitation()`
 */

/**
 * Minute for `forecastNextHour.minutes` in Apple APIv2
 * @typedef {nextHourMinuteBase} nextHourMinuteV2
 *
 * @property {string} startTime - Time of the start time (in YYYY-MM-DDTHH:MM:SSZ format)
 * @property {number} precipIntensityPerceived - 3 decimal places from 0 to 3,
 * can be generated by `toApplePrecipitation()`
 */

/**
 * Base condition type for `NextHourForecast`
 * @typedef {Object} nextHourConditionBase
 *
 * @property {string} token - A tag to describe possibility, weather status and time status
 * @property {string} longTemplate - A description for current weather. Time is dynamic by
 * replacing to `{firstAt}`, `{secondAt}`, etc for `parameters`
 * @property {string} shortTemplate - As same as `longTemplate`, but no dynamic time support
 * and will be display in city list
 */

/**
 * Condition for `next_hour.condition` in Apple APIv1
 * @typedef {nextHourConditionBase} nextHourConditionV1
 *
 * @property {number} [validUntil] - Time of the end time (in seconds)
 * @property {Object.<string, number>} parameters - Key should be `firstAt`, `secondAt`, etc.
 * Value can be generated by {@link toAppleTime}
 */

/**
 * Condition for `forecastNextHour.condition` in Apple APIv2
 * @typedef {nextHourConditionBase} nextHourConditionV2
 *
 * @property {string} startTime - Time of the start time (in YYYY-MM-DDTHH:MM:SSZ format)
 * @property {string} [endTime] - Time of the end time (in YYYY-MM-DDTHH:MM:SSZ format)
 * @property {Object.<string, string>} parameters - Key should be `firstAt`, `secondAt`, etc.
 * Value can be generated by {@link toAppleTime}
 */

/**
 * Base summary type for `NextHourForecast`
 * @typedef {Object} nextHourSummaryBase
 *
 * @property {precipitationType} condition - Weather condition
 */

/**
 * Condition for `next_hour.summary` in Apple APIv1
 * @typedef {nextHourSummaryBase} nextHourSummaryV1
 *
 * @property {number} [validUntil] - Time of the end time (in seconds)
 * @property {number} [probability] - Precipitation chance of this minute if condition is not clear
 * @property {number} [maxIntensity] - Maximum value of {@link nextHourMinuteV1#perceivedIntensity}
 * in this range of minutes if condition is not clear
 * @property {number} [minIntensity] - Minimum value of {@link nextHourMinuteV1#perceivedIntensity}
 * in this range of minutes if condition is not clear
 */

/**
 * Condition for `forecastNextHour.summary` in Apple APIv2
 * @typedef {nextHourSummaryBase} nextHourSummaryV2
 *
 * @property {string} startTime - Time of the start time (in YYYY-MM-DDTHH:MM:SSZ format)
 * @property {string} [endTime] - Time of the end time (in YYYY-MM-DDTHH:MM:SSZ format)
 * @property {number} [precipChance] - Precipitation chance of this minute if condition is not clear
 * @property {number} [precipIntensity] - Maximum value of
 * {@link nextHourMinuteV2#precipIntensityPerceived} in this range of minutes
 * if condition is not clear
 */

/**
 * @typedef {Object} range
 *
 * @property {Number} LOWER - lower of range
 * @property {Number} UPPER - upper of range
 */

/**
 * Precipitation level and its range
 * @typedef {Object} precipitationLevel
 *
 * @property {number} VALUE - Value of precipitation level for comparing
 * @property {range} RANGE - Precipitation range of level
 */

/** @typedef {Object.<precipitationLevelNames, precipitationLevel>} precipitationLevels */

// EPA 454/B-18-007
// https://www.airnow.gov/sites/default/files/2020-05/aqi-technical-assistance-document-sept2018.pdf

/**
 * AQI level and its range
 *
 * @typedef {Object} aqiLevel
 * @property {number} VALUE - AQI level value for `airQuality.categoryIndex`. Should be start at 1.
 * @property {range} RANGE - Range of AQI level
 */

/**
 * Concentration range for pollutant
 *
 * @typedef {Object} concentrationRange
 *
 * @property {range} AMOUNT - Range of concentration amount
 * @property {range} AQI - AQI range for its concentration amount range
 */

/**
 * @typedef {Object} concentration
 *
 * @property {pollutantUnitsText} UNIT - Unit of concentration
 * @property {Object.<string, concentrationRange>} RANGES - Concentration range for pollutant
 */

/**
 * AQI standard
 *
 * @typedef {Object} aqiStandard
 * @property {iosAqiScale} APPLE_SCALE - value of `airQuality.scale`
 * @property {Object.<string, aqiLevel>} AQI_LEVELS - Value and ranges of AQI levels
 * @property {number} SIGNIFICANT_LEVEL - AQI will be pinned if `airQuality.categoryIndex` >= this
 * @property {Object.<string, concentration>} CONCENTRATIONS - Key should be the pollutant name.
 */

const EPA_454_AQI_LEVELS = {
  INVALID: { VALUE: -1, RANGE: { LOWER: Number.MIN_VALUE, UPPER: -1 } },
  GOOD: { VALUE: 1, RANGE: { LOWER: 0, UPPER: 50 } },
  MODERATE: { VALUE: 2, RANGE: { LOWER: 51, UPPER: 100 } },
  UNHEALTHY_FOR_SENSITIVE: { VALUE: 3, RANGE: { LOWER: 101, UPPER: 150 } },
  UNHEALTHY: { VALUE: 4, RANGE: { LOWER: 151, UPPER: 200 } },
  VERY_UNHEALTHY: { VALUE: 5, RANGE: { LOWER: 201, UPPER: 300 } },
  HAZARDOUS: { VALUE: 6, RANGE: { LOWER: 301, UPPER: 400 } },
  // meaningless for user
  VERY_HAZARDOUS: { VALUE: 6, RANGE: { LOWER: 401, UPPER: 500 } },
  OVER_RANGE: { VALUE: 7, RANGE: { LOWER: 500, UPPER: Number.MAX_VALUE } },
};

/**
 * US AQI standard, not equal to NowCast.
 * [EPA 454/B-18-007]{@link https://www.airnow.gov/sites/default/files/2020-05/aqi-technical-assistance-document-sept2018.pdf}
 * @type aqiStandard
 */
const EPA_454 = {
  APPLE_SCALE: 'EPA_NowCast.2204',
  AQI_LEVELS: EPA_454_AQI_LEVELS,
  // unhealthy for sensitive groups
  SIGNIFICANT_LEVEL: 3,

  CONCENTRATIONS: {
    OZONE: {
      UNIT: 'ppm',
      RANGES: {
        UNHEALTHY_FOR_SENSITIVE: {
          AMOUNT: { LOWER: 0.125, UPPER: 0.164 },
          AQI: EPA_454_AQI_LEVELS.UNHEALTHY_FOR_SENSITIVE.RANGE,
        },
        UNHEALTHY: {
          AMOUNT: { LOWER: 0.165, UPPER: 0.204 },
          AQI: EPA_454_AQI_LEVELS.UNHEALTHY.RANGE,
        },
        VERY_UNHEALTHY: {
          AMOUNT: { LOWER: 0.205, UPPER: 0.404 },
          AQI: EPA_454_AQI_LEVELS.VERY_UNHEALTHY.RANGE,
        },
        HAZARDOUS: {
          AMOUNT: { LOWER: 0.405, UPPER: 0.504 },
          AQI: EPA_454_AQI_LEVELS.HAZARDOUS.RANGE,
        },
        VERY_HAZARDOUS: {
          AMOUNT: { LOWER: 0.505, UPPER: 0.604 },
          AQI: EPA_454_AQI_LEVELS.VERY_HAZARDOUS.RANGE,
        },
      },
    },
    OZONE_8H: {
      UNIT: 'ppm',
      RANGES: {
        GOOD: {
          AMOUNT: { LOWER: 0.000, UPPER: 0.054 },
          AQI: EPA_454_AQI_LEVELS.GOOD.RANGE,
        },
        MODERATE: {
          AMOUNT: { LOWER: 0.055, UPPER: 0.070 },
          AQI: EPA_454_AQI_LEVELS.MODERATE.RANGE,
        },
        UNHEALTHY_FOR_SENSITIVE: {
          AMOUNT: { LOWER: 0.071, UPPER: 0.085 },
          AQI: EPA_454_AQI_LEVELS.UNHEALTHY_FOR_SENSITIVE.RANGE,
        },
        UNHEALTHY: {
          AMOUNT: { LOWER: 0.086, UPPER: 0.105 },
          AQI: EPA_454_AQI_LEVELS.UNHEALTHY.RANGE,
        },
        VERY_UNHEALTHY: {
          AMOUNT: { LOWER: 0.106, UPPER: 0.200 },
          AQI: EPA_454_AQI_LEVELS.VERY_UNHEALTHY.RANGE,
        },
      },
    },
    'PM2.5_24H': {
      UNIT: 'microgramsPerM3',
      RANGES: {
        GOOD: {
          AMOUNT: { LOWER: 0.0, UPPER: 12.0 },
          AQI: EPA_454_AQI_LEVELS.GOOD.RANGE,
        },
        MODERATE: {
          AMOUNT: { LOWER: 12.1, UPPER: 35.4 },
          AQI: EPA_454_AQI_LEVELS.MODERATE.RANGE,
        },
        // if a different SHL for PM2.5 is promulgated,
        // the following numbers will change accordingly.
        UNHEALTHY_FOR_SENSITIVE: {
          AMOUNT: { LOWER: 35.5, UPPER: 55.4 },
          AQI: EPA_454_AQI_LEVELS.UNHEALTHY_FOR_SENSITIVE.RANGE,
        },
        UNHEALTHY: {
          AMOUNT: { LOWER: 55.5, UPPER: 150.4 },
          AQI: EPA_454_AQI_LEVELS.UNHEALTHY.RANGE,
        },
        VERY_UNHEALTHY: {
          AMOUNT: { LOWER: 150.5, UPPER: 250.4 },
          AQI: EPA_454_AQI_LEVELS.VERY_UNHEALTHY.RANGE,
        },
        HAZARDOUS: {
          AMOUNT: { LOWER: 250.5, UPPER: 350.4 },
          AQI: EPA_454_AQI_LEVELS.HAZARDOUS.RANGE,
        },
        VERY_HAZARDOUS: {
          AMOUNT: { LOWER: 350.5, UPPER: 500.4 },
          AQI: EPA_454_AQI_LEVELS.VERY_HAZARDOUS.RANGE,
        },
      },
    },
    PM10_24H: {
      UNIT: 'microgramsPerM3',
      RANGES: {
        GOOD: {
          AMOUNT: { LOWER: 0, UPPER: 54 },
          AQI: EPA_454_AQI_LEVELS.GOOD.RANGE,
        },
        MODERATE: {
          AMOUNT: { LOWER: 55, UPPER: 154 },
          AQI: EPA_454_AQI_LEVELS.MODERATE.RANGE,
        },
        UNHEALTHY_FOR_SENSITIVE: {
          AMOUNT: { LOWER: 155, UPPER: 254 },
          AQI: EPA_454_AQI_LEVELS.UNHEALTHY_FOR_SENSITIVE.RANGE,
        },
        UNHEALTHY: {
          AMOUNT: { LOWER: 255, UPPER: 354 },
          AQI: EPA_454_AQI_LEVELS.UNHEALTHY.RANGE,
        },
        VERY_UNHEALTHY: {
          AMOUNT: { LOWER: 355, UPPER: 424 },
          AQI: EPA_454_AQI_LEVELS.VERY_UNHEALTHY.RANGE,
        },
        HAZARDOUS: {
          AMOUNT: { LOWER: 425, UPPER: 504 },
          AQI: EPA_454_AQI_LEVELS.HAZARDOUS.RANGE,
        },
        VERY_HAZARDOUS: {
          AMOUNT: { LOWER: 505, UPPER: 604 },
          AQI: EPA_454_AQI_LEVELS.VERY_HAZARDOUS.RANGE,
        },
      },
    },
    CO_8H: {
      UNIT: 'ppm',
      RANGES: {
        GOOD: {
          AMOUNT: { LOWER: 0.0, UPPER: 4.4 },
          AQI: EPA_454_AQI_LEVELS.GOOD.RANGE,
        },
        MODERATE: {
          AMOUNT: { LOWER: 4.5, UPPER: 9.4 },
          AQI: EPA_454_AQI_LEVELS.MODERATE.RANGE,
        },
        UNHEALTHY_FOR_SENSITIVE: {
          AMOUNT: { LOWER: 9.5, UPPER: 12.4 },
          AQI: EPA_454_AQI_LEVELS.UNHEALTHY_FOR_SENSITIVE.RANGE,
        },
        UNHEALTHY: {
          AMOUNT: { LOWER: 12.5, UPPER: 15.4 },
          AQI: EPA_454_AQI_LEVELS.UNHEALTHY.RANGE,
        },
        VERY_UNHEALTHY: {
          AMOUNT: { LOWER: 15.5, UPPER: 30.4 },
          AQI: EPA_454_AQI_LEVELS.VERY_UNHEALTHY.RANGE,
        },
        HAZARDOUS: {
          AMOUNT: { LOWER: 30.5, UPPER: 40.4 },
          AQI: EPA_454_AQI_LEVELS.HAZARDOUS.RANGE,
        },
        VERY_HAZARDOUS: {
          AMOUNT: { LOWER: 40.5, UPPER: 50.4 },
          AQI: EPA_454_AQI_LEVELS.VERY_HAZARDOUS.RANGE,
        },
      },
    },
    SO2: {
      UNIT: 'ppb',
      RANGES: {
        GOOD: {
          AMOUNT: { LOWER: 0, UPPER: 35 },
          AQI: EPA_454_AQI_LEVELS.GOOD.RANGE,
        },
        MODERATE: {
          AMOUNT: { LOWER: 36, UPPER: 75 },
          AQI: EPA_454_AQI_LEVELS.MODERATE.RANGE,
        },
        UNHEALTHY_FOR_SENSITIVE: {
          AMOUNT: { LOWER: 76, UPPER: 185 },
          AQI: EPA_454_AQI_LEVELS.UNHEALTHY_FOR_SENSITIVE.RANGE,
        },
      },
      // 1-hour SO2 values do not define higher AQI values (≥ 200).
      // AQI values of 200 or greater are calculated with 24-hour SO2 concentrations.
    },
    SO2_24H: {
      UNIT: 'ppb',
      RANGES: {
        UNHEALTHY: {
          AMOUNT: { LOWER: 186, UPPER: 304 },
          AQI: EPA_454_AQI_LEVELS.UNHEALTHY.RANGE,
        },
        VERY_UNHEALTHY: {
          AMOUNT: { LOWER: 305, UPPER: 604 },
          AQI: EPA_454_AQI_LEVELS.VERY_UNHEALTHY.RANGE,
        },
        HAZARDOUS: {
          AMOUNT: { LOWER: 605, UPPER: 804 },
          AQI: EPA_454_AQI_LEVELS.HAZARDOUS.RANGE,
        },
        VERY_HAZARDOUS: {
          AMOUNT: { LOWER: 805, UPPER: 1004 },
          AQI: EPA_454_AQI_LEVELS.VERY_HAZARDOUS.RANGE,
        },
      },
    },
    NO2: {
      UNIT: 'ppb',
      RANGES: {
        GOOD: {
          AMOUNT: { LOWER: 0, UPPER: 53 },
          AQI: EPA_454_AQI_LEVELS.GOOD.RANGE,
        },
        MODERATE: {
          AMOUNT: { LOWER: 54, UPPER: 100 },
          AQI: EPA_454_AQI_LEVELS.MODERATE.RANGE,
        },
        UNHEALTHY_FOR_SENSITIVE: {
          AMOUNT: { LOWER: 101, UPPER: 360 },
          AQI: EPA_454_AQI_LEVELS.UNHEALTHY_FOR_SENSITIVE.RANGE,
        },
        UNHEALTHY: {
          AMOUNT: { LOWER: 361, UPPER: 649 },
          AQI: EPA_454_AQI_LEVELS.UNHEALTHY.RANGE,
        },
        VERY_UNHEALTHY: {
          AMOUNT: { LOWER: 650, UPPER: 1249 },
          AQI: EPA_454_AQI_LEVELS.VERY_UNHEALTHY.RANGE,
        },
        HAZARDOUS: {
          AMOUNT: { LOWER: 1250, UPPER: 1649 },
          AQI: EPA_454_AQI_LEVELS.HAZARDOUS.RANGE,
        },
        VERY_HAZARDOUS: {
          AMOUNT: { LOWER: 1650, UPPER: 2049 },
          AQI: EPA_454_AQI_LEVELS.VERY_HAZARDOUS.RANGE,
        },
      },
    },
  },
};

/**
 * China AQI standard.
 * [环境空气质量指数（AQI）技术规定（试行）]{@link https://www.mee.gov.cn/ywgz/fgbz/bz/bzwb/jcffbz/201203/W020120410332725219541.pdf}
 * @type aqiStandard
 */
const HJ_633 = {
  APPLE_SCALE: 'HJ6332012.2204',
  AQI_LEVELS: EPA_454.AQI_LEVELS,
  SIGNIFICANT_LEVEL: EPA_454.SIGNIFICANT_LEVEL,

  CONCENTRATIONS: {
    SO2_24H: {
      UNIT: 'microgramsPerM3',
      RANGES: {
        GOOD: {
          AMOUNT: { LOWER: 0, UPPER: 50 },
          AQI: EPA_454.AQI_LEVELS.GOOD.RANGE,
        },
        MODERATE: {
          AMOUNT: { LOWER: 51, UPPER: 150 },
          AQI: EPA_454.AQI_LEVELS.MODERATE.RANGE,
        },
        UNHEALTHY_FOR_SENSITIVE: {
          AMOUNT: { LOWER: 151, UPPER: 475 },
          AQI: EPA_454.AQI_LEVELS.UNHEALTHY_FOR_SENSITIVE.RANGE,
        },
        UNHEALTHY: {
          AMOUNT: { LOWER: 476, UPPER: 800 },
          AQI: EPA_454.AQI_LEVELS.UNHEALTHY.RANGE,
        },
        VERY_UNHEALTHY: {
          AMOUNT: { LOWER: 801, UPPER: 1600 },
          AQI: EPA_454.AQI_LEVELS.VERY_UNHEALTHY.RANGE,
        },
        HAZARDOUS: {
          AMOUNT: { LOWER: 1601, UPPER: 2100 },
          AQI: EPA_454.AQI_LEVELS.HAZARDOUS.RANGE,
        },
        VERY_HAZARDOUS: {
          AMOUNT: { LOWER: 2101, UPPER: 2602 },
          AQI: EPA_454.AQI_LEVELS.VERY_HAZARDOUS.RANGE,
        },
      },
    },
    SO2: {
      UNIT: 'microgramsPerM3',
      RANGES: {
        GOOD: {
          AMOUNT: { LOWER: 0, UPPER: 150 },
          AQI: EPA_454.AQI_LEVELS.GOOD.RANGE,
        },
        MODERATE: {
          AMOUNT: { LOWER: 151, UPPER: 500 },
          AQI: EPA_454.AQI_LEVELS.MODERATE.RANGE,
        },
        UNHEALTHY_FOR_SENSITIVE: {
          AMOUNT: { LOWER: 501, UPPER: 650 },
          AQI: EPA_454.AQI_LEVELS.UNHEALTHY_FOR_SENSITIVE.RANGE,
        },
        UNHEALTHY: {
          AMOUNT: { LOWER: 651, UPPER: 800 },
          AQI: EPA_454.AQI_LEVELS.UNHEALTHY.RANGE,
        },
        // 二氧化硫（SO2）1小时平均浓度高于800 ug/m3的，不再进行其空气质量分指数计算，二氧化硫（SO2）空气质量分指数按24小时平均浓度计算的分指数报告。
      },
    },
    NO2_24H: {
      UNIT: 'microgramsPerM3',
      RANGES: {
        GOOD: {
          AMOUNT: { LOWER: 0, UPPER: 40 },
          AQI: EPA_454.AQI_LEVELS.GOOD.RANGE,
        },
        MODERATE: {
          AMOUNT: { LOWER: 41, UPPER: 80 },
          AQI: EPA_454.AQI_LEVELS.MODERATE.RANGE,
        },
        UNHEALTHY_FOR_SENSITIVE: {
          AMOUNT: { LOWER: 81, UPPER: 180 },
          AQI: EPA_454.AQI_LEVELS.UNHEALTHY_FOR_SENSITIVE.RANGE,
        },
        UNHEALTHY: {
          AMOUNT: { LOWER: 181, UPPER: 280 },
          AQI: EPA_454.AQI_LEVELS.UNHEALTHY.RANGE,
        },
        VERY_UNHEALTHY: {
          AMOUNT: { LOWER: 281, UPPER: 565 },
          AQI: EPA_454.AQI_LEVELS.VERY_UNHEALTHY.RANGE,
        },
        HAZARDOUS: {
          AMOUNT: { LOWER: 566, UPPER: 750 },
          AQI: EPA_454.AQI_LEVELS.HAZARDOUS.RANGE,
        },
        VERY_HAZARDOUS: {
          AMOUNT: { LOWER: 751, UPPER: 940 },
          AQI: EPA_454.AQI_LEVELS.VERY_HAZARDOUS.RANGE,
        },
      },
    },
    NO2: {
      UNIT: 'microgramsPerM3',
      RANGES: {
        GOOD: {
          AMOUNT: { LOWER: 0, UPPER: 100 },
          AQI: EPA_454.AQI_LEVELS.GOOD.RANGE,
        },
        MODERATE: {
          AMOUNT: { LOWER: 101, UPPER: 200 },
          AQI: EPA_454.AQI_LEVELS.MODERATE.RANGE,
        },
        UNHEALTHY_FOR_SENSITIVE: {
          AMOUNT: { LOWER: 201, UPPER: 700 },
          AQI: EPA_454.AQI_LEVELS.UNHEALTHY_FOR_SENSITIVE.RANGE,
        },
        UNHEALTHY: {
          AMOUNT: { LOWER: 701, UPPER: 1200 },
          AQI: EPA_454.AQI_LEVELS.UNHEALTHY.RANGE,
        },
        VERY_UNHEALTHY: {
          AMOUNT: { LOWER: 1201, UPPER: 2340 },
          AQI: EPA_454.AQI_LEVELS.VERY_UNHEALTHY.RANGE,
        },
        HAZARDOUS: {
          AMOUNT: { LOWER: 2341, UPPER: 3090 },
          AQI: EPA_454.AQI_LEVELS.HAZARDOUS.RANGE,
        },
        VERY_HAZARDOUS: {
          AMOUNT: { LOWER: 3091, UPPER: 3840 },
          AQI: EPA_454.AQI_LEVELS.VERY_HAZARDOUS.RANGE,
        },
      },
    },
    PM10_24H: {
      UNIT: 'microgramsPerM3',
      RANGES: {
        GOOD: {
          AMOUNT: { LOWER: 0, UPPER: 50 },
          AQI: EPA_454.AQI_LEVELS.GOOD.RANGE,
        },
        MODERATE: {
          AMOUNT: { LOWER: 51, UPPER: 150 },
          AQI: EPA_454.AQI_LEVELS.MODERATE.RANGE,
        },
        UNHEALTHY_FOR_SENSITIVE: {
          AMOUNT: { LOWER: 151, UPPER: 250 },
          AQI: EPA_454.AQI_LEVELS.UNHEALTHY_FOR_SENSITIVE.RANGE,
        },
        UNHEALTHY: {
          AMOUNT: { LOWER: 251, UPPER: 350 },
          AQI: EPA_454.AQI_LEVELS.UNHEALTHY.RANGE,
        },
        VERY_UNHEALTHY: {
          AMOUNT: { LOWER: 351, UPPER: 420 },
          AQI: EPA_454.AQI_LEVELS.VERY_UNHEALTHY.RANGE,
        },
        HAZARDOUS: {
          AMOUNT: { LOWER: 421, UPPER: 500 },
          AQI: EPA_454.AQI_LEVELS.HAZARDOUS.RANGE,
        },
        VERY_HAZARDOUS: {
          AMOUNT: { LOWER: 501, UPPER: 600 },
          AQI: EPA_454.AQI_LEVELS.VERY_HAZARDOUS.RANGE,
        },
      },
    },
    CO_24H: {
      UNIT: 'milligramsPerM3',
      RANGES: {
        GOOD: {
          AMOUNT: { LOWER: 0, UPPER: 2 },
          AQI: EPA_454.AQI_LEVELS.GOOD.RANGE,
        },
        MODERATE: {
          AMOUNT: { LOWER: 3, UPPER: 4 },
          AQI: EPA_454.AQI_LEVELS.MODERATE.RANGE,
        },
        UNHEALTHY_FOR_SENSITIVE: {
          AMOUNT: { LOWER: 5, UPPER: 14 },
          AQI: EPA_454.AQI_LEVELS.UNHEALTHY_FOR_SENSITIVE.RANGE,
        },
        UNHEALTHY: {
          AMOUNT: { LOWER: 15, UPPER: 24 },
          AQI: EPA_454.AQI_LEVELS.UNHEALTHY.RANGE,
        },
        VERY_UNHEALTHY: {
          AMOUNT: { LOWER: 25, UPPER: 36 },
          AQI: EPA_454.AQI_LEVELS.VERY_UNHEALTHY.RANGE,
        },
        HAZARDOUS: {
          AMOUNT: { LOWER: 37, UPPER: 48 },
          AQI: EPA_454.AQI_LEVELS.HAZARDOUS.RANGE,
        },
        VERY_HAZARDOUS: {
          AMOUNT: { LOWER: 49, UPPER: 60 },
          AQI: EPA_454.AQI_LEVELS.VERY_HAZARDOUS.RANGE,
        },
      },
    },
    CO: {
      UNIT: 'milligramsPerM3',
      RANGES: {
        GOOD: {
          AMOUNT: { LOWER: 0, UPPER: 5 },
          AQI: EPA_454.AQI_LEVELS.GOOD.RANGE,
        },
        MODERATE: {
          AMOUNT: { LOWER: 6, UPPER: 10 },
          AQI: EPA_454.AQI_LEVELS.MODERATE.RANGE,
        },
        UNHEALTHY_FOR_SENSITIVE: {
          AMOUNT: { LOWER: 11, UPPER: 35 },
          AQI: EPA_454.AQI_LEVELS.UNHEALTHY_FOR_SENSITIVE.RANGE,
        },
        UNHEALTHY: {
          AMOUNT: { LOWER: 36, UPPER: 60 },
          AQI: EPA_454.AQI_LEVELS.UNHEALTHY.RANGE,
        },
        VERY_UNHEALTHY: {
          AMOUNT: { LOWER: 61, UPPER: 90 },
          AQI: EPA_454.AQI_LEVELS.VERY_UNHEALTHY.RANGE,
        },
        HAZARDOUS: {
          AMOUNT: { LOWER: 91, UPPER: 120 },
          AQI: EPA_454.AQI_LEVELS.HAZARDOUS.RANGE,
        },
        VERY_HAZARDOUS: {
          AMOUNT: { LOWER: 121, UPPER: 150 },
          AQI: EPA_454.AQI_LEVELS.VERY_HAZARDOUS.RANGE,
        },
      },
    },
    OZONE: {
      UNIT: 'microgramsPerM3',
      RANGES: {
        GOOD: {
          AMOUNT: { LOWER: 0, UPPER: 160 },
          AQI: EPA_454.AQI_LEVELS.GOOD.RANGE,
        },
        MODERATE: {
          AMOUNT: { LOWER: 161, UPPER: 200 },
          AQI: EPA_454.AQI_LEVELS.MODERATE.RANGE,
        },
        UNHEALTHY_FOR_SENSITIVE: {
          AMOUNT: { LOWER: 201, UPPER: 300 },
          AQI: EPA_454.AQI_LEVELS.UNHEALTHY_FOR_SENSITIVE.RANGE,
        },
        UNHEALTHY: {
          AMOUNT: { LOWER: 301, UPPER: 400 },
          AQI: EPA_454.AQI_LEVELS.UNHEALTHY.RANGE,
        },
        VERY_UNHEALTHY: {
          AMOUNT: { LOWER: 401, UPPER: 800 },
          AQI: EPA_454.AQI_LEVELS.VERY_UNHEALTHY.RANGE,
        },
        HAZARDOUS: {
          AMOUNT: { LOWER: 801, UPPER: 1000 },
          AQI: EPA_454.AQI_LEVELS.HAZARDOUS.RANGE,
        },
        VERY_HAZARDOUS: {
          AMOUNT: { LOWER: 1001, UPPER: 1200 },
          AQI: EPA_454.AQI_LEVELS.VERY_HAZARDOUS.RANGE,
        },
      },
    },
    OZONE_8H: {
      UNIT: 'microgramsPerM3',
      RANGES: {
        GOOD: {
          AMOUNT: { LOWER: 0, UPPER: 100 },
          AQI: EPA_454.AQI_LEVELS.GOOD.RANGE,
        },
        MODERATE: {
          AMOUNT: { LOWER: 101, UPPER: 160 },
          AQI: EPA_454.AQI_LEVELS.MODERATE.RANGE,
        },
        UNHEALTHY_FOR_SENSITIVE: {
          AMOUNT: { LOWER: 161, UPPER: 215 },
          AQI: EPA_454.AQI_LEVELS.UNHEALTHY_FOR_SENSITIVE.RANGE,
        },
        UNHEALTHY: {
          AMOUNT: { LOWER: 216, UPPER: 265 },
          AQI: EPA_454.AQI_LEVELS.UNHEALTHY.RANGE,
        },
        VERY_UNHEALTHY: {
          AMOUNT: { LOWER: 266, UPPER: 800 },
          AQI: EPA_454.AQI_LEVELS.VERY_UNHEALTHY.RANGE,
        },
        // 臭氧（O3）8小时平均浓度值高于800 ug/m3的，不再进行其空气质量分指数计算，臭氧（O3）空气质量分指数按1小时平均浓度计算的分指数报告。
      },
    },
    'PM2.5_24H': {
      UNIT: 'microgramsPerM3',
      RANGES: {
        GOOD: {
          AMOUNT: { LOWER: 0, UPPER: 35 },
          AQI: EPA_454.AQI_LEVELS.GOOD.RANGE,
        },
        MODERATE: {
          AMOUNT: { LOWER: 36, UPPER: 75 },
          AQI: EPA_454.AQI_LEVELS.MODERATE.RANGE,
        },
        UNHEALTHY_FOR_SENSITIVE: {
          AMOUNT: { LOWER: 76, UPPER: 115 },
          AQI: EPA_454.AQI_LEVELS.UNHEALTHY_FOR_SENSITIVE.RANGE,
        },
        UNHEALTHY: {
          AMOUNT: { LOWER: 116, UPPER: 150 },
          AQI: EPA_454.AQI_LEVELS.UNHEALTHY.RANGE,
        },
        VERY_UNHEALTHY: {
          AMOUNT: { LOWER: 151, UPPER: 250 },
          AQI: EPA_454.AQI_LEVELS.VERY_UNHEALTHY.RANGE,
        },
        HAZARDOUS: {
          AMOUNT: { LOWER: 251, UPPER: 350 },
          AQI: EPA_454.AQI_LEVELS.HAZARDOUS.RANGE,
        },
        VERY_HAZARDOUS: {
          AMOUNT: { LOWER: 351, UPPER: 500 },
          AQI: EPA_454.AQI_LEVELS.VERY_HAZARDOUS.RANGE,
        },
      },
    },
  },
};

/**
 * WAQI InstantCast.
 * [A Beginner's Guide to Air Quality Instant-Cast and Now-Cast.]{@link https://aqicn.org/faq/2015-03-15/air-quality-nowcast-a-beginners-guide/}
 * [Ozone AQI Scale update]{@link https://aqicn.org/faq/2016-08-10/ozone-aqi-scale-update/}
 * @type aqiStandard
 */
const WAQI_INSTANT_CAST = {
  APPLE_SCALE: EPA_454.APPLE_SCALE,
  AQI_LEVELS: EPA_454.AQI_LEVELS,
  SIGNIFICANT_LEVEL: EPA_454.SIGNIFICANT_LEVEL,

  CONCENTRATIONS: {
    ...EPA_454.CONCENTRATIONS,
    OZONE: {
      UNIT: 'ppb',
      RANGES: {
        GOOD: {
          AMOUNT: { LOWER: 0, UPPER: 61.5 },
          AQI: EPA_454.AQI_LEVELS.GOOD.RANGE,
        },
        MODERATE: {
          AMOUNT: { LOWER: 62.5, UPPER: 100.5 },
          AQI: EPA_454.AQI_LEVELS.MODERATE.RANGE,
        },
        UNHEALTHY_FOR_SENSITIVE: {
          AMOUNT: { LOWER: 101.5, UPPER: 151.5 },
          AQI: EPA_454.AQI_LEVELS.UNHEALTHY_FOR_SENSITIVE.RANGE,
        },
        UNHEALTHY: {
          AMOUNT: { LOWER: 152.5, UPPER: 204 },
          AQI: EPA_454.AQI_LEVELS.UNHEALTHY.RANGE,
        },
        VERY_UNHEALTHY: {
          AMOUNT: { LOWER: 205, UPPER: 404 },
          AQI: EPA_454.AQI_LEVELS.VERY_UNHEALTHY.RANGE,
        },
        HAZARDOUS: {
          AMOUNT: { LOWER: 405, UPPER: 504 },
          AQI: EPA_454.AQI_LEVELS.HAZARDOUS.RANGE,
        },
        VERY_HAZARDOUS: {
          AMOUNT: { LOWER: 505, UPPER: 604 },
          AQI: EPA_454.AQI_LEVELS.VERY_HAZARDOUS.RANGE,
        },
      },
    },
    'PM2.5': EPA_454.CONCENTRATIONS['PM2.5_24H'],
    PM10: EPA_454.CONCENTRATIONS.PM10_24H,
    CO: EPA_454.CONCENTRATIONS.CO_8H,
    OZONE_8H: undefined,
    'PM2.5_24H': undefined,
    PM10_24H: undefined,
    CO_8H: undefined,
    SO2_24H: undefined,
  },
};

/**
 * Check passed parameter is or not a non-NaN number
 * @author WordlessEcho <wordless@echo.moe>
 * @param {*} number - Value you wish to check
 * @return {boolean} - Return `true` if passed parameter is a non-NaN number
 */
const isNonNanNumber = (number) => typeof number === 'number' && !Number.isNaN(number);

/**
 * Check passed parameter is or not a valid latitude
 * @author WordlessEcho <wordless@echo.moe>
 * @param {number} latitude - Latitude you wish to check
 * @return {boolean} - Return `true` if passed parameter is a valid latitude
 */
const isLatitude = (latitude) => isNonNanNumber(latitude) && latitude >= -90 && latitude <= 90;

/**
 * Check passed parameter is or not a valid longitude
 * @author WordlessEcho <wordless@echo.moe>
 * @param {number} longitude - Longitude you wish to check
 * @return {boolean} - Return `true` if passed parameter is a valid longitude
 */
const isLongitude = (longitude) => (
  isNonNanNumber(longitude) && longitude >= -180 && longitude <= 180
);

/**
 * Check passed parameter is or not a valid location
 * @author WordlessEcho <wordless@echo.moe>
 * @param {coordinate} location - Location with latitude and longitude
 * @return {boolean} - Return `true` if passed parameter is a valid location
 */
const isLocation = (location) => isLatitude(location?.latitude) && isLongitude(location?.longitude);

const parseJson = (stringJson, catchDefault) => {
  // eslint-disable-next-line functional/no-try-statement
  try {
    return JSON.parse(stringJson);
  } catch (e) {
    return catchDefault(e);
  }
};

const parseJsonWithDefault = (stringJson, defaultValue) => {
  // eslint-disable-next-line functional/no-try-statement
  try {
    return JSON.parse(stringJson);
  } catch (e) {
    return defaultValue;
  }
};

const isRange = (range) => isNonNanNumber(range?.LOWER) && isNonNanNumber(range?.UPPER);
const isPositiveWithZeroRange = (range) => isRange(range) && range.LOWER >= 0 && range.UPPER >= 0;
const isPositiveRange = (range) => (
  isPositiveWithZeroRange(range) && range.LOWER !== 0 && range.UPPER !== 0
);

// https://stackoverflow.com/a/17415677
const toIsoString = (date) => {
  const tzo = -date.getTimezoneOffset();
  const dif = tzo >= 0 ? '+' : '-';
  const pad = (number) => (number < 10 ? '0' : '') + number;

  return `${date.getFullYear()}-`
    + `${pad(date.getMonth() + 1)}-`
    + `${pad(date.getDate())}T`
    + `${pad(date.getHours())}:`
    + `${pad(date.getMinutes())}:`
    + `${pad(date.getSeconds())}${dif}`
    + `${pad(Math.floor(Math.abs(tzo) / 60))}:`
    + `${pad(Math.abs(tzo) % 60)}`;
};

/**
 * Set Environment Variables
 * @author VirgilClyne
 * @param {String} name - Persistent Store Key
 * @return {Object}
 */
const toSettings = (envs) => {
  const settings = database.Weather.Settings;
  switch (envs?.Settings?.Version) {
    case 1:
      return {
        switch: parseJsonWithDefault(envs?.Settings?.Switch, settings.Switch),
        nextHour: {
          switch: parseJsonWithDefault(
            envs?.Settings?.NextHour?.Switch,
            settings.NextHour.Switch,
          ),
          source: typeof envs?.Settings?.NextHour?.Source === 'string' && envs.Settings.NextHour.Source.length > 0
            ? envs.Settings.NextHour.Source : settings.NextHour.Source,
        },
        aqi: {
          switch: parseJsonWithDefault(envs?.Settings?.AQI?.Switch, settings.AQI.Switch),
          targets: parseJsonWithDefault(`[${envs?.Settings?.AQI?.Targets}]`, settings.AQI.Targets),
          local: {
            switch: parseJsonWithDefault(
              envs?.Settings?.AQI?.Local?.Switch,
              settings.AQI.Local.Switch,
            ),
            standard: typeof envs?.Settings?.AQI?.Local?.Standard === 'string'
            && envs.Settings.AQI.Local.Standard.length > 0 ? envs.Settings.AQI.Standard
              : settings.AQI.Local.Standard,
          },
          source: typeof envs?.Settings?.AQI?.Source === 'string' && envs.Settings.AQI.Source.length > 0
            ? envs.Settings.AQI.Source : settings.AQI.Source,
          comparison: {
            switch: parseJsonWithDefault(
              envs?.Settings?.AQI?.Comparison.Switch,
              settings.AQI.Comparison.Switch,
            ),
            source: typeof envs?.Settings?.AQI?.Comparison?.Source === 'string'
            && envs.Settings.AQI.Comparison.Source.length > 0
              ? envs.Settings.AQI.Comparison.Source
              : settings.AQI.Comparison.Source,
          },
        },
        map: {
          aqi: parseJsonWithDefault(envs?.Settings?.Map?.AQI, settings.Map.AQI),
        },
        // TODO
        apis: {
          weatherOl: {
            httpHeaders: parseJsonWithDefault(
              envs?.Settings?.APIs?.WeatherOl?.HTTPHeaders,
              settings.APIs.WeatherOL.HTTPHeaders,
            ),
          },
          colorfulClouds: {
            httpHeaders: parseJsonWithDefault(
              envs?.Settings?.APIs?.ColorfulClouds?.HTTPHeaders,
              settings.APIs.ColorfulClouds.HTTPHeaders,
            ),
            token: envs?.Settings?.APIs?.ColorfulClouds?.Token,
            forceCnForAqi: parseJsonWithDefault(
              envs?.Settings?.APIs?.ColorfulClouds?.ForceCNForAQI,
              settings.APIs.ColorfulClouds.ForceCNForAQI,
            ),
            forceCnForComparison: parseJsonWithDefault(
              envs?.Settings?.APIs?.ColorfulClouds?.ForceCNForComparison,
              settings.APIs.ColorfulClouds.ForceCNForComparison,
            ),
          },
          waqi: {
            // TODO
            httpHeaders: parseJsonWithDefault(
              envs?.Settings?.APIs?.WAQI?.HTTPHeaders,
              settings.APIs.WAQI.HTTPHeaders,
            ),
            token: envs?.Settings?.APIs?.WAQI?.Token,
            // TODO
            mode: envs?.Settings?.APIs?.WAQI?.Mode,
          },
        },
      };
    default:
      return {
        switch: settings.Switch,
        nextHour: {
          switch: settings.NextHour.Switch,
          source: settings.NextHour.Source,
        },
        aqi: {
          switch: settings.AQI.Switch,
          targets: settings.AQI.Targets,
          local: {
            switch: settings.AQI.Local.Switch,
            standard: settings.AQI.Local.Standard,
          },
          source: settings.AQI.Source,
          comparison: {
            switch: settings.AQI.Comparison.Switch,
            source: settings.AQI.Comparison.Source,
          },
        },
        map: {
          aqi: settings.Map.AQI,
        },
        // TODO
        apis: {
          weatherOl: {
            httpHeaders: settings.APIs.WeatherOL.HTTPHeaders,
          },
          colorfulClouds: {
            httpHeaders: settings.APIs.ColorfulClouds.HTTPHeaders,
            token: settings.APIs.ColorfulClouds.Token,
            forceCnForAqi: settings.APIs.ColorfulClouds.ForceCNForAQI,
            forceCnForComparison: settings.APIs.ColorfulClouds.ForceCNForComparison,
          },
          waqi: {
            // TODO
            httpHeaders: settings.APIs.WAQI.HTTPHeaders,
            token: settings.APIs.WAQI.Token,
            mode: settings.APIs.WAQI.Mode,
          },
        },
      };
  }
};

const toCaches = (envs) => {
  const cache = database.Weather.Cache;
  switch (envs?.Cache?.Version) {
    case 1:
      return {
        ...envs?.Cache,
        aqis: {
          ...envs?.Cache?.aqis,
        },
      };
    default:
      return cache;
  }
};

/**
 * Get AQI from cache
 * @author WordlessEcho <wordless@echo.moe>
 * @param {Object.<number, cachedAqi[]>} cachedAqis - Caches of AQIs
 * @param {number} timestamp - UNIX timestamp of cached time
 * @param {coordinate} location - Coordinate of AQI info
 * @param {?string} stationName - `AirQuality.source` from QWeather
 * @param {iosAqiScale} scaleName - Part before the '.' in iOS `AirQuality.scale`
 * @return {cachedAqi|{aqi: -1}} - Matched AQI info
 */
const getCachedAqi = (cachedAqis, timestamp, location, stationName, scaleName) => {
  if (
    typeof cachedAqis === 'object' && isNonNanNumber(timestamp) && timestamp > 0
    && isLocation(location) && typeof scaleName === 'string'
  ) {
    const caches = Object.fromEntries(Object.entries(cachedAqis)
      .filter(([timestampString, aqisInfo]) => {
        const cachedTimestamp = parseInt(timestampString, 10);
        return isNonNanNumber(cachedTimestamp) && cachedTimestamp > 0
          && Array.isArray(aqisInfo);
      })
      .map(([timestampString, aqisInfo]) => [
        timestampString,
        aqisInfo.filter((aqiInfo) => (
          isNonNanNumber(aqiInfo?.aqi) && aqiInfo.aqi >= 0 && isLocation(aqiInfo?.location)
          && typeof aqiInfo?.scaleName === 'string'
        )),
      ]));

    if (Object.keys(caches).length > 0) {
      const cacheTimestampString = Object.keys(caches).find((timestampString) => {
        const cachedTimestamp = parseInt(timestampString, 10);
        return isNonNanNumber(cachedTimestamp) && cachedTimestamp >= timestamp
          && cachedTimestamp < timestamp + 1000 * 60 * 60;
      });
      const cacheTimestamp = parseInt(cacheTimestampString, 10);

      const cache = isNonNanNumber(cacheTimestamp)
        ? caches[cacheTimestamp].find((aqiInfo) => (
          typeof stationName === 'string' && stationName.length > 0
            ? aqiInfo?.stationName === stationName && aqiInfo?.scaleName === scaleName
            // Cannot get station name
            // https://www.mee.gov.cn/gkml/hbb/bwj/201204/W020140904493567314967.pdf
            : Math.abs(aqiInfo.location.longitude - location.longitude) < 0.045
            && Math.abs(aqiInfo.location.latitude - location.latitude) < 0.045
            && aqiInfo?.scaleName === scaleName
        ))
        : undefined;

      if (isNonNanNumber(cache?.aqi) && cache.aqi >= 0) {
        return cache;
      }
    }
  }

  return { aqi: -1 };
};

/**
 * Cache AQI
 * @author WordlessEcho <wordless@echo.moe>
 * @param {{aqis: Object.<number, cachedAqi[]>}} caches - Caches of iRingo.Weather.Caches
 * @param {number} timestamp - UNIX timestamp of cached time
 * @param {coordinate} location - Coordinate of AQI info
 * @param {?string} stationName - `AirQuality.source` from QWeather
 * @param {scaleName} scaleName - Part before the '.' in iOS `AirQuality.scale`
 * @param {number} aqi - Air quality index
 * @return {{aqis: Object.<number, cachedAqi[]>}} - Cache.
 * Cache will not be edited if any parameter is invalid.
 */
const cacheAqi = (caches, timestamp, location, stationName, scaleName, aqi) => {
  // Remove caches before 36 hours ago
  const cacheLimit = (+new Date()) - 1000 * 60 * 60 * 36;

  const validAqis = typeof caches?.aqis === 'object'
    ? Object.fromEntries(Object.entries(caches.aqis)
      .filter(([timestampString, aqisInfo]) => {
        const cachedTimestamp = parseInt(timestampString, 10);
        return isNonNanNumber(cachedTimestamp) && cachedTimestamp > cacheLimit
          && Array.isArray(aqisInfo);
      })
      .map(([timestampString, aqisInfo]) => [
        timestampString,
        aqisInfo.filter((aqiInfo) => (
          isNonNanNumber(aqiInfo?.aqi) && aqiInfo.aqi >= 0 && isLocation(aqiInfo?.location)
          && typeof aqiInfo?.scaleName === 'string'
        )),
      ])) : {};

  if (
    isNonNanNumber(timestamp) && timestamp > cacheLimit && isLocation(location)
    // TODO: Find out all scale name in Apple Weather
    && typeof scaleName === 'string'
  ) {
    const cacheTimestampString = Object.keys(validAqis).find((timestampString) => {
      const cachedTimestamp = parseInt(timestampString, 10);
      return isNonNanNumber(cachedTimestamp) && cachedTimestamp >= timestamp
        && cachedTimestamp < timestamp + 1000 * 60 * 60;
    });
    const cacheTimestamp = parseInt(cacheTimestampString, 10);

    const existedCache = isNonNanNumber(cacheTimestamp)
      ? validAqis[cacheTimestamp].find((aqiInfo) => (
        typeof stationName === 'string'
          ? aqiInfo?.stationName === stationName && aqiInfo?.scaleName === scaleName
          // Cannot get station name
          // https://www.mee.gov.cn/gkml/hbb/bwj/201204/W020140904493567314967.pdf
          : Math.abs(aqiInfo.location.longitude - location.longitude) < 0.045
          && Math.abs(aqiInfo.location.latitude - location.latitude) < 0.045
          && aqiInfo?.scaleName === scaleName
      ))
      : undefined;

    if (!isNonNanNumber(existedCache?.aqi)) {
      return {
        ...(typeof caches === 'object' && caches),
        aqis: {
          ...validAqis,
          [isNonNanNumber(cacheTimestamp) ? cacheTimestamp : timestamp]: [
            ...(Array.isArray(validAqis?.[cacheTimestamp]) ? validAqis[cacheTimestamp] : []),
            {
              location,
              ...(typeof stationName === 'string' && { stationName }),
              scaleName,
              aqi,
            },
          ],
        },
      };
    }
  }

  return {
    ...(typeof caches === 'object' && caches),
    aqis: { ...validAqis },
  };
};

/**
 * Get Origin Parameters
 * @author VirgilClyne
 * @author WordlessEcho <wordless@echo.moe>
 * @param {String} path - Path of URL
 * @return {Object.<'ver'|'language'|'lat'|'lng'|'countryCode', string>|{}} -
 * `version`, `language`, `latitude`, `longitude` and `regionCode` from path.
 * Empty object will be returned if type of path is invalid.
 */
const getParams = (path) => {
  if (typeof path !== 'string') {
    return {};
  }

  const regExp = /^(?<ver>v1|v2|v3)\/weather\/(?<language>[\w-_]+)\/(?<lat>-?\d+\.\d+)\/(?<lng>-?\d+\.\d+).*(?<countryCode>country=[A-Z]{2})?.*/i;
  return path.match(regExp).groups;
};

/**
 * Get the nearest station info from WAQI
 * @author WordlessEcho <wordless@echo.moe>
 * @param {coordinate} location - Location for finding the nearest station
 * @param {'mapq'|'mapq2'} mapqVersion - Version of mapq. Using 1 (mapq) if invalid.
 * @param {Object} headers - HTTP headers
 * @return {Promise<Object>} - Result from WAQI in mapq2 format
 */
const waqiNearest = (
  location,
  mapqVersion,
  headers = { 'Content-Type': 'application/json' },
) => new Promise((resolve) => {
  if (!isLocation(location)) {
    // eslint-disable-next-line functional/no-expression-statement
    resolve({
      status: 'error',
      data: `${waqiNearest.name}: Invalid location`
        + `Latitude: ${location?.latitude}`
        + `Longitude: ${location?.longitude}`,
    });
    return;
  }

  // eslint-disable-next-line functional/no-expression-statement
  $.get(
    {
      headers,
      url: `https://api.waqi.info/${mapqVersion}/nearest?n=1&geo=1/${location.latitude}/${location.longitude}`,
    },
    (error, _response, data) => {
      if (error) {
        // eslint-disable-next-line functional/no-expression-statement
        resolve({
          status: 'error',
          data: `${waqiNearest.name}: Error: ${error}\n`
            + `Data: ${data}`,
        });
        return;
      }

      const result = parseJson(data, (e) => ({
        status: 'error',
        data: `${waqiNearest.name}: Data from WAQI is not a valid JSON\n`
          + `Error: ${e}\n`
          + `Data: ${data}`,
      }));

      if (typeof result?.status === 'string' && result.status !== 'ok') {
        // eslint-disable-next-line functional/no-expression-statement
        resolve({
          status: 'error',
          data: result?.data ?? result?.message ?? result?.reason
            ?? `${waqiNearest.name}: WAQI return a unknown error\nData: ${data}`,
        });
        return;
      }

      // eslint-disable-next-line functional/no-expression-statement
      resolve(result);
    },
  );
});

/**
 * Get token for public from WAQI
 * @param {Object} headers - HTTP headers
 * @return {Promise<{status: 'ok'|'error', data: string}>} -
 * Token in `data` if ok. Error message in `data` if failed.
 */
const waqiToken = (headers = { 'Content-Type': 'application/json' }) => new Promise((resolve) => {
  // eslint-disable-next-line functional/no-expression-statement
  $.get(
    { headers, url: 'https://api.waqi.info/api/token/' },
    (error, _response, data) => {
      if (error) {
        // eslint-disable-next-line functional/no-expression-statement
        resolve({
          status: 'error',
          data: `${waqiToken.name}: Error: ${error}\n`
            + `Data: ${data}`,
        });
        return;
      }

      const result = parseJson(data, (e) => ({
        status: 'error',
        data: `${waqiToken.name}: Data from WAQI is not a valid JSON\n`
          + `Error: ${e}\n`
          + `Data: ${data}`,
      }));

      if (result.status === 'error') {
        // eslint-disable-next-line functional/no-expression-statement
        resolve(result);
        return;
      }

      if (result?.rxs?.status !== 'ok') {
        // eslint-disable-next-line functional/no-expression-statement
        resolve({
          status: 'error',
          data: `${waqiToken.name}: WAQI returned an unexpected status\n`
            + `rxs.status: ${result?.rxs?.status}`
            + `Data: ${data}`,
        });
        return;
      }

      if (!Array.isArray(result?.rxs?.obs)) {
        // eslint-disable-next-line functional/no-expression-statement
        resolve({
          status: 'error',
          data: `${waqiToken.name}: rxs.obs is not an array.\n`
            + `rxs.obs type: ${typeof result?.rxs?.obs}`
            + `Data: ${data}`,
        });
        return;
      }

      const token = result.rxs.obs.find((obs) => (
        typeof obs?.msg?.token === 'string' && obs?.msg?.token.length > 0
      ))?.msg?.token;
      if (typeof token !== 'string' || token.length <= 0) {
        // eslint-disable-next-line functional/no-expression-statement
        resolve({
          status: 'error',
          data: `${waqiToken.name}: No valid token found\n`
            + `Token type: ${typeof token}\n`
            + `Token length: ${token?.length}\n`
            + `Data: ${data}`,
        });
        return;
      }

      // eslint-disable-next-line functional/no-expression-statement
      resolve({ status: 'ok', data: token });
    },
  );
});

/**
 * Get data by using token from The World Air Quality Project.
 * [API - Air Quality Programmatic APIs]{@link https://aqicn.org/api/}
 * @author VirgilClyne
 * @author WordlessEcho <wordless@echo.moe>
 * @param {?coordinate} location - Required in feed based on location
 * @param {?number} stationId - Required in feed based on station ID
 * @param {string} token - Token for WAQI API.
 * [Air Quality Open Data Platform]{@link https://aqicn.org/data-platform/token/}
 * @param {Object} [headers] - HTTP headers
 * @return {Promise<Object>} - Feed data from WAQI
 */
const waqiV2 = (
  location,
  stationId,
  token,
  headers = { 'Content-Type': 'application/json' },
) => new Promise((resolve) => {
  if (typeof token !== 'string' || token.length <= 0) {
    // eslint-disable-next-line functional/no-expression-statement
    resolve({
      status: 'error',
      data: `${waqiV2.name}: Invalid token\n`
        + `Token type: ${typeof token}\n`
        + `Token length: ${token?.length}`,
    });
    return;
  }

  const getResult = (err, d) => {
    if (err) {
      return {
        status: 'error',
        data: `${waqiV2.name}: Error: ${err}\n`
          + `Data: ${d}`,
      };
    }

    const result = parseJson(d, (e) => ({
      status: 'error',
      data: 'Data from WAQI is not a valid JSON\n'
        + `Error: ${e}\n`
        + `Data: ${d}`,
    }));

    if (typeof result?.status !== 'string') {
      return {
        status: 'error',
        data: 'WAQI returned an unknown status\n'
          + `Data: ${d}`,
      };
    }

    return result;
  };

  const baseUrl = 'https://api.waqi.info';
  if (isLocation(location)) {
    // eslint-disable-next-line functional/no-expression-statement
    $.get(
      {
        headers,
        url: `${baseUrl}/feed/geo:${location.latitude};${location.longitude}/?token=${token}`,
      },
      (error, _response, data) => {
        // eslint-disable-next-line functional/no-expression-statement
        resolve(getResult(error, data));
      },
    );
    return;
  }

  if (isNonNanNumber(stationId)) {
    // eslint-disable-next-line functional/no-expression-statement
    $.get(
      {
        headers,
        url: `${baseUrl}/feed/@${stationId}/?token=${token}`,
      },
      (error, _response, data) => {
        // eslint-disable-next-line functional/no-expression-statement
        resolve(getResult(error, data));
      },
    );
    return;
  }

  // eslint-disable-next-line functional/no-expression-statement
  resolve({
    status: 'error',
    data: `${waqiV2.name}: Invalid parameters\n`
      + `Location: ${JSON.stringify(location)}`
      + `Station ID: ${stationId}`,
  });
});

/**
 * Get data from WAQI old API
 * @param {'now'|'aqi'} type - Type of API
 * @param {number} stationId - ID of station
 * @param {?string} token - Token for WAQI API
 * @param {Object} [headers] - HTTP headers
 * @return {Promise<Object>} - Data from WAQI
 */
const waqiV1 = (
  type,
  stationId,
  token,
  headers = { 'Content-Type': 'application/json' },
) => new Promise((resolve) => {
  if (!isNonNanNumber(stationId)) {
    // eslint-disable-next-line functional/no-expression-statement
    resolve({
      status: 'error',
      data: `${waqiV1.name}: Invalid station ID\n`
        + `Station ID: ${stationId}`,
    });
    return;
  }

  const getBody = (id, tokenForWaqi) => [
    ...(typeof tokenForWaqi === 'string' && tokenForWaqi.length > 0 ? [`token=${tokenForWaqi}`] : []),
    ...(isNonNanNumber(id) ? [`id=${id}`] : []),
  ].join('&');

  const baseUrl = 'https://api.waqi.info';
  const body = getBody(stationId, token);

  // eslint-disable-next-line functional/no-expression-statement
  $.get(
    {
      headers,
      url: `${baseUrl}/api/feed/@${stationId}/${type}.json`,
      ...(body.length > 0 && { body }),
    },
    (error, response, data) => {
      if (error) {
        // eslint-disable-next-line functional/no-expression-statement
        resolve({
          status: 'error',
          data: `${waqiV1.name}: Error: ${error}\n`
            + `Data: ${data}`,
        });
        return;
      }

      const result = parseJson(data, (e) => ({
        status: 'error',
        data: 'Data from WAQI is not a valid JSON\n'
          + `Error: ${e}\n`
          + `Data: ${data}`,
      }));

      if (typeof result?.rxs?.status !== 'string') {
        // eslint-disable-next-line functional/no-expression-statement
        resolve({
          status: 'error',
          data: 'WAQI returned an unknown status\n'
            + `Data: ${data}`,
        });
        return;
      }

      // eslint-disable-next-line functional/no-expression-statement
      resolve(result);
    },
  );
});

// TODO: Type of returned data
/**
 * Convert data from {@link waqiNearest} to feed format
 * @param {'mapq'|'mapq2'} version - Version of mapq
 * @param {Object} nearestData - Data from {@link waqiNearest}
 * @return {Object[]} - Data in feed format
 */
const waqiNearestToFeed = (version, nearestData) => {
  const toErrorMessage = (mapqVersion, data) => {
    const forUnknown = `${waqiNearestToFeed.name}: Unknown error from WAQI.\n`
      + `Data: ${JSON.stringify(nearestData)}`;
    switch (mapqVersion) {
      case 'mapq2':
        return data?.data ?? data?.reason ?? forUnknown;
      case 'mapq':
        return data?.data ?? data?.message ?? forUnknown;
      default:
        return forUnknown;
    }
  };

  if (nearestData.status === 'error') {
    return [{
      status: 'error',
      data: toErrorMessage(version, nearestData),
    }];
  }

  /**
   * Convert mapq(1) time to YYYY-MM-DDTHH:MM:SS+Timezone
   * @param {{t: number}|{utime: string}} data - Data with `t` or `utime`
   * @return {string} - YYYY-MM-DDTHH:MM:SS+Timezone format ISO time
   */
  const serverTimeToIsoString = (data) => {
    if (isNonNanNumber(data?.t) && data.t > 0) {
      return toIsoString(new Date(data.t * 1000));
    }

    if (!Number.isNaN(Date.parse(data?.utime))) {
      return data.utime;
    }

    return toIsoString((new Date()).setMinutes(0, 0, 0));
  };

  switch (version) {
    case 'mapq':
      if (!Array.isArray(nearestData?.d)) {
        return [{
          status: 'error',
          data: `${waqiNearestToFeed.name}: \`d\` is not an array\n`
            + `Data: ${JSON.stringify(nearestData)}`,
        }];
      }

      return nearestData.d.map((station) => {
        if (!isLatitude(station?.geo?.[1]) || !isLongitude(station?.geo?.[0])) {
          return {
            status: 'error',
            data: `${waqiNearestToFeed.name}: Invalid location\n`
              + `Latitude: ${station?.geo?.[1]}\n`
              + `Longitude: ${station?.geo?.[0]}\n`
              + `Station data: ${JSON.stringify(station)}`,
          };
        }

        const aqi = parseInt(station?.v, 10);
        const stationId = parseInt(station?.x, 10);
        // nna: Local language. nlo: English.
        const stationName = station?.nna ?? station?.nlo;

        if (!isNonNanNumber(aqi) || aqi < 0) {
          return {
            status: 'error',
            data: `${waqiNearestToFeed.name}: Invalid AQI\n`
              + `AQI: ${station?.v}\n`
              + `Station data: ${JSON.stringify(station)}`,
          };
        }

        return {
          status: 'ok',
          data: {
            aqi,
            ...(!Number.isNaN(stationId) && { idx: stationId }),
            attributions: [{
              url: 'https://waqi.info/',
              name: 'The World Air Quality Project',
            }],
            city: {
              geo: station.geo,
              ...(typeof stationName === 'string' && stationName.length > 0 && { name: stationName }),
              url: 'https://aqicn.org',
              location: '',
            },
            ...(typeof station?.pol === 'string' && station.pol.length > 0
              && { dominentpol: station.pol }),
            iaqi: {},
            time: {
              iso: serverTimeToIsoString(station),
            },
            forecast: {},
            debug: {},
          },
        };
      });
    case 'mapq2':
      if (!Array.isArray(nearestData?.data?.stations)) {
        return [{
          status: 'error',
          data: `${waqiNearestToFeed.name}: \`data.stations\` is not an array\n`
            + `Data: ${JSON.stringify(nearestData)}`,
        }];
      }

      return nearestData.data.stations.map((station) => {
        if (!isLatitude(station?.geo?.[1]) || !isLongitude(station?.geo?.[0])) {
          return {
            status: 'error',
            data: `${waqiNearestToFeed.name}: Invalid location\n`
              + `Latitude: ${station?.geo?.[1]}\n`
              + `Longitude: ${station?.geo?.[0]}`
              + `Station data: ${JSON.stringify(station)}`,
          };
        }

        const aqi = parseInt(station?.aqi, 10);
        const stationId = parseInt(station?.idx, 10);

        if (!isNonNanNumber(aqi) || aqi < 0) {
          return {
            status: 'error',
            data: `${waqiNearestToFeed.name}: Invalid AQI\n`
              + `AQI: ${station?.aqi}\n`
              + `Station data: ${JSON.stringify(station)}`,
          };
        }

        return {
          status: 'ok',
          data: {
            aqi,
            ...(!Number.isNaN(stationId) && { idx: stationId }),
            attributions: [{
              url: 'https://waqi.info/',
              name: 'The World Air Quality Project',
            }],
            city: {
              geo: nearestData.geo,
              ...(typeof nearestData?.name === 'string' && nearestData.name.length > 0
                && { name: nearestData.name }),
              url: 'https://aqicn.org',
              location: '',
            },
            iaqi: {},
            time: {
              iso: serverTimeToIsoString(nearestData),
            },
            forecast: {},
            debug: {},
          },
        };
      });
    default:
      return [{
        status: 'error',
        data: `${waqiNearestToFeed.name}: Unsupported mapq version.`,
      }];
  }
};

// TODO: Type of returned data
/**
 * Convert data from {@link waqiV1} to feed format
 * @param {Object} v1Data - Data from {@link waqiV1}
 * @return {Object[]} - Data in feed format
 */
const waqiV1ToFeed = (v1Data) => {
  const unknownError = `${waqiV1ToFeed.name}: Unknown error from WAQI\n`
    + `Data: ${JSON.stringify(v1Data)}`;

  if (v1Data?.status === 'error') {
    return [{
      status: 'error',
      data: v1Data?.data ?? unknownError,
    }];
  }

  if (v1Data?.rxs?.status !== 'ok') {
    return [{
      status: 'error',
      data: unknownError,
    }];
  }

  if (!Array.isArray(v1Data?.rxs?.obs)) {
    return [{
      status: 'error',
      data: `${waqiV1ToFeed.name}: \`d\` is not an array\n`
        + `Data: ${JSON.stringify(v1Data)}`,
    }];
  }

  /**
   * Make sure time in data is in YYYY-MM-DDTHH:MM:SS+Timezone format
   * @param {{msg: {time: {iso: string}}}} data - Data with `msg.time.iso`
   * @return {string} - YYYY-MM-DDTHH:MM:SS+Timezone format ISO time
   */
  const serverTimeToIsoString = (data) => {
    if (!Number.isNaN(Date.parse(data?.msg?.time?.iso))) {
      return data.msg.time.iso;
    }

    return toIsoString((new Date()).setMinutes(0, 0, 0));
  };

  /**
   * Try to convert debug time in YYYY-MM-DDTHH:MM:SS+Timezone format
   * @param {{msg: {xsync: {gen: number}}}| {msg: {debug: {sync: string}}}} data -
   * Data with `msg.xsync.gen` or `msg.debug.sync`
   * @return {?string} - Return null if data is invalid.
   */
  const getDebug = (data) => {
    if (isNonNanNumber(data?.msg?.xsync?.gen) && data.msg.xsync.gen > 0) {
      return toIsoString(new Date(data.msg.xsync.gen * 1000));
    }

    if (!Number.isNaN(Date.parse(data.msg?.debug?.sync))) {
      return data.msg.debug.sync;
    }

    return null;
  };

  return v1Data.rxs.obs.map((station) => {
    if (typeof station?.status !== 'string' || (station.status !== 'ok' && station.status !== 'error')) {
      return {
        status: 'error',
        data: `${waqiV1ToFeed.name}: Unknown status from WAQI\n`
          + `Station data: ${JSON.stringify(station)}`,
      };
    }

    if (!isNonNanNumber(station?.msg?.aqi) || station.msg.aqi < 0) {
      return {
        status: 'error',
        data: `${waqiV1ToFeed.name}: Invalid AQI\n`
          + `Station data: ${JSON.stringify(station)}`,
      };
    }

    const debug = getDebug(station);
    return {
      // TODO
      status: station.status,
      data: {
        ...station.msg,
        attributions: Array.isArray(station.msg?.attributions)
        && station.msg.attributions.length > 0 ? station.msg.attributions
          : [{
            url: 'https://waqi.info/',
            name: 'The World Air Quality Project',
          }],
        city: {
          url: 'https://aqicn.org',
          location: '',
          ...station.msg?.city,
        },
        iaqi: { ...station.msg?.iaqi },
        time: {
          ...station.msg?.time,
          iso: serverTimeToIsoString(station),
        },
        forecast: { ...station.msg?.forecast },
      },
      debug: { ...debug },
    };
  });
};

/**
 * Get data from "气象在线". This API could be considered as unconfigurable ColorfulClouds API.
 * [简介 | 彩云天气 API]{@link https://docs.caiyunapp.com/docs/v2.2/intro}
 * [通用预报接口/v2.2 - CaiyunWiki]{@link https://open.caiyunapp.com/%E9%80%9A%E7%94%A8%E9%A2%84%E6%8A%A5%E6%8E%A5%E5%8F%A3/v2.2}
 * @author VirgilClyne
 * @author WordlessEcho <wordless@echo.moe>
 * @param {'forecast'|'realtime'} type - `forecast` or `realtime`
 * @param {coordinate} location - { latitude, longitude }
 * @param {Object} headers - HTTP headers
 * @return {Promise<*>} data from "气象在线"
 */
const weatherOl = (
  type,
  location,
  headers = { 'Content-Type': 'application/json' },
) => new Promise((resolve) => {
  const apiVersion = 'v2.2';
  if (!isLocation(location)) {
    // eslint-disable-next-line functional/no-expression-statement
    resolve({
      status: 'failed',
      error: `${weatherOl.name}: Invalid location: ${JSON.stringify(location)}`,
      api_version: apiVersion,
    });
    return;
  }

  const request = {
    headers,
    url: 'https://www.weatherol.cn/api/minute/getPrecipitation'
      + `?type=${type}`
      + `&ll=${location.longitude},${location.latitude}`,
  };

  // eslint-disable-next-line functional/no-expression-statement
  $.get(request, (error, response, data) => {
    if (error || data === 'error') {
      // eslint-disable-next-line functional/no-expression-statement
      resolve({
        status: 'failed',
        error: `${weatherOl.name}: ${error && `Error: ${error}\n`}Data: ${data}`,
        api_version: apiVersion,
      });
      return;
    }

    const result = parseJson(data, (e) => ({
      status: 'failed',
      error: `${weatherOl.name}: Data from WeatherOL is not a valid JSON\n`
        + `Error: ${e}`
        + `Data: ${data}`,
    }));

    if (result?.status !== 'ok') {
      const version = isNonNanNumber(result?.api_version) ? `v${result.api_version}` : apiVersion;

      // eslint-disable-next-line functional/no-expression-statement
      resolve(typeof result?.status === 'string'
        // The type of api_version during error will be number
        ? {
          ...result,
          api_version: version,
        }
        : {
          status: 'failed',
          error: result?.message ?? `${weatherOl.name}: WeatherOL returned an unknown status\n`
            + `Data: ${data}`,
          api_version: version,
        });
      return;
    }

    // eslint-disable-next-line functional/no-expression-statement
    resolve(result);
  });
});

// TODO: returned type of ColorfulClouds
/**
 * Get data from ColorfulClouds. [简介 | 彩云天气 API]{@link https://docs.caiyunapp.com/docs/intro/}
 * @author WordlessEcho <wordless@echo.moe>
 * @author shindgewongxj
 * @param {string} token - Token for ColorfulClouds API
 * @param {coordinate} location - Coordinate of location
 * @param {string} language - Language from Apple Weather
 * @param {Object} [headers] - HTTP headers
 * @param {string} [apiVersion] - ColorfulClouds API version
 * @param {'realtime'|'minutely'|'hourly'|'daily'|'weather'} [path] -
 * @param {Object} [parameters] - parameters pass to URL
 * @return {Promise<Object>} data from ColorfulClouds
 */
const colorfulClouds = (
  token,
  location,
  language,
  headers = { 'Content-Type': 'application/json' },
  path = 'weather',
  parameters = { unit: 'metric:v2' },
  apiVersion = 'v2.6',
) => {
  /**
   * Convert iOS-style language into the language supported by ColorfulClouds API.
   * [语言 | 彩云天气 API]{@link https://docs.caiyunapp.com/docs/tables/lang}
   * @author shindgewongxj
   * @author WordlessEcho <wordless@echo.moe>
   * @param {string} languageWithReigon - "zh-Hans-CA", "en-US", "ja-CA" from Apple URL
   * @returns {string} - `en_US` will be returned if language is not supported
   */
  const toColorfulCloudsLang = (languageWithReigon) => {
    if (typeof languageWithReigon === 'string') {
      if (/zh-(Hans|CN)/.test(languageWithReigon)) {
        return 'zh_CN';
      }
      if (/zh-(Hant|HK|TW)/.test(languageWithReigon)) {
        return 'zh_TW';
      }
      if (languageWithReigon.includes('en-GB')) {
        return 'en_GB';
      }
      if (languageWithReigon.includes('ja')) {
        return 'ja';
      }
    }

    return 'en_US';
  };

  /**
   * Return a valid API version for ColorfulClouds.
   * @param {string} version - API version to be checked
   * @return {string} - API version for ColorfulClouds.
   * `v2.6` will be returned if passed version is invalid.
   */
  const checkCcApiVersion = (version) => {
    if (typeof version === 'string' && version.startsWith('v')) {
      const versionCode = parseFloat(version.slice(1));

      if (!Number.isNaN(versionCode)) {
        return version;
      }
    }

    return 'v2.6';
  };

  /**
   * Check the type of parameters
   * @param {string} uncheckedToken - Token of ColorfulClouds
   * @param {coordinate} uncheckedLocation - Coordinate of location
   * @return {string} - Error message to be returned.
   * Empty string will be returned if all types of parameter are correct.
   */
  const getError = (uncheckedToken, uncheckedLocation) => {
    if (typeof uncheckedToken !== 'string' || uncheckedToken.length <= 0) {
      return `${colorfulClouds.name}: Invalid token\n`
        + `Token type: ${typeof uncheckedToken}\n`
        + `Token length: ${uncheckedToken?.length}`;
    }

    if (!isLocation(uncheckedLocation)) {
      return `${colorfulClouds.name}: Invalid location: ${JSON.stringify(uncheckedLocation)}`;
    }

    return '';
  };

  return new Promise((resolve) => {
    const validApiVersion = checkCcApiVersion(apiVersion);
    const errorMessage = getError(token, location);
    if (errorMessage.length > 0) {
      // eslint-disable-next-line functional/no-expression-statement
      resolve({
        status: 'failed',
        error: errorMessage,
        api_version: validApiVersion,
      });
      return;
    }

    const parametersString = typeof parameters === 'object'
      ? Object.entries(parameters).map(([key, value]) => `&${key}=${value}`)
      : '';

    const request = {
      headers,
      url: `https://api.caiyunapp.com/${apiVersion}/${token}/`
        + `${location.longitude},${location.latitude}/`
        // https://docs.caiyunapp.com/docs/weather/
        + `${path}?lang=${toColorfulCloudsLang(language)}${parametersString}`,
    };

    // eslint-disable-next-line functional/no-expression-statement
    $.get(request, (error, response, data) => {
      if (error) {
        // eslint-disable-next-line functional/no-expression-statement
        resolve({
          status: 'failed',
          error: `${colorfulClouds.name}: Error: ${error}\n`
            + `Data: ${data}`,
          api_version: validApiVersion,
        });
        return;
      }

      const result = parseJson(data, (e) => ({
        status: 'failed',
        error: `${colorfulClouds.name}: Data from ColorfulClouds is not a valid JSON\n`
          + `Error: ${e}\n`
          + `Data: ${data}`,
      }));

      if (result?.status !== 'ok') {
        const version = isNonNanNumber(result?.api_version) ? `v${result.api_version}` : apiVersion;

        // eslint-disable-next-line functional/no-expression-statement
        resolve(typeof result?.status === 'string'
          // The type of api_version during error will be number
          ? {
            ...result,
            api_version: version,
          }
          : {
            status: 'failed',
            error: `${colorfulClouds.name}: ColorfulClouds returned an unknown status\n`
              + `Data: ${data}`,
            api_version: version,
          });
        return;
      }

      // eslint-disable-next-line functional/no-expression-statement
      resolve(result);
    });
  });
};

/**
 * Convert timestamp to time in Apple Weather
 * @author VirgilClyne
 * @author WordlessEcho <wordless@echo.moe>
 * @param {supportedIosApi} apiVersion - Apple Weather API Version
 * @param {number} timestamp - UNIX timestamp
 * @returns {number|string|''} - UNIX time in seconds for APIv1,
 * `YYYY-MM-DDTHH:MM:SSZ` format time for APIv2. Return in APIv2 if api version is not valid.
 */
const toAppleTime = (apiVersion, timestamp) => {
  const timeDate = isNonNanNumber(timestamp) && timestamp > 0
    ? (new Date(timestamp)) : (new Date());

  switch (apiVersion) {
    case 1:
      return Math.trunc((+timeDate) / 1000);
    case 2:
    case 3:
      return `${timeDate.toISOString().split('.')[0]}Z`;
    default:
      return '';
  }
};

/**
 * Convert pollutant amount to another unit
 * @author WordlessEcho <wordless@echo.moe>
 * @param {pollutantUnitsText} unit - Unit of amount
 * @param {pollutantUnitsText} unitToConvert - Unit to convert
 * @param {number} amount - Amount of pollutant
 * @param {?supportedVocs} pollutantName - For converting ppm or ppb to mg/m3 or ug/m3
 * @returns {number|-1} -
 * Converted amount or -1 if converting unsupported VOCs or unsupported units
 */
const pollutantUnitConverterUs = (unit, unitToConvert, amount, pollutantName) => {
  if (!isNonNanNumber(amount) || amount < 0) {
    return -1;
  }

  /**
   * Calculated by
   * ([Ozone AQI: Using concentrations in milligrams or ppb?]{@link https://aqicn.org/faq/2015-09-06/ozone-aqi-using-concentrations-in-milligrams-or-ppb/},
   * [Understanding Units of Measurement - Terrie K. Boguski, P.E. (CHSR)]{@link https://cfpub.epa.gov/ncer_abstracts/index.cfm/fuseaction/display.files/fileid/14285}):
   *
   * (amount * 12.187 * molecularWeight) / (temperatureInCelsius + 273.15)
   *
   * - 12.187 is the inverse of gas constant.
   * - 273.15 is the 0 celsius in kelvin.
   * - In US EPA, temperatureInCelsius is 25. In EU is 20.
   *
   * @type {Object.<supportedVocs, number>}
   */
  const US_PPX_TO_XGM3 = {
    NO2: 1.88, OZONE: 1.97, NO: 1.23, SO2: 2.62, CO: 1.14,
  };

  /**
   * Check unit is ppm or ppb
   * @author WordlessEcho <wordless@echo.moe>
   * @param {pollutantUnitsText} unitToCheck - Unit to be checked
   * @returns {boolean} - True if unit is `ppm` or `ppb`
   */
  const isPpx = (unitToCheck) => unitToCheck === 'ppm' || unitToCheck === 'ppb';

  /**
   * Check unit is mg/m3 or ug/m3
   * @author WordlessEcho <wordless@echo.moe>
   * @param {pollutantUnitsText} unitToCheck - Unit to be checked
   * @returns {boolean} - True if unit is `milligramsPerM3` or `microgramsPerM3`
   */
  const isXgM3 = (unitToCheck) => (
    unitToCheck === 'milligramsPerM3' || unitToCheck === 'microgramsPerM3'
  );

  if ((isPpx(unit) && isXgM3(unitToConvert)) || (isXgM3(unit) && isPpx(unitToConvert))) {
    if (!Object.keys(US_PPX_TO_XGM3).includes(pollutantName)) {
      return -1;
    }
  }

  switch (unit) {
    case 'ppm':
      switch (unitToConvert) {
        case 'ppm':
          return amount;
        case 'ppb':
          return amount * 1000;
        case 'milligramsPerM3':
          return amount * US_PPX_TO_XGM3[pollutantName];
        case 'microgramsPerM3': {
          const inPpb = pollutantUnitConverterUs(unit, 'ppb', amount, pollutantName);
          return inPpb * US_PPX_TO_XGM3[pollutantName];
        }
        default:
          return -1;
      }
    case 'ppb':
      switch (unitToConvert) {
        case 'ppb':
          return amount;
        case 'ppm':
          return amount * 0.001;
        case 'milligramsPerM3': {
          const inPpm = pollutantUnitConverterUs(unit, 'ppm', amount, pollutantName);
          return inPpm * US_PPX_TO_XGM3[pollutantName];
        }
        case 'microgramsPerM3':
          return amount * US_PPX_TO_XGM3[pollutantName];
        default:
          return -1;
      }
    case 'milligramsPerM3':
      switch (unitToConvert) {
        case 'milligramsPerM3':
          return amount;
        case 'microgramsPerM3':
          return amount * 1000;
        case 'ppm':
          return amount / US_PPX_TO_XGM3[pollutantName];
        case 'ppb': {
          const inUgM3 = pollutantUnitConverterUs(unit, 'microgramsPerM3', amount, pollutantName);
          return inUgM3 / US_PPX_TO_XGM3[pollutantName];
        }
        default:
          return -1;
      }
    case 'microgramsPerM3':
      switch (unitToConvert) {
        case 'microgramsPerM3':
          return amount;
        case 'milligramsPerM3':
          return amount * 0.001;
        case 'ppm': {
          const inMgM3 = pollutantUnitConverterUs(unit, 'milligramsPerM3', amount, pollutantName);
          return inMgM3 / US_PPX_TO_XGM3[pollutantName];
        }
        case 'ppb':
          return amount / US_PPX_TO_XGM3[pollutantName];
        default:
          return -1;
      }
    default:
      return -1;
  }
};

/**
 * Calculate AQI by AQI range and concentration breakpoints.
 * [Technical Assistance Document for the Reporting of Daily Air Quality – the Air Quality Index (AQI)]{@link https://www.airnow.gov/sites/default/files/2020-05/aqi-technical-assistance-document-sept2018.pdf}
 * [环境空气质量指数（AQI）技术规定（试行）]{@link https://www.mee.gov.cn/ywgz/fgbz/bz/bzwb/jcffbz/201203/W020120410332725219541.pdf}
 * @author WordlessEcho <wordless@echo.moe>
 * @param {concentrationRange[]} concentrationRanges - concentrationBreakpoints
 * @param {number} amount - Amount of pollutant
 * @returns {number|-1} - Air quality index, -1 if amount is not a valid number
 */
const toEpaAqi = (concentrationRanges, amount) => {
  if (Array.isArray(concentrationRanges) && isNonNanNumber(amount) && amount >= 0) {
    const ranges = concentrationRanges.filter((r) => (
      isPositiveWithZeroRange(r?.AMOUNT) && isPositiveWithZeroRange(r?.AQI)
    ));

    if (ranges.length > 0) {
      const range = ranges.find(({ AMOUNT }) => amount >= AMOUNT.LOWER && amount <= AMOUNT.UPPER);

      if (isPositiveWithZeroRange(range?.AQI) && isPositiveWithZeroRange(range?.AMOUNT)) {
        const { AQI, AMOUNT } = range;
        return Math.round(
          ((AQI.UPPER - AQI.LOWER) * (amount - AMOUNT.LOWER))
          / (AMOUNT.UPPER - AMOUNT.LOWER) + AQI.LOWER,
        );
      }

      // Over range!
      const topRange = ranges.reduce((previous, current) => (
        current.AMOUNT.UPPER > previous.AMOUNT.UPPER ? current : previous
      ));

      // Or we just return `topRange.AQI.UPPER`?
      if (
        isPositiveWithZeroRange(topRange?.AMOUNT) && isPositiveWithZeroRange(topRange?.AQI)
        && amount > topRange.AMOUNT.UPPER
      ) {
        return Math.round(amount - topRange.AMOUNT.UPPER + topRange.AQI.UPPER);
      }
    }
  }

  return -1;
};

/**
 * Calculate amount of pollutants to AQIs
 * @author WordlessEcho <wordless@echo.moe>
 * @param {Object.<string, concentration>} concentrationsInfo -
 * Amount breakpoints, AQI breakpoints and unit info of concentrations
 * @param {pollutantV2[]} pollutants - Name, amount and unit info of pollutants
 * @returns {aqiInfo}
 */
const toEpaAqis = (concentrationsInfo, pollutants) => {
  if (typeof concentrationsInfo !== 'object' || !Array.isArray(pollutants)) {
    return { index: -1, pollutants: [] };
  }

  const concentrations = Object.fromEntries(Object.entries(concentrationsInfo)
    .filter(([key, value]) => (
      typeof key === 'string' && key.length > 0 && typeof value?.UNIT === 'string'
      && value.UNIT.length > 0 && typeof value?.RANGES === 'object'
      && !Object.values(value.RANGES).some((rangesForLevel) => (
        !isPositiveWithZeroRange(rangesForLevel?.AMOUNT)
        || !isPositiveWithZeroRange(rangesForLevel?.AQI)
      ))
    )));

  const pollutantAqis = pollutants
    .filter((pollutant) => typeof pollutant?.name === 'string' && pollutant.name.length > 0)
    .map((pollutant) => {
      if (
        Object.keys(concentrations).includes(pollutant.name) && typeof pollutant?.unit === 'string'
        && pollutant.unit.length > 0 && isNonNanNumber(pollutant?.amount) && pollutant.amount >= 0
      ) {
        const { name, unit, amount } = pollutant;
        const concentration = concentrations[name];
        const convertedAmount = unit === concentration.UNIT ? amount
          : pollutantUnitConverterUs(unit, concentration.UNIT, amount, name);

        return { name, aqi: toEpaAqi(Object.values(concentration.RANGES), convertedAmount) };
      }

      return { name: pollutant.name, aqi: -1 };
    });

  const validAqis = pollutantAqis?.filter(({ aqi }) => aqi !== -1);
  const primary = Array.isArray(validAqis) && validAqis.length > 0 ? validAqis.reduce(
    (previous, current) => (current.aqi > previous.aqi ? current : previous),
  ) : { aqi: -1 };

  return {
    index: primary.aqi,
    ...(typeof primary?.name === 'string' && primary.name.length > 0 && { primary: primary.name }),
    pollutants: pollutantAqis,
  };
};

/**
 * Calculate Air Quality Level
 * @author WordlessEcho <wordless@echo.moe>
 * @author VirgilClyne
 * @param {aqiLevel[]} aqiLevels - Breakpoints of AQI
 * @param {number} aqi - Air quality index
 * @returns {number|-1} - -1 if AQI or aqiLevels is invalid.
 * `topLevel.VALUE` + 1 will be returned if no matched ranges.
 */
const toAqiLevel = (aqiLevels, aqi) => {
  if (Array.isArray(aqiLevels) && isNonNanNumber(aqi) && aqi >= 0) {
    const levels = aqiLevels.filter((level) => (
      isPositiveWithZeroRange(level?.RANGE) && isNonNanNumber(level?.VALUE) && level.VALUE > 0
    ));

    const level = levels.find(({ RANGE }) => (aqi >= RANGE.LOWER && aqi <= RANGE.UPPER));

    if (isNonNanNumber(level?.VALUE)) {
      return level.VALUE;
    }

    const topLevel = levels.length > 0 && levels.reduce((previous, current) => (
      current.VALUE > previous.VALUE ? current : previous
    ));

    if (isNonNanNumber(topLevel?.VALUE) && aqi > topLevel.RANGE.UPPER) {
      return topLevel.VALUE + 1;
    }
  }

  return -1;
};

/**
 * Compare Air Quality Levels
 * @author WordlessEcho <wordless@echo.moe>
 * @param {number} aqiLevelA - Value from {@link toAqiLevel} to compare
 * @param {number} aqiLevelB - Value from {@link toAqiLevel} to be compared
 * @returns {aqiComparison} - Value for `AirQuality.previousDayComparison`.
 * `unknown` will be returned if aqiLevel is invalid.
 */
const compareAqi = (aqiLevelA, aqiLevelB) => {
  if (
    !isNonNanNumber(aqiLevelA) || !isNonNanNumber(aqiLevelB) || aqiLevelA <= 0 || aqiLevelB <= 0
  ) {
    return 'unknown';
  }

  if (aqiLevelA > aqiLevelB) {
    return 'worse';
  } if (aqiLevelA < aqiLevelB) {
    return 'better';
  }

  return 'same';
};

/**
 * Fix unit of CO from QWeather
 * @param {pollutantUnitsIosV2|pollutantUnitsIosV1} unit - Unit of CO
 * @param {number} amount - Amount of CO
 * @return {number|-1} - Converted CO amount. -1 will be returned if amount is invalid.
 * Amount will not be converted if unit is not `microgramsPerM3`.
 */
const fixQweatherCo = (unit, amount) => {
  if (!isNonNanNumber(amount) || amount < 0) {
    return -1;
  }

  if (unit === 'µg/m3' || unit === 'microgramsPerM3') {
    const mgAmount = pollutantUnitConverterUs(
      'microgramsPerM3',
      HJ_633.CONCENTRATIONS.CO.UNIT,
      amount,
      'CO',
    );

    if (mgAmount < 0.1) {
      return pollutantUnitConverterUs(
        HJ_633.CONCENTRATIONS.CO.UNIT,
        'microgramsPerM3',
        amount,
        'CO',
      );
    }
  }

  return amount;
};

/**
 * Convert pollutants from Apple to specific EPA standard
 * @param {aqiStandard} standard
 * @param {Object.<iosPollutantNames, pollutantV2>} pollutants
 * @return {Object} - Object for {@link toAirQuality}
 */
const appleToEpaAirQuality = (standard, pollutants) => {
  if (
    typeof standard !== 'object' || typeof pollutants !== 'object'
    || typeof standard?.CONCENTRATIONS !== 'object' || typeof standard?.AQI_LEVELS !== 'object'
  ) {
    return {};
  }

  const validConcentrations = Object.fromEntries(Object.entries(standard.CONCENTRATIONS).filter(
    ([, value]) => (
      typeof value?.UNIT === 'string' && value.UNIT.length > 0 && typeof value?.RANGES === 'object'
      && !Object.values(value.RANGES).includes((v) => (
        !isPositiveRange(v?.AMOUNT) || !isPositiveWithZeroRange(v?.AQI)
      ))
    ),
  ));

  if (Object.keys(validConcentrations) <= 0) {
    return {};
  }

  const pollutantsValue = Object.values(pollutants).filter((pollutant) => (
    Object.keys(validConcentrations).includes(pollutant?.name) && typeof pollutant?.unit === 'string'
    && pollutant.unit.length > 0 && isNonNanNumber(pollutant?.amount) && pollutant.amount >= 0
  ));

  const aqis = toEpaAqis(validConcentrations, pollutantsValue);
  if (!isNonNanNumber(aqis.index) || aqis.index < 0) {
    return {};
  }

  const validAqiLevelValues = Object.values(standard.AQI_LEVELS).filter((level) => (
    isNonNanNumber(level.VALUE) && isPositiveWithZeroRange(level.RANGE)
  ));

  const topAqiLevelValue = validAqiLevelValues.length > 0
    ? Math.max(...validAqiLevelValues.map(({ VALUE }) => VALUE)) : -1;
  const aqiLevel = toAqiLevel(validAqiLevelValues, aqis.index);
  const categoryIndex = aqiLevel > 0 && aqiLevel > topAqiLevelValue ? topAqiLevelValue : aqiLevel;

  return {
    isSignificant: categoryIndex >= standard.SIGNIFICANT_LEVEL,
    ...(typeof aqis?.primary === 'string' && { primary: aqis.primary }),
    categoryIndex,
    aqi: aqis.index,
    // TODO
    scale: standard.APPLE_SCALE,
  };
};

// TODO: Type of returned data
/**
 * Get air quality from ColorfulClouds
 * @author WordlessEcho <wordless@echo.moe>
 * @param {Object} dataWithRealtime - Data from ColorfulClouds with air quality info
 * @return {Object.<iosPollutantNames|'aqi', number|{chn: number, usa: number}>
 *   |Object.<'aqi'|{chn: -1, usa: -1}>}
 */
const getCcAirQuality = (dataWithRealtime) => {
  const toColorfulCloudsNames = {
    NO2: 'no2', 'PM2.5': 'pm25', SO2: 'so2', OZONE: 'o3', PM10: 'pm10', CO: 'co', aqi: 'aqi',
  };

  const apiVersion = dataWithRealtime?.api_version;
  const versionCode = typeof dataWithRealtime?.api_version === 'string' && parseFloat(apiVersion.slice(1));
  const validVersionCode = isNonNanNumber(versionCode) ? versionCode : -1;

  // https://open.caiyunapp.com/%E5%BD%A9%E4%BA%91%E5%A4%A9%E6%B0%94_API/v2.5#.E6.A0.BC.E5.BC.8F.E5.8F.98.E6.9B.B4
  // https://docs.caiyunapp.com/docs/v2.4/intro#%E4%B8%8D%E5%85%BC%E5%AE%B9%E7%9A%84%E6%9B%B4%E6%96%B0
  if (validVersionCode >= 2.2 && validVersionCode < 3) {
    const airQuality = validVersionCode >= 2.4
      ? dataWithRealtime?.result?.realtime?.air_quality
      : dataWithRealtime?.result;

    if (typeof airQuality === 'object') {
      return Object.fromEntries(Object.keys(toColorfulCloudsNames).map((key) => {
        const value = airQuality?.[toColorfulCloudsNames[key]];

        if (key === 'aqi') {
          const chnAqi = validVersionCode >= 2.4 ? value?.chn : value;
          const usaAqi = validVersionCode >= 2.4 ? value?.usa : -1;

          return [key, {
            usa: isNonNanNumber(usaAqi) && usaAqi >= 0 ? usaAqi : -1,
            chn: isNonNanNumber(chnAqi) && chnAqi >= 0 ? chnAqi : -1,
          }];
        }

        return [
          key,
          isNonNanNumber(value) && value >= 0 ? value : -1,
        ];
      }));
    }
  }

  return { aqi: { usa: -1, chn: -1 } };
};

const colorfulCloudsHistoryAqi = (historyData, timestamp) => {
  if (!isNonNanNumber(timestamp) || timestamp <= 0) {
    return { usa: -1, chn: -1 };
  }

  const apiVersion = historyData?.api_version;
  const versionCode = typeof historyData?.api_version === 'string' && parseFloat(apiVersion.slice(1));
  const validVersionCode = isNonNanNumber(versionCode) ? versionCode : -1;

  const hourTimestamp = (new Date(timestamp)).setMinutes(0, 0, 0);

  const historyAqis = validVersionCode >= 2.4
    ? historyData?.result?.hourly?.air_quality?.aqi
    : historyData?.result?.hourly?.aqi;

  // An hour as range
  const aqis = Array.isArray(historyAqis) && historyAqis?.find((aqi) => {
    const ts = Date.parse(aqi?.datetime);

    return isNonNanNumber(ts) && ts > 0
      && ts >= hourTimestamp && ts < hourTimestamp + 1000 * 60 * 60;
  });

  const usaAqi = validVersionCode >= 2.4 ? aqis?.value?.usa : -1;
  const chnAqi = validVersionCode >= 2.4 ? aqis?.value?.chn : aqis?.value;

  return {
    usa: isNonNanNumber(usaAqi) && usaAqi >= 0 ? usaAqi : -1,
    chn: isNonNanNumber(chnAqi) && chnAqi >= 0 ? chnAqi : -1,
  };
};

// TODO: Type of data from ColorfulClouds
/**
 * Compare AQI of yesterday from ColorfulClouds
 * @author WordlessEcho <wordless@echo.moe>
 * @param {Object} realtimeAndHistoryData - Data with realtime and history from ColorfulClouds
 * @param {boolean} forceChn - Use `aqi.chn` by force
 * @return {aqiComparison} - Result of comparison for `previousDayComparison`
 */
const colorfulCloudsToAqiComparison = (realtimeAndHistoryData, forceChn) => {
  const airQuality = getCcAirQuality(realtimeAndHistoryData);

  const serverTime = parseInt(realtimeAndHistoryData?.server_time, 10);
  const serverTimestamp = isNonNanNumber(serverTime) && serverTime > 0
    ? serverTime * 1000 : (+new Date());
  const reportedTimestamp = (new Date(serverTimestamp)).setMinutes(0, 0, 0);
  const yesterdayTimestamp = reportedTimestamp - 1000 * 60 * 60 * 24;

  const todayAqi = airQuality.aqi;
  const yesterdayAqi = colorfulCloudsHistoryAqi(realtimeAndHistoryData, yesterdayTimestamp);

  if ((typeof forceChn !== 'boolean' || !forceChn) && todayAqi.usa >= 0 && yesterdayAqi.usa >= 0) {
    const todayAqiLevel = toAqiLevel(Object.values(EPA_454.AQI_LEVELS), todayAqi.usa);
    const yesterdayAqiLevel = toAqiLevel(Object.values(EPA_454.AQI_LEVELS), yesterdayAqi.usa);

    return compareAqi(todayAqiLevel, yesterdayAqiLevel);
  }

  if (todayAqi.chn >= 0 && yesterdayAqi.chn >= 0) {
    const todayAqiLevel = toAqiLevel(Object.values(HJ_633.AQI_LEVELS), todayAqi.chn);
    const yesterdayAqiLevel = toAqiLevel(Object.values(HJ_633.AQI_LEVELS), yesterdayAqi.chn);

    return compareAqi(todayAqiLevel, yesterdayAqiLevel);
  }

  return 'unknown';
};

const colorfulCloudsToAqiMetadata = (providerLogo, providerName, url, data) => {
  const language = data?.lang;
  const location = { latitude: data?.location?.[0], longitude: data?.location?.[1] };
  // the unit of server_time is second
  const serverTime = parseInt(data?.server_time, 10);
  const serverTimestamp = isNonNanNumber(serverTime) && serverTime > 0
    ? serverTime * 1000 : (+(new Date()));

  const reportedTimestamp = (new Date(serverTimestamp)).setMinutes(0, 0, 0);
  const expiredTimestamp = reportedTimestamp + 1000 * 60 * 60;

  const validProviderLogo = {
    ...(typeof providerLogo?.forV1 === 'string' && providerLogo.forV1.length > 0
      && { forV1: providerLogo.forV1 }),
    ...(typeof providerLogo?.forV2 === 'string' && providerLogo.forV2.length > 0
      && { forV2: providerLogo.forV2 }),
  };

  const variableMetadata = {
    ...(typeof language === 'string' && language.length > 0
      && { language: language.replace('_', '-') }),
    ...(isLocation(location) && { location }),
    ...(Object.keys(validProviderLogo).length > 0 && { providerLogo: validProviderLogo }),
    ...(typeof providerName === 'string' && providerName.length > 0 && { providerName }),
    url,
  };

  return Object.keys(variableMetadata).length > 0 ? {
    ...variableMetadata,
    expiredTimestamp,
    readTimestamp: serverTimestamp,
    reportedTimestamp,
    dataSource: 1,
    // https://developer.apple.com/documentation/weatherkitrestapi/unitssystem
    unit: 'm',
  } : {};
};

// TODO: Type of realtimeAndHistoryData
/**
 * Convert data from ColorfulClouds to object for {@link toAirQuality}
 * @author WordlessEcho <wordless@echo.moe>
 * @param {Object} realtimeAndHistoryData - Data with realtime and history from ColorfulClouds
 * @param {string} url - Link to AQI info
 * @param {string} providerName - Name of the provider for `source` of Apple Weather
 * @param {boolean} aqiForceChn - Use `aqi.chn` by force for AQI
 * @param {boolean} comparisonForceChn - Use `aqi.chn` by force for comparison
 * @return {Object} - Object for {@link toAirQuality}
 */
const colorfulCloudsToAqi = (
  realtimeAndHistoryData,
  url,
  providerName,
  aqiForceChn,
  comparisonForceChn,
) => {
  /**
   * Get AQI standard based on existed data
   * @author WordlessEcho <wordless@echo.moe>
   * @param {boolean} hasUsa - Existence of aqi.usa
   * @param {boolean} forceChn - Use aqi.chn by force
   * @return {aqiStandard}
   */
  const getCcStandard = (hasUsa, forceChn) => (
    typeof hasUsa !== 'boolean' || !hasUsa || (typeof forceChn === 'boolean' && forceChn)
      ? {
        ...HJ_633,
        CONCENTRATIONS: {
          ...HJ_633.CONCENTRATIONS,
          PM10: HJ_633.CONCENTRATIONS.PM10_24H,
          'PM2.5': HJ_633.CONCENTRATIONS['PM2.5_24H'],
        },
      } // TODO: EPA NowCast
      : WAQI_INSTANT_CAST
  );

  // TODO: Type of airQuality
  /**
   * Convert data from {@link getCcAirQuality} to {@link pollutantV2} object for Apple Weather
   * @author WordlessEcho <wordless@echo.moe>
   * @param {Object} airQuality - Pollutants data from {@link getCcAirQuality}
   * @return {Object.<iosPollutantNames, pollutantV2>|{}} -
   * Object for `airQuality.pollutants` of Apple Weather
   */
  const toPollutants = (airQuality) => (typeof airQuality === 'object'
    ? Object.fromEntries(Object.entries(airQuality)
      .filter(([key]) => key !== 'aqi')
      .map(([pollutantName, amount]) => ([pollutantName, {
        name: pollutantName,
        amount: pollutantName === 'CO' ? pollutantUnitConverterUs(
          'milligramsPerM3',
          'microgramsPerM3',
          amount,
          null,
        ) : amount,
        unit: 'microgramsPerM3',
      }])))
    : {});

  const airQuality = getCcAirQuality(realtimeAndHistoryData);
  const standard = getCcStandard(airQuality.aqi.usa >= 0, aqiForceChn);

  const aqi = standard.APPLE_SCALE === EPA_454.APPLE_SCALE
    ? airQuality.aqi.usa : airQuality.aqi.chn;
  if (!isNonNanNumber(aqi) || aqi < 0) {
    return {};
  }

  const categoryIndex = toAqiLevel(Object.values(standard.AQI_LEVELS), aqi);
  const pollutants = toPollutants(airQuality);
  const primaryPollutant = toEpaAqis(standard.CONCENTRATIONS, Object.values(pollutants))?.primary;

  return {
    isSignificant: categoryIndex >= (isNonNanNumber(standard.SIGNIFICANT_LEVEL)
      ? standard.SIGNIFICANT_LEVEL : Number.MAX_VALUE),
    url: typeof url === 'string' && url.length > 0 ? url : 'https://caiyunapp.com/weather/',
    pollutants,
    // TODO
    ...(typeof primaryPollutant === 'string' && { primaryPollutant }),
    sourceName: typeof providerName === 'string' && providerName.length > 0
      ? providerName : 'ColorfulClouds',
    categoryIndex,
    aqi,
    scale: standard.APPLE_SCALE,
    previousDayComparison:
      colorfulCloudsToAqiComparison(realtimeAndHistoryData, comparisonForceChn),
    sourceType: 'modeled',
  };
};

const waqiToAqiMetadata = (feedData) => {
  const location = {
    latitude: feedData?.data?.city?.geo?.[0],
    longitude: feedData?.data?.city?.geo?.[1],
  };
  if (!isLocation(location)) {
    return {};
  }

  const serverTimestamp = Date.parse(feedData?.data?.time?.iso);
  const validServerTimestamp = isNonNanNumber(serverTimestamp) && serverTimestamp > 0
    ? serverTimestamp : (+(new Date()));

  const reportedTimestamp = (new Date(validServerTimestamp)).setMinutes(0, 0, 0);
  const expiredTimestamp = reportedTimestamp + 1000 * 60 * 60;

  return {
    language: 'en-US',
    location,
    expiredTimestamp,
    providerLogo: {
      forV1: 'https://waqi.info/images/logo.png',
      forV2: 'https://raw.githubusercontent.com/VirgilClyne/iRingo/main/image/waqi.info.logo.png',
    },
    providerName: `${typeof feedData?.data?.city?.name === 'string'
      && feedData.data.city.name.length > 0 ? feedData.data.city.name : ''}`
      + ' (The World Air Quality Project)',
    readTimestamp: serverTimestamp,
    reportedTimestamp,
    dataSource: 0,
    // https://developer.apple.com/documentation/weatherkitrestapi/unitssystem
    unit: 'm',
    url: 'https://waqi.info',
  };
};

/**
 * Covert data from WAQI to object for {@link toAirQuality}
 * @author WordlessEcho <wordless@echo.moe>
 * @param {Object} feedData - Data with AQI from WAQI
 * @return {Object} - Object for {@link toAirQuality}
 */
const waqiToAqi = (feedData) => {
  const toApplePollutantName = {
    no2: 'NO2', no: 'NO', nox: 'NOX', pm25: 'PM2.5', so2: 'SO2', o3: 'OZONE', pm10: 'PM10', co: 'CO', other: 'OTHER',
  };

  const aqi = feedData?.data?.aqi;
  if (!isNonNanNumber(aqi) || aqi < 0) {
    return {};
  }

  const validAqi = typeof aqi === 'number' && !Number.isNaN(aqi) && aqi >= 0 ? aqi : -1;
  const categoryIndex = toAqiLevel(Object.values(WAQI_INSTANT_CAST.AQI_LEVELS), validAqi);

  return isNonNanNumber(aqi) && aqi >= 0 ? {
    isSignificant: categoryIndex >= (isNonNanNumber(WAQI_INSTANT_CAST.SIGNIFICANT_LEVEL)
      ? WAQI_INSTANT_CAST.SIGNIFICANT_LEVEL : Number.MAX_VALUE),
    url: typeof feedData?.data?.city?.url === 'string' && feedData.data.city.url.length > 0
      ? feedData.data.city.url : 'https://aqicn.org/',
    // Pollutant data from WAQI is AQI not amount
    pollutants: {},
    ...(Object.keys(toApplePollutantName).includes(feedData?.data?.dominentpol)
      && { primary: toApplePollutantName[feedData.data.dominentpol] }),
    sourceName: typeof feedData?.data?.city?.name === 'string' && feedData.data.city.name.length > 0
      ? feedData.data.city.name : 'The World Air Quality Project',
    categoryIndex,
    aqi: validAqi,
    scale: WAQI_INSTANT_CAST.APPLE_SCALE,
    previousDayComparison: 'unknown',
    sourceType: 'station',
  } : {};
};

/**
 * Mapping the precipitation level ranges to 3 level of ranges of Apple
 * @author WordlessEcho <wordless@echo.moe>
 * @param {precipitationLevels} precipitationLevels - Range of each precipitation level
 * @param {number} precipitation - Value of precipitation
 * @return {number} - Value for `forecastNextHour.minutes[].precipIntensityPerceived`.
 * 0 will be returned if precipitation levels or precipitation is invalid.
 */
const toPrecipitationIntensityPerceived = (precipitationLevels, precipitation) => {
  const levels = typeof precipitationLevels === 'object'
    ? Object.values(precipitationLevels).filter((level) => (
      isPositiveWithZeroRange(level.RANGE) && isNonNanNumber(level.VALUE)
      && level.VALUE >= 0 && level.VALUE <= 3
    ))
    : [];

  if (levels.length > 0 && isNonNanNumber(precipitation) && precipitation >= 0) {
    const topLevel = levels.reduce((previous, current) => (
      current.VALUE > previous.VALUE ? current : previous
    ));

    if (precipitation > topLevel.RANGE.UPPER) {
      return topLevel.VALUE;
    }

    const currentLevel = levels.find(({ RANGE }) => (
      precipitation >= RANGE.LOWER && precipitation < RANGE.UPPER
    ));
    const lastLevel = levels.find(({ VALUE }) => VALUE === currentLevel.VALUE - 1);

    if (
      isPositiveWithZeroRange(currentLevel?.RANGE) && isPositiveWithZeroRange(lastLevel?.RANGE)
      && isNonNanNumber(currentLevel?.VALUE) && isNonNanNumber(lastLevel?.VALUE)
    ) {
      return currentLevel.VALUE <= 0 || currentLevel.VALUE >= 4 ? currentLevel.VALUE
        : currentLevel.VALUE + (((precipitation - lastLevel.UPPER) * 1000)
        / ((currentLevel.UPPER - currentLevel.LOWER) * 1000));
    }
  }

  return 0;
};

/**
 * Get weather status for `NextHourForecast.condition[].token`
 * @author WordlessEcho <wordless@echo.moe>
 * @param {precipitationType} precipitationType - Type of precipitation
 * @param {number} precipitationIntensityPerceived - Apple precipitation.
 * Can be generated from {@link toPrecipitationIntensityPerceived}
 * @returns {weatherStatus} Weather status of current type and precipitation
 */
const perceivedToStatus = (precipitationType, precipitationIntensityPerceived) => {
  if (precipitationType === 'clear' || precipitationIntensityPerceived <= 0) {
    return 'clear';
  }

  if (precipitationType === 'rain' || precipitationType === 'snow') {
    if (precipitationIntensityPerceived <= 1) {
      return precipitationType === 'rain' ? 'drizzle' : 'flurries';
    }
    if (precipitationIntensityPerceived <= 2) {
      return precipitationType === 'rain' ? 'rain' : 'snow';
    }

    return precipitationType === 'rain' ? 'heavy-rain' : 'heavy-snow';
  }

  return precipitationType;
};

/**
 * Convert WEATHER_STATUS to WEATHER_TYPES
 * @author WordlessEcho <wordless@echo.moe>
 * @param {weatherStatus} weatherStatus - one of `WEATHER_STATUS`
 * @returns {precipitationType} `precipitation` will be returned if precipitation is invalid.
 */
const weatherStatusToType = (weatherStatus) => {
  switch (weatherStatus) {
    case 'clear':
    case 'sleet':
    case 'hail':
    case 'mixed':
      return weatherStatus;
    case 'flurries':
    case 'snow':
    case 'heavy-snow':
      return 'snow';
    case 'drizzle':
    case 'rain':
    case 'heavy-rain':
      return 'rain';
    default:
      return 'precipitation';
  }
};

const colorfulCloudsToNextHourMetadata = (providerName, url, data) => {
  const language = data?.lang;
  const location = { latitude: data?.location?.[0], longitude: data?.location?.[1] };
  // the unit of server_time is second
  const serverTime = parseInt(data?.server_time, 10);
  const serverTimestamp = isNonNanNumber(serverTime) && serverTime > 0
    ? serverTime * 1000 : (+(new Date()));

  const reportedTimestamp = (new Date(serverTimestamp)).setMinutes(0, 0, 0);
  const expiredTimestamp = reportedTimestamp + 1000 * 60 * 15;

  return {
    language: typeof language === 'string' && language.length > 0
      ? language.replace('_', '-') : 'zh-CN',
    ...(isLocation(location) && { location }),
    expiredTimestamp,
    providerName: typeof providerName === 'string' && providerName.length > 0
      ? providerName : 'ColorfulClouds',
    readTimestamp: serverTimestamp,
    dataSource: 1,
    // https://developer.apple.com/documentation/weatherkitrestapi/unitssystem
    unit: 'm',
    url,
  };
};

// TODO: Type of data from ColorfulClouds
/**
 * Covert data from ColorfulClouds to minutes for {@link toNextHour}
 * @author WordlessEcho <wordless@echo.moe>
 * @param {string} providerName - Name of the provider. Will be used as placeholder.
 * @param {Object} dataWithMinutely - Data from ColorfulClouds with minutely
 * @return {Object} nextHourObject for {@link toNextHour}
 */
const colorfulCloudsToNextHour = (providerName, dataWithMinutely) => {
  const supportedCcApis = [2];
  const supportedUnits = ['metric:v2', 'metric:v1', 'metric'];

  // [降水强度 | 彩云天气 API]{@link https://docs.caiyunapp.com/docs/tables/precip} (v2.6)
  const radarLevels = {
    NO: { VALUE: 0, RANGE: { LOWER: 0, UPPER: 0.031 } },
    LIGHT: { VALUE: 1, RANGE: { LOWER: 0.031, UPPER: 0.25 } },
    MODERATE: { VALUE: 2, RANGE: { LOWER: 0.25, UPPER: 0.35 } },
    HEAVY: { VALUE: 3, RANGE: { LOWER: 0.35, UPPER: 0.48 } },
    STORM: { VALUE: 4, RANGE: { LOWER: 0.48, UPPER: Number.MAX_VALUE } },
  };

  // [降水强度 | 彩云天气 API]{@link https://docs.caiyunapp.com/docs/tables/precip} (v2.6)
  const mmPerHourLevels = {
    NO: { VALUE: 0, RANGE: { LOWER: 0, UPPER: 0.08 } },
    LIGHT: { VALUE: 1, RANGE: { LOWER: 0.08, UPPER: 3.44 } },
    MODERATE: { VALUE: 2, RANGE: { LOWER: 3.44, UPPER: 11.33 } },
    HEAVY: { VALUE: 3, RANGE: { LOWER: 11.33, UPPER: 51.30 } },
    STORM: { VALUE: 4, RANGE: { LOWER: 51.30, UPPER: Number.MAX_VALUE } },
  };

  const KM = {
    zh_CN: '公里',
    zh_TW: '公里',
    // kilometers
    ja: 'キロメートル',
    en_US: 'km',
    en_GB: 'km',
  };

  /**
   * Get precipitation type from ColorfulClouds hourly skycons.
   * [天气现象 | 彩云天气API]{@link https://docs.caiyunapp.com/docs/tables/skycon/}
   * @author WordlessEcho <wordless@echo.moe>
   * @param {number} timestamp - UNIX timestamp of server time
   * @param {{datetime: string, value: string}[]} skycons - skycon array from ColorfulClouds
   * @return {precipitationType|''} - Weather type or empty string if no valid sky condition
   */
  const getPrecipitationType = (timestamp, skycons) => {
    if (!Array.isArray(skycons)) {
      return '';
    }

    const validTimestamp = isNonNanNumber(timestamp) && timestamp > 0 ? timestamp : (+(new Date()));
    const nowHourTimestamp = (new Date(validTimestamp)).setMinutes(0, 0, 0);

    const skyCondition = skycons?.find((skycon) => {
      const ts = Date.parse(skycon?.datetime);

      return isNonNanNumber(ts) && ts > 0
        && ts >= nowHourTimestamp && ts < nowHourTimestamp + 1000 * 60 * 60;
    })?.value;

    if (typeof skyCondition !== 'string' || skyCondition.length <= 0) {
      return '';
    }

    if (skyCondition.includes('SNOW')) {
      return 'snow';
    }

    if (skyCondition.includes('RAIN')) {
      return 'rain';
    }

    return 'clear';
  };

  /**
   * Assign chance for each minute
   * since ColorfulClouds only provider chances for periods of 30 minutes
   * @author WordlessEcho <wordless@echo.moe>
   * @param {number[]} probabilities - `result.minutely.probability` from ColorfulClouds
   * @param {number} timeInMinute - Minutes from start time of precipitation
   * @return {number|-1} - 0 to 100 integer, -1 will be returned if probability is invalid
   */
  const getChance = (probabilities, timeInMinute) => {
    if (Array.isArray(probabilities) && isNonNanNumber(timeInMinute) && timeInMinute >= 0) {
      // Calculate order, 1 as first index.
      // Index here is relative to bound, plus bound for real index in precipitations.
      // We have only 4 chances per half hour from API.
      const chance = probabilities?.[Math.floor(timeInMinute / 30)];

      if (isNonNanNumber(chance) && chance >= 0) {
        return chance;
      }
    }

    return -1;
  };

  /**
   * Mapping times to 'variable' that helpful for Apple to use cached description
   * @author WordlessEcho <wordless@echo.moe>
   * @param {string} description - Description for next two hours from ColorfulClouds
   * @param {string} ccLanguage - Language code from ColorfulClouds
   * @param {number} timeInMinute - Minutes from start time of precipitaion
   * @return {{shortDescription: string, parameters: Object.<string, number>}} -
   * Short description and parameters for Apple Weather
   */
  const toDescription = (description, ccLanguage, timeInMinute) => {
    if (typeof description !== 'string') {
      return {
        shortDescription: '',
        parameters: {},
      };
    }

    /**
     * Transfer numbers into ordinal numerals. [Source code]{@link https://stackoverflow.com/a/20426113}
     * @author WordlessEcho <wordless@echo.moe>
     * @param {number} number - Number to transfer
     * @return {string} - Ordinal numeral of given number.
     * Empty string will be returned if given number is invalid.
     */
    const stringifyNumber = (number) => {
      const special = [
        'zeroth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth',
        'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth',
        'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth',
      ];
      const deca = ['twent', 'thirt', 'fort', 'fift', 'sixt', 'sevent', 'eight', 'ninet'];

      if (!isNonNanNumber(number) || number < 0) {
        return '';
      }

      if (number < 20) {
        return special[number];
      }

      if (number % 10 === 0) {
        return `${deca[Math.floor(number / 10) - 2]}ieth`;
      }

      return `${deca[Math.floor(number / 10) - 2]}y-${special[number % 10]}`;
    };

    /**
     * Map times in description to `{firstAt}`, `{secondAt}`, etc...
     * @author WordlessEcho <wordless@echo.moe>
     * @param {string} rawDescription - Description with times
     * @return {{shortDescription: string|'', parameters: Object.<string, number>}} -
     * Short description and parameters for Apple Weather
     */
    const modifyDescription = (rawDescription) => {
      if (typeof rawDescription !== 'string' || rawDescription.length <= 0) {
        return {
          shortDescription: '',
          parameters: {},
        };
      }

      /**
       * Insert 'after that' for description.
       * Times in description in Apple Weather after `{firstAt}` will be display as period.
       * @author WordlessEcho <wordless@echo.moe>
       * @param {string} language - Language from ColorfulClouds for description
       * @param {string} modifiedDescription - Description with '{firstAt}'
       * @return {string|''} - Description after inserted.
       * Return empty string if description is invalid.
       */
      const insertAfterToDescription = (language, modifiedDescription) => {
        if (typeof modifiedDescription !== 'string') {
          return '';
        }

        const FIRST_AT = '{firstAt}';
        // Words that used to insert into description
        const AFTER = {
          zh_CN: '再过',
          zh_TW: '再過',
          ja: 'その後',
          en_US: 'after that',
          // ColorfulClouds seems not prefer to display multiple times in en_GB
          en_GB: 'after that',
        };

        // Split description into two part at `{firstAt}`
        const splitDescriptions = modifiedDescription.split(FIRST_AT);
        if (splitDescriptions.length < 2) {
          return modifiedDescription;
        }

        switch (language) {
          case 'en_GB':
            return [
              ...splitDescriptions.slice(0, splitDescriptions.length - 1),
              splitDescriptions[splitDescriptions.length - 1]
                // Append `after that` to description.
                .replaceAll('} min later', `{$1} min later ${AFTER.en_GB}`),
            ].join(FIRST_AT);
          case 'zh_CN':
            return [
              ...splitDescriptions.slice(0, splitDescriptions.length - 1),
              splitDescriptions[splitDescriptions.length - 1]
                .replaceAll('直到{', `${AFTER.zh_CN}{`),
            ].join(FIRST_AT);
          case 'zh_TW':
            return [
              ...splitDescriptions.slice(0, splitDescriptions.length - 1),
              splitDescriptions[splitDescriptions.length - 1]
                .replaceAll('直到{', `${AFTER.zh_TW}{`),
            ].join(FIRST_AT);
          case 'ja':
            // Japanese support from ColorfulClouds is broken for sometime.
            // https://lolic.at/notice/AJNH316TTSy1fRlOka

            // TODO: I am not familiar for Japanese, contributions welcome
            return [
              ...splitDescriptions.slice(0, splitDescriptions.length - 1),
              splitDescriptions[splitDescriptions.length - 1]
                .replaceAll('{', `${AFTER.ja}{`),
            ].join(FIRST_AT);
          case 'en_US':
            return [
              ...splitDescriptions.slice(0, splitDescriptions.length - 1),
              splitDescriptions[splitDescriptions.length - 1]
                .replaceAll('} min later', `{$1} min later ${AFTER.en_US}`),
            ].join(FIRST_AT);
          default:
            return modifiedDescription;
        }
      };

      const times = rawDescription
        .match(/\d+/g).map((timeInString) => parseInt(timeInString, 10))
        .filter((time) => isNonNanNumber(time) && time > 0);

      const descriptionWithParameters = times.reduce(
        ({ shortDescription, parameters }, time, index) => {
          const key = `${stringifyNumber(index + 1)}At`;
          return {
            shortDescription: shortDescription.replace(`${time}`, `{${key}}`),
            parameters: { ...parameters, [key]: time },
          };
        },
        { shortDescription: rawDescription, parameters: {} },
      );

      const shortDescription = insertAfterToDescription(
        ccLanguage,
        descriptionWithParameters.shortDescription,
      );

      return {
        // Unsupported language
        shortDescription: shortDescription.length > 0
          ? shortDescription : descriptionWithParameters.shortDescription,
        parameters: descriptionWithParameters.parameters,
      };
    };

    const SPLITTERS = {
      en_US: ['but ', 'and '],
      en_GB: ['but ', 'and '],
      zh_CN: ['，'],
      zh_TW: ['，'],
      ja: ['、'],
    };

    // Split sentence by time
    const allTimes = description.match(/\d+/g)
      .map((timeInString) => parseInt(timeInString, 10))
      .filter((time) => !Number.isNaN(time) && time > 0);

    const expiredTimes = allTimes.filter((time) => time <= timeInMinute);
    if (expiredTimes.length <= 0) {
      const modifiedDescription = modifyDescription(description);
      return modifiedDescription.shortDescription.length > 0 ? modifiedDescription : '';
    }

    const maxExpiredTime = Math.max(...expiredTimes);
    if (maxExpiredTime === allTimes[allTimes.length - 1]) {
      return {
        shortDescription: '',
        parameters: {},
      };
    }

    const startIndex = description.indexOf(`${maxExpiredTime}`) + `${maxExpiredTime}`.length;

    const splitters = SPLITTERS[ccLanguage];
    const splitIndexes = splitters.map((splitter) => (
      description.indexOf(splitter, startIndex)
    )).filter((index) => index !== -1);

    const modifiedDescription = modifyDescription(description.slice(Math.min(...splitIndexes)));
    return modifiedDescription.shortDescription.length > 0 ? modifiedDescription : '';
  };

  const provider = typeof providerName === 'string' && providerName.length > 0
    ? providerName : $.name;

  // Version from API is beginning with `v`
  const majorVersion = parseInt(dataWithMinutely?.api_version?.slice(1), 10);
  if (
    dataWithMinutely?.status !== 'ok'
      || !supportedCcApis.includes(majorVersion)
      || !supportedUnits.includes(dataWithMinutely?.unit)
      // ColorfulClouds: This might be deprecated in future
      || dataWithMinutely?.result?.minutely?.datasource !== 'radar'
      || !Array.isArray(dataWithMinutely.result.minutely?.precipitation_2h)
      || !Array.isArray(dataWithMinutely.result.minutely?.probability)
      || (typeof dataWithMinutely.result.minutely?.description !== 'string'
        && typeof dataWithMinutely.result?.forecast_keypoint !== 'string')
  ) {
    return [];
  }

  // the unit of server_time is second
  const serverTime = parseInt(dataWithMinutely?.server_time, 10);
  const serverTimestamp = isNonNanNumber(serverTime) && serverTime > 0
    ? serverTime * 1000 : (+(new Date()));

  const maxPrecipitation = Math.max(...dataWithMinutely.result.minutely.precipitation_2h);
  const levels = dataWithMinutely?.unit === 'metric:v2' ? mmPerHourLevels : radarLevels;

  const minutes = dataWithMinutely.result.minutely.precipitation_2h.map((precipitation, index) => {
    const validPrecipitation = isNonNanNumber(precipitation) && precipitation >= 0
      ? precipitation : 0;

    const timeInMinute = index + 1;

    const hourlyPrecipitationType = getPrecipitationType(
      serverTimestamp + 1000 * 60 * timeInMinute,
      dataWithMinutely.result?.hourly?.skycon,
    );
    const hourlyType = hourlyPrecipitationType === 'clear' || hourlyPrecipitationType.length <= 0
      ? 'precipitation' : hourlyPrecipitationType;
    const precipitationType = maxPrecipitation >= Object.values(levels)
      .find(({ VALUE }) => VALUE === 0).RANGE.LOWER ? hourlyType : 'clear';

    const precipitationIntensityPerceived = toPrecipitationIntensityPerceived(
      levels,
      validPrecipitation,
    );
    const isClear = validPrecipitation < levels.NO.RANGE.UPPER;
    const chance = getChance(dataWithMinutely.result.minutely.probability, timeInMinute);
    const validChance = chance >= 0 ? chance : 100;
    const ccDescription = dataWithMinutely.result.minutely.description;
    const descriptionWithParameters = toDescription(
      ccDescription,
      dataWithMinutely?.lang,
      timeInMinute,
    );
    const validDescriptionWithParameters = descriptionWithParameters.shortDescription.length > 0
      ? descriptionWithParameters : { shortDescription: provider, parameters: {} };

    return {
      weatherStatus: perceivedToStatus(precipitationType, precipitationIntensityPerceived),
      precipitation: validPrecipitation,
      precipitationIntensityPerceived,
      // Set chance to zero if clear
      chance: isClear ? 0 : validChance,
      longDescription: dataWithMinutely.result.forecast_keypoint,
      // ColorfulClouds may report no rain even if precipitation > no rain
      ...(isClear || ccDescription.includes(KM[dataWithMinutely?.lang]) ? {
        shortDescription: ccDescription.length > 0 ? ccDescription : provider,
        parameters: {},
      } : validDescriptionWithParameters),
    };
  });

  return {
    readTimestamp: serverTimestamp,
    minutes,
  };
};

/**
 * Append station name from QWeather to provider name
 * @author WordlessEcho <wordless@echo.moe>
 * @param {string} providerName - Provider name from metadata
 * @param {string} source - Station name in source
 * @return {string|''} - Appended string
 */
const appendQweatherSourceToProviderName = (providerName, source) => {
  if (typeof source !== 'string' || source.length <= 0) {
    return typeof providerName === 'string' && providerName.length > 0 ? providerName : '';
  }

  switch (providerName) {
    case '和风天气':
      return `${source}（${providerName}）`;
    case 'QWeather':
      return `${source} (${providerName})`;
    default:
      return providerName;
  }
};

// TODO: type of returned data
/**
 * Create metadata
 * @author VirgilClyne
 * @param {supportedIosApi} appleApiVersion - Apple API version
 * @return {Object}
 */
const toMetadata = (appleApiVersion, metadataObject) => {
  const supportedApis = [1, 2, 3];
  if (!supportedApis.includes(appleApiVersion)) {
    return {};
  }

  const sharedMetadata = {
    ...(typeof metadataObject?.language === 'string' && metadataObject.language.length > 0
      && { language: metadataObject.language }),
    ...(isLatitude(metadataObject?.location?.latitude)
      && { latitude: metadataObject.location.latitude }),
    ...(isLongitude(metadataObject?.location?.longitude)
      && { longitude: metadataObject.location.longitude }),
  };

  const getMetadata = (apiVersion, metadataObj) => {
    switch (apiVersion) {
      case 1:
        // no units for APIv1
        return {
          ...sharedMetadata,
          ...(isNonNanNumber(metadataObj?.expireTimestamp) && metadataObj.expireTimestamp > 0
            && { expire_time: toAppleTime(apiVersion, metadataObj.expireTimestamp) }),
          ...(typeof metadataObj?.providerLogo?.forV1 === 'string' && metadataObj.providerLogo.forV1.length > 0
            && { provider_logo: metadataObj.providerLogo.forV1 }),
          ...(typeof metadataObj?.providerName === 'string' && metadataObj.providerName.length > 0
            && { provider_name: metadataObj.providerName }),
          ...(isNonNanNumber(metadataObj?.readTimestamp) && metadataObj.readTimestamp > 0
            && { read_time: toAppleTime(apiVersion, metadataObj.readTimestamp) }),
          ...(isNonNanNumber(metadataObj?.reportedTimestamp) && metadataObj.reportedTimestamp > 0
            && { reported_time: toAppleTime(apiVersion, metadataObj.reportedTimestamp) }),
          ...((metadataObj?.dataSource === 0 || metadataObj?.dataSource === 1)
            && { data_source: metadataObj.dataSource }),
        };
      case 2:
        // no data source for APIv2
        return {
          ...sharedMetadata,
          ...(isNonNanNumber(metadataObj?.expireTimestamp) && metadataObj.expireTimestamp > 0
            && { expireTime: toAppleTime(apiVersion, metadataObj.expireTimestamp) }),
          ...(typeof metadataObj?.providerLogo?.forV2 === 'string' && metadataObj.providerLogo.forV2.length > 0
            && { providerLogo: metadataObj.providerLogo.forV2 }),
          ...(typeof metadataObj?.providerName === 'string' && metadataObj.providerName.length > 0
            && { providerName: metadataObj.providerName }),
          ...(isNonNanNumber(metadataObj?.readTimestamp) && metadataObj.readTimestamp > 0
            && { readTime: toAppleTime(apiVersion, metadataObj.readTimestamp) }),
          ...(isNonNanNumber(metadataObj?.reportedTimestamp) && metadataObj.reportedTimestamp > 0
            && { reportedTime: toAppleTime(apiVersion, metadataObj.reportedTimestamp) }),
          ...(typeof metadataObj?.unit === 'string' && metadataObj.unit.length > 0
            && { units: metadataObj.unit }),
        };
      case 3:
        return {
          ...sharedMetadata,
          ...(typeof metadataObj?.url === 'string' && metadataObj.url.length > 0
            && { attributionURL: metadataObj.url }),
          ...(isNonNanNumber(metadataObj?.expireTimestamp) && metadataObj.expireTimestamp > 0
            && { expireTime: toAppleTime(apiVersion, metadataObj.expireTimestamp) }),
          ...(typeof metadataObj?.providerLogo?.forV2 === 'string' && metadataObj.providerLogo.forV2.length > 0
            && { providerLogo: metadataObj.providerLogo.forV2 }),
          ...(typeof metadataObj?.providerName === 'string' && metadataObj.providerName.length > 0
            && { providerName: metadataObj.providerName }),
          ...(isNonNanNumber(metadataObj?.readTimestamp) && metadataObj.readTimestamp > 0
            && { readTime: toAppleTime(apiVersion, metadataObj.readTimestamp) }),
          ...(isNonNanNumber(metadataObj?.reportedTimestamp) && metadataObj.reportedTimestamp > 0
            && { reportedTime: toAppleTime(apiVersion, metadataObj.reportedTimestamp) }),
          ...(typeof metadataObj?.unit === 'string' && metadataObj.unit.length > 0
            && { units: metadataObj.unit }),
        };
      default:
        return {};
    }
  };

  const metadata = getMetadata(appleApiVersion, metadataObject);
  return Object.keys(sharedMetadata).length > 0 || Object.keys(metadata)
    ? {
      ...(isNonNanNumber(appleApiVersion) && appleApiVersion > 0
        && { version: appleApiVersion > 2 ? appleApiVersion - 2 : appleApiVersion }),
      ...sharedMetadata,
      ...metadata,
    } : {};
};

/**
 * Output Air Quality Data
 * @author VirgilClyne
 * @param {supportedIosApi} appleApiVersion - Apple Weather API Version
 * @param {airQualityObject} aqiObject - Object of the AQI info
 * @return {Object}
 */
const toAirQuality = (appleApiVersion, aqiObject) => {
  const getUnits = (apiVersion) => {
    const sharedUnit = ['ppb'];
    switch (apiVersion) {
      case 1:
        return sharedUnit.concat(['µg/m3']);
      case 2:
      case 3:
        return sharedUnit.concat(['microgramsPerM3']);
      default:
        return [];
    }
  };

  const iosPollutantNames = [
    'NO2', 'NO', 'NOX', 'PM2.5', 'SO2', 'OZONE', 'PM10', 'CO',
  ];
  const comparisonValues = ['better', 'same', 'worse', 'unknown'];
  const sourceTypes = ['station', 'modeled'];

  const sharedAirQuality = {
    ...(typeof aqiObject?.isSignificant === 'boolean' && { isSignificant: aqiObject.isSignificant }),
    // TODO
    ...(typeof aqiObject?.url === 'string' && aqiObject.url.length > 0 && { learnMoreURL: aqiObject.url }),
    ...(Object.keys(aqiObject?.pollutants ?? {}).length > 0 && {
      pollutants: Object.fromEntries(Object.entries(aqiObject.pollutants).filter(
        ([, info]) => !getUnits(appleApiVersion).includes(info?.unit),
      )),
    }),
    ...(iosPollutantNames.includes(aqiObject?.primary) && { primaryPollutant: aqiObject.primary }),
    // TODO: source was removed after APIv3
    ...(typeof aqiObject?.sourceName === 'string' && aqiObject.sourceName.length > 0
      && { source: aqiObject.sourceName }),
  };

  const getAirQuality = (apiVersion, aqiObj) => {
    switch (apiVersion) {
      case 1:
        return {
          ...sharedAirQuality,
          ...(isNonNanNumber(aqiObj?.categoryIndex) && aqiObj.categoryIndex > 0
            && { airQualityCategoryIndex: aqiObj.categoryIndex }),
          ...(isNonNanNumber(aqiObj?.aqi) && aqiObj.aqi >= 0
            && { airQualityIndex: aqiObj.aqi }),
          // TODO: find out all scale
          ...(typeof aqiObj?.scale === 'string' && aqiObj.scale.length > 0
            && { airQualityScale: aqiObj.scale }),
        };
      case 2:
      case 3:
        return {
          ...sharedAirQuality,
          ...(isNonNanNumber(aqiObj?.categoryIndex) && aqiObj.categoryIndex > 0
            && { categoryIndex: aqiObj.categoryIndex }),
          ...(isNonNanNumber(aqiObj?.aqi) && aqiObj.aqi >= 0
            && { index: aqiObj.aqi }),
          ...(comparisonValues.includes(aqiObj?.previousDayComparison)
            && { previousDayComparison: aqiObj.previousDayComparison }),
          // TODO: find out all scales
          ...(typeof aqiObj?.scale === 'string' && aqiObj.scale.length > 0
            && { scale: aqiObj.scale }),
          ...(sourceTypes.includes(aqiObj?.sourceType) && { sourceType: aqiObj.sourceType }),
        };
      default:
        return {};
    }
  };

  const airQuality = getAirQuality(appleApiVersion, aqiObject);
  return Object.keys(sharedAirQuality).length > 0 || Object.keys(airQuality).length > 0
    ? { name: 'AirQuality', ...sharedAirQuality, ...airQuality } : {};
};

// TODO: type of metadata, debugOptions and returned data
/**
 * Output object for `NextHourForecast` of Apple Weather
 * @author WordlessEcho <wordless@echo.moe>
 * @author VirgilClyne
 * @param {supportedIosApi} appleApiVersion - Apple Weather API Version
 * @param {nextHourObject} nextHourObject - Object of the precipitation info
 * @param {?Object} debugOptions - nullable, debug settings configs in Box.js
 * @return {Object} a `Promise` that returned edited Apple data
 */
const toNextHour = (appleApiVersion, nextHourObject, debugOptions) => {
  const isMinuteArray = (minutes) => (
    Array.isArray(minutes) && !minutes.some((minute) => (
      typeof minute?.weatherStatus !== 'string' || minute.weatherStatus.length <= 0
    ))
  );

  if (!isMinuteArray(nextHourObject?.minutes)) {
    return {};
  }

  /**
   * Check type of weather status of minute
   * @param {minute} minuteData - data of minute
   * @return {'precipitation'|'clear'|string} - weatherStatus if valid,
   * or `precipitation`/`clear` based on precipitation
   */
  const checkWeatherStatus = (minuteData) => {
    if (typeof minuteData?.weatherStatus !== 'string' || minuteData.weatherStatus.length <= 0) {
      if (minuteData.precipitation > 0) {
        return 'precipitation';
      }

      return 'clear';
    }

    return minuteData.weatherStatus;
  };

  const toValidMinutes = (minutes) => {
    if (!isMinuteArray(minutes)) {
      return [];
    }

    return minutes.map((minute) => {
      const pip = isNonNanNumber(minute?.precipitationIntensityPerceived)
      && minute.precipitationIntensityPerceived >= 0 ? minute.precipitationIntensityPerceived : 0;
      const fallbackChance = pip <= 0 ? 0 : 100;
      const chance = isNonNanNumber(minute?.chance) && minute.chance >= 0
        ? minute.chance : fallbackChance;

      const validLongDescription = typeof minute?.longDescription === 'string'
      && minute.longDescription.length > 0 ? minute.longDescription : $.name;
      const shortDescriptionWithParameters = typeof minute?.shortDescription === 'string'
      && minute.shortDescription.length > 0 && typeof minute.parameters === 'object'
        ? {
          shortDescription: minute.shortDescription,
          parameters: minute.parameters,
        }
        : {
          shortDescription: validLongDescription,
          parameters: {},
        };

      return {
        ...minute,
        precipitation: isNonNanNumber(minute?.precipitation) && minute.precipitation >= 0
          ? minute.precipitation : 0,
        precipitationIntensityPerceived: pip,
        chance,
        longDescription: validLongDescription,
        ...shortDescriptionWithParameters,
      };
    });
  };

  /**
   * Output array of condition for `condition` in `NextHourForecast`
   * @author WordlessEcho <wordless@echo.moe>
   * @param {supportedIosApi} apiVersion - Apple Weather API Version
   * @param {minute[]} minutesData - Array of minute precipitation data
   * @param {number} startTimestamp - UNIX timestamp when condition start
   * @return { nextHourConditionV1[] | nextHourConditionV2[] } - For `forecastNextHour.condition`
   */
  const toConditions = (apiVersion, minutesData, startTimestamp) => {
    const supportedApis = [1, 2, 3];
    if (!supportedApis.includes(apiVersion) || !isMinuteArray(minutesData)) {
      return [];
    }

    /**
     * Merge possibility, weather status and time status for `forecastNextHour.condition.token`
     * @author WordlessEcho <wordless@echo.moe>
     * @param {minute[]} minuteArray - add `possible-` prefix to token
     * @param {number} lastBound
     * @param {number} bound
     * @return {string} token for Apple Weather
     */
    const toToken = (minuteArray, lastBound, bound) => {
      if (
        !isMinuteArray(minuteArray) || !isNonNanNumber(bound) || bound < 0
        || !isNonNanNumber(lastBound) || lastBound < 0
      ) {
        return 'precipitation';
      }

      const validMinuteArray = toValidMinutes(minuteArray);
      const firstStatus = checkWeatherStatus(validMinuteArray[bound]);
      const secondStatusIndex = validMinuteArray.slice(bound).findIndex((minute) => (
        checkWeatherStatus(minute) !== firstStatus));
      const secondStatus = secondStatusIndex === -1 ? null
        : checkWeatherStatus(validMinuteArray[secondStatusIndex]);

      const maxChance = Math.max(...validMinuteArray
        .slice(lastBound, bound).map((minute) => minute.chance));
      // https://developer.apple.com/documentation/weatherkitrestapi/certainty
      const needPossible = maxChance < 50;

      if (firstStatus === 'clear') {
        if (secondStatusIndex === -1) {
          return firstStatus;
        }

        const nextClearIndex = validMinuteArray.slice(secondStatusIndex)
          .findIndex((minute) => checkWeatherStatus(minute) === 'clear');
        if (nextClearIndex === -1) {
          return `${needPossible ? 'possible-' : ''}${secondStatus}.start`;
        }
        return `${needPossible ? 'possible-' : ''}${secondStatus}.start-stop`;
      }

      // if current weather is not clear
      if (secondStatus === 'clear') {
        const nextNotClearIndex = validMinuteArray.slice(secondStatusIndex)
          .findIndex((minute) => checkWeatherStatus(minute) !== 'clear');
        if (nextNotClearIndex !== -1) {
          return `${needPossible ? 'possible-' : ''}${firstStatus}.stop-start`;
        }

        return `${needPossible ? 'possible-' : ''}${firstStatus}.stop`;
      }

      return `${needPossible ? 'possible-' : ''}${firstStatus}.constant`;
    };

    const validMinutesData = toValidMinutes(minutesData);
    /** @type number[] */
    const bounds = validMinutesData.slice(0, 59).flatMap((current, index, array) => {
      const previous = array[index - 1];

      if (
        index === 0
        || (index + 1 !== array.length && current.weatherStatus === previous.weatherStatus)
      ) {
        return [];
      }

      return [index];
    });

    const timestamp = isNonNanNumber(startTimestamp) && startTimestamp > 0
      ? startTimestamp : (+(new Date()));

    return bounds.map((bound, index, array) => {
      const minute = validMinutesData[bound];
      const lastBound = index === 0 ? 0 : array[index - 1];

      const token = toToken(validMinutesData.slice(0, 60), lastBound, bound);
      const needEndTime = !(
        index + 1 === array.length
        && checkWeatherStatus(minute) === checkWeatherStatus(validMinutesData[bound + 1])
      );

      const longDescription = typeof minute.longDescription === 'string'
      && minute.longDescription.length > 0 ? minute.longDescription : $.name;
      const shortDescription = typeof minute.shortDescription === 'string'
      && minute.shortDescription.length > 0 ? minute.shortDescription : $.name;

      const sharedCondition = {
        token,
      };

      switch (apiVersion) {
        case 1:
          return {
            ...(needEndTime && {
              validUntil: toAppleTime(apiVersion, timestamp + bound * 60 * 1000),
            }),
            ...sharedCondition,
            longTemplate: longDescription,
            shortTemplate: shortDescription,
            parameters: typeof minute.parameters === 'object'
              ? Object.fromEntries(Object.entries(minute.parameters).map(([key, value]) => [
                key, toAppleTime(apiVersion, timestamp + value * 60 * 1000),
              ])) : {},
          };
        case 2:
          return {
            startTime: toAppleTime(apiVersion, timestamp + lastBound * 60 * 1000),
            ...(needEndTime && {
              endTime: toAppleTime(apiVersion, timestamp + bound * 60 * 1000),
            }),
            ...sharedCondition,
            longTemplate: longDescription,
            shortTemplate: shortDescription,
            parameters: typeof minute.parameters === 'object'
              ? Object.fromEntries(Object.entries(minute.parameters).map(([key, value]) => [
                key, toAppleTime(apiVersion, timestamp + value * 60 * 1000),
              ])) : {},
          };
        case 3:
          return {
            startTime: toAppleTime(apiVersion, timestamp + lastBound * 60 * 1000),
            ...(needEndTime && {
              endTime: toAppleTime(apiVersion, timestamp + bound * 60 * 1000),
            }),
            ...sharedCondition,
            parameters: {},
          };
        default:
          return {};
      }
    });
  };

  /**
   * Output array of summary for `summary` in `NextHourForecast`
   * @author WordlessEcho <wordless@echo.moe>
   * @param {supportedIosApi} apiVersions - Apple Weather API Version
   * @param {minute[]} minutesData - array of minute precipitation data
   * @param {number} startTimestamp - UNIX timestamp when minutes start
   * @return {nextHourSummaryV1[] | nextHourSummaryV2[]} - value for `forecastNextHour.summary[]`
   */
  const toSummaries = (apiVersions, minutesData, startTimestamp) => {
    const supportedApis = [1, 2, 3];
    if (!supportedApis.includes(apiVersions) || !isMinuteArray(minutesData)) {
      return [];
    }

    const validMinutesData = toValidMinutes(minutesData);
    /** @type number[] */
    const bounds = validMinutesData.slice(0, 59).flatMap((current, index, array) => {
      const previous = array[index - 1];

      if (
        index === 0 || (
          index + 1 !== array.length && weatherStatusToType(checkWeatherStatus(current))
          === weatherStatusToType(checkWeatherStatus(previous))
        )
      ) {
        return [];
      }

      return [index];
    });

    const timestamp = isNonNanNumber(startTimestamp) && startTimestamp > 0
      ? startTimestamp : (+(new Date()));

    return bounds.map((bound, index, array) => {
      const lastBound = index === 0 ? 0 : array[index - 1];
      const minutesInSummary = validMinutesData.slice(lastBound, bound + 1);

      const needEndTime = !(
        index + 1 === array.length && checkWeatherStatus(validMinutesData[bound])
        === checkWeatherStatus(validMinutesData[bound + 1])
      );
      const condition = weatherStatusToType(checkWeatherStatus(validMinutesData[lastBound]));

      const isNotClear = condition !== 'clear';
      const maxChance = Math.max(...minutesInSummary.filter(({ chance }) => (
        typeof chance === 'number' && !Number.isNaN(chance) && chance >= 0
      )).map((minute) => minute.chance));
      const precipitations = minutesInSummary.filter(({ precipitation }) => (
        typeof precipitation === 'number' && !Number.isNaN(precipitation) && precipitation >= 0
      )).map((minute) => minute.precipitation);

      switch (apiVersions) {
        case 1:
          return {
            ...(needEndTime && {
              validUntil: toAppleTime(apiVersions, timestamp + bound * 60 * 1000),
            }),
            condition,
            ...(isNotClear ? {
              probability: maxChance,
              maxIntensity: Math.max(...precipitations),
              minIntensity: Math.min(...precipitations),
            } : null),
          };
        // to make ESLint and JSDoc happy
        case 2:
          return {
            startTime: toAppleTime(apiVersions, timestamp + lastBound * 60 * 1000),
            ...(needEndTime && {
              endTime: toAppleTime(apiVersions, timestamp + bound * 60 * 1000),
            }),
            condition,
            ...(isNotClear && {
              precipChance: maxChance,
              precipIntensity: Math.max(...precipitations),
            }),
          };
        case 3:
          return {
            startTime: toAppleTime(apiVersions, timestamp + lastBound * 60 * 1000),
            ...(needEndTime && {
              endTime: toAppleTime(apiVersions, timestamp + bound * 60 * 1000),
            }),
            condition,
            ...(isNotClear && {
              precipitationChance: maxChance,
              precipitationIntensity: Math.max(...precipitations),
            }),
          };
        default:
          return {};
      }
    });
  };

  // TODO
  /**
   * Output array of minutes for `minutes` in `NextHourForecast`
   * @author WordlessEcho <wordless@echo.moe>
   * @param {supportedIosApi} apiVersions - Apple Weather API Version
   * @param {minute[]} minutesData - array of minute precipitation data
   * @param {number} startTimestamp - UNIX timestamp when minutes start
   * @return {nextHourMinuteV1[] | nextHourMinuteV2[]} - For `forecastNextHour.minutes`
   */
  const toMinutes = (apiVersions, minutesData, startTimestamp) => {
    const supportedApis = [1, 2, 3];
    if (!supportedApis.includes(apiVersions) || !isMinuteArray(minutesData)) {
      return [];
    }

    const validMinutesData = toValidMinutes(minutesData);
    const timestamp = isNonNanNumber(startTimestamp) && startTimestamp > 0
      ? startTimestamp : (+(new Date()));

    return validMinutesData.map(
      ({ precipitation, chance, precipitationIntensityPerceived }, index) => {
        const v1AndV2Minute = {
          precipIntensity: isNonNanNumber(precipitation) && precipitation > 0 ? precipitation : 0,
          precipChance: isNonNanNumber(chance) && chance > 0 ? chance : 0,
        };

        switch (apiVersions) {
          case 1:
            return {
              startAt: toAppleTime(apiVersions, timestamp + index * 60 * 1000),
              ...v1AndV2Minute,
              perceivedIntensity: precipitationIntensityPerceived,
            };
          // to make JSDoc or ESLint happy
          case 2:
            return {
              startTime: toAppleTime(apiVersions, timestamp + index * 60 * 1000),
              ...v1AndV2Minute,
              precipIntensityPerceived: precipitationIntensityPerceived,
            };
          case 3:
            return {
              startTime: toAppleTime(apiVersions, timestamp + index * 60 * 1000),
              precipitationChance: isNonNanNumber(chance) && chance > 0 ? chance : 0,
              precipitationIntensity: isNonNanNumber(precipitation) && precipitation > 0
                ? precipitation : 0,
              precipitationIntensityPerceived,
            };
          default:
            return {};
        }
      },
    );
  };

  const haveReadTime = isNonNanNumber(nextHourObject?.readTimestamp)
    && nextHourObject.readTimestamp > 0;

  // use next minute with zero second and zero millisecond as startTime
  const startTimestamp = haveReadTime
    ? (new Date(nextHourObject.readTimestamp + 1000 * 60)).setSeconds(0, 0)
    : (new Date((+(new Date())) + 1000 * 60)).setSeconds(0, 0);

  const getNextHour = (apiVersion, condition, summary, minutes, timestamp) => {
    const sharedNextHour = {
      ...(Array.isArray(condition) && condition.length > 0 && { condition }),
      ...(Array.isArray(summary) && summary.length > 0 && { summary }),
      ...(Array.isArray(minutes) && minutes.length > 0 && { minutes }),
    };

    switch (apiVersion) {
      case 1:
      case 2:
        return {
          ...sharedNextHour,
          ...(isNonNanNumber(timestamp) && timestamp > 0
            && { startTime: toAppleTime(appleApiVersion, timestamp) }),
        };
      case 3:
        return {
          ...sharedNextHour,
          ...(isNonNanNumber(timestamp) && timestamp > 0
            && { forecastStart: toAppleTime(appleApiVersion, timestamp) }),
          ...(Array.isArray(minutes) && minutes.length > 0 && {
            forecastEnd: toAppleTime(appleApiVersion, timestamp + 1000 * 60 * minutes.length),
          }),
        };
      default:
        return {};
    }
  };

  const nextHour = getNextHour(
    appleApiVersion,
    toConditions(appleApiVersion, nextHourObject.minutes, startTimestamp),
    toSummaries(appleApiVersion, nextHourObject.minutes, startTimestamp),
    toMinutes(appleApiVersion, nextHourObject.minutes, startTimestamp),
    haveReadTime ? startTimestamp : null,
  );

  return Object.keys(nextHour).length > 0 ? { name: 'NextHourForecast', ...nextHour } : {};
};

const getKeywords = (apiVersion) => {
  switch (apiVersion) {
    case 1:
      return {
        METADATA: 'metadata',
        AIR_QUALITY: 'air_quality',
        NEXT_HOUR: 'next_hour',
        PROVIDER_NAME: 'provider_name',
        REPORTED_TIME: 'reported_time',
        AQI_INDEX: 'airQualityIndex',
        AQI_SCALE: 'airQualityScale',
        POLLUTANTS: 'pollutants',
        UNIT: 'unit',
        AMOUNT: 'amount',
        SOURCE: 'source',
        AQI_COMPARISON: '',
      };
    case 2:
    case 3:
      return {
        METADATA: 'metadata',
        AIR_QUALITY: 'airQuality',
        NEXT_HOUR: 'forecastNextHour',
        PROVIDER_NAME: 'providerName',
        REPORTED_TIME: 'reportedTime',
        AQI_INDEX: 'index',
        AQI_SCALE: 'scale',
        POLLUTANTS: 'pollutants',
        UNIT: 'unit',
        AMOUNT: 'amount',
        SOURCE: 'source',
        AQI_COMPARISON: 'previousDayComparison',
      };
    default:
      return {};
  }
};

const appleTimeToTimestamp = (apiVersion, time, fallbackTimestamp) => {
  const fallback = isNonNanNumber(fallbackTimestamp) && fallbackTimestamp > 0
    ? fallbackTimestamp : (+(new Date()));

  switch (apiVersion) {
    case 1:
      return isNonNanNumber(time) && time > 0 ? time * 1000 : fallback;
    case 2: {
      const timestamp = Date.parse(time);
      return isNonNanNumber(timestamp) && timestamp > 0 ? timestamp : fallback;
    }
    default:
      return fallback;
  }
};

const toResponseBody = (envs, request, response) => {
  const dataFromApple = parseJsonWithDefault(response?.body, {});
  if (typeof request?.url !== 'string' || Object.keys(dataFromApple).length <= 0) {
    return Promise.resolve(response?.body);
  }

  const settings = toSettings(envs);
  const caches = toCaches(envs);

  const supportedAppleApis = [1, 2, 3];
  const apiWithAqiComparison = ['api.caiyunapp.com'];
  const toAqiStandard = { WAQI_InstantCast: WAQI_INSTANT_CAST };
  const supportedApis = ['www.weatherol.cn', 'api.caiyunapp.com', 'api.waqi.info'];

  const url = (new URLs()).parse(request.url);
  const parameters = getParams(url.path);
  const appleApiVersionString = parameters?.ver;
  const appleApiVersion = typeof appleApiVersionString === 'string' && appleApiVersionString.length > 0
    ? parseInt(appleApiVersionString.slice(1), 10) : -1;

  const getRequireData = (apiVersion, parsedUrl) => {
    switch (apiVersion) {
      case 1: {
        const requirement = parsedUrl.params?.include;
        return Array.isArray(requirement) ? requirement : [];
      }
      case 2:
      case 3: {
        const requirement = parsedUrl.params?.dataSets;
        return Array.isArray(requirement) ? requirement : [];
      }
      default:
        return [];
    }
  };

  // TODO
  const getTargetScale = (projectSettings, appleScale) => {
    if (projectSettings.aqi.local.switch) {
      return toAqiStandard[projectSettings.aqi.local.standard].APPLE_SCALE;
    }

    if (!projectSettings.aqi.switch) {
      return appleScale;
    }

    switch (projectSettings.aqi.source) {
      case 'www.weatherol.cn':
        return HJ_633.APPLE_SCALE;
      case 'api.caiyunapp.com':
        return projectSettings.apis.colorfulClouds.forceCnForAqi
          ? HJ_633.APPLE_SCALE : EPA_454.APPLE_SCALE;
      case 'api.waqi.info':
        return WAQI_INSTANT_CAST.APPLE_SCALE;
      default:
        return '';
    }
  };

  const toMissions = (aqi, forCompareAqi, nextHour) => supportedApis
    .map((api) => ({
      api,
      missions: [
        ...(aqi === api ? ['aqi'] : []),
        ...(forCompareAqi === api ? ['forCompareAqi'] : []),
        ...(nextHour === api ? ['nextHour'] : []),
      ],
    }));

  const missionsToCcPath = (missions) => {
    if (!Array.isArray(missions) || missions.length <= 0 || missions.length > 1) {
      return 'weather';
    }

    switch (missions[0]) {
      case 'aqi':
        return 'realtime';
      case 'nextHour':
        return 'minutely';
      case 'aqiForComparison':
      default:
        return 'weather';
    }
  };

  const getColorfulCloudsName = (language) => {
    // No official name for Japanese
    if (typeof language === 'string') {
      if (/zh-(Hans|CN)/.test(language)) {
        return '彩云天气';
      }
      if (/zh-(Hant|HK|TW)/.test(language)) {
        return '彩雲天氣';
      }
    }

    return 'ColorfulClouds';
  };

  const { METADATA } = getKeywords(appleApiVersion);

  const getAirQuality = (apiVersion, promiseData, appleLanguage) => {
    if (!Array.isArray(promiseData?.missions) || !promiseData.missions.includes('aqi')) {
      return {};
    }

    switch (promiseData?.api) {
      case 'www.weatherol.cn':
        return {
          [METADATA]: toMetadata(apiVersion, colorfulCloudsToAqiMetadata(
            { forV1: 'https://www.weatherol.cn/images/logo.png' },
            '气象在线',
            'https://www.weatherol.cn/',
            promiseData?.returnedData,
          )),
          ...toAirQuality(apiVersion, colorfulCloudsToAqi(
            promiseData?.returnedData,
            'https://www.weatherol.cn/',
            '气象在线',
            true,
            true,
          )),
        };
      case 'api.caiyunapp.com':
        return {
          [METADATA]: toMetadata(apiVersion, colorfulCloudsToAqiMetadata(
            {
              forV1: 'https://docs.caiyunapp.com/img/favicon.ico',
              forV2: 'https://caiyunapp.com/imgs/logo/logo-website-white.png',
            },
            getColorfulCloudsName(appleLanguage),
            'https://caiyunapp.com/weather/',
            promiseData?.returnedData,
          )),
          ...toAirQuality(apiVersion, colorfulCloudsToAqi(
            promiseData?.returnedData,
            'https://caiyunapp.com/weather/',
            getColorfulCloudsName(appleLanguage),
            settings.apis.colorfulClouds.forceCnForAqi,
            settings.apis.colorfulClouds.forceCnForComparison,
          )),
        };
      case 'api.waqi.info':
        if (Array.isArray(promiseData?.types)) {
          if (promiseData.types.includes((type) => type === 'locationFeed')) {
            return {
              [METADATA]: toMetadata(apiVersion, waqiToAqiMetadata(promiseData?.returnedData)),
              ...toAirQuality(apiVersion, waqiToAqi(promiseData?.returnedData)),
            };
          }

          if (promiseData.types.includes((type) => type === 'mapq')) {
            return {
              [METADATA]: toMetadata(apiVersion, waqiToAqiMetadata(promiseData?.returnedData)),
              ...toAirQuality(apiVersion, waqiToAqi(waqiNearestToFeed('mapq', promiseData?.returnedData))),
            };
          }
        }

        return {};
      default:
        return {};
    }
  };

  const getAqiComparison = (promiseData) => {
    if (!Array.isArray(promiseData?.missions) || !promiseData.missions.includes('forCompareAqi')) {
      return {};
    }

    switch (promiseData?.api) {
      case 'api.caiyunapp.com':
        return colorfulCloudsToAqiComparison(
          promiseData?.returnedData,
          settings.apis.colorfulClouds.forceCnForComparison,
        );
      default:
        return {};
    }
  };

  const getNextHour = (apiVersion, promiseData, appleLanguage) => {
    if (!Array.isArray(promiseData?.missions) || !promiseData.missions.includes('nextHour')) {
      return {};
    }

    switch (promiseData?.api) {
      case 'www.weatherol.cn':
        return {
          [METADATA]: toMetadata(apiVersion, colorfulCloudsToNextHourMetadata(
            '气象在线',
            'https://www.weatherol.cn/',
            promiseData?.returnedData,
          )),
          ...toNextHour(apiVersion, colorfulCloudsToNextHour(
            '气象在线',
            promiseData?.returnedData,
          ), null),
        };
      case 'api.caiyunapp.com':
        return {
          [METADATA]: toMetadata(apiVersion, colorfulCloudsToNextHourMetadata(
            getColorfulCloudsName(appleLanguage),
            'https://caiyunapp.com/weather/',
            promiseData?.returnedData,
          )),
          ...toNextHour(apiVersion, colorfulCloudsToNextHour(
            getColorfulCloudsName(appleLanguage),
            promiseData?.returnedData,
          ), null),
        };
      default:
        return {};
    }
  };

  const latitude = parseFloat(parameters?.lat);
  const longitude = parseFloat(parameters?.lng);
  const languageWithRegion = parameters?.language;

  if (
    !supportedAppleApis.includes(appleApiVersion) || !isLatitude(latitude)
    || !isLongitude(longitude) || typeof languageWithRegion !== 'string'
    || languageWithRegion.length <= 0
  ) {
    return Promise.resolve(dataFromApple);
  }

  const {
    AIR_QUALITY, NEXT_HOUR, PROVIDER_NAME, REPORTED_TIME, AQI_INDEX,
    AQI_SCALE, POLLUTANTS, UNIT, AMOUNT, SOURCE, AQI_COMPARISON,
  } = getKeywords(appleApiVersion);

  const location = { latitude, longitude };
  const requireData = getRequireData(appleApiVersion, url);

  const qweatherNames = ['和风天气', 'QWeather'];
  const airQuality = {
    ...dataFromApple?.[AIR_QUALITY],
    ...(qweatherNames.includes(dataFromApple?.[AIR_QUALITY]?.[METADATA]?.[PROVIDER_NAME])
      && {
        [PROVIDER_NAME]: appendQweatherSourceToProviderName(
          dataFromApple[AIR_QUALITY][METADATA][PROVIDER_NAME],
          dataFromApple[AIR_QUALITY][METADATA]?.[SOURCE],
        ),
        ...(typeof dataFromApple[AIR_QUALITY]?.[POLLUTANTS] === 'object' && {
          [POLLUTANTS]: Object.fromEntries(Object.entries(dataFromApple[AIR_QUALITY][POLLUTANTS])
            .map(([key, value]) => {
              if (key === 'CO') {
                const fixedAmount = fixQweatherCo(value?.[UNIT], value?.[AMOUNT]);
                return [key, {
                  ...value,
                  ...(fixedAmount >= 0 && { [AMOUNT]: fixedAmount }),
                }];
              }
              return [key, value];
            })),
        }),
      }),
  };
  const nextHour = dataFromApple?.[NEXT_HOUR];

  const aqiProvider = airQuality?.[METADATA]?.[PROVIDER_NAME];
  const aqiScale = airQuality?.[AQI_SCALE];
  const needAqi = requireData.includes(AIR_QUALITY) && settings.aqi.switch
    && (typeof aqiScale !== 'string' || settings.aqi.targets.includes(
      aqiScale.slice(0, aqiScale.lastIndexOf('.')),
    ));

  const needCompareAqi = requireData.includes(AIR_QUALITY) && settings.aqi.comparison.switch
    && AQI_COMPARISON.length > 0 && ((needAqi
      && !apiWithAqiComparison.includes(settings.aqi.source))
      || airQuality?.[AQI_COMPARISON] === 'unknown');
  const yesterdayHourTimestamp = (new Date()).setMinutes(0, 0, 0) - 1000 * 60 * 60;
  const yesterdayReportTimestamp = needAqi ? yesterdayHourTimestamp : appleTimeToTimestamp(
    appleApiVersion,
    airQuality?.[METADATA]?.[REPORTED_TIME],
    yesterdayHourTimestamp,
  );
  const cachedAqi = needCompareAqi ? getCachedAqi(
    caches.aqis,
    yesterdayReportTimestamp,
    location,
    qweatherNames.includes(aqiProvider) ? airQuality?.source : null,
    getTargetScale(settings, aqiScale),
  ) : { aqi: -1 };

  const nextHourProvider = nextHour?.[METADATA]?.[PROVIDER_NAME];
  const needNextHour = requireData.includes(NEXT_HOUR) && settings.nextHour.switch && (
    typeof nextHourProvider !== 'string' || nextHourProvider.length <= 0
  );

  const missionList = toMissions(
    needAqi ? settings.aqi.source : null,
    needCompareAqi ? settings.aqi.comparison.source : null,
    needNextHour ? settings.nextHour.source : null,
  );

  const promises = Array.isArray(missionList) ? missionList
    .filter((missionObject) => (
      supportedApis.includes(missionObject?.api) && Array.isArray(missionObject?.missions)
    ))
    .flatMap(({ api, missions }) => {
      if (missions.length <= 0) {
        return [];
      }

      switch (api) {
        case 'www.weatherol.cn':
          return missions.flatMap((mission) => {
            switch (mission) {
              case 'aqi':
                return [
                  weatherOl('realtime', location, settings.apis.weatherOl.httpHeaders)
                    .then((returnedData) => ({
                      missions: [mission],
                      api,
                      types: ['realtime'],
                      returnedData,
                    })),
                ];
              case 'nextHour':
                return [
                  weatherOl('forecast', location, settings.apis.weatherOl.httpHeaders)
                    .then((returnedData) => ({
                      missions: [mission],
                      api,
                      types: ['forecast'],
                      returnedData,
                    })),
                ];
              default:
                return [];
            }
          });
        case 'api.caiyunapp.com': {
          const path = missionsToCcPath(missions);
          const needHistory = missions.includes('aqiComparison');

          return [colorfulClouds(
            settings.apis.colorfulClouds.token,
            location,
            languageWithRegion,
            settings.apis.colorfulClouds.httpHeaders,
            path,
            {
              unit: 'metric:v2',
              ...(needHistory && { begin: yesterdayHourTimestamp }),
            },
          ).then((returnedData) => ({
            missions,
            api,
            types: [path, ...(needHistory ? ['history'] : [])],
            returnedData,
          }))];
        }
        case 'api.waqi.info': {
          if (!missions.includes('aqi')) {
            return [];
          }

          const { token } = settings.apis.waqi;
          if (typeof token === 'string' && token.length > 0) {
            return [
              waqiV2(location, null, token, settings.apis.waqi.httpHeaders)
                .then((returnedData) => ({
                  missions: ['aqi'],
                  api,
                  types: ['locationFeed'],
                  returnedData,
                })),
            ];
          }

          return [
            waqiNearest(location, 'mapq', settings.apis.waqi.httpHeaders)
              .then((returnedData) => ({
                missions: ['aqi'],
                api,
                types: ['mapq'],
                returnedData,
              })),
          ];
        }
        default:
          return [];
      }
    }) : [];

  return Promise.all(promises).then((dataArray) => {
    if (!Array.isArray(dataArray)) {
      return dataFromApple;
    }

    const dataForAqi = dataArray.find((data) => (
      Array.isArray(data?.missions) && data.missions.includes('aqi')
    ));
    const dataForAqiComparison = dataArray.find((data) => (
      Array.isArray(data?.missions) && data.missions.includes('forCompareAqi')
    ));
    const dataForNextHour = dataArray.find((data) => (
      Array.isArray(data?.missions) && data.missions.includes('nextHour')
    ));

    const modifiedAirQuality = getAirQuality(appleApiVersion, dataForAqi, languageWithRegion);
    const modifiedComapreAqi = cachedAqi?.aqi >= 0 ? compareAqi(
      cachedAqi.aqi,
      modifiedAirQuality?.[AQI_INDEX],
    ) : getAqiComparison(dataForAqiComparison);
    const mergedAirQuality = {
      ...airQuality,
      ...modifiedAirQuality,
      metadata: { ...airQuality?.[METADATA], ...modifiedAirQuality?.[METADATA] },
      ...(needCompareAqi && { [AQI_COMPARISON]: modifiedComapreAqi }),
    };
    const modifiedNextHour = getNextHour(appleApiVersion, dataForNextHour, languageWithRegion);

    return {
      ...dataFromApple,
      [AIR_QUALITY]: {
        ...mergedAirQuality,
        ...(settings.aqi.local.switch && toAirQuality(appleApiVersion, appleToEpaAirQuality(
          toAqiStandard[settings.aqi.local.standard],
          mergedAirQuality?.[POLLUTANTS],
        ))),
      },
      [NEXT_HOUR]: {
        ...nextHour,
        ...modifiedNextHour,
        metadata: { ...nextHour?.[METADATA], ...modifiedNextHour?.[METADATA] },
      },
    };
  });
};

const envs = getENV('iRingo', 'Weather', database);
const settings = toSettings(envs);
const caches = toCaches(envs);

// eslint-disable-next-line functional/no-conditional-statement,no-undef
if (settings.switch && typeof $request?.url === 'string') {
  const supportedAppleApis = [1, 2, 3];

  // eslint-disable-next-line no-undef
  const url = (new URLs()).parse($request.url);
  const parameters = getParams(url.path);
  const appleApiVersionString = parameters?.ver;
  const appleApiVersion = typeof appleApiVersionString === 'string' && appleApiVersionString.length > 0
    ? parseInt(appleApiVersionString.slice(1), 10) : -1;

  // eslint-disable-next-line functional/no-conditional-statement
  if (!supportedAppleApis.includes(appleApiVersion)) {
    // eslint-disable-next-line functional/no-expression-statement
    $.log(`❗️ ${$.name}：不支持${appleApiVersionString}版本的Apple API，您可能需要更新模块`, '');
    // eslint-disable-next-line functional/no-expression-statement,no-undef
    $.done($response);
  // eslint-disable-next-line functional/no-conditional-statement
  } else {
    const {
      AIR_QUALITY, METADATA, REPORTED_TIME, PROVIDER_NAME, SOURCE, AQI_INDEX, AQI_SCALE,
    } = getKeywords(appleApiVersion);
    // eslint-disable-next-line functional/no-expression-statement
    $.log(`🚧 ${$.name}：模块已启用`, '');
    // eslint-disable-next-line no-undef,functional/no-expression-statement
    toResponseBody(envs, $request, $response).then((responseBody) => {
      const time = responseBody?.[AIR_QUALITY]?.[METADATA]?.[REPORTED_TIME];
      const nowHourTimestamp = (new Date()).setMinutes(0, 0, 0);
      const timestamp = appleTimeToTimestamp(appleApiVersion, time, nowHourTimestamp);

      const latitude = parseFloat(parameters?.lat);
      const longitude = parseFloat(parameters?.lng);
      const location = { latitude, longitude };

      const providerName = responseBody?.[AIR_QUALITY]?.[METADATA]?.[PROVIDER_NAME];
      const scale = responseBody?.[AIR_QUALITY]?.[AQI_SCALE];

      const qweatherNames = ['和风天气', 'QWeather'];
      // eslint-disable-next-line functional/no-conditional-statement
      if (isLocation(location) && typeof scale === 'string' && scale.length > 0) {
        // eslint-disable-next-line functional/no-expression-statement
        $.setjson(cacheAqi(
          caches,
          timestamp,
          location,
          qweatherNames.includes(providerName) ? responseBody?.[AIR_QUALITY]?.[SOURCE] : null,
          scale.slice(0, scale.indexOf('.')),
          responseBody?.[AIR_QUALITY]?.[AQI_INDEX],
        ), '@iRingo.Weather.Caches');
      }
      // eslint-disable-next-line functional/no-expression-statement,no-undef
      $.done({ ...$response, ...(typeof responseBody === 'object' && { body: JSON.stringify(responseBody) }) });
    });
  }
// eslint-disable-next-line functional/no-conditional-statement
} else {
  // eslint-disable-next-line functional/no-expression-statement,no-undef
  $.done($response);
}
