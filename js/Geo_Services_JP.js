/*
README:https://github.com/VirgilClyne/iRingo
*/

const url = $request.url;
var body = $response.body;

const path1 = "/pep/gcc";

if (url.indexOf(path1) != -1) body = "JP";

$done({body});
