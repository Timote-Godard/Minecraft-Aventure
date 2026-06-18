import { useState } from 'react';
import type { ShopItem, InventoryItem } from './types';

// --- TYPES DE CONFIGURATION ---
export interface LeftTabConfig {
  id: string;
  label: string;
  // Permet de changer l'icône de l'armure selon le matériau sélectionné à droite
  getIcon: (activeRightId?: string) => string; 
}

export interface RightTabConfig {
  id: string;
  label: string;
  icon: string;
}

export interface BaseBoutiqueProps<T> {
  leftTabs: LeftTabConfig[];
  rightTabs: RightTabConfig[];
  items: ShopItem[];
  getImagePath: (targetItem: string, modelData: number) => string;
  handleBuyItem: (itemId: number) => void;
  filterItem: (item: T, activeLeftId: string, activeRightId?: string) => boolean;
  isRightTabDisabled?: (activeLeftId: string, rightTabId: string) => boolean;
  itemsInventory: InventoryItem[];
}

export default function BaseBoutique({
  leftTabs,
  rightTabs,
  items,
  getImagePath,
  handleBuyItem,
  filterItem,
  isRightTabDisabled,
  itemsInventory
}: BaseBoutiqueProps<ShopItem>) {

  // L'état est maintenant géré ICI, en interne. Le parent n'a plus à s'en soucier !
  const [activeLeftIndex, setActiveLeftIndex] = useState(0);
  const [activeRightIndex, setActiveRightIndex] = useState(0);

  const activeLeft = leftTabs[activeLeftIndex];
  const activeRight = rightTabs.length > 0 ? rightTabs[activeRightIndex] : undefined;

  const alreadyBuyedItem = (item: ShopItem) => {
  return itemsInventory.some(
    (inventoryItem) => 
      inventoryItem.custom_model_data === item.custom_model_data && 
      inventoryItem.target_item === item.target_item
  );
};

  return (
    <div className="h-full w-full m-0 p-0 flex items-center justify-center">
      <div className="relative mt-24 z-0">
        
        {/* ONGLETS DE GAUCHE */}
        <div className="absolute -top-[106px] left-0 flex gap-[5px]">
          {leftTabs.map((tab, index) => {
            const isActive = activeLeftIndex === index;
            return (
              <button
                key={`left-${tab.id}`}
                onClick={() => setActiveLeftIndex(index)}
                className={`
                  relative w-24 h-[106px] cursor-pointer flex justify-center pt-4 text-[10px] font-bold text-[#373737] select-none
                  ${isActive 
                    ? 'bg-[#c6c6c6] z-30 top-[4px] shadow-[-2px_0_0_black,0_-2px_0_black,2px_0_0_black,inset_2px_2px_0_0_white,inset_-2px_0_0_0_#555555]' 
                    : 'bg-[#8b8b8b] z-10 top-[8px] hover:bg-[#9e9e9e] shadow-[-2px_0_0_black,0_-2px_0_black,2px_0_0_black,inset_2px_2px_0_0_white,inset_-2px_-2px_0_0_#555555]'}
                `}
              >
                <img className="w-16 h-16 pointer-events-none" src={tab.getIcon(activeRight?.id)} alt={tab.label} />
                {isActive && <div className="absolute -bottom-[4px] left-[2px] right-[2px] h-[4px] bg-[#c6c6c6]"></div>}
              </button>
            );
          })}
        </div>

        {/* ONGLETS DE DROITE */}
        {rightTabs.length > 0 && (
            <div className="absolute -top-[106px] right-0 flex gap-[5px]">
          {rightTabs.map((tab, index) => {
            const isActive = activeRightIndex === index;
            const disabled = isRightTabDisabled ? isRightTabDisabled(activeLeft.id, tab.id) : false;
            return (
              <button
                key={`right-${tab.id}`}
                onClick={() => !disabled && setActiveRightIndex(index)}
                disabled={disabled}
                className={`
                  relative w-24 h-[106px] flex justify-center pt-4 text-[10px] font-bold text-[#373737] select-none
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  ${isActive 
                    ? 'bg-[#c6c6c6] z-30 top-[4px] shadow-[-2px_0_0_black,0_-2px_0_black,2px_0_0_black,inset_2px_2px_0_0_white,inset_-2px_0_0_0_#555555]' 
                    : `bg-[#8b8b8b] z-10 top-[8px] ${!disabled && 'hover:bg-[#9e9e9e]'} shadow-[-2px_0_0_black,0_-2px_0_black,2px_0_0_black,inset_2px_2px_0_0_white,inset_-2px_-2px_0_0_#555555]`}
                `}
              >
                <img className="w-16 h-16 pointer-events-none" src={tab.icon} alt={tab.label} />
                {isActive && <div className="absolute -bottom-[4px] left-[2px] right-[2px] h-[4px] bg-[#c6c6c6]"></div>}
              </button>
            );
          })}
        </div>
        )}

        {/* CADRE MINECRAFT */}
        <div className="relative z-20 grid grid-cols-[2px_2px_auto_2px_2px] grid-rows-[2px_2px_auto_2px_2px] [grid-template-areas:'tl-tl_tr-tl_t_tl-tr_tr-tr'_'bl-tl_br-tl_t_bl-tr_br-tr'_'l_l_inv_r_r'_'tl-bl_tr-bl_b_tl-br_tr-br'_'bl-bl_br-bl_b_bl-br_br-br']">
          <div className="[grid-area:l] shadow-[-2px_0_0_black] bg-white"></div>
          <div className="[grid-area:r] shadow-[2px_0_0_black] bg-[#555555]"></div>
          <div className="[grid-area:b] shadow-[0_2px_0_black] bg-[#555555]"></div>
          <div className="[grid-area:t] shadow-[0_-2px_0_black] bg-white"></div>
          <div className="[grid-area:tl-tl] bg-white relative bottom-[-4px] right-[-4px]"></div>
          <div className="[grid-area:tr-tl] shadow-[0_-2px_0_black,-2px_0_0_black] bg-white"></div>
          <div className="[grid-area:bl-tl] shadow-[0_-2px_0_black,-2px_0_0_black] bg-white"></div>
          <div className="[grid-area:br-tl] bg-white"></div>
          <div className="[grid-area:tr-bl] shadow-[-2px_0_0_black,0_2px_0_black] bg-[#c6c6c6]"></div>
          <div className="[grid-area:bl-tr] shadow-[0_-2px_0_black,2px_0_0_black] bg-[#c6c6c6]"></div>
          <div className="[grid-area:tl-br] bg-[#555555]"></div>
          <div className="[grid-area:tr-br] shadow-[2px_0_0_black,0_2px_0_black] bg-[#555555]"></div>
          <div className="[grid-area:bl-br] shadow-[2px_0_0_black,0_2px_0_black] bg-[#555555]"></div>
          <div className="[grid-area:br-br] bg-[#555555] relative top-[-4px] left-[-4px]"></div>

          {/* ZONE CENTRALE (Agrandie) */}
          <div className="[grid-area:inv] bg-[#c6c6c6] w-[1250px] h-full p-6 flex flex-col gap-6 overflow-y-auto">


            {/* Grille avec plus de colonnes (5 sur très grands écrans) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {items
              .filter(item => filterItem(item, activeLeft.id, activeRight?.id) && !alreadyBuyedItem(item))
              .map((item, index) => (
                  <div 
                key={`${item.id}-${index}`} 
                className="bg-[#c6c6c6] border-4 border-t-[#555555] border-l-[#555555] border-b-white border-r-white p-4 flex flex-col gap-4 h-full"
              >
                {/* Emplacement de l'image (Slot Minecraft) */}
                <div className="w-full aspect-square bg-[#8b8b8b] border-4 border-t-[#373737] border-l-[#373737] border-b-white border-r-white flex items-center justify-center p-2">
                  <img 
                    src={getImagePath(item.target_item, item.custom_model_data)} 
                    alt={item.nom} 
                    className="w-full h-full object-contain drop-shadow-md"
                    onError={(e) => { 
                      e.currentTarget.onerror = null; 
                      e.currentTarget.src = '/images/default.png'; 
                    }} 
                  />
                </div>

                {/* Informations de l'article */}
                <div className="flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-[#373737] uppercase leading-tight mb-2">
                    {item.nom}
                  </h3>
                  <p className="text-[#555555] text-sm flex-1">
                    {item.description}
                  </p>
                </div>
                
                {/* Bouton d'achat */}
                <button 
                  onClick={() => handleBuyItem(item.id)}
                  className="w-full py-2 font-bold text-white uppercase bg-[#4a8a3a] hover:bg-[#5c9f4c] active:bg-[#376b2b] border-4 border-t-[#7cc06b] border-l-[#7cc06b] border-b-[#264f19] border-r-[#264f19] transition-colors"
                >
                  {item.prix} PC
                </button>
              </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}