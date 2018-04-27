const WebSocket = require('ws');
const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors')

const ws = new WebSocket.Server({ port: 4001 });

let webSocket = undefined;

ws.on('connection', socket => {
    console.log('connected!!!');

    webSocket = socket;

    socket.on('close', () => {
        console.log('closed');
    });

    socket.on('error', () => {
        console.log('error');
    });
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

const currentGames = [];

function createGameId() {
    let id = '';

    do {
        id = '';
        const vocab = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        for (let i = 0; i < 6; i++) {
            id += vocab.charAt(Math.floor(Math.random() * vocab.length));
        }
    } while (currentGames.indexOf(id) !== -1);

    return id;
}

app.get('/createGame', (req, res) => {
    res.send({
        id: createGameId(),
    });

    // if (webSocket) {
    //     webSocket.send(req.param('action'));
    // }
});

app.listen(4000);
