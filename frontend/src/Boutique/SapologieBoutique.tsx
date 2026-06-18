import BaseBoutique, { type LeftTabConfig, type RightTabConfig } from './BaseBoutique'; // Ajuste le chemin d'import
import type { ShopItem, InventoryItem } from './types';
import { filterMinecraftEquipment, checkDisabledMaterialTab } from './shopUtils'; // Import des fonctions utilitaires


interface SapologieBoutiqueProps { 
  items: ShopItem[];
  getImagePath: (targetItem: string, modelData: number) => string;
  handleBuyItem: (itemId: number) => void;
  itemsInventory: InventoryItem[];
}

export default function SapologieBoutique({ handleBuyItem, items, getImagePath, itemsInventory }: SapologieBoutiqueProps) {
  
  const imgPath = "images/boutique/icones/cosmetiques/";

  // 1. Définition des onglets de pièces d'armure
  const leftTabs: LeftTabConfig[] = [
    { id: 'hat', label: 'Chapeau', getIcon: () => `${imgPath}hat.webp` },
    { id: 'backpack', label: 'Sac à dos', getIcon: () => `${imgPath}backpack.webp`},
  ];

  // 2. Définition des onglets de matériaux
  const rightTabs: RightTabConfig[] = [
  ];


  return (
    <BaseBoutique
      leftTabs={leftTabs}
      rightTabs={rightTabs}
      items={items}
      getImagePath={getImagePath}
      handleBuyItem={handleBuyItem}
      itemsInventory={itemsInventory}
      filterItem={filterMinecraftEquipment}
      isRightTabDisabled={checkDisabledMaterialTab}
    />
  );
}