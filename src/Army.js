import Soldier from './Soldier';
import Horseman from './Horseman';

export default class Army {
    constructor(side, soldierSpecs, battleSimulator) {
        this.side = side;
        this.soldiers = [];

        this.loaded = false;
        this.battleSimulator = battleSimulator;

        for (const soldierSpec of soldierSpecs) {
            this.addSoldier(soldierSpec, side === 'red' ? 0 : 650);
        }

        this.defensiveStance = false;
    }

    simulate(frame, state) {
        this.soldiers.forEach(s => {
            if (this.side === 'red') {
                s.simulate(frame, this, state.blueArmy, this.defensiveStance);
            } else {
                s.simulate(frame, this, state.redArmy, this.defensiveStance);
            }
        });
    }

    render(ctx) {
        const color = this.side;
        this.soldiers.forEach(s => {
            s.render(ctx, color);
        });
    }

    addSoldier(s, xOffset) {
        let soldier;

        if (s.type === 'horse') {
            soldier = new Horseman(s.x + xOffset, s.y, this, this.battleSimulator);
        } else {
            soldier = new Soldier(s.x + xOffset, s.y, this, s.type, this.battleSimulator);
        }

        this.soldiers.push(soldier);
    }

    clear() {
        this.soldiers = [];
    }

    getBattleFieldSize() {
        return {
            width: this.battleSimulator.battleFieldWidth,
            height: this.battleSimulator.battleFieldHeight,
        };
    }
}
