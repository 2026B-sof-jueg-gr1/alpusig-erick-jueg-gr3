import { WIDTH, HEIGHT, GROUND_Y, SPARTA_COLORS, ASHES_COLORS } from "../config/constants.js";
import { VILLAGE_LAYOUT } from "../config/villageLayout.js";
import { SpartanPlayer, SPARTAN_STATES } from "../entities/SpartanPlayer.js";
import { AudioManager } from "../managers/AudioManager.js";
import { ComicNarrativeManager } from "../managers/ComicNarrativeManager.js";

/**
 * ESCENA 3: Cenizas del Deber
 * Parte 1: El Precio de la Gloria — The Last Spartan
 *
 * Reutiliza la geometría y coordenadas de Escena 1 (`VILLAGE_LAYOUT`) recorridas
 * en sentido inverso (de derecha a izquierda) bajo un pueblo destruido y en llamas:
 * - Hito 3.1: El Humo en el Horizonte (Estado 3: herido, llegada al pórtico).
 * - Hito 3.2: El Recorrido del Horror (Estado 4: sprint desesperado entre llamas).
 * - Hito 3.3: El Quiebre del Espartano (Cinemática final 3D, 3 viñetas y cierre).
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

    this.phaseState = {
      currentMilestone: "3.1",
      watchpostTriggered: false,
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
    this.showChapterBanner();
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
      if (this.scene.isPaused() || this.phaseState.inCinematic || this.phaseState.sceneCompleted) {
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
      onComplete: () => banner.destroy()
    });
  }

  // ==========================================================================
  // BUCLE PRINCIPAL Y PROGRESIÓN (HITO 3.1 -> HITO 3.2 -> HITO 3.3)
  // ==========================================================================

  update(time, delta) {
    this.narrative.update();

    if (this.phaseState.inCinematic || this.phaseState.sceneCompleted) return;

    this.player.update(time, delta, this.cursors, this.keys);

    const px = this.player.x;
    const { watchpostTriggerX, doorPromptX, doorThresholdX } = VILLAGE_LAYOUT.escena3;

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
    this.objectiveText.setText("¡Descubre qué ocurrió en el pueblo!").setColor("#fca5a5");

    await this.narrative.showVignette({
      corner: "top-left",
      variant: "thought",
      shaky: true,
      speaker: "Soldado",
      portraitKey: "portrait_soldier_despair",
      text: "No... El ejército principal de Argos era una distracción en el valle. El verdadero ataque... vino por aquí.",
      autoDismissDelay: 4200
    });

    if (!this.sys.isActive() || this.phaseState.inCinematic) return;

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

    // 1. Plano 3D / Ilustración Dinámica con capas de profundidad en el umbral quemado
    const fp3Container = this.add.container(0, 0).setScrollFactor(0).setDepth(145).setAlpha(0);

    const interiorBg = this.add.graphics();
    interiorBg.fillGradientStyle(0x0b090a, 0x0b090a, 0x261611, 0x261611, 1);
    interiorBg.fillRect(0, 0, WIDTH, HEIGHT);

    // Suelo interior de ceniza en perspectiva convergente
    interiorBg.fillStyle(0x1b1716, 1);
    interiorBg.fillTriangle(WIDTH / 2, HEIGHT * 0.36, -160, HEIGHT, WIDTH + 160, HEIGHT);
    interiorBg.lineStyle(2, 0x3b2217, 0.45);
    interiorBg.strokeLineShape(new Phaser.Geom.Line(WIDTH / 2, HEIGHT * 0.36, 140, HEIGHT));
    interiorBg.strokeLineShape(new Phaser.Geom.Line(WIDTH / 2, HEIGHT * 0.36, WIDTH - 140, HEIGHT));

    // Resplandor tenue de brasas dentro de la casa destruida
    const hearthGlow = this.add.ellipse(WIDTH * 0.5, HEIGHT * 0.52, 480, 210, ASHES_COLORS.emberOrange, 0.16);

    // Cuerpos de la esposa, hijo e hija en el suelo interior + escudo de juguete partido
    const familyBodies = this.add.image(WIDTH * 0.52, HEIGHT * 0.55, "fp3_family_bodies").setScale(1.18);
    const brokenToyShield = this.add.image(WIDTH * 0.61, HEIGHT * 0.62, "toy_shield_broken").setScale(1.4);

    // Vigas quemadas del marco en primer plano parallax
    const doorframe = this.add.graphics();
    doorframe.fillStyle(0x0e0a09, 0.94);
    doorframe.fillRect(0, 0, 125, HEIGHT);
    doorframe.fillRect(WIDTH - 125, 0, 125, HEIGHT);
    doorframe.fillRect(0, 0, WIDTH, 68);
    doorframe.lineStyle(6, 0x2a1810, 0.7);
    doorframe.strokeLineShape(new Phaser.Geom.Line(125, 68, 125, HEIGHT));
    doorframe.strokeLineShape(new Phaser.Geom.Line(WIDTH - 125, 68, WIDTH - 125, HEIGHT));

    // Espalda del Soldado deteniéndose en el umbral
    const soldierFigure = this.add.image(WIDTH * 0.47, HEIGHT * 0.82, "fp3_soldier_back").setScale(1.12);
    const droppedSpear = this.add.image(WIDTH * 0.57, HEIGHT * 0.82, "dory_spear")
      .setRotation(-0.18)
      .setAlpha(0);

    fp3Container.add([
      interiorBg,
      hearthGlow,
      familyBodies,
      brokenToyShield,
      soldierFigure,
      droppedSpear,
      doorframe
    ]);

    await this.tweenPromise(fp3Container, { alpha: 1, duration: 750 });
    await this.waitMs(1100);

    // 2. El Soldado cae de rodillas, suelta su lanza Dory resonando en el suelo
    soldierFigure.setTexture("fp3_soldier_kneeling");
    soldierFigure.setY(HEIGHT * 0.78);
    droppedSpear.setAlpha(1);
    this.audio.playSpearDrop();
    this.cameras.main.shake(110, 0.004);

    this.tweens.add({
      targets: droppedSpear,
      y: HEIGHT * 0.86,
      x: WIDTH * 0.62,
      rotation: 0.08,
      duration: 380,
      ease: "Bounce.easeOut"
    });

    await this.waitMs(950);

    // 3. Se arrastra hasta abrazar a su familia entre las cenizas
    soldierFigure.setAlpha(0);
    familyBodies.setAlpha(0);

    const embraceTableau = this.add.image(WIDTH * 0.51, HEIGHT * 0.66, "fp3_soldier_embracing")
      .setScale(1.18)
      .setAlpha(0);
    fp3Container.add(embraceTableau);
    fp3Container.bringToTop(doorframe);

    await this.tweenPromise(embraceTableau, { alpha: 1, duration: 650 });
    await this.waitMs(850);

    // 4. Pantalla oscurecida y secuencia de 3 viñetas de cómic dramáticas
    const dimScreen = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x050406, 0)
      .setScrollFactor(0)
      .setDepth(148);
    await this.tweenPromise(dimScreen, { alpha: 0.68, duration: 650 });

    // Viñeta 1: Recuerdo en tonos sepia de la voz del General
    await this.narrative.showVignette({
      corner: "top-left",
      variant: "sepia",
      speaker: "Recuerdo — General",
      portraitKey: "portrait_general_sepia",
      text: "Tu puesto está aquí, soldado. Alguien debe sostener el escudo...",
      autoDismissDelay: 4200
    });

    // Viñeta 2: Primer plano de las manos cubiertas de sangre y ceniza
    await this.narrative.showVignette({
      corner: "top-right",
      variant: "dramatic",
      speaker: "Soldado",
      portraitKey: "portrait_hands_ash_blood",
      text: "Busqué la gloria lejos de mi hogar... y dejé la puerta abierta a la muerte.",
      autoDismissDelay: 4600
    });

    // Viñeta 3: Rostro con lágrimas mezcladas con hollín y odio absoluto hacia sí mismo
    await this.narrative.showVignette({
      corner: "bottom-center",
      variant: "dramatic",
      width: 560,
      speaker: "Soldado",
      portraitKey: "portrait_soldier_penance",
      text: "No fue Argos quien los mató. Fui yo. Y cada gota de sangre que derrame desde hoy... será mi penitencia.",
      autoDismissDelay: 5200
    });

    // 5. Cierre de Parte 1: Alejamiento de la casa en llamas hacia cielo nocturno lleno de brasas
    await this.playPart1ClosingTitleSequence(fp3Container, dimScreen);
  }

  async playPart1ClosingTitleSequence(fp3Container, dimScreen) {
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
      this.tweenPromise(fp3Container, { alpha: 0, duration: 1100 }),
      this.tweenPromise(dimScreen, { alpha: 0, duration: 1100 }),
      this.tweenPromise(nightSkyContainer, { y: 0, duration: 3600, ease: "Sine.easeInOut" })
    ]);

    fp3Container.destroy();
    dimScreen.destroy();

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

    this.createClosingActionButtons();
  }

  createClosingActionButtons() {
    const createBtn = (x, y, label, bg, fg, onClick) => {
      const btn = this.add.text(x, y, label, {
        fontFamily: "Georgia, serif",
        fontSize: "15px",
        color: fg,
        backgroundColor: bg,
        padding: { left: 16, right: 16, top: 10, bottom: 10 }
      })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(190)
        .setAlpha(0)
        .setInteractive({ useHandCursor: true });

      btn.on("pointerdown", onClick);
      this.tweens.add({ targets: btn, alpha: 1, duration: 600 });
      return btn;
    };

    createBtn(WIDTH / 2 - 230, HEIGHT * 0.72, "REPETIR ESCENA 3", "#e8b962", "#1a1412", () => {
      this.scene.restart();
    });
    createBtn(WIDTH / 2, HEIGHT * 0.72, "REJUGAR PARTE 1 (ESCENA 1)", "#7a1212", "#fff6e5", () => {
      this.scene.start("Escena1Scene");
    });
    createBtn(WIDTH / 2 + 225, HEIGHT * 0.72, "MENÚ PRINCIPAL", "#1e3a5f", "#eaf4ff", () => {
      this.scene.start("MenuScene");
    });
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

