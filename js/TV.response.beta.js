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
/*!*********************************!*\
  !*** ./src/TV.response.beta.js ***!
  \*********************************/
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













const $ = new _ENV_ENV_mjs__WEBPACK_IMPORTED_MODULE_0__["default"](" iRingo: 📺 TV v3.2.3(1) response.beta");
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
const URL = URI.parse($request?.url);
$.log(`⚠ ${$.name}`, `URL: ${JSON.stringify(URL)}`, "");
// 获取连接参数
const METHOD = $request.method, HOST = URL.host, PATH = URL.path, PATHs = URL.paths;
$.log(`⚠ ${$.name}`, `METHOD: ${METHOD}`, "");
// 解析格式
const FORMAT = ($response.headers?.["Content-Type"] ?? $response.headers?.["content-type"])?.split(";")?.[0];
$.log(`⚠ ${$.name}`, `FORMAT: ${FORMAT}`, "");
(async () => {
	const { Settings, Caches, Configs } = (0,_function_setENV_mjs__WEBPACK_IMPORTED_MODULE_2__["default"])("iRingo", "TV", DataBase);
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
					body = JSON.parse($response.body);
					// 主机判断
					switch (HOST) {
						case "uts-api.itunes.apple.com":
							// 路径判断
							switch (PATH) {
								case "uts/v3/configurations":
									const Version = parseInt(URL.query?.v, 10), Platform = URL.query?.pfm, Locale = ($request.headers?.["X-Apple-I-Locale"] ?? $request.headers?.["x-apple-i-locale"])?.split('_')?.[0] ?? "zh";
									if (URL.query.caller !== "wta") { // 不修改caller=wta的configurations数据
										$.log(`⚠ ${$.name}`, `Locale: ${Locale}`, `Platform: ${Platform}`, `Version: ${Version}`, "");
										if (body?.data?.applicationProps) {
											//body.data.applicationProps.requiredParamsMap.WithoutUtsk.locale = "zh_Hans";
											//body.data.applicationProps.requiredParamsMap.Default.locale = "zh_Hans";
											let newTabs = [];
											Settings.Tabs.forEach((type) => {
												if (body.data.applicationProps.tabs.some(Tab => Tab?.type === type)) {
													let tab = body.data.applicationProps.tabs.find(Tab => Tab?.type === type);
													$.log(`🚧 ${$.name}`, `oTab: ${JSON.stringify(tab)}`, "");
													let index = body.data.applicationProps.tabs.findIndex(Tab => Tab?.type === type);
													$.log(`🚧 ${$.name}`, `oIndex: ${index}`, "");
													if (index === 0) newTabs.unshift(tab);
													else newTabs.push(tab);
												} else if (Configs.Tabs.some(Tab => Tab?.type === type)) {
													let tab = Configs.Tabs.find(Tab => Tab?.type === type);
													$.log(`🚧 ${$.name}`, `aTab: ${JSON.stringify(tab)}`, "");
													switch (tab?.destinationType) {
														case "SubTabs":
															tab.subTabs = tab.subTabs.map(subTab => {
																subTab.title = Configs.i18n?.[subTab.type]?.get(Locale) ?? tab.title;
																return subTab;
															});
														case "Target":
														case "Client":
															tab.title = Configs.i18n?.[tab.type]?.get(Locale) ?? tab.title;
															break;
													};
													switch (tab?.type) {
														case "WatchNow":
														case "Originals":
															newTabs.push(tab);
															break;
														case "Store":
															if (Version >= 54) {
																if (Version >= 74) {
																	tab.destinationType = "Target";
																	tab.target = { "id": "tahoma_store", "type": "Root", "url": "https://tv.apple.com/store" };
																	tab.universalLinks = ["https://tv.apple.com/store", "https://tv.apple.com/movies", "https://tv.apple.com/tv-shows"];
																	delete tab?.subTabs;
																}
																newTabs.push(tab);
															};
															break;
														case "Movies":
														case "TV":
															if (Version < 54) tab.secondaryEnabled = true;
															if (Version < 54) newTabs.push(tab);
															break;
														case "MLS":
															if (Version >= 64) {
																switch (Platform) {
																	case "atv":
																	case "ipad":
																	case "appletv":
																	case "desktop":
																	default:
																		newTabs.push(tab);
																	case "iphone":
																		return;
																};
															};
															break;
														case "Sports":
														case "Kids":
															if (Version < 54) tab.secondaryEnabled = true;
															if (Version < 54) newTabs.push(tab);
															else {
																switch (Platform) {
																	case "atv":
																	case "ipad":
																	case "appletv":
																	case "desktop":
																	default:
																		newTabs.push(tab);
																		break;
																	case "iphone":
																		break;;
																};
															};
															break;
														case "Search":
															if (Version >= 74) tab.target.id = "tahoma_searchlanding";
															newTabs.push(tab);
															break;
														case "ChannelsAndApps":
															if (Version >= 74) {
																switch (Platform) {
																	case "atv":
																	case "ipad":
																	case "appletv":
																		newTabs.push(tab);
																		break;
																	case "desktop":
																	case "iphone":
																	default:
																		break;
																};
															};
															break;
														case "Library":
														default:
															newTabs.push(tab);
															break;
													};
												};
											});
											$.log(`🚧 ${$.name}`, `newTabs: ${JSON.stringify(newTabs)}`, "");
											body.data.applicationProps.tabs = newTabs;
											/*
											body.data.applicationProps.tabs = Configs.Tabs.map((tab, index) => {
												if (Settings.Tabs.includes(tab?.type)) {
													tab = body.data.applicationProps.tabs.find(Tab => Tab?.type === tab?.type);
													$.log(JSON.stringify(tab));
													if (!tab) tab = Configs.Tabs.find(Tab => Tab?.type === tab?.type);
												} else {
													tab = Configs.Tabs.find(Tab => Tab?.type === tab?.type);
													body.data.applicationProps.tabs.splice(index, 0,);
												};
											});
											body.data.applicationProps.tabs = Configs.Tabs.map(tab => {
												if (Settings.Tabs.includes(tab?.type)) {
													switch (tab?.destinationType) {
														case "SubTabs":
															tab.subTabs = tab.subTabs.map(subTab => {
																subTab.title = Configs.i18n?.[subTab.type]?.get(Locale) ?? tab.title;
																return subTab;
															});
														case "Target":
														case "Client":
															tab.title = Configs.i18n?.[tab.type]?.get(Locale) ?? tab.title;
															break;
													};
													switch (tab?.type) {
														case "WatchNow":
														case "Originals":
															return tab;
														case "Store":
															if (Version >= 54) {
																if (Version >= 74) {
																	tab.destinationType = "Target";
																	tab.target = { "id": "tahoma_store", "type": "Root", "url": "https://tv.apple.com/store" };
																	tab.universalLinks = ["https://tv.apple.com/store", "https://tv.apple.com/movies", "https://tv.apple.com/tv-shows"];
																	delete tab?.subTabs;
																}
																return tab;
															} else return;
														case "Movies":
														case "TV":
															if (Version < 54) tab.secondaryEnabled = true;
															if (Version < 54) return tab;
															else return;
														case "MLS":
															if (Version >= 64) {
																switch (Platform) {
																	case "atv":
																	case "ipad":
																	case "appletv":
																	case "desktop":
																	default:
																		return tab;
																	case "iphone":
																		return;
																};
															} else return;
														case "Sports":
														case "Kids":
															if (Version < 54) tab.secondaryEnabled = true;
															if (Version < 54) return tab;
															else {
																switch (Platform) {
																	case "atv":
																	case "ipad":
																	case "appletv":
																	case "desktop":
																	default:
																		return tab;
																	case "iphone":
																		return;
																};
															};
														case "Search":
															if (Version >= 74) tab.target.id = "tahoma_searchlanding";
															return tab;
														case "Library":
														default:
															return tab;
													};
												};
											}).filter(Boolean);
											*/
											//body.data.applicationProps.tabs = createTabsGroup("Tabs", caller, platform, locale, region);
											//body.data.applicationProps.tvAppEnabledInStorefront = true;
											//body.data.applicationProps.enabledClientFeatures = (URL.query?.v > 53) ? [{ "domain": "tvapp", "name": "snwpcr" }, { "domain": "tvapp", "name": "store_tab" }]
											//	: [{ "domain": "tvapp", "name": "expanse" }, { "domain": "tvapp", "name": "syndication" }, { "domain": "tvapp", "name": "snwpcr" }];
											//body.data.applicationProps.storefront.localesSupported = ["zh_Hans", "zh_Hant", "yue-Hant", "en_US", "en_GB"];
											//body.data.applicationProps.storefront.storefrontId = 143470;
											//body.data.applicationProps.featureEnablers["topShelf"] = true;
											//body.data.applicationProps.featureEnablers["sports"] = true;
											//body.data.applicationProps.featureEnablers["sportsFavorites"] = true;
											//body.data.applicationProps.featureEnablers["unw"] = true;
											//body.data.applicationProps.featureEnablers["imageBasedSubtitles"] = false;
											//body.data.applicationProps.featureEnablers["ageVerification"] = false;
											//body.data.applicationProps.featureEnablers["seasonTitles"] = false;
											//body.data.userProps.activeUser = true;
											//body.data.userProps.utsc = "1:18943";
											//body.data.userProps.country = country;
											//body.data.userProps.gac = true;
										};
									};
									break;
								case "uts/v3/user/settings":
									break;
								case "uts/v3/canvases/Roots/watchNow": // 立即观看
								case "uts/v3/canvases/Channels/tvs.sbd.4000": // Apple TV+
								case "uts/v3/canvases/Channels/tvs.sbd.7000": // MLS Season Pass
									let shelves = body?.data?.canvas?.shelves;
									if (shelves) {
										shelves = shelves.map(shelf => {
											if (shelf?.items) {
												shelf.items = shelf.items.map(item => {
													let playable = item?.playable || item?.videos?.shelfVideoTall;
													let playables = item?.playables;
													if (playable) playable = setPlayable(playable, Settings?.HLSUrl, Settings?.ServerUrl);
													if (playables) Object.keys(playables).forEach(playable => playables[playable] = setPlayable(playables[playable], Settings?.HLSUrl, Settings?.ServerUrl));
													return item;
												});
											};
											return shelf;
										});
										body.data.canvas.shelves = shelves;
									};
									break;
								case "uts/v3/shelves/uts.col.UpNext": // 待播清單
								case "uts/v3/shelves/uts.col.ChannelUpNext.tvs.sbd.4000": // Apple TV+ 待播節目
								case "uts/v3/shelves/uts.col.ChannelUpNext.tvs.sbd.7000": // MLS Season Pass 待播節目
								case "uts/v3/shelves/edt.col.62d7229e-d9a1-4f00-98e5-458c11ed3938": // 精選推薦
									let shelf = body?.data?.shelf;
									if (shelf?.items) {
										shelf.items = shelf.items.map(item => {
											let playable = item?.playable || item?.videos?.shelfVideoTall;
											let playables = item?.playables;
											if (playable) playable = setPlayable(playable, Settings?.HLSUrl, Settings?.ServerUrl);
											if (playables) Object.keys(playables).forEach(playable => playables[playable] = setPlayable(playables[playable], Settings?.HLSUrl, Settings?.ServerUrl));
											return item;
										});
									};
									break;
								default:
									switch (PATHs[0]) {
										case "uts":
											switch (PATHs[1]) {
												case "v3":
													switch (PATHs[2]) {
														case "movies": // uts/v3/movies/
														case "shows": // uts/v3/shows/
														case "sporting-events": // uts/v3/sporting-events/
															let shelves = body?.data?.canvas?.shelves;
															let backgroundVideo = body?.data?.content?.backgroundVideo;
															let playables = body?.data?.playables;
															if (shelves) {
																shelves = shelves.map(shelf => {
																	if (shelf?.items) {
																		shelf.items = shelf.items.map(item => {
																			let playable = item?.playable || item?.videos?.shelfVideoTall;
																			let playables = item?.playables;
																			if (playable) playable = setPlayable(playable, Settings?.HLSUrl, Settings?.ServerUrl);
																			if (playables) Object.keys(playables).forEach(playable => playables[playable] = setPlayable(playables[playable], Settings?.HLSUrl, Settings?.ServerUrl));
																			return item;
																		});
																	};
																	return shelf;
																});
																body.data.canvas.shelves = shelves;
															};
															if (backgroundVideo) backgroundVideo = setPlayable(backgroundVideo, Settings?.HLSUrl, Settings?.ServerUrl);
															if (playables) Object.keys(playables).forEach(playable => playables[playable] = setPlayable(playables[playable], Settings?.HLSUrl, Settings?.ServerUrl));
															break;
													};
													break;
											};
											break;
									};
									//if (PATH.includes("uts/v3/canvases/Channels/")) $response.body = await getData("View", Settings, Configs);
									//else if (PATH.includes("uts/v2/brands/")) $response.body = await getData("View", Settings, Configs);
									//else if (PATH.includes("uts/v3/movies/")) $response.body = await getData("View", Settings, Configs);
									//else if (PATH.includes("uts/v3/shows/")) $response.body = await getData("View", Settings, Configs);
									//else if (PATH.includes("uts/v3/shelves/")) $response.body = await getData("View", Settings, Configs);
									//else if (PATH.includes("uts/v3/playables/")) $response.body = await getData("View", Settings, Configs);
									break;
							};
							break;
						case "umc-tempo-api.apple.com":
							// 路径判断
							switch (PATH) {
								case "v3/register":
								case "v3/channels/scoreboard":
								case "v3/channels/scoreboard/":
									$.log(JSON.stringify(body));
									//body.channels.storeFront = "UNITED_STATES";
									//body.channels.storeFront = "TAIWAN";
									break;
								default:
									//if (PATH.includes("v3/register/")) Type = "Sports";
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
function setPlayable(playable, HLSUrl, ServerUrl) {
	$.log(`☑️ ${$.name}, Set Playable Content`, "");
	let assets = playable?.assets;
	let itunesMediaApiData = playable?.itunesMediaApiData;
	if (assets) assets = setUrl(assets, HLSUrl, ServerUrl);
	if (itunesMediaApiData?.movieClips) itunesMediaApiData.movieClips = itunesMediaApiData.movieClips.map(movieClip => setUrl(movieClip, HLSUrl, ServerUrl));
	if (itunesMediaApiData?.offers) itunesMediaApiData.offers = itunesMediaApiData.offers.map(offer => setUrl(offer, HLSUrl, ServerUrl));
	if (itunesMediaApiData?.personalizedOffers) itunesMediaApiData.personalizedOffers = itunesMediaApiData.personalizedOffers.map(personalizedOffer => setUrl(personalizedOffer, HLSUrl, ServerUrl));
	$.log(`✅ ${$.name}, Set Playable Content`, "");
	return playable;

	function setUrl(asset, HLSUrl, ServerUrl) {
		$.log(`☑️ ${$.name}, Set Url`, "");
		if (asset?.hlsUrl) {
			let hlsUrl = URI.parse(asset.hlsUrl);
			switch (hlsUrl.path) {
				case "WebObjects/MZPlay.woa/hls/playlist.m3u8":
					//hlsUrl.host = HLSUrl || "play.itunes.apple.com";
					break;
				case "WebObjects/MZPlayLocal.woa/hls/subscription/playlist.m3u8":
					hlsUrl.host = HLSUrl || "play-edge.itunes.apple.com";
					break;
				case "WebObjects/MZPlay.woa/hls/workout/playlist.m3u8":
					//hlsUrl.host = HLSUrl || "play.itunes.apple.com";
					break;
			};
			asset.hlsUrl = URI.stringify(hlsUrl);
		};
		if (asset?.fpsKeyServerUrl) {
			let fpsKeyServerUrl = URI.parse(asset.fpsKeyServerUrl);
			fpsKeyServerUrl.host = ServerUrl || "play.itunes.apple.com";
			asset.fpsKeyServerUrl = URI.stringify(fpsKeyServerUrl);
		};
		if (asset?.fpsNonceServerUrl) {
			let fpsNonceServerUrl = URI.parse(asset.fpsNonceServerUrl);
			fpsNonceServerUrl.host = ServerUrl || "play.itunes.apple.com";
			asset.fpsNonceServerUrl = URI.stringify(fpsNonceServerUrl);
		};
		$.log(`✅ ${$.name}, Set Url`, "");
		return asset;
	};
};

async function getData(type, settings, database) {
	$.log(`⚠ ${$.name}, Get View Data`, "");
	let CCs = [settings.CountryCode[type], "US", "GB"].flat(Infinity);
	$.log(`CCs=${CCs}`)
	//查询是否有符合语言的字幕
	let data = [];
	for await (const CC of CCs) {
		let request = {
			"url": $request.url,
			"headers": $request.headers
		}
		request.url = URI.parse(request.url);
		request.url.query.sf = database.Storefront[CC]
		$.log(`sf=${request.url.query.sf}`)
		request.url.query.locale = database.Locale[CC]
		$.log(`locale=${request.url.query.locale}`)
		request.url = URI.stringify(request.url)
		$.log(`request.url=${request.url}`)
		request.headers["X-Surge-Skip-Scripting"] = "true"
		data = await $.http.get(request).then(data => data);
		$.log(`data=${JSON.stringify(data)}`)
		if (data.statusCode === 200 || data.status === 200 ) break;
	};
	$.log(`🎉 ${$.name}, 调试信息`, "Get EXT-X-MEDIA Data", `datas: ${JSON.stringify(data.body)}`, "");
	return data.body
};

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVFYucmVzcG9uc2UuYmV0YS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBZTtBQUNmO0FBQ0EsaUJBQWlCLEtBQUs7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsVUFBVTtBQUMvQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxjQUFjLEtBQUs7QUFDbkIsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixLQUFLO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLGVBQWUsK0JBQStCO0FBQzlDO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBLEtBQUs7QUFDTCxJQUFJO0FBQ0o7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUVBQXFFO0FBQ3JFO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CO0FBQ3BCLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxrQ0FBa0M7QUFDbEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0EsU0FBUyw4Q0FBOEM7QUFDdkQ7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsVUFBVSw0Q0FBNEM7QUFDdEQ7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBLGVBQWUscUNBQXFDO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLG1DQUFtQztBQUNuQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQSxTQUFTLDhDQUE4QztBQUN2RDtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxtQkFBbUI7QUFDL0I7QUFDQTtBQUNBLGNBQWMsbURBQW1EO0FBQ2pFO0FBQ0E7QUFDQTtBQUNBLFNBQVMsNENBQTRDO0FBQ3JEO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxjQUFjLHFDQUFxQztBQUNuRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQixZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQkFBK0Isb0hBQW9IO0FBQ25KLCtCQUErQiwwSEFBMEg7QUFDeko7QUFDQSxZQUFZLEdBQUc7QUFDZixZQUFZLEdBQUc7QUFDZixZQUFZLEdBQUc7QUFDZixZQUFZLEdBQUc7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QixVQUFVO0FBQ2pDO0FBQ0E7QUFDQSxzQkFBc0IsVUFBVTtBQUNoQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLGNBQWM7QUFDZDtBQUNBO0FBQ0EscUJBQXFCLFVBQVUsV0FBVyxVQUFVO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQixZQUFZLE9BQU87QUFDbkIsWUFBWSxRQUFRO0FBQ3BCLGFBQWEsVUFBVTtBQUN2QjtBQUNBO0FBQ0EsbUJBQW1CLFVBQVU7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsVUFBVSwwQ0FBMEMsYUFBYSxlQUFlLHNCQUFzQjtBQUN6SDtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQixVQUFVO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsVUFBVSw2Q0FBNkMsZ0JBQWdCLGtCQUFrQix5QkFBeUI7QUFDckk7QUFDQTtBQUNBLGtCQUFrQiwyQ0FBMkMsMkNBQTJDO0FBQ3hHO0FBQ0EsbUJBQW1CLFVBQVUsMENBQTBDLGFBQWEsZUFBZSxzQkFBc0I7QUFDekg7QUFDQSxzQkFBc0I7QUFDdEIscUJBQXFCO0FBQ3JCO0FBQ0Esb0JBQW9CO0FBQ3BCO0FBQ0EsbUJBQW1CLFVBQVUsbURBQW1ELHNCQUFzQixzQkFBc0IsK0JBQStCO0FBQzNKO0FBQ0Esb0JBQW9CLFVBQVUsc0JBQXNCLElBQUksSUFBSSxhQUFhLE1BQU0sSUFBSSxJQUFJLHNCQUFzQjtBQUM3Ryx5RUFBeUU7QUFDekU7QUFDQSw2RkFBNkY7QUFDN0YsNENBQTRDO0FBQzVDO0FBQ0E7QUFDQSxHQUFHO0FBQ0gsa0JBQWtCLFVBQVUsd0NBQXdDLG9CQUFvQixlQUFlLHNCQUFzQjtBQUM3SDtBQUNBOztBQUVBO0FBQ0EsZ0NBQWdDLDhGQUE4RjtBQUM5SCx3QkFBd0IsbUJBQW1CLGNBQWMsa0ZBQWtGO0FBQzNJLHlCQUF5Qiw2REFBNkQ7QUFDdEY7O0FBRU87QUFDUDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxzQ0FBc0MsWUFBWTtBQUNsRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ3R0QmU7QUFDZjtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0I7QUFDaEI7O0FBRUE7QUFDQTtBQUNBO0FBQ0EscURBQXFEO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7OztBQzlCQTtBQUNBO0FBQ0E7O0FBRWtDO0FBQ2xDLGNBQWMsb0RBQUk7O0FBRWxCO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixXQUFXLE9BQU87QUFDbEIsV0FBVyxRQUFRO0FBQ25CLFlBQVksVUFBVTtBQUN0QjtBQUNlO0FBQ2YsYUFBYSxPQUFPO0FBQ3BCLE9BQU8sNEJBQTRCO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxPQUFPLGdCQUFnQixnQkFBZ0Isa0JBQWtCLHlCQUF5QjtBQUM5RjtBQUNBLGNBQWMsT0FBTyxjQUFjLGNBQWMsZ0JBQWdCLHVCQUF1QjtBQUN4RjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUM5QkE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0Esc0RBQXNEO1dBQ3RELHNDQUFzQyxpRUFBaUU7V0FDdkc7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOzs7OztXQ3pCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ05BO0FBQ0E7QUFDQTs7QUFFaUM7QUFDQTtBQUNVOztBQUVRO0FBQ0U7QUFDUjtBQUNnQjtBQUNoQjtBQUNZO0FBQ2hCOztBQUV6QyxjQUFjLG9EQUFJO0FBQ2xCLGdCQUFnQixvREFBSTtBQUNwQjtBQUNBLFlBQVksNE9BQU87QUFDbkIsYUFBYSwrT0FBUTtBQUNyQixTQUFTLG1PQUFJO0FBQ2IsaUJBQWlCLDJQQUFZO0FBQzdCLFNBQVMsbU9BQUk7QUFDYixlQUFlLHFQQUFVO0FBQ3pCLE9BQU8sNk5BQUU7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU8sV0FBVyxvQkFBb0I7QUFDakQ7QUFDQTtBQUNBLFdBQVcsT0FBTyxjQUFjLE9BQU87QUFDdkM7QUFDQSxxR0FBcUc7QUFDckcsV0FBVyxPQUFPLGNBQWMsT0FBTztBQUN2QztBQUNBLFNBQVMsNEJBQTRCLEVBQUUsZ0VBQU07QUFDN0MsWUFBWSxPQUFPLHVCQUF1QixpQkFBaUI7QUFDM0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsT0FBTyxZQUFZLHFCQUFxQjtBQUMzRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLE9BQU8sWUFBWSxxQkFBcUI7QUFDM0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixPQUFPLFlBQVkscUJBQXFCO0FBQzNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQztBQUMzQyxxQkFBcUIsT0FBTyxjQUFjLE9BQU8sZ0JBQWdCLFNBQVMsZUFBZSxRQUFRO0FBQ2pHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCLE9BQU8sWUFBWSxvQkFBb0I7QUFDaEU7QUFDQSx5QkFBeUIsT0FBTyxjQUFjLE1BQU07QUFDcEQ7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBLHlCQUF5QixPQUFPLFlBQVksb0JBQW9CO0FBQ2hFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQztBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaLHVCQUF1QixPQUFPLGVBQWUsd0JBQXdCO0FBQ3JFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQztBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQSx5RkFBeUYscUNBQXFDLElBQUksd0NBQXdDO0FBQzFLLG1CQUFtQixzQ0FBc0MsSUFBSSwwQ0FBMEMsSUFBSSxxQ0FBcUM7QUFDaEo7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQjtBQUNuQjtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZCw2R0FBNkc7QUFDN0csZ0JBQWdCLE9BQU8sb0NBQW9DLE9BQU87QUFDbEUsa0JBQWtCLE9BQU8sMEJBQTBCLDBCQUEwQjtBQUM3RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0Isc0RBQXNEO0FBQ3RFO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQiw0RUFBNEU7QUFDNUY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQiwrQkFBK0IsS0FBSyxzQ0FBc0M7QUFDNUYsZ0JBQWdCLG9NQUFvTTtBQUNwTjtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0EsRUFBRTs7QUFFRjtBQUNBO0FBQ0EsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksT0FBTztBQUNuQjs7QUFFQTtBQUNBLGNBQWMsT0FBTztBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxZQUFZLE9BQU87QUFDbkI7QUFDQSxjQUFjLElBQUk7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYyxxQkFBcUI7QUFDbkM7QUFDQSxrQkFBa0IseUJBQXlCO0FBQzNDO0FBQ0EsdUJBQXVCLFlBQVk7QUFDbkM7QUFDQTtBQUNBLGdCQUFnQixxQkFBcUI7QUFDckM7QUFDQTtBQUNBLGFBQWEsT0FBTywyQ0FBMkMsMEJBQTBCO0FBQ3pGO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9pcmluZ28vLi9zcmMvRU5WL0VOVi5tanMiLCJ3ZWJwYWNrOi8vaXJpbmdvLy4vc3JjL1VSSS9VUkkubWpzIiwid2VicGFjazovL2lyaW5nby8uL3NyYy9mdW5jdGlvbi9zZXRFTlYubWpzIiwid2VicGFjazovL2lyaW5nby93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9pcmluZ28vd2VicGFjay9ydW50aW1lL2NyZWF0ZSBmYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vaXJpbmdvL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9pcmluZ28vd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9pcmluZ28vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9pcmluZ28vLi9zcmMvVFYucmVzcG9uc2UuYmV0YS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBjbGFzcyBFTlYge1xuXHRjb25zdHJ1Y3RvcihuYW1lLCBvcHRzKSB7XG5cdFx0dGhpcy5uYW1lID0gYCR7bmFtZX0sIEVOViB2MS4wLjBgXG5cdFx0dGhpcy5odHRwID0gbmV3IEh0dHAodGhpcylcblx0XHR0aGlzLmRhdGEgPSBudWxsXG5cdFx0dGhpcy5kYXRhRmlsZSA9ICdib3guZGF0J1xuXHRcdHRoaXMubG9ncyA9IFtdXG5cdFx0dGhpcy5pc011dGUgPSBmYWxzZVxuXHRcdHRoaXMuaXNOZWVkUmV3cml0ZSA9IGZhbHNlXG5cdFx0dGhpcy5sb2dTZXBhcmF0b3IgPSAnXFxuJ1xuXHRcdHRoaXMuZW5jb2RpbmcgPSAndXRmLTgnXG5cdFx0dGhpcy5zdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuXHRcdE9iamVjdC5hc3NpZ24odGhpcywgb3B0cylcblx0XHR0aGlzLmxvZygnJywgYPCfj4EgJHt0aGlzLm5hbWV9LCDlvIDlp4shYClcblx0fVxuXG5cdHBsYXRmb3JtKCkge1xuXHRcdGlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mICRlbnZpcm9ubWVudCAmJiAkZW52aXJvbm1lbnRbJ3N1cmdlLXZlcnNpb24nXSlcblx0XHRcdHJldHVybiAnU3VyZ2UnXG5cdFx0aWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgJGVudmlyb25tZW50ICYmICRlbnZpcm9ubWVudFsnc3Rhc2gtdmVyc2lvbiddKVxuXHRcdFx0cmV0dXJuICdTdGFzaCdcblx0XHRpZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBtb2R1bGUgJiYgISFtb2R1bGUuZXhwb3J0cykgcmV0dXJuICdOb2RlLmpzJ1xuXHRcdGlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mICR0YXNrKSByZXR1cm4gJ1F1YW50dW11bHQgWCdcblx0XHRpZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiAkbG9vbikgcmV0dXJuICdMb29uJ1xuXHRcdGlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mICRyb2NrZXQpIHJldHVybiAnU2hhZG93cm9ja2V0J1xuXHR9XG5cblx0aXNOb2RlKCkge1xuXHRcdHJldHVybiAnTm9kZS5qcycgPT09IHRoaXMucGxhdGZvcm0oKVxuXHR9XG5cblx0aXNRdWFuWCgpIHtcblx0XHRyZXR1cm4gJ1F1YW50dW11bHQgWCcgPT09IHRoaXMucGxhdGZvcm0oKVxuXHR9XG5cblx0aXNTdXJnZSgpIHtcblx0XHRyZXR1cm4gJ1N1cmdlJyA9PT0gdGhpcy5wbGF0Zm9ybSgpXG5cdH1cblxuXHRpc0xvb24oKSB7XG5cdFx0cmV0dXJuICdMb29uJyA9PT0gdGhpcy5wbGF0Zm9ybSgpXG5cdH1cblxuXHRpc1NoYWRvd3JvY2tldCgpIHtcblx0XHRyZXR1cm4gJ1NoYWRvd3JvY2tldCcgPT09IHRoaXMucGxhdGZvcm0oKVxuXHR9XG5cblx0aXNTdGFzaCgpIHtcblx0XHRyZXR1cm4gJ1N0YXNoJyA9PT0gdGhpcy5wbGF0Zm9ybSgpXG5cdH1cblxuXHR0b09iaihzdHIsIGRlZmF1bHRWYWx1ZSA9IG51bGwpIHtcblx0XHR0cnkge1xuXHRcdFx0cmV0dXJuIEpTT04ucGFyc2Uoc3RyKVxuXHRcdH0gY2F0Y2gge1xuXHRcdFx0cmV0dXJuIGRlZmF1bHRWYWx1ZVxuXHRcdH1cblx0fVxuXG5cdHRvU3RyKG9iaiwgZGVmYXVsdFZhbHVlID0gbnVsbCkge1xuXHRcdHRyeSB7XG5cdFx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkob2JqKVxuXHRcdH0gY2F0Y2gge1xuXHRcdFx0cmV0dXJuIGRlZmF1bHRWYWx1ZVxuXHRcdH1cblx0fVxuXG5cdGdldGpzb24oa2V5LCBkZWZhdWx0VmFsdWUpIHtcblx0XHRsZXQganNvbiA9IGRlZmF1bHRWYWx1ZVxuXHRcdGNvbnN0IHZhbCA9IHRoaXMuZ2V0ZGF0YShrZXkpXG5cdFx0aWYgKHZhbCkge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0anNvbiA9IEpTT04ucGFyc2UodGhpcy5nZXRkYXRhKGtleSkpXG5cdFx0XHR9IGNhdGNoIHsgfVxuXHRcdH1cblx0XHRyZXR1cm4ganNvblxuXHR9XG5cblx0c2V0anNvbih2YWwsIGtleSkge1xuXHRcdHRyeSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5zZXRkYXRhKEpTT04uc3RyaW5naWZ5KHZhbCksIGtleSlcblx0XHR9IGNhdGNoIHtcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdH1cblx0fVxuXG5cdGdldFNjcmlwdCh1cmwpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdHRoaXMuZ2V0KHsgdXJsIH0sIChlcnJvciwgcmVzcG9uc2UsIGJvZHkpID0+IHJlc29sdmUoYm9keSkpXG5cdFx0fSlcblx0fVxuXG5cdHJ1blNjcmlwdChzY3JpcHQsIHJ1bk9wdHMpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdGxldCBodHRwYXBpID0gdGhpcy5nZXRkYXRhKCdAY2hhdnlfYm94anNfdXNlckNmZ3MuaHR0cGFwaScpXG5cdFx0XHRodHRwYXBpID0gaHR0cGFwaSA/IGh0dHBhcGkucmVwbGFjZSgvXFxuL2csICcnKS50cmltKCkgOiBodHRwYXBpXG5cdFx0XHRsZXQgaHR0cGFwaV90aW1lb3V0ID0gdGhpcy5nZXRkYXRhKFxuXHRcdFx0XHQnQGNoYXZ5X2JveGpzX3VzZXJDZmdzLmh0dHBhcGlfdGltZW91dCdcblx0XHRcdClcblx0XHRcdGh0dHBhcGlfdGltZW91dCA9IGh0dHBhcGlfdGltZW91dCA/IGh0dHBhcGlfdGltZW91dCAqIDEgOiAyMFxuXHRcdFx0aHR0cGFwaV90aW1lb3V0ID1cblx0XHRcdFx0cnVuT3B0cyAmJiBydW5PcHRzLnRpbWVvdXQgPyBydW5PcHRzLnRpbWVvdXQgOiBodHRwYXBpX3RpbWVvdXRcblx0XHRcdGNvbnN0IFtrZXksIGFkZHJdID0gaHR0cGFwaS5zcGxpdCgnQCcpXG5cdFx0XHRjb25zdCBvcHRzID0ge1xuXHRcdFx0XHR1cmw6IGBodHRwOi8vJHthZGRyfS92MS9zY3JpcHRpbmcvZXZhbHVhdGVgLFxuXHRcdFx0XHRib2R5OiB7XG5cdFx0XHRcdFx0c2NyaXB0X3RleHQ6IHNjcmlwdCxcblx0XHRcdFx0XHRtb2NrX3R5cGU6ICdjcm9uJyxcblx0XHRcdFx0XHR0aW1lb3V0OiBodHRwYXBpX3RpbWVvdXRcblx0XHRcdFx0fSxcblx0XHRcdFx0aGVhZGVyczogeyAnWC1LZXknOiBrZXksICdBY2NlcHQnOiAnKi8qJyB9LFxuXHRcdFx0XHR0aW1lb3V0OiBodHRwYXBpX3RpbWVvdXRcblx0XHRcdH1cblx0XHRcdHRoaXMucG9zdChvcHRzLCAoZXJyb3IsIHJlc3BvbnNlLCBib2R5KSA9PiByZXNvbHZlKGJvZHkpKVxuXHRcdH0pLmNhdGNoKChlKSA9PiB0aGlzLmxvZ0VycihlKSlcblx0fVxuXG5cdGxvYWRkYXRhKCkge1xuXHRcdGlmICh0aGlzLmlzTm9kZSgpKSB7XG5cdFx0XHR0aGlzLmZzID0gdGhpcy5mcyA/IHRoaXMuZnMgOiByZXF1aXJlKCdmcycpXG5cdFx0XHR0aGlzLnBhdGggPSB0aGlzLnBhdGggPyB0aGlzLnBhdGggOiByZXF1aXJlKCdwYXRoJylcblx0XHRcdGNvbnN0IGN1ckRpckRhdGFGaWxlUGF0aCA9IHRoaXMucGF0aC5yZXNvbHZlKHRoaXMuZGF0YUZpbGUpXG5cdFx0XHRjb25zdCByb290RGlyRGF0YUZpbGVQYXRoID0gdGhpcy5wYXRoLnJlc29sdmUoXG5cdFx0XHRcdHByb2Nlc3MuY3dkKCksXG5cdFx0XHRcdHRoaXMuZGF0YUZpbGVcblx0XHRcdClcblx0XHRcdGNvbnN0IGlzQ3VyRGlyRGF0YUZpbGUgPSB0aGlzLmZzLmV4aXN0c1N5bmMoY3VyRGlyRGF0YUZpbGVQYXRoKVxuXHRcdFx0Y29uc3QgaXNSb290RGlyRGF0YUZpbGUgPVxuXHRcdFx0XHQhaXNDdXJEaXJEYXRhRmlsZSAmJiB0aGlzLmZzLmV4aXN0c1N5bmMocm9vdERpckRhdGFGaWxlUGF0aClcblx0XHRcdGlmIChpc0N1ckRpckRhdGFGaWxlIHx8IGlzUm9vdERpckRhdGFGaWxlKSB7XG5cdFx0XHRcdGNvbnN0IGRhdFBhdGggPSBpc0N1ckRpckRhdGFGaWxlXG5cdFx0XHRcdFx0PyBjdXJEaXJEYXRhRmlsZVBhdGhcblx0XHRcdFx0XHQ6IHJvb3REaXJEYXRhRmlsZVBhdGhcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRyZXR1cm4gSlNPTi5wYXJzZSh0aGlzLmZzLnJlYWRGaWxlU3luYyhkYXRQYXRoKSlcblx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdHJldHVybiB7fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgcmV0dXJuIHt9XG5cdFx0fSBlbHNlIHJldHVybiB7fVxuXHR9XG5cblx0d3JpdGVkYXRhKCkge1xuXHRcdGlmICh0aGlzLmlzTm9kZSgpKSB7XG5cdFx0XHR0aGlzLmZzID0gdGhpcy5mcyA/IHRoaXMuZnMgOiByZXF1aXJlKCdmcycpXG5cdFx0XHR0aGlzLnBhdGggPSB0aGlzLnBhdGggPyB0aGlzLnBhdGggOiByZXF1aXJlKCdwYXRoJylcblx0XHRcdGNvbnN0IGN1ckRpckRhdGFGaWxlUGF0aCA9IHRoaXMucGF0aC5yZXNvbHZlKHRoaXMuZGF0YUZpbGUpXG5cdFx0XHRjb25zdCByb290RGlyRGF0YUZpbGVQYXRoID0gdGhpcy5wYXRoLnJlc29sdmUoXG5cdFx0XHRcdHByb2Nlc3MuY3dkKCksXG5cdFx0XHRcdHRoaXMuZGF0YUZpbGVcblx0XHRcdClcblx0XHRcdGNvbnN0IGlzQ3VyRGlyRGF0YUZpbGUgPSB0aGlzLmZzLmV4aXN0c1N5bmMoY3VyRGlyRGF0YUZpbGVQYXRoKVxuXHRcdFx0Y29uc3QgaXNSb290RGlyRGF0YUZpbGUgPVxuXHRcdFx0XHQhaXNDdXJEaXJEYXRhRmlsZSAmJiB0aGlzLmZzLmV4aXN0c1N5bmMocm9vdERpckRhdGFGaWxlUGF0aClcblx0XHRcdGNvbnN0IGpzb25kYXRhID0gSlNPTi5zdHJpbmdpZnkodGhpcy5kYXRhKVxuXHRcdFx0aWYgKGlzQ3VyRGlyRGF0YUZpbGUpIHtcblx0XHRcdFx0dGhpcy5mcy53cml0ZUZpbGVTeW5jKGN1ckRpckRhdGFGaWxlUGF0aCwganNvbmRhdGEpXG5cdFx0XHR9IGVsc2UgaWYgKGlzUm9vdERpckRhdGFGaWxlKSB7XG5cdFx0XHRcdHRoaXMuZnMud3JpdGVGaWxlU3luYyhyb290RGlyRGF0YUZpbGVQYXRoLCBqc29uZGF0YSlcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuZnMud3JpdGVGaWxlU3luYyhjdXJEaXJEYXRhRmlsZVBhdGgsIGpzb25kYXRhKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGxvZGFzaF9nZXQoc291cmNlLCBwYXRoLCBkZWZhdWx0VmFsdWUgPSB1bmRlZmluZWQpIHtcblx0XHRjb25zdCBwYXRocyA9IHBhdGgucmVwbGFjZSgvXFxbKFxcZCspXFxdL2csICcuJDEnKS5zcGxpdCgnLicpXG5cdFx0bGV0IHJlc3VsdCA9IHNvdXJjZVxuXHRcdGZvciAoY29uc3QgcCBvZiBwYXRocykge1xuXHRcdFx0cmVzdWx0ID0gT2JqZWN0KHJlc3VsdClbcF1cblx0XHRcdGlmIChyZXN1bHQgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRyZXR1cm4gZGVmYXVsdFZhbHVlXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHRcblx0fVxuXG5cdGxvZGFzaF9zZXQob2JqLCBwYXRoLCB2YWx1ZSkge1xuXHRcdGlmIChPYmplY3Qob2JqKSAhPT0gb2JqKSByZXR1cm4gb2JqXG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KHBhdGgpKSBwYXRoID0gcGF0aC50b1N0cmluZygpLm1hdGNoKC9bXi5bXFxdXSsvZykgfHwgW11cblx0XHRwYXRoXG5cdFx0XHQuc2xpY2UoMCwgLTEpXG5cdFx0XHQucmVkdWNlKFxuXHRcdFx0XHQoYSwgYywgaSkgPT5cblx0XHRcdFx0XHRPYmplY3QoYVtjXSkgPT09IGFbY11cblx0XHRcdFx0XHRcdD8gYVtjXVxuXHRcdFx0XHRcdFx0OiAoYVtjXSA9IE1hdGguYWJzKHBhdGhbaSArIDFdKSA+PiAwID09PSArcGF0aFtpICsgMV0gPyBbXSA6IHt9KSxcblx0XHRcdFx0b2JqXG5cdFx0XHQpW3BhdGhbcGF0aC5sZW5ndGggLSAxXV0gPSB2YWx1ZVxuXHRcdHJldHVybiBvYmpcblx0fVxuXG5cdGdldGRhdGEoa2V5KSB7XG5cdFx0bGV0IHZhbCA9IHRoaXMuZ2V0dmFsKGtleSlcblx0XHQvLyDlpoLmnpzku6UgQFxuXHRcdGlmICgvXkAvLnRlc3Qoa2V5KSkge1xuXHRcdFx0Y29uc3QgWywgb2Jqa2V5LCBwYXRoc10gPSAvXkAoLio/KVxcLiguKj8pJC8uZXhlYyhrZXkpXG5cdFx0XHRjb25zdCBvYmp2YWwgPSBvYmprZXkgPyB0aGlzLmdldHZhbChvYmprZXkpIDogJydcblx0XHRcdGlmIChvYmp2YWwpIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRjb25zdCBvYmplZHZhbCA9IEpTT04ucGFyc2Uob2JqdmFsKVxuXHRcdFx0XHRcdHZhbCA9IG9iamVkdmFsID8gdGhpcy5sb2Rhc2hfZ2V0KG9iamVkdmFsLCBwYXRocywgJycpIDogdmFsXG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHR2YWwgPSAnJ1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB2YWxcblx0fVxuXG5cdHNldGRhdGEodmFsLCBrZXkpIHtcblx0XHRsZXQgaXNzdWMgPSBmYWxzZVxuXHRcdGlmICgvXkAvLnRlc3Qoa2V5KSkge1xuXHRcdFx0Y29uc3QgWywgb2Jqa2V5LCBwYXRoc10gPSAvXkAoLio/KVxcLiguKj8pJC8uZXhlYyhrZXkpXG5cdFx0XHRjb25zdCBvYmpkYXQgPSB0aGlzLmdldHZhbChvYmprZXkpXG5cdFx0XHRjb25zdCBvYmp2YWwgPSBvYmprZXlcblx0XHRcdFx0PyBvYmpkYXQgPT09ICdudWxsJ1xuXHRcdFx0XHRcdD8gbnVsbFxuXHRcdFx0XHRcdDogb2JqZGF0IHx8ICd7fSdcblx0XHRcdFx0OiAne30nXG5cdFx0XHR0cnkge1xuXHRcdFx0XHRjb25zdCBvYmplZHZhbCA9IEpTT04ucGFyc2Uob2JqdmFsKVxuXHRcdFx0XHR0aGlzLmxvZGFzaF9zZXQob2JqZWR2YWwsIHBhdGhzLCB2YWwpXG5cdFx0XHRcdGlzc3VjID0gdGhpcy5zZXR2YWwoSlNPTi5zdHJpbmdpZnkob2JqZWR2YWwpLCBvYmprZXkpXG5cdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdGNvbnN0IG9iamVkdmFsID0ge31cblx0XHRcdFx0dGhpcy5sb2Rhc2hfc2V0KG9iamVkdmFsLCBwYXRocywgdmFsKVxuXHRcdFx0XHRpc3N1YyA9IHRoaXMuc2V0dmFsKEpTT04uc3RyaW5naWZ5KG9iamVkdmFsKSwgb2Jqa2V5KVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpc3N1YyA9IHRoaXMuc2V0dmFsKHZhbCwga2V5KVxuXHRcdH1cblx0XHRyZXR1cm4gaXNzdWNcblx0fVxuXG5cdGdldHZhbChrZXkpIHtcblx0XHRzd2l0Y2ggKHRoaXMucGxhdGZvcm0oKSkge1xuXHRcdFx0Y2FzZSAnU3VyZ2UnOlxuXHRcdFx0Y2FzZSAnTG9vbic6XG5cdFx0XHRjYXNlICdTdGFzaCc6XG5cdFx0XHRjYXNlICdTaGFkb3dyb2NrZXQnOlxuXHRcdFx0XHRyZXR1cm4gJHBlcnNpc3RlbnRTdG9yZS5yZWFkKGtleSlcblx0XHRcdGNhc2UgJ1F1YW50dW11bHQgWCc6XG5cdFx0XHRcdHJldHVybiAkcHJlZnMudmFsdWVGb3JLZXkoa2V5KVxuXHRcdFx0Y2FzZSAnTm9kZS5qcyc6XG5cdFx0XHRcdHRoaXMuZGF0YSA9IHRoaXMubG9hZGRhdGEoKVxuXHRcdFx0XHRyZXR1cm4gdGhpcy5kYXRhW2tleV1cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiAodGhpcy5kYXRhICYmIHRoaXMuZGF0YVtrZXldKSB8fCBudWxsXG5cdFx0fVxuXHR9XG5cblx0c2V0dmFsKHZhbCwga2V5KSB7XG5cdFx0c3dpdGNoICh0aGlzLnBsYXRmb3JtKCkpIHtcblx0XHRcdGNhc2UgJ1N1cmdlJzpcblx0XHRcdGNhc2UgJ0xvb24nOlxuXHRcdFx0Y2FzZSAnU3Rhc2gnOlxuXHRcdFx0Y2FzZSAnU2hhZG93cm9ja2V0Jzpcblx0XHRcdFx0cmV0dXJuICRwZXJzaXN0ZW50U3RvcmUud3JpdGUodmFsLCBrZXkpXG5cdFx0XHRjYXNlICdRdWFudHVtdWx0IFgnOlxuXHRcdFx0XHRyZXR1cm4gJHByZWZzLnNldFZhbHVlRm9yS2V5KHZhbCwga2V5KVxuXHRcdFx0Y2FzZSAnTm9kZS5qcyc6XG5cdFx0XHRcdHRoaXMuZGF0YSA9IHRoaXMubG9hZGRhdGEoKVxuXHRcdFx0XHR0aGlzLmRhdGFba2V5XSA9IHZhbFxuXHRcdFx0XHR0aGlzLndyaXRlZGF0YSgpXG5cdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gKHRoaXMuZGF0YSAmJiB0aGlzLmRhdGFba2V5XSkgfHwgbnVsbFxuXHRcdH1cblx0fVxuXG5cdGluaXRHb3RFbnYob3B0cykge1xuXHRcdHRoaXMuZ290ID0gdGhpcy5nb3QgPyB0aGlzLmdvdCA6IHJlcXVpcmUoJ2dvdCcpXG5cdFx0dGhpcy5ja3RvdWdoID0gdGhpcy5ja3RvdWdoID8gdGhpcy5ja3RvdWdoIDogcmVxdWlyZSgndG91Z2gtY29va2llJylcblx0XHR0aGlzLmNramFyID0gdGhpcy5ja2phciA/IHRoaXMuY2tqYXIgOiBuZXcgdGhpcy5ja3RvdWdoLkNvb2tpZUphcigpXG5cdFx0aWYgKG9wdHMpIHtcblx0XHRcdG9wdHMuaGVhZGVycyA9IG9wdHMuaGVhZGVycyA/IG9wdHMuaGVhZGVycyA6IHt9XG5cdFx0XHRpZiAodW5kZWZpbmVkID09PSBvcHRzLmhlYWRlcnMuQ29va2llICYmIHVuZGVmaW5lZCA9PT0gb3B0cy5jb29raWVKYXIpIHtcblx0XHRcdFx0b3B0cy5jb29raWVKYXIgPSB0aGlzLmNramFyXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Z2V0KHJlcXVlc3QsIGNhbGxiYWNrID0gKCkgPT4geyB9KSB7XG5cdFx0ZGVsZXRlIHJlcXVlc3Q/LmhlYWRlcnM/LlsnQ29udGVudC1MZW5ndGgnXVxuXHRcdGRlbGV0ZSByZXF1ZXN0Py5oZWFkZXJzPy5bJ2NvbnRlbnQtbGVuZ3RoJ11cblxuXHRcdHN3aXRjaCAodGhpcy5wbGF0Zm9ybSgpKSB7XG5cdFx0XHRjYXNlICdTdXJnZSc6XG5cdFx0XHRjYXNlICdMb29uJzpcblx0XHRcdGNhc2UgJ1N0YXNoJzpcblx0XHRcdGNhc2UgJ1NoYWRvd3JvY2tldCc6XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRpZiAodGhpcy5pc1N1cmdlKCkgJiYgdGhpcy5pc05lZWRSZXdyaXRlKSB7XG5cdFx0XHRcdFx0dGhpcy5sb2Rhc2hfc2V0KHJlcXVlc3QsICdoZWFkZXJzLlgtU3VyZ2UtU2tpcC1TY3JpcHRpbmcnLCBmYWxzZSlcblx0XHRcdFx0fVxuXHRcdFx0XHQkaHR0cENsaWVudC5nZXQocmVxdWVzdCwgKGVycm9yLCByZXNwb25zZSwgYm9keSkgPT4ge1xuXHRcdFx0XHRcdGlmICghZXJyb3IgJiYgcmVzcG9uc2UpIHtcblx0XHRcdFx0XHRcdHJlc3BvbnNlLmJvZHkgPSBib2R5XG5cdFx0XHRcdFx0XHRyZXNwb25zZS5zdGF0dXNDb2RlID0gcmVzcG9uc2Uuc3RhdHVzID8gcmVzcG9uc2Uuc3RhdHVzIDogcmVzcG9uc2Uuc3RhdHVzQ29kZVxuXHRcdFx0XHRcdFx0cmVzcG9uc2Uuc3RhdHVzID0gcmVzcG9uc2Uuc3RhdHVzQ29kZVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYWxsYmFjayhlcnJvciwgcmVzcG9uc2UsIGJvZHkpXG5cdFx0XHRcdH0pXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdRdWFudHVtdWx0IFgnOlxuXHRcdFx0XHRpZiAodGhpcy5pc05lZWRSZXdyaXRlKSB7XG5cdFx0XHRcdFx0dGhpcy5sb2Rhc2hfc2V0KHJlcXVlc3QsICdvcHRzLmhpbnRzJywgZmFsc2UpXG5cdFx0XHRcdH1cblx0XHRcdFx0JHRhc2suZmV0Y2gocmVxdWVzdCkudGhlbihcblx0XHRcdFx0XHQocmVzcG9uc2UpID0+IHtcblx0XHRcdFx0XHRcdGNvbnN0IHtcblx0XHRcdFx0XHRcdFx0c3RhdHVzQ29kZTogc3RhdHVzLFxuXHRcdFx0XHRcdFx0XHRzdGF0dXNDb2RlLFxuXHRcdFx0XHRcdFx0XHRoZWFkZXJzLFxuXHRcdFx0XHRcdFx0XHRib2R5LFxuXHRcdFx0XHRcdFx0XHRib2R5Qnl0ZXNcblx0XHRcdFx0XHRcdH0gPSByZXNwb25zZVxuXHRcdFx0XHRcdFx0Y2FsbGJhY2soXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdHsgc3RhdHVzLCBzdGF0dXNDb2RlLCBoZWFkZXJzLCBib2R5LCBib2R5Qnl0ZXMgfSxcblx0XHRcdFx0XHRcdFx0Ym9keSxcblx0XHRcdFx0XHRcdFx0Ym9keUJ5dGVzXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQoZXJyb3IpID0+IGNhbGxiYWNrKChlcnJvciAmJiBlcnJvci5lcnJvcikgfHwgJ1VuZGVmaW5lZEVycm9yJylcblx0XHRcdFx0KVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnTm9kZS5qcyc6XG5cdFx0XHRcdGxldCBpY29udiA9IHJlcXVpcmUoJ2ljb252LWxpdGUnKVxuXHRcdFx0XHR0aGlzLmluaXRHb3RFbnYocmVxdWVzdClcblx0XHRcdFx0dGhpcy5nb3QocmVxdWVzdClcblx0XHRcdFx0XHQub24oJ3JlZGlyZWN0JywgKHJlc3BvbnNlLCBuZXh0T3B0cykgPT4ge1xuXHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0aWYgKHJlc3BvbnNlLmhlYWRlcnNbJ3NldC1jb29raWUnXSkge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IGNrID0gcmVzcG9uc2UuaGVhZGVyc1snc2V0LWNvb2tpZSddXG5cdFx0XHRcdFx0XHRcdFx0XHQubWFwKHRoaXMuY2t0b3VnaC5Db29raWUucGFyc2UpXG5cdFx0XHRcdFx0XHRcdFx0XHQudG9TdHJpbmcoKVxuXHRcdFx0XHRcdFx0XHRcdGlmIChjaykge1xuXHRcdFx0XHRcdFx0XHRcdFx0dGhpcy5ja2phci5zZXRDb29raWVTeW5jKGNrLCBudWxsKVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRuZXh0T3B0cy5jb29raWVKYXIgPSB0aGlzLmNramFyXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5sb2dFcnIoZSlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdC8vIHRoaXMuY2tqYXIuc2V0Q29va2llU3luYyhyZXNwb25zZS5oZWFkZXJzWydzZXQtY29va2llJ10ubWFwKENvb2tpZS5wYXJzZSkudG9TdHJpbmcoKSlcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC50aGVuKFxuXHRcdFx0XHRcdFx0KHJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHtcblx0XHRcdFx0XHRcdFx0XHRzdGF0dXNDb2RlOiBzdGF0dXMsXG5cdFx0XHRcdFx0XHRcdFx0c3RhdHVzQ29kZSxcblx0XHRcdFx0XHRcdFx0XHRoZWFkZXJzLFxuXHRcdFx0XHRcdFx0XHRcdHJhd0JvZHlcblx0XHRcdFx0XHRcdFx0fSA9IHJlc3BvbnNlXG5cdFx0XHRcdFx0XHRcdGNvbnN0IGJvZHkgPSBpY29udi5kZWNvZGUocmF3Qm9keSwgdGhpcy5lbmNvZGluZylcblx0XHRcdFx0XHRcdFx0Y2FsbGJhY2soXG5cdFx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0XHR7IHN0YXR1cywgc3RhdHVzQ29kZSwgaGVhZGVycywgcmF3Qm9keSwgYm9keSB9LFxuXHRcdFx0XHRcdFx0XHRcdGJvZHlcblx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdChlcnIpID0+IHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgeyBtZXNzYWdlOiBlcnJvciwgcmVzcG9uc2U6IHJlc3BvbnNlIH0gPSBlcnJcblx0XHRcdFx0XHRcdFx0Y2FsbGJhY2soXG5cdFx0XHRcdFx0XHRcdFx0ZXJyb3IsXG5cdFx0XHRcdFx0XHRcdFx0cmVzcG9uc2UsXG5cdFx0XHRcdFx0XHRcdFx0cmVzcG9uc2UgJiYgaWNvbnYuZGVjb2RlKHJlc3BvbnNlLnJhd0JvZHksIHRoaXMuZW5jb2RpbmcpXG5cdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHQpXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXHR9XG5cblx0cG9zdChyZXF1ZXN0LCBjYWxsYmFjayA9ICgpID0+IHsgfSkge1xuXHRcdGNvbnN0IG1ldGhvZCA9IHJlcXVlc3QubWV0aG9kXG5cdFx0XHQ/IHJlcXVlc3QubWV0aG9kLnRvTG9jYWxlTG93ZXJDYXNlKClcblx0XHRcdDogJ3Bvc3QnXG5cblx0XHQvLyDlpoLmnpzmjIflrprkuobor7fmsYLkvZMsIOS9huayoeaMh+WumiBgQ29udGVudC1UeXBlYOOAgWBjb250ZW50LXR5cGVgLCDliJnoh6rliqjnlJ/miJDjgIJcblx0XHRpZiAoXG5cdFx0XHRyZXF1ZXN0LmJvZHkgJiZcblx0XHRcdHJlcXVlc3QuaGVhZGVycyAmJlxuXHRcdFx0IXJlcXVlc3QuaGVhZGVyc1snQ29udGVudC1UeXBlJ10gJiZcblx0XHRcdCFyZXF1ZXN0LmhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddXG5cdFx0KSB7XG5cdFx0XHQvLyBIVFRQLzHjgIFIVFRQLzIg6YO95pSv5oyB5bCP5YaZIGhlYWRlcnNcblx0XHRcdHJlcXVlc3QuaGVhZGVyc1snY29udGVudC10eXBlJ10gPSAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xuXHRcdH1cblx0XHQvLyDkuLrpgb/lhY3mjIflrprplJnor68gYGNvbnRlbnQtbGVuZ3RoYCDov5nph4zliKDpmaTor6XlsZ7mgKfvvIznlLHlt6Xlhbfnq68gKEh0dHBDbGllbnQpIOi0n+i0o+mHjeaWsOiuoeeul+W5tui1i+WAvFxuXHRcdGRlbGV0ZSByZXF1ZXN0Py5oZWFkZXJzPy5bJ0NvbnRlbnQtTGVuZ3RoJ11cblx0XHRkZWxldGUgcmVxdWVzdD8uaGVhZGVycz8uWydjb250ZW50LWxlbmd0aCddXG5cdFx0c3dpdGNoICh0aGlzLnBsYXRmb3JtKCkpIHtcblx0XHRcdGNhc2UgJ1N1cmdlJzpcblx0XHRcdGNhc2UgJ0xvb24nOlxuXHRcdFx0Y2FzZSAnU3Rhc2gnOlxuXHRcdFx0Y2FzZSAnU2hhZG93cm9ja2V0Jzpcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGlmICh0aGlzLmlzU3VyZ2UoKSAmJiB0aGlzLmlzTmVlZFJld3JpdGUpIHtcblx0XHRcdFx0XHR0aGlzLmxvZGFzaF9zZXQocmVxdWVzdCwgJ2hlYWRlcnMuWC1TdXJnZS1Ta2lwLVNjcmlwdGluZycsIGZhbHNlKVxuXHRcdFx0XHR9XG5cdFx0XHRcdCRodHRwQ2xpZW50W21ldGhvZF0ocmVxdWVzdCwgKGVycm9yLCByZXNwb25zZSwgYm9keSkgPT4ge1xuXHRcdFx0XHRcdGlmICghZXJyb3IgJiYgcmVzcG9uc2UpIHtcblx0XHRcdFx0XHRcdHJlc3BvbnNlLmJvZHkgPSBib2R5XG5cdFx0XHRcdFx0XHRyZXNwb25zZS5zdGF0dXNDb2RlID0gcmVzcG9uc2Uuc3RhdHVzID8gcmVzcG9uc2Uuc3RhdHVzIDogcmVzcG9uc2Uuc3RhdHVzQ29kZVxuXHRcdFx0XHRcdFx0cmVzcG9uc2Uuc3RhdHVzID0gcmVzcG9uc2Uuc3RhdHVzQ29kZVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYWxsYmFjayhlcnJvciwgcmVzcG9uc2UsIGJvZHkpXG5cdFx0XHRcdH0pXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdRdWFudHVtdWx0IFgnOlxuXHRcdFx0XHRyZXF1ZXN0Lm1ldGhvZCA9IG1ldGhvZFxuXHRcdFx0XHRpZiAodGhpcy5pc05lZWRSZXdyaXRlKSB7XG5cdFx0XHRcdFx0dGhpcy5sb2Rhc2hfc2V0KHJlcXVlc3QsICdvcHRzLmhpbnRzJywgZmFsc2UpXG5cdFx0XHRcdH1cblx0XHRcdFx0JHRhc2suZmV0Y2gocmVxdWVzdCkudGhlbihcblx0XHRcdFx0XHQocmVzcG9uc2UpID0+IHtcblx0XHRcdFx0XHRcdGNvbnN0IHtcblx0XHRcdFx0XHRcdFx0c3RhdHVzQ29kZTogc3RhdHVzLFxuXHRcdFx0XHRcdFx0XHRzdGF0dXNDb2RlLFxuXHRcdFx0XHRcdFx0XHRoZWFkZXJzLFxuXHRcdFx0XHRcdFx0XHRib2R5LFxuXHRcdFx0XHRcdFx0XHRib2R5Qnl0ZXNcblx0XHRcdFx0XHRcdH0gPSByZXNwb25zZVxuXHRcdFx0XHRcdFx0Y2FsbGJhY2soXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdHsgc3RhdHVzLCBzdGF0dXNDb2RlLCBoZWFkZXJzLCBib2R5LCBib2R5Qnl0ZXMgfSxcblx0XHRcdFx0XHRcdFx0Ym9keSxcblx0XHRcdFx0XHRcdFx0Ym9keUJ5dGVzXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQoZXJyb3IpID0+IGNhbGxiYWNrKChlcnJvciAmJiBlcnJvci5lcnJvcikgfHwgJ1VuZGVmaW5lZEVycm9yJylcblx0XHRcdFx0KVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnTm9kZS5qcyc6XG5cdFx0XHRcdGxldCBpY29udiA9IHJlcXVpcmUoJ2ljb252LWxpdGUnKVxuXHRcdFx0XHR0aGlzLmluaXRHb3RFbnYocmVxdWVzdClcblx0XHRcdFx0Y29uc3QgeyB1cmwsIC4uLl9yZXF1ZXN0IH0gPSByZXF1ZXN0XG5cdFx0XHRcdHRoaXMuZ290W21ldGhvZF0odXJsLCBfcmVxdWVzdCkudGhlbihcblx0XHRcdFx0XHQocmVzcG9uc2UpID0+IHtcblx0XHRcdFx0XHRcdGNvbnN0IHsgc3RhdHVzQ29kZTogc3RhdHVzLCBzdGF0dXNDb2RlLCBoZWFkZXJzLCByYXdCb2R5IH0gPSByZXNwb25zZVxuXHRcdFx0XHRcdFx0Y29uc3QgYm9keSA9IGljb252LmRlY29kZShyYXdCb2R5LCB0aGlzLmVuY29kaW5nKVxuXHRcdFx0XHRcdFx0Y2FsbGJhY2soXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdHsgc3RhdHVzLCBzdGF0dXNDb2RlLCBoZWFkZXJzLCByYXdCb2R5LCBib2R5IH0sXG5cdFx0XHRcdFx0XHRcdGJvZHlcblx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdChlcnIpID0+IHtcblx0XHRcdFx0XHRcdGNvbnN0IHsgbWVzc2FnZTogZXJyb3IsIHJlc3BvbnNlOiByZXNwb25zZSB9ID0gZXJyXG5cdFx0XHRcdFx0XHRjYWxsYmFjayhcblx0XHRcdFx0XHRcdFx0ZXJyb3IsXG5cdFx0XHRcdFx0XHRcdHJlc3BvbnNlLFxuXHRcdFx0XHRcdFx0XHRyZXNwb25zZSAmJiBpY29udi5kZWNvZGUocmVzcG9uc2UucmF3Qm9keSwgdGhpcy5lbmNvZGluZylcblx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdClcblx0XHRcdFx0YnJlYWtcblx0XHR9XG5cdH1cblx0LyoqXG5cdCAqXG5cdCAqIOekuuS+izokLnRpbWUoJ3l5eXktTU0tZGQgcXEgSEg6bW06c3MuUycpXG5cdCAqICAgIDokLnRpbWUoJ3l5eXlNTWRkSEhtbXNzUycpXG5cdCAqICAgIHk65bm0IE065pyIIGQ65pelIHE65a2jIEg65pe2IG065YiGIHM656eSIFM65q+r56eSXG5cdCAqICAgIOWFtuS4rXnlj6/pgIkwLTTkvY3ljaDkvY3nrKbjgIFT5Y+v6YCJMC0x5L2N5Y2g5L2N56ym77yM5YW25L2Z5Y+v6YCJMC0y5L2N5Y2g5L2N56ymXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBmb3JtYXQg5qC85byP5YyW5Y+C5pWwXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSB0cyDlj6/pgIk6IOagueaNruaMh+WumuaXtumXtOaIs+i/lOWbnuagvOW8j+WMluaXpeacn1xuXHQgKlxuXHQgKi9cblx0dGltZShmb3JtYXQsIHRzID0gbnVsbCkge1xuXHRcdGNvbnN0IGRhdGUgPSB0cyA/IG5ldyBEYXRlKHRzKSA6IG5ldyBEYXRlKClcblx0XHRsZXQgbyA9IHtcblx0XHRcdCdNKyc6IGRhdGUuZ2V0TW9udGgoKSArIDEsXG5cdFx0XHQnZCsnOiBkYXRlLmdldERhdGUoKSxcblx0XHRcdCdIKyc6IGRhdGUuZ2V0SG91cnMoKSxcblx0XHRcdCdtKyc6IGRhdGUuZ2V0TWludXRlcygpLFxuXHRcdFx0J3MrJzogZGF0ZS5nZXRTZWNvbmRzKCksXG5cdFx0XHQncSsnOiBNYXRoLmZsb29yKChkYXRlLmdldE1vbnRoKCkgKyAzKSAvIDMpLFxuXHRcdFx0J1MnOiBkYXRlLmdldE1pbGxpc2Vjb25kcygpXG5cdFx0fVxuXHRcdGlmICgvKHkrKS8udGVzdChmb3JtYXQpKVxuXHRcdFx0Zm9ybWF0ID0gZm9ybWF0LnJlcGxhY2UoXG5cdFx0XHRcdFJlZ0V4cC4kMSxcblx0XHRcdFx0KGRhdGUuZ2V0RnVsbFllYXIoKSArICcnKS5zdWJzdHIoNCAtIFJlZ0V4cC4kMS5sZW5ndGgpXG5cdFx0XHQpXG5cdFx0Zm9yIChsZXQgayBpbiBvKVxuXHRcdFx0aWYgKG5ldyBSZWdFeHAoJygnICsgayArICcpJykudGVzdChmb3JtYXQpKVxuXHRcdFx0XHRmb3JtYXQgPSBmb3JtYXQucmVwbGFjZShcblx0XHRcdFx0XHRSZWdFeHAuJDEsXG5cdFx0XHRcdFx0UmVnRXhwLiQxLmxlbmd0aCA9PSAxXG5cdFx0XHRcdFx0XHQ/IG9ba11cblx0XHRcdFx0XHRcdDogKCcwMCcgKyBvW2tdKS5zdWJzdHIoKCcnICsgb1trXSkubGVuZ3RoKVxuXHRcdFx0XHQpXG5cdFx0cmV0dXJuIGZvcm1hdFxuXHR9XG5cblx0LyoqXG5cdCAqIOezu+e7n+mAmuefpVxuXHQgKlxuXHQgKiA+IOmAmuefpeWPguaVsDog5ZCM5pe25pSv5oyBIFF1YW5YIOWSjCBMb29uIOS4pOenjeagvOW8jywgRW52SnPmoLnmja7ov5DooYznjq/looPoh6rliqjovazmjaIsIFN1cmdlIOeOr+Wig+S4jeaUr+aMgeWkmuWqkuS9k+mAmuefpVxuXHQgKlxuXHQgKiDnpLrkvos6XG5cdCAqICQubXNnKHRpdGxlLCBzdWJ0LCBkZXNjLCAndHdpdHRlcjovLycpXG5cdCAqICQubXNnKHRpdGxlLCBzdWJ0LCBkZXNjLCB7ICdvcGVuLXVybCc6ICd0d2l0dGVyOi8vJywgJ21lZGlhLXVybCc6ICdodHRwczovL2dpdGh1Yi5naXRodWJhc3NldHMuY29tL2ltYWdlcy9tb2R1bGVzL29wZW5fZ3JhcGgvZ2l0aHViLW1hcmsucG5nJyB9KVxuXHQgKiAkLm1zZyh0aXRsZSwgc3VidCwgZGVzYywgeyAnb3Blbi11cmwnOiAnaHR0cHM6Ly9iaW5nLmNvbScsICdtZWRpYS11cmwnOiAnaHR0cHM6Ly9naXRodWIuZ2l0aHViYXNzZXRzLmNvbS9pbWFnZXMvbW9kdWxlcy9vcGVuX2dyYXBoL2dpdGh1Yi1tYXJrLnBuZycgfSlcblx0ICpcblx0ICogQHBhcmFtIHsqfSB0aXRsZSDmoIfpophcblx0ICogQHBhcmFtIHsqfSBzdWJ0IOWJr+agh+mimFxuXHQgKiBAcGFyYW0geyp9IGRlc2Mg6YCa55+l6K+m5oOFXG5cdCAqIEBwYXJhbSB7Kn0gb3B0cyDpgJrnn6Xlj4LmlbBcblx0ICpcblx0ICovXG5cdG1zZyh0aXRsZSA9IG5hbWUsIHN1YnQgPSAnJywgZGVzYyA9ICcnLCBvcHRzKSB7XG5cdFx0Y29uc3QgdG9FbnZPcHRzID0gKHJhd29wdHMpID0+IHtcblx0XHRcdHN3aXRjaCAodHlwZW9mIHJhd29wdHMpIHtcblx0XHRcdFx0Y2FzZSB1bmRlZmluZWQ6XG5cdFx0XHRcdFx0cmV0dXJuIHJhd29wdHNcblx0XHRcdFx0Y2FzZSAnc3RyaW5nJzpcblx0XHRcdFx0XHRzd2l0Y2ggKHRoaXMucGxhdGZvcm0oKSkge1xuXHRcdFx0XHRcdFx0Y2FzZSAnU3VyZ2UnOlxuXHRcdFx0XHRcdFx0Y2FzZSAnU3Rhc2gnOlxuXHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHsgdXJsOiByYXdvcHRzIH1cblx0XHRcdFx0XHRcdGNhc2UgJ0xvb24nOlxuXHRcdFx0XHRcdFx0Y2FzZSAnU2hhZG93cm9ja2V0Jzpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHJhd29wdHNcblx0XHRcdFx0XHRcdGNhc2UgJ1F1YW50dW11bHQgWCc6XG5cdFx0XHRcdFx0XHRcdHJldHVybiB7ICdvcGVuLXVybCc6IHJhd29wdHMgfVxuXHRcdFx0XHRcdFx0Y2FzZSAnTm9kZS5qcyc6XG5cdFx0XHRcdFx0XHRcdHJldHVybiB1bmRlZmluZWRcblx0XHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgJ29iamVjdCc6XG5cdFx0XHRcdFx0c3dpdGNoICh0aGlzLnBsYXRmb3JtKCkpIHtcblx0XHRcdFx0XHRcdGNhc2UgJ1N1cmdlJzpcblx0XHRcdFx0XHRcdGNhc2UgJ1N0YXNoJzpcblx0XHRcdFx0XHRcdGNhc2UgJ1NoYWRvd3JvY2tldCc6XG5cdFx0XHRcdFx0XHRkZWZhdWx0OiB7XG5cdFx0XHRcdFx0XHRcdGxldCBvcGVuVXJsID1cblx0XHRcdFx0XHRcdFx0XHRyYXdvcHRzLnVybCB8fCByYXdvcHRzLm9wZW5VcmwgfHwgcmF3b3B0c1snb3Blbi11cmwnXVxuXHRcdFx0XHRcdFx0XHRyZXR1cm4geyB1cmw6IG9wZW5VcmwgfVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y2FzZSAnTG9vbic6IHtcblx0XHRcdFx0XHRcdFx0bGV0IG9wZW5VcmwgPVxuXHRcdFx0XHRcdFx0XHRcdHJhd29wdHMub3BlblVybCB8fCByYXdvcHRzLnVybCB8fCByYXdvcHRzWydvcGVuLXVybCddXG5cdFx0XHRcdFx0XHRcdGxldCBtZWRpYVVybCA9IHJhd29wdHMubWVkaWFVcmwgfHwgcmF3b3B0c1snbWVkaWEtdXJsJ11cblx0XHRcdFx0XHRcdFx0cmV0dXJuIHsgb3BlblVybCwgbWVkaWFVcmwgfVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y2FzZSAnUXVhbnR1bXVsdCBYJzoge1xuXHRcdFx0XHRcdFx0XHRsZXQgb3BlblVybCA9XG5cdFx0XHRcdFx0XHRcdFx0cmF3b3B0c1snb3Blbi11cmwnXSB8fCByYXdvcHRzLnVybCB8fCByYXdvcHRzLm9wZW5Vcmxcblx0XHRcdFx0XHRcdFx0bGV0IG1lZGlhVXJsID0gcmF3b3B0c1snbWVkaWEtdXJsJ10gfHwgcmF3b3B0cy5tZWRpYVVybFxuXHRcdFx0XHRcdFx0XHRsZXQgdXBkYXRlUGFzdGVib2FyZCA9XG5cdFx0XHRcdFx0XHRcdFx0cmF3b3B0c1sndXBkYXRlLXBhc3RlYm9hcmQnXSB8fCByYXdvcHRzLnVwZGF0ZVBhc3RlYm9hcmRcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHQnb3Blbi11cmwnOiBvcGVuVXJsLFxuXHRcdFx0XHRcdFx0XHRcdCdtZWRpYS11cmwnOiBtZWRpYVVybCxcblx0XHRcdFx0XHRcdFx0XHQndXBkYXRlLXBhc3RlYm9hcmQnOiB1cGRhdGVQYXN0ZWJvYXJkXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGNhc2UgJ05vZGUuanMnOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdHJldHVybiB1bmRlZmluZWRcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKCF0aGlzLmlzTXV0ZSkge1xuXHRcdFx0c3dpdGNoICh0aGlzLnBsYXRmb3JtKCkpIHtcblx0XHRcdFx0Y2FzZSAnU3VyZ2UnOlxuXHRcdFx0XHRjYXNlICdMb29uJzpcblx0XHRcdFx0Y2FzZSAnU3Rhc2gnOlxuXHRcdFx0XHRjYXNlICdTaGFkb3dyb2NrZXQnOlxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdCRub3RpZmljYXRpb24ucG9zdCh0aXRsZSwgc3VidCwgZGVzYywgdG9FbnZPcHRzKG9wdHMpKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgJ1F1YW50dW11bHQgWCc6XG5cdFx0XHRcdFx0JG5vdGlmeSh0aXRsZSwgc3VidCwgZGVzYywgdG9FbnZPcHRzKG9wdHMpKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgJ05vZGUuanMnOlxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmICghdGhpcy5pc011dGVMb2cpIHtcblx0XHRcdGxldCBsb2dzID0gWycnLCAnPT09PT09PT09PT09PT3wn5Oj57O757uf6YCa55+l8J+Toz09PT09PT09PT09PT09J11cblx0XHRcdGxvZ3MucHVzaCh0aXRsZSlcblx0XHRcdHN1YnQgPyBsb2dzLnB1c2goc3VidCkgOiAnJ1xuXHRcdFx0ZGVzYyA/IGxvZ3MucHVzaChkZXNjKSA6ICcnXG5cdFx0XHRjb25zb2xlLmxvZyhsb2dzLmpvaW4oJ1xcbicpKVxuXHRcdFx0dGhpcy5sb2dzID0gdGhpcy5sb2dzLmNvbmNhdChsb2dzKVxuXHRcdH1cblx0fVxuXG5cdGxvZyguLi5sb2dzKSB7XG5cdFx0aWYgKGxvZ3MubGVuZ3RoID4gMCkge1xuXHRcdFx0dGhpcy5sb2dzID0gWy4uLnRoaXMubG9ncywgLi4ubG9nc11cblx0XHR9XG5cdFx0Y29uc29sZS5sb2cobG9ncy5qb2luKHRoaXMubG9nU2VwYXJhdG9yKSlcblx0fVxuXG5cdGxvZ0VycihlcnJvcikge1xuXHRcdHN3aXRjaCAodGhpcy5wbGF0Zm9ybSgpKSB7XG5cdFx0XHRjYXNlICdTdXJnZSc6XG5cdFx0XHRjYXNlICdMb29uJzpcblx0XHRcdGNhc2UgJ1N0YXNoJzpcblx0XHRcdGNhc2UgJ1NoYWRvd3JvY2tldCc6XG5cdFx0XHRjYXNlICdRdWFudHVtdWx0IFgnOlxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dGhpcy5sb2coJycsIGDinZfvuI8gJHt0aGlzLm5hbWV9LCDplJnor68hYCwgZXJyb3IpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdOb2RlLmpzJzpcblx0XHRcdFx0dGhpcy5sb2coJycsIGDinZfvuI8ke3RoaXMubmFtZX0sIOmUmeivryFgLCBlcnJvci5zdGFjaylcblx0XHRcdFx0YnJlYWtcblx0XHR9XG5cdH1cblxuXHR3YWl0KHRpbWUpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgdGltZSkpXG5cdH1cblxuXHRkb25lKHZhbCA9IHt9KSB7XG5cdFx0Y29uc3QgZW5kVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG5cdFx0Y29uc3QgY29zdFRpbWUgPSAoZW5kVGltZSAtIHRoaXMuc3RhcnRUaW1lKSAvIDEwMDBcblx0XHR0aGlzLmxvZygnJywgYPCfmqkgJHt0aGlzLm5hbWV9LCDnu5PmnZ8hIPCflZsgJHtjb3N0VGltZX0g56eSYClcblx0XHR0aGlzLmxvZygpXG5cdFx0c3dpdGNoICh0aGlzLnBsYXRmb3JtKCkpIHtcblx0XHRcdGNhc2UgJ1N1cmdlJzpcblx0XHRcdGNhc2UgJ0xvb24nOlxuXHRcdFx0Y2FzZSAnU3Rhc2gnOlxuXHRcdFx0Y2FzZSAnU2hhZG93cm9ja2V0Jzpcblx0XHRcdGNhc2UgJ1F1YW50dW11bHQgWCc6XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQkZG9uZSh2YWwpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdOb2RlLmpzJzpcblx0XHRcdFx0cHJvY2Vzcy5leGl0KDEpXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEdldCBFbnZpcm9ubWVudCBWYXJpYWJsZXNcblx0ICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1ZpcmdpbENseW5lL0dldFNvbWVGcmllcy9ibG9iL21haW4vZnVuY3Rpb24vZ2V0RU5WL2dldEVOVi5qc1xuXHQgKiBAYXV0aG9yIFZpcmdpbENseW5lXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBrZXkgLSBQZXJzaXN0ZW50IFN0b3JlIEtleVxuXHQgKiBAcGFyYW0ge0FycmF5fSBuYW1lcyAtIFBsYXRmb3JtIE5hbWVzXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhYmFzZSAtIERlZmF1bHQgRGF0YWJhc2Vcblx0ICogQHJldHVybiB7T2JqZWN0fSB7IFNldHRpbmdzLCBDYWNoZXMsIENvbmZpZ3MgfVxuXHQgKi9cblx0Z2V0RU5WKGtleSwgbmFtZXMsIGRhdGFiYXNlKSB7XG5cdFx0Ly90aGlzLmxvZyhg4piR77iPICR7dGhpcy5uYW1lfSwgR2V0IEVudmlyb25tZW50IFZhcmlhYmxlc2AsIFwiXCIpO1xuXHRcdC8qKioqKioqKioqKioqKioqKiBCb3hKcyAqKioqKioqKioqKioqKioqKi9cblx0XHQvLyDljIXoo4XkuLrlsYDpg6jlj5jph4/vvIznlKjlrozph4rmlL7lhoXlrZhcblx0XHQvLyBCb3hKc+eahOa4heepuuaTjeS9nOi/lOWbnuWBh+WAvOepuuWtl+espuS4siwg6YC76L6R5oiW5pON5L2c56ym5Lya5Zyo5bem5L6n5pON5L2c5pWw5Li65YGH5YC85pe26L+U5Zue5Y+z5L6n5pON5L2c5pWw44CCXG5cdFx0bGV0IEJveEpzID0gdGhpcy5nZXRqc29uKGtleSwgZGF0YWJhc2UpO1xuXHRcdC8vdGhpcy5sb2coYPCfmqcgJHt0aGlzLm5hbWV9LCBHZXQgRW52aXJvbm1lbnQgVmFyaWFibGVzYCwgYEJveEpz57G75Z6LOiAke3R5cGVvZiBCb3hKc31gLCBgQm94SnPlhoXlrrk6ICR7SlNPTi5zdHJpbmdpZnkoQm94SnMpfWAsIFwiXCIpO1xuXHRcdC8qKioqKioqKioqKioqKioqKiBBcmd1bWVudCAqKioqKioqKioqKioqKioqKi9cblx0XHRsZXQgQXJndW1lbnQgPSB7fTtcblx0XHRpZiAodHlwZW9mICRhcmd1bWVudCAhPT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdFx0aWYgKEJvb2xlYW4oJGFyZ3VtZW50KSkge1xuXHRcdFx0XHQvL3RoaXMubG9nKGDwn46JICR7dGhpcy5uYW1lfSwgJEFyZ3VtZW50YCk7XG5cdFx0XHRcdGxldCBhcmcgPSBPYmplY3QuZnJvbUVudHJpZXMoJGFyZ3VtZW50LnNwbGl0KFwiJlwiKS5tYXAoKGl0ZW0pID0+IGl0ZW0uc3BsaXQoXCI9XCIpLm1hcChpID0+IGkucmVwbGFjZSgvXFxcIi9nLCAnJykpKSk7XG5cdFx0XHRcdC8vdGhpcy5sb2coSlNPTi5zdHJpbmdpZnkoYXJnKSk7XG5cdFx0XHRcdGZvciAobGV0IGl0ZW0gaW4gYXJnKSB0aGlzLnNldFBhdGgoQXJndW1lbnQsIGl0ZW0sIGFyZ1tpdGVtXSk7XG5cdFx0XHRcdC8vdGhpcy5sb2coSlNPTi5zdHJpbmdpZnkoQXJndW1lbnQpKTtcblx0XHRcdH07XG5cdFx0XHQvL3RoaXMubG9nKGDinIUgJHt0aGlzLm5hbWV9LCBHZXQgRW52aXJvbm1lbnQgVmFyaWFibGVzYCwgYEFyZ3VtZW5057G75Z6LOiAke3R5cGVvZiBBcmd1bWVudH1gLCBgQXJndW1lbnTlhoXlrrk6ICR7SlNPTi5zdHJpbmdpZnkoQXJndW1lbnQpfWAsIFwiXCIpO1xuXHRcdH07XG5cdFx0LyoqKioqKioqKioqKioqKioqIFN0b3JlICoqKioqKioqKioqKioqKioqL1xuXHRcdGNvbnN0IFN0b3JlID0geyBTZXR0aW5nczogZGF0YWJhc2U/LkRlZmF1bHQ/LlNldHRpbmdzIHx8IHt9LCBDb25maWdzOiBkYXRhYmFzZT8uRGVmYXVsdD8uQ29uZmlncyB8fCB7fSwgQ2FjaGVzOiB7fSB9O1xuXHRcdGlmICghQXJyYXkuaXNBcnJheShuYW1lcykpIG5hbWVzID0gW25hbWVzXTtcblx0XHQvL3RoaXMubG9nKGDwn5qnICR7dGhpcy5uYW1lfSwgR2V0IEVudmlyb25tZW50IFZhcmlhYmxlc2AsIGBuYW1lc+exu+WeizogJHt0eXBlb2YgbmFtZXN9YCwgYG5hbWVz5YaF5a65OiAke0pTT04uc3RyaW5naWZ5KG5hbWVzKX1gLCBcIlwiKTtcblx0XHRmb3IgKGxldCBuYW1lIG9mIG5hbWVzKSB7XG5cdFx0XHRTdG9yZS5TZXR0aW5ncyA9IHsgLi4uU3RvcmUuU2V0dGluZ3MsIC4uLmRhdGFiYXNlPy5bbmFtZV0/LlNldHRpbmdzLCAuLi5Bcmd1bWVudCwgLi4uQm94SnM/LltuYW1lXT8uU2V0dGluZ3MgfTtcblx0XHRcdFN0b3JlLkNvbmZpZ3MgPSB7IC4uLlN0b3JlLkNvbmZpZ3MsIC4uLmRhdGFiYXNlPy5bbmFtZV0/LkNvbmZpZ3MgfTtcblx0XHRcdGlmIChCb3hKcz8uW25hbWVdPy5DYWNoZXMgJiYgdHlwZW9mIEJveEpzPy5bbmFtZV0/LkNhY2hlcyA9PT0gXCJzdHJpbmdcIikgQm94SnNbbmFtZV0uQ2FjaGVzID0gSlNPTi5wYXJzZShCb3hKcz8uW25hbWVdPy5DYWNoZXMpO1xuXHRcdFx0U3RvcmUuQ2FjaGVzID0geyAuLi5TdG9yZS5DYWNoZXMsIC4uLkJveEpzPy5bbmFtZV0/LkNhY2hlcyB9O1xuXHRcdH07XG5cdFx0Ly90aGlzLmxvZyhg8J+apyAke3RoaXMubmFtZX0sIEdldCBFbnZpcm9ubWVudCBWYXJpYWJsZXNgLCBgU3RvcmUuU2V0dGluZ3Pnsbvlnos6ICR7dHlwZW9mIFN0b3JlLlNldHRpbmdzfWAsIGBTdG9yZS5TZXR0aW5nczogJHtKU09OLnN0cmluZ2lmeShTdG9yZS5TZXR0aW5ncyl9YCwgXCJcIik7XG5cdFx0dGhpcy50cmF2ZXJzZU9iamVjdChTdG9yZS5TZXR0aW5ncywgKGtleSwgdmFsdWUpID0+IHtcblx0XHRcdC8vdGhpcy5sb2coYPCfmqcgJHt0aGlzLm5hbWV9LCB0cmF2ZXJzZU9iamVjdGAsIGAke2tleX06ICR7dHlwZW9mIHZhbHVlfWAsIGAke2tleX06ICR7SlNPTi5zdHJpbmdpZnkodmFsdWUpfWAsIFwiXCIpO1xuXHRcdFx0aWYgKHZhbHVlID09PSBcInRydWVcIiB8fCB2YWx1ZSA9PT0gXCJmYWxzZVwiKSB2YWx1ZSA9IEpTT04ucGFyc2UodmFsdWUpOyAvLyDlrZfnrKbkuLLovaxCb29sZWFuXG5cdFx0XHRlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0aWYgKHZhbHVlLmluY2x1ZGVzKFwiLFwiKSkgdmFsdWUgPSB2YWx1ZS5zcGxpdChcIixcIikubWFwKGl0ZW0gPT4gdGhpcy5zdHJpbmcybnVtYmVyKGl0ZW0pKTsgLy8g5a2X56ym5Liy6L2s5pWw57uE6L2s5pWw5a2XXG5cdFx0XHRcdGVsc2UgdmFsdWUgPSB0aGlzLnN0cmluZzJudW1iZXIodmFsdWUpOyAvLyDlrZfnrKbkuLLovazmlbDlrZdcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0fSk7XG5cdFx0Ly90aGlzLmxvZyhg4pyFICR7dGhpcy5uYW1lfSwgR2V0IEVudmlyb25tZW50IFZhcmlhYmxlc2AsIGBTdG9yZTogJHt0eXBlb2YgU3RvcmUuQ2FjaGVzfWAsIGBTdG9yZeWGheWuuTogJHtKU09OLnN0cmluZ2lmeShTdG9yZSl9YCwgXCJcIik7XG5cdFx0cmV0dXJuIFN0b3JlO1xuXHR9O1xuXG5cdC8qKioqKioqKioqKioqKioqKiBmdW5jdGlvbiAqKioqKioqKioqKioqKioqKi9cblx0c2V0UGF0aChvYmplY3QsIHBhdGgsIHZhbHVlKSB7IHBhdGguc3BsaXQoXCIuXCIpLnJlZHVjZSgobywgcCwgaSkgPT4gb1twXSA9IHBhdGguc3BsaXQoXCIuXCIpLmxlbmd0aCA9PT0gKytpID8gdmFsdWUgOiBvW3BdIHx8IHt9LCBvYmplY3QpIH1cblx0dHJhdmVyc2VPYmplY3QobywgYykgeyBmb3IgKHZhciB0IGluIG8pIHsgdmFyIG4gPSBvW3RdOyBvW3RdID0gXCJvYmplY3RcIiA9PSB0eXBlb2YgbiAmJiBudWxsICE9PSBuID8gdGhpcy50cmF2ZXJzZU9iamVjdChuLCBjKSA6IGModCwgbikgfSByZXR1cm4gbyB9XG5cdHN0cmluZzJudW1iZXIoc3RyaW5nKSB7IGlmIChzdHJpbmcgJiYgIWlzTmFOKHN0cmluZykpIHN0cmluZyA9IHBhcnNlSW50KHN0cmluZywgMTApOyByZXR1cm4gc3RyaW5nIH1cbn1cblxuZXhwb3J0IGNsYXNzIEh0dHAge1xuXHRjb25zdHJ1Y3RvcihlbnYpIHtcblx0XHR0aGlzLmVudiA9IGVudlxuXHR9XG5cblx0c2VuZChvcHRzLCBtZXRob2QgPSAnR0VUJykge1xuXHRcdG9wdHMgPSB0eXBlb2Ygb3B0cyA9PT0gJ3N0cmluZycgPyB7IHVybDogb3B0cyB9IDogb3B0c1xuXHRcdGxldCBzZW5kZXIgPSB0aGlzLmdldFxuXHRcdGlmIChtZXRob2QgPT09ICdQT1NUJykge1xuXHRcdFx0c2VuZGVyID0gdGhpcy5wb3N0XG5cdFx0fVxuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRzZW5kZXIuY2FsbCh0aGlzLCBvcHRzLCAoZXJyb3IsIHJlc3BvbnNlLCBib2R5KSA9PiB7XG5cdFx0XHRcdGlmIChlcnJvcikgcmVqZWN0KGVycm9yKVxuXHRcdFx0XHRlbHNlIHJlc29sdmUocmVzcG9uc2UpXG5cdFx0XHR9KVxuXHRcdH0pXG5cdH1cblxuXHRnZXQob3B0cykge1xuXHRcdHJldHVybiB0aGlzLnNlbmQuY2FsbCh0aGlzLmVudiwgb3B0cylcblx0fVxuXG5cdHBvc3Qob3B0cykge1xuXHRcdHJldHVybiB0aGlzLnNlbmQuY2FsbCh0aGlzLmVudiwgb3B0cywgJ1BPU1QnKVxuXHR9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBVUkkge1xuXHRjb25zdHJ1Y3RvcihvcHRzID0gW10pIHtcblx0XHR0aGlzLm5hbWUgPSBcIlVSSSB2MS4yLjZcIjtcblx0XHR0aGlzLm9wdHMgPSBvcHRzO1xuXHRcdHRoaXMuanNvbiA9IHsgc2NoZW1lOiBcIlwiLCBob3N0OiBcIlwiLCBwYXRoOiBcIlwiLCBxdWVyeToge30gfTtcblx0fTtcblxuXHRwYXJzZSh1cmwpIHtcblx0XHRjb25zdCBVUkxSZWdleCA9IC8oPzooPzxzY2hlbWU+LispOlxcL1xcLyg/PGhvc3Q+W14vXSspKT9cXC8/KD88cGF0aD5bXj9dKyk/XFw/Pyg/PHF1ZXJ5PlteP10rKT8vO1xuXHRcdGxldCBqc29uID0gdXJsLm1hdGNoKFVSTFJlZ2V4KT8uZ3JvdXBzID8/IG51bGw7XG5cdFx0aWYgKGpzb24/LnBhdGgpIGpzb24ucGF0aHMgPSBqc29uLnBhdGguc3BsaXQoXCIvXCIpOyBlbHNlIGpzb24ucGF0aCA9IFwiXCI7XG5cdFx0Ly9pZiAoanNvbj8ucGF0aHM/LmF0KC0xKT8uaW5jbHVkZXMoXCIuXCIpKSBqc29uLmZvcm1hdCA9IGpzb24ucGF0aHMuYXQoLTEpLnNwbGl0KFwiLlwiKS5hdCgtMSk7XG5cdFx0aWYgKGpzb24/LnBhdGhzKSB7XG5cdFx0XHRjb25zdCBmaWxlTmFtZSA9IGpzb24ucGF0aHNbanNvbi5wYXRocy5sZW5ndGggLSAxXTtcblx0XHRcdGlmIChmaWxlTmFtZT8uaW5jbHVkZXMoXCIuXCIpKSB7XG5cdFx0XHRcdGNvbnN0IGxpc3QgPSBmaWxlTmFtZS5zcGxpdChcIi5cIik7XG5cdFx0XHRcdGpzb24uZm9ybWF0ID0gbGlzdFtsaXN0Lmxlbmd0aCAtIDFdO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoanNvbj8ucXVlcnkpIGpzb24ucXVlcnkgPSBPYmplY3QuZnJvbUVudHJpZXMoanNvbi5xdWVyeS5zcGxpdChcIiZcIikubWFwKChwYXJhbSkgPT4gcGFyYW0uc3BsaXQoXCI9XCIpKSk7XG5cdFx0cmV0dXJuIGpzb25cblx0fTtcblxuXHRzdHJpbmdpZnkoanNvbiA9IHRoaXMuanNvbikge1xuXHRcdGxldCB1cmwgPSBcIlwiO1xuXHRcdGlmIChqc29uPy5zY2hlbWUgJiYganNvbj8uaG9zdCkgdXJsICs9IGpzb24uc2NoZW1lICsgXCI6Ly9cIiArIGpzb24uaG9zdDtcblx0XHRpZiAoanNvbj8ucGF0aCkgdXJsICs9IChqc29uPy5ob3N0KSA/IFwiL1wiICsganNvbi5wYXRoIDoganNvbi5wYXRoO1xuXHRcdGlmIChqc29uPy5xdWVyeSkgdXJsICs9IFwiP1wiICsgT2JqZWN0LmVudHJpZXMoanNvbi5xdWVyeSkubWFwKHBhcmFtID0+IHBhcmFtLmpvaW4oXCI9XCIpKS5qb2luKFwiJlwiKTtcblx0XHRyZXR1cm4gdXJsXG5cdH07XG59XG4iLCIvKlxuUkVBRE1FOiBodHRwczovL2dpdGh1Yi5jb20vVmlyZ2lsQ2x5bmUvaVJpbmdvXG4qL1xuXG5pbXBvcnQgRU5WcyBmcm9tIFwiLi4vRU5WL0VOVi5tanNcIjtcbmNvbnN0ICQgPSBuZXcgRU5WcyhcIu+jvyBpUmluZ286IFNldCBFbnZpcm9ubWVudCBWYXJpYWJsZXNcIik7XG5cbi8qKlxuICogU2V0IEVudmlyb25tZW50IFZhcmlhYmxlc1xuICogQGF1dGhvciBWaXJnaWxDbHluZVxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgLSBQZXJzaXN0ZW50IFN0b3JlIEtleVxuICogQHBhcmFtIHtBcnJheX0gcGxhdGZvcm1zIC0gUGxhdGZvcm0gTmFtZXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhYmFzZSAtIERlZmF1bHQgRGF0YUJhc2VcbiAqIEByZXR1cm4ge09iamVjdH0geyBTZXR0aW5ncywgQ2FjaGVzLCBDb25maWdzIH1cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc2V0RU5WKG5hbWUsIHBsYXRmb3JtcywgZGF0YWJhc2UpIHtcblx0JC5sb2coYOKYke+4jyAkeyQubmFtZX1gLCBcIlwiKTtcblx0bGV0IHsgU2V0dGluZ3MsIENhY2hlcywgQ29uZmlncyB9ID0gJC5nZXRFTlYobmFtZSwgcGxhdGZvcm1zLCBkYXRhYmFzZSk7XG5cdC8qKioqKioqKioqKioqKioqKiBTZXR0aW5ncyAqKioqKioqKioqKioqKioqKi9cblx0aWYgKFNldHRpbmdzPy5UYWJzICYmICFBcnJheS5pc0FycmF5KFNldHRpbmdzPy5UYWJzKSkgJC5sb2Rhc2hfc2V0KFNldHRpbmdzLCBcIlRhYnNcIiwgKFNldHRpbmdzPy5UYWJzKSA/IFtTZXR0aW5ncy5UYWJzLnRvU3RyaW5nKCldIDogW10pO1xuXHRpZiAoU2V0dGluZ3M/LkRvbWFpbnMgJiYgIUFycmF5LmlzQXJyYXkoU2V0dGluZ3M/LkRvbWFpbnMpKSAkLmxvZGFzaF9zZXQoU2V0dGluZ3MsIFwiRG9tYWluc1wiLCAoU2V0dGluZ3M/LkRvbWFpbnMpID8gW1NldHRpbmdzLkRvbWFpbnMudG9TdHJpbmcoKV0gOiBbXSk7XG5cdGlmIChTZXR0aW5ncz8uRnVuY3Rpb25zICYmICFBcnJheS5pc0FycmF5KFNldHRpbmdzPy5GdW5jdGlvbnMpKSAkLmxvZGFzaF9zZXQoU2V0dGluZ3MsIFwiRnVuY3Rpb25zXCIsIChTZXR0aW5ncz8uRnVuY3Rpb25zKSA/IFtTZXR0aW5ncy5GdW5jdGlvbnMudG9TdHJpbmcoKV0gOiBbXSk7XG5cdCQubG9nKGDinIUgJHskLm5hbWV9YCwgYFNldHRpbmdzOiAke3R5cGVvZiBTZXR0aW5nc31gLCBgU2V0dGluZ3PlhoXlrrk6ICR7SlNPTi5zdHJpbmdpZnkoU2V0dGluZ3MpfWAsIFwiXCIpO1xuXHQvKioqKioqKioqKioqKioqKiogQ2FjaGVzICoqKioqKioqKioqKioqKioqL1xuXHQvLyQubG9nKGDinIUgJHskLm5hbWV9YCwgYENhY2hlczogJHt0eXBlb2YgQ2FjaGVzfWAsIGBDYWNoZXPlhoXlrrk6ICR7SlNPTi5zdHJpbmdpZnkoQ2FjaGVzKX1gLCBcIlwiKTtcblx0LyoqKioqKioqKioqKioqKioqIENvbmZpZ3MgKioqKioqKioqKioqKioqKiovXG5cdENvbmZpZ3MuU3RvcmVmcm9udCA9IG5ldyBNYXAoQ29uZmlncy5TdG9yZWZyb250KTtcblx0aWYgKENvbmZpZ3MuTG9jYWxlKSBDb25maWdzLkxvY2FsZSA9IG5ldyBNYXAoQ29uZmlncy5Mb2NhbGUpO1xuXHRpZiAoQ29uZmlncy5pMThuKSBmb3IgKGxldCB0eXBlIGluIENvbmZpZ3MuaTE4bikgQ29uZmlncy5pMThuW3R5cGVdID0gbmV3IE1hcChDb25maWdzLmkxOG5bdHlwZV0pO1xuXHRyZXR1cm4geyBTZXR0aW5ncywgQ2FjaGVzLCBDb25maWdzIH07XG59O1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsInZhciBnZXRQcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZiA/IChvYmopID0+IChPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKSkgOiAob2JqKSA9PiAob2JqLl9fcHJvdG9fXyk7XG52YXIgbGVhZlByb3RvdHlwZXM7XG4vLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3Rcbi8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuLy8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4vLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3Rcbi8vIG1vZGUgJiAxNjogcmV0dXJuIHZhbHVlIHdoZW4gaXQncyBQcm9taXNlLWxpa2Vcbi8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbl9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG5cdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IHRoaXModmFsdWUpO1xuXHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuXHRpZih0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlKSB7XG5cdFx0aWYoKG1vZGUgJiA0KSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG5cdFx0aWYoKG1vZGUgJiAxNikgJiYgdHlwZW9mIHZhbHVlLnRoZW4gPT09ICdmdW5jdGlvbicpIHJldHVybiB2YWx1ZTtcblx0fVxuXHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuXHR2YXIgZGVmID0ge307XG5cdGxlYWZQcm90b3R5cGVzID0gbGVhZlByb3RvdHlwZXMgfHwgW251bGwsIGdldFByb3RvKHt9KSwgZ2V0UHJvdG8oW10pLCBnZXRQcm90byhnZXRQcm90byldO1xuXHRmb3IodmFyIGN1cnJlbnQgPSBtb2RlICYgMiAmJiB2YWx1ZTsgdHlwZW9mIGN1cnJlbnQgPT0gJ29iamVjdCcgJiYgIX5sZWFmUHJvdG90eXBlcy5pbmRleE9mKGN1cnJlbnQpOyBjdXJyZW50ID0gZ2V0UHJvdG8oY3VycmVudCkpIHtcblx0XHRPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhjdXJyZW50KS5mb3JFYWNoKChrZXkpID0+IChkZWZba2V5XSA9ICgpID0+ICh2YWx1ZVtrZXldKSkpO1xuXHR9XG5cdGRlZlsnZGVmYXVsdCddID0gKCkgPT4gKHZhbHVlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBkZWYpO1xuXHRyZXR1cm4gbnM7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIvKlxuUkVBRE1FOiBodHRwczovL2dpdGh1Yi5jb20vVmlyZ2lsQ2x5bmUvaVJpbmdvXG4qL1xuXG5pbXBvcnQgRU5WcyBmcm9tIFwiLi9FTlYvRU5WLm1qc1wiO1xuaW1wb3J0IFVSSXMgZnJvbSBcIi4vVVJJL1VSSS5tanNcIjtcbmltcG9ydCBzZXRFTlYgZnJvbSBcIi4vZnVuY3Rpb24vc2V0RU5WLm1qc1wiO1xuXG5pbXBvcnQgKiBhcyBEZWZhdWx0IGZyb20gXCIuL2RhdGFiYXNlL0RlZmF1bHQuanNvblwiO1xuaW1wb3J0ICogYXMgTG9jYXRpb24gZnJvbSBcIi4vZGF0YWJhc2UvTG9jYXRpb24uanNvblwiO1xuaW1wb3J0ICogYXMgTmV3cyBmcm9tIFwiLi9kYXRhYmFzZS9OZXdzLmpzb25cIjtcbmltcG9ydCAqIGFzIFByaXZhdGVSZWxheSBmcm9tIFwiLi9kYXRhYmFzZS9Qcml2YXRlUmVsYXkuanNvblwiO1xuaW1wb3J0ICogYXMgU2lyaSBmcm9tIFwiLi9kYXRhYmFzZS9TaXJpLmpzb25cIjtcbmltcG9ydCAqIGFzIFRlc3RGbGlnaHQgZnJvbSBcIi4vZGF0YWJhc2UvVGVzdEZsaWdodC5qc29uXCI7XG5pbXBvcnQgKiBhcyBUViBmcm9tIFwiLi9kYXRhYmFzZS9UVi5qc29uXCI7XG5cbmNvbnN0ICQgPSBuZXcgRU5WcyhcIu+jvyBpUmluZ286IPCfk7og76O/VFYgdjMuMi4zKDEpIHJlc3BvbnNlLmJldGFcIik7XG5jb25zdCBVUkkgPSBuZXcgVVJJcygpO1xuY29uc3QgRGF0YUJhc2UgPSB7XG5cdFwiRGVmYXVsdFwiOiBEZWZhdWx0LFxuXHRcIkxvY2F0aW9uXCI6IExvY2F0aW9uLFxuXHRcIk5ld3NcIjogTmV3cyxcblx0XCJQcml2YXRlUmVsYXlcIjogUHJpdmF0ZVJlbGF5LFxuXHRcIlNpcmlcIjogU2lyaSxcblx0XCJUZXN0RmxpZ2h0XCI6IFRlc3RGbGlnaHQsXG5cdFwiVFZcIjogVFYsXG59O1xuXG4vKioqKioqKioqKioqKioqKiogUHJvY2Vzc2luZyAqKioqKioqKioqKioqKioqKi9cbi8vIOino+aehFVSTFxuY29uc3QgVVJMID0gVVJJLnBhcnNlKCRyZXF1ZXN0Py51cmwpO1xuJC5sb2coYOKaoCAkeyQubmFtZX1gLCBgVVJMOiAke0pTT04uc3RyaW5naWZ5KFVSTCl9YCwgXCJcIik7XG4vLyDojrflj5bov57mjqXlj4LmlbBcbmNvbnN0IE1FVEhPRCA9ICRyZXF1ZXN0Lm1ldGhvZCwgSE9TVCA9IFVSTC5ob3N0LCBQQVRIID0gVVJMLnBhdGgsIFBBVEhzID0gVVJMLnBhdGhzO1xuJC5sb2coYOKaoCAkeyQubmFtZX1gLCBgTUVUSE9EOiAke01FVEhPRH1gLCBcIlwiKTtcbi8vIOino+aekOagvOW8j1xuY29uc3QgRk9STUFUID0gKCRyZXNwb25zZS5oZWFkZXJzPy5bXCJDb250ZW50LVR5cGVcIl0gPz8gJHJlc3BvbnNlLmhlYWRlcnM/LltcImNvbnRlbnQtdHlwZVwiXSk/LnNwbGl0KFwiO1wiKT8uWzBdO1xuJC5sb2coYOKaoCAkeyQubmFtZX1gLCBgRk9STUFUOiAke0ZPUk1BVH1gLCBcIlwiKTtcbihhc3luYyAoKSA9PiB7XG5cdGNvbnN0IHsgU2V0dGluZ3MsIENhY2hlcywgQ29uZmlncyB9ID0gc2V0RU5WKFwiaVJpbmdvXCIsIFwiVFZcIiwgRGF0YUJhc2UpO1xuXHQkLmxvZyhg4pqgICR7JC5uYW1lfWAsIGBTZXR0aW5ncy5Td2l0Y2g6ICR7U2V0dGluZ3M/LlN3aXRjaH1gLCBcIlwiKTtcblx0c3dpdGNoIChTZXR0aW5ncy5Td2l0Y2gpIHtcblx0XHRjYXNlIHRydWU6XG5cdFx0ZGVmYXVsdDpcblx0XHRcdC8vIOWIm+W7uuepuuaVsOaNrlxuXHRcdFx0bGV0IGJvZHkgPSB7fTtcblx0XHRcdC8vIOagvOW8j+WIpOaWrVxuXHRcdFx0c3dpdGNoIChGT1JNQVQpIHtcblx0XHRcdFx0Y2FzZSB1bmRlZmluZWQ6IC8vIOinhuS4uuaXoGJvZHlcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiOlxuXHRcdFx0XHRjYXNlIFwidGV4dC9wbGFpblwiOlxuXHRcdFx0XHRjYXNlIFwidGV4dC9odG1sXCI6XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi94LW1wZWdVUkxcIjpcblx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3gtbXBlZ3VybFwiOlxuXHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24vdm5kLmFwcGxlLm1wZWd1cmxcIjpcblx0XHRcdFx0Y2FzZSBcImF1ZGlvL21wZWd1cmxcIjpcblx0XHRcdFx0XHQvL2JvZHkgPSBNM1U4LnBhcnNlKCRyZXNwb25zZS5ib2R5KTtcblx0XHRcdFx0XHQvLyQubG9nKGDwn5qnICR7JC5uYW1lfWAsIGBib2R5OiAke0pTT04uc3RyaW5naWZ5KGJvZHkpfWAsIFwiXCIpO1xuXHRcdFx0XHRcdC8vJHJlc3BvbnNlLmJvZHkgPSBNM1U4LnN0cmluZ2lmeShib2R5KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcInRleHQveG1sXCI6XG5cdFx0XHRcdGNhc2UgXCJ0ZXh0L3BsaXN0XCI6XG5cdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi94bWxcIjpcblx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3BsaXN0XCI6XG5cdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi94LXBsaXN0XCI6XG5cdFx0XHRcdFx0Ly9ib2R5ID0gWE1MLnBhcnNlKCRyZXNwb25zZS5ib2R5KTtcblx0XHRcdFx0XHQvLyQubG9nKGDwn5qnICR7JC5uYW1lfWAsIGBib2R5OiAke0pTT04uc3RyaW5naWZ5KGJvZHkpfWAsIFwiXCIpO1xuXHRcdFx0XHRcdC8vJHJlc3BvbnNlLmJvZHkgPSBYTUwuc3RyaW5naWZ5KGJvZHkpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwidGV4dC92dHRcIjpcblx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3Z0dFwiOlxuXHRcdFx0XHRcdC8vYm9keSA9IFZUVC5wYXJzZSgkcmVzcG9uc2UuYm9keSk7XG5cdFx0XHRcdFx0Ly8kLmxvZyhg8J+apyAkeyQubmFtZX1gLCBgYm9keTogJHtKU09OLnN0cmluZ2lmeShib2R5KX1gLCBcIlwiKTtcblx0XHRcdFx0XHQvLyRyZXNwb25zZS5ib2R5ID0gVlRULnN0cmluZ2lmeShib2R5KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcInRleHQvanNvblwiOlxuXHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24vanNvblwiOlxuXHRcdFx0XHRcdGJvZHkgPSBKU09OLnBhcnNlKCRyZXNwb25zZS5ib2R5KTtcblx0XHRcdFx0XHQvLyDkuLvmnLrliKTmlq1cblx0XHRcdFx0XHRzd2l0Y2ggKEhPU1QpIHtcblx0XHRcdFx0XHRcdGNhc2UgXCJ1dHMtYXBpLml0dW5lcy5hcHBsZS5jb21cIjpcblx0XHRcdFx0XHRcdFx0Ly8g6Lev5b6E5Yik5patXG5cdFx0XHRcdFx0XHRcdHN3aXRjaCAoUEFUSCkge1xuXHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJ1dHMvdjMvY29uZmlndXJhdGlvbnNcIjpcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IFZlcnNpb24gPSBwYXJzZUludChVUkwucXVlcnk/LnYsIDEwKSwgUGxhdGZvcm0gPSBVUkwucXVlcnk/LnBmbSwgTG9jYWxlID0gKCRyZXF1ZXN0LmhlYWRlcnM/LltcIlgtQXBwbGUtSS1Mb2NhbGVcIl0gPz8gJHJlcXVlc3QuaGVhZGVycz8uW1wieC1hcHBsZS1pLWxvY2FsZVwiXSk/LnNwbGl0KCdfJyk/LlswXSA/PyBcInpoXCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoVVJMLnF1ZXJ5LmNhbGxlciAhPT0gXCJ3dGFcIikgeyAvLyDkuI3kv67mlLljYWxsZXI9d3Rh55qEY29uZmlndXJhdGlvbnPmlbDmja5cblx0XHRcdFx0XHRcdFx0XHRcdFx0JC5sb2coYOKaoCAkeyQubmFtZX1gLCBgTG9jYWxlOiAke0xvY2FsZX1gLCBgUGxhdGZvcm06ICR7UGxhdGZvcm19YCwgYFZlcnNpb246ICR7VmVyc2lvbn1gLCBcIlwiKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKGJvZHk/LmRhdGE/LmFwcGxpY2F0aW9uUHJvcHMpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvL2JvZHkuZGF0YS5hcHBsaWNhdGlvblByb3BzLnJlcXVpcmVkUGFyYW1zTWFwLldpdGhvdXRVdHNrLmxvY2FsZSA9IFwiemhfSGFuc1wiO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vYm9keS5kYXRhLmFwcGxpY2F0aW9uUHJvcHMucmVxdWlyZWRQYXJhbXNNYXAuRGVmYXVsdC5sb2NhbGUgPSBcInpoX0hhbnNcIjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRsZXQgbmV3VGFicyA9IFtdO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFNldHRpbmdzLlRhYnMuZm9yRWFjaCgodHlwZSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKGJvZHkuZGF0YS5hcHBsaWNhdGlvblByb3BzLnRhYnMuc29tZShUYWIgPT4gVGFiPy50eXBlID09PSB0eXBlKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRsZXQgdGFiID0gYm9keS5kYXRhLmFwcGxpY2F0aW9uUHJvcHMudGFicy5maW5kKFRhYiA9PiBUYWI/LnR5cGUgPT09IHR5cGUpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQkLmxvZyhg8J+apyAkeyQubmFtZX1gLCBgb1RhYjogJHtKU09OLnN0cmluZ2lmeSh0YWIpfWAsIFwiXCIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRsZXQgaW5kZXggPSBib2R5LmRhdGEuYXBwbGljYXRpb25Qcm9wcy50YWJzLmZpbmRJbmRleChUYWIgPT4gVGFiPy50eXBlID09PSB0eXBlKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0JC5sb2coYPCfmqcgJHskLm5hbWV9YCwgYG9JbmRleDogJHtpbmRleH1gLCBcIlwiKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKGluZGV4ID09PSAwKSBuZXdUYWJzLnVuc2hpZnQodGFiKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZWxzZSBuZXdUYWJzLnB1c2godGFiKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoQ29uZmlncy5UYWJzLnNvbWUoVGFiID0+IFRhYj8udHlwZSA9PT0gdHlwZSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0bGV0IHRhYiA9IENvbmZpZ3MuVGFicy5maW5kKFRhYiA9PiBUYWI/LnR5cGUgPT09IHR5cGUpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQkLmxvZyhg8J+apyAkeyQubmFtZX1gLCBgYVRhYjogJHtKU09OLnN0cmluZ2lmeSh0YWIpfWAsIFwiXCIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzd2l0Y2ggKHRhYj8uZGVzdGluYXRpb25UeXBlKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcIlN1YlRhYnNcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHRhYi5zdWJUYWJzID0gdGFiLnN1YlRhYnMubWFwKHN1YlRhYiA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHN1YlRhYi50aXRsZSA9IENvbmZpZ3MuaTE4bj8uW3N1YlRhYi50eXBlXT8uZ2V0KExvY2FsZSkgPz8gdGFiLnRpdGxlO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gc3ViVGFiO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcIlRhcmdldFwiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJDbGllbnRcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHRhYi50aXRsZSA9IENvbmZpZ3MuaTE4bj8uW3RhYi50eXBlXT8uZ2V0KExvY2FsZSkgPz8gdGFiLnRpdGxlO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHN3aXRjaCAodGFiPy50eXBlKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcIldhdGNoTm93XCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcIk9yaWdpbmFsc1wiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0bmV3VGFicy5wdXNoKHRhYik7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiU3RvcmVcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChWZXJzaW9uID49IDU0KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChWZXJzaW9uID49IDc0KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0dGFiLmRlc3RpbmF0aW9uVHlwZSA9IFwiVGFyZ2V0XCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0dGFiLnRhcmdldCA9IHsgXCJpZFwiOiBcInRhaG9tYV9zdG9yZVwiLCBcInR5cGVcIjogXCJSb290XCIsIFwidXJsXCI6IFwiaHR0cHM6Ly90di5hcHBsZS5jb20vc3RvcmVcIiB9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHRhYi51bml2ZXJzYWxMaW5rcyA9IFtcImh0dHBzOi8vdHYuYXBwbGUuY29tL3N0b3JlXCIsIFwiaHR0cHM6Ly90di5hcHBsZS5jb20vbW92aWVzXCIsIFwiaHR0cHM6Ly90di5hcHBsZS5jb20vdHYtc2hvd3NcIl07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVsZXRlIHRhYj8uc3ViVGFicztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRuZXdUYWJzLnB1c2godGFiKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiTW92aWVzXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcIlRWXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoVmVyc2lvbiA8IDU0KSB0YWIuc2Vjb25kYXJ5RW5hYmxlZCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoVmVyc2lvbiA8IDU0KSBuZXdUYWJzLnB1c2godGFiKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJNTFNcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChWZXJzaW9uID49IDY0KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHN3aXRjaCAoUGxhdGZvcm0pIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiYXR2XCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcImlwYWRcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiYXBwbGV0dlwiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJkZXNrdG9wXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG5ld1RhYnMucHVzaCh0YWIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJpcGhvbmVcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiU3BvcnRzXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcIktpZHNcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChWZXJzaW9uIDwgNTQpIHRhYi5zZWNvbmRhcnlFbmFibGVkID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChWZXJzaW9uIDwgNTQpIG5ld1RhYnMucHVzaCh0YWIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHN3aXRjaCAoUGxhdGZvcm0pIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiYXR2XCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcImlwYWRcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiYXBwbGV0dlwiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJkZXNrdG9wXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG5ld1RhYnMucHVzaCh0YWIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcImlwaG9uZVwiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJTZWFyY2hcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChWZXJzaW9uID49IDc0KSB0YWIudGFyZ2V0LmlkID0gXCJ0YWhvbWFfc2VhcmNobGFuZGluZ1wiO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0bmV3VGFicy5wdXNoKHRhYik7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiQ2hhbm5lbHNBbmRBcHBzXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoVmVyc2lvbiA+PSA3NCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzd2l0Y2ggKFBsYXRmb3JtKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcImF0dlwiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJpcGFkXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxldHZcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG5ld1RhYnMucHVzaCh0YWIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcImRlc2t0b3BcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiaXBob25lXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJMaWJyYXJ5XCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG5ld1RhYnMucHVzaCh0YWIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCQubG9nKGDwn5qnICR7JC5uYW1lfWAsIGBuZXdUYWJzOiAke0pTT04uc3RyaW5naWZ5KG5ld1RhYnMpfWAsIFwiXCIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJvZHkuZGF0YS5hcHBsaWNhdGlvblByb3BzLnRhYnMgPSBuZXdUYWJzO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ym9keS5kYXRhLmFwcGxpY2F0aW9uUHJvcHMudGFicyA9IENvbmZpZ3MuVGFicy5tYXAoKHRhYiwgaW5kZXgpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChTZXR0aW5ncy5UYWJzLmluY2x1ZGVzKHRhYj8udHlwZSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0dGFiID0gYm9keS5kYXRhLmFwcGxpY2F0aW9uUHJvcHMudGFicy5maW5kKFRhYiA9PiBUYWI/LnR5cGUgPT09IHRhYj8udHlwZSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCQubG9nKEpTT04uc3RyaW5naWZ5KHRhYikpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoIXRhYikgdGFiID0gQ29uZmlncy5UYWJzLmZpbmQoVGFiID0+IFRhYj8udHlwZSA9PT0gdGFiPy50eXBlKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHRhYiA9IENvbmZpZ3MuVGFicy5maW5kKFRhYiA9PiBUYWI/LnR5cGUgPT09IHRhYj8udHlwZSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJvZHkuZGF0YS5hcHBsaWNhdGlvblByb3BzLnRhYnMuc3BsaWNlKGluZGV4LCAwLCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJvZHkuZGF0YS5hcHBsaWNhdGlvblByb3BzLnRhYnMgPSBDb25maWdzLlRhYnMubWFwKHRhYiA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoU2V0dGluZ3MuVGFicy5pbmNsdWRlcyh0YWI/LnR5cGUpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHN3aXRjaCAodGFiPy5kZXN0aW5hdGlvblR5cGUpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiU3ViVGFic1wiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0dGFiLnN1YlRhYnMgPSB0YWIuc3ViVGFicy5tYXAoc3ViVGFiID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3ViVGFiLnRpdGxlID0gQ29uZmlncy5pMThuPy5bc3ViVGFiLnR5cGVdPy5nZXQoTG9jYWxlKSA/PyB0YWIudGl0bGU7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBzdWJUYWI7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiVGFyZ2V0XCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcIkNsaWVudFwiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0dGFiLnRpdGxlID0gQ29uZmlncy5pMThuPy5bdGFiLnR5cGVdPy5nZXQoTG9jYWxlKSA/PyB0YWIudGl0bGU7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3dpdGNoICh0YWI/LnR5cGUpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiV2F0Y2hOb3dcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiT3JpZ2luYWxzXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdGFiO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJTdG9yZVwiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKFZlcnNpb24gPj0gNTQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKFZlcnNpb24gPj0gNzQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR0YWIuZGVzdGluYXRpb25UeXBlID0gXCJUYXJnZXRcIjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR0YWIudGFyZ2V0ID0geyBcImlkXCI6IFwidGFob21hX3N0b3JlXCIsIFwidHlwZVwiOiBcIlJvb3RcIiwgXCJ1cmxcIjogXCJodHRwczovL3R2LmFwcGxlLmNvbS9zdG9yZVwiIH07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0dGFiLnVuaXZlcnNhbExpbmtzID0gW1wiaHR0cHM6Ly90di5hcHBsZS5jb20vc3RvcmVcIiwgXCJodHRwczovL3R2LmFwcGxlLmNvbS9tb3ZpZXNcIiwgXCJodHRwczovL3R2LmFwcGxlLmNvbS90di1zaG93c1wiXTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkZWxldGUgdGFiPy5zdWJUYWJzO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiB0YWI7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2UgcmV0dXJuO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJNb3ZpZXNcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiVFZcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChWZXJzaW9uIDwgNTQpIHRhYi5zZWNvbmRhcnlFbmFibGVkID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChWZXJzaW9uIDwgNTQpIHJldHVybiB0YWI7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRlbHNlIHJldHVybjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiTUxTXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoVmVyc2lvbiA+PSA2NCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzd2l0Y2ggKFBsYXRmb3JtKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcImF0dlwiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJpcGFkXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxldHZcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiZGVza3RvcFwiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdGFiO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJpcGhvbmVcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSByZXR1cm47XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcIlNwb3J0c1wiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJLaWRzXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoVmVyc2lvbiA8IDU0KSB0YWIuc2Vjb25kYXJ5RW5hYmxlZCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoVmVyc2lvbiA8IDU0KSByZXR1cm4gdGFiO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHN3aXRjaCAoUGxhdGZvcm0pIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiYXR2XCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcImlwYWRcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiYXBwbGV0dlwiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJkZXNrdG9wXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiB0YWI7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcImlwaG9uZVwiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiU2VhcmNoXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoVmVyc2lvbiA+PSA3NCkgdGFiLnRhcmdldC5pZCA9IFwidGFob21hX3NlYXJjaGxhbmRpbmdcIjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiB0YWI7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcIkxpYnJhcnlcIjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHRhYjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSkuZmlsdGVyKEJvb2xlYW4pO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCovXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9ib2R5LmRhdGEuYXBwbGljYXRpb25Qcm9wcy50YWJzID0gY3JlYXRlVGFic0dyb3VwKFwiVGFic1wiLCBjYWxsZXIsIHBsYXRmb3JtLCBsb2NhbGUsIHJlZ2lvbik7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9ib2R5LmRhdGEuYXBwbGljYXRpb25Qcm9wcy50dkFwcEVuYWJsZWRJblN0b3JlZnJvbnQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vYm9keS5kYXRhLmFwcGxpY2F0aW9uUHJvcHMuZW5hYmxlZENsaWVudEZlYXR1cmVzID0gKFVSTC5xdWVyeT8udiA+IDUzKSA/IFt7IFwiZG9tYWluXCI6IFwidHZhcHBcIiwgXCJuYW1lXCI6IFwic253cGNyXCIgfSwgeyBcImRvbWFpblwiOiBcInR2YXBwXCIsIFwibmFtZVwiOiBcInN0b3JlX3RhYlwiIH1dXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9cdDogW3sgXCJkb21haW5cIjogXCJ0dmFwcFwiLCBcIm5hbWVcIjogXCJleHBhbnNlXCIgfSwgeyBcImRvbWFpblwiOiBcInR2YXBwXCIsIFwibmFtZVwiOiBcInN5bmRpY2F0aW9uXCIgfSwgeyBcImRvbWFpblwiOiBcInR2YXBwXCIsIFwibmFtZVwiOiBcInNud3BjclwiIH1dO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vYm9keS5kYXRhLmFwcGxpY2F0aW9uUHJvcHMuc3RvcmVmcm9udC5sb2NhbGVzU3VwcG9ydGVkID0gW1wiemhfSGFuc1wiLCBcInpoX0hhbnRcIiwgXCJ5dWUtSGFudFwiLCBcImVuX1VTXCIsIFwiZW5fR0JcIl07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9ib2R5LmRhdGEuYXBwbGljYXRpb25Qcm9wcy5zdG9yZWZyb250LnN0b3JlZnJvbnRJZCA9IDE0MzQ3MDtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvL2JvZHkuZGF0YS5hcHBsaWNhdGlvblByb3BzLmZlYXR1cmVFbmFibGVyc1tcInRvcFNoZWxmXCJdID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvL2JvZHkuZGF0YS5hcHBsaWNhdGlvblByb3BzLmZlYXR1cmVFbmFibGVyc1tcInNwb3J0c1wiXSA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9ib2R5LmRhdGEuYXBwbGljYXRpb25Qcm9wcy5mZWF0dXJlRW5hYmxlcnNbXCJzcG9ydHNGYXZvcml0ZXNcIl0gPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vYm9keS5kYXRhLmFwcGxpY2F0aW9uUHJvcHMuZmVhdHVyZUVuYWJsZXJzW1widW53XCJdID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvL2JvZHkuZGF0YS5hcHBsaWNhdGlvblByb3BzLmZlYXR1cmVFbmFibGVyc1tcImltYWdlQmFzZWRTdWJ0aXRsZXNcIl0gPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvL2JvZHkuZGF0YS5hcHBsaWNhdGlvblByb3BzLmZlYXR1cmVFbmFibGVyc1tcImFnZVZlcmlmaWNhdGlvblwiXSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vYm9keS5kYXRhLmFwcGxpY2F0aW9uUHJvcHMuZmVhdHVyZUVuYWJsZXJzW1wic2Vhc29uVGl0bGVzXCJdID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9ib2R5LmRhdGEudXNlclByb3BzLmFjdGl2ZVVzZXIgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vYm9keS5kYXRhLnVzZXJQcm9wcy51dHNjID0gXCIxOjE4OTQzXCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9ib2R5LmRhdGEudXNlclByb3BzLmNvdW50cnkgPSBjb3VudHJ5O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vYm9keS5kYXRhLnVzZXJQcm9wcy5nYWMgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJ1dHMvdjMvdXNlci9zZXR0aW5nc1wiOlxuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcInV0cy92My9jYW52YXNlcy9Sb290cy93YXRjaE5vd1wiOiAvLyDnq4vljbPop4LnnItcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwidXRzL3YzL2NhbnZhc2VzL0NoYW5uZWxzL3R2cy5zYmQuNDAwMFwiOiAvLyBBcHBsZSBUVitcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwidXRzL3YzL2NhbnZhc2VzL0NoYW5uZWxzL3R2cy5zYmQuNzAwMFwiOiAvLyBNTFMgU2Vhc29uIFBhc3Ncblx0XHRcdFx0XHRcdFx0XHRcdGxldCBzaGVsdmVzID0gYm9keT8uZGF0YT8uY2FudmFzPy5zaGVsdmVzO1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHNoZWx2ZXMpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0c2hlbHZlcyA9IHNoZWx2ZXMubWFwKHNoZWxmID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoc2hlbGY/Lml0ZW1zKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzaGVsZi5pdGVtcyA9IHNoZWxmLml0ZW1zLm1hcChpdGVtID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0bGV0IHBsYXlhYmxlID0gaXRlbT8ucGxheWFibGUgfHwgaXRlbT8udmlkZW9zPy5zaGVsZlZpZGVvVGFsbDtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0bGV0IHBsYXlhYmxlcyA9IGl0ZW0/LnBsYXlhYmxlcztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKHBsYXlhYmxlKSBwbGF5YWJsZSA9IHNldFBsYXlhYmxlKHBsYXlhYmxlLCBTZXR0aW5ncz8uSExTVXJsLCBTZXR0aW5ncz8uU2VydmVyVXJsKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKHBsYXlhYmxlcykgT2JqZWN0LmtleXMocGxheWFibGVzKS5mb3JFYWNoKHBsYXlhYmxlID0+IHBsYXlhYmxlc1twbGF5YWJsZV0gPSBzZXRQbGF5YWJsZShwbGF5YWJsZXNbcGxheWFibGVdLCBTZXR0aW5ncz8uSExTVXJsLCBTZXR0aW5ncz8uU2VydmVyVXJsKSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBpdGVtO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gc2hlbGY7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRib2R5LmRhdGEuY2FudmFzLnNoZWx2ZXMgPSBzaGVsdmVzO1xuXHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJ1dHMvdjMvc2hlbHZlcy91dHMuY29sLlVwTmV4dFwiOiAvLyDlvoXmkq3muIXllq5cblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwidXRzL3YzL3NoZWx2ZXMvdXRzLmNvbC5DaGFubmVsVXBOZXh0LnR2cy5zYmQuNDAwMFwiOiAvLyBBcHBsZSBUVisg5b6F5pKt56+A55uuXG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcInV0cy92My9zaGVsdmVzL3V0cy5jb2wuQ2hhbm5lbFVwTmV4dC50dnMuc2JkLjcwMDBcIjogLy8gTUxTIFNlYXNvbiBQYXNzIOW+heaSreevgOebrlxuXHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJ1dHMvdjMvc2hlbHZlcy9lZHQuY29sLjYyZDcyMjllLWQ5YTEtNGYwMC05OGU1LTQ1OGMxMWVkMzkzOFwiOiAvLyDnsr7pgbjmjqjolqZcblx0XHRcdFx0XHRcdFx0XHRcdGxldCBzaGVsZiA9IGJvZHk/LmRhdGE/LnNoZWxmO1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHNoZWxmPy5pdGVtcykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRzaGVsZi5pdGVtcyA9IHNoZWxmLml0ZW1zLm1hcChpdGVtID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRsZXQgcGxheWFibGUgPSBpdGVtPy5wbGF5YWJsZSB8fCBpdGVtPy52aWRlb3M/LnNoZWxmVmlkZW9UYWxsO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGxldCBwbGF5YWJsZXMgPSBpdGVtPy5wbGF5YWJsZXM7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKHBsYXlhYmxlKSBwbGF5YWJsZSA9IHNldFBsYXlhYmxlKHBsYXlhYmxlLCBTZXR0aW5ncz8uSExTVXJsLCBTZXR0aW5ncz8uU2VydmVyVXJsKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAocGxheWFibGVzKSBPYmplY3Qua2V5cyhwbGF5YWJsZXMpLmZvckVhY2gocGxheWFibGUgPT4gcGxheWFibGVzW3BsYXlhYmxlXSA9IHNldFBsYXlhYmxlKHBsYXlhYmxlc1twbGF5YWJsZV0sIFNldHRpbmdzPy5ITFNVcmwsIFNldHRpbmdzPy5TZXJ2ZXJVcmwpKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gaXRlbTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0XHRcdHN3aXRjaCAoUEFUSHNbMF0pIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcInV0c1wiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHN3aXRjaCAoUEFUSHNbMV0pIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJ2M1wiOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzd2l0Y2ggKFBBVEhzWzJdKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcIm1vdmllc1wiOiAvLyB1dHMvdjMvbW92aWVzL1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJzaG93c1wiOiAvLyB1dHMvdjMvc2hvd3MvXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSBcInNwb3J0aW5nLWV2ZW50c1wiOiAvLyB1dHMvdjMvc3BvcnRpbmctZXZlbnRzL1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0bGV0IHNoZWx2ZXMgPSBib2R5Py5kYXRhPy5jYW52YXM/LnNoZWx2ZXM7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRsZXQgYmFja2dyb3VuZFZpZGVvID0gYm9keT8uZGF0YT8uY29udGVudD8uYmFja2dyb3VuZFZpZGVvO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0bGV0IHBsYXlhYmxlcyA9IGJvZHk/LmRhdGE/LnBsYXlhYmxlcztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChzaGVsdmVzKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHNoZWx2ZXMgPSBzaGVsdmVzLm1hcChzaGVsZiA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKHNoZWxmPy5pdGVtcykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c2hlbGYuaXRlbXMgPSBzaGVsZi5pdGVtcy5tYXAoaXRlbSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGxldCBwbGF5YWJsZSA9IGl0ZW0/LnBsYXlhYmxlIHx8IGl0ZW0/LnZpZGVvcz8uc2hlbGZWaWRlb1RhbGw7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGxldCBwbGF5YWJsZXMgPSBpdGVtPy5wbGF5YWJsZXM7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChwbGF5YWJsZSkgcGxheWFibGUgPSBzZXRQbGF5YWJsZShwbGF5YWJsZSwgU2V0dGluZ3M/LkhMU1VybCwgU2V0dGluZ3M/LlNlcnZlclVybCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChwbGF5YWJsZXMpIE9iamVjdC5rZXlzKHBsYXlhYmxlcykuZm9yRWFjaChwbGF5YWJsZSA9PiBwbGF5YWJsZXNbcGxheWFibGVdID0gc2V0UGxheWFibGUocGxheWFibGVzW3BsYXlhYmxlXSwgU2V0dGluZ3M/LkhMU1VybCwgU2V0dGluZ3M/LlNlcnZlclVybCkpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gaXRlbTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHNoZWxmO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ym9keS5kYXRhLmNhbnZhcy5zaGVsdmVzID0gc2hlbHZlcztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoYmFja2dyb3VuZFZpZGVvKSBiYWNrZ3JvdW5kVmlkZW8gPSBzZXRQbGF5YWJsZShiYWNrZ3JvdW5kVmlkZW8sIFNldHRpbmdzPy5ITFNVcmwsIFNldHRpbmdzPy5TZXJ2ZXJVcmwpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKHBsYXlhYmxlcykgT2JqZWN0LmtleXMocGxheWFibGVzKS5mb3JFYWNoKHBsYXlhYmxlID0+IHBsYXlhYmxlc1twbGF5YWJsZV0gPSBzZXRQbGF5YWJsZShwbGF5YWJsZXNbcGxheWFibGVdLCBTZXR0aW5ncz8uSExTVXJsLCBTZXR0aW5ncz8uU2VydmVyVXJsKSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHQvL2lmIChQQVRILmluY2x1ZGVzKFwidXRzL3YzL2NhbnZhc2VzL0NoYW5uZWxzL1wiKSkgJHJlc3BvbnNlLmJvZHkgPSBhd2FpdCBnZXREYXRhKFwiVmlld1wiLCBTZXR0aW5ncywgQ29uZmlncyk7XG5cdFx0XHRcdFx0XHRcdFx0XHQvL2Vsc2UgaWYgKFBBVEguaW5jbHVkZXMoXCJ1dHMvdjIvYnJhbmRzL1wiKSkgJHJlc3BvbnNlLmJvZHkgPSBhd2FpdCBnZXREYXRhKFwiVmlld1wiLCBTZXR0aW5ncywgQ29uZmlncyk7XG5cdFx0XHRcdFx0XHRcdFx0XHQvL2Vsc2UgaWYgKFBBVEguaW5jbHVkZXMoXCJ1dHMvdjMvbW92aWVzL1wiKSkgJHJlc3BvbnNlLmJvZHkgPSBhd2FpdCBnZXREYXRhKFwiVmlld1wiLCBTZXR0aW5ncywgQ29uZmlncyk7XG5cdFx0XHRcdFx0XHRcdFx0XHQvL2Vsc2UgaWYgKFBBVEguaW5jbHVkZXMoXCJ1dHMvdjMvc2hvd3MvXCIpKSAkcmVzcG9uc2UuYm9keSA9IGF3YWl0IGdldERhdGEoXCJWaWV3XCIsIFNldHRpbmdzLCBDb25maWdzKTtcblx0XHRcdFx0XHRcdFx0XHRcdC8vZWxzZSBpZiAoUEFUSC5pbmNsdWRlcyhcInV0cy92My9zaGVsdmVzL1wiKSkgJHJlc3BvbnNlLmJvZHkgPSBhd2FpdCBnZXREYXRhKFwiVmlld1wiLCBTZXR0aW5ncywgQ29uZmlncyk7XG5cdFx0XHRcdFx0XHRcdFx0XHQvL2Vsc2UgaWYgKFBBVEguaW5jbHVkZXMoXCJ1dHMvdjMvcGxheWFibGVzL1wiKSkgJHJlc3BvbnNlLmJvZHkgPSBhd2FpdCBnZXREYXRhKFwiVmlld1wiLCBTZXR0aW5ncywgQ29uZmlncyk7XG5cdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIFwidW1jLXRlbXBvLWFwaS5hcHBsZS5jb21cIjpcblx0XHRcdFx0XHRcdFx0Ly8g6Lev5b6E5Yik5patXG5cdFx0XHRcdFx0XHRcdHN3aXRjaCAoUEFUSCkge1xuXHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJ2My9yZWdpc3RlclwiOlxuXHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJ2My9jaGFubmVscy9zY29yZWJvYXJkXCI6XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcInYzL2NoYW5uZWxzL3Njb3JlYm9hcmQvXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHQkLmxvZyhKU09OLnN0cmluZ2lmeShib2R5KSk7XG5cdFx0XHRcdFx0XHRcdFx0XHQvL2JvZHkuY2hhbm5lbHMuc3RvcmVGcm9udCA9IFwiVU5JVEVEX1NUQVRFU1wiO1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly9ib2R5LmNoYW5uZWxzLnN0b3JlRnJvbnQgPSBcIlRBSVdBTlwiO1xuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0XHRcdC8vaWYgKFBBVEguaW5jbHVkZXMoXCJ2My9yZWdpc3Rlci9cIikpIFR5cGUgPSBcIlNwb3J0c1wiO1xuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0JHJlc3BvbnNlLmJvZHkgPSBKU09OLnN0cmluZ2lmeShib2R5KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3Byb3RvYnVmXCI6XG5cdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi94LXByb3RvYnVmXCI6XG5cdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi92bmQuZ29vZ2xlLnByb3RvYnVmXCI6XG5cdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi9ncnBjXCI6XG5cdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi9ncnBjK3Byb3RvXCI6XG5cdFx0XHRcdGNhc2UgXCJhcHBsZWNhdGlvbi9vY3RldC1zdHJlYW1cIjpcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH07XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIGZhbHNlOlxuXHRcdFx0YnJlYWs7XG5cdH07XG59KSgpXG5cdC5jYXRjaCgoZSkgPT4gJC5sb2dFcnIoZSkpXG5cdC5maW5hbGx5KCgpID0+IHtcblx0XHRzd2l0Y2ggKCRyZXNwb25zZSkge1xuXHRcdFx0ZGVmYXVsdDogeyAvLyDmnInlm57lpI3mlbDmja7vvIzov5Tlm57lm57lpI3mlbDmja5cblx0XHRcdFx0Ly9jb25zdCBGT1JNQVQgPSAoJHJlc3BvbnNlPy5oZWFkZXJzPy5bXCJDb250ZW50LVR5cGVcIl0gPz8gJHJlc3BvbnNlPy5oZWFkZXJzPy5bXCJjb250ZW50LXR5cGVcIl0pPy5zcGxpdChcIjtcIik/LlswXTtcblx0XHRcdFx0JC5sb2coYPCfjokgJHskLm5hbWV9LCBmaW5hbGx5YCwgYCRyZXNwb25zZWAsIGBGT1JNQVQ6ICR7Rk9STUFUfWAsIFwiXCIpO1xuXHRcdFx0XHQvLyQubG9nKGDwn5qnICR7JC5uYW1lfSwgZmluYWxseWAsIGAkcmVzcG9uc2U6ICR7SlNPTi5zdHJpbmdpZnkoJHJlc3BvbnNlKX1gLCBcIlwiKTtcblx0XHRcdFx0aWYgKCRyZXNwb25zZT8uaGVhZGVycz8uW1wiQ29udGVudC1FbmNvZGluZ1wiXSkgJHJlc3BvbnNlLmhlYWRlcnNbXCJDb250ZW50LUVuY29kaW5nXCJdID0gXCJpZGVudGl0eVwiO1xuXHRcdFx0XHRpZiAoJHJlc3BvbnNlPy5oZWFkZXJzPy5bXCJjb250ZW50LWVuY29kaW5nXCJdKSAkcmVzcG9uc2UuaGVhZGVyc1tcImNvbnRlbnQtZW5jb2RpbmdcIl0gPSBcImlkZW50aXR5XCI7XG5cdFx0XHRcdGlmICgkLmlzUXVhblgoKSkge1xuXHRcdFx0XHRcdHN3aXRjaCAoRk9STUFUKSB7XG5cdFx0XHRcdFx0XHRjYXNlIHVuZGVmaW5lZDogLy8g6KeG5Li65pegYm9keVxuXHRcdFx0XHRcdFx0XHQvLyDov5Tlm57mma7pgJrmlbDmja5cblx0XHRcdFx0XHRcdFx0JC5kb25lKHsgc3RhdHVzOiAkcmVzcG9uc2Uuc3RhdHVzLCBoZWFkZXJzOiAkcmVzcG9uc2UuaGVhZGVycyB9KTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHQvLyDov5Tlm57mma7pgJrmlbDmja5cblx0XHRcdFx0XHRcdFx0JC5kb25lKHsgc3RhdHVzOiAkcmVzcG9uc2Uuc3RhdHVzLCBoZWFkZXJzOiAkcmVzcG9uc2UuaGVhZGVycywgYm9keTogJHJlc3BvbnNlLmJvZHkgfSk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3Byb3RvYnVmXCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24veC1wcm90b2J1ZlwiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxpY2F0aW9uL3ZuZC5nb29nbGUucHJvdG9idWZcIjpcblx0XHRcdFx0XHRcdGNhc2UgXCJhcHBsaWNhdGlvbi9ncnBjXCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiYXBwbGljYXRpb24vZ3JwYytwcm90b1wiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcImFwcGxlY2F0aW9uL29jdGV0LXN0cmVhbVwiOlxuXHRcdFx0XHRcdFx0XHQvLyDov5Tlm57kuozov5vliLbmlbDmja5cblx0XHRcdFx0XHRcdFx0Ly8kLmxvZyhgJHskcmVzcG9uc2UuYm9keUJ5dGVzLmJ5dGVMZW5ndGh9LS0tJHskcmVzcG9uc2UuYm9keUJ5dGVzLmJ1ZmZlci5ieXRlTGVuZ3RofWApO1xuXHRcdFx0XHRcdFx0XHQkLmRvbmUoeyBzdGF0dXM6ICRyZXNwb25zZS5zdGF0dXMsIGhlYWRlcnM6ICRyZXNwb25zZS5oZWFkZXJzLCBib2R5Qnl0ZXM6ICRyZXNwb25zZS5ib2R5Qnl0ZXMuYnVmZmVyLnNsaWNlKCRyZXNwb25zZS5ib2R5Qnl0ZXMuYnl0ZU9mZnNldCwgJHJlc3BvbnNlLmJvZHlCeXRlcy5ieXRlTGVuZ3RoICsgJHJlc3BvbnNlLmJvZHlCeXRlcy5ieXRlT2Zmc2V0KSB9KTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fSBlbHNlICQuZG9uZSgkcmVzcG9uc2UpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH07XG5cdFx0XHRjYXNlIHVuZGVmaW5lZDogeyAvLyDml6Dlm57lpI3mlbDmja5cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9O1xuXHRcdH07XG5cdH0pXG5cbi8qKioqKioqKioqKioqKioqKiBGdW5jdGlvbiAqKioqKioqKioqKioqKioqKi9cbmZ1bmN0aW9uIHNldFBsYXlhYmxlKHBsYXlhYmxlLCBITFNVcmwsIFNlcnZlclVybCkge1xuXHQkLmxvZyhg4piR77iPICR7JC5uYW1lfSwgU2V0IFBsYXlhYmxlIENvbnRlbnRgLCBcIlwiKTtcblx0bGV0IGFzc2V0cyA9IHBsYXlhYmxlPy5hc3NldHM7XG5cdGxldCBpdHVuZXNNZWRpYUFwaURhdGEgPSBwbGF5YWJsZT8uaXR1bmVzTWVkaWFBcGlEYXRhO1xuXHRpZiAoYXNzZXRzKSBhc3NldHMgPSBzZXRVcmwoYXNzZXRzLCBITFNVcmwsIFNlcnZlclVybCk7XG5cdGlmIChpdHVuZXNNZWRpYUFwaURhdGE/Lm1vdmllQ2xpcHMpIGl0dW5lc01lZGlhQXBpRGF0YS5tb3ZpZUNsaXBzID0gaXR1bmVzTWVkaWFBcGlEYXRhLm1vdmllQ2xpcHMubWFwKG1vdmllQ2xpcCA9PiBzZXRVcmwobW92aWVDbGlwLCBITFNVcmwsIFNlcnZlclVybCkpO1xuXHRpZiAoaXR1bmVzTWVkaWFBcGlEYXRhPy5vZmZlcnMpIGl0dW5lc01lZGlhQXBpRGF0YS5vZmZlcnMgPSBpdHVuZXNNZWRpYUFwaURhdGEub2ZmZXJzLm1hcChvZmZlciA9PiBzZXRVcmwob2ZmZXIsIEhMU1VybCwgU2VydmVyVXJsKSk7XG5cdGlmIChpdHVuZXNNZWRpYUFwaURhdGE/LnBlcnNvbmFsaXplZE9mZmVycykgaXR1bmVzTWVkaWFBcGlEYXRhLnBlcnNvbmFsaXplZE9mZmVycyA9IGl0dW5lc01lZGlhQXBpRGF0YS5wZXJzb25hbGl6ZWRPZmZlcnMubWFwKHBlcnNvbmFsaXplZE9mZmVyID0+IHNldFVybChwZXJzb25hbGl6ZWRPZmZlciwgSExTVXJsLCBTZXJ2ZXJVcmwpKTtcblx0JC5sb2coYOKchSAkeyQubmFtZX0sIFNldCBQbGF5YWJsZSBDb250ZW50YCwgXCJcIik7XG5cdHJldHVybiBwbGF5YWJsZTtcblxuXHRmdW5jdGlvbiBzZXRVcmwoYXNzZXQsIEhMU1VybCwgU2VydmVyVXJsKSB7XG5cdFx0JC5sb2coYOKYke+4jyAkeyQubmFtZX0sIFNldCBVcmxgLCBcIlwiKTtcblx0XHRpZiAoYXNzZXQ/Lmhsc1VybCkge1xuXHRcdFx0bGV0IGhsc1VybCA9IFVSSS5wYXJzZShhc3NldC5obHNVcmwpO1xuXHRcdFx0c3dpdGNoIChobHNVcmwucGF0aCkge1xuXHRcdFx0XHRjYXNlIFwiV2ViT2JqZWN0cy9NWlBsYXkud29hL2hscy9wbGF5bGlzdC5tM3U4XCI6XG5cdFx0XHRcdFx0Ly9obHNVcmwuaG9zdCA9IEhMU1VybCB8fCBcInBsYXkuaXR1bmVzLmFwcGxlLmNvbVwiO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwiV2ViT2JqZWN0cy9NWlBsYXlMb2NhbC53b2EvaGxzL3N1YnNjcmlwdGlvbi9wbGF5bGlzdC5tM3U4XCI6XG5cdFx0XHRcdFx0aGxzVXJsLmhvc3QgPSBITFNVcmwgfHwgXCJwbGF5LWVkZ2UuaXR1bmVzLmFwcGxlLmNvbVwiO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwiV2ViT2JqZWN0cy9NWlBsYXkud29hL2hscy93b3Jrb3V0L3BsYXlsaXN0Lm0zdThcIjpcblx0XHRcdFx0XHQvL2hsc1VybC5ob3N0ID0gSExTVXJsIHx8IFwicGxheS5pdHVuZXMuYXBwbGUuY29tXCI7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9O1xuXHRcdFx0YXNzZXQuaGxzVXJsID0gVVJJLnN0cmluZ2lmeShobHNVcmwpO1xuXHRcdH07XG5cdFx0aWYgKGFzc2V0Py5mcHNLZXlTZXJ2ZXJVcmwpIHtcblx0XHRcdGxldCBmcHNLZXlTZXJ2ZXJVcmwgPSBVUkkucGFyc2UoYXNzZXQuZnBzS2V5U2VydmVyVXJsKTtcblx0XHRcdGZwc0tleVNlcnZlclVybC5ob3N0ID0gU2VydmVyVXJsIHx8IFwicGxheS5pdHVuZXMuYXBwbGUuY29tXCI7XG5cdFx0XHRhc3NldC5mcHNLZXlTZXJ2ZXJVcmwgPSBVUkkuc3RyaW5naWZ5KGZwc0tleVNlcnZlclVybCk7XG5cdFx0fTtcblx0XHRpZiAoYXNzZXQ/LmZwc05vbmNlU2VydmVyVXJsKSB7XG5cdFx0XHRsZXQgZnBzTm9uY2VTZXJ2ZXJVcmwgPSBVUkkucGFyc2UoYXNzZXQuZnBzTm9uY2VTZXJ2ZXJVcmwpO1xuXHRcdFx0ZnBzTm9uY2VTZXJ2ZXJVcmwuaG9zdCA9IFNlcnZlclVybCB8fCBcInBsYXkuaXR1bmVzLmFwcGxlLmNvbVwiO1xuXHRcdFx0YXNzZXQuZnBzTm9uY2VTZXJ2ZXJVcmwgPSBVUkkuc3RyaW5naWZ5KGZwc05vbmNlU2VydmVyVXJsKTtcblx0XHR9O1xuXHRcdCQubG9nKGDinIUgJHskLm5hbWV9LCBTZXQgVXJsYCwgXCJcIik7XG5cdFx0cmV0dXJuIGFzc2V0O1xuXHR9O1xufTtcblxuYXN5bmMgZnVuY3Rpb24gZ2V0RGF0YSh0eXBlLCBzZXR0aW5ncywgZGF0YWJhc2UpIHtcblx0JC5sb2coYOKaoCAkeyQubmFtZX0sIEdldCBWaWV3IERhdGFgLCBcIlwiKTtcblx0bGV0IENDcyA9IFtzZXR0aW5ncy5Db3VudHJ5Q29kZVt0eXBlXSwgXCJVU1wiLCBcIkdCXCJdLmZsYXQoSW5maW5pdHkpO1xuXHQkLmxvZyhgQ0NzPSR7Q0NzfWApXG5cdC8v5p+l6K+i5piv5ZCm5pyJ56ym5ZCI6K+t6KiA55qE5a2X5bmVXG5cdGxldCBkYXRhID0gW107XG5cdGZvciBhd2FpdCAoY29uc3QgQ0Mgb2YgQ0NzKSB7XG5cdFx0bGV0IHJlcXVlc3QgPSB7XG5cdFx0XHRcInVybFwiOiAkcmVxdWVzdC51cmwsXG5cdFx0XHRcImhlYWRlcnNcIjogJHJlcXVlc3QuaGVhZGVyc1xuXHRcdH1cblx0XHRyZXF1ZXN0LnVybCA9IFVSSS5wYXJzZShyZXF1ZXN0LnVybCk7XG5cdFx0cmVxdWVzdC51cmwucXVlcnkuc2YgPSBkYXRhYmFzZS5TdG9yZWZyb250W0NDXVxuXHRcdCQubG9nKGBzZj0ke3JlcXVlc3QudXJsLnF1ZXJ5LnNmfWApXG5cdFx0cmVxdWVzdC51cmwucXVlcnkubG9jYWxlID0gZGF0YWJhc2UuTG9jYWxlW0NDXVxuXHRcdCQubG9nKGBsb2NhbGU9JHtyZXF1ZXN0LnVybC5xdWVyeS5sb2NhbGV9YClcblx0XHRyZXF1ZXN0LnVybCA9IFVSSS5zdHJpbmdpZnkocmVxdWVzdC51cmwpXG5cdFx0JC5sb2coYHJlcXVlc3QudXJsPSR7cmVxdWVzdC51cmx9YClcblx0XHRyZXF1ZXN0LmhlYWRlcnNbXCJYLVN1cmdlLVNraXAtU2NyaXB0aW5nXCJdID0gXCJ0cnVlXCJcblx0XHRkYXRhID0gYXdhaXQgJC5odHRwLmdldChyZXF1ZXN0KS50aGVuKGRhdGEgPT4gZGF0YSk7XG5cdFx0JC5sb2coYGRhdGE9JHtKU09OLnN0cmluZ2lmeShkYXRhKX1gKVxuXHRcdGlmIChkYXRhLnN0YXR1c0NvZGUgPT09IDIwMCB8fCBkYXRhLnN0YXR1cyA9PT0gMjAwICkgYnJlYWs7XG5cdH07XG5cdCQubG9nKGDwn46JICR7JC5uYW1lfSwg6LCD6K+V5L+h5oGvYCwgXCJHZXQgRVhULVgtTUVESUEgRGF0YVwiLCBgZGF0YXM6ICR7SlNPTi5zdHJpbmdpZnkoZGF0YS5ib2R5KX1gLCBcIlwiKTtcblx0cmV0dXJuIGRhdGEuYm9keVxufTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==