const WebSocket = require('ws');
const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');

const BattleManager = require('./BattleManager');

const DEV_SP = true;
// const DEV_SP = false;

const ws = new WebSocket.Server({ port: 4001 });

function joinGame(gameId, username, socket) {
    let game = games[gameId];
    if (!game) {
        games[gameId] = game = new BattleManager();
    }

    game.addPlayer(username, socket);
}

function rematch(gameId, username) {
    const game = games[gameId];

    if (!game) {
        return;
    }

    game.rematch(username);
}

function deployFormation(gameId, username, soldiers) {
    const game = games[gameId];

    if (!game) {
        return;
    }

    game.deployFormation(username, soldiers);
}

ws.on('connection', (socket, req) => {
    console.log('websocket connected!!!');

    socket.on('close', ($1, $2) => {
        console.log('closed', $1, $2);
    });

    socket.on('error', () => {
        console.log('error');
    });

    socket.on('message', dataStr => {
        const data = JSON.parse(dataStr);

        const clientIP = req.connection.remoteAddress;

        const { gameId, username } = data.payload;

        switch (data.type) {
            case 'join':
                joinGame(gameId, username, socket);
                break;
            case 'formationComplete':
                const { soldiers } = data.payload;
                deployFormation(gameId, username, soldiers);
                break;
            case 'rematch':
                rematch(gameId, username);
                break;
        }
    });
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

const games = {};

function createGameId() {
    let id = '';

    do {
        id = '';
        const vocab = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        for (let i = 0; i < 6; i++) {
            id += vocab.charAt(Math.floor(Math.random() * vocab.length));
        }
    } while (games[id]);

    return id;
}

app.post('/createGame', (req, res) => {
    console.log(req)
    res.send({
        id: createGameId(),
    });
});

app.listen(4000);
