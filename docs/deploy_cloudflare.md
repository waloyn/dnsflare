# 部署到 Cloudflare

## 方式一：GitHub Actions 自动部署 (推荐)

仓库已配置 GitHub Actions Workflow (`.github/workflows/deploy.yml`)。当推送到 `main` 分支时会自动完成构建与部署。

### 前置准备 (GitHub Secrets)

进入 GitHub 仓库的 **Settings** -> **Secrets and variables** -> **Actions**，添加以下两个 Secrets：

1. `CLOUDFLARE_API_TOKEN`: Cloudflare API Token（需包含 Cloudflare Pages 的编辑权限：`Account` -> `Cloudflare Pages` -> `Edit`）。
2. `CLOUDFLARE_ACCOUNT_ID`: 你的 Cloudflare 账户 ID（可在 Cloudflare 控制台右侧侧边栏或 URL 中获取）。

> **注意（参见 deploy/README.md）**：
> CI/CD 自动化部署中使用 Wrangler 部署，会自动将仓库根目录的 `functions/` 目录编译部署为 `/api` 代理后端。构建步骤必须使用 `yarn build` 生成干净的 `dist`，切勿执行 `yarn build:manual`（否则 `_worker.js` 会与 `functions/` 产生冲突）。

---

## 方式二：本地 Wrangler CLI 手动部署

安装 wrangler cli:

```bash
npm i -g wrangler
```

构建前端页面（注意：必须使用 `yarn build`，不要使用 `yarn build:manual`）：

```bash
yarn install
yarn build
```

部署页面与 Functions：

```bash
wrangler pages deploy dist --project-name=dnsflare
```

---

## 方式三：控制台手动上传 zip

参见 [deploy/README.md](../deploy/README.md)。用于无需命令行或 CI 时的拖拽部署（使用 `yarn build:manual` 生成自包含 `_worker.js` 的 zip）。

