/* README: https://github.com/VirgilClyne/iRingo */
console.log(' iRingo: 🌤 WeatherKit β Response')
const $platform = platform();
function platform() {
    if ("undefined" !== typeof $environment && $environment["surge-version"])
        return "Surge"
    if ("undefined" !== typeof $environment && $environment["stash-version"])
        return "Stash"
    if ("undefined" !== typeof module && !!module.exports) return "Node.js"
    if ("undefined" !== typeof $task) return "Quantumult X"
    if ("undefined" !== typeof $loon) return "Loon"
    if ("undefined" !== typeof $rocket) return "Shadowrocket"
    if ("undefined" !== typeof Egern) return "Egern"
}

/* https://www.lodashjs.com */
class Lodash {
	static name = "Lodash";
	static version = "1.2.2";
	static about() { return console.log(`\n🟧 ${this.name} v${this.version}\n`) };

	static get(object = {}, path = "", defaultValue = undefined) {
		// translate array case to dot case, then split with .
		// a[0].b -> a.0.b -> ['a', '0', 'b']
		if (!Array.isArray(path)) path = this.toPath(path);

		const result = path.reduce((previousValue, currentValue) => {
			return Object(previousValue)[currentValue]; // null undefined get attribute will throwError, Object() can return a object 
		}, object);
		return (result === undefined) ? defaultValue : result;
	}

	static set(object = {}, path = "", value) {
		if (!Array.isArray(path)) path = this.toPath(path);
		path
			.slice(0, -1)
			.reduce(
				(previousValue, currentValue, currentIndex) =>
					(Object(previousValue[currentValue]) === previousValue[currentValue])
						? previousValue[currentValue]
						: previousValue[currentValue] = (/^\d+$/.test(path[currentIndex + 1]) ? [] : {}),
				object
			)[path[path.length - 1]] = value;
		return object
	}

	static unset(object = {}, path = "") {
		if (!Array.isArray(path)) path = this.toPath(path);
		let result = path.reduce((previousValue, currentValue, currentIndex) => {
			if (currentIndex === path.length - 1) {
				delete previousValue[currentValue];
				return true
			}
			return Object(previousValue)[currentValue]
		}, object);
		return result
	}

	static toPath(value) {
		return value.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
	}

	static escape(string) {
		const map = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#39;',
		};
		return string.replace(/[&<>"']/g, m => map[m])
	};

	static unescape(string) {
		const map = {
			'&amp;': '&',
			'&lt;': '<',
			'&gt;': '>',
			'&quot;': '"',
			'&#39;': "'",
		};
		return string.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, m => map[m])
	}

}

/* https://developer.mozilla.org/zh-CN/docs/Web/API/Storage/setItem */
class Storage {
	static name = "Storage";
	static version = "1.1.0";
	static about () { return log("", `🟧 ${this.name} v${this.version}`, "") };
	static data = null;
	static dataFile = 'box.dat';
	static #nameRegex = /^@(?<key>[^.]+)(?:\.(?<path>.*))?$/;

    static getItem(keyName = new String, defaultValue = null) {
        let keyValue = defaultValue;
        // 如果以 @
		switch (keyName.startsWith('@')) {
			case true:
				const { key, path } = keyName.match(this.#nameRegex)?.groups;
				//log(`1: ${key}, ${path}`);
				keyName = key;
				let value = this.getItem(keyName, {});
				//log(`2: ${JSON.stringify(value)}`)
				if (typeof value !== "object") value = {};
				//log(`3: ${JSON.stringify(value)}`)
				keyValue = Lodash.get(value, path);
				//log(`4: ${JSON.stringify(keyValue)}`)
				try {
					keyValue = JSON.parse(keyValue);
				} catch (e) {
					// do nothing
				}				//log(`5: ${JSON.stringify(keyValue)}`)
				break;
			default:
				switch ($platform) {
					case 'Surge':
					case 'Loon':
					case 'Stash':
					case 'Egern':
					case 'Shadowrocket':
						keyValue = $persistentStore.read(keyName);
						break;
					case 'Quantumult X':
						keyValue = $prefs.valueForKey(keyName);
						break;
					case 'Node.js':
						this.data = this.#loaddata(this.dataFile);
						keyValue = this.data?.[keyName];
						break;
					default:
						keyValue = this.data?.[keyName] || null;
						break;
				}				try {
					keyValue = JSON.parse(keyValue);
				} catch (e) {
					// do nothing
				}				break;
		}		return keyValue ?? defaultValue;
    };

	static setItem(keyName = new String, keyValue = new String) {
		let result = false;
		//log(`0: ${typeof keyValue}`);
		switch (typeof keyValue) {
			case "object":
				keyValue = JSON.stringify(keyValue);
				break;
			default:
				keyValue = String(keyValue);
				break;
		}		switch (keyName.startsWith('@')) {
			case true:
				const { key, path } = keyName.match(this.#nameRegex)?.groups;
				//log(`1: ${key}, ${path}`);
				keyName = key;
				let value = this.getItem(keyName, {});
				//log(`2: ${JSON.stringify(value)}`)
				if (typeof value !== "object") value = {};
				//log(`3: ${JSON.stringify(value)}`)
				Lodash.set(value, path, keyValue);
				//log(`4: ${JSON.stringify(value)}`)
				result = this.setItem(keyName, value);
				//log(`5: ${result}`)
				break;
			default:
				switch ($platform) {
					case 'Surge':
					case 'Loon':
					case 'Stash':
					case 'Egern':
					case 'Shadowrocket':
						result = $persistentStore.write(keyValue, keyName);
						break;
					case 'Quantumult X':
						result =$prefs.setValueForKey(keyValue, keyName);
						break;
					case 'Node.js':
						this.data = this.#loaddata(this.dataFile);
						this.data[keyName] = keyValue;
						this.#writedata(this.dataFile);
						result = true;
						break;
					default:
						result = this.data?.[keyName] || null;
						break;
				}				break;
		}		return result;
	};

    static removeItem(keyName){
		let result = false;
		switch (keyName.startsWith('@')) {
			case true:
				const { key, path } = keyName.match(this.#nameRegex)?.groups;
				keyName = key;
				let value = this.getItem(keyName);
				if (typeof value !== "object") value = {};
				keyValue = Lodash.unset(value, path);
				result = this.setItem(keyName, value);
				break;
			default:
				switch ($platform) {
					case 'Surge':
					case 'Loon':
					case 'Stash':
					case 'Egern':
					case 'Shadowrocket':
						result = false;
						break;
					case 'Quantumult X':
						result = $prefs.removeValueForKey(keyName);
						break;
					case 'Node.js':
						result = false;
						break;
					default:
						result = false;
						break;
				}				break;
		}		return result;
    }

    static clear() {
		let result = false;
		switch ($platform) {
			case 'Surge':
			case 'Loon':
			case 'Stash':
			case 'Egern':
			case 'Shadowrocket':
				result = false;
				break;
			case 'Quantumult X':
				result = $prefs.removeAllValues();
				break;
			case 'Node.js':
				result = false;
				break;
			default:
				result = false;
				break;
		}		return result;
    }

	static #loaddata(dataFile) {
		if (this.isNode()) {
			this.fs = this.fs ? this.fs : require('fs');
			this.path = this.path ? this.path : require('path');
			const curDirDataFilePath = this.path.resolve(dataFile);
			const rootDirDataFilePath = this.path.resolve(
				process.cwd(),
				dataFile
			);
			const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath);
			const isRootDirDataFile =
				!isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath);
			if (isCurDirDataFile || isRootDirDataFile) {
				const datPath = isCurDirDataFile
					? curDirDataFilePath
					: rootDirDataFilePath;
				try {
					return JSON.parse(this.fs.readFileSync(datPath))
				} catch (e) {
					return {}
				}
			} else return {}
		} else return {}
	}

	static #writedata(dataFile = this.dataFile) {
		if (this.isNode()) {
			this.fs = this.fs ? this.fs : require('fs');
			this.path = this.path ? this.path : require('path');
			const curDirDataFilePath = this.path.resolve(dataFile);
			const rootDirDataFilePath = this.path.resolve(
				process.cwd(),
				dataFile
			);
			const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath);
			const isRootDirDataFile =
				!isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath);
			const jsondata = JSON.stringify(this.data);
			if (isCurDirDataFile) {
				this.fs.writeFileSync(curDirDataFilePath, jsondata);
			} else if (isRootDirDataFile) {
				this.fs.writeFileSync(rootDirDataFilePath, jsondata);
			} else {
				this.fs.writeFileSync(curDirDataFilePath, jsondata);
			}
		}
	};

}

function initGotEnv(opts) {
    this.got = this.got ? this.got : require("got");
    this.cktough = this.cktough ? this.cktough : require("tough-cookie");
    this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar();
    if (opts) {
        opts.headers = opts.headers ? opts.headers : {};
        if (undefined === opts.headers.Cookie && undefined === opts.cookieJar) {
            opts.cookieJar = this.ckjar;
        }
    }}

async function fetch(request = {} || "", option = {}) {
    // 初始化参数
    switch (request.constructor) {
        case Object:
            request = { ...option, ...request };
            break;
        case String:
            request = { ...option, "url": request };
            break;
    }    // 自动判断请求方法
    if (!request.method) {
        request.method = "GET";
        if (request.body ?? request.bodyBytes) request.method = "POST";
    }    // 移除请求头中的部分参数, 让其自动生成
    delete request.headers?.Host;
    delete request.headers?.[":authority"];
    delete request.headers?.["Content-Length"];
    delete request.headers?.["content-length"];
    // 定义请求方法（小写）
    const method = request.method.toLocaleLowerCase();
    // 判断平台
    switch ($platform) {
        case "Loon":
        case "Surge":
        case "Stash":
        case "Egern":
        case "Shadowrocket":
        default:
            // 转换请求参数
            if (request.timeout) {
                request.timeout = parseInt(request.timeout, 10);
                switch ($platform) {
                    case "Loon":
                    case "Shadowrocket":
                    case "Stash":
                    case "Egern":
                    default:
                        request.timeout = request.timeout / 1000;
                        break;
                    case "Surge":
                        break;
                }            }            if (request.policy) {
                switch ($platform) {
                    case "Loon":
                        request.node = request.policy;
                        break;
                    case "Stash":
                        Lodash.set(request, "headers.X-Stash-Selected-Proxy", encodeURI(request.policy));
                        break;
                    case "Shadowrocket":
                        Lodash.set(request, "headers.X-Surge-Proxy", request.policy);
                        break;
                }            }            if (typeof request.redirection === "boolean") request["auto-redirect"] = request.redirection;
            // 转换请求体
            if (request.bodyBytes && !request.body) {
                request.body = request.bodyBytes;
                delete request.bodyBytes;
            }            // 发送请求
            return await new Promise((resolve, reject) => {
                $httpClient[method](request, (error, response, body) => {
                    if (error) reject(error);
                    else {
                        response.ok = /^2\d\d$/.test(response.status);
                        response.statusCode = response.status;
                        if (body) {
                            response.body = body;
                            if (request["binary-mode"] == true) response.bodyBytes = body;
                        }                        resolve(response);
                    }
                });
            });
        case "Quantumult X":
            // 转换请求参数
            if (request.policy) Lodash.set(request, "opts.policy", request.policy);
            if (typeof request["auto-redirect"] === "boolean") Lodash.set(request, "opts.redirection", request["auto-redirect"]);
            // 转换请求体
            if (request.body instanceof ArrayBuffer) {
                request.bodyBytes = request.body;
                delete request.body;
            } else if (ArrayBuffer.isView(request.body)) {
                request.bodyBytes = request.body.buffer.slice(request.body.byteOffset, request.body.byteLength + request.body.byteOffset);
                delete object.body;
            } else if (request.body) delete request.bodyBytes;
            // 发送请求
            return await $task.fetch(request).then(
                response => {
                    response.ok = /^2\d\d$/.test(response.statusCode);
                    response.status = response.statusCode;
                    return response;
                },
                reason => Promise.reject(reason.error));
        case "Node.js":
            let iconv = require("iconv-lite");
            initGotEnv(request);
            const { url, ...option } = request;
            return await this.got[method](url, option)
                .on("redirect", (response, nextOpts) => {
                    try {
                        if (response.headers["set-cookie"]) {
                            const ck = response.headers["set-cookie"]
                                .map(this.cktough.Cookie.parse)
                                .toString();
                            if (ck) {
                                this.ckjar.setCookieSync(ck, null);
                            }
                            nextOpts.cookieJar = this.ckjar;
                        }
                    } catch (e) {
                        this.logErr(e);
                    }
                    // this.ckjar.setCookieSync(response.headers["set-cookie"].map(Cookie.parse).toString())
                })
                .then(
                    response => {
                        response.statusCode = response.status;
                        response.body = iconv.decode(response.rawBody, "utf-8");
                        response.bodyBytes = response.rawBody;
                        return response;
                    },
                    error => Promise.reject(error.message));
    }}

function logError(error) {
    switch ($platform) {
        case "Surge":
        case "Loon":
        case "Stash":
        case "Egern":
        case "Shadowrocket":
        case "Quantumult X":
        default:
            log("", `❗️执行错误!`, error, "");
            break
        case "Node.js":
            log("", `❗️执行错误!`, error.stack, "");
            break
    }}

function done(object = {}) {
    log("", `🚩 执行结束!`, "");
    switch ($platform) {
        case "Surge":
            if (object.policy) Lodash.set(object, "headers.X-Surge-Policy", object.policy);
            $done(object);
            break;
        case "Loon":
            if (object.policy) object.node = object.policy;
            $done(object);
            break;
        case "Stash":
            if (object.policy) Lodash.set(object, "headers.X-Stash-Selected-Proxy", encodeURI(object.policy));
            $done(object);
            break;
        case "Egern":
            $done(object);
            break;
        case "Shadowrocket":
        default:
            $done(object);
            break;
        case "Quantumult X":
            if (object.policy) Lodash.set(object, "opts.policy", object.policy);
            // 移除不可写字段
            delete object["auto-redirect"];
            delete object["auto-cookie"];
            delete object["binary-mode"];
            delete object.charset;
            delete object.host;
            delete object.insecure;
            delete object.method; // 1.4.x 不可写
            delete object.opt; // $task.fetch() 参数, 不可写
            delete object.path; // 可写, 但会与 url 冲突
            delete object.policy;
            delete object["policy-descriptor"];
            delete object.scheme;
            delete object.sessionIndex;
            delete object.statusCode;
            delete object.timeout;
            if (object.body instanceof ArrayBuffer) {
                object.bodyBytes = object.body;
                delete object.body;
            } else if (ArrayBuffer.isView(object.body)) {
                object.bodyBytes = object.body.buffer.slice(object.body.byteOffset, object.body.byteLength + object.body.byteOffset);
                delete object.body;
            } else if (object.body) delete object.bodyBytes;
            $done(object);
            break;
        case "Node.js":
            process.exit(1);
            break;
    }
}

const log = (...logs) => console.log(logs.join("\n"));

var Settings$8 = {
	Switch: true
};
var Configs$4 = {
	Storefront: [
		[
			"AE",
			"143481"
		],
		[
			"AF",
			"143610"
		],
		[
			"AG",
			"143540"
		],
		[
			"AI",
			"143538"
		],
		[
			"AL",
			"143575"
		],
		[
			"AM",
			"143524"
		],
		[
			"AO",
			"143564"
		],
		[
			"AR",
			"143505"
		],
		[
			"AT",
			"143445"
		],
		[
			"AU",
			"143460"
		],
		[
			"AZ",
			"143568"
		],
		[
			"BA",
			"143612"
		],
		[
			"BB",
			"143541"
		],
		[
			"BD",
			"143490"
		],
		[
			"BE",
			"143446"
		],
		[
			"BF",
			"143578"
		],
		[
			"BG",
			"143526"
		],
		[
			"BH",
			"143559"
		],
		[
			"BJ",
			"143576"
		],
		[
			"BM",
			"143542"
		],
		[
			"BN",
			"143560"
		],
		[
			"BO",
			"143556"
		],
		[
			"BR",
			"143503"
		],
		[
			"BS",
			"143539"
		],
		[
			"BT",
			"143577"
		],
		[
			"BW",
			"143525"
		],
		[
			"BY",
			"143565"
		],
		[
			"BZ",
			"143555"
		],
		[
			"CA",
			"143455"
		],
		[
			"CD",
			"143613"
		],
		[
			"CG",
			"143582"
		],
		[
			"CH",
			"143459"
		],
		[
			"CI",
			"143527"
		],
		[
			"CL",
			"143483"
		],
		[
			"CM",
			"143574"
		],
		[
			"CN",
			"143465"
		],
		[
			"CO",
			"143501"
		],
		[
			"CR",
			"143495"
		],
		[
			"CV",
			"143580"
		],
		[
			"CY",
			"143557"
		],
		[
			"CZ",
			"143489"
		],
		[
			"DE",
			"143443"
		],
		[
			"DK",
			"143458"
		],
		[
			"DM",
			"143545"
		],
		[
			"DO",
			"143508"
		],
		[
			"DZ",
			"143563"
		],
		[
			"EC",
			"143509"
		],
		[
			"EE",
			"143518"
		],
		[
			"EG",
			"143516"
		],
		[
			"ES",
			"143454"
		],
		[
			"FI",
			"143447"
		],
		[
			"FJ",
			"143583"
		],
		[
			"FM",
			"143591"
		],
		[
			"FR",
			"143442"
		],
		[
			"GA",
			"143614"
		],
		[
			"GB",
			"143444"
		],
		[
			"GD",
			"143546"
		],
		[
			"GF",
			"143615"
		],
		[
			"GH",
			"143573"
		],
		[
			"GM",
			"143584"
		],
		[
			"GR",
			"143448"
		],
		[
			"GT",
			"143504"
		],
		[
			"GW",
			"143585"
		],
		[
			"GY",
			"143553"
		],
		[
			"HK",
			"143463"
		],
		[
			"HN",
			"143510"
		],
		[
			"HR",
			"143494"
		],
		[
			"HU",
			"143482"
		],
		[
			"ID",
			"143476"
		],
		[
			"IE",
			"143449"
		],
		[
			"IL",
			"143491"
		],
		[
			"IN",
			"143467"
		],
		[
			"IQ",
			"143617"
		],
		[
			"IS",
			"143558"
		],
		[
			"IT",
			"143450"
		],
		[
			"JM",
			"143511"
		],
		[
			"JO",
			"143528"
		],
		[
			"JP",
			"143462"
		],
		[
			"KE",
			"143529"
		],
		[
			"KG",
			"143586"
		],
		[
			"KH",
			"143579"
		],
		[
			"KN",
			"143548"
		],
		[
			"KP",
			"143466"
		],
		[
			"KR",
			"143466"
		],
		[
			"KW",
			"143493"
		],
		[
			"KY",
			"143544"
		],
		[
			"KZ",
			"143517"
		],
		[
			"TC",
			"143552"
		],
		[
			"TD",
			"143581"
		],
		[
			"TJ",
			"143603"
		],
		[
			"TH",
			"143475"
		],
		[
			"TM",
			"143604"
		],
		[
			"TN",
			"143536"
		],
		[
			"TO",
			"143608"
		],
		[
			"TR",
			"143480"
		],
		[
			"TT",
			"143551"
		],
		[
			"TW",
			"143470"
		],
		[
			"TZ",
			"143572"
		],
		[
			"LA",
			"143587"
		],
		[
			"LB",
			"143497"
		],
		[
			"LC",
			"143549"
		],
		[
			"LI",
			"143522"
		],
		[
			"LK",
			"143486"
		],
		[
			"LR",
			"143588"
		],
		[
			"LT",
			"143520"
		],
		[
			"LU",
			"143451"
		],
		[
			"LV",
			"143519"
		],
		[
			"LY",
			"143567"
		],
		[
			"MA",
			"143620"
		],
		[
			"MD",
			"143523"
		],
		[
			"ME",
			"143619"
		],
		[
			"MG",
			"143531"
		],
		[
			"MK",
			"143530"
		],
		[
			"ML",
			"143532"
		],
		[
			"MM",
			"143570"
		],
		[
			"MN",
			"143592"
		],
		[
			"MO",
			"143515"
		],
		[
			"MR",
			"143590"
		],
		[
			"MS",
			"143547"
		],
		[
			"MT",
			"143521"
		],
		[
			"MU",
			"143533"
		],
		[
			"MV",
			"143488"
		],
		[
			"MW",
			"143589"
		],
		[
			"MX",
			"143468"
		],
		[
			"MY",
			"143473"
		],
		[
			"MZ",
			"143593"
		],
		[
			"NA",
			"143594"
		],
		[
			"NE",
			"143534"
		],
		[
			"NG",
			"143561"
		],
		[
			"NI",
			"143512"
		],
		[
			"NL",
			"143452"
		],
		[
			"NO",
			"143457"
		],
		[
			"NP",
			"143484"
		],
		[
			"NR",
			"143606"
		],
		[
			"NZ",
			"143461"
		],
		[
			"OM",
			"143562"
		],
		[
			"PA",
			"143485"
		],
		[
			"PE",
			"143507"
		],
		[
			"PG",
			"143597"
		],
		[
			"PH",
			"143474"
		],
		[
			"PK",
			"143477"
		],
		[
			"PL",
			"143478"
		],
		[
			"PT",
			"143453"
		],
		[
			"PW",
			"143595"
		],
		[
			"PY",
			"143513"
		],
		[
			"QA",
			"143498"
		],
		[
			"RO",
			"143487"
		],
		[
			"RS",
			"143500"
		],
		[
			"RU",
			"143469"
		],
		[
			"RW",
			"143621"
		],
		[
			"SA",
			"143479"
		],
		[
			"SB",
			"143601"
		],
		[
			"SC",
			"143599"
		],
		[
			"SE",
			"143456"
		],
		[
			"SG",
			"143464"
		],
		[
			"SI",
			"143499"
		],
		[
			"SK",
			"143496"
		],
		[
			"SL",
			"143600"
		],
		[
			"SN",
			"143535"
		],
		[
			"SR",
			"143554"
		],
		[
			"ST",
			"143598"
		],
		[
			"SV",
			"143506"
		],
		[
			"SZ",
			"143602"
		],
		[
			"UA",
			"143492"
		],
		[
			"UG",
			"143537"
		],
		[
			"US",
			"143441"
		],
		[
			"UY",
			"143514"
		],
		[
			"UZ",
			"143566"
		],
		[
			"VC",
			"143550"
		],
		[
			"VE",
			"143502"
		],
		[
			"VG",
			"143543"
		],
		[
			"VN",
			"143471"
		],
		[
			"VU",
			"143609"
		],
		[
			"XK",
			"143624"
		],
		[
			"YE",
			"143571"
		],
		[
			"ZA",
			"143472"
		],
		[
			"ZM",
			"143622"
		],
		[
			"ZW",
			"143605"
		]
	]
};
var Default = {
	Settings: Settings$8,
	Configs: Configs$4
};

var Default$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Configs: Configs$4,
    Settings: Settings$8,
    default: Default
});

var Settings$7 = {
	Switch: true,
	PEP: {
		GCC: "US"
	}
};
var Location = {
	Settings: Settings$7
};

var Location$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Settings: Settings$7,
    default: Location
});

var Settings$6 = {
	Switch: true,
	UrlInfoSet: {
		Dispatcher: "AutoNavi",
		Directions: "AutoNavi",
		RAP: "Apple",
		LocationShift: "AUTO"
	},
	TileSet: {
		"Map": "CN",
		Satellite: "HYBRID",
		Traffic: "CN",
		POI: "CN",
		Flyover: "XX",
		Munin: "XX"
	},
	GeoManifest: {
		Dynamic: {
			Config: {
				CountryCode: {
					"default": "CN",
					iOS: "AUTO",
					iPadOS: "AUTO",
					watchOS: "US",
					macOS: "AUTO"
				}
			}
		}
	},
	Config: {
		Announcements: {
			"Environment:": {
				"default": "AUTO",
				iOS: "AUTO",
				iPadOS: "AUTO",
				watchOS: "AUTO",
				macOS: "AUTO"
			}
		}
	}
};
var Configs$3 = {
};
var Maps = {
	Settings: Settings$6,
	Configs: Configs$3
};

var Maps$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Configs: Configs$3,
    Settings: Settings$6,
    default: Maps
});

var Settings$5 = {
	Switch: true,
	CountryCode: "US",
	NewsPlusUser: true
};
var News$1 = {
	Settings: Settings$5
};

var News$2 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Settings: Settings$5,
    default: News$1
});

var Settings$4 = {
	Switch: true,
	CountryCode: "US",
	canUse: true
};
var PrivateRelay = {
	Settings: Settings$4
};

var PrivateRelay$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Settings: Settings$4,
    default: PrivateRelay
});

var Settings$3 = {
	Switch: true,
	CountryCode: "SG",
	Domains: [
		"web",
		"itunes",
		"app_store",
		"movies",
		"restaurants",
		"maps"
	],
	Functions: [
		"flightutilities",
		"lookup",
		"mail",
		"messages",
		"news",
		"safari",
		"siri",
		"spotlight",
		"visualintelligence"
	],
	Safari_Smart_History: true
};
var Configs$2 = {
	VisualIntelligence: {
		enabled_domains: [
			"pets",
			"media",
			"books",
			"art",
			"nature",
			"landmarks"
		],
		supported_domains: [
			"ART",
			"BOOK",
			"MEDIA",
			"LANDMARK",
			"ANIMALS",
			"BIRDS",
			"FOOD",
			"SIGN_SYMBOL",
			"AUTO_SYMBOL",
			"DOGS",
			"NATURE",
			"NATURAL_LANDMARK",
			"INSECTS",
			"REPTILES",
			"ALBUM",
			"STOREFRONT",
			"LAUNDRY_CARE_SYMBOL",
			"CATS",
			"OBJECT_2D",
			"SCULPTURE",
			"SKYLINE",
			"MAMMALS"
		]
	}
};
var Siri = {
	Settings: Settings$3,
	Configs: Configs$2
};

var Siri$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Configs: Configs$2,
    Settings: Settings$3,
    default: Siri
});

var Settings$2 = {
	Switch: "true",
	CountryCode: "US",
	MultiAccount: "false",
	Universal: "true"
};
var TestFlight = {
	Settings: Settings$2
};

var TestFlight$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Settings: Settings$2,
    default: TestFlight
});

var Settings$1 = {
	Switch: true,
	"Third-Party": false,
	HLSUrl: "play-edge.itunes.apple.com",
	ServerUrl: "play.itunes.apple.com",
	Tabs: [
		"WatchNow",
		"Originals",
		"MLS",
		"Sports",
		"Kids",
		"Store",
		"Movies",
		"TV",
		"ChannelsAndApps",
		"Library",
		"Search"
	],
	CountryCode: {
		Configs: "AUTO",
		Settings: "AUTO",
		View: [
			"SG",
			"TW"
		],
		WatchNow: "AUTO",
		Channels: "AUTO",
		Originals: "AUTO",
		Sports: "US",
		Kids: "US",
		Store: "AUTO",
		Movies: "AUTO",
		TV: "AUTO",
		Persons: "SG",
		Search: "AUTO",
		Others: "AUTO"
	}
};
var Configs$1 = {
	Locale: [
		[
			"AU",
			"en-AU"
		],
		[
			"CA",
			"en-CA"
		],
		[
			"GB",
			"en-GB"
		],
		[
			"KR",
			"ko-KR"
		],
		[
			"HK",
			"yue-Hant"
		],
		[
			"JP",
			"ja-JP"
		],
		[
			"MO",
			"zh-Hant"
		],
		[
			"TW",
			"zh-Hant"
		],
		[
			"US",
			"en-US"
		],
		[
			"SG",
			"zh-Hans"
		]
	],
	Tabs: [
		{
			title: "主页",
			type: "WatchNow",
			universalLinks: [
				"https://tv.apple.com/watch-now",
				"https://tv.apple.com/home"
			],
			destinationType: "Target",
			target: {
				id: "tahoma_watchnow",
				type: "Root",
				url: "https://tv.apple.com/watch-now"
			},
			isSelected: true
		},
		{
			title: "Apple TV+",
			type: "Originals",
			universalLinks: [
				"https://tv.apple.com/channel/tvs.sbd.4000",
				"https://tv.apple.com/atv"
			],
			destinationType: "Target",
			target: {
				id: "tvs.sbd.4000",
				type: "Brand",
				url: "https://tv.apple.com/us/channel/tvs.sbd.4000"
			}
		},
		{
			title: "MLS Season Pass",
			type: "MLS",
			universalLinks: [
				"https://tv.apple.com/mls"
			],
			destinationType: "Target",
			target: {
				id: "tvs.sbd.7000",
				type: "Brand",
				url: "https://tv.apple.com/us/channel/tvs.sbd.7000"
			}
		},
		{
			title: "体育节目",
			type: "Sports",
			universalLinks: [
				"https://tv.apple.com/sports"
			],
			destinationType: "Target",
			target: {
				id: "tahoma_sports",
				type: "Root",
				url: "https://tv.apple.com/sports"
			}
		},
		{
			title: "儿童",
			type: "Kids",
			universalLinks: [
				"https://tv.apple.com/kids"
			],
			destinationType: "Target",
			target: {
				id: "tahoma_kids",
				type: "Root",
				url: "https://tv.apple.com/kids"
			}
		},
		{
			title: "电影",
			type: "Movies",
			universalLinks: [
				"https://tv.apple.com/movies"
			],
			destinationType: "Target",
			target: {
				id: "tahoma_movies",
				type: "Root",
				url: "https://tv.apple.com/movies"
			}
		},
		{
			title: "电视节目",
			type: "TV",
			universalLinks: [
				"https://tv.apple.com/tv-shows"
			],
			destinationType: "Target",
			target: {
				id: "tahoma_tvshows",
				type: "Root",
				url: "https://tv.apple.com/tv-shows"
			}
		},
		{
			title: "商店",
			type: "Store",
			universalLinks: [
				"https://tv.apple.com/store"
			],
			destinationType: "SubTabs",
			subTabs: [
				{
					title: "电影",
					type: "Movies",
					universalLinks: [
						"https://tv.apple.com/movies"
					],
					destinationType: "Target",
					target: {
						id: "tahoma_movies",
						type: "Root",
						url: "https://tv.apple.com/movies"
					}
				},
				{
					title: "电视节目",
					type: "TV",
					universalLinks: [
						"https://tv.apple.com/tv-shows"
					],
					destinationType: "Target",
					target: {
						id: "tahoma_tvshows",
						type: "Root",
						url: "https://tv.apple.com/tv-shows"
					}
				}
			]
		},
		{
			title: "频道和 App",
			destinationType: "SubTabs",
			subTabsPlacementType: "ExpandedList",
			type: "ChannelsAndApps",
			subTabs: [
			]
		},
		{
			title: "资料库",
			type: "Library",
			destinationType: "Client"
		},
		{
			title: "搜索",
			type: "Search",
			universalLinks: [
				"https://tv.apple.com/search"
			],
			destinationType: "Target",
			target: {
				id: "tahoma_search",
				type: "Root",
				url: "https://tv.apple.com/search"
			}
		}
	],
	i18n: {
		WatchNow: [
			[
				"en",
				"Home"
			],
			[
				"zh",
				"主页"
			],
			[
				"zh-Hans",
				"主頁"
			],
			[
				"zh-Hant",
				"主頁"
			]
		],
		Movies: [
			[
				"en",
				"Movies"
			],
			[
				"zh",
				"电影"
			],
			[
				"zh-Hans",
				"电影"
			],
			[
				"zh-Hant",
				"電影"
			]
		],
		TV: [
			[
				"en",
				"TV"
			],
			[
				"zh",
				"电视节目"
			],
			[
				"zh-Hans",
				"电视节目"
			],
			[
				"zh-Hant",
				"電視節目"
			]
		],
		Store: [
			[
				"en",
				"Store"
			],
			[
				"zh",
				"商店"
			],
			[
				"zh-Hans",
				"商店"
			],
			[
				"zh-Hant",
				"商店"
			]
		],
		Sports: [
			[
				"en",
				"Sports"
			],
			[
				"zh",
				"体育节目"
			],
			[
				"zh-Hans",
				"体育节目"
			],
			[
				"zh-Hant",
				"體育節目"
			]
		],
		Kids: [
			[
				"en",
				"Kids"
			],
			[
				"zh",
				"儿童"
			],
			[
				"zh-Hans",
				"儿童"
			],
			[
				"zh-Hant",
				"兒童"
			]
		],
		Library: [
			[
				"en",
				"Library"
			],
			[
				"zh",
				"资料库"
			],
			[
				"zh-Hans",
				"资料库"
			],
			[
				"zh-Hant",
				"資料庫"
			]
		],
		Search: [
			[
				"en",
				"Search"
			],
			[
				"zh",
				"搜索"
			],
			[
				"zh-Hans",
				"搜索"
			],
			[
				"zh-Hant",
				"蒐索"
			]
		]
	}
};
var TV = {
	Settings: Settings$1,
	Configs: Configs$1
};

var TV$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Configs: Configs$1,
    Settings: Settings$1,
    default: TV
});

var Settings = {
	Switch: true,
	NextHour: {
		Provider: "ColorfulClouds"
	},
	AQI: {
		Provider: "ColorfulClouds",
		ReplaceProviders: [
		],
		Local: {
			Scale: "WAQI_InstantCast",
			ReplaceScales: [
				"HJ6332012"
			],
			ConvertUnits: false
		}
	},
	API: {
		WAQI: {
			Token: null,
			Header: {
				"Content-Type": "application/json"
			}
		},
		QWeather: {
			Token: null,
			Header: {
				"Content-Type": "application/json"
			},
			Host: "devapi.qweather.com"
		},
		ColorfulClouds: {
			Token: null,
			Header: {
				"Content-Type": "application/json"
			}
		}
	}
};
var Configs = {
	Availability: {
		v1: [
			"currentWeather",
			"dailyForecast",
			"hourlyForecast",
			"minuteForecast",
			"weatherAlerts"
		],
		v2: [
			"airQuality",
			"currentWeather",
			"forecastDaily",
			"forecastHourly",
			"forecastPeriodic",
			"forecastNextHour",
			"historicalComparisons",
			"news",
			"weatherAlerts",
			"weatherAlertNotifications",
			"weatherChange"
		]
	}
};
var WeatherKit = {
	Settings: Settings,
	Configs: Configs
};

var WeatherKit$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Configs: Configs,
    Settings: Settings,
    default: WeatherKit
});

var Database$1 = Database = {
	"Default": Default$1,
	"Location": Location$1,
	"Maps": Maps$1,
	"News": News$2,
	"PrivateRelay": PrivateRelay$1,
	"Siri": Siri$1,
	"TestFlight": TestFlight$1,
	"TV": TV$1,
	"WeatherKit": WeatherKit$1
};

/**
 * Get Storage Variables
 * @link https://github.com/NanoCat-Me/utils/blob/main/getStorage.mjs
 * @author VirgilClyne
 * @param {String} key - Persistent Store Key
 * @param {Array} names - Platform Names
 * @param {Object} database - Default Database
 * @return {Object} { Settings, Caches, Configs }
 */
