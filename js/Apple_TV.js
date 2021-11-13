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
    /*
    configurations.data.applicationProps.routes = {
        "getShowMetadataById": {
          "path": "\/uts\/v3\/shows\/{showId}\/metadata",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/shows\/{showId}\/metadata"
        },
        "getFavoriteTeams": {
          "path": "\/uts\/v3\/favorite-teams",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/favorite-teams"
        },
        "browseTv": {
          "path": "\/uts\/v2\/browse\/tv",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/browse\/tv"
        },
        "getCanvasById": {
          "path": "\/uts\/v3\/canvases\/{canvasId}",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/canvases\/{canvasId}"
        },
        "getSharedWithYouShelf": {
          "path": "\/uts\/v3\/shelves\/shared-with-you",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/shelves\/shared-with-you"
        },
        "getSeasonDetailById": {
          "path": "\/uts\/v3\/shows\/{showId}\/{seasonId}",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/shows\/{showId}\/{seasonId}"
        },
        "removeFromWatchlist": {
          "path": "\/uts\/v3\/watchlist",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/watchlist"
        },
        "getPersonalizedInfo": {
          "path": "\/uts\/v3\/contents\/{id}\/personalized-flags",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/contents\/{id}\/personalized-flags"
        },
        "sportsStatsIdLookup": {
          "path": "\/uts\/v2\/sports\/statsIdLookup",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/sports\/statsIdLookup"
        },
        "brandsGet": {
          "path": "\/uts\/v2\/brands\/",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/brands"
        },
        "activityPlay": {
          "path": "\/play",
          "needsLocation": true,
          "host": "https:\/\/np-edge.itunes.apple.com",
          "needsMescal": true,
          "requiredParamsType": "Default",
          "url": "https:\/\/np-edge.itunes.apple.com\/play"
        },
        "browseSports": {
          "path": "\/uts\/v2\/browse\/sports",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/browse\/sports"
        },
        "browseMain": {
          "path": "\/uts\/v2\/browse\/main",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/browse\/main"
        },
        "getUpNextWidgetShelf": {
          "path": "\/uts\/v3\/shelves\/up-next-widget",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/shelves\/up-next-widget"
        },
        "getFavoritePeople": {
          "path": "\/uts\/v3\/favorite-people",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/favorite-people"
        },
        "getCollectionById": {
          "path": "\/uts\/v3\/shelves\/{collectionId}",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/shelves\/{collectionId}"
        },
        "postWatchlistContinueWatchingRemove": {
          "path": "\/uts\/v2\/watchlist\/continueWatching\/remove",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/watchlist\/continueWatching\/remove"
        },
        "showEpisodeNextepisode": {
          "path": "\/uts\/v2\/show\/{showId}\/episode\/{episodeId}\/next-episode",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/show\/{showId}\/episode\/{episodeId}\/next-episode"
        },
        "viewShow": {
          "path": "\/uts\/v2\/view\/show\/{id}",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/view\/show\/{id}"
        },
        "getMovieBundleDetailById": {
          "path": "\/uts\/v3\/movie-bundles\/{movieBundleId}",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/movie-bundles\/{movieBundleId}"
        },
        "getShowEpisodes": {
          "path": "\/uts\/v3\/shows\/{showId}\/episodes",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/shows\/{showId}\/episodes"
        },
        "browseRoot": {
          "path": "\/uts\/v2\/browse\/root\/{rootName}",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/browse\/root\/{rootName}"
        },
        "getSearchHints": {
          "path": "\/uts\/v3\/search\/hints",
          "needsLocation": false,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "WithoutUtsk",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/search\/hints"
        },
        "genreDetail": {
          "path": "\/uts\/v2\/genre\/detail\/{id}",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/genre\/detail\/{id}"
        },
        "getEpisodeDetailById": {
          "path": "\/uts\/v3\/episodes\/{episodeId}",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/episodes\/{episodeId}"
        },
        "getSearchLanding": {
          "path": "\/uts\/v3\/search\/landing",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/search\/landing"
        },
        "postFavAdd": {
          "path": "\/uts\/v2\/favorites\/add",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/favorites\/add"
        },
        "browseWatchNow": {
          "path": "\/uts\/v2\/browse\/watchNow",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/browse\/watchNow"
        },
        "watchlistPlayHistory": {
          "path": "\/uts\/v2\/watchlist\/playHistory",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/watchlist\/playHistory"
        },
        "browseChannel": {
          "path": "\/uts\/v2\/browse\/channel\/{brandId}",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/browse\/channel\/{brandId}"
        },
        "getLiveService": {
          "path": "\/uts\/v3\/live-services\/{liveServiceId}",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/live-services\/{liveServiceId}"
        },
        "getRatings": {
          "path": "\/uts\/v3\/ratings",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/ratings"
        },
        "showSmartepisode": {
          "path": "\/uts\/v2\/show\/{showId}\/smart-episode",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/show\/{showId}\/smart-episode"
        },
        "activityDecorateLiveEbs": {
          "path": "\/uts\/v2\/activity\/decorate\/live\/ebs",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/activity\/decorate\/live\/ebs"
        },
        "browseStore": {
          "path": "\/uts\/v2\/browse\/store",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/browse\/store"
        },
        "personGet": {
          "path": "\/uts\/v2\/person\/get",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/person\/get"
        },
        "getMovieDetailById": {
          "path": "\/uts\/v3\/movies\/{movieId}",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/movies\/{movieId}"
        },
        "activityPlayablesDecorate": {
          "path": "\/uts\/v2\/activity\/playables\/decorate",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/activity\/playables\/decorate"
        },
        "brands": {
          "path": "\/uts\/v2\/brands\/{brandIdOrSkuAdamId}",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/brands\/{brandIdOrSkuAdamId}"
        },
        "browseForYou": {
          "path": "\/uts\/v2\/browse\/forYou",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/browse\/forYou"
        },
        "siriGetLiveServices": {
          "path": "\/uts\/v3\/siri\/live-services",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/siri\/live-services"
        },
        "getPlayNextShelf": {
          "path": "\/uts\/v3\/shelves\/play-next",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/shelves\/play-next"
        },
        "genreGet": {
          "path": "\/uts\/v2\/genre\/get",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/genre\/get"
        },
        "getEpisodeMetadataById": {
          "path": "\/uts\/v3\/episodes\/{episodeId}\/metadata",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/episodes\/{episodeId}\/metadata"
        },
        "contentGet": {
          "path": "\/uts\/v2\/content\/get",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/content\/get"
        },
        "viewProduct": {
          "path": "\/uts\/v2\/view\/product\/{id}",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/view\/product\/{id}"
        },
        "siriBestPlayableForStatsIds": {
          "path": "\/uts\/v2\/siri\/bestPlayableForStatsIds",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/siri\/bestPlayableForStatsIds"
        },
        "deleteFavoriteTeam": {
          "path": "\/uts\/v3\/favorite-teams",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/favorite-teams"
        },
        "deleteFavoritePerson": {
          "path": "\/uts\/v3\/favorite-people",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/favorite-people"
        },
        "favoritesContains": {
          "path": "\/uts\/v2\/watchlist\/contains",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/watchlist\/contains"
        },
        "postFavoritePerson": {
          "path": "\/uts\/v3\/favorite-people",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/favorite-people"
        },
        "getNextEpisode": {
          "path": "\/uts\/v3\/shows\/{showId}\/episodes\/{episodeId}\/next-episode",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/shows\/{showId}\/episodes\/{episodeId}\/next-episode"
        },
        "searchIncremental": {
          "path": "\/uts\/v2\/search\/incremental",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/search\/incremental"
        },
        "browseCanvas": {
          "path": "\/uts\/v2\/browse\/canvas\/{canvasId}",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/browse\/canvas\/{canvasId}"
        },
        "getChannelsById": {
          "path": "\/uts\/v3\/channels\/{channelId}",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "WithoutUtsk",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/channels\/{channelId}"
        },
        "getReverseLookupCanonicalIdsByExternalId": {
          "path": "\/uts\/v3\/contents\/lookup",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/contents\/lookup"
        },
        "getPlayablesForContent": {
          "path": "\/uts\/v3\/playables\/{canonicalId}",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/playables\/{canonicalId}"
        },
        "getClientFeatures": {
          "path": "\/uts\/v3\/features\/client",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/features\/client"
        },
        "getServerFeatures": {
          "path": "\/uts\/v3\/features\/server",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/features\/server"
        },
        "siri-personalizedSearch": {
          "path": "\/uts\/v2\/siri-personalized\/search",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/siri-personalized\/search"
        },
        "siriInit": {
          "path": "\/uts\/v2\/siri\/init",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/siri\/init"
        },
        "siriSearch": {
          "path": "\/uts\/v2\/siri\/",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/siri"
        },
        "getSportingEventById": {
          "path": "\/uts\/v3\/sporting-events\/{sportingEventId}",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/sporting-events\/{sportingEventId}"
        },
        "siri-personalizedUpNext": {
          "path": "\/uts\/v2\/siri-personalized\/upNext",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/siri-personalized\/upNext"
        },
        "getSeasonMetadataById": {
          "path": "\/uts\/v3\/seasons\/{seasonId}\/metadata",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/seasons\/{seasonId}\/metadata"
        },
        "contentEpisodes": {
          "path": "\/uts\/v2\/content\/{showOrSeasonId}\/episodes",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/content\/{showOrSeasonId}\/episodes"
        },
        "siriAvailabilityForStatsIds": {
          "path": "\/uts\/v2\/siri\/availabilityForStatsIds",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/siri\/availabilityForStatsIds"
        },
        "postFavoriteTeam": {
          "path": "\/uts\/v3\/favorite-teams",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/favorite-teams"
        },
        "searchLanding": {
          "path": "\/uts\/v2\/search\/landing",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/search\/landing"
        },
        "shelfTopshelf": {
          "path": "\/uts\/v2\/shelf\/top-shelf",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/shelf\/top-shelf"
        },
        "siriSearchWatchlist": {
          "path": "\/uts\/v3\/siri\/watchlist",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/siri\/watchlist"
        },
        "viewShowPlayables": {
          "path": "\/uts\/v2\/view\/show\/{id}\/playables",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/view\/show\/{id}\/playables"
        },
        "browseMovies": {
          "path": "\/uts\/v2\/browse\/movies",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/browse\/movies"
        },
        "browseVideoClip": {
          "path": "\/uts\/v2\/browse\/videoClip\/{videoClipId}",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/browse\/videoClip\/{videoClipId}"
        },
        "getTopShelf": {
          "path": "\/uts\/v3\/shelves\/top-shelf",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/shelves\/top-shelf"
        },
        "viewShowEpisodes": {
          "path": "\/uts\/v2\/view\/show\/{id}\/episodes",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/view\/show\/{id}\/episodes"
        },
        "browseRoom": {
          "path": "\/uts\/v2\/browse\/room\/{roomId}",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/browse\/room\/{roomId}"
        },
        "favoritesSearch": {
          "path": "\/uts\/v2\/watchlist\/search",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/watchlist\/search"
        },
        "siriSmartPlay": {
          "path": "\/uts\/v3\/siri\/smart-play",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/siri\/smart-play"
        },
        "sportsTeamsNearMe": {
          "path": "\/uts\/v2\/sports\/teamsNearMe",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/sports\/teamsNearMe"
        },
        "getCanvasBinding": {
          "path": "\/uts\/v3\/canvases\/{canvasType}\/{entityId}",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/canvases\/{canvasType}\/{entityId}"
        },
        "getChannels": {
          "path": "\/uts\/v3\/channels",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "WithoutUtsk",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/channels"
        },
        "browseSportsGroup": {
          "path": "\/uts\/v2\/browse\/sports\/group\/{leagueOrSportId}",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/browse\/sports\/group\/{leagueOrSportId}"
        },
        "showItunesSeasons": {
          "path": "\/uts\/v2\/show\/{showId}\/itunesSeasons",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/show\/{showId}\/itunesSeasons"
        },
        "contentPlay": {
          "path": "\/uts\/v2\/content\/{id}\/play",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/content\/{id}\/play"
        },
        "getEditorialFeatures": {
          "path": "\/uts\/v3\/features\/editorial",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/features\/editorial"
        },
        "brandsAppleTvPlus": {
          "path": "\/uts\/v2\/brands\/appleTvPlus",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/brands\/appleTvPlus"
        },
        "siri-personalizedBestPlayableForStatsIds": {
          "path": "\/uts\/v2\/siri-personalized\/bestPlayableForStatsIds",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/siri-personalized\/bestPlayableForStatsIds"
        },
        "getMovieMetadataById": {
          "path": "\/uts\/v3\/movies\/{movieId}\/metadata",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/movies\/{movieId}\/metadata"
        },
        "getStorefronts": {
          "path": "\/uts\/v3\/storefronts",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/storefronts"
        },
        "addToWatchlist": {
          "path": "\/uts\/v3\/watchlist",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/watchlist"
        },
        "siriNowPlaying": {
          "path": "\/uts\/v2\/siri\/nowPlaying",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/siri\/nowPlaying"
        },
        "getSearchResults": {
          "path": "\/uts\/v3\/search",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/search"
        },
        "siri-personalizedSearchLiveServices": {
          "path": "\/uts\/v2\/siri-personalized\/searchLiveServices",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/siri-personalized\/searchLiveServices"
        },
        "removeItemFromPlayHistory": {
          "path": "\/uts\/v3\/play-history\/{id}",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/play-history\/{id}"
        },
        "browseWebLanding": {
          "path": "\/uts\/v2\/browse\/webLanding",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/browse\/webLanding"
        },
        "personDetail": {
          "path": "\/uts\/v2\/person\/detail\/{id}",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/person\/detail\/{id}"
        },
        "getContentMetadataById": {
          "path": "\/uts\/v3\/contents",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/contents"
        },
        "browseGenre": {
          "path": "\/uts\/v2\/browse\/genre\/{genreId}",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/browse\/genre\/{genreId}"
        },
        "sportsLeague": {
          "path": "\/uts\/v2\/sports\/league",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/sports\/league"
        },
        "initFeatures": {
          "path": "\/uts\/v2\/init\/features",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/init\/features"
        },
        "episodeItunesSeasons": {
          "path": "\/uts\/v2\/episode\/{episodeId}\/itunesSeasons",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/episode\/{episodeId}\/itunesSeasons"
        },
        "postFavoritesAdd": {
          "path": "\/uts\/v2\/watchlist\/add",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/watchlist\/add"
        },
        "postWatchlistMarkAsWatched": {
          "path": "\/uts\/v2\/watchlist\/markAsWatched",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/watchlist\/markAsWatched"
        },
        "favorites": {
          "path": "\/uts\/v2\/favorites",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/favorites"
        },
        "siriPlay": {
          "path": "\/uts\/v2\/siri\/play",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/siri\/play"
        },
        "postFavoritesRemove": {
          "path": "\/uts\/v2\/watchlist\/remove",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/watchlist\/remove"
        },
        "browseChannelCollection": {
          "path": "\/uts\/v2\/browse\/channelCollection\/{brandId}",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/browse\/channelCollection\/{brandId}"
        },
        "browseTopShelf": {
          "path": "\/uts\/v2\/browse\/topShelf",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/browse\/topShelf"
        },
        "getTabs": {
          "path": "\/uts\/v3\/tabs",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/tabs"
        },
        "getShowDetailById": {
          "path": "\/uts\/v3\/shows\/{showId}",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/shows\/{showId}"
        },
        "postFavRemove": {
          "path": "\/uts\/v2\/favorites\/remove",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/favorites\/remove"
        },
        "watchlistContinueWatching": {
          "path": "\/uts\/v2\/watchlist\/continueWatching",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/watchlist\/continueWatching"
        },
        "getPostPlayShelf": {
          "path": "\/uts\/v3\/shelves\/post-play\/{contentId}",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/shelves\/post-play\/{contentId}"
        },
        "sportsClockscore": {
          "path": "\/uts\/v2\/sports\/clockscore",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/sports\/clockscore"
        },
        "sportsCompetitors": {
          "path": "\/uts\/v2\/sports\/competitors",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/sports\/competitors"
        },
        "watchlistTopShelf": {
          "path": "\/uts\/v2\/watchlist\/topShelf",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/watchlist\/topShelf"
        },
        "siriGetContent": {
          "path": "\/uts\/v3\/siri\/content",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/siri\/content"
        },
        "browsePerson": {
          "path": "\/uts\/v2\/browse\/person\/{personId}",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/browse\/person\/{personId}"
        },
        "browseKids": {
          "path": "\/uts\/v2\/browse\/kids",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/browse\/kids"
        },
        "getSportingEventMetadataById": {
          "path": "\/uts\/v3\/sporting-events\/{sportingEventId}\/metadata",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/sporting-events\/{sportingEventId}\/metadata"
        },
        "browseCollection": {
          "path": "\/uts\/v2\/browse\/collection\/{collectionId}",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/browse\/collection\/{collectionId}"
        },
        "markItemAsWatched": {
          "path": "\/uts\/v3\/play-history",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v3\/play-history"
        },
        "sportsLeagues": {
          "path": "\/uts\/v2\/sports\/leagues",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/sports\/leagues"
        },
        "contentPlayables": {
          "path": "\/uts\/v2\/content\/{id}\/playables",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/content\/{id}\/playables"
        },
        "activityDecorateLive": {
          "path": "\/uts\/v2\/activity\/decorate\/live",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/activity\/decorate\/live"
        },
        "viewProductPersonalized": {
          "path": "\/uts\/v2\/view\/product\/{id}\/personalized",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/view\/product\/{id}\/personalized"
        },
        "postWatchlistPlayHistoryRemove": {
          "path": "\/uts\/v2\/watchlist\/playHistory\/remove",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/watchlist\/playHistory\/remove"
        },
        "browseEllisLeague": {
          "path": "\/uts\/v2\/browse\/ellis\/league\/{leagueId}",
          "needsLocation": true,
          "host": "https:\/\/uts-api.itunes.apple.com\/",
          "needsMescal": false,
          "requiredParamsType": "Default",
          "url": "https:\/\/uts-api.itunes.apple.com\/uts\/v2\/browse\/ellis\/league\/{leagueId}"
        }
      };
    configurations.data.applicationProps.routesupsellOnExitPolicy = {
        "displayWhenIsDone":true,
        "displayWhenPlaybackPercentage":85,
        "enabled":true,
        "brandRateLimitPolicy":{
            "max":3,
            "interval":{
                "type":"day",
                "period":1
            }
        },
        "showRateLimitPolicy":{
            "max":2,
            "interval":{
                "type":"day",
                "period":1
            }
        }
    };
    configurations.data.applicationProps.ratings = {
        "TW_TV":{
            "TW_TV_PG_12":{
                "ratingValue":350,
                "displayValue":"PG-12",
                "ratingCodeLabels":"PG-12",
                "description":"Suitable for persons aged 12 and above"
            },
            "TW_TV_PG_15":{
                "ratingValue":500,
                "displayValue":"PG-15",
                "ratingCodeLabels":"PG-15",
                "description":"Suitable for persons aged 15 and above"
            },
            "TW_TV_P":{
                "ratingValue":200,
                "displayValue":"P",
                "ratingCodeLabels":"P",
                "description":"Suitable for children aged 6 and above, with those between 6 and 12 years requiring parental, teacher or adult guidance"
            },
            "TW_TV_G":{
                "ratingValue":100,
                "displayValue":"G",
                "ratingCodeLabels":"G",
                "description":"Suitable without age restriction"
            },
            "TW_TV_R":{
                "ratingValue":600,
                "displayValue":"R",
                "ratingCodeLabels":"R",
                "description":"Suitable for adults 18 and above"
            }
        },
        "TW_MOVIES":{
            "TW_MOVIES_ALL":{
                "ratingValue":100,
                "displayValue":"普遍級",
                "ratingCodeLabels":"ALL",
                "description":"General audiences. Permitted for audiences of all ages."
            },
            "TW_MOVIES_18":{
                "ratingValue":400,
                "displayValue":"限制級",
                "ratingCodeLabels":"18",
                "description":"Restricted. Not permitted for those under 18"
            },
            "TW_MOVIES_15":{
                "ratingValue":350,
                "displayValue":"輔15級",
                "ratingCodeLabels":"15",
                "description":"Suitable for persons aged 15 and above"
            },
            "TW_MOVIES_12":{
                "ratingValue":300,
                "displayValue":"輔導級",
                "ratingCodeLabels":"12",
                "description":"Parental guidance. Not permitted for children under 12"
            },
            "TW_MOVIES_6":{
                "ratingValue":150,
                "displayValue":"保護級",
                "ratingCodeLabels":"6",
                "description":"Protected.  Not permitted for children under age 6; children between ages 6 and 12 must be under guidance"
            },
            "TW_MOVIES_UR":{
                "ratingValue":900,
                "displayValue":"未經分級",
                "ratingCodeLabels":"UR",
                "description":"Unrated"
            }
        }
    };
    */
    configurations.data.applicationProps.requiredParamsMap.WithoutUtsk.locale = "zh_Hans";
    configurations.data.applicationProps.requiredParamsMap.Default.locale = "zh_Hans";
    configurations.data.applicationProps.tabs = [
        {
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
        {
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
        {
          "universalLinks": [
            "https:\/\/tv.apple.com\/movies"
          ],
          "title": "电影",
          "destinationType": "Target",
          "target": {
            "id": "tahoma_movies",
            "type": "Root",
            "url": "https:\/\/tv.apple.com\/movies"
          },
          "type": "Movies"
        },
        {
          "universalLinks": [
            "https:\/\/tv.apple.com\/tv-shows"
          ],
          "title": "电视节目",
          "destinationType": "Target",
          "target": {
            "id": "tahoma_tvshows",
            "type": "Root",
            "url": "https:\/\/tv.apple.com\/tv-shows"
          },
          "type": "TV"
        },
        {
          "title": "资料库",
          "type": "Library",
          "destinationType": "Client"
        },
        {
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
      ];
    configurations.data.applicationProps.tvAppEnabledInStorefront = true;
    configurations.data.applicationProps.enabledClientFeatures = [
        {
            "name":"expanse",
            "domain":"tvapp"
        },
        {
            "name":"syndication",
            "domain":"tvapp"
        },
        {
            "name":"snwpcr",
            "domain":"tvapp"
        }
    ];
    configurations.data.applicationProps.storefront.localesSupported = ["zh_Hans","zh_Hant","en_US","en_GB"];
    configurations.data.applicationProps.storefront.storefrontId = 143470;
    configurations.data.applicationProps.featureEnablers = {
        "topShelf":true,
        "unw":true,
        "imageBasedSubtitles":true,
        "ageVerification":true,
        "seasonTitles":true
    };
    configurations.data.userProps.activeUser = true;
    configurations.data.userProps.utsc = "1:18943";
    configurations.data.userProps.countryCode = countryCode;
    configurations.data.userProps.gac = true;
    body = JSON.stringify(configurations);
    console.log('configurations');
}

$done({body});
