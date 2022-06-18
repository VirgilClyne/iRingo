/*
README:https://github.com/VirgilClyne/iRingo
*/
const $ = new Env('Apple TV');
$.VAL = {
	"url": $request.url,
	"body": $request?.body ?? (typeof $response != "undefined") ? $response?.body : null
};

/***************** Async *****************/

!(async () => {
	if ($.VAL.url.indexOf("/uts/v3/configurations?") != -1) { // https://uts-api.itunes.apple.com/uts/v3/configurations?
		const Parameter = await getOrigin($.VAL.url)
		if (Parameter.caller == "wta") $.done() // 不修改caller=wta的configurations数据
		else {
			let TabsGroup = await createTabsGroup(Parameter);
			$.VAL.body = await outputData(Parameter, $.VAL.body, TabsGroup);
			$.done({ "body": $.VAL.body });
		}
	} else if ($.VAL.url.indexOf("/uts/v3/canvases/Roots/watchNow?") != -1 || $.VAL.url.indexOf("/uts/v3/canvases/roots/tahoma_watchnow?") != -1) { // https://uts-api.itunes.apple.com/uts/v3/canvases/Roots/watchNow? https://uts-api.itunes.apple.com/uts/v3/canvases/roots/tahoma_watchnow?
		$.VAL.url = (processQuery($.VAL.url, 'pfm') == 'desktop') ? processQuery($.VAL.url, 'pfm', 'appletv') : $.VAL.url;
		$.done({ "url": $.VAL.url });
	} else if ($.VAL.url.indexOf("/uts/v3/shelves/uts.col.UpNext?") != -1) { // https://uts-api.itunes.apple.com/uts/v3/shelves/uts.col.UpNext?
		$.VAL.url = (processQuery($.VAL.url, 'pfm') == 'desktop') ? processQuery($.VAL.url, 'pfm', 'ipad') : $.VAL.url;
		$.done({ "url": $.VAL.url });
	} else if ($.VAL.url.indexOf("/uts/v3/canvases/Channels/tvs.sbd.4000?") != -1) { // https://uts-api.itunes.apple.com/uts/v3/canvases/Channels/tvs.sbd.4000?
		$.done({ "url": $.VAL.url });
	} else if ($.VAL.url.indexOf("/uts/v2/brands?") != -1) { // https://uts-api.itunes.apple.com/uts/v2/brands?
		$.VAL.url = processQuery($.VAL.url, 'sf', '143441');
		$.done({ "url": $.VAL.url });
	} else if ($.VAL.url.indexOf("/uts/v3/canvases/Roots/movies?") != -1 || $.VAL.url.indexOf("/uts/v3/movies/") != -1) { // https://uts-api.itunes.apple.com/uts/v3/canvases/Roots/Movies? https://uts-api.itunes.apple.com/uts/v3/movies/
		$.VAL.url = (processQuery($.VAL.url, 'pfm') == 'desktop') ? processQuery($.VAL.url, 'pfm', 'ipad') : $.VAL.url;
		$.done({ "url": $.VAL.url });
	} else if ($.VAL.url.indexOf("/uts/v3/canvases/Roots/tv?") != -1 || $.VAL.url.indexOf("/uts/v3/shows/") != -1) { // https://uts-api.itunes.apple.com/uts/v3/canvases/Roots/TV? https://uts-api.itunes.apple.com/uts/v3/shows/
		$.VAL.url = (processQuery($.VAL.url, 'pfm') == 'desktop') ? processQuery($.VAL.url, 'pfm', 'ipad') : $.VAL.url;
		$.done({ "url": $.VAL.url });
	} else if ($.VAL.url.indexOf("/uts/v3/canvases/Roots/sports?") != -1 || $.VAL.url.indexOf("/uts/v2/sports/") != -1) { // https://uts-api.itunes.apple.com/uts/v3/canvases/Roots/Sports? https://uts-api.itunes.apple.com/uts/v2/sports/
		$.VAL.url = (processQuery($.VAL.url, 'pfm') == 'desktop') ? processQuery($.VAL.url, 'pfm', 'ipad') : $.VAL.url;
		$.VAL.url = processQuery($.VAL.url, 'sf', '143441');
		$.done({ "url": $.VAL.url });
	} else if ($.VAL.url.indexOf("/uts/v3/canvases/Roots/Kids?") != -1) { // https://uts-api.itunes.apple.com/uts/v3/canvases/Roots/Kids?
		$.VAL.url = processQuery($.VAL.url, 'sf', '143441');
		$.done({ "url": $.VAL.url });
	} else if ($.VAL.url.indexOf("/uts/v3/watchlist") != -1) { // https://uts-api.itunes.apple.com/uts/v3/watchlist
		$.VAL.url = (processQuery($.VAL.url, 'pfm') == 'desktop') ? processQuery($.VAL.url, 'pfm', 'ipad') : $.VAL.url;
		$.done({ "url": $.VAL.url });
	} else if ($.VAL.url.indexOf("/uts/v3/playables/") != -1) { // https://uts-api.itunes.apple.com/uts/v3/playables/
		$.VAL.url = processQuery($.VAL.url, 'sf', '143441');
		$.done({ "url": $.VAL.url });
	} else if ($.VAL.url.indexOf("/uts/v2/favorites") != -1) { // https://uts-api.itunes.apple.com/uts/v2/favorites
		$.VAL.url = processQuery($.VAL.url, 'sf', '143441');
		$.VAL.body = ($.VAL?.body) ? $.VAL.body.replace(sf = /[\d]{6}/g, sf = 143441) : null;
		$.done({ "url": $.VAL.url, "body": $.VAL.body });
	} else if ($.VAL.url.indexOf("/uts/v3/sporting-events/") != -1) { // https://uts-api.itunes.apple.com/uts/v3/sporting-events/
		$.VAL.url = (processQuery($.VAL.url, 'pfm') == 'desktop') ? processQuery($.VAL.url, 'pfm', 'ipad') : $.VAL.url;
		$.VAL.url = processQuery($.VAL.url, 'sf', '143441');
		$.done({ "url": $.VAL.url });
	} else if ($.VAL.url.indexOf("/uts/v3/canvases/Persons/") != -1) { // https://uts-api.itunes.apple.com/uts/v3/canvases/Persons/
		$.VAL.url = (processQuery($.VAL.url, 'pfm') == 'desktop') ? processQuery($.VAL.url, 'pfm', 'ipad') : $.VAL.url;
		$.done({ "url": $.VAL.url });
	}
})()
	.catch((e) => $.logErr(e))
	.finally(() => $.done())

