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

# 在Debian上安装ffmpeg
#‌# 打开Debian的终端‌
首先，你需要打开Debian操作系统的终端。

‌运行更新软件包列表的命令‌
在安装新的软件包之前，建议先更新你的软件包列表。这可以确保你安装的是最新版本的ffmpeg。在终端中运行以下命令：
```linux
sudo apt update
```
## 安装ffmpeg软件包‌
更新完软件包列表后，你可以使用apt命令来安装ffmpeg。在终端中运行以下命令：
```linux
sudo apt install ffmpeg
```
这个命令会自动下载并安装ffmpeg及其依赖项。

## 验证ffmpeg是否成功安装
‌
安装完成后，你可以通过运行ffmpeg命令并检查其输出来验证ffmpeg是否成功安装。在终端中输入以下命令：
```linux
ffmpeg -version
```
如果ffmpeg已成功安装，你将看到类似以下的输出，其中包含ffmpeg的版本信息
