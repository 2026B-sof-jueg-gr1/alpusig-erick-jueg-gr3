import { WIDTH, HEIGHT } from "../config/constants.js";

const DEFAULT_PLATES = [
  "cine_hito1_3", // el soldado y el General
  "cine_hito2_1", // el choque en el desfiladero
  "cine_hito3_1", // el pueblo en cenizas
  "cine_hito1_1"  // la paz antes de la tormenta
];

const HOLD_MS = 6500;
const FADE_MS = 1200;

/**
 * Fondo ilustrado del menú principal.
 *
 * Alterna los plates cinematográficos ya cargados en BootScene como un collage,
 * con fundidos cruzados y un encuadre muy lento. El degradado izquierdo da
 * contraste al texto y oculta la barra de vitalidad dibujada en los originales.
 */
export class MenuBackground {
  constructor(scene, plateKeys = DEFAULT_PLATES, atmosphereKey = "sun_mote") {
    this.scene = scene;
    this.atmosphereKey = atmosphereKey;
    this.plateKeys = plateKeys.filter((key) => scene.textures.exists(key));
    if (!this.plateKeys.length) return;

    this.index = 0;
    this.front = scene.add.image(WIDTH / 2, HEIGHT / 2, this.plateKeys[0]).setDepth(0);
    this.back = scene.add.image(WIDTH / 2, HEIGHT / 2, this.plateKeys[0]).setDepth(0).setAlpha(0);
    this.configurePlate(this.front);
    this.configurePlate(this.back);
    this.startZoom(this.front);

    if (this.plateKeys.length > 1) {
      this.carousel = scene.time.addEvent({
        delay: HOLD_MS,
        loop: true,
        callback: () => this.showNext()
      });
    }

    this.addShading();
    this.addAtmosphere();
    scene.events.once("shutdown", () => this.destroy());
  }

  configurePlate(plate) {
    plate.setDisplaySize(WIDTH, HEIGHT);
    this.baseScale = plate.scaleX;
  }

  startZoom(plate) {
    plate.zoomTween?.stop();
    plate.setScale(this.baseScale);
    plate.zoomTween = this.scene.tweens.add({
      targets: plate,
      scaleX: this.baseScale * 1.06,
      scaleY: this.baseScale * 1.06,
      duration: HOLD_MS + FADE_MS,
      ease: "Sine.easeInOut"
    });
  }

  showNext() {
    this.index = (this.index + 1) % this.plateKeys.length;
    const key = this.plateKeys[this.index];
    const outgoing = this.front;
    const incoming = this.back;

    incoming.setTexture(key);
    incoming.setDisplaySize(WIDTH, HEIGHT);
    incoming.setAlpha(0);
    this.startZoom(incoming);

    this.scene.tweens.add({ targets: incoming, alpha: 1, duration: FADE_MS, ease: "Sine.easeInOut" });
    this.scene.tweens.add({ targets: outgoing, alpha: 0, duration: FADE_MS, ease: "Sine.easeInOut" });

    this.front = incoming;
    this.back = outgoing;
  }

  addShading() {
    const shade = this.scene.add.graphics().setDepth(1);
    const panelWidth = WIDTH * 0.54;

    shade.fillStyle(0x0d0a09, 0.88);
    shade.fillRect(0, 0, panelWidth, HEIGHT);

    for (let i = 0; i < 10; i++) {
      shade.fillStyle(0x0d0a09, 0.30 * (1 - i / 10));
      shade.fillRect(panelWidth + i * 12, 0, 12, HEIGHT);
    }

    shade.fillStyle(0x0d0a09, 0.42);
    shade.fillRect(0, 0, WIDTH, 62);
    shade.fillRect(0, HEIGHT - 56, WIDTH, 56);
  }

  addAtmosphere() {
    const key = this.atmosphereKey;
    if (!this.scene.textures.exists(key)) return;

    const embers = key === "ember_spark";
    this.scene.add.particles(0, 0, key, embers ? {
      x: { min: 0, max: WIDTH },
      y: HEIGHT + 10,
      lifespan: 4800,
      speedY: { min: -75, max: -28 },
      speedX: { min: -24, max: 20 },
      scale: { start: 1.25, end: 0.2 },
      alpha: { start: 0.95, end: 0 },
      quantity: 2,
      frequency: 85
    } : {
      x: { min: 0, max: WIDTH },
      y: { min: 80, max: HEIGHT - 40 },
      lifespan: 5200,
      speedX: { min: -10, max: 14 },
      speedY: { min: -12, max: 4 },
      scale: { start: 0.4, end: 0.9 },
      alpha: { start: 0, end: 0.4 },
      quantity: 1,
      frequency: 420
    }).setDepth(2);
  }

  destroy() {
    this.carousel?.remove(false);
    this.carousel = null;
    this.front?.zoomTween?.stop();
    this.back?.zoomTween?.stop();
  }
}
