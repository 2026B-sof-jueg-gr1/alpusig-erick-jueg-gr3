import { WIDTH, HEIGHT } from "../config/constants.js";
import { CINEMATIC_PLATES, FULL_FRAME } from "../config/cinematicConfig.js";
import { NARRATIVE_TIMING } from "../config/narrativeTiming.js";
import { CinematicPlate } from "../ui/CinematicPlate.js";

const PLATE_ASPECT = 1920 / 1072;

/**
 * Orquesta las secuencias cinematográficas de una escena.
 *
 * Responsabilidades:
 *  - Resolver el plate + encuadre (`shot`) desde `cinematicConfig`.
 *  - Gestionar las barras de letterbox de las cinemáticas a pantalla completa.
 *  - Insertar viñetas ilustradas no bloqueantes durante la jugabilidad.
 *  - Componer tiras de viñetas (página de cómic) sobre el mundo atenuado.
 */
export class CinematicDirector {
  constructor(scene, audio = null) {
    this.scene = scene;
    this.audio = audio;
    this.plates = new Set();
    this.insets = new Set();
    this.atmospheres = new Set();
    this.letterboxBars = null;
    this.dimLayer = null;
    this.activeWait = null;
    this.skipHint = null;

    scene.events.once("shutdown", () => this.clear());
    scene.events.once("destroy", () => this.clear());
  }

  resolve(plateKey, shotName) {
    const plate = CINEMATIC_PLATES[plateKey];
    if (!plate) return null;

    const shot = plate.shots?.[shotName] || plate.shots?.default || {};
    return {
      texture: plate.texture,
      label: plate.label,
      title: plate.title,
      caption: plate.caption,
      animated: plate.animated ?? false,
      animation: plate.animation ?? null,
      focus: shot.focus || FULL_FRAME,
      zoomFrom: shot.zoomFrom ?? 1.02,
      zoomTo: shot.zoomTo ?? 1.08,
      panToX: shot.panToX ?? 0,
      panToY: shot.panToY ?? 0
    };
  }

  // ==========================================================================
  // LETTERBOX
  // ==========================================================================

  letterbox(show, duration = 520, contentHeight = null) {
    if (show && !this.letterboxBars) {
      const visibleHeight = contentHeight ?? Math.round(WIDTH / PLATE_ASPECT);
      const barHeight = Math.max(6, Math.round((HEIGHT - visibleHeight) / 2));
      const graphics = this.scene.add.graphics().setScrollFactor(0).setDepth(158).setAlpha(0);
      graphics.fillStyle(0x000000, 1);
      graphics.fillRect(0, 0, WIDTH, barHeight);
      graphics.fillRect(0, HEIGHT - barHeight, WIDTH, barHeight);
      this.letterboxBars = graphics;

      this.scene.tweens.add({ targets: graphics, alpha: 1, duration, ease: "Quad.easeOut" });
      return;
    }

    if (!show && this.letterboxBars) {
      const bars = this.letterboxBars;
      this.letterboxBars = null;
      this.scene.tweens.add({
        targets: bars,
        alpha: 0,
        duration,
        ease: "Quad.easeIn",
        onComplete: () => bars.destroy()
      });
    }
  }

  // ==========================================================================
  // CINEMÁTICA A PANTALLA COMPLETA
  // ==========================================================================

  async playFullscreen(plateKey, shotName, options = {}) {
    const base = this.resolve(plateKey, shotName);
    if (!base) return null;

    const width = options.width ?? WIDTH - 24;
    const height = options.height ?? Math.round(width / PLATE_ASPECT);
    const useLetterbox = options.letterbox !== false;

    if (useLetterbox) this.letterbox(true, options.letterboxDuration ?? 480, height);

    const plate = this.createPlate(base, {
      ...options,
      x: WIDTH / 2,
      y: HEIGHT / 2,
      width,
      height,
      depth: 160,
      stamp: options.stamp ?? "full",
      slideFrom: 0
    });

    const atmosphere = this.createAtmosphere(options.atmosphere);

    plate.show();
    this.audio?.playCinematicRiser?.();

    const hold = options.hold ?? NARRATIVE_TIMING.fullscreen;
    await this.wait(hold, { skippable: true });

    await plate.hide({ duration: 380 });
    this.plates.delete(plate);
    this.destroyAtmosphere(atmosphere);
    if (useLetterbox) this.letterbox(false, 420);
    return null;
  }

  // ==========================================================================
  // PLATE A PANTALLA COMPLETA SIN CIERRE AUTOMÁTICO
  // ==========================================================================

