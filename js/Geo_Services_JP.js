/*
README:https://github.com/VirgilClyne/iRingo
*/

const url = $request.url;
var body = $response.body;

const path1 = "/pep/gcc";

if (url.indexOf(path1) != -1) {
    let obj = body; 
        obj = "JP";
    body = obj;
};

$done({body});
