import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import GlobalInfo from "src/components/investments/global-info/global-info";
import LatestTransactions from "src/components/investments/latest-transactions/latest-transactions";
import { loadTreasuryInvestments } from "src/slices/AppSlice";
import { RootState } from "src/store";
import "./investments.scss";

export default function Investments() {
  const dispatch = useDispatch();
  const { transactions } = useSelector((state: RootState) => state.app.allInvestments);
  const isLoading = useSelector((state: RootState) => state.app.isLoadingInvestments);

  useEffect(() => {
    dispatch(loadTreasuryInvestments());
  }, []);

  return (
    <div className="investment-dash">
      <div className="general-investments">
        <GlobalInfo isLoading={isLoading} transactions={transactions} />
      </div>
      <div className="detailed-investments">
        {transactions && <LatestTransactions isLoading={isLoading} transactions={transactions} />}
      </div>
    </div>
  );
}
