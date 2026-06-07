import Phaser from 'phaser';
import { QuestSystem } from '../systems/QuestSystem';
import { SaveSystem } from '../systems/SaveSystem';
import type { GameData, MapKey } from '../types/gameTypes';

export class MenuScene extends Phaser.Scene {
  private parentScene: MapKey = 'TownScene';
  private statusText!: Phaser.GameObjects.Text;

  constructor() {
    super('MenuScene');
  }

  init(data: { parentScene?: MapKey }): void {
    this.parentScene = data.parentScene ?? 'TownScene';
  }

  create(): void {
    this.cameras.main.setBackgroundColor('rgba(15, 23, 42, 0.92)');

    this.add.rectangle(400, 300, 700, 500, 0x111827, 0.96).setStrokeStyle(2, 0xf9fafb);
    this.add.text(78, 72, 'Menu', { fontFamily: 'monospace', fontSize: '30px', color: '#fde68a' });

    this.add.text(78, 125, this.getMenuText(), {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#f9fafb',
      lineSpacing: 6
    });

    this.statusText = this.add.text(78, 500, '', {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#93c5fd'
    });

    this.addButton(540, 450, 'Save', () => this.save());
    this.addButton(540, 500, 'Close', () => this.close());

    this.input.keyboard?.on('keydown-S', () => this.save());
    this.input.keyboard?.on('keydown-M', () => this.close());
    this.input.keyboard?.on('keydown-ESC', () => this.close());
    this.input.keyboard?.on('keydown-BACKSPACE', () => this.close());
  }

  private get gameState(): GameData {
    return this.registry.get('gameData') as GameData;
  }

  private getMenuText(): string {
    const party = this.gameState.party
      .map((member) => `${member.name}  Lv ${member.level}  HP ${member.hp}/${member.maxHp}  ATK ${member.attack}  DEF ${member.defense}  SPD ${member.speed}`)
      .join('\n');

    return [
      'Party',
      party,
      '',
      'Inventory',
      `Potions: ${this.gameState.inventory.potions}`,
      '',
      'Quest',
      QuestSystem.getSlimeHuntText(this.gameState.quests),
      '',
      'Controls',
      'Arrows/WASD move  Space/Enter confirm  Esc/M menu'
    ].join('\n');
  }

  private addButton(x: number, y: number, label: string, onClick: () => void): void {
    const button = this.add.rectangle(x, y, 160, 38, 0x334155).setStrokeStyle(2, 0x94a3b8).setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y, label, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#f9fafb'
    }).setOrigin(0.5);
    button.on('pointerdown', onClick);
    text.setInteractive({ useHandCursor: true }).on('pointerdown', onClick);
  }

  private save(): void {
    SaveSystem.save(this.gameState);
    this.statusText.setText('Saved to localStorage.');
  }

  private close(): void {
    this.scene.stop();
    this.scene.resume(this.parentScene);
  }
}
