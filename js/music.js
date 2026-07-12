'use strict';
(function () {
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;

  var actx, masterGain, reverbNode;
  var playing = false;
  var currentNote = 0;
  var nextTime = 0;
  var timerID = null;
  var gestureReceived = false;

  var BPM = 108;
  var STEP = 60 / BPM / 2;

  var mel = [
    392, 494, 587, 494,  392, 440, 392, 330,
    294, 330, 392, 440,  494, 587, 494, 392,
    659, 587, 494, 392,  440, 523, 494, 440,
    392, 494, 587, 784,  587, 494, 392,   0,
    392, 440, 494, 523,  587, 523, 494, 440,
    392, 330, 294, 330,  392, 440, 494, 392,
    494, 587, 659, 587,  523, 440, 392, 294,
    392, 494, 587, 392,  440, 330, 392,   0
  ];
  var bass = [196,165,196,247, 196,165,196,247, 247,220,196,165, 196,247,196,196];
  var harm = [
    247,294,294,247, 247,220,247,196, 330,294,294,247, 247,294,294,196,
    247,294,294,247, 247,220,196,220, 294,330,392,294, 247,220,247,196
  ];

  function makeReverb() {
    var len = actx.sampleRate * 1.5;
    var buf = actx.createBuffer(2, len, actx.sampleRate);
    for (var c = 0; c < 2; c++) {
      var d = buf.getChannelData(c);
      for (var i = 0; i < len; i++) d[i] = (Math.random()*2-1)*Math.pow(1-i/len,2.5);
    }
    var conv = actx.createConvolver();
    conv.buffer = buf;
    return conv;
  }

  function playTone(freq, time, dur, vol, type, wet) {
    if (!freq) return;
    var osc = actx.createOscillator();
    var env = actx.createGain();
    osc.type = type || 'triangle';
    osc.frequency.value = freq;
    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(vol, time + 0.012);
    env.gain.exponentialRampToValueAtTime(0.001, time + dur * 0.88);
    osc.connect(env);
    if (wet && reverbNode) {
      var wg = actx.createGain(); wg.gain.value = 0.18;
      env.connect(wg); wg.connect(reverbNode);
    }
    env.connect(masterGain);
    osc.start(time); osc.stop(time + dur);
  }

  function schedule() {
    var ahead = actx.currentTime + 0.12;
    while (nextTime < ahead) {
      var i = currentNote % mel.length;
      playTone(mel[i], nextTime, STEP * 0.82, 0.13, 'triangle', true);
      if (currentNote % 2 === 0) {
        playTone(harm[Math.floor(currentNote/2) % harm.length], nextTime, STEP*1.6, 0.055, 'sine', true);
      }
      if (currentNote % 4 === 0) {
        var bi = Math.floor(currentNote/4) % bass.length;
        playTone(bass[bi], nextTime, STEP*3.6, 0.09, 'sine', false);
        playTone(bass[bi]*2, nextTime, STEP*0.5, 0.04, 'square', false);
      }
      nextTime += STEP;
      currentNote++;
      if (currentNote >= mel.length) currentNote = 0;
    }
    timerID = setTimeout(schedule, 20);
  }

  function setupAudio() {
    if (actx) return;
    actx = new AC();
    masterGain = actx.createGain();
    masterGain.gain.value = 0.55;
    masterGain.connect(actx.destination);
    reverbNode = makeReverb();
    reverbNode.connect(masterGain);
  }

  function startMusic() {
    if (playing) return;
    setupAudio();
    actx.resume().then(function () {
      playing = true;
      nextTime = actx.currentTime + 0.05;
      schedule();
      btn.textContent = '♫';
      btn.classList.add('on');
    });
  }

  function stopMusic() {
    playing = false;
    clearTimeout(timerID);
    masterGain.gain.setTargetAtTime(0, actx.currentTime, 0.3);
    setTimeout(function () { masterGain.gain.value = 0.55; }, 800);
    btn.textContent = '♪';
    btn.classList.remove('on');
  }

  // ── Button (inline styles so it always appears) ───────────────────────────
  var btn = document.createElement('button');
  btn.id = 'music-btn';
  btn.textContent = '♪';
  btn.title = 'Toggle music';
  // Inline fallback styles in case CSS hasn't loaded yet
  btn.setAttribute('style', [
    'position:fixed','bottom:1rem','left:1.25rem',
    'z-index:200','width:32px','height:32px',
    'background:rgba(15,8,3,.88)',
    'border:1px solid rgba(212,168,67,.45)',
    'color:rgba(212,168,67,.75)','font-size:1rem',
    'cursor:pointer','display:flex',
    'align-items:center','justify-content:center',
    'font-family:"Pixelify Sans",monospace'
  ].join(';'));
  document.body.appendChild(btn);

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (playing) stopMusic(); else startMusic();
  });

  window.MUSIC = {
    toggle: function() { if (playing) stopMusic(); else startMusic(); },
    isPlaying: function() { return playing; }
  };

  // ── Autoplay: try immediately, resume on first gesture ───────────────────
  function onGesture() {
    if (gestureReceived) return;
    gestureReceived = true;
    startMusic();
    ['mousemove','pointerdown','keydown','touchstart'].forEach(function(ev) {
      document.removeEventListener(ev, onGesture);
    });
  }

  // Try to start right away (works if page already has focus from a prior gesture)
  setupAudio();
  if (actx.state === 'running') {
    onGesture();
  } else {
    // Wait for the very first user interaction — mousemove is enough in Chrome
    ['mousemove','pointerdown','keydown','touchstart'].forEach(function(ev) {
      document.addEventListener(ev, onGesture, { once: true, passive: true });
    });
  }

})();