/***************** Async Function *****************/
// Step 1
// Get Origin Parameter
function getOrigin(url) {
	return new Promise((resolve) => {
		const Regular = /^https?:\/\/(?<dataServer>uts-api|uts-api-siri)\.itunes\.apple\.com\/uts\/(?<Version>v1|v2|v3)\/configurations\?.*v=(?<ConfVer>\d{2,}).*/i;
		try {
			var Parameter = url.match(Regular).groups;
			Parameter.ConfVer = Number(Parameter.ConfVer);
			Parameter.caller = processQuery(url, 'caller');
			Parameter.platform = processQuery(url, 'pfm');
			if (Parameter.caller == 'wlk' || Parameter.caller == "js") {
				Parameter.region = processQuery(url, 'region')
			} else if (Parameter.caller == 'wta' || Parameter.caller == "com.apple.iTunes") {
				Parameter.country = processQuery(url, 'country');
				Parameter.locale = processQuery(url, 'locale');
			} else $.done();
		} catch (e) {
			$.log(`❗️${$.name}, ${getOrigin.name}执行失败`, `error = ${e}`, '');
		} finally {
			$.log(`🎉 ${$.name}, ${getOrigin.name}完成`, JSON.stringify(Parameter), '');
			resolve(Parameter);
		}
	})
};


