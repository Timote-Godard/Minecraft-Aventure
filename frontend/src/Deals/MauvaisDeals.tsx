import BaseDeals from "./BaseDeals";

export default function MauvaisDeals({ deals, handleBuyDeal }: { deals: any[]; handleBuyDeal: (itemId: number) => void }) {
    
    return (<BaseDeals deals={deals} handleBuyDeal={handleBuyDeal} />)
}