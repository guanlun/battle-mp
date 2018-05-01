const CROSS_SIZE = 5;

export function renderSoldier(ctx, soldier, color) {
    const {x, y} = soldier.position;

    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    ctx.save();

    const facing = Math.atan2(soldier.facing.y, soldier.facing.x) + Math.PI / 2;
    ctx.translate(x, y);
    ctx.rotate(facing);

    ctx.beginPath();
    if (soldier.alive) {
        ctx.arc(0, 0, soldier.dimension, 0, Math.PI * 2);
        ctx.fill();

        renderWeapon(ctx, soldier.weapon);
    } else {
        ctx.moveTo(-CROSS_SIZE, -CROSS_SIZE);
        ctx.lineTo(CROSS_SIZE, CROSS_SIZE);
        ctx.closePath();

        ctx.moveTo(-CROSS_SIZE, CROSS_SIZE);
        ctx.lineTo(CROSS_SIZE, -CROSS_SIZE);
        ctx.closePath();
        ctx.stroke();
    }

    ctx.restore();
}

function renderWeapon(ctx, weapon) {
    weapon.offsetAngle = Math.PI / 4 * (1 - weapon.currAttackFrame / 30);
    ctx.save();
    ctx.rotate(weapon.offsetAngle);

    ctx.beginPath();
    ctx.moveTo(weapon.startPos.x, weapon.startPos.y);
    ctx.lineTo(weapon.startPos.x, weapon.startPos.y - weapon.length);
    ctx.quadraticCurveTo(weapon.startPos.x - 5, weapon.startPos.y + 3, weapon.startPos.x, weapon.startPos.y);
    ctx.closePath();

    ctx.moveTo(weapon.startPos.x - 4, weapon.startPos.y - 2);
    ctx.lineTo(weapon.startPos.x + 3, weapon.startPos.y - 2);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
}
