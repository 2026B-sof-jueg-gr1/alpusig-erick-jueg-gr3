export class ProgressionManager {
  constructor() {
    this.healthBonus = 0;
    this.attackBonus = 0;
    this.criticalChance = 0.2;
    this.explosionBonus = 0;
  }

  getMaxHealth() {
    return 100 + this.healthBonus;
  }

  getAttackDamage(base) {
    return base + this.attackBonus;
  }

  rollCritical() {
    return Math.random() < this.criticalChance;
  }

  applyUpgrade(type) {
    if (type === "health") this.healthBonus += 20;
    if (type === "attack") this.attackBonus += 8;
    if (type === "critical") this.criticalChance = Math.min(0.6, this.criticalChance + 0.08);
    if (type === "explosion") this.explosionBonus += 15;
  }
}
