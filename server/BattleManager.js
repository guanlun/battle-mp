const Army = require('./Army');
const Soldier = require('./Soldier');
const Horseman = require('./Horseman');

module.exports = class BattleManager {
    constructor() {
        this.players = [];

        this.redArmy = new Army('red');
        this.blueArmy = new Army('blue');
        this.obstacles = [];
        // this.simulating = false;

        this.frame = 0;

        this.simulationCallbacks = [];
    }

    simulate() {
        this.redArmy.simulate(this.frame, this);
        this.blueArmy.simulate(this.frame, this);

        this.frame++;

        const battleState = {
            red: this.redArmy.soldiers.map(s => s.serialize()),
            blue: this.blueArmy.soldiers.map(s => s.serialize()),
        };

        for (const cb of this.simulationCallbacks) {
            cb(battleState);
        }
    }

    registerCallback(cb) {
        this.simulationCallbacks.push(cb);
    }

    startSimulation() {
        this.gameRuntime = setInterval(this.simulate.bind(this), 20);
    }

    stopSimulation() {
        clearInterval(this.gameRuntime);
    }

    loadSoldiers(playerIdx, soldierSpecs) {
        const army = playerIdx === 0 ? this.redArmy : this.blueArmy;
        const xOffset = playerIdx === 0 ? 0 : 400;

        for (const s of soldierSpecs) {
            army.addSoldier(new Soldier(s.x + xOffset, s.y, s.type));
        }

        army.loaded = true;
    }

    isArmyLoaded(playerIdx) {
        const army = playerIdx === 0 ? this.redArmy : this.blueArmy;

        return army.loaded;
    }
}
