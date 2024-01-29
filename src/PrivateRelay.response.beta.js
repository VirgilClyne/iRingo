/*
README: https://github.com/VirgilClyne/iRingo
*/

import ENVs from "./ENV/ENV.mjs";
import URIs from "./URI/URI.mjs";
import setENV from "./function/setENV.mjs";

import * as Default from "./database/Default.json";
import * as Location from "./database/Location.json";
import * as News from "./database/News.json";
import * as PrivateRelay from "./database/PrivateRelay.json";
import * as Siri from "./database/Siri.json";
import * as TestFlight from "./database/TestFlight.json";
import * as TV from "./database/TV.json";

const $ = new ENVs(" iRingo: ☁️ iCloud Private Relay v1.0.3(1) response.beta");
const URI = new URIs();
const DataBase = {
	"Default": Default,
	"Location": Location,
	"News": News,
	"PrivateRelay": PrivateRelay,
	"Siri": Siri,
	"TestFlight": TestFlight,
	"TV": TV,
};

/***************** Processing *****************/
// 解构URL
const URL = URI.parse($request.url);
$.log(`⚠ ${$.name}`, `URL: ${JSON.stringify(URL)}`, "");
// 获取连接参数
const METHOD = $request.method, HOST = URL.host, PATH = URL.path, PATHs = URL.paths;
$.log(`⚠ ${$.name}`, `METHOD: ${METHOD}`, "");
// 解析格式
const FORMAT = ($response.headers?.["Content-Type"] ?? $response.headers?.["content-type"])?.split(";")?.[0];
$.log(`⚠ ${$.name}`, `FORMAT: ${FORMAT}`, "");
!(async () => {
	const { Settings, Caches = {}, Configs } = await setENV("iRingo", "PrivateRelay", DataBase);
	switch (Settings.Switch) {
		case true:
		default:
			// 路径判断
			switch (PATH) {
				case "v1/fetchAuthTokens":
					break;
				default:
					if (/\/accounts\//i.test(PATH)) {
						$.log(`🚧 ${$.name}, accounts`, "");
						// app info mod
						if (/\/subscriptions\/features/i.test(PATH)) {
							$.log(`🚧 ${$.name}, /subscriptions/features`, "");
							$request.headers["X-MMe-Country"] = Settings.CountryCode;
							if (/\/features$/i.test(PATH)) {
								$.log(`🚧 ${$.name}, /features`, "");
							} else if (/\/networking\.privacy\.subscriber$/i.test(PATH)) {
								$.log(`🚧 ${$.name}, /networking.privacy.subscriber`, "");
							} else if (/\/networking\.privacy\.attestation$/i.test(PATH)) {
								$.log(`🚧 ${$.name}, /networking.privacy.attestation`, "");
							} else if (/\/mail\.hide-my-email\.create$/i.test(PATH)) {
								$.log(`🚧 ${$.name}, /mail.hide-my-email.create`, "");
							} else if (/\/mail\.custom-domains\.transfer$/i.test(PATH)) {
								$.log(`🚧 ${$.name}, /mail.custom-domains.transfer`, "");
							} else $.log(`🚧 ${$.name}, unknown`, "");
						};
					} else if (/\/devices\//i.test(PATH)) {
						$.log(`🚧 ${$.name}, devices`, "");
						// app info mod
						if (/\/subscriptions\/features/i.test(PATH)) {
							$.log(`🚧 ${$.name}, /subscriptions/features`, "");
							$request.headers["X-MMe-Country"] = Settings.CountryCode;
							if (/\/features$/i.test(PATH)) {
								$.log(`🚧 ${$.name}, /features`, "");
							} else if (/\/networking\.privacy\.subscriber$/i.test(PATH)) {
								$.log(`🚧 ${$.name}, /networking.privacy.subscriber`, "");
							} else if (/\/networking\.privacy\.attestation$/i.test(PATH)) {
								$.log(`🚧 ${$.name}, /networking.privacy.attestation`, "");
							} else if (/\/mail\.hide-my-email\.create$/i.test(PATH)) {
								$.log(`🚧 ${$.name}, /mail.hide-my-email.create`, "");
							} else if (/\/mail\.custom-domains\.transfer$/i.test(PATH)) {
								$.log(`🚧 ${$.name}, /mail.custom-domains.transfer`, "");
							} else $.log(`🚧 ${$.name}, unknown`, "");
						};
					};
					break;
			};
			$.log(`🚧 ${$.name}, Private Relay`, `$response.body = ${$response.body}`, "");
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
/**
 * mod Features
 * @author VirgilClyne
 * @param {Object} features - features
 * @param {String} featureKey -featureKey
 * @return {Object}
 */
function modfeature(feature, featureKey) {
	let time = new Date();
	time.setHours(time.getHours() + 24);
	feature.featureKey = featureKey;
	feature.canUse = true;
	feature.cacheTill = time.toISOString();
	return feature
};
