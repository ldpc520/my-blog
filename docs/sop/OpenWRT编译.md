# 快速编译属于自己的OpenWRT固件

## 固件说明：
快照版固件：没有luci界面，稳定版也有可能没有（官方原版23.5.5）
快照版依赖内核kmod的插件需编译进去，否则商店更新后版本不对后期无法安装。

官方固件：英文记得安装三个必备汉化包

luci-i18n-base-zh-cn

luci-i18n-firewall-zh-cn

luci-i18n-opkg-zh-cn

## 网页构建
### 官方openwrt构建：
https://firmware-selector.openwrt.org

### ImmortalWrt构建：

https://firmware-selector.immortalwrt.org

### 软件包名称查询：
https://mirror-03.infra.openwrt.org/releases/
### 软件包功能查询：
https://openwrt.org/packages/table/start

## Image Builder构建脚本下载：
https://github.com/qichiyuhub/OpenWrt-Builder
根据自己需求编辑脚本，建议只添加必要的，其他的安装后软件商店安装即可。

OpenWrt-Docker Image Builder
确保网络科学，并开启全局！
确保docker空间充足，否则可能空间不足无法构建（至少1G以上）

创建普通用户：
```bash
	opkg update                                            # 更新软件包列表

	opkg install sudo shadow-useradd                       # 安装必要软件

	useradd -m -s /bin/ash qcy                             # 创建用户

	passwd qcy                                             # 设置密码

	echo "qcy ALL=(ALL) ALL" >> /etc/sudoers               # 添加sudo权限
```

退出root 用普通用户登录（su命令在这不生效，直接退出重进）

编辑好构建脚本
构建脚本放入用户目录home/name下

用户目录递归777权限

进入脚本目录开始构建

cd /home/…..

sudo ./docker-build.sh

输入普通用户密码

## Linux-Docker Image Builder
安装好Linux，登录root账号、网络科学环境

安装sudo、curl、docker
```bash
	apt update
	sudo apt install sudo curl
	curl -fsSL https://get.docker.com | bash -s docker
```
普通用户给sudo权限（name修改为实际用户名）
```bash
echo "name ALL=(ALL) ALL" | sudo EDITOR='tee -a' visudo
```
切换到普通用户（name修改为实际用户名）
```bash
su name
```
编辑好构建脚本
构建脚本放入用户目录home/name下

用户目录递归777权限

进入脚本目录开始构建

cd /home/…..

sudo ./docker-build.sh

输入普通用户密码