// Step 2
// Create Tabs Group
async function createTabsGroup(Parameter) {
	//构建Tab内容
	let WatchNow = { "destinationType": "Target", "target": { "id": "tahoma_watchnow", "type": "Root", "url": "https://tv.apple.com/watch-now" }, "title": "立即观看", "type": "WatchNow", "universalLinks": ["https://tv.apple.com/watch-now"] };
	let Originals = { "destinationType": "Target", "target": { "id": "tvs.sbd.4000", "type": "Brand", "url": "https://tv.apple.com/us/channel/tvs.sbd.4000" }, "title": "原创内容", "type": "Originals", "universalLinks": ["https://tv.apple.com/channel/tvs.sbd.4000", "https://tv.apple.com/atv"] };
	let Movies = { "universalLinks": ["https://tv.apple.com/movies"], "title": "电影", "destinationType": "Target", "secondaryEnabled": true, "target": { "id": "tahoma_movies", "type": "Root", "url": "https://tv.apple.com/movies" }, "type": "Movies" };
	let TV = { "universalLinks": ["https://tv.apple.com/tv-shows"], "title": "电视节目", "destinationType": "Target", "secondaryEnabled": true, "target": { "id": "tahoma_tvshows", "type": "Root", "url": "https://tv.apple.com/tv-shows" }, "type": "TV" };
	let Store = {
		"destinationType": "SubTabs",
		"subTabs": [{ "destinationType": "Target", "target": { "id": "tahoma_movies", "type": "Root", "url": "https://tv.apple.com/movies" }, "title": "电影", "type": "Movies", "universalLinks": ["https://tv.apple.com/movies"] }, { "destinationType": "Target", "target": { "id": "tahoma_tvshows", "type": "Root", "url": "https://tv.apple.com/tv-shows" }, "title": "电视节目", "type": "TV", "universalLinks": ["https://tv.apple.com/tv-shows"] }],
		"title": "商店",
		"type": "Store",
		"universalLinks": ["https://tv.apple.com/store"]
	};
	let Sports = { "destinationType": "Target", "target": { "id": "tahoma_sports", "type": "Root", "url": "https://tv.apple.com/sports" }, "title": "体育节目", "secondaryEnabled": true, "type": "Sports", "universalLinks": ["https://tv.apple.com/sports"] };
	let Kids = { "destinationType": "Target", "target": { "id": "tahoma_kids", "type": "Root", "url": "https://tv.apple.com/kids" }, "title": "儿童", "secondaryEnabled": true, "type": "Kids", "universalLinks": ["https://tv.apple.com/kids"] };
	let Library = { "destinationType": "Client", "title": "资料库", "type": "Library" };
	let Search = { "destinationType": "Target", "target": { "id": "tahoma_searchlanding", "type": "Root", "url": "https://tv.apple.com/search" }, "title": "搜索", "type": "Search", "universalLinks": ["https://tv.apple.com/search"] };

	// 创建分组
	var tabs = (Parameter.ConfVer > 53) ? [WatchNow, Originals, Store, Sports, Kids, Library, Search]
	: [WatchNow, Originals, Movies, TV, Sports, Kids, Library, Search];
	var tabsSplitScreen =  [WatchNow, Originals, Store, Library, Search];
	// 输出
	return [tabs, tabsSplitScreen];
};

