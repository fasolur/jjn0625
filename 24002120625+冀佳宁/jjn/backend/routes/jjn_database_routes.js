/**
 * 姓名：冀佳宁 | 学号：24002120625 |
 * 时间：2026-11-20 | 大模型：GLM
 *
 * 数据库模块路由（前缀 /api/database）
 */
const express = require("express");
const { jjn_connect } = require("../controllers/jjn_database_controller");

const jjn_router = express.Router();

jjn_router.post("/connect", jjn_connect);

module.exports = jjn_router;
