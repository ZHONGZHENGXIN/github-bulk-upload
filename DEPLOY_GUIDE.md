# 部署指南（Zeabur）

本项目为前后端分离的应用（frontend + backend）。下方步骤将指导你在 Zeabur 上分别部署前端静态站点和后端 Node.js 服务，并完成必要的环境变量配置与联通校验。

## 服务一览
- 后端 service：Node.js（Express + TypeScript），目录 `backend`
- 前端 service：Vite 静态站点，目录 `frontend`

## 一、后端部署（Node.js）

1) 创建服务
- 在 Zeabur 新建服务，来源选择 GitHub 仓库根目录下的 `backend` 作为工作目录（Root Directory）。
- 平台会自动识别 `backend/zeabur.json`：
  - 安装：`npm install`
  - 生成 Prisma Client：`npx prisma generate`
  - 构建：`npm run build`
  - 启动：`npm start`（等价于 `node dist/index.deploy.js`）

2) 环境变量（在后端服务中设置）
- PORT=3000（Zeabur 通常会自动注入，无需手动设置）
- NODE_ENV=production
- JWT_SECRET=请设置为随机强密钥
- JWT_EXPIRES_IN=7d
- CORS_ORIGIN=https://你的前端域名.zeabur.app
- DATABASE_URL=PostgreSQL 连接串（若绑定了 Zeabur 的数据库服务，可自动注入）
- MAX_FILE_SIZE=10485760
- UPLOAD_PATH=/tmp/uploads
- LOG_LEVEL=info

可选（本仓库以 index.deploy.ts 为无数据库演示入口，可先不连库验证联通，后续再启用数据库与迁移）：
- 如需启用真实数据库迁移，建议在部署阶段或启动前执行 `npx prisma migrate deploy`。

3) 验证
- 部署完成后访问：`https://你的后端域名.zeabur.app/health`
- 期望返回：`{"status":"healthy", ...}`
- 也可访问：`/api/status` 验证 API 路由存活

## 二、前端部署（Vite 静态站点）

1) 创建服务
- 在 Zeabur 新建服务，Root Directory 指向 `frontend`。
- 平台会读取 `frontend/zeabur.json`：
  - 安装：`npm install`
  - 构建：`npm run build`
  - 输出目录：`dist`
  - 框架：`vite`

2) 环境变量（在前端服务中设置）
- VITE_API_URL=https://你的后端域名.zeabur.app/api
- VITE_APP_ENV=production
- VITE_DEBUG=false
- VITE_APP_TITLE=投资流程管理系统
- VITE_APP_VERSION=1.0.0

说明：前端代码在生产环境下会优先读取 `VITE_API_URL`，未设置时将回退到相对路径 `/api`。通常推荐显式设置 `VITE_API_URL` 指向后端域名，避免跨域或反代未配置导致的 404。

3) 验证
- 部署完成后访问前端域名，打开浏览器开发者工具 → Network，确认接口请求指向 `VITE_API_URL` 后端域名并获得 200。

## 三、前后端联通与 CORS
- 在后端服务的环境变量中，将 `CORS_ORIGIN` 配置为前端实际域名（如 `https://xxx.zeabur.app`）。
- 若需要多域名访问，可在后端扩展为逗号分隔或在代码中自定义校验逻辑。

## 四、常见问题
- CORS 报错：检查后端 `CORS_ORIGIN` 与实际前端域名是否一致；确认浏览器请求头 `Origin` 符合预期。
- 404（/api 路由）：确保前端 `VITE_API_URL` 指向后端域名，或在前端服务加反向代理规则将 `/api` 转发到后端（Zeabur 的静态站点默认不内置 API 反代）。
- 数据库连接失败：确认 `DATABASE_URL` 已在后端服务中注入并可访问；若使用 Zeabur DB 服务，绑定后一般会自动注入。

## 五、快速检查清单
- 后端 `https://<后端域名>/health` 返回 healthy
- 后端 `CORS_ORIGIN` 已设置为前端域名
- 前端 `VITE_API_URL` 已设置为后端域名 + `/api`
- 前端页面能正常登录、导航并完成 API 调用

至此，前后端即可在 Zeabur 上稳定运行并互通。如需自定义域名，按 Zeabur 控制台指引为两个服务分别绑定域名并更新相关环境变量。

