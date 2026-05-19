// Получаем кнопку
const startButton = document.getElementById('startButton');

// Добавляем обработчик клика
startButton.addEventListener('click', function() {
    alert('Игра начинается! Это будет реализовано позже 🎮');
    // Здесь позже будет логика для пошагового мастера
});

// Можно добавить эффект при наведении (опционально)
startButton.addEventListener('mouseenter', function() {
    console.log('Кнопка в фокусе');
});

startButton.addEventListener('mouseleave', function() {
    console.log('Кнопка потеряла фокус');
});
