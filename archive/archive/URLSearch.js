function URLSearch(opts) {
	return new (class {
		constructor(opts = []) {
			this.name = "urlParams v1.0.0";
			this.opts = opts;
			this.json = { url: { scheme: "", host: "", path: "" }, params: {} };
		};

		parse(url) {
			const URLRegex = /(?<scheme>.+):\/\/(?<host>[^/]+)\/?(?<path>[^?]+)?\??(?<params>.*)?/;
			let json = url.match(URLRegex)?.groups ?? null;
			//$.log(`🚧 ${$.name}, URLSearch`, `url.match(URLRegex)?.groups: ${JSON.stringify(json)}`, "");
			if (json?.params) json.params = Object.fromEntries(json.params.split("&").map((param) => param.split("=")));
			//$.log(`🚧 ${$.name}, URLSearch`, `Object.fromEntries(json.params.split("&").map((item) => item.split("="))): ${JSON.stringify(json?.params)}`, "");
			//$.log(`🚧 ${$.name}, URLSearch`, `json: ${JSON.stringify(json)}`, "");
			return json
		};

		stringify(json = this.json) {
			const url = (json?.params) ? json.scheme + "://" + json.host + "/" + json.path + "?" + Object.entries(json.params).map(param => param.join("=")).join("&")
				: json.scheme + "://" + json.host + "/" + json.path;
			//$.log(`🚧 ${$.name}, URLSearch`, `url: ${url}`, "");
			return url
		};
	})(opts)
}