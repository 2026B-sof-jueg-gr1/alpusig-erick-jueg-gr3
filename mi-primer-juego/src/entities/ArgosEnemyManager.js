import { GROUND_Y, GORGE_COLORS } from "../config/constants.js";

const ARGOS_CONFIGS = {
  infantry: {
    texture: "argos_soldier",
    health: 46,
    speed: 105,
    damage: 14,
    range: 58,
    cooldown: 1200,
    hasShield: false
  },
  shield: {
    texture: "argos_shield_bearer",
    health: 72,
    speed: 84,
    damage: 16,
    range: 58,
    cooldown: 1450,
    hasShield: true
  },
  lancer: {
    texture: "argos_lancer",
    health: 54,
    speed: 132,
    damage: 18,
    range: 78,
    cooldown: 1050,
    hasShield: false
  },
  archer: {
    texture: "argos_archer",
    health: 36,
    speed: 78,
    damage: 14,
    range: 340,
    cooldown: 2150,
    hasShield: false,
    isRanged: true
  }
};

/**
 * Gestor de tropas enemigas de Argos y proyectiles en Escena 2 (Hito 2.1).
 * Maneja infantes, escuderos (requieren Golpe de Escudo o Barrido Pesado),
 * lanceros y arqueros con flechas bloqueables mediante Guardia Férrea.
 */
export class ArgosEnemyManager {
  constructor(scene, groundColliders, audio, hud, onKillCallback) {
    this.scene = scene;
    this.audio = audio;
    this.hud = hud;
    this.onKillCallback = onKillCallback;

    this.enemies = scene.physics.add.group();
    this.arrows = scene.physics.add.group();
    this.kills = 0;
    this.aggressiveMode = false;

    scene.physics.add.collider(this.enemies, groundColliders);
    scene.physics.add.collider(this.arrows, groundColliders, (arrow) => {
      if (arrow.active) arrow.destroy();
    });
  }

  setAggressiveMode(enabled) {
    this.aggressiveMode = enabled;
  }

  spawnWave(waveEnemies = []) {
    waveEnemies.forEach((spec) => {
      this.spawnEnemy(spec.type, spec.x);
    });
  }

  spawnEnemy(type = "infantry", x = 800) {
    const cfg = ARGOS_CONFIGS[type] || ARGOS_CONFIGS.infantry;
    const enemy = this.enemies.create(x, GROUND_Y - 40, cfg.texture);
    enemy.setCollideWorldBounds(true);
    enemy.setDepth(19);
    enemy.body.setSize(34, 72).setOffset(12, 4);

    enemy.enemyType = type;
    enemy.config = cfg;
    enemy.health = cfg.health;
    enemy.guarding = cfg.hasShield;
    enemy.stunnedUntil = 0;
    enemy.hurtUntil = 0;
    enemy.nextAttackAt = 0;
    enemy.windupUntil = 0;
    enemy.isWindingUp = false;

    return enemy;
  }

  update(time, player) {
    if (!player || !player.active || player.health <= 0) return;

    const speedMult = this.aggressiveMode ? 1.24 : 1;
    const cdMult = this.aggressiveMode ? 0.8 : 1;

    this.enemies.getChildren().forEach((enemy) => {
      if (!enemy.active) return;

      // Aturdido o golpeado recientemente
      if (time < enemy.stunnedUntil) {
        enemy.setVelocityX(enemy.body.velocity.x * 0.88);
        enemy.setTint(0xfef08a);
        return;
      }
      if (time < enemy.hurtUntil) {
        enemy.setVelocityX(enemy.body.velocity.x * 0.9);
        return;
      }

      if (enemy.config.hasShield && !enemy.guarding) {
        enemy.guarding = true; // Recupera guardia tras salir del aturdimiento
      }
      enemy.clearTint();

      const dx = player.x - enemy.x;
      const absDx = Math.abs(dx);
      const dir = dx >= 0 ? 1 : -1;
      // Los sprites de Argos miran por defecto hacia la izquierda; flipX si miran a la derecha
      enemy.setFlipX(dir > 0);

      if (enemy.isWindingUp) {
        enemy.setVelocityX(0);
        if (time >= enemy.windupUntil) {
          enemy.isWindingUp = false;
          this.executeEnemyAttack(enemy, player, time, cdMult);
        }
        return;
      }

      if (enemy.config.isRanged) {
        if (absDx > enemy.config.range) {
          enemy.setVelocityX(dir * enemy.config.speed * speedMult);
        } else if (absDx < 190) {
          enemy.setVelocityX(-dir * enemy.config.speed * 0.85);
        } else {
          enemy.setVelocityX(0);
          if (time >= enemy.nextAttackAt) {
            this.beginEnemyWindup(enemy, time, 280);
          }
        }
        return;
      }

      if (absDx > enemy.config.range - 6) {
        enemy.setVelocityX(dir * enemy.config.speed * speedMult);
      } else {
        enemy.setVelocityX(0);
        if (time >= enemy.nextAttackAt) {
          this.beginEnemyWindup(enemy, time, 240);
        }
      }
    });

    // Limpiar flechas fuera de rango
    this.arrows.getChildren().forEach((arrow) => {
      if (arrow.active && (arrow.x < -100 || arrow.x > this.scene.worldWidth + 100)) {
        arrow.destroy();
      }
    });
  }

  beginEnemyWindup(enemy, time, windupMs) {
    enemy.isWindingUp = true;
    enemy.windupUntil = time + windupMs;
    enemy.setTint(0xfca5a5);
  }

