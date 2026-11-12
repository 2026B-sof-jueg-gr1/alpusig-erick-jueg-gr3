import { GROUND_Y } from "./constants.js";

/**
 * Geometría y coordenadas maestras del pueblo espartano para la Parte 1.
 * Compartida entre la Escena 1 (recorrido de izquierda a derecha en paz)
 * y la Escena 3 (recorrido inverso de derecha a izquierda bajo destrucción).
 */
export const VILLAGE_LAYOUT = {
  worldWidth: 3400,
  groundY: GROUND_Y,
  playerSpawn: { x: 245, y: GROUND_Y - 38 },

  // Zona 1: Hogar del Soldado (extremo izquierdo)
  home: {
    houseX: 205,
    doorX: 255,
    spearRackX: 285,
    wifeX: 350,
    boyX: 398,
    girlX: 434,
    toyShieldX: 416
  },

  // Zona 2: Sendero del pueblo, aldeanos y pórtico de vigilancia
  village: {
    treesX: [85, 495, 760, 1130, 1410, 1690, 2140],
    housesX: [660, 1020, 1580],
    wellX: 910,
    villagers: [
      { x: 1085, texture: "spartan_villager", flipX: false },
      { x: 1465, texture: "spartan_blacksmith", flipX: true },
      { x: 1765, texture: "spartan_villager", flipX: true }
    ],
    watchpostX: 1960,
    elderGuardsX: [1912, 2008]
  },

  // Zona 3: Plaza de armas (extremo derecho)
  plaza: {
    startX: 2420,
    endX: 3340,
    bannersX: [2510, 2720, 2970, 3220],
    generalX: 2910,
    messengerStopX: 2785,
    formationXs: [2985, 3050, 3115, 3180]
  },

  // Disparadores espaciales de Escena 1
  triggers: {
    equipFamilyX: 315,
    thoughtPathX: 1480,
    plazaSequenceX: 2480,
    generalBlockX: 2825
  },

  // Coordenadas inversas (derecha -> izquierda) reutilizadas en Escena 3: Cenizas del Deber
  escena3: {
    playerSpawn: { x: 3220, y: GROUND_Y - 38 },
    watchpostTriggerX: 2045,
    doorPromptX: 325,
    doorThresholdX: 272,
    ransackedPropsX: [1085, 1465, 1765, 2580, 2890],
    fireSpotsX: [165, 255, 650, 1020, 1460, 1580, 1960, 2720]
  }
};

