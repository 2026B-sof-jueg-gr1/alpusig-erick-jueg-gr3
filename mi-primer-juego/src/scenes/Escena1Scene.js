import { WIDTH, HEIGHT, GROUND_Y, COLORS } from "../config/constants.js";
import { ComicPanel } from "../ui/ComicPanel.js";
import { AudioManager } from "../managers/AudioManager.js";

/**
 * Escena 1: 'El Eco de la Esperanza y la Maldición Eterna'
 * Inspirada en el cómic God of War: Fallen God.
 * 
 * HITO 1: Cinemática de Apertura (El Fin del Olimpo)
 * - Secuencia inicial 3D / Parallax profundo del sacrificio de Kratos en el Olimpo.
 * - Retirada de la Espada del Olimpo y torrente celestial de La Esperanza.
 * - Transición a plano superior cenital mostrando el rastro de sangre hacia el abismo del mar.
 * - Viñeta de cómic con la voz en off de Kratos.
 * - Fundido a negro, transición sonora (tormenta -> fogata y gotas de cueva) y título 'MESES DESPUÉS...'.
 * - Revelación suave del entorno de la cueva (preparación para el Hito 2).
 */
export class Escena1Scene extends Phaser.Scene {
  constructor() {
    super("Escena1Scene");
  }

  create() {
    this.audio = new AudioManager(this);
    this.phase = "olympus_sacrifice";
    this.isSkipping = false;

    // Contenedores para organizar los planos visuales de las fases
    this.olympusContainer = this.add.container(0, 0);
    this.topDownContainer = this.add.container(0, 0).setVisible(false).setAlpha(0);
    this.caveContainer = this.add.container(0, 0).setVisible(false).setAlpha(0);

    // Indicador discreto para omitir cinemática
    this.createSkipPrompt();

    // Iniciar ambientación sonora de tormenta
    this.audio.playStormAmbient();

    // 1. Construir el escenario del Olimpo
    this.buildOlympusScene();

    // 2. Iniciar la coreografía cinematográfica del Hito 1
    this.startOlympusCinematic();
  }

  createSkipPrompt() {
    this.skipText = this.add.text(WIDTH - 25, 25, "ESPACIO / CLIC para omitir", {
      fontFamily: "Arial, sans-serif",
      fontSize: "13px",
      color: "#94a3b8"
    }).setOrigin(1, 0).setDepth(200).setAlpha(0.7);

    this.input.keyboard.on("keydown-SPACE", () => this.skipCinematic());
    this.input.on("pointerdown", (pointer) => {
      // Si no es un clic en viñetas o botones, permitir omitir si se pulsa dos veces o rápido
      if (pointer.y < 70 && pointer.x > WIDTH - 220) {
        this.skipCinematic();
      }
    });
  }

  // ==========================================================================
  // FASE 1: SACRIFICIO EN EL MONTE OLIMPO (EFECTO PARALLAX PROFUNDO)
  // ==========================================================================

  buildOlympusScene() {
    // 1.1 Cielo de tormenta y ceniza
    this.stormSky = this.add.graphics();
    this.stormSky.fillGradientStyle(0x1a0f1d, 0x221326, 0x09070d, 0x140d1a, 1);
    this.stormSky.fillRect(0, 0, WIDTH, HEIGHT);
    this.olympusContainer.add(this.stormSky);

    // Relámpago ocasional
    this.lightningOverlay = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0xffffff, 0)
      .setDepth(15);
    this.olympusContainer.add(this.lightningOverlay);

    this.lightningTimer = this.time.addEvent({
      delay: 2400,
      loop: true,
      callback: () => {
        if (this.phase === "olympus_sacrifice" && Math.random() < 0.6) {
          this.triggerLightning();
        }
      }
    });

    // 1.2 Capa lejana (Parallax): Montañas del Olimpo resquebrajadas
    const distantMountains = this.add.graphics();
    distantMountains.fillStyle(0x17121e, 0.9);
    distantMountains.fillTriangle(60, 520, 240, 260, 480, 520);
    distantMountains.fillTriangle(380, 520, 620, 210, 880, 520);
    distantMountains.fillTriangle(740, 520, 990, 280, 1200, 520);
    this.olympusContainer.add(distantMountains);

    // 1.3 Columnas jónicas y corintias del templo en ruinas
    this.columns = [];
    const colCoords = [140, 290, 880, 1030];
    colCoords.forEach((x, index) => {
      const col = this.add.image(x, GROUND_Y - 55, "olympus_column")
        .setScale(index % 2 === 0 ? 1.1 : 0.85)
        .setAlpha(0.85);
      this.olympusContainer.add(col);
      this.columns.push(col);
    });

