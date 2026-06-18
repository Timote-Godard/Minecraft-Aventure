import BaseBoutique, { type LeftTabConfig, type RightTabConfig } from './BaseBoutique'; // Ajuste le chemin d'import
import type { ShopItem, InventoryItem } from './types';
import { filterMinecraftEquipment, checkDisabledMaterialTab } from './shopUtils'; // Import des fonctions utilitaires

interface ArmureBoutiqueProps {
  items: ShopItem[];
  getImagePath: (targetItem: string, modelData: number) => string;
  handleBuyItem: (itemId: number) => void;
  itemsInventory: InventoryItem[];
}

export default function ArmureBoutique({ handleBuyItem, items, getImagePath, itemsInventory }: ArmureBoutiqueProps) {
  
  const imgPath = "images/boutique/icones/armure/";
  const imgPathMat = "images/boutique/icones/materiaux/";

  // 1. Définition des onglets de pièces d'armure
  const leftTabs: LeftTabConfig[] = [
    { id: 'helmet', label: 'Casque', getIcon: (mat) => `${imgPath}helmet/${mat}.webp` },
    { id: 'chestplate', label: 'Plastron', getIcon: (mat) => `${imgPath}chestplate/${mat}.webp` },
    { id: 'leggings', label: 'Pantalon', getIcon: (mat) => `${imgPath}leggings/${mat}.webp` },
    { id: 'boots', label: 'Bottes', getIcon: (mat) => `${imgPath}boots/${mat}.webp` },
    { id: 'elytra', label: 'Élytres', getIcon: () => `${imgPath}elytra.webp` } // L'élytre ne change pas d'image
  ];

  // 2. Définition des onglets de matériaux
  const rightTabs: RightTabConfig[] = [
    { id: 'leather', label: 'Cuir', icon: `${imgPathMat}cuir.webp` },
    { id: 'chainmail', label: 'Mailles', icon: `${imgPathMat}chaine.webp` },
    { id: 'copper', label: 'Cuivre', icon: `${imgPathMat}cuivre.webp` },
    { id: 'iron', label: 'Fer', icon: `${imgPathMat}fer.webp` },
    { id: 'golden', label: 'Or', icon: `${imgPathMat}or.webp` },
    { id: 'diamond', label: 'Diamant', icon: `${imgPathMat}diamant.webp` },
    { id: 'netherite', label: 'Netherite', icon: `${imgPathMat}netherite.webp` }
  ];

  return (
    <BaseBoutique
      leftTabs={leftTabs}
      rightTabs={rightTabs}
      items={items}
      getImagePath={getImagePath}
      handleBuyItem={handleBuyItem}
      filterItem={filterMinecraftEquipment}
      isRightTabDisabled={checkDisabledMaterialTab}
      itemsInventory={itemsInventory}
    />
  );
}