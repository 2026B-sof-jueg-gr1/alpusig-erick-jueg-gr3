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
 * Soporta los 4 estados de movimiento y el sistema exclusivo de combate con
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

    // Salud y estado de combate
    this.maxHealth = 100;
    this.health = 100;
    this.invulnerableUntil = 0;

    // Variables de animación, Dory y Hoplón
    this.walkPhase = 0;
    this.baseY = y;
    this.postureUntil = 0;
    this.isGuarding = false;
    this.isDucked = false;
    this.isChargingHeavy = false;
    this.isDashing = false;
    this.dashUntil = 0;
    this.dodgeCooldownUntil = 0;
    this.comboStep = 0;
    this.comboResetAt = 0;
    this.attackCooldownUntil = 0;
    this.poseUntil = 0;
    this.currentPoseTexture = null;

    this.setGameplayState(initialState);
  }

  setGameplayState(state) {
    this.gameplayState = state;
    this.isChargingHeavy = false;
    this.isDashing = false;
    this.isDucked = false;
    this.currentPoseTexture = null;

    if (state === SPARTAN_STATES.PEACEFUL_GUARD) {
      this.hasShield = false;
      this.hasSpear = false;
      this.isGuarding = false;
    } else if (state === SPARTAN_STATES.WOUNDED_FLEE || state === SPARTAN_STATES.DESPERATE_SPRINT) {
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
      if (this.isDucked) {
        this.setTexture("spartan_wounded_duck");
        this.body.setSize(34, 48).setOffset(12, 6);
      } else {
        this.setTexture("spartan_wounded");
        this.body.setSize(34, 70).setOffset(12, 4);
      }
      return;
    }

    if (this.hasSpear && this.hasShield) {
      if (this.currentPoseTexture) {
        this.setTexture(this.currentPoseTexture);
      } else if (this.isGuarding) {
        this.setTexture("spartan_armed_guard");
      } else {
        this.setTexture("spartan_armed");
      }
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
      this.isGuarding = false;
      this.isChargingHeavy = false;
      this.isDashing = false;
      this.isDucked = false;
      this.currentPoseTexture = null;
      this.applyStateVisuals();
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

  // ==========================================================================
  // MECÁNICAS DE COMBATE: DORY Y HOPLÓN (ESTADO 2)
  // ==========================================================================

  performQuickThrust(time) {
    if (time < this.attackCooldownUntil || this.isChargingHeavy) return;

    this.comboStep = time <= this.comboResetAt ? (this.comboStep % 3) + 1 : 1;
    this.comboResetAt = time + 720;
    this.attackCooldownUntil = time + (this.comboStep === 3 ? 380 : 250);

    this.showPose("spartan_armed_thrust", 170);
    this.setVelocityX(this.facing * (this.comboStep === 3 ? 170 : 95));
    this.dashUntil = time + 110;
    this.isDashing = true;

    const damage = this.comboStep === 3 ? 32 : 20;
    const range = this.comboStep === 3 ? 105 : 90;
    const knockback = this.comboStep === 3 ? 165 : 70;

    this.scene.events.emit("spartan-attack", {
      type: "quick_thrust",
      comboStep: this.comboStep,
      damage,
      range,
      knockback,
      breaksGuard: false,
      stunMs: 0
    });
  }

  performHeavySweep(time) {
    if (time < this.attackCooldownUntil || this.isChargingHeavy) return;

    this.isChargingHeavy = true;
    this.attackCooldownUntil = time + 680;
    this.setVelocityX(0);
    this.setTint(0xfde68a);

    // Breve tiempo de carga visual antes del barrido / estocada pesada
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.94,
      scaleY: 1.04,
      duration: 210,
      ease: "Quad.easeIn",
      onComplete: () => {
        if (!this.active || !this.controlEnabled) {
          this.clearTint();
          this.isChargingHeavy = false;
          return;
        }
        this.clearTint();
        this.setScale(1);
        this.isChargingHeavy = false;

        this.showPose("spartan_armed_thrust", 240);
        this.setVelocityX(this.facing * 240);
        this.dashUntil = this.scene.time.now + 150;
        this.isDashing = true;

        this.scene.events.emit("spartan-attack", {
          type: "heavy_sweep",
          comboStep: 0,
          damage: 42,
          range: 124,
          knockback: 250,
          breaksGuard: true,
          stunMs: 450
        });
      }
    });
  }

  performShieldBash(time) {
    if (time < this.attackCooldownUntil || this.isChargingHeavy || !this.hasShield) return;

    this.attackCooldownUntil = time + 520;
    this.showPose("spartan_armed_guard", 230);
    this.setVelocityX(this.facing * 330);
    this.dashUntil = time + 175;
    this.isDashing = true;

    this.scene.events.emit("spartan-attack", {
      type: "shield_bash",
      comboStep: 0,
      damage: 14,
      range: 80,
      knockback: 185,
      breaksGuard: true,
      stunMs: 1250
    });
  }

  showPose(textureKey, durationMs) {
    this.currentPoseTexture = textureKey;
    this.poseUntil = this.scene.time.now + durationMs;
    this.applyStateVisuals();
  }

  // ==========================================================================
  // MANIOBRA DE ESQUIVE EN ESTADO 3 (HERIDO)
  // ==========================================================================

  performWoundedDodge(time, dir) {
    if (time < this.dodgeCooldownUntil || this.isDashing) return;
    this.dodgeCooldownUntil = time + 950;
    const dodgeDir = dir !== 0 ? dir : -1;
    this.faceDirection(dodgeDir);
    this.setVelocityX(dodgeDir * 245);
    this.dashUntil = time + 210;
    this.isDashing = true;

    this.scene.tweens.add({
      targets: this,
      alpha: 0.72,
      duration: 105,
      yoyo: true
    });
  }

  // ==========================================================================
  // DAÑO Y BLOQUEO DIRECCIONAL CON HOPLÓN
  // ==========================================================================

  isFrontalSource(attackerX) {
    if (attackerX === undefined || attackerX === null) return false;
    const dx = attackerX - this.x;
    return this.facing > 0 ? dx >= -10 : dx <= 10;
  }

  takeDamage(amount, attackerX, time, { ignoreGuard = false } = {}) {
    if (this.health <= 0) return { tookDamage: false, blocked: false };

    // Guardia Férrea: bloquea el 100% del daño frontal
    if (
      this.gameplayState === SPARTAN_STATES.ACTIVE_COMBAT &&
      this.hasShield &&
      this.isGuarding &&
      !ignoreGuard &&
      this.isFrontalSource(attackerX)
    ) {
      this.scene.cameras.main.shake(70, 0.0025);
      return { tookDamage: false, blocked: true };
    }

    if (time < this.invulnerableUntil) {
      return { tookDamage: false, blocked: false };
    }

    this.health = Math.max(0, this.health - amount);
    this.invulnerableUntil = time + 700;
    this.setTint(0xff4d4d);
    this.scene.cameras.main.shake(140, 0.007);
    this.scene.time.delayedCall(170, () => {
      if (this.active && !this.isChargingHeavy) this.clearTint();
    });

    return { tookDamage: true, blocked: false };
  }

  getMovementSpeed() {
    switch (this.gameplayState) {
      case SPARTAN_STATES.PEACEFUL_GUARD:
        return 175;
      case SPARTAN_STATES.ACTIVE_COMBAT:
        return this.isGuarding ? 115 : 225;
      case SPARTAN_STATES.WOUNDED_FLEE:
        return this.isDucked ? 42 : 108;
      case SPARTAN_STATES.DESPERATE_SPRINT:
        return 265;
      default:
        return 175;
    }
  }

  update(time, delta, cursors, keys) {
    if (!this.controlEnabled) return;

    if (this.currentPoseTexture && time >= this.poseUntil) {
      this.currentPoseTexture = null;
      this.applyStateVisuals();
    }

    if (this.isDashing) {
      if (time >= this.dashUntil) {
        this.isDashing = false;
      } else {
        return;
      }
    }

    if (this.isChargingHeavy) {
      this.setVelocityX(0);
      return;
    }

    const left = cursors.left.isDown || keys.A?.isDown;
    const right = cursors.right.isDown || keys.D?.isDown;
    const down = cursors.down.isDown || keys.S?.isDown;
    const moveDir = (right ? 1 : 0) - (left ? 1 : 0);

    // Estado 3: Agacharse ante flechas o esquivar con Espacio
    if (this.gameplayState === SPARTAN_STATES.WOUNDED_FLEE) {
      const nextDuck = Boolean(down);
      if (nextDuck !== this.isDucked) {
        this.isDucked = nextDuck;
        this.applyStateVisuals();
      }
      if (cursors.space && Phaser.Input.Keyboard.JustDown(cursors.space)) {
        this.performWoundedDodge(time, moveDir);
        return;
      }
    } else {
      this.isDucked = false;
    }

    // Estado 2: Guardia Férrea con escudo (L o Shift)
    const wantsGuard =
      this.gameplayState === SPARTAN_STATES.ACTIVE_COMBAT &&
      this.hasShield &&
      Boolean(keys.L?.isDown || keys.SHIFT?.isDown);

    if (wantsGuard !== this.isGuarding) {
      this.isGuarding = wantsGuard;
      this.applyStateVisuals();
    }

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

    // Estado 1: postura marcial visual sin daño
    if (
      this.gameplayState === SPARTAN_STATES.PEACEFUL_GUARD &&
      keys.J &&
      Phaser.Input.Keyboard.JustDown(keys.J)
    ) {
      this.triggerMartialPosture(time);
      return;
    }

    // Estado 2: Acciones de Combate (Dory + Hoplón)
    if (this.gameplayState === SPARTAN_STATES.ACTIVE_COMBAT) {
      if (keys.J && Phaser.Input.Keyboard.JustDown(keys.J)) {
        if (this.isGuarding) {
          this.performShieldBash(time);
        } else {
          this.performQuickThrust(time);
        }
      } else if (keys.K && Phaser.Input.Keyboard.JustDown(keys.K)) {
        this.performHeavySweep(time);
      }
    }
  }

  applyWalkCadence(delta, speed) {
    this.walkPhase += (delta / 1000) * (speed / 24);
    const tiltAmplitude = this.gameplayState === SPARTAN_STATES.WOUNDED_FLEE ? 5.2 : 1.8;
    this.setAngle(Math.sin(this.walkPhase) * tiltAmplitude);
  }
}
