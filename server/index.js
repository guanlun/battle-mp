const WebSocket = require('ws');
const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors')

const ws = new WebSocket.Server({ port: 4001 });

ws.on('connection', socket => {
    console.log('websocket connected!!!');

    socket.on('close', () => {
        console.log('closed');
    });

    socket.on('error', () => {
        console.log('error');
    });

    socket.on('message', dataStr => {
        const data = JSON.parse(dataStr);
        if (data.type === 'join') {
            const gameId = data.payload.gameId;
            if (!games[gameId]) {
                games[gameId] = createGame();
            }

            const currPlayerCount = games[gameId].players.length;

            if (currPlayerCount > 1) {
                return;
            } else if (currPlayerCount === 1) {
                games[gameId].players[0].socket.send(JSON.stringify({ type: 'join' , paylod: { playerIdx: 0 }}));
                socket.send(JSON.stringify({ type: 'ready', paylod: { playerIdx: 1 } }))
            }

            games[gameId].players.push({
                socket,
            });
        }
    });
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

const games = {};

function createGame() {
    return {
        players: [],
    };
}

function createGameId() {
    let id = '';

    do {
        id = '';
        const vocab = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        for (let i = 0; i < 6; i++) {
            id += vocab.charAt(Math.floor(Math.random() * vocab.length));
        }
    } while (games[id]);

    games[id] = createGame();

    return id;
}

app.post('/createGame', (req, res) => {
    console.log(req)
    res.send({
        id: createGameId(),
    });
});

app.listen(4000);
