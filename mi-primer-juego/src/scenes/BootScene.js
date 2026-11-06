import { TextureGenerator } from "../utils/TextureGenerator.js";
import { CUSTOM_TEXTURES } from "../config/assetsConfig.js";

/**
 * Escena inicial de arranque.
 * Carga imágenes externas personalizadas en preload() (si las hay)
 * y genera proceduralmente cualquier textura restante en create().
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    // 1. Cargar skins o texturas personalizadas colocadas en assets/sprites/
    if (Array.isArray(CUSTOM_TEXTURES)) {
      CUSTOM_TEXTURES.forEach((item) => {
        if (item.key && item.path) {
          this.load.image(item.key, item.path);
        }
      });
    }
  }

  create() {
    // 2. Generar proceduralmente cualquier textura que no se haya cargado desde archivo
    TextureGenerator.generateAll(this);
    
    // 3. Remover el cartel de carga del HTML y arrancar el juego
    document.getElementById("loading")?.remove();
    this.scene.start("MenuScene");
  }
}
