import type { ShopItem } from './types'; // Ajuster le chemin d'importation

const NO_MATERIALS_ITEMS = ['elytra', 'bow', 'crossbow', 'shield', 'trident','carved_pumpkin'];

export const filterMinecraftEquipment = (item: ShopItem, activeLeftId: string, activeRightId?: string) => {
  if (!item.target_item) return false;

  const cleanTarget = item.target_item.replace('minecraft:', '').replace('cosmetic:', 'cosmetiques_');;

  if (NO_MATERIALS_ITEMS.includes(cleanTarget)) {
    return activeLeftId === cleanTarget;
  }

  if (!activeRightId) return false;

  const [itemMaterial, itemCategory] = cleanTarget.split('_');
  return itemMaterial === activeRightId && itemCategory === activeLeftId;
};

export const checkDisabledMaterialTab = (activeLeftId: string) => {
  return NO_MATERIALS_ITEMS.includes(activeLeftId);
};