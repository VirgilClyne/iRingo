/**
 * Set Environment Variables
 * @author VirgilClyne
 * @param {String} name - Persistent Store Key
 * @param {String} url - Request URL
 * @param {Object} database - Default DataBase
 * @return {Promise<*>}
 */
async function setENV(name, url, database) {
	$.log(`⚠ ${$.name}, Set Environment Variables`, "");
	/***************** Platform *****************/
	const Platform = /weather-(.*)\.apple\.com/i.test(url) ? "Weather"
		: /smoot\.apple\.(com|cn)/i.test(url) ? "Siri"
			: /\.apple\.com/i.test(url) ? "Apple"
				: "Apple"
	$.log(`🚧 ${$.name}, Set Environment Variables`, `Platform: ${Platform}`, "");
	/***************** BoxJs *****************/
	// 包装为局部变量，用完释放内存
	// BoxJs的清空操作返回假值空字符串, 逻辑或操作符会在左侧操作数为假值时返回右侧操作数。
	let BoxJs = $.getjson(name, database)
	$.log(`🚧 ${$.name}, Set Environment Variables`, `BoxJs类型: ${typeof BoxJs}`, `BoxJs内容: ${JSON.stringify(BoxJs)}`, "");
	/***************** Settings *****************/
	let Settings = BoxJs?.[Platform] || BoxJs?.Settings?.[Platform] || BoxJs?.Apple?.[Platform] || database[Platform];
	$.log(`🎉 ${$.name}, Set Environment Variables`, `Settings: ${typeof Settings}`, `Settings内容: ${JSON.stringify(Settings)}`, "");
	/***************** Argument *****************/
	if (typeof $argument != "undefined") {
		$.log(`🎉 ${$.name}, $Argument`);
		let arg = Object.fromEntries($argument.split("&").map((item) => item.split("=")));
		$.log(JSON.stringify(arg));
		Object.assign(Settings, arg);
	};
	/***************** Prase *****************/
	Settings.Switch = JSON.parse(Settings.Switch) // BoxJs字符串转Boolean
	if (typeof Settings?.Domains == "string") Settings.Domains = Settings.Domains.split(",") // BoxJs字符串转数组
	if (typeof Settings?.Functions == "string") Settings.Functions = Settings.Functions.split(",") // BoxJs字符串转数组
	if (Settings?.Safari_Smart_History) Settings.Safari_Smart_History = JSON.parse(Settings.Safari_Smart_History) // BoxJs字符串转Boolean
	$.log(`🎉 ${$.name}, Set Environment Variables`, `Settings: ${typeof Settings}`, `Settings内容: ${JSON.stringify(Settings)}`, "");
	return { Platform, Settings };
};
