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
        showStepError(getCurrentStep());
        return;
    }
    clearStepErrors();

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

// Функция для отображения ошибок
function showStepError(stepNumber) {
    clearStepErrors();
    switch (stepNumber) {
        case 1:
            const player1Name = document.getElementById('player1Name');
            const player1Team = document.getElementById('player1Team');
            if (!player1Name.value.trim()) {
                showFieldError('player1Name', 'Введите имя игрока');
            }
            if (!player1Team.value.trim()) {
                showFieldError('player1Team', 'Выберите команду');
            }
            break;
        case 2:
            const player2Name = document.getElementById('player2Name');
            const player2Team = document.getElementById('player2Team');
            if (!player2Name.value.trim()) {
                showFieldError('player2Name', 'Введите имя игрока');
            }
            if (!player2Team.value.trim()) {
                showFieldError('player2Team', 'Выберите команду');
            }
            break;
        case 3:
            if (!wizardState.exercise) {
                showFieldError('exercisesGrid', 'Выберите упражнение');
            }
            break;
        case 4:
            if (!wizardState.match) {
                showFieldError('matchesContainer', 'Выберите матч');
            }
            break;
    }
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    // Создать контейнер ошибки если его нет
    let errorElement = field.parentElement.querySelector('.field-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        field.parentElement.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    field.classList.add('input-error');
}

function clearStepErrors() {
    document.querySelectorAll('.field-error').forEach(error => {
        error.style.display = 'none';
    });
    document.querySelectorAll('.input-error').forEach(input => {
        input.classList.remove('input-error');
    });
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

    // Получить значение из слайдера
    const slider = document.getElementById(`${exerciseName}-slider`);
    wizardState.exerciseValue = slider.value;

    // Синхронизировать слайдеры
    syncSliderAndInput(exerciseName);
}

function syncSliderAndInput(exerciseName) {
    const sliderId = `${exerciseName}-slider`;
    const valueId = `${exerciseName}-value`;

    const slider = document.getElementById(sliderId);
    const valueDisplay = document.getElementById(valueId);

    if (!slider || !valueDisplay) return;

    // Обновлять дисплей значения при движении слайдера
    slider.addEventListener('input', (e) => {
        if (exerciseName === 'plank') {
            valueDisplay.innerHTML = `${e.target.value}<span class="unit">сек</span>`;
        } else {
            valueDisplay.textContent = e.target.value;
        }
        wizardState.exerciseValue = e.target.value;
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
        showStepError(4);
        return;
    }

    // Сохранить состояние в localStorage
    localStorage.setItem('gameState', JSON.stringify(wizardState));

    // Перейти на страницу игры
    window.location.href = 'game.html';
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    // Синхронизировать слайдеры для всех упражнений
    ['pushups', 'pullups', 'squats', 'plank'].forEach(exercise => {
        syncSliderAndInput(exercise);
    });

    // Показать первый шаг
    goToStep(1);
});
