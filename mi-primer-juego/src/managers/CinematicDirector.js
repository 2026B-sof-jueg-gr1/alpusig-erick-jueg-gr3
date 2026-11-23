import { WIDTH, HEIGHT } from "../config/constants.js";
import { CINEMATIC_PLATES, FULL_FRAME } from "../config/cinematicConfig.js";
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
    this.letterboxBars = null;
    this.dimLayer = null;

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

    this.letterbox(true, options.letterboxDuration ?? 480, height);

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

    plate.show();
    this.audio?.playCinematicRiser?.();

    const hold = options.hold ?? 4200;
    await this.wait(hold);

    await plate.hide({ duration: 380 });
    this.plates.delete(plate);
    this.letterbox(false, 420);
    return null;
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

    const hold = options.hold ?? 6200;
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

    await this.wait(options.hold ?? 4200);

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

  wait(duration) {
    return new Promise((resolve) => {
      if (!this.scene?.sys?.isActive()) {
        resolve();
        return;
      }
      this.scene.time.delayedCall(duration, resolve);
    });
  }

  clear() {
    this.plates.forEach((plate) => plate.destroy());
    this.plates.clear();
    this.insets.clear();

    this.letterboxBars?.destroy();
    this.letterboxBars = null;

    this.dimLayer?.destroy();
    this.dimLayer = null;
  }
}
