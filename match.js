// Конфигурация
const API_KEY = '5d568881-60f0-49f0-a2d3-8bbcbe78f742';
const API_URL = 'https://api.balldontlie.io/cs/v1/matches?per_page=5&status=live';
const POLL_INTERVAL = 30000; // 30 секунд

// Состояние приложения
let currentMatch = null;
let updateTimer = null;
let countdownInterval = null;

// Элементы DOM
const loader = document.getElementById('loader');
const matchApp = document.getElementById('matchApp');
const resultModal = document.getElementById('resultModal');

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    fetchMatches();
    // Автообновление каждые 30 сек
    updateTimer = setInterval(fetchMatches, POLL_INTERVAL);
});

// Получение матчей
async function fetchMatches() {
    try {
        const response = await fetch(API_URL, {
            headers: {
                'Authorization': API_KEY
            }
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            // Берем первый активный матч (можно добавить логику выбора)
            renderMatch(data.data[0]);
        } else {
            showNoMatches();
        }
    } catch (error) {
        console.error('Error fetching matches:', error);
        // Для демонстрации используем фейковые данные если API недоступен
        renderMockData();
    }
}

// Рендеринг матча
function renderMatch(match) {
    currentMatch = match;
    
    // Скрываем лоадер, показываем приложение
    loader.style.display = 'none';
    matchApp.style.display = 'flex';
    matchApp.style.flexDirection = 'column';
    matchApp.style.height = '100vh';

    // Заполнение данных
    document.getElementById('tournamentName').textContent = match.tournament.name;
    document.getElementById('stageName').textContent = match.stage.name;
    document.getElementById('tierBadge').textContent = match.tournament.tier.toUpperCase() + '-Tier';
    
    // Команда 1
    document.getElementById('team1Name').textContent = match.team1.name;
    document.getElementById('team1Logo').src = getTeamLogoUrl(match.team1.short_name);
    document.getElementById('score1').textContent = match.team1_score;
    document.getElementById('mapScore1').textContent = match.team1_score;
    
    // Команда 2
    document.getElementById('team2Name').textContent = match.team2.name;
    document.getElementById('team2Logo').src = getTeamLogoUrl(match.team2.short_name);
    document.getElementById('score2').textContent = match.team2_score;
    document.getElementById('mapScore2').textContent = match.team2_score;
    
    // Центр
    document.getElementById('bestOfValue').textContent = match.best_of;
    document.getElementById('startTimeDisplay').textContent = new Date(match.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const statusEl = document.getElementById('matchStatus');
    const liveDot = document.getElementById('liveDot');
    
    if (match.status === 'finished') {
        statusEl.textContent = 'ЗАКОНЧЕН';
        statusEl.classList.add('finished');
        liveDot.style.display = 'none';
        showResultModal(match);
    } else if (match.status === 'live') {
        statusEl.textContent = 'LIVE';
        statusEl.classList.remove('finished');
        liveDot.style.display = 'block';
        calculatePenalties(match);
    } else {
        // Матч еще не начался
        statusEl.textContent = 'ОЖИДАНИЕ';
        statusEl.classList.remove('finished');
        liveDot.style.display = 'none';
        startCountdown(match.start_time);
    }
}

// Логика штрафов (симуляция для примера)
function calculatePenalties(match) {
    const scoreDiff = Math.abs(match.team1_score - match.team2_score);
    
    // Проигравшая команда получает штраф
    let debtTeam = match.team1_score < match.team2_score ? 1 : 2;
    let debtAmount = scoreDiff * 15; // 15 повторений за карту
    
    if (match.team1_score === match.team2_score) {
        debtAmount = 0;
    }
    
    // Обновляем UI
    if (debtTeam === 1) {
        document.getElementById('debt1').textContent = debtAmount;
        document.getElementById('debt2').textContent = 0;
        document.getElementById('punish1Count').textContent = debtAmount;
        document.getElementById('punish2Count').textContent = 0;
    } else {
        document.getElementById('debt2').textContent = debtAmount;
        document.getElementById('debt1').textContent = 0;
        document.getElementById('punish2Count').textContent = debtAmount;
        document.getElementById('punish1Count').textContent = 0;
    }
}

// Таймер обратного отсчета
function startCountdown(startTime) {
    if (countdownInterval) clearInterval(countdownInterval);
    
    const target = new Date(startTime).getTime();
    const timerContainer = document.getElementById('matchTimerContainer');
    
    timerContainer.style.display = 'block';
    
    countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = target - now;
        
        if (distance < 0) {
            clearInterval(countdownInterval);
            timerContainer.style.display = 'none';
            fetchMatches(); // Проверить статус снова
            return;
        }
        
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById('countdown').textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Показ модального окна результата
function showResultModal(match) {
    const winner = match.winner || (match.team1_score > match.team2_score ? match.team1 : match.team2);
    const loser = winner.id === match.team1.id ? match.team2 : match.team1;
    const loserScore = winner.id === match.team1.id ? match.team2_score : match.team1_score;
    const winnerScore = winner.id === match.team1.id ? match.team1_score : match.team2_score;
    
    const penaltyAmount = (winnerScore - loserScore) * 15;
    
    document.getElementById('resTeam1Name').textContent = match.team1.name;
    document.getElementById('resTeam1Img').src = getTeamLogoUrl(match.team1.short_name);
    document.getElementById('resTeam2Name').textContent = match.team2.name;
    document.getElementById('resTeam2Img').src = getTeamLogoUrl(match.team2.short_name);
    
    document.getElementById('resScore1').textContent = match.team1_score;
    document.getElementById('resScore2').textContent = match.team2_score;
    
    document.getElementById('summaryDebt').textContent = penaltyAmount;
    document.getElementById('summaryType').textContent = "Отжимания"; // Можно рандомизировать
    
    setTimeout(() => {
        resultModal.style.display = 'flex';
    }, 1500);
}

function closeModal() {
    resultModal.style.display = 'none';
}

function shareResult() {
    alert('Функция генерации изображения для Stories будет реализована через html2canvas');
    // Здесь будет логика создания скриншота и скачивания
}

// Вспомогательные функции
function getTeamLogoUrl(shortName) {
    // Заглушка для логотипов. В реальности нужно брать из API или базы
    return `https://placehold.co/150x150/1a1d24/FFF?text=${shortName}`;
}

function showNoMatches() {
    document.querySelector('#loader p').textContent = 'Нет активных матчей прямо сейчас';
}

// МОК ДАННЫЕ (для тестирования без API ключа)
function renderMockData() {
    const mockMatch = {
        id: 67356,
        tournament: { name: "StarLadder Budapest Major 2025", tier: "s" },
        stage: { name: "Grand Final" },
        team1: { id: 650, name: "Vitality", short_name: "VIT" },
        team2: { id: 769, name: "FaZe", short_name: "FAZE" },
        team1_score: 1,
        team2_score: 1,
        best_of: 5,
        status: "live",
        start_time: new Date().toISOString()
    };
    
    renderMatch(mockMatch);
}
