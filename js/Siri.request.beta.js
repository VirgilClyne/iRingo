/* README: https://github.com/VirgilClyne/iRingo */
console.log(' iRingo: ⭕ Siri β Request')
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

class URL {
	constructor(url, base = undefined) {
		const name = "URL";
		const version = "2.1.2";
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
			if (this.search) this.searchParams = this.search.slice(1).split("&").map((param) => param.split("="));
		}		this.searchParams = new Map(this.searchParams || []);
		this.harf = this.toString();
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
		if (this.searchParams.size !== 0) string += "?" + Array.from(this.searchParams).map(param => param.join("=")).join("&");
		return string;
	};

	toJSON() { return JSON.stringify({ ...this }) };
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
    log("", `🚩 执行结束!`, "");
    switch ($platform) {
        case "Surge":
            if (object.policy) Lodash.set(object, "headers.X-Surge-Policy", object.policy);
            $done(object);
            break;
        case "Loon":
            if (object.policy) object.node = object.policy;
            $done(object);
            break;
        case "Stash":
            if (object.policy) Lodash.set(object, "headers.X-Stash-Selected-Proxy", encodeURI(object.policy));
            $done(object);
            break;
        case "Egern":
            $done(object);
            break;
        case "Shadowrocket":
        default:
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
            $done(object);
            break;
        case "Node.js":
            process.exit(1);
            break;
    }
}

const log = (...logs) => console.log(logs.join("\n"));

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
var Location$1 = {
	Settings: Settings$7
};

var Location$2 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Settings: Settings$7,
    default: Location$1
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
	"Location": Location$2,
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

/*! pako 2.1.0 https://github.com/nodeca/pako @license (MIT AND Zlib) */
// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

/* eslint-disable space-unary-ops */

/* Public constants ==========================================================*/
/* ===========================================================================*/


//const Z_FILTERED          = 1;
//const Z_HUFFMAN_ONLY      = 2;
//const Z_RLE               = 3;
const Z_FIXED$1               = 4;
//const Z_DEFAULT_STRATEGY  = 0;

/* Possible values of the data_type field (though see inflate()) */
const Z_BINARY              = 0;
const Z_TEXT                = 1;
//const Z_ASCII             = 1; // = Z_TEXT
const Z_UNKNOWN$1             = 2;

/*============================================================================*/


function zero$1(buf) { let len = buf.length; while (--len >= 0) { buf[len] = 0; } }

// From zutil.h

const STORED_BLOCK = 0;
const STATIC_TREES = 1;
const DYN_TREES    = 2;
/* The three kinds of block type */

const MIN_MATCH$1    = 3;
const MAX_MATCH$1    = 258;
/* The minimum and maximum match lengths */

// From deflate.h
/* ===========================================================================
 * Internal compression state.
 */

const LENGTH_CODES$1  = 29;
/* number of length codes, not counting the special END_BLOCK code */

const LITERALS$1      = 256;
/* number of literal bytes 0..255 */

const L_CODES$1       = LITERALS$1 + 1 + LENGTH_CODES$1;
/* number of Literal or Length codes, including the END_BLOCK code */

const D_CODES$1       = 30;
/* number of distance codes */

const BL_CODES$1      = 19;
/* number of codes used to transfer the bit lengths */

const HEAP_SIZE$1     = 2 * L_CODES$1 + 1;
/* maximum heap size */

const MAX_BITS$1      = 15;
/* All codes must not exceed MAX_BITS bits */

const Buf_size      = 16;
/* size of bit buffer in bi_buf */


/* ===========================================================================
 * Constants
 */

const MAX_BL_BITS = 7;
/* Bit length codes must not exceed MAX_BL_BITS bits */

const END_BLOCK   = 256;
/* end of block literal code */

const REP_3_6     = 16;
/* repeat previous bit length 3-6 times (2 bits of repeat count) */

const REPZ_3_10   = 17;
/* repeat a zero length 3-10 times  (3 bits of repeat count) */

const REPZ_11_138 = 18;
/* repeat a zero length 11-138 times  (7 bits of repeat count) */

/* eslint-disable comma-spacing,array-bracket-spacing */
const extra_lbits =   /* extra bits for each length code */
  new Uint8Array([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0]);

const extra_dbits =   /* extra bits for each distance code */
  new Uint8Array([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13]);

const extra_blbits =  /* extra bits for each bit length code */
  new Uint8Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7]);

const bl_order =
  new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]);
/* eslint-enable comma-spacing,array-bracket-spacing */

/* The lengths of the bit length codes are sent in order of decreasing
 * probability, to avoid transmitting the lengths for unused bit length codes.
 */

/* ===========================================================================
 * Local data. These are initialized only once.
 */

// We pre-fill arrays with 0 to avoid uninitialized gaps

const DIST_CODE_LEN = 512; /* see definition of array dist_code below */

// !!!! Use flat array instead of structure, Freq = i*2, Len = i*2+1
const static_ltree  = new Array((L_CODES$1 + 2) * 2);
zero$1(static_ltree);
/* The static literal tree. Since the bit lengths are imposed, there is no
 * need for the L_CODES extra codes used during heap construction. However
 * The codes 286 and 287 are needed to build a canonical tree (see _tr_init
 * below).
 */

const static_dtree  = new Array(D_CODES$1 * 2);
zero$1(static_dtree);
/* The static distance tree. (Actually a trivial tree since all codes use
 * 5 bits.)
 */

const _dist_code    = new Array(DIST_CODE_LEN);
zero$1(_dist_code);
/* Distance codes. The first 256 values correspond to the distances
 * 3 .. 258, the last 256 values correspond to the top 8 bits of
 * the 15 bit distances.
 */

const _length_code  = new Array(MAX_MATCH$1 - MIN_MATCH$1 + 1);
zero$1(_length_code);
/* length code for each normalized match length (0 == MIN_MATCH) */

const base_length   = new Array(LENGTH_CODES$1);
zero$1(base_length);
/* First normalized length for each code (0 = MIN_MATCH) */

const base_dist     = new Array(D_CODES$1);
zero$1(base_dist);
/* First normalized distance for each code (0 = distance of 1) */


function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {

  this.static_tree  = static_tree;  /* static tree or NULL */
  this.extra_bits   = extra_bits;   /* extra bits for each code or NULL */
  this.extra_base   = extra_base;   /* base index for extra_bits */
  this.elems        = elems;        /* max number of elements in the tree */
  this.max_length   = max_length;   /* max bit length for the codes */

  // show if `static_tree` has data or dummy - needed for monomorphic objects
  this.has_stree    = static_tree && static_tree.length;
}


let static_l_desc;
let static_d_desc;
let static_bl_desc;


function TreeDesc(dyn_tree, stat_desc) {
  this.dyn_tree = dyn_tree;     /* the dynamic tree */
  this.max_code = 0;            /* largest code with non zero frequency */
  this.stat_desc = stat_desc;   /* the corresponding static tree */
}



const d_code = (dist) => {

  return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
};


/* ===========================================================================
 * Output a short LSB first on the stream.
 * IN assertion: there is enough room in pendingBuf.
 */
const put_short = (s, w) => {
//    put_byte(s, (uch)((w) & 0xff));
//    put_byte(s, (uch)((ush)(w) >> 8));
  s.pending_buf[s.pending++] = (w) & 0xff;
  s.pending_buf[s.pending++] = (w >>> 8) & 0xff;
};


/* ===========================================================================
 * Send a value on a given number of bits.
 * IN assertion: length <= 16 and value fits in length bits.
 */
const send_bits = (s, value, length) => {

  if (s.bi_valid > (Buf_size - length)) {
    s.bi_buf |= (value << s.bi_valid) & 0xffff;
    put_short(s, s.bi_buf);
    s.bi_buf = value >> (Buf_size - s.bi_valid);
    s.bi_valid += length - Buf_size;
  } else {
    s.bi_buf |= (value << s.bi_valid) & 0xffff;
    s.bi_valid += length;
  }
};


const send_code = (s, c, tree) => {

  send_bits(s, tree[c * 2]/*.Code*/, tree[c * 2 + 1]/*.Len*/);
};


/* ===========================================================================
 * Reverse the first len bits of a code, using straightforward code (a faster
 * method would use a table)
 * IN assertion: 1 <= len <= 15
 */
const bi_reverse = (code, len) => {

  let res = 0;
  do {
    res |= code & 1;
    code >>>= 1;
    res <<= 1;
  } while (--len > 0);
  return res >>> 1;
};


/* ===========================================================================
 * Flush the bit buffer, keeping at most 7 bits in it.
 */
const bi_flush = (s) => {

  if (s.bi_valid === 16) {
    put_short(s, s.bi_buf);
    s.bi_buf = 0;
    s.bi_valid = 0;

  } else if (s.bi_valid >= 8) {
    s.pending_buf[s.pending++] = s.bi_buf & 0xff;
    s.bi_buf >>= 8;
    s.bi_valid -= 8;
  }
};


/* ===========================================================================
 * Compute the optimal bit lengths for a tree and update the total bit length
 * for the current block.
 * IN assertion: the fields freq and dad are set, heap[heap_max] and
 *    above are the tree nodes sorted by increasing frequency.
 * OUT assertions: the field len is set to the optimal bit length, the
 *     array bl_count contains the frequencies for each bit length.
 *     The length opt_len is updated; static_len is also updated if stree is
 *     not null.
 */
const gen_bitlen = (s, desc) => {
//    deflate_state *s;
//    tree_desc *desc;    /* the tree descriptor */

  const tree            = desc.dyn_tree;
  const max_code        = desc.max_code;
  const stree           = desc.stat_desc.static_tree;
  const has_stree       = desc.stat_desc.has_stree;
  const extra           = desc.stat_desc.extra_bits;
  const base            = desc.stat_desc.extra_base;
  const max_length      = desc.stat_desc.max_length;
  let h;              /* heap index */
  let n, m;           /* iterate over the tree elements */
  let bits;           /* bit length */
  let xbits;          /* extra bits */
  let f;              /* frequency */
  let overflow = 0;   /* number of elements with bit length too large */

  for (bits = 0; bits <= MAX_BITS$1; bits++) {
    s.bl_count[bits] = 0;
  }

  /* In a first pass, compute the optimal bit lengths (which may
   * overflow in the case of the bit length tree).
   */
  tree[s.heap[s.heap_max] * 2 + 1]/*.Len*/ = 0; /* root of the heap */

  for (h = s.heap_max + 1; h < HEAP_SIZE$1; h++) {
    n = s.heap[h];
    bits = tree[tree[n * 2 + 1]/*.Dad*/ * 2 + 1]/*.Len*/ + 1;
    if (bits > max_length) {
      bits = max_length;
      overflow++;
    }
    tree[n * 2 + 1]/*.Len*/ = bits;
    /* We overwrite tree[n].Dad which is no longer needed */

    if (n > max_code) { continue; } /* not a leaf node */

    s.bl_count[bits]++;
    xbits = 0;
    if (n >= base) {
      xbits = extra[n - base];
    }
    f = tree[n * 2]/*.Freq*/;
    s.opt_len += f * (bits + xbits);
    if (has_stree) {
      s.static_len += f * (stree[n * 2 + 1]/*.Len*/ + xbits);
    }
  }
  if (overflow === 0) { return; }

  // Tracev((stderr,"\nbit length overflow\n"));
  /* This happens for example on obj2 and pic of the Calgary corpus */

  /* Find the first bit length which could increase: */
  do {
    bits = max_length - 1;
    while (s.bl_count[bits] === 0) { bits--; }
    s.bl_count[bits]--;      /* move one leaf down the tree */
    s.bl_count[bits + 1] += 2; /* move one overflow item as its brother */
    s.bl_count[max_length]--;
    /* The brother of the overflow item also moves one step up,
     * but this does not affect bl_count[max_length]
     */
    overflow -= 2;
  } while (overflow > 0);

  /* Now recompute all bit lengths, scanning in increasing frequency.
   * h is still equal to HEAP_SIZE. (It is simpler to reconstruct all
   * lengths instead of fixing only the wrong ones. This idea is taken
   * from 'ar' written by Haruhiko Okumura.)
   */
  for (bits = max_length; bits !== 0; bits--) {
    n = s.bl_count[bits];
    while (n !== 0) {
      m = s.heap[--h];
      if (m > max_code) { continue; }
      if (tree[m * 2 + 1]/*.Len*/ !== bits) {
        // Tracev((stderr,"code %d bits %d->%d\n", m, tree[m].Len, bits));
        s.opt_len += (bits - tree[m * 2 + 1]/*.Len*/) * tree[m * 2]/*.Freq*/;
        tree[m * 2 + 1]/*.Len*/ = bits;
      }
      n--;
    }
  }
};


/* ===========================================================================
 * Generate the codes for a given tree and bit counts (which need not be
 * optimal).
 * IN assertion: the array bl_count contains the bit length statistics for
 * the given tree and the field len is set for all tree elements.
 * OUT assertion: the field code is set for all tree elements of non
 *     zero code length.
 */
const gen_codes = (tree, max_code, bl_count) => {
//    ct_data *tree;             /* the tree to decorate */
//    int max_code;              /* largest code with non zero frequency */
//    ushf *bl_count;            /* number of codes at each bit length */

  const next_code = new Array(MAX_BITS$1 + 1); /* next code value for each bit length */
  let code = 0;              /* running code value */
  let bits;                  /* bit index */
  let n;                     /* code index */

  /* The distribution counts are first used to generate the code values
   * without bit reversal.
   */
  for (bits = 1; bits <= MAX_BITS$1; bits++) {
    code = (code + bl_count[bits - 1]) << 1;
    next_code[bits] = code;
  }
  /* Check that the bit counts in bl_count are consistent. The last code
   * must be all ones.
   */
  //Assert (code + bl_count[MAX_BITS]-1 == (1<<MAX_BITS)-1,
  //        "inconsistent bit counts");
  //Tracev((stderr,"\ngen_codes: max_code %d ", max_code));

  for (n = 0;  n <= max_code; n++) {
    let len = tree[n * 2 + 1]/*.Len*/;
    if (len === 0) { continue; }
    /* Now reverse the bits */
    tree[n * 2]/*.Code*/ = bi_reverse(next_code[len]++, len);

    //Tracecv(tree != static_ltree, (stderr,"\nn %3d %c l %2d c %4x (%x) ",
    //     n, (isgraph(n) ? n : ' '), len, tree[n].Code, next_code[len]-1));
  }
};


/* ===========================================================================
 * Initialize the various 'constant' tables.
 */
const tr_static_init = () => {

  let n;        /* iterates over tree elements */
  let bits;     /* bit counter */
  let length;   /* length value */
  let code;     /* code value */
  let dist;     /* distance index */
  const bl_count = new Array(MAX_BITS$1 + 1);
  /* number of codes at each bit length for an optimal tree */

  // do check in _tr_init()
  //if (static_init_done) return;

  /* For some embedded targets, global variables are not initialized: */
/*#ifdef NO_INIT_GLOBAL_POINTERS
  static_l_desc.static_tree = static_ltree;
  static_l_desc.extra_bits = extra_lbits;
  static_d_desc.static_tree = static_dtree;
  static_d_desc.extra_bits = extra_dbits;
  static_bl_desc.extra_bits = extra_blbits;
#endif*/

  /* Initialize the mapping length (0..255) -> length code (0..28) */
  length = 0;
  for (code = 0; code < LENGTH_CODES$1 - 1; code++) {
    base_length[code] = length;
    for (n = 0; n < (1 << extra_lbits[code]); n++) {
      _length_code[length++] = code;
    }
  }
  //Assert (length == 256, "tr_static_init: length != 256");
  /* Note that the length 255 (match length 258) can be represented
   * in two different ways: code 284 + 5 bits or code 285, so we
   * overwrite length_code[255] to use the best encoding:
   */
  _length_code[length - 1] = code;

  /* Initialize the mapping dist (0..32K) -> dist code (0..29) */
  dist = 0;
  for (code = 0; code < 16; code++) {
    base_dist[code] = dist;
    for (n = 0; n < (1 << extra_dbits[code]); n++) {
      _dist_code[dist++] = code;
    }
  }
  //Assert (dist == 256, "tr_static_init: dist != 256");
  dist >>= 7; /* from now on, all distances are divided by 128 */
  for (; code < D_CODES$1; code++) {
    base_dist[code] = dist << 7;
    for (n = 0; n < (1 << (extra_dbits[code] - 7)); n++) {
      _dist_code[256 + dist++] = code;
    }
  }
  //Assert (dist == 256, "tr_static_init: 256+dist != 512");

  /* Construct the codes of the static literal tree */
  for (bits = 0; bits <= MAX_BITS$1; bits++) {
    bl_count[bits] = 0;
  }

  n = 0;
  while (n <= 143) {
    static_ltree[n * 2 + 1]/*.Len*/ = 8;
    n++;
    bl_count[8]++;
  }
  while (n <= 255) {
    static_ltree[n * 2 + 1]/*.Len*/ = 9;
    n++;
    bl_count[9]++;
  }
  while (n <= 279) {
    static_ltree[n * 2 + 1]/*.Len*/ = 7;
    n++;
    bl_count[7]++;
  }
  while (n <= 287) {
    static_ltree[n * 2 + 1]/*.Len*/ = 8;
    n++;
    bl_count[8]++;
  }
  /* Codes 286 and 287 do not exist, but we must include them in the
   * tree construction to get a canonical Huffman tree (longest code
   * all ones)
   */
  gen_codes(static_ltree, L_CODES$1 + 1, bl_count);

  /* The static distance tree is trivial: */
  for (n = 0; n < D_CODES$1; n++) {
    static_dtree[n * 2 + 1]/*.Len*/ = 5;
    static_dtree[n * 2]/*.Code*/ = bi_reverse(n, 5);
  }

  // Now data ready and we can init static trees
  static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS$1 + 1, L_CODES$1, MAX_BITS$1);
  static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0,          D_CODES$1, MAX_BITS$1);
  static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0,         BL_CODES$1, MAX_BL_BITS);

  //static_init_done = true;
};


/* ===========================================================================
 * Initialize a new block.
 */
const init_block = (s) => {

  let n; /* iterates over tree elements */

  /* Initialize the trees. */
  for (n = 0; n < L_CODES$1;  n++) { s.dyn_ltree[n * 2]/*.Freq*/ = 0; }
  for (n = 0; n < D_CODES$1;  n++) { s.dyn_dtree[n * 2]/*.Freq*/ = 0; }
  for (n = 0; n < BL_CODES$1; n++) { s.bl_tree[n * 2]/*.Freq*/ = 0; }

  s.dyn_ltree[END_BLOCK * 2]/*.Freq*/ = 1;
  s.opt_len = s.static_len = 0;
  s.sym_next = s.matches = 0;
};


/* ===========================================================================
 * Flush the bit buffer and align the output on a byte boundary
 */
const bi_windup = (s) =>
{
  if (s.bi_valid > 8) {
    put_short(s, s.bi_buf);
  } else if (s.bi_valid > 0) {
    //put_byte(s, (Byte)s->bi_buf);
    s.pending_buf[s.pending++] = s.bi_buf;
  }
  s.bi_buf = 0;
  s.bi_valid = 0;
};

/* ===========================================================================
 * Compares to subtrees, using the tree depth as tie breaker when
 * the subtrees have equal frequency. This minimizes the worst case length.
 */
const smaller = (tree, n, m, depth) => {

  const _n2 = n * 2;
  const _m2 = m * 2;
  return (tree[_n2]/*.Freq*/ < tree[_m2]/*.Freq*/ ||
         (tree[_n2]/*.Freq*/ === tree[_m2]/*.Freq*/ && depth[n] <= depth[m]));
};

/* ===========================================================================
 * Restore the heap property by moving down the tree starting at node k,
 * exchanging a node with the smallest of its two sons if necessary, stopping
 * when the heap property is re-established (each father smaller than its
 * two sons).
 */
const pqdownheap = (s, tree, k) => {
//    deflate_state *s;
//    ct_data *tree;  /* the tree to restore */
//    int k;               /* node to move down */

  const v = s.heap[k];
  let j = k << 1;  /* left son of k */
  while (j <= s.heap_len) {
    /* Set j to the smallest of the two sons: */
    if (j < s.heap_len &&
      smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
      j++;
    }
    /* Exit if v is smaller than both sons */
    if (smaller(tree, v, s.heap[j], s.depth)) { break; }

    /* Exchange v with the smallest son */
    s.heap[k] = s.heap[j];
    k = j;

    /* And continue down the tree, setting j to the left son of k */
    j <<= 1;
  }
  s.heap[k] = v;
};


// inlined manually
// const SMALLEST = 1;

/* ===========================================================================
 * Send the block data compressed using the given Huffman trees
 */
const compress_block = (s, ltree, dtree) => {
//    deflate_state *s;
//    const ct_data *ltree; /* literal tree */
//    const ct_data *dtree; /* distance tree */

  let dist;           /* distance of matched string */
  let lc;             /* match length or unmatched char (if dist == 0) */
  let sx = 0;         /* running index in sym_buf */
  let code;           /* the code to send */
  let extra;          /* number of extra bits to send */

  if (s.sym_next !== 0) {
    do {
      dist = s.pending_buf[s.sym_buf + sx++] & 0xff;
      dist += (s.pending_buf[s.sym_buf + sx++] & 0xff) << 8;
      lc = s.pending_buf[s.sym_buf + sx++];
      if (dist === 0) {
        send_code(s, lc, ltree); /* send a literal byte */
        //Tracecv(isgraph(lc), (stderr," '%c' ", lc));
      } else {
        /* Here, lc is the match length - MIN_MATCH */
        code = _length_code[lc];
        send_code(s, code + LITERALS$1 + 1, ltree); /* send the length code */
        extra = extra_lbits[code];
        if (extra !== 0) {
          lc -= base_length[code];
          send_bits(s, lc, extra);       /* send the extra length bits */
        }
        dist--; /* dist is now the match distance - 1 */
        code = d_code(dist);
        //Assert (code < D_CODES, "bad d_code");

        send_code(s, code, dtree);       /* send the distance code */
        extra = extra_dbits[code];
        if (extra !== 0) {
          dist -= base_dist[code];
          send_bits(s, dist, extra);   /* send the extra distance bits */
        }
      } /* literal or match pair ? */

      /* Check that the overlay between pending_buf and sym_buf is ok: */
      //Assert(s->pending < s->lit_bufsize + sx, "pendingBuf overflow");

    } while (sx < s.sym_next);
  }

  send_code(s, END_BLOCK, ltree);
};


/* ===========================================================================
 * Construct one Huffman tree and assigns the code bit strings and lengths.
 * Update the total bit length for the current block.
 * IN assertion: the field freq is set for all tree elements.
 * OUT assertions: the fields len and code are set to the optimal bit length
 *     and corresponding code. The length opt_len is updated; static_len is
 *     also updated if stree is not null. The field max_code is set.
 */
const build_tree = (s, desc) => {
//    deflate_state *s;
//    tree_desc *desc; /* the tree descriptor */

  const tree     = desc.dyn_tree;
  const stree    = desc.stat_desc.static_tree;
  const has_stree = desc.stat_desc.has_stree;
  const elems    = desc.stat_desc.elems;
  let n, m;          /* iterate over heap elements */
  let max_code = -1; /* largest code with non zero frequency */
  let node;          /* new node being created */

  /* Construct the initial heap, with least frequent element in
   * heap[SMALLEST]. The sons of heap[n] are heap[2*n] and heap[2*n+1].
   * heap[0] is not used.
   */
  s.heap_len = 0;
  s.heap_max = HEAP_SIZE$1;

  for (n = 0; n < elems; n++) {
    if (tree[n * 2]/*.Freq*/ !== 0) {
      s.heap[++s.heap_len] = max_code = n;
      s.depth[n] = 0;

    } else {
      tree[n * 2 + 1]/*.Len*/ = 0;
    }
  }

  /* The pkzip format requires that at least one distance code exists,
   * and that at least one bit should be sent even if there is only one
   * possible code. So to avoid special checks later on we force at least
   * two codes of non zero frequency.
   */
  while (s.heap_len < 2) {
    node = s.heap[++s.heap_len] = (max_code < 2 ? ++max_code : 0);
    tree[node * 2]/*.Freq*/ = 1;
    s.depth[node] = 0;
    s.opt_len--;

    if (has_stree) {
      s.static_len -= stree[node * 2 + 1]/*.Len*/;
    }
    /* node is 0 or 1 so it does not have extra bits */
  }
  desc.max_code = max_code;

  /* The elements heap[heap_len/2+1 .. heap_len] are leaves of the tree,
   * establish sub-heaps of increasing lengths:
   */
  for (n = (s.heap_len >> 1/*int /2*/); n >= 1; n--) { pqdownheap(s, tree, n); }

  /* Construct the Huffman tree by repeatedly combining the least two
   * frequent nodes.
   */
  node = elems;              /* next internal node of the tree */
  do {
    //pqremove(s, tree, n);  /* n = node of least frequency */
    /*** pqremove ***/
    n = s.heap[1/*SMALLEST*/];
    s.heap[1/*SMALLEST*/] = s.heap[s.heap_len--];
    pqdownheap(s, tree, 1/*SMALLEST*/);
    /***/

    m = s.heap[1/*SMALLEST*/]; /* m = node of next least frequency */

    s.heap[--s.heap_max] = n; /* keep the nodes sorted by frequency */
    s.heap[--s.heap_max] = m;

    /* Create a new node father of n and m */
    tree[node * 2]/*.Freq*/ = tree[n * 2]/*.Freq*/ + tree[m * 2]/*.Freq*/;
    s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
    tree[n * 2 + 1]/*.Dad*/ = tree[m * 2 + 1]/*.Dad*/ = node;

    /* and insert the new node in the heap */
    s.heap[1/*SMALLEST*/] = node++;
    pqdownheap(s, tree, 1/*SMALLEST*/);

  } while (s.heap_len >= 2);

  s.heap[--s.heap_max] = s.heap[1/*SMALLEST*/];

  /* At this point, the fields freq and dad are set. We can now
   * generate the bit lengths.
   */
  gen_bitlen(s, desc);

  /* The field len is now set, we can generate the bit codes */
  gen_codes(tree, max_code, s.bl_count);
};


/* ===========================================================================
 * Scan a literal or distance tree to determine the frequencies of the codes
 * in the bit length tree.
 */
const scan_tree = (s, tree, max_code) => {
//    deflate_state *s;
//    ct_data *tree;   /* the tree to be scanned */
//    int max_code;    /* and its largest code of non zero frequency */

  let n;                     /* iterates over all tree elements */
  let prevlen = -1;          /* last emitted length */
  let curlen;                /* length of current code */

  let nextlen = tree[0 * 2 + 1]/*.Len*/; /* length of next code */

  let count = 0;             /* repeat count of the current code */
  let max_count = 7;         /* max repeat count */
  let min_count = 4;         /* min repeat count */

  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }
  tree[(max_code + 1) * 2 + 1]/*.Len*/ = 0xffff; /* guard */

  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n + 1) * 2 + 1]/*.Len*/;

    if (++count < max_count && curlen === nextlen) {
      continue;

    } else if (count < min_count) {
      s.bl_tree[curlen * 2]/*.Freq*/ += count;

    } else if (curlen !== 0) {

      if (curlen !== prevlen) { s.bl_tree[curlen * 2]/*.Freq*/++; }
      s.bl_tree[REP_3_6 * 2]/*.Freq*/++;

    } else if (count <= 10) {
      s.bl_tree[REPZ_3_10 * 2]/*.Freq*/++;

    } else {
      s.bl_tree[REPZ_11_138 * 2]/*.Freq*/++;
    }

    count = 0;
    prevlen = curlen;

    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;

    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;

    } else {
      max_count = 7;
      min_count = 4;
    }
  }
};


/* ===========================================================================
 * Send a literal or distance tree in compressed form, using the codes in
 * bl_tree.
 */
const send_tree = (s, tree, max_code) => {
//    deflate_state *s;
//    ct_data *tree; /* the tree to be scanned */
//    int max_code;       /* and its largest code of non zero frequency */

  let n;                     /* iterates over all tree elements */
  let prevlen = -1;          /* last emitted length */
  let curlen;                /* length of current code */

  let nextlen = tree[0 * 2 + 1]/*.Len*/; /* length of next code */

  let count = 0;             /* repeat count of the current code */
  let max_count = 7;         /* max repeat count */
  let min_count = 4;         /* min repeat count */

  /* tree[max_code+1].Len = -1; */  /* guard already set */
  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }

  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n + 1) * 2 + 1]/*.Len*/;

    if (++count < max_count && curlen === nextlen) {
      continue;

    } else if (count < min_count) {
      do { send_code(s, curlen, s.bl_tree); } while (--count !== 0);

    } else if (curlen !== 0) {
      if (curlen !== prevlen) {
        send_code(s, curlen, s.bl_tree);
        count--;
      }
      //Assert(count >= 3 && count <= 6, " 3_6?");
      send_code(s, REP_3_6, s.bl_tree);
      send_bits(s, count - 3, 2);

    } else if (count <= 10) {
      send_code(s, REPZ_3_10, s.bl_tree);
      send_bits(s, count - 3, 3);

    } else {
      send_code(s, REPZ_11_138, s.bl_tree);
      send_bits(s, count - 11, 7);
    }

    count = 0;
    prevlen = curlen;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;

    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;

    } else {
      max_count = 7;
      min_count = 4;
    }
  }
};


/* ===========================================================================
 * Construct the Huffman tree for the bit lengths and return the index in
 * bl_order of the last bit length code to send.
 */
