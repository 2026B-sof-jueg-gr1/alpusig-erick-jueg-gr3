import { WIDTH, HEIGHT, SPARTA_COLORS } from "../config/constants.js";

const PANEL_WIDTH = 980;
const PANEL_HEIGHT = 540;

const DEMO_X = -240;
const DEMO_Y = -8;
const DEMO_W = 320;
const DEMO_H = 300;

const SECTIONS = [
  {
    title: "MOVIMIENTO Y EXPLORACIÓN",
    rows: [
      { key: "A / D", action: "Caminar por el pueblo", demo: "walk" },
      { key: "E", action: "Hablar con familia y vecinos", demo: "talk" }
    ]
  },
  {
    title: "COMBATE · DORY + HOPLÓN",
    rows: [
      { key: "J", action: "Estocada rápida (combo x3)", demo: "thrust" },
      { key: "K", action: "Barrido pesado con empuje", demo: "sweep" },
      { key: "Shift / L", action: "Guardia férrea frontal", demo: "guard" },
      { key: "Shift + J", action: "Golpe de escudo", demo: "bash" }
    ]
  },
  {
    title: "HERIDO · HUIDA",
    rows: [
      { key: "S / ↓", action: "Agacharse ante las flechas", demo: "duck" },
      { key: "Espacio", action: "Esquive desesperado", demo: "dodge" }
    ]
  },
  {
    title: "NARRATIVA Y SISTEMA",
    rows: [
      { key: "ENTER", action: "Avanzar diálogos y cinemáticas", demo: "enter" },
      { key: "P", action: "Pausar la partida", demo: "pause" }
    ]
  }
];

/** Demo visual de cada control, reutilizando las skins y animaciones ya cargadas. */
const DEMOS = {
  walk: { texture: "spartan_armed_walk_sheet", anim: "spartan_armed_walk_cycle", label: "A / D · CAMINAR", motion: null },
  talk: { texture: "spartan_armed", label: "E · HABLAR CON EL PUEBLO", motion: "bob" },
  thrust: { texture: "spartan_armed_thrust", label: "J · ESTOCADA RÁPIDA", motion: "thrust" },
  sweep: { texture: "spartan_armed_thrust", label: "K · BARRIDO PESADO", motion: "sweep" },
  guard: { texture: "spartan_armed_guard", label: "SHIFT / L · GUARDIA FÉRREA", motion: "guard" },
  bash: { texture: "spartan_armed_guard", label: "SHIFT + J · GOLPE DE ESCUDO", motion: "bash" },
  duck: { texture: "spartan_wounded_duck", label: "S / ↓ · AGACHARSE", motion: "duck" },
  dodge: { texture: "spartan_desperate_sprint_sheet", anim: "spartan_desperate_sprint_cycle", label: "ESPACIO · ESQUIVE", motion: "dodge" },
  enter: { texture: "spartan_kneeling_wounded", label: "ENTER · AVANZAR LECTURA", motion: "tremble" },
  pause: { texture: "spartan_armed", label: "P · PAUSA", motion: null }
};

/**
 * Pantalla de controles del menú: recuadro de cómic con una demo animada del
 * control seleccionado y una leyenda interactiva agrupada por contexto.
 */
export class ControlsOverlay {
  constructor(scene) {
    this.scene = scene;
    this.visible = false;
    this.selectedDemo = null;
    this.demoHits = [];
    this.enterSkipping = false;
    this.onEscape = () => this.hide();
    this.onEnter = () => this.handleEnterDemo();

    this.backdrop = scene.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x08060a, 0.88)
      .setDepth(1000)
      .setInteractive()
      .setVisible(false);
    this.backdrop.on("pointerdown", () => this.hide());

    this.panel = scene.add.container(WIDTH / 2, HEIGHT / 2).setDepth(1001).setVisible(false);
    this.buildPanel();

