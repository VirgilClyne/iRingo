/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/ENV/ENV.mjs":
/*!*************************!*\
  !*** ./src/ENV/ENV.mjs ***!
  \*************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Http: () => (/* binding */ Http),
/* harmony export */   "default": () => (/* binding */ ENV)
/* harmony export */ });
class ENV {
	constructor(name, opts) {
		this.name = `${name}, ENV v1.0.0`
		this.http = new Http(this)
		this.data = null
		this.dataFile = 'box.dat'
		this.logs = []
		this.isMute = false
		this.isNeedRewrite = false
		this.logSeparator = '\n'
		this.encoding = 'utf-8'
		this.startTime = new Date().getTime()
		Object.assign(this, opts)
		this.log('', `🏁 ${this.name}, 开始!`)
	}

	Platform() {
		if ('undefined' !== typeof $environment && $environment['surge-version'])
			return 'Surge'
		if ('undefined' !== typeof $environment && $environment['stash-version'])
			return 'Stash'
		if ('undefined' !== typeof $task) return 'Quantumult X'
		if ('undefined' !== typeof $loon) return 'Loon'
		if ('undefined' !== typeof $rocket) return 'Shadowrocket'
	}

	isQuanX() {
		return 'Quantumult X' === this.Platform()
	}

	isSurge() {
		return 'Surge' === this.Platform()
	}

	isLoon() {
		return 'Loon' === this.Platform()
	}

	isShadowrocket() {
		return 'Shadowrocket' === this.Platform()
	}

	isStash() {
		return 'Stash' === this.Platform()
	}

	toObj(str, defaultValue = null) {
		try {
			return JSON.parse(str)
		} catch {
			return defaultValue
		}
	}

	toStr(obj, defaultValue = null) {
		try {
			return JSON.stringify(obj)
		} catch {
			return defaultValue
		}
	}

	getjson(key, defaultValue) {
		let json = defaultValue
		const val = this.getdata(key)
		if (val) {
			try {
				json = JSON.parse(this.getdata(key))
			} catch { }
		}
		return json
	}

	setjson(val, key) {
		try {
			return this.setdata(JSON.stringify(val), key)
		} catch {
			return false
		}
	}

	getScript(url) {
		return new Promise((resolve) => {
			this.get({ url }, (error, response, body) => resolve(body))
		})
	}

	runScript(script, runOpts) {
		return new Promise((resolve) => {
			let httpapi = this.getdata('@chavy_boxjs_userCfgs.httpapi')
			httpapi = httpapi ? httpapi.replace(/\n/g, '').trim() : httpapi
			let httpapi_timeout = this.getdata(
				'@chavy_boxjs_userCfgs.httpapi_timeout'
			)
			httpapi_timeout = httpapi_timeout ? httpapi_timeout * 1 : 20
			httpapi_timeout =
				runOpts && runOpts.timeout ? runOpts.timeout : httpapi_timeout
			const [key, addr] = httpapi.split('@')
			const opts = {
				url: `http://${addr}/v1/scripting/evaluate`,
				body: {
					script_text: script,
					mock_type: 'cron',
					timeout: httpapi_timeout
				},
				headers: { 'X-Key': key, 'Accept': '*/*' },
				timeout: httpapi_timeout
			}
			this.post(opts, (error, response, body) => resolve(body))
		}).catch((e) => this.logErr(e))
	}

	loaddata() {
		if (this.isNode()) {
			this.fs = this.fs ? this.fs : require('fs')
			this.path = this.path ? this.path : require('path')
			const curDirDataFilePath = this.path.resolve(this.dataFile)
			const rootDirDataFilePath = this.path.resolve(
				process.cwd(),
				this.dataFile
			)
			const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath)
			const isRootDirDataFile =
				!isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath)
			if (isCurDirDataFile || isRootDirDataFile) {
				const datPath = isCurDirDataFile
					? curDirDataFilePath
					: rootDirDataFilePath
				try {
					return JSON.parse(this.fs.readFileSync(datPath))
				} catch (e) {
					return {}
				}
			} else return {}
		} else return {}
	}

	writedata() {
		if (this.isNode()) {
			this.fs = this.fs ? this.fs : require('fs')
			this.path = this.path ? this.path : require('path')
			const curDirDataFilePath = this.path.resolve(this.dataFile)
			const rootDirDataFilePath = this.path.resolve(
				process.cwd(),
				this.dataFile
			)
			const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath)
			const isRootDirDataFile =
				!isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath)
			const jsondata = JSON.stringify(this.data)
			if (isCurDirDataFile) {
				this.fs.writeFileSync(curDirDataFilePath, jsondata)
			} else if (isRootDirDataFile) {
				this.fs.writeFileSync(rootDirDataFilePath, jsondata)
			} else {
				this.fs.writeFileSync(curDirDataFilePath, jsondata)
			}
		}
	}

	lodash_get(source, path, defaultValue = undefined) {
		const paths = path.replace(/\[(\d+)\]/g, '.$1').split('.')
		let result = source
		for (const p of paths) {
			result = Object(result)[p]
			if (result === undefined) {
				return defaultValue
			}
		}
		return result
	}

	lodash_set(obj, path, value) {
		if (Object(obj) !== obj) return obj
		if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || []
		path
			.slice(0, -1)
			.reduce(
				(a, c, i) =>
					Object(a[c]) === a[c]
						? a[c]
						: (a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] ? [] : {}),
				obj
			)[path[path.length - 1]] = value
		return obj
	}

	getdata(key) {
		let val = this.getval(key)
		// 如果以 @
		if (/^@/.test(key)) {
			const [, objkey, paths] = /^@(.*?)\.(.*?)$/.exec(key)
			const objval = objkey ? this.getval(objkey) : ''
			if (objval) {
				try {
					const objedval = JSON.parse(objval)
					val = objedval ? this.lodash_get(objedval, paths, '') : val
				} catch (e) {
					val = ''
				}
			}
		}
		return val
	}

	setdata(val, key) {
		let issuc = false
		if (/^@/.test(key)) {
			const [, objkey, paths] = /^@(.*?)\.(.*?)$/.exec(key)
			const objdat = this.getval(objkey)
			const objval = objkey
				? objdat === 'null'
					? null
					: objdat || '{}'
				: '{}'
			try {
				const objedval = JSON.parse(objval)
				this.lodash_set(objedval, paths, val)
				issuc = this.setval(JSON.stringify(objedval), objkey)
			} catch (e) {
				const objedval = {}
				this.lodash_set(objedval, paths, val)
				issuc = this.setval(JSON.stringify(objedval), objkey)
			}
		} else {
			issuc = this.setval(val, key)
		}
		return issuc
	}

	getval(key) {
		switch (this.Platform()) {
			case 'Surge':
			case 'Loon':
			case 'Stash':
			case 'Shadowrocket':
				return $persistentStore.read(key)
			case 'Quantumult X':
				return $prefs.valueForKey(key)
			default:
				return (this.data && this.data[key]) || null
		}
	}

	setval(val, key) {
		switch (this.Platform()) {
			case 'Surge':
			case 'Loon':
			case 'Stash':
			case 'Shadowrocket':
				return $persistentStore.write(val, key)
			case 'Quantumult X':
				return $prefs.setValueForKey(val, key)
			default:
				return (this.data && this.data[key]) || null
		}
	}

	initGotEnv(opts) {
		this.got = this.got ? this.got : require('got')
		this.cktough = this.cktough ? this.cktough : require('tough-cookie')
		this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar()
		if (opts) {
			opts.headers = opts.headers ? opts.headers : {}
			if (undefined === opts.headers.Cookie && undefined === opts.cookieJar) {
				opts.cookieJar = this.ckjar
			}
		}
	}

	get(request, callback = () => { }) {
		delete request.headers?.['Content-Length']
		delete request.headers?.['content-length']

		switch (this.Platform()) {
			case 'Surge':
			case 'Loon':
			case 'Stash':
			case 'Shadowrocket':
			default:
				if (this.isSurge() && this.isNeedRewrite) {
					this.lodash_set(request, 'headers.X-Surge-Skip-Scripting', false)
				}
				$httpClient.get(request, (error, response, body) => {
					if (!error && response) {
						response.body = body
						response.statusCode = response.status ? response.status : response.statusCode
						response.status = response.statusCode
					}
					callback(error, response, body)
				})
				break
			case 'Quantumult X':
				if (this.isNeedRewrite) {
					this.lodash_set(request, 'opts.hints', false)
				}
				$task.fetch(request).then(
					(response) => {
						const {
							statusCode: status,
							statusCode,
							headers,
							body,
							bodyBytes
						} = response
						callback(
							null,
							{ status, statusCode, headers, body, bodyBytes },
							body,
							bodyBytes
						)
					},
					(error) => callback((error && error.erroror) || 'UndefinedError')
				)
				break
		}
	}

	post(request, callback = () => { }) {
		const method = request.method
			? request.method.toLocaleLowerCase()
			: 'post'

		// 如果指定了请求体, 但没指定 `Content-Type`、`content-type`, 则自动生成。
		if (
			request.body &&
			request.headers &&
			!request.headers['Content-Type'] &&
			!request.headers['content-type']
		) {
			// HTTP/1、HTTP/2 都支持小写 headers
			request.headers['content-type'] = 'application/x-www-form-urlencoded'
		}
		// 为避免指定错误 `content-length` 这里删除该属性，由工具端 (HttpClient) 负责重新计算并赋值
			delete request.headers?.['Content-Length']
			delete request.headers?.['content-length']
		switch (this.Platform()) {
			case 'Surge':
			case 'Loon':
			case 'Stash':
			case 'Shadowrocket':
			default:
				if (this.isSurge() && this.isNeedRewrite) {
					this.lodash_set(request, 'headers.X-Surge-Skip-Scripting', false)
				}
				$httpClient[method](request, (error, response, body) => {
					if (!error && response) {
						response.body = body
						response.statusCode = response.status ? response.status : response.statusCode
						response.status = response.statusCode
					}
					callback(error, response, body)
				})
				break
			case 'Quantumult X':
				request.method = method
				if (this.isNeedRewrite) {
					this.lodash_set(request, 'opts.hints', false)
				}
				$task.fetch(request).then(
					(response) => {
						const {
							statusCode: status,
							statusCode,
							headers,
							body,
							bodyBytes
						} = response
						callback(
							null,
							{ status, statusCode, headers, body, bodyBytes },
							body,
							bodyBytes
						)
					},
					(error) => callback((error && error.erroror) || 'UndefinedError')
				)
				break
		}
	}
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
		const date = ts ? new Date(ts) : new Date()
		let o = {
			'M+': date.getMonth() + 1,
			'd+': date.getDate(),
			'H+': date.getHours(),
			'm+': date.getMinutes(),
			's+': date.getSeconds(),
			'q+': Math.floor((date.getMonth() + 3) / 3),
			'S': date.getMilliseconds()
		}
		if (/(y+)/.test(format))
			format = format.replace(
				RegExp.$1,
				(date.getFullYear() + '').substr(4 - RegExp.$1.length)
			)
		for (let k in o)
			if (new RegExp('(' + k + ')').test(format))
				format = format.replace(
					RegExp.$1,
					RegExp.$1.length == 1
						? o[k]
						: ('00' + o[k]).substr(('' + o[k]).length)
				)
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
					switch (this.Platform()) {
						case 'Surge':
						case 'Stash':
						default:
							return { url: rawopts }
						case 'Loon':
						case 'Shadowrocket':
							return rawopts
						case 'Quantumult X':
							return { 'open-url': rawopts }
					}
				case 'object':
					switch (this.Platform()) {
						case 'Surge':
						case 'Stash':
						case 'Shadowrocket':
						default: {
							let openUrl =
								rawopts.url || rawopts.openUrl || rawopts['open-url']
							return { url: openUrl }
						}
						case 'Loon': {
							let openUrl =
								rawopts.openUrl || rawopts.url || rawopts['open-url']
							let mediaUrl = rawopts.mediaUrl || rawopts['media-url']
							return { openUrl, mediaUrl }
						}
						case 'Quantumult X': {
							let openUrl =
								rawopts['open-url'] || rawopts.url || rawopts.openUrl
							let mediaUrl = rawopts['media-url'] || rawopts.mediaUrl
							let updatePasteboard =
								rawopts['update-pasteboard'] || rawopts.updatePasteboard
							return {
								'open-url': openUrl,
								'media-url': mediaUrl,
								'update-pasteboard': updatePasteboard
							}
						}
					}
				default:
					return undefined
			}
		}
		if (!this.isMute) {
			switch (this.Platform()) {
				case 'Surge':
				case 'Loon':
				case 'Stash':
				case 'Shadowrocket':
				default:
					$notification.post(title, subt, desc, toEnvOpts(opts))
					break
				case 'Quantumult X':
					$notify(title, subt, desc, toEnvOpts(opts))
					break
			}
		}
		if (!this.isMuteLog) {
			let logs = ['', '==============📣系统通知📣==============']
			logs.push(title)
			subt ? logs.push(subt) : ''
			desc ? logs.push(desc) : ''
			console.log(logs.join('\n'))
			this.logs = this.logs.concat(logs)
		}
	}

	log(...logs) {
		if (logs.length > 0) {
			this.logs = [...this.logs, ...logs]
		}
		console.log(logs.join(this.logSeparator))
	}

	logErr(error) {
		switch (this.Platform()) {
			case 'Surge':
			case 'Loon':
			case 'Stash':
			case 'Shadowrocket':
			case 'Quantumult X':
			default:
				this.log('', `❗️ ${this.name}, 错误!`, error)
				break
		}
	}

	wait(time) {
		return new Promise((resolve) => setTimeout(resolve, time))
	}

	done(val = {}) {
		const endTime = new Date().getTime()
		const costTime = (endTime - this.startTime) / 1000
		this.log('', `🚩 ${this.name}, 结束! 🕛 ${costTime} 秒`)
		this.log()
		switch (this.Platform()) {
			case 'Surge':
			case 'Loon':
			case 'Stash':
			case 'Shadowrocket':
			case 'Quantumult X':
			default:
				$done(val)
				break
		}
	}

	/**
	 * Get Environment Variables
	 * @link https://github.com/VirgilClyne/GetSomeFries/blob/main/function/getENV/getENV.js
	 * @author VirgilClyne
	 * @param {String} key - Persistent Store Key
	 * @param {Array} names - Platform Names
	 * @param {Object} database - Default Database
	 * @return {Object} { Settings, Caches, Configs }
	 */
	getENV(key, names, database) {
		//this.log(`☑️ ${this.name}, Get Environment Variables`, "");
		/***************** BoxJs *****************/
		// 包装为局部变量，用完释放内存
		// BoxJs的清空操作返回假值空字符串, 逻辑或操作符会在左侧操作数为假值时返回右侧操作数。
		let BoxJs = this.getjson(key, database);
		//this.log(`🚧 ${this.name}, Get Environment Variables`, `BoxJs类型: ${typeof BoxJs}`, `BoxJs内容: ${JSON.stringify(BoxJs)}`, "");
		/***************** Argument *****************/
		let Argument = {};
		if (typeof $argument !== "undefined") {
			if (Boolean($argument)) {
				//this.log(`🎉 ${this.name}, $Argument`);
				let arg = Object.fromEntries($argument.split("&").map((item) => item.split("=").map(i => i.replace(/\"/g, ''))));
				//this.log(JSON.stringify(arg));
				for (let item in arg) this.setPath(Argument, item, arg[item]);
				//this.log(JSON.stringify(Argument));
			};
			//this.log(`✅ ${this.name}, Get Environment Variables`, `Argument类型: ${typeof Argument}`, `Argument内容: ${JSON.stringify(Argument)}`, "");
		};
		/***************** Store *****************/
		const Store = { Settings: database?.Default?.Settings || {}, Configs: database?.Default?.Configs || {}, Caches: {} };
		if (!Array.isArray(names)) names = [names];
		//this.log(`🚧 ${this.name}, Get Environment Variables`, `names类型: ${typeof names}`, `names内容: ${JSON.stringify(names)}`, "");
		for (let name of names) {
			Store.Settings = { ...Store.Settings, ...database?.[name]?.Settings, ...Argument, ...BoxJs?.[name]?.Settings };
			Store.Configs = { ...Store.Configs, ...database?.[name]?.Configs };
			if (BoxJs?.[name]?.Caches && typeof BoxJs?.[name]?.Caches === "string") BoxJs[name].Caches = JSON.parse(BoxJs?.[name]?.Caches);
			Store.Caches = { ...Store.Caches, ...BoxJs?.[name]?.Caches };
		};
		//this.log(`🚧 ${this.name}, Get Environment Variables`, `Store.Settings类型: ${typeof Store.Settings}`, `Store.Settings: ${JSON.stringify(Store.Settings)}`, "");
		this.traverseObject(Store.Settings, (key, value) => {
			//this.log(`🚧 ${this.name}, traverseObject`, `${key}: ${typeof value}`, `${key}: ${JSON.stringify(value)}`, "");
			if (value === "true" || value === "false") value = JSON.parse(value); // 字符串转Boolean
			else if (typeof value === "string") {
				if (value.includes(",")) value = value.split(",").map(item => this.string2number(item)); // 字符串转数组转数字
				else value = this.string2number(value); // 字符串转数字
			};
			return value;
		});
		//this.log(`✅ ${this.name}, Get Environment Variables`, `Store: ${typeof Store.Caches}`, `Store内容: ${JSON.stringify(Store)}`, "");
		return Store;
	};

	/***************** function *****************/
	setPath(object, path, value) { path.split(".").reduce((o, p, i) => o[p] = path.split(".").length === ++i ? value : o[p] || {}, object) }
	traverseObject(o, c) { for (var t in o) { var n = o[t]; o[t] = "object" == typeof n && null !== n ? this.traverseObject(n, c) : c(t, n) } return o }
	string2number(string) { if (string && !isNaN(string)) string = parseInt(string, 10); return string }
}

class Http {
	constructor(env) {
		this.env = env
	}

	send(opts, method = 'GET') {
		opts = typeof opts === 'string' ? { url: opts } : opts
		let sender = this.get
		if (method === 'POST') {
			sender = this.post
		}
		return new Promise((resolve, reject) => {
			sender.call(this, opts, (error, response, body) => {
				if (error) reject(error)
				else resolve(response)
			})
		})
	}

	get(opts) {
		return this.send.call(this.env, opts)
	}

	post(opts) {
		return this.send.call(this.env, opts, 'POST')
	}
}


/***/ }),

/***/ "./src/URI/URI.mjs":
/*!*************************!*\
  !*** ./src/URI/URI.mjs ***!
  \*************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ URI)
/* harmony export */ });
class URI {
	constructor(opts = []) {
		this.name = "URI v1.2.6";
		this.opts = opts;
		this.json = { scheme: "", host: "", path: "", query: {} };
	};

	parse(url) {
		const URLRegex = /(?:(?<scheme>.+):\/\/(?<host>[^/]+))?\/?(?<path>[^?]+)?\??(?<query>[^?]+)?/;
		let json = url.match(URLRegex)?.groups ?? null;
		if (json?.path) json.paths = json.path.split("/"); else json.path = "";
		//if (json?.paths?.at(-1)?.includes(".")) json.format = json.paths.at(-1).split(".").at(-1);
		if (json?.paths) {
			const fileName = json.paths[json.paths.length - 1];
			if (fileName?.includes(".")) {
				const list = fileName.split(".");
				json.format = list[list.length - 1];
			}
		}
		if (json?.query) json.query = Object.fromEntries(json.query.split("&").map((param) => param.split("=")));
		return json
	};

	stringify(json = this.json) {
		let url = "";
		if (json?.scheme && json?.host) url += json.scheme + "://" + json.host;
		if (json?.path) url += (json?.host) ? "/" + json.path : json.path;
		if (json?.query) url += "?" + Object.entries(json.query).map(param => param.join("=")).join("&");
		return url
	};
}


/***/ }),

/***/ "./src/XML/XML.mjs":
/*!*************************!*\
  !*** ./src/XML/XML.mjs ***!
  \*************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ XML)
/* harmony export */ });
// refer: https://github.com/Peng-YM/QuanX/blob/master/Tools/XMLParser/xml-parser.js
// refer: https://goessner.net/download/prj/jsonxml/
class XML {
	#ATTRIBUTE_KEY = "@";
	#CHILD_NODE_KEY = "#";
	#UNESCAPE = {
		"&amp;": "&",
		"&lt;": "<",
		"&gt;": ">",
		"&apos;": "'",
		"&quot;": '"'
	};
	#ESCAPE = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"'": "&apos;",
		'"': "&quot;"
	};

	constructor(opts) {
		this.name = "XML v0.4.0-2";
		this.opts = opts;
		BigInt.prototype.toJSON = () => this.toString();
	};

	parse(xml = new String, reviver = "") {
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
							child.raw = tag.match(/!\[CDATA\[(.+)\]\]/);
							//appendText(tag.slice(9, -2));
						} else {
							// Comment section
							child.name = name;
							child.raw = tags.join(" ");
						};
						appendChild(child);
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
								};
								break;
						};
						break;
				};

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
				};
			};

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
		};
		/***************** Fuctions *****************/
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
							object = Object.assign(object, plist)
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
							object = parseFloat(real)//.toFixed(digits);
							break;
						case "string":
							const string = children[0];
							object = string;
							break;
					};
					if (reviver) object = reviver(name || "", object);
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
			};
		}

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
						if (typeof child === "string") addObject(object, CHILD_NODE_KEY, fromXML(child, reviver), undefined)
						else if (!child.tag && !child.children && !child.raw) addObject(object, child.name, fromXML(child, reviver), children?.[i - 1]?.name)
						else addObject(object, child.name, fromXML(child, reviver), undefined)
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

	stringify(json = new Object, tab = "") {
		const ESCAPE = this.#ESCAPE;
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
									};
								};
							};
							xml += (xml.slice(-1) === "\n" ? Ind : "") + `</${Name}>`;
						};
					};
					break;
				case "string":
					switch (Name) {
						case "?xml":
							xml += `${Ind}<${Name} ${Elem.toString()}>`;
							break;
						case "?":
							xml += `${Ind}<${Name}${Elem.toString()}${Name}>`;
							break;
						case "!":
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
					};
					break;
				case "undefined":
					xml += Ind + `<${Name.toString()}/>`;
					break;
			};
			return xml;
		};

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
					};
					break;
			}
			return plist;
		};
	};
}


/***/ }),

/***/ "./src/function/setENV.mjs":
/*!*********************************!*\
  !*** ./src/function/setENV.mjs ***!
  \*********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ setENV)
/* harmony export */ });
/* harmony import */ var _ENV_ENV_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ENV/ENV.mjs */ "./src/ENV/ENV.mjs");
/*
README: https://github.com/VirgilClyne/iRingo
*/


const $ = new _ENV_ENV_mjs__WEBPACK_IMPORTED_MODULE_0__["default"](" iRingo: Set Environment Variables beta");

/**
 * Set Environment Variables
 * @author VirgilClyne
 * @param {String} name - Persistent Store Key
 * @param {Array} platforms - Platform Names
 * @param {Object} database - Default DataBase
 * @return {Object} { Settings, Caches, Configs }
 */
function setENV(name, platforms, database) {
	$.log(`☑️ ${$.name}`, "");
	let { Settings, Caches, Configs } = $.getENV(name, platforms, database);
	/***************** Settings *****************/
	if (Settings?.Tabs && !Array.isArray(Settings?.Tabs)) $.lodash_set(Settings, "Tabs", (Settings?.Tabs) ? [Settings.Tabs.toString()] : []);
	if (Settings?.Domains && !Array.isArray(Settings?.Domains)) $.lodash_set(Settings, "Domains", (Settings?.Domains) ? [Settings.Domains.toString()] : []);
	if (Settings?.Functions && !Array.isArray(Settings?.Functions)) $.lodash_set(Settings, "Functions", (Settings?.Functions) ? [Settings.Functions.toString()] : []);
	$.log(`✅ ${$.name}`, `Settings: ${typeof Settings}`, `Settings内容: ${JSON.stringify(Settings)}`, "");
	/***************** Caches *****************/
	//$.log(`✅ ${$.name}`, `Caches: ${typeof Caches}`, `Caches内容: ${JSON.stringify(Caches)}`, "");
	/***************** Configs *****************/
	Configs.Storefront = new Map(Configs.Storefront);
	if (Configs.Locale) Configs.Locale = new Map(Configs.Locale);
	if (Configs.i18n) for (let type in Configs.i18n) Configs.i18n[type] = new Map(Configs.i18n[type]);
	return { Settings, Caches, Configs };
};


/***/ }),