// Step 3
// Output Tabs Data
function outputData(Parameter, body, [tabs, tabsSplitScreen]) {
	return new Promise((resolve) => {
		// Input Data
		let configurations = JSON.parse(body);
		try {
			//检测版本
			$.log(`⚠️ ${$.name}, ${outputData.name}检测`, `API: ${Parameter.Version}`, '');
			if (Parameter.Version == "v1") $.done()
			else if (Parameter.Version == "v2") $.done()
			else if (Parameter.Version == "v3") {
				// 注入数据
				//条件运算符 & 可选链操作符 
				configurations.data.applicationProps.tabs = tabs;
				if (Parameter.ConfVer > 53) configurations.data.applicationProps.tabsSplitScreen = tabsSplitScreen;
				configurations.data.applicationProps.tvAppEnabledInStorefront = true;
				configurations.data.applicationProps.enabledClientFeatures = (Parameter.ConfVer > 53) ? [{ "domain": "tvapp", "name": "snwpcr" }, { "domain": "tvapp", "name": "store_tab" }]
				: [{ "domain": "tvapp", "name": "expanse" }, { "domain": "tvapp", "name": "syndication" }, { "domain": "tvapp", "name": "snwpcr" }];
				configurations.data.applicationProps.storefront.localesSupported = ["zh_Hans", "zh_Hant", "yue-Hant", "en_US", "en_GB"];
				configurations.data.applicationProps.featureEnablers = {
					"topShelf": true,
					"unw": true,
					"imageBasedSubtitles": true,
					"ageVerification": false,
					"seasonTitles": false
				};
				configurations.data.userProps.activeUser = true;
				configurations.data.userProps.gac = true;
			} else $.done();
		} catch (e) {
			$.log(`❗️${$.name}, ${outputData.name}执行失败`, `error = ${error || e}`, '')
		} finally {
			// Output Data
			body = JSON.stringify(configurations);
			$.log(`🎉 ${$.name}, ${outputData.name}完成`, '');
			resolve(body)
		}
	})
};

/***************** Fuctions *****************/
// Function 0
// process Query URL
// 查询并替换自身,url为链接,variable为参数,parameter为新值(如果有就替换)
// https://github.com/VirgilClyne/iRingo/blob/main/js/QueryURL.js
function processQuery(url, variable, parameter) {
	//console.log(`🚧 ${processQuery.name}调试信息, INPUT: variable: ${variable}, parameter: ${parameter}`, ``);
	if (url.indexOf("?") != -1) {
		if (parameter == undefined) {
			//console.log(`🚧 ${processQuery.name}调试信息, getQueryVariable, INPUT: variable: ${variable}`, ``);
			var query = url.split("?")[1];
			var vars = query.split("&");
			for (var i = 0; i < vars.length; i++) {
				var pair = vars[i].split("=");
				if (pair[0] == variable) {
					console.log(`🚧 ${processQuery.name}调试信息, getQueryVariable, OUTPUT: ${variable}=${pair[1]}`, ``);
					return pair[1];
				}
			}
			console.log(`🚧 ${processQuery.name}调试信息, getQueryVariable, ERROR: No such variable: ${variable}, Skip`, ``);
			return false;
		} else {
			//console.log(`🚧 ${processQuery.name}调试信息, replaceQueryParamter, INPUT: ${variable}=${parameter}, Start`, ``);
			var re = new RegExp('(' + variable + '=)([^&]*)', 'gi')
			var newUrl = url.replace(re, variable + '=' + parameter)
			console.log(`🚧 ${processQuery.name}调试信息, replaceQueryParamter, OUTPUT: ${variable}=${parameter}`, newUrl, ``);
			return newUrl
		};
	} else {
		console.log(`🚧 ${processQuery.name}调试信息, ERROR: No such URL ,Skip`, url, ``);
		return url;
	}
};

/***************** Env *****************/
// prettier-ignore
// https://github.com/chavyleung/scripts/blob/master/Env.min.js
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){if(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:i,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:i,statusCode:r,headers:o,rawBody:h},s.decode(h,this.encoding))},t=>{const{message:i,response:r}=t;e(i,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let i=require("iconv-lite");this.initGotEnv(t);const{url:r,...o}=t;this.got[s](r,o).then(t=>{const{statusCode:s,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:s,statusCode:r,headers:o,rawBody:h},i.decode(h,this.encoding))},t=>{const{message:s,response:r}=t;e(s,r,r&&i.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,i=rawOpts["update-pasteboard"]||rawOpts.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":i}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
