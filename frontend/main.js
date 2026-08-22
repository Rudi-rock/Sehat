import { animate, stagger } from 'motion';

// =========================================================================
// 1. PARTICLES INITIALIZATION
// =========================================================================
const pc = document.getElementById('ptcl');
if (pc) {
  for (let i = 0; i < 25; i++) {
    const d = document.createElement('div');
    d.className = 'p';
    d.style.cssText = `left:${Math.random() * 100}%;animation-duration:${5 + Math.random() * 8}s;animation-delay:${Math.random() * 8}s`;
    pc.appendChild(d);
  }
}

// =========================================================================
// 2. SIGNATURE "QR ASSEMBLY" OPENING SEQUENCE
// =========================================================================
let sequenceEnded = false;
let animationTimeouts = [];

function registerTimeout(fn, delay) {
  const id = setTimeout(() => {
    if (!sequenceEnded) fn();
  }, delay);
  animationTimeouts.push(id);
  return id;
}

/**
 * Dynamically extract 21x21 QR module grid from the inline SVG
 */
function extractQrModulesFromSvg() {
  const svg = document.querySelector('.c-qr .qr-svg');
  if (!svg) return [];

  const grid = Array.from({ length: 21 }, () => Array(21).fill(false));
  const rects = svg.querySelectorAll('rect');

  rects.forEach((rect) => {
    const rx = parseInt(rect.getAttribute('x') || '0', 10);
    const ry = parseInt(rect.getAttribute('y') || '0', 10);
    const rw = parseInt(rect.getAttribute('width') || '1', 10);
    const rh = parseInt(rect.getAttribute('height') || '1', 10);
    
    // Case-insensitive & format-safe white cutout check
    const fill = (rect.getAttribute('fill') || '').trim().toLowerCase();
    const isWhite = fill === '#fff' || fill === '#ffffff' || fill === 'white' || fill === 'rgb(255,255,255)';

    for (let y = ry; y < ry + rh; y++) {
      for (let x = rx; x < rx + rw; x++) {
        if (x < 21 && y < 21) {
          grid[y][x] = !isWhite;
        }
      }
    }
  });

  const modules = [];
  for (let y = 0; y < 21; y++) {
    for (let x = 0; x < 21; x++) {
      if (grid[y][x]) {
        let type = 'data';
        if (x < 7 && y < 7) type = 'finder-tl';
        else if (x >= 14 && y < 7) type = 'finder-tr';
        else if (x < 7 && y >= 14) type = 'finder-bl';

        // Euclidean distance from center module (10, 10)
        const distFromCenter = Math.hypot(x - 10, y - 10);
        modules.push({ x, y, type, distFromCenter });
      }
    }
  }

  // Sort ascending: inner modules arrive first, outer modules arrive last
  return modules.sort((a, b) => a.distFromCenter - b.distFromCenter);
}

/**
 * Hero Entrance Trigger (Reused for normal completion & instant skip)
 */
function revealHero(instant = false) {
  const badge = document.getElementById('heroBadge');
  const subtitle = document.getElementById('heroSubtitle');
  const scrollHint = document.getElementById('heroScrollHint');

  if (instant) {
    document.querySelectorAll('.hero-word').forEach((w) => {
      w.style.opacity = '1';
      w.style.transform = 'translateY(0px)';
    });
    if (badge) { badge.style.opacity = '1'; badge.style.transform = 'translateY(0px)'; }
    if (subtitle) { subtitle.style.opacity = '1'; subtitle.style.transform = 'translateY(0px)'; }
    if (scrollHint) { scrollHint.style.opacity = '1'; scrollHint.style.transform = 'translateY(0px)'; }
    return;
  }

  // Hero Words Stagger
  animate(
    '.hero-word',
    { opacity: [0, 1], transform: ['translateY(36px)', 'translateY(0px)'] },
    { delay: stagger(0.14), duration: 0.85, easing: [0.16, 1, 0.3, 1] }
  );

  // Follow-up hero elements fade-in
  registerTimeout(() => {
    if (badge) animate(badge, { opacity: [0, 1], transform: ['translateY(12px)', 'translateY(0px)'] }, { duration: 0.5 });
    if (subtitle) animate(subtitle, { opacity: [0, 1], transform: ['translateY(16px)', 'translateY(0px)'] }, { duration: 0.6, delay: 0.1 });
    if (scrollHint) animate(scrollHint, { opacity: [0, 1], transform: ['translateY(12px)', 'translateY(0px)'] }, { duration: 0.5, delay: 0.2 });
  }, 350);
}

/**
 * Idempotent Skip Controller
 */
