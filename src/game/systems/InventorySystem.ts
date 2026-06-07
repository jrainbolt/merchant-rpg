import { POTION_HEAL_AMOUNT } from '../data/items';
import type { CharacterStats, Inventory } from '../types/gameTypes';

export class InventorySystem {
  static usePotion(inventory: Inventory, target: CharacterStats): boolean {
    if (inventory.potions <= 0 || target.hp >= target.maxHp) {
      return false;
    }

    inventory.potions -= 1;
    target.hp = Math.min(target.maxHp, target.hp + POTION_HEAL_AMOUNT);
    return true;
  }
}
