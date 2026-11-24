import { WIDTH, HEIGHT, GROUND_Y, SPARTA_COLORS, ASHES_COLORS } from "../config/constants.js";
import { VILLAGE_LAYOUT } from "../config/villageLayout.js";
import { CINEMATIC_PORTRAITS } from "../config/cinematicConfig.js";
import { SpartanPlayer, SPARTAN_STATES } from "../entities/SpartanPlayer.js";
import { AudioManager } from "../managers/AudioManager.js";
import { ComicNarrativeManager } from "../managers/ComicNarrativeManager.js";
import { CinematicDirector } from "../managers/CinematicDirector.js";

/**
 * ESCENA 3: Cenizas del Deber
 * Parte 1: El Precio de la Gloria — The Last Spartan
 *
 * Reutiliza la geometría y coordenadas de Escena 1 (`VILLAGE_LAYOUT`) recorridas
 * en sentido inverso (de derecha a izquierda) bajo un pueblo destruido y en llamas:
 * - Hito 3.1: El Humo en el Horizonte (Estado 3: herido, llegada al pórtico).
 * - Hito 3.2: El Recorrido del Horror (Estado 4: sprint desesperado entre llamas).
 * - Hito 3.3: El Quiebre del Espartano (ilustración animada, 3 viñetas y cierre).
 */
export class Escena3Scene extends Phaser.Scene {
  constructor() {
    super("Escena3Scene");
  }

  create() {
    this.worldWidth = VILLAGE_LAYOUT.worldWidth;
    this.physics.world.setBounds(0, 0, this.worldWidth, HEIGHT);
    this.cameras.main.setBounds(0, 0, this.worldWidth, HEIGHT);

    this.audio = new AudioManager(this);
    this.narrative = new ComicNarrativeManager(this, this.audio);
    this.cinematic = new CinematicDirector(this, this.audio);

    this.phaseState = {
      currentMilestone: "3.1",
      watchpostTriggered: false,
      discoveryActive: false,
      sprintActive: false,
      inCinematic: false,
      sceneCompleted: false
    };

    // 1. Construir cielo rojo oscuro de atardecer, humo en el horizonte y pueblo en ruinas
    this.buildTwilightAndSmokeParallax();
    this.buildBurnedVillageWorld();
    this.buildAshesAndFireAtmosphere();

    // 2. Jugador entrando por el extremo derecho en Estado 3 (Herido) mirando al oeste
    const spawn = VILLAGE_LAYOUT.escena3.playerSpawn;
    this.player = new SpartanPlayer(this, spawn.x, spawn.y, SPARTAN_STATES.WOUNDED_FLEE);
    this.player.faceDirection(-1);
    this.player.setDepth(20);
    this.physics.add.collider(this.player, this.groundColliders);

    // Alinear cámara inmediatamente al extremo derecho antes de seguir al jugador
    this.cameras.main.centerOn(spawn.x, HEIGHT / 2);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.cameras.main.fadeIn(950, 0, 0, 0);

    // 3. Controles, HUD mínimo y audio inicial
    this.setupInputs();
    this.createSceneHUD();

    this.audio.playAshenWindAmbient();
    this.playIntroCinematic();
  }

  // ==========================================================================
  // APERTURA CINEMATOGRÁFICA DEL HITO 3.1
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

    await this.cinematic.playFullscreen("hito3_1", "wide", {
      hold: 3400,
      atmosphere: "embers",
      caption: "El humo se veía desde el valle. No era el humo de las cocinas.",
      zoomFrom: 1.02,
      zoomTo: 1.1,
      panToX: -0.03
    });

    if (!this.sys.isActive()) return;