const build_bl_tree = (s) => {

  let max_blindex;  /* index of last bit length code of non zero freq */

  /* Determine the bit length frequencies for literal and distance trees */
  scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
  scan_tree(s, s.dyn_dtree, s.d_desc.max_code);

  /* Build the bit length tree: */
  build_tree(s, s.bl_desc);
  /* opt_len now includes the length of the tree representations, except
   * the lengths of the bit lengths codes and the 5+5+4 bits for the counts.
   */

  /* Determine the number of bit length codes to send. The pkzip format
   * requires that at least 4 bit length codes be sent. (appnote.txt says
   * 3 but the actual value used is 4.)
   */
  for (max_blindex = BL_CODES$1 - 1; max_blindex >= 3; max_blindex--) {
    if (s.bl_tree[bl_order[max_blindex] * 2 + 1]/*.Len*/ !== 0) {
      break;
    }
  }
  /* Update opt_len to include the bit length tree and counts */
  s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
  //Tracev((stderr, "\ndyn trees: dyn %ld, stat %ld",
  //        s->opt_len, s->static_len));

  return max_blindex;
};


/* ===========================================================================
 * Send the header for a block using dynamic Huffman trees: the counts, the
 * lengths of the bit length codes, the literal tree and the distance tree.
 * IN assertion: lcodes >= 257, dcodes >= 1, blcodes >= 4.
 */
const send_all_trees = (s, lcodes, dcodes, blcodes) => {
//    deflate_state *s;
//    int lcodes, dcodes, blcodes; /* number of codes for each tree */

  let rank;                    /* index in bl_order */

  //Assert (lcodes >= 257 && dcodes >= 1 && blcodes >= 4, "not enough codes");
  //Assert (lcodes <= L_CODES && dcodes <= D_CODES && blcodes <= BL_CODES,
  //        "too many codes");
  //Tracev((stderr, "\nbl counts: "));
  send_bits(s, lcodes - 257, 5); /* not +255 as stated in appnote.txt */
  send_bits(s, dcodes - 1,   5);
  send_bits(s, blcodes - 4,  4); /* not -3 as stated in appnote.txt */
  for (rank = 0; rank < blcodes; rank++) {
    //Tracev((stderr, "\nbl code %2d ", bl_order[rank]));
    send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1]/*.Len*/, 3);
  }
  //Tracev((stderr, "\nbl tree: sent %ld", s->bits_sent));

  send_tree(s, s.dyn_ltree, lcodes - 1); /* literal tree */
  //Tracev((stderr, "\nlit tree: sent %ld", s->bits_sent));

  send_tree(s, s.dyn_dtree, dcodes - 1); /* distance tree */
  //Tracev((stderr, "\ndist tree: sent %ld", s->bits_sent));
};


/* ===========================================================================
 * Check if the data type is TEXT or BINARY, using the following algorithm:
 * - TEXT if the two conditions below are satisfied:
 *    a) There are no non-portable control characters belonging to the
 *       "block list" (0..6, 14..25, 28..31).
 *    b) There is at least one printable character belonging to the
 *       "allow list" (9 {TAB}, 10 {LF}, 13 {CR}, 32..255).
 * - BINARY otherwise.
 * - The following partially-portable control characters form a
 *   "gray list" that is ignored in this detection algorithm:
 *   (7 {BEL}, 8 {BS}, 11 {VT}, 12 {FF}, 26 {SUB}, 27 {ESC}).
 * IN assertion: the fields Freq of dyn_ltree are set.
 */
const detect_data_type = (s) => {
  /* block_mask is the bit mask of block-listed bytes
   * set bits 0..6, 14..25, and 28..31
   * 0xf3ffc07f = binary 11110011111111111100000001111111
   */
  let block_mask = 0xf3ffc07f;
  let n;

  /* Check for non-textual ("block-listed") bytes. */
  for (n = 0; n <= 31; n++, block_mask >>>= 1) {
    if ((block_mask & 1) && (s.dyn_ltree[n * 2]/*.Freq*/ !== 0)) {
      return Z_BINARY;
    }
  }

  /* Check for textual ("allow-listed") bytes. */
  if (s.dyn_ltree[9 * 2]/*.Freq*/ !== 0 || s.dyn_ltree[10 * 2]/*.Freq*/ !== 0 ||
      s.dyn_ltree[13 * 2]/*.Freq*/ !== 0) {
    return Z_TEXT;
  }
  for (n = 32; n < LITERALS$1; n++) {
    if (s.dyn_ltree[n * 2]/*.Freq*/ !== 0) {
      return Z_TEXT;
    }
  }

  /* There are no "block-listed" or "allow-listed" bytes:
   * this stream either is empty or has tolerated ("gray-listed") bytes only.
   */
  return Z_BINARY;
};


let static_init_done = false;

/* ===========================================================================
 * Initialize the tree data structures for a new zlib stream.
 */
const _tr_init$1 = (s) =>
{

  if (!static_init_done) {
    tr_static_init();
    static_init_done = true;
  }

  s.l_desc  = new TreeDesc(s.dyn_ltree, static_l_desc);
  s.d_desc  = new TreeDesc(s.dyn_dtree, static_d_desc);
  s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);

  s.bi_buf = 0;
  s.bi_valid = 0;

  /* Initialize the first block of the first file: */
  init_block(s);
};


/* ===========================================================================
 * Send a stored block
 */
const _tr_stored_block$1 = (s, buf, stored_len, last) => {
//DeflateState *s;
//charf *buf;       /* input block */
//ulg stored_len;   /* length of input block */
//int last;         /* one if this is the last block for a file */

  send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);    /* send block type */
  bi_windup(s);        /* align on byte boundary */
  put_short(s, stored_len);
  put_short(s, ~stored_len);
  if (stored_len) {
    s.pending_buf.set(s.window.subarray(buf, buf + stored_len), s.pending);
  }
  s.pending += stored_len;
};


/* ===========================================================================
 * Send one empty static block to give enough lookahead for inflate.
 * This takes 10 bits, of which 7 may remain in the bit buffer.
 */
const _tr_align$1 = (s) => {
  send_bits(s, STATIC_TREES << 1, 3);
  send_code(s, END_BLOCK, static_ltree);
  bi_flush(s);
};


/* ===========================================================================
 * Determine the best encoding for the current block: dynamic trees, static
 * trees or store, and write out the encoded block.
 */
const _tr_flush_block$1 = (s, buf, stored_len, last) => {
//DeflateState *s;
//charf *buf;       /* input block, or NULL if too old */
//ulg stored_len;   /* length of input block */
//int last;         /* one if this is the last block for a file */

  let opt_lenb, static_lenb;  /* opt_len and static_len in bytes */
  let max_blindex = 0;        /* index of last bit length code of non zero freq */

  /* Build the Huffman trees unless a stored block is forced */
  if (s.level > 0) {

    /* Check if the file is binary or text */
    if (s.strm.data_type === Z_UNKNOWN$1) {
      s.strm.data_type = detect_data_type(s);
    }

    /* Construct the literal and distance trees */
    build_tree(s, s.l_desc);
    // Tracev((stderr, "\nlit data: dyn %ld, stat %ld", s->opt_len,
    //        s->static_len));

    build_tree(s, s.d_desc);
    // Tracev((stderr, "\ndist data: dyn %ld, stat %ld", s->opt_len,
    //        s->static_len));
    /* At this point, opt_len and static_len are the total bit lengths of
     * the compressed block data, excluding the tree representations.
     */

    /* Build the bit length tree for the above two trees, and get the index
     * in bl_order of the last bit length code to send.
     */
    max_blindex = build_bl_tree(s);

    /* Determine the best encoding. Compute the block lengths in bytes. */
    opt_lenb = (s.opt_len + 3 + 7) >>> 3;
    static_lenb = (s.static_len + 3 + 7) >>> 3;

    // Tracev((stderr, "\nopt %lu(%lu) stat %lu(%lu) stored %lu lit %u ",
    //        opt_lenb, s->opt_len, static_lenb, s->static_len, stored_len,
    //        s->sym_next / 3));

    if (static_lenb <= opt_lenb) { opt_lenb = static_lenb; }

  } else {
    // Assert(buf != (char*)0, "lost buf");
    opt_lenb = static_lenb = stored_len + 5; /* force a stored block */
  }

  if ((stored_len + 4 <= opt_lenb) && (buf !== -1)) {
    /* 4: two words for the lengths */

    /* The test buf != NULL is only necessary if LIT_BUFSIZE > WSIZE.
     * Otherwise we can't have processed more than WSIZE input bytes since
     * the last block flush, because compression would have been
     * successful. If LIT_BUFSIZE <= WSIZE, it is never too late to
     * transform a block into a stored block.
     */
    _tr_stored_block$1(s, buf, stored_len, last);

  } else if (s.strategy === Z_FIXED$1 || static_lenb === opt_lenb) {

    send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
    compress_block(s, static_ltree, static_dtree);

  } else {
    send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
    send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
    compress_block(s, s.dyn_ltree, s.dyn_dtree);
  }
  // Assert (s->compressed_len == s->bits_sent, "bad compressed size");
  /* The above check is made mod 2^32, for files larger than 512 MB
   * and uLong implemented on 32 bits.
   */
  init_block(s);

  if (last) {
    bi_windup(s);
  }
  // Tracev((stderr,"\ncomprlen %lu(%lu) ", s->compressed_len>>3,
  //       s->compressed_len-7*last));
};

/* ===========================================================================
 * Save the match info and tally the frequency counts. Return true if
 * the current block must be flushed.
 */
const _tr_tally$1 = (s, dist, lc) => {
//    deflate_state *s;
//    unsigned dist;  /* distance of matched string */
//    unsigned lc;    /* match length-MIN_MATCH or unmatched char (if dist==0) */

  s.pending_buf[s.sym_buf + s.sym_next++] = dist;
  s.pending_buf[s.sym_buf + s.sym_next++] = dist >> 8;
  s.pending_buf[s.sym_buf + s.sym_next++] = lc;
  if (dist === 0) {
    /* lc is the unmatched char */
    s.dyn_ltree[lc * 2]/*.Freq*/++;
  } else {
    s.matches++;
    /* Here, lc is the match length - MIN_MATCH */
    dist--;             /* dist = match distance - 1 */
    //Assert((ush)dist < (ush)MAX_DIST(s) &&
    //       (ush)lc <= (ush)(MAX_MATCH-MIN_MATCH) &&
    //       (ush)d_code(dist) < (ush)D_CODES,  "_tr_tally: bad match");

    s.dyn_ltree[(_length_code[lc] + LITERALS$1 + 1) * 2]/*.Freq*/++;
    s.dyn_dtree[d_code(dist) * 2]/*.Freq*/++;
  }

  return (s.sym_next === s.sym_end);
};

var _tr_init_1  = _tr_init$1;
var _tr_stored_block_1 = _tr_stored_block$1;
var _tr_flush_block_1  = _tr_flush_block$1;
var _tr_tally_1 = _tr_tally$1;
var _tr_align_1 = _tr_align$1;

var trees = {
	_tr_init: _tr_init_1,
	_tr_stored_block: _tr_stored_block_1,
	_tr_flush_block: _tr_flush_block_1,
	_tr_tally: _tr_tally_1,
	_tr_align: _tr_align_1
};

// Note: adler32 takes 12% for level 0 and 2% for level 6.
// It isn't worth it to make additional optimizations as in original.
// Small size is preferable.

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

const adler32 = (adler, buf, len, pos) => {
  let s1 = (adler & 0xffff) |0,
      s2 = ((adler >>> 16) & 0xffff) |0,
      n = 0;

  while (len !== 0) {
    // Set limit ~ twice less than 5552, to keep
    // s2 in 31-bits, because we force signed ints.
    // in other case %= will fail.
    n = len > 2000 ? 2000 : len;
    len -= n;

    do {
      s1 = (s1 + buf[pos++]) |0;
      s2 = (s2 + s1) |0;
    } while (--n);

    s1 %= 65521;
    s2 %= 65521;
  }

  return (s1 | (s2 << 16)) |0;
};


var adler32_1 = adler32;

// Note: we can't get significant speed boost here.
// So write code to minimize size - no pregenerated tables
// and array tools dependencies.

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

// Use ordinary array, since untyped makes no boost here
const makeTable = () => {
  let c, table = [];

  for (var n = 0; n < 256; n++) {
    c = n;
    for (var k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[n] = c;
  }

  return table;
};

// Create table on load. Just 255 signed longs. Not a problem.
const crcTable = new Uint32Array(makeTable());


const crc32 = (crc, buf, len, pos) => {
  const t = crcTable;
  const end = pos + len;

  crc ^= -1;

  for (let i = pos; i < end; i++) {
    crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xFF];
  }

  return (crc ^ (-1)); // >>> 0;
};


var crc32_1 = crc32;

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

var messages = {
  2:      'need dictionary',     /* Z_NEED_DICT       2  */
  1:      'stream end',          /* Z_STREAM_END      1  */
  0:      '',                    /* Z_OK              0  */
  '-1':   'file error',          /* Z_ERRNO         (-1) */
  '-2':   'stream error',        /* Z_STREAM_ERROR  (-2) */
  '-3':   'data error',          /* Z_DATA_ERROR    (-3) */
  '-4':   'insufficient memory', /* Z_MEM_ERROR     (-4) */
  '-5':   'buffer error',        /* Z_BUF_ERROR     (-5) */
  '-6':   'incompatible version' /* Z_VERSION_ERROR (-6) */
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

var constants$2 = {

  /* Allowed flush values; see deflate() and inflate() below for details */
  Z_NO_FLUSH:         0,
  Z_PARTIAL_FLUSH:    1,
  Z_SYNC_FLUSH:       2,
  Z_FULL_FLUSH:       3,
  Z_FINISH:           4,
  Z_BLOCK:            5,
  Z_TREES:            6,

  /* Return codes for the compression/decompression functions. Negative values
  * are errors, positive values are used for special but normal events.
  */
  Z_OK:               0,
  Z_STREAM_END:       1,
  Z_NEED_DICT:        2,
  Z_ERRNO:           -1,
  Z_STREAM_ERROR:    -2,
  Z_DATA_ERROR:      -3,
  Z_MEM_ERROR:       -4,
  Z_BUF_ERROR:       -5,
  //Z_VERSION_ERROR: -6,

  /* compression levels */
  Z_NO_COMPRESSION:         0,
  Z_BEST_SPEED:             1,
  Z_BEST_COMPRESSION:       9,
  Z_DEFAULT_COMPRESSION:   -1,


  Z_FILTERED:               1,
  Z_HUFFMAN_ONLY:           2,
  Z_RLE:                    3,
  Z_FIXED:                  4,
  Z_DEFAULT_STRATEGY:       0,

  /* Possible values of the data_type field (though see inflate()) */
  Z_BINARY:                 0,
  Z_TEXT:                   1,
  //Z_ASCII:                1, // = Z_TEXT (deprecated)
  Z_UNKNOWN:                2,

  /* The deflate compression method */
  Z_DEFLATED:               8
  //Z_NULL:                 null // Use -1 or null inline, depending on var type
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

const { _tr_init, _tr_stored_block, _tr_flush_block, _tr_tally, _tr_align } = trees;




/* Public constants ==========================================================*/
/* ===========================================================================*/

const {
  Z_NO_FLUSH: Z_NO_FLUSH$2, Z_PARTIAL_FLUSH, Z_FULL_FLUSH: Z_FULL_FLUSH$1, Z_FINISH: Z_FINISH$3, Z_BLOCK: Z_BLOCK$1,
  Z_OK: Z_OK$3, Z_STREAM_END: Z_STREAM_END$3, Z_STREAM_ERROR: Z_STREAM_ERROR$2, Z_DATA_ERROR: Z_DATA_ERROR$2, Z_BUF_ERROR: Z_BUF_ERROR$1,
  Z_DEFAULT_COMPRESSION: Z_DEFAULT_COMPRESSION$1,
  Z_FILTERED, Z_HUFFMAN_ONLY, Z_RLE, Z_FIXED, Z_DEFAULT_STRATEGY: Z_DEFAULT_STRATEGY$1,
  Z_UNKNOWN,
  Z_DEFLATED: Z_DEFLATED$2
} = constants$2;

/*============================================================================*/


const MAX_MEM_LEVEL = 9;
/* Maximum value for memLevel in deflateInit2 */
const MAX_WBITS$1 = 15;
/* 32K LZ77 window */
const DEF_MEM_LEVEL = 8;


const LENGTH_CODES  = 29;
/* number of length codes, not counting the special END_BLOCK code */
const LITERALS      = 256;
/* number of literal bytes 0..255 */
const L_CODES       = LITERALS + 1 + LENGTH_CODES;
/* number of Literal or Length codes, including the END_BLOCK code */
const D_CODES       = 30;
/* number of distance codes */
const BL_CODES      = 19;
/* number of codes used to transfer the bit lengths */
const HEAP_SIZE     = 2 * L_CODES + 1;
/* maximum heap size */
const MAX_BITS  = 15;
/* All codes must not exceed MAX_BITS bits */

const MIN_MATCH = 3;
const MAX_MATCH = 258;
const MIN_LOOKAHEAD = (MAX_MATCH + MIN_MATCH + 1);

const PRESET_DICT = 0x20;

const INIT_STATE    =  42;    /* zlib header -> BUSY_STATE */
//#ifdef GZIP
const GZIP_STATE    =  57;    /* gzip header -> BUSY_STATE | EXTRA_STATE */
//#endif
const EXTRA_STATE   =  69;    /* gzip extra block -> NAME_STATE */
const NAME_STATE    =  73;    /* gzip file name -> COMMENT_STATE */
const COMMENT_STATE =  91;    /* gzip comment -> HCRC_STATE */
const HCRC_STATE    = 103;    /* gzip header CRC -> BUSY_STATE */
const BUSY_STATE    = 113;    /* deflate -> FINISH_STATE */
const FINISH_STATE  = 666;    /* stream complete */

const BS_NEED_MORE      = 1; /* block not completed, need more input or more output */
const BS_BLOCK_DONE     = 2; /* block flush performed */
const BS_FINISH_STARTED = 3; /* finish started, need only more output at next deflate */
const BS_FINISH_DONE    = 4; /* finish done, accept no more input or output */

const OS_CODE = 0x03; // Unix :) . Don't detect, use this default.

const err = (strm, errorCode) => {
  strm.msg = messages[errorCode];
  return errorCode;
};

const rank = (f) => {
  return ((f) * 2) - ((f) > 4 ? 9 : 0);
};

const zero = (buf) => {
  let len = buf.length; while (--len >= 0) { buf[len] = 0; }
};

/* ===========================================================================
 * Slide the hash table when sliding the window down (could be avoided with 32
 * bit values at the expense of memory usage). We slide even when level == 0 to
 * keep the hash table consistent if we switch back to level > 0 later.
 */
const slide_hash = (s) => {
  let n, m;
  let p;
  let wsize = s.w_size;

  n = s.hash_size;
  p = n;
  do {
    m = s.head[--p];
    s.head[p] = (m >= wsize ? m - wsize : 0);
  } while (--n);
  n = wsize;
//#ifndef FASTEST
  p = n;
  do {
    m = s.prev[--p];
    s.prev[p] = (m >= wsize ? m - wsize : 0);
    /* If n is not on any hash chain, prev[n] is garbage but
     * its value will never be used.
     */
  } while (--n);
//#endif
};

/* eslint-disable new-cap */
let HASH_ZLIB = (s, prev, data) => ((prev << s.hash_shift) ^ data) & s.hash_mask;
// This hash causes less collisions, https://github.com/nodeca/pako/issues/135
// But breaks binary compatibility
//let HASH_FAST = (s, prev, data) => ((prev << 8) + (prev >> 8) + (data << 4)) & s.hash_mask;
let HASH = HASH_ZLIB;


/* =========================================================================
 * Flush as much pending output as possible. All deflate() output, except for
 * some deflate_stored() output, goes through this function so some
 * applications may wish to modify it to avoid allocating a large
 * strm->next_out buffer and copying into it. (See also read_buf()).
 */
const flush_pending = (strm) => {
  const s = strm.state;

  //_tr_flush_bits(s);
  let len = s.pending;
  if (len > strm.avail_out) {
    len = strm.avail_out;
  }
  if (len === 0) { return; }

  strm.output.set(s.pending_buf.subarray(s.pending_out, s.pending_out + len), strm.next_out);
  strm.next_out  += len;
  s.pending_out  += len;
  strm.total_out += len;
  strm.avail_out -= len;
  s.pending      -= len;
  if (s.pending === 0) {
    s.pending_out = 0;
  }
};


const flush_block_only = (s, last) => {
  _tr_flush_block(s, (s.block_start >= 0 ? s.block_start : -1), s.strstart - s.block_start, last);
  s.block_start = s.strstart;
  flush_pending(s.strm);
};


const put_byte = (s, b) => {
  s.pending_buf[s.pending++] = b;
};


/* =========================================================================
 * Put a short in the pending buffer. The 16-bit value is put in MSB order.
 * IN assertion: the stream state is correct and there is enough room in
 * pending_buf.
 */
const putShortMSB = (s, b) => {

  //  put_byte(s, (Byte)(b >> 8));
//  put_byte(s, (Byte)(b & 0xff));
  s.pending_buf[s.pending++] = (b >>> 8) & 0xff;
  s.pending_buf[s.pending++] = b & 0xff;
};


/* ===========================================================================
 * Read a new buffer from the current input stream, update the adler32
 * and total number of bytes read.  All deflate() input goes through
 * this function so some applications may wish to modify it to avoid
 * allocating a large strm->input buffer and copying from it.
 * (See also flush_pending()).
 */
const read_buf = (strm, buf, start, size) => {

  let len = strm.avail_in;

  if (len > size) { len = size; }
  if (len === 0) { return 0; }

  strm.avail_in -= len;

  // zmemcpy(buf, strm->next_in, len);
  buf.set(strm.input.subarray(strm.next_in, strm.next_in + len), start);
  if (strm.state.wrap === 1) {
    strm.adler = adler32_1(strm.adler, buf, len, start);
  }

  else if (strm.state.wrap === 2) {
    strm.adler = crc32_1(strm.adler, buf, len, start);
  }

  strm.next_in += len;
  strm.total_in += len;

  return len;
};


/* ===========================================================================
 * Set match_start to the longest match starting at the given string and
 * return its length. Matches shorter or equal to prev_length are discarded,
 * in which case the result is equal to prev_length and match_start is
 * garbage.
 * IN assertions: cur_match is the head of the hash chain for the current
 *   string (strstart) and its distance is <= MAX_DIST, and prev_length >= 1
 * OUT assertion: the match length is not greater than s->lookahead.
 */
const longest_match = (s, cur_match) => {

  let chain_length = s.max_chain_length;      /* max hash chain length */
  let scan = s.strstart; /* current string */
  let match;                       /* matched string */
  let len;                           /* length of current match */
  let best_len = s.prev_length;              /* best match length so far */
  let nice_match = s.nice_match;             /* stop if match long enough */
  const limit = (s.strstart > (s.w_size - MIN_LOOKAHEAD)) ?
      s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0/*NIL*/;

  const _win = s.window; // shortcut

  const wmask = s.w_mask;
  const prev  = s.prev;

  /* Stop when cur_match becomes <= limit. To simplify the code,
   * we prevent matches with the string of window index 0.
   */

  const strend = s.strstart + MAX_MATCH;
  let scan_end1  = _win[scan + best_len - 1];
  let scan_end   = _win[scan + best_len];

  /* The code is optimized for HASH_BITS >= 8 and MAX_MATCH-2 multiple of 16.
   * It is easy to get rid of this optimization if necessary.
   */
  // Assert(s->hash_bits >= 8 && MAX_MATCH == 258, "Code too clever");

  /* Do not waste too much time if we already have a good match: */
  if (s.prev_length >= s.good_match) {
    chain_length >>= 2;
  }
  /* Do not look for matches beyond the end of the input. This is necessary
   * to make deflate deterministic.
   */
  if (nice_match > s.lookahead) { nice_match = s.lookahead; }

  // Assert((ulg)s->strstart <= s->window_size-MIN_LOOKAHEAD, "need lookahead");

  do {
    // Assert(cur_match < s->strstart, "no future");
    match = cur_match;

    /* Skip to next match if the match length cannot increase
     * or if the match length is less than 2.  Note that the checks below
     * for insufficient lookahead only occur occasionally for performance
     * reasons.  Therefore uninitialized memory will be accessed, and
     * conditional jumps will be made that depend on those values.
     * However the length of the match is limited to the lookahead, so
     * the output of deflate is not affected by the uninitialized values.
     */

    if (_win[match + best_len]     !== scan_end  ||
        _win[match + best_len - 1] !== scan_end1 ||
        _win[match]                !== _win[scan] ||
        _win[++match]              !== _win[scan + 1]) {
      continue;
    }

    /* The check at best_len-1 can be removed because it will be made
     * again later. (This heuristic is not always a win.)
     * It is not necessary to compare scan[2] and match[2] since they
     * are always equal when the other bytes match, given that
     * the hash keys are equal and that HASH_BITS >= 8.
     */
    scan += 2;
    match++;
    // Assert(*scan == *match, "match[2]?");

    /* We check for insufficient lookahead only every 8th comparison;
     * the 256th check will be made at strstart+258.
     */
    do {
      /*jshint noempty:false*/
    } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             scan < strend);

    // Assert(scan <= s->window+(unsigned)(s->window_size-1), "wild scan");

    len = MAX_MATCH - (strend - scan);
    scan = strend - MAX_MATCH;

    if (len > best_len) {
      s.match_start = cur_match;
      best_len = len;
      if (len >= nice_match) {
        break;
      }
      scan_end1  = _win[scan + best_len - 1];
      scan_end   = _win[scan + best_len];
    }
  } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);

  if (best_len <= s.lookahead) {
    return best_len;
  }
  return s.lookahead;
};


/* ===========================================================================
 * Fill the window when the lookahead becomes insufficient.
 * Updates strstart and lookahead.
 *
 * IN assertion: lookahead < MIN_LOOKAHEAD
 * OUT assertions: strstart <= window_size-MIN_LOOKAHEAD
 *    At least one byte has been read, or avail_in == 0; reads are
 *    performed for at least two bytes (required for the zip translate_eol
 *    option -- not supported here).
 */
const fill_window = (s) => {

  const _w_size = s.w_size;
  let n, more, str;

  //Assert(s->lookahead < MIN_LOOKAHEAD, "already enough lookahead");

  do {
    more = s.window_size - s.lookahead - s.strstart;

    // JS ints have 32 bit, block below not needed
    /* Deal with !@#$% 64K limit: */
    //if (sizeof(int) <= 2) {
    //    if (more == 0 && s->strstart == 0 && s->lookahead == 0) {
    //        more = wsize;
    //
    //  } else if (more == (unsigned)(-1)) {
    //        /* Very unlikely, but possible on 16 bit machine if
    //         * strstart == 0 && lookahead == 1 (input done a byte at time)
    //         */
    //        more--;
    //    }
    //}


    /* If the window is almost full and there is insufficient lookahead,
     * move the upper half to the lower one to make room in the upper half.
     */
    if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {

      s.window.set(s.window.subarray(_w_size, _w_size + _w_size - more), 0);
      s.match_start -= _w_size;
      s.strstart -= _w_size;
      /* we now have strstart >= MAX_DIST */
      s.block_start -= _w_size;
      if (s.insert > s.strstart) {
        s.insert = s.strstart;
      }
      slide_hash(s);
      more += _w_size;
    }
    if (s.strm.avail_in === 0) {
      break;
    }

    /* If there was no sliding:
     *    strstart <= WSIZE+MAX_DIST-1 && lookahead <= MIN_LOOKAHEAD - 1 &&
     *    more == window_size - lookahead - strstart
     * => more >= window_size - (MIN_LOOKAHEAD-1 + WSIZE + MAX_DIST-1)
     * => more >= window_size - 2*WSIZE + 2
     * In the BIG_MEM or MMAP case (not yet supported),
     *   window_size == input_size + MIN_LOOKAHEAD  &&
     *   strstart + s->lookahead <= input_size => more >= MIN_LOOKAHEAD.
     * Otherwise, window_size == 2*WSIZE so more >= 2.
     * If there was sliding, more >= WSIZE. So in all cases, more >= 2.
     */
    //Assert(more >= 2, "more < 2");
    n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
    s.lookahead += n;

    /* Initialize the hash value now that we have some input: */
    if (s.lookahead + s.insert >= MIN_MATCH) {
      str = s.strstart - s.insert;
      s.ins_h = s.window[str];

      /* UPDATE_HASH(s, s->ins_h, s->window[str + 1]); */
      s.ins_h = HASH(s, s.ins_h, s.window[str + 1]);
//#if MIN_MATCH != 3
//        Call update_hash() MIN_MATCH-3 more times
//#endif
      while (s.insert) {
        /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
        s.ins_h = HASH(s, s.ins_h, s.window[str + MIN_MATCH - 1]);

        s.prev[str & s.w_mask] = s.head[s.ins_h];
        s.head[s.ins_h] = str;
        str++;
        s.insert--;
        if (s.lookahead + s.insert < MIN_MATCH) {
          break;
        }
      }
    }
    /* If the whole input has less than MIN_MATCH bytes, ins_h is garbage,
     * but this is not important since only literal bytes will be emitted.
     */

  } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);

  /* If the WIN_INIT bytes after the end of the current data have never been
   * written, then zero those bytes in order to avoid memory check reports of
   * the use of uninitialized (or uninitialised as Julian writes) bytes by
   * the longest match routines.  Update the high water mark for the next
   * time through here.  WIN_INIT is set to MAX_MATCH since the longest match
   * routines allow scanning to strstart + MAX_MATCH, ignoring lookahead.
   */
