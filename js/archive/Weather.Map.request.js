/*
README:https://github.com/VirgilClyne/iRingo
*/

const $ = new Env("🌤 Weather Map v1.2.3-request");
const URL = new URLs();
const DataBase = {
	"Location":{
		"Settings":{"Switch":true,"PEP":{"GCC":"US"},"Services":{"Dispatcher":"AUTO","Directions":"AUTO","Traffic":"AUTO","Tiles":"AUTO"},"Geo_manifest":{"Dynamic":{"Config":{"Country_code":"CN"}}},"Config":{"Announcements":{"Environment:":"prod-cn"},"Defaults":{"LagunaBeach":true,"DrivingMultiWaypointRoutesEnabled":true,"GEOAddressCorrection":true,"LookupMaxParametersCount":true,"LocalitiesAndLandmarks":true,"PedestrianAR":true,"6694982d2b14e95815e44e970235e230":true,"OpticalHeading":true,"UseCLPedestrianMapMatchedLocations":true,"WiFiQualityNetworkDisabled":false,"WiFiQualityTileDisabled":false}}}
	},
	"Weather":{
		"Settings":{"Switch":true,"NextHour":{"Switch":true},"AQI":{"Switch":true,"Mode":"WAQI Public","Location":"Station","Auth":null,"Scale":"EPA_NowCast.2207"},"Map":{"AQI":false}},
		"Configs":{"Availability":{"v2":["currentWeather","forecastDaily","forecastHourly","history","weatherChange","forecastNextHour","severeWeather","airQuality"],"v3":["currentWeather","forecastDaily","forecastHourly","weatherChange","forecastNextHour","news","weatherAlerts","weatherAlertNotifications","airQuality"]},"Pollutants":{"co":"CO","no":"NO","no2":"NO2","so2":"SO2","o3":"OZONE","nox":"NOX","pm25":"PM2.5","pm10":"PM10","other":"OTHER"},"Status":{"clear":"clear","sleet":"sleet","drizzle":"rain","rain":"rain","heavy_rain":"rain","flurries":"snow","snow":"snow","heavy_snow":"snow"},"Precipitation":{"Level":{"INVALID":-1,"NO":0,"LIGHT":1,"MODERATE":2,"HEAVY":3,"STORM":4},"Range":{"RADAR":{"NO":[0,0.031],"LIGHT":[0.031,0.25],"MODERATE":[0.25,0.35],"HEAVY":[0.35,0.48],"STORM":[0.48,1]},"MMPERHR":{"NO":[0,0.08],"LIGHT":[0.08,3.44],"MODERATE":[3.44,11.33],"HEAVY":[11.33,51.30],"STORM":[51.30,100]}}}}
	},
	"Siri":{
		"Settings":{"Switch":true,"CountryCode":"SG","Domains":["web","itunes","app_store","movies","restaurants","maps"],"Functions":["flightutilities","lookup","mail","messages","news","safari","siri","spotlight","visualintelligence"],"Safari_Smart_History":true}
	},
	"TV":{
		"Settings":{"Switch":true,"Third-Party":true,"Configs":{"CountryCode":"AUTO","Tabs":["WatchNow","Originals","Movies","TV","Sports","Kids","Library","Search"]},"View":{"CountryCode":["SG","TW"]},"WatchNow":{"CountryCode":"AUTO"},"Channels":{"CountryCode":"AUTO"},"Originals":{"CountryCode":"TW"},"Movies":{"CountryCode":"AUTO"},"TV":{"CountryCode":"AUTO"},"Sports":{"CountryCode":"US"},"Kids":{"CountryCode":"US"},"Persons":{"CountryCode":"SG"},"Search":{"CountryCode":"TW"},"Others":{"CountryCode":"AUTO"}},
		"Configs":{
			"Locale":{"AU":"en-AU","CA":"en-CA","GB":"en-GB","KR":"ko-KR","HK":"yue-Hant","JP":"ja-JP","MO":"zh-Hant","TW":"zh-Hant","US":"en-US","SG":"zh-Hans"},
			"Tabs":{"zh":{"WatchNow":"立即观看","Originals":"原创内容","Movies":"电影","TV":"电视节目","Store":"商店","Sports":"体育节目","Kids":"儿童","Library":"资料库","Search":"搜索"},"zh-Hans":{"WatchNow":"立即观看","Originals":"原创内容","Movies":"电影","TV":"电视节目","Store":"商店","Sports":"体育节目","Kids":"儿童","Library":"资料库","Search":"搜索"},"zh-Hant":{"WatchNow":"立即觀看","Originals":"原創內容","Movies":"電影","TV":"電視節目","Store":"商店","Sports":"體育節目","Kids":"兒童","Library":"資料庫","Search":"蒐索"},"en":{"WatchNow":"Watch Now","Originals":"Originals","Movies":"Movies","TV":"TV Shows","Store":"Store","Sports":"Sports","Kids":"Kids","Library":"Library","Search":"Search"}}
		}
	},
    "News":{
		"Settings":{"Switch":true,"CountryCode":"US","newsPlusUser":"AUTO"}
	},
	"Default": {
		"Settings":{"Switch":true},
		"Configs":{
			"Storefront":{"AF":"143610","AL":"143575","AO":"143564","AI":"143538","AG":"143540","AR":"143505","AM":"143524","AU":"143460","AT":"143445","AZ":"143568","BA":"143612","BS":"143539","BH":"143559","BB":"143541","BD":"143490","BY":"143565","BE":"143446","BZ":"143555","BJ":"143576","BM":"143542","BT":"143577","BO":"143556","BW":"143525","BR":"143503","VG":"143543","BN":"143560","BG":"143526","BF":"143578","CA":"143455","CI":"143527","CM":"143574","CV":"143580","KY":"143544","TD":"143581","CL":"143483","CN":"143465","CO":"143501","CG":"143582","CR":"143495","HR":"143494","CY":"143557","CZ":"143489","DK":"143458","DM":"143545","DO":"143508","DZ":"143563","EC":"143509","EG":"143516","SV":"143506","EE":"143518","FJ":"143583","FI":"143447","FR":"143442","GM":"143584","DE":"143443","GH":"143573","GR":"143448","GD":"143546","GT":"143504","GW":"143585","GY":"143553","HN":"143510","HK":"143463","HU":"143482","IS":"143558","IN":"143467","ID":"143476","IE":"143449","IL":"143491","IT":"143450","JM":"143511","JP":"143462","JO":"143528","KH":"143579","KR":"143466","KZ":"143517","KE":"143529","KW":"143493","KG":"143586","LA":"143587","LV":"143519","LB":"143497","LR":"143588","LT":"143520","LI":"143522","LU":"143451","MO":"143515","MK":"143530","MG":"143531","MW":"143589","MY":"143473","MV":"143488","ML":"143532","MT":"143521","MR":"143590","MU":"143533","MX":"143468","FM":"143591","MD":"143523","MN":"143592","MS":"143547","MZ":"143593","NA":"143594","NP":"143484","NL":"143452","NZ":"143461","NI":"143512","NE":"143534","NG":"143561","NO":"143457","OM":"143562","PK":"143477","PW":"143595","PA":"143485","PG":"143597","PY":"143513","PE":"143507","PH":"143474","PL":"143478","PT":"143453","QA":"143498","RO":"143487","RU":"143469","ST":"143598","SA":"143479","SN":"143535","SC":"143599","SL":"143600","SG":"143464","SK":"143496","SI":"143499","SB":"143601","ZA":"143472","KP":"143466","ES":"143454","LK":"143486","KN":"143548","LC":"143549","VC":"143550","SR":"143554","SZ":"143602","SE":"143456","CH":"143459","TW":"143470","TJ":"143603","TZ":"143572","TH":"143475","TT":"143551","TN":"143536","TR":"143480","TM":"143604","TC":"143552","AE":"143481","UG":"143537","UA":"143492","GB":"143444","US":"143441","UY":"143514","UZ":"143566","VE":"143502","VN":"143471","YE":"143571","ZW":"143605","CD":"143613","GA":"143614","GF":"143615","IQ":"143617","XK":"143624","LY":"143567","ME":"143619","MA":"143620","MM":"143570","NR":"143606","RW":"143621","RS":"143500","TO":"143608","VU":"143609","ZM":"143622"}
		}
	}
};

