import { WIDTH, HEIGHT } from "./constants.js";
import { BootScene } from "../scenes/BootScene.js";
import { MenuScene } from "../scenes/MenuScene.js";
import { GameScene } from "../scenes/GameScene.js";
import { PauseScene } from "../scenes/PauseScene.js";
import { GameOverScene } from "../scenes/GameOverScene.js";
import { VictoryScene } from "../scenes/VictoryScene.js";

/**
 * Configuración global del motor Phaser.
 * Define la resolución base, física Arcade, escalado responsivo y registro ordenado de escenas.
 */
export const gameConfig = {
  type: Phaser.AUTO,
  width: WIDTH,
  height: HEIGHT,
  parent: "game-container",
  backgroundColor: "#101b2d",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 850 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, MenuScene, GameScene, PauseScene, GameOverScene, VictoryScene]
};

