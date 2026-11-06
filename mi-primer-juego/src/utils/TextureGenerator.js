import { WIDTH, GROUND_Y, COLORS } from "../config/constants.js";

/**
 * Generador procedural de texturas en memoria usando Phaser.GameObjects.Graphics.
 * Cumple con el Principio de Responsabilidad Única (SRP) al centralizar la definición
 * y creación visual de todos los assets del juego sin depender de imágenes externas.
 */
export class TextureGenerator {
  static createTexture(scene, key, width, height, drawCallback) {
    if (scene.textures.exists(key)) return;
    const graphics = scene.make.graphics({ add: false });
    drawCallback(graphics);
    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }

  static generateAll(scene) {
    // ------------------------------------------------------------------------
    // TEXTURAS DEL JUEGO BASE Y COMBATE
    // ------------------------------------------------------------------------

    // 1. Jugador (Espartano activo)
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

    // ------------------------------------------------------------------------
    // TEXTURAS NARRATIVAS DE LA ESCENA 1 (EL ECO DE LA ESPERANZA)
    // ------------------------------------------------------------------------

    // 11. Espada del Olimpo (Blade of Olympus)
    this.createTexture(scene, "blade_olympus", 44, 130, (g) => {
      // Pomo y empuñadura dorada
      g.fillStyle(0xd4af37).fillCircle(22, 14, 8);
      g.fillStyle(0x5a4d28).fillRect(19, 18, 6, 26);
      // Guarda alada con gemas azules
      g.fillStyle(0xd4af37).fillTriangle(22, 44, 4, 34, 40, 34);
      g.fillStyle(0x22d3ee).fillCircle(22, 38, 5); // Joya brillante
      // Hoja ancha de doble filo con resplandor celestial
      g.fillStyle(0x93c5fd).fillTriangle(22, 126, 10, 48, 34, 48);
      g.fillStyle(0x38bdf8).fillTriangle(22, 122, 16, 48, 28, 48);
      // Runas grabadas en la hoja
      g.lineStyle(2, 0xffffff).strokeLineShape(new Phaser.Geom.Line(22, 54, 22, 114));
      g.lineStyle(1, 0x67e8f9).strokeLineShape(new Phaser.Geom.Line(18, 70, 26, 70));
      g.lineStyle(1, 0x67e8f9).strokeLineShape(new Phaser.Geom.Line(19, 90, 25, 90));
    });

    // 12. Kratos arrodillado y atravesado (El Fin del Olimpo)
    this.createTexture(scene, "kratos_kneeling", 64, 84, (g) => {
      // Piernas y faldón espartano
      g.fillStyle(0x451a1a).fillRect(16, 52, 32, 18);
      g.fillStyle(0xd4af37).fillRect(20, 50, 24, 4); // Cinturón dorado
      g.fillStyle(0xb0b8be).fillRect(14, 62, 12, 20); // Pierna arrodillada
      g.fillStyle(0xb0b8be).fillRect(36, 58, 14, 24); // Pierna de apoyo
      // Torso cenizo con musculatura
      g.fillStyle(0xd2d7df).fillRoundedRect(16, 26, 32, 30, 6);
      // Tatuaje rojo espartano distintivo
      g.lineStyle(4, 0xcc1111).strokeLineShape(new Phaser.Geom.Line(20, 26, 34, 48));
      // Cabeza rapada e inclinada de dolor
      g.fillStyle(0xd2d7df).fillCircle(30, 18, 11);
      g.fillStyle(0x1a1a1a).fillRoundedRect(24, 21, 14, 9, 3); // Barba espartana oscura
      g.fillStyle(0xcc1111).fillRect(25, 12, 4, 8); // Tatuaje en la cabeza
      // Manos sosteniendo la herida
      g.fillStyle(0xb0b8be).fillRect(10, 40, 8, 16);
      g.fillStyle(0xb0b8be).fillRect(44, 40, 8, 16);
      // Mancha de sangre
      g.fillStyle(0x8b0000).fillCircle(32, 45, 7);
    });

    // 13. Kratos desplomado en el suelo
    this.createTexture(scene, "kratos_fallen", 92, 46, (g) => {
      // Cuerpo horizontal sobre el mármol
      g.fillStyle(0xd2d7df).fillRoundedRect(22, 14, 46, 22, 6); // Torso
      g.fillStyle(0x451a1a).fillRect(62, 16, 20, 18); // Faldón
      g.fillStyle(0xb0b8be).fillRect(74, 18, 16, 12); // Piernas estiradas
      g.fillStyle(0xd2d7df).fillCircle(15, 23, 10); // Cabeza
      g.fillStyle(0x1a1a1a).fillRect(12, 27, 8, 6); // Barba
      g.lineStyle(3, 0xcc1111).strokeLineShape(new Phaser.Geom.Line(26, 16, 42, 28)); // Tatuaje
      // Charco de sangre
      g.fillStyle(0x7f1d1d).fillEllipse(44, 38, 70, 12);
    });

    // 14. Partícula de La Esperanza (Ethereal Hope Mote)
    this.createTexture(scene, "hope_particle", 20, 20, (g) => {
      g.fillStyle(0x06b6d4, 0.3).fillCircle(10, 10, 10);
      g.fillStyle(0x38bdf8, 0.7).fillCircle(10, 10, 6);
      g.fillStyle(0xffffff, 1).fillCircle(10, 10, 2.5);
    });

    // 15. Partícula de ceniza volcánica
    this.createTexture(scene, "ash_flake", 8, 8, (g) => {
      g.fillStyle(0x9ca3af, 0.75).fillCircle(4, 4, 3);
    });

    // 16. Columna griega del Olimpo en ruinas
    this.createTexture(scene, "olympus_column", 44, 160, (g) => {
      g.fillStyle(0xe2e8f0).fillRect(6, 16, 32, 134);
      g.fillStyle(0xcfd8e3).fillRect(2, 0, 40, 16); // Capitel
      g.fillStyle(0xcfd8e3).fillRect(2, 148, 40, 12); // Base
      // Estrías / líneas de columna
      g.lineStyle(1, 0x94a3b8).strokeLineShape(new Phaser.Geom.Line(14, 16, 14, 148));
      g.lineStyle(1, 0x94a3b8).strokeLineShape(new Phaser.Geom.Line(22, 16, 22, 148));
      g.lineStyle(1, 0x94a3b8).strokeLineShape(new Phaser.Geom.Line(30, 16, 30, 148));
      // Grietas de destrucción
      g.lineStyle(2, 0x475569).strokeLineShape(new Phaser.Geom.Line(6, 40, 20, 55));
      g.lineStyle(2, 0x475569).strokeLineShape(new Phaser.Geom.Line(20, 55, 14, 75));
    });

    // 17. Kratos sentado en la cueva (desgastado con manto)
    this.createTexture(scene, "kratos_cave_sitting", 68, 76, (g) => {
      // Manto desgastado cubriendo hombros y cuerpo
      g.fillStyle(0x3a332d).fillRoundedRect(12, 18, 44, 52, 12);
      g.fillStyle(0x28231e).fillTriangle(8, 68, 30, 24, 52, 68);
      // Cabeza cansada asomando
      g.fillStyle(0xc0c6cf).fillCircle(34, 16, 10);
      g.fillStyle(0x18181b).fillRect(29, 18, 12, 9); // Barba larga
      g.lineStyle(2, 0x991b1b).strokeLineShape(new Phaser.Geom.Line(30, 10, 36, 18)); // Tatuaje desvanecido
      // Vendas en las manos
      g.fillStyle(0x9ca3af).fillRect(18, 46, 10, 12);
    });

    // 18. Espadas del Caos sobre roca
    this.createTexture(scene, "blades_of_chaos", 64, 40, (g) => {
      // Hojas curvas con runas ardientes
      g.fillStyle(0x52525b).fillTriangle(8, 28, 32, 12, 30, 36);
      g.fillStyle(0x52525b).fillTriangle(34, 12, 58, 28, 36, 36);
      // Runas rojas / fuego
      g.lineStyle(2, 0xef4444).strokeLineShape(new Phaser.Geom.Line(14, 26, 28, 16));
      g.lineStyle(2, 0xef4444).strokeLineShape(new Phaser.Geom.Line(40, 16, 52, 26));
      // Cadenas enrolladas
      g.lineStyle(2, 0xca8a04).strokeLineShape(new Phaser.Geom.Line(24, 28, 42, 28));
      g.lineStyle(2, 0xca8a04).strokeLineShape(new Phaser.Geom.Line(28, 32, 38, 32));
    });

    // 19. Fogata de cueva (ascuas casi extintas)
    this.createTexture(scene, "campfire", 48, 36, (g) => {
      // Troncos de madera cruzados
      g.fillStyle(0x3f2e21).fillRect(8, 26, 32, 6);
      g.fillStyle(0x2e1f14).fillRect(14, 20, 20, 6);
      // Ascuas y brasas
      g.fillStyle(0xea580c).fillCircle(24, 22, 8);
      g.fillStyle(0xfacc15).fillCircle(24, 20, 4);
    });
  }
}
