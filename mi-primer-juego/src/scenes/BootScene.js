import { TextureGenerator } from "../utils/TextureGenerator.js";

/**
 * Escena inicial de arranque.
 * Carga y genera todas las texturas procedurales en memoria antes de transicionar al menú.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create() {
    TextureGenerator.generateAll(this);
    document.getElementById("loading")?.remove();
    this.scene.start("MenuScene");
  }
}

