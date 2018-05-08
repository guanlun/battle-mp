module.exports = class Army {
    constructor(side, battleManager) {
        this.side = side;
        this.soldiers = [];

        this.loaded = false;
        this.battleManager = battleManager;

        this.defensiveStance = false;
    }

    simulate(frame, state) {
        this.soldiers.forEach(s => {
            if (this.side === 'red') {
                s.simulate(frame, this, state.blueArmy, state.obstacles, this.defensiveStance);
            } else {
                s.simulate(frame, this, state.redArmy, state.obstacles, this.defensiveStance);
            }
        });
    }

    render(ctx) {
        const color = this.side;
        this.soldiers.forEach(s => {
            s.render(ctx, color);
        });
    }

    addSoldier(s) {
        s.army = this;

        if (this.side === 'red') {
            s.facing = {
                x: 1,
                y: 0,
            };
        } else {
            s.facing = {
                x: -1,
                y: 0,
            };
        }
        this.soldiers.push(s);
    }

    clear() {
        this.soldiers = [];
    }

    getBattleFieldSize() {
        return {
            width: this.battleManager.battleFieldWidth,
            height: this.battleManager.battleFieldHeight,
        };
    }
}
