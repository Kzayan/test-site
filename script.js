let questions = [];
let currentIdx = 0;
let score = 0;
let timer;
let timeLeft = 1800; // 30 минут

// 1. Пароль тексеру
function checkAuth() {
    const input = document.getElementById('pass-input').value;
    if (input === "7777") {
        document.getElementById('auth-page').classList.add('hidden');
        document.getElementById('main-page').classList.remove('hidden');
        fetchQuestions();
    } else {
        document.getElementById('auth-msg').innerText = "Пароль қате, қайта енгізіңіз";
    }
}

// 2. Сұрақтарды жүктеу
async function fetchQuestions() {
    const res = await fetch('questions.json');
    const data = await res.json();
    questions = data.sort(() => Math.random() - 0.5); // Рандом
    document.getElementById('q-total-info').innerText = questions.length;
}

// 3. Тестті бастау
function startQuiz() {
    document.getElementById('main-page').classList.add('hidden');
    document.getElementById('quiz-page').classList.remove('hidden');
    startTimer();
    renderQuestion();
    
    // 20 минуттық үзіліс ескертуі
    setTimeout(() => {
        alert("Көзіңізді демалдыру үшін 1–2 минут үзіліс жасаңыз");
    }, 20 * 60 * 1000);
}

function renderQuestion() {
    const q = questions[currentIdx];
    document.getElementById('question-text').innerText = q.q;
    document.getElementById('current-idx').innerText = currentIdx + 1;
    document.getElementById('total-idx').innerText = questions.length;
    document.getElementById('progress-fill').style.width = ((currentIdx + 1) / questions.length * 100) + "%";

    const list = document.getElementById('answer-list');
    list.innerHTML = "";

    // Жауаптарды араластыру
    const answers = [...q.a].sort(() => Math.random() - 0.5);

    answers.forEach(ans => {
        const btn = document.createElement('button');
        btn.className = "ans-btn";
        btn.innerText = ans.t;
        btn.onclick = () => handleAnswer(btn, ans.c);
        list.appendChild(btn);
    });
}

function handleAnswer(btn, isCorrect) {
    const allBtns = document.querySelectorAll('.ans-btn');
    allBtns.forEach(b => b.style.pointerEvents = "none");

    if (isCorrect) {
        btn.classList.add('correct');
        score++;
    } else {
        btn.classList.add('wrong');
        // Дұрыс жауапты көрсету
        allBtns.forEach(b => {
            const currentQ = questions[currentIdx];
            const originalAns = currentQ.a.find(item => item.t === b.innerText);
            if(originalAns.c) b.classList.add('correct');
        });
    }

    setTimeout(() => {
        currentIdx++;
        if (currentIdx < questions.length) {
            renderQuestion();
        } else {
            finishQuiz();
        }
    }, 1500);
}

function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        let min = Math.floor(timeLeft / 60);
        let sec = timeLeft % 60;
        document.getElementById('timer').innerText = `${min}:${sec < 10 ? '0'+sec : sec}`;
        if (timeLeft <= 0) finishQuiz();
    }, 1000);
}

function finishQuiz() {
    clearInterval(timer);
    document.getElementById('quiz-page').classList.add('hidden');
    document.getElementById('result-page').classList.remove('hidden');
    
    const percent = Math.round((score / questions.length) * 100);
    document.getElementById('stats').innerHTML = `
        <p>Жалпы сұрақ: ${questions.length}</p>
        <p>Дұрыс: ${score}</p>
        <p>Қате: ${questions.length - score}</p>
        <h3>Сіз ${score} / ${questions.length} балл жинадыңыз (${percent}%)</h3>
    `;
}

// Дизайн режимдері
function toggleMode(type) {
    document.body.classList.toggle(type + '-mode');
}

// Қорғаныс
document.addEventListener('copy', (e) => { e.preventDefault(); alert('Мәтінді көшіруге болмайды'); });
document.addEventListener('paste', (e) => e.preventDefault());
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && ['c','v','x','u'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        alert('Мәтінді көшіруге болмайды');
    }
});
