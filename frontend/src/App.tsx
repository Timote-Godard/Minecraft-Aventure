import { useState, useEffect } from 'react'

export default function App() {
  // --- ÉTATS D'AUTHENTIFICATION ---
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // --- ÉTATS DU DASHBOARD ---
  const [activeTab, setActiveTab] = useState('map')
  const [playersList, setPlayersList] = useState<any[]>([])
  const [selectedPlayerUuid, setSelectedPlayerUuid] = useState('')

  // Trouver l'objet complet du joueur actuellement sélectionné
  const currentPlayer = playersList.find(p => p.uuid === selectedPlayerUuid)

  // Charger la liste des joueurs depuis la BDD au démarrage
  useEffect(() => {
    fetch('https://api-minecraft.timote.ovh/api/players')
      .then(res => res.json())
      .then(data => {
        // On vérifie que 'data' est bien un tableau avant de l'utiliser
        if (Array.isArray(data)) {
          setPlayersList(data)
          // if (data.length > 0) setSelectedPlayerUuid(data[0].uuid) // (Ligne commentée si tu as gardé la connexion)
        } else {
          console.error("Erreur reçue du serveur :", data)
          setPlayersList([]) // On force un tableau vide pour éviter le crash du .find()
        }
      })
      .catch(err => {
        console.error("Impossible de joindre l'API :", err)
        setPlayersList([])
      })
  }, [activeTab])

  // --- FONCTION DE CONNEXION ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('https://api-minecraft.timote.ovh/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setIsLoggedIn(true);
        // On sélectionne automatiquement le pseudo du joueur qui vient de se connecter
        const loggedUser = playersList.find(p => p.pseudo.toLowerCase() === loginUsername.toLowerCase());
        if (loggedUser) {
          setSelectedPlayerUuid(loggedUser.uuid);
        }
      } else {
        alert("❌ Erreur : " + data.error);
      }
    } catch (err) {
      alert("❌ Impossible de joindre le serveur d'authentification.");
    }
  };

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
        // Mettre à jour l'affichage du solde localement
        setPlayersList(prev => prev.map(p => p.uuid === selectedPlayerUuid ? { ...p, solde: data.newSolde } : p))
      }
    })
  }

  // =========================================================================
  // AFFICHAGE 1 : L'ÉCRAN DE CONNEXION (Si isLoggedIn est false)
  // =========================================================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f4f4f0] flex items-center justify-center p-6 font-sans text-black">
        <form 
          onSubmit={handleLogin}
          className="bg-white p-8 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_#000] -rotate-1 max-w-sm w-full flex flex-col gap-6"
        >
          <h2 className="text-3xl font-black text-center uppercase rotate-2 mb-2">
            Se Connecter
          </h2>
          
          <input 
            type="text" 
            placeholder="Pseudo Minecraft" 
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
            className="p-3 border-4 border-black rounded-xl text-lg outline-none focus:bg-blue-50 transition-colors shadow-[inset_2px_2px_0px_rgba(0,0,0,0.1)] font-bold"
            required 
          />
          
          <input 
            type="password" 
            placeholder="Mot de passe" 
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            className="p-3 border-4 border-black rounded-xl text-lg outline-none focus:bg-blue-50 transition-colors shadow-[inset_2px_2px_0px_rgba(0,0,0,0.1)] font-bold"
            required 
          />
          
          <button 
            type="submit"
            className="bg-[#ff6b6b] text-white p-4 font-black uppercase text-xl border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all mt-2"
          >
            JOUER ⚔️
          </button>
        </form>
      </div>
    );
  }

  // =========================================================================
  // AFFICHAGE 2 : LE TABLEAU DE BORD (Si isLoggedIn est true)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#f4f4f0] p-6 md:p-10 font-sans text-black">
      
      {/* --- EN-TÊTE DU SITE --- */}
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 bg-[#ff6b6b] border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_#000] mb-10">
        <h1 className="text-3xl md:text-5xl font-black uppercase text-white drop-shadow-[2px_2px_0px_#000]">
          ⚔️ Aventure Panel
        </h1>
        
        {/* Sélecteur de compte + Affichage Solde */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#ffde4d] border-4 border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_#000]">
          <select 
            value={selectedPlayerUuid} 
            onChange={(e) => setSelectedPlayerUuid(e.target.value)}
            className="bg-white border-2 border-black font-bold p-1 rounded-md text-sm cursor-pointer"
          >
            {playersList.map(p => (
              <option key={p.uuid} value={p.uuid}>{p.pseudo}</option>
            ))}
          </select>
          <div className="font-black text-lg">
            💰 Solde : <span className="underline decoration-2">{currentPlayer?.solde || 0}</span> PC
          </div>
        </div>
      </header>

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
          <div className="bg-white border-4 border-black rounded-2xl p-2 shadow-[8px_8px_0px_0px_#000] h-[65vh] relative overflow-hidden">
             {/* L'iframe est un espace réservé pour le moment */}
             <div className="w-full h-full bg-blue-50 border-2 border-dashed border-black rounded-xl flex items-center justify-center flex-col">
                <iframe className="w-full h-full" src='https://map.timote.ovh'></iframe>
             </div>
          </div>

        ) : (
          
          /* Onglet Boutique */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* CARTE ITEM : ÉPÉE EN DIAMANT */}
             <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-black uppercase mb-2">💎 Épée en Diamant Standard</h3>
                  <p className="text-gray-700 font-medium mb-6">L'incontournable. Une puissance brute livrée directement dans ton inventaire de jeu.</p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-black text-[#ff6b6b]">150 PC</span>
                  <button 
                    onClick={handleBuySword}
                    className="bg-[#ffde4d] font-black uppercase border-4 border-black px-6 py-2 rounded-xl shadow-[4px_4px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                  >
                    Acheter & Recevoir
                  </button>
                </div>
             </div>
          </div>

        )}
      </main>
    </div>
  )
}