import { SPARTA_COLORS } from "../config/constants.js";

const DEFAULTS = {
  texture: null,
  x: 0,
  y: 0,
  width: 760,
  height: 428,
  focus: { x: 0, y: 0, width: 1, height: 1 },
  zoomFrom: 1.02,
  zoomTo: 1.08,
  panFromX: 0,
  panToX: 0,
  panFromY: 0,
  panToY: 0,
  duration: 7000,
  label: "",
  title: "",
  caption: "",
  stamp: "full", // "full" | "block" | false
  frame: true,
  grain: true,
  blur: 0,
  animated: false,
  animation: null,
  depth: 160,
  slideFrom: 0,
  slideAxis: "x"
};

let plateCounter = 0;

/**
 * Plate cinematográfico: una ilustración de hito proyectada como viñeta animada
 * (Ken Burns, grano de película, viñeteado y marco de tinta) que puede convivir
 * con la jugabilidad o cubrir la pantalla completa.
 *
 * El encuadre se resuelve recortando la textura con `setCrop` sobre un frame
 * propio de cada plate: así la imagen se desplaza y escala por debajo mientras
 * el marco permanece inmóvil, sin depender de máscaras ni deformar el arte.
 */
export class CinematicPlate {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.options = { ...DEFAULTS, ...options };
    this.isDestroyed = false;
    this.activeTweens = [];

    if (!this.options.texture || !scene.textures.exists(this.options.texture)) {
      this.isDestroyed = true;
      return;
    }

    const texture = scene.textures.get(this.options.texture);
    const source = texture.getSourceImage();
    this.texWidth = source.width;
    this.texHeight = source.height;

    // Frame exclusivo para poder recortar sin afectar a otros plates.
    // Las ilustraciones animadas (hojas de sprites) no se recortan: se dibujan
    // completas y su propio movimiento sostiene el plano.
    if (!this.options.animated) {
      this.frameName = `cine_frame_${++plateCounter}`;
      texture.add(this.frameName, 0, 0, 0, this.texWidth, this.texHeight);
    }

    this.container = scene.add.container(this.options.x, this.options.y)
      .setDepth(this.options.depth)
      .setScrollFactor(0)
      .setAlpha(0);

