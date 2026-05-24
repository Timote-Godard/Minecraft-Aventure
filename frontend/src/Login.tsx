import { useState } from 'react';

interface LoginProps {
  setIsLoggedIn: (value: boolean) => void;
  setSelectedPlayerUuid: (uuid: string) => void;
  setPseudo: (pseudo: string) => void;
  setSolde: (solde: number) => void;
}

export default function Login({setIsLoggedIn,setSelectedPlayerUuid,setPseudo,setSolde} : LoginProps) {
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

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
        setSelectedPlayerUuid(data.uuid);
        setPseudo(data.pseudo);
        setSolde(data.solde);

        // 💾 On sauvegarde les infos ET le jeton de sécurité !
        localStorage.setItem('aventure_token', data.token);
        localStorage.setItem('aventure_session', JSON.stringify({
            uuid: data.uuid,
            pseudo: data.pseudo,
            solde: data.solde
        }));
        
      } else {
        alert("❌ Erreur : " + data.error);
      }
    } catch (err) {
      alert("❌ Impossible de joindre le serveur d'authentification.");
    }
  };

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