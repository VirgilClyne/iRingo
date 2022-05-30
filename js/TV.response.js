/*
README:https://github.com/VirgilClyne/iRingo
*/
const $ = new Env("Apple TV v2.0.3-response");
const URL = new URLs();
const DataBase = {
	"Location":{
		"Settings":{"Switch":true,"CountryCode":"US","Config":{"GEOAddressCorrection":true,"LookupMaxParametersCount":true,"LocalitiesAndLandmarks":true,"PedestrianAR":true,"6694982d2b14e95815e44e970235e230":true,"OpticalHeading":true,"UseCLPedestrianMapMatchedLocations":true}}
	},
	"Weather":{
		"Settings":{"Switch":true,"NextHour":{"Switch":true},"AQI":{"Switch":true,"Mode":"WAQI Public","Location":"Station","Auth":null,"Scale":"EPA_NowCast.2204"},"Map":{"AQI":false}},
		"Configs":{"Pollutants":{"co":"CO","no":"NO","no2":"NO2","so2":"SO2","o3":"OZONE","nox":"NOX","pm25":"PM2.5","pm10":"PM10","other":"OTHER"}}
	},
	"Siri":{
		"Settings":{"Switch":true,"CountryCode":"SG","Domains":["web","itunes","app_store","movies","restaurants","maps"],"Functions":["flightutilities","lookup","mail","messages","news","safari","siri","spotlight","visualintelligence"],"Safari_Smart_History":true}
	},
	"TV":{
		"Settings":{"Switch":true,"Third-Party":true,"Configs":{"CountryCode":"AUTO","Tabs":["WatchNow","Originals","Movies","TV","Sports","Kids","Library","Search"]},"View":{"CountryCode":["SG","TW"]},"WatchNow":{"CountryCode":"AUTO"},"Channels":{"CountryCode":"AUTO"},"Originals":{"CountryCode":"TW"},"Movies":{"CountryCode":"AUTO"},"TV":{"CountryCode":"AUTO"},"Sports":{"CountryCode":"US"},"Kids":{"CountryCode":"US"},"Persons":{"CountryCode":"SG"},"Search":{"CountryCode":"TW"},"Others":{"CountryCode":"AUTO"}},
		"Configs":{
			"Storefront":{"AF":"143610","AL":"143575","AO":"143564","AI":"143538","AG":"143540","AR":"143505","AM":"143524","AU":"143460","AT":"143445","AZ":"143568","BA":"143612","BS":"143539","BH":"143559","BB":"143541","BD":"143490","BY":"143565","BE":"143446","BZ":"143555","BJ":"143576","BM":"143542","BT":"143577","BO":"143556","BW":"143525","BR":"143503","VG":"143543","BN":"143560","BG":"143526","BF":"143578","CA":"143455","CI":"143527","CM":"143574","CV":"143580","KY":"143544","TD":"143581","CL":"143483","CN":"143465","CO":"143501","CG":"143582","CR":"143495","HR":"143494","CY":"143557","CZ":"143489","DK":"143458","DM":"143545","DO":"143508","DZ":"143563","EC":"143509","EG":"143516","SV":"143506","EE":"143518","FJ":"143583","FI":"143447","FR":"143442","GM":"143584","DE":"143443","GH":"143573","GR":"143448","GD":"143546","GT":"143504","GW":"143585","GY":"143553","HN":"143510","HK":"143463","HU":"143482","IS":"143558","IN":"143467","ID":"143476","IE":"143449","IL":"143491","IT":"143450","JM":"143511","JP":"143462","JO":"143528","KH":"143579","KR":"143466","KZ":"143517","KE":"143529","KW":"143493","KG":"143586","LA":"143587","LV":"143519","LB":"143497","LR":"143588","LT":"143520","LI":"143522","LU":"143451","MO":"143515","MK":"143530","MG":"143531","MW":"143589","MY":"143473","MV":"143488","ML":"143532","MT":"143521","MR":"143590","MU":"143533","MX":"143468","FM":"143591","MD":"143523","MN":"143592","MS":"143547","MZ":"143593","NA":"143594","NP":"143484","NL":"143452","NZ":"143461","NI":"143512","NE":"143534","NG":"143561","NO":"143457","OM":"143562","PK":"143477","PW":"143595","PA":"143485","PG":"143597","PY":"143513","PE":"143507","PH":"143474","PL":"143478","PT":"143453","QA":"143498","RO":"143487","RU":"143469","ST":"143598","SA":"143479","SN":"143535","SC":"143599","SL":"143600","SG":"143464","SK":"143496","SI":"143499","SB":"143601","ZA":"143472","KP":"143466","ES":"143454","LK":"143486","KN":"143548","LC":"143549","VC":"143550","SR":"143554","SZ":"143602","SE":"143456","CH":"143459","TW":"143470","TJ":"143603","TZ":"143572","TH":"143475","TT":"143551","TN":"143536","TR":"143480","TM":"143604","TC":"143552","AE":"143481","UG":"143537","UA":"143492","GB":"143444","US":"143441","UY":"143514","UZ":"143566","VE":"143502","VN":"143471","YE":"143571","ZW":"143605","CD":"143613","GA":"143614","GF":"143615","IQ":"143617","XK":"143624","LY":"143567","ME":"143619","MA":"143620","MM":"143570","NR":"143606","RW":"143621","RS":"143500","TO":"143608","VU":"143609","ZM":"143622"},
			"Locale":{"AU":"en-AU","CA":"en-CA","GB":"en-GB","KR":"ko-KR","HK":"yue-Hant","JP":"ja-JP","MO":"zh-Hant","TW":"zh-Hant","US":"en-US","SG":"zh-Hans"},
			"Tabs":{"zh":{"WatchNow":"立即观看","Originals":"原创内容","Movies":"电影","TV":"电视节目","Store":"商店","Sports":"体育节目","Kids":"儿童","Library":"资料库","Search":"搜索"},"zh-Hans":{"WatchNow":"立即观看","Originals":"原创内容","Movies":"电影","TV":"电视节目","Store":"商店","Sports":"体育节目","Kids":"儿童","Library":"资料库","Search":"搜索"},"zh-Hant":{"WatchNow":"立即觀看","Originals":"原創內容","Movies":"電影","TV":"電視節目","Store":"商店","Sports":"體育節目","Kids":"兒童","Library":"資料庫","Search":"蒐索"},"en":{"WatchNow":"Watch Now","Originals":"Originals","Movies":"Movies","TV":"TV Shows","Store":"Store","Sports":"Sports","Kids":"Kids","Library":"Library","Search":"Search"}}
		}
	}
};

/***************** Async *****************/
!(async () => {
	const { Settings, Caches, Configs } = await setENV("iRingo", "TV", DataBase);
	if (Settings.Switch) {
		let url = URL.parse($request.url);
		$.log(url.path);
		switch (url.path) {
			case "uts/v3/configurations":
				if (url.params.caller !== "wta") { // 不修改caller=wta的configurations数据
					const locale = $request?.headers?.["X-Apple-I-Locale"]?.split('_')?.[0] ?? "zh"
					$.log(`locale: ${locale}`, "");
					let { tabs, tabsSplitScreen } = await createTabsGroup(url.params, locale, Configs);
					const AllTabs = ["WatchNow", "Originals", "Movies", "TV", "Sports", "Kids", "Library", "Search"];
					AllTabs.forEach(tab => {
						if (!Settings.Configs.Tabs.includes(tab)) {
							delete tabs[tab]
							delete tabsSplitScreen[tab]
						}
					})
					$response.body = await outputConfigs(url.params, $response.body, tabs, tabsSplitScreen);
				}
				break;
			case "uts/v3/canvases/Roots/watchNow":
				if (url.params.caller !== "wta" && url.params.sf === '143470') { // 不修改caller=wta的configurations数据
					$.log(`开始翻译: Jacob`, "");
					$response.body = await zhHantTranslateToZhHans(url.params, $response.body);
				}
				break;
			default:
				break;
		}
	}
})()
	.catch((e) => $.logErr(e))
	.finally(() => {
		if ($.isQuanX()) $.done({ body: $response.body })
		else $.done($response)
	})

/***************** Async Function *****************/
/**
 * Get Environment Variables
 * @author VirgilClyne
 * @param {String} t - Persistent Store Key
 * @param {String} e - Platform Name
 * @param {Object} n - Default DataBase
 * @return {Promise<*>}
 */
async function getENV(t,e,n){let i=$.getjson(t,n),s=i?.[e]?.Settings||n?.[e]?.Settings||n?.Default?.Settings,g=i?.[e]?.Configs||n?.[e]?.Configs||n?.Default?.Configs,f=i?.[e]?.Caches||void 0;if("string"==typeof f&&(f=JSON.parse(f)),"undefined"!=typeof $argument){if($argument){let t=Object.fromEntries($argument.split("&").map((t=>t.split("=")))),e={};for(var a in t)o(e,a,t[a]);Object.assign(s,e)}function o(t,e,n){e.split(".").reduce(((t,i,s)=>t[i]=e.split(".").length===++s?n:t[i]||{}),t)}}return{Settings:s,Caches:f,Configs:g}}

 /**
  * Set Environment Variables
  * @author VirgilClyne
  * @param {String} name - Persistent Store Key
  * @param {String} platform - Platform Name
  * @param {Object} database - Default DataBase
  * @return {Promise<*>}
  */
async function setENV(name, platform, database) {
	$.log(`⚠ ${$.name}, Set Environment Variables`, "");
	let { Settings, Caches = {}, Configs } = await getENV(name, platform, database);
	/***************** Prase *****************/
	Settings.Switch = JSON.parse(Settings.Switch) // BoxJs字符串转Boolean
	Settings["Third-Party"] = JSON.parse(Settings["Third-Party"]) // BoxJs字符串转Boolean
	if (typeof Settings?.Configs?.Tabs == "string") Settings.Configs.Tabs = Settings.Configs.Tabs.split(",") // BoxJs字符串转数组
	$.log(`🎉 ${$.name}, Set Environment Variables`, `Settings: ${typeof Settings}`, `Settings内容: ${JSON.stringify(Settings)}`, "");
	return { Settings, Caches, Configs }
};

