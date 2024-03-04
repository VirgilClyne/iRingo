import _ from './ENV/Lodash.mjs'
import $Storage from './ENV/$Storage.mjs'
import ENV from "./ENV/ENV.mjs";
import URI from "./URI/URI.mjs";

import Database from "./database/index.mjs";
import setENV from "./function/setENV.mjs";

const $ = new ENV(" iRingo: ☁️ iCloud Private Relay v1.0.4(2) response");

/***************** Processing *****************/
// 解构URL
const URL = URI.parse($request.url);
$.log(`⚠ URL: ${JSON.stringify(URL)}`, "");
// 获取连接参数
const METHOD = $request.method, HOST = URL.host, PATH = URL.path, PATHs = URL.paths;
$.log(`⚠ METHOD: ${METHOD}`, "");
// 解析格式
const FORMAT = ($response.headers?.["Content-Type"] ?? $response.headers?.["content-type"])?.split(";")?.[0];
$.log(`⚠ FORMAT: ${FORMAT}`, "");
!(async () => {
	const { Settings, Caches = {}, Configs } = setENV("iRingo", "PrivateRelay", Database);
	switch (Settings.Switch) {
		case true:
		default:
			// 路径判断
			switch (PATH) {
				case "v1/fetchAuthTokens":
					break;
				default:
					if (/\/accounts\//i.test(PATH)) {
						$.log(`🚧 accounts`, "");
						// app info mod
						if (/\/subscriptions\/features/i.test(PATH)) {
							$.log(`🚧 /subscriptions/features`, "");
							$request.headers["X-MMe-Country"] = Settings.CountryCode;
							if (/\/features$/i.test(PATH)) {
								$.log(`🚧 /features`, "");
							} else if (/\/networking\.privacy\.subscriber$/i.test(PATH)) {
								$.log(`🚧 /networking.privacy.subscriber`, "");
							} else if (/\/networking\.privacy\.attestation$/i.test(PATH)) {
								$.log(`🚧 /networking.privacy.attestation`, "");
							} else if (/\/mail\.hide-my-email\.create$/i.test(PATH)) {
								$.log(`🚧 /mail.hide-my-email.create`, "");
							} else if (/\/mail\.custom-domains\.transfer$/i.test(PATH)) {
								$.log(`🚧 /mail.custom-domains.transfer`, "");
							} else $.log(`🚧 unknown`, "");
						};
					} else if (/\/devices\//i.test(PATH)) {
						$.log(`🚧 devices`, "");
						// app info mod
						if (/\/subscriptions\/features/i.test(PATH)) {
							$.log(`🚧 /subscriptions/features`, "");
							$request.headers["X-MMe-Country"] = Settings.CountryCode;
							if (/\/features$/i.test(PATH)) {
								$.log(`🚧 /features`, "");
							} else if (/\/networking\.privacy\.subscriber$/i.test(PATH)) {
								$.log(`🚧 /networking.privacy.subscriber`, "");
							} else if (/\/networking\.privacy\.attestation$/i.test(PATH)) {
								$.log(`🚧 /networking.privacy.attestation`, "");
							} else if (/\/mail\.hide-my-email\.create$/i.test(PATH)) {
								$.log(`🚧 /mail.hide-my-email.create`, "");
							} else if (/\/mail\.custom-domains\.transfer$/i.test(PATH)) {
								$.log(`🚧 /mail.custom-domains.transfer`, "");
							} else $.log(`🚧 unknown`, "");
						};
					};
					break;
			};
			$.log(`🚧 Private Relay`, `$response.body = ${$response.body}`, "");
			break;
		case false:
			break;
	};
})()
	.catch((e) => $.logErr(e))
	.finally(() => $.done($response))
