/**
 * 姓名：冀佳宁 | 学号：24002120625 |
 * 时间：2026-11-25 | 大模型：GLM
 *
 * 智能感知模块路由（前缀 /api/ai）
 */
const express = require("express");
const { jjn_image_route, jjn_asr_route } = require("../controllers/jjn_ai_controller");

const jjn_router = express.Router();

jjn_router.post("/image", jjn_image_route); // 图像识别：图片 → 中文描述
jjn_router.post("/asr", jjn_asr_route);     // 语音识别：录音/音频 → 文字

module.exports = jjn_router;
