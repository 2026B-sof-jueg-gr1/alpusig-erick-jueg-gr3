import { WIDTH } from "../config/constants.js";
import { addBackground, addTitle, addActionButton } from "../ui/UIHelper.js";

/**
 * Escena de Fin de Partida (Derrota).
 * Presenta las bajas logradas, la puntuación obtenida y permite reiniciar la partida.
 */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOverScene");
  }

  init(data) {
    this.data = data || { kills: 0, score: 0 };
  }

  create() {
    addBackground(this);
    addTitle(this, "LA NOCHE PREVALECIÓ", 210);

    this.add.text(
      WIDTH / 2,
      310,
      `Enemigos derrotados: ${this.data.kills}\nPuntuación: ${this.data.score}`,
      { fontSize: "23px", color: "#eaf4ff", align: "center", lineSpacing: 12 }
    ).setOrigin(0.5);

    addActionButton(this, "INTENTAR DE NUEVO", 440, () => {
      this.scene.start("GameScene");
    });
  }
}

