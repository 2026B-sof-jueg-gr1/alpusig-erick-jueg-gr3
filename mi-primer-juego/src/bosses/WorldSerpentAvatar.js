import { Boss } from "./Boss.js";

export class WorldSerpentAvatar extends Boss {
  constructor(scene) {
    super(scene, {
      name: "World Serpent Avatar",
      texture: "serpent",
      health: 850,
      intro: "EL AVATAR DE LA SERPIENTE MUNDIAL EMERGE"
    });
  }

  update(time) {
    super.update(time);
    if (!this.entity?.active) return;
    this.entity.setVelocityX(Math.sin(time / 500) * (this.phase + 1) * 35);
    if (time > this.entity.nextSpecial) {
      this.entity.nextSpecial = time + (this.phase === 3 ? 900 : 1700);
      this.scene.createImpact(this.scene.player.x, this.scene.physics.world.bounds.height - 110, true, 0x7fd8ff);
      this.scene.damagePlayer(this.phase * 6);
    }
  }
}
