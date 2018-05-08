const Utils = require('./Utils');
const Arrow = require('./Arrow');
const Constants = require('./Constants');

const DRAW_DISTANCE = 8;
const DRAW_TIME = 8;
const LOOSE_TIME = 4;
const DRAW_AMOUNT_PER_FRAME = DRAW_DISTANCE / DRAW_TIME;
const LOOSE_AMOUNT_PER_FRAME = DRAW_DISTANCE / LOOSE_TIME;

module.exports = class Bow {
    constructor(holder) {
        this.holder = holder;

        this.length = 400;
        this.minRange = 30;

        this.damage = 50;

        this.rotationSpeed = 0.04;

        this.currAttackFrame = 0;

        this.startPos = {
            x: 0,
            y: -5,
        };

        this.drawPosOffset = 0;

        this.status = 'holding';
        this.type = 'bow';

        this.attackOngoing = false;
    }

    simulate(holder, target, facing) {
        if (this.status === 'drawing') {
            if (this.currAttackFrame === 0) {
                this.holder.addProjectile(this.arrow);
            } else if (this.currAttackFrame === 10) {
                this.status = 'loosing';
            }

            if (this.currAttackFrame < DRAW_TIME) {
                this.drawPosOffset += DRAW_AMOUNT_PER_FRAME;

                this.arrow.position = Utils.add(this.arrow.position, Utils.scalarMult(-DRAW_AMOUNT_PER_FRAME, this.arrow.facing));
            }

            this.currAttackFrame++;
        } else if (this.status === 'loosing') {
            if (this.currAttackFrame === 11) {
                const targetDist = Utils.dim(Utils.sub(target.position, holder.position));
                this.arrow.shoot(facing, targetDist);

                this.arrow = null;
            }

            if (this.currAttackFrame < 10 + LOOSE_TIME) {
                this.drawPosOffset -= LOOSE_AMOUNT_PER_FRAME;
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
            this.arrow = new Arrow(this.holder.position, this.holder.facing, this.holder.army.side, this.holder);

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