    this.build();
    this.applyFraming(this.options.zoomFrom, this.options.panFromX, this.options.panFromY);
  }

  // ==========================================================================
  // CONSTRUCCIÓN
  // ==========================================================================

  build() {
    const { width, height, frame, grain, stamp } = this.options;

    // Sombra dura estilo página impresa
    this.shadow = this.scene.add.graphics().setScrollFactor(0).setAlpha(0);
    this.shadow.fillStyle(0x000000, 0.45);
    this.shadow.fillRect(
      this.options.x - width / 2 + 8,
      this.options.y - height / 2 + 10,
      width,
      height
    );

    if (this.options.animated && this.options.animation) {
      this.image = this.scene.add.sprite(0, 0, this.options.texture).setOrigin(0.5);
      this.image.play(this.options.animation);
      this.image.setDisplaySize(width, height);
    } else {
      this.image = this.scene.add.image(0, 0, this.options.texture, this.frameName)
        .setOrigin(0.5);
    }
    this.container.add(this.image);
    this.applyBlur();

    this.container.add(this.createVignette(width, height));

    if (grain && this.scene.textures.exists("cine_grain")) {
      this.grain = this.scene.add.tileSprite(0, 0, width, height, "cine_grain")
        .setAlpha(0.07);
      this.container.add(this.grain);
    }

    if (frame) {
      this.container.add(this.createFrame(width, height));
    }

    if (stamp) {
      this.container.add(this.createStamp(width, height, stamp));
    }

    if (this.options.caption && height >= 230) {
      this.container.add(this.createCaption(width, height));
    }
  }

  /**
   * Desenfoque opcional del plate (Phaser 4: los filtros sustituyen a los FX).
   * Se usa para "vista nublada" en los momentos críticos de la campaña.
   */
  applyBlur() {
    const blur = this.options.blur;
    if (!blur || blur <= 0) return;
    if (typeof this.image.enableFilters !== "function") return;

    this.image.enableFilters();
    this.image.filters?.internal.addBlur(1, blur, blur, 1);
  }

  createVignette(width, height) {    const graphics = this.scene.add.graphics();
    const strips = 16;
    const depth = Math.max(26, Math.round(height * 0.14));
    const step = depth / strips;

    for (let i = 0; i < strips; i++) {
      const alpha = 0.55 * (1 - i / strips) ** 1.6;
      const offset = i * step;

      graphics.fillStyle(0x000000, alpha);
      graphics.fillRect(-width / 2, -height / 2 + offset, width, step + 1);
      graphics.fillRect(-width / 2, height / 2 - offset - step, width, step + 1);
    }

    const sideDepth = Math.max(20, Math.round(width * 0.1));
    const sideStep = sideDepth / strips;
    for (let i = 0; i < strips; i++) {
      const alpha = 0.42 * (1 - i / strips) ** 1.7;
      const offset = i * sideStep;
      graphics.fillStyle(0x000000, alpha);
      graphics.fillRect(-width / 2 + offset, -height / 2, sideStep + 1, height);
      graphics.fillRect(width / 2 - offset - sideStep, -height / 2, sideStep + 1, height);
    }

    return graphics;
  }

  createFrame(width, height) {
    const graphics = this.scene.add.graphics();
    const halfW = width / 2;
    const halfH = height / 2;

    graphics.lineStyle(3, SPARTA_COLORS.ink, 0.95);
    graphics.strokeRect(-halfW + 1.5, -halfH + 1.5, width - 3, height - 3);

    graphics.lineStyle(1, SPARTA_COLORS.bronzeLight, 0.55);
    graphics.strokeRect(-halfW + 7, -halfH + 7, width - 14, height - 14);

    // Marcas de esquina tipo página de cómic
    const tick = Math.min(26, width * 0.07);
    graphics.lineStyle(3, SPARTA_COLORS.bronzeLight, 0.9);
    const corners = [
      [-halfW + 6, -halfH + 6, 1, 1],
      [halfW - 6, -halfH + 6, -1, 1],
      [-halfW + 6, halfH - 6, 1, -1],
      [halfW - 6, halfH - 6, -1, -1]
    ];
    corners.forEach(([cx, cy, sx, sy]) => {
      graphics.lineBetween(cx, cy, cx + tick * sx, cy);
      graphics.lineBetween(cx, cy, cx, cy + tick * sy);
    });

    return graphics;
  }

  /**
   * Sello de capítulo en la esquina superior izquierda. Además de identificar el
   * hito, cubre la barra de vitalidad dibujada en las ilustraciones originales.
   */
  createStamp(width, height, variant) {
    const graphics = this.scene.add.graphics();
    const stampWidth = width * 0.3;
    const stampHeight = height * 0.155;
    const x = -width / 2 + 10;
    const y = -height / 2 + 10;

    graphics.fillStyle(SPARTA_COLORS.ink, 0.9);
    graphics.fillRect(x, y, stampWidth, stampHeight);
    graphics.lineStyle(1.5, SPARTA_COLORS.bronze, 0.85);
    graphics.strokeRect(x + 3, y + 3, stampWidth - 6, stampHeight - 6);

    const labelSize = Phaser.Math.Clamp(stampWidth * 0.078, 8, 11);
    const withTitle = variant === "full" && stampWidth >= 250;
    const contentHeight = withTitle ? 50 : 16;
    const contentTop = y + Math.max(8, (stampHeight - contentHeight) / 2);

    const label = this.scene.add.text(x + 11, contentTop, this.options.label, {
      fontFamily: "Georgia, serif",
      fontSize: `${labelSize.toFixed(1)}px`,
      fontStyle: "bold",
      color: "#e8b962",
      letterSpacing: 1.5
    });

    if (!withTitle) {
      return this.scene.add.container(0, 0, [graphics, label]);
    }

    const title = this.scene.add.text(x + 11, contentTop + 16, this.options.title, {
      fontFamily: "Georgia, serif",
      fontSize: "13px",
      color: "#fff6e5",
      wordWrap: { width: stampWidth - 22 },
      lineSpacing: 2
    });

    return this.scene.add.container(0, 0, [graphics, label, title]);
  }

  createCaption(width, height) {
    const bandHeight = Math.min(74, height * 0.17);
    const graphics = this.scene.add.graphics();

    graphics.fillStyle(0x0d0a09, 0.82);
    graphics.fillRect(-width / 2 + 3, height / 2 - bandHeight - 3, width - 6, bandHeight);
    graphics.lineStyle(1, SPARTA_COLORS.bronzeLight, 0.7);
    graphics.lineBetween(
      -width / 2 + 14,
      height / 2 - bandHeight - 3,
      width / 2 - 14,
      height / 2 - bandHeight - 3
    );

    const caption = this.scene.add.text(
      -width / 2 + 20,
      height / 2 - bandHeight + 4,
      this.options.caption,
      {
        fontFamily: "Georgia, serif",
        fontSize: "13px",
        fontStyle: "italic",
        color: "#f6eedb",
        wordWrap: { width: width - 40 },
        lineSpacing: 3
      }
    );

    return this.scene.add.container(0, 0, [graphics, caption]);
  }

  // ==========================================================================
  // ENCUADRE (KEN BURNS)
  // ==========================================================================

  applyFraming(zoom, panX, panY) {
    if (this.options.animated) return;

    const { width, height, focus } = this.options;
    const focusWidth = Math.max(0.02, focus.width) * this.texWidth;
    const focusHeight = Math.max(0.02, focus.height) * this.texHeight;

    const centerX = (focus.x + focus.width / 2) * this.texWidth + panX * this.texWidth;
    const centerY = (focus.y + focus.height / 2) * this.texHeight + panY * this.texHeight;

    const coverScale = Math.max(width / focusWidth, height / focusHeight);
    const scale = coverScale * zoom;

    const cropWidth = Math.min(this.texWidth, width / scale);
    const cropHeight = Math.min(this.texHeight, height / scale);

    const cropX = Phaser.Math.Clamp(
      centerX - cropWidth / 2,
      0,
      Math.max(0, this.texWidth - cropWidth)
    );
    const cropY = Phaser.Math.Clamp(
      centerY - cropHeight / 2,
      0,
      Math.max(0, this.texHeight - cropHeight)
    );

    this.image.setCrop(cropX, cropY, cropWidth, cropHeight);
    this.image.setScale(scale);
    this.image.setPosition(
      -(cropX + cropWidth / 2 - this.texWidth / 2) * scale,
      -(cropY + cropHeight / 2 - this.texHeight / 2) * scale
    );
  }

  // ==========================================================================
  // CICLO DE VIDA
  // ==========================================================================

  setPosition(x, y) {
    const dx = x - this.container.x;
    const dy = y - this.container.y;
    this.container.setPosition(x, y);
    this.shadow?.setPosition(dx, dy);
    this.options.x = x;
    this.options.y = y;
  }

  show({ duration = 340, slide = this.options.slideFrom } = {}) {
    if (this.isDestroyed) return Promise.resolve();

    const targetX = this.options.x;
    const targetY = this.options.y;

    if (slide) {
      const startX = this.options.slideAxis === "y" ? targetX : targetX + slide;
      const startY = this.options.slideAxis === "y" ? targetY + slide : targetY;
      this.setPosition(startX, startY);

      const proxy = { t: 0 };
      this.activeTweens.push(this.scene.tweens.add({
        targets: proxy,
        t: 1,
        duration: 420,
        ease: "Cubic.easeOut",
        onUpdate: () => {
          this.setPosition(
            Phaser.Math.Linear(startX, targetX, proxy.t),
            Phaser.Math.Linear(startY, targetY, proxy.t)
          );
        }
      }));
    }

    this.scene.tweens.add({
      targets: [this.container, this.shadow],
      alpha: 1,
      duration,
      ease: "Quad.easeOut"
    });

    this.startKenBurns();
    return Promise.resolve();
  }

  startKenBurns() {
    const { zoomFrom, zoomTo, panFromX, panToX, panFromY, panToY, duration } = this.options;

    // Las ilustraciones animadas ya traen su propio movimiento: solo se les anima el grano
    if (!this.options.animated) {
      this.kbProxy = { t: 0 };
      this.kbTween = this.scene.tweens.add({
        targets: this.kbProxy,
        t: 1,
        duration: Math.max(1200, duration),
        ease: "Sine.easeInOut",
        onUpdate: () => {
          const t = this.kbProxy.t;
          this.applyFraming(
            Phaser.Math.Linear(zoomFrom, zoomTo, t),
            Phaser.Math.Linear(panFromX, panToX, t),
            Phaser.Math.Linear(panFromY, panToY, t)
          );
        }
      });
    }

    if (this.grain) {
      this.scene.tweens.add({
        targets: this.grain,
        tilePositionX: 64,
        tilePositionY: 32,
        duration: 2600,
        repeat: -1,
        ease: "Linear"
      });
    }
  }

  hide({ duration = 320 } = {}) {
    if (this.isDestroyed) return Promise.resolve();

    this.kbTween?.stop();

    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: [this.container, this.shadow],
        alpha: 0,
        duration,
        ease: "Quad.easeIn",
        onComplete: () => {
          this.destroy();
          resolve();
        }
      });
    });
  }

  destroy() {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    this.activeTweens.forEach((tween) => tween.stop());
    this.activeTweens = [];
    this.kbTween?.stop();
    this.scene.tweens.killTweensOf([this.container, this.shadow, this.grain].filter(Boolean));

    this.container?.destroy();
    this.shadow?.destroy();

    // Liberar el frame exclusivo del plate
    const texture = this.scene.textures.exists(this.options.texture)
      ? this.scene.textures.get(this.options.texture)
      : null;
    if (texture && this.frameName && texture.has(this.frameName)) {
      texture.remove(this.frameName);
    }
  }
}
