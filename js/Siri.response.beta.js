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

	platform() {
		if ('undefined' !== typeof $environment && $environment['surge-version'])
			return 'Surge'
		if ('undefined' !== typeof $environment && $environment['stash-version'])
			return 'Stash'
		if ('undefined' !== typeof module && !!module.exports) return 'Node.js'
		if ('undefined' !== typeof $task) return 'Quantumult X'
		if ('undefined' !== typeof $loon) return 'Loon'
		if ('undefined' !== typeof $rocket) return 'Shadowrocket'
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
		switch (this.platform()) {
			case 'Surge':
			case 'Loon':
			case 'Stash':
			case 'Shadowrocket':
				return $persistentStore.read(key)
			case 'Quantumult X':
				return $prefs.valueForKey(key)
			case 'Node.js':
				this.data = this.loaddata()
				return this.data[key]
			default:
				return (this.data && this.data[key]) || null
		}
	}

	setval(val, key) {
		switch (this.platform()) {
			case 'Surge':
			case 'Loon':
			case 'Stash':
			case 'Shadowrocket':
				return $persistentStore.write(val, key)
			case 'Quantumult X':
				return $prefs.setValueForKey(val, key)
			case 'Node.js':
				this.data = this.loaddata()
				this.data[key] = val
				this.writedata()
				return true
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
		delete request?.headers?.['Content-Length']
		delete request?.headers?.['content-length']

		switch (this.platform()) {
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
					(error) => callback((error && error.error) || 'UndefinedError')
				)
				break
			case 'Node.js':
				let iconv = require('iconv-lite')
				this.initGotEnv(request)
				this.got(request)
					.on('redirect', (response, nextOpts) => {
						try {
							if (response.headers['set-cookie']) {
								const ck = response.headers['set-cookie']
									.map(this.cktough.Cookie.parse)
									.toString()
								if (ck) {
									this.ckjar.setCookieSync(ck, null)
								}
								nextOpts.cookieJar = this.ckjar
							}
						} catch (e) {
							this.logErr(e)
						}
						// this.ckjar.setCookieSync(response.headers['set-cookie'].map(Cookie.parse).toString())
					})
					.then(
						(response) => {
							const {
								statusCode: status,
								statusCode,
								headers,
								rawBody
							} = response
							const body = iconv.decode(rawBody, this.encoding)
							callback(
								null,
								{ status, statusCode, headers, rawBody, body },
								body
							)
						},
						(err) => {
							const { message: error, response: response } = err
							callback(
								error,
								response,
								response && iconv.decode(response.rawBody, this.encoding)
							)
						}
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
		delete request?.headers?.['Content-Length']
		delete request?.headers?.['content-length']
		switch (this.platform()) {
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
					(error) => callback((error && error.error) || 'UndefinedError')
				)
				break
			case 'Node.js':
				let iconv = require('iconv-lite')
				this.initGotEnv(request)
				const { url, ..._request } = request
				this.got[method](url, _request).then(
					(response) => {
						const { statusCode: status, statusCode, headers, rawBody } = response
						const body = iconv.decode(rawBody, this.encoding)
						callback(
							null,
							{ status, statusCode, headers, rawBody, body },
							body
						)
					},
					(err) => {
						const { message: error, response: response } = err
						callback(
							error,
							response,
							response && iconv.decode(response.rawBody, this.encoding)
						)
					}
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
					switch (this.platform()) {
						case 'Surge':
						case 'Stash':
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
						case 'Node.js':
							return undefined
					}
				default:
					return undefined
			}
		}
		if (!this.isMute) {
			switch (this.platform()) {
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
				case 'Node.js':
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
		switch (this.platform()) {
			case 'Surge':
			case 'Loon':
			case 'Stash':
			case 'Shadowrocket':
			case 'Quantumult X':
			default:
				this.log('', `❗️ ${this.name}, 错误!`, error)
				break
			case 'Node.js':
				this.log('', `❗️${this.name}, 错误!`, error.stack)
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
		switch (this.platform()) {
			case 'Surge':
			case 'Loon':
			case 'Stash':
			case 'Shadowrocket':
			case 'Quantumult X':
			default:
				$done(val)
				break
			case 'Node.js':
				process.exit(1)
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


const $ = new _ENV_ENV_mjs__WEBPACK_IMPORTED_MODULE_0__["default"](" iRingo: Set Environment Variables");

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
/*!***********************************!*\
  !*** ./src/Siri.response.beta.js ***!
  \***********************************/
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













const $ = new _ENV_ENV_mjs__WEBPACK_IMPORTED_MODULE_0__["default"](" iRingo: 🔍 Siri v3.0.3(1) response.beta");
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
	const { Settings, Caches, Configs } = (0,_function_setENV_mjs__WEBPACK_IMPORTED_MODULE_2__["default"])("iRingo", "Siri", DataBase);
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
					// 主机判断
					switch (HOST) {
						case "api.smoot.apple.com":
						case "api.smoot.apple.cn":
							// 路径判断
							switch (PATH) {
								case "bag": // 配置
									body.enabled = true;
									body.feedback_enabled = true;
									//body.search_url = body?.search_url || "https:\/\/api-glb-apne1c.smoot.apple.com\/search";
									//body.feedback_url = body?.feedback_url || "https:\/\/fbs.smoot.apple.com\/fb";
									if (body?.enabled_domains) {
										body.enabled_domains = [...new Set([...body?.enabled_domains ?? [], ...Settings.Domains])];
										$.log(`🎉 ${$.name}, 领域列表`, `enabled_domains: ${JSON.stringify(body.enabled_domains)}`, "");
									}
									if (body?.scene_aware_lookup_enabled_domains) {
										body.scene_aware_lookup_enabled_domains = [...new Set([...body?.scene_aware_lookup_enabled_domains ?? [], ...Settings.Domains])];
										$.log(`🎉 ${$.name}, 领域列表`, `scene_aware_lookup_enabled_domains: ${JSON.stringify(body.scene_aware_lookup_enabled_domains)}`, "");
									}
									body.min_query_len = 3;
									let Overrides = body?.overrides;
									if (Overrides) {
										Settings.Functions.forEach(app => {
											let APP = Overrides?.[`${app}`];
											if (APP) {
												APP.enabled = true;
												APP.feedback_enabled = true;
												//APP.min_query_len = 2;
												//APP.search_render_timeout = 200;
												//APP.first_use_description = "";
												//APP.first_use_learn_more = "";
											} else APP = { enabled: true, feedback_enabled: true };
										});
										let FlightUtilities = Overrides?.flightutilities;
										if (FlightUtilities) {
											//FlightUtilities.fallback_flight_url = "https:\/\/api-glb-aps1b.smoot.apple.com\/flight";
											//FlightUtilities.flight_url = "https:\/\/api-glb-apse1c.smoot.apple.com\/flight";
										};
										let Lookup = Overrides?.lookup;
										if (Lookup) {
											Lookup.min_query_len = 2;
										};
										let Mail = Overrides?.mail;
										let Messages = Overrides?.messages;
										let News = Overrides?.news;
										let Safari = Overrides?.safari;
										if (Safari) {
											Safari.experiments_custom_feedback_enabled = true;
										};
										let Spotlight = Overrides?.spotlight;
										if (Spotlight) {
											Spotlight.use_twolayer_ranking = true;
											Spotlight.experiments_custom_feedback_enabled = true;
											Spotlight.min_query_len = 2;
											Spotlight.collect_scores = true;
											Spotlight.collect_anonymous_metadata = true;
										};
										let VisualIntelligence = Overrides?.visualintelligence;
										if (VisualIntelligence) {
											VisualIntelligence.enabled_domains = [...new Set([...VisualIntelligence.enabled_domains ?? [], ...Configs.VisualIntelligence.enabled_domains])];
											VisualIntelligence.supported_domains = [...new Set([...VisualIntelligence.supported_domains ?? [], ...Configs.VisualIntelligence.supported_domains])];
										};
									};
									// Safari Smart History
									body.safari_smart_history_enabled = (Settings.Safari_Smart_History) ? true : false;
									body.smart_history_feature_feedback_enabled = (Settings.Safari_Smart_History) ? true : false;
									/*
									if (body?.mescal_enabled) {
										body.mescal_enabled = true;
										body.mescal_version = 200;
										body.mescal_cert_url = "https://init.itunes.apple.com/WebObjects/MZInit.woa/wa/signSapSetupCert";
										body.mescal_setup_url = "https://play.itunes.apple.com/WebObjects/MZPlay.woa/wa/signSapSetup";
									}
									let smart_search_v2 = body?.smart_search_v2_parameters;
									if (smart_search_v2) {
										smart_search_v2.smart_history_score_v2_enabled = true;
										smart_search_v2.smart_history_score_v2_enable_count = true;
									};
									body.session_experiment_metadata_enabled = true;
									//body.sample_features = true;
									//body.use_ledbelly = true;
									*/
									break;
							};
							break;
						case "fbs.smoot.apple.com":
							break;
						case "cdn.smoot.apple.com":
							break;
						default: // 其他主机
							// 路径判断
							switch (PATH) {
								case "warm":
								case "render":
								case "flight": // 航班
									break;
								case "search": // 搜索
									break;
								case "card": // 卡片
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

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2lyaS5yZXNwb25zZS5iZXRhLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFlO0FBQ2Y7QUFDQSxpQkFBaUIsS0FBSztBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQixVQUFVO0FBQy9COztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGNBQWMsS0FBSztBQUNuQixHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLEtBQUs7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsZUFBZSwrQkFBK0I7QUFDOUM7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0EsS0FBSztBQUNMLElBQUk7QUFDSjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxRUFBcUU7QUFDckU7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0I7QUFDcEIsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGtDQUFrQztBQUNsQztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQSxTQUFTLDhDQUE4QztBQUN2RDtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047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LG9NQUFvTTtBQUNwTjtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0EsRUFBRTs7QUFFRiIsInNvdXJjZXMiOlsid2VicGFjazovL2lyaW5nby8uL3NyYy9FTlYvRU5WLm1qcyIsIndlYnBhY2s6Ly9pcmluZ28vLi9zcmMvVVJJL1VSSS5tanMiLCJ3ZWJwYWNrOi8vaXJpbmdvLy4vc3JjL2Z1bmN0aW9uL3NldEVOVi5tanMiLCJ3ZWJwYWNrOi8vaXJpbmdvL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2lyaW5nby93ZWJwYWNrL3J1bnRpbWUvY3JlYXRlIGZha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9pcmluZ28vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2lyaW5nby93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2lyaW5nby93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2lyaW5nby8uL3NyYy9TaXJpLnJlc3BvbnNlLmJldGEuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgY2xhc3MgRU5WIHtcblx0Y29uc3RydWN0b3IobmFtZSwgb3B0cykge1xuXHRcdHRoaXMubmFtZSA9IGAke25hbWV9LCBFTlYgdjEuMC4wYFxuXHRcdHRoaXMuaHR0cCA9IG5ldyBIdHRwKHRoaXMpXG5cdFx0dGhpcy5kYXRhID0gbnVsbFxuXHRcdHRoaXMuZGF0YUZpbGUgPSAnYm94LmRhdCdcblx0XHR0aGlzLmxvZ3MgPSBbXVxuXHRcdHRoaXMuaXNNdXRlID0gZmFsc2Vcblx0XHR0aGlzLmlzTmVlZFJld3JpdGUgPSBmYWxzZVxuXHRcdHRoaXMubG9nU2VwYXJhdG9yID0gJ1xcbidcblx0XHR0aGlzLmVuY29kaW5nID0gJ3V0Zi04J1xuXHRcdHRoaXMuc3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcblx0XHRPYmplY3QuYXNzaWduKHRoaXMsIG9wdHMpXG5cdFx0dGhpcy5sb2coJycsIGDwn4+BICR7dGhpcy5uYW1lfSwg5byA5aeLIWApXG5cdH1cblxuXHRwbGF0Zm9ybSgpIHtcblx0XHRpZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiAkZW52aXJvbm1lbnQgJiYgJGVudmlyb25tZW50WydzdXJnZS12ZXJzaW9uJ10pXG5cdFx0XHRyZXR1cm4gJ1N1cmdlJ1xuXHRcdGlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mICRlbnZpcm9ubWVudCAmJiAkZW52aXJvbm1lbnRbJ3N0YXNoLXZlcnNpb24nXSlcblx0XHRcdHJldHVybiAnU3Rhc2gnXG5cdFx0aWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgbW9kdWxlICYmICEhbW9kdWxlLmV4cG9ydHMpIHJldHVybiAnTm9kZS5qcydcblx0XHRpZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiAkdGFzaykgcmV0dXJuICdRdWFudHVtdWx0IFgnXG5cdFx0aWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgJGxvb24pIHJldHVybiAnTG9vbidcblx0XHRpZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiAkcm9ja2V0KSByZXR1cm4gJ1NoYWRvd3JvY2tldCdcblx0fVxuXG5cdGlzTm9kZSgpIHtcblx0XHRyZXR1cm4gJ05vZGUuanMnID09PSB0aGlzLnBsYXRmb3JtKClcblx0fVxuXG5cdGlzUXVhblgoKSB7XG5cdFx0cmV0dXJuICdRdWFudHVtdWx0IFgnID09PSB0aGlzLnBsYXRmb3JtKClcblx0fVxuXG5cdGlzU3VyZ2UoKSB7XG5cdFx0cmV0dXJuICdTdXJnZScgPT09IHRoaXMucGxhdGZvcm0oKVxuXHR9XG5cblx0aXNMb29uKCkge1xuXHRcdHJldHVybiAnTG9vbicgPT09IHRoaXMucGxhdGZvcm0oKVxuXHR9XG5cblx0aXNTaGFkb3dyb2NrZXQoKSB7XG5cdFx0cmV0dXJuICdTaGFkb3dyb2NrZXQnID09PSB0aGlzLnBsYXRmb3JtKClcblx0fVxuXG5cdGlzU3Rhc2goKSB7XG5cdFx0cmV0dXJuICdTdGFzaCcgPT09IHRoaXMucGxhdGZvcm0oKVxuXHR9XG5cblx0dG9PYmooc3RyLCBkZWZhdWx0VmFsdWUgPSBudWxsKSB7XG5cdFx0dHJ5IHtcblx0XHRcdHJldHVybiBKU09OLnBhcnNlKHN0cilcblx0XHR9IGNhdGNoIHtcblx0XHRcdHJldHVybiBkZWZhdWx0VmFsdWVcblx0XHR9XG5cdH1cblxuXHR0b1N0cihvYmosIGRlZmF1bHRWYWx1ZSA9IG51bGwpIHtcblx0XHR0cnkge1xuXHRcdFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KG9iailcblx0XHR9IGNhdGNoIHtcblx0XHRcdHJldHVybiBkZWZhdWx0VmFsdWVcblx0XHR9XG5cdH1cblxuXHRnZXRqc29uKGtleSwgZGVmYXVsdFZhbHVlKSB7XG5cdFx0bGV0IGpzb24gPSBkZWZhdWx0VmFsdWVcblx0XHRjb25zdCB2YWwgPSB0aGlzLmdldGRhdGEoa2V5KVxuXHRcdGlmICh2YWwpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGpzb24gPSBKU09OLnBhcnNlKHRoaXMuZ2V0ZGF0YShrZXkpKVxuXHRcdFx0fSBjYXRjaCB7IH1cblx0XHR9XG5cdFx0cmV0dXJuIGpzb25cblx0fVxuXG5cdHNldGpzb24odmFsLCBrZXkpIHtcblx0XHR0cnkge1xuXHRcdFx0cmV0dXJuIHRoaXMuc2V0ZGF0YShKU09OLnN0cmluZ2lmeSh2YWwpLCBrZXkpXG5cdFx0fSBjYXRjaCB7XG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHR9XG5cdH1cblxuXHRnZXRTY3JpcHQodXJsKSB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG5cdFx0XHR0aGlzLmdldCh7IHVybCB9LCAoZXJyb3IsIHJlc3BvbnNlLCBib2R5KSA9PiByZXNvbHZlKGJvZHkpKVxuXHRcdH0pXG5cdH1cblxuXHRydW5TY3JpcHQoc2NyaXB0LCBydW5PcHRzKSB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG5cdFx0XHRsZXQgaHR0cGFwaSA9IHRoaXMuZ2V0ZGF0YSgnQGNoYXZ5X2JveGpzX3VzZXJDZmdzLmh0dHBhcGknKVxuXHRcdFx0aHR0cGFwaSA9IGh0dHBhcGkgPyBodHRwYXBpLnJlcGxhY2UoL1xcbi9nLCAnJykudHJpbSgpIDogaHR0cGFwaVxuXHRcdFx0bGV0IGh0dHBhcGlfdGltZW91dCA9IHRoaXMuZ2V0ZGF0YShcblx0XHRcdFx0J0BjaGF2eV9ib3hqc191c2VyQ2Zncy5odHRwYXBpX3RpbWVvdXQnXG5cdFx0XHQpXG5cdFx0XHRodHRwYXBpX3RpbWVvdXQgPSBodHRwYXBpX3RpbWVvdXQgPyBodHRwYXBpX3RpbWVvdXQgKiAxIDogMjBcblx0XHRcdGh0dHBhcGlfdGltZW91dCA9XG5cdFx0XHRcdHJ1bk9wdHMgJiYgcnVuT3B0cy50aW1lb3V0ID8gcnVuT3B0cy50aW1lb3V0IDogaHR0cGFwaV90aW1lb3V0XG5cdFx0XHRjb25zdCBba2V5LCBhZGRyXSA9IGh0dHBhcGkuc3BsaXQoJ0AnKVxuXHRcdFx0Y29uc3Qgb3B0cyA9IHtcblx0XHRcdFx0dXJsOiBgaHR0cDovLyR7YWRkcn0vdjEvc2NyaXB0aW5nL2V2YWx1YXRlYCxcblx0XHRcdFx0Ym9keToge1xuXHRcdFx0XHRcdHNjcmlwdF90ZXh0OiBzY3JpcHQsXG5cdFx0XHRcdFx0bW9ja190eXBlOiAnY3JvbicsXG5cdFx0XHRcdFx0dGltZW91dDogaHR0cGFwaV90aW1lb3V0XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGhlYWRlcnM6IHsgJ1gtS2V5Jzoga2V5LCAnQWNjZXB0JzogJyovKicgfSxcblx0XHRcdFx0dGltZW91dDogaHR0cGFwaV90aW1lb3V0XG5cdFx0XHR9XG5cdFx0XHR0aGlzLnBvc3Qob3B0cywgKGVycm9yLCByZXNwb25zZSwgYm9keSkgPT4gcmVzb2x2ZShib2R5KSlcblx0XHR9KS5jYXRjaCgoZSkgPT4gdGhpcy5sb2dFcnIoZSkpXG5cdH1cblxuXHRsb2FkZGF0YSgpIHtcblx0XHRpZiAodGhpcy5pc05vZGUoKSkge1xuXHRcdFx0dGhpcy5mcyA9IHRoaXMuZnMgPyB0aGlzLmZzIDogcmVxdWlyZSgnZnMnKVxuXHRcdFx0dGhpcy5wYXRoID0gdGhpcy5wYXRoID8gdGhpcy5wYXRoIDogcmVxdWlyZSgncGF0aCcpXG5cdFx0XHRjb25zdCBjdXJEaXJEYXRhRmlsZVBhdGggPSB0aGlzLnBhdGgucmVzb2x2ZSh0aGlzLmRhdGFGaWxlKVxuXHRcdFx0Y29uc3Qgcm9vdERpckRhdGFGaWxlUGF0aCA9IHRoaXMucGF0aC5yZXNvbHZlKFxuXHRcdFx0XHRwcm9jZXNzLmN3ZCgpLFxuXHRcdFx0XHR0aGlzLmRhdGFGaWxlXG5cdFx0XHQpXG5cdFx0XHRjb25zdCBpc0N1ckRpckRhdGFGaWxlID0gdGhpcy5mcy5leGlzdHNTeW5jKGN1ckRpckRhdGFGaWxlUGF0aClcblx0XHRcdGNvbnN0IGlzUm9vdERpckRhdGFGaWxlID1cblx0XHRcdFx0IWlzQ3VyRGlyRGF0YUZpbGUgJiYgdGhpcy5mcy5leGlzdHNTeW5jKHJvb3REaXJEYXRhRmlsZVBhdGgpXG5cdFx0XHRpZiAoaXNDdXJEaXJEYXRhRmlsZSB8fCBpc1Jvb3REaXJEYXRhRmlsZSkge1xuXHRcdFx0XHRjb25zdCBkYXRQYXRoID0gaXNDdXJEaXJEYXRhRmlsZVxuXHRcdFx0XHRcdD8gY3VyRGlyRGF0YUZpbGVQYXRoXG5cdFx0XHRcdFx0OiByb290RGlyRGF0YUZpbGVQYXRoXG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0cmV0dXJuIEpTT04ucGFyc2UodGhpcy5mcy5yZWFkRmlsZVN5bmMoZGF0UGF0aCkpXG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRyZXR1cm4ge31cblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHJldHVybiB7fVxuXHRcdH0gZWxzZSByZXR1cm4ge31cblx0fVxuXG5cdHdyaXRlZGF0YSgpIHtcblx0XHRpZiAodGhpcy5pc05vZGUoKSkge1xuXHRcdFx0dGhpcy5mcyA9IHRoaXMuZnMgPyB0aGlzLmZzIDogcmVxdWlyZSgnZnMnKVxuXHRcdFx0dGhpcy5wYXRoID0gdGhpcy5wYXRoID8gdGhpcy5wYXRoIDogcmVxdWlyZSgncGF0aCcpXG5cdFx0XHRjb25zdCBjdXJEaXJEYXRhRmlsZVBhdGggPSB0aGlzLnBhdGgucmVzb2x2ZSh0aGlzLmRhdGFGaWxlKVxuXHRcdFx0Y29uc3Qgcm9vdERpckRhdGFGaWxlUGF0aCA9IHRoaXMucGF0aC5yZXNvbHZlKFxuXHRcdFx0XHRwcm9jZXNzLmN3ZCgpLFxuXHRcdFx0XHR0aGlzLmRhdGFGaWxlXG5cdFx0XHQpXG5cdFx0XHRjb25zdCBpc0N1ckRpckRhdGFGaWxlID0gdGhpcy5mcy5leGlzdHNTeW5jKGN1ckRpckRhdGFGaWxlUGF0aClcblx0XHRcdGNvbnN0IGlzUm9vdERpckRhdGFGaWxlID1cblx0XHRcdFx0IWlzQ3VyRGlyRGF0YUZpbGUgJiYgdGhpcy5mcy5leGlzdHNTeW5jKHJvb3REaXJEYXRhRmlsZVBhdGgpXG5cdFx0XHRjb25zdCBqc29uZGF0YSA9IEpTT04uc3RyaW5naWZ5KHRoaXMuZGF0YSlcblx0XHRcdGlmIChpc0N1ckRpckRhdGFGaWxlKSB7XG5cdFx0XHRcdHRoaXMuZnMud3JpdGVGaWxlU3luYyhjdXJEaXJEYXRhRmlsZVBhdGgsIGpzb25kYXRhKVxuXHRcdFx0fSBlbHNlIGlmIChpc1Jvb3REaXJEYXRhRmlsZSkge1xuXHRcdFx0XHR0aGlzLmZzLndyaXRlRmlsZVN5bmMocm9vdERpckRhdGFGaWxlUGF0aCwganNvbmRhdGEpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLmZzLndyaXRlRmlsZVN5bmMoY3VyRGlyRGF0YUZpbGVQYXRoLCBqc29uZGF0YSlcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRsb2Rhc2hfZ2V0KHNvdXJjZSwgcGF0aCwgZGVmYXVsdFZhbHVlID0gdW5kZWZpbmVkKSB7XG5cdFx0Y29uc3QgcGF0aHMgPSBwYXRoLnJlcGxhY2UoL1xcWyhcXGQrKVxcXS9nLCAnLiQxJykuc3BsaXQoJy4nKVxuXHRcdGxldCByZXN1bHQgPSBzb3VyY2Vcblx0XHRmb3IgKGNvbnN0IHAgb2YgcGF0aHMpIHtcblx0XHRcdHJlc3VsdCA9IE9iamVjdChyZXN1bHQpW3BdXG5cdFx0XHRpZiAocmVzdWx0ID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0cmV0dXJuIGRlZmF1bHRWYWx1ZVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0XG5cdH1cblxuXHRsb2Rhc2hfc2V0KG9iaiwgcGF0aCwgdmFsdWUpIHtcblx0XHRpZiAoT2JqZWN0KG9iaikgIT09IG9iaikgcmV0dXJuIG9ialxuXHRcdGlmICghQXJyYXkuaXNBcnJheShwYXRoKSkgcGF0aCA9IHBhdGgudG9TdHJpbmcoKS5tYXRjaCgvW14uW1xcXV0rL2cpIHx8IFtdXG5cdFx0cGF0aFxuXHRcdFx0LnNsaWNlKDAsIC0xKVxuXHRcdFx0LnJlZHVjZShcblx0XHRcdFx0KGEsIGMsIGkpID0+XG5cdFx0XHRcdFx0T2JqZWN0KGFbY10pID09PSBhW2NdXG5cdFx0XHRcdFx0XHQ/IGFbY11cblx0XHRcdFx0XHRcdDogKGFbY10gPSBNYXRoLmFicyhwYXRoW2kgKyAxXSkgPj4gMCA9PT0gK3BhdGhbaSArIDFdID8gW10gOiB7fSksXG5cdFx0XHRcdG9ialxuXHRcdFx0KVtwYXRoW3BhdGgubGVuZ3RoIC0gMV1dID0gdmFsdWVcblx0XHRyZXR1cm4gb2JqXG5cdH1cblxuXHRnZXRkYXRhKGtleSkge1xuXHRcdGxldCB2YWwgPSB0aGlzLmdldHZhbChrZXkpXG5cdFx0Ly8g5aaC5p6c5LulIEBcblx0XHRpZiAoL15ALy50ZXN0KGtleSkpIHtcblx0XHRcdGNvbnN0IFssIG9iamtleSwgcGF0aHNdID0gL15AKC4qPylcXC4oLio/KSQvLmV4ZWMoa2V5KVxuXHRcdFx0Y29uc3Qgb2JqdmFsID0gb2Jqa2V5ID8gdGhpcy5nZXR2YWwob2Jqa2V5KSA6ICcnXG5cdFx0XHRpZiAob2JqdmFsKSB7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0Y29uc3Qgb2JqZWR2YWwgPSBKU09OLnBhcnNlKG9ianZhbClcblx0XHRcdFx0XHR2YWwgPSBvYmplZHZhbCA/IHRoaXMubG9kYXNoX2dldChvYmplZHZhbCwgcGF0aHMsICcnKSA6IHZhbFxuXHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0dmFsID0gJydcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdmFsXG5cdH1cblxuXHRzZXRkYXRhKHZhbCwga2V5KSB7XG5cdFx0bGV0IGlzc3VjID0gZmFsc2Vcblx0XHRpZiAoL15ALy50ZXN0KGtleSkpIHtcblx0XHRcdGNvbnN0IFssIG9iamtleSwgcGF0aHNdID0gL15AKC4qPylcXC4oLio/KSQvLmV4ZWMoa2V5KVxuXHRcdFx0Y29uc3Qgb2JqZGF0ID0gdGhpcy5nZXR2YWwob2Jqa2V5KVxuXHRcdFx0Y29uc3Qgb2JqdmFsID0gb2Jqa2V5XG5cdFx0XHRcdD8gb2JqZGF0ID09PSAnbnVsbCdcblx0XHRcdFx0XHQ/IG51bGxcblx0XHRcdFx0XHQ6IG9iamRhdCB8fCAne30nXG5cdFx0XHRcdDogJ3t9J1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Y29uc3Qgb2JqZWR2YWwgPSBKU09OLnBhcnNlKG9ianZhbClcblx0XHRcdFx0dGhpcy5sb2Rhc2hfc2V0KG9iamVkdmFsLCBwYXRocywgdmFsKVxuXHRcdFx0XHRpc3N1YyA9IHRoaXMuc2V0dmFsKEpTT04uc3RyaW5naWZ5KG9iamVkdmFsKSwgb2Jqa2V5KVxuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRjb25zdCBvYmplZHZhbCA9IHt9XG5cdFx0XHRcdHRoaXMubG9kYXNoX3NldChvYmplZHZhbCwgcGF0aHMsIHZhbClcblx0XHRcdFx0aXNzdWMgPSB0aGlzLnNldHZhbChKU09OLnN0cmluZ2lmeShvYmplZHZhbCksIG9iamtleSlcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aXNzdWMgPSB0aGlzLnNldHZhbCh2YWwsIGtleSlcblx0XHR9XG5cdFx0cmV0dXJuIGlzc3VjXG5cdH1cblxuXHRnZXR2YWwoa2V5KSB7XG5cdFx0c3dpdGNoICh0aGlzLnBsYXRmb3JtKCkpIHtcblx0XHRcdGNhc2UgJ1N1cmdlJzpcblx0XHRcdGNhc2UgJ0xvb24nOlxuXHRcdFx0Y2FzZSAnU3Rhc2gnOlxuXHRcdFx0Y2FzZSAnU2hhZG93cm9ja2V0Jzpcblx0XHRcdFx0cmV0dXJuICRwZXJzaXN0ZW50U3RvcmUucmVhZChrZXkpXG5cdFx0XHRjYXNlICdRdWFudHVtdWx0IFgnOlxuXHRcdFx0XHRyZXR1cm4gJHByZWZzLnZhbHVlRm9yS2V5KGtleSlcblx0XHRcdGNhc2UgJ05vZGUuanMnOlxuXHRcdFx0XHR0aGlzLmRhdGEgPSB0aGlzLmxvYWRkYXRhKClcblx0XHRcdFx0cmV0dXJuIHRoaXMuZGF0YVtrZXldXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gKHRoaXMuZGF0YSAmJiB0aGlzLmRhdGFba2V5XSkgfHwgbnVsbFxuXHRcdH1cblx0fVxuXG5cdHNldHZhbCh2YWwsIGtleSkge1xuXHRcdHN3aXRjaCAodGhpcy5wbGF0Zm9ybSgpKSB7XG5cdFx0XHRjYXNlICdTdXJnZSc6XG5cdFx0XHRjYXNlICdMb29uJzpcblx0XHRcdGNhc2UgJ1N0YXNoJzpcblx0XHRcdGNhc2UgJ1NoYWRvd3JvY2tldCc6XG5cdFx0XHRcdHJldHVybiAkcGVyc2lzdGVudFN0b3JlLndyaXRlKHZhbCwga2V5KVxuXHRcdFx0Y2FzZSAnUXVhbnR1bXVsdCBYJzpcblx0XHRcdFx0cmV0dXJuICRwcmVmcy5zZXRWYWx1ZUZvcktleSh2YWwsIGtleSlcblx0XHRcdGNhc2UgJ05vZGUuanMnOlxuXHRcdFx0XHR0aGlzLmRhdGEgPSB0aGlzLmxvYWRkYXRhKClcblx0XHRcdFx0dGhpcy5kYXRhW2tleV0gPSB2YWxcblx0XHRcdFx0dGhpcy53cml0ZWRhdGEoKVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuICh0aGlzLmRhdGEgJiYgdGhpcy5kYXRhW2tleV0pIHx8IG51bGxcblx0XHR9XG5cdH1cblxuXHRpbml0R290RW52KG9wdHMpIHtcblx0XHR0aGlzLmdvdCA9IHRoaXMuZ290ID8gdGhpcy5nb3QgOiByZXF1aXJlKCdnb3QnKVxuXHRcdHRoaXMuY2t0b3VnaCA9IHRoaXMuY2t0b3VnaCA/IHRoaXMuY2t0b3VnaCA6IHJlcXVpcmUoJ3RvdWdoLWNvb2tpZScpXG5cdFx0dGhpcy5ja2phciA9IHRoaXMuY2tqYXIgPyB0aGlzLmNramFyIDogbmV3IHRoaXMuY2t0b3VnaC5Db29raWVKYXIoKVxuXHRcdGlmIChvcHRzKSB7XG5cdFx0XHRvcHRzLmhlYWRlcnMgPSBvcHRzLmhlYWRlcnMgPyBvcHRzLmhlYWRlcnMgOiB7fVxuXHRcdFx0aWYgKHVuZGVmaW5lZCA9PT0gb3B0cy5oZWFkZXJzLkNvb2tpZSAmJiB1bmRlZmluZWQgPT09IG9wdHMuY29va2llSmFyKSB7XG5cdFx0XHRcdG9wdHMuY29va2llSmFyID0gdGhpcy5ja2phclxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGdldChyZXF1ZXN0LCBjYWxsYmFjayA9ICgpID0+IHsgfSkge1xuXHRcdGRlbGV0ZSByZXF1ZXN0Py5oZWFkZXJzPy5bJ0NvbnRlbnQtTGVuZ3RoJ11cblx0XHRkZWxldGUgcmVxdWVzdD8uaGVhZGVycz8uWydjb250ZW50LWxlbmd0aCddXG5cblx0XHRzd2l0Y2ggKHRoaXMucGxhdGZvcm0oKSkge1xuXHRcdFx0Y2FzZSAnU3VyZ2UnOlxuXHRcdFx0Y2FzZSAnTG9vbic6XG5cdFx0XHRjYXNlICdTdGFzaCc6XG5cdFx0XHRjYXNlICdTaGFkb3dyb2NrZXQnOlxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0aWYgKHRoaXMuaXNTdXJnZSgpICYmIHRoaXMuaXNOZWVkUmV3cml0ZSkge1xuXHRcdFx0XHRcdHRoaXMubG9kYXNoX3NldChyZXF1ZXN0LCAnaGVhZGVycy5YLVN1cmdlLVNraXAtU2NyaXB0aW5nJywgZmFsc2UpXG5cdFx0XHRcdH1cblx0XHRcdFx0JGh0dHBDbGllbnQuZ2V0KHJlcXVlc3QsIChlcnJvciwgcmVzcG9uc2UsIGJvZHkpID0+IHtcblx0XHRcdFx0XHRpZiAoIWVycm9yICYmIHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0XHRyZXNwb25zZS5ib2R5ID0gYm9keVxuXHRcdFx0XHRcdFx0cmVzcG9uc2Uuc3RhdHVzQ29kZSA9IHJlc3BvbnNlLnN0YXR1cyA/IHJlc3BvbnNlLnN0YXR1cyA6IHJlc3BvbnNlLnN0YXR1c0NvZGVcblx0XHRcdFx0XHRcdHJlc3BvbnNlLnN0YXR1cyA9IHJlc3BvbnNlLnN0YXR1c0NvZGVcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2FsbGJhY2soZXJyb3IsIHJlc3BvbnNlLCBib2R5KVxuXHRcdFx0XHR9KVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnUXVhbnR1bXVsdCBYJzpcblx0XHRcdFx0aWYgKHRoaXMuaXNOZWVkUmV3cml0ZSkge1xuXHRcdFx0XHRcdHRoaXMubG9kYXNoX3NldChyZXF1ZXN0LCAnb3B0cy5oaW50cycsIGZhbHNlKVxuXHRcdFx0XHR9XG5cdFx0XHRcdCR0YXNrLmZldGNoKHJlcXVlc3QpLnRoZW4oXG5cdFx0XHRcdFx0KHJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdFx0XHRjb25zdCB7XG5cdFx0XHRcdFx0XHRcdHN0YXR1c0NvZGU6IHN0YXR1cyxcblx0XHRcdFx0XHRcdFx0c3RhdHVzQ29kZSxcblx0XHRcdFx0XHRcdFx0aGVhZGVycyxcblx0XHRcdFx0XHRcdFx0Ym9keSxcblx0XHRcdFx0XHRcdFx0Ym9keUJ5dGVzXG5cdFx0XHRcdFx0XHR9ID0gcmVzcG9uc2Vcblx0XHRcdFx0XHRcdGNhbGxiYWNrKFxuXHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHR7IHN0YXR1cywgc3RhdHVzQ29kZSwgaGVhZGVycywgYm9keSwgYm9keUJ5dGVzIH0sXG5cdFx0XHRcdFx0XHRcdGJvZHksXG5cdFx0XHRcdFx0XHRcdGJvZHlCeXRlc1xuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0KGVycm9yKSA9PiBjYWxsYmFjaygoZXJyb3IgJiYgZXJyb3IuZXJyb3IpIHx8ICdVbmRlZmluZWRFcnJvcicpXG5cdFx0XHRcdClcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgJ05vZGUuanMnOlxuXHRcdFx0XHRsZXQgaWNvbnYgPSByZXF1aXJlKCdpY29udi1saXRlJylcblx0XHRcdFx0dGhpcy5pbml0R290RW52KHJlcXVlc3QpXG5cdFx0XHRcdHRoaXMuZ290KHJlcXVlc3QpXG5cdFx0XHRcdFx0Lm9uKCdyZWRpcmVjdCcsIChyZXNwb25zZSwgbmV4dE9wdHMpID0+IHtcblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdGlmIChyZXNwb25zZS5oZWFkZXJzWydzZXQtY29va2llJ10pIHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBjayA9IHJlc3BvbnNlLmhlYWRlcnNbJ3NldC1jb29raWUnXVxuXHRcdFx0XHRcdFx0XHRcdFx0Lm1hcCh0aGlzLmNrdG91Z2guQ29va2llLnBhcnNlKVxuXHRcdFx0XHRcdFx0XHRcdFx0LnRvU3RyaW5nKClcblx0XHRcdFx0XHRcdFx0XHRpZiAoY2spIHtcblx0XHRcdFx0XHRcdFx0XHRcdHRoaXMuY2tqYXIuc2V0Q29va2llU3luYyhjaywgbnVsbClcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0bmV4dE9wdHMuY29va2llSmFyID0gdGhpcy5ja2phclxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMubG9nRXJyKGUpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQvLyB0aGlzLmNramFyLnNldENvb2tpZVN5bmMocmVzcG9uc2UuaGVhZGVyc1snc2V0LWNvb2tpZSddLm1hcChDb29raWUucGFyc2UpLnRvU3RyaW5nKCkpXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQudGhlbihcblx0XHRcdFx0XHRcdChyZXNwb25zZSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRjb25zdCB7XG5cdFx0XHRcdFx0XHRcdFx0c3RhdHVzQ29kZTogc3RhdHVzLFxuXHRcdFx0XHRcdFx0XHRcdHN0YXR1c0NvZGUsXG5cdFx0XHRcdFx0XHRcdFx0aGVhZGVycyxcblx0XHRcdFx0XHRcdFx0XHRyYXdCb2R5XG5cdFx0XHRcdFx0XHRcdH0gPSByZXNwb25zZVxuXHRcdFx0XHRcdFx0XHRjb25zdCBib2R5ID0gaWNvbnYuZGVjb2RlKHJhd0JvZHksIHRoaXMuZW5jb2RpbmcpXG5cdFx0XHRcdFx0XHRcdGNhbGxiYWNrKFxuXHRcdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdFx0eyBzdGF0dXMsIHN0YXR1c0NvZGUsIGhlYWRlcnMsIHJhd0JvZHksIGJvZHkgfSxcblx0XHRcdFx0XHRcdFx0XHRib2R5XG5cdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHQoZXJyKSA9PiB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHsgbWVzc2FnZTogZXJyb3IsIHJlc3BvbnNlOiByZXNwb25zZSB9ID0gZXJyXG5cdFx0XHRcdFx0XHRcdGNhbGxiYWNrKFxuXHRcdFx0XHRcdFx0XHRcdGVycm9yLFxuXHRcdFx0XHRcdFx0XHRcdHJlc3BvbnNlLFxuXHRcdFx0XHRcdFx0XHRcdHJlc3BvbnNlICYmIGljb252LmRlY29kZShyZXNwb25zZS5yYXdCb2R5LCB0aGlzLmVuY29kaW5nKVxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0KVxuXHRcdFx0XHRicmVha1xuXHRcdH1cblx0fVxuXG5cdHBvc3QocmVxdWVzdCwgY2FsbGJhY2sgPSAoKSA9PiB7IH0pIHtcblx0XHRjb25zdCBtZXRob2QgPSByZXF1ZXN0Lm1ldGhvZFxuXHRcdFx0PyByZXF1ZXN0Lm1ldGhvZC50b0xvY2FsZUxvd2VyQ2FzZSgpXG5cdFx0XHQ6ICdwb3N0J1xuXG5cdFx0Ly8g5aaC5p6c5oyH5a6a5LqG6K+35rGC5L2TLCDkvYbmsqHmjIflrpogYENvbnRlbnQtVHlwZWDjgIFgY29udGVudC10eXBlYCwg5YiZ6Ieq5Yqo55Sf5oiQ44CCXG5cdFx0aWYgKFxuXHRcdFx0cmVxdWVzdC5ib2R5ICYmXG5cdFx0XHRyZXF1ZXN0LmhlYWRlcnMgJiZcblx0XHRcdCFyZXF1ZXN0LmhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddICYmXG5cdFx0XHQhcmVxdWVzdC5oZWFkZXJzWydjb250ZW50LXR5cGUnXVxuXHRcdCkge1xuXHRcdFx0Ly8gSFRUUC8x44CBSFRUUC8yIOmDveaUr+aMgeWwj+WGmSBoZWFkZXJzXG5cdFx0XHRyZXF1ZXN0LmhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddID0gJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcblx0XHR9XG5cdFx0Ly8g5Li66YG/5YWN5oyH5a6a6ZSZ6K+vIGBjb250ZW50LWxlbmd0aGAg6L+Z6YeM5Yig6Zmk6K+l5bGe5oCn77yM55Sx5bel5YW356uvIChIdHRwQ2xpZW50KSDotJ/otKPph43mlrDorqHnrpflubbotYvlgLxcblx0XHRkZWxldGUgcmVxdWVzdD8uaGVhZGVycz8uWydDb250ZW50LUxlbmd0aCddXG5cdFx0ZGVsZXRlIHJlcXVlc3Q/LmhlYWRlcnM/LlsnY29udGVudC1sZW5ndGgnXVxuXHRcdHN3aXRjaCAodGhpcy5wbGF0Zm9ybSgpKSB7XG5cdFx0XHRjYXNlICdTdXJnZSc6XG5cdFx0XHRjYXNlICdMb29uJzpcblx0XHRcdGNhc2UgJ1N0YXNoJzpcblx0XHRcdGNhc2UgJ1NoYWRvd3JvY2tldCc6XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRpZiAodGhpcy5pc1N1cmdlKCkgJiYgdGhpcy5pc05lZWRSZXdyaXRlKSB7XG5cdFx0XHRcdFx0dGhpcy5sb2Rhc2hfc2V0KHJlcXVlc3QsICdoZWFkZXJzLlgtU3VyZ2UtU2tpcC1TY3JpcHRpbmcnLCBmYWxzZSlcblx0XHRcdFx0fVxuXHRcdFx0XHQkaHR0cENsaWVudFttZXRob2RdKHJlcXVlc3QsIChlcnJvciwgcmVzcG9uc2UsIGJvZHkpID0+IHtcblx0XHRcdFx0XHRpZiAoIWVycm9yICYmIHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0XHRyZXNwb25zZS5ib2R5ID0gYm9keVxuXHRcdFx0XHRcdFx0cmVzcG9uc2Uuc3RhdHVzQ29kZSA9IHJlc3BvbnNlLnN0YXR1cyA/IHJlc3BvbnNlLnN0YXR1cyA6IHJlc3BvbnNlLnN0YXR1c0NvZGVcblx0XHRcdFx0XHRcdHJlc3BvbnNlLnN0YXR1cyA9IHJlc3BvbnNlLnN0YXR1c0NvZGVcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2FsbGJhY2soZXJyb3IsIHJlc3BvbnNlLCBib2R5KVxuXHRcdFx0XHR9KVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnUXVhbnR1bXVsdCBYJzpcblx0XHRcdFx0cmVxdWVzdC5tZXRob2QgPSBtZXRob2Rcblx0XHRcdFx0aWYgKHRoaXMuaXNOZWVkUmV3cml0ZSkge1xuXHRcdFx0XHRcdHRoaXMubG9kYXNoX3NldChyZXF1ZXN0LCAnb3B0cy5oaW50cycsIGZhbHNlKVxuXHRcdFx0XHR9XG5cdFx0XHRcdCR0YXNrLmZldGNoKHJlcXVlc3QpLnRoZW4oXG5cdFx0XHRcdFx0KHJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdFx0XHRjb25zdCB7XG5cdFx0XHRcdFx0XHRcdHN0YXR1c0NvZGU6IHN0YXR1cyxcblx0XHRcdFx0XHRcdFx0c3RhdHVzQ29kZSxcblx0XHRcdFx0XHRcdFx0aGVhZGVycyxcblx0XHRcdFx0XHRcdFx0Ym9keSxcblx0XHRcdFx0XHRcdFx0Ym9keUJ5dGVzXG5cdFx0XHRcdFx0XHR9ID0gcmVzcG9uc2Vcblx0XHRcdFx0XHRcdGNhbGxiYWNrKFxuXHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHR7IHN0YXR1cywgc3RhdHVzQ29kZSwgaGVhZGVycywgYm9keSwgYm9keUJ5dGVzIH0sXG5cdFx0XHRcdFx0XHRcdGJvZHksXG5cdFx0XHRcdFx0XHRcdGJvZHlCeXRlc1xuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0KGVycm9yKSA9PiBjYWxsYmFjaygoZXJyb3IgJiYgZXJyb3IuZXJyb3IpIHx8ICdVbmRlZmluZWRFcnJvcicpXG5cdFx0XHRcdClcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgJ05vZGUuanMnOlxuXHRcdFx0XHRsZXQgaWNvbnYgPSByZXF1aXJlKCdpY29udi1saXRlJylcblx0XHRcdFx0dGhpcy5pbml0R290RW52KHJlcXVlc3QpXG5cdFx0XHRcdGNvbnN0IHsgdXJsLCAuLi5fcmVxdWVzdCB9ID0gcmVxdWVzdFxuXHRcdFx0XHR0aGlzLmdvdFttZXRob2RdKHVybCwgX3JlcXVlc3QpLnRoZW4oXG5cdFx0XHRcdFx0KHJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdFx0XHRjb25zdCB7IHN0YXR1c0NvZGU6IHN0YXR1cywgc3RhdHVzQ29kZSwgaGVhZGVycywgcmF3Qm9keSB9ID0gcmVzcG9uc2Vcblx0XHRcdFx0XHRcdGNvbnN0IGJvZHkgPSBpY29udi5kZWNvZGUocmF3Qm9keSwgdGhpcy5lbmNvZGluZylcblx0XHRcdFx0XHRcdGNhbGxiYWNrKFxuXHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHR7IHN0YXR1cywgc3RhdHVzQ29kZSwgaGVhZGVycywgcmF3Qm9keSwgYm9keSB9LFxuXHRcdFx0XHRcdFx0XHRib2R5XG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQoZXJyKSA9PiB7XG5cdFx0XHRcdFx0XHRjb25zdCB7IG1lc3NhZ2U6IGVycm9yLCByZXNwb25zZTogcmVzcG9uc2UgfSA9IGVyclxuXHRcdFx0XHRcdFx0Y2FsbGJhY2soXG5cdFx0XHRcdFx0XHRcdGVycm9yLFxuXHRcdFx0XHRcdFx0XHRyZXNwb25zZSxcblx0XHRcdFx0XHRcdFx0cmVzcG9uc2UgJiYgaWNvbnYuZGVjb2RlKHJlc3BvbnNlLnJhd0JvZHksIHRoaXMuZW5jb2RpbmcpXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHQpXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXHR9XG5cdC8qKlxuXHQgKlxuXHQgKiDnpLrkvos6JC50aW1lKCd5eXl5LU1NLWRkIHFxIEhIOm1tOnNzLlMnKVxuXHQgKiAgICA6JC50aW1lKCd5eXl5TU1kZEhIbW1zc1MnKVxuXHQgKiAgICB5OuW5tCBNOuaciCBkOuaXpSBxOuWtoyBIOuaXtiBtOuWIhiBzOuenkiBTOuavq+enklxuXHQgKiAgICDlhbbkuK155Y+v6YCJMC005L2N5Y2g5L2N56ym44CBU+WPr+mAiTAtMeS9jeWNoOS9jeespu+8jOWFtuS9meWPr+mAiTAtMuS9jeWNoOS9jeesplxuXHQgKiBAcGFyYW0ge3N0cmluZ30gZm9ybWF0IOagvOW8j+WMluWPguaVsFxuXHQgKiBAcGFyYW0ge251bWJlcn0gdHMg5Y+v6YCJOiDmoLnmja7mjIflrprml7bpl7TmiLPov5Tlm57moLzlvI/ljJbml6XmnJ9cblx0ICpcblx0ICovXG5cdHRpbWUoZm9ybWF0LCB0cyA9IG51bGwpIHtcblx0XHRjb25zdCBkYXRlID0gdHMgPyBuZXcgRGF0ZSh0cykgOiBuZXcgRGF0ZSgpXG5cdFx0bGV0IG8gPSB7XG5cdFx0XHQnTSsnOiBkYXRlLmdldE1vbnRoKCkgKyAxLFxuXHRcdFx0J2QrJzogZGF0ZS5nZXREYXRlKCksXG5cdFx0XHQnSCsnOiBkYXRlLmdldEhvdXJzKCksXG5cdFx0XHQnbSsnOiBkYXRlLmdldE1pbnV0ZXMoKSxcblx0XHRcdCdzKyc6IGRhdGUuZ2V0U2Vjb25kcygpLFxuXHRcdFx0J3ErJzogTWF0aC5mbG9vcigoZGF0ZS5nZXRNb250aCgpICsgMykgLyAzKSxcblx0XHRcdCdTJzogZGF0ZS5nZXRNaWxsaXNlY29uZHMoKVxuXHRcdH1cblx0XHRpZiAoLyh5KykvLnRlc3QoZm9ybWF0KSlcblx0XHRcdGZvcm1hdCA9IGZvcm1hdC5yZXBsYWNlKFxuXHRcdFx0XHRSZWdFeHAuJDEsXG5cdFx0XHRcdChkYXRlLmdldEZ1bGxZZWFyKCkgKyAnJykuc3Vic3RyKDQgLSBSZWdFeHAuJDEubGVuZ3RoKVxuXHRcdFx0KVxuXHRcdGZvciAobGV0IGsgaW4gbylcblx0XHRcdGlmIChuZXcgUmVnRXhwKCcoJyArIGsgKyAnKScpLnRlc3QoZm9ybWF0KSlcblx0XHRcdFx0Zm9ybWF0ID0gZm9ybWF0LnJlcGxhY2UoXG5cdFx0XHRcdFx0UmVnRXhwLiQxLFxuXHRcdFx0XHRcdFJlZ0V4cC4kMS5sZW5ndGggPT0gMVxuXHRcdFx0XHRcdFx0PyBvW2tdXG5cdFx0XHRcdFx0XHQ6ICgnMDAnICsgb1trXSkuc3Vic3RyKCgnJyArIG9ba10pLmxlbmd0aClcblx0XHRcdFx0KVxuXHRcdHJldHVybiBmb3JtYXRcblx0fVxuXG5cdC8qKlxuXHQgKiDns7vnu5/pgJrnn6Vcblx0ICpcblx0ICogPiDpgJrnn6Xlj4LmlbA6IOWQjOaXtuaUr+aMgSBRdWFuWCDlkowgTG9vbiDkuKTnp43moLzlvI8sIEVudkpz5qC55o2u6L+Q6KGM546v5aKD6Ieq5Yqo6L2s5o2iLCBTdXJnZSDnjq/looPkuI3mlK/mjIHlpJrlqpLkvZPpgJrnn6Vcblx0ICpcblx0ICog56S65L6LOlxuXHQgKiAkLm1zZyh0aXRsZSwgc3VidCwgZGVzYywgJ3R3aXR0ZXI6Ly8nKVxuXHQgKiAkLm1zZyh0aXRsZSwgc3VidCwgZGVzYywgeyAnb3Blbi11cmwnOiAndHdpdHRlcjovLycsICdtZWRpYS11cmwnOiAnaHR0cHM6Ly9naXRodWIuZ2l0aHViYXNzZXRzLmNvbS9pbWFnZXMvbW9kdWxlcy9vcGVuX2dyYXBoL2dpdGh1Yi1tYXJrLnBuZycgfSlcblx0ICogJC5tc2codGl0bGUsIHN1YnQsIGRlc2MsIHsgJ29wZW4tdXJsJzogJ2h0dHBzOi8vYmluZy5jb20nLCAnbWVkaWEtdXJsJzogJ2h0dHBzOi8vZ2l0aHViLmdpdGh1YmFzc2V0cy5jb20vaW1hZ2VzL21vZHVsZXMvb3Blbl9ncmFwaC9naXRodWItbWFyay5wbmcnIH0pXG5cdCAqXG5cdCAqIEBwYXJhbSB7Kn0gdGl0bGUg5qCH6aKYXG5cdCAqIEBwYXJhbSB7Kn0gc3VidCDlia/moIfpophcblx0ICogQHBhcmFtIHsqfSBkZXNjIOmAmuefpeivpuaDhVxuXHQgKiBAcGFyYW0geyp9IG9wdHMg6YCa55+l5Y+C5pWwXG5cdCAqXG5cdCAqL1xuXHRtc2codGl0bGUgPSBuYW1lLCBzdWJ0ID0gJycsIGRlc2MgPSAnJywgb3B0cykge1xuXHRcdGNvbnN0IHRvRW52T3B0cyA9IChyYXdvcHRzKSA9PiB7XG5cdFx0XHRzd2l0Y2ggKHR5cGVvZiByYXdvcHRzKSB7XG5cdFx0XHRcdGNhc2UgdW5kZWZpbmVkOlxuXHRcdFx0XHRcdHJldHVybiByYXdvcHRzXG5cdFx0XHRcdGNhc2UgJ3N0cmluZyc6XG5cdFx0XHRcdFx0c3dpdGNoICh0aGlzLnBsYXRmb3JtKCkpIHtcblx0XHRcdFx0XHRcdGNhc2UgJ1N1cmdlJzpcblx0XHRcdFx0XHRcdGNhc2UgJ1N0YXNoJzpcblx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdHJldHVybiB7IHVybDogcmF3b3B0cyB9XG5cdFx0XHRcdFx0XHRjYXNlICdMb29uJzpcblx0XHRcdFx0XHRcdGNhc2UgJ1NoYWRvd3JvY2tldCc6XG5cdFx0XHRcdFx0XHRcdHJldHVybiByYXdvcHRzXG5cdFx0XHRcdFx0XHRjYXNlICdRdWFudHVtdWx0IFgnOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4geyAnb3Blbi11cmwnOiByYXdvcHRzIH1cblx0XHRcdFx0XHRcdGNhc2UgJ05vZGUuanMnOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRjYXNlICdvYmplY3QnOlxuXHRcdFx0XHRcdHN3aXRjaCAodGhpcy5wbGF0Zm9ybSgpKSB7XG5cdFx0XHRcdFx0XHRjYXNlICdTdXJnZSc6XG5cdFx0XHRcdFx0XHRjYXNlICdTdGFzaCc6XG5cdFx0XHRcdFx0XHRjYXNlICdTaGFkb3dyb2NrZXQnOlxuXHRcdFx0XHRcdFx0ZGVmYXVsdDoge1xuXHRcdFx0XHRcdFx0XHRsZXQgb3BlblVybCA9XG5cdFx0XHRcdFx0XHRcdFx0cmF3b3B0cy51cmwgfHwgcmF3b3B0cy5vcGVuVXJsIHx8IHJhd29wdHNbJ29wZW4tdXJsJ11cblx0XHRcdFx0XHRcdFx0cmV0dXJuIHsgdXJsOiBvcGVuVXJsIH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGNhc2UgJ0xvb24nOiB7XG5cdFx0XHRcdFx0XHRcdGxldCBvcGVuVXJsID1cblx0XHRcdFx0XHRcdFx0XHRyYXdvcHRzLm9wZW5VcmwgfHwgcmF3b3B0cy51cmwgfHwgcmF3b3B0c1snb3Blbi11cmwnXVxuXHRcdFx0XHRcdFx0XHRsZXQgbWVkaWFVcmwgPSByYXdvcHRzLm1lZGlhVXJsIHx8IHJhd29wdHNbJ21lZGlhLXVybCddXG5cdFx0XHRcdFx0XHRcdHJldHVybiB7IG9wZW5VcmwsIG1lZGlhVXJsIH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGNhc2UgJ1F1YW50dW11bHQgWCc6IHtcblx0XHRcdFx0XHRcdFx0bGV0IG9wZW5VcmwgPVxuXHRcdFx0XHRcdFx0XHRcdHJhd29wdHNbJ29wZW4tdXJsJ10gfHwgcmF3b3B0cy51cmwgfHwgcmF3b3B0cy5vcGVuVXJsXG5cdFx0XHRcdFx0XHRcdGxldCBtZWRpYVVybCA9IHJhd29wdHNbJ21lZGlhLXVybCddIHx8IHJhd29wdHMubWVkaWFVcmxcblx0XHRcdFx0XHRcdFx0bGV0IHVwZGF0ZVBhc3RlYm9hcmQgPVxuXHRcdFx0XHRcdFx0XHRcdHJhd29wdHNbJ3VwZGF0ZS1wYXN0ZWJvYXJkJ10gfHwgcmF3b3B0cy51cGRhdGVQYXN0ZWJvYXJkXG5cdFx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdFx0J29wZW4tdXJsJzogb3BlblVybCxcblx0XHRcdFx0XHRcdFx0XHQnbWVkaWEtdXJsJzogbWVkaWFVcmwsXG5cdFx0XHRcdFx0XHRcdFx0J3VwZGF0ZS1wYXN0ZWJvYXJkJzogdXBkYXRlUGFzdGVib2FyZFxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRjYXNlICdOb2RlLmpzJzpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmICghdGhpcy5pc011dGUpIHtcblx0XHRcdHN3aXRjaCAodGhpcy5wbGF0Zm9ybSgpKSB7XG5cdFx0XHRcdGNhc2UgJ1N1cmdlJzpcblx0XHRcdFx0Y2FzZSAnTG9vbic6XG5cdFx0XHRcdGNhc2UgJ1N0YXNoJzpcblx0XHRcdFx0Y2FzZSAnU2hhZG93cm9ja2V0Jzpcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHQkbm90aWZpY2F0aW9uLnBvc3QodGl0bGUsIHN1YnQsIGRlc2MsIHRvRW52T3B0cyhvcHRzKSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlICdRdWFudHVtdWx0IFgnOlxuXHRcdFx0XHRcdCRub3RpZnkodGl0bGUsIHN1YnQsIGRlc2MsIHRvRW52T3B0cyhvcHRzKSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlICdOb2RlLmpzJzpcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoIXRoaXMuaXNNdXRlTG9nKSB7XG5cdFx0XHRsZXQgbG9ncyA9IFsnJywgJz09PT09PT09PT09PT098J+To+ezu+e7n+mAmuefpfCfk6M9PT09PT09PT09PT09PSddXG5cdFx0XHRsb2dzLnB1c2godGl0bGUpXG5cdFx0XHRzdWJ0ID8gbG9ncy5wdXNoKHN1YnQpIDogJydcblx0XHRcdGRlc2MgPyBsb2dzLnB1c2goZGVzYykgOiAnJ1xuXHRcdFx0Y29uc29sZS5sb2cobG9ncy5qb2luKCdcXG4nKSlcblx0XHRcdHRoaXMubG9ncyA9IHRoaXMubG9ncy5jb25jYXQobG9ncylcblx0XHR9XG5cdH1cblxuXHRsb2coLi4ubG9ncykge1xuXHRcdGlmIChsb2dzLmxlbmd0aCA+IDApIHtcblx0XHRcdHRoaXMubG9ncyA9IFsuLi50aGlzLmxvZ3MsIC4uLmxvZ3NdXG5cdFx0fVxuXHRcdGNvbnNvbGUubG9nKGxvZ3Muam9pbih0aGlzLmxvZ1NlcGFyYXRvcikpXG5cdH1cblxuXHRsb2dFcnIoZXJyb3IpIHtcblx0XHRzd2l0Y2ggKHRoaXMucGxhdGZvcm0oKSkge1xuXHRcdFx0Y2FzZSAnU3VyZ2UnOlxuXHRcdFx0Y2FzZSAnTG9vbic6XG5cdFx0XHRjYXNlICdTdGFzaCc6XG5cdFx0XHRjYXNlICdTaGFkb3dyb2NrZXQnOlxuXHRcdFx0Y2FzZSAnUXVhbnR1bXVsdCBYJzpcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRoaXMubG9nKCcnLCBg4p2X77iPICR7dGhpcy5uYW1lfSwg6ZSZ6K+vIWAsIGVycm9yKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnTm9kZS5qcyc6XG5cdFx0XHRcdHRoaXMubG9nKCcnLCBg4p2X77iPJHt0aGlzLm5hbWV9LCDplJnor68hYCwgZXJyb3Iuc3RhY2spXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXHR9XG5cblx0d2FpdCh0aW1lKSB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIHRpbWUpKVxuXHR9XG5cblx0ZG9uZSh2YWwgPSB7fSkge1xuXHRcdGNvbnN0IGVuZFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuXHRcdGNvbnN0IGNvc3RUaW1lID0gKGVuZFRpbWUgLSB0aGlzLnN0YXJ0VGltZSkgLyAxMDAwXG5cdFx0dGhpcy5sb2coJycsIGDwn5qpICR7dGhpcy5uYW1lfSwg57uT5p2fISDwn5WbICR7Y29zdFRpbWV9IOenkmApXG5cdFx0dGhpcy5sb2coKVxuXHRcdHN3aXRjaCAodGhpcy5wbGF0Zm9ybSgpKSB7XG5cdFx0XHRjYXNlICdTdXJnZSc6XG5cdFx0XHRjYXNlICdMb29uJzpcblx0XHRcdGNhc2UgJ1N0YXNoJzpcblx0XHRcdGNhc2UgJ1NoYWRvd3JvY2tldCc6XG5cdFx0XHRjYXNlICdRdWFudHVtdWx0IFgnOlxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0JGRvbmUodmFsKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnTm9kZS5qcyc6XG5cdFx0XHRcdHByb2Nlc3MuZXhpdCgxKVxuXHRcdFx0XHRicmVha1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgRW52aXJvbm1lbnQgVmFyaWFibGVzXG5cdCAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9WaXJnaWxDbHluZS9HZXRTb21lRnJpZXMvYmxvYi9tYWluL2Z1bmN0aW9uL2dldEVOVi9nZXRFTlYuanNcblx0ICogQGF1dGhvciBWaXJnaWxDbHluZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30ga2V5IC0gUGVyc2lzdGVudCBTdG9yZSBLZXlcblx0ICogQHBhcmFtIHtBcnJheX0gbmFtZXMgLSBQbGF0Zm9ybSBOYW1lc1xuXHQgKiBAcGFyYW0ge09iamVjdH0gZGF0YWJhc2UgLSBEZWZhdWx0IERhdGFiYXNlXG5cdCAqIEByZXR1cm4ge09iamVjdH0geyBTZXR0aW5ncywgQ2FjaGVzLCBDb25maWdzIH1cblx0ICovXG5cdGdldEVOVihrZXksIG5hbWVzLCBkYXRhYmFzZSkge1xuXHRcdC8vdGhpcy5sb2coYOKYke+4jyAke3RoaXMubmFtZX0sIEdldCBFbnZpcm9ubWVudCBWYXJpYWJsZXNgLCBcIlwiKTtcblx0XHQvKioqKioqKioqKioqKioqKiogQm94SnMgKioqKioqKioqKioqKioqKiovXG5cdFx0Ly8g5YyF6KOF5Li65bGA6YOo5Y+Y6YeP77yM55So5a6M6YeK5pS+5YaF5a2YXG5cdFx0Ly8gQm94SnPnmoTmuIXnqbrmk43kvZzov5Tlm57lgYflgLznqbrlrZfnrKbkuLIsIOmAu+i+keaIluaTjeS9nOespuS8muWcqOW3puS+p+aTjeS9nOaVsOS4uuWBh+WAvOaXtui/lOWbnuWPs+S+p+aTjeS9nOaVsOOAglxuXHRcdGxldCBCb3hKcyA9IHRoaXMuZ2V0anNvbihrZXksIGRhdGFiYXNlKTtcblx0XHQvL3RoaXMubG9nKGDwn5qnICR7dGhpcy5uYW1lfSwgR2V0IEVudmlyb25tZW50IFZhcmlhYmxlc2AsIGBCb3hKc+exu+WeizogJHt0eXBlb2YgQm94SnN9YCwgYEJveEpz5YaF5a65OiAke0pTT04uc3RyaW5naWZ5KEJveEpzKX1gLCBcIlwiKTtcblx0XHQvKioqKioqKioqKioqKioqKiogQXJndW1lbnQgKioqKioqKioqKioqKioqKiovXG5cdFx0bGV0IEFyZ3VtZW50ID0ge307XG5cdFx0aWYgKHR5cGVvZiAkYXJndW1lbnQgIT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdGlmIChCb29sZWFuKCRhcmd1bWVudCkpIHtcblx0XHRcdFx0Ly90aGlzLmxvZyhg8J+OiSAke3RoaXMubmFtZX0sICRBcmd1bWVudGApO1xuXHRcdFx0XHRsZXQgYXJnID0gT2JqZWN0LmZyb21FbnRyaWVzKCRhcmd1bWVudC5zcGxpdChcIiZcIikubWFwKChpdGVtKSA9PiBpdGVtLnNwbGl0KFwiPVwiKS5tYXAoaSA9PiBpLnJlcGxhY2UoL1xcXCIvZywgJycpKSkpO1xuXHRcdFx0XHQvL3RoaXMubG9nKEpTT04uc3RyaW5naWZ5KGFyZykpO1xuXHRcdFx0XHRmb3IgKGxldCBpdGVtIGluIGFyZykgdGhpcy5zZXRQYXRoKEFyZ3VtZW50LCBpdGVtLCBhcmdbaXRlbV0pO1xuXHRcdFx0XHQvL3RoaXMubG9nKEpTT04uc3RyaW5naWZ5KEFyZ3VtZW50KSk7XG5cdFx0XHR9O1xuXHRcdFx0Ly90aGlzLmxvZyhg4pyFICR7dGhpcy5uYW1lfSwgR2V0IEVudmlyb25tZW50IFZhcmlhYmxlc2AsIGBBcmd1bWVudOexu+WeizogJHt0eXBlb2YgQXJndW1lbnR9YCwgYEFyZ3VtZW505YaF5a65OiAke0pTT04uc3RyaW5naWZ5KEFyZ3VtZW50KX1gLCBcIlwiKTtcblx0XHR9O1xuXHRcdC8qKioqKioqKioqKioqKioqKiBTdG9yZSAqKioqKioqKioqKioqKioqKi9cblx0XHRjb25zdCBTdG9yZSA9IHsgU2V0dGluZ3M6IGRhdGFiYXNlPy5EZWZhdWx0Py5TZXR0aW5ncyB8fCB7fSwgQ29uZmlnczogZGF0YWJhc2U/LkRlZmF1bHQ/LkNvbmZpZ3MgfHwge30sIENhY2hlczoge30gfTtcblx0XHRpZiAoIUFycmF5LmlzQXJyYXkobmFtZXMpKSBuYW1lcyA9IFtuYW1lc107XG5cdFx0Ly90aGlzLmxvZyhg8J+apyAke3RoaXMubmFtZX0sIEdldCBFbnZpcm9ubWVudCBWYXJpYWJsZXNgLCBgbmFtZXPnsbvlnos6ICR7dHlwZW9mIG5hbWVzfWAsIGBuYW1lc+WGheWuuTogJHtKU09OLnN0cmluZ2lmeShuYW1lcyl9YCwgXCJcIik7XG5cdFx0Zm9yIChsZXQgbmFtZSBvZiBuYW1lcykge1xuXHRcdFx0U3RvcmUuU2V0dGluZ3MgPSB7IC4uLlN0b3JlLlNldHRpbmdzLCAuLi5kYXRhYmFzZT8uW25hbWVdPy5TZXR0aW5ncywgLi4uQXJndW1lbnQsIC4uLkJveEpzPy5bbmFtZV0/LlNldHRpbmdzIH07XG5cdFx0XHRTdG9yZS5Db25maWdzID0geyAuLi5TdG9yZS5Db25maWdzLCAuLi5kYXRhYmFzZT8uW25hbWVdPy5Db25maWdzIH07XG5cdFx0XHRpZiAoQm94SnM/LltuYW1lXT8uQ2FjaGVzICYmIHR5cGVvZiBCb3hKcz8uW25hbWVdPy5DYWNoZXMgPT09IFwic3RyaW5nXCIpIEJveEpzW25hbWVdLkNhY2hlcyA9IEpTT04ucGFyc2UoQm94SnM/LltuYW1lXT8uQ2FjaGVzKTtcblx0XHRcdFN0b3JlLkNhY2hlcyA9IHsgLi4uU3RvcmUuQ2FjaGVzLCAuLi5Cb3hKcz8uW25hbWVdPy5DYWNoZXMgfTtcblx0XHR9O1xuXHRcdC8vdGhpcy5sb2coYPCfmqcgJHt0aGlzLm5hbWV9LCBHZXQgRW52aXJvbm1lbnQgVmFyaWFibGVzYCwgYFN0b3JlLlNldHRpbmdz57G75Z6LOiAke3R5cGVvZiBTdG9yZS5TZXR0aW5nc31gLCBgU3RvcmUuU2V0dGluZ3M6ICR7SlNPTi5zdHJpbmdpZnkoU3RvcmUuU2V0dGluZ3MpfWAsIFwiXCIpO1xuXHRcdHRoaXMudHJhdmVyc2VPYmplY3QoU3RvcmUuU2V0dGluZ3MsIChrZXksIHZhbHVlKSA9PiB7XG5cdFx0XHQvL3RoaXMubG9nKGDwn5qnICR7dGhpcy5uYW1lfSwgdHJhdmVyc2VPYmplY3RgLCBgJHtrZXl9OiAke3R5cGVvZiB2YWx1ZX1gLCBgJHtrZXl9OiAke0pTT04uc3RyaW5naWZ5KHZhbHVlKX1gLCBcIlwiKTtcblx0XHRcdGlmICh2YWx1ZSA9PT0gXCJ0cnVlXCIgfHwgdmFsdWUgPT09IFwiZmFsc2VcIikgdmFsdWUgPSBKU09OLnBhcnNlKHZhbHVlKTsgLy8g5a2X56ym5Liy6L2sQm9vbGVhblxuXHRcdFx0ZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdGlmICh2YWx1ZS5pbmNsdWRlcyhcIixcIikpIHZhbHVlID0gdmFsdWUuc3BsaXQoXCIsXCIpLm1hcChpdGVtID0+IHRoaXMuc3RyaW5nMm51bWJlcihpdGVtKSk7IC8vIOWtl+espuS4sui9rOaVsOe7hOi9rOaVsOWtl1xuXHRcdFx0XHRlbHNlIHZhbHVlID0gdGhpcy5zdHJpbmcybnVtYmVyKHZhbHVlKTsgLy8g5a2X56ym5Liy6L2s5pWw5a2XXG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdH0pO1xuXHRcdC8vdGhpcy5sb2coYOKchSAke3RoaXMubmFtZX0sIEdldCBFbnZpcm9ubWVudCBWYXJpYWJsZXNgLCBgU3RvcmU6ICR7dHlwZW9mIFN0b3JlLkNhY2hlc31gLCBgU3RvcmXlhoXlrrk6ICR7SlNPTi5zdHJpbmdpZnkoU3RvcmUpfWAsIFwiXCIpO1xuXHRcdHJldHVybiBTdG9yZTtcblx0fTtcblxuXHQvKioqKioqKioqKioqKioqKiogZnVuY3Rpb24gKioqKioqKioqKioqKioqKiovXG5cdHNldFBhdGgob2JqZWN0LCBwYXRoLCB2YWx1ZSkgeyBwYXRoLnNwbGl0KFwiLlwiKS5yZWR1Y2UoKG8sIHAsIGkpID0+IG9bcF0gPSBwYXRoLnNwbGl0KFwiLlwiKS5sZW5ndGggPT09ICsraSA/IHZhbHVlIDogb1twXSB8fCB7fSwgb2JqZWN0KSB9XG5cdHRyYXZlcnNlT2JqZWN0KG8sIGMpIHsgZm9yICh2YXIgdCBpbiBvKSB7IHZhciBuID0gb1t0XTsgb1t0XSA9IFwib2JqZWN0XCIgPT0gdHlwZW9mIG4gJiYgbnVsbCAhPT0gbiA/IHRoaXMudHJhdmVyc2VPYmplY3QobiwgYykgOiBjKHQsIG4pIH0gcmV0dXJuIG8gfVxuXHRzdHJpbmcybnVtYmVyKHN0cmluZykgeyBpZiAoc3RyaW5nICYmICFpc05hTihzdHJpbmcpKSBzdHJpbmcgPSBwYXJzZUludChzdHJpbmcsIDEwKTsgcmV0dXJuIHN0cmluZyB9XG59XG5cbmV4cG9ydCBjbGFzcyBIdHRwIHtcblx0Y29uc3RydWN0b3IoZW52KSB7XG5cdFx0dGhpcy5lbnYgPSBlbnZcblx0fVxuXG5cdHNlbmQob3B0cywgbWV0aG9kID0gJ0dFVCcpIHtcblx0XHRvcHRzID0gdHlwZW9mIG9wdHMgPT09ICdzdHJpbmcnID8geyB1cmw6IG9wdHMgfSA6IG9wdHNcblx0XHRsZXQgc2VuZGVyID0gdGhpcy5nZXRcblx0XHRpZiAobWV0aG9kID09PSAnUE9TVCcpIHtcblx0XHRcdHNlbmRlciA9IHRoaXMucG9zdFxuXHRcdH1cblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0c2VuZGVyLmNhbGwodGhpcywgb3B0cywgKGVycm9yLCByZXNwb25zZSwgYm9keSkgPT4ge1xuXHRcdFx0XHRpZiAoZXJyb3IpIHJlamVjdChlcnJvcilcblx0XHRcdFx0ZWxzZSByZXNvbHZlKHJlc3BvbnNlKVxuXHRcdFx0fSlcblx0XHR9KVxuXHR9XG5cblx0Z2V0KG9wdHMpIHtcblx0XHRyZXR1cm4gdGhpcy5zZW5kLmNhbGwodGhpcy5lbnYsIG9wdHMpXG5cdH1cblxuXHRwb3N0KG9wdHMpIHtcblx0XHRyZXR1cm4gdGhpcy5zZW5kLmNhbGwodGhpcy5lbnYsIG9wdHMsICdQT1NUJylcblx0fVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgVVJJIHtcblx0Y29uc3RydWN0b3Iob3B0cyA9IFtdKSB7XG5cdFx0dGhpcy5uYW1lID0gXCJVUkkgdjEuMi42XCI7XG5cdFx0dGhpcy5vcHRzID0gb3B0cztcblx0XHR0aGlzLmpzb24gPSB7IHNjaGVtZTogXCJcIiwgaG9zdDogXCJcIiwgcGF0aDogXCJcIiwgcXVlcnk6IHt9IH07XG5cdH07XG5cblx0cGFyc2UodXJsKSB7XG5cdFx0Y29uc3QgVVJMUmVnZXggPSAvKD86KD88c2NoZW1lPi4rKTpcXC9cXC8oPzxob3N0PlteL10rKSk/XFwvPyg/PHBhdGg+W14/XSspP1xcPz8oPzxxdWVyeT5bXj9dKyk/Lztcblx0XHRsZXQganNvbiA9IHVybC5tYXRjaChVUkxSZWdleCk/Lmdyb3VwcyA/PyBudWxsO1xuXHRcdGlmIChqc29uPy5wYXRoKSBqc29uLnBhdGhzID0ganNvbi5wYXRoLnNwbGl0KFwiL1wiKTsgZWxzZSBqc29uLnBhdGggPSBcIlwiO1xuXHRcdC8vaWYgKGpzb24/LnBhdGhzPy5hdCgtMSk/LmluY2x1ZGVzKFwiLlwiKSkganNvbi5mb3JtYXQgPSBqc29uLnBhdGhzLmF0KC0xKS5zcGxpdChcIi5cIikuYXQoLTEpO1xuXHRcdGlmIChqc29uPy5wYXRocykge1xuXHRcdFx0Y29uc3QgZmlsZU5hbWUgPSBqc29uLnBhdGhzW2pzb24ucGF0aHMubGVuZ3RoIC0gMV07XG5cdFx0XHRpZiAoZmlsZU5hbWU/LmluY2x1ZGVzKFwiLlwiKSkge1xuXHRcdFx0XHRjb25zdCBsaXN0ID0gZmlsZU5hbWUuc3BsaXQoXCIuXCIpO1xuXHRcdFx0XHRqc29uLmZvcm1hdCA9IGxpc3RbbGlzdC5sZW5ndGggLSAxXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKGpzb24/LnF1ZXJ5KSBqc29uLnF1ZXJ5ID0gT2JqZWN0LmZyb21FbnRyaWVzKGpzb24ucXVlcnkuc3BsaXQoXCImXCIpLm1hcCgocGFyYW0pID0+IHBhcmFtLnNwbGl0KFwiPVwiKSkpO1xuXHRcdHJldHVybiBqc29uXG5cdH07XG5cblx0c3RyaW5naWZ5KGpzb24gPSB0aGlzLmpzb24pIHtcblx0XHRsZXQgdXJsID0gXCJcIjtcblx0XHRpZiAoanNvbj8uc2NoZW1lICYmIGpzb24/Lmhvc3QpIHVybCArPSBqc29uLnNjaGVtZSArIFwiOi8vXCIgKyBqc29uLmhvc3Q7XG5cdFx0aWYgKGpzb24/LnBhdGgpIHVybCArPSAoanNvbj8uaG9zdCkgPyBcIi9cIiArIGpzb24ucGF0aCA6IGpzb24ucGF0aDtcblx0XHRpZiAoanNvbj8ucXVlcnkpIHVybCArPSBcIj9cIiArIE9iamVjdC5lbnRyaWVzKGpzb24ucXVlcnkpLm1hcChwYXJhbSA9PiBwYXJhbS5qb2luKFwiPVwiKSkuam9pbihcIiZcIik7XG5cdFx0cmV0dXJuIHVybFxuXHR9O1xufVxuIiwiLypcblJFQURNRTogaHR0cHM6Ly9naXRodWIuY29tL1ZpcmdpbENseW5lL2lSaW5nb1xuKi9cblxuaW1wb3J0IEVOVnMgZnJvbSBcIi4uL0VOVi9FTlYubWpzXCI7XG5jb25zdCAkID0gbmV3IEVOVnMoXCLvo78gaVJpbmdvOiBTZXQgRW52aXJvbm1lbnQgVmFyaWFibGVzXCIpO1xuXG4vKipcbiAqIFNldCBFbnZpcm9ubWVudCBWYXJpYWJsZXNcbiAqIEBhdXRob3IgVmlyZ2lsQ2x5bmVcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gUGVyc2lzdGVudCBTdG9yZSBLZXlcbiAqIEBwYXJhbSB7QXJyYXl9IHBsYXRmb3JtcyAtIFBsYXRmb3JtIE5hbWVzXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YWJhc2UgLSBEZWZhdWx0IERhdGFCYXNlXG4gKiBAcmV0dXJuIHtPYmplY3R9IHsgU2V0dGluZ3MsIENhY2hlcywgQ29uZmlncyB9XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHNldEVOVihuYW1lLCBwbGF0Zm9ybXMsIGRhdGFiYXNlKSB7XG5cdCQubG9nKGDimJHvuI8gJHskLm5hbWV9YCwgXCJcIik7XG5cdGxldCB7IFNldHRpbmdzLCBDYWNoZXMsIENvbmZpZ3MgfSA9ICQuZ2V0RU5WKG5hbWUsIHBsYXRmb3JtcywgZGF0YWJhc2UpO1xuXHQvKioqKioqKioqKioqKioqKiogU2V0dGluZ3MgKioqKioqKioqKioqKioqKiovXG5cdGlmIChTZXR0aW5ncz8uVGFicyAmJiAhQXJyYXkuaXNBcnJheShTZXR0aW5ncz8uVGFicykpICQubG9kYXNoX3NldChTZXR0aW5ncywgXCJUYWJzXCIsIChTZXR0aW5ncz8uVGFicykgPyBbU2V0dGluZ3MuVGFicy50b1N0cmluZygpXSA6IFtdKTtcblx0aWYgKFNldHRpbmdzPy5Eb21haW5zICYmICFBcnJheS5pc0FycmF5KFNldHRpbmdzPy5Eb21haW5zKSkgJC5sb2Rhc2hfc2V0KFNldHRpbmdzLCBcIkRvbWFpbnNcIiwgKFNldHRpbmdzPy5Eb21haW5zKSA/IFtTZXR0aW5ncy5Eb21haW5zLnRvU3RyaW5nKCldIDogW10pO1xuXHRpZiAoU2V0dGluZ3M/LkZ1bmN0aW9ucyAmJiAhQXJyYXkuaXNBcnJheShTZXR0aW5ncz8uRnVuY3Rpb25zKSkgJC5sb2Rhc2hfc2V0KFNldHRpbmdzLCBcIkZ1bmN0aW9uc1wiLCAoU2V0dGluZ3M/LkZ1bmN0aW9ucykgPyBbU2V0dGluZ3MuRnVuY3Rpb25zLnRvU3RyaW5nKCldIDogW10pO1xuXHQkLmxvZyhg4pyFICR7JC5uYW1lfWAsIGBTZXR0aW5nczogJHt0eXBlb2YgU2V0dGluZ3N9YCwgYFNldHRpbmdz5YaF5a65OiAke0pTT04uc3RyaW5naWZ5KFNldHRpbmdzKX1gLCBcIlwiKTtcblx0LyoqKioqKioqKioqKioqKioqIENhY2hlcyAqKioqKioqKioqKioqKioqKi9cblx0Ly8kLmxvZyhg4pyFICR7JC5uYW1lfWAsIGBDYWNoZXM6ICR7dHlwZW9mIENhY2hlc31gLCBgQ2FjaGVz5YaF5a65OiAke0pTT04uc3RyaW5naWZ5KENhY2hlcyl9YCwgXCJcIik7XG5cdC8qKioqKioqKioqKioqKioqKiBDb25maWdzICoqKioqKioqKioqKioqKioqL1xuXHRDb25maWdzLlN0b3JlZnJvbnQgPSBuZXcgTWFwKENvbmZpZ3MuU3RvcmVmcm9udCk7XG5cdGlmIChDb25maWdzLkxvY2FsZSkgQ29uZmlncy5Mb2NhbGUgPSBuZXcgTWFwKENvbmZpZ3MuTG9jYWxlKTtcblx0aWYgKENvbmZpZ3MuaTE4bikgZm9yIChsZXQgdHlwZSBpbiBDb25maWdzLmkxOG4pIENvbmZpZ3MuaTE4blt0eXBlXSA9IG5ldyBNYXAoQ29uZmlncy5pMThuW3R5cGVdKTtcblx0cmV0dXJuIHsgU2V0dGluZ3MsIENhY2hlcywgQ29uZmlncyB9O1xufTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJ2YXIgZ2V0UHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YgPyAob2JqKSA9PiAoT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaikpIDogKG9iaikgPT4gKG9iai5fX3Byb3RvX18pO1xudmFyIGxlYWZQcm90b3R5cGVzO1xuLy8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4vLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbi8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuLy8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4vLyBtb2RlICYgMTY6IHJldHVybiB2YWx1ZSB3aGVuIGl0J3MgUHJvbWlzZS1saWtlXG4vLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuXHRpZihtb2RlICYgMSkgdmFsdWUgPSB0aGlzKHZhbHVlKTtcblx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcblx0aWYodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSkge1xuXHRcdGlmKChtb2RlICYgNCkgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuXHRcdGlmKChtb2RlICYgMTYpICYmIHR5cGVvZiB2YWx1ZS50aGVuID09PSAnZnVuY3Rpb24nKSByZXR1cm4gdmFsdWU7XG5cdH1cblx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcblx0dmFyIGRlZiA9IHt9O1xuXHRsZWFmUHJvdG90eXBlcyA9IGxlYWZQcm90b3R5cGVzIHx8IFtudWxsLCBnZXRQcm90byh7fSksIGdldFByb3RvKFtdKSwgZ2V0UHJvdG8oZ2V0UHJvdG8pXTtcblx0Zm9yKHZhciBjdXJyZW50ID0gbW9kZSAmIDIgJiYgdmFsdWU7IHR5cGVvZiBjdXJyZW50ID09ICdvYmplY3QnICYmICF+bGVhZlByb3RvdHlwZXMuaW5kZXhPZihjdXJyZW50KTsgY3VycmVudCA9IGdldFByb3RvKGN1cnJlbnQpKSB7XG5cdFx0T2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoY3VycmVudCkuZm9yRWFjaCgoa2V5KSA9PiAoZGVmW2tleV0gPSAoKSA9PiAodmFsdWVba2V5XSkpKTtcblx0fVxuXHRkZWZbJ2RlZmF1bHQnXSA9ICgpID0+ICh2YWx1ZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChucywgZGVmKTtcblx0cmV0dXJuIG5zO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLypcblJFQURNRTogaHR0cHM6Ly9naXRodWIuY29tL1ZpcmdpbENseW5lL2lSaW5nb1xuKi9cblxuaW1wb3J0IEVOVnMgZnJvbSBcIi4vRU5WL0VOVi5tanNcIjtcbmltcG9ydCBVUklzIGZyb20gXCIuL1VSSS9VUkkubWpzXCI7XG5pbXBvcnQgc2V0RU5WIGZyb20gXCIuL2Z1bmN0aW9uL3NldEVOVi5tanNcIjtcblxuaW1wb3J0ICogYXMgRGVmYXVsdCBmcm9tIFwiLi9kYXRhYmFzZS9EZWZhdWx0Lmpzb25cIjtcbmltcG9ydCAqIGFzIExvY2F0aW9uIGZyb20gXCIuL2RhdGFiYXNlL0xvY2F0aW9uLmpzb25cIjtcbmltcG9ydCAqIGFzIE5ld3MgZnJvbSBcIi4vZGF0YWJhc2UvTmV3cy5qc29uXCI7XG5pbXBvcnQgKiBhcyBQcml2YXRlUmVsYXkgZnJvbSBcIi4vZGF0YWJhc2UvUHJpdmF0ZVJlbGF5Lmpzb25cIjtcbmltcG9ydCAqIGFzIFNpcmkgZnJvbSBcIi4vZGF0YWJhc2UvU2lyaS5qc29uXCI7XG5pbXBvcnQgKiBhcyBUZXN0RmxpZ2h0IGZyb20gXCIuL2RhdGFiYXNlL1Rlc3RGbGlnaHQuanNvblwiO1xuaW1wb3J0ICogYXMgVFYgZnJvbSBcIi4vZGF0YWJhc2UvVFYuanNvblwiO1xuXG5jb25zdCAkID0gbmV3IEVOVnMoXCLvo78gaVJpbmdvOiDwn5SNIFNpcmkgdjMuMC4zKDEpIHJlc3BvbnNlLmJldGFcIik7XG5jb25zdCBVUkkgPSBuZXcgVVJJcygpO1xuY29uc3QgRGF0YUJhc2UgPSB7XG5cdFwiRGVmYXVsdFwiOiBEZWZhdWx0LFxuXHRcIkxvY2F0aW9uXCI6IExvY2F0aW9uLFxuXHRcIk5ld3NcIjogTmV3cyxcblx0XCJQcml2YXRlUmVsYXlcIjogUHJpdmF0ZVJlbGF5LFxuXHRcIlNpcmlcIjogU2lyaSxcblx0XCJUZXN0RmxpZ2h0XCI6IFRlc3RGbGlnaHQsXG5cdFwiVFZcIjogVFYsXG59O1xuXG4vKioqKioqKioqKioqKioqKiogUHJvY2Vzc2luZyAqKioqKioqKioqKioqKioqKi9cbi8vIOino+aehFVSTFxuY29uc3QgVVJMID0gVVJJLnBhcnNlKCRyZXF1ZXN0LnVybCk7XG4kLmxvZyhg4pqgICR7JC5uYW1lfWAsIGBVUkw6ICR7SlNPTi5zdHJpbmdpZnkoVVJMKX1gLCBcIlwiKTtcbi8vIOiOt+WPlui/nuaOpeWPguaVsFxuY29uc3QgTUVUSE9EID0gJHJlcXVlc3QubWV0aG9kLCBIT1NUID0gVVJMLmhvc3QsIFBBVEggPSBVUkwucGF0aCwgUEFUSHMgPSBVUkwucGF0aHM7XG4kLmxvZyhg4pqgICR7JC5uYW1lfWAsIGBNRVRIT0Q6ICR7TUVUSE9EfWAsIFwiXCIpO1xuLy8g6Kej5p6Q5qC85byPXG5jb25zdCBGT1JNQVQgPSAoJHJlc3BvbnNlLmhlYWRlcnM/LltcIkNvbnRlbnQtVHlwZVwiXSA/PyAkcmVzcG9uc2UuaGVhZGVycz8uW1wiY29udGVudC10eXBlXCJdKT8uc3BsaXQoXCI7XCIpPy5bMF07XG4kLmxvZyhg4pqgICR7JC5uYW1lfWAsIGBGT1JNQVQ6ICR7Rk9STUFUfWAsIFwiXCIpO1xuKGFzeW5jICgpID0+IHtcblx0Y29uc3QgeyBTZXR0aW5ncywgQ2FjaGVzLCBDb25maWdzIH0gPSBzZXRFTlYoXCJpUmluZ29cIiwgXCJTaXJpXCIsIERhdGFCYXNlKTtcblx0JC5sb2coYOKaoCAkeyQubmFtZX1gLCBgU2V0dGluZ3MuU3dpdGNoOiAke1NldHRpbmdzPy5Td2l0Y2h9YCwgXCJcIik7XG5cdHN3aXRjaCAoU2V0dGluZ3MuU3dpdGNoKSB7XG5cdFx0Y2FzZSB0cnVlOlxuXHRcdGRlZmF1bHQ6XG5cdFx0XHQvLyDliJvlu7rnqbrmlbDmja5cblx0XHRcdGxldCBib2R5ID0ge307XG5cdFx0XHQvLyDmoLzlvI/liKTmlq1cblx0XHRcdHN3aXRjaCAoRk9STUFUKSB7XG5cdFx0XHRcdGNhc2UgdW5kZWZpbmVkOiAvLyDop4bkuLrml6Bib2R5XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIjpcblx0XHRcdFx0Y2FzZSBcInRleHQvcGxhaW5cIjpcblx0XHRcdFx0Y2FzZSBcInRleHQvaHRtbFwiOlxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24veC1tcGVnVVJMXCI6XG5cdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi94LW1wZWd1cmxcIjpcblx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3ZuZC5hcHBsZS5tcGVndXJsXCI6XG5cdFx0XHRcdGNhc2UgXCJhdWRpby9tcGVndXJsXCI6XG5cdFx0XHRcdFx0Ly9ib2R5ID0gTTNVOC5wYXJzZSgkcmVzcG9uc2UuYm9keSk7XG5cdFx0XHRcdFx0Ly8kLmxvZyhg8J+apyAkeyQubmFtZX1gLCBgYm9keTogJHtKU09OLnN0cmluZ2lmeShib2R5KX1gLCBcIlwiKTtcblx0XHRcdFx0XHQvLyRyZXNwb25zZS5ib2R5ID0gTTNVOC5zdHJpbmdpZnkoYm9keSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJ0ZXh0L3htbFwiOlxuXHRcdFx0XHRjYXNlIFwidGV4dC9wbGlzdFwiOlxuXHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24veG1sXCI6XG5cdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi9wbGlzdFwiOlxuXHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24veC1wbGlzdFwiOlxuXHRcdFx0XHRcdC8vYm9keSA9IFhNTC5wYXJzZSgkcmVzcG9uc2UuYm9keSk7XG5cdFx0XHRcdFx0Ly8kLmxvZyhg8J+apyAkeyQubmFtZX1gLCBgYm9keTogJHtKU09OLnN0cmluZ2lmeShib2R5KX1gLCBcIlwiKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcInRleHQvdnR0XCI6XG5cdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi92dHRcIjpcblx0XHRcdFx0XHQvL2JvZHkgPSBWVFQucGFyc2UoJHJlc3BvbnNlLmJvZHkpO1xuXHRcdFx0XHRcdC8vJC5sb2coYPCfmqcgJHskLm5hbWV9YCwgYGJvZHk6ICR7SlNPTi5zdHJpbmdpZnkoYm9keSl9YCwgXCJcIik7XG5cdFx0XHRcdFx0Ly8kcmVzcG9uc2UuYm9keSA9IFZUVC5zdHJpbmdpZnkoYm9keSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJ0ZXh0L2pzb25cIjpcblx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL2pzb25cIjpcblx0XHRcdFx0XHRib2R5ID0gSlNPTi5wYXJzZSgkcmVzcG9uc2UuYm9keSA/PyBcInt9XCIpO1xuXHRcdFx0XHRcdC8vIOS4u+acuuWIpOaWrVxuXHRcdFx0XHRcdHN3aXRjaCAoSE9TVCkge1xuXHRcdFx0XHRcdFx0Y2FzZSBcImFwaS5zbW9vdC5hcHBsZS5jb21cIjpcblx0XHRcdFx0XHRcdGNhc2UgXCJhcGkuc21vb3QuYXBwbGUuY25cIjpcblx0XHRcdFx0XHRcdFx0Ly8g6Lev5b6E5Yik5patXG5cdFx0XHRcdFx0XHRcdHN3aXRjaCAoUEFUSCkge1xuXHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJiYWdcIjogLy8g6YWN572uXG5cdFx0XHRcdFx0XHRcdFx0XHRib2R5LmVuYWJsZWQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0Ym9keS5mZWVkYmFja19lbmFibGVkID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHRcdC8vYm9keS5zZWFyY2hfdXJsID0gYm9keT8uc2VhcmNoX3VybCB8fCBcImh0dHBzOlxcL1xcL2FwaS1nbGItYXBuZTFjLnNtb290LmFwcGxlLmNvbVxcL3NlYXJjaFwiO1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly9ib2R5LmZlZWRiYWNrX3VybCA9IGJvZHk/LmZlZWRiYWNrX3VybCB8fCBcImh0dHBzOlxcL1xcL2Zicy5zbW9vdC5hcHBsZS5jb21cXC9mYlwiO1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKGJvZHk/LmVuYWJsZWRfZG9tYWlucykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRib2R5LmVuYWJsZWRfZG9tYWlucyA9IFsuLi5uZXcgU2V0KFsuLi5ib2R5Py5lbmFibGVkX2RvbWFpbnMgPz8gW10sIC4uLlNldHRpbmdzLkRvbWFpbnNdKV07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdCQubG9nKGDwn46JICR7JC5uYW1lfSwg6aKG5Z+f5YiX6KGoYCwgYGVuYWJsZWRfZG9tYWluczogJHtKU09OLnN0cmluZ2lmeShib2R5LmVuYWJsZWRfZG9tYWlucyl9YCwgXCJcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoYm9keT8uc2NlbmVfYXdhcmVfbG9va3VwX2VuYWJsZWRfZG9tYWlucykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRib2R5LnNjZW5lX2F3YXJlX2xvb2t1cF9lbmFibGVkX2RvbWFpbnMgPSBbLi4ubmV3IFNldChbLi4uYm9keT8uc2NlbmVfYXdhcmVfbG9va3VwX2VuYWJsZWRfZG9tYWlucyA/PyBbXSwgLi4uU2V0dGluZ3MuRG9tYWluc10pXTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0JC5sb2coYPCfjokgJHskLm5hbWV9LCDpoobln5/liJfooahgLCBgc2NlbmVfYXdhcmVfbG9va3VwX2VuYWJsZWRfZG9tYWluczogJHtKU09OLnN0cmluZ2lmeShib2R5LnNjZW5lX2F3YXJlX2xvb2t1cF9lbmFibGVkX2RvbWFpbnMpfWAsIFwiXCIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0Ym9keS5taW5fcXVlcnlfbGVuID0gMztcblx0XHRcdFx0XHRcdFx0XHRcdGxldCBPdmVycmlkZXMgPSBib2R5Py5vdmVycmlkZXM7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoT3ZlcnJpZGVzKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFNldHRpbmdzLkZ1bmN0aW9ucy5mb3JFYWNoKGFwcCA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0bGV0IEFQUCA9IE92ZXJyaWRlcz8uW2Ake2FwcH1gXTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoQVBQKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRBUFAuZW5hYmxlZCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRBUFAuZmVlZGJhY2tfZW5hYmxlZCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvL0FQUC5taW5fcXVlcnlfbGVuID0gMjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vQVBQLnNlYXJjaF9yZW5kZXJfdGltZW91dCA9IDIwMDtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vQVBQLmZpcnN0X3VzZV9kZXNjcmlwdGlvbiA9IFwiXCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvL0FQUC5maXJzdF91c2VfbGVhcm5fbW9yZSA9IFwiXCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIEFQUCA9IHsgZW5hYmxlZDogdHJ1ZSwgZmVlZGJhY2tfZW5hYmxlZDogdHJ1ZSB9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0bGV0IEZsaWdodFV0aWxpdGllcyA9IE92ZXJyaWRlcz8uZmxpZ2h0dXRpbGl0aWVzO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoRmxpZ2h0VXRpbGl0aWVzKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9GbGlnaHRVdGlsaXRpZXMuZmFsbGJhY2tfZmxpZ2h0X3VybCA9IFwiaHR0cHM6XFwvXFwvYXBpLWdsYi1hcHMxYi5zbW9vdC5hcHBsZS5jb21cXC9mbGlnaHRcIjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvL0ZsaWdodFV0aWxpdGllcy5mbGlnaHRfdXJsID0gXCJodHRwczpcXC9cXC9hcGktZ2xiLWFwc2UxYy5zbW9vdC5hcHBsZS5jb21cXC9mbGlnaHRcIjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0bGV0IExvb2t1cCA9IE92ZXJyaWRlcz8ubG9va3VwO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoTG9va3VwKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0TG9va3VwLm1pbl9xdWVyeV9sZW4gPSAyO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRsZXQgTWFpbCA9IE92ZXJyaWRlcz8ubWFpbDtcblx0XHRcdFx0XHRcdFx0XHRcdFx0bGV0IE1lc3NhZ2VzID0gT3ZlcnJpZGVzPy5tZXNzYWdlcztcblx0XHRcdFx0XHRcdFx0XHRcdFx0bGV0IE5ld3MgPSBPdmVycmlkZXM/Lm5ld3M7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGxldCBTYWZhcmkgPSBPdmVycmlkZXM/LnNhZmFyaTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKFNhZmFyaSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFNhZmFyaS5leHBlcmltZW50c19jdXN0b21fZmVlZGJhY2tfZW5hYmxlZCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGxldCBTcG90bGlnaHQgPSBPdmVycmlkZXM/LnNwb3RsaWdodDtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKFNwb3RsaWdodCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFNwb3RsaWdodC51c2VfdHdvbGF5ZXJfcmFua2luZyA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0U3BvdGxpZ2h0LmV4cGVyaW1lbnRzX2N1c3RvbV9mZWVkYmFja19lbmFibGVkID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRTcG90bGlnaHQubWluX3F1ZXJ5X2xlbiA9IDI7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0U3BvdGxpZ2h0LmNvbGxlY3Rfc2NvcmVzID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRTcG90bGlnaHQuY29sbGVjdF9hbm9ueW1vdXNfbWV0YWRhdGEgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRsZXQgVmlzdWFsSW50ZWxsaWdlbmNlID0gT3ZlcnJpZGVzPy52aXN1YWxpbnRlbGxpZ2VuY2U7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChWaXN1YWxJbnRlbGxpZ2VuY2UpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRWaXN1YWxJbnRlbGxpZ2VuY2UuZW5hYmxlZF9kb21haW5zID0gWy4uLm5ldyBTZXQoWy4uLlZpc3VhbEludGVsbGlnZW5jZS5lbmFibGVkX2RvbWFpbnMgPz8gW10sIC4uLkNvbmZpZ3MuVmlzdWFsSW50ZWxsaWdlbmNlLmVuYWJsZWRfZG9tYWluc10pXTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRWaXN1YWxJbnRlbGxpZ2VuY2Uuc3VwcG9ydGVkX2RvbWFpbnMgPSBbLi4ubmV3IFNldChbLi4uVmlzdWFsSW50ZWxsaWdlbmNlLnN1cHBvcnRlZF9kb21haW5zID8/IFtdLCAuLi5Db25maWdzLlZpc3VhbEludGVsbGlnZW5jZS5zdXBwb3J0ZWRfZG9tYWluc10pXTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBTYWZhcmkgU21hcnQgSGlzdG9yeVxuXHRcdFx0XHRcdFx0XHRcdFx0Ym9keS5zYWZhcmlfc21hcnRfaGlzdG9yeV9lbmFibGVkID0gKFNldHRpbmdzLlNhZmFyaV9TbWFydF9IaXN0b3J5KSA/IHRydWUgOiBmYWxzZTtcblx0XHRcdFx0XHRcdFx0XHRcdGJvZHkuc21hcnRfaGlzdG9yeV9mZWF0dXJlX2ZlZWRiYWNrX2VuYWJsZWQgPSAoU2V0dGluZ3MuU2FmYXJpX1NtYXJ0X0hpc3RvcnkpID8gdHJ1ZSA6IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRcdFx0Lypcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChib2R5Py5tZXNjYWxfZW5hYmxlZCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRib2R5Lm1lc2NhbF9lbmFibGVkID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ym9keS5tZXNjYWxfdmVyc2lvbiA9IDIwMDtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ym9keS5tZXNjYWxfY2VydF91cmwgPSBcImh0dHBzOi8vaW5pdC5pdHVuZXMuYXBwbGUuY29tL1dlYk9iamVjdHMvTVpJbml0LndvYS93YS9zaWduU2FwU2V0dXBDZXJ0XCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGJvZHkubWVzY2FsX3NldHVwX3VybCA9IFwiaHR0cHM6Ly9wbGF5Lml0dW5lcy5hcHBsZS5jb20vV2ViT2JqZWN0cy9NWlBsYXkud29hL3dhL3NpZ25TYXBTZXR1cFwiO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0bGV0IHNtYXJ0X3NlYXJjaF92MiA9IGJvZHk/LnNtYXJ0X3NlYXJjaF92Ml9wYXJhbWV0ZXJzO1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHNtYXJ0X3NlYXJjaF92Mikge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRzbWFydF9zZWFyY2hfdjIuc21hcnRfaGlzdG9yeV9zY29yZV92Ml9lbmFibGVkID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0c21hcnRfc2VhcmNoX3YyLnNtYXJ0X2hpc3Rvcnlfc2NvcmVfdjJfZW5hYmxlX2NvdW50ID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHRib2R5LnNlc3Npb25fZXhwZXJpbWVudF9tZXRhZGF0YV9lbmFibGVkID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHRcdC8vYm9keS5zYW1wbGVfZmVhdHVyZXMgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly9ib2R5LnVzZV9sZWRiZWxseSA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0XHQqL1xuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSBcImZicy5zbW9vdC5hcHBsZS5jb21cIjpcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIFwiY2RuLnNtb290LmFwcGxlLmNvbVwiOlxuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGRlZmF1bHQ6IC8vIOWFtuS7luS4u+aculxuXHRcdFx0XHRcdFx0XHQvLyDot6/lvoTliKTmlq1cblx0XHRcdFx0XHRcdFx0c3dpdGNoIChQQVRIKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcIndhcm1cIjpcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwicmVuZGVyXCI6XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcImZsaWdodFwiOiAvLyDoiKrnj61cblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJzZWFyY2hcIjogLy8g5pCc57SiXG5cdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiY2FyZFwiOiAvLyDljaHniYdcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdCRyZXNwb25zZS5ib2R5ID0gSlNPTi5zdHJpbmdpZnkoYm9keSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi9wcm90b2J1ZlwiOlxuXHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24veC1wcm90b2J1ZlwiOlxuXHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24vdm5kLmdvb2dsZS5wcm90b2J1ZlwiOlxuXHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24vZ3JwY1wiOlxuXHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24vZ3JwYytwcm90b1wiOlxuXHRcdFx0XHRjYXNlIFwiYXBwbGVjYXRpb24vb2N0ZXQtc3RyZWFtXCI6XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9O1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBmYWxzZTpcblx0XHRcdGJyZWFrO1xuXHR9O1xufSkoKVxuXHQuY2F0Y2goKGUpID0+ICQubG9nRXJyKGUpKVxuXHQuZmluYWxseSgoKSA9PiB7XG5cdFx0c3dpdGNoICgkcmVzcG9uc2UpIHtcblx0XHRcdGRlZmF1bHQ6IHsgLy8g5pyJ5Zue5aSN5pWw5o2u77yM6L+U5Zue5Zue5aSN5pWw5o2uXG5cdFx0XHRcdC8vY29uc3QgRk9STUFUID0gKCRyZXNwb25zZT8uaGVhZGVycz8uW1wiQ29udGVudC1UeXBlXCJdID8/ICRyZXNwb25zZT8uaGVhZGVycz8uW1wiY29udGVudC10eXBlXCJdKT8uc3BsaXQoXCI7XCIpPy5bMF07XG5cdFx0XHRcdCQubG9nKGDwn46JICR7JC5uYW1lfSwgZmluYWxseWAsIGAkcmVzcG9uc2VgLCBgRk9STUFUOiAke0ZPUk1BVH1gLCBcIlwiKTtcblx0XHRcdFx0Ly8kLmxvZyhg8J+apyAkeyQubmFtZX0sIGZpbmFsbHlgLCBgJHJlc3BvbnNlOiAke0pTT04uc3RyaW5naWZ5KCRyZXNwb25zZSl9YCwgXCJcIik7XG5cdFx0XHRcdGlmICgkcmVzcG9uc2U/LmhlYWRlcnM/LltcIkNvbnRlbnQtRW5jb2RpbmdcIl0pICRyZXNwb25zZS5oZWFkZXJzW1wiQ29udGVudC1FbmNvZGluZ1wiXSA9IFwiaWRlbnRpdHlcIjtcblx0XHRcdFx0aWYgKCRyZXNwb25zZT8uaGVhZGVycz8uW1wiY29udGVudC1lbmNvZGluZ1wiXSkgJHJlc3BvbnNlLmhlYWRlcnNbXCJjb250ZW50LWVuY29kaW5nXCJdID0gXCJpZGVudGl0eVwiO1xuXHRcdFx0XHRpZiAoJC5pc1F1YW5YKCkpIHtcblx0XHRcdFx0XHRzd2l0Y2ggKEZPUk1BVCkge1xuXHRcdFx0XHRcdFx0Y2FzZSB1bmRlZmluZWQ6IC8vIOinhuS4uuaXoGJvZHlcblx0XHRcdFx0XHRcdFx0Ly8g6L+U5Zue5pmu6YCa5pWw5o2uXG5cdFx0XHRcdFx0XHRcdCQuZG9uZSh7IHN0YXR1czogJHJlc3BvbnNlLnN0YXR1cywgaGVhZGVyczogJHJlc3BvbnNlLmhlYWRlcnMgfSk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0Ly8g6L+U5Zue5pmu6YCa5pWw5o2uXG5cdFx0XHRcdFx0XHRcdCQuZG9uZSh7IHN0YXR1czogJHJlc3BvbnNlLnN0YXR1cywgaGVhZGVyczogJHJlc3BvbnNlLmhlYWRlcnMsIGJvZHk6ICRyZXNwb25zZS5ib2R5IH0pO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi9wcm90b2J1ZlwiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3gtcHJvdG9idWZcIjpcblx0XHRcdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi92bmQuZ29vZ2xlLnByb3RvYnVmXCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24vZ3JwY1wiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL2dycGMrcHJvdG9cIjpcblx0XHRcdFx0XHRcdGNhc2UgXCJhcHBsZWNhdGlvbi9vY3RldC1zdHJlYW1cIjpcblx0XHRcdFx0XHRcdFx0Ly8g6L+U5Zue5LqM6L+b5Yi25pWw5o2uXG5cdFx0XHRcdFx0XHRcdC8vJC5sb2coYCR7JHJlc3BvbnNlLmJvZHlCeXRlcy5ieXRlTGVuZ3RofS0tLSR7JHJlc3BvbnNlLmJvZHlCeXRlcy5idWZmZXIuYnl0ZUxlbmd0aH1gKTtcblx0XHRcdFx0XHRcdFx0JC5kb25lKHsgc3RhdHVzOiAkcmVzcG9uc2Uuc3RhdHVzLCBoZWFkZXJzOiAkcmVzcG9uc2UuaGVhZGVycywgYm9keUJ5dGVzOiAkcmVzcG9uc2UuYm9keUJ5dGVzLmJ1ZmZlci5zbGljZSgkcmVzcG9uc2UuYm9keUJ5dGVzLmJ5dGVPZmZzZXQsICRyZXNwb25zZS5ib2R5Qnl0ZXMuYnl0ZUxlbmd0aCArICRyZXNwb25zZS5ib2R5Qnl0ZXMuYnl0ZU9mZnNldCkgfSk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH0gZWxzZSAkLmRvbmUoJHJlc3BvbnNlKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9O1xuXHRcdFx0Y2FzZSB1bmRlZmluZWQ6IHsgLy8g5peg5Zue5aSN5pWw5o2uXG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fTtcblx0XHR9O1xuXHR9KVxuXG4vKioqKioqKioqKioqKioqKiogRnVuY3Rpb24gKioqKioqKioqKioqKioqKiovXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=