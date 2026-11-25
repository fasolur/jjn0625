/**
 * 姓名：冀佳宁 | 学号：24002120625 |
 * 时间：2026-11-20 | 大模型：GLM
 *
 * 后端入口：Node.js + Express
 * - 所有接口以 /api/ 为前缀
 * - 端口固定 8625
 * - express.static 托管 frontend/ 静态资源
 * - cors 开放全部跨域（仅用于课程作业）
 */
const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// 中间件
app.use(cors()); // 开放全部跨域，仅课程作业使用
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 托管前端静态资源目录
app.use(express.static(path.join(__dirname, "..", "frontend")));

// API 路由（按 MVC 结构挂载到 /api/ 前缀下）
app.use("/api/database", require("./routes/jjn_database_routes"));
app.use("/api/news", require("./routes/jjn_news_routes"));
app.use("/api/gallery", require("./routes/jjn_gallery_routes"));
app.use("/api/chat", require("./routes/jjn_chat_routes"));
app.use("/api/kb", require("./routes/jjn_kb_routes"));
app.use("/api/ai", require("./routes/jjn_ai_routes"));

// 启动服务
const jjn_PORT = 8625;
app.listen(jjn_PORT, () => {
  console.log(`Server is running at http://localhost:${jjn_PORT}`);
});
