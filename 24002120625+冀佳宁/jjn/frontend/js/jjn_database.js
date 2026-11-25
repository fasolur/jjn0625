/*
  姓名：冀佳宁 | 学号：24002120625 |
  时间：2026-11-20 | 大模型：GLM
*/

(function () {
  var jjn_form = document.getElementById("jjn_connect_form");
  var jjn_btn = document.getElementById("jjn_submit_btn");
  var jjn_result = document.getElementById("jjn_result");
  var jjn_result_msg = document.getElementById("jjn_result_msg");
  var jjn_result_detail = document.getElementById("jjn_result_detail");

  function jjn_show_result(jjn_ok, jjn_msg, jjn_detail) {
    jjn_result.hidden = false;
    jjn_result.className = "jjn_result " + (jjn_ok ? "jjn_result_ok" : "jjn_result_fail");
    jjn_result_msg.textContent = jjn_msg;
    jjn_result_detail.textContent = jjn_detail || "";
  }

  jjn_form.addEventListener("submit", function (jjn_e) {
    jjn_e.preventDefault();

    var jjn_user = document.getElementById("jjn_user").value.trim();
    var jjn_password = document.getElementById("jjn_password").value;
    var jjn_host = document.getElementById("jjn_host").value.trim();

    if (!jjn_user) {
      jjn_show_result(false, "请输入用户名");
      return;
    }

    jjn_btn.disabled = true;
    jjn_btn.textContent = "连接中...";

    fetch("/api/database/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jjn_user: jjn_user,
        jjn_password: jjn_password,
        jjn_host: jjn_host || "localhost"
      })
    })
      .then(function (jjn_res) { return jjn_res.json(); })
      .then(function (jjn_data) {
        // 服务器返回的数据输出到控制台
        console.log("服务器返回：", jjn_data);
        if (jjn_data.code === 0) {
          jjn_show_result(true, jjn_data.msg,
            "主机：" + jjn_data.data.jjn_host +
            " ｜ 用户：" + jjn_data.data.jjn_user +
            " ｜ MySQL 版本：" + jjn_data.data.jjn_version);
        } else {
          jjn_show_result(false, "连接失败", jjn_data.msg);
        }
      })
      .catch(function (jjn_err) {
        // 错误信息输出到控制台
        console.error("请求出错：", jjn_err);
        jjn_show_result(false, "请求出错", jjn_err.message);
      })
      .finally(function () {
        jjn_btn.disabled = false;
        jjn_btn.textContent = "连 接";
      });
  });
})();
