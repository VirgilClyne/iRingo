import _ from './ENV/Lodash.mjs'
import $Storage from './ENV/$Storage.mjs'
import ENV from "./ENV/ENV.mjs";

import Database from "./database/index.mjs";
import setENV from "./function/setENV.mjs";

const $ = new ENV(" iRingo: ☁️ iCloud Private Relay v1.1.0(1) response.beta");

/***************** Processing *****************/
// 解构URL
const url = new URL($request.url);
$.log(`⚠ url: ${url.toJSON()}`, "");
// 获取连接参数
const METHOD = $request.method, HOST = url.hostname, PATH = url.pathname, PATHs = url.pathname.split("/").filter(Boolean);
$.log(`⚠ METHOD: ${METHOD}, HOST: ${HOST}, PATH: ${PATH}` , "");
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
				case "/v1/fetchAuthTokens":
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
