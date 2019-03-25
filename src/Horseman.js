const Soldier = require('./Soldier');
const Utils = require('./Utils');

const OVERCHARGE_FRAME = 60;
const COOLDOWN_FRAME = 20;

module.exports = class Horseman extends Soldier {
    constructor(x, y, army, battleManager) {
        super(x, y, army, 'sword', battleManager);

        this.maxMovingSpeed = 3;

        this.weapon.rotationSpeed = 0.04;

        this.overcharge = OVERCHARGE_FRAME;

        this.attackCooldown = 0;

        this.speed = 0;

        this.isHorseman = true;

        this.hp = 100;
    }

    simulate(frame, friendly, enemy, obstacles) {
        if (!this.alive) {
            return;
        }

        const target = this.findTarget(enemy.soldiers, Math.PI / 3);

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
            if (target === null) {
                if (this.overcharge === 0) {
                    newFacingX = -this.facing.y;
                    newFacingY = this.facing.x;
                } else {
                    newFacingX = this.facing.x;
                    newFacingY = this.facing.y;

                    this.overcharge--;
                }
            } else {
                const dist = this.distTo(target);

                newFacingX = (target.position.x - this.position.x) / dist;
                newFacingY = (target.position.y - this.position.y) / dist;

                this.overcharge = OVERCHARGE_FRAME;
            }
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

            if (target && this.distTo(target) < this.weapon.length) {
                if (this.attackCooldown === 0) {
                    this.speed *= 0.5;

                    const rand = Math.random();

                    if (rand > 0.8) {
                        this.target.hp = 0; // Instant kill
                    } else if (rand > 0.2) {
                        this.target.hp -= this.speed * 40;
                    }

                    if (this.target.hp <= 0) {
                        this.target.alive = false;
                    }

                    this.attackCooldown = COOLDOWN_FRAME;
                }
            }

            if (this.speed < this.maxMovingSpeed) {
                this.speed += 0.05;
            }

            this.velocity.x = this.facing.x * this.speed;
            this.velocity.y = this.facing.y * this.speed;

            const speed = Utils.dim(this.velocity);

            friendly.soldiers.forEach(f => {
                if (f === this || !f.alive) {
                    return;
                }

                const xDiff = f.position.x - this.position.x;
                const yDiff = f.position.y - this.position.y;

                const dist = Utils.distance(this.position, f.position);

                if (dist < 25) {
                    this.velocity.x -= 1 / dist * xDiff;
                    this.velocity.y -= 1 / dist * yDiff;
                }
            });

            if (speed > this.maxMovingSpeed) {
                this.velocity.x *= this.maxMovingSpeed / speed;
                this.velocity.y *= this.maxMovingSpeed / speed;
            }

            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
        }
    }

    handleAttack(attackWeapon, angle, relativeClosingSpeed) {
        let damage = 0;

        const rand = Math.random();

        if (attackWeapon.type === 'spear') {
            if (angle < -0.7) {
                if (rand > 0.4) {
                    damage = Math.abs(relativeClosingSpeed) * 30;
                }
            } else {
                if (rand > 0.9) {
                    damage = 20;
                }
            }
        } else {
            if (angle < -0.3) {
                if (rand > 0.8) {
                    damage = 30;
                }
            } else {
                if (rand > 0.9) {
                    damage = 10;
                }
            }
        }

        if (damage > 0) {
            this.hp -= damage;

            this.speed *= 0.7;

            if (this.hp <= 0) {
                this.alive = false;
            }
        }
    }

    renderAlive(ctx) {
        ctx.beginPath();

        ctx.moveTo(0, -15);
        ctx.lineTo(10, 15);
        ctx.lineTo(-10, 15);

        ctx.closePath();

        ctx.fill();
    }

    serialize() {
        return {
            alive: this.alive,
            position: this.position,
            facing: this.facing,
            dimension: this.dimension,
            weapon: {
                type: 'horse',
            },
        };
    }
}
