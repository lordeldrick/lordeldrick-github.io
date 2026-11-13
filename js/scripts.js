/**
 * Hannah Watts Music - Accessible Interactive Controller
 * Features:
 * 1. Web Audio API Piano Widget (A4 to E5) with accessible keyboard triggers
 * 2. WCAG 2.2 AAA Accessibility Toolbar:
 *    - Theme Toggler (Light, Dark, High-Contrast)
 *    - Dyslexia-Friendly Typeface Toggle
 *    - Reading Guide / Focus Mask Toggle
 *    - Text Size Increment / Reset
 * 3. Step-by-Step Guided Lesson Matcher Form with prefilled WhatsApp & Mailto output
 * 4. Smooth Focus Management & Keyboard Accessible Back-to-Top Button
 */

(function () {
  'use strict';

  // ==========================================
  // 1. Accessibility Toolbar & State
  // ==========================================
  const docEl = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const dyslexiaToggle = document.getElementById('dyslexia-toggle');
  const readingGuideToggle = document.getElementById('reading-guide-toggle');
  const readingGuide = document.getElementById('reading-guide');

  // Load saved preferences
  const savedTheme = localStorage.getItem('hwm_theme') || 'light';
  const savedDyslexic = localStorage.getItem('hwm_dyslexic') === 'true';

  if (savedTheme !== 'light') {
    docEl.setAttribute('data-theme', savedTheme);
  }
  if (savedDyslexic) {
    docEl.setAttribute('data-dyslexic', 'true');
    if (dyslexiaToggle) dyslexiaToggle.setAttribute('aria-pressed', 'true');
  }

  // Theme Cycler: Light -> Dark -> High-Contrast
  if (themeToggle) {
    const themes = ['light', 'dark', 'high-contrast'];
    themeToggle.addEventListener('click', () => {
      const current = docEl.getAttribute('data-theme') || 'light';
      const nextIdx = (themes.indexOf(current) + 1) % themes.length;
      const nextTheme = themes[nextIdx];
      if (nextTheme === 'light') {
        docEl.removeAttribute('data-theme');
      } else {
        docEl.setAttribute('data-theme', nextTheme);
      }
      localStorage.setItem('hwm_theme', nextTheme);
      themeToggle.setAttribute('aria-label', `Theme: ${nextTheme}. Click to change`);
    });
  }

  // Dyslexia Mode Toggle
  if (dyslexiaToggle) {
    dyslexiaToggle.addEventListener('click', () => {
      const isDyslexic = docEl.getAttribute('data-dyslexic') === 'true';
      if (isDyslexic) {
        docEl.removeAttribute('data-dyslexic');
        dyslexiaToggle.setAttribute('aria-pressed', 'false');
        localStorage.setItem('hwm_dyslexic', 'false');
      } else {
        docEl.setAttribute('data-dyslexic', 'true');
        dyslexiaToggle.setAttribute('aria-pressed', 'true');
        localStorage.setItem('hwm_dyslexic', 'true');
      }
    });
  }

  // Reading Guide / Ruler Mask Toggle
  if (readingGuideToggle && readingGuide) {
    let guideActive = false;
    readingGuideToggle.addEventListener('click', () => {
      guideActive = !guideActive;
      readingGuide.style.display = guideActive ? 'block' : 'none';
      readingGuideToggle.setAttribute('aria-pressed', guideActive ? 'true' : 'false');
    });

    window.addEventListener('mousemove', (e) => {
      if (guideActive) {
        readingGuide.style.top = `${e.clientY - 24}px`;
      }
    });

    window.addEventListener('touchmove', (e) => {
      if (guideActive && e.touches[0]) {
        readingGuide.style.top = `${e.touches[0].clientY - 24}px`;
      }
    });
  }

  // ==========================================
  // 2. Interactive Web Audio API Piano Widget
  // ==========================================
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Note Frequencies (Full C4 to C5 Chromatic Octave: Naturals & Sharps)
  const noteFrequencies = {
    'C': 261.63,
    'C#': 277.18,
    'D': 293.66,
    'D#': 311.13,
    'E': 329.63,
    'F': 349.23,
    'F#': 369.99,
    'G': 392.00,
    'G#': 415.30,
    'A': 440.00,
    'A#': 466.16,
    'B': 493.88,
    'C5': 523.25
  };

  function playTone(freq) {
    initAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    // Warm piano-like timbre synthesis
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // Dynamic ADSR envelope
    const now = audioCtx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 1.2);
  }

  const pianoKeys = document.querySelectorAll('.piano-key, .piano-key-sharp');
  pianoKeys.forEach((key) => {
    const note = key.getAttribute('data-note');
    const freq = noteFrequencies[note];

    function trigger() {
      key.classList.add('active');
      playTone(freq);
      setTimeout(() => key.classList.remove('active'), 200);
    }

    key.addEventListener('click', trigger);
    key.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger();
      }
    });
  });

  // Keyboard shortcut listener (Natural keys 1-8, Sharps Q, W, E, R, T or standard keys)
  const keyMap = {
    '1': 'C', 'c': 'C',
    'q': 'C#',
    '2': 'D', 'd': 'D',
    'w': 'D#',
    '3': 'E', 'e': 'E',
    '4': 'F', 'f': 'F',
    'r': 'F#',
    '5': 'G', 'g': 'G',
    't': 'G#',
    '6': 'A', 'a': 'A',
    'y': 'A#',
    '7': 'B', 'b': 'B',
    '8': 'C5', 'c5': 'C5'
  };

  window.addEventListener('keydown', (e) => {
    // Ignore when typing in form fields
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
      return;
    }
    const note = keyMap[e.key.toLowerCase()];
    if (note && noteFrequencies[note]) {
      const keyElem = document.querySelector(`[data-note="${note}"]`);
      if (keyElem) {
        keyElem.classList.add('active');
        playTone(noteFrequencies[note]);
        setTimeout(() => keyElem.classList.remove('active'), 200);
      }
    }
  });

  // ==========================================
  // 3. Guided Lesson Matcher Form
  // ==========================================
  const matcherForm = document.getElementById('lesson-matcher-form');
  const matcherOutput = document.getElementById('matcher-output');
  const mailtoBtn = document.getElementById('matcher-email-btn');
  const whatsappBtn = document.getElementById('matcher-whatsapp-btn');

  if (matcherForm) {
    matcherForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const learner = matcherForm.querySelector('input[name="learner"]:checked')?.value || 'Not specified';
      const experience = matcherForm.querySelector('select[name="experience"]')?.value || 'Beginner';
      const goals = Array.from(matcherForm.querySelectorAll('input[name="goals"]:checked')).map(el => el.value);
      const accessibility = Array.from(matcherForm.querySelectorAll('input[name="accessibility"]:checked')).map(el => el.value);
      const name = matcherForm.querySelector('input[name="name"]')?.value || '';
      const notes = matcherForm.querySelector('textarea[name="notes"]')?.value || '';

      const summaryText = 
`Hello Hannah,

I would like to enquire about piano tuition:
- Student Name / Contact: ${name || 'Prospective Student'}
- Learner Profile: ${learner}
- Experience Level: ${experience}
- Primary Goals: ${goals.length ? goals.join(', ') : 'Fun & Foundation'}
- Accessibility / SEN / BSL needs: ${accessibility.length ? accessibility.join(', ') : 'None specified'}
- Additional Notes: ${notes || 'Looking forward to hearing from you.'}

Thank you!`;

      // Update Buttons
      if (mailtoBtn) {
        const subject = encodeURIComponent(`Piano Tuition Enquiry - ${name || 'New Student'}`);
        const body = encodeURIComponent(summaryText);
        mailtoBtn.href = `mailto:info@hannahwattsmusic.co.uk?subject=${subject}&body=${body}`;
      }

      if (whatsappBtn) {
        const waText = encodeURIComponent(summaryText);
        whatsappBtn.href = `https://wa.me/447513885245?text=${waText}`;
      }

      if (matcherOutput) {
        matcherOutput.style.display = 'block';
        matcherOutput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  // ==========================================
  // 4. Back to Top Accessible Button
  // ==========================================
  const backToTopBtn = document.getElementById('btn-back-to-top');

  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopBtn.style.display = 'inline-flex';
      } else {
        backToTopBtn.style.display = 'none';
      }
    }, { passive: true });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const mainHeader = document.getElementById('page-top') || document.querySelector('h1');
      if (mainHeader) {
        mainHeader.setAttribute('tabindex', '-1');
        mainHeader.focus();
      }
    });
  }

})();
