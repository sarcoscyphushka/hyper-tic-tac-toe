const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// ЭТА СТРОЧКА ГЛАВНАЯ — ОТДАЁМ index.html ПРИ ЗАХОДЕ НА ГЛАВНУЮ
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const games = {};

app.post('/api/new-game', (req, res) => {
    const gameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    games[gameId] = { players: 1, state: null };
    res.json({ gameId });
});

app.post('/api/join-game', (req, res) => {
    const { gameId } = req.body;
    if (games[gameId] && games[gameId].players === 1) {
        games[gameId].players = 2;
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Игра не найдена или уже началась' });
    }
});

app.post('/api/save-state', (req, res) => {
    const { gameId, state } = req.body;
    if (games[gameId]) {
        games[gameId].state = state;
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Игра не найдена' });
    }
});

app.get('/api/get-state/:gameId', (req, res) => {
    const { gameId } = req.params;
    if (games[gameId] && games[gameId].state) {
        res.json(games[gameId].state);
    } else {
        res.status(404).json({ error: 'Состояние не найдено' });
    }
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
