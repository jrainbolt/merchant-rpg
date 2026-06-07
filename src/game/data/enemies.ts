import type { EnemyStats } from '../types/gameTypes';

export const createSlime = (): EnemyStats => ({
  id: 'slime',
  name: 'Forest Slime',
  level: 1,
  hp: 18,
  maxHp: 18,
  attack: 5,
  defense: 2,
  speed: 4,
  xpReward: 8
});
