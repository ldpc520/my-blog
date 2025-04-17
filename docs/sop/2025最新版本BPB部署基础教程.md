BPB Panel 是一个结合 Cloudflare Workers 和 Pages 的代理面板项目，可以帮助用户轻松搭建免费 VPN，实现永久免费节点订阅，为使用 singbox-core 和 xray-core 的跨平台客户端提供配置。

由于 Cloudflare 官方收紧对 BPB 等项目的审查，如果直接使用源码或者原作者提供的混淆代码，很容易出现 1101 的报错（可能代码中包含敏感关键词、或者使用了与他人相同的混淆代码）。

解决办法是利用未混淆的源码进行自定义加密混淆，从而生成独一无二的混淆代码，成功绕过 Cloudflare 的限制。

# 一、准备工作
## 1. GitHub 账号：通过 Github Action 自动同步最新 BPB 源代码，并执行代码混淆。
## 2. Cloudflare 账号：用于部署 BPB Panel 项目。
## 3. 域名：建议使用域名（解决 Cloudflare Pages 自带域名被墙的问题）。
# 二、Github 部署
### 1. 新建 Github 仓库
![image-20250321070035293[1].png](https://img.sdjy.eu.org/2025/04/15/67fdc0f477baa.png)
创建一个新的仓库，将 BPB Panel 项目代码同步到该仓库。
### 2. 配置 Github Actions
![image-20250321070238755[1].png](https://img.sdjy.eu.org/2025/04/15/67fdc1e71084c.png)
在仓库根目录下创建 .**github/workflows** 文件夹，并在其中创建 **Obfuscate.yml** 文件。
将以下代码粘贴进去，(新GitHub Actions代码)
```
name: Build and Obfuscate BPB Panel

on:
  push:
    branches:
      - main
  schedule:
    # 每天凌晨1:00运行
    - cron: "0 1 * * *"

permissions:
  contents: write

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: 检出代码
        uses: actions/checkout@v4

      - name: 设置 Node.js 环境
        uses: actions/setup-node@v4
        with:
          node-version: "latest"

      - name: 安装依赖项
        run: |
          npm install -g javascript-obfuscator

      - name: 下载 BPB worker.js
        run: |
          wget -O origin.js https://raw.githubusercontent.com/bia-pain-bache/BPB-Worker-Panel/main/build/unobfuscated-worker.js

      - name: 混淆 BPB worker.js
        run: |
          javascript-obfuscator origin.js --output _worker.js \
            --compact true \
            --control-flow-flattening false \
            --dead-code-injection false \
            --identifier-names-generator mangled \
            --rename-globals false \
            --string-array true \
            --string-array-encoding 'rc4' \
            --string-array-threshold 0.75 \
            --transform-object-keys true \
            --unicode-escape-sequence true

      - name: 提交更改
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          branch: main
          commit_message: ':arrow_up: 更新最新的 BPB 面板'
          commit_author: 'github-actions[bot] <github-actions[bot]@users.noreply.github.com>'
          push_options: '--set-upstream'
```
**注：此 Action 将在每次 push 到 main 分支和每天凌晨 1 点自动执行，下载最新未混淆的 BPB 源代码（origin.js），并生成混淆后的 `_worker.js` 文件，作为你个人专属的 BPB 代码。**

### 3. 执行 Github Actions
![image-20250321070651263[1].png](https://img.sdjy.eu.org/2025/04/15/67fdc3148b5b5.png)
**GitHub 仓库通过Obfuscate.yml 会自动下载最新的 BPB 源代码，并执行混淆
origin.js：最新未加密的 BPB 源代码
_worker.js：混淆后的个人专属 BPB 代码**

# 三、Cloudflare 部署
## 1. 登录 Cloudflare，创建 Pages 部署
![image-20250322100735664[1].png](https://img.sdjy.eu.org/2025/04/15/67fdc3d4d8d5b.png)
在 Cloudflare 控制台中进入 Workers 和 Pages，选择 Pages 部署。
![image-20250322100914397[1].png](https://img.sdjy.eu.org/2025/04/15/67fdc43cea1f9.png)
## 2. 绑定自定义域名（可选）
![image-20250322101018600[1].png](https://img.sdjy.eu.org/2025/04/15/67fdc47f1e78c.png)
在 Pages 项目的 自定义域选项卡，点击设置自定义域
## 3. 设置变量
![image-20250322101207119[1].png](https://img.sdjy.eu.org/2025/04/15/67fdc4b7621c8.png)
部署成功后，在 Pages 项目界面点击 设置 -> 变量和机密，添加以下变量：

**UUID：使用 [UUID 生成器](https://1024tools.com/uuid) 随机生成一个新的 UUID。
PROXYIP：填写代理 IP 地址，可从[ 随机代理 IP](https://www.nslookup.io/domains/cdn.xn--b6gac.eu.org/dns-records/) 站点 获取，或使用优选域名（例如 cdn-b100.xn--b6gac.eu.org）。
TR_PASS：填写一个复杂字符串，作为密码。**
## 4. 绑定 KV 命名空间
![image-20250322103724074[1].png](https://img.sdjy.eu.org/2025/04/15/67fdc623e03a1.png)
创建 KV:点击左侧存储和数据库，再选择 KV,然后创建一个新的 KV 命名空间
**注:名称自定义但不能包含“bpb”**
![image-20250322103833926[1].png](https://img.sdjy.eu.org/2025/04/15/67fdc66e29f95.png)
绑定 KV:回到创建的 Pages 界面。点击 设置 -> 【绑定】，点击添加，选择添加 KV 命名空间

注:变量名称只能填写“kv”(小写)
## 5. 重试部署 Pages
![image-20250322103925749[1].png](https://img.sdjy.eu.org/2025/04/15/67fdc6a6d0dda.png)
返回 Pages 项目,找到右侧...,点击重试部署
# 四、BPB 面板设置
## 1. 验证部署是否成功
![image-20250322104313673[1].png](https://img.sdjy.eu.org/2025/04/15/67fdc6e4476df.png)
打开浏览器输入:https://[自定义域名]或者你的项目地址,后面加上/panel,检查是否能正常访问BPB面板
## 2. 修改 BPB 面板密码
![image-20250322104415048[1].png](https://img.sdjy.eu.org/2025/04/15/67fdc71ad96f3.png)
第一次打开 BPB 面板会提示修改密码,请设置一个复杂密码,避免被盗用
## 3. 配置 BPB 面板参数
FakeDNS：设置enable

Proxy IPs / Domains：填写 IP 或者域名，PROXYIP 获取地址：点击访问

Clean IPs / Domains：优秀 IP 软件下载【点击下面 Download Scanner】 | 在线优选 IP：点击访问

TLS 端口：需要使用的端口打勾就可以，默认是 443 端口

ROUTING RULES：Bypass xxx是指 xxx 不走代理（直连访问）｜ Block xxx是指 xxx 被屏蔽访问（无法访问）

Bypass LAN：绕过本地局域网
Block Ads：屏蔽广告网址
Bypass Iran：绕过伊朗
Block Porn：屏蔽颜色网站
Bypass China：绕过中国大陆
Block QUIC：屏蔽 QUIC 协议
Bypass Russia：绕过俄罗斯
CUSTOM RULES：除了上面预设的规则外，你可以在这里自定义一些需要直连（Bypass）和屏蔽（Block）的 IP 地址/网站。
## 4. 保存设置
点击 APPLY SETTINGS 保存 BPB 面板配置
# 五、VPN 节点部署完成
## 1. 导出节点订阅链接
根据你所使用的代理软件，点击对应的 COPY SUB 按钮，复制 BPB 面板生成的订阅链接。
## 2. V2rayN 客户端导入节点订阅链接并使用
打开 V2rayN，进入【订阅分组】->【订阅分组设置】->【添加】,将订阅链接粘贴进去
点击【订阅分组】->【更新全部订阅(不通过代理)】，获取最新节点信息
测试节点延迟,确认节点有效后,开启系统代理,即可使用 VPN
现在 BPB 面板 VPN 部署全部结束,通过以上步骤,你可以利用 Cloudflare 和 BPB Panel 搭建一个永久免费 VPN,同时通过对 BPB 源代码进行加密混淆生成专属混淆代码,成功绕过 Cloudflare 的审查,解决 1101 报错问题,本期教程不仅支持 singbox-core 和 xray-core 等跨平台客户端等配置,还实现了永久免费节点订阅,满足大多数用户的使用需求,大家可以一起部署折腾,有什么问题,请在评论区留言,一起研究学习.
