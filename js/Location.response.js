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
var _database_Default_json__WEBPACK_IMPORTED_MODULE_3___namespace_cache;
var _database_Location_json__WEBPACK_IMPORTED_MODULE_4___namespace_cache;
var _database_News_json__WEBPACK_IMPORTED_MODULE_5___namespace_cache;
var _database_PrivateRelay_json__WEBPACK_IMPORTED_MODULE_6___namespace_cache;
var _database_Siri_json__WEBPACK_IMPORTED_MODULE_7___namespace_cache;
var _database_TestFlight_json__WEBPACK_IMPORTED_MODULE_8___namespace_cache;
var _database_TV_json__WEBPACK_IMPORTED_MODULE_9___namespace_cache;
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _ENV_ENV_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ENV/ENV.mjs */ "./src/ENV/ENV.mjs");
/* harmony import */ var _URI_URI_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./URI/URI.mjs */ "./src/URI/URI.mjs");
/* harmony import */ var _XML_XML_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./XML/XML.mjs */ "./src/XML/XML.mjs");
/* harmony import */ var _database_Default_json__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./database/Default.json */ "./src/database/Default.json");
/* harmony import */ var _database_Location_json__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./database/Location.json */ "./src/database/Location.json");
/* harmony import */ var _database_News_json__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./database/News.json */ "./src/database/News.json");
/* harmony import */ var _database_PrivateRelay_json__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./database/PrivateRelay.json */ "./src/database/PrivateRelay.json");
/* harmony import */ var _database_Siri_json__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./database/Siri.json */ "./src/database/Siri.json");
/* harmony import */ var _database_TestFlight_json__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./database/TestFlight.json */ "./src/database/TestFlight.json");
/* harmony import */ var _database_TV_json__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./database/TV.json */ "./src/database/TV.json");
/*
README: https://github.com/VirgilClyne/iRingo
*/













