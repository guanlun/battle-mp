const DEV_SP = false;

module.exports = class BattleManager {
    constructor() {
        this.players = {};

        this.reload();

        this.map = new Map();
    }

    reload() {
        this.ongoing = false;
        this.addedSoldiers = [];
    }

    checkSimulationEnd(username) {
        this.players[username].ended = true;

        const opponentPlayer = this.getOpponentPlayer(username);

        if (DEV_SP) {
            opponentPlayer.ended = true;
        }

        if (opponentPlayer.ended) {
            this.broadcast('ended');
        }
    }

    rematch(username) {
        this.players[username].ended = false;

        const opponentPlayer = this.getOpponentPlayer(username);

        if (DEV_SP) {
            opponentPlayer.ended = false;
        }

        if (!opponentPlayer.ended) {
            this.reload();
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
                    if (opponent) {
                        this.sendMessage(player, 'ready', { playerIdx: player.playerIdx, opponentName: opponent.username });
                    } else {
                        this.sendMessage(player, 'joined');
                    }
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

        // this.loadSoldiers(player.playerIdx, soldiers);

        this.addedSoldiers[player.playerIdx] = soldiers;

        if (DEV_SP) { // single player dev mode
            // dummy soldiers for the dev opponent

            const soldiers = [];
            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 10; j++) {
                    soldiers.push({
                        x: 300 + i * 20,
                        y: 200 + j * 30,
                        type: 'bow',
                    });
                }
            }
            // this.loadSoldiers(0, soldiers);
            this.addedSoldiers[0] = soldiers;

            this.startBattle();
        } else {
            const opponentPlayer = this.getOpponentPlayer(username);

            // other army loaded
            if (this.addedSoldiers[1 - player.playerIdx]) {
                this.startBattle();
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

    startBattle() {
        const randomSeed = Math.round(Math.random() * 1000);
        this.broadcast('battleStarted', { randomSeed, soldiers: this.addedSoldiers });
        this.ongoing = true;
    }

    sendMessage(player, type, payload = {}) {
        if (!player) {
            console.log(`Player not joined`);
            return;
        }

        if (!player.socket) {
            console.log(`Player ${player.username}'s socket is undefined`);
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

    isArmyLoaded(playerIdx) {
        const army = playerIdx === 0 ? this.redArmy : this.blueArmy;

        return army.loaded;
    }
}
