import { useState } from 'react'
import Login from "./Login";
import Map from "./Map";
import Boutique from "./Boutique";
import Header from "./Header";

export default function App() {
  // --- ÉTATS D'AUTHENTIFICATION ---
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // --- ÉTATS DU DASHBOARD ---
  const [activeTab, setActiveTab] = useState('map')

  // --- INFORMATIONS DU JOUEUR
  const [selectedPlayerUuid, setSelectedPlayerUuid] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [solde, setSolde] = useState<number>(0);
  

  // --- FONCTION D'ACHAT ---
  const handleBuySword = () => {
    if (!selectedPlayerUuid) return;

    fetch('https://api-minecraft.timote.ovh/api/shop/buy-sword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uuid: selectedPlayerUuid })
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert("❌ " + data.error)
      } else {
        alert(`⚔️ Succès ! Une épée en diamant a été envoyée à ${data.pseudo} !`)
      }
    })
  }

  // =========================================================================
  // AFFICHAGE 1 : L'ÉCRAN DE CONNEXION (Si isLoggedIn est false)
  // =========================================================================
  if (!isLoggedIn) {
    return (
      <Login setIsLoggedIn={setIsLoggedIn} setSelectedPlayerUuid={setSelectedPlayerUuid} setPseudo={setPseudo} setSolde={setSolde}/>
    );
  }

  // =========================================================================
  // AFFICHAGE 2 : LE TABLEAU DE BORD (Si isLoggedIn est true)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#f4f4f0] p-6 md:p-10 font-sans text-black">
      
      {/* --- EN-TÊTE DU SITE --- */}
      <Header solde={solde}  pseudo={pseudo} /> 

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
      </div>

      {/* --- CONTENU DES ONGLETS --- */}
      <main className="max-w-6xl mx-auto">
        {activeTab === 'map' ? (
          
          /* Onglet Carte 3D */
          <Map/>

        ) : (
          
          /* Onglet Boutique */
          <Boutique handleBuySword={handleBuySword} />

        )}
      </main>
    </div>
  )
}