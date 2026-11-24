import { SPARTA_COLORS } from "../config/constants.js";

/**
 * Botón reutilizable del menú: dibuja su propio marco de tinta y responde a
 * hover / pulsación sin que la escena tenga que gestionar estilos.
 */
export class MenuButton extends Phaser.GameObjects.Container {
  constructor(scene, x, y, { label, primary = false, width = 372, height = 58, depth = 10, onClick }) {
    super(scene, x, y);
    scene.add.existing(this);
    this.setDepth(depth);

    this.primary = primary;
    this.frame = scene.add.graphics();
    this.label = scene.add.text(0, 0, label, {
      fontFamily: "Georgia, serif",
      fontSize: primary ? "23px" : "20px",
      fontStyle: "bold",
      color: primary ? "#221810" : "#f6eedb",
      letterSpacing: 1
    }).setOrigin(0.5);

    this.add([this.frame, this.label]);
    this.setSize(width, height);
    this.setInteractive({ useHandCursor: true });

    this.draw("idle");
    this.on("pointerover", () => {
      this.draw("hover");
      this.setScale(1.02);
    });
    this.on("pointerout", () => {
      this.draw("idle");
      this.setScale(1);
    });
    this.on("pointerdown", () => {
      this.draw("active");
      onClick?.();
    });
  }

  draw(state) {
    const { width: w, height: h } = this;
    const hover = state === "hover";
    const fill = this.primary
      ? (hover ? 0xffd470 : SPARTA_COLORS.bronzeLight)
      : (hover ? 0x3a2a20 : 0x1a1412);
    const stroke = this.primary ? SPARTA_COLORS.parchment : SPARTA_COLORS.bronze;

    this.frame.clear();
    this.frame.fillStyle(0x080605, 0.55);
    this.frame.fillRoundedRect(-w / 2 + 4, -h / 2 + 5, w, h, 7);
    this.frame.fillStyle(fill, 0.98);
    this.frame.fillRoundedRect(-w / 2, -h / 2, w, h, 7);
    this.frame.lineStyle(2, stroke, this.primary ? 0.9 : 0.75);
    this.frame.strokeRoundedRect(-w / 2, -h / 2, w, h, 7);
    this.frame.lineStyle(1, 0xffffff, this.primary ? 0.35 : 0.10);
    this.frame.strokeRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8, 5);

    if (state === "active") this.setScale(0.99);
  }
}
