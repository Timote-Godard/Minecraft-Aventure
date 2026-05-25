import { useState, useEffect } from 'react';

// 1. Mise à jour de l'interface : Adieu categorie, bonjour target_item !
interface ShopItem {
  id: number;
  nom: string;
  description: string;
  prix: number;
  target_item: string; 
  custom_model_data: number;
}

interface BoutiqueProps {
  handleBuyItem: (itemId: number) => void;
}

export default function Boutique({ handleBuyItem }: BoutiqueProps) {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api-minecraft.timote.ovh/api/shop/items')
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Impossible de charger la boutique", err);
        setLoading(false);
      });
  }, []);

  // 🪄 Fonction magique pour transformer "minecraft:wooden_sword" en "wooden-sword"
  const getImagePath = (targetItem: string, modelData: number) => {
    if (!targetItem) return '/images/default.png'; // Sécurité
    const folderName = targetItem.replace('minecraft:', '').replace(/_/g, '-');
    return `/images/${folderName}/${modelData}.png`;
  };

  if (loading) {
    return <div className="text-center font-black text-2xl uppercase mt-10">Chargement de la boutique... 🛒</div>;
  }

  return (
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
  );
}