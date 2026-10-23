import { Weapon } from "./Weapon.js";

export class SpearWeapon extends Weapon {
  constructor(scene, player) {
    super(scene, player);
    this.name = "Draupnir Spear";
    this.key = "spear";
  }

  attack(time) {
    if (time < this.player.attackCooldownUntil) return;
    if (this.scene.spears.countActive(true) >= 4) {
      this.scene.showMessage("LÍMITE DE 4 LANZAS: PULSA K PARA DETONAR");
      return;
    }
    this.player.attackCooldownUntil = time + 460;
    this.scene.throwSpear();
  }

  detonate() {
    this.scene.detonateSpears();
  }
}
