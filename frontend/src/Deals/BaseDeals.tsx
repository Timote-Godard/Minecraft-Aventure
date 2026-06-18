import { useState, useEffect } from 'react';

// --- SOUS-COMPOSANT : Gère l'état d'une seule carte ---
const DealCard = ({ deal, onlinePlayers, handleBuyDeal }: { deal: any, onlinePlayers: string[], handleBuyDeal: (itemId: number, targets: string[]) => void }) => {
  // Stocke les joueurs sélectionnés pour cette carte précise
  const [targets, setTargets] = useState<string[]>([]);

  // Initialise les sélecteurs avec le premier joueur connecté par défaut
  useEffect(() => {
    if (deal.custom_model_data > 0 && onlinePlayers.length > 0) {
      setTargets(Array(deal.custom_model_data).fill(onlinePlayers[0]));
    }
  }, [deal.custom_model_data, onlinePlayers]);

  const handleTargetChange = (index: number, value: string) => {
    const newTargets = [...targets];
    newTargets[index] = value;
    setTargets(newTargets);
  };

  const getImagePath = (targetItem: string) => `/images/deals/${targetItem}.png`;

  const requiresPlayers = deal.custom_model_data > 0;
  // Bloque l'achat si un joueur est requis mais que le serveur est vide
  const canBuy = !requiresPlayers || onlinePlayers.length > 0;

  return (
    <div className="bg-[#c6c6c6] border-4 border-t-[#555555] border-l-[#555555] border-b-white border-r-white p-4 flex flex-col gap-4 h-full">
      <div className="w-full aspect-square bg-[#8b8b8b] border-4 border-t-[#373737] border-l-[#373737] border-b-white border-r-white flex items-center justify-center p-2">
        <img 
          src={getImagePath(deal.target_item)} 
          alt={deal.nom} 
          className="w-full h-full object-contain drop-shadow-md"
          onError={(e) => { e.currentTarget.src = '/images/default.png'; }} 
        />
      </div>

      <div className="flex flex-col flex-1">
        <h3 className="text-xl font-bold text-[#373737] uppercase leading-tight mb-2">
          {deal.nom}
        </h3>
        <p className="text-[#555555] text-sm flex-1">
          {deal.description}
        </p>
      </div>

      {/* --- GÉNÉRATION DYNAMIQUE DES SÉLECTEURS --- */}
      {requiresPlayers && (
        <div className="flex flex-col gap-2">
          {onlinePlayers.length === 0 ? (
            <span className="text-red-600 font-bold text-sm text-center">Aucun joueur en ligne</span>
          ) : (
            Array.from({ length: deal.custom_model_data }).map((_, index) => (
              <select 
                key={index}
                value={targets[index] || ''}
                onChange={(e) => handleTargetChange(index, e.target.value)}
                className="w-full p-2 bg-stone-800 text-white border-2 border-stone-600 outline-none text-sm font-bold"
              >
                {onlinePlayers.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            ))
          )}
        </div>
      )}
      
      <button 
        onClick={() => handleBuyDeal(deal.id, targets)}
        disabled={!canBuy}
        className={`w-full py-2 font-bold text-white uppercase border-4 transition-colors ${
          canBuy 
            ? 'bg-[#4a8a3a] hover:bg-[#5c9f4c] active:bg-[#376b2b] border-t-[#7cc06b] border-l-[#7cc06b] border-b-[#264f19] border-r-[#264f19]' 
            : 'bg-stone-500 border-stone-400 opacity-50 cursor-not-allowed'
        }`}
      >
        {deal.prix} PC
      </button>
    </div>
  );
};

// --- COMPOSANT PRINCIPAL ---
export default function BonDeals({ deals, handleBuyDeal }: { deals: any[]; handleBuyDeal: (itemId: number, targets?: string[]) => void }) {
  const [onlinePlayers, setOnlinePlayers] = useState<string[]>([]);

  // Récupération des joueurs au montage de la boutique
  useEffect(() => {
    fetch('https://api-minecraft.timote.ovh/api/players/online')
      .then(res => res.json())
      .then(data => {
        if (data.success) setOnlinePlayers(data.players);
      })
      .catch(err => console.error("Erreur chargement joueurs:", err));
  }, []);

  return (
    <div className="relative z-20 grid grid-cols-[2px_2px_auto_2px_2px] grid-rows-[2px_2px_auto_2px_2px] [grid-template-areas:'tl-tl_tr-tl_t_tl-tr_tr-tr'_'bl-tl_br-tl_t_bl-tr_br-tr'_'l_l_inv_r_r'_'tl-bl_tr-bl_b_tl-br_tr-br'_'bl-bl_br-bl_b_bl-br_br-br']">
      {/* Bordures Minecraft... */}
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

      <div className="[grid-area:inv] bg-[#c6c6c6] w-[1250px] h-full p-6 flex flex-col gap-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          {deals.map((deal, index) => (
            // Appel du sous-composant pour chaque offre
            <DealCard 
              key={`${deal.id}-${index}`} 
              deal={deal} 
              onlinePlayers={onlinePlayers} 
              handleBuyDeal={handleBuyDeal} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}