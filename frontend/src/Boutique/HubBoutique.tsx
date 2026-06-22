import { useState } from "react";
import ArmesBoutique from "./ArmesBoutique"
import ArmureBoutique from "./ArmureBoutique"
import OutilsBoutique from "./OutilsBoutique"
import SapologieBoutique from "./SapologieBoutique"
import type { InventoryItem } from "./types";


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
  itemsInventory: InventoryItem[];
}




export default function HubBoutique({ handleBuyItem, items, itemsInventory }: HubBoutiqueProps) {

     const [sousMenu, setSousMenu] = useState('hub');

     const itemsArmurerie = items.filter(item => ['casque', 'plastron', 'pantalon', 'bottes', 'elytre'].includes(item.categorie));
    const itemsCombat = items.filter(item => ['epee', 'arc', 'arbalete', 'bouclier'].includes(item.categorie));
    const itemsOutils = items.filter(item => ['pioche', 'hache', 'pelle', 'houe'].includes(item.categorie));
    const itemsStyle = items.filter(item => item.categorie === 'cosmetique');

    const styleDiv = "group relative border-2 border-black h-180 w-full rounded-sm bottom-0 cursor-pointer overflow-hidden";
    const styleImg = "w-100 h-full object-cover group-hover:scale-105 transition-transform duration-300"
    const styleTitre = "absolute bottom-4 w-100 h-30 left-1/2 transform -translate-x-1/2 z-10 transition-transform duration-300"

    // 🪄 Fonction magique pour transformer "minecraft:wooden_sword" en "wooden-sword"
    const getImagePath = (targetItem: string, modelData: number) => {
        if (!targetItem) return '/images/default.png'; // Sécurité
        if (targetItem === 'carved_pumpkin') return `/images/skins/cosmetiques/${modelData}.webp`; // Cas spécial pour la citrouille sculptée
        const folderName = targetItem.replace('minecraft:', '').replace('cosmetic:', '').replace(/_/g, '/');
        return `/images/skins/${folderName}/${modelData}.webp`;
    };

    return (

        <div className="flex gap-5 justify-center">
            {sousMenu === 'hub' && ( 
                <>
                {/* Shop des armures : l'armurie */}
                <div 
                    className={styleDiv}
                    onClick={() => setSousMenu('armurie')}
                >
                    <img className={styleImg} src="images/boutique/armure.webp" alt="armurie"/>
                    <img className={styleTitre} src="images/boutique/armurieTitre.webp" alt="TitreStyleMinecraft"/>
                </div>

                {/* Shop des épées, arcs, arbalètes : le combat */}
                <div 
                    className={styleDiv}
                    onClick={() => setSousMenu('combat')}
                >
                    <img className={styleImg} src="images/boutique/combat.webp" alt="combat"/>
                    <img className={styleTitre} src="images/boutique/combatTitre.webp" alt="TitreStyleMinecraft"/>
                </div>

                {/* Shop des outils : le travail */}
                <div 
                    className={styleDiv}
                    onClick={() => setSousMenu('outils')}
                >
                    <img className={styleImg} src="images/boutique/farm.webp" alt="outils"/>
                    <img className={styleTitre} src="images/boutique/outilsTitre.webp" alt="TitreStyleMinecraft"/>
                </div>

                {/* Shop des cosmétiques : le style */}
                <div 
                    className={styleDiv}
                    onClick={() => setSousMenu('style')}
                >
                    <img className={styleImg} src="images/boutique/costard.webp" alt="style"/>
                    <img className={styleTitre}  src="images/boutique/cosmetiquesTitre.webp " alt="TitreStyleMinecraft"/>
                </div>  
            </>
            )}

            {sousMenu === 'armurie' && <ArmureBoutique getImagePath={getImagePath} itemsInventory={itemsInventory} items={itemsArmurerie} handleBuyItem={handleBuyItem} />}
            {sousMenu === 'combat' && <ArmesBoutique getImagePath={getImagePath} itemsInventory={itemsInventory} items={itemsCombat} handleBuyItem={handleBuyItem} />}
            {sousMenu === 'outils' && <OutilsBoutique getImagePath={getImagePath} itemsInventory={itemsInventory} items={itemsOutils} handleBuyItem={handleBuyItem} />}
            {sousMenu === 'style' && <SapologieBoutique getImagePath={getImagePath} itemsInventory={itemsInventory} items={itemsStyle} handleBuyItem={handleBuyItem} />}
            
        </div>
    )
}