    scene.events.once("shutdown", () => this.destroy());
  }

  buildPanel() {
    this.buildFrame();

    this.addText(0, -PANEL_HEIGHT / 2 + 34, "CONTROLES", {
      fontFamily: "Georgia, serif", fontSize: "32px", fontStyle: "bold",
      color: "#3a2a1c", letterSpacing: 6
    }, true);
    this.addText(0, -PANEL_HEIGHT / 2 + 78, "DORY + HOPLÓN  ·  HAZ CLIC EN UNA TECLA PARA VERLA", {
      fontFamily: "Arial, sans-serif", fontSize: "12px", color: "#7a5c38", letterSpacing: 2
    }, true);

    this.addSoldierFrame();
    this.addLegend();

    this.closeButton = this.addText(0, PANEL_HEIGHT / 2 - 34, "VOLVER  [ESC]", {
      fontFamily: "Georgia, serif", fontSize: "15px", fontStyle: "bold",
      color: "#fff4d6", backgroundColor: "#7a1212",
      padding: { left: 18, right: 18, top: 7, bottom: 7 }
    }, true).setInteractive({ useHandCursor: true });
    this.closeButton.on("pointerover", () => this.closeButton.setStyle({ backgroundColor: "#9e1b1b" }));
    this.closeButton.on("pointerout", () => this.closeButton.setStyle({ backgroundColor: "#7a1212" }));
    this.closeButton.on("pointerdown", () => this.hide());

    this.panel.bringToTop(this.closeButton);
  }

  addText(x, y, text, style, centered = false) {
    const label = this.scene.add.text(x, y, text, style);
    if (centered) label.setOrigin(0.5);
    this.panel.add(label);
    return label;
  }

  buildFrame() {
    const g = this.scene.add.graphics();
    g.fillStyle(0x080605, 0.6);
    g.fillRoundedRect(-PANEL_WIDTH / 2 + 7, -PANEL_HEIGHT / 2 + 9, PANEL_WIDTH, PANEL_HEIGHT, 12);
    g.fillStyle(SPARTA_COLORS.parchment, 0.98);
    g.fillRoundedRect(-PANEL_WIDTH / 2, -PANEL_HEIGHT / 2, PANEL_WIDTH, PANEL_HEIGHT, 12);
    g.lineStyle(4, SPARTA_COLORS.ink, 1);
    g.strokeRoundedRect(-PANEL_WIDTH / 2, -PANEL_HEIGHT / 2, PANEL_WIDTH, PANEL_HEIGHT, 12);
    g.lineStyle(1.5, SPARTA_COLORS.bronze, 0.9);
    g.strokeRoundedRect(-PANEL_WIDTH / 2 + 8, -PANEL_HEIGHT / 2 + 8, PANEL_WIDTH - 16, PANEL_HEIGHT - 16, 8);
    g.fillStyle(SPARTA_COLORS.ink, 0.85);
    g.fillRect(-PANEL_WIDTH / 2 + 26, -PANEL_HEIGHT / 2 + 62, PANEL_WIDTH - 52, 2);
    this.panel.add(g);
  }

  addSoldierFrame() {
    const frame = this.scene.add.graphics();
    frame.fillStyle(0x2a2019, 1).fillRoundedRect(DEMO_X - DEMO_W / 2, DEMO_Y - DEMO_H / 2, DEMO_W, DEMO_H, 10);
    frame.lineStyle(2, SPARTA_COLORS.bronze, 0.8).strokeRoundedRect(DEMO_X - DEMO_W / 2, DEMO_Y - DEMO_H / 2, DEMO_W, DEMO_H, 10);
    this.panel.add(frame);

    this.demoLabel = this.addText(DEMO_X, DEMO_Y + DEMO_H / 2 - 14, "", {
      fontFamily: "Georgia, serif", fontSize: "14px", fontStyle: "bold",
      color: "#e8b962", letterSpacing: 1
    }, true);
  }

  addLegend() {
    const left = 60;
    let y = -PANEL_HEIGHT / 2 + 112;

    SECTIONS.forEach((section) => {
      this.addText(left, y, section.title, {
        fontFamily: "Arial, sans-serif", fontSize: "13px", fontStyle: "bold",
        color: "#7a1212", letterSpacing: 2
      });
      y += 25;

      section.rows.forEach((row) => {
        this.addBadge(left, y, row.key);
        this.addText(left + 112, y, row.action, {
          fontFamily: "Georgia, serif", fontSize: "15px", color: "#2d2118"
        });

        const hit = this.scene.add.rectangle(left - 6, y, 402, 24, 0xe8b962, 0)
          .setOrigin(0, 0.5)
          .setInteractive({ useHandCursor: true });
        this.panel.add(hit);
        this.demoHits.push({ id: row.demo, hit });

        hit.on("pointerover", () => {
          if (this.selectedDemo !== row.demo) hit.setFillStyle(0xe8b962, 0.12);
        });
        hit.on("pointerout", () => {
          if (this.selectedDemo !== row.demo) hit.setFillStyle(0xe8b962, 0);
        });
        hit.on("pointerdown", () => this.selectDemo(row.demo));
        y += 25;
      });
      y += 9;
    });
  }

  addBadge(x, y, key) {
    const width = Math.max(60, key.length * 9 + 22);
    const g = this.scene.add.graphics();
    g.fillStyle(0x2d2118, 1).fillRoundedRect(x, y - 12, width, 24, 5);
    g.lineStyle(1.5, SPARTA_COLORS.bronze, 0.9).strokeRoundedRect(x, y - 12, width, 24, 5);
    const text = this.scene.add.text(x + width / 2, y, key, {
      fontFamily: "Arial, sans-serif", fontSize: "12px", fontStyle: "bold", color: "#f6eedb"
    }).setOrigin(0.5);
    this.panel.add([g, text]);
  }

  selectDemo(id) {
    this.selectedDemo = id;
    this.demoHits.forEach(({ id: hitId, hit }) => {
      hit.setFillStyle(0xe8b962, hitId === id ? 0.22 : 0);
    });
    this.showDemo(id);
  }

  showDemo(id) {
    this.demoTween?.stop();
    this.demoTween = null;
    this.soldier?.anims?.stop();
    this.soldier?.destroy();
    this.soldier = null;
    this.clearDemoDialogue();
    this.enterSkipping = false;

    if (id === "enter") {
      this.showEnterDemo();
      return;
    }

    const demo = DEMOS[id] ?? DEMOS.walk;
    this.soldier = this.scene.add.sprite(DEMO_X, DEMO_Y, demo.texture).setScale(2.9);
    this.panel.add(this.soldier);
    this.panel.bringToTop(this.demoLabel);
    this.panel.bringToTop(this.closeButton);

    if (demo.anim && this.scene.anims.exists(demo.anim)) {
      this.soldier.anims.play(demo.anim, true);
    }
    this.applyMotion(demo.motion);
    this.demoLabel.setText(demo.label);
  }

  /** El control ENTER se demuestra con un diálogo real que se salta con ENTER. */
  showEnterDemo() {
    if (!this.demoDialogue) this.buildDemoDialogue();
    this.demoDialogue.setVisible(true).setAlpha(1).setScale(1);
    this.demoHint.setVisible(true);
    this.blinkHint();
    this.demoLabel.setText("ENTER · AVANZAR DIÁLOGO");
  }

  buildDemoDialogue() {
    const dialogue = this.scene.add.container(DEMO_X, DEMO_Y);
    const g = this.scene.add.graphics();
    g.fillStyle(0x080605, 0.5).fillRoundedRect(-136, -58, 280, 116, 8);
    g.fillStyle(SPARTA_COLORS.parchment, 0.98).fillRoundedRect(-140, -62, 280, 116, 8);
    g.lineStyle(3, SPARTA_COLORS.ink, 1).strokeRoundedRect(-140, -62, 280, 116, 8);
    g.lineStyle(1, SPARTA_COLORS.bronze, 0.9).strokeRoundedRect(-134, -56, 268, 104, 5);
    g.fillStyle(SPARTA_COLORS.crimson, 1).fillRoundedRect(-126, -72, 78, 22, 4);
    dialogue.add(g);

    dialogue.add(this.scene.add.text(-87, -61, "GENERAL", {
      fontFamily: "Arial, sans-serif", fontSize: "11px", fontStyle: "bold",
      color: "#fff4d6", letterSpacing: 1
    }).setOrigin(0.5));

    dialogue.add(this.scene.add.text(0, 2, "«Tu puesto está aquí, soldado.\nAlguien debe sostener el escudo...»", {
      fontFamily: "Georgia, serif", fontSize: "14px", color: "#2d2118",
      align: "center", wordWrap: { width: 244 }, lineSpacing: 5
    }).setOrigin(0.5));

    this.demoHint = this.scene.add.text(0, 84, "ENTER para continuar", {
      fontFamily: "Arial, sans-serif", fontSize: "12px", fontStyle: "bold",
      color: "#f6d99a", backgroundColor: "#1a1412dd",
      padding: { left: 8, right: 8, top: 3, bottom: 3 }
    }).setOrigin(0.5);
    dialogue.add(this.demoHint);

    this.demoDialogue = dialogue;
    this.panel.add(dialogue);
  }

  blinkHint() {
    this.scene.tweens.killTweensOf(this.demoHint);
    this.demoHint.setAlpha(1);
    this.scene.tweens.add({
      targets: this.demoHint, alpha: 0.35, duration: 560,
      yoyo: true, repeat: -1, ease: "Sine.easeInOut"
    });
  }

  handleEnterDemo() {
    if (!this.visible || this.selectedDemo !== "enter" || this.enterSkipping || !this.demoDialogue?.visible) return;
    this.enterSkipping = true;
    this.scene.tweens.killTweensOf(this.demoHint);
    this.scene.tweens.add({
      targets: this.demoDialogue,
      alpha: 0, scaleX: 0.94, scaleY: 0.94, duration: 220,
      onComplete: () => {
        this.demoDialogue.setVisible(false);
        this.demoLabel.setText("LA HISTORIA CONTINÚA  →");
        this.scene.time.delayedCall(1500, () => {
          if (this.visible && this.selectedDemo === "enter") {
            this.demoDialogue.setVisible(true).setAlpha(0).setScale(0.94);
            this.scene.tweens.add({
              targets: this.demoDialogue, alpha: 1, scaleX: 1, scaleY: 1, duration: 240
            });
            this.demoHint.setVisible(true);
            this.blinkHint();
            this.demoLabel.setText("ENTER · AVANZAR DIÁLOGO");
          }
          this.enterSkipping = false;
        });
      }
    });
  }

  clearDemoDialogue() {
    if (!this.demoDialogue) return;
    this.scene.tweens.killTweensOf(this.demoDialogue);
    this.scene.tweens.killTweensOf(this.demoHint);
    this.demoDialogue.setVisible(false);
  }

  /** Movimiento procedural sobre la skin existente para simular cada técnica. */
  applyMotion(motion) {
    const sprite = this.soldier;
    sprite.setPosition(DEMO_X, DEMO_Y).setRotation(0).setAlpha(1).setScale(2.9);

    switch (motion) {
      case "thrust":
        this.demoTween = this.scene.tweens.add({
          targets: sprite, x: DEMO_X + 60, duration: 420, yoyo: true, repeat: -1, ease: "Quad.easeOut"
        });
        break;
      case "sweep":
        sprite.setRotation(-0.18);
        this.demoTween = this.scene.tweens.add({
          targets: sprite, x: DEMO_X + 60, rotation: 0.28, duration: 620,
          yoyo: true, repeat: -1, ease: "Sine.easeInOut"
        });
        break;
      case "guard":
        sprite.setY(DEMO_Y + 12);
        this.demoTween = this.scene.tweens.add({
          targets: sprite, y: DEMO_Y - 6, duration: 700, yoyo: true, repeat: -1, ease: "Sine.easeInOut"
        });
        break;
      case "bash":
        this.demoTween = this.scene.tweens.add({
          targets: sprite, x: DEMO_X + 75, duration: 300, hold: 180,
          yoyo: true, repeat: -1, ease: "Cubic.easeOut"
        });
        break;
      case "duck":
        sprite.setY(DEMO_Y + 16);
        this.demoTween = this.scene.tweens.add({
          targets: sprite, y: DEMO_Y + 32, duration: 460, yoyo: true, repeat: -1, ease: "Sine.easeInOut"
        });
        break;
      case "dodge":
        this.demoTween = this.scene.tweens.add({
          targets: sprite, x: DEMO_X + 60, alpha: 0.6, duration: 240,
          yoyo: true, repeat: -1, ease: "Quad.easeOut"
        });
        break;
      case "bob":
        this.demoTween = this.scene.tweens.add({
          targets: sprite, y: DEMO_Y + 6, duration: 620, yoyo: true, repeat: -1, ease: "Sine.easeInOut"
        });
        break;
      case "tremble":
        this.demoTween = this.scene.tweens.add({
          targets: sprite, x: DEMO_X + 2, rotation: 0.02, duration: 90,
          yoyo: true, repeat: -1, ease: "Sine.easeInOut"
        });
        break;
      default:
        // "pause": sin movimiento, el soldado queda quieto.
        break;
    }
  }

  show() {
    if (this.visible) return;
    this.visible = true;
    this.backdrop.setVisible(true).setAlpha(0);
    this.panel.setVisible(true).setAlpha(0).setY(HEIGHT / 2 + 18);

    this.scene.tweens.add({ targets: this.backdrop, alpha: 1, duration: 220 });
    this.scene.tweens.add({ targets: this.panel, alpha: 1, y: HEIGHT / 2, duration: 280, ease: "Back.easeOut" });
    this.selectDemo("walk");
    this.scene.input.keyboard.on("keydown-ESC", this.onEscape);
    this.scene.input.keyboard.on("keydown-ENTER", this.onEnter);
  }

  hide() {
    if (!this.visible) return;
    this.visible = false;
    this.scene.input.keyboard.off("keydown-ESC", this.onEscape);
    this.scene.input.keyboard.off("keydown-ENTER", this.onEnter);
    this.demoTween?.stop();
    this.soldier?.anims?.stop();
    this.scene.tweens.killTweensOf(this.demoHint);
    this.scene.tweens.killTweensOf(this.demoDialogue);

    this.scene.tweens.add({
      targets: [this.backdrop, this.panel],
      alpha: 0,
      duration: 180,
      onComplete: () => {
        if (!this.visible) {
          this.backdrop.setVisible(false);
          this.panel.setVisible(false);
        }
      }
    });
  }

  destroy() {
    this.scene.input.keyboard.off("keydown-ESC", this.onEscape);
    this.scene.input.keyboard.off("keydown-ENTER", this.onEnter);
    this.demoTween?.stop();
    this.backdrop?.destroy();
    this.panel?.destroy();
  }
}
