# ZEABUR环境变量配置指南

## 🎯 前端服务环境变量

在ZEABUR前端服务的环境变量页面添加：

```bash
# API服务器地址 (指向后端服务)
VITE_API_URL=https://your-backend-service.zeabur.app/api

# 应用环境
VITE_APP_ENV=production

# 调试模式 (生产环境建议关闭)
VITE_DEBUG=false

# 应用信息
VITE_APP_TITLE=投资流程管理系统
VITE_APP_VERSION=1.0.0
```

## 🎯 后端服务环境变量

在ZEABUR后端服务的环境变量页面添加：

```bash
# 服务器端口 (ZEABUR会自动设置，通常不需要手动配置)
PORT=3000

# 数据库连接 (如果使用ZEABUR数据库服务，会自动注入)
DATABASE_URL=postgresql://username:password@host:port/database

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# 环境
NODE_ENV=production

# CORS配置 (允许前端域名访问)
CORS_ORIGIN=https://your-frontend-service.zeabur.app

# 文件上传配置
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/tmp/uploads

# 日志配置
LOG_LEVEL=info
```

## 📋 配置步骤

### 1. 获取服务域名
- 在ZEABUR控制台查看每个服务的域名
- 前端域名：`https://xxx.zeabur.app`
- 后端域名：`https://yyy.zeabur.app`

### 2. 配置前端环境变量
```bash
VITE_API_URL=https://yyy.zeabur.app/api
VITE_APP_ENV=production
VITE_DEBUG=false
```

### 3. 配置后端环境变量
```bash
JWT_SECRET=your-random-secret-key-here
NODE_ENV=production
CORS_ORIGIN=https://xxx.zeabur.app
```

### 4. 数据库配置
如果使用ZEABUR的PostgreSQL服务：
- ZEABUR会自动注入 `DATABASE_URL`
- 不需要手动配置数据库连接

### 5. 重新部署
配置环境变量后，需要重新部署服务使配置生效。

## ⚠️ 重要提醒

1. **JWT_SECRET**: 必须设置为强密码，不要使用默认值
2. **CORS_ORIGIN**: 必须设置为前端的实际域名
3. **VITE_API_URL**: 必须指向后端服务的正确地址
4. **环境变量更新**: 修改后需要重新部署才能生效

## 🔍 调试方法

1. 查看前端调试信息：访问前端URL，查看页面显示的环境信息
2. 查看后端日志：在ZEABUR控制台查看后端服务日志
3. 测试API连接：在浏览器开发者工具查看网络请求