function getStorage(key, names, database) {
    //log(`☑️ getStorage, Get Environment Variables`, "");
    /***************** BoxJs *****************/
    // 包装为局部变量，用完释放内存
    // BoxJs的清空操作返回假值空字符串, 逻辑或操作符会在左侧操作数为假值时返回右侧操作数。
    let BoxJs = Storage.getItem(key, database);
    //log(`🚧 getStorage, Get Environment Variables`, `BoxJs类型: ${typeof BoxJs}`, `BoxJs内容: ${JSON.stringify(BoxJs)}`, "");
    /***************** Argument *****************/
    let Argument = {};
    switch (typeof $argument) {
        case "string":
            let arg = Object.fromEntries($argument.split("&").map((item) => item.split("=").map(i => i.replace(/\"/g, ''))));
            for (let item in arg) Lodash.set(Argument, item, arg[item]);
            break;
        case "object":
            for (let item in $argument) Lodash.set(Argument, item, $argument[item]);
            break;
    }    //log(`✅ getStorage, Get Environment Variables`, `Argument类型: ${typeof Argument}`, `Argument内容: ${JSON.stringify(Argument)}`, "");
    /***************** Store *****************/
    const Store = { Settings: database?.Default?.Settings || {}, Configs: database?.Default?.Configs || {}, Caches: {} };
    if (!Array.isArray(names)) names = [names];
    //log(`🚧 getStorage, Get Environment Variables`, `names类型: ${typeof names}`, `names内容: ${JSON.stringify(names)}`, "");
    for (let name of names) {
        Store.Settings = { ...Store.Settings, ...database?.[name]?.Settings, ...Argument, ...BoxJs?.[name]?.Settings };
        Store.Configs = { ...Store.Configs, ...database?.[name]?.Configs };
        if (BoxJs?.[name]?.Caches && typeof BoxJs?.[name]?.Caches === "string") BoxJs[name].Caches = JSON.parse(BoxJs?.[name]?.Caches);
        Store.Caches = { ...Store.Caches, ...BoxJs?.[name]?.Caches };
    }    //log(`🚧 getStorage, Get Environment Variables`, `Store.Settings类型: ${typeof Store.Settings}`, `Store.Settings: ${JSON.stringify(Store.Settings)}`, "");
    traverseObject(Store.Settings, (key, value) => {
        //log(`🚧 getStorage, traverseObject`, `${key}: ${typeof value}`, `${key}: ${JSON.stringify(value)}`, "");
        if (value === "true" || value === "false") value = JSON.parse(value); // 字符串转Boolean
        else if (typeof value === "string") {
            if (value.includes(",")) value = value.split(",").map(item => string2number(item)); // 字符串转数组转数字
            else value = string2number(value); // 字符串转数字
        }        return value;
    });
    //log(`✅ getStorage, Get Environment Variables`, `Store: ${typeof Store.Caches}`, `Store内容: ${JSON.stringify(Store)}`, "");
    return Store;
    /***************** function *****************/
    function traverseObject(o, c) { for (var t in o) { var n = o[t]; o[t] = "object" == typeof n && null !== n ? traverseObject(n, c) : c(t, n); } return o }
    function string2number(string) { if (string && !isNaN(string)) string = parseInt(string, 10); return string }
}

/**
 * Set Environment Variables
 * @author VirgilClyne
 * @param {String} name - Persistent Store Key
 * @param {Array} platforms - Platform Names
 * @param {Object} database - Default DataBase
 * @return {Object} { Settings, Caches, Configs }
 */
function setENV(name, platforms, database) {
	log(`☑️ Set Environment Variables`, "");
	let { Settings, Caches, Configs } = getStorage(name, platforms, database);
	/***************** Settings *****************/
	switch (platforms) {
		case "WeatherKit":
			if (!Array.isArray(Settings?.AQI?.ReplaceProviders)) Lodash.set(Settings, "AQI.ReplaceProviders", (Settings?.AQI?.ReplaceProviders) ? [Settings.AQI.ReplaceProviders.toString()] : []);
			if (Settings.AQI.ReplaceProviders.includes("TWC")) Settings.AQI.ReplaceProviders.push("The Weather Channel");
			if (Settings.AQI.ReplaceProviders.includes("QWeather")) Settings.AQI.ReplaceProviders.push("和风天气");
			Settings.AQI.ReplaceProviders.push(undefined);
			if (!Array.isArray(Settings?.AQI?.Local?.ReplaceScales)) Lodash.set(Settings, "AQI.Local.ReplaceScales", (Settings?.AQI?.Local?.ReplaceScales) ? [Settings.AQI.Local.ReplaceScales.toString()] : []);
			break;
		case "Siri":
			if (!Array.isArray(Settings?.Domains)) Lodash.set(Settings, "Domains", (Settings?.Domains) ? [Settings.Domains.toString()] : []);
			if (!Array.isArray(Settings?.Functions)) Lodash.set(Settings, "Functions", (Settings?.Functions) ? [Settings.Functions.toString()] : []);
			break;
		case "TV":
			if (!Array.isArray(Settings?.Tabs)) Lodash.set(Settings, "Tabs", (Settings?.Tabs) ? [Settings.Tabs.toString()] : []);
			break;
	}	log(`✅ Set Environment Variables, Settings: ${typeof Settings}, Settings内容: ${JSON.stringify(Settings)}`, "");
	/***************** Caches *****************/
	//log(`✅ Set Environment Variables, Caches: ${typeof Caches}, Caches内容: ${JSON.stringify(Caches)}`, "");
	/***************** Configs *****************/
	Configs.Storefront = new Map(Configs.Storefront);
	if (Configs.Locale) Configs.Locale = new Map(Configs.Locale);
	if (Configs.i18n) for (let type in Configs.i18n) Configs.i18n[type] = new Map(Configs.i18n[type]);
	return { Settings, Caches, Configs };
}

function parseWeatherKitURL(url = new URL($request.url)) {
    console.log(`☑️ parseWeatherKitURL`, "");
    const RegExp = /^\/api\/(?<version>v1|v2|v3)\/(availability|weather)\/(?<language>\w+)(?:-\w+)?(-(?<country>[A-Z]{2}))?\/(?<latitude>-?\d+\.?\d*)\/(?<longitude>-?\d+\.?\d*)$/i;
    //const LanguageRegExp = /^(?<language>\w+(-\w+)?)-(?<country>[A-Z]{2})$/i;
    const Parameters = url?.pathname.match(RegExp)?.groups;
    let result = {
        "version": Parameters?.version,
        "language": Parameters?.language,
        "latitude": Parameters?.latitude,
        "longitude": Parameters?.longitude,
        "country": Parameters?.country || url?.searchParams?.get("country")
    };
    //console.log(JSON.stringify(result, null, 2), "");
    //const LanguageParameters = result.language.match(LanguageRegExp)?.groups;
    //result.language = LanguageParameters.language;
    //result.country = result.country || LanguageParameters.country
    console.log(`✅ parseWeatherKitURL\n🟧version: ${result.version} 🟧language: ${result.language} 🟧country: ${result.country}\n🟧latitude: ${result.latitude} 🟧longitude: ${result.longitude}\n`, "");
    return result;
}

function providerNameToLogo(providerName, version) {
    console.log(`☑️ providerNameToLogo, providerName: ${providerName}, version: ${version}`, "");
    let providerLogo;
    switch (providerName?.split("\n")?.[0]) {
        case "WAQI":
        case "World Air Quality Index Project":
            switch (version) {
                case "v1":
                    providerLogo = "https://waqi.info/images/logo.png";
                    break;
                case "v2":
                    providerLogo = `https://raw.githubusercontent.com/VirgilClyne/iRingo/main/src/icon/${version}/WAQI.png`;
                    break;
            }            break;
        case "ColofulClouds":
        case "彩云天气":
            providerLogo = `https://raw.githubusercontent.com/VirgilClyne/iRingo/main/src/icon/${version}/ColorfulClouds.png`;
            break;
        case "气象在线":
        case "WeatherOL":
            providerLogo = `https://raw.githubusercontent.com/VirgilClyne/iRingo/main/src/icon/${version}/WeatherOL.png`;
            break;
        case "QWeather":
        case "和风天气":
            providerLogo = `https://weatherkit.apple.com/assets/${version}/QWeather.png`;
            break;
        case "The Weather Channel":
            providerLogo = `https://weatherkit.apple.com/assets/${version}/TWC.png`;
            break;
        case "BreezoMeter":
            providerLogo = `https://weatherkit.apple.com/assets/${version}/BreezoMeter.png`;
            break;
    }    console.log(`✅ providerNameToLogo`, "");
    return providerLogo;
}

const SIZEOF_SHORT = 2;
const SIZEOF_INT = 4;
const FILE_IDENTIFIER_LENGTH = 4;
const SIZE_PREFIX_LENGTH = 4;

const int32 = new Int32Array(2);
const float32 = new Float32Array(int32.buffer);
const float64 = new Float64Array(int32.buffer);
const isLittleEndian = new Uint16Array(new Uint8Array([1, 0]).buffer)[0] === 1;

var Encoding;
(function (Encoding) {
    Encoding[Encoding["UTF8_BYTES"] = 1] = "UTF8_BYTES";
    Encoding[Encoding["UTF16_STRING"] = 2] = "UTF16_STRING";
})(Encoding || (Encoding = {}));

class ByteBuffer {
    /**
     * Create a new ByteBuffer with a given array of bytes (`Uint8Array`)
     */
    constructor(bytes_) {
        this.bytes_ = bytes_;
        this.position_ = 0;
        this.text_decoder_ = new TextDecoder();
    }
    /**
     * Create and allocate a new ByteBuffer with a given size.
     */
    static allocate(byte_size) {
        return new ByteBuffer(new Uint8Array(byte_size));
    }
    clear() {
        this.position_ = 0;
    }
    /**
     * Get the underlying `Uint8Array`.
     */
    bytes() {
        return this.bytes_;
    }
    /**
     * Get the buffer's position.
     */
    position() {
        return this.position_;
    }
    /**
     * Set the buffer's position.
     */
    setPosition(position) {
        this.position_ = position;
    }
    /**
     * Get the buffer's capacity.
     */
    capacity() {
        return this.bytes_.length;
    }
    readInt8(offset) {
        return this.readUint8(offset) << 24 >> 24;
    }
    readUint8(offset) {
        return this.bytes_[offset];
    }
    readInt16(offset) {
        return this.readUint16(offset) << 16 >> 16;
    }
    readUint16(offset) {
        return this.bytes_[offset] | this.bytes_[offset + 1] << 8;
    }
    readInt32(offset) {
        return this.bytes_[offset] | this.bytes_[offset + 1] << 8 | this.bytes_[offset + 2] << 16 | this.bytes_[offset + 3] << 24;
    }
    readUint32(offset) {
        return this.readInt32(offset) >>> 0;
    }
    readInt64(offset) {
        return BigInt.asIntN(64, BigInt(this.readUint32(offset)) + (BigInt(this.readUint32(offset + 4)) << BigInt(32)));
    }
    readUint64(offset) {
        return BigInt.asUintN(64, BigInt(this.readUint32(offset)) + (BigInt(this.readUint32(offset + 4)) << BigInt(32)));
    }
    readFloat32(offset) {
        int32[0] = this.readInt32(offset);
        return float32[0];
    }
    readFloat64(offset) {
        int32[isLittleEndian ? 0 : 1] = this.readInt32(offset);
        int32[isLittleEndian ? 1 : 0] = this.readInt32(offset + 4);
        return float64[0];
    }
    writeInt8(offset, value) {
        this.bytes_[offset] = value;
    }
    writeUint8(offset, value) {
        this.bytes_[offset] = value;
    }
    writeInt16(offset, value) {
        this.bytes_[offset] = value;
        this.bytes_[offset + 1] = value >> 8;
    }
    writeUint16(offset, value) {
        this.bytes_[offset] = value;
        this.bytes_[offset + 1] = value >> 8;
    }
    writeInt32(offset, value) {
        this.bytes_[offset] = value;
        this.bytes_[offset + 1] = value >> 8;
        this.bytes_[offset + 2] = value >> 16;
        this.bytes_[offset + 3] = value >> 24;
    }
    writeUint32(offset, value) {
        this.bytes_[offset] = value;
        this.bytes_[offset + 1] = value >> 8;
        this.bytes_[offset + 2] = value >> 16;
        this.bytes_[offset + 3] = value >> 24;
    }
    writeInt64(offset, value) {
        this.writeInt32(offset, Number(BigInt.asIntN(32, value)));
        this.writeInt32(offset + 4, Number(BigInt.asIntN(32, value >> BigInt(32))));
    }
    writeUint64(offset, value) {
        this.writeUint32(offset, Number(BigInt.asUintN(32, value)));
        this.writeUint32(offset + 4, Number(BigInt.asUintN(32, value >> BigInt(32))));
    }
    writeFloat32(offset, value) {
        float32[0] = value;
        this.writeInt32(offset, int32[0]);
    }
    writeFloat64(offset, value) {
        float64[0] = value;
        this.writeInt32(offset, int32[isLittleEndian ? 0 : 1]);
        this.writeInt32(offset + 4, int32[isLittleEndian ? 1 : 0]);
    }
    /**
     * Return the file identifier.   Behavior is undefined for FlatBuffers whose
     * schema does not include a file_identifier (likely points at padding or the
     * start of a the root vtable).
     */
    getBufferIdentifier() {
        if (this.bytes_.length < this.position_ + SIZEOF_INT +
            FILE_IDENTIFIER_LENGTH) {
            throw new Error('FlatBuffers: ByteBuffer is too short to contain an identifier.');
        }
        let result = "";
        for (let i = 0; i < FILE_IDENTIFIER_LENGTH; i++) {
            result += String.fromCharCode(this.readInt8(this.position_ + SIZEOF_INT + i));
        }
        return result;
    }
    /**
     * Look up a field in the vtable, return an offset into the object, or 0 if the
     * field is not present.
     */
    __offset(bb_pos, vtable_offset) {
        const vtable = bb_pos - this.readInt32(bb_pos);
        return vtable_offset < this.readInt16(vtable) ? this.readInt16(vtable + vtable_offset) : 0;
    }
    /**
     * Initialize any Table-derived type to point to the union at the given offset.
     */
    __union(t, offset) {
        t.bb_pos = offset + this.readInt32(offset);
        t.bb = this;
        return t;
    }
    /**
     * Create a JavaScript string from UTF-8 data stored inside the FlatBuffer.
     * This allocates a new string and converts to wide chars upon each access.
     *
     * To avoid the conversion to string, pass Encoding.UTF8_BYTES as the
     * "optionalEncoding" argument. This is useful for avoiding conversion when
     * the data will just be packaged back up in another FlatBuffer later on.
     *
     * @param offset
     * @param opt_encoding Defaults to UTF16_STRING
     */
    __string(offset, opt_encoding) {
        offset += this.readInt32(offset);
        const length = this.readInt32(offset);
        offset += SIZEOF_INT;
        const utf8bytes = this.bytes_.subarray(offset, offset + length);
        if (opt_encoding === Encoding.UTF8_BYTES)
            return utf8bytes;
        else
            return this.text_decoder_.decode(utf8bytes);
    }
    /**
     * Handle unions that can contain string as its member, if a Table-derived type then initialize it,
     * if a string then return a new one
     *
     * WARNING: strings are immutable in JS so we can't change the string that the user gave us, this
     * makes the behaviour of __union_with_string different compared to __union
     */
    __union_with_string(o, offset) {
        if (typeof o === 'string') {
            return this.__string(offset);
        }
        return this.__union(o, offset);
    }
    /**
     * Retrieve the relative offset stored at "offset"
     */
    __indirect(offset) {
        return offset + this.readInt32(offset);
    }
    /**
     * Get the start of data of a vector whose offset is stored at "offset" in this object.
     */
    __vector(offset) {
        return offset + this.readInt32(offset) + SIZEOF_INT; // data starts after the length
    }
    /**
     * Get the length of a vector whose offset is stored at "offset" in this object.
     */
    __vector_len(offset) {
        return this.readInt32(offset + this.readInt32(offset));
    }
    __has_identifier(ident) {
        if (ident.length != FILE_IDENTIFIER_LENGTH) {
            throw new Error('FlatBuffers: file identifier must be length ' +
                FILE_IDENTIFIER_LENGTH);
        }
        for (let i = 0; i < FILE_IDENTIFIER_LENGTH; i++) {
            if (ident.charCodeAt(i) != this.readInt8(this.position() + SIZEOF_INT + i)) {
                return false;
            }
        }
        return true;
    }
    /**
     * A helper function for generating list for obj api
     */
    createScalarList(listAccessor, listLength) {
        const ret = [];
        for (let i = 0; i < listLength; ++i) {
            const val = listAccessor(i);
            if (val !== null) {
                ret.push(val);
            }
        }
        return ret;
    }
    /**
     * A helper function for generating list for obj api
     * @param listAccessor function that accepts an index and return data at that index
     * @param listLength listLength
     * @param res result list
     */
    createObjList(listAccessor, listLength) {
        const ret = [];
        for (let i = 0; i < listLength; ++i) {
            const val = listAccessor(i);
            if (val !== null) {
                ret.push(val.unpack());
            }
        }
        return ret;
    }
}

class Builder {
    /**
     * Create a FlatBufferBuilder.
     */
    constructor(opt_initial_size) {
        /** Minimum alignment encountered so far. */
        this.minalign = 1;
        /** The vtable for the current table. */
        this.vtable = null;
        /** The amount of fields we're actually using. */
        this.vtable_in_use = 0;
        /** Whether we are currently serializing a table. */
        this.isNested = false;
        /** Starting offset of the current struct/table. */
        this.object_start = 0;
        /** List of offsets of all vtables. */
        this.vtables = [];
        /** For the current vector being built. */
        this.vector_num_elems = 0;
        /** False omits default values from the serialized data */
        this.force_defaults = false;
        this.string_maps = null;
        this.text_encoder = new TextEncoder();
        let initial_size;
        if (!opt_initial_size) {
            initial_size = 1024;
        }
        else {
            initial_size = opt_initial_size;
        }
        /**
         * @type {ByteBuffer}
         * @private
         */
        this.bb = ByteBuffer.allocate(initial_size);
        this.space = initial_size;
    }
    clear() {
        this.bb.clear();
        this.space = this.bb.capacity();
        this.minalign = 1;
        this.vtable = null;
        this.vtable_in_use = 0;
        this.isNested = false;
        this.object_start = 0;
        this.vtables = [];
        this.vector_num_elems = 0;
        this.force_defaults = false;
        this.string_maps = null;
    }
    /**
     * In order to save space, fields that are set to their default value
     * don't get serialized into the buffer. Forcing defaults provides a
     * way to manually disable this optimization.
     *
     * @param forceDefaults true always serializes default values
     */
    forceDefaults(forceDefaults) {
        this.force_defaults = forceDefaults;
    }
    /**
     * Get the ByteBuffer representing the FlatBuffer. Only call this after you've
     * called finish(). The actual data starts at the ByteBuffer's current position,
     * not necessarily at 0.
     */
    dataBuffer() {
        return this.bb;
    }
    /**
     * Get the bytes representing the FlatBuffer. Only call this after you've
     * called finish().
     */
    asUint8Array() {
        return this.bb.bytes().subarray(this.bb.position(), this.bb.position() + this.offset());
    }
    /**
     * Prepare to write an element of `size` after `additional_bytes` have been
     * written, e.g. if you write a string, you need to align such the int length
     * field is aligned to 4 bytes, and the string data follows it directly. If all
     * you need to do is alignment, `additional_bytes` will be 0.
     *
     * @param size This is the of the new element to write
     * @param additional_bytes The padding size
     */
    prep(size, additional_bytes) {
        // Track the biggest thing we've ever aligned to.
        if (size > this.minalign) {
            this.minalign = size;
        }
        // Find the amount of alignment needed such that `size` is properly
        // aligned after `additional_bytes`
        const align_size = ((~(this.bb.capacity() - this.space + additional_bytes)) + 1) & (size - 1);
        // Reallocate the buffer if needed.
        while (this.space < align_size + size + additional_bytes) {
            const old_buf_size = this.bb.capacity();
            this.bb = Builder.growByteBuffer(this.bb);
            this.space += this.bb.capacity() - old_buf_size;
        }
        this.pad(align_size);
    }
    pad(byte_size) {
        for (let i = 0; i < byte_size; i++) {
            this.bb.writeInt8(--this.space, 0);
        }
    }
    writeInt8(value) {
        this.bb.writeInt8(this.space -= 1, value);
    }
    writeInt16(value) {
        this.bb.writeInt16(this.space -= 2, value);
    }
    writeInt32(value) {
        this.bb.writeInt32(this.space -= 4, value);
    }
    writeInt64(value) {
        this.bb.writeInt64(this.space -= 8, value);
    }
    writeFloat32(value) {
        this.bb.writeFloat32(this.space -= 4, value);
    }
    writeFloat64(value) {
        this.bb.writeFloat64(this.space -= 8, value);
    }
    /**
     * Add an `int8` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `int8` to add the buffer.
     */
    addInt8(value) {
        this.prep(1, 0);
        this.writeInt8(value);
    }
    /**
     * Add an `int16` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `int16` to add the buffer.
     */
    addInt16(value) {
        this.prep(2, 0);
        this.writeInt16(value);
    }
    /**
     * Add an `int32` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `int32` to add the buffer.
     */
    addInt32(value) {
        this.prep(4, 0);
        this.writeInt32(value);
    }
    /**
     * Add an `int64` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `int64` to add the buffer.
     */
    addInt64(value) {
        this.prep(8, 0);
        this.writeInt64(value);
    }
    /**
     * Add a `float32` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `float32` to add the buffer.
     */
    addFloat32(value) {
        this.prep(4, 0);
        this.writeFloat32(value);
    }
    /**
     * Add a `float64` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `float64` to add the buffer.
     */
    addFloat64(value) {
        this.prep(8, 0);
        this.writeFloat64(value);
    }
    addFieldInt8(voffset, value, defaultValue) {
        if (this.force_defaults || value != defaultValue) {
            this.addInt8(value);
            this.slot(voffset);
        }
    }
    addFieldInt16(voffset, value, defaultValue) {
        if (this.force_defaults || value != defaultValue) {
            this.addInt16(value);
            this.slot(voffset);
        }
    }
    addFieldInt32(voffset, value, defaultValue) {
        if (this.force_defaults || value != defaultValue) {
            this.addInt32(value);
            this.slot(voffset);
        }
    }
    addFieldInt64(voffset, value, defaultValue) {
        if (this.force_defaults || value !== defaultValue) {
            this.addInt64(value);
            this.slot(voffset);
        }
    }
    addFieldFloat32(voffset, value, defaultValue) {
        if (this.force_defaults || value != defaultValue) {
            this.addFloat32(value);
            this.slot(voffset);
        }
    }
    addFieldFloat64(voffset, value, defaultValue) {
        if (this.force_defaults || value != defaultValue) {
            this.addFloat64(value);
            this.slot(voffset);
        }
    }
    addFieldOffset(voffset, value, defaultValue) {
        if (this.force_defaults || value != defaultValue) {
            this.addOffset(value);
            this.slot(voffset);
        }
    }
    /**
     * Structs are stored inline, so nothing additional is being added. `d` is always 0.
     */
    addFieldStruct(voffset, value, defaultValue) {
        if (value != defaultValue) {
            this.nested(value);
            this.slot(voffset);
        }
    }
    /**
     * Structures are always stored inline, they need to be created right
     * where they're used.  You'll get this assertion failure if you
     * created it elsewhere.
     */
    nested(obj) {
        if (obj != this.offset()) {
            throw new TypeError('FlatBuffers: struct must be serialized inline.');
        }
    }
    /**
     * Should not be creating any other object, string or vector
     * while an object is being constructed
     */
    notNested() {
        if (this.isNested) {
            throw new TypeError('FlatBuffers: object serialization must not be nested.');
        }
    }
    /**
     * Set the current vtable at `voffset` to the current location in the buffer.
     */
    slot(voffset) {
        if (this.vtable !== null)
            this.vtable[voffset] = this.offset();
    }
    /**
     * @returns Offset relative to the end of the buffer.
     */
    offset() {
        return this.bb.capacity() - this.space;
    }
    /**
     * Doubles the size of the backing ByteBuffer and copies the old data towards
     * the end of the new buffer (since we build the buffer backwards).
     *
     * @param bb The current buffer with the existing data
     * @returns A new byte buffer with the old data copied
     * to it. The data is located at the end of the buffer.
     *
     * uint8Array.set() formally takes {Array<number>|ArrayBufferView}, so to pass
     * it a uint8Array we need to suppress the type check:
     * @suppress {checkTypes}
     */
    static growByteBuffer(bb) {
        const old_buf_size = bb.capacity();
        // Ensure we don't grow beyond what fits in an int.
        if (old_buf_size & 0xC0000000) {
            throw new Error('FlatBuffers: cannot grow buffer beyond 2 gigabytes.');
        }
        const new_buf_size = old_buf_size << 1;
        const nbb = ByteBuffer.allocate(new_buf_size);
        nbb.setPosition(new_buf_size - old_buf_size);
        nbb.bytes().set(bb.bytes(), new_buf_size - old_buf_size);
        return nbb;
    }
    /**
     * Adds on offset, relative to where it will be written.
     *
     * @param offset The offset to add.
     */
    addOffset(offset) {
        this.prep(SIZEOF_INT, 0); // Ensure alignment is already done.
        this.writeInt32(this.offset() - offset + SIZEOF_INT);
    }
    /**
     * Start encoding a new object in the buffer.  Users will not usually need to
     * call this directly. The FlatBuffers compiler will generate helper methods
     * that call this method internally.
     */
    startObject(numfields) {
        this.notNested();
        if (this.vtable == null) {
            this.vtable = [];
        }
        this.vtable_in_use = numfields;
        for (let i = 0; i < numfields; i++) {
            this.vtable[i] = 0; // This will push additional elements as needed
        }
        this.isNested = true;
        this.object_start = this.offset();
    }
    /**
     * Finish off writing the object that is under construction.
     *
     * @returns The offset to the object inside `dataBuffer`
     */
    endObject() {
        if (this.vtable == null || !this.isNested) {
            throw new Error('FlatBuffers: endObject called without startObject');
        }
        this.addInt32(0);
        const vtableloc = this.offset();
        // Trim trailing zeroes.
        let i = this.vtable_in_use - 1;
        // eslint-disable-next-line no-empty
        for (; i >= 0 && this.vtable[i] == 0; i--) { }
        const trimmed_size = i + 1;
        // Write out the current vtable.
        for (; i >= 0; i--) {
            // Offset relative to the start of the table.
            this.addInt16(this.vtable[i] != 0 ? vtableloc - this.vtable[i] : 0);
        }
        const standard_fields = 2; // The fields below:
        this.addInt16(vtableloc - this.object_start);
        const len = (trimmed_size + standard_fields) * SIZEOF_SHORT;
        this.addInt16(len);
        // Search for an existing vtable that matches the current one.
        let existing_vtable = 0;
        const vt1 = this.space;
        outer_loop: for (i = 0; i < this.vtables.length; i++) {
            const vt2 = this.bb.capacity() - this.vtables[i];
            if (len == this.bb.readInt16(vt2)) {
                for (let j = SIZEOF_SHORT; j < len; j += SIZEOF_SHORT) {
                    if (this.bb.readInt16(vt1 + j) != this.bb.readInt16(vt2 + j)) {
                        continue outer_loop;
                    }
                }
                existing_vtable = this.vtables[i];
                break;
            }
        }
        if (existing_vtable) {
            // Found a match:
            // Remove the current vtable.
            this.space = this.bb.capacity() - vtableloc;
            // Point table to existing vtable.
            this.bb.writeInt32(this.space, existing_vtable - vtableloc);
        }
        else {
            // No match:
            // Add the location of the current vtable to the list of vtables.
            this.vtables.push(this.offset());
            // Point table to current vtable.
            this.bb.writeInt32(this.bb.capacity() - vtableloc, this.offset() - vtableloc);
        }
        this.isNested = false;
        return vtableloc;
    }
    /**
     * Finalize a buffer, poiting to the given `root_table`.
     */
    finish(root_table, opt_file_identifier, opt_size_prefix) {
        const size_prefix = opt_size_prefix ? SIZE_PREFIX_LENGTH : 0;
        if (opt_file_identifier) {
            const file_identifier = opt_file_identifier;
            this.prep(this.minalign, SIZEOF_INT +
                FILE_IDENTIFIER_LENGTH + size_prefix);
            if (file_identifier.length != FILE_IDENTIFIER_LENGTH) {
                throw new TypeError('FlatBuffers: file identifier must be length ' +
                    FILE_IDENTIFIER_LENGTH);
            }
            for (let i = FILE_IDENTIFIER_LENGTH - 1; i >= 0; i--) {
                this.writeInt8(file_identifier.charCodeAt(i));
            }
        }
        this.prep(this.minalign, SIZEOF_INT + size_prefix);
        this.addOffset(root_table);
        if (size_prefix) {
            this.addInt32(this.bb.capacity() - this.space);
        }
        this.bb.setPosition(this.space);
    }
    /**
     * Finalize a size prefixed buffer, pointing to the given `root_table`.
     */
    finishSizePrefixed(root_table, opt_file_identifier) {
        this.finish(root_table, opt_file_identifier, true);
    }
    /**
     * This checks a required field has been set in a given table that has
     * just been constructed.
     */
    requiredField(table, field) {
        const table_start = this.bb.capacity() - table;
        const vtable_start = table_start - this.bb.readInt32(table_start);
        const ok = field < this.bb.readInt16(vtable_start) &&
            this.bb.readInt16(vtable_start + field) != 0;
        // If this fails, the caller will show what field needs to be set.
        if (!ok) {
            throw new TypeError('FlatBuffers: field ' + field + ' must be set');
        }
    }
    /**
     * Start a new array/vector of objects.  Users usually will not call
     * this directly. The FlatBuffers compiler will create a start/end
     * method for vector types in generated code.
     *
     * @param elem_size The size of each element in the array
     * @param num_elems The number of elements in the array
     * @param alignment The alignment of the array
     */
    startVector(elem_size, num_elems, alignment) {
        this.notNested();
        this.vector_num_elems = num_elems;
        this.prep(SIZEOF_INT, elem_size * num_elems);
        this.prep(alignment, elem_size * num_elems); // Just in case alignment > int.
    }
    /**
     * Finish off the creation of an array and all its elements. The array must be
     * created with `startVector`.
     *
     * @returns The offset at which the newly created array
     * starts.
     */
    endVector() {
        this.writeInt32(this.vector_num_elems);
        return this.offset();
    }
    /**
     * Encode the string `s` in the buffer using UTF-8. If the string passed has
     * already been seen, we return the offset of the already written string
     *
     * @param s The string to encode
     * @return The offset in the buffer where the encoded string starts
     */
    createSharedString(s) {
        if (!s) {
            return 0;
        }
        if (!this.string_maps) {
            this.string_maps = new Map();
        }
        if (this.string_maps.has(s)) {
            return this.string_maps.get(s);
        }
        const offset = this.createString(s);
        this.string_maps.set(s, offset);
        return offset;
    }
    /**
     * Encode the string `s` in the buffer using UTF-8. If a Uint8Array is passed
     * instead of a string, it is assumed to contain valid UTF-8 encoded data.
     *
     * @param s The string to encode
     * @return The offset in the buffer where the encoded string starts
     */
    createString(s) {
        if (s === null || s === undefined) {
            return 0;
        }
        let utf8;
        if (s instanceof Uint8Array) {
            utf8 = s;
        }
        else {
            utf8 = this.text_encoder.encode(s);
        }
        this.addInt8(0);
        this.startVector(1, utf8.length, 1);
        this.bb.setPosition(this.space -= utf8.length);
        this.bb.bytes().set(utf8, this.space);
        return this.endVector();
    }
    /**
     * Create a byte vector.
     *
     * @param v The bytes to add
     * @returns The offset in the buffer where the byte vector starts
     */
    createByteVector(v) {
        if (v === null || v === undefined) {
            return 0;
        }
        this.startVector(1, v.length, 1);
        this.bb.setPosition(this.space -= v.length);
        this.bb.bytes().set(v, this.space);
        return this.endVector();
    }
    /**
     * A helper function to pack an object
     *
     * @returns offset of obj
     */
    createObjectOffset(obj) {
        if (obj === null) {
            return 0;
        }
        if (typeof obj === 'string') {
            return this.createString(obj);
        }
        else {
            return obj.pack(this);
        }
    }
    /**
     * A helper function to pack a list of object
     *
     * @returns list of offsets of each non null object
     */
    createObjectOffsetList(list) {
        const ret = [];
        for (let i = 0; i < list.length; ++i) {
            const val = list[i];
            if (val !== null) {
                ret.push(this.createObjectOffset(val));
            }
            else {
                throw new TypeError('FlatBuffers: Argument for createObjectOffsetList cannot contain null.');
            }
        }
        return ret;
    }
    createStructOffsetList(list, startFunc) {
        startFunc(this, list.length);
        this.createObjectOffsetList(list.slice().reverse());
        return this.endVector();
    }
}

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
var ComparisonTrend;
(function (ComparisonTrend) {
    ComparisonTrend[ComparisonTrend["UNKNOWN"] = 0] = "UNKNOWN";
    ComparisonTrend[ComparisonTrend["UNKNOWN1"] = 1] = "UNKNOWN1";
    ComparisonTrend[ComparisonTrend["WORSE"] = 2] = "WORSE";
    ComparisonTrend[ComparisonTrend["SAME"] = 3] = "SAME";
    ComparisonTrend[ComparisonTrend["BETTER"] = 4] = "BETTER";
    ComparisonTrend[ComparisonTrend["UNKNOWN5"] = 5] = "UNKNOWN5";
})(ComparisonTrend || (ComparisonTrend = {}));

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
var SourceType;
(function (SourceType) {
    SourceType[SourceType["APPLE_INTERNAL"] = 0] = "APPLE_INTERNAL";
    SourceType[SourceType["MODELED"] = 1] = "MODELED";
    SourceType[SourceType["STATION"] = 2] = "STATION";
})(SourceType || (SourceType = {}));

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
class Metadata {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsMetadata(bb, obj) {
        return (obj || new Metadata()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsMetadata(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new Metadata()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    attributionUrl(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    expireTime() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    language(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    latitude() {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    longitude() {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    providerLogo(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 14);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    providerName(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 16);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    readTime() {
        const offset = this.bb.__offset(this.bb_pos, 18);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    reportedTime() {
        const offset = this.bb.__offset(this.bb_pos, 20);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    temporarilyUnavailable() {
        const offset = this.bb.__offset(this.bb_pos, 22);
        return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
    }
    sourceType() {
        const offset = this.bb.__offset(this.bb_pos, 24);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : SourceType.APPLE_INTERNAL;
    }
    static startMetadata(builder) {
        builder.startObject(11);
    }
    static addAttributionUrl(builder, attributionUrlOffset) {
        builder.addFieldOffset(0, attributionUrlOffset, 0);
    }
    static addExpireTime(builder, expireTime) {
        builder.addFieldInt32(1, expireTime, 0);
    }
    static addLanguage(builder, languageOffset) {
        builder.addFieldOffset(2, languageOffset, 0);
    }
    static addLatitude(builder, latitude) {
        builder.addFieldFloat32(3, latitude, 0.0);
    }
    static addLongitude(builder, longitude) {
        builder.addFieldFloat32(4, longitude, 0.0);
    }
    static addProviderLogo(builder, providerLogoOffset) {
        builder.addFieldOffset(5, providerLogoOffset, 0);
    }
    static addProviderName(builder, providerNameOffset) {
        builder.addFieldOffset(6, providerNameOffset, 0);
    }
    static addReadTime(builder, readTime) {
        builder.addFieldInt32(7, readTime, 0);
    }
    static addReportedTime(builder, reportedTime) {
        builder.addFieldInt32(8, reportedTime, 0);
    }
    static addTemporarilyUnavailable(builder, temporarilyUnavailable) {
        builder.addFieldInt8(9, +temporarilyUnavailable, +false);
    }
    static addSourceType(builder, sourceType) {
        builder.addFieldInt8(10, sourceType, SourceType.APPLE_INTERNAL);
    }
    static endMetadata(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createMetadata(builder, attributionUrlOffset, expireTime, languageOffset, latitude, longitude, providerLogoOffset, providerNameOffset, readTime, reportedTime, temporarilyUnavailable, sourceType) {
        Metadata.startMetadata(builder);
        Metadata.addAttributionUrl(builder, attributionUrlOffset);
        Metadata.addExpireTime(builder, expireTime);
        Metadata.addLanguage(builder, languageOffset);
        Metadata.addLatitude(builder, latitude);
        Metadata.addLongitude(builder, longitude);
        Metadata.addProviderLogo(builder, providerLogoOffset);
        Metadata.addProviderName(builder, providerNameOffset);
        Metadata.addReadTime(builder, readTime);
        Metadata.addReportedTime(builder, reportedTime);
        Metadata.addTemporarilyUnavailable(builder, temporarilyUnavailable);
        Metadata.addSourceType(builder, sourceType);
        return Metadata.endMetadata(builder);
    }
}

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
var PollutantType;
(function (PollutantType) {
    PollutantType[PollutantType["NOT_AVAILABLE"] = 0] = "NOT_AVAILABLE";
    PollutantType[PollutantType["C6H6"] = 1] = "C6H6";
    PollutantType[PollutantType["NH3"] = 2] = "NH3";
    PollutantType[PollutantType["NMHC"] = 3] = "NMHC";
    PollutantType[PollutantType["NO"] = 4] = "NO";
    PollutantType[PollutantType["NO2"] = 5] = "NO2";
    PollutantType[PollutantType["NOX"] = 6] = "NOX";
    PollutantType[PollutantType["OZONE"] = 7] = "OZONE";
    PollutantType[PollutantType["PM2_5"] = 8] = "PM2_5";
    PollutantType[PollutantType["SO2"] = 9] = "SO2";
    PollutantType[PollutantType["PM10"] = 10] = "PM10";
    PollutantType[PollutantType["CO"] = 11] = "CO";
    PollutantType[PollutantType["UNKNOWN12"] = 12] = "UNKNOWN12";
    PollutantType[PollutantType["UNKNOWN13"] = 13] = "UNKNOWN13";
})(PollutantType || (PollutantType = {}));

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
var UnitType;
(function (UnitType) {
    UnitType[UnitType["PARTS_PER_BILLION"] = 0] = "PARTS_PER_BILLION";
    UnitType[UnitType["MICROGRAMS_PER_CUBIC_METER"] = 1] = "MICROGRAMS_PER_CUBIC_METER";
})(UnitType || (UnitType = {}));

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
class Pollutant {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsPollutant(bb, obj) {
        return (obj || new Pollutant()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsPollutant(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new Pollutant()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    pollutantType() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : PollutantType.NOT_AVAILABLE;
    }
    amount() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    units() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : UnitType.PARTS_PER_BILLION;
    }
    static startPollutant(builder) {
        builder.startObject(3);
    }
    static addPollutantType(builder, pollutantType) {
        builder.addFieldInt8(0, pollutantType, PollutantType.NOT_AVAILABLE);
    }
    static addAmount(builder, amount) {
        builder.addFieldFloat32(1, amount, 0.0);
    }
    static addUnits(builder, units) {
        builder.addFieldInt8(2, units, UnitType.PARTS_PER_BILLION);
    }
    static endPollutant(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createPollutant(builder, pollutantType, amount, units) {
        Pollutant.startPollutant(builder);
        Pollutant.addPollutantType(builder, pollutantType);
        Pollutant.addAmount(builder, amount);
        Pollutant.addUnits(builder, units);
        return Pollutant.endPollutant(builder);
    }
}

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
let AirQuality$1 = class AirQuality {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsAirQuality(bb, obj) {
        return (obj || new AirQuality()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsAirQuality(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new AirQuality()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    metadata(obj) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? (obj || new Metadata()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    categoryIndex() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    index() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.readInt16(this.bb_pos + offset) : 0;
    }
    isSignificant() {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
    }
    pollutants(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? (obj || new Pollutant()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    }
    pollutantsLength() {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    previousDayComparison() {
        const offset = this.bb.__offset(this.bb_pos, 14);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : ComparisonTrend.UNKNOWN;
    }
    primaryPollutant() {
        const offset = this.bb.__offset(this.bb_pos, 16);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : PollutantType.NOT_AVAILABLE;
    }
    scale(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 18);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    static startAirQuality(builder) {
        builder.startObject(8);
    }
    static addMetadata(builder, metadataOffset) {
        builder.addFieldOffset(0, metadataOffset, 0);
    }
    static addCategoryIndex(builder, categoryIndex) {
        builder.addFieldInt8(1, categoryIndex, 0);
    }
    static addIndex(builder, index) {
        builder.addFieldInt16(2, index, 0);
    }
    static addIsSignificant(builder, isSignificant) {
        builder.addFieldInt8(3, +isSignificant, +false);
    }
    static addPollutants(builder, pollutantsOffset) {
        builder.addFieldOffset(4, pollutantsOffset, 0);
    }
    static createPollutantsVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startPollutantsVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static addPreviousDayComparison(builder, previousDayComparison) {
        builder.addFieldInt8(5, previousDayComparison, ComparisonTrend.UNKNOWN);
    }
    static addPrimaryPollutant(builder, primaryPollutant) {
        builder.addFieldInt8(6, primaryPollutant, PollutantType.NOT_AVAILABLE);
    }
    static addScale(builder, scaleOffset) {
        builder.addFieldOffset(7, scaleOffset, 0);
    }
    static endAirQuality(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createAirQuality(builder, metadataOffset, categoryIndex, index, isSignificant, pollutantsOffset, previousDayComparison, primaryPollutant, scaleOffset) {
        AirQuality.startAirQuality(builder);
        AirQuality.addMetadata(builder, metadataOffset);
        AirQuality.addCategoryIndex(builder, categoryIndex);
        AirQuality.addIndex(builder, index);
        AirQuality.addIsSignificant(builder, isSignificant);
        AirQuality.addPollutants(builder, pollutantsOffset);
        AirQuality.addPreviousDayComparison(builder, previousDayComparison);
        AirQuality.addPrimaryPollutant(builder, primaryPollutant);
        AirQuality.addScale(builder, scaleOffset);
        return AirQuality.endAirQuality(builder);
    }
};

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
class Articles {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsArticles(bb, obj) {
        return (obj || new Articles()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsArticles(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new Articles()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    id(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    supportedStorefronts(index, optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.__string(this.bb.__vector(this.bb_pos + offset) + index * 4, optionalEncoding) : null;
    }
    supportedStorefrontsLength() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    alertIds(index, optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.__string(this.bb.__vector(this.bb_pos + offset) + index * 4, optionalEncoding) : null;
    }
    alertIdsLength() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    phenomena(index, optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.__string(this.bb.__vector(this.bb_pos + offset) + index * 4, optionalEncoding) : null;
    }
    phenomenaLength() {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    headlineOverride(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    locale(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 14);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    static startArticles(builder) {
        builder.startObject(6);
    }
    static addId(builder, idOffset) {
        builder.addFieldOffset(0, idOffset, 0);
    }
    static addSupportedStorefronts(builder, supportedStorefrontsOffset) {
        builder.addFieldOffset(1, supportedStorefrontsOffset, 0);
    }
    static createSupportedStorefrontsVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startSupportedStorefrontsVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static addAlertIds(builder, alertIdsOffset) {
        builder.addFieldOffset(2, alertIdsOffset, 0);
    }
    static createAlertIdsVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startAlertIdsVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static addPhenomena(builder, phenomenaOffset) {
        builder.addFieldOffset(3, phenomenaOffset, 0);
    }
    static createPhenomenaVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startPhenomenaVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static addHeadlineOverride(builder, headlineOverrideOffset) {
        builder.addFieldOffset(4, headlineOverrideOffset, 0);
    }
    static addLocale(builder, localeOffset) {
        builder.addFieldOffset(5, localeOffset, 0);
    }
    static endArticles(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createArticles(builder, idOffset, supportedStorefrontsOffset, alertIdsOffset, phenomenaOffset, headlineOverrideOffset, localeOffset) {
        Articles.startArticles(builder);
        Articles.addId(builder, idOffset);
        Articles.addSupportedStorefronts(builder, supportedStorefrontsOffset);
        Articles.addAlertIds(builder, alertIdsOffset);
        Articles.addPhenomena(builder, phenomenaOffset);
        Articles.addHeadlineOverride(builder, headlineOverrideOffset);
        Articles.addLocale(builder, localeOffset);
        return Articles.endArticles(builder);
    }
}

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
var BaselineType;
(function (BaselineType) {
    BaselineType[BaselineType["MEAN"] = 0] = "MEAN";
    BaselineType[BaselineType["UNKNOWN1"] = 1] = "UNKNOWN1";
    BaselineType[BaselineType["UNKNOWN2"] = 2] = "UNKNOWN2";
    BaselineType[BaselineType["UNKNOWN3"] = 3] = "UNKNOWN3";
    BaselineType[BaselineType["UNKNOWN4"] = 4] = "UNKNOWN4";
    BaselineType[BaselineType["UNKNOWN5"] = 5] = "UNKNOWN5";
})(BaselineType || (BaselineType = {}));

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
var Certainty;
(function (Certainty) {
    Certainty[Certainty["UNKNOWN"] = 0] = "UNKNOWN";
    Certainty[Certainty["OBSERVED"] = 1] = "OBSERVED";
    Certainty[Certainty["LIKELY"] = 2] = "LIKELY";
    Certainty[Certainty["POSSIBLE"] = 3] = "POSSIBLE";
    Certainty[Certainty["UNLIKELY"] = 4] = "UNLIKELY";
    Certainty[Certainty["UNKNOWN5"] = 5] = "UNKNOWN5";
})(Certainty || (Certainty = {}));

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
var Direction;
(function (Direction) {
    Direction[Direction["STEADY"] = 0] = "STEADY";
    Direction[Direction["INC"] = 1] = "INC";
    Direction[Direction["DEC"] = 2] = "DEC";
})(Direction || (Direction = {}));

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
class Change {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsChange(bb, obj) {
        return (obj || new Change()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsChange(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new Change()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    forecastStart() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    forecastEnd() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    maxTemperatureChange() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : Direction.STEADY;
    }
    minTemperatureChange() {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : Direction.STEADY;
    }
    dayPrecipitationChange() {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : Direction.STEADY;
    }
    nightPrecipitationChange() {
        const offset = this.bb.__offset(this.bb_pos, 14);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : Direction.STEADY;
    }
    static startChange(builder) {
        builder.startObject(6);
    }
    static addForecastStart(builder, forecastStart) {
        builder.addFieldInt32(0, forecastStart, 0);
    }
    static addForecastEnd(builder, forecastEnd) {
        builder.addFieldInt32(1, forecastEnd, 0);
    }
    static addMaxTemperatureChange(builder, maxTemperatureChange) {
        builder.addFieldInt8(2, maxTemperatureChange, Direction.STEADY);
    }
    static addMinTemperatureChange(builder, minTemperatureChange) {
        builder.addFieldInt8(3, minTemperatureChange, Direction.STEADY);
    }
    static addDayPrecipitationChange(builder, dayPrecipitationChange) {
        builder.addFieldInt8(4, dayPrecipitationChange, Direction.STEADY);
    }
    static addNightPrecipitationChange(builder, nightPrecipitationChange) {
        builder.addFieldInt8(5, nightPrecipitationChange, Direction.STEADY);
    }
    static endChange(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createChange(builder, forecastStart, forecastEnd, maxTemperatureChange, minTemperatureChange, dayPrecipitationChange, nightPrecipitationChange) {
        Change.startChange(builder);
        Change.addForecastStart(builder, forecastStart);
        Change.addForecastEnd(builder, forecastEnd);
        Change.addMaxTemperatureChange(builder, maxTemperatureChange);
        Change.addMinTemperatureChange(builder, minTemperatureChange);
        Change.addDayPrecipitationChange(builder, dayPrecipitationChange);
        Change.addNightPrecipitationChange(builder, nightPrecipitationChange);
        return Change.endChange(builder);
    }
}

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
var ComparisonType;
(function (ComparisonType) {
    ComparisonType[ComparisonType["UNKNOWN0"] = 0] = "UNKNOWN0";
    ComparisonType[ComparisonType["TEMPERATURE_MAX"] = 1] = "TEMPERATURE_MAX";
    ComparisonType[ComparisonType["PRECIPITATION"] = 2] = "PRECIPITATION";
})(ComparisonType || (ComparisonType = {}));

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
var Deviation;
(function (Deviation) {
    Deviation[Deviation["MUCHHIGHER"] = 0] = "MUCHHIGHER";
    Deviation[Deviation["HIGHER"] = 1] = "HIGHER";
    Deviation[Deviation["NORMAL"] = 2] = "NORMAL";
    Deviation[Deviation["LOWER"] = 3] = "LOWER";
    Deviation[Deviation["MUCHLOWER"] = 4] = "MUCHLOWER";
})(Deviation || (Deviation = {}));

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
class Comparison {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsComparison(bb, obj) {
        return (obj || new Comparison()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsComparison(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new Comparison()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    condition() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : ComparisonType.UNKNOWN0;
    }
    currentValue() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    baselineValue() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    deviation() {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : Deviation.MUCHHIGHER;
    }
    baselineType() {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    }
    baselineStartDate() {
        const offset = this.bb.__offset(this.bb_pos, 14);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    }
    static startComparison(builder) {
        builder.startObject(6);
    }
    static addCondition(builder, condition) {
        builder.addFieldInt8(0, condition, ComparisonType.UNKNOWN0);
    }
    static addCurrentValue(builder, currentValue) {
        builder.addFieldFloat32(1, currentValue, 0.0);
    }
    static addBaselineValue(builder, baselineValue) {
        builder.addFieldFloat32(2, baselineValue, 0.0);
    }
    static addDeviation(builder, deviation) {
        builder.addFieldInt8(3, deviation, Deviation.MUCHHIGHER);
    }
    static addBaselineType(builder, baselineType) {
        builder.addFieldInt32(4, baselineType, 0);
    }
    static addBaselineStartDate(builder, baselineStartDate) {
        builder.addFieldInt32(5, baselineStartDate, 0);
    }
    static endComparison(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createComparison(builder, condition, currentValue, baselineValue, deviation, baselineType, baselineStartDate) {
        Comparison.startComparison(builder);
        Comparison.addCondition(builder, condition);
        Comparison.addCurrentValue(builder, currentValue);
        Comparison.addBaselineValue(builder, baselineValue);
        Comparison.addDeviation(builder, deviation);
        Comparison.addBaselineType(builder, baselineType);
        Comparison.addBaselineStartDate(builder, baselineStartDate);
        return Comparison.endComparison(builder);
    }
}

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
var ConditionType;
(function (ConditionType) {
    ConditionType[ConditionType["CLEAR"] = 0] = "CLEAR";
    ConditionType[ConditionType["UNKNOWN1"] = 1] = "UNKNOWN1";
    ConditionType[ConditionType["UNKNOWN2"] = 2] = "UNKNOWN2";
    ConditionType[ConditionType["UNKNOWN3"] = 3] = "UNKNOWN3";
    ConditionType[ConditionType["UNKNOWN4"] = 4] = "UNKNOWN4";
    ConditionType[ConditionType["HEAVY_RAIN"] = 5] = "HEAVY_RAIN";
    ConditionType[ConditionType["RAIN"] = 6] = "RAIN";
    ConditionType[ConditionType["DRIZZLE"] = 7] = "DRIZZLE";
    ConditionType[ConditionType["POSSIBLE_DRIZZLE"] = 8] = "POSSIBLE_DRIZZLE";
    ConditionType[ConditionType["UNKNOWN9"] = 9] = "UNKNOWN9";
    ConditionType[ConditionType["UNKNOWN10"] = 10] = "UNKNOWN10";
    ConditionType[ConditionType["UNKNOWN11"] = 11] = "UNKNOWN11";
    ConditionType[ConditionType["UNKNOWN12"] = 12] = "UNKNOWN12";
    ConditionType[ConditionType["UNKNOWN13"] = 13] = "UNKNOWN13";
    ConditionType[ConditionType["UNKNOWN14"] = 14] = "UNKNOWN14";
    ConditionType[ConditionType["SNOW"] = 15] = "SNOW";
    ConditionType[ConditionType["UNKNOWN16"] = 16] = "UNKNOWN16";
    ConditionType[ConditionType["UNKNOWN17"] = 17] = "UNKNOWN17";
    ConditionType[ConditionType["UNKNOWN18"] = 18] = "UNKNOWN18";
})(ConditionType || (ConditionType = {}));

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
var ForecastToken;
(function (ForecastToken) {
    ForecastToken[ForecastToken["CLEAR"] = 0] = "CLEAR";
    ForecastToken[ForecastToken["START"] = 1] = "START";
    ForecastToken[ForecastToken["STOP"] = 2] = "STOP";
    ForecastToken[ForecastToken["START_STOP"] = 3] = "START_STOP";
    ForecastToken[ForecastToken["STOP_START"] = 4] = "STOP_START";
    ForecastToken[ForecastToken["CONSTANT"] = 5] = "CONSTANT";
})(ForecastToken || (ForecastToken = {}));

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
var ParameterType;
(function (ParameterType) {
    ParameterType[ParameterType["FIRST_AT"] = 0] = "FIRST_AT";
    ParameterType[ParameterType["SECOND_AT"] = 1] = "SECOND_AT";
})(ParameterType || (ParameterType = {}));

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
class Parameter {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsParameter(bb, obj) {
        return (obj || new Parameter()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsParameter(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new Parameter()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    type() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : ParameterType.FIRST_AT;
    }
    date() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    static startParameter(builder) {
        builder.startObject(2);
    }
    static addType(builder, type) {
        builder.addFieldInt8(0, type, ParameterType.FIRST_AT);
    }
    static addDate(builder, date) {
        builder.addFieldInt32(1, date, 0);
    }
    static endParameter(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createParameter(builder, type, date) {
        Parameter.startParameter(builder);
        Parameter.addType(builder, type);
        Parameter.addDate(builder, date);
        return Parameter.endParameter(builder);
    }
}

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
class Condition {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsCondition(bb, obj) {
        return (obj || new Condition()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsCondition(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new Condition()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    startTime() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    endTime() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    forecastToken() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : ForecastToken.CLEAR;
    }
    beginCondition() {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : ConditionType.CLEAR;
    }
    endCondition() {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : ConditionType.CLEAR;
    }
    parameters(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 14);
        return offset ? (obj || new Parameter()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    }
    parametersLength() {
        const offset = this.bb.__offset(this.bb_pos, 14);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    static startCondition(builder) {
        builder.startObject(6);
    }
    static addStartTime(builder, startTime) {
        builder.addFieldInt32(0, startTime, 0);
    }
    static addEndTime(builder, endTime) {
        builder.addFieldInt32(1, endTime, 0);
    }
    static addForecastToken(builder, forecastToken) {
        builder.addFieldInt8(2, forecastToken, ForecastToken.CLEAR);
    }
    static addBeginCondition(builder, beginCondition) {
        builder.addFieldInt8(3, beginCondition, ConditionType.CLEAR);
    }
    static addEndCondition(builder, endCondition) {
        builder.addFieldInt8(4, endCondition, ConditionType.CLEAR);
    }
    static addParameters(builder, parametersOffset) {
        builder.addFieldOffset(5, parametersOffset, 0);
    }
    static createParametersVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startParametersVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static endCondition(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createCondition(builder, startTime, endTime, forecastToken, beginCondition, endCondition, parametersOffset) {
        Condition.startCondition(builder);
        Condition.addStartTime(builder, startTime);
        Condition.addEndTime(builder, endTime);
        Condition.addForecastToken(builder, forecastToken);
        Condition.addBeginCondition(builder, beginCondition);
        Condition.addEndCondition(builder, endCondition);
        Condition.addParameters(builder, parametersOffset);
        return Condition.endCondition(builder);
    }
}

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
var PrecipitationType;
(function (PrecipitationType) {
    PrecipitationType[PrecipitationType["CLEAR"] = 0] = "CLEAR";
    PrecipitationType[PrecipitationType["RAIN"] = 1] = "RAIN";
    PrecipitationType[PrecipitationType["SNOW"] = 2] = "SNOW";
    PrecipitationType[PrecipitationType["SLEET"] = 3] = "SLEET";
    PrecipitationType[PrecipitationType["HAIL"] = 4] = "HAIL";
    PrecipitationType[PrecipitationType["MIXED"] = 5] = "MIXED";
})(PrecipitationType || (PrecipitationType = {}));

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
class PrecipitationAmountByType {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsPrecipitationAmountByType(bb, obj) {
        return (obj || new PrecipitationAmountByType()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsPrecipitationAmountByType(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new PrecipitationAmountByType()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    precipitationType() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : PrecipitationType.CLEAR;
    }
    expected() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    minimumSnow() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    maximumSnow() {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    expectedSnow() {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    static startPrecipitationAmountByType(builder) {
        builder.startObject(5);
    }
    static addPrecipitationType(builder, precipitationType) {
        builder.addFieldInt8(0, precipitationType, PrecipitationType.CLEAR);
    }
    static addExpected(builder, expected) {
        builder.addFieldFloat32(1, expected, 0.0);
    }
    static addMinimumSnow(builder, minimumSnow) {
        builder.addFieldFloat32(2, minimumSnow, 0.0);
    }
    static addMaximumSnow(builder, maximumSnow) {
        builder.addFieldFloat32(3, maximumSnow, 0.0);
    }
    static addExpectedSnow(builder, expectedSnow) {
        builder.addFieldFloat32(4, expectedSnow, 0.0);
    }
    static endPrecipitationAmountByType(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createPrecipitationAmountByType(builder, precipitationType, expected, minimumSnow, maximumSnow, expectedSnow) {
        PrecipitationAmountByType.startPrecipitationAmountByType(builder);
        PrecipitationAmountByType.addPrecipitationType(builder, precipitationType);
        PrecipitationAmountByType.addExpected(builder, expected);
        PrecipitationAmountByType.addMinimumSnow(builder, minimumSnow);
        PrecipitationAmountByType.addMaximumSnow(builder, maximumSnow);
        PrecipitationAmountByType.addExpectedSnow(builder, expectedSnow);
        return PrecipitationAmountByType.endPrecipitationAmountByType(builder);
    }
}

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
var PressureTrend;
(function (PressureTrend) {
    PressureTrend[PressureTrend["RISING"] = 0] = "RISING";
    PressureTrend[PressureTrend["FALLING"] = 1] = "FALLING";
    PressureTrend[PressureTrend["STEADY"] = 2] = "STEADY";
})(PressureTrend || (PressureTrend = {}));

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
var WeatherCondition;
(function (WeatherCondition) {
    WeatherCondition[WeatherCondition["CLEAR"] = 0] = "CLEAR";
    WeatherCondition[WeatherCondition["TEMPERATURE_MAX"] = 1] = "TEMPERATURE_MAX";
    WeatherCondition[WeatherCondition["PRECIPITATION"] = 2] = "PRECIPITATION";
    WeatherCondition[WeatherCondition["UNKNOWN3"] = 3] = "UNKNOWN3";
    WeatherCondition[WeatherCondition["UNKNOWN4"] = 4] = "UNKNOWN4";
    WeatherCondition[WeatherCondition["CLOUDY"] = 5] = "CLOUDY";
    WeatherCondition[WeatherCondition["DRIZZLE"] = 6] = "DRIZZLE";
    WeatherCondition[WeatherCondition["FLURRIES"] = 7] = "FLURRIES";
    WeatherCondition[WeatherCondition["FOGGY"] = 8] = "FOGGY";
    WeatherCondition[WeatherCondition["UNKNOWN9"] = 9] = "UNKNOWN9";
    WeatherCondition[WeatherCondition["UNKNOWN10"] = 10] = "UNKNOWN10";
    WeatherCondition[WeatherCondition["UNKNOWN11"] = 11] = "UNKNOWN11";
    WeatherCondition[WeatherCondition["UNKNOWN12"] = 12] = "UNKNOWN12";
    WeatherCondition[WeatherCondition["HAZE"] = 13] = "HAZE";
    WeatherCondition[WeatherCondition["HEAVY_RAIN"] = 14] = "HEAVY_RAIN";
    WeatherCondition[WeatherCondition["HEAVY_SNOW"] = 15] = "HEAVY_SNOW";
    WeatherCondition[WeatherCondition["UNKNOWN16"] = 16] = "UNKNOWN16";
    WeatherCondition[WeatherCondition["UNKNOWN17"] = 17] = "UNKNOWN17";
    WeatherCondition[WeatherCondition["ISOLATED_THUNDERSTORMS"] = 18] = "ISOLATED_THUNDERSTORMS";
    WeatherCondition[WeatherCondition["MOSTLY_CLEAR"] = 19] = "MOSTLY_CLEAR";
    WeatherCondition[WeatherCondition["MOSTLY_CLOUDY"] = 20] = "MOSTLY_CLOUDY";
    WeatherCondition[WeatherCondition["PARTLY_CLOUDY"] = 21] = "PARTLY_CLOUDY";
    WeatherCondition[WeatherCondition["RAIN"] = 22] = "RAIN";
    WeatherCondition[WeatherCondition["UNKNOWN23"] = 23] = "UNKNOWN23";
    WeatherCondition[WeatherCondition["UNKNOWN24"] = 24] = "UNKNOWN24";
    WeatherCondition[WeatherCondition["UNKNOWN25"] = 25] = "UNKNOWN25";
    WeatherCondition[WeatherCondition["SNOW"] = 26] = "SNOW";
    WeatherCondition[WeatherCondition["UNKNOWN27"] = 27] = "UNKNOWN27";
    WeatherCondition[WeatherCondition["UNKNOWN28"] = 28] = "UNKNOWN28";
    WeatherCondition[WeatherCondition["FREEZING_DRIZZLE"] = 29] = "FREEZING_DRIZZLE";
    WeatherCondition[WeatherCondition["THUNDERSTORMS"] = 30] = "THUNDERSTORMS";
    WeatherCondition[WeatherCondition["UNKNOWN31"] = 31] = "UNKNOWN31";
    WeatherCondition[WeatherCondition["WINDY"] = 32] = "WINDY";
    WeatherCondition[WeatherCondition["UNKNOWN33"] = 33] = "UNKNOWN33";
    WeatherCondition[WeatherCondition["UNKNOWN34"] = 34] = "UNKNOWN34";
    WeatherCondition[WeatherCondition["UNKNOWN35"] = 35] = "UNKNOWN35";
    WeatherCondition[WeatherCondition["UNKNOWN36"] = 36] = "UNKNOWN36";
    WeatherCondition[WeatherCondition["UNKNOWN37"] = 37] = "UNKNOWN37";
    WeatherCondition[WeatherCondition["UNKNOWN38"] = 38] = "UNKNOWN38";
    WeatherCondition[WeatherCondition["UNKNOWN39"] = 39] = "UNKNOWN39";
    WeatherCondition[WeatherCondition["UNKNOWN40"] = 40] = "UNKNOWN40";
    WeatherCondition[WeatherCondition["UNKNOWN41"] = 41] = "UNKNOWN41";
    WeatherCondition[WeatherCondition["UNKNOWN42"] = 42] = "UNKNOWN42";
    WeatherCondition[WeatherCondition["UNKNOWN43"] = 43] = "UNKNOWN43";
    WeatherCondition[WeatherCondition["UNKNOWN44"] = 44] = "UNKNOWN44";
})(WeatherCondition || (WeatherCondition = {}));

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
class CurrentWeatherData {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsCurrentWeatherData(bb, obj) {
        return (obj || new CurrentWeatherData()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsCurrentWeatherData(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new CurrentWeatherData()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    metadata(obj) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? (obj || new Metadata()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    asOf() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    }
    cloudCover() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    cloudCoverLowAltPct() {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    cloudCoverMidAltPct() {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    cloudCoverHighAltPct() {
        const offset = this.bb.__offset(this.bb_pos, 14);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    conditionCode() {
        const offset = this.bb.__offset(this.bb_pos, 16);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : WeatherCondition.CLEAR;
    }
    daylight() {
        const offset = this.bb.__offset(this.bb_pos, 18);
        return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
    }
    humidity() {
        const offset = this.bb.__offset(this.bb_pos, 20);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    perceivedPrecipitationIntensity() {
        const offset = this.bb.__offset(this.bb_pos, 22);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    precipitationAmount1h() {
        const offset = this.bb.__offset(this.bb_pos, 24);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    precipitationAmount6h() {
        const offset = this.bb.__offset(this.bb_pos, 26);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    precipitationAmount24h() {
        const offset = this.bb.__offset(this.bb_pos, 28);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    precipitationAmountNext1h() {
        const offset = this.bb.__offset(this.bb_pos, 30);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    precipitationAmountNext6h() {
        const offset = this.bb.__offset(this.bb_pos, 32);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    precipitationAmountNext24h() {
        const offset = this.bb.__offset(this.bb_pos, 34);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    precipitationAmountNext1hByType(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 36);
        return offset ? (obj || new PrecipitationAmountByType()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    }
    precipitationAmountNext1hByTypeLength() {
        const offset = this.bb.__offset(this.bb_pos, 36);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    precipitationAmountNext6hByType(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 38);
        return offset ? (obj || new PrecipitationAmountByType()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    }
    precipitationAmountNext6hByTypeLength() {
        const offset = this.bb.__offset(this.bb_pos, 38);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    precipitationAmountNext24hByType(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 40);
        return offset ? (obj || new PrecipitationAmountByType()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    }
    precipitationAmountNext24hByTypeLength() {
        const offset = this.bb.__offset(this.bb_pos, 40);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    precipitationAmountPrevious1hByType(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 42);
        return offset ? (obj || new PrecipitationAmountByType()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    }
    precipitationAmountPrevious1hByTypeLength() {
        const offset = this.bb.__offset(this.bb_pos, 42);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    precipitationAmountPrevious6hByType(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 44);
        return offset ? (obj || new PrecipitationAmountByType()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    }
    precipitationAmountPrevious6hByTypeLength() {
        const offset = this.bb.__offset(this.bb_pos, 44);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    precipitationAmountPrevious24hByType(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 46);
        return offset ? (obj || new PrecipitationAmountByType()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    }
    precipitationAmountPrevious24hByTypeLength() {
        const offset = this.bb.__offset(this.bb_pos, 46);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    precipitationIntensity() {
        const offset = this.bb.__offset(this.bb_pos, 48);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    pressure() {
        const offset = this.bb.__offset(this.bb_pos, 50);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    pressureTrend() {
        const offset = this.bb.__offset(this.bb_pos, 52);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : PressureTrend.RISING;
    }
    snowfallAmount1h() {
        const offset = this.bb.__offset(this.bb_pos, 54);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    snowfallAmount6h() {
        const offset = this.bb.__offset(this.bb_pos, 56);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    snowfallAmount24h() {
        const offset = this.bb.__offset(this.bb_pos, 58);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    snowfallAmountNext1h() {
        const offset = this.bb.__offset(this.bb_pos, 60);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    snowfallAmountNext6h() {
        const offset = this.bb.__offset(this.bb_pos, 62);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    snowfallAmountNext24h() {
        const offset = this.bb.__offset(this.bb_pos, 64);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    temperature() {
        const offset = this.bb.__offset(this.bb_pos, 66);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    temperatureApparent() {
        const offset = this.bb.__offset(this.bb_pos, 68);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    unknown34() {
        const offset = this.bb.__offset(this.bb_pos, 70);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    temperatureDewPoint() {
        const offset = this.bb.__offset(this.bb_pos, 72);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    uvIndex() {
        const offset = this.bb.__offset(this.bb_pos, 74);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    visibility() {
        const offset = this.bb.__offset(this.bb_pos, 76);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    windDirection() {
        const offset = this.bb.__offset(this.bb_pos, 78);
        return offset ? this.bb.readInt16(this.bb_pos + offset) : 0;
    }
    windGust() {
        const offset = this.bb.__offset(this.bb_pos, 80);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    windSpeed() {
        const offset = this.bb.__offset(this.bb_pos, 82);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    static startCurrentWeatherData(builder) {
        builder.startObject(40);
    }
    static addMetadata(builder, metadataOffset) {
        builder.addFieldOffset(0, metadataOffset, 0);
    }
    static addAsOf(builder, asOf) {
        builder.addFieldInt32(1, asOf, 0);
    }
    static addCloudCover(builder, cloudCover) {
        builder.addFieldInt8(2, cloudCover, 0);
    }
    static addCloudCoverLowAltPct(builder, cloudCoverLowAltPct) {
        builder.addFieldInt8(3, cloudCoverLowAltPct, 0);
    }
    static addCloudCoverMidAltPct(builder, cloudCoverMidAltPct) {
        builder.addFieldInt8(4, cloudCoverMidAltPct, 0);
    }
    static addCloudCoverHighAltPct(builder, cloudCoverHighAltPct) {
        builder.addFieldInt8(5, cloudCoverHighAltPct, 0);
    }
    static addConditionCode(builder, conditionCode) {
        builder.addFieldInt8(6, conditionCode, WeatherCondition.CLEAR);
    }
    static addDaylight(builder, daylight) {
        builder.addFieldInt8(7, +daylight, +false);
    }
    static addHumidity(builder, humidity) {
        builder.addFieldInt8(8, humidity, 0);
    }
    static addPerceivedPrecipitationIntensity(builder, perceivedPrecipitationIntensity) {
        builder.addFieldFloat32(9, perceivedPrecipitationIntensity, 0.0);
    }
    static addPrecipitationAmount1h(builder, precipitationAmount1h) {
        builder.addFieldFloat32(10, precipitationAmount1h, 0.0);
    }
    static addPrecipitationAmount6h(builder, precipitationAmount6h) {
        builder.addFieldFloat32(11, precipitationAmount6h, 0.0);
    }
    static addPrecipitationAmount24h(builder, precipitationAmount24h) {
        builder.addFieldFloat32(12, precipitationAmount24h, 0.0);
    }
    static addPrecipitationAmountNext1h(builder, precipitationAmountNext1h) {
        builder.addFieldFloat32(13, precipitationAmountNext1h, 0.0);
    }
    static addPrecipitationAmountNext6h(builder, precipitationAmountNext6h) {
        builder.addFieldFloat32(14, precipitationAmountNext6h, 0.0);
    }
    static addPrecipitationAmountNext24h(builder, precipitationAmountNext24h) {
        builder.addFieldFloat32(15, precipitationAmountNext24h, 0.0);
    }
    static addPrecipitationAmountNext1hByType(builder, precipitationAmountNext1hByTypeOffset) {
        builder.addFieldOffset(16, precipitationAmountNext1hByTypeOffset, 0);
    }
    static createPrecipitationAmountNext1hByTypeVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startPrecipitationAmountNext1hByTypeVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static addPrecipitationAmountNext6hByType(builder, precipitationAmountNext6hByTypeOffset) {
        builder.addFieldOffset(17, precipitationAmountNext6hByTypeOffset, 0);
    }
    static createPrecipitationAmountNext6hByTypeVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startPrecipitationAmountNext6hByTypeVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static addPrecipitationAmountNext24hByType(builder, precipitationAmountNext24hByTypeOffset) {
        builder.addFieldOffset(18, precipitationAmountNext24hByTypeOffset, 0);
    }
    static createPrecipitationAmountNext24hByTypeVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startPrecipitationAmountNext24hByTypeVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static addPrecipitationAmountPrevious1hByType(builder, precipitationAmountPrevious1hByTypeOffset) {
        builder.addFieldOffset(19, precipitationAmountPrevious1hByTypeOffset, 0);
    }
    static createPrecipitationAmountPrevious1hByTypeVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startPrecipitationAmountPrevious1hByTypeVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static addPrecipitationAmountPrevious6hByType(builder, precipitationAmountPrevious6hByTypeOffset) {
        builder.addFieldOffset(20, precipitationAmountPrevious6hByTypeOffset, 0);
    }
    static createPrecipitationAmountPrevious6hByTypeVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startPrecipitationAmountPrevious6hByTypeVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static addPrecipitationAmountPrevious24hByType(builder, precipitationAmountPrevious24hByTypeOffset) {
        builder.addFieldOffset(21, precipitationAmountPrevious24hByTypeOffset, 0);
    }
    static createPrecipitationAmountPrevious24hByTypeVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startPrecipitationAmountPrevious24hByTypeVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static addPrecipitationIntensity(builder, precipitationIntensity) {
        builder.addFieldFloat32(22, precipitationIntensity, 0.0);
    }
    static addPressure(builder, pressure) {
        builder.addFieldFloat32(23, pressure, 0.0);
    }
    static addPressureTrend(builder, pressureTrend) {
        builder.addFieldInt8(24, pressureTrend, PressureTrend.RISING);
    }
    static addSnowfallAmount1h(builder, snowfallAmount1h) {
        builder.addFieldFloat32(25, snowfallAmount1h, 0.0);
    }
    static addSnowfallAmount6h(builder, snowfallAmount6h) {
        builder.addFieldFloat32(26, snowfallAmount6h, 0.0);
    }
    static addSnowfallAmount24h(builder, snowfallAmount24h) {
        builder.addFieldFloat32(27, snowfallAmount24h, 0.0);
    }
    static addSnowfallAmountNext1h(builder, snowfallAmountNext1h) {
        builder.addFieldFloat32(28, snowfallAmountNext1h, 0.0);
    }
    static addSnowfallAmountNext6h(builder, snowfallAmountNext6h) {
        builder.addFieldFloat32(29, snowfallAmountNext6h, 0.0);
    }
    static addSnowfallAmountNext24h(builder, snowfallAmountNext24h) {
        builder.addFieldFloat32(30, snowfallAmountNext24h, 0.0);
    }
    static addTemperature(builder, temperature) {
        builder.addFieldFloat32(31, temperature, 0.0);
    }
    static addTemperatureApparent(builder, temperatureApparent) {
        builder.addFieldFloat32(32, temperatureApparent, 0.0);
    }
    static addUnknown34(builder, unknown34) {
        builder.addFieldFloat32(33, unknown34, 0.0);
    }
    static addTemperatureDewPoint(builder, temperatureDewPoint) {
        builder.addFieldFloat32(34, temperatureDewPoint, 0.0);
    }
    static addUvIndex(builder, uvIndex) {
        builder.addFieldInt8(35, uvIndex, 0);
    }
    static addVisibility(builder, visibility) {
        builder.addFieldFloat32(36, visibility, 0.0);
    }
    static addWindDirection(builder, windDirection) {
        builder.addFieldInt16(37, windDirection, 0);
    }
    static addWindGust(builder, windGust) {
        builder.addFieldFloat32(38, windGust, 0.0);
    }
    static addWindSpeed(builder, windSpeed) {
        builder.addFieldFloat32(39, windSpeed, 0.0);
    }
    static endCurrentWeatherData(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createCurrentWeatherData(builder, metadataOffset, asOf, cloudCover, cloudCoverLowAltPct, cloudCoverMidAltPct, cloudCoverHighAltPct, conditionCode, daylight, humidity, perceivedPrecipitationIntensity, precipitationAmount1h, precipitationAmount6h, precipitationAmount24h, precipitationAmountNext1h, precipitationAmountNext6h, precipitationAmountNext24h, precipitationAmountNext1hByTypeOffset, precipitationAmountNext6hByTypeOffset, precipitationAmountNext24hByTypeOffset, precipitationAmountPrevious1hByTypeOffset, precipitationAmountPrevious6hByTypeOffset, precipitationAmountPrevious24hByTypeOffset, precipitationIntensity, pressure, pressureTrend, snowfallAmount1h, snowfallAmount6h, snowfallAmount24h, snowfallAmountNext1h, snowfallAmountNext6h, snowfallAmountNext24h, temperature, temperatureApparent, unknown34, temperatureDewPoint, uvIndex, visibility, windDirection, windGust, windSpeed) {
        CurrentWeatherData.startCurrentWeatherData(builder);
        CurrentWeatherData.addMetadata(builder, metadataOffset);
        CurrentWeatherData.addAsOf(builder, asOf);
        CurrentWeatherData.addCloudCover(builder, cloudCover);
        CurrentWeatherData.addCloudCoverLowAltPct(builder, cloudCoverLowAltPct);
        CurrentWeatherData.addCloudCoverMidAltPct(builder, cloudCoverMidAltPct);
        CurrentWeatherData.addCloudCoverHighAltPct(builder, cloudCoverHighAltPct);
        CurrentWeatherData.addConditionCode(builder, conditionCode);
        CurrentWeatherData.addDaylight(builder, daylight);
        CurrentWeatherData.addHumidity(builder, humidity);
        CurrentWeatherData.addPerceivedPrecipitationIntensity(builder, perceivedPrecipitationIntensity);
        CurrentWeatherData.addPrecipitationAmount1h(builder, precipitationAmount1h);
        CurrentWeatherData.addPrecipitationAmount6h(builder, precipitationAmount6h);
        CurrentWeatherData.addPrecipitationAmount24h(builder, precipitationAmount24h);
        CurrentWeatherData.addPrecipitationAmountNext1h(builder, precipitationAmountNext1h);
        CurrentWeatherData.addPrecipitationAmountNext6h(builder, precipitationAmountNext6h);
        CurrentWeatherData.addPrecipitationAmountNext24h(builder, precipitationAmountNext24h);
        CurrentWeatherData.addPrecipitationAmountNext1hByType(builder, precipitationAmountNext1hByTypeOffset);
        CurrentWeatherData.addPrecipitationAmountNext6hByType(builder, precipitationAmountNext6hByTypeOffset);
        CurrentWeatherData.addPrecipitationAmountNext24hByType(builder, precipitationAmountNext24hByTypeOffset);
        CurrentWeatherData.addPrecipitationAmountPrevious1hByType(builder, precipitationAmountPrevious1hByTypeOffset);
        CurrentWeatherData.addPrecipitationAmountPrevious6hByType(builder, precipitationAmountPrevious6hByTypeOffset);
        CurrentWeatherData.addPrecipitationAmountPrevious24hByType(builder, precipitationAmountPrevious24hByTypeOffset);
        CurrentWeatherData.addPrecipitationIntensity(builder, precipitationIntensity);
        CurrentWeatherData.addPressure(builder, pressure);
        CurrentWeatherData.addPressureTrend(builder, pressureTrend);
        CurrentWeatherData.addSnowfallAmount1h(builder, snowfallAmount1h);
        CurrentWeatherData.addSnowfallAmount6h(builder, snowfallAmount6h);
        CurrentWeatherData.addSnowfallAmount24h(builder, snowfallAmount24h);
        CurrentWeatherData.addSnowfallAmountNext1h(builder, snowfallAmountNext1h);
        CurrentWeatherData.addSnowfallAmountNext6h(builder, snowfallAmountNext6h);
        CurrentWeatherData.addSnowfallAmountNext24h(builder, snowfallAmountNext24h);
        CurrentWeatherData.addTemperature(builder, temperature);
        CurrentWeatherData.addTemperatureApparent(builder, temperatureApparent);
        CurrentWeatherData.addUnknown34(builder, unknown34);
        CurrentWeatherData.addTemperatureDewPoint(builder, temperatureDewPoint);
        CurrentWeatherData.addUvIndex(builder, uvIndex);
        CurrentWeatherData.addVisibility(builder, visibility);
        CurrentWeatherData.addWindDirection(builder, windDirection);
        CurrentWeatherData.addWindGust(builder, windGust);
        CurrentWeatherData.addWindSpeed(builder, windSpeed);
        return CurrentWeatherData.endCurrentWeatherData(builder);
    }
}

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
class DayPartForecast {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsDayPartForecast(bb, obj) {
        return (obj || new DayPartForecast()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsDayPartForecast(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new DayPartForecast()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    forecastStart() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    forecastEnd() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    cloudCover() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    cloudCoverLowAltPct() {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    cloudCoverMidAltPct() {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    cloudCoverHighAltPct() {
        const offset = this.bb.__offset(this.bb_pos, 14);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    conditionCode() {
        const offset = this.bb.__offset(this.bb_pos, 16);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : WeatherCondition.CLEAR;
    }
    humidity() {
        const offset = this.bb.__offset(this.bb_pos, 18);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    humidityMax() {
        const offset = this.bb.__offset(this.bb_pos, 20);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    humidityMin() {
        const offset = this.bb.__offset(this.bb_pos, 22);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    precipitationAmount() {
        const offset = this.bb.__offset(this.bb_pos, 24);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    precipitationAmountByType(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 26);
        return offset ? (obj || new PrecipitationAmountByType()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    }
    precipitationAmountByTypeLength() {
        const offset = this.bb.__offset(this.bb_pos, 26);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    precipitationChance() {
        const offset = this.bb.__offset(this.bb_pos, 28);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    precipitationType() {
        const offset = this.bb.__offset(this.bb_pos, 30);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : PrecipitationType.CLEAR;
    }
    snowfallAmount() {
        const offset = this.bb.__offset(this.bb_pos, 32);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    temperatureMax() {
        const offset = this.bb.__offset(this.bb_pos, 34);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    temperatureMin() {
        const offset = this.bb.__offset(this.bb_pos, 36);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    visibilityMax() {
        const offset = this.bb.__offset(this.bb_pos, 38);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    visibilityMin() {
        const offset = this.bb.__offset(this.bb_pos, 40);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    windDirection() {
        const offset = this.bb.__offset(this.bb_pos, 42);
        return offset ? this.bb.readInt16(this.bb_pos + offset) : 0;
    }
    windGustSpeedMax() {
        const offset = this.bb.__offset(this.bb_pos, 44);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    windSpeed() {
        const offset = this.bb.__offset(this.bb_pos, 46);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    windSpeedMax() {
        const offset = this.bb.__offset(this.bb_pos, 48);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    static startDayPartForecast(builder) {
        builder.startObject(23);
    }
    static addForecastStart(builder, forecastStart) {
        builder.addFieldInt32(0, forecastStart, 0);
    }
    static addForecastEnd(builder, forecastEnd) {
        builder.addFieldInt32(1, forecastEnd, 0);
    }
    static addCloudCover(builder, cloudCover) {
        builder.addFieldInt8(2, cloudCover, 0);
    }
    static addCloudCoverLowAltPct(builder, cloudCoverLowAltPct) {
        builder.addFieldInt8(3, cloudCoverLowAltPct, 0);
    }
    static addCloudCoverMidAltPct(builder, cloudCoverMidAltPct) {
        builder.addFieldInt8(4, cloudCoverMidAltPct, 0);
    }
    static addCloudCoverHighAltPct(builder, cloudCoverHighAltPct) {
        builder.addFieldInt8(5, cloudCoverHighAltPct, 0);
    }
    static addConditionCode(builder, conditionCode) {
        builder.addFieldInt8(6, conditionCode, WeatherCondition.CLEAR);
    }
    static addHumidity(builder, humidity) {
        builder.addFieldInt8(7, humidity, 0);
    }
    static addHumidityMax(builder, humidityMax) {
        builder.addFieldInt8(8, humidityMax, 0);
    }
    static addHumidityMin(builder, humidityMin) {
        builder.addFieldInt8(9, humidityMin, 0);
    }
    static addPrecipitationAmount(builder, precipitationAmount) {
        builder.addFieldFloat32(10, precipitationAmount, 0.0);
    }
    static addPrecipitationAmountByType(builder, precipitationAmountByTypeOffset) {
        builder.addFieldOffset(11, precipitationAmountByTypeOffset, 0);
    }
    static createPrecipitationAmountByTypeVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startPrecipitationAmountByTypeVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static addPrecipitationChance(builder, precipitationChance) {
        builder.addFieldInt8(12, precipitationChance, 0);
    }
    static addPrecipitationType(builder, precipitationType) {
        builder.addFieldInt8(13, precipitationType, PrecipitationType.CLEAR);
    }
    static addSnowfallAmount(builder, snowfallAmount) {
        builder.addFieldFloat32(14, snowfallAmount, 0.0);
    }
    static addTemperatureMax(builder, temperatureMax) {
        builder.addFieldFloat32(15, temperatureMax, 0.0);
    }
    static addTemperatureMin(builder, temperatureMin) {
        builder.addFieldFloat32(16, temperatureMin, 0.0);
    }
    static addVisibilityMax(builder, visibilityMax) {
        builder.addFieldFloat32(17, visibilityMax, 0.0);
    }
    static addVisibilityMin(builder, visibilityMin) {
        builder.addFieldFloat32(18, visibilityMin, 0.0);
    }
    static addWindDirection(builder, windDirection) {
        builder.addFieldInt16(19, windDirection, 0);
    }
    static addWindGustSpeedMax(builder, windGustSpeedMax) {
        builder.addFieldFloat32(20, windGustSpeedMax, 0.0);
    }
    static addWindSpeed(builder, windSpeed) {
        builder.addFieldFloat32(21, windSpeed, 0.0);
    }
    static addWindSpeedMax(builder, windSpeedMax) {
        builder.addFieldFloat32(22, windSpeedMax, 0.0);
    }
    static endDayPartForecast(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createDayPartForecast(builder, forecastStart, forecastEnd, cloudCover, cloudCoverLowAltPct, cloudCoverMidAltPct, cloudCoverHighAltPct, conditionCode, humidity, humidityMax, humidityMin, precipitationAmount, precipitationAmountByTypeOffset, precipitationChance, precipitationType, snowfallAmount, temperatureMax, temperatureMin, visibilityMax, visibilityMin, windDirection, windGustSpeedMax, windSpeed, windSpeedMax) {
        DayPartForecast.startDayPartForecast(builder);
        DayPartForecast.addForecastStart(builder, forecastStart);
        DayPartForecast.addForecastEnd(builder, forecastEnd);
        DayPartForecast.addCloudCover(builder, cloudCover);
        DayPartForecast.addCloudCoverLowAltPct(builder, cloudCoverLowAltPct);
        DayPartForecast.addCloudCoverMidAltPct(builder, cloudCoverMidAltPct);
        DayPartForecast.addCloudCoverHighAltPct(builder, cloudCoverHighAltPct);
        DayPartForecast.addConditionCode(builder, conditionCode);
        DayPartForecast.addHumidity(builder, humidity);
        DayPartForecast.addHumidityMax(builder, humidityMax);
        DayPartForecast.addHumidityMin(builder, humidityMin);
        DayPartForecast.addPrecipitationAmount(builder, precipitationAmount);
        DayPartForecast.addPrecipitationAmountByType(builder, precipitationAmountByTypeOffset);
        DayPartForecast.addPrecipitationChance(builder, precipitationChance);
        DayPartForecast.addPrecipitationType(builder, precipitationType);
        DayPartForecast.addSnowfallAmount(builder, snowfallAmount);
        DayPartForecast.addTemperatureMax(builder, temperatureMax);
        DayPartForecast.addTemperatureMin(builder, temperatureMin);
        DayPartForecast.addVisibilityMax(builder, visibilityMax);
        DayPartForecast.addVisibilityMin(builder, visibilityMin);
        DayPartForecast.addWindDirection(builder, windDirection);
        DayPartForecast.addWindGustSpeedMax(builder, windGustSpeedMax);
        DayPartForecast.addWindSpeed(builder, windSpeed);
        DayPartForecast.addWindSpeedMax(builder, windSpeedMax);
        return DayPartForecast.endDayPartForecast(builder);
    }
}

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
var MoonPhase;
(function (MoonPhase) {
    MoonPhase[MoonPhase["NEW"] = 0] = "NEW";
    MoonPhase[MoonPhase["WAXING_CRESCENT"] = 1] = "WAXING_CRESCENT";
    MoonPhase[MoonPhase["FIRST_QUARTER"] = 2] = "FIRST_QUARTER";
    MoonPhase[MoonPhase["WAXING_GIBBOUS"] = 3] = "WAXING_GIBBOUS";
    MoonPhase[MoonPhase["FULL"] = 4] = "FULL";
    MoonPhase[MoonPhase["WANING_GIBBOUS"] = 5] = "WANING_GIBBOUS";
    MoonPhase[MoonPhase["THIRD_QUARTER"] = 6] = "THIRD_QUARTER";
    MoonPhase[MoonPhase["WANING_CRESCENT"] = 7] = "WANING_CRESCENT";
})(MoonPhase || (MoonPhase = {}));

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
class DayWeatherConditions {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsDayWeatherConditions(bb, obj) {
        return (obj || new DayWeatherConditions()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsDayWeatherConditions(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new DayWeatherConditions()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    forecastStart() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    forecastEnd() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    conditionCode() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : WeatherCondition.CLEAR;
    }
    humidityMax() {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    humidityMin() {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    maxUvIndex() {
        const offset = this.bb.__offset(this.bb_pos, 14);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    moonPhase() {
        const offset = this.bb.__offset(this.bb_pos, 16);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : MoonPhase.NEW;
    }
    moonrise() {
        const offset = this.bb.__offset(this.bb_pos, 18);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    moonset() {
        const offset = this.bb.__offset(this.bb_pos, 20);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    precipitationAmount() {
        const offset = this.bb.__offset(this.bb_pos, 22);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    precipitationAmountByType(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 24);
        return offset ? (obj || new PrecipitationAmountByType()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    }
    precipitationAmountByTypeLength() {
        const offset = this.bb.__offset(this.bb_pos, 24);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    precipitationChance() {
        const offset = this.bb.__offset(this.bb_pos, 26);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    precipitationType() {
        const offset = this.bb.__offset(this.bb_pos, 28);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : PrecipitationType.CLEAR;
    }
    snowfallAmount() {
        const offset = this.bb.__offset(this.bb_pos, 30);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    solarMidnight() {
        const offset = this.bb.__offset(this.bb_pos, 32);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    }
    solarNoon() {
        const offset = this.bb.__offset(this.bb_pos, 34);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    }
    sunrise() {
        const offset = this.bb.__offset(this.bb_pos, 36);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    }
    sunriseCivil() {
        const offset = this.bb.__offset(this.bb_pos, 38);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    }
    sunriseNautical() {
        const offset = this.bb.__offset(this.bb_pos, 40);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    }
    sunriseAstronomical() {
        const offset = this.bb.__offset(this.bb_pos, 42);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    }
    sunset() {
        const offset = this.bb.__offset(this.bb_pos, 44);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    }
    sunsetCivil() {
        const offset = this.bb.__offset(this.bb_pos, 46);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    }
    sunsetNautical() {
        const offset = this.bb.__offset(this.bb_pos, 48);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    }
    sunsetAstronomical() {
        const offset = this.bb.__offset(this.bb_pos, 50);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    }
    temperatureMax() {
        const offset = this.bb.__offset(this.bb_pos, 52);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    temperatureMaxTime() {
        const offset = this.bb.__offset(this.bb_pos, 54);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    temperatureMin() {
        const offset = this.bb.__offset(this.bb_pos, 56);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    temperatureMinTime() {
        const offset = this.bb.__offset(this.bb_pos, 58);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    windGustSpeedMax() {
        const offset = this.bb.__offset(this.bb_pos, 60);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    windSpeedAvg() {
        const offset = this.bb.__offset(this.bb_pos, 62);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    windSpeedMax() {
        const offset = this.bb.__offset(this.bb_pos, 64);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    visibilityMax() {
        const offset = this.bb.__offset(this.bb_pos, 66);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    visibilityMin() {
        const offset = this.bb.__offset(this.bb_pos, 68);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    daytimeForecast(obj) {
        const offset = this.bb.__offset(this.bb_pos, 70);
        return offset ? (obj || new DayPartForecast()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    overnightForecast(obj) {
        const offset = this.bb.__offset(this.bb_pos, 72);
        return offset ? (obj || new DayPartForecast()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    restOfDayForecast(obj) {
        const offset = this.bb.__offset(this.bb_pos, 74);
        return offset ? (obj || new DayPartForecast()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    static startDayWeatherConditions(builder) {
        builder.startObject(36);
    }
    static addForecastStart(builder, forecastStart) {
        builder.addFieldInt32(0, forecastStart, 0);
    }
    static addForecastEnd(builder, forecastEnd) {
        builder.addFieldInt32(1, forecastEnd, 0);
    }
    static addConditionCode(builder, conditionCode) {
        builder.addFieldInt8(2, conditionCode, WeatherCondition.CLEAR);
    }
    static addHumidityMax(builder, humidityMax) {
        builder.addFieldInt8(3, humidityMax, 0);
    }
    static addHumidityMin(builder, humidityMin) {
        builder.addFieldInt8(4, humidityMin, 0);
    }
    static addMaxUvIndex(builder, maxUvIndex) {
        builder.addFieldInt8(5, maxUvIndex, 0);
    }
    static addMoonPhase(builder, moonPhase) {
        builder.addFieldInt8(6, moonPhase, MoonPhase.NEW);
    }
    static addMoonrise(builder, moonrise) {
        builder.addFieldInt32(7, moonrise, 0);
    }
    static addMoonset(builder, moonset) {
        builder.addFieldInt32(8, moonset, 0);
    }
    static addPrecipitationAmount(builder, precipitationAmount) {
        builder.addFieldFloat32(9, precipitationAmount, 0.0);
    }
    static addPrecipitationAmountByType(builder, precipitationAmountByTypeOffset) {
        builder.addFieldOffset(10, precipitationAmountByTypeOffset, 0);
    }
    static createPrecipitationAmountByTypeVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startPrecipitationAmountByTypeVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static addPrecipitationChance(builder, precipitationChance) {
        builder.addFieldInt8(11, precipitationChance, 0);
    }
    static addPrecipitationType(builder, precipitationType) {
        builder.addFieldInt8(12, precipitationType, PrecipitationType.CLEAR);
    }
    static addSnowfallAmount(builder, snowfallAmount) {
        builder.addFieldFloat32(13, snowfallAmount, 0.0);
    }
    static addSolarMidnight(builder, solarMidnight) {
        builder.addFieldInt32(14, solarMidnight, 0);
    }
    static addSolarNoon(builder, solarNoon) {
        builder.addFieldInt32(15, solarNoon, 0);
    }
    static addSunrise(builder, sunrise) {
        builder.addFieldInt32(16, sunrise, 0);
    }
    static addSunriseCivil(builder, sunriseCivil) {
        builder.addFieldInt32(17, sunriseCivil, 0);
    }
    static addSunriseNautical(builder, sunriseNautical) {
        builder.addFieldInt32(18, sunriseNautical, 0);
    }
    static addSunriseAstronomical(builder, sunriseAstronomical) {
        builder.addFieldInt32(19, sunriseAstronomical, 0);
    }
    static addSunset(builder, sunset) {
        builder.addFieldInt32(20, sunset, 0);
    }
    static addSunsetCivil(builder, sunsetCivil) {
        builder.addFieldInt32(21, sunsetCivil, 0);
    }
    static addSunsetNautical(builder, sunsetNautical) {
        builder.addFieldInt32(22, sunsetNautical, 0);
    }
    static addSunsetAstronomical(builder, sunsetAstronomical) {
        builder.addFieldInt32(23, sunsetAstronomical, 0);
    }
    static addTemperatureMax(builder, temperatureMax) {
        builder.addFieldFloat32(24, temperatureMax, 0.0);
    }
    static addTemperatureMaxTime(builder, temperatureMaxTime) {
        builder.addFieldInt32(25, temperatureMaxTime, 0);
    }
    static addTemperatureMin(builder, temperatureMin) {
        builder.addFieldFloat32(26, temperatureMin, 0.0);
    }
    static addTemperatureMinTime(builder, temperatureMinTime) {
        builder.addFieldInt32(27, temperatureMinTime, 0);
    }
    static addWindGustSpeedMax(builder, windGustSpeedMax) {
        builder.addFieldFloat32(28, windGustSpeedMax, 0.0);
    }
    static addWindSpeedAvg(builder, windSpeedAvg) {
        builder.addFieldFloat32(29, windSpeedAvg, 0.0);
    }
    static addWindSpeedMax(builder, windSpeedMax) {
        builder.addFieldFloat32(30, windSpeedMax, 0.0);
    }
    static addVisibilityMax(builder, visibilityMax) {
        builder.addFieldFloat32(31, visibilityMax, 0.0);
    }
    static addVisibilityMin(builder, visibilityMin) {
        builder.addFieldFloat32(32, visibilityMin, 0.0);
    }
    static addDaytimeForecast(builder, daytimeForecastOffset) {
        builder.addFieldOffset(33, daytimeForecastOffset, 0);
    }
    static addOvernightForecast(builder, overnightForecastOffset) {
        builder.addFieldOffset(34, overnightForecastOffset, 0);
    }
    static addRestOfDayForecast(builder, restOfDayForecastOffset) {
        builder.addFieldOffset(35, restOfDayForecastOffset, 0);
    }
    static endDayWeatherConditions(builder) {
        const offset = builder.endObject();
        return offset;
    }
}

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
class DailyForecastData {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsDailyForecastData(bb, obj) {
        return (obj || new DailyForecastData()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsDailyForecastData(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new DailyForecastData()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    metadata(obj) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? (obj || new Metadata()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    days(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? (obj || new DayWeatherConditions()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    }
    daysLength() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    static startDailyForecastData(builder) {
        builder.startObject(2);
    }
    static addMetadata(builder, metadataOffset) {
        builder.addFieldOffset(0, metadataOffset, 0);
    }
    static addDays(builder, daysOffset) {
        builder.addFieldOffset(1, daysOffset, 0);
    }
    static createDaysVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startDaysVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static endDailyForecastData(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createDailyForecastData(builder, metadataOffset, daysOffset) {
        DailyForecastData.startDailyForecastData(builder);
        DailyForecastData.addMetadata(builder, metadataOffset);
        DailyForecastData.addDays(builder, daysOffset);
        return DailyForecastData.endDailyForecastData(builder);
    }
}

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
class ForecastMinute {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsForecastMinute(bb, obj) {
        return (obj || new ForecastMinute()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsForecastMinute(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new ForecastMinute()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    startTime() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    precipitationChance() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    precipitationIntensity() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    perceivedPrecipitationIntensity() {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    static startForecastMinute(builder) {
        builder.startObject(4);
    }
    static addStartTime(builder, startTime) {
        builder.addFieldInt32(0, startTime, 0);
    }
    static addPrecipitationChance(builder, precipitationChance) {
        builder.addFieldInt8(1, precipitationChance, 0);
    }
    static addPrecipitationIntensity(builder, precipitationIntensity) {
        builder.addFieldFloat32(2, precipitationIntensity, 0.0);
    }
    static addPerceivedPrecipitationIntensity(builder, perceivedPrecipitationIntensity) {
        builder.addFieldFloat32(3, perceivedPrecipitationIntensity, 0.0);
    }
    static endForecastMinute(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createForecastMinute(builder, startTime, precipitationChance, precipitationIntensity, perceivedPrecipitationIntensity) {
        ForecastMinute.startForecastMinute(builder);
        ForecastMinute.addStartTime(builder, startTime);
        ForecastMinute.addPrecipitationChance(builder, precipitationChance);
        ForecastMinute.addPrecipitationIntensity(builder, precipitationIntensity);
        ForecastMinute.addPerceivedPrecipitationIntensity(builder, perceivedPrecipitationIntensity);
        return ForecastMinute.endForecastMinute(builder);
    }
}

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
class ForecastPeriodSummary {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsForecastPeriodSummary(bb, obj) {
        return (obj || new ForecastPeriodSummary()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsForecastPeriodSummary(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new ForecastPeriodSummary()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    startTime() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    endTime() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    condition() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : PrecipitationType.CLEAR;
    }
    precipitationChance() {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    precipitationIntensity() {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    static startForecastPeriodSummary(builder) {
        builder.startObject(5);
    }
    static addStartTime(builder, startTime) {
        builder.addFieldInt32(0, startTime, 0);
    }
    static addEndTime(builder, endTime) {
        builder.addFieldInt32(1, endTime, 0);
    }
    static addCondition(builder, condition) {
        builder.addFieldInt8(2, condition, PrecipitationType.CLEAR);
    }
    static addPrecipitationChance(builder, precipitationChance) {
        builder.addFieldInt8(3, precipitationChance, 0);
    }
    static addPrecipitationIntensity(builder, precipitationIntensity) {
        builder.addFieldFloat32(4, precipitationIntensity, 0.0);
    }
    static endForecastPeriodSummary(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createForecastPeriodSummary(builder, startTime, endTime, condition, precipitationChance, precipitationIntensity) {
        ForecastPeriodSummary.startForecastPeriodSummary(builder);
        ForecastPeriodSummary.addStartTime(builder, startTime);
        ForecastPeriodSummary.addEndTime(builder, endTime);
        ForecastPeriodSummary.addCondition(builder, condition);
        ForecastPeriodSummary.addPrecipitationChance(builder, precipitationChance);
        ForecastPeriodSummary.addPrecipitationIntensity(builder, precipitationIntensity);
        return ForecastPeriodSummary.endForecastPeriodSummary(builder);
    }
}

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
class HistoricalComparison {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsHistoricalComparison(bb, obj) {
        return (obj || new HistoricalComparison()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsHistoricalComparison(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new HistoricalComparison()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    metadata(obj) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? (obj || new Metadata()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    comparisons(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? (obj || new Comparison()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    }
    comparisonsLength() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    static startHistoricalComparison(builder) {
        builder.startObject(2);
    }
    static addMetadata(builder, metadataOffset) {
        builder.addFieldOffset(0, metadataOffset, 0);
    }
    static addComparisons(builder, comparisonsOffset) {
        builder.addFieldOffset(1, comparisonsOffset, 0);
    }
    static createComparisonsVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startComparisonsVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static endHistoricalComparison(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createHistoricalComparison(builder, metadataOffset, comparisonsOffset) {
        HistoricalComparison.startHistoricalComparison(builder);
        HistoricalComparison.addMetadata(builder, metadataOffset);
        HistoricalComparison.addComparisons(builder, comparisonsOffset);
        return HistoricalComparison.endHistoricalComparison(builder);
    }
}

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
class HourWeatherConditions {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsHourWeatherConditions(bb, obj) {
        return (obj || new HourWeatherConditions()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsHourWeatherConditions(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new HourWeatherConditions()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    forecastStart() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    }
    cloudCover() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    cloudCoverLowAltPct() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    cloudCoverMidAltPct() {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    cloudCoverHighAltPct() {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    conditionCode() {
        const offset = this.bb.__offset(this.bb_pos, 14);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : WeatherCondition.CLEAR;
    }
    daylight() {
        const offset = this.bb.__offset(this.bb_pos, 16);
        return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
    }
    humidity() {
        const offset = this.bb.__offset(this.bb_pos, 18);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    perceivedPrecipitationIntensity() {
        const offset = this.bb.__offset(this.bb_pos, 20);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    precipitationAmount() {
        const offset = this.bb.__offset(this.bb_pos, 22);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    precipitationIntensity() {
        const offset = this.bb.__offset(this.bb_pos, 24);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    precipitationChance() {
        const offset = this.bb.__offset(this.bb_pos, 26);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    precipitationType() {
        const offset = this.bb.__offset(this.bb_pos, 28);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : PrecipitationType.CLEAR;
    }
    pressure() {
        const offset = this.bb.__offset(this.bb_pos, 30);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    pressureTrend() {
        const offset = this.bb.__offset(this.bb_pos, 32);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : PressureTrend.RISING;
    }
    snowfallAmount() {
        const offset = this.bb.__offset(this.bb_pos, 34);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    snowfallIntensity() {
        const offset = this.bb.__offset(this.bb_pos, 36);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    temperature() {
        const offset = this.bb.__offset(this.bb_pos, 38);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    temperatureApparent() {
        const offset = this.bb.__offset(this.bb_pos, 40);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    unknown20() {
        const offset = this.bb.__offset(this.bb_pos, 42);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    temperatureDewPoint() {
        const offset = this.bb.__offset(this.bb_pos, 44);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    uvIndex() {
        const offset = this.bb.__offset(this.bb_pos, 46);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    visibility() {
        const offset = this.bb.__offset(this.bb_pos, 48);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    windDirection() {
        const offset = this.bb.__offset(this.bb_pos, 50);
        return offset ? this.bb.readInt16(this.bb_pos + offset) : 0;
    }
    windGust() {
        const offset = this.bb.__offset(this.bb_pos, 52);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    windSpeed() {
        const offset = this.bb.__offset(this.bb_pos, 54);
        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
    }
    static startHourWeatherConditions(builder) {
        builder.startObject(26);
    }
    static addForecastStart(builder, forecastStart) {
        builder.addFieldInt32(0, forecastStart, 0);
    }
    static addCloudCover(builder, cloudCover) {
        builder.addFieldInt8(1, cloudCover, 0);
    }
    static addCloudCoverLowAltPct(builder, cloudCoverLowAltPct) {
        builder.addFieldInt8(2, cloudCoverLowAltPct, 0);
    }
    static addCloudCoverMidAltPct(builder, cloudCoverMidAltPct) {
        builder.addFieldInt8(3, cloudCoverMidAltPct, 0);
    }
    static addCloudCoverHighAltPct(builder, cloudCoverHighAltPct) {
        builder.addFieldInt8(4, cloudCoverHighAltPct, 0);
    }
    static addConditionCode(builder, conditionCode) {
        builder.addFieldInt8(5, conditionCode, WeatherCondition.CLEAR);
    }
    static addDaylight(builder, daylight) {
        builder.addFieldInt8(6, +daylight, +false);
    }
    static addHumidity(builder, humidity) {
        builder.addFieldInt8(7, humidity, 0);
    }
    static addPerceivedPrecipitationIntensity(builder, perceivedPrecipitationIntensity) {
        builder.addFieldFloat32(8, perceivedPrecipitationIntensity, 0.0);
    }
    static addPrecipitationAmount(builder, precipitationAmount) {
        builder.addFieldFloat32(9, precipitationAmount, 0.0);
    }
    static addPrecipitationIntensity(builder, precipitationIntensity) {
        builder.addFieldFloat32(10, precipitationIntensity, 0.0);
    }
    static addPrecipitationChance(builder, precipitationChance) {
        builder.addFieldInt8(11, precipitationChance, 0);
    }
    static addPrecipitationType(builder, precipitationType) {
        builder.addFieldInt8(12, precipitationType, PrecipitationType.CLEAR);
    }
    static addPressure(builder, pressure) {
        builder.addFieldFloat32(13, pressure, 0.0);
    }
    static addPressureTrend(builder, pressureTrend) {
        builder.addFieldInt8(14, pressureTrend, PressureTrend.RISING);
    }
    static addSnowfallAmount(builder, snowfallAmount) {
        builder.addFieldFloat32(15, snowfallAmount, 0.0);
    }
    static addSnowfallIntensity(builder, snowfallIntensity) {
        builder.addFieldFloat32(16, snowfallIntensity, 0.0);
    }
    static addTemperature(builder, temperature) {
        builder.addFieldFloat32(17, temperature, 0.0);
    }
    static addTemperatureApparent(builder, temperatureApparent) {
        builder.addFieldFloat32(18, temperatureApparent, 0.0);
    }
    static addUnknown20(builder, unknown20) {
        builder.addFieldFloat32(19, unknown20, 0.0);
    }
    static addTemperatureDewPoint(builder, temperatureDewPoint) {
        builder.addFieldFloat32(20, temperatureDewPoint, 0.0);
    }
    static addUvIndex(builder, uvIndex) {
        builder.addFieldInt8(21, uvIndex, 0);
    }
    static addVisibility(builder, visibility) {
        builder.addFieldFloat32(22, visibility, 0.0);
    }
    static addWindDirection(builder, windDirection) {
        builder.addFieldInt16(23, windDirection, 0);
    }
    static addWindGust(builder, windGust) {
        builder.addFieldFloat32(24, windGust, 0.0);
    }
    static addWindSpeed(builder, windSpeed) {
        builder.addFieldFloat32(25, windSpeed, 0.0);
    }
    static endHourWeatherConditions(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createHourWeatherConditions(builder, forecastStart, cloudCover, cloudCoverLowAltPct, cloudCoverMidAltPct, cloudCoverHighAltPct, conditionCode, daylight, humidity, perceivedPrecipitationIntensity, precipitationAmount, precipitationIntensity, precipitationChance, precipitationType, pressure, pressureTrend, snowfallAmount, snowfallIntensity, temperature, temperatureApparent, unknown20, temperatureDewPoint, uvIndex, visibility, windDirection, windGust, windSpeed) {
        HourWeatherConditions.startHourWeatherConditions(builder);
        HourWeatherConditions.addForecastStart(builder, forecastStart);
        HourWeatherConditions.addCloudCover(builder, cloudCover);
        HourWeatherConditions.addCloudCoverLowAltPct(builder, cloudCoverLowAltPct);
        HourWeatherConditions.addCloudCoverMidAltPct(builder, cloudCoverMidAltPct);
        HourWeatherConditions.addCloudCoverHighAltPct(builder, cloudCoverHighAltPct);
        HourWeatherConditions.addConditionCode(builder, conditionCode);
        HourWeatherConditions.addDaylight(builder, daylight);
        HourWeatherConditions.addHumidity(builder, humidity);
        HourWeatherConditions.addPerceivedPrecipitationIntensity(builder, perceivedPrecipitationIntensity);
        HourWeatherConditions.addPrecipitationAmount(builder, precipitationAmount);
        HourWeatherConditions.addPrecipitationIntensity(builder, precipitationIntensity);
        HourWeatherConditions.addPrecipitationChance(builder, precipitationChance);
        HourWeatherConditions.addPrecipitationType(builder, precipitationType);
        HourWeatherConditions.addPressure(builder, pressure);
        HourWeatherConditions.addPressureTrend(builder, pressureTrend);
        HourWeatherConditions.addSnowfallAmount(builder, snowfallAmount);
        HourWeatherConditions.addSnowfallIntensity(builder, snowfallIntensity);
        HourWeatherConditions.addTemperature(builder, temperature);
        HourWeatherConditions.addTemperatureApparent(builder, temperatureApparent);
        HourWeatherConditions.addUnknown20(builder, unknown20);
        HourWeatherConditions.addTemperatureDewPoint(builder, temperatureDewPoint);
        HourWeatherConditions.addUvIndex(builder, uvIndex);
        HourWeatherConditions.addVisibility(builder, visibility);
        HourWeatherConditions.addWindDirection(builder, windDirection);
        HourWeatherConditions.addWindGust(builder, windGust);
        HourWeatherConditions.addWindSpeed(builder, windSpeed);
        return HourWeatherConditions.endHourWeatherConditions(builder);
    }
}

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
class HourlyForecastData {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsHourlyForecastData(bb, obj) {
        return (obj || new HourlyForecastData()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsHourlyForecastData(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new HourlyForecastData()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    metadata(obj) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? (obj || new Metadata()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    hours(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? (obj || new HourWeatherConditions()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    }
    hoursLength() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    static startHourlyForecastData(builder) {
        builder.startObject(2);
    }
    static addMetadata(builder, metadataOffset) {
        builder.addFieldOffset(0, metadataOffset, 0);
    }
    static addHours(builder, hoursOffset) {
        builder.addFieldOffset(1, hoursOffset, 0);
    }
    static createHoursVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startHoursVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static endHourlyForecastData(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createHourlyForecastData(builder, metadataOffset, hoursOffset) {
        HourlyForecastData.startHourlyForecastData(builder);
        HourlyForecastData.addMetadata(builder, metadataOffset);
        HourlyForecastData.addHours(builder, hoursOffset);
        return HourlyForecastData.endHourlyForecastData(builder);
    }
}

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
class ID {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsID(bb, obj) {
        return (obj || new ID()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsID(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new ID()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    uuid(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    static startID(builder) {
        builder.startObject(1);
    }
    static addUuid(builder, uuidOffset) {
        builder.addFieldOffset(0, uuidOffset, 0);
    }
    static endID(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createID(builder, uuidOffset) {
        ID.startID(builder);
        ID.addUuid(builder, uuidOffset);
        return ID.endID(builder);
    }
}

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
var ImportanceType;
(function (ImportanceType) {
    ImportanceType[ImportanceType["NORMAL"] = 0] = "NORMAL";
    ImportanceType[ImportanceType["LOW"] = 1] = "LOW";
    ImportanceType[ImportanceType["HIGH"] = 2] = "HIGH";
    ImportanceType[ImportanceType["UNKNOWN3"] = 3] = "UNKNOWN3";
    ImportanceType[ImportanceType["UNKNOWN4"] = 4] = "UNKNOWN4";
    ImportanceType[ImportanceType["UNKNOWN5"] = 5] = "UNKNOWN5";
})(ImportanceType || (ImportanceType = {}));

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
var PlacementType;
(function (PlacementType) {
    PlacementType[PlacementType["UNKNOWN0"] = 0] = "UNKNOWN0";
    PlacementType[PlacementType["AIR_QUALITY_DETAILS"] = 1] = "AIR_QUALITY_DETAILS";
    PlacementType[PlacementType["UNKNOWN2"] = 2] = "UNKNOWN2";
    PlacementType[PlacementType["UNKNOWN3"] = 3] = "UNKNOWN3";
    PlacementType[PlacementType["UNKNOWN4"] = 4] = "UNKNOWN4";
    PlacementType[PlacementType["UNKNOWN5"] = 5] = "UNKNOWN5";
    PlacementType[PlacementType["UNKNOWN6"] = 6] = "UNKNOWN6";
    PlacementType[PlacementType["UNKNOWN7"] = 7] = "UNKNOWN7";
    PlacementType[PlacementType["UNKNOWN8"] = 8] = "UNKNOWN8";
    PlacementType[PlacementType["UNKNOWN9"] = 9] = "UNKNOWN9";
    PlacementType[PlacementType["UNKNOWN10"] = 10] = "UNKNOWN10";
    PlacementType[PlacementType["UNKNOWN11"] = 11] = "UNKNOWN11";
    PlacementType[PlacementType["UV_DETAILS"] = 12] = "UV_DETAILS";
    PlacementType[PlacementType["UNKNOWN13"] = 13] = "UNKNOWN13";
    PlacementType[PlacementType["UNKNOWN14"] = 14] = "UNKNOWN14";
    PlacementType[PlacementType["UNKNOWN15"] = 15] = "UNKNOWN15";
    PlacementType[PlacementType["UNKNOWN16"] = 16] = "UNKNOWN16";
    PlacementType[PlacementType["UNKNOWN17"] = 17] = "UNKNOWN17";
    PlacementType[PlacementType["UNKNOWN18"] = 18] = "UNKNOWN18";
})(PlacementType || (PlacementType = {}));

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
class Placement {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsPlacement(bb, obj) {
        return (obj || new Placement()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsPlacement(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new Placement()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    priority() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    articles(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? (obj || new Articles()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    }
    articlesLength() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    placement() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : PlacementType.UNKNOWN0;
    }
    static startPlacement(builder) {
        builder.startObject(3);
    }
    static addPriority(builder, priority) {
        builder.addFieldInt8(0, priority, 0);
    }
    static addArticles(builder, articlesOffset) {
        builder.addFieldOffset(1, articlesOffset, 0);
    }
    static createArticlesVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startArticlesVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static addPlacement(builder, placement) {
        builder.addFieldInt8(2, placement, PlacementType.UNKNOWN0);
    }
    static endPlacement(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createPlacement(builder, priority, articlesOffset, placement) {
        Placement.startPlacement(builder);
        Placement.addPriority(builder, priority);
        Placement.addArticles(builder, articlesOffset);
        Placement.addPlacement(builder, placement);
        return Placement.endPlacement(builder);
    }
}

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
class News {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsNews(bb, obj) {
        return (obj || new News()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsNews(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new News()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    metadata(obj) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? (obj || new Metadata()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    placements(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? (obj || new Placement()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    }
    placementsLength() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    static startNews(builder) {
        builder.startObject(2);
    }
    static addMetadata(builder, metadataOffset) {
        builder.addFieldOffset(0, metadataOffset, 0);
    }
    static addPlacements(builder, placementsOffset) {
        builder.addFieldOffset(1, placementsOffset, 0);
    }
    static createPlacementsVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startPlacementsVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static endNews(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createNews(builder, metadataOffset, placementsOffset) {
        News.startNews(builder);
        News.addMetadata(builder, metadataOffset);
        News.addPlacements(builder, placementsOffset);
        return News.endNews(builder);
    }
}

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
class NextHourForecastData {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsNextHourForecastData(bb, obj) {
        return (obj || new NextHourForecastData()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsNextHourForecastData(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new NextHourForecastData()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    metadata(obj) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? (obj || new Metadata()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    condition(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? (obj || new Condition()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    }
    conditionLength() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    summary(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? (obj || new ForecastPeriodSummary()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    }
    summaryLength() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    forecastStart() {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    forecastEnd() {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    minutes(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 14);
        return offset ? (obj || new ForecastMinute()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    }
    minutesLength() {
        const offset = this.bb.__offset(this.bb_pos, 14);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    static startNextHourForecastData(builder) {
        builder.startObject(6);
    }
    static addMetadata(builder, metadataOffset) {
        builder.addFieldOffset(0, metadataOffset, 0);
    }
    static addCondition(builder, conditionOffset) {
        builder.addFieldOffset(1, conditionOffset, 0);
    }
    static createConditionVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startConditionVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static addSummary(builder, summaryOffset) {
        builder.addFieldOffset(2, summaryOffset, 0);
    }
    static createSummaryVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startSummaryVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static addForecastStart(builder, forecastStart) {
        builder.addFieldInt32(3, forecastStart, 0);
    }
    static addForecastEnd(builder, forecastEnd) {
        builder.addFieldInt32(4, forecastEnd, 0);
    }
    static addMinutes(builder, minutesOffset) {
        builder.addFieldOffset(5, minutesOffset, 0);
    }
    static createMinutesVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startMinutesVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static endNextHourForecastData(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createNextHourForecastData(builder, metadataOffset, conditionOffset, summaryOffset, forecastStart, forecastEnd, minutesOffset) {
        NextHourForecastData.startNextHourForecastData(builder);
        NextHourForecastData.addMetadata(builder, metadataOffset);
        NextHourForecastData.addCondition(builder, conditionOffset);
        NextHourForecastData.addSummary(builder, summaryOffset);
        NextHourForecastData.addForecastStart(builder, forecastStart);
        NextHourForecastData.addForecastEnd(builder, forecastEnd);
        NextHourForecastData.addMinutes(builder, minutesOffset);
        return NextHourForecastData.endNextHourForecastData(builder);
    }
}

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
var ResponseType;
(function (ResponseType) {
    ResponseType[ResponseType["UNKNOWN0"] = 0] = "UNKNOWN0";
    ResponseType[ResponseType["SHELTER"] = 1] = "SHELTER";
    ResponseType[ResponseType["EVACUATE"] = 2] = "EVACUATE";
    ResponseType[ResponseType["PREPARE"] = 3] = "PREPARE";
    ResponseType[ResponseType["EXECUTE"] = 4] = "EXECUTE";
    ResponseType[ResponseType["AVOID"] = 5] = "AVOID";
    ResponseType[ResponseType["MONITOR"] = 6] = "MONITOR";
    ResponseType[ResponseType["ACCESS"] = 7] = "ACCESS";
    ResponseType[ResponseType["ALLCLEAR"] = 8] = "ALLCLEAR";
    ResponseType[ResponseType["NONE"] = 9] = "NONE";
})(ResponseType || (ResponseType = {}));

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
var Severity;
(function (Severity) {
    Severity[Severity["UNKNOWN"] = 0] = "UNKNOWN";
    Severity[Severity["EXTREME"] = 1] = "EXTREME";
    Severity[Severity["SEVERE"] = 2] = "SEVERE";
    Severity[Severity["MODERATE"] = 3] = "MODERATE";
    Severity[Severity["MINOR"] = 4] = "MINOR";
    Severity[Severity["UNKNOWN5"] = 5] = "UNKNOWN5";
})(Severity || (Severity = {}));

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
var SignificanceType;
(function (SignificanceType) {
    SignificanceType[SignificanceType["UNKNOWN"] = 0] = "UNKNOWN";
    SignificanceType[SignificanceType["UNKNOWN1"] = 1] = "UNKNOWN1";
    SignificanceType[SignificanceType["UNKNOWN2"] = 2] = "UNKNOWN2";
    SignificanceType[SignificanceType["UNKNOWN3"] = 3] = "UNKNOWN3";
    SignificanceType[SignificanceType["UNKNOWN4"] = 4] = "UNKNOWN4";
    SignificanceType[SignificanceType["UNKNOWN5"] = 5] = "UNKNOWN5";
    SignificanceType[SignificanceType["UNKNOWN6"] = 6] = "UNKNOWN6";
    SignificanceType[SignificanceType["UNKNOWN7"] = 7] = "UNKNOWN7";
    SignificanceType[SignificanceType["UNKNOWN8"] = 8] = "UNKNOWN8";
    SignificanceType[SignificanceType["UNKNOWN9"] = 9] = "UNKNOWN9";
    SignificanceType[SignificanceType["STATEMENT"] = 10] = "STATEMENT";
    SignificanceType[SignificanceType["UNKNOWN11"] = 11] = "UNKNOWN11";
    SignificanceType[SignificanceType["ADVISORY"] = 12] = "ADVISORY";
    SignificanceType[SignificanceType["UNKNOWN13"] = 13] = "UNKNOWN13";
})(SignificanceType || (SignificanceType = {}));

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
var Urgency;
(function (Urgency) {
    Urgency[Urgency["UNKNOWN"] = 0] = "UNKNOWN";
    Urgency[Urgency["IMMEDIATE"] = 1] = "IMMEDIATE";
    Urgency[Urgency["EXPECTED"] = 2] = "EXPECTED";
    Urgency[Urgency["FUTURE"] = 3] = "FUTURE";
    Urgency[Urgency["PAST"] = 4] = "PAST";
    Urgency[Urgency["UNKNOWN5"] = 5] = "UNKNOWN5";
})(Urgency || (Urgency = {}));

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
class WeatherAlertSummary {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsWeatherAlertSummary(bb, obj) {
        return (obj || new WeatherAlertSummary()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsWeatherAlertSummary(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new WeatherAlertSummary()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    id(obj) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? (obj || new ID()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    areaId(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    unknown3() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    attributionUrl(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    countryCode(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    description(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 14);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    token(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 16);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    effectiveTime() {
        const offset = this.bb.__offset(this.bb_pos, 18);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    expireTime() {
        const offset = this.bb.__offset(this.bb_pos, 20);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    issuedTime() {
        const offset = this.bb.__offset(this.bb_pos, 22);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    eventOnsetTime() {
        const offset = this.bb.__offset(this.bb_pos, 24);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    eventEndTime() {
        const offset = this.bb.__offset(this.bb_pos, 26);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    detailsUrl(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 28);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    phenomenon(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 30);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    severity() {
        const offset = this.bb.__offset(this.bb_pos, 32);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : Severity.UNKNOWN;
    }
    significance() {
        const offset = this.bb.__offset(this.bb_pos, 34);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : SignificanceType.UNKNOWN;
    }
    source(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 36);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    eventSource(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 38);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    urgency() {
        const offset = this.bb.__offset(this.bb_pos, 40);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : Urgency.UNKNOWN;
    }
    certainty() {
        const offset = this.bb.__offset(this.bb_pos, 42);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : Certainty.UNKNOWN;
    }
    importance() {
        const offset = this.bb.__offset(this.bb_pos, 44);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : ImportanceType.NORMAL;
    }
    responses(index) {
        const offset = this.bb.__offset(this.bb_pos, 46);
        return offset ? this.bb.readInt8(this.bb.__vector(this.bb_pos + offset) + index) : 0;
    }
    responsesLength() {
        const offset = this.bb.__offset(this.bb_pos, 46);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    responsesArray() {
        const offset = this.bb.__offset(this.bb_pos, 46);
        return offset ? new Int8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
    }
    unknown23() {
        const offset = this.bb.__offset(this.bb_pos, 48);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    unknown24() {
        const offset = this.bb.__offset(this.bb_pos, 50);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    static startWeatherAlertSummary(builder) {
        builder.startObject(24);
    }
    static addId(builder, idOffset) {
        builder.addFieldOffset(0, idOffset, 0);
    }
    static addAreaId(builder, areaIdOffset) {
        builder.addFieldOffset(1, areaIdOffset, 0);
    }
    static addUnknown3(builder, unknown3) {
        builder.addFieldInt8(2, unknown3, 0);
    }
    static addAttributionUrl(builder, attributionUrlOffset) {
        builder.addFieldOffset(3, attributionUrlOffset, 0);
    }
    static addCountryCode(builder, countryCodeOffset) {
        builder.addFieldOffset(4, countryCodeOffset, 0);
    }
    static addDescription(builder, descriptionOffset) {
        builder.addFieldOffset(5, descriptionOffset, 0);
    }
    static addToken(builder, tokenOffset) {
        builder.addFieldOffset(6, tokenOffset, 0);
    }
    static addEffectiveTime(builder, effectiveTime) {
        builder.addFieldInt32(7, effectiveTime, 0);
    }
    static addExpireTime(builder, expireTime) {
        builder.addFieldInt32(8, expireTime, 0);
    }
    static addIssuedTime(builder, issuedTime) {
        builder.addFieldInt32(9, issuedTime, 0);
    }
    static addEventOnsetTime(builder, eventOnsetTime) {
        builder.addFieldInt32(10, eventOnsetTime, 0);
    }
    static addEventEndTime(builder, eventEndTime) {
        builder.addFieldInt32(11, eventEndTime, 0);
    }
    static addDetailsUrl(builder, detailsUrlOffset) {
        builder.addFieldOffset(12, detailsUrlOffset, 0);
    }
    static addPhenomenon(builder, phenomenonOffset) {
        builder.addFieldOffset(13, phenomenonOffset, 0);
    }
    static addSeverity(builder, severity) {
        builder.addFieldInt8(14, severity, Severity.UNKNOWN);
    }
    static addSignificance(builder, significance) {
        builder.addFieldInt8(15, significance, SignificanceType.UNKNOWN);
    }
    static addSource(builder, sourceOffset) {
        builder.addFieldOffset(16, sourceOffset, 0);
    }
    static addEventSource(builder, eventSourceOffset) {
        builder.addFieldOffset(17, eventSourceOffset, 0);
    }
    static addUrgency(builder, urgency) {
        builder.addFieldInt8(18, urgency, Urgency.UNKNOWN);
    }
    static addCertainty(builder, certainty) {
        builder.addFieldInt8(19, certainty, Certainty.UNKNOWN);
    }
    static addImportance(builder, importance) {
        builder.addFieldInt8(20, importance, ImportanceType.NORMAL);
    }
    static addResponses(builder, responsesOffset) {
        builder.addFieldOffset(21, responsesOffset, 0);
    }
    static createResponsesVector(builder, data) {
        builder.startVector(1, data.length, 1);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addInt8(data[i]);
        }
        return builder.endVector();
    }
    static startResponsesVector(builder, numElems) {
        builder.startVector(1, numElems, 1);
    }
    static addUnknown23(builder, unknown23) {
        builder.addFieldInt8(22, unknown23, 0);
    }
    static addUnknown24(builder, unknown24) {
        builder.addFieldInt8(23, unknown24, 0);
    }
    static endWeatherAlertSummary(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createWeatherAlertSummary(builder, idOffset, areaIdOffset, unknown3, attributionUrlOffset, countryCodeOffset, descriptionOffset, tokenOffset, effectiveTime, expireTime, issuedTime, eventOnsetTime, eventEndTime, detailsUrlOffset, phenomenonOffset, severity, significance, sourceOffset, eventSourceOffset, urgency, certainty, importance, responsesOffset, unknown23, unknown24) {
        WeatherAlertSummary.startWeatherAlertSummary(builder);
        WeatherAlertSummary.addId(builder, idOffset);
        WeatherAlertSummary.addAreaId(builder, areaIdOffset);
        WeatherAlertSummary.addUnknown3(builder, unknown3);
        WeatherAlertSummary.addAttributionUrl(builder, attributionUrlOffset);
        WeatherAlertSummary.addCountryCode(builder, countryCodeOffset);
        WeatherAlertSummary.addDescription(builder, descriptionOffset);
        WeatherAlertSummary.addToken(builder, tokenOffset);
        WeatherAlertSummary.addEffectiveTime(builder, effectiveTime);
        WeatherAlertSummary.addExpireTime(builder, expireTime);
        WeatherAlertSummary.addIssuedTime(builder, issuedTime);
        WeatherAlertSummary.addEventOnsetTime(builder, eventOnsetTime);
        WeatherAlertSummary.addEventEndTime(builder, eventEndTime);
        WeatherAlertSummary.addDetailsUrl(builder, detailsUrlOffset);
        WeatherAlertSummary.addPhenomenon(builder, phenomenonOffset);
        WeatherAlertSummary.addSeverity(builder, severity);
        WeatherAlertSummary.addSignificance(builder, significance);
        WeatherAlertSummary.addSource(builder, sourceOffset);
        WeatherAlertSummary.addEventSource(builder, eventSourceOffset);
        WeatherAlertSummary.addUrgency(builder, urgency);
        WeatherAlertSummary.addCertainty(builder, certainty);
        WeatherAlertSummary.addImportance(builder, importance);
        WeatherAlertSummary.addResponses(builder, responsesOffset);
        WeatherAlertSummary.addUnknown23(builder, unknown23);
        WeatherAlertSummary.addUnknown24(builder, unknown24);
        return WeatherAlertSummary.endWeatherAlertSummary(builder);
    }
}

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
class WeatherAlertCollectionData {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsWeatherAlertCollectionData(bb, obj) {
        return (obj || new WeatherAlertCollectionData()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsWeatherAlertCollectionData(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new WeatherAlertCollectionData()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    metadata(obj) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? (obj || new Metadata()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    detailsUrl(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    alerts(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? (obj || new WeatherAlertSummary()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    }
    alertsLength() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    static startWeatherAlertCollectionData(builder) {
        builder.startObject(3);
    }
    static addMetadata(builder, metadataOffset) {
        builder.addFieldOffset(0, metadataOffset, 0);
    }
    static addDetailsUrl(builder, detailsUrlOffset) {
        builder.addFieldOffset(1, detailsUrlOffset, 0);
    }
    static addAlerts(builder, alertsOffset) {
        builder.addFieldOffset(2, alertsOffset, 0);
    }
    static createAlertsVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startAlertsVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static endWeatherAlertCollectionData(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createWeatherAlertCollectionData(builder, metadataOffset, detailsUrlOffset, alertsOffset) {
        WeatherAlertCollectionData.startWeatherAlertCollectionData(builder);
        WeatherAlertCollectionData.addMetadata(builder, metadataOffset);
        WeatherAlertCollectionData.addDetailsUrl(builder, detailsUrlOffset);
        WeatherAlertCollectionData.addAlerts(builder, alertsOffset);
        return WeatherAlertCollectionData.endWeatherAlertCollectionData(builder);
    }
}

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
class WeatherChanges {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsWeatherChanges(bb, obj) {
        return (obj || new WeatherChanges()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsWeatherChanges(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new WeatherChanges()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    metadata(obj) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? (obj || new Metadata()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    forecastStart() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    }
    forecastEnd() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    }
    changes(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? (obj || new Change()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    }
    changesLength() {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    static startWeatherChanges(builder) {
        builder.startObject(4);
    }
    static addMetadata(builder, metadataOffset) {
        builder.addFieldOffset(0, metadataOffset, 0);
    }
    static addForecastStart(builder, forecastStart) {
        builder.addFieldInt32(1, forecastStart, 0);
    }
    static addForecastEnd(builder, forecastEnd) {
        builder.addFieldInt32(2, forecastEnd, 0);
    }
    static addChanges(builder, changesOffset) {
        builder.addFieldOffset(3, changesOffset, 0);
    }
    static createChangesVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startChangesVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static endWeatherChanges(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createWeatherChanges(builder, metadataOffset, forecastStart, forecastEnd, changesOffset) {
        WeatherChanges.startWeatherChanges(builder);
        WeatherChanges.addMetadata(builder, metadataOffset);
        WeatherChanges.addForecastStart(builder, forecastStart);
        WeatherChanges.addForecastEnd(builder, forecastEnd);
        WeatherChanges.addChanges(builder, changesOffset);
        return WeatherChanges.endWeatherChanges(builder);
    }
}

// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
class Weather {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsWeather(bb, obj) {
        return (obj || new Weather()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsWeather(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new Weather()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    airQuality(obj) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? (obj || new AirQuality$1()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    currentWeather(obj) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? (obj || new CurrentWeatherData()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    forecastDaily(obj) {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? (obj || new DailyForecastData()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    forecastHourly(obj) {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? (obj || new HourlyForecastData()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    forecastNextHour(obj) {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? (obj || new NextHourForecastData()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    news(obj) {
        const offset = this.bb.__offset(this.bb_pos, 14);
        return offset ? (obj || new News()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    weatherAlerts(obj) {
        const offset = this.bb.__offset(this.bb_pos, 16);
        return offset ? (obj || new WeatherAlertCollectionData()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    weatherChanges(obj) {
        const offset = this.bb.__offset(this.bb_pos, 18);
        return offset ? (obj || new WeatherChanges()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    historicalComparisons(obj) {
        const offset = this.bb.__offset(this.bb_pos, 20);
        return offset ? (obj || new HistoricalComparison()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    static startWeather(builder) {
        builder.startObject(9);
    }
    static addAirQuality(builder, airQualityOffset) {
        builder.addFieldOffset(0, airQualityOffset, 0);
    }
    static addCurrentWeather(builder, currentWeatherOffset) {
        builder.addFieldOffset(1, currentWeatherOffset, 0);
    }
    static addForecastDaily(builder, forecastDailyOffset) {
        builder.addFieldOffset(2, forecastDailyOffset, 0);
    }
    static addForecastHourly(builder, forecastHourlyOffset) {
        builder.addFieldOffset(3, forecastHourlyOffset, 0);
    }
    static addForecastNextHour(builder, forecastNextHourOffset) {
        builder.addFieldOffset(4, forecastNextHourOffset, 0);
    }
    static addNews(builder, newsOffset) {
        builder.addFieldOffset(5, newsOffset, 0);
    }
    static addWeatherAlerts(builder, weatherAlertsOffset) {
        builder.addFieldOffset(6, weatherAlertsOffset, 0);
    }
    static addWeatherChanges(builder, weatherChangesOffset) {
        builder.addFieldOffset(7, weatherChangesOffset, 0);
    }
    static addHistoricalComparisons(builder, historicalComparisonsOffset) {
        builder.addFieldOffset(8, historicalComparisonsOffset, 0);
    }
    static endWeather(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static finishWeatherBuffer(builder, offset) {
        builder.finish(offset);
    }
    static finishSizePrefixedWeatherBuffer(builder, offset) {
        builder.finish(offset, undefined, true);
    }
}

class WeatherKit2 {
	static Name = "WeatherKit2";
	static Version = "1.1.4";
	static encode(builder, dataSet = "all", data = {}) {
		log(`☑️ WeatherKit2.encode, dataSet: ${dataSet}`, "");
		let offset;
		let metadataOffset;
		if (data?.metadata) metadataOffset = Metadata.createMetadata(builder, builder.createString(data?.metadata?.attributionUrl), data?.metadata?.expireTime, builder.createString(data?.metadata?.language), data?.metadata?.latitude, data?.metadata?.longitude, builder.createString(data?.metadata?.providerLogo), builder.createString(data?.metadata?.providerName), data?.metadata?.readTime, data?.metadata?.reportedTime, data?.metadata?.temporarilyUnavailable, SourceType[data?.metadata?.sourceType], data?.metadata?.unknown11, data?.metadata?.unknown12, data?.metadata?.unknown13, data?.metadata?.unknown14, data?.metadata?.unknown15);
		switch (dataSet) {
			case "all":
				const Offsets = {};
				if (data?.airQuality) Offsets.airQualityOffset = this.encode(builder, "airQuality", data.airQuality);
				if (data?.currentWeather) Offsets.currentWeatherOffset = this.encode(builder, "currentWeather", data.currentWeather);
				if (data?.forecastDaily) Offsets.forecastDailyOffset = this.encode(builder, "forecastDaily", data.forecastDaily);
				if (data?.forecastHourly) Offsets.forecastHourlyOffset = this.encode(builder, "forecastHourly", data.forecastHourly);
				if (data?.forecastNextHour) Offsets.forecastNextHourOffset = this.encode(builder, "forecastNextHour", data.forecastNextHour);
				if (data?.news) Offsets.newsOffset = this.encode(builder, "news", data.news);
				if (data?.weatherAlerts) Offsets.weatherAlertsOffset = this.encode(builder, "weatherAlerts", data.weatherAlerts);
				if (data?.weatherChanges) Offsets.weatherChangesOffset = this.encode(builder, "weatherChanges", data.weatherChanges);
				if (data?.historicalComparisons) Offsets.historicalComparisonsOffset = this.encode(builder, "historicalComparisons", data.historicalComparisons);
				offset = WeatherKit2.createWeather(builder, Offsets.airQualityOffset, Offsets.currentWeatherOffset, Offsets.forecastDailyOffset, Offsets.forecastHourlyOffset, Offsets.forecastNextHourOffset, Offsets.newsOffset, Offsets.weatherAlertsOffset, Offsets.weatherChangesOffset, Offsets.historicalComparisonsOffset);
				break;
			case "airQuality":
				let pollutantsOffset = AirQuality$1.createPollutantsVector(builder, data?.pollutants?.map(p => Pollutant.createPollutant(builder, PollutantType[p.pollutantType], p.amount, UnitType[p.units])));
				let scaleOffset = builder.createString(data?.scale);
				offset = AirQuality$1.createAirQuality(builder, metadataOffset, data?.categoryIndex, data?.index, data?.isSignificant, pollutantsOffset, ComparisonTrend[data?.previousDayComparison], PollutantType[data?.primaryPollutant], scaleOffset);
				break;
			case "currentWeather":
				let precipitationAmountNext1hByTypeOffset = CurrentWeatherData.createPrecipitationAmountNext1hByTypeVector(builder, data?.precipitationAmountNext1hByType?.map(p => PrecipitationAmountByType.createPrecipitationAmountByType(builder, PrecipitationType[p.precipitationType], p.expected, p.minimumSnow, p.maximumSnow, p.expectedSnow)));
				let precipitationAmountNext24hByTypeOffset = CurrentWeatherData.createPrecipitationAmountNext24hByTypeVector(builder, data?.precipitationAmountNext24hByType?.map(p => PrecipitationAmountByType.createPrecipitationAmountByType(builder, PrecipitationType[p.precipitationType], p.expected, p.minimumSnow, p.maximumSnow, p.expectedSnow)));
				let precipitationAmountNext6hByTypeOffset = CurrentWeatherData.createPrecipitationAmountNext6hByTypeVector(builder, data?.precipitationAmountNext6hByType?.map(p => PrecipitationAmountByType.createPrecipitationAmountByType(builder, PrecipitationType[p.precipitationType], p.expected, p.minimumSnow, p.maximumSnow, p.expectedSnow)));
				let precipitationAmountPrevious1hByTypeOffset = CurrentWeatherData.createPrecipitationAmountPrevious1hByTypeVector(builder, data?.precipitationAmountPrevious1hByType?.map(p => PrecipitationAmountByType.createPrecipitationAmountByType(builder, PrecipitationType[p.precipitationType], p.expected, p.minimumSnow, p.maximumSnow, p.expectedSnow)));
				let precipitationAmountPrevious24hByTypeOffset = CurrentWeatherData.createPrecipitationAmountPrevious24hByTypeVector(builder, data?.precipitationAmountPrevious24hByType?.map(p => PrecipitationAmountByType.createPrecipitationAmountByType(builder, PrecipitationType[p.precipitationType], p.expected, p.minimumSnow, p.maximumSnow, p.expectedSnow)));
				let precipitationAmountPrevious6hByTypeOffset = CurrentWeatherData.createPrecipitationAmountPrevious6hByTypeVector(builder, data?.precipitationAmountPrevious6hByType?.map(p => PrecipitationAmountByType.createPrecipitationAmountByType(builder, PrecipitationType[p.precipitationType], p.expected, p.minimumSnow, p.maximumSnow, p.expectedSnow)));
				offset = CurrentWeatherData.createCurrentWeatherData(builder, metadataOffset, data?.asOf, data?.cloudCover, data?.cloudCoverLowAltPct, data?.cloudCoverMidAltPct, data?.cloudCoverHighAltPct, WeatherCondition[data?.conditionCode], data?.daylight, data?.humidity, data?.perceivedPrecipitationIntensity, data?.precipitationAmount1h, data?.precipitationAmount6h, data?.precipitationAmount24h, data?.precipitationAmountNext1h, data?.precipitationAmountNext6h, data?.precipitationAmountNext24h, precipitationAmountNext1hByTypeOffset, precipitationAmountNext6hByTypeOffset, precipitationAmountNext24hByTypeOffset, precipitationAmountPrevious1hByTypeOffset, precipitationAmountPrevious6hByTypeOffset, precipitationAmountPrevious24hByTypeOffset, data?.precipitationIntensity, data?.pressure, PressureTrend[data?.pressureTrend], data?.snowfallAmount1h, data?.snowfallAmount6h, data?.snowfallAmount24h, data?.snowfallAmountNext1h, data?.snowfallAmountNext6h, data?.snowfallAmountNext24h, data?.temperature, data?.temperatureApparent, data?.unknown34, data?.temperatureDewPoint, data?.uvIndex, data?.visibility, data?.windDirection, data?.windGust, data?.windSpeed);
				break;
			case "forecastDaily":
				let daysOffsets = data?.days?.map(day => {
					const Offsets = {};
					Offsets.precipitationAmountByTypeOffest = DayWeatherConditions.createPrecipitationAmountByTypeVector(builder, day?.precipitationAmountByType?.map(p => PrecipitationAmountByType.createPrecipitationAmountByType(builder, PrecipitationType[p.precipitationType], p.expected, p.minimumSnow, p.maximumSnow, p.expectedSnow)));
					if (day?.daytimeForecast) {
						Offsets.daytimeForecastPrecipitationAmountByTypeOffest = DayPartForecast.createPrecipitationAmountByTypeVector(builder, day?.daytimeForecast?.precipitationAmountByType?.map(p => PrecipitationAmountByType.createPrecipitationAmountByType(builder, PrecipitationType[p.precipitationType], p.expected, p.minimumSnow, p.maximumSnow, p.expectedSnow)));
						Offsets.daytimeForecastOffset = DayPartForecast.createDayPartForecast(builder, day?.daytimeForecast?.forecastStart, day?.daytimeForecast?.forecastEnd, day?.daytimeForecast?.cloudCover, day?.daytimeForecast?.cloudCoverLowAltPct, day?.daytimeForecast?.cloudCoverMidAltPct, day?.daytimeForecast?.cloudCoverHighAltPct, WeatherCondition[day?.daytimeForecast?.conditionCode], day?.daytimeForecast?.humidity, day?.daytimeForecast?.humidityMax, day?.daytimeForecast?.humidityMin, day?.daytimeForecast?.precipitationAmount, Offsets.daytimeForecastPrecipitationAmountByTypeOffest, day?.daytimeForecast?.precipitationChance, PrecipitationType[day?.daytimeForecast?.precipitationType], day?.daytimeForecast?.snowfallAmount, day?.daytimeForecast?.temperatureMax, day?.daytimeForecast?.temperatureMin, day?.daytimeForecast?.visibilityMax, day?.daytimeForecast?.visibilityMin, day?.daytimeForecast?.windDirection, day?.daytimeForecast?.windGustSpeedMax, day?.daytimeForecast?.windSpeed, day?.daytimeForecast?.windSpeedMax);
					}					if (day?.overnightForecast) {
						Offsets.overnightForecastPrecipitationAmountByTypeOffest = DayPartForecast.createPrecipitationAmountByTypeVector(builder, day?.overnightForecast?.precipitationAmountByType?.map(p => PrecipitationAmountByType.createPrecipitationAmountByType(builder, PrecipitationType[p.precipitationType], p.expected, p.minimumSnow, p.maximumSnow, p.expectedSnow)));
						Offsets.overnightForecastOffset = DayPartForecast.createDayPartForecast(builder, day?.overnightForecast?.forecastStart, day?.overnightForecast?.forecastEnd, day?.overnightForecast?.cloudCover, day?.overnightForecast?.cloudCoverLowAltPct, day?.overnightForecast?.cloudCoverMidAltPct, day?.overnightForecast?.cloudCoverHighAltPct, WeatherCondition[day?.overnightForecast?.conditionCode], day?.overnightForecast?.humidity, day?.overnightForecast?.humidityMax, day?.overnightForecast?.humidityMin, day?.overnightForecast?.precipitationAmount, Offsets.overnightForecastPrecipitationAmountByTypeOffest, day?.overnightForecast?.precipitationChance, PrecipitationType[day?.overnightForecast?.precipitationType], day?.overnightForecast?.snowfallAmount, day?.overnightForecast?.temperatureMax, day?.overnightForecast?.temperatureMin, day?.overnightForecast?.visibilityMax, day?.overnightForecast?.visibilityMin, day?.overnightForecast?.windDirection, day?.overnightForecast?.windGustSpeedMax, day?.overnightForecast?.windSpeed, day?.overnightForecast?.windSpeedMax);
					}					if (day?.restOfDayForecast) {
						Offsets.restOfDayForecastPrecipitationAmountByTypeOffest = DayPartForecast.createPrecipitationAmountByTypeVector(builder, day?.restOfDayForecast?.precipitationAmountByType?.map(p => PrecipitationAmountByType.createPrecipitationAmountByType(builder, PrecipitationType[p.precipitationType], p.expected, p.minimumSnow, p.maximumSnow, p.expectedSnow)));
						Offsets.restOfDayForecastOffset = DayPartForecast.createDayPartForecast(builder, day?.restOfDayForecast?.forecastStart, day?.restOfDayForecast?.forecastEnd, day?.restOfDayForecast?.cloudCover, day?.restOfDayForecast?.cloudCoverLowAltPct, day?.restOfDayForecast?.cloudCoverMidAltPct, day?.restOfDayForecast?.cloudCoverHighAltPct, WeatherCondition[day?.restOfDayForecast?.conditionCode], day?.restOfDayForecast?.humidity, day?.restOfDayForecast?.humidityMax, day?.restOfDayForecast?.humidityMin, day?.restOfDayForecast?.precipitationAmount, Offsets.restOfDayForecastPrecipitationAmountByTypeOffest, day?.restOfDayForecast?.precipitationChance, PrecipitationType[day?.restOfDayForecast?.precipitationType], day?.restOfDayForecast?.snowfallAmount, day?.restOfDayForecast?.temperatureMax, day?.restOfDayForecast?.temperatureMin, day?.restOfDayForecast?.visibilityMax, day?.restOfDayForecast?.visibilityMin, day?.restOfDayForecast?.windDirection, day?.restOfDayForecast?.windGustSpeedMax, day?.restOfDayForecast?.windSpeed, day?.restOfDayForecast?.windSpeedMax);
					}					DayWeatherConditions.startDayWeatherConditions(builder);
					DayWeatherConditions.addForecastStart(builder, day?.forecastStart);
					DayWeatherConditions.addForecastEnd(builder, day?.forecastEnd);
					DayWeatherConditions.addConditionCode(builder, WeatherCondition[day?.conditionCode]);
					DayWeatherConditions.addHumidityMax(builder, day?.humidityMax);
					DayWeatherConditions.addHumidityMin(builder, day?.humidityMin);
					DayWeatherConditions.addMaxUvIndex(builder, day?.maxUvIndex);
					DayWeatherConditions.addMoonPhase(builder, MoonPhase[day?.moonPhase]);
					DayWeatherConditions.addMoonrise(builder, day?.moonrise);
					DayWeatherConditions.addMoonset(builder, day?.moonset);
					DayWeatherConditions.addPrecipitationAmount(builder, day?.precipitationAmount);
					DayWeatherConditions.addPrecipitationAmountByType(builder, Offsets.precipitationAmountByTypeOffest);
					DayWeatherConditions.addPrecipitationChance(builder, day?.precipitationChance);
					DayWeatherConditions.addPrecipitationType(builder, PrecipitationType[day?.precipitationType]);
					DayWeatherConditions.addSnowfallAmount(builder, day?.snowfallAmount);
					DayWeatherConditions.addSolarMidnight(builder, day?.solarMidnight);
					DayWeatherConditions.addSolarNoon(builder, day?.solarNoon);
					DayWeatherConditions.addSunrise(builder, day?.sunrise);
					DayWeatherConditions.addSunriseCivil(builder, day?.sunriseCivil);
					DayWeatherConditions.addSunriseNautical(builder, day?.sunriseNautical);
					DayWeatherConditions.addSunriseAstronomical(builder, day?.sunriseAstronomical);
					DayWeatherConditions.addSunset(builder, day?.sunset);
					DayWeatherConditions.addSunsetCivil(builder, day?.sunsetCivil);
					DayWeatherConditions.addSunsetNautical(builder, day?.sunsetNautical);
					DayWeatherConditions.addSunsetAstronomical(builder, day?.sunsetAstronomical);
					DayWeatherConditions.addTemperatureMax(builder, day?.temperatureMax);
					DayWeatherConditions.addTemperatureMaxTime(builder, day?.temperatureMaxTime);
					DayWeatherConditions.addTemperatureMin(builder, day?.temperatureMin);
					DayWeatherConditions.addTemperatureMinTime(builder, day?.temperatureMinTime);
					DayWeatherConditions.addVisibilityMax(builder, day?.visibilityMax);
					DayWeatherConditions.addVisibilityMin(builder, day?.visibilityMin);
					DayWeatherConditions.addWindGustSpeedMax(builder, day?.windGustSpeedMax);
					DayWeatherConditions.addWindSpeedAvg(builder, day?.windSpeedAvg);
					DayWeatherConditions.addWindSpeedMax(builder, day?.windSpeedMax);
					if (day?.daytimeForecast) DayWeatherConditions.addDaytimeForecast(builder, Offsets.daytimeForecastOffset);
					if (day?.overnightForecast) DayWeatherConditions.addOvernightForecast(builder, Offsets.overnightForecastOffset);
					if (day?.restOfDayForecast) DayWeatherConditions.addRestOfDayForecast(builder, Offsets.restOfDayForecastOffset);
					return DayWeatherConditions.endDayWeatherConditions(builder);
				});
				let daysOffset = DailyForecastData.createDaysVector(builder, daysOffsets);
				offset = DailyForecastData.createDailyForecastData(builder, metadataOffset, daysOffset);
				break;
			case "forecastHourly":
				let hoursOffsets = data?.hours?.map(hour => HourWeatherConditions.createHourWeatherConditions(builder, hour?.forecastStart, hour?.cloudCover, hour?.cloudCoverLowAltPct, hour?.cloudCoverMidAltPct, hour?.cloudCoverHighAltPct, WeatherCondition[hour?.conditionCode], hour?.daylight, hour?.humidity, hour?.perceivedPrecipitationIntensity, hour?.precipitationAmount, hour?.precipitationIntensity, hour?.precipitationChance, PrecipitationType[hour?.precipitationType], hour?.pressure, PressureTrend[hour?.pressureTrend], hour?.snowfallAmount, hour?.snowfallIntensity, hour?.temperature, hour?.temperatureApparent, hour?.unknown20, hour?.temperatureDewPoint, hour?.uvIndex, hour?.visibility, hour?.windDirection, hour?.windGust, hour?.windSpeed));
				let hoursOffset = HourlyForecastData.createHoursVector(builder, hoursOffsets);
				offset = HourlyForecastData.createHourlyForecastData(builder, metadataOffset, hoursOffset);
				break;
			case "forecastNextHour":
				let conditionOffsets = data?.condition?.map(condition => {
					let parametersOffsets = condition?.parameters.map(parameter => Parameter.createParameter(builder, ParameterType[parameter?.type], parameter?.date));
					let parametersOffset = Condition.createParametersVector(builder, parametersOffsets);
					return Condition.createCondition(builder, condition?.startTime, condition?.endTime, ForecastToken[condition?.forecastToken], ConditionType[condition?.beginCondition], ConditionType[condition?.endCondition], parametersOffset);
				});
				let conditionOffset = NextHourForecastData.createConditionVector(builder, conditionOffsets);
				let summaryOffsets = data?.summary?.map(summary => ForecastPeriodSummary.createForecastPeriodSummary(builder, summary?.startTime, summary?.endTime, PrecipitationType[summary?.condition], summary?.precipitationChance, summary?.precipitationIntensity));
				let summaryOffset = NextHourForecastData.createSummaryVector(builder, summaryOffsets);
				let minutesOffsets = data?.minutes?.map(minute => ForecastMinute.createForecastMinute(builder, minute?.startTime, minute?.precipitationChance, minute?.precipitationIntensity, minute?.perceivedPrecipitationIntensity));
				let minutesOffset = NextHourForecastData.createMinutesVector(builder, minutesOffsets);
				offset = NextHourForecastData.createNextHourForecastData(builder, metadataOffset, conditionOffset, summaryOffset, data?.forecastStart, data?.forecastEnd, minutesOffset);
				break;
			case "news":
				let placementsOffsets = data?.placements?.map(placement => {
					let articlesOffsets = placement?.articles?.map(article => {
						let alertIdsOffset = Articles.createAlertIdsVector(builder, article?.alertIds?.map(alertId => builder.createString(alertId)));
						let headlineOverrideOffset = builder.createString(article?.headlineOverride);
						let idOffset = builder.createString(article?.id);
						let localeOffset = builder.createString(article?.locale);
						let phenomenaOffset = Articles.createPhenomenaVector(builder, article?.phenomena?.map(phenomena => builder.createString(phenomena)));
						let supportedStorefrontsOffset = Articles.createSupportedStorefrontsVector(builder, article?.supportedStorefronts?.map(supportedStorefront => builder.createString(supportedStorefront)));
						return Articles.createArticles(builder, idOffset, supportedStorefrontsOffset, alertIdsOffset, phenomenaOffset, headlineOverrideOffset, localeOffset);
					});
					let articlesOffset = Placement.createArticlesVector(builder, articlesOffsets);
					return Placement.createPlacement(builder, placement?.priority, articlesOffset, PlacementType[placement?.placement]);
				});
				let placementsOffset = News.createPlacementsVector(builder, placementsOffsets);
				offset = News.createNews(builder, metadataOffset, placementsOffset);
				break;
			case "weatherAlert":
			case "weatherAlerts":
				let alertsOffsets = data?.alerts?.map(alert => {
					let responsesOffsets = alert?.responses?.map(response => ResponseType[response]);
					let responsesOffset = WeatherAlertSummary.createResponsesVector(builder, responsesOffsets);
					let idOffset = ID.createID(builder, builder.createString(alert?.id?.uuid));
					//let idOffset = WK2.WeatherAlertSummary.createIdVector(builder, alert?.id);
					//WK2.WeatherAlertSummary.startIdVector(builder, alert?.id?.length);
					//alert?.id?.map(id => WK2.UUID.createUUID(builder, id?.lowBytes, id?.highBytes));
					//let idOffset = builder.endVector();
					let areaIdOffset = builder.createString(alert?.areaId);
					let attributionUrlOffset = builder.createString(alert?.attributionUrl);
					let countryCodeOffset = builder.createString(alert?.countryCode);
					let descriptionOffset = builder.createString(alert?.description);
					let tokenOffset = builder.createString(alert?.token);
					let detailsUrlOffset = builder.createString(alert?.detailsUrl);
					let phenomenonOffset = builder.createString(alert?.phenomenon);
					let sourceOffset = builder.createString(alert?.source);
					let eventSourceOffset = builder.createString(alert?.eventSource);
					return WeatherAlertSummary.createWeatherAlertSummary(builder, idOffset, areaIdOffset, alert?.unknown3, attributionUrlOffset, countryCodeOffset, descriptionOffset, tokenOffset, alert?.effectiveTime, alert?.expireTime, alert?.issuedTime, alert?.eventOnsetTime, alert?.eventEndTime, detailsUrlOffset, phenomenonOffset, Severity[alert?.severity], SignificanceType[alert?.significance], sourceOffset, eventSourceOffset, Urgency[alert?.urgency], Certainty[alert?.certainty], ImportanceType[alert?.importance], responsesOffset, alert?.unknown23, alert?.unknown24);
				});
				let alertsOffset = WeatherAlertCollectionData.createAlertsVector(builder, alertsOffsets);
				let detailsUrlOffset = builder.createString(data?.detailsUrl);
				offset = WeatherAlertCollectionData.createWeatherAlertCollectionData(builder, metadataOffset, detailsUrlOffset, alertsOffset);
				break;
			case "weatherChange":
			case "weatherChanges":
				let changesOffsets = data?.changes?.map(change => Change.createChange(builder, change?.forecastStart, change?.forecastEnd, Direction[change?.maxTemperatureChange], Direction[change?.minTemperatureChange], Direction[change?.dayPrecipitationChange], Direction[change?.nightPrecipitationChange]));
				let changesOffset = WeatherChanges.createChangesVector(builder, changesOffsets);
				offset = WeatherChanges.createWeatherChanges(builder, metadataOffset, data?.forecastStart, data?.forecastEnd, changesOffset);
				break;
			case "trendComparison":
			case "trendComparisons":
			case "historicalComparison":
			case "historicalComparisons":
				let comparisonsOffsets = data?.comparisons?.map(comparison => Comparison.createComparison(builder, ComparisonType[comparison?.condition], comparison?.currentValue, comparison?.baselineValue, Deviation[comparison?.deviation], comparison?.baselineType, comparison?.baselineStartDate));
				let comparisonsOffset = HistoricalComparison.createComparisonsVector(builder, comparisonsOffsets);
				offset = HistoricalComparison.createHistoricalComparison(builder, metadataOffset, comparisonsOffset);
				break;
		}		log(`✅ WeatherKit2.encode, dataSet: ${dataSet}`, "");
		return offset;
	};

	static decode(byteBuffer, dataSet = "all", data = {}) {
		log(`☑️ WeatherKit2.decode, dataSet: ${dataSet}`, "");
		const Weather$1 = Weather.getRootAsWeather(byteBuffer);
		const airQualityData = Weather$1?.airQuality();
		const CurrentWeatherData = Weather$1?.currentWeather();
		const DailyForecastData = Weather$1?.forecastDaily();
		const HourlyForecastData = Weather$1?.forecastHourly();
		const NextHourForecastData = Weather$1?.forecastNextHour();
		const newsData = Weather$1?.news();
		const WeatherAlertCollectionData = Weather$1?.weatherAlerts();
		const weatherChangesData = Weather$1?.weatherChanges();
		const historicalComparisonsData = Weather$1?.historicalComparisons();
		switch (dataSet) {
			case "all":
				if (airQualityData) data.airQuality = this.decode(byteBuffer, "airQuality", airQualityData);
				if (CurrentWeatherData) data.currentWeather = this.decode(byteBuffer, "currentWeather", CurrentWeatherData);
				if (DailyForecastData) data.forecastDaily = this.decode(byteBuffer, "forecastDaily", DailyForecastData);
				if (HourlyForecastData) data.forecastHourly = this.decode(byteBuffer, "forecastHourly", HourlyForecastData);
				if (NextHourForecastData) data.forecastNextHour = this.decode(byteBuffer, "forecastNextHour", NextHourForecastData);
				if (newsData) data.news = this.decode(byteBuffer, "news", newsData);
				if (WeatherAlertCollectionData) data.weatherAlerts = this.decode(byteBuffer, "weatherAlerts", WeatherAlertCollectionData);
				if (weatherChangesData) data.weatherChanges = this.decode(byteBuffer, "weatherChange", weatherChangesData);
				if (historicalComparisonsData) data.historicalComparisons = this.decode(byteBuffer, "trendComparison", historicalComparisonsData);
				break;
			case "airQuality":
				data = {
					"metadata": this.decode(byteBuffer, "metadata", airQualityData?.metadata()),
					"categoryIndex": airQualityData?.categoryIndex(),
					"index": airQualityData?.index(),
					"isSignificant": airQualityData?.isSignificant(),
					"pollutants": [],
					"previousDayComparison": ComparisonTrend[airQualityData?.previousDayComparison()],
					"primaryPollutant": PollutantType[airQualityData?.primaryPollutant()],
					"scale": airQualityData?.scale(),
				};
				for (let i = 0; i < airQualityData?.pollutantsLength(); i++) data.pollutants.push({
					"amount": airQualityData?.pollutants(i)?.amount(),
					"pollutantType": PollutantType[airQualityData?.pollutants(i)?.pollutantType()],
					"units": UnitType[airQualityData?.pollutants(i)?.units()],
				});
				break;
			case "currentWeather":
				data = {
					"metadata": this.decode(byteBuffer, "metadata", CurrentWeatherData?.metadata()),
					"asOf": CurrentWeatherData?.asOf(),
					"cloudCover": CurrentWeatherData?.cloudCover(),
					"cloudCoverHighAltPct": CurrentWeatherData?.cloudCoverHighAltPct(),
					"cloudCoverLowAltPct": CurrentWeatherData?.cloudCoverLowAltPct(),
					"cloudCoverMidAltPct": CurrentWeatherData?.cloudCoverMidAltPct(),
					"conditionCode": WeatherCondition[CurrentWeatherData?.conditionCode()],
					"daylight": CurrentWeatherData?.daylight(),
					"humidity": CurrentWeatherData?.humidity(),
					"perceivedPrecipitationIntensity": CurrentWeatherData?.perceivedPrecipitationIntensity(),
					"precipitationAmount1h": CurrentWeatherData?.precipitationAmount1h(),
					"precipitationAmount24h": CurrentWeatherData?.precipitationAmount24h(),
					"precipitationAmount6h": CurrentWeatherData?.precipitationAmount6h(),
					"precipitationAmountNext1h": CurrentWeatherData?.precipitationAmountNext1h(),
					"precipitationAmountNext1hByType": [],
					"precipitationAmountNext24h": CurrentWeatherData?.precipitationAmountNext24h(),
					"precipitationAmountNext24hByType": [],
					"precipitationAmountNext6h": CurrentWeatherData?.precipitationAmountNext6h(),
					"precipitationAmountNext6hByType": [],
					"precipitationAmountPrevious1hByType": [],
					"precipitationAmountPrevious24hByType": [],
					"precipitationAmountPrevious6hByType": [],
					"precipitationIntensity": CurrentWeatherData?.precipitationIntensity(),
					"pressure": CurrentWeatherData?.pressure(),
					"pressureTrend": PressureTrend[CurrentWeatherData?.pressureTrend()],
					"snowfallAmount1h": CurrentWeatherData?.snowfallAmount1h(),
					"snowfallAmount24h": CurrentWeatherData?.snowfallAmount24h(),
					"snowfallAmount6h": CurrentWeatherData?.snowfallAmount6h(),
					"snowfallAmountNext1h": CurrentWeatherData?.snowfallAmountNext1h(),
					"snowfallAmountNext24h": CurrentWeatherData?.snowfallAmountNext24h(),
					"snowfallAmountNext6h": CurrentWeatherData?.snowfallAmountNext6h(),
					"temperature": CurrentWeatherData?.temperature(),
					"temperatureApparent": CurrentWeatherData?.temperatureApparent(),
					"unknown34": CurrentWeatherData?.unknown34(),
					"temperatureDewPoint": CurrentWeatherData?.temperatureDewPoint(),
					"uvIndex": CurrentWeatherData?.uvIndex(),
					"visibility": CurrentWeatherData?.visibility(),
					"windDirection": CurrentWeatherData?.windDirection(),
					"windGust": CurrentWeatherData?.windGust(),
					"windSpeed": CurrentWeatherData?.windSpeed(),
				};
				for (let i = 0; i < CurrentWeatherData?.precipitationAmountNext1hByTypeLength(); i++) data.precipitationAmountNext1hByType.push({
					"expected": CurrentWeatherData?.precipitationAmountNext1hByType(i)?.expected(),
					"expectedSnow": CurrentWeatherData?.precipitationAmountNext1hByType(i)?.expectedSnow(),
					"maximumSnow": CurrentWeatherData?.precipitationAmountNext1hByType(i)?.maximumSnow(),
					"minimumSnow": CurrentWeatherData?.precipitationAmountNext1hByType(i)?.minimumSnow(),
					"precipitationType": PrecipitationType[CurrentWeatherData?.precipitationAmountNext1hByType(i)?.precipitationType()],
				});
				for (let i = 0; i < CurrentWeatherData?.precipitationAmountNext24hByTypeLength(); i++) data.precipitationAmountNext24hByType.push({
					"expected": CurrentWeatherData?.precipitationAmountNext24hByType(i)?.expected(),
					"expectedSnow": CurrentWeatherData?.precipitationAmountNext24hByType(i)?.expectedSnow(),
					"maximumSnow": CurrentWeatherData?.precipitationAmountNext24hByType(i)?.maximumSnow(),
					"minimumSnow": CurrentWeatherData?.precipitationAmountNext24hByType(i)?.minimumSnow(),
					"precipitationType": PrecipitationType[CurrentWeatherData?.precipitationAmountNext24hByType(i)?.precipitationType()],
				});
				for (let i = 0; i < CurrentWeatherData?.precipitationAmountNext6hByTypeLength(); i++) data.precipitationAmountNext6hByType.push({
					"expected": CurrentWeatherData?.precipitationAmountNext6hByType(i)?.expected(),
					"expectedSnow": CurrentWeatherData?.precipitationAmountNext6hByType(i)?.expectedSnow(),
					"maximumSnow": CurrentWeatherData?.precipitationAmountNext6hByType(i)?.maximumSnow(),
					"minimumSnow": CurrentWeatherData?.precipitationAmountNext6hByType(i)?.minimumSnow(),
					"precipitationType": PrecipitationType[CurrentWeatherData?.precipitationAmountNext6hByType(i)?.precipitationType()],
				});
				for (let i = 0; i < CurrentWeatherData?.precipitationAmountPrevious1hByTypeLength(); i++) data.precipitationAmountPrevious1hByType.push({
					"expected": CurrentWeatherData?.precipitationAmountPrevious1hByType(i)?.expected(),
					"expectedSnow": CurrentWeatherData?.precipitationAmountPrevious1hByType(i)?.expectedSnow(),
					"maximumSnow": CurrentWeatherData?.precipitationAmountPrevious1hByType(i)?.maximumSnow(),
					"minimumSnow": CurrentWeatherData?.precipitationAmountPrevious1hByType(i)?.minimumSnow(),
					"precipitationType": PrecipitationType[CurrentWeatherData?.precipitationAmountPrevious1hByType(i)?.precipitationType()],
				});
				for (let i = 0; i < CurrentWeatherData?.precipitationAmountPrevious24hByTypeLength(); i++) data.precipitationAmountPrevious24hByType.push({
					"expected": CurrentWeatherData?.precipitationAmountPrevious24hByType(i)?.expected(),
					"expectedSnow": CurrentWeatherData?.precipitationAmountPrevious24hByType(i)?.expectedSnow(),
					"maximumSnow": CurrentWeatherData?.precipitationAmountPrevious24hByType(i)?.maximumSnow(),
					"minimumSnow": CurrentWeatherData?.precipitationAmountPrevious24hByType(i)?.minimumSnow(),
					"precipitationType": PrecipitationType[CurrentWeatherData?.precipitationAmountPrevious24hByType(i)?.precipitationType()],
				});
				for (let i = 0; i < CurrentWeatherData?.precipitationAmountPrevious6hByTypeLength(); i++) data.precipitationAmountPrevious6hByType.push({
					"expected": CurrentWeatherData?.precipitationAmountPrevious6hByType(i)?.expected(),
					"expectedSnow": CurrentWeatherData?.precipitationAmountPrevious6hByType(i)?.expectedSnow(),
					"maximumSnow": CurrentWeatherData?.precipitationAmountPrevious6hByType(i)?.maximumSnow(),
					"minimumSnow": CurrentWeatherData?.precipitationAmountPrevious6hByType(i)?.minimumSnow(),
					"precipitationType": PrecipitationType[CurrentWeatherData?.precipitationAmountPrevious6hByType(i)?.precipitationType()],
				});
				break;
			case "forecastDaily":
				data = {
					"metadata": this.decode(byteBuffer, "metadata", DailyForecastData?.metadata()),
					"days": [],
				};
				for (let i = 0; i < DailyForecastData?.daysLength(); i++) {
					let day = {
						"conditionCode": WeatherCondition[DailyForecastData?.days(i)?.conditionCode()],
						"forecastEnd": DailyForecastData?.days(i)?.forecastEnd(),
						"forecastStart": DailyForecastData?.days(i)?.forecastStart(),
						"humidityMax": DailyForecastData?.days(i)?.humidityMax(),
						"humidityMin": DailyForecastData?.days(i)?.humidityMin(),
						"maxUvIndex": DailyForecastData?.days(i)?.maxUvIndex(),
						"moonPhase": MoonPhase[DailyForecastData?.days(i)?.moonPhase()],
						"moonrise": DailyForecastData?.days(i)?.moonrise(),
						"moonset": DailyForecastData?.days(i)?.moonset(),
						"precipitationAmount": DailyForecastData?.days(i)?.precipitationAmount(),
						"precipitationAmountByType": [],
						"precipitationChance": DailyForecastData?.days(i)?.precipitationChance(),
						"precipitationType": PrecipitationType[DailyForecastData?.days(i)?.precipitationType()],
						"snowfallAmount": DailyForecastData?.days(i)?.snowfallAmount(),
						"solarMidnight": DailyForecastData?.days(i)?.solarMidnight(),
						"solarNoon": DailyForecastData?.days(i)?.solarNoon(),
						"sunrise": DailyForecastData?.days(i)?.sunrise(),
						"sunriseCivil": DailyForecastData?.days(i)?.sunriseCivil(),
						"sunriseNautical": DailyForecastData?.days(i)?.sunriseNautical(),
						"sunriseAstronomical": DailyForecastData?.days(i)?.sunriseAstronomical(),
						"sunset": DailyForecastData?.days(i)?.sunset(),
						"sunsetCivil": DailyForecastData?.days(i)?.sunsetCivil(),
						"sunsetNautical": DailyForecastData?.days(i)?.sunsetNautical(),
						"sunsetAstronomical": DailyForecastData?.days(i)?.sunsetAstronomical(),
						"temperatureMax": DailyForecastData?.days(i)?.temperatureMax(),
						"temperatureMaxTime": DailyForecastData?.days(i)?.temperatureMaxTime(),
						"temperatureMin": DailyForecastData?.days(i)?.temperatureMin(),
						"temperatureMinTime": DailyForecastData?.days(i)?.temperatureMinTime(),
						"visibilityMax": DailyForecastData?.days(i)?.visibilityMax(),
						"visibilityMin": DailyForecastData?.days(i)?.visibilityMin(),
						"windGustSpeedMax": DailyForecastData?.days(i)?.windGustSpeedMax(),
						"windSpeedAvg": DailyForecastData?.days(i)?.windSpeedAvg(),
						"windSpeedMax": DailyForecastData?.days(i)?.windSpeedMax(),
					};
					for (let j = 0; j < DailyForecastData?.days(i)?.precipitationAmountByTypeLength(); j++) day.precipitationAmountByType.push({
						"expected": DailyForecastData?.days(i)?.precipitationAmountByType(j)?.expected(),
						"expectedSnow": DailyForecastData?.days(i)?.precipitationAmountByType(j)?.expectedSnow(),
						"maximumSnow": DailyForecastData?.days(i)?.precipitationAmountByType(j)?.maximumSnow(),
						"minimumSnow": DailyForecastData?.days(i)?.precipitationAmountByType(j)?.minimumSnow(),
						"precipitationType": PrecipitationType[DailyForecastData?.days(i)?.precipitationAmountByType(j)?.precipitationType()],
					});
					if (DailyForecastData?.days(i)?.daytimeForecast()) {
						day.daytimeForecast = {
							"cloudCover": DailyForecastData?.days(i)?.daytimeForecast()?.cloudCover(),
							"cloudCoverHighAltPct": DailyForecastData?.days(i)?.daytimeForecast()?.cloudCoverHighAltPct(),
							"cloudCoverLowAltPct": DailyForecastData?.days(i)?.daytimeForecast()?.cloudCoverLowAltPct(),
							"cloudCoverMidAltPct": DailyForecastData?.days(i)?.daytimeForecast()?.cloudCoverMidAltPct(),
							"conditionCode": WeatherCondition[DailyForecastData?.days(i)?.daytimeForecast()?.conditionCode()],
							"forecastEnd": DailyForecastData?.days(i)?.daytimeForecast()?.forecastEnd(),
							"forecastStart": DailyForecastData?.days(i)?.daytimeForecast()?.forecastStart(),
							"humidity": DailyForecastData?.days(i)?.daytimeForecast()?.humidity(),
							"humidityMax": DailyForecastData?.days(i)?.daytimeForecast()?.humidityMax(),
							"humidityMin": DailyForecastData?.days(i)?.daytimeForecast()?.humidityMin(),
							"precipitationAmount": DailyForecastData?.days(i)?.daytimeForecast()?.precipitationAmount(),
							"precipitationAmountByType": [],
							"precipitationChance": DailyForecastData?.days(i)?.daytimeForecast()?.precipitationChance(),
							"precipitationType": PrecipitationType[DailyForecastData?.days(i)?.daytimeForecast()?.precipitationType()],
							"snowfallAmount": DailyForecastData?.days(i)?.daytimeForecast()?.snowfallAmount(),
							"temperatureMax": DailyForecastData?.days(i)?.daytimeForecast()?.temperatureMax(),
							"temperatureMin": DailyForecastData?.days(i)?.daytimeForecast()?.temperatureMin(),
							"visibilityMax": DailyForecastData?.days(i)?.daytimeForecast()?.visibilityMax(),
							"visibilityMin": DailyForecastData?.days(i)?.daytimeForecast()?.visibilityMin(),
							"windDirection": DailyForecastData?.days(i)?.daytimeForecast()?.windDirection(),
							"windGustSpeedMax": DailyForecastData?.days(i)?.daytimeForecast()?.windGustSpeedMax(),
							"windSpeed": DailyForecastData?.days(i)?.daytimeForecast()?.windSpeed(),
							"windSpeedMax": DailyForecastData?.days(i)?.daytimeForecast()?.windSpeedMax(),
						};
						for (let j = 0; j < DailyForecastData?.days(i)?.daytimeForecast()?.precipitationAmountByTypeLength(); j++) day.daytimeForecast.precipitationAmountByType.push({
							"expected": DailyForecastData?.days(i)?.daytimeForecast()?.precipitationAmountByType(j)?.expected(),
							"expectedSnow": DailyForecastData?.days(i)?.daytimeForecast()?.precipitationAmountByType(j)?.expectedSnow(),
							"maximumSnow": DailyForecastData?.days(i)?.daytimeForecast()?.precipitationAmountByType(j)?.maximumSnow(),
							"minimumSnow": DailyForecastData?.days(i)?.daytimeForecast()?.precipitationAmountByType(j)?.minimumSnow(),
							"precipitationType": PrecipitationType[DailyForecastData?.days(i)?.daytimeForecast()?.precipitationAmountByType(j)?.precipitationType()],
						});
					}					if (DailyForecastData?.days(i)?.overnightForecast()) {
						day.overnightForecast = {
							"cloudCover": DailyForecastData?.days(i)?.overnightForecast()?.cloudCover(),
							"cloudCoverHighAltPct": DailyForecastData?.days(i)?.overnightForecast()?.cloudCoverHighAltPct(),
							"cloudCoverLowAltPct": DailyForecastData?.days(i)?.overnightForecast()?.cloudCoverLowAltPct(),
							"cloudCoverMidAltPct": DailyForecastData?.days(i)?.overnightForecast()?.cloudCoverMidAltPct(),
							"conditionCode": WeatherCondition[DailyForecastData?.days(i)?.overnightForecast()?.conditionCode()],
							"forecastEnd": DailyForecastData?.days(i)?.overnightForecast()?.forecastEnd(),
							"forecastStart": DailyForecastData?.days(i)?.overnightForecast()?.forecastStart(),
							"humidity": DailyForecastData?.days(i)?.overnightForecast()?.humidity(),
							"humidityMax": DailyForecastData?.days(i)?.overnightForecast()?.humidityMax(),
							"humidityMin": DailyForecastData?.days(i)?.overnightForecast()?.humidityMin(),
							"precipitationAmount": DailyForecastData?.days(i)?.overnightForecast()?.precipitationAmount(),
							"precipitationAmountByType": [],
							"precipitationChance": DailyForecastData?.days(i)?.overnightForecast()?.precipitationChance(),
							"precipitationType": PrecipitationType[DailyForecastData?.days(i)?.overnightForecast()?.precipitationType()],
							"snowfallAmount": DailyForecastData?.days(i)?.overnightForecast()?.snowfallAmount(),
							"temperatureMax": DailyForecastData?.days(i)?.overnightForecast()?.temperatureMax(),
							"temperatureMin": DailyForecastData?.days(i)?.overnightForecast()?.temperatureMin(),
							"visibilityMax": DailyForecastData?.days(i)?.overnightForecast()?.visibilityMax(),
							"visibilityMin": DailyForecastData?.days(i)?.overnightForecast()?.visibilityMin(),
							"windDirection": DailyForecastData?.days(i)?.overnightForecast()?.windDirection(),
							"windGustSpeedMax": DailyForecastData?.days(i)?.overnightForecast()?.windGustSpeedMax(),
							"windSpeed": DailyForecastData?.days(i)?.overnightForecast()?.windSpeed(),
							"windSpeedMax": DailyForecastData?.days(i)?.overnightForecast()?.windSpeedMax(),
						};
						for (let j = 0; j < DailyForecastData?.days(i)?.overnightForecast()?.precipitationAmountByTypeLength(); j++) day.overnightForecast.precipitationAmountByType.push({
							"expected": DailyForecastData?.days(i)?.overnightForecast()?.precipitationAmountByType(j)?.expected(),
							"expectedSnow": DailyForecastData?.days(i)?.overnightForecast()?.precipitationAmountByType(j)?.expectedSnow(),
							"maximumSnow": DailyForecastData?.days(i)?.overnightForecast()?.precipitationAmountByType(j)?.maximumSnow(),
							"minimumSnow": DailyForecastData?.days(i)?.overnightForecast()?.precipitationAmountByType(j)?.minimumSnow(),
							"precipitationType": PrecipitationType[DailyForecastData?.days(i)?.overnightForecast()?.precipitationAmountByType(j)?.precipitationType()],
						});
					}					if (DailyForecastData?.days(i)?.restOfDayForecast()) {
						day.restOfDayForecast = {
							"cloudCover": DailyForecastData?.days(i)?.restOfDayForecast()?.cloudCover(),
							"cloudCoverHighAltPct": DailyForecastData?.days(i)?.restOfDayForecast()?.cloudCoverHighAltPct(),
							"cloudCoverLowAltPct": DailyForecastData?.days(i)?.restOfDayForecast()?.cloudCoverLowAltPct(),
							"cloudCoverMidAltPct": DailyForecastData?.days(i)?.restOfDayForecast()?.cloudCoverMidAltPct(),
							"conditionCode": WeatherCondition[DailyForecastData?.days(i)?.restOfDayForecast()?.conditionCode()],
							"forecastEnd": DailyForecastData?.days(i)?.restOfDayForecast()?.forecastEnd(),
							"forecastStart": DailyForecastData?.days(i)?.restOfDayForecast()?.forecastStart(),
							"humidity": DailyForecastData?.days(i)?.restOfDayForecast()?.humidity(),
							"humidityMax": DailyForecastData?.days(i)?.restOfDayForecast()?.humidityMax(),
							"humidityMin": DailyForecastData?.days(i)?.restOfDayForecast()?.humidityMin(),
							"precipitationAmount": DailyForecastData?.days(i)?.restOfDayForecast()?.precipitationAmount(),
							"precipitationAmountByType": [],
							"precipitationChance": DailyForecastData?.days(i)?.restOfDayForecast()?.precipitationChance(),
							"precipitationType": PrecipitationType[DailyForecastData?.days(i)?.restOfDayForecast()?.precipitationType()],
							"snowfallAmount": DailyForecastData?.days(i)?.restOfDayForecast()?.snowfallAmount(),
							"temperatureMax": DailyForecastData?.days(i)?.restOfDayForecast()?.temperatureMax(),
							"temperatureMin": DailyForecastData?.days(i)?.restOfDayForecast()?.temperatureMin(),
							"visibilityMax": DailyForecastData?.days(i)?.restOfDayForecast()?.visibilityMax(),
							"visibilityMin": DailyForecastData?.days(i)?.restOfDayForecast()?.visibilityMin(),
							"windDirection": DailyForecastData?.days(i)?.restOfDayForecast()?.windDirection(),
							"windGustSpeedMax": DailyForecastData?.days(i)?.restOfDayForecast()?.windGustSpeedMax(),
							"windSpeed": DailyForecastData?.days(i)?.restOfDayForecast()?.windSpeed(),
							"windSpeedMax": DailyForecastData?.days(i)?.restOfDayForecast()?.windSpeedMax(),
						};
						for (let j = 0; j < DailyForecastData?.days(i)?.restOfDayForecast()?.precipitationAmountByTypeLength(); j++) day.restOfDayForecast.precipitationAmountByType.push({
							"expected": DailyForecastData?.days(i)?.restOfDayForecast()?.precipitationAmountByType(j)?.expected(),
							"expectedSnow": DailyForecastData?.days(i)?.restOfDayForecast()?.precipitationAmountByType(j)?.expectedSnow(),
							"maximumSnow": DailyForecastData?.days(i)?.restOfDayForecast()?.precipitationAmountByType(j)?.maximumSnow(),
							"minimumSnow": DailyForecastData?.days(i)?.restOfDayForecast()?.precipitationAmountByType(j)?.minimumSnow(),
							"precipitationType": PrecipitationType[DailyForecastData?.days(i)?.restOfDayForecast()?.precipitationAmountByType(j)?.precipitationType()],
						});
					}					data.days.push(day);
				}				break;
			case "forecastHourly":
				data = {
					"metadata": this.decode(byteBuffer, "metadata", HourlyForecastData?.metadata()),
					"hours": [],
				};
				for (let i = 0; i < HourlyForecastData?.hoursLength(); i++) data.hours.push({
					"cloudCover": HourlyForecastData?.hours(i)?.cloudCover(),
					"cloudCoverHighAltPct": HourlyForecastData?.hours(i)?.cloudCoverHighAltPct(),
					"cloudCoverLowAltPct": HourlyForecastData?.hours(i)?.cloudCoverLowAltPct(),
					"cloudCoverMidAltPct": HourlyForecastData?.hours(i)?.cloudCoverMidAltPct(),
					"conditionCode": WeatherCondition[HourlyForecastData?.hours(i)?.conditionCode()],
					"daylight": HourlyForecastData?.hours(i)?.daylight(),
					"forecastStart": HourlyForecastData?.hours(i)?.forecastStart(),
					"humidity": HourlyForecastData?.hours(i)?.humidity(),
					"perceivedPrecipitationIntensity": HourlyForecastData?.hours(i)?.perceivedPrecipitationIntensity(),
					"precipitationAmount": HourlyForecastData?.hours(i)?.precipitationAmount(),
					"precipitationChance": HourlyForecastData?.hours(i)?.precipitationChance(),
					"precipitationIntensity": HourlyForecastData?.hours(i)?.precipitationIntensity(),
					"precipitationType": PrecipitationType[HourlyForecastData?.hours(i)?.precipitationType()],
					"pressure": HourlyForecastData?.hours(i)?.pressure(),
					"pressureTrend": PressureTrend[HourlyForecastData?.hours(i)?.pressureTrend()],
					"snowfallAmount": HourlyForecastData?.hours(i)?.snowfallAmount(),
					"snowfallIntensity": HourlyForecastData?.hours(i)?.snowfallIntensity(),
					"temperature": HourlyForecastData?.hours(i)?.temperature(),
					"temperatureApparent": HourlyForecastData?.hours(i)?.temperatureApparent(),
					"unknown20": HourlyForecastData?.hours(i)?.unknown20(),
					"temperatureDewPoint": HourlyForecastData?.hours(i)?.temperatureDewPoint(),
					"uvIndex": HourlyForecastData?.hours(i)?.uvIndex(),
					"visibility": HourlyForecastData?.hours(i)?.visibility(),
					"windDirection": HourlyForecastData?.hours(i)?.windDirection(),
					"windGust": HourlyForecastData?.hours(i)?.windGust(),
					"windSpeed": HourlyForecastData?.hours(i)?.windSpeed(),
				});
				break;
			case "forecastNextHour":
				data = {
					"metadata": this.decode(byteBuffer, "metadata", NextHourForecastData?.metadata()),
					"condition": [],
					"forecastEnd": NextHourForecastData?.forecastEnd(),
					"forecastStart": NextHourForecastData?.forecastStart(),
					"minutes": [],
					"summary": []
				};
				for (let i = 0; i < NextHourForecastData?.conditionLength(); i++) {
					let condition = {
						"beginCondition": ConditionType[NextHourForecastData?.condition(i)?.beginCondition()],
						"endCondition": ConditionType[NextHourForecastData?.condition(i)?.endCondition()],
						"endTime": NextHourForecastData?.condition(i)?.endTime(),
						"forecastToken": ForecastToken[NextHourForecastData?.condition(i)?.forecastToken()],
						"parameters": [],
						"startTime": NextHourForecastData?.condition(i)?.startTime(),
					};
					for (let j = 0; j < NextHourForecastData?.condition(i)?.parametersLength(); j++) condition.parameters.push({
						"date": NextHourForecastData?.condition(i)?.parameters(j)?.date(),
						"type": ParameterType[NextHourForecastData?.condition(i)?.parameters(j)?.type()],
					});
					data.condition.push(condition);
				}				for (let i = 0; i < NextHourForecastData?.minutesLength(); i++) data.minutes.push({
					"perceivedPrecipitationIntensity": NextHourForecastData?.minutes(i)?.perceivedPrecipitationIntensity(),
					"precipitationChance": NextHourForecastData?.minutes(i)?.precipitationChance(),
					"precipitationIntensity": NextHourForecastData?.minutes(i)?.precipitationIntensity(),
					"startTime": NextHourForecastData?.minutes(i)?.startTime(),
				});
				for (let i = 0; i < NextHourForecastData?.summaryLength(); i++) data.summary.push({
					"condition": PrecipitationType[NextHourForecastData?.summary(i)?.condition()],
					"endTime": NextHourForecastData?.summary(i)?.endTime(),
					"precipitationChance": NextHourForecastData?.summary(i)?.precipitationChance(),
					"precipitationIntensity": NextHourForecastData?.summary(i)?.precipitationIntensity(),
					"startTime": NextHourForecastData?.summary(i)?.startTime(),
				});
				break;
			case "metadata":
				data = {
					"attributionUrl": data?.attributionUrl(),
					"expireTime": data?.expireTime(),
					"language": data?.language(),
					"latitude": data?.latitude(),
					"longitude": data?.longitude(),
					"providerLogo": data?.providerLogo(),
					"providerName": data?.providerName(),
					"readTime": data?.readTime(),
					"reportedTime": data?.reportedTime(),
					"temporarilyUnavailable": data?.temporarilyUnavailable(),
					"sourceType": SourceType[data?.sourceType()],
				};
				break;
			case "news":
				data = {
					"metadata": this.decode(byteBuffer, "metadata", newsData?.metadata()),
					"placements": [],
				};
				for (let i = 0; i < newsData?.placementsLength(); i++) {
					let placement = {
						"articles": [],
						"placement": PlacementType[newsData?.placements(i)?.placement()],
						"priority": newsData?.placements(i)?.priority(),
					};
					for (let j = 0; j < newsData?.placements(i)?.articlesLength(); j++) {
						let article = {
							"alertIds": [],
							"headlineOverride": newsData?.placements(i)?.articles(j)?.headlineOverride(),
							"id": newsData?.placements(i)?.articles(j)?.id(),
							"locale": newsData?.placements(i)?.articles(j)?.locale(),
							"phenomena": [],
							"supportedStorefronts": [],
						};
						for (let k = 0; k < newsData?.placements(i)?.articles(j)?.alertIdsLength(); k++) article.alertIds.push(newsData?.placements(i)?.articles(j)?.alertIds(k));
						for (let k = 0; k < newsData?.placements(i)?.articles(j)?.phenomenaLength(); k++) article.phenomena.push(newsData?.placements(i)?.articles(j)?.phenomena(k));
						for (let k = 0; k < newsData?.placements(i)?.articles(j)?.supportedStorefrontsLength(); k++) article.supportedStorefronts.push(newsData?.placements(i)?.articles(j)?.supportedStorefronts(k));
						placement.articles.push(article);
					}					data.placements.push(placement);
				}				break;
			case "weatherAlert":
			case "weatherAlerts":
				data = {
					"metadata": this.decode(byteBuffer, "metadata", WeatherAlertCollectionData?.metadata()),
					"alerts": [],
					"detailsUrl": WeatherAlertCollectionData?.detailsUrl(),
				};
				for (let i = 0; i < WeatherAlertCollectionData?.alertsLength(); i++) {
					//let uuid = { "uuid": WeatherAlertCollectionData?.alerts(i)?.id().uuid() };
					let alert = {
						"areaId": WeatherAlertCollectionData?.alerts(i)?.areaId(),
						"attributionUrl": WeatherAlertCollectionData?.alerts(i)?.attributionUrl(),
						"certainty": Certainty[WeatherAlertCollectionData?.alerts(i)?.certainty()],
						"countryCode": WeatherAlertCollectionData?.alerts(i)?.countryCode(),
						"description": WeatherAlertCollectionData?.alerts(i)?.description(),
						"detailsUrl": WeatherAlertCollectionData?.alerts(i)?.detailsUrl(),
						"effectiveTime": WeatherAlertCollectionData?.alerts(i)?.effectiveTime(),
						"eventEndTime": WeatherAlertCollectionData?.alerts(i)?.eventEndTime(),
						"eventOnsetTime": WeatherAlertCollectionData?.alerts(i)?.eventOnsetTime(),
						"eventSource": WeatherAlertCollectionData?.alerts(i)?.eventSource(),
						"expireTime": WeatherAlertCollectionData?.alerts(i)?.expireTime(),
						"id": { "uuid": WeatherAlertCollectionData?.alerts(i)?.id()?.uuid() },
						"importance": ImportanceType[WeatherAlertCollectionData?.alerts(i)?.importance()],
						"issuedTime": WeatherAlertCollectionData?.alerts(i)?.issuedTime(),
						"phenomenon": WeatherAlertCollectionData?.alerts(i)?.phenomenon(),
						"responses": [],
						"severity": Severity[WeatherAlertCollectionData?.alerts(i)?.severity()],
						"significance": SignificanceType[WeatherAlertCollectionData?.alerts(i)?.significance()],
						"source": WeatherAlertCollectionData?.alerts(i)?.source(),
						"token": WeatherAlertCollectionData?.alerts(i)?.token(),
						"unknown3": WeatherAlertCollectionData?.alerts(i)?.unknown3(),
						"urgency": Urgency[WeatherAlertCollectionData?.alerts(i)?.urgency()],
					};
					//for (let j = 0; j < WeatherAlertCollectionData?.alerts(i)?.idLength(); j++) alert.id.push(WeatherAlertCollectionData?.alerts(i)?.id(j));
					//for (let j = 0; j < WeatherAlertCollectionData?.alerts(i)?.idLength(); j++) alert.id.push({ "lowBytes": WeatherAlertCollectionData?.alerts(i)?.id(j).lowBytes(), "highBytes": WeatherAlertCollectionData?.alerts(i)?.id(j).highBytes() });
					for (let j = 0; j < WeatherAlertCollectionData?.alerts(i)?.responsesLength(); j++) alert.responses.push(ResponseType[WeatherAlertCollectionData?.alerts(i)?.responses(j)]);
					data.alerts.push(alert);
				}				break;
			case "weatherChange":
			case "weatherChanges":
				data = {
					"metadata": this.decode(byteBuffer, "metadata", weatherChangesData?.metadata()),
					"changes": [],
					"forecastEnd": weatherChangesData?.forecastEnd(),
					"forecastStart": weatherChangesData?.forecastStart(),
				};
				for (let i = 0; i < weatherChangesData?.changesLength(); i++) {
					let change = {
						"dayPrecipitationChange": Direction[weatherChangesData?.changes(i)?.dayPrecipitationChange()],
						"forecastEnd": weatherChangesData?.changes(i)?.forecastEnd(),
						"forecastStart": weatherChangesData?.changes(i)?.forecastStart(),
						"maxTemperatureChange": Direction[weatherChangesData?.changes(i)?.maxTemperatureChange()],
						"minTemperatureChange": Direction[weatherChangesData?.changes(i)?.minTemperatureChange()],
						"nightPrecipitationChange": Direction[weatherChangesData?.changes(i)?.nightPrecipitationChange()],
					};
					data.changes.push(change);
				}				break;
			case "trendComparison":
			case "trendComparisons":
			case "historicalComparison":
			case "historicalComparisons":
				data = {
					"metadata": this.decode(byteBuffer, "metadata", historicalComparisonsData?.metadata()),
					"comparisons": [],
				};
				for (let i = 0; i < historicalComparisonsData?.comparisonsLength(); i++) {
					let comparison = {
						"baselineStartDate": historicalComparisonsData?.comparisons(i)?.baselineStartDate(),
						"baselineType": historicalComparisonsData?.comparisons(i)?.baselineType(),
						"baselineValue": historicalComparisonsData?.comparisons(i)?.baselineValue(),
						"condition": ComparisonType[historicalComparisonsData?.comparisons(i)?.condition()],
						"currentValue": historicalComparisonsData?.comparisons(i)?.currentValue(),
						"deviation": Deviation[historicalComparisonsData?.comparisons(i)?.deviation()],
					};
					data.comparisons.push(comparison);
				}				break;
		}		log(`✅ WeatherKit2.decode, dataSet: ${dataSet}`, "");
		return data;
	};

	static createWeather(builder, airQualityOffset, currentWeatherOffset, forecastDailyOffset, forecastHourlyOffset, forecastNextHourOffset, newsOffset, weatherAlertsOffset, weatherChangesOffset, historicalComparisonsOffset) {
		Weather.startWeather(builder);
		if (airQualityOffset) Weather.addAirQuality(builder, airQualityOffset);
		if (currentWeatherOffset) Weather.addCurrentWeather(builder, currentWeatherOffset);
		if (forecastDailyOffset) Weather.addForecastDaily(builder, forecastDailyOffset);
		if (forecastHourlyOffset) Weather.addForecastHourly(builder, forecastHourlyOffset);
		if (forecastNextHourOffset) Weather.addForecastNextHour(builder, forecastNextHourOffset);
		if (newsOffset) Weather.addNews(builder, newsOffset);
		if (weatherAlertsOffset) Weather.addWeatherAlerts(builder, weatherAlertsOffset);
		if (weatherChangesOffset) Weather.addWeatherChanges(builder, weatherChangesOffset);
		if (historicalComparisonsOffset) Weather.addHistoricalComparisons(builder, historicalComparisonsOffset);
		return Weather.endWeather(builder);
	}

}

class AirQuality {
	static Name = "AirQuality";
	static Version = "2.2.5";
	static Author = "Virgil Clyne & Wordless Echo";

	static #Config = {
		"Scales": {
			"HJ_633": {
				/**
				 * China AQI standard.
				 * [环境空气质量指数（AQI）技术规定（试行）]{@link https://www.mee.gov.cn/ywgz/fgbz/bz/bzwb/jcffbz/201203/W020120410332725219541.pdf}
				 * @type aqiStandard
				 */
				"scale": 'HJ6332012',
				"categoryIndex": {
					"-1": [Number.MIN_VALUE, -1], // INVALID
					"1": [0, 50], // GOOD
					"2": [51, 100], // MODERATE
					"3": [101, 150], // UNHEALTHY_FOR_SENSITIVE
					"4": [151, 200], // UNHEALTHY
					"5": [201, 300], // VERY_UNHEALTHY
					"6": [301, 500], // HAZARDOUS
					"7": [500, Number.MAX_VALUE], // OVER_RANGE
				},
				"significant": 3,
				"pollutants": {
					"SO2_24H": {
						"units": 'MICROGRAMS_PER_CUBIC_METER',
						"ppxToXGM3": -1,
						"ranges": {
							"1": [0, 50], // GOOD
							"2": [51, 150], // MODERATE
							"3": [151, 475], // UNHEALTHY_FOR_SENSITIVE
							"4": [476, 800], // UNHEALTHY
							"5": [801, 1600], // VERY_UNHEALTHY
							"6": [1601, 2100], // HAZARDOUS
							"7": [2101, 2602], // OVER_RANGE
						},
					},
					"SO2": {
						"units": 'MICROGRAMS_PER_CUBIC_METER',
						"ppxToXGM3": -1,
						"ranges": {
							"1": [0, 150], // GOOD
							"2": [151, 500], // MODERATE
							"3": [501, 650], // UNHEALTHY_FOR_SENSITIVE
							"4": [651, 800], // UNHEALTHY
							// 二氧化硫（SO2）1小时平均浓度高于800 ug/m3的，不再进行其空气质量分指数计算，二氧化硫（SO2）空气质量分指数按24小时平均浓度计算的分指数报告。
						},
					},
					"NO2_24H": {
						"units": 'MICROGRAMS_PER_CUBIC_METER',
						"ppxToXGM3": -1,
						"ranges": {
							"1": [0, 40], // GOOD
							"2": [41, 80], // MODERATE
							"3": [81, 180], // UNHEALTHY_FOR_SENSITIVE
							"4": [181, 280], // UNHEALTHY
							"5": [281, 565], // VERY_UNHEALTHY
							"6": [566, 750], // HAZARDOUS
							"7": [751, 940], // OVER_RANGE
						},
					},
					"NO2": {
						"units": 'MICROGRAMS_PER_CUBIC_METER',
						"ppxToXGM3": -1,
						"ranges": {
							"1": [0, 100], // GOOD
							"2": [101, 200], // MODERATE
							"3": [201, 700], // UNHEALTHY_FOR_SENSITIVE
							"4": [701, 1200], // UNHEALTHY
							"5": [1201, 2340], // VERY_UNHEALTHY
							"6": [2341, 3090], // HAZARDOUS
							"7": [3091, 3840], // OVER_RANGE
						},
					},
					"PM10_24H": {
						"units": 'MICROGRAMS_PER_CUBIC_METER',
						"ppxToXGM3": -1,
						"ranges": {
							"1": [0, 50], // GOOD
							"2": [51, 150], // MODERATE
							"3": [151, 250], // UNHEALTHY_FOR_SENSITIVE
							"4": [251, 350], // UNHEALTHY
							"5": [351, 420], // VERY_UNHEALTHY
							"6": [421, 500], // HAZARDOUS
							"7": [501, 600], // OVER_RANGE
						},
					},
					"CO_24H": {
						"units": 'MILLIGRAMS_PER_CUBIC_METER',
						"ppxToXGM3": -1,
						"ranges": {
							"1": [0, 2], // GOOD
							"2": [3, 4], // MODERATE
							"3": [5, 14], // UNHEALTHY_FOR_SENSITIVE
							"4": [15, 24], // UNHEALTHY
							"5": [25, 36], // VERY_UNHEALTHY
							"6": [37, 48], // HAZARDOUS
							"7": [49, 60], // OVER_RANGE
						},
					},
					"CO": {
						"units": 'MILLIGRAMS_PER_CUBIC_METER',
						"ppxToXGM3": -1,
						"ranges": {
							"1": [0, 5], // GOOD
							"2": [6, 10], // MODERATE
							"3": [11, 35], // UNHEALTHY_FOR_SENSITIVE
							"4": [36, 60], // UNHEALTHY
							"5": [61, 90], // VERY_UNHEALTHY
							"6": [91, 120], // HAZARDOUS
							"7": [121, 150], // OVER_RANGE
						},
					},
					"OZONE": {
						"units": 'MICROGRAMS_PER_CUBIC_METER',
						"ppxToXGM3": -1,
						"ranges": {
							"1": [0, 160], // GOOD
							"2": [161, 200], // MODERATE
							"3": [201, 300], // UNHEALTHY_FOR_SENSITIVE
							"4": [301, 400], // UNHEALTHY
							"5": [401, 800], // VERY_UNHEALTHY
							"6": [801, 1000], // HAZARDOUS
							"7": [1001, 1200], // OVER_RANGE
						},
					},
					"OZONE_8H": {
						"units": 'MICROGRAMS_PER_CUBIC_METER',
						"ppxToXGM3": -1,
						"ranges": {
							"1": [0, 100], // GOOD
							"2": [101, 160], // MODERATE
							"3": [161, 215], // UNHEALTHY_FOR_SENSITIVE
							"4": [216, 265], // UNHEALTHY
							"5": [266, 800], // VERY_UNHEALTHY
							// 臭氧（O3）8小时平均浓度值高于800 ug/m3的，不再进行其空气质量分指数计算，臭氧（O3）空气质量分指数按1小时平均浓度计算的分指数报告。
						},
					},
					"PM2_5_24H": {
						"units": 'MICROGRAMS_PER_CUBIC_METER',
						"ppxToXGM3": -1,
						"ranges": {
							"1": [0, 35], // GOOD
							"2": [36, 75], // MODERATE
							"3": [76, 115], // UNHEALTHY_FOR_SENSITIVE
							"4": [116, 150], // UNHEALTHY
							"5": [151, 250], // VERY_UNHEALTHY
							"6": [251, 350], // HAZARDOUS
							"7": [351, 500], // OVER_RANGE
						},
					},
				},
			},
			"EPA_NowCast": {
				/**
				 * US AQI standard, not equal to NowCast.
				 * [EPA 454/B-18-007]{@link https://www.airnow.gov/sites/default/files/2020-05/aqi-technical-assistance-document-sept2018.pdf}
				 * @type aqiStandard
				 */
				"scale": 'EPA_NowCast',
				"categoryIndex": {
					"-1": [Number.MIN_VALUE, -1], // INVALID
					"1": [0, 50], // GOOD
					"2": [51, 100], // MODERATE
					"3": [101, 150], // UNHEALTHY_FOR_SENSITIVE
					"4": [151, 200], // UNHEALTHY
					"5": [201, 300], // VERY_UNHEALTHY
					"6": [301, 500], // HAZARDOUS
					"7": [500, Number.MAX_VALUE], // OVER_RANGE
				},
				"significant": 3,
				"pollutants": {
					"OZONE_8H": {
						"units": 'PARTS_PER_MILLION',
						"ppxToXGM3": 1.97, // 48 g/mol
						"ranges": {
							"1": [0, 0.054], // GOOD
							"2": [0.055, 0.070], // MODERATE
							"3": [0.071, 0.085], // UNHEALTHY_FOR_SENSITIVE
							"4": [0.086, 0.105], // UNHEALTHY
							"5": [0.106, 0.200], // VERY_UNHEALTHY
							// 8-hour O3 values do not define higher AQI values (≥ 301).
							// AQI values of 301 or higher are calculated with 1-hour O3 concentrations.
						}
					},
					"OZONE": {
						"units": 'PARTS_PER_MILLION',
						"ppxToXGM3": 1.97, // 48 g/mol
						"ranges": {
							// Areas are generally required to report the AQI based on 8-hour O3 values. However,
							// there are a small number of areas where an AQI based on 1-hour O3 values would be more precautionary.
							// In these cases, in addition to calculating the 8-hour O3 index value,
							// the 1-hour O3 value may be calculated, and the maximum of the two values reported.
							"3": [0.125, 0.164], // UNHEALTHY_FOR_SENSITIVE
							"4": [0.165, 0.204], // UNHEALTHY
							"5": [0.205, 0.404], // VERY_UNHEALTHY
							"6": [0.405, 0.604], // HAZARDOUS
						}
					},
					"PM2_5": {
						"units": 'MICROGRAMS_PER_CUBIC_METER',
						"ppxToXGM3": -1,
						"ranges": {
							"1": [0.0, 9.0], // GOOD
							"2": [9.1, 35.4], // MODERATE
							"3": [35.5, 55.4], // UNHEALTHY_FOR_SENSITIVE
							"4": [55.5, 125.4], // UNHEALTHY
							"5": [125.5, 225.4], // VERY_UNHEALTHY
							"6": [225.5, 325.4], // HAZARDOUS
						}
					},
					"PM10": {
						"units": 'MICROGRAMS_PER_CUBIC_METER',
						"ppxToXGM3": -1,
						"ranges": {
							"1": [0, 54], // GOOD
							"2": [55, 154], // MODERATE
							"3": [155, 254], // UNHEALTHY_FOR_SENSITIVE
							"4": [255, 354], // UNHEALTHY
							"5": [355, 424], // VERY_UNHEALTHY
							"6": [425, 604], // HAZARDOUS
						}
					},
					"CO_8H": {
						"units": 'PARTS_PER_MILLION',
						"ppxToXGM3": 1.14, // 28 g/mol
						"ranges": {
							"1": [0.0, 4.4], // GOOD
							"2": [4.5, 9.4], // MODERATE
							"3": [9.5, 12.4], // UNHEALTHY_FOR_SENSITIVE
							"4": [12.5, 15.4], // UNHEALTHY
							"5": [15.5, 30.4], // VERY_UNHEALTHY
							"6": [30.5, 50.4], // HAZARDOUS
						}
					},
					"CO": {
						"units": 'PARTS_PER_MILLION',
						"ppxToXGM3": 1.14, // 28 g/mol
						"ranges": {
							"1": [0.0, 4.4], // GOOD
							"2": [4.5, 9.4], // MODERATE
							"3": [9.5, 12.4], // UNHEALTHY_FOR_SENSITIVE
							"4": [12.5, 15.4], // UNHEALTHY
							"5": [15.5, 30.4], // VERY_UNHEALTHY
							"6": [30.5, 50.4], // HAZARDOUS
						}
					},
					"SO2": {
						"units": 'PARTS_PER_BILLION',
						"ppxToXGM3": 2.62, // 64 g/mol
						"ranges": {
							"1": [0, 35], // GOOD
							"2": [36, 75], // MODERATE
							"3": [76, 185], // UNHEALTHY_FOR_SENSITIVE
							"4": [186, 304], // UNHEALTHY
							// 1-hour SO2 values do not define higher AQI values (≥ 200).
							// AQI values of 200 or greater are calculated with 24-hour SO2 concentrations.
						}
					},
					"SO2_24H": {
						"units": 'PARTS_PER_BILLION',
						"ppxToXGM3": -1,
						"ranges": {
							"5": [305, 604], // VERY_UNHEALTHY
							"6": [605, 1004], // HAZARDOUS
						}
					},
					// NOT FOR CALCULATION
					//
					// EPA strengthened the primary standard for SO2 in 2010.
					// Because there was not enough health information to inform changing the upper end of the AQI for SO2,
					// the upper end continues to use the 24-hour average SO2 concentration.
					// The lower end of the AQI uses the daily max 1-hour SO2 concentration.
					//
					// If you have a daily max 1-hour SO2 concentration below 305 ppb,
					// then use the breakpoints in Table 6 to calculate the AQI value.
					//
					// If you have a 24-hour average SO2 concentration greater than or equal to 305 ppb,
					// then use the breakpoints in Table 6 to calculate the AQI value.
					// If you have a 24-hour value in this range,
					// it will always result in a higher AQI value than a 1-hour value would.
					//
					// On rare occasions, you could have a day where the daily max 1-hour concentration is at or above 305 ppb
					// but when you try to use the 24-hour average to calculate the AQI value,
					// you find that the 24-hour concentration is not above 305 ppb.
					// If this happens, use 200 for the lower and upper AQI breakpoints (ILo and IHi) in Equation 1
					// to calculate the AQI value based on the daily max 1-hour value.
					// This effectively fixes the AQI value at 200 exactly,
					// which ensures that you get the highest possible AQI value associated with your 1-hour concentration
					// on such days.
					"SO2_MAX_1H": {
						"units": 'PARTS_PER_BILLION',
						"ppxToXGM3": -1,
						"ranges": {
							"5": [305, 604], // VERY_UNHEALTHY
							"6": [605, Number.MAX_VALUE], // HAZARDOUS
						}
					},
					"NO2": {
						"units": 'PARTS_PER_BILLION',
						"ppxToXGM3": 1.88, // 46 g/mol
						"ranges": {
							"1": [0, 53], // GOOD
							"2": [54, 100], // MODERATE
							"3": [101, 360], // UNHEALTHY_FOR_SENSITIVE
							"4": [361, 649], // UNHEALTHY
							"5": [650, 1249], // VERY_UNHEALTHY
							"6": [1250, 2049], // HAZARDOUS
						}
					},
				}
			},
			"WAQI_InstantCast": {
				/**
				 * WAQI InstantCast.
				 * [A Beginner's Guide to Air Quality Instant-Cast and Now-Cast.]{@link https://aqicn.org/faq/2015-03-15/air-quality-nowcast-a-beginners-guide/}
				 * [Ozone AQI Scale update]{@link https://aqicn.org/faq/2016-08-10/ozone-aqi-scale-update/}
				 * @type aqiStandard
				 */
				"scale": 'EPA_NowCast',
				"categoryIndex": {
					"-1": [Number.MIN_VALUE, -1], // INVALID
					"1": [0, 50], // GOOD
					"2": [51, 100], // MODERATE
					"3": [101, 150], // UNHEALTHY_FOR_SENSITIVE
					"4": [151, 200], // UNHEALTHY
					"5": [201, 300], // VERY_UNHEALTHY
					"6": [301, 500], // HAZARDOUS
					"7": [500, Number.MAX_VALUE], // OVER_RANGE
				},
				"significant": 3,
				"pollutants": {
					"OZONE": {
						"units": 'PARTS_PER_BILLION',
						"ppxToXGM3": 1.97,
						"ranges": {
							"1": [0, 61.5], // GOOD
							"2": [62.5, 100.5], // MODERATE
							"3": [101.5, 151.5], // UNHEALTHY_FOR_SENSITIVE
							"4": [152.5, 204], // UNHEALTHY
							"5": [205, 404], // VERY_UNHEALTHY
							"6": [405, 605], // HAZARDOUS
						},
					},
					"SO2": {
						"units": 'PARTS_PER_BILLION',
						"ppxToXGM3": 2.62,
						"ranges": {
							"1": [0, 35], // GOOD
							"2": [36, 75], // MODERATE
							"3": [76, 185], // UNHEALTHY_FOR_SENSITIVE
							"4": [186, 304], // UNHEALTHY
						},
					},
					"SO2_MAX_1H": {
						"units": 'PARTS_PER_BILLION',
						"ppxToXGM3": -1,
						"ranges": {
							"5": [305, 604], // VERY_UNHEALTHY
							"6": [605, Number.MAX_VALUE], // HAZARDOUS
						},
					},
					"NO2": {
						"units": 'PARTS_PER_BILLION',
						"ppxToXGM3": 1.88,
						"ranges": {
							"1": [0, 53], // GOOD
							"2": [54, 100], // MODERATE
							"3": [101, 360], // UNHEALTHY_FOR_SENSITIVE
							"4": [361, 649], // UNHEALTHY
							"5": [650, 1249], // VERY_UNHEALTHY
							"6": [1250, 2049], // HAZARDOUS
						},
					},
					"PM2_5": {
						"units": 'MICROGRAMS_PER_CUBIC_METER',
						"ppxToXGM3": -1,
						"ranges": {
							"1": [0.0, 9.0], // GOOD
							"2": [9.1, 35.4], // MODERATE
							"3": [35.5, 55.4], // UNHEALTHY_FOR_SENSITIVE
							"4": [55.5, 125.4], // UNHEALTHY
							"5": [125.5, 225.4], // VERY_UNHEALTHY
							"6": [225.5, 325.4], // HAZARDOUS
						},
					},
					"PM10": {
						"units": 'MICROGRAMS_PER_CUBIC_METER',
						"ppxToXGM3": -1,
						"ranges": {
							"1": [0, 54], // GOOD
							"2": [55, 154], // MODERATE
							"3": [155, 254], // UNHEALTHY_FOR_SENSITIVE
							"4": [255, 354], // UNHEALTHY
							"5": [355, 424], // VERY_UNHEALTHY
							"6": [425, 604], // HAZARDOUS
						},
					},
					"CO": {
						"units": 'PARTS_PER_MILLION',
						"ppxToXGM3": 1.14,
						"ranges": {
							"1": [0.0, 4.4], // GOOD
							"2": [4.5, 9.4], // MODERATE
							"3": [9.5, 12.4], // UNHEALTHY_FOR_SENSITIVE
							"4": [12.5, 15.4], // UNHEALTHY
							"5": [15.5, 30.4], // VERY_UNHEALTHY
							"6": [30.5, 50.4], // HAZARDOUS
						},
					},
				}
			},
		},
		"Pollutants": {
			"co": "CO",
			"no": "NO",
			"no2": "NO2",
			"so2": "SO2",
			"o3": "OZONE",
			"nox": "NOX",
			"pm25": "PM2_5",
			"pm10": "PM10",
			"other": "NOT_AVAILABLE"
		},
	};

	static Pollutants(pollutants = [], scale = "WAQI_InstantCast") {
		log(`☑️ Pollutants, scale: ${scale}`, "");
		pollutants = pollutants.map(pollutant => {
			// Convert unit based on standard
			const PollutantStandard = this.#Config.Scales[scale].pollutants[pollutant.pollutantType];
			pollutant.convertedAmount = this.ConvertUnit(pollutant.amount, pollutant.units, PollutantStandard.units, PollutantStandard.ppxToXGM3);
			pollutant.convertedUnits = PollutantStandard.units;
			pollutant = { ...PollutantStandard, ...pollutant };
			// Calculate AQI for each pollutant
			let categoryIndexKey;
			for (const [key, value] of Object.entries(pollutant.ranges)) {
				categoryIndexKey = parseInt(key, 10);
				if (pollutant.convertedAmount >= value[0] && pollutant.convertedAmount <= value[1]) break;
			}			pollutant.range = pollutant.ranges[categoryIndexKey];
			pollutant.categoryIndex = parseInt(categoryIndexKey, 10);
			pollutant.category = this.#Config.Scales[scale].categoryIndex[categoryIndexKey];
			pollutant.AQI = Math.round(
				((pollutant.category[1] - pollutant.category[0]) * (pollutant.convertedAmount - pollutant.range[0])) / (pollutant.range[1] - pollutant.range[0])
				+ pollutant.category[0],
			);
			return pollutant;
		});
		//log(`🚧 Pollutants, pollutants: ${JSON.stringify(pollutants, null, 2)}`, "");
		log(`✅ Pollutants`, "");
		return pollutants;
	};

	static ConvertScale(pollutants = [], scale = "WAQI_InstantCast", convertUnits = false) {
		log(`☑️ ConvertScale`, "");
		pollutants = this.Pollutants(pollutants, scale);
		const { AQI: index, pollutantType: primaryPollutant } = pollutants.reduce((previous, current) => previous.AQI > current.AQI ? previous : current);
		let airQuality = {
			"index": index,
			"pollutants": pollutants,
			"scale": this.#Config.Scales[scale].scale,
			"primaryPollutant": primaryPollutant,
			"categoryIndex": this.CategoryIndex(index, scale),
		};
		airQuality.isSignificant = airQuality.categoryIndex >= this.#Config.Scales[scale].significant;
		if (convertUnits) airQuality.pollutants = airQuality.pollutants.map(pollutant => {
			pollutant.amount = pollutant.convertedAmount;
			pollutant.units = pollutant.convertedUnits;
			return pollutant;
		});
		//log(`🚧 ConvertScale, airQuality: ${JSON.stringify(airQuality, null, 2)}`, "");
		log(`✅ ConvertScale`, "");
		return airQuality;
	};

	static ConvertUnit(amount = Number(), unitFrom, unitTo, ppxToXGM3Value = -1) {
		//log(`☑️ ConvertUnit`, "");
		//log(`☑️ ConvertUnit\namount: ${amount}   ppxToXGM3Value: ${ppxToXGM3Value}\nunitFrom: ${unitFrom}   unitTo: ${unitTo}`, "");
		if (amount < 0) amount = -1;
		else switch (unitFrom) {
			case 'PARTS_PER_MILLION':
				switch (unitTo) {
					case 'PARTS_PER_MILLION':
						break;
					case 'PARTS_PER_BILLION':
						amount = amount * 1000;
						break;
					case 'MILLIGRAMS_PER_CUBIC_METER':
						amount = amount * ppxToXGM3Value;
						break;
					case 'MICROGRAMS_PER_CUBIC_METER': {
						const inPpb = this.ConvertUnit(amount, unitFrom, 'PARTS_PER_BILLION', ppxToXGM3Value);
						amount = inPpb * ppxToXGM3Value;
						break;
					}					default:
						amount = -1;
						break;
				}				break;
			case 'PARTS_PER_BILLION':
				switch (unitTo) {
					case 'PARTS_PER_BILLION':
						break;
					case 'PARTS_PER_MILLION':
						amount = amount * 0.001;
						break;
					case 'MILLIGRAMS_PER_CUBIC_METER': {
						const inPpm = this.ConvertUnit(amount, unitFrom, 'PARTS_PER_MILLION', ppxToXGM3Value);
						amount = inPpm * ppxToXGM3Value;
						break;
					}					case 'MICROGRAMS_PER_CUBIC_METER':
						amount = amount * ppxToXGM3Value;
						break;
					default:
						amount = -1;
						break;
				}				break;
			case 'MILLIGRAMS_PER_CUBIC_METER':
				switch (unitTo) {
					case 'MILLIGRAMS_PER_CUBIC_METER':
						break;
					case 'MICROGRAMS_PER_CUBIC_METER':
						amount = amount * 1000;
						break;
					case 'PARTS_PER_MILLION':
						amount = amount / ppxToXGM3Value;
						break;
					case 'PARTS_PER_BILLION': {
						const inUgM3 = this.ConvertUnit(amount, unitFrom, 'MICROGRAMS_PER_CUBIC_METER', ppxToXGM3Value);
						amount = inUgM3 / ppxToXGM3Value;
						break;
					}					default:
						amount = -1;
						break;
				}				break;
			case 'MICROGRAMS_PER_CUBIC_METER':
				switch (unitTo) {
					case 'MICROGRAMS_PER_CUBIC_METER':
						break;
					case 'MILLIGRAMS_PER_CUBIC_METER':
						amount = amount * 0.001;
						break;
					case 'PARTS_PER_MILLION': {
						const inMgM3 = this.ConvertUnit(amount, unitFrom, 'MILLIGRAMS_PER_CUBIC_METER', ppxToXGM3Value);
						amount = inMgM3 / ppxToXGM3Value;
						break;
					}					case 'PARTS_PER_BILLION':
						amount = amount / ppxToXGM3Value;
						break;
					default:
						amount = -1;
						break;
				}				break;
			default:
				amount = -1;
				break;
		}		//log(`✅ ConvertUnit, amount: ${amount}`, "");
		return amount;
	};

	static CategoryIndex(aqi = Number(), scale = "WAQI_InstantCast") {
		switch (typeof aqi) {
			case "number":
				break;
			case "string":
				aqi = parseInt(aqi, 10);
				break;
		}		log(`☑️ CategoryIndex, aqi: ${aqi}`, "");
		let categoryIndex;
		for (const [key, value] of Object.entries(this.#Config.Scales[scale].categoryIndex)) {
			categoryIndex = parseInt(key, 10);
			if (aqi >= value[0] && aqi <= value[1]) break;
		}		log(`✅ CategoryIndex, categoryIndex: ${categoryIndex}`, "");
		return categoryIndex;
	};

	static FixUnits(pollutants = []) {
		log(`☑️ FixUnits`, "");
		pollutants = pollutants.map(pollutant => {
			switch (pollutant.units) {
				case "PARTS_PER_MILLION":
					pollutant.amount = AirQuality.ConvertUnit(pollutant.amount, pollutant.units, "PARTS_PER_BILLION"); // Will not convert to Xg/m3
					pollutant.units = "PARTS_PER_BILLION";
					break
				case 'MILLIGRAMS_PER_CUBIC_METER':
					pollutant.amount = AirQuality.ConvertUnit(pollutant.amount, pollutant.units, "MICROGRAMS_PER_CUBIC_METER"); // Will not convert to Xg/m3
					pollutant.units = "MICROGRAMS_PER_CUBIC_METER";
					break;
			}			return pollutant;
		});
		//log(`🚧 FixUnits, pollutants: ${JSON.stringify(pollutants, null, 2)}`, "");
		log(`✅ FixUnits`, "");
		return pollutants;
	};
}

class WAQI {
    constructor(options) {
        this.Name = "WAQI";
        this.Version = "1.3.9";
        log(`\n🟧 ${this.Name} v${this.Version}\n`, "");
        this.url = new URL($request.url);
        this.header = { "Content-Type": "application/json" };
        const Parameters = parseWeatherKitURL(this.url);
        Object.assign(this, Parameters, options);
    };

    #Configs = {
        "Pollutants": {
            "co": "CO",
            "no": "NO",
            "no2": "NO2",
            "so2": "SO2",
            "o3": "OZONE",
            "nox": "NOX",
            "pm25": "PM2_5",
            "pm10": "PM10",
            "other": "NOT_AVAILABLE"
        },
    };

    async Nearest(mapqVersion = "mapq") {
        log(`☑️ Nearest, mapqVersion: ${mapqVersion}`, "");
        const request = {
            "url": `https://api.waqi.info/${mapqVersion}/nearest?n=1&geo=1/${this.latitude}/${this.longitude}`,
            //"url": `https://mapq.waqi.info/${mapqVersion}/nearest/station/${stationId}?n=1`,
            "header": this.header,
        };
        let airQuality;
        try {
            const body = await fetch(request).then(response => JSON.parse(response?.body ?? "{}"));
            const timeStamp = Math.round(Date.now() / 1000);
            switch (mapqVersion) {
                case "mapq":
                    switch (body?.status) {
                        default:
                        case undefined:
                            airQuality = {
                                "metadata": {
                                    "attributionUrl": request.url,
                                    "expireTime": timeStamp + 60 * 60,
                                    "language": `${this.language}-${this.country}`,
                                    "latitude": body?.d?.[0]?.geo?.[0],
                                    "longitude": body?.d?.[0]?.geo?.[1],
                                    "providerLogo": providerNameToLogo("WAQI", this.version),
                                    "providerName": `World Air Quality Index Project\n监测站：${body?.d?.[0]?.nna}`,
                                    "readTime": timeStamp,
                                    "reportedTime": body?.d?.[0]?.t,
                                    "temporarilyUnavailable": false,
                                    "sourceType": "STATION",
                                    "stationId": parseInt(body?.d?.[0]?.x, 10),
                                    "stationKey": body?.d?.[0]?.k,
                                },
                                "categoryIndex": AirQuality.CategoryIndex(body?.d?.[0]?.v, "WAQI_InstantCast"),
                                "index": parseInt(body?.d?.[0]?.v, 10),
                                //"previousDayComparison": "UNKNOWN",
                                "primaryPollutant": this.#Configs.Pollutants[body?.d?.[0]?.pol] || "NOT_AVAILABLE",
                                "scale": "EPA_NowCast"
                            };
                            airQuality.isSignificant = airQuality.categoryIndex >= 3;
                            break;
                        case "error":
                            throw JSON.stringify({ "status": body?.status, "reason": body?.message });
                    };
                    break;
                case "mapq2":
                    switch (body?.status) {
                        case "ok":
                            airQuality = {
                                "metadata": {
                                    "attributionUrl": request.url,
                                    "language": `${this.language}-${this.country}`,
                                    "latitude": body?.data?.stations?.[0]?.geo?.[0],
                                    "longitude": body?.data?.stations?.[0]?.geo?.[1],
                                    "expireTime": timeStamp + 60 * 60,
                                    "providerLogo": providerNameToLogo("WAQI", this.version),
                                    "providerName": `World Air Quality Index Project\n监测站：${body?.data?.stations?.[0]?.name}`,
                                    "readTime": timeStamp,
                                    "reportedTime": Math.round(new Date(body?.data?.stations?.[0]?.utime).getTime() / 1000),
                                    "temporarilyUnavailable": false,
                                    "sourceType": "STATION",
                                    "stationId": parseInt(body?.data?.stations?.[0]?.idx, 10),
                                },
                                "categoryIndex": AirQuality.CategoryIndex(body?.data?.stations?.[0]?.aqi, "WAQI_InstantCast"),
                                "index": parseInt(body?.data?.stations?.[0]?.aqi, 10),
                                //"previousDayComparison": "UNKNOWN",
                                "primaryPollutant": "NOT_AVAILABLE",
                                "scale": "EPA_NowCast"
                            };
                            airQuality.isSignificant = airQuality.categoryIndex >= 3;
                            break;
                        case "error":
                        case undefined:
                            throw JSON.stringify({ "status": body?.status, "reason": body?.reason });
                    };
                    break;
                default:
                    break;
            };
        } catch (error) {
            logError(error);
        } finally {
            //log(`🚧 airQuality: ${JSON.stringify(airQuality, null, 2)}`, "");
            log(`✅ Nearest`, "");
            return airQuality;
        }    };

    async Token(stationId = Number()) {
        log(`☑️ Token, stationId: ${stationId}`, "");
        const request = {
            "url": `https://api.waqi.info/api/token/${stationId}`,
            "header": this.header,
        };
        let token;
        try {
            const body = await fetch(request).then(response => JSON.parse(response?.body ?? "{}"));
            const timeStamp = Math.round(Date.now() / 1000);
            switch (body?.status) {
                case "error":
                    throw JSON.stringify({ "status": body?.status, "reason": body?.data });
                default:
                    switch (body?.rxs?.status) {
                        case "ok":
                            switch (body?.rxs?.obs?.[0]?.status) {
                                case "ok":
                                    token = body?.rxs?.obs?.[0]?.msg?.token;
                                    //uid = body?.rxs?.obs?.[0]?.uid;
                                    break;
                                case "error":
                                    throw JSON.stringify({ "status": body?.rxs?.obs?.[0]?.status, "reason": body?.rxs?.obs?.[0]?.msg });
                            };
                            break;
                        case "error":
                        case undefined:
                            throw JSON.stringify({ "status": body?.rxs?.status, "reason": body?.rxs });
                    };
                    break;
            };
        } catch (error) {
            logError(error);
        } finally {
            //log(`🚧 token: ${token}`, "");
            log(`✅ Token`, "");
            return token;
        }    };

    async AQI(stationId = Number(), token = this.token) {
        log(`☑️ AQI, stationId: ${stationId}, token: ${token}`, "");
        const request = {
            "url": `https://api.waqi.info/api/feed/@${stationId}/aqi.json`,
            "header": this.header,
            "body": `token=${token}&id=${stationId}`,
        };
        let airQuality;
        try {
            const body = await fetch(request).then(response => JSON.parse(response?.body ?? "{}"));
            const timeStamp = Math.round(Date.now() / 1000);
            switch (body?.status) {
                case "error":
                    throw JSON.stringify({ "status": body?.status, "reason": body?.data });
                default:
                case undefined:
                    switch (body?.rxs?.status) {
                        case "ok":
                            switch (body?.rxs?.obs?.[0]?.status) {
                                case "ok":
                                    airQuality = {
                                        "metadata": {
                                            "attributionUrl": body?.rxs?.obs?.[0]?.msg?.city?.url,
                                            "expireTime": timeStamp + 60 * 60,
                                            "language": `${this.language}-${this.country}`,
                                            "latitude": body?.rxs?.obs?.[0]?.msg?.city?.geo?.[0],
                                            "longitude": body?.rxs?.obs?.[0]?.msg?.city?.geo?.[1],
                                            "providerLogo": providerNameToLogo("WAQI", this.version),
                                            "providerName": `World Air Quality Index Project\n监测站：${body?.rxs?.obs?.[0]?.msg?.city?.name}`,
                                            "readTime": timeStamp,
                                            "reportedTime": body?.rxs?.obs?.[0]?.msg?.time?.v,
                                            "temporarilyUnavailable": false,
                                            "sourceType": "STATION",
                                            "stationId": stationId,
                                        },
                                        "categoryIndex": AirQuality.CategoryIndex(body?.rxs?.obs?.[0]?.msg?.aqi, "WAQI_InstantCast"),
                                        "index": parseInt(body?.rxs?.obs?.[0]?.msg?.aqi, 10),
                                        //"previousDayComparison": "UNKNOWN",
                                        "primaryPollutant": this.#Configs.Pollutants[body?.rxs?.obs?.[0]?.msg?.dominentpol] || "NOT_AVAILABLE",
                                        "scale": "EPA_NowCast"
                                    };
                                    airQuality.isSignificant = airQuality.categoryIndex >= 3;
                                    break;
                                case "error":
                                case undefined:
                                    throw JSON.stringify({ "status": body?.rxs?.[0]?.status, "reason": body?.rxs?.obs?.[0]?.msg });
                            };
                            break;
                        case "error":
                        case undefined:
                            throw JSON.stringify({ "status": body?.rxs?.status, "reason": body?.rxs });
                    };
                    break;
            };
        } catch (error) {
            logError(error);
        } finally {
            //log(`🚧 airQuality: ${JSON.stringify(airQuality, null, 2)}`, "");
            log(`✅ AQI`, "");
            return airQuality;
        }    };

    async AQI2(stationId = Number(), token = this.token) {
        log(`☑️ AQI2, stationId: ${stationId}`, "");
        const request = {
            "url": `https://api2.waqi.info/feed/geo:${this.latitude};${this.longitude}/?token=${token}`,
            "header": this.header,
        };
        if (stationId) request.url = `https://api2.waqi.info/feed/@${stationId}/?token=${token}`;
        let airQuality;
        try {
            const body = await fetch(request).then(response => JSON.parse(response?.body ?? "{}"));
            const timeStamp = Math.round(Date.now() / 1000);
            switch (body?.status) {
                case "ok":
                    airQuality = {
                        "metadata": {
                            "attributionUrl": body?.data?.city?.url,
                            "expireTime": timeStamp + 60 * 60,
                            "language": `${this.language}-${this.country}`,
                            "latitude": body?.data?.city?.geo?.[0],
                            "longitude": body?.data?.city?.geo?.[1],
                            "providerLogo": providerNameToLogo("WAQI", this.version),
                            "providerName": `World Air Quality Index Project\n监测站：${body?.data?.city?.name}`,
                            "readTime": timeStamp,
                            "reportedTime": body?.data?.time?.v,
                            "temporarilyUnavailable": false,
                            "sourceType": "STATION",
                            "stationId": stationId || parseInt(body?.data?.idx, 10),
                        },
                        "categoryIndex": AirQuality.CategoryIndex(body?.data?.aqi, "WAQI_InstantCast"),
                        "index": parseInt(body?.data?.aqi, 10),
                        //"previousDayComparison": "UNKNOWN",
                        "primaryPollutant": this.#Configs.Pollutants[body?.data?.dominentpol] || "NOT_AVAILABLE",
                        "scale": "EPA_NowCast"
                    };
                    airQuality.isSignificant = airQuality.categoryIndex >= 3;
                    break;
                case "error":
                case undefined:
                    throw JSON.stringify({ "status": body?.status, "reason": body?.data });
            };
        } catch (error) {
            logError(error);
        } finally {
            //log(`🚧 airQuality: ${JSON.stringify(airQuality, null, 2)}`, "");
            log(`✅ AQI2`, "");
            return airQuality;
        }    };
}

class ForecastNextHour {
	Name = "ForecastNextHour";
	Version = "v1.2.6";
	Author = "iRingo";

	static #Configs = {
		"Pollutants": {
			"co": "CO",
			"no": "NO",
			"no2": "NO2",
			"so2": "SO2",
			"o3": "OZONE",
			"nox": "NOX",
			"pm25": "PM2_5",
			"pm10": "PM10",
			"other": "NOT_AVAILABLE",
		},
		"WeatherCondition": {
			"晴朗": "CLEAR",
			"雨夹雪": "SLEET",
			"小雨": "DRIZZLE",
			"下雨": "RAIN",
			"中雨": "RAIN",
			"大雨": "HEAVY_RAIN",
			"小雪": "FLURRIES",
			"下雪": "SNOW",
			"中雪": "SNOW",
			"大雪": "HEAVY_SNOW",
			"冰雹": "HAIL",
		},
		"PrecipitationType": {
			"晴朗": "CLEAR",
			"雨夹雪": "SLEET",
			"rain": "RAIN",
			"雨": "RAIN",
			"snow": "SNOW",
			"雪": "SNOW",
			"冰雹": "HAIL",
		},
		"Precipitation": {
			"Level": {
				"INVALID": -1,
				"NO": 0,
				"LIGHT": 1,
				"MODERATE": 2,
				"HEAVY": 3,
				"STORM": 4,
			},
			"Range": {
				/**
				 * [降水强度 | 彩云天气 API]{@link https://docs.caiyunapp.com/weather-api/v2/v2.6/tables/precip.html}
				*/
				"radar": {
					"NO": [0, 0.031],
					"LIGHT": [0.031, 0.25],
					"MODERATE": [0.25, 0.35],
					"HEAVY": [0.35, 0.48],
					"STORM": [0.48, Number.MAX_VALUE],
				},
				"mmph": {
					"NO": [0, 0.08],
					"LIGHT": [0.08, 3.44],
					"MODERATE": [3.44, 11.33],
					"HEAVY": [11.33, 51.30],
					"STORM": [51.30, Number.MAX_VALUE],
				},
				/* 新标准不好用
				"mmph": {
					"NO": [0, 0.0606],
					"LIGHT": [0.0606, 0.8989],
					"MODERATE": [0.8989, 2.87],
					"HEAVY": [2.87, 12.8638],
					"STORM": [12.8638, Number.MAX_VALUE],
				},
				*/
			},
		},
	};

	static WeatherCondition(sentence) {
		log(`☑️ WeatherCondition, sentence: ${sentence}`, "");
		let weatherCondition = "CLEAR";
		Object.keys(this.#Configs.WeatherCondition).forEach(key => {
			if (sentence.includes(key)) weatherCondition = this.#Configs.WeatherCondition[key];
		});
		log(`✅ WeatherCondition: ${weatherCondition}`, "");
		return weatherCondition;
	};

	static PrecipitationType(sentence) {
		log(`☑️ PrecipitationType, sentence: ${sentence}`, "");
		let precipitationType = "CLEAR";
		Object.keys(this.#Configs.PrecipitationType).forEach(key => {
			if (sentence.includes(key)) precipitationType = this.#Configs.PrecipitationType[key];
		});
		log(`✅ PrecipitationType: ${precipitationType}`, "");
		return precipitationType;
	};

	static ConditionType(precipitationIntensity, precipitationType, units = "mmph") {
		// refer: https://docs.caiyunapp.com/weather-api/v2/v2.6/tables/precip.html
		//log(`☑️ ConditionType`, "");
		//log(`☑️ ConditionType, precipitationIntensity: ${precipitationIntensity}, precipitationChance: ${precipitationChance}, precipitationType: ${precipitationType}`, "");
		const Range = this.#Configs.Precipitation.Range[units];
		let condition = "CLEAR";
		if (precipitationIntensity >= Range.NO[0] && precipitationIntensity <= 0.001) condition = "CLEAR";
		else if (precipitationIntensity > 0.001 && precipitationIntensity <= Range.NO[1]) {
			switch (precipitationType) {
				case "RAIN":
					condition = "POSSIBLE_DRIZZLE";
					break;
				case "SNOW":
					condition = "POSSIBLE_FLURRIES";
					break;
				default:
					condition = `POSSIBLE_${precipitationType}`;
					break;
			}		} else if (precipitationIntensity > Range.LIGHT[0] && precipitationIntensity <= Range.LIGHT[1]) {
			switch (precipitationType) {
				case "RAIN":
					condition = "DRIZZLE";
					break;
				case "SNOW":
					condition = "FLURRIES";
					break;
				default:
					condition = precipitationType;
					break;
			}		} else if (precipitationIntensity > Range.MODERATE[0] && precipitationIntensity <= Range.MODERATE[1]) {
			switch (precipitationType) {
				case "RAIN":
					condition = "RAIN";
					break;
				case "SNOW":
					condition = "SNOW";
					break;
				default:
					condition = precipitationType;
					break;
			}		} else if (precipitationIntensity > Range.HEAVY[0]) {
			switch (precipitationType) {
				case "RAIN":
					condition = "HEAVY_RAIN";
					break;
				case "SNOW":
					condition = "HEAVY_SNOW";
					break;
				default:
					condition = precipitationType;
					break;
			}		}		//log(`✅ #ConditionType: ${condition}`, "");
		return condition;
	};

	static Minute(minutes = [], description = "", units = "mmph") {
		log(`☑️ Minute`, "");
		const PrecipitationType = this.PrecipitationType(description);
		minutes = minutes.map(minute => {
			//minute.precipitationIntensity = Math.round(minute.precipitationIntensity * 1000000) / 1000000; // 六位小数
			minute.condition = this.ConditionType(minute.precipitationIntensity, PrecipitationType, units);
			minute.perceivedPrecipitationIntensity = this.ConvertPrecipitationIntensity(minute.precipitationIntensity, minute.condition, units);
			if (minute.perceivedPrecipitationIntensity >= 0.001) minute.precipitationType = PrecipitationType;
			else minute.precipitationType = "CLEAR";
			return minute;
		});
		log(`✅ Minute`, "");
		return minutes;
	};

	static Summary(minutes = []) {
		log(`☑️ Summary`, "");
		const Summaries = [];
		const Summary = {
			"condition": "CLEAR",
			"precipitationChance": 0,
			"startTime": 0,
			"precipitationIntensity": 0
		};
		const Length = Math.min(71, minutes.length);
		for (let i = 0; i < Length; i++) {
			const minute = minutes[i];
			const previousMinute = minutes[i - 1];
			let maxPrecipitationIntensity = Math.max(minute?.precipitationIntensity ?? 0, previousMinute?.precipitationIntensity ?? 0);
			let maxPrecipitationChance = Math.max(minute?.precipitationChance ?? 0, previousMinute?.precipitationChance ?? 0);
			switch (i) {
				case 0:
					Summary.startTime = minute.startTime;
					if (minute?.precipitationIntensity > 0) {
						Summary.condition = minute.precipitationType;
						Summary.precipitationChance = maxPrecipitationChance;
						Summary.precipitationIntensity = maxPrecipitationIntensity;					}					break;
				default:
					if (minute?.precipitationType !== previousMinute?.precipitationType) {
						Summary.endTime = minute.startTime;
						switch (Summary.condition) {
							case "CLEAR":
								break;
							default:
								Summary.precipitationChance = maxPrecipitationChance;
								Summary.precipitationIntensity = maxPrecipitationIntensity;
								break;
						}						Summaries.push({ ...Summary });
						// reset
						Summary.startTime = minute.startTime;
						switch (Summary.condition) {
							case "CLEAR":
								Summary.condition = minute.precipitationType;
								Summary.precipitationChance = minute.precipitationChance;
								Summary.precipitationIntensity = minute.precipitationIntensity;
								break;
							default:
								Summary.condition = "CLEAR";
								Summary.precipitationChance = 0;
								Summary.precipitationIntensity = 0;
								break;
						}						maxPrecipitationChance = 0;
						maxPrecipitationIntensity = 0;
					}					break;
				case Length - 1:
					Summary.endTime = 0;// ⚠️空值必须写零！
					switch (Summary.condition) {
						case "CLEAR":
							break;
						default:
							Summary.precipitationChance = maxPrecipitationChance;
							Summary.precipitationIntensity = maxPrecipitationIntensity;
							break;
					}					Summaries.push({ ...Summary });
					break;
			}		}		log(`✅ Summary`, "");
		return Summaries;
	};

	static Condition(minutes = []) {
		log(`☑️ Condition`, "");
		const Conditions = [];
		const Condition = {
			"beginCondition": "CLEAR",
			"endCondition": "CLEAR",
			"forecastToken": "CLEAR",
			"parameters": [],
			"startTime": 0
		};
		const Length = Math.min(71, minutes.length);
		for (let i = 0; i < Length; i++) {
			const minute = minutes[i];
			const previousMinute = minutes[i - 1];
			//log(`⚠️ ${i}, before, minute: ${JSON.stringify(minute, null, 2)}\nCondition: ${JSON.stringify(Condition, null, 2)}`, "");
			switch (i) {
				case 0:
					//log(`⚠️ ${i}, before, minute: ${JSON.stringify(minute, null, 2)}\nCondition: ${JSON.stringify(Condition, null, 2)}`, "");
					Condition.beginCondition = minute.condition;
					Condition.endCondition = minute.condition;
					Condition.startTime = minute.startTime;
					switch (minute.precipitationType) {
						case "CLEAR": //✅
							Condition.forecastToken = "CLEAR";
							break;
						default: //✅
							Condition.forecastToken = "CONSTANT";
							break;
					}					Condition.parameters = [];
					//log(`⚠️ ${i}, after, minute: ${JSON.stringify(minute, null, 2)}\nCondition: ${JSON.stringify(Condition, null, 2)}`, "");
					break;
				default:
					switch (minute?.precipitationType) {
						case previousMinute?.precipitationType: // ✅与前次相同
							switch (minute?.condition) {
								case previousMinute?.condition: // ✅与前次相同
									break;
								default: // ✅与前次不同
									switch (Condition.forecastToken) {
										case "CONSTANT":
											Condition.endTime = minute.startTime; // ✅更新结束时间
											switch (Condition.beginCondition) {
												case Condition.endCondition: // ✅与begin相同
													Condition.parameters = [];
													Conditions.push({ ...Condition });
													break;
												default: // ✅与begin不同
													Condition.endCondition = previousMinute.condition;
													Condition.parameters = [{ "date": Condition.endTime, "type": "FIRST_AT" }];
													Conditions.push({ ...Condition });
													// ✅CONSTANT
													Condition.beginCondition = minute.condition;
													break;
											}											Condition.endCondition = minute.condition;
											Condition.startTime = Condition.endTime; // ✅更新开始时间
											Condition.parameters = [];
											break;
									}									break;
							}							break;
						default: // 与前次不同
							switch (Condition.forecastToken) {
								case "CLEAR": // ✅当前RAIN
									// ✅START
									Condition.beginCondition = minute.condition;
									Condition.endCondition = minute.condition;
									Condition.forecastToken = "START"; // ✅不推送，可能变为START_STOP
									Condition.endTime = minute.startTime; // ✅更新结束时间
									Condition.parameters = [{ "date": Condition.endTime, "type": "FIRST_AT" }];
									break;
								case "CONSTANT": // ✅当前CLEAR
									Conditions.length = 0; // ✅清空
									// ✅STOP
									Condition.beginCondition = minutes[0].condition; // ✅更新结束条件
									Condition.endCondition = previousMinute.condition; // ✅更新结束条件
									Condition.forecastToken = "STOP"; // ✅不推送，可能变为STOP_START
									Condition.endTime = minute.startTime; // ✅更新结束时间
									Condition.parameters = [{ "date": Condition.endTime, "type": "FIRST_AT" }];
									break;
								case "START": // ✅当前CLEAR
									// ✅START_STOP
									Condition.endCondition = previousMinute.condition; // ✅更新结束条件
									Condition.forecastToken = "START_STOP";
									Condition.parameters.push({ "date": minute.startTime, "type": "SECOND_AT" });
									Conditions.push({ ...Condition });
									// ✅STOP
									Condition.beginCondition = previousMinute.condition;
									Condition.endCondition = previousMinute.condition;
									Condition.forecastToken = "STOP"; // ✅不推送，可能变为STOP_START
									Condition.startTime = Condition.endTime;
									Condition.endTime = minute.startTime; // ✅更新结束时间
									Condition.parameters = [{ "date": Condition.endTime, "type": "FIRST_AT" }];
									break;
								case "STOP": // ✅当前RAIN
									// ✅STOP_START
									Condition.forecastToken = "STOP_START";
									Condition.parameters.push({ "date": minute.startTime, "type": "SECOND_AT" });
									Conditions.push({ ...Condition });
									// ✅START
									Condition.beginCondition = minute.condition;
									Condition.endCondition = minute.condition;
									Condition.forecastToken = "START"; // ✅不推送，可能变为START_STOP
									Condition.startTime = Condition.endTime;
									Condition.endTime = minute.startTime; // ✅更新结束时间
									Condition.parameters = [{ "date": Condition.endTime, "type": "FIRST_AT" }];
									break;
								case "START_STOP": // ✅当前RAIN
									log(`⚠️ START_STOP\nminute: ${JSON.stringify(minute, null, 2)}\nCondition: ${JSON.stringify(Condition, null, 2)}`, "");
									break;
								case "STOP_START": // ✅当前CLEAR
									log(`⚠️ STOP_START\nminute: ${JSON.stringify(minute, null, 2)}\nCondition: ${JSON.stringify(Condition, null, 2)}`, "");
									break;
							}							break;
					}					break;
				case Length - 1:
					switch (Condition.forecastToken) {
						case "CLEAR": // ✅当前CLEAR
							// ✅确定CLEAR
							Condition.beginCondition = "CLEAR";
							Condition.endCondition = "CLEAR";
							Condition.forecastToken = "CLEAR";
							Condition.endTime = 0; // ⚠️空值必须写零！
							Condition.parameters = [];
							Conditions.push({ ...Condition });
							break;
						case "CONSTANT": // ✅当前RAIN
							// ✅确定CONSTANT
							Condition.endCondition = minute.condition;
							Condition.endTime = 0; // ⚠️空值必须写零！
							Condition.parameters = [];
							Conditions.push({ ...Condition });
							break;
						case "START": // ✅当前RAIN
							// ✅确定START
							Conditions.push({ ...Condition });
							// ✅补充CONSTANT
							Condition.endCondition = previousMinute.condition;
							Condition.forecastToken = "CONSTANT";
							Condition.startTime = Condition.endTime;
							Condition.endTime = 0; // ⚠️空值必须写零！
							Condition.parameters = [];
							Conditions.push({ ...Condition });
							break;
						case "STOP": // ✅当前CLEAR
							// ✅确定STOP
							Conditions.push({ ...Condition });
							// ✅补充CLEAR
							Condition.beginCondition = "CLEAR";
							Condition.endCondition = "CLEAR";
							Condition.forecastToken = "CLEAR";
							Condition.startTime = Condition.endTime;
							Condition.endTime = 0;// ⚠️空值必须写零！
							Condition.parameters = [];
							Conditions.push({ ...Condition });
							break;
						case "START_STOP": // ✅当前CLEAR
							log(`⚠️ START_STOP\nminute: ${JSON.stringify(minute, null, 2)}\nCondition: ${JSON.stringify(Condition, null, 2)}`);
							break;
						case "STOP_START": // ✅当前RAIN
							log(`⚠️ STOP_START\nminute: ${JSON.stringify(minute, null, 2)}\nCondition: ${JSON.stringify(Condition, null, 2)}`);
							break;
					}					break;
			}			//log(`⚠️ ${i}, after, minute: ${JSON.stringify(minute, null, 2)}\nCondition: ${JSON.stringify(Condition, null, 2)}`, "");
		}		log(`✅ Condition`, "");
		return Conditions;
	};

	static ConvertPrecipitationIntensity(precipitationIntensity, condition, units = "mmph") {
		//log(`☑️ ConvertPrecipitationIntensity`, "");
		let perceivedPrecipitationIntensity = 0;
		const Range = this.#Configs.Precipitation.Range[units];
		let level = 0;
		let range = [];
		switch (condition) {
			case "CLEAR":
				level = 0;
				range = [Range.NO[0], 0.001];
				break;
			case "POSSIBLE_DRIZZLE":
			case "POSSIBLE_FLURRIES":
				level = 0;
				range = [0.001, Range.NO[1]];
				break;
			case "DRIZZLE":
			case "FLURRIES":
				level = 0;
				range = Range.LIGHT;
				break;
			case "RAIN":
			case "SNOW":
				level = 1;
				range = Range.MODERATE;
				break;
			case "HEAVY_RAIN":
			case "HEAVY_SNOW":
				level = 2;
				range = Range.HEAVY;
				break;
		}		perceivedPrecipitationIntensity = level + (precipitationIntensity - range[0]) / (range[1] - range[0]);
		perceivedPrecipitationIntensity = Math.min(3, perceivedPrecipitationIntensity);
		//log(`✅ ConvertPrecipitationIntensity: ${perceivedPrecipitationIntensity}`, "");
		return perceivedPrecipitationIntensity;
	};
}

class ColorfulClouds {
    constructor(options) {
        this.Name = "ColorfulClouds";
        this.Version = "2.3.2";
        log(`\n🟧 ${this.Name} v${this.Version}\n`, "");
        this.url = new URL($request.url);
        this.header = { "Content-Type": "application/json" };
        const Parameters = parseWeatherKitURL(this.url);
        Object.assign(this, Parameters, options);
    };

    #Config = {
        "Pollutants": {
            "co": "CO",
            "no": "NO",
            "no2": "NO2",
            "so2": "SO2",
            "o3": "OZONE",
            "nox": "NOX",
            "pm25": "PM2_5",
            "pm10": "PM10",
            "other": "NOT_AVAILABLE"
        },
    };

    async RealTime(token = this.token) {
        log(`☑️ RealTime`, "");
        const request = {
            "url": `https://api.caiyunapp.com/v2.6/${token}/${this.longitude},${this.latitude}/realtime`,
            "header": this.header,
        };
        let airQuality;
        try {
            const body = await fetch(request).then(response => JSON.parse(response?.body ?? "{}"));
            const timeStamp = Math.round(Date.now() / 1000);
            switch (body?.status) {
                case "ok":
                    switch (body?.result?.realtime?.status) {
                        case "ok":
                            airQuality = {
                                "metadata": {
                                    "attributionUrl": "https://www.caiyunapp.com/h5",
                                    "expireTime": timeStamp + 60 * 60,
                                    "language": `${this.language}-${this.country}`,
                                    "latitude": body?.location?.[0],
                                    "longitude": body?.location?.[1],
                                    "providerLogo": providerNameToLogo("彩云天气", this.version),
                                    "providerName": "彩云天气",
                                    "readTime": timeStamp,
                                    "reportedTime": body?.server_time,
                                    "temporarilyUnavailable": false,
                                    "sourceType": "STATION",
                                },
                                "categoryIndex": AirQuality.CategoryIndex(body?.result?.realtime?.air_quality?.aqi.chn, "HJ_633"),
                                "index": parseInt(body?.result?.realtime?.air_quality?.aqi.chn, 10),
                                "pollutants": this.#CreatePollutants(body?.result?.realtime?.air_quality),
                                "previousDayComparison": "UNKNOWN",
                                "primaryPollutant": "NOT_AVAILABLE",
                                "scale": "HJ6332012"
                            };
                            break;
                        case "error":
                        case undefined:
                            throw JSON.stringify({ "status": body?.result?.realtime?.status, "reason": body?.result?.realtime });
                    };
                    break;
                case "error":
                case "failed":
                case undefined:
                    throw JSON.stringify({ "status": body?.status, "reason": body?.error });
            };
        } catch (error) {
            this.logErr(error);
        } finally {
            //log(`🚧 RealTime airQuality: ${JSON.stringify(airQuality, null, 2)}`, "");
            log(`✅ RealTime`, "");
            return airQuality;
        }    };

    async Minutely(token = this.token) {
        log(`☑️ Minutely`, "");
        const request = {
            "url": `https://api.caiyunapp.com/v2.6/${token}/${this.longitude},${this.latitude}/minutely?unit=metric:v2`,
            "header": this.header,
        };
        let forecastNextHour;
        try {
            const body = await fetch(request).then(response => JSON.parse(response?.body ?? "{}"));
            const timeStamp = Math.round(Date.now() / 1000);
            switch (body?.status) {
                case "ok":
                    switch (body?.result?.minutely?.status) {
                        case "ok":
                            body.result.minutely.probability = body.result.minutely.probability.map(probability => Math.round(probability * 100));
                            let minuteStemp = new Date(body?.server_time * 1000).setSeconds(0, 0);
                            minuteStemp = minuteStemp.valueOf() / 1000 - 60;
                            forecastNextHour = {
                                "metadata": {
                                    "attributionUrl": "https://www.caiyunapp.com/h5",
                                    "expireTime": timeStamp + 60 * 60,
                                    "language": `${this.language}-${this.country}`, // body?.lang,
                                    "latitude": body?.location?.[0],
                                    "longitude": body?.location?.[1],
                                    "providerLogo": providerNameToLogo("彩云天气", this.version),
                                    "providerName": "彩云天气",
                                    "readTime": timeStamp,
                                    "reportedTime": body?.server_time,
                                    "temporarilyUnavailable": false,
                                    "sourceType": "MODELED",
                                },
                                "condition": [],
                                "forecastEnd": 0,
                                "forecastStart": minuteStemp,
                                "minutes": body?.result?.minutely?.precipitation_2h?.map((precipitationIntensity, index) => {
                                    const minute = {
                                        "perceivedPrecipitationIntensity": 0,
                                        "precipitationChance": 0,
                                        "precipitationIntensity": precipitationIntensity,
                                        "startTime": minuteStemp + 60 * index,
                                    };
                                    if (index < 30) minute.precipitationChance = body?.result?.minutely?.probability?.[0];
                                    else if (index < 60) minute.precipitationChance = body?.result?.minutely?.probability?.[1];
                                    else if (index < 90) minute.precipitationChance = body?.result?.minutely?.probability?.[2];
                                    else minute.precipitationChance = body?.result?.minutely?.probability?.[3];
                                    return minute;
                                }),
                                "summary": []
                            };
                            forecastNextHour.minutes.length = Math.min(85, forecastNextHour.minutes.length);
                            forecastNextHour.forecastEnd = minuteStemp + 60 * forecastNextHour.minutes.length;
                            forecastNextHour.minutes = ForecastNextHour.Minute(forecastNextHour.minutes, body?.result?.minutely?.description, "mmph");
                            forecastNextHour.summary = ForecastNextHour.Summary(forecastNextHour.minutes);
                            forecastNextHour.condition = ForecastNextHour.Condition(forecastNextHour.minutes);
                            break;
                        case "error":
                        case "failed":
                        case undefined:
                            throw JSON.stringify({ "status": body?.result?.minutely?.status, "reason": body?.result?.minutely });
                    };
                    break;
                case "error":
                case "failed":
                case undefined:
                    throw JSON.stringify({ "status": body?.status, "reason": body?.error });
            };
        } catch (error) {
            logError(error);
        } finally {
            //log(`🚧 forecastNextHour: ${JSON.stringify(forecastNextHour, null, 2)}`, "");
            log(`✅ Minutely`, "");
            return forecastNextHour;
        }    };

    #CreatePollutants(pollutantsObj = {}) {
        console.log(`☑️ CreatePollutants`, "");
        let pollutants = [];
        for (const [key, value] of Object.entries(pollutantsObj)) {
            switch (key) {
                case "co":
                    pollutants.push({
                        "amount": value ?? -1,
                        "pollutantType": this.#Config.Pollutants[key],
                        "units": "MILLIGRAMS_PER_CUBIC_METER",
                    });
                    break;
                case "no":
                case "no2":
                case "so2":
                case "o3":
                case "nox":
                case "pm25":
                case "pm10":
                    pollutants.push({
                        "amount": value ?? -1,
                        "pollutantType": this.#Config.Pollutants[key],
                        "units": "MICROGRAMS_PER_CUBIC_METER",
                    });
                    break;
            }        }        //console.log(`🚧 CreatePollutants, pollutants: ${JSON.stringify(pollutants, null, 2)}`, "");
        console.log(`✅ CreatePollutants`, "");
        return pollutants;
    };
}

class QWeather {
    constructor(options) {
        this.Name = "QWeather";
        this.Version = "2.0.2";
        log(`\n🟧 ${this.Name} v${this.Version}\n`, "");
        this.url = new URL($request.url);
        this.host = "devapi.qweather.com";
        this.header = { "Content-Type": "application/json" };
        const Parameters = parseWeatherKitURL(this.url);
        Object.assign(this, Parameters, options);
    };

    #Config = {
        "Pollutants": {
            "co": "CO",
            "no": "NO",
            "no2": "NO2",
            "so2": "SO2",
            "o3": "OZONE",
            "nox": "NOX",
            "pm25": "PM2_5",
            "pm2p5": "PM2_5",
            "pm10": "PM10",
            "other": "NOT_AVAILABLE",
            "na": "NOT_AVAILABLE"
        },
    };

    async AirNow(token = this.token) {
        log(`☑️ AirNow`, "");
        const request = {
            "url": `https://${this.host}/v7/air/now?location=${this.longitude},${this.latitude}&key=${token}`,
            "header": this.header,
        };
        let airQuality;
        try {
            const body = await fetch(request).then(response => JSON.parse(response?.body ?? "{}"));
            const timeStamp = Math.round(Date.now() / 1000);
            switch (body?.code) {
                case "200":
                    airQuality = {
                        "metadata": {
                            "attributionUrl": body?.fxLink,
                            "expireTime": timeStamp + 60 * 60,
                            "language": `${this.language}-${this.country}`,
                            "latitude": this.latitude,
                            "longitude": this.longitude,
                            "providerLogo": providerNameToLogo("和风天气", this.version),
                            "providerName": "和风天气",
                            "readTime": timeStamp,
                            "reportedTime": Math.round(new Date(body?.now?.pubTime).valueOf() / 1000),
                            "temporarilyUnavailable": false,
                            "sourceType": "STATION",
                        },
                        "categoryIndex": parseInt(body?.now?.level, 10),
                        "index": parseInt(body?.now?.aqi, 10),
                        "pollutants": this.#CreatePollutants(body?.now),
                        "previousDayComparison": "UNKNOWN",
                        "primaryPollutant": this.#Config.Pollutants[body?.now?.primary] || "NOT_AVAILABLE",
                        "scale": "HJ6332012"
                    };
                    if (body?.refer?.sources?.[0]) airQuality.metadata.providerName += `\n数据源: ${body?.refer?.sources?.[0]}`;
                    break;
                case "204":
                case "400":
                case "401":
                case "402":
                case "403":
                case "404":
                case "429":
                case "500":
                case undefined:
                    throw JSON.stringify({ "status": body?.status, "reason": body?.error });
            };
        } catch (error) {
            logError(error);
        } finally {
            //log(`🚧 AirNow airQuality: ${JSON.stringify(airQuality, null, 2)}`, "");
            log(`✅ AirNow`, "");
            return airQuality;
        }    };

    async Minutely(token = this.token) {
        log(`☑️ Minutely, host: ${this.host}`, "");
        const request = {
            "url": `https://${this.host}/v7/minutely/5m?location=${this.longitude},${this.latitude}&key=${token}`,
            "header": this.header,
        };
        let forecastNextHour;
        try {
            const body = await fetch(request).then(response => JSON.parse(response?.body ?? "{}"));
            const timeStamp = Math.round(Date.now() / 1000);
            switch (body?.code) {
                case "200":
                    let minuteStemp = new Date(body?.updateTime).setSeconds(0, 0);
                    minuteStemp = minuteStemp.valueOf() / 1000;
                    forecastNextHour = {
                        "metadata": {
                            "attributionUrl": body?.fxLink,
                            "expireTime": timeStamp + 60 * 60,
                            "language": `${this.language}-${this.country}`, // body?.lang,
                            "latitude": body?.location?.[0],
                            "longitude": body?.location?.[1],
                            "providerLogo": providerNameToLogo("和风天气", this.version),
                            "providerName": "和风天气",
                            "readTime": timeStamp,
                            "reportedTime": minuteStemp,
                            "temporarilyUnavailable": false,
                            "sourceType": "MODELED",
                        },
                        "condition": [],
                        "forecastEnd": 0,
                        "forecastStart": minuteStemp,
                        "minutes": body?.minutely?.map((minutely, index) => {
                            const minute = {
                                "perceivedPrecipitationIntensity": 0,
                                "precipitationChance": 0,
                                "precipitationIntensity": parseFloat(minutely.precip),
                                "startTime": new Date(minutely.fxTime) / 1000,
                            };
                            let minutes = [{ ...minute }, { ...minute }, { ...minute }, { ...minute }, { ...minute }];
                            minutes = minutes.map((minute, index) => {
                                minute.startTime = minute.startTime + index * 60;
                                return minute;
                            });
                            return minutes;
                        }).flat(Infinity),
                        "summary": []
                    };
                    forecastNextHour.minutes.length = Math.min(85, forecastNextHour.minutes.length);
                    forecastNextHour.forecastEnd = minuteStemp + 60 * forecastNextHour.minutes.length;
                    forecastNextHour.minutes = ForecastNextHour.Minute(forecastNextHour.minutes, body?.summary, "mmph");
                    forecastNextHour.summary = ForecastNextHour.Summary(forecastNextHour.minutes);
                    forecastNextHour.condition = ForecastNextHour.Condition(forecastNextHour.minutes);
                    break;
                case "204":
                case "400":
                case "401":
                case "402":
                case "403":
                case "404":
                case "429":
                case "500":
                case undefined:
                    throw JSON.stringify({ "status": body?.code, "reason": body?.error });
            };
        } catch (error) {
            logError(error);
        } finally {
            //log(`🚧 forecastNextHour: ${JSON.stringify(forecastNextHour, null, 2)}`, "");
            log(`✅ Minutely`, "");
            return forecastNextHour;
        }    };

    #CreatePollutants(pollutantsObj = {}) {
        log(`☑️ CreatePollutants`, "");
        let pollutants = [];
        for (const [key, value] of Object.entries(pollutantsObj)) {
            switch (key) {
                case "co":
                case "no":
                case "no2":
                case "so2":
                case "o3":
                case "nox":
                case "pm25":
                case "pm2p5":
                case "pm10":
                    pollutants.push({
                        "amount": value ?? -1,
                        "pollutantType": this.#Config.Pollutants[key],
                        "units": "MICROGRAMS_PER_CUBIC_METER",
                    });
                    break;
            }        }        //log(`🚧 CreatePollutants, pollutants: ${JSON.stringify(pollutants, null, 2)}`, "");
        log(`✅ CreatePollutants`, "");
        return pollutants;
    };
}

log("v1.7.2(4164)");

/***************** Processing *****************/
// 解构URL
const url = new URL($request.url);
log(`⚠ url: ${url.toJSON()}`, "");
// 获取连接参数
const METHOD = $request.method, HOST = url.hostname, PATH = url.pathname, PATHs = url.pathname.split("/").filter(Boolean);
log(`⚠ METHOD: ${METHOD}, HOST: ${HOST}, PATH: ${PATH}, PATHs: ${PATHs}`, "");
// 解析格式
const FORMAT = ($response.headers?.["Content-Type"] ?? $response.headers?.["content-type"])?.split(";")?.[0];
log(`⚠ FORMAT: ${FORMAT}`, "");
!(async () => {
	const { Settings, Caches, Configs } = setENV("iRingo", "WeatherKit", Database$1);
	log(`⚠ Settings.Switch: ${Settings?.Switch}`, "");
	switch (Settings.Switch) {
		case true:
		default:
			// 创建空数据
			let body = {};
			// 格式判断
			switch (FORMAT) {
				case undefined: // 视为无body
					break;
				case "application/x-www-form-urlencoded":
				case "text/plain":
				default:
					//log(`🚧 body: ${body}`, "");
					break;
				case "application/x-mpegURL":
				case "application/x-mpegurl":
				case "application/vnd.apple.mpegurl":
				case "audio/mpegurl":
					//body = M3U8.parse($response.body);
					//log(`🚧 body: ${JSON.stringify(body)}`, "");
					//$response.body = M3U8.stringify(body);
					break;
				case "text/xml":
				case "text/html":
				case "text/plist":
				case "application/xml":
				case "application/plist":
				case "application/x-plist":
					//body = XML.parse($response.body);
					//log(`🚧 body: ${JSON.stringify(body)}`, "");
					//$response.body = XML.stringify(body);
					break;
				case "text/vtt":
				case "application/vtt":
					//body = VTT.parse($response.body);
					//log(`🚧 body: ${JSON.stringify(body)}`, "");
					//$response.body = VTT.stringify(body);
					break;
				case "text/json":
				case "application/json":
					body = JSON.parse($response.body ?? "{}");
					switch (HOST) {
						case "weatherkit.apple.com":
							// 路径判断
							if (PATH.startsWith("/api/v1/availability/")) {
								log(`🚧 body: ${JSON.stringify(body)}`, "");
								body = Configs?.Availability?.v2;
							}							break;
					}					$response.body = JSON.stringify(body);
					break;
				case "application/vnd.apple.flatbuffer":
				case "application/protobuf":
				case "application/x-protobuf":
				case "application/vnd.google.protobuf":
				case "application/grpc":
				case "application/grpc+proto":
				case "application/octet-stream":
					//log(`🚧 $response: ${JSON.stringify($response, null, 2)}`, "");
					let rawBody = ($platform === "Quantumult X") ? new Uint8Array($response.bodyBytes ?? []) : $response.body ?? new Uint8Array();
					//log(`🚧 isBuffer? ${ArrayBuffer.isView(rawBody)}: ${JSON.stringify(rawBody)}`, "");
					switch (FORMAT) {
						case "application/vnd.apple.flatbuffer":
							// 解析FlatBuffer
							const ByteBuffer$1 = new ByteBuffer(rawBody);
							const Builder$1 = new Builder();
							// 主机判断
							switch (HOST) {
								case "weatherkit.apple.com":
									// 路径判断
									if (PATH.startsWith("/api/v2/weather/")) {
										body = WeatherKit2.decode(ByteBuffer$1, "all");
										if (url.searchParams.get("dataSets").includes("airQuality")) {
											log(`🚧 body.airQuality: ${JSON.stringify(body?.airQuality, null, 2)}`, "");
											// InjectAirQuality
											if (Settings?.AQI?.ReplaceProviders?.includes(body?.airQuality?.metadata?.providerName)) body = await InjectAirQuality(url, body, Settings);
											// PollutantUnitConverter
											switch (body?.airQuality?.metadata?.providerName?.split("\n")?.[0]) {
												case "和风天气":
												case "QWeather":
													if (body?.airQuality?.pollutants) body.airQuality.pollutants = body.airQuality.pollutants.map((pollutant) => {
														switch (pollutant.pollutantType) {
															case "CO": // Fix CO amount units
																pollutant.units = "MILLIGRAMS_PER_CUBIC_METER";
																break;
														}														return pollutant;
													});
													break;
											}											// ConvertAirQuality
											if (Settings?.AQI?.Local?.ReplaceScales.includes(body?.airQuality?.scale.split(".")?.[0])) body = ConvertAirQuality(body, Settings);
											// Fix Convert units that does not supported in Apple Weather
											if (body?.airQuality?.pollutants) body.airQuality.pollutants = AirQuality.FixUnits(body.airQuality.pollutants);
											// ProviderLogo
											if (body?.airQuality?.metadata?.providerName && !body?.airQuality?.metadata?.providerLogo) body.airQuality.metadata.providerLogo = providerNameToLogo(body?.airQuality?.metadata?.providerName, "v2");
										}										if (url.searchParams.get("dataSets").includes("currentWeather")) {
											if (body?.currentWeather?.metadata?.providerName && !body?.currentWeather?.metadata?.providerLogo) body.currentWeather.metadata.providerLogo = providerNameToLogo(body?.currentWeather?.metadata?.providerName, "v2");
											//log(`🚧 body.currentWeather: ${JSON.stringify(body?.currentWeather, null, 2)}`, "");
										}										if (url.searchParams.get("dataSets").includes("forecastNextHour")) {
											log(`🚧 body.forecastNextHour: ${JSON.stringify(body?.forecastNextHour, null, 2)}`, "");
											if (!body?.forecastNextHour) body = await InjectForecastNextHour(url, body, Settings);
											if (body?.forecastNextHour?.metadata?.providerName && !body?.forecastNextHour?.metadata?.providerLogo) body.forecastNextHour.metadata.providerLogo = providerNameToLogo(body?.forecastNextHour?.metadata?.providerName, "v2");
										}										if (url.searchParams.get("dataSets").includes("weatherAlerts")) {
											if (body?.weatherAlerts?.metadata?.providerName && !body?.weatherAlerts?.metadata?.providerLogo) body.weatherAlerts.metadata.providerLogo = providerNameToLogo(body?.weatherAlerts?.metadata?.providerName, "v2");
											log(`🚧 body.weatherAlerts: ${JSON.stringify(body?.weatherAlerts, null, 2)}`, "");
										}										if (url.searchParams.get("dataSets").includes("WeatherChange")) {
											if (body?.WeatherChanges?.metadata?.providerName && !body?.WeatherChanges?.metadata?.providerLogo) body.WeatherChanges.metadata.providerLogo = providerNameToLogo(body?.WeatherChanges?.metadata?.providerName, "v2");
											log(`🚧 body.WeatherChanges: ${JSON.stringify(body?.WeatherChanges, null, 2)}`, "");
										}										if (url.searchParams.get("dataSets").includes("trendComparison")) {
											if (body?.historicalComparisons?.metadata?.providerName && !body?.historicalComparisons?.metadata?.providerLogo) body.historicalComparisons.metadata.providerLogo = providerNameToLogo(body?.historicalComparisons?.metadata?.providerName, "v2");
											log(`🚧 body.historicalComparisons: ${JSON.stringify(body?.historicalComparisons, null, 2)}`, "");
										}										const WeatherData = WeatherKit2.encode(Builder$1, "all", body);
										Builder$1.finish(WeatherData);
										break;
									}									break;
							}							rawBody = Builder$1.asUint8Array(); // Of type `Uint8Array`.
							break;
					}					// 写入二进制数据
					$response.body = rawBody;
					break;
			}			break;
		case false:
			break;
	}})()
	.catch((e) => logError(e))
	.finally(() => done($response));

async function InjectAirQuality(url, body, Settings) {
	log(`☑️ InjectAirQuality`, "");
	let airQuality;
	switch (Settings?.AQI?.Provider) {
		case "WeatherKit":
			break;
		case "QWeather":
			const qWeather = new QWeather({ "url": url, "host": Settings?.API?.QWeather?.Host, "header": Settings?.API?.QWeather?.Header, "token": Settings?.API?.QWeather?.Token });
			airQuality = await qWeather.AirNow();
			break;
		case "ColorfulClouds":
			const colorfulClouds = new ColorfulClouds({ "url": url, "header": Settings?.API?.ColorfulClouds?.Header, "token": Settings?.API?.ColorfulClouds?.Token || "Y2FpeXVuX25vdGlmeQ==" });
			airQuality = await colorfulClouds.RealTime();
			break;
		case "WAQI":
		default:
			const Waqi = new WAQI({ "url": url, "header": Settings?.API?.WAQI?.Header, "token": Settings?.API?.WAQI?.Token });
			if (Settings?.API?.WAQI?.Token) {
				airQuality = await Waqi.AQI2();
			} else {
				const Nearest = await Waqi.Nearest();
				const Token = await Waqi.Token(Nearest?.metadata?.stationId);
				//Caches.WAQI.set(stationId, Token);
				airQuality = await Waqi.AQI(Nearest?.metadata?.stationId, Token);
				airQuality.metadata = { ...Nearest?.metadata, ...airQuality?.metadata };
				airQuality = { ...Nearest, ...airQuality };
			}
			break;
	}	if (airQuality?.metadata) {
		airQuality.metadata = { ...body?.airQuality?.metadata, ...airQuality.metadata };
		body.airQuality = { ...body?.airQuality, ...airQuality };
		if (!body?.airQuality?.pollutants) body.airQuality.pollutants = [];
		log(`🚧 body.airQuality: ${JSON.stringify(body?.airQuality, null, 2)}`, "");
	}	log(`✅ InjectAirQuality`, "");
	return body;
}
function ConvertAirQuality(body, Settings) {
	log(`☑️ ConvertAirQuality`, "");
	let airQuality;
	switch (Settings?.AQI?.Local?.Scale) {
		case "NONE":
			break;
		case 'HJ_633':
		case 'EPA_NowCast':
		case 'WAQI_InstantCast':
		default:
			airQuality = AirQuality.ConvertScale(body?.airQuality?.pollutants, Settings?.AQI?.Local?.Scale, Settings?.AQI?.Local?.ConvertUnits);
			break;
	}	if (airQuality.index) {
		body.airQuality = { ...body.airQuality, ...airQuality };
		body.airQuality.metadata.providerName += `\nConverted using ${Settings?.AQI?.Local?.Scale}`;
		log(`🚧 body.airQuality: ${JSON.stringify(body.airQuality, null, 2)}`, "");
	}	log(`✅ ConvertAirQuality`, "");
	return body;
}
async function InjectForecastNextHour(url, body, Settings) {
	log(`☑️ InjectForecastNextHour`, "");
	let forecastNextHour;
	switch (Settings?.NextHour?.Provider) {
		case "WeatherKit":
			break;
		case "QWeather":
			const qWeather = new QWeather({ "url": url, "host": Settings?.API?.QWeather?.Host, "header": Settings?.API?.QWeather?.Header, "token": Settings?.API?.QWeather?.Token });
			forecastNextHour = await qWeather.Minutely();
			break;
		case "ColorfulClouds":
		default:
			const colorfulClouds = new ColorfulClouds({ "url": url, "header": Settings?.API?.ColorfulClouds?.Header, "token": Settings?.API?.ColorfulClouds?.Token || "Y2FpeXVuX25vdGlmeQ==" });
			forecastNextHour = await colorfulClouds.Minutely();
			break;
	}	if (forecastNextHour?.metadata) {
		forecastNextHour.metadata = { ...body?.forecastNextHour?.metadata, ...forecastNextHour.metadata };
		body.forecastNextHour = { ...body?.forecastNextHour, ...forecastNextHour };
		log(`🚧 body.forecastNextHour: ${JSON.stringify(body?.forecastNextHour, null, 2)}`, "");
	}	log(`✅ InjectForecastNextHour`, "");
	return body;
}
