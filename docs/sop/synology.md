# 群晖套件中心连接失败 请检查您的网络和时间设置怎么办？

有用户打开群晖套件中心的时候，收到提示：连接失败请检查您的网络和时间设置。遇到这种情况要如何解决呢？下面小编就给大家分享一下群晖套件中心连接失败请检查您的网络和时间设置的解决办法。

![132-220112160Q9415 1](https://github.com/ldpc520/ldpc520.github.io/assets/62380221/5d21b9a7-5ac2-4cba-956f-79e5318e2ac9)



群晖套件中心连接失败


## 一、检查时间

　　控制面板 — 》 区域选项 —》 NTP 服务 —》 勾选启用 NTP 服务；默认是没有勾选这个 NTP 服务；

　　控制面板 — 》 区域选项 —》 时间 —》 立即更新；

　　完成这两步后，尝试后再次访问套件中心仍然提示：连接失败请检查您的网络和时间设置；说明时间是没有问题。
  
![132-22011216113G30 1](https://github.com/ldpc520/ldpc520.github.io/assets/62380221/e12bdc81-9746-46eb-acf5-ac341092db7c)
![132-22011216114Hc 1](https://github.com/ldpc520/ldpc520.github.io/assets/62380221/93c3271a-d622-45b5-926d-76e424e6ae19)


群晖套件中心连接失败请检查您的网络和时间设置-运维圈
群晖套件中心连接失败
## 二、检查网络

　　控制面板 — 》 网络 —》 常规 —》 手动配置 DNS 服务器；用哪个 DNS 服务商根据自己的喜好来；我配置的这两个 DNS 大家应该都是熟悉的。最初我只配置了 223.5.5.5 套件中心出问题后才配置了 114.114.114.114
  
![132-220112161202a0 1](https://github.com/ldpc520/ldpc520.github.io/assets/62380221/48fb166d-ea36-4b2f-9034-a065526930ac)

群晖套件中心连接失败
## 三、问题解决
　　DNS 服务配置好后访问套件中心正常了。说明问题出在 DNS 服务器，也可能跟自己的区域有关。不管怎么样能解决就好。
  
![132-22011216121Q45 1](https://github.com/ldpc520/ldpc520.github.io/assets/62380221/4843d52d-cdae-4ead-8fe9-4329dcf1a6a0)