function skipOpeningAnimation() {
  if (sequenceEnded) return;
  sequenceEnded = true;

  // Clear all pending timeouts
  animationTimeouts.forEach((t) => clearTimeout(t));
  animationTimeouts = [];

  // Remove skip listeners
  window.removeEventListener('scroll', skipOpeningAnimation);
  window.removeEventListener('click', skipOpeningAnimation);
  window.removeEventListener('keydown', skipOpeningAnimation);

  // Remove assembly stage immediately
  const stageEl = document.getElementById('qrAssemblyStage');
  if (stageEl) stageEl.remove();

  // Instant snap to hero end-state
  revealHero(true);
}

// Bind skip listeners
window.addEventListener('scroll', skipOpeningAnimation, { once: true, passive: true });
window.addEventListener('click', skipOpeningAnimation, { once: true });
window.addEventListener('keydown', skipOpeningAnimation, { once: true });

/**
 * Run the 5-Phase QR Assembly Animation
 */
function initQrAssembly() {
  const container = document.getElementById('qrAssemblyContainer');
  const stageEl = document.getElementById('qrAssemblyStage');
  if (!container || !stageEl) {
    revealHero(false);
    return;
  }

  const modules = extractQrModulesFromSvg();
  if (modules.length === 0) {
    skipOpeningAnimation();
    return;
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const moduleSize = 10; // 21 * 10 = 210px grid

  const dotElements = [];

  // Phase 1 (0.0s - 0.3s): Spawn dots at random viewport positions
  modules.forEach((mod) => {
    const dot = document.createElement('div');
    dot.className = `qr-dot ${mod.type}`;
    
    // Target position inside 210x210 container (centered)
    const targetX = mod.x * moduleSize + moduleSize / 2;
    const targetY = mod.y * moduleSize + moduleSize / 2;

    // Random spawn position relative to container center
    const startX = (Math.random() * vw - vw / 2) + 105;
    const startY = (Math.random() * vh - vh / 2) + 105;

    dot.style.left = `${startX}px`;
    dot.style.top = `${startY}px`;
    dot.style.opacity = '0.15';
    dot.style.transform = 'translate(-50%, -50%) scale(0.7)';

    container.appendChild(dot);
    dotElements.push({ el: dot, mod, targetX, targetY, startX, startY });
  });

  // Phase 2 (0.3s - 1.4s): Animate dots toward target QR module coordinates
  registerTimeout(() => {
    dotElements.forEach((item, index) => {
      const delay = index * 0.0055;
      const midCurveX = (item.startX + item.targetX) / 2 + (Math.random() * 40 - 20);
      const midCurveY = (item.startY + item.targetY) / 2 + (Math.random() * 40 - 20);

      animate(
        item.el,
        {
          left: [`${item.startX}px`, `${midCurveX}px`, `${item.targetX}px`],
          top: [`${item.startY}px`, `${midCurveY}px`, `${item.targetY}px`],
          opacity: [0.15, 0.8, 1],
          transform: ['translate(-50%, -50%) scale(0.7)', 'translate(-50%, -50%) scale(1.15)', 'translate(-50%, -50%) scale(1)']
        },
        {
          delay,
          duration: 0.75,
          easing: [0.22, 1, 0.36, 1]
        }
      );
    });
  }, 300);

  // Phase 3 (1.4s - 1.7s): Assembled QR shape pulse
  registerTimeout(() => {
    animate(
      container,
      { transform: ['translate(-50%, -50%) scale(1)', 'translate(-50%, -50%) scale(1.05)', 'translate(-50%, -50%) scale(1)'] },
      { duration: 0.3, easing: 'ease-in-out' }
    );
  }, 1400);

  // Phase 4 (1.7s - 2.1s): Corner finders disperse outward & center dots dissolve
  registerTimeout(() => {
    dotElements.forEach((item) => {
      let disperseX = 0;
      let disperseY = 0;
      let disperseScale = 0.4;

      if (item.mod.type === 'finder-tl') {
        disperseX = -55;
        disperseY = -55;
        disperseScale = 1.3;
      } else if (item.mod.type === 'finder-tr') {
        disperseX = 55;
        disperseY = -55;
        disperseScale = 1.3;
      } else if (item.mod.type === 'finder-bl') {
        disperseX = -55;
        disperseY = 55;
        disperseScale = 1.3;
      }

      animate(
        item.el,
        {
          transform: [
            'translate(-50%, -50%) scale(1)',
            `translate(calc(-50% + ${disperseX}px), calc(-50% + ${disperseY}px)) scale(${disperseScale})`
          ],
          opacity: [1, 0]
        },
        {
          duration: 0.38,
          easing: [0.16, 1, 0.3, 1]
        }
      );
    });
  }, 1720);

  // Phase 5 (2.1s - 2.6s): Clean up stage node from DOM and trigger hero headline reveal
  registerTimeout(() => {
    if (stageEl && stageEl.parentNode) {
      stageEl.remove();
    }
    revealHero(false);
  }, 2100);
}

window.addEventListener('DOMContentLoaded', () => {
  initQrAssembly();
});

// =========================================================================
// 3. CUSTOM CURSOR (DOT + 0.18 LERPED RING)
// =========================================================================
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let ringX = mouseX;
let ringY = mouseY;

const isTouchDevice = window.matchMedia('(pointer: coarse), (max-width: 768px)').matches;

if (!isTouchDevice && cursorDot && cursorRing) {
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
  }, { passive: true });

  const hoverTargets = document.querySelectorAll('a, button, .card-3d, .feat-item, .nav-btn');
  hoverTargets.forEach((target) => {
    target.addEventListener('mouseenter', () => {
      cursorRing.classList.add('active');
    });
    target.addEventListener('mouseleave', () => {
      cursorRing.classList.remove('active');
    });
  });

  function updateCursor() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;
    requestAnimationFrame(updateCursor);
  }
  requestAnimationFrame(updateCursor);
}

