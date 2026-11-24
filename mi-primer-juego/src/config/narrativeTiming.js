/**
 * Tiempos de lectura centralizados de la campaña (Parte 1).
 *
 * Antes cada `hold` / `duration` / `autoDismissDelay` vivía como un número suelto
 * en el director cinematográfico, los componentes de cómic y las escenas, lo que
 * hacía imposible ajustar el ritmo de lectura sin perseguir valores por todo el
 * código. Este archivo es la única fuente de verdad.
 *
 * Criterio aplicado: una pantalla con ilustración necesita ~6 s para mirarla y
 * leer su caption; una viñeta de texto se mantiene en pantalla el tiempo que
 * tardaría una persona en leerla en voz baja (~280 ms por palabra), con un suelo
 * de 5 s para que las frases cortas tampoco se esfumen.
 */

export const NARRATIVE_TIMING = {
  /** Cinemática a pantalla completa (ilustración + caption). */
  fullscreen: 6000,
  /** Viñeta insertada durante la jugabilidad: no bloquea, pero merece su tiempo. */
  inset: 7000,
  /** Tira de cómic de tres paneles (tiempo total, no por panel). */
  strip: 6500,
  /** Cada plano de una secuencia de cortes (p. ej. Hito 2.2). */
  shot: 2500,
  /** Corte seco de impacto: se mantiene breve a propósito, no es lectura. */
  flash: 1400,
  /** Rótulo de capítulo al arrancar una escena. */
  banner: 3400,
  /** Tras este tiempo se sugiere al jugador que puede avanzar con ENTER. */
  skipHintDelay: 1200,
  /** Cálculo de duración de viñetas y bocadillos según longitud del texto. */
  reading: {
    msPerWord: 280,
    min: 5000,
    max: 9000
  }
};

/**
 * Devuelve cuánto tiempo debe permanecer visible un texto de cómic.
 *
 * @param {string} text Texto que se va a mostrar.
 * @param {{msPerWord?: number, min?: number, max?: number}} [overrides] Ajustes puntuales.
 * @returns {number} Milisegundos.
 */
export function readingTime(text = "", overrides = {}) {
  const { msPerWord, min, max } = { ...NARRATIVE_TIMING.reading, ...overrides };
  const words = String(text ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(min, Math.min(max, Math.round(words * msPerWord)));
}
