/*
  姓名：冀佳宁 | 学号：24002120625 |
  时间：2026-11-20 | 大模型：GLM
*/

(function () {
  var jjn_list_el = document.getElementById("jjn_news_list");
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
      var jjn_n = jjn_items[i];
      jjn_html +=
        '<li class="jjn_news_item">' +
          '<div class="jjn_news_top">' +
            '<h2 class="jjn_news_title">' + jjn_n.jjn_title + "</h2>" +
            '<span class="jjn_news_tag">' + jjn_n.jjn_category + "</span>" +
          "</div>" +
          '<p class="jjn_news_summary">' + jjn_n.jjn_summary + "</p>" +
          '<div class="jjn_news_meta">' +
            "<span>来源：" + jjn_n.jjn_source + "</span>" +
            "<span>发布时间：" + jjn_format_time(jjn_n.jjn_publish_time) + "</span>" +
          "</div>" +
        "</li>";
    }
    jjn_list_el.innerHTML = jjn_html;
  }

  fetch("/api/news/list")
    .then(function (jjn_res) { return jjn_res.json(); })
    .then(function (jjn_data) {
      // 服务器返回的数据输出到控制台
      console.log("服务器返回：", jjn_data);
      if (jjn_data.code === 0 && jjn_data.data.jjn_list.length > 0) {
        jjn_render(jjn_data.data.jjn_list);
        jjn_total_el.textContent = "共 " + jjn_data.data.jjn_total + " 条新闻";
        jjn_tip_el.hidden = true;
      } else {
        jjn_tip_el.textContent = jjn_data.msg || "暂无数据";
      }
    })
    .catch(function (jjn_err) {
      // 错误信息输出到控制台
      console.error("请求出错：", jjn_err);
      jjn_tip_el.textContent = "数据加载失败：" + jjn_err.message;
      jjn_tip_el.className = "jjn_tip jjn_tip_fail";
    });
})();
