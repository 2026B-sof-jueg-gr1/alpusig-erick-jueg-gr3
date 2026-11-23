import { WIDTH, HEIGHT, GROUND_Y, SPARTA_COLORS, GORGE_COLORS } from "../config/constants.js";
import { GORGE_LAYOUT } from "../config/gorgeLayout.js";
import { CINEMATIC_PORTRAITS } from "../config/cinematicConfig.js";
import { SpartanPlayer, SPARTAN_STATES } from "../entities/SpartanPlayer.js";
import { ArgosEnemyManager } from "../entities/ArgosEnemyManager.js";
import { SpartanCombatHUD } from "../ui/SpartanCombatHUD.js";
import { AudioManager } from "../managers/AudioManager.js";
import { ComicNarrativeManager } from "../managers/ComicNarrativeManager.js";
import { CinematicDirector } from "../managers/CinematicDirector.js";

/**
 * ESCENA 2: El Barro, la Lanza y la Caída
 * Parte 1: El Precio de la Gloria — The Last Spartan
 *
 * - Hito 2.1: El Choque contra Argos (Estado 2: Combate Lanza Dory + Escudo Hoplón).
 * - Hito 2.2: La Herida y la Muerte del Ídolo (cinemática de planos sobre la ilustración).
 * - Hito 2.3: La Huida Deshonrosa (Estado 3: Huida herido hacia la izquierda bajo salvas de flechas).
 *
 * Las ilustraciones de hito se intercalan con el combate: apertura a pantalla
 * completa, viñeta insertada al primer combate, corte de emboscada, secuencia
 * de planos en la muerte del General y huida bajo lluvia de flechas.
 */
export class Escena2Scene extends Phaser.Scene {
  constructor() {
    super("Escena2Scene");
  }

  init(data) {
    this.startAtMilestone = data?.startAt || "2.1";
    this.sys.settings.data = {};
  }

  create() {
    this.worldWidth = GORGE_LAYOUT.worldWidth;
    this.physics.world.setBounds(0, 0, this.worldWidth, HEIGHT);
    this.cameras.main.setBounds(0, 0, this.worldWidth, HEIGHT);

    this.audio = new AudioManager(this);
    this.narrative = new ComicNarrativeManager(this, this.audio);
    this.cinematic = new CinematicDirector(this, this.audio);

    this.phaseState = {
      currentMilestone: "2.1",
      trigger1Done: false,
      trigger2Done: false,
      spawnedWaves: new Set(),
      wave4StartedAt: null,
      inCinematic: false,
      fleeActive: false,
      sceneCompleted: false,
      playerFailed: false
    };

    // 1. Construir desfiladero lluvioso, barro, escombros y escaramuzas de fondo
    this.buildGorgeParallaxAndRain();
    this.buildMuddyGroundAndDebris();
    this.buildBackgroundSkirmishes();

    // 2. HUD táctico de combate y jugador
    this.hud = new SpartanCombatHUD(this);
    const { x, y } = GORGE_LAYOUT.playerSpawn;
    this.player = new SpartanPlayer(this, x, y, SPARTAN_STATES.ACTIVE_COMBAT);
    this.player.setDepth(20);
    this.physics.add.collider(this.player, this.groundColliders);

    // 3. Gestor de enemigos de Argos
    this.enemyManager = new ArgosEnemyManager(
      this,
      this.groundColliders,
      this.audio,
      this.hud,
      (kills) => this.onArgosEnemyKilled(kills)
    );

    // Conectar eventos de ataque Dory / Hoplón y solapamiento de flechas
    this.events.on("spartan-attack", this.handlePlayerAttack, this);
    this.events.once("shutdown", () => {
      this.events.off("spartan-attack", this.handlePlayerAttack, this);
      this.stopArrowBarrage();
    });

    this.physics.add.overlap(
      this.player,
      this.enemyManager.arrows,
      (player, arrow) => this.handleArrowHitPlayer(player, arrow),
      undefined,
      this
    );

    // 4. Cámara y controles
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.fadeIn(900, 0, 0, 0);
    this.setupInputs();

    // 5. Arrancar Hito 2.1 o reintento directo en Hito 2.3
    if (this.startAtMilestone === "2.3") {
      this.startHito2_3FleeDirectly();
    } else {
      this.audio.playBattleRainAmbient();
      this.playIntroCinematic();
    }
  }

  // ==========================================================================
  // APERTURA CINEMATOGRÁFICA DEL HITO 2.1
  // ==========================================================================

