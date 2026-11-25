/**
 * 姓名：冀佳宁 | 学号：24002120625 |
 * 时间：2026-11-25 | 大模型：GLM
 *
 * 在线客服控制器（大模型应用作业）
 * - 前端把 messages 数组发给本控制器
 * - 本控制器带 Key 转发给大模型平台（硅基流动/七牛，OpenAI 兼容格式）
 * - Key 只从 backend/.env 读取，绝不进前端、绝不进 Git（课程红线）
 * - 支持前端下拉框在两个平台间热切换（任务三）
 */
// 客服人设 system 提示词：开放域通用助手 —— 什么都可以问，
// 只有问到门店信息时按标准口径回答（口径只是知识，不是限制）
const jjn_SYSTEM_PROMPT = [
  "你是\"中华美食街\"的智能客服小美，一个友好、有温度的通用 AI 助手。",
  "用户可以问任何问题：闲聊、写诗、讲笑话、解释知识、帮忙出主意……都正常回答，不要拒绝、不要说超出服务范围。",
  "如果用户问到本店信息，按以下口径回答：营业时间每天 10:00-22:00；招牌菜是北京烤鸭、四川麻婆豆腐、广东虾饺；",
  "配送范围为门店 5 公里以内，满 38 元免配送费。",
  "回答保持简短友好，一般不超过 150 字。",
].join("\n");

/**
 * 主要功能: 按平台名返回 OpenAI 兼容三件套配置（baseURL/model/apiKey），
 *          全部来自 backend/.env。换平台只需改 .env 三个值，代码不动。
 */
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

/**
 * 主要功能: POST /api/chat —— 在线客服对话接口。
 *          收 { messages: [...], provider?: 'siliconflow'|'qiniu' }，
 *          转发大模型并按统一格式 { code, msg, data } 返回回答。
 */
async function jjn_chat(req, res) {
  const jjn_messages = Array.isArray(req.body.jjn_messages)
    ? req.body.jjn_messages
    : Array.isArray(req.body.messages)
      ? req.body.messages
      : null;

  if (!jjn_messages || jjn_messages.length === 0) {
    return res.json({ code: 1, msg: "messages 不能为空", data: null });
  }

  // 平台选择：前端指定优先，否则用 .env 的 AI_PROVIDER（默认 siliconflow）
  const jjn_providers = jjn_provider_config();
  const jjn_key =
    req.body.provider && jjn_providers[req.body.provider]
      ? req.body.provider
      : (process.env.AI_PROVIDER || "siliconflow");
  const jjn_cfg = jjn_providers[jjn_key];

  if (!jjn_cfg.jjn_api_key) {
    return res.json({ code: 1, msg: `服务商 ${jjn_key} 未配置，请检查 backend/.env`, data: null });
  }

  try {
    // 多轮对话关键：system 人设放第一条，后面拼前端传来的完整历史 messages
    const jjn_payload = {
      model: jjn_cfg.jjn_model,
      temperature: 0.3, // 客服口径要稳，低发散
      max_tokens: 300,  // 太小会"话说到一半断掉"
      messages: [{ role: "system", content: jjn_SYSTEM_PROMPT }, ...jjn_messages],
    };
    // 课程要求：控制台输出发送给大模型的数据
    console.log("\n========== [客服] 发送给大模型的数据 ==========");
    console.log(JSON.stringify(jjn_payload, null, 2));

    const jjn_resp = await fetch(`${jjn_cfg.jjn_base_url}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jjn_cfg.jjn_api_key}`, // Key 只在后端出现
      },
      body: JSON.stringify(jjn_payload),
    });

    const jjn_data = await jjn_resp.json().catch(() => ({}));

    // 课程要求：控制台输出接收自大模型的数据
    console.log("========== [客服] 接收自大模型的数据 ==========");
    console.log(JSON.stringify(jjn_data, null, 2));

    // 友好报错而非白屏（验收清单最后一条：改错 Key 给出人话提示）
    if (!jjn_resp.ok) {
      const jjn_error_map = {
        401: "Key 无效或过期，请检查 backend/.env 里的 API Key",
        402: "余额不足：硅基流动请领\"认证奖励券\"，七牛请确认免费额度",
        404: "模型名或 baseURL 写错（注意末尾要有 /v1）",
        429: "请求太频繁触发限流，请稍等几秒再试",
      };
      console.error(`大模型平台返回 ${jjn_resp.status}:`, JSON.stringify(jjn_data).slice(0, 300));
      return res.json({
        code: 1,
        msg: jjn_error_map[jjn_resp.status] || `平台返回 ${jjn_resp.status}，请稍后重试`,
        data: null,
      });
    }

    const jjn_reply = jjn_data.choices?.[0]?.message?.content || "（模型没有返回内容）";
    console.log(`客服对话成功 [${jjn_key}/${jjn_cfg.jjn_model}]`);
    res.json({
      code: 0,
      msg: "回复成功",
      data: {
        jjn_reply: jjn_reply,
        jjn_provider: jjn_key,
        jjn_model: jjn_cfg.jjn_model,
      },
    });
  } catch (jjn_err) {
    console.error("客服对话失败：", jjn_err.message);
    res.json({ code: 1, msg: "无法连接大模型平台：" + jjn_err.message, data: null });
  }
}

module.exports = { jjn_chat };
