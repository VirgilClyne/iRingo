/*
README:https://github.com/VirgilClyne/iRingo
*/
const $ = new Env('Apple TV');
var url = $request.url;

//URL List
const configurations = /\/uts\/(v1|v2|v3)\/configurations\?/i; // https://uts-api.itunes.apple.com/uts/v3/configurations?
const watchNow = /\/uts\/(v1|v2|v3)\/canvases\/Roots\/watchNow\?/i; // https://uts-api.itunes.apple.com/uts/v3/canvases/Roots/watchNow?
const tahoma_watchnow = /\/uts\/(v1|v2|v3)\/canvases\/roots\/tahoma_watchnow\?/i; // https://uts-api.itunes.apple.com/uts/v3/canvases/roots/tahoma_watchnow?
const ATV = /\/uts\/(v1|v2|v3)\/canvases\/Roots\/Channels\/tvs\.sbd\.4000\?/i; // https://uts-api.itunes.apple.com/uts/v3/canvases/Channels/tvs.sbd.4000?
const Movies = /\/uts\/(v1|v2|v3)\/canvases\/Roots\/Movies\?/i; // https://uts-api.itunes.apple.com/uts/v3/canvases/Roots/Movies?
const TV = /\/uts\/(v1|v2|v3)\/canvases\/Roots\/TV\?/i; // https://uts-api.itunes.apple.com/uts/v3/canvases/Roots/TV?
const Sports = /\/uts\/(v1|v2|v3)\/canvases\/Roots\/Sports\?/i; // https://uts-api.itunes.apple.com/uts/v3/canvases/Roots/Sports?
const Kids = /\/uts\/(v1|v2|v3)\/canvases\/Roots\/kids\?/i; // https://uts-api.itunes.apple.com/uts/v3/canvases/Roots/Kids?
const UpNext = /\/uts\/(v1|v2|v3)\/shelves\/uts\.col\.UpNext\?/i; // https://uts-api.itunes.apple.com/uts/v3/shelves/uts.col.UpNext?
const brands = /\/uts\/(v1|v2|v3)\/brands\?/i; // https://uts-api.itunes.apple.com/uts/v2/brands?
const movies = /\/uts\/(v1|v2|v3)\/movies\//i; // https://uts-api.itunes.apple.com/uts/v3/movies/
const shows = /\/uts\/(v1|v2|v3)\/shows\//i; // https://uts-api.itunes.apple.com/uts/v3/shows/
const sports = /\/uts\/(v1|v2|v3)\/sports\//i; // https://uts-api.itunes.apple.com/uts/v2/sports/
const watchlist = /\/uts\/(v1|v2|v3)\/watchlist/i; // https://uts-api.itunes.apple.com/uts/v3/watchlist
const Favorites = /\/uts\/(v1|v2|v3)\/favorites\?/i; // https://uts-api.itunes.apple.com/uts/v2/favorites?
const favorites = /\/uts\/(v1|v2|v3)\/favorites\//i; // https://uts-api.itunes.apple.com/uts/v2/favorites/
const sportingevents = /\/uts\/(v1|v2|v3)\/sporting-events\//i; // https://uts-api.itunes.apple.com/uts/v3/sporting-events/
const playables = /\/uts\/(v1|v2|v3)\/playables\//i; // https://uts-api.itunes.apple.com/uts/v3/playables/
const Persons = /\/uts\/(v1|v2|v3)\/canvases\/Persons\//i; // https://uts-api.itunes.apple.com/uts/v3/canvases/Persons/

