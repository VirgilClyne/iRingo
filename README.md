# iRingo
解锁完整的Apple功能和集成服务   
macOS 12.3, iOS 15.4, iOS 14.8 测试通过  
需要启用`重写`、`脚本`、`MitM`功能  
如无特别声明，以下功能及模块，均适用于iOS/iPadOS/macOS/watchOS，模块间互无依赖，均可单独或搭配使用  
有问题请至Issue页面反馈  
Telegram讨论组:[🍟 整点薯条](https://t.me/GetSomeFries)  

---

> 目录
- [iRingo](#iringo)
- [通用配置](#通用配置)
  - [效果说明举例](#效果说明举例)
  - [建议配置](#建议配置)
    - [Loon](#loon)
    - [Quantumult X](#quantumult-x)
    - [Surge (Shadowrocket)](#surge-shadowrocket)
    - [Stash](#stash)
    - [Clash](#clash)
- [🌤天气](#天气)
  - [简介](#简介)
  - [功能列表](#功能列表)
  - [关于天气API](#关于天气api)
  - [使用说明](#使用说明)
  - [安装链接](#安装链接)
- [📍定位服务](#定位服务)
  - [简介](#简介-1)
  - [激活方式](#激活方式)
  - [作用与副作用](#作用与副作用)
  - [关于定位服务配置文件](#关于定位服务配置文件)
  - [安装链接](#安装链接-1)
    - [🧪测试版](#测试版)
    - [🆕新版](#新版)
    - [旧版](#旧版)
- [🔍Siri与搜索🆕](#siri与搜索)
  - [简介](#简介-2)
  - [激活方式](#激活方式-1)
  - [辅助激活与切换「Siri建议」服务器地区的方式](#辅助激活与切换siri建议服务器地区的方式)
  - [功能列表](#功能列表-1)
  - [已知「Siri建议」服务器列表](#已知siri建议服务器列表)
  - [安装链接](#安装链接-2)
    - [🆕新版](#新版-1)
    - [旧版](#旧版-1)
- [🗺️Apple Maps](#️apple-maps)
  - [简介](#简介-3)
  - [激活方式](#激活方式-2)
  - [安装链接](#安装链接-3)
- [📺Apple TV](#apple-tv)
  - [简介](#简介-4)
  - [激活方式](#激活方式-3)
  - [功能列表](#功能列表-2)
  - [安装链接](#安装链接-4)
- [📰Apple News](#apple-news)
  - [简介](#简介-5)
  - [激活方式](#激活方式-4)
  - [解锁状态说明](#解锁状态说明)
  - [关于新闻小组件](#关于新闻小组件)
  - [安装链接](#安装链接-5)
- [🌐iCloud 专用代理](#icloud-专用代理)
  - [简介](#简介-6)
  - [激活方式](#激活方式-5)
  - [解锁状态说明](#解锁状态说明-1)
  - [功能列表](#功能列表-3)
  - [安装链接](#安装链接-6)
    - [`Surge for macOS`with`网关模式`](#surge-for-macoswith网关模式)
    - [`Clash`](#clash-1)

---

# 通用配置

## 效果说明举例
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
    * 有SIM卡的设备，如iPhone，只要检测到SIM卡，且SIM卡不属于可用地区，`Apple News`会回到[解锁状态说明](#解锁状态说明)中的`解锁失效`状态。

## 建议配置
### Loon
  * plugin安装于`仪表`-`插件`-`+`
    1. [🌤天气](#天气)：[Apple_Weather.plugin](./plugin/Apple_Weather.plugin?raw=true " Replace Apple Weather 🇺🇸US with @waqi.info") 
    2. [📍定位服务](#定位服务)：[Geo_Services.plugin](./plugin/Geo_Services.plugin?raw=true " Response Geo Services to 🇺🇸US")
    3. [🔍Siri与搜索](#siri与搜索)：[Siri_Suggestions.plugin](./plugin/Siri_Suggestions.plugin?raw=true " Enable Siri Suggestions") (Author:@Tartarus2014)
    4. [🗺️Apple Maps](#apple-maps)：[Apple_Maps_CN.plugin](./plugin/Apple_Maps_CN.plugin?raw=true " Redirect Apple Maps to 🇨🇳CN")
    5. [📺Apple TV](#apple-tv)：[Apple_TV.plugin](./plugin/Apple_TV.plugin?raw=true " Enable Apple TV app")
    6. [📰Apple News](#apple-news)：[Apple_News.plugin](./plugin/Apple_News.plugin?raw=true " Unlock Apple News 🇺🇸US") (Author:@Tartarus2014) (该插件需要匹配代理策略组)
### Quantumult X
  * qxrewrite安装于`设置`-`重写`-`引用`
    1. [🌤天气](#天气)：[Apple_Weather.qxrewrite](./qxrewrite/Apple_Weather.qxrewrite?raw=true " Replace Apple Weather with 🇺🇸US @waqi.info")
    2. [📍定位服务](#定位服务)：[Geo_Services.qxrewrite](./qxrewrite/Geo_Services.qxrewrite?raw=true " Response Geo Services to 🇺🇸US")
    3. [🔍Siri与搜索](#siri与搜索)：[Siri_Suggestions.qxrewrite](./qxrewrite/Siri_Suggestions.qxrewrite?raw=true " Enable Siri Suggestions")
    4. [🗺️Apple Maps](#apple-maps)：[Apple_Maps_CN.qxrewrite](./qxrewrite/Apple_Maps_CN.qxrewrite?raw=true " Redirect Apple Maps to 🇨🇳CN")
    5. [📺Apple TV](#apple-tv)：[Apple_TV.qxrewrite](./qxrewrite/Apple_TV.qxrewrite?raw=true " Enable Apple TV app")
    6. [📰Apple News](#apple-news)：[Apple_News.qxrewrite](./qxrewrite/Apple_News.qxrewrite?raw=true " Unlock Apple News 🇺🇸US")
      * 规则集:[Apple_News_for_Quantumult_X.list](./RuleSet/Apple_News_for_Quantumult_X.list?raw=true "Apple_News") (需要自行添加至`设置`-`分流`-`引用`并设置`策略偏好`)
### Surge (Shadowrocket)
  * sgmodule安装于`模块`-`安装新模块…`
    1. [🌤天气](#天气)：[Apple_Weather.sgmodule](./sgmodule/Apple_Weather.sgmodule?raw=true " Replace Apple Weather with 🇺🇸US @waqi.info")
    2. [📍定位服务](#定位服务)：[Geo_Services.sgmodule](./sgmodule/Geo_Services.sgmodule?raw=true " Response Geo Services to 🇺🇸US")
    3. [🔍Siri与搜索](#siri与搜索)：[Siri_Suggestions.sgmodule](./sgmodule/Siri_Suggestions.sgmodule?raw=true " Enable Siri Suggestions")
      * macOS用域名集:[Wikipedia_for_Look_Up.list](./RuleSet/Wikipedia_for_Look_Up.list?raw=true "Wikipedia for Look Up")
      * 此域名集只作用于macOS的`词典`和维基百科搜索集成，且需要开启Surge的`增强模式`，iOS/iPadOS不需要此域名集，运行于M1处理器的Mac设备上的Loon与Quantumult X可能有效。
      * 更多预置策略组的模块请见[安装链接](#安装链接-2)
    4. [🗺️Apple Maps](#apple-maps)：[Apple_Maps_CN.sgmodule](./sgmodule/Apple_Maps_CN.sgmodule?raw=true " Redirect Apple Maps to 🇨🇳CN")
    5. [📺Apple TV](#apple-tv)：[Apple_TV.sgmodule](./sgmodule/Apple_TV.sgmodule?raw=true " Enable Apple TV app")
    6. [📰Apple News](#apple-news)：[Apple_News.sgmodule](./sgmodule/Apple_News.sgmodule?raw=true " Unlock Apple News 🇺🇸US")
      * 域名集:[Apple_News.list](./RuleSet/Apple_News.list?raw=true "Apple_News")
      * 更多预置策略组的模块请见[安装链接](#安装链接-4)
    7. [🌐iCloud 专用代理](#icloud-专用代理测试中有问题请反馈)
      * 详见:[`Surge for macOS`with`网关模式`](#surge-for-macoswith网关模式)
### Stash
  * stoverride安装于`首页`-`覆写`-`安装覆写`
    * 下面的链接需点击跳转后再复制安装，不可直接复制下面的链接安装。
    1. [🌤天气](#天气)：[Apple_Weather.qxrewrite](./stoverride/Apple_Weather.stoverride?raw=true " Replace Apple Weather with 🇺🇸US @waqi.info")
    2. [📍定位服务](#定位服务)：[Geo_Services.qxrewrite](./stoverride/Geo_Services.stoverride?raw=true " Response Geo Services to 🇺🇸US")
    3. [🔍Siri与搜索](#siri与搜索)：[Siri_Suggestions.qxrewrite](./stoverride/Siri_Suggestions.stoverride?raw=true " Enable Siri Suggestions")
    4. [🗺️Apple Maps](#apple-maps)：[Apple_Maps_CN.qxrewrite](./stoverride/Apple_Maps_CN.stoverride?raw=true " Redirect Apple Maps to 🇨🇳CN")
    5. [📺Apple TV](#apple-tv)：[Apple_TV.qxrewrite](./stoverride/Apple_TV.stoverride?raw=true " Enable Apple TV app")
### Clash
  * yaml需手动添加至配置文件的[Provider]:
    1. [🔍Siri与搜索](#siri与搜索)：
       * 规则组:[Wikipedia_for_Look_Up.yaml](./RuleSet/Wikipedia_for_Look_Up.yaml?raw=true "Wikipedia for Look Up")
       * 此规则组只作用于启用macOS的`词典`和维基百科搜索集成(此功能独立于Siri建议，所以可由Clash激活)。
    2. [🌐iCloud 专用代理](#icloud-专用代理测试中有问题请反馈)
       * 规则组:[iCloud_Private_Relay.yaml](./RuleSet/iCloud_Private_Relay.yaml?raw=true "iCloud Private Relay")
---

# 🌤天气
## 简介
  * 保持模块启用,即可切换「天气」`空气质量`数据源为[World Air Quality Index Project](https://waqi.info/)，采用[美国AQI标准](https://zh.wikipedia.org/wiki/空气质量指标)的数据。

  * 注:
    * 天气信息来源为`weather-data.apple.com`的Watch可使用本模块改写天气信息，需要在Watch上安装与代理设备相同的`CA证书`以进行MitM。

## 功能列表
  * 在以下位置及功能中可用: 
    - [x] 天气(`WeatherKit_Weather_iOS_Version XX.X`)
    - [ ] 天气的`下一小时降水强度`(`WeatherKit_weatherd_iOS_Version`)
    - [x] 地图(`Maps_WeatherFoundation`)
    - [ ] 小组件(`WeatherKit_WeatherWidget_iOS_Version XX.X`,`WeatherKit_WeatherWidget_macOS_`)
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

## 使用说明
  * 安装模块或插件后不进行配置即可直接使用
    * 采用`waqi.info 公共API`，先查询距离最近的`观测站`，再获取此观测站专用`令牌`，最后获取此`观测站`AQI详细数据，共三步。
  * 安装BoxJs并配置私有令牌，配合模块或插件使用
    * 采用`waqi.info 私有API`
      * 当选择`定位精度: 城市`时，直接获取`城市`AQI数据，共一步。
      * 当选择`定位精度: 观测站`时，先查询距离最近的`观测站`，然后获取此`观测站`AQI详细数据，共两步。
  * 注: 申请`waqi.info 私有API`令牌请见: [Air Quality Open Data Platform API Token Request Form](https://aqicn.org/data-platform/token/cn/#/)

## 安装链接
  * BoxJs:
    * 应用订阅:[iRingo.boxjs](./box/iRingo.boxjs.json?raw=true)
  * Loon:
    * 空气质量数据:[Apple_Weather.plugin](./plugin/Apple_Weather.plugin?raw=true " Replace Apple Weather 🇺🇸US with @waqi.info")
  * Quantumult X:
    * 空气质量数据:[Apple_Weather.qxrewrite](./qxrewrite/Apple_Weather.qxrewrite?raw=true " Replace Apple Weather with 🇺🇸US @waqi.info")
  * Surge:
    * 空气质量数据:[Apple_Weather.sgmodule](./sgmodule/Apple_Weather.sgmodule?raw=true " Replace Apple Weather with 🇺🇸US @waqi.info")
    * 空气质量地图(🆕可用，可行性验证，未修正图层和坐标):[Apple_Weather_Map.sgmodule](./sgmodule/Apple_Weather_Map.sgmodule?raw=true " Replace Apple Weather Map with 🇺🇸US @waqi.info")
    * 空气质量地图(🧪测试版，🚧施工中，不可用，修正坐标和图层):[Apple_Weather_Map.beta.sgmodule](./sgmodule/Apple_Weather_Map.beta.sgmodule?raw=true " Replace Apple Weather Map with 🇺🇸US @waqi.info")

---

# 📍定位服务
## 简介
  * 保持模块启用,即可强制「定位服务」通过`基于网络的地区检测`始终为特定地区，无需互联网连接，准备代理线路、保持`✈️飞行模式`开启、关闭定位、更改国家地区语言等。

  * 注:
    * 已更改实现方式，由“改写返回的`网络请求`”变更为“直接返回构造的`本地请求`”，过程中不进行实际的网络请求，不进行联网操作，全本地完成。（可理解为本地劫持返回抢答结果）
    * 名称为` Response Geo Services`为“直接返回构造的`本地请求`”的新实现方式
    * 名称为` Redirect Geo Services`为“改写返回的`网络请求`”的旧实现方式
    * 验证模块生效方式：浏览器访问 https://gspe1-ssl.ls.apple.com/pep/gcc ，页面显示的两个字母即为当前修改的地区代码

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
  - [x] `询问Siri`切换为国际版（维基百科）
    - [ ] SIM卡设备会因「MCC / MNC」检测回退至国内版（百度百科)
  * 副作用(单独使用此模块会有下列影响):
  - [ ] `天气`的数据源
  - [ ] `Siri建议`的服务器分配
  - [ ] `iTunes Store`的CDN分配
  - [ ] `Apple Music`的版权问题
  - [ ] `Apple Maps`的地区版本
  - [ ] `Apple News`的可用性判断(可通过其他模块单独修改) 
  - [ ] 待发现

## 关于定位服务配置文件
  * 定位服务配置文件`https://configuration.ls.apple.com/config/defaults`中包含大量相关设置参数
  * `🧪测试版`插件已知启用的功能有
    * `地图`-`路线`-`步行`-`现实世界中的路线`
    * `地图`-`路线`-`步行`-`导航准确性`
    * `地图`-`为“地图”提供助力`-`评分与照片`
    * `地图`-`为“地图”提供助力`-`显示评分和照片建议`

## 安装链接
### 🧪测试版
  * 🧪测试版,比`🆕新版`新增修改定位服务配置文件的功能(🚧测试中，随时可能不可用):
    * Loon:    
      * [Location_Services.beta.plugin](./plugin/Location_Services.beta.plugin?raw=true " Modify Location Services to 🇺🇳I18N")
    * Quantumult X:
      * [Location_Services.beta.qxrewrite](./qxrewrite/Location_Services.beta.qxrewrite?raw=true " Modify Location Services to 🇺🇳I18N")
    * Surge (Shadowrocket):
      * [Location_Services.beta.sgmodule](./sgmodule/Location_Services.beta.sgmodule?raw=true " Modify Location Services to 🇺🇳I18N")
### 🆕新版
  * 🆕新版,“直接返回构造的`本地请求`”的新实现方式
    * Loon:    
      * 修改地区检测为🇺🇸US:[Geo_Services.plugin](./plugin/Geo_Services.plugin?raw=true " Response Geo Services to 🇺🇸US")
    * Quantumult X:
      * 修改地区检测为🇺🇸US:[Geo_Services.qxrewrite](./qxrewrite/Geo_Services.qxrewrite?raw=true " Response Geo Services to 🇺🇸US")
    * Surge (Shadowrocket):
      * 修改地区检测为🇺🇸US:[Geo_Services.sgmodule](./sgmodule/Geo_Services.sgmodule?raw=true " Response Geo Services to 🇺🇸US")
      * 修改地区检测为🇨🇳CN:[Geo_Services_CN.sgmodule](./sgmodule/Geo_Services_CN.sgmodule?raw=true " Response Geo Services to 🇨🇳CN")
      * 修改地区检测为🇬🇧UK:[Geo_Services_UK.sgmodule](./sgmodule/Geo_Services_UK.sgmodule?raw=true " Response Geo Services to 🇬🇧UK")
      * 修改地区检测为🇭🇰HK:[Geo_Services_HK.sgmodule](./sgmodule/Geo_Services_HK.sgmodule?raw=true " Response Geo Services to 🇭🇰HK")
      * 修改地区检测为🇹🇼TW:[Geo_Services_TW.sgmodule](./sgmodule/Geo_Services_TW.sgmodule?raw=true " Response Geo Services to 🇹🇼TW")
      * 修改地区检测为🇯🇵JP:[Geo_Services_JP.sgmodule](./sgmodule/Geo_Services_JP.sgmodule?raw=true " Response Geo Services to 🇯🇵JP")
      * 修改地区检测为🇦🇺AU:[Geo_Services_AU.sgmodule](./sgmodule/Geo_Services_AU.sgmodule?raw=true " Response Geo Services to 🇦🇺AU")
### 旧版
  * 旧版,“改写返回的`网络请求`”的旧实现方式
    * Loon:
      * 修改地区检测为🇨🇳CN:[Geo_Services_CN.plugin](./plugin/Geo_Services_CN.plugin?raw=true " Redirect Geo Services to 🇨🇳CN") (Author:@Tartarus2014) 
      * 修改地区检测为🇺🇸US:[Geo_Services_US.plugin](./plugin/Geo_Services_US.plugin?raw=true " Redirect Geo Services to 🇺🇸US") (Author:@Tartarus2014) 
      * 修改地区检测为🇯🇵JP:[Geo_Services_JP.plugin](./plugin/Geo_Services_JP.plugin?raw=true " Redirect Geo Services to 🇯🇵JP")
    * Quantumult X:
      * 修改地区检测为🇨🇳CN:[Geo_Services_CN.qxrewrite](./qxrewrite/Geo_Services_CN.qxrewrite?raw=true " Redirect Geo Services to 🇨🇳CN")
      * 修改地区检测为🇺🇸US:[Geo_Services_US.qxrewrite](./qxrewrite/Geo_Services_US.qxrewrite?raw=true " Redirect Geo Services to 🇺🇸US")
      * 修改地区检测为🇯🇵JP:[Geo_Services_JP.qxrewrite](./qxrewrite/Geo_Services_JP.qxrewrite?raw=true " Redirect Geo Services to 🇯🇵JP")
    * Surge (Shadowrocket):
      * 修改地区检测为🇺🇸US:[Geo_Services_US.sgmodule](./sgmodule/Geo_Services_US.sgmodule?raw=true " Redirect Geo Services to 🇺🇸US")

---

# 🔍Siri与搜索🆕
## 简介
  * 保持模块启用,即可正常使用「来自APPLE的内容\来自APPLE的建议\Siri建议」  

  * 注:
    * 🆕新版用脚本功能实现，自动修改「来自APPLE的内容\来自APPLE的建议\Siri建议」的地区与语言设置为`设置`-`通用`-`语言与地区`相同设置的语言及地区（中国大陆地区无此服务，所以默认修改为台湾地区）。
    * 「询问Siri」(“Hey Siri.”)的搜索结果直接来源于`guzzoni.apple.com`,无法MitM改写请求
    * 「询问Siri」(“Hey Siri.”)的版本可被[定位服务](#定位服务)模块修改切换至海外版
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
* 不同地区的服务器提供的功能、搜索结果、建议有所不同，可通过下列手段刷新服务器（仅针对`旧版，用重写(Rewrite)功能修改为固定地区`的`Siri_Suggestions`）
  * macOS上关闭再开启`系统偏好设置`-`聚焦`-`Siri建议`
  * iOS上关闭再开启`设置`-`Siri与搜索`-`来自APPLE的内容`和`来自APPLE的建议`
  * 更改`设置`-`通用`-`语言与地区`-`地区`  
  * 等待约半小时，「Siri建议」会根据`基于网络的地区检测`结果向服务器`*.smoot.apple.com/bag`请求刷新区域设置与功能可用状态
  * 激活过程中采用不同的`Geo_Services_*.sgmodule`模块模拟不同地区的`基于网络的地区检测`结果

## 功能列表
  * 在以下位置及功能中可用:
    - [x] 聚焦搜索(Spotlight)
    - [x] 查询(Look Up)
    - [x] Safari浏览器(Safari)
    - [x] 地图(Apple Maps)
    - [x] 新闻(Apple News)
    - [ ] 询问Siri(Ask Siri)
      - [x] 无SIM卡设备可被[定位服务](#定位服务)模块修改切换至海外版(维基百科)
      - [ ] SIM卡设备会因「MCC / MNC」检测回退至国内版(百度百科)
    - [x] 电话
    - [x] 家庭
    - [x] 日历
    - [x] 提醒事项
    - [x] 通讯录
    - [x] 信息
    - [x] 邮件
  * 启用的功能:
    - [x] 来自APPLE的内容(CONTENT FROM APPLE)
    - [x] 来自APPLE的建议(SUGGESTIONS FROM APPLE)
    - [x] Siri建议(Siri Suggestions)
  * 已知可用的信息卡片:
    - [x] 天气 (已在`🆕新版Siri_Suggestions.*`中修复，搜索关键词`城市名 天气`或`天气 城市名`，例如`天气 上海`，不是所有城市都有天气搜索结果)
    - [x] Siri资料(Siri Knowledge)  截图:[macOS](./ScreenShots/Siri%20Knowledge%20-%20Spotlight%20-%20macOS.png?raw=true "Siri Knowledge - Spotlight - macOS")
    - [x] Siri建议的网站(Siri Suggested Websites)
    - [x] 维基百科 (macOS端需要Surge启用“增强模式”)
    - [ ] 地图 (当地图为中国区时不显示内容，有知道解决方法或成因的请联系我)
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
    - [ ] Twitter集成 (官方功能列表中有此功能，有知道解决方法或成因的请联系我)

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
### 🆕新版
  * 🆕新版，用脚本(Script)功能自动改为与系统`语言与地区`相同的设置
    * Loon:
      * 🆕:[Siri_Suggestions.plugin](./plugin/Siri_Suggestions.plugin?raw=true " Enable Siri Suggestions")
    * Quantumult X:
      * 🆕:[Siri_Suggestions.qxrewrite](./qxrewrite/Siri_Suggestions.qxrewrite?raw=true " Enable Siri Suggestions")
    * Surge (Shadowrocket):
      * 适用于iOS/iPadOS,不含macOS规则集的模块:
      * 🆕:[Siri_Suggestions.sgmodule](./sgmodule/Siri_Suggestions.sgmodule?raw=true " Enable Siri Suggestions")
        * macOS用域名集:[Wikipedia_for_Look_Up.list](./RuleSet/Wikipedia_for_Look_Up.list?raw=true "Wikipedia for Look Up")
        * 此域名集只作用于macOS的`词典`和维基百科搜索集成，且需要开启Surge的`增强模式`，iOS/iPadOS不需要此域名集，运行于M1处理器的Mac设备上的Loon与Quantumult X可能有效。
      * macOS/iOS通用模块:
      * 🆕针对策略组为`PROXY`的模块:[Siri_Suggestions_for_Uppercase_PROXY.sgmodule](./sgmodule/Siri_Suggestions_for_Uppercase_PROXY.sgmodule?raw=true " Enable Siri Suggestions")
      * 🆕针对策略组为`Proxy`的模块:[Siri_Suggestions_for_Proxy.sgmodule](./sgmodule/Siri_Suggestions_for_Proxy.sgmodule?raw=true " Enable Siri Suggestions") 
      * 🆕针对策略组为`🌑Proxy`的模块(如:DivineEngine):[Siri_Suggestions_for_DivineEngine.sgmodule](./sgmodule/Siri_Suggestions_for_DivineEngine.sgmodule?raw=true " Enable Siri Suggestions") 
      * 🆕针对策略组为`Apple`的模块:[Siri_Suggestions_for_Apple.sgmodule](./sgmodule/Siri_Suggestions_for_Apple.sgmodule?raw=true " Enable Siri Suggestions") 
      * 🆕针对策略组为`🍎Apple`的模块:[Siri_Suggestions_for_Apple_icon.sgmodule](./sgmodule/Siri_Suggestions_for_Apple_icon.sgmodule?raw=true " Enable Siri Suggestions")
      * 🆕针对策略组为`🍎 Apple`的模块(如:Surgio):[Siri_Suggestions_for_Surgio.sgmodule](./sgmodule/Siri_Suggestions_for_Surgio.sgmodule?raw=true " Enable Siri Suggestions")
      * 🆕针对策略组为`🍎 苹果服务`的模块(如:ACL4SSR):[Siri_Suggestions_for_ACL4SSR.sgmodule](./sgmodule/Siri_Suggestions_for_ACL4SSR.sgmodule?raw=true " Enable Siri Suggestions")  
    * Clash:
      * 规则组:[Wikipedia_for_Look_Up.yaml](./RuleSet/Wikipedia_for_Look_Up.yaml?raw=true "Wikipedia for Look Up")
      * 此规则组只作用于启用macOS的`词典`和维基百科搜索集成(此功能独立于Siri建议，所以可由Clash激活)。
### 旧版
  * 旧版，用重写(Rewrite)功能修改为固定地区
    * Loon:
      * 旧版，用重写修改地区为🇹🇼TW:[Siri_Suggestions_TW.plugin](./plugin/Siri_Suggestions_TW.plugin?raw=true " Enable Siri Suggestions 🇹🇼TW")
      * 旧版，用重写修改地区为🇯🇵JP:[Siri_Suggestions_JP.plugin](./plugin/Siri_Suggestions_JP.plugin?raw=true " Enable Siri Suggestions 🇯🇵JP")
      * 旧版，用重写修改地区为🇺🇸US:[Siri_Suggestions_US.plugin](./plugin/Siri_Suggestions_US.plugin?raw=true " Enable Siri Suggestions 🇺🇸US")
    * Quantumult X:
      * 旧版，用重写修改地区为🇹🇼TW:[Siri_Suggestions_TW.qxrewrite](./qxrewrite/Siri_Suggestions_TW.qxrewrite?raw=true " Enable Siri Suggestions 🇹🇼TW") (Author:@edgexyz)
      * 旧版，用重写修改地区为🇯🇵JP:[Siri_Suggestions_JP.qxrewrite](./qxrewrite/Siri_Suggestions_JP.qxrewrite?raw=true " Enable Siri Suggestions 🇯🇵JP")
      * 旧版，用重写修改地区为🇺🇸US:[Siri_Suggestions_US.qxrewrite](./qxrewrite/Siri_Suggestions_US.qxrewrite?raw=true " Enable Siri Suggestions 🇺🇸US") (Author:@edgexyz)
    * Surge (Shadowrocket):
      * 适用于iOS/iPadOS,不含macOS规则集的模块:
      * 旧版，用重写修改地区为🇹🇼TW:[Siri_Suggestions_TW.sgmodule](./sgmodule/Siri_Suggestions_TW.sgmodule?raw=true " Enable Siri Suggestions 🇹🇼TW")
      * 旧版，用重写修改地区为🇯🇵JP:[Siri_Suggestions_JP.sgmodule](./sgmodule/Siri_Suggestions_JP.sgmodule?raw=true " Enable Siri Suggestions 🇯🇵JP")
      * 旧版，用重写修改地区为🇺🇸US:[Siri_Suggestions_US.sgmodule](./sgmodule/Siri_Suggestions_US.sgmodule?raw=true " Enable Siri Suggestions 🇺🇸US")
        * macOS用域名集:[Wikipedia_for_Look_Up.list](./RuleSet/Wikipedia_for_Look_Up.list?raw=true "Wikipedia for Look Up")
        * 此域名集只作用于macOS的`词典`和维基百科搜索集成，且需要开启Surge的`增强模式`，iOS/iPadOS不需要此域名集，运行于M1处理器的Mac设备上的Loon与Quantumult X可能有效。

-----------------

# 🗺️Apple Maps
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
  * Surge (Shadowrocket):
    * 修改Apple Maps为🇺🇸US:[Apple_Maps.sgmodule](./sgmodule/Apple_Maps.sgmodule?raw=true " Redirect Apple Maps to 🇺🇸US")
    * 修改Apple Maps为🇨🇳CN:[Apple_Maps_CN.sgmodule](./sgmodule/Apple_Maps_CN.sgmodule?raw=true " Redirect Apple Maps to 🇨🇳CN")

---

# 📺Apple TV
## 简介
  * 保持模块启用,即可在全设备平台解锁TV app全部已知功能，并优先使用简体中文(zh-Hans)。

  * 注:
    * 🇨🇳CN区账号无效
    * 如账号所在地区不提供简体中文(zh-Hans)元数据，将按照账号所在区提供的语言回退
    * 「体育节目」及「儿童」直接调用US地区页面及功能
    * macOS版Apple TV app不支持第三方流媒体平台关联及媒体库调用及播放记录同步，故调用iPad版，关联操作请在iOS/iPadOS/tvOS设备上完成。
    * macOS版Apple TV app不支持「体育节目」相关功能，故调用iPad版。
    * tvOS等设备，非本机运行`Loon`、`Quantumult X`、`Surge`的情况下，需要安装与代理设备相同的`CA证书`以进行MitM。

## 激活方式
  * 如启用本模块后重新打开`Apple TV`未生效，可按照下列步骤激活:
    1. 打开`Apple TV`app
    2. 点击右上角头像
    3. 点击`退出登录`
    4. 重新输入`Apple ID`与`密码`登入（🇨🇳CN地区账号无效）
    5. 此时应在`Surge`的`最近请求`或`Quantumult X`的`网络活动`中观察到:
      1. `Apple TV`的`https://uts-api.itunes.apple.com/uts/v3/configitions`链接
    6. 查看`Apple TV`app的`立即观看`页面是否有`儿童`一个二级入口(iOS/iPadOS)
    7. 查看`Apple TV`app的标签栏是否有`立即观看`、`原创内容`、`商店`、`体育节目`、`资料库`五个标签页按钮(iOS/iPadOS)
    8. 查看`Apple TV`app的标签栏是否有`立即观看`、`tv+`、`商店`、`体育节目`、`儿童`、`资料库`六个标签页按钮(macOS/tvOS)
    9. 如没有请重开一次app
    10. 正常使用

## 功能列表
  * 硬件及平台
    - [x] macOS
    - [x] iPad
    - [x] iPhone
    - [x] Apple TV (需Surge for Mac`网关模式`或Quantumult X`代理服务器`等) (Quantumult X效果待测试，不确定是否可用)
    - [ ] Android TV (需Surge for Mac`网关模式`或Quantumult X`代理服务器`等) (Android TV效果待测试，不确定是否可用)
    - [ ] Web(待测试，不确定是否可用)
  * 分类页面
    - [x] 立即观看
    - [x] TV+
    - [x] 商店 (电影、电视节目为`商店`二级菜单)
    - [x] 体育节目 (macOS无关注「喜爱的球队」功能和显示比分功能)
    - [x] 儿童 (iOS/iPadOS为`立即观看`二级菜单)
    - [x] 资料库
    - [x] 搜索

## 安装链接
  * Loon:
    * 🆕[Apple_TV.plugin](./plugin/Apple_TV.plugin?raw=true " Enable Apple TV app") 
  * Quantumult X:
    * 🆕[Apple_TV.qxrewrite](./qxrewrite/Apple_TV.qxrewrite?raw=true " Enable Apple TV app")
  * Surge (Shadowrocket):
    * 🆕[Apple_TV.sgmodule](./sgmodule/Apple_TV.sgmodule?raw=true " Enable Apple TV app")

---

# 📰Apple News
## 简介
  * 保持模块启用,即可正常使用「Apple News」。

  * 注:
    * 需要同时启用`定位服务`的`Geo_Services`模块配合使用。
    * 加载「Apple News」内容需`gateway.icloud.com`走代理（已包含在“预置策略组的模块”中）。

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
|  锁定状态  | 解锁成功 | 解锁失效 | 
| :---: | :---: | :---: |
| 未通过地区检测  | 已成功通过地区检测 | 通过检测后，再次触发检测时未通过检测  |
| 请在`✈️飞行模式`下通过`Wi-Fi`或`有线网络`再次执行解锁步骤  | `gateway.icloud.com`需走代理才能完整加载内容 | 请在`✈️飞行模式`下通过`Wi-Fi`或`有线网络`再次执行解锁步骤  |
|<p> Apple News isn't supported in your current region. </p>|<p> **Feed Unavailable**  <br> There may be a problem with the sever or network. Plase try again later. </p>|<p> **Feed Unavailable** <br> Apple News isn't supported in your current region. </p>|
|![🔒锁定状态截图](./ScreenShots/Apple%20News%20-%20Locked%20-%20iOS.jpeg?raw=true "Apple News - Locked - iOS")|![🔓解锁成功截图](./ScreenShots/Apple%20News%20-%20Unlock%20Success%20-%20iOS.jpeg?raw=true "Apple News - Unlock Success - iOS")|![🔒解锁失效截图](./ScreenShots/Apple%20News%20-%20Unlock%20Invalid%20-%20iOS.jpeg?raw=true "Apple News - Unlock Invalid - iOS")|

## 关于新闻小组件
  * 新闻小组件`parsecd/1.0 ({Device}; {Version} {Build}) News/1`没有地区限制，可以任意区域环境下使用
  * 新闻小组件内容由`Siri建议`服务`api*.smoot.apple.com`提供，而不是`新闻`服务`news-*.apple.com`，已在`🆕新版Siri_Suggestions.*`中修复

## 安装链接
  * Loon:
    * 预置策略组的模块:[Apple_News.plugin](./plugin/Apple_News.plugin?raw=true " Unlock Apple News 🇺🇸US") (Author:@Tartarus2014) (该插件需要匹配代理策略组)
  * Quantumult X:
    * 不含规则集的模块:[Apple_News.qxrewrite](./qxrewrite/Apple_News.qxrewrite?raw=true " Unlock Apple News 🇺🇸US")
      * 规则集:[Apple_News_for_Quantumult_X.list](./RuleSet/Apple_News_for_Quantumult_X.list?raw=true "Apple_News") (需要自行添加至`设置`-`分流`-`引用`并设置`策略偏好`)
  * Surge (Shadowrocket):
    * 不含规则集的模块:[Apple_News.sgmodule](./sgmodule/Apple_News.sgmodule?raw=true " Unlock Apple News 🇺🇸US")
      * 域名集:[Apple_News.list](./RuleSet/Apple_News.list?raw=true "Apple_News")
    * 预置策略组的模块:
      * 针对策略组为`PROXY`的模块:[Apple_News_for_Uppercase_PROXY.sgmodule](./sgmodule/Apple_News_for_Uppercase_PROXY.sgmodule?raw=true " Unlock Apple News 🇺🇸US")
      * 针对策略组为`Proxy`的模块:[Apple_News_for_Proxy.sgmodule](./sgmodule/Apple_News_for_Proxy.sgmodule?raw=true " Unlock Apple News 🇺🇸US")
      * 针对策略组为`🌑Proxy`的模块(如:DivineEngine):[Apple_News_for_DivineEngine.sgmodule](./sgmodule/Apple_News_for_DivineEngine.sgmodule?raw=true " Unlock Apple News 🇺🇸US")
      * 针对策略组为`Apple`的模块:[Apple_News_for_Apple.sgmodule](./sgmodule/Apple_News_for_Apple.sgmodule?raw=true " Unlock Apple News 🇺🇸US")
      * 针对策略组为`🍎Apple`的模块:[Apple_News_for_Apple_icon.sgmodule](./sgmodule/Apple_News_for_Apple_icon.sgmodule?raw=true " Unlock Apple News 🇺🇸US")
      * 针对策略组为`🍎 Apple`的模块(如:Surgio):[Apple_News_for_Apple_blank_icon.sgmodule](./sgmodule/Apple_News_for_Apple_blank_icon.sgmodule?raw=true " Unlock Apple News 🇺🇸US")
      * 针对策略组为`📡 Apple 地区限制`的模块(如:Surgio):[iCloud_Private_Relay_Gateway_for_Surgio.sgmodule](./sgmodule/iCloud_Private_Relay_Gateway_for_Surgio.sgmodule?raw=true " Enable iCloud Private Relay on gateway")
      * 针对策略组为`🍎 苹果服务`的模块(如:ACL4SSR):[Apple_News_for_ACL4SSR.sgmodule](./sgmodule/Apple_News_for_ACL4SSR.sgmodule?raw=true " Unlock Apple News 🇺🇸US")
      * 针对策略组为`Apple News`的模块:[Apple_News_for_Apple_News.sgmodule](./sgmodule/Apple_News_for_Apple_News.sgmodule?raw=true " Unlock Apple News 🇺🇸US")
      * 针对策略组为`🇺🇸美国`的模块:[Apple_News_for_US_icon.sgmodule](./sgmodule/Apple_News_for_US_icon.sgmodule?raw=true " Unlock Apple News 🇺🇸US")

---

# 🌐iCloud 专用代理
## 简介
  * 保持模块/规则启用,即可让此网关下属终端设备正常直连使用「iCloud 专用代理」。
  
  * 注:
    * 🆕iOS 15.2起，Wi-Fi设置中的`iCloud专用代理`选项变更为`限制IP地址追踪`,启用并生效后不再有Wi-Fi设置中的DNS进行域名解析，猜测由下列DOH解析
    * iCloud 专用代理本质为TUN模式透明代理，所以与本机TUN模式VPN冲突，解决方法待验证。
    * 启用模块/规则的设备自身无法解锁/使用「iCloud 专用代理」（待验证）。
    * 仅在`Surge for Mac`的`网关模式`下通过测试，未在`Surge for iOS`的`Wi-Fi访问`测试过。
    * 「可用性验证」环节依旧需要走代理（域名列表待优化），「专用代理」自身流量为直链访问，落地服务器取决于「可用性验证」环节指向的代理服务器。
    * 一旦「专用代理」启用工作，除iCloud专用代理相关检测域名外，其余`邮件`和`Safari浏览器`流量将不再暴露于「专用代理」之外。
    * 「专用代理」访问采用QUIC(UDP,443)技术，相关服务器由Akamai、Fastly 和Cloudflare提供，请保证自身直连访问这些服务良好，居住地及运营商网络质量堪忧请自己想办法解决。
    * 相关介绍请见:https://developer.apple.com/cn/support/prepare-your-network-for-icloud-private-relay/
    * 出口IP列表:https://mask-api.icloud.com/egress-ip-ranges.csv

## 激活方式
  * 因为目前没有稳定触发`专用代理`当前地区可用性检测的方法，所以建议重新开机来手动触发检测
  * 未装有SIM卡或设置了SIM卡PIN的iOS/iPadOS/macOS设备，可省略`✈️飞行模式`相关步骤
  1. 在充当网关的`Surge for macOS`上启用`Apple_iCloud_Private_Relay.getaway.sgmodule`模块
  2. 在`Surge for macOS`中指定相关代理线路为🇺🇸美国或其他可用地区,或者`全局模式`
  3. 打开终端设备的`✈️飞行模式`后`关机`
  4. 重新将终端设备`开机`,解锁屏幕但不关闭`✈️飞行模式`或不输入SIM卡PIN，等待设备连接`Wi-Fi`或`有线网络`通过`专用代理可用性`验证
  5. 此时应在`Surge for macOS`的`请求查看器`中观察到:
     1. 检测iCloud中是否包含`专用代理订阅(networking.privacy.subscriber)`的链接`p*-acsegateway.icloud.com`，且请求头`X-MMe-Country`是`TW`
     2. 包含可用性检测的`获取专用代理验证令牌`链接：`https://mask-api.icloud.com/v*/fetchAuthTokens`
     3. 包含代理服务器分配的`获取专用代理配置文件`链接：`https://mask-api.icloud.com/v*_*/fetchConfigFile`(非必需、首次启用`专用代理`或周期性更新)
  6. 关闭终端设备`✈️飞行模式`或输入SIM卡PIN
  7. 打开终端设备`设置`-`Apple ID`-`iCloud`-`专用代理（Beta版）`，此时应是[解锁状态说明](#解锁状态说明-1)中的`解锁成功`状态
  8. 正常使用

## 解锁状态说明
|  不支持  |  可用  |  暂不可用  |  流量审核  |  关闭  |
| :---: | :---: | :---: | :---: | :---: |
| 未通过地区检测 | 已成功通过地区检测 | 与iCloud的QUIC连接被阻止 | 与iCloud专用代理的连接被阻止 | 此网络的专用代理已关闭 |
| 请重新启动设备，在`✈️飞行模式`或SIM卡锁定下，通过`Wi-Fi`或`有线网络`再次执行解锁步骤 | 可以正常使用 | 请检查当前网络对QUIC(UDP,443)流量的Block、QoS或Drop情况 | 请检查至`mask.icloud.com`与`mask-h2.icloud.com`的连接情况 | 请在此`Wi-Fi`或`有线网络`的设置中打开`iCloud专用代理` |
|<p> **此国家或地区尚不支持专用代理。** <br> {国家或地区}尚不支持专用代理。当您在支持的国家或地区联网时，可将其打开。</p>|<p> 无说明 </p>|<p> **由于技术问题，专用代理暂时不可用。** <br> 问题解决时将自动恢复工作。 </p>|<p> **专用代理已对“{当前网络}”关闭** <br> 专用代理不受此网络支持或已在Wi-Fi设置中关闭。专用代理关闭时，此网络可监控您的互联网活动，且您的IP地址将不会对已知跟踪器或网站隐藏。</p>|<p> **专用代理已对“{当前网络}”关闭** <br> 使用“{当前网络}”时，网站和跟踪器可获取您的互联网地址。</p>|
|![🔒不支持截图](./ScreenShots/iCloud%20Private%20Relay%20-%20Not%20Supported%20-%20iOS.jpeg?raw=true "iCloud Private Relay - Not Supported - iOS")|![🔓可用截图](./ScreenShots/iCloud%20Private%20Relay%20-%20Avaliable%20-%20iOS.jpeg?raw=true "iCloud Private Relay - Avaliable - iOS")|![🔒暂不可用截图](./ScreenShots/iCloud%20Private%20Relay%20-%20Temporarily%20Unavaliable%20-%20iOS.jpeg?raw=true "iCloud Private Relay - Temporarily Unavaliable - iOS")|![🔒流量审核截图](./ScreenShots/iCloud%20Private%20Relay%20-%20Network%20Traffic%20Audits%20-%20iOS.jpeg?raw=true "iCloud Private Relay - Network Traffic Audits - iOS")|![🔒关闭截图](./ScreenShots/iCloud%20Private%20Relay%20-%20Turned%20Off%20-%20iOS.jpeg?raw=true "iCloud Private Relay - Turned Off - iOS")|

## 功能列表
  * 在以下位置及功能中可用: 
    - [x] 邮件(Mail)
    - [x] Safari浏览器(Safari)
      - [x] WebKit(WebKit Networking)
    - [x] DNS查询(DNS resolution queries)
      - [x] https://doh.dns.apple.com/dns-query
      - [x] https://mask.icloud.com/dns-query
      - [x] https://oblivious.r15.doh.dns.akasecure.net/dns-query
      - [x] https://odoh.cloudflare-dns.com/dns-query
    - [x] 不安全的 http app 流量(insecure http app traffic)

## 安装链接
### `Surge for macOS`with`网关模式`
  * Surge:
  * 不含规则集的模块:[iCloud_Private_Relay_Gateway.sgmodule](./sgmodule/iCloud_Private_Relay_Gateway.sgmodule?raw=true " Enable iCloud Private Relay on gateway")
    * 域名集:
      * QUIC代理流量:[iCloud_Private_Relay_QUIC.list](./RuleSet/iCloud_Private_Relay_QUIC.list?raw=true "iCloud Private Relay QUIC")
      * 检测与配置流量:[iCloud_Private_Relay_Configs.list](./RuleSet/iCloud_Private_Relay_Configs.list?raw=true "iCloud Private Relay Configs")
  * 预置策略组的模块:
    * 针对策略组为`PROXY`的模块:[iCloud_Private_Relay_Gateway_for_Uppercase_PROXY.sgmodule](./sgmodule/iCloud_Private_Relay_Gateway_for_Uppercase_PROXY.sgmodule?raw=true " Enable iCloud Private Relay on gateway")
    * 针对策略组为`Proxy`的模块:[iCloud_Private_Relay_Gateway_for_Proxy.sgmodule](./sgmodule/iCloud_Private_Relay_Gateway_for_Proxy.sgmodule?raw=true " Enable iCloud Private Relay on gateway")
    * 针对策略组为`🌑Proxy`的模块(如:DivineEngine):[iCloud_Private_Relay_Gateway_for_DivineEngine.sgmodule](./sgmodule/iCloud_Private_Relay_Gateway_for_DivineEngine.sgmodule?raw=true " Enable iCloud Private Relay on gateway")
    * 针对策略组为`Apple`的模块:[iCloud_Private_Relay_Gateway_for_Apple.sgmodule](./sgmodule/iCloud_Private_Relay_Gateway_for_Apple.sgmodule?raw=true " Enable iCloud Private Relay on gateway")
    * 针对策略组为`🍎Apple`的模块:[iCloud_Private_Relay_Gateway_for_Apple_icon.sgmodule](./sgmodule/iCloud_Private_Relay_Gateway_for_Apple_icon.sgmodule?raw=true " Enable iCloud Private Relay on gateway")
    * 针对策略组为`🍎 Apple`的模块(如:Surgio):[iCloud_Private_Relay_Gateway_for_Surgio.sgmodule](./sgmodule/iCloud_Private_Relay_Gateway_for_Surgio.sgmodule?raw=true " Enable iCloud Private Relay on gateway")
    * 针对策略组为`🍎 苹果服务`的模块(如:ACL4SSR):[iCloud_Private_Relay_Gateway_for_ACL4SSR.sgmodule](./sgmodule/iCloud_Private_Relay_Gateway_for_ACL4SSR.sgmodule?raw=true " Enable iCloud Private Relay on gateway")
### `Clash`
  * Clash:
    * 规则组:[iCloud_Private_Relay.yaml](./RuleSet/iCloud_Private_Relay.yaml?raw=true "iCloud Private Relay")
