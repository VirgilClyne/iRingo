import ENV from "../ENV/ENV.mjs";

export default class WAQI {
    constructor(url = new URL(), options = {}) {
        this.Name = "WAQI";
        this.Version = "1.0.1";
        console.log(`\n🟧 ${this.Name} v${this.Version}\n`);
        this.url = $request.url;
        const RegExp = /^\/api\/(?<version>v1|v2|v3)\/(availability|weather)\/(?<language>[\w-_]+)\/(?<latitude>-?\d+\.\d+)\/(?<longitude>-?\d+\.\d+).*(?<countryCode>country=[A-Z]{2})?.*/i;
        const Parameters = (url?.pathname ?? url).match(RegExp)?.groups;
        this.version = Parameters?.version;
        this.language = Parameters?.language;
        this.latitude = Parameters?.latitude;
        this.longitude = Parameters?.longitude;
        this.country = Parameters?.countryCode ?? url?.searchParams?.get("country");
        Object.assign(this, options);
        console.log(`\n🟧 version: ${this.version} language: ${this.language}\n🟧 latitude: ${this.latitude} longitude: ${this.longitude}\n🟧 country: ${this.country}\n`);
    };

    Nearest(mapqVersion = "mapq2") {
        const url = `https://api.waqi.info/${mapqVersion}/nearest?n=1&geo=1/${this.latitude}/${this.longitude}`;
        console.log(`\n🟧 url: ${url}\n`);
        return url;
    };
};
