/* README: https://github.com/VirgilClyne/iRingo */
console.log(' iRingo: 📍 GeoServices β Response')
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
    switch ($platform) {
        case "Surge":
            if (object.policy) Lodash.set(object, "headers.X-Surge-Policy", object.policy);
            log("", `🚩 执行结束! 🕛 ${(new Date().getTime() / 1000 - $script.startTime)} 秒`, "");
            $done(object);
            break;
        case "Loon":
            if (object.policy) object.node = object.policy;
            log("", `🚩 执行结束! 🕛 ${(new Date() - $script.startTime) / 1000} 秒`, "");
            $done(object);
            break;
        case "Stash":
            if (object.policy) Lodash.set(object, "headers.X-Stash-Selected-Proxy", encodeURI(object.policy));
            log("", `🚩 执行结束! 🕛 ${(new Date() - $script.startTime) / 1000} 秒`, "");
            $done(object);
            break;
        case "Egern":
            log("", `🚩 执行结束!`, "");
            $done(object);
            break;
        case "Shadowrocket":
        default:
            log("", `🚩 执行结束!`, "");
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
            log("", `🚩 执行结束!`, "");
            $done(object);
            break;
        case "Node.js":
            log("", `🚩 执行结束!`, "");
            process.exit(1);
            break;
    }
}

const log = (...logs) => console.log(logs.join("\n"));

// refer: https://github.com/Peng-YM/QuanX/blob/master/Tools/XMLParser/xml-parser.js
// refer: https://goessner.net/download/prj/jsonxml/
class XML {
	static name = "XML";
	static version = "0.4.2";
	static about = () => console.log(`\n🟧 ${this.name} v${this.version}\n`);
	