// Create Tabs Group
async function createTabsGroup(Params, locale, database) {
	$.log(`⚠ ${$.name}, Create Tabs Group`, "");

	//构建Tab内容
	const WatchNow = { "destinationType": "Target", "target": { "id": "tahoma_watchnow", "type": "Root", "url": "https://tv.apple.com/watch-now" }, "title": database.Tabs[locale].WatchNow, "type": "WatchNow", "universalLinks": ["https://tv.apple.com/watch-now"] };
	const Originals = { "destinationType": "Target", "target": { "id": "tvs.sbd.4000", "type": "Brand", "url": "https://tv.apple.com/us/channel/tvs.sbd.4000" }, "title": database.Tabs[locale].Originals, "type": "Originals", "universalLinks": ["https://tv.apple.com/channel/tvs.sbd.4000", "https://tv.apple.com/atv"] };
	const Movies = { "universalLinks": ["https://tv.apple.com/movies"], "title": database.Tabs[locale].Movies, "destinationType": "Target", "secondaryEnabled": true, "target": { "id": "tahoma_movies", "type": "Root", "url": "https://tv.apple.com/movies" }, "type": "Movies" };
	const TV = { "universalLinks": ["https://tv.apple.com/tv-shows"], "title": database.Tabs[locale].TV, "destinationType": "Target", "secondaryEnabled": true, "target": { "id": "tahoma_tvshows", "type": "Root", "url": "https://tv.apple.com/tv-shows" }, "type": "TV" };
	const Store = {
		"destinationType": "SubTabs",
		"subTabs": [
			{ "destinationType": "Target", "target": { "id": "tahoma_movies", "type": "Root", "url": "https://tv.apple.com/movies" }, "title": database.Tabs[locale].Movies, "type": "Movies", "universalLinks": ["https://tv.apple.com/movies"] },
			{ "destinationType": "Target", "target": { "id": "tahoma_tvshows", "type": "Root", "url": "https://tv.apple.com/tv-shows" }, "title": database.Tabs[locale].TV, "type": "TV", "universalLinks": ["https://tv.apple.com/tv-shows"] }
		],
		"title": database.Tabs[locale].Store,
		"type": "Store",
		"universalLinks": ["https://tv.apple.com/store"]
	};
	const Sports = { "destinationType": "Target", "target": { "id": "tahoma_sports", "type": "Root", "url": "https://tv.apple.com/sports" }, "title": database.Tabs[locale].Sports, "secondaryEnabled": true, "type": "Sports", "universalLinks": ["https://tv.apple.com/sports"] };
	const Kids = { "destinationType": "Target", "target": { "id": "tahoma_kids", "type": "Root", "url": "https://tv.apple.com/kids" }, "title": database.Tabs[locale].Kids, "secondaryEnabled": true, "type": "Kids", "universalLinks": ["https://tv.apple.com/kids"] };
	const Library = { "destinationType": "Client", "title": database.Tabs[locale].Library, "type": "Library" };
	const Search = { "destinationType": "Target", "target": { "id": "tahoma_searchlanding", "type": "Root", "url": "https://tv.apple.com/search" }, "title": database.Tabs[locale].Search, "type": "Search", "universalLinks": ["https://tv.apple.com/search"] };

	// 创建分组
	var tabs = (Params.v > 53) ? [WatchNow, Originals, Store, Sports, Kids, Library, Search]
		: [WatchNow, Originals, Movies, TV, Sports, Kids, Library, Search];
	var tabsSplitScreen =  [WatchNow, Originals, Store, Library, Search];
	// 输出
	return { tabs, tabsSplitScreen }
};

// Output Configurations
async function outputConfigs(Params, body, tabs, tabsSplitScreen) {
	$.log(`⚠ ${$.name}, Create Configurations`, "");
	// Input Data
	let configurations = JSON.parse(body);
	// 注入数据
	//条件运算符 & 可选链操作符 
	//configurations.data.applicationProps.requiredParamsMap.WithoutUtsk.locale = "zh_Hans";
	//configurations.data.applicationProps.requiredParamsMap.Default.locale = "zh_Hans";
	configurations.data.applicationProps.tabs = tabs;
	//configurations.data.applicationProps.tabs = createTabsGroup("Tabs", caller, platform, locale, region);
	if (Params.v > 53) configurations.data.applicationProps.tabsSplitScreen = tabsSplitScreen;
	//configurations.data.applicationProps.tabsSplitScreen = createTabsGroup("TabsGroup", caller, platform, locale, region);
	configurations.data.applicationProps.tvAppEnabledInStorefront = true;
	configurations.data.applicationProps.enabledClientFeatures = (Params.v > 53) ? [{ "domain": "tvapp", "name": "snwpcr" }, { "domain": "tvapp", "name": "store_tab" }]
		: [{ "domain": "tvapp", "name": "expanse" }, { "domain": "tvapp", "name": "syndication" }, { "domain": "tvapp", "name": "snwpcr" }];
	//configurations.data.applicationProps.storefront.localesSupported = ["zh_Hans", "zh_Hant", "yue-Hant", "en_US", "en_GB"];
	//configurations.data.applicationProps.storefront.storefrontId = 143470;
	configurations.data.applicationProps.featureEnablers = {
		"topShelf": true,
		"unw": true,
		//"imageBasedSubtitles": true,
		"ageVerification": false,
		"seasonTitles": false
	};
	//configurations.data.userProps.activeUser = true;
	//configurations.data.userProps.utsc = "1:18943";
	//configurations.data.userProps.country = country;
	//configurations.data.userProps.gac = true;
	// Output Data
	$.log(`🎉 ${$.name}, ${outputConfigs.name}完成`, "");
	body = JSON.stringify(configurations);
	return body
};

// 繁体中文翻译成简体中文
async function zhHantTranslateToZhHans(Params, body) {
	$.log(`⚠ ${$.name}, zh-Hant tanslate to zh-Hans`, "");
	// Input Data
	let configurations = JSON.parse(body);

	trans(configurations)

	// Output Data
	$.log(`🎉 ${$.name}, ${outputConfigs.name}完成`, "");
	body = JSON.stringify(configurations);
	return body
};

