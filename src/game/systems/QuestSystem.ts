import { SLIME_HUNT_TARGET } from '../data/quests';
import type { QuestProgress } from '../types/gameTypes';

export class QuestSystem {
  static startSlimeHunt(quests: QuestProgress): void {
    if (quests.slimeHunt === 'not_started') {
      quests.slimeHunt = 'active';
      quests.defeatedSlimes = 0;
    }
  }

  static recordSlimeDefeat(quests: QuestProgress, amount: number): void {
    if (quests.slimeHunt !== 'active') {
      return;
    }

    quests.defeatedSlimes = Math.min(SLIME_HUNT_TARGET, quests.defeatedSlimes + amount);
    if (quests.defeatedSlimes >= SLIME_HUNT_TARGET) {
      quests.slimeHunt = 'completed';
    }
  }

  static getSlimeHuntText(quests: QuestProgress): string {
    if (quests.slimeHunt === 'not_started') {
      return 'Slime Hunt: speak to Elder Mara in town.';
    }

    if (quests.slimeHunt === 'completed') {
      return `Slime Hunt: completed (${SLIME_HUNT_TARGET}/${SLIME_HUNT_TARGET}).`;
    }

    return `Slime Hunt: defeat forest slimes (${quests.defeatedSlimes}/${SLIME_HUNT_TARGET}).`;
  }
}
