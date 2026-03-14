/* ═══════════════════════════════════════════
   AYANKZ TEST — SCRIPT.JS
═══════════════════════════════════════════ */

// ─── State ───────────────────────────────
let questions = [];
let shuffledQuestions = [];
let currentIndex = 0;
let score = 0;
let timerInterval = null;
let timeLeft = 30 * 60; // 30 minutes
let sessionStart = null;
let eyeRestShown = false;
let isDark = false;
let isWarm = false;
let isLargeFont = false;

// ─── Init ─────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  loadQuestions();
  protectContent();
});

// ─── Load questions ────────────────────────
async function loadQuestions() {
  try {
    const res = await fetch('questions.json');
    questions = await res.json();
  } catch {
    // fallback: questions.json not found, use empty
    questions = [];
  }
}

// ─── Page navigation ──────────────────────
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ─── PASSWORD ─────────────────────────────
function checkPassword() {
  const val = document.getElementById('password-input').value.trim();
  const err = document.getElementById('login-error');
  if (val === '7777') {
    err.classList.add('hidden');
    showPage('page-home');
    sessionStart = Date.now();
  } else {
    err.classList.remove('hidden');
    document.getElementById('password-input').value = '';
    document.getElementById('password-input').focus();
  }
}

// Enter key on password
document.addEventListener('keydown', (e) => {
  if (document.getElementById('page-login').classList.contains('active') && e.key === 'Enter') {
    checkPassword();
  }
});

// ─── START TEST ───────────────────────────
function startTest() {
  if (!questions.length) { showToast('Сұрақтар жүктелмеді!'); return; }

  // Shuffle questions
  shuffledQuestions = shuffle([...questions]);
  currentIndex = 0;
  score = 0;
  timeLeft = 30 * 60;
  sessionStart = Date.now();
  eyeRestShown = false;

  showPage('page-test');
  renderQuestion();
  startTimer();
  startEyeRestWatch();
}

// ─── RENDER QUESTION ──────────────────────
function renderQuestion() {
  const q = shuffledQuestions[currentIndex];
  const total = shuffledQuestions.length;

  document.getElementById('question-counter').textContent = `${currentIndex + 1} / ${total}`;
  document.getElementById('question-num-label').textContent = `Сұрақ ${currentIndex + 1}`;
  document.getElementById('question-text').textContent = q.question;
  document.getElementById('score-live').textContent = `✅ ${score}`;

  // Progress bar
  document.getElementById('progress-bar').style.width = `${(currentIndex / total) * 100}%`;

  // Shuffle options
  const optionIndices = shuffle(q.options.map((_, i) => i));
  const correctOriginalIndex = q.correct;

  const container = document.getElementById('options-list');
  container.innerHTML = '';

  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  optionIndices.forEach((origIdx, pos) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.setAttribute('data-orig', origIdx);
    btn.innerHTML = `<span class="option-letter">${letters[pos]}</span><span>${q.options[origIdx]}</span>`;
    btn.onclick = () => handleAnswer(btn, origIdx, correctOriginalIndex);
    container.appendChild(btn);
  });

  // Animate card
  const card = document.getElementById('question-card');
  card.style.animation = 'none';
  void card.offsetWidth;
  card.style.animation = 'fadeIn 0.35s ease';
}

// ─── HANDLE ANSWER ────────────────────────
function handleAnswer(clickedBtn, selectedOrigIdx, correctOrigIdx) {
  const allBtns = document.querySelectorAll('.option-btn');

  // Disable all
  allBtns.forEach(b => b.classList.add('disabled'));

  const isCorrect = selectedOrigIdx === correctOrigIdx;

  if (isCorrect) {
    clickedBtn.classList.add('correct');
    score++;
    document.getElementById('score-live').textContent = `✅ ${score}`;
  } else {
    clickedBtn.classList.add('wrong');
    // Show correct answer
    allBtns.forEach(b => {
      if (parseInt(b.getAttribute('data-orig')) === correctOrigIdx) {
        b.classList.add('correct');
      }
    });
  }

  // Auto advance
  setTimeout(() => {
    currentIndex++;
    if (currentIndex >= shuffledQuestions.length) {
      finishTest();
    } else {
      renderQuestion();
    }
  }, isCorrect ? 1200 : 1800);
}

// ─── TIMER ────────────────────────────────
function startTimer() {
  clearInterval(timerInterval);
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      finishTest(true);
    }
  }, 1000);
}

function updateTimerDisplay() {
  const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');
  const el = document.getElementById('timer');
  el.textContent = `⏱ ${m}:${s}`;
  el.classList.toggle('danger', timeLeft <= 120);
}