  async playIntroCinematic() {
    this.phaseState.inCinematic = true;
    this.player.setControlEnabled(false);

    this.showChapterBanner();
    await this.waitMs(1700);

    if (this.chapterBanner?.active) {
      const banner = this.chapterBanner;
      this.chapterBanner = null;
      this.tweens.killTweensOf(banner);
      this.tweens.add({
        targets: banner,
        alpha: 0,
        duration: 240,
        onComplete: () => banner.destroy()
      });
    }

    await this.cinematic.playFullscreen("hito2_1", "clash", {
      hold: 3600,
      atmosphere: "rain",
      caption: "El desfiladero de Argos. La lluvia no distingue bandos.",
      zoomFrom: 1.02,
      zoomTo: 1.12,
      panToX: 0.03
    });

    if (!this.sys.isActive()) return;

    this.phaseState.inCinematic = false;
    this.player.setControlEnabled(true);
    this.showCombatTutorialCard();
  }

  // ==========================================================================
  // CONSTRUCCIÓN VISUAL DEL DESFILADERO (LLUVIA, CENIZA, BARRO Y ESCARAMUZAS)
  // ==========================================================================

  buildGorgeParallaxAndRain() {
    const sky = this.add.graphics().setScrollFactor(0).setDepth(0);
    sky.fillGradientStyle(
      GORGE_COLORS.skyTop,
      GORGE_COLORS.skyTop,
      GORGE_COLORS.skyHorizon,
      GORGE_COLORS.skyHorizon,
      1
    );
    sky.fillRect(0, 0, WIDTH, HEIGHT);

    // Relámpago atmosférico lejano
    this.lightningFlash = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0xdbeafe, 0)
      .setScrollFactor(0)
      .setDepth(1);

    this.time.addEvent({
      delay: 4200,
      loop: true,
      callback: () => {
        if (!this.phaseState.inCinematic && Math.random() < 0.45) {
          this.lightningFlash.setAlpha(0.22);
          this.tweens.add({ targets: this.lightningFlash, alpha: 0, duration: 220 });
        }
      }
    });

    // Capa lejana: Paredes escarpadas del desfiladero
    const farCliffs = this.add.graphics().setScrollFactor(0.18).setDepth(2);
    farCliffs.fillStyle(GORGE_COLORS.cliffFar, 0.95);
    for (let cx = -80; cx < 2200; cx += 280) {
      farCliffs.fillTriangle(cx, GROUND_Y, cx + 140, 110 + (cx % 70), cx + 320, GROUND_Y);
    }

    // Capa media: Riscos oscuros y columnas de humo
    const midCliffs = this.add.graphics().setScrollFactor(0.38).setDepth(4);
    midCliffs.fillStyle(GORGE_COLORS.cliffMid, 0.95);
    for (let mx = -60; mx < 2600; mx += 340) {
      midCliffs.fillTriangle(mx, GROUND_Y, mx + 170, 220 + (mx % 60), mx + 360, GROUND_Y);
    }

    // Lluvia intensa diagonal fija en viewport + ceniza flotante
    this.rainEmitter = this.add.particles(0, 0, "rain_drop", {
      x: { min: -80, max: WIDTH + 120 },
      y: -30,
      lifespan: 820,
      speedX: { min: -160, max: -120 },
      speedY: { min: 680, max: 820 },
      quantity: 4,
      frequency: 28,
      alpha: { start: 0.65, end: 0.25 }
    }).setScrollFactor(0).setDepth(90);

