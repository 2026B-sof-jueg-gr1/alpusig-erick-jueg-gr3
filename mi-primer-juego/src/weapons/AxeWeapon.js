import { Weapon } from "./Weapon.js";

export class AxeWeapon extends Weapon {
  constructor(scene, player) {
    super(scene, player);
    this.name = "Leviathan Axe";
    this.key = "axe";
    this.comboStep = 0;
    this.lastAttackAt = 0;
  }

  attack(time) {
    if (time < this.player.attackCooldownUntil) return;
    this.comboStep = time - this.lastAttackAt < 850 ? (this.comboStep % 3) + 1 : 1;
    this.lastAttackAt = time;
    const finalHit = this.comboStep === 3;
    this.player.attackUntil = time + (finalHit ? 280 : 210);
    this.player.attackCooldownUntil = time + 290;
    this.scene.performMeleeAttack({
      damage: this.scene.progression.getAttackDamage(28 + (finalHit ? 22 : 0)),
      heavy: finalHit,
      comboStep: this.comboStep
    });
  }
}
