import { WIDTH, HEIGHT, GROUND_Y, COLORS } from "../config/constants.js";
import { addBackground } from "../ui/UIHelper.js";
import { HUD } from "../ui/HUD.js";
import { Player } from "../entities/Player.js";
import { EnemyManager } from "../entities/EnemyManager.js";
import { AxeWeapon } from "../weapons/AxeWeapon.js";
import { SpearWeapon } from "../weapons/SpearWeapon.js";
import { ProgressionManager } from "../managers/ProgressionManager.js";
import { AudioManager } from "../managers/AudioManager.js";
import { FrostGuardian } from "../bosses/FrostGuardian.js";
import { WorldSerpentAvatar } from "../bosses/WorldSerpentAvatar.js";

/**
 * Escena Principal de Juego (GameScene).
 * Actúa como orquestador del ciclo de juego, físicas, colisiones y transiciones.
 * Aplica principios SOLID:
 * - SRP: delega HUD, IA de enemigos, física del jugador y armas en módulos dedicados.
 * - OCP / LSP: utiliza polimorfismo para armas y jefes sin modificar la escena.
 * - DIP: depende de abstracciones y gestores especializados.
 */
export class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    addBackground(this);
    this.physics.world.setBounds(0, 0, WIDTH, HEIGHT);

    // 1. Instanciar gestores y jugador
    this.player = new Player(this, 170, GROUND_Y - 40);
    this.progression = new ProgressionManager();
    this.audio = new AudioManager(this);
    this.enemyManager = new EnemyManager(this);
    this.hud = new HUD(this);

    // Referencias para interoperabilidad con armas y jefes
    this.enemies = this.enemyManager.enemies;
    this.projectiles = this.enemyManager.projectiles;
    this.spears = this.physics.add.group();
    this.pickups = this.physics.add.group();

    // 2. Armas
    this.weapons = {
      axe: new AxeWeapon(this, this.player),
      spear: new SpearWeapon(this, this.player)
    };
    this.selectedWeapon = this.weapons.axe;

    // 3. Plataformas
    this.createPlatforms();

    // 4. Configurar colisiones y solapamientos
    this.setupCollisions();

    // 5. Configurar entradas de teclado
    this.setupInputs();

    // 6. Gráfico del arma activa
    this.attackGraphic = this.add.image(this.player.x, this.player.y, "axe")
      .setVisible(false)
      .setDepth(2);

    // 7. Estado de la partida
    this.score = 0;
    this.kills = 0;
    this.combo = 0;
    this.comboExpiresAt = 0;
    this.spawnedBoss = false;
    this.bossController = null;
    this.finalBossStarted = false;
    this.wave = 1;

    // Iniciar primera oleada
    this.spawnWave();
  }

  createPlatforms() {
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(WIDTH / 2, GROUND_Y + 37, "ground").setScale(1, 1).refreshBody();

    const floatingPlatformCoords = [
      [340, 450, 190],
      [690, 390, 180],
      [940, 470, 150]
    ];

    floatingPlatformCoords.forEach(([x, y, width]) => {
      const platform = this.add.rectangle(x, y, width, 15, COLORS.steel)
        .setStrokeStyle(2, COLORS.ice);
      this.physics.add.existing(platform, true);
      this.platforms.add(platform);
    });
  }

  setupCollisions() {
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.spears, this.platforms, this.stickSpearTerrain, undefined, this);
    this.physics.add.overlap(this.player, this.pickups, this.collectPickup, undefined, this);
    this.physics.add.overlap(this.player, this.projectiles, this.collectProjectile, undefined, this);
    this.physics.add.overlap(this.spears, this.enemies, this.stickSpear, undefined, this);
  }

  setupInputs() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("A,D,J,P,W,K,ONE,TWO");

    this.input.keyboard.on("keydown-P", () => this.togglePause());
    this.input.keyboard.on("keydown-ONE", () => this.selectWeapon("axe"));
    this.input.keyboard.on("keydown-TWO", () => this.selectWeapon("spear"));
    this.input.keyboard.on("keydown-K", () => this.weapons.spear.detonate());
  }

  update(time, delta) {
    if (this.player.health <= 0) return;

    // Movimiento del héroe
    this.player.handleMovement(this.cursors, this.keys);

    // Ataque con arma activa
    if (Phaser.Input.Keyboard.JustDown(this.keys.J)) {
      this.selectedWeapon.attack(time);
    }

    // Expiración de combo
    if (this.combo > 0 && time > this.comboExpiresAt) {
      this.combo = 0;
    }

    // Control de spawn automático de enemigos
    if (time > this.enemyManager.nextSpawnAt && this.enemies.countActive(true) < 7 && this.kills < 30) {
      this.spawnEnemy();
    }

    // Actualización de enemigos
    this.enemyManager.update(time, this.player);

    // Limpieza de lanzas fuera de pantalla
    this.spears.getChildren().forEach((spear) => {
      if (spear.active && (spear.x < -80 || spear.x > WIDTH + 80)) {
        spear.destroy();
      }
    });

    // Gráfico y posición del arma
    this.attackGraphic.setVisible(this.player.attackUntil > time);
    this.attackGraphic.x = this.player.x + this.player.facing * 43;
    this.attackGraphic.y = this.player.y - 6;

    // Actualización de la interfaz
    this.hud.update({
      playerHealth: this.player.health,
      kills: this.kills,
      score: this.score,
      combo: this.combo,
      activeSpears: this.spears.countActive(true),
      weaponName: this.selectedWeapon.getLabel(),
      bossEntity: this.bossController?.entity
    }, time);
  }

  performMeleeAttack({ damage, heavy, comboStep }) {
    this.attackGraphic.setVisible(true);
    this.attackGraphic.setTexture("axe").setScale(heavy ? 1.3 : 1);
    this.audio.playAttack();

    const hitbox = new Phaser.Geom.Rectangle(
      this.player.x + this.player.facing * 5 - (this.player.facing < 0 ? 100 : 0),
      this.player.y - 47,
      100,
      80
    );

    let hit = false;
    this.enemies.getChildren().forEach((enemy) => {
      if (!enemy.active || !Phaser.Geom.Intersects.RectangleToRectangle(hitbox, enemy.getBounds())) return;
      
      hit = true;
      const critical = this.progression.rollCritical();
      const hitDamage = critical ? damage * 2 : damage;
      
      enemy.state = "hurt";
      if (enemy.bossController) {
        enemy.bossController.takeDamage(hitDamage);
      } else {
        enemy.health -= hitDamage;
      }

      enemy.setTint(critical ? COLORS.gold : COLORS.snow);
      this.time.delayedCall(100, () => enemy.clearTint());
      
      this.createImpact(enemy.x, enemy.y, critical);
      this.showDamageNumber(enemy.x, enemy.y - 35, hitDamage, critical);
      this.showMessage(critical ? "¡GOLPE CRÍTICO!" : `COMBO ${comboStep}`);
      
      enemy.setVelocityX(this.player.facing * (heavy ? 150 : 70));
      
      if (!enemy.bossController && enemy.health <= 0) {
        this.defeatEnemy(enemy);
      }
    });

    if (!hit) {
      this.combo = 0;
    }
  }

  selectWeapon(key) {
    this.selectedWeapon = this.weapons[key];
    this.attackGraphic.setTexture(key === "axe" ? "axe" : "spear").setScale(1);
    this.showMessage(`${this.selectedWeapon.name.toUpperCase()} EQUIPADA`);
  }

  throwSpear() {
    const spear = this.spears.create(
      this.player.x + this.player.facing * 35,
      this.player.y - 8,
      "spear"
    );
    spear.setVelocityX(this.player.facing * 430);
    spear.setVelocityY(-25);
    spear.body.setAllowGravity(false);
    spear.setRotation(this.player.facing < 0 ? Math.PI : 0);
    spear.damage = this.progression.getAttackDamage(45);
    spear.setData("stuck", false);
    this.createImpact(this.player.x + this.player.facing * 25, this.player.y, false, COLORS.ice);
  }

  stickSpear(spear, enemy) {
    if (!spear.active || spear.getData("stuck")) return;
    spear.setData("stuck", true);
    spear.body.stop();
    spear.body.setAllowGravity(false);
    spear.x = enemy.x;
    spear.y = enemy.y;
  }

  stickSpearTerrain(spear) {
    if (!spear.active || spear.getData("stuck")) return;
    spear.setData("stuck", true);
    spear.body.stop();
    spear.body.setAllowGravity(false);
  }

  detonateSpears() {
    const activeSpears = this.spears.getChildren().filter((spear) => spear.active);
    if (!activeSpears.length) return;

    activeSpears.forEach((spear) => {
      this.createExplosion(spear.x, spear.y);
      this.enemies.getChildren().forEach((enemy) => {
        if (!enemy.active || Phaser.Math.Distance.Between(spear.x, spear.y, enemy.x, enemy.y) > 125) return;
        const damage = this.progression.getAttackDamage(55) + this.progression.explosionBonus;
        if (enemy.bossController) {
          enemy.bossController.takeDamage(damage);
        } else {
          enemy.health -= damage;
          if (enemy.health <= 0) this.defeatEnemy(enemy);
        }
      });
      spear.destroy();
    });

    this.audio.playExplosion();
    this.cameras.main.shake(180, 0.009);
  }

  createExplosion(x, y) {
    this.createImpact(x, y, true, COLORS.orange);
    const explosion = this.add.circle(x, y, 125, COLORS.orange, 0.12).setStrokeStyle(3, COLORS.gold);
    this.time.delayedCall(180, () => explosion.destroy());
  }

  defeatEnemy(enemy) {
    if (!enemy.active) return;
    enemy.state = "dead";
    enemy.disableBody(true, true);
    
    this.kills++;
    this.combo++;
    this.comboExpiresAt = this.time.now + 2200;
    this.score += 100 * this.combo;

    if (this.kills % 5 === 0) {
      this.dropPickup(enemy.x, enemy.y);
    }

    if (this.kills === 30) {
      this.spawnBoss();
    } else if (this.kills >= 30 && this.enemies.countActive(true) === 0) {
      this.scene.start("VictoryScene", { score: this.score });
    }
  }

  spawnWave() {
    this.showMessage(`OLA ${this.wave}`);
    for (let i = 0; i < 3 + this.wave; i++) {
      this.spawnEnemy();
    }
  }

  spawnEnemy(forcedType) {
    return this.enemyManager.spawnEnemy(forcedType);
  }

  spawnBoss() {
    if (this.spawnedBoss) return;
    this.spawnedBoss = true;
    this.bossController = new FrostGuardian(this);
    this.bossController.spawn(WIDTH - 100, GROUND_Y - 62);
    this.showBossBar();
  }

  onBossDefeated() {
    this.hideBossBar();
    if (!this.finalBossStarted) {
      this.finalBossStarted = true;
      this.bossController = new WorldSerpentAvatar(this);
      this.bossController.spawn(WIDTH - 170, GROUND_Y - 45);
      this.showBossBar();
      return;
    }
    this.scene.start("VictoryScene", { score: this.score + 2000 });
  }

  damagePlayer(amount) {
    const wasDamaged = this.player.takeDamage(amount, this.time.now);
    if (wasDamaged && this.player.health <= 0) {
      this.scene.start("GameOverScene", { score: this.score, kills: this.kills });
    }
  }

  collectPickup(player, pickup) {
    pickup.destroy();
    this.player.heal(25);
    this.createImpact(this.player.x, this.player.y, false, COLORS.green);
  }

  collectProjectile(player, projectile) {
    if (!projectile.active) return;
    projectile.destroy();
    this.damagePlayer(projectile.damage);
  }

  dropPickup(x, y) {
    this.pickups.create(x, y, "pickup");
  }

  createImpact(x, y, critical, color = COLORS.orange) {
    const burst = this.add.particles(x, y, "pickup", {
      speed: { min: 30, max: 130 },
      lifespan: 350,
      quantity: critical ? 12 : 6,
      scale: { start: 0.6, end: 0 },
      tint: color,
      emitting: false
    });
    burst.explode();
    this.time.delayedCall(450, () => burst.destroy());
  }

  showDamageNumber(x, y, damage, critical) {
    this.hud.showDamageNumber(x, y, damage, critical);
  }

  showMessage(message) {
    this.hud.showMessage(message);
  }

  showBossBar() {
    this.hud.showBossBar(this.bossController.config.name);
  }

  hideBossBar() {
    this.hud.hideBossBar();
  }

  togglePause() {
    if (this.scene.isPaused()) return;
    this.scene.pause();
    this.scene.launch("PauseScene");
  }
}

