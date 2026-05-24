import { useState, useEffect } from 'react';

// 1. Définition de la structure d'un item de la base de données pour TypeScript
interface ShopItem {
  id: number;
  nom: string;
  description: string;
  prix: number;
  categorie: string;
  custom_model_data: number;
}

// 2. Les Props attendues par le composant Boutique
interface BoutiqueProps {
  handleBuyItem: (itemId: number) => void;
}

export default function Boutique({ handleBuyItem }: BoutiqueProps) {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 3. Chargement automatique des articles depuis ton API
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

  if (loading) {
    return <div className="text-center font-black text-2xl uppercase mt-10">Chargement de la boutique... 🛒</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* 4. La boucle magique .map() qui génère les cartes automatiquement ! */}
      {items.map((item) => (
        <div 
          key={item.id} 
          className="bg-white border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col justify-between"
        >
          <div>
            <h3 className="text-2xl font-black uppercase mb-2">
              {item.categorie === 'skin_sword' ? '💎' : '☁️'} {item.nom}
            </h3>
            <p className="text-gray-700 font-medium mb-6">
              {item.description}
            </p>
          </div>
          
          <div className="flex justify-between items-center mt-auto">
            <span className="text-3xl font-black text-[#ff6b6b]">{item.prix} PC</span>
            <button 
              onClick={() => handleBuyItem(item.id)} // On passe l'id unique de l'item cliqué
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