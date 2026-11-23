/**
 * Registro de Texturas y Skins Personalizadas.
 * 
 * Para cambiar la skin de cualquier personaje, enemigo, jefe o arma:
 * 1. Coloca tu archivo .png en 'mi-primer-juego/assets/sprites/' (ej. 'spartan_armed.png').
 * 2. Descomenta la línea correspondiente a continuación.
 * 3. ¡Listo! Phaser usará tu imagen automáticamente manteniendo todas las físicas y mecánicas intactas.
 */
export const CUSTOM_TEXTURES = [
  // Personajes Parte 1: El Precio de la Gloria (Esparta y Argos)
  // spartan_unarmed permanece procedural: el pack de sprites no incluye al soldado sin equipo.
  { key: "spartan_armed", path: "assets/sprites/spartan_armed.png" },
  { key: "spartan_armed_guard", path: "assets/sprites/spartan_armed_guard.png" },
  { key: "spartan_armed_thrust", path: "assets/sprites/spartan_armed_thrust.png" },
  { key: "spartan_wounded", path: "assets/sprites/spartan_wounded.png" },
  { key: "spartan_wounded_duck", path: "assets/sprites/spartan_wounded_duck.png" },
  { key: "spartan_kneeling_wounded", path: "assets/sprites/spartan_kneeling_wounded.png" },
  { key: "spartan_desperate_sprint", path: "assets/sprites/spartan_desperate_sprint.png" },

  // Spritesheets de locomoción (misma medida de frame que las texturas estáticas)
  { key: "spartan_armed_walk_sheet", path: "assets/sprites/spartan_armed_walk_sheet.png", frameWidth: 68, frameHeight: 82 },
  { key: "spartan_wounded_limp_sheet", path: "assets/sprites/spartan_wounded_limp_sheet.png", frameWidth: 60, frameHeight: 76 },
  { key: "spartan_desperate_sprint_sheet", path: "assets/sprites/spartan_desperate_sprint_sheet.png", frameWidth: 66, frameHeight: 76 },

  // Capa cinematográfica de la Escena 1 (ilustraciones de hito optimizadas)
  { key: "cine_hito1_1", path: "assets/cine/cine_hito1_1.webp" },
  { key: "cine_hito1_2", path: "assets/cine/cine_hito1_2.webp" },
  { key: "cine_hito1_3", path: "assets/cine/cine_hito1_3.webp" },

  // Capa cinematográfica de la Escena 2 (desfiladero de Argos)
  { key: "cine_hito2_1", path: "assets/cine/cine_hito2_1.webp" },
  { key: "cine_hito2_2", path: "assets/cine/cine_hito2_2.webp" },
  { key: "cine_hito2_3", path: "assets/cine/cine_hito2_3.webp" },

  // Capa cinematográfica de la Escena 3 (pueblo en cenizas)
  { key: "cine_hito3_1", path: "assets/cine/cine_hito3_1.webp" },
  { key: "cine_hito3_2", path: "assets/cine/cine_hito3_2.webp" },
  // Hoja de sprites generada a partir de Hito3_3.gif (30 frames de 900x506, rejilla 4x8)
  { key: "cine_hito3_3_sheet", path: "assets/cine/cine_hito3_3_sheet.webp", frameWidth: 900, frameHeight: 506 },

  // Retratos HD para las viñetas de cómic de la Escena 1
  { key: "hd_portrait_wife", path: "assets/cine/hd_portrait_wife.webp" },
  { key: "hd_portrait_soldier", path: "assets/cine/hd_portrait_soldier.webp" },
  { key: "hd_portrait_soldier_thought", path: "assets/cine/hd_portrait_soldier_thought.webp" },
  { key: "hd_portrait_soldier_shock", path: "assets/cine/hd_portrait_soldier_shock.webp" },
  { key: "hd_portrait_soldier_despair", path: "assets/cine/hd_portrait_soldier_despair.webp" },
  { key: "hd_portrait_soldier_penance", path: "assets/cine/hd_portrait_soldier_penance.webp" },
  { key: "hd_portrait_general_sepia", path: "assets/cine/hd_portrait_general_sepia.webp" },
  { key: "hd_portrait_general_fierce", path: "assets/cine/hd_portrait_general_fierce.webp" },
  { key: "hd_portrait_general_frown", path: "assets/cine/hd_portrait_general_frown.webp" },
  { key: "hd_portrait_general_smirk", path: "assets/cine/hd_portrait_general_smirk.webp" },
  { key: "hd_portrait_children", path: "assets/cine/hd_portrait_children.webp" },
  { key: "hd_portrait_family", path: "assets/cine/hd_portrait_family.webp" },

  // { key: "argos_soldier", path: "assets/sprites/argos_soldier.png" },
  // { key: "argos_shield_bearer", path: "assets/sprites/argos_shield_bearer.png" },
  // { key: "argos_lancer", path: "assets/sprites/argos_lancer.png" },
  // { key: "argos_archer", path: "assets/sprites/argos_archer.png" },
  // { key: "argos_arrow", path: "assets/sprites/argos_arrow.png" },
  // { key: "spartan_wife", path: "assets/sprites/spartan_wife.png" },
  // { key: "spartan_child_boy", path: "assets/sprites/spartan_child_boy.png" },
  // { key: "spartan_child_girl", path: "assets/sprites/spartan_child_girl.png" },
  // { key: "toy_shield", path: "assets/sprites/toy_shield.png" },
  // { key: "spartan_general", path: "assets/sprites/spartan_general.png" },
  // { key: "spartan_ally", path: "assets/sprites/spartan_ally.png" },
  // { key: "spartan_elder_guard", path: "assets/sprites/spartan_elder_guard.png" },
  // { key: "spartan_scout_horse", path: "assets/sprites/spartan_scout_horse.png" },
  // { key: "spartan_scout_fallen", path: "assets/sprites/spartan_scout_fallen.png" },
  // { key: "dory_spear", path: "assets/sprites/dory_spear.png" },
  // { key: "hoplon_shield", path: "assets/sprites/hoplon_shield.png" },

  // Modo Combate Libre
  // { key: "player", path: "assets/sprites/player.png" },
  // { key: "wolf", path: "assets/sprites/wolf.png" },
  // { key: "draugr", path: "assets/sprites/draugr.png" },
  // { key: "shaman", path: "assets/sprites/shaman.png" },
  // { key: "guardian", path: "assets/sprites/guardian.png" },
  // { key: "serpent", path: "assets/sprites/serpent.png" },
  // { key: "axe", path: "assets/sprites/axe.png" },
  // { key: "spear", path: "assets/sprites/spear.png" },
  // { key: "pickup", path: "assets/sprites/pickup.png" },
  // { key: "ground", path: "assets/sprites/ground.png" }
];

