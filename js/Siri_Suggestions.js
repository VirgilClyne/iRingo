/*
README:https://github.com/VirgilClyne/iRingo
*/

var url = $request.url;

const path1 = "/bag?";
const path2 = "/search?";
const path3 = "/card?";

if (url.indexOf(path1) != -1) {
    url = processQuery(url, 'cc', 'TW');
    $done({ url });
}
else if (url.indexOf(path2) != -1) {
    url = processQuery(url, 'cc', 'TW');
    url = processQuery(url, 'card_locale', 'zh-Hans_CN');
    //url = processQuery(url, 'storefront', '143464-19%2C29'); //SG
    //url = processQuery(url, 'storefront', '143441-19%2C29'); //US
    $done({ url });
}
else if (url.indexOf(path3) != -1) {
    url = processQuery(url, 'cc', 'TW');
    url = processQuery(url, 'card_locale', 'zh-Hans_CN');
    //url = processQuery(url, 'storefront', '143464-19%2C29'); //SG
    //url = processQuery(url, 'storefront', '143441-19%2C29'); //US
    if (processQuery(url, 'include') == 'movies') {
        let A = processQuery(url, 'q')
        if (processQuery(url, 'storefront').indexOf('143463') != -1) newA = A.replace(/%2F[a-z]{2}-[A-Z]{2}/, '%2Fzh-HK')
        else if (processQuery(url, 'storefront').indexOf('143470') != -1) newA = A.replace(/%2F[a-z]{2}-[A-Z]{2}/, '%2Fzh-TW')
        else if (processQuery(url, 'storefront').indexOf('143464') != -1) newA = A.replace(/%2F[a-z]{2}-[A-Z]{2}/, '%2Fzh-SG')
        else newA = A
        url = processQuery(url, 'q', newA)
    }
    else if (processQuery(url, 'include') == 'tv') {
        let A = processQuery(url, 'q')
        if (processQuery(url, 'storefront').indexOf('143463') != -1) newA = A.replace(/%2F[a-z]{2}-[A-Z]{2}/, '%2Fzh-HK')
        else if (processQuery(url, 'storefront').indexOf('143470') != -1) newA = A.replace(/%2F[a-z]{2}-[A-Z]{2}/, '%2Fzh-TW')
        else if (processQuery(url, 'storefront').indexOf('143464') != -1) newA = A.replace(/%2F[a-z]{2}-[A-Z]{2}/, '%2Fzh-SG')
        else newA = A
        url = processQuery(url, 'q', newA)
    };
    $done({ url });
}
else $done({});


// 查询并替换自身,url为链接,variable为参数,parameter为新值(如果有就替换)
// https://github.com/VirgilClyne/iRingo/blob/main/js/QueryURL.js
function processQuery(url, variable, parameter) {
    console.log(`processQuery, INPUT: variable: ${variable}, parameter: ${parameter}`, url, ``);
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