!(async () => {
	if (url.search(configurations) != -1) {
		const Parameter = await getOrigin($request.url)
		if (Parameter.caller == 'wta') $.done() // 丢弃caller=wta的configurations数据
		else {
			let [Tabs, TabsGroup] = await createTabsGroup();
			let body = await outputData(Parameter.Version, Parameter.caller, Parameter.platform, Parameter.locale, Parameter.region, $response.body, Tabs, TabsGroup);
			$.done({ body });
		}
	} else if (url.search(watchNow) != -1 || url.search(tahoma_watchnow) != -1) {
		if (processQuery(url, 'pfm') == 'desktop') url = processQuery(url, 'pfm', 'appletv');
		$.done({ url });
	} else if (url.search(UpNext) != -1) {
		if (processQuery(url, 'pfm') == 'desktop') url = processQuery(url, 'pfm', 'ipad');
		$.done({ url });
	} else if (url.search(ATV) != -1) {
		$.done({ url });
	} else if (url.search(brands) != -1) {
		url = processQuery(url, 'sf', '143441');
		$.done({ url });
	} else if (url.search(Movies) != -1 || url.search(movies) != -1) {
		if (processQuery(url, 'pfm') == 'desktop') url = processQuery(url, 'pfm', 'ipad');
		$.done({ url });
	} else if (url.search(TV) != -1 || url.search(shows) != -1) {
		if (processQuery(url, 'pfm') == 'desktop') url = processQuery(url, 'pfm', 'ipad');
		$.done({ url });
	} else if (url.search(Sports) != -1 || url.search(sports) != -1) {
		if (processQuery(url, 'pfm') == 'desktop') url = processQuery(url, 'pfm', 'ipad');
		url = processQuery(url, 'sf', '143441');
		$.done({ url });
	} else if (url.search(Kids) != -1) {
		url = processQuery(url, 'sf', '143441');
		$.done({ url });
	} else if (url.search(watchlist) != -1) {
		if (processQuery(url, 'pfm') == 'desktop') url = processQuery(url, 'pfm', 'ipad');
		$.done({ url });
	} else if (url.search(playables) != -1) {
		url = processQuery(url, 'sf', '143441');
		$.done({ url });
	} else if (url.search(Favorites) != -1) {
		url = processQuery(url, 'sf', '143441');
		$.done({ url });
	} else if (url.search(favorites) != -1) {
		let body = $request.body;
		body = body.replace(sf = /[\d]{6}/g, sf = 143441);
		$.log(`🎉 ${$.name}, redirectFavorites, Finish`, `data = ${body}`, '')
		$.done({ body });
	} else if (url.search(sportingevents) != -1) {
		if (processQuery(url, 'pfm') == 'desktop') {
			url = processQuery(url, 'pfm', 'ipad');
			url = processQuery(url, 'sf', '143441');
		}
		else url = processQuery(url, 'sf', '143441');
		$.done({ url });
	}
})()
	.catch((e) => $.logErr(e))
	.finally(() => $.done())

// Step 1
// Get Origin Parameter
function getOrigin(url) {
	return new Promise((resolve) => {
		const Regular = /^https?:\/\/(?<dataServer>uts-api|uts-api-siri)\.itunes\.apple\.com\/uts\/(?<Version>v1|v2|v3)\/configurations\?.*/;
		try {
			//[$.url, $.dataServer, $.apiVer] = url.match(Regular);
			var Parameter = url.match(Regular).groups;
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
			//$.log(`🎉 ${$.name}, getOrigin, Finish`, $.url, `${$.dataServer}, ${$.apiVer}, ${$.caller}, ${$.platform}, ${$.region}, ${$.country}, ${$.locale}`, '')
			$.log(`🎉 ${$.name}, ${getOrigin.name}完成`, JSON.stringify(Parameter), '');
			resolve(Parameter);
		}
	})
};


