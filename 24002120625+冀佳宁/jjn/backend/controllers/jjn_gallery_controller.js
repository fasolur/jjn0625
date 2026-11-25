/**
 * 姓名：冀佳宁 | 学号：24002120625 |
 * 时间：2026-11-20 | 大模型：GLM
 *
 * 图文列表控制器
 */
const { jjn_find_all } = require("../models/jjn_gallery_model");

/**
 * GET /api/gallery/list
 * 返回全部图文数据，按创建时间倒序
 */
async function jjn_list(req, res) {
  try {
    const jjn_list_data = await jjn_find_all();
    console.log(`查询图文列表成功，共 ${jjn_list_data.length} 条`);
    res.json({
      code: 0,
      msg: "查询成功",
      data: {
        jjn_total: jjn_list_data.length,
        jjn_list: jjn_list_data
      }
    });
  } catch (jjn_err) {
    console.error("查询图文列表失败：", jjn_err.message);
    res.json({
      code: 1,
      msg: "查询图文列表失败：" + (jjn_err.message || jjn_err.code),
      data: null
    });
  }
}

module.exports = { jjn_list };
