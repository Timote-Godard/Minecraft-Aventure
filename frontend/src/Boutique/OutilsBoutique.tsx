import BaseBoutique, { type LeftTabConfig, type RightTabConfig } from './BaseBoutique'; // Ajuste le chemin d'import
import type { ShopItem, InventoryItem } from './types';
import { filterMinecraftEquipment, checkDisabledMaterialTab } from './shopUtils'; // Import des fonctions utilitaires


interface OutilsBoutiqueProps { 
  items: ShopItem[];
  getImagePath: (targetItem: string, modelData: number) => string;
  handleBuyItem: (itemId: number) => void;
  itemsInventory: InventoryItem[];
}

export default function OutilsBoutique({ handleBuyItem, items, getImagePath,itemsInventory }: OutilsBoutiqueProps) {
  
  const imgPath = "images/boutique/icones/outils/";
  const imgPathMat = "images/boutique/icones/materiaux/";

  // 1. Définition des onglets de pièces d'armure
  const leftTabs: LeftTabConfig[] = [
    { id: 'pickaxe', label: 'Pioche', getIcon: (mat) => `${imgPath}pickaxe/${mat}.webp` },
    { id: 'shovel', label: 'Pelle', getIcon: (mat) => `${imgPath}shovel/${mat}.webp`},
    { id: 'axe', label: 'Hache', getIcon: (mat) => `${imgPath}axe/${mat}.webp` },
    { id: 'hoe', label: 'Houe', getIcon: (mat) => `${imgPath}hoe/${mat}.webp` }
  ];

  // 2. Définition des onglets de matériaux
  const rightTabs: RightTabConfig[] = [
    { id: 'wooden', label: 'Bois', icon: `${imgPathMat}bois.webp` },
    { id: 'stone', label: 'Pierre', icon: `${imgPathMat}pierre.webp` },
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