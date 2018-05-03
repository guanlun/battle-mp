const Army = require('./Army');
const Soldier = require('./Soldier');
const Horseman = require('./Horseman');

const DEV_SP = true;
// const DEV_SP = false;

module.exports = class BattleManager {
    constructor() {
        this.players = {};

        this.reload();
    }

    reload() {
        this.redArmy = new Army('red');
        this.blueArmy = new Army('blue');
        this.obstacles = [];
        this.frame = 0;
    }

    rematch(username) {
        this.players[username].ended = false;

        const opponentPlayer = this.getOpponentPlayer(username);

        if (DEV_SP) {
            opponentPlayer.ended = false;
        }

        if (!opponentPlayer.ended) {
            this.broadcast('rematchReady');
        }
    }

    addPlayer(username, socket) {
        if (this.players[username]) {
            // already in game
            return;
        }

        const player = this.players[username] = {
            socket,
            soldiers: [],
            exited: false,
            ended: false,
        };

        if (DEV_SP) { // single player dev mode
            this.players['DEV_OPPONENT'] = {
                socket: null,
                soldiers: [],
                playerIdx: 0,
                exited: false,
                ended: false,
            };

            player.playerIdx = 1;

            this.sendMessage(player, 'ready', { playerIdx: 1 });
        } else {
            const opponentPlayer = this.getOpponentPlayer(username);

            if (opponentPlayer) {
                player.playerIdx = 1;
                this.sendMessage(opponentPlayer, 'ready', { playerIdx: 0 });
                this.sendMessage(player, 'ready', { playerIdx: 1 });
            } else {
                player.playerIdx = 0;
                this.sendMessage(player, 'joined');
            }
        }
    }

    deployFormation(username, soldiers) {
        const player = this.players[username];

        if (!player) {
            return;
        }

        this.loadSoldiers(player.playerIdx, soldiers);

        if (DEV_SP) { // single player dev mode
            // dummy soldiers for the dev opponent
            this.loadSoldiers(0, [
                { x: 50, y: 100, type: 'sword' },
                { x: 50, y: 200, type: 'sword' },
                { x: 50, y: 300, type: 'sword' },
                { x: 150, y: 100, type: 'sword' },
                { x: 150, y: 200, type: 'sword' },
                { x: 150, y: 300, type: 'sword' },
                { x: 250, y: 100, type: 'sword' },
                { x: 250, y: 200, type: 'sword' },
                { x: 250, y: 300, type: 'sword' },
                { x: 350, y: 100, type: 'sword' },
                { x: 350, y: 200, type: 'sword' },
                { x: 350, y: 300, type: 'sword' },
                { x: 450, y: 100, type: 'sword' },
                { x: 450, y: 200, type: 'sword' },
                { x: 450, y: 300, type: 'sword' },
            ]);

            this.startSimulation();
        } else {
            const opponentPlayer = this.getOpponentPlayer(username);

            if (this.isArmyLoaded(opponentPlayer.playerIdx)) {
                this.startSimulation();
            }
        }
    }

    getOpponentPlayer(playerId) {
        for (const pid of Object.keys(this.players)) {
            if (pid !== playerId) {
                return this.players[pid];
            }
        }
    }

    simulate() {
        this.redArmy.simulate(this.frame, this);
        this.blueArmy.simulate(this.frame, this);

        const redLost = this.redArmy.soldiers.every(s => !s.alive);
        const blueLost = this.blueArmy.soldiers.every(s => !s.alive);

        this.frame++;

        const battleState = {
            red: this.redArmy.soldiers.map(s => s.serialize()),
            blue: this.blueArmy.soldiers.map(s => s.serialize()),
        };

        this.broadcast('battleUpdate', { battleState });

        if (redLost || blueLost) {
            this.broadcast('ended', { winner: redLost ? 1 : 0 });
            this.stopSimulation();
            return;
        }
    }

    startSimulation() {
        this.broadcast('battleStarted');
        this.gameRuntime = setInterval(this.simulate.bind(this), 20);
    }

    stopSimulation() {
        this.reload();
        for (const username of Object.keys(this.players)) {
            this.players[username].ended = true;
        }
        clearInterval(this.gameRuntime);
    }

    sendMessage(player, type, payload = {}) {
        player.socket.send(JSON.stringify({
            type,
            payload,
        }), error => {
            if (error) {
                player.exited = true;
            }
        });
    }

    broadcast(type, payload) {
        for (const username of Object.keys(this.players)) {
            const player = this.players[username];
            if (!player.exited && player.socket) {
                this.sendMessage(player, type, payload);
            }
        }
    }

    loadSoldiers(playerIdx, soldierSpecs) {
        const army = playerIdx === 0 ? this.redArmy : this.blueArmy;
        const xOffset = playerIdx === 0 ? 0 : 650;

        for (const s of soldierSpecs) {
            if (s.type === 'horse') {
                army.addSoldier(new Horseman(s.x + xOffset, s.y));
            } else {
                army.addSoldier(new Soldier(s.x + xOffset, s.y, s.type));
            }
        }

        army.loaded = true;
    }

    isArmyLoaded(playerIdx) {
        const army = playerIdx === 0 ? this.redArmy : this.blueArmy;

        return army.loaded;
    }
}
