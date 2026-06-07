import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
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
