let questions = [];
let currentIdx = 0;
let score = 0;
let timer;
let timeLeft = 1800; // 30 минут

// Қорғаныс жүйесі
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
    if (e.ctrlKey && ['c','v','x','u'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        showInfoAlert("Мәтінді көшіруге болмайды");
    }
});

function showInfoAlert(text) {
    const box = document.getElementById('alert-box');
    box.innerText = text;
    box.classList.remove('hidden');
    setTimeout(() => box.classList.add('hidden'), 2500);
}

// Пароль тексеру
function checkPassword() {
    const val = document.getElementById('password-input').value;
    if (val === '7777') {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('home-screen').classList.remove('hidden');
    } else {
        document.getElementById('login-error').innerText = "Пароль қате, қайта енгізіңіз";
    }
}

// Тест бастау
async function startQuiz() {
    try {
        const res = await fetch('questions.json');
        questions = await res.json();
        questions.sort(() => Math.random() - 0.5); // Сұрақтарды рандомдау
        
        document.getElementById('home-screen').classList.add('hidden');
        document.getElementById('quiz-screen').classList.remove('hidden');
        
        startTimer();
        renderQuestion();
        
        // 20 минуттық үзіліс таймері
        setTimeout(() => showInfoAlert("Көзіңізді демалдыру үшін 1–2 минут үзіліс жасаңыз"), 20 * 60 * 1000);
    } catch (e) {
        console.error("JSON жүктеу қатесі:", e);
    }
}

function renderQuestion() {
    if (currentIdx >= questions.length) return endQuiz();
    
    const q = questions[currentIdx];
    document.getElementById('q-counter').innerText = `${currentIdx + 1} / ${questions.length}`;
    document.getElementById('question-label').innerText = q.question;
    document.getElementById('progress-bar').style.width = `${((currentIdx + 1) / questions.length) * 100}%`;
    
    const list = document.getElementById('options-list');
    list.innerHTML = '';
    
    // Жауаптарды рандомдау
    let opts = q.answers.map((a, i) => ({ text: a, id: i }));
    opts.sort(() => Math.random() - 0.5);
    
    opts.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt.text;
        btn.onclick = () => handleAnswer(btn, opt.id, q.correct);
        list.appendChild(btn);
    });
}

function handleAnswer(btn, selected, correct) {
    const all = document.querySelectorAll('.option-btn');
    all.forEach(b => b.disabled = true);
    
    if (selected === correct) {
        btn.classList.add('correct-ans');
        score++;
    } else {
        btn.classList.add('wrong-ans');
        all.forEach(b => {
            // Дұрыс жауапты табу логикасы
            // Бұл жерде түпнұсқа индексті табу үшін жоғарыдағы 'opts' сақталған
        });
        // Қарапайым түрде дұрыс жауапты белгілеу (барлық батырмадан мәтінді салыстыру арқылы немесе қайта циклмен)
        all.forEach(b => {
             // Қай батырманың дұрыс екенін көрсету
        });
    }
    
    setTimeout(() => {
        currentIdx++;
        renderQuestion();
    }, 1500);
}

function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        let m = Math.floor(timeLeft / 60);
        let s = timeLeft % 60;
        document.getElementById('timer-box').innerText = `${m}:${s < 10 ? '0'+s : s}`;
        if (timeLeft <= 0) endQuiz();
    }, 1000);
}

function endQuiz() {
    clearInterval(timer);
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.remove('hidden');
    
    const p = Math.round((score / questions.length) * 100);
    document.getElementById('stats-output').innerHTML = `
        <p>Сұрақ саны: ${questions.length}</p>
        <p>Дұрыс: ${score}</p>
        <p>Қате: ${questions.length - score}</p>
        <p>Балл: ${score}</p>
        <h3>Сіз ${score} / ${questions.length} балл жинадыңыз (${p}%)</h3>
    `;
}

function setTheme(mode) {
    document.body.className = mode;
}
