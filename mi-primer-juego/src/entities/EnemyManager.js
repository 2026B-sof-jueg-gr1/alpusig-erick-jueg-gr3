import { WIDTH, HEIGHT, GROUND_Y, COLORS } from "../config/constants.js";

/**
 * Gestor responsable de la creación, ciclo de vida e Inteligencia Artificial (IA)
 * de los enemigos estándar (Lobo, Draugr y Chamán).
 * Aplica SRP aislando el comportamiento de la horda de la escena principal.
 */
export class EnemyManager {
  constructor(scene) {
    this.scene = scene;
    this.enemies = scene.physics.add.group();
    this.projectiles = scene.physics.add.group();
    this.nextSpawnAt = 0;
  }

  spawnEnemy(forcedType = null) {
    const roll = Math.random();
    const type = forcedType || (roll < 0.45 ? "wolf" : roll < 0.78 ? "draugr" : "shaman");
    const spawnX = Math.random() < 0.5 ? -30 : WIDTH + 30;
    
    const enemy = this.enemies.create(spawnX, GROUND_Y - 35, type);
    enemy.type = type;
    enemy.health = type === "wolf" ? 35 : type === "draugr" ? 80 : 50;
    enemy.state = "idle";
    enemy.nextHit = 0;
    enemy.nextShot = this.scene.time.now + 1000;
    enemy.setCollideWorldBounds(false);
    
    this.nextSpawnAt = this.scene.time.now + 1050;
    return enemy;
  }

  update(time, player) {
    this.enemies.getChildren().forEach((enemy) => {
      this.updateSingleEnemy(enemy, time, player);
    });
  }

  updateSingleEnemy(enemy, time, player) {
    if (!enemy.active) return;

    // Si el enemigo está controlado por un Boss, delegar en su controlador
    if (enemy.bossController) {
      enemy.bossController.update(time);
      return;
    }

    const distance = player.x - enemy.x;
    enemy.state = "chase";

    if (enemy.type === "shaman") {
      // Movimiento y disparo a distancia del chamán
      enemy.setVelocityX(Math.sign(distance) * Math.min(Math.abs(distance) * 0.25, 65));
      if (time > enemy.nextShot && Math.abs(distance) < 470) {
        enemy.nextShot = time + 1900;
        this.shootShamanProjectile(enemy.x, enemy.y, Math.sign(distance));
      }
    } else {
      // Velocidad según el tipo de criatura
      const speed = enemy.type === "wolf" ? 125 : enemy.type === "guardian" ? 45 : 58;
      enemy.setVelocityX(Math.sign(distance) * speed);
    }

    // Ataque cuerpo a cuerpo por contacto
    const attackDistance = enemy.type === "guardian" ? 75 : 43;
    if (Math.abs(distance) < attackDistance && time > enemy.nextHit) {
      enemy.state = "attack";
      enemy.nextHit = time + (enemy.type === "wolf" ? 700 : 1100);
      const damage = enemy.type === "guardian" ? 18 : 10;
      this.scene.damagePlayer(damage);
    }

    // Destruir si cae fuera del mapa
    if (enemy.y > HEIGHT + 50) {
      enemy.destroy();
    }
  }

  shootShamanProjectile(x, y, direction) {
    const projectile = this.scene.add.circle(x, y, 7, COLORS.ice);
    this.scene.physics.add.existing(projectile);
    projectile.body.setAllowGravity(false);
    projectile.body.setVelocityX(direction * 210);
    projectile.body.setVelocityY(-20);
    projectile.damage = 8;
    this.projectiles.add(projectile);

    this.scene.time.delayedCall(3200, () => {
      if (projectile.active) projectile.destroy();
    });
  }
}

