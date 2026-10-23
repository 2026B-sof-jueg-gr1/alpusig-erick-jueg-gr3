# The Last Spartan

Juego 2D de acción y plataformas desarrollado con Phaser 3 mediante CDN.

## Ejecutar localmente

Desde la carpeta del proyecto:

```powershell
python -m http.server 8000
```

Después abre <http://localhost:8000>.

El servidor local es necesario porque el juego utiliza módulos JavaScript.

## Publicar en GitHub Pages

El workflow [`deploy-pages.yml`](./.github/workflows/deploy-pages.yml) publica automáticamente [`mi-primer-juego`](./mi-primer-juego) en cada push a `main` o `master`.

1. Sube el repositorio a GitHub.
2. Ejecuta el workflow o realiza un push a la rama principal.

La URL resultante tendrá este formato:

```text
https://<usuario>.github.io/<repositorio>/
```

## Controles

- `A / D` o flechas: moverse.
- `W`, flecha arriba o espacio: saltar.
- `J`: atacar o lanzar una lanza.
- `1`: Leviathan Axe.
- `2`: Draupnir Spear.
- `K`: detonar lanzas.
- `P`: pausar.