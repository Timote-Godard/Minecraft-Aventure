interface HeaderProps {
  pseudo: string;
  solde: number;
}

export default function Header({ pseudo, solde }: HeaderProps) {
    return (
        <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 bg-[#ff6b6b] border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_#000] mb-10">
            <h1 className="text-3xl md:text-5xl font-black uppercase text-white drop-shadow-[2px_2px_0px_#000]">
            ⚔️ Aventure Panel
            </h1>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#ffde4d] border-4 border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_#000]">
            <div className="bg-white border-2 border-black font-black px-3 py-1 rounded-md text-sm uppercase">
                👤 {pseudo}
            </div>
            <div className="font-black text-lg">
                💰 Solde : <span className="underline decoration-2">{solde}</span> PC
            </div>
            </div>
      </header>
    )
}