const Utils = require('./Utils');

const Sword = require('./Sword');
const Spear = require('./Spear');
const Shield = require('./Shield');
const Bow = require('./Bow');

const CROSS_SIZE = 5;

module.exports = class Soldier {
    constructor(x, y, weaponType) {
        this.attackInterval = 60;
        this.speedLimit = 1;
        this.dimension = 5;

        this.hp = 100;

        this.position = {
            x: x,
            y: y,
        };

        this.velocity = {
            x: 0,
            y: 0,
        };

        this.facing = {
            x: 0,
            y: -1,
        };

        this.state = 'moving';
        this.target = null;

        this.alive = true;

        this.lastAttackFrame = 0;
        this.attackAnimationFrame = 0;
        this.attackCooldown = 0;

        switch (weaponType) {
            case 'sword':
                this.weapon = new Sword();
                this.maxMovingSpeed = 0.6;
                break;
            case 'spear':
                this.weapon = new Spear();
                this.maxMovingSpeed = 0.4;
                break;
            case 'shield':
                this.weapon = new Shield();
                this.maxMovingSpeed = 0.4;
                break;
            case 'bow':
                this.weapon = new Bow();
                this.maxMovingSpeed = 0.7;
                break;
        }
    }

    simulate(frame, friendly, enemy, obstacles, isDefending = false) {
        if (!this.alive) {
            return;
        }

        const target = this.findTarget(enemy.soldiers);

        if (target === null) {
            return;
        }

        const dist = this.distTo(target);

        let newFacingX, newFacingY;

        let obstacleApproaching = false;

        if (!Utils.isZeroVec(this.velocity)) {
            for (let oi = 0; oi < obstacles.length; oi++) {
                const o = obstacles[oi];

                const vecToObstacleCenter = Utils.sub(o.position, this.position);

                const movingDir = Utils.normalize(this.velocity);
                const closingDist = Utils.dot(vecToObstacleCenter, movingDir);

                if (closingDist < 0 || closingDist > o.radius) {
                    continue;
                }

                const closestPosition = Utils.add(this.position, Utils.scalarMult(closingDist, movingDir));
                const outwardDir = Utils.sub(closestPosition, o.position);
                const closestDistToCenter = Utils.dim(outwardDir);

                if (closestDistToCenter > o.radius) {
                    continue;
                }

                const outwardUnitDir = Utils.normalize(outwardDir);
                const turningTargetPosition = Utils.add(o.position, Utils.scalarMult(o.radius, outwardUnitDir));

                const turiningDirection = Utils.sub(turningTargetPosition, this.position);

                newFacingX = turiningDirection.x;
                newFacingY = turiningDirection.y;

                obstacleApproaching = true;

                break;
            }
        }

        if (!obstacleApproaching) {
            newFacingX = (target.position.x - this.position.x) / dist;
            newFacingY = (target.position.y - this.position.y) / dist;
        }

        const newFacingAngle = Math.atan2(newFacingY, newFacingX);
        let currFacingAngle = Math.atan2(this.facing.y, this.facing.x);

        const rotationSpeed = this.weapon.rotationSpeed;

        if (newFacingAngle > currFacingAngle) {
            if (newFacingAngle - currFacingAngle < Math.PI) {
                currFacingAngle = Math.min(newFacingAngle, currFacingAngle + rotationSpeed);
            } else {
                currFacingAngle = Math.min(newFacingAngle, currFacingAngle - rotationSpeed);
            }
        } else {
            if (currFacingAngle - newFacingAngle < Math.PI) {
                currFacingAngle = Math.max(newFacingAngle, currFacingAngle - rotationSpeed);
            } else {
                currFacingAngle = Math.max(newFacingAngle, currFacingAngle + rotationSpeed);
            }
        }

        this.facing.x = Math.cos(currFacingAngle);
        this.facing.y = Math.sin(currFacingAngle);

        if (this.state === 'moving') {
            this.target = target;

            if (this.attackCooldown > 0) {
                this.attackCooldown--;
            }

            if (dist > this.weapon.length) {
                this.velocity.x += this.facing.x * 0.02;
                this.velocity.y += this.facing.y * 0.02;

                if (Utils.dim(this.velocity) > this.maxMovingSpeed) {
                    this.velocity = Utils.normalize(this.velocity);

                    this.velocity.x *= this.maxMovingSpeed;
                    this.velocity.y *= this.maxMovingSpeed;
                }

                friendly.soldiers.forEach(f => {
                    if (f === this || !f.alive) {
                        return;
                    }

                    const xDiff = f.position.x - this.position.x;
                    const yDiff = f.position.y - this.position.y;

                    const dist = Utils.distance(this.position, f.position);

                    if (dist < 10) {
                        this.velocity.x -= 0.5 / dist * xDiff;
                        this.velocity.y -= 0.5 / dist * yDiff;
                    }
                });

                if (!isDefending) {
                    this.position.x += this.velocity.x;
                    this.position.y += this.velocity.y;
                }

            } else if (dist < this.weapon.minRange) {
                this.state = 'backing-up';

            } else {
                this.attack(target, frame);
            }
        } else if (this.state === 'backing-up') {
            if (dist > this.weapon.minRange) {
                this.state = 'moving';
            }

            this.position.x -= this.facing.x * 0.5;
            this.position.y -= this.facing.y * 0.5;
        }

        if (this.attackCooldown === 0) {
            const facing = Math.atan2(this.facing.y, this.facing.x) + Math.PI / 2;

            this.weapon.simulate(this, target, facing);
        }
    }

    attackCompleted() {
        this.attackCooldown = 30;
    }

    handleAttack(attackWeapon, angle) {
        const damage = this.weapon.defend(attackWeapon, angle);

        if (damage > 0) {
            this.hp -= damage;

            this.velocity.x = 0;
            this.velocity.y = 0;

            if (this.hp <= 0) {
                this.alive = false;
            }
        }
    }

    attack(target, frame) {
        this.weapon.attack();
    }

    renderAlive(ctx) {
        ctx.arc(0, 0, this.dimension, 0, Math.PI * 2);
        ctx.fill();

        this.weapon.render(ctx);
    }

    distTo(soldier) {
        const xDiff = soldier.position.x - this.position.x;
        const yDiff = soldier.position.y - this.position.y;

        return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    }

    findTarget(enemySoldiers, angle) {
        if (angle === undefined) {
            angle = Math.PI;
        }

        let minDist = Number.MAX_VALUE;
        let target = null;

        for (let i = 0; i < enemySoldiers.length; i++) {
            const es = enemySoldiers[i];

            if (!es.alive) {
                continue;
            }

            const diff = Utils.sub(es.position, this.position);
            if (Utils.angleBetween(diff, this.facing) < Math.cos(angle)) {
                continue;
            }

            const dist = this.distTo(es);

            if (dist < minDist) {
                minDist = dist;

                target = es;
            }
        }

        return target;
    }

    serialize() {
        return {
            alive: this.alive,
            position: this.position,
            facing: this.facing,
            dimension: this.dimension,
            weapon: this.weapon.serialize(),
        };
    }
}
