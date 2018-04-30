const Utils = require('./Utils');
const Weapon = require('./Weapon');

module.exports = class Spear extends Weapon {
    constructor() {
        super();

        this.length = 60;
        this.minRange = 40;

        this.damage = 50;

        this.rotationSpeed = 0.04;

        this.currAttackFrame = 0;

        this.startPos = {
            x: 2,
            y: -5,
        };

        this.offsetPos = 20;

        this.status = 'holding';

        this.type = 'spear';
    }

    simulate(holder, target, facing) {
        if (this.status === 'out') {
            this.currAttackFrame++;

            if (this.currAttackFrame === 20) {
                this.status = 'back';
            }

            this.offsetPos = 20 - this.currAttackFrame;

            const reach = this.length - this.offsetPos;

            const headPos = {
                x: holder.position.x + reach * Math.sin(facing),
                y: holder.position.y - reach * Math.cos(facing),
            }

            const diff = {
                x: target.position.x - holder.position.x,
                y: target.position.y - holder.position.y,
            };

            const relativeVel = Utils.sub(target.velocity, holder.velocity);
            const combatDir = Utils.normalize(diff);

            const relativeClosingSpeed = Utils.dot(relativeVel, combatDir);

            const attackFrameThreshold = 10 / relativeClosingSpeed;

            const dist = Utils.dim(Utils.sub(headPos, target.position));

            if (dist < 5 && this.currAttackFrame > attackFrameThreshold) {
                this.status = 'back';

                const attackAngle = Utils.dot(combatDir, target.facing);

                target.handleAttack(this, attackAngle, relativeClosingSpeed);

                holder.attackCompleted();
            }
        } else if (this.status === 'back') {
            this.currAttackFrame--;

            this.offsetPos = 20 - this.currAttackFrame;

            if (this.currAttackFrame === 0) {
                this.status = 'holding';
            }
        }
    }

    render(ctx) {
        ctx.save();
        ctx.translate(0, this.offsetPos);

        ctx.beginPath();
        ctx.moveTo(this.startPos.x, this.startPos.y - this.length);
        ctx.lineTo(this.startPos.x, this.startPos.y);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
    }
}
