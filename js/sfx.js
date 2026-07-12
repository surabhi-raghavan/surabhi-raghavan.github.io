'use strict';
(function () {
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) { window.SFX = { step: function(){}, bark: function(){} }; return; }

  var actx = null;
  var stepAlt = 0;
  var barkCooldown = 0;

  function ctx() {
    if (!actx) actx = new AC();
    return actx;
  }

  // Resume context once music.js has already unlocked audio
  function ready() {
    var c = ctx();
    if (c.state === 'suspended') c.resume();
    return c.state === 'running';
  }

  // ── Footstep: soft filtered noise thump ─────────────────────────────────
  function step() {
    if (!ready()) return;
    var c = ctx();
    var dur = 0.055;
    var len = Math.floor(c.sampleRate * dur);
    var buf = c.createBuffer(1, len, c.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.8);
    }
    var src = c.createBufferSource();
    src.buffer = buf;

    var filt = c.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = stepAlt ? 210 : 175;  // alternate L / R foot
    stepAlt = 1 - stepAlt;

    var gain = c.createGain();
    gain.gain.value = 0.18;

    src.connect(filt);
    filt.connect(gain);
    gain.connect(c.destination);
    src.start();
  }

  // ── Bark: two quick chirpy yips ──────────────────────────────────────────
  function bark() {
    if (!ready()) return;
    var c = ctx();
    var t = c.currentTime;

    [0, 0.16].forEach(function (offset) {
      var osc = c.createOscillator();
      var gain = c.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(520 + Math.random() * 80, t + offset);
      osc.frequency.exponentialRampToValueAtTime(160, t + offset + 0.11);

      gain.gain.setValueAtTime(0, t + offset);
      gain.gain.linearRampToValueAtTime(0.09, t + offset + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.11);

      // Slight lowpass to soften the saw wave
      var filt = c.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.value = 900;

      osc.connect(filt);
      filt.connect(gain);
      gain.connect(c.destination);
      osc.start(t + offset);
      osc.stop(t + offset + 0.13);
    });

    barkCooldown = 300 + Math.floor(Math.random() * 250); // ~5-9s at 60fps
  }

  function tryBark() {
    if (barkCooldown > 0) { barkCooldown--; return; }
    if (Math.random() < 0.004) bark(); // ~1 in 250 frames when cooldown is 0
  }

  window.SFX = { step: step, tryBark: tryBark };
})();
