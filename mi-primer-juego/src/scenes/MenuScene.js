import { WIDTH } from "../config/constants.js";
import { addBackground, addTitle } from "../ui/UIHelper.js";

/**
 * Escena del Menú Principal.
 * Muestra el título, la ambientación y los accesos para iniciar la Campaña (Escena 1)
 * o ingresar directamente al modo combate de acción.
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    addBackground(this);
    addTitle(this, "THE LAST SPARTAN", 160);

    this.add.text(WIDTH / 2, 235, "La última defensa del invierno eterno", {
      fontFamily: "Georgia",
      fontSize: "22px",
      color: "#b8dcf2"
    }).setOrigin(0.5);

    // Botón Principal: Iniciar Campaña Narrativa (Escena 1)
    const campaignBtn = this.add.text(WIDTH / 2, 345, "⚔  INICIAR CAMPAÑA (ESCENA 1)  ⚔", {
      fontFamily: "Georgia",
      fontSize: "26px",
      color: "#23272f",
      backgroundColor: "#f4c542",
      padding: { left: 26, right: 26, top: 12, bottom: 12 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    campaignBtn.on("pointerover", () => campaignBtn.setStyle({ backgroundColor: "#ff8f3d" }));
    campaignBtn.on("pointerout", () => campaignBtn.setStyle({ backgroundColor: "#f4c542" }));
    campaignBtn.on("pointerdown", () => this.scene.start("Escena1Scene"));

    // Botón Secundario: Modo Combate Directo
    const combatBtn = this.add.text(WIDTH / 2, 425, "🛡  MODO COMBATE DIRECTO  🛡", {
      fontFamily: "Georgia",
      fontSize: "19px",
      color: "#eaf4ff",
      backgroundColor: "#1e3a5f",
      padding: { left: 20, right: 20, top: 8, bottom: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    combatBtn.on("pointerover", () => combatBtn.setStyle({ backgroundColor: "#2d5a92" }));
    combatBtn.on("pointerout", () => combatBtn.setStyle({ backgroundColor: "#1e3a5f" }));
    combatBtn.on("pointerdown", () => this.scene.start("GameScene"));

    this.add.text(
      WIDTH / 2,
      515,
      "A / D: moverse   •   W o ESPACIO: saltar   •   J: atacar   •   P: pausa",
      { fontFamily: "Arial", fontSize: "15px", color: "#eaf4ff" }
    ).setOrigin(0.5);
  }
}
