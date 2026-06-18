import BaseBoutique, { type LeftTabConfig, type RightTabConfig } from './BaseBoutique'; // Ajuste le chemin d'import
import type { ShopItem, InventoryItem } from './types';
import { filterMinecraftEquipment, checkDisabledMaterialTab } from './shopUtils'; // Import des fonctions utilitaires


interface ArmesBoutiqueProps { 
  items: ShopItem[];
  getImagePath: (targetItem: string, modelData: number) => string;
  handleBuyItem: (itemId: number) => void;
  itemsInventory: InventoryItem[];
}

export default function ArmesBoutique({ handleBuyItem, items, getImagePath, itemsInventory }: ArmesBoutiqueProps) {
  
  const imgPath = "images/boutique/icones/combat/";
  const imgPathMat = "images/boutique/icones/materiaux/";

  // 1. Définition des onglets de pièces d'armure
  const leftTabs: LeftTabConfig[] = [
    { id: 'sword', label: 'Epee', getIcon: (mat) => `${imgPath}sword/${mat}.webp` },
    { id: 'bow', label: 'Arc', getIcon: () => `${imgPath}bow.webp`},
    { id: 'crossbow', label: 'Arbalète', getIcon: () => `${imgPath}crossbow.webp` },
    { id: 'trident', label: 'Trident', getIcon: () => `${imgPath}trident.webp` },
    { id: 'shield', label: 'Bouclier', getIcon: () => `${imgPath}shield.webp` } // Le bouclier ne change pas d'image
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