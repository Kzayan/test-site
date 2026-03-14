let currentQuestion = 0;
let score = 0;
let questions = [];
let timer;
let timeLeft = 1800; // 30 минут = 1800 секунд

// Пароль тексеру
function checkPassword() {
  const input = document.getElementById("password-input").value;
  if (input === "7777") {
    document.getElementById("login-page").classList.add("hidden");
    document.getElementById("main-page").classList.remove("hidden");
  } else {
    document.getElementById("login-message").innerText = "Пароль қате, қайта енгізіңіз";
  }
}

// Тестті бастау
function startTest() {
  fetch("questions.json")
    .then(res => res.json())
    .then(data => {
      questions = shuffleArray(data);
      document.getElementById("main-page").classList.add("hidden");
      document.getElementById("test-page").classList.remove("hidden");
      startTimer();
      showQuestion();
    });
}

// Сұрақ көрсету
function showQuestion() {
  if (currentQuestion >= questions.length) {
    endTest();
    return;
  }

  const q = questions[currentQuestion];
  document.getElementById("question-number").innerText = `${currentQuestion+1} / ${questions.length}`;
  document.getElementById("question-text").innerText = q.question;

  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";
  let shuffledAnswers = shuffleArray(q.answers);

  shuffledAnswers.forEach(ans => {
    let btn = document.createElement("button");
    btn.innerText = ans.text;
    btn.onclick = () => checkAnswer(ans.correct, btn, q.answers);
    answersDiv.appendChild(btn);
  });

  updateProgress();
}

// Жауап тексеру
function checkAnswer(correct, btn, answers) {
  if (correct) {
    btn.classList.add("correct");
    score++;
  } else {
    btn.classList.add("wrong");
    // Дұрыс жауапты көрсету
    document.querySelectorAll("#answers button").forEach(b => {
      if (answers.find(a => a.text === b.innerText && a.correct)) {
        b.classList.add("correct");
      }
    });
  }
  setTimeout(() => {
    currentQuestion++;
    showQuestion();
  }, 1500);
}

// Прогресс жолағы
function updateProgress() {
  const progress = ((currentQuestion) / questions.length) * 100;
  document.getElementById("progress-bar").innerHTML = `<div style="width:${progress}%"></div>`;
}

// Таймер
function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    document.getElementById("timer").innerText = `${minutes}:${seconds}`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      endTest();
    }
    if (timeLeft === 1200) {
      alert("Көзіңізді демалдыру үшін 1–2 минут үзіліс жасаңыз");
    }
  }, 1000);
}

// Тест аяқтау
function endTest() {
  clearInterval(timer);
  document.getElementById("test-page").classList.add("hidden");
  document.getElementById("result-page").classList.remove("hidden");

  let wrong = questions.length - score;
  let percent = Math.round((score / questions.length) * 100);

  document.getElementById("result-summary").innerText =
    `Жалпы сұрақ: ${questions.length}\nДұрыс жауап: ${score}\nҚате жауап: ${wrong}\nСіз ${score} / ${questions.length} балл жинадыңыз (${percent}%)`;
}

// Қайта тапсыру
function restartTest() {
  currentQuestion = 0;
  score = 0;
  timeLeft = 1800;
  document.getElementById("result-page").classList.add("hidden");
  document.getElementById("main-page").classList.remove("hidden");
}

// Shuffle функциясы
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Қорғаныс
document.onkeydown = function(e) {
  if (e.ctrlKey && (e.key === "c" || e.key === "v" || e.key === "x" || e.key === "u")) {
    alert("Мәтінді көшіруге болмайды");
    return false;
  }
};
