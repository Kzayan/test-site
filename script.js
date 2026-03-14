        <// script.js
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let timeLeft = 1800; // 30 минут
let testStartTime;
let shuffledQuestions = [];

const passwordScreen = document.getElementById('password-screen');
const mainScreen = document.getElementById('main-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');

const passwordInput = document.getElementById('password-input');
const passwordError = document.getElementById('password-error');

async function loadQuestions() {
    try {
        const res = await fetch('questions.json');
        questions = await res.json();
    } catch (e) {
        alert('questions.json файлын табу мүмкін болмады!');
    }
}

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        const min = Math.floor(timeLeft / 60);
        const sec = timeLeft % 60;
        document.getElementById('timer').textContent = `\( {min}: \){sec < 10 ? '0' : ''}${sec}`;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endTest();
        }
    }, 1000);
}

function showQuestion() {
    const q = shuffledQuestions[currentQuestionIndex];
    document.getElementById('question-text').textContent = q.question;
    document.getElementById('q-number').textContent = `${currentQuestionIndex + 1} / ${shuffledQuestions.length}`;
    
    const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    
    const optionsDiv = document.getElementById('options-container');
    optionsDiv.innerHTML = '';
    
    const shuffledOptions = shuffleArray([...q.options]);
    
    shuffledOptions.forEach(optionText => {
        const btn = document.createElement('div');
        btn.className = 'option';
        btn.textContent = optionText;
        btn.onclick = () => handleAnswer(optionText, q.correct);
        optionsDiv.appendChild(btn);
    });
}

function handleAnswer(selected, correct) {
    const options = document.querySelectorAll('.option');
    let correctBtn = null;
    
    options.forEach(btn => {
        btn.style.pointerEvents = 'none';
        if (btn.textContent === selected) {
            if (selected === correct) {
                btn.classList.add('selected-correct');
                score++;
            } else {
                btn.classList.add('selected-wrong');
            }
        }
        if (btn.textContent === correct) {
            correctBtn = btn;
        }
    });
    
    if (correctBtn && selected !== correct) {
        correctBtn.classList.add('show-correct');
    }
    
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < shuffledQuestions.length) {
            showQuestion();
        } else {
            endTest();
        }
    }, 1600);
}

function endTest() {
    clearInterval(timerInterval);
    quizScreen.classList.remove('active');
    resultsScreen.classList.add('active');
    
    const total = shuffledQuestions.length;
    const percent = Math.round((score / total) * 100);
    
    document.getElementById('results-content').innerHTML = `
        <p>Жалпы сұрақ: <strong>${total}</strong></p>
        <p>Дұрыс: <strong>${score}</strong></p>
        <p>Қате: <strong>${total - score}</strong></p>
        <p class="big-score">Сіз ${score} / \( {total} балл жинадыңыз ( \){percent}%)</p>
    `;
}

function checkPassword() {
    if (passwordInput.value === '7777') {
        passwordScreen.classList.remove('active');
        mainScreen.classList.add('active');
        passwordError.textContent = '';
    } else {
        passwordError.textContent = 'Пароль қате, қайта енгізіңіз';
        passwordInput.value = '';
    }
}

function startTest() {
    if (questions.length === 0) return alert('Сұрақтар жүктелмеді!');
    
    mainScreen.classList.remove('active');
    quizScreen.classList.add('active');
    
    shuffledQuestions = shuffleArray([...questions]);
    currentQuestionIndex = 0;
    score = 0;
    timeLeft = 1800;
    
    document.getElementById('timer').textContent = '30:00';
    showQuestion();
    startTimer();
    
    // 20 минуттан кейін ескерту
    testStartTime = Date.now();
    setTimeout(() => {
        if (Date.now() - testStartTime > 1200000) {
            alert('Көзіңізді демалдыру үшін 1–2 минут үзіліс жасаңыз');
        }
    }, 1200000);
    
    // Қорғаныс
    setupAntiCheat();
}

function setupAntiCheat() {
    document.addEventListener('contextmenu', e => {
        e.preventDefault();
        alert('Мәтінді көшіруге болмайды');
    });
    
    document.addEventListener('copy', e => {
        e.preventDefault();
        alert('Мәтінді көшіруге болмайды');
    });
    
    document.addEventListener('cut', e => {
        e.preventDefault();
        alert('Мәтінді көшіруге болмайды');
    });
    
    document.addEventListener('paste', e => {
        e.preventDefault();
        alert('Мәтінді көшіруге болмайды');
    });
    
    document.addEventListener('keydown', e => {
        if (e.ctrlKey && ['c','v','x','u'].indexOf(e.key.toLowerCase()) > -1) {
            e.preventDefault();
            alert('Мәтінді көшіруге болмайды');
        }
    });
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

function toggleEyeComfort() {
    document.body.classList.toggle('eye-comfort');
}

function toggleLargeFont() {
    document.body.classList.toggle('large-font');
}

function restartTest() {
    resultsScreen.classList.remove('active');
    mainScreen.classList.add('active');
    clearInterval(timerInterval);
}

// Іске қосу
window.onload = async () => {
    await loadQuestions();
    // Пароль экранын көрсету
    passwordScreen.classList.add('active');
};
