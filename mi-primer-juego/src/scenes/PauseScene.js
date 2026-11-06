import { WIDTH, HEIGHT, COLORS } from "../config/constants.js";

/**
 * Escena de Pausa (Superpuesta).
 * Permite reanudar la acción o volver al menú principal.
 */
export class PauseScene extends Phaser.Scene {
  constructor() {
    super("PauseScene");
  }

  create() {
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, COLORS.charcoal, 0.8);
    
    this.add.text(WIDTH / 2, 205, "PAUSA", {
      fontSize: "54px",
      color: "#eaf4ff"
    }).setOrigin(0.5);

    const resume = this.add.text(WIDTH / 2, 335, "CONTINUAR", {
      fontSize: "25px",
      color: "#23272f",
      backgroundColor: "#f4c542",
      padding: 14
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    resume.on("pointerdown", () => {
      this.scene.stop();
      this.scene.resume("GameScene");
    });

    const menu = this.add.text(WIDTH / 2, 420, "MENÚ PRINCIPAL", {
      fontSize: "20px",
      color: "#eaf4ff"
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menu.on("pointerdown", () => {
      this.scene.stop("GameScene");
      this.scene.start("MenuScene");
    });
  }
}

