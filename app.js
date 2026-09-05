/**
 * HASELONSOLVEDCHESSYET.COM — CORE ENGINE
 * Interactive countdown, logarithmic scaling, SVG melting distortion,
 * Web Audio synthesizer, and single Grok compression spinner.
 */

(function () {
  'use strict';

  // =========================================================================
  // CONSTANTS & DATES
  // =========================================================================
  // Tweet was posted Sun May 12, 2024 at 19:51:46 UTC (2:51:46 PM CDT)
  const TWEET_DATE = new Date('2024-05-12T19:51:46Z').getTime();
  // Elon's 10-year deadline: May 12, 2034 at 19:51:46 UTC
  const targetDeadline = new Date('2034-05-12T19:51:46Z').getTime();

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
  const inspectorBadge = document.getElementById('inspector-badge');
  const inspectorCategory = document.getElementById('inspector-category');
  const inspectorTitle = document.getElementById('inspector-title');
  const inspectorDesc = document.getElementById('inspector-desc');
  const telemPositions = document.getElementById('telem-positions');
  const telemStorage = document.getElementById('telem-storage');
  const telemTime = document.getElementById('telem-time');
  const telemFeasibility = document.getElementById('telem-feasibility');
  const milestonePins = document.querySelectorAll('.milestone-pin');
  const appWrapper = document.getElementById('app-wrapper');
  const displacementBase = document.getElementById('displacement-base');
  const turbulenceBase = document.getElementById('turbulence-base');
  const glitchLayer = document.getElementById('glitch-layer');

  // Nav & Utility DOM
  const sfxToggle = document.getElementById('sfx-toggle');
  const sfxIcon = document.getElementById('sfx-icon');
  const sfxText = document.getElementById('sfx-text');
  const copyBtn = document.getElementById('copy-btn');
  const copyIcon = document.getElementById('copy-icon');
  const copyText = document.getElementById('copy-text');
  const shareBtn = document.getElementById('share-btn');
  const tweetCopyBtn = document.getElementById('tweet-copy-btn');
  const tweetCopyLabel = document.getElementById('tweet-copy-label');
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

  function playTone(freq, type = 'sine', duration = 0.12, gainVal = 0.18) {
    if (!sfxEnabled || !audioCtx) return;
    try {
      // Clamped strictly to 50-100Hz low-frequency range
      const clampedFreq = Math.min(100, Math.max(50, freq));
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(clampedFreq, audioCtx.currentTime);
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
      const bufferSize = Math.floor(audioCtx.sampleRate * 0.12);
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 80; // Deep 80Hz rumble
      filter.Q.value = 3.2;

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.24, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start();
    } catch (e) {}
  }

  sfxToggle.addEventListener('click', () => {
    initAudio();
    sfxEnabled = !sfxEnabled;
    if (sfxEnabled) {
      sfxIcon.textContent = '🔊';
      sfxText.textContent = 'SOUND: ON';
      sfxToggle.style.borderColor = 'var(--accent-cyan)';
      playTone(70, 'sine', 0.15, 0.22);
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
      feasibility: 'Trivial (Paper & Pencil)'
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
      feasibility: 'Completed & Mathematically Verified'
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
      feasibility: 'Heroic human achievement'
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
      feasibility: 'Barely feasible for endgames only (not full chess)'
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
      feasibility: 'Violates Information Density Laws'
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
      feasibility: 'Bekenstein Bound breached'
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
      feasibility: 'Elon Musk: "Solved in 10 years bro"'
    }
  ];

  // Exactly ONE spinner bubble: "Compressing with Grok"
  let singleSpinnerBubble = null;

  function spawnSingleGrokBubble() {
    if (singleSpinnerBubble) return; // Keep exactly one spinner bubble
    const card = document.createElement('div');
    card.className = 'floating-spinner-card single-grok-bubble';
    card.innerHTML = `<span class="spinner-icon"></span> <span>Compressing with Grok</span>`;
    glitchLayer.appendChild(card);
    singleSpinnerBubble = card;
  }

  function removeSingleGrokBubble() {
    if (singleSpinnerBubble) {
      singleSpinnerBubble.remove();
      singleSpinnerBubble = null;
    }
  }

  // Live liquid undulation loop
  let meltAnimFrame = null;
  let meltPhase = 0;

  function startMeltAnimation() {
    if (meltAnimFrame) return;
    function loop() {
      if (!document.body.classList.contains('in-melt-zone')) {
        meltAnimFrame = null;
        return;
      }
      meltPhase += 0.025;
      if (turbulenceBase) {
        // Gently undulate frequency to create liquid heatwave rippling
        const freqX = 0.005 + Math.sin(meltPhase * 1.1) * 0.002;
        const freqY = 0.016 + Math.cos(meltPhase * 0.85) * 0.004;
        turbulenceBase.setAttribute('baseFrequency', `${freqX.toFixed(5)} ${freqY.toFixed(5)}`);
      }
      meltAnimFrame = requestAnimationFrame(loop);
    }
    meltAnimFrame = requestAnimationFrame(loop);
  }

  function stopMeltAnimation() {
    if (meltAnimFrame) {
      cancelAnimationFrame(meltAnimFrame);
      meltAnimFrame = null;
    }
    if (turbulenceBase) {
      turbulenceBase.setAttribute('baseFrequency', '0.006 0.018');
    }
  }

  function updateMeltZone(val) {
    if (val > 20) {
      document.body.classList.add('in-melt-zone');
      appWrapper.classList.add('melting');

      // Amped up liquid wave distortion (range: 6 to 36)
      const excess = val - 20; // 0 to 100
      const intensity = Math.min(1, Math.max(0, excess / 100));
      // Base distortion starts at 6 and scales up to 36 for extreme universe-scale absurdity
      const meltScale = 6 + Math.pow(intensity, 0.85) * 30;
      if (displacementBase) {
        displacementBase.setAttribute('scale', meltScale.toFixed(1));
      }

      // Pass intensity to CSS custom properties
      document.documentElement.style.setProperty('--melt-intensity', intensity.toFixed(3));
      
      // Dynamic spinner speed (0.6s down to 0.2s)
      const spinSpeed = (0.6 - intensity * 0.4).toFixed(2) + 's';
      document.documentElement.style.setProperty('--spinner-speed', spinSpeed);

      startMeltAnimation();

      // Show the single spinner bubble: "Compressing with Grok"
      spawnSingleGrokBubble();

      playGlitchNoise();
    } else {
      document.body.classList.remove('in-melt-zone');
      appWrapper.classList.remove('melting');
      document.documentElement.style.setProperty('--melt-intensity', '0');
      document.documentElement.style.setProperty('--spinner-speed', '0.6s');
      if (displacementBase) {
        displacementBase.setAttribute('scale', '0');
      }
      stopMeltAnimation();
      removeSingleGrokBubble();
    }
  }

  function handleSliderChange(val) {
    const numVal = parseFloat(val);

    // Low-frequency (50-100Hz) sub-bass audio feedback
    const synthFreq = 50 + (numVal / 120) * 50;
    playTone(synthFreq, numVal > 20 ? 'sawtooth' : 'sine', 0.08, 0.18);

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
  // RESET BUTTON & SHARING
  // =========================================================================
  footerResetBtn.addEventListener('click', () => {
    orderSlider.value = 20;
    handleSliderChange(20);
    playTone(55, 'sine', 0.18, 0.22);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  function getSharePayload() {
    const yearsLeft = cdYears.textContent;
    const daysLeft = cdDays.textContent;
    const currentVal = orderSlider.value;
    const numVal = parseFloat(currentVal);
    const expDisplay = (numVal % 1 === 0 || Math.abs(numVal - Math.round(numVal)) < 0.05)
      ? `10^${Math.round(numVal)}`
      : `10^${numVal.toFixed(1)}`;
    const url = numVal === 20 
      ? 'https://haselonsolvedchessyet.com' 
      : `https://haselonsolvedchessyet.com/?val=${numVal}`;

    return {
      text: `Has Elon solved chess yet? NO.\n\n` +
            `Time remaining until his 10-year deadline: ${yearsLeft} years, ${daysLeft} days.\n` +
            `Current scale: ${expDisplay} (Shannon Number: 10¹²⁰ variations).\n\n` +
            `Track the delusion live: ${url}`,
      url: url
    };
  }

  function copyTextToClipboard(text, onDone) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => { if (onDone) onDone(true); })
        .catch(() => { fallbackCopy(text, onDone); });
    } else {
      fallbackCopy(text, onDone);
    }
  }

  function fallbackCopy(text, onDone) {
    let success = false;
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      success = document.execCommand('copy');
    } catch (e) {
      success = false;
    }
    ta.remove();
    if (onDone) onDone(success);
  }

  // Copy Link & Telemetry Button (Top Nav)
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const payload = getSharePayload();
      copyTextToClipboard(payload.text, (ok) => {
        playTone(75, 'sine', 0.15, 0.2);
        if (copyText && copyIcon) {
          const origText = copyText.textContent;
          const origIcon = copyIcon.textContent;
          copyText.textContent = ok ? 'COPIED!' : 'ERROR';
          copyIcon.textContent = ok ? '✓' : '⚠️';
          copyBtn.style.borderColor = 'var(--accent-cyan)';
          copyBtn.style.color = 'var(--accent-cyan)';
          setTimeout(() => {
            copyText.textContent = origText;
            copyIcon.textContent = origIcon;
            copyBtn.style.borderColor = '';
            copyBtn.style.color = '';
          }, 2000);
        }
      });
    });
  }

  // Copy Tweet Button (Tweet Card)
  if (tweetCopyBtn) {
    tweetCopyBtn.addEventListener('click', () => {
      const tweetContent = 
        `"I predict that chess will be essentially fully solved (like checkers) within 10 years." — Elon Musk (@elonmusk)\n\n` +
        `Target: May 12, 2034\n` +
        `Complexity: Chess has 10¹²⁰ game variations. Observable universe has only 10⁸⁰ atoms.\n\n` +
        `Live delusion tracker: https://haselonsolvedchessyet.com`;
      copyTextToClipboard(tweetContent, (ok) => {
        playTone(65, 'sine', 0.15, 0.2);
        tweetCopyBtn.classList.add('copied');
        if (tweetCopyLabel) tweetCopyLabel.textContent = ok ? 'Copied!' : 'Failed';
        setTimeout(() => {
          tweetCopyBtn.classList.remove('copied');
          if (tweetCopyLabel) tweetCopyLabel.textContent = 'Copy';
        }, 2000);
      });
    });
  }

  // Share on X Button (if present)
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const payload = getSharePayload();
      const shareText = encodeURIComponent(payload.text);
      const xUrl = `https://twitter.com/intent/tweet?text=${shareText}`;
      window.open(xUrl, '_blank');
    });
  }

  // Initial setup (supports ?val= query parameter for direct linking/testing)
  const urlParams = new URLSearchParams(window.location.search);
  const initialVal = urlParams.has('val') ? parseFloat(urlParams.get('val')) : 20;
  orderSlider.value = initialVal;
  handleSliderChange(initialVal);

})();
