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
/*!***************************************!*\
  !*** ./src/Location.response.beta.js ***!
  \***************************************/
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














const $ = new _ENV_ENV_mjs__WEBPACK_IMPORTED_MODULE_0__["default"](" iRingo: 📍 Location v3.1.5(1) response.beta");
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

/***************** Processing *****************/
// 解构URL
const URL = URI.parse($request.url);
$.log(`⚠ ${$.name}`, `URL: ${JSON.stringify(URL)}`, "");
// 获取连接参数
const METHOD = $request.method, HOST = URL.host, PATH = URL.path, PATHs = URL.paths;
$.log(`⚠ ${$.name}`, `METHOD: ${METHOD}`, "");
// 解析格式
const FORMAT = ($response.headers?.["Content-Type"] ?? $response.headers?.["content-type"])?.split(";")?.[0];
$.log(`⚠ ${$.name}`, `FORMAT: ${FORMAT}`, "");
(async () => {
	const { Settings, Caches, Configs } = (0,_function_setENV_mjs__WEBPACK_IMPORTED_MODULE_3__["default"])("iRingo", "Location", DataBase);
	$.log(`⚠ ${$.name}`, `Settings.Switch: ${Settings?.Switch}`, "");
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
				case "text/html":
				default:
					switch (HOST) {
						case "gspe1-ssl.ls.apple.com":
							switch (PATH) {
								case "pep/gcc":
									await setGCC("pep", Caches);
									switch (Settings.PEP.GCC) {
										case "AUTO":
											break;
										default:
											$response.body = Settings.PEP.GCC;
											break;
									};
									break;
							};
							break;
					};
					break;
				case "application/x-mpegURL":
				case "application/x-mpegurl":
				case "application/vnd.apple.mpegurl":
				case "audio/mpegurl":
					//body = M3U8.parse($response.body);
					//$.log(`🚧 ${$.name}`, `body: ${JSON.stringify(body)}`, "");
					//$response.body = M3U8.stringify(body);
					break;
				case "text/xml":
				case "text/plist":
				case "application/xml":
				case "application/plist":
				case "application/x-plist":
					$.log(`🚧 ${$.name}`, `body: ${body}`, "");
					//body = await PLISTs("plist2json", $response.body);
					body = XML.parse($response.body);
					$.log(`🚧 ${$.name}`, `body: ${JSON.stringify(body)}`, "");
					// 主机判断
					switch (HOST) {
						case "configuration.ls.apple.com":
							// 路径判断
							switch (PATH) {
								case "config/defaults":
									const PLIST = body.plist;
									if (PLIST) {
										// set settings
										// CN
										PLIST["com.apple.GEO"].CountryProviders.CN.ShouldEnableLagunaBeach = Settings?.Config?.Defaults?.LagunaBeach ?? true; // XX
										PLIST["com.apple.GEO"].CountryProviders.CN.DrivingMultiWaypointRoutesEnabled = Settings?.Config?.Defaults?.DrivingMultiWaypointRoutesEnabled ?? true; // 驾驶导航途径点
										//PLIST["com.apple.GEO"].CountryProviders.CN.EnableAlberta = false; // CN
										//PLIST["com.apple.GEO"].CountryProviders.CN.EnableClientDrapedVectorPolygons = false; // CN
										PLIST["com.apple.GEO"].CountryProviders.CN.GEOAddressCorrectionEnabled = Settings?.Config?.Defaults?.GEOAddressCorrection ?? true; // CN
										if (Settings?.Config?.Defaults?.LookupMaxParametersCount ?? true) {
											delete PLIST["com.apple.GEO"].CountryProviders.CN.GEOBatchSpatialEventLookupMaxParametersCount // CN
											delete PLIST["com.apple.GEO"].CountryProviders.CN.GEOBatchSpatialPlaceLookupMaxParametersCount // CN
										}
										PLIST["com.apple.GEO"].CountryProviders.CN.LocalitiesAndLandmarksSupported = Settings?.Config?.Defaults?.LocalitiesAndLandmarks ?? true; // CN
										//PLIST["com.apple.GEO"].CountryProviders.CN.NavigationShowHeadingKey = true;
										PLIST["com.apple.GEO"].CountryProviders.CN.POIBusynessDifferentialPrivacy = Settings?.Config?.Defaults?.POIBusyness ?? true; // CN
										PLIST["com.apple.GEO"].CountryProviders.CN.POIBusynessRealTime = Settings?.Config?.Defaults?.POIBusyness ?? true; // CN
										PLIST["com.apple.GEO"].CountryProviders.CN.TransitPayEnabled = Settings?.Config?.Defaults?.TransitPayEnabled ?? true; // CN
										//PLIST["com.apple.GEO"].CountryProviders.CN.WiFiQualityNetworkDisabled = Settings?.Config?.Defaults?.WiFiQualityNetworkDisabled ?? true; // CN
										//PLIST["com.apple.GEO"].CountryProviders.CN.WiFiQualityTileDisabled = Settings?.Config?.Defaults?.WiFiQualityTileDisabled ?? true; // CN
										PLIST["com.apple.GEO"].CountryProviders.CN.SupportsOffline = Settings?.Config?.Defaults?.SupportsOffline ?? true; // CN
										PLIST["com.apple.GEO"].CountryProviders.CN.SupportsCarIntegration = Settings?.Config?.Defaults?.SupportsCarIntegration ?? true; // CN
										// TW
										//PLIST["com.apple.GEO"].CountryProviders.CN.GEOShouldSpeakWrittenAddresses = true; // TW
										//PLIST["com.apple.GEO"].CountryProviders.CN.GEOShouldSpeakWrittenPlaceNames = true; // TW
										// US
										PLIST["com.apple.GEO"].CountryProviders.CN["6694982d2b14e95815e44e970235e230"] = Settings?.Config?.Defaults?.["6694982d2b14e95815e44e970235e230"] ?? true; // US
										PLIST["com.apple.GEO"].CountryProviders.CN.PedestrianAREnabled = Settings?.Config?.Defaults?.PedestrianAR ?? true; // 现实世界中的线路
										PLIST["com.apple.GEO"].CountryProviders.CN.OpticalHeadingEnabled = Settings?.Config?.Defaults?.OpticalHeading ?? true; // 举起以查看
										PLIST["com.apple.GEO"].CountryProviders.CN.UseCLPedestrianMapMatchedLocations = Settings?.Config?.Defaults?.UseCLPedestrianMapMatchedLocations ?? true; // 导航准确性-增强
									};
									break;
							};
							break;
					};
					$.log(`🚧 ${$.name}`, `body: ${JSON.stringify(body)}`, "");
					//$response.body = await PLISTs("json2plist", body); // json2plist
					$response.body = XML.stringify(body);
					break;
				case "text/vtt":
				case "application/vtt":
					//body = VTT.parse($response.body);
					//$.log(`🚧 ${$.name}`, `body: ${JSON.stringify(body)}`, "");
					//$response.body = VTT.stringify(body);
					break;
				case "text/json":
				case "application/json":
					body = JSON.parse($response.body ?? "{}");
					$.log(`🚧 ${$.name}`, `body: ${JSON.stringify(body)}`, "");
					$response.body = JSON.stringify(body);
					break;
				case "application/protobuf":
				case "application/x-protobuf":
				case "application/vnd.google.protobuf":
				case "application/grpc":
				case "application/grpc+proto":
				case "applecation/octet-stream":
					break;
			};
			break;
		case false:
			break;
	};
})()
	.catch((e) => $.logErr(e))
	.finally(() => {
		switch ($response) {
			default: { // 有回复数据，返回回复数据
				//const FORMAT = ($response?.headers?.["Content-Type"] ?? $response?.headers?.["content-type"])?.split(";")?.[0];
				$.log(`🎉 ${$.name}, finally`, `$response`, `FORMAT: ${FORMAT}`, "");
				//$.log(`🚧 ${$.name}, finally`, `$response: ${JSON.stringify($response)}`, "");
				if ($response?.headers?.["Content-Encoding"]) $response.headers["Content-Encoding"] = "identity";
				if ($response?.headers?.["content-encoding"]) $response.headers["content-encoding"] = "identity";
				if ($.isQuanX()) {
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
							$.done({ status: $response.status, headers: $response.headers, bodyBytes: $response.bodyBytes.buffer.slice($response.bodyBytes.byteOffset, $response.bodyBytes.byteLength + $response.bodyBytes.byteOffset) });
							break;
					};
				} else $.done($response);
				break;
			};
			case undefined: { // 无回复数据
				break;
			};
		};
	})

/***************** Function *****************/
/**
 * Set GCC
 * @author VirgilClyne
 * @param {String} name - Config Name
 * @param {Object} caches - Caches
 * @return {Promise<*>}
 */
async function setGCC(name, caches) {
	$.log(`⚠ ${$.name}, Set GCC`, `caches.${name}.gcc = ${caches?.[name]?.gcc}`, "");
	if ($response.body !== caches?.[name]?.gcc) {
		let newCaches = caches;
		newCaches[name] = { "gcc": $response.body };
		$.setjson(newCaches, "@iRingo.Location.Caches");
	}
	return $.log(`🎉 ${$.name}, Set GCC`, `caches.${name}.gcc = ${caches?.[name]?.gcc}`, "");
};

/**
 * Parse Plist
 * @author VirgilClyne
 * @typedef { "json2plist" | "plist2json" } opt
 * @param {opt} opt - do types
 * @param {String} string - string
 * @return {Promise<*>}
 */
