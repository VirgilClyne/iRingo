/*
README:https://github.com/VirgilClyne/iRingo
*/

const url = $request.url;
var newUrl = url

newUrl = replaceQueryParamter(newUrl, 'cc', 'TW');
newUrl = replaceQueryParamter(newUrl, 'card_locale', 'zh-Hans_CN');
if (getQueryVariable(newUrl, 'include') == 'tv') {
    let A = getQueryVariable(newUrl, 'q')
    newA = A.replace(/%2F[a-z]{2}-[A-Z]{2}/, '%2Fzh-TW')
    newUrl = replaceQueryParamter(newUrl, 'q', newA)
};
if (getQueryVariable(newUrl, 'include') == 'movies') {
    let A = getQueryVariable(newUrl, 'q')
    newA = A.replace(/%2F[a-z]{2}-[A-Z]{2}/, '%2Fzh-TW')
    newUrl = replaceQueryParamter(newUrl, 'q', newA)
};

$done(newUrl);


// 获取指定传入参数的值,url为链接,variable为参数
// https://community.nssurge.com/d/106-script/14
function getQueryVariable(url, variable) {
    if (url.indexOf("?") != -1) {
        var query = url.split("?")[1];
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] == variable) {
                return pair[1];
            }
        }
    } else return false;
};

// 替换指定传入参数的值,url为链接,variable为参数,parameter为新值

function replaceQueryParamter(url, variable, parameter) {
    if (url.indexOf("?") != -1) {
        var re = new RegExp('(' + variable + '=)([^&]*)', 'gi')
        var nUrl = url.replace(re, variable + '=' + parameter)
        console.log('replaceQueryParamter:' + nUrl)
        return nUrl
    } else return false;
};


// 查询并替换自身,url为链接,variable为参数,parameter为新值(如果有就替换)
function processQuery(url, variable, parameter) {
    if (url.indexOf("?") != -1) {
        var query = url.split("?")[1];
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] == variable) {
                if (parameter = undefined) {
                    console.log(variable + '=' + nUrl);
                    return pair[1];
                } else if (parameter != undefined) {
                    var re = new RegExp('(' + variable + '=)([^&]*)', 'gi')
                    nUrl = url.replace(re, variable + '=' + parameter)
                    console.log('replaceQueryParamter:' + nUrl)
                    return nUrl
                }
            }
        }
    } else return false;
};
