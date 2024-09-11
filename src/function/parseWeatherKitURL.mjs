export default function parseWeatherKitURL(url = new URL($request.url)) {
    console.log(`☑️ parseWeatherKitURL`, "");
    const RegExp = /^\/api\/(?<version>v1|v2|v3)\/(availability|weather)\/(?<language>\w+)(?:-\w+)?(-(?<country>[A-Z]{2}))?\/(?<latitude>-?\d+\.?\d*)\/(?<longitude>-?\d+\.?\d*)$/i;
    //const LanguageRegExp = /^(?<language>\w+(-\w+)?)-(?<country>[A-Z]{2})$/i;
    const Parameters = url?.pathname.match(RegExp)?.groups;
    let result = {
        "version": Parameters?.version,
        "language": Parameters?.language,
        "latitude": Parameters?.latitude,
        "longitude": Parameters?.longitude,
        "country": Parameters?.country || url?.searchParams?.get("country")
    };
    //console.log(JSON.stringify(result, null, 2), "");
    //const LanguageParameters = result.language.match(LanguageRegExp)?.groups;
    //result.language = LanguageParameters.language;
    //result.country = result.country || LanguageParameters.country
    console.log(`✅ parseWeatherKitURL\n🟧version: ${result.version} 🟧language: ${result.language} 🟧country: ${result.country}\n🟧latitude: ${result.latitude} 🟧longitude: ${result.longitude}\n`, "")
    return result;
}
