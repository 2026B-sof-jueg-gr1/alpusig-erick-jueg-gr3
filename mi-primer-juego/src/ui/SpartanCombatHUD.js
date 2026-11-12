import { WIDTH, HEIGHT, SPARTA_COLORS, GORGE_COLORS } from "../config/constants.js";

/**
 * Interfaz de Escena 2 (Combate Lanza/Escudo, Tutorial Hito 2.1,
 * Viñeteado crítico de sangre para Hito 2.2/2.3 y estado de huida).
 */
export class SpartanCombatHUD {
  constructor(scene) {
    this.scene = scene;
    this.create();
  }

  create() {
    // 1. Panel de vitalidad y equipo (Esquina superior izquierda)
    this.panelBg = this.scene.add.rectangle(20, 20, 286, 74, 0x12151a, 0.85)
      .setOrigin(0)
      .setStrokeStyle(1.5, SPARTA_COLORS.bronze)
      .setScrollFactor(0)
      .setDepth(125);

    this.titleLabel = this.scene.add.text(34, 28, "SOLDADO ESPARTANO", {
      fontFamily: "Georgia, serif",
      fontSize: "13px",
      fontStyle: "bold",
      color: "#f4c542"
    }).setScrollFactor(0).setDepth(126);

    this.healthBarBg = this.scene.add.rectangle(34, 51, 224, 13, 0x2b1212)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(126);

    this.healthBar = this.scene.add.rectangle(34, 51, 224, 13, GORGE_COLORS.dangerRed)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(127);

    this.healthBorder = this.scene.add.rectangle(34, 51, 224, 13)
      .setOrigin(0)
      .setStrokeStyle(1.5, 0xf6eedb)
      .setScrollFactor(0)
      .setDepth(128);

    this.gearStatusText = this.scene.add.text(34, 70, "DORY + HOPLÓN  •  100%", {
      fontFamily: "Arial, sans-serif",
      fontSize: "12px",
      color: "#e2e8f0"
    }).setScrollFactor(0).setDepth(126);

    // 2. Indicador de objetivo (Esquina superior derecha)
    this.objectiveText = this.scene.add.text(WIDTH - 24, 26, "OBJETIVO: Avanza por el desfiladero →", {
      fontFamily: "Georgia, serif",
      fontSize: "14px",
      color: "#f6eedb",
      backgroundColor: "#12151acc",
      padding: { left: 12, right: 12, top: 6, bottom: 6 }
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(126);

    // 3. Indicadores breves de tutorial de combate (Hito 2.1)
    this.tutorialBox = this.scene.add.text(
      WIDTH / 2,
      HEIGHT - 22,
      "A/D: Mover   •   J: Estocada (x3)   •   K: Barrido Pesado   •   Shift/L: Guardia Férrea   •   Shift+J: Golpe de Escudo   •   P: Pausa",
      {
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        color: "#f6eedb",
        backgroundColor: "#12151ad9",
        padding: { left: 14, right: 14, top: 6, bottom: 6 }
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(126);

    // 4. Viñeteado de daño crítico (bordes rojos para Hito 2.2 y 2.3)
    this.redVignette = this.scene.add.graphics().setScrollFactor(0).setDepth(118).setAlpha(0);
    const borderThick = 46;
    this.redVignette.fillStyle(GORGE_COLORS.bloodRed, 0.72);
    this.redVignette.fillRect(0, 0, WIDTH, borderThick);
    this.redVignette.fillRect(0, HEIGHT - borderThick, WIDTH, borderThick);
    this.redVignette.fillRect(0, 0, borderThick, HEIGHT);
    this.redVignette.fillRect(WIDTH - borderThick, 0, borderThick, HEIGHT);
    this.redVignette.lineStyle(22, 0x450507, 0.55);
    this.redVignette.strokeRect(12, 12, WIDTH - 24, HEIGHT - 24);
  }

  updatePlayerStatus(player) {
    const ratio = Phaser.Math.Clamp(player.health / player.maxHealth, 0, 1);
    this.healthBar.width = Math.max(0, 224 * ratio);

    const gearLabel = player.hasShield ? "DORY + HOPLÓN" : "HERIDO (SIN ESCUDO)";
    this.gearStatusText.setText(`${gearLabel}  •  ${Math.ceil(player.health)}%`);
  }

  setObjective(text, accentColor = "#f6eedb") {
    this.objectiveText.setText(text).setColor(accentColor);
  }

  setControlsHint(text) {
    this.tutorialBox.setText(text).setVisible(true);
  }

  setHUDVisible(visible) {
    [
      this.panelBg,
      this.titleLabel,
      this.healthBarBg,
      this.healthBar,
      this.healthBorder,
      this.gearStatusText,
      this.objectiveText,
      this.tutorialBox
    ].forEach((obj) => obj.setVisible(visible));
  }

  setCriticalVignette(alpha, pulse = false) {
    this.scene.tweens.killTweensOf(this.redVignette);
    this.redVignette.setAlpha(alpha);
    if (pulse && alpha > 0) {
      this.scene.tweens.add({
        targets: this.redVignette,
        alpha: { from: Math.max(0.25, alpha - 0.2), to: Math.min(0.95, alpha + 0.18) },
        duration: 550,
        yoyo: true,
        loop: -1,
        ease: "Sine.easeInOut"
      });
    }
  }

  showFloatingText(x, y, text, color = "#ffffff") {
    const label = this.scene.add.text(x, y, text, {
      fontFamily: "Georgia, serif",
      fontSize: "14px",
      fontStyle: "bold",
      color,
      stroke: "#0b0908",
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(120);

    this.scene.tweens.add({
      targets: label,
      y: y - 28,
      alpha: 0,
      duration: 620,
      onComplete: () => label.destroy()
    });
  }
}

