# Lucky stun穿透 + Cloudflare 实现无公网 IPv4 访问、端口隐藏与 v4或v6 分流
## 前言
- 本人为网络技术小白，本文内容基于网络大佬分享的知识整理融合，仅作个人备忘。
- 核心目标：家庭设备仅有公网 IPv6、无公网 IPv4 时，实现外网 IPv4 环境访问、IPv6 环境自动分流，且统一使用不带端口的泛域名访问。
## 一、前置准备
1. 网络环境：家庭宽带有公网 IPv6，路由器拨号（推荐，减少 NAT 层数和端口转发配置）。
2. NAT 类型：Lucky 的 STUN 穿透页面测试，NAT1 最佳，NAT3 通常可用，NAT4 需搜索降低层级方法。lucky 的 stun 页面可以测试，如果不是就不用看本篇文章了
3. 域名与 CF 托管：拥有一个域名（推荐付费，免费二级域名可能存在问题），并托管至 Cloudflare（简称 CF），本文以 123.xyz为例。
4. 软件基础：已安装 Lucky，会使用其动态解析、反向代理功能
## 二、Cloudflare配置
1. 点击DNS记录，添加一条A记录，名称填入通配符星号 * 。ipv4随便填一个即可，不产生实际作用，这里填入的8.8.8.8。代理状态勾选上，点亮小黄云。

这里解释一下这样设置的作用。CF代理了 *.123.xyz，以后访问如emby.123.xyz的时候，首先就会请求到CF这里来，然后根据我们后面会添加的规则，进行v4或者v6的重定向。

