/**
 * 姓名：冀佳宁 | 学号：24002120625 |
 * 时间：2026-11-25 | 大模型：GLM
 *
 * 知识库（RAG）控制器：文件上传/解析/分块/检索/问答
 * - 支持 .docx（mammoth）、.pptx（jszip 解 XML）、.txt/.md、
 *   .doc/.ppt（旧二进制格式做文本流粗提取，提取失败会给出友好提示）
 * - 检索：中文二字组（bigram）重合度打分，取 Top3 片段拼进提示词（无需向量的轻量 RAG）
 * - 按课程要求：控制台完整输出发送给大模型的数据、接收自大模型的数据
 */
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const mammoth = require("mammoth");
const JSZip = require("jszip");

// 上传目录与索引文件（知识库元数据 + 分块，JSON 存储，免数据库依赖）
const jjn_upload_dir = path.join(__dirname, "..", "uploads");
const jjn_index_path = path.join(jjn_upload_dir, "jjn_kb_index.json");
if (!fs.existsSync(jjn_upload_dir)) fs.mkdirSync(jjn_upload_dir, { recursive: true });

/** 主要功能: 读知识库索引文件，不存在则返回空结构 */
function jjn_read_index() {
  try {
    return JSON.parse(fs.readFileSync(jjn_index_path, "utf8"));
  } catch (e) {
    return { jjn_files: [], jjn_chunks: [] };
  }
}

/** 主要功能: 写知识库索引文件 */
function jjn_write_index(jjn_index) {
  fs.writeFileSync(jjn_index_path, JSON.stringify(jjn_index, null, 2), "utf8");
}

