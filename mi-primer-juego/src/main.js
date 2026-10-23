import { AxeWeapon } from "./weapons/AxeWeapon.js";
import { SpearWeapon } from "./weapons/SpearWeapon.js";
import { ProgressionManager } from "./managers/ProgressionManager.js";
import { AudioManager } from "./managers/AudioManager.js";
import { FrostGuardian } from "./bosses/FrostGuardian.js";
import { WorldSerpentAvatar } from "./bosses/WorldSerpentAvatar.js";

const WIDTH = 1152;
const HEIGHT = 648;
const GROUND_Y = 548;
const COLORS = {
  deepBlue: 0x1e3a5f,
  ice: 0x7fd8ff,
  steel: 0x66707a,
  snow: 0xeaf4ff,
  charcoal: 0x23272f,
  orange: 0xff8f3d,
  gold: 0xf4c542,
  red: 0xff5e67,
  green: 0x80e8b0
};

class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create() {
    this.createTexture("player", 48, 72, (g) => {
      g.fillStyle(COLORS.steel).fillRoundedRect(9, 19, 30, 42, 7);
      g.fillStyle(COLORS.snow).fillCircle(24, 14, 13);
      g.fillStyle(COLORS.orange).fillRect(8, 28, 32, 7);
      g.fillStyle(COLORS.charcoal).fillRect(11, 58, 10, 14).fillRect(27, 58, 10, 14);
      g.lineStyle(3, COLORS.gold).strokeLineShape(new Phaser.Geom.Line(34, 34, 47, 16));
    });
    this.createTexture("wolf", 56, 38, (g) => {
      g.fillStyle(0xd6f2ff).fillEllipse(27, 22, 50, 25);
      g.fillStyle(0xb2d9ef).fillTriangle(8, 14, 16, 0, 23, 14);
      g.fillStyle(0xb2d9ef).fillTriangle(34, 12, 44, 0, 48, 19);
      g.fillStyle(COLORS.ice).fillCircle(40, 20, 3);
    });
    this.createTexture("draugr", 44, 68, (g) => {
      g.fillStyle(0x465b68).fillRoundedRect(5, 17, 34, 48, 8);
      g.fillStyle(0x9ab8c4).fillCircle(22, 12, 12);
      g.lineStyle(2, COLORS.ice).strokeLineShape(new Phaser.Geom.Line(12, 34, 32, 48));
      g.fillStyle(COLORS.ice).fillRect(13, 10, 5, 3).fillRect(26, 10, 5, 3);
    });
    this.createTexture("shaman", 46, 66, (g) => {
      g.fillStyle(0x596b94).fillTriangle(23, 0, 3, 63, 43, 63);
      g.fillStyle(0xd5f6ff).fillCircle(23, 19, 9);
      g.lineStyle(3, COLORS.ice).strokeLineShape(new Phaser.Geom.Line(39, 21, 39, 66));
      g.fillStyle(COLORS.ice).fillCircle(39, 18, 6);
    });
    this.createTexture("guardian", 94, 112, (g) => {
      g.fillStyle(0x8ca9ba).fillRoundedRect(8, 29, 78, 75, 16);
      g.fillStyle(0xdff8ff).fillCircle(47, 25, 25);
      g.fillStyle(COLORS.ice).fillCircle(38, 23, 5).fillCircle(56, 23, 5);
      g.fillStyle(COLORS.deepBlue).fillTriangle(47, 0, 34, 15, 60, 15);
      g.lineStyle(5, COLORS.ice).strokeLineShape(new Phaser.Geom.Line(16, 53, 78, 53));
    });
    this.createTexture("axe", 70, 18, (g) => {
      g.lineStyle(5, COLORS.gold).strokeLineShape(new Phaser.Geom.Line(4, 14, 58, 5));
      g.fillStyle(COLORS.snow).fillTriangle(52, 2, 68, 0, 62, 15);
    });
    this.createTexture("spear", 72, 12, (g) => {
      g.lineStyle(4, COLORS.gold).strokeLineShape(new Phaser.Geom.Line(3, 9, 57, 3));
      g.fillStyle(COLORS.ice).fillTriangle(54, 0, 72, 2, 59, 11);
    });
    this.createTexture("serpent", 150, 74, (g) => {
      g.fillStyle(0x3d7188).fillEllipse(75, 40, 140, 52);
      g.fillStyle(COLORS.ice).fillCircle(48, 33, 6).fillCircle(103, 33, 6);
      g.lineStyle(4, COLORS.gold).strokeLineShape(new Phaser.Geom.Line(25, 50, 125, 50));
    });
    this.createTexture("pickup", 24, 24, (g) => {
      g.fillStyle(COLORS.green).fillCircle(12, 12, 11);
      g.fillStyle(COLORS.snow).fillRect(9, 4, 6, 16).fillRect(4, 9, 16, 6);
    });
    document.getElementById("loading")?.remove();
    this.scene.start("MenuScene");
  }

  createTexture(key, width, height, draw) {
    const graphics = this.make.graphics({ add: false });
    draw(graphics);
    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }
}