    // 1.4 Suelo del Olimpo: losas de mármol agrietadas
    this.olympusGround = this.add.graphics();
    this.olympusGround.fillStyle(0x232733, 1).fillRect(0, GROUND_Y + 12, WIDTH, 120);
    this.olympusGround.fillStyle(0x384152, 1).fillRect(0, GROUND_Y + 6, WIDTH, 6);
    this.olympusContainer.add(this.olympusGround);

    // 1.5 Emisor de partículas de ceniza
    this.ashEmitter = this.add.particles(0, 0, "ash_flake", {
      x: { min: 0, max: WIDTH },
      y: -20,
      lifespan: 5000,
      speedY: { min: 40, max: 90 },
      speedX: { min: 10, max: 50 },
      scale: { min: 0.4, max: 1.1 },
      alpha: { start: 0.8, end: 0.1 },
      quantity: 2,
      frequency: 180
    });
    this.olympusContainer.add(this.ashEmitter);

    // 1.6 Kratos arrodillado
    this.kratosKneeling = this.add.image(WIDTH * 0.48, GROUND_Y - 26, "kratos_kneeling")
      .setScale(1.25)
      .setDepth(5);
    this.olympusContainer.add(this.kratosKneeling);

    // 1.7 Espada del Olimpo atravesando el pecho
    this.bladeOfOlympus = this.add.image(WIDTH * 0.48 + 4, GROUND_Y - 50, "blade_olympus")
      .setScale(1.15)
      .setRotation(-0.06)
      .setDepth(6);
    this.olympusContainer.add(this.bladeOfOlympus);

    // Resplandor pulsante de la Espada del Olimpo
    this.bladeGlow = this.tweens.add({
      targets: this.bladeOfOlympus,
      alpha: { from: 0.85, to: 1 },
      scaleX: { from: 1.12, to: 1.18 },
      duration: 650,
      yoyo: true,
      loop: -1
    });

