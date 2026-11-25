/**
 * 姓名：冀佳宁 | 学号：24002120625 |
 * 时间：2026-11-20 | 大模型：GLM
 *
 * 图文模块路由（前缀 /api/gallery）
 */
const express = require("express");
const { jjn_list } = require("../controllers/jjn_gallery_controller");

const jjn_router = express.Router();

jjn_router.get("/list", jjn_list);

module.exports = jjn_router;
