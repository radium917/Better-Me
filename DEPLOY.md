# Better Me 部署说明

GitHub 仓库：

```text
https://github.com/radium917/Better-Me.git
```

## GitHub

远端名称为 `origin`，默认分支为 `main`。

日常更新：

```bash
git add -A
git commit -m "描述本次改动"
git push origin main
```

以下内容不会上传：

- `node_modules/`
- `dist/`
- `*.tsbuildinfo`
- 本地编辑器配置和系统文件

## Vercel

1. 在 Vercel 中导入 `radium917/Better-Me`。
2. Framework Preset 选择 Vite。
3. Build Command 使用 `npm run build`。
4. Output Directory 使用 `dist`。
5. 不需要配置环境变量。

`vercel.json` 已配置 SPA rewrite：

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

这会保证 `/community`、`/goal/:id` 等客户端路由直接刷新时仍返回应用入口。

## 发布前检查

```bash
npm install
npm run build
```

当前应用是纯前端 MVP：

- 用户数据保存在浏览器 localStorage。
- mock 图片需要访问项目指定的图片生成服务。
- 暂无后端、云存储、短信服务或服务端鉴权。

