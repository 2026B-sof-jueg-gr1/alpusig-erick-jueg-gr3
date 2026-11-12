import { WIDTH, HEIGHT, GROUND_Y, SPARTA_COLORS } from "../config/constants.js";
import { VILLAGE_LAYOUT } from "../config/villageLayout.js";
import { SpartanPlayer, SPARTAN_STATES } from "../entities/SpartanPlayer.js";
import { AudioManager } from "../managers/AudioManager.js";
import { ComicNarrativeManager } from "../managers/ComicNarrativeManager.js";

/**
 * ESCENA 1: El Escudo del Pueblo y el Llamado de la Sangre
 * Parte 1: El Precio de la Gloria — The Last Spartan
 *
 * - Hito 1.1: La Paz Antes de la Tormenta (exploración en Estado 1, entrega de Dory y Hoplón).
 * - Hito 1.2: El Mensajero y el General (llegada del explorador a caballo y llamado a las armas).
 * - Hito 1.3: La Arrogancia del Soldado (confrontación con el General, última mirada al hogar y marcha).
 */
export class Escena1Scene extends Phaser.Scene {
  constructor() {
    super("Escena1Scene");
  }

  create() {
    this.worldWidth = VILLAGE_LAYOUT.worldWidth;
    this.physics.world.setBounds(0, 0, this.worldWidth, HEIGHT);
    this.cameras.main.setBounds(0, 0, this.worldWidth, HEIGHT);

    this.audio = new AudioManager(this);
    this.narrative = new ComicNarrativeManager(this, this.audio);

    this.milestoneState = {
      trigger1Done: false,
      trigger2Done: false,
      hito1_2Started: false,
      waitingGeneralInteract: false,
      hito1_3Started: false,
      sceneCompleted: false
    };

    // 1. Construir capas parallax, suelo y pueblo en paz
    this.buildSkyAndParallax();
    this.buildGroundAndPaths();
    this.buildHomeArea();
    this.buildVillagePathArea();
    this.buildPlazaArea();
    this.buildAtmosphereParticles();

    // 2. Jugador en Estado 1 (Guardia Pacífico, desarmado en la puerta de su hogar)
    const { x, y } = VILLAGE_LAYOUT.playerSpawn;
    this.player = new SpartanPlayer(this, x, y, SPARTAN_STATES.PEACEFUL_GUARD);
    this.player.setDepth(20);
    this.physics.add.collider(this.player, this.groundColliders);

    // Seguimiento suave de cámara
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.cameras.main.fadeIn(900, 0, 0, 0);

    // 3. Controles y UI mínima de escena
    this.setupInputs();
    this.createSceneHUD();

    // 4. Música acústica pacífica e intro del capítulo
    this.audio.playPeacefulVillageAmbient();
    this.showChapterBanner();
  }

  // ==========================================================================
  // CONSTRUCCIÓN DEL ESCENARIO PARALLAX Y PUEBLO ESPARTANO
  // ==========================================================================

  buildSkyAndParallax() {
    const sky = this.add.graphics().setScrollFactor(0).setDepth(0);
    sky.fillGradientStyle(
      SPARTA_COLORS.skyTop,
      SPARTA_COLORS.skyTop,
      SPARTA_COLORS.skyHorizon,
      SPARTA_COLORS.skyHorizon,
      1
    );
    sky.fillRect(0, 0, WIDTH, HEIGHT);

    // Sol mediterráneo suave
    this.add.circle(WIDTH * 0.78, 118, 52, SPARTA_COLORS.sunGold, 0.9)
      .setScrollFactor(0.03)
      .setDepth(1);
    this.add.circle(WIDTH * 0.78, 118, 92, SPARTA_COLORS.sunGold, 0.22)
      .setScrollFactor(0.03)
      .setDepth(1);

    // Nubes cálidas
    const clouds = this.add.graphics().setScrollFactor(0.06).setDepth(2);
    clouds.fillStyle(0xfff6e3, 0.6);
    [180, 520, 890, 1280].forEach((cx, idx) => {
      const cy = 95 + (idx % 2) * 38;
      clouds.fillEllipse(cx, cy, 150, 32);
      clouds.fillEllipse(cx + 42, cy - 10, 95, 28);
    });

    // Capa lejana: Cordillera del Taigeto
    const farMountains = this.add.graphics().setScrollFactor(0.16).setDepth(3);
    farMountains.fillStyle(SPARTA_COLORS.mountainFar, 0.85);
    for (let mx = -100; mx < 2200; mx += 360) {
      farMountains.fillTriangle(mx, GROUND_Y, mx + 200, 210 + (mx % 90), mx + 420, GROUND_Y);
    }

    // Capa media: Colinas de olivos y silueta de acrópolis distante
    const midHills = this.add.graphics().setScrollFactor(0.35).setDepth(4);
    midHills.fillStyle(SPARTA_COLORS.mountainMid, 0.95);
    for (let hx = -120; hx < 2600; hx += 320) {
      midHills.fillEllipse(hx + 160, GROUND_Y + 20, 420, 210);
    }
    // Templo espartano lejano en la colina
    midHills.fillStyle(0xd9ceb8, 0.75).fillRect(880, 365, 94, 42);
    midHills.fillTriangle(872, 365, 927, 342, 982, 365);
  }

