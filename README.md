# 投资流程管理系统

一个现代化的投资流程管理平台，支持工作流创建、执行监控、历史分析和复盘管理。

## 🚀 快速开始

### 后端部署（Zeabur）
- 在 Zeabur 创建后端服务（Root: `backend`）并部署
- 部署完成后访问 `https://<你的后端域名>.zeabur.app/health` 验证健康检查

关键环境变量：
- `NODE_ENV=production`
- `JWT_SECRET=<强随机密钥>`
- `CORS_ORIGIN=https://<你的前端域名>.zeabur.app`
- `DATABASE_URL=<PostgreSQL 连接串>`（如使用 Zeabur DB 服务，绑定后自动注入）
- `UPLOAD_PATH=/tmp/uploads`

### 前端部署（Zeabur）
- 在 Zeabur 创建前端服务（Root: `frontend`）并部署
- 关键环境变量：
  - `VITE_API_URL=https://<你的后端域名>.zeabur.app/api`
  - `VITE_APP_ENV=production`
  - `VITE_DEBUG=false`

本地构建：
```bash
cd frontend && npm install && npm run build
cd ../backend && npm install && npm run build
```

更多详情见 `DEPLOY_GUIDE.md`。

## 📱 核心功能
- 用户认证（登录/注册/权限）
- 工作流管理（创建/编辑/版本）
- 执行监控（进度/状态/记录）
- 历史分析（统计/趋势）
- 复盘管理（记录/洞察）
- 用户管理

## 🛠 技术栈

### 前端
- React 18, TypeScript, Redux Toolkit, React Router, Tailwind CSS, Vite

### 后端
- Node.js, Express, TypeScript, Prisma, JWT, Zeabur

## 📁 结构

```
├── frontend/                 # 前端应用
│  ├── src/
│  └── public/
├── backend/                  # 后端应用
│  ├── src/
│  └── prisma/
└── DEPLOY_GUIDE.md           # 部署指南
```

## ✅ 部署检查
- 后端：`/health` 返回 healthy；CORS 允许前端域名
- 前端：请求指向正确的 `VITE_API_URL` 并返回 200
- 直接访问任意前端路由可加载（已添加 `public/404.html` 用于 SPA 回退）

