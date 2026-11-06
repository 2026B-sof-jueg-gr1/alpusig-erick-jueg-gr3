import { WIDTH, HEIGHT, COLORS } from "../config/constants.js";

/**
 * Gestiona todos los componentes visuales de la interfaz de usuario en partida (HUD).
 * Cumple con el Principio de Responsabilidad Única (SRP) aislando la presentación visual
 * y las animaciones de texto del estado interno de la física y lógica del juego.
 */
export class HUD {
  constructor(scene) {
    this.scene = scene;
    this.messageUntil = 0;
    this.create();
  }

  create() {
    // 1. Panel de estado del jugador (Esquina superior izquierda)
    this.scene.add.rectangle(18, 18, 310, 78, 0x101b2d, 0.85).setOrigin(0);
    this.scene.add.text(32, 27, "SPARTAN", { fontSize: "15px", color: "#eaf4ff" });
    
    this.healthBar = this.scene.add.rectangle(32, 52, 240, 14, COLORS.red).setOrigin(0);
    this.scene.add.rectangle(32, 52, 240, 14).setOrigin(0).setStrokeStyle(2, COLORS.snow);
    this.statusText = this.scene.add.text(32, 73, "VIDA 100", { fontSize: "13px", color: "#eaf4ff" });
    
    // 2. Información de partida y estadísticas (Esquina superior derecha)
    this.infoText = this.scene.add.text(WIDTH - 25, 25, "", {
      fontSize: "18px", color: "#f4c542", align: "right"
    }).setOrigin(1, 0);

    // 3. Indicador de arma activa
    this.weaponText = this.scene.add.text(32, 112, "", {
      fontSize: "16px", color: "#7fd8ff"
    });

    // 4. Indicador de pausa
    this.scene.add.text(WIDTH - 25, HEIGHT - 31, "P: Pausa", {
      fontSize: "14px", color: "#b8dcf2"
    }).setOrigin(1);

    // 5. Mensaje central dinámico (alertas, oleadas, golpes críticos)
    this.messageText = this.scene.add.text(WIDTH / 2, 115, "", {
      fontSize: "24px", color: "#f4c542", stroke: "#23272f", strokeThickness: 5
    }).setOrigin(0.5);

    // 6. Barra de vida del Jefe
    this.bossBarContainer = this.scene.add.rectangle(WIDTH / 2, 35, 360, 18, COLORS.charcoal)
      .setStrokeStyle(2, COLORS.ice)
      .setVisible(false);

    this.bossBar = this.scene.add.rectangle(WIDTH / 2 - 178, 35, 356, 12, COLORS.red)
      .setOrigin(0, 0.5)
      .setVisible(false);

    this.bossNameText = this.scene.add.text(WIDTH / 2, 58, "", {
      fontSize: "14px", color: "#eaf4ff"
    }).setOrigin(0.5).setVisible(false);
  }

  update({ playerHealth, kills, score, combo, activeSpears, weaponName, bossEntity }, time) {
    // Actualizar barra de vida del jugador
    this.healthBar.width = Math.max(0, 240 * (playerHealth / 100));
    this.statusText.setText(`VIDA ${playerHealth}`);

    // Actualizar información de progreso
    this.infoText.setText(
      `ENEMIGOS  ${kills}/30\nPUNTOS  ${score}\nCOMBO  x${combo}\nLANZAS  ${activeSpears}/4`
    );

    // Actualizar texto del arma seleccionada
    this.weaponText.setText(`ARMA [1/2]: ${weaponName}`);

    // Actualizar barra del jefe si está activo
    if (bossEntity?.active) {
      const ratio = Math.max(0, bossEntity.health / bossEntity.maxHealth);
      this.bossBar.width = 356 * ratio;
    }

    // Limpiar mensaje central tras su tiempo límite
    if (time > this.messageUntil) {
      this.messageText.setText("");
    }
  }

  showMessage(message, duration = 1900) {
    this.messageText.setText(message);
    this.messageUntil = this.scene.time.now + duration;
  }

  showDamageNumber(x, y, damage, critical) {
    const number = this.scene.add.text(x, y, `${critical ? "CRÍTICO " : ""}${damage}`, {
      fontSize: critical ? "20px" : "16px",
      color: critical ? "#f4c542" : "#eaf4ff",
      stroke: "#23272f",
      strokeThickness: 4
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: number,
      y: y - 35,
      alpha: 0,
      duration: 550,
      onComplete: () => number.destroy()
    });
  }

  showBossBar(bossName) {
    this.bossBarContainer.setVisible(true);
    this.bossBar.setVisible(true);
    this.bossNameText.setText(bossName).setVisible(true);
  }

  hideBossBar() {
    this.bossBarContainer.setVisible(false);
    this.bossBar.setVisible(false);
    this.bossNameText.setVisible(false);
  }
}

