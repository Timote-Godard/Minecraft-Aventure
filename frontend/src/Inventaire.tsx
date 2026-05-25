import { useState, useEffect } from 'react';

// 1. Mise à jour de l'interface
interface InventoryItem {
  id: number;
  nom: string;
  description: string;
  target_item: string; // <-- Remplacement de categorie
  custom_model_data: number;
  is_equipped: boolean | number;
}

export default function Inventaire() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleEquip = (itemId: number) => {
    const token = localStorage.getItem('aventure_token');
    if (!token) return;

    fetch('https://api-minecraft.timote.ovh/api/inventory/equip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ itemId })
    }).then(() => fetchInventory());
  };

  const handleUnequip = (itemId: number) => {
    const token = localStorage.getItem('aventure_token');
    if (!token) return;

    fetch('https://api-minecraft.timote.ovh/api/inventory/unequip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ itemId })
    }).then(() => fetchInventory());
  };

  // 🪄 La même fonction de formatage que pour la boutique
  const getImagePath = (targetItem: string, modelData: number) => {
    if (!targetItem) return '/images/default.png';
    const folderName = targetItem.replace('minecraft:', '').replace(/_/g, '-');
    return `/images/${folderName}/${modelData}.png`;
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
        const isEquipped = item.is_equipped === true || item.is_equipped === 1;

        return (
          <div 
            key={item.id} 
            className={`bg-white border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col justify-between transition-all ${isEquipped ? 'ring-4 ring-[#4ade80] ring-offset-4' : ''}`}
          >
            <div>
              {/* 🖼️ L'image de l'inventaire */}
              <div className="bg-gray-100 rounded-xl border-2 border-black p-4 mb-4 flex justify-center items-center h-40">
                <img 
                  src={getImagePath(item.target_item, item.custom_model_data)} 
                  alt={item.nom} 
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => { e.currentTarget.src = '/images/default.png' }}
                />
              </div>

              <h3 className="text-2xl font-black uppercase mb-2">
                {item.nom}
              </h3>
              <p className="text-gray-700 font-medium mb-6">
                {item.description}
              </p>
            </div>
            
            <div className="flex justify-end items-center mt-auto">
              {isEquipped ? (
                <button 
                  onClick={() => handleUnequip(item.id)}
                  className="group bg-[#4ade80] hover:bg-[#ff6b6b] text-black hover:text-white font-black uppercase border-4 border-black px-6 py-2 rounded-xl shadow-[4px_4px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                >
                  <span className="group-hover:hidden">Équipé ✅</span>
                  <span className="hidden group-hover:inline">Retirer ❌</span>
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