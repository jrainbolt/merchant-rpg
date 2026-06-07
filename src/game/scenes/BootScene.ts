import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.loadGeneratedPlayerSpritesheet();
  }

  create(): void {
    this.createPlayerAnimations();
    this.createTexture('hero', 0x2563eb);
    this.createTexture('companion', 0xf59e0b);
    this.createTexture('npc', 0xec4899);
    this.createTexture('elder', 0x8b5cf6);
    this.createTexture('guard', 0x22c55e);
    this.createTexture('slime', 0x34d399, 24, 18);
    this.createTexture('wall', 0x4b5563, 32, 32);
    this.createTexture('tree', 0x166534, 32, 32);
    this.createTexture('portal', 0xfde68a, 32, 32);
    this.scene.start('TitleScene');
  }

  private loadGeneratedPlayerSpritesheet(): void {
    const frameWidth = 32;
    const frameHeight = 32;
    const columns = 3;
    const rows = 4;
    const canvas = document.createElement('canvas');
    canvas.width = frameWidth * columns;
    canvas.height = frameHeight * rows;
    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    const shirtColors = [0x2563eb, 0x1d4ed8, 0x3b82f6];
    const directions = ['down', 'left', 'right', 'up'];

    directions.forEach((_direction, row) => {
      for (let frame = 0; frame < columns; frame += 1) {
        const x = frame * frameWidth;
        const y = row * frameHeight;
        const stepOffset = frame === 1 ? -2 : frame === 2 ? 2 : 0;

        context.fillStyle = '#00000000';
        context.clearRect(x, y, frameWidth, frameHeight);

        context.fillStyle = '#f2c59b';
        context.fillRect(x + 11, y + 4, 10, 9);

        context.fillStyle = '#3f2a1d';
        context.fillRect(x + 9, y + 2, 14, 5);

        context.fillStyle = Phaser.Display.Color.IntegerToColor(shirtColors[frame]).rgba;
        context.fillRect(x + 9, y + 13, 14, 10);

        context.fillStyle = '#111827';
        context.fillRect(x + 10, y + 23, 4, 6 + Math.max(0, stepOffset));
        context.fillRect(x + 18, y + 23, 4, 6 + Math.max(0, -stepOffset));

        context.fillStyle = '#f9fafb';
        if (row === 0) {
          context.fillRect(x + 12, y + 8, 2, 2);
          context.fillRect(x + 18, y + 8, 2, 2);
        } else if (row === 1) {
          context.fillRect(x + 10, y + 8, 2, 2);
        } else if (row === 2) {
          context.fillRect(x + 20, y + 8, 2, 2);
        }
      }
    });

    this.load.spritesheet('player-sheet', canvas.toDataURL('image/png'), {
      frameWidth,
      frameHeight
    });
  }

  private createPlayerAnimations(): void {
    const directions = [
      { name: 'down', row: 0 },
      { name: 'left', row: 1 },
      { name: 'right', row: 2 },
      { name: 'up', row: 3 }
    ];

    for (const direction of directions) {
      const firstFrame = direction.row * 3;
      this.anims.create({
        key: `player-idle-${direction.name}`,
        frames: [{ key: 'player-sheet', frame: firstFrame }],
        frameRate: 1,
        repeat: -1
      });

      this.anims.create({
        key: `player-walk-${direction.name}`,
        frames: this.anims.generateFrameNumbers('player-sheet', {
          start: firstFrame,
          end: firstFrame + 2
        }),
        frameRate: 8,
        repeat: -1
      });
    }
  }

  private createTexture(key: string, color: number, width = 24, height = 28): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(color);
    graphics.fillRect(0, 0, width, height);
    graphics.lineStyle(2, 0xffffff, 0.4);
    graphics.strokeRect(0, 0, width, height);
    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }
}
