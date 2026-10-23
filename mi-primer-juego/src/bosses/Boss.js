export class Boss {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.entity = null;
    this.phase = 1;
  }

  spawn(x, y) {
    this.entity = this.scene.enemies.create(x, y, this.config.texture);
    this.entity.type = "boss";
    this.entity.bossName = this.config.name;
    this.entity.health = this.config.health;
    this.entity.maxHealth = this.config.health;
    this.entity.bossController = this;
    this.entity.nextHit = 0;
    this.entity.nextSpecial = this.scene.time.now + 1600;
    this.scene.showMessage(this.config.intro);
    this.scene.audio.playBoss();
    return this.entity;
  }

  update(time) {
    if (!this.entity?.active) return;
    const ratio = this.entity.health / this.entity.maxHealth;
    this.phase = ratio <= 0.33 ? 3 : ratio <= 0.66 ? 2 : 1;
  }

  takeDamage(amount) {
    this.entity.health -= amount;
    if (this.entity.health <= 0) this.die();
  }

  die() {
    this.scene.createImpact(this.entity.x, this.entity.y, true, 0x7fd8ff);
    this.entity.disableBody(true, true);
    this.scene.onBossDefeated(this);
  }
}
