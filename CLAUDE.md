# GeoWatch — Project Context

## 产品定位

GeoWatch 是一个 **GEO（Generative Engine Optimization）/ AEO（Answer Engine Optimization）** 监控平台，竞品是：
- **Profound**（$99/月 Starter 仅ChatGPT；$399/月 Growth；$499/月 Lite 自助；Enterprise 定制 $2K-5K+/月）
- **Writesonic**（GEO功能从 $249/月 Professional 起；低价位仅内容创作/传统SEO）
- **Otterly.ai**（$29/月 Lite 15条prompt；$189/月 Standard；$489/月 Premium）
- **Peec AI**（€90/月 Starter；€199/月 Pro；€499/月 Enterprise）
- **Geoptie**（$49/月起，所有AI引擎均包含）

GeoWatch 定位：比 Profound 更亲民的价格，专注 AI 搜索可见性追踪。目前处于 **private beta / 内测阶段**，landing page 上的 CTA 是 waitlist 表单。

## 域名 & 部署

- **域名**：`geowatch.ai`（购买于 Cloudflare Domains）
- **GitHub 仓库**：`niudai/geowatch`
- **Vercel 项目**：`geowatch`，属于 `ask-your-database` org
- **线上地址**：`https://geowatch.vercel.app`（也可通过 `https://geowatch.ai` 访问，DNS 传播后）

## Cloudflare DNS 配置（已完成）

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | geowatch.ai | 76.76.21.21 | DNS only |
| A | www | 76.76.21.21 | DNS only |

> 注意：必须关闭 Cloudflare proxy（DNS only），否则 Vercel 无法签发 SSL 证书。

## Vercel 域名配置（已完成）

```bash
vercel domains add geowatch.ai
vercel domains add www.geowatch.ai
```

## 技术栈

- **框架**：Next.js 15（App Router，TypeScript）
- **样式**：Tailwind CSS v4
- **动画**：Framer Motion
- **图标**：Lucide React
- **工具**：`clsx` + `tailwind-merge`（`cn()` utility）

## 项目结构

```
src/
  app/
    globals.css        # 深色主题、gradient-text、动画 keyframes
    layout.tsx         # SEO metadata、Geist 字体
    page.tsx           # 组装所有 section
  components/
    Navbar.tsx         # 固定顶栏，滚动检测，汉堡菜单
    Footer.tsx         # Logo、导航链接、版权
    sections/
      Hero.tsx         # 主标题、waitlist 表单、mock dashboard
      LogoBar.tsx      # "Trusted by" logo 栏
      Features.tsx     # 6 个功能卡片
      HowItWorks.tsx   # 3 步流程
      Pricing.tsx      # 3 个价格方案（Coming Soon）
      Testimonials.tsx # 3 个用户评价
      WaitlistCTA.tsx  # 底部 CTA + email 表单
  lib/
    utils.ts           # cn() utility
```

## Stripe（待接入）

用户有 Stripe 账号，secret key 存在 `.env.local`（已加入 `.gitignore`）：

```
STRIPE_SECRET_KEY=...
STRIPE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
```

> Stripe 产品和支付流程尚未开发，pricing 页面目前显示 "Coming Soon"。

## 待办事项

- [ ] Waitlist 表单接入真实后端（保存 email 到数据库或发送到邮件服务）
- [ ] Stripe 支付集成（内测结束后开放付费）
- [ ] 添加真实客户 logo 到 LogoBar
- [ ] 添加真实 testimonials
- [ ] 配置 Vercel 环境变量（STRIPE_SECRET_KEY 等）

## 常用命令

```bash
npm run dev          # 本地开发
npm run build        # 构建
vercel --prod        # 部署到生产
git push origin main # 推送（Vercel 会自动触发部署）
```
