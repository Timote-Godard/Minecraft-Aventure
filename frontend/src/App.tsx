import { useState, useEffect } from 'react';
import Login from "./Login";  
import Map from "./Map";
import HubBoutique from "./Boutique/HubBoutique";
import Inventaire from "./Inventaire";

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

export default function App() {
  // --- ÉTATS D'AUTHENTIFICATION ---
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // --- ÉTATS DU DASHBOARD ---
  const [activeTab, setActiveTab] = useState('map');
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Correction de la syntaxe useState
  const [items, setItems] = useState<ShopItem[]>([]);

  // --- INFORMATIONS DU JOUEUR ---
  const [pseudo, setPseudo] = useState('');
  const [solde, setSolde] = useState<number>(0);
  
  // --- VÉRIFICATION DE LA SESSION AU CHARGEMENT ---
  useEffect(() => {
    const savedSession = localStorage.getItem('aventure_session');
    
    if (savedSession) {
      const userData = JSON.parse(savedSession);
      setPseudo(userData.pseudo);
      setSolde(userData.solde);
      setIsLoggedIn(true);
    }

    recupereItemsShop();
  }, []);

  const recupereItemsShop = () => {
    fetch('https://api-minecraft.timote.ovh/api/shop/items')
      .then((res) => res.json())
      .then((data: ShopItem[]) => {
        setItems(data);
      })
      .catch((err) => {
        console.error("Impossible de charger la boutique", err);
      });
  };

  // --- NOUVELLE FONCTION D'ACHAT GÉNÉRIQUE SÉCURISÉE ---
  const handleBuyItem = (itemId: number) => {
    const token = localStorage.getItem('aventure_token');

    if (!token) {
      alert("❌ Tu n'es pas connecté !");
      return;
    }

    fetch('https://api-minecraft.timote.ovh/api/shop/buy/item', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ itemId: itemId }) // On envoie l'ID précis au serveur
    })
    .then(res => res.json())
    .then(data => {
        alert(`🛒 Succès ! Tu as débloqué : ${data.itemName} !`);
        setSolde(data.newSolde); // Le solde descend en direct !
      })
      .catch((err) => {
        console.error("Impossible d'acheter :", err);
        if (err === "déconnecté") {
          handleLogout();
        }
      });
  };

  // --- FONCTION DE DECONNEXIION
  const handleLogout = () => {
    localStorage.removeItem('aventure_session');
    localStorage.removeItem('aventure_token'); //🧹 On jette le bracelet à la poubelle
    setIsLoggedIn(false);
    setPseudo('');
    setSolde(0);
  };

  

  // =========================================================================
  // AFFICHAGE 1 : L'ÉCRAN DE CONNEXION (Si isLoggedIn est false)
  // =========================================================================
  if (!isLoggedIn) {
    return (
      <Login setIsLoggedIn={setIsLoggedIn} setPseudo={setPseudo} setSolde={setSolde}/>
    );
  }

  // =========================================================================
  // AFFICHAGE 2 : LE TABLEAU DE BORD (Si isLoggedIn est true)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#f4f4f0] p-6 md:p-10 font-sans text-black">

      {/* --- BOUTONS DE NAVIGATION --- */}
      <div className="max-w-6xl mx-auto flex gap-6 mb-8">
        <button 
          onClick={() => {
            setActiveTab('map');
            setRefreshKey(prev => prev + 1);
          }}
          className={`text-xl font-black uppercase border-4 border-black px-8 py-3 rounded-xl shadow-[6px_6px_0px_0px_#000] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none 
            ${activeTab === 'map' ? 'bg-[#4ade80] -translate-y-1' : 'bg-white hover:bg-gray-100'}`}
        >
          🗺️ BlueMap
        </button>
        <button 
          onClick={() => {
            setActiveTab('shop');
            setRefreshKey(prev => prev + 1);
          }}
          className={`text-xl font-black uppercase border-4 border-black px-8 py-3 rounded-xl shadow-[6px_6px_0px_0px_#000] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none 
            ${activeTab === 'shop' ? 'bg-[#a855f7] text-white -translate-y-1' : 'bg-white hover:bg-gray-100'}`}
        >
          🛒 Armurerie
        </button>
        <button 
          onClick={() => {
            setActiveTab('inventory');
            setRefreshKey(prev => prev + 1);
          }}
          className={`text-xl font-black uppercase border-4 border-black px-8 py-3 rounded-xl shadow-[6px_6px_0px_0px_#000] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none 
            ${activeTab === 'inventory' ? 'bg-[#ffde4d] text-black -translate-y-1' : 'bg-white hover:bg-gray-100'}`}
        >
          🎒 Sac à dos
        </button>
        <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* L'encart joueur */}
        <div className="flex items-center gap-4 bg-[#ffde4d] border-4 border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_#000]">
          <div className="bg-white border-2 border-black font-black px-3 py-1 rounded-md text-sm uppercase">
            👤 {pseudo}
          </div>
          <div className="font-black text-lg">
            💰 Solde : <span className="underline decoration-2">{solde}</span> PC
          </div>  
        </div>

        {/* Le bouton Déconnexion */}
        <button 
          onClick={handleLogout}
          className="bg-white border-4 border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all hover:bg-gray-100"
          title="Se déconnecter"
        >
          🚪
        </button>
      </div>
      </div>

      {/* --- CONTENU DES ONGLETS --- */}
      <main className="px-10 mx-auto">
        {activeTab === 'map' && <Map key={`map-${refreshKey}`} />}
        {activeTab === 'shop' && <HubBoutique key={`shop-${refreshKey}`} items={items} handleBuyItem={handleBuyItem} />}
        {activeTab === 'inventory' && <Inventaire key={`inv-${refreshKey}`} handleLogout={handleLogout}/>}
      </main>
    </div>
  )
}