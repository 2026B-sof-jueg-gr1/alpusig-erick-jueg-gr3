import { HEIGHT } from "../config/constants.js";
import { MenuBackground } from "../ui/MenuBackground.js";
import { MenuButton } from "../ui/MenuButton.js";

const CLOSING_PLATES = [
  "cine_hito3_2", // el recorrido entre las llamas
  "cine_hito3_1", // el pueblo en cenizas
  "cine_hito2_2", // la muerte del ídolo
  "cine_hito1_1"  // la paz que ya no volverá
];

/**
 * Pantalla final de la Parte 1.
 *
 * Cierra el arco con un collage de los momentos más representativos y ofrece
 * solo las acciones que tienen sentido al terminar la campaña: rejugarla,
 * revivir el desenlace o volver al menú principal.
 */
export class FinalMenuScene extends Phaser.Scene {
  constructor() {
    super("FinalMenuScene");
  }

  create() {
    this.background = new MenuBackground(this, CLOSING_PLATES, "ember_spark");
    this.ui = this.add.container(0, 0).setDepth(10);

    this.buildHeading();
    this.buildActions();
    this.buildFooter();
  }

  addText(x, y, text, style) {
    const label = this.add.text(x, y, text, style);
    this.ui.add(label);
    return label;
  }

  buildHeading() {
    const x = 88;

    this.addText(x, 96, "PARTE I COMPLETADA  ·  EL PRECIO DE LA GLORIA", {
      fontFamily: "Arial, sans-serif",
      fontSize: "13px",
      fontStyle: "bold",
      color: "#e8b962",
      letterSpacing: 3
    });

    this.addText(x - 3, 142, "THE LAST", {
      fontFamily: "Georgia, serif",
      fontSize: "52px",
      fontStyle: "bold",
      color: "#fff6e5",
      stroke: "#0d0a09",
      strokeThickness: 8
    });

    this.addText(x - 3, 200, "SPARTAN", {
      fontFamily: "Georgia, serif",
      fontSize: "60px",
      fontStyle: "bold",
      color: "#fff6e5",
      stroke: "#0d0a09",
      strokeThickness: 8,
      letterSpacing: 2
    });

    this.addText(x, 272, "La gloria se pagó con todo lo que amaba.", {
      fontFamily: "Georgia, serif",
      fontSize: "19px",
      fontStyle: "italic",
      color: "#e8dcc4"
    });

    this.addText(x, 304, "Gracias por acompañar a este soldado.", {
      fontFamily: "Arial, sans-serif",
      fontSize: "13px",
      color: "#c9b594"
    });
  }

  buildActions() {
    new MenuButton(this, 300, 392, {
      label: "↻   REJUGAR PARTE 1",
      primary: true,
      onClick: () => this.scene.start("Escena1Scene")
    });

    new MenuButton(this, 300, 458, {
      label: "◧   REPETIR ESCENA 3",
      onClick: () => this.scene.start("Escena3Scene")
    });

    new MenuButton(this, 300, 524, {
      label: "←   MENÚ PRINCIPAL",
      onClick: () => this.scene.start("MenuScene")
    });
  }

  buildFooter() {
    this.addText(88, HEIGHT - 42, "3 ESCENAS  ·  9 HITOS  ·  THE LAST SPARTAN", {
      fontFamily: "Arial, sans-serif",
      fontSize: "11px",
      color: "#a9977c",
      letterSpacing: 2
    });
  }
}
