# 一键部署rustdesk中继服务器及API 实现客户端登录远程设备管理等
## 可以在宝塔面板或1Panel中的docker安装
1、创建docke容器
导航菜单点击容器，依次点击编排-创建编排
文件名随意命名，后缀为.yaml
粘贴如下代码，修改IP及key信息，并点击确认开始编排。
```
networks:
  rustdesk-net:
    external: false
services:
  hbbs:
    container_name: hbbs
    ports:
      - 21115:21115
      - 21116:21116 # 自定义 hbbs 映射端口
      - 21116:21116/udp # 自定义 hbbs 映射端口
      - 21118:21118 # web client
    image: rustdesk/rustdesk-server
    command: hbbs -r <你的服务器IP/域名>:21117 -k <自定义key> # 填入个人域名或 IP + hbbr 暴露端口 并输入自定key
    volumes:
      - /data/rustdesk/hbbs:/root # 自定义挂载目录
    networks:
      - rustdesk-net
    depends_on:
      - hbbr
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 64M
  hbbr:
    container_name: hbbr
    ports:
      - 21117:21117 # 自定义 hbbr 映射端口
      - 21119:21119 # web client
    image: rustdesk/rustdesk-server
    command: hbbr -k <自定义key> #输入自定义key
    #command: hbbr
    volumes:
      - /data/rustdesk/hbbr:/root # 自定义挂载目录
    networks:
      - rustdesk-net
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 64M
  rustdesk-api:
    container_name: rustdesk-api
    environment:
      - TZ=Asia/Shanghai
      - RUSTDESK_API_RUSTDESK_ID_SERVER=<你的服务器IP/域名>:21116 #输入你的服务器IP/域名
      - RUSTDESK_API_RUSTDESK_RELAY_SERVER=<你的服务器IP/域名>:21117 #输入你的服务器IP/域名
      - RUSTDESK_API_RUSTDESK_API_SERVER=http://<你的服务器IP/域名>:21114 #输入你的服务器IP/域名
      - RUSTDESK_API_RUSTDESK_KEY=<自定义key> #输入自定义key
    ports:
      - 21114:21114
    image: lejianwen/rustdesk-api
    volumes:
      - /data/rustdesk/api:/app/data #将数据库挂载出来方便备份
    networks:
      - rustdesk-net
    restart: unless-stopped
```
通过以上操作，我们直接在docker里创建了服务器和API容器，ID/中继服务器可以直接使用！

## API的使用
1. 后台管理
```
http://<你的服务器IP/域名>:21114
```
以上地址访问API后台，默认用户名为：admin，初始密码在运行日志中查看。可以进行添加用户，设备管理等操作！
管理员密码重置
使用SH命令
把<pwd>改成你想设置密码
```
./apimain reset-admin-pwd <pwd>
```

2. 客户端使用
```
http://<你的服务器IP/域名>:21114
```
打开网络设置，将如上地址，填入API项里，点击“应用”
账户设置，点击登录，使用API账户登录，即可同步信息。
3. Web客户端使用
首次登录API后台，会自动同步服务器等信息，web客户端使用方法，同客户端大同小异
