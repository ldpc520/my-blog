# 在Vercel上部署Splayer免费音乐
## 首先准备一个域名，我这里以sdyun.eu.org为例，分别添加三个cname记录全部解析到cname.vercel-dns.com，如图所示：
![cname.png](https://img.sdjy.eu.org/2025/03/26/67e3d055ef7d1.png)
打开github克隆以下三个项目到你自己的仓库，至于怎么Fork在这就不说了，懂的都懂
Splaye：https://github.com/ldpc520/SPlayer

UNM-server：https://github.com/IamFurina/UNM-Server

NeteaseCloudMusicAPI：https://github.com/IamFurina/NeteaseCloudMusicApi
## 登陆Vercel后，通过github创建新的项目，
### SPlayer的部署
1、复制 /.env.example 文件并重命名为 /.env
2、将 .env 文件中的 RENDERER_VITE_SERVER_URL 和 VITE_UNM_API 改为第一步得到的 API 地址

```
RENDERER_VITE_SERVER_URL = "https://yyapi.sdyun.eu.org";
VITE_UNM_API = "https://unm.sdyun.eu.org";
```
3、将 Build and Output Settings 中的 Output Directory 改为 out/renderer
![out.png](https://img.sdjy.eu.org/2025/03/26/67e3d32b985ca.png)
点击 Deploy，即可成功部署
### UNM 及API的部署
如图所示，创建项目，全部默认设置，直接点击Deploy即可成功部署
![unm.png](https://img.sdjy.eu.org/2025/03/26/67e3d39f76740.png)
至此，项目全部部署成功。成果如下图
![end.png](https://img.sdjy.eu.org/2025/03/26/67e3d4101f117.png)
这样子所有歌曲都可以播放了。
