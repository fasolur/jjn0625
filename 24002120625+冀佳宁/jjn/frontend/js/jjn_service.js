/**
 * 文件: frontend/js/jjn_service.js
 * 姓名：冀佳宁 | 学号：24002120625 |
 * 时间：2026-11-25 | 大模型：GLM
 * 主要功能: 在线客服前端逻辑 —— 多轮对话（messages 数组整包发送）、
 *          "正在思考…"提示、平台热切换下拉框。
 *          前端只请求自己的后端 /api/chat/send，Key 完全不进前端。
 */

// ===== 多轮对话核心：每轮把新消息 push 进数组，每次请求把全部历史一起发 =====
const jjn_messages = []; // 元素: { role: 'user'|'assistant', content: '...' }

const jjn_msgs_el = document.getElementById("jjn_msgs");
const jjn_inp_el = document.getElementById("jjn_inp");
const jjn_btn_el = document.getElementById("jjn_send_btn");
const jjn_sel_el = document.getElementById("jjn_provider_sel");
const jjn_status_el = document.getElementById("jjn_status");
let jjn_thinking_el = null; // "正在思考…"气泡引用

/**
 * 主要功能: 往消息区追加一个气泡并滚动到底部，返回该 DOM 节点
 */
function jjn_add_bubble(role, text) {
  const jjn_div = document.createElement("div");
  jjn_div.className = "jjn_msg " + (role === "user" ? "jjn_msg_user" : "jjn_msg_ai");
  jjn_div.textContent = text;
  jjn_msgs_el.appendChild(jjn_div);
  jjn_msgs_el.scrollTop = jjn_msgs_el.scrollHeight;
  return jjn_div;
}

/**
 * 主要功能: 发送一条消息 —— 先显示用户气泡与"正在思考…"，
 *          POST /api/chat/send 携带完整 messages 与所选 provider，
 *          拿到回答后追加气泡；出错时把后端 msg 显示成人话提示。
 */
async function jjn_send(text) {
  text = text.trim();
  if (!text || jjn_btn_el.disabled) return;

  jjn_messages.push({ role: "user", content: text });
  jjn_add_bubble("user", text);

  jjn_btn_el.disabled = true;
  jjn_thinking_el = jjn_add_bubble("ai", "正在思考…");
  jjn_thinking_el.classList.add("jjn_msg_thinking");

  try {
    const jjn_resp = await fetch("/api/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jjn_messages, provider: jjn_sel_el.value }),
    });
    const jjn_result = await jjn_resp.json();
    console.log("客服接口返回：", jjn_result);

    jjn_thinking_el.remove();
    jjn_thinking_el = null;

    if (jjn_result.code === 0) {
      // 多轮对话：AI 回复也要 push 进历史，下一轮一起发
      jjn_messages.push({ role: "assistant", content: jjn_result.data.jjn_reply });
      const jjn_provider_name = jjn_result.data.jjn_provider === "qiniu" ? "七牛" : "硅基流动";
      jjn_add_bubble("ai", jjn_result.data.jjn_reply + "\n—— " + jjn_provider_name + " · " + jjn_result.data.jjn_model);
    } else {
      // 友好报错：Key 错/欠费/限流都是后端给的一句人话，不白屏
      console.error("客服接口失败：", jjn_result.msg);
      jjn_add_bubble("ai", "⚠️ " + jjn_result.msg);
      // 失败的用户消息从历史里撤回，避免污染下一轮上下文
      jjn_messages.pop();
    }
  } catch (jjn_err) {
    console.error("请求异常：", jjn_err);
    if (jjn_thinking_el) jjn_thinking_el.remove();
    jjn_thinking_el = null;
    jjn_messages.pop();
    jjn_add_bubble("ai", "⚠️ 网络异常：" + jjn_err.message);
  }
  jjn_btn_el.disabled = false;
  jjn_inp_el.focus();
}

// 发送按钮 / 回车发送
jjn_btn_el.addEventListener("click", () => jjn_send(jjn_inp_el.value));
jjn_inp_el.addEventListener("keydown", (jjn_e) => {
  if (jjn_e.key === "Enter") jjn_send(jjn_inp_el.value);
});

// 快捷问题按钮
document.querySelectorAll(".jjn_quick button").forEach((jjn_b) =>
  jjn_b.addEventListener("click", () => jjn_send(jjn_b.dataset.jjnQ))
);

// 切换平台时更新顶部状态字（任务三：热切换演示用）
jjn_sel_el.addEventListener("change", () => {
  jjn_status_el.textContent =
    "服务中 · " + (jjn_sel_el.value === "qiniu" ? "七牛" : "硅基流动");
});

/** 主要功能: URL 带 jjn_demo=1 时页面加载后自动发送预设问题（供测试报告自动截图） */
(() => {
  if (new URLSearchParams(location.search).get("jjn_demo") === "1") {
    setTimeout(() => jjn_send("你们有什么招牌菜？再用一句话介绍下自己"), 500);
  }
})();
