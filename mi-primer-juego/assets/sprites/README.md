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

### Texturas Narrativas (Escena 1):
| Archivo | Clave (Key) | Dimensiones Sugeridas | Descripción |
| :--- | :--- | :--- | :--- |
| `blade_olympus.png` | `blade_olympus` | 44 x 130 px | Espada del Olimpo |
| `blades_of_chaos.png` | `blades_of_chaos` | 64 x 40 px | Espadas del Caos con cadenas |
| `kratos_kneeling.png` | `kratos_kneeling` | 64 x 84 px | Kratos arrodillado |
| `kratos_fallen.png` | `kratos_fallen` | 92 x 46 px | Kratos desplomado |
| `kratos_cave_sitting.png`| `kratos_cave_sitting`| 68 x 76 px | Kratos sentado con manto |
| `campfire.png` | `campfire` | 48 x 36 px | Fogata de la cueva |

---

## Consejos para los Sprites:
1. **Formato:** Usa imágenes PNG con fondo transparente (Canal Alpha).
2. **Proporciones:** Mantén proporciones similares a las dimensiones recomendadas para que las cajas de colisión (hitboxes) sigan coincidiendo perfectamente con la silueta de tu sprite.