注意如果之前已经有了这条二级泛域名的解析，直接勾选代理即可。同时删除或者关闭lucky的这一条动态域名配置。
![A记录.png](https://img.sdjy.eu.org/2026/03/25/69c40033ae123.png)
2. 进入“规则”，点击“创建规则”，选择“重定向规则”。
![创建重定向规则.png](https://img.sdjy.eu.org/2026/03/25/69c4009dc6a34.png)
3. 配置v4重定向规则
①规则名称为了区别，添加v4后缀
②选择自定义筛选表达式。
③然后按图示配置字段，运算符，和值。第一栏是之前DNS解析添加的泛域名，*.123.xyz；第二栏可以不配置，这里是一种示意，如果某个以 .123.xyz 结尾的域名已经作特殊使用了，就排除一下；第三栏填入的值 0.0.0.0/0，表示匹配所有的ipv4地址。
④重定向类型选择“动态”
⑤表达式填入下面的一段代码。中间的 ipv4 是为了区别于 ipv6，实现分流，端口号6211在v4重定向规则中随便填入，后面会通过lucky的webhook同步成stun穿透获取的公网端口
```
wildcard_replace(http.request.full_uri, "*://*.123.xyz/*", "https://${2}.ipv4.123.xyz:6211/${3}")
```
⑥状态代码选择307或者302（一般是302，但某些应用中使用时，307才有效；具体差异我不懂）。
⑦勾选保留查询字符串
![v4规则设置.png](https://img.sdjy.eu.org/2026/03/25/69c401d6646ad.png)
4. 配置v6重定向规则
 - 直接从v4重定向规则复制，修改一下规则名称，修改ip源地址为2000::/3，URL重定向表达式，把ipv4替换为ipv6，端口号改为lucky反向代理监听地址
![v6重定向规则.png](https://img.sdjy.eu.org/2026/03/25/69c4029550a54.png)
![V6规则设置.png](https://img.sdjy.eu.org/2026/03/25/69c402998d1c7.png)
5. 创建API令牌
        点击页面右上角》配置文件》API令牌》创建令牌》（最底下）自定义令牌。

①名称说明用途即可
②权限添加 “账户》规则策略》编辑”
③权限添加 “区域》单一重定向》编辑”
④账户资源添加 “包括》你自己的账户”
⑤区域资源添加 “包括》特定区域》你的域名”
继续以显示摘要》创建令牌》复制令牌，保存到一个合适的位置，后面要用。
![配置.png](https://img.sdjy.eu.org/2026/03/25/69c403d7a30f9.png)
![创建令牌.png](https://img.sdjy.eu.org/2026/03/25/69c4043a653ef.png)
![令牌设置.png](https://img.sdjy.eu.org/2026/03/25/69c404039c059.png)
![准备创建令牌.png](https://img.sdjy.eu.org/2026/03/25/69c40403128a0.png)
![显示创建令牌.png](https://img.sdjy.eu.org/2026/03/25/69c403ff6bed5.png)
以上是CF端的准备工作。总结一下：我们添加了一条二级泛域名解析*.123.xyz，由CF代理，然后创建了两条重定向规则，根据不同的访问ip来源，再分别重定向到v4或v6的地址上去。接下来是lucky端的配置，需要用到三级泛域名*.ipv4.123.xyz和*.ipv6.123.xyz，以及账户ID，区域ID，以及具有编辑账户规则策略和区域重定向规则权限的API令牌。
## Lucky配置
我用的lucky版本是3.0，如果版本太过老旧，建议先升级到最新版。如果原来有二级泛域名*.123.xyz的解析，一定要先删除或者关闭，同时在CF的DNS解析记录也要删除。

1.配置DDNS（域名动态解析）
如果之前不是用的CF做动态解析，这里简单说一下配置方法：
首先也是要在CF创建一个API令牌，权限：区域》DNS》编辑；区域资源：包括》特定区域》123.xyz。然后保存好令牌。
编辑已有任务或者添加一个任务；托管商选择CF；Token填入刚刚创建的API令牌；{ipv4Addr}和{ipv6Addr}的开关都打开；添加同步记录；记录名填*.ipv4.123.xyz，记录类型选择A；再添加一条同步记录，记录名填*.ipv6.123.xyz，记录类型选择AAAA。 
![ddns.png](https://img.sdjy.eu.org/2026/03/25/69c405df31643.png)
![ddns成功.png](https://img.sdjy.eu.org/2026/03/25/69c40643d6c87.png)
2. 配置web服务的反向代理 
这里默认读者已经会配置反向代理，并且已经配置有反向代理服务了。那么编辑已有的反向代理服务，前端地址中，添加两条带ipv4和ipv6字段的地址，后端地址保持不变。
![反向代理.png](https://img.sdjy.eu.org/2026/03/26/69c4069a03526.png)
## 添加Stun穿透
打开重定向规则的页面进入编辑状态，然后按F12--网络，点击保存按钮右侧就会出现一个API地址，把它复制出来备用，如图所示
![id.png](https://img.sdjy.eu.org/2026/03/26/69c40918bca66.png)
只需要把复制出来的地址替换前面的部分：
https://dash.cloudflare.com/api/v4
替换成
https://api.cloudflare.com/client/v4
### 下面是添加stun的具体内容
现在创建一个stun穿透任务

①取一个描述作用的名称
②穿透类型选择TCP，UDP也可以
③穿透通道本地端口填一个没有使用的，或者填0，会使用随机端口
④开启防火墙自动放行
⑤目标地址：哪个设备要使用这个穿透就填谁的ip。这里，是供lucky的反向代理用的，lucky装在路由器上，就填192.168.31.1
⑥目标端口，就填lucky反向代理的监听端口
⑦打开WebHook开关，下面内容就复用上面创建的最有一条手动任务。请求体有所不同的是，端口号改成了lucky提供的变量#{port}，表示传入stun穿透获取到的公网端口。
⑧调用成功填入"success": true

接口地址：就是F12复制出来并替换前面部分的地址
```
https://api.cloudflare.com/client/v4/zones/区域ID/rulesets/重定向规则集ID/rules/重定向规则ID
```
请求方式：PATCH

请求头：Authorization: Bearer 创建的重定向API令牌
Content-Type: application/json

请求体：
```
{
  "description": "stun-重定向-v4",
  "expression": "(http.host wildcard \"*.123.xyz\" and not http.host contains \"nas.123.xyz\" and ip.src in {0.0.0.0/0})",
  "action": "redirect",
  "action_parameters": {
    "from_value": {
      "status_code": 307,
      "target_url": {
        "expression": "wildcard_replace(http.request.full_uri, \"*://*.123.xyz/*\", \"https://${2}.ipv4.123.xyz:#{port}/${3}\")"
      },
      "preserve_query_string": true
    }
  }
} 
```
记得把请求体中的域名替换成你自己的。
![stun设置.png](https://img.sdjy.eu.org/2026/03/26/69c40bd6de233.png)
### 测试
可以点击“WebHook手动触发测试”，看一下CF规则页面是否修改，lucky是否返回成功。保存后，stun穿透开始运行，最终成功的情况如下图。看CF规则页面的表达式中的端口是否变成了stun穿透获取的公网端口
若测试成功在最下面的地方会有"success": true显示。
最后点一下关闭按钮再打开，这个非常的重要，不然webhook不会自动更新的
![stun.png](https://img.sdjy.eu.org/2026/03/26/69c40d15c943e.png)

### 测试成果及后续工作
现在在浏览器输入emby.123.xyz，应该就可以跳转到emby.ipv4.123.xyz:动态端口  这个地址了。如果是在v6环境下访问，比如手机流量，那么会自动跳转到emby.ipv6.123.xyz:15556。







