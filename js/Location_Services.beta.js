// 判断是否是重写
const isRequest = typeof $request != "undefined";
const isResponse = typeof $response != "undefined";
// 判断是否是Surge
const isSurge = typeof $httpClient != "undefined";
// 判断是否是QuanX
const isQuanX = typeof $task != "undefined";
// 判断是否是Loon
const isLoon = typeof $loon != "undefined";
// 关闭请求
const done = (value = {}) => {
  if (isQuanX) return $done(value);
  if (isSurge) isRequest ? $done(value) : $done();
};

/*
README:https://github.com/VirgilClyne/iRingo
*/

// Default GeoCountryCode: US
let GeoCountryCode = "US";
// Default Location Services Configs (test)
//let GEOAddressCorrectionEnabled = true;
//let ShouldEnableLagunaBeach = true;
//let PedestrianAREnabled = true;

// Argument Function Supported
if (typeof $argument != "undefined") {
  let arg = Object.fromEntries($argument.split("&").map((item) => item.split("=")));
  console.log(JSON.stringify(arg));
  //GeoCountryCode = arg.GeoCountryCode;
  //EnableAlberta = arg.EnableAlberta;
  //GEOAddressCorrectionEnabled = arg.GEOAddressCorrectionEnabled;
  //ShouldEnableLagunaBeach = arg.ShouldEnableLagunaBeach;
  //PedestrianAREnabled = arg.PedestrianAREnabled;
};

const url = $request.url;

const path0 = "/config/defaults";
const path1 = "/pep/gcc";

if (url.indexOf(path0) != -1) {
  console.log(path0);
  if (isRequest && !isResponse) {
    var headers = $request.headers;
    headers['If-None-Match'] = '';
    done({ headers });
  }
  if (isResponse) {
    var body = $response.body;
    // Create a new instance of the parser with your input
    plist = new p2js(body);

    // Validate the input
    if (plist.validate()) {
      // Parse the input, returning a JS object
      config = plist.parse();
    }
    //config = body.replace(variable, parameter);

    done({ config });
  }
};


if (url.indexOf(path1) != -1) {
  console.log(path1);
  var today = new Date();
  var UTCstring = today.toUTCString();
  var response = {};
  response.headers = {
    'Content-Type': 'text/html',
    'Date': UTCstring,
    'Connection': 'keep-alive',
    'Content-Encoding': 'identity'
  };
  response.body = GeoCountryCode;
  if (isQuanX) {
    response.status = "HTTP/1.1 200 OK";
    done(response);
  }
  if (isSurge || isLoon) {
    response.status = 200;
    done({ response });
  }
} else done();

/***************** PlistParser *****************/
// prettier-ignore
function p2js(input) {
  var input = $('#input').val();
  var plist = $.parseXML(input);
  console.log("before:" + plist);
  plist = cleanWhitespace(plist);
  console.log("after:" + plist);
  var json = parsePlist(plist);
  console.log("json:" + json);
  var formatted = JSON.stringify(json, null, 4);
  return formatted
}

cleanWhitespace = function (element) {
  console.log(element);
  console.log(element.childNodes);
  if (element.childNodes !== undefined) {
    for (var i = 0; i < element.childNodes.length; i++) {
      var node = element.childNodes[i];
      console.log("n:" + node);
      if (node.nodeType == 3 && !/\S/.test(node.nodeValue)) {
        console.log("removing node");
        element.remove(node);
      }
    }
  }
  return element;
}

parsePlist = function (plistDoc) {
  var doc = plistDoc.childNodes[1];
  // main dict
  var dict = doc.childNodes[1];
  console.log(dict);

  for (i in dict.childNodes) {
    node = dict.childNodes[i];
    console.log("n:" + node);
  }

  return parsePlistValue(dict);
}

parsePlistDict = function (dictNode) {
  var result = new Object();
  var keyNodes = dictNode.getElementsByTagName("key");
  for (var i = 0, n = keyNodes.length; i < n; i++) {
    var key = keyNodes[i].firstChild.nodeValue;
    var val = parsePlistValue(keyNodes[i].nextSibling.nextSibling);
    result[key] = val;
  }
  return result;
}

parsePlistValue = function (valueNode) {
  var result = null;
  switch (valueNode.nodeName) {
    case "true":
      result = true;
      break;
    case "false":
      result = false;
      break;
    case "string":
      if (valueNode.firstChild != undefined) {
        result = valueNode.firstChild.nodeValue;
        // result = unescape(result);
        // result = result.replace(/\+/g, " ");
      }
      console.log("string value not defined");
      break;
    case "dict":
      result = parsePlistDict(valueNode);
      break;
    case "array":
      result = [];
      for (var i = 0, n = valueNode.childNodes.length; i < n; i++) {
        node = valueNode.childNodes[i];
        if (/\S/.test(node.nodeValue)) {
          result.push(parsePlistValue(node));
        }
      }
      break;
    default:
      console.log("ERROR can't parse " + valueNode.nodeName + " of type " + valueNode.nodeType);
  }
  return result;
}
