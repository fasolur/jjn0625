---
name: git-commit-gitee
description: Commit and push project to Gitee remote. Use when the user says submit project git commit push or gitee. Do not use for GitHub GitLab or unrelated git operations.
---

# Git Commit and Push to Gitee

## Target Repository

- **Gitee repo**: `https://gitee.com/neusoft_wangyao_jsj/hueningkai.git`
- **Private token**: `3dc0c06b807f224c48e80a4bbd1a8086`
- **Auth URL pattern**: `https://Oauth2:<token>@gitee.com/<path>.git`
- **Full remote URL**: `https://Oauth2:3dc0c06b807f224c48e80a4bbd1a8086@gitee.com/neusoft_wangyao_jsj/hueningkai.git`

## Execution Procedure

Run these steps in sequence. Stop and report on failure.

### 1. Verify git repository state

```powershell
git rev-parse --is-inside-work-tree
git status --short
```

If not a git repo, run `git init` first.

### 2. Ensure remote points to the target

```powershell
git remote -v
```

- If `origin` already exists but points elsewhere, update it:
  ```powershell
  git remote set-url origin https://Oauth2:3dc0c06b807f224c48e80a4bbd1a8086@gitee.com/neusoft_wangyao_jsj/hueningkai.git
  ```
- If `origin` does not exist:
  ```powershell
  git remote add origin https://Oauth2:3dc0c06b807f224c48e80a4bbd1a8086@gitee.com/neusoft_wangyao_jsj/hueningkai.git
  ```

### 3. Stage everything with explicit pathspec

```powershell
git add -A
```

### 4. Commit with a meaningful message

Commit message format:
```
feat: 本次变更简述

- 具体改动点 A
- 具体改动点 B
```

If the user provides a commit message, use it. Otherwise auto-generate based on `git diff --stat`.

### 5. Push

Default branch is `master` (Gitee default in China). Check first:

```powershell
git branch --show-current
```

Push with upstream:
```powershell
git push -u origin <current-branch>
```

If the push is rejected because remote is not empty and local history diverges, do NOT force push. Run `git pull --rebase origin <branch>` first, resolve conflicts if any, then push again.

### 6. Report

After successful push, print:
- Number of files committed
- Current branch name
- Remote URL used (redact token, show only first 6 chars: `3dc0c0...`)
- Gitee repo path

## Guardrails

- NEVER force push (`--force` or `-f`) unless the user explicitly says to.
- NEVER include the full private token in logs shown to the user.
- After push succeeds, do NOT leave the token in shell history. The URL form already handles this.
- Before pushing, ALWAYS run `git diff --cached --stat` so both you and the user can see what is being committed.
- If `wy_prompt.md` was modified (auto-logged by project rules), include it — it is project state, not sensitive data.
