interface BoutiqueProps {
  handleBuySword: () => void;
}

export default function Boutique({ handleBuySword }: BoutiqueProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
    );
}