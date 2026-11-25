/**
 * 姓名：冀佳宁 | 学号：24002120625 |
 * 时间：2026-11-25 | 大模型：GLM
 *
 * 智能感知控制器：图像识别（硅基流动 Qwen3-VL）+ 语音识别 ASR（七牛 Qwen-Audio-3.0-ASR-Flash）
 * - 图像：上传图片 → base64 → 视觉模型 chat/completions → 中文描述
 * - 语音：录音/音频文件 → 转发 OpenAI 兼容 /audio/transcriptions；
 *         七牛网关暂无该模型通道时自动降级到硅基流动 SenseVoice（功能不缺）
 * - 按课程要求：控制台输出发送给大模型的数据、接收自大模型的数据
 */
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const jjn_upload_dir = path.join(__dirname, "..", "uploads", "ai");
if (!fs.existsSync(jjn_upload_dir)) fs.mkdirSync(jjn_upload_dir, { recursive: true });

// multer：图片 8MB / 音频 15MB，先落盘再处理
const jjn_img_upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, jjn_upload_dir),
    filename: (req, file, cb) => cb(null, `img_${Date.now()}${path.extname(file.originalname || ".jpg")}`),
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
});
const jjn_audio_upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, jjn_upload_dir),
    filename: (req, file, cb) => cb(null, `aud_${Date.now()}${path.extname(file.originalname || ".webm")}`),
  }),
  limits: { fileSize: 15 * 1024 * 1024 },
});

/** 主要功能: 统一成功/失败响应 */
const jjn_ok = (res, jjn_data) => res.json({ code: 0, msg: "成功", data: jjn_data });
const jjn_bad = (res, jjn_msg) => res.json({ code: 1, msg: jjn_msg, data: null });

/**
 * 主要功能: POST /api/ai/image —— 图像识别
 *          收图片文件 → 转 base64 dataURL → 硅基流动视觉模型 → 返回中文描述
 */
function jjn_image_route(req, res) {
  jjn_img_upload.single("jjn_image")(req, res, async (jjn_err) => {
    if (jjn_err) return jjn_bad(res, "上传失败：" + jjn_err.message);
    if (!req.file) return jjn_bad(res, "请选择图片");

    const jjn_b64 = fs.readFileSync(req.file.path).toString("base64");
    const jjn_mime = req.file.mimetype || "image/jpeg";
    const jjn_data_url = `data:${jjn_mime};base64,${jjn_b64}`;

    try {
      const jjn_payload = {
        model: process.env.SILICONFLOW_VISION_MODEL || "Qwen/Qwen3-VL-8B-Instruct",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "请用中文描述这张图片的内容，不超过 120 字，如果是美食/场景请说得有画面感。" },
              { type: "image_url", image_url: { url: jjn_data_url } },
            ],
          },
        ],
      };
      // 控制台日志：base64 太长，用占位符代替（完整数据确实发给了模型）
      console.log("\n========== [图像识别] 发送给大模型的数据 ==========");
      const jjn_log_payload = JSON.parse(JSON.stringify(jjn_payload));
      jjn_log_payload.messages[0].content[1].image_url.url = `<base64 已省略，共 ${jjn_b64.length} 字符>`;
      console.log(JSON.stringify(jjn_log_payload, null, 2));

      const jjn_resp = await fetch(`${process.env.SILICONFLOW_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SILICONFLOW_API_KEY}`,
        },
        body: JSON.stringify(jjn_payload),
      });
      const jjn_data = await jjn_resp.json().catch(() => ({}));

      console.log("========== [图像识别] 接收自大模型的数据 ==========");
      console.log(JSON.stringify(jjn_data, null, 2));

      if (!jjn_resp.ok) {
        const jjn_error_map = {
          401: "Key 无效或过期，请检查 backend/.env",
          402: "余额不足，请到平台领取免费额度",
          404: "视觉模型名写错，检查 SILICONFLOW_VISION_MODEL",
          429: "请求太频繁触发限流，稍等几秒再试",
        };
        return jjn_bad(res, jjn_error_map[jjn_resp.status] || `平台返回 ${jjn_resp.status}`);
      }
      jjn_ok(res, {
        jjn_description: jjn_data.choices?.[0]?.message?.content || "（模型没有返回内容）",
        jjn_model: jjn_payload.model,
        jjn_file: req.file.filename,
      });
    } catch (jjn_e) {
      console.error("[图像识别] 失败:", jjn_e.message);
      jjn_bad(res, "图像识别失败：" + jjn_e.message);
    }
  });
}

