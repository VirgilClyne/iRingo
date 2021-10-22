# iRingo
解锁完整的Apple搜索功能和集成服务   
macOS 12.0.1, iOS 15.0.2, iOS 14.8 测试通过  
需要启用MitM功能  
以下功能及模块互无依赖，均可单独或搭配使用  

---

> 目录  
* [教程:通用配置](#General#%20Configuration) (todo)    
* [定位服务](#Location%20Services)  
* [Siri与搜索](#Siri%20&amp;%20Search) 
* [Apple Maps](#Apple%20Maps) (todo)   
* [Apple News](#Apple%20News) (🚧施工中，暂不可用)
---

### <a id="General Configuration"> 教程:通用配置 </a>  
todo  
三个模块:   
`地区检测为🇺🇸US` + `修改Apple Maps为🇨🇳CN` + `修改Apple News为🇺🇸US` = 地区检测US，Apple Maps高德地图，Apple News可用   
(有SIM卡的设备，第一次打开Apple News前，需要开启飞行模式跳过SIM卡检测，打开后可关闭飞行模式)    

---

### <a id="Location Services"> 定位服务 </a>     
* 安装链接: 
  * Loon:
    * 旧版未更新:[Geo_Services.plugin](./plugin/Geo_Services.plugin?raw=true " Rewrite Apple Geo Services Country Code") (Author:@Tartarus2014) 
  * Quantumult X:
    * 旧版未更新:[Geo_Services.conf](./conf/Geo_Services.conf?raw=true " Rewrite Apple Geo Services Country Code")
  * Surge:    
    * 修改地区检测为🇺🇸US:[Geo_Services.sgmodule](./sgmodule/Geo_Services.sgmodule?raw=true " Redirect Geo Services to 🇺🇸US")
    * 修改地区检测为🇨🇳CN:[Geo_Services_CN.sgmodule](./sgmodule/Geo_Services_CN.sgmodule?raw=true " Redirect Geo Services to 🇨🇳CN")        
* 启用模块后无需开启飞行模式、关闭定位、更改代理线路、更改国家地区语言等即可修改至对应地区   
* 需触发一次定位检测(`com.apple.geod`进程的`configuration.ls.apple.com`, `gspe1-ssl.ls.apple.com`二连访问) 
* 可通过重启、完全重开地图应用、开关定位服务等触发检测  
* macOS/iOS适用  
    * 作用:  
    - [x] 更改地区检测至模块指定地区
    - [x] 副作用:会同时影响Apple Maps和Apple News等的地区判断(可通过相应的模块单独修改)   
    - [x] 激活Apple News时不需要全局代理、关闭定位服务 (IP检测不在此模块解决范围)  
    - [x] 激活「来自APPLE的内容\来自APPLE的建议\Siri建议」(不需要保持`Geo_Services.sgmodule`一直启用)   
* 注:本模块只修改定位服务，不修改其他进程、链接、域名、线路规则(如:Siri建议,AppleMap,Apple News等服务)

---

### <a id="Siri & Search"> Siri与搜索 </a>   
* 安装链接:
  * Loon:
    * [Siri_Suggestions.plugin](./plugin/Siri_Suggestions.plugin?raw=true " Location-Based Siri Suggestions for Spotlight & Look Up & Safari") (Author:@Tartarus2014) (该插件需要匹配代理策略组)
  * Quantumult X:
    * [Siri_Suggestions.conf](./conf/Siri_Suggestions.conf?raw=true " Location-Based Siri Suggestions for Spotlight & Look Up & Safari") (Author:Telegram:@YiEwha)
  * Surge:     
    * 针对代理组为PROXY的配置文件:[Siri_Suggestions.sgmodule](./sgmodule/Siri_Suggestions.sgmodule?raw=true " Location-Based Siri Suggestions for Spotlight & Look Up & Safari")
    * 针对代理组为Proxy的配置文件:[Siri_Suggestions_for_Proxy.sgmodule](./sgmodule/Siri_Suggestions_for_Proxy.sgmodule?raw=true " Location-Based Siri Suggestions for Spotlight & Look Up & Safari") 
    * 针对代理组为🌑Proxy的配置文件(如:DivineEngine):[Siri_Suggestions_for_DivineEngine.sgmodule](./sgmodule/Siri_Suggestions_for_DivineEngine.sgmodule?raw=true " Location-Based Siri Suggestions for Spotlight & Look Up & Safari") 
    * 针对代理组为Apple的配置文件:[Siri_Suggestions_for_Apple.sgmodule](./sgmodule/Siri_Suggestions_for_Apple.sgmodule?raw=true " Location-Based Siri Suggestions for Spotlight & Look Up & Safari") 
    * 针对代理组为🍎Apple的配置文件(如:ACL4SSR):[Siri_Suggestions_for_ACL4SSR.sgmodule](./sgmodule/Siri_Suggestions_for_ACL4SSR.sgmodule?raw=true " Location-Based Siri Suggestions for Spotlight & Look Up & Safari") 
    * 自定义规则组的配置文件:[Siri_Suggestions_noRuleSet.sgmodule](./sgmodule/Siri_Suggestions_noRuleSet.sgmodule?raw=true " Location-Based Siri Suggestions for Spotlight & Look Up & Safari"),规则组:[Wikipedia_for_Look_Up.list](./RuleSet/Wikipedia_for_Look_Up.list?raw=true "Wikipedia for Look Up")
* 保持模块启用,即可正常使用「来自APPLE的内容\来自APPLE的建议\Siri建议」   
* macOS/iOS适用  
* 如启用本模块后未立刻生效，可采用下列方法手动刷新激活「Siri建议」:
  1. macOS上关闭再开启`系统偏好设置`-`聚焦`-`Siri建议`
  2. iOS上关闭再开启`设置`-`Siri与搜索`-`来自APPLE的内容`和`来自APPLE的建议`
  3. 更改`设置`-`通用`-`语言与地区`-`地区`  
  4. 启用`Geo_Services.sgmodule`模块并打开`Apple Maps`，刷新地图后再关闭`Geo_Services.sgmodule`
  5. 等待约半小时，「Siri建议」会向服务器`*.smoot.apple.com/bag`请求刷新区域设置与功能可用状态
* 「询问Siri」的搜索结果直接来源于`guzzoni.apple.com`,无法MitM改写请求
    * 在以下位置及功能中可用: 
    - [x] 聚焦搜索(Spotlight)
    - [x] 查询(Look Up)
    - [x] Safari浏览器(Safari)
    - [ ] 询问Siri (Ask Siri on iOS:国内版/macOS:海外版)
    * 启用的功能:  
    - [x] 来自APPLE的内容(CONTENT FROM APPLE)
    - [x] 来自APPLE的建议(SUGGESTIONS FROM APPLE)
    - [x] Siri建议(Siri Suggestions) (Safari浏览器起始页中的「Siri建议」暂不可用)
    * 已知可用的信息卡片:  
    - [x] Siri资料(Siri Knowledge)  截图:[macOS](./ScreenShots/Siri%20Knowledge%20-%20Spotlight%20-%20macOS.png?raw=true "Siri Knowledge - Spotlight - macOS")   
    - [x] Siri建议的网站(Siri Suggested Websites)  
    - [x] 维基百科 (macOS端需要Surge启用“增强模式”)  
    - [x] 体育  截图:[macOS](./ScreenShots/Sports%20-%20Spotlight%20-%20macOS.png?raw=true "Sports - Spotlight - macOS") / [iOS](./ScreenShots/Sports%20-%20Spotlight%20-%20iOS.jpeg?raw=true "Sports - Spotlight - iOS")   
    - [x] 股票  截图:[macOS](./ScreenShots/Stock%20-%20Spotlight%20-%20macOS.png?raw=true "Stock - Spotlight - macOS")   
    - [x] 航班  截图:[macOS](./ScreenShots/Flights%20-%20Spotlight%20-%20macOS.png?raw=true "Flights - Spotlight - macOS")   
    - [x] App Store\Mac App Store  截图:[macOS](./ScreenShots/Mac%20App%20Store%20-%20Spotlight%20-%20macOS.png?raw=true "Mac App Store - Spotlight - macOS") / [iOS](./ScreenShots/App%20Store%20-%20Spotlight%20-%20iOS.jpeg?raw=true "App Store - Spotlight - iOS")    
    - [x] 电影 & 电视节目   
      - [x] tv  截图:[macOS](./ScreenShots/tv%20-%20Spotlight%20-%20macOS.png?raw=true "tv - Spotlight - macOS")   
      - [x] iTunes  
    - [x] 音乐  
      - [x] Apple Music  截图:[macOS](./ScreenShots/Apple%20Music%20-%20Spotlight%20-%20macOS.png?raw=true "Apple Music - Spotlight - macOS") / [iOS](./ScreenShots/Apple%20Music%20-%20Spotlight%20-%20iOS.jpeg?raw=true "Apple Music - Spotlight - iOS")   
      - [x] iTunes  
    - [x] 新闻  

* ~~注:对北美地区「Siri建议」服务器无效(SSL Pinning)~~
* 经群友测试对美西「Siri建议」服务器有效
* 可通过Surge的`工具`-`最近请求`或`请求查看器`查看最近的*.smoot.apple.com前缀判断当前服务器
* ~~如分配至api-glb-usw服务器且MitM失败，可以通过开关飞行模式、清除DNS缓存、更改VPN线路、更新/更换GeoIP数据库等方式刷新至支持的服务器~~
* 
    * 「Siri建议」服务器支持情况:     
    - [x] https://api.smoot.apple.com           (有效)  
    - [x] https://api-aka.smoot.apple.com       (有效)    
    - [x] https://api-glb.smoot.apple.com       (有效)    
    - [x] https://api-glb-usw.smoot.apple.com   (美西：有效)  
    - [x] https://api-glb-euc.smoot.apple.com   (欧洲中：有效)
    - [x] https://api-glb-apne.smoot.apple.com  (亚太东北：有效) 
    - [x] https://api-glb-apse.smoot.apple.com  (亚太东南：有效)

---

### <a id="Apple Maps"> Apple Maps </a>  
* 安装链接: 
  * Surge:    
    * 修改Apple Maps为🇺🇸US:[Apple Maps.sgmodule](./sgmodule/Apple_Maps.sgmodule?raw=true " Redirect Apple Maps to 🇺🇸US")
    * 修改Apple Maps为🇨🇳CN:[Apple Maps_CN.sgmodule](./sgmodule/Apple_Maps_CN.sgmodule?raw=true " Redirect Apple Maps to 🇨🇳CN")      
todo  

---

### <a id="Apple News"> Apple News </a>  
* 安装链接:
  * Loon:
    * [Apple_News.plugin](./plugin/Apple_News.plugin?raw=true " Unlock Apple News without SIM Card Detect") (Author:@Tartarus2014) (该插件需要匹配代理策略组)
  * Surge:  
    * 针对代理组为PROXY的配置文件:[Apple_News.sgmodule](./sgmodule/Apple_News.sgmodule?raw=true " Unlock Apple News without SIM Card Detect")
    * 针对代理组为Proxy的配置文件:[Apple_News_for_Proxy.sgmodule](./sgmodule/Apple_News_for_Proxy.sgmodule?raw=true " Unlock Apple News without SIM Card Detect") 
    * 针对代理组为🌑Proxy的配置文件(如:DivineEngine):[Apple_News_for_DivineEngine.sgmodule](./sgmodule/Apple_News_for_DivineEngine.sgmodule?raw=true " Unlock Apple News without SIM Card Detect") 
    * 针对代理组为Apple的配置文件:[Apple_News_for_Apple.sgmodule](./sgmodule/Apple_News_for_Apple.sgmodule?raw=true " Unlock Apple News without SIM Card Detect") 
    * 针对代理组为🍎Apple的配置文件(如:ACL4SSR):[Apple_News_for_ACL4SSR.sgmodule](./sgmodule/Apple_News_for_ACL4SSR.sgmodule?raw=true " Unlock Apple News without SIM Card Detect") 
    * 针对代理组为Apple News的配置文件:[Apple_News_for_Apple_News.sgmodule](./sgmodule/Apple_News_for_Apple_News.sgmodule?raw=true " Unlock Apple News without SIM Card Detect") 
    * 自定义规则组的配置文件[Apple_News_noRuleSet.sgmodule](./sgmodule/Apple_News_noRuleSet.sgmodule?raw=true " Unlock Apple News without SIM Card Detect"),规则组:[Apple_News.list](./RuleSet/Apple_News.list?raw=true "Apple_News")
* 启用模块后打开一次地图即可切换区域至`US`(美国)且可以使用Apple News，无需开启飞行模式、移除SIM卡、关闭定位、更改语言等 
* 此模块包含`Geo_Services.sgmodule`模块内容，区别是修改地区为`US`而非`HK`
* macOS/iOS适用  
  * 使用方法: 
    1. 修改相关线路为🇺🇸美国
    2. ~~iOS需要修改`设置`-`新闻`-`位置：永不`和`蜂窝数据：关闭`~~  
    3. 打开`地图`触发一次定位检测(`com.apple.geod`进程的`configuration.ls.apple.com`, `gspe35-ssl.ls.apple.com`二连访问) (不确定此步骤是否必须🤔)
    4. 打开Apple News
