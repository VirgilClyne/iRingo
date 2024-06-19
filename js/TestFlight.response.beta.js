/* README: https://github.com/VirgilClyne/iRingo */
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
class $Storage {
	static name = "$Storage";
	static version = "1.0.9";
	static about() { return console.log(`\n🟧 ${this.name} v${this.version}\n`) };
	static data = null
	static dataFile = 'box.dat'
	static #nameRegex = /^@(?<key>[^.]+)(?:\.(?<path>.*))?$/;

	static #platform() {
		if ('undefined' !== typeof $environment && $environment['surge-version'])
			return 'Surge'
		if ('undefined' !== typeof $environment && $environment['stash-version'])
			return 'Stash'
		if ('undefined' !== typeof module && !!module.exports) return 'Node.js'
		if ('undefined' !== typeof $task) return 'Quantumult X'
		if ('undefined' !== typeof $loon) return 'Loon'
		if ('undefined' !== typeof $rocket) return 'Shadowrocket'
		if ('undefined' !== typeof Egern) return 'Egern'
	}

    static getItem(keyName = new String, defaultValue = null) {
        let keyValue = defaultValue;
        // 如果以 @
		switch (keyName.startsWith('@')) {
			case true:
				const { key, path } = keyName.match(this.#nameRegex)?.groups;
				//console.log(`1: ${key}, ${path}`);
				keyName = key;
				let value = this.getItem(keyName, {});
				//console.log(`2: ${JSON.stringify(value)}`)
				if (typeof value !== "object") value = {};
				//console.log(`3: ${JSON.stringify(value)}`)
				keyValue = Lodash.get(value, path);
				//console.log(`4: ${JSON.stringify(keyValue)}`)
				try {
					keyValue = JSON.parse(keyValue);
				} catch (e) {
					// do nothing
				}				//console.log(`5: ${JSON.stringify(keyValue)}`)
				break;
			default:
				switch (this.#platform()) {
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
		//console.log(`0: ${typeof keyValue}`);
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
				//console.log(`1: ${key}, ${path}`);
				keyName = key;
				let value = this.getItem(keyName, {});
				//console.log(`2: ${JSON.stringify(value)}`)
				if (typeof value !== "object") value = {};
				//console.log(`3: ${JSON.stringify(value)}`)
				Lodash.set(value, path, keyValue);
				//console.log(`4: ${JSON.stringify(value)}`)
				result = this.setItem(keyName, value);
				//console.log(`5: ${result}`)
				break;
			default:
				switch (this.#platform()) {
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
				switch (this.#platform()) {
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
		switch (this.#platform()) {
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

class ENV {
	static name = "ENV"
	static version = '1.8.2'
	static about() { return console.log(`\n🟧 ${this.name} v${this.version}\n`) }

	constructor(name, opts) {
		console.log(`\n🟧 ${ENV.name} v${ENV.version}\n`);
		this.name = name;
		this.logs = [];
		this.isMute = false;
		this.isMuteLog = false;
		this.logSeparator = '\n';
		this.encoding = 'utf-8';
		this.startTime = new Date().getTime();
		Object.assign(this, opts);
		this.log(`\n🚩 开始!\n${name}\n`);
	}
	
	environment() {
		switch (this.platform()) {
			case 'Surge':
				$environment.app = 'Surge';
				return $environment
			case 'Stash':
				$environment.app = 'Stash';
				return $environment
			case 'Egern':
				$environment.app = 'Egern';
				return $environment
			case 'Loon':
				let environment = $loon.split(' ');
				return {
					"device": environment[0],
					"ios": environment[1],
					"loon-version": environment[2],
					"app": "Loon"
				};
			case 'Quantumult X':
				return {
					"app": "Quantumult X"
				};
			case 'Node.js':
				process.env.app = 'Node.js';
				return process.env
			default:
				return {}
		}
	}

	platform() {
		if ('undefined' !== typeof $environment && $environment['surge-version'])
			return 'Surge'
		if ('undefined' !== typeof $environment && $environment['stash-version'])
			return 'Stash'
		if ('undefined' !== typeof module && !!module.exports) return 'Node.js'
		if ('undefined' !== typeof $task) return 'Quantumult X'
		if ('undefined' !== typeof $loon) return 'Loon'
		if ('undefined' !== typeof $rocket) return 'Shadowrocket'
		if ('undefined' !== typeof Egern) return 'Egern'
	}

	isNode() {
		return 'Node.js' === this.platform()
	}

	isQuanX() {
		return 'Quantumult X' === this.platform()
	}

	isSurge() {
		return 'Surge' === this.platform()
	}

	isLoon() {
		return 'Loon' === this.platform()
	}

	isShadowrocket() {
		return 'Shadowrocket' === this.platform()
	}

	isStash() {
		return 'Stash' === this.platform()
	}

	isEgern() {
		return 'Egern' === this.platform()
	}

	async getScript(url) {
		return await this.fetch(url).then(response => response.body);
	}

	async runScript(script, runOpts) {
		let httpapi = $Storage.getItem('@chavy_boxjs_userCfgs.httpapi');
		httpapi = httpapi?.replace?.(/\n/g, '')?.trim();
		let httpapi_timeout = $Storage.getItem('@chavy_boxjs_userCfgs.httpapi_timeout');
		httpapi_timeout = (httpapi_timeout * 1) ?? 20;
		httpapi_timeout = runOpts?.timeout ?? httpapi_timeout;
		const [password, address] = httpapi.split('@');
		const request = {
			url: `http://${address}/v1/scripting/evaluate`,
			body: {
				script_text: script,
				mock_type: 'cron',
				timeout: httpapi_timeout
			},
			headers: { 'X-Key': password, 'Accept': '*/*' },
			timeout: httpapi_timeout
		};
		await this.fetch(request).then(response => response.body, error => this.logErr(error));
	}

	initGotEnv(opts) {
		this.got = this.got ? this.got : require('got');
		this.cktough = this.cktough ? this.cktough : require('tough-cookie');
		this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar();
		if (opts) {
			opts.headers = opts.headers ? opts.headers : {};
			if (undefined === opts.headers.Cookie && undefined === opts.cookieJar) {
				opts.cookieJar = this.ckjar;
			}
		}
	}

	async fetch(request = {} || "", option = {}) {
		// 初始化参数
		switch (request.constructor) {
			case Object:
				request = { ...request, ...option };
				break;
			case String:
				request = { "url": request, ...option };
				break;
		}		// 自动判断请求方法
		if (!request.method) {
			request.method = "GET";
			if (request.body ?? request.bodyBytes) request.method = "POST";
		}		// 移除请求头中的部分参数, 让其自动生成
		delete request.headers?.Host;
		delete request.headers?.[":authority"];
		delete request.headers?.['Content-Length'];
		delete request.headers?.['content-length'];
		// 定义请求方法（小写）
		const method = request.method.toLocaleLowerCase();
		// 判断平台
		switch (this.platform()) {
			case 'Loon':
			case 'Surge':
			case 'Stash':
			case 'Egern':
			case 'Shadowrocket':
			default:
				// 转换请求参数
				if (request.timeout) {
					request.timeout = parseInt(request.timeout, 10);
					if (this.isSurge()) ; else request.timeout = request.timeout * 1000;
				}				if (request.policy) {
					if (this.isLoon()) request.node = request.policy;
					if (this.isStash()) Lodash.set(request, "headers.X-Stash-Selected-Proxy", encodeURI(request.policy));
					if (this.isShadowrocket()) Lodash.set(request, "headers.X-Surge-Proxy", request.policy);
				}				if (typeof request.redirection === "boolean") request["auto-redirect"] = request.redirection;
				// 转换请求体
				if (request.bodyBytes && !request.body) {
					request.body = request.bodyBytes;
					delete request.bodyBytes;
				}				// 发送请求
				return await new Promise((resolve, reject) => {
					$httpClient[method](request, (error, response, body) => {
						if (error) reject(error);
						else {
							response.ok = /^2\d\d$/.test(response.status);
							response.statusCode = response.status;
							if (body) {
								response.body = body;
								if (request["binary-mode"] == true) response.bodyBytes = body;
							}							resolve(response);
						}
					});
				});
			case 'Quantumult X':
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
			case 'Node.js':
				let iconv = require('iconv-lite');
				this.initGotEnv(request);
				const { url, ...option } = request;
				return await this.got[method](url, option)
					.on('redirect', (response, nextOpts) => {
						try {
							if (response.headers['set-cookie']) {
								const ck = response.headers['set-cookie']
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
						// this.ckjar.setCookieSync(response.headers['set-cookie'].map(Cookie.parse).toString())
					})
					.then(
						response => {
							response.statusCode = response.status;
							response.body = iconv.decode(response.rawBody, this.encoding);
							response.bodyBytes = response.rawBody;
							return response;
						},
						error => Promise.reject(error.message));
		}	};

	/**
	 *
	 * 示例:$.time('yyyy-MM-dd qq HH:mm:ss.S')
	 *    :$.time('yyyyMMddHHmmssS')
	 *    y:年 M:月 d:日 q:季 H:时 m:分 s:秒 S:毫秒
	 *    其中y可选0-4位占位符、S可选0-1位占位符，其余可选0-2位占位符
	 * @param {string} format 格式化参数
	 * @param {number} ts 可选: 根据指定时间戳返回格式化日期
	 *
	 */
	time(format, ts = null) {
		const date = ts ? new Date(ts) : new Date();
		let o = {
			'M+': date.getMonth() + 1,
			'd+': date.getDate(),
			'H+': date.getHours(),
			'm+': date.getMinutes(),
			's+': date.getSeconds(),
			'q+': Math.floor((date.getMonth() + 3) / 3),
			'S': date.getMilliseconds()
		};
		if (/(y+)/.test(format))
			format = format.replace(
				RegExp.$1,
				(date.getFullYear() + '').substr(4 - RegExp.$1.length)
			);
		for (let k in o)
			if (new RegExp('(' + k + ')').test(format))
				format = format.replace(
					RegExp.$1,
					RegExp.$1.length == 1
						? o[k]
						: ('00' + o[k]).substr(('' + o[k]).length)
				);
		return format
	}

	/**
	 * 系统通知
	 *
	 * > 通知参数: 同时支持 QuanX 和 Loon 两种格式, EnvJs根据运行环境自动转换, Surge 环境不支持多媒体通知
	 *
	 * 示例:
	 * $.msg(title, subt, desc, 'twitter://')
	 * $.msg(title, subt, desc, { 'open-url': 'twitter://', 'media-url': 'https://github.githubassets.com/images/modules/open_graph/github-mark.png' })
	 * $.msg(title, subt, desc, { 'open-url': 'https://bing.com', 'media-url': 'https://github.githubassets.com/images/modules/open_graph/github-mark.png' })
	 *
	 * @param {*} title 标题
	 * @param {*} subt 副标题
	 * @param {*} desc 通知详情
	 * @param {*} opts 通知参数
	 *
	 */
	msg(title = name, subt = '', desc = '', opts) {
		const toEnvOpts = (rawopts) => {
			switch (typeof rawopts) {
				case undefined:
					return rawopts
				case 'string':
					switch (this.platform()) {
						case 'Surge':
						case 'Stash':
						case 'Egern':
						default:
							return { url: rawopts }
						case 'Loon':
						case 'Shadowrocket':
							return rawopts
						case 'Quantumult X':
							return { 'open-url': rawopts }
						case 'Node.js':
							return undefined
					}
				case 'object':
					switch (this.platform()) {
						case 'Surge':
						case 'Stash':
						case 'Egern':
						case 'Shadowrocket':
						default: {
							let openUrl =
								rawopts.url || rawopts.openUrl || rawopts['open-url'];
							return { url: openUrl }
						}
						case 'Loon': {
							let openUrl =
								rawopts.openUrl || rawopts.url || rawopts['open-url'];
							let mediaUrl = rawopts.mediaUrl || rawopts['media-url'];
							return { openUrl, mediaUrl }
						}
						case 'Quantumult X': {
							let openUrl =
								rawopts['open-url'] || rawopts.url || rawopts.openUrl;
							let mediaUrl = rawopts['media-url'] || rawopts.mediaUrl;
							let updatePasteboard =
								rawopts['update-pasteboard'] || rawopts.updatePasteboard;
							return {
								'open-url': openUrl,
								'media-url': mediaUrl,
								'update-pasteboard': updatePasteboard
							}
						}
						case 'Node.js':
							return undefined
					}
				default:
					return undefined
			}
		};
		if (!this.isMute) {
			switch (this.platform()) {
				case 'Surge':
				case 'Loon':
				case 'Stash':
				case 'Egern':
				case 'Shadowrocket':
				default:
					$notification.post(title, subt, desc, toEnvOpts(opts));
					break
				case 'Quantumult X':
					$notify(title, subt, desc, toEnvOpts(opts));
					break
				case 'Node.js':
					break
			}
		}
		if (!this.isMuteLog) {
			let logs = ['', '==============📣系统通知📣=============='];
			logs.push(title);
			subt ? logs.push(subt) : '';
			desc ? logs.push(desc) : '';
			console.log(logs.join('\n'));
			this.logs = this.logs.concat(logs);
		}
	}

	log(...logs) {
		if (logs.length > 0) {
			this.logs = [...this.logs, ...logs];
		}
		console.log(logs.join(this.logSeparator));
	}

	logErr(error) {
		switch (this.platform()) {
			case 'Surge':
			case 'Loon':
			case 'Stash':
			case 'Egern':
			case 'Shadowrocket':
			case 'Quantumult X':
			default:
				this.log('', `❗️ ${this.name}, 错误!`, error);
				break
			case 'Node.js':
				this.log('', `❗️${this.name}, 错误!`, error.stack);
				break
		}
	}

	wait(time) {
		return new Promise((resolve) => setTimeout(resolve, time))
	}

	done(object = {}) {
		const endTime = new Date().getTime();
		const costTime = (endTime - this.startTime) / 1000;
		this.log("", `🚩 ${this.name}, 结束! 🕛 ${costTime} 秒`, "");
		switch (this.platform()) {
			case 'Surge':
				if (object.policy) Lodash.set(object, "headers.X-Surge-Policy", object.policy);
				$done(object);
				break;
			case 'Loon':
				if (object.policy) object.node = object.policy;
				$done(object);
				break;
			case 'Stash':
				if (object.policy) Lodash.set(object, "headers.X-Stash-Selected-Proxy", encodeURI(object.policy));
				$done(object);
				break;
			case 'Egern':
				$done(object);
				break;
			case 'Shadowrocket':
			default:
				$done(object);
				break;
			case 'Quantumult X':
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
			case 'Node.js':
				process.exit(1);
				break;
		}
	}
}

class URL {
	constructor(url, base = undefined) {
		const name = "URL";
		const version = "2.1.0";
		console.log(`\n🟧 ${name} v${version}\n`);
		url = this.#parse(url, base);
		return this;
	};

	#parse(url, base = undefined) {
		const URLRegex = /(?:(?<protocol>\w+:)\/\/(?:(?<username>[^\s:"]+)(?::(?<password>[^\s:"]+))?@)?(?<host>[^\s@/]+))?(?<pathname>\/?[^\s@?]+)?(?<search>\?[^\s?]+)?/;
		const PortRegex = /(?<hostname>.+):(?<port>\d+)$/;
		url = url.match(URLRegex)?.groups || {};
		if (base) {
			base = base?.match(URLRegex)?.groups || {};
			if (!base.protocol || !base.hostname) throw new Error(`🚨 ${name}, ${base} is not a valid URL`);
		}		if (url.protocol || base?.protocol) this.protocol = url.protocol || base.protocol;
		if (url.username || base?.username) this.username = url.username || base.username;
		if (url.password || base?.password) this.password = url.password || base.password;
		if (url.host || base?.host) {
			this.host = url.host || base.host;
			Object.freeze(this.host);
			this.hostname = this.host.match(PortRegex)?.groups.hostname ?? this.host;
			this.port = this.host.match(PortRegex)?.groups.port ?? "";
		}		if (url.pathname || base?.pathname) {
			this.pathname = url.pathname || base?.pathname;
			if (!this.pathname.startsWith("/")) this.pathname = "/" + this.pathname;
			this.paths = this.pathname.split("/").filter(Boolean);
			Object.freeze(this.paths);
			if (this.paths) {
				const fileName = this.paths[this.paths.length - 1];
				if (fileName?.includes(".")) {
					const list = fileName.split(".");
					this.format = list[list.length - 1];
					Object.freeze(this.format);
				}
			}		} else this.pathname = "";
		if (url.search || base?.search) {
			this.search = url.search || base.search;
			Object.freeze(this.search);
			if (this.search) {
				const array = this.search.slice(1).split("&").map((param) => param.split("="));
				this.searchParams = new Map(array);
			}		}		this.harf = this.toString();
		Object.freeze(this.harf);
		return this;
	};

	toString() {
		let string = "";
		if (this.protocol) string += this.protocol + "//";
		if (this.username) string += this.username + (this.password ? ":" + this.password : "") + "@";
		if (this.hostname) string += this.hostname;
		if (this.port) string += ":" + this.port;
		if (this.pathname) string += this.pathname;
		if (this.searchParams) string += "?" + Array.from(this.searchParams).map(param => param.join("=")).join("&");
		return string;
	};

	toJSON() { return JSON.stringify({ ...this }) };
}

var Settings$7 = {
	Switch: true
};
var Configs$3 = {
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
	Settings: Settings$7,
	Configs: Configs$3
};

var Default$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Configs: Configs$3,
	Settings: Settings$7,
	default: Default
});

var Settings$6 = {
	Switch: true,
	PEP: {
		GCC: "US"
	}
};
var Location = {
	Settings: Settings$6
};

var Location$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Settings: Settings$6,
	default: Location
});

var Settings$5 = {
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
var Configs$2 = {
	CN: {
		attribution: [
			{
				region: [
				],
				name: "AutoNavi",
				url: "https://gspe21-ssl.ls.apple.com/html/attribution-cn2-66.html",
				resource: [
					{
						region: [
						],
						filter: [
						],
						checksum: {
							"0": 61,
							"1": 130,
							"2": 126,
							"3": 203,
							"4": 170,
							"5": 234,
							"6": 91,
							"7": 182,
							"8": 191,
							"9": 120,
							"10": 72,
							"11": 19,
							"12": 46,
							"13": 58,
							"14": 235,
							"15": 55,
							"16": 221,
							"17": 53,
							"18": 252,
							"19": 219
						},
						updateMethod: 0,
						validationMethod: 0,
						filename: "autonavi-4.png",
						resourceType: 6
					},
					{
						region: [
						],
						filter: [
						],
						checksum: {
							"0": 101,
							"1": 191,
							"2": 219,
							"3": 234,
							"4": 178,
							"5": 237,
							"6": 6,
							"7": 231,
							"8": 236,
							"9": 110,
							"10": 3,
							"11": 82,
							"12": 194,
							"13": 129,
							"14": 29,
							"15": 221,
							"16": 225,
							"17": 55,
							"18": 26,
							"19": 203
						},
						updateMethod: 0,
						validationMethod: 0,
						filename: "autonavi-4@2x.png",
						resourceType: 6
					},
					{
						region: [
						],
						filter: [
						],
						checksum: {
							"0": 101,
							"1": 191,
							"2": 219,
							"3": 234,
							"4": 178,
							"5": 237,
							"6": 6,
							"7": 231,
							"8": 236,
							"9": 110,
							"10": 3,
							"11": 82,
							"12": 194,
							"13": 129,
							"14": 29,
							"15": 221,
							"16": 225,
							"17": 55,
							"18": 26,
							"19": 203
						},
						updateMethod: 0,
						validationMethod: 0,
						filename: "autonavi-4@2x.png",
						resourceType: 6
					},
					{
						region: [
						],
						filter: [
						],
						checksum: {
							"0": 247,
							"1": 152,
							"2": 81,
							"3": 90,
							"4": 135,
							"5": 206,
							"6": 171,
							"7": 138,
							"8": 151,
							"9": 37,
							"10": 167,
							"11": 77,
							"12": 112,
							"13": 223,
							"14": 89,
							"15": 164,
							"16": 242,
							"17": 201,
							"18": 164,
							"19": 74
						},
						updateMethod: 0,
						validationMethod: 0,
						filename: "autonavi-logo-mask-1.png",
						resourceType: 5
					},
					{
						region: [
						],
						filter: [
						],
						checksum: {
							"0": 54,
							"1": 203,
							"2": 95,
							"3": 5,
							"4": 82,
							"5": 108,
							"6": 189,
							"7": 170,
							"8": 124,
							"9": 255,
							"10": 39,
							"11": 153,
							"12": 245,
							"13": 47,
							"14": 224,
							"15": 93,
							"16": 202,
							"17": 181,
							"18": 11,
							"19": 127
						},
						updateMethod: 0,
						validationMethod: 0,
						filename: "autonavi-logo-mask-1@2x.png",
						resourceType: 5
					},
					{
						region: [
						],
						filter: [
						],
						checksum: {
							"0": 131,
							"1": 225,
							"2": 158,
							"3": 241,
							"4": 69,
							"5": 218,
							"6": 172,
							"7": 162,
							"8": 166,
							"9": 241,
							"10": 48,
							"11": 174,
							"12": 31,
							"13": 104,
							"14": 225,
							"15": 155,
							"16": 97,
							"17": 143,
							"18": 15,
							"19": 99
						},
						updateMethod: 0,
						validationMethod: 0,
						filename: "autonavi-logo-mask-1@3x.png",
						resourceType: 5
					}
				]
			},
			{
				region: [
					{
						maxX: 225,
						minZ: 8,
						minX: 218,
						maxY: 104,
						minY: 102,
						maxZ: 21
					},
					{
						maxX: 228,
						minZ: 8,
						minX: 221,
						maxY: 101,
						minY: 98,
						maxZ: 21
					},
					{
						maxX: 231,
						minZ: 8,
						minX: 226,
						maxY: 97,
						minY: 91,
						maxZ: 21
					}
				],
				name: "© GeoTechnologies, Inc.",
				url: "https://gspe21-ssl.ls.apple.com/html/attribution-cn2-66.html",
				resource: [
				]
			}
		],
		releaseInfo: "PROD-CN (24.20)",
		tileSet: [
			{
				scale: 0,
				style: 1,
				checksumType: 0,
				countryRegionWhitelist: [
					{
						countryCode: "AE",
						region: "AE"
					},
					{
						countryCode: "AE",
						region: "SA"
					},
					{
						countryCode: "IN",
						region: "IN"
					},
					{
						countryCode: "JP",
						region: "JP"
					},
					{
						countryCode: "KR",
						region: "KR"
					},
					{
						countryCode: "MA",
						region: "MA"
					},
					{
						countryCode: "RU",
						region: "RU"
					},
					{
						countryCode: "SA",
						region: "AE"
					},
					{
						countryCode: "SA",
						region: "SA"
					}
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles?flags=8",
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							}
						],
						identifier: 2197,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 1,
				style: 7,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 1,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-2-cn-ssl.ls.apple.com/2/tiles",
				validVersion: [
					{
						genericTile: [
							{
								resourceIndex: 1971,
								textureIndex: 0,
								tileType: 2
							}
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 224,
								minZ: 8,
								minX: 179,
								maxY: 128,
								minY: 80,
								maxZ: 8
							},
							{
								maxX: 449,
								minZ: 9,
								minX: 359,
								maxY: 257,
								minY: 161,
								maxZ: 9
							},
							{
								maxX: 898,
								minZ: 10,
								minX: 719,
								maxY: 915,
								minY: 323,
								maxZ: 10
							},
							{
								maxX: 1797,
								minZ: 11,
								minX: 1438,
								maxY: 1031,
								minY: 646,
								maxZ: 11
							},
							{
								maxX: 3594,
								minZ: 12,
								minX: 2876,
								maxY: 2062,
								minY: 1292,
								maxZ: 12
							},
							{
								maxX: 7188,
								minZ: 13,
								minX: 5752,
								maxY: 4124,
								minY: 2584,
								maxZ: 13
							},
							{
								maxX: 14376,
								minZ: 14,
								minX: 11504,
								maxY: 8248,
								minY: 5168,
								maxZ: 14
							},
							{
								maxX: 28752,
								minZ: 15,
								minX: 23008,
								maxY: 16496,
								minY: 10336,
								maxZ: 15
							},
							{
								maxX: 57504,
								minZ: 16,
								minX: 46016,
								maxY: 32992,
								minY: 20672,
								maxZ: 16
							},
							{
								maxX: 115008,
								minZ: 17,
								minX: 92032,
								maxY: 65984,
								minY: 41344,
								maxZ: 17
							},
							{
								maxX: 230016,
								minZ: 18,
								minX: 184064,
								maxY: 131976,
								minY: 82668,
								maxZ: 18
							}
						],
						identifier: 52
					}
				]
			},
			{
				scale: 2,
				style: 7,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 1,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-2-cn-ssl.ls.apple.com/2/tiles",
				validVersion: [
					{
						genericTile: [
							{
								resourceIndex: 1971,
								textureIndex: 0,
								tileType: 2
							}
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 224,
								minZ: 8,
								minX: 179,
								maxY: 128,
								minY: 80,
								maxZ: 8
							},
							{
								maxX: 449,
								minZ: 9,
								minX: 359,
								maxY: 257,
								minY: 161,
								maxZ: 9
							},
							{
								maxX: 898,
								minZ: 10,
								minX: 719,
								maxY: 915,
								minY: 323,
								maxZ: 10
							},
							{
								maxX: 1797,
								minZ: 11,
								minX: 1438,
								maxY: 1031,
								minY: 646,
								maxZ: 11
							},
							{
								maxX: 3594,
								minZ: 12,
								minX: 2876,
								maxY: 2062,
								minY: 1292,
								maxZ: 12
							},
							{
								maxX: 7188,
								minZ: 13,
								minX: 5752,
								maxY: 4124,
								minY: 2584,
								maxZ: 13
							},
							{
								maxX: 14376,
								minZ: 14,
								minX: 11504,
								maxY: 8248,
								minY: 5168,
								maxZ: 14
							},
							{
								maxX: 28752,
								minZ: 15,
								minX: 23008,
								maxY: 16496,
								minY: 10336,
								maxZ: 15
							},
							{
								maxX: 57504,
								minZ: 16,
								minX: 46016,
								maxY: 32992,
								minY: 20672,
								maxZ: 16
							},
							{
								maxX: 115008,
								minZ: 17,
								minX: 92032,
								maxY: 65984,
								minY: 41344,
								maxZ: 17
							},
							{
								maxX: 230016,
								minZ: 18,
								minX: 184064,
								maxY: 131976,
								minY: 82668,
								maxZ: 18
							}
						],
						identifier: 52
					}
				]
			},
			{
				scale: 0,
				style: 11,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles?flags=1",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 476
					}
				]
			},
			{
				scale: 0,
				style: 12,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe12-cn-ssl.ls.apple.com/traffic",
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							}
						],
						identifier: 2196,
						timeToLiveSeconds: 120,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 13,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles?flags=2",
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 65535,
								minZ: 16,
								minX: 0,
								maxY: 65535,
								minY: 0,
								maxZ: 16
							},
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 2176,
						timeToLiveSeconds: 604800,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 18,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 2197,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 20,
				checksumType: 0,
				countryRegionWhitelist: [
					{
						countryCode: "AE",
						region: "AE"
					},
					{
						countryCode: "AE",
						region: "SA"
					},
					{
						countryCode: "IN",
						region: "IN"
					},
					{
						countryCode: "JP",
						region: "JP"
					},
					{
						countryCode: "KR",
						region: "KR"
					},
					{
						countryCode: "MA",
						region: "MA"
					},
					{
						countryCode: "RU",
						region: "RU"
					},
					{
						countryCode: "SA",
						region: "AE"
					},
					{
						countryCode: "SA",
						region: "SA"
					}
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 2197,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 22,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 2197
					}
				]
			},
			{
				scale: 0,
				style: 30,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 262143,
								minZ: 18,
								minX: 0,
								maxY: 262143,
								minY: 0,
								maxZ: 18
							}
						],
						identifier: 152,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 37,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles?flags=2",
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 1983,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 47,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 1983,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 48,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 1983
					}
				]
			},
			{
				scale: 0,
				style: 53,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 2197,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 54,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 2197
					}
				]
			},
			{
				scale: 0,
				style: 56,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 16,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 57,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gsp76-cn-ssl.ls.apple.com/api/tile",
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 0,
						timeToLiveSeconds: 3600,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 58,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 65535,
								minZ: 16,
								minX: 0,
								maxY: 65535,
								minY: 0,
								maxZ: 16
							},
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 149
					}
				]
			},
			{
				scale: 0,
				style: 59,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/asset/v3/model",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							}
						],
						identifier: 86
					}
				]
			},
			{
				scale: 0,
				style: 60,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/asset/v3/material",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							}
						],
						identifier: 30
					}
				]
			},
			{
				scale: 0,
				style: 61,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							}
						],
						identifier: 30
					}
				]
			},
			{
				scale: 0,
				style: 64,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							}
						],
						identifier: 16,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 65,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe79-cn-ssl.ls.apple.com/65/v1",
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							}
						],
						identifier: 2,
						timeToLiveSeconds: 3600,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 66,
				checksumType: 0,
				countryRegionWhitelist: [
					{
						countryCode: "AE",
						region: "AE"
					},
					{
						countryCode: "AE",
						region: "SA"
					},
					{
						countryCode: "IN",
						region: "IN"
					},
					{
						countryCode: "JP",
						region: "JP"
					},
					{
						countryCode: "KR",
						region: "KR"
					},
					{
						countryCode: "MA",
						region: "MA"
					},
					{
						countryCode: "RU",
						region: "RU"
					},
					{
						countryCode: "SA",
						region: "AE"
					},
					{
						countryCode: "SA",
						region: "SA"
					}
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 2197,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 67,
				checksumType: 0,
				countryRegionWhitelist: [
					{
						countryCode: "AE",
						region: "AE"
					},
					{
						countryCode: "AE",
						region: "SA"
					},
					{
						countryCode: "IN",
						region: "IN"
					},
					{
						countryCode: "JP",
						region: "JP"
					},
					{
						countryCode: "KR",
						region: "KR"
					},
					{
						countryCode: "MA",
						region: "MA"
					},
					{
						countryCode: "RU",
						region: "RU"
					},
					{
						countryCode: "SA",
						region: "AE"
					},
					{
						countryCode: "SA",
						region: "SA"
					}
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							}
						],
						identifier: 2197,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 68,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 65535,
								minZ: 16,
								minX: 0,
								maxY: 65535,
								minY: 0,
								maxZ: 16
							},
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 2176,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 69,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 21
					}
				]
			},
			{
				scale: 0,
				style: 72,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							}
						],
						identifier: 2,
						timeToLiveSeconds: 3600,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 73,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 476
					}
				]
			},
			{
				scale: 0,
				style: 76,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe79-cn-ssl.ls.apple.com/sis/v1",
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 524287,
								minZ: 19,
								minX: 0,
								maxY: 524287,
								minY: 0,
								maxZ: 19
							}
						],
						identifier: 0,
						timeToLiveSeconds: 86400,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 79,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							}
						],
						identifier: 29
					}
				]
			},
			{
				scale: 0,
				style: 83,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 0,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							}
						],
						identifier: 3
					}
				]
			},
			{
				scale: 0,
				style: 84,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-2-cn-ssl.ls.apple.com/poi_update",
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 65535,
								minZ: 16,
								minX: 0,
								maxY: 65535,
								minY: 0,
								maxZ: 16
							},
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 2176,
						timeToLiveSeconds: 1800,
						genericTile: [
						]
					}
				]
			}
		],
		urlInfoSet: [
			{
				backgroundRevGeoURL: {
					url: "https://dispatcher.is.autonavi.com/dispatcher",
					supportsMultipathTCP: false
				},
				searchAttributionManifestURL: {
					url: "https://gspe21-ssl.ls.apple.com/config/search-attribution-1323",
					supportsMultipathTCP: false
				},
				analyticsSessionlessURL: {
					url: "https://gsp64-ssl.ls.apple.com/hvr/v3/use",
					supportsMultipathTCP: false
				},
				poiBusynessActivityCollectionURL: {
					url: "https://gsp53-ssl.ls.apple.com/hvr/rt_poi_activity",
					supportsMultipathTCP: false
				},
				offlineDataDownloadBaseURL: {
					url: "https://gspe121-cn-ssl.ls.apple.com",
					supportsMultipathTCP: false
				},
				wifiConnectionQualityProbeURL: {
					url: "https://gsp10-ssl-cn.ls.apple.com/hvr/wcq",
					supportsMultipathTCP: false
				},
				junctionImageServiceURL: {
					url: "https://direction2.is.autonavi.com/direction",
					supportsMultipathTCP: false
				},
				etaURL: {
					url: "https://direction2.is.autonavi.com/direction",
					supportsMultipathTCP: false
				},
				analyticsCohortSessionURL: {
					url: "https://gsp64-ssl.ls.apple.com/hvr/v3/use",
					supportsMultipathTCP: false
				},
				resourcesURL: {
					url: "https://gspe21-ssl.ls.apple.com/",
					supportsMultipathTCP: false
				},
				feedbackLookupURL: {
					url: "https://rap.is.autonavi.com/lookup",
					supportsMultipathTCP: false
				},
				batchTrafficProbeURL: {
					url: "https://gsp10-ssl.ls.apple.com/hvr/v2/loc",
					supportsMultipathTCP: false
				},
				batchReverseGeocoderURL: {
					url: "https://batch-rgeo.is.autonavi.com/batchRGeo",
					supportsMultipathTCP: false
				},
				spatialLookupURL: {
					url: "https://spatialsearch.is.autonavi.com/spatialsearch",
					supportsMultipathTCP: false
				},
				realtimeTrafficProbeURL: {
					url: "https://gsp9-ssl.apple.com/hvr/v2/rtloc",
					supportsMultipathTCP: false
				},
				wifiQualityTileURL: {
					url: "https://gspe85-cn-ssl.ls.apple.com/wifi_request_tile",
					supportsMultipathTCP: false
				},
				problemSubmissionURL: {
					url: "https://rap.is.autonavi.com/rap",
					supportsMultipathTCP: false
				},
				reverseGeocoderVersionsURL: {
					url: "https://gspe21-ssl.ls.apple.com/config/revgeo-version-11.plist",
					supportsMultipathTCP: false
				},
				problemCategoriesURL: {
					url: "https://gspe21-ssl.ls.apple.com/config/com.apple.GEO.BusinessLocalizedCategories-482.plist",
					supportsMultipathTCP: false
				},
				batchReverseGeocoderPlaceRequestURL: {
					url: "https://dispatcher.is.autonavi.com/dispatcher",
					supportsMultipathTCP: false
				},
				wifiQualityURL: {
					url: "https://gsp85-cn-ssl.ls.apple.com/wifi_request",
					supportsMultipathTCP: false
				},
				polyLocationShiftURL: {
					url: "https://shift.is.autonavi.com/localshift",
					supportsMultipathTCP: false
				},
				problemStatusURL: {
					url: "https://rap.is.autonavi.com/rapstatus",
					supportsMultipathTCP: false
				},
				feedbackSubmissionURL: {
					url: "https://rap.is.autonavi.com/rap",
					supportsMultipathTCP: false
				},
				offlineDataBatchListURL: {
					url: "https://ods.is.autonavi.com/api/batchesForRegion",
					supportsMultipathTCP: false
				},
				offlineDataSizeURL: {
					url: "https://ods.is.autonavi.com/api/sizeForRegion",
					supportsMultipathTCP: false
				},
				analyticsShortSessionURL: {
					url: "https://gsp64-ssl.ls.apple.com/hvr/v3/use",
					supportsMultipathTCP: false
				},
				alternateResourcesURL: [
					{
						url: "https://cdn.apple-mapkit.com/rap",
						supportsMultipathTCP: false
					},
					{
						url: "https://limit-rule.is.autonavi.com/lpr/rules/download",
						supportsMultipathTCP: false
					}
				],
				abExperimentURL: {
					url: "https://gsp-ssl.ls.apple.com/cn/ab.arpc",
					supportsMultipathTCP: false
				},
				logMessageUsageURL: {
					url: "https://gsp64-ssl.ls.apple.com/a/v2/use",
					supportsMultipathTCP: false
				},
				rapWebBundleURL: {
					url: "https://cdn.apple-mapkit.com/rap",
					supportsMultipathTCP: false
				},
				dispatcherURL: {
					url: "https://dispatcher.is.autonavi.com/dispatcher",
					supportsMultipathTCP: false
				},
				simpleETAURL: {
					url: "https://direction2.is.autonavi.com/direction",
					supportsMultipathTCP: false
				},
				analyticsLongSessionURL: {
					url: "https://gsp64-ssl.ls.apple.com/hvr/v3/use",
					supportsMultipathTCP: false
				},
				backgroundDispatcherURL: {
					url: "https://dispatcher.is.autonavi.com/dispatcher",
					supportsMultipathTCP: false
				},
				webModuleBaseURL: {
					url: "https://placecard-server-wm.is.autonavi.com",
					supportsMultipathTCP: false
				},
				directionsURL: {
					url: "https://direction2.is.autonavi.com/direction",
					supportsMultipathTCP: false
				},
				logMessageUsageV3URL: {
					url: "https://gsp64-ssl.ls.apple.com/hvr/v3/use",
					supportsMultipathTCP: false
				},
				announcementsURL: {
					url: "https://gspe35-ssl.ls.apple.com/config/announcements?environment=prod-cn",
					supportsMultipathTCP: false
				}
			}
		],
		muninBucket: [
			{
				bucketID: 2,
				bucketURL: "https://gspe72-cn-ssl.ls.apple.com/mnn_us"
			},
			{
				bucketID: 6,
				bucketURL: "https://gspe72-cn-ssl.ls.apple.com/mnn_us"
			}
		]
	},
	XX: {
		attribution: [
			{
				region: [
				],
				name: "‎",
				url: "https://gspe21-ssl.ls.apple.com/html/attribution-279.html",
				resource: [
				],
				linkDisplayStringIndex: 0,
				plainTextURL: "https://gspe21-ssl.ls.apple.com/html/attribution-278.txt",
				plainTextURLSHA256Checksum: {
					"0": 124,
					"1": 102,
					"2": 134,
					"3": 184,
					"4": 40,
					"5": 189,
					"6": 231,
					"7": 39,
					"8": 109,
					"9": 244,
					"10": 228,
					"11": 192,
					"12": 151,
					"13": 223,
					"14": 17,
					"15": 129,
					"16": 158,
					"17": 253,
					"18": 70,
					"19": 5,
					"20": 123,
					"21": 187,
					"22": 50,
					"23": 87,
					"24": 25,
					"25": 122,
					"26": 38,
					"27": 36,
					"28": 33,
					"29": 149,
					"30": 18,
					"31": 234
				}
			},
			{
				region: [
					{
						maxX: 183,
						minZ: 8,
						minX: 176,
						maxY: 122,
						minY: 110,
						maxZ: 21
					},
					{
						maxX: 188,
						minZ: 8,
						minX: 178,
						maxY: 107,
						minY: 107,
						maxZ: 21
					},
					{
						maxX: 183,
						minZ: 8,
						minX: 178,
						maxY: 109,
						minY: 108,
						maxZ: 21
					},
					{
						maxX: 180,
						minZ: 8,
						minX: 180,
						maxY: 106,
						minY: 105,
						maxZ: 21
					},
					{
						maxX: 183,
						minZ: 8,
						minX: 181,
						maxY: 106,
						minY: 104,
						maxZ: 21
					},
					{
						maxX: 182,
						minZ: 8,
						minX: 182,
						maxY: 103,
						minY: 103,
						maxZ: 21
					},
					{
						maxX: 184,
						minZ: 8,
						minX: 184,
						maxY: 106,
						minY: 104,
						maxZ: 21
					},
					{
						maxX: 195,
						minZ: 8,
						minX: 184,
						maxY: 110,
						minY: 108,
						maxZ: 21
					},
					{
						maxX: 194,
						minZ: 8,
						minX: 184,
						maxY: 111,
						minY: 111,
						maxZ: 21
					},
					{
						maxX: 191,
						minZ: 8,
						minX: 184,
						maxY: 120,
						minY: 112,
						maxZ: 21
					},
					{
						maxX: 184,
						minZ: 8,
						minX: 184,
						maxY: 121,
						minY: 121,
						maxZ: 21
					},
					{
						maxX: 185,
						minZ: 8,
						minX: 185,
						maxY: 106,
						minY: 105,
						maxZ: 21
					},
					{
						maxX: 190,
						minZ: 8,
						minX: 190,
						maxY: 107,
						minY: 107,
						maxZ: 21
					},
					{
						maxX: 194,
						minZ: 8,
						minX: 193,
						maxY: 123,
						minY: 118,
						maxZ: 21
					},
					{
						maxX: 195,
						minZ: 8,
						minX: 195,
						maxY: 118,
						minY: 118,
						maxZ: 21
					}
				],
				linkDisplayStringIndex: 0,
				name: "MMI",
				url: "https://gspe21-ssl.ls.apple.com/html/attribution-279.html",
				resource: [
					{
						region: [
						],
						filter: [
						],
						checksum: {
							"0": 35,
							"1": 54,
							"2": 2,
							"3": 219,
							"4": 218,
							"5": 184,
							"6": 124,
							"7": 50,
							"8": 35,
							"9": 32,
							"10": 86,
							"11": 20,
							"12": 147,
							"13": 223,
							"14": 7,
							"15": 41,
							"16": 209,
							"17": 238,
							"18": 32,
							"19": 41
						},
						updateMethod: 0,
						validationMethod: 0,
						filename: "mmi-mask-2.png",
						resourceType: 5
					},
					{
						region: [
						],
						filter: [
						],
						checksum: {
							"0": 5,
							"1": 160,
							"2": 112,
							"3": 185,
							"4": 3,
							"5": 255,
							"6": 7,
							"7": 75,
							"8": 78,
							"9": 139,
							"10": 52,
							"11": 81,
							"12": 151,
							"13": 231,
							"14": 143,
							"15": 29,
							"16": 187,
							"17": 109,
							"18": 220,
							"19": 80
						},
						updateMethod: 0,
						validationMethod: 0,
						filename: "mmi-mask-2@2x.png",
						resourceType: 5
					},
					{
						region: [
						],
						filter: [
						],
						checksum: {
							"0": 240,
							"1": 170,
							"2": 204,
							"3": 91,
							"4": 161,
							"5": 113,
							"6": 81,
							"7": 101,
							"8": 136,
							"9": 205,
							"10": 115,
							"11": 2,
							"12": 192,
							"13": 97,
							"14": 106,
							"15": 34,
							"16": 227,
							"17": 214,
							"18": 74,
							"19": 220
						},
						updateMethod: 0,
						validationMethod: 0,
						filename: "mmi-mask-2@3x.png",
						resourceType: 5
					}
				]
			},
			{
				region: [
					{
						maxX: 225,
						minZ: 8,
						minX: 218,
						maxY: 104,
						minY: 102,
						maxZ: 21
					},
					{
						maxX: 228,
						minZ: 8,
						minX: 221,
						maxY: 101,
						minY: 98,
						maxZ: 21
					},
					{
						maxX: 231,
						minZ: 8,
						minX: 226,
						maxY: 97,
						minY: 91,
						maxZ: 21
					}
				],
				linkDisplayStringIndex: 0,
				name: "© GeoTechnologies, Inc.",
				url: "https://gspe21-ssl.ls.apple.com/html/attribution-279.html",
				resource: [
				]
			}
		],
		releaseInfo: "PROD (24.20)",
		tileSet: [
			{
				scale: 0,
				style: 1,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							}
						],
						identifier: 16388440,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
					{
						countryCode: "AE",
						region: "AE"
					},
					{
						countryCode: "AE",
						region: "SA"
					},
					{
						countryCode: "IN",
						region: ""
					},
					{
						countryCode: "JP",
						region: "JP"
					},
					{
						countryCode: "KR",
						region: "KR"
					},
					{
						countryCode: "MA",
						region: "MA"
					},
					{
						countryCode: "RU",
						region: "RU"
					},
					{
						countryCode: "SA",
						region: "AE"
					},
					{
						countryCode: "SA",
						region: "SA"
					},
					{
						countryCode: "VN",
						region: "VN"
					}
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf?flags=8"
			},
			{
				scale: 0,
				style: 1,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							}
						],
						identifier: 16389156,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
					{
						countryCode: "AE",
						region: "AE"
					},
					{
						countryCode: "AE",
						region: "SA"
					},
					{
						countryCode: "IN",
						region: ""
					},
					{
						countryCode: "JP",
						region: "JP"
					},
					{
						countryCode: "KR",
						region: "KR"
					},
					{
						countryCode: "MA",
						region: "MA"
					},
					{
						countryCode: "RU",
						region: "RU"
					},
					{
						countryCode: "SA",
						region: "AE"
					},
					{
						countryCode: "SA",
						region: "SA"
					},
					{
						countryCode: "VN",
						region: "VN"
					}
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf?flags=8"
			},
			{
				scale: 1,
				style: 7,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 1,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-ssl.ls.apple.com/tile",
				validVersion: [
					{
						genericTile: [
							{
								resourceIndex: 1971,
								textureIndex: 0,
								tileType: 2
							}
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 22
							}
						],
						identifier: 9751
					}
				]
			},
			{
				scale: 2,
				style: 7,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 1,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-ssl.ls.apple.com/tile",
				validVersion: [
					{
						genericTile: [
							{
								resourceIndex: 1971,
								textureIndex: 0,
								tileType: 2
							}
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 22
							}
						],
						identifier: 9751
					}
				]
			},
			{
				scale: 0,
				style: 11,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16388440
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf?flags=1"
			},
			{
				scale: 0,
				style: 11,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16389156
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf?flags=1"
			},
			{
				scale: 0,
				style: 12,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							}
						],
						identifier: 16388440,
						timeToLiveSeconds: 120,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe12-ssl.ls.apple.com/traffic"
			},
			{
				scale: 0,
				style: 12,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							}
						],
						identifier: 16389156,
						timeToLiveSeconds: 120,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe12-kittyhawk-ssl.ls.apple.com/traffic"
			},
			{
				scale: 0,
				style: 13,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 65535,
								minZ: 16,
								minX: 0,
								maxY: 65535,
								minY: 0,
								maxZ: 16
							},
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 16388440,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf?flags=2"
			},
			{
				scale: 0,
				style: 13,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 65535,
								minZ: 16,
								minX: 0,
								maxY: 65535,
								minY: 0,
								maxZ: 16
							},
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 16389156,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf?flags=2"
			},
			{
				scale: 0,
				style: 14,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-ssl.ls.apple.com/tile",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
						],
						identifier: 1
					}
				]
			},
			{
				scale: 0,
				style: 15,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-ssl.ls.apple.com/tile",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
						],
						identifier: 1
					}
				]
			},
			{
				scale: 0,
				style: 16,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-ssl.ls.apple.com/tile",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
						],
						identifier: 1
					}
				]
			},
			{
				scale: 0,
				style: 17,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-ssl.ls.apple.com/tile",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							}
						],
						identifier: 0
					}
				]
			},
			{
				scale: 1,
				style: 17,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 1,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-ssl.ls.apple.com/tile",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 2583,
								minZ: 13,
								minX: 408,
								maxY: 3659,
								minY: 2760,
								maxZ: 13
							},
							{
								maxX: 4535,
								minZ: 13,
								minX: 3848,
								maxY: 3235,
								minY: 2332,
								maxZ: 13
							}
						],
						identifier: 32
					}
				]
			},
			{
				scale: 0,
				style: 18,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16388440,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 18,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16389156,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 20,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16388440,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
					{
						countryCode: "AE",
						region: "AE"
					},
					{
						countryCode: "AE",
						region: "SA"
					},
					{
						countryCode: "IN",
						region: ""
					},
					{
						countryCode: "JP",
						region: "JP"
					},
					{
						countryCode: "KR",
						region: "KR"
					},
					{
						countryCode: "MA",
						region: "MA"
					},
					{
						countryCode: "RU",
						region: "RU"
					},
					{
						countryCode: "SA",
						region: "AE"
					},
					{
						countryCode: "SA",
						region: "SA"
					},
					{
						countryCode: "VN",
						region: "VN"
					}
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 20,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16389156,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
					{
						countryCode: "AE",
						region: "AE"
					},
					{
						countryCode: "AE",
						region: "SA"
					},
					{
						countryCode: "IN",
						region: ""
					},
					{
						countryCode: "JP",
						region: "JP"
					},
					{
						countryCode: "KR",
						region: "KR"
					},
					{
						countryCode: "MA",
						region: "MA"
					},
					{
						countryCode: "RU",
						region: "RU"
					},
					{
						countryCode: "SA",
						region: "AE"
					},
					{
						countryCode: "SA",
						region: "SA"
					},
					{
						countryCode: "VN",
						region: "VN"
					}
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 22,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16388440
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 22,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16389156
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 30,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 262143,
								minZ: 18,
								minX: 0,
								maxY: 262143,
								minY: 0,
								maxZ: 18
							}
						],
						identifier: 16388440,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 30,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 262143,
								minZ: 18,
								minX: 0,
								maxY: 262143,
								minY: 0,
								maxZ: 18
							}
						],
						identifier: 16389156,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 1,
				style: 33,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 1,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-ssl.ls.apple.com/tile",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 7
							}
						],
						identifier: 4
					}
				]
			},
			{
				scale: 0,
				style: 37,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16388440,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf?flags=2"
			},
			{
				scale: 0,
				style: 37,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16389156,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf?flags=2"
			},
			{
				scale: 0,
				style: 42,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-ssl.ls.apple.com/tile",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
						],
						identifier: 1
					}
				]
			},
			{
				scale: 0,
				style: 43,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-ssl.ls.apple.com/tile",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
						],
						identifier: 1
					}
				]
			},
			{
				scale: 0,
				style: 44,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-ssl.ls.apple.com/tile",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
						],
						identifier: 1
					}
				]
			},
			{
				scale: 0,
				style: 47,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16388440,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 47,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16389156,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 48,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 11201196
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 48,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 11201196
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 52,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-ssl.ls.apple.com/tile",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
						],
						identifier: 1
					}
				]
			},
			{
				scale: 0,
				style: 53,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16388440,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 53,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16389156,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 54,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 13658945
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 54,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 13659050
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 56,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 16388440,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 56,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 16389156,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 57,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe76-ssl.ls.apple.com/api/tile",
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 0,
						timeToLiveSeconds: 3600,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 58,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 65535,
								minZ: 16,
								minX: 0,
								maxY: 65535,
								minY: 0,
								maxZ: 16
							},
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 16388440
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 58,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 65535,
								minZ: 16,
								minX: 0,
								maxY: 65535,
								minY: 0,
								maxZ: 16
							},
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 16389156
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 59,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							}
						],
						identifier: 16388440
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/asset/v3/model"
			},
			{
				scale: 0,
				style: 59,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							}
						],
						identifier: 16389156
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/asset/v3/model"
			},
			{
				scale: 0,
				style: 60,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							}
						],
						identifier: 16388440
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/asset/v3/material"
			},
			{
				scale: 0,
				style: 60,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							}
						],
						identifier: 16389156
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/asset/v3/material"
			},
			{
				scale: 0,
				style: 61,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							}
						],
						identifier: 16388440
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 61,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							}
						],
						identifier: 16389156
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 62,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							}
						],
						identifier: 16388440
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 62,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							}
						],
						identifier: 16389156
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 64,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							}
						],
						identifier: 16388440,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 64,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							}
						],
						identifier: 16389156,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 65,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe79-ssl.ls.apple.com/65/v1",
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							}
						],
						identifier: 2,
						timeToLiveSeconds: 3600,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 66,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16388440,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
					{
						countryCode: "AE",
						region: "AE"
					},
					{
						countryCode: "AE",
						region: "SA"
					},
					{
						countryCode: "IN",
						region: ""
					},
					{
						countryCode: "JP",
						region: "JP"
					},
					{
						countryCode: "KR",
						region: "KR"
					},
					{
						countryCode: "MA",
						region: "MA"
					},
					{
						countryCode: "RU",
						region: "RU"
					},
					{
						countryCode: "SA",
						region: "AE"
					},
					{
						countryCode: "SA",
						region: "SA"
					},
					{
						countryCode: "VN",
						region: "VN"
					}
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 66,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16389156,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
					{
						countryCode: "AE",
						region: "AE"
					},
					{
						countryCode: "AE",
						region: "SA"
					},
					{
						countryCode: "IN",
						region: ""
					},
					{
						countryCode: "JP",
						region: "JP"
					},
					{
						countryCode: "KR",
						region: "KR"
					},
					{
						countryCode: "MA",
						region: "MA"
					},
					{
						countryCode: "RU",
						region: "RU"
					},
					{
						countryCode: "SA",
						region: "AE"
					},
					{
						countryCode: "SA",
						region: "SA"
					},
					{
						countryCode: "VN",
						region: "VN"
					}
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 67,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							}
						],
						identifier: 16388440,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
					{
						countryCode: "AE",
						region: "AE"
					},
					{
						countryCode: "AE",
						region: "SA"
					},
					{
						countryCode: "IN",
						region: ""
					},
					{
						countryCode: "JP",
						region: "JP"
					},
					{
						countryCode: "KR",
						region: "KR"
					},
					{
						countryCode: "MA",
						region: "MA"
					},
					{
						countryCode: "RU",
						region: "RU"
					},
					{
						countryCode: "SA",
						region: "AE"
					},
					{
						countryCode: "SA",
						region: "SA"
					},
					{
						countryCode: "VN",
						region: "VN"
					}
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 67,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							}
						],
						identifier: 16389156,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
					{
						countryCode: "AE",
						region: "AE"
					},
					{
						countryCode: "AE",
						region: "SA"
					},
					{
						countryCode: "IN",
						region: ""
					},
					{
						countryCode: "JP",
						region: "JP"
					},
					{
						countryCode: "KR",
						region: "KR"
					},
					{
						countryCode: "MA",
						region: "MA"
					},
					{
						countryCode: "RU",
						region: "RU"
					},
					{
						countryCode: "SA",
						region: "AE"
					},
					{
						countryCode: "SA",
						region: "SA"
					},
					{
						countryCode: "VN",
						region: "VN"
					}
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 68,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 65535,
								minZ: 16,
								minX: 0,
								maxY: 65535,
								minY: 0,
								maxZ: 16
							},
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 16388440,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 68,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 65535,
								minZ: 16,
								minX: 0,
								maxY: 65535,
								minY: 0,
								maxZ: 16
							},
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 16389156,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 69,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16388440
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 69,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16389156
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 70,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe76-ssl.ls.apple.com/api/vltile",
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							}
						],
						identifier: 1,
						timeToLiveSeconds: 86400,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 71,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe92-ssl.ls.apple.com",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 2097151,
								minZ: 21,
								minX: 0,
								maxY: 2097151,
								minY: 0,
								maxZ: 21
							}
						],
						identifier: 1
					}
				]
			},
			{
				scale: 0,
				style: 72,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe79-ssl.ls.apple.com/72/v2",
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							}
						],
						identifier: 2,
						timeToLiveSeconds: 3600,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 73,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16388440
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 73,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16389156
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 74,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe79-ssl.ls.apple.com/pbz/v1",
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2097151,
								minZ: 21,
								minX: 0,
								maxY: 2097151,
								minY: 0,
								maxZ: 21
							}
						],
						identifier: 0,
						timeToLiveSeconds: 86400,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 76,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe79-ssl.ls.apple.com/sis/v1",
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 524287,
								minZ: 19,
								minX: 0,
								maxY: 524287,
								minY: 0,
								maxZ: 19
							}
						],
						identifier: 0,
						timeToLiveSeconds: 86400,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 78,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							}
						],
						identifier: 16388440
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 78,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							}
						],
						identifier: 16389156
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 79,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							}
						],
						identifier: 16388440
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 79,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							}
						],
						identifier: 16389156
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 80,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe79-ssl.ls.apple.com/sdm/v1",
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 65535,
								minZ: 16,
								minX: 0,
								maxY: 65535,
								minY: 0,
								maxZ: 16
							}
						],
						identifier: 0,
						timeToLiveSeconds: 86400,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 82,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							}
						],
						identifier: 16388440
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/asset/v3/model-occlusion"
			},
			{
				scale: 0,
				style: 82,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							}
						],
						identifier: 16389156
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/asset/v3/model-occlusion"
			},
			{
				scale: 0,
				style: 83,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 0,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 65535,
								minZ: 16,
								minX: 0,
								maxY: 65535,
								minY: 0,
								maxZ: 16
							},
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 16357893
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 83,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 0,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 65535,
								minZ: 16,
								minX: 0,
								maxY: 65535,
								minY: 0,
								maxZ: 16
							},
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 16361517
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 84,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 65535,
								minZ: 16,
								minX: 0,
								maxY: 65535,
								minY: 0,
								maxZ: 16
							},
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 16388440,
						timeToLiveSeconds: 1800,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-2-ssl.ls.apple.com/poi_update"
			},
			{
				scale: 0,
				style: 84,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 65535,
								minZ: 16,
								minX: 0,
								maxY: 65535,
								minY: 0,
								maxZ: 16
							},
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 16389156,
						timeToLiveSeconds: 1800,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-2-ssl.ls.apple.com/poi_update"
			},
			{
				scale: 0,
				style: 85,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							}
						],
						identifier: 16388440
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-2-ssl.ls.apple.com/live_tile.vf"
			},
			{
				scale: 0,
				style: 85,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							}
						],
						identifier: 16389156
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-2-ssl.ls.apple.com/live_tile.vf"
			},
			{
				scale: 0,
				style: 87,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16388440,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 87,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16389156,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 88,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							}
						],
						identifier: 16388440
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 88,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							}
						],
						identifier: 16389156
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 89,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe79-ssl.ls.apple.com/ray/v1",
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 262143,
								minZ: 18,
								minX: 0,
								maxY: 262143,
								minY: 0,
								maxZ: 18
							}
						],
						identifier: 1,
						timeToLiveSeconds: 86400,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 90,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16388440
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 90,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16389156
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 91,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-ssl-vss.ls.apple.com/tile",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							}
						],
						identifier: 2
					}
				]
			},
			{
				scale: 1,
				style: 92,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 1,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-ssl-vss.ls.apple.com/tile",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 2583,
								minZ: 13,
								minX: 408,
								maxY: 3659,
								minY: 2760,
								maxZ: 13
							},
							{
								maxX: 4535,
								minZ: 13,
								minX: 3848,
								maxY: 3235,
								minY: 2332,
								maxZ: 13
							}
						],
						identifier: 32
					}
				]
			},
			{
				scale: 0,
				style: 94,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 0,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe79-ssl.ls.apple.com/ccc/v1",
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 262143,
								minZ: 18,
								minX: 0,
								maxY: 262143,
								minY: 0,
								maxZ: 18
							}
						],
						identifier: 1,
						timeToLiveSeconds: 86400,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 95,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-ssl-vss.ls.apple.com/tile",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							}
						],
						identifier: 1
					}
				]
			}
		],
		urlInfoSet: [
			{
				backgroundRevGeoURL: {
					url: "https://gsp57-ssl-revgeo.ls.apple.com/dispatcher.arpc",
					supportsMultipathTCP: false
				},
				announcementsURL: {
					url: "https://gspe35-ssl.ls.apple.com/config/announcements?environment=prod",
					supportsMultipathTCP: false
				},
				searchAttributionManifestURL: {
					url: "https://gspe21-ssl.ls.apple.com/config/search-attribution-1322",
					supportsMultipathTCP: false
				},
				analyticsSessionlessURL: {
					url: "https://gsp64-ssl.ls.apple.com/hvr/v3/use",
					supportsMultipathTCP: false
				},
				proactiveAppClipURL: {
					url: "https://gspe79-ssl.ls.apple.com/72/v2",
					supportsMultipathTCP: false
				},
				enrichmentSubmissionURL: {
					url: "https://sundew.ls.apple.com/v1/feedback/submission.arpc",
					supportsMultipathTCP: false
				},
				wifiConnectionQualityProbeURL: {
					url: "https://gsp10-ssl.ls.apple.com/hvr/wcq",
					supportsMultipathTCP: false
				},
				poiBusynessActivityCollectionURL: {
					url: "https://gsp53-ssl.ls.apple.com/hvr/rt_poi_activity",
					supportsMultipathTCP: false
				},
				offlineDataDownloadBaseURL: {
					url: "https://gspe121-ssl.ls.apple.com",
					supportsMultipathTCP: false
				},
				etaURL: {
					url: "https://gsp-ssl.ls.apple.com/directions.arpc",
					supportsMultipathTCP: true,
					alternativeMultipathTCPPort: 5228
				},
				analyticsCohortSessionURL: {
					url: "https://gsp64-ssl.ls.apple.com/hvr/v3/use",
					supportsMultipathTCP: false
				},
				resourcesURL: {
					url: "https://gspe21-ssl.ls.apple.com/",
					supportsMultipathTCP: false
				},
				problemOptInURL: {
					url: "https://sundew.ls.apple.com/grp/oi",
					supportsMultipathTCP: false
				},
				proactiveRoutingURL: {
					url: "https://gsp-ssl-commute.ls.apple.com/directions.arpc",
					supportsMultipathTCP: true,
					alternativeMultipathTCPPort: 5228
				},
				feedbackLookupURL: {
					url: "https://gsp-ssl.ls.apple.com/feedback.arpc",
					supportsMultipathTCP: false
				},
				bluePOIDispatcherURL: {
					url: "https://gsp57-ssl-locus.ls.apple.com/dispatcher.arpc",
					supportsMultipathTCP: true,
					alternativeMultipathTCPPort: 5228
				},
				batchTrafficProbeURL: {
					url: "https://gsp10-ssl.ls.apple.com/hvr/v2/loc",
					supportsMultipathTCP: false
				},
				batchReverseGeocoderURL: {
					url: "https://gsp36-ssl.ls.apple.com/revgeo.arpc",
					supportsMultipathTCP: false
				},
				spatialLookupURL: {
					url: "https://gsp51-ssl.ls.apple.com/api/v1.0/poi/data",
					supportsMultipathTCP: false
				},
				realtimeTrafficProbeURL: {
					url: "https://gsp9-ssl.apple.com/hvr/v2/rtloc",
					supportsMultipathTCP: false
				},
				addressCorrectionTaggedLocationURL: {
					url: "https://gsp47-ssl.ls.apple.com/ac",
					supportsMultipathTCP: false
				},
				problemSubmissionURL: {
					url: "https://sundew.ls.apple.com/v1/feedback/submission.arpc",
					supportsMultipathTCP: false
				},
				reverseGeocoderVersionsURL: {
					url: "https://gspe21-ssl.ls.apple.com/config/revgeo-version-11.plist",
					supportsMultipathTCP: false
				},
				wifiQualityTileURL: {
					url: "https://gspe85-ssl.ls.apple.com/wifi_request_tile",
					supportsMultipathTCP: false
				},
				problemCategoriesURL: {
					url: "https://gspe21-ssl.ls.apple.com/config/com.apple.GEO.BusinessLocalizedCategories-482.plist",
					supportsMultipathTCP: false
				},
				batchReverseGeocoderPlaceRequestURL: {
					url: "https://gsp36-ssl.ls.apple.com/revgeo_pr.arpc",
					supportsMultipathTCP: false
				},
				wifiQualityURL: {
					url: "https://gsp85-ssl.ls.apple.com/wifi_request",
					supportsMultipathTCP: false
				},
				problemStatusURL: {
					url: "https://sundew.ls.apple.com/grp/st",
					supportsMultipathTCP: false
				},
				feedbackSubmissionURL: {
					url: "https://sundew.ls.apple.com/v1/feedback/submission.arpc",
					supportsMultipathTCP: false
				},
				pressureProbeDataURL: {
					url: "https://gsp10-ssl.ls.apple.com/hvr/cpr",
					supportsMultipathTCP: false
				},
				offlineDataBatchListURL: {
					url: "https://gspe121-ssl.ls.apple.com/api/batchesForRegion",
					supportsMultipathTCP: false
				},
				offlineDataSizeURL: {
					url: "https://gspe121-ssl.ls.apple.com/api/sizeForRegion",
					supportsMultipathTCP: false
				},
				analyticsShortSessionURL: {
					url: "https://gsp64-ssl.ls.apple.com/hvr/v3/use",
					supportsMultipathTCP: false
				},
				bcxDispatcherURL: {
					url: "https://gsp57-ssl-bcx.ls.apple.com/dispatcher.arpc",
					supportsMultipathTCP: false
				},
				alternateResourcesURL: [
					{
						url: "https://cdn.apple-mapkit.com/rap",
						supportsMultipathTCP: false
					}
				],
				abExperimentURL: {
					url: "https://gsp-ssl.ls.apple.com/ab.arpc",
					supportsMultipathTCP: false
				},
				logMessageUsageURL: {
					url: "https://gsp64-ssl.ls.apple.com/a/v2/use",
					supportsMultipathTCP: false
				},
				addressCorrectionInitURL: {
					url: "https://gsp47-ssl.ls.apple.com/ac",
					supportsMultipathTCP: false
				},
				dispatcherURL: {
					url: "https://gsp-ssl.ls.apple.com/dispatcher.arpc",
					supportsMultipathTCP: true,
					alternativeMultipathTCPPort: 5228
				},
				ugcLogDiscardURL: {
					url: "https://sundew.ls.apple.com/v1/log_message",
					supportsMultipathTCP: false
				},
				rapWebBundleURL: {
					url: "https://cdn.apple-mapkit.com/rap",
					supportsMultipathTCP: false
				},
				networkSelectionHarvestURL: {
					url: "https://gsp10-ssl.ls.apple.com/hvr/strn",
					supportsMultipathTCP: false
				},
				simpleETAURL: {
					url: "https://gsp-ssl.ls.apple.com/directions.arpc",
					supportsMultipathTCP: true,
					alternativeMultipathTCPPort: 5228
				},
				businessPortalBaseURL: {
					url: "https://mapsconnect.apple.com/business/ui/claimPlace",
					supportsMultipathTCP: false
				},
				analyticsLongSessionURL: {
					url: "https://gsp64-ssl.ls.apple.com/hvr/v3/use",
					supportsMultipathTCP: false
				},
				backgroundDispatcherURL: {
					url: "https://gsp57-ssl-background.ls.apple.com/dispatcher.arpc",
					supportsMultipathTCP: true,
					alternativeMultipathTCPPort: 5228
				},
				webModuleBaseURL: {
					url: "https://maps.apple.com",
					supportsMultipathTCP: false
				},
				directionsURL: {
					url: "https://gsp-ssl.ls.apple.com/directions.arpc",
					supportsMultipathTCP: true,
					alternativeMultipathTCPPort: 5228
				},
				addressCorrectionUpdateURL: {
					url: "https://gsp47-ssl.ls.apple.com/ac",
					supportsMultipathTCP: false
				},
				logMessageUsageV3URL: {
					url: "https://gsp64-ssl.ls.apple.com/hvr/v3/use",
					supportsMultipathTCP: false
				}
			}
		],
		muninBucket: [
			{
				bucketID: 2,
				bucketURL: "https://gspe72-ssl.ls.apple.com/mnn_us"
			},
			{
				bucketID: 6,
				bucketURL: "https://gspe72-ssl.ls.apple.com/mnn_us"
			}
		]
	}
};
var Maps = {
	Settings: Settings$5,
	Configs: Configs$2
};

