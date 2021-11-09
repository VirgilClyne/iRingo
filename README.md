# iRingo
解锁完整的Apple功能和集成服务   
macOS 12.0.1, iOS 15.0.2, iOS 14.8 测试通过  
需要启用`重写`、`脚本`、`MitM`功能  
如无特别声明，以下功能及模块，均适用于iOS/iPadOS/macOS/watchOS，模块间互无依赖，均可单独或搭配使用  
有问题请至Issue页面反馈或移步Telegram讨论组:[NobyDa Script](https://t.me/joinchat/JtzRlVY-WyJPDavvhKjrbw)  

---

> 目录  
- [iRingo](#iringo)
- [通用配置](#通用配置)
  - [todo](#todo)
  - [示例](#示例)
- [天气](#天气)
  - [简介](#简介)
  - [功能列表](#功能列表)
  - [关于天气API](#关于天气api)
  - [安装链接](#安装链接)
- [定位服务](#定位服务)
  - [简介](#简介-1)
  - [激活方式](#激活方式)
  - [作用与副作用](#作用与副作用)
  - [安装链接](#安装链接-1)
- [Siri与搜索](#siri与搜索)
  - [简介](#简介-2)
  - [激活方式](#激活方式-1)
  - [辅助激活与切换「Siri建议」服务器地区的方式](#辅助激活与切换siri建议服务器地区的方式)
  - [功能列表](#功能列表-1)
  - [已知「Siri建议」服务器列表](#已知siri建议服务器列表)
  - [安装链接](#安装链接-2)
- [Apple Maps](#apple-maps)
  - [简介](#简介-3)
  - [激活方式](#激活方式-2)
  - [安装链接](#安装链接-3)
- [Apple News](#apple-news)
  - [简介](#简介-4)
  - [激活方式](#激活方式-3)
  - [解锁状态说明](#解锁状态说明)
  - [安装链接](#安装链接-4)

---

# 通用配置
## todo
## 示例
  * 同时启用以下一个模块:
    * `Siri与搜索`
    * 效果: `来自APPLE的内容\来自APPLE的建议\Siri建议`功能可用   
  * 同时启用以下两个模块: 
    * `地区检测为🇨🇳CN` + `修改Apple Maps为🇺🇸US`
    * 效果: `基于网络的地区检测`为`CN` + `Apple Maps`为`TOMTOM` + `指南针`经纬度与海拔功能正常 
  * 同时启用以下三个模块:   
    * `地区检测为🇺🇸US` + `修改Apple Maps为🇨🇳CN` + `修改Apple News为🇺🇸US`  
    * 效果: `基于网络的地区检测`为`US` + `Apple Maps`为`高德地图` + `指南针`无经纬度与海拔(iOS 15.1) + `Apple News`可用 
  * 同时启用以下四个模块:   
    * `地区检测为🇺🇸US` + `修改Apple Maps为🇨🇳CN` + `修改Apple News为🇺🇸US` + `Siri与搜索`
    * 效果: `基于网络的地区检测`为`US` + `Apple Maps`为`高德地图` + `指南针`无经纬度与海拔(iOS 15.1) + `Apple News`可用 + `来自APPLE的内容\来自APPLE的建议\Siri建议`功能可用

  * 注:  
    * 有SIM卡的设备，如iPhone，第一次打开`Apple News`前，需要开启`✈️飞行模式`跳过SIM卡检测，进入APP后可关闭`✈️飞行模式`正常使用  
    * 有SIM卡的设备，如iPhone，只要检测到SIM卡，且SIM卡不属于可用地区，均会恢复到`Apple News`未解锁状态     

---

# 天气
## 简介
  * 保持模块启用,即可切换「天气」`空气质量`数据源为[World Air Quality Index Project](https://waqi.info/)，采用[美国AQI标准](https://zh.wikipedia.org/wiki/空气质量指标)的数据。

  * 注:
    * 天气信息来源为`weather-data.apple.com`的Watch可使用本模块改写天气信息，需要在Watch上安装相同的证书以进行MitM。

## 功能列表
  * 在以下位置及功能中可用: 
    - [x] 天气(`WeatherKit_Weather_iOS_Version XX.X`)
    - [x] 地图(`Maps_WeatherFoundation`)
    - [x] 小组件(`WeatherKit_WeatherWidget_iOS_Version XX.X`,`WeatherKit_WeatherWidget_macOS_`)
  * 切换逻辑
    * 切换所有`和风天气`的`空气质量`信息为[World Air Quality Index Project](https://waqi.info/)
    * 填补全球没有`空气质量`信息的为[World Air Quality Index Project](https://waqi.info/)  

## 关于天气API
  * 三种来源:
    * `api.weather.com`:部分Watch（不可修改）
    * `weather-data.apple.com`:iOS天气APP、macOS天气小组件、地图、部分Watch（可修改）
    * `weather-data-origin.apple.com`:iOS天气小组件、iOS天气APP的回退查询（不确定）
  * 两种版本：
    * `v1`:Watch、地图、iOS15以下的天气APP、macOS12以下的天气小组件
    * `v2`:iOS15以上的天气APP、macOS12以上的天气小组件

## 安装链接 
  * Loon:
    * 空气质量数据:[Apple_Weather.plugin](./plugin/Apple_Weather.plugin?raw=true " Replace Apple Weather 🇺🇸US with @waqi.info")
  * Quantumult X:
    * 空气质量数据:[Apple_Weather.qxrewrite](./qxrewrite/Apple_Weather.qxrewrite?raw=true " Replace Apple Weather with 🇺🇸US @waqi.info")
  * Surge:
    * 空气质量数据:[Apple_Weather.sgmodule](./sgmodule/Apple_Weather.sgmodule?raw=true " Replace Apple Weather with 🇺🇸US @waqi.info")
    * 空气质量地图(可用，可行性验证，未修正图层和坐标):[Apple_Weather_Map.beta.sgmodule](./sgmodule/Apple_Weather_Map.beta.sgmodule?raw=true " Replace Apple Weather Map with 🇺🇸US @waqi.info")
    * 空气质量地图(施工中，不可用，修正坐标和图层):[Apple_Weather_Map.alpha.sgmodule](./sgmodule/Apple_Weather_Map.alpha.sgmodule?raw=true " Replace Apple Weather Map with 🇺🇸US @waqi.info")

---

# 定位服务
## 简介
  * 保持模块启用,即可强制「定位服务」通过互联网检测`基于网络的地区检测`始终为特定地区，无需准备代理线路、保持`✈️飞行模式`开启、关闭定位、更改国家地区语言等。   

## 激活方式
* 需触发一次`基于网络的地区检测`
  * 指`com.apple.geod`进程对`configuration.ls.apple.com`, `gspe1-ssl.ls.apple.com`的二连访问
  * 是Wi-Fi版iPad与mac的标准检测方式
  * 仅Wi-Fi模式/有线网络下可触发“基于网络的定位检测”
  * 纯移动蜂窝网络下不触发此定位检测，将直接采用基于SIM卡的[移动设备网络代码](https://zh.wikipedia.org/wiki/移动设备网络代码)「MCC / MNC」进行检测
  * iPhone与移动蜂窝网络版ipad触发此检测需要预先开启`✈️飞行模式`后，再触发检测
  * 可通过完全重开`地图`应用、开关`定位服务`、重开`Apple News`等操作触发检测 
  
  * 注:
    * 基于SIM卡的[移动设备网络代码](https://zh.wikipedia.org/wiki/移动设备网络代码)「MCC / MNC」检测不在此模块解决范围  

## 作用与副作用
  * 作用:  
  - [x] 强制更改`基于网络的地区检测`结果至模块指定地区  
  - [x] 协助激活`Apple News` 
  - [x] 协助激活「来自APPLE的内容\来自APPLE的建议\Siri建议」(不需要保持`Geo_Services.sgmodule`一直启用) 
  - [x] `指南针`的海拔经纬度功能
  - [x] `询问Siri`切换为国际版(SIM卡设备会因「MCC / MNC」检测回退至国内百度版)
  * 副作用(单独使用此模块会有下列影响):
  - [ ] `天气`的数据源
  - [ ] `Siri建议`的服务器分配
  - [ ] `iTunes Store`的CDN分配
  - [ ] `Apple Maps`的地区版本
  - [ ] `Apple News`的可用性判断(可通过其他模块单独修改) 
  - [ ] 待发现  

## 安装链接 
  * Loon:
    * 修改地区检测为🇨🇳CN:[Geo_Services_CN.plugin](./plugin/Geo_Services_CN.plugin?raw=true " Redirect Geo Services to 🇨🇳CN") (Author:@Tartarus2014) 
    * 修改地区检测为🇺🇸US:[Geo_Services.plugin](./plugin/Geo_Services.plugin?raw=true " Redirect Geo Services to 🇺🇸US") (Author:@Tartarus2014) 
    * 修改地区检测为🇯🇵JP:[Geo_Services_JP.plugin](./plugin/Geo_Services_JP.plugin?raw=true " Redirect Geo Services to 🇯🇵JP")
  * Quantumult X:
    * 修改地区检测为🇨🇳CN:[Geo_Services_CN.qxrewrite](./qxrewrite/Geo_Services_CN.qxrewrite?raw=true " Redirect Geo Services to 🇨🇳CN")
    * 修改地区检测为🇺🇸US:[Geo_Services.qxrewrite](./qxrewrite/Geo_Services.qxrewrite?raw=true " Redirect Geo Services to 🇺🇸US")
    * 修改地区检测为🇯🇵JP:[Geo_Services_JP.qxrewrite](./qxrewrite/Geo_Services_JP.qxrewrite?raw=true " Redirect Geo Services to 🇯🇵JP")
  * Surge:
    * 修改地区检测为🇨🇳CN:[Geo_Services_CN.sgmodule](./sgmodule/Geo_Services_CN.sgmodule?raw=true " Redirect Geo Services to 🇨🇳CN")
    * 修改地区检测为🇺🇸US:[Geo_Services.sgmodule](./sgmodule/Geo_Services.sgmodule?raw=true " Redirect Geo Services to 🇺🇸US")
    * 修改地区检测为🇬🇧UK:[Geo_Services_UK.sgmodule](./sgmodule/Geo_Services_UK.sgmodule?raw=true " Redirect Geo Services to 🇬🇧UK")
    * 修改地区检测为🇭🇰HK:[Geo_Services_HK.sgmodule](./sgmodule/Geo_Services_HK.sgmodule?raw=true " Redirect Geo Services to 🇭🇰HK")
    * 修改地区检测为🇹🇼TW:[Geo_Services_TW.sgmodule](./sgmodule/Geo_Services_TW.sgmodule?raw=true " Redirect Geo Services to 🇹🇼TW")
    * 修改地区检测为🇯🇵JP:[Geo_Services_JP.sgmodule](./sgmodule/Geo_Services_JP.sgmodule?raw=true " Redirect Geo Services to 🇯🇵JP")
    * 修改地区检测为🇦🇺AU:[Geo_Services_AU.sgmodule](./sgmodule/Geo_Services_AU.sgmodule?raw=true " Redirect Geo Services to 🇦🇺AU")

---

# Siri与搜索
## 简介
  * 保持模块启用,即可正常使用「来自APPLE的内容\来自APPLE的建议\Siri建议」  

  * 注:
    * 「询问Siri」的搜索结果直接来源于`guzzoni.apple.com`,无法MitM改写请求。
    * 经反馈，本模块不再强制`Siri卡片`框架语言为`zh-CN`，将根据用户设备`语言与地区`设置进行变更。

## 激活方式
* 如启用本模块后未立刻生效，可按照下列步骤激活「来自APPLE的内容\来自APPLE的建议\Siri建议」:
  * 未装有SIM卡的iOS/iPadOS/macOS设备，可省略`✈️飞行模式`相关步骤
  1. 保持`Wi-Fi`或`有线网络`连接
  2. 启用`Geo_Services_*.sgmodule`模块（🇨🇳CN版除外，可辅以`全局代理`确保稳定）
  3. 开启`✈️飞行模式`
  4. 重新打开一次`地图`应用
  5. 此时应在`Surge`的`最近请求`或`Quantumult X`的`网络活动`中观察到:
     1. `基于网络的地区检测`的`gspe1-ssl.ls.apple.com`链接
     2. 激活`Siri建议`的`api.smoot.apple.com/bag`链接
  6. 执行一次Spotlight搜索，测试「来自APPLE的内容\来自APPLE的建议\Siri建议」是否正常工作
  7. 关闭`✈️飞行模式`
  8. 关闭`Geo_Services_*.sgmodule`模块
  9. 正常使用

## 辅助激活与切换「Siri建议」服务器地区的方式
* 不同地区的服务器提供的功能、搜索结果、建议有所不同，可通过下列手段刷新服务器
  * macOS上关闭再开启`系统偏好设置`-`聚焦`-`Siri建议`
  * iOS上关闭再开启`设置`-`Siri与搜索`-`来自APPLE的内容`和`来自APPLE的建议`
  * 更改`设置`-`通用`-`语言与地区`-`地区`  
  * 等待约半小时，「Siri建议」会向服务器`*.smoot.apple.com/bag`请求刷新区域设置与功能可用状态
  * 激活过程中采用不同地区的`Geo_Services_*.sgmodule`模块

## 功能列表
  * 在以下位置及功能中可用: 
    - [x] 聚焦搜索(Spotlight)
    - [x] 查询(Look Up)
    - [x] Safari浏览器(Safari)
    - [ ] 询问Siri (Ask Siri on iOS:国内版/macOS:海外版)
  * 启用的功能:  
    - [x] 来自APPLE的内容(CONTENT FROM APPLE)
    - [x] 来自APPLE的建议(SUGGESTIONS FROM APPLE)
    - [x] Siri建议(Siri Suggestions)
  * 已知可用的信息卡片:
    - [ ] 天气  
    - [x] Siri资料(Siri Knowledge)  截图:[macOS](./ScreenShots/Siri%20Knowledge%20-%20Spotlight%20-%20macOS.png?raw=true "Siri Knowledge - Spotlight - macOS")   
    - [x] Siri建议的网站(Siri Suggested Websites)  
    - [x] 维基百科 (macOS端需要Surge启用“增强模式”)  
    - [ ] 地图  
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
    - [ ] Twitter集成

## 已知「Siri建议」服务器列表
* 可通过Surge的`工具`-`最近请求`或`请求查看器`或`Quantumult X`的`网络活动`查看最近的*.smoot.apple.com前缀判断当前服务器   

|  域名前缀  | 对应地区 | MitM |
|   :-:   |   :-:   |   :-:   |
|api|未知|有效|
|api-aka|未知|有效|
|api-glb|未知|有效|
|api-glb-apne|亚太东北|有效|
|api-glb-apse|亚太东南|有效|
|api-glb-usw|西美|有效|
|api-glb-euc|中欧|有效|
|api-glb-euw|西欧|有效|
|api-glb-nyc|纽约|未知|
|api-glb-ash|Nashua(US)|未知|
|api-glb-sjc|圣何塞|未知|
|api-glb-ams|阿姆斯特丹|未知|
|api-glb-fra|法兰克福|未知|
|api-glb-man|曼彻斯特|未知|
|api-glb-jnb|约翰内斯堡|未知|
|api-chi|芝加哥|未知|

## 安装链接
  * Loon:
    * 该插件需要匹配代理策略组
    * 修改地区为🇹🇼TW且强制优先使用简体中文:[Siri_Suggestions.plugin](./plugin/Siri_Suggestions.plugin?raw=true " Enable Siri Suggestions") (Author:@Tartarus2014)
    * 修改地区为🇹🇼TW:[Siri_Suggestions_TW.plugin](./plugin/Siri_Suggestions_TW.plugin?raw=true " Enable Siri Suggestions 🇹🇼TW")
    * 修改地区为🇯🇵JP:[Siri_Suggestions_JP.plugin](./plugin/Siri_Suggestions_JP.plugin?raw=true " Enable Siri Suggestions 🇯🇵JP")
    * 修改地区为🇺🇸US:[Siri_Suggestions_US.plugin](./plugin/Siri_Suggestions_US.plugin?raw=true " Enable Siri Suggestions 🇺🇸US")
  * Quantumult X:
    * 修改地区为🇹🇼TW且优先使用简体中文:[Siri_Suggestions.qxrewrite](./qxrewrite/Siri_Suggestions.qxrewrite?raw=true " Enable Siri Suggestions") (Author:Telegram:@YiEwha)
    * 修改地区为🇹🇼TW:[Siri_Suggestions_TW.qxrewrite](./qxrewrite/Siri_Suggestions_TW.qxrewrite?raw=true " Enable Siri Suggestions 🇹🇼TW") (Author:@edgexyz)
    * 修改地区为🇯🇵JP:[Siri_Suggestions_JP.qxrewrite](./qxrewrite/Siri_Suggestions_JP.qxrewrite?raw=true " Enable Siri Suggestions 🇯🇵JP")
    * 修改地区为🇺🇸US:[Siri_Suggestions_US.qxrewrite](./qxrewrite/Siri_Suggestions_US.qxrewrite?raw=true " Enable Siri Suggestions 🇺🇸US") (Author:@edgexyz)
  * Surge:
    * 适用于iOS/iPadOS,不含macOS策略组的模块:
      * 修改地区为🇹🇼TW且强制优先使用简体中文:[Siri_Suggestions.sgmodule](./sgmodule/Siri_Suggestions_noRuleSet.sgmodule?raw=true " Enable Siri Suggestions")
      * 修改地区为🇹🇼TW:[Siri_Suggestions_TW.sgmodule](./sgmodule/Siri_Suggestions_TW.sgmodule?raw=true " Enable Siri Suggestions 🇹🇼TW")
      * 修改地区为🇯🇵JP:[Siri_Suggestions_JP.sgmodule](./sgmodule/Siri_Suggestions_JP.sgmodule?raw=true " Enable Siri Suggestions 🇯🇵JP")
      * 修改地区为🇺🇸US:[Siri_Suggestions_US.sgmodule](./sgmodule/Siri_Suggestions_US.sgmodule?raw=true " Enable Siri Suggestions 🇺🇸US")
        * macOS用域名集:[Wikipedia_for_Look_Up.list](./RuleSet/Wikipedia_for_Look_Up.list?raw=true "Wikipedia for Look Up")
          * 此域名集只作用于macOS的`词典`和维基百科搜索集成,且需要开启`增强模式`,iOS/iPadOS不需要此域名集。
    * macOS/iOS通用模块(修改地区为🇹🇼TW且强制优先使用简体中文):
      * 针对策略组为PROXY的模块:[Siri_Suggestions_for_Uppercase_PROXY.sgmodule](./sgmodule/Siri_Suggestions_for_Uppercase_PROXY.sgmodule?raw=true " Enable Siri Suggestions")
      * 针对策略组为Proxy的模块:[Siri_Suggestions_for_Proxy.sgmodule](./sgmodule/Siri_Suggestions_for_Proxy.sgmodule?raw=true " Enable Siri Suggestions") 
      * 针对策略组为🌑Proxy的模块(如:DivineEngine):[Siri_Suggestions_for_DivineEngine.sgmodule](./sgmodule/Siri_Suggestions_for_DivineEngine.sgmodule?raw=true " Enable Siri Suggestions") 
      * 针对策略组为Apple的模块:[Siri_Suggestions_for_Apple.sgmodule](./sgmodule/Siri_Suggestions_for_Apple.sgmodule?raw=true " Enable Siri Suggestions") 
      * 针对策略组为🍎Apple的模块:[Siri_Suggestions_for_Apple_icon.sgmodule](./sgmodule/Siri_Suggestions_for_Apple_icon.sgmodule?raw=true " Enable Siri Suggestions")
      * 针对策略组为🍎 Apple的模块:[Siri_Suggestions_for_Apple_blank_icon.sgmodule](./sgmodule/Siri_Suggestions_for_Apple_blank_icon.sgmodule?raw=true " Enable Siri Suggestions")
      * 针对策略组为🍎 苹果服务的模块(如:ACL4SSR):[Siri_Suggestions_for_ACL4SSR.sgmodule](./sgmodule/Siri_Suggestions_for_ACL4SSR.sgmodule?raw=true " Enable Siri Suggestions")  

-----------------

# Apple Maps
## 简介
  * 保持模块启用,即可强制「Apple Maps」始终为特定版本。

  * 注:
    * iOS 15.1起，Apple Maps为🇨🇳CN时，`指南针`无经纬度与海拔

## 激活方式
* 如启用本模块后重新打开`地图`未生效，可按照下列步骤激活:
  * 未装有SIM卡的iOS/iPadOS/macOS设备，可省略`✈️飞行模式`相关步骤
  1. 保持`Wi-Fi`或`有线网络`连接
  2. 启用`Apple_Maps_*.sgmodule`模块
  3. 开启`✈️飞行模式`
  4. 重新打开一次`地图`应用
  5. 此时应在`Surge`的`最近请求`或`Quantumult X`的`网络活动`中观察到:
     1. `基于网络的地区检测`的`gspe1-ssl.ls.apple.com`链接
     2. 设置`地图`区域的`gspe35-ssl.ls.apple.com`链接
  6. 查看地图角标是否有`高德地图`
  7. 关闭`✈️飞行模式`
  8. 正常使用

## 安装链接
  * Loon:
    * 修改Apple Maps为🇺🇸US:[Apple_Maps.plugin](./plugin/Apple_Maps.plugin?raw=true " Redirect Apple Maps to 🇺🇸US")
    * 修改Apple Maps为🇨🇳CN:[Apple_Maps_CN.plugin](./plugin/Apple_Maps_CN.plugin?raw=true " Redirect Apple Maps to 🇨🇳CN")   
  * Quantumult X:
    * 修改Apple Maps为🇺🇸US:[Apple_Maps.qxrewrite](./qxrewrite/Apple_Maps.qxrewrite?raw=true " Redirect Apple Maps to 🇺🇸US")
    * 修改Apple Maps为🇨🇳CN:[Apple_Maps_CN.qxrewrite](./qxrewrite/Apple_Maps_CN.qxrewrite?raw=true " Redirect Apple Maps to 🇨🇳CN")   
  * Surge:    
    * 修改Apple Maps为🇺🇸US:[Apple_Maps.sgmodule](./sgmodule/Apple_Maps.sgmodule?raw=true " Redirect Apple Maps to 🇺🇸US")
    * 修改Apple Maps为🇨🇳CN:[Apple_Maps_CN.sgmodule](./sgmodule/Apple_Maps_CN.sgmodule?raw=true " Redirect Apple Maps to 🇨🇳CN")     

---

# Apple News
## 简介
  * 保持模块启用,即可正常使用「Apple News」(依赖其他模块辅助实现)。

## 激活方式
  * 未装有SIM卡的iOS/iPadOS/macOS设备，可省略`✈️飞行模式`相关步骤
  1. 启用`修改地区检测为🇺🇸US` + `修改Apple Maps为🇨🇳CN` + `修改Apple News为🇺🇸US`三个模块
  2. 指定相关代理线路为🇺🇸美国或其他可用地区,或者`全局模式`
  3. 打开`✈️飞行模式`
  4. 重新打开一次`地图`应用
  5. 此时应在`Surge`的`最近请求`或`Quantumult X`的`网络活动`中观察到:
     1. `检测设备信息`的`configuration.ls.apple.com`链接
     2. `基于网络的地区检测`的`gspe1-ssl.ls.apple.com`链接，且流量抓取结果不是`CN`
  6. 首次加载`Apple News`需保证`gateway.icloud.com`为海外线路
  7. 打开`Apple News`，此时应是[解锁状态说明](#解锁状态说明)中的`解锁成功`状态
  8. 关闭`✈️飞行模式`
  9. 正常使用

  * 注:
    * 关闭`✈️飞行模式`后，如再次触发了基于SIM卡的[移动设备网络代码](https://zh.wikipedia.org/wiki/移动设备网络代码)「MCC / MNC」检测，则Apple News会回到[解锁状态说明](#解锁状态说明)中的`解锁失效`状态。

## 解锁状态说明
|  未解锁  | 解锁成功 | 解锁失效 | 
|   :-:   |   :-:   |   :-:   |
| 未通过地区检测  | 已成功通过地区检测 | 通过检测后，再次触发检测时未通过检测  |
| 请在`✈️飞行模式`下通过`Wi-Fi`或`有线网络`再次执行解锁步骤  | 首次加载内容`gateway.icloud.com`需走代理，之后可直连 | 请在`✈️飞行模式`下通过`Wi-Fi`或`有线网络`再次执行解锁步骤  |
|![🔒](./ScreenShots/Apple%20News%20-%20Locked%20-%20iOS.jpeg?raw=true "Apple News - Locked - iOS")|![🔓](./ScreenShots/Apple%20News%20-%20Unlock%20Success%20-%20iOS.jpeg?raw=true "Apple News - Unlock Success - iOS")|![🔒](./ScreenShots/Apple%20News%20-%20Unlock%20Invalid%20-%20iOS.jpeg?raw=true "Apple News - Unlock Invalid - iOS")|


## 安装链接
  * Loon:
    * [Apple_News.plugin](./plugin/Apple_News.plugin?raw=true " Unlock Apple News 🇺🇸US") (Author:@Tartarus2014) (该插件需要匹配代理策略组)
  * Quantumult X:
    * 不含规则集的模块:[Apple_News.qxrewrite](./qxrewrite/Apple_News.qxrewrite?raw=true " Unlock Apple News 🇺🇸US")
      * 域名集:[Apple_News.list](./RuleSet/Apple_News.list?raw=true "Apple_News") (需要自行添加至`分流规则`引用并设置`策略偏好`)
  * Surge: 
    * 不含规则集的模块:[Apple_News_noRuleSet.sgmodule](./sgmodule/Apple_News_noRuleSet.sgmodule?raw=true " Unlock Apple News 🇺🇸US")
      * 域名集:[Apple_News.list](./RuleSet/Apple_News.list?raw=true "Apple_News") 
    * 针对策略组为PROXY的模块:[Apple_News.sgmodule](./sgmodule/Apple_News.sgmodule?raw=true " Unlock Apple News 🇺🇸US")
    * 针对策略组为Proxy的模块:[Apple_News_for_Proxy.sgmodule](./sgmodule/Apple_News_for_Proxy.sgmodule?raw=true " Unlock Apple News 🇺🇸US") 
    * 针对策略组为🌑Proxy的模块(如:DivineEngine):[Apple_News_for_DivineEngine.sgmodule](./sgmodule/Apple_News_for_DivineEngine.sgmodule?raw=true " Unlock Apple News 🇺🇸US") 
    * 针对策略组为Apple的模块:[Apple_News_for_Apple.sgmodule](./sgmodule/Apple_News_for_Apple.sgmodule?raw=true " Unlock Apple News 🇺🇸US") 
    * 针对策略组为🍎Apple的模块:[Apple_News_for_Apple_icon.sgmodule](./sgmodule/Apple_News_for_Apple_icon.sgmodule?raw=true " Unlock Apple News 🇺🇸US") 
    * 针对策略组为🍎 Apple的模块:[Apple_News_for_Apple_blank_icon.sgmodule](./sgmodule/Apple_News_for_Apple_blank_icon.sgmodule?raw=true " Unlock Apple News 🇺🇸US") 
    * 针对策略组为🍎 苹果服务的模块(如:ACL4SSR):[Apple_News_for_ACL4SSR.sgmodule](./sgmodule/Apple_News_for_ACL4SSR.sgmodule?raw=true " Unlock Apple News 🇺🇸US") 
    * 针对策略组为Apple News的模块:[Apple_News_for_Apple_News.sgmodule](./sgmodule/Apple_News_for_Apple_News.sgmodule?raw=true " Unlock Apple News 🇺🇸US") 
    * 针对策略组为🇺🇸美国的模块:[Apple_News_for_US_icon.sgmodule](./sgmodule/Apple_News_for_US_icon.sgmodule?raw=true " Unlock Apple News 🇺🇸US") 
