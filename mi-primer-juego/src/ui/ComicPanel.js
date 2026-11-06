import { WIDTH, HEIGHT, COLORS } from "../config/constants.js";

/**
 * Componente de interfaz para viñetas y paneles narrativos inspirados en cómics (God of War: Fallen God).
 * Aplica principios Clean Code / SRP centralizando la presentación, animaciones de opacidad
 * y tipografía de los diálogos y pensamientos en off.
 */
export class ComicPanel {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.container = scene.add.container(0, 0).setDepth(100).setAlpha(0);
    this.options = {
      x: options.x ?? WIDTH / 2,
      y: options.y ?? HEIGHT - 120,
      width: options.width ?? Math.min(WIDTH - 120, 860),
      height: options.height ?? 110,
      speaker: options.speaker ?? "KRATOS (VOZ EN OFF)",
      text: options.text ?? "",
      autoDismissDelay: options.autoDismissDelay ?? 0,
      ...options
    };

    this.createPanel();
  }

  createPanel() {
    const { x, y, width, height, speaker, text } = this.options;
    this.container.setPosition(x, y);

    // 1. Fondo negro con bordes rasgados/estilizados estilo cómic oscuro
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0a0c10, 0.94);
    bg.fillRect(-width / 2, -height / 2, width, height);

    // Marco exterior con bordes dobles desgastados
    bg.lineStyle(2, 0xd4af37, 0.85); // Toque dorado sutil
    bg.strokeRect(-width / 2, -height / 2, width, height);

    bg.lineStyle(1, 0xffffff, 0.4);
    bg.strokeRect(-width / 2 + 4, -height / 2 + 4, width - 8, height - 8);

    // Detalles esquineros rasgados
    bg.fillStyle(0xd4af37, 1);
    bg.fillRect(-width / 2, -height / 2, 8, 2);
    bg.fillRect(-width / 2, -height / 2, 2, 8);
    bg.fillRect(width / 2 - 8, -height / 2, 8, 2);
    bg.fillRect(width / 2 - 2, -height / 2, 2, 8);
    bg.fillRect(-width / 2, height / 2 - 2, 8, 2);
    bg.fillRect(-width / 2, height / 2 - 8, 2, 8);
    bg.fillRect(width / 2 - 8, height / 2 - 2, 8, 2);
    bg.fillRect(width / 2 - 2, height / 2 - 8, 2, 8);

    this.container.add(bg);

    // 2. Etiqueta del emisor / narrador
    if (speaker) {
      const tagBg = this.scene.add.graphics();
      tagBg.fillStyle(0x1a0505, 1); // Rojo sangre oscuro
      tagBg.fillRect(-width / 2 + 16, -height / 2 - 12, 190, 22);
      tagBg.lineStyle(1, 0x9b111e, 0.9);
      tagBg.strokeRect(-width / 2 + 16, -height / 2 - 12, 190, 22);
      this.container.add(tagBg);

      const speakerText = this.scene.add.text(-width / 2 + 24, -height / 2 - 8, speaker, {
        fontFamily: "Georgia, serif",
        fontSize: "12px",
        fontStyle: "bold",
        color: "#f4c542",
        letterSpacing: 2
      });
      this.container.add(speakerText);
    }

    // 3. Texto de la viñeta
    const content = this.scene.add.text(0, speaker ? 6 : 0, `"${text}"`, {
      fontFamily: "Georgia, serif",
      fontSize: "18px",
      fontStyle: "italic",
      color: "#ffffff",
      align: "center",
      wordWrap: { width: width - 60 },
      lineSpacing: 8
    }).setOrigin(0.5);

    this.container.add(content);
  }

  show(duration = 700) {
    return new Promise((resolve) => {
      this.container.setScale(0.96);
      this.scene.tweens.add({
        targets: this.container,
        alpha: 1,
        scale: 1,
        duration,
        ease: "Cubic.easeOut",
        onComplete: () => {
          if (this.options.autoDismissDelay > 0) {
            this.scene.time.delayedCall(this.options.autoDismissDelay, () => {
              this.dismiss().then(resolve);
            });
          } else {
            resolve();
          }
        }
      });
    });
  }

  dismiss(duration = 600) {
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.container,
        alpha: 0,
        scale: 0.96,
        duration,
        ease: "Cubic.easeIn",
        onComplete: () => {
          this.destroy();
          resolve();
        }
      });
    });
  }

  destroy() {
    this.container.destroy();
  }
}

