export class Weapon {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.name = "Arma";
    this.key = "";
    this.damage = 0;
  }

  attack() {}

  update() {}

  getLabel() {
    return this.name;
  }
}
