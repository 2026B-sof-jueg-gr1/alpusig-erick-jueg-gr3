import { COLORS } from "../config/constants.js";

/**
 * Entidad que representa al jugador principal (Espartano).
 * Encapsula la física, atributos, animaciones de daño y procesamiento de movimiento.
 * Aplica el principio de Responsabilidad Única (SRP) aislando la lógica del jugador.
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "player");
    
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.body.setSize(30, 68).setOffset(9, 4);

    this.health = 100;
    this.invulnerableUntil = 0;
    this.attackUntil = 0;
    this.attackCooldownUntil = 0;
    this.facing = 1;
    this.jumpHeld = false;
    this.walkPhase = 0;
    this.wasGrounded = true;
  }

  handleMovement(cursors, keys) {
    if (this.health <= 0) return;

    const left = cursors.left.isDown || keys.A.isDown;
    const right = cursors.right.isDown || keys.D.isDown;
    const moving = left || right;
    const grounded = this.body.blocked.down;

    if (grounded && !this.wasGrounded) {
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.08,
        scaleY: 0.92,
        duration: 90,
        yoyo: true,
        ease: "Quad.easeOut"
      });
    }
    this.wasGrounded = grounded;

    if (left) {
      this.setVelocityX(-220);
      this.setFlipX(true);
      this.facing = -1;
      this.walkPhase += 0.16;
    } else if (right) {
      this.setVelocityX(220);
      this.setFlipX(false);
      this.facing = 1;
      this.walkPhase += 0.16;
    } else {
      this.setVelocityX(0);
      this.walkPhase += 0.04;
    }

    if (moving && this.body.blocked.down) {
      this.setAngle(Math.sin(this.walkPhase) * 2.2);
      this.setScaleY(1 + Math.abs(Math.sin(this.walkPhase)) * 0.018);
    } else if (this.body.blocked.down) {
      this.setAngle(0);
      this.setScaleY(1);
    }

    const wantsJump = cursors.up.isDown || keys.W.isDown || cursors.space?.isDown;
    if (wantsJump && this.body.blocked.down && !this.jumpHeld) {
      this.setVelocityY(-420);
      this.jumpHeld = true;
      this.scene.tweens.add({
        targets: this,
        scaleX: 0.92,
        scaleY: 1.08,
        duration: 120,
        yoyo: true,
        ease: "Quad.easeOut"
      });
    }
    if (!wantsJump) {
      this.jumpHeld = false;
    }
  }

  takeDamage(amount, time) {
    if (time < this.invulnerableUntil) return false;
    
    this.health = Math.max(0, this.health - amount);
    this.invulnerableUntil = time + 750;
    this.setTint(COLORS.red);
    this.scene.cameras.main.shake(130, 0.006);
    this.scene.time.delayedCall(180, () => this.clearTint());
    
    return true;
  }

  heal(amount) {
    this.health = Math.min(100, this.health + amount);
  }
}