// =========================================================================
// 4. MAGNETIC HOVER EFFECT ON NAV LINKS & BUTTONS
// =========================================================================
if (!isTouchDevice) {
  const magneticElements = document.querySelectorAll('.magnetic');
  magneticElements.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) * 0.28;
      const deltaY = (e.clientY - centerY) * 0.28;

      animate(el, { transform: `translate(${deltaX}px, ${deltaY}px)` }, { type: 'spring', stiffness: 350, damping: 20 });
    });

    el.addEventListener('mouseleave', () => {
      animate(el, { transform: 'translate(0px, 0px)' }, { type: 'spring', stiffness: 300, damping: 20 });
    });
  });
}

// =========================================================================
// 5. ACCESSIBLE MOBILE MENU DRAWER CONTROLLER
// =========================================================================
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenuCloseBtn = document.getElementById('mobileMenuCloseBtn');
const mobileDrawer = document.getElementById('mobileDrawer');

function toggleMobileDrawer(open) {
  if (!mobileDrawer) return;
  if (open) {
    mobileDrawer.classList.add('open');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflowY = 'hidden'; // prevent background scrolling
  } else {
    mobileDrawer.classList.remove('open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflowY = '';
  }
}

mobileMenuBtn?.addEventListener('click', () => toggleMobileDrawer(true));
mobileMenuCloseBtn?.addEventListener('click', () => toggleMobileDrawer(false));

// Close on mobile link click
document.querySelectorAll('.mobile-nav-link, #mobileDrawer .nav-btn').forEach((link) => {
  link.addEventListener('click', () => toggleMobileDrawer(false));
});

// Close on Escape key
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileDrawer?.classList.contains('open')) {
    toggleMobileDrawer(false);
  }
});

// =========================================================================
// 6. DYNAMIC COPYRIGHT YEAR
// =========================================================================
const copyrightEl = document.getElementById('copyrightYear');
if (copyrightEl) {
  copyrightEl.textContent = new Date().getFullYear().toString();
}

// =========================================================================
// 7. LERP-SMOOTHED SCROLL ENGINE & 3D CARD ROTATION
// =========================================================================
const stage = document.getElementById('stage');
const hero = document.getElementById('hero');
const scene = document.getElementById('scene');
const card = document.getElementById('card3d');
const cardSheen = document.getElementById('cardSheen');
const tc = document.getElementById('textCol');
const pb = document.getElementById('pb');

const scenes = [
  { tag: 'Your Health Identity', title: 'One card.<br/><em>One scan.</em><br/>Instant access.', desc: 'Every rural patient gets a Sehat QR health ID. Doctors scan it and critical info appears instantly — blood group, allergies, contacts — even without internet.' },
  { tag: 'Emergency Mode', title: 'No login.<br/><em>No internet.</em><br/>Just answers.', desc: 'In an emergency every second counts. Sehat shows critical data immediately when the QR is scanned. Zero friction. Zero delay.' },
  { tag: 'Private Mode', title: 'Full history.<br/><em>Your consent.</em><br/>Always secure.', desc: 'Complete medical records — prescriptions, lab reports, treatment history — protected behind OTP consent. You decide who gets access. Every time.' },
  { tag: 'Built for Bharat', title: 'Works in<br/><em>every village.</em><br/>Offline-first.', desc: 'Designed from day one for areas with no connectivity. ASHA workers register patients offline. Data syncs when internet is available.' },
];

