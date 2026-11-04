# AGENTS.md

## What this repo is

- Static HTML/CSS/JS coursework for 《高级网页设计》. **No package.json, no build, no lint, no tests, no CI.** Verification = open the page in a browser.
- Git repo root is this directory; **all actual work lives in `24002120625+冀佳宁/`** (student folder, serves as the site root — `index.html` is there, not at repo root).
- Branch: `master`. Remotes: `origin` → `neusoft_wangyao_jsj/beomgyu.313` (this repo); `hueningkai` → legacy `hueningkai.git`. Push to `origin`.

## Project rules (from `24002120625+冀佳宁/jjn_prompt.md` — keep honoring them)

1. **Naming**: new CSS class names, ids, and JS variables must be prefixed `jjn_` (see `iconfont-1..4.html`). Older pages (`index.html`, `代码.html`, `obj005.html`, …) predate the rule — don't mass-rename them.
2. **Index hub**: every newly created `.html` file must get a linked card in `24002120625+冀佳宁/index.html` (课堂目录 section). Several recent files (`wan/`, `四级项目*/`, `starter-level1-0625+jjn.html`, `event005.HTML`, `function-apply.html`, `js-obj-fun005.html`) are still unlinked.
3. **Prompt log**: before executing a task, *append* (never overwrite) an entry to `jjn_prompt.md` with 时间 / 模型 / 提示词.
4. **HTML 文件头注释（老师要求）**: every newly created `.html` file must carry a comment block right after `<!DOCTYPE html>` (before `<html>` or immediately inside `<head>`), containing four fields:

   ```html
   <!--
     作者：冀佳宁
     建立时间：2026-11-04
     使用大模型：DeepSeek-V4.1-Flash
     功能名称：例如 图标画廊 · Font Awesome 字体图标
   -->
   ```

   建立时间取创建当天日期（`YYYY-MM-DD`），使用大模型填当时实际使用的模型名，功能名称用一句话说明页面用途。
5. **JS 函数注释（老师要求）**: every function in a page's `<script>` must carry a comment stating its main purpose, placed directly above the function. Use `/** 主要功能：… */` for multi-line or `// 主要功能：…` for one-liners. Applies to new code; when touching an existing function without a comment, add one.


## Skills in this repo

- `24002120625+冀佳宁/skills/frontend-design/SKILL.md` — use when designing any new page (aesthetic direction, anti-template guidance).
- `24002120625+冀佳宁/.trae/skills/git-commit-gitee/SKILL.md` — the commit/push procedure for this repo: run `git diff --cached --stat` before pushing, commit format `feat: 中文简述` + bullets, never force push, redact the Gitee token in any output. The token is stored in that skill file — **never print or echo it**.

## Filesystem quirks (Windows / PowerShell 5.1)

- Filenames are Chinese, mixed-case (`.html` vs `.HTML`), and some contain non-ASCII dashes (`wan/xiaohongshu–activity.html`). Always use `-LiteralPath` and quote paths.
- The console renders UTF-8 filenames/content as mojibake; that's display-only. Don't "fix" encoding based on console output — inspect files with the Read/grep tools instead.

## Assets

- Vendor CDN dependencies locally into `24002120625+冀佳宁/cdn/` (fontawesome/, lucide/) instead of hotlinking; iconfont bundles live in `font/` and `四级项目/font_5242167_zmdijgi1pwe/`. Some older pages still hotlink `at.alicdn.com` — prefer local copies for new work.
- `data.js` (STUDENTS / SUBJECTS fixture) is loaded only by `starter-level1-0625+jjn.html`; change them together.

## READMEs

Root `README.md` / `README.en.md` are untouched Gitee templates — no useful info there.
