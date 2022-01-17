import { useEffect, useState } from "react";
import { Transaction } from "src/types/investments.model";
import "./global-info.scss";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import WhatshotIcon from "@material-ui/icons/Whatshot";
import SettingsBackupRestoreIcon from "@material-ui/icons/SettingsBackupRestore";
interface TransactionProps {
  transactions: Transaction[];
  isLoading: boolean;
}

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});

export default function GlobalInfo({ transactions, isLoading }: TransactionProps) {
  const [totalBuyBack, setBuyBack] = useState(0);
  const [totalBurned, setBurned] = useState(0);
  const [totalAssets, setTotalAssets] = useState(230631855);
  const data = [
    { amount: formatter.format(totalAssets), text: "Total Assets", logo: AccountBalanceIcon },
    { amount: formatter.format(totalBurned), text: "Total Burned", logo: WhatshotIcon },
    { amount: formatter.format(totalBuyBack), text: "Buyback Value", logo: SettingsBackupRestoreIcon },
  ];

  useEffect(() => {
    transactions
      .filter(trans => trans.type === "BuyBack-Burn")
      .forEach(trans => {
        trans.investments.tokenDetails.forEach(token => {
          if (token.burn) {
            const num = +token.burn.replace(/\,/g, "");
            setBurned(prev => prev + num);
          }
          if (token.buyBack) {
            const num = +token.buyBack.replace(/\,/g, "");
            setBuyBack(prev => prev + num);
          }
        });
      });
  }, [transactions.length > 0]);

  return (
    <div className="global-info MuiPaper-root hec-card">
      {data.map((info, i) => (
        <>
          <div key={i} className="treasury">
            <div className="text">{info.text}</div>
            <div className="amount">{info.amount}</div>
            <info.logo />
          </div>
          {i !== data.length - 1 && <div className="seperate"></div>}
        </>
      ))}
    </div>
  );
}