/** 主要功能: multer 上传配置 —— 保存到 backend/uploads/，限制 10MB */
const jjn_upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, jjn_upload_dir),
    filename: (req, file, cb) => {
      // 用时间戳重命名避免重名覆盖，原始名存进索引
      const jjn_ext = path.extname(file.originalname || "");
      cb(null, `kb_${Date.now()}${jjn_ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

/** 主要功能: 从旧版二进制 Office（.doc/.ppt）里粗提取文本。
 *          思路：扫描字节流，抓取 UTF-16LE 或 GBK 编码的可读文本连续段（长度>=4） */
function jjn_extract_legacy_text(jjn_buffer) {
  const jjn_ok = (jjn_c) =>
    (jjn_c >= 0x20 && jjn_c <= 0x7e) || (jjn_c >= 0x4e00 && jjn_c <= 0x9fff) ||
    (jjn_c >= 0x3000 && jjn_c <= 0x303f) || (jjn_c >= 0xff00 && jjn_c <= 0xffef);
  const jjn_runs = [];
  // 第一遍：按 UTF-16LE 试提取（.ppt 的文本通常这样存）
  for (let i = 0; i + 1 < jjn_buffer.length; i += 2) {
    const jjn_code = jjn_buffer.readUInt16LE(i);
    if (jjn_ok(jjn_code)) {
      let jjn_end = i;
      while (jjn_end + 1 < jjn_buffer.length && jjn_ok(jjn_buffer.readUInt16LE(jjn_end)) &&
             jjn_end - i < 2000) jjn_end += 2;
      if (jjn_end - i >= 8) jjn_runs.push(jjn_buffer.toString("utf16le", i, jjn_end));
      i = jjn_end;
    }
  }
  // 第二遍：按 GBK 试提取（.doc 的中文正文常这样存）
  try {
    const jjn_gbk = new TextDecoder("gbk");
    for (let i = 0; i < jjn_buffer.length; i++) {
      if (jjn_ok(jjn_buffer[i])) {
        let jjn_end = i;
        while (jjn_end < jjn_buffer.length && jjn_end - i < 2000 && jjn_ok(jjn_buffer[jjn_end])) jjn_end++;
        if (jjn_end - i >= 8) jjn_runs.push(jjn_gbk.decode(jjn_buffer.subarray(i, jjn_end)));
        i = jjn_end;
      }
    }
  } catch (e) { /* 环境 GBK 解码器不可用时跳过 */ }
  // 去掉乱码感很强的行，保留可读文本
  return jjn_runs
    .map((s) => s.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, " ").trim())
    .filter((s) => /[\u4e00-\u9fff]{2,}/.test(s))
    .join("\n");
}

/** 主要功能: 解析 pptx —— jszip 解包，按页读 ppt/slides/slideN.xml，
 *          提取 <a:t> 文本节点（PowerPoint 的文本都存在这个标签里） */
async function jjn_extract_pptx(jjn_buffer) {
  const jjn_zip = await JSZip.loadAsync(jjn_buffer);
  const jjn_slide_names = Object.keys(jjn_zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => (parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0])));
  const jjn_pages = [];
  for (const jjn_name of jjn_slide_names) {
    const jjn_xml = await jjn_zip.files[jjn_name].async("string");
    const jjn_texts = [...jjn_xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map((m) => m[1]);
    if (jjn_texts.length) jjn_pages.push(`【第${jjn_pages.length + 1}页】\n` + jjn_texts.join("\n"));
  }
  return jjn_pages.join("\n\n");
}

/** 主要功能: 按扩展名分派解析器，返回纯文本 */
async function jjn_extract_text(jjn_file_path) {
  const jjn_ext = path.extname(jjn_file_path).toLowerCase();
  if (jjn_ext === ".txt" || jjn_ext === ".md") return fs.readFileSync(jjn_file_path, "utf8");
  if (jjn_ext === ".docx") {
    const jjn_result = await mammoth.extractRawText({ path: jjn_file_path });
    return jjn_result.value;
  }
  if (jjn_ext === ".pptx") return jjn_extract_pptx(fs.readFileSync(jjn_file_path));
  if (jjn_ext === ".doc" || jjn_ext === ".ppt") {
    return jjn_extract_legacy_text(fs.readFileSync(jjn_file_path));
  }
  throw new Error(`暂不支持的格式：${jjn_ext}（支持 doc/docx/ppt/pptx/txt/md）`);
}

/** 主要功能: 分块 —— 按段落聚合，每块约 350 字，相邻块重叠约 50 字（保上下文不断裂） */
function jjn_chunk_text(jjn_text) {
  const jjn_paras = jjn_text.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  const jjn_chunks = [];
  let jjn_cur = "";
  for (const jjn_p of jjn_paras) {
    if (jjn_cur && (jjn_cur + "\n" + jjn_p).length > 350) {
      jjn_chunks.push(jjn_cur);
      jjn_cur = jjn_cur.slice(-50) + "\n" + jjn_p; // 带上上一块结尾做重叠
    } else {
      jjn_cur = jjn_cur ? jjn_cur + "\n" + jjn_p : jjn_p;
    }
  }
  if (jjn_cur) jjn_chunks.push(jjn_cur);
  return jjn_chunks;
}

/** 主要功能: 中文 bigram 重合度打分 —— 问题转二字组集合，统计在片段中的命中密度 */
function jjn_score(jjn_question, jjn_chunk) {
  const jjn_clean = jjn_question.replace(/[^\u4e00-\u9fff\w]/g, "");
  if (jjn_clean.length < 2) return 0;
  const jjn_grams = new Set();
  for (let i = 0; i < jjn_clean.length - 1; i++) jjn_grams.add(jjn_clean.slice(i, i + 2));
  let jjn_hits = 0;
  jjn_grams.forEach((jjn_g) => {
    if (jjn_chunk.jjn_text.includes(jjn_g)) jjn_hits++;
  });
  return jjn_hits / Math.sqrt(jjn_chunk.jjn_text.length); // 长文惩罚，避免超长块霸榜
}

/** 主要功能: 检索 Top3 片段，返回 [{file_id, text, score}] */
function jjn_search(jjn_question, jjn_index) {
  return jjn_index.jjn_chunks
    .map((jjn_c) => ({ ...jjn_c, jjn_score: jjn_score(jjn_question, jjn_c) }))
    .sort((a, b) => b.jjn_score - a.jjn_score)
    .slice(0, 3)
    .filter((jjn_c) => jjn_c.jjn_score > 0);
}

/** 主要功能: 从 provider 配置读平台三件套（与客服模块共用 .env） */
function jjn_provider_config() {
  return {
    siliconflow: {
      jjn_base_url: process.env.SILICONFLOW_BASE_URL,
      jjn_model: process.env.SILICONFLOW_MODEL,
      jjn_api_key: process.env.SILICONFLOW_API_KEY,
    },
    qiniu: {
      jjn_base_url: process.env.QINIU_CUSTOMER_SERVICE_BASE_URL,
      jjn_model: process.env.QINIU_CUSTOMER_SERVICE_MODEL,
      jjn_api_key: process.env.QINIU_CUSTOMER_SERVICE_API_KEY,
    },
  };
}

/** 主要功能: 调大模型 chat/completions 的公共函数 —— 课程要求：
 *          在控制台输出发送给大模型的数据（jjn_payload）和接收自大模型的数据（jjn_data） */
async function jjn_call_llm(jjn_messages, jjn_cfg) {
  const jjn_payload = {
    model: jjn_cfg.jjn_model,
    temperature: 0.3,
    max_tokens: 500,
    messages: jjn_messages,
  };
  console.log("\n========== [RAG] 发送给大模型的数据 ==========");
  console.log(JSON.stringify(jjn_payload, null, 2));

  const jjn_resp = await fetch(`${jjn_cfg.jjn_base_url}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jjn_cfg.jjn_api_key}`,
    },
    body: JSON.stringify(jjn_payload),
  });
  const jjn_data = await jjn_resp.json().catch(() => ({}));

  console.log("========== [RAG] 接收自大模型的数据 ==========");
  console.log(JSON.stringify(jjn_data, null, 2));

  if (!jjn_resp.ok) {
    const jjn_error_map = {
      401: "Key 无效或过期，请检查 backend/.env",
      402: "余额不足，请到平台领取免费额度",
      429: "请求太频繁触发限流，稍等几秒再试",
    };
    throw new Error(jjn_error_map[jjn_resp.status] || `平台返回 ${jjn_resp.status}`);
  }
  return jjn_data.choices?.[0]?.message?.content || "（模型没有返回内容）";
}

/**
 * 主要功能: POST /api/kb/upload —— 上传知识库文件，解析分块后写入索引
 */
const jjn_upload_handler = jjn_upload.single("jjn_file");

function jjn_upload_route(req, res) {
  jjn_upload_handler(req, res, async (jjn_err) => {
    if (jjn_err) return res.json({ code: 1, msg: "上传失败：" + jjn_err.message, data: null });
    if (!req.file) return res.json({ code: 1, msg: "请选择文件", data: null });

    const jjn_orig_name = Buffer.from(req.file.originalname || "未命名", "latin1").toString("utf8");
    try {
      const jjn_text = await jjn_extract_text(req.file.path);
      if (!jjn_text.trim()) throw new Error("没能从文件里提取到文本（旧格式可能加密或损坏）");
      const jjn_chunks = jjn_chunk_text(jjn_text);

      const jjn_index = jjn_read_index();
      const jjn_file_id = `f${Date.now()}`;
      jjn_index.jjn_files.push({
        jjn_id: jjn_file_id,
        jjn_name: jjn_orig_name,
        jjn_size: req.file.size,
        jjn_chunk_count: jjn_chunks.length,
        jjn_upload_time: new Date().toLocaleString("zh-CN"),
      });
      jjn_chunks.forEach((jjn_t) =>
        jjn_index.jjn_chunks.push({ jjn_file_id, jjn_text: jjn_t }));
      jjn_write_index(jjn_index);

      console.log(`[RAG] 上传成功: ${jjn_orig_name} → 提取 ${jjn_text.length} 字，分 ${jjn_chunks.length} 块`);
      res.json({
        code: 0, msg: "上传并解析成功",
        data: { jjn_name: jjn_orig_name, jjn_chunk_count: jjn_chunks.length },
      });
    } catch (jjn_e) {
      fs.unlink(req.file.path, () => {}); // 解析失败就删掉残留文件
      console.error("[RAG] 解析失败:", jjn_e.message);
      res.json({ code: 1, msg: "解析失败：" + jjn_e.message, data: null });
    }
  });
}

/**
 * 主要功能: GET /api/kb/list —— 知识库文件列表
 */
function jjn_list_route(req, res) {
  const jjn_index = jjn_read_index();
  res.json({ code: 0, msg: "查询成功", data: { jjn_files: jjn_index.jjn_files } });
}

/**
 * 主要功能: DELETE /api/kb/file/:id —— 删除知识库文件及其全部分块
 */
function jjn_delete_route(req, res) {
  const jjn_index = jjn_read_index();
  const jjn_file = jjn_index.jjn_files.find((f) => f.jjn_id === req.params.jjn_id);
  if (!jjn_file) return res.json({ code: 1, msg: "文件不存在", data: null });

  jjn_index.jjn_files = jjn_index.jjn_files.filter((f) => f.jjn_id !== req.params.jjn_id);
  jjn_index.jjn_chunks = jjn_index.jjn_chunks.filter((c) => c.jjn_file_id !== req.params.jjn_id);
  jjn_write_index(jjn_index);
  res.json({ code: 0, msg: "删除成功", data: null });
}

/**
 * 主要功能: POST /api/kb/ask —— 基于知识库的 RAG 问答
 *          流程：检索 Top3 片段 → 拼进 system 提示词 → 调大模型（控制台打印收发数据）
 */
async function jjn_ask_route(req, res) {
  try {
    const jjn_question = (req.body.jjn_question || "").trim();
    if (!jjn_question) return res.json({ code: 1, msg: "问题不能为空", data: null });

    const jjn_index = jjn_read_index();
    if (jjn_index.jjn_chunks.length === 0) {
      return res.json({ code: 1, msg: "知识库为空，请先上传文件", data: null });
    }

    // 1) 检索
    const jjn_hits = jjn_search(jjn_question, jjn_index);
    const jjn_file_map = {};
    jjn_index.jjn_files.forEach((f) => (jjn_file_map[f.jjn_id] = f.jjn_name));
    console.log(`\n[RAG] 问题「${jjn_question}」命中 ${jjn_hits.length} 个片段:`);
    jjn_hits.forEach((h, i) =>
      console.log(`  Top${i + 1} [${jjn_file_map[h.jjn_file_id]}] score=${h.jjn_score.toFixed(3)}: ${h.jjn_text.slice(0, 60)}...`));

    // 2) 组提示词：知识库片段 + 多轮历史 + 本轮问题
    const jjn_context = jjn_hits
      .map((h, i) => `【片段${i + 1}｜来自 ${jjn_file_map[h.jjn_file_id]}】\n${h.jjn_text}`)
      .join("\n\n");
    const jjn_history = Array.isArray(req.body.jjn_messages)
      ? req.body.jjn_messages.slice(-6) // 最多带 3 轮历史，防超长
      : [];
    const jjn_messages = [
      {
        role: "system",
        content:
          "你是\"中华美食街\"的智能客服，必须只依据下面的知识库片段回答用户问题。\n" +
          "如果片段里没有答案，就回答\"抱歉，知识库里暂时没有相关内容，您可以留言联系人工客服\"。\n" +
          "回答要简短友好，不超过 150 字。\n\n知识库片段：\n" + (jjn_context || "（无）"),
      },
      ...jjn_history,
      { role: "user", content: jjn_question },
    ];

    // 3) 调大模型
    const jjn_providers = jjn_provider_config();
    const jjn_key = process.env.AI_PROVIDER || "siliconflow";
    const jjn_answer = await jjn_call_llm(jjn_messages, jjn_providers[jjn_key]);

    res.json({
      code: 0, msg: "回答成功",
      data: {
        jjn_answer,
        jjn_sources: jjn_hits.map((h) => jjn_file_map[h.jjn_file_id]),
      },
    });
  } catch (jjn_e) {
    console.error("[RAG] 问答失败:", jjn_e.message);
    res.json({ code: 1, msg: "问答失败：" + jjn_e.message, data: null });
  }
}

module.exports = { jjn_upload_route, jjn_list_route, jjn_delete_route, jjn_ask_route };
