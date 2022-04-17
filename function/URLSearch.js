function URLSearch(opts) {
	return new (class {
		constructor(opts = []) {
			this.name = "urlParams v1.0.0";
			this.opts = opts;
			this.json = { url: { scheme, host, path }, params };
		};

		parse(string) {
			//const Params = Object.fromEntries(url.split("?")[1].split("&").map((item) => item.split("=")));
			let [url, params] = string.split(/\?(.*)/, 2);
			$.log(`🚧 ${$.name}, URLSearch`, `URL.split(/\?(.*)/,2): ${[url, params]}`, "");
			let [scheme, host, path] = url.split(/\/+(.+)/, 3);
			$.log(`🚧 ${$.name}, URLSearch`, `url.split(/\/+(.+)/,3): ${[scheme, host, path]}`, "");
			//let params = url.split("?")[1];
			//$.log(`🚧 ${$.name}, URLSearch`, `url.split("?")[1]: ${JSON.stringify(params)}`, "");
			params = params.split("&");
			$.log(`🚧 ${$.name}, URLSearch`, `params.split("&"): ${JSON.stringify(params)}`, "");
			params = params.map((param) => param.split("="));
			$.log(`🚧 ${$.name}, URLSearch`, `params.map((param) => param.split("=")): ${JSON.stringify(params)}`, "");
			params = Object.fromEntries(params);
			$.log(`🚧 ${$.name}, URLSearch`, `Object.fromEntries(params): ${JSON.stringify(params)}`, "");
			const json = { url: { scheme, host, path }, params };
			$.log(`🚧 ${$.name}, URLSearch`, `params.map((param) => param.split("=")): ${JSON.stringify(json)}`, "");
			return json
		};

		stringify(json = this.json) {
			const string = json.scheme + "//" + json.host + "/" + json.path + "?" + json.params.map((param) => Object.Entries(param).join("=")).join("&");
			$.log(`🚧 ${$.name}, URLSearch`, `url: ${url}`, "");
			return string
		};
	})(opts)
}