var Maps$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Configs: Configs$2,
	Settings: Settings$5,
	default: Maps
});

var Settings$4 = {
	Switch: true,
	CountryCode: "US",
	NewsPlusUser: true
};
var News = {
	Settings: Settings$4
};

var News$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Settings: Settings$4,
	default: News
});

var Settings$3 = {
	Switch: true,
	CountryCode: "US",
	canUse: true
};
var PrivateRelay = {
	Settings: Settings$3
};

var PrivateRelay$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Settings: Settings$3,
	default: PrivateRelay
});

var Settings$2 = {
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
var Configs$1 = {
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
	Settings: Settings$2,
	Configs: Configs$1
};

var Siri$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Configs: Configs$1,
	Settings: Settings$2,
	default: Siri
});

var Settings$1 = {
	Switch: "true",
	CountryCode: "US",
	MultiAccount: "false",
	Universal: "true"
};
var TestFlight = {
	Settings: Settings$1
};

var TestFlight$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Settings: Settings$1,
	default: TestFlight
});

var Settings = {
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
var Configs = {
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
	Settings: Settings,
	Configs: Configs
};

var TV$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Configs: Configs,
	Settings: Settings,
	default: TV
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
};

/**
 * Get Storage Variables
 * @link https://github.com/NanoCat-Me/ENV/blob/main/getStorage.mjs
 * @author VirgilClyne
 * @param {String} key - Persistent Store Key
 * @param {Array} names - Platform Names
 * @param {Object} database - Default Database
 * @return {Object} { Settings, Caches, Configs }
 */
