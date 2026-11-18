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
  // 1. Accessibility Preferences & Controller (WCAG 2.2 AAA & EAA)
  // ==========================================
  const docEl = document.documentElement;
  const a11yCollapseBtn = document.getElementById('a11y-collapse-toggle');
  const a11yToolbar = document.querySelector('.a11y-toolbar');
  const a11yStatusHint = document.getElementById('a11y-status-hint');
  const a11yCollapseIcon = document.getElementById('a11y-collapse-icon');
  const themeToggle = document.getElementById('theme-toggle');
  const dyslexiaToggle = document.getElementById('dyslexia-toggle');
  const textSizeToggle = document.getElementById('text-size-toggle');
  const spacingToggle = document.getElementById('spacing-toggle');
  const motionToggle = document.getElementById('motion-toggle');
  const a11yAnnouncer = document.getElementById('a11y-announcer');

  function announce(msg) {
    if (a11yAnnouncer) {
      a11yAnnouncer.textContent = '';
      setTimeout(() => { a11yAnnouncer.textContent = msg; }, 50);
    }
  }

  // Load saved preferences
  const savedA11yCollapsed = localStorage.getItem('hwm_a11y_collapsed') === 'true';
  const savedTheme = localStorage.getItem('hwm_theme') || 'light';
  const savedDyslexic = localStorage.getItem('hwm_dyslexic') === 'true';
  const savedTextSize = localStorage.getItem('hwm_text_size') || 'normal';
  const savedSpacing = localStorage.getItem('hwm_spacing') === 'true';
  const savedMotion = localStorage.getItem('hwm_motion') === 'reduced';

  // Restore toolbar collapsed/minimized state
  if (savedA11yCollapsed && a11yToolbar && a11yCollapseBtn) {
    a11yToolbar.classList.add('a11y-minimized');
    a11yCollapseBtn.setAttribute('aria-expanded', 'false');
    a11yCollapseBtn.setAttribute('aria-label', 'Expand accessibility controls panel');
    if (a11yCollapseIcon) a11yCollapseIcon.textContent = '▸';
    if (a11yStatusHint) a11yStatusHint.textContent = '(Click to expand)';
  }

  // Collapse / Minimize Toggle Handler
  if (a11yCollapseBtn && a11yToolbar) {
    a11yCollapseBtn.addEventListener('click', () => {
      const isMinimized = a11yToolbar.classList.toggle('a11y-minimized');
      a11yCollapseBtn.setAttribute('aria-expanded', !isMinimized);
      a11yCollapseBtn.setAttribute('aria-label', isMinimized ? 'Expand accessibility controls panel' : 'Collapse accessibility controls panel');
      if (a11yCollapseIcon) a11yCollapseIcon.textContent = isMinimized ? '▸' : '▾';
      if (a11yStatusHint) a11yStatusHint.textContent = isMinimized ? '(Click to expand)' : '(Click to minimize)';
      localStorage.setItem('hwm_a11y_collapsed', isMinimized);
      announce(isMinimized ? 'Accessibility controls minimized' : 'Accessibility controls expanded');
    });
  }

  if (savedTheme !== 'light') {
    docEl.setAttribute('data-theme', savedTheme);
  }
  if (savedDyslexic) {
    docEl.setAttribute('data-dyslexic', 'true');
    if (dyslexiaToggle) dyslexiaToggle.setAttribute('aria-pressed', 'true');
  }
  if (savedTextSize !== 'normal') {
    docEl.setAttribute('data-text-size', savedTextSize);
    if (textSizeToggle) textSizeToggle.setAttribute('data-current', savedTextSize);
  }
  if (savedSpacing) {
    docEl.setAttribute('data-text-spacing', 'expanded');
    if (spacingToggle) spacingToggle.setAttribute('aria-pressed', 'true');
  }
  if (savedMotion) {
    docEl.setAttribute('data-motion', 'reduced');
    if (motionToggle) motionToggle.setAttribute('aria-pressed', 'true');
  }

  // Theme Cycler: Light -> Dark -> High-Contrast -> Monochrome (EAA Compliant)
  if (themeToggle) {
    const themes = ['light', 'dark', 'high-contrast', 'monochrome'];
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
      const label = `Theme: ${nextTheme}`;
      themeToggle.setAttribute('aria-label', `${label}. Click to cycle theme`);
      announce(`Visual theme updated to ${nextTheme}`);
    });
  }

  // Dyslexia Mode Toggle (Atkinson Hyperlegible / OpenDyslexic)
  if (dyslexiaToggle) {
    dyslexiaToggle.addEventListener('click', () => {
      const isDyslexic = docEl.getAttribute('data-dyslexic') === 'true';
      if (isDyslexic) {
        docEl.removeAttribute('data-dyslexic');
        dyslexiaToggle.setAttribute('aria-pressed', 'false');
        localStorage.setItem('hwm_dyslexic', 'false');
        announce('Dyslexia font disabled');
      } else {
        docEl.setAttribute('data-dyslexic', 'true');
        dyslexiaToggle.setAttribute('aria-pressed', 'true');
        localStorage.setItem('hwm_dyslexic', 'true');
        announce('Dyslexia-friendly font enabled');
      }
    });
  }

  // Text Sizing Cycler (SC 1.4.4 / 1.4.8: Normal -> Large +25% -> X-Large +50%)
  if (textSizeToggle) {
    const textSizes = ['normal', 'large', 'xlarge'];
    textSizeToggle.addEventListener('click', () => {
      const current = docEl.getAttribute('data-text-size') || 'normal';
      const nextIdx = (textSizes.indexOf(current) + 1) % textSizes.length;
      const nextSize = textSizes[nextIdx];
      if (nextSize === 'normal') {
        docEl.removeAttribute('data-text-size');
      } else {
        docEl.setAttribute('data-text-size', nextSize);
      }
      localStorage.setItem('hwm_text_size', nextSize);
      announce(`Text size set to ${nextSize}`);
    });
  }

  // Text Spacing Override (WCAG SC 1.4.12: Letter & Line Spacing)
  if (spacingToggle) {
    spacingToggle.addEventListener('click', () => {
      const isExpanded = docEl.getAttribute('data-text-spacing') === 'expanded';
      if (isExpanded) {
        docEl.removeAttribute('data-text-spacing');
        spacingToggle.setAttribute('aria-pressed', 'false');
        localStorage.setItem('hwm_spacing', 'false');
        announce('Standard text spacing restored');
      } else {
        docEl.setAttribute('data-text-spacing', 'expanded');
        spacingToggle.setAttribute('aria-pressed', 'true');
        localStorage.setItem('hwm_spacing', 'true');
        announce('Expanded text spacing enabled (WCAG SC 1.4.12)');
      }
    });
  }

  // Motion Reducer / Killswitch (WCAG SC 2.3.3: Animation from Interactions)
  if (motionToggle) {
    motionToggle.addEventListener('click', () => {
      const isReduced = docEl.getAttribute('data-motion') === 'reduced';
      if (isReduced) {
        docEl.removeAttribute('data-motion');
        motionToggle.setAttribute('aria-pressed', 'false');
        localStorage.setItem('hwm_motion', 'standard');
        announce('Standard animation enabled');
      } else {
        docEl.setAttribute('data-motion', 'reduced');
        motionToggle.setAttribute('aria-pressed', 'true');
        localStorage.setItem('hwm_motion', 'reduced');
        announce('Animations and smooth motion disabled');
      }
    });
  }

  // Mobile Navigation Drawer Toggle
  const navToggleBtn = document.getElementById('nav-toggle');
  const primaryNavMenu = document.getElementById('primary-nav-menu');

  if (navToggleBtn && primaryNavMenu) {
    navToggleBtn.addEventListener('click', () => {
      const isExpanded = navToggleBtn.getAttribute('aria-expanded') === 'true';
      navToggleBtn.setAttribute('aria-expanded', !isExpanded);
      primaryNavMenu.classList.toggle('nav-open');
    });

    // Close menu when a navigation link is clicked
    primaryNavMenu.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        navToggleBtn.setAttribute('aria-expanded', 'false');
        primaryNavMenu.classList.remove('nav-open');
      });
    });

    // Close menu with Escape key (WCAG 2.1.2 No Keyboard Trap)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && primaryNavMenu.classList.contains('nav-open')) {
        primaryNavMenu.classList.remove('nav-open');
        navToggleBtn.setAttribute('aria-expanded', 'false');
        navToggleBtn.focus();
        announce('Navigation menu closed');
      }
    });
  }

  // ==========================================
  // 2. Interactive Web Audio API Piano Widget
  // ==========================================
  let audioCtx = null;
  let currentOctaveMultiplier = 1.0; // 1.0 = C4-C5; 0.5 = C3-C4 (Bass)

  const octave3Btn = document.getElementById('octave-3-btn');
  const octave4Btn = document.getElementById('octave-4-btn');

  if (octave3Btn && octave4Btn) {
    octave3Btn.addEventListener('click', () => {
      currentOctaveMultiplier = 0.5;
      octave3Btn.setAttribute('aria-pressed', 'true');
      octave4Btn.setAttribute('aria-pressed', 'false');
      announce('Piano register shifted to Lower Bass Octave C3 to C4');
    });

    octave4Btn.addEventListener('click', () => {
      currentOctaveMultiplier = 1.0;
      octave4Btn.setAttribute('aria-pressed', 'true');
      octave3Btn.setAttribute('aria-pressed', 'false');
      announce('Piano register shifted to Standard Octave C4 to C5');
    });
  }

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

    // Optional haptic tap on mobile devices (EAA / Sensory ergonomics)
    if (navigator.vibrate) {
      try { navigator.vibrate(12); } catch (e) {}
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    // Warm piano-like timbre synthesis
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq * currentOctaveMultiplier, audioCtx.currentTime);

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

  const pianoKeys = Array.from(document.querySelectorAll('.piano-keyboard button'));
  pianoKeys.forEach((key, index) => {
    const note = key.getAttribute('data-note');

    function trigger() {
      key.classList.add('active');
      const baseFreq = noteFrequencies[note];
      if (baseFreq) {
        playTone(baseFreq);
      }
      setTimeout(() => key.classList.remove('active'), 200);
    }

    key.addEventListener('click', trigger);

    // Roving Tabindex & Arrow Navigation (WCAG 2.1.1 / 2.4.3 APG Toolbar Pattern)
    key.addEventListener('keydown', (e) => {
      let targetIndex = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        targetIndex = (index + 1) % pianoKeys.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        targetIndex = (index - 1 + pianoKeys.length) % pianoKeys.length;
      } else if (e.key === 'Home') {
        targetIndex = 0;
      } else if (e.key === 'End') {
        targetIndex = pianoKeys.length - 1;
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger();
        return;
      }

      if (targetIndex !== -1) {
        e.preventDefault();
        pianoKeys[index].setAttribute('tabindex', '-1');
        pianoKeys[targetIndex].setAttribute('tabindex', '0');
        pianoKeys[targetIndex].focus();
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
  const copyBtn = document.getElementById('matcher-copy-btn');
  let currentEnquiryText = '';

  if (matcherForm) {
    matcherForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const learner = matcherForm.querySelector('input[name="learner"]:checked')?.value || 'Not specified';
      const experience = matcherForm.querySelector('select[name="experience"]')?.value || 'Beginner';
      const goals = Array.from(matcherForm.querySelectorAll('input[name="goals"]:checked')).map(el => el.value);
      const accessibility = Array.from(matcherForm.querySelectorAll('input[name="accessibility"]:checked')).map(el => el.value);
      const name = matcherForm.querySelector('input[name="name"]')?.value || '';
      const notes = matcherForm.querySelector('textarea[name="notes"]')?.value || '';

      currentEnquiryText = 
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
        const body = encodeURIComponent(currentEnquiryText);
        mailtoBtn.href = `mailto:info@hannahwattsmusic.co.uk?subject=${subject}&body=${body}`;
      }

      if (whatsappBtn) {
        const waText = encodeURIComponent(currentEnquiryText);
        whatsappBtn.href = `https://wa.me/447513885245?text=${waText}`;
      }

      if (matcherOutput) {
        matcherOutput.style.display = 'block';
        matcherOutput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        matcherOutput.focus();
        announce('Your personalized lesson enquiry has been generated below.');
      }
    });
  }

  // Copy Enquiry to Clipboard Button
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (!currentEnquiryText) return;
      navigator.clipboard.writeText(currentEnquiryText).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ Copied to Clipboard!';
        announce('Enquiry note copied to clipboard');
        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 3000);
      }).catch(() => {
        announce('Unable to copy automatically. Please copy text manually.');
      });
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
