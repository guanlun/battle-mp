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
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.shot && !this.defunct) {
            for (const s of enemies) {
                // TODO: improve hit detection
                if (Utils.distance(this.position, s.position) < 5) {
                    // TODO: add defense mechanism for arrows
                    s.takeDamage(20);
                    this.defunct = true;
                }
            }
        }
    }

    shoot(direction) {
        this.velocity = {
            x: Math.sin(direction) * 12,
            y: -Math.cos(direction) * 12,
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