//  if (s.high_water < s.window_size) {
//    const curr = s.strstart + s.lookahead;
//    let init = 0;
//
//    if (s.high_water < curr) {
//      /* Previous high water mark below current data -- zero WIN_INIT
//       * bytes or up to end of window, whichever is less.
//       */
//      init = s.window_size - curr;
//      if (init > WIN_INIT)
//        init = WIN_INIT;
//      zmemzero(s->window + curr, (unsigned)init);
//      s->high_water = curr + init;
//    }
//    else if (s->high_water < (ulg)curr + WIN_INIT) {
//      /* High water mark at or above current data, but below current data
//       * plus WIN_INIT -- zero out to current data plus WIN_INIT, or up
//       * to end of window, whichever is less.
//       */
//      init = (ulg)curr + WIN_INIT - s->high_water;
//      if (init > s->window_size - s->high_water)
//        init = s->window_size - s->high_water;
//      zmemzero(s->window + s->high_water, (unsigned)init);
//      s->high_water += init;
//    }
//  }
//
//  Assert((ulg)s->strstart <= s->window_size - MIN_LOOKAHEAD,
//    "not enough room for search");
};

/* ===========================================================================
 * Copy without compression as much as possible from the input stream, return
 * the current block state.
 *
 * In case deflateParams() is used to later switch to a non-zero compression
 * level, s->matches (otherwise unused when storing) keeps track of the number
 * of hash table slides to perform. If s->matches is 1, then one hash table
 * slide will be done when switching. If s->matches is 2, the maximum value
 * allowed here, then the hash table will be cleared, since two or more slides
 * is the same as a clear.
 *
 * deflate_stored() is written to minimize the number of times an input byte is
 * copied. It is most efficient with large input and output buffers, which
 * maximizes the opportunites to have a single copy from next_in to next_out.
 */
const deflate_stored = (s, flush) => {

  /* Smallest worthy block size when not flushing or finishing. By default
   * this is 32K. This can be as small as 507 bytes for memLevel == 1. For
   * large input and output buffers, the stored block size will be larger.
   */
  let min_block = s.pending_buf_size - 5 > s.w_size ? s.w_size : s.pending_buf_size - 5;

  /* Copy as many min_block or larger stored blocks directly to next_out as
   * possible. If flushing, copy the remaining available input to next_out as
   * stored blocks, if there is enough space.
   */
  let len, left, have, last = 0;
  let used = s.strm.avail_in;
  do {
    /* Set len to the maximum size block that we can copy directly with the
     * available input data and output space. Set left to how much of that
     * would be copied from what's left in the window.
     */
    len = 65535/* MAX_STORED */;     /* maximum deflate stored block length */
    have = (s.bi_valid + 42) >> 3;     /* number of header bytes */
    if (s.strm.avail_out < have) {         /* need room for header */
      break;
    }
      /* maximum stored block length that will fit in avail_out: */
    have = s.strm.avail_out - have;
    left = s.strstart - s.block_start;  /* bytes left in window */
    if (len > left + s.strm.avail_in) {
      len = left + s.strm.avail_in;   /* limit len to the input */
    }
    if (len > have) {
      len = have;             /* limit len to the output */
    }

    /* If the stored block would be less than min_block in length, or if
     * unable to copy all of the available input when flushing, then try
     * copying to the window and the pending buffer instead. Also don't
     * write an empty block when flushing -- deflate() does that.
     */
    if (len < min_block && ((len === 0 && flush !== Z_FINISH$3) ||
                        flush === Z_NO_FLUSH$2 ||
                        len !== left + s.strm.avail_in)) {
      break;
    }

    /* Make a dummy stored block in pending to get the header bytes,
     * including any pending bits. This also updates the debugging counts.
     */
    last = flush === Z_FINISH$3 && len === left + s.strm.avail_in ? 1 : 0;
    _tr_stored_block(s, 0, 0, last);

    /* Replace the lengths in the dummy stored block with len. */
    s.pending_buf[s.pending - 4] = len;
    s.pending_buf[s.pending - 3] = len >> 8;
    s.pending_buf[s.pending - 2] = ~len;
    s.pending_buf[s.pending - 1] = ~len >> 8;

    /* Write the stored block header bytes. */
    flush_pending(s.strm);

//#ifdef ZLIB_DEBUG
//    /* Update debugging counts for the data about to be copied. */
//    s->compressed_len += len << 3;
//    s->bits_sent += len << 3;
//#endif

    /* Copy uncompressed bytes from the window to next_out. */
    if (left) {
      if (left > len) {
        left = len;
      }
      //zmemcpy(s->strm->next_out, s->window + s->block_start, left);
      s.strm.output.set(s.window.subarray(s.block_start, s.block_start + left), s.strm.next_out);
      s.strm.next_out += left;
      s.strm.avail_out -= left;
      s.strm.total_out += left;
      s.block_start += left;
      len -= left;
    }

    /* Copy uncompressed bytes directly from next_in to next_out, updating
     * the check value.
     */
    if (len) {
      read_buf(s.strm, s.strm.output, s.strm.next_out, len);
      s.strm.next_out += len;
      s.strm.avail_out -= len;
      s.strm.total_out += len;
    }
  } while (last === 0);

  /* Update the sliding window with the last s->w_size bytes of the copied
   * data, or append all of the copied data to the existing window if less
   * than s->w_size bytes were copied. Also update the number of bytes to
   * insert in the hash tables, in the event that deflateParams() switches to
   * a non-zero compression level.
   */
  used -= s.strm.avail_in;    /* number of input bytes directly copied */
  if (used) {
    /* If any input was used, then no unused input remains in the window,
     * therefore s->block_start == s->strstart.
     */
    if (used >= s.w_size) {  /* supplant the previous history */
      s.matches = 2;     /* clear hash */
      //zmemcpy(s->window, s->strm->next_in - s->w_size, s->w_size);
      s.window.set(s.strm.input.subarray(s.strm.next_in - s.w_size, s.strm.next_in), 0);
      s.strstart = s.w_size;
      s.insert = s.strstart;
    }
    else {
      if (s.window_size - s.strstart <= used) {
        /* Slide the window down. */
        s.strstart -= s.w_size;
        //zmemcpy(s->window, s->window + s->w_size, s->strstart);
        s.window.set(s.window.subarray(s.w_size, s.w_size + s.strstart), 0);
        if (s.matches < 2) {
          s.matches++;   /* add a pending slide_hash() */
        }
        if (s.insert > s.strstart) {
          s.insert = s.strstart;
        }
      }
      //zmemcpy(s->window + s->strstart, s->strm->next_in - used, used);
      s.window.set(s.strm.input.subarray(s.strm.next_in - used, s.strm.next_in), s.strstart);
      s.strstart += used;
      s.insert += used > s.w_size - s.insert ? s.w_size - s.insert : used;
    }
    s.block_start = s.strstart;
  }
  if (s.high_water < s.strstart) {
    s.high_water = s.strstart;
  }

  /* If the last block was written to next_out, then done. */
  if (last) {
    return BS_FINISH_DONE;
  }

  /* If flushing and all input has been consumed, then done. */
  if (flush !== Z_NO_FLUSH$2 && flush !== Z_FINISH$3 &&
    s.strm.avail_in === 0 && s.strstart === s.block_start) {
    return BS_BLOCK_DONE;
  }

  /* Fill the window with any remaining input. */
  have = s.window_size - s.strstart;
  if (s.strm.avail_in > have && s.block_start >= s.w_size) {
    /* Slide the window down. */
    s.block_start -= s.w_size;
    s.strstart -= s.w_size;
    //zmemcpy(s->window, s->window + s->w_size, s->strstart);
    s.window.set(s.window.subarray(s.w_size, s.w_size + s.strstart), 0);
    if (s.matches < 2) {
      s.matches++;       /* add a pending slide_hash() */
    }
    have += s.w_size;      /* more space now */
    if (s.insert > s.strstart) {
      s.insert = s.strstart;
    }
  }
  if (have > s.strm.avail_in) {
    have = s.strm.avail_in;
  }
  if (have) {
    read_buf(s.strm, s.window, s.strstart, have);
    s.strstart += have;
    s.insert += have > s.w_size - s.insert ? s.w_size - s.insert : have;
  }
  if (s.high_water < s.strstart) {
    s.high_water = s.strstart;
  }

  /* There was not enough avail_out to write a complete worthy or flushed
   * stored block to next_out. Write a stored block to pending instead, if we
   * have enough input for a worthy block, or if flushing and there is enough
   * room for the remaining input as a stored block in the pending buffer.
   */
  have = (s.bi_valid + 42) >> 3;     /* number of header bytes */
    /* maximum stored block length that will fit in pending: */
  have = s.pending_buf_size - have > 65535/* MAX_STORED */ ? 65535/* MAX_STORED */ : s.pending_buf_size - have;
  min_block = have > s.w_size ? s.w_size : have;
  left = s.strstart - s.block_start;
  if (left >= min_block ||
     ((left || flush === Z_FINISH$3) && flush !== Z_NO_FLUSH$2 &&
     s.strm.avail_in === 0 && left <= have)) {
    len = left > have ? have : left;
    last = flush === Z_FINISH$3 && s.strm.avail_in === 0 &&
         len === left ? 1 : 0;
    _tr_stored_block(s, s.block_start, len, last);
    s.block_start += len;
    flush_pending(s.strm);
  }

  /* We've done all we can with the available input and output. */
  return last ? BS_FINISH_STARTED : BS_NEED_MORE;
};


/* ===========================================================================
 * Compress as much as possible from the input stream, return the current
 * block state.
 * This function does not perform lazy evaluation of matches and inserts
 * new strings in the dictionary only for unmatched strings or for short
 * matches. It is used only for the fast compression options.
 */
const deflate_fast = (s, flush) => {

  let hash_head;        /* head of the hash chain */
  let bflush;           /* set if current block must be flushed */

  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the next match, plus MIN_MATCH bytes to insert the
     * string following the next match.
     */
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH$2) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) {
        break; /* flush the current block */
      }
    }

    /* Insert the string window[strstart .. strstart+2] in the
     * dictionary, and set hash_head to the head of the hash chain:
     */
    hash_head = 0/*NIL*/;
    if (s.lookahead >= MIN_MATCH) {
      /*** INSERT_STRING(s, s.strstart, hash_head); ***/
      s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
      /***/
    }

    /* Find the longest match, discarding those <= prev_length.
     * At this point we have always match_length < MIN_MATCH
     */
    if (hash_head !== 0/*NIL*/ && ((s.strstart - hash_head) <= (s.w_size - MIN_LOOKAHEAD))) {
      /* To simplify the code, we prevent matches with the string
       * of window index 0 (in particular we have to avoid a match
       * of the string with itself at the start of the input file).
       */
      s.match_length = longest_match(s, hash_head);
      /* longest_match() sets match_start */
    }
    if (s.match_length >= MIN_MATCH) {
      // check_match(s, s.strstart, s.match_start, s.match_length); // for debug only

      /*** _tr_tally_dist(s, s.strstart - s.match_start,
                     s.match_length - MIN_MATCH, bflush); ***/
      bflush = _tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);

      s.lookahead -= s.match_length;

      /* Insert new strings in the hash table only if the match length
       * is not too large. This saves time but degrades compression.
       */
      if (s.match_length <= s.max_lazy_match/*max_insert_length*/ && s.lookahead >= MIN_MATCH) {
        s.match_length--; /* string at strstart already in table */
        do {
          s.strstart++;
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
          /* strstart never exceeds WSIZE-MAX_MATCH, so there are
           * always MIN_MATCH bytes ahead.
           */
        } while (--s.match_length !== 0);
        s.strstart++;
      } else
      {
        s.strstart += s.match_length;
        s.match_length = 0;
        s.ins_h = s.window[s.strstart];
        /* UPDATE_HASH(s, s.ins_h, s.window[s.strstart+1]); */
        s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + 1]);

//#if MIN_MATCH != 3
//                Call UPDATE_HASH() MIN_MATCH-3 more times
//#endif
        /* If lookahead < MIN_MATCH, ins_h is garbage, but it does not
         * matter since it will be recomputed at next deflate call.
         */
      }
    } else {
      /* No match, output a literal byte */
      //Tracevv((stderr,"%c", s.window[s.strstart]));
      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
      bflush = _tr_tally(s, 0, s.window[s.strstart]);

      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = ((s.strstart < (MIN_MATCH - 1)) ? s.strstart : MIN_MATCH - 1);
  if (flush === Z_FINISH$3) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.sym_next) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
};

/* ===========================================================================
 * Same as above, but achieves better compression. We use a lazy
 * evaluation for matches: a match is finally adopted only if there is
 * no better match at the next window position.
 */
const deflate_slow = (s, flush) => {

  let hash_head;          /* head of hash chain */
  let bflush;              /* set if current block must be flushed */

  let max_insert;

  /* Process the input block. */
  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the next match, plus MIN_MATCH bytes to insert the
     * string following the next match.
     */
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH$2) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) { break; } /* flush the current block */
    }

    /* Insert the string window[strstart .. strstart+2] in the
     * dictionary, and set hash_head to the head of the hash chain:
     */
    hash_head = 0/*NIL*/;
    if (s.lookahead >= MIN_MATCH) {
      /*** INSERT_STRING(s, s.strstart, hash_head); ***/
      s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
      /***/
    }

    /* Find the longest match, discarding those <= prev_length.
     */
    s.prev_length = s.match_length;
    s.prev_match = s.match_start;
    s.match_length = MIN_MATCH - 1;

    if (hash_head !== 0/*NIL*/ && s.prev_length < s.max_lazy_match &&
        s.strstart - hash_head <= (s.w_size - MIN_LOOKAHEAD)/*MAX_DIST(s)*/) {
      /* To simplify the code, we prevent matches with the string
       * of window index 0 (in particular we have to avoid a match
       * of the string with itself at the start of the input file).
       */
      s.match_length = longest_match(s, hash_head);
      /* longest_match() sets match_start */

      if (s.match_length <= 5 &&
         (s.strategy === Z_FILTERED || (s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096/*TOO_FAR*/))) {

        /* If prev_match is also MIN_MATCH, match_start is garbage
         * but we will ignore the current match anyway.
         */
        s.match_length = MIN_MATCH - 1;
      }
    }
    /* If there was a match at the previous step and the current
     * match is not better, output the previous match:
     */
    if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
      max_insert = s.strstart + s.lookahead - MIN_MATCH;
      /* Do not insert strings in hash table beyond this. */

      //check_match(s, s.strstart-1, s.prev_match, s.prev_length);

      /***_tr_tally_dist(s, s.strstart - 1 - s.prev_match,
                     s.prev_length - MIN_MATCH, bflush);***/
      bflush = _tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
      /* Insert in hash table all strings up to the end of the match.
       * strstart-1 and strstart are already inserted. If there is not
       * enough lookahead, the last two strings are not inserted in
       * the hash table.
       */
      s.lookahead -= s.prev_length - 1;
      s.prev_length -= 2;
      do {
        if (++s.strstart <= max_insert) {
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
        }
      } while (--s.prev_length !== 0);
      s.match_available = 0;
      s.match_length = MIN_MATCH - 1;
      s.strstart++;

      if (bflush) {
        /*** FLUSH_BLOCK(s, 0); ***/
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
        /***/
      }

    } else if (s.match_available) {
      /* If there was no match at the previous position, output a
       * single literal. If there was a match but the current match
       * is longer, truncate the previous match to a single literal.
       */
      //Tracevv((stderr,"%c", s->window[s->strstart-1]));
      /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
      bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);

      if (bflush) {
        /*** FLUSH_BLOCK_ONLY(s, 0) ***/
        flush_block_only(s, false);
        /***/
      }
      s.strstart++;
      s.lookahead--;
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    } else {
      /* There is no previous match to compare with, wait for
       * the next step to decide.
       */
      s.match_available = 1;
      s.strstart++;
      s.lookahead--;
    }
  }
  //Assert (flush != Z_NO_FLUSH, "no flush?");
  if (s.match_available) {
    //Tracevv((stderr,"%c", s->window[s->strstart-1]));
    /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
    bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);

    s.match_available = 0;
  }
  s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
  if (flush === Z_FINISH$3) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.sym_next) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }

  return BS_BLOCK_DONE;
};


/* ===========================================================================
 * For Z_RLE, simply look for runs of bytes, generate matches only of distance
 * one.  Do not maintain a hash table.  (It will be regenerated if this run of
 * deflate switches away from Z_RLE.)
 */
const deflate_rle = (s, flush) => {

  let bflush;            /* set if current block must be flushed */
  let prev;              /* byte at distance one to match */
  let scan, strend;      /* scan goes up to strend for length of run */

  const _win = s.window;

  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the longest run, plus one for the unrolled loop.
     */
    if (s.lookahead <= MAX_MATCH) {
      fill_window(s);
      if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH$2) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) { break; } /* flush the current block */
    }

    /* See how many times the previous byte repeats */
    s.match_length = 0;
    if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
      scan = s.strstart - 1;
      prev = _win[scan];
      if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
        strend = s.strstart + MAX_MATCH;
        do {
          /*jshint noempty:false*/
        } while (prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 scan < strend);
        s.match_length = MAX_MATCH - (strend - scan);
        if (s.match_length > s.lookahead) {
          s.match_length = s.lookahead;
        }
      }
      //Assert(scan <= s->window+(uInt)(s->window_size-1), "wild scan");
    }

    /* Emit match if have run of MIN_MATCH or longer, else emit literal */
    if (s.match_length >= MIN_MATCH) {
      //check_match(s, s.strstart, s.strstart - 1, s.match_length);

      /*** _tr_tally_dist(s, 1, s.match_length - MIN_MATCH, bflush); ***/
      bflush = _tr_tally(s, 1, s.match_length - MIN_MATCH);

      s.lookahead -= s.match_length;
      s.strstart += s.match_length;
      s.match_length = 0;
    } else {
      /* No match, output a literal byte */
      //Tracevv((stderr,"%c", s->window[s->strstart]));
      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
      bflush = _tr_tally(s, 0, s.window[s.strstart]);

      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH$3) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.sym_next) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
};

/* ===========================================================================
 * For Z_HUFFMAN_ONLY, do not look for matches.  Do not maintain a hash table.
 * (It will be regenerated if this run of deflate switches away from Huffman.)
 */
const deflate_huff = (s, flush) => {

  let bflush;             /* set if current block must be flushed */

  for (;;) {
    /* Make sure that we have a literal to write. */
    if (s.lookahead === 0) {
      fill_window(s);
      if (s.lookahead === 0) {
        if (flush === Z_NO_FLUSH$2) {
          return BS_NEED_MORE;
        }
        break;      /* flush the current block */
      }
    }

    /* Output a literal byte */
    s.match_length = 0;
    //Tracevv((stderr,"%c", s->window[s->strstart]));
    /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
    bflush = _tr_tally(s, 0, s.window[s.strstart]);
    s.lookahead--;
    s.strstart++;
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH$3) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.sym_next) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
};

/* Values for max_lazy_match, good_match and max_chain_length, depending on
 * the desired pack level (0..9). The values given below have been tuned to
 * exclude worst case performance for pathological files. Better values may be
 * found for specific files.
 */
function Config(good_length, max_lazy, nice_length, max_chain, func) {

  this.good_length = good_length;
  this.max_lazy = max_lazy;
  this.nice_length = nice_length;
  this.max_chain = max_chain;
  this.func = func;
}

const configuration_table = [
  /*      good lazy nice chain */
  new Config(0, 0, 0, 0, deflate_stored),          /* 0 store only */
  new Config(4, 4, 8, 4, deflate_fast),            /* 1 max speed, no lazy matches */
  new Config(4, 5, 16, 8, deflate_fast),           /* 2 */
  new Config(4, 6, 32, 32, deflate_fast),          /* 3 */

  new Config(4, 4, 16, 16, deflate_slow),          /* 4 lazy matches */
  new Config(8, 16, 32, 32, deflate_slow),         /* 5 */
  new Config(8, 16, 128, 128, deflate_slow),       /* 6 */
  new Config(8, 32, 128, 256, deflate_slow),       /* 7 */
  new Config(32, 128, 258, 1024, deflate_slow),    /* 8 */
  new Config(32, 258, 258, 4096, deflate_slow)     /* 9 max compression */
];


/* ===========================================================================
 * Initialize the "longest match" routines for a new zlib stream
 */
const lm_init = (s) => {

  s.window_size = 2 * s.w_size;

  /*** CLEAR_HASH(s); ***/
  zero(s.head); // Fill with NIL (= 0);

  /* Set the default configuration parameters:
   */
  s.max_lazy_match = configuration_table[s.level].max_lazy;
  s.good_match = configuration_table[s.level].good_length;
  s.nice_match = configuration_table[s.level].nice_length;
  s.max_chain_length = configuration_table[s.level].max_chain;

  s.strstart = 0;
  s.block_start = 0;
  s.lookahead = 0;
  s.insert = 0;
  s.match_length = s.prev_length = MIN_MATCH - 1;
  s.match_available = 0;
  s.ins_h = 0;
};


function DeflateState() {
  this.strm = null;            /* pointer back to this zlib stream */
  this.status = 0;            /* as the name implies */
  this.pending_buf = null;      /* output still pending */
  this.pending_buf_size = 0;  /* size of pending_buf */
  this.pending_out = 0;       /* next pending byte to output to the stream */
  this.pending = 0;           /* nb of bytes in the pending buffer */
  this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip */
  this.gzhead = null;         /* gzip header information to write */
  this.gzindex = 0;           /* where in extra, name, or comment */
  this.method = Z_DEFLATED$2; /* can only be DEFLATED */
  this.last_flush = -1;   /* value of flush param for previous deflate call */

  this.w_size = 0;  /* LZ77 window size (32K by default) */
  this.w_bits = 0;  /* log2(w_size)  (8..16) */
  this.w_mask = 0;  /* w_size - 1 */

  this.window = null;
  /* Sliding window. Input bytes are read into the second half of the window,
   * and move to the first half later to keep a dictionary of at least wSize
   * bytes. With this organization, matches are limited to a distance of
   * wSize-MAX_MATCH bytes, but this ensures that IO is always
   * performed with a length multiple of the block size.
   */

  this.window_size = 0;
  /* Actual size of window: 2*wSize, except when the user input buffer
   * is directly used as sliding window.
   */

  this.prev = null;
  /* Link to older string with same hash index. To limit the size of this
   * array to 64K, this link is maintained only for the last 32K strings.
   * An index in this array is thus a window index modulo 32K.
   */

  this.head = null;   /* Heads of the hash chains or NIL. */

  this.ins_h = 0;       /* hash index of string to be inserted */
  this.hash_size = 0;   /* number of elements in hash table */
  this.hash_bits = 0;   /* log2(hash_size) */
  this.hash_mask = 0;   /* hash_size-1 */

  this.hash_shift = 0;
  /* Number of bits by which ins_h must be shifted at each input
   * step. It must be such that after MIN_MATCH steps, the oldest
   * byte no longer takes part in the hash key, that is:
   *   hash_shift * MIN_MATCH >= hash_bits
   */

  this.block_start = 0;
  /* Window position at the beginning of the current output block. Gets
   * negative when the window is moved backwards.
   */

  this.match_length = 0;      /* length of best match */
  this.prev_match = 0;        /* previous match */
  this.match_available = 0;   /* set if previous match exists */
  this.strstart = 0;          /* start of string to insert */
  this.match_start = 0;       /* start of matching string */
  this.lookahead = 0;         /* number of valid bytes ahead in window */

  this.prev_length = 0;
  /* Length of the best match at previous step. Matches not greater than this
   * are discarded. This is used in the lazy match evaluation.
   */

  this.max_chain_length = 0;
  /* To speed up deflation, hash chains are never searched beyond this
   * length.  A higher limit improves compression ratio but degrades the
   * speed.
   */

  this.max_lazy_match = 0;
  /* Attempt to find a better match only when the current match is strictly
   * smaller than this value. This mechanism is used only for compression
   * levels >= 4.
   */
  // That's alias to max_lazy_match, don't use directly
  //this.max_insert_length = 0;
  /* Insert new strings in the hash table only if the match length is not
   * greater than this length. This saves time but degrades compression.
   * max_insert_length is used only for compression levels <= 3.
   */

  this.level = 0;     /* compression level (1..9) */
  this.strategy = 0;  /* favor or force Huffman coding*/

  this.good_match = 0;
  /* Use a faster search when the previous match is longer than this */

  this.nice_match = 0; /* Stop searching when current match exceeds this */

              /* used by trees.c: */

  /* Didn't use ct_data typedef below to suppress compiler warning */

  // struct ct_data_s dyn_ltree[HEAP_SIZE];   /* literal and length tree */
  // struct ct_data_s dyn_dtree[2*D_CODES+1]; /* distance tree */
  // struct ct_data_s bl_tree[2*BL_CODES+1];  /* Huffman tree for bit lengths */

  // Use flat array of DOUBLE size, with interleaved fata,
  // because JS does not support effective
  this.dyn_ltree  = new Uint16Array(HEAP_SIZE * 2);
  this.dyn_dtree  = new Uint16Array((2 * D_CODES + 1) * 2);
  this.bl_tree    = new Uint16Array((2 * BL_CODES + 1) * 2);
  zero(this.dyn_ltree);
  zero(this.dyn_dtree);
  zero(this.bl_tree);

  this.l_desc   = null;         /* desc. for literal tree */
  this.d_desc   = null;         /* desc. for distance tree */
  this.bl_desc  = null;         /* desc. for bit length tree */

  //ush bl_count[MAX_BITS+1];
  this.bl_count = new Uint16Array(MAX_BITS + 1);
  /* number of codes at each bit length for an optimal tree */

  //int heap[2*L_CODES+1];      /* heap used to build the Huffman trees */
  this.heap = new Uint16Array(2 * L_CODES + 1);  /* heap used to build the Huffman trees */
  zero(this.heap);

  this.heap_len = 0;               /* number of elements in the heap */
  this.heap_max = 0;               /* element of largest frequency */
  /* The sons of heap[n] are heap[2*n] and heap[2*n+1]. heap[0] is not used.
   * The same heap array is used to build all trees.
   */

  this.depth = new Uint16Array(2 * L_CODES + 1); //uch depth[2*L_CODES+1];
  zero(this.depth);
  /* Depth of each subtree used as tie breaker for trees of equal frequency
   */

  this.sym_buf = 0;        /* buffer for distances and literals/lengths */

  this.lit_bufsize = 0;
  /* Size of match buffer for literals/lengths.  There are 4 reasons for
   * limiting lit_bufsize to 64K:
   *   - frequencies can be kept in 16 bit counters
   *   - if compression is not successful for the first block, all input
   *     data is still in the window so we can still emit a stored block even
   *     when input comes from standard input.  (This can also be done for
   *     all blocks if lit_bufsize is not greater than 32K.)
   *   - if compression is not successful for a file smaller than 64K, we can
   *     even emit a stored file instead of a stored block (saving 5 bytes).
   *     This is applicable only for zip (not gzip or zlib).
   *   - creating new Huffman trees less frequently may not provide fast
   *     adaptation to changes in the input data statistics. (Take for
   *     example a binary file with poorly compressible code followed by
   *     a highly compressible string table.) Smaller buffer sizes give
   *     fast adaptation but have of course the overhead of transmitting
   *     trees more frequently.
   *   - I can't count above 4
   */

  this.sym_next = 0;      /* running index in sym_buf */
  this.sym_end = 0;       /* symbol table full when sym_next reaches this */

  this.opt_len = 0;       /* bit length of current block with optimal trees */
  this.static_len = 0;    /* bit length of current block with static trees */
  this.matches = 0;       /* number of string matches in current block */
  this.insert = 0;        /* bytes at end of window left to insert */


  this.bi_buf = 0;
  /* Output buffer. bits are inserted starting at the bottom (least
   * significant bits).
   */
  this.bi_valid = 0;
  /* Number of valid bits in bi_buf.  All bits above the last valid bit
   * are always zero.
   */

  // Used for window memory init. We safely ignore it for JS. That makes
  // sense only for pointers and memory check tools.
  //this.high_water = 0;
  /* High water mark offset in window for initialized bytes -- bytes above
   * this are set to zero in order to avoid memory check warnings when
   * longest match routines access bytes past the input.  This is then
   * updated to the new high water mark.
   */
}


/* =========================================================================
 * Check for a valid deflate stream state. Return 0 if ok, 1 if not.
 */
const deflateStateCheck = (strm) => {

  if (!strm) {
    return 1;
  }
  const s = strm.state;
  if (!s || s.strm !== strm || (s.status !== INIT_STATE &&
//#ifdef GZIP
                                s.status !== GZIP_STATE &&
//#endif
                                s.status !== EXTRA_STATE &&
                                s.status !== NAME_STATE &&
                                s.status !== COMMENT_STATE &&
                                s.status !== HCRC_STATE &&
                                s.status !== BUSY_STATE &&
                                s.status !== FINISH_STATE)) {
    return 1;
  }
  return 0;
};


