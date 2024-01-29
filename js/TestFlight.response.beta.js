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
/*!*****************************************!*\
  !*** ./src/TestFlight.response.beta.js ***!
  \*****************************************/
var _database_Default_json__WEBPACK_IMPORTED_MODULE_2___namespace_cache;
var _database_Location_json__WEBPACK_IMPORTED_MODULE_3___namespace_cache;
var _database_News_json__WEBPACK_IMPORTED_MODULE_4___namespace_cache;
var _database_PrivateRelay_json__WEBPACK_IMPORTED_MODULE_5___namespace_cache;
var _database_Siri_json__WEBPACK_IMPORTED_MODULE_6___namespace_cache;
var _database_TestFlight_json__WEBPACK_IMPORTED_MODULE_7___namespace_cache;
var _database_TV_json__WEBPACK_IMPORTED_MODULE_8___namespace_cache;
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _ENV_ENV_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ENV/ENV.mjs */ "./src/ENV/ENV.mjs");
/* harmony import */ var _URI_URI_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./URI/URI.mjs */ "./src/URI/URI.mjs");
/* harmony import */ var _database_Default_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./database/Default.json */ "./src/database/Default.json");
/* harmony import */ var _database_Location_json__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./database/Location.json */ "./src/database/Location.json");
/* harmony import */ var _database_News_json__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./database/News.json */ "./src/database/News.json");
/* harmony import */ var _database_PrivateRelay_json__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./database/PrivateRelay.json */ "./src/database/PrivateRelay.json");
/* harmony import */ var _database_Siri_json__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./database/Siri.json */ "./src/database/Siri.json");
/* harmony import */ var _database_TestFlight_json__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./database/TestFlight.json */ "./src/database/TestFlight.json");
/* harmony import */ var _database_TV_json__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./database/TV.json */ "./src/database/TV.json");
/*
README: https://github.com/VirgilClyne/iRingo
*/












const $ = new _ENV_ENV_mjs__WEBPACK_IMPORTED_MODULE_0__["default"](" iRingo: ✈ TestFlight v3.1.1(1) response.beta");
const URI = new _URI_URI_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]();
const DataBase = {
	"Default": /*#__PURE__*/ (_database_Default_json__WEBPACK_IMPORTED_MODULE_2___namespace_cache || (_database_Default_json__WEBPACK_IMPORTED_MODULE_2___namespace_cache = __webpack_require__.t(_database_Default_json__WEBPACK_IMPORTED_MODULE_2__, 2))),
	"Location": /*#__PURE__*/ (_database_Location_json__WEBPACK_IMPORTED_MODULE_3___namespace_cache || (_database_Location_json__WEBPACK_IMPORTED_MODULE_3___namespace_cache = __webpack_require__.t(_database_Location_json__WEBPACK_IMPORTED_MODULE_3__, 2))),
	"News": /*#__PURE__*/ (_database_News_json__WEBPACK_IMPORTED_MODULE_4___namespace_cache || (_database_News_json__WEBPACK_IMPORTED_MODULE_4___namespace_cache = __webpack_require__.t(_database_News_json__WEBPACK_IMPORTED_MODULE_4__, 2))),
	"PrivateRelay": /*#__PURE__*/ (_database_PrivateRelay_json__WEBPACK_IMPORTED_MODULE_5___namespace_cache || (_database_PrivateRelay_json__WEBPACK_IMPORTED_MODULE_5___namespace_cache = __webpack_require__.t(_database_PrivateRelay_json__WEBPACK_IMPORTED_MODULE_5__, 2))),
	"Siri": /*#__PURE__*/ (_database_Siri_json__WEBPACK_IMPORTED_MODULE_6___namespace_cache || (_database_Siri_json__WEBPACK_IMPORTED_MODULE_6___namespace_cache = __webpack_require__.t(_database_Siri_json__WEBPACK_IMPORTED_MODULE_6__, 2))),
	"TestFlight": /*#__PURE__*/ (_database_TestFlight_json__WEBPACK_IMPORTED_MODULE_7___namespace_cache || (_database_TestFlight_json__WEBPACK_IMPORTED_MODULE_7___namespace_cache = __webpack_require__.t(_database_TestFlight_json__WEBPACK_IMPORTED_MODULE_7__, 2))),
	"TV": /*#__PURE__*/ (_database_TV_json__WEBPACK_IMPORTED_MODULE_8___namespace_cache || (_database_TV_json__WEBPACK_IMPORTED_MODULE_8___namespace_cache = __webpack_require__.t(_database_TV_json__WEBPACK_IMPORTED_MODULE_8__, 2))),
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
	const { Settings, Caches, Configs } = setENV("iRingo", "TestFlight", DataBase);
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
					//body = XML.parse($response.body);
					//$.log(`🚧 ${$.name}`, `body: ${JSON.stringify(body)}`, "");
					//$response.body = XML.stringify(body);
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
					// 主机判断
					switch (HOST) {
						case "testflight.apple.com":
							// 路径判断
							switch (PATH) {
								case "v1/session/authenticate":
									switch (Settings.MultiAccount) { // MultiAccount
										case true:
											$.log(`⚠ ${$.name}, 启用多账号支持`, "");
											const XRequestId = $request?.headers?.["X-Request-Id"] ?? $request?.headers?.["x-request-id"];
											const XSessionId = $request?.headers?.["X-Session-Id"] ?? $request?.headers?.["x-session-id"];
											const XSessionDigest = $request?.headers?.["X-Session-Digest"] ?? $request?.headers?.["x-session-digest"];
											if (Caches?.data) { //有data
												$.log(`⚠ ${$.name}, 有Caches.data`, "");
												if (body?.data?.accountId === Caches?.data?.accountId) { // Account ID相等，刷新缓存
													$.log(`⚠ ${$.name}, Account ID相等，刷新缓存`, "");
													Caches.headers = {
														"X-Request-Id": XRequestId,
														"X-Session-Id": XSessionId,
														"X-Session-Digest": XSessionDigest
													};
													Caches.data = body.data;
													Caches.data.termsAndConditions = null;
													Caches.data.hasNewTermsAndConditions = false;
													$.setjson(Caches, "@iRingo.TestFlight.Caches");
												}
												/*
												else { // Account ID不相等，覆盖
													$.log(`⚠ ${$.name}, Account ID不相等，覆盖data(accountId和sessionId)`, "");
													body.data = Caches.data;
												}
												*/
											} else { // Caches空
												$.log(`⚠ ${$.name}, Caches空，写入`, "");
												Caches.headers = {
													"X-Request-Id": XRequestId,
													"X-Session-Id": XSessionId,
													"X-Session-Digest": XSessionDigest
												};
												Caches.data = body.data;
												Caches.data.termsAndConditions = null;
												Caches.data.hasNewTermsAndConditions = false;
												$.setjson(Caches, "@iRingo.TestFlight.Caches");
											};
											break;
										case false:
										default:
											break;
									};
									break;
								case "v1/devices":
								case "v1/devices/apns":
								case "v1/devices/add":
								case "v1/devices/remove":
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
																	$.log(`🚧 ${$.name}, ${PATHs[0]}/accounts/settings`, "");
																	break;
																case "notifications":
																	switch (PATHs[4]) {
																		case "apps":
																			$.log(`🚧 ${$.name}, ${PATHs[0]}/accounts/settings/notifications/apps/`, "");
																			break;
																	};
																	break;
																default:
																	$.log(`🚧 ${$.name}, ${PATHs[0]}/accounts/settings/${PATHs[3]}/`, "");
																	break;
															};
															break;
														case Caches?.data?.accountId: // UUID
														default:
															switch (PATHs[3]) {
																case undefined:
																	$.log(`🚧 ${$.name}, ${PATHs[0]}/accounts/${PATHs[2]}`, "");
																	break;
																case "apps":
																	$.log(`🚧 ${$.name}, ${PATHs[0]}/accounts/${PATHs[2]}/apps/`, "");
																	switch (PATHs[4]) {
																		case undefined:
																			$.log(`🚧 ${$.name}, ${PATHs[0]}/accounts/${PATHs[2]}/apps`, "");
																			switch (Settings.Universal) { // 通用
																				case true:
																					$.log(`🚧 ${$.name}, 启用通用应用支持`, "");
																					if (body.error === null) { // 数据无错误
																						$.log(`🚧 ${$.name}, 数据无错误`, "");
																						body.data = body.data.map(app => {
																							if (app.previouslyTested !== false) { // 不是前测试人员
																								$.log(`🚧 ${$.name}, 不是前测试人员`, "");
																								app.platforms = app.platforms.map(platform => {
																									platform.build = modBuild(platform.build);
																									return platform
																								});
																							}
																							return app
																						});
																					};
																					break;
																				case false:
																				default:
																					break;
																			};
																			break;
																		default:
																			switch (PATHs[5]) {
																				case undefined:
																					$.log(`🚧 ${$.name}, ${PATHs[0]}/accounts/${PATHs[2]}/apps/${PATHs[4]}`, "");
																					break;
																				case "builds":
																					switch (PATHs[7]) {
																						case undefined:
																							$.log(`🚧 ${$.name}, ${PATHs[0]}/accounts/${PATHs[2]}/apps/${PATHs[4]}/builds/${PATHs[6]}`, "");
																							switch (Settings.Universal) { // 通用
																								case true:
																									$.log(`🚧 ${$.name}, 启用通用应用支持`, "");
																									if (body.error === null) { // 数据无错误
																										$.log(`🚧 ${$.name}, 数据无错误`, "");
																										// 当前Bulid
																										body.data.currentBuild = modBuild(body.data.currentBuild);
																										// Build列表
																										body.data.builds = body.data.builds.map(build => modBuild(build));
																									};
																									break;
																								case false:
																								default:
																									break;
																							};
																							break;
																						case "install":
																							$.log(`🚧 ${$.name}, ${PATHs[0]}/accounts/${PATHs[2]}/apps/${PATHs[4]}/builds/${PATHs[6]}/install`, "");
																							break;
																						default:
																							$.log(`🚧 ${$.name}, ${PATHs[0]}/accounts/${PATHs[2]}/apps/${PATHs[4]}/builds/${PATHs[6]}/${PATHs[7]}`, "");
																							break;
																					};
																					break;
																				case "platforms":
																					switch (PATHs[6]) {
																						case "ios":
																						case "osx":
																						case "appletvos":
																						default:
																							switch (PATHs[7]) {
																								case undefined:
																									$.log(`🚧 ${$.name}, ${PATHs[0]}/accounts/${PATHs[2]}/apps/${PATHs[4]}/platforms/${PATHs[6]}`, "");
																									break;
																								case "trains":
																									switch (PATHs[9]) {
																										case undefined:
																											$.log(`🚧 ${$.name}, ${PATHs[0]}/accounts/${PATHs[2]}/apps/${PATHs[4]}/platforms/${PATHs[6]}/trains/${PATHs[8]}`, "");
																											break;
																										case "builds":
																											switch (PATHs[10]) {
																												case undefined:
																													$.log(`🚧 ${$.name}, ${PATHs[0]}/accounts/${PATHs[2]}/apps/${PATHs[4]}/platforms/${PATHs[6]}/trains/${PATHs[8]}/builds`, "");
																													switch (Settings.Universal) { // 通用
																														case true:
																															$.log(`🚧 ${$.name}, 启用通用应用支持`, "");
																															if (body.error === null) { // 数据无错误
																																$.log(`🚧 ${$.name}, 数据无错误`, "");
																																// 当前Bulid
																																body.data = body.data.map(data => modBuild(data));
																															};
																															break;
																														case false:
																														default:
																															break;
																													};
																													break;
																												default:
																													$.log(`🚧 ${$.name}, ${PATHs[0]}/accounts/${PATHs[2]}/apps/${PATHs[4]}/platforms/${PATHs[6]}/trains/${PATHs[8]}/builds/${PATHs[10]}`, "");
																													break;
																											};
																											break;
																										default:
																											$.log(`🚧 ${$.name}, ${PATHs[0]}/accounts/${PATHs[2]}/apps/${PATHs[4]}/platforms/${PATHs[6]}/trains/${PATHs[8]}/${PATHs[9]}`, "");
																											break;
																									};
																									break;
																								default:
																									$.log(`🚧 ${$.name}, ${PATHs[0]}/accounts/${PATHs[2]}/apps/${PATHs[4]}/platforms/${PATHs[6]}/${PATHs[7]}`, "");
																									break;
																							};
																							break;
																					};
																					break;
																				default:
																					$.log(`🚧 ${$.name}, ${PATHs[0]}/accounts/${PATHs[2]}/apps/${PATHs[4]}/${PATHs[5]}`, "");
																					break;
																			};
																			break;
																	};
																	break;
																default:
																	$.log(`🚧 ${$.name}, ${PATHs[0]}/accounts/${PATHs[2]}/${PATHs[3]}/`, "");
																	break;
															};
															break;
													};
													break;
												case "apps":
													switch (PATHs[3]) {
														case "install":
															switch (PATHs[4]) {
																case undefined:
																	$.log(`🚧 ${$.name}, ${PATHs[0]}/apps/install`, "");
																	break;
																case "status":
																	$.log(`🚧 ${$.name}, ${PATHs[0]}/apps/install/status`, "");
																	break;
																default:
																	$.log(`🚧 ${$.name}, ${PATHs[0]}/apps/install/${PATHs[4]}`, "");
																	break;
															};
															break;
													};
													break;
												case "messages":
													switch (PATHs[2]) {
														case Caches?.data?.accountId: // UUID
														default:
															$.log(`🚧 ${$.name}, ${PATHs[0]}/messages/${PATHs[2]}`, "");
															switch (PATHs[3]) {
																case undefined:
																	$.log(`🚧 ${$.name}, ${PATHs[0]}/messages/${PATHs[2]}`, "");
																	break;
																case "read":
																	$.log(`🚧 ${$.name}, ${PATHs[0]}/messages/${PATHs[2]}/read`, "");
																	break;
																default:
																	$.log(`🚧 ${$.name}, ${PATHs[0]}/messages/${PATHs[2]}/${PATHs[3]}`, "");
																	break;
															};
															break;
													};
													break;
											};
											break;
									};
									break;
							};
							break;
					};
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
	$.log(`⚠ ${$.name}, Set Environment Variables`, "");
	let { Settings, Caches, Configs } = $.getENV(name, platforms, database);
	/***************** Settings *****************/
	$.log(`🎉 ${$.name}, Set Environment Variables`, `Settings: ${typeof Settings}`, `Settings内容: ${JSON.stringify(Settings)}`, "");
	/***************** Caches *****************/
	//$.log(`🎉 ${$.name}, Set Environment Variables`, `Caches: ${typeof Caches}`, `Caches内容: ${JSON.stringify(Caches)}`, "");
	/***************** Configs *****************/
	Configs.Storefront = new Map(Configs.Storefront);
	return { Settings, Caches, Configs };
};

/**
 * mod Build
 * @author VirgilClyne
 * @param {Object} build - Build
 * @return {Object}
 */
