# 飞牛docker上安装frpc客户端
打开docker界面在镜像仓库中搜索 frpc，如下图所示
![fons-1](https://pub-3eddfe58b5a04d22a0a1c2f9bc18272b.r2.dev/image/fnos-1.png)
在文件管理中手动创建一个用于存放frpc.toml文件的文件夹，如下图
![fnos-2](https://pub-3eddfe58b5a04d22a0a1c2f9bc18272b.r2.dev/image/fnos-2.png)
如果飞牛不止一个frpc的，添加的端口务必不同以免冲突
![fnos-3](https://pub-3eddfe58b5a04d22a0a1c2f9bc18272b.r2.dev/image/fnos-3.png)
![fnos-4](https://pub-3eddfe58b5a04d22a0a1c2f9bc18272b.r2.dev/image/fnos-4.png)

最后点击创建就可以了
## 温馨提示：设置或修改容器参数须停止容器的运行再进行。另每修改一次frpc.toml中的信息，都必须重启容器才能生效。
