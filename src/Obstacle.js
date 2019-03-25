const mountainImage = document.getElementById('mountain');

module.exports = class Obstacle {
    constructor(x, y, radius) {
        this.position = {
            x: x,
            y: y,
        };
        this.radius = radius;
    }

    render(ctx) {
        ctx.save();
        ctx.fillStyle = '#999';

        const scale = this.radius / 500;
        ctx.translate(this.position.x - scale * 300, this.position.y - scale * 200);

        ctx.scale(scale, scale)

        ctx.drawImage(mountainImage, 0, 0);

        ctx.fill();
        ctx.restore();
    }
}
