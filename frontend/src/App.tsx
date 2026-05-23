import { useState, useEffect } from 'react'

export default function App() {
  // Ce "state" permet à React de savoir quel onglet est actif
  const [activeTab, setActiveTab] = useState('map')
  const [playersList, setPlayersList] = useState<any[]>([])
  const [selectedPlayerUuid, setSelectedPlayerUuid] = useState('')

  // Trouver l'objet complet du joueur actuellement sélectionné
  const currentPlayer = playersList.find(p => p.uuid === selectedPlayerUuid)

  // Charger la liste des joueurs depuis la BDD SQLite au démarrage
  useEffect(() => {
    fetch('https://api-minecraft/api/players')
      .then(res => res.json())
      .then(data => {
        setPlayersList(data)
        if (data.length > 0) setSelectedPlayerUuid(data[0].uuid)
      })
  }, [activeTab]) // Recharge quand on change d'onglet pour actualiser les soldes

  const handleBuySword = () => {
    if (!selectedPlayerUuid) return;

    fetch('https://api-minecraft/api/shop/buy-sword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uuid: selectedPlayerUuid })
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(data.error)
      } else {
        alert(`⚔️ Succès ! Une épée en diamant a été envoyée à ${data.pseudo} !`)
        // Mettre à jour l'affichage du solde localement
        setPlayersList(prev => prev.map(p => p.uuid === selectedPlayerUuid ? { ...p, solde: data.newSolde } : p))
      }
    })
  }

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