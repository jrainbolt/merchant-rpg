import Phaser from 'phaser';
import { createSlime } from '../data/enemies';
import { InventorySystem } from '../systems/InventorySystem';
import { BattleSystem } from '../systems/BattleSystem';
import { QuestSystem } from '../systems/QuestSystem';
import type { EnemyStats, GameData, MapKey } from '../types/gameTypes';

type BattleAction = 'Attack' | 'Skill' | 'Item' | 'Run';

export class BattleScene extends Phaser.Scene {
  private enemy!: EnemyStats;
  private returnScene: MapKey = 'ForestScene';
  private logText!: Phaser.GameObjects.Text;
  private partyText!: Phaser.GameObjects.Text;
  private enemyText!: Phaser.GameObjects.Text;
  private optionTexts: Phaser.GameObjects.Text[] = [];
  private selected = 0;
  private inputLocked = false;
  private actions: BattleAction[] = ['Attack', 'Skill', 'Item', 'Run'];

  constructor() {
    super('BattleScene');
  }

  init(data: { returnScene?: MapKey }): void {
    this.returnScene = data.returnScene ?? 'ForestScene';
  }

  create(): void {
    this.enemy = createSlime();
    this.cameras.main.setBackgroundColor('#1f2937');

    this.add.text(400, 44, 'A Forest Slime appears!', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#fef3c7'
    }).setOrigin(0.5);

    this.add.sprite(400, 190, 'slime').setScale(3);
    this.enemyText = this.add.text(300, 255, '', { fontFamily: 'monospace', fontSize: '18px', color: '#d1fae5' });
    this.partyText = this.add.text(48, 345, '', { fontFamily: 'monospace', fontSize: '16px', color: '#f9fafb' });
    this.logText = this.add.text(48, 455, 'Choose an action.', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#f9fafb',
      wordWrap: { width: 704 }
    });

    this.createActionMenu();
    this.refreshUi();

    this.input.keyboard?.on('keydown-UP', () => this.moveSelection(-1));
    this.input.keyboard?.on('keydown-DOWN', () => this.moveSelection(1));
    this.input.keyboard?.on('keydown-W', () => this.moveSelection(-1));
    this.input.keyboard?.on('keydown-S', () => this.moveSelection(1));
    this.input.keyboard?.on('keydown-ENTER', () => this.chooseAction());
    this.input.keyboard?.on('keydown-SPACE', () => this.chooseAction());
    this.input.keyboard?.on('keydown-ESC', () => this.tryRun());
    this.input.keyboard?.on('keydown-BACKSPACE', () => this.tryRun());
  }

  private get gameState(): GameData {
    return this.registry.get('gameData') as GameData;
  }

  private createActionMenu(): void {
    this.optionTexts = this.actions.map((action, index) => {
      const text = this.add.text(560, 335 + index * 34, action, {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#ffffff'
      }).setInteractive({ useHandCursor: true });
      text.on('pointerdown', () => {
        this.selected = index;
        this.chooseAction();
      });
      return text;
    });
    this.refreshSelection();
  }

  private moveSelection(direction: number): void {
    if (this.inputLocked) {
      return;
    }

    this.selected = Phaser.Math.Wrap(this.selected + direction, 0, this.actions.length);
    this.refreshSelection();
  }

  private refreshSelection(): void {
    this.optionTexts.forEach((text, index) => {
      text.setText(`${index === this.selected ? '> ' : '  '}${this.actions[index]}`);
      text.setColor(index === this.selected ? '#fde68a' : '#ffffff');
    });
  }

  private chooseAction(): void {
    if (this.inputLocked) {
      return;
    }

    const action = this.actions[this.selected];
    if (action === 'Attack') {
      this.playerAttack(false);
    } else if (action === 'Skill') {
      this.playerAttack(true);
    } else if (action === 'Item') {
      this.usePotion();
    } else {
      this.tryRun();
    }
  }

  private playerAttack(isSkill: boolean): void {
    const actor = BattleSystem.getFirstLivingMember(this.gameState.party);
    if (!actor) {
      this.loseBattle();
      return;
    }

    const baseDamage = BattleSystem.calculateDamage(actor, this.enemy);
    const damage = isSkill ? baseDamage + 4 : baseDamage;
    this.enemy.hp = Math.max(0, this.enemy.hp - damage);
    this.logText.setText(`${actor.name} uses ${isSkill ? 'Bright Cut' : 'Attack'} for ${damage} damage.`);
    this.afterPlayerTurn();
  }

  private usePotion(): void {
    const target = BattleSystem.getFirstLivingMember(this.gameState.party);
    if (!target || !InventorySystem.usePotion(this.gameState.inventory, target)) {
      this.logText.setText('No potion can be used right now.');
      return;
    }

    this.logText.setText(`${target.name} drinks a potion.`);
    this.afterPlayerTurn();
  }

  private afterPlayerTurn(): void {
    this.refreshUi();
    if (this.enemy.hp <= 0) {
      this.winBattle();
      return;
    }

    this.inputLocked = true;
    this.time.delayedCall(700, () => this.enemyTurn());
  }

  private enemyTurn(): void {
    const target = BattleSystem.getFirstLivingMember(this.gameState.party);
    if (!target) {
      this.loseBattle();
      return;
    }

    const damage = BattleSystem.calculateDamage(this.enemy, target);
    target.hp = Math.max(0, target.hp - damage);
    this.logText.setText(`${this.enemy.name} bumps ${target.name} for ${damage} damage.`);
    this.refreshUi();

    if (BattleSystem.isPartyDefeated(this.gameState.party)) {
      this.time.delayedCall(700, () => this.loseBattle());
      return;
    }

    this.inputLocked = false;
  }

  private tryRun(): void {
    if (this.inputLocked) {
      return;
    }

    if (Phaser.Math.Between(1, 100) <= 70) {
      this.logText.setText('You escaped safely.');
      this.inputLocked = true;
      this.time.delayedCall(600, () => this.scene.start(this.returnScene));
      return;
    }

    this.logText.setText('Could not run!');
    this.afterPlayerTurn();
  }

  private winBattle(): void {
    this.inputLocked = true;
    QuestSystem.recordSlimeDefeat(this.gameState.quests, 1);
    const levelMessages = BattleSystem.grantXp(this.gameState.party, this.enemy.xpReward);
    this.refreshUi();
    this.logText.setText([`Victory! Gained ${this.enemy.xpReward} XP.`, ...levelMessages].join('\n'));
    this.time.delayedCall(1200, () => this.scene.start(this.returnScene));
  }

  private loseBattle(): void {
    this.inputLocked = true;
    for (const member of this.gameState.party) {
      member.hp = Math.max(1, Math.floor(member.maxHp / 2));
    }
    this.logText.setText('Defeat... You limp back to town with half health.');
    this.gameState.position = { map: 'TownScene', x: 128, y: 192 };
    this.time.delayedCall(1400, () => this.scene.start('TownScene'));
  }

  private refreshUi(): void {
    this.enemyText.setText(`${this.enemy.name} HP ${this.enemy.hp}/${this.enemy.maxHp}`);
    this.partyText.setText(
      this.gameState.party
        .map((member) => `${member.name} Lv ${member.level} HP ${member.hp}/${member.maxHp} XP ${member.xp}/${member.nextLevelXp}`)
        .join('\n')
    );
  }
}
