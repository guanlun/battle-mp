const Army = require('./Army');
const Soldier = require('./Soldier');
const Horseman = require('./Horseman');

// const DEV_SP = true;
const DEV_SP = false;

module.exports = class BattleManager {
    constructor() {
        this.players = {};

        this.redArmy = new Army('red');
        this.blueArmy = new Army('blue');
        this.obstacles = [];
        // this.simulating = false;

        this.frame = 0;

        this.simulationCallbacks = [];
    }

    addPlayer(username, socket) {
        this.players[username] = {
            socket,
            soldiers: [],
            exited: false,
        };

        if (DEV_SP) { // single player dev mode
            this.players['DEV_OPPONENT'] = {
                socket: null,
                soldiers: [],
                playerIdx: 0,
                exited: false,
            };

            this.players[username].playerIdx = 1;

            socket.send(JSON.stringify({ type: 'ready', payload: { playerIdx: 1 }}));
        } else {
            const opponentPlayer = this.getOpponentPlayer(username);

            if (opponentPlayer) {
                this.players[username].playerIdx = 1;
                opponentPlayer.socket.send(JSON.stringify({ type: 'ready', payload: { playerIdx: 0 }}));
                socket.send(JSON.stringify({ type: 'ready', payload: { playerIdx: 1 }}));
            } else {
                this.players[username].playerIdx = 0;
                socket.send(JSON.stringify({ type: 'joined' }))
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

        this.frame++;

        const battleState = {
            red: this.redArmy.soldiers.map(s => s.serialize()),
            blue: this.blueArmy.soldiers.map(s => s.serialize()),
        };

        this.broadcast('battleUpdate', { battleState });
    }

    broadcast(type, payload) {
        for (const username of Object.keys(this.players)) {
            const player = this.players[username];
            if (!player.exited && player.socket) {
                player.socket.send(JSON.stringify({
                    type,
                    payload,
                }), error => {
                    if (error) {
                        player.exited = true;
                    }
                });
            }
        }
    }

    startSimulation() {
        this.broadcast('battleStarted');
        this.gameRuntime = setInterval(this.simulate.bind(this), 20);
    }

    stopSimulation() {
        clearInterval(this.gameRuntime);
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