class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    addBackground(this);
    addTitle(this, "THE LAST SPARTAN", 174);
    this.add.text(WIDTH / 2, 260, "La última defensa del invierno eterno", {
      fontFamily: "Georgia", fontSize: "22px", color: "#b8dcf2"
    }).setOrigin(0.5);
    const button = this.add.text(WIDTH / 2, 390, "⚔  INICIAR CAMPAÑA  ⚔", {
      fontFamily: "Georgia", fontSize: "28px", color: "#23272f",
      backgroundColor: "#f4c542", padding: { left: 26, right: 26, top: 14, bottom: 14 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    button.on("pointerover", () => button.setStyle({ backgroundColor: "#ff8f3d" }));
    button.on("pointerout", () => button.setStyle({ backgroundColor: "#f4c542" }));
    button.on("pointerdown", () => this.scene.start("GameScene"));
    this.add.text(WIDTH / 2, 500, "A / D: moverse   •   W o ESPACIO: saltar   •   J: atacar   •   P: pausa", {
      fontFamily: "Arial", fontSize: "16px", color: "#eaf4ff"
    }).setOrigin(0.5);
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    addBackground(this);
    this.physics.world.setBounds(0, 0, WIDTH, HEIGHT);
    this.player = this.physics.add.sprite(170, GROUND_Y - 40, "player").setCollideWorldBounds(true);
    this.player.body.setSize(30, 68).setOffset(9, 4);
    this.player.health = 100;
    this.player.invulnerableUntil = 0;
    this.player.attackUntil = 0;
    this.player.attackCooldownUntil = 0;
    this.player.facing = 1;
    this.progression = new ProgressionManager();
    this.audio = new AudioManager(this);
    this.weapons = {
      axe: new AxeWeapon(this, this.player),
      spear: new SpearWeapon(this, this.player)
    };
    this.selectedWeapon = this.weapons.axe;
    this.enemies = this.physics.add.group();
    this.pickups = this.physics.add.group();
    this.projectiles = this.physics.add.group();
    this.spears = this.physics.add.group();
    this.platforms = this.physics.add.staticGroup();
    this.createPlatforms();
    this.platforms.create(WIDTH / 2, GROUND_Y + 37, "ground").setScale(1, 1).refreshBody();
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.spears, this.platforms, this.stickSpearTerrain, undefined, this);
    this.physics.add.overlap(this.player, this.pickups, this.collectPickup, undefined, this);
    this.physics.add.overlap(this.player, this.projectiles, this.collectProjectile, undefined, this);
    this.physics.add.overlap(this.spears, this.enemies, this.stickSpear, undefined, this);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("A,D,J,P,W,K,ONE,TWO");
    this.input.keyboard.on("keydown-P", () => this.togglePause());
    this.input.keyboard.on("keydown-ONE", () => this.selectWeapon("axe"));
    this.input.keyboard.on("keydown-TWO", () => this.selectWeapon("spear"));
    this.input.keyboard.on("keydown-K", () => this.weapons.spear.detonate());
    this.attackGraphic = this.add.image(this.player.x, this.player.y, "axe")
      .setVisible(false)
      .setDepth(2);
    this.score = 0;
    this.kills = 0;
    this.combo = 0;
    this.comboExpiresAt = 0;
    this.spawnedBoss = false;
    this.bossController = null;
    this.finalBossStarted = false;
    this.nextSpawnAt = 0;
    this.wave = 1;
    this.messageUntil = 0;
    this.createHud();
    this.spawnWave();
  }

  createPlatforms() {
    const graphics = this.add.graphics();
    graphics.fillStyle(COLORS.deepBlue).fillRect(0, GROUND_Y + 14, WIDTH, 72);
    graphics.fillStyle(COLORS.ice).fillRect(0, GROUND_Y + 7, WIDTH, 7);
    graphics.generateTexture("ground", WIDTH, 86);
    graphics.destroy();
    [[340, 450, 190], [690, 390, 180], [940, 470, 150]].forEach(([x, y, width]) => {
      const platform = this.add.rectangle(x, y, width, 15, COLORS.steel).setStrokeStyle(2, COLORS.ice);
      this.physics.add.existing(platform, true);
      this.platforms.add(platform);
    });
  }

  createHud() {
    this.add.rectangle(18, 18, 310, 78, 0x101b2d, 0.85).setOrigin(0);
    this.add.text(32, 27, "SPARTAN", { fontSize: "15px", color: "#eaf4ff" });
    this.healthBar = this.add.rectangle(32, 52, 240, 14, COLORS.red).setOrigin(0);
    this.add.rectangle(32, 52, 240, 14).setOrigin(0).setStrokeStyle(2, COLORS.snow);
    this.statusText = this.add.text(32, 73, "VIDA 100", { fontSize: "13px", color: "#eaf4ff" });
    this.infoText = this.add.text(WIDTH - 25, 25, "", {
      fontSize: "18px", color: "#f4c542", align: "right"
    }).setOrigin(1, 0);
    this.weaponText = this.add.text(32, 112, "", {
      fontSize: "16px", color: "#7fd8ff"
    });
    this.add.text(WIDTH - 25, HEIGHT - 31, "P: Pausa", {
      fontSize: "14px", color: "#b8dcf2"
    }).setOrigin(1);
    this.messageText = this.add.text(WIDTH / 2, 115, "", {
      fontSize: "24px", color: "#f4c542", stroke: "#23272f", strokeThickness: 5
    }).setOrigin(0.5);
    this.bossBarContainer = this.add.rectangle(WIDTH / 2, 35, 360, 18, COLORS.charcoal)
      .setStrokeStyle(2, COLORS.ice).setVisible(false);
    this.bossBar = this.add.rectangle(WIDTH / 2 - 178, 35, 356, 12, COLORS.red)
      .setOrigin(0, 0.5).setVisible(false);
    this.bossNameText = this.add.text(WIDTH / 2, 58, "", {
      fontSize: "14px", color: "#eaf4ff"
    }).setOrigin(0.5).setVisible(false);
  }

  update(time, delta) {
    if (this.player.health <= 0) return;
    const left = this.cursors.left.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;
    if (left) {
      this.player.setVelocityX(-220);
      this.player.setFlipX(true);
      this.player.facing = -1;
    } else if (right) {
      this.player.setVelocityX(220);
      this.player.setFlipX(false);
      this.player.facing = 1;
    } else {
      this.player.setVelocityX(0);
    }
    if ((this.cursors.up.isDown || this.keys.W.isDown || this.cursors.space?.isDown) &&
        this.player.body.blocked.down && !this.jumpHeld) {
      this.player.setVelocityY(-420);
      this.jumpHeld = true;
    }
    if (!(this.cursors.up.isDown || this.keys.W.isDown || this.cursors.space?.isDown)) this.jumpHeld = false;
    if (Phaser.Input.Keyboard.JustDown(this.keys.J)) this.selectedWeapon.attack(time);
    if (this.combo > 0 && time > this.comboExpiresAt) this.combo = 0;
    if (time > this.nextSpawnAt && this.enemies.countActive(true) < 7 && this.kills < 30) this.spawnEnemy();
    this.enemies.children.each((enemy) => this.updateEnemy(enemy, time));
    this.spears.children.each((spear) => {
      if (spear.active && (spear.x < -80 || spear.x > WIDTH + 80)) spear.destroy();
    });
    if (this.player.attackUntil > time) this.attackGraphic.setVisible(true);
    else this.attackGraphic.setVisible(false);
    this.attackGraphic.x = this.player.x + this.player.facing * 43;
    this.attackGraphic.y = this.player.y - 6;
    this.updateHud(time);
  }

  updateEnemy(enemy, time) {
    if (!enemy.active) return;
    if (enemy.bossController) {
      enemy.bossController.update(time);
      return;
    }
    const distance = this.player.x - enemy.x;
    enemy.state = "chase";
    if (enemy.type === "shaman") {
      enemy.setVelocityX(Math.sign(distance) * Math.min(Math.abs(distance) * 0.25, 65));
      if (time > enemy.nextShot && Math.abs(distance) < 470) {
        enemy.nextShot = time + 1900;
        const projectile = this.add.circle(enemy.x, enemy.y, 7, COLORS.ice);
        this.physics.add.existing(projectile);
        projectile.body.setAllowGravity(false);
        projectile.body.setVelocityX(Math.sign(distance) * 210);
        projectile.body.setVelocityY(-20);
        projectile.damage = 8;
        this.projectiles.add(projectile);
        this.time.delayedCall(3200, () => projectile.destroy());
      }
    } else {
      const speed = enemy.type === "wolf" ? 125 : enemy.type === "guardian" ? 45 : 58;
      enemy.setVelocityX(Math.sign(distance) * speed);
    }
    if (Math.abs(distance) < (enemy.type === "guardian" ? 75 : 43) && time > enemy.nextHit) {
      enemy.state = "attack";
      enemy.nextHit = time + (enemy.type === "wolf" ? 700 : 1100);
      this.damagePlayer(enemy.type === "guardian" ? 18 : 10);
    }
    if (enemy.y > HEIGHT + 50) enemy.destroy();
  }

  performMeleeAttack({ damage, heavy, comboStep }) {
    this.attackGraphic.setVisible(true);
    this.attackGraphic.setTexture("axe").setScale(heavy ? 1.3 : 1);
    this.audio.playAttack();
    const hitbox = new Phaser.Geom.Rectangle(
      this.player.x + this.player.facing * 5 - (this.player.facing < 0 ? 100 : 0),
      this.player.y - 47, 100, 80
    );
    let hit = false;
    this.enemies.children.each((enemy) => {
      if (!enemy.active || !Phaser.Geom.Intersects.RectangleToRectangle(hitbox, enemy.getBounds())) return;
      hit = true;
      const critical = this.progression.rollCritical();
      const hitDamage = critical ? damage * 2 : damage;
      enemy.state = "hurt";
      if (enemy.bossController) enemy.bossController.takeDamage(hitDamage);
      else enemy.health -= hitDamage;
      enemy.setTint(critical ? COLORS.gold : COLORS.snow);
      this.time.delayedCall(100, () => enemy.clearTint());
      this.createImpact(enemy.x, enemy.y, critical);
      this.showDamageNumber(enemy.x, enemy.y - 35, hitDamage, critical);
      this.showMessage(critical ? "¡GOLPE CRÍTICO!" : `COMBO ${comboStep}`);
      enemy.setVelocityX(this.player.facing * (heavy ? 150 : 70));
      if (!enemy.bossController && enemy.health <= 0) this.defeatEnemy(enemy);
    });
    if (!hit) this.combo = 0;
  }

  selectWeapon(key) {
    this.selectedWeapon = this.weapons[key];
    this.attackGraphic.setTexture(key === "axe" ? "axe" : "spear").setScale(1);
    this.showMessage(`${this.selectedWeapon.name.toUpperCase()} EQUIPADA`);
  }

  throwSpear() {
    const spear = this.spears.create(this.player.x + this.player.facing * 35, this.player.y - 8, "spear");
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
      this.enemies.children.each((enemy) => {
        if (!enemy.active || Phaser.Math.Distance.Between(spear.x, spear.y, enemy.x, enemy.y) > 125) return;
        const damage = this.progression.getAttackDamage(55) + this.progression.explosionBonus;
        if (enemy.bossController) enemy.bossController.takeDamage(damage);
        else {
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
    if (this.kills % 5 === 0) this.dropPickup(enemy.x, enemy.y);
    if (this.kills === 30) {
      this.spawnBoss();
    } else if (this.kills >= 30 && this.enemies.countActive(true) === 0) {
      this.scene.start("VictoryScene", { score: this.score });
    }
  }

  spawnWave() {
    this.showMessage(`OLA ${this.wave}`);
    for (let i = 0; i < 3 + this.wave; i++) this.spawnEnemy();
  }

  spawnEnemy(forcedType) {
    const roll = Math.random();
    const type = forcedType || (roll < 0.45 ? "wolf" : roll < 0.78 ? "draugr" : "shaman");
    const texture = type;
    const enemy = this.enemies.create(Math.random() < 0.5 ? -30 : WIDTH + 30, GROUND_Y - 35, texture);
    enemy.type = type;
    enemy.health = type === "wolf" ? 35 : type === "draugr" ? 80 : 50;
    enemy.state = "idle";
    enemy.nextHit = 0;
    enemy.nextShot = this.time.now + 1000;
    enemy.setCollideWorldBounds(false);
    this.nextSpawnAt = this.time.now + 1050;
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
    if (this.time.now < this.player.invulnerableUntil) return;
    this.player.health = Math.max(0, this.player.health - amount);
    this.player.invulnerableUntil = this.time.now + 750;
    this.player.setTint(COLORS.red);
    this.cameras.main.shake(130, 0.006);
    this.time.delayedCall(180, () => this.player.clearTint());
    if (this.player.health <= 0) this.scene.start("GameOverScene", { score: this.score, kills: this.kills });
  }

  collectPickup(player, pickup) {
    pickup.destroy();
    player.health = Math.min(100, player.health + 25);
    this.createImpact(player.x, player.y, false, COLORS.green);
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
      speed: { min: 30, max: 130 }, lifespan: 350, quantity: critical ? 12 : 6,
      scale: { start: 0.6, end: 0 }, tint: color, emitting: false
    });
    burst.explode();
    this.time.delayedCall(450, () => burst.destroy());
  }

  showDamageNumber(x, y, damage, critical) {
    const number = this.add.text(x, y, `${critical ? "CRÍTICO " : ""}${damage}`, {
      fontSize: critical ? "20px" : "16px",
      color: critical ? "#f4c542" : "#eaf4ff",
      stroke: "#23272f", strokeThickness: 4
    }).setOrigin(0.5);
    this.tweens.add({
      targets: number, y: y - 35, alpha: 0, duration: 550,
      onComplete: () => number.destroy()
    });
  }

  updateHud(time) {
    this.healthBar.width = 240 * this.player.health / 100;
    this.statusText.setText(`VIDA ${this.player.health}`);
    this.infoText.setText(`ENEMIGOS  ${this.kills}/30\nPUNTOS  ${this.score}\nCOMBO  x${this.combo}\nLANZAS  ${this.spears.countActive(true)}/4`);
    this.weaponText.setText(`ARMA [1/2]: ${this.selectedWeapon.getLabel()}`);
    if (this.bossController?.entity?.active) {
      this.bossBar.width = 356 * Math.max(0, this.bossController.entity.health / this.bossController.entity.maxHealth);
    }
    if (time > this.messageUntil) this.messageText.setText("");
  }

  showMessage(message) {
    this.messageText.setText(message);
    this.messageUntil = this.time.now + 1900;
  }

  showBossBar() {
    this.bossBarContainer.setVisible(true);
    this.bossBar.setVisible(true);
    this.bossNameText.setText(this.bossController.config.name).setVisible(true);
  }

  hideBossBar() {
    this.bossBarContainer.setVisible(false);
    this.bossBar.setVisible(false);
    this.bossNameText.setVisible(false);
  }

  togglePause() {
    if (this.scene.isPaused()) return;
    this.scene.pause();
    this.scene.launch("PauseScene");
  }
}

class PauseScene extends Phaser.Scene {
  constructor() { super("PauseScene"); }

  create() {
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, COLORS.charcoal, 0.8);
    this.add.text(WIDTH / 2, 205, "PAUSA", { fontSize: "54px", color: "#eaf4ff" }).setOrigin(0.5);
    const resume = this.add.text(WIDTH / 2, 335, "CONTINUAR", {
      fontSize: "25px", color: "#23272f", backgroundColor: "#f4c542", padding: 14
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    resume.on("pointerdown", () => {
      this.scene.stop();
      this.scene.resume("GameScene");
    });
    const menu = this.add.text(WIDTH / 2, 420, "MENÚ PRINCIPAL", {
      fontSize: "20px", color: "#eaf4ff"
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    menu.on("pointerdown", () => {
      this.scene.stop("GameScene");
      this.scene.start("MenuScene");
    });
  }
}

class GameOverScene extends Phaser.Scene {
  constructor() { super("GameOverScene"); }

  init(data) { this.data = data; }

  create() {
    addBackground(this);
    addTitle(this, "LA NOCHE PREVALECIÓ", 210);
    this.add.text(WIDTH / 2, 310, `Enemigos derrotados: ${this.data.kills}\nPuntuación: ${this.data.score}`, {
      fontSize: "23px", color: "#eaf4ff", align: "center", lineSpacing: 12
    }).setOrigin(0.5);
    addActionButton(this, "INTENTAR DE NUEVO", 440, () => this.scene.start("GameScene"));
  }
}

class VictoryScene extends Phaser.Scene {
  constructor() { super("VictoryScene"); }

  init(data) { this.data = data; }

  create() {
    addBackground(this);
    addTitle(this, "EL INVIERNO TERMINA", 205);
    this.add.text(WIDTH / 2, 315, `Las aldeas están a salvo.\nPuntuación final: ${this.data.score}`, {
      fontSize: "23px", color: "#eaf4ff", align: "center", lineSpacing: 12
    }).setOrigin(0.5);
    addActionButton(this, "JUGAR DE NUEVO", 455, () => this.scene.start("GameScene"));
  }
}

function addBackground(scene) {
  scene.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, COLORS.deepBlue);
  const sky = scene.add.graphics();
  sky.fillGradientStyle(0x294f73, 0x1e3a5f, 0x101b2d, 0x17283e, 1);
  sky.fillRect(0, 0, WIDTH, HEIGHT);
  sky.fillStyle(0xeaf4ff, 0.16);
  for (let i = 0; i < 50; i++) sky.fillCircle((i * 137) % WIDTH, (i * 83) % 430, (i % 3) + 1);
  sky.fillStyle(0x152943, 1).fillTriangle(0, 500, 270, 230, 520, 500).fillTriangle(310, 500, 700, 170, 1050, 500).fillTriangle(760, 500, 1000, 280, 1250, 500);
  scene.add.rectangle(WIDTH / 2, 540, WIDTH, 28, 0xeaf4ff, 0.65);
}

function addTitle(scene, text, y) {
  scene.add.text(WIDTH / 2, y, text, {
    fontFamily: "Georgia", fontSize: "46px", color: "#eaf4ff",
    stroke: "#101b2d", strokeThickness: 8
  }).setOrigin(0.5);
}

function addActionButton(scene, text, y, callback) {
  const button = scene.add.text(WIDTH / 2, y, text, {
    fontSize: "24px", color: "#23272f", backgroundColor: "#f4c542", padding: 14
  }).setOrigin(0.5).setInteractive({ useHandCursor: true });
  button.on("pointerdown", callback);
}

const config = {
  type: Phaser.AUTO,
  width: WIDTH,
  height: HEIGHT,
  parent: "game-container",
  backgroundColor: "#101b2d",
  physics: { default: "arcade", arcade: { gravity: { y: 850 }, debug: false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootScene, MenuScene, GameScene, PauseScene, GameOverScene, VictoryScene]
};

new Phaser.Game(config);
