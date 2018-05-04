const Utils = require('./Utils');
const Arrow = require('./Arrow');
const Constants = require('./Constants');

module.exports = class Bow {
    constructor(holder) {
        this.holder = holder;

        this.length = 400;
        this.minRange = 0;

        this.damage = 50;

        this.rotationSpeed = 0.04;

        this.currAttackFrame = 0;

        this.startPos = {
            x: 2,
            y: -5,
        };

        this.drawPosOffset = 0;

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

        this.attackOngoing = false;
    }

    simulate(holder, target, facing) {
        if (this.status === 'drawing') {
            if (this.currAttackFrame === 0) {
                this.holder.addProjectile(this.arrow);
            } else if (this.currAttackFrame === 10) {
                this.status = 'loosing';
            }

            if (this.currAttackFrame < 6) {
                this.drawPosOffset += 6 / 6;
            }

            this.currAttackFrame++;
        } else if (this.status === 'loosing') {
            if (this.currAttackFrame === 11) {
                this.arrow.shoot(facing);

                this.arrow = null;
            }

            if (this.currAttackFrame < 13) {
                this.drawPosOffset -= 6 / 3;
            }

            this.currAttackFrame++;

            if (this.currAttackFrame === 50) {
                this.status = 'holding';
                this.currAttackFrame = 0;
                this.drawPosOffset = 0;
            }
        }
    }

    attack() {
        if (this.status === 'holding') {
            this.arrow = new Arrow(this.holder.position, this.holder.facing, this.holder.army.side);

            this.status = 'drawing';
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

    serialize() {
        return {
            type: this.type,
            startPos: this.startPos,
            currAttackFrame: this.currAttackFrame,
            drawPosOffset: this.drawPosOffset,
        }
    }
}