    // Luz azul mística que emite la espada
    this.bladeLight = this.add.circle(WIDTH * 0.48 + 4, GROUND_Y - 40, 55, 0x38bdf8, 0.22)
      .setDepth(4);
    this.olympusContainer.add(this.bladeLight);
  }

  triggerLightning() {
    this.audio.playThunder();
    this.lightningOverlay.setAlpha(0.65);
    this.tweens.add({
      targets: this.lightningOverlay,
      alpha: 0,
      duration: 220,
      ease: "Quad.easeOut"
    });
  }

  startOlympusCinematic() {
    // Zoom cinematográfico lento hacia Kratos (Efecto 3D / Parallax profundo)
    this.cameras.main.pan(WIDTH * 0.48, GROUND_Y - 40, 4200, "Quad.easeOut");
    this.cameras.main.zoomTo(1.18, 4200, "Quad.easeOut");

    // Secuencia 1: Retirar la espada y liberar la Esperanza tras 4.2 segundos
    this.time.delayedCall(4200, () => {
      if (this.isSkipping) return;
      this.extractBladeAndReleaseHope();
    });
  }

  // ==========================================================================
  // FASE 2: EXTRACCIÓN DE LA ESPADA Y TORRENTE DE LA ESPERANZA
  // ==========================================================================

  extractBladeAndReleaseHope() {
    this.audio.playBladeExtraction();

    // 1. La espada se eleva y se retira
    this.bladeGlow.stop();
    this.tweens.add({
      targets: this.bladeOfOlympus,
      y: GROUND_Y - 145,
      rotation: 0.35,
      duration: 900,
      ease: "Back.easeOut",
      onComplete: () => {
        // La espada cae al suelo de piedra con estruendo
        this.tweens.add({
          targets: this.bladeOfOlympus,
          x: WIDTH * 0.48 + 65,
          y: GROUND_Y + 8,
          rotation: 1.55,
          duration: 450,
          ease: "Bounce.easeOut"
        });
      }
    });

    // 2. Liberación del Torrente de la Esperanza (Luz azul brillante celestial)
    this.time.delayedCall(600, () => {
      this.audio.playHopeEnergySurge();

      // Destello celestial
      const hopeFlash = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x67e8f9, 0.5)
        .setDepth(20);
      this.tweens.add({
        targets: hopeFlash,
        alpha: 0,
        duration: 800,
        onComplete: () => hopeFlash.destroy()
      });

      // Haz vertical de luz pura ascendente
      const hopeBeam = this.add.graphics().setDepth(18);
      hopeBeam.fillGradientStyle(0xffffff, 0xffffff, 0x38bdf8, 0x0284c7, 0.85);
      hopeBeam.fillRect(WIDTH * 0.48 - 18, 0, 36, GROUND_Y);
      this.tweens.add({
        targets: hopeBeam,
        alpha: 0,
        scaleX: 2.5,
        duration: 2200,
        ease: "Cubic.easeOut",
        onComplete: () => hopeBeam.destroy()
      });

      // Partículas de La Esperanza elevándose en espiral hacia el cielo
      const hopeParticles = this.add.particles(WIDTH * 0.48, GROUND_Y - 30, "hope_particle", {
        speedY: { min: -180, max: -450 },
        speedX: { min: -120, max: 120 },
        scale: { start: 1.4, end: 0.2 },
        alpha: { start: 1, end: 0 },
        lifespan: 2600,
        quantity: 8,
        frequency: 70
      }).setDepth(19);

      // Kratos cae desplomado
      this.time.delayedCall(700, () => {
        this.kratosKneeling.setVisible(false);
        this.kratosFallen = this.add.image(WIDTH * 0.48 + 10, GROUND_Y - 14, "kratos_fallen")
          .setScale(1.2)
          .setDepth(5);
        this.olympusContainer.add(this.kratosFallen);
      });

      // Detener partículas de esperanza y avanzar al plano superior
      this.time.delayedCall(3400, () => {
        hopeParticles.destroy();
        if (!this.isSkipping) {
          this.transitionToTopDownView();
        }
      });
    });
  }

  // ==========================================================================
  // FASE 3: PLANO SUPERIOR (VISTA CENITAL: RASTRO DE SANGRE Y ABISMO)
  // ==========================================================================

  transitionToTopDownView() {
    this.phase = "topdown_cliff";

    // Transición suave entre planos
    this.cameras.main.fade(800, 0, 0, 0);

    this.time.delayedCall(850, () => {
      this.olympusContainer.setVisible(false);
      this.cameras.main.resetFX();
      this.cameras.main.setZoom(1);
      this.cameras.main.centerOn(WIDTH / 2, HEIGHT / 2);

      this.buildTopDownCliffScene();
      this.topDownContainer.setVisible(true);

      this.cameras.main.fadeIn(900, 0, 0, 0);

      // Superponer la viñeta de cómic con la voz en off
      this.time.delayedCall(1200, () => {
        if (!this.isSkipping) {
          this.showComicMonologue();
        }
      });
    });
  }

  buildTopDownCliffScene() {
    // 3.1 Fondo rocoso y océano embravecido abajo
    const bg = this.add.graphics();
    // Suelo rocoso superior del acantilado
    bg.fillStyle(0x1e2430, 1).fillRect(0, 0, WIDTH, HEIGHT * 0.62);
    // Grietas y losas de piedra
    bg.lineStyle(2, 0x334155, 0.7);
    bg.strokeRect(80, 50, 220, 140);
    bg.strokeRect(320, 40, 260, 160);
    bg.strokeRect(600, 60, 240, 130);

    // Borde irregular del acantilado
    bg.fillStyle(0x0f172a, 1);
    bg.fillTriangle(0, HEIGHT * 0.62, WIDTH, HEIGHT * 0.62, WIDTH, HEIGHT);
    bg.fillRect(0, HEIGHT * 0.62, WIDTH, HEIGHT * 0.38);

    // Mar tempestuoso abajo con olas y remolinos
    const sea = this.add.graphics();
    sea.fillStyle(0x091426, 1).fillRect(0, HEIGHT * 0.64, WIDTH, HEIGHT * 0.36);
    // Espuma blanca de las olas chocando
    sea.fillStyle(0x93c5fd, 0.35);
    for (let i = 0; i < 20; i++) {
      sea.fillEllipse((i * 68) % WIDTH, HEIGHT * 0.66 + (i * 14) % 110, 80, 14);
    }
    this.topDownContainer.add([bg, sea]);

    // 3.2 La Espada del Olimpo ensangrentada y abandonada
    const sword = this.add.image(WIDTH * 0.22, HEIGHT * 0.32, "blade_olympus")
      .setScale(0.85)
      .setRotation(-1.1);
    const swordBlood = this.add.circle(WIDTH * 0.22, HEIGHT * 0.32, 28, 0x7f1d1d, 0.85);
    this.topDownContainer.add([swordBlood, sword]);

    // 3.3 Rastro de sangre continuo arrastrado hacia el borde del precipicio
    const bloodTrail = this.add.graphics();
    bloodTrail.lineStyle(14, 0x881337, 0.9);
    bloodTrail.beginPath();
    bloodTrail.moveTo(WIDTH * 0.22, HEIGHT * 0.32);
    bloodTrail.lineTo(WIDTH * 0.38, HEIGHT * 0.36);
    bloodTrail.lineTo(WIDTH * 0.52, HEIGHT * 0.44);
    bloodTrail.lineTo(WIDTH * 0.68, HEIGHT * 0.52);
    bloodTrail.lineTo(WIDTH * 0.78, HEIGHT * 0.63); // Llega al borde exacto del acantilado
    bloodTrail.strokePath();

    // Salpicaduras y manchas irregulares a lo largo del rastro
    bloodTrail.fillStyle(0x991b1b, 0.95);
    bloodTrail.fillCircle(WIDTH * 0.38, HEIGHT * 0.36, 12);
    bloodTrail.fillCircle(WIDTH * 0.52, HEIGHT * 0.44, 15);
    bloodTrail.fillCircle(WIDTH * 0.68, HEIGHT * 0.52, 17);
    bloodTrail.fillCircle(WIDTH * 0.78, HEIGHT * 0.63, 22); // Charco final en el borde
    this.topDownContainer.add(bloodTrail);

    // Texto descriptivo sutil indicando el abismo
    const oceanLabel = this.add.text(WIDTH * 0.78, HEIGHT * 0.72, "MAR EGEO", {
      fontFamily: "Georgia, serif",
      fontSize: "13px",
      letterSpacing: 4,
      color: "#64748b"
    }).setOrigin(0.5);
    this.topDownContainer.add(oceanLabel);

    // Movimiento suave de la cámara panorámica
    this.tweens.add({
      targets: this.cameras.main,
      scrollX: 40,
      scrollY: 25,
      duration: 6500,
      ease: "Sine.easeInOut"
    });
  }

  showComicMonologue() {
    const quote = "Mi venganza terminó... entregué al mundo lo único que me quedaba. Pero la muerte... la muerte se negó a reclamarme.";
    
    this.comicPanel = new ComicPanel(this, {
      x: WIDTH / 2,
      y: HEIGHT - 95,
      width: Math.min(WIDTH - 140, 880),
      height: 105,
      speaker: "KRATOS (VOZ EN OFF)",
      text: quote
    });

    this.comicPanel.show(800).then(() => {
      // Tiempo de lectura antes de la transición temporal
      this.time.delayedCall(5200, () => {
        if (this.isSkipping) return;
        this.comicPanel.dismiss(700).then(() => {
          this.transitionToCaveTimeline();
        });
      });
    });
  }

  // ==========================================================================
  // FASE 4: TRANSICIÓN TEMPORAL ("MESES DESPUÉS...")
  // ==========================================================================

  transitionToCaveTimeline() {
    this.phase = "transition_temporal";

    // 4.1 Fundido a negro absoluto
    this.cameras.main.fade(1400, 0, 0, 0);

    // Transición sonora: apagar tormenta y comenzar cueva
    this.audio.fadeAmbient(1300);

    this.time.delayedCall(1450, () => {
      this.topDownContainer.setVisible(false);
      this.cameras.main.resetFX();
      this.cameras.main.setScroll(0, 0);

      // Iniciar el paisaje sonoro de la cueva (gotas y fogata)
      this.audio.playCaveAmbient();

      // 4.2 Cartel solemne: "MESES DESPUÉS..."
      const transitionText = this.add.text(WIDTH / 2, HEIGHT / 2, "MESES DESPUÉS...", {
        fontFamily: "Georgia, serif",
        fontSize: "30px",
        fontStyle: "bold",
        color: "#e2e8f0",
        letterSpacing: 8
      }).setOrigin(0.5).setAlpha(0).setDepth(150);

      this.tweens.add({
        targets: transitionText,
        alpha: 1,
        duration: 1000,
        hold: 2200,
        yoyo: true,
        ease: "Quad.easeInOut",
        onComplete: () => {
          transitionText.destroy();
          if (!this.isSkipping) {
            this.revealCaveEnvironment();
          }
        }
      });
    });
  }

  // ==========================================================================
  // FASE 5: REVELACIÓN DEL ENTORNO DE LA CUEVA (META DEL HITO 1 / PREPARADO PARA HITO 2)
  // ==========================================================================

  revealCaveEnvironment() {
    this.phase = "cave_revealed";

    this.buildCaveEnvironment();
    this.caveContainer.setVisible(true);

    // Entrada suave desde la oscuridad
    this.cameras.main.fadeIn(1600, 0, 0, 0);

    // Texto informativo de finalización del Hito 1
    this.time.delayedCall(1800, () => {
      const hitoCompletePrompt = this.add.text(
        WIDTH / 2,
        HEIGHT - 45,
        "✓ HITO 1 COMPLETADO: Cinemática de Apertura finalizada exitosamente.",
        {
          fontFamily: "Arial, sans-serif",
          fontSize: "14px",
          color: "#86efac",
          backgroundColor: "#064e3b",
          padding: { left: 16, right: 16, top: 8, bottom: 8 }
        }
      ).setOrigin(0.5).setAlpha(0);

      this.tweens.add({
        targets: hitoCompletePrompt,
        alpha: 1,
        duration: 600
      });
    });
  }

  buildCaveEnvironment() {
    // 5.1 Paredes de roca y profundidad de cueva oscura
    const caveBg = this.add.graphics();
    caveBg.fillStyle(0x0c0f14, 1).fillRect(0, 0, WIDTH, HEIGHT);

    // Techo con estalagmitas oscuras
    caveBg.fillStyle(0x161b22, 1);
    for (let i = 0; i < 18; i++) {
      const sx = i * 65;
      const h = 40 + (i % 4) * 25;
      caveBg.fillTriangle(sx, 0, sx + 32, h, sx + 65, 0);
    }

    // Suelo rocoso irregular
    caveBg.fillStyle(0x1b2028, 1).fillRect(0, GROUND_Y + 12, WIDTH, 120);
    this.caveContainer.add(caveBg);

    // Luz lejana de la salida de la cueva al acantilado (a la derecha)
    const caveExitLight = this.add.rectangle(WIDTH - 80, GROUND_Y - 90, 160, 240, 0x38bdf8, 0.08)
      .setOrigin(0.5);
    this.caveContainer.add(caveExitLight);

    // 5.2 Kratos sentado contra la roca con manto desgastado
    this.kratosSitting = this.add.image(WIDTH * 0.28, GROUND_Y - 26, "kratos_cave_sitting")
      .setScale(1.25)
      .setDepth(5);
    this.caveContainer.add(this.kratosSitting);

    // 5.3 Fogata casi extinta en el centro iluminando a Kratos
    this.campfire = this.add.image(WIDTH * 0.44, GROUND_Y - 6, "campfire")
      .setScale(1.2)
      .setDepth(5);
    this.caveContainer.add(this.campfire);

    // Luz cálida titilante de la fogata
    this.fireLight = this.add.circle(WIDTH * 0.44, GROUND_Y - 14, 110, 0xf97316, 0.22)
      .setDepth(4);
    this.caveContainer.add(this.fireLight);

    this.tweens.add({
      targets: this.fireLight,
      scaleX: { from: 1, to: 1.15 },
      scaleY: { from: 1, to: 1.1 },
      alpha: { from: 0.18, to: 0.26 },
      duration: 320,
      yoyo: true,
      loop: -1
    });

    // 5.4 Las Espadas del Caos sobre una piedra a la derecha
    const rockPedestal = this.add.graphics();
    rockPedestal.fillStyle(0x2d3748, 1);
    rockPedestal.fillRoundedRect(WIDTH * 0.62 - 40, GROUND_Y - 16, 80, 32, 6);
    this.caveContainer.add(rockPedestal);

    this.bladesOfChaos = this.add.image(WIDTH * 0.62, GROUND_Y - 24, "blades_of_chaos")
      .setScale(1.15)
      .setDepth(6);
    this.caveContainer.add(this.bladesOfChaos);

    // Resplandor maldito rojizo sutil de las espadas
    const curseLight = this.add.circle(WIDTH * 0.62, GROUND_Y - 24, 45, 0xef4444, 0.2)
      .setDepth(4);
    this.caveContainer.add(curseLight);

    this.tweens.add({
      targets: curseLight,
      alpha: { from: 0.12, to: 0.32 },
      scale: { from: 0.9, to: 1.15 },
      duration: 1100,
      yoyo: true,
      loop: -1
    });
  }

  // ==========================================================================
  // SALTO DIRECTO DE CINEMÁTICA (SKIP)
  // ==========================================================================

  skipCinematic() {
    if (this.isSkipping || this.phase === "cave_revealed") return;
    this.isSkipping = true;

    if (this.comicPanel) {
      this.comicPanel.destroy();
    }

    this.cameras.main.fade(400, 0, 0, 0);
    this.time.delayedCall(450, () => {
      this.olympusContainer.setVisible(false);
      this.topDownContainer.setVisible(false);
      this.cameras.main.resetFX();
      this.cameras.main.setZoom(1);
      this.cameras.main.setScroll(0, 0);

      this.audio.stopAmbient();
      this.audio.playCaveAmbient();

      this.revealCaveEnvironment();
    });
  }
}

