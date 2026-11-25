/**
 * 姓名：冀佳宁 | 学号：24002120625 |
 * 时间：2026-11-20 | 大模型：GLM
 *
 * MySQL 连接配置（凭据来自 backend/.env）
 */
const mysql = require("mysql2/promise");

// 默认连接池（使用 .env 中的凭据）
const jjn_pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || undefined,
  waitForConnections: true,
  connectionLimit: 10
});

/**
 * 使用传入的凭据测试连接（用于连接测试接口）
 */
async function jjn_test_connection(jjn_host, jjn_user, jjn_password) {
  const jjn_conn = await mysql.createConnection({
    host: jjn_host || "localhost",
    port: 3306,
    user: jjn_user,
    password: jjn_password,
    connectTimeout: 5000
  });
  const [jjn_rows] = await jjn_conn.query("SELECT VERSION() AS jjn_version");
  await jjn_conn.end();
  return jjn_rows[0];
}

module.exports = { jjn_pool, jjn_test_connection };