    this.phaseState.inCinematic = false;
    this.player.setControlEnabled(true);
  }

  // ==========================================================================
  // CONSTRUCCIÓN VISUAL INVERSA DEL PUEBLO DESTRUIDO (HITO 3.1 Y 3.2)
  // ==========================================================================

  buildTwilightAndSmokeParallax() {
    const sky = this.add.graphics().setScrollFactor(0).setDepth(0);
    sky.fillGradientStyle(
      ASHES_COLORS.twilightTop,
      ASHES_COLORS.twilightTop,
      ASHES_COLORS.twilightHorizon,
      ASHES_COLORS.twilightHorizon,
      1
    );
    sky.fillRect(0, 0, WIDTH, HEIGHT);

    // Resplandor moribundo del ocaso al oeste
    this.add.circle(WIDTH * 0.16, HEIGHT * 0.44, 150, ASHES_COLORS.emberOrange, 0.14)
      .setScrollFactor(0.02)
      .setDepth(1);

    // Densa columna de humo negro elevándose desde la zona de casas en parallax
    const farSmokePlume = this.add.graphics().setScrollFactor(0.14).setDepth(2);
    farSmokePlume.fillStyle(ASHES_COLORS.smokeDark, 0.68);
    farSmokePlume.fillEllipse(210, 290, 220, 420);
    farSmokePlume.fillEllipse(255, 160, 280, 260);
    farSmokePlume.fillEllipse(320, 60, 340, 190);
    farSmokePlume.fillEllipse(510, 240, 170, 320);

    // Montañas oscurecidas por el humo
    const farMountains = this.add.graphics().setScrollFactor(0.16).setDepth(3);
    farMountains.fillStyle(0x211214, 0.9);
    for (let mx = -100; mx < 2200; mx += 360) {
      farMountains.fillTriangle(mx, GROUND_Y, mx + 200, 210 + (mx % 90), mx + 420, GROUND_Y);
    }

    // Colinas medias sombrías con reflejo tenue del incendio
    const midHills = this.add.graphics().setScrollFactor(0.35).setDepth(4);
    midHills.fillStyle(0x2b1715, 0.95);
    for (let hx = -120; hx < 2600; hx += 320) {
      midHills.fillEllipse(hx + 160, GROUND_Y + 20, 420, 210);
    }
  }

  buildBurnedVillageWorld() {
    this.groundColliders = this.physics.add.staticGroup();

    for (let gx = 0; gx < this.worldWidth; gx += 512) {
      const isPlaza = gx >= VILLAGE_LAYOUT.plaza.startX - 180;
      const texKey = isPlaza ? "plaza_ground_burned" : "spartan_ground_burned";
      this.add.image(gx + 256, GROUND_Y + 46, texKey).setDepth(10);
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

    // Zona 1 (Izquierda): Hogar destruido y umbral quemado
    const { houseX, doorX, toyShieldX } = VILLAGE_LAYOUT.home;
    this.add.image(houseX, GROUND_Y - 91, "spartan_house_burned").setDepth(12);

    this.doorPrompt = this.add.text(
      doorX + 10,
      GROUND_Y - 122,
      "[E] o acércate al umbral de tu hogar",
      {
        fontFamily: "Georgia, serif",
        fontSize: "13px",
        color: "#fff8e7",
        backgroundColor: "#7a1212dd",
        padding: { left: 10, right: 10, top: 5, bottom: 5 }
      }
    ).setOrigin(0.5).setDepth(120).setVisible(false);

    // Zona 2: Árboles calcinados, casas derruidas, pozo destrozado y objetos saqueados
    const { treesX, housesX, wellX, watchpostX, elderGuardsX } = VILLAGE_LAYOUT.village;

    treesX.forEach((tx) => {
      this.add.image(tx, GROUND_Y - 78, "olive_tree_burned").setDepth(11);
    });

    housesX.forEach((hx) => {
      this.add.image(hx, GROUND_Y - 80, "spartan_village_house_burned").setDepth(11);
    });

    this.add.image(wellX, GROUND_Y - 32, "spartan_well_burned").setDepth(13);

    VILLAGE_LAYOUT.escena3.ransackedPropsX.forEach((px, idx) => {
      this.add.image(px, GROUND_Y - 12, "looted_crate").setFlipX(idx % 2 === 1).setDepth(14);
      if (idx < 3) {
        this.add.image(px + 48, GROUND_Y - 11, "fallen_villager").setDepth(13);
      }
    });

    // Pórtico de vigilancia con los cuerpos sin vida de los ancianos guardias
    this.add.image(watchpostX, GROUND_Y - 94, "watchpost_arch_burned").setDepth(12);
    elderGuardsX.forEach((ex, idx) => {
      this.add.image(ex, GROUND_Y - 12, "elder_guard_dead")
        .setFlipX(idx === 1)
        .setDepth(15);
      this.add.image(ex + (idx === 0 ? -16 : 22), GROUND_Y - 18, "stuck_spear")
        .setRotation(idx === 0 ? -0.35 : 0.42)
        .setDepth(14);
    });

    // Zona 3 (Derecha): Plaza saqueada (banners rotos y escudos rotos)
    VILLAGE_LAYOUT.plaza.bannersX.forEach((bx) => {
      this.add.image(bx, GROUND_Y - 65, "broken_banner_pole").setDepth(12);
    });

    // Escudos rotos tirados en la entrada del pueblo
    [toyShieldX + 1250, 2320, 2760].forEach((sx, i) => {
      this.add.image(sx, GROUND_Y + 4, "broken_shield").setFlipX(i % 2 === 0).setDepth(12);
    });
  }

  buildAshesAndFireAtmosphere() {
    // Focos activos de fuego y humo a lo largo del pueblo
    VILLAGE_LAYOUT.escena3.fireSpotsX.forEach((fx) => {
      this.add.particles(fx, GROUND_Y - 22, "fire_flame", {
        x: { min: -28, max: 28 },
        y: { min: -8, max: 6 },
        lifespan: { min: 450, max: 820 },
        speedY: { min: -95, max: -45 },
        speedX: { min: -16, max: 16 },
        scale: { start: 0.9, end: 0.15 },
        alpha: { start: 0.85, end: 0 },
        quantity: 2,
        frequency: 110
      }).setDepth(17);

      this.add.particles(fx, GROUND_Y - 56, "black_smoke", {
        x: { min: -22, max: 22 },
        lifespan: 2600,
        speedY: { min: -80, max: -42 },
        speedX: { min: -22, max: 12 },
        scale: { start: 0.45, end: 1.55 },
        alpha: { start: 0.45, end: 0 },
        quantity: 1,
        frequency: 260
      }).setDepth(18);
    });

    // Brasas flotantes fijas en viewport
    this.emberEmitter = this.add.particles(0, 0, "ember_spark", {
      x: { min: 0, max: WIDTH },
      y: { min: HEIGHT - 80, max: HEIGHT + 10 },
      lifespan: 3400,
      speedY: { min: -95, max: -38 },
      speedX: { min: -35, max: 25 },
      scale: { start: 1.1, end: 0.25 },
      alpha: { start: 0.9, end: 0 },
      quantity: 1,
      frequency: 110
    }).setScrollFactor(0).setDepth(85);
  }

  // ==========================================================================
  // CONTROLES, HUD Y BANNER INICIAL
  // ==========================================================================

  setupInputs() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("A,D,W,S,E,P");

    this.input.keyboard.on("keydown-E", () => {
      if (this.phaseState.currentMilestone === "3.2" && !this.phaseState.inCinematic) {
        if (this.player.x <= VILLAGE_LAYOUT.escena3.doorPromptX + 20) {
          this.runHito3_3FinalBreakCinematic();
        }
      }
    });

    this.input.keyboard.on("keydown-P", () => {
      if (
        this.scene.isPaused() ||
        this.phaseState.discoveryActive ||
        this.phaseState.inCinematic ||
        this.phaseState.sceneCompleted
      ) {
        return;
      }
      this.scene.pause();
      this.scene.launch("PauseScene", { returnScene: "Escena3Scene" });
    });
  }

  createSceneHUD() {
    this.objectiveText = this.add.text(WIDTH - 24, 24, "← Regresa al pueblo por el camino oeste", {
      fontFamily: "Georgia, serif",
      fontSize: "14px",
      color: "#f6eedb",
      backgroundColor: "#140e0ecc",
      padding: { left: 12, right: 12, top: 6, bottom: 6 }
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(125);

    this.controlsHint = this.add.text(
      WIDTH / 2,
      HEIGHT - 22,
      "A / ←: Avanzar hacia tu hogar   •   P: Pausa",
      {
        fontFamily: "Arial, sans-serif",
        fontSize: "13px",
        color: "#f6eedb",
        backgroundColor: "#140e0ed0",
        padding: { left: 14, right: 14, top: 6, bottom: 6 }
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(125);

    // Viñeta tenue de pánico/brasas para Hito 3.2
    this.panicVignette = this.add.graphics().setScrollFactor(0).setDepth(118).setAlpha(0);
    const thick = 40;
    this.panicVignette.fillStyle(0x7a1212, 0.55);
    this.panicVignette.fillRect(0, 0, WIDTH, thick);
    this.panicVignette.fillRect(0, HEIGHT - thick, WIDTH, thick);
    this.panicVignette.fillRect(0, 0, thick, HEIGHT);
    this.panicVignette.fillRect(WIDTH - thick, 0, thick, HEIGHT);
  }

  showChapterBanner() {
    const banner = this.add.container(WIDTH / 2, 114).setScrollFactor(0).setDepth(150).setAlpha(0);
    this.chapterBanner = banner;
    const bg = this.add.graphics();
    bg.fillStyle(0x140d0c, 0.88).fillRoundedRect(-270, -34, 540, 68, 6);
    bg.lineStyle(2, SPARTA_COLORS.bronze, 0.9).strokeRoundedRect(-270, -34, 540, 68, 6);

    const title = this.add.text(0, -11, "PARTE 1: EL PRECIO DE LA GLORIA", {
      fontFamily: "Georgia, serif",
      fontSize: "13px",
      fontStyle: "bold",
      color: "#e8b962",
      letterSpacing: 3
    }).setOrigin(0.5);

    const subtitle = this.add.text(0, 12, "ESCENA 3 — Cenizas del Deber", {
      fontFamily: "Georgia, serif",
      fontSize: "16px",
      color: "#fff6e5"
    }).setOrigin(0.5);

    banner.add([bg, title, subtitle]);

    this.tweens.add({
      targets: banner,
      alpha: 1,
      duration: 550,
      hold: 2500,
      yoyo: true,
      onComplete: () => {
        if (banner.active) banner.destroy();
        if (this.chapterBanner === banner) this.chapterBanner = null;
      }
    });
  }

  // ==========================================================================
  // BUCLE PRINCIPAL Y PROGRESIÓN (HITO 3.1 -> HITO 3.2 -> HITO 3.3)
  // ==========================================================================

  update(time, delta) {
    this.narrative.update();

    if (this.phaseState.discoveryActive || this.phaseState.inCinematic || this.phaseState.sceneCompleted) return;

    this.player.update(time, delta, this.cursors, this.keys);

    const px = this.player.x;
    const { watchpostTriggerX, doorPromptX, doorThresholdX } = VILLAGE_LAYOUT.escena3;

    // Hito 3.1: el camino solo avanza hacia el oeste. No permite retroceder hacia la salida.
    if (this.phaseState.currentMilestone === "3.1" && this.player.body.velocity.x > 0) {
      this.player.setVelocityX(0);
      this.player.faceDirection(-1);
    }

    // Hito 3.2: la huida es forzada hacia el hogar. Las flechas de dirección ya no cambian el destino.
    if (this.phaseState.sprintActive) {
      const sprintSpeed = this.player.getMovementSpeed();
      this.player.setVelocityX(-sprintSpeed);
      this.player.faceDirection(-1);
      this.player.applyWalkCadence(delta, sprintSpeed);
    }

    // Hito 3.1: Descubrimiento de los ancianos muertos en el pórtico de vigilancia
    if (!this.phaseState.watchpostTriggered && px <= watchpostTriggerX) {
      this.phaseState.watchpostTriggered = true;
      this.triggerWatchpostDiscovery();
    }

    // Hito 3.2: Proximidad al umbral quemado de su hogar
    if (this.phaseState.currentMilestone === "3.2") {
      this.doorPrompt.setVisible(px <= doorPromptX);
      if (px <= doorThresholdX) {
        this.runHito3_3FinalBreakCinematic();
      }
    }
  }

  async triggerWatchpostDiscovery() {
    this.phaseState.discoveryActive = true;
    this.player.setControlEnabled(false);
    this.cameras.main.shake(220, 0.008);
    this.objectiveText.setText("¡Descubre qué ocurrió en el pueblo!").setColor("#fca5a5");

    // Corte ilustrado: los ancianos guardias yacen en el pórtico que él debía cubrir
    this.cinematic.playFlash("hito3_1", "watchpost", {
      hold: 1600,
      atmosphere: "embers",
      zoomFrom: 1.0,
      zoomTo: 1.1,
      fadeIn: 120,
      fadeOut: 260
    });

    await this.narrative.showVignette({
      corner: "top-left",
      variant: "thought",
      shaky: true,
      speaker: "Soldado",
      portraitKey: CINEMATIC_PORTRAITS.soldierDespair,
      text: "No... El ejército principal de Argos era una distracción en el valle. El verdadero ataque... vino por aquí.",
      autoDismissDelay: 4200,
      depth: 200
    });

    if (!this.sys.isActive() || this.phaseState.inCinematic) {
      this.phaseState.discoveryActive = false;
      return;
    }

    this.phaseState.discoveryActive = false;
    this.player.setControlEnabled(true);
    this.activateHito3_2DesperateSprint();
  }

  activateHito3_2DesperateSprint() {
    if (this.phaseState.sprintActive || this.phaseState.inCinematic) return;

    this.phaseState.currentMilestone = "3.2";
    this.phaseState.sprintActive = true;

    // Estado 4: La adrenalina rompe la lentitud de la herida (sin combates activos)
    this.player.setGameplayState(SPARTAN_STATES.DESPERATE_SPRINT);
    this.audio.playDesperateSprintAudio();

    this.objectiveText.setText("← ¡CORRE HACIA TU CASA EN EL EXTREMO OESTE!").setColor("#fb923c");
    this.controlsHint.setText("A / ←: Sprint Desesperado hacia tu hogar   •   E: Umbral de casa   •   P: Pausa");

    this.tweens.add({
      targets: this.panicVignette,
      alpha: { from: 0.25, to: 0.62 },
      duration: 540,
      yoyo: true,
      loop: -1
    });

    this.narrative.showBubble(this.player, "¡No, no, no! ¡Mi casa!", {
      duration: 3800,
      offsetY: 80
    });

    // Viñeta ilustrada del recorrido, sobre el cielo para no tapar la carrera
    this.cinematic.showInset("hito3_2", "sprint", {
      width: 420,
      x: WIDTH / 2,
      y: 150,
      hold: 4800,
      slideFrom: 70,
      slideAxis: "y"
    });
  }

  // ==========================================================================
  // HITO 3.3: EL QUIEBRE DEL ESPARTANO (CINEMÁTICA 3D + 3 VIÑETAS + CIERRE)
  // ==========================================================================

  async runHito3_3FinalBreakCinematic() {
    if (this.phaseState.inCinematic) return;
    this.phaseState.currentMilestone = "3.3";
    this.phaseState.inCinematic = true;
    this.phaseState.sprintActive = false;

    this.doorPrompt.setVisible(false);
    this.player.setControlEnabled(false);
    this.tweens.killTweensOf(this.panicVignette);
    this.panicVignette.setAlpha(0);
    this.objectiveText.setVisible(false);
    this.controlsHint.setVisible(false);

    this.audio.fadeAmbient(900);

    // 1. El umbral: ilustración animada del quiebre (GIF convertido a spritesheet)
    const thresholdPlate = this.cinematic.showFullscreenPlate("hito3_3", "threshold", {
      atmosphere: "embers",
      caption: "La lanza cayó primero. Después cayeron sus rodillas."
    });

    await this.waitMs(1300);

    // La Dory resuena contra las cenizas del umbral
    this.audio.playSpearDrop();
    this.cameras.main.shake(110, 0.004);

    await this.waitMs(3600);

    // 2. La pantalla se oscurece sobre la ilustración y llegan las 3 viñetas
    const dimScreen = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x050406, 0)
      .setScrollFactor(0)
      .setDepth(165);
    await this.tweenPromise(dimScreen, { alpha: 0.62, duration: 650 });

    // Viñeta 1: Recuerdo en tonos sepia de la voz del General
    await this.narrative.showVignette({
      corner: "top-left",
      variant: "sepia",
      speaker: "Recuerdo — General",
      portraitKey: CINEMATIC_PORTRAITS.generalSepia,
      text: "Tu puesto está aquí, soldado. Alguien debe sostener el escudo...",
      autoDismissDelay: 4200,
      depth: 200
    });

    // Viñeta 2: El peso de la culpa (las manos manchadas se ven en la ilustración)
    await this.narrative.showVignette({
      corner: "top-right",
      variant: "dramatic",
      speaker: "Soldado",
      portraitKey: CINEMATIC_PORTRAITS.soldierDespair,
      text: "Busqué la gloria lejos de mi hogar... y dejé la puerta abierta a la muerte.",
      autoDismissDelay: 4600,
      depth: 200
    });

    // Viñeta 3: Rostro con lágrimas mezcladas con hollín y odio absoluto hacia sí mismo
    await this.narrative.showVignette({
      corner: "bottom-center",
      variant: "dramatic",
      width: 560,
      speaker: "Soldado",
      portraitKey: CINEMATIC_PORTRAITS.soldierPenance,
      text: "No fue Argos quien los mató. Fui yo. Y cada gota de sangre que derrame desde hoy... será mi penitencia.",
      autoDismissDelay: 5200,
      depth: 200
    });

    // 3. Cierre de Parte 1
    await this.playPart1ClosingTitleSequence(thresholdPlate, dimScreen);
  }

  async playPart1ClosingTitleSequence(thresholdPlate, dimScreen) {
    this.phaseState.sceneCompleted = true;
    this.audio.playTragicClosingChord();

    const nightSkyContainer = this.add.container(0, -HEIGHT)
      .setScrollFactor(0)
      .setDepth(170);

    // Cielo nocturno graduado en la parte superior y transición hacia llamas abajo
    const skyBg = this.add.graphics();
    skyBg.fillGradientStyle(
      ASHES_COLORS.nightSky,
      ASHES_COLORS.nightSky,
      0x24100d,
      0x24100d,
      1
    );
    skyBg.fillRect(0, 0, WIDTH, HEIGHT);

    // Estrellas tenues en lo alto del cielo nocturno
    for (let i = 0; i < 42; i++) {
      const sx = (i * 197 + 43) % WIDTH;
      const sy = (i * 89 + 21) % (HEIGHT * 0.58);
      skyBg.fillStyle(0xe2e8f0, 0.25 + (i % 3) * 0.18).fillCircle(sx, sy, 1.3);
    }

    // Silueta de la casa en llamas alejándose abajo
    const distantBurningHome = this.add.image(WIDTH * 0.5, HEIGHT - 84, "spartan_house_burned")
      .setScale(0.85)
      .setAlpha(0.92);

    nightSkyContainer.add([skyBg, distantBurningHome]);

    await Promise.all([
      this.cinematic.closeFullscreenPlate(thresholdPlate, { duration: 1100, letterbox: false }),
      this.tweenPromise(dimScreen, { alpha: 0, duration: 1100 }),
      this.tweenPromise(nightSkyContainer, { y: 0, duration: 3600, ease: "Sine.easeInOut" })
    ]);

    dimScreen.destroy();
    this.cinematic.letterbox(false, 700);

    // Brasas ascendiendo hacia el cielo nocturno en primer plano del cierre
    this.add.particles(0, 0, "ember_spark", {
      x: { min: 0, max: WIDTH },
      y: HEIGHT + 10,
      lifespan: 4800,
      speedY: { min: -75, max: -28 },
      speedX: { min: -24, max: 20 },
      scale: { start: 1.25, end: 0.2 },
      alpha: { start: 0.95, end: 0 },
      quantity: 2,
      frequency: 85
    }).setScrollFactor(0).setDepth(175);

    // Título principal: THE LAST SPARTAN
    const titleGroup = this.add.container(WIDTH / 2, HEIGHT * 0.42)
      .setScrollFactor(0)
      .setDepth(185)
      .setAlpha(0);

    const mainTitle = this.add.text(0, -34, "THE LAST SPARTAN", {
      fontFamily: "Georgia, serif",
      fontSize: "62px",
      fontStyle: "bold",
      color: "#f4c542",
      stroke: "#1a0b09",
      strokeThickness: 8
    }).setOrigin(0.5);

    const arcSubtitle = this.add.text(0, 32, "FIN DE LA PARTE 1: EL PRECIO DE LA GLORIA", {
      fontFamily: "Georgia, serif",
      fontSize: "19px",
      color: "#fff6e5",
      letterSpacing: 3
    }).setOrigin(0.5);

    titleGroup.add([mainTitle, arcSubtitle]);
    await this.tweenPromise(titleGroup, { alpha: 1, duration: 1500 });

    // El título se disfruta un momento y se entrega a la pantalla final dedicada.
    await this.waitMs(2400);
    if (this.sys.isActive()) this.scene.start("FinalMenuScene");
  }

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

