/*
README:https://github.com/VirgilClyne/iRingo
*/
let countryCode = "TW";

if (typeof $argument != "undefined") {
    let arg = Object.fromEntries($argument.split("&").map((item) => item.split("=")));
    console.log(JSON.stringify(arg));
    GeoCountryCode = arg.GeoCountryCode;
};

const url = $request.url;
var body = $response.body;

const path1 = "/uts/v3/configurations";

if (url.indexOf(path1) != -1) {
    let configurations = JSON.parse(body);
    configurations.data.applicationProps.requiredParamsMap.WithoutUtsk.locale = "zh_Hans";
    configurations.data.applicationProps.requiredParamsMap.Default.locale = "zh_Hans";
    configurations.data.applicationProps.tabs[0] = {
        "universalLinks": [
            "https:\/\/tv.apple.com\/watch-now"
        ],
        "title": "立即观看",
        "destinationType": "Target",
        "target": {
            "id": "tahoma_watchnow",
            "type": "Root",
            "url": "https:\/\/tv.apple.com\/watch-now"
        },
        "type": "WatchNow"
    },

    configurations.data.applicationProps.tabs[1] = {
        "universalLinks": [
            "https:\/\/tv.apple.com\/channel\/tvs.sbd.4000",
            "https:\/\/tv.apple.com\/atv"
        ],
        "title": "Apple TV+",
        "destinationType": "Target",
        "target": {
            "id": "tvs.sbd.4000",
            "type": "Brand",
            "url": "https:\/\/tv.apple.com\/us\/channel\/tvs.sbd.4000"
        },
        "type": "Originals"
    },

    configurations.data.applicationProps.tabs[2] = {
        "universalLinks": [
            "https:\/\/tv.apple.com\/movies"
        ],
        "title": "电影",
        "destinationType": "Target",
        "secondaryEnabled": true,
        "target": {
            "id": "tahoma_movies",
            "type": "Root",
            "url": "https:\/\/tv.apple.com\/movies"
        },
        "type": "Movies"
    },

    configurations.data.applicationProps.tabs[3] = {
        "universalLinks": [
            "https:\/\/tv.apple.com\/tv-shows"
        ],
        "title": "电视节目",
        "destinationType": "Target",
        "secondaryEnabled": true,
        "target": {
            "id": "tahoma_tvshows",
            "type": "Root",
            "url": "https:\/\/tv.apple.com\/tv-shows"
        },
        "type": "TV"
    },

    configurations.data.applicationProps.tabs[4] = {
        "universalLinks": [
            "https:\/\/tv.apple.com\/sports"
        ],
        "title": "体育节目",
        "destinationType": "Target",
        "secondaryEnabled": true,
        "target": {
            "id": "tahoma_sports",
            "type": "Root",
            "url": "https:\/\/tv.apple.com\/sports"
        },
        "type": "Sports"
    },

    configurations.data.applicationProps.tabs[5] = {
        "title": "资料库",
        "type": "Library",
        "destinationType": "Client"
    },

    configurations.data.applicationProps.tabs[6] = {
        "universalLinks": [
            "https:\/\/tv.apple.com\/search"
        ],
        "title": "搜索",
        "destinationType": "Target",
        "target": {
            "id": "tahoma_searchlanding",
            "type": "Root",
            "url": "https:\/\/tv.apple.com\/search"
        },
        "type": "Search"
    }
    configurations.data.applicationProps.tvAppEnabledInStorefront = true;
    configurations.data.applicationProps.enabledClientFeatures = [
        {
            "name": "expanse",
            "domain": "tvapp"
        },
        {
            "name": "syndication",
            "domain": "tvapp"
        },
        {
            "name": "snwpcr",
            "domain": "tvapp"
        }
    ];
    configurations.data.applicationProps.storefront.localesSupported = ["zh_Hans", "zh_Hant", "en_US", "en_GB"];
    configurations.data.applicationProps.storefront.storefrontId = 143470;
    configurations.data.applicationProps.featureEnablers = {
        "topShelf": true,
        "unw": true,
        "imageBasedSubtitles": true,
        "ageVerification": true,
        "seasonTitles": true
    };
    configurations.data.userProps.activeUser = true;
    configurations.data.userProps.utsc = "1:18943";
    configurations.data.userProps.countryCode = countryCode;
    configurations.data.userProps.gac = true;
    body = JSON.stringify(configurations);
    console.log('configurations');
}

$done({ body });
