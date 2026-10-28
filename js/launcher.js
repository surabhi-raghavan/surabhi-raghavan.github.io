'use strict';
(function () {

  // ── Title card (HTML so fonts render crisp) ───────────────────────────────
  var titleEl = document.createElement('div');
  titleEl.id = 'launcher-title';
  titleEl.innerHTML =
    '<div class="lt-main">✦ SURABHI\'S WORLD ✦</div>' +
    '<div class="lt-sub">painting the scenery…</div>';
  document.body.insertBefore(titleEl, document.body.firstChild);

  // ── Brush cursor ──────────────────────────────────────────────────────────
  var brushEl = document.createElement('div');
  brushEl.id = 'launcher-brush';
  brushEl.textContent = '🖌';
  document.body.appendChild(brushEl);

  // ── Reveal canvas (sits on top, holes cut via destination-out) ────────────
  var cvs = document.createElement('canvas');
  cvs.id = 'launcher';
  document.body.insertBefore(cvs, document.body.firstChild);

  var ctx = cvs.getContext('2d');
  var W = cvs.width  = window.innerWidth;
  var H = cvs.height = window.innerHeight;

  // Dark starting "blank canvas"
  ctx.fillStyle = '#0e1a0c';
  ctx.fillRect(0, 0, W, H);

  // ── Generate brush strokes ────────────────────────────────────────────────
  var ROWS        = 22;
  var STROKE_DUR  = 260;  // ms each stroke takes
  var STROKE_GAP  = 100;  // ms between stroke starts
  var rowH        = H / ROWS;

  var strokes = [];
  for (var i = 0; i < ROWS; i++) {
    var fromRight = i % 2 === 1;
    var baseY = (i + 0.5) * rowH;
    var pts = [];
    var steps = Math.ceil(W / 3);
    for (var j = 0; j <= steps; j++) {
      var t = j / steps;
      var x = fromRight ? W - W * t : W * t;
      // Slight wobble for natural brush feel
      var dy = Math.sin(j * 0.38 + i) * 2.8 + Math.cos(j * 0.61 + i * 0.5) * 1.6;
      var dr = Math.sin(j * 0.27 + i * 0.4) * rowH * 0.04;
      pts.push({ x: x, y: baseY + dy, r: rowH * 0.54 + dr });
    }
    strokes.push({ pts: pts, startMs: i * STROKE_GAP, drawn: 0 });
  }

  var TOTAL_DUR = (ROWS - 1) * STROKE_GAP + STROKE_DUR;
  var startTs = null;

  // ── Animation loop ────────────────────────────────────────────────────────
  function frame(ts) {
    if (!startTs) startTs = ts;
    var elapsed = ts - startTs;

    ctx.globalCompositeOperation = 'destination-out';

    var brushX = null, brushY = null;

    for (var i = 0; i < strokes.length; i++) {
      var s = strokes[i];
      var se = elapsed - s.startMs;
      if (se <= 0) continue;

      var prog = Math.min(se / STROKE_DUR, 1);
      var upTo = Math.floor(prog * s.pts.length);

      // Draw only newly revealed points
      for (var j = s.drawn; j < upTo; j++) {
        ctx.beginPath();
        ctx.arc(s.pts[j].x, s.pts[j].y, s.pts[j].r, 0, Math.PI * 2);
        ctx.fill();
      }
      s.drawn = Math.max(s.drawn, upTo);

      // Track tip of the most-recently-active stroke for the brush cursor
      if (se > 0 && se < STROKE_DUR + 80) {
        var tip = s.pts[Math.min(upTo, s.pts.length - 1)];
        if (tip) { brushX = tip.x; brushY = tip.y; }
      }
    }

    // Move brush cursor to stroke tip
    if (brushX !== null) {
      brushEl.style.left = brushX + 'px';
      brushEl.style.top  = brushY + 'px';
      brushEl.style.opacity = '1';
    }

    if (elapsed < TOTAL_DUR) {
      requestAnimationFrame(frame);
    } else {
      // All strokes done — fade everything out
      brushEl.style.opacity = '0';
      cvs.style.transition = 'opacity 0.45s';
      cvs.style.opacity = '0';
      setTimeout(function () { cvs.remove(); titleEl.remove(); brushEl.remove(); }, 500);
    }
  }

  // Fade title out after brief pause
  setTimeout(function () {
    titleEl.classList.add('fade-out');
  }, 650);

  // Start painting once fonts are ready
  document.fonts.ready.then(function () {
    setTimeout(function () { requestAnimationFrame(frame); }, 850);
  });

})();
