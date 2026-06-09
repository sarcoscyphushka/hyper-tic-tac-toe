const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Хранилище игр (в памяти, для простоты)
const games = {};

// Отдаём статику (HTML, CSS, JS клиента)
app.use(express.static('public'));

// Создать новую игру
app.post('/api/new-game', (req, res) => {
    const gameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    games[gameId] = {
        players: 0,
        state: null  // сюда будем сохранять состояние игры
    };
    res.json({ gameId });
});

// Подключиться к игре
app.post('/api/join-game', (req, res) => {
    const { gameId } = req.body;
    if (games[gameId] && games[gameId].players < 2) {
        games[gameId].players++;
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Игра не найдена' });
    }
});

// Сохранить состояние игры
app.post('/api/save-state', (req, res) => {
    const { gameId, state } = req.body;
    if (games[gameId]) {
        games[gameId].state = state;
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Игра не найдена' });
    }
});

// Получить состояние игры
app.get('/api/get-state/:gameId', (req, res) => {
    const { gameId } = req.params;
    if (games[gameId] && games[gameId].state) {
        res.json(games[gameId].state);
    } else {
        res.status(404).json({ error: 'Состояние не найдено' });
    }
});

// Ждать изменений (упрощённый long polling)
app.get('/api/wait-state/:gameId', async (req, res) => {
    const { gameId } = req.params;
    let lastState = games[gameId]?.state;
    let waited = 0;
    while (waited < 30000) { // ждём до 30 секунд
        await new Promise(r => setTimeout(r, 500));
        const currentState = games[gameId]?.state;
        if (JSON.stringify(currentState) !== JSON.stringify(lastState)) {
            res.json(currentState);
            return;
        }
        waited += 500;
    }
    res.status(204).send(); // нет изменений
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