function modBuild(build) {
	switch (build.platform || build.name) {
		case "ios":
			$.log(`🚧 ${$.name}, ios`, "");
			build = Build(build);
			break;
		case "osx":
			$.log(`🚧 ${$.name}, osx`, "");
			if (build?.macBuildCompatibility?.runsOnAppleSilicon === true) { // 是苹果芯片
				$.log(`🚧 ${$.name}, runsOnAppleSilicon`, "");
				build = Build(build);
			};
			break;
		case "appletvos":
			$.log(`🚧 ${$.name}, appletvos`, "");
			break;
		default:
			$.log(`🚧 ${$.name}, unknown platform: ${build.platform || build.name}`, "");
			break;
	};
	return build

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
			};
			if (build?.compatibilityData?.compatibleDeviceFamilies) {
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
			};
			if (build.macBuildCompatibility) {
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
			};
		//};
		return build
	};
};

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVzdEZsaWdodC5yZXNwb25zZS5iZXRhLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFlO0FBQ2Y7QUFDQSxpQkFBaUIsS0FBSztBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQixVQUFVO0FBQy9COztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGNBQWMsS0FBSztBQUNuQixHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLEtBQUs7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsZUFBZSwrQkFBK0I7QUFDOUM7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0EsS0FBSztBQUNMLElBQUk7QUFDSjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxRUFBcUU7QUFDckU7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0I7QUFDcEIsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsa0NBQWtDO0FBQ2xDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBLFNBQVMsOENBQThDO0FBQ3ZEO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLG1DQUFtQztBQUNuQztBQUNBO0FBQ0E7O0FBRUE7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QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2lyaW5nby8uL3NyYy9FTlYvRU5WLm1qcyIsIndlYnBhY2s6Ly9pcmluZ28vLi9zcmMvVVJJL1VSSS5tanMiLCJ3ZWJwYWNrOi8vaXJpbmdvL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2lyaW5nby93ZWJwYWNrL3J1bnRpbWUvY3JlYXRlIGZha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9pcmluZ28vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2lyaW5nby93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2lyaW5nby93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2lyaW5nby8uL3NyYy9UZXN0RmxpZ2h0LnJlc3BvbnNlLmJldGEuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgY2xhc3MgRU5WIHtcblx0Y29uc3RydWN0b3IobmFtZSwgb3B0cykge1xuXHRcdHRoaXMubmFtZSA9IGAke25hbWV9LCBFTlYgdjEuMC4wYFxuXHRcdHRoaXMuaHR0cCA9IG5ldyBIdHRwKHRoaXMpXG5cdFx0dGhpcy5kYXRhID0gbnVsbFxuXHRcdHRoaXMuZGF0YUZpbGUgPSAnYm94LmRhdCdcblx0XHR0aGlzLmxvZ3MgPSBbXVxuXHRcdHRoaXMuaXNNdXRlID0gZmFsc2Vcblx0XHR0aGlzLmlzTmVlZFJld3JpdGUgPSBmYWxzZVxuXHRcdHRoaXMubG9nU2VwYXJhdG9yID0gJ1xcbidcblx0XHR0aGlzLmVuY29kaW5nID0gJ3V0Zi04J1xuXHRcdHRoaXMuc3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcblx0XHRPYmplY3QuYXNzaWduKHRoaXMsIG9wdHMpXG5cdFx0dGhpcy5sb2coJycsIGDwn4+BICR7dGhpcy5uYW1lfSwg5byA5aeLIWApXG5cdH1cblxuXHRQbGF0Zm9ybSgpIHtcblx0XHRpZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiAkZW52aXJvbm1lbnQgJiYgJGVudmlyb25tZW50WydzdXJnZS12ZXJzaW9uJ10pXG5cdFx0XHRyZXR1cm4gJ1N1cmdlJ1xuXHRcdGlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mICRlbnZpcm9ubWVudCAmJiAkZW52aXJvbm1lbnRbJ3N0YXNoLXZlcnNpb24nXSlcblx0XHRcdHJldHVybiAnU3Rhc2gnXG5cdFx0aWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgJHRhc2spIHJldHVybiAnUXVhbnR1bXVsdCBYJ1xuXHRcdGlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mICRsb29uKSByZXR1cm4gJ0xvb24nXG5cdFx0aWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgJHJvY2tldCkgcmV0dXJuICdTaGFkb3dyb2NrZXQnXG5cdH1cblxuXHRpc1F1YW5YKCkge1xuXHRcdHJldHVybiAnUXVhbnR1bXVsdCBYJyA9PT0gdGhpcy5QbGF0Zm9ybSgpXG5cdH1cblxuXHRpc1N1cmdlKCkge1xuXHRcdHJldHVybiAnU3VyZ2UnID09PSB0aGlzLlBsYXRmb3JtKClcblx0fVxuXG5cdGlzTG9vbigpIHtcblx0XHRyZXR1cm4gJ0xvb24nID09PSB0aGlzLlBsYXRmb3JtKClcblx0fVxuXG5cdGlzU2hhZG93cm9ja2V0KCkge1xuXHRcdHJldHVybiAnU2hhZG93cm9ja2V0JyA9PT0gdGhpcy5QbGF0Zm9ybSgpXG5cdH1cblxuXHRpc1N0YXNoKCkge1xuXHRcdHJldHVybiAnU3Rhc2gnID09PSB0aGlzLlBsYXRmb3JtKClcblx0fVxuXG5cdHRvT2JqKHN0ciwgZGVmYXVsdFZhbHVlID0gbnVsbCkge1xuXHRcdHRyeSB7XG5cdFx0XHRyZXR1cm4gSlNPTi5wYXJzZShzdHIpXG5cdFx0fSBjYXRjaCB7XG5cdFx0XHRyZXR1cm4gZGVmYXVsdFZhbHVlXG5cdFx0fVxuXHR9XG5cblx0dG9TdHIob2JqLCBkZWZhdWx0VmFsdWUgPSBudWxsKSB7XG5cdFx0dHJ5IHtcblx0XHRcdHJldHVybiBKU09OLnN0cmluZ2lmeShvYmopXG5cdFx0fSBjYXRjaCB7XG5cdFx0XHRyZXR1cm4gZGVmYXVsdFZhbHVlXG5cdFx0fVxuXHR9XG5cblx0Z2V0anNvbihrZXksIGRlZmF1bHRWYWx1ZSkge1xuXHRcdGxldCBqc29uID0gZGVmYXVsdFZhbHVlXG5cdFx0Y29uc3QgdmFsID0gdGhpcy5nZXRkYXRhKGtleSlcblx0XHRpZiAodmFsKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRqc29uID0gSlNPTi5wYXJzZSh0aGlzLmdldGRhdGEoa2V5KSlcblx0XHRcdH0gY2F0Y2ggeyB9XG5cdFx0fVxuXHRcdHJldHVybiBqc29uXG5cdH1cblxuXHRzZXRqc29uKHZhbCwga2V5KSB7XG5cdFx0dHJ5IHtcblx0XHRcdHJldHVybiB0aGlzLnNldGRhdGEoSlNPTi5zdHJpbmdpZnkodmFsKSwga2V5KVxuXHRcdH0gY2F0Y2gge1xuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0fVxuXHR9XG5cblx0Z2V0U2NyaXB0KHVybCkge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXHRcdFx0dGhpcy5nZXQoeyB1cmwgfSwgKGVycm9yLCByZXNwb25zZSwgYm9keSkgPT4gcmVzb2x2ZShib2R5KSlcblx0XHR9KVxuXHR9XG5cblx0cnVuU2NyaXB0KHNjcmlwdCwgcnVuT3B0cykge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXHRcdFx0bGV0IGh0dHBhcGkgPSB0aGlzLmdldGRhdGEoJ0BjaGF2eV9ib3hqc191c2VyQ2Zncy5odHRwYXBpJylcblx0XHRcdGh0dHBhcGkgPSBodHRwYXBpID8gaHR0cGFwaS5yZXBsYWNlKC9cXG4vZywgJycpLnRyaW0oKSA6IGh0dHBhcGlcblx0XHRcdGxldCBodHRwYXBpX3RpbWVvdXQgPSB0aGlzLmdldGRhdGEoXG5cdFx0XHRcdCdAY2hhdnlfYm94anNfdXNlckNmZ3MuaHR0cGFwaV90aW1lb3V0J1xuXHRcdFx0KVxuXHRcdFx0aHR0cGFwaV90aW1lb3V0ID0gaHR0cGFwaV90aW1lb3V0ID8gaHR0cGFwaV90aW1lb3V0ICogMSA6IDIwXG5cdFx0XHRodHRwYXBpX3RpbWVvdXQgPVxuXHRcdFx0XHRydW5PcHRzICYmIHJ1bk9wdHMudGltZW91dCA/IHJ1bk9wdHMudGltZW91dCA6IGh0dHBhcGlfdGltZW91dFxuXHRcdFx0Y29uc3QgW2tleSwgYWRkcl0gPSBodHRwYXBpLnNwbGl0KCdAJylcblx0XHRcdGNvbnN0IG9wdHMgPSB7XG5cdFx0XHRcdHVybDogYGh0dHA6Ly8ke2FkZHJ9L3YxL3NjcmlwdGluZy9ldmFsdWF0ZWAsXG5cdFx0XHRcdGJvZHk6IHtcblx0XHRcdFx0XHRzY3JpcHRfdGV4dDogc2NyaXB0LFxuXHRcdFx0XHRcdG1vY2tfdHlwZTogJ2Nyb24nLFxuXHRcdFx0XHRcdHRpbWVvdXQ6IGh0dHBhcGlfdGltZW91dFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRoZWFkZXJzOiB7ICdYLUtleSc6IGtleSwgJ0FjY2VwdCc6ICcqLyonIH0sXG5cdFx0XHRcdHRpbWVvdXQ6IGh0dHBhcGlfdGltZW91dFxuXHRcdFx0fVxuXHRcdFx0dGhpcy5wb3N0KG9wdHMsIChlcnJvciwgcmVzcG9uc2UsIGJvZHkpID0+IHJlc29sdmUoYm9keSkpXG5cdFx0fSkuY2F0Y2goKGUpID0+IHRoaXMubG9nRXJyKGUpKVxuXHR9XG5cblx0bG9hZGRhdGEoKSB7XG5cdFx0aWYgKHRoaXMuaXNOb2RlKCkpIHtcblx0XHRcdHRoaXMuZnMgPSB0aGlzLmZzID8gdGhpcy5mcyA6IHJlcXVpcmUoJ2ZzJylcblx0XHRcdHRoaXMucGF0aCA9IHRoaXMucGF0aCA/IHRoaXMucGF0aCA6IHJlcXVpcmUoJ3BhdGgnKVxuXHRcdFx0Y29uc3QgY3VyRGlyRGF0YUZpbGVQYXRoID0gdGhpcy5wYXRoLnJlc29sdmUodGhpcy5kYXRhRmlsZSlcblx0XHRcdGNvbnN0IHJvb3REaXJEYXRhRmlsZVBhdGggPSB0aGlzLnBhdGgucmVzb2x2ZShcblx0XHRcdFx0cHJvY2Vzcy5jd2QoKSxcblx0XHRcdFx0dGhpcy5kYXRhRmlsZVxuXHRcdFx0KVxuXHRcdFx0Y29uc3QgaXNDdXJEaXJEYXRhRmlsZSA9IHRoaXMuZnMuZXhpc3RzU3luYyhjdXJEaXJEYXRhRmlsZVBhdGgpXG5cdFx0XHRjb25zdCBpc1Jvb3REaXJEYXRhRmlsZSA9XG5cdFx0XHRcdCFpc0N1ckRpckRhdGFGaWxlICYmIHRoaXMuZnMuZXhpc3RzU3luYyhyb290RGlyRGF0YUZpbGVQYXRoKVxuXHRcdFx0aWYgKGlzQ3VyRGlyRGF0YUZpbGUgfHwgaXNSb290RGlyRGF0YUZpbGUpIHtcblx0XHRcdFx0Y29uc3QgZGF0UGF0aCA9IGlzQ3VyRGlyRGF0YUZpbGVcblx0XHRcdFx0XHQ/IGN1ckRpckRhdGFGaWxlUGF0aFxuXHRcdFx0XHRcdDogcm9vdERpckRhdGFGaWxlUGF0aFxuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHJldHVybiBKU09OLnBhcnNlKHRoaXMuZnMucmVhZEZpbGVTeW5jKGRhdFBhdGgpKVxuXHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHt9XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSByZXR1cm4ge31cblx0XHR9IGVsc2UgcmV0dXJuIHt9XG5cdH1cblxuXHR3cml0ZWRhdGEoKSB7XG5cdFx0aWYgKHRoaXMuaXNOb2RlKCkpIHtcblx0XHRcdHRoaXMuZnMgPSB0aGlzLmZzID8gdGhpcy5mcyA6IHJlcXVpcmUoJ2ZzJylcblx0XHRcdHRoaXMucGF0aCA9IHRoaXMucGF0aCA/IHRoaXMucGF0aCA6IHJlcXVpcmUoJ3BhdGgnKVxuXHRcdFx0Y29uc3QgY3VyRGlyRGF0YUZpbGVQYXRoID0gdGhpcy5wYXRoLnJlc29sdmUodGhpcy5kYXRhRmlsZSlcblx0XHRcdGNvbnN0IHJvb3REaXJEYXRhRmlsZVBhdGggPSB0aGlzLnBhdGgucmVzb2x2ZShcblx0XHRcdFx0cHJvY2Vzcy5jd2QoKSxcblx0XHRcdFx0dGhpcy5kYXRhRmlsZVxuXHRcdFx0KVxuXHRcdFx0Y29uc3QgaXNDdXJEaXJEYXRhRmlsZSA9IHRoaXMuZnMuZXhpc3RzU3luYyhjdXJEaXJEYXRhRmlsZVBhdGgpXG5cdFx0XHRjb25zdCBpc1Jvb3REaXJEYXRhRmlsZSA9XG5cdFx0XHRcdCFpc0N1ckRpckRhdGFGaWxlICYmIHRoaXMuZnMuZXhpc3RzU3luYyhyb290RGlyRGF0YUZpbGVQYXRoKVxuXHRcdFx0Y29uc3QganNvbmRhdGEgPSBKU09OLnN0cmluZ2lmeSh0aGlzLmRhdGEpXG5cdFx0XHRpZiAoaXNDdXJEaXJEYXRhRmlsZSkge1xuXHRcdFx0XHR0aGlzLmZzLndyaXRlRmlsZVN5bmMoY3VyRGlyRGF0YUZpbGVQYXRoLCBqc29uZGF0YSlcblx0XHRcdH0gZWxzZSBpZiAoaXNSb290RGlyRGF0YUZpbGUpIHtcblx0XHRcdFx0dGhpcy5mcy53cml0ZUZpbGVTeW5jKHJvb3REaXJEYXRhRmlsZVBhdGgsIGpzb25kYXRhKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5mcy53cml0ZUZpbGVTeW5jKGN1ckRpckRhdGFGaWxlUGF0aCwganNvbmRhdGEpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0bG9kYXNoX2dldChzb3VyY2UsIHBhdGgsIGRlZmF1bHRWYWx1ZSA9IHVuZGVmaW5lZCkge1xuXHRcdGNvbnN0IHBhdGhzID0gcGF0aC5yZXBsYWNlKC9cXFsoXFxkKylcXF0vZywgJy4kMScpLnNwbGl0KCcuJylcblx0XHRsZXQgcmVzdWx0ID0gc291cmNlXG5cdFx0Zm9yIChjb25zdCBwIG9mIHBhdGhzKSB7XG5cdFx0XHRyZXN1bHQgPSBPYmplY3QocmVzdWx0KVtwXVxuXHRcdFx0aWYgKHJlc3VsdCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHJldHVybiBkZWZhdWx0VmFsdWVcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdFxuXHR9XG5cblx0bG9kYXNoX3NldChvYmosIHBhdGgsIHZhbHVlKSB7XG5cdFx0aWYgKE9iamVjdChvYmopICE9PSBvYmopIHJldHVybiBvYmpcblx0XHRpZiAoIUFycmF5LmlzQXJyYXkocGF0aCkpIHBhdGggPSBwYXRoLnRvU3RyaW5nKCkubWF0Y2goL1teLltcXF1dKy9nKSB8fCBbXVxuXHRcdHBhdGhcblx0XHRcdC5zbGljZSgwLCAtMSlcblx0XHRcdC5yZWR1Y2UoXG5cdFx0XHRcdChhLCBjLCBpKSA9PlxuXHRcdFx0XHRcdE9iamVjdChhW2NdKSA9PT0gYVtjXVxuXHRcdFx0XHRcdFx0PyBhW2NdXG5cdFx0XHRcdFx0XHQ6IChhW2NdID0gTWF0aC5hYnMocGF0aFtpICsgMV0pID4+IDAgPT09ICtwYXRoW2kgKyAxXSA/IFtdIDoge30pLFxuXHRcdFx0XHRvYmpcblx0XHRcdClbcGF0aFtwYXRoLmxlbmd0aCAtIDFdXSA9IHZhbHVlXG5cdFx0cmV0dXJuIG9ialxuXHR9XG5cblx0Z2V0ZGF0YShrZXkpIHtcblx0XHRsZXQgdmFsID0gdGhpcy5nZXR2YWwoa2V5KVxuXHRcdC8vIOWmguaenOS7pSBAXG5cdFx0aWYgKC9eQC8udGVzdChrZXkpKSB7XG5cdFx0XHRjb25zdCBbLCBvYmprZXksIHBhdGhzXSA9IC9eQCguKj8pXFwuKC4qPykkLy5leGVjKGtleSlcblx0XHRcdGNvbnN0IG9ianZhbCA9IG9iamtleSA/IHRoaXMuZ2V0dmFsKG9iamtleSkgOiAnJ1xuXHRcdFx0aWYgKG9ianZhbCkge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGNvbnN0IG9iamVkdmFsID0gSlNPTi5wYXJzZShvYmp2YWwpXG5cdFx0XHRcdFx0dmFsID0gb2JqZWR2YWwgPyB0aGlzLmxvZGFzaF9nZXQob2JqZWR2YWwsIHBhdGhzLCAnJykgOiB2YWxcblx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdHZhbCA9ICcnXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHZhbFxuXHR9XG5cblx0c2V0ZGF0YSh2YWwsIGtleSkge1xuXHRcdGxldCBpc3N1YyA9IGZhbHNlXG5cdFx0aWYgKC9eQC8udGVzdChrZXkpKSB7XG5cdFx0XHRjb25zdCBbLCBvYmprZXksIHBhdGhzXSA9IC9eQCguKj8pXFwuKC4qPykkLy5leGVjKGtleSlcblx0XHRcdGNvbnN0IG9iamRhdCA9IHRoaXMuZ2V0dmFsKG9iamtleSlcblx0XHRcdGNvbnN0IG9ianZhbCA9IG9iamtleVxuXHRcdFx0XHQ/IG9iamRhdCA9PT0gJ251bGwnXG5cdFx0XHRcdFx0PyBudWxsXG5cdFx0XHRcdFx0OiBvYmpkYXQgfHwgJ3t9J1xuXHRcdFx0XHQ6ICd7fSdcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGNvbnN0IG9iamVkdmFsID0gSlNPTi5wYXJzZShvYmp2YWwpXG5cdFx0XHRcdHRoaXMubG9kYXNoX3NldChvYmplZHZhbCwgcGF0aHMsIHZhbClcblx0XHRcdFx0aXNzdWMgPSB0aGlzLnNldHZhbChKU09OLnN0cmluZ2lmeShvYmplZHZhbCksIG9iamtleSlcblx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0Y29uc3Qgb2JqZWR2YWwgPSB7fVxuXHRcdFx0XHR0aGlzLmxvZGFzaF9zZXQob2JqZWR2YWwsIHBhdGhzLCB2YWwpXG5cdFx0XHRcdGlzc3VjID0gdGhpcy5zZXR2YWwoSlNPTi5zdHJpbmdpZnkob2JqZWR2YWwpLCBvYmprZXkpXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlzc3VjID0gdGhpcy5zZXR2YWwodmFsLCBrZXkpXG5cdFx0fVxuXHRcdHJldHVybiBpc3N1Y1xuXHR9XG5cblx0Z2V0dmFsKGtleSkge1xuXHRcdHN3aXRjaCAodGhpcy5QbGF0Zm9ybSgpKSB7XG5cdFx0XHRjYXNlICdTdXJnZSc6XG5cdFx0XHRjYXNlICdMb29uJzpcblx0XHRcdGNhc2UgJ1N0YXNoJzpcblx0XHRcdGNhc2UgJ1NoYWRvd3JvY2tldCc6XG5cdFx0XHRcdHJldHVybiAkcGVyc2lzdGVudFN0b3JlLnJlYWQoa2V5KVxuXHRcdFx0Y2FzZSAnUXVhbnR1bXVsdCBYJzpcblx0XHRcdFx0cmV0dXJuICRwcmVmcy52YWx1ZUZvcktleShrZXkpXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gKHRoaXMuZGF0YSAmJiB0aGlzLmRhdGFba2V5XSkgfHwgbnVsbFxuXHRcdH1cblx0fVxuXG5cdHNldHZhbCh2YWwsIGtleSkge1xuXHRcdHN3aXRjaCAodGhpcy5QbGF0Zm9ybSgpKSB7XG5cdFx0XHRjYXNlICdTdXJnZSc6XG5cdFx0XHRjYXNlICdMb29uJzpcblx0XHRcdGNhc2UgJ1N0YXNoJzpcblx0XHRcdGNhc2UgJ1NoYWRvd3JvY2tldCc6XG5cdFx0XHRcdHJldHVybiAkcGVyc2lzdGVudFN0b3JlLndyaXRlKHZhbCwga2V5KVxuXHRcdFx0Y2FzZSAnUXVhbnR1bXVsdCBYJzpcblx0XHRcdFx0cmV0dXJuICRwcmVmcy5zZXRWYWx1ZUZvcktleSh2YWwsIGtleSlcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiAodGhpcy5kYXRhICYmIHRoaXMuZGF0YVtrZXldKSB8fCBudWxsXG5cdFx0fVxuXHR9XG5cblx0aW5pdEdvdEVudihvcHRzKSB7XG5cdFx0dGhpcy5nb3QgPSB0aGlzLmdvdCA/IHRoaXMuZ290IDogcmVxdWlyZSgnZ290Jylcblx0XHR0aGlzLmNrdG91Z2ggPSB0aGlzLmNrdG91Z2ggPyB0aGlzLmNrdG91Z2ggOiByZXF1aXJlKCd0b3VnaC1jb29raWUnKVxuXHRcdHRoaXMuY2tqYXIgPSB0aGlzLmNramFyID8gdGhpcy5ja2phciA6IG5ldyB0aGlzLmNrdG91Z2guQ29va2llSmFyKClcblx0XHRpZiAob3B0cykge1xuXHRcdFx0b3B0cy5oZWFkZXJzID0gb3B0cy5oZWFkZXJzID8gb3B0cy5oZWFkZXJzIDoge31cblx0XHRcdGlmICh1bmRlZmluZWQgPT09IG9wdHMuaGVhZGVycy5Db29raWUgJiYgdW5kZWZpbmVkID09PSBvcHRzLmNvb2tpZUphcikge1xuXHRcdFx0XHRvcHRzLmNvb2tpZUphciA9IHRoaXMuY2tqYXJcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRnZXQocmVxdWVzdCwgY2FsbGJhY2sgPSAoKSA9PiB7IH0pIHtcblx0XHRkZWxldGUgcmVxdWVzdC5oZWFkZXJzPy5bJ0NvbnRlbnQtTGVuZ3RoJ11cblx0XHRkZWxldGUgcmVxdWVzdC5oZWFkZXJzPy5bJ2NvbnRlbnQtbGVuZ3RoJ11cblxuXHRcdHN3aXRjaCAodGhpcy5QbGF0Zm9ybSgpKSB7XG5cdFx0XHRjYXNlICdTdXJnZSc6XG5cdFx0XHRjYXNlICdMb29uJzpcblx0XHRcdGNhc2UgJ1N0YXNoJzpcblx0XHRcdGNhc2UgJ1NoYWRvd3JvY2tldCc6XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRpZiAodGhpcy5pc1N1cmdlKCkgJiYgdGhpcy5pc05lZWRSZXdyaXRlKSB7XG5cdFx0XHRcdFx0dGhpcy5sb2Rhc2hfc2V0KHJlcXVlc3QsICdoZWFkZXJzLlgtU3VyZ2UtU2tpcC1TY3JpcHRpbmcnLCBmYWxzZSlcblx0XHRcdFx0fVxuXHRcdFx0XHQkaHR0cENsaWVudC5nZXQocmVxdWVzdCwgKGVycm9yLCByZXNwb25zZSwgYm9keSkgPT4ge1xuXHRcdFx0XHRcdGlmICghZXJyb3IgJiYgcmVzcG9uc2UpIHtcblx0XHRcdFx0XHRcdHJlc3BvbnNlLmJvZHkgPSBib2R5XG5cdFx0XHRcdFx0XHRyZXNwb25zZS5zdGF0dXNDb2RlID0gcmVzcG9uc2Uuc3RhdHVzID8gcmVzcG9uc2Uuc3RhdHVzIDogcmVzcG9uc2Uuc3RhdHVzQ29kZVxuXHRcdFx0XHRcdFx0cmVzcG9uc2Uuc3RhdHVzID0gcmVzcG9uc2Uuc3RhdHVzQ29kZVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYWxsYmFjayhlcnJvciwgcmVzcG9uc2UsIGJvZHkpXG5cdFx0XHRcdH0pXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdRdWFudHVtdWx0IFgnOlxuXHRcdFx0XHRpZiAodGhpcy5pc05lZWRSZXdyaXRlKSB7XG5cdFx0XHRcdFx0dGhpcy5sb2Rhc2hfc2V0KHJlcXVlc3QsICdvcHRzLmhpbnRzJywgZmFsc2UpXG5cdFx0XHRcdH1cblx0XHRcdFx0JHRhc2suZmV0Y2gocmVxdWVzdCkudGhlbihcblx0XHRcdFx0XHQocmVzcG9uc2UpID0+IHtcblx0XHRcdFx0XHRcdGNvbnN0IHtcblx0XHRcdFx0XHRcdFx0c3RhdHVzQ29kZTogc3RhdHVzLFxuXHRcdFx0XHRcdFx0XHRzdGF0dXNDb2RlLFxuXHRcdFx0XHRcdFx0XHRoZWFkZXJzLFxuXHRcdFx0XHRcdFx0XHRib2R5LFxuXHRcdFx0XHRcdFx0XHRib2R5Qnl0ZXNcblx0XHRcdFx0XHRcdH0gPSByZXNwb25zZVxuXHRcdFx0XHRcdFx0Y2FsbGJhY2soXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdHsgc3RhdHVzLCBzdGF0dXNDb2RlLCBoZWFkZXJzLCBib2R5LCBib2R5Qnl0ZXMgfSxcblx0XHRcdFx0XHRcdFx0Ym9keSxcblx0XHRcdFx0XHRcdFx0Ym9keUJ5dGVzXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQoZXJyb3IpID0+IGNhbGxiYWNrKChlcnJvciAmJiBlcnJvci5lcnJvcm9yKSB8fCAnVW5kZWZpbmVkRXJyb3InKVxuXHRcdFx0XHQpXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXHR9XG5cblx0cG9zdChyZXF1ZXN0LCBjYWxsYmFjayA9ICgpID0+IHsgfSkge1xuXHRcdGNvbnN0IG1ldGhvZCA9IHJlcXVlc3QubWV0aG9kXG5cdFx0XHQ/IHJlcXVlc3QubWV0aG9kLnRvTG9jYWxlTG93ZXJDYXNlKClcblx0XHRcdDogJ3Bvc3QnXG5cblx0XHQvLyDlpoLmnpzmjIflrprkuobor7fmsYLkvZMsIOS9huayoeaMh+WumiBgQ29udGVudC1UeXBlYOOAgWBjb250ZW50LXR5cGVgLCDliJnoh6rliqjnlJ/miJDjgIJcblx0XHRpZiAoXG5cdFx0XHRyZXF1ZXN0LmJvZHkgJiZcblx0XHRcdHJlcXVlc3QuaGVhZGVycyAmJlxuXHRcdFx0IXJlcXVlc3QuaGVhZGVyc1snQ29udGVudC1UeXBlJ10gJiZcblx0XHRcdCFyZXF1ZXN0LmhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddXG5cdFx0KSB7XG5cdFx0XHQvLyBIVFRQLzHjgIFIVFRQLzIg6YO95pSv5oyB5bCP5YaZIGhlYWRlcnNcblx0XHRcdHJlcXVlc3QuaGVhZGVyc1snY29udGVudC10eXBlJ10gPSAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xuXHRcdH1cblx0XHQvLyDkuLrpgb/lhY3mjIflrprplJnor68gYGNvbnRlbnQtbGVuZ3RoYCDov5nph4zliKDpmaTor6XlsZ7mgKfvvIznlLHlt6Xlhbfnq68gKEh0dHBDbGllbnQpIOi0n+i0o+mHjeaWsOiuoeeul+W5tui1i+WAvFxuXHRcdFx0ZGVsZXRlIHJlcXVlc3QuaGVhZGVycz8uWydDb250ZW50LUxlbmd0aCddXG5cdFx0XHRkZWxldGUgcmVxdWVzdC5oZWFkZXJzPy5bJ2NvbnRlbnQtbGVuZ3RoJ11cblx0XHRzd2l0Y2ggKHRoaXMuUGxhdGZvcm0oKSkge1xuXHRcdFx0Y2FzZSAnU3VyZ2UnOlxuXHRcdFx0Y2FzZSAnTG9vbic6XG5cdFx0XHRjYXNlICdTdGFzaCc6XG5cdFx0XHRjYXNlICdTaGFkb3dyb2NrZXQnOlxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0aWYgKHRoaXMuaXNTdXJnZSgpICYmIHRoaXMuaXNOZWVkUmV3cml0ZSkge1xuXHRcdFx0XHRcdHRoaXMubG9kYXNoX3NldChyZXF1ZXN0LCAnaGVhZGVycy5YLVN1cmdlLVNraXAtU2NyaXB0aW5nJywgZmFsc2UpXG5cdFx0XHRcdH1cblx0XHRcdFx0JGh0dHBDbGllbnRbbWV0aG9kXShyZXF1ZXN0LCAoZXJyb3IsIHJlc3BvbnNlLCBib2R5KSA9PiB7XG5cdFx0XHRcdFx0aWYgKCFlcnJvciAmJiByZXNwb25zZSkge1xuXHRcdFx0XHRcdFx0cmVzcG9uc2UuYm9keSA9IGJvZHlcblx0XHRcdFx0XHRcdHJlc3BvbnNlLnN0YXR1c0NvZGUgPSByZXNwb25zZS5zdGF0dXMgPyByZXNwb25zZS5zdGF0dXMgOiByZXNwb25zZS5zdGF0dXNDb2RlXG5cdFx0XHRcdFx0XHRyZXNwb25zZS5zdGF0dXMgPSByZXNwb25zZS5zdGF0dXNDb2RlXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNhbGxiYWNrKGVycm9yLCByZXNwb25zZSwgYm9keSlcblx0XHRcdFx0fSlcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgJ1F1YW50dW11bHQgWCc6XG5cdFx0XHRcdHJlcXVlc3QubWV0aG9kID0gbWV0aG9kXG5cdFx0XHRcdGlmICh0aGlzLmlzTmVlZFJld3JpdGUpIHtcblx0XHRcdFx0XHR0aGlzLmxvZGFzaF9zZXQocmVxdWVzdCwgJ29wdHMuaGludHMnLCBmYWxzZSlcblx0XHRcdFx0fVxuXHRcdFx0XHQkdGFzay5mZXRjaChyZXF1ZXN0KS50aGVuKFxuXHRcdFx0XHRcdChyZXNwb25zZSkgPT4ge1xuXHRcdFx0XHRcdFx0Y29uc3Qge1xuXHRcdFx0XHRcdFx0XHRzdGF0dXNDb2RlOiBzdGF0dXMsXG5cdFx0XHRcdFx0XHRcdHN0YXR1c0NvZGUsXG5cdFx0XHRcdFx0XHRcdGhlYWRlcnMsXG5cdFx0XHRcdFx0XHRcdGJvZHksXG5cdFx0XHRcdFx0XHRcdGJvZHlCeXRlc1xuXHRcdFx0XHRcdFx0fSA9IHJlc3BvbnNlXG5cdFx0XHRcdFx0XHRjYWxsYmFjayhcblx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0eyBzdGF0dXMsIHN0YXR1c0NvZGUsIGhlYWRlcnMsIGJvZHksIGJvZHlCeXRlcyB9LFxuXHRcdFx0XHRcdFx0XHRib2R5LFxuXHRcdFx0XHRcdFx0XHRib2R5Qnl0ZXNcblx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdChlcnJvcikgPT4gY2FsbGJhY2soKGVycm9yICYmIGVycm9yLmVycm9yb3IpIHx8ICdVbmRlZmluZWRFcnJvcicpXG5cdFx0XHRcdClcblx0XHRcdFx0YnJlYWtcblx0XHR9XG5cdH1cblx0LyoqXG5cdCAqXG5cdCAqIOekuuS+izokLnRpbWUoJ3l5eXktTU0tZGQgcXEgSEg6bW06c3MuUycpXG5cdCAqICAgIDokLnRpbWUoJ3l5eXlNTWRkSEhtbXNzUycpXG5cdCAqICAgIHk65bm0IE065pyIIGQ65pelIHE65a2jIEg65pe2IG065YiGIHM656eSIFM65q+r56eSXG5cdCAqICAgIOWFtuS4rXnlj6/pgIkwLTTkvY3ljaDkvY3nrKbjgIFT5Y+v6YCJMC0x5L2N5Y2g5L2N56ym77yM5YW25L2Z5Y+v6YCJMC0y5L2N5Y2g5L2N56ymXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBmb3JtYXQg5qC85byP5YyW5Y+C5pWwXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSB0cyDlj6/pgIk6IOagueaNruaMh+WumuaXtumXtOaIs+i/lOWbnuagvOW8j+WMluaXpeacn1xuXHQgKlxuXHQgKi9cblx0dGltZShmb3JtYXQsIHRzID0gbnVsbCkge1xuXHRcdGNvbnN0IGRhdGUgPSB0cyA/IG5ldyBEYXRlKHRzKSA6IG5ldyBEYXRlKClcblx0XHRsZXQgbyA9IHtcblx0XHRcdCdNKyc6IGRhdGUuZ2V0TW9udGgoKSArIDEsXG5cdFx0XHQnZCsnOiBkYXRlLmdldERhdGUoKSxcblx0XHRcdCdIKyc6IGRhdGUuZ2V0SG91cnMoKSxcblx0XHRcdCdtKyc6IGRhdGUuZ2V0TWludXRlcygpLFxuXHRcdFx0J3MrJzogZGF0ZS5nZXRTZWNvbmRzKCksXG5cdFx0XHQncSsnOiBNYXRoLmZsb29yKChkYXRlLmdldE1vbnRoKCkgKyAzKSAvIDMpLFxuXHRcdFx0J1MnOiBkYXRlLmdldE1pbGxpc2Vjb25kcygpXG5cdFx0fVxuXHRcdGlmICgvKHkrKS8udGVzdChmb3JtYXQpKVxuXHRcdFx0Zm9ybWF0ID0gZm9ybWF0LnJlcGxhY2UoXG5cdFx0XHRcdFJlZ0V4cC4kMSxcblx0XHRcdFx0KGRhdGUuZ2V0RnVsbFllYXIoKSArICcnKS5zdWJzdHIoNCAtIFJlZ0V4cC4kMS5sZW5ndGgpXG5cdFx0XHQpXG5cdFx0Zm9yIChsZXQgayBpbiBvKVxuXHRcdFx0aWYgKG5ldyBSZWdFeHAoJygnICsgayArICcpJykudGVzdChmb3JtYXQpKVxuXHRcdFx0XHRmb3JtYXQgPSBmb3JtYXQucmVwbGFjZShcblx0XHRcdFx0XHRSZWdFeHAuJDEsXG5cdFx0XHRcdFx0UmVnRXhwLiQxLmxlbmd0aCA9PSAxXG5cdFx0XHRcdFx0XHQ/IG9ba11cblx0XHRcdFx0XHRcdDogKCcwMCcgKyBvW2tdKS5zdWJzdHIoKCcnICsgb1trXSkubGVuZ3RoKVxuXHRcdFx0XHQpXG5cdFx0cmV0dXJuIGZvcm1hdFxuXHR9XG5cblx0LyoqXG5cdCAqIOezu+e7n+mAmuefpVxuXHQgKlxuXHQgKiA+IOmAmuefpeWPguaVsDog5ZCM5pe25pSv5oyBIFF1YW5YIOWSjCBMb29uIOS4pOenjeagvOW8jywgRW52SnPmoLnmja7ov5DooYznjq/looPoh6rliqjovazmjaIsIFN1cmdlIOeOr+Wig+S4jeaUr+aMgeWkmuWqkuS9k+mAmuefpVxuXHQgKlxuXHQgKiDnpLrkvos6XG5cdCAqICQubXNnKHRpdGxlLCBzdWJ0LCBkZXNjLCAndHdpdHRlcjovLycpXG5cdCAqICQubXNnKHRpdGxlLCBzdWJ0LCBkZXNjLCB7ICdvcGVuLXVybCc6ICd0d2l0dGVyOi8vJywgJ21lZGlhLXVybCc6ICdodHRwczovL2dpdGh1Yi5naXRodWJhc3NldHMuY29tL2ltYWdlcy9tb2R1bGVzL29wZW5fZ3JhcGgvZ2l0aHViLW1hcmsucG5nJyB9KVxuXHQgKiAkLm1zZyh0aXRsZSwgc3VidCwgZGVzYywgeyAnb3Blbi11cmwnOiAnaHR0cHM6Ly9iaW5nLmNvbScsICdtZWRpYS11cmwnOiAnaHR0cHM6Ly9naXRodWIuZ2l0aHViYXNzZXRzLmNvbS9pbWFnZXMvbW9kdWxlcy9vcGVuX2dyYXBoL2dpdGh1Yi1tYXJrLnBuZycgfSlcblx0ICpcblx0ICogQHBhcmFtIHsqfSB0aXRsZSDmoIfpophcblx0ICogQHBhcmFtIHsqfSBzdWJ0IOWJr+agh+mimFxuXHQgKiBAcGFyYW0geyp9IGRlc2Mg6YCa55+l6K+m5oOFXG5cdCAqIEBwYXJhbSB7Kn0gb3B0cyDpgJrnn6Xlj4LmlbBcblx0ICpcblx0ICovXG5cdG1zZyh0aXRsZSA9IG5hbWUsIHN1YnQgPSAnJywgZGVzYyA9ICcnLCBvcHRzKSB7XG5cdFx0Y29uc3QgdG9FbnZPcHRzID0gKHJhd29wdHMpID0+IHtcblx0XHRcdHN3aXRjaCAodHlwZW9mIHJhd29wdHMpIHtcblx0XHRcdFx0Y2FzZSB1bmRlZmluZWQ6XG5cdFx0XHRcdFx0cmV0dXJuIHJhd29wdHNcblx0XHRcdFx0Y2FzZSAnc3RyaW5nJzpcblx0XHRcdFx0XHRzd2l0Y2ggKHRoaXMuUGxhdGZvcm0oKSkge1xuXHRcdFx0XHRcdFx0Y2FzZSAnU3VyZ2UnOlxuXHRcdFx0XHRcdFx0Y2FzZSAnU3Rhc2gnOlxuXHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHsgdXJsOiByYXdvcHRzIH1cblx0XHRcdFx0XHRcdGNhc2UgJ0xvb24nOlxuXHRcdFx0XHRcdFx0Y2FzZSAnU2hhZG93cm9ja2V0Jzpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHJhd29wdHNcblx0XHRcdFx0XHRcdGNhc2UgJ1F1YW50dW11bHQgWCc6XG5cdFx0XHRcdFx0XHRcdHJldHVybiB7ICdvcGVuLXVybCc6IHJhd29wdHMgfVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0Y2FzZSAnb2JqZWN0Jzpcblx0XHRcdFx0XHRzd2l0Y2ggKHRoaXMuUGxhdGZvcm0oKSkge1xuXHRcdFx0XHRcdFx0Y2FzZSAnU3VyZ2UnOlxuXHRcdFx0XHRcdFx0Y2FzZSAnU3Rhc2gnOlxuXHRcdFx0XHRcdFx0Y2FzZSAnU2hhZG93cm9ja2V0Jzpcblx0XHRcdFx0XHRcdGRlZmF1bHQ6IHtcblx0XHRcdFx0XHRcdFx0bGV0IG9wZW5VcmwgPVxuXHRcdFx0XHRcdFx0XHRcdHJhd29wdHMudXJsIHx8IHJhd29wdHMub3BlblVybCB8fCByYXdvcHRzWydvcGVuLXVybCddXG5cdFx0XHRcdFx0XHRcdHJldHVybiB7IHVybDogb3BlblVybCB9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRjYXNlICdMb29uJzoge1xuXHRcdFx0XHRcdFx0XHRsZXQgb3BlblVybCA9XG5cdFx0XHRcdFx0XHRcdFx0cmF3b3B0cy5vcGVuVXJsIHx8IHJhd29wdHMudXJsIHx8IHJhd29wdHNbJ29wZW4tdXJsJ11cblx0XHRcdFx0XHRcdFx0bGV0IG1lZGlhVXJsID0gcmF3b3B0cy5tZWRpYVVybCB8fCByYXdvcHRzWydtZWRpYS11cmwnXVxuXHRcdFx0XHRcdFx0XHRyZXR1cm4geyBvcGVuVXJsLCBtZWRpYVVybCB9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRjYXNlICdRdWFudHVtdWx0IFgnOiB7XG5cdFx0XHRcdFx0XHRcdGxldCBvcGVuVXJsID1cblx0XHRcdFx0XHRcdFx0XHRyYXdvcHRzWydvcGVuLXVybCddIHx8IHJhd29wdHMudXJsIHx8IHJhd29wdHMub3BlblVybFxuXHRcdFx0XHRcdFx0XHRsZXQgbWVkaWFVcmwgPSByYXdvcHRzWydtZWRpYS11cmwnXSB8fCByYXdvcHRzLm1lZGlhVXJsXG5cdFx0XHRcdFx0XHRcdGxldCB1cGRhdGVQYXN0ZWJvYXJkID1cblx0XHRcdFx0XHRcdFx0XHRyYXdvcHRzWyd1cGRhdGUtcGFzdGVib2FyZCddIHx8IHJhd29wdHMudXBkYXRlUGFzdGVib2FyZFxuXHRcdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRcdCdvcGVuLXVybCc6IG9wZW5VcmwsXG5cdFx0XHRcdFx0XHRcdFx0J21lZGlhLXVybCc6IG1lZGlhVXJsLFxuXHRcdFx0XHRcdFx0XHRcdCd1cGRhdGUtcGFzdGVib2FyZCc6IHVwZGF0ZVBhc3RlYm9hcmRcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmICghdGhpcy5pc011dGUpIHtcblx0XHRcdHN3aXRjaCAodGhpcy5QbGF0Zm9ybSgpKSB7XG5cdFx0XHRcdGNhc2UgJ1N1cmdlJzpcblx0XHRcdFx0Y2FzZSAnTG9vbic6XG5cdFx0XHRcdGNhc2UgJ1N0YXNoJzpcblx0XHRcdFx0Y2FzZSAnU2hhZG93cm9ja2V0Jzpcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHQkbm90aWZpY2F0aW9uLnBvc3QodGl0bGUsIHN1YnQsIGRlc2MsIHRvRW52T3B0cyhvcHRzKSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlICdRdWFudHVtdWx0IFgnOlxuXHRcdFx0XHRcdCRub3RpZnkodGl0bGUsIHN1YnQsIGRlc2MsIHRvRW52T3B0cyhvcHRzKSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoIXRoaXMuaXNNdXRlTG9nKSB7XG5cdFx0XHRsZXQgbG9ncyA9IFsnJywgJz09PT09PT09PT09PT098J+To+ezu+e7n+mAmuefpfCfk6M9PT09PT09PT09PT09PSddXG5cdFx0XHRsb2dzLnB1c2godGl0bGUpXG5cdFx0XHRzdWJ0ID8gbG9ncy5wdXNoKHN1YnQpIDogJydcblx0XHRcdGRlc2MgPyBsb2dzLnB1c2goZGVzYykgOiAnJ1xuXHRcdFx0Y29uc29sZS5sb2cobG9ncy5qb2luKCdcXG4nKSlcblx0XHRcdHRoaXMubG9ncyA9IHRoaXMubG9ncy5jb25jYXQobG9ncylcblx0XHR9XG5cdH1cblxuXHRsb2coLi4ubG9ncykge1xuXHRcdGlmIChsb2dzLmxlbmd0aCA+IDApIHtcblx0XHRcdHRoaXMubG9ncyA9IFsuLi50aGlzLmxvZ3MsIC4uLmxvZ3NdXG5cdFx0fVxuXHRcdGNvbnNvbGUubG9nKGxvZ3Muam9pbih0aGlzLmxvZ1NlcGFyYXRvcikpXG5cdH1cblxuXHRsb2dFcnIoZXJyb3IpIHtcblx0XHRzd2l0Y2ggKHRoaXMuUGxhdGZvcm0oKSkge1xuXHRcdFx0Y2FzZSAnU3VyZ2UnOlxuXHRcdFx0Y2FzZSAnTG9vbic6XG5cdFx0XHRjYXNlICdTdGFzaCc6XG5cdFx0XHRjYXNlICdTaGFkb3dyb2NrZXQnOlxuXHRcdFx0Y2FzZSAnUXVhbnR1bXVsdCBYJzpcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRoaXMubG9nKCcnLCBg4p2X77iPICR7dGhpcy5uYW1lfSwg6ZSZ6K+vIWAsIGVycm9yKVxuXHRcdFx0XHRicmVha1xuXHRcdH1cblx0fVxuXG5cdHdhaXQodGltZSkge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCB0aW1lKSlcblx0fVxuXG5cdGRvbmUodmFsID0ge30pIHtcblx0XHRjb25zdCBlbmRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcblx0XHRjb25zdCBjb3N0VGltZSA9IChlbmRUaW1lIC0gdGhpcy5zdGFydFRpbWUpIC8gMTAwMFxuXHRcdHRoaXMubG9nKCcnLCBg8J+aqSAke3RoaXMubmFtZX0sIOe7k+adnyEg8J+VmyAke2Nvc3RUaW1lfSDnp5JgKVxuXHRcdHRoaXMubG9nKClcblx0XHRzd2l0Y2ggKHRoaXMuUGxhdGZvcm0oKSkge1xuXHRcdFx0Y2FzZSAnU3VyZ2UnOlxuXHRcdFx0Y2FzZSAnTG9vbic6XG5cdFx0XHRjYXNlICdTdGFzaCc6XG5cdFx0XHRjYXNlICdTaGFkb3dyb2NrZXQnOlxuXHRcdFx0Y2FzZSAnUXVhbnR1bXVsdCBYJzpcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdCRkb25lKHZhbClcblx0XHRcdFx0YnJlYWtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogR2V0IEVudmlyb25tZW50IFZhcmlhYmxlc1xuXHQgKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vVmlyZ2lsQ2x5bmUvR2V0U29tZUZyaWVzL2Jsb2IvbWFpbi9mdW5jdGlvbi9nZXRFTlYvZ2V0RU5WLmpzXG5cdCAqIEBhdXRob3IgVmlyZ2lsQ2x5bmVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGtleSAtIFBlcnNpc3RlbnQgU3RvcmUgS2V5XG5cdCAqIEBwYXJhbSB7QXJyYXl9IG5hbWVzIC0gUGxhdGZvcm0gTmFtZXNcblx0ICogQHBhcmFtIHtPYmplY3R9IGRhdGFiYXNlIC0gRGVmYXVsdCBEYXRhYmFzZVxuXHQgKiBAcmV0dXJuIHtPYmplY3R9IHsgU2V0dGluZ3MsIENhY2hlcywgQ29uZmlncyB9XG5cdCAqL1xuXHRnZXRFTlYoa2V5LCBuYW1lcywgZGF0YWJhc2UpIHtcblx0XHQvL3RoaXMubG9nKGDimJHvuI8gJHt0aGlzLm5hbWV9LCBHZXQgRW52aXJvbm1lbnQgVmFyaWFibGVzYCwgXCJcIik7XG5cdFx0LyoqKioqKioqKioqKioqKioqIEJveEpzICoqKioqKioqKioqKioqKioqL1xuXHRcdC8vIOWMheijheS4uuWxgOmDqOWPmOmHj++8jOeUqOWujOmHiuaUvuWGheWtmFxuXHRcdC8vIEJveEpz55qE5riF56m65pON5L2c6L+U5Zue5YGH5YC856m65a2X56ym5LiyLCDpgLvovpHmiJbmk43kvZznrKbkvJrlnKjlt6bkvqfmk43kvZzmlbDkuLrlgYflgLzml7bov5Tlm57lj7Pkvqfmk43kvZzmlbDjgIJcblx0XHRsZXQgQm94SnMgPSB0aGlzLmdldGpzb24oa2V5LCBkYXRhYmFzZSk7XG5cdFx0Ly90aGlzLmxvZyhg8J+apyAke3RoaXMubmFtZX0sIEdldCBFbnZpcm9ubWVudCBWYXJpYWJsZXNgLCBgQm94SnPnsbvlnos6ICR7dHlwZW9mIEJveEpzfWAsIGBCb3hKc+WGheWuuTogJHtKU09OLnN0cmluZ2lmeShCb3hKcyl9YCwgXCJcIik7XG5cdFx0LyoqKioqKioqKioqKioqKioqIEFyZ3VtZW50ICoqKioqKioqKioqKioqKioqL1xuXHRcdGxldCBBcmd1bWVudCA9IHt9O1xuXHRcdGlmICh0eXBlb2YgJGFyZ3VtZW50ICE9PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0XHRpZiAoQm9vbGVhbigkYXJndW1lbnQpKSB7XG5cdFx0XHRcdC8vdGhpcy5sb2coYPCfjokgJHt0aGlzLm5hbWV9LCAkQXJndW1lbnRgKTtcblx0XHRcdFx0bGV0IGFyZyA9IE9iamVjdC5mcm9tRW50cmllcygkYXJndW1lbnQuc3BsaXQoXCImXCIpLm1hcCgoaXRlbSkgPT4gaXRlbS5zcGxpdChcIj1cIikubWFwKGkgPT4gaS5yZXBsYWNlKC9cXFwiL2csICcnKSkpKTtcblx0XHRcdFx0Ly90aGlzLmxvZyhKU09OLnN0cmluZ2lmeShhcmcpKTtcblx0XHRcdFx0Zm9yIChsZXQgaXRlbSBpbiBhcmcpIHRoaXMuc2V0UGF0aChBcmd1bWVudCwgaXRlbSwgYXJnW2l0ZW1dKTtcblx0XHRcdFx0Ly90aGlzLmxvZyhKU09OLnN0cmluZ2lmeShBcmd1bWVudCkpO1xuXHRcdFx0fTtcblx0XHRcdC8vdGhpcy5sb2coYOKchSAke3RoaXMubmFtZX0sIEdldCBFbnZpcm9ubWVudCBWYXJpYWJsZXNgLCBgQXJndW1lbnTnsbvlnos6ICR7dHlwZW9mIEFyZ3VtZW50fWAsIGBBcmd1bWVudOWGheWuuTogJHtKU09OLnN0cmluZ2lmeShBcmd1bWVudCl9YCwgXCJcIik7XG5cdFx0fTtcblx0XHQvKioqKioqKioqKioqKioqKiogU3RvcmUgKioqKioqKioqKioqKioqKiovXG5cdFx0Y29uc3QgU3RvcmUgPSB7IFNldHRpbmdzOiBkYXRhYmFzZT8uRGVmYXVsdD8uU2V0dGluZ3MgfHwge30sIENvbmZpZ3M6IGRhdGFiYXNlPy5EZWZhdWx0Py5Db25maWdzIHx8IHt9LCBDYWNoZXM6IHt9IH07XG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KG5hbWVzKSkgbmFtZXMgPSBbbmFtZXNdO1xuXHRcdC8vdGhpcy5sb2coYPCfmqcgJHt0aGlzLm5hbWV9LCBHZXQgRW52aXJvbm1lbnQgVmFyaWFibGVzYCwgYG5hbWVz57G75Z6LOiAke3R5cGVvZiBuYW1lc31gLCBgbmFtZXPlhoXlrrk6ICR7SlNPTi5zdHJpbmdpZnkobmFtZXMpfWAsIFwiXCIpO1xuXHRcdGZvciAobGV0IG5hbWUgb2YgbmFtZXMpIHtcblx0XHRcdFN0b3JlLlNldHRpbmdzID0geyAuLi5TdG9yZS5TZXR0aW5ncywgLi4uZGF0YWJhc2U/LltuYW1lXT8uU2V0dGluZ3MsIC4uLkFyZ3VtZW50LCAuLi5Cb3hKcz8uW25hbWVdPy5TZXR0aW5ncyB9O1xuXHRcdFx0U3RvcmUuQ29uZmlncyA9IHsgLi4uU3RvcmUuQ29uZmlncywgLi4uZGF0YWJhc2U/LltuYW1lXT8uQ29uZmlncyB9O1xuXHRcdFx0aWYgKEJveEpzPy5bbmFtZV0/LkNhY2hlcyAmJiB0eXBlb2YgQm94SnM/LltuYW1lXT8uQ2FjaGVzID09PSBcInN0cmluZ1wiKSBCb3hKc1tuYW1lXS5DYWNoZXMgPSBKU09OLnBhcnNlKEJveEpzPy5bbmFtZV0/LkNhY2hlcyk7XG5cdFx0XHRTdG9yZS5DYWNoZXMgPSB7IC4uLlN0b3JlLkNhY2hlcywgLi4uQm94SnM/LltuYW1lXT8uQ2FjaGVzIH07XG5cdFx0fTtcblx0XHQvL3RoaXMubG9nKGDwn5qnICR7dGhpcy5uYW1lfSwgR2V0IEVudmlyb25tZW50IFZhcmlhYmxlc2AsIGBTdG9yZS5TZXR0aW5nc+exu+WeizogJHt0eXBlb2YgU3RvcmUuU2V0dGluZ3N9YCwgYFN0b3JlLlNldHRpbmdzOiAke0pTT04uc3RyaW5naWZ5KFN0b3JlLlNldHRpbmdzKX1gLCBcIlwiKTtcblx0XHR0aGlzLnRyYXZlcnNlT2JqZWN0KFN0b3JlLlNldHRpbmdzLCAoa2V5LCB2YWx1ZSkgPT4ge1xuXHRcdFx0Ly90aGlzLmxvZyhg8J+apyAke3RoaXMubmFtZX0sIHRyYXZlcnNlT2JqZWN0YCwgYCR7a2V5fTogJHt0eXBlb2YgdmFsdWV9YCwgYCR7a2V5fTogJHtKU09OLnN0cmluZ2lmeSh2YWx1ZSl9YCwgXCJcIik7XG5cdFx0XHRpZiAodmFsdWUgPT09IFwidHJ1ZVwiIHx8IHZhbHVlID09PSBcImZhbHNlXCIpIHZhbHVlID0gSlNPTi5wYXJzZSh2YWx1ZSk7IC8vIOWtl+espuS4sui9rEJvb2xlYW5cblx0XHRcdGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRpZiAodmFsdWUuaW5jbHVkZXMoXCIsXCIpKSB2YWx1ZSA9IHZhbHVlLnNwbGl0KFwiLFwiKS5tYXAoaXRlbSA9PiB0aGlzLnN0cmluZzJudW1iZXIoaXRlbSkpOyAvLyDlrZfnrKbkuLLovazmlbDnu4TovazmlbDlrZdcblx0XHRcdFx0ZWxzZSB2YWx1ZSA9IHRoaXMuc3RyaW5nMm51bWJlcih2YWx1ZSk7IC8vIOWtl+espuS4sui9rOaVsOWtl1xuXHRcdFx0fTtcblx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHR9KTtcblx0XHQvL3RoaXMubG9nKGDinIUgJHt0aGlzLm5hbWV9LCBHZXQgRW52aXJvbm1lbnQgVmFyaWFibGVzYCwgYFN0b3JlOiAke3R5cGVvZiBTdG9yZS5DYWNoZXN9YCwgYFN0b3Jl5YaF5a65OiAke0pTT04uc3RyaW5naWZ5KFN0b3JlKX1gLCBcIlwiKTtcblx0XHRyZXR1cm4gU3RvcmU7XG5cdH07XG5cblx0LyoqKioqKioqKioqKioqKioqIGZ1bmN0aW9uICoqKioqKioqKioqKioqKioqL1xuXHRzZXRQYXRoKG9iamVjdCwgcGF0aCwgdmFsdWUpIHsgcGF0aC5zcGxpdChcIi5cIikucmVkdWNlKChvLCBwLCBpKSA9PiBvW3BdID0gcGF0aC5zcGxpdChcIi5cIikubGVuZ3RoID09PSArK2kgPyB2YWx1ZSA6IG9bcF0gfHwge30sIG9iamVjdCkgfVxuXHR0cmF2ZXJzZU9iamVjdChvLCBjKSB7IGZvciAodmFyIHQgaW4gbykgeyB2YXIgbiA9IG9bdF07IG9bdF0gPSBcIm9iamVjdFwiID09IHR5cGVvZiBuICYmIG51bGwgIT09IG4gPyB0aGlzLnRyYXZlcnNlT2JqZWN0KG4sIGMpIDogYyh0LCBuKSB9IHJldHVybiBvIH1cblx0c3RyaW5nMm51bWJlcihzdHJpbmcpIHsgaWYgKHN0cmluZyAmJiAhaXNOYU4oc3RyaW5nKSkgc3RyaW5nID0gcGFyc2VJbnQoc3RyaW5nLCAxMCk7IHJldHVybiBzdHJpbmcgfVxufVxuXG5leHBvcnQgY2xhc3MgSHR0cCB7XG5cdGNvbnN0cnVjdG9yKGVudikge1xuXHRcdHRoaXMuZW52ID0gZW52XG5cdH1cblxuXHRzZW5kKG9wdHMsIG1ldGhvZCA9ICdHRVQnKSB7XG5cdFx0b3B0cyA9IHR5cGVvZiBvcHRzID09PSAnc3RyaW5nJyA/IHsgdXJsOiBvcHRzIH0gOiBvcHRzXG5cdFx0bGV0IHNlbmRlciA9IHRoaXMuZ2V0XG5cdFx0aWYgKG1ldGhvZCA9PT0gJ1BPU1QnKSB7XG5cdFx0XHRzZW5kZXIgPSB0aGlzLnBvc3Rcblx0XHR9XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdHNlbmRlci5jYWxsKHRoaXMsIG9wdHMsIChlcnJvciwgcmVzcG9uc2UsIGJvZHkpID0+IHtcblx0XHRcdFx0aWYgKGVycm9yKSByZWplY3QoZXJyb3IpXG5cdFx0XHRcdGVsc2UgcmVzb2x2ZShyZXNwb25zZSlcblx0XHRcdH0pXG5cdFx0fSlcblx0fVxuXG5cdGdldChvcHRzKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2VuZC5jYWxsKHRoaXMuZW52LCBvcHRzKVxuXHR9XG5cblx0cG9zdChvcHRzKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2VuZC5jYWxsKHRoaXMuZW52LCBvcHRzLCAnUE9TVCcpXG5cdH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIFVSSSB7XG5cdGNvbnN0cnVjdG9yKG9wdHMgPSBbXSkge1xuXHRcdHRoaXMubmFtZSA9IFwiVVJJIHYxLjIuNlwiO1xuXHRcdHRoaXMub3B0cyA9IG9wdHM7XG5cdFx0dGhpcy5qc29uID0geyBzY2hlbWU6IFwiXCIsIGhvc3Q6IFwiXCIsIHBhdGg6IFwiXCIsIHF1ZXJ5OiB7fSB9O1xuXHR9O1xuXG5cdHBhcnNlKHVybCkge1xuXHRcdGNvbnN0IFVSTFJlZ2V4ID0gLyg/Oig/PHNjaGVtZT4uKyk6XFwvXFwvKD88aG9zdD5bXi9dKykpP1xcLz8oPzxwYXRoPlteP10rKT9cXD8/KD88cXVlcnk+W14/XSspPy87XG5cdFx0bGV0IGpzb24gPSB1cmwubWF0Y2goVVJMUmVnZXgpPy5ncm91cHMgPz8gbnVsbDtcblx0XHRpZiAoanNvbj8ucGF0aCkganNvbi5wYXRocyA9IGpzb24ucGF0aC5zcGxpdChcIi9cIik7IGVsc2UganNvbi5wYXRoID0gXCJcIjtcblx0XHQvL2lmIChqc29uPy5wYXRocz8uYXQoLTEpPy5pbmNsdWRlcyhcIi5cIikpIGpzb24uZm9ybWF0ID0ganNvbi5wYXRocy5hdCgtMSkuc3BsaXQoXCIuXCIpLmF0KC0xKTtcblx0XHRpZiAoanNvbj8ucGF0aHMpIHtcblx0XHRcdGNvbnN0IGZpbGVOYW1lID0ganNvbi5wYXRoc1tqc29uLnBhdGhzLmxlbmd0aCAtIDFdO1xuXHRcdFx0aWYgKGZpbGVOYW1lPy5pbmNsdWRlcyhcIi5cIikpIHtcblx0XHRcdFx0Y29uc3QgbGlzdCA9IGZpbGVOYW1lLnNwbGl0KFwiLlwiKTtcblx0XHRcdFx0anNvbi5mb3JtYXQgPSBsaXN0W2xpc3QubGVuZ3RoIC0gMV07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChqc29uPy5xdWVyeSkganNvbi5xdWVyeSA9IE9iamVjdC5mcm9tRW50cmllcyhqc29uLnF1ZXJ5LnNwbGl0KFwiJlwiKS5tYXAoKHBhcmFtKSA9PiBwYXJhbS5zcGxpdChcIj1cIikpKTtcblx0XHRyZXR1cm4ganNvblxuXHR9O1xuXG5cdHN0cmluZ2lmeShqc29uID0gdGhpcy5qc29uKSB7XG5cdFx0bGV0IHVybCA9IFwiXCI7XG5cdFx0aWYgKGpzb24/LnNjaGVtZSAmJiBqc29uPy5ob3N0KSB1cmwgKz0ganNvbi5zY2hlbWUgKyBcIjovL1wiICsganNvbi5ob3N0O1xuXHRcdGlmIChqc29uPy5wYXRoKSB1cmwgKz0gKGpzb24/Lmhvc3QpID8gXCIvXCIgKyBqc29uLnBhdGggOiBqc29uLnBhdGg7XG5cdFx0aWYgKGpzb24/LnF1ZXJ5KSB1cmwgKz0gXCI/XCIgKyBPYmplY3QuZW50cmllcyhqc29uLnF1ZXJ5KS5tYXAocGFyYW0gPT4gcGFyYW0uam9pbihcIj1cIikpLmpvaW4oXCImXCIpO1xuXHRcdHJldHVybiB1cmxcblx0fTtcbn1cbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJ2YXIgZ2V0UHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YgPyAob2JqKSA9PiAoT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaikpIDogKG9iaikgPT4gKG9iai5fX3Byb3RvX18pO1xudmFyIGxlYWZQcm90b3R5cGVzO1xuLy8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4vLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbi8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuLy8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4vLyBtb2RlICYgMTY6IHJldHVybiB2YWx1ZSB3aGVuIGl0J3MgUHJvbWlzZS1saWtlXG4vLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuXHRpZihtb2RlICYgMSkgdmFsdWUgPSB0aGlzKHZhbHVlKTtcblx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcblx0aWYodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSkge1xuXHRcdGlmKChtb2RlICYgNCkgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuXHRcdGlmKChtb2RlICYgMTYpICYmIHR5cGVvZiB2YWx1ZS50aGVuID09PSAnZnVuY3Rpb24nKSByZXR1cm4gdmFsdWU7XG5cdH1cblx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcblx0dmFyIGRlZiA9IHt9O1xuXHRsZWFmUHJvdG90eXBlcyA9IGxlYWZQcm90b3R5cGVzIHx8IFtudWxsLCBnZXRQcm90byh7fSksIGdldFByb3RvKFtdKSwgZ2V0UHJvdG8oZ2V0UHJvdG8pXTtcblx0Zm9yKHZhciBjdXJyZW50ID0gbW9kZSAmIDIgJiYgdmFsdWU7IHR5cGVvZiBjdXJyZW50ID09ICdvYmplY3QnICYmICF+bGVhZlByb3RvdHlwZXMuaW5kZXhPZihjdXJyZW50KTsgY3VycmVudCA9IGdldFByb3RvKGN1cnJlbnQpKSB7XG5cdFx0T2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoY3VycmVudCkuZm9yRWFjaCgoa2V5KSA9PiAoZGVmW2tleV0gPSAoKSA9PiAodmFsdWVba2V5XSkpKTtcblx0fVxuXHRkZWZbJ2RlZmF1bHQnXSA9ICgpID0+ICh2YWx1ZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChucywgZGVmKTtcblx0cmV0dXJuIG5zO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLypcblJFQURNRTogaHR0cHM6Ly9naXRodWIuY29tL1ZpcmdpbENseW5lL2lSaW5nb1xuKi9cblxuaW1wb3J0IEVOVnMgZnJvbSBcIi4vRU5WL0VOVi5tanNcIjtcbmltcG9ydCBVUklzIGZyb20gXCIuL1VSSS9VUkkubWpzXCI7XG5cbmltcG9ydCAqIGFzIERlZmF1bHQgZnJvbSBcIi4vZGF0YWJhc2UvRGVmYXVsdC5qc29uXCI7XG5pbXBvcnQgKiBhcyBMb2NhdGlvbiBmcm9tIFwiLi9kYXRhYmFzZS9Mb2NhdGlvbi5qc29uXCI7XG5pbXBvcnQgKiBhcyBOZXdzIGZyb20gXCIuL2RhdGFiYXNlL05ld3MuanNvblwiO1xuaW1wb3J0ICogYXMgUHJpdmF0ZVJlbGF5IGZyb20gXCIuL2RhdGFiYXNlL1ByaXZhdGVSZWxheS5qc29uXCI7XG5pbXBvcnQgKiBhcyBTaXJpIGZyb20gXCIuL2RhdGFiYXNlL1NpcmkuanNvblwiO1xuaW1wb3J0ICogYXMgVGVzdEZsaWdodCBmcm9tIFwiLi9kYXRhYmFzZS9UZXN0RmxpZ2h0Lmpzb25cIjtcbmltcG9ydCAqIGFzIFRWIGZyb20gXCIuL2RhdGFiYXNlL1RWLmpzb25cIjtcblxuY29uc3QgJCA9IG5ldyBFTlZzKFwi76O/IGlSaW5nbzog4pyIIFRlc3RGbGlnaHQgdjMuMS4xKDEpIHJlc3BvbnNlLmJldGFcIik7XG5jb25zdCBVUkkgPSBuZXcgVVJJcygpO1xuY29uc3QgRGF0YUJhc2UgPSB7XG5cdFwiRGVmYXVsdFwiOiBEZWZhdWx0LFxuXHRcIkxvY2F0aW9uXCI6IExvY2F0aW9uLFxuXHRcIk5ld3NcIjogTmV3cyxcblx0XCJQcml2YXRlUmVsYXlcIjogUHJpdmF0ZVJlbGF5LFxuXHRcIlNpcmlcIjogU2lyaSxcblx0XCJUZXN0RmxpZ2h0XCI6IFRlc3RGbGlnaHQsXG5cdFwiVFZcIjogVFYsXG59O1xuXG4vKioqKioqKioqKioqKioqKiogUHJvY2Vzc2luZyAqKioqKioqKioqKioqKioqKi9cbi8vIOino+aehFVSTFxuY29uc3QgVVJMID0gVVJJLnBhcnNlKCRyZXF1ZXN0LnVybCk7XG4kLmxvZyhg4pqgICR7JC5uYW1lfWAsIGBVUkw6ICR7SlNPTi5zdHJpbmdpZnkoVVJMKX1gLCBcIlwiKTtcbi8vIOiOt+WPlui/nuaOpeWPguaVsFxuY29uc3QgTUVUSE9EID0gJHJlcXVlc3QubWV0aG9kLCBIT1NUID0gVVJMLmhvc3QsIFBBVEggPSBVUkwucGF0aCwgUEFUSHMgPSBVUkwucGF0aHM7XG4kLmxvZyhg4pqgICR7JC5uYW1lfWAsIGBNRVRIT0Q6ICR7TUVUSE9EfWAsIFwiXCIpO1xuLy8g6Kej5p6Q5qC85byPXG5jb25zdCBGT1JNQVQgPSAoJHJlc3BvbnNlLmhlYWRlcnM/LltcIkNvbnRlbnQtVHlwZVwiXSA/PyAkcmVzcG9uc2UuaGVhZGVycz8uW1wiY29udGVudC10eXBlXCJdKT8uc3BsaXQoXCI7XCIpPy5bMF07XG4kLmxvZyhg4pqgICR7JC5uYW1lfWAsIGBGT1JNQVQ6ICR7Rk9STUFUfWAsIFwiXCIpO1xuKGFzeW5jICgpID0+IHtcblx0Y29uc3QgeyBTZXR0aW5ncywgQ2FjaGVzLCBDb25maWdzIH0gPSBzZXRFTlYoXCJpUmluZ29cIiwgXCJUZXN0RmxpZ2h0XCIsIERhdGFCYXNlKTtcblx0JC5sb2coYOKaoCAkeyQubmFtZX1gLCBgU2V0dGluZ3MuU3dpdGNoOiAke1NldHRpbmdzPy5Td2l0Y2h9YCwgXCJcIik7XG5cdHN3aXRjaCAoU2V0dGluZ3MuU3dpdGNoKSB7XG5cdFx0Y2FzZSB0cnVlOlxuXHRcdGRlZmF1bHQ6XG5cdFx0XHQvLyDliJvlu7rnqbrmlbDmja5cblx0XHRcdGxldCBib2R5ID0ge307XG5cdFx0XHQvLyDmoLzlvI/liKTmlq1cblx0XHRcdHN3aXRjaCAoRk9STUFUKSB7XG5cdFx0XHRcdGNhc2UgdW5kZWZpbmVkOiAvLyDop4bkuLrml6Bib2R5XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIjpcblx0XHRcdFx0Y2FzZSBcInRleHQvcGxhaW5cIjpcblx0XHRcdFx0Y2FzZSBcInRleHQvaHRtbFwiOlxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24veC1tcGVnVVJMXCI6XG5cdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi94LW1wZWd1cmxcIjpcblx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3ZuZC5hcHBsZS5tcGVndXJsXCI6XG5cdFx0XHRcdGNhc2UgXCJhdWRpby9tcGVndXJsXCI6XG5cdFx0XHRcdFx0Ly9ib2R5ID0gTTNVOC5wYXJzZSgkcmVzcG9uc2UuYm9keSk7XG5cdFx0XHRcdFx0Ly8kLmxvZyhg8J+apyAkeyQubmFtZX1gLCBgYm9keTogJHtKU09OLnN0cmluZ2lmeShib2R5KX1gLCBcIlwiKTtcblx0XHRcdFx0XHQvLyRyZXNwb25zZS5ib2R5ID0gTTNVOC5zdHJpbmdpZnkoYm9keSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJ0ZXh0L3htbFwiOlxuXHRcdFx0XHRjYXNlIFwidGV4dC9wbGlzdFwiOlxuXHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24veG1sXCI6XG5cdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi9wbGlzdFwiOlxuXHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24veC1wbGlzdFwiOlxuXHRcdFx0XHRcdC8vYm9keSA9IFhNTC5wYXJzZSgkcmVzcG9uc2UuYm9keSk7XG5cdFx0XHRcdFx0Ly8kLmxvZyhg8J+apyAkeyQubmFtZX1gLCBgYm9keTogJHtKU09OLnN0cmluZ2lmeShib2R5KX1gLCBcIlwiKTtcblx0XHRcdFx0XHQvLyRyZXNwb25zZS5ib2R5ID0gWE1MLnN0cmluZ2lmeShib2R5KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcInRleHQvdnR0XCI6XG5cdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi92dHRcIjpcblx0XHRcdFx0XHQvL2JvZHkgPSBWVFQucGFyc2UoJHJlc3BvbnNlLmJvZHkpO1xuXHRcdFx0XHRcdC8vJC5sb2coYPCfmqcgJHskLm5hbWV9YCwgYGJvZHk6ICR7SlNPTi5zdHJpbmdpZnkoYm9keSl9YCwgXCJcIik7XG5cdFx0XHRcdFx0Ly8kcmVzcG9uc2UuYm9keSA9IFZUVC5zdHJpbmdpZnkoYm9keSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJ0ZXh0L2pzb25cIjpcblx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL2pzb25cIjpcblx0XHRcdFx0XHRib2R5ID0gSlNPTi5wYXJzZSgkcmVzcG9uc2UuYm9keSA/PyBcInt9XCIpO1xuXHRcdFx0XHRcdCQubG9nKGDwn5qnICR7JC5uYW1lfWAsIGBib2R5OiAke0pTT04uc3RyaW5naWZ5KGJvZHkpfWAsIFwiXCIpO1xuXHRcdFx0XHRcdC8vIOS4u+acuuWIpOaWrVxuXHRcdFx0XHRcdHN3aXRjaCAoSE9TVCkge1xuXHRcdFx0XHRcdFx0Y2FzZSBcInRlc3RmbGlnaHQuYXBwbGUuY29tXCI6XG5cdFx0XHRcdFx0XHRcdC8vIOi3r+W+hOWIpOaWrVxuXHRcdFx0XHRcdFx0XHRzd2l0Y2ggKFBBVEgpIHtcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwidjEvc2Vzc2lvbi9hdXRoZW50aWNhdGVcIjpcblx0XHRcdFx0XHRcdFx0XHRcdHN3aXRjaCAoU2V0dGluZ3MuTXVsdGlBY2NvdW50KSB7IC8vIE11bHRpQWNjb3VudFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIHRydWU6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0JC5sb2coYOKaoCAkeyQubmFtZX0sIOWQr+eUqOWkmui0puWPt+aUr+aMgWAsIFwiXCIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IFhSZXF1ZXN0SWQgPSAkcmVxdWVzdD8uaGVhZGVycz8uW1wiWC1SZXF1ZXN0LUlkXCJdID8/ICRyZXF1ZXN0Py5oZWFkZXJzPy5bXCJ4LXJlcXVlc3QtaWRcIl07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgWFNlc3Npb25JZCA9ICRyZXF1ZXN0Py5oZWFkZXJzPy5bXCJYLVNlc3Npb24tSWRcIl0gPz8gJHJlcXVlc3Q/LmhlYWRlcnM/LltcIngtc2Vzc2lvbi1pZFwiXTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBYU2Vzc2lvbkRpZ2VzdCA9ICRyZXF1ZXN0Py5oZWFkZXJzPy5bXCJYLVNlc3Npb24tRGlnZXN0XCJdID8/ICRyZXF1ZXN0Py5oZWFkZXJzPy5bXCJ4LXNlc3Npb24tZGlnZXN0XCJdO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChDYWNoZXM/LmRhdGEpIHsgLy/mnIlkYXRhXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQkLmxvZyhg4pqgICR7JC5uYW1lfSwg5pyJQ2FjaGVzLmRhdGFgLCBcIlwiKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChib2R5Py5kYXRhPy5hY2NvdW50SWQgPT09IENhY2hlcz8uZGF0YT8uYWNjb3VudElkKSB7IC8vIEFjY291bnQgSUTnm7jnrYnvvIzliLfmlrDnvJPlrZhcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0JC5sb2coYOKaoCAkeyQubmFtZX0sIEFjY291bnQgSUTnm7jnrYnvvIzliLfmlrDnvJPlrZhgLCBcIlwiKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Q2FjaGVzLmhlYWRlcnMgPSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XCJYLVJlcXVlc3QtSWRcIjogWFJlcXVlc3RJZCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcIlgtU2Vzc2lvbi1JZFwiOiBYU2Vzc2lvbklkLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFwiWC1TZXNzaW9uLURpZ2VzdFwiOiBYU2Vzc2lvbkRpZ2VzdFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRDYWNoZXMuZGF0YSA9IGJvZHkuZGF0YTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Q2FjaGVzLmRhdGEudGVybXNBbmRDb25kaXRpb25zID0gbnVsbDtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Q2FjaGVzLmRhdGEuaGFzTmV3VGVybXNBbmRDb25kaXRpb25zID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCQuc2V0anNvbihDYWNoZXMsIFwiQGlSaW5nby5UZXN0RmxpZ2h0LkNhY2hlc1wiKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRlbHNlIHsgLy8gQWNjb3VudCBJROS4jeebuOetie+8jOimhuebllxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQkLmxvZyhg4pqgICR7JC5uYW1lfSwgQWNjb3VudCBJROS4jeebuOetie+8jOimhueblmRhdGEoYWNjb3VudElk5ZKMc2Vzc2lvbklkKWAsIFwiXCIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRib2R5LmRhdGEgPSBDYWNoZXMuZGF0YTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCovXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHsgLy8gQ2FjaGVz56m6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQkLmxvZyhg4pqgICR7JC5uYW1lfSwgQ2FjaGVz56m677yM5YaZ5YWlYCwgXCJcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRDYWNoZXMuaGVhZGVycyA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XCJYLVJlcXVlc3QtSWRcIjogWFJlcXVlc3RJZCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XCJYLVNlc3Npb24tSWRcIjogWFNlc3Npb25JZCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XCJYLVNlc3Npb24tRGlnZXN0XCI6IFhTZXNzaW9uRGlnZXN0XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Q2FjaGVzLmRhdGEgPSBib2R5LmRhdGE7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRDYWNoZXMuZGF0YS50ZXJtc0FuZENvbmRpdGlvbnMgPSBudWxsO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Q2FjaGVzLmRhdGEuaGFzTmV3VGVybXNBbmRDb25kaXRpb25zID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQkLnNldGpzb24oQ2FjaGVzLCBcIkBpUmluZ28uVGVzdEZsaWdodC5DYWNoZXNcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBmYWxzZTpcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwidjEvZGV2aWNlc1wiOlxuXHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJ2MS9kZXZpY2VzL2FwbnNcIjpcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwidjEvZGV2aWNlcy9hZGRcIjpcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwidjEvZGV2aWNlcy9yZW1vdmVcIjpcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0XHRzd2l0Y2ggKFBBVEhzWzBdKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJ2MVwiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwidjJcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcInYzXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3dpdGNoIChQQVRIc1sxXSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcImFjY291bnRzXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHN3aXRjaCAoUEFUSHNbMl0pIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwic2V0dGluZ3NcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHN3aXRjaCAoUEFUSHNbM10pIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSB1bmRlZmluZWQ6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0JC5sb2coYPCfmqcgJHskLm5hbWV9LCAke1BBVEhzWzBdfS9hY2NvdW50cy9zZXR0aW5nc2AsIFwiXCIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwibm90aWZpY2F0aW9uc1wiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHN3aXRjaCAoUEFUSHNbNF0pIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJhcHBzXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCQubG9nKGDwn5qnICR7JC5uYW1lfSwgJHtQQVRIc1swXX0vYWNjb3VudHMvc2V0dGluZ3Mvbm90aWZpY2F0aW9ucy9hcHBzL2AsIFwiXCIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCQubG9nKGDwn5qnICR7JC5uYW1lfSwgJHtQQVRIc1swXX0vYWNjb3VudHMvc2V0dGluZ3MvJHtQQVRIc1szXX0vYCwgXCJcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBDYWNoZXM/LmRhdGE/LmFjY291bnRJZDogLy8gVVVJRFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzd2l0Y2ggKFBBVEhzWzNdKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgdW5kZWZpbmVkOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCQubG9nKGDwn5qnICR7JC5uYW1lfSwgJHtQQVRIc1swXX0vYWNjb3VudHMvJHtQQVRIc1syXX1gLCBcIlwiKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcImFwcHNcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQkLmxvZyhg8J+apyAkeyQubmFtZX0sICR7UEFUSHNbMF19L2FjY291bnRzLyR7UEFUSHNbMl19L2FwcHMvYCwgXCJcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3dpdGNoIChQQVRIc1s0XSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSB1bmRlZmluZWQ6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCQubG9nKGDwn5qnICR7JC5uYW1lfSwgJHtQQVRIc1swXX0vYWNjb3VudHMvJHtQQVRIc1syXX0vYXBwc2AsIFwiXCIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzd2l0Y2ggKFNldHRpbmdzLlVuaXZlcnNhbCkgeyAvLyDpgJrnlKhcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIHRydWU6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQkLmxvZyhg8J+apyAkeyQubmFtZX0sIOWQr+eUqOmAmueUqOW6lOeUqOaUr+aMgWAsIFwiXCIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKGJvZHkuZXJyb3IgPT09IG51bGwpIHsgLy8g5pWw5o2u5peg6ZSZ6K+vXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCQubG9nKGDwn5qnICR7JC5uYW1lfSwg5pWw5o2u5peg6ZSZ6K+vYCwgXCJcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJvZHkuZGF0YSA9IGJvZHkuZGF0YS5tYXAoYXBwID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoYXBwLnByZXZpb3VzbHlUZXN0ZWQgIT09IGZhbHNlKSB7IC8vIOS4jeaYr+WJjea1i+ivleS6uuWRmFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0JC5sb2coYPCfmqcgJHskLm5hbWV9LCDkuI3mmK/liY3mtYvor5XkurrlkZhgLCBcIlwiKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFwcC5wbGF0Zm9ybXMgPSBhcHAucGxhdGZvcm1zLm1hcChwbGF0Zm9ybSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHBsYXRmb3JtLmJ1aWxkID0gbW9kQnVpbGQocGxhdGZvcm0uYnVpbGQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gcGxhdGZvcm1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gYXBwXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgZmFsc2U6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHN3aXRjaCAoUEFUSHNbNV0pIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIHVuZGVmaW5lZDpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCQubG9nKGDwn5qnICR7JC5uYW1lfSwgJHtQQVRIc1swXX0vYWNjb3VudHMvJHtQQVRIc1syXX0vYXBwcy8ke1BBVEhzWzRdfWAsIFwiXCIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcImJ1aWxkc1wiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3dpdGNoIChQQVRIc1s3XSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIHVuZGVmaW5lZDpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQkLmxvZyhg8J+apyAkeyQubmFtZX0sICR7UEFUSHNbMF19L2FjY291bnRzLyR7UEFUSHNbMl19L2FwcHMvJHtQQVRIc1s0XX0vYnVpbGRzLyR7UEFUSHNbNl19YCwgXCJcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3dpdGNoIChTZXR0aW5ncy5Vbml2ZXJzYWwpIHsgLy8g6YCa55SoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIHRydWU6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCQubG9nKGDwn5qnICR7JC5uYW1lfSwg5ZCv55So6YCa55So5bqU55So5pSv5oyBYCwgXCJcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChib2R5LmVycm9yID09PSBudWxsKSB7IC8vIOaVsOaNruaXoOmUmeivr1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCQubG9nKGDwn5qnICR7JC5uYW1lfSwg5pWw5o2u5peg6ZSZ6K+vYCwgXCJcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8g5b2T5YmNQnVsaWRcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRib2R5LmRhdGEuY3VycmVudEJ1aWxkID0gbW9kQnVpbGQoYm9keS5kYXRhLmN1cnJlbnRCdWlsZCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gQnVpbGTliJfooahcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRib2R5LmRhdGEuYnVpbGRzID0gYm9keS5kYXRhLmJ1aWxkcy5tYXAoYnVpbGQgPT4gbW9kQnVpbGQoYnVpbGQpKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIGZhbHNlOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcImluc3RhbGxcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQkLmxvZyhg8J+apyAkeyQubmFtZX0sICR7UEFUSHNbMF19L2FjY291bnRzLyR7UEFUSHNbMl19L2FwcHMvJHtQQVRIc1s0XX0vYnVpbGRzLyR7UEFUSHNbNl19L2luc3RhbGxgLCBcIlwiKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQkLmxvZyhg8J+apyAkeyQubmFtZX0sICR7UEFUSHNbMF19L2FjY291bnRzLyR7UEFUSHNbMl19L2FwcHMvJHtQQVRIc1s0XX0vYnVpbGRzLyR7UEFUSHNbNl19LyR7UEFUSHNbN119YCwgXCJcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcInBsYXRmb3Jtc1wiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3dpdGNoIChQQVRIc1s2XSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiaW9zXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJvc3hcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxldHZvc1wiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHN3aXRjaCAoUEFUSHNbN10pIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgdW5kZWZpbmVkOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQkLmxvZyhg8J+apyAkeyQubmFtZX0sICR7UEFUSHNbMF19L2FjY291bnRzLyR7UEFUSHNbMl19L2FwcHMvJHtQQVRIc1s0XX0vcGxhdGZvcm1zLyR7UEFUSHNbNl19YCwgXCJcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcInRyYWluc1wiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzd2l0Y2ggKFBBVEhzWzldKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSB1bmRlZmluZWQ6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQkLmxvZyhg8J+apyAkeyQubmFtZX0sICR7UEFUSHNbMF19L2FjY291bnRzLyR7UEFUSHNbMl19L2FwcHMvJHtQQVRIc1s0XX0vcGxhdGZvcm1zLyR7UEFUSHNbNl19L3RyYWlucy8ke1BBVEhzWzhdfWAsIFwiXCIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcImJ1aWxkc1wiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3dpdGNoIChQQVRIc1sxMF0pIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSB1bmRlZmluZWQ6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0JC5sb2coYPCfmqcgJHskLm5hbWV9LCAke1BBVEhzWzBdfS9hY2NvdW50cy8ke1BBVEhzWzJdfS9hcHBzLyR7UEFUSHNbNF19L3BsYXRmb3Jtcy8ke1BBVEhzWzZdfS90cmFpbnMvJHtQQVRIc1s4XX0vYnVpbGRzYCwgXCJcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3dpdGNoIChTZXR0aW5ncy5Vbml2ZXJzYWwpIHsgLy8g6YCa55SoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIHRydWU6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCQubG9nKGDwn5qnICR7JC5uYW1lfSwg5ZCv55So6YCa55So5bqU55So5pSv5oyBYCwgXCJcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChib2R5LmVycm9yID09PSBudWxsKSB7IC8vIOaVsOaNruaXoOmUmeivr1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCQubG9nKGDwn5qnICR7JC5uYW1lfSwg5pWw5o2u5peg6ZSZ6K+vYCwgXCJcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8g5b2T5YmNQnVsaWRcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRib2R5LmRhdGEgPSBib2R5LmRhdGEubWFwKGRhdGEgPT4gbW9kQnVpbGQoZGF0YSkpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgZmFsc2U6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCQubG9nKGDwn5qnICR7JC5uYW1lfSwgJHtQQVRIc1swXX0vYWNjb3VudHMvJHtQQVRIc1syXX0vYXBwcy8ke1BBVEhzWzRdfS9wbGF0Zm9ybXMvJHtQQVRIc1s2XX0vdHJhaW5zLyR7UEFUSHNbOF19L2J1aWxkcy8ke1BBVEhzWzEwXX1gLCBcIlwiKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0JC5sb2coYPCfmqcgJHskLm5hbWV9LCAke1BBVEhzWzBdfS9hY2NvdW50cy8ke1BBVEhzWzJdfS9hcHBzLyR7UEFUSHNbNF19L3BsYXRmb3Jtcy8ke1BBVEhzWzZdfS90cmFpbnMvJHtQQVRIc1s4XX0vJHtQQVRIc1s5XX1gLCBcIlwiKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCQubG9nKGDwn5qnICR7JC5uYW1lfSwgJHtQQVRIc1swXX0vYWNjb3VudHMvJHtQQVRIc1syXX0vYXBwcy8ke1BBVEhzWzRdfS9wbGF0Zm9ybXMvJHtQQVRIc1s2XX0vJHtQQVRIc1s3XX1gLCBcIlwiKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0JC5sb2coYPCfmqcgJHskLm5hbWV9LCAke1BBVEhzWzBdfS9hY2NvdW50cy8ke1BBVEhzWzJdfS9hcHBzLyR7UEFUSHNbNF19LyR7UEFUSHNbNV19YCwgXCJcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQkLmxvZyhg8J+apyAkeyQubmFtZX0sICR7UEFUSHNbMF19L2FjY291bnRzLyR7UEFUSHNbMl19LyR7UEFUSHNbM119L2AsIFwiXCIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJhcHBzXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHN3aXRjaCAoUEFUSHNbM10pIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiaW5zdGFsbFwiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3dpdGNoIChQQVRIc1s0XSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIHVuZGVmaW5lZDpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQkLmxvZyhg8J+apyAkeyQubmFtZX0sICR7UEFUSHNbMF19L2FwcHMvaW5zdGFsbGAsIFwiXCIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwic3RhdHVzXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0JC5sb2coYPCfmqcgJHskLm5hbWV9LCAke1BBVEhzWzBdfS9hcHBzL2luc3RhbGwvc3RhdHVzYCwgXCJcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0JC5sb2coYPCfmqcgJHskLm5hbWV9LCAke1BBVEhzWzBdfS9hcHBzL2luc3RhbGwvJHtQQVRIc1s0XX1gLCBcIlwiKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwibWVzc2FnZXNcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3dpdGNoIChQQVRIc1syXSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgQ2FjaGVzPy5kYXRhPy5hY2NvdW50SWQ6IC8vIFVVSURcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0JC5sb2coYPCfmqcgJHskLm5hbWV9LCAke1BBVEhzWzBdfS9tZXNzYWdlcy8ke1BBVEhzWzJdfWAsIFwiXCIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3dpdGNoIChQQVRIc1szXSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIHVuZGVmaW5lZDpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQkLmxvZyhg8J+apyAkeyQubmFtZX0sICR7UEFUSHNbMF19L21lc3NhZ2VzLyR7UEFUSHNbMl19YCwgXCJcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJyZWFkXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0JC5sb2coYPCfmqcgJHskLm5hbWV9LCAke1BBVEhzWzBdfS9tZXNzYWdlcy8ke1BBVEhzWzJdfS9yZWFkYCwgXCJcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0JC5sb2coYPCfmqcgJHskLm5hbWV9LCAke1BBVEhzWzBdfS9tZXNzYWdlcy8ke1BBVEhzWzJdfS8ke1BBVEhzWzNdfWAsIFwiXCIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdCRyZXNwb25zZS5ib2R5ID0gSlNPTi5zdHJpbmdpZnkoYm9keSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi9wcm90b2J1ZlwiOlxuXHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24veC1wcm90b2J1ZlwiOlxuXHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24vdm5kLmdvb2dsZS5wcm90b2J1ZlwiOlxuXHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24vZ3JwY1wiOlxuXHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24vZ3JwYytwcm90b1wiOlxuXHRcdFx0XHRjYXNlIFwiYXBwbGVjYXRpb24vb2N0ZXQtc3RyZWFtXCI6XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9O1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBmYWxzZTpcblx0XHRcdGJyZWFrO1xuXHR9O1xufSkoKVxuXHQuY2F0Y2goKGUpID0+ICQubG9nRXJyKGUpKVxuXHQuZmluYWxseSgoKSA9PiB7XG5cdFx0c3dpdGNoICgkcmVzcG9uc2UpIHtcblx0XHRcdGRlZmF1bHQ6IHsgLy8g5pyJ5Zue5aSN5pWw5o2u77yM6L+U5Zue5Zue5aSN5pWw5o2uXG5cdFx0XHRcdC8vY29uc3QgRk9STUFUID0gKCRyZXNwb25zZT8uaGVhZGVycz8uW1wiQ29udGVudC1UeXBlXCJdID8/ICRyZXNwb25zZT8uaGVhZGVycz8uW1wiY29udGVudC10eXBlXCJdKT8uc3BsaXQoXCI7XCIpPy5bMF07XG5cdFx0XHRcdCQubG9nKGDwn46JICR7JC5uYW1lfSwgZmluYWxseWAsIGAkcmVzcG9uc2VgLCBgRk9STUFUOiAke0ZPUk1BVH1gLCBcIlwiKTtcblx0XHRcdFx0Ly8kLmxvZyhg8J+apyAkeyQubmFtZX0sIGZpbmFsbHlgLCBgJHJlc3BvbnNlOiAke0pTT04uc3RyaW5naWZ5KCRyZXNwb25zZSl9YCwgXCJcIik7XG5cdFx0XHRcdGlmICgkcmVzcG9uc2U/LmhlYWRlcnM/LltcIkNvbnRlbnQtRW5jb2RpbmdcIl0pICRyZXNwb25zZS5oZWFkZXJzW1wiQ29udGVudC1FbmNvZGluZ1wiXSA9IFwiaWRlbnRpdHlcIjtcblx0XHRcdFx0aWYgKCRyZXNwb25zZT8uaGVhZGVycz8uW1wiY29udGVudC1lbmNvZGluZ1wiXSkgJHJlc3BvbnNlLmhlYWRlcnNbXCJjb250ZW50LWVuY29kaW5nXCJdID0gXCJpZGVudGl0eVwiO1xuXHRcdFx0XHRpZiAoJC5pc1F1YW5YKCkpIHtcblx0XHRcdFx0XHRzd2l0Y2ggKEZPUk1BVCkge1xuXHRcdFx0XHRcdFx0Y2FzZSB1bmRlZmluZWQ6IC8vIOinhuS4uuaXoGJvZHlcblx0XHRcdFx0XHRcdFx0Ly8g6L+U5Zue5pmu6YCa5pWw5o2uXG5cdFx0XHRcdFx0XHRcdCQuZG9uZSh7IHN0YXR1czogJHJlc3BvbnNlLnN0YXR1cywgaGVhZGVyczogJHJlc3BvbnNlLmhlYWRlcnMgfSk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0Ly8g6L+U5Zue5pmu6YCa5pWw5o2uXG5cdFx0XHRcdFx0XHRcdCQuZG9uZSh7IHN0YXR1czogJHJlc3BvbnNlLnN0YXR1cywgaGVhZGVyczogJHJlc3BvbnNlLmhlYWRlcnMsIGJvZHk6ICRyZXNwb25zZS5ib2R5IH0pO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi9wcm90b2J1ZlwiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3gtcHJvdG9idWZcIjpcblx0XHRcdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi92bmQuZ29vZ2xlLnByb3RvYnVmXCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24vZ3JwY1wiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL2dycGMrcHJvdG9cIjpcblx0XHRcdFx0XHRcdGNhc2UgXCJhcHBsZWNhdGlvbi9vY3RldC1zdHJlYW1cIjpcblx0XHRcdFx0XHRcdFx0Ly8g6L+U5Zue5LqM6L+b5Yi25pWw5o2uXG5cdFx0XHRcdFx0XHRcdC8vJC5sb2coYCR7JHJlc3BvbnNlLmJvZHlCeXRlcy5ieXRlTGVuZ3RofS0tLSR7JHJlc3BvbnNlLmJvZHlCeXRlcy5idWZmZXIuYnl0ZUxlbmd0aH1gKTtcblx0XHRcdFx0XHRcdFx0JC5kb25lKHsgc3RhdHVzOiAkcmVzcG9uc2Uuc3RhdHVzLCBoZWFkZXJzOiAkcmVzcG9uc2UuaGVhZGVycywgYm9keUJ5dGVzOiAkcmVzcG9uc2UuYm9keUJ5dGVzLmJ1ZmZlci5zbGljZSgkcmVzcG9uc2UuYm9keUJ5dGVzLmJ5dGVPZmZzZXQsICRyZXNwb25zZS5ib2R5Qnl0ZXMuYnl0ZUxlbmd0aCArICRyZXNwb25zZS5ib2R5Qnl0ZXMuYnl0ZU9mZnNldCkgfSk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH0gZWxzZSAkLmRvbmUoJHJlc3BvbnNlKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9O1xuXHRcdFx0Y2FzZSB1bmRlZmluZWQ6IHsgLy8g5peg5Zue5aSN5pWw5o2uXG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fTtcblx0XHR9O1xuXHR9KVxuXG4vKioqKioqKioqKioqKioqKiogRnVuY3Rpb24gKioqKioqKioqKioqKioqKiovXG4vKipcbiAqIFNldCBFbnZpcm9ubWVudCBWYXJpYWJsZXNcbiAqIEBhdXRob3IgVmlyZ2lsQ2x5bmVcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gUGVyc2lzdGVudCBTdG9yZSBLZXlcbiAqIEBwYXJhbSB7QXJyYXl9IHBsYXRmb3JtcyAtIFBsYXRmb3JtIE5hbWVzXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YWJhc2UgLSBEZWZhdWx0IERhdGFCYXNlXG4gKiBAcmV0dXJuIHtPYmplY3R9IHsgU2V0dGluZ3MsIENhY2hlcywgQ29uZmlncyB9XG4gKi9cbmZ1bmN0aW9uIHNldEVOVihuYW1lLCBwbGF0Zm9ybXMsIGRhdGFiYXNlKSB7XG5cdCQubG9nKGDimqAgJHskLm5hbWV9LCBTZXQgRW52aXJvbm1lbnQgVmFyaWFibGVzYCwgXCJcIik7XG5cdGxldCB7IFNldHRpbmdzLCBDYWNoZXMsIENvbmZpZ3MgfSA9ICQuZ2V0RU5WKG5hbWUsIHBsYXRmb3JtcywgZGF0YWJhc2UpO1xuXHQvKioqKioqKioqKioqKioqKiogU2V0dGluZ3MgKioqKioqKioqKioqKioqKiovXG5cdCQubG9nKGDwn46JICR7JC5uYW1lfSwgU2V0IEVudmlyb25tZW50IFZhcmlhYmxlc2AsIGBTZXR0aW5nczogJHt0eXBlb2YgU2V0dGluZ3N9YCwgYFNldHRpbmdz5YaF5a65OiAke0pTT04uc3RyaW5naWZ5KFNldHRpbmdzKX1gLCBcIlwiKTtcblx0LyoqKioqKioqKioqKioqKioqIENhY2hlcyAqKioqKioqKioqKioqKioqKi9cblx0Ly8kLmxvZyhg8J+OiSAkeyQubmFtZX0sIFNldCBFbnZpcm9ubWVudCBWYXJpYWJsZXNgLCBgQ2FjaGVzOiAke3R5cGVvZiBDYWNoZXN9YCwgYENhY2hlc+WGheWuuTogJHtKU09OLnN0cmluZ2lmeShDYWNoZXMpfWAsIFwiXCIpO1xuXHQvKioqKioqKioqKioqKioqKiogQ29uZmlncyAqKioqKioqKioqKioqKioqKi9cblx0Q29uZmlncy5TdG9yZWZyb250ID0gbmV3IE1hcChDb25maWdzLlN0b3JlZnJvbnQpO1xuXHRyZXR1cm4geyBTZXR0aW5ncywgQ2FjaGVzLCBDb25maWdzIH07XG59O1xuXG4vKipcbiAqIG1vZCBCdWlsZFxuICogQGF1dGhvciBWaXJnaWxDbHluZVxuICogQHBhcmFtIHtPYmplY3R9IGJ1aWxkIC0gQnVpbGRcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gbW9kQnVpbGQoYnVpbGQpIHtcblx0c3dpdGNoIChidWlsZC5wbGF0Zm9ybSB8fCBidWlsZC5uYW1lKSB7XG5cdFx0Y2FzZSBcImlvc1wiOlxuXHRcdFx0JC5sb2coYPCfmqcgJHskLm5hbWV9LCBpb3NgLCBcIlwiKTtcblx0XHRcdGJ1aWxkID0gQnVpbGQoYnVpbGQpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIm9zeFwiOlxuXHRcdFx0JC5sb2coYPCfmqcgJHskLm5hbWV9LCBvc3hgLCBcIlwiKTtcblx0XHRcdGlmIChidWlsZD8ubWFjQnVpbGRDb21wYXRpYmlsaXR5Py5ydW5zT25BcHBsZVNpbGljb24gPT09IHRydWUpIHsgLy8g5piv6Iu55p6c6Iqv54mHXG5cdFx0XHRcdCQubG9nKGDwn5qnICR7JC5uYW1lfSwgcnVuc09uQXBwbGVTaWxpY29uYCwgXCJcIik7XG5cdFx0XHRcdGJ1aWxkID0gQnVpbGQoYnVpbGQpO1xuXHRcdFx0fTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJhcHBsZXR2b3NcIjpcblx0XHRcdCQubG9nKGDwn5qnICR7JC5uYW1lfSwgYXBwbGV0dm9zYCwgXCJcIik7XG5cdFx0XHRicmVhaztcblx0XHRkZWZhdWx0OlxuXHRcdFx0JC5sb2coYPCfmqcgJHskLm5hbWV9LCB1bmtub3duIHBsYXRmb3JtOiAke2J1aWxkLnBsYXRmb3JtIHx8IGJ1aWxkLm5hbWV9YCwgXCJcIik7XG5cdFx0XHRicmVhaztcblx0fTtcblx0cmV0dXJuIGJ1aWxkXG5cblx0ZnVuY3Rpb24gQnVpbGQoYnVpbGQpIHtcblx0XHQvL2lmIChidWlsZC51bml2ZXJzYWwgPT09IHRydWUpIHtcblx0XHRcdGJ1aWxkLmNvbXBhdGlibGUgPSB0cnVlO1xuXHRcdFx0YnVpbGQucGxhdGZvcm1Db21wYXRpYmxlID0gdHJ1ZTtcblx0XHRcdGJ1aWxkLmhhcmR3YXJlQ29tcGF0aWJsZSA9IHRydWU7XG5cdFx0XHRidWlsZC5vc0NvbXBhdGlibGUgPSB0cnVlO1xuXHRcdFx0aWYgKGJ1aWxkPy5wZXJtaXNzaW9uKSBidWlsZC5wZXJtaXNzaW9uID0gXCJpbnN0YWxsXCI7XG5cdFx0XHRpZiAoYnVpbGQ/LmRldmljZUZhbWlseUluZm8pIHtcblx0XHRcdFx0YnVpbGQuZGV2aWNlRmFtaWx5SW5mbyA9IFtcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcIm51bWJlclwiOiAxLFxuXHRcdFx0XHRcdFx0XCJuYW1lXCI6IFwiaU9TXCIsXG5cdFx0XHRcdFx0XHRcImljb25VcmxcIjogXCJodHRwczovL2l0dW5lc2Nvbm5lY3QtbXIuaXR1bmVzLmFwcGxlLmNvbS9pdGMvaW1nL2RldmljZS1pY29ucy9kZXZpY2VfZmFtaWx5X2ljb25fMS5wbmdcIlxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XCJudW1iZXJcIjogMixcblx0XHRcdFx0XHRcdFwibmFtZVwiOiBcImlQYWRcIixcblx0XHRcdFx0XHRcdFwiaWNvblVybFwiOiBcImh0dHBzOi8vaXR1bmVzY29ubmVjdC1tci5pdHVuZXMuYXBwbGUuY29tL2l0Yy9pbWcvZGV2aWNlLWljb25zL2RldmljZV9mYW1pbHlfaWNvbl8yLnBuZ1wiXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcIm51bWJlclwiOiAzLFxuXHRcdFx0XHRcdFx0XCJuYW1lXCI6IFwiQXBwbGUgVFZcIixcblx0XHRcdFx0XHRcdFwiaWNvblVybFwiOiBcImh0dHBzOi8vaXR1bmVzY29ubmVjdC1tci5pdHVuZXMuYXBwbGUuY29tL2l0Yy9pbWcvZGV2aWNlLWljb25zL2RldmljZV9mYW1pbHlfaWNvbl8zLnBuZ1wiXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRdO1xuXHRcdFx0fTtcblx0XHRcdGlmIChidWlsZD8uY29tcGF0aWJpbGl0eURhdGE/LmNvbXBhdGlibGVEZXZpY2VGYW1pbGllcykge1xuXHRcdFx0XHRidWlsZC5jb21wYXRpYmlsaXR5RGF0YS5jb21wYXRpYmxlRGV2aWNlRmFtaWxpZXMgPSBbXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XCJuYW1lXCI6IFwiaVBhZFwiLFxuXHRcdFx0XHRcdFx0XCJtaW5pbXVtU3VwcG9ydGVkRGV2aWNlXCI6IG51bGwsXG5cdFx0XHRcdFx0XHRcInVuc3VwcG9ydGVkRGV2aWNlc1wiOiBbXVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XCJuYW1lXCI6IFwiaVBob25lXCIsXG5cdFx0XHRcdFx0XHRcIm1pbmltdW1TdXBwb3J0ZWREZXZpY2VcIjogbnVsbCxcblx0XHRcdFx0XHRcdFwidW5zdXBwb3J0ZWREZXZpY2VzXCI6IFtdXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcIm5hbWVcIjogXCJpUG9kXCIsXG5cdFx0XHRcdFx0XHRcIm1pbmltdW1TdXBwb3J0ZWREZXZpY2VcIjogbnVsbCxcblx0XHRcdFx0XHRcdFwidW5zdXBwb3J0ZWREZXZpY2VzXCI6IFtdXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcIm5hbWVcIjogXCJNYWNcIixcblx0XHRcdFx0XHRcdFwibWluaW11bVN1cHBvcnRlZERldmljZVwiOiBudWxsLFxuXHRcdFx0XHRcdFx0XCJ1bnN1cHBvcnRlZERldmljZXNcIjogW11cblx0XHRcdFx0XHR9XG5cdFx0XHRcdF07XG5cdFx0XHR9O1xuXHRcdFx0aWYgKGJ1aWxkLm1hY0J1aWxkQ29tcGF0aWJpbGl0eSkge1xuXHRcdFx0XHRidWlsZC5tYWNCdWlsZENvbXBhdGliaWxpdHkucnVuc09uSW50ZWwgPSB0cnVlO1xuXHRcdFx0XHRidWlsZC5tYWNCdWlsZENvbXBhdGliaWxpdHkucnVuc09uQXBwbGVTaWxpY29uID0gdHJ1ZTtcblx0XHRcdFx0Lypcblx0XHRcdFx0YnVpbGQubWFjQnVpbGRDb21wYXRpYmlsaXR5ID0ge1xuXHRcdFx0XHRcdFwibWFjQXJjaGl0ZWN0dXJlc1wiOiBbXCJBcHBsZVNpbGljb25cIiwgXCJJbnRlbFwiXSxcblx0XHRcdFx0XHRcInJvc2V0dGFDb21wYXRpYmxlXCI6IHRydWUsXG5cdFx0XHRcdFx0XCJydW5zT25JbnRlbFwiOiB0cnVlLFxuXHRcdFx0XHRcdFwicnVuc09uQXBwbGVTaWxpY29uXCI6IHRydWUsXG5cdFx0XHRcdFx0XCJyZXF1aXJlc1Jvc2V0dGFcIjogZmFsc2Vcblx0XHRcdFx0fTtcblx0XHRcdFx0Ki9cblx0XHRcdH07XG5cdFx0Ly99O1xuXHRcdHJldHVybiBidWlsZFxuXHR9O1xufTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==