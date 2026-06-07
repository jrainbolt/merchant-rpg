export type QuestState = 'not_started' | 'active' | 'completed';

export type MapKey = 'TownScene' | 'ForestScene';

export interface CharacterStats {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  xp: number;
  nextLevelXp: number;
}

export interface EnemyStats {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  xpReward: number;
}

export interface Inventory {
  potions: number;
}

export interface QuestProgress {
  slimeHunt: QuestState;
  defeatedSlimes: number;
}

export interface PlayerPosition {
  map: MapKey;
  x: number;
  y: number;
}

export interface GameData {
  position: PlayerPosition;
  party: CharacterStats[];
  inventory: Inventory;
  quests: QuestProgress;
}

export interface DialogueLine {
  speaker: string;
  text: string;
  onComplete?: () => void;
}

export interface BattleResult {
  victory: boolean;
  ran: boolean;
  party: CharacterStats[];
  inventory: Inventory;
  xpGained: number;
  defeatedSlimes: number;
}
