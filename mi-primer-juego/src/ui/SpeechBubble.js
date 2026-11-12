import { SPARTA_COLORS } from "../config/constants.js";

/**
 * Bocadillo de Diálogo en el mundo 2D posicionado dinámicamente
 * sobre la cabeza del personaje que habla, siguiendo su posición en tiempo real.
 */
export class SpeechBubble {
  constructor(scene, target, text, options = {}) {
    this.scene = scene;
    this.target = target;
    this.options = {
      offsetY: options.offsetY ?? 74,
      maxWidth: options.maxWidth ?? 300,
      duration: options.duration ?? 4500,
      speakerColor: options.speakerColor ?? "#1a1412",
      ...options
    };

    this.isDestroyed = false;
    this.container = scene.add.container(target.x, target.y - this.options.offsetY)
      .setDepth(130)
      .setAlpha(0)
      .setScale(0.88);

    this.createBubble(text);
    this.updatePosition();
  }

  createBubble(text) {
    const paddingX = 16;
    const paddingY = 11;

    const label = this.scene.add.text(0, 0, text, {
      fontFamily: "Georgia, serif",
      fontSize: "14px",
      color: this.options.speakerColor,
      align: "center",
      wordWrap: { width: this.options.maxWidth - paddingX * 2 },
      lineSpacing: 4
    }).setOrigin(0.5);

    const bounds = label.getBounds();
    const boxW = Math.max(120, Math.ceil(bounds.width) + paddingX * 2);
    const boxH = Math.max(44, Math.ceil(bounds.height) + paddingY * 2);

    this.boxWidth = boxW;
    this.boxHeight = boxH;

    const bg = this.scene.add.graphics();
    // Sombra suave estilo cómic
    bg.fillStyle(0x0d0a09, 0.25);
    bg.fillRoundedRect(-boxW / 2 + 3, -boxH + 4, boxW, boxH, 12);

    // Globo principal
    bg.fillStyle(SPARTA_COLORS.bubbleFill, 0.98);
    bg.fillRoundedRect(-boxW / 2, -boxH, boxW, boxH, 12);
    bg.lineStyle(2.5, SPARTA_COLORS.ink, 1);
    bg.strokeRoundedRect(-boxW / 2, -boxH, boxW, boxH, 12);

    // Pico triangular apuntando hacia la cabeza del hablante
    bg.fillStyle(SPARTA_COLORS.bubbleFill, 1);
    bg.fillTriangle(-9, -2, 9, -2, 0, 12);
    bg.lineStyle(2.5, SPARTA_COLORS.ink, 1);
    bg.strokeLineShape(new Phaser.Geom.Line(-9, 0, 0, 12));
    bg.strokeLineShape(new Phaser.Geom.Line(0, 12, 9, 0));

    label.setPosition(0, -boxH / 2);
    this.container.add([bg, label]);
  }

  updatePosition() {
    if (this.isDestroyed || !this.target || !this.target.active) return;

    const cam = this.scene.cameras.main;
    const minX = cam.scrollX + this.boxWidth / 2 + 16;
    const maxX = cam.scrollX + cam.width - this.boxWidth / 2 - 16;
    const clampedX = Phaser.Math.Clamp(this.target.x, minX, maxX);
    const targetY = Math.max(this.boxHeight + 18, this.target.y - this.options.offsetY);

    this.container.setPosition(clampedX, targetY);
  }

  show() {
    if (this.isDestroyed) return Promise.resolve();
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.container,
        alpha: 1,
        scale: 1,
        duration: 240,
        ease: "Back.easeOut",
        onComplete: () => {
          if (this.isDestroyed) {
            resolve();
            return;
          }
          if (this.options.duration > 0) {
            this.autoTimer = this.scene.time.delayedCall(this.options.duration, () => {
              this.dismiss().then(resolve);
            });
          } else {
            resolve();
          }
        }
      });
    });
  }

  dismiss() {
    if (this.isDestroyed) return Promise.resolve();
    if (this.autoTimer) {
      this.autoTimer.remove(false);
      this.autoTimer = null;
    }
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.container,
        alpha: 0,
        scale: 0.9,
        duration: 220,
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

