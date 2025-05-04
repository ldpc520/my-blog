# Centos7安装FFmpeg
## 使用 RPM 源安装
安装 EPEL 源
EPEL（Extra Packages for Enterprise Linux）是由 Fedora 社区维护的一个项目，提供了大量额外的软件包。
```
sudo yum install -y epel-release
```
## 安装 RPM Fusion 源
RPM Fusion 是一个为 Red Hat 和基于 Red Hat 的发行版提供额外软件包的社区项目。
```
sudo yum install -y https://download1.rpmfusion.org/free/el/rpmfusion-free-release-7.noarch.rpm
```
## 更新系统软件包
```
sudo yum update -y
```
## 安装 FFmpeg
```
sudo yum install -y ffmpeg ffmpeg-devel
```
## 验证安装
安装完成后，你可以通过以下命令验证 FFmpeg 是否安装成功：
```
ffmpeg -version
```
如果成功安装，会显示 FFmpeg 的版本信息

