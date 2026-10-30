---
name: git-commit-github
description: Commit and push the current project to the Gitee repository https://gitee.com/fasolur/jjn0625.git using the already-configured SSH public key. Use when the user says 提交到 github / 提交到 gitee / submit project / git commit / push / jjn0625. Do not use for the hueningkai repository (that is handled by git-commit-gitee) or for GitHub/GitLab.
---

# Git Commit and Push to Gitee (SSH)

## Target Repository

- **Gitee repo page**: `https://gitee.com/fasolur/jjn0625.git`
- **Git remote (SSH)**: `git@gitee.com:fasolur/jjn0625.git`
- **Auth**: 已配置的 SSH 公钥（无令牌、无 URL 内嵌密码）
- **Remote name**: `jjn0625`
- **Default branch**: `master`

## Execution Procedure

依次执行，任一步失败立即停止并报告，不要自行改写策略。

### 1. 确认仓库状态

```powershell
git rev-parse --show-toplevel
git status --short
```

仓库根目录为 `D:\高级网页设计\beomgyu.313`（不是子目录 `24002120625+冀佳宁`）。

### 2. 验证 SSH 公钥可用

```powershell
ssh -o StrictHostKeyChecking=accept-new -T git@gitee.com
```

期望输出包含 `Hi ...(@fasolur)! You've successfully authenticated`。若认证失败，停止并让用户在 Gitee 账号中添加公钥，不要回退到 HTTPS 令牌方式。

### 3. 配置 remote（仅在缺失或不匹配时）

```powershell
git remote -v
```

- 不存在 `jjn0625`：
  ```powershell
  git remote add jjn0625 git@gitee.com:fasolur/jjn0625.git
  ```
- 已存在但地址不同：
  ```powershell
  git remote set-url jjn0625 git@gitee.com:fasolur/jjn0625.git
  ```

### 4. 暂存并核对内容

```powershell
git add -A
git diff --cached --stat
```

先把暂存清单展示给用户确认，再提交。

### 5. 提交

```powershell
git commit -m "feat: 本次变更简述" -m "- 具体改动点 A`n- 具体改动点 B"
```

提交信息用中文描述"为什么改"，不要罗列文件名。

### 6. 推送

```powershell
git branch --show-current
git push -u jjn0625 master
```

若远端非空且历史分叉被拒：执行 `git pull --rebase jjn0625 master`，解决冲突后再推送。**禁止 force push**。

### 7. 结果校验与汇报

```powershell
git ls-remote jjn0625 master
git log --oneline -1
```

汇报内容：
- commit 短哈希
- 变更文件数（`git diff --stat HEAD~1`）
- 当前分支
- 远端地址（`gitee.com/fasolur/jjn0625`）
- 远端 HEAD 是否与本地一致

## Guardrails

- 禁止 `--force` / `-f`，除非用户明确要求。
- 禁止把任何私人令牌写入 `.git/config`、脚本或命令行；本仓库只走 SSH。
- 推送前必须展示 `git diff --cached --stat`。
- 不提交 `.vscode/`、`.trae/mcp.json` 等本地配置（已在 `.gitignore` 中）。
