'use strict';
(function () {

  var LW = 400, LH = 225;
  var player = { x: LW/2 - 4 - 80, y: LH/2 - 7, speed: 0.85, facing: 'down', moving: false };
  var keys   = {};
  var currentBuilding = null;
  var toastTimer = null;
  var frame = 0;

  // ── DOG ───────────────────────────────────────────────────────────────────
  var dog = {
    x: 60, y: LH/2 - 4,
    dx: 0.6, dy: 0.3,
    facing: 'right',
    wanderTimer: 0,
    sitting: false,
    sitTimer: 0,
  };

  function wanderDog() {
    var targetX = player.x + 4;
    var targetY = player.y + 8;
    var ddx = targetX - dog.x;
    var ddy = targetY - dog.y;
    var dist = Math.sqrt(ddx * ddx + ddy * ddy);

    if (dist > 12) {
      // Follow player
      dog.sitting = false;
      var spd = Math.min(dist * 0.08, 1.2);
      dog.x += (ddx / dist) * spd;
      dog.y += (ddy / dist) * spd;
      dog.facing = ddx >= 0 ? 'right' : 'left';
    } else {
      // Close enough — sit and wait
      dog.sitting = true;
    }

    dog.x = Math.max(2, Math.min(LW - 12, dog.x));
    dog.y = Math.max(2, Math.min(LH - 12, dog.y));
  }

  function drawDog() {
    var px = Math.round(dog.x);
    var py = Math.round(dog.y);
    var f  = Math.floor(frame / 5) % 2;  // leg animation frame
    var flip = dog.facing === 'left';

    function dp(x, y, w, h, c) {
      pCtx.fillStyle = c;
      // Flip horizontally around dog center if facing left
      var rx = flip ? (px + 8 - x - w) : px + x;
      pCtx.fillRect(rx, py + y, w, h);
    }

    // Shadow
    pCtx.save();
    pCtx.globalAlpha = 0.2;
    pCtx.fillStyle = '#000';
    pCtx.beginPath();
    pCtx.ellipse(px + 4, py + 9, 5, 2, 0, 0, Math.PI * 2);
    pCtx.fill();
    pCtx.restore();

    // Tail (wagging)
    var tailWag = Math.sin(frame * 0.3) * 2;
    dp(flip ? 0 : 7, -2 + tailWag, 2, 2, '#2a2a2a');
    dp(flip ? 0 : 8, -4 + tailWag, 1, 2, '#2a2a2a');

    // Body
    dp(1, 2, 7, 4, '#1e1e1e');
    dp(1, 2, 7, 1, '#3a3a3a');  // highlight top

    // Legs
    if (!dog.sitting) {
      dp(1, 6, 2, f===0?3:2, '#111111');
      dp(5, 6, 2, f===0?2:3, '#111111');
    } else {
      dp(1, 5, 2, 3, '#111111');
      dp(5, 5, 2, 3, '#111111');
    }

    // Head
    dp(0, -1, 4, 4, '#1e1e1e');
    dp(0, -1, 4, 1, '#3a3a3a');  // highlight

    // Snout
    dp(0, 1, 2, 2, '#3a3a3a');
    // Nose
    dp(0, 1, 1, 1, '#000000');
    // Eye (bright so visible on black)
    dp(2, -1, 1, 1, '#ffffff');
    // Ear (floppy)
    var earDroop = Math.abs(Math.sin(frame * 0.08)) * 1;
    dp(-1, -2 + earDroop, 2, 3, '#111111');

    // Dog name tag — HTML element
    var dogTagEl = document.getElementById('dog-name-tag');
    if (dogTagEl) {
      var drect = playerCanvas.getBoundingClientRect();
      var dsx = (dog.x + 4) / LW * drect.width  + drect.left;
      var dsy = (dog.y - 8) / LH * drect.height + drect.top;
      dogTagEl.style.left = dsx + 'px';
      dogTagEl.style.top  = dsy + 'px';
    }
  }

  var mapCanvas      = document.getElementById('game-canvas');
  var playerCanvas   = document.getElementById('player-canvas');
  var pCtx           = playerCanvas.getContext('2d');
  var promptEl       = document.getElementById('prompt');
  var fadeEl         = document.getElementById('fade');
  var toastEl        = document.getElementById('location-toast');
  var labelsEl       = document.getElementById('labels-container');
  var nameTagEl      = document.getElementById('player-name-tag');

  // ── init ──────────────────────────────────────────────────────────────────
  function init() {
    playerCanvas.width  = LW;
    playerCanvas.height = LH;
    pCtx.imageSmoothingEnabled = false;
  }

  // ── pixel-art player sprite (tiny, scales up via CSS pixelated) ───────────
  function drawPlayer() {
    pCtx.clearRect(0, 0, LW, LH);

    var px = Math.round(player.x) + 4;
    var py = Math.round(player.y);
    var f  = Math.floor(frame / 6) % 4;
    var w  = player.moving;

    function p(x, y, ww, hh, c) { pCtx.fillStyle=c; pCtx.fillRect(x|0, y|0, ww|0, hh|0); }

    // Shadow
    pCtx.save();
    pCtx.globalAlpha = 0.3;
    pCtx.fillStyle = '#000';
    pCtx.beginPath();
    pCtx.ellipse(px, py+14, 5, 2, 0, 0, Math.PI*2);
    pCtx.fill();
    pCtx.restore();

    // Legs
    var lShift = w ? (f<2?1:-1) : 0;
    p(px-3, py+8, 3, 5+Math.abs(lShift), '#3a2860');
    p(px,   py+8, 3, 5-Math.abs(lShift), '#3a2860');
    p(px-4, py+13, 4, 2, '#1c1008');
    p(px,   py+13, 4, 2, '#1c1008');

    // Body / tunic
    p(px-4, py+3, 8, 6, '#c06080');
    p(px-1, py+3, 3, 2, '#e090a8');  // collar
    p(px-4, py+8, 8, 1, '#7a4820');  // belt
    p(px-6, py+4, 3, 4, '#c06080');  // left sleeve
    p(px+3, py+4, 3, 4, '#c06080');  // right sleeve
    p(px-6, py+7, 3, 2, '#e8c090');  // left forearm
    p(px+3, py+7, 3, 2, '#e8c090');  // right forearm

    // Neck
    p(px-1, py+1, 3, 3, '#e8c090');

    // Head
    pCtx.fillStyle = '#e8c090';
    pCtx.beginPath(); pCtx.ellipse(px, py-3, 5, 5, 0, 0, Math.PI*2); pCtx.fill();

    // Dark hair
    pCtx.fillStyle = '#1c0e06';
    pCtx.beginPath(); pCtx.arc(px, py-5, 5, Math.PI, 0); pCtx.fill();
    p(px-5, py-7, 3, 8, '#1c0e06');
    p(px+2, py-7, 3, 7, '#1c0e06');
    p(px-4, py-2, 2, 5, '#1c0e06');
    p(px+2, py-2, 2, 5, '#1c0e06');
    p(px-1, py-9, 3, 2, '#3a1a0a');  // highlight

    // Face
    pCtx.fillStyle = '#1a0e06';
    pCtx.fillRect(px-2, py-4, 1, 1);
    pCtx.fillRect(px+1, py-4, 1, 1);
    pCtx.fillStyle = '#c06060';
    pCtx.fillRect(px-1, py-1, 2, 1);

    // Name tag is an HTML element — update its position
    var rect = playerCanvas.getBoundingClientRect();
    var sx = (player.x + 4) / LW * rect.width  + rect.left;
    var sy = (player.y - 18) / LH * rect.height + rect.top;
    nameTagEl.style.left = sx + 'px';
    nameTagEl.style.top  = sy + 'px';
  }

  // ── navigation ────────────────────────────────────────────────────────────
  function enterBuilding(b) {
    showToast('Entering ' + b.label + '...');
    fadeEl.classList.add('visible');
    setTimeout(function(){ window.location.href = b.page; }, 420);
  }

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toastEl.classList.remove('show'); }, 2000);
  }

  // ── game loop ─────────────────────────────────────────────────────────────
  function gameLoop() {
    var dx=0, dy=0;
    if (keys['ArrowLeft']  || keys['a'] || keys['A']) { dx=-player.speed; player.facing='left';  }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) { dx= player.speed; player.facing='right'; }
    if (keys['ArrowUp']    || keys['w'] || keys['W']) { dy=-player.speed; player.facing='up';    }
    if (keys['ArrowDown']  || keys['s'] || keys['S']) { dy= player.speed; player.facing='down';  }
    if (dx!==0 && dy!==0) { dx*=0.707; dy*=0.707; }
    player.moving = dx!==0 || dy!==0;

    player.x = Math.max(0, Math.min(LW-8, player.x+dx));
    player.y = Math.max(0, Math.min(LH-14, player.y+dy));

    frame++;  // always advance for dog + player animation

    // Footstep sounds — every 10 frames while moving
    if (player.moving && frame % 10 === 0 && window.SFX) window.SFX.step();

    wanderDog();
    drawPlayer();
    drawDog();

    // Dog bark — random chance each frame, with cooldown
    if (window.SFX) window.SFX.tryBark();

    // proximity check (threshold in logical pixels)
    var pcx=player.x+4, pcy=player.y+7;
    var nearest=null, nearDist=Infinity;
    var buildings=MAP.getBuildings();
    for (var i=0; i<buildings.length; i++) {
      var bld=buildings[i];
      var bcx=bld.x+bld.w/2;
      var bcy=bld.y+(bld.wallH+(bld.roofH||16))/2;
      var dist=Math.hypot(pcx-bcx, pcy-bcy);
      if (dist<36 && dist<nearDist) { nearDist=dist; nearest=bld; }
    }
    if (nearest!==currentBuilding) {
      currentBuilding=nearest;
      if (nearest) {
        promptEl.innerHTML='<span class="key-hint">E</span> Enter '+nearest.label;
        promptEl.style.display='block';
        showToast(nearest.label);
      } else {
        promptEl.style.display='none';
      }
    }

    requestAnimationFrame(gameLoop);
  }

  var PAGES={home:'about.html',guild:'experience.html',shop:'projects.html',library:'education.html',training:'skills.html',community:'volunteer.html'};

  document.addEventListener('keydown', function(e){
    keys[e.key]=true;
    if ((e.key==='e'||e.key==='E'||e.key==='Enter') && currentBuilding) {
      enterBuilding(Object.assign({},currentBuilding,{page:PAGES[currentBuilding.id]}));
    }
    if (e.key==='m'||e.key==='M') { if (window.MUSIC) window.MUSIC.toggle(); }
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].indexOf(e.key)!==-1) e.preventDefault();
  });
  document.addEventListener('keyup', function(e){ delete keys[e.key]; });

  mapCanvas.addEventListener('click', function(e){
    var rect=e.target.getBoundingClientRect();
    // Convert screen coords to logical coords
    var scaleX=LW/rect.width, scaleY=LH/rect.height;
    var mx=(e.clientX-rect.left)*scaleX, my=(e.clientY-rect.top)*scaleY;
    var buildings=MAP.getBuildings();
    for (var i=0; i<buildings.length; i++) {
      var bld=buildings[i];
      if (mx>=bld.x-5 && mx<=bld.x+bld.w+5 && my>=bld.y-10 && my<=bld.y+(bld.totalH||80)) {
        enterBuilding(Object.assign({},bld,{page:PAGES[bld.id]}));
        return;
      }
    }
  });

  ['up','down','left','right'].forEach(function(d){
    var btn=document.getElementById('dpad-'+d);
    if (!btn) return;
    var k={up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight'}[d];
    btn.addEventListener('pointerdown',  function(){ keys[k]=true; });
    btn.addEventListener('pointerup',    function(){ delete keys[k]; });
    btn.addEventListener('pointerleave', function(){ delete keys[k]; });
  });
  var enterBtn=document.getElementById('dpad-enter');
  if (enterBtn) enterBtn.addEventListener('click', function(){
    if (currentBuilding) enterBuilding(Object.assign({},currentBuilding,{page:PAGES[currentBuilding.id]}));
  });

  function createBldLabels() {
    var rect = mapCanvas.getBoundingClientRect();
    MAP.getBuildings().forEach(function(b) {
      var el = document.createElement('div');
      el.className = 'bld-label';
      el.textContent = b.label;
      var pct_x = (b.x + b.w/2) / LW * 100;
      var pct_y = (b.y + (b.roofH||0) + b.wallH + 5) / LH * 100;
      el.style.left = pct_x + '%';
      el.style.top  = pct_y + '%';
      labelsEl.appendChild(el);
    });
  }

  window.addEventListener('load', function(){
    document.fonts.ready.then(function(){
      MAP.init(mapCanvas);
      MAP.render();
      init();
      createBldLabels();
      drawPlayer();
      fadeEl.classList.remove('visible');
      requestAnimationFrame(gameLoop);
    });
  });

  // When navigating back from a subpage, clear the black fade
  window.addEventListener('pageshow', function(e) {
    if (e.persisted) fadeEl.classList.remove('visible');
  });

})();