	static #ATTRIBUTE_KEY = "@";
	static #CHILD_NODE_KEY = "#";
	static #UNESCAPE = {
		"&amp;": "&",
		"&lt;": "<",
		"&gt;": ">",
		"&apos;": "'",
		"&quot;": '"'
	};
	static #ESCAPE = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"'": "&apos;",
		'"': "&quot;"
	};

	static parse(xml = new String, reviver = "") {
		const UNESCAPE = this.#UNESCAPE;
		const ATTRIBUTE_KEY = this.#ATTRIBUTE_KEY;
		const CHILD_NODE_KEY = this.#CHILD_NODE_KEY;
		const DOM = toDOM(xml);
		let json = fromXML(DOM, reviver);
		return json;

		/***************** Fuctions *****************/
		function toDOM(text) {
			const list = text.replace(/^[ \t]+/gm, "")
				.split(/<([^!<>?](?:'[\S\s]*?'|"[\S\s]*?"|[^'"<>])*|!(?:--[\S\s]*?--|\[[^\[\]'"<>]+\[[\S\s]*?]]|DOCTYPE[^\[<>]*?\[[\S\s]*?]|(?:ENTITY[^"<>]*?"[\S\s]*?")?[\S\s]*?)|\?[\S\s]*?\?)>/);
			const length = list.length;

			// root element
			const root = { children: [] };
			let elem = root;

			// dom tree stack
			const stack = [];

			// parse
			for (let i = 0; i < length;) {
				// text node
				const str = list[i++];
				if (str) appendText(str);

				// child node
				const tag = list[i++];
				if (tag) parseNode(tag);
			}
			return root;
			/***************** Fuctions *****************/
			function parseNode(tag) {
				const tags = tag.split(" ");
				const name = tags.shift();
				const length = tags.length;
				let child = {};
				switch (name[0]) {
					case "/":
						// close tag
						const closed = tag.replace(/^\/|[\s\/].*$/g, "").toLowerCase();
						while (stack.length) {
							const tagName = elem?.name?.toLowerCase?.();
							elem = stack.pop();
							if (tagName === closed) break;
						}
						break;
					case "?":
						// XML declaration
						child.name = name;
						child.raw = tags.join(" ");
						appendChild(child);
						break;
					case "!":
						if (/!\[CDATA\[(.+)\]\]/.test(tag)) {
							// CDATA section
							child.name = "!CDATA";
							//child.raw = tag.slice(9, -2);
							child.raw = tag.match(/!\[CDATA\[(?<raw>.+)\]\]/)?.groups?.raw;
							//appendText(tag.slice(9, -2));
						} else if (/!--(.+)--/.test(tag)) {
							// Comment section
							child.name = "!--";
							child.raw = tag.match(/!--(?<raw>.+)--/)?.groups?.raw;
						} else {
							// Comment section
							child.name = name;
							child.raw = tags.join(" ");
						}						appendChild(child);
						break;
					default:
						child = openTag(tag);
						appendChild(child);
						switch ((tags?.[length - 1] ?? name).slice(-1)) {
							case "/":
								//child.hasChild = false; // emptyTag
								delete child.children; // emptyTag
								break;
							default:
								switch (name) {
									case "link":
										//child.hasChild = false; // emptyTag
										delete child.children; // emptyTag
										break;
									default:
										stack.push(elem); // openTag
										elem = child;
										break;
								}								break;
						}						break;
				}
				function openTag(tag) {
					const elem = { children: [] };
					tag = tag.replace(/\s*\/?$/, "");
					const pos = tag.search(/[\s='"\/]/);
					if (pos < 0) {
						elem.name = tag;
					} else {
						elem.name = tag.substr(0, pos);
						elem.tag = tag.substr(pos);
					}
					return elem;
				}			}
			function appendText(str) {
				//str = removeSpaces(str);
				str = removeBreakLine(str);
				//str = str?.trim?.();
				if (str) appendChild(unescapeXML(str));

				function removeBreakLine(str) {
					return str?.replace?.(/^(\r\n|\r|\n|\t)+|(\r\n|\r|\n|\t)+$/g, "");
				}
			}

			function appendChild(child) {
				elem.children.push(child);
			}
		}		/***************** Fuctions *****************/
		function fromPlist(elem, reviver) {
			let object;
			switch (typeof elem) {
				case "string":
				case "undefined":
					object = elem;
					break;
				case "object":
					//default:
					const name = elem.name;
					const children = elem.children;

					object = {};

					switch (name) {
						case "plist":
							let plist = fromPlist(children[0], reviver);
							object = Object.assign(object, plist);
							break;
						case "dict":
							let dict = children.map(child => fromPlist(child, reviver));
							dict = chunk(dict, 2);
							object = Object.fromEntries(dict);
							break;
						case "array":
							if (!Array.isArray(object)) object = [];
							object = children.map(child => fromPlist(child, reviver));
							break;
						case "key":
							const key = children[0];
							object = key;
							break;
						case "true":
						case "false":
							const boolean = name;
							object = JSON.parse(boolean);
							break;
						case "integer":
							const integer = children[0];
							//object = parseInt(integer);
							object = BigInt(integer);
							break;
						case "real":
							const real = children[0];
							//const digits = real.split(".")[1]?.length || 0;
							object = parseFloat(real);//.toFixed(digits);
							break;
						case "string":
							const string = children[0];
							object = string;
							break;
					}					if (reviver) object = reviver(name || "", object);
					break;
			}
			return object;

			/** 
			 * Chunk Array
			 * @author VirgilClyne
			 * @param {Array} source - source
			 * @param {Number} length - number
			 * @return {Array<*>} target
			 */
			function chunk(source, length) {
				var index = 0, target = [];
				while (index < source.length) target.push(source.slice(index, index += length));
				return target;
			}		}

		function fromXML(elem, reviver) {
			let object;
			switch (typeof elem) {
				case "string":
				case "undefined":
					object = elem;
					break;
				case "object":
					//default:
					const raw = elem.raw;
					const name = elem.name;
					const tag = elem.tag;
					const children = elem.children;

					if (raw) object = raw;
					else if (tag) object = parseAttribute(tag, reviver);
					else if (!children) object = { [name]: undefined };
					else object = {};

					if (name === "plist") object = Object.assign(object, fromPlist(children[0], reviver));
					else children?.forEach?.((child, i) => {
						if (typeof child === "string") addObject(object, CHILD_NODE_KEY, fromXML(child, reviver), undefined);
						else if (!child.tag && !child.children && !child.raw) addObject(object, child.name, fromXML(child, reviver), children?.[i - 1]?.name);
						else addObject(object, child.name, fromXML(child, reviver), undefined);
					});
					if (children && children.length === 0) addObject(object, CHILD_NODE_KEY, null, undefined);
					/*
					if (Object.keys(object).length === 0) {
						if (elem.name) object[elem.name] = (elem.hasChild === false) ? null : "";
						else object = (elem.hasChild === false) ? null : "";
					}
					*/

					//if (Object.keys(object).length === 0) addObject(object, elem.name, (elem.hasChild === false) ? null : "");
					//if (Object.keys(object).length === 0) object = (elem.hasChild === false) ? undefined : "";
					if (reviver) object = reviver(name || "", object);
					break;
			}
			return object;
			/***************** Fuctions *****************/
			function parseAttribute(tag, reviver) {
				if (!tag) return;
				const list = tag.split(/([^\s='"]+(?:\s*=\s*(?:'[\S\s]*?'|"[\S\s]*?"|[^\s'"]*))?)/);
				const length = list.length;
				let attributes, val;

				for (let i = 0; i < length; i++) {
					let str = removeSpaces(list[i]);
					//let str = removeBreakLine(list[i]);
					//let str = list[i]?.trim?.();
					if (!str) continue;

					if (!attributes) {
						attributes = {};
					}

					const pos = str.indexOf("=");
					if (pos < 0) {
						// bare attribute
						str = ATTRIBUTE_KEY + str;
						val = null;
					} else {
						// attribute key/value pair
						val = str.substr(pos + 1).replace(/^\s+/, "");
						str = ATTRIBUTE_KEY + str.substr(0, pos).replace(/\s+$/, "");

						// quote: foo="FOO" bar='BAR'
						const firstChar = val[0];
						const lastChar = val[val.length - 1];
						if (firstChar === lastChar && (firstChar === "'" || firstChar === '"')) {
							val = val.substr(1, val.length - 2);
						}

						val = unescapeXML(val);
					}
					if (reviver) val = reviver(str, val);

					addObject(attributes, str, val);
				}

				return attributes;

				function removeSpaces(str) {
					//return str && str.replace(/^\s+|\s+$/g, "");
					return str?.trim?.();
				}
			}

			function addObject(object, key, val, prevKey = key) {
				if (typeof val === "undefined") return;
				else {
					const prev = object[prevKey];
					//const curr = object[key];
					if (Array.isArray(prev)) prev.push(val);
					else if (prev) object[prevKey] = [prev, val];
					else object[key] = val;
				}
			}
		}

		function unescapeXML(str) {
			return str.replace(/(&(?:lt|gt|amp|apos|quot|#(?:\d{1,6}|x[0-9a-fA-F]{1,5}));)/g, function (str) {
				if (str[1] === "#") {
					const code = (str[2] === "x") ? parseInt(str.substr(3), 16) : parseInt(str.substr(2), 10);
					if (code > -1) return String.fromCharCode(code);
				}
				return UNESCAPE[str] || str;
			});
		}

	};

	static stringify(json = new Object, tab = "") {
		this.#ESCAPE;
		const ATTRIBUTE_KEY = this.#ATTRIBUTE_KEY;
		const CHILD_NODE_KEY = this.#CHILD_NODE_KEY;
		let XML = "";
		for (let elem in json) XML += toXml(json[elem], elem, "");
		XML = tab ? XML.replace(/\t/g, tab) : XML.replace(/\t|\n/g, "");
		return XML;
		/***************** Fuctions *****************/
		function toXml(Elem, Name, Ind) {
			let xml = "";
			switch (typeof Elem) {
				case "object":
					if (Array.isArray(Elem)) {
						xml = Elem.reduce(
							(prevXML, currXML) => prevXML += `${Ind}${toXml(currXML, Name, `${Ind}\t`)}\n`,
							""
						);
					} else {
						let attribute = "";
						let hasChild = false;
						for (let name in Elem) {
							if (name[0] === ATTRIBUTE_KEY) {
								attribute += ` ${name.substring(1)}=\"${Elem[name].toString()}\"`;
								delete Elem[name];
							} else if (Elem[name] === undefined) Name = name;
							else hasChild = true;
						}
						xml += `${Ind}<${Name}${attribute}${(hasChild || Name === "link") ? "" : "/"}>`;

						if (hasChild) {
							if (Name === "plist") xml += toPlist(Elem, Name, `${Ind}\t`);
							else {
								for (let name in Elem) {
									switch (name) {
										case CHILD_NODE_KEY:
											xml += Elem[name] ?? "";
											break;
										default:
											xml += toXml(Elem[name], name, `${Ind}\t`);
											break;
									}								}							}							xml += (xml.slice(-1) === "\n" ? Ind : "") + `</${Name}>`;
						}					}					break;
				case "string":
					switch (Name) {
						case "?xml":
							xml += `${Ind}<${Name} ${Elem.toString()}>`;
							break;
						case "?":
							xml += `${Ind}<${Name}${Elem.toString()}${Name}>`;
							break;
						case "!--":
							xml += `${Ind}<!--${Elem.toString()}-->`;
							break;
						case "!DOCTYPE":
							xml += `${Ind}<${Name} ${Elem.toString()}>`;
							break;
						case "!CDATA":
							xml += `${Ind}<![CDATA[${Elem.toString()}]]>`;
							break;
						case CHILD_NODE_KEY:
							xml += Elem;
							break;
						default:
							xml += `${Ind}<${Name}>${Elem.toString()}</${Name}>`;
							break;
					}					break;
				case "undefined":
					xml += Ind + `<${Name.toString()}/>`;
					break;
			}			return xml;
		}
		function toPlist(Elem, Name, Ind) {
			let plist = "";
			switch (typeof Elem) {
				case "boolean":
					plist = `${Ind}<${Elem.toString()}/>`;
					break;
				case "number":
					plist = `${Ind}<real>${Elem.toString()}</real>`;
					break;
				case "bigint":
					plist = `${Ind}<integer>${Elem.toString()}</integer>`;
					break;
				case "string":
					plist = `${Ind}<string>${Elem.toString()}</string>`;
					break;
				case "object":
					let array = "";
					if (Array.isArray(Elem)) {
						for (var i = 0, n = Elem.length; i < n; i++) array += `${Ind}${toPlist(Elem[i], Name, `${Ind}\t`)}`;
						plist = `${Ind}<array>${array}${Ind}</array>`;
					} else {
						let dict = "";
						Object.entries(Elem).forEach(([key, value]) => {
							dict += `${Ind}<key>${key}</key>`;
							dict += toPlist(value, key, Ind);
						});
						plist = `${Ind}<dict>${dict}${Ind}</dict>`;
					}					break;
			}
			return plist;
		}	};
}

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
var News = {
	Settings: Settings$5
};

var News$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Settings: Settings$5,
    default: News
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
	Region: "AUTO",
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
			"historicalComparisons",
			"weatherChanges",
			"forecastNextHour",
			"weatherAlerts",
			"weatherAlertNotifications",
			"news"
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
	"News": News$1,
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

/**
 * Get the type of a JSON value.
 * Distinguishes between array, null and object.
 */
function typeofJsonValue(value) {
    let t = typeof value;
    if (t == "object") {
        if (Array.isArray(value))
            return "array";
        if (value === null)
            return "null";
    }
    return t;
}
/**
 * Is this a JSON object (instead of an array or null)?
 */
function isJsonObject(value) {
    return value !== null && typeof value == "object" && !Array.isArray(value);
}

// lookup table from base64 character to byte
let encTable = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');
// lookup table from base64 character *code* to byte because lookup by number is fast
let decTable = [];
for (let i = 0; i < encTable.length; i++)
    decTable[encTable[i].charCodeAt(0)] = i;
// support base64url variants
decTable["-".charCodeAt(0)] = encTable.indexOf("+");
decTable["_".charCodeAt(0)] = encTable.indexOf("/");
/**
 * Decodes a base64 string to a byte array.
 *
 * - ignores white-space, including line breaks and tabs
 * - allows inner padding (can decode concatenated base64 strings)
 * - does not require padding
 * - understands base64url encoding:
 *   "-" instead of "+",
 *   "_" instead of "/",
 *   no padding
 */
function base64decode(base64Str) {
    // estimate byte size, not accounting for inner padding and whitespace
    let es = base64Str.length * 3 / 4;
    // if (es % 3 !== 0)
    // throw new Error('invalid base64 string');
    if (base64Str[base64Str.length - 2] == '=')
        es -= 2;
    else if (base64Str[base64Str.length - 1] == '=')
        es -= 1;
    let bytes = new Uint8Array(es), bytePos = 0, // position in byte array
    groupPos = 0, // position in base64 group
    b, // current byte
    p = 0 // previous byte
    ;
    for (let i = 0; i < base64Str.length; i++) {
        b = decTable[base64Str.charCodeAt(i)];
        if (b === undefined) {
            // noinspection FallThroughInSwitchStatementJS
            switch (base64Str[i]) {
                case '=':
                    groupPos = 0; // reset state when padding found
                case '\n':
                case '\r':
                case '\t':
                case ' ':
                    continue; // skip white-space, and padding
                default:
                    throw Error(`invalid base64 string.`);
            }
        }
        switch (groupPos) {
            case 0:
                p = b;
                groupPos = 1;
                break;
            case 1:
                bytes[bytePos++] = p << 2 | (b & 48) >> 4;
                p = b;
                groupPos = 2;
                break;
            case 2:
                bytes[bytePos++] = (p & 15) << 4 | (b & 60) >> 2;
                p = b;
                groupPos = 3;
                break;
            case 3:
                bytes[bytePos++] = (p & 3) << 6 | b;
                groupPos = 0;
                break;
        }
    }
    if (groupPos == 1)
        throw Error(`invalid base64 string.`);
    return bytes.subarray(0, bytePos);
}
/**
 * Encodes a byte array to a base64 string.
 * Adds padding at the end.
 * Does not insert newlines.
 */
function base64encode(bytes) {
    let base64 = '', groupPos = 0, // position in base64 group
    b, // current byte
    p = 0; // carry over from previous byte
    for (let i = 0; i < bytes.length; i++) {
        b = bytes[i];
        switch (groupPos) {
            case 0:
                base64 += encTable[b >> 2];
                p = (b & 3) << 4;
                groupPos = 1;
                break;
            case 1:
                base64 += encTable[p | b >> 4];
                p = (b & 15) << 2;
                groupPos = 2;
                break;
            case 2:
                base64 += encTable[p | b >> 6];
                base64 += encTable[b & 63];
                groupPos = 0;
                break;
        }
    }
    // padding required?
    if (groupPos) {
        base64 += encTable[p];
        base64 += '=';
        if (groupPos == 1)
            base64 += '=';
    }
    return base64;
}

/**
 * This handler implements the default behaviour for unknown fields.
 * When reading data, unknown fields are stored on the message, in a
 * symbol property.
 * When writing data, the symbol property is queried and unknown fields
 * are serialized into the output again.
 */
var UnknownFieldHandler;
(function (UnknownFieldHandler) {
    /**
     * The symbol used to store unknown fields for a message.
     * The property must conform to `UnknownFieldContainer`.
     */
    UnknownFieldHandler.symbol = Symbol.for("protobuf-ts/unknown");
    /**
     * Store an unknown field during binary read directly on the message.
     * This method is compatible with `BinaryReadOptions.readUnknownField`.
     */
    UnknownFieldHandler.onRead = (typeName, message, fieldNo, wireType, data) => {
        let container = is(message) ? message[UnknownFieldHandler.symbol] : message[UnknownFieldHandler.symbol] = [];
        container.push({ no: fieldNo, wireType, data });
    };
    /**
     * Write unknown fields stored for the message to the writer.
     * This method is compatible with `BinaryWriteOptions.writeUnknownFields`.
     */
    UnknownFieldHandler.onWrite = (typeName, message, writer) => {
        for (let { no, wireType, data } of UnknownFieldHandler.list(message))
            writer.tag(no, wireType).raw(data);
    };
    /**
     * List unknown fields stored for the message.
     * Note that there may be multiples fields with the same number.
     */
    UnknownFieldHandler.list = (message, fieldNo) => {
        if (is(message)) {
            let all = message[UnknownFieldHandler.symbol];
            return fieldNo ? all.filter(uf => uf.no == fieldNo) : all;
        }
        return [];
    };
    /**
     * Returns the last unknown field by field number.
     */
    UnknownFieldHandler.last = (message, fieldNo) => UnknownFieldHandler.list(message, fieldNo).slice(-1)[0];
    const is = (message) => message && Array.isArray(message[UnknownFieldHandler.symbol]);
})(UnknownFieldHandler || (UnknownFieldHandler = {}));
/**
 * Protobuf binary format wire types.
 *
 * A wire type provides just enough information to find the length of the
 * following value.
 *
 * See https://developers.google.com/protocol-buffers/docs/encoding#structure
 */
var WireType;
(function (WireType) {
    /**
     * Used for int32, int64, uint32, uint64, sint32, sint64, bool, enum
     */
    WireType[WireType["Varint"] = 0] = "Varint";
    /**
     * Used for fixed64, sfixed64, double.
     * Always 8 bytes with little-endian byte order.
     */
    WireType[WireType["Bit64"] = 1] = "Bit64";
    /**
     * Used for string, bytes, embedded messages, packed repeated fields
     *
     * Only repeated numeric types (types which use the varint, 32-bit,
     * or 64-bit wire types) can be packed. In proto3, such fields are
     * packed by default.
     */
    WireType[WireType["LengthDelimited"] = 2] = "LengthDelimited";
    /**
     * Used for groups
     * @deprecated
     */
    WireType[WireType["StartGroup"] = 3] = "StartGroup";
    /**
     * Used for groups
     * @deprecated
     */
    WireType[WireType["EndGroup"] = 4] = "EndGroup";
    /**
     * Used for fixed32, sfixed32, float.
     * Always 4 bytes with little-endian byte order.
     */
    WireType[WireType["Bit32"] = 5] = "Bit32";
})(WireType || (WireType = {}));

// Copyright 2008 Google Inc.  All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
// * Redistributions of source code must retain the above copyright
// notice, this list of conditions and the following disclaimer.
// * Redistributions in binary form must reproduce the above
// copyright notice, this list of conditions and the following disclaimer
// in the documentation and/or other materials provided with the
// distribution.
// * Neither the name of Google Inc. nor the names of its
// contributors may be used to endorse or promote products derived from
// this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// Code generated by the Protocol Buffer compiler is owned by the owner
// of the input file used when generating it.  This code is not
// standalone and requires a support library to be linked with it.  This
// support library is itself covered by the above license.
/**
 * Read a 64 bit varint as two JS numbers.
 *
 * Returns tuple:
 * [0]: low bits
 * [0]: high bits
 *
 * Copyright 2008 Google Inc.  All rights reserved.
 *
 * See https://github.com/protocolbuffers/protobuf/blob/8a71927d74a4ce34efe2d8769fda198f52d20d12/js/experimental/runtime/kernel/buffer_decoder.js#L175
 */
function varint64read() {
    let lowBits = 0;
    let highBits = 0;
    for (let shift = 0; shift < 28; shift += 7) {
        let b = this.buf[this.pos++];
        lowBits |= (b & 0x7F) << shift;
        if ((b & 0x80) == 0) {
            this.assertBounds();
            return [lowBits, highBits];
        }
    }
    let middleByte = this.buf[this.pos++];
    // last four bits of the first 32 bit number
    lowBits |= (middleByte & 0x0F) << 28;
    // 3 upper bits are part of the next 32 bit number
    highBits = (middleByte & 0x70) >> 4;
    if ((middleByte & 0x80) == 0) {
        this.assertBounds();
        return [lowBits, highBits];
    }
    for (let shift = 3; shift <= 31; shift += 7) {
        let b = this.buf[this.pos++];
        highBits |= (b & 0x7F) << shift;
        if ((b & 0x80) == 0) {
            this.assertBounds();
            return [lowBits, highBits];
        }
    }
    throw new Error('invalid varint');
}
/**
 * Write a 64 bit varint, given as two JS numbers, to the given bytes array.
 *
 * Copyright 2008 Google Inc.  All rights reserved.
 *
 * See https://github.com/protocolbuffers/protobuf/blob/8a71927d74a4ce34efe2d8769fda198f52d20d12/js/experimental/runtime/kernel/writer.js#L344
 */
function varint64write(lo, hi, bytes) {
    for (let i = 0; i < 28; i = i + 7) {
        const shift = lo >>> i;
        const hasNext = !((shift >>> 7) == 0 && hi == 0);
        const byte = (hasNext ? shift | 0x80 : shift) & 0xFF;
        bytes.push(byte);
        if (!hasNext) {
            return;
        }
    }
    const splitBits = ((lo >>> 28) & 0x0F) | ((hi & 0x07) << 4);
    const hasMoreBits = !((hi >> 3) == 0);
    bytes.push((hasMoreBits ? splitBits | 0x80 : splitBits) & 0xFF);
    if (!hasMoreBits) {
        return;
    }
    for (let i = 3; i < 31; i = i + 7) {
        const shift = hi >>> i;
        const hasNext = !((shift >>> 7) == 0);
        const byte = (hasNext ? shift | 0x80 : shift) & 0xFF;
        bytes.push(byte);
        if (!hasNext) {
            return;
        }
    }
    bytes.push((hi >>> 31) & 0x01);
}
// constants for binary math
const TWO_PWR_32_DBL$1 = (1 << 16) * (1 << 16);
/**
 * Parse decimal string of 64 bit integer value as two JS numbers.
 *
 * Returns tuple:
 * [0]: minus sign?
 * [1]: low bits
 * [2]: high bits
 *
 * Copyright 2008 Google Inc.
 */
function int64fromString(dec) {
    // Check for minus sign.
    let minus = dec[0] == '-';
    if (minus)
        dec = dec.slice(1);
    // Work 6 decimal digits at a time, acting like we're converting base 1e6
    // digits to binary. This is safe to do with floating point math because
    // Number.isSafeInteger(ALL_32_BITS * 1e6) == true.
    const base = 1e6;
    let lowBits = 0;
    let highBits = 0;
    function add1e6digit(begin, end) {
        // Note: Number('') is 0.
        const digit1e6 = Number(dec.slice(begin, end));
        highBits *= base;
        lowBits = lowBits * base + digit1e6;
        // Carry bits from lowBits to highBits
        if (lowBits >= TWO_PWR_32_DBL$1) {
            highBits = highBits + ((lowBits / TWO_PWR_32_DBL$1) | 0);
            lowBits = lowBits % TWO_PWR_32_DBL$1;
        }
    }
    add1e6digit(-24, -18);
    add1e6digit(-18, -12);
    add1e6digit(-12, -6);
    add1e6digit(-6);
    return [minus, lowBits, highBits];
}
/**
 * Format 64 bit integer value (as two JS numbers) to decimal string.
 *
 * Copyright 2008 Google Inc.
 */
function int64toString(bitsLow, bitsHigh) {
    // Skip the expensive conversion if the number is small enough to use the
    // built-in conversions.
    if ((bitsHigh >>> 0) <= 0x1FFFFF) {
        return '' + (TWO_PWR_32_DBL$1 * bitsHigh + (bitsLow >>> 0));
    }
    // What this code is doing is essentially converting the input number from
    // base-2 to base-1e7, which allows us to represent the 64-bit range with
    // only 3 (very large) digits. Those digits are then trivial to convert to
    // a base-10 string.
    // The magic numbers used here are -
    // 2^24 = 16777216 = (1,6777216) in base-1e7.
    // 2^48 = 281474976710656 = (2,8147497,6710656) in base-1e7.
    // Split 32:32 representation into 16:24:24 representation so our
    // intermediate digits don't overflow.
    let low = bitsLow & 0xFFFFFF;
    let mid = (((bitsLow >>> 24) | (bitsHigh << 8)) >>> 0) & 0xFFFFFF;
    let high = (bitsHigh >> 16) & 0xFFFF;
    // Assemble our three base-1e7 digits, ignoring carries. The maximum
    // value in a digit at this step is representable as a 48-bit integer, which
    // can be stored in a 64-bit floating point number.
    let digitA = low + (mid * 6777216) + (high * 6710656);
    let digitB = mid + (high * 8147497);
    let digitC = (high * 2);
    // Apply carries from A to B and from B to C.
    let base = 10000000;
    if (digitA >= base) {
        digitB += Math.floor(digitA / base);
        digitA %= base;
    }
    if (digitB >= base) {
        digitC += Math.floor(digitB / base);
        digitB %= base;
    }
    // Convert base-1e7 digits to base-10, with optional leading zeroes.
    function decimalFrom1e7(digit1e7, needLeadingZeros) {
        let partial = digit1e7 ? String(digit1e7) : '';
        if (needLeadingZeros) {
            return '0000000'.slice(partial.length) + partial;
        }
        return partial;
    }
    return decimalFrom1e7(digitC, /*needLeadingZeros=*/ 0) +
        decimalFrom1e7(digitB, /*needLeadingZeros=*/ digitC) +
        // If the final 1e7 digit didn't need leading zeros, we would have
        // returned via the trivial code path at the top.
        decimalFrom1e7(digitA, /*needLeadingZeros=*/ 1);
}
/**
 * Write a 32 bit varint, signed or unsigned. Same as `varint64write(0, value, bytes)`
 *
 * Copyright 2008 Google Inc.  All rights reserved.
 *
 * See https://github.com/protocolbuffers/protobuf/blob/1b18833f4f2a2f681f4e4a25cdf3b0a43115ec26/js/binary/encoder.js#L144
 */
function varint32write(value, bytes) {
    if (value >= 0) {
        // write value as varint 32
        while (value > 0x7f) {
            bytes.push((value & 0x7f) | 0x80);
            value = value >>> 7;
        }
        bytes.push(value);
    }
    else {
        for (let i = 0; i < 9; i++) {
            bytes.push(value & 127 | 128);
            value = value >> 7;
        }
        bytes.push(1);
    }
}
/**
 * Read an unsigned 32 bit varint.
 *
 * See https://github.com/protocolbuffers/protobuf/blob/8a71927d74a4ce34efe2d8769fda198f52d20d12/js/experimental/runtime/kernel/buffer_decoder.js#L220
 */
function varint32read() {
    let b = this.buf[this.pos++];
    let result = b & 0x7F;
    if ((b & 0x80) == 0) {
        this.assertBounds();
        return result;
    }
    b = this.buf[this.pos++];
    result |= (b & 0x7F) << 7;
    if ((b & 0x80) == 0) {
        this.assertBounds();
        return result;
    }
    b = this.buf[this.pos++];
    result |= (b & 0x7F) << 14;
    if ((b & 0x80) == 0) {
        this.assertBounds();
        return result;
    }
    b = this.buf[this.pos++];
    result |= (b & 0x7F) << 21;
    if ((b & 0x80) == 0) {
        this.assertBounds();
        return result;
    }
    // Extract only last 4 bits
    b = this.buf[this.pos++];
    result |= (b & 0x0F) << 28;
    for (let readBytes = 5; ((b & 0x80) !== 0) && readBytes < 10; readBytes++)
        b = this.buf[this.pos++];
    if ((b & 0x80) != 0)
        throw new Error('invalid varint');
    this.assertBounds();
    // Result can have 32 bits, convert it to unsigned
    return result >>> 0;
}

let BI;
function detectBi() {
    const dv = new DataView(new ArrayBuffer(8));
    const ok = globalThis.BigInt !== undefined
        && typeof dv.getBigInt64 === "function"
        && typeof dv.getBigUint64 === "function"
        && typeof dv.setBigInt64 === "function"
        && typeof dv.setBigUint64 === "function";
    BI = ok ? {
        MIN: BigInt("-9223372036854775808"),
        MAX: BigInt("9223372036854775807"),
        UMIN: BigInt("0"),
        UMAX: BigInt("18446744073709551615"),
        C: BigInt,
        V: dv,
    } : undefined;
}
detectBi();
function assertBi(bi) {
    if (!bi)
        throw new Error("BigInt unavailable, see https://github.com/timostamm/protobuf-ts/blob/v1.0.8/MANUAL.md#bigint-support");
}
// used to validate from(string) input (when bigint is unavailable)
const RE_DECIMAL_STR = /^-?[0-9]+$/;
// constants for binary math
const TWO_PWR_32_DBL = 0x100000000;
const HALF_2_PWR_32 = 0x080000000;
// base class for PbLong and PbULong provides shared code
class SharedPbLong {
    /**
     * Create a new instance with the given bits.
     */
    constructor(lo, hi) {
        this.lo = lo | 0;
        this.hi = hi | 0;
    }
    /**
     * Is this instance equal to 0?
     */
    isZero() {
        return this.lo == 0 && this.hi == 0;
    }
    /**
     * Convert to a native number.
     */
    toNumber() {
        let result = this.hi * TWO_PWR_32_DBL + (this.lo >>> 0);
        if (!Number.isSafeInteger(result))
            throw new Error("cannot convert to safe number");
        return result;
    }
}
/**
 * 64-bit unsigned integer as two 32-bit values.
 * Converts between `string`, `number` and `bigint` representations.
 */
class PbULong extends SharedPbLong {
    /**
     * Create instance from a `string`, `number` or `bigint`.
     */
    static from(value) {
        if (BI)
            // noinspection FallThroughInSwitchStatementJS
            switch (typeof value) {
                case "string":
                    if (value == "0")
                        return this.ZERO;
                    if (value == "")
                        throw new Error('string is no integer');
                    value = BI.C(value);
                case "number":
                    if (value === 0)
                        return this.ZERO;
                    value = BI.C(value);
                case "bigint":
                    if (!value)
                        return this.ZERO;
                    if (value < BI.UMIN)
                        throw new Error('signed value for ulong');
                    if (value > BI.UMAX)
                        throw new Error('ulong too large');
                    BI.V.setBigUint64(0, value, true);
                    return new PbULong(BI.V.getInt32(0, true), BI.V.getInt32(4, true));
            }
        else
            switch (typeof value) {
                case "string":
                    if (value == "0")
                        return this.ZERO;
                    value = value.trim();
                    if (!RE_DECIMAL_STR.test(value))
                        throw new Error('string is no integer');
                    let [minus, lo, hi] = int64fromString(value);
                    if (minus)
                        throw new Error('signed value for ulong');
                    return new PbULong(lo, hi);
                case "number":
                    if (value == 0)
                        return this.ZERO;
                    if (!Number.isSafeInteger(value))
                        throw new Error('number is no integer');
                    if (value < 0)
                        throw new Error('signed value for ulong');
                    return new PbULong(value, value / TWO_PWR_32_DBL);
            }
        throw new Error('unknown value ' + typeof value);
    }
    /**
     * Convert to decimal string.
     */
    toString() {
        return BI ? this.toBigInt().toString() : int64toString(this.lo, this.hi);
    }
    /**
     * Convert to native bigint.
     */
    toBigInt() {
        assertBi(BI);
        BI.V.setInt32(0, this.lo, true);
        BI.V.setInt32(4, this.hi, true);
        return BI.V.getBigUint64(0, true);
    }
}
/**
 * ulong 0 singleton.
 */
PbULong.ZERO = new PbULong(0, 0);
/**
 * 64-bit signed integer as two 32-bit values.
 * Converts between `string`, `number` and `bigint` representations.
 */
class PbLong extends SharedPbLong {
    /**
     * Create instance from a `string`, `number` or `bigint`.
     */
    static from(value) {
        if (BI)
            // noinspection FallThroughInSwitchStatementJS
            switch (typeof value) {
                case "string":
                    if (value == "0")
                        return this.ZERO;
                    if (value == "")
                        throw new Error('string is no integer');
                    value = BI.C(value);
                case "number":
                    if (value === 0)
                        return this.ZERO;
                    value = BI.C(value);
                case "bigint":
                    if (!value)
                        return this.ZERO;
                    if (value < BI.MIN)
                        throw new Error('signed long too small');
                    if (value > BI.MAX)
                        throw new Error('signed long too large');
                    BI.V.setBigInt64(0, value, true);
                    return new PbLong(BI.V.getInt32(0, true), BI.V.getInt32(4, true));
            }
        else
            switch (typeof value) {
                case "string":
                    if (value == "0")
                        return this.ZERO;
                    value = value.trim();
                    if (!RE_DECIMAL_STR.test(value))
                        throw new Error('string is no integer');
                    let [minus, lo, hi] = int64fromString(value);
                    if (minus) {
                        if (hi > HALF_2_PWR_32 || (hi == HALF_2_PWR_32 && lo != 0))
                            throw new Error('signed long too small');
                    }
                    else if (hi >= HALF_2_PWR_32)
                        throw new Error('signed long too large');
                    let pbl = new PbLong(lo, hi);
                    return minus ? pbl.negate() : pbl;
                case "number":
                    if (value == 0)
                        return this.ZERO;
                    if (!Number.isSafeInteger(value))
                        throw new Error('number is no integer');
                    return value > 0
                        ? new PbLong(value, value / TWO_PWR_32_DBL)
                        : new PbLong(-value, -value / TWO_PWR_32_DBL).negate();
            }
        throw new Error('unknown value ' + typeof value);
    }
    /**
     * Do we have a minus sign?
     */
    isNegative() {
        return (this.hi & HALF_2_PWR_32) !== 0;
    }
    /**
     * Negate two's complement.
     * Invert all the bits and add one to the result.
     */
    negate() {
        let hi = ~this.hi, lo = this.lo;
        if (lo)
            lo = ~lo + 1;
        else
            hi += 1;
        return new PbLong(lo, hi);
    }
    /**
     * Convert to decimal string.
     */
    toString() {
        if (BI)
            return this.toBigInt().toString();
        if (this.isNegative()) {
            let n = this.negate();
            return '-' + int64toString(n.lo, n.hi);
        }
        return int64toString(this.lo, this.hi);
    }
    /**
     * Convert to native bigint.
     */
    toBigInt() {
        assertBi(BI);
        BI.V.setInt32(0, this.lo, true);
        BI.V.setInt32(4, this.hi, true);
        return BI.V.getBigInt64(0, true);
    }
}
/**
 * long 0 singleton.
 */
PbLong.ZERO = new PbLong(0, 0);

const defaultsRead$1 = {
    readUnknownField: true,
    readerFactory: bytes => new BinaryReader(bytes),
};
/**
 * Make options for reading binary data form partial options.
 */
function binaryReadOptions(options) {
    return options ? Object.assign(Object.assign({}, defaultsRead$1), options) : defaultsRead$1;
}
class BinaryReader {
    constructor(buf, textDecoder) {
        this.varint64 = varint64read; // dirty cast for `this`
        /**
         * Read a `uint32` field, an unsigned 32 bit varint.
         */
        this.uint32 = varint32read; // dirty cast for `this` and access to protected `buf`
        this.buf = buf;
        this.len = buf.length;
        this.pos = 0;
        this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
        this.textDecoder = textDecoder !== null && textDecoder !== void 0 ? textDecoder : new TextDecoder("utf-8", {
            fatal: true,
            ignoreBOM: true,
        });
    }
    /**
     * Reads a tag - field number and wire type.
     */
    tag() {
        let tag = this.uint32(), fieldNo = tag >>> 3, wireType = tag & 7;
        if (fieldNo <= 0 || wireType < 0 || wireType > 5)
            throw new Error("illegal tag: field no " + fieldNo + " wire type " + wireType);
        return [fieldNo, wireType];
    }
    /**
     * Skip one element on the wire and return the skipped data.
     * Supports WireType.StartGroup since v2.0.0-alpha.23.
     */
    skip(wireType) {
        let start = this.pos;
        // noinspection FallThroughInSwitchStatementJS
        switch (wireType) {
            case WireType.Varint:
                while (this.buf[this.pos++] & 0x80) {
                    // ignore
                }
                break;
            case WireType.Bit64:
                this.pos += 4;
            case WireType.Bit32:
                this.pos += 4;
                break;
            case WireType.LengthDelimited:
                let len = this.uint32();
                this.pos += len;
                break;
            case WireType.StartGroup:
                // From descriptor.proto: Group type is deprecated, not supported in proto3.
                // But we must still be able to parse and treat as unknown.
                let t;
                while ((t = this.tag()[1]) !== WireType.EndGroup) {
                    this.skip(t);
                }
                break;
            default:
                throw new Error("cant skip wire type " + wireType);
        }
        this.assertBounds();
        return this.buf.subarray(start, this.pos);
    }
    /**
     * Throws error if position in byte array is out of range.
     */
    assertBounds() {
        if (this.pos > this.len)
            throw new RangeError("premature EOF");
    }
    /**
     * Read a `int32` field, a signed 32 bit varint.
     */
    int32() {
        return this.uint32() | 0;
    }
    /**
     * Read a `sint32` field, a signed, zigzag-encoded 32-bit varint.
     */
    sint32() {
        let zze = this.uint32();
        // decode zigzag
        return (zze >>> 1) ^ -(zze & 1);
    }
    /**
     * Read a `int64` field, a signed 64-bit varint.
     */
    int64() {
        return new PbLong(...this.varint64());
    }
    /**
     * Read a `uint64` field, an unsigned 64-bit varint.
     */
    uint64() {
        return new PbULong(...this.varint64());
    }
    /**
     * Read a `sint64` field, a signed, zig-zag-encoded 64-bit varint.
     */
    sint64() {
        let [lo, hi] = this.varint64();
        // decode zig zag
        let s = -(lo & 1);
        lo = ((lo >>> 1 | (hi & 1) << 31) ^ s);
        hi = (hi >>> 1 ^ s);
        return new PbLong(lo, hi);
    }
    /**
     * Read a `bool` field, a variant.
     */
    bool() {
        let [lo, hi] = this.varint64();
        return lo !== 0 || hi !== 0;
    }
    /**
     * Read a `fixed32` field, an unsigned, fixed-length 32-bit integer.
     */
    fixed32() {
        return this.view.getUint32((this.pos += 4) - 4, true);
    }
    /**
     * Read a `sfixed32` field, a signed, fixed-length 32-bit integer.
     */
    sfixed32() {
        return this.view.getInt32((this.pos += 4) - 4, true);
    }
    /**
     * Read a `fixed64` field, an unsigned, fixed-length 64 bit integer.
     */
    fixed64() {
        return new PbULong(this.sfixed32(), this.sfixed32());
    }
    /**
     * Read a `fixed64` field, a signed, fixed-length 64-bit integer.
     */
    sfixed64() {
        return new PbLong(this.sfixed32(), this.sfixed32());
    }
    /**
     * Read a `float` field, 32-bit floating point number.
     */
    float() {
        return this.view.getFloat32((this.pos += 4) - 4, true);
    }
    /**
     * Read a `double` field, a 64-bit floating point number.
     */
    double() {
        return this.view.getFloat64((this.pos += 8) - 8, true);
    }
    /**
     * Read a `bytes` field, length-delimited arbitrary data.
     */
    bytes() {
        let len = this.uint32();
        let start = this.pos;
        this.pos += len;
        this.assertBounds();
        return this.buf.subarray(start, start + len);
    }
    /**
     * Read a `string` field, length-delimited data converted to UTF-8 text.
     */
    string() {
        return this.textDecoder.decode(this.bytes());
    }
}

/**
 * assert that condition is true or throw error (with message)
 */
function assert(condition, msg) {
    if (!condition) {
        throw new Error(msg);
    }
}
const FLOAT32_MAX = 3.4028234663852886e+38, FLOAT32_MIN = -3.4028234663852886e+38, UINT32_MAX = 0xFFFFFFFF, INT32_MAX = 0X7FFFFFFF, INT32_MIN = -0X80000000;
function assertInt32(arg) {
    if (typeof arg !== "number")
        throw new Error('invalid int 32: ' + typeof arg);
    if (!Number.isInteger(arg) || arg > INT32_MAX || arg < INT32_MIN)
        throw new Error('invalid int 32: ' + arg);
}
function assertUInt32(arg) {
    if (typeof arg !== "number")
        throw new Error('invalid uint 32: ' + typeof arg);
    if (!Number.isInteger(arg) || arg > UINT32_MAX || arg < 0)
        throw new Error('invalid uint 32: ' + arg);
}
function assertFloat32(arg) {
    if (typeof arg !== "number")
        throw new Error('invalid float 32: ' + typeof arg);
    if (!Number.isFinite(arg))
        return;
    if (arg > FLOAT32_MAX || arg < FLOAT32_MIN)
        throw new Error('invalid float 32: ' + arg);
}

const defaultsWrite$1 = {
    writeUnknownFields: true,
    writerFactory: () => new BinaryWriter(),
};
/**
 * Make options for writing binary data form partial options.
 */
function binaryWriteOptions(options) {
    return options ? Object.assign(Object.assign({}, defaultsWrite$1), options) : defaultsWrite$1;
}
class BinaryWriter {
    constructor(textEncoder) {
        /**
         * Previous fork states.
         */
        this.stack = [];
        this.textEncoder = textEncoder !== null && textEncoder !== void 0 ? textEncoder : new TextEncoder();
        this.chunks = [];
        this.buf = [];
    }
    /**
     * Return all bytes written and reset this writer.
     */
    finish() {
        this.chunks.push(new Uint8Array(this.buf)); // flush the buffer
        let len = 0;
        for (let i = 0; i < this.chunks.length; i++)
            len += this.chunks[i].length;
        let bytes = new Uint8Array(len);
        let offset = 0;
        for (let i = 0; i < this.chunks.length; i++) {
            bytes.set(this.chunks[i], offset);
            offset += this.chunks[i].length;
        }
        this.chunks = [];
        return bytes;
    }
    /**
     * Start a new fork for length-delimited data like a message
     * or a packed repeated field.
     *
     * Must be joined later with `join()`.
     */
    fork() {
        this.stack.push({ chunks: this.chunks, buf: this.buf });
        this.chunks = [];
        this.buf = [];
        return this;
    }
    /**
     * Join the last fork. Write its length and bytes, then
     * return to the previous state.
     */
    join() {
        // get chunk of fork
        let chunk = this.finish();
        // restore previous state
        let prev = this.stack.pop();
        if (!prev)
            throw new Error('invalid state, fork stack empty');
        this.chunks = prev.chunks;
        this.buf = prev.buf;
        // write length of chunk as varint
        this.uint32(chunk.byteLength);
        return this.raw(chunk);
    }
    /**
     * Writes a tag (field number and wire type).
     *
     * Equivalent to `uint32( (fieldNo << 3 | type) >>> 0 )`.
     *
     * Generated code should compute the tag ahead of time and call `uint32()`.
     */
    tag(fieldNo, type) {
        return this.uint32((fieldNo << 3 | type) >>> 0);
    }
    /**
     * Write a chunk of raw bytes.
     */
    raw(chunk) {
        if (this.buf.length) {
            this.chunks.push(new Uint8Array(this.buf));
            this.buf = [];
        }
        this.chunks.push(chunk);
        return this;
    }
    /**
     * Write a `uint32` value, an unsigned 32 bit varint.
     */
    uint32(value) {
        assertUInt32(value);
        // write value as varint 32, inlined for speed
        while (value > 0x7f) {
            this.buf.push((value & 0x7f) | 0x80);
            value = value >>> 7;
        }
        this.buf.push(value);
        return this;
    }
    /**
     * Write a `int32` value, a signed 32 bit varint.
     */
    int32(value) {
        assertInt32(value);
        varint32write(value, this.buf);
        return this;
    }
    /**
     * Write a `bool` value, a variant.
     */
    bool(value) {
        this.buf.push(value ? 1 : 0);
        return this;
    }
    /**
     * Write a `bytes` value, length-delimited arbitrary data.
     */
    bytes(value) {
        this.uint32(value.byteLength); // write length of chunk as varint
        return this.raw(value);
    }
    /**
     * Write a `string` value, length-delimited data converted to UTF-8 text.
     */
    string(value) {
        let chunk = this.textEncoder.encode(value);
        this.uint32(chunk.byteLength); // write length of chunk as varint
        return this.raw(chunk);
    }
    /**
     * Write a `float` value, 32-bit floating point number.
     */
    float(value) {
        assertFloat32(value);
        let chunk = new Uint8Array(4);
        new DataView(chunk.buffer).setFloat32(0, value, true);
        return this.raw(chunk);
    }
    /**
     * Write a `double` value, a 64-bit floating point number.
     */
    double(value) {
        let chunk = new Uint8Array(8);
        new DataView(chunk.buffer).setFloat64(0, value, true);
        return this.raw(chunk);
    }
    /**
     * Write a `fixed32` value, an unsigned, fixed-length 32-bit integer.
     */
    fixed32(value) {
        assertUInt32(value);
        let chunk = new Uint8Array(4);
        new DataView(chunk.buffer).setUint32(0, value, true);
        return this.raw(chunk);
    }
    /**
     * Write a `sfixed32` value, a signed, fixed-length 32-bit integer.
     */
    sfixed32(value) {
        assertInt32(value);
        let chunk = new Uint8Array(4);
        new DataView(chunk.buffer).setInt32(0, value, true);
        return this.raw(chunk);
    }
    /**
     * Write a `sint32` value, a signed, zigzag-encoded 32-bit varint.
     */
    sint32(value) {
        assertInt32(value);
        // zigzag encode
        value = ((value << 1) ^ (value >> 31)) >>> 0;
        varint32write(value, this.buf);
        return this;
    }
    /**
     * Write a `fixed64` value, a signed, fixed-length 64-bit integer.
     */
    sfixed64(value) {
        let chunk = new Uint8Array(8);
        let view = new DataView(chunk.buffer);
        let long = PbLong.from(value);
        view.setInt32(0, long.lo, true);
        view.setInt32(4, long.hi, true);
        return this.raw(chunk);
    }
    /**
     * Write a `fixed64` value, an unsigned, fixed-length 64 bit integer.
     */
    fixed64(value) {
        let chunk = new Uint8Array(8);
        let view = new DataView(chunk.buffer);
        let long = PbULong.from(value);
        view.setInt32(0, long.lo, true);
        view.setInt32(4, long.hi, true);
        return this.raw(chunk);
    }
    /**
     * Write a `int64` value, a signed 64-bit varint.
     */
    int64(value) {
        let long = PbLong.from(value);
        varint64write(long.lo, long.hi, this.buf);
        return this;
    }
    /**
     * Write a `sint64` value, a signed, zig-zag-encoded 64-bit varint.
     */
    sint64(value) {
        let long = PbLong.from(value), 
        // zigzag encode
        sign = long.hi >> 31, lo = (long.lo << 1) ^ sign, hi = ((long.hi << 1) | (long.lo >>> 31)) ^ sign;
        varint64write(lo, hi, this.buf);
        return this;
    }
    /**
     * Write a `uint64` value, an unsigned 64-bit varint.
     */
    uint64(value) {
        let long = PbULong.from(value);
        varint64write(long.lo, long.hi, this.buf);
        return this;
    }
}

const defaultsWrite = {
    emitDefaultValues: false,
    enumAsInteger: false,
    useProtoFieldName: false,
    prettySpaces: 0,
}, defaultsRead = {
    ignoreUnknownFields: false,
};
/**
 * Make options for reading JSON data from partial options.
 */
function jsonReadOptions(options) {
    return options ? Object.assign(Object.assign({}, defaultsRead), options) : defaultsRead;
}
/**
 * Make options for writing JSON data from partial options.
 */
function jsonWriteOptions(options) {
    return options ? Object.assign(Object.assign({}, defaultsWrite), options) : defaultsWrite;
}

/**
 * The symbol used as a key on message objects to store the message type.
 *
 * Note that this is an experimental feature - it is here to stay, but
 * implementation details may change without notice.
 */
const MESSAGE_TYPE = Symbol.for("protobuf-ts/message-type");

/**
 * Converts snake_case to lowerCamelCase.
 *
 * Should behave like protoc:
 * https://github.com/protocolbuffers/protobuf/blob/e8ae137c96444ea313485ed1118c5e43b2099cf1/src/google/protobuf/compiler/java/java_helpers.cc#L118
 */
function lowerCamelCase(snakeCase) {
    let capNext = false;
    const sb = [];
    for (let i = 0; i < snakeCase.length; i++) {
        let next = snakeCase.charAt(i);
        if (next == '_') {
            capNext = true;
        }
        else if (/\d/.test(next)) {
            sb.push(next);
            capNext = true;
        }
        else if (capNext) {
            sb.push(next.toUpperCase());
            capNext = false;
        }
        else if (i == 0) {
            sb.push(next.toLowerCase());
        }
        else {
            sb.push(next);
        }
    }
    return sb.join('');
}

/**
 * Scalar value types. This is a subset of field types declared by protobuf
 * enum google.protobuf.FieldDescriptorProto.Type The types GROUP and MESSAGE
 * are omitted, but the numerical values are identical.
 */
var ScalarType;
(function (ScalarType) {
    // 0 is reserved for errors.
    // Order is weird for historical reasons.
    ScalarType[ScalarType["DOUBLE"] = 1] = "DOUBLE";
    ScalarType[ScalarType["FLOAT"] = 2] = "FLOAT";
    // Not ZigZag encoded.  Negative numbers take 10 bytes.  Use TYPE_SINT64 if
    // negative values are likely.
    ScalarType[ScalarType["INT64"] = 3] = "INT64";
    ScalarType[ScalarType["UINT64"] = 4] = "UINT64";
    // Not ZigZag encoded.  Negative numbers take 10 bytes.  Use TYPE_SINT32 if
    // negative values are likely.
    ScalarType[ScalarType["INT32"] = 5] = "INT32";
    ScalarType[ScalarType["FIXED64"] = 6] = "FIXED64";
    ScalarType[ScalarType["FIXED32"] = 7] = "FIXED32";
    ScalarType[ScalarType["BOOL"] = 8] = "BOOL";
    ScalarType[ScalarType["STRING"] = 9] = "STRING";
    // Tag-delimited aggregate.
    // Group type is deprecated and not supported in proto3. However, Proto3
    // implementations should still be able to parse the group wire format and
    // treat group fields as unknown fields.
    // TYPE_GROUP = 10,
    // TYPE_MESSAGE = 11,  // Length-delimited aggregate.
    // New in version 2.
    ScalarType[ScalarType["BYTES"] = 12] = "BYTES";
    ScalarType[ScalarType["UINT32"] = 13] = "UINT32";
    // TYPE_ENUM = 14,
    ScalarType[ScalarType["SFIXED32"] = 15] = "SFIXED32";
    ScalarType[ScalarType["SFIXED64"] = 16] = "SFIXED64";
    ScalarType[ScalarType["SINT32"] = 17] = "SINT32";
    ScalarType[ScalarType["SINT64"] = 18] = "SINT64";
})(ScalarType || (ScalarType = {}));
/**
 * JavaScript representation of 64 bit integral types. Equivalent to the
 * field option "jstype".
 *
 * By default, protobuf-ts represents 64 bit types as `bigint`.
 *
 * You can change the default behaviour by enabling the plugin parameter
 * `long_type_string`, which will represent 64 bit types as `string`.
 *
 * Alternatively, you can change the behaviour for individual fields
 * with the field option "jstype":
 *
 * ```protobuf
 * uint64 my_field = 1 [jstype = JS_STRING];
 * uint64 other_field = 2 [jstype = JS_NUMBER];
 * ```
 */
var LongType;
(function (LongType) {
    /**
     * Use JavaScript `bigint`.
     *
     * Field option `[jstype = JS_NORMAL]`.
     */
    LongType[LongType["BIGINT"] = 0] = "BIGINT";
    /**
     * Use JavaScript `string`.
     *
     * Field option `[jstype = JS_STRING]`.
     */
    LongType[LongType["STRING"] = 1] = "STRING";
    /**
     * Use JavaScript `number`.
     *
     * Large values will loose precision.
     *
     * Field option `[jstype = JS_NUMBER]`.
     */
    LongType[LongType["NUMBER"] = 2] = "NUMBER";
})(LongType || (LongType = {}));
/**
 * Protobuf 2.1.0 introduced packed repeated fields.
 * Setting the field option `[packed = true]` enables packing.
 *
 * In proto3, all repeated fields are packed by default.
 * Setting the field option `[packed = false]` disables packing.
 *
 * Packed repeated fields are encoded with a single tag,
 * then a length-delimiter, then the element values.
 *
 * Unpacked repeated fields are encoded with a tag and
 * value for each element.
 *
 * `bytes` and `string` cannot be packed.
 */
var RepeatType;
(function (RepeatType) {
    /**
     * The field is not repeated.
     */
    RepeatType[RepeatType["NO"] = 0] = "NO";
    /**
     * The field is repeated and should be packed.
     * Invalid for `bytes` and `string`, they cannot be packed.
     */
    RepeatType[RepeatType["PACKED"] = 1] = "PACKED";
    /**
     * The field is repeated but should not be packed.
     * The only valid repeat type for repeated `bytes` and `string`.
     */
    RepeatType[RepeatType["UNPACKED"] = 2] = "UNPACKED";
})(RepeatType || (RepeatType = {}));
/**
 * Turns PartialFieldInfo into FieldInfo.
 */
function normalizeFieldInfo(field) {
    var _a, _b, _c, _d;
    field.localName = (_a = field.localName) !== null && _a !== void 0 ? _a : lowerCamelCase(field.name);
    field.jsonName = (_b = field.jsonName) !== null && _b !== void 0 ? _b : lowerCamelCase(field.name);
    field.repeat = (_c = field.repeat) !== null && _c !== void 0 ? _c : RepeatType.NO;
    field.opt = (_d = field.opt) !== null && _d !== void 0 ? _d : (field.repeat ? false : field.oneof ? false : field.kind == "message");
    return field;
}

/**
 * Is the given value a valid oneof group?
 *
 * We represent protobuf `oneof` as algebraic data types (ADT) in generated
 * code. But when working with messages of unknown type, the ADT does not
 * help us.
 *
 * This type guard checks if the given object adheres to the ADT rules, which
 * are as follows:
 *
 * 1) Must be an object.
 *
 * 2) Must have a "oneofKind" discriminator property.
 *
 * 3) If "oneofKind" is `undefined`, no member field is selected. The object
 * must not have any other properties.
 *
 * 4) If "oneofKind" is a `string`, the member field with this name is
 * selected.
 *
 * 5) If a member field is selected, the object must have a second property
 * with this name. The property must not be `undefined`.
 *
 * 6) No extra properties are allowed. The object has either one property
 * (no selection) or two properties (selection).
 *
 */
function isOneofGroup(any) {
    if (typeof any != 'object' || any === null || !any.hasOwnProperty('oneofKind')) {
        return false;
    }
    switch (typeof any.oneofKind) {
        case "string":
            if (any[any.oneofKind] === undefined)
                return false;
            return Object.keys(any).length == 2;
        case "undefined":
            return Object.keys(any).length == 1;
        default:
            return false;
    }
}

// noinspection JSMethodCanBeStatic
class ReflectionTypeCheck {
    constructor(info) {
        var _a;
        this.fields = (_a = info.fields) !== null && _a !== void 0 ? _a : [];
    }
    prepare() {
        if (this.data)
            return;
        const req = [], known = [], oneofs = [];
        for (let field of this.fields) {
            if (field.oneof) {
                if (!oneofs.includes(field.oneof)) {
                    oneofs.push(field.oneof);
                    req.push(field.oneof);
                    known.push(field.oneof);
                }
            }
            else {
                known.push(field.localName);
                switch (field.kind) {
                    case "scalar":
                    case "enum":
                        if (!field.opt || field.repeat)
                            req.push(field.localName);
                        break;
                    case "message":
                        if (field.repeat)
                            req.push(field.localName);
                        break;
                    case "map":
                        req.push(field.localName);
                        break;
                }
            }
        }
        this.data = { req, known, oneofs: Object.values(oneofs) };
    }
    /**
     * Is the argument a valid message as specified by the
     * reflection information?
     *
     * Checks all field types recursively. The `depth`
     * specifies how deep into the structure the check will be.
     *
     * With a depth of 0, only the presence of fields
     * is checked.
     *
     * With a depth of 1 or more, the field types are checked.
     *
     * With a depth of 2 or more, the members of map, repeated
     * and message fields are checked.
     *
     * Message fields will be checked recursively with depth - 1.
     *
     * The number of map entries / repeated values being checked
     * is < depth.
     */
    is(message, depth, allowExcessProperties = false) {
        if (depth < 0)
            return true;
        if (message === null || message === undefined || typeof message != 'object')
            return false;
        this.prepare();
        let keys = Object.keys(message), data = this.data;
        // if a required field is missing in arg, this cannot be a T
        if (keys.length < data.req.length || data.req.some(n => !keys.includes(n)))
            return false;
        if (!allowExcessProperties) {
            // if the arg contains a key we dont know, this is not a literal T
            if (keys.some(k => !data.known.includes(k)))
                return false;
        }
        // "With a depth of 0, only the presence and absence of fields is checked."
        // "With a depth of 1 or more, the field types are checked."
        if (depth < 1) {
            return true;
        }
        // check oneof group
        for (const name of data.oneofs) {
            const group = message[name];
            if (!isOneofGroup(group))
                return false;
            if (group.oneofKind === undefined)
                continue;
            const field = this.fields.find(f => f.localName === group.oneofKind);
            if (!field)
                return false; // we found no field, but have a kind, something is wrong
            if (!this.field(group[group.oneofKind], field, allowExcessProperties, depth))
                return false;
        }
        // check types
        for (const field of this.fields) {
            if (field.oneof !== undefined)
                continue;
            if (!this.field(message[field.localName], field, allowExcessProperties, depth))
                return false;
        }
        return true;
    }
    field(arg, field, allowExcessProperties, depth) {
        let repeated = field.repeat;
        switch (field.kind) {
            case "scalar":
                if (arg === undefined)
                    return field.opt;
                if (repeated)
                    return this.scalars(arg, field.T, depth, field.L);
                return this.scalar(arg, field.T, field.L);
            case "enum":
                if (arg === undefined)
                    return field.opt;
                if (repeated)
                    return this.scalars(arg, ScalarType.INT32, depth);
                return this.scalar(arg, ScalarType.INT32);
            case "message":
                if (arg === undefined)
                    return true;
                if (repeated)
                    return this.messages(arg, field.T(), allowExcessProperties, depth);
                return this.message(arg, field.T(), allowExcessProperties, depth);
            case "map":
                if (typeof arg != 'object' || arg === null)
                    return false;
                if (depth < 2)
                    return true;
                if (!this.mapKeys(arg, field.K, depth))
                    return false;
                switch (field.V.kind) {
                    case "scalar":
                        return this.scalars(Object.values(arg), field.V.T, depth, field.V.L);
                    case "enum":
                        return this.scalars(Object.values(arg), ScalarType.INT32, depth);
                    case "message":
                        return this.messages(Object.values(arg), field.V.T(), allowExcessProperties, depth);
                }
                break;
        }
        return true;
    }
    message(arg, type, allowExcessProperties, depth) {
        if (allowExcessProperties) {
            return type.isAssignable(arg, depth);
        }
        return type.is(arg, depth);
    }
    messages(arg, type, allowExcessProperties, depth) {
        if (!Array.isArray(arg))
            return false;
        if (depth < 2)
            return true;
        if (allowExcessProperties) {
            for (let i = 0; i < arg.length && i < depth; i++)
                if (!type.isAssignable(arg[i], depth - 1))
                    return false;
        }
        else {
            for (let i = 0; i < arg.length && i < depth; i++)
                if (!type.is(arg[i], depth - 1))
                    return false;
        }
        return true;
    }
    scalar(arg, type, longType) {
        let argType = typeof arg;
        switch (type) {
            case ScalarType.UINT64:
            case ScalarType.FIXED64:
            case ScalarType.INT64:
            case ScalarType.SFIXED64:
            case ScalarType.SINT64:
                switch (longType) {
                    case LongType.BIGINT:
                        return argType == "bigint";
                    case LongType.NUMBER:
                        return argType == "number" && !isNaN(arg);
                    default:
                        return argType == "string";
                }
            case ScalarType.BOOL:
                return argType == 'boolean';
            case ScalarType.STRING:
                return argType == 'string';
            case ScalarType.BYTES:
                return arg instanceof Uint8Array;
            case ScalarType.DOUBLE:
            case ScalarType.FLOAT:
                return argType == 'number' && !isNaN(arg);
            default:
                // case ScalarType.UINT32:
                // case ScalarType.FIXED32:
                // case ScalarType.INT32:
                // case ScalarType.SINT32:
                // case ScalarType.SFIXED32:
                return argType == 'number' && Number.isInteger(arg);
        }
    }
    scalars(arg, type, depth, longType) {
        if (!Array.isArray(arg))
            return false;
        if (depth < 2)
            return true;
        if (Array.isArray(arg))
            for (let i = 0; i < arg.length && i < depth; i++)
                if (!this.scalar(arg[i], type, longType))
                    return false;
        return true;
    }
    mapKeys(map, type, depth) {
        let keys = Object.keys(map);
        switch (type) {
            case ScalarType.INT32:
            case ScalarType.FIXED32:
            case ScalarType.SFIXED32:
            case ScalarType.SINT32:
            case ScalarType.UINT32:
                return this.scalars(keys.slice(0, depth).map(k => parseInt(k)), type, depth);
            case ScalarType.BOOL:
                return this.scalars(keys.slice(0, depth).map(k => k == 'true' ? true : k == 'false' ? false : k), type, depth);
            default:
                return this.scalars(keys, type, depth, LongType.STRING);
        }
    }
}

/**
 * Utility method to convert a PbLong or PbUlong to a JavaScript
 * representation during runtime.
 *
 * Works with generated field information, `undefined` is equivalent
 * to `STRING`.
 */
function reflectionLongConvert(long, type) {
    switch (type) {
        case LongType.BIGINT:
            return long.toBigInt();
        case LongType.NUMBER:
            return long.toNumber();
        default:
            // case undefined:
            // case LongType.STRING:
            return long.toString();
    }
}

/**
 * Reads proto3 messages in canonical JSON format using reflection information.
 *
 * https://developers.google.com/protocol-buffers/docs/proto3#json
 */
class ReflectionJsonReader {
    constructor(info) {
        this.info = info;
    }
    prepare() {
        var _a;
        if (this.fMap === undefined) {
            this.fMap = {};
            const fieldsInput = (_a = this.info.fields) !== null && _a !== void 0 ? _a : [];
            for (const field of fieldsInput) {
                this.fMap[field.name] = field;
                this.fMap[field.jsonName] = field;
                this.fMap[field.localName] = field;
            }
        }
    }
    // Cannot parse JSON <type of jsonValue> for <type name>#<fieldName>.
    assert(condition, fieldName, jsonValue) {
        if (!condition) {
            let what = typeofJsonValue(jsonValue);
            if (what == "number" || what == "boolean")
                what = jsonValue.toString();
            throw new Error(`Cannot parse JSON ${what} for ${this.info.typeName}#${fieldName}`);
        }
    }
    /**
     * Reads a message from canonical JSON format into the target message.
     *
     * Repeated fields are appended. Map entries are added, overwriting
     * existing keys.
     *
     * If a message field is already present, it will be merged with the
     * new data.
     */
    read(input, message, options) {
        this.prepare();
        const oneofsHandled = [];
        for (const [jsonKey, jsonValue] of Object.entries(input)) {
            const field = this.fMap[jsonKey];
            if (!field) {
                if (!options.ignoreUnknownFields)
                    throw new Error(`Found unknown field while reading ${this.info.typeName} from JSON format. JSON key: ${jsonKey}`);
                continue;
            }
            const localName = field.localName;
            // handle oneof ADT
            let target; // this will be the target for the field value, whether it is member of a oneof or not
            if (field.oneof) {
                if (jsonValue === null && (field.kind !== 'enum' || field.T()[0] !== 'google.protobuf.NullValue')) {
                    continue;
                }
                // since json objects are unordered by specification, it is not possible to take the last of multiple oneofs
                if (oneofsHandled.includes(field.oneof))
                    throw new Error(`Multiple members of the oneof group "${field.oneof}" of ${this.info.typeName} are present in JSON.`);
                oneofsHandled.push(field.oneof);
                target = message[field.oneof] = {
                    oneofKind: localName
                };
            }
            else {
                target = message;
            }
            // we have handled oneof above. we just have read the value into `target`.
            if (field.kind == 'map') {
                if (jsonValue === null) {
                    continue;
                }
                // check input
                this.assert(isJsonObject(jsonValue), field.name, jsonValue);
                // our target to put map entries into
                const fieldObj = target[localName];
                // read entries
                for (const [jsonObjKey, jsonObjValue] of Object.entries(jsonValue)) {
                    this.assert(jsonObjValue !== null, field.name + " map value", null);
                    // read value
                    let val;
                    switch (field.V.kind) {
                        case "message":
                            val = field.V.T().internalJsonRead(jsonObjValue, options);
                            break;
                        case "enum":
                            val = this.enum(field.V.T(), jsonObjValue, field.name, options.ignoreUnknownFields);
                            if (val === false)
                                continue;
                            break;
                        case "scalar":
                            val = this.scalar(jsonObjValue, field.V.T, field.V.L, field.name);
                            break;
                    }
                    this.assert(val !== undefined, field.name + " map value", jsonObjValue);
                    // read key
                    let key = jsonObjKey;
                    if (field.K == ScalarType.BOOL)
                        key = key == "true" ? true : key == "false" ? false : key;
                    key = this.scalar(key, field.K, LongType.STRING, field.name).toString();
                    fieldObj[key] = val;
                }
            }
            else if (field.repeat) {
                if (jsonValue === null)
                    continue;
                // check input
                this.assert(Array.isArray(jsonValue), field.name, jsonValue);
                // our target to put array entries into
                const fieldArr = target[localName];
                // read array entries
                for (const jsonItem of jsonValue) {
                    this.assert(jsonItem !== null, field.name, null);
                    let val;
                    switch (field.kind) {
                        case "message":
                            val = field.T().internalJsonRead(jsonItem, options);
                            break;
                        case "enum":
                            val = this.enum(field.T(), jsonItem, field.name, options.ignoreUnknownFields);
                            if (val === false)
                                continue;
                            break;
                        case "scalar":
                            val = this.scalar(jsonItem, field.T, field.L, field.name);
                            break;
                    }
                    this.assert(val !== undefined, field.name, jsonValue);
                    fieldArr.push(val);
                }
            }
            else {
                switch (field.kind) {
                    case "message":
                        if (jsonValue === null && field.T().typeName != 'google.protobuf.Value') {
                            this.assert(field.oneof === undefined, field.name + " (oneof member)", null);
                            continue;
                        }
                        target[localName] = field.T().internalJsonRead(jsonValue, options, target[localName]);
                        break;
                    case "enum":
                        let val = this.enum(field.T(), jsonValue, field.name, options.ignoreUnknownFields);
                        if (val === false)
                            continue;
                        target[localName] = val;
                        break;
                    case "scalar":
                        target[localName] = this.scalar(jsonValue, field.T, field.L, field.name);
                        break;
                }
            }
        }
    }
    /**
     * Returns `false` for unrecognized string representations.
     *
     * google.protobuf.NullValue accepts only JSON `null` (or the old `"NULL_VALUE"`).
     */
    enum(type, json, fieldName, ignoreUnknownFields) {
        if (type[0] == 'google.protobuf.NullValue')
            assert(json === null || json === "NULL_VALUE", `Unable to parse field ${this.info.typeName}#${fieldName}, enum ${type[0]} only accepts null.`);
        if (json === null)
            // we require 0 to be default value for all enums
            return 0;
        switch (typeof json) {
            case "number":
                assert(Number.isInteger(json), `Unable to parse field ${this.info.typeName}#${fieldName}, enum can only be integral number, got ${json}.`);
                return json;
            case "string":
                let localEnumName = json;
                if (type[2] && json.substring(0, type[2].length) === type[2])
                    // lookup without the shared prefix
                    localEnumName = json.substring(type[2].length);
                let enumNumber = type[1][localEnumName];
                if (typeof enumNumber === 'undefined' && ignoreUnknownFields) {
                    return false;
                }
                assert(typeof enumNumber == "number", `Unable to parse field ${this.info.typeName}#${fieldName}, enum ${type[0]} has no value for "${json}".`);
                return enumNumber;
        }
        assert(false, `Unable to parse field ${this.info.typeName}#${fieldName}, cannot parse enum value from ${typeof json}".`);
    }
    scalar(json, type, longType, fieldName) {
        let e;
        try {
            switch (type) {
                // float, double: JSON value will be a number or one of the special string values "NaN", "Infinity", and "-Infinity".
                // Either numbers or strings are accepted. Exponent notation is also accepted.
                case ScalarType.DOUBLE:
                case ScalarType.FLOAT:
                    if (json === null)
                        return .0;
                    if (json === "NaN")
                        return Number.NaN;
                    if (json === "Infinity")
                        return Number.POSITIVE_INFINITY;
                    if (json === "-Infinity")
                        return Number.NEGATIVE_INFINITY;
                    if (json === "") {
                        e = "empty string";
                        break;
                    }
                    if (typeof json == "string" && json.trim().length !== json.length) {
                        e = "extra whitespace";
                        break;
                    }
                    if (typeof json != "string" && typeof json != "number") {
                        break;
                    }
                    let float = Number(json);
                    if (Number.isNaN(float)) {
                        e = "not a number";
                        break;
                    }
                    if (!Number.isFinite(float)) {
                        // infinity and -infinity are handled by string representation above, so this is an error
                        e = "too large or small";
                        break;
                    }
                    if (type == ScalarType.FLOAT)
                        assertFloat32(float);
                    return float;
                // int32, fixed32, uint32: JSON value will be a decimal number. Either numbers or strings are accepted.
                case ScalarType.INT32:
                case ScalarType.FIXED32:
                case ScalarType.SFIXED32:
                case ScalarType.SINT32:
                case ScalarType.UINT32:
                    if (json === null)
                        return 0;
                    let int32;
                    if (typeof json == "number")
                        int32 = json;
                    else if (json === "")
                        e = "empty string";
                    else if (typeof json == "string") {
                        if (json.trim().length !== json.length)
                            e = "extra whitespace";
                        else
                            int32 = Number(json);
                    }
                    if (int32 === undefined)
                        break;
                    if (type == ScalarType.UINT32)
                        assertUInt32(int32);
                    else
                        assertInt32(int32);
                    return int32;
                // int64, fixed64, uint64: JSON value will be a decimal string. Either numbers or strings are accepted.
                case ScalarType.INT64:
                case ScalarType.SFIXED64:
                case ScalarType.SINT64:
                    if (json === null)
                        return reflectionLongConvert(PbLong.ZERO, longType);
                    if (typeof json != "number" && typeof json != "string")
                        break;
                    return reflectionLongConvert(PbLong.from(json), longType);
                case ScalarType.FIXED64:
                case ScalarType.UINT64:
                    if (json === null)
                        return reflectionLongConvert(PbULong.ZERO, longType);
                    if (typeof json != "number" && typeof json != "string")
                        break;
                    return reflectionLongConvert(PbULong.from(json), longType);
                // bool:
                case ScalarType.BOOL:
                    if (json === null)
                        return false;
                    if (typeof json !== "boolean")
                        break;
                    return json;
                // string:
                case ScalarType.STRING:
                    if (json === null)
                        return "";
                    if (typeof json !== "string") {
                        e = "extra whitespace";
                        break;
                    }
                    try {
                        encodeURIComponent(json);
                    }
                    catch (e) {
                        e = "invalid UTF8";
                        break;
                    }
                    return json;
                // bytes: JSON value will be the data encoded as a string using standard base64 encoding with paddings.
                // Either standard or URL-safe base64 encoding with/without paddings are accepted.
                case ScalarType.BYTES:
                    if (json === null || json === "")
                        return new Uint8Array(0);
                    if (typeof json !== 'string')
                        break;
                    return base64decode(json);
            }
        }
        catch (error) {
            e = error.message;
        }
        this.assert(false, fieldName + (e ? " - " + e : ""), json);
    }
}

/**
 * Writes proto3 messages in canonical JSON format using reflection
 * information.
 *
 * https://developers.google.com/protocol-buffers/docs/proto3#json
 */
class ReflectionJsonWriter {
    constructor(info) {
        var _a;
        this.fields = (_a = info.fields) !== null && _a !== void 0 ? _a : [];
    }
    /**
     * Converts the message to a JSON object, based on the field descriptors.
     */
    write(message, options) {
        const json = {}, source = message;
        for (const field of this.fields) {
            // field is not part of a oneof, simply write as is
            if (!field.oneof) {
                let jsonValue = this.field(field, source[field.localName], options);
                if (jsonValue !== undefined)
                    json[options.useProtoFieldName ? field.name : field.jsonName] = jsonValue;
                continue;
            }
            // field is part of a oneof
            const group = source[field.oneof];
            if (group.oneofKind !== field.localName)
                continue; // not selected, skip
            const opt = field.kind == 'scalar' || field.kind == 'enum'
                ? Object.assign(Object.assign({}, options), { emitDefaultValues: true }) : options;
            let jsonValue = this.field(field, group[field.localName], opt);
            assert(jsonValue !== undefined);
            json[options.useProtoFieldName ? field.name : field.jsonName] = jsonValue;
        }
        return json;
    }
    field(field, value, options) {
        let jsonValue = undefined;
        if (field.kind == 'map') {
            assert(typeof value == "object" && value !== null);
            const jsonObj = {};
            switch (field.V.kind) {
                case "scalar":
                    for (const [entryKey, entryValue] of Object.entries(value)) {
                        const val = this.scalar(field.V.T, entryValue, field.name, false, true);
                        assert(val !== undefined);
                        jsonObj[entryKey.toString()] = val; // JSON standard allows only (double quoted) string as property key
                    }
                    break;
                case "message":
                    const messageType = field.V.T();
                    for (const [entryKey, entryValue] of Object.entries(value)) {
                        const val = this.message(messageType, entryValue, field.name, options);
                        assert(val !== undefined);
                        jsonObj[entryKey.toString()] = val; // JSON standard allows only (double quoted) string as property key
                    }
                    break;
                case "enum":
                    const enumInfo = field.V.T();
                    for (const [entryKey, entryValue] of Object.entries(value)) {
                        assert(entryValue === undefined || typeof entryValue == 'number');
                        const val = this.enum(enumInfo, entryValue, field.name, false, true, options.enumAsInteger);
                        assert(val !== undefined);
                        jsonObj[entryKey.toString()] = val; // JSON standard allows only (double quoted) string as property key
                    }
                    break;
            }
            if (options.emitDefaultValues || Object.keys(jsonObj).length > 0)
                jsonValue = jsonObj;
        }
        else if (field.repeat) {
            assert(Array.isArray(value));
            const jsonArr = [];
            switch (field.kind) {
                case "scalar":
                    for (let i = 0; i < value.length; i++) {
                        const val = this.scalar(field.T, value[i], field.name, field.opt, true);
                        assert(val !== undefined);
                        jsonArr.push(val);
                    }
                    break;
                case "enum":
                    const enumInfo = field.T();
                    for (let i = 0; i < value.length; i++) {
                        assert(value[i] === undefined || typeof value[i] == 'number');
                        const val = this.enum(enumInfo, value[i], field.name, field.opt, true, options.enumAsInteger);
                        assert(val !== undefined);
                        jsonArr.push(val);
                    }
                    break;
                case "message":
                    const messageType = field.T();
                    for (let i = 0; i < value.length; i++) {
                        const val = this.message(messageType, value[i], field.name, options);
                        assert(val !== undefined);
                        jsonArr.push(val);
                    }
                    break;
            }
            // add converted array to json output
            if (options.emitDefaultValues || jsonArr.length > 0 || options.emitDefaultValues)
                jsonValue = jsonArr;
        }
        else {
            switch (field.kind) {
                case "scalar":
                    jsonValue = this.scalar(field.T, value, field.name, field.opt, options.emitDefaultValues);
                    break;
                case "enum":
                    jsonValue = this.enum(field.T(), value, field.name, field.opt, options.emitDefaultValues, options.enumAsInteger);
                    break;
                case "message":
                    jsonValue = this.message(field.T(), value, field.name, options);
                    break;
            }
        }
        return jsonValue;
    }
    /**
     * Returns `null` as the default for google.protobuf.NullValue.
     */
    enum(type, value, fieldName, optional, emitDefaultValues, enumAsInteger) {
        if (type[0] == 'google.protobuf.NullValue')
            return !emitDefaultValues && !optional ? undefined : null;
        if (value === undefined) {
            assert(optional);
            return undefined;
        }
        if (value === 0 && !emitDefaultValues && !optional)
            // we require 0 to be default value for all enums
            return undefined;
        assert(typeof value == 'number');
        assert(Number.isInteger(value));
        if (enumAsInteger || !type[1].hasOwnProperty(value))
            // if we don't now the enum value, just return the number
            return value;
        if (type[2])
            // restore the dropped prefix
            return type[2] + type[1][value];
        return type[1][value];
    }
    message(type, value, fieldName, options) {
        if (value === undefined)
            return options.emitDefaultValues ? null : undefined;
        return type.internalJsonWrite(value, options);
    }
    scalar(type, value, fieldName, optional, emitDefaultValues) {
        if (value === undefined) {
            assert(optional);
            return undefined;
        }
        const ed = emitDefaultValues || optional;
        // noinspection FallThroughInSwitchStatementJS
        switch (type) {
            // int32, fixed32, uint32: JSON value will be a decimal number. Either numbers or strings are accepted.
            case ScalarType.INT32:
            case ScalarType.SFIXED32:
            case ScalarType.SINT32:
                if (value === 0)
                    return ed ? 0 : undefined;
                assertInt32(value);
                return value;
            case ScalarType.FIXED32:
            case ScalarType.UINT32:
                if (value === 0)
                    return ed ? 0 : undefined;
                assertUInt32(value);
                return value;
            // float, double: JSON value will be a number or one of the special string values "NaN", "Infinity", and "-Infinity".
            // Either numbers or strings are accepted. Exponent notation is also accepted.
            case ScalarType.FLOAT:
                assertFloat32(value);
            case ScalarType.DOUBLE:
                if (value === 0)
                    return ed ? 0 : undefined;
                assert(typeof value == 'number');
                if (Number.isNaN(value))
                    return 'NaN';
                if (value === Number.POSITIVE_INFINITY)
                    return 'Infinity';
                if (value === Number.NEGATIVE_INFINITY)
                    return '-Infinity';
                return value;
            // string:
            case ScalarType.STRING:
                if (value === "")
                    return ed ? '' : undefined;
                assert(typeof value == 'string');
                return value;
            // bool:
            case ScalarType.BOOL:
                if (value === false)
                    return ed ? false : undefined;
                assert(typeof value == 'boolean');
                return value;
            // JSON value will be a decimal string. Either numbers or strings are accepted.
            case ScalarType.UINT64:
            case ScalarType.FIXED64:
                assert(typeof value == 'number' || typeof value == 'string' || typeof value == 'bigint');
                let ulong = PbULong.from(value);
                if (ulong.isZero() && !ed)
                    return undefined;
                return ulong.toString();
            // JSON value will be a decimal string. Either numbers or strings are accepted.
            case ScalarType.INT64:
            case ScalarType.SFIXED64:
            case ScalarType.SINT64:
                assert(typeof value == 'number' || typeof value == 'string' || typeof value == 'bigint');
                let long = PbLong.from(value);
                if (long.isZero() && !ed)
                    return undefined;
                return long.toString();
            // bytes: JSON value will be the data encoded as a string using standard base64 encoding with paddings.
            // Either standard or URL-safe base64 encoding with/without paddings are accepted.
            case ScalarType.BYTES:
                assert(value instanceof Uint8Array);
                if (!value.byteLength)
                    return ed ? "" : undefined;
                return base64encode(value);
        }
    }
}

/**
 * Creates the default value for a scalar type.
 */
function reflectionScalarDefault(type, longType = LongType.STRING) {
    switch (type) {
        case ScalarType.BOOL:
            return false;
        case ScalarType.UINT64:
        case ScalarType.FIXED64:
            return reflectionLongConvert(PbULong.ZERO, longType);
        case ScalarType.INT64:
        case ScalarType.SFIXED64:
        case ScalarType.SINT64:
            return reflectionLongConvert(PbLong.ZERO, longType);
        case ScalarType.DOUBLE:
        case ScalarType.FLOAT:
            return 0.0;
        case ScalarType.BYTES:
            return new Uint8Array(0);
        case ScalarType.STRING:
            return "";
        default:
            // case ScalarType.INT32:
            // case ScalarType.UINT32:
            // case ScalarType.SINT32:
            // case ScalarType.FIXED32:
            // case ScalarType.SFIXED32:
            return 0;
    }
}

/**
 * Reads proto3 messages in binary format using reflection information.
 *
 * https://developers.google.com/protocol-buffers/docs/encoding
 */
class ReflectionBinaryReader {
    constructor(info) {
        this.info = info;
    }
    prepare() {
        var _a;
        if (!this.fieldNoToField) {
            const fieldsInput = (_a = this.info.fields) !== null && _a !== void 0 ? _a : [];
            this.fieldNoToField = new Map(fieldsInput.map(field => [field.no, field]));
        }
    }
    /**
     * Reads a message from binary format into the target message.
     *
     * Repeated fields are appended. Map entries are added, overwriting
     * existing keys.
     *
     * If a message field is already present, it will be merged with the
     * new data.
     */
    read(reader, message, options, length) {
        this.prepare();
        const end = length === undefined ? reader.len : reader.pos + length;
        while (reader.pos < end) {
            // read the tag and find the field
            const [fieldNo, wireType] = reader.tag(), field = this.fieldNoToField.get(fieldNo);
            if (!field) {
                let u = options.readUnknownField;
                if (u == "throw")
                    throw new Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.info.typeName}`);
                let d = reader.skip(wireType);
                if (u !== false)
                    (u === true ? UnknownFieldHandler.onRead : u)(this.info.typeName, message, fieldNo, wireType, d);
                continue;
            }
            // target object for the field we are reading
            let target = message, repeated = field.repeat, localName = field.localName;
            // if field is member of oneof ADT, use ADT as target
            if (field.oneof) {
                target = target[field.oneof];
                // if other oneof member selected, set new ADT
                if (target.oneofKind !== localName)
                    target = message[field.oneof] = {
                        oneofKind: localName
                    };
            }
            // we have handled oneof above, we just have read the value into `target[localName]`
            switch (field.kind) {
                case "scalar":
                case "enum":
                    let T = field.kind == "enum" ? ScalarType.INT32 : field.T;
                    let L = field.kind == "scalar" ? field.L : undefined;
                    if (repeated) {
                        let arr = target[localName]; // safe to assume presence of array, oneof cannot contain repeated values
                        if (wireType == WireType.LengthDelimited && T != ScalarType.STRING && T != ScalarType.BYTES) {
                            let e = reader.uint32() + reader.pos;
                            while (reader.pos < e)
                                arr.push(this.scalar(reader, T, L));
                        }
                        else
                            arr.push(this.scalar(reader, T, L));
                    }
                    else
                        target[localName] = this.scalar(reader, T, L);
                    break;
                case "message":
                    if (repeated) {
                        let arr = target[localName]; // safe to assume presence of array, oneof cannot contain repeated values
                        let msg = field.T().internalBinaryRead(reader, reader.uint32(), options);
                        arr.push(msg);
                    }
                    else
                        target[localName] = field.T().internalBinaryRead(reader, reader.uint32(), options, target[localName]);
                    break;
                case "map":
                    let [mapKey, mapVal] = this.mapEntry(field, reader, options);
                    // safe to assume presence of map object, oneof cannot contain repeated values
                    target[localName][mapKey] = mapVal;
                    break;
            }
        }
    }
    /**
     * Read a map field, expecting key field = 1, value field = 2
     */
    mapEntry(field, reader, options) {
        let length = reader.uint32();
        let end = reader.pos + length;
        let key = undefined; // javascript only allows number or string for object properties
        let val = undefined;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case 1:
                    if (field.K == ScalarType.BOOL)
                        key = reader.bool().toString();
                    else
                        // long types are read as string, number types are okay as number
                        key = this.scalar(reader, field.K, LongType.STRING);
                    break;
                case 2:
                    switch (field.V.kind) {
                        case "scalar":
                            val = this.scalar(reader, field.V.T, field.V.L);
                            break;
                        case "enum":
                            val = reader.int32();
                            break;
                        case "message":
                            val = field.V.T().internalBinaryRead(reader, reader.uint32(), options);
                            break;
                    }
                    break;
                default:
                    throw new Error(`Unknown field ${fieldNo} (wire type ${wireType}) in map entry for ${this.info.typeName}#${field.name}`);
            }
        }
        if (key === undefined) {
            let keyRaw = reflectionScalarDefault(field.K);
            key = field.K == ScalarType.BOOL ? keyRaw.toString() : keyRaw;
        }
        if (val === undefined)
            switch (field.V.kind) {
                case "scalar":
                    val = reflectionScalarDefault(field.V.T, field.V.L);
                    break;
                case "enum":
                    val = 0;
                    break;
                case "message":
                    val = field.V.T().create();
                    break;
            }
        return [key, val];
    }
    scalar(reader, type, longType) {
        switch (type) {
            case ScalarType.INT32:
                return reader.int32();
            case ScalarType.STRING:
                return reader.string();
            case ScalarType.BOOL:
                return reader.bool();
            case ScalarType.DOUBLE:
                return reader.double();
            case ScalarType.FLOAT:
                return reader.float();
            case ScalarType.INT64:
                return reflectionLongConvert(reader.int64(), longType);
            case ScalarType.UINT64:
                return reflectionLongConvert(reader.uint64(), longType);
            case ScalarType.FIXED64:
                return reflectionLongConvert(reader.fixed64(), longType);
            case ScalarType.FIXED32:
                return reader.fixed32();
            case ScalarType.BYTES:
                return reader.bytes();
            case ScalarType.UINT32:
                return reader.uint32();
            case ScalarType.SFIXED32:
                return reader.sfixed32();
            case ScalarType.SFIXED64:
                return reflectionLongConvert(reader.sfixed64(), longType);
            case ScalarType.SINT32:
                return reader.sint32();
            case ScalarType.SINT64:
                return reflectionLongConvert(reader.sint64(), longType);
        }
    }
}

/**
 * Writes proto3 messages in binary format using reflection information.
 *
 * https://developers.google.com/protocol-buffers/docs/encoding
 */
class ReflectionBinaryWriter {
    constructor(info) {
        this.info = info;
    }
    prepare() {
        if (!this.fields) {
            const fieldsInput = this.info.fields ? this.info.fields.concat() : [];
            this.fields = fieldsInput.sort((a, b) => a.no - b.no);
        }
    }
    /**
     * Writes the message to binary format.
     */
    write(message, writer, options) {
        this.prepare();
        for (const field of this.fields) {
            let value, // this will be our field value, whether it is member of a oneof or not
            emitDefault, // whether we emit the default value (only true for oneof members)
            repeated = field.repeat, localName = field.localName;
            // handle oneof ADT
            if (field.oneof) {
                const group = message[field.oneof];
                if (group.oneofKind !== localName)
                    continue; // if field is not selected, skip
                value = group[localName];
                emitDefault = true;
            }
            else {
                value = message[localName];
                emitDefault = false;
            }
            // we have handled oneof above. we just have to honor `emitDefault`.
            switch (field.kind) {
                case "scalar":
                case "enum":
                    let T = field.kind == "enum" ? ScalarType.INT32 : field.T;
                    if (repeated) {
                        assert(Array.isArray(value));
                        if (repeated == RepeatType.PACKED)
                            this.packed(writer, T, field.no, value);
                        else
                            for (const item of value)
                                this.scalar(writer, T, field.no, item, true);
                    }
                    else if (value === undefined)
                        assert(field.opt);
                    else
                        this.scalar(writer, T, field.no, value, emitDefault || field.opt);
                    break;
                case "message":
                    if (repeated) {
                        assert(Array.isArray(value));
                        for (const item of value)
                            this.message(writer, options, field.T(), field.no, item);
                    }
                    else {
                        this.message(writer, options, field.T(), field.no, value);
                    }
                    break;
                case "map":
                    assert(typeof value == 'object' && value !== null);
                    for (const [key, val] of Object.entries(value))
                        this.mapEntry(writer, options, field, key, val);
                    break;
            }
        }
        let u = options.writeUnknownFields;
        if (u !== false)
            (u === true ? UnknownFieldHandler.onWrite : u)(this.info.typeName, message, writer);
    }
    mapEntry(writer, options, field, key, value) {
        writer.tag(field.no, WireType.LengthDelimited);
        writer.fork();
        // javascript only allows number or string for object properties
        // we convert from our representation to the protobuf type
        let keyValue = key;
        switch (field.K) {
            case ScalarType.INT32:
            case ScalarType.FIXED32:
            case ScalarType.UINT32:
            case ScalarType.SFIXED32:
            case ScalarType.SINT32:
                keyValue = Number.parseInt(key);
                break;
            case ScalarType.BOOL:
                assert(key == 'true' || key == 'false');
                keyValue = key == 'true';
                break;
        }
        // write key, expecting key field number = 1
        this.scalar(writer, field.K, 1, keyValue, true);
        // write value, expecting value field number = 2
        switch (field.V.kind) {
            case 'scalar':
                this.scalar(writer, field.V.T, 2, value, true);
                break;
            case 'enum':
                this.scalar(writer, ScalarType.INT32, 2, value, true);
                break;
            case 'message':
                this.message(writer, options, field.V.T(), 2, value);
                break;
        }
        writer.join();
    }
    message(writer, options, handler, fieldNo, value) {
        if (value === undefined)
            return;
        handler.internalBinaryWrite(value, writer.tag(fieldNo, WireType.LengthDelimited).fork(), options);
        writer.join();
    }
    /**
     * Write a single scalar value.
     */
    scalar(writer, type, fieldNo, value, emitDefault) {
        let [wireType, method, isDefault] = this.scalarInfo(type, value);
        if (!isDefault || emitDefault) {
            writer.tag(fieldNo, wireType);
            writer[method](value);
        }
    }
    /**
     * Write an array of scalar values in packed format.
     */
    packed(writer, type, fieldNo, value) {
        if (!value.length)
            return;
        assert(type !== ScalarType.BYTES && type !== ScalarType.STRING);
        // write tag
        writer.tag(fieldNo, WireType.LengthDelimited);
        // begin length-delimited
        writer.fork();
        // write values without tags
        let [, method,] = this.scalarInfo(type);
        for (let i = 0; i < value.length; i++)
            writer[method](value[i]);
        // end length delimited
        writer.join();
    }
    /**
     * Get information for writing a scalar value.
     *
     * Returns tuple:
     * [0]: appropriate WireType
     * [1]: name of the appropriate method of IBinaryWriter
     * [2]: whether the given value is a default value
     *
     * If argument `value` is omitted, [2] is always false.
     */
    scalarInfo(type, value) {
        let t = WireType.Varint;
        let m;
        let i = value === undefined;
        let d = value === 0;
        switch (type) {
            case ScalarType.INT32:
                m = "int32";
                break;
            case ScalarType.STRING:
                d = i || !value.length;
                t = WireType.LengthDelimited;
                m = "string";
                break;
            case ScalarType.BOOL:
                d = value === false;
                m = "bool";
                break;
            case ScalarType.UINT32:
                m = "uint32";
                break;
            case ScalarType.DOUBLE:
                t = WireType.Bit64;
                m = "double";
                break;
            case ScalarType.FLOAT:
                t = WireType.Bit32;
                m = "float";
                break;
            case ScalarType.INT64:
                d = i || PbLong.from(value).isZero();
                m = "int64";
                break;
            case ScalarType.UINT64:
                d = i || PbULong.from(value).isZero();
                m = "uint64";
                break;
            case ScalarType.FIXED64:
                d = i || PbULong.from(value).isZero();
                t = WireType.Bit64;
                m = "fixed64";
                break;
            case ScalarType.BYTES:
                d = i || !value.byteLength;
                t = WireType.LengthDelimited;
                m = "bytes";
                break;
            case ScalarType.FIXED32:
                t = WireType.Bit32;
                m = "fixed32";
                break;
            case ScalarType.SFIXED32:
                t = WireType.Bit32;
                m = "sfixed32";
                break;
            case ScalarType.SFIXED64:
                d = i || PbLong.from(value).isZero();
                t = WireType.Bit64;
                m = "sfixed64";
                break;
            case ScalarType.SINT32:
                m = "sint32";
                break;
            case ScalarType.SINT64:
                d = i || PbLong.from(value).isZero();
                m = "sint64";
                break;
        }
        return [t, m, i || d];
    }
}

/**
 * Creates an instance of the generic message, using the field
 * information.
 */
function reflectionCreate(type) {
    /**
     * This ternary can be removed in the next major version.
     * The `Object.create()` code path utilizes a new `messagePrototype`
     * property on the `IMessageType` which has this same `MESSAGE_TYPE`
     * non-enumerable property on it. Doing it this way means that we only
     * pay the cost of `Object.defineProperty()` once per `IMessageType`
     * class of once per "instance". The falsy code path is only provided
     * for backwards compatibility in cases where the runtime library is
     * updated without also updating the generated code.
     */
    const msg = type.messagePrototype
        ? Object.create(type.messagePrototype)
        : Object.defineProperty({}, MESSAGE_TYPE, { value: type });
    for (let field of type.fields) {
        let name = field.localName;
        if (field.opt)
            continue;
        if (field.oneof)
            msg[field.oneof] = { oneofKind: undefined };
        else if (field.repeat)
            msg[name] = [];
        else
            switch (field.kind) {
                case "scalar":
                    msg[name] = reflectionScalarDefault(field.T, field.L);
                    break;
                case "enum":
                    // we require 0 to be default value for all enums
                    msg[name] = 0;
                    break;
                case "map":
                    msg[name] = {};
                    break;
            }
    }
    return msg;
}

/**
 * Copy partial data into the target message.
 *
 * If a singular scalar or enum field is present in the source, it
 * replaces the field in the target.
 *
 * If a singular message field is present in the source, it is merged
 * with the target field by calling mergePartial() of the responsible
 * message type.
 *
 * If a repeated field is present in the source, its values replace
 * all values in the target array, removing extraneous values.
 * Repeated message fields are copied, not merged.
 *
 * If a map field is present in the source, entries are added to the
 * target map, replacing entries with the same key. Entries that only
 * exist in the target remain. Entries with message values are copied,
 * not merged.
 *
 * Note that this function differs from protobuf merge semantics,
 * which appends repeated fields.
 */
function reflectionMergePartial(info, target, source) {
    let fieldValue, // the field value we are working with
    input = source, output; // where we want our field value to go
    for (let field of info.fields) {
        let name = field.localName;
        if (field.oneof) {
            const group = input[field.oneof]; // this is the oneof`s group in the source
            if ((group === null || group === void 0 ? void 0 : group.oneofKind) == undefined) { // the user is free to omit
                continue; // we skip this field, and all other members too
            }
            fieldValue = group[name]; // our value comes from the the oneof group of the source
            output = target[field.oneof]; // and our output is the oneof group of the target
            output.oneofKind = group.oneofKind; // always update discriminator
            if (fieldValue == undefined) {
                delete output[name]; // remove any existing value
                continue; // skip further work on field
            }
        }
        else {
            fieldValue = input[name]; // we are using the source directly
            output = target; // we want our field value to go directly into the target
            if (fieldValue == undefined) {
                continue; // skip further work on field, existing value is used as is
            }
        }
        if (field.repeat)
            output[name].length = fieldValue.length; // resize target array to match source array
        // now we just work with `fieldValue` and `output` to merge the value
        switch (field.kind) {
            case "scalar":
            case "enum":
                if (field.repeat)
                    for (let i = 0; i < fieldValue.length; i++)
                        output[name][i] = fieldValue[i]; // not a reference type
                else
                    output[name] = fieldValue; // not a reference type
                break;
            case "message":
                let T = field.T();
                if (field.repeat)
                    for (let i = 0; i < fieldValue.length; i++)
                        output[name][i] = T.create(fieldValue[i]);
                else if (output[name] === undefined)
                    output[name] = T.create(fieldValue); // nothing to merge with
                else
                    T.mergePartial(output[name], fieldValue);
                break;
            case "map":
                // Map and repeated fields are simply overwritten, not appended or merged
                switch (field.V.kind) {
                    case "scalar":
                    case "enum":
                        Object.assign(output[name], fieldValue); // elements are not reference types
                        break;
                    case "message":
                        let T = field.V.T();
                        for (let k of Object.keys(fieldValue))
                            output[name][k] = T.create(fieldValue[k]);
                        break;
                }
                break;
        }
    }
}

/**
 * Determines whether two message of the same type have the same field values.
 * Checks for deep equality, traversing repeated fields, oneof groups, maps
 * and messages recursively.
 * Will also return true if both messages are `undefined`.
 */
function reflectionEquals(info, a, b) {
    if (a === b)
        return true;
    if (!a || !b)
        return false;
    for (let field of info.fields) {
        let localName = field.localName;
        let val_a = field.oneof ? a[field.oneof][localName] : a[localName];
        let val_b = field.oneof ? b[field.oneof][localName] : b[localName];
        switch (field.kind) {
            case "enum":
            case "scalar":
                let t = field.kind == "enum" ? ScalarType.INT32 : field.T;
                if (!(field.repeat
                    ? repeatedPrimitiveEq(t, val_a, val_b)
                    : primitiveEq(t, val_a, val_b)))
                    return false;
                break;
            case "map":
                if (!(field.V.kind == "message"
                    ? repeatedMsgEq(field.V.T(), objectValues(val_a), objectValues(val_b))
                    : repeatedPrimitiveEq(field.V.kind == "enum" ? ScalarType.INT32 : field.V.T, objectValues(val_a), objectValues(val_b))))
                    return false;
                break;
            case "message":
                let T = field.T();
                if (!(field.repeat
                    ? repeatedMsgEq(T, val_a, val_b)
                    : T.equals(val_a, val_b)))
                    return false;
                break;
        }
    }
    return true;
}
const objectValues = Object.values;
function primitiveEq(type, a, b) {
    if (a === b)
        return true;
    if (type !== ScalarType.BYTES)
        return false;
    let ba = a;
    let bb = b;
    if (ba.length !== bb.length)
        return false;
    for (let i = 0; i < ba.length; i++)
        if (ba[i] != bb[i])
            return false;
    return true;
}
function repeatedPrimitiveEq(type, a, b) {
    if (a.length !== b.length)
        return false;
    for (let i = 0; i < a.length; i++)
        if (!primitiveEq(type, a[i], b[i]))
            return false;
    return true;
}
function repeatedMsgEq(type, a, b) {
    if (a.length !== b.length)
        return false;
    for (let i = 0; i < a.length; i++)
        if (!type.equals(a[i], b[i]))
            return false;
    return true;
}

const baseDescriptors = Object.getOwnPropertyDescriptors(Object.getPrototypeOf({}));
/**
 * This standard message type provides reflection-based
 * operations to work with a message.
 */
class MessageType {
    constructor(name, fields, options) {
        this.defaultCheckDepth = 16;
        this.typeName = name;
        this.fields = fields.map(normalizeFieldInfo);
        this.options = options !== null && options !== void 0 ? options : {};
        this.messagePrototype = Object.create(null, Object.assign(Object.assign({}, baseDescriptors), { [MESSAGE_TYPE]: { value: this } }));
        this.refTypeCheck = new ReflectionTypeCheck(this);
        this.refJsonReader = new ReflectionJsonReader(this);
        this.refJsonWriter = new ReflectionJsonWriter(this);
        this.refBinReader = new ReflectionBinaryReader(this);
        this.refBinWriter = new ReflectionBinaryWriter(this);
    }
    create(value) {
        let message = reflectionCreate(this);
        if (value !== undefined) {
            reflectionMergePartial(this, message, value);
        }
        return message;
    }
    /**
     * Clone the message.
     *
     * Unknown fields are discarded.
     */
    clone(message) {
        let copy = this.create();
        reflectionMergePartial(this, copy, message);
        return copy;
    }
    /**
     * Determines whether two message of the same type have the same field values.
     * Checks for deep equality, traversing repeated fields, oneof groups, maps
     * and messages recursively.
     * Will also return true if both messages are `undefined`.
     */
    equals(a, b) {
        return reflectionEquals(this, a, b);
    }
    /**
     * Is the given value assignable to our message type
     * and contains no [excess properties](https://www.typescriptlang.org/docs/handbook/interfaces.html#excess-property-checks)?
     */
    is(arg, depth = this.defaultCheckDepth) {
        return this.refTypeCheck.is(arg, depth, false);
    }
    /**
     * Is the given value assignable to our message type,
     * regardless of [excess properties](https://www.typescriptlang.org/docs/handbook/interfaces.html#excess-property-checks)?
     */
    isAssignable(arg, depth = this.defaultCheckDepth) {
        return this.refTypeCheck.is(arg, depth, true);
    }
    /**
     * Copy partial data into the target message.
     */
    mergePartial(target, source) {
        reflectionMergePartial(this, target, source);
    }
    /**
     * Create a new message from binary format.
     */
    fromBinary(data, options) {
        let opt = binaryReadOptions(options);
        return this.internalBinaryRead(opt.readerFactory(data), data.byteLength, opt);
    }
    /**
     * Read a new message from a JSON value.
     */
    fromJson(json, options) {
        return this.internalJsonRead(json, jsonReadOptions(options));
    }
    /**
     * Read a new message from a JSON string.
     * This is equivalent to `T.fromJson(JSON.parse(json))`.
     */
    fromJsonString(json, options) {
        let value = JSON.parse(json);
        return this.fromJson(value, options);
    }
    /**
     * Write the message to canonical JSON value.
     */
    toJson(message, options) {
        return this.internalJsonWrite(message, jsonWriteOptions(options));
    }
    /**
     * Convert the message to canonical JSON string.
     * This is equivalent to `JSON.stringify(T.toJson(t))`
     */
    toJsonString(message, options) {
        var _a;
        let value = this.toJson(message, options);
        return JSON.stringify(value, null, (_a = options === null || options === void 0 ? void 0 : options.prettySpaces) !== null && _a !== void 0 ? _a : 0);
    }
    /**
     * Write the message to binary format.
     */
    toBinary(message, options) {
        let opt = binaryWriteOptions(options);
        return this.internalBinaryWrite(message, opt.writerFactory(), opt).finish();
    }
    /**
     * This is an internal method. If you just want to read a message from
     * JSON, use `fromJson()` or `fromJsonString()`.
     *
     * Reads JSON value and merges the fields into the target
     * according to protobuf rules. If the target is omitted,
     * a new instance is created first.
     */
    internalJsonRead(json, options, target) {
        if (json !== null && typeof json == "object" && !Array.isArray(json)) {
            let message = target !== null && target !== void 0 ? target : this.create();
            this.refJsonReader.read(json, message, options);
            return message;
        }
        throw new Error(`Unable to parse message ${this.typeName} from JSON ${typeofJsonValue(json)}.`);
    }
    /**
     * This is an internal method. If you just want to write a message
     * to JSON, use `toJson()` or `toJsonString().
     *
     * Writes JSON value and returns it.
     */
    internalJsonWrite(message, options) {
        return this.refJsonWriter.write(message, options);
    }
    /**
     * This is an internal method. If you just want to write a message
     * in binary format, use `toBinary()`.
     *
     * Serializes the message in binary format and appends it to the given
     * writer. Returns passed writer.
     */
    internalBinaryWrite(message, writer, options) {
        this.refBinWriter.write(message, writer, options);
        return writer;
    }
    /**
     * This is an internal method. If you just want to read a message from
     * binary data, use `fromBinary()`.
     *
     * Reads data from binary format and merges the fields into
     * the target according to protobuf rules. If the target is
     * omitted, a new instance is created first.
     */
    internalBinaryRead(reader, length, options, target) {
        let message = target !== null && target !== void 0 ? target : this.create();
        this.refBinReader.read(reader, message, options, length);
        return message;
    }
}

// @generated by protobuf-ts 2.9.4 with parameter generate_dependencies,long_type_number,keep_enum_prefix,output_javascript
// @generated from protobuf file "com.apple.geo.protobuf.geo.proto" (package "com.apple.geo.protobuf.geo", syntax proto2)
// tslint:disable
/**
 * @generated from protobuf enum com.apple.geo.protobuf.geo.TileSet.TileSetVersionUpdateBehavior
 */
var TileSet_TileSetVersionUpdateBehavior;
(function (TileSet_TileSetVersionUpdateBehavior) {
    /**
     * @generated from protobuf enum value: TILE_UPDATE_BEHAVIOR_FLUSH = 0;
     */
    TileSet_TileSetVersionUpdateBehavior[TileSet_TileSetVersionUpdateBehavior["TILE_UPDATE_BEHAVIOR_FLUSH"] = 0] = "TILE_UPDATE_BEHAVIOR_FLUSH";
    /**
     * @generated from protobuf enum value: TILE_UPDATE_BEHAVIOR_ETAG = 1;
     */
    TileSet_TileSetVersionUpdateBehavior[TileSet_TileSetVersionUpdateBehavior["TILE_UPDATE_BEHAVIOR_ETAG"] = 1] = "TILE_UPDATE_BEHAVIOR_ETAG";
})(TileSet_TileSetVersionUpdateBehavior || (TileSet_TileSetVersionUpdateBehavior = {}));
/**
 * @generated from protobuf enum com.apple.geo.protobuf.geo.TileSet.TileSetChecksumType
 */
var TileSet_TileSetChecksumType;
(function (TileSet_TileSetChecksumType) {
    /**
     * @generated from protobuf enum value: CHECKSUM_TYPE_NONE = 0;
     */
    TileSet_TileSetChecksumType[TileSet_TileSetChecksumType["CHECKSUM_TYPE_NONE"] = 0] = "CHECKSUM_TYPE_NONE";
    /**
     * @generated from protobuf enum value: CHECKSUM_TYPE_APPENDED_MD5 = 1;
     */
    TileSet_TileSetChecksumType[TileSet_TileSetChecksumType["CHECKSUM_TYPE_APPENDED_MD5"] = 1] = "CHECKSUM_TYPE_APPENDED_MD5";
})(TileSet_TileSetChecksumType || (TileSet_TileSetChecksumType = {}));
/**
 * @generated from protobuf enum com.apple.geo.protobuf.geo.TileSet.TileRequestStyle
 */
var TileSet_TileRequestStyle;
(function (TileSet_TileRequestStyle) {
    /**
     * @generated from protobuf enum value: REQUEST_STYLE_LEGACY = 0;
     */
    TileSet_TileRequestStyle[TileSet_TileRequestStyle["REQUEST_STYLE_LEGACY"] = 0] = "REQUEST_STYLE_LEGACY";
    /**
     * @generated from protobuf enum value: REQUEST_STYLE_HEADER_PARAMS_VERSION_BASED_HMAC_AUTH = 1;
     */
    TileSet_TileRequestStyle[TileSet_TileRequestStyle["REQUEST_STYLE_HEADER_PARAMS_VERSION_BASED_HMAC_AUTH"] = 1] = "REQUEST_STYLE_HEADER_PARAMS_VERSION_BASED_HMAC_AUTH";
})(TileSet_TileRequestStyle || (TileSet_TileRequestStyle = {}));
/**
 * @generated from protobuf enum com.apple.geo.protobuf.geo.TileSetStyle
 */
var TileSetStyle;
(function (TileSetStyle) {
    /**
     * option allow_alias = true;
     *
     * @generated from protobuf enum value: RASTER_STANDARD = 0;
     */
    TileSetStyle[TileSetStyle["RASTER_STANDARD"] = 0] = "RASTER_STANDARD";
    /**
     * @generated from protobuf enum value: VECTOR_STANDARD = 1;
     */
    TileSetStyle[TileSetStyle["VECTOR_STANDARD"] = 1] = "VECTOR_STANDARD";
    /**
     * @generated from protobuf enum value: VECTOR_TRAFFIC_SEGMENTS_FOR_RASTER = 2;
     */
    TileSetStyle[TileSetStyle["VECTOR_TRAFFIC_SEGMENTS_FOR_RASTER"] = 2] = "VECTOR_TRAFFIC_SEGMENTS_FOR_RASTER";
    /**
     * @generated from protobuf enum value: VECTOR_TRAFFIC_INCIDENTS_FOR_RASTER = 3;
     */
    TileSetStyle[TileSetStyle["VECTOR_TRAFFIC_INCIDENTS_FOR_RASTER"] = 3] = "VECTOR_TRAFFIC_INCIDENTS_FOR_RASTER";
    /**
     * @generated from protobuf enum value: VECTOR_TRAFFIC_SEGMENTS_AND_INCIDENTS_FOR_RASTER = 4;
     */
    TileSetStyle[TileSetStyle["VECTOR_TRAFFIC_SEGMENTS_AND_INCIDENTS_FOR_RASTER"] = 4] = "VECTOR_TRAFFIC_SEGMENTS_AND_INCIDENTS_FOR_RASTER";
    /**
     * @generated from protobuf enum value: RASTER_STANDARD_BACKGROUND = 5;
     */
    TileSetStyle[TileSetStyle["RASTER_STANDARD_BACKGROUND"] = 5] = "RASTER_STANDARD_BACKGROUND";
    /**
     * @generated from protobuf enum value: RASTER_HYBRID = 6;
     */
    TileSetStyle[TileSetStyle["RASTER_HYBRID"] = 6] = "RASTER_HYBRID";
    /**
     * @generated from protobuf enum value: RASTER_SATELLITE = 7;
     */
    TileSetStyle[TileSetStyle["RASTER_SATELLITE"] = 7] = "RASTER_SATELLITE";
    /**
     * @generated from protobuf enum value: RASTER_TERRAIN = 8;
     */
    TileSetStyle[TileSetStyle["RASTER_TERRAIN"] = 8] = "RASTER_TERRAIN";
    /**
     * @generated from protobuf enum value: VECTOR_BUILDINGS = 11;
     */
    TileSetStyle[TileSetStyle["VECTOR_BUILDINGS"] = 11] = "VECTOR_BUILDINGS";
    /**
     * @generated from protobuf enum value: VECTOR_TRAFFIC = 12;
     */
    TileSetStyle[TileSetStyle["VECTOR_TRAFFIC"] = 12] = "VECTOR_TRAFFIC";
    /**
     * @generated from protobuf enum value: VECTOR_POI = 13;
     */
    TileSetStyle[TileSetStyle["VECTOR_POI"] = 13] = "VECTOR_POI";
    /**
     * @generated from protobuf enum value: SPUTNIK_METADATA = 14;
     */
    TileSetStyle[TileSetStyle["SPUTNIK_METADATA"] = 14] = "SPUTNIK_METADATA";
    /**
     * @generated from protobuf enum value: SPUTNIK_C3M = 15;
     */
    TileSetStyle[TileSetStyle["SPUTNIK_C3M"] = 15] = "SPUTNIK_C3M";
    /**
     * @generated from protobuf enum value: SPUTNIK_DSM = 16;
     */
    TileSetStyle[TileSetStyle["SPUTNIK_DSM"] = 16] = "SPUTNIK_DSM";
    /**
     * @generated from protobuf enum value: SPUTNIK_DSM_GLOBAL = 17;
     */
    TileSetStyle[TileSetStyle["SPUTNIK_DSM_GLOBAL"] = 17] = "SPUTNIK_DSM_GLOBAL";
    /**
     * @generated from protobuf enum value: VECTOR_REALISTIC = 18;
     */
    TileSetStyle[TileSetStyle["VECTOR_REALISTIC"] = 18] = "VECTOR_REALISTIC";
    /**
     * @generated from protobuf enum value: VECTOR_LEGACY_REALISTIC = 19;
     */
    TileSetStyle[TileSetStyle["VECTOR_LEGACY_REALISTIC"] = 19] = "VECTOR_LEGACY_REALISTIC";
    /**
     * @generated from protobuf enum value: VECTOR_ROADS = 20;
     */
    TileSetStyle[TileSetStyle["VECTOR_ROADS"] = 20] = "VECTOR_ROADS";
    /**
     * @generated from protobuf enum value: RASTER_VEGETATION = 21;
     */
    TileSetStyle[TileSetStyle["RASTER_VEGETATION"] = 21] = "RASTER_VEGETATION";
    /**
     * @generated from protobuf enum value: VECTOR_TRAFFIC_SKELETON = 22;
     */
    TileSetStyle[TileSetStyle["VECTOR_TRAFFIC_SKELETON"] = 22] = "VECTOR_TRAFFIC_SKELETON";
    /**
     * @generated from protobuf enum value: RASTER_COASTLINE_MASK = 23;
     */
    TileSetStyle[TileSetStyle["RASTER_COASTLINE_MASK"] = 23] = "RASTER_COASTLINE_MASK";
    /**
     * @generated from protobuf enum value: RASTER_HILLSHADE = 24;
     */
    TileSetStyle[TileSetStyle["RASTER_HILLSHADE"] = 24] = "RASTER_HILLSHADE";
    /**
     * @generated from protobuf enum value: VECTOR_TRAFFIC_WITH_GREEN = 25;
     */
    TileSetStyle[TileSetStyle["VECTOR_TRAFFIC_WITH_GREEN"] = 25] = "VECTOR_TRAFFIC_WITH_GREEN";
    /**
     * @generated from protobuf enum value: VECTOR_TRAFFIC_STATIC = 26;
     */
    TileSetStyle[TileSetStyle["VECTOR_TRAFFIC_STATIC"] = 26] = "VECTOR_TRAFFIC_STATIC";
    /**
     * @generated from protobuf enum value: RASTER_COASTLINE_DROP_MASK = 27;
     */
    TileSetStyle[TileSetStyle["RASTER_COASTLINE_DROP_MASK"] = 27] = "RASTER_COASTLINE_DROP_MASK";
    /**
     * @generated from protobuf enum value: VECTOR_TRAFFIC_SKELETON_WITH_HISTORICAL = 28;
     */
    TileSetStyle[TileSetStyle["VECTOR_TRAFFIC_SKELETON_WITH_HISTORICAL"] = 28] = "VECTOR_TRAFFIC_SKELETON_WITH_HISTORICAL";
    /**
     * @generated from protobuf enum value: VECTOR_SPEED_PROFILES = 29;
     */
    TileSetStyle[TileSetStyle["VECTOR_SPEED_PROFILES"] = 29] = "VECTOR_SPEED_PROFILES";
    /**
     * @generated from protobuf enum value: VECTOR_VENUES = 30;
     */
    TileSetStyle[TileSetStyle["VECTOR_VENUES"] = 30] = "VECTOR_VENUES";
    /**
     * @generated from protobuf enum value: RASTER_DOWN_SAMPLED = 31;
     */
    TileSetStyle[TileSetStyle["RASTER_DOWN_SAMPLED"] = 31] = "RASTER_DOWN_SAMPLED";
    /**
     * @generated from protobuf enum value: RASTER_COLOR_BALANCED = 32;
     */
    TileSetStyle[TileSetStyle["RASTER_COLOR_BALANCED"] = 32] = "RASTER_COLOR_BALANCED";
    /**
     * @generated from protobuf enum value: RASTER_SATELLITE_NIGHT = 33;
     */
    TileSetStyle[TileSetStyle["RASTER_SATELLITE_NIGHT"] = 33] = "RASTER_SATELLITE_NIGHT";
    /**
     * @generated from protobuf enum value: SPUTNIK_VECTOR_BORDER = 34;
     */
    TileSetStyle[TileSetStyle["SPUTNIK_VECTOR_BORDER"] = 34] = "SPUTNIK_VECTOR_BORDER";
    /**
     * @generated from protobuf enum value: RASTER_SATELLITE_DIGITIZE = 35;
     */
    TileSetStyle[TileSetStyle["RASTER_SATELLITE_DIGITIZE"] = 35] = "RASTER_SATELLITE_DIGITIZE";
    /**
     * @generated from protobuf enum value: RASTER_HILLSHADE_PARKS = 36;
     */
    TileSetStyle[TileSetStyle["RASTER_HILLSHADE_PARKS"] = 36] = "RASTER_HILLSHADE_PARKS";
    /**
     * @generated from protobuf enum value: VECTOR_TRANSIT = 37;
     */
    TileSetStyle[TileSetStyle["VECTOR_TRANSIT"] = 37] = "VECTOR_TRANSIT";
    /**
     * @generated from protobuf enum value: RASTER_STANDARD_BASE = 38;
     */
    TileSetStyle[TileSetStyle["RASTER_STANDARD_BASE"] = 38] = "RASTER_STANDARD_BASE";
    /**
     * @generated from protobuf enum value: RASTER_STANDARD_LABELS = 39;
     */
    TileSetStyle[TileSetStyle["RASTER_STANDARD_LABELS"] = 39] = "RASTER_STANDARD_LABELS";
    /**
     * @generated from protobuf enum value: RASTER_HYBRID_ROADS = 40;
     */
    TileSetStyle[TileSetStyle["RASTER_HYBRID_ROADS"] = 40] = "RASTER_HYBRID_ROADS";
    /**
     * @generated from protobuf enum value: RASTER_HYBRID_LABELS = 41;
     */
    TileSetStyle[TileSetStyle["RASTER_HYBRID_LABELS"] = 41] = "RASTER_HYBRID_LABELS";
    /**
     * @generated from protobuf enum value: FLYOVER_C3M_MESH = 42;
     */
    TileSetStyle[TileSetStyle["FLYOVER_C3M_MESH"] = 42] = "FLYOVER_C3M_MESH";
    /**
     * @generated from protobuf enum value: FLYOVER_C3M_JPEG_TEXTURE = 43;
     */
    TileSetStyle[TileSetStyle["FLYOVER_C3M_JPEG_TEXTURE"] = 43] = "FLYOVER_C3M_JPEG_TEXTURE";
    /**
     * @generated from protobuf enum value: FLYOVER_C3M_ASTC_TEXTURE = 44;
     */
    TileSetStyle[TileSetStyle["FLYOVER_C3M_ASTC_TEXTURE"] = 44] = "FLYOVER_C3M_ASTC_TEXTURE";
    /**
     * @generated from protobuf enum value: RASTER_SATELLITE_ASTC = 45;
     */
    TileSetStyle[TileSetStyle["RASTER_SATELLITE_ASTC"] = 45] = "RASTER_SATELLITE_ASTC";
    /**
     * @generated from protobuf enum value: RASTER_HYBRID_ROADS_AND_LABELS = 46;
     */
    TileSetStyle[TileSetStyle["RASTER_HYBRID_ROADS_AND_LABELS"] = 46] = "RASTER_HYBRID_ROADS_AND_LABELS";
    /**
     * @generated from protobuf enum value: VECTOR_TRANSIT_SELECTION = 47;
     */
    TileSetStyle[TileSetStyle["VECTOR_TRANSIT_SELECTION"] = 47] = "VECTOR_TRANSIT_SELECTION";
    /**
     * @generated from protobuf enum value: VECTOR_COVERAGE = 48;
     */
    TileSetStyle[TileSetStyle["VECTOR_COVERAGE"] = 48] = "VECTOR_COVERAGE";
    /**
     * @generated from protobuf enum value: FLYOVER_VISIBILITY = 49;
     */
    TileSetStyle[TileSetStyle["FLYOVER_VISIBILITY"] = 49] = "FLYOVER_VISIBILITY";
    /**
     * @generated from protobuf enum value: FLYOVER_SKYBOX = 50;
     */
    TileSetStyle[TileSetStyle["FLYOVER_SKYBOX"] = 50] = "FLYOVER_SKYBOX";
    /**
     * @generated from protobuf enum value: FLYOVER_NAVGRAPH = 51;
     */
    TileSetStyle[TileSetStyle["FLYOVER_NAVGRAPH"] = 51] = "FLYOVER_NAVGRAPH";
    /**
     * @generated from protobuf enum value: FLYOVER_METADATA = 52;
     */
    TileSetStyle[TileSetStyle["FLYOVER_METADATA"] = 52] = "FLYOVER_METADATA";
    /**
     * @generated from protobuf enum value: VECTOR_ROAD_NETWORK = 53;
     */
    TileSetStyle[TileSetStyle["VECTOR_ROAD_NETWORK"] = 53] = "VECTOR_ROAD_NETWORK";
    /**
     * @generated from protobuf enum value: VECTOR_LAND_COVER = 54;
     */
    TileSetStyle[TileSetStyle["VECTOR_LAND_COVER"] = 54] = "VECTOR_LAND_COVER";
    /**
     * @generated from protobuf enum value: VECTOR_DEBUG = 55;
     */
    TileSetStyle[TileSetStyle["VECTOR_DEBUG"] = 55] = "VECTOR_DEBUG";
    /**
     * @generated from protobuf enum value: VECTOR_STREET_POI = 56;
     */
    TileSetStyle[TileSetStyle["VECTOR_STREET_POI"] = 56] = "VECTOR_STREET_POI";
    /**
     * @generated from protobuf enum value: MUNIN_METADATA = 57;
     */
    TileSetStyle[TileSetStyle["MUNIN_METADATA"] = 57] = "MUNIN_METADATA";
    /**
     * @generated from protobuf enum value: VECTOR_SPR_MERCATOR = 58;
     */
    TileSetStyle[TileSetStyle["VECTOR_SPR_MERCATOR"] = 58] = "VECTOR_SPR_MERCATOR";
    /**
     * @generated from protobuf enum value: VECTOR_SPR_MODELS = 59;
     */
    TileSetStyle[TileSetStyle["VECTOR_SPR_MODELS"] = 59] = "VECTOR_SPR_MODELS";
    /**
     * @generated from protobuf enum value: VECTOR_SPR_MATERIALS = 60;
     */
    TileSetStyle[TileSetStyle["VECTOR_SPR_MATERIALS"] = 60] = "VECTOR_SPR_MATERIALS";
    /**
     * @generated from protobuf enum value: VECTOR_SPR_METADATA = 61;
     */
    TileSetStyle[TileSetStyle["VECTOR_SPR_METADATA"] = 61] = "VECTOR_SPR_METADATA";
    /**
     * @generated from protobuf enum value: VECTOR_TRACKS = 62;
     */
    TileSetStyle[TileSetStyle["VECTOR_TRACKS"] = 62] = "VECTOR_TRACKS";
    /**
     * @generated from protobuf enum value: VECTOR_RESERVED_2 = 63;
     */
    TileSetStyle[TileSetStyle["VECTOR_RESERVED_2"] = 63] = "VECTOR_RESERVED_2";
    /**
     * @generated from protobuf enum value: VECTOR_STREET_LANDMARKS = 64;
     */
    TileSetStyle[TileSetStyle["VECTOR_STREET_LANDMARKS"] = 64] = "VECTOR_STREET_LANDMARKS";
    /**
     * @generated from protobuf enum value: COARSE_LOCATION_POLYGONS = 65;
     */
    TileSetStyle[TileSetStyle["COARSE_LOCATION_POLYGONS"] = 65] = "COARSE_LOCATION_POLYGONS";
    /**
     * @generated from protobuf enum value: VECTOR_SPR_ROADS = 66;
     */
    TileSetStyle[TileSetStyle["VECTOR_SPR_ROADS"] = 66] = "VECTOR_SPR_ROADS";
    /**
     * @generated from protobuf enum value: VECTOR_SPR_STANDARD = 67;
     */
    TileSetStyle[TileSetStyle["VECTOR_SPR_STANDARD"] = 67] = "VECTOR_SPR_STANDARD";
    /**
     * @generated from protobuf enum value: VECTOR_POI_V2 = 68;
     */
    TileSetStyle[TileSetStyle["VECTOR_POI_V2"] = 68] = "VECTOR_POI_V2";
    /**
     * @generated from protobuf enum value: VECTOR_POLYGON_SELECTION = 69;
     */
    TileSetStyle[TileSetStyle["VECTOR_POLYGON_SELECTION"] = 69] = "VECTOR_POLYGON_SELECTION";
    /**
     * @generated from protobuf enum value: VL_METADATA = 70;
     */
    TileSetStyle[TileSetStyle["VL_METADATA"] = 70] = "VL_METADATA";
    /**
     * @generated from protobuf enum value: VL_DATA = 71;
     */
    TileSetStyle[TileSetStyle["VL_DATA"] = 71] = "VL_DATA";
    /**
     * @generated from protobuf enum value: PROACTIVE_APP_CLIP = 72;
     */
    TileSetStyle[TileSetStyle["PROACTIVE_APP_CLIP"] = 72] = "PROACTIVE_APP_CLIP";
    /**
     * @generated from protobuf enum value: VECTOR_BUILDINGS_V2 = 73;
     */
    TileSetStyle[TileSetStyle["VECTOR_BUILDINGS_V2"] = 73] = "VECTOR_BUILDINGS_V2";
    /**
     * @generated from protobuf enum value: POI_BUSYNESS = 74;
     */
    TileSetStyle[TileSetStyle["POI_BUSYNESS"] = 74] = "POI_BUSYNESS";
    /**
     * @generated from protobuf enum value: POI_DP_BUSYNESS = 75;
     */
    TileSetStyle[TileSetStyle["POI_DP_BUSYNESS"] = 75] = "POI_DP_BUSYNESS";
    /**
     * @generated from protobuf enum value: SMART_INTERFACE_SELECTION = 76;
     */
    TileSetStyle[TileSetStyle["SMART_INTERFACE_SELECTION"] = 76] = "SMART_INTERFACE_SELECTION";
    /**
     * @generated from protobuf enum value: VECTOR_ASSETS = 77;
     */
    TileSetStyle[TileSetStyle["VECTOR_ASSETS"] = 77] = "VECTOR_ASSETS";
    /**
     * @generated from protobuf enum value: SPR_ASSET_METADATA = 78;
     */
    TileSetStyle[TileSetStyle["SPR_ASSET_METADATA"] = 78] = "SPR_ASSET_METADATA";
    /**
     * @generated from protobuf enum value: VECTOR_SPR_POLAR = 79;
     */
    TileSetStyle[TileSetStyle["VECTOR_SPR_POLAR"] = 79] = "VECTOR_SPR_POLAR";
    /**
     * @generated from protobuf enum value: SMART_DATA_MODE = 80;
     */
    TileSetStyle[TileSetStyle["SMART_DATA_MODE"] = 80] = "SMART_DATA_MODE";
    /**
     * @generated from protobuf enum value: CELLULAR_PERFORMANCE_SCORE = 81;
     */
    TileSetStyle[TileSetStyle["CELLULAR_PERFORMANCE_SCORE"] = 81] = "CELLULAR_PERFORMANCE_SCORE";
    /**
     * @generated from protobuf enum value: VECTOR_SPR_MODELS_OCCLUSION = 82;
     */
    TileSetStyle[TileSetStyle["VECTOR_SPR_MODELS_OCCLUSION"] = 82] = "VECTOR_SPR_MODELS_OCCLUSION";
    /**
     * @generated from protobuf enum value: VECTOR_TOPOGRAPHIC = 83;
     */
    TileSetStyle[TileSetStyle["VECTOR_TOPOGRAPHIC"] = 83] = "VECTOR_TOPOGRAPHIC";
    /**
     * @generated from protobuf enum value: VECTOR_POI_V2_UPDATE = 84;
     */
    TileSetStyle[TileSetStyle["VECTOR_POI_V2_UPDATE"] = 84] = "VECTOR_POI_V2_UPDATE";
    /**
     * @generated from protobuf enum value: VECTOR_LIVE_DATA_UPDATES = 85;
     */
    TileSetStyle[TileSetStyle["VECTOR_LIVE_DATA_UPDATES"] = 85] = "VECTOR_LIVE_DATA_UPDATES";
    /**
     * @generated from protobuf enum value: VECTOR_TRAFFIC_V2 = 86;
     */
    TileSetStyle[TileSetStyle["VECTOR_TRAFFIC_V2"] = 86] = "VECTOR_TRAFFIC_V2";
    /**
     * @generated from protobuf enum value: VECTOR_ROAD_SELECTION = 87;
     */
    TileSetStyle[TileSetStyle["VECTOR_ROAD_SELECTION"] = 87] = "VECTOR_ROAD_SELECTION";
    /**
     * @generated from protobuf enum value: VECTOR_REGION_METADATA = 88;
     */
    TileSetStyle[TileSetStyle["VECTOR_REGION_METADATA"] = 88] = "VECTOR_REGION_METADATA";
    /**
     * @generated from protobuf enum value: RAY_TRACING = 89;
     */
    TileSetStyle[TileSetStyle["RAY_TRACING"] = 89] = "RAY_TRACING";
    /**
     * @generated from protobuf enum value: VECTOR_CONTOURS = 90;
     */
    TileSetStyle[TileSetStyle["VECTOR_CONTOURS"] = 90] = "VECTOR_CONTOURS";
    /**
     * @generated from protobuf enum value: RASTER_SATELLITE_POLAR = 91;
     */
    TileSetStyle[TileSetStyle["RASTER_SATELLITE_POLAR"] = 91] = "RASTER_SATELLITE_POLAR";
    /**
     * @generated from protobuf enum value: VMAP4_ELEVATION = 92;
     */
    TileSetStyle[TileSetStyle["VMAP4_ELEVATION"] = 92] = "VMAP4_ELEVATION";
    /**
     * @generated from protobuf enum value: VMAP4_ELEVATION_POLAR = 93;
     */
    TileSetStyle[TileSetStyle["VMAP4_ELEVATION_POLAR"] = 93] = "VMAP4_ELEVATION_POLAR";
    /**
     * @generated from protobuf enum value: CELLULAR_COVERAGE_PLMN = 94;
     */
    TileSetStyle[TileSetStyle["CELLULAR_COVERAGE_PLMN"] = 94] = "CELLULAR_COVERAGE_PLMN";
    /**
     * @generated from protobuf enum value: RASTER_SATELLITE_POLAR_NIGHT = 95;
     */
    TileSetStyle[TileSetStyle["RASTER_SATELLITE_POLAR_NIGHT"] = 95] = "RASTER_SATELLITE_POLAR_NIGHT";
    /**
     * @generated from protobuf enum value: UNUSED_96 = 96;
     */
    TileSetStyle[TileSetStyle["UNUSED_96"] = 96] = "UNUSED_96";
    /**
     * @generated from protobuf enum value: UNUSED_97 = 97;
     */
    TileSetStyle[TileSetStyle["UNUSED_97"] = 97] = "UNUSED_97";
    /**
     * @generated from protobuf enum value: UNUSED_98 = 98;
     */
    TileSetStyle[TileSetStyle["UNUSED_98"] = 98] = "UNUSED_98";
    /**
     * DAVINCI_DEV1 = 58;
     * DAVINCI_DEV2 = 59;
     * DAVINCI_DEV3 = 60;
     * DAVINCI_DEV4 = 61;
     * DAVINCI_DEV6 = 63;
     * DAVINCI_DEV7 = 66;
     * DAVINCI_DEV8 = 67;
     * DAVINCI_DEV9 = 68;
     * DAVINCI_BUILDINGS = 73;
     * VECTOR_RESERVED_1 = 62;
     *
     * @generated from protobuf enum value: UNUSED_99 = 99;
     */
    TileSetStyle[TileSetStyle["UNUSED_99"] = 99] = "UNUSED_99";
})(TileSetStyle || (TileSetStyle = {}));
/**
 * @generated from protobuf enum com.apple.geo.protobuf.geo.TileScale
 */
var TileScale;
(function (TileScale) {
    /**
     * @generated from protobuf enum value: NODPI = 0;
     */
    TileScale[TileScale["NODPI"] = 0] = "NODPI";
    /**
     * @generated from protobuf enum value: LODPI = 1;
     */
    TileScale[TileScale["LODPI"] = 1] = "LODPI";
    /**
     * @generated from protobuf enum value: HIDPI = 2;
     */
    TileScale[TileScale["HIDPI"] = 2] = "HIDPI";
})(TileScale || (TileScale = {}));
/**
 * @generated from protobuf enum com.apple.geo.protobuf.geo.TileSize
 */
var TileSize;
(function (TileSize) {
    /**
     * @generated from protobuf enum value: PX128 = 0;
     */
    TileSize[TileSize["PX128"] = 0] = "PX128";
    /**
     * @generated from protobuf enum value: PX256 = 1;
     */
    TileSize[TileSize["PX256"] = 1] = "PX256";
    /**
     * @generated from protobuf enum value: PX512 = 2;
     */
    TileSize[TileSize["PX512"] = 2] = "PX512";
})(TileSize || (TileSize = {}));
/**
 * @generated from protobuf enum com.apple.geo.protobuf.geo.GenericTileType
 */
var GenericTileType;
(function (GenericTileType) {
    /**
     * @generated from protobuf enum value: UNKNOWN = 0;
     */
    GenericTileType[GenericTileType["UNKNOWN"] = 0] = "UNKNOWN";
    /**
     * @generated from protobuf enum value: WATER = 1;
     */
    GenericTileType[GenericTileType["WATER"] = 1] = "WATER";
    /**
     * @generated from protobuf enum value: NO_TILE = 2;
     */
    GenericTileType[GenericTileType["NO_TILE"] = 2] = "NO_TILE";
})(GenericTileType || (GenericTileType = {}));
// @generated message type with reflection information, may provide speed optimized methods
class GenericTile$Type extends MessageType {
    constructor() {
        super("com.apple.geo.protobuf.geo.GenericTile", [
            { no: 1, name: "tileType", kind: "enum", opt: true, T: () => ["com.apple.geo.protobuf.geo.GenericTileType", GenericTileType] },
            { no: 2, name: "textureIndex", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ },
            { no: 3, name: "resourceIndex", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* optional com.apple.geo.protobuf.geo.GenericTileType tileType */ 1:
                    message.tileType = reader.int32();
                    break;
                case /* optional uint32 textureIndex */ 2:
                    message.textureIndex = reader.uint32();
                    break;
                case /* optional uint32 resourceIndex */ 3:
                    message.resourceIndex = reader.uint32();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* optional com.apple.geo.protobuf.geo.GenericTileType tileType = 1; */
        if (message.tileType !== undefined)
            writer.tag(1, WireType.Varint).int32(message.tileType);
        /* optional uint32 textureIndex = 2; */
        if (message.textureIndex !== undefined)
            writer.tag(2, WireType.Varint).uint32(message.textureIndex);
        /* optional uint32 resourceIndex = 3; */
        if (message.resourceIndex !== undefined)
            writer.tag(3, WireType.Varint).uint32(message.resourceIndex);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.GenericTile
 */
const GenericTile = new GenericTile$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TileSetRegion$Type extends MessageType {
    constructor() {
        super("com.apple.geo.protobuf.geo.TileSetRegion", [
            { no: 1, name: "minX", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
            { no: 2, name: "minY", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
            { no: 3, name: "maxX", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
            { no: 4, name: "maxY", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
            { no: 5, name: "minZ", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
            { no: 6, name: "maxZ", kind: "scalar", T: 13 /*ScalarType.UINT32*/ }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.minX = 0;
        message.minY = 0;
        message.maxX = 0;
        message.maxY = 0;
        message.minZ = 0;
        message.maxZ = 0;
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* uint32 minX */ 1:
                    message.minX = reader.uint32();
                    break;
                case /* uint32 minY */ 2:
                    message.minY = reader.uint32();
                    break;
                case /* uint32 maxX */ 3:
                    message.maxX = reader.uint32();
                    break;
                case /* uint32 maxY */ 4:
                    message.maxY = reader.uint32();
                    break;
                case /* uint32 minZ */ 5:
                    message.minZ = reader.uint32();
                    break;
                case /* uint32 maxZ */ 6:
                    message.maxZ = reader.uint32();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* uint32 minX = 1; */
        if (message.minX !== 0)
            writer.tag(1, WireType.Varint).uint32(message.minX);
        /* uint32 minY = 2; */
        if (message.minY !== 0)
            writer.tag(2, WireType.Varint).uint32(message.minY);
        /* uint32 maxX = 3; */
        if (message.maxX !== 0)
            writer.tag(3, WireType.Varint).uint32(message.maxX);
        /* uint32 maxY = 4; */
        if (message.maxY !== 0)
            writer.tag(4, WireType.Varint).uint32(message.maxY);
        /* uint32 minZ = 5; */
        if (message.minZ !== 0)
            writer.tag(5, WireType.Varint).uint32(message.minZ);
        /* uint32 maxZ = 6; */
        if (message.maxZ !== 0)
            writer.tag(6, WireType.Varint).uint32(message.maxZ);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.TileSetRegion
 */
const TileSetRegion = new TileSetRegion$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TileSetVersion$Type extends MessageType {
    constructor() {
        super("com.apple.geo.protobuf.geo.TileSetVersion", [
            { no: 1, name: "identifier", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
            { no: 2, name: "availableTiles", kind: "message", repeat: 2 /*RepeatType.UNPACKED*/, T: () => TileSetRegion },
            { no: 3, name: "timeToLiveSeconds", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ },
            { no: 4, name: "genericTile", kind: "message", repeat: 2 /*RepeatType.UNPACKED*/, T: () => GenericTile },
            { no: 5, name: "supportedLanguagesVersion", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.identifier = 0;
        message.availableTiles = [];
        message.genericTile = [];
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* uint32 identifier */ 1:
                    message.identifier = reader.uint32();
                    break;
                case /* repeated com.apple.geo.protobuf.geo.TileSetRegion availableTiles */ 2:
                    message.availableTiles.push(TileSetRegion.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* optional uint32 timeToLiveSeconds */ 3:
                    message.timeToLiveSeconds = reader.uint32();
                    break;
                case /* repeated com.apple.geo.protobuf.geo.GenericTile genericTile */ 4:
                    message.genericTile.push(GenericTile.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* optional uint32 supportedLanguagesVersion */ 5:
                    message.supportedLanguagesVersion = reader.uint32();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* uint32 identifier = 1; */
        if (message.identifier !== 0)
            writer.tag(1, WireType.Varint).uint32(message.identifier);
        /* repeated com.apple.geo.protobuf.geo.TileSetRegion availableTiles = 2; */
        for (let i = 0; i < message.availableTiles.length; i++)
            TileSetRegion.internalBinaryWrite(message.availableTiles[i], writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        /* optional uint32 timeToLiveSeconds = 3; */
        if (message.timeToLiveSeconds !== undefined)
            writer.tag(3, WireType.Varint).uint32(message.timeToLiveSeconds);
        /* repeated com.apple.geo.protobuf.geo.GenericTile genericTile = 4; */
        for (let i = 0; i < message.genericTile.length; i++)
            GenericTile.internalBinaryWrite(message.genericTile[i], writer.tag(4, WireType.LengthDelimited).fork(), options).join();
        /* optional uint32 supportedLanguagesVersion = 5; */
        if (message.supportedLanguagesVersion !== undefined)
            writer.tag(5, WireType.Varint).uint32(message.supportedLanguagesVersion);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.TileSetVersion
 */
const TileSetVersion = new TileSetVersion$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TileSet$Type extends MessageType {
    constructor() {
        super("com.apple.geo.protobuf.geo.TileSet", [
            { no: 1, name: "baseURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "multiTileURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "style", kind: "enum", T: () => ["com.apple.geo.protobuf.geo.TileSetStyle", TileSetStyle] },
            { no: 5, name: "validVersion", kind: "message", repeat: 2 /*RepeatType.UNPACKED*/, T: () => TileSetVersion },
            { no: 6, name: "scale", kind: "enum", T: () => ["com.apple.geo.protobuf.geo.TileScale", TileScale] },
            { no: 7, name: "size", kind: "enum", T: () => ["com.apple.geo.protobuf.geo.TileSize", TileSize] },
            { no: 9, name: "localizationURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 10, name: "supportedLanguage", kind: "message", repeat: 2 /*RepeatType.UNPACKED*/, T: () => TileSet_Language },
            { no: 11, name: "multiTileURLUsesStatusCodes", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
            { no: 12, name: "updateBehavior", kind: "enum", opt: true, T: () => ["com.apple.geo.protobuf.geo.TileSet.TileSetVersionUpdateBehavior", TileSet_TileSetVersionUpdateBehavior] },
            { no: 13, name: "countryRegionWhitelist", kind: "message", repeat: 2 /*RepeatType.UNPACKED*/, T: () => TileSet_CountryRegionTuple },
            { no: 14, name: "checksumType", kind: "enum", opt: true, T: () => ["com.apple.geo.protobuf.geo.TileSet.TileSetChecksumType", TileSet_TileSetChecksumType] },
            { no: 15, name: "dataSet", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ },
            { no: 16, name: "requestStyle", kind: "enum", opt: true, T: () => ["com.apple.geo.protobuf.geo.TileSet.TileRequestStyle", TileSet_TileRequestStyle] },
            { no: 17, name: "useAuthProxy", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
            { no: 18, name: "supportsMultipathTCP", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
            { no: 19, name: "alternativeMultipathTCPPort", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ },
            { no: 20, name: "deviceSKUWhitelist", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.style = 0;
        message.validVersion = [];
        message.scale = 0;
        message.size = 0;
        message.supportedLanguage = [];
        message.countryRegionWhitelist = [];
        message.deviceSKUWhitelist = [];
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* optional string baseURL */ 1:
                    message.baseURL = reader.string();
                    break;
                case /* optional string multiTileURL */ 2:
                    message.multiTileURL = reader.string();
                    break;
                case /* com.apple.geo.protobuf.geo.TileSetStyle style */ 3:
                    message.style = reader.int32();
                    break;
                case /* repeated com.apple.geo.protobuf.geo.TileSetVersion validVersion */ 5:
                    message.validVersion.push(TileSetVersion.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* com.apple.geo.protobuf.geo.TileScale scale */ 6:
                    message.scale = reader.int32();
                    break;
                case /* com.apple.geo.protobuf.geo.TileSize size */ 7:
                    message.size = reader.int32();
                    break;
                case /* optional string localizationURL */ 9:
                    message.localizationURL = reader.string();
                    break;
                case /* repeated com.apple.geo.protobuf.geo.TileSet.Language supportedLanguage */ 10:
                    message.supportedLanguage.push(TileSet_Language.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* optional bool multiTileURLUsesStatusCodes */ 11:
                    message.multiTileURLUsesStatusCodes = reader.bool();
                    break;
                case /* optional com.apple.geo.protobuf.geo.TileSet.TileSetVersionUpdateBehavior updateBehavior */ 12:
                    message.updateBehavior = reader.int32();
                    break;
                case /* repeated com.apple.geo.protobuf.geo.TileSet.CountryRegionTuple countryRegionWhitelist */ 13:
                    message.countryRegionWhitelist.push(TileSet_CountryRegionTuple.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* optional com.apple.geo.protobuf.geo.TileSet.TileSetChecksumType checksumType */ 14:
                    message.checksumType = reader.int32();
                    break;
                case /* optional uint32 dataSet */ 15:
                    message.dataSet = reader.uint32();
                    break;
                case /* optional com.apple.geo.protobuf.geo.TileSet.TileRequestStyle requestStyle */ 16:
                    message.requestStyle = reader.int32();
                    break;
                case /* optional bool useAuthProxy */ 17:
                    message.useAuthProxy = reader.bool();
                    break;
                case /* optional bool supportsMultipathTCP */ 18:
                    message.supportsMultipathTCP = reader.bool();
                    break;
                case /* optional uint32 alternativeMultipathTCPPort */ 19:
                    message.alternativeMultipathTCPPort = reader.uint32();
                    break;
                case /* repeated string deviceSKUWhitelist */ 20:
                    message.deviceSKUWhitelist.push(reader.string());
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* optional string baseURL = 1; */
        if (message.baseURL !== undefined)
            writer.tag(1, WireType.LengthDelimited).string(message.baseURL);
        /* optional string multiTileURL = 2; */
        if (message.multiTileURL !== undefined)
            writer.tag(2, WireType.LengthDelimited).string(message.multiTileURL);
        /* com.apple.geo.protobuf.geo.TileSetStyle style = 3; */
        if (message.style !== 0)
            writer.tag(3, WireType.Varint).int32(message.style);
        /* repeated com.apple.geo.protobuf.geo.TileSetVersion validVersion = 5; */
        for (let i = 0; i < message.validVersion.length; i++)
            TileSetVersion.internalBinaryWrite(message.validVersion[i], writer.tag(5, WireType.LengthDelimited).fork(), options).join();
        /* com.apple.geo.protobuf.geo.TileScale scale = 6; */
        if (message.scale !== 0)
            writer.tag(6, WireType.Varint).int32(message.scale);
        /* com.apple.geo.protobuf.geo.TileSize size = 7; */
        if (message.size !== 0)
            writer.tag(7, WireType.Varint).int32(message.size);
        /* optional string localizationURL = 9; */
        if (message.localizationURL !== undefined)
            writer.tag(9, WireType.LengthDelimited).string(message.localizationURL);
        /* repeated com.apple.geo.protobuf.geo.TileSet.Language supportedLanguage = 10; */
        for (let i = 0; i < message.supportedLanguage.length; i++)
            TileSet_Language.internalBinaryWrite(message.supportedLanguage[i], writer.tag(10, WireType.LengthDelimited).fork(), options).join();
        /* optional bool multiTileURLUsesStatusCodes = 11; */
        if (message.multiTileURLUsesStatusCodes !== undefined)
            writer.tag(11, WireType.Varint).bool(message.multiTileURLUsesStatusCodes);
        /* optional com.apple.geo.protobuf.geo.TileSet.TileSetVersionUpdateBehavior updateBehavior = 12; */
        if (message.updateBehavior !== undefined)
            writer.tag(12, WireType.Varint).int32(message.updateBehavior);
        /* repeated com.apple.geo.protobuf.geo.TileSet.CountryRegionTuple countryRegionWhitelist = 13; */
        for (let i = 0; i < message.countryRegionWhitelist.length; i++)
            TileSet_CountryRegionTuple.internalBinaryWrite(message.countryRegionWhitelist[i], writer.tag(13, WireType.LengthDelimited).fork(), options).join();
        /* optional com.apple.geo.protobuf.geo.TileSet.TileSetChecksumType checksumType = 14; */
        if (message.checksumType !== undefined)
            writer.tag(14, WireType.Varint).int32(message.checksumType);
        /* optional uint32 dataSet = 15; */
        if (message.dataSet !== undefined)
            writer.tag(15, WireType.Varint).uint32(message.dataSet);
        /* optional com.apple.geo.protobuf.geo.TileSet.TileRequestStyle requestStyle = 16; */
        if (message.requestStyle !== undefined)
            writer.tag(16, WireType.Varint).int32(message.requestStyle);
        /* optional bool useAuthProxy = 17; */
        if (message.useAuthProxy !== undefined)
            writer.tag(17, WireType.Varint).bool(message.useAuthProxy);
        /* optional bool supportsMultipathTCP = 18; */
        if (message.supportsMultipathTCP !== undefined)
            writer.tag(18, WireType.Varint).bool(message.supportsMultipathTCP);
        /* optional uint32 alternativeMultipathTCPPort = 19; */
        if (message.alternativeMultipathTCPPort !== undefined)
            writer.tag(19, WireType.Varint).uint32(message.alternativeMultipathTCPPort);
        /* repeated string deviceSKUWhitelist = 20; */
        for (let i = 0; i < message.deviceSKUWhitelist.length; i++)
            writer.tag(20, WireType.LengthDelimited).string(message.deviceSKUWhitelist[i]);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.TileSet
 */
const TileSet = new TileSet$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TileSet_Language$Type extends MessageType {
    constructor() {
        super("com.apple.geo.protobuf.geo.TileSet.Language", [
            { no: 1, name: "identifier", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
            { no: 2, name: "language", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.identifier = 0;
        message.language = [];
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* uint32 identifier */ 1:
                    message.identifier = reader.uint32();
                    break;
                case /* repeated string language */ 2:
                    message.language.push(reader.string());
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* uint32 identifier = 1; */
        if (message.identifier !== 0)
            writer.tag(1, WireType.Varint).uint32(message.identifier);
        /* repeated string language = 2; */
        for (let i = 0; i < message.language.length; i++)
            writer.tag(2, WireType.LengthDelimited).string(message.language[i]);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.TileSet.Language
 */
const TileSet_Language = new TileSet_Language$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TileSet_CountryRegionTuple$Type extends MessageType {
    constructor() {
        super("com.apple.geo.protobuf.geo.TileSet.CountryRegionTuple", [
            { no: 1, name: "countryCode", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "region", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* optional string countryCode */ 1:
                    message.countryCode = reader.string();
                    break;
                case /* optional string region */ 2:
                    message.region = reader.string();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* optional string countryCode = 1; */
        if (message.countryCode !== undefined)
            writer.tag(1, WireType.LengthDelimited).string(message.countryCode);
        /* optional string region = 2; */
        if (message.region !== undefined)
            writer.tag(2, WireType.LengthDelimited).string(message.region);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.TileSet.CountryRegionTuple
 */
const TileSet_CountryRegionTuple = new TileSet_CountryRegionTuple$Type();
// @generated message type with reflection information, may provide speed optimized methods
class SupportedTileSets$Type extends MessageType {
    constructor() {
        super("com.apple.geo.protobuf.geo.SupportedTileSets", [
            { no: 1, name: "SupportedTileSets", kind: "message", jsonName: "SupportedTileSets", repeat: 2 /*RepeatType.UNPACKED*/, T: () => TileSet }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.supportedTileSets = [];
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* repeated com.apple.geo.protobuf.geo.TileSet SupportedTileSets = 1 [json_name = "SupportedTileSets"];*/ 1:
                    message.supportedTileSets.push(TileSet.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* repeated com.apple.geo.protobuf.geo.TileSet SupportedTileSets = 1 [json_name = "SupportedTileSets"]; */
        for (let i = 0; i < message.supportedTileSets.length; i++)
            TileSet.internalBinaryWrite(message.supportedTileSets[i], writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.SupportedTileSets
 */
new SupportedTileSets$Type();

// @generated by protobuf-ts 2.9.4 with parameter generate_dependencies,long_type_number,keep_enum_prefix,output_javascript
// @generated from protobuf file "GEOResourceManifestDownload.proto" (package "com.apple.geo.protobuf.geo", syntax proto3)
// tslint:disable
// @generated by protobuf-ts 2.9.4 with parameter generate_dependencies,long_type_number,keep_enum_prefix,output_javascript
// @generated from protobuf file "GEOResourceManifestDownload.proto" (package "com.apple.geo.protobuf.geo", syntax proto3)
// tslint:disable
/**
 * @generated from protobuf enum com.apple.geo.protobuf.geo.ResourceFilter.Scale
 */
var ResourceFilter_Scale;
(function (ResourceFilter_Scale) {
    /**
     * @generated from protobuf enum value: RESOURCE_FILTER_SCALE_UNKNOWN = 0;
     */
    ResourceFilter_Scale[ResourceFilter_Scale["RESOURCE_FILTER_SCALE_UNKNOWN"] = 0] = "RESOURCE_FILTER_SCALE_UNKNOWN";
    /**
     * @generated from protobuf enum value: RESOURCE_FILTER_SCALE_1X = 1;
     */
    ResourceFilter_Scale[ResourceFilter_Scale["RESOURCE_FILTER_SCALE_1X"] = 1] = "RESOURCE_FILTER_SCALE_1X";
    /**
     * @generated from protobuf enum value: RESOURCE_FILTER_SCALE_2X = 2;
     */
    ResourceFilter_Scale[ResourceFilter_Scale["RESOURCE_FILTER_SCALE_2X"] = 2] = "RESOURCE_FILTER_SCALE_2X";
    /**
     * @generated from protobuf enum value: RESOURCE_FILTER_SCALE_3X = 3;
     */
    ResourceFilter_Scale[ResourceFilter_Scale["RESOURCE_FILTER_SCALE_3X"] = 3] = "RESOURCE_FILTER_SCALE_3X";
})(ResourceFilter_Scale || (ResourceFilter_Scale = {}));
/**
 * @generated from protobuf enum com.apple.geo.protobuf.geo.ResourceFilter.Scenario
 */
var ResourceFilter_Scenario;
(function (ResourceFilter_Scenario) {
    /**
     * @generated from protobuf enum value: RESOURCE_FILTER_SCENARIO_UNKNOWN = 0;
     */
    ResourceFilter_Scenario[ResourceFilter_Scenario["RESOURCE_FILTER_SCENARIO_UNKNOWN"] = 0] = "RESOURCE_FILTER_SCENARIO_UNKNOWN";
    /**
     * @generated from protobuf enum value: RESOURCE_FILTER_SCENARIO_CARPLAY = 1;
     */
    ResourceFilter_Scenario[ResourceFilter_Scenario["RESOURCE_FILTER_SCENARIO_CARPLAY"] = 1] = "RESOURCE_FILTER_SCENARIO_CARPLAY";
    /**
     * @generated from protobuf enum value: RESOURCE_FILTER_SCENARIO_NAVIGATION = 2;
     */
    ResourceFilter_Scenario[ResourceFilter_Scenario["RESOURCE_FILTER_SCENARIO_NAVIGATION"] = 2] = "RESOURCE_FILTER_SCENARIO_NAVIGATION";
    /**
     * @generated from protobuf enum value: RESOURCE_FILTER_SCENARIO_HIGHVISIBILITY = 3;
     */
    ResourceFilter_Scenario[ResourceFilter_Scenario["RESOURCE_FILTER_SCENARIO_HIGHVISIBILITY"] = 3] = "RESOURCE_FILTER_SCENARIO_HIGHVISIBILITY";
    /**
     * @generated from protobuf enum value: RESOURCE_FILTER_SCENARIO_EXPLICIT = 4;
     */
    ResourceFilter_Scenario[ResourceFilter_Scenario["RESOURCE_FILTER_SCENARIO_EXPLICIT"] = 4] = "RESOURCE_FILTER_SCENARIO_EXPLICIT";
})(ResourceFilter_Scenario || (ResourceFilter_Scenario = {}));
/**
 * @generated from protobuf enum com.apple.geo.protobuf.geo.Resource.ResourceType
 */
var Resource_ResourceType;
(function (Resource_ResourceType) {
    /**
     * @generated from protobuf enum value: RESOURCE_TYPE_STYLESHEET = 0;
     */
    Resource_ResourceType[Resource_ResourceType["RESOURCE_TYPE_STYLESHEET"] = 0] = "RESOURCE_TYPE_STYLESHEET";
    /**
     * @generated from protobuf enum value: RESOURCE_TYPE_TEXTURE = 1;
     */
    Resource_ResourceType[Resource_ResourceType["RESOURCE_TYPE_TEXTURE"] = 1] = "RESOURCE_TYPE_TEXTURE";
    /**
     * @generated from protobuf enum value: RESOURCE_TYPE_FONT = 2;
     */
    Resource_ResourceType[Resource_ResourceType["RESOURCE_TYPE_FONT"] = 2] = "RESOURCE_TYPE_FONT";
    /**
     * @generated from protobuf enum value: RESOURCE_TYPE_ICON = 3;
     */
    Resource_ResourceType[Resource_ResourceType["RESOURCE_TYPE_ICON"] = 3] = "RESOURCE_TYPE_ICON";
    /**
     * @generated from protobuf enum value: RESOURCE_TYPE_XML = 4;
     */
    Resource_ResourceType[Resource_ResourceType["RESOURCE_TYPE_XML"] = 4] = "RESOURCE_TYPE_XML";
    /**
     * @generated from protobuf enum value: RESOURCE_TYPE_ATTRIBUTION_LOGO = 5;
     */
    Resource_ResourceType[Resource_ResourceType["RESOURCE_TYPE_ATTRIBUTION_LOGO"] = 5] = "RESOURCE_TYPE_ATTRIBUTION_LOGO";
    /**
     * @generated from protobuf enum value: RESOURCE_TYPE_ATTRIBUTION_BADGE = 6;
     */
    Resource_ResourceType[Resource_ResourceType["RESOURCE_TYPE_ATTRIBUTION_BADGE"] = 6] = "RESOURCE_TYPE_ATTRIBUTION_BADGE";
    /**
     * @generated from protobuf enum value: RESOURCE_TYPE_OTHER = 7;
     */
    Resource_ResourceType[Resource_ResourceType["RESOURCE_TYPE_OTHER"] = 7] = "RESOURCE_TYPE_OTHER";
})(Resource_ResourceType || (Resource_ResourceType = {}));
/**
 * @generated from protobuf enum com.apple.geo.protobuf.geo.Resource.ConnectionType
 */
var Resource_ConnectionType;
(function (Resource_ConnectionType) {
    /**
     * @generated from protobuf enum value: RESOURCE_DOWNLOAD_CONNECTION_TYPE_UNKNOWN = 0;
     */
    Resource_ConnectionType[Resource_ConnectionType["RESOURCE_DOWNLOAD_CONNECTION_TYPE_UNKNOWN"] = 0] = "RESOURCE_DOWNLOAD_CONNECTION_TYPE_UNKNOWN";
    /**
     * @generated from protobuf enum value: RESOURCE_DOWNLOAD_CONNECTION_TYPE_CELLULAR = 1;
     */
    Resource_ConnectionType[Resource_ConnectionType["RESOURCE_DOWNLOAD_CONNECTION_TYPE_CELLULAR"] = 1] = "RESOURCE_DOWNLOAD_CONNECTION_TYPE_CELLULAR";
    /**
     * @generated from protobuf enum value: RESOURCE_DOWNLOAD_CONNECTION_TYPE_PREFER_WIFI = 2;
     */
    Resource_ConnectionType[Resource_ConnectionType["RESOURCE_DOWNLOAD_CONNECTION_TYPE_PREFER_WIFI"] = 2] = "RESOURCE_DOWNLOAD_CONNECTION_TYPE_PREFER_WIFI";
    /**
     * @generated from protobuf enum value: RESOURCE_DOWNLOAD_CONNECTION_TYPE_WIFI_ONLY = 3;
     */
    Resource_ConnectionType[Resource_ConnectionType["RESOURCE_DOWNLOAD_CONNECTION_TYPE_WIFI_ONLY"] = 3] = "RESOURCE_DOWNLOAD_CONNECTION_TYPE_WIFI_ONLY";
})(Resource_ConnectionType || (Resource_ConnectionType = {}));
/**
 * @generated from protobuf enum com.apple.geo.protobuf.geo.Resource.ValidationMethod
 */
var Resource_ValidationMethod;
(function (Resource_ValidationMethod) {
    /**
     * @generated from protobuf enum value: SHA1 = 0;
     */
    Resource_ValidationMethod[Resource_ValidationMethod["SHA1"] = 0] = "SHA1";
    /**
     * @generated from protobuf enum value: CMS = 1;
     */
    Resource_ValidationMethod[Resource_ValidationMethod["CMS"] = 1] = "CMS";
})(Resource_ValidationMethod || (Resource_ValidationMethod = {}));
/**
 * @generated from protobuf enum com.apple.geo.protobuf.geo.Resource.UpdateMethod
 */
var Resource_UpdateMethod;
(function (Resource_UpdateMethod) {
    /**
     * @generated from protobuf enum value: VERSIONED = 0;
     */
    Resource_UpdateMethod[Resource_UpdateMethod["VERSIONED"] = 0] = "VERSIONED";
    /**
     * @generated from protobuf enum value: ETAG = 1;
     */
    Resource_UpdateMethod[Resource_UpdateMethod["ETAG"] = 1] = "ETAG";
})(Resource_UpdateMethod || (Resource_UpdateMethod = {}));
// @generated message type with reflection information, may provide speed optimized methods
class RegionalResource$Type extends MessageType {
    constructor() {
        super("com.apple.geo.protobuf.geo.RegionalResource", [
            { no: 1, name: "x", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
            { no: 2, name: "y", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
            { no: 3, name: "z", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
            { no: 4, name: "icon", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 6, name: "attribution", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Attribution },
            { no: 7, name: "iconChecksum", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 29, name: "tileRange", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => TileSetRegion },
            { no: 30, name: "validSubManifestVersion", kind: "scalar", repeat: 1 /*RepeatType.PACKED*/, T: 13 /*ScalarType.UINT32*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.RegionalResource
 */
const RegionalResource = new RegionalResource$Type();
// @generated message type with reflection information, may provide speed optimized methods
class RegionalResourceIndex$Type extends MessageType {
    constructor() {
        super("com.apple.geo.protobuf.geo.RegionalResourceIndex", []);
    }
}
/**
 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.RegionalResourceIndex
 */
const RegionalResourceIndex = new RegionalResourceIndex$Type();
// @generated message type with reflection information, may provide speed optimized methods
class RegionalResourceTile$Type extends MessageType {
    constructor() {
        super("com.apple.geo.protobuf.geo.RegionalResourceTile", []);
    }
}
/**
 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.RegionalResourceTile
 */
new RegionalResourceTile$Type();
// @generated message type with reflection information, may provide speed optimized methods
class RegionalResourceRegion$Type extends MessageType {
    constructor() {
        super("com.apple.geo.protobuf.geo.RegionalResourceRegion", []);
    }
}
/**
 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.RegionalResourceRegion
 */
new RegionalResourceRegion$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TileGroup$Type extends MessageType {
    constructor() {
        super("com.apple.geo.protobuf.geo.TileGroup", [
            { no: 1, name: "identifier", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
            { no: 2, name: "tileSet", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => TileGroup_VersionedTileSet },
            { no: 3, name: "styleSheetIndex", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 13 /*ScalarType.UINT32*/ },
            { no: 4, name: "textureIndex", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 13 /*ScalarType.UINT32*/ },
            { no: 5, name: "fontIndex", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 13 /*ScalarType.UINT32*/ },
            { no: 6, name: "iconIndex", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 13 /*ScalarType.UINT32*/ },
            { no: 7, name: "regionalResourceIndex", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => RegionalResourceIndex },
            { no: 8, name: "xmlIndex", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 13 /*ScalarType.UINT32*/ },
            { no: 10, name: "attributionIndex", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 13 /*ScalarType.UINT32*/ },
            { no: 11, name: "hybridUnavailableRegion", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => TileSetRegion },
            { no: 12, name: "resourceIndex", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 13 /*ScalarType.UINT32*/ },
            { no: 14, name: "muninVersion", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
            { no: 15, name: "offlineMetadataIndex", kind: "scalar", T: 13 /*ScalarType.UINT32*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.TileGroup
 */
const TileGroup = new TileGroup$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TileGroup_VersionedTileSet$Type extends MessageType {
    constructor() {
        super("com.apple.geo.protobuf.geo.TileGroup.VersionedTileSet", [
            { no: 1, name: "tileSetIndex", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
            { no: 2, name: "identifier", kind: "scalar", T: 13 /*ScalarType.UINT32*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.TileGroup.VersionedTileSet
 */
const TileGroup_VersionedTileSet = new TileGroup_VersionedTileSet$Type();
// @generated message type with reflection information, may provide speed optimized methods
class ResourceFilter$Type extends MessageType {
    constructor() {
        super("com.apple.geo.protobuf.geo.ResourceFilter", [
            { no: 1, name: "scale", kind: "enum", repeat: 1 /*RepeatType.PACKED*/, T: () => ["com.apple.geo.protobuf.geo.ResourceFilter.Scale", ResourceFilter_Scale] },
            { no: 2, name: "scenario", kind: "enum", repeat: 1 /*RepeatType.PACKED*/, T: () => ["com.apple.geo.protobuf.geo.ResourceFilter.Scenario", ResourceFilter_Scenario] }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.ResourceFilter
 */
const ResourceFilter = new ResourceFilter$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Resource$Type extends MessageType {
    constructor() {
        super("com.apple.geo.protobuf.geo.Resource", [
            { no: 1, name: "resourceType", kind: "enum", T: () => ["com.apple.geo.protobuf.geo.Resource.ResourceType", Resource_ResourceType] },
            { no: 2, name: "filename", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "checksum", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 4, name: "region", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => TileSetRegion },
            { no: 5, name: "filter", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => ResourceFilter },
            { no: 6, name: "connectionType", kind: "enum", opt: true, T: () => ["com.apple.geo.protobuf.geo.Resource.ConnectionType", Resource_ConnectionType] },
            { no: 7, name: "preferWiFiAllowedStaleThreshold", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ },
            { no: 8, name: "validationMethod", kind: "enum", T: () => ["com.apple.geo.protobuf.geo.Resource.ValidationMethod", Resource_ValidationMethod] },
            { no: 9, name: "alternateResourceURLIndex", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ },
            { no: 10, name: "updateMethod", kind: "enum", T: () => ["com.apple.geo.protobuf.geo.Resource.UpdateMethod", Resource_UpdateMethod] },
            { no: 11, name: "timeToLiveSeconds", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.Resource
 */
const Resource = new Resource$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Attribution$Type extends MessageType {
    constructor() {
        super("com.apple.geo.protobuf.geo.Attribution", [
            { no: 1, name: "badge", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "logo", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "url", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 5, name: "badgeChecksum", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 6, name: "logoChecksum", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 7, name: "resource", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Resource },
            { no: 8, name: "region", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => TileSetRegion },
            { no: 9, name: "dataSet", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ },
            { no: 10, name: "linkDisplayStringIndex", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ },
            { no: 11, name: "plainTextURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 12, name: "plainTextURLSHA256Checksum", kind: "scalar", opt: true, T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.Attribution
 */
const Attribution = new Attribution$Type();
// @generated message type with reflection information, may provide speed optimized methods
class ServiceVersion$Type extends MessageType {
    constructor() {
        super("com.apple.geo.protobuf.geo.ServiceVersion", [
            { no: 1, name: "versionDomain", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "minimumVersion", kind: "scalar", T: 13 /*ScalarType.UINT32*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.ServiceVersion
 */
const ServiceVersion = new ServiceVersion$Type();
// @generated message type with reflection information, may provide speed optimized methods
class VersionManifest$Type extends MessageType {
    constructor() {
        super("com.apple.geo.protobuf.geo.VersionManifest", [
            { no: 1, name: "serviceVersion", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => ServiceVersion }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.VersionManifest
 */
const VersionManifest = new VersionManifest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class DataSetDescription$Type extends MessageType {
    constructor() {
        super("com.apple.geo.protobuf.geo.DataSetDescription", [
            { no: 1, name: "identifier", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
            { no: 2, name: "dataSetDescription", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.DataSetDescription
 */
const DataSetDescription = new DataSetDescription$Type();
// @generated message type with reflection information, may provide speed optimized methods
class DataSetURLOverride$Type extends MessageType {
    constructor() {
        super("com.apple.geo.protobuf.geo.DataSetURLOverride", []);
    }
}
/**
 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.DataSetURLOverride
 */
const DataSetURLOverride = new DataSetURLOverride$Type();
// @generated message type with reflection information, may provide speed optimized methods
class MuninVersion$Type extends MessageType {
    constructor() {
        super("com.apple.geo.protobuf.geo.MuninVersion", []);
    }
}
/**
 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.MuninVersion
 */
const MuninVersion = new MuninVersion$Type();
// @generated message type with reflection information, may provide speed optimized methods
class URLInfo$Type extends MessageType {
    constructor() {
        super("com.apple.geo.protobuf.geo.URLInfo", [
            { no: 1, name: "url", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "useAuthProxy", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
            { no: 3, name: "supportsMultipathTCP", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
            { no: 4, name: "alternativeMultipathTCPPort", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.URLInfo
 */
const URLInfo = new URLInfo$Type();
// @generated message type with reflection information, may provide speed optimized methods
class URLInfoSet$Type extends MessageType {
    constructor() {
        super("com.apple.geo.protobuf.geo.URLInfoSet", [
            { no: 1, name: "dataSet", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ },
            { no: 2, name: "resourcesURL", kind: "message", T: () => URLInfo },
            { no: 3, name: "searchAttributionManifestURL", kind: "message", T: () => URLInfo },
            { no: 4, name: "directionsURL", kind: "message", T: () => URLInfo },
            { no: 5, name: "etaURL", kind: "message", T: () => URLInfo },
            { no: 6, name: "batchReverseGeocoderURL", kind: "message", T: () => URLInfo },
            { no: 7, name: "simpleETAURL", kind: "message", T: () => URLInfo },
            { no: 8, name: "addressCorrectionInitURL", kind: "message", T: () => URLInfo },
            { no: 9, name: "addressCorrectionUpdateURL", kind: "message", T: () => URLInfo },
            { no: 10, name: "polyLocationShiftURL", kind: "message", T: () => URLInfo },
            { no: 11, name: "problemSubmissionURL", kind: "message", T: () => URLInfo },
            { no: 12, name: "problemStatusURL", kind: "message", T: () => URLInfo },
            { no: 13, name: "reverseGeocoderVersionsURL", kind: "message", T: () => URLInfo },
            { no: 14, name: "problemCategoriesURL", kind: "message", T: () => URLInfo },
            { no: 15, name: "announcementsURL", kind: "message", T: () => URLInfo },
            { no: 16, name: "dispatcherURL", kind: "message", T: () => URLInfo },
            { no: 17, name: "problemOptInURL", kind: "message", T: () => URLInfo },
            { no: 18, name: "abExperimentURL", kind: "message", T: () => URLInfo },
            { no: 19, name: "businessPortalBaseURL", kind: "message", T: () => URLInfo },
            { no: 20, name: "logMessageUsageURL", kind: "message", T: () => URLInfo },
            { no: 21, name: "spatialLookupURL", kind: "message", T: () => URLInfo },
            { no: 22, name: "realtimeTrafficProbeURL", kind: "message", T: () => URLInfo },
            { no: 23, name: "batchTrafficProbeURL", kind: "message", T: () => URLInfo },
            { no: 24, name: "proactiveRoutingURL", kind: "message", T: () => URLInfo },
            { no: 25, name: "logMessageUsageV3URL", kind: "message", T: () => URLInfo },
            { no: 26, name: "backgroundDispatcherURL", kind: "message", T: () => URLInfo },
            { no: 27, name: "bluePOIDispatcherURL", kind: "message", T: () => URLInfo },
            { no: 28, name: "backgroundRevGeoURL", kind: "message", T: () => URLInfo },
            { no: 29, name: "wifiConnectionQualityProbeURL", kind: "message", T: () => URLInfo },
            { no: 30, name: "muninBaseURL", kind: "message", T: () => URLInfo },
            { no: 31, name: "authProxyURL", kind: "message", T: () => URLInfo },
            { no: 32, name: "wifiQualityURL", kind: "message", T: () => URLInfo },
            { no: 33, name: "feedbackSubmissionURL", kind: "message", T: () => URLInfo },
            { no: 34, name: "feedbackLookupURL", kind: "message", T: () => URLInfo },
            { no: 35, name: "junctionImageServiceURL", kind: "message", T: () => URLInfo },
            { no: 36, name: "analyticsCohortSessionURL", kind: "message", T: () => URLInfo },
            { no: 37, name: "analyticsLongSessionURL", kind: "message", T: () => URLInfo },
            { no: 38, name: "analyticsShortSessionURL", kind: "message", T: () => URLInfo },
            { no: 39, name: "analyticsSessionlessURL", kind: "message", T: () => URLInfo },
            { no: 40, name: "webModuleBaseURL", kind: "message", T: () => URLInfo },
            { no: 41, name: "wifiQualityTileURL", kind: "message", T: () => URLInfo },
            { no: 42, name: "alternateResourcesURL", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => URLInfo },
            { no: 43, name: "tokenAuthenticationURL", kind: "message", T: () => URLInfo },
            { no: 44, name: "authenticatedClientFeatureFlagURL", kind: "message", T: () => URLInfo },
            { no: 45, name: "addressCorrectionTaggedLocationURL", kind: "message", T: () => URLInfo },
            { no: 46, name: "proactiveAppClipURL", kind: "message", T: () => URLInfo },
            { no: 47, name: "enrichmentSubmissionURL", kind: "message", T: () => URLInfo },
            { no: 48, name: "ugcLogDiscardURL", kind: "message", T: () => URLInfo },
            { no: 49, name: "batchReverseGeocoderPlaceRequestURL", kind: "message", T: () => URLInfo },
            { no: 50, name: "pressureProbeDataURL", kind: "message", T: () => URLInfo },
            { no: 51, name: "poiBusynessActivityCollectionURL", kind: "message", T: () => URLInfo },
            { no: 52, name: "rapWebBundleURL", kind: "message", T: () => URLInfo },
            { no: 53, name: "networkSelectionHarvestURL", kind: "message", T: () => URLInfo },
            { no: 54, name: "offlineDataBatchListURL", kind: "message", T: () => URLInfo },
            { no: 55, name: "offlineDataSizeURL", kind: "message", T: () => URLInfo },
            { no: 56, name: "offlineDataDownloadBaseURL", kind: "message", T: () => URLInfo },
            { no: 57, name: "bcxDispatcherURL", kind: "message", T: () => URLInfo }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.URLInfoSet
 */
const URLInfoSet = new URLInfoSet$Type();
// @generated message type with reflection information, may provide speed optimized methods
class MuninBucket$Type extends MessageType {
    constructor() {
        super("com.apple.geo.protobuf.geo.MuninBucket", [
            { no: 3, name: "bucketID", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
            { no: 4, name: "bucketURL", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 5, name: "lodLevel", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.MuninBucket
 */
const MuninBucket = new MuninBucket$Type();
// @generated message type with reflection information, may provide speed optimized methods
class DisplayString$Type extends MessageType {
    constructor() {
        super("com.apple.geo.protobuf.geo.DisplayString", [
            { no: 1, name: "localizedString", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => LocalizedString }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.DisplayString
 */
const DisplayString = new DisplayString$Type();
// @generated message type with reflection information, may provide speed optimized methods
class LocalizedString$Type extends MessageType {
    constructor() {
        super("com.apple.geo.protobuf.geo.LocalizedString", [
            { no: 1, name: "locale", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "stringValue", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.LocalizedString
 */
const LocalizedString = new LocalizedString$Type();
// @generated message type with reflection information, may provide speed optimized methods
class MapRegion$Type extends MessageType {
    constructor() {
        super("com.apple.geo.protobuf.geo.MapRegion", []);
    }
}
/**
 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.MapRegion
 */
const MapRegion = new MapRegion$Type();
// @generated message type with reflection information, may provide speed optimized methods
class OfflineMetadata$Type extends MessageType {
    constructor() {
        super("com.apple.geo.protobuf.geo.OfflineMetadata", [
            { no: 1, name: "dataVersion", kind: "scalar", T: 4 /*ScalarType.UINT64*/, L: 2 /*LongType.NUMBER*/ },
            { no: 2, name: "regulatoryRegionId", kind: "scalar", T: 13 /*ScalarType.UINT32*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.OfflineMetadata
 */
const OfflineMetadata = new OfflineMetadata$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Resources$Type extends MessageType {
    constructor() {
        super("com.apple.geo.protobuf.geo.Resources", [
            { no: 1, name: "tileGroup", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => TileGroup },
            { no: 2, name: "tileSet", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => TileSet },
            { no: 3, name: "styleSheet", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "texture", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 5, name: "font", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 6, name: "icon", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 8, name: "regionalResource", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => RegionalResource },
            { no: 9, name: "xml", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 11, name: "attribution", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Attribution },
            { no: 30, name: "authToken", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 31, name: "resourcesURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 32, name: "searchURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 33, name: "searchAttributionManifestURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 34, name: "autocompleteURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 35, name: "reverseGeocoderURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 36, name: "forwardGeocoderURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 37, name: "directionsURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 38, name: "etaURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 39, name: "locationShiftURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 40, name: "releaseInfo", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 41, name: "batchReverseGeocoderURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 42, name: "mapMatchURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 43, name: "simpleETAURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 44, name: "styleSheetChecksum", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 45, name: "textureChecksum", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 46, name: "fontChecksum", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 47, name: "iconChecksum", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 48, name: "xmlChecksum", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 49, name: "addressCorrectionInitURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 50, name: "addressCorrectionUpdateURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 51, name: "polyLocationShiftURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 52, name: "problemSubmissionURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 53, name: "problemStatusURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 54, name: "reverseGeocoderVersionsURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 55, name: "problemCategoriesURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 56, name: "usageURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 58, name: "businessCallerIDURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 59, name: "problemNotificationAvailabilityURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 61, name: "announcementsURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 62, name: "announcementsSupportedLanguage", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 63, name: "businessNameResolutionURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 64, name: "dispatcherURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 65, name: "problemOptInURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 66, name: "versionManifest", kind: "message", T: () => VersionManifest },
            { no: 67, name: "abExperimentURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 68, name: "businessPortalBaseURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 69, name: "logMessageUsageURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 70, name: "locationShiftEnabledRegion", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => MapRegion },
            { no: 71, name: "locationShiftVersion", kind: "scalar", opt: true, T: 13 /*ScalarType.UINT32*/ },
            { no: 72, name: "resource", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Resource },
            { no: 73, name: "spatialLookupURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 74, name: "dataSet", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => DataSetDescription },
            { no: 75, name: "dataSetURLOverride", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => DataSetURLOverride },
            { no: 77, name: "realtimeTrafficProbeURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 78, name: "batchTrafficProbeURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 79, name: "proactiveRoutingURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 80, name: "logMessageUsageV3URL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 81, name: "backgroundDispatcherURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 82, name: "bluePOIDispatcherURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 83, name: "backgroundRevGeoURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 85, name: "wifiConnectionQualityProbeURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 88, name: "muninBaseURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 89, name: "muninVersion", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => MuninVersion },
            { no: 91, name: "authProxyURL", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 92, name: "urlInfoSet", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => URLInfoSet },
            { no: 93, name: "muninBucket", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => MuninBucket },
            { no: 94, name: "displayString", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => DisplayString },
            { no: 95, name: "offlineMetadata", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => OfflineMetadata }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.Resources
 */
const Resources = new Resources$Type();
// @generated message type with reflection information, may provide speed optimized methods
class ResourceManifestDownload$Type extends MessageType {
    constructor() {
        super("com.apple.geo.protobuf.geo.ResourceManifestDownload", [
            { no: 1, name: "resources", kind: "message", T: () => Resources }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message com.apple.geo.protobuf.geo.ResourceManifestDownload
 */
new ResourceManifestDownload$Type();

class GEOResourceManifestDownload {
    static Name = "GEOResourceManifestDownload";
    static Version = "1.0.9";
	static Author = "Virgil Clyne";
    static decode(rawBody = new Uint8Array([])) {
        log("☑️ GEOResourceManifestDownload.decode", "");
        const body = Resources.fromBinary(rawBody);
        if (typeof body.tileSet !== "undefined") body.tileSet = body.tileSet.map((tile) => {
            if (typeof tile.style !== "undefined") tile.style = TileSetStyle[tile.style];
            if (typeof tile.validVersion !== "undefined") tile.validVersion = tile.validVersion.map(version => {
                if (typeof version.genericTile !== "undefined") version.genericTile = version.genericTile.map(genericTile => {
                    if (typeof genericTile.tileType !== "undefined") genericTile.tileType = GenericTileType[genericTile.tileType];
                    return genericTile;
                });
                return version;
            });
            if (typeof tile.scale !== "undefined") tile.scale = TileScale[tile.scale];
            if (typeof tile.size !== "undefined") tile.size = TileSize[tile.size];
            if (typeof tile.updateBehavior !== "undefined") tile.updateBehavior = TileSet_TileSetVersionUpdateBehavior[tile.updateBehavior];
            if (typeof tile.checksumType !== "undefined") tile.checksumType = TileSet_TileSetChecksumType[tile.checksumType];
            if (typeof tile.requestStyle !== "undefined") tile.requestStyle = TileSet_TileRequestStyle[tile.requestStyle];
            return tile;
        });
        if (typeof body.attribution !== "undefined") body.attribution = body.attribution.map(attribution => {
            if (typeof attribution.resource !== "undefined") attribution.resource = attribution.resource.map(resource => {
                if (typeof resource.resourceType !== "undefined") resource.resourceType = Resource_ResourceType[resource.resourceType];
                if (typeof resource.filter !== "undefined") resource.filter = resource.filter.map(filter => {
                    if (typeof filter.scale !== "undefined") filter.scale = filter.scale.map(scale => ResourceFilter_Scale[scale]);
                    if (typeof filter.scenario !== "undefined") filter.scenario = filter.scenario.map(scenario => ResourceFilter_Scenario[scenario]);
                    return filter;
                });
                if (typeof resource.connectionType !== "undefined") resource.connectionType = Resource_ConnectionType[resource.connectionType];
                if (typeof resource.validationMethod !== "undefined") resource.validationMethod = Resource_ValidationMethod[resource.validationMethod];
                if (typeof resource.updateMethod !== "undefined") resource.updateMethod = Resource_UpdateMethod[resource.updateMethod];
                return resource;
            });
            return attribution;
        });
        if (typeof body.resource !== "undefined") body.resource = body.resource.map(resource => {
            if (typeof resource.resourceType !== "undefined") resource.resourceType = Resource_ResourceType[resource.resourceType];
            if (typeof resource.filter !== "undefined") resource.filter = resource.filter.map(filter => {
                if (typeof filter.scale !== "undefined") filter.scale = filter.scale.map(scale => ResourceFilter_Scale[scale]);
                if (typeof filter.scenario !== "undefined") filter.scenario = filter.scenario.map(scenario => ResourceFilter_Scenario[scenario]);
                return filter;
            });
            if (typeof resource.connectionType !== "undefined") resource.connectionType = Resource_ConnectionType[resource.connectionType];
            if (typeof resource.validationMethod !== "undefined") resource.validationMethod = Resource_ValidationMethod[resource.validationMethod];
            if (typeof resource.updateMethod !== "undefined") resource.updateMethod = Resource_UpdateMethod[resource.updateMethod];
            return resource;
        });
        log("✅ GEOResourceManifestDownload.decode", "");
        return body;
    };

    static encode(body = {}) {
        log("☑️ GEOResourceManifestDownload.encode", "");
        if (typeof body.tileSet !== "undefined") body.tileSet = body.tileSet.map((tile) => {
            if (typeof tile.style !== "undefined") tile.style = TileSetStyle[tile.style];
            if (typeof tile.validVersion !== "undefined") tile.validVersion = tile.validVersion.map(version => {
                if (typeof version.genericTile !== "undefined") version.genericTile = version.genericTile.map(genericTile => {
                    if (typeof genericTile.tileType !== "undefined") genericTile.tileType = GenericTileType[genericTile.tileType];
                    return genericTile;
                });
                return version;
            });
            if (typeof tile.scale !== "undefined") tile.scale = TileScale[tile.scale];
            if (typeof tile.size !== "undefined") tile.size = TileSize[tile.size];
            if (typeof tile.updateBehavior !== "undefined") tile.updateBehavior = TileSet_TileSetVersionUpdateBehavior[tile.updateBehavior];
            if (typeof tile.checksumType !== "undefined") tile.checksumType = TileSet_TileSetChecksumType[tile.checksumType];
            if (typeof tile.requestStyle !== "undefined") tile.requestStyle = TileSet_TileRequestStyle[tile.requestStyle];
            return tile;
        });
        if (typeof body.attribution !== "undefined") body.attribution = body.attribution.map(attribution => {
            if (typeof attribution.resource !== "undefined") attribution.resource = attribution.resource.map(resource => {
                if (typeof resource.resourceType !== "undefined") resource.resourceType = Resource_ResourceType[resource.resourceType];
                if (typeof resource.filter !== "undefined") resource.filter = resource.filter.map(filter => {
                    if (typeof filter.scale !== "undefined") filter.scale = filter.scale.map(scale => ResourceFilter_Scale[scale]);
                    if (typeof filter.scenario !== "undefined") filter.scenario = filter.scenario.map(scenario => ResourceFilter_Scenario[scenario]);
                    return filter;
                });
                if (typeof resource.connectionType !== "undefined") resource.connectionType = Resource_ConnectionType[resource.connectionType];
                if (typeof resource.validationMethod !== "undefined") resource.validationMethod = Resource_ValidationMethod[resource.validationMethod];
                if (typeof resource.updateMethod !== "undefined") resource.updateMethod = Resource_UpdateMethod[resource.updateMethod];
                return resource;
            });
            return attribution;
        });
        if (typeof body.resource !== "undefined") body.resource = body.resource.map(resource => {
            if (typeof resource.resourceType !== "undefined") resource.resourceType = Resource_ResourceType[resource.resourceType];
            if (typeof resource.filter !== "undefined") resource.filter = resource.filter.map(filter => {
                if (typeof filter.scale !== "undefined") filter.scale = filter.scale.map(scale => ResourceFilter_Scale[scale]);
                if (typeof filter.scenario !== "undefined") filter.scenario = filter.scenario.map(scenario => ResourceFilter_Scenario[scenario]);
                return filter;
            });
            if (typeof resource.connectionType !== "undefined") resource.connectionType = Resource_ConnectionType[resource.connectionType];
            if (typeof resource.validationMethod !== "undefined") resource.validationMethod = Resource_ValidationMethod[resource.validationMethod];
            if (typeof resource.updateMethod !== "undefined") resource.updateMethod = Resource_UpdateMethod[resource.updateMethod];
            return resource;
        });
        const rawBody = Resources.toBinary(body);
        log("✅ GEOResourceManifestDownload.encode", "");
        return rawBody;
    };
}

class GEOResourceManifest {
    static Name = "GEOResourceManifest";
    static Version = "1.2.4";
    static Author = "Virgil Clyne";

    static async downloadResourceManifest(request = $request, countryCode = "CN") {
        log(`☑️ Download ResourceManifest`, "");
        const newRequest = { ...request };
        newRequest.url = new URL(newRequest.url);
        newRequest.url.searchParams.set("country_code", countryCode);
        newRequest.url = newRequest.url.toString();
        newRequest["binary-mode"] = true;
        return fetch(newRequest).then(response => {
            let rawBody = ($platform === "Quantumult X") ? new Uint8Array(response.bodyBytes ?? []) : response.body ?? new Uint8Array();
            log(`✅ Download ResourceManifest`, "");
            return { "ETag": response.headers?.["Etag"] ?? response.headers?.["etag"], "body": GEOResourceManifestDownload.decode(rawBody) };
        });
    };

    static cacheResourceManifest(body = {}, cache = {}, countryCode = "CN", ETag = "") {
        log(`☑️ Cache ResourceManifest`, "");
        switch (countryCode) {
            case "CN":
                if (ETag !== cache?.CN?.ETag) {
                    cache.CN = { ...body, ETag };
                    Storage.setItem("@iRingo.Maps.Caches", cache);
                    log(`✅ Cache ResourceManifest`, "");
                }                break;
            case "KR":
                if (ETag !== cache?.KR?.ETag) {
                    cache.KR = { ...body, ETag };
                    Storage.setItem("@iRingo.Maps.Caches", cache);
                    log(`✅ Cache ResourceManifest`, "");
                }                break;
            default:
                if (ETag !== cache?.XX?.ETag) {
                    cache.XX = { ...body, ETag };
                    Storage.setItem("@iRingo.Maps.Caches", cache);
                    log(`✅ Cache ResourceManifest`, "");
                }                break;
        }    };

    static tileSets(tileSet = [], caches = {}, settings = {}, countryCode = "CN") {
        log(`☑️ Set TileSets`, "");
        //let tileNames = [];
        //caches.XX.tileSet.forEach(tile => tileNames.push(tile.style));
        //caches.CN.tileSet.forEach(tile => tileNames.push(tile.style));
        //tileNames = [...new Set(tileNames)];
        // 填补空缺图源
        switch (countryCode) {
            case "CN":
                /*
                // 填补数据组
                caches.CN.tileSet = caches.CN.tileSet.map(tile => {
                    tile.dataSet = 0;
                    return tile;
                });
                */
                caches.XX.tileSet.forEach(tile => {
                    if (!caches.CN.tileSet.some(i => i.style === tile.style)) {
                        log(`⚠️ Missing style: ${tile?.style}`, "");
                        delete tile.dataSet; // 移除数据组
                        tileSet.push(tile);
                    }                });
                break;
            case "KR":
            default:
                caches.CN.tileSet.forEach(tile => {
                    if (!caches.XX.tileSet.some(i => i.style === tile.style)) {
                        log(`⚠️ Missing style: ${tile?.style}`, "");
                        tile.dataSet = 0; // 填补数据组
                        tileSet.push(tile);
                    }                });
                break;
        }        // 按需更改图源
        tileSet = tileSet.map((tile, index) => {
            switch (tile.style) {
                case "VECTOR_STANDARD": // 1 标准地图
                case "RASTER_TERRAIN": // 8 地貌与地势（绿地/城市/水体/山地不同颜色的区域）
                case "VECTOR_BUILDINGS": // 11 建筑模型（3D/白模）
                case "VECTOR_ROADS": // 20 道路（卫星地图:显示标签）
                case "VECTOR_VENUES": // 30 室内地图
                case "VECTOR_TRANSIT": // 37 公共交通
                case "VECTOR_ROAD_NETWORK": // 53 道路网络
                case "VECTOR_TRANSIT_SELECTION": // 47 公共交通选区?
                case "VECTOR_STREET_LANDMARKS": // 64 街道地标?
                case "VECTOR_BUILDINGS_V2": // 73 建筑模型V2（3D/上色）
                    //log(`⚠️ Basic style: ${tile?.style}`, "");
                    //tile = caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style)) || tile;
                    //log(`⚠️ Basic baseURL: ${tile?.baseURL}`, "");
                    break;
                case "RASTER_SATELLITE": // 7 卫星地图（2D）
                case "RASTER_SATELLITE_NIGHT": // 33 卫星地图（2D/夜间）
                case "RASTER_SATELLITE_DIGITIZE": // 35 卫星地图（2D/数字化）
                case "RASTER_SATELLITE_ASTC": // 45 卫星地图（2D/ASTC）
                case "RASTER_SATELLITE_POLAR": // 91 卫星地图（2D/极地）
                case "RASTER_SATELLITE_POLAR_NIGHT": // 95 卫星地图（2D/极地/夜间）
                    //log(`⚠️ Satellite style: ${tile?.style}`, "");
                    switch (settings.TileSet.Satellite) {
                        case "HYBRID":
                        default:
                            break;
                        case "CN":
                            tile = caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style)) || tile;
                            break;
                        case "XX":
                            tile = caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style)) || tile;
                            break;
                    }                    //log(`⚠️ Satellite baseURL: ${tile?.baseURL}`, "");
                    break;
                case "VECTOR_TRAFFIC_SEGMENTS_FOR_RASTER": // 2 交通状况分段（卫星地图:显示交通状况）?
                case "VECTOR_TRAFFIC_INCIDENTS_FOR_RASTER": // 3 交通状况事件（卫星地图:显示交通状况）?
                case "VECTOR_TRAFFIC_SEGMENTS_AND_INCIDENTS_FOR_RASTER": // 4 交通状况分段和事件（卫星地图:显示交通状况）?
                case "VECTOR_TRAFFIC": // 12 交通状况
                case "VECTOR_TRAFFIC_SKELETON": // 22 交通状况骨架（卫星地图:显示交通状况）
                case "VECTOR_TRAFFIC_WITH_GREEN": // 25 交通状况（卫星地图:显示绿灯）?
                case "VECTOR_TRAFFIC_STATIC": // 26 交通状况静态?
                case "VECTOR_TRAFFIC_SKELETON_WITH_HISTORICAL": // 28 交通状况骨架（卫星地图:显示历史交通状况）?
                case "VECTOR_TRAFFIC_V2": // 86 交通状况V2
                    //log(`⚠️ Traffic style: ${tile?.style}`, "");
                    //tile = caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style)) || tile;
                    /*
                    switch (settings.TileSet.Traffic) {
                        case "HYBRID":
                        default:
                            break;
                        case "CN":
                            tile = caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style)) || tile;
                            break;
                        case "XX":
                            tile = caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style)) || tile;
                            break;
                    };
                    */
                    //log(`⚠️ Traffic baseURL: ${tile?.baseURL}`, "");
                    break;
                case "VECTOR_POI": // 13 兴趣点
                case "VECTOR_STREET_POI": // 56 街道兴趣点
                case "VECTOR_POI_V2": // 68 兴趣点V2
                case "VECTOR_POLYGON_SELECTION": // 69 多边形选区（兴趣点）
                case "POI_BUSYNESS": // 74 兴趣点繁忙程度?
                case "POI_DP_BUSYNESS": // 75 兴趣点DP繁忙程度?
                case "VECTOR_POI_V2_UPDATE": // 84 兴趣点V2更新
                    //log(`⚠️ POI style: ${tile?.style}`, "");
                    //tile = caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style)) || tile;
                    /*
                    switch (settings.TileSet.POI) {
                        case "HYBRID":
                        default:
                            break;
                        case "CN":
                            tile = caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style)) || tile;
                            break;
                        case "XX":
                            tile = caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style)) || tile;
                            break;
                    };
                    */
                    //log(`⚠️ POI baseURL: ${tile?.baseURL}`, "");
                    break;
                case "SPUTNIK_METADATA": // 14 卫星地图（3D/俯瞰）元数据
                case "SPUTNIK_C3M": // 15 卫星地图（3D/俯瞰）C3模型
                case "SPUTNIK_DSM": // 16 卫星地图（3D/俯瞰）数字表面模型
                case "SPUTNIK_DSM_GLOBAL": // 17 卫星地图（3D/俯瞰）全球数字表面模型
                case "SPUTNIK_VECTOR_BORDER": // 34 卫星地图（3D/俯瞰）边界
                case "FLYOVER_C3M_MESH": // 42 俯瞰C3模型（四处看看）?
                case "FLYOVER_C3M_JPEG_TEXTURE": // 43 俯瞰C3模型纹理（四处看看）?
                case "FLYOVER_C3M_ASTC_TEXTURE": // 44 俯瞰C3模型纹理（四处看看）?
                case "FLYOVER_VISIBILITY": // 49 俯瞰可见性（四处看看）?
                case "FLYOVER_SKYBOX": // 50 俯瞰天空盒（四处看看）?
                case "FLYOVER_NAVGRAPH": // 51 俯瞰导航图（四处看看）?
                case "FLYOVER_METADATA": // 52 俯瞰元数据
                    //log(`⚠️ Flyover style: ${tile?.style}`, "");
                    switch (settings.TileSet.Flyover) {
                        case "HYBRID":
                        default:
                            break;
                        case "CN":
                            tile = caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style)) || tile;
                            break;
                        case "XX":
                            tile = caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style)) || tile;
                            break;
                    }                    //log(`⚠️ Flyover baseURL: ${tile?.baseURL}`, "");
                    break;
                case "MUNIN_METADATA": // 57 四处看看 元数据
                case "VECTOR_SPR_MERCATOR": // 58
                case "VECTOR_SPR_MODELS": // 59
                case "VECTOR_SPR_MATERIALS": // 60
                case "VECTOR_SPR_METADATA": // 61
                case "VECTOR_SPR_ROADS": // 66
                case "VECTOR_SPR_STANDARD": // 67
                case "SPR_ASSET_METADATA": // 78?
                case "VECTOR_SPR_POLAR": // 79
                case "VECTOR_SPR_MODELS_OCCLUSION": // 82?
                    //log(`⚠️ Munin style: ${tile?.style}`, "");
                    switch (settings.TileSet.Munin) {
                        case "HYBRID":
                        default:
                            break;
                        case "CN":
                            tile = caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style)) || tile;
                            break;
                        case "XX":
                            tile = caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style)) || tile;
                            break;
                    }                    //log(`⚠️ Munin baseURL: ${tile?.baseURL}`, "");
                    break;
                case "VECTOR_REALISTIC": // 18 逼真地图?
                case "VECTOR_COVERAGE": // 48 覆盖范围?
                case "VECTOR_LAND_COVER": // 54 土地覆盖?
                case "SMART_DATA_MODE": // 80 智能数据模式?
                case "VECTOR_TOPOGRAPHIC": // 83 地形图?
                case "VECTOR_ROAD_SELECTION": // 87 道路选区?
                case "VECTOR_REGION_METADATA": // 88 区域元数据?
                    //log(`⚠️ TEST style: ${tile?.style}`, "");
                    //tile = caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style)) || tile;
                    //log(`⚠️ TEST baseURL: ${tile?.baseURL}`, "");
                    break;
                case "VECTOR_TRACKS": // 62 轨道?
                case "COARSE_LOCATION_POLYGONS": // 65 粗略位置多边形?
                case "VL_METADATA": // 70 VL 元数据?
                case "VL_DATA": // 71 VL 数据?
                case "PROACTIVE_APP_CLIP": // 72 主动式App剪辑?
                case "SMART_INTERFACE_SELECTION": // 76 智能界面选区?
                case "VECTOR_LIVE_DATA_UPDATES": // 85 实时数据更新?
                case "RAY_TRACING": // 89 光线追踪?
                case "VECTOR_CONTOURS": // 90 等高线?
                case "VMAP4_ELEVATION": // 92 VMAP4 高程?
                case "VMAP4_ELEVATION_POLAR": // 93 VMAP4 高程（极地）?
                case "CELLULAR_COVERAGE_PLMN": // 94 蜂窝覆盖 PLMN?
                case "UNUSED_99": // 99 未使用
                default:
                    log(`⚠️ default style: ${tile?.style}`, "");
                    /*
                    switch (countryCode) {
                        case "CN":
                            tile = caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style)) || tile;
                            break;
                        case "KR":
                        default:
                            tile = caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style)) || tile;
                            break;
                    };
                    */
                    log(`⚠️ default baseURL: ${tile?.baseURL}`, "");
                    break;
            }            return tile;
        }).flat(Infinity).filter(Boolean);
        log(`✅ Set TileSets`, "");
        return tileSet;
    };

    static attributions(attributions = [], caches = {}, countryCode = "CN") {
        log(`☑️ Set Attributions`, "");
        switch (countryCode) {
            case "CN":
                caches?.XX?.attribution?.forEach(attribution => {
                    if (!attributions.some(i => i.name === attribution.name)) attributions.unshift(attribution);
                });
                break;
            case "KR":
                caches?.KR?.attribution?.forEach(attribution => {
                    if (!attributions.some(i => i.name === attribution.name)) attributions.unshift(attribution);
                });
                break;
            default:
                caches?.CN?.attribution?.forEach(attribution => {
                    if (!attributions.some(i => i.name === attribution.name)) attributions.push(attribution);
                });
                break;
        }        attributions.sort((a, b) => {
            switch (a.name) {
                case "‎":
                    return -1;
                case "AutoNavi":
                    return 0;
                default:
                    return 1;
            }        });
        attributions = attributions.map((attribution, index) => {
            switch (attribution.name) {
                case "‎":
                    attribution.name = ` iRingo: 📍 GEOResourceManifest\n${new Date()}`;
                    delete attribution.plainTextURLSHA256Checksum;
                    break;
                case "AutoNavi":
                    attribution.resource = attribution.resource.filter(i => i.resourceType !== 6);
                    attribution.region = [
                        { "minX": 214, "minY": 82, "maxX": 216, "maxY": 82, "minZ": 8, "maxZ": 21 },
                        { "minX": 213, "minY": 83, "maxX": 217, "maxY": 83, "minZ": 8, "maxZ": 21 },
                        { "minX": 213, "minY": 84, "maxX": 218, "maxY": 84, "minZ": 8, "maxZ": 21 },
                        { "minX": 213, "minY": 85, "maxX": 218, "maxY": 85, "minZ": 8, "maxZ": 21 },
                        { "minX": 212, "minY": 86, "maxX": 218, "maxY": 86, "minZ": 8, "maxZ": 21 },
                        { "minX": 189, "minY": 87, "maxX": 190, "maxY": 87, "minZ": 8, "maxZ": 21 },
                        { "minX": 210, "minY": 87, "maxX": 220, "maxY": 87, "minZ": 8, "maxZ": 21 },
                        { "minX": 188, "minY": 88, "maxX": 191, "maxY": 88, "minZ": 8, "maxZ": 21 },
                        { "minX": 210, "minY": 88, "maxX": 223, "maxY": 88, "minZ": 8, "maxZ": 21 },
                        { "minX": 188, "minY": 89, "maxX": 192, "maxY": 89, "minZ": 8, "maxZ": 21 },
                        { "minX": 210, "minY": 89, "maxX": 223, "maxY": 89, "minZ": 8, "maxZ": 21 },
                        { "minX": 186, "minY": 90, "maxX": 192, "maxY": 90, "minZ": 8, "maxZ": 21 },
                        { "minX": 210, "minY": 90, "maxX": 223, "maxY": 90, "minZ": 8, "maxZ": 21 },
                        { "minX": 209, "minY": 91, "maxX": 222, "maxY": 91, "minZ": 8, "maxZ": 21 },
                        { "minX": 186, "minY": 91, "maxX": 192, "maxY": 91, "minZ": 8, "maxZ": 21 },
                        { "minX": 184, "minY": 92, "maxX": 195, "maxY": 92, "minZ": 8, "maxZ": 21 },
                        { "minX": 207, "minY": 92, "maxX": 221, "maxY": 92, "minZ": 8, "maxZ": 21 },
                        { "minX": 185, "minY": 93, "maxX": 196, "maxY": 93, "minZ": 8, "maxZ": 21 },
                        { "minX": 206, "minY": 93, "maxX": 221, "maxY": 93, "minZ": 8, "maxZ": 21 },
                        { "minX": 185, "minY": 94, "maxX": 200, "maxY": 94, "minZ": 8, "maxZ": 21 },
                        { "minX": 203, "minY": 94, "maxX": 221, "maxY": 94, "minZ": 8, "maxZ": 21 },
                        { "minX": 182, "minY": 94, "maxX": 219, "maxY": 95, "minZ": 8, "maxZ": 21 },
                        { "minX": 180, "minY": 96, "maxX": 217, "maxY": 96, "minZ": 8, "maxZ": 21 },
                        { "minX": 180, "minY": 97, "maxX": 216, "maxY": 97, "minZ": 8, "maxZ": 21 },
                        { "minX": 180, "minY": 98, "maxX": 214, "maxY": 98, "minZ": 8, "maxZ": 21 },
                        { "minX": 180, "minY": 99, "maxX": 215, "maxY": 99, "minZ": 8, "maxZ": 21 },
                        { "minX": 182, "minY": 100, "maxX": 214, "maxY": 100, "minZ": 8, "maxZ": 21 },
                        { "minX": 183, "minY": 101, "maxX": 213, "maxY": 101, "minZ": 8, "maxZ": 21 },
                        { "minX": 184, "minY": 102, "maxX": 214, "maxY": 102, "minZ": 8, "maxZ": 21 },
                        { "minX": 183, "minY": 103, "maxX": 214, "maxY": 103, "minZ": 8, "maxZ": 21 },
                        { "minX": 184, "minY": 104, "maxX": 215, "maxY": 104, "minZ": 8, "maxZ": 21 },
                        { "minX": 185, "minY": 105, "maxX": 215, "maxY": 105, "minZ": 8, "maxZ": 21 },
                        { "minX": 187, "minY": 106, "maxX": 215, "maxY": 106, "minZ": 8, "maxZ": 21 },
                        { "minX": 189, "minY": 107, "maxX": 193, "maxY": 107, "minZ": 8, "maxZ": 21 },
                        { "minX": 197, "minY": 107, "maxX": 214, "maxY": 107, "minZ": 8, "maxZ": 21 },
                        { "minX": 198, "minY": 108, "maxX": 214, "maxY": 108, "minZ": 8, "maxZ": 21 },
                        { "minX": 110, "minY": 109, "maxX": 214, "maxY": 109, "minZ": 8, "maxZ": 21 },
                        { "minX": 197, "minY": 110, "maxX": 214, "maxY": 110, "minZ": 8, "maxZ": 21 },
                        { "minX": 198, "minY": 111, "maxX": 214, "maxY": 111, "minZ": 8, "maxZ": 21 },
                        { "minX": 204, "minY": 112, "maxX": 209, "maxY": 112, "minZ": 8, "maxZ": 21 },
                        { "minX": 213, "minY": 112, "maxX": 214, "maxY": 112, "minZ": 8, "maxZ": 21 },
                        { "minX": 205, "minY": 113, "maxX": 207, "maxY": 113, "minZ": 8, "maxZ": 21 },
                        { "minX": 205, "minY": 114, "maxX": 206, "maxY": 114, "minZ": 8, "maxZ": 21 },
                        { "minX": 204, "minY": 115, "maxX": 212, "maxY": 128, "minZ": 8, "maxZ": 21 },
                    ];
                    break;
            }            return attribution;
        }).flat(Infinity).filter(Boolean);
        log(`✅ Set Attributions`, "");
        return attributions;
    };

    static resources(resources = [], caches = {}, countryCode = "CN") {
        log(`☑️ Set Resources`, "");
        switch (countryCode) {
            case "CN":
                break;
            case "KR":
            default:
                caches.CN.resource.forEach((resource, index) => {
                    if (resource.filename === "POITypeMapping-CN-1.json") resources.push(resource);
                    if (resource.filename === "POITypeMapping-CN-2.json") resources.push(resource);
                    if (resource.filename === "China.cms-lpr") resources.push(resource);
                });
                break;
        }        return resources;
    };

    static dataSets(dataSets = [], caches = {}, countryCode = "CN") {
        log(`☑️ Set DataSets`, "");
        switch (countryCode) {
            case "CN":
                dataSets = caches?.XX?.dataSet;
                break;
        }        //dataSets.push({ "dataSetDescription": "AutoNavi", "identifier": 10 });
        log(`✅ Set DataSets`, "");
        return dataSets;
    };

    static urlInfoSets(urlInfoSets = [], caches = {}, settings = {}, countryCode = "CN") {
        log(`☑️ Set UrlInfoSets`, "");
        urlInfoSets = urlInfoSets.map((urlInfoSet, index) => {
            switch (countryCode) {
                case "CN":
                    urlInfoSet = { ...caches.XX.urlInfoSet[0], ...caches.CN.urlInfoSet[0] };
                    break;
                case "KR":
                    urlInfoSet = { ...caches.KR.urlInfoSet[0], ...caches.CN.urlInfoSet[0] };
                    break;
                default:
                    urlInfoSet = { ...caches.CN.urlInfoSet[0], ...caches.XX.urlInfoSet[0] };
                    urlInfoSet.alternateResourcesURL = caches.CN.urlInfoSet[0].alternateResourcesURL;
                    delete urlInfoSet.polyLocationShiftURL;
                    break;
            }            switch (settings.Config?.Announcements?.Environment?.default) {
                case "AUTO":
                default:
                    break;
                case "CN":
                    // Announcements
                    urlInfoSet.announcementsURL = caches.CN.urlInfoSet[0].announcementsURL;
                    break;
                case "XX":
                    // Announcements
                    urlInfoSet.announcementsURL = caches.XX.urlInfoSet[0].announcementsURL;
                    break;
            }            switch (settings.UrlInfoSet.Dispatcher) {
                case "AUTO":
                default:
                    break;
                case "AutoNavi":
                    // PlaceData Dispatcher
                    urlInfoSet.directionsURL = caches.CN.urlInfoSet[0].dispatcherURL;
                    // Background Dispatcher
                    urlInfoSet.backgroundDispatcherURL = caches.CN.urlInfoSet[0].backgroundDispatcherURL;
                    // Background Reverse Geocoder
                    urlInfoSet.backgroundRevGeoURL = caches.CN.urlInfoSet[0].backgroundRevGeoURL;
                    // Batch Reverse Geocoder
                    urlInfoSet.batchReverseGeocoderPlaceRequestURL = caches.CN.urlInfoSet[0].batchReverseGeocoderPlaceRequestURL;
                    break;
                case "Apple":
                    // PlaceData Dispatcher
                    urlInfoSet.dispatcherURL = caches.XX.urlInfoSet[0].dispatcherURL;
                    // Background Dispatcher
                    urlInfoSet.backgroundDispatcherURL = caches.XX.urlInfoSet[0].backgroundDispatcherURL;
                    // Background Reverse Geocoder
                    urlInfoSet.backgroundRevGeoURL = caches.XX.urlInfoSet[0].backgroundRevGeoURL;
                    // Batch Reverse Geocoder
                    urlInfoSet.batchReverseGeocoderPlaceRequestURL = caches.XX.urlInfoSet[0].batchReverseGeocoderPlaceRequestURL;
                    break;
            }            switch (settings.UrlInfoSet.Directions) {
                case "AUTO":
                default:
                    break;
                case "AutoNavi":
                    // Directions
                    urlInfoSet.directionsURL = caches.CN.urlInfoSet[0].directionsURL;
                    // ETA
                    urlInfoSet.etaURL = caches.CN.urlInfoSet[0].etaURL;
                    // Simple ETA
                    urlInfoSet.simpleETAURL = caches.CN.urlInfoSet[0].simpleETAURL;
                    break;
                case "Apple":
                    // Directions
                    urlInfoSet.directionsURL = caches.XX.urlInfoSet[0].directionsURL;
                    // ETA
                    urlInfoSet.etaURL = caches.XX.urlInfoSet[0].etaURL;
                    // Simple ETA
                    urlInfoSet.simpleETAURL = caches.XX.urlInfoSet[0].simpleETAURL;
                    break;
            }            switch (settings.UrlInfoSet.RAP) {
                case "AUTO":
                default:
                    // RAP Submission
                    urlInfoSet.problemSubmissionURL = caches.XX.urlInfoSet[0].problemSubmissionURL;
                    // RAP Status
                    urlInfoSet.problemStatusURL = caches.XX.urlInfoSet[0].problemStatusURL;
                    // RAP Opt-Ins
                    urlInfoSet.problemOptInURL = caches.XX.urlInfoSet[0].problemOptInURL;
                    // RAP V4 Submission
                    urlInfoSet.feedbackSubmissionURL = caches.XX.urlInfoSet[0].feedbackSubmissionURL;
                    // RAP V4 Lookup
                    urlInfoSet.feedbackLookupURL = caches.XX.urlInfoSet[0].feedbackLookupURL;
                    break;
                case "AutoNavi":
                    // RAP Submission
                    urlInfoSet.problemSubmissionURL = caches.CN.urlInfoSet[0].problemSubmissionURL;
                    // RAP Status
                    urlInfoSet.problemStatusURL = caches.CN.urlInfoSet[0].problemStatusURL;
                    // RAP V4 Submission
                    urlInfoSet.feedbackSubmissionURL = caches.CN.urlInfoSet[0].feedbackSubmissionURL;
                    // RAP V4 Lookup
                    urlInfoSet.feedbackLookupURL = caches.CN.urlInfoSet[0].feedbackLookupURL;
                    break;
                case "Apple":
                    // RAP Submission
                    urlInfoSet.problemSubmissionURL = caches.XX.urlInfoSet[0].problemSubmissionURL;
                    // RAP Status
                    urlInfoSet.problemStatusURL = caches.XX.urlInfoSet[0].problemStatusURL;
                    // RAP Opt-Ins
                    urlInfoSet.problemOptInURL = caches.XX.urlInfoSet[0].problemOptInURL;
                    // RAP V4 Submission
                    urlInfoSet.feedbackSubmissionURL = caches.XX.urlInfoSet[0].feedbackSubmissionURL;
                    // RAP V4 Lookup
                    urlInfoSet.feedbackLookupURL = caches.XX.urlInfoSet[0].feedbackLookupURL;
                    break;
            }            switch (settings.UrlInfoSet.LocationShift) {
                case "AUTO":
                default:
                    break;
                case "AutoNavi":
                    // Location Shift (polynomial)
                    urlInfoSet.polyLocationShiftURL = caches.CN.urlInfoSet[0].polyLocationShiftURL;
                    break;
                case "Apple":
                    // Location Shift (polynomial)
                    urlInfoSet.polyLocationShiftURL = caches.XX.urlInfoSet[0].polyLocationShiftURL;
                    break;
            }            return urlInfoSet;
        });
        log(`✅ Set UrlInfoSets`, "");
        return urlInfoSets;
    };

    static muninBuckets(muninBuckets = [], caches = {}, settings = {}) {
        log(`☑️ Set MuninBuckets`, "");
        switch (settings.TileSet.Munin) {
            case "AUTO":
            default:
                break;
            case "CN":
                muninBuckets = caches.CN.muninBucket;
                break;
            case "XX":
                muninBuckets = caches.XX.muninBucket;
                break;
        }        log(`✅ Set MuninBuckets`, "");
        return muninBuckets;
    };

    static displayStrings(displayStrings = [], caches = {}, countryCode = "CN") {
        log(`☑️ Set DisplayStrings`, "");
        switch (countryCode) {
            case "CN":
                displayStrings = caches.XX.displayStrings.map((displayString, index) => {
                    return displayString;
                });
                break;
        }        log(`✅ Set DisplayStrings`, "");
        return displayStrings;
    };

    static SetTileGroups(body = {}) {
        log(`☑️ Set TileGroups`, "");
        body.tileGroup = body.tileGroup.map(tileGroup => {
            log(`🚧 tileGroup.identifier: ${tileGroup.identifier}`);
            tileGroup.identifier += Math.floor(Math.random() * 100) + 1;
            log(`🚧 tileGroup.identifier: ${tileGroup.identifier}`);
            tileGroup.tileSet = body.tileSet.map((tileSet, index) => {
                return {
                    "tileSetIndex": index,
                    "identifier": tileSet.validVersion?.[0]?.identifier
                };
            });
            if (body.attribution) tileGroup.attributionIndex = body.attribution.map((attribution, index) => {
                return index;
            });
            if (body.resource) tileGroup.resourceIndex = body.resource.map((resource, index) => {
                return index;
            });
            return tileGroup;
        });
        log(`✅ Set TileGroups`, "");
        return body;
    };


}

log("v4.0.4(1025)");
/***************** Processing *****************/
// 解构URL
const url = new URL($request.url);
log(`⚠ url: ${url.toJSON()}`, "");
// 获取连接参数
const METHOD = $request.method, HOST = url.hostname, PATH = url.pathname;
log(`⚠ METHOD: ${METHOD}, HOST: ${HOST}, PATH: ${PATH}` , "");
// 解析格式
const FORMAT = ($response.headers?.["Content-Type"] ?? $response.headers?.["content-type"])?.split(";")?.[0];
log(`⚠ FORMAT: ${FORMAT}`, "");
!(async () => {
	const { Settings, Caches, Configs } = setENV("iRingo", ["Location", "Maps"], Database$1);
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
					// 主机判断
					switch (HOST) {
						case "gspe1-ssl.ls.apple.com":
							//body = new DOMParser().parseFromString($response.body, FORMAT);
							// 路径判断
							switch (PATH) {
								case "/pep/gcc":
									Lodash.set(Caches, "pep.gcc", $response.body);
									Storage.setItem("@iRingo.Location.Caches", Caches);
									switch (Settings.PEP.GCC) {
										case "AUTO":
											break;
										default:
											$response.body = Settings.PEP.GCC;
											break;
									}									break;
							}							//$repsonse.body = new XMLSerializer().serializeToString(body);
							break;
						case "configuration.ls.apple.com":
							//body = await PLISTs("plist2json", $response.body);
							BigInt.prototype.toJSON = function () { return this.toString() };
							body = XML.parse($response.body);
							log(`🚧 body: ${JSON.stringify(body)}`, "");
							// 路径判断
							switch (PATH) {
								case "/config/defaults":
									const PLIST = body.plist;
									if (PLIST) {
										// CN
										PLIST["com.apple.GEO"].CountryProviders.CN.ShouldEnableLagunaBeach = true; // XX
										PLIST["com.apple.GEO"].CountryProviders.CN.DrivingMultiWaypointRoutesEnabled = true; // 驾驶导航途径点
										//PLIST["com.apple.GEO"].CountryProviders.CN.EnableAlberta = false; // CN
										PLIST["com.apple.GEO"].CountryProviders.CN.EnableClientDrapedVectorPolygons = true; // CN
										PLIST["com.apple.GEO"].CountryProviders.CN.GEOAddressCorrectionEnabled = true; // CN
										delete PLIST["com.apple.GEO"].CountryProviders.CN.GEOBatchSpatialEventLookupMaxParametersCount; // CN
										delete PLIST["com.apple.GEO"].CountryProviders.CN.GEOBatchSpatialPlaceLookupMaxParametersCount; // CN
										PLIST["com.apple.GEO"].CountryProviders.CN.LocalitiesAndLandmarksSupported = true; // CN
										PLIST["com.apple.GEO"].CountryProviders.CN.NavigationShowHeadingKey = true;
										PLIST["com.apple.GEO"].CountryProviders.CN.POIBusynessDifferentialPrivacy = true; // CN
										PLIST["com.apple.GEO"].CountryProviders.CN.POIBusynessRealTime = true; // CN
										PLIST["com.apple.GEO"].CountryProviders.CN.TransitPayEnabled = true; // CN
										//PLIST["com.apple.GEO"].CountryProviders.CN.WiFiQualityNetworkDisabled = Settings?.Config?.Defaults?.WiFiQualityNetworkDisabled ?? true; // CN
										//PLIST["com.apple.GEO"].CountryProviders.CN.WiFiQualityTileDisabled = Settings?.Config?.Defaults?.WiFiQualityTileDisabled ?? true; // CN
										PLIST["com.apple.GEO"].CountryProviders.CN.SupportsOffline = true; // CN
										PLIST["com.apple.GEO"].CountryProviders.CN.SupportsCarIntegration = true; // CN
										// TW
										PLIST["com.apple.GEO"].CountryProviders.CN.GEOShouldSpeakWrittenAddresses = true; // TW
										PLIST["com.apple.GEO"].CountryProviders.CN.GEOShouldSpeakWrittenPlaceNames = true; // TW
										// US
										PLIST["com.apple.GEO"].CountryProviders.CN["6694982d2b14e95815e44e970235e230"] = true; // US
										PLIST["com.apple.GEO"].CountryProviders.CN.PedestrianAREnabled = true; // 现实世界中的线路
										PLIST["com.apple.GEO"].CountryProviders.CN.OpticalHeadingEnabled = true; // 举起以查看
										PLIST["com.apple.GEO"].CountryProviders.CN.UseCLPedestrianMapMatchedLocations = true; // 导航准确性-增强
									}									break;
							}							log(`🚧 body: ${JSON.stringify(body)}`, "");
							//$response.body = await PLISTs("json2plist", body); // json2plist
							$response.body = XML.stringify(body);
							break;
					}					break;
				case "text/vtt":
				case "application/vtt":
					//body = VTT.parse($response.body);
					//log(`🚧 body: ${JSON.stringify(body)}`, "");
					//$response.body = VTT.stringify(body);
					break;
				case "text/json":
				case "application/json":
					body = JSON.parse($response.body ?? "{}");
					log(`🚧 body: ${JSON.stringify(body)}`, "");
					$response.body = JSON.stringify(body);
					break;
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
						case "application/protobuf":
						case "application/x-protobuf":
						case "application/vnd.google.protobuf":
						case "application/octet-stream":
							switch (HOST) {
								case "gspe35-ssl.ls.apple.com":
									switch (PATH) {
										case "/config/announcements":
											break;
										case "/geo_manifest/dynamic/config":
											body = GEOResourceManifestDownload.decode(rawBody);
											//log(`🚧 调试信息`, `body before: ${JSON.stringify(body)}`, "");
											/*
											let UF = UnknownFieldHandler.list(body);
											//log(`🚧 调试信息`, `UF: ${JSON.stringify(UF)}`, "");
											if (UF) {
												UF = UF.map(uf => {
													uf.no; // 22
													uf.wireType; // WireType.Varint
													// use the binary reader to decode the raw data:
													let reader = new BinaryReader(uf.data);
													let addedNumber = reader.int32(); // 7777
													log(`🚧 no: ${uf.no}, wireType: ${uf.wireType}, reader: ${reader}, addedNumber: ${addedNumber}`, "");
												});
											};
											*/
											const CountryCode = url.searchParams.get("country_code");
											$response.headers?.["Etag"] ?? $response.headers?.["etag"];
											switch (CountryCode) {
												case "CN":
													//GEOResourceManifest.cacheResourceManifest(body, Caches, "CN", ETag);
													Caches.CN = body;
													const { ETag: XXETag, body: XXBody } = await GEOResourceManifest.downloadResourceManifest($request, "US");
													Caches.XX = XXBody;
													//GEOResourceManifest.cacheResourceManifest(XXBody, Caches, "XX", XXETag);
													// announcementsSupportedLanguage
													//body.announcementsSupportedLanguage?.push?.("zh-CN");
													//body.announcementsSupportedLanguage?.push?.("zh-TW");
													break;
												case "KR": {
													//GEOResourceManifest.cacheResourceManifest(body, Caches, "KR", ETag);
													Caches.KR = body;
													const { ETag: CNETag, body: CNBody } = await GEOResourceManifest.downloadResourceManifest($request, "CN");
													Caches.CN = CNBody;
													//GEOResourceManifest.cacheResourceManifest(CNBody, Caches, "CN", CNETag);
													break;
												}												default: {
													//GEOResourceManifest.cacheResourceManifest(body, Caches, "XX", ETag);
													Caches.XX = body;
													const { ETag: CNETag, body: CNBody } = await GEOResourceManifest.downloadResourceManifest($request, "CN");
													Caches.CN = CNBody;
													//GEOResourceManifest.cacheResourceManifest(CNBody, Caches, "CN", CNETag);
													break;
												}											}											body.tileSet = GEOResourceManifest.tileSets(body.tileSet, Caches, Settings, CountryCode);
											body.attribution = GEOResourceManifest.attributions(body.attribution, Caches, CountryCode);
											body.resource = GEOResourceManifest.resources(body.resource, Caches, CountryCode);
											//body.dataSet = GEOResourceManifest.dataSets(body.dataSet, Caches, CountryCode);
											body.urlInfoSet = GEOResourceManifest.urlInfoSets(body.urlInfoSet, Caches, Settings, CountryCode);
											body.muninBucket = GEOResourceManifest.muninBuckets(body.muninBucket, Caches, Settings);
											//body.displayString = GEOResourceManifest.displayStrings(body.displayString, Caches, CountryCode);
											// releaseInfo
											//body.releaseInfo = body.releaseInfo.replace(/(\d+\.\d+)/, `$1.${String(Date.now()/1000)}`);
											log(`🚧 releaseInfo: ${body.releaseInfo}`, "");
											body = GEOResourceManifest.SetTileGroups(body);
											//log(`🚧 调试信息`, `body after: ${JSON.stringify(body)}`, "");
											rawBody = GEOResourceManifestDownload.encode(body);
											break;
									}									break;
							}							break;
					}					// 写入二进制数据
					$response.body = rawBody;
					break;
			}			break;
		case false:
			break;
	}})()
	.catch((e) => logError(e))
	.finally(() => done($response));
