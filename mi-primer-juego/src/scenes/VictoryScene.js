import { WIDTH } from "../config/constants.js";
import { addBackground, addTitle, addActionButton } from "../ui/UIHelper.js";

/**
 * Escena de Victoria.
 * Aparece tras vencer al Avatar de la Serpiente Mundial y permite volver a jugar.
 */
export class VictoryScene extends Phaser.Scene {
  constructor() {
    super("VictoryScene");
  }

  init(data) {
    this.data = data || { score: 0 };
  }

  create() {
    addBackground(this);
    addTitle(this, "EL INVIERNO TERMINA", 205);

    this.add.text(
      WIDTH / 2,
      315,
      `Las aldeas están a salvo.\nPuntuación final: ${this.data.score}`,
      { fontSize: "23px", color: "#eaf4ff", align: "center", lineSpacing: 12 }
    ).setOrigin(0.5);

    addActionButton(this, "JUGAR DE NUEVO", 455, () => {
      this.scene.start("GameScene");
    });
  }
}

