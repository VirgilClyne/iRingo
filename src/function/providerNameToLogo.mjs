export default function providerNameToLogo(providerName, version) {
    console.log(`☑️ providerNameToLogo, providerName: ${providerName}, version: ${version}`, "");
    let providerLogo;
    switch (providerName?.split("\n")?.[0]) {
        case "WAQI":
        case "World Air Quality Index Project":
            switch (version) {
                case "v1":
                    providerLogo = "https://waqi.info/images/logo.png";
                    break;
                case "v2":
                    providerLogo = `https://raw.githubusercontent.com/VirgilClyne/iRingo/main/src/icon/${version}/WAQI.png`;
                    break;
            };
            break;
        case "ColofulClouds":
        case "彩云天气":
            providerLogo = `https://raw.githubusercontent.com/VirgilClyne/iRingo/main/src/icon/${version}/ColorfulClouds.png`;
            break;
        case "气象在线":
        case "WeatherOL":
            providerLogo = `https://raw.githubusercontent.com/VirgilClyne/iRingo/main/src/icon/${version}/WeatherOL.png`;
            break;
        case "QWeather":
        case "和风天气":
            providerLogo = `https://weatherkit.apple.com/assets/${version}/QWeather.png`;
            break;
        case "The Weather Channel":
            providerLogo = `https://weatherkit.apple.com/assets/${version}/TWC.png`;
            break;
        case "BreezoMeter":
            providerLogo = `https://weatherkit.apple.com/assets/${version}/BreezoMeter.png`;
            break;
        default:
            break;
    };
    console.log(`✅ providerNameToLogo`, "");
    return providerLogo;
};
