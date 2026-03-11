# 涛哥的技术博客

基于 VitePress 搭建的技术博客，用于记录 Java 学习和 AI 应用开发成长之路。

## 🚀 本地开发

```bash
cd blog
npm run dev
```

访问 http://localhost:5173

## 📦 构建

```bash
npm run build
```

## 🌐 部署到 GitHub Pages

### 1. 创建 GitHub 仓库

```bash
# 在 GitHub 创建新仓库，例如：tao-blog
```

### 2. 关联远程仓库

```bash
git remote add origin https://github.com/your-github/tao-blog.git
git branch -M main
git push -u origin main
```

### 3. 配置 GitHub Actions

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy VitePress site to Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 4. 启用 GitHub Pages

1. 进入仓库 Settings → Pages
2. Source 选择 "GitHub Actions"
3. 等待部署完成

访问：`https://your-github.github.io/tao-blog/`

## 📝 写作指南

1. 在 `docs/` 目录下创建 `.md` 文件
2. 在 `.vitepress/config.ts` 中添加路由
3. `git push` 自动部署

## 📂 目录结构

```
blog/
├── docs/
│   ├── .vitepress/      # VitePress 配置
│   ├── index.md         # 首页
│   ├── java/            # Java 相关
│   │   ├── basic/       # Java 基础
│   │   └── advanced/    # Java 进阶
│   ├── ai/              # AI 相关
│   └── about/           # 关于我
├── package.json
└── README.md
```

---

© 2026 涛哥
