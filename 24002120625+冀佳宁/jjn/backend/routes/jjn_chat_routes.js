/**
 * 姓名：冀佳宁 | 学号：24002120625 |
 * 时间：2026-11-25 | 大模型：GLM
 *
 * 在线客服模块路由（前缀 /api/chat）
 */
const express = require("express");
const { jjn_chat } = require("../controllers/jjn_chat_controller");

const jjn_router = express.Router();

jjn_router.post("/send", jjn_chat);

module.exports = jjn_router;