  /**
   * Muestra un plate a pantalla completa y lo deja en escena para que la propia
   * escena superponga capas (viñetas, oscurecido, títulos) antes de cerrarlo.
   */
  showFullscreenPlate(plateKey, shotName, options = {}) {
    const base = this.resolve(plateKey, shotName);
    if (!base) return null;

    const width = options.width ?? WIDTH - 24;
    const height = options.height ?? Math.round(width / PLATE_ASPECT);

    if (options.letterbox !== false) this.letterbox(true, options.letterboxDuration ?? 480, height);

    const plate = this.createPlate(base, {
      ...options,
      x: WIDTH / 2,
      y: HEIGHT / 2,
      width,
      height,
      depth: options.depth ?? 160,
      stamp: options.stamp ?? "full",
      slideFrom: 0
    });

    const atmosphere = this.createAtmosphere(options.atmosphere);
    if (atmosphere) plate.atmosphere = atmosphere;

    plate.show({ duration: options.fadeIn ?? 400 });
    this.audio?.playCinematicRiser?.();
    return plate;
  }

  async closeFullscreenPlate(plate, { duration = 380, letterbox = true } = {}) {
    if (plate && !plate.isDestroyed) {
      this.destroyAtmosphere(plate.atmosphere);
      plate.atmosphere = null;
      await plate.hide({ duration });
      this.plates.delete(plate);
    }

    if (letterbox) this.letterbox(false, 420);
  }

  // ==========================================================================
  // SECUENCIA DE PLANOS (CORTES DENTRO DE UNA MISMA ILUSTRACIÓN)
  // ==========================================================================

  /**
   * Encadena varios encuadres del mismo plate a pantalla completa, como cortes
   * de cámara. Cada paso admite `effect: "impact"` para sacudir y destellar.
   */
  async playShotSequence(plateKey, shots = [], options = {}) {
    if (!shots.length) return;

    const width = options.width ?? WIDTH - 24;
    const height = options.height ?? Math.round(width / PLATE_ASPECT);
    const useLetterbox = options.letterbox !== false;

    if (useLetterbox) this.letterbox(true, options.letterboxDuration ?? 420, height);
    const atmosphere = this.createAtmosphere(options.atmosphere);

    for (const [index, shotConfig] of shots.entries()) {
      const base = this.resolve(plateKey, shotConfig.shot);
      if (!base) continue;

      // El sello de capítulo solo abre la secuencia; los cortes siguientes van limpios
      const stamp = shotConfig.stamp ?? (index === 0 ? options.stamp ?? "full" : false);

      const plate = this.createPlate(base, {
        ...options,
        ...shotConfig,
        x: WIDTH / 2,
        y: HEIGHT / 2,
        width,
        height,
        depth: 160,
        stamp,
        slideFrom: 0,
        duration: shotConfig.hold ?? NARRATIVE_TIMING.shot
      });

      plate.show({ duration: shotConfig.fadeIn ?? 240 });

      if (shotConfig.effect === "impact") {
        this.impactFlash();
      }

      await this.wait(shotConfig.hold ?? NARRATIVE_TIMING.shot, { skippable: true, hint: false });
      await plate.hide({ duration: shotConfig.fadeOut ?? 260 });
      this.plates.delete(plate);
    }

    this.destroyAtmosphere(atmosphere);
    if (useLetterbox) this.letterbox(false, 420);
  }

  /** Corte breve a pantalla completa sin marco ni letterbox (golpe de ambush). */
  async playFlash(plateKey, shotName, options = {}) {
    const base = this.resolve(plateKey, shotName);
    if (!base) return;

    const plate = this.createPlate(base, {
      ...options,
      x: WIDTH / 2,
      y: HEIGHT / 2,
      width: WIDTH,
      height: HEIGHT,
      depth: 162,
      stamp: false,
      frame: false,
      caption: options.caption ?? "",
      slideFrom: 0
    });

    const atmosphere = this.createAtmosphere(options.atmosphere);
    plate.show({ duration: options.fadeIn ?? 120 });

    await this.wait(options.hold ?? NARRATIVE_TIMING.flash);

    await plate.hide({ duration: options.fadeOut ?? 200 });
    this.plates.delete(plate);
    this.destroyAtmosphere(atmosphere);
  }

