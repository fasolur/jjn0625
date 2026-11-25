/**
 * 文件: frontend/js/jjn_ai.js
 * 姓名：冀佳宁 | 学号：24002120625 |
 * 时间：2026-11-25 | 大模型：GLM
 * 主要功能: 智能感知页逻辑 ——
 *          ①图像识别：选图预览 → POST /api/ai/image → 显示描述
 *          ②语音识别：MediaRecorder 录音（或上传音频文件）→ POST /api/ai/asr → 显示文字
 */

const jjn_img_inp = document.getElementById("jjn_img_inp");
const jjn_img_pick = document.getElementById("jjn_img_pick");
const jjn_img_go = document.getElementById("jjn_img_go");
const jjn_img_preview = document.getElementById("jjn_img_preview");
const jjn_img_result = document.getElementById("jjn_img_result");

const jjn_rec_btn = document.getElementById("jjn_rec_btn");
const jjn_rec_time = document.getElementById("jjn_rec_time");
const jjn_audio_player = document.getElementById("jjn_audio_player");
const jjn_asr_result = document.getElementById("jjn_asr_result");
const jjn_audio_file = document.getElementById("jjn_audio_file");
const jjn_audio_pick = document.getElementById("jjn_audio_pick");

/* ================= 图像识别 ================= */
jjn_img_pick.addEventListener("click", () => jjn_img_inp.click());
jjn_img_inp.addEventListener("change", () => {
  const jjn_file = jjn_img_inp.files[0];
  if (!jjn_file) return;
  // 本地预览
  const jjn_url = URL.createObjectURL(jjn_file);
  jjn_img_preview.innerHTML = `<img src="${jjn_url}" alt="预览">`;
  jjn_img_go.disabled = false;
  jjn_img_result.hidden = true;
});

/** 主要功能: 上传图片到 /api/ai/image 并展示识别描述 */
jjn_img_go.addEventListener("click", async () => {
  const jjn_file = jjn_img_inp.files[0];
  if (!jjn_file) return;
  jjn_img_go.disabled = true;
  jjn_img_result.hidden = false;
  jjn_img_result.className = "jjn_result";
  jjn_img_result.textContent = "识别中，请稍候…";
  try {
    const jjn_form = new FormData();
    jjn_form.append("jjn_image", jjn_file);
    const jjn_resp = await fetch("/api/ai/image", { method: "POST", body: jjn_form });
    const jjn_result = await jjn_resp.json();
    console.log("图像识别返回：", jjn_result);
    if (jjn_result.code === 0) {
      jjn_img_result.textContent = jjn_result.data.jjn_description;
      const jjn_meta = document.createElement("div");
      jjn_meta.className = "jjn_meta";
      jjn_meta.textContent = "模型：" + jjn_result.data.jjn_model;
      jjn_img_result.appendChild(jjn_meta);
    } else {
      jjn_img_result.className = "jjn_result bad";
      jjn_img_result.textContent = "❌ " + jjn_result.msg;
    }
  } catch (jjn_e) {
    jjn_img_result.className = "jjn_result bad";
    jjn_img_result.textContent = "❌ 网络异常：" + jjn_e.message;
  }
  jjn_img_go.disabled = false;
});

/* ================= 语音识别 ================= */
let jjn_media_recorder = null;
let jjn_chunks = [];
let jjn_timer = null;
let jjn_seconds = 0;

/** 主要功能: 开始/停止录音 —— MediaRecorder 采集麦克风，停止后自动送 ASR */
jjn_rec_btn.addEventListener("click", async () => {
  if (jjn_media_recorder && jjn_media_recorder.state === "recording") {
    jjn_media_recorder.stop(); // 触发 onstop 的上传逻辑
    return;
  }
  try {
    const jjn_stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    jjn_chunks = [];
    jjn_media_recorder = new MediaRecorder(jjn_stream);
    jjn_media_recorder.ondataavailable = (jjn_e) => jjn_chunks.push(jjn_e.data);
    jjn_media_recorder.onstop = async () => {
      clearInterval(jjn_timer);
      jjn_stream.getTracks().forEach((jjn_t) => jjn_t.stop());
      const jjn_blob = new Blob(jjn_chunks, { type: jjn_media_recorder.mimeType || "audio/webm" });
      jjn_audio_player.src = URL.createObjectURL(jjn_blob);
      jjn_audio_player.hidden = false;
      await jjn_send_asr(jjn_blob, "jjn_recording.webm");
      jjn_rec_btn.textContent = "🎙️ 开始录音";
      jjn_rec_btn.classList.remove("recording");
    };
    jjn_media_recorder.start();
    jjn_rec_btn.textContent = "⏹️ 停止录音";
    jjn_rec_btn.classList.add("recording");
    // 计时器
    jjn_seconds = 0;
    jjn_rec_time.textContent = "00:00";
    jjn_timer = setInterval(() => {
      jjn_seconds++;
      jjn_rec_time.textContent =
        String(Math.floor(jjn_seconds / 60)).padStart(2, "0") + ":" +
        String(jjn_seconds % 60).padStart(2, "0");
    }, 1000);
  } catch (jjn_e) {
    jjn_asr_result.hidden = false;
    jjn_asr_result.className = "jjn_result bad";
    jjn_asr_result.textContent = "❌ 无法访问麦克风：" + jjn_e.message + "（请检查浏览器权限，或改用「上传音频文件」）";
  }
});

/** 主要功能: 上传音频到 /api/ai/asr 并展示识别文字 */
async function jjn_send_asr(jj_file, jj_name) {
  jjn_asr_result.hidden = false;
  jjn_asr_result.className = "jjn_result";
  jjn_asr_result.textContent = "识别中，请稍候…";
  try {
    const jjn_form = new FormData();
    jjn_form.append("jjn_audio", jj_file, jj_name);
    const jjn_resp = await fetch("/api/ai/asr", { method: "POST", body: jjn_form });
    const jjn_result = await jjn_resp.json();
    console.log("语音识别返回：", jjn_result);
    if (jjn_result.code === 0) {
      jjn_asr_result.textContent = "📝 " + jjn_result.data.jjn_text;
      const jjn_meta = document.createElement("div");
      jjn_meta.className = "jjn_meta";
      jjn_meta.textContent = "服务：" + jjn_result.data.jjn_provider;
      jjn_asr_result.appendChild(jjn_meta);
    } else {
      jjn_asr_result.className = "jjn_result bad";
      jjn_asr_result.textContent = "❌ " + jjn_result.msg;
    }
  } catch (jjn_e) {
    jjn_asr_result.className = "jjn_result bad";
    jjn_asr_result.textContent = "❌ 网络异常：" + jjn_e.message;
  }
}

/** 主要功能: 上传本地音频文件识别（录音不可用时的备选） */
jjn_audio_pick.addEventListener("click", () => jjn_audio_file.click());
jjn_audio_file.addEventListener("change", () => {
  const jjn_file = jjn_audio_file.files[0];
  if (!jjn_file) return;
  jjn_audio_player.src = URL.createObjectURL(jjn_file);
  jjn_audio_player.hidden = false;
  jjn_send_asr(jjn_file, jjn_file.name);
  jjn_audio_file.value = "";
});