// ─── EYE REST ─────────────────────────────
function startEyeRestWatch() {
  setTimeout(() => {
    if (!eyeRestShown && document.getElementById('page-test').classList.contains('active')) {
      document.getElementById('eye-rest-banner').classList.remove('hidden');
      eyeRestShown = true;
    }
  }, 20 * 60 * 1000); // 20 minutes
}

function dismissEyeRest() {
  document.getElementById('eye-rest-banner').classList.add('hidden');
}

// ─── FINISH TEST ──────────────────────────
function finishTest(timeout = false) {
  clearInterval(timerInterval);
  const total = shuffledQuestions.length;
  const wrong = total - score;
  const pct = Math.round((score / total) * 100);

  // Result page
  document.getElementById('res-correct').textContent = score;
  document.getElementById('res-wrong').textContent = wrong;
  document.getElementById('res-total').textContent = total;
  document.getElementById('result-score-big').textContent = `${score} / ${total}`;
  document.getElementById('result-percent').textContent = `${pct}%`;
  document.getElementById('result-title').textContent = timeout ? 'Уақыт бітті!' : getResultTitle(pct);
  document.getElementById('result-emoji').textContent = getResultEmoji(pct, timeout);

  showPage('page-result');

  // Animate result bar
  setTimeout(() => {
    document.getElementById('result-bar').style.width = `${pct}%`;
  }, 300);
}

function getResultTitle(pct) {
  if (pct >= 90) return 'Керемет нәтиже! 🎉';
  if (pct >= 70) return 'Жақсы нәтиже!';
  if (pct >= 50) return 'Орташа нәтиже';
  return 'Қайта оқыңыз';
}
function getResultEmoji(pct, timeout) {
  if (timeout) return '⏰';
  if (pct >= 90) return '🏆';
  if (pct >= 70) return '🎯';
  if (pct >= 50) return '📚';
  return '💪';
}

// ─── RETAKE / HOME ────────────────────────
function retakeTest() {
  startTest();
}
function goHome() {
  clearInterval(timerInterval);
  showPage('page-home');
}

// ─── EYE MODES ────────────────────────────
function toggleDark() {
  isDark = !isDark;
  if (isDark) { isWarm = false; document.body.classList.remove('warm'); }
  document.body.classList.toggle('dark', isDark);
  document.querySelectorAll('[onclick="toggleDark()"]').forEach(b => b.classList.toggle('active', isDark));
}
function toggleWarm() {
  isWarm = !isWarm;
  if (isWarm) { isDark = false; document.body.classList.remove('dark'); }
  document.body.classList.toggle('warm', isWarm);
  document.querySelectorAll('[onclick="toggleWarm()"]').forEach(b => b.classList.toggle('active', isWarm));
}
function toggleFont() {
  isLargeFont = !isLargeFont;
  document.body.classList.toggle('large-font', isLargeFont);
  document.querySelectorAll('[onclick="toggleFont()"]').forEach(b => b.classList.toggle('active', isLargeFont));
}

// ─── SHUFFLE ──────────────────────────────
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── TOAST ────────────────────────────────
let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 2500);
}

// ─── CONTENT PROTECTION ───────────────────
function protectContent() {
  // Disable right click
  document.addEventListener('contextmenu', e => {
    e.preventDefault();
    showToast('🚫 Мәтінді көшіруге болмайды');
  });

  // Disable copy/paste/cut keyboard shortcuts and view source
  document.addEventListener('keydown', e => {
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && ['c','v','x','u','s'].includes(e.key.toLowerCase())) {
      e.preventDefault();
      showToast('🚫 Мәтінді көшіруге болмайды');
      return false;
    }
    // F12, DevTools
    if (e.key === 'F12') {
      e.preventDefault();
    }
  });

  // Disable copy event
  document.addEventListener('copy', e => {
    e.preventDefault();
    showToast('🚫 Мәтінді көшіруге болмайды');
  });

  // Disable paste event
  document.addEventListener('paste', e => {
    e.preventDefault();
    showToast('🚫 Мәтінді көшіруге болмайды');
  });

  // Disable cut event
  document.addEventListener('cut', e => {
    e.preventDefault();
    showToast('🚫 Мәтінді көшіруге болмайды');
  });

  // Disable text selection on certain elements
  document.addEventListener('selectstart', e => {
    if (e.target.classList.contains('question-text') || e.target.closest('.options-list')) {
      e.preventDefault();
    }
  });
}
