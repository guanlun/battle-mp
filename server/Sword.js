const Utils = require('./Utils');
const Weapon = require('./Weapon');

module.exports = class Sword extends Weapon {
    constructor() {
        super();

        this.length = 20;
        this.damage = 30;

        this.minRange = 0;

        this.rotationSpeed = 0.1;

        this.currAttackFrame = 0;

        this.startPos = {
            x: 2,
            y: -5,
        };

        this.offsetAngle = Math.PI / 4;

        this.status = 'holding';

        this.type = 'sword';
    }

    simulate(holder, target, facing) {
        if (this.status === 'out') {
            this.currAttackFrame++;

            const pointing = facing - this.offsetAngle;

            const normalX = Math.cos(pointing);
            const normalY = Math.sin(pointing);

            const diff = {
                x: target.position.x - holder.position.x,
                y: target.position.y - holder.position.y,
            };

            const weaponDist = Math.abs(diff.x * normalX + diff.y * normalY);

            if (weaponDist < 5) {
                this.status = 'back';

                const combatDir = Utils.normalize(diff);
                const attackAngle = Utils.dot(combatDir, target.facing);

                const targetDist = Utils.dim(Utils.sub(holder.position, target.position));

                if (targetDist < 25) {
                    target.handleAttack(this, attackAngle);
                }
            }
        } else if (this.status === 'back') {
            this.currAttackFrame--;

            if (this.currAttackFrame === 0) {
                this.status = 'holding';
            }
        }
    }

    render(ctx) {
        this.offsetAngle = Math.PI / 4 * (1 - this.currAttackFrame / 30);
        ctx.save();
        ctx.rotate(this.offsetAngle);

        ctx.beginPath();
        ctx.moveTo(this.startPos.x, this.startPos.y);
        ctx.lineTo(this.startPos.x, this.startPos.y - this.length);
        ctx.quadraticCurveTo(this.startPos.x - 5, this.startPos.y + 3, this.startPos.x, this.startPos.y);
        ctx.closePath();

        ctx.moveTo(this.startPos.x - 4, this.startPos.y - 2);
        ctx.lineTo(this.startPos.x + 3, this.startPos.y - 2);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
    }
}
