# Python 第三方库国内镜像下载地址
由于 Python 服务器在国外，因此使用 pip 安装第三方模块或者库的时候，下载速度特别慢，经常出现如下报错：
```python
$ socket.timeout: The read operation timed out
```
为提升下载速度，可以使用国内镜像下载，常用的国内镜像有：

## 豆瓣
```python
https://pypi.douban.com/simple
```
## 阿里云
```python
https://mirrors.aliyun.com/pypi/simple
```
## 清华大学
```python
https://pypi.tuna.tsinghua.edu.cn/simple
```
## 中国科技大学
```python
https://pypi.mirrors.ustc.edu.cn/simple
```
使用方法为在 pip 命令后加 -i URL 方法，以从阿里云下载 pandas 库为例：
```python
$ pip install pandas -i https://mirrors.aliyun.com/pypi/simple
```

## 在Pycharm中添加镜像源的位置：
![截图](https://img.sdjy.eu.org/2026/02/16/6991f1662c398.jpeg)
————————————————
版权声明：本文为CSDN博主「量化Mike」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。
原文链接：https://blog.csdn.net/weixin_43529465/article/details/121798634