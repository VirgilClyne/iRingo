class ENV {
	constructor(name, opts) {
		this.name = name;
		this.version = '1.2.0';
		this.http = new Http(this);
		this.data = null;
		this.dataFile = 'box.dat';
		this.logs = [];
		this.isMute = false;
		this.isNeedRewrite = false;
		this.logSeparator = '\n';
		this.encoding = 'utf-8';
		this.startTime = new Date().getTime();
		Object.assign(this, opts);
		this.log('', `🏁 开始! ENV v${this.version}, ${this.name}`, '');
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
		let json = defaultValue;
		const val = this.getdata(key);
		if (val) {
			try {
				json = JSON.parse(this.getdata(key));
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
			this.get({ url }, (error, response, body) => resolve(body));
		})
	}

	runScript(script, runOpts) {
		return new Promise((resolve) => {
			let httpapi = this.getdata('@chavy_boxjs_userCfgs.httpapi');
			httpapi = httpapi ? httpapi.replace(/\n/g, '').trim() : httpapi;
			let httpapi_timeout = this.getdata(
				'@chavy_boxjs_userCfgs.httpapi_timeout'
			);
			httpapi_timeout = httpapi_timeout ? httpapi_timeout * 1 : 20;
			httpapi_timeout =
				runOpts && runOpts.timeout ? runOpts.timeout : httpapi_timeout;
			const [key, addr] = httpapi.split('@');
			const opts = {
				url: `http://${addr}/v1/scripting/evaluate`,
				body: {
					script_text: script,
					mock_type: 'cron',
					timeout: httpapi_timeout
				},
				headers: { 'X-Key': key, 'Accept': '*/*' },
				timeout: httpapi_timeout
			};
			this.post(opts, (error, response, body) => resolve(body));
		}).catch((e) => this.logErr(e))
	}

	loaddata() {
		if (this.isNode()) {
			this.fs = this.fs ? this.fs : require('fs');
			this.path = this.path ? this.path : require('path');
			const curDirDataFilePath = this.path.resolve(this.dataFile);
			const rootDirDataFilePath = this.path.resolve(
				process.cwd(),
				this.dataFile
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

	writedata() {
		if (this.isNode()) {
			this.fs = this.fs ? this.fs : require('fs');
			this.path = this.path ? this.path : require('path');
			const curDirDataFilePath = this.path.resolve(this.dataFile);
			const rootDirDataFilePath = this.path.resolve(
				process.cwd(),
				this.dataFile
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
	}

	lodash_get(object = {}, path = "", defaultValue = undefined) {
		// translate array case to dot case, then split with .
		// a[0].b -> a.0.b -> ['a', '0', 'b']
		if (!Array.isArray(path)) path = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
		
		const result = path.reduce((previousValue, currentValue) => {
			return Object(previousValue)[currentValue]; // null undefined get attribute will throwError, Object() can return a object 
		}, object);
		return (result === undefined) ? defaultValue : result;
	}

	lodash_set(object = {}, path = "", value) {
		if (!Array.isArray(path)) path = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
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

	getdata(key) {
		let val = this.getval(key);
		// 如果以 @
		if (/^@/.test(key)) {
			const [, objkey, paths] = /^@(.*?)\.(.*?)$/.exec(key);
			const objval = objkey ? this.getval(objkey) : '';
			if (objval) {
				try {
					const objedval = JSON.parse(objval);
					val = objedval ? this.lodash_get(objedval, paths, '') : val;
				} catch (e) {
					val = '';
				}
			}
		}
		return val
	}

	setdata(val, key) {
		let issuc = false;
		if (/^@/.test(key)) {
			const [, objkey, paths] = /^@(.*?)\.(.*?)$/.exec(key);
			const objdat = this.getval(objkey);
			const objval = objkey
				? objdat === 'null'
					? null
					: objdat || '{}'
				: '{}';
			try {
				const objedval = JSON.parse(objval);
				this.lodash_set(objedval, paths, val);
				issuc = this.setval(JSON.stringify(objedval), objkey);
			} catch (e) {
				const objedval = {};
				this.lodash_set(objedval, paths, val);
				issuc = this.setval(JSON.stringify(objedval), objkey);
			}
		} else {
			issuc = this.setval(val, key);
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
				this.data = this.loaddata();
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
				this.data = this.loaddata();
				this.data[key] = val;
				this.writedata();
				return true
			default:
				return (this.data && this.data[key]) || null
		}
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

	get(request, callback = () => { }) {
		delete request?.headers?.['Content-Length'];
		delete request?.headers?.['content-length'];

		switch (this.platform()) {
			case 'Surge':
			case 'Loon':
			case 'Stash':
			case 'Shadowrocket':
			default:
				if (this.isSurge() && this.isNeedRewrite) {
					this.lodash_set(request, 'headers.X-Surge-Skip-Scripting', false);
				}
				$httpClient.get(request, (error, response, body) => {
					if (!error && response) {
						response.body = body;
						response.statusCode = response.status ? response.status : response.statusCode;
						response.status = response.statusCode;
					}
					callback(error, response, body);
				});
				break
			case 'Quantumult X':
				if (this.isNeedRewrite) {
					this.lodash_set(request, 'opts.hints', false);
				}
				$task.fetch(request).then(
					(response) => {
						const {
							statusCode: status,
							statusCode,
							headers,
							body,
							bodyBytes
						} = response;
						callback(
							null,
							{ status, statusCode, headers, body, bodyBytes },
							body,
							bodyBytes
						);
					},
					(error) => callback((error && error.error) || 'UndefinedError')
				);
				break
			case 'Node.js':
				let iconv = require('iconv-lite');
				this.initGotEnv(request);
				this.got(request)
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
						(response) => {
							const {
								statusCode: status,
								statusCode,
								headers,
								rawBody
							} = response;
							const body = iconv.decode(rawBody, this.encoding);
							callback(
								null,
								{ status, statusCode, headers, rawBody, body },
								body
							);
						},
						(err) => {
							const { message: error, response: response } = err;
							callback(
								error,
								response,
								response && iconv.decode(response.rawBody, this.encoding)
							);
						}
					);
				break
		}
	}

	post(request, callback = () => { }) {
		const method = request.method
			? request.method.toLocaleLowerCase()
			: 'post';

		// 如果指定了请求体, 但没指定 `Content-Type`、`content-type`, 则自动生成。
		if (
			request.body &&
			request.headers &&
			!request.headers['Content-Type'] &&
			!request.headers['content-type']
		) {
			// HTTP/1、HTTP/2 都支持小写 headers
			request.headers['content-type'] = 'application/x-www-form-urlencoded';
		}
		// 为避免指定错误 `content-length` 这里删除该属性，由工具端 (HttpClient) 负责重新计算并赋值
		delete request?.headers?.['Content-Length'];
		delete request?.headers?.['content-length'];
		switch (this.platform()) {
			case 'Surge':
			case 'Loon':
			case 'Stash':
			case 'Shadowrocket':
			default:
				if (this.isSurge() && this.isNeedRewrite) {
					this.lodash_set(request, 'headers.X-Surge-Skip-Scripting', false);
				}
				$httpClient[method](request, (error, response, body) => {
					if (!error && response) {
						response.body = body;
						response.statusCode = response.status ? response.status : response.statusCode;
						response.status = response.statusCode;
					}
					callback(error, response, body);
				});
				break
			case 'Quantumult X':
				request.method = method;
				if (this.isNeedRewrite) {
					this.lodash_set(request, 'opts.hints', false);
				}
				$task.fetch(request).then(
					(response) => {
						const {
							statusCode: status,
							statusCode,
							headers,
							body,
							bodyBytes
						} = response;
						callback(
							null,
							{ status, statusCode, headers, body, bodyBytes },
							body,
							bodyBytes
						);
					},
					(error) => callback((error && error.error) || 'UndefinedError')
				);
				break
			case 'Node.js':
				let iconv = require('iconv-lite');
				this.initGotEnv(request);
				const { url, ..._request } = request;
				this.got[method](url, _request).then(
					(response) => {
						const { statusCode: status, statusCode, headers, rawBody } = response;
						const body = iconv.decode(rawBody, this.encoding);
						callback(
							null,
							{ status, statusCode, headers, rawBody, body },
							body
						);
					},
					(err) => {
						const { message: error, response: response } = err;
						callback(
							error,
							response,
							response && iconv.decode(response.rawBody, this.encoding)
						);
					}
				);
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

	done(val = {}) {
		const endTime = new Date().getTime();
		const costTime = (endTime - this.startTime) / 1000;
		this.log('', `🚩 ${this.name}, 结束! 🕛 ${costTime} 秒`);
		this.log();
		switch (this.platform()) {
			case 'Surge':
			case 'Loon':
			case 'Stash':
			case 'Shadowrocket':
			case 'Quantumult X':
			default:
				$done(val);
				break
			case 'Node.js':
				process.exit(1);
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
				for (let item in arg) this.lodash_set(Argument, item, arg[item]);
				//this.log(JSON.stringify(Argument));
			}			//this.log(`✅ ${this.name}, Get Environment Variables`, `Argument类型: ${typeof Argument}`, `Argument内容: ${JSON.stringify(Argument)}`, "");
		}		/***************** Store *****************/
		const Store = { Settings: database?.Default?.Settings || {}, Configs: database?.Default?.Configs || {}, Caches: {} };
		if (!Array.isArray(names)) names = [names];
		//this.log(`🚧 ${this.name}, Get Environment Variables`, `names类型: ${typeof names}`, `names内容: ${JSON.stringify(names)}`, "");
		for (let name of names) {
			Store.Settings = { ...Store.Settings, ...database?.[name]?.Settings, ...Argument, ...BoxJs?.[name]?.Settings };
			Store.Configs = { ...Store.Configs, ...database?.[name]?.Configs };
			if (BoxJs?.[name]?.Caches && typeof BoxJs?.[name]?.Caches === "string") BoxJs[name].Caches = JSON.parse(BoxJs?.[name]?.Caches);
			Store.Caches = { ...Store.Caches, ...BoxJs?.[name]?.Caches };
		}		//this.log(`🚧 ${this.name}, Get Environment Variables`, `Store.Settings类型: ${typeof Store.Settings}`, `Store.Settings: ${JSON.stringify(Store.Settings)}`, "");
		this.traverseObject(Store.Settings, (key, value) => {
			//this.log(`🚧 ${this.name}, traverseObject`, `${key}: ${typeof value}`, `${key}: ${JSON.stringify(value)}`, "");
			if (value === "true" || value === "false") value = JSON.parse(value); // 字符串转Boolean
			else if (typeof value === "string") {
				if (value.includes(",")) value = value.split(",").map(item => this.string2number(item)); // 字符串转数组转数字
				else value = this.string2number(value); // 字符串转数字
			}			return value;
		});
		//this.log(`✅ ${this.name}, Get Environment Variables`, `Store: ${typeof Store.Caches}`, `Store内容: ${JSON.stringify(Store)}`, "");
		return Store;
	};

	/***************** function *****************/
	traverseObject(o, c) { for (var t in o) { var n = o[t]; o[t] = "object" == typeof n && null !== n ? this.traverseObject(n, c) : c(t, n); } return o }
	string2number(string) { if (string && !isNaN(string)) string = parseInt(string, 10); return string }
}

class Http {
	constructor(env) {
		this.env = env;
	}

	send(opts, method = 'GET') {
		opts = typeof opts === 'string' ? { url: opts } : opts;
		let sender = this.get;
		if (method === 'POST') {
			sender = this.post;
		}
		return new Promise((resolve, reject) => {
			sender.call(this, opts, (error, response, body) => {
				if (error) reject(error);
				else resolve(response);
			});
		})
	}

	get(opts) {
		return this.send.call(this.env, opts)
	}

	post(opts) {
		return this.send.call(this.env, opts, 'POST')
	}
}

let URI$1 = class URI {
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
};

var Settings$6 = {
	Switch: true
};
var Configs$2 = {
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
	Settings: Settings$6,
	Configs: Configs$2
};

var Default$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Configs: Configs$2,
	Settings: Settings$6,
	default: Default
});

var Settings$5 = {
	Switch: true,
	PEP: {
		GCC: "US"
	},
	Services: {
		PlaceData: "CN",
		Directions: "AUTO",
		Traffic: "AUTO",
		RAP: "XX",
		Tiles: "AUTO"
	},
	Geo_manifest: {
		Dynamic: {
			Config: {
				Country_code: {
					"default": "AUTO",
					iOS: "CN",
					iPadOS: "CN",
					watchOS: "US",
					macOS: "CN"
				}
			}
		}
	},
	Config: {
		Announcements: {
			"Environment:": {
				"default": "AUTO",
				iOS: "CN",
				iPadOS: "CN",
				watchOS: "XX",
				macOS: "CN"
			}
		},
		Defaults: {
			LagunaBeach: true,
			DrivingMultiWaypointRoutesEnabled: true,
			GEOAddressCorrection: true,
			LookupMaxParametersCount: true,
			LocalitiesAndLandmarks: true,
			POIBusyness: true,
			PedestrianAR: true,
			"6694982d2b14e95815e44e970235e230": true,
			OpticalHeading: true,
			UseCLPedestrianMapMatchedLocations: true,
			TransitPayEnabled: true,
			SupportsOffline: true,
			SupportsCarIntegration: true,
			WiFiQualityNetworkDisabled: false,
			WiFiQualityTileDisabled: false
		}
	}
};
var Location = {
	Settings: Settings$5
};

var Location$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Settings: Settings$5,
	default: Location
});

var Settings$4 = {
	Switch: true,
	CountryCode: "US",
	newsPlusUser: true
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
	"News": News$1,
	"PrivateRelay": PrivateRelay$1,
	"Siri": Siri$1,
	"TestFlight": TestFlight$1,
	"TV": TV$1,
};

/*
README: https://github.com/VirgilClyne/iRingo
*/

const $$1 = new ENV(" iRingo: Set Environment Variables");

/**
 * Set Environment Variables
 * @author VirgilClyne
 * @param {String} name - Persistent Store Key
 * @param {Array} platforms - Platform Names
 * @param {Object} database - Default DataBase
 * @return {Object} { Settings, Caches, Configs }
 */
function setENV(name, platforms, database) {
	$$1.log(`☑️ ${$$1.name}`, "");
	let { Settings, Caches, Configs } = $$1.getENV(name, platforms, database);
	/***************** Settings *****************/
	if (Settings?.Tabs && !Array.isArray(Settings?.Tabs)) $$1.lodash_set(Settings, "Tabs", (Settings?.Tabs) ? [Settings.Tabs.toString()] : []);
	if (Settings?.Domains && !Array.isArray(Settings?.Domains)) $$1.lodash_set(Settings, "Domains", (Settings?.Domains) ? [Settings.Domains.toString()] : []);
	if (Settings?.Functions && !Array.isArray(Settings?.Functions)) $$1.lodash_set(Settings, "Functions", (Settings?.Functions) ? [Settings.Functions.toString()] : []);
	$$1.log(`✅ ${$$1.name}`, `Settings: ${typeof Settings}`, `Settings内容: ${JSON.stringify(Settings)}`, "");
	/***************** Caches *****************/
	//$.log(`✅ ${$.name}`, `Caches: ${typeof Caches}`, `Caches内容: ${JSON.stringify(Caches)}`, "");
	/***************** Configs *****************/
	Configs.Storefront = new Map(Configs.Storefront);
	if (Configs.Locale) Configs.Locale = new Map(Configs.Locale);
	if (Configs.i18n) for (let type in Configs.i18n) Configs.i18n[type] = new Map(Configs.i18n[type]);
	return { Settings, Caches, Configs };
}

/*
README: https://github.com/VirgilClyne/iRingo
*/


const $ = new ENV(" iRingo: 📺 TV v3.2.3(2) response.beta");
const URI = new URI$1();

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
	const { Settings, Caches, Configs } = setENV("iRingo", "TV", Database$1);
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
													}													switch (tab?.type) {
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
															}															break;
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
																}															}															break;
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
																		break;																}															}															break;
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
																}															}															break;
														case "Library":
														default:
															newTabs.push(tab);
															break;
													}												}											});
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
										}									}									break;
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
											}											return shelf;
										});
										body.data.canvas.shelves = shelves;
									}									break;
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
									}									break;
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
																	}																	return shelf;
																});
																body.data.canvas.shelves = shelves;
															}															if (backgroundVideo) backgroundVideo = setPlayable(backgroundVideo, Settings?.HLSUrl, Settings?.ServerUrl);
															if (playables) Object.keys(playables).forEach(playable => playables[playable] = setPlayable(playables[playable], Settings?.HLSUrl, Settings?.ServerUrl));
															break;
													}													break;
											}											break;
									}									//if (PATH.includes("uts/v3/canvases/Channels/")) $response.body = await getData("View", Settings, Configs);
									//else if (PATH.includes("uts/v2/brands/")) $response.body = await getData("View", Settings, Configs);
									//else if (PATH.includes("uts/v3/movies/")) $response.body = await getData("View", Settings, Configs);
									//else if (PATH.includes("uts/v3/shows/")) $response.body = await getData("View", Settings, Configs);
									//else if (PATH.includes("uts/v3/shelves/")) $response.body = await getData("View", Settings, Configs);
									//else if (PATH.includes("uts/v3/playables/")) $response.body = await getData("View", Settings, Configs);
									break;
							}							break;
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
							}							break;
					}					$response.body = JSON.stringify(body);
					break;
				case "application/protobuf":
				case "application/x-protobuf":
				case "application/vnd.google.protobuf":
				case "application/grpc":
				case "application/grpc+proto":
				case "applecation/octet-stream":
					break;
			}			break;
		case false:
			break;
	}})()
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
					}				} else $.done($response);
				break;
			}			case undefined: { // 无回复数据
				break;
			}		}	});

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
			}			asset.hlsUrl = URI.stringify(hlsUrl);
		}		if (asset?.fpsKeyServerUrl) {
			let fpsKeyServerUrl = URI.parse(asset.fpsKeyServerUrl);
			fpsKeyServerUrl.host = ServerUrl || "play.itunes.apple.com";
			asset.fpsKeyServerUrl = URI.stringify(fpsKeyServerUrl);
		}		if (asset?.fpsNonceServerUrl) {
			let fpsNonceServerUrl = URI.parse(asset.fpsNonceServerUrl);
			fpsNonceServerUrl.host = ServerUrl || "play.itunes.apple.com";
			asset.fpsNonceServerUrl = URI.stringify(fpsNonceServerUrl);
		}		$.log(`✅ ${$.name}, Set Url`, "");
		return asset;
	}}
