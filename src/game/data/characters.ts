import type { CharacterStats } from '../types/gameTypes';

export const createHero = (): CharacterStats => ({
  id: 'hero',
  name: 'Rin',
  level: 1,
  hp: 32,
  maxHp: 32,
  attack: 8,
  defense: 4,
  speed: 7,
  xp: 0,
  nextLevelXp: 20
});

export const createCompanion = (): CharacterStats => ({
  id: 'companion',
  name: 'Toma',
  level: 1,
  hp: 26,
  maxHp: 26,
  attack: 6,
  defense: 3,
  speed: 9,
  xp: 0,
  nextLevelXp: 20
});
