# Guía de Reemplazo de Sprites y Texturas

Para cambiar la skin de cualquier personaje, enemigo, jefe o arma, simplemente coloca tu archivo `.png` en esta carpeta con el nombre exacto indicado en la tabla.

Al agregar el archivo y declararlo en `src/config/assetsConfig.js`, Phaser cargará tu imagen PNG en lugar de la textura generada por código.

---

## Dimensiones y Claves de Textura

| Archivo | Clave (Key) | Dimensiones Sugeridas | Descripción |
| :--- | :--- | :--- | :--- |
| `player.png` | `player` | 48 x 72 px | Personaje principal (Espartano) |
| `wolf.png` | `wolf` | 56 x 38 px | Enemigo ágil (Lobo de hielo) |
| `draugr.png` | `draugr` | 44 x 68 px | Enemigo guerrero (Draugr) |
| `shaman.png` | `shaman` | 46 x 66 px | Enemigo a distancia (Chamán) |
| `guardian.png` | `guardian` | 94 x 112 px | Jefe 1 (Frost Guardian) |
| `serpent.png` | `serpent` | 150 x 74 px | Jefe 2 (World Serpent Avatar) |
| `axe.png` | `axe` | 70 x 18 px | Hacha Leviatán |
| `spear.png` | `spear` | 72 x 12 px | Lanza Draupnir |
| `pickup.png` | `pickup` | 24 x 24 px | Orbe curativo / mejora |
| `ground.png` | `ground` | 1152 x 86 px | Suelo del escenario |

### Texturas de Campaña (Parte 1: El Precio de la Gloria):
| Archivo | Clave (Key) | Dimensiones Sugeridas | Descripción |
| :--- | :--- | :--- | :--- |
| `spartan_unarmed.png` | `spartan_unarmed` | 54 x 78 px | Soldado espartano desarmado (hogar) |
| `spartan_armed.png` | `spartan_armed` | 68 x 82 px | Soldado espartano con Lanza (Dory) y Escudo (Hoplón) |
| `spartan_armed_guard.png` | `spartan_armed_guard` | 68 x 82 px | Soldado en Guardia Férrea |
| `spartan_armed_thrust.png` | `spartan_armed_thrust` | 84 x 82 px | Soldado ejecutando estocada de lanza |
| `spartan_wounded.png` | `spartan_wounded` | 60 x 76 px | Soldado espartano herido (Estado 3) |
| `spartan_wounded_duck.png` | `spartan_wounded_duck` | 62 x 56 px | Soldado herido agachado esquivando flechas |
| `spartan_kneeling_wounded.png` | `spartan_kneeling_wounded` | 64 x 66 px | Soldado de rodillas al recibir la puñalada (Hito 2.2) |
| `spartan_desperate_sprint.png` | `spartan_desperate_sprint` | 66 x 76 px | Carrera desesperada del soldado herido (Estado 4) |
| `argos_soldier.png` | `argos_soldier` | 58 x 78 px | Infante enemigo de Argos |
| `argos_shield_bearer.png` | `argos_shield_bearer` | 62 x 80 px | Escudero de Argos |
| `argos_lancer.png` | `argos_lancer` | 68 x 80 px | Lancero de Argos |
| `argos_archer.png` | `argos_archer` | 54 x 76 px | Arquero de Argos |
| `spartan_wife.png` | `spartan_wife` | 48 x 74 px | Esposa del soldado |
| `spartan_child_boy.png` | `spartan_child_boy` | 30 x 48 px | Hijo del soldado |
| `spartan_child_girl.png` | `spartan_child_girl` | 30 x 46 px | Hija del soldado |
| `toy_shield.png` | `toy_shield` | 24 x 24 px | Escudo de madera de juguete |
| `spartan_general.png` | `spartan_general` | 66 x 88 px | General espartano con capa carmesí |
| `spartan_ally.png` | `spartan_ally` | 60 x 80 px | Guerrero de la falange espartana |
| `spartan_elder_guard.png` | `spartan_elder_guard` | 52 x 74 px | Anciano guardia del pórtico |
| `spartan_scout_horse.png` | `spartan_scout_horse` | 104 x 78 px | Explorador herido a caballo |
| `spartan_scout_fallen.png` | `spartan_scout_fallen` | 76 x 44 px | Explorador caído en la plaza |
| `dory_spear.png` | `dory_spear` | 78 x 12 px | Lanza espartana (Dory) |
| `hoplon_shield.png` | `hoplon_shield` | 36 x 36 px | Escudo espartano (Hoplón) |

### Spritesheets de locomoción del jugador
Se cargan con `load.spritesheet` y se registran en `src/config/playerAnimations.js`.
Cada ciclo deriva de **una sola postura base** con desplazamientos laterales y un pequeño salto vertical; así la lanza, el escudo y la cabeza nunca cambian de sitio entre frames. No se mezclan poses incompatibles (por ejemplo, `source_spartan_08_armed_advance.png` ya no se usa para caminar).

| Archivo | Clave (Key) | Frame | Animación resultante |
| :--- | :--- | :--- | :--- |
| `spartan_armed_walk_sheet.png` | `spartan_armed_walk_sheet` | 68 x 82 px (4 frames) | `spartan_armed_walk_cycle` — caminata con Dory + Hoplón |
| `spartan_wounded_limp_sheet.png` | `spartan_wounded_limp_sheet` | 60 x 76 px (3 frames) | `spartan_wounded_limp_cycle` — cojera irregular (Estado 3) |
| `spartan_desperate_sprint_sheet.png` | `spartan_desperate_sprint_sheet` | 66 x 76 px (3 frames) | `spartan_desperate_sprint_cycle` — carrera desesperada (Estado 4) |

### Frames fuente del pack (32 x 32)
Archivos originales renombrados para identificar cada pose de un vistazo. No se cargan en el juego; sirven para regenerar skins.

| Archivo | Pose |
| :--- | :--- |
| `source_spartan_01_armed_idle.png` | Reposo con lanza vertical y hoplón |
| `source_spartan_02_armed_spear_stand.png` | Reposo alterno con lanza vertical |
| `source_spartan_03_sprint_spear_low.png` | Carrera con lanza baja hacia delante |
| `source_spartan_04_crouch_shield.png` | Agachado protegiéndose con el escudo |
| `source_spartan_05_guard_shield.png` | Guardia con hoplón al frente |
| `source_spartan_06_march_spear_back.png` | Marcha con lanza diagonal a la espalda |
| `source_spartan_07_walk_no_shield.png` | Caminata sin escudo, lanza a la espalda |
| `source_spartan_08_armed_advance.png` | Avance con escudo y brazo extendido |
| `source_spartan_09_martial_fist.png` | Puño en alto con lanza vertical |
| `source_spartan_10_thrust_spear.png` | Estocada horizontal con la lanza |
| `source_spartan_11_crouch_spear.png` | Cuerpo bajo con lanza horizontal |
| `source_spartan_12_kneel_bloody_shield.png` | De rodillas con escudo ensangrentado |

---

## Consejos para los Sprites:
1. **Formato:** Usa imágenes PNG con fondo transparente (Canal Alpha).
2. **Proporciones:** Mantén proporciones similares a las dimensiones recomendadas para que las cajas de colisión (hitboxes) sigan coincidiendo perfectamente con la silueta de tu sprite.

