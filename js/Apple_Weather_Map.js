/*
README:https://github.com/VirgilClyne/iRingo
*/

const $ = new Env('Apple_Weather_Map');

var url = $request.url;
var headers = $request.headers;
$.VAL_headers =  {
    'Host': `tiles.waqi.info`,
    //'Content-Type': `application/x-www-form-urlencoded`,
    'Origin': `https://waqi.info`,
    'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/605.1.15`,
    'Referer': `https://waqi.info/`,
}

!(async () => {
    await getOrigin(url)
    await convertTilesCoord($.lat, $.lng, 'gps84_To_gcj02')
    await outputUrl('usepa-aqi', $.newLat, $.newLng, $.alt)
    //await getTiles('usepa-aqi', $.wgs84togcj02[0], $.wgs84togcj02[1], $.alt)
    //await ConvertTiles(png)
    //await outputData($.Tiles)
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())

// Step 1
// Get Origin Parameter
function getOrigin(url) {
    return new Promise((resove) => {
        const Regular = /^https?:\/\/(weather-map)\.apple\.com\/(v1|v2)\/mapOverlay\/airQuality.*/;
        //const Regular = /^https?:\/\/(weather-map)\.apple\.com\/(v1|v2)\/mapOverlay\/airQuality.*x=(-?\d+)&y=(-?\d+)&z=(-?\d+).*(country=[A-Z]{2})?.*/;
        try {
            [$.url, $.dataServer, $.apiVer] = url.match(Regular);
            $.lat = processQuery(url, 'x')
            $.lng = processQuery(url, 'y')
            $.alt = processQuery(url, 'z')
            $.countryCode = processQuery(url, 'country')
            $.log(`🎉 ${$.name}, getOrigin`, `Finish`, $.url, $.dataServer, $.apiVer, $.lat, $.lng, $.alt, $.countryCode, '')
        } catch (e) {
            $.log(`❗️ ${$.name}, getOrigin, Failure`, ` error = ${e}`, '')
        } finally {
            $.log(`🎉 ${$.name}, getOrigin, Finish`, '')
            resove()
        }
    })
};

// Step 2
// Convert Tiles Coordinates
// https://github.com/CntChen/tile-lnglat-transform
function convertTilesCoord(lat, lng, type) {
    return new Promise((resove) => {
        center = L.coordConver().gps84_To_gcj02(lng, lat);
            try {
                const _data = JSON.parse(center)
                if (error) throw new Error(error)
                $.newLng = _data.lng;
                $.newLat = _data.lat;
                resove()
            } catch (e) {
                $.log(`❗️ ${$.name}, convertGeo`, `Failure`, ` error = ${error || e}`, '')
            } finally {
                $.log(`🎉 ${$.name}, convertGeo`, `Finish`, `${type}: ${lat},${lng} => ${$.newLat},${$.newLng}`, center, '')
                resove()
            }
    });
};

// Step 3
// Get WAQI Air Quality Map Tiles
// https://tiles.waqi.info/tiles/{aqi}/{z}/{x}/{y}.png
// https://tiles.aqicn.org/tiles/{aqi}/{z}/{x}/{y}.png
function getTiles(aqi, lat, lng, alt) {
    //if ($.country = 'CN')
    return new Promise((resove) => {
        const url = { url: `https://tiles.waqi.info/tiles/${aqi}/${alt}/${lat}/${lng}.png`, headers: $.VAL_headers }
        $.get(url, (error, response, data) => {
            try {
                const _data = data
                if (error) throw new Error(error)
                $.Tiles = _data
            } catch (e) {
                $.log(`❗️ ${$.name}, getTiles`, `Failure`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
            } finally {
                $.log(`🎉 ${$.name}, getTiles`, `Finish`, '')
                resove()
            }
        });
    })
};

/*
// Step 4
// Convert WAQI Air Quality Map Tiles Color Format
function ConvertTiles(png) {
    //if ($.country = 'CN')
    return new Promise((resove) => {

        $.post(url, (error, response, data) => {
            try {
                if (error) throw new Error(error)
                }
                else {
                    $.log(`⚠️ ${$.name}, ConvertTiles`, `Error`, `data = ${data}`, '')
                }
            } catch (e) {
                $.log(`❗️ ${$.name}, ConvertTiles执行失败!`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
            } finally {
                $.log(`🎉 ${$.name}, ConvertTiles`, `Finish`, '')
                resove()
            }
        })
    })
};
*/


// Step 5
// Output URL
function outputUrl(aqi, lat, lng, alt) {
    return new Promise((resove) => {
        try {
            url = `https://tiles.waqi.info/tiles/${aqi}/${alt}/${lat}/${lng}.png`;
            headers = $.VAL_headers;
            $.done({ url, headers });
        } catch (e) {
            $.log(`❗️ ${$.name}, outputUrl`, `Failure`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
        } finally {
            $.log(`🎉 ${$.name}, outputUrl`, `Finish`, '')
            resove()
        }
    })
};

// Step 5
// Output Data
function outputData(png) {
    return new Promise((resove) => {
        let body = $response.rawBody
        try {
            if (png) body = png;
            $.log(`🎉 ${$.name}, outputData`, `Finish`, '')
            $done({ body });
        } catch (e) {
            $.log(`❗️ ${$.name}, getAQIstatus, Failure`, ` error = ${e}`, '')
        } finally {
            $.log(`🎉 ${$.name}, getOrigin, Finish`, '')
            resove()
        }
    })
};

// Funtion 1
// 查询并替换自身,url为链接,variable为参数,parameter为新值(如果有就替换)
// https://github.com/VirgilClyne/iRingo/blob/main/js/QueryURL.js
function processQuery(url, variable, parameter) {
    console.log(`processQuery, INPUT: variable: ${variable}, parameter: ${parameter}`, ``);
    if (url.indexOf("?") != -1) {
        if (parameter == undefined) {
            console.log(`getQueryVariable, INPUT: variable: ${variable}`, ``);
            var query = url.split("?")[1];
            var vars = query.split("&");
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                if (pair[0] == variable) {
                    console.log(`getQueryVariable, OUTPUT: ${variable}=${pair[1]}`, ``);
                    return pair[1];
                }
            }
            console.log(`getQueryVariable, ERROR: No such variable: ${variable}, Skip`, ``);
            return false;
        } else if (parameter != undefined) {
            console.log(`replaceQueryParamter, INPUT: ${variable}=${parameter}, Start`, ``);
            var re = new RegExp('(' + variable + '=)([^&]*)', 'gi')
            var newUrl = url.replace(re, variable + '=' + parameter)
            console.log(`replaceQueryParamter, OUTPUT: ${variable}=${parameter}`, newUrl, ``);
            return newUrl
        } else {
            console.log(`processQuery, ERROR: No such variable: ${variable}, Skip`, ``);
            return url;
        }
    } else {
        console.log(`processQuery, ERROR: No such URL ,Skip`, url, ``);
        return url;
    }
};


//坐标转换
L.CoordConver = function () {

    /**百度转84*/
    this.bd09_To_gps84 = function(lng, lat) {
        var gcj02 = this.bd09_To_gcj02(lng, lat);
        var map84 = this.gcj02_To_gps84(gcj02.lng, gcj02.lat);
        return map84;
    }
    /**84转百度*/
    this.gps84_To_bd09 = function (lng, lat) {
        var gcj02 = this.gps84_To_gcj02(lng, lat);
        var bd09 = this.gcj02_To_bd09(gcj02.lng, gcj02.lat);
        return bd09;
    }
    /**84转火星*/
    this.gps84_To_gcj02 = function (lng, lat) {
        var dLat = transformLat(lng - 105.0, lat - 35.0);
        var dLng = transformLng(lng - 105.0, lat - 35.0);
        var radLat = lat / 180.0 * pi;
        var magic = Math.sin(radLat);
        magic = 1 - ee * magic * magic;
        var sqrtMagic = Math.sqrt(magic);
        dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
        dLng = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
        var mgLat = lat + dLat;
        var mgLng = lng + dLng;
        var newCoord = {
            lng: mgLng,
            lat: mgLat
        };
        return newCoord;
    }
    /**火星转84*/
    this.gcj02_To_gps84 = function (lng, lat) {
        var coord = transform(lng, lat);
        var lontitude = lng * 2 - coord.lng;
        var latitude = lat * 2 - coord.lat;
        var newCoord = {
            lng: lontitude,
            lat: latitude
        };
        return newCoord;
    }
    /**火星转百度*/
    this.gcj02_To_bd09 = function (x, y) {
        var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
        var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
        var bd_lng = z * Math.cos(theta) + 0.0065;
        var bd_lat = z * Math.sin(theta) + 0.006;
        var newCoord = {
            lng: bd_lng,
            lat: bd_lat
        };
        return newCoord;
    }
    /**百度转火星*/
    this.bd09_To_gcj02 = function (bd_lng, bd_lat) {
        var x = bd_lng - 0.0065;
        var y = bd_lat - 0.006;
        var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
        var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
        var gg_lng = z * Math.cos(theta);
        var gg_lat = z * Math.sin(theta);
        var newCoord = {
            lng: gg_lng,
            lat: gg_lat
        };
        return newCoord;
    }

    var pi = 3.1415926535897932384626;
    var a = 6378245.0;
    var ee = 0.00669342162296594323;
    var x_pi = pi * 3000.0 / 180.0;
    var R = 6378137;

    function transform(lng, lat) {
        var dLat = transformLat(lng - 105.0, lat - 35.0);
        var dLng = transformLng(lng - 105.0, lat - 35.0);
        var radLat = lat / 180.0 * pi;
        var magic = Math.sin(radLat);
        magic = 1 - ee * magic * magic;
        var sqrtMagic = Math.sqrt(magic);
        dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
        dLng = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
        var mgLat = lat + dLat;
        var mgLng = lng + dLng;
        var newCoord = {
            lng: mgLng,
            lat: mgLat
        };
        return newCoord;
    }

    function transformLat(x, y) {
        var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(y * pi) + 40.0 * Math.sin(y / 3.0 * pi)) * 2.0 / 3.0;
        ret += (160.0 * Math.sin(y / 12.0 * pi) + 320 * Math.sin(y * pi / 30.0)) * 2.0 / 3.0;
        return ret;
    }

    function transformLng(x, y) {
        var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(x * pi) + 40.0 * Math.sin(x / 3.0 * pi)) * 2.0 / 3.0;
        ret += (150.0 * Math.sin(x / 12.0 * pi) + 300.0 * Math.sin(x / 30.0 * pi)) * 2.0 / 3.0;
        return ret;
    }
}

