import getStorage from '../ENV/getStorage.mjs'
import _ from '../ENV/Lodash.mjs'

/**
 * Set Environment Variables
 * @author VirgilClyne
 * @param {Object} $ - ENV
 * @param {String} name - Persistent Store Key
 * @param {Array} platforms - Platform Names
 * @param {Object} database - Default DataBase
 * @return {Object} { Settings, Caches, Configs }
 */
export default function setENV(name, platforms, database) {
	console.log(`☑️ Set Environment Variables`, "");
	let { Settings, Caches, Configs } = getStorage(name, platforms, database);
	/***************** Settings *****************/
	if (Settings?.AQI?.ReplaceProviders) {
		if (!Array.isArray(Settings?.AQI?.ReplaceProviders)) Settings.AQI.ReplaceProviders = (Settings?.AQI?.ReplaceProviders) ? [Settings.AQI.ReplaceProviders] : []; // 只有一个选项时，无逗号分隔
		if (Settings.AQI.ReplaceProviders.includes("TWC")) Settings.AQI.ReplaceProviders.push("The Weather Channel");
		if (Settings.AQI.ReplaceProviders.includes("QWeather")) Settings.AQI.ReplaceProviders.push("和风天气");
		Settings.AQI.ReplaceProviders.push(undefined);
	};
	if (Settings?.Tabs && !Array.isArray(Settings?.Tabs)) _.set(Settings, "Tabs", (Settings?.Tabs) ? [Settings.Tabs.toString()] : []);
	if (Settings?.Domains && !Array.isArray(Settings?.Domains)) _.set(Settings, "Domains", (Settings?.Domains) ? [Settings.Domains.toString()] : []);
	if (Settings?.Functions && !Array.isArray(Settings?.Functions)) _.set(Settings, "Functions", (Settings?.Functions) ? [Settings.Functions.toString()] : []);
	console.log(`✅ Set Environment Variables, Settings: ${typeof Settings}, Settings内容: ${JSON.stringify(Settings)}`, "");
	/***************** Caches *****************/
	//console.log(`✅ Set Environment Variables, Caches: ${typeof Caches}, Caches内容: ${JSON.stringify(Caches)}`, "");
	/***************** Configs *****************/
	Configs.Storefront = new Map(Configs.Storefront);
	if (Configs.Locale) Configs.Locale = new Map(Configs.Locale);
	if (Configs.i18n) for (let type in Configs.i18n) Configs.i18n[type] = new Map(Configs.i18n[type]);
	return { Settings, Caches, Configs };
};
