import { ComicPanel } from "../ui/ComicPanel.js";
import { SpeechBubble } from "../ui/SpeechBubble.js";

/**
 * Gestor central del Sistema de Viñetas de Cómic Dinámicas.
 * Despliega viñetas en esquinas y bocadillos sobre personajes en el mundo 2D
 * sin pausar el juego durante fases caminables o de combate.
 */
export class ComicNarrativeManager {
  constructor(scene, audio = null) {
    this.scene = scene;
    this.audio = audio;
    this.activeVignettes = new Map();
    this.activeBubbles = new Set();

    scene.events.once("shutdown", () => this.clearAll());
    scene.events.once("destroy", () => this.clearAll());
  }

  async showVignette(options) {
    const corner = options.corner || "top-left";
    const existing = this.activeVignettes.get(corner);
    if (existing && !existing.isDestroyed) {
      existing.destroy();
    }

    const panel = new ComicPanel(this.scene, options);
    this.activeVignettes.set(corner, panel);
    this.audio?.playComicPop();

    await panel.show();
    if (this.activeVignettes.get(corner) === panel) {
      this.activeVignettes.delete(corner);
    }
    return panel;
  }

  async showBubble(target, text, options = {}) {
    if (!target || !target.active) return null;

    // Limpiar otro bocadillo del mismo personaje para evitar superposición
    for (const bubble of this.activeBubbles) {
      if (bubble.target === target && !bubble.isDestroyed) {
        bubble.destroy();
        this.activeBubbles.delete(bubble);
      }
    }

    const bubble = new SpeechBubble(this.scene, target, text, options);
    this.activeBubbles.add(bubble);
    this.audio?.playComicPop();

    await bubble.show();
    this.activeBubbles.delete(bubble);
    return bubble;
  }

  /**
   * Ejecuta una secuencia ordenada de viñetas y bocadillos.
   * Cada paso acepta: { type: "vignette" | "bubble", delayAfter?: number, ... }
   */
  async playSequence(steps = []) {
    for (const step of steps) {
      if (!this.scene?.sys?.isActive()) break;
      if (step.onStart) step.onStart();

      if (step.type === "vignette") {
        await this.showVignette(step);
      } else if (step.type === "bubble") {
        await this.showBubble(step.target, step.text, step);
      }

      if (step.delayAfter && this.scene?.sys?.isActive()) {
        await new Promise((resolve) => this.scene.time.delayedCall(step.delayAfter, resolve));
      }
    }
  }

  update() {
    for (const bubble of this.activeBubbles) {
      if (bubble.isDestroyed) {
        this.activeBubbles.delete(bubble);
      } else {
        bubble.updatePosition();
      }
    }
  }

  clearAll() {
    for (const panel of this.activeVignettes.values()) {
      panel.destroy();
    }
    this.activeVignettes.clear();

    for (const bubble of this.activeBubbles) {
      bubble.destroy();
    }
    this.activeBubbles.clear();
  }
}

