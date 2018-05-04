const Army = require('./Army');
const Soldier = require('./Soldier');
const Horseman = require('./Horseman');

const DEV_SP = true;
// const DEV_SP = false;

module.exports = class BattleManager {
    constructor() {
        this.players = {};

        this.reload();

        this.battleFieldWidth = 1250;
        this.battleFieldHeight = 600;
    }

    reload() {
        this.ongoing = false;
        this.redArmy = new Army('red', this);
        this.blueArmy = new Army('blue', this);
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

    playerExit(username) {
        const player = this.players[username];
        if (player) {
            player.exited = true;
        }

        const opponent = this.getOpponentPlayer(username);
        this.sendMessage(opponent, 'opponentExit');
    }

    addPlayer(username, socket) {
        let player = this.players[username];
        if (player) {
            if (player.exited) {
                player.socket = socket;
                player.exited = false;
                player.ended = false;

                const opponent = this.getOpponentPlayer(username);
                if (this.ongoing) {
                    this.sendMessage(player, 'rejoin', { playerIdx: player.playerIdx, opponentName: opponent.username });
                } else {
                    this.sendMessage(player, 'ready', { playerIdx: player.playerIdx, opponentName: opponent.username });
                }
            } else {
                socket.send(JSON.stringify({ type: 'duplicatedPlayer' }));
            }

            return;
        } else {
            // player with this username does not exist
            if (Object.keys(this.players).length >= 2) {
                socket.send(JSON.stringify({ type: 'maxPlayerNum'}))
                return;
            }
        }

        this.players[username] = player = {
            username,
            socket,
            soldiers: [],
            exited: false,
            ended: false,
        };

        if (DEV_SP) { // single player dev mode
            this.players['DEV_OPPONENT'] = {
                username: 'DEV_OPPONENT',
                socket: null,
                soldiers: [],
                playerIdx: 0,
                exited: false,
                ended: false,
            };

            player.playerIdx = 1;

            this.sendMessage(player, 'ready', { playerIdx: 1, opponentName: 'DEV_OPPONENT' });
        } else {
            const opponentPlayer = this.getOpponentPlayer(username);

            if (opponentPlayer) {
                player.playerIdx = 1;
                this.sendMessage(opponentPlayer, 'ready', { playerIdx: 0, opponentName: username });
                this.sendMessage(player, 'ready', { playerIdx: 1, opponentName: opponentPlayer.username });
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

            const soldiers = [];
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 10; j++) {
                    soldiers.push({
                        x: 300 + i * 20,
                        y: j * 30,
                        type: 'sword',
                    });
                }
            }
            this.loadSoldiers(0, soldiers);
            // this.loadSoldiers(0, [
            //     { x: 50, y: 100, type: 'sword' },
            //     { x: 50, y: 200, type: 'sword' },
            //     { x: 50, y: 300, type: 'sword' },
            //     { x: 150, y: 100, type: 'sword' },
            //     { x: 150, y: 200, type: 'sword' },
            //     { x: 150, y: 300, type: 'sword' },
            //     { x: 250, y: 100, type: 'sword' },
            //     { x: 250, y: 200, type: 'sword' },
            //     { x: 250, y: 300, type: 'sword' },
            //     { x: 350, y: 100, type: 'sword' },
            //     { x: 350, y: 200, type: 'sword' },
            //     { x: 350, y: 300, type: 'sword' },
            //     { x: 450, y: 100, type: 'sword' },
            //     { x: 450, y: 200, type: 'sword' },
            //     { x: 450, y: 300, type: 'sword' },
            // ]);

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
        this.ongoing = true;
    }

    stopSimulation() {
        this.reload();
        for (const username of Object.keys(this.players)) {
            this.players[username].ended = true;
        }
        clearInterval(this.gameRuntime);
    }

    sendMessage(player, type, payload = {}) {
        if (!player.socket) {
            console.log(`Player ${player.username}'s socket is undefined`)
            return;
        }

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
