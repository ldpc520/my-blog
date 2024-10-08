# 两个命令解决IP冲突

释放IP地址的命令是
```linux
ipconfig /release
```
这个命令通常用于DHCP客户端计算机，当你需要释放当前分配给你的IP地址时。

以下是如何使用这个命令的步骤：

打开命令提示符（以管理员身份运行）。

输入 
```linux
ipconfig /release
```
并按回车键。

示例代码（在命令提示符下输入）：
```linux
ipconfig /release    
```
【释放所有IP地址】

执行这个命令后，你的计算机将不再有IP地址，直到你再次使用 ipconfig /renew 【重新分配IP地址】命令来获取一个新的IP地址或者当你的网络设备（如路由器）分配一个新的IP地址给你的计算机。
