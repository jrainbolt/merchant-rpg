import Phaser from 'phaser';

type Direction = 'down' | 'up' | 'left' | 'right';

type MovementKeys = Record<string, Phaser.Input.Keyboard.Key>;

export class Player {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  private lastDirection: Direction = 'down';

  constructor(
    private scene: Phaser.Scene,
    x: number,
    y: number,
    private speed: number
  ) {
    this.sprite = scene.physics.add.sprite(x, y, 'player-sheet', 0);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setSize(18, 18);
    this.sprite.setOffset(7, 12);
    this.sprite.play('player-idle-down');
  }

  get x(): number {
    return this.sprite.x;
  }

  get y(): number {
    return this.sprite.y;
  }

  handleMovement(cursors: Phaser.Types.Input.Keyboard.CursorKeys, keys: MovementKeys): boolean {
    const left = Boolean(cursors.left?.isDown || keys.A.isDown);
    const right = Boolean(cursors.right?.isDown || keys.D.isDown);
    const up = Boolean(cursors.up?.isDown || keys.W.isDown);
    const down = Boolean(cursors.down?.isDown || keys.S.isDown);
    const velocityX = Number(right) * this.speed - Number(left) * this.speed;
    const velocityY = Number(down) * this.speed - Number(up) * this.speed;

    this.sprite.setVelocity(velocityX, velocityY);
    this.sprite.body?.velocity.normalize().scale(this.speed);

    if (velocityX === 0 && velocityY === 0) {
      this.playIdle();
      return false;
    }

    this.lastDirection = this.getDirection(velocityX, velocityY);
    this.sprite.anims.play(`player-walk-${this.lastDirection}`, true);
    return true;
  }

  stop(): void {
    this.sprite.setVelocity(0);
    this.playIdle();
  }

  private playIdle(): void {
    this.sprite.anims.play(`player-idle-${this.lastDirection}`, true);
  }

  private getDirection(velocityX: number, velocityY: number): Direction {
    if (Math.abs(velocityX) > Math.abs(velocityY)) {
      return velocityX < 0 ? 'left' : 'right';
    }

    return velocityY < 0 ? 'up' : 'down';
  }
}
