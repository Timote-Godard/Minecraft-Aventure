import { useState } from "react";
import ArmesBoutique from "./ArmesBoutique"
import ArmureBoutique from "./ArmureBoutique"
import OutilsBoutique from "./OutilsBoutique"
import SapologieBoutique from "./SapologieBoutique"


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


interface HubBoutiqueProps {
  items: ShopItem[];
  handleBuyItem: (itemId: number) => void;
}




export default function HubBoutique({ handleBuyItem, items }: HubBoutiqueProps) {

     const [sousMenu, setSousMenu] = useState('hub');

     const itemsArmurerie = items.filter(item => ['casque', 'plastron', 'pantalon', 'bottes', 'elytre'].includes(item.categorie));
    const itemsCombat = items.filter(item => ['epee', 'arc', 'arbalete', 'bouclier'].includes(item.categorie));
    const itemsOutils = items.filter(item => ['pioche', 'hache', 'pelle', 'houe'].includes(item.categorie));
    const itemsStyle = items.filter(item => ['cosmetiques', 'chapeau', 'cosmetique'].includes(item.categorie));

    const styleDiv = "relative border-2 border-black h-180 w-full rounded-sm bottom-0 cursor-pointer overflow-hidden";
    const styleImg = "w-full h-full object-cover hover:scale-105 transition-transform duration-300"
    const styleTitre = "absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 transition-transform duration-300"

    // 🪄 Fonction magique pour transformer "minecraft:wooden_sword" en "wooden-sword"
    const getImagePath = (targetItem: string, modelData: number) => {
        if (!targetItem) return '/images/default.png'; // Sécurité
        const folderName = targetItem.replace('minecraft:', '').replace(/_/g, '-');
        return `/images/${folderName}/${modelData}.png`;
    };

    return (

        <div className="flex gap-5   justify-center">
            {sousMenu === 'hub' && ( 
                <>
                {/* Shop des armures : l'armurie */}
                <div 
                    className={styleDiv}
                    onClick={() => setSousMenu('armurie')}
                >
                    <img className={styleImg} src="images/boutique/armure.png" alt="armurie"/>
                    <img className={styleTitre} src="images/boutique/armurieTitre.png" alt="TitreStyleMinecraft"/>
                </div>

                {/* Shop des épées, arcs, arbalètes : le combat */}
                <div 
                    className={styleDiv}
                    onClick={() => setSousMenu('combat')}
                >
                    <img className={styleImg} src="images/boutique/combat.png" alt="combat"/>
                    <img className={styleTitre} src="images/boutique/combatTitre.png" alt="TitreStyleMinecraft"/>
                </div>

                {/* Shop des outils : le travail */}
                <div 
                    className={styleDiv}
                    onClick={() => setSousMenu('outils')}
                >
                    <img className={styleImg} src="images/boutique/farm.png" alt="outils"/>
                    <img className={styleTitre} src="images/boutique/outilsTitre.png" alt="TitreStyleMinecraft"/>
                </div>

                {/* Shop des cosmétiques : le style */}
                <div 
                    className={styleDiv}
                    onClick={() => setSousMenu('style')}
                >
                    <img className={styleImg} src="images/boutique/costard.png" alt="style"/>
                    <img className={styleTitre}  src="images/boutique/cosmetiquesTitre.png" alt="TitreStyleMinecraft"/>
                </div>  
            </>
            )}

            {sousMenu === 'armurie' && <ArmureBoutique getImagePath={getImagePath} items={itemsArmurerie} handleBuyItem={handleBuyItem} />}
            {sousMenu === 'combat' && <ArmesBoutique getImagePath={getImagePath} items={itemsCombat} handleBuyItem={handleBuyItem} />}
            {sousMenu === 'outils' && <OutilsBoutique getImagePath={getImagePath} items={itemsOutils} handleBuyItem={handleBuyItem} />}
            {sousMenu === 'style' && <SapologieBoutique getImagePath={getImagePath} items={itemsStyle} handleBuyItem={handleBuyItem} />}
            
        </div>
    )
}