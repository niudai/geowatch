# Vercel Deployment Automation

自动化监听和修复 Vercel 部署失败的系统。

## 功能

✅ **自动检测部署失败**
- 每 30 秒检查一次 Vercel 部署状态
- 识别失败的部署

✅ **自动诊断常见问题**
- 缺失依赖包 (Missing module)
- 环境变量问题
- 构建错误

✅ **自动修复（部分问题）**
- 自动安装缺失的 npm 包
- 自动提交和推送修复
- 触发 Vercel 重新部署

✅ **完整日志记录**
- 所有操作记录在 `.deployment-monitor.log`
- 便于审计和调试

## 快速开始

### 方式 1: 一次性检查（推荐用于 push 后）

```bash
# 在推送代码后立即运行
node scripts/monitor-deployment.ts

# 或者用 pnpm
pnpm monitor:deploy
```

**用途**：
- 在每次 `git push origin main` 后运行
- 自动检测和修复部署问题
- 一次性运行，完成后退出

### 方式 2: 连续监听（用于长期部署）

```bash
# 持续监听，每 30 秒检查一次，最多监听 3 小时
chmod +x scripts/watch-deployment.sh
./scripts/watch-deployment.sh

# 或者用后台运行
./scripts/watch-deployment.sh &
```

**用途**：
- 在 CI/CD 流程中
- 监听重要部署
- 长期自动修复

### 方式 3: 配置自动运行（使用 Git Hook）

```bash
# 创建 post-push hook
cat > .git/hooks/post-push << 'EOF'
#!/bin/bash
echo "📤 Deployment pushed, checking status..."
node scripts/monitor-deployment.ts
EOF

chmod +x .git/hooks/post-push
```

**用途**：
- 每次 push 后自动检查
- 无需手动运行

### 方式 4: 在 GitHub Actions 中自动化

```yaml
# .github/workflows/monitor-deployment.yml
name: Monitor Deployment

on:
  push:
    branches:
      - main

jobs:
  monitor:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Monitor Deployment
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: node scripts/monitor-deployment.ts
```

## 配置

### 环境变量

```bash
# .env.local 需要包含
VERCEL_TOKEN=<your-vercel-token>  # 可选，如果需要更多权限
```

### 自定义检查间隔

编辑 `scripts/watch-deployment.sh`:

```bash
CHECK_INTERVAL=30  # 改为你想要的秒数
MAX_CHECKS=360     # 改为最大检查次数
```

## 工作流程

### 当 push 代码时：

```
git push origin main
     ↓
Vercel 自动构建开始
     ↓
[立即运行] node scripts/monitor-deployment.ts
     ↓
     ├─ 检查最新部署状态
     ├─ 如果成功 → ✅ 完成
     │
     └─ 如果失败
        ├─ 分析错误日志
        ├─ 识别问题类型
        │
        ├─ 如果是缺失依赖 → 自动修复
        │  ├─ pnpm add <package>
        │  ├─ git commit & push
        │  ├─ Vercel 自动重新构建
        │  └─ 等待完成 ✅
        │
        └─ 其他问题 → 报告给用户 ⚠️
```

## 示例输出

### 成功修复

```
🔍 GeoWatch Deployment Monitor Started

📋 Found failed deployment: https://geowatch-301fp7qas-ask-your-database.vercel.app
📊 Error Type: missing_dependency
   Missing dependencies: axios, ws

🔧 Attempting automatic fix...
   Running: pnpm add axios ws
   Committing fix...
   Pushing to remote...
   Auto-fix succeeded, triggering redeploy

🚀 Triggering new deployment...
⏳ Waiting for deployment to complete...
   Status: Error (check 1) - waiting...
   Status: Ready (check 2) - deployment complete!

✅ Deployment fixed and redeployed successfully!
```

### 无法自动修复

```
📊 Error Type: env_variable
   Missing environment variables

⚠️  Cannot auto-fix: Missing environment variables
   Please set environment variables in Vercel dashboard
```

## 监控日志

所有活动记录在 `.deployment-monitor.log`:

```bash
# 查看日志
cat .deployment-monitor.log

# 实时监控日志
tail -f .deployment-monitor.log

# 查看特定时间的日志
grep "2026-02-22" .deployment-monitor.log
```

## 常见场景

### 场景 1: 缺失 npm 依赖

**自动处理** ✅

```
问题: axios 找不到
自动修复: pnpm add axios
结果: ✅ 自动重新部署成功
```

### 场景 2: 环境变量缺失

**需要手动处理** ⚠️

```
问题: DATABASE_URL 不存在
提示: 请在 Vercel 仪表板中设置环境变量
解决: 用户手动添加环境变量
```

### 场景 3: TypeScript 编译错误

**需要手动处理** ⚠️

```
问题: 类型错误导致构建失败
提示: 查看完整日志并修复代码
解决: 修复代码后手动推送
```

## 故障排除

### 问题：权限被拒绝

```bash
chmod +x scripts/watch-deployment.sh
```

### 问题：Vercel CLI 未找到

```bash
# 全局安装
npm i -g vercel

# 或者使用 pnpm
pnpm add -g vercel
```

### 问题：无法访问 Vercel

```bash
# 重新验证
vercel login
```

## 集成示例

### 与 package.json 脚本集成

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "deploy": "vercel --prod",
    "monitor:deploy": "node scripts/monitor-deployment.ts",
    "watch:deploy": "bash scripts/watch-deployment.sh"
  }
}
```

使用：
```bash
# 推送并监控
git push origin main && pnpm monitor:deploy

# 或者持续监听
pnpm watch:deploy
```

### 与 CI/CD 集成

**GitHub Actions**：在 `.github/workflows/` 中创建工作流
**GitLab CI**：在 `.gitlab-ci.yml` 中配置
**Jenkins**：在 Jenkinsfile 中添加阶段

## 支持的自动修复

| 问题类型 | 自动修复 | 修复方式 |
|---------|--------|--------|
| 缺失 npm 包 | ✅ | `pnpm add <pkg>` |
| 环境变量缺失 | ❌ | 手动设置 |
| TypeScript 错误 | ❌ | 手动修复代码 |
| 数据库问题 | ❌ | 手动调查 |
| 构建超时 | ❌ | 检查构建性能 |

## 最佳实践

1. **每次 push 后运行一次**
   ```bash
   git push origin main && pnpm monitor:deploy
   ```

2. **在重要部署前启用持续监听**
   ```bash
   pnpm watch:deploy &
   ```

3. **定期检查日志**
   ```bash
   tail -20 .deployment-monitor.log
   ```

4. **设置邮件通知**（可选）
   - Vercel 会自动发送部署失败邮件
   - 看到邮件后立即运行 `pnpm monitor:deploy`

5. **定期审计自动修复**
   - 检查 `.deployment-monitor.log` 了解自动修复历史
   - 确保自动修复没有造成其他问题

## 局限性

- ✅ 可以修复缺失依赖
- ❌ 无法修复逻辑错误
- ❌ 无法自动设置环境变量
- ❌ 无法处理需要人工审查的问题

## 未来改进

- [ ] Slack/Discord 通知
- [ ] 自动识别并修复更多类型的错误
- [ ] 构建性能优化建议
- [ ] 自动回滚失败的部署
- [ ] 部署历史分析仪表板
