import { WIDTH, GROUND_Y, COLORS } from "../config/constants.js";

/**
 * Generador procedural de texturas en memoria usando Phaser.GameObjects.Graphics.
 * Cumple con el Principio de Responsabilidad Única (SRP) al centralizar la definición
 * y creación visual de todos los assets del juego sin depender de imágenes externas.
 */
export class TextureGenerator {
  static createTexture(scene, key, width, height, drawCallback) {
    const graphics = scene.make.graphics({ add: false });
    drawCallback(graphics);
    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }

  static generateAll(scene) {
    // 1. Jugador (Espartano)
    this.createTexture(scene, "player", 48, 72, (g) => {
      g.fillStyle(COLORS.steel).fillRoundedRect(9, 19, 30, 42, 7);
      g.fillStyle(COLORS.snow).fillCircle(24, 14, 13);
      g.fillStyle(COLORS.orange).fillRect(8, 28, 32, 7);
      g.fillStyle(COLORS.charcoal).fillRect(11, 58, 10, 14).fillRect(27, 58, 10, 14);
      g.lineStyle(3, COLORS.gold).strokeLineShape(new Phaser.Geom.Line(34, 34, 47, 16));
    });

    // 2. Lobo de hielo
    this.createTexture(scene, "wolf", 56, 38, (g) => {
      g.fillStyle(0xd6f2ff).fillEllipse(27, 22, 50, 25);
      g.fillStyle(0xb2d9ef).fillTriangle(8, 14, 16, 0, 23, 14);
      g.fillStyle(0xb2d9ef).fillTriangle(34, 12, 44, 0, 48, 19);
      g.fillStyle(COLORS.ice).fillCircle(40, 20, 3);
    });

    // 3. Draugr (Guerrero no muerto)
    this.createTexture(scene, "draugr", 44, 68, (g) => {
      g.fillStyle(0x465b68).fillRoundedRect(5, 17, 34, 48, 8);
      g.fillStyle(0x9ab8c4).fillCircle(22, 12, 12);
      g.lineStyle(2, COLORS.ice).strokeLineShape(new Phaser.Geom.Line(12, 34, 32, 48));
      g.fillStyle(COLORS.ice).fillRect(13, 10, 5, 3).fillRect(26, 10, 5, 3);
    });

    // 4. Chamán
    this.createTexture(scene, "shaman", 46, 66, (g) => {
      g.fillStyle(0x596b94).fillTriangle(23, 0, 3, 63, 43, 63);
      g.fillStyle(0xd5f6ff).fillCircle(23, 19, 9);
      g.lineStyle(3, COLORS.ice).strokeLineShape(new Phaser.Geom.Line(39, 21, 39, 66));
      g.fillStyle(COLORS.ice).fillCircle(39, 18, 6);
    });

    // 5. Guardián del Hielo (Jefe 1)
    this.createTexture(scene, "guardian", 94, 112, (g) => {
      g.fillStyle(0x8ca9ba).fillRoundedRect(8, 29, 78, 75, 16);
      g.fillStyle(0xdff8ff).fillCircle(47, 25, 25);
      g.fillStyle(COLORS.ice).fillCircle(38, 23, 5).fillCircle(56, 23, 5);
      g.fillStyle(COLORS.deepBlue).fillTriangle(47, 0, 34, 15, 60, 15);
      g.lineStyle(5, COLORS.ice).strokeLineShape(new Phaser.Geom.Line(16, 53, 78, 53));
    });

    // 6. Hacha Leviatán
    this.createTexture(scene, "axe", 70, 18, (g) => {
      g.lineStyle(5, COLORS.gold).strokeLineShape(new Phaser.Geom.Line(4, 14, 58, 5));
      g.fillStyle(COLORS.snow).fillTriangle(52, 2, 68, 0, 62, 15);
    });

    // 7. Lanza Draupnir
    this.createTexture(scene, "spear", 72, 12, (g) => {
      g.lineStyle(4, COLORS.gold).strokeLineShape(new Phaser.Geom.Line(3, 9, 57, 3));
      g.fillStyle(COLORS.ice).fillTriangle(54, 0, 72, 2, 59, 11);
    });

    // 8. Serpiente Mundial (Jefe Final)
    this.createTexture(scene, "serpent", 150, 74, (g) => {
      g.fillStyle(0x3d7188).fillEllipse(75, 40, 140, 52);
      g.fillStyle(COLORS.ice).fillCircle(48, 33, 6).fillCircle(103, 33, 6);
      g.lineStyle(4, COLORS.gold).strokeLineShape(new Phaser.Geom.Line(25, 50, 125, 50));
    });

    // 9. Orbe de mejora (Pickup)
    this.createTexture(scene, "pickup", 24, 24, (g) => {
      g.fillStyle(COLORS.green).fillCircle(12, 12, 11);
      g.fillStyle(COLORS.snow).fillRect(9, 4, 6, 16).fillRect(4, 9, 16, 6);
    });

    // 10. Suelo del escenario
    this.createTexture(scene, "ground", WIDTH, 86, (g) => {
      g.fillStyle(COLORS.deepBlue).fillRect(0, GROUND_Y + 14, WIDTH, 72);
      g.fillStyle(COLORS.ice).fillRect(0, GROUND_Y + 7, WIDTH, 7);
    });
  }
}

