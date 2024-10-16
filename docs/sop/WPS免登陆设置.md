# WPS免登陆设置

按Windows键，输入cmd，选择管理员身份运行命令提示符，粘贴以下内容按回车也可以实现免登录
```linux
REG ADD "HKEY_CURRENT_USER\Software\kingsoft\Office\6.0\plugins\officespace\flogin" /v "enableForceLoginForFirstInstallDevice" /t REG_SZ /d "false" /f
```
如果需要恢复登录可以把上面命令中后面的false改为true
