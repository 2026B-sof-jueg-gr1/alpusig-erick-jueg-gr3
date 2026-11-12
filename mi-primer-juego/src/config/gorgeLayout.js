import { GROUND_Y } from "./constants.js";

/**
 * Geometría, zonas de oleadas y utilería ambiental para Escena 2:
 * 'El Barro, la Lanza y la Caída' (Desfiladero de Argos).
 */
export const GORGE_LAYOUT = {
  worldWidth: 3600,
  groundY: GROUND_Y,
  playerSpawn: { x: 220, y: GROUND_Y - 40 },

  // Escaramuzas ambientales de fondo (aliados espartanos que caen progresivamente)
  backgroundSkirmishes: [
    { x: 640, fallAtPlayerX: 700 },
    { x: 1180, fallAtPlayerX: 1220 },
    { x: 1720, fallAtPlayerX: 1680 },
    { x: 2280, fallAtPlayerX: 2150 },
    { x: 2740, fallAtPlayerX: 2560 }
  ],

  // Zonas de progresión y disparadores de Escena 2
  triggers: {
    midMapTrapX: 1680,
    ambushCinematicX: 3060,
    leftEscapeX: 115
  },

  // Olas de combate hacia la derecha (Hito 2.1)
  waves: [
    {
      id: 1,
      triggerX: 280,
      lockScrollMin: 0,
      lockScrollMax: 1150,
      enemies: [
        { type: "infantry", x: 740 },
        { type: "infantry", x: 880 }
      ]
    },
    {
      id: 2,
      triggerX: 980,
      enemies: [
        { type: "infantry", x: 1420 },
        { type: "shield", x: 1550 },
        { type: "archer", x: 1680 }
      ]
    },
    {
      id: 3,
      triggerX: 1680, // Tras "¡nos tendieron una trampa!" - oleadas más rápidas y numerosas
      aggressive: true,
      enemies: [
        { type: "lancer", x: 2050 },
        { type: "shield", x: 2180 },
        { type: "infantry", x: 2280 },
        { type: "archer", x: 2380 }
      ]
    },
    {
      id: 4,
      triggerX: 2380,
      aggressive: true,
      enemies: [
        { type: "lancer", x: 2750 },
        { type: "lancer", x: 2860 },
        { type: "shield", x: 2940 },
        { type: "archer", x: 3020 },
        { type: "infantry", x: 3120 }
      ]
    }
  ]
};

