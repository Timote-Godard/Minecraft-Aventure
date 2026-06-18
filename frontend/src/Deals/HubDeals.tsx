import { useState } from "react";
import BonDeals from "./BonDeals";
import MauvaisDeals from "./MauvaisDeals";


export default function HubDeals({ deals, handleBuyDeal }: { deals: any[]; handleBuyDeal: (itemId: number) => void }) {
    const [sousMenu, setSousMenu] = useState('hub');

    const styleDiv = "group relative border-2 border-black h-180 w-full rounded-sm bottom-0 cursor-pointer overflow-hidden";
    
    const styleImg = "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300";
    
    const styleTitre = "absolute bottom-0 left-1/2 transform -translate-x-1/2 z-10 px-30 transition-transform duration-300";

    return (
        <div className="flex gap-5 justify-center">
                    {sousMenu === 'hub' && ( 
                        <>
                        {/* Shop des armures : l'armurie */}
                        <div 
                            className={styleDiv}
                            onClick={() => setSousMenu('bon')}
                        >
                            <img className={styleImg} src="images/deals/bon.jpg" alt="armurie"/>
                            <img className={styleTitre} src="images/deals/bonTitre.png" alt="TitreStyleMinecraft"/>
                        </div>
        
                        {/* Shop des épées, arcs, arbalètes : le combat */}
                        <div 
                            className={styleDiv}
                            onClick={() => setSousMenu('mauvais')}
                        >
                            <img className={styleImg} src="images/deals/mal.jpg" alt="combat"/>
                            <img className={styleTitre} src="images/deals/malTitre.png" alt="TitreStyleMinecraft"/>
                        </div>
        
                    </>
                    )}
        
                    {sousMenu === 'bon' && <BonDeals deals={deals} handleBuyDeal={handleBuyDeal} />}
                    {sousMenu === 'mauvais' && <MauvaisDeals deals={deals} handleBuyDeal={handleBuyDeal} />}
                    
                </div>
    )
}