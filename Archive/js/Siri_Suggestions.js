/*
README:https://github.com/VirgilClyne/iRingo
*/

var url = $request.url;
const locale = processQuery(url, 'locale'); //Region Setting
if (locale) var cc = locale.match(/[A-Z]{2}/g) //CountryCode, Redirect to Region Setting
const esl = processQuery(url, 'esl'); //Environment System Language? :Display Language Setting
const qtype = processQuery(url, 'qtype'); //Search Type
const card_locale = locale //Infomation Card Locale, Redirect to Region Setting
const siri_locale = processQuery(url, 'siri_locale'); //Siri Locale Setting
const storefront = processQuery(url, 'storefront') //StoreFront Setting, from App Store Region
if (storefront) var sf = storefront.match(/[\d]{6}/g) //StoreFront ID, from App Store Region

console.log(`Start, locale=${locale}, cc=${cc}, esl=${esl}, card_locale=${card_locale}, storefront=${storefront}`, ``);

const url0 = "smoot.apple.cn";
const path1 = "/bag?";
const path2 = "/search?";
const path3 = "/card?";

// URL
if (url.indexOf(url0) != -1) url.replace(/smoot\.apple\.cn/g, 'smoot.apple.com'); //Redirect .cn to .com

// PATH
if (url.indexOf(path1) != -1) { //Bag
    url = (cc == 'CN') ? processQuery(url, 'cc', 'TW') : processQuery(url, 'cc', cc);
    console.log(path1, `locale=${locale}, cc=${cc}`, ``);
    $done({ url });
}
else if (url.indexOf(path2) != -1) { //Search
    url = (cc == 'CN') ? processQuery(url, 'cc', 'TW') : processQuery(url, 'cc', cc);
    if (qtype == 'zkw') { // 处理'新闻'小组件
        ['CN', 'HK', 'MO', 'TW', 'SG'].includes(`${cc}`) ? url = processQuery(url, 'locale', `${esl}_SG`)
            : ['US', 'CA', 'UK', 'AU'].includes(`${cc}`) ? url = processQuery(url, 'locale')
                : url = processQuery(url, 'locale', `${esl}_US`);
    } else { // 其他搜索
        let q = processQuery(url, 'q')
        if (q.match(/^%E5%A4%A9%E6%B0%94%20/)) { // 处理'天气'搜索，搜索词'天气 '开头
            console.log('Type A', ``);
            q = q.replace(/%E5%A4%A9%E6%B0%94/, 'weather') // '天气'替换为'weather'
            if (q.match(/^weather%20.*%E5%B8%82$/) == null) q = q.replace(/$/, '%E5%B8%82')
            url = processQuery(url, 'q', q)
        } else if (q.match(/%20%E5%A4%A9%E6%B0%94$/)) {// 处理'天气'搜索，搜索词' 天气'结尾
            console.log('Type B', ``);
            q = q.replace(/%E5%A4%A9%E6%B0%94/, 'weather') // '天气'替换为'weather'
            if (q.match(/.*%E5%B8%82%20weather$/) == null) q = q.replace(/%20weather$/, '%E5%B8%82%20weather')
            url = processQuery(url, 'q', q)
        } 
        url = processQuery(url, 'card_locale', card_locale);
        //url = processQuery(url, 'storefront', '143464-19%2C29'); //SG
        //url = processQuery(url, 'storefront', '143441-19%2C29'); //US
    };
    console.log(path2, `locale=${locale}, cc=${cc}, qtype=${qtype}, card_locale=${card_locale}`, ``);
    $done({ url });
}
else if (url.indexOf(path3) != -1) { //Card
    url = (cc == 'CN') ? processQuery(url, 'cc', 'TW') : processQuery(url, 'cc', cc);
    url = processQuery(url, 'card_locale', card_locale);
    //url = processQuery(url, 'storefront', '143464-19%2C29'); //SG
    //url = processQuery(url, 'storefront', '143441-19%2C29'); //US
    if (processQuery(url, 'include') == 'movies') {
        let A = processQuery(url, 'q')
        if (sf == '143463') newA = A.replace(/%2F[a-z]{2}-[A-Z]{2}/, '%2Fzh-HK')
        else if (sf == '143470') newA = A.replace(/%2F[a-z]{2}-[A-Z]{2}/, '%2Fzh-TW')
        else if (sf == '143464') newA = A.replace(/%2F[a-z]{2}-[A-Z]{2}/, '%2Fzh-SG')
        else newA = A
        url = processQuery(url, 'q', newA)
    }
    else if (processQuery(url, 'include') == 'tv') {
        let A = processQuery(url, 'q')
        if (sf == '143463') newA = A.replace(/%2F[a-z]{2}-[A-Z]{2}/, '%2Fzh-HK')
        else if (sf == '143470') newA = A.replace(/%2F[a-z]{2}-[A-Z]{2}/, '%2Fzh-TW')
        else if (sf == '143464') newA = A.replace(/%2F[a-z]{2}-[A-Z]{2}/, '%2Fzh-SG')
        else newA = A
        url = processQuery(url, 'q', newA)
    };
    console.log(path3, `locale=${locale}, cc=${cc}, card_locale=${card_locale}, storefront=${storefront}`, ``);
    $done({ url });
}
else $done({});

// Function 1
// process Query URL
// 查询并替换自身,url为链接,variable为参数,parameter为新值(如果有就替换)
// https://github.com/VirgilClyne/iRingo/blob/main/js/QueryURL.js
function processQuery(url, variable, parameter) {
    //console.log(`processQuery, INPUT: variable: ${variable}, parameter: ${parameter}`, url, ``);
    if (url.indexOf("?") != -1) {
        if (parameter == undefined) {
            //console.log(`getQueryVariable, INPUT: variable: ${variable}`, ``);
            var query = url.split("?")[1];
            var vars = query.split("&");
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                if (pair[0] == variable) {
                    //console.log(`getQueryVariable, OUTPUT: ${variable}=${pair[1]}`, ``);
                    return pair[1];
                }
            }
            console.log(`getQueryVariable, ERROR: No such variable: ${variable}, Skip`, ``);
            return false;
        } else {
            //console.log(`replaceQueryParamter, INPUT: ${variable}=${parameter}, Start`, ``);
            var re = new RegExp('(' + variable + '=)([^&]*)', 'gi')
            var newUrl = url.replace(re, variable + '=' + parameter)
            //console.log(`replaceQueryParamter, OUTPUT: ${variable}=${parameter}`, newUrl, ``);
            return newUrl
        };
    } else {
        console.log(`processQuery, ERROR: No such URL ,Skip`, url, ``);
        return url;
    }
};
