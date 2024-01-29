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
/*!********************************!*\
  !*** ./src/TV.request.beta.js ***!
  \********************************/
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
/* harmony import */ var _function_setENV_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./function/setENV.mjs */ "./src/function/setENV.mjs");
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













const $ = new _ENV_ENV_mjs__WEBPACK_IMPORTED_MODULE_0__["default"](" iRingo: 📺 TV v3.2.2(1) request.beta");
const URI = new _URI_URI_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]();
const DataBase = {
	"Default": /*#__PURE__*/ (_database_Default_json__WEBPACK_IMPORTED_MODULE_3___namespace_cache || (_database_Default_json__WEBPACK_IMPORTED_MODULE_3___namespace_cache = __webpack_require__.t(_database_Default_json__WEBPACK_IMPORTED_MODULE_3__, 2))),
	"Location": /*#__PURE__*/ (_database_Location_json__WEBPACK_IMPORTED_MODULE_4___namespace_cache || (_database_Location_json__WEBPACK_IMPORTED_MODULE_4___namespace_cache = __webpack_require__.t(_database_Location_json__WEBPACK_IMPORTED_MODULE_4__, 2))),
	"News": /*#__PURE__*/ (_database_News_json__WEBPACK_IMPORTED_MODULE_5___namespace_cache || (_database_News_json__WEBPACK_IMPORTED_MODULE_5___namespace_cache = __webpack_require__.t(_database_News_json__WEBPACK_IMPORTED_MODULE_5__, 2))),
	"PrivateRelay": /*#__PURE__*/ (_database_PrivateRelay_json__WEBPACK_IMPORTED_MODULE_6___namespace_cache || (_database_PrivateRelay_json__WEBPACK_IMPORTED_MODULE_6___namespace_cache = __webpack_require__.t(_database_PrivateRelay_json__WEBPACK_IMPORTED_MODULE_6__, 2))),
	"Siri": /*#__PURE__*/ (_database_Siri_json__WEBPACK_IMPORTED_MODULE_7___namespace_cache || (_database_Siri_json__WEBPACK_IMPORTED_MODULE_7___namespace_cache = __webpack_require__.t(_database_Siri_json__WEBPACK_IMPORTED_MODULE_7__, 2))),
	"TestFlight": /*#__PURE__*/ (_database_TestFlight_json__WEBPACK_IMPORTED_MODULE_8___namespace_cache || (_database_TestFlight_json__WEBPACK_IMPORTED_MODULE_8___namespace_cache = __webpack_require__.t(_database_TestFlight_json__WEBPACK_IMPORTED_MODULE_8__, 2))),
	"TV": /*#__PURE__*/ (_database_TV_json__WEBPACK_IMPORTED_MODULE_9___namespace_cache || (_database_TV_json__WEBPACK_IMPORTED_MODULE_9___namespace_cache = __webpack_require__.t(_database_TV_json__WEBPACK_IMPORTED_MODULE_9__, 2))),
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
	const { Settings, Caches, Configs } = (0,_function_setENV_mjs__WEBPACK_IMPORTED_MODULE_2__["default"])("iRingo", "TV", DataBase);
	$.log(`⚠ ${$.name}`, `Settings.Switch: ${Settings?.Switch}`, "");
	switch (Settings.Switch) {
		case true:
		default:
			// 创建空数据
			let body = {};
			// 设置默认类型
			let Type = "Other";
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
							// 主机判断
							switch (HOST) {
								case "uts-api.itunes.apple.com":
									// 路径判断
									switch (PATH) {
										case "uts/v3/favorite-people":
										case "uts/v3/favorite-teams":
										case "uts/v2/favorites":
										case "uts/v2/favorites/add":
										case "uts/v2/favorites/remove":
											Type = "Sports";
											if ($request.body) $request.body = $request.body.replace(/sf=[\d]{6}/, `sf=${Configs.Storefront.get(Settings.CountryCode[Type])}`);
											break;
									};
									break;
							};
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
							//body = XML.parse($request.body);
							//$.log(`🚧 ${$.name}`, `body: ${JSON.stringify(body)}`, "");
							//$request.body = XML.stringify(body);
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
							// 主机判断
							switch (HOST) {
								case "uts-api.itunes.apple.com":
									// 路径判断
									switch (PATH) {
										case "uts/v3/user/settings":
											Type = "Settings";
											$.log(`🚧 ${$.name}, 调试信息`, JSON.stringify(body), "")
											break;
									};
									break;
								case "umc-tempo-api.apple.com":
									// 路径判断
									switch (PATH) {
										case "v3/channels/scoreboard":
										case "v3/channels/scoreboard/":
											Type = "Sports";
											$.log(`🚧 ${$.name}, 调试信息`, JSON.stringify(body), "")
											break;
									};
									break;
							};
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
						case "uts-api.itunes.apple.com":
							const Version = parseInt(URL.query?.v, 10), Platform = URL.query?.pfm, Locale = ($request.headers?.["X-Apple-I-Locale"] ?? $request.headers?.["x-apple-i-locale"])?.split('_')?.[0] ?? "zh";
							// 路径判断
							switch (PATH) {
								case "uts/v3/configurations":
									Type = "Configs";
									if (Settings.CountryCode[Type] !== "AUTO") {
										if (URL.query.region) URL.query.region = Settings.CountryCode[Type] ?? URL.query.region;
										if (URL.query.country) URL.query.country = Settings.CountryCode[Type] ?? URL.query.country;
										if (URL.query.sfh) URL.query.sfh = URL.query.sfh.replace(/\d{6}/, Configs.Storefront.get(Settings.CountryCode[Type]));
									};
									$.log(`🚧 ${$.name}, 调试信息`, `region = ${URL.query?.region}, country = ${URL.query?.country}, sfh = ${URL.query?.sfh}`, "")
									break;
								case "uts/v3/user/settings":
									Type = "Settings";
									$.log(`🚧 ${$.name}, 调试信息`, `caller = ${URL.query?.caller}, pfm = ${URL.query?.pfm}, sf = ${URL.query?.sf}`, "")
									break;
								case "uts/v3/canvases/Roots/watchNow":
								case "uts/v3/canvases/roots/tahoma_watchnow":
								case "uts/v3/shelves/uts.col.UpNext":
									Type = "WatchNow";
									if (Settings["Third-Party"]) URL.query.pfm = (Platform === "desktop") ? "appletv" : Platform;
									break;
								case "uts/v3/canvases/Channels/tvs.sbd.4000":
								case "uts/v3/shelves/uts.col.ChannelUpNext.tvs.sbd.4000":
								case "uts/v2/brands/appleTvPlus":
									Type = "Originals";
									break;
								case "uts/v3/canvases/Channels/tvs.sbd.7000":
								case "uts/v3/shelves/uts.col.ChannelUpNext.tvs.sbd.7000":
								case "uts/v3/shelves/edt.col.63bf2052-50b9-44c8-a67e-30e196e19c60":
									Type = "Originals";
									break;	
								case "uts/v3/channels":
								case "uts/v2/brands":
									Type = "Channels";
									break;
								case "uts/v3/canvases/Roots/sports":
								case "uts/v3/shelves/uts.col.PersonalizedLiveSports":
								case "uts/v3/clock-scores":
								case "uts/v3/leagues":
								case "uts/v2/sports/clockscore":
								case "uts/v2/sports/competitors":
								case "uts/v2/sports/league":
								case "uts/v2/sports/leagues":
								case "uts/v2/sports/statsIdLookup":
								case "uts/v2/sports/teamsNearMe":
								case "uts/v3/canvases/Rooms/edt.item.633e0768-2135-43ac-a878-28965b853ec5": // FIFA World Cup 2022
								case "uts/v3/canvases/Rooms/edt.item.635968ac-89d7-4619-8f5d-8c7890aef813": // NFL THANKSGIVING 2022
								case "uts/v3/canvases/Rooms/edt.item.62327df1-6874-470e-98b2-a5bbeac509a2": // Friday Night Baseball - MLB - Apple TV+
									Type = "Sports";
									//if (Settings["Third-Party"]) 
									URL.query.pfm = (Platform === "desktop") ? "ipad" : Platform;
									break;
								case "uts/v3/canvases/Roots/kids":
									Type = "Kids";
									break;
								case "uts/v3/canvases/Roots/store":
								case "uts/v3/canvases/Roots/tahoma_store":
									Type = "Store";
									break;
								case "uts/v3/canvases/Roots/movies":
									Type = "Movies";
									if (Settings["Third-Party"]) URL.query.pfm = (Platform === "desktop") ? "ipad" : Platform;
									break;
								case "uts/v3/canvases/Roots/tv":
									Type = "TV";
									if (Settings["Third-Party"]) URL.query.pfm = (Platform === "desktop") ? "ipad" : Platform;
									break;
								case "uts/v3/favorite-people":
								case "uts/v3/favorite-teams":
								case "uts/v2/favorites":
								case "uts/v2/favorites/add":
								case "uts/v2/favorites/remove":
									Type = "Sports";
									break;
								case "uts/v3/canvases/Roots/tahoma_searchlanding":
								case "uts/v3/search":
								case "uts/v3/search/landing":
								case "uts/v2/search/incremental":
								case "uts/v2/search/landing":
									Type = "Search";
									break;
								case "uts/v3/watchlist":
								case "uts/v2/watchlist/contains":
								case "uts/v2/watchlist/search":
									if (Settings["Third-Party"]) URL.query.pfm = (Platform === "desktop") ? "ipad" : Platform;
									break;
								default:
									//if (Settings["Third-Party"]) URL.query.pfm = (Platform === "desktop") ? "ipad" : Platform;
									if (URL.query?.ctx_brand === "tvs.sbd.4000") Type = "Originals";
									else if (PATH.includes("uts/v3/canvases/Channels/")) Type = "Channels";
									else if (PATH.includes("uts/v2/brands/")) Type = "Channels";
									else if (PATH.includes("uts/v3/movies/")) Type = "Movies";
									else if (PATH.includes("uts/v3/shows/")) Type = "TV";
									else if (PATH.includes("uts/v3/sporting-events/")) {
										Type = "Sports";
										//if (Settings["Third-Party"])
										URL.query.pfm = (Platform === "desktop") ? "ipad" : Platform;
									}
									else if (PATH.includes("uts/v3/canvases/Sports/")) {
										Type = "Sports";
										//if (Settings["Third-Party"])
										URL.query.pfm = (Platform === "desktop") ? "ipad" : Platform;
									}
									else if (PATH.includes("uts/v3/canvases/Persons/")) Type = "Persons";
									else if (PATH.includes("uts/v3/canvases/Rooms/")) Type = "Others";
									//else if (PATH.includes("uts/v3/playables/")) Type = "Others";
									//else if (PATH.includes("uts/v3/shelves/")) Type = "Others";
									else Type = "Others";
									break;
							};
							break;
						case "umc-tempo-api.apple.com":
							switch (PATH) {
								case "v3/register":
								case "v3/channels/scoreboard":
								case "v3/channels/scoreboard/":
									Type = "Sports";
									break;
								default:
									if (PATH.includes("v3/register/")) Type = "Sports";
									break;
							};
							break;
					};
					$.log(`⚠ ${$.name}, Type = ${Type}, CC = ${Settings.CountryCode[Type]}`);
					break;
				case "CONNECT":
				case "TRACE":
					break;
			};
			if ($request.headers?.["X-Apple-Store-Front"]) $request.headers["X-Apple-Store-Front"] = (Configs.Storefront.get(Settings.CountryCode[Type])) ? $request.headers["X-Apple-Store-Front"].replace(/\d{6}/, Configs.Storefront.get(Settings.CountryCode[Type])) : $request.headers["X-Apple-Store-Front"];
			if ($request.headers?.["x-apple-store-front"]) $request.headers["x-apple-store-front"] = (Configs.Storefront.get(Settings.CountryCode[Type])) ? $request.headers["x-apple-store-front"].replace(/\d{6}/, Configs.Storefront.get(Settings.CountryCode[Type])) : $request.headers["x-apple-store-front"];
			if (URL.query?.sf) URL.query.sf = Configs.Storefront.get(Settings.CountryCode[Type]) ?? URL.query.sf
			if (URL.query?.locale) URL.query.locale = Configs.Locale.get(Settings.CountryCode[Type]) ?? URL.query.locale
			$.log(`🚧 ${$.name}, 调试信息`, `sf = ${URL.query?.sf}, locale = ${URL.query?.locale}`, "")
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

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVFYucmVxdWVzdC5iZXRhLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFlO0FBQ2Y7QUFDQSxpQkFBaUIsS0FBSztBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQixVQUFVO0FBQy9COztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGNBQWMsS0FBSztBQUNuQixHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLEtBQUs7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsZUFBZSwrQkFBK0I7QUFDOUM7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0EsS0FBSztBQUNMLElBQUk7QUFDSjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxRUFBcUU7QUFDckU7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0I7QUFDcEIsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsa0NBQWtDO0FBQ2xDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBLFNBQVMsOENBQThDO0FBQ3ZEO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLG1DQUFtQztBQUNuQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNB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QUNBO0FBQ0EsZ0JBQWdCLDRFQUE0RTtBQUM1RjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLCtCQUErQixLQUFLLHNDQUFzQztBQUM1RixnQkFBZ0Isc0ZBQXNGO0FBQ3RHO0FBQ0E7QUFDQSxNQUFNLGNBQWMscUJBQXFCO0FBQ3pDO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckIsMkdBQTJHO0FBQzNHLGdCQUFnQixPQUFPLG1DQUFtQyxPQUFPO0FBQ2pFLGtCQUFrQixPQUFPLHlCQUF5Qix5QkFBeUI7QUFDM0U7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsOENBQThDO0FBQzlEO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixtRUFBbUU7QUFDbkY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQiw4QkFBOEIsS0FBSyxxQ0FBcUM7QUFDMUYsZ0JBQWdCLHdMQUF3TDtBQUN4TTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBLEVBQUU7O0FBRUYiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9pcmluZ28vLi9zcmMvRU5WL0VOVi5tanMiLCJ3ZWJwYWNrOi8vaXJpbmdvLy4vc3JjL1VSSS9VUkkubWpzIiwid2VicGFjazovL2lyaW5nby8uL3NyYy9mdW5jdGlvbi9zZXRFTlYubWpzIiwid2VicGFjazovL2lyaW5nby93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9pcmluZ28vd2VicGFjay9ydW50aW1lL2NyZWF0ZSBmYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vaXJpbmdvL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9pcmluZ28vd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9pcmluZ28vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9pcmluZ28vLi9zcmMvVFYucmVxdWVzdC5iZXRhLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IGNsYXNzIEVOViB7XG5cdGNvbnN0cnVjdG9yKG5hbWUsIG9wdHMpIHtcblx0XHR0aGlzLm5hbWUgPSBgJHtuYW1lfSwgRU5WIHYxLjAuMGBcblx0XHR0aGlzLmh0dHAgPSBuZXcgSHR0cCh0aGlzKVxuXHRcdHRoaXMuZGF0YSA9IG51bGxcblx0XHR0aGlzLmRhdGFGaWxlID0gJ2JveC5kYXQnXG5cdFx0dGhpcy5sb2dzID0gW11cblx0XHR0aGlzLmlzTXV0ZSA9IGZhbHNlXG5cdFx0dGhpcy5pc05lZWRSZXdyaXRlID0gZmFsc2Vcblx0XHR0aGlzLmxvZ1NlcGFyYXRvciA9ICdcXG4nXG5cdFx0dGhpcy5lbmNvZGluZyA9ICd1dGYtOCdcblx0XHR0aGlzLnN0YXJ0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG5cdFx0T2JqZWN0LmFzc2lnbih0aGlzLCBvcHRzKVxuXHRcdHRoaXMubG9nKCcnLCBg8J+PgSAke3RoaXMubmFtZX0sIOW8gOWniyFgKVxuXHR9XG5cblx0UGxhdGZvcm0oKSB7XG5cdFx0aWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgJGVudmlyb25tZW50ICYmICRlbnZpcm9ubWVudFsnc3VyZ2UtdmVyc2lvbiddKVxuXHRcdFx0cmV0dXJuICdTdXJnZSdcblx0XHRpZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiAkZW52aXJvbm1lbnQgJiYgJGVudmlyb25tZW50WydzdGFzaC12ZXJzaW9uJ10pXG5cdFx0XHRyZXR1cm4gJ1N0YXNoJ1xuXHRcdGlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mICR0YXNrKSByZXR1cm4gJ1F1YW50dW11bHQgWCdcblx0XHRpZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiAkbG9vbikgcmV0dXJuICdMb29uJ1xuXHRcdGlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mICRyb2NrZXQpIHJldHVybiAnU2hhZG93cm9ja2V0J1xuXHR9XG5cblx0aXNRdWFuWCgpIHtcblx0XHRyZXR1cm4gJ1F1YW50dW11bHQgWCcgPT09IHRoaXMuUGxhdGZvcm0oKVxuXHR9XG5cblx0aXNTdXJnZSgpIHtcblx0XHRyZXR1cm4gJ1N1cmdlJyA9PT0gdGhpcy5QbGF0Zm9ybSgpXG5cdH1cblxuXHRpc0xvb24oKSB7XG5cdFx0cmV0dXJuICdMb29uJyA9PT0gdGhpcy5QbGF0Zm9ybSgpXG5cdH1cblxuXHRpc1NoYWRvd3JvY2tldCgpIHtcblx0XHRyZXR1cm4gJ1NoYWRvd3JvY2tldCcgPT09IHRoaXMuUGxhdGZvcm0oKVxuXHR9XG5cblx0aXNTdGFzaCgpIHtcblx0XHRyZXR1cm4gJ1N0YXNoJyA9PT0gdGhpcy5QbGF0Zm9ybSgpXG5cdH1cblxuXHR0b09iaihzdHIsIGRlZmF1bHRWYWx1ZSA9IG51bGwpIHtcblx0XHR0cnkge1xuXHRcdFx0cmV0dXJuIEpTT04ucGFyc2Uoc3RyKVxuXHRcdH0gY2F0Y2gge1xuXHRcdFx0cmV0dXJuIGRlZmF1bHRWYWx1ZVxuXHRcdH1cblx0fVxuXG5cdHRvU3RyKG9iaiwgZGVmYXVsdFZhbHVlID0gbnVsbCkge1xuXHRcdHRyeSB7XG5cdFx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkob2JqKVxuXHRcdH0gY2F0Y2gge1xuXHRcdFx0cmV0dXJuIGRlZmF1bHRWYWx1ZVxuXHRcdH1cblx0fVxuXG5cdGdldGpzb24oa2V5LCBkZWZhdWx0VmFsdWUpIHtcblx0XHRsZXQganNvbiA9IGRlZmF1bHRWYWx1ZVxuXHRcdGNvbnN0IHZhbCA9IHRoaXMuZ2V0ZGF0YShrZXkpXG5cdFx0aWYgKHZhbCkge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0anNvbiA9IEpTT04ucGFyc2UodGhpcy5nZXRkYXRhKGtleSkpXG5cdFx0XHR9IGNhdGNoIHsgfVxuXHRcdH1cblx0XHRyZXR1cm4ganNvblxuXHR9XG5cblx0c2V0anNvbih2YWwsIGtleSkge1xuXHRcdHRyeSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5zZXRkYXRhKEpTT04uc3RyaW5naWZ5KHZhbCksIGtleSlcblx0XHR9IGNhdGNoIHtcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdH1cblx0fVxuXG5cdGdldFNjcmlwdCh1cmwpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdHRoaXMuZ2V0KHsgdXJsIH0sIChlcnJvciwgcmVzcG9uc2UsIGJvZHkpID0+IHJlc29sdmUoYm9keSkpXG5cdFx0fSlcblx0fVxuXG5cdHJ1blNjcmlwdChzY3JpcHQsIHJ1bk9wdHMpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdGxldCBodHRwYXBpID0gdGhpcy5nZXRkYXRhKCdAY2hhdnlfYm94anNfdXNlckNmZ3MuaHR0cGFwaScpXG5cdFx0XHRodHRwYXBpID0gaHR0cGFwaSA/IGh0dHBhcGkucmVwbGFjZSgvXFxuL2csICcnKS50cmltKCkgOiBodHRwYXBpXG5cdFx0XHRsZXQgaHR0cGFwaV90aW1lb3V0ID0gdGhpcy5nZXRkYXRhKFxuXHRcdFx0XHQnQGNoYXZ5X2JveGpzX3VzZXJDZmdzLmh0dHBhcGlfdGltZW91dCdcblx0XHRcdClcblx0XHRcdGh0dHBhcGlfdGltZW91dCA9IGh0dHBhcGlfdGltZW91dCA/IGh0dHBhcGlfdGltZW91dCAqIDEgOiAyMFxuXHRcdFx0aHR0cGFwaV90aW1lb3V0ID1cblx0XHRcdFx0cnVuT3B0cyAmJiBydW5PcHRzLnRpbWVvdXQgPyBydW5PcHRzLnRpbWVvdXQgOiBodHRwYXBpX3RpbWVvdXRcblx0XHRcdGNvbnN0IFtrZXksIGFkZHJdID0gaHR0cGFwaS5zcGxpdCgnQCcpXG5cdFx0XHRjb25zdCBvcHRzID0ge1xuXHRcdFx0XHR1cmw6IGBodHRwOi8vJHthZGRyfS92MS9zY3JpcHRpbmcvZXZhbHVhdGVgLFxuXHRcdFx0XHRib2R5OiB7XG5cdFx0XHRcdFx0c2NyaXB0X3RleHQ6IHNjcmlwdCxcblx0XHRcdFx0XHRtb2NrX3R5cGU6ICdjcm9uJyxcblx0XHRcdFx0XHR0aW1lb3V0OiBodHRwYXBpX3RpbWVvdXRcblx0XHRcdFx0fSxcblx0XHRcdFx0aGVhZGVyczogeyAnWC1LZXknOiBrZXksICdBY2NlcHQnOiAnKi8qJyB9LFxuXHRcdFx0XHR0aW1lb3V0OiBodHRwYXBpX3RpbWVvdXRcblx0XHRcdH1cblx0XHRcdHRoaXMucG9zdChvcHRzLCAoZXJyb3IsIHJlc3BvbnNlLCBib2R5KSA9PiByZXNvbHZlKGJvZHkpKVxuXHRcdH0pLmNhdGNoKChlKSA9PiB0aGlzLmxvZ0VycihlKSlcblx0fVxuXG5cdGxvYWRkYXRhKCkge1xuXHRcdGlmICh0aGlzLmlzTm9kZSgpKSB7XG5cdFx0XHR0aGlzLmZzID0gdGhpcy5mcyA/IHRoaXMuZnMgOiByZXF1aXJlKCdmcycpXG5cdFx0XHR0aGlzLnBhdGggPSB0aGlzLnBhdGggPyB0aGlzLnBhdGggOiByZXF1aXJlKCdwYXRoJylcblx0XHRcdGNvbnN0IGN1ckRpckRhdGFGaWxlUGF0aCA9IHRoaXMucGF0aC5yZXNvbHZlKHRoaXMuZGF0YUZpbGUpXG5cdFx0XHRjb25zdCByb290RGlyRGF0YUZpbGVQYXRoID0gdGhpcy5wYXRoLnJlc29sdmUoXG5cdFx0XHRcdHByb2Nlc3MuY3dkKCksXG5cdFx0XHRcdHRoaXMuZGF0YUZpbGVcblx0XHRcdClcblx0XHRcdGNvbnN0IGlzQ3VyRGlyRGF0YUZpbGUgPSB0aGlzLmZzLmV4aXN0c1N5bmMoY3VyRGlyRGF0YUZpbGVQYXRoKVxuXHRcdFx0Y29uc3QgaXNSb290RGlyRGF0YUZpbGUgPVxuXHRcdFx0XHQhaXNDdXJEaXJEYXRhRmlsZSAmJiB0aGlzLmZzLmV4aXN0c1N5bmMocm9vdERpckRhdGFGaWxlUGF0aClcblx0XHRcdGlmIChpc0N1ckRpckRhdGFGaWxlIHx8IGlzUm9vdERpckRhdGFGaWxlKSB7XG5cdFx0XHRcdGNvbnN0IGRhdFBhdGggPSBpc0N1ckRpckRhdGFGaWxlXG5cdFx0XHRcdFx0PyBjdXJEaXJEYXRhRmlsZVBhdGhcblx0XHRcdFx0XHQ6IHJvb3REaXJEYXRhRmlsZVBhdGhcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRyZXR1cm4gSlNPTi5wYXJzZSh0aGlzLmZzLnJlYWRGaWxlU3luYyhkYXRQYXRoKSlcblx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdHJldHVybiB7fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgcmV0dXJuIHt9XG5cdFx0fSBlbHNlIHJldHVybiB7fVxuXHR9XG5cblx0d3JpdGVkYXRhKCkge1xuXHRcdGlmICh0aGlzLmlzTm9kZSgpKSB7XG5cdFx0XHR0aGlzLmZzID0gdGhpcy5mcyA/IHRoaXMuZnMgOiByZXF1aXJlKCdmcycpXG5cdFx0XHR0aGlzLnBhdGggPSB0aGlzLnBhdGggPyB0aGlzLnBhdGggOiByZXF1aXJlKCdwYXRoJylcblx0XHRcdGNvbnN0IGN1ckRpckRhdGFGaWxlUGF0aCA9IHRoaXMucGF0aC5yZXNvbHZlKHRoaXMuZGF0YUZpbGUpXG5cdFx0XHRjb25zdCByb290RGlyRGF0YUZpbGVQYXRoID0gdGhpcy5wYXRoLnJlc29sdmUoXG5cdFx0XHRcdHByb2Nlc3MuY3dkKCksXG5cdFx0XHRcdHRoaXMuZGF0YUZpbGVcblx0XHRcdClcblx0XHRcdGNvbnN0IGlzQ3VyRGlyRGF0YUZpbGUgPSB0aGlzLmZzLmV4aXN0c1N5bmMoY3VyRGlyRGF0YUZpbGVQYXRoKVxuXHRcdFx0Y29uc3QgaXNSb290RGlyRGF0YUZpbGUgPVxuXHRcdFx0XHQhaXNDdXJEaXJEYXRhRmlsZSAmJiB0aGlzLmZzLmV4aXN0c1N5bmMocm9vdERpckRhdGFGaWxlUGF0aClcblx0XHRcdGNvbnN0IGpzb25kYXRhID0gSlNPTi5zdHJpbmdpZnkodGhpcy5kYXRhKVxuXHRcdFx0aWYgKGlzQ3VyRGlyRGF0YUZpbGUpIHtcblx0XHRcdFx0dGhpcy5mcy53cml0ZUZpbGVTeW5jKGN1ckRpckRhdGFGaWxlUGF0aCwganNvbmRhdGEpXG5cdFx0XHR9IGVsc2UgaWYgKGlzUm9vdERpckRhdGFGaWxlKSB7XG5cdFx0XHRcdHRoaXMuZnMud3JpdGVGaWxlU3luYyhyb290RGlyRGF0YUZpbGVQYXRoLCBqc29uZGF0YSlcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuZnMud3JpdGVGaWxlU3luYyhjdXJEaXJEYXRhRmlsZVBhdGgsIGpzb25kYXRhKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGxvZGFzaF9nZXQoc291cmNlLCBwYXRoLCBkZWZhdWx0VmFsdWUgPSB1bmRlZmluZWQpIHtcblx0XHRjb25zdCBwYXRocyA9IHBhdGgucmVwbGFjZSgvXFxbKFxcZCspXFxdL2csICcuJDEnKS5zcGxpdCgnLicpXG5cdFx0bGV0IHJlc3VsdCA9IHNvdXJjZVxuXHRcdGZvciAoY29uc3QgcCBvZiBwYXRocykge1xuXHRcdFx0cmVzdWx0ID0gT2JqZWN0KHJlc3VsdClbcF1cblx0XHRcdGlmIChyZXN1bHQgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRyZXR1cm4gZGVmYXVsdFZhbHVlXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHRcblx0fVxuXG5cdGxvZGFzaF9zZXQob2JqLCBwYXRoLCB2YWx1ZSkge1xuXHRcdGlmIChPYmplY3Qob2JqKSAhPT0gb2JqKSByZXR1cm4gb2JqXG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KHBhdGgpKSBwYXRoID0gcGF0aC50b1N0cmluZygpLm1hdGNoKC9bXi5bXFxdXSsvZykgfHwgW11cblx0XHRwYXRoXG5cdFx0XHQuc2xpY2UoMCwgLTEpXG5cdFx0XHQucmVkdWNlKFxuXHRcdFx0XHQoYSwgYywgaSkgPT5cblx0XHRcdFx0XHRPYmplY3QoYVtjXSkgPT09IGFbY11cblx0XHRcdFx0XHRcdD8gYVtjXVxuXHRcdFx0XHRcdFx0OiAoYVtjXSA9IE1hdGguYWJzKHBhdGhbaSArIDFdKSA+PiAwID09PSArcGF0aFtpICsgMV0gPyBbXSA6IHt9KSxcblx0XHRcdFx0b2JqXG5cdFx0XHQpW3BhdGhbcGF0aC5sZW5ndGggLSAxXV0gPSB2YWx1ZVxuXHRcdHJldHVybiBvYmpcblx0fVxuXG5cdGdldGRhdGEoa2V5KSB7XG5cdFx0bGV0IHZhbCA9IHRoaXMuZ2V0dmFsKGtleSlcblx0XHQvLyDlpoLmnpzku6UgQFxuXHRcdGlmICgvXkAvLnRlc3Qoa2V5KSkge1xuXHRcdFx0Y29uc3QgWywgb2Jqa2V5LCBwYXRoc10gPSAvXkAoLio/KVxcLiguKj8pJC8uZXhlYyhrZXkpXG5cdFx0XHRjb25zdCBvYmp2YWwgPSBvYmprZXkgPyB0aGlzLmdldHZhbChvYmprZXkpIDogJydcblx0XHRcdGlmIChvYmp2YWwpIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRjb25zdCBvYmplZHZhbCA9IEpTT04ucGFyc2Uob2JqdmFsKVxuXHRcdFx0XHRcdHZhbCA9IG9iamVkdmFsID8gdGhpcy5sb2Rhc2hfZ2V0KG9iamVkdmFsLCBwYXRocywgJycpIDogdmFsXG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHR2YWwgPSAnJ1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB2YWxcblx0fVxuXG5cdHNldGRhdGEodmFsLCBrZXkpIHtcblx0XHRsZXQgaXNzdWMgPSBmYWxzZVxuXHRcdGlmICgvXkAvLnRlc3Qoa2V5KSkge1xuXHRcdFx0Y29uc3QgWywgb2Jqa2V5LCBwYXRoc10gPSAvXkAoLio/KVxcLiguKj8pJC8uZXhlYyhrZXkpXG5cdFx0XHRjb25zdCBvYmpkYXQgPSB0aGlzLmdldHZhbChvYmprZXkpXG5cdFx0XHRjb25zdCBvYmp2YWwgPSBvYmprZXlcblx0XHRcdFx0PyBvYmpkYXQgPT09ICdudWxsJ1xuXHRcdFx0XHRcdD8gbnVsbFxuXHRcdFx0XHRcdDogb2JqZGF0IHx8ICd7fSdcblx0XHRcdFx0OiAne30nXG5cdFx0XHR0cnkge1xuXHRcdFx0XHRjb25zdCBvYmplZHZhbCA9IEpTT04ucGFyc2Uob2JqdmFsKVxuXHRcdFx0XHR0aGlzLmxvZGFzaF9zZXQob2JqZWR2YWwsIHBhdGhzLCB2YWwpXG5cdFx0XHRcdGlzc3VjID0gdGhpcy5zZXR2YWwoSlNPTi5zdHJpbmdpZnkob2JqZWR2YWwpLCBvYmprZXkpXG5cdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdGNvbnN0IG9iamVkdmFsID0ge31cblx0XHRcdFx0dGhpcy5sb2Rhc2hfc2V0KG9iamVkdmFsLCBwYXRocywgdmFsKVxuXHRcdFx0XHRpc3N1YyA9IHRoaXMuc2V0dmFsKEpTT04uc3RyaW5naWZ5KG9iamVkdmFsKSwgb2Jqa2V5KVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpc3N1YyA9IHRoaXMuc2V0dmFsKHZhbCwga2V5KVxuXHRcdH1cblx0XHRyZXR1cm4gaXNzdWNcblx0fVxuXG5cdGdldHZhbChrZXkpIHtcblx0XHRzd2l0Y2ggKHRoaXMuUGxhdGZvcm0oKSkge1xuXHRcdFx0Y2FzZSAnU3VyZ2UnOlxuXHRcdFx0Y2FzZSAnTG9vbic6XG5cdFx0XHRjYXNlICdTdGFzaCc6XG5cdFx0XHRjYXNlICdTaGFkb3dyb2NrZXQnOlxuXHRcdFx0XHRyZXR1cm4gJHBlcnNpc3RlbnRTdG9yZS5yZWFkKGtleSlcblx0XHRcdGNhc2UgJ1F1YW50dW11bHQgWCc6XG5cdFx0XHRcdHJldHVybiAkcHJlZnMudmFsdWVGb3JLZXkoa2V5KVxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuICh0aGlzLmRhdGEgJiYgdGhpcy5kYXRhW2tleV0pIHx8IG51bGxcblx0XHR9XG5cdH1cblxuXHRzZXR2YWwodmFsLCBrZXkpIHtcblx0XHRzd2l0Y2ggKHRoaXMuUGxhdGZvcm0oKSkge1xuXHRcdFx0Y2FzZSAnU3VyZ2UnOlxuXHRcdFx0Y2FzZSAnTG9vbic6XG5cdFx0XHRjYXNlICdTdGFzaCc6XG5cdFx0XHRjYXNlICdTaGFkb3dyb2NrZXQnOlxuXHRcdFx0XHRyZXR1cm4gJHBlcnNpc3RlbnRTdG9yZS53cml0ZSh2YWwsIGtleSlcblx0XHRcdGNhc2UgJ1F1YW50dW11bHQgWCc6XG5cdFx0XHRcdHJldHVybiAkcHJlZnMuc2V0VmFsdWVGb3JLZXkodmFsLCBrZXkpXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gKHRoaXMuZGF0YSAmJiB0aGlzLmRhdGFba2V5XSkgfHwgbnVsbFxuXHRcdH1cblx0fVxuXG5cdGluaXRHb3RFbnYob3B0cykge1xuXHRcdHRoaXMuZ290ID0gdGhpcy5nb3QgPyB0aGlzLmdvdCA6IHJlcXVpcmUoJ2dvdCcpXG5cdFx0dGhpcy5ja3RvdWdoID0gdGhpcy5ja3RvdWdoID8gdGhpcy5ja3RvdWdoIDogcmVxdWlyZSgndG91Z2gtY29va2llJylcblx0XHR0aGlzLmNramFyID0gdGhpcy5ja2phciA/IHRoaXMuY2tqYXIgOiBuZXcgdGhpcy5ja3RvdWdoLkNvb2tpZUphcigpXG5cdFx0aWYgKG9wdHMpIHtcblx0XHRcdG9wdHMuaGVhZGVycyA9IG9wdHMuaGVhZGVycyA/IG9wdHMuaGVhZGVycyA6IHt9XG5cdFx0XHRpZiAodW5kZWZpbmVkID09PSBvcHRzLmhlYWRlcnMuQ29va2llICYmIHVuZGVmaW5lZCA9PT0gb3B0cy5jb29raWVKYXIpIHtcblx0XHRcdFx0b3B0cy5jb29raWVKYXIgPSB0aGlzLmNramFyXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Z2V0KHJlcXVlc3QsIGNhbGxiYWNrID0gKCkgPT4geyB9KSB7XG5cdFx0ZGVsZXRlIHJlcXVlc3QuaGVhZGVycz8uWydDb250ZW50LUxlbmd0aCddXG5cdFx0ZGVsZXRlIHJlcXVlc3QuaGVhZGVycz8uWydjb250ZW50LWxlbmd0aCddXG5cblx0XHRzd2l0Y2ggKHRoaXMuUGxhdGZvcm0oKSkge1xuXHRcdFx0Y2FzZSAnU3VyZ2UnOlxuXHRcdFx0Y2FzZSAnTG9vbic6XG5cdFx0XHRjYXNlICdTdGFzaCc6XG5cdFx0XHRjYXNlICdTaGFkb3dyb2NrZXQnOlxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0aWYgKHRoaXMuaXNTdXJnZSgpICYmIHRoaXMuaXNOZWVkUmV3cml0ZSkge1xuXHRcdFx0XHRcdHRoaXMubG9kYXNoX3NldChyZXF1ZXN0LCAnaGVhZGVycy5YLVN1cmdlLVNraXAtU2NyaXB0aW5nJywgZmFsc2UpXG5cdFx0XHRcdH1cblx0XHRcdFx0JGh0dHBDbGllbnQuZ2V0KHJlcXVlc3QsIChlcnJvciwgcmVzcG9uc2UsIGJvZHkpID0+IHtcblx0XHRcdFx0XHRpZiAoIWVycm9yICYmIHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0XHRyZXNwb25zZS5ib2R5ID0gYm9keVxuXHRcdFx0XHRcdFx0cmVzcG9uc2Uuc3RhdHVzQ29kZSA9IHJlc3BvbnNlLnN0YXR1cyA/IHJlc3BvbnNlLnN0YXR1cyA6IHJlc3BvbnNlLnN0YXR1c0NvZGVcblx0XHRcdFx0XHRcdHJlc3BvbnNlLnN0YXR1cyA9IHJlc3BvbnNlLnN0YXR1c0NvZGVcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2FsbGJhY2soZXJyb3IsIHJlc3BvbnNlLCBib2R5KVxuXHRcdFx0XHR9KVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnUXVhbnR1bXVsdCBYJzpcblx0XHRcdFx0aWYgKHRoaXMuaXNOZWVkUmV3cml0ZSkge1xuXHRcdFx0XHRcdHRoaXMubG9kYXNoX3NldChyZXF1ZXN0LCAnb3B0cy5oaW50cycsIGZhbHNlKVxuXHRcdFx0XHR9XG5cdFx0XHRcdCR0YXNrLmZldGNoKHJlcXVlc3QpLnRoZW4oXG5cdFx0XHRcdFx0KHJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdFx0XHRjb25zdCB7XG5cdFx0XHRcdFx0XHRcdHN0YXR1c0NvZGU6IHN0YXR1cyxcblx0XHRcdFx0XHRcdFx0c3RhdHVzQ29kZSxcblx0XHRcdFx0XHRcdFx0aGVhZGVycyxcblx0XHRcdFx0XHRcdFx0Ym9keSxcblx0XHRcdFx0XHRcdFx0Ym9keUJ5dGVzXG5cdFx0XHRcdFx0XHR9ID0gcmVzcG9uc2Vcblx0XHRcdFx0XHRcdGNhbGxiYWNrKFxuXHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHR7IHN0YXR1cywgc3RhdHVzQ29kZSwgaGVhZGVycywgYm9keSwgYm9keUJ5dGVzIH0sXG5cdFx0XHRcdFx0XHRcdGJvZHksXG5cdFx0XHRcdFx0XHRcdGJvZHlCeXRlc1xuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0KGVycm9yKSA9PiBjYWxsYmFjaygoZXJyb3IgJiYgZXJyb3IuZXJyb3JvcikgfHwgJ1VuZGVmaW5lZEVycm9yJylcblx0XHRcdFx0KVxuXHRcdFx0XHRicmVha1xuXHRcdH1cblx0fVxuXG5cdHBvc3QocmVxdWVzdCwgY2FsbGJhY2sgPSAoKSA9PiB7IH0pIHtcblx0XHRjb25zdCBtZXRob2QgPSByZXF1ZXN0Lm1ldGhvZFxuXHRcdFx0PyByZXF1ZXN0Lm1ldGhvZC50b0xvY2FsZUxvd2VyQ2FzZSgpXG5cdFx0XHQ6ICdwb3N0J1xuXG5cdFx0Ly8g5aaC5p6c5oyH5a6a5LqG6K+35rGC5L2TLCDkvYbmsqHmjIflrpogYENvbnRlbnQtVHlwZWDjgIFgY29udGVudC10eXBlYCwg5YiZ6Ieq5Yqo55Sf5oiQ44CCXG5cdFx0aWYgKFxuXHRcdFx0cmVxdWVzdC5ib2R5ICYmXG5cdFx0XHRyZXF1ZXN0LmhlYWRlcnMgJiZcblx0XHRcdCFyZXF1ZXN0LmhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddICYmXG5cdFx0XHQhcmVxdWVzdC5oZWFkZXJzWydjb250ZW50LXR5cGUnXVxuXHRcdCkge1xuXHRcdFx0Ly8gSFRUUC8x44CBSFRUUC8yIOmDveaUr+aMgeWwj+WGmSBoZWFkZXJzXG5cdFx0XHRyZXF1ZXN0LmhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddID0gJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcblx0XHR9XG5cdFx0Ly8g5Li66YG/5YWN5oyH5a6a6ZSZ6K+vIGBjb250ZW50LWxlbmd0aGAg6L+Z6YeM5Yig6Zmk6K+l5bGe5oCn77yM55Sx5bel5YW356uvIChIdHRwQ2xpZW50KSDotJ/otKPph43mlrDorqHnrpflubbotYvlgLxcblx0XHRcdGRlbGV0ZSByZXF1ZXN0LmhlYWRlcnM/LlsnQ29udGVudC1MZW5ndGgnXVxuXHRcdFx0ZGVsZXRlIHJlcXVlc3QuaGVhZGVycz8uWydjb250ZW50LWxlbmd0aCddXG5cdFx0c3dpdGNoICh0aGlzLlBsYXRmb3JtKCkpIHtcblx0XHRcdGNhc2UgJ1N1cmdlJzpcblx0XHRcdGNhc2UgJ0xvb24nOlxuXHRcdFx0Y2FzZSAnU3Rhc2gnOlxuXHRcdFx0Y2FzZSAnU2hhZG93cm9ja2V0Jzpcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGlmICh0aGlzLmlzU3VyZ2UoKSAmJiB0aGlzLmlzTmVlZFJld3JpdGUpIHtcblx0XHRcdFx0XHR0aGlzLmxvZGFzaF9zZXQocmVxdWVzdCwgJ2hlYWRlcnMuWC1TdXJnZS1Ta2lwLVNjcmlwdGluZycsIGZhbHNlKVxuXHRcdFx0XHR9XG5cdFx0XHRcdCRodHRwQ2xpZW50W21ldGhvZF0ocmVxdWVzdCwgKGVycm9yLCByZXNwb25zZSwgYm9keSkgPT4ge1xuXHRcdFx0XHRcdGlmICghZXJyb3IgJiYgcmVzcG9uc2UpIHtcblx0XHRcdFx0XHRcdHJlc3BvbnNlLmJvZHkgPSBib2R5XG5cdFx0XHRcdFx0XHRyZXNwb25zZS5zdGF0dXNDb2RlID0gcmVzcG9uc2Uuc3RhdHVzID8gcmVzcG9uc2Uuc3RhdHVzIDogcmVzcG9uc2Uuc3RhdHVzQ29kZVxuXHRcdFx0XHRcdFx0cmVzcG9uc2Uuc3RhdHVzID0gcmVzcG9uc2Uuc3RhdHVzQ29kZVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYWxsYmFjayhlcnJvciwgcmVzcG9uc2UsIGJvZHkpXG5cdFx0XHRcdH0pXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdRdWFudHVtdWx0IFgnOlxuXHRcdFx0XHRyZXF1ZXN0Lm1ldGhvZCA9IG1ldGhvZFxuXHRcdFx0XHRpZiAodGhpcy5pc05lZWRSZXdyaXRlKSB7XG5cdFx0XHRcdFx0dGhpcy5sb2Rhc2hfc2V0KHJlcXVlc3QsICdvcHRzLmhpbnRzJywgZmFsc2UpXG5cdFx0XHRcdH1cblx0XHRcdFx0JHRhc2suZmV0Y2gocmVxdWVzdCkudGhlbihcblx0XHRcdFx0XHQocmVzcG9uc2UpID0+IHtcblx0XHRcdFx0XHRcdGNvbnN0IHtcblx0XHRcdFx0XHRcdFx0c3RhdHVzQ29kZTogc3RhdHVzLFxuXHRcdFx0XHRcdFx0XHRzdGF0dXNDb2RlLFxuXHRcdFx0XHRcdFx0XHRoZWFkZXJzLFxuXHRcdFx0XHRcdFx0XHRib2R5LFxuXHRcdFx0XHRcdFx0XHRib2R5Qnl0ZXNcblx0XHRcdFx0XHRcdH0gPSByZXNwb25zZVxuXHRcdFx0XHRcdFx0Y2FsbGJhY2soXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdHsgc3RhdHVzLCBzdGF0dXNDb2RlLCBoZWFkZXJzLCBib2R5LCBib2R5Qnl0ZXMgfSxcblx0XHRcdFx0XHRcdFx0Ym9keSxcblx0XHRcdFx0XHRcdFx0Ym9keUJ5dGVzXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQoZXJyb3IpID0+IGNhbGxiYWNrKChlcnJvciAmJiBlcnJvci5lcnJvcm9yKSB8fCAnVW5kZWZpbmVkRXJyb3InKVxuXHRcdFx0XHQpXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXHR9XG5cdC8qKlxuXHQgKlxuXHQgKiDnpLrkvos6JC50aW1lKCd5eXl5LU1NLWRkIHFxIEhIOm1tOnNzLlMnKVxuXHQgKiAgICA6JC50aW1lKCd5eXl5TU1kZEhIbW1zc1MnKVxuXHQgKiAgICB5OuW5tCBNOuaciCBkOuaXpSBxOuWtoyBIOuaXtiBtOuWIhiBzOuenkiBTOuavq+enklxuXHQgKiAgICDlhbbkuK155Y+v6YCJMC005L2N5Y2g5L2N56ym44CBU+WPr+mAiTAtMeS9jeWNoOS9jeespu+8jOWFtuS9meWPr+mAiTAtMuS9jeWNoOS9jeesplxuXHQgKiBAcGFyYW0ge3N0cmluZ30gZm9ybWF0IOagvOW8j+WMluWPguaVsFxuXHQgKiBAcGFyYW0ge251bWJlcn0gdHMg5Y+v6YCJOiDmoLnmja7mjIflrprml7bpl7TmiLPov5Tlm57moLzlvI/ljJbml6XmnJ9cblx0ICpcblx0ICovXG5cdHRpbWUoZm9ybWF0LCB0cyA9IG51bGwpIHtcblx0XHRjb25zdCBkYXRlID0gdHMgPyBuZXcgRGF0ZSh0cykgOiBuZXcgRGF0ZSgpXG5cdFx0bGV0IG8gPSB7XG5cdFx0XHQnTSsnOiBkYXRlLmdldE1vbnRoKCkgKyAxLFxuXHRcdFx0J2QrJzogZGF0ZS5nZXREYXRlKCksXG5cdFx0XHQnSCsnOiBkYXRlLmdldEhvdXJzKCksXG5cdFx0XHQnbSsnOiBkYXRlLmdldE1pbnV0ZXMoKSxcblx0XHRcdCdzKyc6IGRhdGUuZ2V0U2Vjb25kcygpLFxuXHRcdFx0J3ErJzogTWF0aC5mbG9vcigoZGF0ZS5nZXRNb250aCgpICsgMykgLyAzKSxcblx0XHRcdCdTJzogZGF0ZS5nZXRNaWxsaXNlY29uZHMoKVxuXHRcdH1cblx0XHRpZiAoLyh5KykvLnRlc3QoZm9ybWF0KSlcblx0XHRcdGZvcm1hdCA9IGZvcm1hdC5yZXBsYWNlKFxuXHRcdFx0XHRSZWdFeHAuJDEsXG5cdFx0XHRcdChkYXRlLmdldEZ1bGxZZWFyKCkgKyAnJykuc3Vic3RyKDQgLSBSZWdFeHAuJDEubGVuZ3RoKVxuXHRcdFx0KVxuXHRcdGZvciAobGV0IGsgaW4gbylcblx0XHRcdGlmIChuZXcgUmVnRXhwKCcoJyArIGsgKyAnKScpLnRlc3QoZm9ybWF0KSlcblx0XHRcdFx0Zm9ybWF0ID0gZm9ybWF0LnJlcGxhY2UoXG5cdFx0XHRcdFx0UmVnRXhwLiQxLFxuXHRcdFx0XHRcdFJlZ0V4cC4kMS5sZW5ndGggPT0gMVxuXHRcdFx0XHRcdFx0PyBvW2tdXG5cdFx0XHRcdFx0XHQ6ICgnMDAnICsgb1trXSkuc3Vic3RyKCgnJyArIG9ba10pLmxlbmd0aClcblx0XHRcdFx0KVxuXHRcdHJldHVybiBmb3JtYXRcblx0fVxuXG5cdC8qKlxuXHQgKiDns7vnu5/pgJrnn6Vcblx0ICpcblx0ICogPiDpgJrnn6Xlj4LmlbA6IOWQjOaXtuaUr+aMgSBRdWFuWCDlkowgTG9vbiDkuKTnp43moLzlvI8sIEVudkpz5qC55o2u6L+Q6KGM546v5aKD6Ieq5Yqo6L2s5o2iLCBTdXJnZSDnjq/looPkuI3mlK/mjIHlpJrlqpLkvZPpgJrnn6Vcblx0ICpcblx0ICog56S65L6LOlxuXHQgKiAkLm1zZyh0aXRsZSwgc3VidCwgZGVzYywgJ3R3aXR0ZXI6Ly8nKVxuXHQgKiAkLm1zZyh0aXRsZSwgc3VidCwgZGVzYywgeyAnb3Blbi11cmwnOiAndHdpdHRlcjovLycsICdtZWRpYS11cmwnOiAnaHR0cHM6Ly9naXRodWIuZ2l0aHViYXNzZXRzLmNvbS9pbWFnZXMvbW9kdWxlcy9vcGVuX2dyYXBoL2dpdGh1Yi1tYXJrLnBuZycgfSlcblx0ICogJC5tc2codGl0bGUsIHN1YnQsIGRlc2MsIHsgJ29wZW4tdXJsJzogJ2h0dHBzOi8vYmluZy5jb20nLCAnbWVkaWEtdXJsJzogJ2h0dHBzOi8vZ2l0aHViLmdpdGh1YmFzc2V0cy5jb20vaW1hZ2VzL21vZHVsZXMvb3Blbl9ncmFwaC9naXRodWItbWFyay5wbmcnIH0pXG5cdCAqXG5cdCAqIEBwYXJhbSB7Kn0gdGl0bGUg5qCH6aKYXG5cdCAqIEBwYXJhbSB7Kn0gc3VidCDlia/moIfpophcblx0ICogQHBhcmFtIHsqfSBkZXNjIOmAmuefpeivpuaDhVxuXHQgKiBAcGFyYW0geyp9IG9wdHMg6YCa55+l5Y+C5pWwXG5cdCAqXG5cdCAqL1xuXHRtc2codGl0bGUgPSBuYW1lLCBzdWJ0ID0gJycsIGRlc2MgPSAnJywgb3B0cykge1xuXHRcdGNvbnN0IHRvRW52T3B0cyA9IChyYXdvcHRzKSA9PiB7XG5cdFx0XHRzd2l0Y2ggKHR5cGVvZiByYXdvcHRzKSB7XG5cdFx0XHRcdGNhc2UgdW5kZWZpbmVkOlxuXHRcdFx0XHRcdHJldHVybiByYXdvcHRzXG5cdFx0XHRcdGNhc2UgJ3N0cmluZyc6XG5cdFx0XHRcdFx0c3dpdGNoICh0aGlzLlBsYXRmb3JtKCkpIHtcblx0XHRcdFx0XHRcdGNhc2UgJ1N1cmdlJzpcblx0XHRcdFx0XHRcdGNhc2UgJ1N0YXNoJzpcblx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdHJldHVybiB7IHVybDogcmF3b3B0cyB9XG5cdFx0XHRcdFx0XHRjYXNlICdMb29uJzpcblx0XHRcdFx0XHRcdGNhc2UgJ1NoYWRvd3JvY2tldCc6XG5cdFx0XHRcdFx0XHRcdHJldHVybiByYXdvcHRzXG5cdFx0XHRcdFx0XHRjYXNlICdRdWFudHVtdWx0IFgnOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4geyAnb3Blbi11cmwnOiByYXdvcHRzIH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgJ29iamVjdCc6XG5cdFx0XHRcdFx0c3dpdGNoICh0aGlzLlBsYXRmb3JtKCkpIHtcblx0XHRcdFx0XHRcdGNhc2UgJ1N1cmdlJzpcblx0XHRcdFx0XHRcdGNhc2UgJ1N0YXNoJzpcblx0XHRcdFx0XHRcdGNhc2UgJ1NoYWRvd3JvY2tldCc6XG5cdFx0XHRcdFx0XHRkZWZhdWx0OiB7XG5cdFx0XHRcdFx0XHRcdGxldCBvcGVuVXJsID1cblx0XHRcdFx0XHRcdFx0XHRyYXdvcHRzLnVybCB8fCByYXdvcHRzLm9wZW5VcmwgfHwgcmF3b3B0c1snb3Blbi11cmwnXVxuXHRcdFx0XHRcdFx0XHRyZXR1cm4geyB1cmw6IG9wZW5VcmwgfVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y2FzZSAnTG9vbic6IHtcblx0XHRcdFx0XHRcdFx0bGV0IG9wZW5VcmwgPVxuXHRcdFx0XHRcdFx0XHRcdHJhd29wdHMub3BlblVybCB8fCByYXdvcHRzLnVybCB8fCByYXdvcHRzWydvcGVuLXVybCddXG5cdFx0XHRcdFx0XHRcdGxldCBtZWRpYVVybCA9IHJhd29wdHMubWVkaWFVcmwgfHwgcmF3b3B0c1snbWVkaWEtdXJsJ11cblx0XHRcdFx0XHRcdFx0cmV0dXJuIHsgb3BlblVybCwgbWVkaWFVcmwgfVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y2FzZSAnUXVhbnR1bXVsdCBYJzoge1xuXHRcdFx0XHRcdFx0XHRsZXQgb3BlblVybCA9XG5cdFx0XHRcdFx0XHRcdFx0cmF3b3B0c1snb3Blbi11cmwnXSB8fCByYXdvcHRzLnVybCB8fCByYXdvcHRzLm9wZW5Vcmxcblx0XHRcdFx0XHRcdFx0bGV0IG1lZGlhVXJsID0gcmF3b3B0c1snbWVkaWEtdXJsJ10gfHwgcmF3b3B0cy5tZWRpYVVybFxuXHRcdFx0XHRcdFx0XHRsZXQgdXBkYXRlUGFzdGVib2FyZCA9XG5cdFx0XHRcdFx0XHRcdFx0cmF3b3B0c1sndXBkYXRlLXBhc3RlYm9hcmQnXSB8fCByYXdvcHRzLnVwZGF0ZVBhc3RlYm9hcmRcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHQnb3Blbi11cmwnOiBvcGVuVXJsLFxuXHRcdFx0XHRcdFx0XHRcdCdtZWRpYS11cmwnOiBtZWRpYVVybCxcblx0XHRcdFx0XHRcdFx0XHQndXBkYXRlLXBhc3RlYm9hcmQnOiB1cGRhdGVQYXN0ZWJvYXJkXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZFxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoIXRoaXMuaXNNdXRlKSB7XG5cdFx0XHRzd2l0Y2ggKHRoaXMuUGxhdGZvcm0oKSkge1xuXHRcdFx0XHRjYXNlICdTdXJnZSc6XG5cdFx0XHRcdGNhc2UgJ0xvb24nOlxuXHRcdFx0XHRjYXNlICdTdGFzaCc6XG5cdFx0XHRcdGNhc2UgJ1NoYWRvd3JvY2tldCc6XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0JG5vdGlmaWNhdGlvbi5wb3N0KHRpdGxlLCBzdWJ0LCBkZXNjLCB0b0Vudk9wdHMob3B0cykpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSAnUXVhbnR1bXVsdCBYJzpcblx0XHRcdFx0XHQkbm90aWZ5KHRpdGxlLCBzdWJ0LCBkZXNjLCB0b0Vudk9wdHMob3B0cykpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKCF0aGlzLmlzTXV0ZUxvZykge1xuXHRcdFx0bGV0IGxvZ3MgPSBbJycsICc9PT09PT09PT09PT09PfCfk6Pns7vnu5/pgJrnn6Xwn5OjPT09PT09PT09PT09PT0nXVxuXHRcdFx0bG9ncy5wdXNoKHRpdGxlKVxuXHRcdFx0c3VidCA/IGxvZ3MucHVzaChzdWJ0KSA6ICcnXG5cdFx0XHRkZXNjID8gbG9ncy5wdXNoKGRlc2MpIDogJydcblx0XHRcdGNvbnNvbGUubG9nKGxvZ3Muam9pbignXFxuJykpXG5cdFx0XHR0aGlzLmxvZ3MgPSB0aGlzLmxvZ3MuY29uY2F0KGxvZ3MpXG5cdFx0fVxuXHR9XG5cblx0bG9nKC4uLmxvZ3MpIHtcblx0XHRpZiAobG9ncy5sZW5ndGggPiAwKSB7XG5cdFx0XHR0aGlzLmxvZ3MgPSBbLi4udGhpcy5sb2dzLCAuLi5sb2dzXVxuXHRcdH1cblx0XHRjb25zb2xlLmxvZyhsb2dzLmpvaW4odGhpcy5sb2dTZXBhcmF0b3IpKVxuXHR9XG5cblx0bG9nRXJyKGVycm9yKSB7XG5cdFx0c3dpdGNoICh0aGlzLlBsYXRmb3JtKCkpIHtcblx0XHRcdGNhc2UgJ1N1cmdlJzpcblx0XHRcdGNhc2UgJ0xvb24nOlxuXHRcdFx0Y2FzZSAnU3Rhc2gnOlxuXHRcdFx0Y2FzZSAnU2hhZG93cm9ja2V0Jzpcblx0XHRcdGNhc2UgJ1F1YW50dW11bHQgWCc6XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0aGlzLmxvZygnJywgYOKdl++4jyAke3RoaXMubmFtZX0sIOmUmeivryFgLCBlcnJvcilcblx0XHRcdFx0YnJlYWtcblx0XHR9XG5cdH1cblxuXHR3YWl0KHRpbWUpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgdGltZSkpXG5cdH1cblxuXHRkb25lKHZhbCA9IHt9KSB7XG5cdFx0Y29uc3QgZW5kVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG5cdFx0Y29uc3QgY29zdFRpbWUgPSAoZW5kVGltZSAtIHRoaXMuc3RhcnRUaW1lKSAvIDEwMDBcblx0XHR0aGlzLmxvZygnJywgYPCfmqkgJHt0aGlzLm5hbWV9LCDnu5PmnZ8hIPCflZsgJHtjb3N0VGltZX0g56eSYClcblx0XHR0aGlzLmxvZygpXG5cdFx0c3dpdGNoICh0aGlzLlBsYXRmb3JtKCkpIHtcblx0XHRcdGNhc2UgJ1N1cmdlJzpcblx0XHRcdGNhc2UgJ0xvb24nOlxuXHRcdFx0Y2FzZSAnU3Rhc2gnOlxuXHRcdFx0Y2FzZSAnU2hhZG93cm9ja2V0Jzpcblx0XHRcdGNhc2UgJ1F1YW50dW11bHQgWCc6XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQkZG9uZSh2YWwpXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEdldCBFbnZpcm9ubWVudCBWYXJpYWJsZXNcblx0ICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1ZpcmdpbENseW5lL0dldFNvbWVGcmllcy9ibG9iL21haW4vZnVuY3Rpb24vZ2V0RU5WL2dldEVOVi5qc1xuXHQgKiBAYXV0aG9yIFZpcmdpbENseW5lXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBrZXkgLSBQZXJzaXN0ZW50IFN0b3JlIEtleVxuXHQgKiBAcGFyYW0ge0FycmF5fSBuYW1lcyAtIFBsYXRmb3JtIE5hbWVzXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhYmFzZSAtIERlZmF1bHQgRGF0YWJhc2Vcblx0ICogQHJldHVybiB7T2JqZWN0fSB7IFNldHRpbmdzLCBDYWNoZXMsIENvbmZpZ3MgfVxuXHQgKi9cblx0Z2V0RU5WKGtleSwgbmFtZXMsIGRhdGFiYXNlKSB7XG5cdFx0Ly90aGlzLmxvZyhg4piR77iPICR7dGhpcy5uYW1lfSwgR2V0IEVudmlyb25tZW50IFZhcmlhYmxlc2AsIFwiXCIpO1xuXHRcdC8qKioqKioqKioqKioqKioqKiBCb3hKcyAqKioqKioqKioqKioqKioqKi9cblx0XHQvLyDljIXoo4XkuLrlsYDpg6jlj5jph4/vvIznlKjlrozph4rmlL7lhoXlrZhcblx0XHQvLyBCb3hKc+eahOa4heepuuaTjeS9nOi/lOWbnuWBh+WAvOepuuWtl+espuS4siwg6YC76L6R5oiW5pON5L2c56ym5Lya5Zyo5bem5L6n5pON5L2c5pWw5Li65YGH5YC85pe26L+U5Zue5Y+z5L6n5pON5L2c5pWw44CCXG5cdFx0bGV0IEJveEpzID0gdGhpcy5nZXRqc29uKGtleSwgZGF0YWJhc2UpO1xuXHRcdC8vdGhpcy5sb2coYPCfmqcgJHt0aGlzLm5hbWV9LCBHZXQgRW52aXJvbm1lbnQgVmFyaWFibGVzYCwgYEJveEpz57G75Z6LOiAke3R5cGVvZiBCb3hKc31gLCBgQm94SnPlhoXlrrk6ICR7SlNPTi5zdHJpbmdpZnkoQm94SnMpfWAsIFwiXCIpO1xuXHRcdC8qKioqKioqKioqKioqKioqKiBBcmd1bWVudCAqKioqKioqKioqKioqKioqKi9cblx0XHRsZXQgQXJndW1lbnQgPSB7fTtcblx0XHRpZiAodHlwZW9mICRhcmd1bWVudCAhPT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdFx0aWYgKEJvb2xlYW4oJGFyZ3VtZW50KSkge1xuXHRcdFx0XHQvL3RoaXMubG9nKGDwn46JICR7dGhpcy5uYW1lfSwgJEFyZ3VtZW50YCk7XG5cdFx0XHRcdGxldCBhcmcgPSBPYmplY3QuZnJvbUVudHJpZXMoJGFyZ3VtZW50LnNwbGl0KFwiJlwiKS5tYXAoKGl0ZW0pID0+IGl0ZW0uc3BsaXQoXCI9XCIpLm1hcChpID0+IGkucmVwbGFjZSgvXFxcIi9nLCAnJykpKSk7XG5cdFx0XHRcdC8vdGhpcy5sb2coSlNPTi5zdHJpbmdpZnkoYXJnKSk7XG5cdFx0XHRcdGZvciAobGV0IGl0ZW0gaW4gYXJnKSB0aGlzLnNldFBhdGgoQXJndW1lbnQsIGl0ZW0sIGFyZ1tpdGVtXSk7XG5cdFx0XHRcdC8vdGhpcy5sb2coSlNPTi5zdHJpbmdpZnkoQXJndW1lbnQpKTtcblx0XHRcdH07XG5cdFx0XHQvL3RoaXMubG9nKGDinIUgJHt0aGlzLm5hbWV9LCBHZXQgRW52aXJvbm1lbnQgVmFyaWFibGVzYCwgYEFyZ3VtZW5057G75Z6LOiAke3R5cGVvZiBBcmd1bWVudH1gLCBgQXJndW1lbnTlhoXlrrk6ICR7SlNPTi5zdHJpbmdpZnkoQXJndW1lbnQpfWAsIFwiXCIpO1xuXHRcdH07XG5cdFx0LyoqKioqKioqKioqKioqKioqIFN0b3JlICoqKioqKioqKioqKioqKioqL1xuXHRcdGNvbnN0IFN0b3JlID0geyBTZXR0aW5nczogZGF0YWJhc2U/LkRlZmF1bHQ/LlNldHRpbmdzIHx8IHt9LCBDb25maWdzOiBkYXRhYmFzZT8uRGVmYXVsdD8uQ29uZmlncyB8fCB7fSwgQ2FjaGVzOiB7fSB9O1xuXHRcdGlmICghQXJyYXkuaXNBcnJheShuYW1lcykpIG5hbWVzID0gW25hbWVzXTtcblx0XHQvL3RoaXMubG9nKGDwn5qnICR7dGhpcy5uYW1lfSwgR2V0IEVudmlyb25tZW50IFZhcmlhYmxlc2AsIGBuYW1lc+exu+WeizogJHt0eXBlb2YgbmFtZXN9YCwgYG5hbWVz5YaF5a65OiAke0pTT04uc3RyaW5naWZ5KG5hbWVzKX1gLCBcIlwiKTtcblx0XHRmb3IgKGxldCBuYW1lIG9mIG5hbWVzKSB7XG5cdFx0XHRTdG9yZS5TZXR0aW5ncyA9IHsgLi4uU3RvcmUuU2V0dGluZ3MsIC4uLmRhdGFiYXNlPy5bbmFtZV0/LlNldHRpbmdzLCAuLi5Bcmd1bWVudCwgLi4uQm94SnM/LltuYW1lXT8uU2V0dGluZ3MgfTtcblx0XHRcdFN0b3JlLkNvbmZpZ3MgPSB7IC4uLlN0b3JlLkNvbmZpZ3MsIC4uLmRhdGFiYXNlPy5bbmFtZV0/LkNvbmZpZ3MgfTtcblx0XHRcdGlmIChCb3hKcz8uW25hbWVdPy5DYWNoZXMgJiYgdHlwZW9mIEJveEpzPy5bbmFtZV0/LkNhY2hlcyA9PT0gXCJzdHJpbmdcIikgQm94SnNbbmFtZV0uQ2FjaGVzID0gSlNPTi5wYXJzZShCb3hKcz8uW25hbWVdPy5DYWNoZXMpO1xuXHRcdFx0U3RvcmUuQ2FjaGVzID0geyAuLi5TdG9yZS5DYWNoZXMsIC4uLkJveEpzPy5bbmFtZV0/LkNhY2hlcyB9O1xuXHRcdH07XG5cdFx0Ly90aGlzLmxvZyhg8J+apyAke3RoaXMubmFtZX0sIEdldCBFbnZpcm9ubWVudCBWYXJpYWJsZXNgLCBgU3RvcmUuU2V0dGluZ3Pnsbvlnos6ICR7dHlwZW9mIFN0b3JlLlNldHRpbmdzfWAsIGBTdG9yZS5TZXR0aW5nczogJHtKU09OLnN0cmluZ2lmeShTdG9yZS5TZXR0aW5ncyl9YCwgXCJcIik7XG5cdFx0dGhpcy50cmF2ZXJzZU9iamVjdChTdG9yZS5TZXR0aW5ncywgKGtleSwgdmFsdWUpID0+IHtcblx0XHRcdC8vdGhpcy5sb2coYPCfmqcgJHt0aGlzLm5hbWV9LCB0cmF2ZXJzZU9iamVjdGAsIGAke2tleX06ICR7dHlwZW9mIHZhbHVlfWAsIGAke2tleX06ICR7SlNPTi5zdHJpbmdpZnkodmFsdWUpfWAsIFwiXCIpO1xuXHRcdFx0aWYgKHZhbHVlID09PSBcInRydWVcIiB8fCB2YWx1ZSA9PT0gXCJmYWxzZVwiKSB2YWx1ZSA9IEpTT04ucGFyc2UodmFsdWUpOyAvLyDlrZfnrKbkuLLovaxCb29sZWFuXG5cdFx0XHRlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0aWYgKHZhbHVlLmluY2x1ZGVzKFwiLFwiKSkgdmFsdWUgPSB2YWx1ZS5zcGxpdChcIixcIikubWFwKGl0ZW0gPT4gdGhpcy5zdHJpbmcybnVtYmVyKGl0ZW0pKTsgLy8g5a2X56ym5Liy6L2s5pWw57uE6L2s5pWw5a2XXG5cdFx0XHRcdGVsc2UgdmFsdWUgPSB0aGlzLnN0cmluZzJudW1iZXIodmFsdWUpOyAvLyDlrZfnrKbkuLLovazmlbDlrZdcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0fSk7XG5cdFx0Ly90aGlzLmxvZyhg4pyFICR7dGhpcy5uYW1lfSwgR2V0IEVudmlyb25tZW50IFZhcmlhYmxlc2AsIGBTdG9yZTogJHt0eXBlb2YgU3RvcmUuQ2FjaGVzfWAsIGBTdG9yZeWGheWuuTogJHtKU09OLnN0cmluZ2lmeShTdG9yZSl9YCwgXCJcIik7XG5cdFx0cmV0dXJuIFN0b3JlO1xuXHR9O1xuXG5cdC8qKioqKioqKioqKioqKioqKiBmdW5jdGlvbiAqKioqKioqKioqKioqKioqKi9cblx0c2V0UGF0aChvYmplY3QsIHBhdGgsIHZhbHVlKSB7IHBhdGguc3BsaXQoXCIuXCIpLnJlZHVjZSgobywgcCwgaSkgPT4gb1twXSA9IHBhdGguc3BsaXQoXCIuXCIpLmxlbmd0aCA9PT0gKytpID8gdmFsdWUgOiBvW3BdIHx8IHt9LCBvYmplY3QpIH1cblx0dHJhdmVyc2VPYmplY3QobywgYykgeyBmb3IgKHZhciB0IGluIG8pIHsgdmFyIG4gPSBvW3RdOyBvW3RdID0gXCJvYmplY3RcIiA9PSB0eXBlb2YgbiAmJiBudWxsICE9PSBuID8gdGhpcy50cmF2ZXJzZU9iamVjdChuLCBjKSA6IGModCwgbikgfSByZXR1cm4gbyB9XG5cdHN0cmluZzJudW1iZXIoc3RyaW5nKSB7IGlmIChzdHJpbmcgJiYgIWlzTmFOKHN0cmluZykpIHN0cmluZyA9IHBhcnNlSW50KHN0cmluZywgMTApOyByZXR1cm4gc3RyaW5nIH1cbn1cblxuZXhwb3J0IGNsYXNzIEh0dHAge1xuXHRjb25zdHJ1Y3RvcihlbnYpIHtcblx0XHR0aGlzLmVudiA9IGVudlxuXHR9XG5cblx0c2VuZChvcHRzLCBtZXRob2QgPSAnR0VUJykge1xuXHRcdG9wdHMgPSB0eXBlb2Ygb3B0cyA9PT0gJ3N0cmluZycgPyB7IHVybDogb3B0cyB9IDogb3B0c1xuXHRcdGxldCBzZW5kZXIgPSB0aGlzLmdldFxuXHRcdGlmIChtZXRob2QgPT09ICdQT1NUJykge1xuXHRcdFx0c2VuZGVyID0gdGhpcy5wb3N0XG5cdFx0fVxuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRzZW5kZXIuY2FsbCh0aGlzLCBvcHRzLCAoZXJyb3IsIHJlc3BvbnNlLCBib2R5KSA9PiB7XG5cdFx0XHRcdGlmIChlcnJvcikgcmVqZWN0KGVycm9yKVxuXHRcdFx0XHRlbHNlIHJlc29sdmUocmVzcG9uc2UpXG5cdFx0XHR9KVxuXHRcdH0pXG5cdH1cblxuXHRnZXQob3B0cykge1xuXHRcdHJldHVybiB0aGlzLnNlbmQuY2FsbCh0aGlzLmVudiwgb3B0cylcblx0fVxuXG5cdHBvc3Qob3B0cykge1xuXHRcdHJldHVybiB0aGlzLnNlbmQuY2FsbCh0aGlzLmVudiwgb3B0cywgJ1BPU1QnKVxuXHR9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBVUkkge1xuXHRjb25zdHJ1Y3RvcihvcHRzID0gW10pIHtcblx0XHR0aGlzLm5hbWUgPSBcIlVSSSB2MS4yLjZcIjtcblx0XHR0aGlzLm9wdHMgPSBvcHRzO1xuXHRcdHRoaXMuanNvbiA9IHsgc2NoZW1lOiBcIlwiLCBob3N0OiBcIlwiLCBwYXRoOiBcIlwiLCBxdWVyeToge30gfTtcblx0fTtcblxuXHRwYXJzZSh1cmwpIHtcblx0XHRjb25zdCBVUkxSZWdleCA9IC8oPzooPzxzY2hlbWU+LispOlxcL1xcLyg/PGhvc3Q+W14vXSspKT9cXC8/KD88cGF0aD5bXj9dKyk/XFw/Pyg/PHF1ZXJ5PlteP10rKT8vO1xuXHRcdGxldCBqc29uID0gdXJsLm1hdGNoKFVSTFJlZ2V4KT8uZ3JvdXBzID8/IG51bGw7XG5cdFx0aWYgKGpzb24/LnBhdGgpIGpzb24ucGF0aHMgPSBqc29uLnBhdGguc3BsaXQoXCIvXCIpOyBlbHNlIGpzb24ucGF0aCA9IFwiXCI7XG5cdFx0Ly9pZiAoanNvbj8ucGF0aHM/LmF0KC0xKT8uaW5jbHVkZXMoXCIuXCIpKSBqc29uLmZvcm1hdCA9IGpzb24ucGF0aHMuYXQoLTEpLnNwbGl0KFwiLlwiKS5hdCgtMSk7XG5cdFx0aWYgKGpzb24/LnBhdGhzKSB7XG5cdFx0XHRjb25zdCBmaWxlTmFtZSA9IGpzb24ucGF0aHNbanNvbi5wYXRocy5sZW5ndGggLSAxXTtcblx0XHRcdGlmIChmaWxlTmFtZT8uaW5jbHVkZXMoXCIuXCIpKSB7XG5cdFx0XHRcdGNvbnN0IGxpc3QgPSBmaWxlTmFtZS5zcGxpdChcIi5cIik7XG5cdFx0XHRcdGpzb24uZm9ybWF0ID0gbGlzdFtsaXN0Lmxlbmd0aCAtIDFdO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoanNvbj8ucXVlcnkpIGpzb24ucXVlcnkgPSBPYmplY3QuZnJvbUVudHJpZXMoanNvbi5xdWVyeS5zcGxpdChcIiZcIikubWFwKChwYXJhbSkgPT4gcGFyYW0uc3BsaXQoXCI9XCIpKSk7XG5cdFx0cmV0dXJuIGpzb25cblx0fTtcblxuXHRzdHJpbmdpZnkoanNvbiA9IHRoaXMuanNvbikge1xuXHRcdGxldCB1cmwgPSBcIlwiO1xuXHRcdGlmIChqc29uPy5zY2hlbWUgJiYganNvbj8uaG9zdCkgdXJsICs9IGpzb24uc2NoZW1lICsgXCI6Ly9cIiArIGpzb24uaG9zdDtcblx0XHRpZiAoanNvbj8ucGF0aCkgdXJsICs9IChqc29uPy5ob3N0KSA/IFwiL1wiICsganNvbi5wYXRoIDoganNvbi5wYXRoO1xuXHRcdGlmIChqc29uPy5xdWVyeSkgdXJsICs9IFwiP1wiICsgT2JqZWN0LmVudHJpZXMoanNvbi5xdWVyeSkubWFwKHBhcmFtID0+IHBhcmFtLmpvaW4oXCI9XCIpKS5qb2luKFwiJlwiKTtcblx0XHRyZXR1cm4gdXJsXG5cdH07XG59XG4iLCIvKlxuUkVBRE1FOiBodHRwczovL2dpdGh1Yi5jb20vVmlyZ2lsQ2x5bmUvaVJpbmdvXG4qL1xuXG5pbXBvcnQgRU5WcyBmcm9tIFwiLi4vRU5WL0VOVi5tanNcIjtcbmNvbnN0ICQgPSBuZXcgRU5WcyhcIu+jvyBpUmluZ286IFNldCBFbnZpcm9ubWVudCBWYXJpYWJsZXMgYmV0YVwiKTtcblxuLyoqXG4gKiBTZXQgRW52aXJvbm1lbnQgVmFyaWFibGVzXG4gKiBAYXV0aG9yIFZpcmdpbENseW5lXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZSAtIFBlcnNpc3RlbnQgU3RvcmUgS2V5XG4gKiBAcGFyYW0ge0FycmF5fSBwbGF0Zm9ybXMgLSBQbGF0Zm9ybSBOYW1lc1xuICogQHBhcmFtIHtPYmplY3R9IGRhdGFiYXNlIC0gRGVmYXVsdCBEYXRhQmFzZVxuICogQHJldHVybiB7T2JqZWN0fSB7IFNldHRpbmdzLCBDYWNoZXMsIENvbmZpZ3MgfVxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBzZXRFTlYobmFtZSwgcGxhdGZvcm1zLCBkYXRhYmFzZSkge1xuXHQkLmxvZyhg4piR77iPICR7JC5uYW1lfWAsIFwiXCIpO1xuXHRsZXQgeyBTZXR0aW5ncywgQ2FjaGVzLCBDb25maWdzIH0gPSAkLmdldEVOVihuYW1lLCBwbGF0Zm9ybXMsIGRhdGFiYXNlKTtcblx0LyoqKioqKioqKioqKioqKioqIFNldHRpbmdzICoqKioqKioqKioqKioqKioqL1xuXHRpZiAoU2V0dGluZ3M/LlRhYnMgJiYgIUFycmF5LmlzQXJyYXkoU2V0dGluZ3M/LlRhYnMpKSAkLmxvZGFzaF9zZXQoU2V0dGluZ3MsIFwiVGFic1wiLCAoU2V0dGluZ3M/LlRhYnMpID8gW1NldHRpbmdzLlRhYnMudG9TdHJpbmcoKV0gOiBbXSk7XG5cdGlmIChTZXR0aW5ncz8uRG9tYWlucyAmJiAhQXJyYXkuaXNBcnJheShTZXR0aW5ncz8uRG9tYWlucykpICQubG9kYXNoX3NldChTZXR0aW5ncywgXCJEb21haW5zXCIsIChTZXR0aW5ncz8uRG9tYWlucykgPyBbU2V0dGluZ3MuRG9tYWlucy50b1N0cmluZygpXSA6IFtdKTtcblx0aWYgKFNldHRpbmdzPy5GdW5jdGlvbnMgJiYgIUFycmF5LmlzQXJyYXkoU2V0dGluZ3M/LkZ1bmN0aW9ucykpICQubG9kYXNoX3NldChTZXR0aW5ncywgXCJGdW5jdGlvbnNcIiwgKFNldHRpbmdzPy5GdW5jdGlvbnMpID8gW1NldHRpbmdzLkZ1bmN0aW9ucy50b1N0cmluZygpXSA6IFtdKTtcblx0JC5sb2coYOKchSAkeyQubmFtZX1gLCBgU2V0dGluZ3M6ICR7dHlwZW9mIFNldHRpbmdzfWAsIGBTZXR0aW5nc+WGheWuuTogJHtKU09OLnN0cmluZ2lmeShTZXR0aW5ncyl9YCwgXCJcIik7XG5cdC8qKioqKioqKioqKioqKioqKiBDYWNoZXMgKioqKioqKioqKioqKioqKiovXG5cdC8vJC5sb2coYOKchSAkeyQubmFtZX1gLCBgQ2FjaGVzOiAke3R5cGVvZiBDYWNoZXN9YCwgYENhY2hlc+WGheWuuTogJHtKU09OLnN0cmluZ2lmeShDYWNoZXMpfWAsIFwiXCIpO1xuXHQvKioqKioqKioqKioqKioqKiogQ29uZmlncyAqKioqKioqKioqKioqKioqKi9cblx0Q29uZmlncy5TdG9yZWZyb250ID0gbmV3IE1hcChDb25maWdzLlN0b3JlZnJvbnQpO1xuXHRpZiAoQ29uZmlncy5Mb2NhbGUpIENvbmZpZ3MuTG9jYWxlID0gbmV3IE1hcChDb25maWdzLkxvY2FsZSk7XG5cdGlmIChDb25maWdzLmkxOG4pIGZvciAobGV0IHR5cGUgaW4gQ29uZmlncy5pMThuKSBDb25maWdzLmkxOG5bdHlwZV0gPSBuZXcgTWFwKENvbmZpZ3MuaTE4blt0eXBlXSk7XG5cdHJldHVybiB7IFNldHRpbmdzLCBDYWNoZXMsIENvbmZpZ3MgfTtcbn07XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwidmFyIGdldFByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mID8gKG9iaikgPT4gKE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopKSA6IChvYmopID0+IChvYmouX19wcm90b19fKTtcbnZhciBsZWFmUHJvdG90eXBlcztcbi8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuLy8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4vLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbi8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuLy8gbW9kZSAmIDE2OiByZXR1cm4gdmFsdWUgd2hlbiBpdCdzIFByb21pc2UtbGlrZVxuLy8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuX193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcblx0aWYobW9kZSAmIDEpIHZhbHVlID0gdGhpcyh2YWx1ZSk7XG5cdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG5cdGlmKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUpIHtcblx0XHRpZigobW9kZSAmIDQpICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcblx0XHRpZigobW9kZSAmIDE2KSAmJiB0eXBlb2YgdmFsdWUudGhlbiA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHZhbHVlO1xuXHR9XG5cdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG5cdHZhciBkZWYgPSB7fTtcblx0bGVhZlByb3RvdHlwZXMgPSBsZWFmUHJvdG90eXBlcyB8fCBbbnVsbCwgZ2V0UHJvdG8oe30pLCBnZXRQcm90byhbXSksIGdldFByb3RvKGdldFByb3RvKV07XG5cdGZvcih2YXIgY3VycmVudCA9IG1vZGUgJiAyICYmIHZhbHVlOyB0eXBlb2YgY3VycmVudCA9PSAnb2JqZWN0JyAmJiAhfmxlYWZQcm90b3R5cGVzLmluZGV4T2YoY3VycmVudCk7IGN1cnJlbnQgPSBnZXRQcm90byhjdXJyZW50KSkge1xuXHRcdE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGN1cnJlbnQpLmZvckVhY2goKGtleSkgPT4gKGRlZltrZXldID0gKCkgPT4gKHZhbHVlW2tleV0pKSk7XG5cdH1cblx0ZGVmWydkZWZhdWx0J10gPSAoKSA9PiAodmFsdWUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGRlZik7XG5cdHJldHVybiBucztcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8qXG5SRUFETUU6IGh0dHBzOi8vZ2l0aHViLmNvbS9WaXJnaWxDbHluZS9pUmluZ29cbiovXG5cbmltcG9ydCBFTlZzIGZyb20gXCIuL0VOVi9FTlYubWpzXCI7XG5pbXBvcnQgVVJJcyBmcm9tIFwiLi9VUkkvVVJJLm1qc1wiO1xuaW1wb3J0IHNldEVOViBmcm9tIFwiLi9mdW5jdGlvbi9zZXRFTlYubWpzXCI7XG5cbmltcG9ydCAqIGFzIERlZmF1bHQgZnJvbSBcIi4vZGF0YWJhc2UvRGVmYXVsdC5qc29uXCI7XG5pbXBvcnQgKiBhcyBMb2NhdGlvbiBmcm9tIFwiLi9kYXRhYmFzZS9Mb2NhdGlvbi5qc29uXCI7XG5pbXBvcnQgKiBhcyBOZXdzIGZyb20gXCIuL2RhdGFiYXNlL05ld3MuanNvblwiO1xuaW1wb3J0ICogYXMgUHJpdmF0ZVJlbGF5IGZyb20gXCIuL2RhdGFiYXNlL1ByaXZhdGVSZWxheS5qc29uXCI7XG5pbXBvcnQgKiBhcyBTaXJpIGZyb20gXCIuL2RhdGFiYXNlL1NpcmkuanNvblwiO1xuaW1wb3J0ICogYXMgVGVzdEZsaWdodCBmcm9tIFwiLi9kYXRhYmFzZS9UZXN0RmxpZ2h0Lmpzb25cIjtcbmltcG9ydCAqIGFzIFRWIGZyb20gXCIuL2RhdGFiYXNlL1RWLmpzb25cIjtcblxuY29uc3QgJCA9IG5ldyBFTlZzKFwi76O/IGlSaW5nbzog8J+TuiDvo79UViB2My4yLjIoMSkgcmVxdWVzdC5iZXRhXCIpO1xuY29uc3QgVVJJID0gbmV3IFVSSXMoKTtcbmNvbnN0IERhdGFCYXNlID0ge1xuXHRcIkRlZmF1bHRcIjogRGVmYXVsdCxcblx0XCJMb2NhdGlvblwiOiBMb2NhdGlvbixcblx0XCJOZXdzXCI6IE5ld3MsXG5cdFwiUHJpdmF0ZVJlbGF5XCI6IFByaXZhdGVSZWxheSxcblx0XCJTaXJpXCI6IFNpcmksXG5cdFwiVGVzdEZsaWdodFwiOiBUZXN0RmxpZ2h0LFxuXHRcIlRWXCI6IFRWLFxufTtcblxuLy8g5p6E6YCg5Zue5aSN5pWw5o2uXG5sZXQgJHJlc3BvbnNlID0gdW5kZWZpbmVkO1xuXG4vKioqKioqKioqKioqKioqKiogUHJvY2Vzc2luZyAqKioqKioqKioqKioqKioqKi9cbi8vIOino+aehFVSTFxuY29uc3QgVVJMID0gVVJJLnBhcnNlKCRyZXF1ZXN0LnVybCk7XG4kLmxvZyhg4pqgICR7JC5uYW1lfWAsIGBVUkw6ICR7SlNPTi5zdHJpbmdpZnkoVVJMKX1gLCBcIlwiKTtcbi8vIOiOt+WPlui/nuaOpeWPguaVsFxuY29uc3QgTUVUSE9EID0gJHJlcXVlc3QubWV0aG9kLCBIT1NUID0gVVJMLmhvc3QsIFBBVEggPSBVUkwucGF0aCwgUEFUSHMgPSBVUkwucGF0aHM7XG4kLmxvZyhg4pqgICR7JC5uYW1lfWAsIGBNRVRIT0Q6ICR7TUVUSE9EfWAsIFwiXCIpO1xuLy8g6Kej5p6Q5qC85byPXG5jb25zdCBGT1JNQVQgPSAoJHJlcXVlc3QuaGVhZGVycz8uW1wiQ29udGVudC1UeXBlXCJdID8/ICRyZXF1ZXN0LmhlYWRlcnM/LltcImNvbnRlbnQtdHlwZVwiXSk/LnNwbGl0KFwiO1wiKT8uWzBdO1xuJC5sb2coYOKaoCAkeyQubmFtZX1gLCBgRk9STUFUOiAke0ZPUk1BVH1gLCBcIlwiKTtcbihhc3luYyAoKSA9PiB7XG5cdGNvbnN0IHsgU2V0dGluZ3MsIENhY2hlcywgQ29uZmlncyB9ID0gc2V0RU5WKFwiaVJpbmdvXCIsIFwiVFZcIiwgRGF0YUJhc2UpO1xuXHQkLmxvZyhg4pqgICR7JC5uYW1lfWAsIGBTZXR0aW5ncy5Td2l0Y2g6ICR7U2V0dGluZ3M/LlN3aXRjaH1gLCBcIlwiKTtcblx0c3dpdGNoIChTZXR0aW5ncy5Td2l0Y2gpIHtcblx0XHRjYXNlIHRydWU6XG5cdFx0ZGVmYXVsdDpcblx0XHRcdC8vIOWIm+W7uuepuuaVsOaNrlxuXHRcdFx0bGV0IGJvZHkgPSB7fTtcblx0XHRcdC8vIOiuvue9rum7mOiupOexu+Wei1xuXHRcdFx0bGV0IFR5cGUgPSBcIk90aGVyXCI7XG5cdFx0XHQvLyDmlrnms5XliKTmlq1cblx0XHRcdHN3aXRjaCAoTUVUSE9EKSB7XG5cdFx0XHRcdGNhc2UgXCJQT1NUXCI6XG5cdFx0XHRcdGNhc2UgXCJQVVRcIjpcblx0XHRcdFx0Y2FzZSBcIlBBVENIXCI6XG5cdFx0XHRcdGNhc2UgXCJERUxFVEVcIjpcblx0XHRcdFx0XHQvLyDmoLzlvI/liKTmlq1cblx0XHRcdFx0XHRzd2l0Y2ggKEZPUk1BVCkge1xuXHRcdFx0XHRcdFx0Y2FzZSB1bmRlZmluZWQ6IC8vIOinhuS4uuaXoGJvZHlcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwidGV4dC9wbGFpblwiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcInRleHQvaHRtbFwiOlxuXHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0Ly8g5Li75py65Yik5patXG5cdFx0XHRcdFx0XHRcdHN3aXRjaCAoSE9TVCkge1xuXHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJ1dHMtYXBpLml0dW5lcy5hcHBsZS5jb21cIjpcblx0XHRcdFx0XHRcdFx0XHRcdC8vIOi3r+W+hOWIpOaWrVxuXHRcdFx0XHRcdFx0XHRcdFx0c3dpdGNoIChQQVRIKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJ1dHMvdjMvZmF2b3JpdGUtcGVvcGxlXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJ1dHMvdjMvZmF2b3JpdGUtdGVhbXNcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcInV0cy92Mi9mYXZvcml0ZXNcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcInV0cy92Mi9mYXZvcml0ZXMvYWRkXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJ1dHMvdjIvZmF2b3JpdGVzL3JlbW92ZVwiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFR5cGUgPSBcIlNwb3J0c1wiO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmICgkcmVxdWVzdC5ib2R5KSAkcmVxdWVzdC5ib2R5ID0gJHJlcXVlc3QuYm9keS5yZXBsYWNlKC9zZj1bXFxkXXs2fS8sIGBzZj0ke0NvbmZpZ3MuU3RvcmVmcm9udC5nZXQoU2V0dGluZ3MuQ291bnRyeUNvZGVbVHlwZV0pfWApO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi94LW1wZWdVUkxcIjpcblx0XHRcdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi94LW1wZWd1cmxcIjpcblx0XHRcdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi92bmQuYXBwbGUubXBlZ3VybFwiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcImF1ZGlvL21wZWd1cmxcIjpcblx0XHRcdFx0XHRcdFx0Ly9ib2R5ID0gTTNVOC5wYXJzZSgkcmVxdWVzdC5ib2R5KTtcblx0XHRcdFx0XHRcdFx0Ly8kLmxvZyhg8J+apyAkeyQubmFtZX1gLCBgYm9keTogJHtKU09OLnN0cmluZ2lmeShib2R5KX1gLCBcIlwiKTtcblx0XHRcdFx0XHRcdFx0Ly8kcmVxdWVzdC5ib2R5ID0gTTNVOC5zdHJpbmdpZnkoYm9keSk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSBcInRleHQveG1sXCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwidGV4dC9wbGlzdFwiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3htbFwiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3BsaXN0XCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24veC1wbGlzdFwiOlxuXHRcdFx0XHRcdFx0XHQvL2JvZHkgPSBYTUwucGFyc2UoJHJlcXVlc3QuYm9keSk7XG5cdFx0XHRcdFx0XHRcdC8vJC5sb2coYPCfmqcgJHskLm5hbWV9YCwgYGJvZHk6ICR7SlNPTi5zdHJpbmdpZnkoYm9keSl9YCwgXCJcIik7XG5cdFx0XHRcdFx0XHRcdC8vJHJlcXVlc3QuYm9keSA9IFhNTC5zdHJpbmdpZnkoYm9keSk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSBcInRleHQvdnR0XCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24vdnR0XCI6XG5cdFx0XHRcdFx0XHRcdC8vYm9keSA9IFZUVC5wYXJzZSgkcmVxdWVzdC5ib2R5KTtcblx0XHRcdFx0XHRcdFx0Ly8kLmxvZyhg8J+apyAkeyQubmFtZX1gLCBgYm9keTogJHtKU09OLnN0cmluZ2lmeShib2R5KX1gLCBcIlwiKTtcblx0XHRcdFx0XHRcdFx0Ly8kcmVxdWVzdC5ib2R5ID0gVlRULnN0cmluZ2lmeShib2R5KTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIFwidGV4dC9qc29uXCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24vanNvblwiOlxuXHRcdFx0XHRcdFx0XHRib2R5ID0gSlNPTi5wYXJzZSgkcmVxdWVzdC5ib2R5ID8/IFwie31cIik7XG5cdFx0XHRcdFx0XHRcdC8vIOS4u+acuuWIpOaWrVxuXHRcdFx0XHRcdFx0XHRzd2l0Y2ggKEhPU1QpIHtcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwidXRzLWFwaS5pdHVuZXMuYXBwbGUuY29tXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyDot6/lvoTliKTmlq1cblx0XHRcdFx0XHRcdFx0XHRcdHN3aXRjaCAoUEFUSCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwidXRzL3YzL3VzZXIvc2V0dGluZ3NcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRUeXBlID0gXCJTZXR0aW5nc1wiO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCQubG9nKGDwn5qnICR7JC5uYW1lfSwg6LCD6K+V5L+h5oGvYCwgSlNPTi5zdHJpbmdpZnkoYm9keSksIFwiXCIpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcInVtYy10ZW1wby1hcGkuYXBwbGUuY29tXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyDot6/lvoTliKTmlq1cblx0XHRcdFx0XHRcdFx0XHRcdHN3aXRjaCAoUEFUSCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwidjMvY2hhbm5lbHMvc2NvcmVib2FyZFwiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwidjMvY2hhbm5lbHMvc2NvcmVib2FyZC9cIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRUeXBlID0gXCJTcG9ydHNcIjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQkLmxvZyhg8J+apyAkeyQubmFtZX0sIOiwg+ivleS/oeaBr2AsIEpTT04uc3RyaW5naWZ5KGJvZHkpLCBcIlwiKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHQkcmVxdWVzdC5ib2R5ID0gSlNPTi5zdHJpbmdpZnkoYm9keSk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3Byb3RvYnVmXCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24veC1wcm90b2J1ZlwiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3ZuZC5nb29nbGUucHJvdG9idWZcIjpcblx0XHRcdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi9ncnBjXCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24vZ3JwYytwcm90b1wiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxlY2F0aW9uL29jdGV0LXN0cmVhbVwiOlxuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdC8vYnJlYWs7IC8vIOS4jeS4reaWre+8jOe7p+e7reWkhOeQhlVSTFxuXHRcdFx0XHRjYXNlIFwiR0VUXCI6XG5cdFx0XHRcdGNhc2UgXCJIRUFEXCI6XG5cdFx0XHRcdGNhc2UgXCJPUFRJT05TXCI6XG5cdFx0XHRcdGNhc2UgdW5kZWZpbmVkOiAvLyBRWOeJm+mAvO+8jHNjcmlwdC1lY2hvLXJlc3BvbnNl5LiN6L+U5ZuebWV0aG9kXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0Ly8g5Li75py65Yik5patXG5cdFx0XHRcdFx0c3dpdGNoIChIT1NUKSB7XG5cdFx0XHRcdFx0XHRjYXNlIFwidXRzLWFwaS5pdHVuZXMuYXBwbGUuY29tXCI6XG5cdFx0XHRcdFx0XHRcdGNvbnN0IFZlcnNpb24gPSBwYXJzZUludChVUkwucXVlcnk/LnYsIDEwKSwgUGxhdGZvcm0gPSBVUkwucXVlcnk/LnBmbSwgTG9jYWxlID0gKCRyZXF1ZXN0LmhlYWRlcnM/LltcIlgtQXBwbGUtSS1Mb2NhbGVcIl0gPz8gJHJlcXVlc3QuaGVhZGVycz8uW1wieC1hcHBsZS1pLWxvY2FsZVwiXSk/LnNwbGl0KCdfJyk/LlswXSA/PyBcInpoXCI7XG5cdFx0XHRcdFx0XHRcdC8vIOi3r+W+hOWIpOaWrVxuXHRcdFx0XHRcdFx0XHRzd2l0Y2ggKFBBVEgpIHtcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwidXRzL3YzL2NvbmZpZ3VyYXRpb25zXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRUeXBlID0gXCJDb25maWdzXCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoU2V0dGluZ3MuQ291bnRyeUNvZGVbVHlwZV0gIT09IFwiQVVUT1wiKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChVUkwucXVlcnkucmVnaW9uKSBVUkwucXVlcnkucmVnaW9uID0gU2V0dGluZ3MuQ291bnRyeUNvZGVbVHlwZV0gPz8gVVJMLnF1ZXJ5LnJlZ2lvbjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKFVSTC5xdWVyeS5jb3VudHJ5KSBVUkwucXVlcnkuY291bnRyeSA9IFNldHRpbmdzLkNvdW50cnlDb2RlW1R5cGVdID8/IFVSTC5xdWVyeS5jb3VudHJ5O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoVVJMLnF1ZXJ5LnNmaCkgVVJMLnF1ZXJ5LnNmaCA9IFVSTC5xdWVyeS5zZmgucmVwbGFjZSgvXFxkezZ9LywgQ29uZmlncy5TdG9yZWZyb250LmdldChTZXR0aW5ncy5Db3VudHJ5Q29kZVtUeXBlXSkpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdCQubG9nKGDwn5qnICR7JC5uYW1lfSwg6LCD6K+V5L+h5oGvYCwgYHJlZ2lvbiA9ICR7VVJMLnF1ZXJ5Py5yZWdpb259LCBjb3VudHJ5ID0gJHtVUkwucXVlcnk/LmNvdW50cnl9LCBzZmggPSAke1VSTC5xdWVyeT8uc2ZofWAsIFwiXCIpXG5cdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwidXRzL3YzL3VzZXIvc2V0dGluZ3NcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFR5cGUgPSBcIlNldHRpbmdzXCI7XG5cdFx0XHRcdFx0XHRcdFx0XHQkLmxvZyhg8J+apyAkeyQubmFtZX0sIOiwg+ivleS/oeaBr2AsIGBjYWxsZXIgPSAke1VSTC5xdWVyeT8uY2FsbGVyfSwgcGZtID0gJHtVUkwucXVlcnk/LnBmbX0sIHNmID0gJHtVUkwucXVlcnk/LnNmfWAsIFwiXCIpXG5cdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwidXRzL3YzL2NhbnZhc2VzL1Jvb3RzL3dhdGNoTm93XCI6XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcInV0cy92My9jYW52YXNlcy9yb290cy90YWhvbWFfd2F0Y2hub3dcIjpcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwidXRzL3YzL3NoZWx2ZXMvdXRzLmNvbC5VcE5leHRcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFR5cGUgPSBcIldhdGNoTm93XCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoU2V0dGluZ3NbXCJUaGlyZC1QYXJ0eVwiXSkgVVJMLnF1ZXJ5LnBmbSA9IChQbGF0Zm9ybSA9PT0gXCJkZXNrdG9wXCIpID8gXCJhcHBsZXR2XCIgOiBQbGF0Zm9ybTtcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJ1dHMvdjMvY2FudmFzZXMvQ2hhbm5lbHMvdHZzLnNiZC40MDAwXCI6XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcInV0cy92My9zaGVsdmVzL3V0cy5jb2wuQ2hhbm5lbFVwTmV4dC50dnMuc2JkLjQwMDBcIjpcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwidXRzL3YyL2JyYW5kcy9hcHBsZVR2UGx1c1wiOlxuXHRcdFx0XHRcdFx0XHRcdFx0VHlwZSA9IFwiT3JpZ2luYWxzXCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwidXRzL3YzL2NhbnZhc2VzL0NoYW5uZWxzL3R2cy5zYmQuNzAwMFwiOlxuXHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJ1dHMvdjMvc2hlbHZlcy91dHMuY29sLkNoYW5uZWxVcE5leHQudHZzLnNiZC43MDAwXCI6XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcInV0cy92My9zaGVsdmVzL2VkdC5jb2wuNjNiZjIwNTItNTBiOS00NGM4LWE2N2UtMzBlMTk2ZTE5YzYwXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRUeXBlID0gXCJPcmlnaW5hbHNcIjtcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1x0XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcInV0cy92My9jaGFubmVsc1wiOlxuXHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJ1dHMvdjIvYnJhbmRzXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRUeXBlID0gXCJDaGFubmVsc1wiO1xuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcInV0cy92My9jYW52YXNlcy9Sb290cy9zcG9ydHNcIjpcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwidXRzL3YzL3NoZWx2ZXMvdXRzLmNvbC5QZXJzb25hbGl6ZWRMaXZlU3BvcnRzXCI6XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcInV0cy92My9jbG9jay1zY29yZXNcIjpcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwidXRzL3YzL2xlYWd1ZXNcIjpcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwidXRzL3YyL3Nwb3J0cy9jbG9ja3Njb3JlXCI6XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcInV0cy92Mi9zcG9ydHMvY29tcGV0aXRvcnNcIjpcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwidXRzL3YyL3Nwb3J0cy9sZWFndWVcIjpcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwidXRzL3YyL3Nwb3J0cy9sZWFndWVzXCI6XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcInV0cy92Mi9zcG9ydHMvc3RhdHNJZExvb2t1cFwiOlxuXHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJ1dHMvdjIvc3BvcnRzL3RlYW1zTmVhck1lXCI6XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcInV0cy92My9jYW52YXNlcy9Sb29tcy9lZHQuaXRlbS42MzNlMDc2OC0yMTM1LTQzYWMtYTg3OC0yODk2NWI4NTNlYzVcIjogLy8gRklGQSBXb3JsZCBDdXAgMjAyMlxuXHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJ1dHMvdjMvY2FudmFzZXMvUm9vbXMvZWR0Lml0ZW0uNjM1OTY4YWMtODlkNy00NjE5LThmNWQtOGM3ODkwYWVmODEzXCI6IC8vIE5GTCBUSEFOS1NHSVZJTkcgMjAyMlxuXHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJ1dHMvdjMvY2FudmFzZXMvUm9vbXMvZWR0Lml0ZW0uNjIzMjdkZjEtNjg3NC00NzBlLTk4YjItYTViYmVhYzUwOWEyXCI6IC8vIEZyaWRheSBOaWdodCBCYXNlYmFsbCAtIE1MQiAtIEFwcGxlIFRWK1xuXHRcdFx0XHRcdFx0XHRcdFx0VHlwZSA9IFwiU3BvcnRzXCI7XG5cdFx0XHRcdFx0XHRcdFx0XHQvL2lmIChTZXR0aW5nc1tcIlRoaXJkLVBhcnR5XCJdKSBcblx0XHRcdFx0XHRcdFx0XHRcdFVSTC5xdWVyeS5wZm0gPSAoUGxhdGZvcm0gPT09IFwiZGVza3RvcFwiKSA/IFwiaXBhZFwiIDogUGxhdGZvcm07XG5cdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwidXRzL3YzL2NhbnZhc2VzL1Jvb3RzL2tpZHNcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFR5cGUgPSBcIktpZHNcIjtcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJ1dHMvdjMvY2FudmFzZXMvUm9vdHMvc3RvcmVcIjpcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwidXRzL3YzL2NhbnZhc2VzL1Jvb3RzL3RhaG9tYV9zdG9yZVwiOlxuXHRcdFx0XHRcdFx0XHRcdFx0VHlwZSA9IFwiU3RvcmVcIjtcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJ1dHMvdjMvY2FudmFzZXMvUm9vdHMvbW92aWVzXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRUeXBlID0gXCJNb3ZpZXNcIjtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChTZXR0aW5nc1tcIlRoaXJkLVBhcnR5XCJdKSBVUkwucXVlcnkucGZtID0gKFBsYXRmb3JtID09PSBcImRlc2t0b3BcIikgPyBcImlwYWRcIiA6IFBsYXRmb3JtO1xuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcInV0cy92My9jYW52YXNlcy9Sb290cy90dlwiOlxuXHRcdFx0XHRcdFx0XHRcdFx0VHlwZSA9IFwiVFZcIjtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChTZXR0aW5nc1tcIlRoaXJkLVBhcnR5XCJdKSBVUkwucXVlcnkucGZtID0gKFBsYXRmb3JtID09PSBcImRlc2t0b3BcIikgPyBcImlwYWRcIiA6IFBsYXRmb3JtO1xuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcInV0cy92My9mYXZvcml0ZS1wZW9wbGVcIjpcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwidXRzL3YzL2Zhdm9yaXRlLXRlYW1zXCI6XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcInV0cy92Mi9mYXZvcml0ZXNcIjpcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwidXRzL3YyL2Zhdm9yaXRlcy9hZGRcIjpcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwidXRzL3YyL2Zhdm9yaXRlcy9yZW1vdmVcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFR5cGUgPSBcIlNwb3J0c1wiO1xuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcInV0cy92My9jYW52YXNlcy9Sb290cy90YWhvbWFfc2VhcmNobGFuZGluZ1wiOlxuXHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJ1dHMvdjMvc2VhcmNoXCI6XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcInV0cy92My9zZWFyY2gvbGFuZGluZ1wiOlxuXHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJ1dHMvdjIvc2VhcmNoL2luY3JlbWVudGFsXCI6XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcInV0cy92Mi9zZWFyY2gvbGFuZGluZ1wiOlxuXHRcdFx0XHRcdFx0XHRcdFx0VHlwZSA9IFwiU2VhcmNoXCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwidXRzL3YzL3dhdGNobGlzdFwiOlxuXHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJ1dHMvdjIvd2F0Y2hsaXN0L2NvbnRhaW5zXCI6XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcInV0cy92Mi93YXRjaGxpc3Qvc2VhcmNoXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoU2V0dGluZ3NbXCJUaGlyZC1QYXJ0eVwiXSkgVVJMLnF1ZXJ5LnBmbSA9IChQbGF0Zm9ybSA9PT0gXCJkZXNrdG9wXCIpID8gXCJpcGFkXCIgOiBQbGF0Zm9ybTtcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0XHQvL2lmIChTZXR0aW5nc1tcIlRoaXJkLVBhcnR5XCJdKSBVUkwucXVlcnkucGZtID0gKFBsYXRmb3JtID09PSBcImRlc2t0b3BcIikgPyBcImlwYWRcIiA6IFBsYXRmb3JtO1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKFVSTC5xdWVyeT8uY3R4X2JyYW5kID09PSBcInR2cy5zYmQuNDAwMFwiKSBUeXBlID0gXCJPcmlnaW5hbHNcIjtcblx0XHRcdFx0XHRcdFx0XHRcdGVsc2UgaWYgKFBBVEguaW5jbHVkZXMoXCJ1dHMvdjMvY2FudmFzZXMvQ2hhbm5lbHMvXCIpKSBUeXBlID0gXCJDaGFubmVsc1wiO1xuXHRcdFx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAoUEFUSC5pbmNsdWRlcyhcInV0cy92Mi9icmFuZHMvXCIpKSBUeXBlID0gXCJDaGFubmVsc1wiO1xuXHRcdFx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAoUEFUSC5pbmNsdWRlcyhcInV0cy92My9tb3ZpZXMvXCIpKSBUeXBlID0gXCJNb3ZpZXNcIjtcblx0XHRcdFx0XHRcdFx0XHRcdGVsc2UgaWYgKFBBVEguaW5jbHVkZXMoXCJ1dHMvdjMvc2hvd3MvXCIpKSBUeXBlID0gXCJUVlwiO1xuXHRcdFx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAoUEFUSC5pbmNsdWRlcyhcInV0cy92My9zcG9ydGluZy1ldmVudHMvXCIpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFR5cGUgPSBcIlNwb3J0c1wiO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQvL2lmIChTZXR0aW5nc1tcIlRoaXJkLVBhcnR5XCJdKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRVUkwucXVlcnkucGZtID0gKFBsYXRmb3JtID09PSBcImRlc2t0b3BcIikgPyBcImlwYWRcIiA6IFBsYXRmb3JtO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAoUEFUSC5pbmNsdWRlcyhcInV0cy92My9jYW52YXNlcy9TcG9ydHMvXCIpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFR5cGUgPSBcIlNwb3J0c1wiO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQvL2lmIChTZXR0aW5nc1tcIlRoaXJkLVBhcnR5XCJdKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRVUkwucXVlcnkucGZtID0gKFBsYXRmb3JtID09PSBcImRlc2t0b3BcIikgPyBcImlwYWRcIiA6IFBsYXRmb3JtO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAoUEFUSC5pbmNsdWRlcyhcInV0cy92My9jYW52YXNlcy9QZXJzb25zL1wiKSkgVHlwZSA9IFwiUGVyc29uc1wiO1xuXHRcdFx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAoUEFUSC5pbmNsdWRlcyhcInV0cy92My9jYW52YXNlcy9Sb29tcy9cIikpIFR5cGUgPSBcIk90aGVyc1wiO1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly9lbHNlIGlmIChQQVRILmluY2x1ZGVzKFwidXRzL3YzL3BsYXlhYmxlcy9cIikpIFR5cGUgPSBcIk90aGVyc1wiO1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly9lbHNlIGlmIChQQVRILmluY2x1ZGVzKFwidXRzL3YzL3NoZWx2ZXMvXCIpKSBUeXBlID0gXCJPdGhlcnNcIjtcblx0XHRcdFx0XHRcdFx0XHRcdGVsc2UgVHlwZSA9IFwiT3RoZXJzXCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIFwidW1jLXRlbXBvLWFwaS5hcHBsZS5jb21cIjpcblx0XHRcdFx0XHRcdFx0c3dpdGNoIChQQVRIKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcInYzL3JlZ2lzdGVyXCI6XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcInYzL2NoYW5uZWxzL3Njb3JlYm9hcmRcIjpcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwidjMvY2hhbm5lbHMvc2NvcmVib2FyZC9cIjpcblx0XHRcdFx0XHRcdFx0XHRcdFR5cGUgPSBcIlNwb3J0c1wiO1xuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChQQVRILmluY2x1ZGVzKFwidjMvcmVnaXN0ZXIvXCIpKSBUeXBlID0gXCJTcG9ydHNcIjtcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdCQubG9nKGDimqAgJHskLm5hbWV9LCBUeXBlID0gJHtUeXBlfSwgQ0MgPSAke1NldHRpbmdzLkNvdW50cnlDb2RlW1R5cGVdfWApO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwiQ09OTkVDVFwiOlxuXHRcdFx0XHRjYXNlIFwiVFJBQ0VcIjpcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH07XG5cdFx0XHRpZiAoJHJlcXVlc3QuaGVhZGVycz8uW1wiWC1BcHBsZS1TdG9yZS1Gcm9udFwiXSkgJHJlcXVlc3QuaGVhZGVyc1tcIlgtQXBwbGUtU3RvcmUtRnJvbnRcIl0gPSAoQ29uZmlncy5TdG9yZWZyb250LmdldChTZXR0aW5ncy5Db3VudHJ5Q29kZVtUeXBlXSkpID8gJHJlcXVlc3QuaGVhZGVyc1tcIlgtQXBwbGUtU3RvcmUtRnJvbnRcIl0ucmVwbGFjZSgvXFxkezZ9LywgQ29uZmlncy5TdG9yZWZyb250LmdldChTZXR0aW5ncy5Db3VudHJ5Q29kZVtUeXBlXSkpIDogJHJlcXVlc3QuaGVhZGVyc1tcIlgtQXBwbGUtU3RvcmUtRnJvbnRcIl07XG5cdFx0XHRpZiAoJHJlcXVlc3QuaGVhZGVycz8uW1wieC1hcHBsZS1zdG9yZS1mcm9udFwiXSkgJHJlcXVlc3QuaGVhZGVyc1tcIngtYXBwbGUtc3RvcmUtZnJvbnRcIl0gPSAoQ29uZmlncy5TdG9yZWZyb250LmdldChTZXR0aW5ncy5Db3VudHJ5Q29kZVtUeXBlXSkpID8gJHJlcXVlc3QuaGVhZGVyc1tcIngtYXBwbGUtc3RvcmUtZnJvbnRcIl0ucmVwbGFjZSgvXFxkezZ9LywgQ29uZmlncy5TdG9yZWZyb250LmdldChTZXR0aW5ncy5Db3VudHJ5Q29kZVtUeXBlXSkpIDogJHJlcXVlc3QuaGVhZGVyc1tcIngtYXBwbGUtc3RvcmUtZnJvbnRcIl07XG5cdFx0XHRpZiAoVVJMLnF1ZXJ5Py5zZikgVVJMLnF1ZXJ5LnNmID0gQ29uZmlncy5TdG9yZWZyb250LmdldChTZXR0aW5ncy5Db3VudHJ5Q29kZVtUeXBlXSkgPz8gVVJMLnF1ZXJ5LnNmXG5cdFx0XHRpZiAoVVJMLnF1ZXJ5Py5sb2NhbGUpIFVSTC5xdWVyeS5sb2NhbGUgPSBDb25maWdzLkxvY2FsZS5nZXQoU2V0dGluZ3MuQ291bnRyeUNvZGVbVHlwZV0pID8/IFVSTC5xdWVyeS5sb2NhbGVcblx0XHRcdCQubG9nKGDwn5qnICR7JC5uYW1lfSwg6LCD6K+V5L+h5oGvYCwgYHNmID0gJHtVUkwucXVlcnk/LnNmfSwgbG9jYWxlID0gJHtVUkwucXVlcnk/LmxvY2FsZX1gLCBcIlwiKVxuXHRcdFx0aWYgKCRyZXF1ZXN0LmhlYWRlcnM/Lkhvc3QpICRyZXF1ZXN0LmhlYWRlcnMuSG9zdCA9IFVSTC5ob3N0O1xuXHRcdFx0JHJlcXVlc3QudXJsID0gVVJJLnN0cmluZ2lmeShVUkwpO1xuXHRcdFx0JC5sb2coYPCfmqcgJHskLm5hbWV9LCDosIPor5Xkv6Hmga9gLCBgJHJlcXVlc3QudXJsOiAkeyRyZXF1ZXN0LnVybH1gLCBcIlwiKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgZmFsc2U6XG5cdFx0XHRicmVhaztcblx0fTtcbn0pKClcblx0LmNhdGNoKChlKSA9PiAkLmxvZ0VycihlKSlcblx0LmZpbmFsbHkoKCkgPT4ge1xuXHRcdHN3aXRjaCAoJHJlc3BvbnNlKSB7XG5cdFx0XHRkZWZhdWx0OiB7IC8vIOacieaehOmAoOWbnuWkjeaVsOaNru+8jOi/lOWbnuaehOmAoOeahOWbnuWkjeaVsOaNrlxuXHRcdFx0XHRjb25zdCBGT1JNQVQgPSAoJHJlc3BvbnNlPy5oZWFkZXJzPy5bXCJDb250ZW50LVR5cGVcIl0gPz8gJHJlc3BvbnNlPy5oZWFkZXJzPy5bXCJjb250ZW50LXR5cGVcIl0pPy5zcGxpdChcIjtcIik/LlswXTtcblx0XHRcdFx0JC5sb2coYPCfjokgJHskLm5hbWV9LCBmaW5hbGx5YCwgYGVjaG8gJHJlc3BvbnNlYCwgYEZPUk1BVDogJHtGT1JNQVR9YCwgXCJcIik7XG5cdFx0XHRcdC8vJC5sb2coYPCfmqcgJHskLm5hbWV9LCBmaW5hbGx5YCwgYGVjaG8gJHJlc3BvbnNlOiAke0pTT04uc3RyaW5naWZ5KCRyZXNwb25zZSl9YCwgXCJcIik7XG5cdFx0XHRcdGlmICgkcmVzcG9uc2U/LmhlYWRlcnM/LltcIkNvbnRlbnQtRW5jb2RpbmdcIl0pICRyZXNwb25zZS5oZWFkZXJzW1wiQ29udGVudC1FbmNvZGluZ1wiXSA9IFwiaWRlbnRpdHlcIjtcblx0XHRcdFx0aWYgKCRyZXNwb25zZT8uaGVhZGVycz8uW1wiY29udGVudC1lbmNvZGluZ1wiXSkgJHJlc3BvbnNlLmhlYWRlcnNbXCJjb250ZW50LWVuY29kaW5nXCJdID0gXCJpZGVudGl0eVwiO1xuXHRcdFx0XHRpZiAoJC5pc1F1YW5YKCkpIHtcblx0XHRcdFx0XHQkcmVzcG9uc2Uuc3RhdHVzID0gXCJIVFRQLzEuMSAyMDAgT0tcIjtcblx0XHRcdFx0XHRkZWxldGUgJHJlc3BvbnNlPy5oZWFkZXJzPy5bXCJDb250ZW50LUxlbmd0aFwiXTtcblx0XHRcdFx0XHRkZWxldGUgJHJlc3BvbnNlPy5oZWFkZXJzPy5bXCJjb250ZW50LWxlbmd0aFwiXTtcblx0XHRcdFx0XHRkZWxldGUgJHJlc3BvbnNlPy5oZWFkZXJzPy5bXCJUcmFuc2Zlci1FbmNvZGluZ1wiXTtcblx0XHRcdFx0XHRzd2l0Y2ggKEZPUk1BVCkge1xuXHRcdFx0XHRcdFx0Y2FzZSB1bmRlZmluZWQ6IC8vIOinhuS4uuaXoGJvZHlcblx0XHRcdFx0XHRcdFx0Ly8g6L+U5Zue5pmu6YCa5pWw5o2uXG5cdFx0XHRcdFx0XHRcdCQuZG9uZSh7IHN0YXR1czogJHJlc3BvbnNlLnN0YXR1cywgaGVhZGVyczogJHJlc3BvbnNlLmhlYWRlcnMgfSk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0Ly8g6L+U5Zue5pmu6YCa5pWw5o2uXG5cdFx0XHRcdFx0XHRcdCQuZG9uZSh7IHN0YXR1czogJHJlc3BvbnNlLnN0YXR1cywgaGVhZGVyczogJHJlc3BvbnNlLmhlYWRlcnMsIGJvZHk6ICRyZXNwb25zZS5ib2R5IH0pO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi9wcm90b2J1ZlwiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3gtcHJvdG9idWZcIjpcblx0XHRcdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi92bmQuZ29vZ2xlLnByb3RvYnVmXCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24vZ3JwY1wiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL2dycGMrcHJvdG9cIjpcblx0XHRcdFx0XHRcdGNhc2UgXCJhcHBsZWNhdGlvbi9vY3RldC1zdHJlYW1cIjpcblx0XHRcdFx0XHRcdFx0Ly8g6L+U5Zue5LqM6L+b5Yi25pWw5o2uXG5cdFx0XHRcdFx0XHRcdC8vJC5sb2coYCR7JHJlc3BvbnNlLmJvZHlCeXRlcy5ieXRlTGVuZ3RofS0tLSR7JHJlc3BvbnNlLmJvZHlCeXRlcy5idWZmZXIuYnl0ZUxlbmd0aH1gKTtcblx0XHRcdFx0XHRcdFx0JC5kb25lKHsgc3RhdHVzOiAkcmVzcG9uc2Uuc3RhdHVzLCBoZWFkZXJzOiAkcmVzcG9uc2UuaGVhZGVycywgYm9keUJ5dGVzOiAkcmVzcG9uc2UuYm9keUJ5dGVzIH0pO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9IGVsc2UgJC5kb25lKHsgcmVzcG9uc2U6ICRyZXNwb25zZSB9KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9O1xuXHRcdFx0Y2FzZSB1bmRlZmluZWQ6IHsgLy8g5peg5p6E6YCg5Zue5aSN5pWw5o2u77yM5Y+R6YCB5L+u5pS555qE6K+35rGC5pWw5o2uXG5cdFx0XHRcdC8vY29uc3QgRk9STUFUID0gKCRyZXF1ZXN0Py5oZWFkZXJzPy5bXCJDb250ZW50LVR5cGVcIl0gPz8gJHJlcXVlc3Q/LmhlYWRlcnM/LltcImNvbnRlbnQtdHlwZVwiXSk/LnNwbGl0KFwiO1wiKT8uWzBdO1xuXHRcdFx0XHQkLmxvZyhg8J+OiSAkeyQubmFtZX0sIGZpbmFsbHlgLCBgJHJlcXVlc3RgLCBgRk9STUFUOiAke0ZPUk1BVH1gLCBcIlwiKTtcblx0XHRcdFx0Ly8kLmxvZyhg8J+apyAkeyQubmFtZX0sIGZpbmFsbHlgLCBgJHJlcXVlc3Q6ICR7SlNPTi5zdHJpbmdpZnkoJHJlcXVlc3QpfWAsIFwiXCIpO1xuXHRcdFx0XHRpZiAoJC5pc1F1YW5YKCkpIHtcblx0XHRcdFx0XHRzd2l0Y2ggKEZPUk1BVCkge1xuXHRcdFx0XHRcdFx0Y2FzZSB1bmRlZmluZWQ6IC8vIOinhuS4uuaXoGJvZHlcblx0XHRcdFx0XHRcdFx0Ly8g6L+U5Zue5pmu6YCa5pWw5o2uXG5cdFx0XHRcdFx0XHRcdCQuZG9uZSh7IHVybDogJHJlcXVlc3QudXJsLCBoZWFkZXJzOiAkcmVxdWVzdC5oZWFkZXJzIH0pXG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0Ly8g6L+U5Zue5pmu6YCa5pWw5o2uXG5cdFx0XHRcdFx0XHRcdCQuZG9uZSh7IHVybDogJHJlcXVlc3QudXJsLCBoZWFkZXJzOiAkcmVxdWVzdC5oZWFkZXJzLCBib2R5OiAkcmVxdWVzdC5ib2R5IH0pXG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3Byb3RvYnVmXCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24veC1wcm90b2J1ZlwiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3ZuZC5nb29nbGUucHJvdG9idWZcIjpcblx0XHRcdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi9ncnBjXCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24vZ3JwYytwcm90b1wiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxlY2F0aW9uL29jdGV0LXN0cmVhbVwiOlxuXHRcdFx0XHRcdFx0XHQvLyDov5Tlm57kuozov5vliLbmlbDmja5cblx0XHRcdFx0XHRcdFx0Ly8kLmxvZyhgJHskcmVxdWVzdC5ib2R5Qnl0ZXMuYnl0ZUxlbmd0aH0tLS0keyRyZXF1ZXN0LmJvZHlCeXRlcy5idWZmZXIuYnl0ZUxlbmd0aH1gKTtcblx0XHRcdFx0XHRcdFx0JC5kb25lKHsgdXJsOiAkcmVxdWVzdC51cmwsIGhlYWRlcnM6ICRyZXF1ZXN0LmhlYWRlcnMsIGJvZHlCeXRlczogJHJlcXVlc3QuYm9keUJ5dGVzLmJ1ZmZlci5zbGljZSgkcmVxdWVzdC5ib2R5Qnl0ZXMuYnl0ZU9mZnNldCwgJHJlcXVlc3QuYm9keUJ5dGVzLmJ5dGVMZW5ndGggKyAkcmVxdWVzdC5ib2R5Qnl0ZXMuYnl0ZU9mZnNldCkgfSk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH0gZWxzZSAkLmRvbmUoJHJlcXVlc3QpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH07XG5cdFx0fTtcblx0fSlcblxuLyoqKioqKioqKioqKioqKioqIEZ1bmN0aW9uICoqKioqKioqKioqKioqKioqL1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9