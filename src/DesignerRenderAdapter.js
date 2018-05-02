import { renderSoldier } from './SoldierRenderer';

const WEAPON_SPEC = {
    sword: {
        type: 'sword',
        offsetAngle: Math.PI / 4,
        currAttackFrame: 0,
        startPos: {
            x: 2,
            y: -5,
        },
        length: 20,
    },
    spear: {
        type: 'spear',
        offsetPos: 20,
        startPos: {
            x: 2,
            y: -5,
        },
        length: 60,
    },
    shield: {
        type: 'shield',
        startPos: {
            x: -8,
            y: -5,
        },
    },
    horse: {
        type: 'horse',

    },
}

export function renderSoidierAdpter(ctx, soldier, side) {
    const soldierSpec = {
        position: {
            x: soldier.x,
            y: soldier.y,
        },
        facing: {
            x: (side === 'red') ? 1 : -1,
            y: 0,
        },
        dimension: 5,
        alive: true,
        weapon: WEAPON_SPEC[soldier.type],
    };

    renderSoldier(ctx, soldierSpec, side);
}