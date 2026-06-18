import { useState, useEffect } from 'react';
import Login from "./Login";  
import Map from "./Map";
import HubDeals from "./Deals/HubDeals";
import HubBoutique from "./Boutique/HubBoutique";
import Inventaire from "./Inventaire";
import type { ShopItem } from './Boutique/types'; 

interface InventoryItem {
  id: number;
  nom: string;
  description: string;
  target_item: string;
  custom_model_data: number;
  is_equipped: boolean | number;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeTab, setActiveTab] = useState('shop'); // Mis sur 'shop' par défaut pour tester
  const [refreshKey, setRefreshKey] = useState(0);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [itemsInventory, setItemsInventory] = useState<InventoryItem[]>([]);
  const [deals, setDeals] = useState<ShopItem[]>([]); // État pour stocker les deals
  
  const [pseudo, setPseudo] = useState('');
  const [solde, setSolde] = useState<number>(0);
  
  useEffect(() => {
    const savedSession = localStorage.getItem('aventure_session');
    if (savedSession) {
      const userData = JSON.parse(savedSession);
      setPseudo(userData.pseudo);
      setSolde(userData.solde);
      setIsLoggedIn(true);
    }
    recupereItemsShop();
    fetchInventory();
  }, []);

  const recupereItemsShop = () => {
    fetch('https://api-minecraft.timote.ovh/api/shop/items')
      .then((res) => res.json())
      .then((data: ShopItem[]) => { 

        setItems(data.filter((item) => [
          'casque', 'plastron', 'pantalon', 'bottes', 'elytre',
          'epee', 'arc', 'arbalete', 'bouclier', 'pioche', 'hache', 
          'pelle', 'houe', 'cosmetiques', 'chapeau', 'cosmetique'
        ].includes(item.categorie)));

        setDeals(data.filter((item) => [
          'evenementPositif', 'evenementNegatif'
        ].includes(item.categorie)));
      })
      .catch((err) => console.error("Impossible de charger la boutique", err));
  };

  const fetchInventory = () => {
    const token = localStorage.getItem('aventure_token');
    if (!token) return;

    fetch('https://api-minecraft.timote.ovh/api/inventory', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setItemsInventory(data);
      })
      .catch((err) => {
        console.error("Impossible de récupérer l'inventaire :", err);
      });
  };