/**
 * 主要功能: 语音转文字公共函数 —— OpenAI 兼容 /audio/transcriptions
 *          返回 { text } 或抛 Error(jjn_msg)
 */
async function jjn_asr_request(jjn_base, jjn_key, jjn_model, jjn_file_path, jjn_orig_name) {
  const jjn_form = new FormData();
  jjn_form.append("model", jjn_model);
  jjn_form.append("file", new Blob([fs.readFileSync(jjn_file_path)]), jjn_orig_name || "audio.webm");
  const jjn_resp = await fetch(`${jjn_base}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${jjn_key}` },
    body: jjn_form,
  });
  const jjn_data = await jjn_resp.json().catch(() => ({}));
  console.log(`[语音识别] 平台返回 (HTTP ${jjn_resp.status}):`, JSON.stringify(jjn_data));
  if (!jjn_resp.ok) {
    const jjn_error_map = {
      401: "Key 无效或过期",
      402: "余额不足",
      404: `模型 ${jjn_model} 不存在`,
      429: "请求太频繁",
    };
    throw new Error(jjn_error_map[jjn_resp.status] || `平台返回 ${jjn_resp.status}：${jjn_data.error?.message || ""}`);
  }
  return jjn_data.text || "（没有识别到语音内容）";
}

/**
 * 主要功能: POST /api/ai/asr —— 语音识别
 *          主用七牛 Qwen-Audio-3.0-ASR-Flash；网关无通道时自动降级硅基流动 SenseVoice
 */
function jjn_asr_route(req, res) {
  jjn_audio_upload.single("jjn_audio")(req, res, async (jjn_err) => {
    if (jjn_err) return jjn_bad(res, "上传失败：" + jjn_err.message);
    if (!req.file) return jjn_bad(res, "请先录音或选择音频文件");

    const jjn_orig_name = Buffer.from(req.file.originalname || "audio.webm", "latin1").toString("utf8");
    const jjn_qiniu_model = process.env.QINIU_CUSTOMER_SERVICE_ASR_MODEL || "Qwen-Audio-3.0-ASR-Flash";

    try {
      console.log("\n========== [语音识别] 发送给大模型的数据 ==========");
      console.log(JSON.stringify({
        provider: "qiniu",
        url: `${process.env.QINIU_CUSTOMER_SERVICE_BASE_URL}/audio/transcriptions`,
        model: jjn_qiniu_model,
        file: { name: jjn_orig_name, size: req.file.size, mimetype: req.file.mimetype },
      }, null, 2));

      try {
        // 第一选择：七牛 ASR
        const jjn_text = await jjn_asr_request(
          process.env.QINIU_CUSTOMER_SERVICE_BASE_URL,
          process.env.QINIU_CUSTOMER_SERVICE_API_KEY,
          jjn_qiniu_model,
          req.file.path,
          jjn_orig_name
        );
        jjn_ok(res, { jjn_text, jjn_provider: `七牛 · ${jjn_qiniu_model}`, jjn_fallback: false });
      } catch (jjn_qiniu_err) {
        // 降级：七牛网关暂无该模型通道 → 硅基流动 SenseVoice（免费）
        console.warn(`[语音识别] 七牛失败（${jjn_qiniu_err.message}），降级到硅基流动 SenseVoice`);
        console.log(JSON.stringify({
          provider: "siliconflow(降级)",
          url: `${process.env.SILICONFLOW_BASE_URL}/audio/transcriptions`,
          model: "FunAudioLLM/SenseVoiceSmall",
          file: { name: jjn_orig_name, size: req.file.size },
        }, null, 2));
        const jjn_text = await jjn_asr_request(
          process.env.SILICONFLOW_BASE_URL,
          process.env.SILICONFLOW_API_KEY,
          "FunAudioLLM/SenseVoiceSmall",
          req.file.path,
          jjn_orig_name
        );
        jjn_ok(res, {
          jjn_text,
          jjn_provider: `硅基流动 SenseVoice（降级：七牛 ${jjn_qiniu_err.message}）`,
          jjn_fallback: true,
        });
      }
    } catch (jjn_e) {
      console.error("[语音识别] 失败:", jjn_e.message);
      jjn_bad(res, "语音识别失败：" + jjn_e.message);
    }
  });
}

module.exports = { jjn_image_route, jjn_asr_route };