const deflateResetKeep = (strm) => {

  if (deflateStateCheck(strm)) {
    return err(strm, Z_STREAM_ERROR$2);
  }

  strm.total_in = strm.total_out = 0;
  strm.data_type = Z_UNKNOWN;

  const s = strm.state;
  s.pending = 0;
  s.pending_out = 0;

  if (s.wrap < 0) {
    s.wrap = -s.wrap;
    /* was made negative by deflate(..., Z_FINISH); */
  }
  s.status =
//#ifdef GZIP
    s.wrap === 2 ? GZIP_STATE :
//#endif
    s.wrap ? INIT_STATE : BUSY_STATE;
  strm.adler = (s.wrap === 2) ?
    0  // crc32(0, Z_NULL, 0)
  :
    1; // adler32(0, Z_NULL, 0)
  s.last_flush = -2;
  _tr_init(s);
  return Z_OK$3;
};


const deflateReset = (strm) => {

  const ret = deflateResetKeep(strm);
  if (ret === Z_OK$3) {
    lm_init(strm.state);
  }
  return ret;
};


const deflateSetHeader = (strm, head) => {

  if (deflateStateCheck(strm) || strm.state.wrap !== 2) {
    return Z_STREAM_ERROR$2;
  }
  strm.state.gzhead = head;
  return Z_OK$3;
};


const deflateInit2 = (strm, level, method, windowBits, memLevel, strategy) => {

  if (!strm) { // === Z_NULL
    return Z_STREAM_ERROR$2;
  }
  let wrap = 1;

  if (level === Z_DEFAULT_COMPRESSION$1) {
    level = 6;
  }

  if (windowBits < 0) { /* suppress zlib wrapper */
    wrap = 0;
    windowBits = -windowBits;
  }

  else if (windowBits > 15) {
    wrap = 2;           /* write gzip wrapper instead */
    windowBits -= 16;
  }


  if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED$2 ||
    windowBits < 8 || windowBits > 15 || level < 0 || level > 9 ||
    strategy < 0 || strategy > Z_FIXED || (windowBits === 8 && wrap !== 1)) {
    return err(strm, Z_STREAM_ERROR$2);
  }


  if (windowBits === 8) {
    windowBits = 9;
  }
  /* until 256-byte window bug fixed */

  const s = new DeflateState();

  strm.state = s;
  s.strm = strm;
  s.status = INIT_STATE;     /* to pass state test in deflateReset() */

  s.wrap = wrap;
  s.gzhead = null;
  s.w_bits = windowBits;
  s.w_size = 1 << s.w_bits;
  s.w_mask = s.w_size - 1;

  s.hash_bits = memLevel + 7;
  s.hash_size = 1 << s.hash_bits;
  s.hash_mask = s.hash_size - 1;
  s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);

  s.window = new Uint8Array(s.w_size * 2);
  s.head = new Uint16Array(s.hash_size);
  s.prev = new Uint16Array(s.w_size);

  // Don't need mem init magic for JS.
  //s.high_water = 0;  /* nothing written to s->window yet */

  s.lit_bufsize = 1 << (memLevel + 6); /* 16K elements by default */

  /* We overlay pending_buf and sym_buf. This works since the average size
   * for length/distance pairs over any compressed block is assured to be 31
   * bits or less.
   *
   * Analysis: The longest fixed codes are a length code of 8 bits plus 5
   * extra bits, for lengths 131 to 257. The longest fixed distance codes are
   * 5 bits plus 13 extra bits, for distances 16385 to 32768. The longest
   * possible fixed-codes length/distance pair is then 31 bits total.
   *
   * sym_buf starts one-fourth of the way into pending_buf. So there are
   * three bytes in sym_buf for every four bytes in pending_buf. Each symbol
   * in sym_buf is three bytes -- two for the distance and one for the
   * literal/length. As each symbol is consumed, the pointer to the next
   * sym_buf value to read moves forward three bytes. From that symbol, up to
   * 31 bits are written to pending_buf. The closest the written pending_buf
   * bits gets to the next sym_buf symbol to read is just before the last
   * code is written. At that time, 31*(n-2) bits have been written, just
   * after 24*(n-2) bits have been consumed from sym_buf. sym_buf starts at
   * 8*n bits into pending_buf. (Note that the symbol buffer fills when n-1
   * symbols are written.) The closest the writing gets to what is unread is
   * then n+14 bits. Here n is lit_bufsize, which is 16384 by default, and
   * can range from 128 to 32768.
   *
   * Therefore, at a minimum, there are 142 bits of space between what is
   * written and what is read in the overlain buffers, so the symbols cannot
   * be overwritten by the compressed data. That space is actually 139 bits,
   * due to the three-bit fixed-code block header.
   *
   * That covers the case where either Z_FIXED is specified, forcing fixed
   * codes, or when the use of fixed codes is chosen, because that choice
   * results in a smaller compressed block than dynamic codes. That latter
   * condition then assures that the above analysis also covers all dynamic
   * blocks. A dynamic-code block will only be chosen to be emitted if it has
   * fewer bits than a fixed-code block would for the same set of symbols.
   * Therefore its average symbol length is assured to be less than 31. So
   * the compressed data for a dynamic block also cannot overwrite the
   * symbols from which it is being constructed.
   */

  s.pending_buf_size = s.lit_bufsize * 4;
  s.pending_buf = new Uint8Array(s.pending_buf_size);

  // It is offset from `s.pending_buf` (size is `s.lit_bufsize * 2`)
  //s->sym_buf = s->pending_buf + s->lit_bufsize;
  s.sym_buf = s.lit_bufsize;

  //s->sym_end = (s->lit_bufsize - 1) * 3;
  s.sym_end = (s.lit_bufsize - 1) * 3;
  /* We avoid equality with lit_bufsize*3 because of wraparound at 64K
   * on 16 bit machines and because stored blocks are restricted to
   * 64K-1 bytes.
   */

  s.level = level;
  s.strategy = strategy;
  s.method = method;

  return deflateReset(strm);
};

const deflateInit = (strm, level) => {

  return deflateInit2(strm, level, Z_DEFLATED$2, MAX_WBITS$1, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY$1);
};


/* ========================================================================= */
const deflate$2 = (strm, flush) => {

  if (deflateStateCheck(strm) || flush > Z_BLOCK$1 || flush < 0) {
    return strm ? err(strm, Z_STREAM_ERROR$2) : Z_STREAM_ERROR$2;
  }

  const s = strm.state;

  if (!strm.output ||
      (strm.avail_in !== 0 && !strm.input) ||
      (s.status === FINISH_STATE && flush !== Z_FINISH$3)) {
    return err(strm, (strm.avail_out === 0) ? Z_BUF_ERROR$1 : Z_STREAM_ERROR$2);
  }

  const old_flush = s.last_flush;
  s.last_flush = flush;

  /* Flush as much pending output as possible */
  if (s.pending !== 0) {
    flush_pending(strm);
    if (strm.avail_out === 0) {
      /* Since avail_out is 0, deflate will be called again with
       * more output space, but possibly with both pending and
       * avail_in equal to zero. There won't be anything to do,
       * but this is not an error situation so make sure we
       * return OK instead of BUF_ERROR at next call of deflate:
       */
      s.last_flush = -1;
      return Z_OK$3;
    }

    /* Make sure there is something to do and avoid duplicate consecutive
     * flushes. For repeated and useless calls with Z_FINISH, we keep
     * returning Z_STREAM_END instead of Z_BUF_ERROR.
     */
  } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) &&
    flush !== Z_FINISH$3) {
    return err(strm, Z_BUF_ERROR$1);
  }

  /* User must not provide more input after the first FINISH: */
  if (s.status === FINISH_STATE && strm.avail_in !== 0) {
    return err(strm, Z_BUF_ERROR$1);
  }

  /* Write the header */
  if (s.status === INIT_STATE && s.wrap === 0) {
    s.status = BUSY_STATE;
  }
  if (s.status === INIT_STATE) {
    /* zlib header */
    let header = (Z_DEFLATED$2 + ((s.w_bits - 8) << 4)) << 8;
    let level_flags = -1;

    if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
      level_flags = 0;
    } else if (s.level < 6) {
      level_flags = 1;
    } else if (s.level === 6) {
      level_flags = 2;
    } else {
      level_flags = 3;
    }
    header |= (level_flags << 6);
    if (s.strstart !== 0) { header |= PRESET_DICT; }
    header += 31 - (header % 31);

    putShortMSB(s, header);

    /* Save the adler32 of the preset dictionary: */
    if (s.strstart !== 0) {
      putShortMSB(s, strm.adler >>> 16);
      putShortMSB(s, strm.adler & 0xffff);
    }
    strm.adler = 1; // adler32(0L, Z_NULL, 0);
    s.status = BUSY_STATE;

    /* Compression must start with an empty pending buffer */
    flush_pending(strm);
    if (s.pending !== 0) {
      s.last_flush = -1;
      return Z_OK$3;
    }
  }
//#ifdef GZIP
  if (s.status === GZIP_STATE) {
    /* gzip header */
    strm.adler = 0;  //crc32(0L, Z_NULL, 0);
    put_byte(s, 31);
    put_byte(s, 139);
    put_byte(s, 8);
    if (!s.gzhead) { // s->gzhead == Z_NULL
      put_byte(s, 0);
      put_byte(s, 0);
      put_byte(s, 0);
      put_byte(s, 0);
      put_byte(s, 0);
      put_byte(s, s.level === 9 ? 2 :
                  (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                   4 : 0));
      put_byte(s, OS_CODE);
      s.status = BUSY_STATE;

      /* Compression must start with an empty pending buffer */
      flush_pending(strm);
      if (s.pending !== 0) {
        s.last_flush = -1;
        return Z_OK$3;
      }
    }
    else {
      put_byte(s, (s.gzhead.text ? 1 : 0) +
                  (s.gzhead.hcrc ? 2 : 0) +
                  (!s.gzhead.extra ? 0 : 4) +
                  (!s.gzhead.name ? 0 : 8) +
                  (!s.gzhead.comment ? 0 : 16)
      );
      put_byte(s, s.gzhead.time & 0xff);
      put_byte(s, (s.gzhead.time >> 8) & 0xff);
      put_byte(s, (s.gzhead.time >> 16) & 0xff);
      put_byte(s, (s.gzhead.time >> 24) & 0xff);
      put_byte(s, s.level === 9 ? 2 :
                  (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                   4 : 0));
      put_byte(s, s.gzhead.os & 0xff);
      if (s.gzhead.extra && s.gzhead.extra.length) {
        put_byte(s, s.gzhead.extra.length & 0xff);
        put_byte(s, (s.gzhead.extra.length >> 8) & 0xff);
      }
      if (s.gzhead.hcrc) {
        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending, 0);
      }
      s.gzindex = 0;
      s.status = EXTRA_STATE;
    }
  }
  if (s.status === EXTRA_STATE) {
    if (s.gzhead.extra/* != Z_NULL*/) {
      let beg = s.pending;   /* start of bytes to update crc */
      let left = (s.gzhead.extra.length & 0xffff) - s.gzindex;
      while (s.pending + left > s.pending_buf_size) {
        let copy = s.pending_buf_size - s.pending;
        // zmemcpy(s.pending_buf + s.pending,
        //    s.gzhead.extra + s.gzindex, copy);
        s.pending_buf.set(s.gzhead.extra.subarray(s.gzindex, s.gzindex + copy), s.pending);
        s.pending = s.pending_buf_size;
        //--- HCRC_UPDATE(beg) ---//
        if (s.gzhead.hcrc && s.pending > beg) {
          strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
        }
        //---//
        s.gzindex += copy;
        flush_pending(strm);
        if (s.pending !== 0) {
          s.last_flush = -1;
          return Z_OK$3;
        }
        beg = 0;
        left -= copy;
      }
      // JS specific: s.gzhead.extra may be TypedArray or Array for backward compatibility
      //              TypedArray.slice and TypedArray.from don't exist in IE10-IE11
      let gzhead_extra = new Uint8Array(s.gzhead.extra);
      // zmemcpy(s->pending_buf + s->pending,
      //     s->gzhead->extra + s->gzindex, left);
      s.pending_buf.set(gzhead_extra.subarray(s.gzindex, s.gzindex + left), s.pending);
      s.pending += left;
      //--- HCRC_UPDATE(beg) ---//
      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      //---//
      s.gzindex = 0;
    }
    s.status = NAME_STATE;
  }
  if (s.status === NAME_STATE) {
    if (s.gzhead.name/* != Z_NULL*/) {
      let beg = s.pending;   /* start of bytes to update crc */
      let val;
      do {
        if (s.pending === s.pending_buf_size) {
          //--- HCRC_UPDATE(beg) ---//
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          //---//
          flush_pending(strm);
          if (s.pending !== 0) {
            s.last_flush = -1;
            return Z_OK$3;
          }
          beg = 0;
        }
        // JS specific: little magic to add zero terminator to end of string
        if (s.gzindex < s.gzhead.name.length) {
          val = s.gzhead.name.charCodeAt(s.gzindex++) & 0xff;
        } else {
          val = 0;
        }
        put_byte(s, val);
      } while (val !== 0);
      //--- HCRC_UPDATE(beg) ---//
      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      //---//
      s.gzindex = 0;
    }
    s.status = COMMENT_STATE;
  }
  if (s.status === COMMENT_STATE) {
    if (s.gzhead.comment/* != Z_NULL*/) {
      let beg = s.pending;   /* start of bytes to update crc */
      let val;
      do {
        if (s.pending === s.pending_buf_size) {
          //--- HCRC_UPDATE(beg) ---//
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          //---//
          flush_pending(strm);
          if (s.pending !== 0) {
            s.last_flush = -1;
            return Z_OK$3;
          }
          beg = 0;
        }
        // JS specific: little magic to add zero terminator to end of string
        if (s.gzindex < s.gzhead.comment.length) {
          val = s.gzhead.comment.charCodeAt(s.gzindex++) & 0xff;
        } else {
          val = 0;
        }
        put_byte(s, val);
      } while (val !== 0);
      //--- HCRC_UPDATE(beg) ---//
      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      //---//
    }
    s.status = HCRC_STATE;
  }
  if (s.status === HCRC_STATE) {
    if (s.gzhead.hcrc) {
      if (s.pending + 2 > s.pending_buf_size) {
        flush_pending(strm);
        if (s.pending !== 0) {
          s.last_flush = -1;
          return Z_OK$3;
        }
      }
      put_byte(s, strm.adler & 0xff);
      put_byte(s, (strm.adler >> 8) & 0xff);
      strm.adler = 0; //crc32(0L, Z_NULL, 0);
    }
    s.status = BUSY_STATE;

    /* Compression must start with an empty pending buffer */
    flush_pending(strm);
    if (s.pending !== 0) {
      s.last_flush = -1;
      return Z_OK$3;
    }
  }
//#endif

  /* Start a new block or continue the current one.
   */
  if (strm.avail_in !== 0 || s.lookahead !== 0 ||
    (flush !== Z_NO_FLUSH$2 && s.status !== FINISH_STATE)) {
    let bstate = s.level === 0 ? deflate_stored(s, flush) :
                 s.strategy === Z_HUFFMAN_ONLY ? deflate_huff(s, flush) :
                 s.strategy === Z_RLE ? deflate_rle(s, flush) :
                 configuration_table[s.level].func(s, flush);

    if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
      s.status = FINISH_STATE;
    }
    if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
      if (strm.avail_out === 0) {
        s.last_flush = -1;
        /* avoid BUF_ERROR next call, see above */
      }
      return Z_OK$3;
      /* If flush != Z_NO_FLUSH && avail_out == 0, the next call
       * of deflate should use the same flush parameter to make sure
       * that the flush is complete. So we don't have to output an
       * empty block here, this will be done at next call. This also
       * ensures that for a very small output buffer, we emit at most
       * one empty block.
       */
    }
    if (bstate === BS_BLOCK_DONE) {
      if (flush === Z_PARTIAL_FLUSH) {
        _tr_align(s);
      }
      else if (flush !== Z_BLOCK$1) { /* FULL_FLUSH or SYNC_FLUSH */

        _tr_stored_block(s, 0, 0, false);
        /* For a full flush, this empty block will be recognized
         * as a special marker by inflate_sync().
         */
        if (flush === Z_FULL_FLUSH$1) {
          /*** CLEAR_HASH(s); ***/             /* forget history */
          zero(s.head); // Fill with NIL (= 0);

          if (s.lookahead === 0) {
            s.strstart = 0;
            s.block_start = 0;
            s.insert = 0;
          }
        }
      }
      flush_pending(strm);
      if (strm.avail_out === 0) {
        s.last_flush = -1; /* avoid BUF_ERROR at next call, see above */
        return Z_OK$3;
      }
    }
  }

  if (flush !== Z_FINISH$3) { return Z_OK$3; }
  if (s.wrap <= 0) { return Z_STREAM_END$3; }

  /* Write the trailer */
  if (s.wrap === 2) {
    put_byte(s, strm.adler & 0xff);
    put_byte(s, (strm.adler >> 8) & 0xff);
    put_byte(s, (strm.adler >> 16) & 0xff);
    put_byte(s, (strm.adler >> 24) & 0xff);
    put_byte(s, strm.total_in & 0xff);
    put_byte(s, (strm.total_in >> 8) & 0xff);
    put_byte(s, (strm.total_in >> 16) & 0xff);
    put_byte(s, (strm.total_in >> 24) & 0xff);
  }
  else
  {
    putShortMSB(s, strm.adler >>> 16);
    putShortMSB(s, strm.adler & 0xffff);
  }

  flush_pending(strm);
  /* If avail_out is zero, the application will call deflate again
   * to flush the rest.
   */
  if (s.wrap > 0) { s.wrap = -s.wrap; }
  /* write the trailer only once! */
  return s.pending !== 0 ? Z_OK$3 : Z_STREAM_END$3;
};


const deflateEnd = (strm) => {

  if (deflateStateCheck(strm)) {
    return Z_STREAM_ERROR$2;
  }

  const status = strm.state.status;

  strm.state = null;

  return status === BUSY_STATE ? err(strm, Z_DATA_ERROR$2) : Z_OK$3;
};


/* =========================================================================
 * Initializes the compression dictionary from the given byte
 * sequence without producing any compressed output.
 */
const deflateSetDictionary = (strm, dictionary) => {

  let dictLength = dictionary.length;

  if (deflateStateCheck(strm)) {
    return Z_STREAM_ERROR$2;
  }

  const s = strm.state;
  const wrap = s.wrap;

  if (wrap === 2 || (wrap === 1 && s.status !== INIT_STATE) || s.lookahead) {
    return Z_STREAM_ERROR$2;
  }

  /* when using zlib wrappers, compute Adler-32 for provided dictionary */
  if (wrap === 1) {
    /* adler32(strm->adler, dictionary, dictLength); */
    strm.adler = adler32_1(strm.adler, dictionary, dictLength, 0);
  }

  s.wrap = 0;   /* avoid computing Adler-32 in read_buf */

  /* if dictionary would fill window, just replace the history */
  if (dictLength >= s.w_size) {
    if (wrap === 0) {            /* already empty otherwise */
      /*** CLEAR_HASH(s); ***/
      zero(s.head); // Fill with NIL (= 0);
      s.strstart = 0;
      s.block_start = 0;
      s.insert = 0;
    }
    /* use the tail */
    // dictionary = dictionary.slice(dictLength - s.w_size);
    let tmpDict = new Uint8Array(s.w_size);
    tmpDict.set(dictionary.subarray(dictLength - s.w_size, dictLength), 0);
    dictionary = tmpDict;
    dictLength = s.w_size;
  }
  /* insert dictionary into window and hash */
  const avail = strm.avail_in;
  const next = strm.next_in;
  const input = strm.input;
  strm.avail_in = dictLength;
  strm.next_in = 0;
  strm.input = dictionary;
  fill_window(s);
  while (s.lookahead >= MIN_MATCH) {
    let str = s.strstart;
    let n = s.lookahead - (MIN_MATCH - 1);
    do {
      /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
      s.ins_h = HASH(s, s.ins_h, s.window[str + MIN_MATCH - 1]);

      s.prev[str & s.w_mask] = s.head[s.ins_h];

      s.head[s.ins_h] = str;
      str++;
    } while (--n);
    s.strstart = str;
    s.lookahead = MIN_MATCH - 1;
    fill_window(s);
  }
  s.strstart += s.lookahead;
  s.block_start = s.strstart;
  s.insert = s.lookahead;
  s.lookahead = 0;
  s.match_length = s.prev_length = MIN_MATCH - 1;
  s.match_available = 0;
  strm.next_in = next;
  strm.input = input;
  strm.avail_in = avail;
  s.wrap = wrap;
  return Z_OK$3;
};


var deflateInit_1 = deflateInit;
var deflateInit2_1 = deflateInit2;
var deflateReset_1 = deflateReset;
var deflateResetKeep_1 = deflateResetKeep;
var deflateSetHeader_1 = deflateSetHeader;
var deflate_2$1 = deflate$2;
var deflateEnd_1 = deflateEnd;
var deflateSetDictionary_1 = deflateSetDictionary;
var deflateInfo = 'pako deflate (from Nodeca project)';

/* Not implemented
module.exports.deflateBound = deflateBound;
module.exports.deflateCopy = deflateCopy;
module.exports.deflateGetDictionary = deflateGetDictionary;
module.exports.deflateParams = deflateParams;
module.exports.deflatePending = deflatePending;
module.exports.deflatePrime = deflatePrime;
module.exports.deflateTune = deflateTune;
*/

var deflate_1$2 = {
	deflateInit: deflateInit_1,
	deflateInit2: deflateInit2_1,
	deflateReset: deflateReset_1,
	deflateResetKeep: deflateResetKeep_1,
	deflateSetHeader: deflateSetHeader_1,
	deflate: deflate_2$1,
	deflateEnd: deflateEnd_1,
	deflateSetDictionary: deflateSetDictionary_1,
	deflateInfo: deflateInfo
};

const _has = (obj, key) => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

var assign = function (obj /*from1, from2, from3, ...*/) {
  const sources = Array.prototype.slice.call(arguments, 1);
  while (sources.length) {
    const source = sources.shift();
    if (!source) { continue; }

    if (typeof source !== 'object') {
      throw new TypeError(source + 'must be non-object');
    }

    for (const p in source) {
      if (_has(source, p)) {
        obj[p] = source[p];
      }
    }
  }

  return obj;
};


// Join array of chunks to single array.
var flattenChunks = (chunks) => {
  // calculate data length
  let len = 0;

  for (let i = 0, l = chunks.length; i < l; i++) {
    len += chunks[i].length;
  }

  // join chunks
  const result = new Uint8Array(len);

  for (let i = 0, pos = 0, l = chunks.length; i < l; i++) {
    let chunk = chunks[i];
    result.set(chunk, pos);
    pos += chunk.length;
  }

  return result;
};

var common = {
	assign: assign,
	flattenChunks: flattenChunks
};

// String encode/decode helpers


// Quick check if we can use fast array to bin string conversion
//
// - apply(Array) can fail on Android 2.2
// - apply(Uint8Array) can fail on iOS 5.1 Safari
//
let STR_APPLY_UIA_OK = true;

try { String.fromCharCode.apply(null, new Uint8Array(1)); } catch (__) { STR_APPLY_UIA_OK = false; }


// Table with utf8 lengths (calculated by first byte of sequence)
// Note, that 5 & 6-byte values and some 4-byte values can not be represented in JS,
// because max possible codepoint is 0x10ffff
const _utf8len = new Uint8Array(256);
for (let q = 0; q < 256; q++) {
  _utf8len[q] = (q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1);
}
_utf8len[254] = _utf8len[254] = 1; // Invalid sequence start


// convert string to array (typed, when possible)
var string2buf = (str) => {
  if (typeof TextEncoder === 'function' && TextEncoder.prototype.encode) {
    return new TextEncoder().encode(str);
  }

  let buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;

  // count binary size
  for (m_pos = 0; m_pos < str_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
      c2 = str.charCodeAt(m_pos + 1);
      if ((c2 & 0xfc00) === 0xdc00) {
        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        m_pos++;
      }
    }
    buf_len += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
  }

  // allocate buffer
  buf = new Uint8Array(buf_len);

  // convert
  for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
      c2 = str.charCodeAt(m_pos + 1);
      if ((c2 & 0xfc00) === 0xdc00) {
        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        m_pos++;
      }
    }
    if (c < 0x80) {
      /* one byte */
      buf[i++] = c;
    } else if (c < 0x800) {
      /* two bytes */
      buf[i++] = 0xC0 | (c >>> 6);
      buf[i++] = 0x80 | (c & 0x3f);
    } else if (c < 0x10000) {
      /* three bytes */
      buf[i++] = 0xE0 | (c >>> 12);
      buf[i++] = 0x80 | (c >>> 6 & 0x3f);
      buf[i++] = 0x80 | (c & 0x3f);
    } else {
      /* four bytes */
      buf[i++] = 0xf0 | (c >>> 18);
      buf[i++] = 0x80 | (c >>> 12 & 0x3f);
      buf[i++] = 0x80 | (c >>> 6 & 0x3f);
      buf[i++] = 0x80 | (c & 0x3f);
    }
  }

  return buf;
};

// Helper
const buf2binstring = (buf, len) => {
  // On Chrome, the arguments in a function call that are allowed is `65534`.
  // If the length of the buffer is smaller than that, we can use this optimization,
  // otherwise we will take a slower path.
  if (len < 65534) {
    if (buf.subarray && STR_APPLY_UIA_OK) {
      return String.fromCharCode.apply(null, buf.length === len ? buf : buf.subarray(0, len));
    }
  }

  let result = '';
  for (let i = 0; i < len; i++) {
    result += String.fromCharCode(buf[i]);
  }
  return result;
};


// convert array to string
var buf2string = (buf, max) => {
  const len = max || buf.length;

  if (typeof TextDecoder === 'function' && TextDecoder.prototype.decode) {
    return new TextDecoder().decode(buf.subarray(0, max));
  }

  let i, out;

  // Reserve max possible length (2 words per char)
  // NB: by unknown reasons, Array is significantly faster for
  //     String.fromCharCode.apply than Uint16Array.
  const utf16buf = new Array(len * 2);

  for (out = 0, i = 0; i < len;) {
    let c = buf[i++];
    // quick process ascii
    if (c < 0x80) { utf16buf[out++] = c; continue; }

    let c_len = _utf8len[c];
    // skip 5 & 6 byte codes
    if (c_len > 4) { utf16buf[out++] = 0xfffd; i += c_len - 1; continue; }

    // apply mask on first byte
    c &= c_len === 2 ? 0x1f : c_len === 3 ? 0x0f : 0x07;
    // join the rest
    while (c_len > 1 && i < len) {
      c = (c << 6) | (buf[i++] & 0x3f);
      c_len--;
    }

    // terminated by end of string?
    if (c_len > 1) { utf16buf[out++] = 0xfffd; continue; }

    if (c < 0x10000) {
      utf16buf[out++] = c;
    } else {
      c -= 0x10000;
      utf16buf[out++] = 0xd800 | ((c >> 10) & 0x3ff);
      utf16buf[out++] = 0xdc00 | (c & 0x3ff);
    }
  }

  return buf2binstring(utf16buf, out);
};


// Calculate max possible position in utf8 buffer,
// that will not break sequence. If that's not possible
// - (very small limits) return max size as is.
//
// buf[] - utf8 bytes array
// max   - length limit (mandatory);
var utf8border = (buf, max) => {

  max = max || buf.length;
  if (max > buf.length) { max = buf.length; }

  // go back from last position, until start of sequence found
  let pos = max - 1;
  while (pos >= 0 && (buf[pos] & 0xC0) === 0x80) { pos--; }

  // Very small and broken sequence,
  // return max, because we should return something anyway.
  if (pos < 0) { return max; }

  // If we came to start of buffer - that means buffer is too small,
  // return max too.
  if (pos === 0) { return max; }

  return (pos + _utf8len[buf[pos]] > max) ? pos : max;
};

