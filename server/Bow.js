const Utils = require('./Utils');

const Constants = require('./Constants');

module.exports = class Bow {
    constructor() {
        this.length = 400;
        this.minRange = 0;

        this.damage = 50;

        this.rotationSpeed = 0.04;

        this.currAttackFrame = 0;

        this.startPos = {
            x: 2,
            y: -5,
        };

        this.offsetPos = 20;

        this.status = 'holding';

        this.type = 'bow';

        this.arrowVel = {
            x: 0,
            y: 0,
        };

        this.arrowPos = {
            x: 0,
            y: 0,
        }
    }

    simulate(holder, target, facing) {
        if (this.status === 'out') {
            if (this.currAttackFrame === 0) {
                this.arrowVel = {
                    x: Math.cos(facing) * 5,
                    y: Math.sin(facing) * 5,
                };

                this.offsetPos = {
                    x: 0,
                    y: 0,
                };
            }

            this.currAttackFrame++;

            if (this.currAttackFrame === 50) {
                this.currAttackFrame = 0;
            }

            this.arrowPos.x += this.arrowVel.x;
            this.arrowPos.y += this.arrowVel.y;
        }
    }

    attack() {
        if (this.status === 'holding') {
            this.status = 'out';
        }
    }

    defend(attackWeapon, attackAngle) {
        const blockChance = Constants.BLOCK_CHANCE[this.type];

        const rand = Math.random();

        if (attackAngle < blockChance.angle) {
            if (rand > blockChance[attackWeapon.type]) {
                return attackWeapon.damage;
            }
        } else {
            if (rand > 0.2) {
                return attackWeapon.damage;
            }
        }

        return 0;
    }


    render(ctx) {
        ctx.save();
        ctx.translate(this.arrowPos.x, this.arrowPos.y);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 20);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();

        ctx.beginPath();
        ctx.moveTo(this.startPos.x, this.startPos.y);
        ctx.lineTo(this.startPos.x - 10, this.startPos.y - 10);
        ctx.quadraticCurveTo(this.startPos.x, this.startPos.y - 15, this.startPos.x + 10, this.startPos.y - 10);
        ctx.closePath();
        ctx.stroke();
    }
}
