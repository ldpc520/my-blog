# 安装nodejs及环境变量的设置

## 一、下载Nodejs
官网下载：https://nodejs.cn/download/

![nodejs](https://img.bpzx.us.kg/file/813c957f5c4461934a91e-19d0baa40f8628e4dc.png)

## 二、安装nodejs

双击安装程序，弹出界面，选择安装位置，我这里选择默认安装路径：C:\Program Files\nodejs

注意：安装路径中不要出现中文

在安装的目录下创建两个目录：node_global和node_cache

![node2](https://img.bpzx.us.kg/file/f40fc7bdd951fe44e278d-f7ccc374ed2e7b78a1.png)

给安装目录分配权限，分配修改权限，如下图所示：

![node3](https://img.bpzx.us.kg/file/017fa6862f5afffbe113f-6dd1a85627b0eeb0dd.png)
## 三、修改系统环境变量

默认会自动添加到环境变量中，这里我们也可以手动配置环境变量

创建NODE_HOME变量，指定nodejs安装路径，比如这里我的是C:\Program Files\nodejs路径。

然后双击PATH，找到C:\Program Files\nodejs，点击编辑，替换为%NODE_HOME%

新建两个值，分别填入%NODE_HOME%\node_global和%NODE_HOME%\node_cache

如下图所示：

![node4](https://img.bpzx.us.kg/file/597c3748a04ba8c65f05a-9a75e8680660c273a3.png)

## 四、修改用户环境变量

把用户变量PATH中的C:\User\用户名\AppDate\Roaming\npm
改为C:\Program Files\nodejs\node_global

## 五、修改配置

### 1. 设置缓存目录和全局目录
设置缓存目录
```linux
npm config set cache C:\Program Files\nodejs\node_cache
```
设置全局目录
```linux
npm config set prefix C:\Program Files\nodejs\node_global
```
### 2. 设置国内镜像

设置使用淘宝镜像
```linux
npm config set registry https://registry.npmmirror.com/
```
检查是否设置成功,返回地址就是设置成功了
```linux
npm config get registry
```


