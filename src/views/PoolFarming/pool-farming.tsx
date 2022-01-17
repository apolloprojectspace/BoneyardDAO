import "./pool-farming.scss";
import { useEffect, useState } from "react";
import { abi as farmingAggregatorAbi } from "../../abi/farmingAggregatorContract.json";
import { BigNumber, ethers } from "ethers";
import { addresses } from "src/constants";
import { JsonRpcProvider } from "@ethersproject/providers";

interface FarmingProps {
  chainID: number;
  provider: JsonRpcProvider;
  address: string;
}

interface StakingInfo {
  _apr: BigNumber;
  _tvl: BigNumber;
}

export default function PoolFarming({ chainID, provider, address }: FarmingProps) {
  // Change Tabs
  const [tabValue, setTabValue] = useState(0);
  const [stakingInfo, setStakingInfo] = useState<StakingInfo>();

  async function getStakingInfo() {
    const farmingContract = new ethers.Contract(
      addresses[chainID].FARMING_AGGREGATOR_ADDRESS as string,
      farmingAggregatorAbi,
      provider,
    );
    setStakingInfo(await farmingContract.getStakingInfo(address, 5));
  }
  useEffect(() => {
    getStakingInfo();
  }, []);
  console.log(stakingInfo);
  return (
    <>
      {stakingInfo && (
        <div className="pool-farming">
          <div className="MuiPaper-root hec-card">
            <div>{(+ethers.utils.formatUnits(stakingInfo._apr, "mwei")).toFixed(2)}%</div>
            <div>${(+ethers.utils.formatEther(stakingInfo._tvl)).toFixed(2)}</div>
          </div>
          <div className="MuiPaper-root hec-card"></div>
          <div className="MuiPaper-root hec-card"></div>
        </div>
      )}
    </>
  );
}
