/**
 * Animaciones de locomoción del soldado espartano.
 *
 * Definición declarativa: BootScene las registra una sola vez durante el arranque
 * y SpartanPlayer únicamente las reproduce según su estado y movimiento.
 * frameDurations permite marcar el ritmo irregular de la cojera (Estado 3).
 */
export const PLAYER_ANIMATIONS = [
  {
    key: "spartan_armed_walk_cycle",
    texture: "spartan_armed_walk_sheet",
    frameCount: 4,
    frameRate: 10,
    frameDurations: [110, 90, 110, 90],
    repeat: -1
  },
  {
    key: "spartan_wounded_limp_cycle",
    texture: "spartan_wounded_limp_sheet",
    frameCount: 3,
    frameRate: 6,
    frameDurations: [170, 330, 190],
    repeat: -1
  },
  {
    key: "spartan_desperate_sprint_cycle",
    texture: "spartan_desperate_sprint_sheet",
    frameCount: 3,
    frameRate: 14,
    frameDurations: [80, 60, 60],
    repeat: -1
  }
];