// headers转小写
for (const [key, value] of Object.entries($request.headers)) {
	delete $request.headers[key]
	$request.headers[key.toLowerCase()] = value
};

/***************** Processing *****************/
!(async () => {
	const { Settings, Caches, Configs } = await setENV("iRingo", "Weather", DataBase);
	if (Settings.Switch) {
		if (Settings.Map.AQI) {
			let url = URL.parse($request.url);
			$.log(url.path);
			switch (url.path) {
				case "v1/mapOverlay/airQuality":
					url.host = "tiles.waqi.info"
					url.path = `tiles/usepa-aqi/${url.params?.z}/${url.params?.x}/${url.params?.y}.png`
					delete url.params
					break;
				default:
					break;
			}
			if ($request?.headers?.host) $request.headers.host = url.host;
			$request.url = URL.stringify(url);
		}
	}
})()
	.catch((e) => $.logErr(e))
	.finally(() => {
		if ($.isQuanX()) $.done({ url: $request.url, headers: $request.headers })
		else $.done($request)
	})

/***************** Async Function *****************/
/**
 * Get Environment Variables
 * @link https://github.com/VirgilClyne/VirgilClyne/blob/main/function/getENV/getENV.min.js
 * @author VirgilClyne
 * @param {String} t - Persistent Store Key
 * @param {String} e - Platform Name
 * @param {Object} n - Default Database
 * @return {Promise<*>}
 */
