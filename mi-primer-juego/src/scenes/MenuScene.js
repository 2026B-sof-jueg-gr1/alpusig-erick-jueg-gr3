import { WIDTH } from "../config/constants.js";
import { addBackground, addTitle } from "../ui/UIHelper.js";

/**
 * Escena del Menú Principal.
 * Muestra el título, la ambientación y los controles básicos para comenzar la partida.
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    addBackground(this);
    addTitle(this, "THE LAST SPARTAN", 174);

    this.add.text(WIDTH / 2, 260, "La última defensa del invierno eterno", {
      fontFamily: "Georgia",
      fontSize: "22px",
      color: "#b8dcf2"
    }).setOrigin(0.5);

    const button = this.add.text(WIDTH / 2, 390, "⚔  INICIAR CAMPAÑA  ⚔", {
      fontFamily: "Georgia",
      fontSize: "28px",
      color: "#23272f",
      backgroundColor: "#f4c542",
      padding: { left: 26, right: 26, top: 14, bottom: 14 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    button.on("pointerover", () => button.setStyle({ backgroundColor: "#ff8f3d" }));
    button.on("pointerout", () => button.setStyle({ backgroundColor: "#f4c542" }));
    button.on("pointerdown", () => this.scene.start("GameScene"));

    this.add.text(
      WIDTH / 2,
      500,
      "A / D: moverse   •   W o ESPACIO: saltar   •   J: atacar   •   P: pausa",
      { fontFamily: "Arial", fontSize: "16px", color: "#eaf4ff" }
    ).setOrigin(0.5);
  }
}

