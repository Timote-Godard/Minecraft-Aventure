import { useState } from 'react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ton appel à l'API Node.js
    const res = await fetch('https://api-minecraft.timote.ovh/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await res.json();
    if (res.ok) {
      alert('Connexion réussie !');
      // Rediriger vers App.tsx ou changer le state pour afficher le panel
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f0] flex items-center justify-center p-6 font-sans">
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
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-3 border-4 border-black rounded-xl text-lg outline-none focus:bg-blue-50 transition-colors shadow-[inset_2px_2px_0px_rgba(0,0,0,0.1)]"
          required 
        />
        
        <input 
          type="password" 
          placeholder="Mot de passe" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-3 border-4 border-black rounded-xl text-lg outline-none focus:bg-blue-50 transition-colors shadow-[inset_2px_2px_0px_rgba(0,0,0,0.1)]"
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