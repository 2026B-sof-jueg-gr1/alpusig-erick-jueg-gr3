import { WIDTH, HEIGHT, SPARTA_COLORS } from "../config/constants.js";
import { MenuBackground } from "../ui/MenuBackground.js";
import { MenuButton } from "../ui/MenuButton.js";
import { ControlsOverlay } from "../ui/ControlsOverlay.js";

/**
 * Menú principal de The Last Spartan.
 *
 * La escena solo compone tres piezas: el fondo ilustrado, el bloque de título
 * y dos acciones (empezar la campaña y consultar los controles). Toda la
 * maquinaria visual y de interacción vive en componentes reutilizables.
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    this.background = new MenuBackground(this);
    this.ui = this.add.container(0, 0).setDepth(10);
    this.controls = new ControlsOverlay(this);

    this.buildHeading();
    this.buildActions();
    this.buildFooter();
  }

  /** Texto del menú, siempre por encima del degradado del fondo. */
  addText(x, y, text, style) {
    const label = this.add.text(x, y, text, style);
    this.ui.add(label);
    return label;
  }

  buildHeading() {
    const x = 88;

    this.addText(x, 96, "PARTE I  ·  EL PRECIO DE LA GLORIA", {
      fontFamily: "Arial, sans-serif",
      fontSize: "13px",
      fontStyle: "bold",
      color: "#e8b962",
      letterSpacing: 3
    });

    this.addText(x - 3, 150, "THE LAST", {
      fontFamily: "Georgia, serif",
      fontSize: "54px",
      fontStyle: "bold",
      color: "#fff6e5",
      stroke: "#0d0a09",
      strokeThickness: 8
    });

    this.addText(x - 3, 208, "SPARTAN", {
      fontFamily: "Georgia, serif",
      fontSize: "62px",
      fontStyle: "bold",
      color: "#fff6e5",
      stroke: "#0d0a09",
      strokeThickness: 8,
      letterSpacing: 2
    });

    const rule = this.add.graphics();
    rule.fillStyle(SPARTA_COLORS.bronzeLight, 0.9);
    rule.fillRect(x, 258, 300, 2);
    rule.fillStyle(SPARTA_COLORS.crimsonBright, 0.9);
    rule.fillRect(x, 258, 64, 2);
    this.ui.add(rule);

    this.addText(x, 282, "La gloria se paga con sangre.", {
      fontFamily: "Georgia, serif",
      fontSize: "19px",
      fontStyle: "italic",
      color: "#e8dcc4"
    });

  }

  buildActions() {
    new MenuButton(this, 300, 392, {
      label: "▶   EMPEZAR CAMPAÑA",
      primary: true,
      onClick: () => this.scene.start("Escena1Scene")
    });

    new MenuButton(this, 300, 462, {
      label: "◧   CONTROLES",
      onClick: () => this.controls.show()
    });
  }

  buildFooter() {
    this.addText(88, HEIGHT - 42, "UNA HISTORIA DE ESPARTA — THE LAST SPARTAN", {
      fontFamily: "Arial, sans-serif",
      fontSize: "11px",
      color: "#a9977c",
      letterSpacing: 2
    });

  }
}