  impactFlash() {
    this.scene.cameras.main.shake(280, 0.014);

    const flash = this.scene.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0xff2b2b, 0.55)
      .setScrollFactor(0)
      .setDepth(178);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 420,
      ease: "Quad.easeOut",
      onComplete: () => flash.destroy()
    });
  }

  // ==========================================================================
  // ATMÓSFERA SOBRE EL PLATE (lluvia, ceniza, flechas)
  // ==========================================================================

  destroyAtmosphere(emitter) {
    if (!emitter) return;
    this.atmospheres.delete(emitter);
    if (emitter.active) emitter.destroy();
  }

  createAtmosphere(type) {    if (!type) return null;

    const presets = {
      rain: {
        texture: "rain_drop",
        config: {
          x: { min: -60, max: WIDTH + 60 },
          y: -40,
          lifespan: 760,
          speedX: { min: -175, max: -125 },
          speedY: { min: 700, max: 860 },
          quantity: 3,
          frequency: 22,
          alpha: { start: 0.55, end: 0.15 }
        }
      },
      ash: {
        texture: "ash_mote",
        config: {
          x: { min: 0, max: WIDTH },
          y: { min: -20, max: HEIGHT * 0.5 },
          lifespan: 4200,
          speedX: { min: -55, max: -15 },
          speedY: { min: 20, max: 55 },
          scale: { start: 0.6, end: 1.1 },
          alpha: { start: 0.55, end: 0 },
          quantity: 1,
          frequency: 140
        }
      },
      embers: {
        texture: "ember_spark",
        config: {
          x: { min: 0, max: WIDTH },
          y: { min: HEIGHT * 0.55, max: HEIGHT + 20 },
          lifespan: 3200,
          speedY: { min: -95, max: -35 },
          speedX: { min: -30, max: 22 },
          scale: { start: 1.1, end: 0.2 },
          alpha: { start: 0.9, end: 0 },
          quantity: 1,
          frequency: 90
        }
      }
    };

    const preset = presets[type];
    if (!preset || !this.scene.textures.exists(preset.texture)) return null;

    const emitter = this.scene.add.particles(0, 0, preset.texture, preset.config)
      .setScrollFactor(0)
      .setDepth(168);

    this.atmospheres.add(emitter);
    return emitter;
  }

  // ==========================================================================
  // VIÑETA INSERTADA (NO BLOQUEANTE)
  // ==========================================================================

  showInset(plateKey, shotName, options = {}) {
    const base = this.resolve(plateKey, shotName);
    if (!base) return null;

    const width = options.width ?? 520;
    const height = options.height ?? Math.round(width / 1.78);
    const margin = options.margin ?? 22;

    const x = options.x ?? (
      options.align === "left" ? margin + width / 2 : WIDTH - margin - width / 2
    );
    const y = options.y ?? margin + height / 2;

    const plate = this.createPlate(base, {
      ...options,
      x,
      y,
      width,
      height,
      depth: options.depth ?? 160,
      stamp: options.stamp ?? "block",
      slideFrom: options.slideFrom ?? 70
    });

    plate.show();
    this.audio?.playPanelSlide?.();
    this.insets.add(plate);

    const hold = options.hold ?? NARRATIVE_TIMING.inset;
    this.scene.time.delayedCall(hold, () => {
      if (!plate.isDestroyed) {
        plate.hide({ duration: 320 });
        this.plates.delete(plate);
        this.insets.delete(plate);
      }
    });

    return plate;
  }

  /** Retira de inmediato las viñetas insertadas (por ejemplo, al cambiar de beat narrativo). */
  dismissInsets(duration = 260) {
    this.insets.forEach((plate) => {
      if (!plate.isDestroyed) plate.hide({ duration });
      this.plates.delete(plate);
    });
    this.insets.clear();
  }

  // ==========================================================================
  // TIRA DE VIÑETAS (PÁGINA DE CÓMIC)
  // ==========================================================================

  async playStrip(panels, options = {}) {
    if (!panels?.length) return;

    const panelWidth = options.panelWidth ?? 306;
    const panelHeight = options.panelHeight ?? Math.round(panelWidth * 1.28);
    const gap = options.gap ?? 22;
    const totalWidth = panels.length * panelWidth + (panels.length - 1) * gap;
    const startX = WIDTH / 2 - totalWidth / 2 + panelWidth / 2;
    const centerY = options.centerY ?? HEIGHT / 2 + 10;

    if (options.dim !== false) {
      this.dimLayer = this.scene.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x08060a, 0)
        .setScrollFactor(0)
        .setDepth(157);
      this.scene.tweens.add({
        targets: this.dimLayer,
        fillAlpha: options.dimAlpha ?? 0.62,
        duration: 420,
        ease: "Quad.easeOut"
      });
    }

    const created = [];
    panels.forEach((panel, index) => {
      const base = this.resolve(panel.plate, panel.shot);
      if (!base) return;

      const plate = this.createPlate(base, {
        ...options,
        ...panel,
        x: startX + index * (panelWidth + gap),
        y: centerY,
        width: panelWidth,
        height: panelHeight,
        depth: 160 + index,
        stamp: false,
        label: panel.label ?? base.label,
        title: panel.title ?? base.title,
        caption: "",
        slideFrom: 26,
        slideAxis: "y"
      });

      plate.container.setAlpha(0);
      created.push(plate);

      this.scene.time.delayedCall(120 + index * 170, () => {
        if (!plate.isDestroyed) {
          plate.show({ duration: 300 });
          this.audio?.playPanelSlide?.(index);
        }
      });

      if (panel.caption) {
        const caption = this.scene.add.text(
          plate.options.x,
          centerY + panelHeight / 2 + 14,
          panel.caption,
          {
            fontFamily: "Georgia, serif",
            fontSize: "12px",
            fontStyle: "italic",
            color: "#f6eedb",
            align: "center",
            wordWrap: { width: panelWidth }
          }
        ).setOrigin(0.5, 0).setScrollFactor(0).setDepth(170).setAlpha(0);
        this.scene.tweens.add({ targets: caption, alpha: 1, duration: 400, delay: 220 + index * 170 });
        plate.captionText = caption;
      }
    });

    await this.wait(options.hold ?? NARRATIVE_TIMING.strip, { skippable: true });

    await Promise.all(created.map((plate) => plate.hide({ duration: 320 })));
    created.forEach((plate) => {
      plate.captionText?.destroy();
      this.plates.delete(plate);
    });

    if (this.dimLayer) {
      const layer = this.dimLayer;
      this.dimLayer = null;
      this.scene.tweens.add({
        targets: layer,
        fillAlpha: 0,
        duration: 380,
        onComplete: () => layer.destroy()
      });
    }
  }

  // ==========================================================================
  // UTILIDADES
  // ==========================================================================

  createPlate(base, options) {
    const plate = new CinematicPlate(this.scene, { ...base, ...options });
    this.plates.add(plate);
    return plate;
  }

  /**
   * Espera durante una cinemática. Las esperas lectoras (`skippable`) permiten
   * avanzar con ENTER para no castigar al jugador en partidas repetidas; el
   * aviso aparece solo después de un segundo para no competir con la lectura.
   */
  wait(duration, { skippable = false, hint = true } = {}) {
    return new Promise((resolve) => {
      if (!this.scene?.sys?.isActive()) {
        resolve();
        return;
      }

      let finished = false;
      let timer = null;
      let hintTimer = null;
      const keyboard = this.scene.input?.keyboard;

      const finish = () => {
        if (finished) return;
        finished = true;
        timer?.remove(false);
        hintTimer?.remove(false);
        keyboard?.off("keydown-ENTER", finish);
        if (this.skipHint) {
          this.scene.tweens.killTweensOf(this.skipHint);
          this.skipHint.destroy();
          this.skipHint = null;
        }
        if (this.activeWait === finish) this.activeWait = null;
        resolve();
      };

      timer = this.scene.time.delayedCall(duration, finish);

      if (skippable) {
        this.activeWait = finish;
        keyboard?.on("keydown-ENTER", finish);
        if (hint) {
          hintTimer = this.scene.time.delayedCall(NARRATIVE_TIMING.skipHintDelay, () => {
            if (finished) return;
            this.skipHint = this.scene.add
              .text(WIDTH / 2, HEIGHT - 26, "ENTER para continuar", {
                fontFamily: "Arial, sans-serif",
                fontSize: "12px",
                color: "#f6eedb",
                backgroundColor: "#1a1412bb",
                padding: { left: 10, right: 10, top: 4, bottom: 4 }
              })
              .setOrigin(0.5)
              .setScrollFactor(0)
              .setDepth(179)
              .setAlpha(0);
            this.scene.tweens.add({
              targets: this.skipHint,
              alpha: 0.85,
              duration: 480,
              yoyo: true,
              repeat: -1,
              hold: 420,
              ease: "Sine.easeInOut"
            });
          });
        }
      }
    });
  }

  clear() {
    // Si la escena se cierra a mitad de una cinemática, desbloqueamos cualquier
    // espera pendiente para no dejar cadenas async colgadas.
    this.activeWait?.();
    this.activeWait = null;
    if (this.skipHint) {
      this.skipHint.destroy();
      this.skipHint = null;
    }

    this.plates.forEach((plate) => plate.destroy());
    this.plates.clear();
    this.insets.clear();

    this.atmospheres.forEach((emitter) => {
      if (emitter?.active) emitter.destroy();
    });
    this.atmospheres.clear();

    this.letterboxBars?.destroy();
    this.letterboxBars = null;

    this.dimLayer?.destroy();
    this.dimLayer = null;
  }
}
