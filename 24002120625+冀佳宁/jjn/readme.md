# 高级网页设计课程项目

- 姓名：冀佳宁
- 学号：24002120625

## 项目简介

个人网页项目集合（课程作业），前端采用原生 HTML / CSS / JavaScript，后端采用 Node.js + Express（RESTful + MVC），数据库使用 MySQL。

## 目录结构

- `frontend/`：前端静态资源（css / js / fonts / images）
- `backend/`：后端服务（端口 8625，接口前缀 `/api/`）

## 快速启动

```bash
cd backend
npm i
npm start
```

访问 http://localhost:8625 即可打开首页。

## 说明

- 数据库凭据保存在 `backend/.env`（不入库）
- 详细规则见根目录 `AGENTS.md`

---

## 大模型应用（LLM 实践）功能说明 —— 24002120625 冀佳宁

在原全栈项目上新增 4 个大模型功能模块（前端 + 后端 MVC，Key 只存 backend/.env，绝不进前端和 Git）：

| 模块 | 入口页面 | 说明 |
|---|---|---|
| 在线客服 | frontend/service.html | 多轮对话、硅基流动/七牛下拉热切换、开放域人设 |
| 知识库问答（RAG） | frontend/knowledge.html | 上传 doc/docx/ppt/pptx/txt/md → 解析分块 → bigram 检索 Top3 → 带出处回答；含文件管理（列表/删除）；示例文件在 knowledge_files/ |
| 智能感知 | frontend/ai.html | 图像识别（Qwen3-VL-8B）；语音识别（七牛 Qwen-Audio-3.0-ASR-Flash，网关无通道时自动降级硅基流动 SenseVoice） |
| 控制台日志 | 后端控制台 | 每次调用打印「发送给大模型的数据」与「接收自大模型的数据」 |

### 本地运行方式

`ash
cd backend
npm install        # 安装依赖（express/dotenv/multer/mammoth/jszip）
node app.js        # 启动于 http://localhost:8625
`

浏览器打开 http://localhost:8625 ，首页导航 05/06/07 三个入口即可演示。
注：backend/.env 存放 API Key 与数据库配置（已在 .gitignore 中排除，不入库），运行前需自行配置。