L.coordConver = function () {
    return new L.CoordConver()
}

L.tileLayer.chinaProvider = function (type, options) {
    options = options || {}
    options.corrdType = getCorrdType(type);
    return new L.TileLayer.ChinaProvider(type, options);

    //获取坐标类型
    function getCorrdType(type) {
        var parts = type.split('.');
        var providerName = parts[0];
        var zbName = "wgs84"
        switch (providerName) {
            case "Geoq":
            case "GaoDe":
            case "Google":
                zbName = "gcj02";
                break;
            case "Baidu":
                zbName = "bd09";
                break;
            case "OSM":
            case "TianDiTu":
                zbName = "wgs84";
                break;
        }
        return zbName;
    }
};

L.GridLayer.include({
    _setZoomTransform: function (level, _center, zoom) {
        var center = _center;
        if (center != undefined && this.options) {
            if (this.options.corrdType == 'gcj02') {
                center = L.coordConver().gps84_To_gcj02(_center.lng, _center.lat);
            } else if (this.options.corrdType == 'bd09') {
                center = L.coordConver().gps84_To_bd09(_center.lng, _center.lat);
            }
        }
        var scale = this._map.getZoomScale(zoom, level.zoom),
            translate = level.origin.multiplyBy(scale)
            .subtract(this._map._getNewPixelOrigin(center, zoom)).round();

        if (L.Browser.any3d) {
            L.DomUtil.setTransform(level.el, translate, scale);
        } else {
            L.DomUtil.setPosition(level.el, translate);
        }
    },
    _getTiledPixelBounds: function (_center) {
        var center = _center;
        if (center != undefined && this.options) {
            if (this.options.corrdType == 'gcj02') {
                center = L.coordConver().gps84_To_gcj02(_center.lng, _center.lat);
            } else if (this.options.corrdType == 'bd09') {
                center = L.coordConver().gps84_To_bd09(_center.lng, _center.lat);
            }
        }
        var map = this._map,
            mapZoom = map._animatingZoom ? Math.max(map._animateToZoom, map.getZoom()) : map.getZoom(),
            scale = map.getZoomScale(mapZoom, this._tileZoom),
            pixelCenter = map.project(center, this._tileZoom).floor(),
            halfSize = map.getSize().divideBy(scale * 2);

        return new L.Bounds(pixelCenter.subtract(halfSize), pixelCenter.add(halfSize));
    }
})

