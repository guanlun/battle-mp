const Utils = require('./Utils');
const Constants = require('./Constants');

module.exports = class Arrow {
    constructor(position, facing, side) {
        this.shot = false;
        this.defunct = false;

        this.velocity = {
            x: 0,
            y: 0,
        };

        this.position = {
            x: position.x,
            y: position.y,
        };

        this.facing = {
            x: facing.x,
            y: facing.y,
        };

        this.length = 20;
        this.side = side;
    }

    simulate(enemies) {
        if (!this.shot || this.defunct) {
            return;
        }

        const lastPos = Utils.copy(this.position);
        this.position = Utils.add(this.position, this.velocity);

        for (const enemy of enemies) {
            if (!enemy.alive) {
                continue;
            }

            const lastPosToEnemyPos = Utils.sub(enemy.position, lastPos);
            const directionVelocityAngleCos = Utils.cosAngleBetween(lastPosToEnemyPos, this.velocity);
            const directionVelocityAngleSin = Math.sqrt(1 - directionVelocityAngleCos * directionVelocityAngleCos)
            const enemyPositionToArrowPathDist = Utils.dim(Utils.scalarMult(directionVelocityAngleSin, lastPosToEnemyPos));

            if (enemyPositionToArrowPathDist >= 5) {
                continue;
            }

            const distAlongArrowVelocity = Utils.dim(Utils.scalarMult(directionVelocityAngleCos, lastPosToEnemyPos));
            if (distAlongArrowVelocity <= Utils.dim(this.velocity) && distAlongArrowVelocity >= 0) {
                // TODO: add defense mechanism for arrows
                enemy.takeDamage(20);
                this.defunct = true;

                break;
            }
        }
    }

    shoot(direction) {
        const errorAmount = 0.05;
        const erroredDirection = direction + (Math.random() * errorAmount - errorAmount / 2);

        this.velocity = {
            x: Math.sin(erroredDirection) * 12,
            y: -Math.cos(erroredDirection) * 12,
        };
        this.facing = {
            x: Math.sin(erroredDirection),
            y: -Math.cos(erroredDirection),
        };
        this.shot = true;
    }

    serialize() {
        return {
            type: this.type,
            startPos: this.startPos,
            facing: this.facing,
            length: this.length,
            side: this.side,
            defunct: this.defunct,
        };
    }
}