    this.ashEmitter = this.add.particles(0, 0, "ash_mote", {
      x: { min: 0, max: WIDTH },
      y: { min: 60, max: GROUND_Y - 20 },
      lifespan: 3600,
      speedX: { min: -45, max: -15 },
      speedY: { min: 15, max: 40 },
      scale: { start: 0.5, end: 1.0 },
      alpha: { start: 0.65, end: 0 },
      quantity: 1,
      frequency: 170
    }).setScrollFactor(0).setDepth(89);
  }

  buildMuddyGroundAndDebris() {
    this.groundColliders = this.physics.add.staticGroup();

    for (let gx = 0; gx < this.worldWidth; gx += 512) {
      this.add.image(gx + 256, GROUND_Y + 46, "gorge_mud_ground").setDepth(10);
    }

    const physicsFloor = this.add.rectangle(
      this.worldWidth / 2,
      GROUND_Y + 50,
      this.worldWidth,
      100,
      0x000000,
      0
    );
    this.physics.add.existing(physicsFloor, true);
    this.groundColliders.add(physicsFloor);

    // Escudos rotos y lanzas clavadas en el barro a lo largo de todo el desfiladero
    for (let dx = 180; dx < this.worldWidth - 140; dx += 195) {
      this.add.image(dx + (dx % 40), GROUND_Y + 4, "broken_shield")
        .setFlipX(dx % 2 === 0)
        .setDepth(12);

      if (dx % 3 !== 0) {
        this.add.image(dx + 75, GROUND_Y - 24, "stuck_spear")
          .setRotation((dx % 5 - 2) * 0.14)
          .setDepth(11);
      }
    }
  }

  buildBackgroundSkirmishes() {
    this.skirmishPairs = GORGE_LAYOUT.backgroundSkirmishes.map((cfg, idx) => {
      const spartan = this.add.image(cfg.x - 24, GROUND_Y - 38, "spartan_ally")
        .setScale(0.82)
        .setAlpha(0.75)
        .setDepth(8);

      const argos = this.add.image(cfg.x + 28, GROUND_Y - 38, "argos_soldier")
        .setScale(0.82)
        .setAlpha(0.75)
        .setDepth(8);

      const clashTween = this.tweens.add({
        targets: spartan,
        x: cfg.x - 10,
        duration: 420 + idx * 40,
        yoyo: true,
        loop: -1,
        ease: "Sine.easeInOut"
      });

      const argosTween = this.tweens.add({
        targets: argos,
        x: cfg.x + 14,
        duration: 420 + idx * 40,
        yoyo: true,
        loop: -1,
        ease: "Sine.easeInOut"
      });

      return {
        ...cfg,
        spartan,
        argos,
        clashTween,
        argosTween,
        fallen: false
      };
    });
  }

  // ==========================================================================
  // CONTROLES, BANNER Y TUTORIAL BREVE (HITO 2.1)
  // ==========================================================================

  setupInputs() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("A,D,W,S,J,K,L,SHIFT,E,P");

    this.input.keyboard.on("keydown-P", () => {
      if (
        this.scene.isPaused() ||
        this.phaseState.inCinematic ||
        this.phaseState.sceneCompleted ||
        this.phaseState.playerFailed
      ) {
        return;
      }
      this.scene.pause();
      this.scene.launch("PauseScene", { returnScene: "Escena2Scene" });
    });
  }

  showChapterBanner() {
    const banner = this.add.container(WIDTH / 2, 114).setScrollFactor(0).setDepth(150).setAlpha(0);
    this.chapterBanner = banner;
    const bg = this.add.graphics();
    bg.fillStyle(0x111318, 0.88).fillRoundedRect(-270, -34, 540, 68, 6);
    bg.lineStyle(2, SPARTA_COLORS.bronze, 0.9).strokeRoundedRect(-270, -34, 540, 68, 6);

    const title = this.add.text(0, -11, "PARTE 1: EL PRECIO DE LA GLORIA", {
      fontFamily: "Georgia, serif",
      fontSize: "13px",
      fontStyle: "bold",
      color: "#e8b962",
      letterSpacing: 3
    }).setOrigin(0.5);

    const subtitle = this.add.text(0, 12, "ESCENA 2 — El Barro, la Lanza y la Caída", {
      fontFamily: "Georgia, serif",
      fontSize: "16px",
      color: "#fff6e5"
    }).setOrigin(0.5);

    banner.add([bg, title, subtitle]);

    this.tweens.add({
      targets: banner,
      alpha: 1,
      duration: 500,
      hold: 2300,
      yoyo: true,
      onComplete: () => {
        if (banner.active) banner.destroy();
        if (this.chapterBanner === banner) this.chapterBanner = null;
      }
    });
  }

  showCombatTutorialCard() {
    const card = this.add.container(WIDTH - 195, 216).setScrollFactor(0).setDepth(130).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x12151a, 0.86).fillRoundedRect(-170, -56, 340, 112, 6);
    bg.lineStyle(1.5, SPARTA_COLORS.bronzeLight, 0.85).strokeRoundedRect(-170, -56, 340, 112, 6);

    const lines = [
      "TÉCNICAS DE FALANGE (DORY + HOPLÓN)",
      "[J] Estocada Rápida (Combo x3)",
      "[K] Barrido / Estocada Pesada (Empuje)",
      "[Shift / L] Guardia Férrea (Bloquea frente)",
      "[Shift/L + J] Golpe de Escudo (Rompe guardia)"
    ].join("\n");

    const text = this.add.text(0, 0, lines, {
      fontFamily: "Arial, sans-serif",
      fontSize: "12px",
      color: "#f6eedb",
      align: "left",
      lineSpacing: 5
    }).setOrigin(0.5);

    card.add([bg, text]);
    this.tweens.add({
      targets: card,
      alpha: 1,
      duration: 400,
      hold: 7200,
      yoyo: true,
      onComplete: () => card.destroy()
    });
  }

  // ==========================================================================
  // BUCLE PRINCIPAL Y PROGRESIÓN DE HITOS
  // ==========================================================================

  update(time, delta) {
    this.narrative.update();

    if (this.phaseState.sceneCompleted || this.phaseState.playerFailed) return;

    if (!this.phaseState.inCinematic) {
      this.player.update(time, delta, this.cursors, this.keys);
    }

    this.hud.updatePlayerStatus(this.player);

    if (this.phaseState.currentMilestone === "2.1") {
      this.enemyManager.update(time, this.player);
      this.updateBackgroundSkirmishes();
      this.checkHito2_1Progression(time);
    } else if (this.phaseState.currentMilestone === "2.3" && this.phaseState.fleeActive) {
      this.checkHito2_3Escape();
    }
  }

  handlePlayerAttack(attackData) {
    if (this.phaseState.currentMilestone !== "2.1" || this.phaseState.inCinematic) return;
    this.enemyManager.applyPlayerAttack(this.player, attackData, this.time.now);
  }

  handleArrowHitPlayer(player, arrow) {
    this.enemyManager.handleArrowOverlap(player, arrow, this.time.now);
    if (player.health <= 0) {
      this.triggerPlayerDefeat("2.1");
    }
  }

  updateBackgroundSkirmishes() {
    this.skirmishPairs.forEach((pair) => {
      if (pair.fallen || this.player.x < pair.fallAtPlayerX) return;
      pair.fallen = true;

      pair.clashTween.stop();
      pair.argosTween.stop();
      pair.spartan.setTexture("fallen_spartan_body").setY(GROUND_Y - 12);
      this.tweens.add({
        targets: pair.argos,
        x: pair.argos.x + 90,
        alpha: 0,
        duration: 1200
      });
    });
  }

  checkHito2_1Progression(time) {
    if (this.player.health <= 0) {
      this.triggerPlayerDefeat("2.1");
      return;
    }

    const px = this.player.x;

    // Activar oleadas de Argos progresivamente
    GORGE_LAYOUT.waves.forEach((wave) => {
      if (!this.phaseState.spawnedWaves.has(wave.id) && px >= wave.triggerX) {
        this.phaseState.spawnedWaves.add(wave.id);
        this.enemyManager.spawnWave(wave.enemies);
        if (wave.id === 4) {
          this.phaseState.wave4StartedAt = time;
          this.hud.setObjective("¡SOBREVIVE A LA EMBOSCADA Y AVANZA →!", "#fca5a5");
        }
      }
    });

    // Trigger 2 (Mitad del mapa): "¡nos tendieron una trampa!"
    if (!this.phaseState.trigger2Done && px >= GORGE_LAYOUT.triggers.midMapTrapX) {
      this.phaseState.trigger2Done = true;
      this.enemyManager.setAggressiveMode(true);
      this.audio.playDissonantBattleShift();

      // Corte seco de emboscada: la ilustración irrumpe sobre el combate
      this.cinematic.playFlash("hito2_1", "wide", {
        hold: 1250,
        atmosphere: "rain",
        zoomFrom: 1.0,
        zoomTo: 1.1,
        fadeIn: 100,
        fadeOut: 240
      });

      this.narrative.showVignette({
        corner: "top-right",
        variant: "thought",
        speaker: "Soldado",
        portraitKey: CINEMATIC_PORTRAITS.soldierThought,
        text: "Son demasiados... la falange se rompió. No era una patrulla... ¡nos tendieron una trampa!",
        autoDismissDelay: 4600,
        depth: 200
      });
    }

    // Condición de activación de Hito 2.2: llegar al extremo del desfiladero tras afrontar la última oleada
    const wave4Done =
      this.phaseState.spawnedWaves.has(4) &&
      (this.enemyManager.getActiveCount() === 0 ||
        (this.phaseState.wave4StartedAt && time - this.phaseState.wave4StartedAt > 11000));

    if (px >= GORGE_LAYOUT.triggers.ambushCinematicX && wave4Done && !this.phaseState.inCinematic) {
      this.runHito2_2WoundAndGeneralDeath();
    }
  }

  onArgosEnemyKilled(kills) {
    // Trigger 1 (Al derrotar a los primeros enemigos con la lanza)
    if (!this.phaseState.trigger1Done && kills >= 2) {
      this.phaseState.trigger1Done = true;
      this.narrative.showBubble(
        this.player,
        "¡Por Esparta! ¡Miren cómo caen!",
        { duration: 3600, offsetY: 78 }
      );

      // Viñeta ilustrada sobre el cielo del desfiladero, sin tapar el combate
      this.cinematic.showInset("hito2_1", "impact", {
        width: 400,
        x: WIDTH / 2,
        y: 152,
        hold: 4600,
        slideFrom: 80,
        slideAxis: "y"
      });
    }
  }

  // ==========================================================================
  // HITO 2.2: LA HERIDA Y LA MUERTE DEL ÍDOLO (CINEMÁTICA HÍBRIDA 2D / 3D)
  // ==========================================================================

  async runHito2_2WoundAndGeneralDeath() {
    this.phaseState.currentMilestone = "2.2";
    this.phaseState.inCinematic = true;
    this.player.setControlEnabled(false);
    this.enemyManager.clearAllActive();
    this.hud.setHUDVisible(false);

    // Acomodar cámara centrada sobre el clímax
    const cam = this.cameras.main;
    cam.stopFollow();
    const targetCamX = Phaser.Math.Clamp(this.player.x - WIDTH / 2, 0, this.worldWidth - WIDTH);
    this.tweens.add({ targets: cam, scrollX: targetCamX, duration: 500 });

    // 1. ACCIÓN EN 2D: Bloqueo frontal y puñalada por la espalda
    this.player.faceDirection(1);
    this.player.setTexture("spartan_armed_guard");

    const frontArgos = this.add.image(this.player.x + 120, GROUND_Y - 40, "argos_soldier").setDepth(20);
    const backLancer = this.add.image(this.player.x - 190, GROUND_Y - 40, "argos_lancer")
      .setFlipX(true)
      .setDepth(21);

    // Enemigo frontal golpea el escudo del Soldado
    await this.tweenPromise(frontArgos, { x: this.player.x + 48, duration: 280, ease: "Quad.easeIn" });
    this.audio.playShieldBlock();
    this.enemyManager.spawnParticles(this.player.x + 26, this.player.y - 8, "spark_clank", 8);
    cam.shake(110, 0.005);

    // Lancero de Argos aparece por la espalda y lo atraviesa
    await this.tweenPromise(backLancer, { x: this.player.x - 36, duration: 300, ease: "Cubic.easeIn" });
    this.audio.playBackstabImpact();
    this.enemyManager.spawnParticles(this.player.x - 8, this.player.y - 6, "blood_splat", 14);
    cam.shake(260, 0.012);

    // Soldado cae de rodillas y suelta su Hoplón rodando por el barro
    this.player.hasShield = false;
    this.player.setTexture("spartan_kneeling_wounded");
    this.player.y = GROUND_Y - 30;

    const droppedShield = this.add.image(this.player.x + 22, GROUND_Y - 12, "hoplon_shield").setDepth(22);
    this.tweens.add({
      targets: droppedShield,
      x: this.player.x + 160,
      y: GROUND_Y - 2,
      rotation: Math.PI * 2.4,
      duration: 950,
      ease: "Cubic.easeOut"
    });

    // Viñeteado crítico rojo y sonido amortiguado de latidos
    this.hud.setCriticalVignette(0.75, true);
    this.audio.playHeartbeatAndBreath(1050);

    await this.waitMs(1350);

    frontArgos.destroy();
    backLancer.destroy();

    // 2. LA MUERTE DEL ÍDOLO: la ilustración toma el relevo del plano 2D
    await this.playIdolDeathCinematic();

    // Limpiar el escudo tirado del Hito 2.2 y pasar al Hito 2.3
    droppedShield.destroy();
    this.startHito2_3FleeSequence();
  }

  /**
   * La vista se nubla y el mundo 2D cede el paso a la ilustración del Hito 2.2,
   * encadenada en cuatro planos: general → mano → impacto → derrumbe.
   */
  async playIdolDeathCinematic() {
    await this.cinematic.playShotSequence("hito2_2", [
      {
        shot: "wide",
        hold: 2000,
        caption: "El General se abrió paso entre el humo, derribando a dos argivos."
      },
      {
        shot: "hand",
        hold: 1700,
        caption: "Su mano ensangrentada se tendió hacia la mía."
      },
      {
        shot: "impact",
        hold: 1500,
        caption: "La punta de una lanza argiva lo atravesó por la espalda.",
        effect: "impact"
      },
      {
        shot: "collapse",
        hold: 2200,
        caption: "El hombre más fuerte de Esparta cayó de rodillas frente a mi rostro.",
        blur: 1.0
      }
    ], { atmosphere: "rain" });

    if (!this.sys.isActive()) return;

    // Viñeta de Cómic: Ojos abiertos del Soldado en estado de shock
    await this.narrative.showVignette({
      corner: "top-left",
      variant: "dramatic",
      speaker: "Soldado (En shock)",
      portraitKey: CINEMATIC_PORTRAITS.soldierShock,
      text: "Si el hombre más fuerte de Esparta cayó como un mortal... ¿qué esperanza queda aquí?",
      autoDismissDelay: 4600,
      depth: 200
    });
  }

  // ==========================================================================
  // HITO 2.3: LA HUIDA DESHONROSA (ESTADO 3 + SALVAS DE FLECHAS)
  // ==========================================================================

  startHito2_3FleeSequence() {
    this.phaseState.currentMilestone = "2.3";
    this.phaseState.inCinematic = true;
    this.phaseState.fleeActive = true;

    // Reubicar al Soldado herido sin escudo mirando hacia la izquierda
    this.player.setPosition(GORGE_LAYOUT.triggers.ambushCinematicX - 80, GROUND_Y - 38);
    this.player.setGameplayState(SPARTAN_STATES.WOUNDED_FLEE);
    this.player.health = 80;
    this.player.faceDirection(-1);
    this.player.setControlEnabled(false);

    // Mostrar cadáver del General atrás como recordatorio visual en el 2D
    this.add.image(GORGE_LAYOUT.triggers.ambushCinematicX + 45, GROUND_Y - 12, "fallen_spartan_body")
      .setScale(1.15)
      .setDepth(14);

    // Configurar HUD y viñeteado suave de herida
    this.hud.setHUDVisible(true);
    this.hud.setCriticalVignette(0.36, true);
    this.hud.setObjective("← ¡HUYE HACIA EL OESTE PARA ESCAPAR!", "#fca5a5");
    this.hud.setControlsHint(
      "A / ←: Huir cojeando al oeste   •   S / ↓: Agacharse ante flechas   •   Espacio: Esquive desesperado   •   P: Pausa"
    );

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.audio.playHeartbeatAndBreath(950);

    // La huida arranca con la ilustración del hito bajo lluvia de flechas
    this.playFleeCinematic();
  }

  async playFleeCinematic() {
    await this.cinematic.playFullscreen("hito2_3", "flight", {
      hold: 3000,
      atmosphere: "rain",
      caption: "El campo está perdido. Solo queda el camino de vuelta.",
      zoomFrom: 1.02,
      zoomTo: 1.1,
      panToX: -0.04
    });

    if (!this.sys.isActive()) return;

    this.phaseState.inCinematic = false;
    this.player.setControlEnabled(true);
    this.startArrowBarrage();
  }

  startHito2_3FleeDirectly() {
    this.phaseState.spawnedWaves = new Set([1, 2, 3, 4]);
    this.phaseState.trigger1Done = true;
    this.phaseState.trigger2Done = true;
    this.startHito2_3FleeSequence();
  }

  startArrowBarrage() {
    this.stopArrowBarrage();
    this.arrowBarrageTimer = this.time.addEvent({
      delay: 1950,
      loop: true,
      callback: () => {
        if (this.phaseState.fleeActive && !this.phaseState.sceneCompleted && !this.phaseState.playerFailed) {
          this.spawnArrowVolley();
        }
      }
    });
  }

  stopArrowBarrage() {
    if (this.arrowBarrageTimer) {
      this.arrowBarrageTimer.remove(false);
      this.arrowBarrageTimer = null;
    }
  }

  spawnArrowVolley() {
    this.audio.playArrowWhistle();

    const baseX = this.player.x;
    const offsets = [-180, -75, 10, 105];
    offsets.forEach((offset, idx) => {
      const targetX = Phaser.Math.Clamp(baseX + offset + Phaser.Math.Between(-22, 22), 70, this.worldWidth - 70);
      const targetY = GROUND_Y + 6;

      // Sombra y destello de advertencia en el suelo 1 segundo antes del impacto
      const shadow = this.add.ellipse(targetX, targetY, 44, 14, 0x0b0908, 0.6).setDepth(15);
      const dangerRing = this.add.circle(targetX, targetY, 24, GORGE_COLORS.dangerRed, 0.25)
        .setStrokeStyle(2, 0xff5e67, 0.9)
        .setDepth(15);

      this.tweens.add({
        targets: dangerRing,
        scale: 0.45,
        alpha: 0.85,
        duration: 950,
        ease: "Quad.easeIn"
      });

      this.time.delayedCall(960 + idx * 40, () => {
        if (!this.sys.isActive()) return;
        shadow.destroy();
        dangerRing.destroy();

        if (!this.phaseState.fleeActive || this.phaseState.sceneCompleted) return;

        // Flecha cayendo desde el cielo en diagonal hacia el suelo
        const fallingArrow = this.add.image(targetX + 85, targetY - 260, "argos_arrow")
          .setRotation(-2.25)
          .setDepth(26);

        this.tweens.add({
          targets: fallingArrow,
          x: targetX,
          y: targetY - 6,
          duration: 140,
          ease: "Linear",
          onComplete: () => {
            this.audio.playArrowThud();
            this.enemyManager.spawnParticles(targetX, targetY, "mud_splash", 5);
            this.evaluateArrowVolleyHit(targetX);

            this.time.delayedCall(1200, () => {
              if (fallingArrow.active) fallingArrow.destroy();
            });
          }
        });
      });
    });
  }

  evaluateArrowVolleyHit(impactX) {
    if (!this.player.active || this.player.health <= 0) return;

    const hitRadius = this.player.isDucked ? 14 : 26;
    if (Math.abs(this.player.x - impactX) <= hitRadius) {
      const damage = this.player.isDucked ? 12 : 24;
      const result = this.player.takeDamage(damage, impactX, this.time.now, { ignoreGuard: true });
      if (result.tookDamage) {
        this.audio.playBackstabImpact();
        this.enemyManager.spawnParticles(this.player.x, this.player.y, "blood_splat", 8);
        this.hud.showFloatingText(this.player.x, this.player.y - 48, `-${damage}`, "#ff5e67");

        if (this.player.health <= 0) {
          this.triggerPlayerDefeat("2.3");
        }
      }
    }
  }

  checkHito2_3Escape() {
    if (this.player.x <= GORGE_LAYOUT.triggers.leftEscapeX) {
      this.finishEscena2();
    }
  }

  async finishEscena2() {
    this.phaseState.fleeActive = false;
    this.phaseState.sceneCompleted = true;
    this.stopArrowBarrage();
    this.player.setControlEnabled(false);

    // Gritos de victoria del ejército de Argos a lo lejos
    this.audio.fadeAmbient(900);
    this.audio.playArgosVictoryCries();

    // Cierre ilustrado: el soldado cruza el límite del desfiladero
    await this.cinematic.playFullscreen("hito2_3", "wide", {
      hold: 2400,
      atmosphere: "rain",
      caption: "Cruzó el límite del desfiladero. Detrás, Argos celebraba."
    });

    if (!this.sys.isActive()) return;

    this.cameras.main.fadeOut(2000, 0, 0, 0);
    this.time.delayedCall(2100, () => {
      this.audio.stopAmbient();
      this.scene.start("Escena3Scene");
    });
  }

  // ==========================================================================
  // PANTALLAS DE REINTENTO Y CIERRE DE ESCENA 2
  // ==========================================================================

  triggerPlayerDefeat(checkpointMilestone) {
    if (this.phaseState.playerFailed) return;
    this.phaseState.playerFailed = true;
    this.stopArrowBarrage();
    this.player.setControlEnabled(false);

    const overlay = this.add.container(WIDTH / 2, HEIGHT / 2).setScrollFactor(0).setDepth(200).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x0b0908, 0.92).fillRect(-WIDTH / 2, -HEIGHT / 2, WIDTH, HEIGHT);
    bg.lineStyle(2, GORGE_COLORS.dangerRed, 0.85).strokeRect(-260, -110, 520, 220);

    const title = this.add.text(0, -45, "HAS CAÍDO EN EL DESFILADERO", {
      fontFamily: "Georgia, serif",
      fontSize: "24px",
      fontStyle: "bold",
      color: "#fca5a5"
    }).setOrigin(0.5);

    const retryBtn = this.add.text(-95, 45, "REINTENTAR", {
      fontFamily: "Georgia, serif",
      fontSize: "16px",
      color: "#1a1412",
      backgroundColor: "#e8b962",
      padding: { left: 18, right: 18, top: 10, bottom: 10 }
    }).setOrigin(0.5).setScrollFactor(0).setInteractive({ useHandCursor: true });

    retryBtn.on("pointerdown", () => {
      this.audio.stopAmbient();
      this.scene.restart({ startAt: checkpointMilestone });
    });

    const menuBtn = this.add.text(95, 45, "MENÚ PRINCIPAL", {
      fontFamily: "Georgia, serif",
      fontSize: "16px",
      color: "#fff6e5",
      backgroundColor: "#7a1212",
      padding: { left: 16, right: 16, top: 10, bottom: 10 }
    }).setOrigin(0.5).setScrollFactor(0).setInteractive({ useHandCursor: true });

    menuBtn.on("pointerdown", () => {
      this.audio.stopAmbient();
      this.scene.start("MenuScene");
    });

    overlay.add([bg, title, retryBtn, menuBtn]);
    this.tweens.add({ targets: overlay, alpha: 1, duration: 400 });
  }

  showEndOfScene2Overlay() {
    this.audio.stopAmbient();
    this.hud.setHUDVisible(false);

    const overlay = this.add.container(WIDTH / 2, HEIGHT / 2).setScrollFactor(0).setDepth(210).setAlpha(0);
    const panel = this.add.graphics();
    panel.fillStyle(0x0b0908, 0.96).fillRect(-WIDTH / 2, -HEIGHT / 2, WIDTH, HEIGHT);
    panel.lineStyle(2, SPARTA_COLORS.bronzeLight, 0.85).strokeRect(-330, -140, 660, 280);

    const header = this.add.text(0, -86, "FIN DE LA ESCENA 2", {
      fontFamily: "Georgia, serif",
      fontSize: "16px",
      color: "#e8b962",
      letterSpacing: 4
    }).setOrigin(0.5);

    const title = this.add.text(0, -40, "El Barro, la Lanza y la Caída", {
      fontFamily: "Georgia, serif",
      fontSize: "24px",
      fontStyle: "bold",
      color: "#fff6e5"
    }).setOrigin(0.5);

    const nextHint = this.add.text(0, 10, "Siguiente capítulo: ESCENA 3 — Cenizas del Deber", {
      fontFamily: "Georgia, serif",
      fontSize: "16px",
      fontStyle: "italic",
      color: "#cbd5e1"
    }).setOrigin(0.5);

    const replayBtn = this.add.text(-195, 82, "REPETIR ESCENA 2", {
      fontFamily: "Georgia, serif",
      fontSize: "15px",
      color: "#1a1412",
      backgroundColor: "#e8b962",
      padding: { left: 14, right: 14, top: 10, bottom: 10 }
    }).setOrigin(0.5).setScrollFactor(0).setInteractive({ useHandCursor: true });

    replayBtn.on("pointerdown", () => this.scene.restart({ startAt: "2.1" }));

    const nextBtn = this.add.text(0, 82, "AVANZAR A ESCENA 3 →", {
      fontFamily: "Georgia, serif",
      fontSize: "15px",
      color: "#fff6e5",
      backgroundColor: "#7a1212",
      padding: { left: 14, right: 14, top: 10, bottom: 10 }
    }).setOrigin(0.5).setScrollFactor(0).setInteractive({ useHandCursor: true });

    nextBtn.on("pointerdown", () => this.scene.start("Escena3Scene"));

    const menuBtn = this.add.text(200, 82, "MENÚ PRINCIPAL", {
      fontFamily: "Georgia, serif",
      fontSize: "15px",
      color: "#eaf4ff",
      backgroundColor: "#1e3a5f",
      padding: { left: 14, right: 14, top: 10, bottom: 10 }
    }).setOrigin(0.5).setScrollFactor(0).setInteractive({ useHandCursor: true });

    menuBtn.on("pointerdown", () => this.scene.start("MenuScene"));

    overlay.add([panel, header, title, nextHint, replayBtn, nextBtn, menuBtn]);

    this.cameras.main.resetFX();
    this.tweens.add({ targets: overlay, alpha: 1, duration: 700 });
  }

  // Utilidades de promesa para coreografías cinematográficas limpias
  tweenPromise(target, config) {
    return new Promise((resolve) => {
      this.tweens.add({
        targets: target,
        ...config,
        onComplete: () => resolve()
      });
    });
  }

  waitMs(ms) {
    return new Promise((resolve) => this.time.delayedCall(ms, resolve));
  }
}

