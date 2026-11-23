/**
 * Configuración declarativa de las secuencias cinematográficas.
 *
 * Cada "plate" es una ilustración de hito que se proyecta como viñeta animada
 * (Ken Burns + grano + encuadre de tinta) mezclada con la jugabilidad.
 *
 * - `focus`: rectángulo normalizado (0..1) de la textura que debe llenar el marco.
 * - `shots`: encuadres con nombre reutilizables por las escenas.
 *
 * Las ilustraciones originales incluyen una barra de vitalidad dibujada en la
 * esquina superior izquierda. El componente `CinematicPlate` la cubre con el
 * sello de capítulo (`stamp`), por eso ningún plate debe encuadrarse dejando
 * visible esa esquina sin sello.
 */

export const FULL_FRAME = { x: 0, y: 0, width: 1, height: 1 };

export const CINEMATIC_PLATES = {
  hito1_1: {
    texture: "cine_hito1_1",
    label: "HITO 1.1",
    title: "La paz antes de la tormenta",
    caption: "Un día soleado en las afueras de Esparta. Todavía nada duele.",
    shots: {
      handoff: {
        focus: FULL_FRAME,
        zoomFrom: 1.02,
        zoomTo: 1.1,
        panToX: -0.035,
        panToY: 0.012
      },
      children: {
        focus: { x: 0.42, y: 0.2, width: 0.56, height: 0.78 },
        zoomFrom: 1.04,
        zoomTo: 1.12,
        panToX: 0.01,
        panToY: 0
      }
    }
  },

  hito1_2: {
    texture: "cine_hito1_2",
    label: "HITO 1.2",
    title: "El mensajero y el general",
    caption: "Argos marcha sobre el valle. Esparta responde con una sola voz.",
    shots: {
      arrival: {
        focus: { x: 0, y: 0.02, width: 0.98, height: 0.96 },
        zoomFrom: 1.03,
        zoomTo: 1.09,
        panToX: 0.03,
        panToY: 0
      },
      general: {
        focus: { x: 0.5, y: 0.02, width: 0.5, height: 0.9 },
        zoomFrom: 1.04,
        zoomTo: 1.12,
        panToX: 0.01,
        panToY: -0.01
      }
    }
  },

  hito1_3: {
    texture: "cine_hito1_3",
    label: "HITO 1.3",
    title: "La arrogancia del soldado",
    caption: "El hambre de gloria también sabe sonreír.",
    shots: {
      general: {
        focus: { x: 0.54, y: 0.02, width: 0.46, height: 0.84 },
        zoomFrom: 1.03,
        zoomTo: 1.1,
        panToX: 0,
        panToY: 0
      },
      soldier: {
        focus: { x: 0.24, y: 0.1, width: 0.44, height: 0.8 },
        zoomFrom: 1.04,
        zoomTo: 1.11,
        panToX: 0.008,
        panToY: 0
      },
      shoulder: {
        focus: { x: 0.21, y: 0.02, width: 0.46, height: 0.62 },
        zoomFrom: 1.04,
        zoomTo: 1.12,
        panToX: 0.012,
        panToY: 0.01
      },
      standoff: {
        focus: FULL_FRAME,
        zoomFrom: 1.02,
        zoomTo: 1.08,
        panToX: -0.02,
        panToY: 0.01
      }
    }
  },

  hito2_1: {
    texture: "cine_hito2_1",
    label: "HITO 2.1",
    title: "El choque contra Argos",
    caption: "El desfiladero no distingue bandos: solo devuelve barro y sangre.",
    shots: {
      clash: {
        focus: { x: 0.14, y: 0.24, width: 0.44, height: 0.56 },
        zoomFrom: 1.03,
        zoomTo: 1.12,
        panToX: 0.03,
        panToY: 0.01
      },
      impact: {
        focus: { x: 0.68, y: 0.28, width: 0.3, height: 0.42 },
        zoomFrom: 1.04,
        zoomTo: 1.12,
        panToX: -0.015,
        panToY: 0
      },
      wide: {
        focus: FULL_FRAME,
        zoomFrom: 1.02,
        zoomTo: 1.1,
        panToX: 0.02,
        panToY: 0.01
      }
    }
  },

  hito2_2: {
    texture: "cine_hito2_2",
    label: "HITO 2.2",
    title: "La muerte del ídolo",
    caption: "El hombre más fuerte de Esparta también sabía sangrar.",
    shots: {
      wide: {
        focus: FULL_FRAME,
        zoomFrom: 1.0,
        zoomTo: 1.07,
        panToX: 0,
        panToY: 0.01
      },
      hand: {
        focus: { x: 0.28, y: 0.31, width: 0.28, height: 0.34 },
        zoomFrom: 1.04,
        zoomTo: 1.12,
        panToX: 0.008,
        panToY: 0.008
      },
      impact: {
        focus: { x: 0.42, y: 0.26, width: 0.28, height: 0.34 },
        zoomFrom: 1.05,
        zoomTo: 1.14,
        panToX: -0.01,
        panToY: 0
      },
      collapse: {
        focus: { x: 0.26, y: 0.2, width: 0.5, height: 0.62 },
        zoomFrom: 1.1,
        zoomTo: 1.0,
        panToX: 0,
        panToY: 0.015
      }
    }
  },

  hito2_3: {
    texture: "cine_hito2_3",
    label: "HITO 2.3",
    title: "La huida deshonrosa",
    caption: "El campo está perdido. Solo queda el camino de vuelta.",
    shots: {
      flight: {
        focus: { x: 0.12, y: 0.22, width: 0.44, height: 0.54 },
        zoomFrom: 1.03,
        zoomTo: 1.11,
        panToX: -0.035,
        panToY: 0.01
      },
      arrows: {
        focus: { x: 0.5, y: 0.02, width: 0.46, height: 0.52 },
        zoomFrom: 1.04,
        zoomTo: 1.12,
        panToX: -0.01,
        panToY: 0.01
      },
      wide: {
        focus: FULL_FRAME,
        zoomFrom: 1.02,
        zoomTo: 1.1,
        panToX: -0.02,
        panToY: 0.01
      }
    }
  },

  hito3_1: {
    texture: "cine_hito3_1",
    label: "HITO 3.1",
    title: "El humo en el horizonte",
    caption: "El pueblo que dejó atrás ya no existía.",
    shots: {
      wide: {
        focus: FULL_FRAME,
        zoomFrom: 1.02,
        zoomTo: 1.1,
        panToX: -0.025,
        panToY: 0.01
      },
      watchpost: {
        focus: { x: 0.02, y: 0.34, width: 0.5, height: 0.6 },
        zoomFrom: 1.04,
        zoomTo: 1.12,
        panToX: 0.012,
        panToY: 0.01
      },
      soldier: {
        focus: { x: 0.6, y: 0.22, width: 0.38, height: 0.62 },
        zoomFrom: 1.04,
        zoomTo: 1.12,
        panToX: 0.006,
        panToY: 0
      }
    }
  },

  hito3_2: {
    texture: "cine_hito3_2",
    label: "HITO 3.2",
    title: "El recorrido del horror",
    caption: "Cada calle era un nombre que ya no respondía.",
    shots: {
      sprint: {
        focus: { x: 0.2, y: 0.22, width: 0.42, height: 0.6 },
        zoomFrom: 1.04,
        zoomTo: 1.12,
        panToX: -0.03,
        panToY: 0.01
      },
      flames: {
        focus: { x: 0.55, y: 0.08, width: 0.42, height: 0.56 },
        zoomFrom: 1.03,
        zoomTo: 1.1,
        panToX: -0.012,
        panToY: 0
      },
      wide: {
        focus: FULL_FRAME,
        zoomFrom: 1.02,
        zoomTo: 1.1,
        panToX: -0.02,
        panToY: 0.01
      }
    }
  },

  /**
   * Hito 3.3: la única ilustración animada (hoja de sprites derivada de Hito3_3.gif).
   * Al ser un sprite animado no se le aplica Ken Burns ni recorte: su propio
   * movimiento (brasas y leve empuje de cámara) ya sostiene el plano.
   */
  hito3_3: {
    texture: "cine_hito3_3_sheet",
    animated: true,
    animation: "cine_hito3_3_anim",
    label: "HITO 3.3",
    title: "El quiebre del espartano",
    caption: "La lanza cayó primero. Después cayeron sus rodillas.",
    shots: {
      threshold: { focus: FULL_FRAME }
    }
  }
};

/** Animaciones de las ilustraciones animadas (hojas de sprites de los GIF). */
export const CINEMATIC_ANIMATIONS = [
  {
    key: "cine_hito3_3_anim",
    texture: "cine_hito3_3_sheet",
    frameCount: 30,
    frameRate: 10,
    repeat: -1
  }
];

/** Retratos HD usados por las viñetas de cómic de la campaña. */
export const CINEMATIC_PORTRAITS = {
  wife: "hd_portrait_wife",
  soldier: "hd_portrait_soldier",
  soldierThought: "hd_portrait_soldier_thought",
  soldierShock: "hd_portrait_soldier_shock",
  soldierDespair: "hd_portrait_soldier_despair",
  soldierPenance: "hd_portrait_soldier_penance",
  generalSepia: "hd_portrait_general_sepia",
  generalFierce: "hd_portrait_general_fierce",
  generalFrown: "hd_portrait_general_frown",
  generalSmirk: "hd_portrait_general_smirk",
  children: "hd_portrait_children",
  family: "hd_portrait_family"
};