async function PLISTs(opt, string) {
	const request = {
		"url": "https://json2plist.nanocat.me/convert.php",
		"headers": {
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
			"Accept": "text/javascript, text/html, application/xml, text/xml, */*",
		},
		"body": `do=${opt}&content=` + encodeURIComponent(string)
	};
	return await $.http.post(request).then(v => v.body);
};

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9jYXRpb24ucmVzcG9uc2UuYmV0YS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBZTtBQUNmO0FBQ0EsaUJBQWlCLEtBQUs7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsVUFBVTtBQUMvQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxjQUFjLEtBQUs7QUFDbkIsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixLQUFLO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLGVBQWUsK0JBQStCO0FBQzlDO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBLEtBQUs7QUFDTCxJQUFJO0FBQ0o7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUVBQXFFO0FBQ3JFO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CO0FBQ3BCLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGtDQUFrQztBQUNsQztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQSxTQUFTLDhDQUE4QztBQUN2RDtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxtQ0FBbUM7QUFDbkM7QUFDQTtBQUNBOztBQUVBO0FB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bkIsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1REFBdUQ7QUFDdkQ7QUFDQSxHQUFHO0FBQ0gsZ0JBQWdCLElBQUk7QUFDcEI7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vaXJpbmdvLy4vc3JjL0VOVi9FTlYubWpzIiwid2VicGFjazovL2lyaW5nby8uL3NyYy9VUkkvVVJJLm1qcyIsIndlYnBhY2s6Ly9pcmluZ28vLi9zcmMvWE1ML1hNTC5tanMiLCJ3ZWJwYWNrOi8vaXJpbmdvLy4vc3JjL2Z1bmN0aW9uL3NldEVOVi5tanMiLCJ3ZWJwYWNrOi8vaXJpbmdvL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2lyaW5nby93ZWJwYWNrL3J1bnRpbWUvY3JlYXRlIGZha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9pcmluZ28vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2lyaW5nby93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2lyaW5nby93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2lyaW5nby8uL3NyYy9Mb2NhdGlvbi5yZXNwb25zZS5iZXRhLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IGNsYXNzIEVOViB7XG5cdGNvbnN0cnVjdG9yKG5hbWUsIG9wdHMpIHtcblx0XHR0aGlzLm5hbWUgPSBgJHtuYW1lfSwgRU5WIHYxLjAuMGBcblx0XHR0aGlzLmh0dHAgPSBuZXcgSHR0cCh0aGlzKVxuXHRcdHRoaXMuZGF0YSA9IG51bGxcblx0XHR0aGlzLmRhdGFGaWxlID0gJ2JveC5kYXQnXG5cdFx0dGhpcy5sb2dzID0gW11cblx0XHR0aGlzLmlzTXV0ZSA9IGZhbHNlXG5cdFx0dGhpcy5pc05lZWRSZXdyaXRlID0gZmFsc2Vcblx0XHR0aGlzLmxvZ1NlcGFyYXRvciA9ICdcXG4nXG5cdFx0dGhpcy5lbmNvZGluZyA9ICd1dGYtOCdcblx0XHR0aGlzLnN0YXJ0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG5cdFx0T2JqZWN0LmFzc2lnbih0aGlzLCBvcHRzKVxuXHRcdHRoaXMubG9nKCcnLCBg8J+PgSAke3RoaXMubmFtZX0sIOW8gOWniyFgKVxuXHR9XG5cblx0UGxhdGZvcm0oKSB7XG5cdFx0aWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgJGVudmlyb25tZW50ICYmICRlbnZpcm9ubWVudFsnc3VyZ2UtdmVyc2lvbiddKVxuXHRcdFx0cmV0dXJuICdTdXJnZSdcblx0XHRpZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiAkZW52aXJvbm1lbnQgJiYgJGVudmlyb25tZW50WydzdGFzaC12ZXJzaW9uJ10pXG5cdFx0XHRyZXR1cm4gJ1N0YXNoJ1xuXHRcdGlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mICR0YXNrKSByZXR1cm4gJ1F1YW50dW11bHQgWCdcblx0XHRpZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiAkbG9vbikgcmV0dXJuICdMb29uJ1xuXHRcdGlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mICRyb2NrZXQpIHJldHVybiAnU2hhZG93cm9ja2V0J1xuXHR9XG5cblx0aXNRdWFuWCgpIHtcblx0XHRyZXR1cm4gJ1F1YW50dW11bHQgWCcgPT09IHRoaXMuUGxhdGZvcm0oKVxuXHR9XG5cblx0aXNTdXJnZSgpIHtcblx0XHRyZXR1cm4gJ1N1cmdlJyA9PT0gdGhpcy5QbGF0Zm9ybSgpXG5cdH1cblxuXHRpc0xvb24oKSB7XG5cdFx0cmV0dXJuICdMb29uJyA9PT0gdGhpcy5QbGF0Zm9ybSgpXG5cdH1cblxuXHRpc1NoYWRvd3JvY2tldCgpIHtcblx0XHRyZXR1cm4gJ1NoYWRvd3JvY2tldCcgPT09IHRoaXMuUGxhdGZvcm0oKVxuXHR9XG5cblx0aXNTdGFzaCgpIHtcblx0XHRyZXR1cm4gJ1N0YXNoJyA9PT0gdGhpcy5QbGF0Zm9ybSgpXG5cdH1cblxuXHR0b09iaihzdHIsIGRlZmF1bHRWYWx1ZSA9IG51bGwpIHtcblx0XHR0cnkge1xuXHRcdFx0cmV0dXJuIEpTT04ucGFyc2Uoc3RyKVxuXHRcdH0gY2F0Y2gge1xuXHRcdFx0cmV0dXJuIGRlZmF1bHRWYWx1ZVxuXHRcdH1cblx0fVxuXG5cdHRvU3RyKG9iaiwgZGVmYXVsdFZhbHVlID0gbnVsbCkge1xuXHRcdHRyeSB7XG5cdFx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkob2JqKVxuXHRcdH0gY2F0Y2gge1xuXHRcdFx0cmV0dXJuIGRlZmF1bHRWYWx1ZVxuXHRcdH1cblx0fVxuXG5cdGdldGpzb24oa2V5LCBkZWZhdWx0VmFsdWUpIHtcblx0XHRsZXQganNvbiA9IGRlZmF1bHRWYWx1ZVxuXHRcdGNvbnN0IHZhbCA9IHRoaXMuZ2V0ZGF0YShrZXkpXG5cdFx0aWYgKHZhbCkge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0anNvbiA9IEpTT04ucGFyc2UodGhpcy5nZXRkYXRhKGtleSkpXG5cdFx0XHR9IGNhdGNoIHsgfVxuXHRcdH1cblx0XHRyZXR1cm4ganNvblxuXHR9XG5cblx0c2V0anNvbih2YWwsIGtleSkge1xuXHRcdHRyeSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5zZXRkYXRhKEpTT04uc3RyaW5naWZ5KHZhbCksIGtleSlcblx0XHR9IGNhdGNoIHtcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdH1cblx0fVxuXG5cdGdldFNjcmlwdCh1cmwpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdHRoaXMuZ2V0KHsgdXJsIH0sIChlcnJvciwgcmVzcG9uc2UsIGJvZHkpID0+IHJlc29sdmUoYm9keSkpXG5cdFx0fSlcblx0fVxuXG5cdHJ1blNjcmlwdChzY3JpcHQsIHJ1bk9wdHMpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdGxldCBodHRwYXBpID0gdGhpcy5nZXRkYXRhKCdAY2hhdnlfYm94anNfdXNlckNmZ3MuaHR0cGFwaScpXG5cdFx0XHRodHRwYXBpID0gaHR0cGFwaSA/IGh0dHBhcGkucmVwbGFjZSgvXFxuL2csICcnKS50cmltKCkgOiBodHRwYXBpXG5cdFx0XHRsZXQgaHR0cGFwaV90aW1lb3V0ID0gdGhpcy5nZXRkYXRhKFxuXHRcdFx0XHQnQGNoYXZ5X2JveGpzX3VzZXJDZmdzLmh0dHBhcGlfdGltZW91dCdcblx0XHRcdClcblx0XHRcdGh0dHBhcGlfdGltZW91dCA9IGh0dHBhcGlfdGltZW91dCA/IGh0dHBhcGlfdGltZW91dCAqIDEgOiAyMFxuXHRcdFx0aHR0cGFwaV90aW1lb3V0ID1cblx0XHRcdFx0cnVuT3B0cyAmJiBydW5PcHRzLnRpbWVvdXQgPyBydW5PcHRzLnRpbWVvdXQgOiBodHRwYXBpX3RpbWVvdXRcblx0XHRcdGNvbnN0IFtrZXksIGFkZHJdID0gaHR0cGFwaS5zcGxpdCgnQCcpXG5cdFx0XHRjb25zdCBvcHRzID0ge1xuXHRcdFx0XHR1cmw6IGBodHRwOi8vJHthZGRyfS92MS9zY3JpcHRpbmcvZXZhbHVhdGVgLFxuXHRcdFx0XHRib2R5OiB7XG5cdFx0XHRcdFx0c2NyaXB0X3RleHQ6IHNjcmlwdCxcblx0XHRcdFx0XHRtb2NrX3R5cGU6ICdjcm9uJyxcblx0XHRcdFx0XHR0aW1lb3V0OiBodHRwYXBpX3RpbWVvdXRcblx0XHRcdFx0fSxcblx0XHRcdFx0aGVhZGVyczogeyAnWC1LZXknOiBrZXksICdBY2NlcHQnOiAnKi8qJyB9LFxuXHRcdFx0XHR0aW1lb3V0OiBodHRwYXBpX3RpbWVvdXRcblx0XHRcdH1cblx0XHRcdHRoaXMucG9zdChvcHRzLCAoZXJyb3IsIHJlc3BvbnNlLCBib2R5KSA9PiByZXNvbHZlKGJvZHkpKVxuXHRcdH0pLmNhdGNoKChlKSA9PiB0aGlzLmxvZ0VycihlKSlcblx0fVxuXG5cdGxvYWRkYXRhKCkge1xuXHRcdGlmICh0aGlzLmlzTm9kZSgpKSB7XG5cdFx0XHR0aGlzLmZzID0gdGhpcy5mcyA/IHRoaXMuZnMgOiByZXF1aXJlKCdmcycpXG5cdFx0XHR0aGlzLnBhdGggPSB0aGlzLnBhdGggPyB0aGlzLnBhdGggOiByZXF1aXJlKCdwYXRoJylcblx0XHRcdGNvbnN0IGN1ckRpckRhdGFGaWxlUGF0aCA9IHRoaXMucGF0aC5yZXNvbHZlKHRoaXMuZGF0YUZpbGUpXG5cdFx0XHRjb25zdCByb290RGlyRGF0YUZpbGVQYXRoID0gdGhpcy5wYXRoLnJlc29sdmUoXG5cdFx0XHRcdHByb2Nlc3MuY3dkKCksXG5cdFx0XHRcdHRoaXMuZGF0YUZpbGVcblx0XHRcdClcblx0XHRcdGNvbnN0IGlzQ3VyRGlyRGF0YUZpbGUgPSB0aGlzLmZzLmV4aXN0c1N5bmMoY3VyRGlyRGF0YUZpbGVQYXRoKVxuXHRcdFx0Y29uc3QgaXNSb290RGlyRGF0YUZpbGUgPVxuXHRcdFx0XHQhaXNDdXJEaXJEYXRhRmlsZSAmJiB0aGlzLmZzLmV4aXN0c1N5bmMocm9vdERpckRhdGFGaWxlUGF0aClcblx0XHRcdGlmIChpc0N1ckRpckRhdGFGaWxlIHx8IGlzUm9vdERpckRhdGFGaWxlKSB7XG5cdFx0XHRcdGNvbnN0IGRhdFBhdGggPSBpc0N1ckRpckRhdGFGaWxlXG5cdFx0XHRcdFx0PyBjdXJEaXJEYXRhRmlsZVBhdGhcblx0XHRcdFx0XHQ6IHJvb3REaXJEYXRhRmlsZVBhdGhcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRyZXR1cm4gSlNPTi5wYXJzZSh0aGlzLmZzLnJlYWRGaWxlU3luYyhkYXRQYXRoKSlcblx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdHJldHVybiB7fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgcmV0dXJuIHt9XG5cdFx0fSBlbHNlIHJldHVybiB7fVxuXHR9XG5cblx0d3JpdGVkYXRhKCkge1xuXHRcdGlmICh0aGlzLmlzTm9kZSgpKSB7XG5cdFx0XHR0aGlzLmZzID0gdGhpcy5mcyA/IHRoaXMuZnMgOiByZXF1aXJlKCdmcycpXG5cdFx0XHR0aGlzLnBhdGggPSB0aGlzLnBhdGggPyB0aGlzLnBhdGggOiByZXF1aXJlKCdwYXRoJylcblx0XHRcdGNvbnN0IGN1ckRpckRhdGFGaWxlUGF0aCA9IHRoaXMucGF0aC5yZXNvbHZlKHRoaXMuZGF0YUZpbGUpXG5cdFx0XHRjb25zdCByb290RGlyRGF0YUZpbGVQYXRoID0gdGhpcy5wYXRoLnJlc29sdmUoXG5cdFx0XHRcdHByb2Nlc3MuY3dkKCksXG5cdFx0XHRcdHRoaXMuZGF0YUZpbGVcblx0XHRcdClcblx0XHRcdGNvbnN0IGlzQ3VyRGlyRGF0YUZpbGUgPSB0aGlzLmZzLmV4aXN0c1N5bmMoY3VyRGlyRGF0YUZpbGVQYXRoKVxuXHRcdFx0Y29uc3QgaXNSb290RGlyRGF0YUZpbGUgPVxuXHRcdFx0XHQhaXNDdXJEaXJEYXRhRmlsZSAmJiB0aGlzLmZzLmV4aXN0c1N5bmMocm9vdERpckRhdGFGaWxlUGF0aClcblx0XHRcdGNvbnN0IGpzb25kYXRhID0gSlNPTi5zdHJpbmdpZnkodGhpcy5kYXRhKVxuXHRcdFx0aWYgKGlzQ3VyRGlyRGF0YUZpbGUpIHtcblx0XHRcdFx0dGhpcy5mcy53cml0ZUZpbGVTeW5jKGN1ckRpckRhdGFGaWxlUGF0aCwganNvbmRhdGEpXG5cdFx0XHR9IGVsc2UgaWYgKGlzUm9vdERpckRhdGFGaWxlKSB7XG5cdFx0XHRcdHRoaXMuZnMud3JpdGVGaWxlU3luYyhyb290RGlyRGF0YUZpbGVQYXRoLCBqc29uZGF0YSlcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuZnMud3JpdGVGaWxlU3luYyhjdXJEaXJEYXRhRmlsZVBhdGgsIGpzb25kYXRhKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGxvZGFzaF9nZXQoc291cmNlLCBwYXRoLCBkZWZhdWx0VmFsdWUgPSB1bmRlZmluZWQpIHtcblx0XHRjb25zdCBwYXRocyA9IHBhdGgucmVwbGFjZSgvXFxbKFxcZCspXFxdL2csICcuJDEnKS5zcGxpdCgnLicpXG5cdFx0bGV0IHJlc3VsdCA9IHNvdXJjZVxuXHRcdGZvciAoY29uc3QgcCBvZiBwYXRocykge1xuXHRcdFx0cmVzdWx0ID0gT2JqZWN0KHJlc3VsdClbcF1cblx0XHRcdGlmIChyZXN1bHQgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRyZXR1cm4gZGVmYXVsdFZhbHVlXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHRcblx0fVxuXG5cdGxvZGFzaF9zZXQob2JqLCBwYXRoLCB2YWx1ZSkge1xuXHRcdGlmIChPYmplY3Qob2JqKSAhPT0gb2JqKSByZXR1cm4gb2JqXG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KHBhdGgpKSBwYXRoID0gcGF0aC50b1N0cmluZygpLm1hdGNoKC9bXi5bXFxdXSsvZykgfHwgW11cblx0XHRwYXRoXG5cdFx0XHQuc2xpY2UoMCwgLTEpXG5cdFx0XHQucmVkdWNlKFxuXHRcdFx0XHQoYSwgYywgaSkgPT5cblx0XHRcdFx0XHRPYmplY3QoYVtjXSkgPT09IGFbY11cblx0XHRcdFx0XHRcdD8gYVtjXVxuXHRcdFx0XHRcdFx0OiAoYVtjXSA9IE1hdGguYWJzKHBhdGhbaSArIDFdKSA+PiAwID09PSArcGF0aFtpICsgMV0gPyBbXSA6IHt9KSxcblx0XHRcdFx0b2JqXG5cdFx0XHQpW3BhdGhbcGF0aC5sZW5ndGggLSAxXV0gPSB2YWx1ZVxuXHRcdHJldHVybiBvYmpcblx0fVxuXG5cdGdldGRhdGEoa2V5KSB7XG5cdFx0bGV0IHZhbCA9IHRoaXMuZ2V0dmFsKGtleSlcblx0XHQvLyDlpoLmnpzku6UgQFxuXHRcdGlmICgvXkAvLnRlc3Qoa2V5KSkge1xuXHRcdFx0Y29uc3QgWywgb2Jqa2V5LCBwYXRoc10gPSAvXkAoLio/KVxcLiguKj8pJC8uZXhlYyhrZXkpXG5cdFx0XHRjb25zdCBvYmp2YWwgPSBvYmprZXkgPyB0aGlzLmdldHZhbChvYmprZXkpIDogJydcblx0XHRcdGlmIChvYmp2YWwpIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRjb25zdCBvYmplZHZhbCA9IEpTT04ucGFyc2Uob2JqdmFsKVxuXHRcdFx0XHRcdHZhbCA9IG9iamVkdmFsID8gdGhpcy5sb2Rhc2hfZ2V0KG9iamVkdmFsLCBwYXRocywgJycpIDogdmFsXG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHR2YWwgPSAnJ1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB2YWxcblx0fVxuXG5cdHNldGRhdGEodmFsLCBrZXkpIHtcblx0XHRsZXQgaXNzdWMgPSBmYWxzZVxuXHRcdGlmICgvXkAvLnRlc3Qoa2V5KSkge1xuXHRcdFx0Y29uc3QgWywgb2Jqa2V5LCBwYXRoc10gPSAvXkAoLio/KVxcLiguKj8pJC8uZXhlYyhrZXkpXG5cdFx0XHRjb25zdCBvYmpkYXQgPSB0aGlzLmdldHZhbChvYmprZXkpXG5cdFx0XHRjb25zdCBvYmp2YWwgPSBvYmprZXlcblx0XHRcdFx0PyBvYmpkYXQgPT09ICdudWxsJ1xuXHRcdFx0XHRcdD8gbnVsbFxuXHRcdFx0XHRcdDogb2JqZGF0IHx8ICd7fSdcblx0XHRcdFx0OiAne30nXG5cdFx0XHR0cnkge1xuXHRcdFx0XHRjb25zdCBvYmplZHZhbCA9IEpTT04ucGFyc2Uob2JqdmFsKVxuXHRcdFx0XHR0aGlzLmxvZGFzaF9zZXQob2JqZWR2YWwsIHBhdGhzLCB2YWwpXG5cdFx0XHRcdGlzc3VjID0gdGhpcy5zZXR2YWwoSlNPTi5zdHJpbmdpZnkob2JqZWR2YWwpLCBvYmprZXkpXG5cdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdGNvbnN0IG9iamVkdmFsID0ge31cblx0XHRcdFx0dGhpcy5sb2Rhc2hfc2V0KG9iamVkdmFsLCBwYXRocywgdmFsKVxuXHRcdFx0XHRpc3N1YyA9IHRoaXMuc2V0dmFsKEpTT04uc3RyaW5naWZ5KG9iamVkdmFsKSwgb2Jqa2V5KVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpc3N1YyA9IHRoaXMuc2V0dmFsKHZhbCwga2V5KVxuXHRcdH1cblx0XHRyZXR1cm4gaXNzdWNcblx0fVxuXG5cdGdldHZhbChrZXkpIHtcblx0XHRzd2l0Y2ggKHRoaXMuUGxhdGZvcm0oKSkge1xuXHRcdFx0Y2FzZSAnU3VyZ2UnOlxuXHRcdFx0Y2FzZSAnTG9vbic6XG5cdFx0XHRjYXNlICdTdGFzaCc6XG5cdFx0XHRjYXNlICdTaGFkb3dyb2NrZXQnOlxuXHRcdFx0XHRyZXR1cm4gJHBlcnNpc3RlbnRTdG9yZS5yZWFkKGtleSlcblx0XHRcdGNhc2UgJ1F1YW50dW11bHQgWCc6XG5cdFx0XHRcdHJldHVybiAkcHJlZnMudmFsdWVGb3JLZXkoa2V5KVxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuICh0aGlzLmRhdGEgJiYgdGhpcy5kYXRhW2tleV0pIHx8IG51bGxcblx0XHR9XG5cdH1cblxuXHRzZXR2YWwodmFsLCBrZXkpIHtcblx0XHRzd2l0Y2ggKHRoaXMuUGxhdGZvcm0oKSkge1xuXHRcdFx0Y2FzZSAnU3VyZ2UnOlxuXHRcdFx0Y2FzZSAnTG9vbic6XG5cdFx0XHRjYXNlICdTdGFzaCc6XG5cdFx0XHRjYXNlICdTaGFkb3dyb2NrZXQnOlxuXHRcdFx0XHRyZXR1cm4gJHBlcnNpc3RlbnRTdG9yZS53cml0ZSh2YWwsIGtleSlcblx0XHRcdGNhc2UgJ1F1YW50dW11bHQgWCc6XG5cdFx0XHRcdHJldHVybiAkcHJlZnMuc2V0VmFsdWVGb3JLZXkodmFsLCBrZXkpXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gKHRoaXMuZGF0YSAmJiB0aGlzLmRhdGFba2V5XSkgfHwgbnVsbFxuXHRcdH1cblx0fVxuXG5cdGluaXRHb3RFbnYob3B0cykge1xuXHRcdHRoaXMuZ290ID0gdGhpcy5nb3QgPyB0aGlzLmdvdCA6IHJlcXVpcmUoJ2dvdCcpXG5cdFx0dGhpcy5ja3RvdWdoID0gdGhpcy5ja3RvdWdoID8gdGhpcy5ja3RvdWdoIDogcmVxdWlyZSgndG91Z2gtY29va2llJylcblx0XHR0aGlzLmNramFyID0gdGhpcy5ja2phciA/IHRoaXMuY2tqYXIgOiBuZXcgdGhpcy5ja3RvdWdoLkNvb2tpZUphcigpXG5cdFx0aWYgKG9wdHMpIHtcblx0XHRcdG9wdHMuaGVhZGVycyA9IG9wdHMuaGVhZGVycyA/IG9wdHMuaGVhZGVycyA6IHt9XG5cdFx0XHRpZiAodW5kZWZpbmVkID09PSBvcHRzLmhlYWRlcnMuQ29va2llICYmIHVuZGVmaW5lZCA9PT0gb3B0cy5jb29raWVKYXIpIHtcblx0XHRcdFx0b3B0cy5jb29raWVKYXIgPSB0aGlzLmNramFyXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Z2V0KHJlcXVlc3QsIGNhbGxiYWNrID0gKCkgPT4geyB9KSB7XG5cdFx0ZGVsZXRlIHJlcXVlc3QuaGVhZGVycz8uWydDb250ZW50LUxlbmd0aCddXG5cdFx0ZGVsZXRlIHJlcXVlc3QuaGVhZGVycz8uWydjb250ZW50LWxlbmd0aCddXG5cblx0XHRzd2l0Y2ggKHRoaXMuUGxhdGZvcm0oKSkge1xuXHRcdFx0Y2FzZSAnU3VyZ2UnOlxuXHRcdFx0Y2FzZSAnTG9vbic6XG5cdFx0XHRjYXNlICdTdGFzaCc6XG5cdFx0XHRjYXNlICdTaGFkb3dyb2NrZXQnOlxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0aWYgKHRoaXMuaXNTdXJnZSgpICYmIHRoaXMuaXNOZWVkUmV3cml0ZSkge1xuXHRcdFx0XHRcdHRoaXMubG9kYXNoX3NldChyZXF1ZXN0LCAnaGVhZGVycy5YLVN1cmdlLVNraXAtU2NyaXB0aW5nJywgZmFsc2UpXG5cdFx0XHRcdH1cblx0XHRcdFx0JGh0dHBDbGllbnQuZ2V0KHJlcXVlc3QsIChlcnJvciwgcmVzcG9uc2UsIGJvZHkpID0+IHtcblx0XHRcdFx0XHRpZiAoIWVycm9yICYmIHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0XHRyZXNwb25zZS5ib2R5ID0gYm9keVxuXHRcdFx0XHRcdFx0cmVzcG9uc2Uuc3RhdHVzQ29kZSA9IHJlc3BvbnNlLnN0YXR1cyA/IHJlc3BvbnNlLnN0YXR1cyA6IHJlc3BvbnNlLnN0YXR1c0NvZGVcblx0XHRcdFx0XHRcdHJlc3BvbnNlLnN0YXR1cyA9IHJlc3BvbnNlLnN0YXR1c0NvZGVcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2FsbGJhY2soZXJyb3IsIHJlc3BvbnNlLCBib2R5KVxuXHRcdFx0XHR9KVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnUXVhbnR1bXVsdCBYJzpcblx0XHRcdFx0aWYgKHRoaXMuaXNOZWVkUmV3cml0ZSkge1xuXHRcdFx0XHRcdHRoaXMubG9kYXNoX3NldChyZXF1ZXN0LCAnb3B0cy5oaW50cycsIGZhbHNlKVxuXHRcdFx0XHR9XG5cdFx0XHRcdCR0YXNrLmZldGNoKHJlcXVlc3QpLnRoZW4oXG5cdFx0XHRcdFx0KHJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdFx0XHRjb25zdCB7XG5cdFx0XHRcdFx0XHRcdHN0YXR1c0NvZGU6IHN0YXR1cyxcblx0XHRcdFx0XHRcdFx0c3RhdHVzQ29kZSxcblx0XHRcdFx0XHRcdFx0aGVhZGVycyxcblx0XHRcdFx0XHRcdFx0Ym9keSxcblx0XHRcdFx0XHRcdFx0Ym9keUJ5dGVzXG5cdFx0XHRcdFx0XHR9ID0gcmVzcG9uc2Vcblx0XHRcdFx0XHRcdGNhbGxiYWNrKFxuXHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHR7IHN0YXR1cywgc3RhdHVzQ29kZSwgaGVhZGVycywgYm9keSwgYm9keUJ5dGVzIH0sXG5cdFx0XHRcdFx0XHRcdGJvZHksXG5cdFx0XHRcdFx0XHRcdGJvZHlCeXRlc1xuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0KGVycm9yKSA9PiBjYWxsYmFjaygoZXJyb3IgJiYgZXJyb3IuZXJyb3JvcikgfHwgJ1VuZGVmaW5lZEVycm9yJylcblx0XHRcdFx0KVxuXHRcdFx0XHRicmVha1xuXHRcdH1cblx0fVxuXG5cdHBvc3QocmVxdWVzdCwgY2FsbGJhY2sgPSAoKSA9PiB7IH0pIHtcblx0XHRjb25zdCBtZXRob2QgPSByZXF1ZXN0Lm1ldGhvZFxuXHRcdFx0PyByZXF1ZXN0Lm1ldGhvZC50b0xvY2FsZUxvd2VyQ2FzZSgpXG5cdFx0XHQ6ICdwb3N0J1xuXG5cdFx0Ly8g5aaC5p6c5oyH5a6a5LqG6K+35rGC5L2TLCDkvYbmsqHmjIflrpogYENvbnRlbnQtVHlwZWDjgIFgY29udGVudC10eXBlYCwg5YiZ6Ieq5Yqo55Sf5oiQ44CCXG5cdFx0aWYgKFxuXHRcdFx0cmVxdWVzdC5ib2R5ICYmXG5cdFx0XHRyZXF1ZXN0LmhlYWRlcnMgJiZcblx0XHRcdCFyZXF1ZXN0LmhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddICYmXG5cdFx0XHQhcmVxdWVzdC5oZWFkZXJzWydjb250ZW50LXR5cGUnXVxuXHRcdCkge1xuXHRcdFx0Ly8gSFRUUC8x44CBSFRUUC8yIOmDveaUr+aMgeWwj+WGmSBoZWFkZXJzXG5cdFx0XHRyZXF1ZXN0LmhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddID0gJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcblx0XHR9XG5cdFx0Ly8g5Li66YG/5YWN5oyH5a6a6ZSZ6K+vIGBjb250ZW50LWxlbmd0aGAg6L+Z6YeM5Yig6Zmk6K+l5bGe5oCn77yM55Sx5bel5YW356uvIChIdHRwQ2xpZW50KSDotJ/otKPph43mlrDorqHnrpflubbotYvlgLxcblx0XHRcdGRlbGV0ZSByZXF1ZXN0LmhlYWRlcnM/LlsnQ29udGVudC1MZW5ndGgnXVxuXHRcdFx0ZGVsZXRlIHJlcXVlc3QuaGVhZGVycz8uWydjb250ZW50LWxlbmd0aCddXG5cdFx0c3dpdGNoICh0aGlzLlBsYXRmb3JtKCkpIHtcblx0XHRcdGNhc2UgJ1N1cmdlJzpcblx0XHRcdGNhc2UgJ0xvb24nOlxuXHRcdFx0Y2FzZSAnU3Rhc2gnOlxuXHRcdFx0Y2FzZSAnU2hhZG93cm9ja2V0Jzpcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGlmICh0aGlzLmlzU3VyZ2UoKSAmJiB0aGlzLmlzTmVlZFJld3JpdGUpIHtcblx0XHRcdFx0XHR0aGlzLmxvZGFzaF9zZXQocmVxdWVzdCwgJ2hlYWRlcnMuWC1TdXJnZS1Ta2lwLVNjcmlwdGluZycsIGZhbHNlKVxuXHRcdFx0XHR9XG5cdFx0XHRcdCRodHRwQ2xpZW50W21ldGhvZF0ocmVxdWVzdCwgKGVycm9yLCByZXNwb25zZSwgYm9keSkgPT4ge1xuXHRcdFx0XHRcdGlmICghZXJyb3IgJiYgcmVzcG9uc2UpIHtcblx0XHRcdFx0XHRcdHJlc3BvbnNlLmJvZHkgPSBib2R5XG5cdFx0XHRcdFx0XHRyZXNwb25zZS5zdGF0dXNDb2RlID0gcmVzcG9uc2Uuc3RhdHVzID8gcmVzcG9uc2Uuc3RhdHVzIDogcmVzcG9uc2Uuc3RhdHVzQ29kZVxuXHRcdFx0XHRcdFx0cmVzcG9uc2Uuc3RhdHVzID0gcmVzcG9uc2Uuc3RhdHVzQ29kZVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYWxsYmFjayhlcnJvciwgcmVzcG9uc2UsIGJvZHkpXG5cdFx0XHRcdH0pXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdRdWFudHVtdWx0IFgnOlxuXHRcdFx0XHRyZXF1ZXN0Lm1ldGhvZCA9IG1ldGhvZFxuXHRcdFx0XHRpZiAodGhpcy5pc05lZWRSZXdyaXRlKSB7XG5cdFx0XHRcdFx0dGhpcy5sb2Rhc2hfc2V0KHJlcXVlc3QsICdvcHRzLmhpbnRzJywgZmFsc2UpXG5cdFx0XHRcdH1cblx0XHRcdFx0JHRhc2suZmV0Y2gocmVxdWVzdCkudGhlbihcblx0XHRcdFx0XHQocmVzcG9uc2UpID0+IHtcblx0XHRcdFx0XHRcdGNvbnN0IHtcblx0XHRcdFx0XHRcdFx0c3RhdHVzQ29kZTogc3RhdHVzLFxuXHRcdFx0XHRcdFx0XHRzdGF0dXNDb2RlLFxuXHRcdFx0XHRcdFx0XHRoZWFkZXJzLFxuXHRcdFx0XHRcdFx0XHRib2R5LFxuXHRcdFx0XHRcdFx0XHRib2R5Qnl0ZXNcblx0XHRcdFx0XHRcdH0gPSByZXNwb25zZVxuXHRcdFx0XHRcdFx0Y2FsbGJhY2soXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdHsgc3RhdHVzLCBzdGF0dXNDb2RlLCBoZWFkZXJzLCBib2R5LCBib2R5Qnl0ZXMgfSxcblx0XHRcdFx0XHRcdFx0Ym9keSxcblx0XHRcdFx0XHRcdFx0Ym9keUJ5dGVzXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQoZXJyb3IpID0+IGNhbGxiYWNrKChlcnJvciAmJiBlcnJvci5lcnJvcm9yKSB8fCAnVW5kZWZpbmVkRXJyb3InKVxuXHRcdFx0XHQpXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXHR9XG5cdC8qKlxuXHQgKlxuXHQgKiDnpLrkvos6JC50aW1lKCd5eXl5LU1NLWRkIHFxIEhIOm1tOnNzLlMnKVxuXHQgKiAgICA6JC50aW1lKCd5eXl5TU1kZEhIbW1zc1MnKVxuXHQgKiAgICB5OuW5tCBNOuaciCBkOuaXpSBxOuWtoyBIOuaXtiBtOuWIhiBzOuenkiBTOuavq+enklxuXHQgKiAgICDlhbbkuK155Y+v6YCJMC005L2N5Y2g5L2N56ym44CBU+WPr+mAiTAtMeS9jeWNoOS9jeespu+8jOWFtuS9meWPr+mAiTAtMuS9jeWNoOS9jeesplxuXHQgKiBAcGFyYW0ge3N0cmluZ30gZm9ybWF0IOagvOW8j+WMluWPguaVsFxuXHQgKiBAcGFyYW0ge251bWJlcn0gdHMg5Y+v6YCJOiDmoLnmja7mjIflrprml7bpl7TmiLPov5Tlm57moLzlvI/ljJbml6XmnJ9cblx0ICpcblx0ICovXG5cdHRpbWUoZm9ybWF0LCB0cyA9IG51bGwpIHtcblx0XHRjb25zdCBkYXRlID0gdHMgPyBuZXcgRGF0ZSh0cykgOiBuZXcgRGF0ZSgpXG5cdFx0bGV0IG8gPSB7XG5cdFx0XHQnTSsnOiBkYXRlLmdldE1vbnRoKCkgKyAxLFxuXHRcdFx0J2QrJzogZGF0ZS5nZXREYXRlKCksXG5cdFx0XHQnSCsnOiBkYXRlLmdldEhvdXJzKCksXG5cdFx0XHQnbSsnOiBkYXRlLmdldE1pbnV0ZXMoKSxcblx0XHRcdCdzKyc6IGRhdGUuZ2V0U2Vjb25kcygpLFxuXHRcdFx0J3ErJzogTWF0aC5mbG9vcigoZGF0ZS5nZXRNb250aCgpICsgMykgLyAzKSxcblx0XHRcdCdTJzogZGF0ZS5nZXRNaWxsaXNlY29uZHMoKVxuXHRcdH1cblx0XHRpZiAoLyh5KykvLnRlc3QoZm9ybWF0KSlcblx0XHRcdGZvcm1hdCA9IGZvcm1hdC5yZXBsYWNlKFxuXHRcdFx0XHRSZWdFeHAuJDEsXG5cdFx0XHRcdChkYXRlLmdldEZ1bGxZZWFyKCkgKyAnJykuc3Vic3RyKDQgLSBSZWdFeHAuJDEubGVuZ3RoKVxuXHRcdFx0KVxuXHRcdGZvciAobGV0IGsgaW4gbylcblx0XHRcdGlmIChuZXcgUmVnRXhwKCcoJyArIGsgKyAnKScpLnRlc3QoZm9ybWF0KSlcblx0XHRcdFx0Zm9ybWF0ID0gZm9ybWF0LnJlcGxhY2UoXG5cdFx0XHRcdFx0UmVnRXhwLiQxLFxuXHRcdFx0XHRcdFJlZ0V4cC4kMS5sZW5ndGggPT0gMVxuXHRcdFx0XHRcdFx0PyBvW2tdXG5cdFx0XHRcdFx0XHQ6ICgnMDAnICsgb1trXSkuc3Vic3RyKCgnJyArIG9ba10pLmxlbmd0aClcblx0XHRcdFx0KVxuXHRcdHJldHVybiBmb3JtYXRcblx0fVxuXG5cdC8qKlxuXHQgKiDns7vnu5/pgJrnn6Vcblx0ICpcblx0ICogPiDpgJrnn6Xlj4LmlbA6IOWQjOaXtuaUr+aMgSBRdWFuWCDlkowgTG9vbiDkuKTnp43moLzlvI8sIEVudkpz5qC55o2u6L+Q6KGM546v5aKD6Ieq5Yqo6L2s5o2iLCBTdXJnZSDnjq/looPkuI3mlK/mjIHlpJrlqpLkvZPpgJrnn6Vcblx0ICpcblx0ICog56S65L6LOlxuXHQgKiAkLm1zZyh0aXRsZSwgc3VidCwgZGVzYywgJ3R3aXR0ZXI6Ly8nKVxuXHQgKiAkLm1zZyh0aXRsZSwgc3VidCwgZGVzYywgeyAnb3Blbi11cmwnOiAndHdpdHRlcjovLycsICdtZWRpYS11cmwnOiAnaHR0cHM6Ly9naXRodWIuZ2l0aHViYXNzZXRzLmNvbS9pbWFnZXMvbW9kdWxlcy9vcGVuX2dyYXBoL2dpdGh1Yi1tYXJrLnBuZycgfSlcblx0ICogJC5tc2codGl0bGUsIHN1YnQsIGRlc2MsIHsgJ29wZW4tdXJsJzogJ2h0dHBzOi8vYmluZy5jb20nLCAnbWVkaWEtdXJsJzogJ2h0dHBzOi8vZ2l0aHViLmdpdGh1YmFzc2V0cy5jb20vaW1hZ2VzL21vZHVsZXMvb3Blbl9ncmFwaC9naXRodWItbWFyay5wbmcnIH0pXG5cdCAqXG5cdCAqIEBwYXJhbSB7Kn0gdGl0bGUg5qCH6aKYXG5cdCAqIEBwYXJhbSB7Kn0gc3VidCDlia/moIfpophcblx0ICogQHBhcmFtIHsqfSBkZXNjIOmAmuefpeivpuaDhVxuXHQgKiBAcGFyYW0geyp9IG9wdHMg6YCa55+l5Y+C5pWwXG5cdCAqXG5cdCAqL1xuXHRtc2codGl0bGUgPSBuYW1lLCBzdWJ0ID0gJycsIGRlc2MgPSAnJywgb3B0cykge1xuXHRcdGNvbnN0IHRvRW52T3B0cyA9IChyYXdvcHRzKSA9PiB7XG5cdFx0XHRzd2l0Y2ggKHR5cGVvZiByYXdvcHRzKSB7XG5cdFx0XHRcdGNhc2UgdW5kZWZpbmVkOlxuXHRcdFx0XHRcdHJldHVybiByYXdvcHRzXG5cdFx0XHRcdGNhc2UgJ3N0cmluZyc6XG5cdFx0XHRcdFx0c3dpdGNoICh0aGlzLlBsYXRmb3JtKCkpIHtcblx0XHRcdFx0XHRcdGNhc2UgJ1N1cmdlJzpcblx0XHRcdFx0XHRcdGNhc2UgJ1N0YXNoJzpcblx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdHJldHVybiB7IHVybDogcmF3b3B0cyB9XG5cdFx0XHRcdFx0XHRjYXNlICdMb29uJzpcblx0XHRcdFx0XHRcdGNhc2UgJ1NoYWRvd3JvY2tldCc6XG5cdFx0XHRcdFx0XHRcdHJldHVybiByYXdvcHRzXG5cdFx0XHRcdFx0XHRjYXNlICdRdWFudHVtdWx0IFgnOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4geyAnb3Blbi11cmwnOiByYXdvcHRzIH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgJ29iamVjdCc6XG5cdFx0XHRcdFx0c3dpdGNoICh0aGlzLlBsYXRmb3JtKCkpIHtcblx0XHRcdFx0XHRcdGNhc2UgJ1N1cmdlJzpcblx0XHRcdFx0XHRcdGNhc2UgJ1N0YXNoJzpcblx0XHRcdFx0XHRcdGNhc2UgJ1NoYWRvd3JvY2tldCc6XG5cdFx0XHRcdFx0XHRkZWZhdWx0OiB7XG5cdFx0XHRcdFx0XHRcdGxldCBvcGVuVXJsID1cblx0XHRcdFx0XHRcdFx0XHRyYXdvcHRzLnVybCB8fCByYXdvcHRzLm9wZW5VcmwgfHwgcmF3b3B0c1snb3Blbi11cmwnXVxuXHRcdFx0XHRcdFx0XHRyZXR1cm4geyB1cmw6IG9wZW5VcmwgfVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y2FzZSAnTG9vbic6IHtcblx0XHRcdFx0XHRcdFx0bGV0IG9wZW5VcmwgPVxuXHRcdFx0XHRcdFx0XHRcdHJhd29wdHMub3BlblVybCB8fCByYXdvcHRzLnVybCB8fCByYXdvcHRzWydvcGVuLXVybCddXG5cdFx0XHRcdFx0XHRcdGxldCBtZWRpYVVybCA9IHJhd29wdHMubWVkaWFVcmwgfHwgcmF3b3B0c1snbWVkaWEtdXJsJ11cblx0XHRcdFx0XHRcdFx0cmV0dXJuIHsgb3BlblVybCwgbWVkaWFVcmwgfVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y2FzZSAnUXVhbnR1bXVsdCBYJzoge1xuXHRcdFx0XHRcdFx0XHRsZXQgb3BlblVybCA9XG5cdFx0XHRcdFx0XHRcdFx0cmF3b3B0c1snb3Blbi11cmwnXSB8fCByYXdvcHRzLnVybCB8fCByYXdvcHRzLm9wZW5Vcmxcblx0XHRcdFx0XHRcdFx0bGV0IG1lZGlhVXJsID0gcmF3b3B0c1snbWVkaWEtdXJsJ10gfHwgcmF3b3B0cy5tZWRpYVVybFxuXHRcdFx0XHRcdFx0XHRsZXQgdXBkYXRlUGFzdGVib2FyZCA9XG5cdFx0XHRcdFx0XHRcdFx0cmF3b3B0c1sndXBkYXRlLXBhc3RlYm9hcmQnXSB8fCByYXdvcHRzLnVwZGF0ZVBhc3RlYm9hcmRcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHQnb3Blbi11cmwnOiBvcGVuVXJsLFxuXHRcdFx0XHRcdFx0XHRcdCdtZWRpYS11cmwnOiBtZWRpYVVybCxcblx0XHRcdFx0XHRcdFx0XHQndXBkYXRlLXBhc3RlYm9hcmQnOiB1cGRhdGVQYXN0ZWJvYXJkXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZFxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoIXRoaXMuaXNNdXRlKSB7XG5cdFx0XHRzd2l0Y2ggKHRoaXMuUGxhdGZvcm0oKSkge1xuXHRcdFx0XHRjYXNlICdTdXJnZSc6XG5cdFx0XHRcdGNhc2UgJ0xvb24nOlxuXHRcdFx0XHRjYXNlICdTdGFzaCc6XG5cdFx0XHRcdGNhc2UgJ1NoYWRvd3JvY2tldCc6XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0JG5vdGlmaWNhdGlvbi5wb3N0KHRpdGxlLCBzdWJ0LCBkZXNjLCB0b0Vudk9wdHMob3B0cykpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSAnUXVhbnR1bXVsdCBYJzpcblx0XHRcdFx0XHQkbm90aWZ5KHRpdGxlLCBzdWJ0LCBkZXNjLCB0b0Vudk9wdHMob3B0cykpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKCF0aGlzLmlzTXV0ZUxvZykge1xuXHRcdFx0bGV0IGxvZ3MgPSBbJycsICc9PT09PT09PT09PT09PfCfk6Pns7vnu5/pgJrnn6Xwn5OjPT09PT09PT09PT09PT0nXVxuXHRcdFx0bG9ncy5wdXNoKHRpdGxlKVxuXHRcdFx0c3VidCA/IGxvZ3MucHVzaChzdWJ0KSA6ICcnXG5cdFx0XHRkZXNjID8gbG9ncy5wdXNoKGRlc2MpIDogJydcblx0XHRcdGNvbnNvbGUubG9nKGxvZ3Muam9pbignXFxuJykpXG5cdFx0XHR0aGlzLmxvZ3MgPSB0aGlzLmxvZ3MuY29uY2F0KGxvZ3MpXG5cdFx0fVxuXHR9XG5cblx0bG9nKC4uLmxvZ3MpIHtcblx0XHRpZiAobG9ncy5sZW5ndGggPiAwKSB7XG5cdFx0XHR0aGlzLmxvZ3MgPSBbLi4udGhpcy5sb2dzLCAuLi5sb2dzXVxuXHRcdH1cblx0XHRjb25zb2xlLmxvZyhsb2dzLmpvaW4odGhpcy5sb2dTZXBhcmF0b3IpKVxuXHR9XG5cblx0bG9nRXJyKGVycm9yKSB7XG5cdFx0c3dpdGNoICh0aGlzLlBsYXRmb3JtKCkpIHtcblx0XHRcdGNhc2UgJ1N1cmdlJzpcblx0XHRcdGNhc2UgJ0xvb24nOlxuXHRcdFx0Y2FzZSAnU3Rhc2gnOlxuXHRcdFx0Y2FzZSAnU2hhZG93cm9ja2V0Jzpcblx0XHRcdGNhc2UgJ1F1YW50dW11bHQgWCc6XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0aGlzLmxvZygnJywgYOKdl++4jyAke3RoaXMubmFtZX0sIOmUmeivryFgLCBlcnJvcilcblx0XHRcdFx0YnJlYWtcblx0XHR9XG5cdH1cblxuXHR3YWl0KHRpbWUpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgdGltZSkpXG5cdH1cblxuXHRkb25lKHZhbCA9IHt9KSB7XG5cdFx0Y29uc3QgZW5kVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG5cdFx0Y29uc3QgY29zdFRpbWUgPSAoZW5kVGltZSAtIHRoaXMuc3RhcnRUaW1lKSAvIDEwMDBcblx0XHR0aGlzLmxvZygnJywgYPCfmqkgJHt0aGlzLm5hbWV9LCDnu5PmnZ8hIPCflZsgJHtjb3N0VGltZX0g56eSYClcblx0XHR0aGlzLmxvZygpXG5cdFx0c3dpdGNoICh0aGlzLlBsYXRmb3JtKCkpIHtcblx0XHRcdGNhc2UgJ1N1cmdlJzpcblx0XHRcdGNhc2UgJ0xvb24nOlxuXHRcdFx0Y2FzZSAnU3Rhc2gnOlxuXHRcdFx0Y2FzZSAnU2hhZG93cm9ja2V0Jzpcblx0XHRcdGNhc2UgJ1F1YW50dW11bHQgWCc6XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQkZG9uZSh2YWwpXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEdldCBFbnZpcm9ubWVudCBWYXJpYWJsZXNcblx0ICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1ZpcmdpbENseW5lL0dldFNvbWVGcmllcy9ibG9iL21haW4vZnVuY3Rpb24vZ2V0RU5WL2dldEVOVi5qc1xuXHQgKiBAYXV0aG9yIFZpcmdpbENseW5lXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBrZXkgLSBQZXJzaXN0ZW50IFN0b3JlIEtleVxuXHQgKiBAcGFyYW0ge0FycmF5fSBuYW1lcyAtIFBsYXRmb3JtIE5hbWVzXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhYmFzZSAtIERlZmF1bHQgRGF0YWJhc2Vcblx0ICogQHJldHVybiB7T2JqZWN0fSB7IFNldHRpbmdzLCBDYWNoZXMsIENvbmZpZ3MgfVxuXHQgKi9cblx0Z2V0RU5WKGtleSwgbmFtZXMsIGRhdGFiYXNlKSB7XG5cdFx0Ly90aGlzLmxvZyhg4piR77iPICR7dGhpcy5uYW1lfSwgR2V0IEVudmlyb25tZW50IFZhcmlhYmxlc2AsIFwiXCIpO1xuXHRcdC8qKioqKioqKioqKioqKioqKiBCb3hKcyAqKioqKioqKioqKioqKioqKi9cblx0XHQvLyDljIXoo4XkuLrlsYDpg6jlj5jph4/vvIznlKjlrozph4rmlL7lhoXlrZhcblx0XHQvLyBCb3hKc+eahOa4heepuuaTjeS9nOi/lOWbnuWBh+WAvOepuuWtl+espuS4siwg6YC76L6R5oiW5pON5L2c56ym5Lya5Zyo5bem5L6n5pON5L2c5pWw5Li65YGH5YC85pe26L+U5Zue5Y+z5L6n5pON5L2c5pWw44CCXG5cdFx0bGV0IEJveEpzID0gdGhpcy5nZXRqc29uKGtleSwgZGF0YWJhc2UpO1xuXHRcdC8vdGhpcy5sb2coYPCfmqcgJHt0aGlzLm5hbWV9LCBHZXQgRW52aXJvbm1lbnQgVmFyaWFibGVzYCwgYEJveEpz57G75Z6LOiAke3R5cGVvZiBCb3hKc31gLCBgQm94SnPlhoXlrrk6ICR7SlNPTi5zdHJpbmdpZnkoQm94SnMpfWAsIFwiXCIpO1xuXHRcdC8qKioqKioqKioqKioqKioqKiBBcmd1bWVudCAqKioqKioqKioqKioqKioqKi9cblx0XHRsZXQgQXJndW1lbnQgPSB7fTtcblx0XHRpZiAodHlwZW9mICRhcmd1bWVudCAhPT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdFx0aWYgKEJvb2xlYW4oJGFyZ3VtZW50KSkge1xuXHRcdFx0XHQvL3RoaXMubG9nKGDwn46JICR7dGhpcy5uYW1lfSwgJEFyZ3VtZW50YCk7XG5cdFx0XHRcdGxldCBhcmcgPSBPYmplY3QuZnJvbUVudHJpZXMoJGFyZ3VtZW50LnNwbGl0KFwiJlwiKS5tYXAoKGl0ZW0pID0+IGl0ZW0uc3BsaXQoXCI9XCIpLm1hcChpID0+IGkucmVwbGFjZSgvXFxcIi9nLCAnJykpKSk7XG5cdFx0XHRcdC8vdGhpcy5sb2coSlNPTi5zdHJpbmdpZnkoYXJnKSk7XG5cdFx0XHRcdGZvciAobGV0IGl0ZW0gaW4gYXJnKSB0aGlzLnNldFBhdGgoQXJndW1lbnQsIGl0ZW0sIGFyZ1tpdGVtXSk7XG5cdFx0XHRcdC8vdGhpcy5sb2coSlNPTi5zdHJpbmdpZnkoQXJndW1lbnQpKTtcblx0XHRcdH07XG5cdFx0XHQvL3RoaXMubG9nKGDinIUgJHt0aGlzLm5hbWV9LCBHZXQgRW52aXJvbm1lbnQgVmFyaWFibGVzYCwgYEFyZ3VtZW5057G75Z6LOiAke3R5cGVvZiBBcmd1bWVudH1gLCBgQXJndW1lbnTlhoXlrrk6ICR7SlNPTi5zdHJpbmdpZnkoQXJndW1lbnQpfWAsIFwiXCIpO1xuXHRcdH07XG5cdFx0LyoqKioqKioqKioqKioqKioqIFN0b3JlICoqKioqKioqKioqKioqKioqL1xuXHRcdGNvbnN0IFN0b3JlID0geyBTZXR0aW5nczogZGF0YWJhc2U/LkRlZmF1bHQ/LlNldHRpbmdzIHx8IHt9LCBDb25maWdzOiBkYXRhYmFzZT8uRGVmYXVsdD8uQ29uZmlncyB8fCB7fSwgQ2FjaGVzOiB7fSB9O1xuXHRcdGlmICghQXJyYXkuaXNBcnJheShuYW1lcykpIG5hbWVzID0gW25hbWVzXTtcblx0XHQvL3RoaXMubG9nKGDwn5qnICR7dGhpcy5uYW1lfSwgR2V0IEVudmlyb25tZW50IFZhcmlhYmxlc2AsIGBuYW1lc+exu+WeizogJHt0eXBlb2YgbmFtZXN9YCwgYG5hbWVz5YaF5a65OiAke0pTT04uc3RyaW5naWZ5KG5hbWVzKX1gLCBcIlwiKTtcblx0XHRmb3IgKGxldCBuYW1lIG9mIG5hbWVzKSB7XG5cdFx0XHRTdG9yZS5TZXR0aW5ncyA9IHsgLi4uU3RvcmUuU2V0dGluZ3MsIC4uLmRhdGFiYXNlPy5bbmFtZV0/LlNldHRpbmdzLCAuLi5Bcmd1bWVudCwgLi4uQm94SnM/LltuYW1lXT8uU2V0dGluZ3MgfTtcblx0XHRcdFN0b3JlLkNvbmZpZ3MgPSB7IC4uLlN0b3JlLkNvbmZpZ3MsIC4uLmRhdGFiYXNlPy5bbmFtZV0/LkNvbmZpZ3MgfTtcblx0XHRcdGlmIChCb3hKcz8uW25hbWVdPy5DYWNoZXMgJiYgdHlwZW9mIEJveEpzPy5bbmFtZV0/LkNhY2hlcyA9PT0gXCJzdHJpbmdcIikgQm94SnNbbmFtZV0uQ2FjaGVzID0gSlNPTi5wYXJzZShCb3hKcz8uW25hbWVdPy5DYWNoZXMpO1xuXHRcdFx0U3RvcmUuQ2FjaGVzID0geyAuLi5TdG9yZS5DYWNoZXMsIC4uLkJveEpzPy5bbmFtZV0/LkNhY2hlcyB9O1xuXHRcdH07XG5cdFx0Ly90aGlzLmxvZyhg8J+apyAke3RoaXMubmFtZX0sIEdldCBFbnZpcm9ubWVudCBWYXJpYWJsZXNgLCBgU3RvcmUuU2V0dGluZ3Pnsbvlnos6ICR7dHlwZW9mIFN0b3JlLlNldHRpbmdzfWAsIGBTdG9yZS5TZXR0aW5nczogJHtKU09OLnN0cmluZ2lmeShTdG9yZS5TZXR0aW5ncyl9YCwgXCJcIik7XG5cdFx0dGhpcy50cmF2ZXJzZU9iamVjdChTdG9yZS5TZXR0aW5ncywgKGtleSwgdmFsdWUpID0+IHtcblx0XHRcdC8vdGhpcy5sb2coYPCfmqcgJHt0aGlzLm5hbWV9LCB0cmF2ZXJzZU9iamVjdGAsIGAke2tleX06ICR7dHlwZW9mIHZhbHVlfWAsIGAke2tleX06ICR7SlNPTi5zdHJpbmdpZnkodmFsdWUpfWAsIFwiXCIpO1xuXHRcdFx0aWYgKHZhbHVlID09PSBcInRydWVcIiB8fCB2YWx1ZSA9PT0gXCJmYWxzZVwiKSB2YWx1ZSA9IEpTT04ucGFyc2UodmFsdWUpOyAvLyDlrZfnrKbkuLLovaxCb29sZWFuXG5cdFx0XHRlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0aWYgKHZhbHVlLmluY2x1ZGVzKFwiLFwiKSkgdmFsdWUgPSB2YWx1ZS5zcGxpdChcIixcIikubWFwKGl0ZW0gPT4gdGhpcy5zdHJpbmcybnVtYmVyKGl0ZW0pKTsgLy8g5a2X56ym5Liy6L2s5pWw57uE6L2s5pWw5a2XXG5cdFx0XHRcdGVsc2UgdmFsdWUgPSB0aGlzLnN0cmluZzJudW1iZXIodmFsdWUpOyAvLyDlrZfnrKbkuLLovazmlbDlrZdcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0fSk7XG5cdFx0Ly90aGlzLmxvZyhg4pyFICR7dGhpcy5uYW1lfSwgR2V0IEVudmlyb25tZW50IFZhcmlhYmxlc2AsIGBTdG9yZTogJHt0eXBlb2YgU3RvcmUuQ2FjaGVzfWAsIGBTdG9yZeWGheWuuTogJHtKU09OLnN0cmluZ2lmeShTdG9yZSl9YCwgXCJcIik7XG5cdFx0cmV0dXJuIFN0b3JlO1xuXHR9O1xuXG5cdC8qKioqKioqKioqKioqKioqKiBmdW5jdGlvbiAqKioqKioqKioqKioqKioqKi9cblx0c2V0UGF0aChvYmplY3QsIHBhdGgsIHZhbHVlKSB7IHBhdGguc3BsaXQoXCIuXCIpLnJlZHVjZSgobywgcCwgaSkgPT4gb1twXSA9IHBhdGguc3BsaXQoXCIuXCIpLmxlbmd0aCA9PT0gKytpID8gdmFsdWUgOiBvW3BdIHx8IHt9LCBvYmplY3QpIH1cblx0dHJhdmVyc2VPYmplY3QobywgYykgeyBmb3IgKHZhciB0IGluIG8pIHsgdmFyIG4gPSBvW3RdOyBvW3RdID0gXCJvYmplY3RcIiA9PSB0eXBlb2YgbiAmJiBudWxsICE9PSBuID8gdGhpcy50cmF2ZXJzZU9iamVjdChuLCBjKSA6IGModCwgbikgfSByZXR1cm4gbyB9XG5cdHN0cmluZzJudW1iZXIoc3RyaW5nKSB7IGlmIChzdHJpbmcgJiYgIWlzTmFOKHN0cmluZykpIHN0cmluZyA9IHBhcnNlSW50KHN0cmluZywgMTApOyByZXR1cm4gc3RyaW5nIH1cbn1cblxuZXhwb3J0IGNsYXNzIEh0dHAge1xuXHRjb25zdHJ1Y3RvcihlbnYpIHtcblx0XHR0aGlzLmVudiA9IGVudlxuXHR9XG5cblx0c2VuZChvcHRzLCBtZXRob2QgPSAnR0VUJykge1xuXHRcdG9wdHMgPSB0eXBlb2Ygb3B0cyA9PT0gJ3N0cmluZycgPyB7IHVybDogb3B0cyB9IDogb3B0c1xuXHRcdGxldCBzZW5kZXIgPSB0aGlzLmdldFxuXHRcdGlmIChtZXRob2QgPT09ICdQT1NUJykge1xuXHRcdFx0c2VuZGVyID0gdGhpcy5wb3N0XG5cdFx0fVxuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRzZW5kZXIuY2FsbCh0aGlzLCBvcHRzLCAoZXJyb3IsIHJlc3BvbnNlLCBib2R5KSA9PiB7XG5cdFx0XHRcdGlmIChlcnJvcikgcmVqZWN0KGVycm9yKVxuXHRcdFx0XHRlbHNlIHJlc29sdmUocmVzcG9uc2UpXG5cdFx0XHR9KVxuXHRcdH0pXG5cdH1cblxuXHRnZXQob3B0cykge1xuXHRcdHJldHVybiB0aGlzLnNlbmQuY2FsbCh0aGlzLmVudiwgb3B0cylcblx0fVxuXG5cdHBvc3Qob3B0cykge1xuXHRcdHJldHVybiB0aGlzLnNlbmQuY2FsbCh0aGlzLmVudiwgb3B0cywgJ1BPU1QnKVxuXHR9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBVUkkge1xuXHRjb25zdHJ1Y3RvcihvcHRzID0gW10pIHtcblx0XHR0aGlzLm5hbWUgPSBcIlVSSSB2MS4yLjZcIjtcblx0XHR0aGlzLm9wdHMgPSBvcHRzO1xuXHRcdHRoaXMuanNvbiA9IHsgc2NoZW1lOiBcIlwiLCBob3N0OiBcIlwiLCBwYXRoOiBcIlwiLCBxdWVyeToge30gfTtcblx0fTtcblxuXHRwYXJzZSh1cmwpIHtcblx0XHRjb25zdCBVUkxSZWdleCA9IC8oPzooPzxzY2hlbWU+LispOlxcL1xcLyg/PGhvc3Q+W14vXSspKT9cXC8/KD88cGF0aD5bXj9dKyk/XFw/Pyg/PHF1ZXJ5PlteP10rKT8vO1xuXHRcdGxldCBqc29uID0gdXJsLm1hdGNoKFVSTFJlZ2V4KT8uZ3JvdXBzID8/IG51bGw7XG5cdFx0aWYgKGpzb24/LnBhdGgpIGpzb24ucGF0aHMgPSBqc29uLnBhdGguc3BsaXQoXCIvXCIpOyBlbHNlIGpzb24ucGF0aCA9IFwiXCI7XG5cdFx0Ly9pZiAoanNvbj8ucGF0aHM/LmF0KC0xKT8uaW5jbHVkZXMoXCIuXCIpKSBqc29uLmZvcm1hdCA9IGpzb24ucGF0aHMuYXQoLTEpLnNwbGl0KFwiLlwiKS5hdCgtMSk7XG5cdFx0aWYgKGpzb24/LnBhdGhzKSB7XG5cdFx0XHRjb25zdCBmaWxlTmFtZSA9IGpzb24ucGF0aHNbanNvbi5wYXRocy5sZW5ndGggLSAxXTtcblx0XHRcdGlmIChmaWxlTmFtZT8uaW5jbHVkZXMoXCIuXCIpKSB7XG5cdFx0XHRcdGNvbnN0IGxpc3QgPSBmaWxlTmFtZS5zcGxpdChcIi5cIik7XG5cdFx0XHRcdGpzb24uZm9ybWF0ID0gbGlzdFtsaXN0Lmxlbmd0aCAtIDFdO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoanNvbj8ucXVlcnkpIGpzb24ucXVlcnkgPSBPYmplY3QuZnJvbUVudHJpZXMoanNvbi5xdWVyeS5zcGxpdChcIiZcIikubWFwKChwYXJhbSkgPT4gcGFyYW0uc3BsaXQoXCI9XCIpKSk7XG5cdFx0cmV0dXJuIGpzb25cblx0fTtcblxuXHRzdHJpbmdpZnkoanNvbiA9IHRoaXMuanNvbikge1xuXHRcdGxldCB1cmwgPSBcIlwiO1xuXHRcdGlmIChqc29uPy5zY2hlbWUgJiYganNvbj8uaG9zdCkgdXJsICs9IGpzb24uc2NoZW1lICsgXCI6Ly9cIiArIGpzb24uaG9zdDtcblx0XHRpZiAoanNvbj8ucGF0aCkgdXJsICs9IChqc29uPy5ob3N0KSA/IFwiL1wiICsganNvbi5wYXRoIDoganNvbi5wYXRoO1xuXHRcdGlmIChqc29uPy5xdWVyeSkgdXJsICs9IFwiP1wiICsgT2JqZWN0LmVudHJpZXMoanNvbi5xdWVyeSkubWFwKHBhcmFtID0+IHBhcmFtLmpvaW4oXCI9XCIpKS5qb2luKFwiJlwiKTtcblx0XHRyZXR1cm4gdXJsXG5cdH07XG59XG4iLCIvLyByZWZlcjogaHR0cHM6Ly9naXRodWIuY29tL1BlbmctWU0vUXVhblgvYmxvYi9tYXN0ZXIvVG9vbHMvWE1MUGFyc2VyL3htbC1wYXJzZXIuanNcbi8vIHJlZmVyOiBodHRwczovL2dvZXNzbmVyLm5ldC9kb3dubG9hZC9wcmovanNvbnhtbC9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFhNTCB7XG5cdCNBVFRSSUJVVEVfS0VZID0gXCJAXCI7XG5cdCNDSElMRF9OT0RFX0tFWSA9IFwiI1wiO1xuXHQjVU5FU0NBUEUgPSB7XG5cdFx0XCImYW1wO1wiOiBcIiZcIixcblx0XHRcIiZsdDtcIjogXCI8XCIsXG5cdFx0XCImZ3Q7XCI6IFwiPlwiLFxuXHRcdFwiJmFwb3M7XCI6IFwiJ1wiLFxuXHRcdFwiJnF1b3Q7XCI6ICdcIidcblx0fTtcblx0I0VTQ0FQRSA9IHtcblx0XHRcIiZcIjogXCImYW1wO1wiLFxuXHRcdFwiPFwiOiBcIiZsdDtcIixcblx0XHRcIj5cIjogXCImZ3Q7XCIsXG5cdFx0XCInXCI6IFwiJmFwb3M7XCIsXG5cdFx0J1wiJzogXCImcXVvdDtcIlxuXHR9O1xuXG5cdGNvbnN0cnVjdG9yKG9wdHMpIHtcblx0XHR0aGlzLm5hbWUgPSBcIlhNTCB2MC40LjAtMlwiO1xuXHRcdHRoaXMub3B0cyA9IG9wdHM7XG5cdFx0QmlnSW50LnByb3RvdHlwZS50b0pTT04gPSAoKSA9PiB0aGlzLnRvU3RyaW5nKCk7XG5cdH07XG5cblx0cGFyc2UoeG1sID0gbmV3IFN0cmluZywgcmV2aXZlciA9IFwiXCIpIHtcblx0XHRjb25zdCBVTkVTQ0FQRSA9IHRoaXMuI1VORVNDQVBFO1xuXHRcdGNvbnN0IEFUVFJJQlVURV9LRVkgPSB0aGlzLiNBVFRSSUJVVEVfS0VZO1xuXHRcdGNvbnN0IENISUxEX05PREVfS0VZID0gdGhpcy4jQ0hJTERfTk9ERV9LRVk7XG5cdFx0Y29uc3QgRE9NID0gdG9ET00oeG1sKTtcblx0XHRsZXQganNvbiA9IGZyb21YTUwoRE9NLCByZXZpdmVyKTtcblx0XHRyZXR1cm4ganNvbjtcblxuXHRcdC8qKioqKioqKioqKioqKioqKiBGdWN0aW9ucyAqKioqKioqKioqKioqKioqKi9cblx0XHRmdW5jdGlvbiB0b0RPTSh0ZXh0KSB7XG5cdFx0XHRjb25zdCBsaXN0ID0gdGV4dC5yZXBsYWNlKC9eWyBcXHRdKy9nbSwgXCJcIilcblx0XHRcdFx0LnNwbGl0KC88KFteITw+P10oPzonW1xcU1xcc10qPyd8XCJbXFxTXFxzXSo/XCJ8W14nXCI8Pl0pKnwhKD86LS1bXFxTXFxzXSo/LS18XFxbW15cXFtcXF0nXCI8Pl0rXFxbW1xcU1xcc10qP11dfERPQ1RZUEVbXlxcWzw+XSo/XFxbW1xcU1xcc10qP118KD86RU5USVRZW15cIjw+XSo/XCJbXFxTXFxzXSo/XCIpP1tcXFNcXHNdKj8pfFxcP1tcXFNcXHNdKj9cXD8pPi8pO1xuXHRcdFx0Y29uc3QgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG5cblx0XHRcdC8vIHJvb3QgZWxlbWVudFxuXHRcdFx0Y29uc3Qgcm9vdCA9IHsgY2hpbGRyZW46IFtdIH07XG5cdFx0XHRsZXQgZWxlbSA9IHJvb3Q7XG5cblx0XHRcdC8vIGRvbSB0cmVlIHN0YWNrXG5cdFx0XHRjb25zdCBzdGFjayA9IFtdO1xuXG5cdFx0XHQvLyBwYXJzZVxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7KSB7XG5cdFx0XHRcdC8vIHRleHQgbm9kZVxuXHRcdFx0XHRjb25zdCBzdHIgPSBsaXN0W2krK107XG5cdFx0XHRcdGlmIChzdHIpIGFwcGVuZFRleHQoc3RyKTtcblxuXHRcdFx0XHQvLyBjaGlsZCBub2RlXG5cdFx0XHRcdGNvbnN0IHRhZyA9IGxpc3RbaSsrXTtcblx0XHRcdFx0aWYgKHRhZykgcGFyc2VOb2RlKHRhZyk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcm9vdDtcblx0XHRcdC8qKioqKioqKioqKioqKioqKiBGdWN0aW9ucyAqKioqKioqKioqKioqKioqKi9cblx0XHRcdGZ1bmN0aW9uIHBhcnNlTm9kZSh0YWcpIHtcblx0XHRcdFx0Y29uc3QgdGFncyA9IHRhZy5zcGxpdChcIiBcIik7XG5cdFx0XHRcdGNvbnN0IG5hbWUgPSB0YWdzLnNoaWZ0KCk7XG5cdFx0XHRcdGNvbnN0IGxlbmd0aCA9IHRhZ3MubGVuZ3RoO1xuXHRcdFx0XHRsZXQgY2hpbGQgPSB7fTtcblx0XHRcdFx0c3dpdGNoIChuYW1lWzBdKSB7XG5cdFx0XHRcdFx0Y2FzZSBcIi9cIjpcblx0XHRcdFx0XHRcdC8vIGNsb3NlIHRhZ1xuXHRcdFx0XHRcdFx0Y29uc3QgY2xvc2VkID0gdGFnLnJlcGxhY2UoL15cXC98W1xcc1xcL10uKiQvZywgXCJcIikudG9Mb3dlckNhc2UoKTtcblx0XHRcdFx0XHRcdHdoaWxlIChzdGFjay5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgdGFnTmFtZSA9IGVsZW0/Lm5hbWU/LnRvTG93ZXJDYXNlPy4oKTtcblx0XHRcdFx0XHRcdFx0ZWxlbSA9IHN0YWNrLnBvcCgpO1xuXHRcdFx0XHRcdFx0XHRpZiAodGFnTmFtZSA9PT0gY2xvc2VkKSBicmVhaztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgXCI/XCI6XG5cdFx0XHRcdFx0XHQvLyBYTUwgZGVjbGFyYXRpb25cblx0XHRcdFx0XHRcdGNoaWxkLm5hbWUgPSBuYW1lO1xuXHRcdFx0XHRcdFx0Y2hpbGQucmF3ID0gdGFncy5qb2luKFwiIFwiKTtcblx0XHRcdFx0XHRcdGFwcGVuZENoaWxkKGNoaWxkKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgXCIhXCI6XG5cdFx0XHRcdFx0XHRpZiAoLyFcXFtDREFUQVxcWyguKylcXF1cXF0vLnRlc3QodGFnKSkge1xuXHRcdFx0XHRcdFx0XHQvLyBDREFUQSBzZWN0aW9uXG5cdFx0XHRcdFx0XHRcdGNoaWxkLm5hbWUgPSBcIiFDREFUQVwiO1xuXHRcdFx0XHRcdFx0XHQvL2NoaWxkLnJhdyA9IHRhZy5zbGljZSg5LCAtMik7XG5cdFx0XHRcdFx0XHRcdGNoaWxkLnJhdyA9IHRhZy5tYXRjaCgvIVxcW0NEQVRBXFxbKC4rKVxcXVxcXS8pO1xuXHRcdFx0XHRcdFx0XHQvL2FwcGVuZFRleHQodGFnLnNsaWNlKDksIC0yKSk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHQvLyBDb21tZW50IHNlY3Rpb25cblx0XHRcdFx0XHRcdFx0Y2hpbGQubmFtZSA9IG5hbWU7XG5cdFx0XHRcdFx0XHRcdGNoaWxkLnJhdyA9IHRhZ3Muam9pbihcIiBcIik7XG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0YXBwZW5kQ2hpbGQoY2hpbGQpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdGNoaWxkID0gb3BlblRhZyh0YWcpO1xuXHRcdFx0XHRcdFx0YXBwZW5kQ2hpbGQoY2hpbGQpO1xuXHRcdFx0XHRcdFx0c3dpdGNoICgodGFncz8uW2xlbmd0aCAtIDFdID8/IG5hbWUpLnNsaWNlKC0xKSkge1xuXHRcdFx0XHRcdFx0XHRjYXNlIFwiL1wiOlxuXHRcdFx0XHRcdFx0XHRcdC8vY2hpbGQuaGFzQ2hpbGQgPSBmYWxzZTsgLy8gZW1wdHlUYWdcblx0XHRcdFx0XHRcdFx0XHRkZWxldGUgY2hpbGQuY2hpbGRyZW47IC8vIGVtcHR5VGFnXG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0c3dpdGNoIChuYW1lKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwibGlua1wiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQvL2NoaWxkLmhhc0NoaWxkID0gZmFsc2U7IC8vIGVtcHR5VGFnXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGRlbGV0ZSBjaGlsZC5jaGlsZHJlbjsgLy8gZW1wdHlUYWdcblx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRzdGFjay5wdXNoKGVsZW0pOyAvLyBvcGVuVGFnXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGVsZW0gPSBjaGlsZDtcblx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRmdW5jdGlvbiBvcGVuVGFnKHRhZykge1xuXHRcdFx0XHRcdGNvbnN0IGVsZW0gPSB7IGNoaWxkcmVuOiBbXSB9O1xuXHRcdFx0XHRcdHRhZyA9IHRhZy5yZXBsYWNlKC9cXHMqXFwvPyQvLCBcIlwiKTtcblx0XHRcdFx0XHRjb25zdCBwb3MgPSB0YWcuc2VhcmNoKC9bXFxzPSdcIlxcL10vKTtcblx0XHRcdFx0XHRpZiAocG9zIDwgMCkge1xuXHRcdFx0XHRcdFx0ZWxlbS5uYW1lID0gdGFnO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRlbGVtLm5hbWUgPSB0YWcuc3Vic3RyKDAsIHBvcyk7XG5cdFx0XHRcdFx0XHRlbGVtLnRhZyA9IHRhZy5zdWJzdHIocG9zKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIGVsZW07XG5cdFx0XHRcdH07XG5cdFx0XHR9O1xuXG5cdFx0XHRmdW5jdGlvbiBhcHBlbmRUZXh0KHN0cikge1xuXHRcdFx0XHQvL3N0ciA9IHJlbW92ZVNwYWNlcyhzdHIpO1xuXHRcdFx0XHRzdHIgPSByZW1vdmVCcmVha0xpbmUoc3RyKTtcblx0XHRcdFx0Ly9zdHIgPSBzdHI/LnRyaW0/LigpO1xuXHRcdFx0XHRpZiAoc3RyKSBhcHBlbmRDaGlsZCh1bmVzY2FwZVhNTChzdHIpKTtcblxuXHRcdFx0XHRmdW5jdGlvbiByZW1vdmVCcmVha0xpbmUoc3RyKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHN0cj8ucmVwbGFjZT8uKC9eKFxcclxcbnxcXHJ8XFxufFxcdCkrfChcXHJcXG58XFxyfFxcbnxcXHQpKyQvZywgXCJcIik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gYXBwZW5kQ2hpbGQoY2hpbGQpIHtcblx0XHRcdFx0ZWxlbS5jaGlsZHJlbi5wdXNoKGNoaWxkKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdC8qKioqKioqKioqKioqKioqKiBGdWN0aW9ucyAqKioqKioqKioqKioqKioqKi9cblx0XHRmdW5jdGlvbiBmcm9tUGxpc3QoZWxlbSwgcmV2aXZlcikge1xuXHRcdFx0bGV0IG9iamVjdDtcblx0XHRcdHN3aXRjaCAodHlwZW9mIGVsZW0pIHtcblx0XHRcdFx0Y2FzZSBcInN0cmluZ1wiOlxuXHRcdFx0XHRjYXNlIFwidW5kZWZpbmVkXCI6XG5cdFx0XHRcdFx0b2JqZWN0ID0gZWxlbTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcIm9iamVjdFwiOlxuXHRcdFx0XHRcdC8vZGVmYXVsdDpcblx0XHRcdFx0XHRjb25zdCBuYW1lID0gZWxlbS5uYW1lO1xuXHRcdFx0XHRcdGNvbnN0IGNoaWxkcmVuID0gZWxlbS5jaGlsZHJlbjtcblxuXHRcdFx0XHRcdG9iamVjdCA9IHt9O1xuXG5cdFx0XHRcdFx0c3dpdGNoIChuYW1lKSB7XG5cdFx0XHRcdFx0XHRjYXNlIFwicGxpc3RcIjpcblx0XHRcdFx0XHRcdFx0bGV0IHBsaXN0ID0gZnJvbVBsaXN0KGNoaWxkcmVuWzBdLCByZXZpdmVyKTtcblx0XHRcdFx0XHRcdFx0b2JqZWN0ID0gT2JqZWN0LmFzc2lnbihvYmplY3QsIHBsaXN0KVxuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgXCJkaWN0XCI6XG5cdFx0XHRcdFx0XHRcdGxldCBkaWN0ID0gY2hpbGRyZW4ubWFwKGNoaWxkID0+IGZyb21QbGlzdChjaGlsZCwgcmV2aXZlcikpO1xuXHRcdFx0XHRcdFx0XHRkaWN0ID0gY2h1bmsoZGljdCwgMik7XG5cdFx0XHRcdFx0XHRcdG9iamVjdCA9IE9iamVjdC5mcm9tRW50cmllcyhkaWN0KTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIFwiYXJyYXlcIjpcblx0XHRcdFx0XHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KG9iamVjdCkpIG9iamVjdCA9IFtdO1xuXHRcdFx0XHRcdFx0XHRvYmplY3QgPSBjaGlsZHJlbi5tYXAoY2hpbGQgPT4gZnJvbVBsaXN0KGNoaWxkLCByZXZpdmVyKSk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSBcImtleVwiOlxuXHRcdFx0XHRcdFx0XHRjb25zdCBrZXkgPSBjaGlsZHJlblswXTtcblx0XHRcdFx0XHRcdFx0b2JqZWN0ID0ga2V5O1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgXCJ0cnVlXCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiZmFsc2VcIjpcblx0XHRcdFx0XHRcdFx0Y29uc3QgYm9vbGVhbiA9IG5hbWU7XG5cdFx0XHRcdFx0XHRcdG9iamVjdCA9IEpTT04ucGFyc2UoYm9vbGVhbik7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSBcImludGVnZXJcIjpcblx0XHRcdFx0XHRcdFx0Y29uc3QgaW50ZWdlciA9IGNoaWxkcmVuWzBdO1xuXHRcdFx0XHRcdFx0XHQvL29iamVjdCA9IHBhcnNlSW50KGludGVnZXIpO1xuXHRcdFx0XHRcdFx0XHRvYmplY3QgPSBCaWdJbnQoaW50ZWdlcik7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSBcInJlYWxcIjpcblx0XHRcdFx0XHRcdFx0Y29uc3QgcmVhbCA9IGNoaWxkcmVuWzBdO1xuXHRcdFx0XHRcdFx0XHQvL2NvbnN0IGRpZ2l0cyA9IHJlYWwuc3BsaXQoXCIuXCIpWzFdPy5sZW5ndGggfHwgMDtcblx0XHRcdFx0XHRcdFx0b2JqZWN0ID0gcGFyc2VGbG9hdChyZWFsKS8vLnRvRml4ZWQoZGlnaXRzKTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIFwic3RyaW5nXCI6XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHN0cmluZyA9IGNoaWxkcmVuWzBdO1xuXHRcdFx0XHRcdFx0XHRvYmplY3QgPSBzdHJpbmc7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0aWYgKHJldml2ZXIpIG9iamVjdCA9IHJldml2ZXIobmFtZSB8fCBcIlwiLCBvYmplY3QpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG9iamVjdDtcblxuXHRcdFx0LyoqIFxuXHRcdFx0ICogQ2h1bmsgQXJyYXlcblx0XHRcdCAqIEBhdXRob3IgVmlyZ2lsQ2x5bmVcblx0XHRcdCAqIEBwYXJhbSB7QXJyYXl9IHNvdXJjZSAtIHNvdXJjZVxuXHRcdFx0ICogQHBhcmFtIHtOdW1iZXJ9IGxlbmd0aCAtIG51bWJlclxuXHRcdFx0ICogQHJldHVybiB7QXJyYXk8Kj59IHRhcmdldFxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBjaHVuayhzb3VyY2UsIGxlbmd0aCkge1xuXHRcdFx0XHR2YXIgaW5kZXggPSAwLCB0YXJnZXQgPSBbXTtcblx0XHRcdFx0d2hpbGUgKGluZGV4IDwgc291cmNlLmxlbmd0aCkgdGFyZ2V0LnB1c2goc291cmNlLnNsaWNlKGluZGV4LCBpbmRleCArPSBsZW5ndGgpKTtcblx0XHRcdFx0cmV0dXJuIHRhcmdldDtcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gZnJvbVhNTChlbGVtLCByZXZpdmVyKSB7XG5cdFx0XHRsZXQgb2JqZWN0O1xuXHRcdFx0c3dpdGNoICh0eXBlb2YgZWxlbSkge1xuXHRcdFx0XHRjYXNlIFwic3RyaW5nXCI6XG5cdFx0XHRcdGNhc2UgXCJ1bmRlZmluZWRcIjpcblx0XHRcdFx0XHRvYmplY3QgPSBlbGVtO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwib2JqZWN0XCI6XG5cdFx0XHRcdFx0Ly9kZWZhdWx0OlxuXHRcdFx0XHRcdGNvbnN0IHJhdyA9IGVsZW0ucmF3O1xuXHRcdFx0XHRcdGNvbnN0IG5hbWUgPSBlbGVtLm5hbWU7XG5cdFx0XHRcdFx0Y29uc3QgdGFnID0gZWxlbS50YWc7XG5cdFx0XHRcdFx0Y29uc3QgY2hpbGRyZW4gPSBlbGVtLmNoaWxkcmVuO1xuXG5cdFx0XHRcdFx0aWYgKHJhdykgb2JqZWN0ID0gcmF3O1xuXHRcdFx0XHRcdGVsc2UgaWYgKHRhZykgb2JqZWN0ID0gcGFyc2VBdHRyaWJ1dGUodGFnLCByZXZpdmVyKTtcblx0XHRcdFx0XHRlbHNlIGlmICghY2hpbGRyZW4pIG9iamVjdCA9IHsgW25hbWVdOiB1bmRlZmluZWQgfTtcblx0XHRcdFx0XHRlbHNlIG9iamVjdCA9IHt9O1xuXG5cdFx0XHRcdFx0aWYgKG5hbWUgPT09IFwicGxpc3RcIikgb2JqZWN0ID0gT2JqZWN0LmFzc2lnbihvYmplY3QsIGZyb21QbGlzdChjaGlsZHJlblswXSwgcmV2aXZlcikpO1xuXHRcdFx0XHRcdGVsc2UgY2hpbGRyZW4/LmZvckVhY2g/LigoY2hpbGQsIGkpID0+IHtcblx0XHRcdFx0XHRcdGlmICh0eXBlb2YgY2hpbGQgPT09IFwic3RyaW5nXCIpIGFkZE9iamVjdChvYmplY3QsIENISUxEX05PREVfS0VZLCBmcm9tWE1MKGNoaWxkLCByZXZpdmVyKSwgdW5kZWZpbmVkKVxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAoIWNoaWxkLnRhZyAmJiAhY2hpbGQuY2hpbGRyZW4gJiYgIWNoaWxkLnJhdykgYWRkT2JqZWN0KG9iamVjdCwgY2hpbGQubmFtZSwgZnJvbVhNTChjaGlsZCwgcmV2aXZlciksIGNoaWxkcmVuPy5baSAtIDFdPy5uYW1lKVxuXHRcdFx0XHRcdFx0ZWxzZSBhZGRPYmplY3Qob2JqZWN0LCBjaGlsZC5uYW1lLCBmcm9tWE1MKGNoaWxkLCByZXZpdmVyKSwgdW5kZWZpbmVkKVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdGlmIChjaGlsZHJlbiAmJiBjaGlsZHJlbi5sZW5ndGggPT09IDApIGFkZE9iamVjdChvYmplY3QsIENISUxEX05PREVfS0VZLCBudWxsLCB1bmRlZmluZWQpO1xuXHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0aWYgKE9iamVjdC5rZXlzKG9iamVjdCkubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdFx0XHRpZiAoZWxlbS5uYW1lKSBvYmplY3RbZWxlbS5uYW1lXSA9IChlbGVtLmhhc0NoaWxkID09PSBmYWxzZSkgPyBudWxsIDogXCJcIjtcblx0XHRcdFx0XHRcdGVsc2Ugb2JqZWN0ID0gKGVsZW0uaGFzQ2hpbGQgPT09IGZhbHNlKSA/IG51bGwgOiBcIlwiO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQqL1xuXG5cdFx0XHRcdFx0Ly9pZiAoT2JqZWN0LmtleXMob2JqZWN0KS5sZW5ndGggPT09IDApIGFkZE9iamVjdChvYmplY3QsIGVsZW0ubmFtZSwgKGVsZW0uaGFzQ2hpbGQgPT09IGZhbHNlKSA/IG51bGwgOiBcIlwiKTtcblx0XHRcdFx0XHQvL2lmIChPYmplY3Qua2V5cyhvYmplY3QpLmxlbmd0aCA9PT0gMCkgb2JqZWN0ID0gKGVsZW0uaGFzQ2hpbGQgPT09IGZhbHNlKSA/IHVuZGVmaW5lZCA6IFwiXCI7XG5cdFx0XHRcdFx0aWYgKHJldml2ZXIpIG9iamVjdCA9IHJldml2ZXIobmFtZSB8fCBcIlwiLCBvYmplY3QpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG9iamVjdDtcblx0XHRcdC8qKioqKioqKioqKioqKioqKiBGdWN0aW9ucyAqKioqKioqKioqKioqKioqKi9cblx0XHRcdGZ1bmN0aW9uIHBhcnNlQXR0cmlidXRlKHRhZywgcmV2aXZlcikge1xuXHRcdFx0XHRpZiAoIXRhZykgcmV0dXJuO1xuXHRcdFx0XHRjb25zdCBsaXN0ID0gdGFnLnNwbGl0KC8oW15cXHM9J1wiXSsoPzpcXHMqPVxccyooPzonW1xcU1xcc10qPyd8XCJbXFxTXFxzXSo/XCJ8W15cXHMnXCJdKikpPykvKTtcblx0XHRcdFx0Y29uc3QgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG5cdFx0XHRcdGxldCBhdHRyaWJ1dGVzLCB2YWw7XG5cblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGxldCBzdHIgPSByZW1vdmVTcGFjZXMobGlzdFtpXSk7XG5cdFx0XHRcdFx0Ly9sZXQgc3RyID0gcmVtb3ZlQnJlYWtMaW5lKGxpc3RbaV0pO1xuXHRcdFx0XHRcdC8vbGV0IHN0ciA9IGxpc3RbaV0/LnRyaW0/LigpO1xuXHRcdFx0XHRcdGlmICghc3RyKSBjb250aW51ZTtcblxuXHRcdFx0XHRcdGlmICghYXR0cmlidXRlcykge1xuXHRcdFx0XHRcdFx0YXR0cmlidXRlcyA9IHt9O1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGNvbnN0IHBvcyA9IHN0ci5pbmRleE9mKFwiPVwiKTtcblx0XHRcdFx0XHRpZiAocG9zIDwgMCkge1xuXHRcdFx0XHRcdFx0Ly8gYmFyZSBhdHRyaWJ1dGVcblx0XHRcdFx0XHRcdHN0ciA9IEFUVFJJQlVURV9LRVkgKyBzdHI7XG5cdFx0XHRcdFx0XHR2YWwgPSBudWxsO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQvLyBhdHRyaWJ1dGUga2V5L3ZhbHVlIHBhaXJcblx0XHRcdFx0XHRcdHZhbCA9IHN0ci5zdWJzdHIocG9zICsgMSkucmVwbGFjZSgvXlxccysvLCBcIlwiKTtcblx0XHRcdFx0XHRcdHN0ciA9IEFUVFJJQlVURV9LRVkgKyBzdHIuc3Vic3RyKDAsIHBvcykucmVwbGFjZSgvXFxzKyQvLCBcIlwiKTtcblxuXHRcdFx0XHRcdFx0Ly8gcXVvdGU6IGZvbz1cIkZPT1wiIGJhcj0nQkFSJ1xuXHRcdFx0XHRcdFx0Y29uc3QgZmlyc3RDaGFyID0gdmFsWzBdO1xuXHRcdFx0XHRcdFx0Y29uc3QgbGFzdENoYXIgPSB2YWxbdmFsLmxlbmd0aCAtIDFdO1xuXHRcdFx0XHRcdFx0aWYgKGZpcnN0Q2hhciA9PT0gbGFzdENoYXIgJiYgKGZpcnN0Q2hhciA9PT0gXCInXCIgfHwgZmlyc3RDaGFyID09PSAnXCInKSkge1xuXHRcdFx0XHRcdFx0XHR2YWwgPSB2YWwuc3Vic3RyKDEsIHZhbC5sZW5ndGggLSAyKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0dmFsID0gdW5lc2NhcGVYTUwodmFsKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHJldml2ZXIpIHZhbCA9IHJldml2ZXIoc3RyLCB2YWwpO1xuXG5cdFx0XHRcdFx0YWRkT2JqZWN0KGF0dHJpYnV0ZXMsIHN0ciwgdmFsKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBhdHRyaWJ1dGVzO1xuXG5cdFx0XHRcdGZ1bmN0aW9uIHJlbW92ZVNwYWNlcyhzdHIpIHtcblx0XHRcdFx0XHQvL3JldHVybiBzdHIgJiYgc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csIFwiXCIpO1xuXHRcdFx0XHRcdHJldHVybiBzdHI/LnRyaW0/LigpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIGFkZE9iamVjdChvYmplY3QsIGtleSwgdmFsLCBwcmV2S2V5ID0ga2V5KSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgdmFsID09PSBcInVuZGVmaW5lZFwiKSByZXR1cm47XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGNvbnN0IHByZXYgPSBvYmplY3RbcHJldktleV07XG5cdFx0XHRcdFx0Ly9jb25zdCBjdXJyID0gb2JqZWN0W2tleV07XG5cdFx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkocHJldikpIHByZXYucHVzaCh2YWwpO1xuXHRcdFx0XHRcdGVsc2UgaWYgKHByZXYpIG9iamVjdFtwcmV2S2V5XSA9IFtwcmV2LCB2YWxdO1xuXHRcdFx0XHRcdGVsc2Ugb2JqZWN0W2tleV0gPSB2YWw7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRmdW5jdGlvbiB1bmVzY2FwZVhNTChzdHIpIHtcblx0XHRcdHJldHVybiBzdHIucmVwbGFjZSgvKCYoPzpsdHxndHxhbXB8YXBvc3xxdW90fCMoPzpcXGR7MSw2fXx4WzAtOWEtZkEtRl17MSw1fSkpOykvZywgZnVuY3Rpb24gKHN0cikge1xuXHRcdFx0XHRpZiAoc3RyWzFdID09PSBcIiNcIikge1xuXHRcdFx0XHRcdGNvbnN0IGNvZGUgPSAoc3RyWzJdID09PSBcInhcIikgPyBwYXJzZUludChzdHIuc3Vic3RyKDMpLCAxNikgOiBwYXJzZUludChzdHIuc3Vic3RyKDIpLCAxMCk7XG5cdFx0XHRcdFx0aWYgKGNvZGUgPiAtMSkgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoY29kZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIFVORVNDQVBFW3N0cl0gfHwgc3RyO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdH07XG5cblx0c3RyaW5naWZ5KGpzb24gPSBuZXcgT2JqZWN0LCB0YWIgPSBcIlwiKSB7XG5cdFx0Y29uc3QgRVNDQVBFID0gdGhpcy4jRVNDQVBFO1xuXHRcdGNvbnN0IEFUVFJJQlVURV9LRVkgPSB0aGlzLiNBVFRSSUJVVEVfS0VZO1xuXHRcdGNvbnN0IENISUxEX05PREVfS0VZID0gdGhpcy4jQ0hJTERfTk9ERV9LRVk7XG5cdFx0bGV0IFhNTCA9IFwiXCI7XG5cdFx0Zm9yIChsZXQgZWxlbSBpbiBqc29uKSBYTUwgKz0gdG9YbWwoanNvbltlbGVtXSwgZWxlbSwgXCJcIik7XG5cdFx0WE1MID0gdGFiID8gWE1MLnJlcGxhY2UoL1xcdC9nLCB0YWIpIDogWE1MLnJlcGxhY2UoL1xcdHxcXG4vZywgXCJcIik7XG5cdFx0cmV0dXJuIFhNTDtcblx0XHQvKioqKioqKioqKioqKioqKiogRnVjdGlvbnMgKioqKioqKioqKioqKioqKiovXG5cdFx0ZnVuY3Rpb24gdG9YbWwoRWxlbSwgTmFtZSwgSW5kKSB7XG5cdFx0XHRsZXQgeG1sID0gXCJcIjtcblx0XHRcdHN3aXRjaCAodHlwZW9mIEVsZW0pIHtcblx0XHRcdFx0Y2FzZSBcIm9iamVjdFwiOlxuXHRcdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KEVsZW0pKSB7XG5cdFx0XHRcdFx0XHR4bWwgPSBFbGVtLnJlZHVjZShcblx0XHRcdFx0XHRcdFx0KHByZXZYTUwsIGN1cnJYTUwpID0+IHByZXZYTUwgKz0gYCR7SW5kfSR7dG9YbWwoY3VyclhNTCwgTmFtZSwgYCR7SW5kfVxcdGApfVxcbmAsXG5cdFx0XHRcdFx0XHRcdFwiXCJcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGxldCBhdHRyaWJ1dGUgPSBcIlwiO1xuXHRcdFx0XHRcdFx0bGV0IGhhc0NoaWxkID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRmb3IgKGxldCBuYW1lIGluIEVsZW0pIHtcblx0XHRcdFx0XHRcdFx0aWYgKG5hbWVbMF0gPT09IEFUVFJJQlVURV9LRVkpIHtcblx0XHRcdFx0XHRcdFx0XHRhdHRyaWJ1dGUgKz0gYCAke25hbWUuc3Vic3RyaW5nKDEpfT1cXFwiJHtFbGVtW25hbWVdLnRvU3RyaW5nKCl9XFxcImA7XG5cdFx0XHRcdFx0XHRcdFx0ZGVsZXRlIEVsZW1bbmFtZV07XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoRWxlbVtuYW1lXSA9PT0gdW5kZWZpbmVkKSBOYW1lID0gbmFtZTtcblx0XHRcdFx0XHRcdFx0ZWxzZSBoYXNDaGlsZCA9IHRydWU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR4bWwgKz0gYCR7SW5kfTwke05hbWV9JHthdHRyaWJ1dGV9JHsoaGFzQ2hpbGQgfHwgTmFtZSA9PT0gXCJsaW5rXCIpID8gXCJcIiA6IFwiL1wifT5gO1xuXG5cdFx0XHRcdFx0XHRpZiAoaGFzQ2hpbGQpIHtcblx0XHRcdFx0XHRcdFx0aWYgKE5hbWUgPT09IFwicGxpc3RcIikgeG1sICs9IHRvUGxpc3QoRWxlbSwgTmFtZSwgYCR7SW5kfVxcdGApO1xuXHRcdFx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRmb3IgKGxldCBuYW1lIGluIEVsZW0pIHtcblx0XHRcdFx0XHRcdFx0XHRcdHN3aXRjaCAobmFtZSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIENISUxEX05PREVfS0VZOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHhtbCArPSBFbGVtW25hbWVdID8/IFwiXCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0eG1sICs9IHRvWG1sKEVsZW1bbmFtZV0sIG5hbWUsIGAke0luZH1cXHRgKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0eG1sICs9ICh4bWwuc2xpY2UoLTEpID09PSBcIlxcblwiID8gSW5kIDogXCJcIikgKyBgPC8ke05hbWV9PmA7XG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJzdHJpbmdcIjpcblx0XHRcdFx0XHRzd2l0Y2ggKE5hbWUpIHtcblx0XHRcdFx0XHRcdGNhc2UgXCI/eG1sXCI6XG5cdFx0XHRcdFx0XHRcdHhtbCArPSBgJHtJbmR9PCR7TmFtZX0gJHtFbGVtLnRvU3RyaW5nKCl9PmA7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSBcIj9cIjpcblx0XHRcdFx0XHRcdFx0eG1sICs9IGAke0luZH08JHtOYW1lfSR7RWxlbS50b1N0cmluZygpfSR7TmFtZX0+YDtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIFwiIVwiOlxuXHRcdFx0XHRcdFx0XHR4bWwgKz0gYCR7SW5kfTwhLS0ke0VsZW0udG9TdHJpbmcoKX0tLT5gO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgXCIhRE9DVFlQRVwiOlxuXHRcdFx0XHRcdFx0XHR4bWwgKz0gYCR7SW5kfTwke05hbWV9ICR7RWxlbS50b1N0cmluZygpfT5gO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgXCIhQ0RBVEFcIjpcblx0XHRcdFx0XHRcdFx0eG1sICs9IGAke0luZH08IVtDREFUQVske0VsZW0udG9TdHJpbmcoKX1dXT5gO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgQ0hJTERfTk9ERV9LRVk6XG5cdFx0XHRcdFx0XHRcdHhtbCArPSBFbGVtO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdHhtbCArPSBgJHtJbmR9PCR7TmFtZX0+JHtFbGVtLnRvU3RyaW5nKCl9PC8ke05hbWV9PmA7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJ1bmRlZmluZWRcIjpcblx0XHRcdFx0XHR4bWwgKz0gSW5kICsgYDwke05hbWUudG9TdHJpbmcoKX0vPmA7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIHhtbDtcblx0XHR9O1xuXG5cdFx0ZnVuY3Rpb24gdG9QbGlzdChFbGVtLCBOYW1lLCBJbmQpIHtcblx0XHRcdGxldCBwbGlzdCA9IFwiXCI7XG5cdFx0XHRzd2l0Y2ggKHR5cGVvZiBFbGVtKSB7XG5cdFx0XHRcdGNhc2UgXCJib29sZWFuXCI6XG5cdFx0XHRcdFx0cGxpc3QgPSBgJHtJbmR9PCR7RWxlbS50b1N0cmluZygpfS8+YDtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcIm51bWJlclwiOlxuXHRcdFx0XHRcdHBsaXN0ID0gYCR7SW5kfTxyZWFsPiR7RWxlbS50b1N0cmluZygpfTwvcmVhbD5gO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwiYmlnaW50XCI6XG5cdFx0XHRcdFx0cGxpc3QgPSBgJHtJbmR9PGludGVnZXI+JHtFbGVtLnRvU3RyaW5nKCl9PC9pbnRlZ2VyPmA7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJzdHJpbmdcIjpcblx0XHRcdFx0XHRwbGlzdCA9IGAke0luZH08c3RyaW5nPiR7RWxlbS50b1N0cmluZygpfTwvc3RyaW5nPmA7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJvYmplY3RcIjpcblx0XHRcdFx0XHRsZXQgYXJyYXkgPSBcIlwiO1xuXHRcdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KEVsZW0pKSB7XG5cdFx0XHRcdFx0XHRmb3IgKHZhciBpID0gMCwgbiA9IEVsZW0ubGVuZ3RoOyBpIDwgbjsgaSsrKSBhcnJheSArPSBgJHtJbmR9JHt0b1BsaXN0KEVsZW1baV0sIE5hbWUsIGAke0luZH1cXHRgKX1gO1xuXHRcdFx0XHRcdFx0cGxpc3QgPSBgJHtJbmR9PGFycmF5PiR7YXJyYXl9JHtJbmR9PC9hcnJheT5gO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRsZXQgZGljdCA9IFwiXCI7XG5cdFx0XHRcdFx0XHRPYmplY3QuZW50cmllcyhFbGVtKS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcblx0XHRcdFx0XHRcdFx0ZGljdCArPSBgJHtJbmR9PGtleT4ke2tleX08L2tleT5gO1xuXHRcdFx0XHRcdFx0XHRkaWN0ICs9IHRvUGxpc3QodmFsdWUsIGtleSwgSW5kKTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0cGxpc3QgPSBgJHtJbmR9PGRpY3Q+JHtkaWN0fSR7SW5kfTwvZGljdD5gO1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcGxpc3Q7XG5cdFx0fTtcblx0fTtcbn1cbiIsIi8qXG5SRUFETUU6IGh0dHBzOi8vZ2l0aHViLmNvbS9WaXJnaWxDbHluZS9pUmluZ29cbiovXG5cbmltcG9ydCBFTlZzIGZyb20gXCIuLi9FTlYvRU5WLm1qc1wiO1xuY29uc3QgJCA9IG5ldyBFTlZzKFwi76O/IGlSaW5nbzogU2V0IEVudmlyb25tZW50IFZhcmlhYmxlcyBiZXRhXCIpO1xuXG4vKipcbiAqIFNldCBFbnZpcm9ubWVudCBWYXJpYWJsZXNcbiAqIEBhdXRob3IgVmlyZ2lsQ2x5bmVcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gUGVyc2lzdGVudCBTdG9yZSBLZXlcbiAqIEBwYXJhbSB7QXJyYXl9IHBsYXRmb3JtcyAtIFBsYXRmb3JtIE5hbWVzXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YWJhc2UgLSBEZWZhdWx0IERhdGFCYXNlXG4gKiBAcmV0dXJuIHtPYmplY3R9IHsgU2V0dGluZ3MsIENhY2hlcywgQ29uZmlncyB9XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHNldEVOVihuYW1lLCBwbGF0Zm9ybXMsIGRhdGFiYXNlKSB7XG5cdCQubG9nKGDimJHvuI8gJHskLm5hbWV9YCwgXCJcIik7XG5cdGxldCB7IFNldHRpbmdzLCBDYWNoZXMsIENvbmZpZ3MgfSA9ICQuZ2V0RU5WKG5hbWUsIHBsYXRmb3JtcywgZGF0YWJhc2UpO1xuXHQvKioqKioqKioqKioqKioqKiogU2V0dGluZ3MgKioqKioqKioqKioqKioqKiovXG5cdGlmIChTZXR0aW5ncz8uVGFicyAmJiAhQXJyYXkuaXNBcnJheShTZXR0aW5ncz8uVGFicykpICQubG9kYXNoX3NldChTZXR0aW5ncywgXCJUYWJzXCIsIChTZXR0aW5ncz8uVGFicykgPyBbU2V0dGluZ3MuVGFicy50b1N0cmluZygpXSA6IFtdKTtcblx0aWYgKFNldHRpbmdzPy5Eb21haW5zICYmICFBcnJheS5pc0FycmF5KFNldHRpbmdzPy5Eb21haW5zKSkgJC5sb2Rhc2hfc2V0KFNldHRpbmdzLCBcIkRvbWFpbnNcIiwgKFNldHRpbmdzPy5Eb21haW5zKSA/IFtTZXR0aW5ncy5Eb21haW5zLnRvU3RyaW5nKCldIDogW10pO1xuXHRpZiAoU2V0dGluZ3M/LkZ1bmN0aW9ucyAmJiAhQXJyYXkuaXNBcnJheShTZXR0aW5ncz8uRnVuY3Rpb25zKSkgJC5sb2Rhc2hfc2V0KFNldHRpbmdzLCBcIkZ1bmN0aW9uc1wiLCAoU2V0dGluZ3M/LkZ1bmN0aW9ucykgPyBbU2V0dGluZ3MuRnVuY3Rpb25zLnRvU3RyaW5nKCldIDogW10pO1xuXHQkLmxvZyhg4pyFICR7JC5uYW1lfWAsIGBTZXR0aW5nczogJHt0eXBlb2YgU2V0dGluZ3N9YCwgYFNldHRpbmdz5YaF5a65OiAke0pTT04uc3RyaW5naWZ5KFNldHRpbmdzKX1gLCBcIlwiKTtcblx0LyoqKioqKioqKioqKioqKioqIENhY2hlcyAqKioqKioqKioqKioqKioqKi9cblx0Ly8kLmxvZyhg4pyFICR7JC5uYW1lfWAsIGBDYWNoZXM6ICR7dHlwZW9mIENhY2hlc31gLCBgQ2FjaGVz5YaF5a65OiAke0pTT04uc3RyaW5naWZ5KENhY2hlcyl9YCwgXCJcIik7XG5cdC8qKioqKioqKioqKioqKioqKiBDb25maWdzICoqKioqKioqKioqKioqKioqL1xuXHRDb25maWdzLlN0b3JlZnJvbnQgPSBuZXcgTWFwKENvbmZpZ3MuU3RvcmVmcm9udCk7XG5cdGlmIChDb25maWdzLkxvY2FsZSkgQ29uZmlncy5Mb2NhbGUgPSBuZXcgTWFwKENvbmZpZ3MuTG9jYWxlKTtcblx0aWYgKENvbmZpZ3MuaTE4bikgZm9yIChsZXQgdHlwZSBpbiBDb25maWdzLmkxOG4pIENvbmZpZ3MuaTE4blt0eXBlXSA9IG5ldyBNYXAoQ29uZmlncy5pMThuW3R5cGVdKTtcblx0cmV0dXJuIHsgU2V0dGluZ3MsIENhY2hlcywgQ29uZmlncyB9O1xufTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJ2YXIgZ2V0UHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YgPyAob2JqKSA9PiAoT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaikpIDogKG9iaikgPT4gKG9iai5fX3Byb3RvX18pO1xudmFyIGxlYWZQcm90b3R5cGVzO1xuLy8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4vLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbi8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuLy8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4vLyBtb2RlICYgMTY6IHJldHVybiB2YWx1ZSB3aGVuIGl0J3MgUHJvbWlzZS1saWtlXG4vLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuXHRpZihtb2RlICYgMSkgdmFsdWUgPSB0aGlzKHZhbHVlKTtcblx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcblx0aWYodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSkge1xuXHRcdGlmKChtb2RlICYgNCkgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuXHRcdGlmKChtb2RlICYgMTYpICYmIHR5cGVvZiB2YWx1ZS50aGVuID09PSAnZnVuY3Rpb24nKSByZXR1cm4gdmFsdWU7XG5cdH1cblx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcblx0dmFyIGRlZiA9IHt9O1xuXHRsZWFmUHJvdG90eXBlcyA9IGxlYWZQcm90b3R5cGVzIHx8IFtudWxsLCBnZXRQcm90byh7fSksIGdldFByb3RvKFtdKSwgZ2V0UHJvdG8oZ2V0UHJvdG8pXTtcblx0Zm9yKHZhciBjdXJyZW50ID0gbW9kZSAmIDIgJiYgdmFsdWU7IHR5cGVvZiBjdXJyZW50ID09ICdvYmplY3QnICYmICF+bGVhZlByb3RvdHlwZXMuaW5kZXhPZihjdXJyZW50KTsgY3VycmVudCA9IGdldFByb3RvKGN1cnJlbnQpKSB7XG5cdFx0T2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoY3VycmVudCkuZm9yRWFjaCgoa2V5KSA9PiAoZGVmW2tleV0gPSAoKSA9PiAodmFsdWVba2V5XSkpKTtcblx0fVxuXHRkZWZbJ2RlZmF1bHQnXSA9ICgpID0+ICh2YWx1ZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChucywgZGVmKTtcblx0cmV0dXJuIG5zO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLypcblJFQURNRTogaHR0cHM6Ly9naXRodWIuY29tL1ZpcmdpbENseW5lL2lSaW5nb1xuKi9cblxuaW1wb3J0IEVOVnMgZnJvbSBcIi4vRU5WL0VOVi5tanNcIjtcbmltcG9ydCBVUklzIGZyb20gXCIuL1VSSS9VUkkubWpzXCI7XG5pbXBvcnQgWE1McyBmcm9tIFwiLi9YTUwvWE1MLm1qc1wiO1xuaW1wb3J0IHNldEVOViBmcm9tIFwiLi9mdW5jdGlvbi9zZXRFTlYubWpzXCI7XG5cbmltcG9ydCAqIGFzIERlZmF1bHQgZnJvbSBcIi4vZGF0YWJhc2UvRGVmYXVsdC5qc29uXCI7XG5pbXBvcnQgKiBhcyBMb2NhdGlvbiBmcm9tIFwiLi9kYXRhYmFzZS9Mb2NhdGlvbi5qc29uXCI7XG5pbXBvcnQgKiBhcyBOZXdzIGZyb20gXCIuL2RhdGFiYXNlL05ld3MuanNvblwiO1xuaW1wb3J0ICogYXMgUHJpdmF0ZVJlbGF5IGZyb20gXCIuL2RhdGFiYXNlL1ByaXZhdGVSZWxheS5qc29uXCI7XG5pbXBvcnQgKiBhcyBTaXJpIGZyb20gXCIuL2RhdGFiYXNlL1NpcmkuanNvblwiO1xuaW1wb3J0ICogYXMgVGVzdEZsaWdodCBmcm9tIFwiLi9kYXRhYmFzZS9UZXN0RmxpZ2h0Lmpzb25cIjtcbmltcG9ydCAqIGFzIFRWIGZyb20gXCIuL2RhdGFiYXNlL1RWLmpzb25cIjtcblxuY29uc3QgJCA9IG5ldyBFTlZzKFwi76O/IGlSaW5nbzog8J+TjSBMb2NhdGlvbiB2My4xLjUoMSkgcmVzcG9uc2UuYmV0YVwiKTtcbmNvbnN0IFVSSSA9IG5ldyBVUklzKCk7XG5jb25zdCBYTUwgPSBuZXcgWE1McygpO1xuY29uc3QgRGF0YUJhc2UgPSB7XG5cdFwiRGVmYXVsdFwiOiBEZWZhdWx0LFxuXHRcIkxvY2F0aW9uXCI6IExvY2F0aW9uLFxuXHRcIk5ld3NcIjogTmV3cyxcblx0XCJQcml2YXRlUmVsYXlcIjogUHJpdmF0ZVJlbGF5LFxuXHRcIlNpcmlcIjogU2lyaSxcblx0XCJUZXN0RmxpZ2h0XCI6IFRlc3RGbGlnaHQsXG5cdFwiVFZcIjogVFYsXG59O1xuXG4vKioqKioqKioqKioqKioqKiogUHJvY2Vzc2luZyAqKioqKioqKioqKioqKioqKi9cbi8vIOino+aehFVSTFxuY29uc3QgVVJMID0gVVJJLnBhcnNlKCRyZXF1ZXN0LnVybCk7XG4kLmxvZyhg4pqgICR7JC5uYW1lfWAsIGBVUkw6ICR7SlNPTi5zdHJpbmdpZnkoVVJMKX1gLCBcIlwiKTtcbi8vIOiOt+WPlui/nuaOpeWPguaVsFxuY29uc3QgTUVUSE9EID0gJHJlcXVlc3QubWV0aG9kLCBIT1NUID0gVVJMLmhvc3QsIFBBVEggPSBVUkwucGF0aCwgUEFUSHMgPSBVUkwucGF0aHM7XG4kLmxvZyhg4pqgICR7JC5uYW1lfWAsIGBNRVRIT0Q6ICR7TUVUSE9EfWAsIFwiXCIpO1xuLy8g6Kej5p6Q5qC85byPXG5jb25zdCBGT1JNQVQgPSAoJHJlc3BvbnNlLmhlYWRlcnM/LltcIkNvbnRlbnQtVHlwZVwiXSA/PyAkcmVzcG9uc2UuaGVhZGVycz8uW1wiY29udGVudC10eXBlXCJdKT8uc3BsaXQoXCI7XCIpPy5bMF07XG4kLmxvZyhg4pqgICR7JC5uYW1lfWAsIGBGT1JNQVQ6ICR7Rk9STUFUfWAsIFwiXCIpO1xuKGFzeW5jICgpID0+IHtcblx0Y29uc3QgeyBTZXR0aW5ncywgQ2FjaGVzLCBDb25maWdzIH0gPSBzZXRFTlYoXCJpUmluZ29cIiwgXCJMb2NhdGlvblwiLCBEYXRhQmFzZSk7XG5cdCQubG9nKGDimqAgJHskLm5hbWV9YCwgYFNldHRpbmdzLlN3aXRjaDogJHtTZXR0aW5ncz8uU3dpdGNofWAsIFwiXCIpO1xuXHRzd2l0Y2ggKFNldHRpbmdzLlN3aXRjaCkge1xuXHRcdGNhc2UgdHJ1ZTpcblx0XHRkZWZhdWx0OlxuXHRcdFx0Ly8g5Yib5bu656m65pWw5o2uXG5cdFx0XHRsZXQgYm9keSA9IHt9O1xuXHRcdFx0Ly8g5qC85byP5Yik5patXG5cdFx0XHRzd2l0Y2ggKEZPUk1BVCkge1xuXHRcdFx0XHRjYXNlIHVuZGVmaW5lZDogLy8g6KeG5Li65pegYm9keVxuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCI6XG5cdFx0XHRcdGNhc2UgXCJ0ZXh0L3BsYWluXCI6XG5cdFx0XHRcdGNhc2UgXCJ0ZXh0L2h0bWxcIjpcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRzd2l0Y2ggKEhPU1QpIHtcblx0XHRcdFx0XHRcdGNhc2UgXCJnc3BlMS1zc2wubHMuYXBwbGUuY29tXCI6XG5cdFx0XHRcdFx0XHRcdHN3aXRjaCAoUEFUSCkge1xuXHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJwZXAvZ2NjXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRhd2FpdCBzZXRHQ0MoXCJwZXBcIiwgQ2FjaGVzKTtcblx0XHRcdFx0XHRcdFx0XHRcdHN3aXRjaCAoU2V0dGluZ3MuUEVQLkdDQykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiQVVUT1wiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCRyZXNwb25zZS5ib2R5ID0gU2V0dGluZ3MuUEVQLkdDQztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3gtbXBlZ1VSTFwiOlxuXHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24veC1tcGVndXJsXCI6XG5cdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi92bmQuYXBwbGUubXBlZ3VybFwiOlxuXHRcdFx0XHRjYXNlIFwiYXVkaW8vbXBlZ3VybFwiOlxuXHRcdFx0XHRcdC8vYm9keSA9IE0zVTgucGFyc2UoJHJlc3BvbnNlLmJvZHkpO1xuXHRcdFx0XHRcdC8vJC5sb2coYPCfmqcgJHskLm5hbWV9YCwgYGJvZHk6ICR7SlNPTi5zdHJpbmdpZnkoYm9keSl9YCwgXCJcIik7XG5cdFx0XHRcdFx0Ly8kcmVzcG9uc2UuYm9keSA9IE0zVTguc3RyaW5naWZ5KGJvZHkpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwidGV4dC94bWxcIjpcblx0XHRcdFx0Y2FzZSBcInRleHQvcGxpc3RcIjpcblx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3htbFwiOlxuXHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24vcGxpc3RcIjpcblx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3gtcGxpc3RcIjpcblx0XHRcdFx0XHQkLmxvZyhg8J+apyAkeyQubmFtZX1gLCBgYm9keTogJHtib2R5fWAsIFwiXCIpO1xuXHRcdFx0XHRcdC8vYm9keSA9IGF3YWl0IFBMSVNUcyhcInBsaXN0Mmpzb25cIiwgJHJlc3BvbnNlLmJvZHkpO1xuXHRcdFx0XHRcdGJvZHkgPSBYTUwucGFyc2UoJHJlc3BvbnNlLmJvZHkpO1xuXHRcdFx0XHRcdCQubG9nKGDwn5qnICR7JC5uYW1lfWAsIGBib2R5OiAke0pTT04uc3RyaW5naWZ5KGJvZHkpfWAsIFwiXCIpO1xuXHRcdFx0XHRcdC8vIOS4u+acuuWIpOaWrVxuXHRcdFx0XHRcdHN3aXRjaCAoSE9TVCkge1xuXHRcdFx0XHRcdFx0Y2FzZSBcImNvbmZpZ3VyYXRpb24ubHMuYXBwbGUuY29tXCI6XG5cdFx0XHRcdFx0XHRcdC8vIOi3r+W+hOWIpOaWrVxuXHRcdFx0XHRcdFx0XHRzd2l0Y2ggKFBBVEgpIHtcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiY29uZmlnL2RlZmF1bHRzXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBQTElTVCA9IGJvZHkucGxpc3Q7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoUExJU1QpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gc2V0IHNldHRpbmdzXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vIENOXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFBMSVNUW1wiY29tLmFwcGxlLkdFT1wiXS5Db3VudHJ5UHJvdmlkZXJzLkNOLlNob3VsZEVuYWJsZUxhZ3VuYUJlYWNoID0gU2V0dGluZ3M/LkNvbmZpZz8uRGVmYXVsdHM/LkxhZ3VuYUJlYWNoID8/IHRydWU7IC8vIFhYXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFBMSVNUW1wiY29tLmFwcGxlLkdFT1wiXS5Db3VudHJ5UHJvdmlkZXJzLkNOLkRyaXZpbmdNdWx0aVdheXBvaW50Um91dGVzRW5hYmxlZCA9IFNldHRpbmdzPy5Db25maWc/LkRlZmF1bHRzPy5Ecml2aW5nTXVsdGlXYXlwb2ludFJvdXRlc0VuYWJsZWQgPz8gdHJ1ZTsgLy8g6am+6am25a+86Iiq6YCU5b6E54K5XG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vUExJU1RbXCJjb20uYXBwbGUuR0VPXCJdLkNvdW50cnlQcm92aWRlcnMuQ04uRW5hYmxlQWxiZXJ0YSA9IGZhbHNlOyAvLyBDTlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQvL1BMSVNUW1wiY29tLmFwcGxlLkdFT1wiXS5Db3VudHJ5UHJvdmlkZXJzLkNOLkVuYWJsZUNsaWVudERyYXBlZFZlY3RvclBvbHlnb25zID0gZmFsc2U7IC8vIENOXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFBMSVNUW1wiY29tLmFwcGxlLkdFT1wiXS5Db3VudHJ5UHJvdmlkZXJzLkNOLkdFT0FkZHJlc3NDb3JyZWN0aW9uRW5hYmxlZCA9IFNldHRpbmdzPy5Db25maWc/LkRlZmF1bHRzPy5HRU9BZGRyZXNzQ29ycmVjdGlvbiA/PyB0cnVlOyAvLyBDTlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoU2V0dGluZ3M/LkNvbmZpZz8uRGVmYXVsdHM/Lkxvb2t1cE1heFBhcmFtZXRlcnNDb3VudCA/PyB0cnVlKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVsZXRlIFBMSVNUW1wiY29tLmFwcGxlLkdFT1wiXS5Db3VudHJ5UHJvdmlkZXJzLkNOLkdFT0JhdGNoU3BhdGlhbEV2ZW50TG9va3VwTWF4UGFyYW1ldGVyc0NvdW50IC8vIENOXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVsZXRlIFBMSVNUW1wiY29tLmFwcGxlLkdFT1wiXS5Db3VudHJ5UHJvdmlkZXJzLkNOLkdFT0JhdGNoU3BhdGlhbFBsYWNlTG9va3VwTWF4UGFyYW1ldGVyc0NvdW50IC8vIENOXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0UExJU1RbXCJjb20uYXBwbGUuR0VPXCJdLkNvdW50cnlQcm92aWRlcnMuQ04uTG9jYWxpdGllc0FuZExhbmRtYXJrc1N1cHBvcnRlZCA9IFNldHRpbmdzPy5Db25maWc/LkRlZmF1bHRzPy5Mb2NhbGl0aWVzQW5kTGFuZG1hcmtzID8/IHRydWU7IC8vIENOXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vUExJU1RbXCJjb20uYXBwbGUuR0VPXCJdLkNvdW50cnlQcm92aWRlcnMuQ04uTmF2aWdhdGlvblNob3dIZWFkaW5nS2V5ID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0UExJU1RbXCJjb20uYXBwbGUuR0VPXCJdLkNvdW50cnlQcm92aWRlcnMuQ04uUE9JQnVzeW5lc3NEaWZmZXJlbnRpYWxQcml2YWN5ID0gU2V0dGluZ3M/LkNvbmZpZz8uRGVmYXVsdHM/LlBPSUJ1c3luZXNzID8/IHRydWU7IC8vIENOXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFBMSVNUW1wiY29tLmFwcGxlLkdFT1wiXS5Db3VudHJ5UHJvdmlkZXJzLkNOLlBPSUJ1c3luZXNzUmVhbFRpbWUgPSBTZXR0aW5ncz8uQ29uZmlnPy5EZWZhdWx0cz8uUE9JQnVzeW5lc3MgPz8gdHJ1ZTsgLy8gQ05cblx0XHRcdFx0XHRcdFx0XHRcdFx0UExJU1RbXCJjb20uYXBwbGUuR0VPXCJdLkNvdW50cnlQcm92aWRlcnMuQ04uVHJhbnNpdFBheUVuYWJsZWQgPSBTZXR0aW5ncz8uQ29uZmlnPy5EZWZhdWx0cz8uVHJhbnNpdFBheUVuYWJsZWQgPz8gdHJ1ZTsgLy8gQ05cblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9QTElTVFtcImNvbS5hcHBsZS5HRU9cIl0uQ291bnRyeVByb3ZpZGVycy5DTi5XaUZpUXVhbGl0eU5ldHdvcmtEaXNhYmxlZCA9IFNldHRpbmdzPy5Db25maWc/LkRlZmF1bHRzPy5XaUZpUXVhbGl0eU5ldHdvcmtEaXNhYmxlZCA/PyB0cnVlOyAvLyBDTlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQvL1BMSVNUW1wiY29tLmFwcGxlLkdFT1wiXS5Db3VudHJ5UHJvdmlkZXJzLkNOLldpRmlRdWFsaXR5VGlsZURpc2FibGVkID0gU2V0dGluZ3M/LkNvbmZpZz8uRGVmYXVsdHM/LldpRmlRdWFsaXR5VGlsZURpc2FibGVkID8/IHRydWU7IC8vIENOXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFBMSVNUW1wiY29tLmFwcGxlLkdFT1wiXS5Db3VudHJ5UHJvdmlkZXJzLkNOLlN1cHBvcnRzT2ZmbGluZSA9IFNldHRpbmdzPy5Db25maWc/LkRlZmF1bHRzPy5TdXBwb3J0c09mZmxpbmUgPz8gdHJ1ZTsgLy8gQ05cblx0XHRcdFx0XHRcdFx0XHRcdFx0UExJU1RbXCJjb20uYXBwbGUuR0VPXCJdLkNvdW50cnlQcm92aWRlcnMuQ04uU3VwcG9ydHNDYXJJbnRlZ3JhdGlvbiA9IFNldHRpbmdzPy5Db25maWc/LkRlZmF1bHRzPy5TdXBwb3J0c0NhckludGVncmF0aW9uID8/IHRydWU7IC8vIENOXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vIFRXXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vUExJU1RbXCJjb20uYXBwbGUuR0VPXCJdLkNvdW50cnlQcm92aWRlcnMuQ04uR0VPU2hvdWxkU3BlYWtXcml0dGVuQWRkcmVzc2VzID0gdHJ1ZTsgLy8gVFdcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9QTElTVFtcImNvbS5hcHBsZS5HRU9cIl0uQ291bnRyeVByb3ZpZGVycy5DTi5HRU9TaG91bGRTcGVha1dyaXR0ZW5QbGFjZU5hbWVzID0gdHJ1ZTsgLy8gVFdcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gVVNcblx0XHRcdFx0XHRcdFx0XHRcdFx0UExJU1RbXCJjb20uYXBwbGUuR0VPXCJdLkNvdW50cnlQcm92aWRlcnMuQ05bXCI2Njk0OTgyZDJiMTRlOTU4MTVlNDRlOTcwMjM1ZTIzMFwiXSA9IFNldHRpbmdzPy5Db25maWc/LkRlZmF1bHRzPy5bXCI2Njk0OTgyZDJiMTRlOTU4MTVlNDRlOTcwMjM1ZTIzMFwiXSA/PyB0cnVlOyAvLyBVU1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRQTElTVFtcImNvbS5hcHBsZS5HRU9cIl0uQ291bnRyeVByb3ZpZGVycy5DTi5QZWRlc3RyaWFuQVJFbmFibGVkID0gU2V0dGluZ3M/LkNvbmZpZz8uRGVmYXVsdHM/LlBlZGVzdHJpYW5BUiA/PyB0cnVlOyAvLyDnjrDlrp7kuJbnlYzkuK3nmoTnur/ot69cblx0XHRcdFx0XHRcdFx0XHRcdFx0UExJU1RbXCJjb20uYXBwbGUuR0VPXCJdLkNvdW50cnlQcm92aWRlcnMuQ04uT3B0aWNhbEhlYWRpbmdFbmFibGVkID0gU2V0dGluZ3M/LkNvbmZpZz8uRGVmYXVsdHM/Lk9wdGljYWxIZWFkaW5nID8/IHRydWU7IC8vIOS4vui1t+S7peafpeeci1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRQTElTVFtcImNvbS5hcHBsZS5HRU9cIl0uQ291bnRyeVByb3ZpZGVycy5DTi5Vc2VDTFBlZGVzdHJpYW5NYXBNYXRjaGVkTG9jYXRpb25zID0gU2V0dGluZ3M/LkNvbmZpZz8uRGVmYXVsdHM/LlVzZUNMUGVkZXN0cmlhbk1hcE1hdGNoZWRMb2NhdGlvbnMgPz8gdHJ1ZTsgLy8g5a+86Iiq5YeG56Gu5oCnLeWinuW8ulxuXHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdCQubG9nKGDwn5qnICR7JC5uYW1lfWAsIGBib2R5OiAke0pTT04uc3RyaW5naWZ5KGJvZHkpfWAsIFwiXCIpO1xuXHRcdFx0XHRcdC8vJHJlc3BvbnNlLmJvZHkgPSBhd2FpdCBQTElTVHMoXCJqc29uMnBsaXN0XCIsIGJvZHkpOyAvLyBqc29uMnBsaXN0XG5cdFx0XHRcdFx0JHJlc3BvbnNlLmJvZHkgPSBYTUwuc3RyaW5naWZ5KGJvZHkpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwidGV4dC92dHRcIjpcblx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3Z0dFwiOlxuXHRcdFx0XHRcdC8vYm9keSA9IFZUVC5wYXJzZSgkcmVzcG9uc2UuYm9keSk7XG5cdFx0XHRcdFx0Ly8kLmxvZyhg8J+apyAkeyQubmFtZX1gLCBgYm9keTogJHtKU09OLnN0cmluZ2lmeShib2R5KX1gLCBcIlwiKTtcblx0XHRcdFx0XHQvLyRyZXNwb25zZS5ib2R5ID0gVlRULnN0cmluZ2lmeShib2R5KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcInRleHQvanNvblwiOlxuXHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24vanNvblwiOlxuXHRcdFx0XHRcdGJvZHkgPSBKU09OLnBhcnNlKCRyZXNwb25zZS5ib2R5ID8/IFwie31cIik7XG5cdFx0XHRcdFx0JC5sb2coYPCfmqcgJHskLm5hbWV9YCwgYGJvZHk6ICR7SlNPTi5zdHJpbmdpZnkoYm9keSl9YCwgXCJcIik7XG5cdFx0XHRcdFx0JHJlc3BvbnNlLmJvZHkgPSBKU09OLnN0cmluZ2lmeShib2R5KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3Byb3RvYnVmXCI6XG5cdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi94LXByb3RvYnVmXCI6XG5cdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi92bmQuZ29vZ2xlLnByb3RvYnVmXCI6XG5cdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi9ncnBjXCI6XG5cdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi9ncnBjK3Byb3RvXCI6XG5cdFx0XHRcdGNhc2UgXCJhcHBsZWNhdGlvbi9vY3RldC1zdHJlYW1cIjpcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH07XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIGZhbHNlOlxuXHRcdFx0YnJlYWs7XG5cdH07XG59KSgpXG5cdC5jYXRjaCgoZSkgPT4gJC5sb2dFcnIoZSkpXG5cdC5maW5hbGx5KCgpID0+IHtcblx0XHRzd2l0Y2ggKCRyZXNwb25zZSkge1xuXHRcdFx0ZGVmYXVsdDogeyAvLyDmnInlm57lpI3mlbDmja7vvIzov5Tlm57lm57lpI3mlbDmja5cblx0XHRcdFx0Ly9jb25zdCBGT1JNQVQgPSAoJHJlc3BvbnNlPy5oZWFkZXJzPy5bXCJDb250ZW50LVR5cGVcIl0gPz8gJHJlc3BvbnNlPy5oZWFkZXJzPy5bXCJjb250ZW50LXR5cGVcIl0pPy5zcGxpdChcIjtcIik/LlswXTtcblx0XHRcdFx0JC5sb2coYPCfjokgJHskLm5hbWV9LCBmaW5hbGx5YCwgYCRyZXNwb25zZWAsIGBGT1JNQVQ6ICR7Rk9STUFUfWAsIFwiXCIpO1xuXHRcdFx0XHQvLyQubG9nKGDwn5qnICR7JC5uYW1lfSwgZmluYWxseWAsIGAkcmVzcG9uc2U6ICR7SlNPTi5zdHJpbmdpZnkoJHJlc3BvbnNlKX1gLCBcIlwiKTtcblx0XHRcdFx0aWYgKCRyZXNwb25zZT8uaGVhZGVycz8uW1wiQ29udGVudC1FbmNvZGluZ1wiXSkgJHJlc3BvbnNlLmhlYWRlcnNbXCJDb250ZW50LUVuY29kaW5nXCJdID0gXCJpZGVudGl0eVwiO1xuXHRcdFx0XHRpZiAoJHJlc3BvbnNlPy5oZWFkZXJzPy5bXCJjb250ZW50LWVuY29kaW5nXCJdKSAkcmVzcG9uc2UuaGVhZGVyc1tcImNvbnRlbnQtZW5jb2RpbmdcIl0gPSBcImlkZW50aXR5XCI7XG5cdFx0XHRcdGlmICgkLmlzUXVhblgoKSkge1xuXHRcdFx0XHRcdHN3aXRjaCAoRk9STUFUKSB7XG5cdFx0XHRcdFx0XHRjYXNlIHVuZGVmaW5lZDogLy8g6KeG5Li65pegYm9keVxuXHRcdFx0XHRcdFx0XHQvLyDov5Tlm57mma7pgJrmlbDmja5cblx0XHRcdFx0XHRcdFx0JC5kb25lKHsgc3RhdHVzOiAkcmVzcG9uc2Uuc3RhdHVzLCBoZWFkZXJzOiAkcmVzcG9uc2UuaGVhZGVycyB9KTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHQvLyDov5Tlm57mma7pgJrmlbDmja5cblx0XHRcdFx0XHRcdFx0JC5kb25lKHsgc3RhdHVzOiAkcmVzcG9uc2Uuc3RhdHVzLCBoZWFkZXJzOiAkcmVzcG9uc2UuaGVhZGVycywgYm9keTogJHJlc3BvbnNlLmJvZHkgfSk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3Byb3RvYnVmXCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24veC1wcm90b2J1ZlwiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3ZuZC5nb29nbGUucHJvdG9idWZcIjpcblx0XHRcdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi9ncnBjXCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24vZ3JwYytwcm90b1wiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxlY2F0aW9uL29jdGV0LXN0cmVhbVwiOlxuXHRcdFx0XHRcdFx0XHQvLyDov5Tlm57kuozov5vliLbmlbDmja5cblx0XHRcdFx0XHRcdFx0Ly8kLmxvZyhgJHskcmVzcG9uc2UuYm9keUJ5dGVzLmJ5dGVMZW5ndGh9LS0tJHskcmVzcG9uc2UuYm9keUJ5dGVzLmJ1ZmZlci5ieXRlTGVuZ3RofWApO1xuXHRcdFx0XHRcdFx0XHQkLmRvbmUoeyBzdGF0dXM6ICRyZXNwb25zZS5zdGF0dXMsIGhlYWRlcnM6ICRyZXNwb25zZS5oZWFkZXJzLCBib2R5Qnl0ZXM6ICRyZXNwb25zZS5ib2R5Qnl0ZXMuYnVmZmVyLnNsaWNlKCRyZXNwb25zZS5ib2R5Qnl0ZXMuYnl0ZU9mZnNldCwgJHJlc3BvbnNlLmJvZHlCeXRlcy5ieXRlTGVuZ3RoICsgJHJlc3BvbnNlLmJvZHlCeXRlcy5ieXRlT2Zmc2V0KSB9KTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fSBlbHNlICQuZG9uZSgkcmVzcG9uc2UpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH07XG5cdFx0XHRjYXNlIHVuZGVmaW5lZDogeyAvLyDml6Dlm57lpI3mlbDmja5cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9O1xuXHRcdH07XG5cdH0pXG5cbi8qKioqKioqKioqKioqKioqKiBGdW5jdGlvbiAqKioqKioqKioqKioqKioqKi9cbi8qKlxuICogU2V0IEdDQ1xuICogQGF1dGhvciBWaXJnaWxDbHluZVxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgLSBDb25maWcgTmFtZVxuICogQHBhcmFtIHtPYmplY3R9IGNhY2hlcyAtIENhY2hlc1xuICogQHJldHVybiB7UHJvbWlzZTwqPn1cbiAqL1xuYXN5bmMgZnVuY3Rpb24gc2V0R0NDKG5hbWUsIGNhY2hlcykge1xuXHQkLmxvZyhg4pqgICR7JC5uYW1lfSwgU2V0IEdDQ2AsIGBjYWNoZXMuJHtuYW1lfS5nY2MgPSAke2NhY2hlcz8uW25hbWVdPy5nY2N9YCwgXCJcIik7XG5cdGlmICgkcmVzcG9uc2UuYm9keSAhPT0gY2FjaGVzPy5bbmFtZV0/LmdjYykge1xuXHRcdGxldCBuZXdDYWNoZXMgPSBjYWNoZXM7XG5cdFx0bmV3Q2FjaGVzW25hbWVdID0geyBcImdjY1wiOiAkcmVzcG9uc2UuYm9keSB9O1xuXHRcdCQuc2V0anNvbihuZXdDYWNoZXMsIFwiQGlSaW5nby5Mb2NhdGlvbi5DYWNoZXNcIik7XG5cdH1cblx0cmV0dXJuICQubG9nKGDwn46JICR7JC5uYW1lfSwgU2V0IEdDQ2AsIGBjYWNoZXMuJHtuYW1lfS5nY2MgPSAke2NhY2hlcz8uW25hbWVdPy5nY2N9YCwgXCJcIik7XG59O1xuXG4vKipcbiAqIFBhcnNlIFBsaXN0XG4gKiBAYXV0aG9yIFZpcmdpbENseW5lXG4gKiBAdHlwZWRlZiB7IFwianNvbjJwbGlzdFwiIHwgXCJwbGlzdDJqc29uXCIgfSBvcHRcbiAqIEBwYXJhbSB7b3B0fSBvcHQgLSBkbyB0eXBlc1xuICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZyAtIHN0cmluZ1xuICogQHJldHVybiB7UHJvbWlzZTwqPn1cbiAqL1xuYXN5bmMgZnVuY3Rpb24gUExJU1RzKG9wdCwgc3RyaW5nKSB7XG5cdGNvbnN0IHJlcXVlc3QgPSB7XG5cdFx0XCJ1cmxcIjogXCJodHRwczovL2pzb24ycGxpc3QubmFub2NhdC5tZS9jb252ZXJ0LnBocFwiLFxuXHRcdFwiaGVhZGVyc1wiOiB7XG5cdFx0XHRcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDsgY2hhcnNldD1VVEYtOFwiLFxuXHRcdFx0XCJBY2NlcHRcIjogXCJ0ZXh0L2phdmFzY3JpcHQsIHRleHQvaHRtbCwgYXBwbGljYXRpb24veG1sLCB0ZXh0L3htbCwgKi8qXCIsXG5cdFx0fSxcblx0XHRcImJvZHlcIjogYGRvPSR7b3B0fSZjb250ZW50PWAgKyBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5nKVxuXHR9O1xuXHRyZXR1cm4gYXdhaXQgJC5odHRwLnBvc3QocmVxdWVzdCkudGhlbih2ID0+IHYuYm9keSk7XG59O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9