/*
  姓名：冀佳宁 | 学号：24002120625 |
  时间：2026-11-20 | 大模型：GLM
*/

(function () {
  var jjn_list_el = document.getElementById("jjn_gallery_list");
  var jjn_total_el = document.getElementById("jjn_total");
  var jjn_tip_el = document.getElementById("jjn_tip");

  function jjn_format_time(jjn_str) {
    var jjn_d = new Date(jjn_str);
    var jjn_pad = function (jjn_n) { return jjn_n < 10 ? "0" + jjn_n : "" + jjn_n; };
    return jjn_d.getFullYear() + "-" + jjn_pad(jjn_d.getMonth() + 1) + "-" +
      jjn_pad(jjn_d.getDate()) + " " + jjn_pad(jjn_d.getHours()) + ":" + jjn_pad(jjn_d.getMinutes());
  }

  function jjn_render(jjn_items) {
    var jjn_html = "";
    for (var i = 0; i < jjn_items.length; i++) {
      var jjn_g = jjn_items[i];
      jjn_html +=
        '<li class="jjn_gallery_item">' +
          '<div class="jjn_gallery_media">' +
            '<img class="jjn_gallery_img" src="' + jjn_g.jjn_image_url + '" alt="' + jjn_g.jjn_title + '" loading="lazy" />' +
            '<span class="jjn_gallery_tag">' + jjn_g.jjn_category + "</span>" +
          "</div>" +
          '<h2 class="jjn_gallery_title">' + jjn_g.jjn_title + "</h2>" +
          '<p class="jjn_gallery_desc">' + jjn_g.jjn_desc + "</p>" +
          '<div class="jjn_gallery_meta">' +
            "<span>作者：" + jjn_g.jjn_author + "</span>" +
            "<span>" + jjn_format_time(jjn_g.jjn_create_time) + "</span>" +
          "</div>" +
        "</li>";
    }
    jjn_list_el.innerHTML = jjn_html;
  }

  // 直接以 file:// 双击打开时，接口请求无法到达后端，给出明确提示
  if (window.location.protocol === "file:") {
    jjn_tip_el.textContent = "检测到直接打开本地文件：请先运行 jjn_start_backend.bat 启动后端，再用浏览器访问 http://localhost:8625/gallery.html";
    jjn_tip_el.className = "jjn_tip jjn_tip_fail";
    jjn_total_el.textContent = "--";
    console.error("当前通过 file:// 协议打开页面，无法请求后端接口。请访问 http://localhost:8625/gallery.html");
    return;
  }

  fetch("/api/gallery/list")
    .then(function (jjn_res) { return jjn_res.json(); })
    .then(function (jjn_data) {
      // 服务器返回的数据输出到控制台
      console.log("服务器返回：", jjn_data);
      if (jjn_data.code === 0 && jjn_data.data.jjn_list.length > 0) {
        jjn_render(jjn_data.data.jjn_list);
        jjn_total_el.textContent = "共 " + jjn_data.data.jjn_total + " 条图文";
        jjn_tip_el.hidden = true;
      } else {
        jjn_total_el.textContent = "--";
        jjn_tip_el.textContent = jjn_data.msg || "暂无数据";
      }
    })
    .catch(function (jjn_err) {
      // 错误信息输出到控制台
      console.error("请求出错：", jjn_err);
      jjn_total_el.textContent = "--";
      jjn_tip_el.textContent = "数据加载失败：" + jjn_err.message + "（请确认已启动后端并访问 http://localhost:8625/gallery.html）";
      jjn_tip_el.className = "jjn_tip jjn_tip_fail";
    });
})();
