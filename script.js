/* ──────────────────────────────────────────────────────────────
   RW x GEMS OtoColor — script.js
   Ultra-responsive: Mouse + Touch slider, Demo engine, Eye tracking
   ────────────────────────────────────────────────────────────── */

'use strict';

document.addEventListener('DOMContentLoaded', () => {




  /* ─── INTEGRATED DEMO ENGINE ─── */

  const DEMO_STEPS = [
    'Étape 1/7 — Analyse des keyframes locales...',
    'Étape 2/7 — Assignation des tags sémantiques (#Veste, #Peau)...',
    'Étape 3/7 — Entraînement Few-Shot Learning (GPU)...',
    'Étape 4/7 — Propagation sur les in-betweens...',
    'Étape 5/7 — Fermeture des gaps & contrôle anti-flickering...',
    'Étape 6/7 — Vérification de cohérence colorimétrique...',
    'Étape 7/7 — ✓ Séquence prête pour export!'
  ];

  const startDemoBtn   = document.getElementById('start-demo');
  const statusText     = document.getElementById('demo-status-text');
  const progressFill   = document.getElementById('demo-progress-fill');
  const progressPct    = document.getElementById('demo-pct');
  const progressWrap   = document.getElementById('demo-progress-wrap');
  const scanLine       = document.getElementById('scan-line');

  const parts = {
    body: document.getElementById('char-body'),
    vest: document.getElementById('char-vest'),
    head: document.getElementById('char-head'),
    legs: document.getElementById('char-legs')
  };

  let isDemoRunning = false;
  let autoRestartTimer = null;

  function updateProgress(value) {
    if (progressFill) progressFill.style.width = `${value}%`;
    if (progressPct) progressPct.textContent = `${value}%`;
    if (progressWrap) progressWrap.setAttribute('aria-valuenow', value);
  }

  function resetDemo() {
    updateProgress(0);
    if (scanLine) scanLine.style.display = 'block';
    if (statusText) statusText.textContent = 'Mode Local : En attente...';

    Object.values(parts).forEach(p => {
      if (p) {
        p.style.fill   = 'transparent';
        p.style.stroke = 'white';
        p.style.filter = 'none';
        p.style.transition = '';
      }
    });
  }

  function runColorDemo(isAuto = false) {
    if (isDemoRunning) return;
    isDemoRunning = true;
    if (autoRestartTimer) { clearTimeout(autoRestartTimer); autoRestartTimer = null; }

    if (startDemoBtn) {
      startDemoBtn.disabled = true;
      startDemoBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
        </svg>
        IA en cours...`;
    }

    resetDemo();

    let step = 0;
    const totalSteps = DEMO_STEPS.length;

    // Enable smooth transitions for character parts
    Object.values(parts).forEach(p => {
      if (p) p.style.transition = 'fill 0.6s ease, stroke 0.6s ease, filter 0.6s ease';
    });

    const runStep = () => {
      if (step >= totalSteps) {
        if (statusText) statusText.textContent = '✓ Colorisation prête !';
        if (startDemoBtn) {
          startDemoBtn.disabled = false;
          startDemoBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Relancer la démo`;
        }
        if (scanLine) scanLine.style.display = 'none';
        isDemoRunning = false;

        if (isAuto) {
          autoRestartTimer = setTimeout(() => runColorDemo(true), 5000);
        }
        return;
      }

      if (statusText) statusText.textContent = DEMO_STEPS[step];
      const progressValue = Math.round(((step + 1) / totalSteps) * 100);
      updateProgress(progressValue);

      // Progressive visual colorization
      switch (step) {
        case 1:
          if (parts.body) parts.body.style.stroke = 'var(--color-primary)';
          break;
        case 2:
          if (parts.vest) {
            parts.vest.style.fill   = 'var(--color-primary)';
            parts.vest.style.stroke = 'var(--color-primary)';
          }
          break;
        case 3:
          if (parts.head) {
            parts.head.style.fill   = 'var(--color-emerald)';
            parts.head.style.stroke = 'var(--color-emerald)';
          }
          break;
        case 4:
          if (parts.legs) parts.legs.style.stroke = 'var(--color-amber)';
          break;
        case 6:
          Object.values(parts).forEach(p => {
            if (p) p.style.filter = 'drop-shadow(0 0 4px rgba(255,255,255,0.2))';
          });
          break;
      }

      step++;
      setTimeout(runStep, 800);
    };

    runStep();
  }

  if (startDemoBtn) {
    startDemoBtn.addEventListener('click', () => runColorDemo(false));
  }

  // Initial auto-start after short delay
  setTimeout(() => runColorDemo(true), 1800);


  /* ─── BACKGROUND & PANEL COMPARISON — Mouse + Touch ─── */

  const bgComparison = document.getElementById('bgComparison');
  const logoWrapper  = document.getElementById('logoWrapper');
  const logoBlack    = logoWrapper ? logoWrapper.querySelector('.text-black') : null;
  const heroTextPanel = document.getElementById('heroTextPanel');
  const panelPaper   = document.getElementById('panelPaper');

  // Reduced motion check
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function updateVisuals(clientX) {
    const screenWidth = window.innerWidth;
    const xPct = (clientX / screenWidth) * 100;

    // Background slider
    if (bgComparison) {
      bgComparison.style.setProperty('--slider-pos', `${xPct}%`);
    }

    // Logo text reveal (black text revealed on the RIGHT of the divider)
    if (logoWrapper && logoBlack) {
      const rect = logoWrapper.getBoundingClientRect();
      const localX = ((clientX - rect.left) / rect.width) * 100;
      const clamped = Math.max(0, Math.min(100, localX));
      logoBlack.style.clipPath = `polygon(${clamped}% 0, 100% 0, 100% 100%, ${clamped}% 100%)`;
    }

    // Panel paper reveal (paper layer revealed on the RIGHT of the divider)
    if (heroTextPanel && panelPaper) {
      const rect = heroTextPanel.getBoundingClientRect();
      const localX = ((clientX - rect.left) / rect.width) * 100;
      const clamped = Math.max(0, Math.min(100, localX));
      panelPaper.style.clipPath = `polygon(${clamped}% 0, 100% 0, 100% 100%, ${clamped}% 100%)`;
    }
  }

  /* Mouse */
  document.addEventListener('mousemove', (e) => updateVisuals(e.clientX));

  /* Touch — passive for performance, no preventDefault needed */
  document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    if (touch) updateVisuals(touch.clientX);
  }, { passive: true });

  /* Touch start — also trigger on tap */
  document.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    if (touch) updateVisuals(touch.clientX);
  }, { passive: true });

  /* Reset slider to center if user leaves the page/window */
  document.addEventListener('mouseleave', () => {
    if (!prefersReducedMotion) {
      // Optionally animate back to 50% on mouse leave
      // updateVisuals(window.innerWidth / 2);
    }
  });


  /* ─── SCROLL HANDLER (HEADER GLASS EFFECT) ─── */
  const siteHeader = document.querySelector('.site-header');
  
  function handleScroll() {
    if (window.scrollY > 10) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial check


  /* ─── RESIZE HANDLER (debounced for performance) ─── */

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Re-trigger with current slider position to fix layout jumps
      // (no action needed — CSS clamp handles everything)
    }, 150);
  }, { passive: true });

});