  executeEnemyAttack(enemy, player, time, cdMult) {
    enemy.clearTint();
    enemy.nextAttackAt = time + enemy.config.cooldown * cdMult;

    if (enemy.config.isRanged) {
      this.fireArrow(enemy, player);
      return;
    }

    const dx = Math.abs(player.x - enemy.x);
    if (dx <= enemy.config.range + 16 && Math.abs(player.y - enemy.y) < 60) {
      const result = player.takeDamage(enemy.config.damage, enemy.x, time);
      this.handlePlayerHitFeedback(player, enemy.x, enemy.config.damage, result);
    }
  }

  fireArrow(archer, player) {
    const dir = player.x >= archer.x ? 1 : -1;
    const arrow = this.arrows.create(archer.x + dir * 20, archer.y - 12, "argos_arrow");
    arrow.body.setAllowGravity(false);
    arrow.setFlipX(dir > 0);
    arrow.setVelocityX(dir * 380);
    arrow.damage = archer.config.damage;
    arrow.originX = archer.x;
    arrow.setDepth(21);
    this.audio?.playArrowWhistle();
  }

  handleArrowOverlap(player, arrow, time) {
    if (!arrow.active || !player.active) return;
    const originX = arrow.x - Math.sign(arrow.body.velocity.x) * 40;
    const damage = arrow.damage || 14;
    arrow.destroy();

    const result = player.takeDamage(damage, originX, time);
    this.handlePlayerHitFeedback(player, originX, damage, result);
  }

  handlePlayerHitFeedback(player, sourceX, damage, result) {
    if (result.blocked) {
      this.audio?.playShieldBlock();
      this.spawnParticles(player.x + player.facing * 24, player.y - 6, "spark_clank", 7);
      this.hud?.showFloatingText(player.x, player.y - 52, "BLOQUEADO", "#fde68a");
    } else if (result.tookDamage) {
      this.audio?.playBackstabImpact();
      this.spawnParticles(player.x, player.y - 4, "blood_splat", 7);
      this.hud?.showFloatingText(player.x, player.y - 52, `-${damage}`, "#ff6b6b");
    }
  }

  applyPlayerAttack(player, attackData, time) {
    const startX = player.facing > 0 ? player.x - 10 : player.x - attackData.range;
    const hitbox = new Phaser.Geom.Rectangle(startX, player.y - 52, attackData.range + 10, 96);

    if (attackData.type === "shield_bash") {
      this.audio?.playShieldBash();
    } else if (attackData.type === "heavy_sweep") {
      this.audio?.playHeavySweep();
    } else {
      this.audio?.playSpearThrust(attackData.comboStep);
    }

    this.enemies.getChildren().forEach((enemy) => {
      if (!enemy.active) return;
      if (!Phaser.Geom.Intersects.RectangleToRectangle(hitbox, enemy.getBounds())) return;

      const isBlockedByEnemy =
        enemy.guarding &&
        time >= enemy.stunnedUntil &&
        !attackData.breaksGuard;

      if (isBlockedByEnemy) {
        this.audio?.playShieldBlock();
        this.spawnParticles(enemy.x, enemy.y - 8, "spark_clank", 6);
        enemy.setVelocityX(player.facing * 65);
        enemy.hurtUntil = time + 120;
        this.hud?.showFloatingText(enemy.x, enemy.y - 52, "ESCUDO [Shift+J / K]", "#93c5fd");
        return;
      }

      if (attackData.breaksGuard) {
        enemy.guarding = false;
        if (attackData.stunMs > 0) {
          enemy.stunnedUntil = time + attackData.stunMs;
          enemy.isWindingUp = false;
          this.hud?.showFloatingText(enemy.x, enemy.y - 56, "¡GUARDIA ROTA!", "#fcd34d");
        }
      }

      enemy.health -= attackData.damage;
      enemy.hurtUntil = time + 220;
      enemy.isWindingUp = false;
      enemy.setVelocityX(player.facing * attackData.knockback);
      enemy.setTint(0xffffff);
      this.scene.time.delayedCall(100, () => {
        if (enemy.active) enemy.clearTint();
      });

      this.spawnParticles(enemy.x, enemy.y - 8, "blood_splat", 7);
      this.hud?.showFloatingText(
        enemy.x,
        enemy.y - 44,
        `${attackData.damage}`,
        attackData.breaksGuard ? "#fbbf24" : "#ffffff"
      );

      if (enemy.health <= 0) {
        this.defeatEnemy(enemy);
      }
    });
  }

  defeatEnemy(enemy) {
    const ex = enemy.x;
    const ey = GROUND_Y - 14;
    enemy.destroy();

    this.audio?.playEnemyDeath();
    this.spawnParticles(ex, ey, "mud_splash", 6);
    this.scene.add.image(ex, ey, "fallen_argos_body")
      .setFlipX(Math.random() < 0.5)
      .setDepth(13);

    this.kills += 1;
    if (this.onKillCallback) {
      this.onKillCallback(this.kills);
    }
  }

  spawnParticles(x, y, texture, quantity) {
    const emitter = this.scene.add.particles(x, y, texture, {
      speed: { min: 45, max: 165 },
      lifespan: 340,
      scale: { start: 0.9, end: 0.1 },
      alpha: { start: 1, end: 0 },
      emitting: false
    }).setDepth(28);
    emitter.explode(quantity);
    this.scene.time.delayedCall(420, () => emitter.destroy());
  }

  getActiveCount() {
    return this.enemies.countActive(true);
  }

  clearAllActive() {
    this.enemies.clear(true, true);
    this.arrows.clear(true, true);
  }
}

