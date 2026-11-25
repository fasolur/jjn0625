/**
 * 文件: frontend/js/jjn_knowledge.js
 * 姓名：冀佳宁 | 学号：24002120625 |
 * 时间：2026-11-25 | 大模型：GLM
 * 主要功能: 知识库（RAG）页面前端逻辑 ——
 *          文件上传(FormData)、文件列表/删除、基于知识库的多轮问答与来源展示。
 */

const jjn_file_inp = document.getElementById("jjn_file_inp");
const jjn_upload_btn = document.getElementById("jjn_upload_btn");
const jjn_upload_status = document.getElementById("jjn_upload_status");
const jjn_file_tbody = document.getElementById("jjn_file_tbody");
const jjn_file_count = document.getElementById("jjn_file_count");
const jjn_qa_msgs = document.getElementById("jjn_qa_msgs");
const jjn_qa_inp = document.getElementById("jjn_qa_inp");
const jjn_qa_btn = document.getElementById("jjn_qa_send_btn");

let jjn_qa_history = []; // KB 问答的多轮历史 {role, content}

/** 主要功能: 追加一条问答气泡，返回 DOM 节点 */
function jjn_add_qa_bubble(jjn_role, jjn_text) {
  const jjn_div = document.createElement("div");
  jjn_div.className = "jjn_qa_msg " +
    (jjn_role === "user" ? "jjn_qa_msg_user" : "jjn_qa_msg_ai");
  jjn_div.textContent = jjn_text;
  jjn_qa_msgs.appendChild(jjn_div);
  jjn_qa_msgs.scrollTop = jjn_qa_msgs.scrollHeight;
  return jjn_div;
}

/** 主要功能: 加载知识库文件列表（文件名/大小/分块数/时间/删除按钮） */
async function jjn_load_files() {
  try {
    const jjn_resp = await fetch("/api/kb/list");
    const jjn_result = await jjn_resp.json();
    console.log("知识库列表：", jjn_result);
    jjn_file_tbody.innerHTML = "";
    const jjn_files = (jjn_result.data && jjn_result.data.jjn_files) || [];
    jjn_file_count.textContent = jjn_files.length;
    if (jjn_files.length === 0) {
      jjn_file_tbody.innerHTML =
        '<tr><td colspan="5" class="jjn_kb_empty">还没有文件，先上传一个吧（知识库为空时无法问答）</td></tr>';
      return;
    }
    jjn_files.forEach((jjn_f) => {
      const jjn_tr = document.createElement("tr");
      const jjn_size_kb = (jjn_f.jjn_size / 1024).toFixed(1);
      jjn_tr.innerHTML =
        `<td>${jjn_f.jjn_name}</td>` +
        `<td>${jjn_size_kb} KB</td>` +
        `<td>${jjn_f.jjn_chunk_count} 块</td>` +
        `<td>${jjn_f.jjn_upload_time}</td>` +
        `<td><button class="jjn_del_btn" data-jjn-id="${jjn_f.jjn_id}">删除</button></td>`;
      jjn_tr.querySelector(".jjn_del_btn").addEventListener("click", () =>
        jjn_delete_file(jjn_f.jjn_id));
      jjn_file_tbody.appendChild(jjn_tr);
    });
  } catch (jjn_e) {
    console.error("加载知识库列表失败：", jjn_e);
  }
}

