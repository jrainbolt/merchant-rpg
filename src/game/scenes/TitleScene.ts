import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import type { GameData } from '../types/gameTypes';

export class TitleScene extends Phaser.Scene {
  private selected = 0;
  private options: Phaser.GameObjects.Text[] = [];

  constructor() {
    super('TitleScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#172554');
    this.add.text(400, 150, 'Charterbound', {
      fontFamily: 'monospace',
      fontSize: '56px',
      color: '#fef3c7'
    }).setOrigin(0.5);

    this.add.text(400, 210, 'A tiny recruit-and-explore RPG prototype', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#dbeafe'
    }).setOrigin(0.5);

    this.options = [];
    this.addOption('New Game', 300, () => this.startGame(SaveSystem.createNewGame()));

    if (SaveSystem.hasSave()) {
      this.addOption('Continue', 350, () => this.startGame(SaveSystem.load() ?? SaveSystem.createNewGame()));
    }

    this.refreshSelection();
    this.input.keyboard?.on('keydown-UP', () => this.moveSelection(-1));
    this.input.keyboard?.on('keydown-DOWN', () => this.moveSelection(1));
    this.input.keyboard?.on('keydown-W', () => this.moveSelection(-1));
    this.input.keyboard?.on('keydown-S', () => this.moveSelection(1));
    this.input.keyboard?.on('keydown-ENTER', () => this.activateSelection());
    this.input.keyboard?.on('keydown-SPACE', () => this.activateSelection());
  }

  private addOption(label: string, y: number, action: () => void): void {
    const option = this.add.text(400, y, label, {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#ffffff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    option.setData('action', action);
    option.on('pointerdown', action);
    this.options.push(option);
  }

  private moveSelection(direction: number): void {
    this.selected = Phaser.Math.Wrap(this.selected + direction, 0, this.options.length);
    this.refreshSelection();
  }

  private refreshSelection(): void {
    this.options.forEach((option, index) => {
      option.setText(`${index === this.selected ? '> ' : '  '}${option.text.replace(/^> |^  /, '')}`);
      option.setColor(index === this.selected ? '#fde68a' : '#ffffff');
    });
  }

  private activateSelection(): void {
    const action = this.options[this.selected].getData('action') as () => void;
    action();
  }

  private startGame(data: GameData): void {
    this.registry.set('gameData', data);
    this.scene.start(data.position.map);
  }
}
