/**
 * Estados de Jugabilidad definidos para el arco Parte 1: El Precio de la Gloria.
 */
export const SPARTAN_STATES = {
  PEACEFUL_GUARD: "PEACEFUL_GUARD",     // Estado 1: Escena 1
  ACTIVE_COMBAT: "ACTIVE_COMBAT",       // Estado 2: Escena 2 - Hito 2.1
  WOUNDED_FLEE: "WOUNDED_FLEE",         // Estado 3: Escena 2 - Hito 2.3 y Escena 3 - Hito 3.1
  DESPERATE_SPRINT: "DESPERATE_SPRINT"  // Estado 4: Escena 3 - Hito 3.2
};

/**
 * Controlador del Soldado Espartano común (Protagonista de The Last Spartan).
 * Soporta los 4 estados de movimiento y el equipamiento exclusivo de
 * Lanza Espartana (Dory) y Escudo Espartano (Hoplón).
 */
export class SpartanPlayer extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, initialState = SPARTAN_STATES.PEACEFUL_GUARD) {
    super(scene, x, y, "spartan_unarmed");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.body.setSize(34, 72).setOffset(10, 4);

    this.gameplayState = initialState;
    this.controlEnabled = true;
    this.hasSpear = false;
    this.hasShield = false;
    this.facing = 1;

    // Variables de animación y combate (Dory + Hoplón)
    this.walkPhase = 0;
    this.baseY = y;
    this.postureUntil = 0;
    this.isGuarding = false;
    this.isDucked = false;
    this.comboStep = 0;
    this.comboResetAt = 0;
    this.attackCooldownUntil = 0;

    this.applyStateVisuals();
  }

  setGameplayState(state) {
    this.gameplayState = state;
    if (state === SPARTAN_STATES.WOUNDED_FLEE || state === SPARTAN_STATES.DESPERATE_SPRINT) {
      this.hasShield = false;
      this.hasSpear = true;
      this.isGuarding = false;
    } else if (state === SPARTAN_STATES.ACTIVE_COMBAT) {
      this.hasShield = true;
      this.hasSpear = true;
    }
    this.applyStateVisuals();
  }

  equipGear() {
    this.hasSpear = true;
    this.hasShield = true;
    this.applyStateVisuals();

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 140,
      yoyo: true,
      ease: "Quad.easeOut"
    });
  }

  applyStateVisuals() {
    if (
      this.gameplayState === SPARTAN_STATES.WOUNDED_FLEE ||
      this.gameplayState === SPARTAN_STATES.DESPERATE_SPRINT
    ) {
      this.setTexture("spartan_wounded");
      this.body.setSize(34, 70).setOffset(12, 4);
      return;
    }

    if (this.hasSpear && this.hasShield) {
      this.setTexture("spartan_armed");
      this.body.setSize(34, 74).setOffset(16, 6);
    } else {
      this.setTexture("spartan_unarmed");
      this.body.setSize(34, 72).setOffset(10, 4);
    }
  }

  setControlEnabled(enabled) {
    this.controlEnabled = enabled;
    if (!enabled) {
      this.setVelocityX(0);
      this.setAngle(0);
    }
  }

  faceDirection(dir) {
    this.facing = dir < 0 ? -1 : 1;
    this.setFlipX(this.facing < 0);
  }

  /**
   * Animación de postura marcial sin daño (Estado 1 cuando ya porta Dory y Hoplón).
   */
  triggerMartialPosture(time) {
    if (!this.hasSpear || !this.hasShield || time < this.postureUntil) return;
    this.postureUntil = time + 320;
    this.scene.tweens.add({
      targets: this,
      x: this.x + this.facing * 8,
      scaleX: 1.05,
      scaleY: 0.96,
      duration: 120,
      yoyo: true,
      ease: "Quad.easeOut"
    });
  }

  /**
   * Animación dramática golpeando su pecho/escudo con el puño (Hito 1.3).
   */
  playChestBeatAnimation() {
    this.scene.tweens.add({
      targets: this,
      scaleY: 0.94,
      scaleX: 1.06,
      duration: 110,
      yoyo: true,
      repeat: 1,
      ease: "Quad.easeOut"
    });
  }

  /**
   * Desplazamiento cinemático hacia una coordenada X específica.
   */
  walkTo(targetX, speed = 150) {
    return new Promise((resolve) => {
      const distance = Math.abs(targetX - this.x);
      if (distance < 4) {
        this.setPosition(targetX, this.y);
        resolve();
        return;
      }

      this.faceDirection(targetX - this.x);
      const duration = Math.max(120, (distance / speed) * 1000);
      this.scene.tweens.add({
        targets: this,
        x: targetX,
        duration,
        ease: "Linear",
        onUpdate: () => {
          this.angle = Math.sin(this.scene.time.now * 0.015) * 1.8;
        },
        onComplete: () => {
          this.setAngle(0);
          resolve();
        }
      });
    });
  }

  getMovementSpeed() {
    switch (this.gameplayState) {
      case SPARTAN_STATES.PEACEFUL_GUARD:
        return 175;
      case SPARTAN_STATES.ACTIVE_COMBAT:
        return this.isGuarding ? 115 : 225;
      case SPARTAN_STATES.WOUNDED_FLEE:
        return this.isDucked ? 50 : 110;
      case SPARTAN_STATES.DESPERATE_SPRINT:
        return 265;
      default:
        return 175;
    }
  }

  update(time, delta, cursors, keys) {
    if (!this.controlEnabled) return;

    const left = cursors.left.isDown || keys.A?.isDown;
    const right = cursors.right.isDown || keys.D?.isDown;
    const down = cursors.down.isDown || keys.S?.isDown;

    // Estado 3: opción de agacharse ante flechas
    this.isDucked = this.gameplayState === SPARTAN_STATES.WOUNDED_FLEE && down;

    // Estado 2: Guardia Férrea con escudo
    this.isGuarding =
      this.gameplayState === SPARTAN_STATES.ACTIVE_COMBAT &&
      this.hasShield &&
      Boolean(keys.L?.isDown || keys.SHIFT?.isDown);

    const speed = this.getMovementSpeed();

    if (left && !right) {
      this.setVelocityX(-speed);
      this.faceDirection(-1);
      this.applyWalkCadence(delta, speed);
    } else if (right && !left) {
      this.setVelocityX(speed);
      this.faceDirection(1);
      this.applyWalkCadence(delta, speed);
    } else {
      this.setVelocityX(0);
      this.setAngle(0);
    }

    // Estado 1: postura marcial visual sin daño con J si ya está armado
    if (
      this.gameplayState === SPARTAN_STATES.PEACEFUL_GUARD &&
      keys.J &&
      Phaser.Input.Keyboard.JustDown(keys.J)
    ) {
      this.triggerMartialPosture(time);
    }
  }

  applyWalkCadence(delta, speed) {
    this.walkPhase += (delta / 1000) * (speed / 24);
    const tiltAmplitude = this.gameplayState === SPARTAN_STATES.WOUNDED_FLEE ? 4.5 : 1.8;
    this.setAngle(Math.sin(this.walkPhase) * tiltAmplitude);
  }
}

