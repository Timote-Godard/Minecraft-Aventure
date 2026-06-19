import { useState } from 'react';

interface InventoryItem {
  id: number;
  nom: string;
  description: string;
  target_item: string;
  custom_model_data: number;
  is_equipped: boolean | number;
}

const FILTER_MAP: Record<string, string[]> = {
  helmet: ['helmet'],
  hat: ['hat', 'chapeau'],
  backpack: ['backpack', 'sac'],
  chestplate: ['chestplate', 'elytra'],
  leggings: ['leggings'],
  boots: ['boots'],
  sword: ['sword'],
  axe: ['axe'],
  shield: ['shield'],
  pickaxe: ['pickaxe'],
  shovel: ['shovel'],
  hoe: ['hoe'],
  bow: ['bow'],
  crossbow: ['crossbow'],
  trident: ['trident']
};

const NO_MATERIALS_ITEMS = ['elytra', 'bow', 'crossbow', 'shield', 'trident', 'carved_pumpkin', 'hat', 'chapeau', 'backpack', 'sac'];

const MATERIALS = [
  { id: 'wooden', label: 'Bois', icon: 'images/boutique/icones/materiaux/bois.webp' },
  { id: 'stone', label: 'Pierre', icon: 'images/boutique/icones/materiaux/pierre.webp' },
  { id: 'leather', label: 'Cuir', icon: 'images/boutique/icones/materiaux/cuir.webp' },
  { id: 'chainmail', label: 'Mailles', icon: 'images/boutique/icones/materiaux/chaine.webp' },
  { id: 'iron', label: 'Fer', icon: 'images/boutique/icones/materiaux/fer.webp' },
  { id: 'golden', label: 'Or', icon: 'images/boutique/icones/materiaux/or.webp' },
  { id: 'diamond', label: 'Diamant', icon: 'images/boutique/icones/materiaux/diamant.webp' },
  { id: 'netherite', label: 'Netherite', icon: 'images/boutique/icones/materiaux/netherite.webp' }
];
 
const McGuiBox = ({ children }: { children: React.ReactNode }) => (
  <div className="relative z-20 grid grid-cols-[2px_2px_auto_2px_2px] grid-rows-[2px_2px_auto_2px_2px] [grid-template-areas:'tl-tl_tr-tl_t_tl-tr_tr-tr'_'bl-tl_br-tl_t_bl-tr_br-tr'_'l_l_inv_r_r'_'tl-bl_tr-bl_b_tl-br_tr-br'_'bl-bl_br-bl_b_bl-br_br-br'] w-full">
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
    <div className="[grid-area:inv] bg-[#c6c6c6] p-4 flex flex-col gap-[0.6rem]">
      {children}
    </div>
  </div>
);

const isExactMatch = (target: string, kw: string) => {
  return new RegExp(`(^|_|:)${kw}(_|$)`).test(target);
};

