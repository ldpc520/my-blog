# ESXI6.7下直通硬盘给群晖步骤，RDM直通方式

参考文章：https://www.cnblogs.com/vaemaxsky/p/13982648.html

**1.进入ESXI6.7 web管理后台。开启SSH**

![esxi_1](https://img.sdjy.eu.org/2026/03/14/69b4cdb3d49e6.png)

**2.点击存储，选择默认存储(ESXI安装硬盘)。复制位置地址备用；**

![esxi_2](https://img.sdjy.eu.org/2026/03/14/69b4ce0053c0a.png)
 
**3.打开SSH工具，登录SSH。登录以后执行以下命令。**

执行命令1：
```linux
cd  /vmfs/volumes/5fb14c74-5da1723a-c6a0-00e15a680bd8
```
![esxi_3](https://img.sdjy.eu.org/2026/03/14/69b4ce2d4a826.png)

/vmfs/volumes/5fb14c74-5da1723a-c6a0-00e15a680bd8 （是第二步复制备用的路径）

 
执行命令2： 
```linux
mkdir DMS.store 
```
(这个命令是在默认存储空间根目录下创建一个用来存放直通镜像文件.vmdk的文件夹)

**4.复制准备直通的硬盘标识符**
 t10.ATA_____ST500LT0122D9WS142___________________________________S0V2PJJG

![esxi_4](https://img.sdjy.eu.org/2026/03/14/69b4ce5695af3.png)

执行下面的命令：
```linux
 vmkfstools -z /vmfs/devices/disks/t10.ATA_____ST500LT0122D9WS142___________________________________S0V2PJJG /vmfs/volumes/5fb14c74-5da1723a-c6a0-00e15a680bd8/DMS.store/500g.vmdk
```

**5.如果都正确执行的话，是不会弹出错误以及其他提示的。然后回到虚拟机设置，添加硬盘》添加现有硬盘》选择之前创建的直通磁盘vmdk文件。**

![esxi_5](https://img.sdjy.eu.org/2026/03/14/69b4ce77e0b5f.png)

**6.设置相关参数，控制器选择STAT控制器，点击保存，**

![esxi_6](https://img.sdjy.eu.org/2026/03/14/69b4ce921c0a0.png)

**7.启动虚拟机，至此。直通硬盘给群晖虚拟机完成**