var strings = {
	string2buf: string2buf,
	buf2string: buf2string,
	utf8border: utf8border
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

function ZStream() {
  /* next input byte */
  this.input = null; // JS specific, because we have no pointers
  this.next_in = 0;
  /* number of bytes available at input */
  this.avail_in = 0;
  /* total number of input bytes read so far */
  this.total_in = 0;
  /* next output byte should be put there */
  this.output = null; // JS specific, because we have no pointers
  this.next_out = 0;
  /* remaining free space at output */
  this.avail_out = 0;
  /* total number of bytes output so far */
  this.total_out = 0;
  /* last error message, NULL if no error */
  this.msg = ''/*Z_NULL*/;
  /* not visible by applications */
  this.state = null;
  /* best guess about the data type: binary or text */
  this.data_type = 2/*Z_UNKNOWN*/;
  /* adler32 value of the uncompressed data */
  this.adler = 0;
}

var zstream = ZStream;

const toString$1 = Object.prototype.toString;

/* Public constants ==========================================================*/
/* ===========================================================================*/

const {
  Z_NO_FLUSH: Z_NO_FLUSH$1, Z_SYNC_FLUSH, Z_FULL_FLUSH, Z_FINISH: Z_FINISH$2,
  Z_OK: Z_OK$2, Z_STREAM_END: Z_STREAM_END$2,
  Z_DEFAULT_COMPRESSION,
  Z_DEFAULT_STRATEGY,
  Z_DEFLATED: Z_DEFLATED$1
} = constants$2;

/* ===========================================================================*/


/**
 * class Deflate
 *
 * Generic JS-style wrapper for zlib calls. If you don't need
 * streaming behaviour - use more simple functions: [[deflate]],
 * [[deflateRaw]] and [[gzip]].
 **/

/* internal
 * Deflate.chunks -> Array
 *
 * Chunks of output data, if [[Deflate#onData]] not overridden.
 **/

/**
 * Deflate.result -> Uint8Array
 *
 * Compressed result, generated by default [[Deflate#onData]]
 * and [[Deflate#onEnd]] handlers. Filled after you push last chunk
 * (call [[Deflate#push]] with `Z_FINISH` / `true` param).
 **/

/**
 * Deflate.err -> Number
 *
 * Error code after deflate finished. 0 (Z_OK) on success.
 * You will not need it in real life, because deflate errors
 * are possible only on wrong options or bad `onData` / `onEnd`
 * custom handlers.
 **/

/**
 * Deflate.msg -> String
 *
 * Error message, if [[Deflate.err]] != 0
 **/


/**
 * new Deflate(options)
 * - options (Object): zlib deflate options.
 *
 * Creates new deflator instance with specified params. Throws exception
 * on bad params. Supported options:
 *
 * - `level`
 * - `windowBits`
 * - `memLevel`
 * - `strategy`
 * - `dictionary`
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Additional options, for internal needs:
 *
 * - `chunkSize` - size of generated data chunks (16K by default)
 * - `raw` (Boolean) - do raw deflate
 * - `gzip` (Boolean) - create gzip wrapper
 * - `header` (Object) - custom header for gzip
 *   - `text` (Boolean) - true if compressed data believed to be text
 *   - `time` (Number) - modification time, unix timestamp
 *   - `os` (Number) - operation system code
 *   - `extra` (Array) - array of bytes with extra data (max 65536)
 *   - `name` (String) - file name (binary string)
 *   - `comment` (String) - comment (binary string)
 *   - `hcrc` (Boolean) - true if header crc should be added
 *
 * ##### Example:
 *
 * ```javascript
 * const pako = require('pako')
 *   , chunk1 = new Uint8Array([1,2,3,4,5,6,7,8,9])
 *   , chunk2 = new Uint8Array([10,11,12,13,14,15,16,17,18,19]);
 *
 * const deflate = new pako.Deflate({ level: 3});
 *
 * deflate.push(chunk1, false);
 * deflate.push(chunk2, true);  // true -> last chunk
 *
 * if (deflate.err) { throw new Error(deflate.err); }
 *
 * console.log(deflate.result);
 * ```
 **/
function Deflate$1(options) {
  this.options = common.assign({
    level: Z_DEFAULT_COMPRESSION,
    method: Z_DEFLATED$1,
    chunkSize: 16384,
    windowBits: 15,
    memLevel: 8,
    strategy: Z_DEFAULT_STRATEGY
  }, options || {});

  let opt = this.options;

  if (opt.raw && (opt.windowBits > 0)) {
    opt.windowBits = -opt.windowBits;
  }

  else if (opt.gzip && (opt.windowBits > 0) && (opt.windowBits < 16)) {
    opt.windowBits += 16;
  }

  this.err    = 0;      // error code, if happens (0 = Z_OK)
  this.msg    = '';     // error message
  this.ended  = false;  // used to avoid multiple onEnd() calls
  this.chunks = [];     // chunks of compressed data

  this.strm = new zstream();
  this.strm.avail_out = 0;

  let status = deflate_1$2.deflateInit2(
    this.strm,
    opt.level,
    opt.method,
    opt.windowBits,
    opt.memLevel,
    opt.strategy
  );

  if (status !== Z_OK$2) {
    throw new Error(messages[status]);
  }

  if (opt.header) {
    deflate_1$2.deflateSetHeader(this.strm, opt.header);
  }

  if (opt.dictionary) {
    let dict;
    // Convert data if needed
    if (typeof opt.dictionary === 'string') {
      // If we need to compress text, change encoding to utf8.
      dict = strings.string2buf(opt.dictionary);
    } else if (toString$1.call(opt.dictionary) === '[object ArrayBuffer]') {
      dict = new Uint8Array(opt.dictionary);
    } else {
      dict = opt.dictionary;
    }

    status = deflate_1$2.deflateSetDictionary(this.strm, dict);

    if (status !== Z_OK$2) {
      throw new Error(messages[status]);
    }

    this._dict_set = true;
  }
}

/**
 * Deflate#push(data[, flush_mode]) -> Boolean
 * - data (Uint8Array|ArrayBuffer|String): input data. Strings will be
 *   converted to utf8 byte sequence.
 * - flush_mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.
 *   See constants. Skipped or `false` means Z_NO_FLUSH, `true` means Z_FINISH.
 *
 * Sends input data to deflate pipe, generating [[Deflate#onData]] calls with
 * new compressed chunks. Returns `true` on success. The last data block must
 * have `flush_mode` Z_FINISH (or `true`). That will flush internal pending
 * buffers and call [[Deflate#onEnd]].
 *
 * On fail call [[Deflate#onEnd]] with error code and return false.
 *
 * ##### Example
 *
 * ```javascript
 * push(chunk, false); // push one of data chunks
 * ...
 * push(chunk, true);  // push last chunk
 * ```
 **/
Deflate$1.prototype.push = function (data, flush_mode) {
  const strm = this.strm;
  const chunkSize = this.options.chunkSize;
  let status, _flush_mode;

  if (this.ended) { return false; }

  if (flush_mode === ~~flush_mode) _flush_mode = flush_mode;
  else _flush_mode = flush_mode === true ? Z_FINISH$2 : Z_NO_FLUSH$1;

  // Convert data if needed
  if (typeof data === 'string') {
    // If we need to compress text, change encoding to utf8.
    strm.input = strings.string2buf(data);
  } else if (toString$1.call(data) === '[object ArrayBuffer]') {
    strm.input = new Uint8Array(data);
  } else {
    strm.input = data;
  }

  strm.next_in = 0;
  strm.avail_in = strm.input.length;

  for (;;) {
    if (strm.avail_out === 0) {
      strm.output = new Uint8Array(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }

    // Make sure avail_out > 6 to avoid repeating markers
    if ((_flush_mode === Z_SYNC_FLUSH || _flush_mode === Z_FULL_FLUSH) && strm.avail_out <= 6) {
      this.onData(strm.output.subarray(0, strm.next_out));
      strm.avail_out = 0;
      continue;
    }

    status = deflate_1$2.deflate(strm, _flush_mode);

    // Ended => flush and finish
    if (status === Z_STREAM_END$2) {
      if (strm.next_out > 0) {
        this.onData(strm.output.subarray(0, strm.next_out));
      }
      status = deflate_1$2.deflateEnd(this.strm);
      this.onEnd(status);
      this.ended = true;
      return status === Z_OK$2;
    }

    // Flush if out buffer full
    if (strm.avail_out === 0) {
      this.onData(strm.output);
      continue;
    }

    // Flush if requested and has data
    if (_flush_mode > 0 && strm.next_out > 0) {
      this.onData(strm.output.subarray(0, strm.next_out));
      strm.avail_out = 0;
      continue;
    }

    if (strm.avail_in === 0) break;
  }

  return true;
};


/**
 * Deflate#onData(chunk) -> Void
 * - chunk (Uint8Array): output data.
 *
 * By default, stores data blocks in `chunks[]` property and glue
 * those in `onEnd`. Override this handler, if you need another behaviour.
 **/
Deflate$1.prototype.onData = function (chunk) {
  this.chunks.push(chunk);
};


/**
 * Deflate#onEnd(status) -> Void
 * - status (Number): deflate status. 0 (Z_OK) on success,
 *   other if not.
 *
 * Called once after you tell deflate that the input stream is
 * complete (Z_FINISH). By default - join collected chunks,
 * free memory and fill `results` / `err` properties.
 **/
Deflate$1.prototype.onEnd = function (status) {
  // On success - join
  if (status === Z_OK$2) {
    this.result = common.flattenChunks(this.chunks);
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};


/**
 * deflate(data[, options]) -> Uint8Array
 * - data (Uint8Array|ArrayBuffer|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * Compress `data` with deflate algorithm and `options`.
 *
 * Supported options are:
 *
 * - level
 * - windowBits
 * - memLevel
 * - strategy
 * - dictionary
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Sugar (options):
 *
 * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
 *   negative windowBits implicitly.
 *
 * ##### Example:
 *
 * ```javascript
 * const pako = require('pako')
 * const data = new Uint8Array([1,2,3,4,5,6,7,8,9]);
 *
 * console.log(pako.deflate(data));
 * ```
 **/
function deflate$1(input, options) {
  const deflator = new Deflate$1(options);

  deflator.push(input, true);

  // That will never happens, if you don't cheat with options :)
  if (deflator.err) { throw deflator.msg || messages[deflator.err]; }

  return deflator.result;
}


/**
 * deflateRaw(data[, options]) -> Uint8Array
 * - data (Uint8Array|ArrayBuffer|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * The same as [[deflate]], but creates raw data, without wrapper
 * (header and adler32 crc).
 **/
function deflateRaw$1(input, options) {
  options = options || {};
  options.raw = true;
  return deflate$1(input, options);
}


/**
 * gzip(data[, options]) -> Uint8Array
 * - data (Uint8Array|ArrayBuffer|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * The same as [[deflate]], but create gzip wrapper instead of
 * deflate one.
 **/
function gzip$1(input, options) {
  options = options || {};
  options.gzip = true;
  return deflate$1(input, options);
}


var Deflate_1$1 = Deflate$1;
var deflate_2 = deflate$1;
var deflateRaw_1$1 = deflateRaw$1;
var gzip_1$1 = gzip$1;
var constants$1 = constants$2;

var deflate_1$1 = {
	Deflate: Deflate_1$1,
	deflate: deflate_2,
	deflateRaw: deflateRaw_1$1,
	gzip: gzip_1$1,
	constants: constants$1
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

// See state defs from inflate.js
const BAD$1 = 16209;       /* got a data error -- remain here until reset */
const TYPE$1 = 16191;      /* i: waiting for type bits, including last-flag bit */

/*
   Decode literal, length, and distance codes and write out the resulting
   literal and match bytes until either not enough input or output is
   available, an end-of-block is encountered, or a data error is encountered.
   When large enough input and output buffers are supplied to inflate(), for
   example, a 16K input buffer and a 64K output buffer, more than 95% of the
   inflate execution time is spent in this routine.

   Entry assumptions:

        state.mode === LEN
        strm.avail_in >= 6
        strm.avail_out >= 258
        start >= strm.avail_out
        state.bits < 8

   On return, state.mode is one of:

        LEN -- ran out of enough output space or enough available input
        TYPE -- reached end of block code, inflate() to interpret next block
        BAD -- error in block data

   Notes:

    - The maximum input bits used by a length/distance pair is 15 bits for the
      length code, 5 bits for the length extra, 15 bits for the distance code,
      and 13 bits for the distance extra.  This totals 48 bits, or six bytes.
      Therefore if strm.avail_in >= 6, then there is enough input to avoid
      checking for available input while decoding.

    - The maximum bytes that a single length/distance pair can output is 258
      bytes, which is the maximum length that can be coded.  inflate_fast()
      requires strm.avail_out >= 258 for each loop to avoid checking for
      output space.
 */
var inffast = function inflate_fast(strm, start) {
  let _in;                    /* local strm.input */
  let last;                   /* have enough input while in < last */
  let _out;                   /* local strm.output */
  let beg;                    /* inflate()'s initial strm.output */
  let end;                    /* while out < end, enough space available */
//#ifdef INFLATE_STRICT
  let dmax;                   /* maximum distance from zlib header */
//#endif
  let wsize;                  /* window size or zero if not using window */
  let whave;                  /* valid bytes in the window */
  let wnext;                  /* window write index */
  // Use `s_window` instead `window`, avoid conflict with instrumentation tools
  let s_window;               /* allocated sliding window, if wsize != 0 */
  let hold;                   /* local strm.hold */
  let bits;                   /* local strm.bits */
  let lcode;                  /* local strm.lencode */
  let dcode;                  /* local strm.distcode */
  let lmask;                  /* mask for first level of length codes */
  let dmask;                  /* mask for first level of distance codes */
  let here;                   /* retrieved table entry */
  let op;                     /* code bits, operation, extra bits, or */
                              /*  window position, window bytes to copy */
  let len;                    /* match length, unused bytes */
  let dist;                   /* match distance */
  let from;                   /* where to copy match from */
  let from_source;


  let input, output; // JS specific, because we have no pointers

  /* copy state to local variables */
  const state = strm.state;
  //here = state.here;
  _in = strm.next_in;
  input = strm.input;
  last = _in + (strm.avail_in - 5);
  _out = strm.next_out;
  output = strm.output;
  beg = _out - (start - strm.avail_out);
  end = _out + (strm.avail_out - 257);
//#ifdef INFLATE_STRICT
  dmax = state.dmax;
//#endif
  wsize = state.wsize;
  whave = state.whave;
  wnext = state.wnext;
  s_window = state.window;
  hold = state.hold;
  bits = state.bits;
  lcode = state.lencode;
  dcode = state.distcode;
  lmask = (1 << state.lenbits) - 1;
  dmask = (1 << state.distbits) - 1;


  /* decode literals and length/distances until end-of-block or not enough
     input data or output space */

  top:
  do {
    if (bits < 15) {
      hold += input[_in++] << bits;
      bits += 8;
      hold += input[_in++] << bits;
      bits += 8;
    }

    here = lcode[hold & lmask];

    dolen:
    for (;;) { // Goto emulation
      op = here >>> 24/*here.bits*/;
      hold >>>= op;
      bits -= op;
      op = (here >>> 16) & 0xff/*here.op*/;
      if (op === 0) {                          /* literal */
        //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
        //        "inflate:         literal '%c'\n" :
        //        "inflate:         literal 0x%02x\n", here.val));
        output[_out++] = here & 0xffff/*here.val*/;
      }
      else if (op & 16) {                     /* length base */
        len = here & 0xffff/*here.val*/;
        op &= 15;                           /* number of extra bits */
        if (op) {
          if (bits < op) {
            hold += input[_in++] << bits;
            bits += 8;
          }
          len += hold & ((1 << op) - 1);
          hold >>>= op;
          bits -= op;
        }
        //Tracevv((stderr, "inflate:         length %u\n", len));
        if (bits < 15) {
          hold += input[_in++] << bits;
          bits += 8;
          hold += input[_in++] << bits;
          bits += 8;
        }
        here = dcode[hold & dmask];

        dodist:
        for (;;) { // goto emulation
          op = here >>> 24/*here.bits*/;
          hold >>>= op;
          bits -= op;
          op = (here >>> 16) & 0xff/*here.op*/;

          if (op & 16) {                      /* distance base */
            dist = here & 0xffff/*here.val*/;
            op &= 15;                       /* number of extra bits */
            if (bits < op) {
              hold += input[_in++] << bits;
              bits += 8;
              if (bits < op) {
                hold += input[_in++] << bits;
                bits += 8;
              }
            }
            dist += hold & ((1 << op) - 1);
//#ifdef INFLATE_STRICT
            if (dist > dmax) {
              strm.msg = 'invalid distance too far back';
              state.mode = BAD$1;
              break top;
            }
//#endif
            hold >>>= op;
            bits -= op;
            //Tracevv((stderr, "inflate:         distance %u\n", dist));
            op = _out - beg;                /* max distance in output */
            if (dist > op) {                /* see if copy from window */
              op = dist - op;               /* distance back in window */
              if (op > whave) {
                if (state.sane) {
                  strm.msg = 'invalid distance too far back';
                  state.mode = BAD$1;
                  break top;
                }

// (!) This block is disabled in zlib defaults,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//                if (len <= op - whave) {
//                  do {
//                    output[_out++] = 0;
//                  } while (--len);
//                  continue top;
//                }
//                len -= op - whave;
//                do {
//                  output[_out++] = 0;
//                } while (--op > whave);
//                if (op === 0) {
//                  from = _out - dist;
//                  do {
//                    output[_out++] = output[from++];
//                  } while (--len);
//                  continue top;
//                }
//#endif
              }
              from = 0; // window index
              from_source = s_window;
              if (wnext === 0) {           /* very common case */
                from += wsize - op;
                if (op < len) {         /* some from window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = _out - dist;  /* rest from output */
                  from_source = output;
                }
              }
              else if (wnext < op) {      /* wrap around window */
                from += wsize + wnext - op;
                op -= wnext;
                if (op < len) {         /* some from end of window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = 0;
                  if (wnext < len) {  /* some from start of window */
                    op = wnext;
                    len -= op;
                    do {
                      output[_out++] = s_window[from++];
                    } while (--op);
                    from = _out - dist;      /* rest from output */
                    from_source = output;
                  }
                }
              }
              else {                      /* contiguous in window */
                from += wnext - op;
                if (op < len) {         /* some from window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = _out - dist;  /* rest from output */
                  from_source = output;
                }
              }
              while (len > 2) {
                output[_out++] = from_source[from++];
                output[_out++] = from_source[from++];
                output[_out++] = from_source[from++];
                len -= 3;
              }
              if (len) {
                output[_out++] = from_source[from++];
                if (len > 1) {
                  output[_out++] = from_source[from++];
                }
              }
            }
            else {
              from = _out - dist;          /* copy direct from output */
              do {                        /* minimum length is three */
                output[_out++] = output[from++];
                output[_out++] = output[from++];
                output[_out++] = output[from++];
                len -= 3;
              } while (len > 2);
              if (len) {
                output[_out++] = output[from++];
                if (len > 1) {
                  output[_out++] = output[from++];
                }
              }
            }
          }
          else if ((op & 64) === 0) {          /* 2nd level distance code */
            here = dcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
            continue dodist;
          }
          else {
            strm.msg = 'invalid distance code';
            state.mode = BAD$1;
            break top;
          }

          break; // need to emulate goto via "continue"
        }
      }
      else if ((op & 64) === 0) {              /* 2nd level length code */
        here = lcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
        continue dolen;
      }
      else if (op & 32) {                     /* end-of-block */
        //Tracevv((stderr, "inflate:         end of block\n"));
        state.mode = TYPE$1;
        break top;
      }
      else {
        strm.msg = 'invalid literal/length code';
        state.mode = BAD$1;
        break top;
      }

      break; // need to emulate goto via "continue"
    }
  } while (_in < last && _out < end);

  /* return unused bytes (on entry, bits < 8, so in won't go too far back) */
  len = bits >> 3;
  _in -= len;
  bits -= len << 3;
  hold &= (1 << bits) - 1;

  /* update state and return */
  strm.next_in = _in;
  strm.next_out = _out;
  strm.avail_in = (_in < last ? 5 + (last - _in) : 5 - (_in - last));
  strm.avail_out = (_out < end ? 257 + (end - _out) : 257 - (_out - end));
  state.hold = hold;
  state.bits = bits;
  return;
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

const MAXBITS = 15;
const ENOUGH_LENS$1 = 852;
const ENOUGH_DISTS$1 = 592;
//const ENOUGH = (ENOUGH_LENS+ENOUGH_DISTS);

const CODES$1 = 0;
const LENS$1 = 1;
const DISTS$1 = 2;

const lbase = new Uint16Array([ /* Length codes 257..285 base */
  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
  35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
]);

const lext = new Uint8Array([ /* Length codes 257..285 extra */
  16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18,
  19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78
]);

const dbase = new Uint16Array([ /* Distance codes 0..29 base */
  1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
  257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
  8193, 12289, 16385, 24577, 0, 0
]);

const dext = new Uint8Array([ /* Distance codes 0..29 extra */
  16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22,
  23, 23, 24, 24, 25, 25, 26, 26, 27, 27,
  28, 28, 29, 29, 64, 64
]);

const inflate_table = (type, lens, lens_index, codes, table, table_index, work, opts) =>
{
  const bits = opts.bits;
      //here = opts.here; /* table entry for duplication */

  let len = 0;               /* a code's length in bits */
  let sym = 0;               /* index of code symbols */
  let min = 0, max = 0;          /* minimum and maximum code lengths */
  let root = 0;              /* number of index bits for root table */
  let curr = 0;              /* number of index bits for current table */
  let drop = 0;              /* code bits to drop for sub-table */
  let left = 0;                   /* number of prefix codes available */
  let used = 0;              /* code entries in table used */
  let huff = 0;              /* Huffman code */
  let incr;              /* for incrementing code, index */
  let fill;              /* index for replicating entries */
  let low;               /* low bits for current root entry */
  let mask;              /* mask for low root bits */
  let next;             /* next available space in table */
  let base = null;     /* base value table to use */
//  let shoextra;    /* extra bits table to use */
  let match;                  /* use base and extra for symbol >= match */
  const count = new Uint16Array(MAXBITS + 1); //[MAXBITS+1];    /* number of codes of each length */
  const offs = new Uint16Array(MAXBITS + 1); //[MAXBITS+1];     /* offsets in table for each length */
  let extra = null;

  let here_bits, here_op, here_val;

  /*
   Process a set of code lengths to create a canonical Huffman code.  The
   code lengths are lens[0..codes-1].  Each length corresponds to the
   symbols 0..codes-1.  The Huffman code is generated by first sorting the
   symbols by length from short to long, and retaining the symbol order
   for codes with equal lengths.  Then the code starts with all zero bits
   for the first code of the shortest length, and the codes are integer
   increments for the same length, and zeros are appended as the length
   increases.  For the deflate format, these bits are stored backwards
   from their more natural integer increment ordering, and so when the
   decoding tables are built in the large loop below, the integer codes
   are incremented backwards.

   This routine assumes, but does not check, that all of the entries in
   lens[] are in the range 0..MAXBITS.  The caller must assure this.
   1..MAXBITS is interpreted as that code length.  zero means that that
   symbol does not occur in this code.

   The codes are sorted by computing a count of codes for each length,
   creating from that a table of starting indices for each length in the
   sorted table, and then entering the symbols in order in the sorted
   table.  The sorted table is work[], with that space being provided by
   the caller.

   The length counts are used for other purposes as well, i.e. finding
   the minimum and maximum length codes, determining if there are any
   codes at all, checking for a valid set of lengths, and looking ahead
   at length counts to determine sub-table sizes when building the
   decoding tables.
   */

  /* accumulate lengths for codes (assumes lens[] all in 0..MAXBITS) */
  for (len = 0; len <= MAXBITS; len++) {
    count[len] = 0;
  }
  for (sym = 0; sym < codes; sym++) {
    count[lens[lens_index + sym]]++;
  }

  /* bound code lengths, force root to be within code lengths */
  root = bits;
  for (max = MAXBITS; max >= 1; max--) {
    if (count[max] !== 0) { break; }
  }
  if (root > max) {
    root = max;
  }
  if (max === 0) {                     /* no symbols to code at all */
    //table.op[opts.table_index] = 64;  //here.op = (var char)64;    /* invalid code marker */
    //table.bits[opts.table_index] = 1;   //here.bits = (var char)1;
    //table.val[opts.table_index++] = 0;   //here.val = (var short)0;
    table[table_index++] = (1 << 24) | (64 << 16) | 0;


    //table.op[opts.table_index] = 64;
    //table.bits[opts.table_index] = 1;
    //table.val[opts.table_index++] = 0;
    table[table_index++] = (1 << 24) | (64 << 16) | 0;

    opts.bits = 1;
    return 0;     /* no symbols, but wait for decoding to report error */
  }
  for (min = 1; min < max; min++) {
    if (count[min] !== 0) { break; }
  }
  if (root < min) {
    root = min;
  }

  /* check for an over-subscribed or incomplete set of lengths */
  left = 1;
  for (len = 1; len <= MAXBITS; len++) {
    left <<= 1;
    left -= count[len];
    if (left < 0) {
      return -1;
    }        /* over-subscribed */
  }
  if (left > 0 && (type === CODES$1 || max !== 1)) {
    return -1;                      /* incomplete set */
  }

  /* generate offsets into symbol table for each length for sorting */
  offs[1] = 0;
  for (len = 1; len < MAXBITS; len++) {
    offs[len + 1] = offs[len] + count[len];
  }

  /* sort symbols by length, by symbol order within each length */
  for (sym = 0; sym < codes; sym++) {
    if (lens[lens_index + sym] !== 0) {
      work[offs[lens[lens_index + sym]]++] = sym;
    }
  }

  /*
   Create and fill in decoding tables.  In this loop, the table being
   filled is at next and has curr index bits.  The code being used is huff
   with length len.  That code is converted to an index by dropping drop
   bits off of the bottom.  For codes where len is less than drop + curr,
   those top drop + curr - len bits are incremented through all values to
   fill the table with replicated entries.

   root is the number of index bits for the root table.  When len exceeds
   root, sub-tables are created pointed to by the root entry with an index
   of the low root bits of huff.  This is saved in low to check for when a
   new sub-table should be started.  drop is zero when the root table is
   being filled, and drop is root when sub-tables are being filled.

   When a new sub-table is needed, it is necessary to look ahead in the
   code lengths to determine what size sub-table is needed.  The length
   counts are used for this, and so count[] is decremented as codes are
   entered in the tables.

   used keeps track of how many table entries have been allocated from the
   provided *table space.  It is checked for LENS and DIST tables against
   the constants ENOUGH_LENS and ENOUGH_DISTS to guard against changes in
   the initial root table size constants.  See the comments in inftrees.h
   for more information.

   sym increments through all symbols, and the loop terminates when
   all codes of length max, i.e. all codes, have been processed.  This
   routine permits incomplete codes, so another loop after this one fills
   in the rest of the decoding tables with invalid code markers.
   */

  /* set up for code type */
  // poor man optimization - use if-else instead of switch,
  // to avoid deopts in old v8
  if (type === CODES$1) {
    base = extra = work;    /* dummy value--not used */
    match = 20;

  } else if (type === LENS$1) {
    base = lbase;
    extra = lext;
    match = 257;

  } else {                    /* DISTS */
    base = dbase;
    extra = dext;
    match = 0;
  }

  /* initialize opts for loop */
  huff = 0;                   /* starting code */
  sym = 0;                    /* starting code symbol */
  len = min;                  /* starting code length */
  next = table_index;              /* current table to fill in */
  curr = root;                /* current table index bits */
  drop = 0;                   /* current bits to drop from code for index */
  low = -1;                   /* trigger new sub-table when len > root */
  used = 1 << root;          /* use root table entries */
  mask = used - 1;            /* mask for comparing low */

  /* check available table space */
  if ((type === LENS$1 && used > ENOUGH_LENS$1) ||
    (type === DISTS$1 && used > ENOUGH_DISTS$1)) {
    return 1;
  }

  /* process all codes and make table entries */
  for (;;) {
    /* create table entry */
    here_bits = len - drop;
    if (work[sym] + 1 < match) {
      here_op = 0;
      here_val = work[sym];
    }
    else if (work[sym] >= match) {
      here_op = extra[work[sym] - match];
      here_val = base[work[sym] - match];
    }
    else {
      here_op = 32 + 64;         /* end of block */
      here_val = 0;
    }

    /* replicate for those indices with low len bits equal to huff */
    incr = 1 << (len - drop);
    fill = 1 << curr;
    min = fill;                 /* save offset to next table */
    do {
      fill -= incr;
      table[next + (huff >> drop) + fill] = (here_bits << 24) | (here_op << 16) | here_val |0;
    } while (fill !== 0);

    /* backwards increment the len-bit code huff */
    incr = 1 << (len - 1);
    while (huff & incr) {
      incr >>= 1;
    }
    if (incr !== 0) {
      huff &= incr - 1;
      huff += incr;
    } else {
      huff = 0;
    }

    /* go to next symbol, update count, len */
    sym++;
    if (--count[len] === 0) {
      if (len === max) { break; }
      len = lens[lens_index + work[sym]];
    }

    /* create new sub-table if needed */
    if (len > root && (huff & mask) !== low) {
      /* if first time, transition to sub-tables */
      if (drop === 0) {
        drop = root;
      }

      /* increment past last table */
      next += min;            /* here min is 1 << curr */

      /* determine length of next table */
      curr = len - drop;
      left = 1 << curr;
      while (curr + drop < max) {
        left -= count[curr + drop];
        if (left <= 0) { break; }
        curr++;
        left <<= 1;
      }

      /* check for enough space */
      used += 1 << curr;
      if ((type === LENS$1 && used > ENOUGH_LENS$1) ||
        (type === DISTS$1 && used > ENOUGH_DISTS$1)) {
        return 1;
      }

      /* point entry in root table to sub-table */
      low = huff & mask;
      /*table.op[low] = curr;
      table.bits[low] = root;
      table.val[low] = next - opts.table_index;*/
      table[low] = (root << 24) | (curr << 16) | (next - table_index) |0;
    }
  }

  /* fill in remaining table entry if code is incomplete (guaranteed to have
   at most one remaining entry, since if the code is incomplete, the
   maximum code length that was allowed to get this far is one bit) */
  if (huff !== 0) {
    //table.op[next + huff] = 64;            /* invalid code marker */
    //table.bits[next + huff] = len - drop;
    //table.val[next + huff] = 0;
    table[next + huff] = ((len - drop) << 24) | (64 << 16) |0;
  }

  /* set return parameters */
  //opts.table_index += used;
  opts.bits = root;
  return 0;
};


var inftrees = inflate_table;

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.






const CODES = 0;
const LENS = 1;
const DISTS = 2;

/* Public constants ==========================================================*/
/* ===========================================================================*/

const {
  Z_FINISH: Z_FINISH$1, Z_BLOCK, Z_TREES,
  Z_OK: Z_OK$1, Z_STREAM_END: Z_STREAM_END$1, Z_NEED_DICT: Z_NEED_DICT$1, Z_STREAM_ERROR: Z_STREAM_ERROR$1, Z_DATA_ERROR: Z_DATA_ERROR$1, Z_MEM_ERROR: Z_MEM_ERROR$1, Z_BUF_ERROR,
  Z_DEFLATED
} = constants$2;


/* STATES ====================================================================*/
/* ===========================================================================*/


const    HEAD = 16180;       /* i: waiting for magic header */
const    FLAGS = 16181;      /* i: waiting for method and flags (gzip) */
const    TIME = 16182;       /* i: waiting for modification time (gzip) */
const    OS = 16183;         /* i: waiting for extra flags and operating system (gzip) */
const    EXLEN = 16184;      /* i: waiting for extra length (gzip) */
const    EXTRA = 16185;      /* i: waiting for extra bytes (gzip) */
const    NAME = 16186;       /* i: waiting for end of file name (gzip) */
const    COMMENT = 16187;    /* i: waiting for end of comment (gzip) */
const    HCRC = 16188;       /* i: waiting for header crc (gzip) */
const    DICTID = 16189;    /* i: waiting for dictionary check value */
const    DICT = 16190;      /* waiting for inflateSetDictionary() call */
const        TYPE = 16191;      /* i: waiting for type bits, including last-flag bit */
const        TYPEDO = 16192;    /* i: same, but skip check to exit inflate on new block */
const        STORED = 16193;    /* i: waiting for stored size (length and complement) */
const        COPY_ = 16194;     /* i/o: same as COPY below, but only first time in */
const        COPY = 16195;      /* i/o: waiting for input or output to copy stored block */
const        TABLE = 16196;     /* i: waiting for dynamic block table lengths */
const        LENLENS = 16197;   /* i: waiting for code length code lengths */
const        CODELENS = 16198;  /* i: waiting for length/lit and distance code lengths */
const            LEN_ = 16199;      /* i: same as LEN below, but only first time in */
const            LEN = 16200;       /* i: waiting for length/lit/eob code */
const            LENEXT = 16201;    /* i: waiting for length extra bits */
const            DIST = 16202;      /* i: waiting for distance code */
const            DISTEXT = 16203;   /* i: waiting for distance extra bits */
const            MATCH = 16204;     /* o: waiting for output space to copy string */
const            LIT = 16205;       /* o: waiting for output space to write literal */
const    CHECK = 16206;     /* i: waiting for 32-bit check value */
const    LENGTH = 16207;    /* i: waiting for 32-bit length (gzip) */
const    DONE = 16208;      /* finished check, done -- remain here until reset */
const    BAD = 16209;       /* got a data error -- remain here until reset */
const    MEM = 16210;       /* got an inflate() memory error -- remain here until reset */
const    SYNC = 16211;      /* looking for synchronization bytes to restart inflate() */

/* ===========================================================================*/



const ENOUGH_LENS = 852;
const ENOUGH_DISTS = 592;
//const ENOUGH =  (ENOUGH_LENS+ENOUGH_DISTS);

const MAX_WBITS = 15;
/* 32K LZ77 window */
const DEF_WBITS = MAX_WBITS;


const zswap32 = (q) => {

  return  (((q >>> 24) & 0xff) +
          ((q >>> 8) & 0xff00) +
          ((q & 0xff00) << 8) +
          ((q & 0xff) << 24));
};


function InflateState() {
  this.strm = null;           /* pointer back to this zlib stream */
  this.mode = 0;              /* current inflate mode */
  this.last = false;          /* true if processing last block */
  this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip,
                                 bit 2 true to validate check value */
  this.havedict = false;      /* true if dictionary provided */
  this.flags = 0;             /* gzip header method and flags (0 if zlib), or
                                 -1 if raw or no header yet */
  this.dmax = 0;              /* zlib header max distance (INFLATE_STRICT) */
  this.check = 0;             /* protected copy of check value */
  this.total = 0;             /* protected copy of output count */
  // TODO: may be {}
  this.head = null;           /* where to save gzip header information */

  /* sliding window */
  this.wbits = 0;             /* log base 2 of requested window size */
  this.wsize = 0;             /* window size or zero if not using window */
  this.whave = 0;             /* valid bytes in the window */
  this.wnext = 0;             /* window write index */
  this.window = null;         /* allocated sliding window, if needed */

  /* bit accumulator */
  this.hold = 0;              /* input bit accumulator */
  this.bits = 0;              /* number of bits in "in" */

  /* for string and stored block copying */
  this.length = 0;            /* literal or length of data to copy */
  this.offset = 0;            /* distance back to copy string from */

  /* for table and code decoding */
  this.extra = 0;             /* extra bits needed */

  /* fixed and dynamic code tables */
  this.lencode = null;          /* starting table for length/literal codes */
  this.distcode = null;         /* starting table for distance codes */
  this.lenbits = 0;           /* index bits for lencode */
  this.distbits = 0;          /* index bits for distcode */

  /* dynamic table building */
  this.ncode = 0;             /* number of code length code lengths */
  this.nlen = 0;              /* number of length code lengths */
  this.ndist = 0;             /* number of distance code lengths */
  this.have = 0;              /* number of code lengths in lens[] */
  this.next = null;              /* next available space in codes[] */

  this.lens = new Uint16Array(320); /* temporary storage for code lengths */
  this.work = new Uint16Array(288); /* work area for code table building */

  /*
   because we don't have pointers in js, we use lencode and distcode directly
   as buffers so we don't need codes
  */
  //this.codes = new Int32Array(ENOUGH);       /* space for code tables */
  this.lendyn = null;              /* dynamic table for length/literal codes (JS specific) */
  this.distdyn = null;             /* dynamic table for distance codes (JS specific) */
  this.sane = 0;                   /* if false, allow invalid distance too far */
  this.back = 0;                   /* bits back of last unprocessed length/lit */
  this.was = 0;                    /* initial length of match */
}


const inflateStateCheck = (strm) => {

  if (!strm) {
    return 1;
  }
  const state = strm.state;
  if (!state || state.strm !== strm ||
    state.mode < HEAD || state.mode > SYNC) {
    return 1;
  }
  return 0;
};


const inflateResetKeep = (strm) => {

  if (inflateStateCheck(strm)) { return Z_STREAM_ERROR$1; }
  const state = strm.state;
  strm.total_in = strm.total_out = state.total = 0;
  strm.msg = ''; /*Z_NULL*/
  if (state.wrap) {       /* to support ill-conceived Java test suite */
    strm.adler = state.wrap & 1;
  }
  state.mode = HEAD;
  state.last = 0;
  state.havedict = 0;
  state.flags = -1;
  state.dmax = 32768;
  state.head = null/*Z_NULL*/;
  state.hold = 0;
  state.bits = 0;
  //state.lencode = state.distcode = state.next = state.codes;
  state.lencode = state.lendyn = new Int32Array(ENOUGH_LENS);
  state.distcode = state.distdyn = new Int32Array(ENOUGH_DISTS);

  state.sane = 1;
  state.back = -1;
  //Tracev((stderr, "inflate: reset\n"));
  return Z_OK$1;
};


const inflateReset = (strm) => {

  if (inflateStateCheck(strm)) { return Z_STREAM_ERROR$1; }
  const state = strm.state;
  state.wsize = 0;
  state.whave = 0;
  state.wnext = 0;
  return inflateResetKeep(strm);

};


const inflateReset2 = (strm, windowBits) => {
  let wrap;

  /* get the state */
  if (inflateStateCheck(strm)) { return Z_STREAM_ERROR$1; }
  const state = strm.state;

  /* extract wrap request from windowBits parameter */
  if (windowBits < 0) {
    wrap = 0;
    windowBits = -windowBits;
  }
  else {
    wrap = (windowBits >> 4) + 5;
    if (windowBits < 48) {
      windowBits &= 15;
    }
  }

  /* set number of window bits, free window if different */
  if (windowBits && (windowBits < 8 || windowBits > 15)) {
    return Z_STREAM_ERROR$1;
  }
  if (state.window !== null && state.wbits !== windowBits) {
    state.window = null;
  }

  /* update state and reset the rest of it */
  state.wrap = wrap;
  state.wbits = windowBits;
  return inflateReset(strm);
};


const inflateInit2 = (strm, windowBits) => {

  if (!strm) { return Z_STREAM_ERROR$1; }
  //strm.msg = Z_NULL;                 /* in case we return an error */

  const state = new InflateState();

  //if (state === Z_NULL) return Z_MEM_ERROR;
  //Tracev((stderr, "inflate: allocated\n"));
  strm.state = state;
  state.strm = strm;
  state.window = null/*Z_NULL*/;
  state.mode = HEAD;     /* to pass state test in inflateReset2() */
  const ret = inflateReset2(strm, windowBits);
  if (ret !== Z_OK$1) {
    strm.state = null/*Z_NULL*/;
  }
  return ret;
};


const inflateInit = (strm) => {

  return inflateInit2(strm, DEF_WBITS);
};


/*
 Return state with length and distance decoding tables and index sizes set to
 fixed code decoding.  Normally this returns fixed tables from inffixed.h.
 If BUILDFIXED is defined, then instead this routine builds the tables the
 first time it's called, and returns those tables the first time and
 thereafter.  This reduces the size of the code by about 2K bytes, in
 exchange for a little execution time.  However, BUILDFIXED should not be
 used for threaded applications, since the rewriting of the tables and virgin
 may not be thread-safe.
 */
let virgin = true;

let lenfix, distfix; // We have no pointers in JS, so keep tables separate


const fixedtables = (state) => {

  /* build fixed huffman tables if first call (may not be thread safe) */
  if (virgin) {
    lenfix = new Int32Array(512);
    distfix = new Int32Array(32);

    /* literal/length table */
    let sym = 0;
    while (sym < 144) { state.lens[sym++] = 8; }
    while (sym < 256) { state.lens[sym++] = 9; }
    while (sym < 280) { state.lens[sym++] = 7; }
    while (sym < 288) { state.lens[sym++] = 8; }

    inftrees(LENS,  state.lens, 0, 288, lenfix,   0, state.work, { bits: 9 });

    /* distance table */
    sym = 0;
    while (sym < 32) { state.lens[sym++] = 5; }

    inftrees(DISTS, state.lens, 0, 32,   distfix, 0, state.work, { bits: 5 });

    /* do this just once */
    virgin = false;
  }

  state.lencode = lenfix;
  state.lenbits = 9;
  state.distcode = distfix;
  state.distbits = 5;
};


/*
 Update the window with the last wsize (normally 32K) bytes written before
 returning.  If window does not exist yet, create it.  This is only called
 when a window is already in use, or when output has been written during this
 inflate call, but the end of the deflate stream has not been reached yet.
 It is also called to create a window for dictionary data when a dictionary
 is loaded.

 Providing output buffers larger than 32K to inflate() should provide a speed
 advantage, since only the last 32K of output is copied to the sliding window
 upon return from inflate(), and since all distances after the first 32K of
 output will fall in the output data, making match copies simpler and faster.
 The advantage may be dependent on the size of the processor's data caches.
 */
const updatewindow = (strm, src, end, copy) => {

  let dist;
  const state = strm.state;

  /* if it hasn't been done already, allocate space for the window */
  if (state.window === null) {
    state.wsize = 1 << state.wbits;
    state.wnext = 0;
    state.whave = 0;

    state.window = new Uint8Array(state.wsize);
  }

  /* copy state->wsize or less output bytes into the circular window */
  if (copy >= state.wsize) {
    state.window.set(src.subarray(end - state.wsize, end), 0);
    state.wnext = 0;
    state.whave = state.wsize;
  }
  else {
    dist = state.wsize - state.wnext;
    if (dist > copy) {
      dist = copy;
    }
    //zmemcpy(state->window + state->wnext, end - copy, dist);
    state.window.set(src.subarray(end - copy, end - copy + dist), state.wnext);
    copy -= dist;
    if (copy) {
      //zmemcpy(state->window, end - copy, copy);
      state.window.set(src.subarray(end - copy, end), 0);
      state.wnext = copy;
      state.whave = state.wsize;
    }
    else {
      state.wnext += dist;
      if (state.wnext === state.wsize) { state.wnext = 0; }
      if (state.whave < state.wsize) { state.whave += dist; }
    }
  }
  return 0;
};


const inflate$2 = (strm, flush) => {

  let state;
  let input, output;          // input/output buffers
  let next;                   /* next input INDEX */
  let put;                    /* next output INDEX */
  let have, left;             /* available input and output */
  let hold;                   /* bit buffer */
  let bits;                   /* bits in bit buffer */
  let _in, _out;              /* save starting available input and output */
  let copy;                   /* number of stored or match bytes to copy */
  let from;                   /* where to copy match bytes from */
  let from_source;
  let here = 0;               /* current decoding table entry */
  let here_bits, here_op, here_val; // paked "here" denormalized (JS specific)
  //let last;                   /* parent table entry */
  let last_bits, last_op, last_val; // paked "last" denormalized (JS specific)
  let len;                    /* length to copy for repeats, bits to drop */
  let ret;                    /* return code */
  const hbuf = new Uint8Array(4);    /* buffer for gzip header crc calculation */
  let opts;

  let n; // temporary variable for NEED_BITS

  const order = /* permutation of code lengths */
    new Uint8Array([ 16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15 ]);


  if (inflateStateCheck(strm) || !strm.output ||
      (!strm.input && strm.avail_in !== 0)) {
    return Z_STREAM_ERROR$1;
  }

  state = strm.state;
  if (state.mode === TYPE) { state.mode = TYPEDO; }    /* skip check */


  //--- LOAD() ---
  put = strm.next_out;
  output = strm.output;
  left = strm.avail_out;
  next = strm.next_in;
  input = strm.input;
  have = strm.avail_in;
  hold = state.hold;
  bits = state.bits;
  //---

  _in = have;
  _out = left;
  ret = Z_OK$1;

  inf_leave: // goto emulation
  for (;;) {
    switch (state.mode) {
      case HEAD:
        if (state.wrap === 0) {
          state.mode = TYPEDO;
          break;
        }
        //=== NEEDBITS(16);
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if ((state.wrap & 2) && hold === 0x8b1f) {  /* gzip header */
          if (state.wbits === 0) {
            state.wbits = 15;
          }
          state.check = 0/*crc32(0L, Z_NULL, 0)*/;
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32_1(state.check, hbuf, 2, 0);
          //===//

          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          state.mode = FLAGS;
          break;
        }
        if (state.head) {
          state.head.done = false;
        }
        if (!(state.wrap & 1) ||   /* check if zlib header allowed */
          (((hold & 0xff)/*BITS(8)*/ << 8) + (hold >> 8)) % 31) {
          strm.msg = 'incorrect header check';
          state.mode = BAD;
          break;
        }
        if ((hold & 0x0f)/*BITS(4)*/ !== Z_DEFLATED) {
          strm.msg = 'unknown compression method';
          state.mode = BAD;
          break;
        }
        //--- DROPBITS(4) ---//
        hold >>>= 4;
        bits -= 4;
        //---//
        len = (hold & 0x0f)/*BITS(4)*/ + 8;
        if (state.wbits === 0) {
          state.wbits = len;
        }
        if (len > 15 || len > state.wbits) {
          strm.msg = 'invalid window size';
          state.mode = BAD;
          break;
        }

        // !!! pako patch. Force use `options.windowBits` if passed.
        // Required to always use max window size by default.
        state.dmax = 1 << state.wbits;
        //state.dmax = 1 << len;

        state.flags = 0;               /* indicate zlib header */
        //Tracev((stderr, "inflate:   zlib header ok\n"));
        strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
        state.mode = hold & 0x200 ? DICTID : TYPE;
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        break;
      case FLAGS:
        //=== NEEDBITS(16); */
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.flags = hold;
        if ((state.flags & 0xff) !== Z_DEFLATED) {
          strm.msg = 'unknown compression method';
          state.mode = BAD;
          break;
        }
        if (state.flags & 0xe000) {
          strm.msg = 'unknown header flags set';
          state.mode = BAD;
          break;
        }
        if (state.head) {
          state.head.text = ((hold >> 8) & 1);
        }
        if ((state.flags & 0x0200) && (state.wrap & 4)) {
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32_1(state.check, hbuf, 2, 0);
          //===//
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = TIME;
        /* falls through */
      case TIME:
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if (state.head) {
          state.head.time = hold;
        }
        if ((state.flags & 0x0200) && (state.wrap & 4)) {
          //=== CRC4(state.check, hold)
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          hbuf[2] = (hold >>> 16) & 0xff;
          hbuf[3] = (hold >>> 24) & 0xff;
          state.check = crc32_1(state.check, hbuf, 4, 0);
          //===
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = OS;
        /* falls through */
      case OS:
        //=== NEEDBITS(16); */
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if (state.head) {
          state.head.xflags = (hold & 0xff);
          state.head.os = (hold >> 8);
        }
        if ((state.flags & 0x0200) && (state.wrap & 4)) {
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32_1(state.check, hbuf, 2, 0);
          //===//
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = EXLEN;
        /* falls through */
      case EXLEN:
        if (state.flags & 0x0400) {
          //=== NEEDBITS(16); */
          while (bits < 16) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.length = hold;
          if (state.head) {
            state.head.extra_len = hold;
          }
          if ((state.flags & 0x0200) && (state.wrap & 4)) {
            //=== CRC2(state.check, hold);
            hbuf[0] = hold & 0xff;
            hbuf[1] = (hold >>> 8) & 0xff;
            state.check = crc32_1(state.check, hbuf, 2, 0);
            //===//
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
        }
        else if (state.head) {
          state.head.extra = null/*Z_NULL*/;
        }
        state.mode = EXTRA;
        /* falls through */
      case EXTRA:
        if (state.flags & 0x0400) {
          copy = state.length;
          if (copy > have) { copy = have; }
          if (copy) {
            if (state.head) {
              len = state.head.extra_len - state.length;
              if (!state.head.extra) {
                // Use untyped array for more convenient processing later
                state.head.extra = new Uint8Array(state.head.extra_len);
              }
              state.head.extra.set(
                input.subarray(
                  next,
                  // extra field is limited to 65536 bytes
                  // - no need for additional size check
                  next + copy
                ),
                /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                len
              );
              //zmemcpy(state.head.extra + len, next,
              //        len + copy > state.head.extra_max ?
              //        state.head.extra_max - len : copy);
            }
            if ((state.flags & 0x0200) && (state.wrap & 4)) {
              state.check = crc32_1(state.check, input, copy, next);
            }
            have -= copy;
            next += copy;
            state.length -= copy;
          }
          if (state.length) { break inf_leave; }
        }
        state.length = 0;
        state.mode = NAME;
        /* falls through */
      case NAME:
        if (state.flags & 0x0800) {
          if (have === 0) { break inf_leave; }
          copy = 0;
          do {
            // TODO: 2 or 1 bytes?
            len = input[next + copy++];
            /* use constant limit because in js we should not preallocate memory */
            if (state.head && len &&
                (state.length < 65536 /*state.head.name_max*/)) {
              state.head.name += String.fromCharCode(len);
            }
          } while (len && copy < have);

          if ((state.flags & 0x0200) && (state.wrap & 4)) {
            state.check = crc32_1(state.check, input, copy, next);
          }
          have -= copy;
          next += copy;
          if (len) { break inf_leave; }
        }
        else if (state.head) {
          state.head.name = null;
        }
        state.length = 0;
        state.mode = COMMENT;
        /* falls through */
      case COMMENT:
        if (state.flags & 0x1000) {
          if (have === 0) { break inf_leave; }
          copy = 0;
          do {
            len = input[next + copy++];
            /* use constant limit because in js we should not preallocate memory */
            if (state.head && len &&
                (state.length < 65536 /*state.head.comm_max*/)) {
              state.head.comment += String.fromCharCode(len);
            }
          } while (len && copy < have);
          if ((state.flags & 0x0200) && (state.wrap & 4)) {
            state.check = crc32_1(state.check, input, copy, next);
          }
          have -= copy;
          next += copy;
          if (len) { break inf_leave; }
        }
        else if (state.head) {
          state.head.comment = null;
        }
        state.mode = HCRC;
        /* falls through */
      case HCRC:
        if (state.flags & 0x0200) {
          //=== NEEDBITS(16); */
          while (bits < 16) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          if ((state.wrap & 4) && hold !== (state.check & 0xffff)) {
            strm.msg = 'header crc mismatch';
            state.mode = BAD;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
        }
        if (state.head) {
          state.head.hcrc = ((state.flags >> 9) & 1);
          state.head.done = true;
        }
        strm.adler = state.check = 0;
        state.mode = TYPE;
        break;
      case DICTID:
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        strm.adler = state.check = zswap32(hold);
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = DICT;
        /* falls through */
      case DICT:
        if (state.havedict === 0) {
          //--- RESTORE() ---
          strm.next_out = put;
          strm.avail_out = left;
          strm.next_in = next;
          strm.avail_in = have;
          state.hold = hold;
          state.bits = bits;
          //---
          return Z_NEED_DICT$1;
        }
        strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
        state.mode = TYPE;
        /* falls through */
      case TYPE:
        if (flush === Z_BLOCK || flush === Z_TREES) { break inf_leave; }
        /* falls through */
      case TYPEDO:
        if (state.last) {
          //--- BYTEBITS() ---//
          hold >>>= bits & 7;
          bits -= bits & 7;
          //---//
          state.mode = CHECK;
          break;
        }
        //=== NEEDBITS(3); */
        while (bits < 3) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.last = (hold & 0x01)/*BITS(1)*/;
        //--- DROPBITS(1) ---//
        hold >>>= 1;
        bits -= 1;
        //---//

        switch ((hold & 0x03)/*BITS(2)*/) {
          case 0:                             /* stored block */
            //Tracev((stderr, "inflate:     stored block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = STORED;
            break;
          case 1:                             /* fixed block */
            fixedtables(state);
            //Tracev((stderr, "inflate:     fixed codes block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = LEN_;             /* decode codes */
            if (flush === Z_TREES) {
              //--- DROPBITS(2) ---//
              hold >>>= 2;
              bits -= 2;
              //---//
              break inf_leave;
            }
            break;
          case 2:                             /* dynamic block */
            //Tracev((stderr, "inflate:     dynamic codes block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = TABLE;
            break;
          case 3:
            strm.msg = 'invalid block type';
            state.mode = BAD;
        }
        //--- DROPBITS(2) ---//
        hold >>>= 2;
        bits -= 2;
        //---//
        break;
      case STORED:
        //--- BYTEBITS() ---// /* go to byte boundary */
        hold >>>= bits & 7;
        bits -= bits & 7;
        //---//
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if ((hold & 0xffff) !== ((hold >>> 16) ^ 0xffff)) {
          strm.msg = 'invalid stored block lengths';
          state.mode = BAD;
          break;
        }
        state.length = hold & 0xffff;
        //Tracev((stderr, "inflate:       stored length %u\n",
        //        state.length));
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = COPY_;
        if (flush === Z_TREES) { break inf_leave; }
        /* falls through */
      case COPY_:
        state.mode = COPY;
        /* falls through */
      case COPY:
        copy = state.length;
        if (copy) {
          if (copy > have) { copy = have; }
          if (copy > left) { copy = left; }
          if (copy === 0) { break inf_leave; }
          //--- zmemcpy(put, next, copy); ---
          output.set(input.subarray(next, next + copy), put);
          //---//
          have -= copy;
          next += copy;
          left -= copy;
          put += copy;
          state.length -= copy;
          break;
        }
        //Tracev((stderr, "inflate:       stored end\n"));
        state.mode = TYPE;
        break;
      case TABLE:
        //=== NEEDBITS(14); */
        while (bits < 14) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.nlen = (hold & 0x1f)/*BITS(5)*/ + 257;
        //--- DROPBITS(5) ---//
        hold >>>= 5;
        bits -= 5;
        //---//
        state.ndist = (hold & 0x1f)/*BITS(5)*/ + 1;
        //--- DROPBITS(5) ---//
        hold >>>= 5;
        bits -= 5;
        //---//
        state.ncode = (hold & 0x0f)/*BITS(4)*/ + 4;
        //--- DROPBITS(4) ---//
        hold >>>= 4;
        bits -= 4;
        //---//
//#ifndef PKZIP_BUG_WORKAROUND
        if (state.nlen > 286 || state.ndist > 30) {
          strm.msg = 'too many length or distance symbols';
          state.mode = BAD;
          break;
        }
//#endif
        //Tracev((stderr, "inflate:       table sizes ok\n"));
        state.have = 0;
        state.mode = LENLENS;
        /* falls through */
      case LENLENS:
        while (state.have < state.ncode) {
          //=== NEEDBITS(3);
          while (bits < 3) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.lens[order[state.have++]] = (hold & 0x07);//BITS(3);
          //--- DROPBITS(3) ---//
          hold >>>= 3;
          bits -= 3;
          //---//
        }
        while (state.have < 19) {
          state.lens[order[state.have++]] = 0;
        }
        // We have separate tables & no pointers. 2 commented lines below not needed.
        //state.next = state.codes;
        //state.lencode = state.next;
        // Switch to use dynamic table
        state.lencode = state.lendyn;
        state.lenbits = 7;

        opts = { bits: state.lenbits };
        ret = inftrees(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
        state.lenbits = opts.bits;

        if (ret) {
          strm.msg = 'invalid code lengths set';
          state.mode = BAD;
          break;
        }
        //Tracev((stderr, "inflate:       code lengths ok\n"));
        state.have = 0;
        state.mode = CODELENS;
        /* falls through */
      case CODELENS:
        while (state.have < state.nlen + state.ndist) {
          for (;;) {
            here = state.lencode[hold & ((1 << state.lenbits) - 1)];/*BITS(state.lenbits)*/
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if ((here_bits) <= bits) { break; }
            //--- PULLBYTE() ---//
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          if (here_val < 16) {
            //--- DROPBITS(here.bits) ---//
            hold >>>= here_bits;
            bits -= here_bits;
            //---//
            state.lens[state.have++] = here_val;
          }
          else {
            if (here_val === 16) {
              //=== NEEDBITS(here.bits + 2);
              n = here_bits + 2;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              if (state.have === 0) {
                strm.msg = 'invalid bit length repeat';
                state.mode = BAD;
                break;
              }
              len = state.lens[state.have - 1];
              copy = 3 + (hold & 0x03);//BITS(2);
              //--- DROPBITS(2) ---//
              hold >>>= 2;
              bits -= 2;
              //---//
            }
            else if (here_val === 17) {
              //=== NEEDBITS(here.bits + 3);
              n = here_bits + 3;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              len = 0;
              copy = 3 + (hold & 0x07);//BITS(3);
              //--- DROPBITS(3) ---//
              hold >>>= 3;
              bits -= 3;
              //---//
            }
            else {
              //=== NEEDBITS(here.bits + 7);
              n = here_bits + 7;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              len = 0;
              copy = 11 + (hold & 0x7f);//BITS(7);
              //--- DROPBITS(7) ---//
              hold >>>= 7;
              bits -= 7;
              //---//
            }
            if (state.have + copy > state.nlen + state.ndist) {
              strm.msg = 'invalid bit length repeat';
              state.mode = BAD;
              break;
            }
            while (copy--) {
              state.lens[state.have++] = len;
            }
          }
        }

        /* handle error breaks in while */
        if (state.mode === BAD) { break; }

        /* check for end-of-block code (better have one) */
        if (state.lens[256] === 0) {
          strm.msg = 'invalid code -- missing end-of-block';
          state.mode = BAD;
          break;
        }

        /* build code tables -- note: do not change the lenbits or distbits
           values here (9 and 6) without reading the comments in inftrees.h
           concerning the ENOUGH constants, which depend on those values */
        state.lenbits = 9;

        opts = { bits: state.lenbits };
        ret = inftrees(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
        // We have separate tables & no pointers. 2 commented lines below not needed.
        // state.next_index = opts.table_index;
        state.lenbits = opts.bits;
        // state.lencode = state.next;

        if (ret) {
          strm.msg = 'invalid literal/lengths set';
          state.mode = BAD;
          break;
        }

        state.distbits = 6;
        //state.distcode.copy(state.codes);
        // Switch to use dynamic table
        state.distcode = state.distdyn;
        opts = { bits: state.distbits };
        ret = inftrees(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
        // We have separate tables & no pointers. 2 commented lines below not needed.
        // state.next_index = opts.table_index;
        state.distbits = opts.bits;
        // state.distcode = state.next;

        if (ret) {
          strm.msg = 'invalid distances set';
          state.mode = BAD;
          break;
        }
        //Tracev((stderr, 'inflate:       codes ok\n'));
        state.mode = LEN_;
        if (flush === Z_TREES) { break inf_leave; }
        /* falls through */
      case LEN_:
        state.mode = LEN;
        /* falls through */
      case LEN:
        if (have >= 6 && left >= 258) {
          //--- RESTORE() ---
          strm.next_out = put;
          strm.avail_out = left;
          strm.next_in = next;
          strm.avail_in = have;
          state.hold = hold;
          state.bits = bits;
          //---
          inffast(strm, _out);
          //--- LOAD() ---
          put = strm.next_out;
          output = strm.output;
          left = strm.avail_out;
          next = strm.next_in;
          input = strm.input;
          have = strm.avail_in;
          hold = state.hold;
          bits = state.bits;
          //---

          if (state.mode === TYPE) {
            state.back = -1;
          }
          break;
        }
        state.back = 0;
        for (;;) {
          here = state.lencode[hold & ((1 << state.lenbits) - 1)];  /*BITS(state.lenbits)*/
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if (here_bits <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        if (here_op && (here_op & 0xf0) === 0) {
          last_bits = here_bits;
          last_op = here_op;
          last_val = here_val;
          for (;;) {
            here = state.lencode[last_val +
                    ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if ((last_bits + here_bits) <= bits) { break; }
            //--- PULLBYTE() ---//
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          //--- DROPBITS(last.bits) ---//
          hold >>>= last_bits;
          bits -= last_bits;
          //---//
          state.back += last_bits;
        }
        //--- DROPBITS(here.bits) ---//
        hold >>>= here_bits;
        bits -= here_bits;
        //---//
        state.back += here_bits;
        state.length = here_val;
        if (here_op === 0) {
          //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
          //        "inflate:         literal '%c'\n" :
          //        "inflate:         literal 0x%02x\n", here.val));
          state.mode = LIT;
          break;
        }
        if (here_op & 32) {
          //Tracevv((stderr, "inflate:         end of block\n"));
          state.back = -1;
          state.mode = TYPE;
          break;
        }
        if (here_op & 64) {
          strm.msg = 'invalid literal/length code';
          state.mode = BAD;
          break;
        }
        state.extra = here_op & 15;
        state.mode = LENEXT;
        /* falls through */
      case LENEXT:
        if (state.extra) {
          //=== NEEDBITS(state.extra);
          n = state.extra;
          while (bits < n) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.length += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;
          //--- DROPBITS(state.extra) ---//
          hold >>>= state.extra;
          bits -= state.extra;
          //---//
          state.back += state.extra;
        }
        //Tracevv((stderr, "inflate:         length %u\n", state.length));
        state.was = state.length;
        state.mode = DIST;
        /* falls through */
      case DIST:
        for (;;) {
          here = state.distcode[hold & ((1 << state.distbits) - 1)];/*BITS(state.distbits)*/
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if ((here_bits) <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        if ((here_op & 0xf0) === 0) {
          last_bits = here_bits;
          last_op = here_op;
          last_val = here_val;
          for (;;) {
            here = state.distcode[last_val +
                    ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if ((last_bits + here_bits) <= bits) { break; }
            //--- PULLBYTE() ---//
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          //--- DROPBITS(last.bits) ---//
          hold >>>= last_bits;
          bits -= last_bits;
          //---//
          state.back += last_bits;
        }
        //--- DROPBITS(here.bits) ---//
        hold >>>= here_bits;
        bits -= here_bits;
        //---//
        state.back += here_bits;
        if (here_op & 64) {
          strm.msg = 'invalid distance code';
          state.mode = BAD;
          break;
        }
        state.offset = here_val;
        state.extra = (here_op) & 15;
        state.mode = DISTEXT;
        /* falls through */
      case DISTEXT:
        if (state.extra) {
          //=== NEEDBITS(state.extra);
          n = state.extra;
          while (bits < n) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.offset += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;
          //--- DROPBITS(state.extra) ---//
          hold >>>= state.extra;
          bits -= state.extra;
          //---//
          state.back += state.extra;
        }
//#ifdef INFLATE_STRICT
        if (state.offset > state.dmax) {
          strm.msg = 'invalid distance too far back';
          state.mode = BAD;
          break;
        }
//#endif
        //Tracevv((stderr, "inflate:         distance %u\n", state.offset));
        state.mode = MATCH;
        /* falls through */
      case MATCH:
        if (left === 0) { break inf_leave; }
        copy = _out - left;
        if (state.offset > copy) {         /* copy from window */
          copy = state.offset - copy;
          if (copy > state.whave) {
            if (state.sane) {
              strm.msg = 'invalid distance too far back';
              state.mode = BAD;
              break;
            }
// (!) This block is disabled in zlib defaults,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//          Trace((stderr, "inflate.c too far\n"));
//          copy -= state.whave;
//          if (copy > state.length) { copy = state.length; }
//          if (copy > left) { copy = left; }
//          left -= copy;
//          state.length -= copy;
//          do {
//            output[put++] = 0;
//          } while (--copy);
//          if (state.length === 0) { state.mode = LEN; }
//          break;
//#endif
          }
          if (copy > state.wnext) {
            copy -= state.wnext;
            from = state.wsize - copy;
          }
          else {
            from = state.wnext - copy;
          }
          if (copy > state.length) { copy = state.length; }
          from_source = state.window;
        }
        else {                              /* copy from output */
          from_source = output;
          from = put - state.offset;
          copy = state.length;
        }
        if (copy > left) { copy = left; }
        left -= copy;
        state.length -= copy;
        do {
          output[put++] = from_source[from++];
        } while (--copy);
        if (state.length === 0) { state.mode = LEN; }
        break;
      case LIT:
        if (left === 0) { break inf_leave; }
        output[put++] = state.length;
        left--;
        state.mode = LEN;
        break;
      case CHECK:
        if (state.wrap) {
          //=== NEEDBITS(32);
          while (bits < 32) {
            if (have === 0) { break inf_leave; }
            have--;
            // Use '|' instead of '+' to make sure that result is signed
            hold |= input[next++] << bits;
            bits += 8;
          }
          //===//
          _out -= left;
          strm.total_out += _out;
          state.total += _out;
          if ((state.wrap & 4) && _out) {
            strm.adler = state.check =
                /*UPDATE_CHECK(state.check, put - _out, _out);*/
                (state.flags ? crc32_1(state.check, output, _out, put - _out) : adler32_1(state.check, output, _out, put - _out));

          }
          _out = left;
          // NB: crc32 stored as signed 32-bit int, zswap32 returns signed too
          if ((state.wrap & 4) && (state.flags ? hold : zswap32(hold)) !== state.check) {
            strm.msg = 'incorrect data check';
            state.mode = BAD;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          //Tracev((stderr, "inflate:   check matches trailer\n"));
        }
        state.mode = LENGTH;
        /* falls through */
      case LENGTH:
        if (state.wrap && state.flags) {
          //=== NEEDBITS(32);
          while (bits < 32) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          if ((state.wrap & 4) && hold !== (state.total & 0xffffffff)) {
            strm.msg = 'incorrect length check';
            state.mode = BAD;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          //Tracev((stderr, "inflate:   length matches trailer\n"));
        }
        state.mode = DONE;
        /* falls through */
      case DONE:
        ret = Z_STREAM_END$1;
        break inf_leave;
      case BAD:
        ret = Z_DATA_ERROR$1;
        break inf_leave;
      case MEM:
        return Z_MEM_ERROR$1;
      case SYNC:
        /* falls through */
      default:
        return Z_STREAM_ERROR$1;
    }
  }

  // inf_leave <- here is real place for "goto inf_leave", emulated via "break inf_leave"

  /*
     Return from inflate(), updating the total counts and the check value.
     If there was no progress during the inflate() call, return a buffer
     error.  Call updatewindow() to create and/or update the window state.
     Note: a memory error from inflate() is non-recoverable.
   */

  //--- RESTORE() ---
  strm.next_out = put;
  strm.avail_out = left;
  strm.next_in = next;
  strm.avail_in = have;
  state.hold = hold;
  state.bits = bits;
  //---

  if (state.wsize || (_out !== strm.avail_out && state.mode < BAD &&
                      (state.mode < CHECK || flush !== Z_FINISH$1))) {
    if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) ;
  }
  _in -= strm.avail_in;
  _out -= strm.avail_out;
  strm.total_in += _in;
  strm.total_out += _out;
  state.total += _out;
  if ((state.wrap & 4) && _out) {
    strm.adler = state.check = /*UPDATE_CHECK(state.check, strm.next_out - _out, _out);*/
      (state.flags ? crc32_1(state.check, output, _out, strm.next_out - _out) : adler32_1(state.check, output, _out, strm.next_out - _out));
  }
  strm.data_type = state.bits + (state.last ? 64 : 0) +
                    (state.mode === TYPE ? 128 : 0) +
                    (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
  if (((_in === 0 && _out === 0) || flush === Z_FINISH$1) && ret === Z_OK$1) {
    ret = Z_BUF_ERROR;
  }
  return ret;
};


const inflateEnd = (strm) => {

  if (inflateStateCheck(strm)) {
    return Z_STREAM_ERROR$1;
  }

  let state = strm.state;
  if (state.window) {
    state.window = null;
  }
  strm.state = null;
  return Z_OK$1;
};


const inflateGetHeader = (strm, head) => {

  /* check state */
  if (inflateStateCheck(strm)) { return Z_STREAM_ERROR$1; }
  const state = strm.state;
  if ((state.wrap & 2) === 0) { return Z_STREAM_ERROR$1; }

  /* save header structure */
  state.head = head;
  head.done = false;
  return Z_OK$1;
};


const inflateSetDictionary = (strm, dictionary) => {
  const dictLength = dictionary.length;

  let state;
  let dictid;
  let ret;

  /* check state */
  if (inflateStateCheck(strm)) { return Z_STREAM_ERROR$1; }
  state = strm.state;

  if (state.wrap !== 0 && state.mode !== DICT) {
    return Z_STREAM_ERROR$1;
  }

  /* check for correct dictionary identifier */
  if (state.mode === DICT) {
    dictid = 1; /* adler32(0, null, 0)*/
    /* dictid = adler32(dictid, dictionary, dictLength); */
    dictid = adler32_1(dictid, dictionary, dictLength, 0);
    if (dictid !== state.check) {
      return Z_DATA_ERROR$1;
    }
  }
  /* copy dictionary to window using updatewindow(), which will amend the
   existing dictionary if appropriate */
  ret = updatewindow(strm, dictionary, dictLength, dictLength);
  if (ret) {
    state.mode = MEM;
    return Z_MEM_ERROR$1;
  }
  state.havedict = 1;
  // Tracev((stderr, "inflate:   dictionary set\n"));
  return Z_OK$1;
};


var inflateReset_1 = inflateReset;
var inflateReset2_1 = inflateReset2;
var inflateResetKeep_1 = inflateResetKeep;
var inflateInit_1 = inflateInit;
var inflateInit2_1 = inflateInit2;
var inflate_2$1 = inflate$2;
var inflateEnd_1 = inflateEnd;
var inflateGetHeader_1 = inflateGetHeader;
var inflateSetDictionary_1 = inflateSetDictionary;
var inflateInfo = 'pako inflate (from Nodeca project)';

/* Not implemented
module.exports.inflateCodesUsed = inflateCodesUsed;
module.exports.inflateCopy = inflateCopy;
module.exports.inflateGetDictionary = inflateGetDictionary;
module.exports.inflateMark = inflateMark;
module.exports.inflatePrime = inflatePrime;
module.exports.inflateSync = inflateSync;
module.exports.inflateSyncPoint = inflateSyncPoint;
module.exports.inflateUndermine = inflateUndermine;
module.exports.inflateValidate = inflateValidate;
*/

var inflate_1$2 = {
	inflateReset: inflateReset_1,
	inflateReset2: inflateReset2_1,
	inflateResetKeep: inflateResetKeep_1,
	inflateInit: inflateInit_1,
	inflateInit2: inflateInit2_1,
	inflate: inflate_2$1,
	inflateEnd: inflateEnd_1,
	inflateGetHeader: inflateGetHeader_1,
	inflateSetDictionary: inflateSetDictionary_1,
	inflateInfo: inflateInfo
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

function GZheader() {
  /* true if compressed data believed to be text */
  this.text       = 0;
  /* modification time */
  this.time       = 0;
  /* extra flags (not used when writing a gzip file) */
  this.xflags     = 0;
  /* operating system */
  this.os         = 0;
  /* pointer to extra field or Z_NULL if none */
  this.extra      = null;
  /* extra field length (valid if extra != Z_NULL) */
  this.extra_len  = 0; // Actually, we don't need it in JS,
                       // but leave for few code modifications

  //
  // Setup limits is not necessary because in js we should not preallocate memory
  // for inflate use constant limit in 65536 bytes
  //

  /* space at extra (only when reading header) */
  // this.extra_max  = 0;
  /* pointer to zero-terminated file name or Z_NULL */
  this.name       = '';
  /* space at name (only when reading header) */
  // this.name_max   = 0;
  /* pointer to zero-terminated comment or Z_NULL */
  this.comment    = '';
  /* space at comment (only when reading header) */
  // this.comm_max   = 0;
  /* true if there was or will be a header crc */
  this.hcrc       = 0;
  /* true when done reading gzip header (not used when writing a gzip file) */
  this.done       = false;
}

var gzheader = GZheader;

const toString = Object.prototype.toString;

/* Public constants ==========================================================*/
/* ===========================================================================*/

const {
  Z_NO_FLUSH, Z_FINISH,
  Z_OK, Z_STREAM_END, Z_NEED_DICT, Z_STREAM_ERROR, Z_DATA_ERROR, Z_MEM_ERROR
} = constants$2;

/* ===========================================================================*/


/**
 * class Inflate
 *
 * Generic JS-style wrapper for zlib calls. If you don't need
 * streaming behaviour - use more simple functions: [[inflate]]
 * and [[inflateRaw]].
 **/

/* internal
 * inflate.chunks -> Array
 *
 * Chunks of output data, if [[Inflate#onData]] not overridden.
 **/

/**
 * Inflate.result -> Uint8Array|String
 *
 * Uncompressed result, generated by default [[Inflate#onData]]
 * and [[Inflate#onEnd]] handlers. Filled after you push last chunk
 * (call [[Inflate#push]] with `Z_FINISH` / `true` param).
 **/

/**
 * Inflate.err -> Number
 *
 * Error code after inflate finished. 0 (Z_OK) on success.
 * Should be checked if broken data possible.
 **/

/**
 * Inflate.msg -> String
 *
 * Error message, if [[Inflate.err]] != 0
 **/


/**
 * new Inflate(options)
 * - options (Object): zlib inflate options.
 *
 * Creates new inflator instance with specified params. Throws exception
 * on bad params. Supported options:
 *
 * - `windowBits`
 * - `dictionary`
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Additional options, for internal needs:
 *
 * - `chunkSize` - size of generated data chunks (16K by default)
 * - `raw` (Boolean) - do raw inflate
 * - `to` (String) - if equal to 'string', then result will be converted
 *   from utf8 to utf16 (javascript) string. When string output requested,
 *   chunk length can differ from `chunkSize`, depending on content.
 *
 * By default, when no options set, autodetect deflate/gzip data format via
 * wrapper header.
 *
 * ##### Example:
 *
 * ```javascript
 * const pako = require('pako')
 * const chunk1 = new Uint8Array([1,2,3,4,5,6,7,8,9])
 * const chunk2 = new Uint8Array([10,11,12,13,14,15,16,17,18,19]);
 *
 * const inflate = new pako.Inflate({ level: 3});
 *
 * inflate.push(chunk1, false);
 * inflate.push(chunk2, true);  // true -> last chunk
 *
 * if (inflate.err) { throw new Error(inflate.err); }
 *
 * console.log(inflate.result);
 * ```
 **/
function Inflate$1(options) {
  this.options = common.assign({
    chunkSize: 1024 * 64,
    windowBits: 15,
    to: ''
  }, options || {});

  const opt = this.options;

  // Force window size for `raw` data, if not set directly,
  // because we have no header for autodetect.
  if (opt.raw && (opt.windowBits >= 0) && (opt.windowBits < 16)) {
    opt.windowBits = -opt.windowBits;
    if (opt.windowBits === 0) { opt.windowBits = -15; }
  }

  // If `windowBits` not defined (and mode not raw) - set autodetect flag for gzip/deflate
  if ((opt.windowBits >= 0) && (opt.windowBits < 16) &&
      !(options && options.windowBits)) {
    opt.windowBits += 32;
  }

  // Gzip header has no info about windows size, we can do autodetect only
  // for deflate. So, if window size not set, force it to max when gzip possible
  if ((opt.windowBits > 15) && (opt.windowBits < 48)) {
    // bit 3 (16) -> gzipped data
    // bit 4 (32) -> autodetect gzip/deflate
    if ((opt.windowBits & 15) === 0) {
      opt.windowBits |= 15;
    }
  }

  this.err    = 0;      // error code, if happens (0 = Z_OK)
  this.msg    = '';     // error message
  this.ended  = false;  // used to avoid multiple onEnd() calls
  this.chunks = [];     // chunks of compressed data

  this.strm   = new zstream();
  this.strm.avail_out = 0;

  let status  = inflate_1$2.inflateInit2(
    this.strm,
    opt.windowBits
  );

  if (status !== Z_OK) {
    throw new Error(messages[status]);
  }

  this.header = new gzheader();

  inflate_1$2.inflateGetHeader(this.strm, this.header);

  // Setup dictionary
  if (opt.dictionary) {
    // Convert data if needed
    if (typeof opt.dictionary === 'string') {
      opt.dictionary = strings.string2buf(opt.dictionary);
    } else if (toString.call(opt.dictionary) === '[object ArrayBuffer]') {
      opt.dictionary = new Uint8Array(opt.dictionary);
    }
    if (opt.raw) { //In raw mode we need to set the dictionary early
      status = inflate_1$2.inflateSetDictionary(this.strm, opt.dictionary);
      if (status !== Z_OK) {
        throw new Error(messages[status]);
      }
    }
  }
}

/**
 * Inflate#push(data[, flush_mode]) -> Boolean
 * - data (Uint8Array|ArrayBuffer): input data
 * - flush_mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE
 *   flush modes. See constants. Skipped or `false` means Z_NO_FLUSH,
 *   `true` means Z_FINISH.
 *
 * Sends input data to inflate pipe, generating [[Inflate#onData]] calls with
 * new output chunks. Returns `true` on success. If end of stream detected,
 * [[Inflate#onEnd]] will be called.
 *
 * `flush_mode` is not needed for normal operation, because end of stream
 * detected automatically. You may try to use it for advanced things, but
 * this functionality was not tested.
 *
 * On fail call [[Inflate#onEnd]] with error code and return false.
 *
 * ##### Example
 *
 * ```javascript
 * push(chunk, false); // push one of data chunks
 * ...
 * push(chunk, true);  // push last chunk
 * ```
 **/
Inflate$1.prototype.push = function (data, flush_mode) {
  const strm = this.strm;
  const chunkSize = this.options.chunkSize;
  const dictionary = this.options.dictionary;
  let status, _flush_mode, last_avail_out;

  if (this.ended) return false;

  if (flush_mode === ~~flush_mode) _flush_mode = flush_mode;
  else _flush_mode = flush_mode === true ? Z_FINISH : Z_NO_FLUSH;

  // Convert data if needed
  if (toString.call(data) === '[object ArrayBuffer]') {
    strm.input = new Uint8Array(data);
  } else {
    strm.input = data;
  }

  strm.next_in = 0;
  strm.avail_in = strm.input.length;

  for (;;) {
    if (strm.avail_out === 0) {
      strm.output = new Uint8Array(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }

    status = inflate_1$2.inflate(strm, _flush_mode);

    if (status === Z_NEED_DICT && dictionary) {
      status = inflate_1$2.inflateSetDictionary(strm, dictionary);

      if (status === Z_OK) {
        status = inflate_1$2.inflate(strm, _flush_mode);
      } else if (status === Z_DATA_ERROR) {
        // Replace code with more verbose
        status = Z_NEED_DICT;
      }
    }

    // Skip snyc markers if more data follows and not raw mode
    while (strm.avail_in > 0 &&
           status === Z_STREAM_END &&
           strm.state.wrap > 0 &&
           data[strm.next_in] !== 0)
    {
      inflate_1$2.inflateReset(strm);
      status = inflate_1$2.inflate(strm, _flush_mode);
    }

    switch (status) {
      case Z_STREAM_ERROR:
      case Z_DATA_ERROR:
      case Z_NEED_DICT:
      case Z_MEM_ERROR:
        this.onEnd(status);
        this.ended = true;
        return false;
    }

    // Remember real `avail_out` value, because we may patch out buffer content
    // to align utf8 strings boundaries.
    last_avail_out = strm.avail_out;

    if (strm.next_out) {
      if (strm.avail_out === 0 || status === Z_STREAM_END) {

        if (this.options.to === 'string') {

          let next_out_utf8 = strings.utf8border(strm.output, strm.next_out);

          let tail = strm.next_out - next_out_utf8;
          let utf8str = strings.buf2string(strm.output, next_out_utf8);

          // move tail & realign counters
          strm.next_out = tail;
          strm.avail_out = chunkSize - tail;
          if (tail) strm.output.set(strm.output.subarray(next_out_utf8, next_out_utf8 + tail), 0);

          this.onData(utf8str);

        } else {
          this.onData(strm.output.length === strm.next_out ? strm.output : strm.output.subarray(0, strm.next_out));
        }
      }
    }

    // Must repeat iteration if out buffer is full
    if (status === Z_OK && last_avail_out === 0) continue;

    // Finalize if end of stream reached.
    if (status === Z_STREAM_END) {
      status = inflate_1$2.inflateEnd(this.strm);
      this.onEnd(status);
      this.ended = true;
      return true;
    }

    if (strm.avail_in === 0) break;
  }

  return true;
};


/**
 * Inflate#onData(chunk) -> Void
 * - chunk (Uint8Array|String): output data. When string output requested,
 *   each chunk will be string.
 *
 * By default, stores data blocks in `chunks[]` property and glue
 * those in `onEnd`. Override this handler, if you need another behaviour.
 **/
Inflate$1.prototype.onData = function (chunk) {
  this.chunks.push(chunk);
};


/**
 * Inflate#onEnd(status) -> Void
 * - status (Number): inflate status. 0 (Z_OK) on success,
 *   other if not.
 *
 * Called either after you tell inflate that the input stream is
 * complete (Z_FINISH). By default - join collected chunks,
 * free memory and fill `results` / `err` properties.
 **/
Inflate$1.prototype.onEnd = function (status) {
  // On success - join
  if (status === Z_OK) {
    if (this.options.to === 'string') {
      this.result = this.chunks.join('');
    } else {
      this.result = common.flattenChunks(this.chunks);
    }
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};


/**
 * inflate(data[, options]) -> Uint8Array|String
 * - data (Uint8Array|ArrayBuffer): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * Decompress `data` with inflate/ungzip and `options`. Autodetect
 * format via wrapper header by default. That's why we don't provide
 * separate `ungzip` method.
 *
 * Supported options are:
 *
 * - windowBits
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information.
 *
 * Sugar (options):
 *
 * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
 *   negative windowBits implicitly.
 * - `to` (String) - if equal to 'string', then result will be converted
 *   from utf8 to utf16 (javascript) string. When string output requested,
 *   chunk length can differ from `chunkSize`, depending on content.
 *
 *
 * ##### Example:
 *
 * ```javascript
 * const pako = require('pako');
 * const input = pako.deflate(new Uint8Array([1,2,3,4,5,6,7,8,9]));
 * let output;
 *
 * try {
 *   output = pako.inflate(input);
 * } catch (err) {
 *   console.log(err);
 * }
 * ```
 **/
function inflate$1(input, options) {
  const inflator = new Inflate$1(options);

  inflator.push(input);

  // That will never happens, if you don't cheat with options :)
  if (inflator.err) throw inflator.msg || messages[inflator.err];

  return inflator.result;
}


/**
 * inflateRaw(data[, options]) -> Uint8Array|String
 * - data (Uint8Array|ArrayBuffer): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * The same as [[inflate]], but creates raw data, without wrapper
 * (header and adler32 crc).
 **/
function inflateRaw$1(input, options) {
  options = options || {};
  options.raw = true;
  return inflate$1(input, options);
}


/**
 * ungzip(data[, options]) -> Uint8Array|String
 * - data (Uint8Array|ArrayBuffer): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * Just shortcut to [[inflate]], because it autodetects format
 * by header.content. Done for convenience.
 **/


var Inflate_1$1 = Inflate$1;
var inflate_2 = inflate$1;
var inflateRaw_1$1 = inflateRaw$1;
var ungzip$1 = inflate$1;
var constants = constants$2;

var inflate_1$1 = {
	Inflate: Inflate_1$1,
	inflate: inflate_2,
	inflateRaw: inflateRaw_1$1,
	ungzip: ungzip$1,
	constants: constants
};

const { Deflate, deflate, deflateRaw, gzip } = deflate_1$1;

const { Inflate, inflate, inflateRaw, ungzip } = inflate_1$1;



var Deflate_1 = Deflate;
var deflate_1 = deflate;
var deflateRaw_1 = deflateRaw;
var gzip_1 = gzip;
var Inflate_1 = Inflate;
var inflate_1 = inflate;
var inflateRaw_1 = inflateRaw;
var ungzip_1 = ungzip;
var constants_1 = constants$2;

var pako = {
	Deflate: Deflate_1,
	deflate: deflate_1,
	deflateRaw: deflateRaw_1,
	gzip: gzip_1,
	Inflate: Inflate_1,
	inflate: inflate_1,
	inflateRaw: inflateRaw_1,
	ungzip: ungzip_1,
	constants: constants_1
};

/**
 * Add gRPC Header
 * @author app2smile
 * @param {ArrayBuffer} header - unGzip Header
 * @param {ArrayBuffer} body - unGzip Body
 * @param {String} type - encoding type
 * @return {ArrayBuffer} new raw Body with Checksum Header
 */
function addgRPCHeader({ header, body }, encoding = undefined) {
	console.log(`☑️ Add gRPC Header`, "");
	// Header: 1位：是否校验数据 （0或者1） + 4位:校验值（数据长度）
	const flag = (encoding == "gzip") ? 1 : (encoding == "identity") ? 0 : (encoding == undefined) ? 0 : header?.[0] ?? 0; // encoding flag
	const checksum = Checksum(body.length); // 校验值为未压缩情况下的数据长度, 不是压缩后的长度
	if (encoding == "gzip") body = pako.gzip(body); // gzip压缩（有问题，别压）
	let rawBody = new Uint8Array(header.length + body.length);
	rawBody.set([flag], 0); // 0位：Encoding类型，当为1的时候, app会校验1-4位的校验值是否正确
	rawBody.set(checksum, 1); // 1-4位： 校验值(4位)
	rawBody.set(body, 5); // 5-end位：protobuf数据
	console.log(`✅ Add gRPC Header`, "");
	return rawBody;

	// 计算校验和 (B站为数据本体字节数)
	function Checksum(num) {
		let arr = new ArrayBuffer(4); // an Int32 takes 4 bytes
		let view = new DataView(arr);
		// 首位填充计算过的新数据长度
		view.setUint32(0, num, false); // byteOffset = 0; litteEndian = false
		return new Uint8Array(arr);
	}}

function modifyPegasusQueryContext(queryContext, Settings) {
    console.log(`☑️ modify PegasusQueryContext`, "");
    Locale = queryContext.locale;
    [Language, CountryCode] = Locale?.split("_") ?? [];
    console.log(`🚧 Locale: ${Locale}, Language: ${Language}, CountryCode: ${CountryCode}`);
    switch (Settings.CountryCode) {
        case "AUTO":
            Settings.CountryCode = CountryCode;
        //break;
        default:
            if (queryContext?.countryCode) queryContext.countryCode = Settings.CountryCode;
            //if (data?.siriPegasusContext?.conversationContext?.cc) data.siriPegasusContext.conversationContext.cc = Settings.CountryCode;
            break;
    }    switch (Settings.Region) {
        case "AUTO":
            break;
        default:
            if (queryContext?.region) queryContext.region = Settings.Region;
            break;
    }    if (queryContext?.skuRegion === "CH") queryContext.skuRegion = "LL";
    //delete queryContext?.location;
    console.log(`✅ modify PegasusQueryContext`, "");
    return queryContext;
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
// @generated from protobuf file "apple.parsec.siri.v2alpha.DeviceState.proto" (syntax proto3)
// tslint:disable
// @generated by protobuf-ts 2.9.4 with parameter generate_dependencies,long_type_number,keep_enum_prefix,output_javascript
// @generated from protobuf file "apple.parsec.siri.v2alpha.DeviceState.proto" (syntax proto3)
// tslint:disable
// @generated message type with reflection information, may provide speed optimized methods
class DeviceState$Type extends MessageType {
    constructor() {
        super("DeviceState", [
            { no: 1, name: "companionName", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "deviceName", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "inputOrigin", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "isAppleTv", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
            { no: 5, name: "isCarDnd", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
            { no: 6, name: "isCarPlay", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
            { no: 7, name: "isEyesFree", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
            { no: 8, name: "isHomePod", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
            { no: 9, name: "isLockedWithPasscode", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
            { no: 10, name: "isMac", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
            { no: 11, name: "isMultiUser", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
            { no: 12, name: "isPad", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
            { no: 13, name: "isPhone", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
            { no: 14, name: "isTextToSpeechEnabled", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
            { no: 15, name: "isVox", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
            { no: 16, name: "isVoiceGenderFemale", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
            { no: 17, name: "isVoiceGenderMale", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
            { no: 18, name: "isVoiceGenderUnknown", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
            { no: 19, name: "isVoiceTriggerEnabled", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
            { no: 20, name: "isWatch", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
            { no: 21, name: "siriLocale", kind: "scalar", opt: true, T: 5 /*ScalarType.INT32*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message DeviceState
 */
const DeviceState = new DeviceState$Type();

// @generated by protobuf-ts 2.9.4 with parameter generate_dependencies,long_type_number,keep_enum_prefix,output_javascript
// @generated from protobuf file "apple.parsec.siri.v2alpha.SiriPegasusContext.proto" (syntax proto3)
// tslint:disable
// @generated by protobuf-ts 2.9.4 with parameter generate_dependencies,long_type_number,keep_enum_prefix,output_javascript
// @generated from protobuf file "apple.parsec.siri.v2alpha.SiriPegasusContext.proto" (syntax proto3)
// tslint:disable
// @generated message type with reflection information, may provide speed optimized methods
class SiriPegasusContext$Type extends MessageType {
    constructor() {
        super("SiriPegasusContext", [
            { no: 1, name: "deviceState", kind: "message", T: () => DeviceState },
            { no: 8, name: "restrictions", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 14, name: "conversationContext", kind: "message", T: () => N14 }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message SiriPegasusContext
 */
const SiriPegasusContext = new SiriPegasusContext$Type();
// @generated message type with reflection information, may provide speed optimized methods
class N14$Type extends MessageType {
    constructor() {
        super("N14", [
            { no: 1, name: "cc", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "unknown2", kind: "scalar", T: 5 /*ScalarType.INT32*/ },
            { no: 3, name: "unknown3", kind: "scalar", T: 5 /*ScalarType.INT32*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message N14
 */
const N14 = new N14$Type();

// @generated by protobuf-ts 2.9.4 with parameter generate_dependencies,long_type_number,keep_enum_prefix,output_javascript
// @generated from protobuf file "apple.parsec.search.PegasusQueryContext.proto" (syntax proto3)
// tslint:disable
// @generated by protobuf-ts 2.9.4 with parameter generate_dependencies,long_type_number,keep_enum_prefix,output_javascript
// @generated from protobuf file "apple.parsec.search.PegasusQueryContext.proto" (syntax proto3)
// tslint:disable
/**
 * @generated from protobuf enum TemperatureUnit
 */
var TemperatureUnit;
(function (TemperatureUnit) {
    /**
     * @generated from protobuf enum value: TemperatureUnitUnknown = 0;
     */
    TemperatureUnit[TemperatureUnit["TemperatureUnitUnknown"] = 0] = "TemperatureUnitUnknown";
    /**
     * celsius
     *
     * @generated from protobuf enum value: TemperatureUnitCelsius = 1;
     */
    TemperatureUnit[TemperatureUnit["TemperatureUnitCelsius"] = 1] = "TemperatureUnitCelsius";
    /**
     * fahrenheit
     *
     * @generated from protobuf enum value: TemperatureUnitFahrenheit = 2;
     */
    TemperatureUnit[TemperatureUnit["TemperatureUnitFahrenheit"] = 2] = "TemperatureUnitFahrenheit";
})(TemperatureUnit || (TemperatureUnit = {}));
/**
 * @generated from protobuf enum MeasurementSystem
 */
var MeasurementSystem;
(function (MeasurementSystem) {
    /**
     * @generated from protobuf enum value: MeasurementSystemUnknown = 0;
     */
    MeasurementSystem[MeasurementSystem["MeasurementSystemUnknown"] = 0] = "MeasurementSystemUnknown";
    /**
     * @generated from protobuf enum value: MeasurementSystemSI = 1;
     */
    MeasurementSystem[MeasurementSystem["MeasurementSystemSI"] = 1] = "MeasurementSystemSI";
    /**
     * @generated from protobuf enum value: MeasurementSystemUS = 2;
     */
    MeasurementSystem[MeasurementSystem["MeasurementSystemUS"] = 2] = "MeasurementSystemUS";
    /**
     * @generated from protobuf enum value: MeasurementSystemUK = 3;
     */
    MeasurementSystem[MeasurementSystem["MeasurementSystemUK"] = 3] = "MeasurementSystemUK";
})(MeasurementSystem || (MeasurementSystem = {}));
/**
 * @generated from protobuf enum HourFormat
 */
var HourFormat;
(function (HourFormat) {
    /**
     * @generated from protobuf enum value: HourFormatUnknown = 0;
     */
    HourFormat[HourFormat["HourFormatUnknown"] = 0] = "HourFormatUnknown";
    /**
     * twelve
     *
     * @generated from protobuf enum value: HourFormatTwelve = 1;
     */
    HourFormat[HourFormat["HourFormatTwelve"] = 1] = "HourFormatTwelve";
    /**
     * twentyFour
     *
     * @generated from protobuf enum value: HourFormatTwentyFour = 2;
     */
    HourFormat[HourFormat["HourFormatTwentyFour"] = 2] = "HourFormatTwentyFour";
})(HourFormat || (HourFormat = {}));
/**
 * @generated from protobuf enum Source
 */
var Source;
(function (Source) {
    /**
     * @generated from protobuf enum value: SourceUnknown = 0;
     */
    Source[Source["SourceUnknown"] = 0] = "SourceUnknown";
    /**
     * disabledByUser
     *
     * @generated from protobuf enum value: SourceDisabledByUser = 1;
     */
    Source[Source["SourceDisabledByUser"] = 1] = "SourceDisabledByUser";
    /**
     * disabledByBag
     *
     * @generated from protobuf enum value: SourceDisabledByBag = 2;
     */
    Source[Source["SourceDisabledByBag"] = 2] = "SourceDisabledByBag";
    /**
     * tooSlow
     *
     * @generated from protobuf enum value: SourceTooSlow = 3;
     */
    Source[Source["SourceTooSlow"] = 3] = "SourceTooSlow";
    /**
     * @generated from protobuf enum value: SourceError = 4;
     */
    Source[Source["SourceError"] = 4] = "SourceError";
    /**
     * @generated from protobuf enum value: SourceGPS = 5;
     */
    Source[Source["SourceGPS"] = 5] = "SourceGPS";
    /**
     * cellular
     *
     * @generated from protobuf enum value: SourceCellular = 6;
     */
    Source[Source["SourceCellular"] = 6] = "SourceCellular";
    /**
     * wiFi
     *
     * @generated from protobuf enum value: SourceWiFi = 7;
     */
    Source[Source["SourceWiFi"] = 7] = "SourceWiFi";
})(Source || (Source = {}));
// @generated message type with reflection information, may provide speed optimized methods
class PegasusQueryContext$Type extends MessageType {
    constructor() {
        super("PegasusQueryContext", [
            { no: 1, name: "secretKey", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "countryCode", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "locale", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "effectiveSystemLanguage", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 5, name: "preferredLanguages", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 6, name: "storeFront", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 8, name: "timeZone", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 9, name: "skuRegion", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 11, name: "temperatureUnit", kind: "enum", T: () => ["TemperatureUnit", TemperatureUnit] },
            { no: 12, name: "measurementSystem", kind: "enum", T: () => ["MeasurementSystem", MeasurementSystem] },
            { no: 13, name: "hourFormat", kind: "enum", T: () => ["HourFormat", HourFormat] },
            { no: 14, name: "location", kind: "message", T: () => Location },
            { no: 18, name: "installedAppsSignature", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 19, name: "uiScale", kind: "scalar", opt: true, T: 2 /*ScalarType.FLOAT*/ },
            { no: 21, name: "seedBuild", kind: "scalar", opt: true, T: 5 /*ScalarType.INT32*/ },
            { no: 22, name: "hsEnabled", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
            { no: 26, name: "region", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 28, name: "trialIdentifiers", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message PegasusQueryContext
 */
const PegasusQueryContext = new PegasusQueryContext$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Location$Type extends MessageType {
    constructor() {
        super("Location", [
            { no: 1, name: "latitude", kind: "scalar", opt: true, T: 2 /*ScalarType.FLOAT*/ },
            { no: 2, name: "longitude", kind: "scalar", opt: true, T: 2 /*ScalarType.FLOAT*/ },
            { no: 3, name: "source", kind: "enum", opt: true, T: () => ["Source", Source] },
            { no: 4, name: "horizontalAccuracy", kind: "scalar", opt: true, T: 2 /*ScalarType.FLOAT*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message Location
 */
const Location = new Location$Type();

// @generated by protobuf-ts 2.9.4 with parameter generate_dependencies,long_type_number,keep_enum_prefix,output_javascript
// @generated from protobuf file "google/protobuf/any.proto" (package "google.protobuf", syntax proto3)
// tslint:disable
//
// Protocol Buffers - Google's data interchange format
// Copyright 2008 Google Inc.  All rights reserved.
// https://developers.google.com/protocol-buffers/
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//     * Redistributions of source code must retain the above copyright
// notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above
// copyright notice, this list of conditions and the following disclaimer
// in the documentation and/or other materials provided with the
// distribution.
//     * Neither the name of Google Inc. nor the names of its
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
// @generated message type with reflection information, may provide speed optimized methods
class Any$Type extends MessageType {
    constructor() {
        super("google.protobuf.Any", [
            { no: 1, name: "type_url", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "value", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
    /**
     * Pack the message into a new `Any`.
     *
     * Uses 'type.googleapis.com/full.type.name' as the type URL.
     */
    pack(message, type) {
        return {
            typeUrl: this.typeNameToUrl(type.typeName), value: type.toBinary(message),
        };
    }
    /**
     * Unpack the message from the `Any`.
     */
    unpack(any, type, options) {
        if (!this.contains(any, type))
            throw new Error("Cannot unpack google.protobuf.Any with typeUrl '" + any.typeUrl + "' as " + type.typeName + ".");
        return type.fromBinary(any.value, options);
    }
    /**
     * Does the given `Any` contain a packed message of the given type?
     */
    contains(any, type) {
        if (!any.typeUrl.length)
            return false;
        let wants = typeof type == "string" ? type : type.typeName;
        let has = this.typeUrlToName(any.typeUrl);
        return wants === has;
    }
    /**
     * Convert the message to canonical JSON value.
     *
     * You have to provide the `typeRegistry` option so that the
     * packed message can be converted to JSON.
     *
     * The `typeRegistry` option is also required to read
     * `google.protobuf.Any` from JSON format.
     */
    internalJsonWrite(any, options) {
        if (any.typeUrl === "")
            return {};
        let typeName = this.typeUrlToName(any.typeUrl);
        let opt = jsonWriteOptions(options);
        let type = opt.typeRegistry?.find(t => t.typeName === typeName);
        if (!type)
            throw new globalThis.Error("Unable to convert google.protobuf.Any with typeUrl '" + any.typeUrl + "' to JSON. The specified type " + typeName + " is not available in the type registry.");
        let value = type.fromBinary(any.value, { readUnknownField: false });
        let json = type.internalJsonWrite(value, opt);
        if (typeName.startsWith("google.protobuf.") || !isJsonObject(json))
            json = { value: json };
        json["@type"] = any.typeUrl;
        return json;
    }
    internalJsonRead(json, options, target) {
        if (!isJsonObject(json))
            throw new globalThis.Error("Unable to parse google.protobuf.Any from JSON " + typeofJsonValue(json) + ".");
        if (typeof json["@type"] != "string" || json["@type"] == "")
            return this.create();
        let typeName = this.typeUrlToName(json["@type"]);
        let type = options?.typeRegistry?.find(t => t.typeName == typeName);
        if (!type)
            throw new globalThis.Error("Unable to parse google.protobuf.Any from JSON. The specified type " + typeName + " is not available in the type registry.");
        let value;
        if (typeName.startsWith("google.protobuf.") && json.hasOwnProperty("value"))
            value = type.fromJson(json["value"], options);
        else {
            let copy = Object.assign({}, json);
            delete copy["@type"];
            value = type.fromJson(copy, options);
        }
        if (target === undefined)
            target = this.create();
        target.typeUrl = json["@type"];
        target.value = type.toBinary(value);
        return target;
    }
    typeNameToUrl(name) {
        if (!name.length)
            throw new Error("invalid type name: " + name);
        return "type.googleapis.com/" + name;
    }
    typeUrlToName(url) {
        if (!url.length)
            throw new Error("invalid type url: " + url);
        let slash = url.lastIndexOf("/");
        let name = slash > 0 ? url.substring(slash + 1) : url;
        if (!name.length)
            throw new Error("invalid type url: " + url);
        return name;
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.typeUrl = "";
        message.value = new Uint8Array(0);
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string type_url */ 1:
                    message.typeUrl = reader.string();
                    break;
                case /* bytes value */ 2:
                    message.value = reader.bytes();
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
        /* string type_url = 1; */
        if (message.typeUrl !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.typeUrl);
        /* bytes value = 2; */
        if (message.value.length)
            writer.tag(2, WireType.LengthDelimited).bytes(message.value);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message google.protobuf.Any
 */
const Any = new Any$Type();

// @generated by protobuf-ts 2.9.4 with parameter generate_dependencies,long_type_number,keep_enum_prefix,output_javascript
// @generated from protobuf file "apple.parsec.siri.v2alpha.PegasusSearchQuery.proto" (syntax proto3)
// tslint:disable
// @generated by protobuf-ts 2.9.4 with parameter generate_dependencies,long_type_number,keep_enum_prefix,output_javascript
// @generated from protobuf file "apple.parsec.siri.v2alpha.PegasusSearchQuery.proto" (syntax proto3)
// tslint:disable
// @generated message type with reflection information, may provide speed optimized methods
class PegasusSearchQuery$Type extends MessageType {
    constructor() {
        super("PegasusSearchQuery", [
            { no: 1, name: "query", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "queryID", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2002, name: "unknown2002", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Unknown2002 }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message PegasusSearchQuery
 */
const PegasusSearchQuery = new PegasusSearchQuery$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Unknown2002$Type extends MessageType {
    constructor() {
        super("Unknown2002", [
            { no: 2, name: "n2", kind: "message", T: () => U2002N2 }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message Unknown2002
 */
const Unknown2002 = new Unknown2002$Type();
// @generated message type with reflection information, may provide speed optimized methods
class U2002N2$Type extends MessageType {
    constructor() {
        super("U2002N2", [
            { no: 1, name: "unknown1", kind: "scalar", T: 5 /*ScalarType.INT32*/ },
            { no: 2, name: "supplement", kind: "message", T: () => Any },
            { no: 3, name: "unknown3", kind: "scalar", T: 5 /*ScalarType.INT32*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message U2002N2
 */
const U2002N2 = new U2002N2$Type();

// @generated by protobuf-ts 2.9.4 with parameter generate_dependencies,long_type_number,keep_enum_prefix,output_javascript
// @generated from protobuf file "Apple.Parsec.Siri.V2alpha.SiriPegasusRequest.proto" (syntax proto3)
// tslint:disable
// @generated by protobuf-ts 2.9.4 with parameter generate_dependencies,long_type_number,keep_enum_prefix,output_javascript
// @generated from protobuf file "Apple.Parsec.Siri.V2alpha.SiriPegasusRequest.proto" (syntax proto3)
// tslint:disable
// @generated message type with reflection information, may provide speed optimized methods
class SiriPegasusRequest$Type extends MessageType {
    constructor() {
        super("SiriPegasusRequest", [
            { no: 1, name: "queries", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => PegasusSearchQuery },
            { no: 2, name: "queryContext", kind: "message", T: () => PegasusQueryContext },
            { no: 3, name: "userDataShareOptIn", kind: "scalar", opt: true, T: 8 /*ScalarType.BOOL*/ },
            { no: 5, name: "siriPegasusContext", kind: "message", T: () => SiriPegasusContext }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message SiriPegasusRequest
 */
const SiriPegasusRequest = new SiriPegasusRequest$Type();

log("v4.1.1(4041)");

// 构造回复数据
let $response = undefined;

/***************** Processing *****************/
// 解构URL
const url = new URL($request.url);
log(`⚠ url: ${url.toJSON()}`, "");
// 获取连接参数
const METHOD = $request.method, HOST = url.hostname, PATH = url.pathname; url.pathname.split("/").filter(Boolean);
log(`⚠ METHOD: ${METHOD}, HOST: ${HOST}, PATH: ${PATH}` , "");
// 解析格式
const FORMAT = ($request.headers?.["Content-Type"] ?? $request.headers?.["content-type"])?.split(";")?.[0];
log(`⚠ FORMAT: ${FORMAT}`, "");
!(async () => {
	const { Settings, Caches, Configs } = setENV("iRingo", "Siri", Database$1);
	log(`⚠ Settings.Switch: ${Settings?.Switch}`, "");
	switch (Settings.Switch) {
		case true:
		default:
			// 创建空数据
			let Locale, Language, CountryCode;
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
						default:
							//log(`🚧 body: ${body}`, "");
							break;
						case "application/x-mpegURL":
						case "application/x-mpegurl":
						case "application/vnd.apple.mpegurl":
						case "audio/mpegurl":
							//body = M3U8.parse($request.body);
							//log(`🚧 body: ${JSON.stringify(body)}`, "");
							//$request.body = M3U8.stringify(body);
							break;
						case "text/xml":
						case "text/html":
						case "text/plist":
						case "application/xml":
						case "application/plist":
						case "application/x-plist":
							//body = XML.parse($request.body);
							//log(`🚧 body: ${JSON.stringify(body)}`, "");
							//$request.body = XML.stringify(body);
							break;
						case "text/vtt":
						case "application/vtt":
							//body = VTT.parse($request.body);
							//log(`🚧 body: ${JSON.stringify(body)}`, "");
							//$request.body = VTT.stringify(body);
							break;
						case "text/json":
						case "application/json":
							//body = JSON.parse($request.body ?? "{}");
							//log(`🚧 body: ${JSON.stringify(body)}`, "");
							//$request.body = JSON.stringify(body);
							break;
						case "application/protobuf":
						case "application/x-protobuf":
						case "application/vnd.google.protobuf":
						case "application/grpc":
						case "application/grpc+proto":
						case "applecation/octet-stream":
							//log(`🚧 $request.body: ${JSON.stringify($request.body)}`, "");
							let rawBody = ($platform === "Quantumult X") ? new Uint8Array($request.bodyBytes ?? []) : $request.body ?? new Uint8Array();
							//log(`🚧 isBuffer? ${ArrayBuffer.isView(rawBody)}: ${JSON.stringify(rawBody)}`, "");
							switch (FORMAT) {
								case "application/protobuf":
								case "application/x-protobuf":
								case "application/vnd.google.protobuf":
									break;
								case "application/grpc":
								case "application/grpc+proto":
									// 先拆分B站gRPC校验头和protobuf数据体
									let header = rawBody.slice(0, 5);
									body = rawBody.slice(5);
									// 处理request压缩protobuf数据体
									switch (header?.[0]) {
										case 0: // unGzip
											break;
										case 1: // Gzip
											body = pako.ungzip(body);
											header[0] = 0; // unGzip
											break;
									}									// 解析链接并处理protobuf数据
									// 主机判断
									switch (HOST) {
										case "guzzoni.smoot.apple.com":
										case "api-siri.smoot.apple.com":
										case "api2.smoot.apple.com":
										default:
											// 路径判断
											switch (PATH) {
												case "/apple.parsec.siri.v2alpha.SiriSearch/SiriSearch": { // Siri搜索
													let data = SiriPegasusRequest.fromBinary(body);
													log(`🚧 data: ${JSON.stringify(data)}`, "");
													let UF = UnknownFieldHandler.list(data);
													//log(`🚧 UF: ${JSON.stringify(UF)}`, "");
													if (UF) {
														UF = UF.map(uf => {
															//uf.no; // 22
															//uf.wireType; // WireType.Varint
															// use the binary reader to decode the raw data:
															let reader = new BinaryReader(uf.data);
															let addedNumber = reader.int32(); // 7777
															log(`🚧 no: ${uf.no}, wireType: ${uf.wireType}, addedNumber: ${addedNumber}`, "");
														});
													}													data.queryContext = modifyPegasusQueryContext(data.queryContext, Settings);
													let fixLocation = true;
													data?.queries?.[0]?.unknown2002.forEach((unknown2002, index) => {
														switch (unknown2002?.n2?.supplement?.typeUrl) {
															case "type.googleapis.com/apple.parsec.siri.v2alpha.AppInfo":
																/******************  initialization start  *******************/
																class ApplicationInfomationRequest$Type extends MessageType {
																	constructor() {
																		super("ApplicationInfomationRequest", [
																			{ no: 2, name: "bundleID", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
																			{ no: 4, name: "launchIntent", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
																		]);
																	}
																}
																const ApplicationInfomationRequest = new ApplicationInfomationRequest$Type();
																/******************  initialization finish  *******************/
																const AppInfo = ApplicationInfomationRequest.fromBinary(unknown2002?.n2?.supplement?.value);
																log(`🚧 AppInfo: ${JSON.stringify(AppInfo)}`, "");
																switch (AppInfo?.bundleID) {
																	case "com.apple.weather":
																	case "com.heweather.weatherapp":
																		fixLocation = false;
																		break;
																	case "com.apple.store.Jolly":
																		fixLocation = false;
																		break;
																	case "com.apple.Music":
																	case "com.apple.AppStore":
																		fixLocation = false;
																		break;
																}																break;
														}													});
													if (fixLocation) delete data?.queryContext?.location;
													log(`🚧 data: ${JSON.stringify(data)}`, "");
													body = SiriPegasusRequest.toBinary(data);
													break;
												}												case "/apple.parsec.lookup.v1alpha.LookupSearch/LookupSearch": { // 查询搜索
													/******************  initialization start  *******************/
													class LookupSearchRequest$Type extends MessageType {
														constructor() {
															super("LookupSearchRequest", [
																//{ no: 1, name: "queries", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Query },
																{ no: 2, name: "queryContext", kind: "message", T: () => PegasusQueryContext }
															]);
														}
													}
													const LookupSearchRequest = new LookupSearchRequest$Type();
													/******************  initialization finish  *******************/
													let data = LookupSearchRequest.fromBinary(body);
													log(`🚧 data: ${JSON.stringify(data)}`, "");
													let UF = UnknownFieldHandler.list(data);
													//log(`🚧 UF: ${JSON.stringify(UF)}`, "");
													if (UF) {
														UF = UF.map(uf => {
															//uf.no; // 22
															//uf.wireType; // WireType.Varint
															// use the binary reader to decode the raw data:
															let reader = new BinaryReader(uf.data);
															let addedNumber = reader.int32(); // 7777
															log(`🚧 no: ${uf.no}, wireType: ${uf.wireType}, addedNumber: ${addedNumber}`, "");
														});
													}													data.queryContext = modifyPegasusQueryContext(data.queryContext, Settings);
													log(`🚧 data: ${JSON.stringify(data)}`, "");
													body = LookupSearchRequest.toBinary(data);
													break;
												}												case "/apple.parsec.responseframework.engagement.v1alpha.EngagementSearch/EngagementSearch": { //
													/******************  initialization start  *******************/
													class EngagementRequest$Type extends MessageType {
														constructor() {
															super("EngagementRequest", [
																{ no: 1, name: "queryContext", kind: "message", T: () => PegasusQueryContext }
															]);
														}
													}
													const EngagementRequest = new EngagementRequest$Type();
													/******************  initialization finish  *******************/
													let data = EngagementRequest.fromBinary(body);
													log(`🚧 data: ${JSON.stringify(data)}`, "");
													let UF = UnknownFieldHandler.list(data);
													//log(`🚧 UF: ${JSON.stringify(UF)}`, "");
													if (UF) {
														UF = UF.map(uf => {
															//uf.no; // 22
															//uf.wireType; // WireType.Varint
															// use the binary reader to decode the raw data:
															let reader = new BinaryReader(uf.data);
															let addedNumber = reader.int32(); // 7777
															log(`🚧 no: ${uf.no}, wireType: ${uf.wireType}, addedNumber: ${addedNumber}`, "");
														});
													}													data.queryContext = modifyPegasusQueryContext(data.queryContext, Settings);
													log(`🚧 data: ${JSON.stringify(data)}`, "");
													body = EngagementRequest.toBinary(data);
													break;
												}												case "/apple.parsec.spotlight.v1alpha.ZkwSuggestService/Suggest": { // 新闻建议
													/******************  initialization start  *******************/
													class ZkwSuggestRequest$Type extends MessageType {
														constructor() {
															super("ZkwSuggestRequest", [
																//{ no: 1, name: "queries", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Query },
																{ no: 2, name: "queryContext", kind: "message", T: () => PegasusQueryContext }
															]);
														}
													}
													const ZkwSuggestRequest = new ZkwSuggestRequest$Type();
													/******************  initialization finish  *******************/
													let data = ZkwSuggestRequest.fromBinary(body);
													log(`🚧 data: ${JSON.stringify(data)}`, "");
													let UF = UnknownFieldHandler.list(data);
													//log(`🚧 UF: ${JSON.stringify(UF)}`, "");
													if (UF) {
														UF = UF.map(uf => {
															//uf.no; // 22
															//uf.wireType; // WireType.Varint
															// use the binary reader to decode the raw data:
															let reader = new BinaryReader(uf.data);
															let addedNumber = reader.int32(); // 7777
															log(`🚧 no: ${uf.no}, wireType: ${uf.wireType}, addedNumber: ${addedNumber}`, "");
														});
													}													data.queryContext = modifyPegasusQueryContext(data.queryContext, Settings);
													log(`🚧 data: ${JSON.stringify(data)}`, "");
													body = ZkwSuggestRequest.toBinary(data);
													break;
												}											}											break;
									}									rawBody = addgRPCHeader({ header, body }); // gzip压缩有问题，别用
									//rawBody = body;
									break;
							}							// 写入二进制数据
							$request.body = rawBody;
							break;
					}					//break; // 不中断，继续处理URL
				case "GET":
				case "HEAD":
				case "OPTIONS":
				default:
					Locale = Locale ?? url.searchParams.get("locale");
					[Language, CountryCode] = Locale?.split("_") ?? [];
					log(`🚧 Locale: ${Locale}, Language: ${Language}, CountryCode: ${CountryCode}`, "");
					switch (Settings.CountryCode) {
						case "AUTO":
							Settings.CountryCode = CountryCode;
							break;
						default:
							if (url.searchParams.has("cc")) url.searchParams.set("cc", Settings.CountryCode);
							break;
					}					// 主机判断
					switch (HOST) {
						case "api.smoot.apple.com":
						case "api.smoot.apple.cn":
							break;
						case "guzzoni.smoot.apple.com":
							break;
						case "fbs.smoot.apple.com":
							break;
						case "cdn.smoot.apple.com":
							break;
						case "api-siri.smoot.apple.com":
						default: // 其他主机
							let q = url.searchParams.get("q");
							// 路径判断
							switch (PATH) {
								case "/search": // 搜索
									switch (url.searchParams.get("qtype")) {
										case "zkw": // 处理"新闻"小组件
											switch (Settings.CountryCode) {
												case "CN":
												case "HK":
												case "MO":
												case "TW":
												case "SG":
													url.searchParams.set("locale", `${Language}_SG`);
													break;
												case "US":
												case "CA":
												case "UK":
												case "AU":
													// 不做修正
													break;
												default:
													url.searchParams.set("locale", `${Language}_US`);
													break;
											}											break;
										default: // 其他搜索
											if (q?.startsWith?.("%E5%A4%A9%E6%B0%94%20")) { // 处理"天气"搜索，搜索词"天气 "开头
												console.log("'天气 '开头");
												url.searchParams.set("q", q.replace(/%E5%A4%A9%E6%B0%94/, "weather")); // "天气"替换为"weather"
												if (/^weather%20.*%E5%B8%82$/.test(q)) url.searchParams.set("q", q.replace(/$/, "%E5%B8%82"));
											} else if (q?.endsWith?.("%20%E5%A4%A9%E6%B0%94")) {// 处理"天气"搜索，搜索词" 天气"结尾
												console.log("' 天气'结尾");
												url.searchParams.set("q", q.replace(/%E5%A4%A9%E6%B0%94/, "weather")); // "天气"替换为"weather"
												if (/.*%E5%B8%82%20weather$/.test(q)) url.searchParams.set("q", q.replace(/%20weather$/, "%E5%B8%82%20weather"));
											}											break;
									}									break;
								case "/card": // 卡片
									switch (url.searchParams.get("include")) {
										case "tv":
										case "movies":
											url.searchParams.set("card_locale", `${Language}_${Settings.CountryCode}`);
											const storefront = url.searchParams.get("storefront")?.match(/[\d]{6}/g);
											switch (storefront) { //StoreFront ID, from App Store Region
												case "143463": // HK
													url.searchParams.set("q", q.replace(/%2F[a-z]{2}-[A-Z]{2}/, "%2Fzh-HK"));
													break;
												case "143464": // SG
													url.searchParams.set("q", q.replace(/%2F[a-z]{2}-[A-Z]{2}/, "%2Fzh-SG"));
													break;
												case "143465": // CN
													url.searchParams.set("q", q.replace(/%2F[a-z]{2}-[A-Z]{2}/, "%2Fzh-HK"));
													break;
												case "143470": // TW
													url.searchParams.set("q", q.replace(/%2F[a-z]{2}-[A-Z]{2}/, "%2Fzh-TW"));
													break;
											}											break;
										case "apps":
										case "music":
											url.searchParams.set("card_locale", `${Language}_${Settings.CountryCode}`);
											break;
										case "dictionary":
											switch (Language) {
												case "zh-Hans":
												case "zh-Hant":
													url.searchParams.set("card_locale", `en_${Settings.CountryCode}`);
													break;
											}											break;
										default:
											url.searchParams.set("card_locale", `${Language}_${Settings.CountryCode}`);
											break;
									}									break;
							}							break;
					}					break;
				case "CONNECT":
				case "TRACE":
					break;
			}			$request.url = url.toString();
			log(`🚧 调试信息`, `$request.url: ${$request.url}`, "");
			break;
		case false:
			break;
	}})()
	.catch((e) => logError(e))
	.finally(() => {
		switch ($response) {
			default: // 有构造回复数据，返回构造的回复数据
				//log(`🚧 finally`, `echo $response: ${JSON.stringify($response, null, 2)}`, "");
				if ($response.headers?.["Content-Encoding"]) ;
				if ($response.headers?.["content-encoding"]) ;
				switch ($platform) {
					default:
						done($response);
						break;
					case "Quantumult X":
						if (!$response.status) $response.status = 200;
						delete $response.headers?.["Content-Length"];
						delete $response.headers?.["content-length"];
						delete $response.headers?.["Transfer-Encoding"];
						done({ response: $response });
						break;
				}				break;
			case undefined: // 无构造回复数据，发送修改的请求数据
				//log(`🚧 finally`, `$request: ${JSON.stringify($request, null, 2)}`, "");
				done($request);
				break;
		}	});