export default function Inventaire({ itemsInventory, setItemsInventory, pseudo, handleLogout }: { itemsInventory: InventoryItem[]; setItemsInventory: (value: InventoryItem[] | ((prevState: InventoryItem[]) => InventoryItem[])) => void; handleLogout: () => void; pseudo: string }) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [activeMaterial, setActiveMaterial] = useState<string | null>(null);

  const handleEquipToggle = async (item: InventoryItem) => {
    const isEquipped = item.is_equipped === true || item.is_equipped === 1;
    
    // Ajout de l'URL absolue du backend
    const endpoint = !isEquipped 
      ? 'https://api-minecraft.timote.ovh/api/inventory/equip' 
      : 'https://api-minecraft.timote.ovh/api/inventory/unequip';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('aventure_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ itemId: item.id })
      });

      const data = await response.json();

      if (data.success) {
        setItemsInventory(prevItems => 
          prevItems.map(i => i.id === item.id ? { ...i, is_equipped: !isEquipped } : i)
        );
      } else {
        alert(`Erreur : ${data.error}`);
        if (data.error === "déconnecté" || data.error === "Erreur interne.") {
           handleLogout();
        }
      }
    } catch (error) {
      console.error("Erreur de communication avec le serveur", error);
    }
  };

  const getImagePath = (targetItem: string, modelData: number) => {
        if (!targetItem) return '/images/default.webp'; // Sécurité
        if (targetItem === 'carved_pumpkin') return `/images/skins/cosmetiques/${modelData}.webp`; // Cas spécial pour la citrouille sculptée
        const folderName = targetItem.replace('minecraft:', '').replace(/_/g, '/');
        return `/images/skins/${folderName}/${modelData}.webp`;
    };

  const getEquippedSlot = (keywords: string[], currentMaterial: string | null) => {
    return itemsInventory.find((i) => {
      const realTarget = i.target_item.replace('minecraft:', '');
      const isEquip = i.is_equipped === true || i.is_equipped === 1;
      const matchesType = keywords.some(keyword => isExactMatch(realTarget, keyword));
      if (!isEquip || !matchesType) return false;

      if (currentMaterial === null) return true;

      const isSpecialItem = NO_MATERIALS_ITEMS.some(noMat => realTarget.includes(noMat));
      if (!isSpecialItem) {
         return realTarget.startsWith(currentMaterial);
      }
      return false;
    });
  };

  const equipped = {
    helmet: getEquippedSlot(FILTER_MAP.helmet, activeMaterial),
    hat: getEquippedSlot(FILTER_MAP.hat, activeMaterial),
    backpack: getEquippedSlot(FILTER_MAP.backpack, activeMaterial),
    chestplate: getEquippedSlot(FILTER_MAP.chestplate, activeMaterial),
    leggings: getEquippedSlot(FILTER_MAP.leggings, activeMaterial),
    boots: getEquippedSlot(FILTER_MAP.boots, activeMaterial),
    sword: getEquippedSlot(FILTER_MAP.sword, activeMaterial),
    axe: getEquippedSlot(FILTER_MAP.axe, activeMaterial),
    shield: getEquippedSlot(FILTER_MAP.shield, activeMaterial),
    pickaxe: getEquippedSlot(FILTER_MAP.pickaxe, activeMaterial),
    shovel: getEquippedSlot(FILTER_MAP.shovel, activeMaterial),
    hoe: getEquippedSlot(FILTER_MAP.hoe, activeMaterial),
    bow: getEquippedSlot(FILTER_MAP.bow, activeMaterial),
    crossbow: getEquippedSlot(FILTER_MAP.crossbow, activeMaterial),
    trident: getEquippedSlot(FILTER_MAP.trident, activeMaterial)
  };

  const filteredItems = itemsInventory.filter(item => {
    const target = item.target_item.replace('minecraft:', '');
    const isSpecialItem = NO_MATERIALS_ITEMS.some(noMat => target.includes(noMat));

    if (activeMaterial === null) {
      if (activeFilter) return FILTER_MAP[activeFilter].some(kw => isExactMatch(target, kw));
      return true; 
    }

    if (activeFilter) {
      const matchesSlot = FILTER_MAP[activeFilter].some(kw => isExactMatch(target, kw));
      if (!matchesSlot || isSpecialItem) return false;
      return target.startsWith(activeMaterial);
    }

    if (isSpecialItem) return false;
    return target.startsWith(activeMaterial);
  });
  

  const CellFilter = ({ item, filterKey, material }: { item?: InventoryItem | null, filterKey: string, material: string | null }) => {
    const isSelected = activeFilter === filterKey;
    
    const isWeaponOrTool = ['sword', 'pickaxe', 'axe', 'shovel', 'hoe'].includes(filterKey);
    const isArmor = ['helmet', 'chestplate', 'leggings', 'boots'].includes(filterKey);
    const isSpecialSlot = ['hat', 'backpack', 'shield', 'bow', 'crossbow', 'trident'].includes(filterKey);

    let isValid = true;
    if (material === null) {
      if (isArmor || isWeaponOrTool) isValid = false;
    } else {
      if (isSpecialSlot) isValid = false;
      if (isArmor && (material === 'wooden' || material === 'stone')) isValid = false;
      if (isWeaponOrTool && (material === 'leather' || material === 'chainmail')) isValid = false;
    }

    const fallbackEmptyIcon = `/images/inventaire/empty_${filterKey}.webp`;
    const emptySlotIcon = !isValid || !material
      ? fallbackEmptyIcon 
      : `/images/inventaire/${material}_${filterKey}.webp`;

    return (
      <div 
        className={`w-10 h-10 sm:w-24 sm:h-24 border-[2px] border-t-[#373737] border-l-[#373737] border-b-white border-r-white relative flex items-center justify-center transition-all
          ${!isValid ? 'cursor-not-allowed bg-[#8b8b8b]' : 'cursor-pointer hover:bg-[#a1a1a1]'}
          ${isSelected && isValid ? 'bg-[#a1a1a1]' : (isValid ? 'bg-[#8b8b8b]' : '')}`}
        onClick={() => {
          if (isValid) {
            setActiveFilter(activeFilter === filterKey ? null : filterKey);
          }
        }}
      >
        <div className="absolute top-0 right-0 w-[2px] h-[2px] bg-[#8b8b8b]"></div>
        <div className="absolute bottom-0 left-0 w-[2px] h-[2px] bg-[#8b8b8b]"></div>
        {isSelected && isValid && <div className="absolute inset-0 border-2 border-white pointer-events-none z-10"></div>}

        {item && isValid ? (
          <img 
            src={getImagePath(item.target_item, item.custom_model_data)} 
            alt={item.nom} 
            className="w-[85%] h-[85%] object-contain image-rendering-pixelated drop-shadow-md z-10"
            title={`${item.nom} (Filtrer)`}
          />
        ) : (
          <img 
            src={emptySlotIcon} 
            alt={`Slot ${filterKey}`} 
            className={`w-[60%] h-[60%] object-contain image-rendering-pixelated pointer-events-none z-0 ${!isValid ? 'opacity-30 grayscale' : 'opacity-60 grayscale-0'}`} 
            onError={(e) => {
              if (!e.currentTarget.src.includes(fallbackEmptyIcon)) {
                e.currentTarget.src = fallbackEmptyIcon;
              }
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-[1300px] mx-auto">
      
      <div className="max-w-[800px] w-full relative mt-24 z-0 mx-auto">
        
        <div className="absolute -top-[70px] sm:-top-[106px] left-0 right-0 flex gap-[2px] sm:gap-[5px] px-[2px]">
          {MATERIALS.map((mat) => {
            const isActive = activeMaterial === mat.id;
            return (
              <button
                key={mat.id}
                onClick={() => {
                  const newMat = activeMaterial === mat.id ? null : mat.id;
                  setActiveMaterial(newMat);
                  
                  if (newMat && activeFilter) {
                    const isWeaponOrTool = ['sword', 'pickaxe', 'axe', 'shovel', 'hoe'].includes(activeFilter);
                    const isArmor = ['helmet', 'chestplate', 'leggings', 'boots'].includes(activeFilter);
                    const isSpecialSlot = ['hat', 'backpack', 'shield', 'bow', 'crossbow', 'trident'].includes(activeFilter);

                    let invalidate = false;
                    if (isSpecialSlot) invalidate = true;
                    if ((newMat === 'wooden' || newMat === 'stone') && isArmor) invalidate = true;
                    if ((newMat === 'leather' || newMat === 'chainmail') && isWeaponOrTool) invalidate = true;

                    if (invalidate) setActiveFilter(null);
                  }
                }}
                className={`
                  relative flex-1 h-[70px] sm:h-[106px] flex justify-center items-start pt-2 sm:pt-4 text-[10px] sm:text-xs font-bold text-[#373737] select-none cursor-pointer
                  ${isActive 
                    ? 'bg-[#c6c6c6] z-30 top-[4px] shadow-[-2px_0_0_black,0_-2px_0_black,2px_0_0_black,inset_2px_2px_0_0_white,inset_-2px_0_0_0_#555555]' 
                    : 'bg-[#8b8b8b] z-10 top-[8px] hover:bg-[#9e9e9e] shadow-[-2px_0_0_black,0_-2px_0_black,2px_0_0_black,inset_2px_2px_0_0_white,inset_-2px_-2px_0_0_#555555]'}
                `}
              >
                <img src={mat.icon} alt={mat.label} className="w-8 h-8 sm:w-16 sm:h-16 image-rendering-pixelated pointer-events-none" />
                {isActive && <div className="absolute -bottom-[4px] left-[2px] right-[2px] h-[4px] bg-[#c6c6c6]"></div>}
              </button>
            );
          })}
        </div>

        <McGuiBox>
          <div className="flex flex-col items-center gap-4 relative z-20 mt-4 sm:mt-2">
            <div className="flex items-stretch gap-4 w-full justify-center">
              
              {/* Colonne de gauche (Définit la hauteur de référence) */}
              <div className="flex flex-col gap-1">
                <CellFilter item={equipped.helmet} filterKey="helmet" material={activeMaterial} />
                <CellFilter item={equipped.chestplate} filterKey="chestplate" material={activeMaterial} />
                <CellFilter item={equipped.leggings} filterKey="leggings" material={activeMaterial} />
                <CellFilter item={equipped.boots} filterKey="boots" material={activeMaterial} />
              </div>

              {/* Boîte centrale (Hauteur automatique grâce à items-stretch) */}
              <div className="w-[6rem] sm:w-[16rem] bg-black border-2 border-[#555555] p-1 flex justify-center items-center shadow-inner relative">
                <img 
                  src={`https://mc-heads.net/body/${pseudo}/160`} 
                  alt={`Skin de ${pseudo}`} 
                  className="h-full object-contain image-rendering-pixelated"
                />
              </div>

              {/* Colonne de droite (S'étire et pousse le bouclier en bas via justify-between) */}
              <div className="flex flex-col justify-between">
                <div className="flex flex-col gap-1">
                  <CellFilter item={equipped.hat} filterKey="hat" material={activeMaterial} />
                  <CellFilter item={equipped.backpack} filterKey="backpack" material={activeMaterial} />
                </div>
                <div className="flex flex-col justify-end">
                  <CellFilter item={equipped.shield} filterKey="shield" material={activeMaterial} />
                </div>
              </div>
              
            </div>

            <div className="flex gap-1 justify-center bg-[#8b8b8b] p-1 border-[2px] border-t-[#373737] border-l-[#373737] border-b-white border-r-white">
              <CellFilter item={equipped.sword} filterKey="sword" material={activeMaterial} />
              <CellFilter item={equipped.pickaxe} filterKey="pickaxe" material={activeMaterial} />
              <CellFilter item={equipped.axe} filterKey="axe" material={activeMaterial} />
              <CellFilter item={equipped.shovel} filterKey="shovel" material={activeMaterial} />
              <CellFilter item={equipped.hoe} filterKey="hoe" material={activeMaterial} />
              <CellFilter item={equipped.bow} filterKey="bow" material={activeMaterial} />
              <CellFilter item={equipped.crossbow} filterKey="crossbow" material={activeMaterial} />
              <CellFilter item={equipped.trident} filterKey="trident" material={activeMaterial} />
            </div>

          </div>
        </McGuiBox>
      </div>

      <McGuiBox>
        {filteredItems.length === 0 ? (
          <div className="text-center font-bold text-[#555555] py-10 text-xl">Aucun objet correspondant dans le sac.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredItems.map((item, index) => {
              const isEquipped = item.is_equipped === true || item.is_equipped === 1;

              return (
                <div 
                  key={`${item.id}-${index}`} 
                  className={`border-4 p-4 flex flex-col gap-4 h-full transition-colors cursor-pointer
                    ${isEquipped 
                      ? 'bg-[#a1a1a1] border-t-white border-l-white border-b-[#555555] border-r-[#555555]' 
                      : 'bg-[#c6c6c6] border-t-[#555555] border-l-[#555555] border-b-white border-r-white hover:bg-[#d6d6d6]'}`}
                  onClick={() => handleEquipToggle(item)}
                >
                  <div className="relative w-full aspect-square bg-[#8b8b8b] border-4 border-t-[#373737] border-l-[#373737] border-b-white border-r-white flex items-center justify-center p-2">
                    <img 
                      src={getImagePath(item.target_item, item.custom_model_data)} 
                      alt={item.nom} 
                      className="w-full h-full object-contain drop-shadow-md image-rendering-pixelated z-10"
                      onError={(e) => { 
                        e.currentTarget.onerror = null; 
                        e.currentTarget.src = '/images/default.png'; 
                      }} 
                    />
                  </div>

                  <div className="flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-[#373737] uppercase leading-tight mb-2 line-clamp-1">
                      {item.nom}
                    </h3>
                    <p className="text-[#555555] text-sm flex-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEquipToggle(item);
                    }}
                    className={`w-full py-2 font-bold text-white uppercase border-4 transition-colors ${
                      isEquipped
                        ? 'bg-[#cc3333] hover:bg-[#ff4444] active:bg-[#aa2222] border-t-[#ff6666] border-l-[#ff6666] border-b-[#880000] border-r-[#880000]'
                        : 'bg-[#4a8a3a] hover:bg-[#5c9f4c] active:bg-[#376b2b] border-t-[#7cc06b] border-l-[#7cc06b] border-b-[#264f19] border-r-[#264f19]'
                    }`}
                  >
                    {isEquipped ? 'Déséquiper' : 'Équiper'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </McGuiBox>
    </div>
  );
}