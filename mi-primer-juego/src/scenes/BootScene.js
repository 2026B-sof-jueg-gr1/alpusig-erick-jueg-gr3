import { TextureGenerator } from "../utils/TextureGenerator.js";
import { CUSTOM_TEXTURES } from "../config/assetsConfig.js";
import { PLAYER_ANIMATIONS } from "../config/playerAnimations.js";
import { CINEMATIC_ANIMATIONS } from "../config/cinematicConfig.js";

/**
 * Escena inicial de arranque.
 * Carga imágenes y spritesheets personalizados en preload() y registra las
 * animaciones del jugador antes de generar proceduralmente el resto de texturas.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    if (!Array.isArray(CUSTOM_TEXTURES)) return;

    CUSTOM_TEXTURES.forEach((item) => {
      if (!item.key || !item.path) return;

      if (item.frameWidth && item.frameHeight) {
        this.load.spritesheet(item.key, item.path, {
          frameWidth: item.frameWidth,
          frameHeight: item.frameHeight
        });
        return;
      }

      this.load.image(item.key, item.path);
    });
  }

  create() {
    TextureGenerator.generateAll(this);
    this.registerPlayerAnimations();
    this.registerAnimations(CINEMATIC_ANIMATIONS);

    document.getElementById("loading")?.remove();
    this.scene.start("MenuScene");
  }

  registerPlayerAnimations() {
    this.registerAnimations(PLAYER_ANIMATIONS);
  }

  registerAnimations(definitions) {
    definitions.forEach((definition) => {
      if (this.anims.exists(definition.key)) return;

      const frames = Array.from({ length: definition.frameCount }, (_, index) => {
        const duration = definition.frameDurations?.[index];
        return duration ? { key: definition.texture, frame: index, duration } : { key: definition.texture, frame: index };
      });

      this.anims.create({
        key: definition.key,
        frames,
        frameRate: definition.frameRate,
        repeat: definition.repeat
      });
    });
  }
}
