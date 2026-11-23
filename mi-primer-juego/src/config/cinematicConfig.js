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
  }
};

/** Retratos HD usados por las viñetas de cómic de la Escena 1. */
export const CINEMATIC_PORTRAITS = {
  wife: "hd_portrait_wife",
  soldier: "hd_portrait_soldier",
  soldierThought: "hd_portrait_soldier_thought",
  generalFierce: "hd_portrait_general_fierce",
  generalFrown: "hd_portrait_general_frown",
  generalSmirk: "hd_portrait_general_smirk",
  children: "hd_portrait_children",
  family: "hd_portrait_family"
};
