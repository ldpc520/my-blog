# Docker 和 GitHub 加速代理服务器

>一个轻量级、高性能的多功能代理服务，提供 Docker 镜像加速、GitHub 文件加速、下载离线镜像、在线搜索 Docker 镜像等功能。

>[**仓库地址**](https://github.com/sky22333/hubproxy)

## 特性
>🐳 Docker 镜像加速 - 支持 Docker Hub、GHCR、Quay 等多个镜像仓库加速，流式传输优化拉取速度。
🐳 离线镜像包 - 支持下载离线镜像包，流式传输加防抖设计。
📁 GitHub 文件加速 - 加速 GitHub Release、Raw 文件下载，支持api.github.com，脚本嵌套加速等等
🤖 AI 模型库支持 - 支持 Hugging Face 模型下载加速
🛡️ 智能限流 - IP 限流保护，防止滥用
🚫 仓库审计 - 强大的自定义黑名单，白名单，同时审计镜像仓库，和GitHub仓库
🔍 镜像搜索 - 在线搜索 Docker 镜像
⚡ 轻量高效 - 基于 Go 语言，单二进制文件运行，资源占用低。
🔧 统一配置 - 统一配置管理，便于维护。
🛡️ 完全自托管 - 避免依赖免费第三方服务的不稳定性，例如cloudflare等等。
🚀 多服务统一加速 - 单个程序即可统一加速 Docker、GitHub、Hugging Face 等多种服务，简化部署与管理。
### Docker部署（推荐）
```
docker run -d \
  --name hubproxy \
  -p 5000:5000 \
  --restart always \
  ghcr.io/sky22333/hubproxy
```
### Compose部署
```
version: '3'
services:
  hubproxy:
    image: ghcr.io/sky22333/hubproxy
    container_name: hubproxy
    ports:
      - "5000:5000"
    restart: always
```
### Linux部署
```
curl -fsSL https://raw.githubusercontent.com/sky22333/hubproxy/main/install.sh | sudo bash
```
### 使用方法
Docker 镜像加速
```
# 原命令
docker pull nginx

# 使用加速
docker pull yourdomain.com/nginx

# ghcr加速
docker pull yourdomain.com/ghcr.io/sky22333/hubproxy

# 符合Docker Registry API v2标准的仓库都支持
```
GitHub 文件加速
```
# 原链接
https://github.com/user/repo/releases/download/v1.0.0/file.tar.gz

# 加速链接
https://yourdomain.com/https://github.com/user/repo/releases/download/v1.0.0/file.tar.gz

# 加速下载仓库
git clone https://yourdomain.com/https://github.com/sky22333/hubproxy.git
```
