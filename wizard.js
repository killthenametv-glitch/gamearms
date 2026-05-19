// Состояние мастера
let wizardState = {
    player1: {
        name: '',
        team: ''
    },
    player2: {
        name: '',
        team: ''
    },
    exercise: null,
    exerciseValue: null,
    match: null
};

const TOTAL_STEPS = 4;

// Переход между шагами
function goToStep(stepNumber) {
    // Валидация текущего шага перед переходом
    if (!validateStep(getCurrentStep())) {
        alert('Пожалуйста, заполните все поля');
        return;
    }

    // Скрыть все шаги
    document.querySelectorAll('.wizard-step').forEach(step => {
        step.classList.remove('active');
    });

    // Показать нужный шаг
    document.getElementById(`step${stepNumber}`).classList.add('active');

    // Обновить прогресс-бар
    updateProgressBar(stepNumber);

    // Загрузить данные для шага 4
    if (stepNumber === 4) {
        loadMatches();
    }
}

function getCurrentStep() {
    const activeStep = document.querySelector('.wizard-step.active');
    return parseInt(activeStep.id.replace('step', ''));
}

function updateProgressBar(stepNumber) {
    const progress = (stepNumber / TOTAL_STEPS) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
}

// Валидация шагов
function validateStep(stepNumber) {
    switch (stepNumber) {
        case 1:
            const player1Name = document.getElementById('player1Name').value.trim();
            const player1Team = document.getElementById('player1Team').value.trim();
            if (!player1Name || !player1Team) return false;
            wizardState.player1.name = player1Name;
            wizardState.player1.team = player1Team;
            return true;

        case 2:
            const player2Name = document.getElementById('player2Name').value.trim();
            const player2Team = document.getElementById('player2Team').value.trim();
            if (!player2Name || !player2Team) return false;
            wizardState.player2.name = player2Name;
            wizardState.player2.team = player2Team;
            return true;

        case 3:
            if (!wizardState.exercise) return false;
            return true;

        case 4:
            if (!wizardState.match) return false;
            return true;

        default:
            return true;
    }
}

// Выбор упражнения (Шаг 3)
function selectExercise(exerciseName) {
    // Убрать выделение со всех карточек
    document.querySelectorAll('.exercise-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Выделить выбранную карточку
    event.currentTarget.classList.add('selected');

    // Сохранить выбор
    wizardState.exercise = exerciseName;

    // Получить значение
    let value;
    if (exerciseName === 'plank') {
        value = document.getElementById('plank-input').value;
    } else {
        value = document.getElementById(`${exerciseName}-input`).value;
    }
    wizardState.exerciseValue = value;

    // Показать выбранное упражнение
    updateSelectedExerciseDisplay();

    // Синхронизировать слайдеры и инпуты
    syncSliderAndInput(exerciseName);
}

function updateSelectedExerciseDisplay() {
    const exerciseNames = {
        pushups: 'Отжимания',
        pullups: 'Подтягивания',
        squats: 'Приседания',
        plank: 'Планка'
    };

    const unit = wizardState.exercise === 'plank' ? 'сек' : 'повторений';
    const display = `✓ ${exerciseNames[wizardState.exercise]} - ${wizardState.exerciseValue} ${unit} за раунд`;

    document.getElementById('selectedExercise').textContent = display;
}

function syncSliderAndInput(exerciseName) {
    const sliderId = `${exerciseName}-slider`;
    const inputId = `${exerciseName}-input`;

    const slider = document.getElementById(sliderId);
    const input = document.getElementById(inputId);

    if (!slider || !input) return;

    // Синхронизировать слайдер и инпут
    slider.addEventListener('input', (e) => {
        input.value = e.target.value;
        wizardState.exerciseValue = e.target.value;
        updateSelectedExerciseDisplay();
    });

    input.addEventListener('input', (e) => {
        let value = parseInt(e.target.value);
        if (exerciseName === 'plank') {
            value = Math.max(10, Math.min(60, value));
        } else {
            value = Math.max(1, Math.min(20, value));
        }
        e.target.value = value;
        slider.value = value;
        wizardState.exerciseValue = value;
        updateSelectedExerciseDisplay();
    });
}

// Загрузка матчей (Шаг 4)
function loadMatches() {
    const container = document.getElementById('matchesContainer');
    container.innerHTML = '<p class="loading">Загрузка матчей...</p>';

    // MOCK-данные (позже подключим PandaScore API)
    // Структура для легкого подключения реального API
    const mockMatches = [
        {
            id: 1,
            team1: wizardState.player1.team,
            team2: wizardState.player2.team,
            status: 'upcoming',
            startTime: new Date(Date.now() + 3600000), // через час
            score: { team1: 0, team2: 0 }
        },
        {
            id: 2,
            team1: wizardState.player1.team,
            team2: wizardState.player2.team,
            status: 'live',
            startTime: new Date(),
            score: { team1: 2, team2: 1 }
        }
    ];

    // Отобразить матчи
    if (mockMatches.length === 0) {
        container.innerHTML = '<p class="loading">Матчи не найдены. Попробуйте другие команды.</p>';
        return;
    }

    container.innerHTML = mockMatches.map(match => `
        <div class="match-card" onclick="selectMatch(${match.id}, this)">
            <h3>${match.status === 'live' ? '🔴 LIVE' : '⏰ ПРЕДСТОЯЩИЙ'}</h3>
            <div class="match-teams">${match.team1} vs ${match.team2}</div>
            <div class="match-status">
                ${match.status === 'live' ? `Счет: ${match.score.team1} - ${match.score.team2}` : ''}
            </div>
            <div class="match-timer">
                ${getTimeDisplay(match.startTime)}
            </div>
        </div>
    `).join('');
}

function selectMatch(matchId, element) {
    // Убрать выделение со всех карточек
    document.querySelectorAll('.match-card').forEach(card => {
        card.style.borderColor = 'var(--text-gold)';
        card.style.backgroundColor = 'rgba(240, 224, 192, 0.05)';
    });

    // Выделить выбранный матч
    element.style.borderColor = 'var(--text-cream)';
    element.style.backgroundColor = 'rgba(212, 149, 42, 0.2)';

    wizardState.match = matchId;
}

function getTimeDisplay(date) {
    const now = new Date();
    const diff = date - now;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    if (hours > 0) {
        return `Начало через ${hours}ч ${minutes}м`;
    } else if (minutes > 0) {
        return `Начало через ${minutes}м`;
    } else {
        return 'Начинается сейчас';
    }
}

// Начать игру
function startGame() {
    if (!wizardState.match) {
        alert('Выберите матч');
        return;
    }

    // Сохранить состояние в localStorage
    localStorage.setItem('gameState', JSON.stringify(wizardState));

    // Перейти на страницу игры
    window.location.href = 'game.html';
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    // Синхронизировать слайдеры и инпуты для всех упражнений
    ['pushups', 'pullups', 'squats', 'plank'].forEach(exercise => {
        syncSliderAndInput(exercise);
    });

    // Показать первый шаг
    goToStep(1);
});
