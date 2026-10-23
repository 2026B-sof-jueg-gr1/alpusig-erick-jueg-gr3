import { Boss } from "./Boss.js";

export class FrostGuardian extends Boss {
  constructor(scene) {
    super(scene, {
      name: "Frost Guardian",
      texture: "guardian",
      health: 520,
      intro: "EL GUARDIÁN DEL HIELO HA DESPERTADO"
    });
  }

  update(time) {
    super.update(time);
    if (!this.entity?.active) return;
    const distance = this.scene.player.x - this.entity.x;
    const speed = this.phase === 1 ? 45 : this.phase === 2 ? 70 : 95;
    this.entity.setVelocityX(Math.sign(distance) * speed);
    if (time > this.entity.nextHit && Math.abs(distance) < 110) {
      this.entity.nextHit = time + (this.phase === 3 ? 650 : 1050);
      this.scene.damagePlayer(this.phase === 3 ? 24 : 16);
      this.scene.cameras.main.shake(this.phase === 3 ? 220 : 120, 0.008);
    }
    if (time > this.entity.nextSpecial) {
      this.entity.nextSpecial = time + (this.phase === 1 ? 2600 : 1800);
      this.scene.createImpact(this.entity.x, this.entity.y + 50, true, 0x7fd8ff);
      if (this.phase >= 2) this.scene.spawnEnemy("wolf");
      if (this.phase === 3) this.scene.damagePlayer(10);
    }
  }
}