/***/ "./src/database/Default.json":
/*!***********************************!*\
  !*** ./src/database/Default.json ***!
  \***********************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"Settings":{"Switch":true},"Configs":{"Storefront":[["AE","143481"],["AF","143610"],["AG","143540"],["AI","143538"],["AL","143575"],["AM","143524"],["AO","143564"],["AR","143505"],["AT","143445"],["AU","143460"],["AZ","143568"],["BA","143612"],["BB","143541"],["BD","143490"],["BE","143446"],["BF","143578"],["BG","143526"],["BH","143559"],["BJ","143576"],["BM","143542"],["BN","143560"],["BO","143556"],["BR","143503"],["BS","143539"],["BT","143577"],["BW","143525"],["BY","143565"],["BZ","143555"],["CA","143455"],["CD","143613"],["CG","143582"],["CH","143459"],["CI","143527"],["CL","143483"],["CM","143574"],["CN","143465"],["CO","143501"],["CR","143495"],["CV","143580"],["CY","143557"],["CZ","143489"],["DE","143443"],["DK","143458"],["DM","143545"],["DO","143508"],["DZ","143563"],["EC","143509"],["EE","143518"],["EG","143516"],["ES","143454"],["FI","143447"],["FJ","143583"],["FM","143591"],["FR","143442"],["GA","143614"],["GB","143444"],["GD","143546"],["GF","143615"],["GH","143573"],["GM","143584"],["GR","143448"],["GT","143504"],["GW","143585"],["GY","143553"],["HK","143463"],["HN","143510"],["HR","143494"],["HU","143482"],["ID","143476"],["IE","143449"],["IL","143491"],["IN","143467"],["IQ","143617"],["IS","143558"],["IT","143450"],["JM","143511"],["JO","143528"],["JP","143462"],["KE","143529"],["KG","143586"],["KH","143579"],["KN","143548"],["KP","143466"],["KR","143466"],["KW","143493"],["KY","143544"],["KZ","143517"],["TC","143552"],["TD","143581"],["TJ","143603"],["TH","143475"],["TM","143604"],["TN","143536"],["TO","143608"],["TR","143480"],["TT","143551"],["TW","143470"],["TZ","143572"],["LA","143587"],["LB","143497"],["LC","143549"],["LI","143522"],["LK","143486"],["LR","143588"],["LT","143520"],["LU","143451"],["LV","143519"],["LY","143567"],["MA","143620"],["MD","143523"],["ME","143619"],["MG","143531"],["MK","143530"],["ML","143532"],["MM","143570"],["MN","143592"],["MO","143515"],["MR","143590"],["MS","143547"],["MT","143521"],["MU","143533"],["MV","143488"],["MW","143589"],["MX","143468"],["MY","143473"],["MZ","143593"],["NA","143594"],["NE","143534"],["NG","143561"],["NI","143512"],["NL","143452"],["NO","143457"],["NP","143484"],["NR","143606"],["NZ","143461"],["OM","143562"],["PA","143485"],["PE","143507"],["PG","143597"],["PH","143474"],["PK","143477"],["PL","143478"],["PT","143453"],["PW","143595"],["PY","143513"],["QA","143498"],["RO","143487"],["RS","143500"],["RU","143469"],["RW","143621"],["SA","143479"],["SB","143601"],["SC","143599"],["SE","143456"],["SG","143464"],["SI","143499"],["SK","143496"],["SL","143600"],["SN","143535"],["SR","143554"],["ST","143598"],["SV","143506"],["SZ","143602"],["UA","143492"],["UG","143537"],["US","143441"],["UY","143514"],["UZ","143566"],["VC","143550"],["VE","143502"],["VG","143543"],["VN","143471"],["VU","143609"],["XK","143624"],["YE","143571"],["ZA","143472"],["ZM","143622"],["ZW","143605"]]}}');

/***/ }),

/***/ "./src/database/Location.json":
/*!************************************!*\
  !*** ./src/database/Location.json ***!
  \************************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"Settings":{"Switch":true,"PEP":{"GCC":"US"},"Services":{"PlaceData":"CN","Directions":"AUTO","Traffic":"AUTO","RAP":"XX","Tiles":"AUTO"},"Geo_manifest":{"Dynamic":{"Config":{"Country_code":{"default":"AUTO","iOS":"CN","iPadOS":"CN","watchOS":"US","macOS":"CN"}}}},"Config":{"Announcements":{"Environment:":{"default":"AUTO","iOS":"CN","iPadOS":"CN","watchOS":"XX","macOS":"CN"}},"Defaults":{"LagunaBeach":true,"DrivingMultiWaypointRoutesEnabled":true,"GEOAddressCorrection":true,"LookupMaxParametersCount":true,"LocalitiesAndLandmarks":true,"POIBusyness":true,"PedestrianAR":true,"6694982d2b14e95815e44e970235e230":true,"OpticalHeading":true,"UseCLPedestrianMapMatchedLocations":true,"TransitPayEnabled":true,"SupportsOffline":true,"SupportsCarIntegration":true,"WiFiQualityNetworkDisabled":false,"WiFiQualityTileDisabled":false}}}}');

/***/ }),

/***/ "./src/database/News.json":
/*!********************************!*\
  !*** ./src/database/News.json ***!
  \********************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"Settings":{"Switch":true,"CountryCode":"US","newsPlusUser":true}}');

/***/ }),

/***/ "./src/database/PrivateRelay.json":
/*!****************************************!*\
  !*** ./src/database/PrivateRelay.json ***!
  \****************************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"Settings":{"Switch":true,"CountryCode":"US","canUse":true}}');

/***/ }),

/***/ "./src/database/Siri.json":
/*!********************************!*\
  !*** ./src/database/Siri.json ***!
  \********************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"Settings":{"Switch":true,"CountryCode":"SG","Domains":["web","itunes","app_store","movies","restaurants","maps"],"Functions":["flightutilities","lookup","mail","messages","news","safari","siri","spotlight","visualintelligence"],"Safari_Smart_History":true},"Configs":{"VisualIntelligence":{"enabled_domains":["pets","media","books","art","nature","landmarks"],"supported_domains":["ART","BOOK","MEDIA","LANDMARK","ANIMALS","BIRDS","FOOD","SIGN_SYMBOL","AUTO_SYMBOL","DOGS","NATURE","NATURAL_LANDMARK","INSECTS","REPTILES","ALBUM","STOREFRONT","LAUNDRY_CARE_SYMBOL","CATS","OBJECT_2D","SCULPTURE","SKYLINE","MAMMALS"]}}}');

/***/ }),

/***/ "./src/database/TV.json":
/*!******************************!*\
  !*** ./src/database/TV.json ***!
  \******************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"Settings":{"Switch":true,"Third-Party":false,"HLSUrl":"play-edge.itunes.apple.com","ServerUrl":"play.itunes.apple.com","Tabs":["WatchNow","Originals","MLS","Sports","Kids","Store","Movies","TV","ChannelsAndApps","Library","Search"],"CountryCode":{"Configs":"AUTO","Settings":"AUTO","View":["SG","TW"],"WatchNow":"AUTO","Channels":"AUTO","Originals":"AUTO","Sports":"US","Kids":"US","Store":"AUTO","Movies":"AUTO","TV":"AUTO","Persons":"SG","Search":"AUTO","Others":"AUTO"}},"Configs":{"Locale":[["AU","en-AU"],["CA","en-CA"],["GB","en-GB"],["KR","ko-KR"],["HK","yue-Hant"],["JP","ja-JP"],["MO","zh-Hant"],["TW","zh-Hant"],["US","en-US"],["SG","zh-Hans"]],"Tabs":[{"title":"主页","type":"WatchNow","universalLinks":["https://tv.apple.com/watch-now","https://tv.apple.com/home"],"destinationType":"Target","target":{"id":"tahoma_watchnow","type":"Root","url":"https://tv.apple.com/watch-now"},"isSelected":true},{"title":"Apple TV+","type":"Originals","universalLinks":["https://tv.apple.com/channel/tvs.sbd.4000","https://tv.apple.com/atv"],"destinationType":"Target","target":{"id":"tvs.sbd.4000","type":"Brand","url":"https://tv.apple.com/us/channel/tvs.sbd.4000"}},{"title":"MLS Season Pass","type":"MLS","universalLinks":["https://tv.apple.com/mls"],"destinationType":"Target","target":{"id":"tvs.sbd.7000","type":"Brand","url":"https://tv.apple.com/us/channel/tvs.sbd.7000"}},{"title":"体育节目","type":"Sports","universalLinks":["https://tv.apple.com/sports"],"destinationType":"Target","target":{"id":"tahoma_sports","type":"Root","url":"https://tv.apple.com/sports"}},{"title":"儿童","type":"Kids","universalLinks":["https://tv.apple.com/kids"],"destinationType":"Target","target":{"id":"tahoma_kids","type":"Root","url":"https://tv.apple.com/kids"}},{"title":"电影","type":"Movies","universalLinks":["https://tv.apple.com/movies"],"destinationType":"Target","target":{"id":"tahoma_movies","type":"Root","url":"https://tv.apple.com/movies"}},{"title":"电视节目","type":"TV","universalLinks":["https://tv.apple.com/tv-shows"],"destinationType":"Target","target":{"id":"tahoma_tvshows","type":"Root","url":"https://tv.apple.com/tv-shows"}},{"title":"商店","type":"Store","universalLinks":["https://tv.apple.com/store"],"destinationType":"SubTabs","subTabs":[{"title":"电影","type":"Movies","universalLinks":["https://tv.apple.com/movies"],"destinationType":"Target","target":{"id":"tahoma_movies","type":"Root","url":"https://tv.apple.com/movies"}},{"title":"电视节目","type":"TV","universalLinks":["https://tv.apple.com/tv-shows"],"destinationType":"Target","target":{"id":"tahoma_tvshows","type":"Root","url":"https://tv.apple.com/tv-shows"}}]},{"title":"频道和 App","destinationType":"SubTabs","subTabsPlacementType":"ExpandedList","type":"ChannelsAndApps","subTabs":[]},{"title":"资料库","type":"Library","destinationType":"Client"},{"title":"搜索","type":"Search","universalLinks":["https://tv.apple.com/search"],"destinationType":"Target","target":{"id":"tahoma_search","type":"Root","url":"https://tv.apple.com/search"}}],"i18n":{"WatchNow":[["en","Home"],["zh","主页"],["zh-Hans","主頁"],["zh-Hant","主頁"]],"Movies":[["en","Movies"],["zh","电影"],["zh-Hans","电影"],["zh-Hant","電影"]],"TV":[["en","TV"],["zh","电视节目"],["zh-Hans","电视节目"],["zh-Hant","電視節目"]],"Store":[["en","Store"],["zh","商店"],["zh-Hans","商店"],["zh-Hant","商店"]],"Sports":[["en","Sports"],["zh","体育节目"],["zh-Hans","体育节目"],["zh-Hant","體育節目"]],"Kids":[["en","Kids"],["zh","儿童"],["zh-Hans","儿童"],["zh-Hant","兒童"]],"Library":[["en","Library"],["zh","资料库"],["zh-Hans","资料库"],["zh-Hant","資料庫"]],"Search":[["en","Search"],["zh","搜索"],["zh-Hans","搜索"],["zh-Hant","蒐索"]]}}}');

/***/ }),

/***/ "./src/database/TestFlight.json":
/*!**************************************!*\
  !*** ./src/database/TestFlight.json ***!
  \**************************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"Settings":{"Switch":"true","CountryCode":"US","MultiAccount":"false","Universal":"true"}}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	(() => {
/******/ 		var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
/******/ 		var leafPrototypes;
/******/ 		// create a fake namespace object
/******/ 		// mode & 1: value is a module id, require it
/******/ 		// mode & 2: merge all properties of value into the ns
/******/ 		// mode & 4: return value when already ns object
/******/ 		// mode & 16: return value when it's Promise-like
/******/ 		// mode & 8|1: behave like require
/******/ 		__webpack_require__.t = function(value, mode) {
/******/ 			if(mode & 1) value = this(value);
/******/ 			if(mode & 8) return value;
/******/ 			if(typeof value === 'object' && value) {
/******/ 				if((mode & 4) && value.__esModule) return value;
/******/ 				if((mode & 16) && typeof value.then === 'function') return value;
/******/ 			}
/******/ 			var ns = Object.create(null);
/******/ 			__webpack_require__.r(ns);
/******/ 			var def = {};
/******/ 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 			for(var current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 				Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
/******/ 			}
/******/ 			def['default'] = () => (value);
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**************************************!*\
  !*** ./src/Location.request.beta.js ***!
  \**************************************/
var _database_Default_json__WEBPACK_IMPORTED_MODULE_4___namespace_cache;
var _database_Location_json__WEBPACK_IMPORTED_MODULE_5___namespace_cache;
var _database_News_json__WEBPACK_IMPORTED_MODULE_6___namespace_cache;
var _database_PrivateRelay_json__WEBPACK_IMPORTED_MODULE_7___namespace_cache;
var _database_Siri_json__WEBPACK_IMPORTED_MODULE_8___namespace_cache;
var _database_TestFlight_json__WEBPACK_IMPORTED_MODULE_9___namespace_cache;
var _database_TV_json__WEBPACK_IMPORTED_MODULE_10___namespace_cache;
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _ENV_ENV_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ENV/ENV.mjs */ "./src/ENV/ENV.mjs");
/* harmony import */ var _URI_URI_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./URI/URI.mjs */ "./src/URI/URI.mjs");
/* harmony import */ var _XML_XML_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./XML/XML.mjs */ "./src/XML/XML.mjs");
/* harmony import */ var _function_setENV_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./function/setENV.mjs */ "./src/function/setENV.mjs");
/* harmony import */ var _database_Default_json__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./database/Default.json */ "./src/database/Default.json");
/* harmony import */ var _database_Location_json__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./database/Location.json */ "./src/database/Location.json");
/* harmony import */ var _database_News_json__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./database/News.json */ "./src/database/News.json");
/* harmony import */ var _database_PrivateRelay_json__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./database/PrivateRelay.json */ "./src/database/PrivateRelay.json");
/* harmony import */ var _database_Siri_json__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./database/Siri.json */ "./src/database/Siri.json");
/* harmony import */ var _database_TestFlight_json__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./database/TestFlight.json */ "./src/database/TestFlight.json");
/* harmony import */ var _database_TV_json__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./database/TV.json */ "./src/database/TV.json");
/*
README: https://github.com/VirgilClyne/iRingo
*/














const $ = new _ENV_ENV_mjs__WEBPACK_IMPORTED_MODULE_0__["default"](" iRingo: 📍 Location v3.0.5(1) request.beta");
const URI = new _URI_URI_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]();
const XML = new _XML_XML_mjs__WEBPACK_IMPORTED_MODULE_2__["default"]();
const DataBase = {
	"Default": /*#__PURE__*/ (_database_Default_json__WEBPACK_IMPORTED_MODULE_4___namespace_cache || (_database_Default_json__WEBPACK_IMPORTED_MODULE_4___namespace_cache = __webpack_require__.t(_database_Default_json__WEBPACK_IMPORTED_MODULE_4__, 2))),
	"Location": /*#__PURE__*/ (_database_Location_json__WEBPACK_IMPORTED_MODULE_5___namespace_cache || (_database_Location_json__WEBPACK_IMPORTED_MODULE_5___namespace_cache = __webpack_require__.t(_database_Location_json__WEBPACK_IMPORTED_MODULE_5__, 2))),
	"News": /*#__PURE__*/ (_database_News_json__WEBPACK_IMPORTED_MODULE_6___namespace_cache || (_database_News_json__WEBPACK_IMPORTED_MODULE_6___namespace_cache = __webpack_require__.t(_database_News_json__WEBPACK_IMPORTED_MODULE_6__, 2))),
	"PrivateRelay": /*#__PURE__*/ (_database_PrivateRelay_json__WEBPACK_IMPORTED_MODULE_7___namespace_cache || (_database_PrivateRelay_json__WEBPACK_IMPORTED_MODULE_7___namespace_cache = __webpack_require__.t(_database_PrivateRelay_json__WEBPACK_IMPORTED_MODULE_7__, 2))),
	"Siri": /*#__PURE__*/ (_database_Siri_json__WEBPACK_IMPORTED_MODULE_8___namespace_cache || (_database_Siri_json__WEBPACK_IMPORTED_MODULE_8___namespace_cache = __webpack_require__.t(_database_Siri_json__WEBPACK_IMPORTED_MODULE_8__, 2))),
	"TestFlight": /*#__PURE__*/ (_database_TestFlight_json__WEBPACK_IMPORTED_MODULE_9___namespace_cache || (_database_TestFlight_json__WEBPACK_IMPORTED_MODULE_9___namespace_cache = __webpack_require__.t(_database_TestFlight_json__WEBPACK_IMPORTED_MODULE_9__, 2))),
	"TV": /*#__PURE__*/ (_database_TV_json__WEBPACK_IMPORTED_MODULE_10___namespace_cache || (_database_TV_json__WEBPACK_IMPORTED_MODULE_10___namespace_cache = __webpack_require__.t(_database_TV_json__WEBPACK_IMPORTED_MODULE_10__, 2))),
};

// 构造回复数据
let $response = undefined;

/***************** Processing *****************/
// 解构URL
const URL = URI.parse($request.url);
$.log(`⚠ ${$.name}`, `URL: ${JSON.stringify(URL)}`, "");
// 获取连接参数
const METHOD = $request.method, HOST = URL.host, PATH = URL.path, PATHs = URL.paths;
$.log(`⚠ ${$.name}`, `METHOD: ${METHOD}`, "");
// 解析格式
const FORMAT = ($request.headers?.["Content-Type"] ?? $request.headers?.["content-type"])?.split(";")?.[0];
$.log(`⚠ ${$.name}`, `FORMAT: ${FORMAT}`, "");
(async () => {
	const { Settings, Caches, Configs } = (0,_function_setENV_mjs__WEBPACK_IMPORTED_MODULE_3__["default"])("iRingo", "Location", DataBase);
	$.log(`⚠ ${$.name}`, `Settings.Switch: ${Settings?.Switch}`, "");
	switch (Settings.Switch) {
		case true:
		default:
			// 创建空数据
			let body = {};
			// 方法判断
			switch (METHOD) {
				case "POST":
				case "PUT":
				case "PATCH":
				case "DELETE":
					// 格式判断
					switch (FORMAT) {
						case undefined: // 视为无body
							break;
						case "application/x-www-form-urlencoded":
						case "text/plain":
						case "text/html":
						default:
							break;
						case "application/x-mpegURL":
						case "application/x-mpegurl":
						case "application/vnd.apple.mpegurl":
						case "audio/mpegurl":
							//body = M3U8.parse($request.body);
							//$.log(`🚧 ${$.name}`, `body: ${JSON.stringify(body)}`, "");
							//$request.body = M3U8.stringify(body);
							break;
						case "text/xml":
						case "text/plist":
						case "application/xml":
						case "application/plist":
						case "application/x-plist":
							body = XML.parse($request.body);
							$.log(`🚧 ${$.name}`, `body: ${JSON.stringify(body)}`, "");
							$request.body = XML.stringify(body);
							break;
						case "text/vtt":
						case "application/vtt":
							//body = VTT.parse($request.body);
							//$.log(`🚧 ${$.name}`, `body: ${JSON.stringify(body)}`, "");
							//$request.body = VTT.stringify(body);
							break;
						case "text/json":
						case "application/json":
							body = JSON.parse($request.body ?? "{}");
							$.log(`🚧 ${$.name}`, `body: ${JSON.stringify(body)}`, "");
							$request.body = JSON.stringify(body);
							break;
						case "application/protobuf":
						case "application/x-protobuf":
						case "application/vnd.google.protobuf":
						case "application/grpc":
						case "application/grpc+proto":
						case "applecation/octet-stream":
							break;
					};
					//break; // 不中断，继续处理URL
				case "GET":
				case "HEAD":
				case "OPTIONS":
				case undefined: // QX牛逼，script-echo-response不返回method
				default:
					// 主机判断
					switch (HOST) {
						case "configuration.ls.apple.com":
							// 路径判断
							switch (PATH) {
								case "config/defaults":
									$.lodash_set(Caches, "Defaults.ETag", setETag($request?.headers?.["If-None-Match"] ?? $request?.headers?.["if-none-match"], Caches?.Defaults?.ETag));
									$.setjson(Caches, "@iRingo.Location.Caches");
									break;
							};
							break;
						case "gspe1-ssl.ls.apple.com":
							switch (PATH) {
								case "pep/gcc":
									/* // 不使用 echo response
									$response = {
										status: 200,
										headers: {
											"Content-Type": "text/html",
											Date: new Date().toUTCString(),
											Connection: "keep-alive",
											"Content-Encoding": "identity",
										},
										body: Settings.PEP.GCC,
									};
									$.log(JSON.stringify($response));
									*/
									break;
							};
							break;
						case "gsp-ssl.ls.apple.com":
						case "dispatcher.is.autonavi.com":
						case "direction2.is.autonavi.com":
							switch (PATH) {
								case "dispatcher.arpc":
								case "dispatcher":
									switch (Settings?.Services?.PlaceData) {
										case "AUTO":
										default:
											break;
										case "CN":
											URL.host = "dispatcher.is.autonavi.com";
											URL.path = "dispatcher";
											break;
										case "XX":
											URL.host = "gsp-ssl.ls.apple.com";
											URL.path = "dispatcher.arpc";
											break;
									};
									break;
								case "directions.arpc":
								case "direction":
									switch (Settings?.Services?.Directions) {
										case "AUTO":
										default:
											break;
										case "CN":
											URL.host = "direction2.is.autonavi.com";
											URL.path = "direction";
											break;
										case "XX":
											URL.host = "gsp-ssl.ls.apple.com";
											URL.path = "directions.arpc";
											break;
									};
									break;
							};
							break;
						case "sundew.ls.apple.com":
						case "rap.is.autonavi.com":
							switch (PATH) {
								case "v1/feedback/submission.arpc":
								case "rap":
									switch (Settings?.Services?.RAP) {
										case "AUTO":
										default:
											break;
										case "CN":
											URL.host = "rap.is.autonavi.com";
											URL.path = "rap";
											break;
										case "XX":
											URL.host = "sundew.ls.apple.com";
											URL.path = "v1/feedback/submission.arpc";
											break;
									};
									break;
								case "grp/st":
								case "rapstatus":
									switch (Settings?.Services?.RAP) {
										case "AUTO":
										default:
											break;
										case "CN":
											URL.host = "rap.is.autonavi.com";
											URL.path = "rapstatus";
											break;
										case "XX":
											URL.host = "sundew.ls.apple.com";
											URL.path = "grp/st";
											break;
									};
									break;
							};
							break;
						case "gspe12-ssl.ls.apple.com":
						case "gspe12-cn-ssl.ls.apple.com":
							switch (PATH) {
								case "traffic":
									switch (Settings?.Services?.Traffic) {
										case "AUTO":
										default:
											break;
										case "CN":
											URL.host = "gspe12-cn-ssl.ls.apple.com";
											break;
										case "XX":
											URL.host = "gspe12-ssl.ls.apple.com";
											break;
									};
									break;
							};
							break;
						case "gspe19-ssl.ls.apple.com":
						case "gspe19-cn-ssl.ls.apple.com":
							switch (PATH) {
								case "tile.vf":
								case "tiles":
									switch (Settings?.Services?.Tiles) {
										case "AUTO":
										default:
											break;
										case "CN":
											URL.host = "gspe19-cn-ssl.ls.apple.com";
											URL.path = "tiles";
											break;
										case "XX":
											URL.host = "gspe19-ssl.ls.apple.com";
											URL.path = "tile.vf";
											break;
									};
									break;
							};
							break;
						case "gspe35-ssl.ls.apple.com":
						case "gspe35-ssl.ls.apple.cn":
							switch (PATH) {
								case "config/announcements":
									switch (URL.query?.os) {
										case "ios":
										case "ipados":
										case "macos":
										default:
											switch (Settings?.Config?.Announcements?.Environment?.default) {
												case "AUTO":
													switch (Caches?.pep?.gcc) {
														default:
															URL.query.environment = "prod";
															break;
														case "CN":
														case undefined:
															URL.query.environment = "prod-cn";
															break;
													};
													break;
												case "CN":
												default:
													URL.query.environment = "prod-cn";
													break;
												case "XX":
													URL.query.environment = "prod";
													break;
											};
											break;
										case "watchos":
											switch (Settings?.Config?.Announcements?.Environment?.watchOS) {
												case "AUTO":
													switch (Caches?.pep?.gcc) {
														default:
															URL.query.environment = "prod";
															break;
														case "CN":
														case undefined:
															URL.query.environment = "prod-cn";
															break;
													};
													break;
												case "XX":
												default:
													URL.query.environment = "prod";
													break;
												case "CN":
													URL.query.environment = "prod-cn";
													break;
											};
											break;
									};
									$.lodash_set(Caches, "Announcements.ETag", setETag($request.headers?.["If-None-Match"] ?? $request.headers?.["if-none-match"], Caches?.Announcements?.ETag));
									$.setjson(Caches, "@iRingo.Location.Caches");
									break;
								case "geo_manifest/dynamic/config":
									switch (URL.query?.os) {
										case "ios":
										case "ipados":
										case "macos":
										default:
											switch (Settings?.Geo_manifest?.Dynamic?.Config?.Country_code?.default) {
												case "AUTO":
													switch (Caches?.pep?.gcc) {
														default:
															URL.query.country_code = Caches?.pep?.gcc ?? "US";
															break;
														case "CN":
														case undefined:
															URL.query.country_code = "CN";
															break;
													};
													break;
												default:
													URL.query.country_code = Settings?.Geo_manifest?.Dynamic?.Config?.Country_code?.default ?? "CN";
													break;
											};
											break;
										case "watchos":
											switch (Settings?.Geo_manifest?.Dynamic?.Config?.Country_code?.watchOS) {
												case "AUTO":
													switch (Caches?.pep?.gcc) {
														default:
															URL.query.country_code = Caches?.pep?.gcc ?? "US";
															break;
														case "CN":
														case undefined:
															URL.query.country_code = "CN";
															break;
													};
													break;
												default:
													URL.query.country_code = Settings?.Geo_manifest?.Dynamic?.Config?.Country_code?.watchOS ?? "US";
													break;
											};
											break;
									};
									$.lodash_set(Caches, "Dynamic.ETag", setETag($request?.headers?.["If-None-Match"] ?? $request?.headers?.["if-none-match"], Caches?.Dynamic?.ETag));
									$.setjson(Caches, "@iRingo.Location.Caches");
									break;
							};
							break;
					};
					break;
				case "CONNECT":
				case "TRACE":
					break;
			};
			if ($request.headers?.Host) $request.headers.Host = URL.host;
			$request.url = URI.stringify(URL);
			$.log(`🚧 ${$.name}, 调试信息`, `$request.url: ${$request.url}`, "");
			break;
		case false:
			break;
	};
})()
	.catch((e) => $.logErr(e))
	.finally(() => {
		switch ($response) {
			default: { // 有构造回复数据，返回构造的回复数据
				const FORMAT = ($response?.headers?.["Content-Type"] ?? $response?.headers?.["content-type"])?.split(";")?.[0];
				$.log(`🎉 ${$.name}, finally`, `echo $response`, `FORMAT: ${FORMAT}`, "");
				//$.log(`🚧 ${$.name}, finally`, `echo $response: ${JSON.stringify($response)}`, "");
				if ($response?.headers?.["Content-Encoding"]) $response.headers["Content-Encoding"] = "identity";
				if ($response?.headers?.["content-encoding"]) $response.headers["content-encoding"] = "identity";
				if ($.isQuanX()) {
					$response.status = "HTTP/1.1 200 OK";
					delete $response?.headers?.["Content-Length"];
					delete $response?.headers?.["content-length"];
					delete $response?.headers?.["Transfer-Encoding"];
					switch (FORMAT) {
						case undefined: // 视为无body
							// 返回普通数据
							$.done({ status: $response.status, headers: $response.headers });
							break;
						default:
							// 返回普通数据
							$.done({ status: $response.status, headers: $response.headers, body: $response.body });
							break;
						case "application/protobuf":
						case "application/x-protobuf":
						case "application/vnd.google.protobuf":
						case "application/grpc":
						case "application/grpc+proto":
						case "applecation/octet-stream":
							// 返回二进制数据
							//$.log(`${$response.bodyBytes.byteLength}---${$response.bodyBytes.buffer.byteLength}`);
							$.done({ status: $response.status, headers: $response.headers, bodyBytes: $response.bodyBytes });
							break;
					};
				} else $.done({ response: $response });
				break;
			};
			case undefined: { // 无构造回复数据，发送修改的请求数据
				//const FORMAT = ($request?.headers?.["Content-Type"] ?? $request?.headers?.["content-type"])?.split(";")?.[0];
				$.log(`🎉 ${$.name}, finally`, `$request`, `FORMAT: ${FORMAT}`, "");
				//$.log(`🚧 ${$.name}, finally`, `$request: ${JSON.stringify($request)}`, "");
				if ($.isQuanX()) {
					switch (FORMAT) {
						case undefined: // 视为无body
							// 返回普通数据
							$.done({ url: $request.url, headers: $request.headers })
							break;
						default:
							// 返回普通数据
							$.done({ url: $request.url, headers: $request.headers, body: $request.body })
							break;
						case "application/protobuf":
						case "application/x-protobuf":
						case "application/vnd.google.protobuf":
						case "application/grpc":
						case "application/grpc+proto":
						case "applecation/octet-stream":
							// 返回二进制数据
							//$.log(`${$request.bodyBytes.byteLength}---${$request.bodyBytes.buffer.byteLength}`);
							$.done({ url: $request.url, headers: $request.headers, bodyBytes: $request.bodyBytes.buffer.slice($request.bodyBytes.byteOffset, $request.bodyBytes.byteLength + $request.bodyBytes.byteOffset) });
							break;
					};
				} else $.done($request);
				break;
			};
		};
	})

