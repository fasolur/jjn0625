/*
  姓名：冀佳宁 | 学号：24002120625 |
  时间：2026-11-20 | 大模型：GLM
*/

(function () {
  var canvas = document.getElementById("jjn_bg_canvas");
  var ctx = canvas.getContext("2d");

  var particles = [];
  var particleCount = 90;
  var linkDistance = 140;

  function jjn_resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function jjn_createParticles() {
    particles = [];
    for (var i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: Math.random() * 1.8 + 0.6
      });
    }
  }

  function jjn_draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx = -p.vx;
      if (p.y < 0 || p.y > canvas.height) p.vy = -p.vy;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(125, 211, 252, 0.75)";
      ctx.fill();

      for (var j = i + 1; j < particles.length; j++) {
        var q = particles[j];
        var dx = p.x - q.x;
        var dy = p.y - q.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < linkDistance) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = "rgba(125, 211, 252, " + (0.35 * (1 - dist / linkDistance)).toFixed(3) + ")";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(jjn_draw);
  }

  window.addEventListener("resize", function () {
    jjn_resize();
    jjn_createParticles();
  });

  jjn_resize();
  jjn_createParticles();
  jjn_draw();
})();
