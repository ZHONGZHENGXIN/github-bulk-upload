# 部署指南（Zeabur）

本项目为前后端分离的应用（frontend + backend）。本文将指导你在 Zeabur 上分别部署前端静态站点和后端 Node.js 服务，并完成必要的环境变量配置与联通校验。

## 服务一览
- 后端 service：Node.js（Express + TypeScript），目录 `backend`
- 前端 service：Vite 静态站点，目录 `frontend`

## 一、后端部署（Node.js）

1) 创建服务
- 方案 A（无需自定义镜像，使用 Buildpack）
  - 在 Zeabur 新建服务，来源选择仓库工作目录 `backend`
  - 平台会自动识别 `backend/zeabur.json`
    - 安装：`npm ci --include=dev`（确保安装 dev 依赖，避免 tsc 未找到）
    - 构建：`npm run build`（脚本内使用 `npx tsc`，无需全局 tsc）
    - 启动：`npm start`（等价于 `node dist/index.deploy.js`）
  - 注意：Buildpack 方式无法使用 apt-get 安装系统依赖；如 Prisma 需要 OpenSSL，建议改用下方 Dockerfile 方案。

- 方案 B（推荐，使用 Dockerfile 解决 OpenSSL/tsc 等依赖问题）
  - 在 Zeabur 创建服务时选择 Docker，Root 指向 `backend`，自动识别 `backend/Dockerfile`
  - 已提供 `backend/Dockerfile`，流程包含：
    - 安装 openssl（解决 Prisma 运行时 libssl 依赖）
    - `npm ci --include=dev` 安装 dev 依赖（含 TypeScript）
    - `npx prisma generate` 生成 Prisma Client
    - `npm run build` 使用 npx tsc 编译；随后 `npm prune --omit=dev` 精简依赖
    - 运行阶段复制 dist 与生产依赖，默认监听 `PORT=3000`

2) 环境变量（后端）
- PORT=3000（Zeabur 通常会自动注入）
- NODE_ENV=production
- JWT_SECRET=强随机密钥（务必更换）
- JWT_EXPIRES_IN=7d
- CORS_ORIGIN=https://你的前端域名.zeabur.app
- DATABASE_URL=PostgreSQL 连接串（如绑定 Zeabur 数据库服务，可自动注入）
- MAX_FILE_SIZE=10485760
- UPLOAD_PATH=/tmp/uploads
- LOG_LEVEL=info

可选：本仓库提供 `index.deploy.ts` 作为“无数据库演示”入口，可先不连库验证联通。若启用真实数据库，建议在部署阶段或启动前执行 `npx prisma migrate deploy`。

3) 验证
- 访问：`https://<后端域名>.zeabur.app/health` 期望返回 `{"status":"healthy", ...}`
- 访问：`/api/status` 验证 API 路由可用

## 二、前端部署（Vite 静态站点）

1) 创建服务
- 在 Zeabur 新建服务，Root Directory 指向 `frontend`
- 平台会读取 `frontend/zeabur.json`
  - 安装：`npm install`
  - 构建：`npm run build`
  - 输出目录：`dist`
  - 框架：`vite`

2) 连接后端（两选一）

- 方式 A（推荐，免环境变量）：前端服务添加路由转发，将 `/api` 代理到后端
  - 前端服务 → Networking/Routes → Add Route
  - Path: `/api/(.*)`
  - Destination: `https://<后端域名>.zeabur.app/api/$1`
  - Method: All
  - 保存并重新部署前端
  - 说明：此方式无需设置 `VITE_API_URL`，代码默认请求相对路径 `/api`

- 方式 B（环境变量直连后端）
  - 在前端服务设置：
    - VITE_API_URL=https://<后端域名>.zeabur.app/api
    - VITE_APP_ENV=production
    - VITE_DEBUG=false
    - VITE_APP_TITLE=投资流程管理系统
    - VITE_APP_VERSION=1.0.0
  - 说明：生产环境下优先读取 `VITE_API_URL`；未设置时回退到相对路径 `/api`。

3) 验证
- 部署完成后访问前端域名，打开浏览器开发者工具 → Network，确认接口请求已指向后端并返回 200

## 三、前后端联通与 CORS
- 在后端将 `CORS_ORIGIN` 配置为前端实际域名（如 `https://xxx.zeabur.app`）
- 如需多域名访问，可在 `CORS_ORIGIN` 中使用逗号分隔，或在代码中自定义校验逻辑

## 四、常见问题
- CORS 报错：检查后端 `CORS_ORIGIN` 与实际前端域名是否一致；确认浏览器请求头 `Origin` 符合预期
- 404（api 路由）：确保前端 `VITE_API_URL` 指向后端域名，或在前端增设 `/api` 的反向代理规则
- 数据库连接失败：确认后端已注入 `DATABASE_URL` 且可访问；如使用 Zeabur DB 服务，绑定后一般会自动注入

## 五、快速检查清单
- 后端 `https://<后端域名>/health` 返回 healthy
- 后端 `CORS_ORIGIN` 已设置为前端域名
- 前端 `VITE_API_URL` 已设置为后端域名 + `/api`（或使用代理）
- 前端页面能正常登录、导航并完成 API 调用

至此，前后端即可在 Zeabur 上稳定运行并互通。若需自定义域名，可按 Zeabur 控制台指引为两个服务分别绑定域名并更新相关环境变量。