/***************** Function *****************/
/**
 * Set ETag
 * @author VirgilClyne
 * @param {String} IfNoneMatch - If-None-Match
 * @return {String} ETag - ETag
 */
function setETag(IfNoneMatch, ETag) {
	$.log(`☑️ ${$.name}, Set ETag`, `If-None-Match: ${IfNoneMatch}`, `ETag: ${ETag}`, "");
	if (IfNoneMatch !== ETag) {
		ETag = IfNoneMatch;
		delete $request?.headers?.["If-None-Match"];
		delete $request?.headers?.["if-none-match"];
	}
	$.log(`✅ ${$.name}, Set ETag`, "");
	return ETag;
};

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9jYXRpb24ucmVxdWVzdC5iZXRhLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFlO0FBQ2Y7QUFDQSxpQkFBaUIsS0FBSztBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQixVQUFVO0FBQy9COztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGNBQWMsS0FBSztBQUNuQixHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLEtBQUs7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsZUFBZSwrQkFBK0I7QUFDOUM7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0EsS0FBSztBQUNMLElBQUk7QUFDSjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxRUFBcUU7QUFDckU7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0I7QUFDcEIsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsa0NBQWtDO0FBQ2xDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBLFNBQVMsOENBQThDO0FBQ3ZEO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLG1DQUFtQztBQUNuQztBQUNBO0FBQ0E7O0FBRUE7QUFD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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsT0FBTywwQkFBMEIsYUFBYTtBQUM3RDtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2QsMkdBQTJHO0FBQzNHLGdCQUFnQixPQUFPLHlDQUF5QyxPQUFPO0FBQ3ZFLGtCQUFrQixPQUFPLCtCQUErQiwwQkFBMEI7QUFDbEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0Isc0RBQXNEO0FBQ3RFO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQiw0RUFBNEU7QUFDNUY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQiwrQkFBK0IsS0FBSyxzQ0FBc0M7QUFDNUYsZ0JBQWdCLHNGQUFzRjtBQUN0RztBQUNBO0FBQ0EsTUFBTSxjQUFjLHFCQUFxQjtBQUN6QztBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCLDJHQUEyRztBQUMzRyxnQkFBZ0IsT0FBTyxtQ0FBbUMsT0FBTztBQUNqRSxrQkFBa0IsT0FBTyx5QkFBeUIseUJBQXlCO0FBQzNFO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLDhDQUE4QztBQUM5RDtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsbUVBQW1FO0FBQ25GO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsOEJBQThCLEtBQUsscUNBQXFDO0FBQzFGLGdCQUFnQix3TEFBd0w7QUFDeE07QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQSxFQUFFOztBQUVGO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0EsYUFBYSxPQUFPLCtCQUErQixZQUFZLFlBQVksS0FBSztBQUNoRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxPQUFPO0FBQ25CO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9pcmluZ28vLi9zcmMvRU5WL0VOVi5tanMiLCJ3ZWJwYWNrOi8vaXJpbmdvLy4vc3JjL1VSSS9VUkkubWpzIiwid2VicGFjazovL2lyaW5nby8uL3NyYy9YTUwvWE1MLm1qcyIsIndlYnBhY2s6Ly9pcmluZ28vLi9zcmMvZnVuY3Rpb24vc2V0RU5WLm1qcyIsIndlYnBhY2s6Ly9pcmluZ28vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vaXJpbmdvL3dlYnBhY2svcnVudGltZS9jcmVhdGUgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2lyaW5nby93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vaXJpbmdvL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vaXJpbmdvL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vaXJpbmdvLy4vc3JjL0xvY2F0aW9uLnJlcXVlc3QuYmV0YS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBjbGFzcyBFTlYge1xuXHRjb25zdHJ1Y3RvcihuYW1lLCBvcHRzKSB7XG5cdFx0dGhpcy5uYW1lID0gYCR7bmFtZX0sIEVOViB2MS4wLjBgXG5cdFx0dGhpcy5odHRwID0gbmV3IEh0dHAodGhpcylcblx0XHR0aGlzLmRhdGEgPSBudWxsXG5cdFx0dGhpcy5kYXRhRmlsZSA9ICdib3guZGF0J1xuXHRcdHRoaXMubG9ncyA9IFtdXG5cdFx0dGhpcy5pc011dGUgPSBmYWxzZVxuXHRcdHRoaXMuaXNOZWVkUmV3cml0ZSA9IGZhbHNlXG5cdFx0dGhpcy5sb2dTZXBhcmF0b3IgPSAnXFxuJ1xuXHRcdHRoaXMuZW5jb2RpbmcgPSAndXRmLTgnXG5cdFx0dGhpcy5zdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuXHRcdE9iamVjdC5hc3NpZ24odGhpcywgb3B0cylcblx0XHR0aGlzLmxvZygnJywgYPCfj4EgJHt0aGlzLm5hbWV9LCDlvIDlp4shYClcblx0fVxuXG5cdFBsYXRmb3JtKCkge1xuXHRcdGlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mICRlbnZpcm9ubWVudCAmJiAkZW52aXJvbm1lbnRbJ3N1cmdlLXZlcnNpb24nXSlcblx0XHRcdHJldHVybiAnU3VyZ2UnXG5cdFx0aWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgJGVudmlyb25tZW50ICYmICRlbnZpcm9ubWVudFsnc3Rhc2gtdmVyc2lvbiddKVxuXHRcdFx0cmV0dXJuICdTdGFzaCdcblx0XHRpZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiAkdGFzaykgcmV0dXJuICdRdWFudHVtdWx0IFgnXG5cdFx0aWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgJGxvb24pIHJldHVybiAnTG9vbidcblx0XHRpZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiAkcm9ja2V0KSByZXR1cm4gJ1NoYWRvd3JvY2tldCdcblx0fVxuXG5cdGlzUXVhblgoKSB7XG5cdFx0cmV0dXJuICdRdWFudHVtdWx0IFgnID09PSB0aGlzLlBsYXRmb3JtKClcblx0fVxuXG5cdGlzU3VyZ2UoKSB7XG5cdFx0cmV0dXJuICdTdXJnZScgPT09IHRoaXMuUGxhdGZvcm0oKVxuXHR9XG5cblx0aXNMb29uKCkge1xuXHRcdHJldHVybiAnTG9vbicgPT09IHRoaXMuUGxhdGZvcm0oKVxuXHR9XG5cblx0aXNTaGFkb3dyb2NrZXQoKSB7XG5cdFx0cmV0dXJuICdTaGFkb3dyb2NrZXQnID09PSB0aGlzLlBsYXRmb3JtKClcblx0fVxuXG5cdGlzU3Rhc2goKSB7XG5cdFx0cmV0dXJuICdTdGFzaCcgPT09IHRoaXMuUGxhdGZvcm0oKVxuXHR9XG5cblx0dG9PYmooc3RyLCBkZWZhdWx0VmFsdWUgPSBudWxsKSB7XG5cdFx0dHJ5IHtcblx0XHRcdHJldHVybiBKU09OLnBhcnNlKHN0cilcblx0XHR9IGNhdGNoIHtcblx0XHRcdHJldHVybiBkZWZhdWx0VmFsdWVcblx0XHR9XG5cdH1cblxuXHR0b1N0cihvYmosIGRlZmF1bHRWYWx1ZSA9IG51bGwpIHtcblx0XHR0cnkge1xuXHRcdFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KG9iailcblx0XHR9IGNhdGNoIHtcblx0XHRcdHJldHVybiBkZWZhdWx0VmFsdWVcblx0XHR9XG5cdH1cblxuXHRnZXRqc29uKGtleSwgZGVmYXVsdFZhbHVlKSB7XG5cdFx0bGV0IGpzb24gPSBkZWZhdWx0VmFsdWVcblx0XHRjb25zdCB2YWwgPSB0aGlzLmdldGRhdGEoa2V5KVxuXHRcdGlmICh2YWwpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGpzb24gPSBKU09OLnBhcnNlKHRoaXMuZ2V0ZGF0YShrZXkpKVxuXHRcdFx0fSBjYXRjaCB7IH1cblx0XHR9XG5cdFx0cmV0dXJuIGpzb25cblx0fVxuXG5cdHNldGpzb24odmFsLCBrZXkpIHtcblx0XHR0cnkge1xuXHRcdFx0cmV0dXJuIHRoaXMuc2V0ZGF0YShKU09OLnN0cmluZ2lmeSh2YWwpLCBrZXkpXG5cdFx0fSBjYXRjaCB7XG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHR9XG5cdH1cblxuXHRnZXRTY3JpcHQodXJsKSB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG5cdFx0XHR0aGlzLmdldCh7IHVybCB9LCAoZXJyb3IsIHJlc3BvbnNlLCBib2R5KSA9PiByZXNvbHZlKGJvZHkpKVxuXHRcdH0pXG5cdH1cblxuXHRydW5TY3JpcHQoc2NyaXB0LCBydW5PcHRzKSB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG5cdFx0XHRsZXQgaHR0cGFwaSA9IHRoaXMuZ2V0ZGF0YSgnQGNoYXZ5X2JveGpzX3VzZXJDZmdzLmh0dHBhcGknKVxuXHRcdFx0aHR0cGFwaSA9IGh0dHBhcGkgPyBodHRwYXBpLnJlcGxhY2UoL1xcbi9nLCAnJykudHJpbSgpIDogaHR0cGFwaVxuXHRcdFx0bGV0IGh0dHBhcGlfdGltZW91dCA9IHRoaXMuZ2V0ZGF0YShcblx0XHRcdFx0J0BjaGF2eV9ib3hqc191c2VyQ2Zncy5odHRwYXBpX3RpbWVvdXQnXG5cdFx0XHQpXG5cdFx0XHRodHRwYXBpX3RpbWVvdXQgPSBodHRwYXBpX3RpbWVvdXQgPyBodHRwYXBpX3RpbWVvdXQgKiAxIDogMjBcblx0XHRcdGh0dHBhcGlfdGltZW91dCA9XG5cdFx0XHRcdHJ1bk9wdHMgJiYgcnVuT3B0cy50aW1lb3V0ID8gcnVuT3B0cy50aW1lb3V0IDogaHR0cGFwaV90aW1lb3V0XG5cdFx0XHRjb25zdCBba2V5LCBhZGRyXSA9IGh0dHBhcGkuc3BsaXQoJ0AnKVxuXHRcdFx0Y29uc3Qgb3B0cyA9IHtcblx0XHRcdFx0dXJsOiBgaHR0cDovLyR7YWRkcn0vdjEvc2NyaXB0aW5nL2V2YWx1YXRlYCxcblx0XHRcdFx0Ym9keToge1xuXHRcdFx0XHRcdHNjcmlwdF90ZXh0OiBzY3JpcHQsXG5cdFx0XHRcdFx0bW9ja190eXBlOiAnY3JvbicsXG5cdFx0XHRcdFx0dGltZW91dDogaHR0cGFwaV90aW1lb3V0XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGhlYWRlcnM6IHsgJ1gtS2V5Jzoga2V5LCAnQWNjZXB0JzogJyovKicgfSxcblx0XHRcdFx0dGltZW91dDogaHR0cGFwaV90aW1lb3V0XG5cdFx0XHR9XG5cdFx0XHR0aGlzLnBvc3Qob3B0cywgKGVycm9yLCByZXNwb25zZSwgYm9keSkgPT4gcmVzb2x2ZShib2R5KSlcblx0XHR9KS5jYXRjaCgoZSkgPT4gdGhpcy5sb2dFcnIoZSkpXG5cdH1cblxuXHRsb2FkZGF0YSgpIHtcblx0XHRpZiAodGhpcy5pc05vZGUoKSkge1xuXHRcdFx0dGhpcy5mcyA9IHRoaXMuZnMgPyB0aGlzLmZzIDogcmVxdWlyZSgnZnMnKVxuXHRcdFx0dGhpcy5wYXRoID0gdGhpcy5wYXRoID8gdGhpcy5wYXRoIDogcmVxdWlyZSgncGF0aCcpXG5cdFx0XHRjb25zdCBjdXJEaXJEYXRhRmlsZVBhdGggPSB0aGlzLnBhdGgucmVzb2x2ZSh0aGlzLmRhdGFGaWxlKVxuXHRcdFx0Y29uc3Qgcm9vdERpckRhdGFGaWxlUGF0aCA9IHRoaXMucGF0aC5yZXNvbHZlKFxuXHRcdFx0XHRwcm9jZXNzLmN3ZCgpLFxuXHRcdFx0XHR0aGlzLmRhdGFGaWxlXG5cdFx0XHQpXG5cdFx0XHRjb25zdCBpc0N1ckRpckRhdGFGaWxlID0gdGhpcy5mcy5leGlzdHNTeW5jKGN1ckRpckRhdGFGaWxlUGF0aClcblx0XHRcdGNvbnN0IGlzUm9vdERpckRhdGFGaWxlID1cblx0XHRcdFx0IWlzQ3VyRGlyRGF0YUZpbGUgJiYgdGhpcy5mcy5leGlzdHNTeW5jKHJvb3REaXJEYXRhRmlsZVBhdGgpXG5cdFx0XHRpZiAoaXNDdXJEaXJEYXRhRmlsZSB8fCBpc1Jvb3REaXJEYXRhRmlsZSkge1xuXHRcdFx0XHRjb25zdCBkYXRQYXRoID0gaXNDdXJEaXJEYXRhRmlsZVxuXHRcdFx0XHRcdD8gY3VyRGlyRGF0YUZpbGVQYXRoXG5cdFx0XHRcdFx0OiByb290RGlyRGF0YUZpbGVQYXRoXG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0cmV0dXJuIEpTT04ucGFyc2UodGhpcy5mcy5yZWFkRmlsZVN5bmMoZGF0UGF0aCkpXG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRyZXR1cm4ge31cblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHJldHVybiB7fVxuXHRcdH0gZWxzZSByZXR1cm4ge31cblx0fVxuXG5cdHdyaXRlZGF0YSgpIHtcblx0XHRpZiAodGhpcy5pc05vZGUoKSkge1xuXHRcdFx0dGhpcy5mcyA9IHRoaXMuZnMgPyB0aGlzLmZzIDogcmVxdWlyZSgnZnMnKVxuXHRcdFx0dGhpcy5wYXRoID0gdGhpcy5wYXRoID8gdGhpcy5wYXRoIDogcmVxdWlyZSgncGF0aCcpXG5cdFx0XHRjb25zdCBjdXJEaXJEYXRhRmlsZVBhdGggPSB0aGlzLnBhdGgucmVzb2x2ZSh0aGlzLmRhdGFGaWxlKVxuXHRcdFx0Y29uc3Qgcm9vdERpckRhdGFGaWxlUGF0aCA9IHRoaXMucGF0aC5yZXNvbHZlKFxuXHRcdFx0XHRwcm9jZXNzLmN3ZCgpLFxuXHRcdFx0XHR0aGlzLmRhdGFGaWxlXG5cdFx0XHQpXG5cdFx0XHRjb25zdCBpc0N1ckRpckRhdGFGaWxlID0gdGhpcy5mcy5leGlzdHNTeW5jKGN1ckRpckRhdGFGaWxlUGF0aClcblx0XHRcdGNvbnN0IGlzUm9vdERpckRhdGFGaWxlID1cblx0XHRcdFx0IWlzQ3VyRGlyRGF0YUZpbGUgJiYgdGhpcy5mcy5leGlzdHNTeW5jKHJvb3REaXJEYXRhRmlsZVBhdGgpXG5cdFx0XHRjb25zdCBqc29uZGF0YSA9IEpTT04uc3RyaW5naWZ5KHRoaXMuZGF0YSlcblx0XHRcdGlmIChpc0N1ckRpckRhdGFGaWxlKSB7XG5cdFx0XHRcdHRoaXMuZnMud3JpdGVGaWxlU3luYyhjdXJEaXJEYXRhRmlsZVBhdGgsIGpzb25kYXRhKVxuXHRcdFx0fSBlbHNlIGlmIChpc1Jvb3REaXJEYXRhRmlsZSkge1xuXHRcdFx0XHR0aGlzLmZzLndyaXRlRmlsZVN5bmMocm9vdERpckRhdGFGaWxlUGF0aCwganNvbmRhdGEpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLmZzLndyaXRlRmlsZVN5bmMoY3VyRGlyRGF0YUZpbGVQYXRoLCBqc29uZGF0YSlcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRsb2Rhc2hfZ2V0KHNvdXJjZSwgcGF0aCwgZGVmYXVsdFZhbHVlID0gdW5kZWZpbmVkKSB7XG5cdFx0Y29uc3QgcGF0aHMgPSBwYXRoLnJlcGxhY2UoL1xcWyhcXGQrKVxcXS9nLCAnLiQxJykuc3BsaXQoJy4nKVxuXHRcdGxldCByZXN1bHQgPSBzb3VyY2Vcblx0XHRmb3IgKGNvbnN0IHAgb2YgcGF0aHMpIHtcblx0XHRcdHJlc3VsdCA9IE9iamVjdChyZXN1bHQpW3BdXG5cdFx0XHRpZiAocmVzdWx0ID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0cmV0dXJuIGRlZmF1bHRWYWx1ZVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0XG5cdH1cblxuXHRsb2Rhc2hfc2V0KG9iaiwgcGF0aCwgdmFsdWUpIHtcblx0XHRpZiAoT2JqZWN0KG9iaikgIT09IG9iaikgcmV0dXJuIG9ialxuXHRcdGlmICghQXJyYXkuaXNBcnJheShwYXRoKSkgcGF0aCA9IHBhdGgudG9TdHJpbmcoKS5tYXRjaCgvW14uW1xcXV0rL2cpIHx8IFtdXG5cdFx0cGF0aFxuXHRcdFx0LnNsaWNlKDAsIC0xKVxuXHRcdFx0LnJlZHVjZShcblx0XHRcdFx0KGEsIGMsIGkpID0+XG5cdFx0XHRcdFx0T2JqZWN0KGFbY10pID09PSBhW2NdXG5cdFx0XHRcdFx0XHQ/IGFbY11cblx0XHRcdFx0XHRcdDogKGFbY10gPSBNYXRoLmFicyhwYXRoW2kgKyAxXSkgPj4gMCA9PT0gK3BhdGhbaSArIDFdID8gW10gOiB7fSksXG5cdFx0XHRcdG9ialxuXHRcdFx0KVtwYXRoW3BhdGgubGVuZ3RoIC0gMV1dID0gdmFsdWVcblx0XHRyZXR1cm4gb2JqXG5cdH1cblxuXHRnZXRkYXRhKGtleSkge1xuXHRcdGxldCB2YWwgPSB0aGlzLmdldHZhbChrZXkpXG5cdFx0Ly8g5aaC5p6c5LulIEBcblx0XHRpZiAoL15ALy50ZXN0KGtleSkpIHtcblx0XHRcdGNvbnN0IFssIG9iamtleSwgcGF0aHNdID0gL15AKC4qPylcXC4oLio/KSQvLmV4ZWMoa2V5KVxuXHRcdFx0Y29uc3Qgb2JqdmFsID0gb2Jqa2V5ID8gdGhpcy5nZXR2YWwob2Jqa2V5KSA6ICcnXG5cdFx0XHRpZiAob2JqdmFsKSB7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0Y29uc3Qgb2JqZWR2YWwgPSBKU09OLnBhcnNlKG9ianZhbClcblx0XHRcdFx0XHR2YWwgPSBvYmplZHZhbCA/IHRoaXMubG9kYXNoX2dldChvYmplZHZhbCwgcGF0aHMsICcnKSA6IHZhbFxuXHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0dmFsID0gJydcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdmFsXG5cdH1cblxuXHRzZXRkYXRhKHZhbCwga2V5KSB7XG5cdFx0bGV0IGlzc3VjID0gZmFsc2Vcblx0XHRpZiAoL15ALy50ZXN0KGtleSkpIHtcblx0XHRcdGNvbnN0IFssIG9iamtleSwgcGF0aHNdID0gL15AKC4qPylcXC4oLio/KSQvLmV4ZWMoa2V5KVxuXHRcdFx0Y29uc3Qgb2JqZGF0ID0gdGhpcy5nZXR2YWwob2Jqa2V5KVxuXHRcdFx0Y29uc3Qgb2JqdmFsID0gb2Jqa2V5XG5cdFx0XHRcdD8gb2JqZGF0ID09PSAnbnVsbCdcblx0XHRcdFx0XHQ/IG51bGxcblx0XHRcdFx0XHQ6IG9iamRhdCB8fCAne30nXG5cdFx0XHRcdDogJ3t9J1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Y29uc3Qgb2JqZWR2YWwgPSBKU09OLnBhcnNlKG9ianZhbClcblx0XHRcdFx0dGhpcy5sb2Rhc2hfc2V0KG9iamVkdmFsLCBwYXRocywgdmFsKVxuXHRcdFx0XHRpc3N1YyA9IHRoaXMuc2V0dmFsKEpTT04uc3RyaW5naWZ5KG9iamVkdmFsKSwgb2Jqa2V5KVxuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRjb25zdCBvYmplZHZhbCA9IHt9XG5cdFx0XHRcdHRoaXMubG9kYXNoX3NldChvYmplZHZhbCwgcGF0aHMsIHZhbClcblx0XHRcdFx0aXNzdWMgPSB0aGlzLnNldHZhbChKU09OLnN0cmluZ2lmeShvYmplZHZhbCksIG9iamtleSlcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aXNzdWMgPSB0aGlzLnNldHZhbCh2YWwsIGtleSlcblx0XHR9XG5cdFx0cmV0dXJuIGlzc3VjXG5cdH1cblxuXHRnZXR2YWwoa2V5KSB7XG5cdFx0c3dpdGNoICh0aGlzLlBsYXRmb3JtKCkpIHtcblx0XHRcdGNhc2UgJ1N1cmdlJzpcblx0XHRcdGNhc2UgJ0xvb24nOlxuXHRcdFx0Y2FzZSAnU3Rhc2gnOlxuXHRcdFx0Y2FzZSAnU2hhZG93cm9ja2V0Jzpcblx0XHRcdFx0cmV0dXJuICRwZXJzaXN0ZW50U3RvcmUucmVhZChrZXkpXG5cdFx0XHRjYXNlICdRdWFudHVtdWx0IFgnOlxuXHRcdFx0XHRyZXR1cm4gJHByZWZzLnZhbHVlRm9yS2V5KGtleSlcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiAodGhpcy5kYXRhICYmIHRoaXMuZGF0YVtrZXldKSB8fCBudWxsXG5cdFx0fVxuXHR9XG5cblx0c2V0dmFsKHZhbCwga2V5KSB7XG5cdFx0c3dpdGNoICh0aGlzLlBsYXRmb3JtKCkpIHtcblx0XHRcdGNhc2UgJ1N1cmdlJzpcblx0XHRcdGNhc2UgJ0xvb24nOlxuXHRcdFx0Y2FzZSAnU3Rhc2gnOlxuXHRcdFx0Y2FzZSAnU2hhZG93cm9ja2V0Jzpcblx0XHRcdFx0cmV0dXJuICRwZXJzaXN0ZW50U3RvcmUud3JpdGUodmFsLCBrZXkpXG5cdFx0XHRjYXNlICdRdWFudHVtdWx0IFgnOlxuXHRcdFx0XHRyZXR1cm4gJHByZWZzLnNldFZhbHVlRm9yS2V5KHZhbCwga2V5KVxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuICh0aGlzLmRhdGEgJiYgdGhpcy5kYXRhW2tleV0pIHx8IG51bGxcblx0XHR9XG5cdH1cblxuXHRpbml0R290RW52KG9wdHMpIHtcblx0XHR0aGlzLmdvdCA9IHRoaXMuZ290ID8gdGhpcy5nb3QgOiByZXF1aXJlKCdnb3QnKVxuXHRcdHRoaXMuY2t0b3VnaCA9IHRoaXMuY2t0b3VnaCA/IHRoaXMuY2t0b3VnaCA6IHJlcXVpcmUoJ3RvdWdoLWNvb2tpZScpXG5cdFx0dGhpcy5ja2phciA9IHRoaXMuY2tqYXIgPyB0aGlzLmNramFyIDogbmV3IHRoaXMuY2t0b3VnaC5Db29raWVKYXIoKVxuXHRcdGlmIChvcHRzKSB7XG5cdFx0XHRvcHRzLmhlYWRlcnMgPSBvcHRzLmhlYWRlcnMgPyBvcHRzLmhlYWRlcnMgOiB7fVxuXHRcdFx0aWYgKHVuZGVmaW5lZCA9PT0gb3B0cy5oZWFkZXJzLkNvb2tpZSAmJiB1bmRlZmluZWQgPT09IG9wdHMuY29va2llSmFyKSB7XG5cdFx0XHRcdG9wdHMuY29va2llSmFyID0gdGhpcy5ja2phclxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGdldChyZXF1ZXN0LCBjYWxsYmFjayA9ICgpID0+IHsgfSkge1xuXHRcdGRlbGV0ZSByZXF1ZXN0LmhlYWRlcnM/LlsnQ29udGVudC1MZW5ndGgnXVxuXHRcdGRlbGV0ZSByZXF1ZXN0LmhlYWRlcnM/LlsnY29udGVudC1sZW5ndGgnXVxuXG5cdFx0c3dpdGNoICh0aGlzLlBsYXRmb3JtKCkpIHtcblx0XHRcdGNhc2UgJ1N1cmdlJzpcblx0XHRcdGNhc2UgJ0xvb24nOlxuXHRcdFx0Y2FzZSAnU3Rhc2gnOlxuXHRcdFx0Y2FzZSAnU2hhZG93cm9ja2V0Jzpcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGlmICh0aGlzLmlzU3VyZ2UoKSAmJiB0aGlzLmlzTmVlZFJld3JpdGUpIHtcblx0XHRcdFx0XHR0aGlzLmxvZGFzaF9zZXQocmVxdWVzdCwgJ2hlYWRlcnMuWC1TdXJnZS1Ta2lwLVNjcmlwdGluZycsIGZhbHNlKVxuXHRcdFx0XHR9XG5cdFx0XHRcdCRodHRwQ2xpZW50LmdldChyZXF1ZXN0LCAoZXJyb3IsIHJlc3BvbnNlLCBib2R5KSA9PiB7XG5cdFx0XHRcdFx0aWYgKCFlcnJvciAmJiByZXNwb25zZSkge1xuXHRcdFx0XHRcdFx0cmVzcG9uc2UuYm9keSA9IGJvZHlcblx0XHRcdFx0XHRcdHJlc3BvbnNlLnN0YXR1c0NvZGUgPSByZXNwb25zZS5zdGF0dXMgPyByZXNwb25zZS5zdGF0dXMgOiByZXNwb25zZS5zdGF0dXNDb2RlXG5cdFx0XHRcdFx0XHRyZXNwb25zZS5zdGF0dXMgPSByZXNwb25zZS5zdGF0dXNDb2RlXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNhbGxiYWNrKGVycm9yLCByZXNwb25zZSwgYm9keSlcblx0XHRcdFx0fSlcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgJ1F1YW50dW11bHQgWCc6XG5cdFx0XHRcdGlmICh0aGlzLmlzTmVlZFJld3JpdGUpIHtcblx0XHRcdFx0XHR0aGlzLmxvZGFzaF9zZXQocmVxdWVzdCwgJ29wdHMuaGludHMnLCBmYWxzZSlcblx0XHRcdFx0fVxuXHRcdFx0XHQkdGFzay5mZXRjaChyZXF1ZXN0KS50aGVuKFxuXHRcdFx0XHRcdChyZXNwb25zZSkgPT4ge1xuXHRcdFx0XHRcdFx0Y29uc3Qge1xuXHRcdFx0XHRcdFx0XHRzdGF0dXNDb2RlOiBzdGF0dXMsXG5cdFx0XHRcdFx0XHRcdHN0YXR1c0NvZGUsXG5cdFx0XHRcdFx0XHRcdGhlYWRlcnMsXG5cdFx0XHRcdFx0XHRcdGJvZHksXG5cdFx0XHRcdFx0XHRcdGJvZHlCeXRlc1xuXHRcdFx0XHRcdFx0fSA9IHJlc3BvbnNlXG5cdFx0XHRcdFx0XHRjYWxsYmFjayhcblx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0eyBzdGF0dXMsIHN0YXR1c0NvZGUsIGhlYWRlcnMsIGJvZHksIGJvZHlCeXRlcyB9LFxuXHRcdFx0XHRcdFx0XHRib2R5LFxuXHRcdFx0XHRcdFx0XHRib2R5Qnl0ZXNcblx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdChlcnJvcikgPT4gY2FsbGJhY2soKGVycm9yICYmIGVycm9yLmVycm9yb3IpIHx8ICdVbmRlZmluZWRFcnJvcicpXG5cdFx0XHRcdClcblx0XHRcdFx0YnJlYWtcblx0XHR9XG5cdH1cblxuXHRwb3N0KHJlcXVlc3QsIGNhbGxiYWNrID0gKCkgPT4geyB9KSB7XG5cdFx0Y29uc3QgbWV0aG9kID0gcmVxdWVzdC5tZXRob2Rcblx0XHRcdD8gcmVxdWVzdC5tZXRob2QudG9Mb2NhbGVMb3dlckNhc2UoKVxuXHRcdFx0OiAncG9zdCdcblxuXHRcdC8vIOWmguaenOaMh+WumuS6huivt+axguS9kywg5L2G5rKh5oyH5a6aIGBDb250ZW50LVR5cGVg44CBYGNvbnRlbnQtdHlwZWAsIOWImeiHquWKqOeUn+aIkOOAglxuXHRcdGlmIChcblx0XHRcdHJlcXVlc3QuYm9keSAmJlxuXHRcdFx0cmVxdWVzdC5oZWFkZXJzICYmXG5cdFx0XHQhcmVxdWVzdC5oZWFkZXJzWydDb250ZW50LVR5cGUnXSAmJlxuXHRcdFx0IXJlcXVlc3QuaGVhZGVyc1snY29udGVudC10eXBlJ11cblx0XHQpIHtcblx0XHRcdC8vIEhUVFAvMeOAgUhUVFAvMiDpg73mlK/mjIHlsI/lhpkgaGVhZGVyc1xuXHRcdFx0cmVxdWVzdC5oZWFkZXJzWydjb250ZW50LXR5cGUnXSA9ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG5cdFx0fVxuXHRcdC8vIOS4uumBv+WFjeaMh+WumumUmeivryBgY29udGVudC1sZW5ndGhgIOi/memHjOWIoOmZpOivpeWxnuaAp++8jOeUseW3peWFt+erryAoSHR0cENsaWVudCkg6LSf6LSj6YeN5paw6K6h566X5bm26LWL5YC8XG5cdFx0XHRkZWxldGUgcmVxdWVzdC5oZWFkZXJzPy5bJ0NvbnRlbnQtTGVuZ3RoJ11cblx0XHRcdGRlbGV0ZSByZXF1ZXN0LmhlYWRlcnM/LlsnY29udGVudC1sZW5ndGgnXVxuXHRcdHN3aXRjaCAodGhpcy5QbGF0Zm9ybSgpKSB7XG5cdFx0XHRjYXNlICdTdXJnZSc6XG5cdFx0XHRjYXNlICdMb29uJzpcblx0XHRcdGNhc2UgJ1N0YXNoJzpcblx0XHRcdGNhc2UgJ1NoYWRvd3JvY2tldCc6XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRpZiAodGhpcy5pc1N1cmdlKCkgJiYgdGhpcy5pc05lZWRSZXdyaXRlKSB7XG5cdFx0XHRcdFx0dGhpcy5sb2Rhc2hfc2V0KHJlcXVlc3QsICdoZWFkZXJzLlgtU3VyZ2UtU2tpcC1TY3JpcHRpbmcnLCBmYWxzZSlcblx0XHRcdFx0fVxuXHRcdFx0XHQkaHR0cENsaWVudFttZXRob2RdKHJlcXVlc3QsIChlcnJvciwgcmVzcG9uc2UsIGJvZHkpID0+IHtcblx0XHRcdFx0XHRpZiAoIWVycm9yICYmIHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0XHRyZXNwb25zZS5ib2R5ID0gYm9keVxuXHRcdFx0XHRcdFx0cmVzcG9uc2Uuc3RhdHVzQ29kZSA9IHJlc3BvbnNlLnN0YXR1cyA/IHJlc3BvbnNlLnN0YXR1cyA6IHJlc3BvbnNlLnN0YXR1c0NvZGVcblx0XHRcdFx0XHRcdHJlc3BvbnNlLnN0YXR1cyA9IHJlc3BvbnNlLnN0YXR1c0NvZGVcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2FsbGJhY2soZXJyb3IsIHJlc3BvbnNlLCBib2R5KVxuXHRcdFx0XHR9KVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnUXVhbnR1bXVsdCBYJzpcblx0XHRcdFx0cmVxdWVzdC5tZXRob2QgPSBtZXRob2Rcblx0XHRcdFx0aWYgKHRoaXMuaXNOZWVkUmV3cml0ZSkge1xuXHRcdFx0XHRcdHRoaXMubG9kYXNoX3NldChyZXF1ZXN0LCAnb3B0cy5oaW50cycsIGZhbHNlKVxuXHRcdFx0XHR9XG5cdFx0XHRcdCR0YXNrLmZldGNoKHJlcXVlc3QpLnRoZW4oXG5cdFx0XHRcdFx0KHJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdFx0XHRjb25zdCB7XG5cdFx0XHRcdFx0XHRcdHN0YXR1c0NvZGU6IHN0YXR1cyxcblx0XHRcdFx0XHRcdFx0c3RhdHVzQ29kZSxcblx0XHRcdFx0XHRcdFx0aGVhZGVycyxcblx0XHRcdFx0XHRcdFx0Ym9keSxcblx0XHRcdFx0XHRcdFx0Ym9keUJ5dGVzXG5cdFx0XHRcdFx0XHR9ID0gcmVzcG9uc2Vcblx0XHRcdFx0XHRcdGNhbGxiYWNrKFxuXHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHR7IHN0YXR1cywgc3RhdHVzQ29kZSwgaGVhZGVycywgYm9keSwgYm9keUJ5dGVzIH0sXG5cdFx0XHRcdFx0XHRcdGJvZHksXG5cdFx0XHRcdFx0XHRcdGJvZHlCeXRlc1xuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0KGVycm9yKSA9PiBjYWxsYmFjaygoZXJyb3IgJiYgZXJyb3IuZXJyb3JvcikgfHwgJ1VuZGVmaW5lZEVycm9yJylcblx0XHRcdFx0KVxuXHRcdFx0XHRicmVha1xuXHRcdH1cblx0fVxuXHQvKipcblx0ICpcblx0ICog56S65L6LOiQudGltZSgneXl5eS1NTS1kZCBxcSBISDptbTpzcy5TJylcblx0ICogICAgOiQudGltZSgneXl5eU1NZGRISG1tc3NTJylcblx0ICogICAgeTrlubQgTTrmnIggZDrml6UgcTrlraMgSDrml7YgbTrliIYgczrnp5IgUzrmr6vnp5Jcblx0ICogICAg5YW25LiteeWPr+mAiTAtNOS9jeWNoOS9jeespuOAgVPlj6/pgIkwLTHkvY3ljaDkvY3nrKbvvIzlhbbkvZnlj6/pgIkwLTLkvY3ljaDkvY3nrKZcblx0ICogQHBhcmFtIHtzdHJpbmd9IGZvcm1hdCDmoLzlvI/ljJblj4LmlbBcblx0ICogQHBhcmFtIHtudW1iZXJ9IHRzIOWPr+mAiTog5qC55o2u5oyH5a6a5pe26Ze05oiz6L+U5Zue5qC85byP5YyW5pel5pyfXG5cdCAqXG5cdCAqL1xuXHR0aW1lKGZvcm1hdCwgdHMgPSBudWxsKSB7XG5cdFx0Y29uc3QgZGF0ZSA9IHRzID8gbmV3IERhdGUodHMpIDogbmV3IERhdGUoKVxuXHRcdGxldCBvID0ge1xuXHRcdFx0J00rJzogZGF0ZS5nZXRNb250aCgpICsgMSxcblx0XHRcdCdkKyc6IGRhdGUuZ2V0RGF0ZSgpLFxuXHRcdFx0J0grJzogZGF0ZS5nZXRIb3VycygpLFxuXHRcdFx0J20rJzogZGF0ZS5nZXRNaW51dGVzKCksXG5cdFx0XHQncysnOiBkYXRlLmdldFNlY29uZHMoKSxcblx0XHRcdCdxKyc6IE1hdGguZmxvb3IoKGRhdGUuZ2V0TW9udGgoKSArIDMpIC8gMyksXG5cdFx0XHQnUyc6IGRhdGUuZ2V0TWlsbGlzZWNvbmRzKClcblx0XHR9XG5cdFx0aWYgKC8oeSspLy50ZXN0KGZvcm1hdCkpXG5cdFx0XHRmb3JtYXQgPSBmb3JtYXQucmVwbGFjZShcblx0XHRcdFx0UmVnRXhwLiQxLFxuXHRcdFx0XHQoZGF0ZS5nZXRGdWxsWWVhcigpICsgJycpLnN1YnN0cig0IC0gUmVnRXhwLiQxLmxlbmd0aClcblx0XHRcdClcblx0XHRmb3IgKGxldCBrIGluIG8pXG5cdFx0XHRpZiAobmV3IFJlZ0V4cCgnKCcgKyBrICsgJyknKS50ZXN0KGZvcm1hdCkpXG5cdFx0XHRcdGZvcm1hdCA9IGZvcm1hdC5yZXBsYWNlKFxuXHRcdFx0XHRcdFJlZ0V4cC4kMSxcblx0XHRcdFx0XHRSZWdFeHAuJDEubGVuZ3RoID09IDFcblx0XHRcdFx0XHRcdD8gb1trXVxuXHRcdFx0XHRcdFx0OiAoJzAwJyArIG9ba10pLnN1YnN0cigoJycgKyBvW2tdKS5sZW5ndGgpXG5cdFx0XHRcdClcblx0XHRyZXR1cm4gZm9ybWF0XG5cdH1cblxuXHQvKipcblx0ICog57O757uf6YCa55+lXG5cdCAqXG5cdCAqID4g6YCa55+l5Y+C5pWwOiDlkIzml7bmlK/mjIEgUXVhblgg5ZKMIExvb24g5Lik56eN5qC85byPLCBFbnZKc+agueaNrui/kOihjOeOr+Wig+iHquWKqOi9rOaNoiwgU3VyZ2Ug546v5aKD5LiN5pSv5oyB5aSa5aqS5L2T6YCa55+lXG5cdCAqXG5cdCAqIOekuuS+izpcblx0ICogJC5tc2codGl0bGUsIHN1YnQsIGRlc2MsICd0d2l0dGVyOi8vJylcblx0ICogJC5tc2codGl0bGUsIHN1YnQsIGRlc2MsIHsgJ29wZW4tdXJsJzogJ3R3aXR0ZXI6Ly8nLCAnbWVkaWEtdXJsJzogJ2h0dHBzOi8vZ2l0aHViLmdpdGh1YmFzc2V0cy5jb20vaW1hZ2VzL21vZHVsZXMvb3Blbl9ncmFwaC9naXRodWItbWFyay5wbmcnIH0pXG5cdCAqICQubXNnKHRpdGxlLCBzdWJ0LCBkZXNjLCB7ICdvcGVuLXVybCc6ICdodHRwczovL2JpbmcuY29tJywgJ21lZGlhLXVybCc6ICdodHRwczovL2dpdGh1Yi5naXRodWJhc3NldHMuY29tL2ltYWdlcy9tb2R1bGVzL29wZW5fZ3JhcGgvZ2l0aHViLW1hcmsucG5nJyB9KVxuXHQgKlxuXHQgKiBAcGFyYW0geyp9IHRpdGxlIOagh+mimFxuXHQgKiBAcGFyYW0geyp9IHN1YnQg5Ymv5qCH6aKYXG5cdCAqIEBwYXJhbSB7Kn0gZGVzYyDpgJrnn6Xor6bmg4Vcblx0ICogQHBhcmFtIHsqfSBvcHRzIOmAmuefpeWPguaVsFxuXHQgKlxuXHQgKi9cblx0bXNnKHRpdGxlID0gbmFtZSwgc3VidCA9ICcnLCBkZXNjID0gJycsIG9wdHMpIHtcblx0XHRjb25zdCB0b0Vudk9wdHMgPSAocmF3b3B0cykgPT4ge1xuXHRcdFx0c3dpdGNoICh0eXBlb2YgcmF3b3B0cykge1xuXHRcdFx0XHRjYXNlIHVuZGVmaW5lZDpcblx0XHRcdFx0XHRyZXR1cm4gcmF3b3B0c1xuXHRcdFx0XHRjYXNlICdzdHJpbmcnOlxuXHRcdFx0XHRcdHN3aXRjaCAodGhpcy5QbGF0Zm9ybSgpKSB7XG5cdFx0XHRcdFx0XHRjYXNlICdTdXJnZSc6XG5cdFx0XHRcdFx0XHRjYXNlICdTdGFzaCc6XG5cdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4geyB1cmw6IHJhd29wdHMgfVxuXHRcdFx0XHRcdFx0Y2FzZSAnTG9vbic6XG5cdFx0XHRcdFx0XHRjYXNlICdTaGFkb3dyb2NrZXQnOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcmF3b3B0c1xuXHRcdFx0XHRcdFx0Y2FzZSAnUXVhbnR1bXVsdCBYJzpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHsgJ29wZW4tdXJsJzogcmF3b3B0cyB9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRjYXNlICdvYmplY3QnOlxuXHRcdFx0XHRcdHN3aXRjaCAodGhpcy5QbGF0Zm9ybSgpKSB7XG5cdFx0XHRcdFx0XHRjYXNlICdTdXJnZSc6XG5cdFx0XHRcdFx0XHRjYXNlICdTdGFzaCc6XG5cdFx0XHRcdFx0XHRjYXNlICdTaGFkb3dyb2NrZXQnOlxuXHRcdFx0XHRcdFx0ZGVmYXVsdDoge1xuXHRcdFx0XHRcdFx0XHRsZXQgb3BlblVybCA9XG5cdFx0XHRcdFx0XHRcdFx0cmF3b3B0cy51cmwgfHwgcmF3b3B0cy5vcGVuVXJsIHx8IHJhd29wdHNbJ29wZW4tdXJsJ11cblx0XHRcdFx0XHRcdFx0cmV0dXJuIHsgdXJsOiBvcGVuVXJsIH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGNhc2UgJ0xvb24nOiB7XG5cdFx0XHRcdFx0XHRcdGxldCBvcGVuVXJsID1cblx0XHRcdFx0XHRcdFx0XHRyYXdvcHRzLm9wZW5VcmwgfHwgcmF3b3B0cy51cmwgfHwgcmF3b3B0c1snb3Blbi11cmwnXVxuXHRcdFx0XHRcdFx0XHRsZXQgbWVkaWFVcmwgPSByYXdvcHRzLm1lZGlhVXJsIHx8IHJhd29wdHNbJ21lZGlhLXVybCddXG5cdFx0XHRcdFx0XHRcdHJldHVybiB7IG9wZW5VcmwsIG1lZGlhVXJsIH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGNhc2UgJ1F1YW50dW11bHQgWCc6IHtcblx0XHRcdFx0XHRcdFx0bGV0IG9wZW5VcmwgPVxuXHRcdFx0XHRcdFx0XHRcdHJhd29wdHNbJ29wZW4tdXJsJ10gfHwgcmF3b3B0cy51cmwgfHwgcmF3b3B0cy5vcGVuVXJsXG5cdFx0XHRcdFx0XHRcdGxldCBtZWRpYVVybCA9IHJhd29wdHNbJ21lZGlhLXVybCddIHx8IHJhd29wdHMubWVkaWFVcmxcblx0XHRcdFx0XHRcdFx0bGV0IHVwZGF0ZVBhc3RlYm9hcmQgPVxuXHRcdFx0XHRcdFx0XHRcdHJhd29wdHNbJ3VwZGF0ZS1wYXN0ZWJvYXJkJ10gfHwgcmF3b3B0cy51cGRhdGVQYXN0ZWJvYXJkXG5cdFx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdFx0J29wZW4tdXJsJzogb3BlblVybCxcblx0XHRcdFx0XHRcdFx0XHQnbWVkaWEtdXJsJzogbWVkaWFVcmwsXG5cdFx0XHRcdFx0XHRcdFx0J3VwZGF0ZS1wYXN0ZWJvYXJkJzogdXBkYXRlUGFzdGVib2FyZFxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdHJldHVybiB1bmRlZmluZWRcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKCF0aGlzLmlzTXV0ZSkge1xuXHRcdFx0c3dpdGNoICh0aGlzLlBsYXRmb3JtKCkpIHtcblx0XHRcdFx0Y2FzZSAnU3VyZ2UnOlxuXHRcdFx0XHRjYXNlICdMb29uJzpcblx0XHRcdFx0Y2FzZSAnU3Rhc2gnOlxuXHRcdFx0XHRjYXNlICdTaGFkb3dyb2NrZXQnOlxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdCRub3RpZmljYXRpb24ucG9zdCh0aXRsZSwgc3VidCwgZGVzYywgdG9FbnZPcHRzKG9wdHMpKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgJ1F1YW50dW11bHQgWCc6XG5cdFx0XHRcdFx0JG5vdGlmeSh0aXRsZSwgc3VidCwgZGVzYywgdG9FbnZPcHRzKG9wdHMpKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmICghdGhpcy5pc011dGVMb2cpIHtcblx0XHRcdGxldCBsb2dzID0gWycnLCAnPT09PT09PT09PT09PT3wn5Oj57O757uf6YCa55+l8J+Toz09PT09PT09PT09PT09J11cblx0XHRcdGxvZ3MucHVzaCh0aXRsZSlcblx0XHRcdHN1YnQgPyBsb2dzLnB1c2goc3VidCkgOiAnJ1xuXHRcdFx0ZGVzYyA/IGxvZ3MucHVzaChkZXNjKSA6ICcnXG5cdFx0XHRjb25zb2xlLmxvZyhsb2dzLmpvaW4oJ1xcbicpKVxuXHRcdFx0dGhpcy5sb2dzID0gdGhpcy5sb2dzLmNvbmNhdChsb2dzKVxuXHRcdH1cblx0fVxuXG5cdGxvZyguLi5sb2dzKSB7XG5cdFx0aWYgKGxvZ3MubGVuZ3RoID4gMCkge1xuXHRcdFx0dGhpcy5sb2dzID0gWy4uLnRoaXMubG9ncywgLi4ubG9nc11cblx0XHR9XG5cdFx0Y29uc29sZS5sb2cobG9ncy5qb2luKHRoaXMubG9nU2VwYXJhdG9yKSlcblx0fVxuXG5cdGxvZ0VycihlcnJvcikge1xuXHRcdHN3aXRjaCAodGhpcy5QbGF0Zm9ybSgpKSB7XG5cdFx0XHRjYXNlICdTdXJnZSc6XG5cdFx0XHRjYXNlICdMb29uJzpcblx0XHRcdGNhc2UgJ1N0YXNoJzpcblx0XHRcdGNhc2UgJ1NoYWRvd3JvY2tldCc6XG5cdFx0XHRjYXNlICdRdWFudHVtdWx0IFgnOlxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dGhpcy5sb2coJycsIGDinZfvuI8gJHt0aGlzLm5hbWV9LCDplJnor68hYCwgZXJyb3IpXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXHR9XG5cblx0d2FpdCh0aW1lKSB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIHRpbWUpKVxuXHR9XG5cblx0ZG9uZSh2YWwgPSB7fSkge1xuXHRcdGNvbnN0IGVuZFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuXHRcdGNvbnN0IGNvc3RUaW1lID0gKGVuZFRpbWUgLSB0aGlzLnN0YXJ0VGltZSkgLyAxMDAwXG5cdFx0dGhpcy5sb2coJycsIGDwn5qpICR7dGhpcy5uYW1lfSwg57uT5p2fISDwn5WbICR7Y29zdFRpbWV9IOenkmApXG5cdFx0dGhpcy5sb2coKVxuXHRcdHN3aXRjaCAodGhpcy5QbGF0Zm9ybSgpKSB7XG5cdFx0XHRjYXNlICdTdXJnZSc6XG5cdFx0XHRjYXNlICdMb29uJzpcblx0XHRcdGNhc2UgJ1N0YXNoJzpcblx0XHRcdGNhc2UgJ1NoYWRvd3JvY2tldCc6XG5cdFx0XHRjYXNlICdRdWFudHVtdWx0IFgnOlxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0JGRvbmUodmFsKVxuXHRcdFx0XHRicmVha1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgRW52aXJvbm1lbnQgVmFyaWFibGVzXG5cdCAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9WaXJnaWxDbHluZS9HZXRTb21lRnJpZXMvYmxvYi9tYWluL2Z1bmN0aW9uL2dldEVOVi9nZXRFTlYuanNcblx0ICogQGF1dGhvciBWaXJnaWxDbHluZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30ga2V5IC0gUGVyc2lzdGVudCBTdG9yZSBLZXlcblx0ICogQHBhcmFtIHtBcnJheX0gbmFtZXMgLSBQbGF0Zm9ybSBOYW1lc1xuXHQgKiBAcGFyYW0ge09iamVjdH0gZGF0YWJhc2UgLSBEZWZhdWx0IERhdGFiYXNlXG5cdCAqIEByZXR1cm4ge09iamVjdH0geyBTZXR0aW5ncywgQ2FjaGVzLCBDb25maWdzIH1cblx0ICovXG5cdGdldEVOVihrZXksIG5hbWVzLCBkYXRhYmFzZSkge1xuXHRcdC8vdGhpcy5sb2coYOKYke+4jyAke3RoaXMubmFtZX0sIEdldCBFbnZpcm9ubWVudCBWYXJpYWJsZXNgLCBcIlwiKTtcblx0XHQvKioqKioqKioqKioqKioqKiogQm94SnMgKioqKioqKioqKioqKioqKiovXG5cdFx0Ly8g5YyF6KOF5Li65bGA6YOo5Y+Y6YeP77yM55So5a6M6YeK5pS+5YaF5a2YXG5cdFx0Ly8gQm94SnPnmoTmuIXnqbrmk43kvZzov5Tlm57lgYflgLznqbrlrZfnrKbkuLIsIOmAu+i+keaIluaTjeS9nOespuS8muWcqOW3puS+p+aTjeS9nOaVsOS4uuWBh+WAvOaXtui/lOWbnuWPs+S+p+aTjeS9nOaVsOOAglxuXHRcdGxldCBCb3hKcyA9IHRoaXMuZ2V0anNvbihrZXksIGRhdGFiYXNlKTtcblx0XHQvL3RoaXMubG9nKGDwn5qnICR7dGhpcy5uYW1lfSwgR2V0IEVudmlyb25tZW50IFZhcmlhYmxlc2AsIGBCb3hKc+exu+WeizogJHt0eXBlb2YgQm94SnN9YCwgYEJveEpz5YaF5a65OiAke0pTT04uc3RyaW5naWZ5KEJveEpzKX1gLCBcIlwiKTtcblx0XHQvKioqKioqKioqKioqKioqKiogQXJndW1lbnQgKioqKioqKioqKioqKioqKiovXG5cdFx0bGV0IEFyZ3VtZW50ID0ge307XG5cdFx0aWYgKHR5cGVvZiAkYXJndW1lbnQgIT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdGlmIChCb29sZWFuKCRhcmd1bWVudCkpIHtcblx0XHRcdFx0Ly90aGlzLmxvZyhg8J+OiSAke3RoaXMubmFtZX0sICRBcmd1bWVudGApO1xuXHRcdFx0XHRsZXQgYXJnID0gT2JqZWN0LmZyb21FbnRyaWVzKCRhcmd1bWVudC5zcGxpdChcIiZcIikubWFwKChpdGVtKSA9PiBpdGVtLnNwbGl0KFwiPVwiKS5tYXAoaSA9PiBpLnJlcGxhY2UoL1xcXCIvZywgJycpKSkpO1xuXHRcdFx0XHQvL3RoaXMubG9nKEpTT04uc3RyaW5naWZ5KGFyZykpO1xuXHRcdFx0XHRmb3IgKGxldCBpdGVtIGluIGFyZykgdGhpcy5zZXRQYXRoKEFyZ3VtZW50LCBpdGVtLCBhcmdbaXRlbV0pO1xuXHRcdFx0XHQvL3RoaXMubG9nKEpTT04uc3RyaW5naWZ5KEFyZ3VtZW50KSk7XG5cdFx0XHR9O1xuXHRcdFx0Ly90aGlzLmxvZyhg4pyFICR7dGhpcy5uYW1lfSwgR2V0IEVudmlyb25tZW50IFZhcmlhYmxlc2AsIGBBcmd1bWVudOexu+WeizogJHt0eXBlb2YgQXJndW1lbnR9YCwgYEFyZ3VtZW505YaF5a65OiAke0pTT04uc3RyaW5naWZ5KEFyZ3VtZW50KX1gLCBcIlwiKTtcblx0XHR9O1xuXHRcdC8qKioqKioqKioqKioqKioqKiBTdG9yZSAqKioqKioqKioqKioqKioqKi9cblx0XHRjb25zdCBTdG9yZSA9IHsgU2V0dGluZ3M6IGRhdGFiYXNlPy5EZWZhdWx0Py5TZXR0aW5ncyB8fCB7fSwgQ29uZmlnczogZGF0YWJhc2U/LkRlZmF1bHQ/LkNvbmZpZ3MgfHwge30sIENhY2hlczoge30gfTtcblx0XHRpZiAoIUFycmF5LmlzQXJyYXkobmFtZXMpKSBuYW1lcyA9IFtuYW1lc107XG5cdFx0Ly90aGlzLmxvZyhg8J+apyAke3RoaXMubmFtZX0sIEdldCBFbnZpcm9ubWVudCBWYXJpYWJsZXNgLCBgbmFtZXPnsbvlnos6ICR7dHlwZW9mIG5hbWVzfWAsIGBuYW1lc+WGheWuuTogJHtKU09OLnN0cmluZ2lmeShuYW1lcyl9YCwgXCJcIik7XG5cdFx0Zm9yIChsZXQgbmFtZSBvZiBuYW1lcykge1xuXHRcdFx0U3RvcmUuU2V0dGluZ3MgPSB7IC4uLlN0b3JlLlNldHRpbmdzLCAuLi5kYXRhYmFzZT8uW25hbWVdPy5TZXR0aW5ncywgLi4uQXJndW1lbnQsIC4uLkJveEpzPy5bbmFtZV0/LlNldHRpbmdzIH07XG5cdFx0XHRTdG9yZS5Db25maWdzID0geyAuLi5TdG9yZS5Db25maWdzLCAuLi5kYXRhYmFzZT8uW25hbWVdPy5Db25maWdzIH07XG5cdFx0XHRpZiAoQm94SnM/LltuYW1lXT8uQ2FjaGVzICYmIHR5cGVvZiBCb3hKcz8uW25hbWVdPy5DYWNoZXMgPT09IFwic3RyaW5nXCIpIEJveEpzW25hbWVdLkNhY2hlcyA9IEpTT04ucGFyc2UoQm94SnM/LltuYW1lXT8uQ2FjaGVzKTtcblx0XHRcdFN0b3JlLkNhY2hlcyA9IHsgLi4uU3RvcmUuQ2FjaGVzLCAuLi5Cb3hKcz8uW25hbWVdPy5DYWNoZXMgfTtcblx0XHR9O1xuXHRcdC8vdGhpcy5sb2coYPCfmqcgJHt0aGlzLm5hbWV9LCBHZXQgRW52aXJvbm1lbnQgVmFyaWFibGVzYCwgYFN0b3JlLlNldHRpbmdz57G75Z6LOiAke3R5cGVvZiBTdG9yZS5TZXR0aW5nc31gLCBgU3RvcmUuU2V0dGluZ3M6ICR7SlNPTi5zdHJpbmdpZnkoU3RvcmUuU2V0dGluZ3MpfWAsIFwiXCIpO1xuXHRcdHRoaXMudHJhdmVyc2VPYmplY3QoU3RvcmUuU2V0dGluZ3MsIChrZXksIHZhbHVlKSA9PiB7XG5cdFx0XHQvL3RoaXMubG9nKGDwn5qnICR7dGhpcy5uYW1lfSwgdHJhdmVyc2VPYmplY3RgLCBgJHtrZXl9OiAke3R5cGVvZiB2YWx1ZX1gLCBgJHtrZXl9OiAke0pTT04uc3RyaW5naWZ5KHZhbHVlKX1gLCBcIlwiKTtcblx0XHRcdGlmICh2YWx1ZSA9PT0gXCJ0cnVlXCIgfHwgdmFsdWUgPT09IFwiZmFsc2VcIikgdmFsdWUgPSBKU09OLnBhcnNlKHZhbHVlKTsgLy8g5a2X56ym5Liy6L2sQm9vbGVhblxuXHRcdFx0ZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdGlmICh2YWx1ZS5pbmNsdWRlcyhcIixcIikpIHZhbHVlID0gdmFsdWUuc3BsaXQoXCIsXCIpLm1hcChpdGVtID0+IHRoaXMuc3RyaW5nMm51bWJlcihpdGVtKSk7IC8vIOWtl+espuS4sui9rOaVsOe7hOi9rOaVsOWtl1xuXHRcdFx0XHRlbHNlIHZhbHVlID0gdGhpcy5zdHJpbmcybnVtYmVyKHZhbHVlKTsgLy8g5a2X56ym5Liy6L2s5pWw5a2XXG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdH0pO1xuXHRcdC8vdGhpcy5sb2coYOKchSAke3RoaXMubmFtZX0sIEdldCBFbnZpcm9ubWVudCBWYXJpYWJsZXNgLCBgU3RvcmU6ICR7dHlwZW9mIFN0b3JlLkNhY2hlc31gLCBgU3RvcmXlhoXlrrk6ICR7SlNPTi5zdHJpbmdpZnkoU3RvcmUpfWAsIFwiXCIpO1xuXHRcdHJldHVybiBTdG9yZTtcblx0fTtcblxuXHQvKioqKioqKioqKioqKioqKiogZnVuY3Rpb24gKioqKioqKioqKioqKioqKiovXG5cdHNldFBhdGgob2JqZWN0LCBwYXRoLCB2YWx1ZSkgeyBwYXRoLnNwbGl0KFwiLlwiKS5yZWR1Y2UoKG8sIHAsIGkpID0+IG9bcF0gPSBwYXRoLnNwbGl0KFwiLlwiKS5sZW5ndGggPT09ICsraSA/IHZhbHVlIDogb1twXSB8fCB7fSwgb2JqZWN0KSB9XG5cdHRyYXZlcnNlT2JqZWN0KG8sIGMpIHsgZm9yICh2YXIgdCBpbiBvKSB7IHZhciBuID0gb1t0XTsgb1t0XSA9IFwib2JqZWN0XCIgPT0gdHlwZW9mIG4gJiYgbnVsbCAhPT0gbiA/IHRoaXMudHJhdmVyc2VPYmplY3QobiwgYykgOiBjKHQsIG4pIH0gcmV0dXJuIG8gfVxuXHRzdHJpbmcybnVtYmVyKHN0cmluZykgeyBpZiAoc3RyaW5nICYmICFpc05hTihzdHJpbmcpKSBzdHJpbmcgPSBwYXJzZUludChzdHJpbmcsIDEwKTsgcmV0dXJuIHN0cmluZyB9XG59XG5cbmV4cG9ydCBjbGFzcyBIdHRwIHtcblx0Y29uc3RydWN0b3IoZW52KSB7XG5cdFx0dGhpcy5lbnYgPSBlbnZcblx0fVxuXG5cdHNlbmQob3B0cywgbWV0aG9kID0gJ0dFVCcpIHtcblx0XHRvcHRzID0gdHlwZW9mIG9wdHMgPT09ICdzdHJpbmcnID8geyB1cmw6IG9wdHMgfSA6IG9wdHNcblx0XHRsZXQgc2VuZGVyID0gdGhpcy5nZXRcblx0XHRpZiAobWV0aG9kID09PSAnUE9TVCcpIHtcblx0XHRcdHNlbmRlciA9IHRoaXMucG9zdFxuXHRcdH1cblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0c2VuZGVyLmNhbGwodGhpcywgb3B0cywgKGVycm9yLCByZXNwb25zZSwgYm9keSkgPT4ge1xuXHRcdFx0XHRpZiAoZXJyb3IpIHJlamVjdChlcnJvcilcblx0XHRcdFx0ZWxzZSByZXNvbHZlKHJlc3BvbnNlKVxuXHRcdFx0fSlcblx0XHR9KVxuXHR9XG5cblx0Z2V0KG9wdHMpIHtcblx0XHRyZXR1cm4gdGhpcy5zZW5kLmNhbGwodGhpcy5lbnYsIG9wdHMpXG5cdH1cblxuXHRwb3N0KG9wdHMpIHtcblx0XHRyZXR1cm4gdGhpcy5zZW5kLmNhbGwodGhpcy5lbnYsIG9wdHMsICdQT1NUJylcblx0fVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgVVJJIHtcblx0Y29uc3RydWN0b3Iob3B0cyA9IFtdKSB7XG5cdFx0dGhpcy5uYW1lID0gXCJVUkkgdjEuMi42XCI7XG5cdFx0dGhpcy5vcHRzID0gb3B0cztcblx0XHR0aGlzLmpzb24gPSB7IHNjaGVtZTogXCJcIiwgaG9zdDogXCJcIiwgcGF0aDogXCJcIiwgcXVlcnk6IHt9IH07XG5cdH07XG5cblx0cGFyc2UodXJsKSB7XG5cdFx0Y29uc3QgVVJMUmVnZXggPSAvKD86KD88c2NoZW1lPi4rKTpcXC9cXC8oPzxob3N0PlteL10rKSk/XFwvPyg/PHBhdGg+W14/XSspP1xcPz8oPzxxdWVyeT5bXj9dKyk/Lztcblx0XHRsZXQganNvbiA9IHVybC5tYXRjaChVUkxSZWdleCk/Lmdyb3VwcyA/PyBudWxsO1xuXHRcdGlmIChqc29uPy5wYXRoKSBqc29uLnBhdGhzID0ganNvbi5wYXRoLnNwbGl0KFwiL1wiKTsgZWxzZSBqc29uLnBhdGggPSBcIlwiO1xuXHRcdC8vaWYgKGpzb24/LnBhdGhzPy5hdCgtMSk/LmluY2x1ZGVzKFwiLlwiKSkganNvbi5mb3JtYXQgPSBqc29uLnBhdGhzLmF0KC0xKS5zcGxpdChcIi5cIikuYXQoLTEpO1xuXHRcdGlmIChqc29uPy5wYXRocykge1xuXHRcdFx0Y29uc3QgZmlsZU5hbWUgPSBqc29uLnBhdGhzW2pzb24ucGF0aHMubGVuZ3RoIC0gMV07XG5cdFx0XHRpZiAoZmlsZU5hbWU/LmluY2x1ZGVzKFwiLlwiKSkge1xuXHRcdFx0XHRjb25zdCBsaXN0ID0gZmlsZU5hbWUuc3BsaXQoXCIuXCIpO1xuXHRcdFx0XHRqc29uLmZvcm1hdCA9IGxpc3RbbGlzdC5sZW5ndGggLSAxXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKGpzb24/LnF1ZXJ5KSBqc29uLnF1ZXJ5ID0gT2JqZWN0LmZyb21FbnRyaWVzKGpzb24ucXVlcnkuc3BsaXQoXCImXCIpLm1hcCgocGFyYW0pID0+IHBhcmFtLnNwbGl0KFwiPVwiKSkpO1xuXHRcdHJldHVybiBqc29uXG5cdH07XG5cblx0c3RyaW5naWZ5KGpzb24gPSB0aGlzLmpzb24pIHtcblx0XHRsZXQgdXJsID0gXCJcIjtcblx0XHRpZiAoanNvbj8uc2NoZW1lICYmIGpzb24/Lmhvc3QpIHVybCArPSBqc29uLnNjaGVtZSArIFwiOi8vXCIgKyBqc29uLmhvc3Q7XG5cdFx0aWYgKGpzb24/LnBhdGgpIHVybCArPSAoanNvbj8uaG9zdCkgPyBcIi9cIiArIGpzb24ucGF0aCA6IGpzb24ucGF0aDtcblx0XHRpZiAoanNvbj8ucXVlcnkpIHVybCArPSBcIj9cIiArIE9iamVjdC5lbnRyaWVzKGpzb24ucXVlcnkpLm1hcChwYXJhbSA9PiBwYXJhbS5qb2luKFwiPVwiKSkuam9pbihcIiZcIik7XG5cdFx0cmV0dXJuIHVybFxuXHR9O1xufVxuIiwiLy8gcmVmZXI6IGh0dHBzOi8vZ2l0aHViLmNvbS9QZW5nLVlNL1F1YW5YL2Jsb2IvbWFzdGVyL1Rvb2xzL1hNTFBhcnNlci94bWwtcGFyc2VyLmpzXG4vLyByZWZlcjogaHR0cHM6Ly9nb2Vzc25lci5uZXQvZG93bmxvYWQvcHJqL2pzb254bWwvXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBYTUwge1xuXHQjQVRUUklCVVRFX0tFWSA9IFwiQFwiO1xuXHQjQ0hJTERfTk9ERV9LRVkgPSBcIiNcIjtcblx0I1VORVNDQVBFID0ge1xuXHRcdFwiJmFtcDtcIjogXCImXCIsXG5cdFx0XCImbHQ7XCI6IFwiPFwiLFxuXHRcdFwiJmd0O1wiOiBcIj5cIixcblx0XHRcIiZhcG9zO1wiOiBcIidcIixcblx0XHRcIiZxdW90O1wiOiAnXCInXG5cdH07XG5cdCNFU0NBUEUgPSB7XG5cdFx0XCImXCI6IFwiJmFtcDtcIixcblx0XHRcIjxcIjogXCImbHQ7XCIsXG5cdFx0XCI+XCI6IFwiJmd0O1wiLFxuXHRcdFwiJ1wiOiBcIiZhcG9zO1wiLFxuXHRcdCdcIic6IFwiJnF1b3Q7XCJcblx0fTtcblxuXHRjb25zdHJ1Y3RvcihvcHRzKSB7XG5cdFx0dGhpcy5uYW1lID0gXCJYTUwgdjAuNC4wLTJcIjtcblx0XHR0aGlzLm9wdHMgPSBvcHRzO1xuXHRcdEJpZ0ludC5wcm90b3R5cGUudG9KU09OID0gKCkgPT4gdGhpcy50b1N0cmluZygpO1xuXHR9O1xuXG5cdHBhcnNlKHhtbCA9IG5ldyBTdHJpbmcsIHJldml2ZXIgPSBcIlwiKSB7XG5cdFx0Y29uc3QgVU5FU0NBUEUgPSB0aGlzLiNVTkVTQ0FQRTtcblx0XHRjb25zdCBBVFRSSUJVVEVfS0VZID0gdGhpcy4jQVRUUklCVVRFX0tFWTtcblx0XHRjb25zdCBDSElMRF9OT0RFX0tFWSA9IHRoaXMuI0NISUxEX05PREVfS0VZO1xuXHRcdGNvbnN0IERPTSA9IHRvRE9NKHhtbCk7XG5cdFx0bGV0IGpzb24gPSBmcm9tWE1MKERPTSwgcmV2aXZlcik7XG5cdFx0cmV0dXJuIGpzb247XG5cblx0XHQvKioqKioqKioqKioqKioqKiogRnVjdGlvbnMgKioqKioqKioqKioqKioqKiovXG5cdFx0ZnVuY3Rpb24gdG9ET00odGV4dCkge1xuXHRcdFx0Y29uc3QgbGlzdCA9IHRleHQucmVwbGFjZSgvXlsgXFx0XSsvZ20sIFwiXCIpXG5cdFx0XHRcdC5zcGxpdCgvPChbXiE8Pj9dKD86J1tcXFNcXHNdKj8nfFwiW1xcU1xcc10qP1wifFteJ1wiPD5dKSp8ISg/Oi0tW1xcU1xcc10qPy0tfFxcW1teXFxbXFxdJ1wiPD5dK1xcW1tcXFNcXHNdKj9dXXxET0NUWVBFW15cXFs8Pl0qP1xcW1tcXFNcXHNdKj9dfCg/OkVOVElUWVteXCI8Pl0qP1wiW1xcU1xcc10qP1wiKT9bXFxTXFxzXSo/KXxcXD9bXFxTXFxzXSo/XFw/KT4vKTtcblx0XHRcdGNvbnN0IGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuXG5cdFx0XHQvLyByb290IGVsZW1lbnRcblx0XHRcdGNvbnN0IHJvb3QgPSB7IGNoaWxkcmVuOiBbXSB9O1xuXHRcdFx0bGV0IGVsZW0gPSByb290O1xuXG5cdFx0XHQvLyBkb20gdHJlZSBzdGFja1xuXHRcdFx0Y29uc3Qgc3RhY2sgPSBbXTtcblxuXHRcdFx0Ly8gcGFyc2Vcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOykge1xuXHRcdFx0XHQvLyB0ZXh0IG5vZGVcblx0XHRcdFx0Y29uc3Qgc3RyID0gbGlzdFtpKytdO1xuXHRcdFx0XHRpZiAoc3RyKSBhcHBlbmRUZXh0KHN0cik7XG5cblx0XHRcdFx0Ly8gY2hpbGQgbm9kZVxuXHRcdFx0XHRjb25zdCB0YWcgPSBsaXN0W2krK107XG5cdFx0XHRcdGlmICh0YWcpIHBhcnNlTm9kZSh0YWcpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHJvb3Q7XG5cdFx0XHQvKioqKioqKioqKioqKioqKiogRnVjdGlvbnMgKioqKioqKioqKioqKioqKiovXG5cdFx0XHRmdW5jdGlvbiBwYXJzZU5vZGUodGFnKSB7XG5cdFx0XHRcdGNvbnN0IHRhZ3MgPSB0YWcuc3BsaXQoXCIgXCIpO1xuXHRcdFx0XHRjb25zdCBuYW1lID0gdGFncy5zaGlmdCgpO1xuXHRcdFx0XHRjb25zdCBsZW5ndGggPSB0YWdzLmxlbmd0aDtcblx0XHRcdFx0bGV0IGNoaWxkID0ge307XG5cdFx0XHRcdHN3aXRjaCAobmFtZVswXSkge1xuXHRcdFx0XHRcdGNhc2UgXCIvXCI6XG5cdFx0XHRcdFx0XHQvLyBjbG9zZSB0YWdcblx0XHRcdFx0XHRcdGNvbnN0IGNsb3NlZCA9IHRhZy5yZXBsYWNlKC9eXFwvfFtcXHNcXC9dLiokL2csIFwiXCIpLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcdFx0XHR3aGlsZSAoc3RhY2subGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHRhZ05hbWUgPSBlbGVtPy5uYW1lPy50b0xvd2VyQ2FzZT8uKCk7XG5cdFx0XHRcdFx0XHRcdGVsZW0gPSBzdGFjay5wb3AoKTtcblx0XHRcdFx0XHRcdFx0aWYgKHRhZ05hbWUgPT09IGNsb3NlZCkgYnJlYWs7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFwiP1wiOlxuXHRcdFx0XHRcdFx0Ly8gWE1MIGRlY2xhcmF0aW9uXG5cdFx0XHRcdFx0XHRjaGlsZC5uYW1lID0gbmFtZTtcblx0XHRcdFx0XHRcdGNoaWxkLnJhdyA9IHRhZ3Muam9pbihcIiBcIik7XG5cdFx0XHRcdFx0XHRhcHBlbmRDaGlsZChjaGlsZCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFwiIVwiOlxuXHRcdFx0XHRcdFx0aWYgKC8hXFxbQ0RBVEFcXFsoLispXFxdXFxdLy50ZXN0KHRhZykpIHtcblx0XHRcdFx0XHRcdFx0Ly8gQ0RBVEEgc2VjdGlvblxuXHRcdFx0XHRcdFx0XHRjaGlsZC5uYW1lID0gXCIhQ0RBVEFcIjtcblx0XHRcdFx0XHRcdFx0Ly9jaGlsZC5yYXcgPSB0YWcuc2xpY2UoOSwgLTIpO1xuXHRcdFx0XHRcdFx0XHRjaGlsZC5yYXcgPSB0YWcubWF0Y2goLyFcXFtDREFUQVxcWyguKylcXF1cXF0vKTtcblx0XHRcdFx0XHRcdFx0Ly9hcHBlbmRUZXh0KHRhZy5zbGljZSg5LCAtMikpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Ly8gQ29tbWVudCBzZWN0aW9uXG5cdFx0XHRcdFx0XHRcdGNoaWxkLm5hbWUgPSBuYW1lO1xuXHRcdFx0XHRcdFx0XHRjaGlsZC5yYXcgPSB0YWdzLmpvaW4oXCIgXCIpO1xuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdGFwcGVuZENoaWxkKGNoaWxkKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRjaGlsZCA9IG9wZW5UYWcodGFnKTtcblx0XHRcdFx0XHRcdGFwcGVuZENoaWxkKGNoaWxkKTtcblx0XHRcdFx0XHRcdHN3aXRjaCAoKHRhZ3M/LltsZW5ndGggLSAxXSA/PyBuYW1lKS5zbGljZSgtMSkpIHtcblx0XHRcdFx0XHRcdFx0Y2FzZSBcIi9cIjpcblx0XHRcdFx0XHRcdFx0XHQvL2NoaWxkLmhhc0NoaWxkID0gZmFsc2U7IC8vIGVtcHR5VGFnXG5cdFx0XHRcdFx0XHRcdFx0ZGVsZXRlIGNoaWxkLmNoaWxkcmVuOyAvLyBlbXB0eVRhZ1xuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHRcdHN3aXRjaCAobmFtZSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcImxpbmtcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9jaGlsZC5oYXNDaGlsZCA9IGZhbHNlOyAvLyBlbXB0eVRhZ1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRkZWxldGUgY2hpbGQuY2hpbGRyZW47IC8vIGVtcHR5VGFnXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0XHRcdFx0c3RhY2sucHVzaChlbGVtKTsgLy8gb3BlblRhZ1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRlbGVtID0gY2hpbGQ7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0ZnVuY3Rpb24gb3BlblRhZyh0YWcpIHtcblx0XHRcdFx0XHRjb25zdCBlbGVtID0geyBjaGlsZHJlbjogW10gfTtcblx0XHRcdFx0XHR0YWcgPSB0YWcucmVwbGFjZSgvXFxzKlxcLz8kLywgXCJcIik7XG5cdFx0XHRcdFx0Y29uc3QgcG9zID0gdGFnLnNlYXJjaCgvW1xccz0nXCJcXC9dLyk7XG5cdFx0XHRcdFx0aWYgKHBvcyA8IDApIHtcblx0XHRcdFx0XHRcdGVsZW0ubmFtZSA9IHRhZztcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0ZWxlbS5uYW1lID0gdGFnLnN1YnN0cigwLCBwb3MpO1xuXHRcdFx0XHRcdFx0ZWxlbS50YWcgPSB0YWcuc3Vic3RyKHBvcyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBlbGVtO1xuXHRcdFx0XHR9O1xuXHRcdFx0fTtcblxuXHRcdFx0ZnVuY3Rpb24gYXBwZW5kVGV4dChzdHIpIHtcblx0XHRcdFx0Ly9zdHIgPSByZW1vdmVTcGFjZXMoc3RyKTtcblx0XHRcdFx0c3RyID0gcmVtb3ZlQnJlYWtMaW5lKHN0cik7XG5cdFx0XHRcdC8vc3RyID0gc3RyPy50cmltPy4oKTtcblx0XHRcdFx0aWYgKHN0cikgYXBwZW5kQ2hpbGQodW5lc2NhcGVYTUwoc3RyKSk7XG5cblx0XHRcdFx0ZnVuY3Rpb24gcmVtb3ZlQnJlYWtMaW5lKHN0cikge1xuXHRcdFx0XHRcdHJldHVybiBzdHI/LnJlcGxhY2U/LigvXihcXHJcXG58XFxyfFxcbnxcXHQpK3woXFxyXFxufFxccnxcXG58XFx0KSskL2csIFwiXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIGFwcGVuZENoaWxkKGNoaWxkKSB7XG5cdFx0XHRcdGVsZW0uY2hpbGRyZW4ucHVzaChjaGlsZCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHQvKioqKioqKioqKioqKioqKiogRnVjdGlvbnMgKioqKioqKioqKioqKioqKiovXG5cdFx0ZnVuY3Rpb24gZnJvbVBsaXN0KGVsZW0sIHJldml2ZXIpIHtcblx0XHRcdGxldCBvYmplY3Q7XG5cdFx0XHRzd2l0Y2ggKHR5cGVvZiBlbGVtKSB7XG5cdFx0XHRcdGNhc2UgXCJzdHJpbmdcIjpcblx0XHRcdFx0Y2FzZSBcInVuZGVmaW5lZFwiOlxuXHRcdFx0XHRcdG9iamVjdCA9IGVsZW07XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJvYmplY3RcIjpcblx0XHRcdFx0XHQvL2RlZmF1bHQ6XG5cdFx0XHRcdFx0Y29uc3QgbmFtZSA9IGVsZW0ubmFtZTtcblx0XHRcdFx0XHRjb25zdCBjaGlsZHJlbiA9IGVsZW0uY2hpbGRyZW47XG5cblx0XHRcdFx0XHRvYmplY3QgPSB7fTtcblxuXHRcdFx0XHRcdHN3aXRjaCAobmFtZSkge1xuXHRcdFx0XHRcdFx0Y2FzZSBcInBsaXN0XCI6XG5cdFx0XHRcdFx0XHRcdGxldCBwbGlzdCA9IGZyb21QbGlzdChjaGlsZHJlblswXSwgcmV2aXZlcik7XG5cdFx0XHRcdFx0XHRcdG9iamVjdCA9IE9iamVjdC5hc3NpZ24ob2JqZWN0LCBwbGlzdClcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIFwiZGljdFwiOlxuXHRcdFx0XHRcdFx0XHRsZXQgZGljdCA9IGNoaWxkcmVuLm1hcChjaGlsZCA9PiBmcm9tUGxpc3QoY2hpbGQsIHJldml2ZXIpKTtcblx0XHRcdFx0XHRcdFx0ZGljdCA9IGNodW5rKGRpY3QsIDIpO1xuXHRcdFx0XHRcdFx0XHRvYmplY3QgPSBPYmplY3QuZnJvbUVudHJpZXMoZGljdCk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSBcImFycmF5XCI6XG5cdFx0XHRcdFx0XHRcdGlmICghQXJyYXkuaXNBcnJheShvYmplY3QpKSBvYmplY3QgPSBbXTtcblx0XHRcdFx0XHRcdFx0b2JqZWN0ID0gY2hpbGRyZW4ubWFwKGNoaWxkID0+IGZyb21QbGlzdChjaGlsZCwgcmV2aXZlcikpO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgXCJrZXlcIjpcblx0XHRcdFx0XHRcdFx0Y29uc3Qga2V5ID0gY2hpbGRyZW5bMF07XG5cdFx0XHRcdFx0XHRcdG9iamVjdCA9IGtleTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIFwidHJ1ZVwiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcImZhbHNlXCI6XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGJvb2xlYW4gPSBuYW1lO1xuXHRcdFx0XHRcdFx0XHRvYmplY3QgPSBKU09OLnBhcnNlKGJvb2xlYW4pO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgXCJpbnRlZ2VyXCI6XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGludGVnZXIgPSBjaGlsZHJlblswXTtcblx0XHRcdFx0XHRcdFx0Ly9vYmplY3QgPSBwYXJzZUludChpbnRlZ2VyKTtcblx0XHRcdFx0XHRcdFx0b2JqZWN0ID0gQmlnSW50KGludGVnZXIpO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgXCJyZWFsXCI6XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHJlYWwgPSBjaGlsZHJlblswXTtcblx0XHRcdFx0XHRcdFx0Ly9jb25zdCBkaWdpdHMgPSByZWFsLnNwbGl0KFwiLlwiKVsxXT8ubGVuZ3RoIHx8IDA7XG5cdFx0XHRcdFx0XHRcdG9iamVjdCA9IHBhcnNlRmxvYXQocmVhbCkvLy50b0ZpeGVkKGRpZ2l0cyk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSBcInN0cmluZ1wiOlxuXHRcdFx0XHRcdFx0XHRjb25zdCBzdHJpbmcgPSBjaGlsZHJlblswXTtcblx0XHRcdFx0XHRcdFx0b2JqZWN0ID0gc3RyaW5nO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGlmIChyZXZpdmVyKSBvYmplY3QgPSByZXZpdmVyKG5hbWUgfHwgXCJcIiwgb2JqZWN0KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHRcdHJldHVybiBvYmplY3Q7XG5cblx0XHRcdC8qKiBcblx0XHRcdCAqIENodW5rIEFycmF5XG5cdFx0XHQgKiBAYXV0aG9yIFZpcmdpbENseW5lXG5cdFx0XHQgKiBAcGFyYW0ge0FycmF5fSBzb3VyY2UgLSBzb3VyY2Vcblx0XHRcdCAqIEBwYXJhbSB7TnVtYmVyfSBsZW5ndGggLSBudW1iZXJcblx0XHRcdCAqIEByZXR1cm4ge0FycmF5PCo+fSB0YXJnZXRcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gY2h1bmsoc291cmNlLCBsZW5ndGgpIHtcblx0XHRcdFx0dmFyIGluZGV4ID0gMCwgdGFyZ2V0ID0gW107XG5cdFx0XHRcdHdoaWxlIChpbmRleCA8IHNvdXJjZS5sZW5ndGgpIHRhcmdldC5wdXNoKHNvdXJjZS5zbGljZShpbmRleCwgaW5kZXggKz0gbGVuZ3RoKSk7XG5cdFx0XHRcdHJldHVybiB0YXJnZXQ7XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGZyb21YTUwoZWxlbSwgcmV2aXZlcikge1xuXHRcdFx0bGV0IG9iamVjdDtcblx0XHRcdHN3aXRjaCAodHlwZW9mIGVsZW0pIHtcblx0XHRcdFx0Y2FzZSBcInN0cmluZ1wiOlxuXHRcdFx0XHRjYXNlIFwidW5kZWZpbmVkXCI6XG5cdFx0XHRcdFx0b2JqZWN0ID0gZWxlbTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcIm9iamVjdFwiOlxuXHRcdFx0XHRcdC8vZGVmYXVsdDpcblx0XHRcdFx0XHRjb25zdCByYXcgPSBlbGVtLnJhdztcblx0XHRcdFx0XHRjb25zdCBuYW1lID0gZWxlbS5uYW1lO1xuXHRcdFx0XHRcdGNvbnN0IHRhZyA9IGVsZW0udGFnO1xuXHRcdFx0XHRcdGNvbnN0IGNoaWxkcmVuID0gZWxlbS5jaGlsZHJlbjtcblxuXHRcdFx0XHRcdGlmIChyYXcpIG9iamVjdCA9IHJhdztcblx0XHRcdFx0XHRlbHNlIGlmICh0YWcpIG9iamVjdCA9IHBhcnNlQXR0cmlidXRlKHRhZywgcmV2aXZlcik7XG5cdFx0XHRcdFx0ZWxzZSBpZiAoIWNoaWxkcmVuKSBvYmplY3QgPSB7IFtuYW1lXTogdW5kZWZpbmVkIH07XG5cdFx0XHRcdFx0ZWxzZSBvYmplY3QgPSB7fTtcblxuXHRcdFx0XHRcdGlmIChuYW1lID09PSBcInBsaXN0XCIpIG9iamVjdCA9IE9iamVjdC5hc3NpZ24ob2JqZWN0LCBmcm9tUGxpc3QoY2hpbGRyZW5bMF0sIHJldml2ZXIpKTtcblx0XHRcdFx0XHRlbHNlIGNoaWxkcmVuPy5mb3JFYWNoPy4oKGNoaWxkLCBpKSA9PiB7XG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIGNoaWxkID09PSBcInN0cmluZ1wiKSBhZGRPYmplY3Qob2JqZWN0LCBDSElMRF9OT0RFX0tFWSwgZnJvbVhNTChjaGlsZCwgcmV2aXZlciksIHVuZGVmaW5lZClcblx0XHRcdFx0XHRcdGVsc2UgaWYgKCFjaGlsZC50YWcgJiYgIWNoaWxkLmNoaWxkcmVuICYmICFjaGlsZC5yYXcpIGFkZE9iamVjdChvYmplY3QsIGNoaWxkLm5hbWUsIGZyb21YTUwoY2hpbGQsIHJldml2ZXIpLCBjaGlsZHJlbj8uW2kgLSAxXT8ubmFtZSlcblx0XHRcdFx0XHRcdGVsc2UgYWRkT2JqZWN0KG9iamVjdCwgY2hpbGQubmFtZSwgZnJvbVhNTChjaGlsZCwgcmV2aXZlciksIHVuZGVmaW5lZClcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRpZiAoY2hpbGRyZW4gJiYgY2hpbGRyZW4ubGVuZ3RoID09PSAwKSBhZGRPYmplY3Qob2JqZWN0LCBDSElMRF9OT0RFX0tFWSwgbnVsbCwgdW5kZWZpbmVkKTtcblx0XHRcdFx0XHQvKlxuXHRcdFx0XHRcdGlmIChPYmplY3Qua2V5cyhvYmplY3QpLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRcdFx0aWYgKGVsZW0ubmFtZSkgb2JqZWN0W2VsZW0ubmFtZV0gPSAoZWxlbS5oYXNDaGlsZCA9PT0gZmFsc2UpID8gbnVsbCA6IFwiXCI7XG5cdFx0XHRcdFx0XHRlbHNlIG9iamVjdCA9IChlbGVtLmhhc0NoaWxkID09PSBmYWxzZSkgPyBudWxsIDogXCJcIjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ki9cblxuXHRcdFx0XHRcdC8vaWYgKE9iamVjdC5rZXlzKG9iamVjdCkubGVuZ3RoID09PSAwKSBhZGRPYmplY3Qob2JqZWN0LCBlbGVtLm5hbWUsIChlbGVtLmhhc0NoaWxkID09PSBmYWxzZSkgPyBudWxsIDogXCJcIik7XG5cdFx0XHRcdFx0Ly9pZiAoT2JqZWN0LmtleXMob2JqZWN0KS5sZW5ndGggPT09IDApIG9iamVjdCA9IChlbGVtLmhhc0NoaWxkID09PSBmYWxzZSkgPyB1bmRlZmluZWQgOiBcIlwiO1xuXHRcdFx0XHRcdGlmIChyZXZpdmVyKSBvYmplY3QgPSByZXZpdmVyKG5hbWUgfHwgXCJcIiwgb2JqZWN0KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHRcdHJldHVybiBvYmplY3Q7XG5cdFx0XHQvKioqKioqKioqKioqKioqKiogRnVjdGlvbnMgKioqKioqKioqKioqKioqKiovXG5cdFx0XHRmdW5jdGlvbiBwYXJzZUF0dHJpYnV0ZSh0YWcsIHJldml2ZXIpIHtcblx0XHRcdFx0aWYgKCF0YWcpIHJldHVybjtcblx0XHRcdFx0Y29uc3QgbGlzdCA9IHRhZy5zcGxpdCgvKFteXFxzPSdcIl0rKD86XFxzKj1cXHMqKD86J1tcXFNcXHNdKj8nfFwiW1xcU1xcc10qP1wifFteXFxzJ1wiXSopKT8pLyk7XG5cdFx0XHRcdGNvbnN0IGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuXHRcdFx0XHRsZXQgYXR0cmlidXRlcywgdmFsO1xuXG5cdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRsZXQgc3RyID0gcmVtb3ZlU3BhY2VzKGxpc3RbaV0pO1xuXHRcdFx0XHRcdC8vbGV0IHN0ciA9IHJlbW92ZUJyZWFrTGluZShsaXN0W2ldKTtcblx0XHRcdFx0XHQvL2xldCBzdHIgPSBsaXN0W2ldPy50cmltPy4oKTtcblx0XHRcdFx0XHRpZiAoIXN0cikgY29udGludWU7XG5cblx0XHRcdFx0XHRpZiAoIWF0dHJpYnV0ZXMpIHtcblx0XHRcdFx0XHRcdGF0dHJpYnV0ZXMgPSB7fTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjb25zdCBwb3MgPSBzdHIuaW5kZXhPZihcIj1cIik7XG5cdFx0XHRcdFx0aWYgKHBvcyA8IDApIHtcblx0XHRcdFx0XHRcdC8vIGJhcmUgYXR0cmlidXRlXG5cdFx0XHRcdFx0XHRzdHIgPSBBVFRSSUJVVEVfS0VZICsgc3RyO1xuXHRcdFx0XHRcdFx0dmFsID0gbnVsbDtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Ly8gYXR0cmlidXRlIGtleS92YWx1ZSBwYWlyXG5cdFx0XHRcdFx0XHR2YWwgPSBzdHIuc3Vic3RyKHBvcyArIDEpLnJlcGxhY2UoL15cXHMrLywgXCJcIik7XG5cdFx0XHRcdFx0XHRzdHIgPSBBVFRSSUJVVEVfS0VZICsgc3RyLnN1YnN0cigwLCBwb3MpLnJlcGxhY2UoL1xccyskLywgXCJcIik7XG5cblx0XHRcdFx0XHRcdC8vIHF1b3RlOiBmb289XCJGT09cIiBiYXI9J0JBUidcblx0XHRcdFx0XHRcdGNvbnN0IGZpcnN0Q2hhciA9IHZhbFswXTtcblx0XHRcdFx0XHRcdGNvbnN0IGxhc3RDaGFyID0gdmFsW3ZhbC5sZW5ndGggLSAxXTtcblx0XHRcdFx0XHRcdGlmIChmaXJzdENoYXIgPT09IGxhc3RDaGFyICYmIChmaXJzdENoYXIgPT09IFwiJ1wiIHx8IGZpcnN0Q2hhciA9PT0gJ1wiJykpIHtcblx0XHRcdFx0XHRcdFx0dmFsID0gdmFsLnN1YnN0cigxLCB2YWwubGVuZ3RoIC0gMik7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHZhbCA9IHVuZXNjYXBlWE1MKHZhbCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChyZXZpdmVyKSB2YWwgPSByZXZpdmVyKHN0ciwgdmFsKTtcblxuXHRcdFx0XHRcdGFkZE9iamVjdChhdHRyaWJ1dGVzLCBzdHIsIHZhbCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gYXR0cmlidXRlcztcblxuXHRcdFx0XHRmdW5jdGlvbiByZW1vdmVTcGFjZXMoc3RyKSB7XG5cdFx0XHRcdFx0Ly9yZXR1cm4gc3RyICYmIHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCBcIlwiKTtcblx0XHRcdFx0XHRyZXR1cm4gc3RyPy50cmltPy4oKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBhZGRPYmplY3Qob2JqZWN0LCBrZXksIHZhbCwgcHJldktleSA9IGtleSkge1xuXHRcdFx0XHRpZiAodHlwZW9mIHZhbCA9PT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuO1xuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRjb25zdCBwcmV2ID0gb2JqZWN0W3ByZXZLZXldO1xuXHRcdFx0XHRcdC8vY29uc3QgY3VyciA9IG9iamVjdFtrZXldO1xuXHRcdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KHByZXYpKSBwcmV2LnB1c2godmFsKTtcblx0XHRcdFx0XHRlbHNlIGlmIChwcmV2KSBvYmplY3RbcHJldktleV0gPSBbcHJldiwgdmFsXTtcblx0XHRcdFx0XHRlbHNlIG9iamVjdFtrZXldID0gdmFsO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gdW5lc2NhcGVYTUwoc3RyKSB7XG5cdFx0XHRyZXR1cm4gc3RyLnJlcGxhY2UoLygmKD86bHR8Z3R8YW1wfGFwb3N8cXVvdHwjKD86XFxkezEsNn18eFswLTlhLWZBLUZdezEsNX0pKTspL2csIGZ1bmN0aW9uIChzdHIpIHtcblx0XHRcdFx0aWYgKHN0clsxXSA9PT0gXCIjXCIpIHtcblx0XHRcdFx0XHRjb25zdCBjb2RlID0gKHN0clsyXSA9PT0gXCJ4XCIpID8gcGFyc2VJbnQoc3RyLnN1YnN0cigzKSwgMTYpIDogcGFyc2VJbnQoc3RyLnN1YnN0cigyKSwgMTApO1xuXHRcdFx0XHRcdGlmIChjb2RlID4gLTEpIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKGNvZGUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBVTkVTQ0FQRVtzdHJdIHx8IHN0cjtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHR9O1xuXG5cdHN0cmluZ2lmeShqc29uID0gbmV3IE9iamVjdCwgdGFiID0gXCJcIikge1xuXHRcdGNvbnN0IEVTQ0FQRSA9IHRoaXMuI0VTQ0FQRTtcblx0XHRjb25zdCBBVFRSSUJVVEVfS0VZID0gdGhpcy4jQVRUUklCVVRFX0tFWTtcblx0XHRjb25zdCBDSElMRF9OT0RFX0tFWSA9IHRoaXMuI0NISUxEX05PREVfS0VZO1xuXHRcdGxldCBYTUwgPSBcIlwiO1xuXHRcdGZvciAobGV0IGVsZW0gaW4ganNvbikgWE1MICs9IHRvWG1sKGpzb25bZWxlbV0sIGVsZW0sIFwiXCIpO1xuXHRcdFhNTCA9IHRhYiA/IFhNTC5yZXBsYWNlKC9cXHQvZywgdGFiKSA6IFhNTC5yZXBsYWNlKC9cXHR8XFxuL2csIFwiXCIpO1xuXHRcdHJldHVybiBYTUw7XG5cdFx0LyoqKioqKioqKioqKioqKioqIEZ1Y3Rpb25zICoqKioqKioqKioqKioqKioqL1xuXHRcdGZ1bmN0aW9uIHRvWG1sKEVsZW0sIE5hbWUsIEluZCkge1xuXHRcdFx0bGV0IHhtbCA9IFwiXCI7XG5cdFx0XHRzd2l0Y2ggKHR5cGVvZiBFbGVtKSB7XG5cdFx0XHRcdGNhc2UgXCJvYmplY3RcIjpcblx0XHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShFbGVtKSkge1xuXHRcdFx0XHRcdFx0eG1sID0gRWxlbS5yZWR1Y2UoXG5cdFx0XHRcdFx0XHRcdChwcmV2WE1MLCBjdXJyWE1MKSA9PiBwcmV2WE1MICs9IGAke0luZH0ke3RvWG1sKGN1cnJYTUwsIE5hbWUsIGAke0luZH1cXHRgKX1cXG5gLFxuXHRcdFx0XHRcdFx0XHRcIlwiXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRsZXQgYXR0cmlidXRlID0gXCJcIjtcblx0XHRcdFx0XHRcdGxldCBoYXNDaGlsZCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0Zm9yIChsZXQgbmFtZSBpbiBFbGVtKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChuYW1lWzBdID09PSBBVFRSSUJVVEVfS0VZKSB7XG5cdFx0XHRcdFx0XHRcdFx0YXR0cmlidXRlICs9IGAgJHtuYW1lLnN1YnN0cmluZygxKX09XFxcIiR7RWxlbVtuYW1lXS50b1N0cmluZygpfVxcXCJgO1xuXHRcdFx0XHRcdFx0XHRcdGRlbGV0ZSBFbGVtW25hbWVdO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKEVsZW1bbmFtZV0gPT09IHVuZGVmaW5lZCkgTmFtZSA9IG5hbWU7XG5cdFx0XHRcdFx0XHRcdGVsc2UgaGFzQ2hpbGQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0eG1sICs9IGAke0luZH08JHtOYW1lfSR7YXR0cmlidXRlfSR7KGhhc0NoaWxkIHx8IE5hbWUgPT09IFwibGlua1wiKSA/IFwiXCIgOiBcIi9cIn0+YDtcblxuXHRcdFx0XHRcdFx0aWYgKGhhc0NoaWxkKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChOYW1lID09PSBcInBsaXN0XCIpIHhtbCArPSB0b1BsaXN0KEVsZW0sIE5hbWUsIGAke0luZH1cXHRgKTtcblx0XHRcdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0Zm9yIChsZXQgbmFtZSBpbiBFbGVtKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRzd2l0Y2ggKG5hbWUpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBDSElMRF9OT0RFX0tFWTpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR4bWwgKz0gRWxlbVtuYW1lXSA/PyBcIlwiO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHhtbCArPSB0b1htbChFbGVtW25hbWVdLCBuYW1lLCBgJHtJbmR9XFx0YCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdHhtbCArPSAoeG1sLnNsaWNlKC0xKSA9PT0gXCJcXG5cIiA/IEluZCA6IFwiXCIpICsgYDwvJHtOYW1lfT5gO1xuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwic3RyaW5nXCI6XG5cdFx0XHRcdFx0c3dpdGNoIChOYW1lKSB7XG5cdFx0XHRcdFx0XHRjYXNlIFwiP3htbFwiOlxuXHRcdFx0XHRcdFx0XHR4bWwgKz0gYCR7SW5kfTwke05hbWV9ICR7RWxlbS50b1N0cmluZygpfT5gO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgXCI/XCI6XG5cdFx0XHRcdFx0XHRcdHhtbCArPSBgJHtJbmR9PCR7TmFtZX0ke0VsZW0udG9TdHJpbmcoKX0ke05hbWV9PmA7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSBcIiFcIjpcblx0XHRcdFx0XHRcdFx0eG1sICs9IGAke0luZH08IS0tJHtFbGVtLnRvU3RyaW5nKCl9LS0+YDtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIFwiIURPQ1RZUEVcIjpcblx0XHRcdFx0XHRcdFx0eG1sICs9IGAke0luZH08JHtOYW1lfSAke0VsZW0udG9TdHJpbmcoKX0+YDtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIFwiIUNEQVRBXCI6XG5cdFx0XHRcdFx0XHRcdHhtbCArPSBgJHtJbmR9PCFbQ0RBVEFbJHtFbGVtLnRvU3RyaW5nKCl9XV0+YDtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIENISUxEX05PREVfS0VZOlxuXHRcdFx0XHRcdFx0XHR4bWwgKz0gRWxlbTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHR4bWwgKz0gYCR7SW5kfTwke05hbWV9PiR7RWxlbS50b1N0cmluZygpfTwvJHtOYW1lfT5gO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwidW5kZWZpbmVkXCI6XG5cdFx0XHRcdFx0eG1sICs9IEluZCArIGA8JHtOYW1lLnRvU3RyaW5nKCl9Lz5gO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fTtcblx0XHRcdHJldHVybiB4bWw7XG5cdFx0fTtcblxuXHRcdGZ1bmN0aW9uIHRvUGxpc3QoRWxlbSwgTmFtZSwgSW5kKSB7XG5cdFx0XHRsZXQgcGxpc3QgPSBcIlwiO1xuXHRcdFx0c3dpdGNoICh0eXBlb2YgRWxlbSkge1xuXHRcdFx0XHRjYXNlIFwiYm9vbGVhblwiOlxuXHRcdFx0XHRcdHBsaXN0ID0gYCR7SW5kfTwke0VsZW0udG9TdHJpbmcoKX0vPmA7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJudW1iZXJcIjpcblx0XHRcdFx0XHRwbGlzdCA9IGAke0luZH08cmVhbD4ke0VsZW0udG9TdHJpbmcoKX08L3JlYWw+YDtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcImJpZ2ludFwiOlxuXHRcdFx0XHRcdHBsaXN0ID0gYCR7SW5kfTxpbnRlZ2VyPiR7RWxlbS50b1N0cmluZygpfTwvaW50ZWdlcj5gO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwic3RyaW5nXCI6XG5cdFx0XHRcdFx0cGxpc3QgPSBgJHtJbmR9PHN0cmluZz4ke0VsZW0udG9TdHJpbmcoKX08L3N0cmluZz5gO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwib2JqZWN0XCI6XG5cdFx0XHRcdFx0bGV0IGFycmF5ID0gXCJcIjtcblx0XHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShFbGVtKSkge1xuXHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIG4gPSBFbGVtLmxlbmd0aDsgaSA8IG47IGkrKykgYXJyYXkgKz0gYCR7SW5kfSR7dG9QbGlzdChFbGVtW2ldLCBOYW1lLCBgJHtJbmR9XFx0YCl9YDtcblx0XHRcdFx0XHRcdHBsaXN0ID0gYCR7SW5kfTxhcnJheT4ke2FycmF5fSR7SW5kfTwvYXJyYXk+YDtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0bGV0IGRpY3QgPSBcIlwiO1xuXHRcdFx0XHRcdFx0T2JqZWN0LmVudHJpZXMoRWxlbSkuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG5cdFx0XHRcdFx0XHRcdGRpY3QgKz0gYCR7SW5kfTxrZXk+JHtrZXl9PC9rZXk+YDtcblx0XHRcdFx0XHRcdFx0ZGljdCArPSB0b1BsaXN0KHZhbHVlLCBrZXksIEluZCk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdHBsaXN0ID0gYCR7SW5kfTxkaWN0PiR7ZGljdH0ke0luZH08L2RpY3Q+YDtcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHBsaXN0O1xuXHRcdH07XG5cdH07XG59XG4iLCIvKlxuUkVBRE1FOiBodHRwczovL2dpdGh1Yi5jb20vVmlyZ2lsQ2x5bmUvaVJpbmdvXG4qL1xuXG5pbXBvcnQgRU5WcyBmcm9tIFwiLi4vRU5WL0VOVi5tanNcIjtcbmNvbnN0ICQgPSBuZXcgRU5WcyhcIu+jvyBpUmluZ286IFNldCBFbnZpcm9ubWVudCBWYXJpYWJsZXMgYmV0YVwiKTtcblxuLyoqXG4gKiBTZXQgRW52aXJvbm1lbnQgVmFyaWFibGVzXG4gKiBAYXV0aG9yIFZpcmdpbENseW5lXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZSAtIFBlcnNpc3RlbnQgU3RvcmUgS2V5XG4gKiBAcGFyYW0ge0FycmF5fSBwbGF0Zm9ybXMgLSBQbGF0Zm9ybSBOYW1lc1xuICogQHBhcmFtIHtPYmplY3R9IGRhdGFiYXNlIC0gRGVmYXVsdCBEYXRhQmFzZVxuICogQHJldHVybiB7T2JqZWN0fSB7IFNldHRpbmdzLCBDYWNoZXMsIENvbmZpZ3MgfVxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBzZXRFTlYobmFtZSwgcGxhdGZvcm1zLCBkYXRhYmFzZSkge1xuXHQkLmxvZyhg4piR77iPICR7JC5uYW1lfWAsIFwiXCIpO1xuXHRsZXQgeyBTZXR0aW5ncywgQ2FjaGVzLCBDb25maWdzIH0gPSAkLmdldEVOVihuYW1lLCBwbGF0Zm9ybXMsIGRhdGFiYXNlKTtcblx0LyoqKioqKioqKioqKioqKioqIFNldHRpbmdzICoqKioqKioqKioqKioqKioqL1xuXHRpZiAoU2V0dGluZ3M/LlRhYnMgJiYgIUFycmF5LmlzQXJyYXkoU2V0dGluZ3M/LlRhYnMpKSAkLmxvZGFzaF9zZXQoU2V0dGluZ3MsIFwiVGFic1wiLCAoU2V0dGluZ3M/LlRhYnMpID8gW1NldHRpbmdzLlRhYnMudG9TdHJpbmcoKV0gOiBbXSk7XG5cdGlmIChTZXR0aW5ncz8uRG9tYWlucyAmJiAhQXJyYXkuaXNBcnJheShTZXR0aW5ncz8uRG9tYWlucykpICQubG9kYXNoX3NldChTZXR0aW5ncywgXCJEb21haW5zXCIsIChTZXR0aW5ncz8uRG9tYWlucykgPyBbU2V0dGluZ3MuRG9tYWlucy50b1N0cmluZygpXSA6IFtdKTtcblx0aWYgKFNldHRpbmdzPy5GdW5jdGlvbnMgJiYgIUFycmF5LmlzQXJyYXkoU2V0dGluZ3M/LkZ1bmN0aW9ucykpICQubG9kYXNoX3NldChTZXR0aW5ncywgXCJGdW5jdGlvbnNcIiwgKFNldHRpbmdzPy5GdW5jdGlvbnMpID8gW1NldHRpbmdzLkZ1bmN0aW9ucy50b1N0cmluZygpXSA6IFtdKTtcblx0JC5sb2coYOKchSAkeyQubmFtZX1gLCBgU2V0dGluZ3M6ICR7dHlwZW9mIFNldHRpbmdzfWAsIGBTZXR0aW5nc+WGheWuuTogJHtKU09OLnN0cmluZ2lmeShTZXR0aW5ncyl9YCwgXCJcIik7XG5cdC8qKioqKioqKioqKioqKioqKiBDYWNoZXMgKioqKioqKioqKioqKioqKiovXG5cdC8vJC5sb2coYOKchSAkeyQubmFtZX1gLCBgQ2FjaGVzOiAke3R5cGVvZiBDYWNoZXN9YCwgYENhY2hlc+WGheWuuTogJHtKU09OLnN0cmluZ2lmeShDYWNoZXMpfWAsIFwiXCIpO1xuXHQvKioqKioqKioqKioqKioqKiogQ29uZmlncyAqKioqKioqKioqKioqKioqKi9cblx0Q29uZmlncy5TdG9yZWZyb250ID0gbmV3IE1hcChDb25maWdzLlN0b3JlZnJvbnQpO1xuXHRpZiAoQ29uZmlncy5Mb2NhbGUpIENvbmZpZ3MuTG9jYWxlID0gbmV3IE1hcChDb25maWdzLkxvY2FsZSk7XG5cdGlmIChDb25maWdzLmkxOG4pIGZvciAobGV0IHR5cGUgaW4gQ29uZmlncy5pMThuKSBDb25maWdzLmkxOG5bdHlwZV0gPSBuZXcgTWFwKENvbmZpZ3MuaTE4blt0eXBlXSk7XG5cdHJldHVybiB7IFNldHRpbmdzLCBDYWNoZXMsIENvbmZpZ3MgfTtcbn07XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwidmFyIGdldFByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mID8gKG9iaikgPT4gKE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopKSA6IChvYmopID0+IChvYmouX19wcm90b19fKTtcbnZhciBsZWFmUHJvdG90eXBlcztcbi8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuLy8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4vLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbi8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuLy8gbW9kZSAmIDE2OiByZXR1cm4gdmFsdWUgd2hlbiBpdCdzIFByb21pc2UtbGlrZVxuLy8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuX193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcblx0aWYobW9kZSAmIDEpIHZhbHVlID0gdGhpcyh2YWx1ZSk7XG5cdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG5cdGlmKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUpIHtcblx0XHRpZigobW9kZSAmIDQpICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcblx0XHRpZigobW9kZSAmIDE2KSAmJiB0eXBlb2YgdmFsdWUudGhlbiA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHZhbHVlO1xuXHR9XG5cdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG5cdHZhciBkZWYgPSB7fTtcblx0bGVhZlByb3RvdHlwZXMgPSBsZWFmUHJvdG90eXBlcyB8fCBbbnVsbCwgZ2V0UHJvdG8oe30pLCBnZXRQcm90byhbXSksIGdldFByb3RvKGdldFByb3RvKV07XG5cdGZvcih2YXIgY3VycmVudCA9IG1vZGUgJiAyICYmIHZhbHVlOyB0eXBlb2YgY3VycmVudCA9PSAnb2JqZWN0JyAmJiAhfmxlYWZQcm90b3R5cGVzLmluZGV4T2YoY3VycmVudCk7IGN1cnJlbnQgPSBnZXRQcm90byhjdXJyZW50KSkge1xuXHRcdE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGN1cnJlbnQpLmZvckVhY2goKGtleSkgPT4gKGRlZltrZXldID0gKCkgPT4gKHZhbHVlW2tleV0pKSk7XG5cdH1cblx0ZGVmWydkZWZhdWx0J10gPSAoKSA9PiAodmFsdWUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGRlZik7XG5cdHJldHVybiBucztcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8qXG5SRUFETUU6IGh0dHBzOi8vZ2l0aHViLmNvbS9WaXJnaWxDbHluZS9pUmluZ29cbiovXG5cbmltcG9ydCBFTlZzIGZyb20gXCIuL0VOVi9FTlYubWpzXCI7XG5pbXBvcnQgVVJJcyBmcm9tIFwiLi9VUkkvVVJJLm1qc1wiO1xuaW1wb3J0IFhNTHMgZnJvbSBcIi4vWE1ML1hNTC5tanNcIjtcbmltcG9ydCBzZXRFTlYgZnJvbSBcIi4vZnVuY3Rpb24vc2V0RU5WLm1qc1wiO1xuXG5pbXBvcnQgKiBhcyBEZWZhdWx0IGZyb20gXCIuL2RhdGFiYXNlL0RlZmF1bHQuanNvblwiO1xuaW1wb3J0ICogYXMgTG9jYXRpb24gZnJvbSBcIi4vZGF0YWJhc2UvTG9jYXRpb24uanNvblwiO1xuaW1wb3J0ICogYXMgTmV3cyBmcm9tIFwiLi9kYXRhYmFzZS9OZXdzLmpzb25cIjtcbmltcG9ydCAqIGFzIFByaXZhdGVSZWxheSBmcm9tIFwiLi9kYXRhYmFzZS9Qcml2YXRlUmVsYXkuanNvblwiO1xuaW1wb3J0ICogYXMgU2lyaSBmcm9tIFwiLi9kYXRhYmFzZS9TaXJpLmpzb25cIjtcbmltcG9ydCAqIGFzIFRlc3RGbGlnaHQgZnJvbSBcIi4vZGF0YWJhc2UvVGVzdEZsaWdodC5qc29uXCI7XG5pbXBvcnQgKiBhcyBUViBmcm9tIFwiLi9kYXRhYmFzZS9UVi5qc29uXCI7XG5cbmNvbnN0ICQgPSBuZXcgRU5WcyhcIu+jvyBpUmluZ286IPCfk40gTG9jYXRpb24gdjMuMC41KDEpIHJlcXVlc3QuYmV0YVwiKTtcbmNvbnN0IFVSSSA9IG5ldyBVUklzKCk7XG5jb25zdCBYTUwgPSBuZXcgWE1McygpO1xuY29uc3QgRGF0YUJhc2UgPSB7XG5cdFwiRGVmYXVsdFwiOiBEZWZhdWx0LFxuXHRcIkxvY2F0aW9uXCI6IExvY2F0aW9uLFxuXHRcIk5ld3NcIjogTmV3cyxcblx0XCJQcml2YXRlUmVsYXlcIjogUHJpdmF0ZVJlbGF5LFxuXHRcIlNpcmlcIjogU2lyaSxcblx0XCJUZXN0RmxpZ2h0XCI6IFRlc3RGbGlnaHQsXG5cdFwiVFZcIjogVFYsXG59O1xuXG4vLyDmnoTpgKDlm57lpI3mlbDmja5cbmxldCAkcmVzcG9uc2UgPSB1bmRlZmluZWQ7XG5cbi8qKioqKioqKioqKioqKioqKiBQcm9jZXNzaW5nICoqKioqKioqKioqKioqKioqL1xuLy8g6Kej5p6EVVJMXG5jb25zdCBVUkwgPSBVUkkucGFyc2UoJHJlcXVlc3QudXJsKTtcbiQubG9nKGDimqAgJHskLm5hbWV9YCwgYFVSTDogJHtKU09OLnN0cmluZ2lmeShVUkwpfWAsIFwiXCIpO1xuLy8g6I635Y+W6L+e5o6l5Y+C5pWwXG5jb25zdCBNRVRIT0QgPSAkcmVxdWVzdC5tZXRob2QsIEhPU1QgPSBVUkwuaG9zdCwgUEFUSCA9IFVSTC5wYXRoLCBQQVRIcyA9IFVSTC5wYXRocztcbiQubG9nKGDimqAgJHskLm5hbWV9YCwgYE1FVEhPRDogJHtNRVRIT0R9YCwgXCJcIik7XG4vLyDop6PmnpDmoLzlvI9cbmNvbnN0IEZPUk1BVCA9ICgkcmVxdWVzdC5oZWFkZXJzPy5bXCJDb250ZW50LVR5cGVcIl0gPz8gJHJlcXVlc3QuaGVhZGVycz8uW1wiY29udGVudC10eXBlXCJdKT8uc3BsaXQoXCI7XCIpPy5bMF07XG4kLmxvZyhg4pqgICR7JC5uYW1lfWAsIGBGT1JNQVQ6ICR7Rk9STUFUfWAsIFwiXCIpO1xuKGFzeW5jICgpID0+IHtcblx0Y29uc3QgeyBTZXR0aW5ncywgQ2FjaGVzLCBDb25maWdzIH0gPSBzZXRFTlYoXCJpUmluZ29cIiwgXCJMb2NhdGlvblwiLCBEYXRhQmFzZSk7XG5cdCQubG9nKGDimqAgJHskLm5hbWV9YCwgYFNldHRpbmdzLlN3aXRjaDogJHtTZXR0aW5ncz8uU3dpdGNofWAsIFwiXCIpO1xuXHRzd2l0Y2ggKFNldHRpbmdzLlN3aXRjaCkge1xuXHRcdGNhc2UgdHJ1ZTpcblx0XHRkZWZhdWx0OlxuXHRcdFx0Ly8g5Yib5bu656m65pWw5o2uXG5cdFx0XHRsZXQgYm9keSA9IHt9O1xuXHRcdFx0Ly8g5pa55rOV5Yik5patXG5cdFx0XHRzd2l0Y2ggKE1FVEhPRCkge1xuXHRcdFx0XHRjYXNlIFwiUE9TVFwiOlxuXHRcdFx0XHRjYXNlIFwiUFVUXCI6XG5cdFx0XHRcdGNhc2UgXCJQQVRDSFwiOlxuXHRcdFx0XHRjYXNlIFwiREVMRVRFXCI6XG5cdFx0XHRcdFx0Ly8g5qC85byP5Yik5patXG5cdFx0XHRcdFx0c3dpdGNoIChGT1JNQVQpIHtcblx0XHRcdFx0XHRcdGNhc2UgdW5kZWZpbmVkOiAvLyDop4bkuLrml6Bib2R5XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcInRleHQvcGxhaW5cIjpcblx0XHRcdFx0XHRcdGNhc2UgXCJ0ZXh0L2h0bWxcIjpcblx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3gtbXBlZ1VSTFwiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3gtbXBlZ3VybFwiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3ZuZC5hcHBsZS5tcGVndXJsXCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiYXVkaW8vbXBlZ3VybFwiOlxuXHRcdFx0XHRcdFx0XHQvL2JvZHkgPSBNM1U4LnBhcnNlKCRyZXF1ZXN0LmJvZHkpO1xuXHRcdFx0XHRcdFx0XHQvLyQubG9nKGDwn5qnICR7JC5uYW1lfWAsIGBib2R5OiAke0pTT04uc3RyaW5naWZ5KGJvZHkpfWAsIFwiXCIpO1xuXHRcdFx0XHRcdFx0XHQvLyRyZXF1ZXN0LmJvZHkgPSBNM1U4LnN0cmluZ2lmeShib2R5KTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIFwidGV4dC94bWxcIjpcblx0XHRcdFx0XHRcdGNhc2UgXCJ0ZXh0L3BsaXN0XCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24veG1sXCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24vcGxpc3RcIjpcblx0XHRcdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi94LXBsaXN0XCI6XG5cdFx0XHRcdFx0XHRcdGJvZHkgPSBYTUwucGFyc2UoJHJlcXVlc3QuYm9keSk7XG5cdFx0XHRcdFx0XHRcdCQubG9nKGDwn5qnICR7JC5uYW1lfWAsIGBib2R5OiAke0pTT04uc3RyaW5naWZ5KGJvZHkpfWAsIFwiXCIpO1xuXHRcdFx0XHRcdFx0XHQkcmVxdWVzdC5ib2R5ID0gWE1MLnN0cmluZ2lmeShib2R5KTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIFwidGV4dC92dHRcIjpcblx0XHRcdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi92dHRcIjpcblx0XHRcdFx0XHRcdFx0Ly9ib2R5ID0gVlRULnBhcnNlKCRyZXF1ZXN0LmJvZHkpO1xuXHRcdFx0XHRcdFx0XHQvLyQubG9nKGDwn5qnICR7JC5uYW1lfWAsIGBib2R5OiAke0pTT04uc3RyaW5naWZ5KGJvZHkpfWAsIFwiXCIpO1xuXHRcdFx0XHRcdFx0XHQvLyRyZXF1ZXN0LmJvZHkgPSBWVFQuc3RyaW5naWZ5KGJvZHkpO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgXCJ0ZXh0L2pzb25cIjpcblx0XHRcdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi9qc29uXCI6XG5cdFx0XHRcdFx0XHRcdGJvZHkgPSBKU09OLnBhcnNlKCRyZXF1ZXN0LmJvZHkgPz8gXCJ7fVwiKTtcblx0XHRcdFx0XHRcdFx0JC5sb2coYPCfmqcgJHskLm5hbWV9YCwgYGJvZHk6ICR7SlNPTi5zdHJpbmdpZnkoYm9keSl9YCwgXCJcIik7XG5cdFx0XHRcdFx0XHRcdCRyZXF1ZXN0LmJvZHkgPSBKU09OLnN0cmluZ2lmeShib2R5KTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24vcHJvdG9idWZcIjpcblx0XHRcdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi94LXByb3RvYnVmXCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24vdm5kLmdvb2dsZS5wcm90b2J1ZlwiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL2dycGNcIjpcblx0XHRcdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi9ncnBjK3Byb3RvXCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiYXBwbGVjYXRpb24vb2N0ZXQtc3RyZWFtXCI6XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0Ly9icmVhazsgLy8g5LiN5Lit5pat77yM57un57ut5aSE55CGVVJMXG5cdFx0XHRcdGNhc2UgXCJHRVRcIjpcblx0XHRcdFx0Y2FzZSBcIkhFQURcIjpcblx0XHRcdFx0Y2FzZSBcIk9QVElPTlNcIjpcblx0XHRcdFx0Y2FzZSB1bmRlZmluZWQ6IC8vIFFY54mb6YC877yMc2NyaXB0LWVjaG8tcmVzcG9uc2XkuI3ov5Tlm55tZXRob2Rcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHQvLyDkuLvmnLrliKTmlq1cblx0XHRcdFx0XHRzd2l0Y2ggKEhPU1QpIHtcblx0XHRcdFx0XHRcdGNhc2UgXCJjb25maWd1cmF0aW9uLmxzLmFwcGxlLmNvbVwiOlxuXHRcdFx0XHRcdFx0XHQvLyDot6/lvoTliKTmlq1cblx0XHRcdFx0XHRcdFx0c3dpdGNoIChQQVRIKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcImNvbmZpZy9kZWZhdWx0c1wiOlxuXHRcdFx0XHRcdFx0XHRcdFx0JC5sb2Rhc2hfc2V0KENhY2hlcywgXCJEZWZhdWx0cy5FVGFnXCIsIHNldEVUYWcoJHJlcXVlc3Q/LmhlYWRlcnM/LltcIklmLU5vbmUtTWF0Y2hcIl0gPz8gJHJlcXVlc3Q/LmhlYWRlcnM/LltcImlmLW5vbmUtbWF0Y2hcIl0sIENhY2hlcz8uRGVmYXVsdHM/LkVUYWcpKTtcblx0XHRcdFx0XHRcdFx0XHRcdCQuc2V0anNvbihDYWNoZXMsIFwiQGlSaW5nby5Mb2NhdGlvbi5DYWNoZXNcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIFwiZ3NwZTEtc3NsLmxzLmFwcGxlLmNvbVwiOlxuXHRcdFx0XHRcdFx0XHRzd2l0Y2ggKFBBVEgpIHtcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwicGVwL2djY1wiOlxuXHRcdFx0XHRcdFx0XHRcdFx0LyogLy8g5LiN5L2/55SoIGVjaG8gcmVzcG9uc2Vcblx0XHRcdFx0XHRcdFx0XHRcdCRyZXNwb25zZSA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0c3RhdHVzOiAyMDAsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGhlYWRlcnM6IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcIkNvbnRlbnQtVHlwZVwiOiBcInRleHQvaHRtbFwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdERhdGU6IG5ldyBEYXRlKCkudG9VVENTdHJpbmcoKSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRDb25uZWN0aW9uOiBcImtlZXAtYWxpdmVcIixcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcIkNvbnRlbnQtRW5jb2RpbmdcIjogXCJpZGVudGl0eVwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRib2R5OiBTZXR0aW5ncy5QRVAuR0NDLFxuXHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdCQubG9nKEpTT04uc3RyaW5naWZ5KCRyZXNwb25zZSkpO1xuXHRcdFx0XHRcdFx0XHRcdFx0Ki9cblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgXCJnc3Atc3NsLmxzLmFwcGxlLmNvbVwiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcImRpc3BhdGNoZXIuaXMuYXV0b25hdmkuY29tXCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiZGlyZWN0aW9uMi5pcy5hdXRvbmF2aS5jb21cIjpcblx0XHRcdFx0XHRcdFx0c3dpdGNoIChQQVRIKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcImRpc3BhdGNoZXIuYXJwY1wiOlxuXHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJkaXNwYXRjaGVyXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRzd2l0Y2ggKFNldHRpbmdzPy5TZXJ2aWNlcz8uUGxhY2VEYXRhKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJBVVRPXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJDTlwiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFVSTC5ob3N0ID0gXCJkaXNwYXRjaGVyLmlzLmF1dG9uYXZpLmNvbVwiO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFVSTC5wYXRoID0gXCJkaXNwYXRjaGVyXCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJYWFwiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFVSTC5ob3N0ID0gXCJnc3Atc3NsLmxzLmFwcGxlLmNvbVwiO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFVSTC5wYXRoID0gXCJkaXNwYXRjaGVyLmFycGNcIjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiZGlyZWN0aW9ucy5hcnBjXCI6XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcImRpcmVjdGlvblwiOlxuXHRcdFx0XHRcdFx0XHRcdFx0c3dpdGNoIChTZXR0aW5ncz8uU2VydmljZXM/LkRpcmVjdGlvbnMpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcIkFVVE9cIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcIkNOXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0VVJMLmhvc3QgPSBcImRpcmVjdGlvbjIuaXMuYXV0b25hdmkuY29tXCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0VVJMLnBhdGggPSBcImRpcmVjdGlvblwiO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiWFhcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRVUkwuaG9zdCA9IFwiZ3NwLXNzbC5scy5hcHBsZS5jb21cIjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRVUkwucGF0aCA9IFwiZGlyZWN0aW9ucy5hcnBjXCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSBcInN1bmRldy5scy5hcHBsZS5jb21cIjpcblx0XHRcdFx0XHRcdGNhc2UgXCJyYXAuaXMuYXV0b25hdmkuY29tXCI6XG5cdFx0XHRcdFx0XHRcdHN3aXRjaCAoUEFUSCkge1xuXHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJ2MS9mZWVkYmFjay9zdWJtaXNzaW9uLmFycGNcIjpcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwicmFwXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRzd2l0Y2ggKFNldHRpbmdzPy5TZXJ2aWNlcz8uUkFQKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJBVVRPXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJDTlwiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFVSTC5ob3N0ID0gXCJyYXAuaXMuYXV0b25hdmkuY29tXCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0VVJMLnBhdGggPSBcInJhcFwiO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiWFhcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRVUkwuaG9zdCA9IFwic3VuZGV3LmxzLmFwcGxlLmNvbVwiO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFVSTC5wYXRoID0gXCJ2MS9mZWVkYmFjay9zdWJtaXNzaW9uLmFycGNcIjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiZ3JwL3N0XCI6XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcInJhcHN0YXR1c1wiOlxuXHRcdFx0XHRcdFx0XHRcdFx0c3dpdGNoIChTZXR0aW5ncz8uU2VydmljZXM/LlJBUCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiQVVUT1wiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiQ05cIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRVUkwuaG9zdCA9IFwicmFwLmlzLmF1dG9uYXZpLmNvbVwiO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFVSTC5wYXRoID0gXCJyYXBzdGF0dXNcIjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcIlhYXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0VVJMLmhvc3QgPSBcInN1bmRldy5scy5hcHBsZS5jb21cIjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRVUkwucGF0aCA9IFwiZ3JwL3N0XCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSBcImdzcGUxMi1zc2wubHMuYXBwbGUuY29tXCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiZ3NwZTEyLWNuLXNzbC5scy5hcHBsZS5jb21cIjpcblx0XHRcdFx0XHRcdFx0c3dpdGNoIChQQVRIKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcInRyYWZmaWNcIjpcblx0XHRcdFx0XHRcdFx0XHRcdHN3aXRjaCAoU2V0dGluZ3M/LlNlcnZpY2VzPy5UcmFmZmljKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJBVVRPXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJDTlwiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFVSTC5ob3N0ID0gXCJnc3BlMTItY24tc3NsLmxzLmFwcGxlLmNvbVwiO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiWFhcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRVUkwuaG9zdCA9IFwiZ3NwZTEyLXNzbC5scy5hcHBsZS5jb21cIjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIFwiZ3NwZTE5LXNzbC5scy5hcHBsZS5jb21cIjpcblx0XHRcdFx0XHRcdGNhc2UgXCJnc3BlMTktY24tc3NsLmxzLmFwcGxlLmNvbVwiOlxuXHRcdFx0XHRcdFx0XHRzd2l0Y2ggKFBBVEgpIHtcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwidGlsZS52ZlwiOlxuXHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJ0aWxlc1wiOlxuXHRcdFx0XHRcdFx0XHRcdFx0c3dpdGNoIChTZXR0aW5ncz8uU2VydmljZXM/LlRpbGVzKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJBVVRPXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJDTlwiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFVSTC5ob3N0ID0gXCJnc3BlMTktY24tc3NsLmxzLmFwcGxlLmNvbVwiO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFVSTC5wYXRoID0gXCJ0aWxlc1wiO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiWFhcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRVUkwuaG9zdCA9IFwiZ3NwZTE5LXNzbC5scy5hcHBsZS5jb21cIjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRVUkwucGF0aCA9IFwidGlsZS52ZlwiO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgXCJnc3BlMzUtc3NsLmxzLmFwcGxlLmNvbVwiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcImdzcGUzNS1zc2wubHMuYXBwbGUuY25cIjpcblx0XHRcdFx0XHRcdFx0c3dpdGNoIChQQVRIKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcImNvbmZpZy9hbm5vdW5jZW1lbnRzXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRzd2l0Y2ggKFVSTC5xdWVyeT8ub3MpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcImlvc1wiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiaXBhZG9zXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJtYWNvc1wiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHN3aXRjaCAoU2V0dGluZ3M/LkNvbmZpZz8uQW5ub3VuY2VtZW50cz8uRW52aXJvbm1lbnQ/LmRlZmF1bHQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJBVVRPXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHN3aXRjaCAoQ2FjaGVzPy5wZXA/LmdjYykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRVUkwucXVlcnkuZW52aXJvbm1lbnQgPSBcInByb2RcIjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJDTlwiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgdW5kZWZpbmVkOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0VVJMLnF1ZXJ5LmVudmlyb25tZW50ID0gXCJwcm9kLWNuXCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiQ05cIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFVSTC5xdWVyeS5lbnZpcm9ubWVudCA9IFwicHJvZC1jblwiO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJYWFwiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRVUkwucXVlcnkuZW52aXJvbm1lbnQgPSBcInByb2RcIjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcIndhdGNob3NcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzd2l0Y2ggKFNldHRpbmdzPy5Db25maWc/LkFubm91bmNlbWVudHM/LkVudmlyb25tZW50Py53YXRjaE9TKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiQVVUT1wiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzd2l0Y2ggKENhY2hlcz8ucGVwPy5nY2MpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0VVJMLnF1ZXJ5LmVudmlyb25tZW50ID0gXCJwcm9kXCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiQ05cIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIHVuZGVmaW5lZDpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFVSTC5xdWVyeS5lbnZpcm9ubWVudCA9IFwicHJvZC1jblwiO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcIlhYXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRVUkwucXVlcnkuZW52aXJvbm1lbnQgPSBcInByb2RcIjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiQ05cIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0VVJMLnF1ZXJ5LmVudmlyb25tZW50ID0gXCJwcm9kLWNuXCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0JC5sb2Rhc2hfc2V0KENhY2hlcywgXCJBbm5vdW5jZW1lbnRzLkVUYWdcIiwgc2V0RVRhZygkcmVxdWVzdC5oZWFkZXJzPy5bXCJJZi1Ob25lLU1hdGNoXCJdID8/ICRyZXF1ZXN0LmhlYWRlcnM/LltcImlmLW5vbmUtbWF0Y2hcIl0sIENhY2hlcz8uQW5ub3VuY2VtZW50cz8uRVRhZykpO1xuXHRcdFx0XHRcdFx0XHRcdFx0JC5zZXRqc29uKENhY2hlcywgXCJAaVJpbmdvLkxvY2F0aW9uLkNhY2hlc1wiKTtcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJnZW9fbWFuaWZlc3QvZHluYW1pYy9jb25maWdcIjpcblx0XHRcdFx0XHRcdFx0XHRcdHN3aXRjaCAoVVJMLnF1ZXJ5Py5vcykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiaW9zXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJpcGFkb3NcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcIm1hY29zXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3dpdGNoIChTZXR0aW5ncz8uR2VvX21hbmlmZXN0Py5EeW5hbWljPy5Db25maWc/LkNvdW50cnlfY29kZT8uZGVmYXVsdCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcIkFVVE9cIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3dpdGNoIChDYWNoZXM/LnBlcD8uZ2NjKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFVSTC5xdWVyeS5jb3VudHJ5X2NvZGUgPSBDYWNoZXM/LnBlcD8uZ2NjID8/IFwiVVNcIjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJDTlwiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgdW5kZWZpbmVkOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0VVJMLnF1ZXJ5LmNvdW50cnlfY29kZSA9IFwiQ05cIjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFVSTC5xdWVyeS5jb3VudHJ5X2NvZGUgPSBTZXR0aW5ncz8uR2VvX21hbmlmZXN0Py5EeW5hbWljPy5Db25maWc/LkNvdW50cnlfY29kZT8uZGVmYXVsdCA/PyBcIkNOXCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJ3YXRjaG9zXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3dpdGNoIChTZXR0aW5ncz8uR2VvX21hbmlmZXN0Py5EeW5hbWljPy5Db25maWc/LkNvdW50cnlfY29kZT8ud2F0Y2hPUykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcIkFVVE9cIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3dpdGNoIChDYWNoZXM/LnBlcD8uZ2NjKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFVSTC5xdWVyeS5jb3VudHJ5X2NvZGUgPSBDYWNoZXM/LnBlcD8uZ2NjID8/IFwiVVNcIjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJDTlwiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgdW5kZWZpbmVkOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0VVJMLnF1ZXJ5LmNvdW50cnlfY29kZSA9IFwiQ05cIjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFVSTC5xdWVyeS5jb3VudHJ5X2NvZGUgPSBTZXR0aW5ncz8uR2VvX21hbmlmZXN0Py5EeW5hbWljPy5Db25maWc/LkNvdW50cnlfY29kZT8ud2F0Y2hPUyA/PyBcIlVTXCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0JC5sb2Rhc2hfc2V0KENhY2hlcywgXCJEeW5hbWljLkVUYWdcIiwgc2V0RVRhZygkcmVxdWVzdD8uaGVhZGVycz8uW1wiSWYtTm9uZS1NYXRjaFwiXSA/PyAkcmVxdWVzdD8uaGVhZGVycz8uW1wiaWYtbm9uZS1tYXRjaFwiXSwgQ2FjaGVzPy5EeW5hbWljPy5FVGFnKSk7XG5cdFx0XHRcdFx0XHRcdFx0XHQkLnNldGpzb24oQ2FjaGVzLCBcIkBpUmluZ28uTG9jYXRpb24uQ2FjaGVzXCIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJDT05ORUNUXCI6XG5cdFx0XHRcdGNhc2UgXCJUUkFDRVwiOlxuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fTtcblx0XHRcdGlmICgkcmVxdWVzdC5oZWFkZXJzPy5Ib3N0KSAkcmVxdWVzdC5oZWFkZXJzLkhvc3QgPSBVUkwuaG9zdDtcblx0XHRcdCRyZXF1ZXN0LnVybCA9IFVSSS5zdHJpbmdpZnkoVVJMKTtcblx0XHRcdCQubG9nKGDwn5qnICR7JC5uYW1lfSwg6LCD6K+V5L+h5oGvYCwgYCRyZXF1ZXN0LnVybDogJHskcmVxdWVzdC51cmx9YCwgXCJcIik7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIGZhbHNlOlxuXHRcdFx0YnJlYWs7XG5cdH07XG59KSgpXG5cdC5jYXRjaCgoZSkgPT4gJC5sb2dFcnIoZSkpXG5cdC5maW5hbGx5KCgpID0+IHtcblx0XHRzd2l0Y2ggKCRyZXNwb25zZSkge1xuXHRcdFx0ZGVmYXVsdDogeyAvLyDmnInmnoTpgKDlm57lpI3mlbDmja7vvIzov5Tlm57mnoTpgKDnmoTlm57lpI3mlbDmja5cblx0XHRcdFx0Y29uc3QgRk9STUFUID0gKCRyZXNwb25zZT8uaGVhZGVycz8uW1wiQ29udGVudC1UeXBlXCJdID8/ICRyZXNwb25zZT8uaGVhZGVycz8uW1wiY29udGVudC10eXBlXCJdKT8uc3BsaXQoXCI7XCIpPy5bMF07XG5cdFx0XHRcdCQubG9nKGDwn46JICR7JC5uYW1lfSwgZmluYWxseWAsIGBlY2hvICRyZXNwb25zZWAsIGBGT1JNQVQ6ICR7Rk9STUFUfWAsIFwiXCIpO1xuXHRcdFx0XHQvLyQubG9nKGDwn5qnICR7JC5uYW1lfSwgZmluYWxseWAsIGBlY2hvICRyZXNwb25zZTogJHtKU09OLnN0cmluZ2lmeSgkcmVzcG9uc2UpfWAsIFwiXCIpO1xuXHRcdFx0XHRpZiAoJHJlc3BvbnNlPy5oZWFkZXJzPy5bXCJDb250ZW50LUVuY29kaW5nXCJdKSAkcmVzcG9uc2UuaGVhZGVyc1tcIkNvbnRlbnQtRW5jb2RpbmdcIl0gPSBcImlkZW50aXR5XCI7XG5cdFx0XHRcdGlmICgkcmVzcG9uc2U/LmhlYWRlcnM/LltcImNvbnRlbnQtZW5jb2RpbmdcIl0pICRyZXNwb25zZS5oZWFkZXJzW1wiY29udGVudC1lbmNvZGluZ1wiXSA9IFwiaWRlbnRpdHlcIjtcblx0XHRcdFx0aWYgKCQuaXNRdWFuWCgpKSB7XG5cdFx0XHRcdFx0JHJlc3BvbnNlLnN0YXR1cyA9IFwiSFRUUC8xLjEgMjAwIE9LXCI7XG5cdFx0XHRcdFx0ZGVsZXRlICRyZXNwb25zZT8uaGVhZGVycz8uW1wiQ29udGVudC1MZW5ndGhcIl07XG5cdFx0XHRcdFx0ZGVsZXRlICRyZXNwb25zZT8uaGVhZGVycz8uW1wiY29udGVudC1sZW5ndGhcIl07XG5cdFx0XHRcdFx0ZGVsZXRlICRyZXNwb25zZT8uaGVhZGVycz8uW1wiVHJhbnNmZXItRW5jb2RpbmdcIl07XG5cdFx0XHRcdFx0c3dpdGNoIChGT1JNQVQpIHtcblx0XHRcdFx0XHRcdGNhc2UgdW5kZWZpbmVkOiAvLyDop4bkuLrml6Bib2R5XG5cdFx0XHRcdFx0XHRcdC8vIOi/lOWbnuaZrumAmuaVsOaNrlxuXHRcdFx0XHRcdFx0XHQkLmRvbmUoeyBzdGF0dXM6ICRyZXNwb25zZS5zdGF0dXMsIGhlYWRlcnM6ICRyZXNwb25zZS5oZWFkZXJzIH0pO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdC8vIOi/lOWbnuaZrumAmuaVsOaNrlxuXHRcdFx0XHRcdFx0XHQkLmRvbmUoeyBzdGF0dXM6ICRyZXNwb25zZS5zdGF0dXMsIGhlYWRlcnM6ICRyZXNwb25zZS5oZWFkZXJzLCBib2R5OiAkcmVzcG9uc2UuYm9keSB9KTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24vcHJvdG9idWZcIjpcblx0XHRcdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi94LXByb3RvYnVmXCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24vdm5kLmdvb2dsZS5wcm90b2J1ZlwiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL2dycGNcIjpcblx0XHRcdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi9ncnBjK3Byb3RvXCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiYXBwbGVjYXRpb24vb2N0ZXQtc3RyZWFtXCI6XG5cdFx0XHRcdFx0XHRcdC8vIOi/lOWbnuS6jOi/m+WItuaVsOaNrlxuXHRcdFx0XHRcdFx0XHQvLyQubG9nKGAkeyRyZXNwb25zZS5ib2R5Qnl0ZXMuYnl0ZUxlbmd0aH0tLS0keyRyZXNwb25zZS5ib2R5Qnl0ZXMuYnVmZmVyLmJ5dGVMZW5ndGh9YCk7XG5cdFx0XHRcdFx0XHRcdCQuZG9uZSh7IHN0YXR1czogJHJlc3BvbnNlLnN0YXR1cywgaGVhZGVyczogJHJlc3BvbnNlLmhlYWRlcnMsIGJvZHlCeXRlczogJHJlc3BvbnNlLmJvZHlCeXRlcyB9KTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fSBlbHNlICQuZG9uZSh7IHJlc3BvbnNlOiAkcmVzcG9uc2UgfSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fTtcblx0XHRcdGNhc2UgdW5kZWZpbmVkOiB7IC8vIOaXoOaehOmAoOWbnuWkjeaVsOaNru+8jOWPkemAgeS/ruaUueeahOivt+axguaVsOaNrlxuXHRcdFx0XHQvL2NvbnN0IEZPUk1BVCA9ICgkcmVxdWVzdD8uaGVhZGVycz8uW1wiQ29udGVudC1UeXBlXCJdID8/ICRyZXF1ZXN0Py5oZWFkZXJzPy5bXCJjb250ZW50LXR5cGVcIl0pPy5zcGxpdChcIjtcIik/LlswXTtcblx0XHRcdFx0JC5sb2coYPCfjokgJHskLm5hbWV9LCBmaW5hbGx5YCwgYCRyZXF1ZXN0YCwgYEZPUk1BVDogJHtGT1JNQVR9YCwgXCJcIik7XG5cdFx0XHRcdC8vJC5sb2coYPCfmqcgJHskLm5hbWV9LCBmaW5hbGx5YCwgYCRyZXF1ZXN0OiAke0pTT04uc3RyaW5naWZ5KCRyZXF1ZXN0KX1gLCBcIlwiKTtcblx0XHRcdFx0aWYgKCQuaXNRdWFuWCgpKSB7XG5cdFx0XHRcdFx0c3dpdGNoIChGT1JNQVQpIHtcblx0XHRcdFx0XHRcdGNhc2UgdW5kZWZpbmVkOiAvLyDop4bkuLrml6Bib2R5XG5cdFx0XHRcdFx0XHRcdC8vIOi/lOWbnuaZrumAmuaVsOaNrlxuXHRcdFx0XHRcdFx0XHQkLmRvbmUoeyB1cmw6ICRyZXF1ZXN0LnVybCwgaGVhZGVyczogJHJlcXVlc3QuaGVhZGVycyB9KVxuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdC8vIOi/lOWbnuaZrumAmuaVsOaNrlxuXHRcdFx0XHRcdFx0XHQkLmRvbmUoeyB1cmw6ICRyZXF1ZXN0LnVybCwgaGVhZGVyczogJHJlcXVlc3QuaGVhZGVycywgYm9keTogJHJlcXVlc3QuYm9keSB9KVxuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi9wcm90b2J1ZlwiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3gtcHJvdG9idWZcIjpcblx0XHRcdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi92bmQuZ29vZ2xlLnByb3RvYnVmXCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24vZ3JwY1wiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL2dycGMrcHJvdG9cIjpcblx0XHRcdFx0XHRcdGNhc2UgXCJhcHBsZWNhdGlvbi9vY3RldC1zdHJlYW1cIjpcblx0XHRcdFx0XHRcdFx0Ly8g6L+U5Zue5LqM6L+b5Yi25pWw5o2uXG5cdFx0XHRcdFx0XHRcdC8vJC5sb2coYCR7JHJlcXVlc3QuYm9keUJ5dGVzLmJ5dGVMZW5ndGh9LS0tJHskcmVxdWVzdC5ib2R5Qnl0ZXMuYnVmZmVyLmJ5dGVMZW5ndGh9YCk7XG5cdFx0XHRcdFx0XHRcdCQuZG9uZSh7IHVybDogJHJlcXVlc3QudXJsLCBoZWFkZXJzOiAkcmVxdWVzdC5oZWFkZXJzLCBib2R5Qnl0ZXM6ICRyZXF1ZXN0LmJvZHlCeXRlcy5idWZmZXIuc2xpY2UoJHJlcXVlc3QuYm9keUJ5dGVzLmJ5dGVPZmZzZXQsICRyZXF1ZXN0LmJvZHlCeXRlcy5ieXRlTGVuZ3RoICsgJHJlcXVlc3QuYm9keUJ5dGVzLmJ5dGVPZmZzZXQpIH0pO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9IGVsc2UgJC5kb25lKCRyZXF1ZXN0KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9O1xuXHRcdH07XG5cdH0pXG5cbi8qKioqKioqKioqKioqKioqKiBGdW5jdGlvbiAqKioqKioqKioqKioqKioqKi9cbi8qKlxuICogU2V0IEVUYWdcbiAqIEBhdXRob3IgVmlyZ2lsQ2x5bmVcbiAqIEBwYXJhbSB7U3RyaW5nfSBJZk5vbmVNYXRjaCAtIElmLU5vbmUtTWF0Y2hcbiAqIEByZXR1cm4ge1N0cmluZ30gRVRhZyAtIEVUYWdcbiAqL1xuZnVuY3Rpb24gc2V0RVRhZyhJZk5vbmVNYXRjaCwgRVRhZykge1xuXHQkLmxvZyhg4piR77iPICR7JC5uYW1lfSwgU2V0IEVUYWdgLCBgSWYtTm9uZS1NYXRjaDogJHtJZk5vbmVNYXRjaH1gLCBgRVRhZzogJHtFVGFnfWAsIFwiXCIpO1xuXHRpZiAoSWZOb25lTWF0Y2ggIT09IEVUYWcpIHtcblx0XHRFVGFnID0gSWZOb25lTWF0Y2g7XG5cdFx0ZGVsZXRlICRyZXF1ZXN0Py5oZWFkZXJzPy5bXCJJZi1Ob25lLU1hdGNoXCJdO1xuXHRcdGRlbGV0ZSAkcmVxdWVzdD8uaGVhZGVycz8uW1wiaWYtbm9uZS1tYXRjaFwiXTtcblx0fVxuXHQkLmxvZyhg4pyFICR7JC5uYW1lfSwgU2V0IEVUYWdgLCBcIlwiKTtcblx0cmV0dXJuIEVUYWc7XG59O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9