function getStorage(key, names, database) {
    //console.log(`☑️ ${this.name}, Get Environment Variables`, "");
    /***************** BoxJs *****************/
    // 包装为局部变量，用完释放内存
    // BoxJs的清空操作返回假值空字符串, 逻辑或操作符会在左侧操作数为假值时返回右侧操作数。
    let BoxJs = $Storage.getItem(key, database);
    //console.log(`🚧 ${this.name}, Get Environment Variables`, `BoxJs类型: ${typeof BoxJs}`, `BoxJs内容: ${JSON.stringify(BoxJs)}`, "");
    /***************** Argument *****************/
    let Argument = {};
    if (typeof $argument !== "undefined") {
        if (Boolean($argument)) {
            //console.log(`🎉 ${this.name}, $Argument`);
            let arg = Object.fromEntries($argument.split("&").map((item) => item.split("=").map(i => i.replace(/\"/g, ''))));
            //console.log(JSON.stringify(arg));
            for (let item in arg) Lodash.set(Argument, item, arg[item]);
            //console.log(JSON.stringify(Argument));
        }        //console.log(`✅ ${this.name}, Get Environment Variables`, `Argument类型: ${typeof Argument}`, `Argument内容: ${JSON.stringify(Argument)}`, "");
    }    /***************** Store *****************/
    const Store = { Settings: database?.Default?.Settings || {}, Configs: database?.Default?.Configs || {}, Caches: {} };
    if (!Array.isArray(names)) names = [names];
    //console.log(`🚧 ${this.name}, Get Environment Variables`, `names类型: ${typeof names}`, `names内容: ${JSON.stringify(names)}`, "");
    for (let name of names) {
        Store.Settings = { ...Store.Settings, ...database?.[name]?.Settings, ...Argument, ...BoxJs?.[name]?.Settings };
        Store.Configs = { ...Store.Configs, ...database?.[name]?.Configs };
        if (BoxJs?.[name]?.Caches && typeof BoxJs?.[name]?.Caches === "string") BoxJs[name].Caches = JSON.parse(BoxJs?.[name]?.Caches);
        Store.Caches = { ...Store.Caches, ...BoxJs?.[name]?.Caches };
    }    //console.log(`🚧 ${this.name}, Get Environment Variables`, `Store.Settings类型: ${typeof Store.Settings}`, `Store.Settings: ${JSON.stringify(Store.Settings)}`, "");
    traverseObject(Store.Settings, (key, value) => {
        //console.log(`🚧 ${this.name}, traverseObject`, `${key}: ${typeof value}`, `${key}: ${JSON.stringify(value)}`, "");
        if (value === "true" || value === "false") value = JSON.parse(value); // 字符串转Boolean
        else if (typeof value === "string") {
            if (value.includes(",")) value = value.split(",").map(item => string2number(item)); // 字符串转数组转数字
            else value = string2number(value); // 字符串转数字
        }        return value;
    });
    //console.log(`✅ ${this.name}, Get Environment Variables`, `Store: ${typeof Store.Caches}`, `Store内容: ${JSON.stringify(Store)}`, "");
    return Store;

    /***************** function *****************/
    function traverseObject(o, c) { for (var t in o) { var n = o[t]; o[t] = "object" == typeof n && null !== n ? traverseObject(n, c) : c(t, n); } return o }
    function string2number(string) { if (string && !isNaN(string)) string = parseInt(string, 10); return string }
}

/**
 * Set Environment Variables
 * @author VirgilClyne
 * @param {Object} $ - ENV
 * @param {String} name - Persistent Store Key
 * @param {Array} platforms - Platform Names
 * @param {Object} database - Default DataBase
 * @return {Object} { Settings, Caches, Configs }
 */
function setENV(name, platforms, database) {
	console.log(`☑️ Set Environment Variables`, "");
	let { Settings, Caches, Configs } = getStorage(name, platforms, database);
	/***************** Settings *****************/
	if (Settings?.Tabs && !Array.isArray(Settings?.Tabs)) Lodash.set(Settings, "Tabs", (Settings?.Tabs) ? [Settings.Tabs.toString()] : []);
	if (Settings?.Domains && !Array.isArray(Settings?.Domains)) Lodash.set(Settings, "Domains", (Settings?.Domains) ? [Settings.Domains.toString()] : []);
	if (Settings?.Functions && !Array.isArray(Settings?.Functions)) Lodash.set(Settings, "Functions", (Settings?.Functions) ? [Settings.Functions.toString()] : []);
	console.log(`✅ Set Environment Variables, Settings: ${typeof Settings}, Settings内容: ${JSON.stringify(Settings)}`, "");
	/***************** Caches *****************/
	//console.log(`✅ Set Environment Variables, Caches: ${typeof Caches}, Caches内容: ${JSON.stringify(Caches)}`, "");
	/***************** Configs *****************/
	Configs.Storefront = new Map(Configs.Storefront);
	if (Configs.Locale) Configs.Locale = new Map(Configs.Locale);
	if (Configs.i18n) for (let type in Configs.i18n) Configs.i18n[type] = new Map(Configs.i18n[type]);
	return { Settings, Caches, Configs };
}

const $ = new ENV(" iRingo: ✈ TestFlight v3.2.0(1) response.beta");

/***************** Processing *****************/
// 解构URL
const url = new URL($request.url);
$.log(`⚠ url: ${url.toJSON()}`, "");
// 获取连接参数
const METHOD = $request.method, HOST = url.hostname, PATH = url.pathname, PATHs = url.paths;
$.log(`⚠ METHOD: ${METHOD}, HOST: ${HOST}, PATH: ${PATH}` , "");
// 解析格式
const FORMAT = ($response.headers?.["Content-Type"] ?? $response.headers?.["content-type"])?.split(";")?.[0];
$.log(`⚠ FORMAT: ${FORMAT}`, "");
!(async () => {
	const { Settings, Caches, Configs } = setENV("iRingo", "TestFlight", Database$1);
	$.log(`⚠ Settings.Switch: ${Settings?.Switch}`, "");
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
					break;
				case "application/x-mpegURL":
				case "application/x-mpegurl":
				case "application/vnd.apple.mpegurl":
				case "audio/mpegurl":
					//body = M3U8.parse($response.body);
					//$.log(`🚧 body: ${JSON.stringify(body)}`, "");
					//$response.body = M3U8.stringify(body);
					break;
				case "text/xml":
				case "text/html":
				case "text/plist":
				case "application/xml":
				case "application/plist":
				case "application/x-plist":
					//body = XML.parse($response.body);
					//$.log(`🚧 body: ${JSON.stringify(body)}`, "");
					//$response.body = XML.stringify(body);
					break;
				case "text/vtt":
				case "application/vtt":
					//body = VTT.parse($response.body);
					//$.log(`🚧 body: ${JSON.stringify(body)}`, "");
					//$response.body = VTT.stringify(body);
					break;
				case "text/json":
				case "application/json":
					body = JSON.parse($response.body ?? "{}");
					$.log(`🚧 body: ${JSON.stringify(body)}`, "");
					// 主机判断
					switch (HOST) {
						case "testflight.apple.com":
							// 路径判断
							switch (PATH) {
								case "/v1/session/authenticate":
									switch (Settings.MultiAccount) { // MultiAccount
										case true:
											$.log(`⚠ 启用多账号支持`, "");
											const XRequestId = $request?.headers?.["X-Request-Id"] ?? $request?.headers?.["x-request-id"];
											const XSessionId = $request?.headers?.["X-Session-Id"] ?? $request?.headers?.["x-session-id"];
											const XSessionDigest = $request?.headers?.["X-Session-Digest"] ?? $request?.headers?.["x-session-digest"];
											if (Caches?.data) { //有data
												$.log(`⚠ 有Caches.data`, "");
												if (body?.data?.accountId === Caches?.data?.accountId) { // Account ID相等，刷新缓存
													$.log(`⚠ Account ID相等，刷新缓存`, "");
													Caches.headers = {
														"X-Request-Id": XRequestId,
														"X-Session-Id": XSessionId,
														"X-Session-Digest": XSessionDigest
													};
													Caches.data = body.data;
													Caches.data.termsAndConditions = null;
													Caches.data.hasNewTermsAndConditions = false;
													$Storage.setItem("@iRingo.TestFlight.Caches", Caches);
												}
												/*
												else { // Account ID不相等，覆盖
													$.log(`⚠ Account ID不相等，覆盖data(accountId和sessionId)`, "");
													body.data = Caches.data;
												}
												*/
											} else { // Caches空
												$.log(`⚠ Caches空，写入`, "");
												Caches.headers = {
													"X-Request-Id": XRequestId,
													"X-Session-Id": XSessionId,
													"X-Session-Digest": XSessionDigest
												};
												Caches.data = body.data;
												Caches.data.termsAndConditions = null;
												Caches.data.hasNewTermsAndConditions = false;
												$Storage.setItem("@iRingo.TestFlight.Caches", Caches);
											}											break;
									}									break;
								case "/v1/devices":
								case "/v1/devices/apns":
								case "/v1/devices/add":
								case "/v1/devices/remove":
									break;
								default:
									switch (PATHs[0]) {
										case "v1":
										case "v2":
										case "v3":
											switch (PATHs[1]) {
												case "accounts":
													switch (PATHs[2]) {
														case "settings":
															switch (PATHs[3]) {
																case undefined:
																	$.log(`🚧 /${PATHs[0]}/accounts/settings`, "");
																	break;
																case "notifications":
																	switch (PATHs[4]) {
																		case "apps":
																			$.log(`🚧 /${PATHs[0]}/accounts/settings/notifications/apps/`, "");
																			break;
																	}																	break;
																default:
																	$.log(`🚧 /${PATHs[0]}/accounts/settings/${PATHs[3]}/`, "");
																	break;
															}															break;
														case Caches?.data?.accountId: // UUID
														default:
															switch (PATHs[3]) {
																case undefined:
																	$.log(`🚧 /${PATHs[0]}/accounts/${PATHs[2]}`, "");
																	break;
																case "apps":
																	$.log(`🚧 /${PATHs[0]}/accounts/${PATHs[2]}/apps/`, "");
																	switch (PATHs[4]) {
																		case undefined:
																			$.log(`🚧 /${PATHs[0]}/accounts/${PATHs[2]}/apps`, "");
																			switch (Settings.Universal) { // 通用
																				case true:
																					$.log(`🚧 启用通用应用支持`, "");
																					if (body.error === null) { // 数据无错误
																						$.log(`🚧 数据无错误`, "");
																						body.data = body.data.map(app => {
																							if (app.previouslyTested !== false) { // 不是前测试人员
																								$.log(`🚧 不是前测试人员`, "");
																								app.platforms = app.platforms.map(platform => {
																									platform.build = modBuild(platform.build);
																									return platform
																								});
																							}
																							return app
																						});
																					}																					break;
																			}																			break;
																		default:
																			switch (PATHs[5]) {
																				case undefined:
																					$.log(`🚧 /${PATHs[0]}/accounts/${PATHs[2]}/apps/${PATHs[4]}`, "");
																					break;
																				case "builds":
																					switch (PATHs[7]) {
																						case undefined:
																							$.log(`🚧 /${PATHs[0]}/accounts/${PATHs[2]}/apps/${PATHs[4]}/builds/${PATHs[6]}`, "");
																							switch (Settings.Universal) { // 通用
																								case true:
																									$.log(`🚧 启用通用应用支持`, "");
																									if (body.error === null) { // 数据无错误
																										$.log(`🚧 数据无错误`, "");
																										// 当前Bulid
																										body.data.currentBuild = modBuild(body.data.currentBuild);
																										// Build列表
																										body.data.builds = body.data.builds.map(build => modBuild(build));
																									}																									break;
																							}																							break;
																						case "install":
																							$.log(`🚧 /${PATHs[0]}/accounts/${PATHs[2]}/apps/${PATHs[4]}/builds/${PATHs[6]}/install`, "");
																							break;
																						default:
																							$.log(`🚧 /${PATHs[0]}/accounts/${PATHs[2]}/apps/${PATHs[4]}/builds/${PATHs[6]}/${PATHs[7]}`, "");
																							break;
																					}																					break;
																				case "platforms":
																					switch (PATHs[6]) {
																						case "ios":
																						case "osx":
																						case "appletvos":
																						default:
																							switch (PATHs[7]) {
																								case undefined:
																									$.log(`🚧 /${PATHs[0]}/accounts/${PATHs[2]}/apps/${PATHs[4]}/platforms/${PATHs[6]}`, "");
																									break;
																								case "trains":
																									switch (PATHs[9]) {
																										case undefined:
																											$.log(`🚧 /${PATHs[0]}/accounts/${PATHs[2]}/apps/${PATHs[4]}/platforms/${PATHs[6]}/trains/${PATHs[8]}`, "");
																											break;
																										case "builds":
																											switch (PATHs[10]) {
																												case undefined:
																													$.log(`🚧 /${PATHs[0]}/accounts/${PATHs[2]}/apps/${PATHs[4]}/platforms/${PATHs[6]}/trains/${PATHs[8]}/builds`, "");
																													switch (Settings.Universal) { // 通用
																														case true:
																															$.log(`🚧 启用通用应用支持`, "");
																															if (body.error === null) { // 数据无错误
																																$.log(`🚧 数据无错误`, "");
																																// 当前Bulid
																																body.data = body.data.map(data => modBuild(data));
																															}																															break;
																													}																													break;
																												default:
																													$.log(`🚧 /${PATHs[0]}/accounts/${PATHs[2]}/apps/${PATHs[4]}/platforms/${PATHs[6]}/trains/${PATHs[8]}/builds/${PATHs[10]}`, "");
																													break;
																											}																											break;
																										default:
																											$.log(`🚧 /${PATHs[0]}/accounts/${PATHs[2]}/apps/${PATHs[4]}/platforms/${PATHs[6]}/trains/${PATHs[8]}/${PATHs[9]}`, "");
																											break;
																									}																									break;
																								default:
																									$.log(`🚧 /${PATHs[0]}/accounts/${PATHs[2]}/apps/${PATHs[4]}/platforms/${PATHs[6]}/${PATHs[7]}`, "");
																									break;
																							}																							break;
																					}																					break;
																				default:
																					$.log(`🚧 /${PATHs[0]}/accounts/${PATHs[2]}/apps/${PATHs[4]}/${PATHs[5]}`, "");
																					break;
																			}																			break;
																	}																	break;
																default:
																	$.log(`🚧 /${PATHs[0]}/accounts/${PATHs[2]}/${PATHs[3]}/`, "");
																	break;
															}															break;
													}													break;
												case "apps":
													switch (PATHs[3]) {
														case "install":
															switch (PATHs[4]) {
																case undefined:
																	$.log(`🚧 /${PATHs[0]}/apps/install`, "");
																	break;
																case "status":
																	$.log(`🚧 /${PATHs[0]}/apps/install/status`, "");
																	break;
																default:
																	$.log(`🚧 /${PATHs[0]}/apps/install/${PATHs[4]}`, "");
																	break;
															}															break;
													}													break;
												case "messages":
													switch (PATHs[2]) {
														case Caches?.data?.accountId: // UUID
														default:
															$.log(`🚧 /${PATHs[0]}/messages/${PATHs[2]}`, "");
															switch (PATHs[3]) {
																case undefined:
																	$.log(`🚧 /${PATHs[0]}/messages/${PATHs[2]}`, "");
																	break;
																case "read":
																	$.log(`🚧 /${PATHs[0]}/messages/${PATHs[2]}/read`, "");
																	break;
																default:
																	$.log(`🚧 /${PATHs[0]}/messages/${PATHs[2]}/${PATHs[3]}`, "");
																	break;
															}															break;
													}													break;
											}											break;
									}									break;
							}							break;
					}					$response.body = JSON.stringify(body);
					break;
				case "application/protobuf":
				case "application/x-protobuf":
				case "application/vnd.google.protobuf":
				case "application/grpc":
				case "application/grpc+proto":
				case "application/octet-stream":
					break;
			}			break;
		case false:
			break;
	}})()
	.catch((e) => $.logErr(e))
	.finally(() => $.done($response));

/***************** Function *****************/
/**
 * mod Build
 * @author VirgilClyne
 * @param {Object} build - Build
 * @return {Object}
 */
function modBuild(build) {
	switch (build.platform || build.name) {
		case "ios":
			$.log(`🚧 ios`, "");
			build = Build(build);
			break;
		case "osx":
			$.log(`🚧 osx`, "");
			if (build?.macBuildCompatibility?.runsOnAppleSilicon === true) { // 是苹果芯片
				$.log(`🚧 runsOnAppleSilicon`, "");
				build = Build(build);
			}			break;
		case "appletvos":
			$.log(`🚧 appletvos`, "");
			break;
		default:
			$.log(`🚧 unknown platform: ${build.platform || build.name}`, "");
			break;
	}	return build

	function Build(build) {
		//if (build.universal === true) {
			build.compatible = true;
			build.platformCompatible = true;
			build.hardwareCompatible = true;
			build.osCompatible = true;
			if (build?.permission) build.permission = "install";
			if (build?.deviceFamilyInfo) {
				build.deviceFamilyInfo = [
					{
						"number": 1,
						"name": "iOS",
						"iconUrl": "https://itunesconnect-mr.itunes.apple.com/itc/img/device-icons/device_family_icon_1.png"
					},
					{
						"number": 2,
						"name": "iPad",
						"iconUrl": "https://itunesconnect-mr.itunes.apple.com/itc/img/device-icons/device_family_icon_2.png"
					},
					{
						"number": 3,
						"name": "Apple TV",
						"iconUrl": "https://itunesconnect-mr.itunes.apple.com/itc/img/device-icons/device_family_icon_3.png"
					}
				];
			}			if (build?.compatibilityData?.compatibleDeviceFamilies) {
				build.compatibilityData.compatibleDeviceFamilies = [
					{
						"name": "iPad",
						"minimumSupportedDevice": null,
						"unsupportedDevices": []
					},
					{
						"name": "iPhone",
						"minimumSupportedDevice": null,
						"unsupportedDevices": []
					},
					{
						"name": "iPod",
						"minimumSupportedDevice": null,
						"unsupportedDevices": []
					},
					{
						"name": "Mac",
						"minimumSupportedDevice": null,
						"unsupportedDevices": []
					}
				];
			}			if (build.macBuildCompatibility) {
				build.macBuildCompatibility.runsOnIntel = true;
				build.macBuildCompatibility.runsOnAppleSilicon = true;
				/*
				build.macBuildCompatibility = {
					"macArchitectures": ["AppleSilicon", "Intel"],
					"rosettaCompatible": true,
					"runsOnIntel": true,
					"runsOnAppleSilicon": true,
					"requiresRosetta": false
				};
				*/
			}		//};
		return build
	}}
