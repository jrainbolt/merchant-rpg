import Phaser from 'phaser';
import { createCompanion } from '../data/characters';
import { Player } from '../entities/Player';
import { DialogueSystem } from '../systems/DialogueSystem';
import { QuestSystem } from '../systems/QuestSystem';
import { SaveSystem } from '../systems/SaveSystem';
import type { GameData } from '../types/gameTypes';

type NpcConfig = {
  key: string;
  name: string;
  x: number;
  y: number;
  texture: string;
  interact: () => void;
};

export class TownScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private blockers!: Phaser.Physics.Arcade.StaticGroup;
  private npcs: Phaser.Physics.Arcade.Sprite[] = [];
  private dialogue!: DialogueSystem;
  private canInteract = true;

  constructor() {
    super('TownScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#86efac');
    this.dialogue = new DialogueSystem(this);
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,M,ESC,SPACE,ENTER') as Record<string, Phaser.Input.Keyboard.Key>;

    this.drawTown();
    this.createPlayer();
    this.createNpcs();
    this.physics.add.collider(this.player.sprite, this.blockers);
    this.physics.add.collider(this.player.sprite, this.npcs);

    this.input.keyboard?.on('keydown-SPACE', () => this.tryInteract());
    this.input.keyboard?.on('keydown-ENTER', () => this.tryInteract());
    this.input.keyboard?.on('keydown-M', () => this.openMenu());
    this.input.keyboard?.on('keydown-ESC', () => this.openMenu());
  }

  update(): void {
    if (this.dialogue.isOpen || this.scene.isActive('MenuScene')) {
      this.player.stop();
      return;
    }

    this.handleMovement();
    this.checkForestGate();
  }

  private get gameState(): GameData {
    return this.registry.get('gameData') as GameData;
  }

  private drawTown(): void {
    this.add.rectangle(400, 300, 800, 600, 0x86efac);
    this.add.rectangle(400, 530, 800, 80, 0xc08457);
    this.add.rectangle(390, 280, 190, 120, 0xd97706).setStrokeStyle(3, 0x7c2d12);
    this.add.text(306, 235, 'Guild Hall', { fontFamily: 'monospace', fontSize: '16px', color: '#111827' });
    this.add.text(628, 502, 'Forest', { fontFamily: 'monospace', fontSize: '16px', color: '#111827' });

    this.blockers = this.physics.add.staticGroup();
    this.addBlocker(390, 280, 190, 120);
    this.addBlocker(24, 300, 48, 600);
    this.addBlocker(776, 300, 48, 600);
    this.addBlocker(400, 24, 800, 48);
    this.addBlocker(400, 584, 800, 32);
    this.blockers.refresh();

    this.add.sprite(690, 526, 'portal');
  }

  private addBlocker(x: number, y: number, width: number, height: number): void {
    const blocker = this.add.rectangle(x, y, width, height, 0x000000, 0);
    this.physics.add.existing(blocker, true);
    this.blockers.add(blocker);
  }

  private createPlayer(): void {
    const position = this.gameState.position.map === 'TownScene' ? this.gameState.position : { x: 128, y: 192 };
    this.player = new Player(this, position.x, position.y, 160);
  }

  private createNpcs(): void {
    const configs: NpcConfig[] = [
      {
        key: 'elder',
        name: 'Elder Mara',
        x: 185,
        y: 150,
        texture: 'elder',
        interact: () => this.talkToElder()
      },
      {
        key: 'companion',
        name: 'Toma',
        x: 575,
        y: 215,
        texture: 'companion',
        interact: () => this.talkToCompanion()
      },
      {
        key: 'guard',
        name: 'Gate Warden',
        x: 640,
        y: 470,
        texture: 'guard',
        interact: () => this.dialogue.start([{ speaker: 'Gate Warden', text: 'The woods stir after sunset. Keep a potion close and your footing closer.' }])
      }
    ];

    for (const config of configs) {
      const npc = this.physics.add.staticSprite(config.x, config.y, config.texture) as Phaser.Physics.Arcade.Sprite;
      npc.setData('name', config.name);
      npc.setData('interact', config.interact);
      this.npcs.push(npc);
      this.add.text(config.x, config.y + 22, config.name, {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#111827'
      }).setOrigin(0.5);
    }
  }

  private talkToElder(): void {
    const quests = this.gameState.quests;
    if (quests.slimeHunt === 'not_started') {
      this.dialogue.start([
        { speaker: 'Elder Mara', text: 'Three forest slimes have wandered too close to the road.' },
        { speaker: 'Elder Mara', text: 'Defeat them and the town charter will remember your name.', onComplete: () => QuestSystem.startSlimeHunt(quests) }
      ]);
      return;
    }

    this.dialogue.start([{ speaker: 'Elder Mara', text: QuestSystem.getSlimeHuntText(quests) }]);
  }

  private talkToCompanion(): void {
    const hasCompanion = this.gameState.party.some((member) => member.id === 'companion');
    if (hasCompanion) {
      this.dialogue.start([{ speaker: 'Toma', text: 'I am with you. Let us keep the road clear.' }]);
      return;
    }

    this.dialogue.start([
      { speaker: 'Toma', text: 'You are heading to the forest? I know a few quick strikes.' },
      { speaker: 'Toma', text: 'I will join your charter.', onComplete: () => this.gameState.party.push(createCompanion()) }
    ]);
  }

  private handleMovement(): void {
    this.player.handleMovement(this.cursors, this.keys);
    this.registry.set('gameData', SaveSystem.updatePosition(this.gameState, 'TownScene', this.player.x, this.player.y));
  }

  private tryInteract(): void {
    if (this.dialogue.isOpen) {
      this.dialogue.advance();
      return;
    }

    if (!this.canInteract) {
      return;
    }

    const npc = this.npcs.find((candidate) => Phaser.Math.Distance.Between(this.player.x, this.player.y, candidate.x, candidate.y) < 58);
    const interact = npc?.getData('interact') as (() => void) | undefined;
    interact?.();
  }

  private checkForestGate(): void {
    if (this.player.x > 660 && this.player.y > 485) {
      this.canInteract = false;
      this.registry.set('gameData', SaveSystem.updatePosition(this.gameState, 'ForestScene', 110, 500));
      this.scene.start('ForestScene');
    }
  }

  private openMenu(): void {
    if (this.dialogue.isOpen || this.scene.isActive('MenuScene')) {
      return;
    }

    this.scene.pause();
    this.scene.launch('MenuScene', { parentScene: 'TownScene' });
  }
}