function simpPYStr() {
	return '啊阿埃挨哎唉哀皑癌蔼矮艾碍爱隘鞍氨安俺按暗岸胺案肮昂盎凹敖熬翱袄傲奥懊澳芭捌扒叭吧笆八疤巴拔跋靶把耙坝霸罢爸白柏百摆佰败拜稗斑班搬扳般颁板版扮拌伴瓣半办绊邦帮梆榜膀绑棒磅蚌镑傍谤苞胞包褒剥薄雹保堡饱宝抱报暴豹鲍爆杯碑悲卑北辈背贝钡倍狈备惫焙被奔苯本笨崩绷甭泵蹦迸逼鼻比鄙笔彼碧蓖蔽毕毙毖币庇痹闭敝弊必辟壁臂避陛鞭边编贬扁便变卞辨辩辫遍标彪膘表鳖憋别瘪彬斌濒滨宾摈兵冰柄丙秉饼炳病并玻菠播拨钵波博勃搏铂箔伯帛舶脖膊渤泊驳捕卜哺补埠不布步簿部怖擦猜裁材才财睬踩采彩菜蔡餐参蚕残惭惨灿苍舱仓沧藏操糙槽曹草厕策侧册测层蹭插叉茬茶查碴搽察岔差诧拆柴豺搀掺蝉馋谗缠铲产阐颤昌猖场尝常长偿肠厂敞畅唱倡超抄钞朝嘲潮巢吵炒车扯撤掣彻澈郴臣辰尘晨忱沉陈趁衬撑称城橙成呈乘程惩澄诚承逞骋秤吃痴持匙池迟弛驰耻齿侈尺赤翅斥炽充冲虫崇宠抽酬畴踌稠愁筹仇绸瞅丑臭初出橱厨躇锄雏滁除楚础储矗搐触处揣川穿椽传船喘串疮窗幢床闯创吹炊捶锤垂春椿醇唇淳纯蠢戳绰疵茨磁雌辞慈瓷词此刺赐次聪葱囱匆从丛凑粗醋簇促蹿篡窜摧崔催脆瘁粹淬翠村存寸磋撮搓措挫错搭达答瘩打大呆歹傣戴带殆代贷袋待逮怠耽担丹单郸掸胆旦氮但惮淡诞弹蛋当挡党荡档刀捣蹈倒岛祷导到稻悼道盗德得的蹬灯登等瞪凳邓堤低滴迪敌笛狄涤翟嫡抵底地蒂第帝弟递缔颠掂滇碘点典靛垫电佃甸店惦奠淀殿碉叼雕凋刁掉吊钓调跌爹碟蝶迭谍叠丁盯叮钉顶鼎锭定订丢东冬董懂动栋侗恫冻洞兜抖斗陡豆逗痘都督毒犊独读堵睹赌杜镀肚度渡妒端短锻段断缎堆兑队对墩吨蹲敦顿囤钝盾遁掇哆多夺垛躲朵跺舵剁惰堕蛾峨鹅俄额讹娥恶厄扼遏鄂饿恩而儿耳尔饵洱二贰发罚筏伐乏阀法珐藩帆番翻樊矾钒繁凡烦反返范贩犯饭泛坊芳方肪房防妨仿访纺放菲非啡飞肥匪诽吠肺废沸费芬酚吩氛分纷坟焚汾粉奋份忿愤粪丰封枫蜂峰锋风疯烽逢冯缝讽奉凤佛否夫敷肤孵扶拂辐幅氟符伏俘服浮涪福袱弗甫抚辅俯釜斧脯腑府腐赴副覆赋复傅付阜父腹负富讣附妇缚咐噶嘎该改概钙盖溉干甘杆柑竿肝赶感秆敢赣冈刚钢缸肛纲岗港杠篙皋高膏羔糕搞镐稿告哥歌搁戈鸽胳疙割革葛格蛤阁隔铬个各给根跟耕更庚羹埂耿梗工攻功恭龚供躬公宫弓巩汞拱贡共钩勾沟苟狗垢构购够辜菇咕箍估沽孤姑鼓古蛊骨谷股故顾固雇刮瓜剐寡挂褂乖拐怪棺关官冠观管馆罐惯灌贯光广逛瑰规圭硅归龟闺轨鬼诡癸桂柜跪贵刽辊滚棍锅郭国果裹过哈骸孩海氦亥害骇酣憨邯韩含涵寒函喊罕翰撼捍旱憾悍焊汗汉夯杭航壕嚎豪毫郝好耗号浩呵喝荷菏核禾和何合盒貉阂河涸赫褐鹤贺嘿黑痕很狠恨哼亨横衡恒轰哄烘虹鸿洪宏弘红喉侯猴吼厚候后呼乎忽瑚壶葫胡蝴狐糊湖弧虎唬护互沪户花哗华猾滑画划化话槐徊怀淮坏欢环桓还缓换患唤痪豢焕涣宦幻荒慌黄磺蝗簧皇凰惶煌晃幌恍谎灰挥辉徽恢蛔回毁悔慧卉惠晦贿秽会烩汇讳诲绘荤昏婚魂浑混豁活伙火获或惑霍货祸击圾基机畸稽积箕肌饥迹激讥鸡姬绩缉吉极棘辑籍集及急疾汲即嫉级挤几脊己蓟技冀季伎祭剂悸济寄寂计记既忌际继纪嘉枷夹佳家加荚颊贾甲钾假稼价架驾嫁歼监坚尖笺间煎兼肩艰奸缄茧检柬碱硷拣捡简俭剪减荐槛鉴践贱见键箭件健舰剑饯渐溅涧建僵姜将浆江疆蒋桨奖讲匠酱降蕉椒礁焦胶交郊浇骄娇嚼搅铰矫侥脚狡角饺缴绞剿教酵轿较叫窖揭接皆秸街阶截劫节茎睛晶鲸京惊精粳经井警景颈静境敬镜径痉靖竟竞净炯窘揪究纠玖韭久灸九酒厩救旧臼舅咎就疚鞠拘狙疽居驹菊局咀矩举沮聚拒据巨具距踞锯俱句惧炬剧捐鹃娟倦眷卷绢撅攫抉掘倔爵桔杰捷睫竭洁结解姐戒藉芥界借介疥诫届巾筋斤金今津襟紧锦仅谨进靳晋禁近烬浸尽劲荆兢觉决诀绝均菌钧军君峻俊竣浚郡骏喀咖卡咯开揩楷凯慨刊堪勘坎砍看康慷糠扛抗亢炕考拷烤靠坷苛柯棵磕颗科壳咳可渴克刻客课肯啃垦恳坑吭空恐孔控抠口扣寇枯哭窟苦酷库裤夸垮挎跨胯块筷侩快宽款匡筐狂框矿眶旷况亏盔岿窥葵奎魁傀馈愧溃坤昆捆困括扩廓阔垃拉喇蜡腊辣啦莱来赖蓝婪栏拦篮阑兰澜谰揽览懒缆烂滥琅榔狼廊郎朗浪捞劳牢老佬姥酪烙涝勒乐雷镭蕾磊累儡垒擂肋类泪棱楞冷厘梨犁黎篱狸离漓理李里鲤礼莉荔吏栗丽厉励砾历利傈例俐痢立粒沥隶力璃哩俩联莲连镰廉怜涟帘敛脸链恋炼练粮凉梁粱良两辆量晾亮谅撩聊僚疗燎寥辽潦了撂镣廖料列裂烈劣猎琳林磷霖临邻鳞淋凛赁吝拎玲菱零龄铃伶羚凌灵陵岭领另令溜琉榴硫馏留刘瘤流柳六龙聋咙笼窿隆垄拢陇楼娄搂篓漏陋芦卢颅庐炉掳卤虏鲁麓碌露路赂鹿潞禄录陆戮驴吕铝侣旅履屡缕虑氯律率滤绿峦挛孪滦卵乱掠略抡轮伦仑沦纶论萝螺罗逻锣箩骡裸落洛骆络妈麻玛码蚂马骂嘛吗埋买麦卖迈脉瞒馒蛮满蔓曼慢漫谩芒茫盲氓忙莽猫茅锚毛矛铆卯茂冒帽貌贸么玫枚梅酶霉煤没眉媒镁每美昧寐妹媚门闷们萌蒙檬盟锰猛梦孟眯醚靡糜迷谜弥米秘觅泌蜜密幂棉眠绵冕免勉娩缅面苗描瞄藐秒渺庙妙蔑灭民抿皿敏悯闽明螟鸣铭名命谬摸摹蘑模膜磨摩魔抹末莫墨默沫漠寞陌谋牟某拇牡亩姆母墓暮幕募慕木目睦牧穆拿哪呐钠那娜纳氖乃奶耐奈南男难囊挠脑恼闹淖呢馁内嫩能妮霓倪泥尼拟你匿腻逆溺蔫拈年碾撵捻念娘酿鸟尿捏聂孽啮镊镍涅您柠狞凝宁拧泞牛扭钮纽脓浓农弄奴努怒女暖虐疟挪懦糯诺哦欧鸥殴藕呕偶沤啪趴爬帕怕琶拍排牌徘湃派攀潘盘磐盼畔判叛乓庞旁耪胖抛咆刨炮袍跑泡呸胚培裴赔陪配佩沛喷盆砰抨烹澎彭蓬棚硼篷膨朋鹏捧碰坯砒霹批披劈琵毗啤脾疲皮匹痞僻屁譬篇偏片骗飘漂瓢票撇瞥拼频贫品聘乒坪苹萍平凭瓶评屏坡泼颇婆破魄迫粕剖扑铺仆莆葡菩蒲埔朴圃普浦谱曝瀑期欺栖戚妻七凄漆柒沏其棋奇歧畦崎脐齐旗祈祁骑起岂乞企启契砌器气迄弃汽泣讫掐洽牵扦钎铅千迁签仟谦乾黔钱钳前潜遣浅谴堑嵌欠歉枪呛腔羌墙蔷强抢橇锹敲悄桥瞧乔侨巧鞘撬翘峭俏窍切茄且怯窃钦侵亲秦琴勤芹擒禽寝沁青轻氢倾卿清擎晴氰情顷请庆琼穷秋丘邱球求囚酋泅趋区蛆曲躯屈驱渠取娶龋趣去圈颧权醛泉全痊拳犬券劝缺炔瘸却鹊榷确雀裙群然燃冉染瓤壤攘嚷让饶扰绕惹热壬仁人忍韧任认刃妊纫扔仍日戎茸蓉荣融熔溶容绒冗揉柔肉茹蠕儒孺如辱乳汝入褥软阮蕊瑞锐闰润若弱撒洒萨腮鳃塞赛三叁伞散桑嗓丧搔骚扫嫂瑟色涩森僧莎砂杀刹沙纱傻啥煞筛晒珊苫杉山删煽衫闪陕擅赡膳善汕扇缮墒伤商赏晌上尚裳梢捎稍烧芍勺韶少哨邵绍奢赊蛇舌舍赦摄射慑涉社设砷申呻伸身深娠绅神沈审婶甚肾慎渗声生甥牲升绳省盛剩胜圣师失狮施湿诗尸虱十石拾时什食蚀实识史矢使屎驶始式示士世柿事拭誓逝势是嗜噬适仕侍释饰氏市恃室视试收手首守寿授售受瘦兽蔬枢梳殊抒输叔舒淑疏书赎孰熟薯暑曙署蜀黍鼠属术述树束戍竖墅庶数漱恕刷耍摔衰甩帅栓拴霜双爽谁水睡税吮瞬顺舜说硕朔烁斯撕嘶思私司丝死肆寺嗣四伺似饲巳松耸怂颂送宋讼诵搜艘擞嗽苏酥俗素速粟僳塑溯宿诉肃酸蒜算虽隋随绥髓碎岁穗遂隧祟孙损笋蓑梭唆缩琐索锁所塌他它她塔獭挞蹋踏胎苔抬台泰酞太态汰坍摊贪瘫滩坛檀痰潭谭谈坦毯袒碳探叹炭汤塘搪堂棠膛唐糖倘躺淌趟烫掏涛滔绦萄桃逃淘陶讨套特藤腾疼誊梯剔踢锑提题蹄啼体替嚏惕涕剃屉天添填田甜恬舔腆挑条迢眺跳贴铁帖厅听烃汀廷停亭庭挺艇通桐酮瞳同铜彤童桶捅筒统痛偷投头透凸秃突图徒途涂屠土吐兔湍团推颓腿蜕褪退吞屯臀拖托脱鸵陀驮驼椭妥拓唾挖哇蛙洼娃瓦袜歪外豌弯湾玩顽丸烷完碗挽晚皖惋宛婉万腕汪王亡枉网往旺望忘妄威巍微危韦违桅围唯惟为潍维苇萎委伟伪尾纬未蔚味畏胃喂魏位渭谓尉慰卫瘟温蚊文闻纹吻稳紊问嗡翁瓮挝蜗涡窝我斡卧握沃巫呜钨乌污诬屋无芜梧吾吴毋武五捂午舞伍侮坞戊雾晤物勿务悟误昔熙析西硒矽晰嘻吸锡牺稀息希悉膝夕惜熄烯溪汐犀檄袭席习媳喜铣洗系隙戏细瞎虾匣霞辖暇峡侠狭下厦夏吓掀锨先仙鲜纤咸贤衔舷闲涎弦嫌显险现献县腺馅羡宪陷限线相厢镶香箱襄湘乡翔祥详想响享项巷橡像向象萧硝霄削哮嚣销消宵淆晓小孝校肖啸笑效楔些歇蝎鞋协挟携邪斜胁谐写械卸蟹懈泄泻谢屑薪芯锌欣辛新忻心信衅星腥猩惺兴刑型形邢行醒幸杏性姓兄凶胸匈汹雄熊休修羞朽嗅锈秀袖绣墟戌需虚嘘须徐许蓄酗叙旭序畜恤絮婿绪续轩喧宣悬旋玄选癣眩绚靴薛学穴雪血勋熏循旬询寻驯巡殉汛训讯逊迅压押鸦鸭呀丫芽牙蚜崖衙涯雅哑亚讶焉咽阉烟淹盐严研蜒岩延言颜阎炎沿奄掩眼衍演艳堰燕厌砚雁唁彦焰宴谚验殃央鸯秧杨扬佯疡羊洋阳氧仰痒养样漾邀腰妖瑶摇尧遥窑谣姚咬舀药要耀椰噎耶爷野冶也页掖业叶曳腋夜液一壹医揖铱依伊衣颐夷遗移仪胰疑沂宜姨彝椅蚁倚已乙矣以艺抑易邑屹亿役臆逸肄疫亦裔意毅忆义益溢诣议谊译异翼翌绎茵荫因殷音阴姻吟银淫寅饮尹引隐印英樱婴鹰应缨莹萤营荧蝇迎赢盈影颖硬映哟拥佣臃痈庸雍踊蛹咏泳涌永恿勇用幽优悠忧尤由邮铀犹油游酉有友右佑釉诱又幼迂淤于盂榆虞愚舆余俞逾鱼愉渝渔隅予娱雨与屿禹宇语羽玉域芋郁吁遇喻峪御愈欲狱育誉浴寓裕预豫驭鸳渊冤元垣袁原援辕园员圆猿源缘远苑愿怨院曰约越跃钥岳粤月悦阅耘云郧匀陨允运蕴酝晕韵孕匝砸杂栽哉灾宰载再在咱攒暂赞赃脏葬遭糟凿藻枣早澡蚤躁噪造皂灶燥责择则泽贼怎增憎曾赠扎喳渣札轧铡闸眨栅榨咋乍炸诈摘斋宅窄债寨瞻毡詹粘沾盏斩辗崭展蘸栈占战站湛绽樟章彰漳张掌涨杖丈帐账仗胀瘴障招昭找沼赵照罩兆肇召遮折哲蛰辙者锗蔗这浙珍斟真甄砧臻贞针侦枕疹诊震振镇阵蒸挣睁征狰争怔整拯正政帧症郑证芝枝支吱蜘知肢脂汁之织职直植殖执值侄址指止趾只旨纸志挚掷至致置帜峙制智秩稚质炙痔滞治窒中盅忠钟衷终种肿重仲众舟周州洲诌粥轴肘帚咒皱宙昼骤珠株蛛朱猪诸诛逐竹烛煮拄瞩嘱主著柱助蛀贮铸筑住注祝驻抓爪拽专砖转撰赚篆桩庄装妆撞壮状椎锥追赘坠缀谆准捉拙卓桌琢茁酌啄着灼浊兹咨资姿滋淄孜紫仔籽滓子自渍字鬃棕踪宗综总纵邹走奏揍租足卒族祖诅阻组钻纂嘴醉最罪尊遵昨左佐柞做作坐座锕嗳嫒瑷暧霭谙铵鹌媪骜鳌钯呗钣鸨龅鹎贲锛荜哔滗铋筚跸苄缏笾骠飑飙镖镳鳔傧缤槟殡膑镔髌鬓禀饽钹鹁钸骖黪恻锸侪钗冁谄谶蒇忏婵骣觇禅镡伥苌怅阊鲳砗伧谌榇碜龀枨柽铖铛饬鸱铳俦帱雠刍绌蹰钏怆缍鹑辍龊鹚苁骢枞辏撺锉鹾哒鞑骀绐殚赕瘅箪谠砀裆焘镫籴诋谛绨觌镝巅钿癫铫鲷鲽铤铥岽鸫窦渎椟牍笃黩簖怼镦炖趸铎谔垩阏轭锇锷鹗颚颛鳄诶迩铒鸸鲕钫鲂绯镄鲱偾沣凫驸绂绋赙麸鲋鳆钆赅尴擀绀戆睾诰缟锆纥镉颍亘赓绠鲠诟缑觏诂毂钴锢鸪鹄鹘鸹掴诖掼鹳鳏犷匦刿妫桧鲑鳜衮绲鲧埚呙帼椁蝈铪阚绗颉灏颢诃阖蛎黉讧荭闳鲎浒鹕骅桦铧奂缳锾鲩鳇诙荟哕浍缋珲晖诨馄阍钬镬讦诘荠叽哜骥玑觊齑矶羁虿跻霁鲚鲫郏浃铗镓蛲谏缣戋戬睑鹣笕鲣鞯绛缰挢峤鹪鲛疖颌鲒卺荩馑缙赆觐刭泾迳弪胫靓阄鸠鹫讵屦榉飓钜锔窭龃锩镌隽谲珏皲剀垲忾恺铠锴龛闶钪铐骒缂轲钶锞颔龈铿喾郐哙脍狯髋诓诳邝圹纩贶匮蒉愦聩篑阃锟鲲蛴崃徕涞濑赉睐铼癞籁岚榄斓镧褴阆锒唠崂铑铹痨鳓诔缧俪郦坜苈莅蓠呖逦骊缡枥栎轹砺锂鹂疠粝跞雳鲡鳢蔹奁潋琏殓裢裣鲢魉缭钌鹩蔺廪檩辚躏绫棂蛏鲮浏骝绺镏鹨茏泷珑栊胧砻偻蒌喽嵝镂瘘耧蝼髅垆撸噜闾泸渌栌橹轳辂辘氇胪鸬鹭舻鲈脔娈栾鸾銮囵荦猡泺椤脶镙榈褛锊呒唛嬷杩劢缦镘颡鳗麽扪焖懑钔芈谧猕祢渑腼黾缈缪闵缗谟蓦馍殁镆钼铙讷铌鲵辇鲶茑袅陧蘖嗫颟蹑苎咛聍侬哝驽钕傩讴怄瓯蹒疱辔纰罴铍谝骈缥嫔钋镤镨蕲骐绮桤碛颀颃鳍佥荨悭骞缱椠钤嫱樯戗炝锖锵镪羟跄诮谯荞缲硗跷惬锲箧锓揿鲭茕蛱巯赇虮鳅诎岖阒觑鸲诠绻辁铨阕阙悫荛娆桡饪轫嵘蝾缛铷颦蚬飒毵糁缫啬铯穑铩鲨酾讪姗骟钐鳝垧殇觞厍滠畲诜谂渖谥埘莳弑轼贳铈鲥绶摅纾闩铄厮驷缌锶鸶薮馊飕锼谡稣谇荪狲唢睃闼铊鳎钛鲐昙钽锬顸傥饧铴镗韬铽缇鹈阗粜龆鲦恸钭钍抟饨箨鼍娲腽纨绾辋诿帏闱沩涠玮韪炜鲔阌莴龌邬庑怃妩骛鹉鹜饩阋玺觋硖苋莶藓岘猃娴鹇痫蚝籼跹芗饷骧缃飨哓潇骁绡枭箫亵撷绁缬陉荥馐鸺诩顼谖铉镟谑泶鳕埙浔鲟垭娅桠氩厣赝俨兖谳恹闫酽魇餍鼹炀轺鹞鳐靥谒邺晔烨诒呓峄饴怿驿缢轶贻钇镒镱瘗舣铟瘾茔莺萦蓥撄嘤滢潆璎鹦瘿颏罂镛莸铕鱿伛俣谀谕蓣嵛饫阈妪纡觎欤钰鹆鹬龉橼鸢鼋钺郓芸恽愠纭韫殒氲瓒趱錾驵赜啧帻箦谮缯谵诏钊谪辄鹧浈缜桢轸赈祯鸩诤峥钲铮筝骘栉栀轵轾贽鸷蛳絷踬踯觯锺纣绉伫槠铢啭馔颞骓缒诼镯谘缁辎赀眦锱龇鲻偬诹驺鲰镞缵躜鳟讠谫郄勐凼坂垅垴埯埝苘荬荮莜莼菰藁揸吒吣咔咝咴噘噼嚯幞岙嵴彷徼犸狍馀馇馓馕愣憷懔丬溆滟溷漤潴澹甯纟绔绱珉枧桊桉槔橥轱轷赍肷胨飚煳煅熘愍淼砜磙眍钚钷铘铞锃锍锎锏锘锝锪锫锿镅镎镢镥镩镲稆鹋鹛鹱疬疴痖癯裥襁耢颥螨麴鲅鲆鲇鲞鲴鲺鲼鳊鳋鳘鳙鞒鞴齄';
}