let curScene = -1;
let targetScroll = window.scrollY;
let smoothedScroll = window.scrollY;
let qrAnimated = false;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

window.addEventListener('scroll', () => {
  targetScroll = window.scrollY;
}, { passive: true });

function renderScrollFrame() {
  smoothedScroll = lerp(smoothedScroll, targetScroll, 0.12);

  if (stage) {
    const stageH = stage.offsetHeight - window.innerHeight;
    const p = Math.max(0, Math.min(1, smoothedScroll / stageH));

    if (pb) {
      pb.style.width = (p * 100) + '%';
    }

    if (hero) {
      const hOp = Math.max(0, 1 - p * 6);
      hero.style.opacity = hOp;
      hero.style.transform = `translateY(${-p * 40}px)`;
    }

    if (scene) {
      const sOp = p < 0.05 ? 0 : Math.min(1, (p - 0.05) * 7);
      scene.style.opacity = sOp;
    }

    if (p >= 0.04 && card) {
      let ry = 0, rx = 0, sc = 1, ty = 0;

      if (p < 0.2) {
        const t = p / 0.2;
        ry = lerp(0, 25, t);
        rx = lerp(0, -6, t);
        sc = lerp(1, 1.06, t);
      } else if (p < 0.45) {
        const t = (p - 0.2) / 0.25;
        ry = lerp(25, 180, t);
        rx = lerp(-6, 0, t);
        sc = lerp(1.06, 1.12, t);
      } else if (p < 0.7) {
        const t = (p - 0.45) / 0.25;
        ry = lerp(180, 360, t);
        rx = lerp(0, -8, t);
        sc = lerp(1.12, 1.06, t);
      } else {
        const t = (p - 0.7) / 0.3;
        ry = lerp(360, 375, t);
        rx = lerp(-8, -2, t);
        sc = lerp(1.06, 1, t);
        ty = lerp(0, -8, t);
      }

      card.style.transform = `rotateY(${ry}deg) rotateX(${rx}deg) scale(${sc}) translateY(${ty}px)`;

      if (cardSheen) {
        const sheenProgress = (p / 0.5) * 200 - 50;
        cardSheen.style.transform = `translateX(${sheenProgress}%)`;
      }

      if (ry >= 120 && !qrAnimated) {
        qrAnimated = true;
        const qrRects = document.querySelectorAll('.back-qr-svg rect');
        if (qrRects.length > 0) {
          animate(
            qrRects,
            { opacity: [0, 1], transform: ['scale(0.3)', 'scale(1)'] },
            { delay: stagger(0.012), duration: 0.22, easing: 'ease-out' }
          );
        }
      } else if (ry < 90) {
        qrAnimated = false;
      }

      const si = Math.min(scenes.length - 1, Math.floor(p * scenes.length * 1.3));
      if (si !== curScene && si < scenes.length && tc) {
        curScene = si;
        tc.classList.remove('show');
        setTimeout(() => {
          const sTagEl = document.getElementById('sTag');
          const sTitleEl = document.getElementById('sTitle');
          const sDescEl = document.getElementById('sDesc');
          if (sTagEl) sTagEl.textContent = scenes[si].tag;
          if (sTitleEl) sTitleEl.innerHTML = scenes[si].title;
          if (sDescEl) sDescEl.textContent = scenes[si].desc;
          tc.classList.add('show');
        }, 180);
      }
    } else if (p < 0.04) {
      curScene = -1;
    }
  }

  requestAnimationFrame(renderScrollFrame);
}
requestAnimationFrame(renderScrollFrame);

setTimeout(() => {
  if (tc) tc.classList.add('show');
}, 700);

// =========================================================================
// 8. INTERSECTION OBSERVER STAGGER REVEAL FOR BELOW-FOLD SECTIONS
// =========================================================================
function createObserver(targetSelector, animateSelector, staggerDelay = 0.09) {
  const target = document.querySelector(targetSelector);
  if (!target) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const items = target.querySelectorAll(animateSelector);
        if (items.length > 0) {
          animate(
            items,
            { opacity: [0, 1], transform: ['translateY(24px)', 'translateY(0px)'] },
            { delay: stagger(staggerDelay), duration: 0.7, easing: [0.16, 1, 0.3, 1] }
          );
        }
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  observer.observe(target);
}

createObserver('.stats', '.s-block', 0.08);
createObserver('.feat-grid', '.feat-item', 0.07);
createObserver('.quote-wrap', '.q-text, .q-by', 0.12);
