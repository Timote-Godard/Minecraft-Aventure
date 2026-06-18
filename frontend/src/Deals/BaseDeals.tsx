export default function BaseDeals({ deals, handleBuyDeal }: { deals: any[]; handleBuyDeal: (itemId: number) => void }) {
    const getImagePath = (targetItem: string) => {
        // Logique pour déterminer le chemin de l'image
        return `images/deals/${targetItem}.png`;
    };
    
    return (
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
            {deals
                .map((deal, index) => (
                  <div 
                key={`${deal.id}-${index}`} 
                className="bg-[#c6c6c6] border-4 border-t-[#555555] border-l-[#555555] border-b-white border-r-white p-4 flex flex-col gap-4 h-full"
              >
                {/* Emplacement de l'image (Slot Minecraft) */}
                <div className="w-full aspect-square bg-[#8b8b8b] border-4 border-t-[#373737] border-l-[#373737] border-b-white border-r-white flex items-center justify-center p-2">
                  <img 
                    src={getImagePath(deal.target_item)} 
                    alt={deal.nom} 
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
                    {deal.nom}
                  </h3>
                  <p className="text-[#555555] text-sm flex-1">
                    {deal.description}
                  </p>
                </div>
                
                {/* Bouton d'achat */}
                <button 
                  onClick={() => handleBuyDeal(deal.id)}
                  className="w-full py-2 font-bold text-white uppercase bg-[#4a8a3a] hover:bg-[#5c9f4c] active:bg-[#376b2b] border-4 border-t-[#7cc06b] border-l-[#7cc06b] border-b-[#264f19] border-r-[#264f19] transition-colors"
                >
                  {deal.prix} PC
                </button>
              </div>
                ))}
            </div>
          </div>
        </div>
)
}
