import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { QuestSystem } from '../systems/QuestSystem';
import { SaveSystem } from '../systems/SaveSystem';
import type { GameData } from '../types/gameTypes';

export class ForestScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private blockers!: Phaser.Physics.Arcade.StaticGroup;
  private encounterCooldown = 120;

  constructor() {
    super('ForestScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#14532d');
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,M,ESC') as Record<string, Phaser.Input.Keyboard.Key>;
    this.drawForest();

    const position = this.gameState.position.map === 'ForestScene' ? this.gameState.position : { x: 110, y: 500 };
    this.player = new Player(this, position.x, position.y, 165);
    this.physics.add.collider(this.player.sprite, this.blockers);

    this.add.text(28, 24, QuestSystem.getSlimeHuntText(this.gameState.quests), {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#fef3c7'
    });

    this.input.keyboard?.on('keydown-M', () => this.openMenu());
    this.input.keyboard?.on('keydown-ESC', () => this.openMenu());
  }

  update(): void {
    if (this.scene.isActive('MenuScene')) {
      this.player.stop();
      return;
    }

    const wasMoving = this.handleMovement();
    this.checkTownGate();

    if (wasMoving) {
      this.encounterCooldown -= 1;
      if (this.encounterCooldown <= 0 && Phaser.Math.Between(1, 100) <= 3) {
        this.startBattle();
      }
    }
  }

  private get gameState(): GameData {
    return this.registry.get('gameData') as GameData;
  }

  private drawForest(): void {
    this.add.rectangle(400, 300, 800, 600, 0x14532d);
    this.add.rectangle(98, 530, 150, 70, 0xc08457);
    this.add.text(38, 502, 'Town', { fontFamily: 'monospace', fontSize: '16px', color: '#fef3c7' });

    this.blockers = this.physics.add.staticGroup();
    this.addBlocker(24, 300, 48, 600);
    this.addBlocker(776, 300, 48, 600);
    this.addBlocker(400, 24, 800, 48);
    this.addBlocker(400, 584, 800, 32);

    const trees = [
      [190, 140], [260, 220], [380, 130], [530, 210], [665, 140],
      [160, 360], [310, 430], [455, 350], [620, 405], [700, 300]
    ];

    for (const [x, y] of trees) {
      this.add.sprite(x, y, 'tree');
      this.addBlocker(x, y, 38, 38);
    }

    this.blockers.refresh();
    this.add.sprite(88, 530, 'portal');
  }

  private addBlocker(x: number, y: number, width: number, height: number): void {
    const blocker = this.add.rectangle(x, y, width, height, 0x000000, 0);
    this.physics.add.existing(blocker, true);
    this.blockers.add(blocker);
  }

  private handleMovement(): boolean {
    const wasMoving = this.player.handleMovement(this.cursors, this.keys);
    this.registry.set('gameData', SaveSystem.updatePosition(this.gameState, 'ForestScene', this.player.x, this.player.y));
    return wasMoving;
  }

  private checkTownGate(): void {
    if (this.player.x < 125 && this.player.y > 492) {
      this.registry.set('gameData', SaveSystem.updatePosition(this.gameState, 'TownScene', 680, 470));
      this.scene.start('TownScene');
    }
  }

  private startBattle(): void {
    this.registry.set('gameData', SaveSystem.updatePosition(this.gameState, 'ForestScene', this.player.x, this.player.y));
    this.scene.start('BattleScene', { returnScene: 'ForestScene' });
  }

  private openMenu(): void {
    if (this.scene.isActive('MenuScene')) {
      return;
    }

    this.scene.pause();
    this.scene.launch('MenuScene', { parentScene: 'ForestScene' });
  }
}
