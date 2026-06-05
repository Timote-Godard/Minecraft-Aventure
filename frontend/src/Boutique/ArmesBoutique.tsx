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

interface ArmesBoutiqueProps {
  items: ShopItem[];
   getImagePath: (targetItem: string, modelData: number) => string;
  handleBuyItem: (itemId: number) => void;
}

export default function ArmesBoutique({ handleBuyItem, items, getImagePath }: ArmesBoutiqueProps) {

  items = [{id:1,nom:"epee",description:"olala la super épée tah les fous",prix:200,target_item:"diamond_sword",custom_model_data:1,categorie:"epee"},
    {id:1,nom:"epee",description:"olala la super épée tah les fous",prix:200,target_item:"diamond_sword",custom_model_data:1,categorie:"epee"},
    {id:1,nom:"epee",description:"olala la super épée tah les fous",prix:200,target_item:"diamond_sword",custom_model_data:1,categorie:"epee"},
    {id:1,nom:"epee",description:"olala la super épée tah les fous",prix:200,target_item:"diamond_sword",custom_model_data:1,categorie:"epee"},
    {id:1,nom:"epee",description:"olala la super épée tah les fous",prix:200,target_item:"diamond_sword",custom_model_data:1,categorie:"epee"},
    {id:1,nom:"epee",description:"olala la super épée tah les fous",prix:200,target_item:"diamond_sword",custom_model_data:1,categorie:"epee"}
  ];
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
          <div className="[grid-area:inv] bg-[#c6c6c6] w-[1200px] text-4xl h-full p-4 text-[#373737] flex flex-col gap-4">
            <div className="flex justify-between items-end border-b-4 border-[#8b8b8b] pb-4 mb-6">
            <h2 className="text-3xl text-[#373737] font-bold">
              Catégorie : {categories[activeTab]}
            </h2>
            <h3 className="text-xl text-[#373737] font-semibold">
              Matériau : {materials[activeMaterialTab]}
            </h3>
          </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      
      {items.map((item, index) => (
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