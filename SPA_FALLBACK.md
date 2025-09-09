# 前端 SPA 回退配置

本项目为单页应用（SPA）。为避免用户直接访问子路由（如 `/dashboard`、`/workflow/123`）时出现 404，需要配置回退到 `index.html`。

- 已内置 `frontend/public/404.html`，多数静态托管平台会自动使用该页面作为回退。
- 如仍出现 404，可在 Zeabur 前端服务中添加重写规则：
  - 路径 Path：`/(.*)`
  - 动作 Action：Rewrite
  - 目标 Destination：`/index.html`

完成后，刷新任意前端路径都能正确加载应用。
