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
| `spartan_wounded.png` | `spartan_wounded` | 60 x 76 px | Soldado espartano herido (Estado 3) |
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

---

## Consejos para los Sprites:
1. **Formato:** Usa imágenes PNG con fondo transparente (Canal Alpha).
2. **Proporciones:** Mantén proporciones similares a las dimensiones recomendadas para que las cajas de colisión (hitboxes) sigan coincidiendo perfectamente con la silueta de tu sprite.

