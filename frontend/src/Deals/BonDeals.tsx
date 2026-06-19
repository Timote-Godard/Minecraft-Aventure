import BaseDeals from "./BaseDeals";

export default function BonDeals({ deals, handleBuyDeal }: { deals: any[]; handleBuyDeal: (itemId: number) => void }) {    
    return (<BaseDeals deals={deals} handleBuyDeal={handleBuyDeal} />)
}
