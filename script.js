/* ================================================
   BRAVE FEELINGS LAB
   Calm the Storm — An Anger Reset Lab for Kids
   script.js  |  Created by Benne Hart
   ================================================ */

'use strict';

const PASSWORD        = "Isaiah41Verse10$";
const ACCESS_KEY      = "bfl_calm_the_storm_access";
const SESSION_KEY     = "bfl_calm_the_storm_session";
const TOTAL_SCREENS   = 30;

let currentScreen = 1;
let sessionData   = {};
let breathTimer   = null;
let countMax      = 0;

/* ─────────────────────────────────────
   INIT
───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadSession();
  checkAccess();
  setupPassword();
});

function checkAccess() {
  if (localStorage.getItem(ACCESS_KEY) === 'granted') {
    showApp();
  }
}

function setupPassword() {
  const btn   = document.getElementById('password-btn');
  const input = document.getElementById('password-input');
  btn.addEventListener('click', checkPassword);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') checkPassword(); });
}

/* ─────────────────────────────────────
   PASSWORD
───────────────────────────────────── */
function checkPassword() {
  const val = document.getElementById('password-input').value.trim();
  const err = document.getElementById('password-error');

  if (val === PASSWORD) {
    localStorage.setItem(ACCESS_KEY, 'granted');
    err.classList.add('hidden');
    showApp();
  } else {
    err.classList.remove('hidden');
    document.getElementById('password-input').value = '';
    document.getElementById('password-input').focus();
  }
}

function showApp() {
  document.getElementById('screen-password').classList.add('hidden');
  const app = document.getElementById('app');
  app.classList.remove('hidden');
  const pbw = document.getElementById('progress-bar-wrap');
  pbw.classList.remove('hidden');
  showScreen(currentScreen);
  updateProgress();
}

