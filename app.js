/**
 * HASELONSOLVEDCHESSYET.COM — CORE ENGINE
 * Interactive countdown, logarithmic scaling, SVG melting distortion,
 * Web Audio synthesizer, and Grok solver terminal simulator.
 */

(function () {
  'use strict';

  // =========================================================================
  // CONSTANTS & DATES
  // =========================================================================
  // Tweet was posted Sun May 12, 2024 at 19:51:46 UTC (2:51:46 PM CDT)
  const TWEET_DATE = new Date('2024-05-12T19:51:46Z').getTime();
  // Elon's 10-year deadline: May 12, 2034 at 19:51:46 UTC
  let targetDeadline = new Date('2034-05-12T19:51:46Z').getTime();
  let deadlineExtensionsCount = 0;

  // Sound FX State
  let audioCtx = null;
  let sfxEnabled = false;

  // DOM Elements
  const cdYears = document.getElementById('cd-years');
  const cdDays = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMinutes = document.getElementById('cd-minutes');
  const cdSeconds = document.getElementById('cd-seconds');
  const cdMillis = document.getElementById('cd-millis');
  const cdProgressBar = document.getElementById('countdown-progress-bar');
  const cdPercentText = document.getElementById('countdown-percent-text');

  // Slider DOM
  const orderSlider = document.getElementById('order-slider');
  const hudExponent = document.getElementById('hud-exponent');
  const hudClassification = document.getElementById('hud-classification');
  const hudGrokLoad = document.getElementById('hud-grok-load');
  const stateInspector = document.getElementById('state-inspector');
  const inspectorBadge = document.getElementById('inspector-badge');
  const inspectorCategory = document.getElementById('inspector-category');
  const inspectorTitle = document.getElementById('inspector-title');
  const inspectorDesc = document.getElementById('inspector-desc');
  const telemPositions = document.getElementById('telem-positions');
  const telemStorage = document.getElementById('telem-storage');
  const telemTime = document.getElementById('telem-time');
  const telemFeasibility = document.getElementById('telem-feasibility');
  const grokLogStream = document.getElementById('grok-log-stream');
  const milestonePins = document.querySelectorAll('.milestone-pin');
  const appWrapper = document.getElementById('app-wrapper');
  const displacementBase = document.getElementById('displacement-base');
  const glitchLayer = document.getElementById('glitch-layer');

  // Delusion Mode DOM
  const modeRealityBtn = document.getElementById('mode-reality-btn');
  const modeElonBtn = document.getElementById('mode-elon-btn');
  const modeCaption = document.getElementById('mode-caption');
  const flatlineStatDisplay = document.getElementById('flatline-stat-display');
  const flatlineDetailText = document.getElementById('flatline-detail-text');
  const elonNeedle = document.getElementById('elon-needle');
  const magnifyBtn = document.getElementById('magnify-btn');
  const accelerateBtn = document.getElementById('accelerate-btn');
  const microscopeViewport = document.getElementById('microscope-viewport');
  const closeLensBtn = document.getElementById('close-lens-btn');

  // Terminal DOM
  const termOutput = document.getElementById('term-output');
  const moveBtns = document.querySelectorAll('.move-btn');

  // Nav & Utility DOM
  const sfxToggle = document.getElementById('sfx-toggle');
  const sfxIcon = document.getElementById('sfx-icon');
  const sfxText = document.getElementById('sfx-text');
  const shareBtn = document.getElementById('share-btn');
  const footerResetBtn = document.getElementById('footer-reset-btn');

  // =========================================================================
  // AUDIO SYNTHESIZER (Web Audio API)
  // =========================================================================
  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.08, gainVal = 0.08) {
    if (!sfxEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio error suppressed
    }
  }

  function playGlitchNoise() {
    if (!sfxEnabled || !audioCtx) return;
    try {
      const bufferSize = audioCtx.sampleRate * 0.12;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;
      filter.Q.value = 3;

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.09, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start();
    } catch (e) {}
  }

  function playLaserZap() {
    if (!sfxEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {}
  }

  sfxToggle.addEventListener('click', () => {
    initAudio();
    sfxEnabled = !sfxEnabled;
    if (sfxEnabled) {
      sfxIcon.textContent = '🔊';
      sfxText.textContent = 'SOUND: ON';
      sfxToggle.style.borderColor = 'var(--accent-cyan)';
      playTone(600, 'sine', 0.1);
    } else {
      sfxIcon.textContent = '🔇';
      sfxText.textContent = 'SOUND: OFF';
      sfxToggle.style.borderColor = 'var(--border-bright)';
    }
  });

  // =========================================================================
  // LIVE COUNTDOWN TIMER
  // =========================================================================
  function updateCountdown() {
    const now = Date.now();
    const remainingMs = targetDeadline - now;

    if (remainingMs <= 0) {
      cdYears.textContent = '00';
      cdDays.textContent = '000';
      cdHours.textContent = '00';
      cdMinutes.textContent = '00';
      cdSeconds.textContent = '00';
      cdMillis.textContent = '000';
      cdPercentText.textContent = '100% (Elon Missed Deadline)';
      return;
    }

    const totalDuration = targetDeadline - TWEET_DATE;
    const elapsed = now - TWEET_DATE;
    const elapsedPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

    cdProgressBar.style.width = `${elapsedPercent.toFixed(2)}%`;
    cdPercentText.textContent = `${elapsedPercent.toFixed(3)}% Elapsed`;

    const totalSeconds = Math.floor(remainingMs / 1000);
    const millis = Math.floor(remainingMs % 1000);
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const totalHours = Math.floor(totalMinutes / 60);
    const hours = totalHours % 24;
    const totalDays = Math.floor(totalHours / 24);
    const years = Math.floor(totalDays / 365.25);
    const days = Math.floor(totalDays % 365.25);

    cdYears.textContent = String(years).padStart(2, '0');
    cdDays.textContent = String(days).padStart(3, '0');
    cdHours.textContent = String(hours).padStart(2, '0');
    cdMinutes.textContent = String(minutes).padStart(2, '0');
    cdSeconds.textContent = String(seconds).padStart(2, '0');
    cdMillis.textContent = String(millis).padStart(3, '0');
  }

  setInterval(updateCountdown, 41);
  updateCountdown();

  // =========================================================================
  // ORDERS OF MAGNITUDE SCALE DATA & LOGIC
  // =========================================================================
  const MAGNITUDE_DATA = [
    {
      maxVal: 5,
      exponent: '10³',
      title: 'Tic-Tac-Toe',
      classification: 'TRIVIAL (10³ POSITIONS)',
      category: 'SOLVABLE ON A NAPKIN',
      badge: 'SOLVED (~5,478 STATES)',
      badgeClass: 'solved',
      desc: 'Completely solved by schoolchildren and 1950s vacuum tubes. Total game states are roughly 5,478 (765 essentially distinct). With optimal play, the game is a forced draw.',
      positions: '5,478 states (~10³)',
      storage: 'Less than 1 Kilobyte',
      time: 'Instant (< 0.001 sec)',
      feasibility: 'Trivial (Paper & Pencil)',
      grokLoad: '0.0% [STABLE]'
    },
    {
      maxVal: 15,
      exponent: '10¹³',
      title: 'Connect Four (7×6)',
      classification: 'SOLVED (10¹³ POSITIONS)',
      category: 'STRONGLY SOLVED (1988)',
      badge: 'SOLVED IN 1988',
      badgeClass: 'solved',
      desc: 'Solved by James D. Allen and independently by Victor Allis in 1988. Total positions: 4,531,985,219,092 (~4.5 × 10¹²). First player (Yellow) can force a win by playing in the center column.',
      positions: '4,531,985,219,092 (~4.5 × 10¹²)',
      storage: 'Few Megabytes (RAM cache)',
      time: 'Minutes on modern laptop',
      feasibility: 'Completed & Mathematically Verified',
      grokLoad: '0.0% [STABLE]'
    },
    {
      maxVal: 20.5,
      exponent: '10²⁰',
      title: 'Checkers (English Draughts 8×8)',
      classification: 'CHECKERS (SOLVED)',
      category: 'MAX HUMAN ACHIEVED BOUNDARY',
      badge: 'SOLVED (2007)',
      badgeClass: 'solved',
      desc: 'Weakly solved in 2007 by Jonathan Schaeffer et al. after 18 years of continuous computation. Perfect play leads to a draw. This is the official boundary of games humanity has ever solved. Elon tweeted: "like checkers".',
      positions: '500,000,000,000,000,000,000 (5 × 10²⁰)',
      storage: '~10 Terabytes (Compressed Endgame)',
      time: '18 Years of Continuous CPU Clusters',
      feasibility: 'Heroic human achievement',
      grokLoad: '0.0% [STABLE]'
    },
    {
      maxVal: 30,
      exponent: '10²²',
      title: 'Current 8-Piece Chess Tablebases',
      classification: '8-PIECE ENDGAMES (IN PROGRESS)',
      category: 'SUPERCOMPUTER LIMIT (2026)',
      badge: 'PARTIAL / 15 PETABYTES',
      badgeClass: 'impossible',
      desc: 'Only endgames with 8 pieces or fewer! 7-piece tablebases took 140 TB uncompressed. 8-piece is estimated at 10–20 Petabytes and is currently crunching on supercomputers. 9-piece will require an estimated 100 Exabytes.',
      positions: '~10¹⁴ to 10²² partial states',
      storage: '15 to 20 Petabytes',
      time: 'Years of supercomputing nodes',
      feasibility: 'Barely feasible for endgames only (not full chess)',
      grokLoad: '28.4% [FAN SPEED 100%]'
    },
    {
      maxVal: 60,
      exponent: '10⁴⁴',
      title: 'Legal Chess Positions (Tromp Bound)',
      classification: 'LEGAL CHESS POSITIONS (10⁴⁴)',
      category: 'STATE SPACE COMPLEXITY',
      badge: 'PHYSICALLY IMPOSSIBLE TO STORE',
      badgeClass: 'impossible',
      desc: 'Calculated by computer scientist John Tromp in 2021: (4.822 × 10⁴⁴) legal reachable boards. Even if you encoded 1 position per atom of Earth, Earth only has 10⁵⁰ atoms, but you would still need millions of Earths to process this.',
      positions: '482,200,000,000,000,000,000,000,000,000,000,000,000,000,000',
      storage: '10³² Petabytes (Mass exceeds solar system)',
      time: '10³⁰ Years on all AWS servers',
      feasibility: 'Violates Information Density Laws',
      grokLoad: '64.7% [GROK RUNAWAY]'
    },
    {
      maxVal: 95,
      exponent: '10⁸⁰',
      title: 'Total Atoms in Observable Universe',
      classification: 'ALL COSMIC MATTER (10⁸⁰)',
      category: 'THERMODYNAMIC HORIZON',
      badge: 'EXCEEDS PHYSICAL REALITY',
      badgeClass: 'impossible',
      desc: 'Every proton, neutron, and electron in all 2 trillion observable galaxies equals ~10⁸⁰ particles. There are fewer atoms in the entire known cosmos than there are possible chess game variations.',
      positions: '10⁸⁰ (Count of all matter in universe)',
      storage: 'Universe collapsed into black hole',
      time: 'Beyond the Heat Death of the Universe',
      feasibility: 'Bekenstein Bound breached',
      grokLoad: '89.2% [QUANTUM GLITCH]'
    },
    {
      maxVal: 120,
      exponent: '10¹²⁰',
      title: "Shannon's Number (Game-Tree Variations)",
      classification: 'SHANNON LIMIT (10¹²⁰)',
      category: 'TOTAL GAME TREE COMPLEXITY',
      badge: 'DELUSION LEVEL: MAXIMUM',
      badgeClass: 'impossible',
      desc: 'Claude Shannon calculated that a typical 40-move chess game has 10¹²⁰ possible variations. To solve chess by examining its tree would require evaluating more positions than there are atoms in 10⁴⁰ observable universes.',
      positions: '10¹²⁰ (1 followed by 120 zeroes)',
      storage: 'Requires 10⁴⁰ Universes made of SSDs',
      time: '10¹⁰⁰ × the current age of the cosmos',
      feasibility: 'Elon Musk: "Solved in 10 years bro"',
      grokLoad: '999.9% [TOTAL MELTDOWN]'
    }
  ];

  const GROK_SPINNER_QUOTES = [
    "Compressing Shannon Number with Grok 3...",
    "Diverting 4.2 Terawatts from Memphis power grid...",
    "Thermal runaway: Cooling H100s with Starship liquid oxygen...",
    "Translating pawns into Cybertruck stainless steel chassis...",
    "Elon on X: 'Looking into it. Chess v2 next year'...",
    "Simulating Stockfish butt vibrations at quantum level...",
    "En passant deleted to fit within 8-bit registers...",
    "Grok hallucinated 1. e4 e5 2. Ke2!! (Autonomous Gambit)...",
    "Bekenstein bound exceeded. Black hole created in server rack...",
    "Neuralink monkeys playing rapid chess to train transformer..."
  ];

  let activeSpinners = [];

  function spawnGlitchSpinners(count = 3) {
    clearGlitchSpinners();
    for (let i = 0; i < count; i++) {
      const card = document.createElement('div');
      card.className = 'floating-spinner-card';
      const quote = GROK_SPINNER_QUOTES[Math.floor(Math.random() * GROK_SPINNER_QUOTES.length)];
      card.innerHTML = `<span class="spinner-icon"></span> <span>${quote}</span>`;
      
      const left = Math.floor(Math.random() * 70 + 10);
      const top = Math.floor(Math.random() * 65 + 15);
      card.style.left = `${left}%`;
      card.style.top = `${top}%`;
      card.style.animationDelay = `${(i * 0.4).toFixed(1)}s`;

      glitchLayer.appendChild(card);
      activeSpinners.push(card);
    }
  }

  function clearGlitchSpinners() {
    glitchLayer.innerHTML = '';
    activeSpinners = [];
  }

  // Emergency restore button in melt HUD
  const emergencyRestoreBtn = document.getElementById('emergency-restore-btn');
  if (emergencyRestoreBtn) {
    emergencyRestoreBtn.addEventListener('click', () => {
      orderSlider.value = 20;
      handleSliderChange(20);
      playTone(440, 'sine', 0.12);
    });
  }

  function updateMeltZone(val) {
    if (val > 20) {
      document.body.classList.add('in-melt-zone');
      appWrapper.classList.add('melting');

      // Controlled liquid wave distortion (range: 2 to 14, looks fluid & wavy)
      const excess = val - 20; // 0 to 100
      const meltScale = Math.min(14, 2 + (excess / 100) * 12);
      if (displacementBase) {
        displacementBase.setAttribute('scale', meltScale.toFixed(1));
      }

      // Stream dynamic grok log
      const quote = GROK_SPINNER_QUOTES[Math.floor(Math.random() * GROK_SPINNER_QUOTES.length)];
      const msgLine = document.createElement('div');
      msgLine.className = 'grok-msg-line';
      const expFormatted = (val % 1 === 0 || Math.abs(val - Math.round(val)) < 0.05) ? Math.round(val) : val.toFixed(1);
      msgLine.innerHTML = `<strong>[GROK-CORE-WARP]</strong> Exponent 10<sup>${expFormatted}</sup>: ${quote}`;
      
      if (grokLogStream.children.length > 3) {
        grokLogStream.removeChild(grokLogStream.firstChild);
      }
      grokLogStream.appendChild(msgLine);

      // Spawn floating spinners
      if (activeSpinners.length < 3) {
        spawnGlitchSpinners(3);
      }

      playGlitchNoise();
    } else {
      document.body.classList.remove('in-melt-zone');
      appWrapper.classList.remove('melting');
      if (displacementBase) {
        displacementBase.setAttribute('scale', '0');
      }
      clearGlitchSpinners();
      grokLogStream.innerHTML = '';
    }
  }

  function handleSliderChange(val) {
    const numVal = parseFloat(val);

    // Play pitch-shifting audio feedback
    const synthFreq = 150 + (numVal / 120) * 1200;
    playTone(synthFreq, numVal > 20 ? 'sawtooth' : 'sine', 0.04, 0.05);

    // Find corresponding data segment
    const currentData = MAGNITUDE_DATA.find(d => numVal <= d.maxVal) || MAGNITUDE_DATA[MAGNITUDE_DATA.length - 1];

    const expDisplay = (numVal % 1 === 0 || Math.abs(numVal - Math.round(numVal)) < 0.05) 
      ? `10<sup>${Math.round(numVal)}</sup>` 
      : `10<sup>${numVal.toFixed(1)}</sup>`;
    hudExponent.innerHTML = expDisplay;
    hudClassification.textContent = currentData.classification;
    hudGrokLoad.textContent = numVal <= 20 ? '0.0% [STABLE]' : `${((numVal / 120) * 100).toFixed(1)}% [MELTING]`;

    inspectorTitle.textContent = currentData.title;
    inspectorBadge.textContent = currentData.badge;
    inspectorBadge.className = `inspector-status-badge ${currentData.badgeClass}`;
    inspectorCategory.textContent = currentData.category;
    inspectorDesc.textContent = currentData.desc;

    telemPositions.textContent = currentData.positions;
    telemStorage.textContent = currentData.storage;
    telemTime.textContent = currentData.time;
    telemFeasibility.textContent = currentData.feasibility;
    telemFeasibility.className = `telem-val font-mono ${numVal > 20 ? 'highlight-red' : 'highlight-green'}`;

    // Highlight active pin
    milestonePins.forEach(pin => {
      const pinVal = parseFloat(pin.getAttribute('data-val'));
      if (Math.abs(pinVal - numVal) < 4) {
        pin.classList.add('active');
      } else {
        pin.classList.remove('active');
      }
    });

    updateMeltZone(numVal);
  }

  orderSlider.addEventListener('input', (e) => {
    handleSliderChange(e.target.value);
  });

  milestonePins.forEach(pin => {
    pin.addEventListener('click', () => {
      const targetVal = parseFloat(pin.getAttribute('data-val'));
      orderSlider.value = targetVal;
      handleSliderChange(targetVal);
    });
  });

  // =========================================================================
  // SCALE OF DELUSION: INTERACTIVE COMPARISON SLIDER & MODES
  // =========================================================================
  const delusionStepSlider = document.getElementById('delusion-step-slider');
  const stepMarks = document.querySelectorAll('.step-mark');
  const delusionSliderReadout = document.getElementById('delusion-slider-readout');
  const focalTitle = document.getElementById('focal-title');
  const focalRatio = document.getElementById('focal-ratio');
  const focalText = document.getElementById('focal-text');
  const delusionRows = document.querySelectorAll('.delusion-row');

  const DELUSION_STEPS = [
    {
      readout: 'SCALE 1 / 4: 8-PIECE TABLEBASE (~10¹⁴)',
      title: 'Number of 8-Piece Tablebase Positions Solved So Far',
      ratio: 'RATIO TO FULL CHESS: 0.0000000000000000000000000000004%',
      text: 'Humanity has only partially computed endgames with 8 pieces or fewer, requiring ~15 Petabytes of storage. Comparing this to full 32-piece chess is like comparing a single grain of sand to a million Saharas.',
      stat: '0.00000000001%',
      statDetail: 'Calculated progress toward solving chess: 0.000000000000000000000000000000423%'
    },
    {
      readout: 'SCALE 2 / 4: LEGAL CHESS POSITIONS (10⁴⁴)',
      title: 'Legal Chess Positions (Tromp Bound)',
      ratio: 'EXCEEDS CHECKERS BY: 10²⁴× (A SEPTILLION TIMES)',
      text: 'Calculated by John Tromp: ~4.8 × 10⁴⁴ unique legal reachable boards. Even if you wrote one board on every proton of Earth, you would need millions of Earths to process this state graph.',
      stat: '0.00000000001%',
      statDetail: 'State space complexity exceeds humanity’s total digital storage by 10²²×.'
    },
    {
      readout: 'SCALE 3 / 4: OBSERVABLE UNIVERSE ATOMS (10⁸⁰)',
      title: 'Total Atoms in the Observable Cosmos',
      ratio: 'ALL COSMIC MATTER: ~10⁸⁰ PARTICLES',
      text: 'Every single proton, neutron, and electron across 2 trillion galaxies equals 10⁸⁰ particles. There are vastly more chess variations than particles in physical existence. Grok cannot fit this into Memphis.',
      stat: '0.00000000001%',
      statDetail: 'Violates thermodynamic information limits (Landauer & Bekenstein bounds).'
    },
    {
      readout: 'SCALE 4 / 4: SHANNON NUMBER (10¹²⁰)',
      title: "Shannon's Number (Game-Tree Variations)",
      ratio: 'ELON PROGRESS: FLATLINED AT 0.00000000001%',
      text: 'Claude Shannon calculated ~10¹²⁰ possible 40-move games. Fully calculating this tree like checkers requires more energy than all stars in the universe emitting at full power for 100 billion years.',
      stat: '0.00000000001%',
      statDetail: 'Elon Musk: "Essentially fully solved (like checkers) within 10 years."'
    }
  ];

  function handleDelusionStep(stepIndex) {
    const data = DELUSION_STEPS[stepIndex];
    if (!data) return;

    delusionSliderReadout.textContent = data.readout;
    focalTitle.textContent = data.title;
    focalRatio.textContent = data.ratio;
    focalText.textContent = data.text;

    // Highlight step mark
    stepMarks.forEach((m, idx) => {
      if (idx === stepIndex) m.classList.add('active');
      else m.classList.remove('active');
    });

    // Highlight row in comparison card
    delusionRows.forEach((row, idx) => {
      if (idx === stepIndex) {
        row.style.borderColor = 'var(--accent-cyan)';
        row.style.boxShadow = '0 0 15px var(--accent-cyan-glow)';
      } else {
        row.style.borderColor = 'var(--border-dim)';
        row.style.boxShadow = 'none';
      }
    });

    if (!isElonMode) {
      flatlineStatDisplay.textContent = data.stat;
      flatlineDetailText.textContent = data.statDetail;
    }

    playTone(350 + stepIndex * 120, 'sine', 0.06);
  }

  if (delusionStepSlider) {
    delusionStepSlider.addEventListener('input', (e) => {
      handleDelusionStep(parseInt(e.target.value, 10));
    });
  }

  stepMarks.forEach(mark => {
    mark.addEventListener('click', () => {
      const step = parseInt(mark.getAttribute('data-step'), 10);
      if (delusionStepSlider) delusionStepSlider.value = step;
      handleDelusionStep(step);
    });
  });

  let isElonMode = false;

  function setDelusionMode(elonActive) {
    isElonMode = elonActive;
    if (isElonMode) {
      modeElonBtn.classList.add('active');
      modeRealityBtn.classList.remove('active');
      modeCaption.innerHTML = '<strong style="color:var(--accent-gold);">ELON VISION:</strong> "Full Self-Solving guaranteed next year. 99.999% solved in simulation."';
      flatlineStatDisplay.textContent = '99.999% (SIMULATION)';
      flatlineStatDisplay.style.color = 'var(--accent-gold)';
      flatlineDetailText.textContent = 'Hardware requirement: 1 Cybercab running Grok Chess v0.1 in FSD parking mode.';
      elonNeedle.style.width = '99.9%';
      elonNeedle.style.background = 'var(--accent-gold)';
      playLaserZap();
    } else {
      modeRealityBtn.classList.add('active');
      modeElonBtn.classList.remove('active');
      modeCaption.textContent = "Viewing ground-truth mathematical progress: Elon's bar is flatlined at 0.00000000001%.";
      flatlineStatDisplay.textContent = '0.00000000001%';
      flatlineStatDisplay.style.color = 'var(--accent-red)';
      flatlineDetailText.textContent = 'Calculated progress toward solving chess: 0.000000000000000000000000000000423%';
      elonNeedle.style.width = '0.00000000001%';
      elonNeedle.style.background = 'var(--accent-red)';
      playTone(300, 'sine', 0.1);
    }
  }

  modeRealityBtn.addEventListener('click', () => setDelusionMode(false));
  modeElonBtn.addEventListener('click', () => setDelusionMode(true));

  // Accelerate with Grok: shifts deadline forward by 2 years
  accelerateBtn.addEventListener('click', () => {
    deadlineExtensionsCount++;
    targetDeadline += 2 * 365.25 * 24 * 60 * 60 * 1000;
    const newYear = 2034 + deadlineExtensionsCount * 2;
    
    playLaserZap();
    alert(`⚡ GROK ACCELERATION PROTOCOL ACTIVATED!\n\nDiverting 50,000 additional H100s from Memphis to simulate pawns.\nUnforeseen combinatorial complexity detected.\n\nNew projected deadline shifted to: May 12, ${newYear}!`);
    updateCountdown();
  });

  // Microscope inspection modal
  magnifyBtn.addEventListener('click', () => {
    microscopeViewport.classList.remove('hidden');
    playTone(750, 'sine', 0.15);
  });

  closeLensBtn.addEventListener('click', () => {
    microscopeViewport.classList.add('hidden');
    playTone(400, 'sine', 0.08);
  });

  // =========================================================================
  // GROK CHESS SOLVER TERMINAL INTERACTION
  // =========================================================================
  const GROK_RESPONSES = {
    "1. e4 (King's Pawn)": [
      { sender: 'USER', text: 'exec_move "1. e4"' },
      { sender: 'SYS', text: '[INFERENCE] Branching 10¹²⁰ game tree...' },
      { sender: 'WARN', text: '[COLLAPSE] Memory required: 10²⁴ Petabytes. Exceeded cluster swap.' },
      { sender: 'GROK', text: '"Best reply is 1... e5, but with Starlink antenna mounted on the bishop. Evaluating 10⁴⁴ blunders..."' }
    ],
    "1. d4 (Queen's Pawn)": [
      { sender: 'USER', text: 'exec_move "1. d4"' },
      { sender: 'SYS', text: '[INFERENCE] Queen\'s Gambit tree initiated...' },
      { sender: 'WARN', text: '[HEAT WARNING] Memphis substation voltage dropped 12%.' },
      { sender: 'GROK', text: '"First principles analysis: The Queen moves too many squares. In Grok Chess, all pieces are replaced by autonomous Cyberpawns."' }
    ],
    "1. Nf3 (Réti Opening)": [
      { sender: 'USER', text: 'exec_move "1. Nf3"' },
      { sender: 'SYS', text: '[INFERENCE] Hypermodern opening selected...' },
      { sender: 'GROK', text: '"Knight moves in an L-shape. The letter L stands for Launch. Falcon 9 second stage confirmed. Position solved as +0.00000000001."' }
    ],
    "1. c4 (English Opening)": [
      { sender: 'USER', text: 'exec_move "1. c4"' },
      { sender: 'SYS', text: '[INFERENCE] English Opening parsed...' },
      { sender: 'GROK', text: '"According to FIDE rules, this is fine. According to physics, evaluating every Black response requires more energy than the Big Bang."' }
    ],
    "1. f3 (Bongcloud Prep / Barnes)": [
      { sender: 'USER', text: 'exec_move "1. f3"' },
      { sender: 'SYS', text: '[CRITICAL ALERT] 1. f3 detected. King safety reduced to 0.00%.' },
      { sender: 'GROK', text: '"Genius move. Completely unexpected. Prepares 2. Kf2 (The Full Self-Driving King Walk). Humans don\'t understand 4D chess."' }
    ],
    "FORCE FULL SOLVE (10¹²⁰)": [
      { sender: 'USER', text: 'solve_all --universe-limit=bypass' },
      { sender: 'SYS', text: '[SYSTEM CRITICAL] Attempting to store 10¹²⁰ leaf nodes in RAM...' },
      { sender: 'WARN', text: '[THERMAL TRIP] Server rack temperature: 8,400°C. TVA transformer vaporized.' },
      { sender: 'WARN', text: '[BEKENSTEIN BOUND ERROR] Mass density created micro-singularity.' },
      { sender: 'GROK', text: '"Status update: Looking into it. Chess will definitely be solved by Q4 next year."' }
    ]
  };

  moveBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const move = btn.getAttribute('data-move');
      const lines = GROK_RESPONSES[move];
      if (!lines) return;

      playTone(520, 'square', 0.08);

      lines.forEach((lineObj, idx) => {
        setTimeout(() => {
          const div = document.createElement('div');
          div.className = 'term-line';
          if (lineObj.sender === 'USER') {
            div.innerHTML = `<span class="prompt-user">grok@xai-cluster:~$</span> ${lineObj.text}`;
          } else if (lineObj.sender === 'SYS') {
            div.className += ' sys-msg';
            div.textContent = lineObj.text;
          } else if (lineObj.sender === 'WARN') {
            div.className += ' warn-msg';
            div.textContent = lineObj.text;
            playGlitchNoise();
          } else if (lineObj.sender === 'GROK') {
            div.className += ' accent-msg';
            div.textContent = `[GROK] ${lineObj.text}`;
            playTone(850, 'sine', 0.12);
          }
          termOutput.appendChild(div);
          termOutput.scrollTop = termOutput.scrollHeight;
        }, idx * 320);
      });
    });
  });

  // =========================================================================
  // RESET BUTTON & SHARING
  // =========================================================================
  footerResetBtn.addEventListener('click', () => {
    orderSlider.value = 20;
    handleSliderChange(20);
    setDelusionMode(false);
    targetDeadline = new Date('2034-05-12T19:51:46Z').getTime();
    deadlineExtensionsCount = 0;
    updateCountdown();
    playTone(440, 'sine', 0.1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  shareBtn.addEventListener('click', () => {
    const yearsLeft = cdYears.textContent;
    const daysLeft = cdDays.textContent;
    const shareText = encodeURIComponent(
      `Has Elon solved chess yet? NO.\n\n` +
      `Time remaining until his 10-year deadline: ${yearsLeft} years, ${daysLeft} days.\n` +
      `Current progress: 0.00000000001% (Shannon Number: 10¹²⁰ variations).\n\n` +
      `Track the delusion live: https://haselonsolvedchessyet.com`
    );
    const xUrl = `https://twitter.com/intent/tweet?text=${shareText}`;
    window.open(xUrl, '_blank');
  });

  // Initial setup
  handleSliderChange(20);

})();
