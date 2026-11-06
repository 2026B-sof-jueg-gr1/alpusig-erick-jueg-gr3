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
  }

  handleMovement(cursors, keys) {
    if (this.health <= 0) return;

    const left = cursors.left.isDown || keys.A.isDown;
    const right = cursors.right.isDown || keys.D.isDown;

    if (left) {
      this.setVelocityX(-220);
      this.setFlipX(true);
      this.facing = -1;
    } else if (right) {
      this.setVelocityX(220);
      this.setFlipX(false);
      this.facing = 1;
    } else {
      this.setVelocityX(0);
    }

    const wantsJump = cursors.up.isDown || keys.W.isDown || cursors.space?.isDown;
    if (wantsJump && this.body.blocked.down && !this.jumpHeld) {
      this.setVelocityY(-420);
      this.jumpHeld = true;
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

