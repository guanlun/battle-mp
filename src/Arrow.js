import Utils from './Utils';

const ARROW_SPEED = 12;

export default class Arrow {
    constructor(position, facing, side, shooter) {
        this.shot = false;
        this.defunct = false;

        this.velocity = {
            x: 0,
            y: 0,
        };

        this.position = {
            x: position.x + facing.x * 5,
            y: position.y + facing.y * 5,
        };

        this.facing = Utils.copy(facing);

        this.targetDistance = 0;
        this.flyingDistance = 0;

        this.length = 10;
        this.side = side;

        this.type = 'arrow';
        this.damage = 20;
        this.shooter = shooter;
    }

    simulate(soldiers) {
        if (!this.shot || this.defunct) {
            return;
        }

        const lastPos = Utils.copy(this.position);
        this.position = Utils.add(this.position, this.velocity);

        this.flyingDistance += ARROW_SPEED;

        if (this.flyingDistance > this.targetDistance + 20) { // reached max distance
            this.defunct = true;
        } else if (this.targetDistance > 100 && this.flyingDistance < this.targetDistance * 0.8) { // still high in the air
            return;
        }

        for (const soldier of soldiers) {
            if (!soldier.alive || soldier === this.shooter) {
                continue;
            }

            const lastPosTosoldierPos = Utils.sub(soldier.position, lastPos);
            const directionVelocityAngleCos = Utils.cosAngleBetween(lastPosTosoldierPos, this.velocity);
            const directionVelocityAngleSin = Math.sqrt(1 - directionVelocityAngleCos * directionVelocityAngleCos)
            const soldierPositionToArrowPathDist = Utils.dim(Utils.scalarMult(directionVelocityAngleSin, lastPosTosoldierPos));

            if (soldierPositionToArrowPathDist >= 5) {
                continue;
            }

            const distAlongArrowVelocity = Utils.dim(Utils.scalarMult(directionVelocityAngleCos, lastPosTosoldierPos));
            if (distAlongArrowVelocity <= Utils.dim(this.velocity) && distAlongArrowVelocity >= 0) {
                const attackAngle = Utils.dot(Utils.normalize(this.velocity), soldier.facing);
                soldier.handleAttack(this, attackAngle);
                this.defunct = true;

                break;
            }
        }
    }

    shoot(direction, targetDistance) {
        const errorAmount = 0.04;
        const erroredDirection = direction + (Utils.random() * errorAmount - errorAmount / 2);

        this.velocity = {
            x: Math.sin(erroredDirection) * ARROW_SPEED,
            y: -Math.cos(erroredDirection) * ARROW_SPEED,
        };
        this.facing = {
            x: Math.sin(erroredDirection),
            y: -Math.cos(erroredDirection),
        };
        this.shot = true;

        this.targetDistance = targetDistance;
        this.flyingDistance = 0;
    }

    serialize() {
        return {
            type: this.type,
            position: this.position,
            startPos: this.startPos,
            facing: this.facing,
            length: this.length,
            side: this.side,
            defunct: this.defunct,
        };
    }
}