function ftPYStr() {
	return '啊阿埃挨哎唉哀皚癌藹矮艾礙愛隘鞍氨安俺按暗岸胺案骯昂盎凹敖熬翺襖傲奧懊澳芭捌扒叭吧笆八疤巴拔跋靶把耙壩霸罷爸白柏百擺佰敗拜稗斑班搬扳般頒板版扮拌伴瓣半辦絆邦幫梆榜膀綁棒磅蚌鎊傍謗苞胞包褒剝薄雹保堡飽寶抱報暴豹鮑爆杯碑悲卑北輩背貝鋇倍狽備憊焙被奔苯本笨崩繃甭泵蹦迸逼鼻比鄙筆彼碧蓖蔽畢斃毖幣庇痹閉敝弊必辟壁臂避陛鞭邊編貶扁便變卞辨辯辮遍標彪膘表鱉憋別癟彬斌瀕濱賓擯兵冰柄丙秉餅炳病並玻菠播撥缽波博勃搏鉑箔伯帛舶脖膊渤泊駁捕蔔哺補埠不布步簿部怖擦猜裁材才財睬踩采彩菜蔡餐參蠶殘慚慘燦蒼艙倉滄藏操糙槽曹草廁策側冊測層蹭插叉茬茶查碴搽察岔差詫拆柴豺攙摻蟬饞讒纏鏟產闡顫昌猖場嘗常長償腸廠敞暢唱倡超抄鈔朝嘲潮巢吵炒車扯撤掣徹澈郴臣辰塵晨忱沈陳趁襯撐稱城橙成呈乘程懲澄誠承逞騁秤吃癡持匙池遲弛馳恥齒侈尺赤翅斥熾充沖蟲崇寵抽酬疇躊稠愁籌仇綢瞅醜臭初出櫥廚躇鋤雛滁除楚礎儲矗搐觸處揣川穿椽傳船喘串瘡窗幢床闖創吹炊捶錘垂春椿醇唇淳純蠢戳綽疵茨磁雌辭慈瓷詞此刺賜次聰蔥囪匆從叢湊粗醋簇促躥篡竄摧崔催脆瘁粹淬翠村存寸磋撮搓措挫錯搭達答瘩打大呆歹傣戴帶殆代貸袋待逮怠耽擔丹單鄲撣膽旦氮但憚淡誕彈蛋當擋黨蕩檔刀搗蹈倒島禱導到稻悼道盜德得的蹬燈登等瞪凳鄧堤低滴迪敵笛狄滌翟嫡抵底地蒂第帝弟遞締顛掂滇碘點典靛墊電佃甸店惦奠澱殿碉叼雕雕刁掉吊釣調跌爹碟蝶叠諜疊丁盯叮釘頂鼎錠定訂丟東冬董懂動棟侗恫凍洞兜抖鬥陡豆逗痘都督毒犢獨讀堵睹賭杜鍍肚度渡妒端短鍛段斷緞堆兌隊對墩噸蹲敦頓囤鈍盾遁掇哆多奪垛躲朵跺舵剁惰墮蛾峨鵝俄額訛娥惡厄扼遏鄂餓恩而兒耳爾餌洱二貳發罰筏伐乏閥法琺藩帆番翻樊礬釩繁凡煩反返範販犯飯泛坊芳方肪房防妨仿訪紡放菲非啡飛肥匪誹吠肺廢沸費芬酚吩氛分紛墳焚汾粉奮份忿憤糞豐封楓蜂峰鋒風瘋烽逢馮縫諷奉鳳佛否夫敷膚孵扶拂輻幅氟符伏俘服浮涪福袱弗甫撫輔俯釜斧脯腑府腐赴副覆賦復傅付阜父腹負富訃附婦縛咐噶嘎該改概鈣蓋溉幹甘桿柑竿肝趕感稈敢贛岡剛鋼缸肛綱崗港杠篙臯高膏羔糕搞鎬稿告哥歌擱戈鴿胳疙割革葛格蛤閣隔鉻個各給根跟耕更庚羹埂耿梗工攻功恭龔供躬公宮弓鞏汞拱貢共鉤勾溝茍狗垢構購夠辜菇咕箍估沽孤姑鼓古蠱骨谷股故顧固雇刮瓜剮寡掛褂乖拐怪棺關官冠觀管館罐慣灌貫光廣逛瑰規圭矽歸龜閨軌鬼詭癸桂櫃跪貴劊輥滾棍鍋郭國果裹過哈骸孩海氦亥害駭酣憨邯韓含涵寒函喊罕翰撼捍旱憾悍焊汗漢夯杭航壕嚎豪毫郝好耗號浩呵喝荷菏核禾和何合盒貉閡河涸赫褐鶴賀嘿黑痕很狠恨哼亨橫衡恒轟哄烘虹鴻洪宏弘紅喉侯猴吼厚候後呼乎忽瑚壺葫胡蝴狐糊湖弧虎唬護互滬戶花嘩華猾滑畫劃化話槐徊懷淮壞歡環桓還緩換患喚瘓豢煥渙宦幻荒慌黃磺蝗簧皇凰惶煌晃幌恍謊灰揮輝徽恢蛔回毀悔慧卉惠晦賄穢會燴匯諱誨繪葷昏婚魂渾混豁活夥火獲或惑霍貨禍擊圾基機畸稽積箕肌饑跡激譏雞姬績緝吉極棘輯籍集及急疾汲即嫉級擠幾脊己薊技冀季伎祭劑悸濟寄寂計記既忌際繼紀嘉枷夾佳家加莢頰賈甲鉀假稼價架駕嫁殲監堅尖箋間煎兼肩艱奸緘繭檢柬堿鹼揀撿簡儉剪減薦檻鑒踐賤見鍵箭件健艦劍餞漸濺澗建僵姜將漿江疆蔣槳獎講匠醬降蕉椒礁焦膠交郊澆驕嬌嚼攪鉸矯僥腳狡角餃繳絞剿教酵轎較叫窖揭接皆稭街階截劫節莖睛晶鯨京驚精粳經井警景頸靜境敬鏡徑痙靖竟競凈炯窘揪究糾玖韭久灸九酒廄救舊臼舅咎就疚鞠拘狙疽居駒菊局咀矩舉沮聚拒據巨具距踞鋸俱句懼炬劇捐鵑娟倦眷卷絹撅攫抉掘倔爵桔傑捷睫竭潔結解姐戒藉芥界借介疥誡屆巾筋斤金今津襟緊錦僅謹進靳晉禁近燼浸盡勁荊兢覺決訣絕均菌鈞軍君峻俊竣浚郡駿喀咖卡咯開揩楷凱慨刊堪勘坎砍看康慷糠扛抗亢炕考拷烤靠坷苛柯棵磕顆科殼咳可渴克刻客課肯啃墾懇坑吭空恐孔控摳口扣寇枯哭窟苦酷庫褲誇垮挎跨胯塊筷儈快寬款匡筐狂框礦眶曠況虧盔巋窺葵奎魁傀饋愧潰坤昆捆困括擴廓闊垃拉喇蠟臘辣啦萊來賴藍婪欄攔籃闌蘭瀾讕攬覽懶纜爛濫瑯榔狼廊郎朗浪撈勞牢老佬姥酪烙澇勒樂雷鐳蕾磊累儡壘擂肋類淚棱楞冷厘梨犁黎籬貍離漓理李裏鯉禮莉荔吏栗麗厲勵礫歷利傈例俐痢立粒瀝隸力璃哩倆聯蓮連鐮廉憐漣簾斂臉鏈戀煉練糧涼梁粱良兩輛量晾亮諒撩聊僚療燎寥遼潦了撂鐐廖料列裂烈劣獵琳林磷霖臨鄰鱗淋凜賃吝拎玲菱零齡鈴伶羚淩靈陵嶺領另令溜琉榴硫餾留劉瘤流柳六龍聾嚨籠窿隆壟攏隴樓婁摟簍漏陋蘆盧顱廬爐擄鹵虜魯麓碌露路賂鹿潞祿錄陸戮驢呂鋁侶旅履屢縷慮氯律率濾綠巒攣孿灤卵亂掠略掄輪倫侖淪綸論蘿螺羅邏鑼籮騾裸落洛駱絡媽麻瑪碼螞馬罵嘛嗎埋買麥賣邁脈瞞饅蠻滿蔓曼慢漫謾芒茫盲氓忙莽貓茅錨毛矛鉚卯茂冒帽貌貿麽玫枚梅酶黴煤沒眉媒鎂每美昧寐妹媚門悶們萌蒙檬盟錳猛夢孟瞇醚靡糜迷謎彌米秘覓泌蜜密冪棉眠綿冕免勉娩緬面苗描瞄藐秒渺廟妙蔑滅民抿皿敏憫閩明螟鳴銘名命謬摸摹蘑模膜磨摩魔抹末莫墨默沫漠寞陌謀牟某拇牡畝姆母墓暮幕募慕木目睦牧穆拿哪吶鈉那娜納氖乃奶耐奈南男難囊撓腦惱鬧淖呢餒內嫩能妮霓倪泥尼擬妳匿膩逆溺蔫拈年碾攆撚念娘釀鳥尿捏聶孽嚙鑷鎳涅您檸獰凝寧擰濘牛扭鈕紐膿濃農弄奴努怒女暖虐瘧挪懦糯諾哦歐鷗毆藕嘔偶漚啪趴爬帕怕琶拍排牌徘湃派攀潘盤磐盼畔判叛乓龐旁耪胖拋咆刨炮袍跑泡呸胚培裴賠陪配佩沛噴盆砰抨烹澎彭蓬棚硼篷膨朋鵬捧碰坯砒霹批披劈琵毗啤脾疲皮匹痞僻屁譬篇偏片騙飄漂瓢票撇瞥拼頻貧品聘乒坪蘋萍平憑瓶評屏坡潑頗婆破魄迫粕剖撲鋪仆莆葡菩蒲埔樸圃普浦譜曝瀑期欺棲戚妻七淒漆柒沏其棋奇歧畦崎臍齊旗祈祁騎起豈乞企啟契砌器氣迄棄汽泣訖掐洽牽扡釬鉛千遷簽仟謙乾黔錢鉗前潛遣淺譴塹嵌欠歉槍嗆腔羌墻薔強搶橇鍬敲悄橋瞧喬僑巧鞘撬翹峭俏竅切茄且怯竊欽侵親秦琴勤芹擒禽寢沁青輕氫傾卿清擎晴氰情頃請慶瓊窮秋丘邱球求囚酋泅趨區蛆曲軀屈驅渠取娶齲趣去圈顴權醛泉全痊拳犬券勸缺炔瘸卻鵲榷確雀裙群然燃冉染瓤壤攘嚷讓饒擾繞惹熱壬仁人忍韌任認刃妊紉扔仍日戎茸蓉榮融熔溶容絨冗揉柔肉茹蠕儒孺如辱乳汝入褥軟阮蕊瑞銳閏潤若弱撒灑薩腮鰓塞賽三三傘散桑嗓喪搔騷掃嫂瑟色澀森僧莎砂殺剎沙紗傻啥煞篩曬珊苫杉山刪煽衫閃陜擅贍膳善汕扇繕墑傷商賞晌上尚裳梢捎稍燒芍勺韶少哨邵紹奢賒蛇舌舍赦攝射懾涉社設砷申呻伸身深娠紳神沈審嬸甚腎慎滲聲生甥牲升繩省盛剩勝聖師失獅施濕詩屍虱十石拾時什食蝕實識史矢使屎駛始式示士世柿事拭誓逝勢是嗜噬適仕侍釋飾氏市恃室視試收手首守壽授售受瘦獸蔬樞梳殊抒輸叔舒淑疏書贖孰熟薯暑曙署蜀黍鼠屬術述樹束戍豎墅庶數漱恕刷耍摔衰甩帥栓拴霜雙爽誰水睡稅吮瞬順舜說碩朔爍斯撕嘶思私司絲死肆寺嗣四伺似飼巳松聳慫頌送宋訟誦搜艘擻嗽蘇酥俗素速粟僳塑溯宿訴肅酸蒜算雖隋隨綏髓碎歲穗遂隧祟孫損筍蓑梭唆縮瑣索鎖所塌他它她塔獺撻蹋踏胎苔擡臺泰酞太態汰坍攤貪癱灘壇檀痰潭譚談坦毯袒碳探嘆炭湯塘搪堂棠膛唐糖倘躺淌趟燙掏濤滔絳萄桃逃淘陶討套特藤騰疼謄梯剔踢銻提題蹄啼體替嚏惕涕剃屜天添填田甜恬舔腆挑條迢眺跳貼鐵帖廳聽烴汀廷停亭庭挺艇通桐酮瞳同銅彤童桶捅筒統痛偷投頭透凸禿突圖徒途塗屠土吐兔湍團推頹腿蛻褪退吞屯臀拖托脫鴕陀馱駝橢妥拓唾挖哇蛙窪娃瓦襪歪外豌彎灣玩頑丸烷完碗挽晚皖惋宛婉萬腕汪王亡枉網往旺望忘妄威巍微危韋違桅圍唯惟為濰維葦萎委偉偽尾緯未蔚味畏胃餵魏位渭謂尉慰衛瘟溫蚊文聞紋吻穩紊問嗡翁甕撾蝸渦窩我斡臥握沃巫嗚鎢烏汙誣屋無蕪梧吾吳毋武五捂午舞伍侮塢戊霧晤物勿務悟誤昔熙析西硒矽晰嘻吸錫犧稀息希悉膝夕惜熄烯溪汐犀檄襲席習媳喜銑洗系隙戲細瞎蝦匣霞轄暇峽俠狹下廈夏嚇掀鍁先仙鮮纖鹹賢銜舷閑涎弦嫌顯險現獻縣腺餡羨憲陷限線相廂鑲香箱襄湘鄉翔祥詳想響享項巷橡像向象蕭硝霄削哮囂銷消宵淆曉小孝校肖嘯笑效楔些歇蠍鞋協挾攜邪斜脅諧寫械卸蟹懈泄瀉謝屑薪芯鋅欣辛新忻心信釁星腥猩惺興刑型形邢行醒幸杏性姓兄兇胸匈洶雄熊休修羞朽嗅銹秀袖繡墟戌需虛噓須徐許蓄酗敘旭序畜恤絮婿緒續軒喧宣懸旋玄選癬眩絢靴薛學穴雪血勛熏循旬詢尋馴巡殉汛訓訊遜迅壓押鴉鴨呀丫芽牙蚜崖衙涯雅啞亞訝焉咽閹煙淹鹽嚴研蜒巖延言顏閻炎沿奄掩眼衍演艷堰燕厭硯雁唁彥焰宴諺驗殃央鴦秧楊揚佯瘍羊洋陽氧仰癢養樣漾邀腰妖瑤搖堯遙窯謠姚咬舀藥要耀椰噎耶爺野冶也頁掖業葉曳腋夜液壹壹醫揖銥依伊衣頤夷遺移儀胰疑沂宜姨彜椅蟻倚已乙矣以藝抑易邑屹億役臆逸肄疫亦裔意毅憶義益溢詣議誼譯異翼翌繹茵蔭因殷音陰姻吟銀淫寅飲尹引隱印英櫻嬰鷹應纓瑩螢營熒蠅迎贏盈影穎硬映喲擁傭臃癰庸雍踴蛹詠泳湧永恿勇用幽優悠憂尤由郵鈾猶油遊酉有友右佑釉誘又幼迂淤於盂榆虞愚輿余俞逾魚愉渝漁隅予娛雨與嶼禹宇語羽玉域芋郁籲遇喻峪禦愈欲獄育譽浴寓裕預豫馭鴛淵冤元垣袁原援轅園員圓猿源緣遠苑願怨院曰約越躍鑰嶽粵月悅閱耘雲鄖勻隕允運蘊醞暈韻孕匝砸雜栽哉災宰載再在咱攢暫贊贓臟葬遭糟鑿藻棗早澡蚤躁噪造皂竈燥責擇則澤賊怎增憎曾贈紮喳渣劄軋鍘閘眨柵榨咋乍炸詐摘齋宅窄債寨瞻氈詹粘沾盞斬輾嶄展蘸棧占戰站湛綻樟章彰漳張掌漲杖丈帳賬仗脹瘴障招昭找沼趙照罩兆肇召遮折哲蟄轍者鍺蔗這浙珍斟真甄砧臻貞針偵枕疹診震振鎮陣蒸掙睜征猙爭怔整拯正政幀癥鄭證芝枝支吱蜘知肢脂汁之織職直植殖執值侄址指止趾只旨紙誌摯擲至致置幟峙制智秩稚質炙痔滯治窒中盅忠鐘衷終種腫重仲眾舟周州洲謅粥軸肘帚咒皺宙晝驟珠株蛛朱豬諸誅逐竹燭煮拄矚囑主著柱助蛀貯鑄築住註祝駐抓爪拽專磚轉撰賺篆樁莊裝妝撞壯狀椎錐追贅墜綴諄準捉拙卓桌琢茁酌啄著灼濁茲咨資姿滋淄孜紫仔籽滓子自漬字鬃棕蹤宗綜總縱鄒走奏揍租足卒族祖詛阻組鉆纂嘴醉最罪尊遵昨左佐柞做作坐座錒噯嬡璦曖靄諳銨鵪媼驁鰲鈀唄鈑鴇齙鵯賁錛蓽嗶潷鉍篳蹕芐緶籩驃颮飆鏢鑣鰾儐繽檳殯臏鑌髕鬢稟餑鈸鵓鈽驂黲惻鍤儕釵囅諂讖蕆懺嬋驏覘禪鐔倀萇悵閶鯧硨傖諶櫬磣齔棖檉鋮鐺飭鴟銃儔幬讎芻絀躕釧愴綞鶉輟齪鶿蓯驄樅輳攛銼鹺噠韃駘紿殫賧癉簞讜碭襠燾鐙糴詆諦綈覿鏑巔鈿癲銚鯛鰈鋌銩崠鶇竇瀆櫝牘篤黷籪懟鐓燉躉鐸諤堊閼軛鋨鍔鶚顎顓鱷誒邇鉺鴯鮞鈁魴緋鐨鯡僨灃鳧駙紱紼賻麩鮒鰒釓賅尷搟紺戇睪誥縞鋯紇鎘潁亙賡綆鯁詬緱覯詁轂鈷錮鴣鵠鶻鴰摑詿摜鸛鰥獷匭劌媯檜鮭鱖袞緄鯀堝咼幗槨蟈鉿闞絎頡灝顥訶闔蠣黌訌葒閎鱟滸鶘驊樺鏵奐繯鍰鯇鰉詼薈噦澮繢琿暉諢餛閽鈥鑊訐詰薺嘰嚌驥璣覬齏磯羈蠆躋霽鱭鯽郟浹鋏鎵蟯諫縑戔戩瞼鶼筧鰹韉絳韁撟嶠鷦鮫癤頜鮚巹藎饉縉贐覲剄涇逕弳脛靚鬮鳩鷲詎屨櫸颶鉅鋦窶齟錈鐫雋譎玨皸剴塏愾愷鎧鍇龕閌鈧銬騍緙軻鈳錁頷齦鏗嚳鄶噲膾獪髖誆誑鄺壙纊貺匱蕢憒聵簣閫錕鯤蠐崍徠淶瀨賚睞錸癩籟嵐欖斕鑭襤閬鋃嘮嶗銠鐒癆鰳誄縲儷酈壢藶蒞蘺嚦邐驪縭櫪櫟轢礪鋰鸝癘糲躒靂鱺鱧蘞奩瀲璉殮褳襝鰱魎繚釕鷯藺廩檁轔躪綾欞蟶鯪瀏騮綹鎦鷚蘢瀧瓏櫳朧礱僂蔞嘍嶁鏤瘺耬螻髏壚擼嚕閭瀘淥櫨櫓轤輅轆氌臚鸕鷺艫鱸臠孌欒鸞鑾圇犖玀濼欏腡鏍櫚褸鋝嘸嘜嬤榪勱縵鏝顙鰻麼捫燜懣鍆羋謐獼禰澠靦黽緲繆閔緡謨驀饃歿鏌鉬鐃訥鈮鯢輦鯰蔦裊隉蘗囁顢躡苧嚀聹儂噥駑釹儺謳慪甌蹣皰轡紕羆鈹諞駢縹嬪釙鏷鐠蘄騏綺榿磧頎頏鰭僉蕁慳騫繾槧鈐嬙檣戧熗錆鏘鏹羥蹌誚譙蕎繰磽蹺愜鍥篋鋟撳鯖煢蛺巰賕蟣鰍詘嶇闃覷鴝詮綣輇銓闋闕愨蕘嬈橈飪軔嶸蠑縟銣顰蜆颯毿糝繅嗇銫穡鎩鯊釃訕姍騸釤鱔坰殤觴厙灄畬詵諗瀋謚塒蒔弒軾貰鈰鰣綬攄紓閂鑠廝駟緦鍶鷥藪餿颼鎪謖穌誶蓀猻嗩脧闥鉈鰨鈦鮐曇鉭錟頇儻餳鐋鏜韜鋱緹鵜闐糶齠鰷慟鈄釷摶飩籜鼉媧膃紈綰輞諉幃闈溈潿瑋韙煒鮪閿萵齷鄔廡憮嫵騖鵡鶩餼鬩璽覡硤莧薟蘚峴獫嫻鷴癇蠔秈躚薌餉驤緗饗嘵瀟驍綃梟簫褻擷紲纈陘滎饈鵂詡頊諼鉉鏇謔澩鱈塤潯鱘埡婭椏氬厴贗儼兗讞懨閆釅魘饜鼴煬軺鷂鰩靨謁鄴曄燁詒囈嶧飴懌驛縊軼貽釔鎰鐿瘞艤銦癮塋鶯縈鎣攖嚶瀅瀠瓔鸚癭頦罌鏞蕕銪魷傴俁諛諭蕷崳飫閾嫗紆覦歟鈺鵒鷸齬櫞鳶黿鉞鄆蕓惲慍紜韞殞氳瓚趲鏨駔賾嘖幘簀譖繒譫詔釗謫輒鷓湞縝楨軫賑禎鴆諍崢鉦錚箏騭櫛梔軹輊贄鷙螄縶躓躑觶鍾紂縐佇櫧銖囀饌顳騅縋諑鐲諮緇輜貲眥錙齜鯔傯諏騶鯫鏃纘躦鱒訁譾郤猛氹阪壟堖垵墊檾蕒葤蓧蒓菇槁摣咤唚哢噝噅撅劈謔襆嶴脊仿僥獁麅餘餷饊饢楞怵懍爿漵灩混濫瀦淡寧糸絝緔瑉梘棬案橰櫫軲軤賫膁腖飈糊煆溜湣渺碸滾瞘鈈鉕鋣銱鋥鋶鐦鐧鍩鍀鍃錇鎄鎇鎿鐝鑥鑹鑔穭鶓鶥鸌癧屙瘂臒襇繈耮顬蟎麯鮁鮃鮎鯗鯝鯴鱝鯿鰠鰵鱅鞽韝齇';
}

