/**
 * 姓名：冀佳宁 | 学号：24002120625 |
 * 时间：2026-11-25 | 大模型：GLM
 *
 * 知识库（RAG）模块路由（前缀 /api/kb）
 */
const express = require("express");
const {
  jjn_upload_route, jjn_list_route, jjn_delete_route, jjn_ask_route,
} = require("../controllers/jjn_kb_controller");

const jjn_router = express.Router();

jjn_router.post("/upload", jjn_upload_route);      // 上传并解析知识库文件
jjn_router.get("/list", jjn_list_route);           // 知识库文件列表
jjn_router.delete("/file/:jjn_id", jjn_delete_route); // 删除知识库文件
jjn_router.post("/ask", jjn_ask_route);            // 基于知识库的 RAG 问答

module.exports = jjn_router;
