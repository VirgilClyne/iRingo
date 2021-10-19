# iRingo
解锁完整的Apple搜索功能和集成服务   
macOS 12.0 beta 10, iOS 15.0.2, iOS 14.7.1 测试通过  
需要启用MitM功能,以下功能及模块互无依赖，均可单独使用

---

> 目录  

* [定位服务](#Location%20Services)  
* [Siri与搜索](#Siri%20&amp;%20Search) 
* [Apple Map](#Apple%20Map) (todo)   
* [Apple News](#Apple%20News) (todo)
---

### <a id="Location Services"> 定位服务 </a>     
* 安装链接:     
  * [Geo_Services.sgmodule](./sgmodule/Geo_Services.sgmodule?raw=true " Rewrite Apple Geo Services Country Code")     
* 启用模块后打开一次地图即可切换区域至`HK`(香港)，无需开启飞行模式、关闭定位、更改国家地区语言等   
* 需触发一次定位检测(`com.apple.geod`进程的`configuration.ls.apple.com`, `gspe35-ssl.ls.apple.com`二连访问)   
* macOS/iOS适用  
    * 作用:  
    - [x] 更改为海外版Apple Maps    
    - [x] 激活/使用Apple News时不需要保持飞行模式或关闭定位服务(IP检测不在此模块解决范围)    
    - [x] 激活「来自APPLE的内容\来自APPLE的建议\Siri建议」(不需要保持`Geo_Services.sgmodule`一直启用)   
* 注:本模块只修改定位服务，不修改其他进程、链接、域名、线路规则(如:Siri建议,AppleMap,Apple News等服务)

---

### <a id="Siri & Search"> Siri与搜索 </a>   
* 安装链接:     
  * 针对代理组为PROXY的配置文件:[Siri_Suggestions.sgmodule](./sgmodule/Siri_Suggestions.sgmodule?raw=true " Location-Based Siri Suggestions for Spotlight & Look Up & Safari")
  * 针对代理组为Proxy的配置文件:[Siri_Suggestions_for_Proxy.sgmodule](./sgmodule/Siri_Suggestions_for_Proxy.sgmodule?raw=true " Location-Based Siri Suggestions for Spotlight & Look Up & Safari") 
  * 针对代理组为🌑Proxy的配置文件(如:DivineEngine):[Siri_Suggestions_for_DivineEngine.sgmodule](./sgmodule/Siri_Suggestions_for_DivineEngine.sgmodule?raw=true " Location-Based Siri Suggestions for Spotlight & Look Up & Safari") 
  * 针对代理组为Apple的配置文件:[Siri_Suggestions_for_Apple.sgmodule](./sgmodule/Siri_Suggestions_for_Apple.sgmodule?raw=true " Location-Based Siri Suggestions for Spotlight & Look Up & Safari") 
  * 针对代理组为🍎Apple的配置文件(如:ACL4SSR):[Siri_Suggestions_for_ACL4SSR.sgmodule](./sgmodule/Siri_Suggestions_for_ACL4SSR.sgmodule?raw=true " Location-Based Siri Suggestions for Spotlight & Look Up & Safari") 
  * 自定义规则组的配置文件:[Siri_Suggestions_noRuleSet.sgmodule](./sgmodule/Siri_Suggestions_noRuleSet.sgmodule?raw=true " Location-Based Siri Suggestions for Spotlight & Look Up & Safari"),规则组:[Wikipedia_for_Look_Up.list](./RuleSet/Wikipedia_for_Look_Up.list?raw=true "Wikipedia for Look Up")
* 保持模块启用,即可正常使用「来自APPLE的内容\来自APPLE的建议\Siri建议」   
* macOS/iOS适用  
* macOS需要开启`系统偏好设置`-`聚焦`-`Siri建议`
* iOS需要开启`设置`-`Siri与搜索`-`来自APPLE的内容`和`来自APPLE的建议`
* 如启用后无效果，可以开关一下上述的功能开关，或使用`Geo_Services.sgmodule`模块激活一下，激活后可关闭`Geo_Services.sgmodule`  
    * 在以下位置及功能中可用: 
    - [x] 聚焦搜索(Spotlight)
    - [x] 查询(Look Up)
    - [x] Safari浏览器(Safari)
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

* 注:对北美地区「Siri建议」服务器无效(SSL Pinning)   
* 可通过Surge的`工具`-`最近请求`或`请求查看器`查看最近的*.smoot.apple.com前缀判断当前服务器
* 如分配至api-glb-usw服务器且MitM失败，可以通过开关飞行模式、清除DNS缓存、更改VPN线路等方式刷新至支持的服务器
    * 「Siri建议」服务器支持情况:     
    - [x] https://api.smoot.apple.com           (有效)  
    - [x] https://api-aka.smoot.apple.com       (有效)    
    - [x] https://api-glb.smoot.apple.com       (有效)    
    - [ ] https://api-glb-usw.smoot.apple.com   (美西：无效)  
    - [x] https://api-glb-euc.smoot.apple.com   (欧洲中：有效)
    - [x] https://api-glb-apne.smoot.apple.com  (亚太东北：有效) 
    - [x] https://api-glb-apse.smoot.apple.com  (亚太东南：有效)

---

### <a id="Apple News"> Apple News </a>  
* 安装链接:     
  * 针对代理组为PROXY的配置文件:[Apple_News.sgmodule](./sgmodule/Apple_News.sgmodule?raw=true " Unlock Apple News without SIM Card Detect")
  * 针对代理组为Proxy的配置文件:[Apple_News_for_Proxy.sgmodule](./sgmodule/Apple_News_for_Proxy.sgmodule?raw=true " Unlock Apple News without SIM Card Detect") 
  * 针对代理组为🌑Proxy的配置文件(如:DivineEngine):[Apple_News_for_DivineEngine.sgmodule](./sgmodule/Apple_News_for_DivineEngine.sgmodule?raw=true " Unlock Apple News without SIM Card Detect") 
  * 针对代理组为Apple的配置文件:[Apple_News_for_Apple.sgmodule](./sgmodule/Apple_News_for_Apple.sgmodule?raw=true " Unlock Apple News without SIM Card Detect") 
  * 针对代理组为🍎Apple的配置文件(如:ACL4SSR):[Apple_News_for_ACL4SSR.sgmodule](./sgmodule/Apple_News_for_ACL4SSR.sgmodule?raw=true " Unlock Apple News without SIM Card Detect") 
  * 针对代理组为Apple News的配置文件:[Apple_News_for_Apple_News.sgmodule](./sgmodule/Apple_News_for_Apple_News.sgmodule?raw=true " Unlock Apple News without SIM Card Detect") 
  * 自定义规则组的配置文件[Apple_News_noRuleSet.sgmodule](./sgmodule/Apple_News_noRuleSet.sgmodule?raw=true " Unlock Apple News without SIM Card Detect"),规则组:[Apple_News.list](./RuleSet/Apple_News.list?raw=true "Apple_News")
* 启用模块后打开一次地图即可切换区域至`US`(美国)且可以使用Apple News，无需保持飞行模式开启、移除SIM卡、关闭定位、更改语言等 
* 此模块包含`Geo_Services.sgmodule`模块内容，区别是修改地区为US而非HK
* macOS/iOS适用  
  * 使用方法: 
    1. iOS需要设置`设置`-`新闻`-`位置：永不`和`蜂窝数据：关闭`  
    2. 打开`地图`触发一次定位检测(`com.apple.geod`进程的`configuration.ls.apple.com`, `gspe35-ssl.ls.apple.com`二连访问) 
