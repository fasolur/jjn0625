/**
 * 姓名：冀佳宁 | 学号：24002120625 |
 * 时间：2026-11-20 | 大模型：GLM
 *
 * 数据库连接控制器
 */
const { jjn_test_connection } = require("../config/jjn_db");

/**
 * POST /api/database/connect
 * 入参：{ jjn_user, jjn_password, jjn_host(可选，默认 localhost) }
 */
async function jjn_connect(req, res) {
  const { jjn_user, jjn_password, jjn_host } = req.body || {};

  if (!jjn_user || jjn_password === undefined || jjn_password === null) {
    return res.json({ code: 1, msg: "用户名和密码不能为空", data: null });
  }

  try {
    const jjn_info = await jjn_test_connection(jjn_host, jjn_user, jjn_password);
    console.log("数据库连接成功：", jjn_info);
    res.json({
      code: 0,
      msg: "数据库连接成功",
      data: {
        jjn_host: jjn_host || "localhost",
        jjn_user: jjn_user,
        jjn_version: jjn_info.jjn_version
      }
    });
  } catch (jjn_err) {
    // ECONNREFUSED 等网络错误的 message 可能为空，用 err.code 兜底
    const jjn_msg = jjn_err.message || jjn_err.code || "未知错误";
    console.error("数据库连接失败：", jjn_msg);
    res.json({
      code: 1,
      msg: "数据库连接失败：" + jjn_msg,
      data: null
    });
  }
}

module.exports = { jjn_connect };
