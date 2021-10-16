# iRingo
Committed to providing a complete Apple service experience.  
以下模块在macOS 12.0 beta 10, iOS 15.0.2, iOS 14.7.1 测试通过  
  
[Geo_Services.sgmodule](./sgmodule/Geo_Services.sgmodule " Rewrite Apple Geo Services Country Code") 
安装链接: https://raw.githubusercontent.com/VirgilClyne/iRingo/main/sgmodule/Geo_Services.sgmodule   
启用模块后打开一次地图即可切换区域至US  
macOS/iOS适用  
无需飞行模式、关闭定位、更改国家地区语言  
用来查看Apple News或者激活「来自APPLE的内容\来自APPLE的建议(Siri建议\Siri Suggestions)」时使用  
  
[Siri_Suggestions.sgmodule](./sgmodule/Siri_Suggestions.sgmodule " Location-Based Siri Suggestions for Spotlight & Look Up & Safari")  
安装链接: https://raw.githubusercontent.com/VirgilClyne/iRingo/main/sgmodule/Siri_Suggestions.sgmodule  
启用模块即可保持「来自APPLE的内容\来自APPLE的建议(Siri建议\Siri Suggestions)」持续可用   
macOS/iOS适用  
可能需要启用Geo_Services.sgmodule模块激活一下此功能，激活后可关闭Geo_Services.sgmodule  
启用的功能包括: Siri资料、Siri建议的网站、维基百科、比赛比分、股票信息、App Store\Mac App Store、电影、音乐、新闻  
注：对北美地区「Siri建议」服务器无效(SSL Pinning)  
https://api.smoot.apple.com             （有效）  
https://api-aka-*.smoot.apple.com       （有效）  
https://api-glb.smoot.apple.com         （有效）  
https://api-glb-usw*.smoot.apple.com    （北美地区：无效）  
https://api-glb-euc*.smoot.apple.com    （欧洲地区：有效）  
https://api-glb-apne*.smoot.apple.com   （亚太地区：有效）  