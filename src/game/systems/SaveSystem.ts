import { createHero } from '../data/characters';
import type { GameData, MapKey } from '../types/gameTypes';

const SAVE_KEY = 'charterbound-save-v1';

export class SaveSystem {
  static hasSave(): boolean {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  static createNewGame(): GameData {
    return {
      position: { map: 'TownScene', x: 128, y: 192 },
      party: [createHero()],
      inventory: { potions: 3 },
      quests: {
        slimeHunt: 'not_started',
        defeatedSlimes: 0
      }
    };
  }

  static load(): GameData | null {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as GameData;
    } catch {
      localStorage.removeItem(SAVE_KEY);
      return null;
    }
  }

  static save(data: GameData): void {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  }

  static updatePosition(data: GameData, map: MapKey, x: number, y: number): GameData {
    return {
      ...data,
      position: { map, x, y }
    };
  }
}