// Step 2
// Create Tabs Group
async function createTabsGroup() {
	//构建Tab内容
	let WatchNow = {
		"destinationType": "Target",
		"target": {
			"id": "tahoma_watchnow",
			"type": "Root",
			"url": "https://tv.apple.com/watch-now"
		},
		"title": "立即观看",
		"type": "WatchNow",
		"universalLinks": ["https://tv.apple.com/watch-now"]
	};
	let Originals = {
		"destinationType": "Target",
		"target": {
			"id": "tvs.sbd.4000",
			"type": "Brand",
			"url": "https://tv.apple.com/us/channel/tvs.sbd.4000"
		},
		"title": "原创内容",
		"type": "Originals",
		"universalLinks": ["https://tv.apple.com/channel/tvs.sbd.4000", "https://tv.apple.com/atv"]
	};
	let Store = {
		"destinationType": "SubTabs",
		"subTabs": [{
			"destinationType": "Target",
			"target": {
				"id": "tahoma_movies",
				"type": "Root",
				"url": "https://tv.apple.com/movies"
			},
			"title": "电影",
			"type": "Movies",
			"universalLinks": ["https://tv.apple.com/movies"]
		}, {
			"destinationType": "Target",
			"target": {
				"id": "tahoma_tvshows",
				"type": "Root",
				"url": "https://tv.apple.com/tv-shows"
			},
			"title": "电视节目",
			"type": "TV",
			"universalLinks": ["https://tv.apple.com/tv-shows"]
		}],
		"title": "商店",
		"type": "Store",
		"universalLinks": ["https://tv.apple.com/store"]
	};
	let Sports = {
		"destinationType": "Target",
		"target": {
			"id": "tahoma_sports",
			"type": "Root",
			"url": "https://tv.apple.com/sports"
		},
		"title": "体育节目",
		"type": "Sports",
		"universalLinks": ["https://tv.apple.com/sports"]
	};
	let Kids = {
		"destinationType": "Target",
		"target": {
			"id": "tahoma_kids",
			"type": "Root",
			"url": "https://tv.apple.com/kids"
		},
		"title": "儿童",
		"secondaryEnabled": true,
		"type": "Kids",
		"universalLinks": ["https://tv.apple.com/kids"]
	};
	let Library = {
		"destinationType": "Client",
		"title": "资料库",
		"type": "Library"
	};
	let Search = {
		"destinationType": "Target",
		"target": {
			"id": "tahoma_searchlanding",
			"type": "Root",
			"url": "https://tv.apple.com/search"
		},
		"title": "搜索",
		"type": "Search",
		"universalLinks": ["https://tv.apple.com/search"]
	};

	// 创建分组
	const Tabs = [WatchNow, Originals, Store, Sports, Kids, Library, Search];
	const TabsGroup = [WatchNow, Originals, Store, Sports, Kids, Library, Search];
	/*
	 // 简体中文改Tabs语言
	 if (locale) var esl = locale.match(/[a-z]{2}_[A-Za-z]{2,3}/g)
	 if (esl != "zh_Hans" || region != "CN") {
		 if (platform == "iphone" || platform == "ipad") var maps = new Map([['立即观看', 'Watch Now'], ['原创内容', 'Originals'], ['电影', 'Movies'], ['电视节目', 'TV'], ['体育节目', 'Sports'], ['儿童', 'Kids'], ['商店', 'Store'], ['资料库', 'Library'], ['搜索', 'Search']])
		 else var maps = new Map([['立即观看', 'Watch Now'], ['Apple TV+', 'Apple TV+'], ['电影', 'Movies'], ['电视节目', 'TV'], ['体育节目', 'Sports'], ['儿童', 'Kids'], ['商店', 'Store'], ['资料库', 'Library'], ['搜索', 'Search']]);
		 Tabs = Tabs.map(element => { element.title = maps.get(element.title); return element; });
	 };
	 */
	// 输出
	return [Tabs, TabsGroup];
};

// Step 3
// Output Tabs Data
function outputData(api, caller, platform, locale, region, body, Tabs, TabsGroup) {
	return new Promise((resolve) => {
		// Input Data
		let configurations = JSON.parse(body);
		try {
			//检测版本
			$.log(`⚠️ ${$.name}, ${outputData.name}检测`, `API: ${api}`, '');
			if (api == "v1") $.done()
			else if (api == "v2") $.done()
			else if (api == "v3") {
				// 注入数据
				//条件运算符 & 可选链操作符 
				//configurations.data.applicationProps.requiredParamsMap.WithoutUtsk.locale = "zh_Hans";
				//configurations.data.applicationProps.requiredParamsMap.Default.locale = "zh_Hans";
				configurations.data.applicationProps.tabs = Tabs;
				//configurations.data.applicationProps.tabs = createTabsGroup("Tabs", caller, platform, locale, region);
				configurations.data.applicationProps.tabsSplitScreen = TabsGroup;
				//configurations.data.applicationProps.tabsSplitScreen = createTabsGroup("TabsGroup", caller, platform, locale, region);
				configurations.data.applicationProps.tvAppEnabledInStorefront = true;
				configurations.data.applicationProps.enabledClientFeatures = [{ "domain": "tvapp", "name": "expanse" }, { "domain": "tvapp", "name": "syndication" }, { "domain": "tvapp", "name": "snwpcr" }, { "domain": "tvapp", "name": "store_tab" }];
				configurations.data.applicationProps.storefront.localesSupported = ["zh_Hans", "zh_Hant", "yue-Hant", "en_US", "en_GB"];
				//configurations.data.applicationProps.storefront.storefrontId = 143470;
				configurations.data.applicationProps.featureEnablers = {
					"topShelf": true,
					"unw": true,
					"imageBasedSubtitles": true,
					"ageVerification": false,
					"seasonTitles": false
				};
				configurations.data.userProps.activeUser = true;
				//configurations.data.userProps.utsc = "1:18943";
				//configurations.data.userProps.country = country;
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