/***************** Env *****************/
// prettier-ignore
// https://github.com/chavyleung/scripts/blob/master/Env.min.js
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){if(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:i,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:i,statusCode:r,headers:o,rawBody:h},s.decode(h,this.encoding))},t=>{const{message:i,response:r}=t;e(i,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let i=require("iconv-lite");this.initGotEnv(t);const{url:r,...o}=t;this.got[s](r,o).then(t=>{const{statusCode:s,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:s,statusCode:r,headers:o,rawBody:h},i.decode(h,this.encoding))},t=>{const{message:s,response:r}=t;e(s,r,r&&i.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,i=rawOpts["update-pasteboard"]||rawOpts.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":i}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
// https://github.com/gisarmory/Leaflet.InternetMapCorrection/blob/master/dist/leaflet.mapCorrection.min.js
// L.CoordConver=function(){function a(b,c){var d=-100+2*b+3*c+.2*c*c+.1*b*c+.2*Math.sqrt(Math.abs(b)),d=d+2*(20*Math.sin(6*b*e)+20*Math.sin(2*b*e))/3,d=d+2*(20*Math.sin(c*e)+40*Math.sin(c/3*e))/3;return d+=2*(160*Math.sin(c/12*e)+320*Math.sin(c*e/30))/3}function f(b,c){var d=300+b+2*c+.1*b*b+.1*b*c+.1*Math.sqrt(Math.abs(b)),d=d+2*(20*Math.sin(6*b*e)+20*Math.sin(2*b*e))/3,d=d+2*(20*Math.sin(b*e)+40*Math.sin(b/3*e))/3;return d+=2*(150*Math.sin(b/12*e)+300*Math.sin(b/30*e))/3}this.getCorrdType=function(b){var c="wgs84";switch(b.split(".")[0]){case "Geoq":case "GaoDe":case "Google":c="gcj02";break;case "Baidu":c="bd09";break;case "OSM":case "TianDiTu":c="wgs84"}return c};this.bd09_To_gps84=function(b,c){var d=this.bd09_To_gcj02(b,c);return this.gcj02_To_gps84(d.lng,d.lat)};this.gps84_To_bd09=function(b,c){var d=this.gps84_To_gcj02(b,c);return this.gcj02_To_bd09(d.lng,d.lat)};this.gps84_To_gcj02=function(b,c){var d=a(b-105,c-35),k=f(b-105,c-35),l=c/180*e,g=Math.sin(l),g=1-n*g*g,m=Math.sqrt(g),d=180*d/(h*(1-n)/(g*m)*e),k=180*k/(h/m*Math.cos(l)*e);return{lng:b+k,lat:c+d}};this.gcj02_To_gps84=function(b,c){var d=a(b-105,c-35),k=f(b-105,c-35),l=c/180*e,g=Math.sin(l),g=1-n*g*g,m=Math.sqrt(g),d=180*d/(h*(1-n)/(g*m)*e),k=180*k/(h/m*Math.cos(l)*e);return{lng:2*b-(b+k),lat:2*c-(c+d)}};this.gcj02_To_bd09=function(b,c){var d=Math.sqrt(b*b+c*c)+2E-5*Math.sin(c*p),a=Math.atan2(c,b)+3E-6*Math.cos(b*p);return{lng:d*Math.cos(a)+.0065,lat:d*Math.sin(a)+.006}};this.bd09_To_gcj02=function(b,c){var d=b-.0065,a=c-.006,e=Math.sqrt(d*d+a*a)-2E-5*Math.sin(a*p),d=Math.atan2(a,d)-3E-6*Math.cos(d*p);return{lng:e*Math.cos(d),lat:e*Math.sin(d)}};var e=3.141592653589793,h=6378245,n=.006693421622965943,p=3E3*e/180};L.coordConver=function(){return new L.CoordConver};L.TileLayer.ChinaProvider.include({addTo:function(a){a.options.corrdType||(a.options.corrdType=this.options.corrdType);a.addLayer(this);return this}});L.tileLayer.chinaProvider=function(a,f){f=f||{};f.corrdType=L.coordConver().getCorrdType(a);return new L.TileLayer.ChinaProvider(a,f)};L.GridLayer.include({_setZoomTransform:function(a,f,e){var h=f;void 0!=h&&this.options&&("gcj02"==this.options.corrdType?h=L.coordConver().gps84_To_gcj02(f.lng,f.lat):"bd09"==this.options.corrdType&&(h=L.coordConver().gps84_To_bd09(f.lng,f.lat)));f=this._map.getZoomScale(e,a.zoom);e=a.origin.multiplyBy(f).subtract(this._map._getNewPixelOrigin(h,e)).round();L.Browser.any3d?L.DomUtil.setTransform(a.el,e,f):L.DomUtil.setPosition(a.el,e)},_getTiledPixelBounds:function(a){var f=a;void 0!=f&&this.options&&("gcj02"==this.options.corrdType?f=L.coordConver().gps84_To_gcj02(a.lng,a.lat):"bd09"==this.options.corrdType&&(f=L.coordConver().gps84_To_bd09(a.lng,a.lat)));a=this._map;var e=a._animatingZoom?Math.max(a._animateToZoom,a.getZoom()):a.getZoom(),e=a.getZoomScale(e,this._tileZoom),f=a.project(f,this._tileZoom).floor();a=a.getSize().divideBy(2*e);return new L.Bounds(f.subtract(a),f.add(a))}});
