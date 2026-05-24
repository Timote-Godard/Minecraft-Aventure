import { useState, useEffect } from 'react'
import Login from "./Login";  
import Map from "./Map";
import Boutique from "./Boutique";
import Header from "./Header";
import Inventaire from "./Inventaire";

export default function App() {
  // --- ÉTATS D'AUTHENTIFICATION ---
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // --- ÉTATS DU DASHBOARD ---
  const [activeTab, setActiveTab] = useState('map')

  // --- INFORMATIONS DU JOUEUR
  const [pseudo, setPseudo] = useState('')
  const [solde, setSolde] = useState<number>(0);
  
  // --- VÉRIFICATION DE LA SESSION AU CHARGEMENT ---
  useEffect(() => {
    // On regarde dans le coffre-fort
    const savedSession = localStorage.getItem('aventure_session');
    
    if (savedSession) {
      // Si on trouve un ticket, on le décode
      const userData = JSON.parse(savedSession);
      
      setPseudo(userData.pseudo);
      setSolde(userData.solde);
      setIsLoggedIn(true);
    }
  }, []);

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
      if (data.error) {
        alert("❌ " + data.error);
      } else {
        alert(`🛒 Succès ! Tu as débloqué : ${data.itemName} !`);
        setSolde(data.newSolde); // Le solde descend en direct !
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
      
      {/* --- EN-TÊTE DU SITE --- */}
      <Header solde={solde} pseudo={pseudo} handleLogout={handleLogout} />

      {/* --- BOUTONS DE NAVIGATION --- */}
      <div className="max-w-6xl mx-auto flex gap-6 mb-8">
        <button 
          onClick={() => setActiveTab('map')}
          className={`text-xl font-black uppercase border-4 border-black px-8 py-3 rounded-xl shadow-[6px_6px_0px_0px_#000] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none 
            ${activeTab === 'map' ? 'bg-[#4ade80] -translate-y-1' : 'bg-white hover:bg-gray-100'}`}
        >
          🗺️ BlueMap
        </button>
        <button 
          onClick={() => setActiveTab('shop')}
          className={`text-xl font-black uppercase border-4 border-black px-8 py-3 rounded-xl shadow-[6px_6px_0px_0px_#000] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none 
            ${activeTab === 'shop' ? 'bg-[#a855f7] text-white -translate-y-1' : 'bg-white hover:bg-gray-100'}`}
        >
          🛒 Armurerie
        </button>
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`text-xl font-black uppercase border-4 border-black px-8 py-3 rounded-xl shadow-[6px_6px_0px_0px_#000] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none 
            ${activeTab === 'inventory' ? 'bg-[#ffde4d] text-black -translate-y-1' : 'bg-white hover:bg-gray-100'}`}
        >
          🎒 Sac à dos
        </button>
      </div>

      {/* --- CONTENU DES ONGLETS --- */}
      <main className="max-w-6xl mx-auto">
        {activeTab === 'map' && <Map />}
        {activeTab === 'shop' && <Boutique handleBuyItem={handleBuyItem} />}
        {activeTab === 'inventory' && <Inventaire />}
      </main>
    </div>
  )
}