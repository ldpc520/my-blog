# 宝塔面板安装python3.8

1,执行命令
```linux
cd /usr/local
```
2,下载目标python版本压缩包
```linux
wget http://npm.taobao.org/mirrors/python/3.8.0/Python-3.8.0.tgz
```
3,解压压缩包
```linux
tar -xzf Python-3.8.0.tgz
```
4,进入解压文件路径
```linux
cd Python-3.8.0
```
5,生成makefile文件
```linux
./configure --prefix=/usr/local/python3
```
6,对makefile文件进行操作
```linux
make
```
7,安装
```linux
make install
```
8,在/usr/bin路径下创建python3软链，指向已安装的python3：
```linux
ln -s /usr/local/python3/bin/python3 /usr/bin/python3
```
若提示错误试试这个命令：在/usr/bin路径下创建pip3软链，指向已安装的pip3：
```linux
ln -s /usr/local/python3/bin/pip3 /usr/bin/pip3
```
9,进入python目录
```linux
cd Python-3.8.0
```
10，查看py版本
```linux
python -V或python3 -V
```
11,进入PY执行的目录
```linux
cd /目录路径
```
12，PY运行命令
```linux
nohup python3 程序名称.py &
```


## 二、扫描地波IP所需下载第三方库

命令
```linux
pip install requests
```
或
```linux
pip3 install requests
```

查看已运行py程序命令
```linux
ps -ef | grep python
```
停止进程命令
```linux
kill 进程ID
```
