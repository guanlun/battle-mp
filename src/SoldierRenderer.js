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
        if (soldier.weapon.type === 'horse') {
            renderHorseman(ctx, soldier);
        } else {
            renderFootman(ctx, soldier);
        }
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

export function renderProjectile(ctx, projectile) {
    if (projectile.defunct) {
        return;
    }
    ctx.save();
    ctx.strokeStyle = projectile.side;

    ctx.translate(projectile.position.x, projectile.position.y);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(projectile.facing.x * projectile.length, projectile.facing.y * projectile.length);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
}

function renderHorseman(ctx, horseman) {
    ctx.beginPath();

    ctx.moveTo(0, -15);
    ctx.lineTo(10, 15);
    ctx.lineTo(-10, 15);

    ctx.closePath();

    ctx.fill();
}

function renderFootman(ctx, footman) {
    ctx.arc(0, 0, footman.dimension, 0, Math.PI * 2);
    ctx.fill();

    renderWeapon(ctx, footman.weapon);
}

function renderWeapon(ctx, weapon) {
    switch (weapon.type) {
        case 'sword':
            renderSword(ctx, weapon);
            break;
        case 'spear':
            renderSpear(ctx, weapon);
            break;
        case 'shield':
            renderShield(ctx, weapon);
            break;
        case 'bow':
            renderBow(ctx, weapon);
            break;
    }
}

function renderSword(ctx, weaponSpec) {
    weaponSpec.offsetAngle = Math.PI / 4 * (1 - weaponSpec.currAttackFrame / 30);
    ctx.save();
    ctx.rotate(weaponSpec.offsetAngle);

    ctx.beginPath();
    ctx.moveTo(weaponSpec.startPos.x, weaponSpec.startPos.y);
    ctx.lineTo(weaponSpec.startPos.x, weaponSpec.startPos.y - weaponSpec.length);
    ctx.quadraticCurveTo(weaponSpec.startPos.x - 5, weaponSpec.startPos.y + 3, weaponSpec.startPos.x, weaponSpec.startPos.y);
    ctx.closePath();

    ctx.moveTo(weaponSpec.startPos.x - 4, weaponSpec.startPos.y - 2);
    ctx.lineTo(weaponSpec.startPos.x + 3, weaponSpec.startPos.y - 2);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
}

function renderSpear(ctx, weaponSpec) {
    ctx.save();
    ctx.translate(0, weaponSpec.offsetPos);

    ctx.beginPath();
    ctx.moveTo(weaponSpec.startPos.x, weaponSpec.startPos.y - weaponSpec.length);
    ctx.lineTo(weaponSpec.startPos.x, weaponSpec.startPos.y);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
}

function renderShield(ctx, weaponSpec) {
    ctx.save();

    ctx.beginPath();
    ctx.moveTo(weaponSpec.startPos.x, weaponSpec.startPos.y);
    ctx.lineTo(weaponSpec.startPos.x + 16, weaponSpec.startPos.y);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
}

function renderBow(ctx, weaponSpec) {
    ctx.beginPath();
    ctx.moveTo(weaponSpec.startPos.x, weaponSpec.startPos.y + weaponSpec.drawPosOffset);
    ctx.lineTo(weaponSpec.startPos.x - 10, weaponSpec.startPos.y - 10);
    ctx.quadraticCurveTo(weaponSpec.startPos.x, weaponSpec.startPos.y - 15, weaponSpec.startPos.x + 10, weaponSpec.startPos.y - 10);
    ctx.closePath();
    ctx.stroke();
}
