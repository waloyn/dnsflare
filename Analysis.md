# Dnsflare 项目分析

## 项目概述
Dnsflare 是一个可视化修改 Cloudflare Zone DNS 记录的 Web 应用。它解决了 Cloudflare 对 `externallyManaged` 用户限制访问控制台编辑 DNS 记录的问题。

## 技术栈
- **前端**: Vue 3 + TypeScript + Vite
- **UI 框架**: Element Plus
- **状态管理**: Pinia (带持久化)
- **路由**: Vue Router 4
- **HTTP 客户端**: Axios
- **图标**: Font Awesome
- **样式**: SCSS + Normalize.css

## 架构设计
1. **客户端架构**:
   - 所有请求由本地浏览器直接发起到 Cloudflare API
   - 服务端仅进行 CORS 代理处理
   - 使用 Cloudflare Workers/Netlify Functions 作为代理

2. **核心功能**:
   - Zone 管理：查看、搜索域名列表
   - DNS 记录管理：增删改查各类 DNS 记录
   - SSL 证书管理：查看和修改证书设置
   - 支持搜索和过滤功能

3. **安全特性**:
   - 需要用户自己提供 Cloudflare API Token
   - Token 权限最小化原则
   - 服务端不存储敏感信息

## 项目结构
```
src/
├── api/           # Cloudflare API 接口封装
├── components/    # 公共组件
├── route/         # 页面组件
├── router/        # 路由配置
├── store/         # 状态管理
├── styles/        # 全局样式
└── utils/         # 工具函数
```

## 部署选项
- Cloudflare Pages
- Netlify
- 其他支持 Functions 的平台

## 限制说明
- Partner 账户无法直接添加 A 记录
- 开启 2FA 的 Partner API 可能受限

## API 权限要求
使用时需要创建具有以下权限的 Cloudflare API Token：
- Zone.DNS 写权限（用于写入 DNS 记录）
- Zone.Zone 读权限（用于读取域名列表）
- Zone.SSL and Certificates 读写权限（用于展示和修改 SSL 证书供应商）