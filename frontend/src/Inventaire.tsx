import { useState, useEffect } from 'react';

// 1. La structure d'un objet possédé
interface InventoryItem {
  id: number;
  nom: string;
  description: string;
  categorie: string;
  custom_model_data: number;
  is_equipped: boolean | number; // MySQL renvoie parfois 1 ou 0 au lieu de true/false
}

export default function Inventaire() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. Fonction pour charger le sac à dos
  const fetchInventory = () => {
    const token = localStorage.getItem('aventure_token');
    
    if (!token) return;

    fetch('https://api-minecraft.timote.ovh/api/inventory', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur de chargement de l'inventaire", err);
        setLoading(false);
      });
  };

  // On charge au démarrage du composant
  useEffect(() => {
    fetchInventory();
  }, []);

  // 3. Fonction pour équiper un objet
  const handleEquip = (itemId: number) => {
    const token = localStorage.getItem('aventure_token');
    if (!token) return;

    fetch('https://api-minecraft.timote.ovh/api/inventory/equip', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ itemId })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert("❌ " + data.error);
        } else {
          // Si succès, on recharge l'inventaire pour mettre à jour les boutons visuellement
          fetchInventory(); 
        }
      });
  };

  if (loading) {
    return <div className="text-center font-black text-2xl uppercase mt-10">Fouille du sac à dos... 🎒</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-center mt-10 bg-white border-4 border-black p-8 rounded-2xl shadow-[8px_8px_0px_0px_#000]">
        <h2 className="text-2xl font-black uppercase mb-4">Ton sac est vide ! 🕸️</h2>
        <p className="text-gray-700 font-medium">Fais un tour dans l'armurerie pour acheter tes premiers skins.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {items.map((item) => {
        // MySQL peut renvoyer 1 (vrai) ou 0 (faux)
        const isEquipped = item.is_equipped === true || item.is_equipped === 1;

        return (
          <div 
            key={item.id} 
            className={`bg-white border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col justify-between transition-all ${isEquipped ? 'ring-4 ring-[#4ade80] ring-offset-4' : ''}`}
          >
            <div>
              <h3 className="text-2xl font-black uppercase mb-2">
                {item.categorie === 'skin_sword' ? '💎' : '☁️'} {item.nom}
              </h3>
              <p className="text-gray-700 font-medium mb-6">
                {item.description}
              </p>
            </div>
            
            <div className="flex justify-end items-center mt-auto">
              {isEquipped ? (
                <button 
                  disabled
                  className="bg-[#4ade80] text-black font-black uppercase border-4 border-black px-6 py-2 rounded-xl opacity-80 cursor-not-allowed"
                >
                  Équipé ✅
                </button>
              ) : (
                <button 
                  onClick={() => handleEquip(item.id)}
                  className="bg-white hover:bg-gray-100 text-black font-black uppercase border-4 border-black px-6 py-2 rounded-xl shadow-[4px_4px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                >
                  Équiper
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}