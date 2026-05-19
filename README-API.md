# Интеграция PandaScore API

Этот документ описывает, как подключить официальный API PandaScore для получения реальных матчей CS2.

## Что такое PandaScore?

**PandaScore** — это официальный провайдер данных о киберспортивных матчах. Они предоставляют API для доступа к:
- Информации о командах
- Предстоящих матчах
- Live матчах
- Завершенных матчах
- Счетам и результатам в реальном времени

## Как подключить API

### Шаг 1: Регистрация

1. Перейдите на https://pandascore.co/developers
2. Нажмите "Sign Up" и создайте аккаунт
3. Подтвердите email

### Шаг 2: Получить API ключ

1. После входа перейдите в Dashboard
2. Найдите раздел "API Keys"
3. Скопируйте ваш API ключ

### Шаг 3: Вставить ключ в проект

1. Откройте файл `api-config.js`
2. Найдите строку:
   ```javascript
   PANDASCORE_API_KEY: 'YOUR_API_KEY_HERE',
   ```
3. Замените `'YOUR_API_KEY_HERE'` на ваш реальный ключ:
   ```javascript
   PANDASCORE_API_KEY: 'your_actual_api_key_here',
   ```

### Шаг 4: Готово!

Теперь приложение будет использовать реальные данные матчей вместо mock-данных.

## Структура API

### Функции для использования

```javascript
// Поиск команд
searchTeams('Team Name')
// Возвращает: Array<{id, name, logo}>

// Получить матчи между двумя командами
getMatchesBetweenTeams(team1Id, team2Id)
// Возвращает: Array<{id, team1, team2, status, startTime, score, tournament}>

// Получить live матчи
getLiveMatches()
// Возвращает: Array<{id, team1, team2, status, score}>

// Получить детали матча
getMatchDetails(matchId)
// Возвращает: {id, team1, team2, status, startTime, score, tournament, maps}
```

## Пример использования

```javascript
// Поиск команды
const teams = await searchTeams('Natus Vincere');
console.log(teams); // [{id: 123, name: 'Natus Vincere', logo: '...'}]

// Получить матчи между командами
const matches = await getMatchesBetweenTeams(123, 456);
console.log(matches); // [{ id: 789, team1: 'Na`Vi', team2: 'FaZe', ... }]

// Получить детали матча
const details = await getMatchDetails(789);
console.log(details.score); // { team1: 2, team2: 1 }
```

## Ограничения API

- **Rate Limit:** 300 запросов в час (для бесплатного плана)
- **Задержка данных:** Live матчи обновляются каждые 10-30 секунд
- **История:** Доступны матчи за последние 2 года

## Обработка ошибок

Если API ключ не настроен или произойдет ошибка, приложение автоматически использует mock-данные для демонстрации.

## Поддержка

- Документация PandaScore: https://docs.pandascore.co/
- Статус API: https://status.pandascore.co/

## Безопасность

⚠️ **Важно:** Никогда не коммитьте реальный API ключ в публичный репозиторий!

Для production используйте переменные окружения:
```javascript
const API_KEY = process.env.PANDASCORE_API_KEY;
```

---

**Версия:** 1.0.0  
**Последнее обновление:** 2026-05-19
