# 手动上传部署包 (Cloudflare Pages Direct Upload)

Cloudflare Pages 控制台手动上传 zip 时**不会部署仓库里的 `functions/` 目录**，
`/api` 代理会缺失，登录后列表会报 "代理返回了 HTML 页面" 的错误。

因此手动上传使用 Pages 高级模式：构建时把本目录的 `_worker.js` 注入 dist，
由它接管全部请求（API 代理 + 静态资源 + SPA 回退），zip 完全自包含。

## 打包

```powershell
yarn build:manual
# 或 npm run build:manual
```

脚本（`scripts/build-manual.js`）会依次执行：

1. `vite build` 构建产物到 `dist/`
2. 复制 `_worker.js` 到 `dist/`（Pages 高级模式入口）
3. 把 dist 内容打包为仓库根目录的 `dnsflare-pages-<日期>.zip`
   （内容位于压缩包根级，无依赖的 Node zip 打包器）

上传方式：Cloudflare Dashboard → Workers & Pages → 选中项目 →
Create deployment → 直接拖入 zip。

## 注意

- `build:manual` 之后 dist 含 `_worker.js`，此时**不要**执行
  `wrangler pages deploy dist`（与 `functions/` 目录冲突）；
  常规 wrangler 部署前先 `yarn build` 重新生成干净的 dist。
- `_worker.js` 与 `functions/[[api]].js` 是同一代理逻辑的两份实现，
  修改代理行为时记得同步两处。