  buildGroundAndPaths() {
    this.groundColliders = this.physics.add.staticGroup();

    // Suelo continuo de tierra soleada hasta la plaza y empedrado en la plaza
    for (let gx = 0; gx < this.worldWidth; gx += 512) {
      const isPlaza = gx >= VILLAGE_LAYOUT.plaza.startX - 180;
      const texKey = isPlaza ? "plaza_ground" : "spartan_ground";
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
  }

  buildHomeArea() {
    const { houseX, spearRackX, wifeX, boyX, girlX, toyShieldX } = VILLAGE_LAYOUT.home;

    // Casa del Soldado
    this.add.image(houseX, GROUND_Y - 91, "spartan_house").setDepth(12);

    // Lanza apoyada junto a la puerta antes de ser recogida
    this.homeSpearProp = this.add.image(spearRackX, GROUND_Y - 34, "dory_spear")
      .setRotation(-1.42)
      .setDepth(14);

    // Esposa sosteniendo el Escudo Hoplón al inicio
    this.wifeSprite = this.add.image(wifeX, GROUND_Y - 33, "spartan_wife_shield")
      .setFlipX(true)
      .setDepth(16);

    // Hijo e hija jugando cerca de la casa
    this.boySprite = this.add.image(boyX, GROUND_Y - 21, "spartan_child_boy")
      .setFlipX(true)
      .setDepth(16);
    this.girlSprite = this.add.image(girlX, GROUND_Y - 20, "spartan_child_girl")
      .setFlipX(true)
      .setDepth(16);

    // Pequeño escudo de madera de juguete en el suelo junto a los niños (detalle clave)
    this.toyShield = this.add.image(toyShieldX, GROUND_Y - 4, "toy_shield")
      .setRotation(-0.2)
      .setDepth(15);

    // Pequeña animación pacífica de los niños
    this.tweens.add({
      targets: [this.boySprite, this.girlSprite],
      y: "-=3",
      duration: 900,
      yoyo: true,
      loop: -1,
      ease: "Sine.easeInOut"
    });
  }

  buildVillagePathArea() {
    const { treesX, housesX, wellX, villagers, watchpostX, elderGuardsX } = VILLAGE_LAYOUT.village;

    treesX.forEach((tx) => {
      this.add.image(tx, GROUND_Y - 78, "olive_tree").setDepth(11);
    });

    housesX.forEach((hx) => {
      this.add.image(hx, GROUND_Y - 80, "spartan_village_house").setDepth(11);
    });

    this.add.image(wellX, GROUND_Y - 32, "spartan_well").setDepth(13);

    // Aldeanos trabajando en paz
    villagers.forEach((v, idx) => {
      const npc = this.add.image(v.x, GROUND_Y - 33, v.texture)
        .setFlipX(v.flipX)
        .setDepth(14);
      this.tweens.add({
        targets: npc,
        y: npc.y - 3,
        duration: 800 + idx * 180,
        yoyo: true,
        loop: -1,
        ease: "Sine.easeInOut"
      });
    });

    // Pórtico de vigilancia (donde trabajan los ancianos guardias)
    this.add.image(watchpostX, GROUND_Y - 94, "watchpost_arch").setDepth(12);
    elderGuardsX.forEach((ex, idx) => {
      this.add.image(ex, GROUND_Y - 34, "spartan_elder_guard")
        .setFlipX(idx === 1)
        .setDepth(15);
    });
  }

  buildPlazaArea() {
    const { bannersX, generalX, formationXs } = VILLAGE_LAYOUT.plaza;

    bannersX.forEach((bx) => {
      this.add.image(bx, GROUND_Y - 65, "spartan_banner").setDepth(12);
    });

    // El General de Esparta con su capa carmesí intacta
    this.generalSprite = this.add.image(generalX, GROUND_Y - 41, "spartan_general")
      .setFlipX(false)
      .setDepth(19);

    // Tropa espartana en formación
    this.allyTroops = formationXs.map((ax) =>
      this.add.image(ax, GROUND_Y - 37, "spartan_ally").setFlipX(true).setDepth(18)
    );

    // Indicador contextual oculto hasta Hito 1.3
    this.interactPrompt = this.add.text(
      generalX - 40,
      GROUND_Y - 120,
      "[E] o camina frente al General",
      {
        fontFamily: "Georgia, serif",
        fontSize: "13px",
        color: "#fff8e7",
        backgroundColor: "#7a1212",
        padding: { left: 10, right: 10, top: 5, bottom: 5 }
      }
    ).setOrigin(0.5).setDepth(120).setVisible(false);
  }

  buildAtmosphereParticles() {
    // Motas doradas de sol y hojas de olivo suaves
    this.add.particles(0, 0, "sun_mote", {
      x: { min: 0, max: this.worldWidth },
      y: { min: 140, max: GROUND_Y - 20 },
      lifespan: 4500,
      speedX: { min: -12, max: 18 },
      speedY: { min: -14, max: 8 },
      scale: { start: 0.4, end: 0.9 },
      alpha: { start: 0, end: 0.55 },
      quantity: 1,
      frequency: 260
    }).setDepth(25);

    this.add.particles(0, 0, "olive_leaf", {
      x: { min: 0, max: this.worldWidth },
      y: 80,
      lifespan: 6200,
      speedX: { min: 18, max: 45 },
      speedY: { min: 22, max: 52 },
      rotate: { min: 0, max: 360 },
      scale: { min: 0.7, max: 1.1 },
      alpha: { start: 0.8, end: 0 },
      quantity: 1,
      frequency: 650
    }).setDepth(25);
  }

  // ==========================================================================
  // CONTROLES Y UI MINIMALISTA DE CAMPAÑA
  // ==========================================================================

  setupInputs() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("A,D,W,S,E,J,P");

    this.input.keyboard.on("keydown-P", () => {
      if (this.scene.isPaused() || this.milestoneState.sceneCompleted) return;
      this.scene.pause();
      this.scene.launch("PauseScene", { returnScene: "Escena1Scene" });
    });

    this.input.keyboard.on("keydown-E", () => this.tryTriggerGeneralConfrontation());
    this.input.keyboard.on("keydown-J", () => {
      if (this.milestoneState.waitingGeneralInteract) {
        this.tryTriggerGeneralConfrontation();
      }
    });
  }

