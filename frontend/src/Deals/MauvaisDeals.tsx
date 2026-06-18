import BaseDeals from "./BaseDeals";

export default function MauvaisDeals({ deals, handleBuyDeal }: { deals: any[]; handleBuyDeal: (itemId: number) => void }) {
    deals = [{id:1,nom:"epee",description:"olala la super épée tah les fous",prix:200,target_item:"stopPluie",custom_model_data:0,categorie:"evenementPositif"},
        {id:1,nom:"epee",description:"olala la super épée tah les fous",prix:200,target_item:"leather_chestplate",custom_model_data:1,categorie:"evenementPositif"},
        {id:1,nom:"epee",description:"olala la super épée tah les fous",prix:200,target_item:"diamond_helmet",custom_model_data:1,categorie:"evenementPositif"},
        {id:1,nom:"epee",description:"olala la super épée tah les fous",prix:200,target_item:"diamond_boots",custom_model_data:1,categorie:"evenementPositif"},
        {id:1,nom:"epee",description:"olala la super épée tah les fous",prix:200,target_item:"diamond_leggings",custom_model_data:1,categorie:"evenementPositif"},
        {id:1,nom:"epee",description:"olala la super épée tah les fous",prix:200,target_item:"elytra",custom_model_data:1,categorie:"evenementPositif"}
    ];
    
    return (<BaseDeals deals={deals} handleBuyDeal={handleBuyDeal} />)
}