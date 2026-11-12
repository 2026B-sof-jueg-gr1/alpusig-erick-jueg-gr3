import { WIDTH, HEIGHT, SPARTA_COLORS } from "../config/constants.js";

const CORNER_POSITIONS = {
  "top-left": (w, h) => ({ x: w / 2 + 24, y: h / 2 + 24 }),
  "top-right": (w, h) => ({ x: WIDTH - w / 2 - 24, y: h / 2 + 24 }),
  "bottom-left": (w, h) => ({ x: w / 2 + 24, y: HEIGHT - h / 2 - 24 }),
  "bottom-right": (w, h) => ({ x: WIDTH - w / 2 - 24, y: HEIGHT - h / 2 - 24 }),
  "bottom-center": (w, h) => ({ x: WIDTH / 2, y: HEIGHT - h / 2 - 28 })
};

/**
 * Viñeta de Cómic Dinámica anclada a las esquinas de la pantalla.
 * Estilo pergamino / papel entintado con retrato de personaje, marco de tinta
 * y despliegue no bloqueante sobre la jugabilidad.
 */
export class ComicPanel {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.options = {
      corner: "top-left",
      width: options.width ?? 470,
      height: options.height ?? 116,
      speaker: options.speaker ?? "NARRADOR",
      text: options.text ?? "",
      portraitKey: options.portraitKey ?? null,
      variant: options.variant ?? "dialogue", // "dialogue" | "thought" | "dramatic"
      autoDismissDelay: options.autoDismissDelay ?? 0,
      ...options
    };

    const { corner, width, height } = this.options;
    const posFactory = CORNER_POSITIONS[corner] || CORNER_POSITIONS["top-left"];
    const pos = this.options.x !== undefined && this.options.y !== undefined
      ? { x: this.options.x, y: this.options.y }
      : posFactory(width, height);

    this.container = scene.add.container(pos.x, pos.y)
      .setDepth(140)
      .setAlpha(0)
      .setScrollFactor(0);

    this.isDestroyed = false;
    this.createPanel();
  }

  createPanel() {
    const { width, height, speaker, text, portraitKey, variant } = this.options;
    const isDramatic = variant === "dramatic";
    const isThought = variant === "thought";

    const fillColor = isDramatic ? 0x1d1312 : (isThought ? 0xebe5d5 : SPARTA_COLORS.parchment);
    const borderColor = isDramatic ? SPARTA_COLORS.bronzeLight : SPARTA_COLORS.ink;
    const textColor = isDramatic ? "#fff6e5" : "#1f1916";
    const tagBgColor = isDramatic ? SPARTA_COLORS.crimsonBright : SPARTA_COLORS.crimson;

    const bg = this.scene.add.graphics();
    // Sombra dura estilo cómic impreso
    bg.fillStyle(0x0d0a09, 0.35);
    bg.fillRoundedRect(-width / 2 + 5, -height / 2 + 6, width, height, 6);

    // Tarjeta papel/pergamino o dramática
    bg.fillStyle(fillColor, 0.96);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 6);

    // Trazo exterior de tinta
    bg.lineStyle(3, borderColor, 1);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 6);

    // Marco interior fino estilo cómic
    bg.lineStyle(1, isThought ? 0x6b7280 : SPARTA_COLORS.bronze, 0.75);
    bg.strokeRoundedRect(-width / 2 + 5, -height / 2 + 5, width - 10, height - 10, 4);

    this.container.add(bg);

    let textCenterX = 0;
    let textWrapWidth = width - 44;

    // Retrato del personaje (opcional, a la izquierda)
    if (portraitKey && this.scene.textures.exists(portraitKey)) {
      const portraitSize = height - 24;
      const portraitX = -width / 2 + 16 + portraitSize / 2;

      const frame = this.scene.add.graphics();
      frame.fillStyle(SPARTA_COLORS.ink, 1);
      frame.fillRect(
        portraitX - portraitSize / 2 - 2,
        -portraitSize / 2 - 2,
        portraitSize + 4,
        portraitSize + 4
      );
      this.container.add(frame);

      const portrait = this.scene.add.image(portraitX, 0, portraitKey)
        .setDisplaySize(portraitSize, portraitSize);
      this.container.add(portrait);

      textCenterX = (portraitSize + 16) / 2;
      textWrapWidth = width - portraitSize - 44;
    }

    // Etiqueta superior del emisor
    if (speaker) {
      const badgeWidth = Math.min(width - 40, Math.max(130, speaker.length * 10 + 30));
      const badgeX = -width / 2 + 16;
      const badgeY = -height / 2 - 11;

      const tagBg = this.scene.add.graphics();
      tagBg.fillStyle(tagBgColor, 1);
      tagBg.fillRoundedRect(badgeX, badgeY, badgeWidth, 22, 4);
      tagBg.lineStyle(2, SPARTA_COLORS.ink, 1);
      tagBg.strokeRoundedRect(badgeX, badgeY, badgeWidth, 22, 4);
      this.container.add(tagBg);

      const speakerText = this.scene.add.text(badgeX + 10, badgeY + 4, speaker.toUpperCase(), {
        fontFamily: "Georgia, serif",
        fontSize: "11px",
        fontStyle: "bold",
        color: "#fff4d6",
        letterSpacing: 1
      });
      this.container.add(speakerText);
    }

    // Texto de la viñeta
    const formatted = isThought ? `(${text})` : `"${text}"`;
    const content = this.scene.add.text(textCenterX, 4, formatted, {
      fontFamily: "Georgia, serif",
      fontSize: "15px",
      fontStyle: isThought ? "italic" : "normal",
      color: textColor,
      align: portraitKey ? "left" : "center",
      wordWrap: { width: textWrapWidth },
      lineSpacing: 5
    }).setOrigin(0.5);

    this.container.add(content);
  }

  show(duration = 320) {
    if (this.isDestroyed) return Promise.resolve();
    return new Promise((resolve) => {
      this.container.setScale(0.92);
      this.scene.tweens.add({
        targets: this.container,
        alpha: 1,
        scale: 1,
        duration,
        ease: "Back.easeOut",
        onComplete: () => {
          if (this.isDestroyed) {
            resolve();
            return;
          }
          if (this.options.autoDismissDelay > 0) {
            this.autoTimer = this.scene.time.delayedCall(this.options.autoDismissDelay, () => {
              this.dismiss().then(resolve);
            });
          } else {
            resolve();
          }
        }
      });
    });
  }

  dismiss(duration = 280) {
    if (this.isDestroyed) return Promise.resolve();
    if (this.autoTimer) {
      this.autoTimer.remove(false);
      this.autoTimer = null;
    }
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.container,
        alpha: 0,
        scale: 0.94,
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
    if (this.autoTimer) {
      this.autoTimer.remove(false);
      this.autoTimer = null;
    }
    this.container?.destroy();
  }
}
