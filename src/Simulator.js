import Army from './Army';
import Utils from './Utils';

export default class Simulator {
  constructor(soldiers, randomSeed, mainGame) {
    this.battleFieldWidth = 1250;
    this.battleFieldHeight = 600;

    this.redArmy = new Army('red', soldiers[0], this),
    this.blueArmy = new Army('blue', soldiers[1], this);

    Utils.seedRandom(randomSeed);

    this.projectiles = [];
    this.obstacles = [];
    this.frame = 0;

    this.mainGame = mainGame;
  }

  start() {
    this.gameRuntime = setInterval(this.simulate.bind(this), 16);
  }

  simulate() {
    this.redArmy.simulate(this.frame, this);
    this.blueArmy.simulate(this.frame, this);

    for (const projectile of this.projectiles) {
        projectile.simulate([...this.redArmy.soldiers, ...this.blueArmy.soldiers]);
    }

    this.projectiles = this.projectiles.filter(p => !p.defunct);

    const redLost = this.redArmy.soldiers.every(s => !s.alive);
    const blueLost = this.blueArmy.soldiers.every(s => !s.alive);

    this.frame++;

    const battleState = {
        red: this.redArmy.soldiers,
        blue: this.blueArmy.soldiers,
        projectiles: this.projectiles,
    };

    this.mainGame.updateBattleState(battleState);

    if (redLost || blueLost) {
      clearInterval(this.gameRuntime);

      this.mainGame.handleGameEnd();
    }
  }

  addProjectile(projectile) {
    this.projectiles.push(projectile);
  }
}