const WebSocket = require('ws');
const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');

const BattleManager = require('./BattleManager');

const DEV_SP = true;

const ws = new WebSocket.Server({ port: 4001 });

function joinGame(gameId, username, socket) {
    let game = games[gameId];
    if (!game) {
        games[gameId] = game = createGame();
    }

    game.players[username] = {
        socket,
        soldiers: [],
    };

    if (DEV_SP) { // single player dev mode
        game.players['DEV_OPPONENT'] = {
            socket,
            soldiers: [],
            playerIdx: 1,
        };

        game.players[username].playerIdx = 0;

        socket.send(JSON.stringify({ type: 'ready', payload: { playerIdx: 0 }}));
    } else {
        const opponentPlayer = getOpponentPlayer(game.players, username);

        if (opponentPlayer) {
            game.players[username].playerIdx = 1;
            opponentPlayer.socket.send(JSON.stringify({ type: 'ready', payload: { playerIdx: 0 }}));
            socket.send(JSON.stringify({ type: 'ready', payload: { playerIdx: 1 }}));
        } else {
            game.players[username].playerIdx = 0;
            socket.send(JSON.stringify({ type: 'joined' }))
        }
    }
}

function deployFormation(gameId, username, soldiers) {
    const game = games[gameId];

    if (!game) {
        return;
    }

    const player = game.players[username]

    if (!player) {
        return;
    }

    game.battleManager.loadSoldiers(player.playerIdx, soldiers);

    if (DEV_SP) { // single player dev mode
        // dummy soldiers for the dev opponent
        game.battleManager.loadSoldiers(1, [
            // { x: 50, y: 100 },
            { x: 50, y: 200 },
            // { x: 50, y: 300 },
        ]);

        game.battleManager.startSimulation(battleState => {
            player.socket.send(JSON.stringify({
                type: 'battleUpdate',
                payload: { battleState },
            }));
        });
    }
}

ws.on('connection', (socket, req) => {
    console.log('websocket connected!!!');

    socket.on('close', () => {
        console.log('closed');
    });

    socket.on('error', () => {
        console.log('error');
    });

    socket.on('message', dataStr => {
        const data = JSON.parse(dataStr);

        const clientIP = req.connection.remoteAddress;

        if (data.type === 'join') {
            const { gameId, username } = data.payload;
            joinGame(gameId, username, socket);
        } else if (data.type === 'formationComplete') {
            const { gameId, username, soldiers } = data.payload;
            deployFormation(gameId, username, soldiers);
        }
    });
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

const games = {};

function getOpponentPlayer(players, playerId) {
    for (const pid of Object.keys(players)) {
        if (pid !== playerId) {
            return players[pid];
        }
    }
}

function createGame() {
    return {
        battleManager: new BattleManager(),
        players: {},
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
