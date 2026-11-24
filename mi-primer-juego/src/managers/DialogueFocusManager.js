import { WIDTH } from "../config/constants.js";

/**
 * Foco narrativo para los diálogos nuevos de la Escena 2.
 *
 * Mientras se muestra una viñeta el mundo queda detenido (la escena deja de
 * actualizar jugador, enemigos, flechas y progresión) y la cámara se desplaza
 * apenas unos píxeles, como una transición de arma de GTA V: se lee con calma
 * sin perder el hilo del combate. La interfaz sigue en tiempo real para que el
 * texto no se alargue, y `ENTER` aborta el foco y devuelve el control.
 */
export class DialogueFocusManager {
  constructor(scene, narrative, { player = null, onFreeze = null, onResume = null } = {}) {
    this.scene = scene;
    this.narrative = narrative;
    this.player = player;
    this.onFreeze = onFreeze;
    this.onResume = onResume;

    this.active = false;
    this.aborted = false;
    this.queue = [];
    this.driftTween = null;
    this.prevLerp = null;

    this.label = scene.add
      .text(WIDTH / 2, 26, "LECTURA  ·  el mundo se detiene  ·  ENTER para continuar", {
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        fontStyle: "bold",
        color: "#f6d99a",
        backgroundColor: "#1a1412dd",
        padding: { left: 10, right: 10, top: 4, bottom: 4 }
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(210)
      .setVisible(false);

    scene.input.keyboard?.on("keydown-ENTER", () => this.skip());
    scene.events.once("shutdown", () => this.restore());
    scene.events.once("destroy", () => this.restore());
  }

  /** Reproduce una secuencia de cómic con el mundo detenido. */
  async play(steps = [], options = {}) {
    if (!steps.length || !this.scene.sys.isActive()) return;
    if (this.active) {
      this.queue.push({ steps, options });
      return;
    }

    const { resumeFollow = null } = options;
    this.active = true;
    this.aborted = false;
    this.onFreeze?.();

    const cam = this.scene.cameras.main;
    const shouldResumeFollow = resumeFollow ?? !!cam._follow;
    if (cam.lerp) {
      this.prevLerp = { x: cam.lerp.x, y: cam.lerp.y };
      cam.lerp.x = 0.02;
      cam.lerp.y = 0.02;
    }
    cam.stopFollow();

    // Deriva lentísima de cámara: se nota el "tiempo detenido" sin perder el encuadre.
    this.driftTween = this.scene.tweens.add({
      targets: cam,
      scrollX: cam.scrollX - 24,
      duration: 3200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
    this.label.setVisible(true);

    try {
      for (const step of steps) {
        if (this.aborted || !this.scene.sys.isActive()) break;
        if (step.type === "vignette") {
          await this.narrative.showVignette(step);
        } else if (step.type === "bubble") {
          await this.narrative.showBubble(step.target, step.text, step);
        }
      }
    } finally {
      this.restore(shouldResumeFollow);
      if (this.queue.length) {
        const next = this.queue.shift();
        this.play(next.steps, next.options);
      }
    }
  }

  /** ENTER: cierra el diálogo actual y reanuda la partida de inmediato. */
  skip() {
    if (!this.active || this.aborted) return;
    this.aborted = true;
    this.narrative.dismissAll();
  }

  restore(resumeFollow = null) {
    if (!this.active) return;
    this.active = false;

    this.driftTween?.stop();
    this.driftTween = null;
    this.label.setVisible(false);

    const cam = this.scene.cameras.main;
    if (this.prevLerp && cam.lerp) {
      cam.lerp.x = this.prevLerp.x;
      cam.lerp.y = this.prevLerp.y;
    }
    this.prevLerp = null;

    if ((resumeFollow ?? true) && this.player && this.scene.sys.isActive()) {
      cam.startFollow(this.player, true, 0.1, 0.1);
    }

    this.onResume?.();
  }
}
