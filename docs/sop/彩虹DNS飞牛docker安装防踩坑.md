# 彩虹DNS飞牛docker安装防踩坑
## ComPose命令
```
services:
  dnsmgr-web:
    container_name: dnsmgr-web
    stdin_open: true
    tty: true
    ports:
      - 8081:80
    volumes:
      - /vol1/1000/docker/dnsmgr/web:/app/www
    image: netcccyun/dnsmgr
    depends_on:
      - dnsmgr-mysql
    networks:
      - dnsmgr-network

  dnsmgr-mysql:
    container_name: dnsmgr-mysql
    restart: always
    ports:
      - 3306:3306
    volumes:
      - /vol1/1000/docker/dnsmgr/mysql/conf/my.cnf:/etc/mysql/my.cnf
      - /vol1/1000/docker/dnsmgr/mysql/logs:/logs
      - /vol1/1000/docker/dnsmgr/mysql/data:/var/lib/mysql
    environment:
      - MYSQL_ROOT_PASSWORD=123456
      - TZ=Asia/Shanghai
    image: mysql:5.7
    networks:
      - dnsmgr-network

networks:
  dnsmgr-network:
    driver: bridge
```
## 在运行之前请创建好目录
```
mkdir -p /vol1/1000/docker/dnsmgr/mysql/conf
mkdir -p /vol1/1000/docker/dnsmgr/mysql/logs
mkdir -p /vol1/1000/docker/dnsmgr/mysql/data
```
## 赋予写入权限
```
chmod 755 /vol1/1000/docker/dnsmgr/mysql/data
chown -R 999:999 /vol1/1000/docker/dnsmgr/mysql/data
chmod 755 /vol1/1000/docker/dnsmgr/mysql/logs
chmod 755 /vol1/1000/docker/dnsmgr/mysql/conf
chown -R 999:999 /vol1/1000/docker/dnsmgr/mysql/logs
```

## 创建 my.cnf
```
vim /vol1/1000/docker/dnsmgr/mysql/conf/my.cnf
```
## 输入内容
```
[mysqld]
sql_mode=STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION
```
按ESC后输入:wq再按回车键即可保存退出
然后开始构建容器。

## 登陆mysql容器创建数据库
```
docker exec -it dnsmgr-mysql /bin/bash
mysql -uroot -p123456
create database dnsmgr
```
在install界面链接IP填写dnsmgr-mysql
![安装界面](https://img.sdjy.eu.org/image/dns.png)
