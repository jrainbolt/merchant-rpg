import Phaser from 'phaser';
import type { CharacterStats, EnemyStats } from '../types/gameTypes';

export class BattleSystem {
  static calculateDamage(attacker: Pick<CharacterStats | EnemyStats, 'attack'>, defender: Pick<CharacterStats | EnemyStats, 'defense'>): number {
    const variance = Phaser.Math.Between(0, 2);
    return Math.max(1, attacker.attack + variance - Math.floor(defender.defense / 2));
  }

  static grantXp(party: CharacterStats[], xp: number): string[] {
    const messages: string[] = [];

    for (const member of party) {
      if (member.hp <= 0) {
        continue;
      }

      member.xp += xp;
      while (member.xp >= member.nextLevelXp) {
        member.xp -= member.nextLevelXp;
        member.level += 1;
        member.nextLevelXp = Math.floor(member.nextLevelXp * 1.4);
        member.maxHp += 6;
        member.hp = member.maxHp;
        member.attack += 2;
        member.defense += 1;
        member.speed += 1;
        messages.push(`${member.name} reached level ${member.level}!`);
      }
    }

    return messages;
  }

  static isPartyDefeated(party: CharacterStats[]): boolean {
    return party.every((member) => member.hp <= 0);
  }

  static getFirstLivingMember(party: CharacterStats[]): CharacterStats | undefined {
    return party.find((member) => member.hp > 0);
  }
}
