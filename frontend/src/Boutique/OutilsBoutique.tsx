import { useState } from 'react';

type TypeItem =
  | "arc"
  | "arbalete"
  | "cosmetiques"
  | "chapeau"
  | "evenementPositif"
  | "evenementNegatif"
  | "cosmetique"
  | "epee"
  | "pioche"
  | "houe"
  | "pelle"
  | "hache"
  | "bouclier"
  | "bottes"
  | "pantalon"
  | "plastron"
  | "casque"
  | "elytre";

interface ShopItem {
  id: number;
  nom: string;
  description: string;
  prix: number;
  target_item: string; 
  custom_model_data: number;
  categorie: TypeItem;
}

interface OutilsBoutiqueProps {
  items: ShopItem[];
   getImagePath: (targetItem: string, modelData: number) => string;
  handleBuyItem: (itemId: number) => void;
}

export default function OutilsBoutique({ handleBuyItem, items, getImagePath }: OutilsBoutiqueProps) {
  // État pour gérer la catégorie de gauche
  const [activeTab, setActiveTab] = useState(0);
  const categories = ['Epee', 'Arc', 'Arbalete', 'Trident'];
  const image = [
    "images/boutique/icones/combat/epee.png",
    "images/boutique/icones/combat/arc.png",
    "images/boutique/icones/combat/arbalete.png",
    "images/boutique/icones/combat/trident.png"
  ];

  // État pour gérer la catégorie de droite (matériaux)
  const [activeMaterialTab, setActiveMaterialTab] = useState(0);
  const materials = ['Bois', 'Pierre','cuivre', 'Fer', 'Or', 'Diamant', 'Netherite'];
  const materialImages = [
    "images/boutique/icones/materiaux/bois.png",
    "images/boutique/icones/materiaux/pierre.png",
    "images/boutique/icones/materiaux/cuivre.png",
    "images/boutique/icones/materiaux/fer.png",
    "images/boutique/icones/materiaux/or.png",
    "images/boutique/icones/materiaux/diamant.png",
    "images/boutique/icones/materiaux/netherite.png"
  ];

  return (
    <div className="h-full w-full m-0 p-0 flex items-center justify-center">
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      
      {items.map((item) => (
        <div 
          key={item.id} 
          className="bg-white border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col justify-between"
        >
          <div>
            {/* 🖼️ L'image générée dynamiquement */}
            <div className="bg-gray-100 rounded-xl border-2 border-black p-4 mb-4 flex justify-center items-center h-40">
              <img 
                src={getImagePath(item.target_item, item.custom_model_data)} 
                alt={item.nom} 
                className="max-h-full max-w-full object-contain"
                onError={(e) => { 
                  // On désactive l'erreur pour empêcher la boucle infinie de clignotement
                  e.currentTarget.onerror = null; 
                  e.currentTarget.src = '/images/default.png'; 
                }} 
              />
            </div>

            <h3 className="text-2xl font-black uppercase mb-2">
               {item.nom}
            </h3>
            <p className="text-gray-700 font-medium mb-6">
              {item.description}
            </p>
          </div>
          
          <div className="flex justify-between items-center mt-auto">
            <span className="text-3xl font-black text-[#ff6b6b]">{item.prix} PC</span>
            <button 
              onClick={() => handleBuyItem(item.id)}
              className="bg-[#ffde4d] font-black uppercase border-4 border-black px-6 py-2 rounded-xl shadow-[4px_4px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              Acheter
            </button>
          </div>
        </div>
      ))}
    </div>
        </>
      
      {/* Conteneur global définissant le contexte d'empilement avec z-0 */}
      <div className="relative mt-24 z-0">
        
        {/* Onglets de GAUCHE (Catégories principales) */}
        <div className="absolute -top-[106px] left-0 flex gap-[5px]">
          {categories.map((cat, index) => {
            const isActive = activeTab === index;
            return (
              <button
                key={`cat-${index}`}
                onClick={() => setActiveTab(index)}
                className={`
                  relative w-24 h-[106px] cursor-pointer flex justify-center pt-4 text-[10px] font-bold text-[#373737] select-none
                  ${isActive 
                    ? 'bg-[#c6c6c6] z-30 top-[4px] shadow-[-2px_0_0_black,0_-2px_0_black,2px_0_0_black,inset_2px_2px_0_0_white,inset_-2px_0_0_0_#555555]' 
                    : 'bg-[#8b8b8b] z-10 top-[8px] hover:bg-[#9e9e9e] shadow-[-2px_0_0_black,0_-2px_0_black,2px_0_0_black,inset_2px_2px_0_0_white,inset_-2px_-2px_0_0_#555555]'}
                `}
              >
                {/* pointer-events-none empêche l'image de bloquer le clic sur le bouton */}
                <img className="w-16 h-16 pointer-events-none" src={image[index]} alt={cat} />
                {isActive && (
                  <div className="absolute -bottom-[4px] left-[2px] right-[2px] h-[4px] bg-[#c6c6c6]"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Onglets de DROITE (Matériaux) */}
        <div className="absolute -top-[106px] right-0 flex gap-[5px]">
          {materials.map((mat, index) => {
            const isActive = activeMaterialTab === index;
            return (
              <button
                key={`mat-${index}`}
                onClick={() => setActiveMaterialTab(index)}
                className={`
                  relative w-24 h-[106px] cursor-pointer flex justify-center pt-4 text-[10px] font-bold text-[#373737] select-none
                  ${isActive 
                    ? 'bg-[#c6c6c6] z-30 top-[4px] shadow-[-2px_0_0_black,0_-2px_0_black,2px_0_0_black,inset_2px_2px_0_0_white,inset_-2px_0_0_0_#555555]' 
                    : 'bg-[#8b8b8b] z-10 top-[8px] hover:bg-[#9e9e9e] shadow-[-2px_0_0_black,0_-2px_0_black,2px_0_0_black,inset_2px_2px_0_0_white,inset_-2px_-2px_0_0_#555555]'}
                `}
              >
                <img className="w-16 h-16 pointer-events-none" src={materialImages[index]} alt={mat} />
                {isActive && (
                  <div className="absolute -bottom-[4px] left-[2px] right-[2px] h-[4px] bg-[#c6c6c6]"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Conteneur principal (z-20 pour se positionner au-dessus des onglets inactifs) */}
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

          {/* Zone centrale */}
          <div className="[grid-area:inv] bg-[#c6c6c6] w-[1200px] text-4xl h-[700px] p-4 text-[#373737] flex flex-col gap-4">
            <div>Catégorie : <strong>{categories[activeTab]}</strong></div>
            <div>Matériau : <strong>{materials[activeMaterialTab]}</strong></div>
          </div>

        </div>
      </div>
      
    </div>
  );
}