function qqPYStr() {
	return '娿婀埃挨餀呃哀皑癌蔼婑銰碍嬡隘鞍氨鮟唵洝暗岸胺案肮昻盎凹獓熬翱仸謸奧襖奧妑捌朳朳妑笆仈疤妑菝柭靶妑耙坝覇罢妑皛柏咟擺佰敗湃稗癍癍搬扳瘢頒闆蝂汾絆柈瓣柈刅绊綁幇梆徬嫎垹蜯嫎蚌镑徬谤苞菢笣褒剝薄雹湺堡怉寶砲蕔懪豹鲍嚗柸碑蕜萆苝輩揹赑钡俻狈備惫焙被渀苯夲苯镚绷甭泵嘣逬腷嬶仳啚毣彼碧蓖幣滭斃毖币庇痹閉獙弊怭澼壁臂鐴陛鞭笾揙貶碥楩變卞辧辮辮猵摽滮鏢錶鳖憋莂癟彬斌濒璸濱摈娦栤窉眪秉饼炳疒並箥菠譒妭钵菠博勃搏铂箔伯帛舶脖膊渤泊訤峬卜誧卟埠芣鈽荹簿蔀怖攃猜裁財財財棌棌采埰婇蔡爘傪蛬殘慙參灿芲舱仺獊蔵懆鐰槽蓸愺厠憡側冊恻層竲揷紁茬嗏楂楂搽镲岔槎诧拆枈豺搀傪蝉镵谗瀍铲浐闡顫誯猖畼甞瑺萇偿肠廠敞畅晿倡趫莏鈔謿謿謿漅訬炒車扯徹掣沏瞮郴烥宸尘曟忱冗陳趁衬撐稱峸橙荿珵塖珵懲僜諴承浧骋秤阣痴歭匙肔呎肔肔恥歯侈呎哧趐斥炽茺沖蟲漴寵菗絒帱帱婤僽薵仇皗瞅忸溴初炪廚廚躇鋤雛蒢篨椘绌储矗搐触處遄巛瑏椽伝船遄賗疮囱幢床闖創欥炊腄腄箠舂椿錞脣錞蒓蠢戥焯疵垐濨雌辭濨瓷詞泚剌賜佽聪茐囱茐苁苁凑粗齰簇娖蹿篡窜凗慛慛脆瘁濢濢濢籿洊籿磋撮髊措挫措溚垯荅瘩咑汏槑歹傣瀻帶殆笩贷袋待曃怠耽泹冄啴郸掸狚狚氮泹惮惔诞弹疍當澢黨蕩澢叨搗稲箌島祷导菿稲悼檤盜徳嘚哋簦燈憕等簦凳郰諟彽嘀廸敵廸狄涤翟嫡抵疧哋渧苐渧弚递缔颠掂滇碘點敟靛垫電佃甸扂惦奠淀殿淍汈鵰蜩刁鋽铞銱蜩瓞嗲渫渫迭媟疉玎饤汀町嵿鼎锭萣忊丟崬笗蓳慬憅崬侗恫岽狪兠鬦乧跿荳浢哣嘟督毐渎獨渎陼睹帾荰镀肚喥喥妒鍴短葮葮斷葮碓兌隊怼墩沌壿敦頓囤沌盾遁掇哆哆奪垛躱朶跺舵剁媠憜睋睋鹅皒额讹皒悪苊扼遏鄂皒慁洏ル洱尒聶洱②贰潑藅筏浌疺阀琺珐藩汎畨飜樊矾钒瀿汎煩反返笵贩氾粄疺汸淓汸肪房汸妨汸汸汸倣婔悱啡飛萉厞诽吠腓廢沸曊棼酚玢氛汾妢墳焚汾帉奮妢忿濆粪仹崶猦蜂峯峯颩瘋烽漨溤漨讽唪鳯仏娝玞敷膚孵荴拂辐諨氟苻茯俘棴捊涪湢袱弗甫抚辅椨釜釡脯腑椨腐赴諨覆賦復傅苻阜父腹萯冨讣胕妇缚咐噶嗄姟妀漑鈣葢漑迀苷杆柑芉肝迀憾秆噉赣罓碙鋼矼釭罁罓港釭禞皋滈膏餻溔鎬鎬鎬哠滒戨擱戈鸽胳疙剨愅噶咯蛤阁隔铬個茖给艮茛畊浭菮羹埂耿梗笁糼糼塨龚栱匑厷営弖巩汞珙貢珙溝芶芶苟豞垢媾媾夠辜菇咕箍诂钴箛菇鼔咕蛊嗗唂骰诂顧凅雇剮呱剮寡啩啩乖枴怪菅関菅蒄觀涫菅潅遦潅遦洸広迋瑰規圭硅歸亀閨匦媿詭癸蓕匱蛫貴刽辊蔉輥煱漷國淉裹過铪骸陔嗨氦亥嗐骇酣憨邯韓浛凾寒凾諴癷翰撼捍猂憾悍猂汙漢夯忼航壕嚎濠毫郝恏秏呺滘哬曷嗬菏劾秝啝哬匼盉貉阂菏涸赫褐鹤哿潶嫼痕佷哏悢涥悙橫蘅恆轟晎烘渱鴻葓宖宖葒糇糇糇犼厚糇後苸苸唿瑚壺煳箶箶狐煳煳弧唬唬戶沍戶戶埖蕐澕磆磆畵劃囮話槐佪懷准壞歡寰桓還緩換漶喚痪豢焕涣宦抝巟巟曂磺蝗簧瑝瑝瑝瑝愰縨恍巟洃媈媈幑恢蛔冋毇珻慧卉惠珻贿秽浍烩匯讳诲浍荤涽殙魂渾婫豁萿钬焱镬戓惑靃貨禍击圾樭僟畸稽積箕肌饥迹噭讥鶏姬绩缉咭极棘辑籍潗彶喼疾汲旣嫉级哜凢脊己蓟技冀悸伎祭剂悸哜寄寂計汜旣忌漈继汜嘉枷夾佳傢咖荚颊贾曱钾徦糘價泇駕糘姧盬堅尖笺簡煎凲肩艰奷缄茧撿柬碱硷拣撿彅倹彅諴薦槛鉴践濺見楗箭件揵舰劍饯渐溅涧踺壃葁將槳茳彊蔣桨奨講匠醬夅蕉椒礁潐烄茭郊浇嬌嬌嚼搅铰矫侥腳烄角饺儌烄剿嘋酵轿珓嘂窖揭帹湝秸街阶截劫兯莖聙瞐鯨倞驚棈粳經丼檠憬頸靜璄擏傹徑痉靖獍競凈泂僒啾究糾玖韭玖灸勼氿厩慦舊臼舅咎僦咎鞠佝狙疽劇驹匊挶咀怇舉沮藂岠琚姖倶岠踞涺倶呴惧岠涺涓鵑涓惓眷捲涓瘚攫決崛崛嚼桔傑啑睫竭洁結解姐悈藉芥鎅徣夰疥诫屆凧荕釿唫妗珒噤緊婂僅殣琎靳晉噤菦烬锓浕勁荊兢覺吷吷蕝汮箘呁軍焄浚浚浚浚郡浚喀咖鉲咯閞揩揩剀慨刋堪勘坎歃看嫝嵻嵻摃忼囥忼栲洘栲靠坷岢柯錁溘錁萪涜嗑妸渇尅尅愙錁肻肻恳垦妔妔涳恐芤啌摳囗釦簆喖哭崫楛酷厙褲洿垮挎跨胯赽筷侩赽寬窾匡筺誑框纩洭纩況扝盔岿窺葵喹魁傀潰隗潰堒崐涃涃葀拡霩闊柆菈喇臘臘辣菈莱唻攋藍漤孄拦藍阑蘭瀾谰灠灠攋灠灡嚂哴蓈哴蓢蓢蓢烺崂崂窂荖佬粩絡絡崂嘞泺檑檑檑藞蔂儡垒檑叻類汨棱楞唥厘悡犁黎篱狸蓠漓理李里鲤礼莉荔吏栗婯疠励砾呖悡傈唎俐痢竝粒沥隶劦璃哩唡聅嗹涟镰廉憐涟帘潋臉嗹戀煉煉悢涼樑粱悢倆唡糧涼煷涼嫽窷獠療獠寥辽潦孒撂镣漻料烮煭烮挘獵啉啉潾霖臨鄰潾啉凛賃悋柃玪夌蕶齡玪伶玪夌靈夌玪領叧泠媹琉媹硫馏畱嚠媹蓅栁陸瀧聾茏茏窿湰泷泷茏溇溇嵝溇屚陋廬盧颅廬爐掳卤虏噜麓碌蕗蕗赂蔍潞禄淥陸戮馿焒焒佀膂履屢缕慮氯侓卛慮淥欒孌孿滦卵亂稤畧囵囵囵仑囵纶囵囉螺囉羅囉儸骡裸落詻詻絡媽嫲犸犸犸骉罵嫲嬤埋荬麥賣邁霡慲獌蠻慲嫚嫚嫚嫚谩笀汒吂氓杧漭貓罞锚毝罞铆茆茂萺萺邈貿庅坆枚烸酶苺湈莈葿媒镁烸羙昧寐妺媚閄悶們萠懞檬擝锰掹夢掹侎醚靡糜洣洣弥洣秘觅泌滵滵幂婂眠婂冕凂勉娩缅媔媌媌媌邈仯緲庿仯篾搣姄抿皿勄悯閩眀螟嘄佲洺掵繆嗼摹嚤嗼嗼嚤嚤嚤沬沬嗼嚜默沬嗼寞帞湈哞湈拇牡畝姆毋募暮募募慕朩朩睦牧穆嗱哪妠妠哪哪妠氖釢艿恧柰遖莮難灢撓悩悩閙淖迡浽禸嫰能妮霓淣狔胒抳沵嫟膩屰溺蔫秥姩碾撵捻淰娘酿茑杘涅嗫糵啮嗫镍涅您柠狞凝苧拧泞犇沑妞狃哝哝哝挵伮怓伮囡煖疟疟挪穤穤喏呃瓯瓯瓯耦嘔耦沤啪汃瓟啪啪琶啪棑簰棑湃哌襻瀋盤磐昐溿叛判乓厐臱耪眫拋垉铇垉垉垉垉怌胚掊裴婄婄蓜姵沛濆湓泙抨烹澎憉莑堋硼篷膨萠鵬唪湴坯砒噼纰怶噼琵毗啤裨疲怶苉痞僻庇譬萹媥爿騙彯慓瓢嘌潎潎拚頻貧闆娉乒岼泙泙岼憑甁评屛岥秡櫇嘙岥魄廹粕剖圤舗圤莆匍箁蒲逋圤圃普浦鐠曝鑤剘剘栖嘁悽⑦凄漆柒沏娸諆渏忮畦崎脐斉旗祈祁騏起豈阣佱晵契砌噐氣迄棄汽淇讫拤洽撁扦钎鉛芉迁簽仟嗛墘黔錢钳湔濳遣淺谴堑嵌芡嗛熗濸腔羌嫱嫱強熗橇锹毃佾喬趭喬喬巧鞘毳趬峭佾竅苆苆苴愜苆钦埐儭蓁噖懄芹檎噙寑沁圊輕氢傾卿凊擎啨氰凊頃埥庆琼窮偢坵邱浗浗囚媨泅趋岖蛆浀軀屈駆渠掫婜龋趣厾圜颧權醛葲洤痊拳吠券勧蒛炔瘸卻鹊榷確雀峮羣嘫嘫姌媣瓤壤攘孃讓隢擾隢惹慹壬芢亾涊韧姙認刄妊纫扔仍ㄖ戎茸嫆荣瀜嫆嫆嫆絨冗渘渘禸筎蠕濡孺洳媷乳肗叺褥軟朊惢瑞銳潤潤婼弜潵灑蕯腮鳃噻噻彡叁傘潵鎟鎟喪搔騒掃溲瑟脃澀潹僧莏唦摋閷乷纱傻倽繺篩曬姍苫杉屾剼煽釤閁陝擅赡膳僐訕傓缮墒傷啇賞晌仩尙裳哨哨哨燒芍汋韶仯哨卲袑奢赊虵舙舎赦摂射慑渉涻蔎砷妽呻訷裑堔娠訷鉮瀋谉嬸卙腎慎椮殸泩甥狌圱繩渻墭乗夝聖溮妷浉湤濕詩迉虱拾坧湁溡什喰蚀實識史矢使屍馶始鉽沶仕迣枾倳拭誓迣勢湜嗜噬适仕侍释飾氏巿恃厔視鉽荍掱渞垨壽涭售辤痩獣蔬枢梳姝杼瀭埱忬蔋疏書赎孰孰薯濐曙署蜀黍癙屬朮沭樹娕戍竪墅庶薮漱恕唰耍摔缞甩帥拴拴灀叒摤誰渁腄挩吮橓順橓説碩朔爍凘凘凘偲俬呞噝屍肆峙嗣④伺姒饲巳菘聳怂頌鎹浨讼誦溲艘擞嗽蘇酥俗嫊趚粟僳愬溯蹜訴歗酸祘匴虽陏隨浽髓誶嵗穗嬘隧祟孫損笋蓑逡逡縮鎖鎍鎻葰禢彵咜咜嗒獭挞蹋沓胎苔孡珆溙酞忲忲呔坍摊貪瘫滩墵檀痰憛谭談钽毯袒湠探嘆湠饧溏搪漟橖膛瑭溏倘躺淌趟烫匋濤瑫绦匋洮洮匋匋討套特駦駦庝誊珶剔踢锑諟趧渧渧軆櫕嚏惕珶珶屟兲婖瑱甶甛恬婖睓狣條迢眺朓萜鉄萜廰厛烃汀侹渟渟侹侹艇嗵秱酮瞳哃恫浵僮硧硧茼統痌偸投頭透凸禿湥圖徙蒤凃廜汢汢兎湍團蓷颓蹆蜕蹆蹆昋屯臀柂仛脫袉拕駞袉椭鋖沰唾挖哇蛙哇哇咓襪歪迯豌塆塆琓顽汍烷唍涴梚脕皖惋宛啘萭腕忹迋匄忹蛧暀忹朢莣妄媙蘶嶶佹韦違桅圍惟惟潙潍惟苇崣逶偉沩屗纬沬墛菋嵔媦嵔蘶莅渭媦墛墛衞瘟溫螡妏聞鈫沕穏紊問滃暡瓮挝窩煱窉莪斡臥楃沃莁嗚钨烏汚莁偓嘸蕪梧圄呉毋娬伍圄吘橆⑤侮坞戊霚晤粅匢務圄誤厝凞唽覀硒矽晰嘻扱唶犠浠息唏悉膝汐厝熄烯渓汐犀檄袭席習媳禧铣冼係隙戱細磍虾匣葭轄叚浹浹浹芐厦嗄圷锨锨姺佡鮮汘咸賢銜舷娴涎妶溓显険哯獻縣腺陥羨宪陥限線楿厢镶萫葙襄湘芗翔祥詳想姠啍頙巷潒潒姠潒簘硝霄萷涍嚣销消宵淆哓尒涍校肖啸笑效楔些歇蝎嚡拹挾携峫斜脅喈冩悈啣蟹澥绁瀉塮屑蕲芯锌俽厗噺忻杺信衅暒睲睲瑆興鉶侀形郉垳瑆圉莕悻狌兇兇洶匈汹雄熋咻俢饈朽溴琇莠袖绣歔戌濡歔歔湏俆汻蓄酗溆旮垿畜恤絮胥緒續蓒媗媗悬嫙玆選癣妶絢靴薛敩泬膤洫勛熏揗洵咰浔紃廵咰卂訓卂遜卂壓呷鴉鴨吖吖厊厊蚜崖衙涯蕥啞亞冴漹咽阉煙殗鹽嚴妍蜒啱娫訁顔閻烾沿奄殗眼衍湮滟堰嬿厭砚雁唁彦熖匽谚験殃姎鴦秧昜婸佯疡咩樣陽氧卬癢養樣羕撽崾岆愮愮尧滛窰愮烑吆舀葯婹耀倻噎倻爺嘢冶竾頁掖鄴旪曳腋液液①壹悘揖铱畩吚扆颐夷遗簃儀胰寲沂宜侇彝掎蚁掎巳乁矣姒兿抑昜邑屹億役臆逸肄疫洂裔嬑藙忆義谥溢诣议谊譯異翼翌绎筃荫洇殷堷隂絪荶檭婬夤飮吚吲陻茚渶璎璎鹰應缨瑩萤營荧蝇迊赢盁影颕哽眏喲砽砽臃痈滽澭踊蛹怺怺悀怺恿湧鼡豳沋滺沋尤甴邮铀沋怞遊酉洧伖祐祐釉诱叒孧扜菸纡盂榆虞愚舆悇揄揄渔揄揄渔隅予娯雨玙屿禹荢娪羽砡域芋喐吁喁喻峪御匬慾獄唷謍浴寓裕預豫驭鴛棩寃沅垣媴厡瑗辕圎園園猿羱緣逺夗蒝葾阮曰箹樾跞钥捳粵仴哾閱秐囩郧枃殒狁運藴酝暈韻夃匝咂卆酨酨災宰酨侢茬洎瓒暫瓒賍賍髒蹧蹧凿藻栆皁璪蚤璪璪慥唣灶璪嫧萚荝澤賊怎熷璔嶒熷紥喳碴札轧铡閘喳栅搾咋咋怍怍擿斋宅搾債寨瞻毡詹秥跕盏斬辗崭蹍蘸棧颭戰跕偡綻樟嶂彰漳張礃涨粀扙賬账扙胀瘴障妱昭找沼趙燳罩狣肇佋嗻菥悊蛰辙鍺锗蔗適淅沴斟嫃甄砧臻浈針浈忱疹沴震桭鎮俥篜諍諍姃狰踭姃整拯囸炡帧症鄭姃芷汥伎汥倁倁汥脂汥と枳轵矗淔殖秇惪侄歮栺圵趾呮旨衹梽挚掷臸臸置帜峙淛潪秩雉質炙痔滞菭窒狆盅筗妕衷蔠種妕偅仲衆洀淍詶詶诌粥轴肘帚咒皺宙昼骤咮株咮咮蕏渚诛豩艸烛煑拄瞩瞩炷著炷莇蛀贮铸茿炷炷柷驻抓爪跩抟磚啭撰賺篆桩圧裝妝獞匨匨椎锥搥赘墜綴谆痽浞炪婥棹琢茁酌啄着灼浊兹恣粢恣稵淄孜橴仔籽滓ふ洎渍牸鬃琮琮崈琮縂枞邹趉楱楱蒩娖卒蔟袓蒩蒩蒩鑽纂觜酔朂嶵澊噂葃咗佐柞莋莋唑蓙錒噯嬡璦曖靄諳銨鵪媼驁鰲鈀唄鈑鴇齙鵯賁錛蓽嗶潷鉍篳蹕芐緶籩驃颮飆鏢鑣鰾儐繽檳殯臏鑌髕鬢稟餑鈸鵓鈽驂黲惻鍤儕釵囅諂讖蕆懺嬋驏覘禪鐔倀萇悵閶鯧硨傖諶櫬磣齔棖檉鋮鐺飭鴟銃儔幬讎芻絀躕釧愴綞鶉輟齪鶿蓯驄樅輳攛銼鹺噠韃駘紿殫賧癉簞讜碭襠燾鐙糴詆諦綈覿鏑巔鈿癲銚鯛鰈鋌銩崠鶇竇瀆櫝牘篤黷籪懟鐓燉躉鐸諤堊閼軛鋨鍔鶚顎顓鱷誒邇鉺鴯鮞鈁魴緋鐨鯡僨灃鳧駙紱紼賻麩鮒鰒釓賅尷搟紺戇睪誥縞鋯紇鎘潁亙賡綆鯁詬緱覯詁轂鈷錮鴣鵠鶻鴰摑詿摜鸛鰥獷匭劌媯檜鮭鱖袞緄鯀堝咼幗槨蟈鉿闞絎頡灝顥訶闔蠣黌訌葒閎鱟滸鶘驊樺鏵奐繯鍰鯇鰉詼薈噦澮繢琿暉諢餛閽鈥鑊訐詰薺嘰嚌驥璣覬齏磯羈蠆躋霽鱭鯽郟浹鋏鎵蟯諫縑戔戩瞼鶼筧鰹韉絳韁撟嶠鷦鮫癤頜鮚巹藎饉縉贐覲剄涇逕弳脛靚鬮鳩鷲詎屨櫸颶鉅鋦窶齟錈鐫雋譎玨皸剴塏愾愷鎧鍇龕閌鈧銬騍緙軻鈳錁頷齦鏗嚳鄶噲膾獪髖誆誑鄺壙纊貺匱蕢憒聵簣閫錕鯤蠐崍徠淶瀨賚睞錸癩籟嵐欖斕鑭襤閬鋃嘮嶗銠鐒癆鰳誄縲儷酈壢藶蒞蘺嚦邐驪縭櫪櫟轢礪鋰鸝癘糲躒靂鱺鱧蘞奩瀲璉殮褳襝鰱魎繚釕鷯藺廩檁轔躪綾欞蟶鯪瀏騮綹鎦鷚蘢瀧瓏櫳朧礱僂蔞嘍嶁鏤瘺耬螻髏壚擼嚕閭瀘淥櫨櫓轤輅轆氌臚鸕鷺艫鱸臠孌欒鸞鑾圇犖玀濼欏腡鏍櫚褸鋝嘸嘜嬤榪勱縵鏝顙鰻麼捫燜懣鍆羋謐獼禰澠靦黽緲繆閔緡謨驀饃歿鏌鉬鐃訥鈮鯢輦鯰蔦裊隉蘗囁顢躡苧嚀聹儂噥駑釹儺謳慪甌蹣皰轡紕羆鈹諞駢縹嬪釙鏷鐠蘄騏綺榿磧頎頏鰭僉蕁慳騫繾槧鈐嬙檣戧熗錆鏘鏹羥蹌誚譙蕎繰磽蹺愜鍥篋鋟撳鯖煢蛺巰賕蟣鰍詘嶇闃覷鴝詮綣輇銓闋闕愨蕘嬈橈飪軔嶸蠑縟銣顰蜆颯毿糝繅嗇銫穡鎩鯊釃訕姍騸釤鱔坰殤觴厙灄畬詵諗瀋謚塒蒔弒軾貰鈰鰣綬攄紓閂鑠廝駟緦鍶鷥藪餿颼鎪謖穌誶蓀猻嗩脧闥鉈鰨鈦鮐曇鉭錟頇儻餳鐋鏜韜鋱緹鵜闐糶齠鰷慟鈄釷摶飩籜鼉媧膃紈綰輞諉幃闈溈潿瑋韙煒鮪閿萵齷鄔廡憮嫵騖鵡鶩餼鬩璽覡硤莧薟蘚峴獫嫻鷴癇蠔秈躚薌餉驤緗饗嘵瀟驍綃梟簫褻擷紲纈陘滎饈鵂詡頊諼鉉鏇謔澩鱈塤潯鱘埡婭椏氬厴贗儼兗讞懨閆釅魘饜鼴煬軺鷂鰩靨謁鄴曄燁詒囈嶧飴懌驛縊軼貽釔鎰鐿瘞艤銦癮塋鶯縈鎣攖嚶瀅瀠瓔鸚癭頦罌鏞蕕銪魷傴俁諛諭蕷崳飫閾嫗紆覦歟鈺鵒鷸齬櫞鳶黿鉞鄆蕓惲慍紜韞殞氳瓚趲鏨駔賾嘖幘簀譖繒譫詔釗謫輒鷓湞縝楨軫賑禎鴆諍崢鉦錚箏騭櫛梔軹輊贄鷙螄縶躓躑觶鍾紂縐佇櫧銖囀饌顳騅縋諑鐲諮緇輜貲眥錙齜鯔傯諏騶鯫鏃纘躦鱒訁譾郤猛氹阪壟堖垵墊檾蕒葤蓧蒓菇槁摣咤唚哢噝噅撅劈謔襆嶴脊仿僥獁麅餘餷饊饢楞怵懍爿漵灩混濫瀦淡寧糸絝緔瑉梘棬案橰櫫軲軤賫膁腖飈糊煆溜湣渺碸滾瞘鈈鉕鋣銱鋥鋶鐦鐧鍩鍀鍃錇鎄鎇鎿鐝鑥鑹鑔穭鶓鶥鸌癧屙瘂臒襇繈耮顬蟎麯鮁鮃鮎鯗鯝鯴鱝鯿鰠鰵鱅鞽韝齇';
}

