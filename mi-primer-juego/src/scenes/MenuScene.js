import { WIDTH } from "../config/constants.js";
import { addBackground, addTitle } from "../ui/UIHelper.js";

/**
 * Escena del Menú Principal.
 * Presenta el título, la Parte 1 de la historia ('El Precio de la Gloria')
 * y los accesos para iniciar la Campaña desde Escena 1 o Escena 2, o el modo combate libre.
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    addBackground(this);
    addTitle(this, "THE LAST SPARTAN", 126);

    this.add.text(WIDTH / 2, 194, "Parte 1: El Precio de la Gloria", {
      fontFamily: "Georgia, serif",
      fontSize: "23px",
      color: "#f4c542"
    }).setOrigin(0.5);

    // Botón Principal: Iniciar Campaña Narrativa (desde Escena 1)
    const campaignBtn = this.add.text(WIDTH / 2, 274, "⚔  INICIAR CAMPAÑA (ESCENA 1)  ⚔", {
      fontFamily: "Georgia",
      fontSize: "24px",
      color: "#23272f",
      backgroundColor: "#f4c542",
      padding: { left: 26, right: 26, top: 11, bottom: 11 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    campaignBtn.on("pointerover", () => campaignBtn.setStyle({ backgroundColor: "#ff8f3d" }));
    campaignBtn.on("pointerout", () => campaignBtn.setStyle({ backgroundColor: "#f4c542" }));
    campaignBtn.on("pointerdown", () => this.scene.start("Escena1Scene"));

    // Acceso directo a Escena 2
    const scene2Btn = this.add.text(WIDTH / 2, 342, "🩸  ESCENA 2: EL BARRO, LA LANZA Y LA CAÍDA  🩸", {
      fontFamily: "Georgia",
      fontSize: "17px",
      color: "#fff6e5",
      backgroundColor: "#7a1212",
      padding: { left: 20, right: 20, top: 9, bottom: 9 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    scene2Btn.on("pointerover", () => scene2Btn.setStyle({ backgroundColor: "#9e1b1b" }));
    scene2Btn.on("pointerout", () => scene2Btn.setStyle({ backgroundColor: "#7a1212" }));
    scene2Btn.on("pointerdown", () => this.scene.start("Escena2Scene", { startAt: "2.1" }));

    // Acceso directo a Escena 3
    const scene3Btn = this.add.text(WIDTH / 2, 404, "🔥  ESCENA 3: CENIZAS DEL DEBER  🔥", {
      fontFamily: "Georgia",
      fontSize: "17px",
      color: "#fff6e5",
      backgroundColor: "#5c2414",
      padding: { left: 20, right: 20, top: 9, bottom: 9 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    scene3Btn.on("pointerover", () => scene3Btn.setStyle({ backgroundColor: "#8c351c" }));
    scene3Btn.on("pointerout", () => scene3Btn.setStyle({ backgroundColor: "#5c2414" }));
    scene3Btn.on("pointerdown", () => this.scene.start("Escena3Scene"));

    // Botón Secundario: Modo Combate Directo
    const combatBtn = this.add.text(WIDTH / 2, 466, "🛡  MODO COMBATE DIRECTO  🛡", {
      fontFamily: "Georgia",
      fontSize: "17px",
      color: "#eaf4ff",
      backgroundColor: "#1e3a5f",
      padding: { left: 18, right: 18, top: 8, bottom: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    combatBtn.on("pointerover", () => combatBtn.setStyle({ backgroundColor: "#2d5a92" }));
    combatBtn.on("pointerout", () => combatBtn.setStyle({ backgroundColor: "#1e3a5f" }));
    combatBtn.on("pointerdown", () => this.scene.start("GameScene"));

    this.add.text(
      WIDTH / 2,
      546,
      "A/D: mover   •   J: estocada (x3)   •   K: barrido pesado   •   Shift/L: escudo   •   Shift+J: golpe escudo   •   P: pausa",
      { fontFamily: "Arial", fontSize: "14px", color: "#eaf4ff" }
    ).setOrigin(0.5);
  }
}
