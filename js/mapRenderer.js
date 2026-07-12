'use strict';
(function () {

  const LW = 400, LH = 225;
  let ctx;

  function r(x, y, w, h, c) {
    ctx.fillStyle = c;
    ctx.fillRect(x|0, y|0, w|0, h|0);
  }
  function ol(x, y, w, h) {
    var c = '#1a0e06';
    r(x, y, w, 1, c); r(x, y+h-1, w, 1, c);
    r(x, y, 1, h, c); r(x+w-1, y, 1, h, c);
  }

  var BUILDINGS = [
    { id:'home',      x:22,  y:28,  w:56, wallH:28, label:'About'      },
    { id:'guild',     x:166, y:24,  w:68, wallH:32, label:'Experience'  },
    { id:'shop',      x:314, y:28,  w:56, wallH:28, label:'Projects'    },
    { id:'library',   x:22,  y:140, w:56, wallH:30, label:'Education'   },
    { id:'training',  x:166, y:142, w:60, wallH:28, label:'Skills'      },
    { id:'community', x:314, y:138, w:64, wallH:32, label:'Volunteer'   },
  ];

  // ── GRASS ──────────────────────────────────────────────────────────────────
  function drawGrass() {
    // Base
    r(0, 0, LW, LH, '#4a7c2e');

    // Sunny bright patches
    [[55,12,22,14,'#62943a'],[140,8,18,12,'#5e9036'],[215,18,20,10,'#66963c'],
     [300,10,16,14,'#5e9036'],[360,20,18,12,'#62943a'],[80,130,20,14,'#62943a'],
     [200,145,18,10,'#5e9036'],[310,128,22,14,'#66963c'],[160,190,18,12,'#62943a'],
     [250,200,20,10,'#5e9036'],[380,180,16,14,'#62943a']
    ].forEach(function(v){r(v[0],v[1],v[2],v[3],v[4]);});

    // Shadow patches (under trees/buildings)
    [[10,20,18,12,'#3e6c22'],[375,18,18,12,'#3e6c22'],[10,188,18,12,'#3e6c22'],
     [375,188,18,12,'#3e6c22'],[125,42,16,10,'#3a6820'],[248,40,16,10,'#3a6820'],
     [125,148,16,10,'#3a6820'],[248,150,16,10,'#3a6820']
    ].forEach(function(v){r(v[0],v[1],v[2],v[3],v[4]);});

    // Dense tufts — 3 blades each
    var tufts = [
      [5,30],[18,45],[65,35],[95,22],[120,42],[155,28],[185,18],[235,38],[275,22],[310,45],[355,30],[375,18],
      [8,80],[40,90],[80,75],[115,88],[150,70],[175,82],[230,80],[270,90],[305,78],[345,85],[378,70],
      [5,120],[35,115],[70,125],[105,118],[148,120],[172,112],[240,118],[280,112],[315,122],[355,110],[388,120],
      [10,165],[42,175],[78,160],[115,170],[152,165],[178,158],[242,170],[278,162],[312,168],[360,165],[388,175],
      [15,200],[45,210],[82,205],[118,198],[155,210],[185,202],[245,205],[285,200],[322,208],[358,205],
    ];
    tufts.forEach(function(t){
      r(t[0],   t[1],   1, 3, '#3a6820');
      r(t[0]+2, t[1]+1, 1, 2, '#5aaa30');
      r(t[0]+4, t[1],   1, 3, '#4a8a28');
    });
  }

  // ── PATHS ─────────────────────────────────────────────────────────────────
  function drawPaths() {
    var B='#c09850', D='#a07e38', L='#d4ae68', E='#886828';

    // Path edge grass shadow
    r(0, 104, LW, 4, '#3e6820');
    r(0, 117, LW, 3, '#3e6820');

    // Main horizontal path
    r(0, 107, LW, 10, B);
    r(0, 107, LW, 1, E);
    r(0, 116, LW, 1, E);
    r(0, 108, LW, 1, L);  // highlight just inside top edge

    // Cobblestone pebbles on horizontal path
    var stoneColors = [L, B, D, '#b88840'];
    for (var x = 2; x < LW; x += 7) {
      var sc = stoneColors[(x/7|0) % stoneColors.length];
      r(x, 109, 5, 3, sc);
      r(x+1, 109, 5, 1, L);  // stone highlight
      r(x, 111, 5, 1, D);    // stone shadow
    }

    // Vertical paths
    var vTop = [[46,56,107],[196,56,107],[338,56,107]];
    var vBot = [[46,117,140],[196,117,142],[338,117,138]];
    vTop.concat(vBot).forEach(function(v){
      r(v[0]-5, v[1]+1, 11, v[2]-v[1], '#3e6820'); // shadow
      r(v[0]-4, v[1], 9, v[2]-v[1], B);
      r(v[0]-4, v[1], 1, v[2]-v[1], E);
      r(v[0]+4, v[1], 1, v[2]-v[1], E);
      r(v[0]-3, v[1], 1, v[2]-v[1], L);
      for (var y2=v[1]+2; y2<v[2]; y2+=6) { r(v[0]-3, y2, 7, 4, D); r(v[0]-3, y2, 7, 1, L); }
    });
  }

  // ── HELPERS ───────────────────────────────────────────────────────────────
  function drawWin(x, y, w, h) {
    r(x, y, w, h, '#a8d4e8');
    ol(x, y, w, h);
    r(x+(w/2|0), y+1, 1, h-2, '#1a0e06');
    r(x+1, y+(h/2|0), w-2, 1, '#1a0e06');
    r(x+1, y+1, 2, 2, '#d0eaf8');
  }

  function drawLabel(b) { /* labels rendered as HTML elements in game.js */ }

  // ── HOME (cottage) ────────────────────────────────────────────────────────
  function drawCottage(b) {
    var x=b.x, y=b.y, w=b.w, wallH=b.wallH, roofH=20, cx=x+w/2|0;
    b.roofH = roofH;

    // Chimney
    r(x+w-15, y-7, 5, 12, '#7a5a40'); ol(x+w-16, y-8, 7, 12);
    r(x+w-16, y-9, 7, 3, '#5a3a20');
    ctx.fillStyle='rgba(210,210,210,0.45)';
    ctx.beginPath(); ctx.arc(x+w-13, y-11, 2.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+w-11, y-15, 2, 0, Math.PI*2); ctx.fill();

    // Outline then fill pitched roof row by row
    ctx.fillStyle='#1a0e06';
    ctx.beginPath(); ctx.moveTo(cx,y-1); ctx.lineTo(x-1,y+roofH); ctx.lineTo(x+w+1,y+roofH); ctx.closePath(); ctx.fill();
    for (var i=1; i<roofH; i++) {
      var pw = Math.max(2, Math.round((w+2)*(i/roofH)));
      var shade = i<4 ? '#d44030' : i<12 ? '#c03020' : '#a82818';
      r(cx-pw/2, y+i, pw, 1, shade);
    }
    for (var i=3; i<roofH; i+=3) {
      var pw = Math.max(2, Math.round((w+2)*(i/roofH)));
      r(cx-pw/2+2, y+i, 2, 1, '#e85040');
    }

    // Walls
    r(x, y+roofH, w, wallH, '#eedcb0'); r(x, y+roofH, 1, wallH, '#c8b888');
    ol(x, y+roofH-1, w, wallH+1);

    // Windows
    drawWin(x+4, y+roofH+5, 10, 9);
    drawWin(x+w-14, y+roofH+5, 10, 9);

    // Flower boxes
    r(x+3, y+roofH+14, 12, 3, '#7a4820'); ol(x+3, y+roofH+14, 12, 3);
    r(x+w-15, y+roofH+14, 12, 3, '#7a4820'); ol(x+w-15, y+roofH+14, 12, 3);
    var fc=['#e84040','#e8e040','#e040e0','#40c040'];
    for (var i=0;i<4;i++){
      r(x+4+i*3, y+roofH+12, 2, 3, fc[i]);
      r(x+w-14+i*3, y+roofH+12, 2, 3, fc[(i+2)%4]);
    }

    // Arched door
    var dc=cx;
    r(dc-5, y+roofH+8, 10, wallH-8, '#7a4e2a');
    r(dc-4, y+roofH+6, 8, 3, '#7a4e2a'); r(dc-3, y+roofH+4, 6, 3, '#7a4e2a'); r(dc-2, y+roofH+3, 4, 2, '#7a4e2a');
    r(dc-4, y+roofH+8, 1, wallH-8, '#9a6a3a');  // highlight
    ol(dc-5, y+roofH+3, 10, wallH-3);
    r(dc+2, y+roofH+15, 2, 2, '#d4a843');

    drawLabel(b);
  }

  // ── GUILD HALL ────────────────────────────────────────────────────────────
  function drawHall(b) {
    var x=b.x, y=b.y, w=b.w, wallH=b.wallH, roofH=24, cx=x+w/2|0;
    b.roofH = roofH;

    // Peaked roof
    ctx.fillStyle='#1a0e06';
    ctx.beginPath(); ctx.moveTo(cx,y-2); ctx.lineTo(x-2,y+roofH); ctx.lineTo(x+w+2,y+roofH); ctx.closePath(); ctx.fill();
    for (var i=1; i<roofH; i++) {
      var pw = Math.max(2, Math.round((w+4)*(i/roofH)));
      r(cx-pw/2, y+i, pw, 1, i<5?'#4a5a8a':i<14?'#3a4a7a':'#2a3a6a');
    }
    for (var i=3; i<roofH; i+=4) { var pw=Math.round((w+4)*(i/roofH)); r(cx-pw/2+1,y+i,3,1,'#5a6a9a'); }
    r(cx-2, y-5, 5, 6, '#d4a843'); ol(cx-2, y-5, 5, 6);

    // Dark wood walls
    r(x, y+roofH, w, wallH, '#5c3e1e'); r(x, y+roofH, 1, wallH, '#3c2408');
    ctx.strokeStyle='#3c2408'; ctx.lineWidth=1;
    ctx.beginPath();
    ctx.moveTo(x, y+roofH); ctx.lineTo(x+w, y+roofH+wallH);
    ctx.moveTo(x+w, y+roofH); ctx.lineTo(x, y+roofH+wallH);
    ctx.stroke();
    r(x, y+roofH+(wallH/2|0), w, 1, '#3c2408');
    ol(x, y+roofH-1, w, wallH+1);

    // Tall arched windows
    var wins=[cx-22, cx+14];
    for (var wi=0; wi<wins.length; wi++) {
      var wx=wins[wi];
      r(wx, y+roofH+4, 8, 16, '#a8d4e8');
      r(wx+1, y+roofH+2, 6, 3, '#7a90c8'); r(wx+2, y+roofH+1, 4, 2, '#7a90c8');
      ol(wx, y+roofH+1, 8, 19);
      r(wx+3, y+roofH+3, 2, 16, '#1a0e06'); r(wx+1, y+roofH+5, 6, 1, '#1a0e06');
    }

    // Double doors
    r(cx-6, y+roofH+7, 6, wallH-7, '#3c2408');
    r(cx, y+roofH+7, 6, wallH-7, '#4c2e10');
    r(cx-6, y+roofH+5, 12, 3, '#2c1808'); ol(cx-6, y+roofH+5, 12, wallH-5);
    r(cx-1, y+roofH+7, 2, wallH-7, '#1a0e06');
    r(cx-4, y+roofH+16, 2, 3, '#d4a843'); r(cx+2, y+roofH+16, 2, 3, '#d4a843');

    // Lanterns
    var lanterns=[x+2, x+w-7];
    for (var li=0; li<lanterns.length; li++) {
      var lx=lanterns[li];
      r(lx, y+roofH+2, 5, 6, '#d4a843'); ol(lx, y+roofH+2, 5, 6);
      r(lx+1, y+roofH+3, 3, 4, '#f0d060');
    }

    // Red banner
    r(cx-3, y+2, 6, 14, '#c03030'); r(cx-3, y+2, 6, 1, '#1a0e06'); r(cx-3, y+15, 6, 1, '#1a0e06');
    r(cx-1, y+4, 2, 10, '#e05050');

    drawLabel(b);
  }

  // ── ITEM SHOP ─────────────────────────────────────────────────────────────
  function drawShop(b) {
    var x=b.x, y=b.y, w=b.w, wallH=b.wallH, roofH=7, cx=x+w/2|0;
    b.roofH = roofH;

    // Flat roof cornice
    r(x-3, y, w+6, roofH, '#e8c840'); r(x-3, y, w+6, 2, '#f8d860');
    for (var dx=x-1; dx<x+w+2; dx+=4) { r(dx, y+3, 2, 4, '#c4a820'); }
    r(x-3, y+roofH-1, w+6, 1, '#1a0e06');

    // Yellow walls
    r(x, y+roofH, w, wallH, '#f0e060'); r(x, y+roofH, 1, wallH, '#c8b820');
    ol(x, y+roofH-1, w, wallH+1);

    // Red awning
    r(x+2, y+roofH+1, w-4, 5, '#c03030');
    for (var dx=x+2; dx<x+w-5; dx+=6) { r(dx, y+roofH+5, 5, 3, '#c03030'); r(dx+5, y+roofH+5, 1, 3, '#e04040'); }
    r(x+2, y+roofH+1, w-4, 1, '#1a0e06'); r(x+2, y+roofH+8, w-4, 1, '#901010');

    // Display window
    r(cx-14, y+roofH+9, 28, 15, '#a8d4e8'); ol(cx-14, y+roofH+9, 28, 15);
    r(cx, y+roofH+10, 1, 13, '#1a0e06');
    r(cx-13, y+roofH+10, 3, 3, '#d0eaf8');
    r(cx-10, y+roofH+13, 5, 7, '#e04040');
    r(cx-3, y+roofH+11, 5, 9, '#40c040');
    r(cx+5, y+roofH+14, 5, 6, '#4060e0');

    // Door
    r(x+4, y+roofH+9, 8, wallH-9, '#7a4e2a');
    r(x+4, y+roofH+7, 8, 3, '#5a3010'); ol(x+4, y+roofH+7, 8, wallH-7);
    r(x+10, y+roofH+16, 2, 2, '#d4a843');

    // Hanging sign
    r(cx-1, y-4, 2, 5, '#6a3e10');
    r(cx-8, y-4, 16, 6, '#e8c870'); ol(cx-8, y-4, 16, 6);
    // "SHOP" text rendered via HTML overlay

    // Barrel
    r(x+w-9, y+roofH+wallH-11, 7, 10, '#7a4e2a');
    [0,3,7,9].forEach(function(dy){ r(x+w-9, y+roofH+wallH-11+dy, 7, 1, '#1a0e06'); });

    drawLabel(b);
  }

  // ── LIBRARY ───────────────────────────────────────────────────────────────
  function drawLibrary(b) {
    var x=b.x, y=b.y, w=b.w, wallH=b.wallH, roofH=10, cx=x+w/2|0;
    b.roofH = roofH;

    // Flat roof battlements
    r(x, y+4, w, roofH, '#8a8878'); r(x, y+4, w, 2, '#a0a090');
    for (var dx=x+2; dx<x+w-4; dx+=8) { r(dx, y, 5, 5, '#8a8878'); ol(dx, y, 5, 5); }
    r(x, y+roofH+3, w, 1, '#1a0e06');

    // Stone walls
    r(x, y+roofH+4, w, wallH, '#8a8878');
    for (var dy=0; dy<wallH; dy+=5) { r(x, y+roofH+4+dy, w, 1, '#6a6858'); }
    for (var dy=0; dy<wallH; dy+=10) { for (var dx=x+5; dx<x+w; dx+=11) { r(dx, y+roofH+4+dy, 1, 5, '#6a6858'); } }
    for (var dy=5; dy<wallH; dy+=10) { for (var dx=x+10; dx<x+w; dx+=11) { r(dx, y+roofH+4+dy, 1, 5, '#6a6858'); } }
    ol(x, y+roofH+3, w, wallH+1);

    // Columns
    var cols=[x+3, x+w-8];
    for (var ci=0; ci<cols.length; ci++) {
      var cx2=cols[ci];
      r(cx2, y+roofH+3, 5, wallH+1, '#e8e0d0'); ol(cx2, y+roofH+3, 5, wallH+1);
      r(cx2+2, y+roofH+4, 1, wallH-1, '#c0b8a8');
    }

    // Gothic arched windows
    var gwins=[cx-15, cx+8];
    for (var wi=0; wi<gwins.length; wi++) {
      var wx=gwins[wi];
      r(wx, y+roofH+7, 7, 18, '#a8d4e8');
      r(wx+1, y+roofH+5, 5, 3, '#a8d4e8'); r(wx+2, y+roofH+4, 3, 2, '#a8d4e8'); r(wx+3, y+roofH+3, 1, 2, '#a8d4e8');
      ol(wx, y+roofH+4, 7, 21);
      r(wx+3, y+roofH+5, 1, 19, '#1a0e06'); r(wx+1, y+roofH+10, 5, 1, '#1a0e06');
    }

    // Arched door + open book icon
    r(cx-5, y+roofH+12, 10, wallH-12, '#5a3e1e');
    r(cx-4, y+roofH+9, 8, 4, '#5a3e1e'); r(cx-3, y+roofH+7, 6, 3, '#5a3e1e'); r(cx-2, y+roofH+6, 4, 2, '#5a3e1e');
    ol(cx-5, y+roofH+6, 10, wallH-6);
    r(cx-4, y+roofH+8, 4, 3, '#e8e0d0'); r(cx, y+roofH+8, 4, 3, '#e8e0d0'); r(cx-1, y+roofH+7, 2, 5, '#5a3e1e');

    drawLabel(b);
  }

  // ── TRAINING GYM (dojo) ───────────────────────────────────────────────────
  function drawDojo(b) {
    var x=b.x, y=b.y, w=b.w, wallH=b.wallH, roofH=16, cx=x+w/2|0;
    b.roofH = roofH;

    // Hip trapezoid roof
    ctx.fillStyle='#1a0e06';
    ctx.beginPath(); ctx.moveTo(x,y+roofH); ctx.lineTo(x+5,y); ctx.lineTo(x+w-5,y); ctx.lineTo(x+w,y+roofH); ctx.closePath(); ctx.fill();
    r(x+6, y+1, w-12, roofH-2, '#c03020');
    r(x+6, y+1, w-12, 4, '#d84030');
    r(x+6, y+5, w-12, 6, '#b02818');
    r(x+6, y+1, w-12, 1, '#e85040');
    for (var i=0; i<6; i++) {
      var pw=Math.max(1,(i+1)*2);
      r(x+1+i, y+roofH-6+i, pw, 1, '#c03020');
      r(x+w-2-i-pw+1, y+roofH-6+i, pw, 1, '#c03020');
    }

    // Red walls
    r(x, y+roofH, w, wallH, '#c03020'); r(x, y+roofH, 1, wallH, '#8a2010');
    r(x, y+roofH, w, 2, '#d84030');
    ol(x, y+roofH-1, w, wallH+1);
    r(x+2, y+roofH+3, w-4, 2, '#e8e0d0'); r(x+2, y+roofH+wallH-5, w-4, 2, '#e8e0d0');

    // Double sliding doors
    r(cx-10, y+roofH+7, 10, wallH-7, '#4a2c0e');
    r(cx, y+roofH+7, 10, wallH-7, '#5a3a1a');
    ol(cx-10, y+roofH+6, 20, wallH-6);
    r(cx-1, y+roofH+7, 2, wallH-7, '#1a0e06');
    r(cx-10, y+roofH+7, 20, 1, '#1a0e06');
    r(cx-3, y+roofH+14, 2, 4, '#d4a843'); r(cx+1, y+roofH+14, 2, 4, '#d4a843');

    // Flag
    r(x+w-5, y-10, 2, 24, '#6a3e10');
    r(x+w-3, y-9, 10, 6, '#c03020'); ol(x+w-3, y-9, 10, 6);
    r(x+w-1, y-7, 6, 2, '#e05050');

    // Training dummy
    r(x-9, y+roofH+6, 5, 10, '#c8a060'); ol(x-9, y+roofH+6, 5, 10);
    r(x-11, y+roofH+4, 9, 5, '#c8a060'); ol(x-11, y+roofH+4, 9, 5);
    r(x-9, y+roofH+1, 5, 6, '#e8d0a0'); ol(x-9, y+roofH+1, 5, 6);
    r(x-8, y+roofH+3, 1, 1, '#1a0e06'); r(x-6, y+roofH+3, 1, 1, '#1a0e06');

    drawLabel(b);
  }

  // ── COMMUNITY CENTER (pavilion) ───────────────────────────────────────────
  function drawPavilion(b) {
    var x=b.x, y=b.y, w=b.w, wallH=b.wallH, roofH=22, cx=x+w/2|0;
    b.roofH = roofH;

    // Floor platform
    r(x-4, y+roofH+wallH, w+8, 5, '#c4a060'); r(x-4, y+roofH+wallH, w+8, 1, '#d4b070');
    ol(x-4, y+roofH+wallH, w+8, 5);

    // Pillars
    var pils=[x+2, x+16, cx-2, cx+2, x+w-20, x+w-6];
    for (var pi=0; pi<pils.length; pi++) {
      var px=pils[pi];
      r(px, y+roofH, 4, wallH, '#e8e8e8'); r(px+1, y+roofH, 1, wallH, '#c0c0c0');
      ol(px, y+roofH-1, 4, wallH+2);
    }

    // Lattice
    ctx.strokeStyle='rgba(180,180,180,0.4)'; ctx.lineWidth=0.5;
    for (var lx=x+7; lx<x+w-7; lx+=3) {
      ctx.beginPath(); ctx.moveTo(lx, y+roofH); ctx.lineTo(lx, y+roofH+wallH); ctx.stroke();
    }

    // Community board
    r(cx-10, y+roofH+4, 20, 14, '#eedcb0'); ol(cx-10, y+roofH+4, 20, 14);
    r(cx-8, y+roofH+6, 7, 4, '#e8e840'); r(cx-8, y+roofH+11, 7, 4, '#40e840');
    r(cx+1, y+roofH+6, 7, 4, '#e84040'); r(cx+1, y+roofH+11, 7, 4, '#40a0e8');

    // Pagoda roof bottom tier
    r(x-6, y+10, w+12, 6, '#4a8a30'); r(x-6, y+10, w+12, 2, '#6aaa40');
    r(x-10, y+14, w+20, 2, '#4a8a30');
    r(x-10, y+15, w+20, 1, '#1a0e06');
    r(x-12, y+13, 3, 2, '#6aaa40'); r(x+w+9, y+13, 3, 2, '#6aaa40');

    // Middle tier
    r(x+4, y+5, w-8, 6, '#5a9a38'); r(x+4, y+5, w-8, 2, '#7aba48');
    r(x, y+9, w, 1, '#1a0e06'); r(x+4, y+5, w-8, 1, '#1a0e06');
    r(x-2, y+9, w+4, 2, '#5a9a38'); r(x-2, y+11, w+4, 1, '#1a0e06');

    // Top tier
    r(x+12, y, w-24, 6, '#6aaa40'); r(x+12, y, w-24, 2, '#8aca58');
    r(x+12, y+5, w-24, 1, '#1a0e06');
    r(x+8, y+5, w-16, 1, '#1a0e06');

    // Roof outlines
    r(x-6, y+10, w+12, 1, '#1a0e06');

    // Gold finial
    r(cx-1, y-5, 3, 6, '#d4a843'); r(cx-2, y-3, 5, 3, '#d4a843'); ol(cx-2, y-5, 5, 8);

    drawLabel(b);
  }

  function drawBuilding(b) {
    var fns={home:drawCottage,guild:drawHall,shop:drawShop,library:drawLibrary,training:drawDojo,community:drawPavilion};
    (fns[b.id]||drawCottage)(b);
  }

  // ── TREES ─────────────────────────────────────────────────────────────────
  function drawTree(tx, ty) {
    // Ground shadow
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(tx+3, ty+17, 9, 4, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();

    // Trunk
    r(tx-1, ty+10, 3, 7, '#8b5e3c'); ol(tx-1, ty+10, 3, 7);
    // Canopy layers (bottom → top)
    var layers=[
      [tx-7,ty+9,15,6,'#2e6620'],
      [tx-8,ty+6,17,5,'#3a7828'],
      [tx-7,ty+3,15,5,'#4a8a30'],
      [tx-5,ty+1,11,4,'#5a9a38'],
      [tx-3,ty-1,7,3,'#6aaa40']
    ];
    for (var i=0; i<layers.length; i++) {
      r(layers[i][0],layers[i][1],layers[i][2],layers[i][3],layers[i][4]);
      ol(layers[i][0],layers[i][1],layers[i][2],layers[i][3]);
    }
    // Highlight
    r(tx-1, ty, 3, 3, '#8aca58');
    // Small dark undershadow on bottom of canopy
    r(tx-7, ty+13, 15, 2, '#2e6620');
  }

  function drawTrees() {
    var pts=[[8,62],[8,82],[8,118],[8,136],[388,62],[388,85],[388,118],[388,138],
     [14,14],[78,8],[318,8],[378,14],[12,192],[72,202],[322,202],[378,192],
     [132,48],[254,44],[132,152],[254,156]];
    for (var i=0; i<pts.length; i++) { drawTree(pts[i][0], pts[i][1]); }
  }

  // ── FLOWERS ───────────────────────────────────────────────────────────────
  function drawFlowers() {
    var fl=[
      [98,28,'#e84040'],[104,31,'#e8e040'],[110,27,'#e040e0'],[116,30,'#40c0e8'],
      [268,33,'#40c0e8'],[274,30,'#e84040'],[280,34,'#e8e040'],[286,28,'#e040e0'],
      [98,168,'#e040e0'],[104,172,'#e84040'],[110,167,'#e8e040'],[116,171,'#40c0e8'],
      [266,170,'#40c0e8'],[272,167,'#e84040'],[278,173,'#e040e0'],[284,168,'#e8e040'],
      [48,101,'#e8e040'],[55,104,'#40c0e8'],[340,101,'#e84040'],[347,104,'#e8e040'],
      [28,196,'#e040e0'],[34,194,'#e84040'],[40,198,'#40c0e8'],
      [354,196,'#40c0e8'],[362,199,'#e8e040'],[368,195,'#e84040'],
      [156,8,'#e84040'],[162,11,'#e8e040'],[230,10,'#e040e0'],[236,7,'#40c0e8'],
      [156,200,'#40c0e8'],[162,203,'#e84040'],[230,202,'#e8e040'],[236,198,'#e040e0'],
    ];
    for (var i=0; i<fl.length; i++) {
      r(fl[i][0], fl[i][1]+2, 1, 3, '#4a7c2e');
      r(fl[i][0]-1, fl[i][1], 3, 2, fl[i][2]);
      r(fl[i][0], fl[i][1]-1, 1, 2, fl[i][2]);
      r(fl[i][0], fl[i][1], 1, 1, '#f8f040');
    }
  }

  // ── ROCKS ─────────────────────────────────────────────────────────────────
  function drawRocks() {
    var rocks=[
      [144,60,4,3],[148,62,2,2],
      [246,58,4,3],[251,59,2,2],
      [144,160,4,3],[148,162,2,2],
      [246,160,4,3],[251,162,2,2],
      [60,110,3,2],[62,112,2,1],
      [332,110,3,2],[334,112,2,1],
      [185,198,3,2],[188,199,2,1],
      [194,197,4,3],
    ];
    rocks.forEach(function(ro, i) {
      var light = (i%2===0) ? '#a0a090' : '#b0b0a0';
      var dark  = '#6a6858';
      r(ro[0], ro[1], ro[2], ro[3], light);
      r(ro[0], ro[1]+ro[3]-1, ro[2], 1, dark);
      r(ro[0]+1, ro[1], 1, 1, '#d0d0c0');
    });
  }

  // ── MUSHROOMS ─────────────────────────────────────────────────────────────
  function drawMushrooms() {
    var mushrooms=[
      [38,42],[142,46],[258,42],[358,44],
      [38,158],[142,150],[258,154],[358,158],
      [58,196],[338,196],
    ];
    mushrooms.forEach(function(m) {
      var mx=m[0], my=m[1];
      r(mx+1, my+3, 1, 2, '#d0c0a0');   // stem
      r(mx, my, 3, 4, '#e04030');        // cap
      r(mx, my, 3, 1, '#c02020');        // cap shadow top
      r(mx+1, my+1, 1, 1, '#f0f0f0');   // white dot
    });
  }

  // ── POND ─────────────────────────────────────────────────────────────────
  function drawPond() {
    // Positioned between Skills (right edge x=226) and Volunteer (left x=314), below y=188
    var px=250, py=190, pw=38, ph=22;

    // Muddy shore ring
    r(px-3, py-2, pw+6, ph+4, '#5a7840');
    r(px-2, py-1, pw+4, ph+2, '#4a6e38');

    // Water body
    r(px, py, pw, ph, '#3a70a8');
    r(px+2, py+2, pw-4, ph-8, '#4a80b8');
    r(px+4, py+4, pw-12, ph-12, '#5a90c8');
    // Surface highlight
    r(px, py, pw, 2, '#6ab0d8');
    r(px+3, py+4, 10, 1, 'rgba(255,255,255,0.4)');
    r(px+22, py+9, 8, 1, 'rgba(255,255,255,0.3)');
    r(px+8, py+16, 6, 1, 'rgba(255,255,255,0.2)');

    // Water outline
    ol(px, py, pw, ph);

    // Lily pads
    r(px+4, py+12, 7, 4, '#3a7828'); ol(px+4, py+12, 7, 4);
    r(px+5, py+11, 5, 1, '#4a8a30');
    r(px+22, py+5, 6, 4, '#4a8a30'); ol(px+22, py+5, 6, 4);
    // Lily flowers
    r(px+6, py+10, 3, 1, '#e84080');
    r(px+24, py+4, 2, 1, '#f0e040');

    // Reeds on shore
    r(px-1, py+4, 1, 6, '#5a8a28');
    r(px+pw+1, py+8, 1, 5, '#4a7820');
    r(px+pw, py+6, 1, 1, '#8aaa30');
  }

  // ── BUILDING SHADOWS ─────────────────────────────────────────────────────
  function drawBuildingShadow(b) {
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    var cx = b.x + b.w/2;
    var cy = b.y + (b.wallH||28) + 18;
    ctx.ellipse(cx+4, cy, b.w/2 + 4, 6, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  // ── VIGNETTE + LIGHTING ──────────────────────────────────────────────────
  function drawVignette() {
    // Warm sunlight from top-left
    var sun = ctx.createRadialGradient(LW*0.35, 0, 0, LW*0.35, 0, LW*0.85);
    sun.addColorStop(0, 'rgba(255,230,160,0.08)');
    sun.addColorStop(0.5, 'rgba(255,220,120,0.04)');
    sun.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sun; ctx.fillRect(0, 0, LW, LH);

    // Corner/edge darkening vignette
    var g = ctx.createRadialGradient(LW/2, LH/2, LW*0.18, LW/2, LH/2, LW*0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.7, 'rgba(0,0,0,0.08)');
    g.addColorStop(1, 'rgba(0,0,0,0.42)');
    ctx.fillStyle=g; ctx.fillRect(0, 0, LW, LH);

    // Bottom edge ground shadow (makes map feel grounded)
    var bot = ctx.createLinearGradient(0, LH-30, 0, LH);
    bot.addColorStop(0, 'rgba(0,0,0,0)');
    bot.addColorStop(1, 'rgba(0,0,0,0.25)');
    ctx.fillStyle=bot; ctx.fillRect(0, LH-30, LW, 30);
  }

  // ── PUBLIC API ────────────────────────────────────────────────────────────
  function init(canvas) {
    canvas.width  = LW;
    canvas.height = LH;
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
  }

  function render() {
    ctx.clearRect(0, 0, LW, LH);
    drawGrass();
    drawPaths();
    drawRocks();
    drawPond();
    drawMushrooms();
    // Tree shadows first, then trees
    var treePts=[[8,62],[8,82],[8,118],[8,136],[388,62],[388,85],[388,118],[388,138],
     [14,14],[78,8],[318,8],[378,14],[12,192],[72,202],[322,202],[378,192],
     [132,48],[254,44],[132,152],[254,156]];
    drawTrees();
    drawFlowers();
    // Building shadows before buildings
    BUILDINGS.forEach(drawBuildingShadow);
    BUILDINGS.forEach(drawBuilding);
    drawVignette();
  }

  function getBuildings() { return BUILDINGS; }

  window.MAP = { init: init, render: render, getBuildings: getBuildings };

})();
