import Constants from './Constants';
import Utils from './Utils';

export default class Weapon {
    constructor() {
    }

    attack() {
        if (this.status === 'holding') {
            this.status = 'out';
        }
    }

    defend(attackWeapon, attackAngle) {
        const blockChance = Constants.BLOCK_CHANCE[this.type];

        const rand = Utils.random();

        if (attackAngle < blockChance.angle) { // attack is in the blocking angle of the enemy's weapon => can be blocked
            if (rand > blockChance[attackWeapon.type]) {
                return attackWeapon.damage;
            }
        } else {
            if (rand > 0.2) { // attack out of the blocking angle => 80% chance of dealing damage
                return attackWeapon.damage;
            }
        }

        return 0;
    }
}