/* ─────────────────────────────────────
   NAVIGATION
───────────────────────────────────── */
function goNext() {
  if (currentScreen < TOTAL_SCREENS) {
    currentScreen++;
    saveSession();
    showScreen(currentScreen);
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function goBack() {
  if (currentScreen > 1) {
    currentScreen--;
    saveSession();
    showScreen(currentScreen);
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function showScreen(num) {
  document.querySelectorAll('.screen').forEach(el => {
    el.classList.add('hidden');
  });
  const target = document.getElementById('screen-' + num);
  if (target) {
    target.classList.remove('hidden');
    restoreScreen(num);
  }
}

function updateProgress() {
  const pct = Math.round(((currentScreen - 1) / (TOTAL_SCREENS - 1)) * 100);
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-text').textContent = 'Screen ' + currentScreen + ' of ' + TOTAL_SCREENS;
  document.getElementById('progress-pct').textContent  = pct + '%';
}

/* ─────────────────────────────────────
   CHOICE BUTTONS
───────────────────────────────────── */
function pick(btn, group, value, screenNum) {
  const grid = btn.closest('.choice-grid');
  if (grid) grid.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');

  sessionData[group] = value;
  saveSession();

  // Show conditional next button
  const nb = document.getElementById('next-' + screenNum);
  if (nb) nb.classList.remove('hidden');

  // Screen 18 feedback
  if (group === 'alex-choice') showFeedback18(value);
}

function showFeedback18(value) {
  const box = document.getElementById('fb-18');
  if (!box) return;
  const msgs = {
    'yell':         '😬 Yelling back usually makes things worse and can hurt the relationship.',
    'calm-breath':  '✅ Great choice! A calm breath and a clear response keeps things from escalating.',
    'storm-off':    '😬 Storming off with a slam tends to escalate things. Stepping away calmly is better.',
    'quiet-moment': '✅ Smart move! A calm step away gives both people space to reset.'
  };
  box.textContent = msgs[value] || '';
  box.classList.remove('hidden');
}

/* ─────────────────────────────────────
   CHECKBOXES
───────────────────────────────────── */
document.addEventListener('change', e => {
  const cb = e.target;
  if (cb.type !== 'checkbox') return;
  const group = cb.dataset.group;
  if (!group) return;
  if (!Array.isArray(sessionData[group])) sessionData[group] = [];
  if (cb.checked) {
    if (!sessionData[group].includes(cb.value)) sessionData[group].push(cb.value);
  } else {
    sessionData[group] = sessionData[group].filter(v => v !== cb.value);
  }
  saveSession();
});

/* ─────────────────────────────────────
   TEXT INPUTS — auto-save on input
───────────────────────────────────── */
document.addEventListener('input', e => {
  const el = e.target;
  if ((el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') && el.id && el.id !== 'password-input') {
    sessionData[el.id] = el.value;
    saveSession();
  }
});

/* ─────────────────────────────────────
   COUNT TO FIVE
───────────────────────────────────── */
function tapNum(btn, num) {
  btn.classList.add('tapped');
  if (num > countMax) countMax = num;
  sessionData['count-max'] = countMax;
  saveSession();
  if (countMax >= 5) {
    const msg = document.getElementById('count-done');
    if (msg) msg.classList.remove('hidden');
  }
}

/* ─────────────────────────────────────
   CERTIFICATE
───────────────────────────────────── */
function setCertName(val) {
  sessionData['cert-name'] = val;
  saveSession();
  const display = document.getElementById('cert-name-display');
  if (display) display.textContent = val.trim() || 'Storm Calmer';
}

/* ─────────────────────────────────────
   BREATHING TOOLS
───────────────────────────────────── */
function doBreath(circleId, labelId) {
  const c = document.getElementById(circleId);
  const l = document.getElementById(labelId);
  if (!c || !l) return;
  if (breathTimer) clearTimeout(breathTimer);

  c.className = 'breath-circle';
  l.textContent = 'Breathe in... (4s)';
  c.classList.add('expanding');

  breathTimer = setTimeout(() => {
    c.className = 'breath-circle holding';
    l.textContent = 'Hold... (2s)';

    breathTimer = setTimeout(() => {
      c.className = 'breath-circle contracting';
      l.textContent = 'Breathe out... (4s)';

      breathTimer = setTimeout(() => {
        c.className = 'breath-circle';
        l.textContent = 'Well done! Go again?';
      }, 4000);
    }, 2000);
  }, 4000);
}

function doLongExhale(circleId, labelId) {
  const c = document.getElementById(circleId);
  const l = document.getElementById(labelId);
  if (!c || !l) return;
  if (breathTimer) clearTimeout(breathTimer);

  c.className = 'breath-circle';
  l.textContent = 'Breathe in... (4s)';
  c.classList.add('expanding');

  breathTimer = setTimeout(() => {
    c.className = 'breath-circle long-out';
    l.textContent = 'Breathe out slowly... (6s)';

    breathTimer = setTimeout(() => {
      c.className = 'breath-circle';
      l.textContent = 'Well done! Go again?';
    }, 6000);
  }, 4000);
}

/* ─────────────────────────────────────
   RESTART
───────────────────────────────────── */
function restartProgram() {
  if (confirm('Start the program over from the beginning?')) {
    currentScreen = 1;
    showScreen(1);
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/* ─────────────────────────────────────
   LOCAL STORAGE
───────────────────────────────────── */
function saveSession() {
  sessionData._screen = currentScreen;
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData)); } catch (_) {}
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      sessionData = JSON.parse(raw);
      if (sessionData._screen && sessionData._screen >= 1 && sessionData._screen <= TOTAL_SCREENS) {
        currentScreen = sessionData._screen;
      }
    }
  } catch (_) { sessionData = {}; }
}

/* ─────────────────────────────────────
   RESTORE SCREEN STATE
───────────────────────────────────── */
function restoreScreen(num) {
  const screen = document.getElementById('screen-' + num);
  if (!screen) return;

  // Restore text inputs and textareas
  screen.querySelectorAll('input[id], textarea[id]').forEach(el => {
    if (sessionData[el.id] !== undefined) el.value = sessionData[el.id];
  });

  // Restore checkboxes
  screen.querySelectorAll('input[type="checkbox"][data-group]').forEach(cb => {
    const grp = cb.dataset.group;
    if (Array.isArray(sessionData[grp]) && sessionData[grp].includes(cb.value)) {
      cb.checked = true;
    }
  });

  // Restore choice selections
  screen.querySelectorAll('.choice-btn').forEach(btn => {
    const oc = btn.getAttribute('onclick') || '';
    const m  = oc.match(/pick\(this,'([^']+)','([^']+)','(\d+)'\)/);
    if (m && sessionData[m[1]] === m[2]) {
      btn.classList.add('selected');
      const nb = document.getElementById('next-' + m[3]);
      if (nb) nb.classList.remove('hidden');
      if (m[1] === 'alex-choice') showFeedback18(m[2]);
    }
  });

  // Restore count
  if (num === 12) {
    countMax = sessionData['count-max'] || 0;
    if (countMax >= 5) {
      const msg = document.getElementById('count-done');
      if (msg) msg.classList.remove('hidden');
      document.querySelectorAll('#screen-12 .count-btn').forEach(b => b.classList.add('tapped'));
    }
  }

  // Restore cert name
  if (num === 30) {
    const saved   = sessionData['cert-name'] || '';
    const display = document.getElementById('cert-name-display');
    const input   = document.getElementById('cert-name-input');
    if (display) display.textContent = saved.trim() || 'Storm Calmer';
    if (input)   input.value = saved;
  }
}
