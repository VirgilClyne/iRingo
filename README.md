# iRingo
解锁完整的Apple搜索功能和集成服务   
macOS 12.0 beta 10, iOS 15.0.2, iOS 14.7.1 测试通过  

---

> 目录  

* [定位服务](#Location%20Services)  
* [Siri与搜索](#Siri%20&amp;%20Search)    

---

### <a id="Location Services"> 定位服务 </a>    
[Geo_Services.sgmodule](./sgmodule/Geo_Services.sgmodule " Rewrite Apple Geo Services Country Code")   
安装链接: https://raw.githubusercontent.com/VirgilClyne/iRingo/main/sgmodule/Geo_Services.sgmodule   
启用模块后打开一次地图即可切换区域至US，无需飞行模式、关闭定位、更改国家地区语言   
macOS/iOS适用  
    作用:  
    
    - [x] 更改为海外版Apple Maps    
    - [x] 激活Apple News    
    - [x] 激活「来自APPLE的内容\来自APPLE的建议\Siri建议」   

---

### <a id="Siri & Search"> Siri与搜索 </a>  
[Siri_Suggestions.sgmodule](./sgmodule/Siri_Suggestions.sgmodule " Location-Based Siri Suggestions for Spotlight & Look Up & Safari")  
安装链接: https://raw.githubusercontent.com/VirgilClyne/iRingo/main/sgmodule/Siri_Suggestions.sgmodule  
启用模块即可保持「来自APPLE的内容(CONTENT FROM APPLE)\来自APPLE的建议(SUGGESTIONS FROM APPLE)\」持续可用   
macOS/iOS适用  
如启用后无效果，可以使用Geo_Services.sgmodule模块激活一下此功能，激活后可关闭Geo_Services.sgmodule  
    在以下位置可用: 

    - [x] 聚焦搜索(Spotlight)
    - [x] 查询(Look Up)
    - [ ] Safari浏览器(Safari)
    启用的功能:  
    - [x] 来自APPLE的内容(CONTENT FROM APPLE)
    - [x] 来自APPLE的建议(SUGGESTIONS FROM APPLE)
    - [x] Siri建议(Siri Suggestions)
    已知可用的信息卡片:  
    - [x] Siri资料(Siri Knowledge)  截图:[macOS](./ScreenShots/Siri%20Knowledge%20-%20Spotlight%20-%20macOS.png "Siri Knowledge - Spotlight - macOS")  
    - [x] Siri建议的网站(Siri Suggested Websites)   
    - [x] 维基百科  
    - [x] 比赛比分  
    - [x] 股票信息  截图:[macOS](./ScreenShots/Stock%20-%20Spotlight%20-%20macOS.png "Stock - Spotlight - macOS")   
    - [x] 航班信息
    - [x] App Store\Mac App Store  截图:[macOS](./ScreenShots/Mac%20App%20Store%20-%20Spotlight%20-%20macOS.png "Mac App Store - Spotlight - macOS")    
    - [x] 电影  
      - [x] tv  截图:[macOS](./ScreenShots/tv%20-%20Spotlight%20-%20macOS.png "tv - Spotlight - macOS")  
    - [x] 音乐  
      - [x] Apple Music  截图:[macOS](./ScreenShots/Apple%20Music%20-%20Spotlight%20-%20macOS.png "Apple Music - Spotlight - macOS")    
    - [x] 新闻  

注：对北美地区「Siri建议」服务器无效(SSL Pinning)  
https://api.smoot.apple.com             （有效）  
https://api-aka-*.smoot.apple.com       （有效）  
https://api-glb.smoot.apple.com         （有效）  
https://api-glb-usw*.smoot.apple.com    （北美地区：无效）  
https://api-glb-euc*.smoot.apple.com    （欧洲地区：有效）  
https://api-glb-apne*.smoot.apple.com   （亚太地区：有效）  