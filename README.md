# The Last Spartan

Juego 2D de acción y plataformas desarrollado con Phaser (instalado localmente mediante npm).

## Requisitos previos

- Node.js (v18 o superior) y npm
- Python (opcional, para servidor HTTP alternativo)

## Instalación y preparación

Desde la raíz del proyecto, instala las dependencias:

```bash
npm install
```

> **Nota:** El script de `postinstall` copia automáticamente la librería compilada de Phaser desde `node_modules` hacia `mi-primer-juego/lib/phaser.min.js`.

## Ejecutar localmente

Puedes levantar el servidor de desarrollo de cualquiera de las siguientes formas:

### Opción 1: Con npm (recomendado)
```bash
npm start
```
Abre la URL indicada en consola (por defecto `http://localhost:3000`).

### Opción 2: Con Python
```powershell
python -m http.server 8000
```
Después abre <http://localhost:8000/mi-primer-juego/>.

*El servidor local es necesario debido al uso de módulos ES de JavaScript.*

## Publicar en GitHub Pages

El workflow [`deploy-pages.yml`](./.github/workflows/deploy-pages.yml) se ejecuta automáticamente en cada push a `main` o `master`:
1. Instala las dependencias y prepara el bundle local de Phaser (`npm ci`).
2. Publica la carpeta [`mi-primer-juego`](./mi-primer-juego) en GitHub Pages.

### Configuración en GitHub:
1. Sube el repositorio a GitHub.
2. Entra en **Settings → Pages**.
3. Selecciona **GitHub Actions** como fuente de despliegue.
4. En cada push a la rama principal el juego se desplegará en:
   ```text
   https://<usuario>.github.io/<repositorio>/
   ```

## Controles del juego

- `A / D` o flechas: Moverse horizontalmente.
- `W`, flecha arriba o espacio: Saltar.
- `1`: Seleccionar Leviathan Axe.
- `2`: Seleccionar Draupnir Spear.
- `J`: Atacar cuerpo a cuerpo (con hacha) o disparar lanza.
- `K`: Detonar lanzas incrustadas.
- `P`: Pausar juego.
