// types.ts

export type TypeItem =
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

export interface ShopItem {
  id: number;
  nom: string;
  description: string;
  prix: number;
  target_item: string; 
  custom_model_data: number;
  categorie: TypeItem;
}

export interface InventoryItem {
  id: number;
  nom: string;
  description: string;
  target_item: string;
  custom_model_data: number;
  is_equipped: boolean | number;
}
