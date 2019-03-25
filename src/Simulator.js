import Army from './Army';

export default class Simulator {
  constructor(soldiers) {
    this.battleFieldWidth = 1250;
    this.battleFieldHeight = 600;

    this.redArmy = new Army('red', soldiers[0], this),
    this.blueArmy = new Army('blue', soldiers[1], this);

    this.projectiles = [];
    this.obstacles = [];
    this.frame = 0;
  }

  start(updateCb) {
    this.updateCb = updateCb;
    this.gameRuntime = setInterval(this.simulate.bind(this), 20);
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
        red: this.redArmy.soldiers.map(s => s.serialize()),
        blue: this.blueArmy.soldiers.map(s => s.serialize()),
        projectiles: this.projectiles.map(p => p.serialize()),
    };

    this.updateCb(battleState);

    // this.broadcast('battleUpdate', { battleState });

    // if (redLost || blueLost) {
    //     this.broadcast('ended', { winner: redLost ? 1 : 0 });
    //     this.stopSimulation();
    //     return;
    // }
  }
}