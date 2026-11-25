/**
 * 姓名：冀佳宁 | 学号：24002120625 |
 * 时间：2026-11-20 | 大模型：GLM
 *
 * 科技新闻模型（jjn_web.jjn_news 表）
 */
const { jjn_pool } = require("../config/jjn_db");

/**
 * 查询新闻列表（按发布时间倒序）
 */
async function jjn_find_all() {
  const [jjn_rows] = await jjn_pool.query(
    "SELECT jjn_id, jjn_title, jjn_summary, jjn_source, jjn_publish_time, jjn_category FROM jjn_news ORDER BY jjn_publish_time DESC, jjn_id DESC"
  );
  return jjn_rows;
}

module.exports = { jjn_find_all };
