const Army = require('./Army');
const Soldier = require('./Soldier');
const Horseman = require('./Horseman');

module.exports = class BattleManager {
    constructor() {
        this.redArmy = new Army('red');
        this.blueArmy = new Army('blue');
        this.obstacles = [];
        // this.simulating = false;

        this.frame = 0;
    }

    simulate() {
        this.redArmy.simulate(this.frame, this);
        this.blueArmy.simulate(this.frame, this);

        this.frame++;

        const battleState = {
            red: this.redArmy.soldiers.map(s => s.serialize()),
            blue: this.blueArmy.soldiers.map(s => s.serialize()),
        };

        this.simulationCallback(battleState);
    }

    startSimulation(cb) {
        this.gameRuntime = setInterval(this.simulate.bind(this), 30);
        this.simulationCallback = cb;
    }

    stopSimulation() {
        clearInterval(this.gameRuntime);
    }

    loadSoldiers(playerIdx, soldierSpecs) {
        const army = playerIdx === 0 ? this.redArmy : this.blueArmy;
        const xOffset = playerIdx === 0 ? 0 : 400;

        for (const s of soldierSpecs) {
            army.addSoldier(new Soldier(s.x + xOffset, s.y, 'sword'));
        }
    }
}
