import type { ShopItem } from './types'; // Ajuster le chemin d'importation

const NO_MATERIALS_ITEMS = ['elytra', 'bow', 'crossbow', 'shield', 'trident','carved_pumpkin'];

export const filterMinecraftEquipment = (item: ShopItem, activeLeftId: string, activeRightId?: string) => {
  if (!item.target_item) return false;

  if (NO_MATERIALS_ITEMS.includes(item.target_item)) {
    return activeLeftId === item.target_item;
  }

  if (!activeRightId) return false;

  const [itemMaterial, itemCategory] = item.target_item.split('_');
  return itemMaterial === activeRightId && itemCategory === activeLeftId;
};

export const checkDisabledMaterialTab = (activeLeftId: string) => {
  return NO_MATERIALS_ITEMS.includes(activeLeftId);
};