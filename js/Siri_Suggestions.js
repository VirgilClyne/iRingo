/*
README:https://github.com/VirgilClyne/iRingo
*/

var url = $request.url;
const locale = processQuery(url, 'locale'); //Region Setting
const esl = processQuery(url, 'esl'); //Environment System Language? :Display Language Setting
const card_locale = locale //Infomation Card Locale, Redirect to Region Setting
//const siri_locale = processQuery(url, 'siri_locale'); //Siri Locale Setting
const storefront = processQuery(url, 'storefront') //StoreFront Setting, from App Store Region
if (storefront) var sf = storefront.match(/[\d]{6}/g) //StoreFront ID, from App Store Region
if (locale) var cc = locale.match(/[A-Z]{2}/g) //CountryCode, Redirect to Region Setting
console.log(`locale=${locale}, cc=${cc}, card_locale=${card_locale}, storefront=${storefront}`, ``);

const path0 = "smoot.apple.cn";
const path1 = "/bag?";
const path2 = "/search?";
const path3 = "/card?";

// URL
if (url.indexOf(path0) != -1) url.replace(/smoot\.apple\.cn/g, 'smoot.apple.com');

// PATH
if (url.indexOf(path1) != -1) {
    url = (cc == 'CN') ? processQuery(url, 'cc', 'TW') : processQuery(url, 'cc', cc);
    $done({ url });
}
else if (url.indexOf(path2) != -1) {
    url = (cc == 'CN') ? processQuery(url, 'cc', 'TW') : processQuery(url, 'cc', cc);
    if (processQuery(url, 'qtype') == 'zkw') {
        if ([US, CA, UK, AU].some(_ => _ != cc)) processQuery(url, 'local', `${esl}_US`)
    } else {
    url = processQuery(url, 'card_locale', card_locale);
    //url = processQuery(url, 'storefront', '143464-19%2C29'); //SG
    //url = processQuery(url, 'storefront', '143441-19%2C29'); //US
    };
    $done({ url });
}
else if (url.indexOf(path3) != -1) {
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
