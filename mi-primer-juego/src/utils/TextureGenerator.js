import { WIDTH, GROUND_Y, COLORS, SPARTA_COLORS, GORGE_COLORS, ASHES_COLORS } from "../config/constants.js";

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
    this.generateCombatModeTextures(scene);
    this.generateSpartanCharacters(scene);
    this.generateSpartanEnvironment(scene);
    this.generateComicPortraits(scene);
    this.generateParticles(scene);
    this.generateEscena2Textures(scene);
    this.generateEscena3Textures(scene);
  }

  // --------------------------------------------------------------------------
  // TEXTURAS DEL MODO COMBATE LIBRE (GameScene)
  // --------------------------------------------------------------------------
  static generateCombatModeTextures(scene) {
    this.createTexture(scene, "player", 48, 72, (g) => {
      g.fillStyle(COLORS.steel).fillRoundedRect(9, 19, 30, 42, 7);
      g.fillStyle(COLORS.snow).fillCircle(24, 14, 13);
      g.fillStyle(COLORS.orange).fillRect(8, 28, 32, 7);
      g.fillStyle(COLORS.charcoal).fillRect(11, 58, 10, 14).fillRect(27, 58, 10, 14);
      g.lineStyle(3, COLORS.gold).strokeLineShape(new Phaser.Geom.Line(34, 34, 47, 16));
    });

    this.createTexture(scene, "wolf", 56, 38, (g) => {
      g.fillStyle(0xd6f2ff).fillEllipse(27, 22, 50, 25);
      g.fillStyle(0xb2d9ef).fillTriangle(8, 14, 16, 0, 23, 14);
      g.fillStyle(0xb2d9ef).fillTriangle(34, 12, 44, 0, 48, 19);
      g.fillStyle(COLORS.ice).fillCircle(40, 20, 3);
    });

    this.createTexture(scene, "draugr", 44, 68, (g) => {
      g.fillStyle(0x465b68).fillRoundedRect(5, 17, 34, 48, 8);
      g.fillStyle(0x9ab8c4).fillCircle(22, 12, 12);
      g.lineStyle(2, COLORS.ice).strokeLineShape(new Phaser.Geom.Line(12, 34, 32, 48));
      g.fillStyle(COLORS.ice).fillRect(13, 10, 5, 3).fillRect(26, 10, 5, 3);
    });

    this.createTexture(scene, "shaman", 46, 66, (g) => {
      g.fillStyle(0x596b94).fillTriangle(23, 0, 3, 63, 43, 63);
      g.fillStyle(0xd5f6ff).fillCircle(23, 19, 9);
      g.lineStyle(3, COLORS.ice).strokeLineShape(new Phaser.Geom.Line(39, 21, 39, 66));
      g.fillStyle(COLORS.ice).fillCircle(39, 18, 6);
    });

    this.createTexture(scene, "guardian", 94, 112, (g) => {
      g.fillStyle(0x8ca9ba).fillRoundedRect(8, 29, 78, 75, 16);
      g.fillStyle(0xdff8ff).fillCircle(47, 25, 25);
      g.fillStyle(COLORS.ice).fillCircle(38, 23, 5).fillCircle(56, 23, 5);
      g.fillStyle(COLORS.deepBlue).fillTriangle(47, 0, 34, 15, 60, 15);
      g.lineStyle(5, COLORS.ice).strokeLineShape(new Phaser.Geom.Line(16, 53, 78, 53));
    });

    this.createTexture(scene, "axe", 70, 18, (g) => {
      g.lineStyle(5, COLORS.gold).strokeLineShape(new Phaser.Geom.Line(4, 14, 58, 5));
      g.fillStyle(COLORS.snow).fillTriangle(52, 2, 68, 0, 62, 15);
    });

    this.createTexture(scene, "spear", 72, 12, (g) => {
      g.lineStyle(4, COLORS.gold).strokeLineShape(new Phaser.Geom.Line(3, 9, 57, 3));
      g.fillStyle(COLORS.ice).fillTriangle(54, 0, 72, 2, 59, 11);
    });

    this.createTexture(scene, "serpent", 150, 74, (g) => {
      g.fillStyle(0x3d7188).fillEllipse(75, 40, 140, 52);
      g.fillStyle(COLORS.ice).fillCircle(48, 33, 6).fillCircle(103, 33, 6);
      g.lineStyle(4, COLORS.gold).strokeLineShape(new Phaser.Geom.Line(25, 50, 125, 50));
    });

    this.createTexture(scene, "pickup", 24, 24, (g) => {
      g.fillStyle(COLORS.green).fillCircle(12, 12, 11);
      g.fillStyle(COLORS.snow).fillRect(9, 4, 6, 16).fillRect(4, 9, 16, 6);
    });

    this.createTexture(scene, "ground", WIDTH, 86, (g) => {
      g.fillStyle(COLORS.deepBlue).fillRect(0, GROUND_Y + 14, WIDTH, 72);
      g.fillStyle(COLORS.ice).fillRect(0, GROUND_Y + 7, WIDTH, 7);
    });
  }

  // --------------------------------------------------------------------------
  // PERSONAJES Y EQUIPO EXCLUSIVO DE ESPARTA (PARTE 1: EL PRECIO DE LA GLORIA)
  // --------------------------------------------------------------------------
  static drawSpartanBody(g, offsetX, offsetY, { wounded = false } = {}) {
    // Piernas y grebas de bronce
    g.fillStyle(0xc68e62).fillRect(offsetX + 16, offsetY + 50, 8, 22);
    g.fillStyle(0xc68e62).fillRect(offsetX + 28, offsetY + 50, 8, 22);
    g.fillStyle(SPARTA_COLORS.bronze).fillRect(offsetX + 16, offsetY + 58, 8, 12);
    g.fillStyle(SPARTA_COLORS.bronze).fillRect(offsetX + 28, offsetY + 58, 8, 12);
    // Sandalias
    g.fillStyle(0x5c3a21).fillRect(offsetX + 15, offsetY + 70, 11, 5);
    g.fillStyle(0x5c3a21).fillRect(offsetX + 27, offsetY + 70, 11, 5);

    // Túnica carmesí espartana + coraza de cuero/bronce ligero
    g.fillStyle(wounded ? 0x6e1919 : SPARTA_COLORS.crimson).fillRoundedRect(offsetX + 12, offsetY + 24, 28, 34, 5);
    g.fillStyle(0x6b4423).fillRect(offsetX + 12, offsetY + 42, 28, 6);
    g.fillStyle(SPARTA_COLORS.bronzeLight).fillRect(offsetX + 23, offsetY + 42, 6, 6);

    // Hombros y brazaletes
    g.fillStyle(0xd69d70).fillRoundedRect(offsetX + 6, offsetY + 24, 8, 22, 3);
    g.fillStyle(0xd69d70).fillRoundedRect(offsetX + 38, offsetY + 24, 8, 22, 3);
    g.fillStyle(0x5c3a21).fillRect(offsetX + 6, offsetY + 38, 8, 6);
    g.fillStyle(0x5c3a21).fillRect(offsetX + 38, offsetY + 38, 8, 6);

    // Cabeza descubierta (soldado común en casa/guardia)
    g.fillStyle(0xd69d70).fillCircle(offsetX + 26, offsetY + 14, 11);
    g.fillStyle(0x2a1d17).fillEllipse(offsetX + 25, offsetY + 7, 22, 10);
    g.fillStyle(0x2a1d17).fillRoundedRect(offsetX + 18, offsetY + 18, 16, 8, 3);
    g.fillStyle(0x1a1412).fillCircle(offsetX + 30, offsetY + 13, 1.8);
  }

  static drawHoplon(g, cx, cy, radius = 16) {
    g.fillStyle(SPARTA_COLORS.bronze).fillCircle(cx, cy, radius);
    g.fillStyle(SPARTA_COLORS.crimson).fillCircle(cx, cy, radius - 3.5);
    g.lineStyle(2, SPARTA_COLORS.bronzeLight).strokeCircle(cx, cy, radius - 1);
    // Emblema Lambda (Λ)
    g.lineStyle(2.5, SPARTA_COLORS.bronzeLight);
    g.strokeLineShape(new Phaser.Geom.Line(cx - 5, cy + 5, cx, cy - 6));
    g.strokeLineShape(new Phaser.Geom.Line(cx, cy - 6, cx + 5, cy + 5));
  }

  static drawDory(g, x1, y1, x2, y2) {
    g.lineStyle(3.5, 0x6b4423).strokeLineShape(new Phaser.Geom.Line(x1, y1, x2, y2));
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const tipX = x2 + Math.cos(angle) * 11;
    const tipY = y2 + Math.sin(angle) * 11;
    const perpX = Math.cos(angle + Math.PI / 2) * 4;
    const perpY = Math.sin(angle + Math.PI / 2) * 4;
    g.fillStyle(SPARTA_COLORS.bronzeLight);
    g.fillTriangle(x2 + perpX, y2 + perpY, tipX, tipY, x2 - perpX, y2 - perpY);
  }

  static generateSpartanCharacters(scene) {
    // 1. Soldado desarmado (inicio de Escena 1 en la puerta de casa)
    this.createTexture(scene, "spartan_unarmed", 54, 78, (g) => {
      this.drawSpartanBody(g, 1, 2);
    });

    // 2. Soldado armado con Lanza (Dory) y Escudo (Hoplón)
    this.createTexture(scene, "spartan_armed", 68, 82, (g) => {
      // Capa corta al hombro
      g.fillStyle(0x7a1212).fillTriangle(12, 26, 26, 26, 8, 58);
      this.drawSpartanBody(g, 6, 4);
      // Lanza Dory sostenida en mano derecha en diagonal hacia arriba
      this.drawDory(g, 42, 70, 56, 14);
      // Escudo Hoplón al brazo izquierdo
      this.drawHoplon(g, 33, 44, 15);
    });

    // 3. Soldado herido sin escudo (Estado 3 - listo para Escena 2.3 / 3)
    this.createTexture(scene, "spartan_wounded", 60, 76, (g) => {
      this.drawSpartanBody(g, 4, 2, { wounded: true });
      // Mancha de herida y mano sujetándose el costado
      g.fillStyle(0x880808).fillCircle(24, 40, 5);
      // Lanza usada como apoyo
      this.drawDory(g, 46, 74, 42, 12);
    });

    // 4. Esposa sin escudo (tras entregarlo)
    this.createTexture(scene, "spartan_wife", 48, 74, (g) => {
      // Peplos griego color crema y ocre
      g.fillStyle(0xf0e4ce).fillRoundedRect(12, 24, 24, 46, 6);
      g.fillStyle(0xd99b43).fillRect(14, 24, 20, 14);
      g.fillStyle(SPARTA_COLORS.terracotta).fillRect(14, 38, 20, 4);
      // Cabeza y cabello recogido
      g.fillStyle(0x3a241b).fillCircle(21, 13, 10);
      g.fillStyle(0xe2b189).fillCircle(25, 14, 9);
      g.fillStyle(0x3a241b).fillEllipse(24, 8, 18, 8);
      // Sonrisa cálida
      g.fillStyle(0x1a1412).fillCircle(28, 13, 1.4);
      g.lineStyle(1.5, 0x8c3b2b).strokeLineShape(new Phaser.Geom.Line(26, 17, 30, 16.5));
      // Brazos extendidos con calidez
      g.fillStyle(0xe2b189).fillRect(28, 28, 11, 5);
    });

    // 5. Esposa sosteniendo el Escudo Hoplón antes de entregarlo
    this.createTexture(scene, "spartan_wife_shield", 56, 74, (g) => {
      g.fillStyle(0xf0e4ce).fillRoundedRect(10, 24, 24, 46, 6);
      g.fillStyle(0xd99b43).fillRect(12, 24, 20, 14);
      g.fillStyle(SPARTA_COLORS.terracotta).fillRect(12, 38, 20, 4);
      g.fillStyle(0x3a241b).fillCircle(19, 13, 10);
      g.fillStyle(0xe2b189).fillCircle(23, 14, 9);
      g.fillStyle(0x3a241b).fillEllipse(22, 8, 18, 8);
      g.fillStyle(0x1a1412).fillCircle(26, 13, 1.4);
      this.drawHoplon(g, 37, 40, 14);
    });

    // 6. Hijo e Hija
    this.createTexture(scene, "spartan_child_boy", 32, 48, (g) => {
      g.fillStyle(0xd69d70).fillRect(10, 34, 4, 12).fillRect(18, 34, 4, 12);
      g.fillStyle(0x9c7b56).fillRoundedRect(7, 17, 18, 20, 4);
      g.fillStyle(0xd69d70).fillCircle(16, 11, 7);
      g.fillStyle(0x3a241b).fillEllipse(16, 6, 14, 6);
    });

    this.createTexture(scene, "spartan_child_girl", 32, 46, (g) => {
      g.fillStyle(0xe2b189).fillRect(10, 34, 4, 11).fillRect(18, 34, 4, 11);
      g.fillStyle(0xc86446).fillTriangle(16, 15, 5, 36, 27, 36);
      g.fillStyle(0xe2b189).fillCircle(16, 11, 7);
      g.fillStyle(0x42291e).fillCircle(14, 10, 7);
      g.fillStyle(SPARTA_COLORS.crimsonBright).fillRect(10, 5, 10, 3);
    });

    // 7. Pequeño escudo de madera de juguete (en el suelo junto a los niños)
    this.createTexture(scene, "toy_shield", 26, 26, (g) => {
      g.fillStyle(0x7c502b).fillCircle(13, 13, 11);
      g.lineStyle(2.5, 0xa87444).strokeCircle(13, 13, 10);
      g.lineStyle(2, 0xc82323);
      g.strokeLineShape(new Phaser.Geom.Line(9, 17, 13, 9));
      g.strokeLineShape(new Phaser.Geom.Line(13, 9, 17, 17));
    });

    // 8. Props independientes: Lanza Dory y Escudo Hoplón
    this.createTexture(scene, "dory_spear", 84, 14, (g) => {
      this.drawDory(g, 4, 7, 70, 7);
    });
    this.createTexture(scene, "hoplon_shield", 38, 38, (g) => {
      this.drawHoplon(g, 19, 19, 16);
    });

    // 9. El General (imponente, capa carmesí intacta, armadura ornamentada, penacho)
    this.createTexture(scene, "spartan_general", 68, 90, (g) => {
      // Capa carmesí amplia
      g.fillStyle(SPARTA_COLORS.crimsonBright).fillTriangle(26, 26, 56, 28, 6, 82);
      g.fillStyle(0x7a1212).fillTriangle(26, 26, 40, 28, 12, 76);
      // Piernas con grebas doradas
      g.fillStyle(0xc68e62).fillRect(22, 60, 8, 24).fillRect(36, 60, 8, 24);
      g.fillStyle(SPARTA_COLORS.bronzeLight).fillRect(22, 66, 8, 16).fillRect(36, 66, 8, 16);
      // Coraza muscular ornamentada de bronce dorado
      g.fillStyle(SPARTA_COLORS.bronze).fillRoundedRect(18, 28, 30, 32, 6);
      g.lineStyle(2, SPARTA_COLORS.bronzeLight).strokeRect(21, 32, 24, 18);
      g.fillStyle(SPARTA_COLORS.crimson).fillRect(18, 54, 30, 10);
      // Casco corintio con gran penacho transversal carmesí
      g.fillStyle(SPARTA_COLORS.crimsonBright).fillEllipse(33, 7, 26, 11);
      g.fillStyle(SPARTA_COLORS.bronzeLight).fillCircle(33, 18, 11);
      g.fillStyle(0x2a1d17).fillRect(24, 16, 7, 6); // Visor oscuro
      // Lanza dorada del General
      this.drawDory(g, 52, 84, 54, 12);
    });

    // 10. Soldado de la falange espartana (aliado en plaza)
    this.createTexture(scene, "spartan_ally", 60, 82, (g) => {
      g.fillStyle(SPARTA_COLORS.crimson).fillTriangle(20, 26, 36, 26, 10, 68);
      g.fillStyle(0xc68e62).fillRect(19, 54, 7, 22).fillRect(31, 54, 7, 22);
      g.fillStyle(SPARTA_COLORS.bronze).fillRoundedRect(16, 26, 26, 28, 5);
      // Casco corintio con cresta
      g.fillStyle(SPARTA_COLORS.crimsonBright).fillEllipse(29, 8, 18, 8);
      g.fillStyle(SPARTA_COLORS.bronze).fillCircle(29, 17, 10);
      g.fillStyle(0x231a16).fillRect(21, 16, 6, 5);
      this.drawDory(g, 44, 76, 48, 10);
      this.drawHoplon(g, 24, 44, 14);
    });

    // 11. Anciano guardia del pórtico
    this.createTexture(scene, "spartan_elder_guard", 52, 74, (g) => {
      g.fillStyle(0x6e6254).fillRoundedRect(14, 24, 24, 44, 6);
      g.fillStyle(SPARTA_COLORS.crimson).fillRect(14, 24, 24, 8);
      g.fillStyle(0xd0a27a).fillCircle(26, 14, 10);
      g.fillStyle(0xe5e7eb).fillRoundedRect(19, 17, 14, 12, 4); // Barba blanca
      g.fillStyle(0xe5e7eb).fillEllipse(26, 6, 18, 6);
      this.drawDory(g, 41, 70, 42, 16);
    });

    // 12. Aldeanos pacíficos
    this.createTexture(scene, "spartan_villager", 46, 72, (g) => {
      g.fillStyle(0xc8b89a).fillRoundedRect(12, 22, 22, 44, 6);
      g.fillStyle(0xd69d70).fillCircle(23, 13, 9);
      g.fillStyle(0x4b3428).fillEllipse(23, 7, 18, 6);
      // Ánfora de barro sobre el hombro
      g.fillStyle(SPARTA_COLORS.terracotta).fillEllipse(34, 22, 14, 18);
      g.fillStyle(0x8c3f26).fillRect(31, 11, 6, 4);
    });

    this.createTexture(scene, "spartan_blacksmith", 50, 74, (g) => {
      g.fillStyle(0x6b4f3a).fillRoundedRect(12, 23, 26, 46, 5);
      g.fillStyle(0xd69d70).fillCircle(25, 13, 10);
      g.fillStyle(0x2a1d17).fillRoundedRect(18, 17, 14, 7, 3);
      // Martillo de forja
      g.lineStyle(3, 0x4b3428).strokeLineShape(new Phaser.Geom.Line(36, 44, 45, 28));
      g.fillStyle(0x64748b).fillRect(40, 22, 10, 7);
    });

    // 13. Explorador herido a caballo y explorador caído
    this.createTexture(scene, "spartan_scout_horse", 112, 82, (g) => {
      // Caballo castaño galopando hacia la izquierda
      g.fillStyle(0x5c361e).fillEllipse(58, 48, 68, 28);
      g.fillStyle(0x472815).fillTriangle(26, 40, 12, 24, 28, 20); // Cuello y cabeza
      g.fillStyle(0x2e190c).fillRect(26, 20, 12, 18); // Crin
      // Patas en galope
      g.lineStyle(5, 0x472815);
      g.strokeLineShape(new Phaser.Geom.Line(34, 58, 18, 76));
      g.strokeLineShape(new Phaser.Geom.Line(44, 58, 38, 78));
      g.strokeLineShape(new Phaser.Geom.Line(74, 58, 88, 76));
      g.strokeLineShape(new Phaser.Geom.Line(84, 56, 98, 70));
      // Cola
      g.fillStyle(0x2e190c).fillTriangle(90, 44, 110, 56, 94, 56);
      // Jinete espartano herido inclinado
      g.fillStyle(0x881337).fillRoundedRect(46, 16, 22, 26, 5);
      g.fillStyle(0xd69d70).fillCircle(50, 12, 8);
      g.fillStyle(0x991b1b).fillCircle(56, 26, 5); // Herida de flecha/sangre
    });

    this.createTexture(scene, "spartan_scout_fallen", 76, 46, (g) => {
      g.fillStyle(0x881337).fillRoundedRect(14, 16, 34, 20, 5);
      g.fillStyle(0xc68e62).fillRect(44, 24, 24, 12);
      g.fillStyle(0xd69d70).fillCircle(14, 18, 9);
      g.fillStyle(0x991b1b).fillCircle(28, 24, 6);
    });
  }

  // --------------------------------------------------------------------------
  // ENTORNO DE ESPARTA (HOGAR, SENDEROS, PÓRTICO Y PLAZA)
  // --------------------------------------------------------------------------
  static generateSpartanEnvironment(scene) {
    // Suelo de sendero de tierra cálida y piedra
    this.createTexture(scene, "spartan_ground", 512, 100, (g) => {
      g.fillStyle(SPARTA_COLORS.earthDark).fillRect(0, 16, 512, 84);
      g.fillStyle(SPARTA_COLORS.sandPath).fillRect(0, 8, 512, 12);
      g.fillStyle(SPARTA_COLORS.oliveLeaf).fillRect(0, 4, 512, 5);
      // Piedras y texturas sutiles en el camino
      g.fillStyle(0x9b7b4e);
      for (let i = 0; i < 14; i++) {
        g.fillRoundedRect((i * 39) % 490, 20 + (i % 4) * 14, 18 + (i % 3) * 8, 6, 2);
      }
    });

    // Suelo empedrado de la plaza de armas
    this.createTexture(scene, "plaza_ground", 512, 100, (g) => {
      g.fillStyle(0x635d54).fillRect(0, 10, 512, 90);
      g.fillStyle(0xb5a895).fillRect(0, 4, 512, 10);
      g.lineStyle(2, 0x4b463f);
      for (let i = 0; i < 8; i++) {
        g.strokeRect(i * 64, 10, 64, 24);
      }
    });

    // Casa del Soldado (con puerta abierta, techo de tejas, escudo decorativo)
    this.createTexture(scene, "spartan_house", 240, 190, (g) => {
      // Muros de piedra cálida
      g.fillStyle(SPARTA_COLORS.limestone).fillRect(20, 64, 200, 126);
      g.fillStyle(0xd2c4aa).fillRect(20, 166, 200, 24);
      // Techo de terracota
      g.fillStyle(SPARTA_COLORS.terracotta).fillTriangle(4, 68, 120, 12, 236, 68);
      g.lineStyle(3, 0x8c3f26).strokeTriangle(4, 68, 120, 12, 236, 68);
      // Puerta principal de madera
      g.fillStyle(0x52341e).fillRoundedRect(54, 102, 52, 88, { tl: 8, tr: 8, bl: 0, br: 0 });
      g.fillStyle(0x3a2414).fillRect(60, 108, 40, 82);
      // Ventana con postigo
      g.fillStyle(0x4a3120).fillRect(144, 96, 44, 42);
      g.fillStyle(0xf6d38b, 0.45).fillRect(150, 102, 32, 30);
    });

    // Casa de aldeano para el camino
    this.createTexture(scene, "spartan_village_house", 200, 165, (g) => {
      g.fillStyle(0xded1b8).fillRect(16, 56, 168, 109);
      g.fillStyle(SPARTA_COLORS.terracotta).fillTriangle(4, 60, 100, 10, 196, 60);
      g.fillStyle(0x5a3a22).fillRect(80, 98, 40, 67);
      g.fillStyle(0x4a3120).fillRect(36, 86, 28, 28);
      g.fillStyle(0x4a3120).fillRect(136, 86, 28, 28);
    });

    // Árbol de olivo mediterráneo
    this.createTexture(scene, "olive_tree", 114, 164, (g) => {
      g.fillStyle(0x59412c).fillRect(48, 86, 18, 78);
      g.fillStyle(0x59412c).fillTriangle(48, 96, 26, 68, 56, 88);
      g.fillStyle(0x59412c).fillTriangle(64, 96, 88, 68, 58, 88);
      g.fillStyle(SPARTA_COLORS.oliveDark).fillCircle(57, 62, 38);
      g.fillStyle(SPARTA_COLORS.oliveLeaf).fillCircle(38, 54, 26);
      g.fillStyle(SPARTA_COLORS.oliveLeaf).fillCircle(76, 56, 25);
      g.fillStyle(0x739652).fillCircle(56, 38, 26);
    });

    // Pozo del pueblo
    this.createTexture(scene, "spartan_well", 74, 70, (g) => {
      g.fillStyle(0x8b8275).fillRoundedRect(10, 36, 54, 34, 4);
      g.fillStyle(0x5c3a21).fillRect(14, 10, 6, 30).fillRect(54, 10, 6, 30);
      g.fillStyle(SPARTA_COLORS.terracotta).fillTriangle(6, 14, 37, 0, 68, 14);
    });

    // Pórtico de vigilancia (puesto que el protagonista debe cuidar)
    this.createTexture(scene, "watchpost_arch", 176, 196, (g) => {
      // Columnas de piedra
      g.fillStyle(0xb5a68e).fillRect(16, 46, 28, 150);
      g.fillStyle(0xb5a68e).fillRect(132, 46, 28, 150);
      // Dintel superior y almenas
      g.fillStyle(0x9e8f77).fillRect(4, 24, 168, 30);
      g.fillStyle(0xb5a68e).fillRect(12, 8, 28, 16).fillRect(74, 8, 28, 16).fillRect(136, 8, 28, 16);
      // Escudo ceremonial central en el arco
      this.drawHoplon(g, 88, 39, 13);
    });

    // Estandarte espartano (Lambda)
    this.createTexture(scene, "spartan_banner", 40, 138, (g) => {
      g.fillStyle(0x5c3a21).fillRect(18, 12, 4, 126);
      g.fillStyle(SPARTA_COLORS.bronzeLight).fillTriangle(20, 0, 14, 14, 26, 14);
      g.fillStyle(SPARTA_COLORS.crimsonBright).fillRect(6, 22, 28, 66);
      g.fillStyle(SPARTA_COLORS.crimson).fillTriangle(6, 88, 20, 74, 34, 88);
      g.lineStyle(2.5, SPARTA_COLORS.bronzeLight);
      g.strokeLineShape(new Phaser.Geom.Line(13, 62, 20, 42));
      g.strokeLineShape(new Phaser.Geom.Line(20, 42, 27, 62));
    });
  }

  // --------------------------------------------------------------------------
  // RETRATOS PARA VIÑETAS DE CÓMIC
  // --------------------------------------------------------------------------
  static generateComicPortraits(scene) {
    // Retrato Esposa sonriendo
    this.createTexture(scene, "portrait_wife", 72, 72, (g) => {
      g.fillStyle(0xf3d499).fillRect(0, 0, 72, 72);
      g.fillStyle(0xd99b43).fillCircle(36, 72, 26);
      g.fillStyle(0x3a241b).fillCircle(33, 30, 18);
      g.fillStyle(0xe2b189).fillCircle(37, 32, 16);
      g.fillStyle(0x3a241b).fillEllipse(36, 20, 32, 14);
      g.fillStyle(0x1a1412).fillCircle(33, 31, 2).fillCircle(43, 31, 2);
      g.lineStyle(2, 0x8c3b2b).strokeLineShape(new Phaser.Geom.Line(33, 39, 41, 39));
    });

    // Retrato Soldado determinado / golpeando pecho
    this.createTexture(scene, "portrait_soldier", 72, 72, (g) => {
      g.fillStyle(0xd8c3a5).fillRect(0, 0, 72, 72);
      g.fillStyle(SPARTA_COLORS.crimson).fillCircle(36, 74, 28);
      g.fillStyle(0xd69d70).fillCircle(36, 32, 17);
      g.fillStyle(0x2a1d17).fillEllipse(36, 18, 34, 14);
      g.fillStyle(0x2a1d17).fillRoundedRect(24, 36, 24, 13, 5);
      // Cejas decididas
      g.lineStyle(2.5, 0x1a1412);
      g.strokeLineShape(new Phaser.Geom.Line(27, 26, 34, 28));
      g.strokeLineShape(new Phaser.Geom.Line(45, 26, 38, 28));
      g.fillStyle(0x1a1412).fillCircle(31, 30, 2).fillCircle(41, 30, 2);
    });

    // Retrato Soldado pensativo (mirando el horizonte)
    this.createTexture(scene, "portrait_soldier_thought", 72, 72, (g) => {
      g.fillStyle(0xb6c7d6).fillRect(0, 0, 72, 72);
      g.fillStyle(SPARTA_COLORS.crimson).fillCircle(30, 74, 28);
      g.fillStyle(0xd69d70).fillCircle(34, 33, 17);
      g.fillStyle(0x2a1d17).fillEllipse(33, 19, 32, 14);
      g.fillStyle(0x2a1d17).fillRoundedRect(26, 38, 20, 12, 4);
      g.fillStyle(0x1a1412).fillCircle(42, 31, 2);
      g.lineStyle(2, 0x4b3428).strokeLineShape(new Phaser.Geom.Line(37, 26, 46, 26));
    });

    // Retrato General: mirada fiera
    this.createTexture(scene, "portrait_general_fierce", 72, 72, (g) => {
      g.fillStyle(0x6b1414).fillRect(0, 0, 72, 72);
      g.fillStyle(SPARTA_COLORS.crimsonBright).fillEllipse(36, 10, 44, 16);
      g.fillStyle(SPARTA_COLORS.bronzeLight).fillRoundedRect(18, 18, 36, 42, 12);
      g.fillStyle(0x1a1412).fillRect(24, 30, 24, 10);
      g.fillStyle(0xffffff).fillCircle(30, 35, 2.2).fillCircle(42, 35, 2.2);
      g.lineStyle(2.5, 0x1a1412);
      g.strokeLineShape(new Phaser.Geom.Line(25, 29, 34, 33));
      g.strokeLineShape(new Phaser.Geom.Line(47, 29, 38, 33));
    });

    // Retrato General: frunciendo el ceño
    this.createTexture(scene, "portrait_general_frown", 72, 72, (g) => {
      g.fillStyle(0x4b3a32).fillRect(0, 0, 72, 72);
      g.fillStyle(SPARTA_COLORS.crimson).fillEllipse(36, 10, 40, 14);
      g.fillStyle(SPARTA_COLORS.bronze).fillRoundedRect(18, 18, 36, 42, 12);
      g.fillStyle(0x1a1412).fillRect(24, 31, 24, 9);
      g.fillStyle(0xffe49e).fillCircle(30, 35, 2).fillCircle(42, 35, 2);
      g.lineStyle(2.5, 0x1a1412).strokeLineShape(new Phaser.Geom.Line(28, 49, 44, 49));
    });

    // Retrato General: sonrisa arrogante
    this.createTexture(scene, "portrait_general_smirk", 72, 72, (g) => {
      g.fillStyle(0x523018).fillRect(0, 0, 72, 72);
      g.fillStyle(SPARTA_COLORS.crimsonBright).fillEllipse(36, 10, 42, 15);
      g.fillStyle(SPARTA_COLORS.bronzeLight).fillRoundedRect(18, 18, 36, 42, 12);
      g.fillStyle(0x1a1412).fillRect(24, 30, 24, 9);
      g.fillStyle(0xffffff).fillCircle(30, 34, 2).fillCircle(42, 34, 2);
      g.lineStyle(2, 0x1a1412).strokeLineShape(new Phaser.Geom.Line(30, 49, 44, 45));
    });
  }

  // --------------------------------------------------------------------------
  // PARTÍCULAS AMBIENTALES
  // --------------------------------------------------------------------------
  static generateParticles(scene) {
    this.createTexture(scene, "sun_mote", 10, 10, (g) => {
      g.fillStyle(0xffe9a3, 0.45).fillCircle(5, 5, 5);
      g.fillStyle(0xffffff, 0.9).fillCircle(5, 5, 2);
    });

    this.createTexture(scene, "dust_puff", 18, 18, (g) => {
      g.fillStyle(0xd9c29c, 0.75).fillCircle(9, 9, 8);
    });

    this.createTexture(scene, "olive_leaf", 10, 6, (g) => {
      g.fillStyle(SPARTA_COLORS.oliveLeaf).fillEllipse(5, 3, 10, 5);
    });
  }

  // --------------------------------------------------------------------------
  // TEXTURAS DE ESCENA 2: EL BARRO, LA LANZA Y LA CAÍDA (DESFILADERO Y ARGOS)
  // --------------------------------------------------------------------------
  static generateEscena2Textures(scene) {
    // Estados de combate / herida del Soldado Espartano
    this.createTexture(scene, "spartan_armed_guard", 68, 82, (g) => {
      g.fillStyle(0x7a1212).fillTriangle(10, 26, 24, 26, 6, 58);
      this.drawSpartanBody(g, 5, 4);
      this.drawDory(g, 26, 60, 56, 22);
      // Hoplón alzado firme al frente en Guardia Férrea
      this.drawHoplon(g, 48, 42, 16);
    });

    this.createTexture(scene, "spartan_armed_thrust", 84, 82, (g) => {
      g.fillStyle(0x7a1212).fillTriangle(8, 28, 22, 28, 4, 58);
      this.drawSpartanBody(g, 4, 4);
      // Lanza extendida en estocada frontal recta
      this.drawDory(g, 24, 38, 72, 38);
      this.drawHoplon(g, 30, 46, 14);
    });

    this.createTexture(scene, "spartan_kneeling_wounded", 64, 66, (g) => {
      // Rodillas en el barro, sosteniéndose herida en la espalda
      g.fillStyle(0x6e1919).fillRoundedRect(16, 24, 28, 24, 5);
      g.fillStyle(0xc68e62).fillRect(14, 44, 14, 16).fillRect(34, 46, 16, 14);
      g.fillStyle(0xd69d70).fillCircle(30, 15, 10);
      g.fillStyle(0x2a1d17).fillEllipse(29, 9, 20, 9);
      g.fillStyle(GORGE_COLORS.bloodRed).fillCircle(20, 34, 7);
      // Lanza caída junto a él
      this.drawDory(g, 8, 56, 56, 54);
    });

    this.createTexture(scene, "spartan_wounded_duck", 62, 56, (g) => {
      // Agachado cubriéndose de flechas
      g.fillStyle(0x6e1919).fillRoundedRect(14, 18, 28, 22, 6);
      g.fillStyle(0xc68e62).fillRect(14, 36, 12, 16).fillRect(32, 36, 12, 16);
      g.fillStyle(0xd69d70).fillCircle(32, 13, 10);
      g.fillStyle(0x2a1d17).fillEllipse(31, 7, 20, 8);
      g.fillStyle(GORGE_COLORS.bloodRed).fillCircle(22, 28, 5);
      this.drawDory(g, 10, 44, 56, 26);
    });

    // Helper para dibujar soldados de Argos (túnica azul grisácea, casco/armadura de hierro)
    const drawArgosBase = (g, ox, oy, withShield = false, isArcher = false, isLancer = false) => {
      g.fillStyle(GORGE_COLORS.argosCape).fillTriangle(ox + 18, oy + 24, ox + 36, oy + 24, ox + 42, oy + 62);
      g.fillStyle(0xb5855c).fillRect(ox + 16, oy + 50, 8, 22).fillRect(ox + 28, oy + 50, 8, 22);
      g.fillStyle(0x475569).fillRect(ox + 16, oy + 58, 8, 12).fillRect(ox + 28, oy + 58, 8, 12);
      g.fillStyle(GORGE_COLORS.argosBlue).fillRoundedRect(ox + 12, oy + 24, 28, 32, 5);
      g.fillStyle(GORGE_COLORS.argosIron).fillRect(ox + 14, oy + 26, 24, 18);
      // Casco de hierro argivo con cresta azul oscura
      g.fillStyle(0x1e3a5f).fillEllipse(ox + 26, oy + 6, 18, 7);
      g.fillStyle(GORGE_COLORS.argosIron).fillCircle(ox + 26, oy + 14, 10);
      g.fillStyle(0x0f172a).fillRect(ox + 17, oy + 13, 6, 5);

      if (isArcher) {
        g.lineStyle(3, 0x5c3a21).strokeCircle(ox + 12, oy + 36, 14);
        g.lineStyle(1, 0xe2e8f0).strokeLineShape(new Phaser.Geom.Line(ox + 14, oy + 22, ox + 14, oy + 50));
      } else if (isLancer) {
        g.lineStyle(3, 0x4b3428).strokeLineShape(new Phaser.Geom.Line(ox + 4, oy + 42, ox + 58, oy + 30));
        g.fillStyle(0xcbd5e1).fillTriangle(ox + 4, oy + 38, ox - 8, oy + 43, ox + 4, oy + 46);
      } else {
        // Espada corta de hierro
        g.fillStyle(0xcbd5e1).fillTriangle(ox + 2, oy + 38, ox + 16, oy + 34, ox + 16, oy + 42);
      }

      if (withShield) {
        g.fillStyle(0x334155).fillCircle(ox + 16, oy + 42, 15);
        g.lineStyle(2.5, 0x94a3b8).strokeCircle(ox + 16, oy + 42, 14);
        g.lineStyle(2, 0x38bdf8).strokeLineShape(new Phaser.Geom.Line(ox + 11, oy + 36, ox + 21, oy + 48));
      }
    };

    this.createTexture(scene, "argos_soldier", 58, 78, (g) => drawArgosBase(g, 4, 2));
    this.createTexture(scene, "argos_shield_bearer", 62, 80, (g) => drawArgosBase(g, 6, 4, true, false, false));
    this.createTexture(scene, "argos_lancer", 68, 80, (g) => drawArgosBase(g, 10, 4, false, false, true));
    this.createTexture(scene, "argos_archer", 54, 76, (g) => drawArgosBase(g, 4, 2, false, true, false));

    this.createTexture(scene, "argos_arrow", 36, 10, (g) => {
      g.lineStyle(2.5, 0x7c5836).strokeLineShape(new Phaser.Geom.Line(6, 5, 32, 5));
      g.fillStyle(0xcbd5e1).fillTriangle(0, 5, 9, 1, 9, 9);
      g.fillStyle(0x38bdf8).fillRect(28, 2, 6, 6);
    });

    // Suelo de barro y utilería del desfiladero
    this.createTexture(scene, "gorge_mud_ground", 512, 100, (g) => {
      g.fillStyle(GORGE_COLORS.mudDark).fillRect(0, 12, 512, 88);
      g.fillStyle(GORGE_COLORS.mudTop).fillRect(0, 4, 512, 12);
      g.fillStyle(0x261c15);
      for (let i = 0; i < 16; i++) {
        g.fillEllipse((i * 41) % 490, 22 + (i % 4) * 14, 34, 10);
      }
    });

    this.createTexture(scene, "broken_shield", 36, 20, (g) => {
      g.fillStyle(SPARTA_COLORS.bronze).fillEllipse(18, 12, 32, 14);
      g.fillStyle(SPARTA_COLORS.crimson).fillEllipse(18, 12, 24, 9);
      g.lineStyle(3, 0x1a1412).strokeLineShape(new Phaser.Geom.Line(14, 4, 22, 18));
    });

    this.createTexture(scene, "stuck_spear", 24, 66, (g) => {
      g.lineStyle(3.5, 0x5c3a21).strokeLineShape(new Phaser.Geom.Line(6, 6, 18, 64));
      g.fillStyle(0x94a3b8).fillTriangle(4, 0, 11, 10, 2, 12);
    });

    this.createTexture(scene, "fallen_spartan_body", 76, 36, (g) => {
      g.fillStyle(0x5c1111).fillRoundedRect(14, 12, 36, 18, 5);
      g.fillStyle(0xc68e62).fillRect(46, 16, 20, 10);
      g.fillStyle(SPARTA_COLORS.bronze).fillCircle(14, 18, 8);
      g.fillStyle(GORGE_COLORS.bloodRed).fillEllipse(34, 28, 44, 9);
    });

    this.createTexture(scene, "fallen_argos_body", 76, 36, (g) => {
      g.fillStyle(GORGE_COLORS.argosBlue).fillRoundedRect(14, 12, 36, 18, 5);
      g.fillStyle(0xb5855c).fillRect(46, 16, 20, 10);
      g.fillStyle(GORGE_COLORS.argosIron).fillCircle(14, 18, 8);
      g.fillStyle(GORGE_COLORS.bloodRed).fillEllipse(32, 28, 38, 8);
    });

    // Partículas de lluvia, ceniza, barro, chispas y sangre
    this.createTexture(scene, "rain_drop", 4, 20, (g) => {
      g.lineStyle(1.8, GORGE_COLORS.rainBlue, 0.75).strokeLineShape(new Phaser.Geom.Line(3, 0, 1, 19));
    });
    this.createTexture(scene, "ash_mote", 8, 8, (g) => {
      g.fillStyle(GORGE_COLORS.ashGrey, 0.7).fillCircle(4, 4, 3);
    });
    this.createTexture(scene, "mud_splash", 12, 12, (g) => {
      g.fillStyle(0x5c4635, 0.85).fillCircle(6, 6, 5);
    });
    this.createTexture(scene, "blood_splat", 14, 14, (g) => {
      g.fillStyle(GORGE_COLORS.bloodRed, 0.9).fillCircle(7, 7, 6);
    });
    this.createTexture(scene, "spark_clank", 14, 14, (g) => {
      g.fillStyle(0xffe082, 0.95).fillCircle(7, 7, 4);
      g.lineStyle(2, 0xffffff).strokeLineShape(new Phaser.Geom.Line(1, 7, 13, 7));
      g.lineStyle(2, 0xffffff).strokeLineShape(new Phaser.Geom.Line(7, 1, 7, 13));
    });

    // Cinemática Hito 2.2: Plano Primera Persona 3D al ras del suelo
    const drawFPGeneralBase = (g, { impaled = false, kneeling = false } = {}) => {
      const yShift = kneeling ? 38 : 0;
      // Capa carmesí desgarrada
      g.fillStyle(0x7f1313).fillTriangle(95, 58 + yShift, 18, 228, 172, 228);
      // Cuerpo / coraza ornamentada de bronce manchada
      g.fillStyle(SPARTA_COLORS.bronze).fillRoundedRect(54, 58 + yShift, 82, 102, 16);
      g.lineStyle(3, SPARTA_COLORS.bronzeLight).strokeRect(64, 72 + yShift, 62, 54);
      g.fillStyle(GORGE_COLORS.bloodRed, 0.7).fillCircle(78, 96 + yShift, 12);
      // Casco corintio y gran penacho
      g.fillStyle(SPARTA_COLORS.crimsonBright).fillEllipse(95, 16 + yShift, 58, 22);
      g.fillStyle(SPARTA_COLORS.bronzeLight).fillCircle(95, 38 + yShift, 22);
      g.fillStyle(0x140f0d).fillRect(80, 33 + yShift, 30, 12);
      g.fillStyle(0xffffff).fillCircle(88, 39 + yShift, 2.5).fillCircle(102, 39 + yShift, 2.5);
      // Piernas o rodillas
      if (!kneeling) {
        g.fillStyle(0xb58057).fillRect(62, 160, 22, 92).fillRect(106, 160, 22, 92);
        g.fillStyle(SPARTA_COLORS.bronze).fillRect(62, 198, 22, 42).fillRect(106, 198, 22, 42);
      } else {
        g.fillStyle(0xb58057).fillRect(58, 162 + yShift - 18, 74, 34);
      }
      // Mano ensangrentada extendida hacia el jugador (cámara)
      if (!impaled) {
        g.fillStyle(0xc68e62).fillRoundedRect(118, 94 + yShift, 52, 24, 8);
        g.fillStyle(GORGE_COLORS.bloodRed).fillCircle(154, 106 + yShift, 11);
      } else {
        // Punta de lanza argiva atravesando brutalmente el pecho desde atrás
        g.lineStyle(7, 0x3f2c1e).strokeLineShape(new Phaser.Geom.Line(95, 92 + yShift, 152, 72 + yShift));
        g.fillStyle(0xe2e8f0).fillTriangle(86, 86 + yShift, 102, 122 + yShift, 118, 92 + yShift);
        g.fillStyle(GORGE_COLORS.bloodRed).fillCircle(98, 98 + yShift, 18);
      }
    };

    this.createTexture(scene, "fp_general_approach", 190, 270, (g) => drawFPGeneralBase(g));
    this.createTexture(scene, "fp_general_impaled", 190, 270, (g) => drawFPGeneralBase(g, { impaled: true }));
    this.createTexture(scene, "fp_general_kneeling", 190, 220, (g) => drawFPGeneralBase(g, { impaled: true, kneeling: true }));

    this.createTexture(scene, "fp_general_dead", 220, 120, (g) => {
      g.fillStyle(GORGE_COLORS.bloodRed, 0.88).fillEllipse(110, 88, 175, 42);
      g.fillStyle(0x7a1212).fillRoundedRect(26, 48, 148, 46, 14);
      g.fillStyle(SPARTA_COLORS.bronze).fillRoundedRect(54, 38, 86, 44, 12);
      g.fillStyle(SPARTA_COLORS.bronzeLight).fillCircle(156, 58, 22);
      g.fillStyle(SPARTA_COLORS.crimsonBright).fillEllipse(164, 38, 36, 14);
    });

    this.createTexture(scene, "fp_player_hand", 110, 130, (g) => {
      g.fillStyle(0xb58057).fillRoundedRect(20, 44, 48, 86, 14);
      g.fillStyle(0x5c3a21).fillRect(20, 76, 48, 24);
      g.fillStyle(0xc68e62).fillCircle(44, 36, 22);
      g.fillStyle(0xc68e62).fillRect(24, 8, 8, 28).fillRect(36, 4, 8, 30).fillRect(48, 8, 8, 28);
      g.fillStyle(GORGE_COLORS.bloodRed, 0.65).fillCircle(40, 56, 14);
    });

    // Retrato del Soldado en estado de shock (Hito 2.2)
    this.createTexture(scene, "portrait_soldier_shock", 72, 72, (g) => {
      g.fillStyle(0x2d1a1a).fillRect(0, 0, 72, 72);
      g.fillStyle(0x6e1919).fillCircle(36, 74, 28);
      g.fillStyle(0xc6936c).fillCircle(36, 33, 17);
      g.fillStyle(0x2a1d17).fillEllipse(36, 19, 34, 13);
      g.fillStyle(0x2a1d17).fillRoundedRect(24, 39, 24, 12, 4);
      // Ojos muy abiertos en shock
      g.fillStyle(0xffffff).fillCircle(30, 30, 4.5).fillCircle(42, 30, 4.5);
      g.fillStyle(0x111111).fillCircle(30, 30, 1.8).fillCircle(42, 30, 1.8);
      // Salpicaduras de barro y sangre
      g.fillStyle(GORGE_COLORS.bloodRed, 0.75).fillCircle(44, 40, 3.5);
      g.fillStyle(0x4d3c2f, 0.7).fillCircle(24, 35, 3);
    });
  }

  // --------------------------------------------------------------------------
  // TEXTURAS DE ESCENA 3: CENIZAS DEL DEBER (PUEBLO EN LLAMAS Y HITO 3.3)
  // --------------------------------------------------------------------------
  static generateEscena3Textures(scene) {
    // Estado 4: Soldado en sprint desesperado herido (hacia la derecha base; flipX hacia la izquierda)
    this.createTexture(scene, "spartan_desperate_sprint", 66, 76, (g) => {
      g.fillStyle(0x5c1111).fillTriangle(4, 24, 22, 24, 0, 56);
      this.drawSpartanBody(g, 8, 2, { wounded: true });
      g.fillStyle(GORGE_COLORS.bloodRed).fillCircle(28, 38, 6);
      // Lanza sujeta en diagonal mientras corre desesperado
      this.drawDory(g, 14, 52, 60, 18);
    });

    // Suelo calcinado del pueblo y plaza saqueada
    this.createTexture(scene, "spartan_ground_burned", 512, 100, (g) => {
      g.fillStyle(0x1f1916).fillRect(0, 14, 512, 86);
      g.fillStyle(0x3a2b22).fillRect(0, 6, 512, 10);
      g.fillStyle(0x120e0d);
      for (let i = 0; i < 16; i++) {
        g.fillEllipse((i * 37) % 490, 22 + (i % 4) * 14, 28, 9);
      }
      g.fillStyle(ASHES_COLORS.emberOrange, 0.4);
      for (let e = 0; e < 8; e++) {
        g.fillCircle((e * 67 + 20) % 495, 16 + (e % 3) * 10, 2.2);
      }
    });

    this.createTexture(scene, "plaza_ground_burned", 512, 100, (g) => {
      g.fillStyle(0x282321).fillRect(0, 10, 512, 90);
      g.fillStyle(0x4a403a).fillRect(0, 4, 512, 10);
      g.lineStyle(2, 0x161211);
      for (let i = 0; i < 8; i++) {
        g.strokeRect(i * 64, 10, 64, 24);
      }
    });

    // Casa del Soldado en llamas y umbral carbonizado
    this.createTexture(scene, "spartan_house_burned", 240, 190, (g) => {
      g.fillStyle(0x544a42).fillRect(20, 74, 200, 116);
      g.fillStyle(0x2b2420).fillRect(20, 162, 200, 28);
      // Techo colapsado y vigas quemadas
      g.fillStyle(ASHES_COLORS.charredWood).fillTriangle(8, 78, 92, 26, 178, 78);
      g.fillStyle(0x2a1b14).fillTriangle(110, 78, 178, 42, 232, 78);
      g.lineStyle(4, 0x120d0a);
      g.strokeLineShape(new Phaser.Geom.Line(18, 76, 112, 22));
      g.strokeLineShape(new Phaser.Geom.Line(132, 48, 226, 76));
      // Resplandor de brasas tras el umbral quemado
      g.fillStyle(0x160e0b).fillRoundedRect(54, 102, 52, 88, { tl: 8, tr: 8, bl: 0, br: 0 });
      g.fillStyle(ASHES_COLORS.emberOrange, 0.36).fillRect(60, 110, 40, 80);
      // Ventana humeante
      g.fillStyle(0x171210).fillRect(144, 96, 44, 42);
      g.fillStyle(ASHES_COLORS.emberOrange, 0.25).fillRect(150, 102, 32, 30);
    });

    // Casa de aldeano colapsada y quemada
    this.createTexture(scene, "spartan_village_house_burned", 200, 165, (g) => {
      g.fillStyle(0x4c433c).fillRect(16, 66, 168, 99);
      g.fillStyle(ASHES_COLORS.charredWood).fillTriangle(6, 70, 72, 24, 152, 70);
      g.fillStyle(0x1a1412).fillRect(80, 98, 40, 67);
      g.fillStyle(ASHES_COLORS.emberOrange, 0.3).fillRect(84, 104, 32, 61);
      g.fillStyle(0x1a1412).fillRect(36, 86, 28, 28).fillRect(136, 86, 28, 28);
    });

    // Olivo calcinado
    this.createTexture(scene, "olive_tree_burned", 114, 164, (g) => {
      g.fillStyle(0x211915).fillRect(48, 80, 18, 84);
      g.lineStyle(5, 0x1a1412);
      g.strokeLineShape(new Phaser.Geom.Line(54, 88, 28, 48));
      g.strokeLineShape(new Phaser.Geom.Line(58, 84, 86, 44));
      g.strokeLineShape(new Phaser.Geom.Line(56, 72, 56, 24));
    });

    // Pozo destrozado
    this.createTexture(scene, "spartan_well_burned", 74, 70, (g) => {
      g.fillStyle(0x4b443e).fillRoundedRect(10, 36, 54, 34, 4);
      g.lineStyle(4, 0x211915).strokeLineShape(new Phaser.Geom.Line(16, 36, 24, 14));
      g.strokeLineShape(new Phaser.Geom.Line(56, 36, 48, 20));
    });

    // Pórtico de vigilancia chamuscado y roto
    this.createTexture(scene, "watchpost_arch_burned", 176, 196, (g) => {
      g.fillStyle(0x4b433b).fillRect(16, 46, 28, 150);
      g.fillStyle(0x4b433b).fillRect(132, 54, 28, 142);
      g.fillStyle(0x3a332d).fillRect(4, 28, 168, 26);
      g.fillStyle(0x161211, 0.65).fillCircle(88, 40, 20);
      g.lineStyle(3, 0x161211).strokeLineShape(new Phaser.Geom.Line(44, 30, 112, 52));
    });

    // Estandarte quebrado y quemado de la plaza
    this.createTexture(scene, "broken_banner_pole", 40, 138, (g) => {
      g.fillStyle(0x2c1d14).fillRect(18, 48, 4, 90);
      g.fillStyle(0x4b1212).fillTriangle(10, 56, 28, 52, 16, 98);
    });

    // Cajas y ánforas saqueadas
    this.createTexture(scene, "looted_crate", 52, 34, (g) => {
      g.fillStyle(0x422b1b).fillRect(4, 12, 26, 20);
      g.lineStyle(2, 0x1c120b).strokeRect(4, 12, 26, 20);
      g.fillStyle(0x8c3f26).fillEllipse(38, 24, 18, 12);
      g.fillStyle(0x161211).fillCircle(32, 24, 4);
    });

    // Cuerpos sin vida de ancianos guardias, aldeanos y escudo de juguete partido
    this.createTexture(scene, "elder_guard_dead", 76, 40, (g) => {
      g.fillStyle(GORGE_COLORS.bloodRed, 0.8).fillEllipse(38, 32, 46, 10);
      g.fillStyle(0x4b4339).fillRoundedRect(16, 14, 34, 18, 5);
      g.fillStyle(0xd0a27a).fillCircle(14, 20, 8);
      g.fillStyle(0xe5e7eb).fillEllipse(12, 26, 12, 8);
      g.fillStyle(0xc68e62).fillRect(48, 20, 20, 8);
    });

    this.createTexture(scene, "fallen_villager", 72, 36, (g) => {
      g.fillStyle(GORGE_COLORS.bloodRed, 0.75).fillEllipse(34, 28, 40, 8);
      g.fillStyle(0x6e6252).fillRoundedRect(14, 12, 32, 16, 5);
      g.fillStyle(0xd69d70).fillCircle(14, 18, 7);
    });

    this.createTexture(scene, "toy_shield_broken", 34, 26, (g) => {
      // Dos mitades del escudo de madera de juguete manchadas de ceniza
      g.fillStyle(0x52341c).fillEllipse(10, 14, 16, 18);
      g.fillStyle(0x4a2f19).fillEllipse(24, 16, 14, 16);
      g.fillStyle(0x1f1d1c, 0.65).fillCircle(14, 14, 7);
      g.lineStyle(2, 0x8f1d1d).strokeLineShape(new Phaser.Geom.Line(7, 17, 12, 9));
      g.strokeLineShape(new Phaser.Geom.Line(22, 10, 27, 19));
    });

    // Partículas de llamas, brasas y humo denso
    this.createTexture(scene, "fire_flame", 22, 30, (g) => {
      g.fillStyle(ASHES_COLORS.emberOrange, 0.78).fillEllipse(11, 19, 18, 20);
      g.fillStyle(ASHES_COLORS.emberBright, 0.9).fillEllipse(11, 21, 9, 13);
    });

    this.createTexture(scene, "ember_spark", 8, 8, (g) => {
      g.fillStyle(ASHES_COLORS.emberOrange, 0.9).fillCircle(4, 4, 3.5);
      g.fillStyle(ASHES_COLORS.emberBright, 1).fillCircle(4, 4, 1.5);
    });

    this.createTexture(scene, "black_smoke", 48, 48, (g) => {
      g.fillStyle(ASHES_COLORS.smokeDark, 0.55).fillCircle(24, 24, 21);
      g.fillStyle(0x272326, 0.45).fillCircle(19, 20, 14);
    });

    // Cinemática Final Hito 3.3 (Vista de espalda y tabla familiar en cenizas)
    this.createTexture(scene, "fp3_soldier_back", 120, 164, (g) => {
      // Piernas firmes deteniéndose en el umbral
      g.fillStyle(0x9f714c).fillRect(36, 102, 16, 56).fillRect(68, 102, 16, 56);
      g.fillStyle(SPARTA_COLORS.bronze).fillRect(36, 126, 16, 26).fillRect(68, 126, 16, 26);
      // Capa desgarrada y espalda manchada
      g.fillStyle(0x5b1012).fillTriangle(30, 38, 90, 38, 22, 138);
      g.fillStyle(0x6e1919).fillRoundedRect(28, 38, 64, 72, 12);
      g.fillStyle(GORGE_COLORS.bloodRed, 0.8).fillCircle(46, 68, 13);
      // Cabeza y nuca desde atrás
      g.fillStyle(0x231712).fillCircle(60, 24, 20);
      // Lanza sujeta en mano derecha
      this.drawDory(g, 92, 152, 104, 14);
    });

    this.createTexture(scene, "fp3_soldier_kneeling", 120, 118, (g) => {
      g.fillStyle(0x5b1012).fillTriangle(32, 30, 88, 30, 24, 108);
      g.fillStyle(0x6e1919).fillRoundedRect(32, 30, 56, 58, 12);
      g.fillStyle(GORGE_COLORS.bloodRed, 0.8).fillCircle(48, 56, 12);
      g.fillStyle(0x9f714c).fillRect(28, 82, 64, 28);
      g.fillStyle(0x231712).fillCircle(60, 18, 18);
    });

    this.createTexture(scene, "fp3_family_bodies", 240, 96, (g) => {
      // Ceniza en el suelo
      g.fillStyle(0x2b2726, 0.75).fillEllipse(120, 68, 220, 44);
      // Esposa caída
      g.fillStyle(0xbfb19a).fillRoundedRect(24, 34, 96, 36, 10);
      g.fillStyle(0xc88d65).fillCircle(30, 44, 13);
      g.fillStyle(0x3a241b).fillCircle(24, 42, 13);
      g.fillStyle(GORGE_COLORS.bloodRed, 0.7).fillCircle(74, 52, 11);
      // Niño y niña junto a ella
      g.fillStyle(0x7c6244).fillRoundedRect(126, 40, 56, 26, 8);
      g.fillStyle(0xc68e62).fillCircle(176, 48, 9);
      g.fillStyle(0x9c4b35).fillRoundedRect(142, 54, 52, 24, 8);
      g.fillStyle(0xd29c76).fillCircle(190, 62, 9);
    });

    this.createTexture(scene, "fp3_soldier_embracing", 250, 120, (g) => {
      g.fillStyle(0x2b2726, 0.75).fillEllipse(125, 92, 230, 44);
      // Cuerpos de la familia bajo su abrazo
      g.fillStyle(0xbfb19a).fillRoundedRect(88, 56, 118, 36, 10);
      g.fillStyle(0x7c6244).fillRoundedRect(136, 62, 68, 28, 8);
      // Soldado inclinado abrazándolos entre las cenizas
      g.fillStyle(0x5b1012).fillRoundedRect(32, 34, 86, 54, 14);
      g.fillStyle(0xb58057).fillRoundedRect(86, 48, 56, 20, 8);
      g.fillStyle(0x231712).fillCircle(72, 26, 18);
    });

    // Retratos para viñetas de Escena 3
    this.createTexture(scene, "portrait_soldier_despair", 72, 72, (g) => {
      g.fillStyle(0x2d1412).fillRect(0, 0, 72, 72);
      g.fillStyle(0x6e1919).fillCircle(36, 74, 28);
      g.fillStyle(0xc6936c).fillCircle(36, 33, 17);
      g.fillStyle(0x2a1d17).fillEllipse(36, 19, 34, 13);
      g.fillStyle(0x2a1d17).fillRoundedRect(24, 39, 24, 12, 4);
      g.fillStyle(0xffffff).fillCircle(30, 30, 4).fillCircle(42, 30, 4);
      g.fillStyle(0x111111).fillCircle(30, 30, 1.8).fillCircle(42, 30, 1.8);
      g.fillStyle(0x1f1d1c, 0.5).fillCircle(26, 37, 5).fillCircle(46, 36, 4);
    });

    this.createTexture(scene, "portrait_general_sepia", 72, 72, (g) => {
      g.fillStyle(0xc2a378).fillRect(0, 0, 72, 72);
      g.fillStyle(0x6e4726).fillEllipse(36, 12, 42, 15);
      g.fillStyle(0x9c7648).fillRoundedRect(18, 18, 36, 42, 12);
      g.fillStyle(0x3a2614).fillRect(24, 31, 24, 9);
      g.fillStyle(0xe8d5b5).fillCircle(30, 35, 2).fillCircle(42, 35, 2);
      g.lineStyle(2.5, 0x3a2614).strokeLineShape(new Phaser.Geom.Line(28, 49, 44, 49));
    });

    this.createTexture(scene, "portrait_hands_ash_blood", 72, 72, (g) => {
      g.fillStyle(0x191615).fillRect(0, 0, 72, 72);
      // Dos manos abiertas cubiertas de hollín y sangre
      g.fillStyle(0xb58057).fillRoundedRect(12, 28, 22, 34, 6);
      g.fillStyle(0xb58057).fillRoundedRect(38, 28, 22, 34, 6);
      [14, 20, 26, 40, 46, 52].forEach((fx) => {
        g.fillStyle(0xb58057).fillRect(fx, 14, 4, 16);
      });
      g.fillStyle(GORGE_COLORS.bloodRed, 0.85).fillCircle(24, 42, 9).fillCircle(49, 38, 10);
      g.fillStyle(0x1f1d1c, 0.7).fillCircle(19, 34, 7).fillCircle(45, 48, 8);
    });

    this.createTexture(scene, "portrait_soldier_penance", 72, 72, (g) => {
      g.fillStyle(0x120d0c).fillRect(0, 0, 72, 72);
      g.fillStyle(0x5b1012).fillCircle(36, 74, 28);
      g.fillStyle(0xba8863).fillCircle(36, 33, 17);
      // Manchas de hollín en rostro
      g.fillStyle(0x1e1a18, 0.6).fillCircle(28, 38, 6).fillCircle(44, 35, 5);
      g.fillStyle(0x231712).fillEllipse(36, 18, 34, 13);
      g.fillStyle(0x231712).fillRoundedRect(24, 39, 24, 13, 4);
      // Cejas marcadas de odio absoluto y lágrimas claras sobre el hollín
      g.lineStyle(2.5, 0x0f0c0b);
      g.strokeLineShape(new Phaser.Geom.Line(26, 25, 34, 29));
      g.strokeLineShape(new Phaser.Geom.Line(46, 25, 38, 29));
      g.fillStyle(0xffffff).fillCircle(30, 30, 2.2).fillCircle(42, 30, 2.2);
      g.fillStyle(0xdbeafe, 0.85).fillRect(29, 33, 2, 7).fillRect(41, 33, 2, 7);
    });
  }
}
