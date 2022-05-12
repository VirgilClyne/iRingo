/*
README:https://github.com/VirgilClyne/iRingo
*/
var url = $request.url;

if (processQuery(url, variable0) == "parameter0") {
    processQuery(url, variable1, parameter1)
    processQuery(url, variable2, parameter2)
}
processQuery(url, variable3, parameter3)
processQuery(url, variable4, parameter4)
processQuery(url, variable5, parameter5)

$done({ url });

// Function 1
// process Query URL
// 查询并替换自身,url为链接,variable为参数,parameter为新值(如果有就替换)
// 合成下面两者，完整版
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
        } else {
            console.log(`replaceQueryParamter, INPUT: ${variable}=${parameter}, Start`, ``);
            var re = new RegExp('(' + variable + '=)([^&]*)', 'gi')
            var newUrl = url.replace(re, variable + '=' + parameter)
            console.log(`replaceQueryParamter, OUTPUT: ${variable}=${parameter}`, newUrl, ``);
            return newUrl
        };
    } else {
        console.log(`processQuery, ERROR: No such URL ,Skip`, url, ``);
        return url;
    }
};

// Function 1.1
// 获取指定传入参数的值,url为链接,variable为参数
// https://community.nssurge.com/d/106-script/14
function getQueryVariable(url, variable) {
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
};

// Function 1.2
// 替换指定传入参数的值,url为链接,variable为参数,parameter为新值
// 不知道哪儿看到的了
function replaceQueryParamter(url, variable, parameter) {
    console.log(`replaceQueryParamter, INPUT: ${variable}=${parameter}, Start`, ``);
    var re = new RegExp('(' + variable + '=)([^&]*)', 'gi')
    var newUrl = url.replace(re, variable + '=' + parameter)
    console.log(`replaceQueryParamter, OUTPUT: ${variable}=${parameter}`, newUrl, ``);
    return newUrl
};
