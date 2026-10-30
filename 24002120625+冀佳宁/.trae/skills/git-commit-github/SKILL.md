---
name: git-commit-github
description: Commit and push the current project to GitHub https://github.com/fasolur/jjn0625 using the already-configured SSH public key (port 443), with Gitee https://gitee.com/fasolur/jjn0625.git as a mirror. Use when the user says 提交到 github / 提交到 gitee / submit project / git commit / push / jjn0625. Do not use for the hueningkai repository (handled by git-commit-gitee).
---

# Git Commit and Push (GitHub SSH + Gitee 镜像)

## Target Repositories

| 用途 | remote 名 | 地址 |
|------|-----------|------|
| **主** GitHub | `github` | `ssh://git@ssh.github.com:443/fasolur/jjn0625.git` |
| 镜像 Gitee | `jjn0625` | `git@gitee.com:fasolur/jjn0625.git` |

- **Auth**: 已配置的 SSH 公钥（无令牌、无 URL 内嵌密码）
- **Default branch**: `master`
- **本地仓库根**: `D:\高级网页设计\beomgyu.313`（不是子目录 `24002120625+冀佳宁`）

> GitHub 的 22 端口在本机被拒绝（`Connection refused`），必须走 443。因此远端地址使用
> `ssh://git@ssh.github.com:443/fasolur/jjn0625.git` 这种显式端口形式，
> 而不是 `git@github.com:fasolur/jjn0625.git`。

## Execution Procedure

依次执行，任一步失败立即停止并报告，不要自行改写策略。

### 1. 确认仓库状态

```powershell
git rev-parse --show-toplevel
git status --short
```

### 2. 验证 SSH 公钥可用

```powershell
ssh -o StrictHostKeyChecking=accept-new -T -p 443 git@ssh.github.com
```

期望输出 `Hi <username>! You've successfully authenticated`。若失败，让用户在 GitHub 账号里添加公钥，不要回退到 HTTPS 令牌方式。

### 3. 配置 remote（仅在缺失或不匹配时）

```powershell
git remote -v
```

- 不存在 `github`：
  ```powershell
  git remote add github ssh://git@ssh.github.com:443/fasolur/jjn0625.git
  ```
- 已存在但地址不同：
  ```powershell
  git remote set-url github ssh://git@ssh.github.com:443/fasolur/jjn0625.git
  ```

### 4. 暂存并核对内容

```powershell
git add -A
git diff --cached --stat
```

先展示暂存清单，再提交。

### 5. 提交

```powershell
git commit -m "feat: 本次变更简述" -m "- 具体改动点 A`n- 具体改动点 B"
```

提交信息用中文描述"为什么改"，不要罗列文件名。

### 6. 推送（主仓库 + 镜像）

```powershell
git branch --show-current
git push -u github master
git push jjn0625 master
```

若远端非空且历史分叉被拒：`git pull --rebase github master`，解决冲突后再推送。**禁止 force push**。

### 7. 结果校验与汇报

```powershell
git ls-remote github master
git log --oneline -1
```

汇报：
- commit 短哈希
- 变更文件数（`git diff --stat HEAD~1`）
- 当前分支
- GitHub 远端 HEAD 是否与本地 `HEAD` 一致
- Gitee 镜像是否同步

## Guardrails

- 禁止 `--force` / `-f`，除非用户明确要求。
- 禁止把任何私人令牌写入 `.git/config`、脚本或命令行；本仓库只走 SSH。
- 禁止使用 `origin`（它指向带内嵌 token 的旧 HTTPS 地址），推送一律显式指定 `github` / `jjn0625`。
- 推送前必须展示 `git diff --cached --stat`。
- 不提交 `.vscode/`、`.trae/mcp.json` 等本地配置。