  createSceneHUD() {
    this.controlsHint = this.add.text(
      WIDTH / 2,
      HEIGHT - 22,
      "A / D o Flechas: Caminar   •   J: Postura marcial (armado)   •   P: Pausa",
      {
        fontFamily: "Arial, sans-serif",
        fontSize: "13px",
        color: "#f6eedb",
        backgroundColor: "#1a1412cc",
        padding: { left: 14, right: 14, top: 6, bottom: 6 }
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(135);
  }

  showChapterBanner() {
    const banner = this.add.container(WIDTH / 2, 118).setScrollFactor(0).setDepth(150).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1412, 0.85).fillRoundedRect(-270, -34, 540, 68, 6);
    bg.lineStyle(2, SPARTA_COLORS.bronzeLight, 0.9).strokeRoundedRect(-270, -34, 540, 68, 6);

    const title = this.add.text(0, -11, "PARTE 1: EL PRECIO DE LA GLORIA", {
      fontFamily: "Georgia, serif",
      fontSize: "13px",
      fontStyle: "bold",
      color: "#e8b962",
      letterSpacing: 3
    }).setOrigin(0.5);

    const subtitle = this.add.text(0, 12, "ESCENA 1 — El Escudo del Pueblo y el Llamado de la Sangre", {
      fontFamily: "Georgia, serif",
      fontSize: "16px",
      color: "#fff6e5"
    }).setOrigin(0.5);

    banner.add([bg, title, subtitle]);

    this.tweens.add({
      targets: banner,
      alpha: 1,
      duration: 600,
      hold: 2600,
      yoyo: true,
      onComplete: () => banner.destroy()
    });
  }

  // ==========================================================================
  // BUCLE PRINCIPAL Y DISPARADORES NARRATIVOS
  // ==========================================================================

  update(time, delta) {
    this.narrative.update();

    if (this.milestoneState.sceneCompleted) return;

    this.player.update(time, delta, this.cursors, this.keys);
    this.checkNarrativeTriggers();
  }

  checkNarrativeTriggers() {
    const px = this.player.x;
    const { equipFamilyX, thoughtPathX, plazaSequenceX, generalBlockX } = VILLAGE_LAYOUT.triggers;

    // Hito 1.1 — Trigger 1: Entrega de Escudo y Lanza junto a su familia
    if (!this.milestoneState.trigger1Done && px >= equipFamilyX) {
      this.milestoneState.trigger1Done = true;
      this.runFamilyHandoffTrigger();
    }

    // Hito 1.1 — Trigger 2: Pensamiento del Soldado en el sendero del pueblo
    if (!this.milestoneState.trigger2Done && px >= thoughtPathX) {
      this.milestoneState.trigger2Done = true;
      this.runPathThoughtTrigger();
    }

    // Hito 1.2 — Llegada a la Plaza de Armas: El Mensajero y el General
    if (!this.milestoneState.hito1_2Started && px >= plazaSequenceX) {
      this.milestoneState.hito1_2Started = true;
      this.runHito1_2MessengerSequence();
    }

    // Hito 1.3 — Bloquear el paso del General caminando frente a él
    if (
      this.milestoneState.waitingGeneralInteract &&
      !this.milestoneState.hito1_3Started &&
      px >= generalBlockX
    ) {
      this.tryTriggerGeneralConfrontation();
    }
  }

  // ==========================================================================
  // HITO 1.1: TRIGGERS EN MOVIMIENTO (NO PAUSAN EL JUEGO)
  // ==========================================================================

  runFamilyHandoffTrigger() {
    // 1. Animar la entrega física del Escudo Hoplón y toma de la Lanza Dory
    const handoffShield = this.add.image(this.wifeSprite.x - 16, GROUND_Y - 38, "hoplon_shield")
      .setDepth(21);

    this.wifeSprite.setTexture("spartan_wife");
    if (this.homeSpearProp) {
      this.homeSpearProp.destroy();
      this.homeSpearProp = null;
    }

    this.tweens.add({
      targets: handoffShield,
      x: this.player.x + 8,
      y: this.player.y - 4,
      duration: 360,
      ease: "Quad.easeOut",
      onComplete: () => {
        handoffShield.destroy();
        this.player.equipGear();
        this.audio.playEquipGear();
      }
    });

    // 2. Viñeta de la Esposa + Bocadillo dinámico del Soldado sin pausar el movimiento
    this.narrative.playSequence([
      {
        type: "vignette",
        corner: "top-left",
        speaker: "Esposa",
        portraitKey: "portrait_wife",
        text: "Tu turno en la muralla termina al anochecer. Los niños quieren escuchar otra vez cómo entrenas con la falange.",
        autoDismissDelay: 3800,
        delayAfter: 150
      },
      {
        type: "bubble",
        target: this.player,
        offsetY: 78,
        text: "Hoy no habrá historias de entrenamiento. Algún día tendrán historias de verdad que contar sobre su padre.",
        duration: 3800
      }
    ]);
  }

  runPathThoughtTrigger() {
    this.narrative.showVignette({
      corner: "top-right",
      variant: "thought",
      speaker: "Soldado",
      portraitKey: "portrait_soldier_thought",
      text: "Un guardia de frontera... Mientras otros forjan leyendas con sus lanzas, mi única misión es mirar un horizonte vacío.",
      autoDismissDelay: 4600
    });
  }

  // ==========================================================================
  // HITO 1.2: EL MENSAJERO Y EL GENERAL (SECUENCIA ANIMADA 2D)
  // ==========================================================================

  async runHito1_2MessengerSequence() {
    this.player.setControlEnabled(false);
    this.player.faceDirection(1);
    this.controlsHint.setVisible(false);

    // Enfocar la cámara sobre la plaza de armas
    const cam = this.cameras.main;
    cam.stopFollow();
    this.tweens.add({
      targets: cam,
      scrollX: Math.min(this.worldWidth - WIDTH, 2320),
      duration: 950,
      ease: "Sine.easeInOut"
    });

    // Transición sonora de paz hacia alarma de guerra
    this.audio.fadeAmbient(900);

    // Explorador herido galopando desde el extremo derecho
    const { messengerStopX } = VILLAGE_LAYOUT.plaza;
    const scoutRider = this.add.image(this.worldWidth + 60, GROUND_Y - 40, "spartan_scout_horse")
      .setDepth(22);

    const dustTrail = this.add.particles(0, 0, "dust_puff", {
      follow: scoutRider,
      followOffset: { x: 24, y: 32 },
      lifespan: 450,
      speedX: { min: 30, max: 90 },
      speedY: { min: -25, max: -5 },
      scale: { start: 0.7, end: 0.1 },
      alpha: { start: 0.65, end: 0 },
      quantity: 2,
      frequency: 60
    }).setDepth(21);

    this.audio.playHorseGallop(7);

    await new Promise((resolve) => {
      this.tweens.add({
        targets: scoutRider,
        x: messengerStopX + 20,
        duration: 1350,
        ease: "Cubic.easeOut",
        onComplete: resolve
      });
    });

    dustTrail.stop();
    this.time.delayedCall(500, () => dustTrail.destroy());

    // El explorador cae del caballo ante el General
    scoutRider.destroy();
    this.fallenScout = this.add.image(messengerStopX, GROUND_Y - 19, "spartan_scout_fallen")
      .setDepth(19);
    this.audio.playMessengerFall();
    this.cameras.main.shake(160, 0.005);

    this.generalSprite.setFlipX(true);

    // Breve reporte urgente del explorador herido
    await this.narrative.showBubble(
      this.fallenScout,
      "¡Mi General! ¡Ejércitos de Argos marchan hacia nuestras tierras!",
      { duration: 2400, offsetY: 50 }
    );

    // El General gira hacia su tropa y ordena movilización inmediata
    this.generalSprite.setFlipX(false);
    this.audio.playWarHorn();

    // Soldados aliados alzan sus lanzas en señal de guerra
    this.allyTroops.forEach((ally, idx) => {
      this.tweens.add({
        targets: ally,
        y: ally.y - 7,
        duration: 140,
        delay: idx * 40,
        yoyo: true
      });
    });

    await this.narrative.showVignette({
      corner: "top-left",
      variant: "dramatic",
      speaker: "General",
      portraitKey: "portrait_general_fierce",
      text: "¡Argos cree que Esparta duerme! ¡Marcharán por nuestras tierras y beberán su propia sangre antes del ocaso! ¡A las armas!",
      autoDismissDelay: 4600
    });

    // Preparar Hito 1.3: el General avanza unos pasos para iniciar la marcha y el jugador puede bloquearlo
    this.tweens.add({
      targets: this.generalSprite,
      x: VILLAGE_LAYOUT.plaza.generalX + 35,
      duration: 600,
      ease: "Sine.easeOut"
    });

    this.milestoneState.waitingGeneralInteract = true;
    this.player.setControlEnabled(true);
    this.interactPrompt
      .setPosition(VILLAGE_LAYOUT.plaza.generalX + 25, GROUND_Y - 122)
      .setVisible(true);
  }

  // ==========================================================================
  // HITO 1.3: LA ARROGANCIA DEL SOLDADO Y CIERRE DE ESCENA
  // ==========================================================================

  async tryTriggerGeneralConfrontation() {
    if (!this.milestoneState.waitingGeneralInteract || this.milestoneState.hito1_3Started) return;
    if (this.player.x < VILLAGE_LAYOUT.plaza.startX) return;

    this.milestoneState.hito1_3Started = true;
    this.milestoneState.waitingGeneralInteract = false;
    this.interactPrompt.setVisible(false);
    this.player.setControlEnabled(false);

    // El Soldado se adelanta y bloquea el paso del General
    const blockX = this.generalSprite.x - 66;
    await this.player.walkTo(blockX, 175);
    this.player.faceDirection(1);
    this.generalSprite.setFlipX(true);

    // 1. Viñeta del General frunciendo el ceño
    await this.narrative.showVignette({
      corner: "top-right",
      variant: "dramatic",
      speaker: "General",
      portraitKey: "portrait_general_frown",
      text: "Tu puesto está aquí, soldado. Alguien debe sostener el escudo sobre las mujeres y los niños.",
      autoDismissDelay: 4000
    });

    // 2. Viñeta del Soldado golpeándose el pecho/escudo con determinación
    this.player.playChestBeatAnimation();
    this.audio.playChestPound();
    await this.narrative.showVignette({
      corner: "top-left",
      speaker: "Soldado",
      portraitKey: "portrait_soldier",
      text: "¡Mi lanza se desperdicia cuidando piedras, mi General! ¡Tengo fuerza, tengo corazón! ¡Déjeme demostrar que soy digno de marchar a su sombra!",
      autoDismissDelay: 4800
    });

    // 3. Viñeta del General con sonrisa arrogante dándole una palmada en el hombro
    const originalGeneralX = this.generalSprite.x;
    this.tweens.add({
      targets: this.generalSprite,
      x: this.player.x + 48,
      duration: 380,
      ease: "Sine.easeOut",
      yoyo: true,
      hold: 300
    });

    await this.narrative.showVignette({
      corner: "top-right",
      variant: "dramatic",
      speaker: "General",
      portraitKey: "portrait_general_smirk",
      text: "El hambre de gloria es lo que hace a un verdadero espartano. Toma tu lanza. Que los viejos cuiden el fuego hoy.",
      autoDismissDelay: 4600
    });

    this.generalSprite.setPosition(originalGeneralX, GROUND_Y - 41);

    // 4. Transición Final: Última mirada al hogar y marcha hacia la derecha
    this.playClosingMarchSequence();
  }

  playClosingMarchSequence() {
    // El ejército espartano gira hacia la derecha y comienza la marcha
    this.generalSprite.setFlipX(false);
    this.allyTroops.forEach((ally) => ally.setFlipX(false));

    // El Soldado mira por última vez hacia la izquierda (hogar y familia)
    this.player.faceDirection(-1);

    this.tweens.add({
      targets: this.cameras.main,
      scrollX: this.cameras.main.scrollX - 45,
      duration: 900,
      ease: "Sine.easeInOut"
    });

    this.audio.playWarDrums(7);

    // Tras 1.5s mirando hacia su hogar, se vuelve y marcha a la derecha con el ejército
    this.time.delayedCall(1550, () => {
      this.player.faceDirection(1);
      this.player.setCollideWorldBounds(false);
      this.player.body.setAllowGravity(false);

      const marchingUnits = [this.player, this.generalSprite, ...this.allyTroops];
      marchingUnits.forEach((unit) => {
        this.tweens.add({
          targets: unit,
          x: unit.x + 560,
          duration: 2800,
          ease: "Linear",
          onUpdate: () => {
            unit.angle = Math.sin(this.time.now * 0.014) * 1.6;
          }
        });
      });

      // Fundido a negro y transición directa a Escena 2
      this.time.delayedCall(750, () => {
        this.cameras.main.fadeOut(2000, 0, 0, 0);
        this.time.delayedCall(2100, () => {
          this.milestoneState.sceneCompleted = true;
          this.audio.stopAmbient();
          this.scene.start("Escena2Scene", { startAt: "2.1" });
        });
      });
    });
  }
}
