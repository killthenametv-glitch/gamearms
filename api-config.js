/**
 * API Configuration для CS Round Punisher
 * 
 * Это файл для подключения PandaScore API
 * 
 * Инструкция:
 * 1. Зарегистрируйтесь на https://pandascore.co/developers
 * 2. Получите API ключ
 * 3. Вставьте ключ ниже в переменную PANDASCORE_API_KEY
 * 4. Раскомментируйте функции для использования реального API
 */

// ============================================
// КОНФИГУРАЦИЯ
// ============================================

const API_CONFIG = {
    // Вставьте ваш API ключ от PandaScore
    PANDASCORE_API_KEY: 'YOUR_API_KEY_HERE',
    
    // Base URL для PandaScore API
    PANDASCORE_BASE_URL: 'https://api.pandascore.co',
    
    // Endpoints
    ENDPOINTS: {
        TEAMS: '/teams',
        MATCHES: '/matches',
        LIVE_MATCHES: '/matches/live',
        UPCOMING_MATCHES: '/matches/upcoming',
        PAST_MATCHES: '/matches/past'
    }
};

// ============================================
// ФУНКЦИИ ДЛЯ РАБОТЫ С API
// ============================================

/**
 * Поиск команд по названию
 * @param {string} teamName - Название команды
 * @returns {Promise<Array>} Массив команд
 */
async function searchTeams(teamName) {
    if (!isApiConfigured()) {
        console.warn('API ключ не настроен. Используются mock-данные.');
        return getMockTeams(teamName);
    }

    try {
        const url = `${API_CONFIG.PANDASCORE_BASE_URL}${API_CONFIG.ENDPOINTS.TEAMS}?search[name]=${encodeURIComponent(teamName)}&api_token=${API_CONFIG.PANDASCORE_API_KEY}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        return data.map(team => ({
            id: team.id,
            name: team.name,
            logo: team.image_url
        }));
    } catch (error) {
        console.error('Ошибка при поиске команд:', error);
        return [];
    }
}

/**
 * Получить матчи между двумя командами
 * @param {string} team1Id - ID первой команды
 * @param {string} team2Id - ID второй команды
 * @returns {Promise<Array>} Массив матчей
 */
async function getMatchesBetweenTeams(team1Id, team2Id) {
    if (!isApiConfigured()) {
        console.warn('API ключ не настроен. Используются mock-данные.');
        return getMockMatches(team1Id, team2Id);
    }

    try {
        // Получить предстоящие матчи
        const upcomingUrl = `${API_CONFIG.PANDASCORE_BASE_URL}${API_CONFIG.ENDPOINTS.UPCOMING_MATCHES}?filter[teams]=${team1Id},${team2Id}&api_token=${API_CONFIG.PANDASCORE_API_KEY}`;
        
        // Получить live матчи
        const liveUrl = `${API_CONFIG.PANDASCORE_BASE_URL}${API_CONFIG.ENDPOINTS.LIVE_MATCHES}?filter[teams]=${team1Id},${team2Id}&api_token=${API_CONFIG.PANDASCORE_API_KEY}`;

        const [upcomingRes, liveRes] = await Promise.all([
            fetch(upcomingUrl),
            fetch(liveUrl)
        ]);

        if (!upcomingRes.ok || !liveRes.ok) {
            throw new Error('Ошибка при получении матчей');
        }

        const upcomingMatches = await upcomingRes.json();
        const liveMatches = await liveRes.json();

        // Объединить и отформатировать
        const allMatches = [...liveMatches, ...upcomingMatches];
        
        return allMatches.map(match => ({
            id: match.id,
            team1: match.teams[0].name,
            team2: match.teams[1].name,
            status: match.status,
            startTime: new Date(match.scheduled_at),
            score: {
                team1: match.results?.[0]?.score || 0,
                team2: match.results?.[1]?.score || 0
            },
            tournament: match.tournament?.name || 'Unknown'
        }));
    } catch (error) {
        console.error('Ошибка при получении матчей:', error);
        return [];
    }
}

/**
 * Получить live матчи
 * @returns {Promise<Array>} Массив live матчей
 */
async function getLiveMatches() {
    if (!isApiConfigured()) {
        return [];
    }

    try {
        const url = `${API_CONFIG.PANDASCORE_BASE_URL}${API_CONFIG.ENDPOINTS.LIVE_MATCHES}?api_token=${API_CONFIG.PANDASCORE_API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        return data.map(match => ({
            id: match.id,
            team1: match.teams[0].name,
            team2: match.teams[1].name,
            status: 'live',
            score: {
                team1: match.results?.[0]?.score || 0,
                team2: match.results?.[1]?.score || 0
            }
        }));
    } catch (error) {
        console.error('Ошибка при получении live матчей:', error);
        return [];
    }
}

/**
 * Получить детали матча
 * @param {string} matchId - ID матча
 * @returns {Promise<Object>} Детали матча
 */
async function getMatchDetails(matchId) {
    if (!isApiConfigured()) {
        return null;
    }

    try {
        const url = `${API_CONFIG.PANDASCORE_BASE_URL}${API_CONFIG.ENDPOINTS.MATCHES}/${matchId}?api_token=${API_CONFIG.PANDASCORE_API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const match = await response.json();
        return {
            id: match.id,
            team1: match.teams[0].name,
            team2: match.teams[1].name,
            status: match.status,
            startTime: new Date(match.scheduled_at),
            score: {
                team1: match.results?.[0]?.score || 0,
                team2: match.results?.[1]?.score || 0
            },
            tournament: match.tournament?.name,
            maps: match.games?.map(game => ({
                mapName: game.map?.name,
                team1Score: game.results?.[0]?.score,
                team2Score: game.results?.[1]?.score
            }))
        };
    } catch (error) {
        console.error('Ошибка при получении деталей матча:', error);
        return null;
    }
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

function isApiConfigured() {
    return API_CONFIG.PANDASCORE_API_KEY !== 'YOUR_API_KEY_HERE';
}

/**
 * Mock-данные для команд (когда API не настроен)
 */
function getMockTeams(teamName) {
    const mockTeams = [
        { id: 1, name: 'Natus Vincere', logo: null },
        { id: 2, name: 'FaZe Clan', logo: null },
        { id: 3, name: 'Vitality', logo: null },
        { id: 4, name: 'Liquid', logo: null },
        { id: 5, name: 'ENCE', logo: null }
    ];

    return mockTeams.filter(team => 
        team.name.toLowerCase().includes(teamName.toLowerCase())
    );
}

/**
 * Mock-данные для матчей (когда API не настроен)
 */
function getMockMatches(team1Id, team2Id) {
    return [
        {
            id: 1,
            team1: 'Natus Vincere',
            team2: 'FaZe Clan',
            status: 'upcoming',
            startTime: new Date(Date.now() + 3600000),
            score: { team1: 0, team2: 0 },
            tournament: 'ESL Pro League'
        },
        {
            id: 2,
            team1: 'Natus Vincere',
            team2: 'FaZe Clan',
            status: 'live',
            startTime: new Date(),
            score: { team1: 2, team2: 1 },
            tournament: 'PGL Major'
        }
    ];
}

// ============================================
// ЭКСПОРТ
// ============================================

// Если используется модульная система, раскомментируйте:
// export { searchTeams, getMatchesBetweenTeams, getLiveMatches, getMatchDetails, API_CONFIG };