async function getENV(t,e,n){let i=$.getjson(t,n),s={};if("undefined"!=typeof $argument&&Boolean($argument)){let t=Object.fromEntries($argument.split("&").map((t=>t.split("="))));for(let e in t)f(s,e,t[e])}let g={...n?.Default?.Settings,...n?.[e]?.Settings,...i?.[e]?.Settings,...s},o={...n?.Default?.Configs,...n?.[e]?.Configs,...i?.[e]?.Configs},a=i?.[e]?.Caches||void 0;return"string"==typeof a&&(a=JSON.parse(a)),{Settings:g,Caches:a,Configs:o};function f(t,e,n){e.split(".").reduce(((t,i,s)=>t[i]=e.split(".").length===++s?n:t[i]||{}),t)}}

/**
 * Set Environment Variables
 * @author VirgilClyne
 * @param {String} name - Persistent Store Key
 * @param {String} platform - Platform Name
 * @param {Object} database - Default DataBase
 * @return {Promise<*>}
 */
async function setENV(name, platform, database) {
	$.log(`⚠ ${$.name}, Set Environment Variables`, "");
	let { Settings, Caches = {}, Configs } = await getENV(name, platform, database);
	/***************** Prase *****************/
	Settings.Switch = JSON.parse(Settings.Switch) // BoxJs字符串转Boolean
	Settings.NextHour.Switch = JSON.parse(Settings.NextHour.Switch) // BoxJs字符串转Boolean
	Settings.AQI.Switch = JSON.parse(Settings.AQI.Switch) // BoxJs字符串转Boolean
	Settings.Map.AQI = JSON.parse(Settings.Map.AQI) // BoxJs字符串转Boolean
	$.log(`🎉 ${$.name}, Set Environment Variables`, `Settings: ${typeof Settings}`, `Settings内容: ${JSON.stringify(Settings)}`, "");
	return { Settings, Caches, Configs }
};

/***************** Env *****************/
// prettier-ignore
// https://github.com/chavyleung/scripts/blob/master/Env.min.js
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}isStash(){return"undefined"!=typeof $environment&&$environment["stash-version"]}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,a]=i.split("@"),n={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),a=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(a);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){if(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)});else if(this.isQuanX())this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t&&t.error||"UndefinedError"));else if(this.isNode()){let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:i,statusCode:r,headers:o,rawBody:a}=t,n=s.decode(a,this.encoding);e(null,{status:i,statusCode:r,headers:o,rawBody:a,body:n},n)},t=>{const{message:i,response:r}=t;e(i,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t&&t.error||"UndefinedError"));else if(this.isNode()){let i=require("iconv-lite");this.initGotEnv(t);const{url:r,...o}=t;this.got[s](r,o).then(t=>{const{statusCode:s,statusCode:r,headers:o,rawBody:a}=t,n=i.decode(a,this.encoding);e(null,{status:s,statusCode:r,headers:o,rawBody:a,body:n},n)},t=>{const{message:s,response:r}=t;e(s,r,r&&i.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,i=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":i}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),this.isSurge()||this.isQuanX()||this.isLoon()?$done(t):this.isNode()&&process.exit(1)}}(t,e)}

// https://github.com/VirgilClyne/VirgilClyne/blob/main/function/URL/URLs.embedded.min.js
function URLs(s){return new class{constructor(s=[]){this.name="URL v1.0.1",this.opts=s,this.json={url:{scheme:"",host:"",path:""},params:{}}}parse(s){let t=s.match(/(?<scheme>.+):\/\/(?<host>[^/]+)\/?(?<path>[^?]+)?\??(?<params>.*)?/)?.groups??null;return t?.path||(t.path=""),t?.params&&(t.params=Object.fromEntries(t.params.split("&").map((s=>s.split("="))))),t}stringify(s=this.json){return s?.params?s.scheme+"://"+s.host+"/"+s.path+"?"+Object.entries(s.params).map((s=>s.join("="))).join("&"):s.scheme+"://"+s.host+"/"+s.path}}(s)}