const $ = new _ENV_ENV_mjs__WEBPACK_IMPORTED_MODULE_0__["default"](" iRingo: 📍 Location v3.1.5(1) response.beta");
const URI = new _URI_URI_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]();
const XML = new _XML_XML_mjs__WEBPACK_IMPORTED_MODULE_2__["default"]();
const DataBase = {
	"Default": /*#__PURE__*/ (_database_Default_json__WEBPACK_IMPORTED_MODULE_3___namespace_cache || (_database_Default_json__WEBPACK_IMPORTED_MODULE_3___namespace_cache = __webpack_require__.t(_database_Default_json__WEBPACK_IMPORTED_MODULE_3__, 2))),
	"Location": /*#__PURE__*/ (_database_Location_json__WEBPACK_IMPORTED_MODULE_4___namespace_cache || (_database_Location_json__WEBPACK_IMPORTED_MODULE_4___namespace_cache = __webpack_require__.t(_database_Location_json__WEBPACK_IMPORTED_MODULE_4__, 2))),
	"News": /*#__PURE__*/ (_database_News_json__WEBPACK_IMPORTED_MODULE_5___namespace_cache || (_database_News_json__WEBPACK_IMPORTED_MODULE_5___namespace_cache = __webpack_require__.t(_database_News_json__WEBPACK_IMPORTED_MODULE_5__, 2))),
	"PrivateRelay": /*#__PURE__*/ (_database_PrivateRelay_json__WEBPACK_IMPORTED_MODULE_6___namespace_cache || (_database_PrivateRelay_json__WEBPACK_IMPORTED_MODULE_6___namespace_cache = __webpack_require__.t(_database_PrivateRelay_json__WEBPACK_IMPORTED_MODULE_6__, 2))),
	"Siri": /*#__PURE__*/ (_database_Siri_json__WEBPACK_IMPORTED_MODULE_7___namespace_cache || (_database_Siri_json__WEBPACK_IMPORTED_MODULE_7___namespace_cache = __webpack_require__.t(_database_Siri_json__WEBPACK_IMPORTED_MODULE_7__, 2))),
	"TestFlight": /*#__PURE__*/ (_database_TestFlight_json__WEBPACK_IMPORTED_MODULE_8___namespace_cache || (_database_TestFlight_json__WEBPACK_IMPORTED_MODULE_8___namespace_cache = __webpack_require__.t(_database_TestFlight_json__WEBPACK_IMPORTED_MODULE_8__, 2))),
	"TV": /*#__PURE__*/ (_database_TV_json__WEBPACK_IMPORTED_MODULE_9___namespace_cache || (_database_TV_json__WEBPACK_IMPORTED_MODULE_9___namespace_cache = __webpack_require__.t(_database_TV_json__WEBPACK_IMPORTED_MODULE_9__, 2))),
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
	const { Settings, Caches, Configs } = setENV("iRingo", "Location", DataBase);
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
 * Set Environment Variables
 * @author VirgilClyne
 * @param {String} name - Persistent Store Key
 * @param {Array} platforms - Platform Names
 * @param {Object} database - Default DataBase
 * @return {Object} { Settings, Caches, Configs }
 */
function setENV(name, platforms, database) {
	$.log(`☑️ ${$.name}, Set Environment Variables`, "");
	let { Settings, Caches, Configs } = $.getENV(name, platforms, database);
	/***************** Settings *****************/
	$.log(`✅ ${$.name}, Set Environment Variables`, `Settings: ${typeof Settings}`, `Settings内容: ${JSON.stringify(Settings)}`, "");
	/***************** Caches *****************/
	//$.log(`✅ ${$.name}, Set Environment Variables`, `Caches: ${typeof Caches}`, `Caches内容: ${JSON.stringify(Caches)}`, "");
	/***************** Configs *****************/
	Configs.Storefront = new Map(Configs.Storefront);
	return { Settings, Caches, Configs };
};

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Y2VzIjpbIndlYnBhY2s6Ly9pcmluZ28vLi9zcmMvRU5WL0VOVi5tanMiLCJ3ZWJwYWNrOi8vaXJpbmdvLy4vc3JjL1VSSS9VUkkubWpzIiwid2VicGFjazovL2lyaW5nby8uL3NyYy9YTUwvWE1MLm1qcyIsIndlYnBhY2s6Ly9pcmluZ28vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vaXJpbmdvL3dlYnBhY2svcnVudGltZS9jcmVhdGUgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2lyaW5nby93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vaXJpbmdvL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vaXJpbmdvL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vaXJpbmdvLy4vc3JjL0xvY2F0aW9uLnJlc3BvbnNlLmJldGEuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgY2xhc3MgRU5WIHtcblx0Y29uc3RydWN0b3IobmFtZSwgb3B0cykge1xuXHRcdHRoaXMubmFtZSA9IGAke25hbWV9LCBFTlYgdjEuMC4wYFxuXHRcdHRoaXMuaHR0cCA9IG5ldyBIdHRwKHRoaXMpXG5cdFx0dGhpcy5kYXRhID0gbnVsbFxuXHRcdHRoaXMuZGF0YUZpbGUgPSAnYm94LmRhdCdcblx0XHR0aGlzLmxvZ3MgPSBbXVxuXHRcdHRoaXMuaXNNdXRlID0gZmFsc2Vcblx0XHR0aGlzLmlzTmVlZFJld3JpdGUgPSBmYWxzZVxuXHRcdHRoaXMubG9nU2VwYXJhdG9yID0gJ1xcbidcblx0XHR0aGlzLmVuY29kaW5nID0gJ3V0Zi04J1xuXHRcdHRoaXMuc3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcblx0XHRPYmplY3QuYXNzaWduKHRoaXMsIG9wdHMpXG5cdFx0dGhpcy5sb2coJycsIGDwn4+BICR7dGhpcy5uYW1lfSwg5byA5aeLIWApXG5cdH1cblxuXHRQbGF0Zm9ybSgpIHtcblx0XHRpZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiAkZW52aXJvbm1lbnQgJiYgJGVudmlyb25tZW50WydzdXJnZS12ZXJzaW9uJ10pXG5cdFx0XHRyZXR1cm4gJ1N1cmdlJ1xuXHRcdGlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mICRlbnZpcm9ubWVudCAmJiAkZW52aXJvbm1lbnRbJ3N0YXNoLXZlcnNpb24nXSlcblx0XHRcdHJldHVybiAnU3Rhc2gnXG5cdFx0aWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgJHRhc2spIHJldHVybiAnUXVhbnR1bXVsdCBYJ1xuXHRcdGlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mICRsb29uKSByZXR1cm4gJ0xvb24nXG5cdFx0aWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgJHJvY2tldCkgcmV0dXJuICdTaGFkb3dyb2NrZXQnXG5cdH1cblxuXHRpc1F1YW5YKCkge1xuXHRcdHJldHVybiAnUXVhbnR1bXVsdCBYJyA9PT0gdGhpcy5QbGF0Zm9ybSgpXG5cdH1cblxuXHRpc1N1cmdlKCkge1xuXHRcdHJldHVybiAnU3VyZ2UnID09PSB0aGlzLlBsYXRmb3JtKClcblx0fVxuXG5cdGlzTG9vbigpIHtcblx0XHRyZXR1cm4gJ0xvb24nID09PSB0aGlzLlBsYXRmb3JtKClcblx0fVxuXG5cdGlzU2hhZG93cm9ja2V0KCkge1xuXHRcdHJldHVybiAnU2hhZG93cm9ja2V0JyA9PT0gdGhpcy5QbGF0Zm9ybSgpXG5cdH1cblxuXHRpc1N0YXNoKCkge1xuXHRcdHJldHVybiAnU3Rhc2gnID09PSB0aGlzLlBsYXRmb3JtKClcblx0fVxuXG5cdHRvT2JqKHN0ciwgZGVmYXVsdFZhbHVlID0gbnVsbCkge1xuXHRcdHRyeSB7XG5cdFx0XHRyZXR1cm4gSlNPTi5wYXJzZShzdHIpXG5cdFx0fSBjYXRjaCB7XG5cdFx0XHRyZXR1cm4gZGVmYXVsdFZhbHVlXG5cdFx0fVxuXHR9XG5cblx0dG9TdHIob2JqLCBkZWZhdWx0VmFsdWUgPSBudWxsKSB7XG5cdFx0dHJ5IHtcblx0XHRcdHJldHVybiBKU09OLnN0cmluZ2lmeShvYmopXG5cdFx0fSBjYXRjaCB7XG5cdFx0XHRyZXR1cm4gZGVmYXVsdFZhbHVlXG5cdFx0fVxuXHR9XG5cblx0Z2V0anNvbihrZXksIGRlZmF1bHRWYWx1ZSkge1xuXHRcdGxldCBqc29uID0gZGVmYXVsdFZhbHVlXG5cdFx0Y29uc3QgdmFsID0gdGhpcy5nZXRkYXRhKGtleSlcblx0XHRpZiAodmFsKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRqc29uID0gSlNPTi5wYXJzZSh0aGlzLmdldGRhdGEoa2V5KSlcblx0XHRcdH0gY2F0Y2ggeyB9XG5cdFx0fVxuXHRcdHJldHVybiBqc29uXG5cdH1cblxuXHRzZXRqc29uKHZhbCwga2V5KSB7XG5cdFx0dHJ5IHtcblx0XHRcdHJldHVybiB0aGlzLnNldGRhdGEoSlNPTi5zdHJpbmdpZnkodmFsKSwga2V5KVxuXHRcdH0gY2F0Y2gge1xuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0fVxuXHR9XG5cblx0Z2V0U2NyaXB0KHVybCkge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXHRcdFx0dGhpcy5nZXQoeyB1cmwgfSwgKGVycm9yLCByZXNwb25zZSwgYm9keSkgPT4gcmVzb2x2ZShib2R5KSlcblx0XHR9KVxuXHR9XG5cblx0cnVuU2NyaXB0KHNjcmlwdCwgcnVuT3B0cykge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXHRcdFx0bGV0IGh0dHBhcGkgPSB0aGlzLmdldGRhdGEoJ0BjaGF2eV9ib3hqc191c2VyQ2Zncy5odHRwYXBpJylcblx0XHRcdGh0dHBhcGkgPSBodHRwYXBpID8gaHR0cGFwaS5yZXBsYWNlKC9cXG4vZywgJycpLnRyaW0oKSA6IGh0dHBhcGlcblx0XHRcdGxldCBodHRwYXBpX3RpbWVvdXQgPSB0aGlzLmdldGRhdGEoXG5cdFx0XHRcdCdAY2hhdnlfYm94anNfdXNlckNmZ3MuaHR0cGFwaV90aW1lb3V0J1xuXHRcdFx0KVxuXHRcdFx0aHR0cGFwaV90aW1lb3V0ID0gaHR0cGFwaV90aW1lb3V0ID8gaHR0cGFwaV90aW1lb3V0ICogMSA6IDIwXG5cdFx0XHRodHRwYXBpX3RpbWVvdXQgPVxuXHRcdFx0XHRydW5PcHRzICYmIHJ1bk9wdHMudGltZW91dCA/IHJ1bk9wdHMudGltZW91dCA6IGh0dHBhcGlfdGltZW91dFxuXHRcdFx0Y29uc3QgW2tleSwgYWRkcl0gPSBodHRwYXBpLnNwbGl0KCdAJylcblx0XHRcdGNvbnN0IG9wdHMgPSB7XG5cdFx0XHRcdHVybDogYGh0dHA6Ly8ke2FkZHJ9L3YxL3NjcmlwdGluZy9ldmFsdWF0ZWAsXG5cdFx0XHRcdGJvZHk6IHtcblx0XHRcdFx0XHRzY3JpcHRfdGV4dDogc2NyaXB0LFxuXHRcdFx0XHRcdG1vY2tfdHlwZTogJ2Nyb24nLFxuXHRcdFx0XHRcdHRpbWVvdXQ6IGh0dHBhcGlfdGltZW91dFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRoZWFkZXJzOiB7ICdYLUtleSc6IGtleSwgJ0FjY2VwdCc6ICcqLyonIH0sXG5cdFx0XHRcdHRpbWVvdXQ6IGh0dHBhcGlfdGltZW91dFxuXHRcdFx0fVxuXHRcdFx0dGhpcy5wb3N0KG9wdHMsIChlcnJvciwgcmVzcG9uc2UsIGJvZHkpID0+IHJlc29sdmUoYm9keSkpXG5cdFx0fSkuY2F0Y2goKGUpID0+IHRoaXMubG9nRXJyKGUpKVxuXHR9XG5cblx0bG9hZGRhdGEoKSB7XG5cdFx0aWYgKHRoaXMuaXNOb2RlKCkpIHtcblx0XHRcdHRoaXMuZnMgPSB0aGlzLmZzID8gdGhpcy5mcyA6IHJlcXVpcmUoJ2ZzJylcblx0XHRcdHRoaXMucGF0aCA9IHRoaXMucGF0aCA/IHRoaXMucGF0aCA6IHJlcXVpcmUoJ3BhdGgnKVxuXHRcdFx0Y29uc3QgY3VyRGlyRGF0YUZpbGVQYXRoID0gdGhpcy5wYXRoLnJlc29sdmUodGhpcy5kYXRhRmlsZSlcblx0XHRcdGNvbnN0IHJvb3REaXJEYXRhRmlsZVBhdGggPSB0aGlzLnBhdGgucmVzb2x2ZShcblx0XHRcdFx0cHJvY2Vzcy5jd2QoKSxcblx0XHRcdFx0dGhpcy5kYXRhRmlsZVxuXHRcdFx0KVxuXHRcdFx0Y29uc3QgaXNDdXJEaXJEYXRhRmlsZSA9IHRoaXMuZnMuZXhpc3RzU3luYyhjdXJEaXJEYXRhRmlsZVBhdGgpXG5cdFx0XHRjb25zdCBpc1Jvb3REaXJEYXRhRmlsZSA9XG5cdFx0XHRcdCFpc0N1ckRpckRhdGFGaWxlICYmIHRoaXMuZnMuZXhpc3RzU3luYyhyb290RGlyRGF0YUZpbGVQYXRoKVxuXHRcdFx0aWYgKGlzQ3VyRGlyRGF0YUZpbGUgfHwgaXNSb290RGlyRGF0YUZpbGUpIHtcblx0XHRcdFx0Y29uc3QgZGF0UGF0aCA9IGlzQ3VyRGlyRGF0YUZpbGVcblx0XHRcdFx0XHQ/IGN1ckRpckRhdGFGaWxlUGF0aFxuXHRcdFx0XHRcdDogcm9vdERpckRhdGFGaWxlUGF0aFxuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHJldHVybiBKU09OLnBhcnNlKHRoaXMuZnMucmVhZEZpbGVTeW5jKGRhdFBhdGgpKVxuXHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHt9XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSByZXR1cm4ge31cblx0XHR9IGVsc2UgcmV0dXJuIHt9XG5cdH1cblxuXHR3cml0ZWRhdGEoKSB7XG5cdFx0aWYgKHRoaXMuaXNOb2RlKCkpIHtcblx0XHRcdHRoaXMuZnMgPSB0aGlzLmZzID8gdGhpcy5mcyA6IHJlcXVpcmUoJ2ZzJylcblx0XHRcdHRoaXMucGF0aCA9IHRoaXMucGF0aCA/IHRoaXMucGF0aCA6IHJlcXVpcmUoJ3BhdGgnKVxuXHRcdFx0Y29uc3QgY3VyRGlyRGF0YUZpbGVQYXRoID0gdGhpcy5wYXRoLnJlc29sdmUodGhpcy5kYXRhRmlsZSlcblx0XHRcdGNvbnN0IHJvb3REaXJEYXRhRmlsZVBhdGggPSB0aGlzLnBhdGgucmVzb2x2ZShcblx0XHRcdFx0cHJvY2Vzcy5jd2QoKSxcblx0XHRcdFx0dGhpcy5kYXRhRmlsZVxuXHRcdFx0KVxuXHRcdFx0Y29uc3QgaXNDdXJEaXJEYXRhRmlsZSA9IHRoaXMuZnMuZXhpc3RzU3luYyhjdXJEaXJEYXRhRmlsZVBhdGgpXG5cdFx0XHRjb25zdCBpc1Jvb3REaXJEYXRhRmlsZSA9XG5cdFx0XHRcdCFpc0N1ckRpckRhdGFGaWxlICYmIHRoaXMuZnMuZXhpc3RzU3luYyhyb290RGlyRGF0YUZpbGVQYXRoKVxuXHRcdFx0Y29uc3QganNvbmRhdGEgPSBKU09OLnN0cmluZ2lmeSh0aGlzLmRhdGEpXG5cdFx0XHRpZiAoaXNDdXJEaXJEYXRhRmlsZSkge1xuXHRcdFx0XHR0aGlzLmZzLndyaXRlRmlsZVN5bmMoY3VyRGlyRGF0YUZpbGVQYXRoLCBqc29uZGF0YSlcblx0XHRcdH0gZWxzZSBpZiAoaXNSb290RGlyRGF0YUZpbGUpIHtcblx0XHRcdFx0dGhpcy5mcy53cml0ZUZpbGVTeW5jKHJvb3REaXJEYXRhRmlsZVBhdGgsIGpzb25kYXRhKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5mcy53cml0ZUZpbGVTeW5jKGN1ckRpckRhdGFGaWxlUGF0aCwganNvbmRhdGEpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0bG9kYXNoX2dldChzb3VyY2UsIHBhdGgsIGRlZmF1bHRWYWx1ZSA9IHVuZGVmaW5lZCkge1xuXHRcdGNvbnN0IHBhdGhzID0gcGF0aC5yZXBsYWNlKC9cXFsoXFxkKylcXF0vZywgJy4kMScpLnNwbGl0KCcuJylcblx0XHRsZXQgcmVzdWx0ID0gc291cmNlXG5cdFx0Zm9yIChjb25zdCBwIG9mIHBhdGhzKSB7XG5cdFx0XHRyZXN1bHQgPSBPYmplY3QocmVzdWx0KVtwXVxuXHRcdFx0aWYgKHJlc3VsdCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHJldHVybiBkZWZhdWx0VmFsdWVcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdFxuXHR9XG5cblx0bG9kYXNoX3NldChvYmosIHBhdGgsIHZhbHVlKSB7XG5cdFx0aWYgKE9iamVjdChvYmopICE9PSBvYmopIHJldHVybiBvYmpcblx0XHRpZiAoIUFycmF5LmlzQXJyYXkocGF0aCkpIHBhdGggPSBwYXRoLnRvU3RyaW5nKCkubWF0Y2goL1teLltcXF1dKy9nKSB8fCBbXVxuXHRcdHBhdGhcblx0XHRcdC5zbGljZSgwLCAtMSlcblx0XHRcdC5yZWR1Y2UoXG5cdFx0XHRcdChhLCBjLCBpKSA9PlxuXHRcdFx0XHRcdE9iamVjdChhW2NdKSA9PT0gYVtjXVxuXHRcdFx0XHRcdFx0PyBhW2NdXG5cdFx0XHRcdFx0XHQ6IChhW2NdID0gTWF0aC5hYnMocGF0aFtpICsgMV0pID4+IDAgPT09ICtwYXRoW2kgKyAxXSA/IFtdIDoge30pLFxuXHRcdFx0XHRvYmpcblx0XHRcdClbcGF0aFtwYXRoLmxlbmd0aCAtIDFdXSA9IHZhbHVlXG5cdFx0cmV0dXJuIG9ialxuXHR9XG5cblx0Z2V0ZGF0YShrZXkpIHtcblx0XHRsZXQgdmFsID0gdGhpcy5nZXR2YWwoa2V5KVxuXHRcdC8vIOWmguaenOS7pSBAXG5cdFx0aWYgKC9eQC8udGVzdChrZXkpKSB7XG5cdFx0XHRjb25zdCBbLCBvYmprZXksIHBhdGhzXSA9IC9eQCguKj8pXFwuKC4qPykkLy5leGVjKGtleSlcblx0XHRcdGNvbnN0IG9ianZhbCA9IG9iamtleSA/IHRoaXMuZ2V0dmFsKG9iamtleSkgOiAnJ1xuXHRcdFx0aWYgKG9ianZhbCkge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGNvbnN0IG9iamVkdmFsID0gSlNPTi5wYXJzZShvYmp2YWwpXG5cdFx0XHRcdFx0dmFsID0gb2JqZWR2YWwgPyB0aGlzLmxvZGFzaF9nZXQob2JqZWR2YWwsIHBhdGhzLCAnJykgOiB2YWxcblx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdHZhbCA9ICcnXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHZhbFxuXHR9XG5cblx0c2V0ZGF0YSh2YWwsIGtleSkge1xuXHRcdGxldCBpc3N1YyA9IGZhbHNlXG5cdFx0aWYgKC9eQC8udGVzdChrZXkpKSB7XG5cdFx0XHRjb25zdCBbLCBvYmprZXksIHBhdGhzXSA9IC9eQCguKj8pXFwuKC4qPykkLy5leGVjKGtleSlcblx0XHRcdGNvbnN0IG9iamRhdCA9IHRoaXMuZ2V0dmFsKG9iamtleSlcblx0XHRcdGNvbnN0IG9ianZhbCA9IG9iamtleVxuXHRcdFx0XHQ/IG9iamRhdCA9PT0gJ251bGwnXG5cdFx0XHRcdFx0PyBudWxsXG5cdFx0XHRcdFx0OiBvYmpkYXQgfHwgJ3t9J1xuXHRcdFx0XHQ6ICd7fSdcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGNvbnN0IG9iamVkdmFsID0gSlNPTi5wYXJzZShvYmp2YWwpXG5cdFx0XHRcdHRoaXMubG9kYXNoX3NldChvYmplZHZhbCwgcGF0aHMsIHZhbClcblx0XHRcdFx0aXNzdWMgPSB0aGlzLnNldHZhbChKU09OLnN0cmluZ2lmeShvYmplZHZhbCksIG9iamtleSlcblx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0Y29uc3Qgb2JqZWR2YWwgPSB7fVxuXHRcdFx0XHR0aGlzLmxvZGFzaF9zZXQob2JqZWR2YWwsIHBhdGhzLCB2YWwpXG5cdFx0XHRcdGlzc3VjID0gdGhpcy5zZXR2YWwoSlNPTi5zdHJpbmdpZnkob2JqZWR2YWwpLCBvYmprZXkpXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlzc3VjID0gdGhpcy5zZXR2YWwodmFsLCBrZXkpXG5cdFx0fVxuXHRcdHJldHVybiBpc3N1Y1xuXHR9XG5cblx0Z2V0dmFsKGtleSkge1xuXHRcdHN3aXRjaCAodGhpcy5QbGF0Zm9ybSgpKSB7XG5cdFx0XHRjYXNlICdTdXJnZSc6XG5cdFx0XHRjYXNlICdMb29uJzpcblx0XHRcdGNhc2UgJ1N0YXNoJzpcblx0XHRcdGNhc2UgJ1NoYWRvd3JvY2tldCc6XG5cdFx0XHRcdHJldHVybiAkcGVyc2lzdGVudFN0b3JlLnJlYWQoa2V5KVxuXHRcdFx0Y2FzZSAnUXVhbnR1bXVsdCBYJzpcblx0XHRcdFx0cmV0dXJuICRwcmVmcy52YWx1ZUZvcktleShrZXkpXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gKHRoaXMuZGF0YSAmJiB0aGlzLmRhdGFba2V5XSkgfHwgbnVsbFxuXHRcdH1cblx0fVxuXG5cdHNldHZhbCh2YWwsIGtleSkge1xuXHRcdHN3aXRjaCAodGhpcy5QbGF0Zm9ybSgpKSB7XG5cdFx0XHRjYXNlICdTdXJnZSc6XG5cdFx0XHRjYXNlICdMb29uJzpcblx0XHRcdGNhc2UgJ1N0YXNoJzpcblx0XHRcdGNhc2UgJ1NoYWRvd3JvY2tldCc6XG5cdFx0XHRcdHJldHVybiAkcGVyc2lzdGVudFN0b3JlLndyaXRlKHZhbCwga2V5KVxuXHRcdFx0Y2FzZSAnUXVhbnR1bXVsdCBYJzpcblx0XHRcdFx0cmV0dXJuICRwcmVmcy5zZXRWYWx1ZUZvcktleSh2YWwsIGtleSlcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiAodGhpcy5kYXRhICYmIHRoaXMuZGF0YVtrZXldKSB8fCBudWxsXG5cdFx0fVxuXHR9XG5cblx0aW5pdEdvdEVudihvcHRzKSB7XG5cdFx0dGhpcy5nb3QgPSB0aGlzLmdvdCA/IHRoaXMuZ290IDogcmVxdWlyZSgnZ290Jylcblx0XHR0aGlzLmNrdG91Z2ggPSB0aGlzLmNrdG91Z2ggPyB0aGlzLmNrdG91Z2ggOiByZXF1aXJlKCd0b3VnaC1jb29raWUnKVxuXHRcdHRoaXMuY2tqYXIgPSB0aGlzLmNramFyID8gdGhpcy5ja2phciA6IG5ldyB0aGlzLmNrdG91Z2guQ29va2llSmFyKClcblx0XHRpZiAob3B0cykge1xuXHRcdFx0b3B0cy5oZWFkZXJzID0gb3B0cy5oZWFkZXJzID8gb3B0cy5oZWFkZXJzIDoge31cblx0XHRcdGlmICh1bmRlZmluZWQgPT09IG9wdHMuaGVhZGVycy5Db29raWUgJiYgdW5kZWZpbmVkID09PSBvcHRzLmNvb2tpZUphcikge1xuXHRcdFx0XHRvcHRzLmNvb2tpZUphciA9IHRoaXMuY2tqYXJcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRnZXQocmVxdWVzdCwgY2FsbGJhY2sgPSAoKSA9PiB7IH0pIHtcblx0XHRkZWxldGUgcmVxdWVzdC5oZWFkZXJzPy5bJ0NvbnRlbnQtTGVuZ3RoJ11cblx0XHRkZWxldGUgcmVxdWVzdC5oZWFkZXJzPy5bJ2NvbnRlbnQtbGVuZ3RoJ11cblxuXHRcdHN3aXRjaCAodGhpcy5QbGF0Zm9ybSgpKSB7XG5cdFx0XHRjYXNlICdTdXJnZSc6XG5cdFx0XHRjYXNlICdMb29uJzpcblx0XHRcdGNhc2UgJ1N0YXNoJzpcblx0XHRcdGNhc2UgJ1NoYWRvd3JvY2tldCc6XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRpZiAodGhpcy5pc1N1cmdlKCkgJiYgdGhpcy5pc05lZWRSZXdyaXRlKSB7XG5cdFx0XHRcdFx0dGhpcy5sb2Rhc2hfc2V0KHJlcXVlc3QsICdoZWFkZXJzLlgtU3VyZ2UtU2tpcC1TY3JpcHRpbmcnLCBmYWxzZSlcblx0XHRcdFx0fVxuXHRcdFx0XHQkaHR0cENsaWVudC5nZXQocmVxdWVzdCwgKGVycm9yLCByZXNwb25zZSwgYm9keSkgPT4ge1xuXHRcdFx0XHRcdGlmICghZXJyb3IgJiYgcmVzcG9uc2UpIHtcblx0XHRcdFx0XHRcdHJlc3BvbnNlLmJvZHkgPSBib2R5XG5cdFx0XHRcdFx0XHRyZXNwb25zZS5zdGF0dXNDb2RlID0gcmVzcG9uc2Uuc3RhdHVzID8gcmVzcG9uc2Uuc3RhdHVzIDogcmVzcG9uc2Uuc3RhdHVzQ29kZVxuXHRcdFx0XHRcdFx0cmVzcG9uc2Uuc3RhdHVzID0gcmVzcG9uc2Uuc3RhdHVzQ29kZVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYWxsYmFjayhlcnJvciwgcmVzcG9uc2UsIGJvZHkpXG5cdFx0XHRcdH0pXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdRdWFudHVtdWx0IFgnOlxuXHRcdFx0XHRpZiAodGhpcy5pc05lZWRSZXdyaXRlKSB7XG5cdFx0XHRcdFx0dGhpcy5sb2Rhc2hfc2V0KHJlcXVlc3QsICdvcHRzLmhpbnRzJywgZmFsc2UpXG5cdFx0XHRcdH1cblx0XHRcdFx0JHRhc2suZmV0Y2gocmVxdWVzdCkudGhlbihcblx0XHRcdFx0XHQocmVzcG9uc2UpID0+IHtcblx0XHRcdFx0XHRcdGNvbnN0IHtcblx0XHRcdFx0XHRcdFx0c3RhdHVzQ29kZTogc3RhdHVzLFxuXHRcdFx0XHRcdFx0XHRzdGF0dXNDb2RlLFxuXHRcdFx0XHRcdFx0XHRoZWFkZXJzLFxuXHRcdFx0XHRcdFx0XHRib2R5LFxuXHRcdFx0XHRcdFx0XHRib2R5Qnl0ZXNcblx0XHRcdFx0XHRcdH0gPSByZXNwb25zZVxuXHRcdFx0XHRcdFx0Y2FsbGJhY2soXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdHsgc3RhdHVzLCBzdGF0dXNDb2RlLCBoZWFkZXJzLCBib2R5LCBib2R5Qnl0ZXMgfSxcblx0XHRcdFx0XHRcdFx0Ym9keSxcblx0XHRcdFx0XHRcdFx0Ym9keUJ5dGVzXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQoZXJyb3IpID0+IGNhbGxiYWNrKChlcnJvciAmJiBlcnJvci5lcnJvcm9yKSB8fCAnVW5kZWZpbmVkRXJyb3InKVxuXHRcdFx0XHQpXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXHR9XG5cblx0cG9zdChyZXF1ZXN0LCBjYWxsYmFjayA9ICgpID0+IHsgfSkge1xuXHRcdGNvbnN0IG1ldGhvZCA9IHJlcXVlc3QubWV0aG9kXG5cdFx0XHQ/IHJlcXVlc3QubWV0aG9kLnRvTG9jYWxlTG93ZXJDYXNlKClcblx0XHRcdDogJ3Bvc3QnXG5cblx0XHQvLyDlpoLmnpzmjIflrprkuobor7fmsYLkvZMsIOS9huayoeaMh+WumiBgQ29udGVudC1UeXBlYOOAgWBjb250ZW50LXR5cGVgLCDliJnoh6rliqjnlJ/miJDjgIJcblx0XHRpZiAoXG5cdFx0XHRyZXF1ZXN0LmJvZHkgJiZcblx0XHRcdHJlcXVlc3QuaGVhZGVycyAmJlxuXHRcdFx0IXJlcXVlc3QuaGVhZGVyc1snQ29udGVudC1UeXBlJ10gJiZcblx0XHRcdCFyZXF1ZXN0LmhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddXG5cdFx0KSB7XG5cdFx0XHQvLyBIVFRQLzHjgIFIVFRQLzIg6YO95pSv5oyB5bCP5YaZIGhlYWRlcnNcblx0XHRcdHJlcXVlc3QuaGVhZGVyc1snY29udGVudC10eXBlJ10gPSAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xuXHRcdH1cblx0XHQvLyDkuLrpgb/lhY3mjIflrprplJnor68gYGNvbnRlbnQtbGVuZ3RoYCDov5nph4zliKDpmaTor6XlsZ7mgKfvvIznlLHlt6Xlhbfnq68gKEh0dHBDbGllbnQpIOi0n+i0o+mHjeaWsOiuoeeul+W5tui1i+WAvFxuXHRcdFx0ZGVsZXRlIHJlcXVlc3QuaGVhZGVycz8uWydDb250ZW50LUxlbmd0aCddXG5cdFx0XHRkZWxldGUgcmVxdWVzdC5oZWFkZXJzPy5bJ2NvbnRlbnQtbGVuZ3RoJ11cblx0XHRzd2l0Y2ggKHRoaXMuUGxhdGZvcm0oKSkge1xuXHRcdFx0Y2FzZSAnU3VyZ2UnOlxuXHRcdFx0Y2FzZSAnTG9vbic6XG5cdFx0XHRjYXNlICdTdGFzaCc6XG5cdFx0XHRjYXNlICdTaGFkb3dyb2NrZXQnOlxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0aWYgKHRoaXMuaXNTdXJnZSgpICYmIHRoaXMuaXNOZWVkUmV3cml0ZSkge1xuXHRcdFx0XHRcdHRoaXMubG9kYXNoX3NldChyZXF1ZXN0LCAnaGVhZGVycy5YLVN1cmdlLVNraXAtU2NyaXB0aW5nJywgZmFsc2UpXG5cdFx0XHRcdH1cblx0XHRcdFx0JGh0dHBDbGllbnRbbWV0aG9kXShyZXF1ZXN0LCAoZXJyb3IsIHJlc3BvbnNlLCBib2R5KSA9PiB7XG5cdFx0XHRcdFx0aWYgKCFlcnJvciAmJiByZXNwb25zZSkge1xuXHRcdFx0XHRcdFx0cmVzcG9uc2UuYm9keSA9IGJvZHlcblx0XHRcdFx0XHRcdHJlc3BvbnNlLnN0YXR1c0NvZGUgPSByZXNwb25zZS5zdGF0dXMgPyByZXNwb25zZS5zdGF0dXMgOiByZXNwb25zZS5zdGF0dXNDb2RlXG5cdFx0XHRcdFx0XHRyZXNwb25zZS5zdGF0dXMgPSByZXNwb25zZS5zdGF0dXNDb2RlXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNhbGxiYWNrKGVycm9yLCByZXNwb25zZSwgYm9keSlcblx0XHRcdFx0fSlcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgJ1F1YW50dW11bHQgWCc6XG5cdFx0XHRcdHJlcXVlc3QubWV0aG9kID0gbWV0aG9kXG5cdFx0XHRcdGlmICh0aGlzLmlzTmVlZFJld3JpdGUpIHtcblx0XHRcdFx0XHR0aGlzLmxvZGFzaF9zZXQocmVxdWVzdCwgJ29wdHMuaGludHMnLCBmYWxzZSlcblx0XHRcdFx0fVxuXHRcdFx0XHQkdGFzay5mZXRjaChyZXF1ZXN0KS50aGVuKFxuXHRcdFx0XHRcdChyZXNwb25zZSkgPT4ge1xuXHRcdFx0XHRcdFx0Y29uc3Qge1xuXHRcdFx0XHRcdFx0XHRzdGF0dXNDb2RlOiBzdGF0dXMsXG5cdFx0XHRcdFx0XHRcdHN0YXR1c0NvZGUsXG5cdFx0XHRcdFx0XHRcdGhlYWRlcnMsXG5cdFx0XHRcdFx0XHRcdGJvZHksXG5cdFx0XHRcdFx0XHRcdGJvZHlCeXRlc1xuXHRcdFx0XHRcdFx0fSA9IHJlc3BvbnNlXG5cdFx0XHRcdFx0XHRjYWxsYmFjayhcblx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0eyBzdGF0dXMsIHN0YXR1c0NvZGUsIGhlYWRlcnMsIGJvZHksIGJvZHlCeXRlcyB9LFxuXHRcdFx0XHRcdFx0XHRib2R5LFxuXHRcdFx0XHRcdFx0XHRib2R5Qnl0ZXNcblx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdChlcnJvcikgPT4gY2FsbGJhY2soKGVycm9yICYmIGVycm9yLmVycm9yb3IpIHx8ICdVbmRlZmluZWRFcnJvcicpXG5cdFx0XHRcdClcblx0XHRcdFx0YnJlYWtcblx0XHR9XG5cdH1cblx0LyoqXG5cdCAqXG5cdCAqIOekuuS+izokLnRpbWUoJ3l5eXktTU0tZGQgcXEgSEg6bW06c3MuUycpXG5cdCAqICAgIDokLnRpbWUoJ3l5eXlNTWRkSEhtbXNzUycpXG5cdCAqICAgIHk65bm0IE065pyIIGQ65pelIHE65a2jIEg65pe2IG065YiGIHM656eSIFM65q+r56eSXG5cdCAqICAgIOWFtuS4rXnlj6/pgIkwLTTkvY3ljaDkvY3nrKbjgIFT5Y+v6YCJMC0x5L2N5Y2g5L2N56ym77yM5YW25L2Z5Y+v6YCJMC0y5L2N5Y2g5L2N56ymXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBmb3JtYXQg5qC85byP5YyW5Y+C5pWwXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSB0cyDlj6/pgIk6IOagueaNruaMh+WumuaXtumXtOaIs+i/lOWbnuagvOW8j+WMluaXpeacn1xuXHQgKlxuXHQgKi9cblx0dGltZShmb3JtYXQsIHRzID0gbnVsbCkge1xuXHRcdGNvbnN0IGRhdGUgPSB0cyA/IG5ldyBEYXRlKHRzKSA6IG5ldyBEYXRlKClcblx0XHRsZXQgbyA9IHtcblx0XHRcdCdNKyc6IGRhdGUuZ2V0TW9udGgoKSArIDEsXG5cdFx0XHQnZCsnOiBkYXRlLmdldERhdGUoKSxcblx0XHRcdCdIKyc6IGRhdGUuZ2V0SG91cnMoKSxcblx0XHRcdCdtKyc6IGRhdGUuZ2V0TWludXRlcygpLFxuXHRcdFx0J3MrJzogZGF0ZS5nZXRTZWNvbmRzKCksXG5cdFx0XHQncSsnOiBNYXRoLmZsb29yKChkYXRlLmdldE1vbnRoKCkgKyAzKSAvIDMpLFxuXHRcdFx0J1MnOiBkYXRlLmdldE1pbGxpc2Vjb25kcygpXG5cdFx0fVxuXHRcdGlmICgvKHkrKS8udGVzdChmb3JtYXQpKVxuXHRcdFx0Zm9ybWF0ID0gZm9ybWF0LnJlcGxhY2UoXG5cdFx0XHRcdFJlZ0V4cC4kMSxcblx0XHRcdFx0KGRhdGUuZ2V0RnVsbFllYXIoKSArICcnKS5zdWJzdHIoNCAtIFJlZ0V4cC4kMS5sZW5ndGgpXG5cdFx0XHQpXG5cdFx0Zm9yIChsZXQgayBpbiBvKVxuXHRcdFx0aWYgKG5ldyBSZWdFeHAoJygnICsgayArICcpJykudGVzdChmb3JtYXQpKVxuXHRcdFx0XHRmb3JtYXQgPSBmb3JtYXQucmVwbGFjZShcblx0XHRcdFx0XHRSZWdFeHAuJDEsXG5cdFx0XHRcdFx0UmVnRXhwLiQxLmxlbmd0aCA9PSAxXG5cdFx0XHRcdFx0XHQ/IG9ba11cblx0XHRcdFx0XHRcdDogKCcwMCcgKyBvW2tdKS5zdWJzdHIoKCcnICsgb1trXSkubGVuZ3RoKVxuXHRcdFx0XHQpXG5cdFx0cmV0dXJuIGZvcm1hdFxuXHR9XG5cblx0LyoqXG5cdCAqIOezu+e7n+mAmuefpVxuXHQgKlxuXHQgKiA+IOmAmuefpeWPguaVsDog5ZCM5pe25pSv5oyBIFF1YW5YIOWSjCBMb29uIOS4pOenjeagvOW8jywgRW52SnPmoLnmja7ov5DooYznjq/looPoh6rliqjovazmjaIsIFN1cmdlIOeOr+Wig+S4jeaUr+aMgeWkmuWqkuS9k+mAmuefpVxuXHQgKlxuXHQgKiDnpLrkvos6XG5cdCAqICQubXNnKHRpdGxlLCBzdWJ0LCBkZXNjLCAndHdpdHRlcjovLycpXG5cdCAqICQubXNnKHRpdGxlLCBzdWJ0LCBkZXNjLCB7ICdvcGVuLXVybCc6ICd0d2l0dGVyOi8vJywgJ21lZGlhLXVybCc6ICdodHRwczovL2dpdGh1Yi5naXRodWJhc3NldHMuY29tL2ltYWdlcy9tb2R1bGVzL29wZW5fZ3JhcGgvZ2l0aHViLW1hcmsucG5nJyB9KVxuXHQgKiAkLm1zZyh0aXRsZSwgc3VidCwgZGVzYywgeyAnb3Blbi11cmwnOiAnaHR0cHM6Ly9iaW5nLmNvbScsICdtZWRpYS11cmwnOiAnaHR0cHM6Ly9naXRodWIuZ2l0aHViYXNzZXRzLmNvbS9pbWFnZXMvbW9kdWxlcy9vcGVuX2dyYXBoL2dpdGh1Yi1tYXJrLnBuZycgfSlcblx0ICpcblx0ICogQHBhcmFtIHsqfSB0aXRsZSDmoIfpophcblx0ICogQHBhcmFtIHsqfSBzdWJ0IOWJr+agh+mimFxuXHQgKiBAcGFyYW0geyp9IGRlc2Mg6YCa55+l6K+m5oOFXG5cdCAqIEBwYXJhbSB7Kn0gb3B0cyDpgJrnn6Xlj4LmlbBcblx0ICpcblx0ICovXG5cdG1zZyh0aXRsZSA9IG5hbWUsIHN1YnQgPSAnJywgZGVzYyA9ICcnLCBvcHRzKSB7XG5cdFx0Y29uc3QgdG9FbnZPcHRzID0gKHJhd29wdHMpID0+IHtcblx0XHRcdHN3aXRjaCAodHlwZW9mIHJhd29wdHMpIHtcblx0XHRcdFx0Y2FzZSB1bmRlZmluZWQ6XG5cdFx0XHRcdFx0cmV0dXJuIHJhd29wdHNcblx0XHRcdFx0Y2FzZSAnc3RyaW5nJzpcblx0XHRcdFx0XHRzd2l0Y2ggKHRoaXMuUGxhdGZvcm0oKSkge1xuXHRcdFx0XHRcdFx0Y2FzZSAnU3VyZ2UnOlxuXHRcdFx0XHRcdFx0Y2FzZSAnU3Rhc2gnOlxuXHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHsgdXJsOiByYXdvcHRzIH1cblx0XHRcdFx0XHRcdGNhc2UgJ0xvb24nOlxuXHRcdFx0XHRcdFx0Y2FzZSAnU2hhZG93cm9ja2V0Jzpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHJhd29wdHNcblx0XHRcdFx0XHRcdGNhc2UgJ1F1YW50dW11bHQgWCc6XG5cdFx0XHRcdFx0XHRcdHJldHVybiB7ICdvcGVuLXVybCc6IHJhd29wdHMgfVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0Y2FzZSAnb2JqZWN0Jzpcblx0XHRcdFx0XHRzd2l0Y2ggKHRoaXMuUGxhdGZvcm0oKSkge1xuXHRcdFx0XHRcdFx0Y2FzZSAnU3VyZ2UnOlxuXHRcdFx0XHRcdFx0Y2FzZSAnU3Rhc2gnOlxuXHRcdFx0XHRcdFx0Y2FzZSAnU2hhZG93cm9ja2V0Jzpcblx0XHRcdFx0XHRcdGRlZmF1bHQ6IHtcblx0XHRcdFx0XHRcdFx0bGV0IG9wZW5VcmwgPVxuXHRcdFx0XHRcdFx0XHRcdHJhd29wdHMudXJsIHx8IHJhd29wdHMub3BlblVybCB8fCByYXdvcHRzWydvcGVuLXVybCddXG5cdFx0XHRcdFx0XHRcdHJldHVybiB7IHVybDogb3BlblVybCB9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRjYXNlICdMb29uJzoge1xuXHRcdFx0XHRcdFx0XHRsZXQgb3BlblVybCA9XG5cdFx0XHRcdFx0XHRcdFx0cmF3b3B0cy5vcGVuVXJsIHx8IHJhd29wdHMudXJsIHx8IHJhd29wdHNbJ29wZW4tdXJsJ11cblx0XHRcdFx0XHRcdFx0bGV0IG1lZGlhVXJsID0gcmF3b3B0cy5tZWRpYVVybCB8fCByYXdvcHRzWydtZWRpYS11cmwnXVxuXHRcdFx0XHRcdFx0XHRyZXR1cm4geyBvcGVuVXJsLCBtZWRpYVVybCB9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRjYXNlICdRdWFudHVtdWx0IFgnOiB7XG5cdFx0XHRcdFx0XHRcdGxldCBvcGVuVXJsID1cblx0XHRcdFx0XHRcdFx0XHRyYXdvcHRzWydvcGVuLXVybCddIHx8IHJhd29wdHMudXJsIHx8IHJhd29wdHMub3BlblVybFxuXHRcdFx0XHRcdFx0XHRsZXQgbWVkaWFVcmwgPSByYXdvcHRzWydtZWRpYS11cmwnXSB8fCByYXdvcHRzLm1lZGlhVXJsXG5cdFx0XHRcdFx0XHRcdGxldCB1cGRhdGVQYXN0ZWJvYXJkID1cblx0XHRcdFx0XHRcdFx0XHRyYXdvcHRzWyd1cGRhdGUtcGFzdGVib2FyZCddIHx8IHJhd29wdHMudXBkYXRlUGFzdGVib2FyZFxuXHRcdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRcdCdvcGVuLXVybCc6IG9wZW5VcmwsXG5cdFx0XHRcdFx0XHRcdFx0J21lZGlhLXVybCc6IG1lZGlhVXJsLFxuXHRcdFx0XHRcdFx0XHRcdCd1cGRhdGUtcGFzdGVib2FyZCc6IHVwZGF0ZVBhc3RlYm9hcmRcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmICghdGhpcy5pc011dGUpIHtcblx0XHRcdHN3aXRjaCAodGhpcy5QbGF0Zm9ybSgpKSB7XG5cdFx0XHRcdGNhc2UgJ1N1cmdlJzpcblx0XHRcdFx0Y2FzZSAnTG9vbic6XG5cdFx0XHRcdGNhc2UgJ1N0YXNoJzpcblx0XHRcdFx0Y2FzZSAnU2hhZG93cm9ja2V0Jzpcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHQkbm90aWZpY2F0aW9uLnBvc3QodGl0bGUsIHN1YnQsIGRlc2MsIHRvRW52T3B0cyhvcHRzKSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlICdRdWFudHVtdWx0IFgnOlxuXHRcdFx0XHRcdCRub3RpZnkodGl0bGUsIHN1YnQsIGRlc2MsIHRvRW52T3B0cyhvcHRzKSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoIXRoaXMuaXNNdXRlTG9nKSB7XG5cdFx0XHRsZXQgbG9ncyA9IFsnJywgJz09PT09PT09PT09PT098J+To+ezu+e7n+mAmuefpfCfk6M9PT09PT09PT09PT09PSddXG5cdFx0XHRsb2dzLnB1c2godGl0bGUpXG5cdFx0XHRzdWJ0ID8gbG9ncy5wdXNoKHN1YnQpIDogJydcblx0XHRcdGRlc2MgPyBsb2dzLnB1c2goZGVzYykgOiAnJ1xuXHRcdFx0Y29uc29sZS5sb2cobG9ncy5qb2luKCdcXG4nKSlcblx0XHRcdHRoaXMubG9ncyA9IHRoaXMubG9ncy5jb25jYXQobG9ncylcblx0XHR9XG5cdH1cblxuXHRsb2coLi4ubG9ncykge1xuXHRcdGlmIChsb2dzLmxlbmd0aCA+IDApIHtcblx0XHRcdHRoaXMubG9ncyA9IFsuLi50aGlzLmxvZ3MsIC4uLmxvZ3NdXG5cdFx0fVxuXHRcdGNvbnNvbGUubG9nKGxvZ3Muam9pbih0aGlzLmxvZ1NlcGFyYXRvcikpXG5cdH1cblxuXHRsb2dFcnIoZXJyb3IpIHtcblx0XHRzd2l0Y2ggKHRoaXMuUGxhdGZvcm0oKSkge1xuXHRcdFx0Y2FzZSAnU3VyZ2UnOlxuXHRcdFx0Y2FzZSAnTG9vbic6XG5cdFx0XHRjYXNlICdTdGFzaCc6XG5cdFx0XHRjYXNlICdTaGFkb3dyb2NrZXQnOlxuXHRcdFx0Y2FzZSAnUXVhbnR1bXVsdCBYJzpcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRoaXMubG9nKCcnLCBg4p2X77iPICR7dGhpcy5uYW1lfSwg6ZSZ6K+vIWAsIGVycm9yKVxuXHRcdFx0XHRicmVha1xuXHRcdH1cblx0fVxuXG5cdHdhaXQodGltZSkge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCB0aW1lKSlcblx0fVxuXG5cdGRvbmUodmFsID0ge30pIHtcblx0XHRjb25zdCBlbmRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcblx0XHRjb25zdCBjb3N0VGltZSA9IChlbmRUaW1lIC0gdGhpcy5zdGFydFRpbWUpIC8gMTAwMFxuXHRcdHRoaXMubG9nKCcnLCBg8J+aqSAke3RoaXMubmFtZX0sIOe7k+adnyEg8J+VmyAke2Nvc3RUaW1lfSDnp5JgKVxuXHRcdHRoaXMubG9nKClcblx0XHRzd2l0Y2ggKHRoaXMuUGxhdGZvcm0oKSkge1xuXHRcdFx0Y2FzZSAnU3VyZ2UnOlxuXHRcdFx0Y2FzZSAnTG9vbic6XG5cdFx0XHRjYXNlICdTdGFzaCc6XG5cdFx0XHRjYXNlICdTaGFkb3dyb2NrZXQnOlxuXHRcdFx0Y2FzZSAnUXVhbnR1bXVsdCBYJzpcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdCRkb25lKHZhbClcblx0XHRcdFx0YnJlYWtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogR2V0IEVudmlyb25tZW50IFZhcmlhYmxlc1xuXHQgKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vVmlyZ2lsQ2x5bmUvR2V0U29tZUZyaWVzL2Jsb2IvbWFpbi9mdW5jdGlvbi9nZXRFTlYvZ2V0RU5WLmpzXG5cdCAqIEBhdXRob3IgVmlyZ2lsQ2x5bmVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGtleSAtIFBlcnNpc3RlbnQgU3RvcmUgS2V5XG5cdCAqIEBwYXJhbSB7QXJyYXl9IG5hbWVzIC0gUGxhdGZvcm0gTmFtZXNcblx0ICogQHBhcmFtIHtPYmplY3R9IGRhdGFiYXNlIC0gRGVmYXVsdCBEYXRhYmFzZVxuXHQgKiBAcmV0dXJuIHtPYmplY3R9IHsgU2V0dGluZ3MsIENhY2hlcywgQ29uZmlncyB9XG5cdCAqL1xuXHRnZXRFTlYoa2V5LCBuYW1lcywgZGF0YWJhc2UpIHtcblx0XHQvL3RoaXMubG9nKGDimJHvuI8gJHt0aGlzLm5hbWV9LCBHZXQgRW52aXJvbm1lbnQgVmFyaWFibGVzYCwgXCJcIik7XG5cdFx0LyoqKioqKioqKioqKioqKioqIEJveEpzICoqKioqKioqKioqKioqKioqL1xuXHRcdC8vIOWMheijheS4uuWxgOmDqOWPmOmHj++8jOeUqOWujOmHiuaUvuWGheWtmFxuXHRcdC8vIEJveEpz55qE5riF56m65pON5L2c6L+U5Zue5YGH5YC856m65a2X56ym5LiyLCDpgLvovpHmiJbmk43kvZznrKbkvJrlnKjlt6bkvqfmk43kvZzmlbDkuLrlgYflgLzml7bov5Tlm57lj7Pkvqfmk43kvZzmlbDjgIJcblx0XHRsZXQgQm94SnMgPSB0aGlzLmdldGpzb24oa2V5LCBkYXRhYmFzZSk7XG5cdFx0Ly90aGlzLmxvZyhg8J+apyAke3RoaXMubmFtZX0sIEdldCBFbnZpcm9ubWVudCBWYXJpYWJsZXNgLCBgQm94SnPnsbvlnos6ICR7dHlwZW9mIEJveEpzfWAsIGBCb3hKc+WGheWuuTogJHtKU09OLnN0cmluZ2lmeShCb3hKcyl9YCwgXCJcIik7XG5cdFx0LyoqKioqKioqKioqKioqKioqIEFyZ3VtZW50ICoqKioqKioqKioqKioqKioqL1xuXHRcdGxldCBBcmd1bWVudCA9IHt9O1xuXHRcdGlmICh0eXBlb2YgJGFyZ3VtZW50ICE9PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0XHRpZiAoQm9vbGVhbigkYXJndW1lbnQpKSB7XG5cdFx0XHRcdC8vdGhpcy5sb2coYPCfjokgJHt0aGlzLm5hbWV9LCAkQXJndW1lbnRgKTtcblx0XHRcdFx0bGV0IGFyZyA9IE9iamVjdC5mcm9tRW50cmllcygkYXJndW1lbnQuc3BsaXQoXCImXCIpLm1hcCgoaXRlbSkgPT4gaXRlbS5zcGxpdChcIj1cIikubWFwKGkgPT4gaS5yZXBsYWNlKC9cXFwiL2csICcnKSkpKTtcblx0XHRcdFx0Ly90aGlzLmxvZyhKU09OLnN0cmluZ2lmeShhcmcpKTtcblx0XHRcdFx0Zm9yIChsZXQgaXRlbSBpbiBhcmcpIHRoaXMuc2V0UGF0aChBcmd1bWVudCwgaXRlbSwgYXJnW2l0ZW1dKTtcblx0XHRcdFx0Ly90aGlzLmxvZyhKU09OLnN0cmluZ2lmeShBcmd1bWVudCkpO1xuXHRcdFx0fTtcblx0XHRcdC8vdGhpcy5sb2coYOKchSAke3RoaXMubmFtZX0sIEdldCBFbnZpcm9ubWVudCBWYXJpYWJsZXNgLCBgQXJndW1lbnTnsbvlnos6ICR7dHlwZW9mIEFyZ3VtZW50fWAsIGBBcmd1bWVudOWGheWuuTogJHtKU09OLnN0cmluZ2lmeShBcmd1bWVudCl9YCwgXCJcIik7XG5cdFx0fTtcblx0XHQvKioqKioqKioqKioqKioqKiogU3RvcmUgKioqKioqKioqKioqKioqKiovXG5cdFx0Y29uc3QgU3RvcmUgPSB7IFNldHRpbmdzOiBkYXRhYmFzZT8uRGVmYXVsdD8uU2V0dGluZ3MgfHwge30sIENvbmZpZ3M6IGRhdGFiYXNlPy5EZWZhdWx0Py5Db25maWdzIHx8IHt9LCBDYWNoZXM6IHt9IH07XG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KG5hbWVzKSkgbmFtZXMgPSBbbmFtZXNdO1xuXHRcdC8vdGhpcy5sb2coYPCfmqcgJHt0aGlzLm5hbWV9LCBHZXQgRW52aXJvbm1lbnQgVmFyaWFibGVzYCwgYG5hbWVz57G75Z6LOiAke3R5cGVvZiBuYW1lc31gLCBgbmFtZXPlhoXlrrk6ICR7SlNPTi5zdHJpbmdpZnkobmFtZXMpfWAsIFwiXCIpO1xuXHRcdGZvciAobGV0IG5hbWUgb2YgbmFtZXMpIHtcblx0XHRcdFN0b3JlLlNldHRpbmdzID0geyAuLi5TdG9yZS5TZXR0aW5ncywgLi4uZGF0YWJhc2U/LltuYW1lXT8uU2V0dGluZ3MsIC4uLkFyZ3VtZW50LCAuLi5Cb3hKcz8uW25hbWVdPy5TZXR0aW5ncyB9O1xuXHRcdFx0U3RvcmUuQ29uZmlncyA9IHsgLi4uU3RvcmUuQ29uZmlncywgLi4uZGF0YWJhc2U/LltuYW1lXT8uQ29uZmlncyB9O1xuXHRcdFx0aWYgKEJveEpzPy5bbmFtZV0/LkNhY2hlcyAmJiB0eXBlb2YgQm94SnM/LltuYW1lXT8uQ2FjaGVzID09PSBcInN0cmluZ1wiKSBCb3hKc1tuYW1lXS5DYWNoZXMgPSBKU09OLnBhcnNlKEJveEpzPy5bbmFtZV0/LkNhY2hlcyk7XG5cdFx0XHRTdG9yZS5DYWNoZXMgPSB7IC4uLlN0b3JlLkNhY2hlcywgLi4uQm94SnM/LltuYW1lXT8uQ2FjaGVzIH07XG5cdFx0fTtcblx0XHQvL3RoaXMubG9nKGDwn5qnICR7dGhpcy5uYW1lfSwgR2V0IEVudmlyb25tZW50IFZhcmlhYmxlc2AsIGBTdG9yZS5TZXR0aW5nc+exu+WeizogJHt0eXBlb2YgU3RvcmUuU2V0dGluZ3N9YCwgYFN0b3JlLlNldHRpbmdzOiAke0pTT04uc3RyaW5naWZ5KFN0b3JlLlNldHRpbmdzKX1gLCBcIlwiKTtcblx0XHR0aGlzLnRyYXZlcnNlT2JqZWN0KFN0b3JlLlNldHRpbmdzLCAoa2V5LCB2YWx1ZSkgPT4ge1xuXHRcdFx0Ly90aGlzLmxvZyhg8J+apyAke3RoaXMubmFtZX0sIHRyYXZlcnNlT2JqZWN0YCwgYCR7a2V5fTogJHt0eXBlb2YgdmFsdWV9YCwgYCR7a2V5fTogJHtKU09OLnN0cmluZ2lmeSh2YWx1ZSl9YCwgXCJcIik7XG5cdFx0XHRpZiAodmFsdWUgPT09IFwidHJ1ZVwiIHx8IHZhbHVlID09PSBcImZhbHNlXCIpIHZhbHVlID0gSlNPTi5wYXJzZSh2YWx1ZSk7IC8vIOWtl+espuS4sui9rEJvb2xlYW5cblx0XHRcdGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRpZiAodmFsdWUuaW5jbHVkZXMoXCIsXCIpKSB2YWx1ZSA9IHZhbHVlLnNwbGl0KFwiLFwiKS5tYXAoaXRlbSA9PiB0aGlzLnN0cmluZzJudW1iZXIoaXRlbSkpOyAvLyDlrZfnrKbkuLLovazmlbDnu4TovazmlbDlrZdcblx0XHRcdFx0ZWxzZSB2YWx1ZSA9IHRoaXMuc3RyaW5nMm51bWJlcih2YWx1ZSk7IC8vIOWtl+espuS4sui9rOaVsOWtl1xuXHRcdFx0fTtcblx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHR9KTtcblx0XHQvL3RoaXMubG9nKGDinIUgJHt0aGlzLm5hbWV9LCBHZXQgRW52aXJvbm1lbnQgVmFyaWFibGVzYCwgYFN0b3JlOiAke3R5cGVvZiBTdG9yZS5DYWNoZXN9YCwgYFN0b3Jl5YaF5a65OiAke0pTT04uc3RyaW5naWZ5KFN0b3JlKX1gLCBcIlwiKTtcblx0XHRyZXR1cm4gU3RvcmU7XG5cdH07XG5cblx0LyoqKioqKioqKioqKioqKioqIGZ1bmN0aW9uICoqKioqKioqKioqKioqKioqL1xuXHRzZXRQYXRoKG9iamVjdCwgcGF0aCwgdmFsdWUpIHsgcGF0aC5zcGxpdChcIi5cIikucmVkdWNlKChvLCBwLCBpKSA9PiBvW3BdID0gcGF0aC5zcGxpdChcIi5cIikubGVuZ3RoID09PSArK2kgPyB2YWx1ZSA6IG9bcF0gfHwge30sIG9iamVjdCkgfVxuXHR0cmF2ZXJzZU9iamVjdChvLCBjKSB7IGZvciAodmFyIHQgaW4gbykgeyB2YXIgbiA9IG9bdF07IG9bdF0gPSBcIm9iamVjdFwiID09IHR5cGVvZiBuICYmIG51bGwgIT09IG4gPyB0aGlzLnRyYXZlcnNlT2JqZWN0KG4sIGMpIDogYyh0LCBuKSB9IHJldHVybiBvIH1cblx0c3RyaW5nMm51bWJlcihzdHJpbmcpIHsgaWYgKHN0cmluZyAmJiAhaXNOYU4oc3RyaW5nKSkgc3RyaW5nID0gcGFyc2VJbnQoc3RyaW5nLCAxMCk7IHJldHVybiBzdHJpbmcgfVxufVxuXG5leHBvcnQgY2xhc3MgSHR0cCB7XG5cdGNvbnN0cnVjdG9yKGVudikge1xuXHRcdHRoaXMuZW52ID0gZW52XG5cdH1cblxuXHRzZW5kKG9wdHMsIG1ldGhvZCA9ICdHRVQnKSB7XG5cdFx0b3B0cyA9IHR5cGVvZiBvcHRzID09PSAnc3RyaW5nJyA/IHsgdXJsOiBvcHRzIH0gOiBvcHRzXG5cdFx0bGV0IHNlbmRlciA9IHRoaXMuZ2V0XG5cdFx0aWYgKG1ldGhvZCA9PT0gJ1BPU1QnKSB7XG5cdFx0XHRzZW5kZXIgPSB0aGlzLnBvc3Rcblx0XHR9XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdHNlbmRlci5jYWxsKHRoaXMsIG9wdHMsIChlcnJvciwgcmVzcG9uc2UsIGJvZHkpID0+IHtcblx0XHRcdFx0aWYgKGVycm9yKSByZWplY3QoZXJyb3IpXG5cdFx0XHRcdGVsc2UgcmVzb2x2ZShyZXNwb25zZSlcblx0XHRcdH0pXG5cdFx0fSlcblx0fVxuXG5cdGdldChvcHRzKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2VuZC5jYWxsKHRoaXMuZW52LCBvcHRzKVxuXHR9XG5cblx0cG9zdChvcHRzKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2VuZC5jYWxsKHRoaXMuZW52LCBvcHRzLCAnUE9TVCcpXG5cdH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIFVSSSB7XG5cdGNvbnN0cnVjdG9yKG9wdHMgPSBbXSkge1xuXHRcdHRoaXMubmFtZSA9IFwiVVJJIHYxLjIuNlwiO1xuXHRcdHRoaXMub3B0cyA9IG9wdHM7XG5cdFx0dGhpcy5qc29uID0geyBzY2hlbWU6IFwiXCIsIGhvc3Q6IFwiXCIsIHBhdGg6IFwiXCIsIHF1ZXJ5OiB7fSB9O1xuXHR9O1xuXG5cdHBhcnNlKHVybCkge1xuXHRcdGNvbnN0IFVSTFJlZ2V4ID0gLyg/Oig/PHNjaGVtZT4uKyk6XFwvXFwvKD88aG9zdD5bXi9dKykpP1xcLz8oPzxwYXRoPlteP10rKT9cXD8/KD88cXVlcnk+W14/XSspPy87XG5cdFx0bGV0IGpzb24gPSB1cmwubWF0Y2goVVJMUmVnZXgpPy5ncm91cHMgPz8gbnVsbDtcblx0XHRpZiAoanNvbj8ucGF0aCkganNvbi5wYXRocyA9IGpzb24ucGF0aC5zcGxpdChcIi9cIik7IGVsc2UganNvbi5wYXRoID0gXCJcIjtcblx0XHQvL2lmIChqc29uPy5wYXRocz8uYXQoLTEpPy5pbmNsdWRlcyhcIi5cIikpIGpzb24uZm9ybWF0ID0ganNvbi5wYXRocy5hdCgtMSkuc3BsaXQoXCIuXCIpLmF0KC0xKTtcblx0XHRpZiAoanNvbj8ucGF0aHMpIHtcblx0XHRcdGNvbnN0IGZpbGVOYW1lID0ganNvbi5wYXRoc1tqc29uLnBhdGhzLmxlbmd0aCAtIDFdO1xuXHRcdFx0aWYgKGZpbGVOYW1lPy5pbmNsdWRlcyhcIi5cIikpIHtcblx0XHRcdFx0Y29uc3QgbGlzdCA9IGZpbGVOYW1lLnNwbGl0KFwiLlwiKTtcblx0XHRcdFx0anNvbi5mb3JtYXQgPSBsaXN0W2xpc3QubGVuZ3RoIC0gMV07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChqc29uPy5xdWVyeSkganNvbi5xdWVyeSA9IE9iamVjdC5mcm9tRW50cmllcyhqc29uLnF1ZXJ5LnNwbGl0KFwiJlwiKS5tYXAoKHBhcmFtKSA9PiBwYXJhbS5zcGxpdChcIj1cIikpKTtcblx0XHRyZXR1cm4ganNvblxuXHR9O1xuXG5cdHN0cmluZ2lmeShqc29uID0gdGhpcy5qc29uKSB7XG5cdFx0bGV0IHVybCA9IFwiXCI7XG5cdFx0aWYgKGpzb24/LnNjaGVtZSAmJiBqc29uPy5ob3N0KSB1cmwgKz0ganNvbi5zY2hlbWUgKyBcIjovL1wiICsganNvbi5ob3N0O1xuXHRcdGlmIChqc29uPy5wYXRoKSB1cmwgKz0gKGpzb24/Lmhvc3QpID8gXCIvXCIgKyBqc29uLnBhdGggOiBqc29uLnBhdGg7XG5cdFx0aWYgKGpzb24/LnF1ZXJ5KSB1cmwgKz0gXCI/XCIgKyBPYmplY3QuZW50cmllcyhqc29uLnF1ZXJ5KS5tYXAocGFyYW0gPT4gcGFyYW0uam9pbihcIj1cIikpLmpvaW4oXCImXCIpO1xuXHRcdHJldHVybiB1cmxcblx0fTtcbn1cbiIsIi8vIHJlZmVyOiBodHRwczovL2dpdGh1Yi5jb20vUGVuZy1ZTS9RdWFuWC9ibG9iL21hc3Rlci9Ub29scy9YTUxQYXJzZXIveG1sLXBhcnNlci5qc1xuLy8gcmVmZXI6IGh0dHBzOi8vZ29lc3NuZXIubmV0L2Rvd25sb2FkL3Byai9qc29ueG1sL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgWE1MIHtcblx0I0FUVFJJQlVURV9LRVkgPSBcIkBcIjtcblx0I0NISUxEX05PREVfS0VZID0gXCIjXCI7XG5cdCNVTkVTQ0FQRSA9IHtcblx0XHRcIiZhbXA7XCI6IFwiJlwiLFxuXHRcdFwiJmx0O1wiOiBcIjxcIixcblx0XHRcIiZndDtcIjogXCI+XCIsXG5cdFx0XCImYXBvcztcIjogXCInXCIsXG5cdFx0XCImcXVvdDtcIjogJ1wiJ1xuXHR9O1xuXHQjRVNDQVBFID0ge1xuXHRcdFwiJlwiOiBcIiZhbXA7XCIsXG5cdFx0XCI8XCI6IFwiJmx0O1wiLFxuXHRcdFwiPlwiOiBcIiZndDtcIixcblx0XHRcIidcIjogXCImYXBvcztcIixcblx0XHQnXCInOiBcIiZxdW90O1wiXG5cdH07XG5cblx0Y29uc3RydWN0b3Iob3B0cykge1xuXHRcdHRoaXMubmFtZSA9IFwiWE1MIHYwLjQuMC0yXCI7XG5cdFx0dGhpcy5vcHRzID0gb3B0cztcblx0XHRCaWdJbnQucHJvdG90eXBlLnRvSlNPTiA9ICgpID0+IHRoaXMudG9TdHJpbmcoKTtcblx0fTtcblxuXHRwYXJzZSh4bWwgPSBuZXcgU3RyaW5nLCByZXZpdmVyID0gXCJcIikge1xuXHRcdGNvbnN0IFVORVNDQVBFID0gdGhpcy4jVU5FU0NBUEU7XG5cdFx0Y29uc3QgQVRUUklCVVRFX0tFWSA9IHRoaXMuI0FUVFJJQlVURV9LRVk7XG5cdFx0Y29uc3QgQ0hJTERfTk9ERV9LRVkgPSB0aGlzLiNDSElMRF9OT0RFX0tFWTtcblx0XHRjb25zdCBET00gPSB0b0RPTSh4bWwpO1xuXHRcdGxldCBqc29uID0gZnJvbVhNTChET00sIHJldml2ZXIpO1xuXHRcdHJldHVybiBqc29uO1xuXG5cdFx0LyoqKioqKioqKioqKioqKioqIEZ1Y3Rpb25zICoqKioqKioqKioqKioqKioqL1xuXHRcdGZ1bmN0aW9uIHRvRE9NKHRleHQpIHtcblx0XHRcdGNvbnN0IGxpc3QgPSB0ZXh0LnJlcGxhY2UoL15bIFxcdF0rL2dtLCBcIlwiKVxuXHRcdFx0XHQuc3BsaXQoLzwoW14hPD4/XSg/OidbXFxTXFxzXSo/J3xcIltcXFNcXHNdKj9cInxbXidcIjw+XSkqfCEoPzotLVtcXFNcXHNdKj8tLXxcXFtbXlxcW1xcXSdcIjw+XStcXFtbXFxTXFxzXSo/XV18RE9DVFlQRVteXFxbPD5dKj9cXFtbXFxTXFxzXSo/XXwoPzpFTlRJVFlbXlwiPD5dKj9cIltcXFNcXHNdKj9cIik/W1xcU1xcc10qPyl8XFw/W1xcU1xcc10qP1xcPyk+Lyk7XG5cdFx0XHRjb25zdCBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcblxuXHRcdFx0Ly8gcm9vdCBlbGVtZW50XG5cdFx0XHRjb25zdCByb290ID0geyBjaGlsZHJlbjogW10gfTtcblx0XHRcdGxldCBlbGVtID0gcm9vdDtcblxuXHRcdFx0Ly8gZG9tIHRyZWUgc3RhY2tcblx0XHRcdGNvbnN0IHN0YWNrID0gW107XG5cblx0XHRcdC8vIHBhcnNlXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDspIHtcblx0XHRcdFx0Ly8gdGV4dCBub2RlXG5cdFx0XHRcdGNvbnN0IHN0ciA9IGxpc3RbaSsrXTtcblx0XHRcdFx0aWYgKHN0cikgYXBwZW5kVGV4dChzdHIpO1xuXG5cdFx0XHRcdC8vIGNoaWxkIG5vZGVcblx0XHRcdFx0Y29uc3QgdGFnID0gbGlzdFtpKytdO1xuXHRcdFx0XHRpZiAodGFnKSBwYXJzZU5vZGUodGFnKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiByb290O1xuXHRcdFx0LyoqKioqKioqKioqKioqKioqIEZ1Y3Rpb25zICoqKioqKioqKioqKioqKioqL1xuXHRcdFx0ZnVuY3Rpb24gcGFyc2VOb2RlKHRhZykge1xuXHRcdFx0XHRjb25zdCB0YWdzID0gdGFnLnNwbGl0KFwiIFwiKTtcblx0XHRcdFx0Y29uc3QgbmFtZSA9IHRhZ3Muc2hpZnQoKTtcblx0XHRcdFx0Y29uc3QgbGVuZ3RoID0gdGFncy5sZW5ndGg7XG5cdFx0XHRcdGxldCBjaGlsZCA9IHt9O1xuXHRcdFx0XHRzd2l0Y2ggKG5hbWVbMF0pIHtcblx0XHRcdFx0XHRjYXNlIFwiL1wiOlxuXHRcdFx0XHRcdFx0Ly8gY2xvc2UgdGFnXG5cdFx0XHRcdFx0XHRjb25zdCBjbG9zZWQgPSB0YWcucmVwbGFjZSgvXlxcL3xbXFxzXFwvXS4qJC9nLCBcIlwiKS50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0XHRcdFx0d2hpbGUgKHN0YWNrLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCB0YWdOYW1lID0gZWxlbT8ubmFtZT8udG9Mb3dlckNhc2U/LigpO1xuXHRcdFx0XHRcdFx0XHRlbGVtID0gc3RhY2sucG9wKCk7XG5cdFx0XHRcdFx0XHRcdGlmICh0YWdOYW1lID09PSBjbG9zZWQpIGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBcIj9cIjpcblx0XHRcdFx0XHRcdC8vIFhNTCBkZWNsYXJhdGlvblxuXHRcdFx0XHRcdFx0Y2hpbGQubmFtZSA9IG5hbWU7XG5cdFx0XHRcdFx0XHRjaGlsZC5yYXcgPSB0YWdzLmpvaW4oXCIgXCIpO1xuXHRcdFx0XHRcdFx0YXBwZW5kQ2hpbGQoY2hpbGQpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBcIiFcIjpcblx0XHRcdFx0XHRcdGlmICgvIVxcW0NEQVRBXFxbKC4rKVxcXVxcXS8udGVzdCh0YWcpKSB7XG5cdFx0XHRcdFx0XHRcdC8vIENEQVRBIHNlY3Rpb25cblx0XHRcdFx0XHRcdFx0Y2hpbGQubmFtZSA9IFwiIUNEQVRBXCI7XG5cdFx0XHRcdFx0XHRcdC8vY2hpbGQucmF3ID0gdGFnLnNsaWNlKDksIC0yKTtcblx0XHRcdFx0XHRcdFx0Y2hpbGQucmF3ID0gdGFnLm1hdGNoKC8hXFxbQ0RBVEFcXFsoLispXFxdXFxdLyk7XG5cdFx0XHRcdFx0XHRcdC8vYXBwZW5kVGV4dCh0YWcuc2xpY2UoOSwgLTIpKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdC8vIENvbW1lbnQgc2VjdGlvblxuXHRcdFx0XHRcdFx0XHRjaGlsZC5uYW1lID0gbmFtZTtcblx0XHRcdFx0XHRcdFx0Y2hpbGQucmF3ID0gdGFncy5qb2luKFwiIFwiKTtcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRhcHBlbmRDaGlsZChjaGlsZCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0Y2hpbGQgPSBvcGVuVGFnKHRhZyk7XG5cdFx0XHRcdFx0XHRhcHBlbmRDaGlsZChjaGlsZCk7XG5cdFx0XHRcdFx0XHRzd2l0Y2ggKCh0YWdzPy5bbGVuZ3RoIC0gMV0gPz8gbmFtZSkuc2xpY2UoLTEpKSB7XG5cdFx0XHRcdFx0XHRcdGNhc2UgXCIvXCI6XG5cdFx0XHRcdFx0XHRcdFx0Ly9jaGlsZC5oYXNDaGlsZCA9IGZhbHNlOyAvLyBlbXB0eVRhZ1xuXHRcdFx0XHRcdFx0XHRcdGRlbGV0ZSBjaGlsZC5jaGlsZHJlbjsgLy8gZW1wdHlUYWdcblx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0XHRzd2l0Y2ggKG5hbWUpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJsaW5rXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vY2hpbGQuaGFzQ2hpbGQgPSBmYWxzZTsgLy8gZW1wdHlUYWdcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVsZXRlIGNoaWxkLmNoaWxkcmVuOyAvLyBlbXB0eVRhZ1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHN0YWNrLnB1c2goZWxlbSk7IC8vIG9wZW5UYWdcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZWxlbSA9IGNoaWxkO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGZ1bmN0aW9uIG9wZW5UYWcodGFnKSB7XG5cdFx0XHRcdFx0Y29uc3QgZWxlbSA9IHsgY2hpbGRyZW46IFtdIH07XG5cdFx0XHRcdFx0dGFnID0gdGFnLnJlcGxhY2UoL1xccypcXC8/JC8sIFwiXCIpO1xuXHRcdFx0XHRcdGNvbnN0IHBvcyA9IHRhZy5zZWFyY2goL1tcXHM9J1wiXFwvXS8pO1xuXHRcdFx0XHRcdGlmIChwb3MgPCAwKSB7XG5cdFx0XHRcdFx0XHRlbGVtLm5hbWUgPSB0YWc7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGVsZW0ubmFtZSA9IHRhZy5zdWJzdHIoMCwgcG9zKTtcblx0XHRcdFx0XHRcdGVsZW0udGFnID0gdGFnLnN1YnN0cihwb3MpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gZWxlbTtcblx0XHRcdFx0fTtcblx0XHRcdH07XG5cblx0XHRcdGZ1bmN0aW9uIGFwcGVuZFRleHQoc3RyKSB7XG5cdFx0XHRcdC8vc3RyID0gcmVtb3ZlU3BhY2VzKHN0cik7XG5cdFx0XHRcdHN0ciA9IHJlbW92ZUJyZWFrTGluZShzdHIpO1xuXHRcdFx0XHQvL3N0ciA9IHN0cj8udHJpbT8uKCk7XG5cdFx0XHRcdGlmIChzdHIpIGFwcGVuZENoaWxkKHVuZXNjYXBlWE1MKHN0cikpO1xuXG5cdFx0XHRcdGZ1bmN0aW9uIHJlbW92ZUJyZWFrTGluZShzdHIpIHtcblx0XHRcdFx0XHRyZXR1cm4gc3RyPy5yZXBsYWNlPy4oL14oXFxyXFxufFxccnxcXG58XFx0KSt8KFxcclxcbnxcXHJ8XFxufFxcdCkrJC9nLCBcIlwiKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBhcHBlbmRDaGlsZChjaGlsZCkge1xuXHRcdFx0XHRlbGVtLmNoaWxkcmVuLnB1c2goY2hpbGQpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0LyoqKioqKioqKioqKioqKioqIEZ1Y3Rpb25zICoqKioqKioqKioqKioqKioqL1xuXHRcdGZ1bmN0aW9uIGZyb21QbGlzdChlbGVtLCByZXZpdmVyKSB7XG5cdFx0XHRsZXQgb2JqZWN0O1xuXHRcdFx0c3dpdGNoICh0eXBlb2YgZWxlbSkge1xuXHRcdFx0XHRjYXNlIFwic3RyaW5nXCI6XG5cdFx0XHRcdGNhc2UgXCJ1bmRlZmluZWRcIjpcblx0XHRcdFx0XHRvYmplY3QgPSBlbGVtO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwib2JqZWN0XCI6XG5cdFx0XHRcdFx0Ly9kZWZhdWx0OlxuXHRcdFx0XHRcdGNvbnN0IG5hbWUgPSBlbGVtLm5hbWU7XG5cdFx0XHRcdFx0Y29uc3QgY2hpbGRyZW4gPSBlbGVtLmNoaWxkcmVuO1xuXG5cdFx0XHRcdFx0b2JqZWN0ID0ge307XG5cblx0XHRcdFx0XHRzd2l0Y2ggKG5hbWUpIHtcblx0XHRcdFx0XHRcdGNhc2UgXCJwbGlzdFwiOlxuXHRcdFx0XHRcdFx0XHRsZXQgcGxpc3QgPSBmcm9tUGxpc3QoY2hpbGRyZW5bMF0sIHJldml2ZXIpO1xuXHRcdFx0XHRcdFx0XHRvYmplY3QgPSBPYmplY3QuYXNzaWduKG9iamVjdCwgcGxpc3QpXG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSBcImRpY3RcIjpcblx0XHRcdFx0XHRcdFx0bGV0IGRpY3QgPSBjaGlsZHJlbi5tYXAoY2hpbGQgPT4gZnJvbVBsaXN0KGNoaWxkLCByZXZpdmVyKSk7XG5cdFx0XHRcdFx0XHRcdGRpY3QgPSBjaHVuayhkaWN0LCAyKTtcblx0XHRcdFx0XHRcdFx0b2JqZWN0ID0gT2JqZWN0LmZyb21FbnRyaWVzKGRpY3QpO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgXCJhcnJheVwiOlxuXHRcdFx0XHRcdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkob2JqZWN0KSkgb2JqZWN0ID0gW107XG5cdFx0XHRcdFx0XHRcdG9iamVjdCA9IGNoaWxkcmVuLm1hcChjaGlsZCA9PiBmcm9tUGxpc3QoY2hpbGQsIHJldml2ZXIpKTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIFwia2V5XCI6XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGtleSA9IGNoaWxkcmVuWzBdO1xuXHRcdFx0XHRcdFx0XHRvYmplY3QgPSBrZXk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSBcInRydWVcIjpcblx0XHRcdFx0XHRcdGNhc2UgXCJmYWxzZVwiOlxuXHRcdFx0XHRcdFx0XHRjb25zdCBib29sZWFuID0gbmFtZTtcblx0XHRcdFx0XHRcdFx0b2JqZWN0ID0gSlNPTi5wYXJzZShib29sZWFuKTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIFwiaW50ZWdlclwiOlxuXHRcdFx0XHRcdFx0XHRjb25zdCBpbnRlZ2VyID0gY2hpbGRyZW5bMF07XG5cdFx0XHRcdFx0XHRcdC8vb2JqZWN0ID0gcGFyc2VJbnQoaW50ZWdlcik7XG5cdFx0XHRcdFx0XHRcdG9iamVjdCA9IEJpZ0ludChpbnRlZ2VyKTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIFwicmVhbFwiOlxuXHRcdFx0XHRcdFx0XHRjb25zdCByZWFsID0gY2hpbGRyZW5bMF07XG5cdFx0XHRcdFx0XHRcdC8vY29uc3QgZGlnaXRzID0gcmVhbC5zcGxpdChcIi5cIilbMV0/Lmxlbmd0aCB8fCAwO1xuXHRcdFx0XHRcdFx0XHRvYmplY3QgPSBwYXJzZUZsb2F0KHJlYWwpLy8udG9GaXhlZChkaWdpdHMpO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgXCJzdHJpbmdcIjpcblx0XHRcdFx0XHRcdFx0Y29uc3Qgc3RyaW5nID0gY2hpbGRyZW5bMF07XG5cdFx0XHRcdFx0XHRcdG9iamVjdCA9IHN0cmluZztcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRpZiAocmV2aXZlcikgb2JqZWN0ID0gcmV2aXZlcihuYW1lIHx8IFwiXCIsIG9iamVjdCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gb2JqZWN0O1xuXG5cdFx0XHQvKiogXG5cdFx0XHQgKiBDaHVuayBBcnJheVxuXHRcdFx0ICogQGF1dGhvciBWaXJnaWxDbHluZVxuXHRcdFx0ICogQHBhcmFtIHtBcnJheX0gc291cmNlIC0gc291cmNlXG5cdFx0XHQgKiBAcGFyYW0ge051bWJlcn0gbGVuZ3RoIC0gbnVtYmVyXG5cdFx0XHQgKiBAcmV0dXJuIHtBcnJheTwqPn0gdGFyZ2V0XG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIGNodW5rKHNvdXJjZSwgbGVuZ3RoKSB7XG5cdFx0XHRcdHZhciBpbmRleCA9IDAsIHRhcmdldCA9IFtdO1xuXHRcdFx0XHR3aGlsZSAoaW5kZXggPCBzb3VyY2UubGVuZ3RoKSB0YXJnZXQucHVzaChzb3VyY2Uuc2xpY2UoaW5kZXgsIGluZGV4ICs9IGxlbmd0aCkpO1xuXHRcdFx0XHRyZXR1cm4gdGFyZ2V0O1xuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBmcm9tWE1MKGVsZW0sIHJldml2ZXIpIHtcblx0XHRcdGxldCBvYmplY3Q7XG5cdFx0XHRzd2l0Y2ggKHR5cGVvZiBlbGVtKSB7XG5cdFx0XHRcdGNhc2UgXCJzdHJpbmdcIjpcblx0XHRcdFx0Y2FzZSBcInVuZGVmaW5lZFwiOlxuXHRcdFx0XHRcdG9iamVjdCA9IGVsZW07XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJvYmplY3RcIjpcblx0XHRcdFx0XHQvL2RlZmF1bHQ6XG5cdFx0XHRcdFx0Y29uc3QgcmF3ID0gZWxlbS5yYXc7XG5cdFx0XHRcdFx0Y29uc3QgbmFtZSA9IGVsZW0ubmFtZTtcblx0XHRcdFx0XHRjb25zdCB0YWcgPSBlbGVtLnRhZztcblx0XHRcdFx0XHRjb25zdCBjaGlsZHJlbiA9IGVsZW0uY2hpbGRyZW47XG5cblx0XHRcdFx0XHRpZiAocmF3KSBvYmplY3QgPSByYXc7XG5cdFx0XHRcdFx0ZWxzZSBpZiAodGFnKSBvYmplY3QgPSBwYXJzZUF0dHJpYnV0ZSh0YWcsIHJldml2ZXIpO1xuXHRcdFx0XHRcdGVsc2UgaWYgKCFjaGlsZHJlbikgb2JqZWN0ID0geyBbbmFtZV06IHVuZGVmaW5lZCB9O1xuXHRcdFx0XHRcdGVsc2Ugb2JqZWN0ID0ge307XG5cblx0XHRcdFx0XHRpZiAobmFtZSA9PT0gXCJwbGlzdFwiKSBvYmplY3QgPSBPYmplY3QuYXNzaWduKG9iamVjdCwgZnJvbVBsaXN0KGNoaWxkcmVuWzBdLCByZXZpdmVyKSk7XG5cdFx0XHRcdFx0ZWxzZSBjaGlsZHJlbj8uZm9yRWFjaD8uKChjaGlsZCwgaSkgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBjaGlsZCA9PT0gXCJzdHJpbmdcIikgYWRkT2JqZWN0KG9iamVjdCwgQ0hJTERfTk9ERV9LRVksIGZyb21YTUwoY2hpbGQsIHJldml2ZXIpLCB1bmRlZmluZWQpXG5cdFx0XHRcdFx0XHRlbHNlIGlmICghY2hpbGQudGFnICYmICFjaGlsZC5jaGlsZHJlbiAmJiAhY2hpbGQucmF3KSBhZGRPYmplY3Qob2JqZWN0LCBjaGlsZC5uYW1lLCBmcm9tWE1MKGNoaWxkLCByZXZpdmVyKSwgY2hpbGRyZW4/LltpIC0gMV0/Lm5hbWUpXG5cdFx0XHRcdFx0XHRlbHNlIGFkZE9iamVjdChvYmplY3QsIGNoaWxkLm5hbWUsIGZyb21YTUwoY2hpbGQsIHJldml2ZXIpLCB1bmRlZmluZWQpXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0aWYgKGNoaWxkcmVuICYmIGNoaWxkcmVuLmxlbmd0aCA9PT0gMCkgYWRkT2JqZWN0KG9iamVjdCwgQ0hJTERfTk9ERV9LRVksIG51bGwsIHVuZGVmaW5lZCk7XG5cdFx0XHRcdFx0Lypcblx0XHRcdFx0XHRpZiAoT2JqZWN0LmtleXMob2JqZWN0KS5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0XHRcdGlmIChlbGVtLm5hbWUpIG9iamVjdFtlbGVtLm5hbWVdID0gKGVsZW0uaGFzQ2hpbGQgPT09IGZhbHNlKSA/IG51bGwgOiBcIlwiO1xuXHRcdFx0XHRcdFx0ZWxzZSBvYmplY3QgPSAoZWxlbS5oYXNDaGlsZCA9PT0gZmFsc2UpID8gbnVsbCA6IFwiXCI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdCovXG5cblx0XHRcdFx0XHQvL2lmIChPYmplY3Qua2V5cyhvYmplY3QpLmxlbmd0aCA9PT0gMCkgYWRkT2JqZWN0KG9iamVjdCwgZWxlbS5uYW1lLCAoZWxlbS5oYXNDaGlsZCA9PT0gZmFsc2UpID8gbnVsbCA6IFwiXCIpO1xuXHRcdFx0XHRcdC8vaWYgKE9iamVjdC5rZXlzKG9iamVjdCkubGVuZ3RoID09PSAwKSBvYmplY3QgPSAoZWxlbS5oYXNDaGlsZCA9PT0gZmFsc2UpID8gdW5kZWZpbmVkIDogXCJcIjtcblx0XHRcdFx0XHRpZiAocmV2aXZlcikgb2JqZWN0ID0gcmV2aXZlcihuYW1lIHx8IFwiXCIsIG9iamVjdCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gb2JqZWN0O1xuXHRcdFx0LyoqKioqKioqKioqKioqKioqIEZ1Y3Rpb25zICoqKioqKioqKioqKioqKioqL1xuXHRcdFx0ZnVuY3Rpb24gcGFyc2VBdHRyaWJ1dGUodGFnLCByZXZpdmVyKSB7XG5cdFx0XHRcdGlmICghdGFnKSByZXR1cm47XG5cdFx0XHRcdGNvbnN0IGxpc3QgPSB0YWcuc3BsaXQoLyhbXlxccz0nXCJdKyg/Olxccyo9XFxzKig/OidbXFxTXFxzXSo/J3xcIltcXFNcXHNdKj9cInxbXlxccydcIl0qKSk/KS8pO1xuXHRcdFx0XHRjb25zdCBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcblx0XHRcdFx0bGV0IGF0dHJpYnV0ZXMsIHZhbDtcblxuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0bGV0IHN0ciA9IHJlbW92ZVNwYWNlcyhsaXN0W2ldKTtcblx0XHRcdFx0XHQvL2xldCBzdHIgPSByZW1vdmVCcmVha0xpbmUobGlzdFtpXSk7XG5cdFx0XHRcdFx0Ly9sZXQgc3RyID0gbGlzdFtpXT8udHJpbT8uKCk7XG5cdFx0XHRcdFx0aWYgKCFzdHIpIGNvbnRpbnVlO1xuXG5cdFx0XHRcdFx0aWYgKCFhdHRyaWJ1dGVzKSB7XG5cdFx0XHRcdFx0XHRhdHRyaWJ1dGVzID0ge307XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y29uc3QgcG9zID0gc3RyLmluZGV4T2YoXCI9XCIpO1xuXHRcdFx0XHRcdGlmIChwb3MgPCAwKSB7XG5cdFx0XHRcdFx0XHQvLyBiYXJlIGF0dHJpYnV0ZVxuXHRcdFx0XHRcdFx0c3RyID0gQVRUUklCVVRFX0tFWSArIHN0cjtcblx0XHRcdFx0XHRcdHZhbCA9IG51bGw7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdC8vIGF0dHJpYnV0ZSBrZXkvdmFsdWUgcGFpclxuXHRcdFx0XHRcdFx0dmFsID0gc3RyLnN1YnN0cihwb3MgKyAxKS5yZXBsYWNlKC9eXFxzKy8sIFwiXCIpO1xuXHRcdFx0XHRcdFx0c3RyID0gQVRUUklCVVRFX0tFWSArIHN0ci5zdWJzdHIoMCwgcG9zKS5yZXBsYWNlKC9cXHMrJC8sIFwiXCIpO1xuXG5cdFx0XHRcdFx0XHQvLyBxdW90ZTogZm9vPVwiRk9PXCIgYmFyPSdCQVInXG5cdFx0XHRcdFx0XHRjb25zdCBmaXJzdENoYXIgPSB2YWxbMF07XG5cdFx0XHRcdFx0XHRjb25zdCBsYXN0Q2hhciA9IHZhbFt2YWwubGVuZ3RoIC0gMV07XG5cdFx0XHRcdFx0XHRpZiAoZmlyc3RDaGFyID09PSBsYXN0Q2hhciAmJiAoZmlyc3RDaGFyID09PSBcIidcIiB8fCBmaXJzdENoYXIgPT09ICdcIicpKSB7XG5cdFx0XHRcdFx0XHRcdHZhbCA9IHZhbC5zdWJzdHIoMSwgdmFsLmxlbmd0aCAtIDIpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHR2YWwgPSB1bmVzY2FwZVhNTCh2YWwpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAocmV2aXZlcikgdmFsID0gcmV2aXZlcihzdHIsIHZhbCk7XG5cblx0XHRcdFx0XHRhZGRPYmplY3QoYXR0cmlidXRlcywgc3RyLCB2YWwpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIGF0dHJpYnV0ZXM7XG5cblx0XHRcdFx0ZnVuY3Rpb24gcmVtb3ZlU3BhY2VzKHN0cikge1xuXHRcdFx0XHRcdC8vcmV0dXJuIHN0ciAmJiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgXCJcIik7XG5cdFx0XHRcdFx0cmV0dXJuIHN0cj8udHJpbT8uKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gYWRkT2JqZWN0KG9iamVjdCwga2V5LCB2YWwsIHByZXZLZXkgPSBrZXkpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiB2YWwgPT09IFwidW5kZWZpbmVkXCIpIHJldHVybjtcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Y29uc3QgcHJldiA9IG9iamVjdFtwcmV2S2V5XTtcblx0XHRcdFx0XHQvL2NvbnN0IGN1cnIgPSBvYmplY3Rba2V5XTtcblx0XHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShwcmV2KSkgcHJldi5wdXNoKHZhbCk7XG5cdFx0XHRcdFx0ZWxzZSBpZiAocHJldikgb2JqZWN0W3ByZXZLZXldID0gW3ByZXYsIHZhbF07XG5cdFx0XHRcdFx0ZWxzZSBvYmplY3Rba2V5XSA9IHZhbDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHVuZXNjYXBlWE1MKHN0cikge1xuXHRcdFx0cmV0dXJuIHN0ci5yZXBsYWNlKC8oJig/Omx0fGd0fGFtcHxhcG9zfHF1b3R8Iyg/OlxcZHsxLDZ9fHhbMC05YS1mQS1GXXsxLDV9KSk7KS9nLCBmdW5jdGlvbiAoc3RyKSB7XG5cdFx0XHRcdGlmIChzdHJbMV0gPT09IFwiI1wiKSB7XG5cdFx0XHRcdFx0Y29uc3QgY29kZSA9IChzdHJbMl0gPT09IFwieFwiKSA/IHBhcnNlSW50KHN0ci5zdWJzdHIoMyksIDE2KSA6IHBhcnNlSW50KHN0ci5zdWJzdHIoMiksIDEwKTtcblx0XHRcdFx0XHRpZiAoY29kZSA+IC0xKSByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gVU5FU0NBUEVbc3RyXSB8fCBzdHI7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0fTtcblxuXHRzdHJpbmdpZnkoanNvbiA9IG5ldyBPYmplY3QsIHRhYiA9IFwiXCIpIHtcblx0XHRjb25zdCBFU0NBUEUgPSB0aGlzLiNFU0NBUEU7XG5cdFx0Y29uc3QgQVRUUklCVVRFX0tFWSA9IHRoaXMuI0FUVFJJQlVURV9LRVk7XG5cdFx0Y29uc3QgQ0hJTERfTk9ERV9LRVkgPSB0aGlzLiNDSElMRF9OT0RFX0tFWTtcblx0XHRsZXQgWE1MID0gXCJcIjtcblx0XHRmb3IgKGxldCBlbGVtIGluIGpzb24pIFhNTCArPSB0b1htbChqc29uW2VsZW1dLCBlbGVtLCBcIlwiKTtcblx0XHRYTUwgPSB0YWIgPyBYTUwucmVwbGFjZSgvXFx0L2csIHRhYikgOiBYTUwucmVwbGFjZSgvXFx0fFxcbi9nLCBcIlwiKTtcblx0XHRyZXR1cm4gWE1MO1xuXHRcdC8qKioqKioqKioqKioqKioqKiBGdWN0aW9ucyAqKioqKioqKioqKioqKioqKi9cblx0XHRmdW5jdGlvbiB0b1htbChFbGVtLCBOYW1lLCBJbmQpIHtcblx0XHRcdGxldCB4bWwgPSBcIlwiO1xuXHRcdFx0c3dpdGNoICh0eXBlb2YgRWxlbSkge1xuXHRcdFx0XHRjYXNlIFwib2JqZWN0XCI6XG5cdFx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoRWxlbSkpIHtcblx0XHRcdFx0XHRcdHhtbCA9IEVsZW0ucmVkdWNlKFxuXHRcdFx0XHRcdFx0XHQocHJldlhNTCwgY3VyclhNTCkgPT4gcHJldlhNTCArPSBgJHtJbmR9JHt0b1htbChjdXJyWE1MLCBOYW1lLCBgJHtJbmR9XFx0YCl9XFxuYCxcblx0XHRcdFx0XHRcdFx0XCJcIlxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0bGV0IGF0dHJpYnV0ZSA9IFwiXCI7XG5cdFx0XHRcdFx0XHRsZXQgaGFzQ2hpbGQgPSBmYWxzZTtcblx0XHRcdFx0XHRcdGZvciAobGV0IG5hbWUgaW4gRWxlbSkge1xuXHRcdFx0XHRcdFx0XHRpZiAobmFtZVswXSA9PT0gQVRUUklCVVRFX0tFWSkge1xuXHRcdFx0XHRcdFx0XHRcdGF0dHJpYnV0ZSArPSBgICR7bmFtZS5zdWJzdHJpbmcoMSl9PVxcXCIke0VsZW1bbmFtZV0udG9TdHJpbmcoKX1cXFwiYDtcblx0XHRcdFx0XHRcdFx0XHRkZWxldGUgRWxlbVtuYW1lXTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChFbGVtW25hbWVdID09PSB1bmRlZmluZWQpIE5hbWUgPSBuYW1lO1xuXHRcdFx0XHRcdFx0XHRlbHNlIGhhc0NoaWxkID0gdHJ1ZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHhtbCArPSBgJHtJbmR9PCR7TmFtZX0ke2F0dHJpYnV0ZX0keyhoYXNDaGlsZCB8fCBOYW1lID09PSBcImxpbmtcIikgPyBcIlwiIDogXCIvXCJ9PmA7XG5cblx0XHRcdFx0XHRcdGlmIChoYXNDaGlsZCkge1xuXHRcdFx0XHRcdFx0XHRpZiAoTmFtZSA9PT0gXCJwbGlzdFwiKSB4bWwgKz0gdG9QbGlzdChFbGVtLCBOYW1lLCBgJHtJbmR9XFx0YCk7XG5cdFx0XHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdGZvciAobGV0IG5hbWUgaW4gRWxlbSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0c3dpdGNoIChuYW1lKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgQ0hJTERfTk9ERV9LRVk6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0eG1sICs9IEVsZW1bbmFtZV0gPz8gXCJcIjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR4bWwgKz0gdG9YbWwoRWxlbVtuYW1lXSwgbmFtZSwgYCR7SW5kfVxcdGApO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHR4bWwgKz0gKHhtbC5zbGljZSgtMSkgPT09IFwiXFxuXCIgPyBJbmQgOiBcIlwiKSArIGA8LyR7TmFtZX0+YDtcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcInN0cmluZ1wiOlxuXHRcdFx0XHRcdHN3aXRjaCAoTmFtZSkge1xuXHRcdFx0XHRcdFx0Y2FzZSBcIj94bWxcIjpcblx0XHRcdFx0XHRcdFx0eG1sICs9IGAke0luZH08JHtOYW1lfSAke0VsZW0udG9TdHJpbmcoKX0+YDtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIFwiP1wiOlxuXHRcdFx0XHRcdFx0XHR4bWwgKz0gYCR7SW5kfTwke05hbWV9JHtFbGVtLnRvU3RyaW5nKCl9JHtOYW1lfT5gO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgXCIhXCI6XG5cdFx0XHRcdFx0XHRcdHhtbCArPSBgJHtJbmR9PCEtLSR7RWxlbS50b1N0cmluZygpfS0tPmA7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSBcIiFET0NUWVBFXCI6XG5cdFx0XHRcdFx0XHRcdHhtbCArPSBgJHtJbmR9PCR7TmFtZX0gJHtFbGVtLnRvU3RyaW5nKCl9PmA7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSBcIiFDREFUQVwiOlxuXHRcdFx0XHRcdFx0XHR4bWwgKz0gYCR7SW5kfTwhW0NEQVRBWyR7RWxlbS50b1N0cmluZygpfV1dPmA7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSBDSElMRF9OT0RFX0tFWTpcblx0XHRcdFx0XHRcdFx0eG1sICs9IEVsZW07XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0eG1sICs9IGAke0luZH08JHtOYW1lfT4ke0VsZW0udG9TdHJpbmcoKX08LyR7TmFtZX0+YDtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcInVuZGVmaW5lZFwiOlxuXHRcdFx0XHRcdHhtbCArPSBJbmQgKyBgPCR7TmFtZS50b1N0cmluZygpfS8+YDtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4geG1sO1xuXHRcdH07XG5cblx0XHRmdW5jdGlvbiB0b1BsaXN0KEVsZW0sIE5hbWUsIEluZCkge1xuXHRcdFx0bGV0IHBsaXN0ID0gXCJcIjtcblx0XHRcdHN3aXRjaCAodHlwZW9mIEVsZW0pIHtcblx0XHRcdFx0Y2FzZSBcImJvb2xlYW5cIjpcblx0XHRcdFx0XHRwbGlzdCA9IGAke0luZH08JHtFbGVtLnRvU3RyaW5nKCl9Lz5gO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwibnVtYmVyXCI6XG5cdFx0XHRcdFx0cGxpc3QgPSBgJHtJbmR9PHJlYWw+JHtFbGVtLnRvU3RyaW5nKCl9PC9yZWFsPmA7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJiaWdpbnRcIjpcblx0XHRcdFx0XHRwbGlzdCA9IGAke0luZH08aW50ZWdlcj4ke0VsZW0udG9TdHJpbmcoKX08L2ludGVnZXI+YDtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcInN0cmluZ1wiOlxuXHRcdFx0XHRcdHBsaXN0ID0gYCR7SW5kfTxzdHJpbmc+JHtFbGVtLnRvU3RyaW5nKCl9PC9zdHJpbmc+YDtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcIm9iamVjdFwiOlxuXHRcdFx0XHRcdGxldCBhcnJheSA9IFwiXCI7XG5cdFx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoRWxlbSkpIHtcblx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAwLCBuID0gRWxlbS5sZW5ndGg7IGkgPCBuOyBpKyspIGFycmF5ICs9IGAke0luZH0ke3RvUGxpc3QoRWxlbVtpXSwgTmFtZSwgYCR7SW5kfVxcdGApfWA7XG5cdFx0XHRcdFx0XHRwbGlzdCA9IGAke0luZH08YXJyYXk+JHthcnJheX0ke0luZH08L2FycmF5PmA7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGxldCBkaWN0ID0gXCJcIjtcblx0XHRcdFx0XHRcdE9iamVjdC5lbnRyaWVzKEVsZW0pLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRkaWN0ICs9IGAke0luZH08a2V5PiR7a2V5fTwva2V5PmA7XG5cdFx0XHRcdFx0XHRcdGRpY3QgKz0gdG9QbGlzdCh2YWx1ZSwga2V5LCBJbmQpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRwbGlzdCA9IGAke0luZH08ZGljdD4ke2RpY3R9JHtJbmR9PC9kaWN0PmA7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHRcdHJldHVybiBwbGlzdDtcblx0XHR9O1xuXHR9O1xufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsInZhciBnZXRQcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZiA/IChvYmopID0+IChPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKSkgOiAob2JqKSA9PiAob2JqLl9fcHJvdG9fXyk7XG52YXIgbGVhZlByb3RvdHlwZXM7XG4vLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3Rcbi8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuLy8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4vLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3Rcbi8vIG1vZGUgJiAxNjogcmV0dXJuIHZhbHVlIHdoZW4gaXQncyBQcm9taXNlLWxpa2Vcbi8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbl9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG5cdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IHRoaXModmFsdWUpO1xuXHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuXHRpZih0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlKSB7XG5cdFx0aWYoKG1vZGUgJiA0KSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG5cdFx0aWYoKG1vZGUgJiAxNikgJiYgdHlwZW9mIHZhbHVlLnRoZW4gPT09ICdmdW5jdGlvbicpIHJldHVybiB2YWx1ZTtcblx0fVxuXHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuXHR2YXIgZGVmID0ge307XG5cdGxlYWZQcm90b3R5cGVzID0gbGVhZlByb3RvdHlwZXMgfHwgW251bGwsIGdldFByb3RvKHt9KSwgZ2V0UHJvdG8oW10pLCBnZXRQcm90byhnZXRQcm90byldO1xuXHRmb3IodmFyIGN1cnJlbnQgPSBtb2RlICYgMiAmJiB2YWx1ZTsgdHlwZW9mIGN1cnJlbnQgPT0gJ29iamVjdCcgJiYgIX5sZWFmUHJvdG90eXBlcy5pbmRleE9mKGN1cnJlbnQpOyBjdXJyZW50ID0gZ2V0UHJvdG8oY3VycmVudCkpIHtcblx0XHRPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhjdXJyZW50KS5mb3JFYWNoKChrZXkpID0+IChkZWZba2V5XSA9ICgpID0+ICh2YWx1ZVtrZXldKSkpO1xuXHR9XG5cdGRlZlsnZGVmYXVsdCddID0gKCkgPT4gKHZhbHVlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBkZWYpO1xuXHRyZXR1cm4gbnM7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIvKlxuUkVBRE1FOiBodHRwczovL2dpdGh1Yi5jb20vVmlyZ2lsQ2x5bmUvaVJpbmdvXG4qL1xuXG5pbXBvcnQgRU5WcyBmcm9tIFwiLi9FTlYvRU5WLm1qc1wiO1xuaW1wb3J0IFVSSXMgZnJvbSBcIi4vVVJJL1VSSS5tanNcIjtcbmltcG9ydCBYTUxzIGZyb20gXCIuL1hNTC9YTUwubWpzXCI7XG5cbmltcG9ydCAqIGFzIERlZmF1bHQgZnJvbSBcIi4vZGF0YWJhc2UvRGVmYXVsdC5qc29uXCI7XG5pbXBvcnQgKiBhcyBMb2NhdGlvbiBmcm9tIFwiLi9kYXRhYmFzZS9Mb2NhdGlvbi5qc29uXCI7XG5pbXBvcnQgKiBhcyBOZXdzIGZyb20gXCIuL2RhdGFiYXNlL05ld3MuanNvblwiO1xuaW1wb3J0ICogYXMgUHJpdmF0ZVJlbGF5IGZyb20gXCIuL2RhdGFiYXNlL1ByaXZhdGVSZWxheS5qc29uXCI7XG5pbXBvcnQgKiBhcyBTaXJpIGZyb20gXCIuL2RhdGFiYXNlL1NpcmkuanNvblwiO1xuaW1wb3J0ICogYXMgVGVzdEZsaWdodCBmcm9tIFwiLi9kYXRhYmFzZS9UZXN0RmxpZ2h0Lmpzb25cIjtcbmltcG9ydCAqIGFzIFRWIGZyb20gXCIuL2RhdGFiYXNlL1RWLmpzb25cIjtcblxuY29uc3QgJCA9IG5ldyBFTlZzKFwi76O/IGlSaW5nbzog8J+TjSBMb2NhdGlvbiB2My4xLjUoMSkgcmVzcG9uc2UuYmV0YVwiKTtcbmNvbnN0IFVSSSA9IG5ldyBVUklzKCk7XG5jb25zdCBYTUwgPSBuZXcgWE1McygpO1xuY29uc3QgRGF0YUJhc2UgPSB7XG5cdFwiRGVmYXVsdFwiOiBEZWZhdWx0LFxuXHRcIkxvY2F0aW9uXCI6IExvY2F0aW9uLFxuXHRcIk5ld3NcIjogTmV3cyxcblx0XCJQcml2YXRlUmVsYXlcIjogUHJpdmF0ZVJlbGF5LFxuXHRcIlNpcmlcIjogU2lyaSxcblx0XCJUZXN0RmxpZ2h0XCI6IFRlc3RGbGlnaHQsXG5cdFwiVFZcIjogVFYsXG59O1xuXG4vKioqKioqKioqKioqKioqKiogUHJvY2Vzc2luZyAqKioqKioqKioqKioqKioqKi9cbi8vIOino+aehFVSTFxuY29uc3QgVVJMID0gVVJJLnBhcnNlKCRyZXF1ZXN0LnVybCk7XG4kLmxvZyhg4pqgICR7JC5uYW1lfWAsIGBVUkw6ICR7SlNPTi5zdHJpbmdpZnkoVVJMKX1gLCBcIlwiKTtcbi8vIOiOt+WPlui/nuaOpeWPguaVsFxuY29uc3QgTUVUSE9EID0gJHJlcXVlc3QubWV0aG9kLCBIT1NUID0gVVJMLmhvc3QsIFBBVEggPSBVUkwucGF0aCwgUEFUSHMgPSBVUkwucGF0aHM7XG4kLmxvZyhg4pqgICR7JC5uYW1lfWAsIGBNRVRIT0Q6ICR7TUVUSE9EfWAsIFwiXCIpO1xuLy8g6Kej5p6Q5qC85byPXG5jb25zdCBGT1JNQVQgPSAoJHJlc3BvbnNlLmhlYWRlcnM/LltcIkNvbnRlbnQtVHlwZVwiXSA/PyAkcmVzcG9uc2UuaGVhZGVycz8uW1wiY29udGVudC10eXBlXCJdKT8uc3BsaXQoXCI7XCIpPy5bMF07XG4kLmxvZyhg4pqgICR7JC5uYW1lfWAsIGBGT1JNQVQ6ICR7Rk9STUFUfWAsIFwiXCIpO1xuKGFzeW5jICgpID0+IHtcblx0Y29uc3QgeyBTZXR0aW5ncywgQ2FjaGVzLCBDb25maWdzIH0gPSBzZXRFTlYoXCJpUmluZ29cIiwgXCJMb2NhdGlvblwiLCBEYXRhQmFzZSk7XG5cdCQubG9nKGDimqAgJHskLm5hbWV9YCwgYFNldHRpbmdzLlN3aXRjaDogJHtTZXR0aW5ncz8uU3dpdGNofWAsIFwiXCIpO1xuXHRzd2l0Y2ggKFNldHRpbmdzLlN3aXRjaCkge1xuXHRcdGNhc2UgdHJ1ZTpcblx0XHRkZWZhdWx0OlxuXHRcdFx0Ly8g5Yib5bu656m65pWw5o2uXG5cdFx0XHRsZXQgYm9keSA9IHt9O1xuXHRcdFx0Ly8g5qC85byP5Yik5patXG5cdFx0XHRzd2l0Y2ggKEZPUk1BVCkge1xuXHRcdFx0XHRjYXNlIHVuZGVmaW5lZDogLy8g6KeG5Li65pegYm9keVxuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCI6XG5cdFx0XHRcdGNhc2UgXCJ0ZXh0L3BsYWluXCI6XG5cdFx0XHRcdGNhc2UgXCJ0ZXh0L2h0bWxcIjpcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRzd2l0Y2ggKEhPU1QpIHtcblx0XHRcdFx0XHRcdGNhc2UgXCJnc3BlMS1zc2wubHMuYXBwbGUuY29tXCI6XG5cdFx0XHRcdFx0XHRcdHN3aXRjaCAoUEFUSCkge1xuXHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJwZXAvZ2NjXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRhd2FpdCBzZXRHQ0MoXCJwZXBcIiwgQ2FjaGVzKTtcblx0XHRcdFx0XHRcdFx0XHRcdHN3aXRjaCAoU2V0dGluZ3MuUEVQLkdDQykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiQVVUT1wiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCRyZXNwb25zZS5ib2R5ID0gU2V0dGluZ3MuUEVQLkdDQztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3gtbXBlZ1VSTFwiOlxuXHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24veC1tcGVndXJsXCI6XG5cdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi92bmQuYXBwbGUubXBlZ3VybFwiOlxuXHRcdFx0XHRjYXNlIFwiYXVkaW8vbXBlZ3VybFwiOlxuXHRcdFx0XHRcdC8vYm9keSA9IE0zVTgucGFyc2UoJHJlc3BvbnNlLmJvZHkpO1xuXHRcdFx0XHRcdC8vJC5sb2coYPCfmqcgJHskLm5hbWV9YCwgYGJvZHk6ICR7SlNPTi5zdHJpbmdpZnkoYm9keSl9YCwgXCJcIik7XG5cdFx0XHRcdFx0Ly8kcmVzcG9uc2UuYm9keSA9IE0zVTguc3RyaW5naWZ5KGJvZHkpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwidGV4dC94bWxcIjpcblx0XHRcdFx0Y2FzZSBcInRleHQvcGxpc3RcIjpcblx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3htbFwiOlxuXHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24vcGxpc3RcIjpcblx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3gtcGxpc3RcIjpcblx0XHRcdFx0XHQkLmxvZyhg8J+apyAkeyQubmFtZX1gLCBgYm9keTogJHtib2R5fWAsIFwiXCIpO1xuXHRcdFx0XHRcdC8vYm9keSA9IGF3YWl0IFBMSVNUcyhcInBsaXN0Mmpzb25cIiwgJHJlc3BvbnNlLmJvZHkpO1xuXHRcdFx0XHRcdGJvZHkgPSBYTUwucGFyc2UoJHJlc3BvbnNlLmJvZHkpO1xuXHRcdFx0XHRcdCQubG9nKGDwn5qnICR7JC5uYW1lfWAsIGBib2R5OiAke0pTT04uc3RyaW5naWZ5KGJvZHkpfWAsIFwiXCIpO1xuXHRcdFx0XHRcdC8vIOS4u+acuuWIpOaWrVxuXHRcdFx0XHRcdHN3aXRjaCAoSE9TVCkge1xuXHRcdFx0XHRcdFx0Y2FzZSBcImNvbmZpZ3VyYXRpb24ubHMuYXBwbGUuY29tXCI6XG5cdFx0XHRcdFx0XHRcdC8vIOi3r+W+hOWIpOaWrVxuXHRcdFx0XHRcdFx0XHRzd2l0Y2ggKFBBVEgpIHtcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiY29uZmlnL2RlZmF1bHRzXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBQTElTVCA9IGJvZHkucGxpc3Q7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoUExJU1QpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gc2V0IHNldHRpbmdzXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vIENOXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFBMSVNUW1wiY29tLmFwcGxlLkdFT1wiXS5Db3VudHJ5UHJvdmlkZXJzLkNOLlNob3VsZEVuYWJsZUxhZ3VuYUJlYWNoID0gU2V0dGluZ3M/LkNvbmZpZz8uRGVmYXVsdHM/LkxhZ3VuYUJlYWNoID8/IHRydWU7IC8vIFhYXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFBMSVNUW1wiY29tLmFwcGxlLkdFT1wiXS5Db3VudHJ5UHJvdmlkZXJzLkNOLkRyaXZpbmdNdWx0aVdheXBvaW50Um91dGVzRW5hYmxlZCA9IFNldHRpbmdzPy5Db25maWc/LkRlZmF1bHRzPy5Ecml2aW5nTXVsdGlXYXlwb2ludFJvdXRlc0VuYWJsZWQgPz8gdHJ1ZTsgLy8g6am+6am25a+86Iiq6YCU5b6E54K5XG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vUExJU1RbXCJjb20uYXBwbGUuR0VPXCJdLkNvdW50cnlQcm92aWRlcnMuQ04uRW5hYmxlQWxiZXJ0YSA9IGZhbHNlOyAvLyBDTlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQvL1BMSVNUW1wiY29tLmFwcGxlLkdFT1wiXS5Db3VudHJ5UHJvdmlkZXJzLkNOLkVuYWJsZUNsaWVudERyYXBlZFZlY3RvclBvbHlnb25zID0gZmFsc2U7IC8vIENOXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFBMSVNUW1wiY29tLmFwcGxlLkdFT1wiXS5Db3VudHJ5UHJvdmlkZXJzLkNOLkdFT0FkZHJlc3NDb3JyZWN0aW9uRW5hYmxlZCA9IFNldHRpbmdzPy5Db25maWc/LkRlZmF1bHRzPy5HRU9BZGRyZXNzQ29ycmVjdGlvbiA/PyB0cnVlOyAvLyBDTlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoU2V0dGluZ3M/LkNvbmZpZz8uRGVmYXVsdHM/Lkxvb2t1cE1heFBhcmFtZXRlcnNDb3VudCA/PyB0cnVlKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVsZXRlIFBMSVNUW1wiY29tLmFwcGxlLkdFT1wiXS5Db3VudHJ5UHJvdmlkZXJzLkNOLkdFT0JhdGNoU3BhdGlhbEV2ZW50TG9va3VwTWF4UGFyYW1ldGVyc0NvdW50IC8vIENOXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVsZXRlIFBMSVNUW1wiY29tLmFwcGxlLkdFT1wiXS5Db3VudHJ5UHJvdmlkZXJzLkNOLkdFT0JhdGNoU3BhdGlhbFBsYWNlTG9va3VwTWF4UGFyYW1ldGVyc0NvdW50IC8vIENOXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0UExJU1RbXCJjb20uYXBwbGUuR0VPXCJdLkNvdW50cnlQcm92aWRlcnMuQ04uTG9jYWxpdGllc0FuZExhbmRtYXJrc1N1cHBvcnRlZCA9IFNldHRpbmdzPy5Db25maWc/LkRlZmF1bHRzPy5Mb2NhbGl0aWVzQW5kTGFuZG1hcmtzID8/IHRydWU7IC8vIENOXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vUExJU1RbXCJjb20uYXBwbGUuR0VPXCJdLkNvdW50cnlQcm92aWRlcnMuQ04uTmF2aWdhdGlvblNob3dIZWFkaW5nS2V5ID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0UExJU1RbXCJjb20uYXBwbGUuR0VPXCJdLkNvdW50cnlQcm92aWRlcnMuQ04uUE9JQnVzeW5lc3NEaWZmZXJlbnRpYWxQcml2YWN5ID0gU2V0dGluZ3M/LkNvbmZpZz8uRGVmYXVsdHM/LlBPSUJ1c3luZXNzID8/IHRydWU7IC8vIENOXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFBMSVNUW1wiY29tLmFwcGxlLkdFT1wiXS5Db3VudHJ5UHJvdmlkZXJzLkNOLlBPSUJ1c3luZXNzUmVhbFRpbWUgPSBTZXR0aW5ncz8uQ29uZmlnPy5EZWZhdWx0cz8uUE9JQnVzeW5lc3MgPz8gdHJ1ZTsgLy8gQ05cblx0XHRcdFx0XHRcdFx0XHRcdFx0UExJU1RbXCJjb20uYXBwbGUuR0VPXCJdLkNvdW50cnlQcm92aWRlcnMuQ04uVHJhbnNpdFBheUVuYWJsZWQgPSBTZXR0aW5ncz8uQ29uZmlnPy5EZWZhdWx0cz8uVHJhbnNpdFBheUVuYWJsZWQgPz8gdHJ1ZTsgLy8gQ05cblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9QTElTVFtcImNvbS5hcHBsZS5HRU9cIl0uQ291bnRyeVByb3ZpZGVycy5DTi5XaUZpUXVhbGl0eU5ldHdvcmtEaXNhYmxlZCA9IFNldHRpbmdzPy5Db25maWc/LkRlZmF1bHRzPy5XaUZpUXVhbGl0eU5ldHdvcmtEaXNhYmxlZCA/PyB0cnVlOyAvLyBDTlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQvL1BMSVNUW1wiY29tLmFwcGxlLkdFT1wiXS5Db3VudHJ5UHJvdmlkZXJzLkNOLldpRmlRdWFsaXR5VGlsZURpc2FibGVkID0gU2V0dGluZ3M/LkNvbmZpZz8uRGVmYXVsdHM/LldpRmlRdWFsaXR5VGlsZURpc2FibGVkID8/IHRydWU7IC8vIENOXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFBMSVNUW1wiY29tLmFwcGxlLkdFT1wiXS5Db3VudHJ5UHJvdmlkZXJzLkNOLlN1cHBvcnRzT2ZmbGluZSA9IFNldHRpbmdzPy5Db25maWc/LkRlZmF1bHRzPy5TdXBwb3J0c09mZmxpbmUgPz8gdHJ1ZTsgLy8gQ05cblx0XHRcdFx0XHRcdFx0XHRcdFx0UExJU1RbXCJjb20uYXBwbGUuR0VPXCJdLkNvdW50cnlQcm92aWRlcnMuQ04uU3VwcG9ydHNDYXJJbnRlZ3JhdGlvbiA9IFNldHRpbmdzPy5Db25maWc/LkRlZmF1bHRzPy5TdXBwb3J0c0NhckludGVncmF0aW9uID8/IHRydWU7IC8vIENOXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vIFRXXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vUExJU1RbXCJjb20uYXBwbGUuR0VPXCJdLkNvdW50cnlQcm92aWRlcnMuQ04uR0VPU2hvdWxkU3BlYWtXcml0dGVuQWRkcmVzc2VzID0gdHJ1ZTsgLy8gVFdcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9QTElTVFtcImNvbS5hcHBsZS5HRU9cIl0uQ291bnRyeVByb3ZpZGVycy5DTi5HRU9TaG91bGRTcGVha1dyaXR0ZW5QbGFjZU5hbWVzID0gdHJ1ZTsgLy8gVFdcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gVVNcblx0XHRcdFx0XHRcdFx0XHRcdFx0UExJU1RbXCJjb20uYXBwbGUuR0VPXCJdLkNvdW50cnlQcm92aWRlcnMuQ05bXCI2Njk0OTgyZDJiMTRlOTU4MTVlNDRlOTcwMjM1ZTIzMFwiXSA9IFNldHRpbmdzPy5Db25maWc/LkRlZmF1bHRzPy5bXCI2Njk0OTgyZDJiMTRlOTU4MTVlNDRlOTcwMjM1ZTIzMFwiXSA/PyB0cnVlOyAvLyBVU1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRQTElTVFtcImNvbS5hcHBsZS5HRU9cIl0uQ291bnRyeVByb3ZpZGVycy5DTi5QZWRlc3RyaWFuQVJFbmFibGVkID0gU2V0dGluZ3M/LkNvbmZpZz8uRGVmYXVsdHM/LlBlZGVzdHJpYW5BUiA/PyB0cnVlOyAvLyDnjrDlrp7kuJbnlYzkuK3nmoTnur/ot69cblx0XHRcdFx0XHRcdFx0XHRcdFx0UExJU1RbXCJjb20uYXBwbGUuR0VPXCJdLkNvdW50cnlQcm92aWRlcnMuQ04uT3B0aWNhbEhlYWRpbmdFbmFibGVkID0gU2V0dGluZ3M/LkNvbmZpZz8uRGVmYXVsdHM/Lk9wdGljYWxIZWFkaW5nID8/IHRydWU7IC8vIOS4vui1t+S7peafpeeci1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRQTElTVFtcImNvbS5hcHBsZS5HRU9cIl0uQ291bnRyeVByb3ZpZGVycy5DTi5Vc2VDTFBlZGVzdHJpYW5NYXBNYXRjaGVkTG9jYXRpb25zID0gU2V0dGluZ3M/LkNvbmZpZz8uRGVmYXVsdHM/LlVzZUNMUGVkZXN0cmlhbk1hcE1hdGNoZWRMb2NhdGlvbnMgPz8gdHJ1ZTsgLy8g5a+86Iiq5YeG56Gu5oCnLeWinuW8ulxuXHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdCQubG9nKGDwn5qnICR7JC5uYW1lfWAsIGBib2R5OiAke0pTT04uc3RyaW5naWZ5KGJvZHkpfWAsIFwiXCIpO1xuXHRcdFx0XHRcdC8vJHJlc3BvbnNlLmJvZHkgPSBhd2FpdCBQTElTVHMoXCJqc29uMnBsaXN0XCIsIGJvZHkpOyAvLyBqc29uMnBsaXN0XG5cdFx0XHRcdFx0JHJlc3BvbnNlLmJvZHkgPSBYTUwuc3RyaW5naWZ5KGJvZHkpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwidGV4dC92dHRcIjpcblx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3Z0dFwiOlxuXHRcdFx0XHRcdC8vYm9keSA9IFZUVC5wYXJzZSgkcmVzcG9uc2UuYm9keSk7XG5cdFx0XHRcdFx0Ly8kLmxvZyhg8J+apyAkeyQubmFtZX1gLCBgYm9keTogJHtKU09OLnN0cmluZ2lmeShib2R5KX1gLCBcIlwiKTtcblx0XHRcdFx0XHQvLyRyZXNwb25zZS5ib2R5ID0gVlRULnN0cmluZ2lmeShib2R5KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcInRleHQvanNvblwiOlxuXHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24vanNvblwiOlxuXHRcdFx0XHRcdGJvZHkgPSBKU09OLnBhcnNlKCRyZXNwb25zZS5ib2R5ID8/IFwie31cIik7XG5cdFx0XHRcdFx0JC5sb2coYPCfmqcgJHskLm5hbWV9YCwgYGJvZHk6ICR7SlNPTi5zdHJpbmdpZnkoYm9keSl9YCwgXCJcIik7XG5cdFx0XHRcdFx0JHJlc3BvbnNlLmJvZHkgPSBKU09OLnN0cmluZ2lmeShib2R5KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3Byb3RvYnVmXCI6XG5cdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi94LXByb3RvYnVmXCI6XG5cdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi92bmQuZ29vZ2xlLnByb3RvYnVmXCI6XG5cdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi9ncnBjXCI6XG5cdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi9ncnBjK3Byb3RvXCI6XG5cdFx0XHRcdGNhc2UgXCJhcHBsZWNhdGlvbi9vY3RldC1zdHJlYW1cIjpcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH07XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIGZhbHNlOlxuXHRcdFx0YnJlYWs7XG5cdH07XG59KSgpXG5cdC5jYXRjaCgoZSkgPT4gJC5sb2dFcnIoZSkpXG5cdC5maW5hbGx5KCgpID0+IHtcblx0XHRzd2l0Y2ggKCRyZXNwb25zZSkge1xuXHRcdFx0ZGVmYXVsdDogeyAvLyDmnInlm57lpI3mlbDmja7vvIzov5Tlm57lm57lpI3mlbDmja5cblx0XHRcdFx0Ly9jb25zdCBGT1JNQVQgPSAoJHJlc3BvbnNlPy5oZWFkZXJzPy5bXCJDb250ZW50LVR5cGVcIl0gPz8gJHJlc3BvbnNlPy5oZWFkZXJzPy5bXCJjb250ZW50LXR5cGVcIl0pPy5zcGxpdChcIjtcIik/LlswXTtcblx0XHRcdFx0JC5sb2coYPCfjokgJHskLm5hbWV9LCBmaW5hbGx5YCwgYCRyZXNwb25zZWAsIGBGT1JNQVQ6ICR7Rk9STUFUfWAsIFwiXCIpO1xuXHRcdFx0XHQvLyQubG9nKGDwn5qnICR7JC5uYW1lfSwgZmluYWxseWAsIGAkcmVzcG9uc2U6ICR7SlNPTi5zdHJpbmdpZnkoJHJlc3BvbnNlKX1gLCBcIlwiKTtcblx0XHRcdFx0aWYgKCRyZXNwb25zZT8uaGVhZGVycz8uW1wiQ29udGVudC1FbmNvZGluZ1wiXSkgJHJlc3BvbnNlLmhlYWRlcnNbXCJDb250ZW50LUVuY29kaW5nXCJdID0gXCJpZGVudGl0eVwiO1xuXHRcdFx0XHRpZiAoJHJlc3BvbnNlPy5oZWFkZXJzPy5bXCJjb250ZW50LWVuY29kaW5nXCJdKSAkcmVzcG9uc2UuaGVhZGVyc1tcImNvbnRlbnQtZW5jb2RpbmdcIl0gPSBcImlkZW50aXR5XCI7XG5cdFx0XHRcdGlmICgkLmlzUXVhblgoKSkge1xuXHRcdFx0XHRcdHN3aXRjaCAoRk9STUFUKSB7XG5cdFx0XHRcdFx0XHRjYXNlIHVuZGVmaW5lZDogLy8g6KeG5Li65pegYm9keVxuXHRcdFx0XHRcdFx0XHQvLyDov5Tlm57mma7pgJrmlbDmja5cblx0XHRcdFx0XHRcdFx0JC5kb25lKHsgc3RhdHVzOiAkcmVzcG9uc2Uuc3RhdHVzLCBoZWFkZXJzOiAkcmVzcG9uc2UuaGVhZGVycyB9KTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHQvLyDov5Tlm57mma7pgJrmlbDmja5cblx0XHRcdFx0XHRcdFx0JC5kb25lKHsgc3RhdHVzOiAkcmVzcG9uc2Uuc3RhdHVzLCBoZWFkZXJzOiAkcmVzcG9uc2UuaGVhZGVycywgYm9keTogJHJlc3BvbnNlLmJvZHkgfSk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3Byb3RvYnVmXCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24veC1wcm90b2J1ZlwiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3ZuZC5nb29nbGUucHJvdG9idWZcIjpcblx0XHRcdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi9ncnBjXCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24vZ3JwYytwcm90b1wiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxlY2F0aW9uL29jdGV0LXN0cmVhbVwiOlxuXHRcdFx0XHRcdFx0XHQvLyDov5Tlm57kuozov5vliLbmlbDmja5cblx0XHRcdFx0XHRcdFx0Ly8kLmxvZyhgJHskcmVzcG9uc2UuYm9keUJ5dGVzLmJ5dGVMZW5ndGh9LS0tJHskcmVzcG9uc2UuYm9keUJ5dGVzLmJ1ZmZlci5ieXRlTGVuZ3RofWApO1xuXHRcdFx0XHRcdFx0XHQkLmRvbmUoeyBzdGF0dXM6ICRyZXNwb25zZS5zdGF0dXMsIGhlYWRlcnM6ICRyZXNwb25zZS5oZWFkZXJzLCBib2R5Qnl0ZXM6ICRyZXNwb25zZS5ib2R5Qnl0ZXMuYnVmZmVyLnNsaWNlKCRyZXNwb25zZS5ib2R5Qnl0ZXMuYnl0ZU9mZnNldCwgJHJlc3BvbnNlLmJvZHlCeXRlcy5ieXRlTGVuZ3RoICsgJHJlc3BvbnNlLmJvZHlCeXRlcy5ieXRlT2Zmc2V0KSB9KTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fSBlbHNlICQuZG9uZSgkcmVzcG9uc2UpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH07XG5cdFx0XHRjYXNlIHVuZGVmaW5lZDogeyAvLyDml6Dlm57lpI3mlbDmja5cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9O1xuXHRcdH07XG5cdH0pXG5cbi8qKioqKioqKioqKioqKioqKiBGdW5jdGlvbiAqKioqKioqKioqKioqKioqKi9cbi8qKlxuICogU2V0IEVudmlyb25tZW50IFZhcmlhYmxlc1xuICogQGF1dGhvciBWaXJnaWxDbHluZVxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgLSBQZXJzaXN0ZW50IFN0b3JlIEtleVxuICogQHBhcmFtIHtBcnJheX0gcGxhdGZvcm1zIC0gUGxhdGZvcm0gTmFtZXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhYmFzZSAtIERlZmF1bHQgRGF0YUJhc2VcbiAqIEByZXR1cm4ge09iamVjdH0geyBTZXR0aW5ncywgQ2FjaGVzLCBDb25maWdzIH1cbiAqL1xuZnVuY3Rpb24gc2V0RU5WKG5hbWUsIHBsYXRmb3JtcywgZGF0YWJhc2UpIHtcblx0JC5sb2coYOKYke+4jyAkeyQubmFtZX0sIFNldCBFbnZpcm9ubWVudCBWYXJpYWJsZXNgLCBcIlwiKTtcblx0bGV0IHsgU2V0dGluZ3MsIENhY2hlcywgQ29uZmlncyB9ID0gJC5nZXRFTlYobmFtZSwgcGxhdGZvcm1zLCBkYXRhYmFzZSk7XG5cdC8qKioqKioqKioqKioqKioqKiBTZXR0aW5ncyAqKioqKioqKioqKioqKioqKi9cblx0JC5sb2coYOKchSAkeyQubmFtZX0sIFNldCBFbnZpcm9ubWVudCBWYXJpYWJsZXNgLCBgU2V0dGluZ3M6ICR7dHlwZW9mIFNldHRpbmdzfWAsIGBTZXR0aW5nc+WGheWuuTogJHtKU09OLnN0cmluZ2lmeShTZXR0aW5ncyl9YCwgXCJcIik7XG5cdC8qKioqKioqKioqKioqKioqKiBDYWNoZXMgKioqKioqKioqKioqKioqKiovXG5cdC8vJC5sb2coYOKchSAkeyQubmFtZX0sIFNldCBFbnZpcm9ubWVudCBWYXJpYWJsZXNgLCBgQ2FjaGVzOiAke3R5cGVvZiBDYWNoZXN9YCwgYENhY2hlc+WGheWuuTogJHtKU09OLnN0cmluZ2lmeShDYWNoZXMpfWAsIFwiXCIpO1xuXHQvKioqKioqKioqKioqKioqKiogQ29uZmlncyAqKioqKioqKioqKioqKioqKi9cblx0Q29uZmlncy5TdG9yZWZyb250ID0gbmV3IE1hcChDb25maWdzLlN0b3JlZnJvbnQpO1xuXHRyZXR1cm4geyBTZXR0aW5ncywgQ2FjaGVzLCBDb25maWdzIH07XG59O1xuXG4vKipcbiAqIFNldCBHQ0NcbiAqIEBhdXRob3IgVmlyZ2lsQ2x5bmVcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gQ29uZmlnIE5hbWVcbiAqIEBwYXJhbSB7T2JqZWN0fSBjYWNoZXMgLSBDYWNoZXNcbiAqIEByZXR1cm4ge1Byb21pc2U8Kj59XG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHNldEdDQyhuYW1lLCBjYWNoZXMpIHtcblx0JC5sb2coYOKaoCAkeyQubmFtZX0sIFNldCBHQ0NgLCBgY2FjaGVzLiR7bmFtZX0uZ2NjID0gJHtjYWNoZXM/LltuYW1lXT8uZ2NjfWAsIFwiXCIpO1xuXHRpZiAoJHJlc3BvbnNlLmJvZHkgIT09IGNhY2hlcz8uW25hbWVdPy5nY2MpIHtcblx0XHRsZXQgbmV3Q2FjaGVzID0gY2FjaGVzO1xuXHRcdG5ld0NhY2hlc1tuYW1lXSA9IHsgXCJnY2NcIjogJHJlc3BvbnNlLmJvZHkgfTtcblx0XHQkLnNldGpzb24obmV3Q2FjaGVzLCBcIkBpUmluZ28uTG9jYXRpb24uQ2FjaGVzXCIpO1xuXHR9XG5cdHJldHVybiAkLmxvZyhg8J+OiSAkeyQubmFtZX0sIFNldCBHQ0NgLCBgY2FjaGVzLiR7bmFtZX0uZ2NjID0gJHtjYWNoZXM/LltuYW1lXT8uZ2NjfWAsIFwiXCIpO1xufTtcblxuLyoqXG4gKiBQYXJzZSBQbGlzdFxuICogQGF1dGhvciBWaXJnaWxDbHluZVxuICogQHR5cGVkZWYgeyBcImpzb24ycGxpc3RcIiB8IFwicGxpc3QyanNvblwiIH0gb3B0XG4gKiBAcGFyYW0ge29wdH0gb3B0IC0gZG8gdHlwZXNcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmcgLSBzdHJpbmdcbiAqIEByZXR1cm4ge1Byb21pc2U8Kj59XG4gKi9cbmFzeW5jIGZ1bmN0aW9uIFBMSVNUcyhvcHQsIHN0cmluZykge1xuXHRjb25zdCByZXF1ZXN0ID0ge1xuXHRcdFwidXJsXCI6IFwiaHR0cHM6Ly9qc29uMnBsaXN0Lm5hbm9jYXQubWUvY29udmVydC5waHBcIixcblx0XHRcImhlYWRlcnNcIjoge1xuXHRcdFx0XCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7IGNoYXJzZXQ9VVRGLThcIixcblx0XHRcdFwiQWNjZXB0XCI6IFwidGV4dC9qYXZhc2NyaXB0LCB0ZXh0L2h0bWwsIGFwcGxpY2F0aW9uL3htbCwgdGV4dC94bWwsICovKlwiLFxuXHRcdH0sXG5cdFx0XCJib2R5XCI6IGBkbz0ke29wdH0mY29udGVudD1gICsgZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZylcblx0fTtcblx0cmV0dXJuIGF3YWl0ICQuaHR0cC5wb3N0KHJlcXVlc3QpLnRoZW4odiA9PiB2LmJvZHkpO1xufTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==