const handleBuy = (itemId: number, targets: string[] = []) => {
    const token = localStorage.getItem('aventure_token');
    if (!token) {
      alert("❌ Tu n'es pas connecté !");
      return;
    }

    fetch('https://api-minecraft.timote.ovh/api/shop/buy', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ itemId: itemId, targets: targets })
    })
    .then(res => res.json())
    .then(data => {
        alert(`🛒 Succès ! Tu as débloqué : ${data.itemName} !`);
        setSolde(data.newSolde);
        fetchInventory(); // Met à jour l'inventaire après l'achat
      })
      .catch((err) => {
        console.error("Impossible d'acheter :", err);
        if (err === "déconnecté") handleLogout();
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('aventure_session');
    localStorage.removeItem('aventure_token');
    setIsLoggedIn(false);
    setPseudo('');
    setSolde(0);
  };

  // --- COMPOSANT DE BOUTON DE NAVIGATION ---
  const NavButton = ({ id, label, iconDefault, iconHover }: { id: string, label: string, iconDefault: string, iconHover?: string }) => {
    const isActive = activeTab === id;
    
    return (
      <button 
        onClick={() => { setActiveTab(id); setRefreshKey(prev => prev + 1); }}
        className={`
          group flex items-center gap-2 px-4 py-2 font-bold text-lg uppercase tracking-widest select-none
          border-[4px] transition-none
          ${isActive 
            ? 'bg-[#8b8b8b] border-t-[#373737] border-l-[#373737] border-b-white border-r-white text-white' 
            : 'cursor-pointer bg-[#c6c6c6] border-t-white border-l-white border-b-[#555555] border-r-[#555555] text-[#373737] hover:bg-[#d6d6d6] active:border-t-[#555555] active:border-l-[#555555] active:border-b-white active:border-r-white active:text-white active:bg-[#8b8b8b]'}
        `}
      >
        {/* Si on a une image de survol (le coffre), on fait l'échange */}
        <div className="w-8 h-8 relative flex-shrink-0 image-rendering-pixelated">
          <img 
            src={iconDefault} 
            alt="icon" 
            className={`absolute inset-0 w-full h-full object-contain ${iconHover ? 'group-hover:hidden' : ''}`} 
          />
          {iconHover && (
            <img 
              src={iconHover} 
              alt="icon open" 
              className="absolute inset-0 w-full h-full object-contain hidden group-hover:block" 
            />
          )}
        </div>
        
        <span className="hidden md:inline">{label}</span>
      </button>
    );
  };

  if (!isLoggedIn) {
    return <Login setIsLoggedIn={setIsLoggedIn} setPseudo={setPseudo} setSolde={setSolde}/>;
  }

  return (
    // Fond sombre global (stone-900)
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans bg-[url('/images/wood.jpg')] bg-repeat" style={{ backgroundSize: '128px' }}>

      {/* --- HEADER / NAVBAR FIXE --- */}
      <nav className="sticky top-0 z-50 w-full bg-[#c6c6c6] border-b-[6px] border-b-[#555555] border-t-[6px] border-t-white">
  <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-20 flex items-center">
  

    {/* Section Centrale : Navigation avec les nouveaux icônes */}
    <div className="flex gap-2 sm:gap-4">
      <NavButton 
        id="map" 
        label="BlueMap" 
        iconDefault="/images/nav/compass.png" 
      />
      <NavButton 
        id="deals" 
        label="Offres" 
        iconDefault="/images/nav/nether_star.png" 
      />
      <NavButton 
        id="shop" 
        label="Boutique" 
        iconDefault="/images/nav/emerald.png" 
      />
      <NavButton 
        id="inventory" 
        label="Sac à dos" 
        iconDefault="/images/nav/chest_closed.png" 
        iconHover="/images/nav/chest_open.png" 
      />
    </div>

    {/* Section Droite : Profil & Déconnexion */}
    <div className="flex-1 flex justify-end items-center gap-4">
      
      {/* Encart Joueur */}
      <div className="flex items-center bg-[#8b8b8b] border-[4px] border-t-[#373737] border-l-[#373737] border-b-white border-r-white p-1">
        
        {/* Tête 3D du joueur via API (Mise à l'échelle pixelisée) */}
        <div className="w-8 h-8 ml-1 border-2 border-[#373737] bg-black">
          <img 
            src={pseudo ? `https://minotar.net/helm/${pseudo}/32.png` : '/images/nav/steve.png'} 
            alt="Tête du joueur" 
            className="w-full h-full image-rendering-pixelated"
          />
        </div>

        <div className="px-2 text-white font-bold text-sm sm:text-base drop-shadow-[2px_2px_0px_#373737]">
          <span className="hidden sm:inline">{pseudo}</span>
        </div>
        <div className="px-2 text-[#55ff55] font-bold text-sm sm:text-base whitespace-nowrap drop-shadow-[2px_2px_0px_#373737]">
          {solde} PC
        </div>  
      </div>

      {/* Bouton Déconnexion avec une porte */}
      <button 
        onClick={handleLogout}
        className="cursor-pointer flex items-center justify-center w-12 h-12 bg-[#c6c6c6] border-[4px] border-t-white border-l-white border-b-[#555555] border-r-[#555555] hover:bg-[#d6d6d6] active:border-t-[#555555] active:border-l-[#555555] active:border-b-white active:border-r-white active:bg-[#8b8b8b] p-1"
        title="Se déconnecter"
      >
        <img src="/images/nav/door.png" alt="Déconnexion" className="w-full h-full object-contain image-rendering-pixelated" />
      </button>
    </div>
    
  </div>
</nav>

      {/* --- CONTENU PRINCIPAL --- */}
      {/* Ajout d'un padding-top pour ne pas coller à la navbar et d'une image de fond optionnelle */}
      <main className="relative w-full min-h-[calc(100vh-80px)] flex flex-col items-center pt-10 pb-20 px-4 md:px-10">
        
        {/* Décoration d'arrière-plan (Optionnel : effet de lueur) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-[1600px] flex justify-center">
          {activeTab === 'map' && <Map key={`map-${refreshKey}`} />}
          {activeTab === 'deals' && <HubDeals key={`deals-${refreshKey}`} deals={deals} handleBuyDeal={handleBuy} />}
          {activeTab === 'shop' && <HubBoutique key={`shop-${refreshKey}`} items={items} handleBuyItem={handleBuy} itemsInventory={itemsInventory} />}
          {activeTab === 'inventory' && <Inventaire key={`inv-${refreshKey}`} itemsInventory={itemsInventory} setItemsInventory={setItemsInventory} handleLogout={handleLogout} pseudo={pseudo}/>}
        </div>
      </main>

    </div>
  )
}