function trans(obj) {
	for (key in obj) {
		if (typeof (obj[key]) == 'object') { // 深层遍历
			if (Array.isArray(obj[key])) { // 数组
				for (let i = 0; i < obj[key].length; i++) {
					trans(obj[key][i]);
				}
			} else { // 对象
				trans(obj[key])
			}
		} else {
			// 翻译
			if (key === 'title' || key === 'name' || key === 'promoText') { //可能是繁体中文的key
				obj.key = fry_simplized(obj[key])
			}
		}
	}
}

//转换成简体
function fry_simplized(cc) {
	let str = '';
	for (let i = 0; i < cc.length; i++) {
		if (ftPYStr().indexOf(cc.charAt(i)) != -1)
			str += simpPYStr().charAt(ftPYStr().indexOf(cc.charAt(i)));
		else if (qqPYStr().indexOf(cc.charAt(i)) != -1)
			str += simpPYStr().charAt(qqPYStr().indexOf(cc.charAt(i)));
		else
			str += cc.charAt(i);
	}
	return str;
}

/***************** Env *****************/
// prettier-ignore
// https://github.com/chavyleung/scripts/blob/master/Env.min.js
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}isStash(){return"undefined"!=typeof $environment&&$environment["stash-version"]}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){if(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:i,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:i,statusCode:r,headers:o,rawBody:h},s.decode(h,this.encoding))},t=>{const{message:i,response:r}=t;e(i,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let i=require("iconv-lite");this.initGotEnv(t);const{url:r,...o}=t;this.got[s](r,o).then(t=>{const{statusCode:s,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:s,statusCode:r,headers:o,rawBody:h},i.decode(h,this.encoding))},t=>{const{message:s,response:r}=t;e(s,r,r&&i.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,i=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":i}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}

// https://github.com/VirgilClyne/VirgilClyne/blob/main/function/URL/URLs.embedded.min.js
function URLs(s){return new class{constructor(s=[]){this.name="URL v1.0.0",this.opts=s,this.json={url:{scheme:"",host:"",path:""},params:{}}}parse(s){let t=s.match(/(?<scheme>.+):\/\/(?<host>[^/]+)\/?(?<path>[^?]+)?\??(?<params>.*)?/)?.groups??null;return t?.params&&(t.params=Object.fromEntries(t.params.split("&").map((s=>s.split("="))))),t}stringify(s=this.json){return s?.params?s.scheme+"://"+s.host+"/"+s.path+"?"+Object.entries(s.params).map((s=>s.join("="))).join("&"):s.scheme+"://"+s.host+"/"+s.path}}(s)}