/** 主要功能: 上传知识库文件 —— FormData 走 multipart，成功后刷新列表 */
jjn_upload_btn.addEventListener("click", () => jjn_file_inp.click());
jjn_file_inp.addEventListener("change", async () => {
  const jjn_file = jjn_file_inp.files[0];
  if (!jjn_file) return;
  jjn_upload_btn.disabled = true;
  jjn_upload_status.className = "";
  jjn_upload_status.textContent = "上传解析中…";
  try {
    const jjn_form = new FormData();
    jjn_form.append("jjn_file", jjn_file);
    const jjn_resp = await fetch("/api/kb/upload", { method: "POST", body: jjn_form });
    const jjn_result = await jjn_resp.json();
    console.log("上传结果：", jjn_result);
    if (jjn_result.code === 0) {
      jjn_upload_status.className = "ok";
      jjn_upload_status.textContent =
        `✅ ${jjn_result.data.jjn_name} 解析成功，分成 ${jjn_result.data.jjn_chunk_count} 块`;
      jjn_load_files();
    } else {
      jjn_upload_status.className = "bad";
      jjn_upload_status.textContent = "❌ " + jjn_result.msg;
    }
  } catch (jjn_e) {
    jjn_upload_status.className = "bad";
    jjn_upload_status.textContent = "❌ 网络异常：" + jjn_e.message;
  }
  jjn_upload_btn.disabled = false;
  jjn_file_inp.value = "";
});

/** 主要功能: 删除知识库文件及其全部分块 */
async function jjn_delete_file(jjn_id) {
  if (!confirm("确定删除这个知识库文件吗？")) return;
  try {
    const jjn_resp = await fetch("/api/kb/file/" + jjn_id, { method: "DELETE" });
    const jjn_result = await jjn_resp.json();
    console.log("删除结果：", jjn_result);
    jjn_load_files();
  } catch (jjn_e) {
    console.error("删除失败：", jjn_e);
  }
}

/** 主要功能: KB 问答 —— 多轮：带最近 3 轮历史；回答成功展示来源文件 */
async function jjn_ask(jjn_question) {
  jjn_question = jjn_question.trim();
  if (!jjn_question || jjn_qa_btn.disabled) return;

  jjn_add_qa_bubble("user", jjn_question);
  jjn_qa_btn.disabled = true;
  const jjn_thinking = jjn_add_qa_bubble("ai", "检索知识库并思考中…");
  jjn_thinking.classList.add("jjn_qa_msg_thinking");

  try {
    const jjn_resp = await fetch("/api/kb/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jjn_question, jjn_messages: jjn_qa_history }),
    });
    const jjn_result = await jjn_resp.json();
    console.log("KB问答返回：", jjn_result);

    jjn_thinking.remove();
    if (jjn_result.code === 0) {
      const jjn_div = jjn_add_qa_bubble("ai", jjn_result.data.jjn_answer);
      if (jjn_result.data.jjn_sources && jjn_result.data.jjn_sources.length) {
        const jjn_src = document.createElement("div");
        jjn_src.className = "jjn_qa_src";
        jjn_src.textContent = "出处：" + [...new Set(jjn_result.data.jjn_sources)].join("、");
        jjn_div.appendChild(jjn_src);
      }
      jjn_qa_history.push({ role: "user", content: jjn_question });
      jjn_qa_history.push({ role: "assistant", content: jjn_result.data.jjn_answer });
    } else {
      jjn_add_qa_bubble("ai", "⚠️ " + jjn_result.msg);
    }
  } catch (jjn_e) {
    jjn_thinking.remove();
    jjn_add_qa_bubble("ai", "⚠️ 网络异常：" + jjn_e.message);
  }
  jjn_qa_btn.disabled = false;
  jjn_qa_inp.focus();
}

jjn_qa_btn.addEventListener("click", () => jjn_ask(jjn_qa_inp.value));
jjn_qa_inp.addEventListener("keydown", (jjn_e) => {
  if (jjn_e.key === "Enter") jjn_ask(jjn_qa_inp.value);
});
document.querySelectorAll(".jjn_qa_quick button").forEach((jjn_b) =>
  jjn_b.addEventListener("click", () => jjn_ask(jjn_b.dataset.jjnQ)));

// 页面打开先加载文件列表
jjn_load_files();

/** 主要功能: URL 带 jjn_demo=1 时页面加载后自动向知识库提问（供测试报告自动截图） */
(() => {
  if (new URLSearchParams(location.search).get("jjn_demo") === "1") {
    setTimeout(() => jjn_ask("会员卡有什么优惠？"), 800);
  }
})();
