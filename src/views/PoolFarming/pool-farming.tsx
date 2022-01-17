import "./pool-farming.scss";
import { useEffect, useState } from "react";
import { abi as farmingAggregatorAbi } from "../../abi/farmingAggregatorContract.json";
import { BigNumber, ethers, utils } from "ethers";
import { addresses } from "src/constants";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Button, FormControl, InputAdornment, InputLabel, OutlinedInput } from "@material-ui/core";

interface FarmingProps {
  chainID: number;
  provider: JsonRpcProvider;
  address: string;
}

interface StakingInfo {
  _apr: BigNumber;
  _tvl: BigNumber;
  _begin: BigNumber;
  _finish: BigNumber;
  _hugsWithdrawAmount: BigNumber;
  _daiWithdrawAmount: BigNumber;
  _usdcWithdrawAmount: BigNumber;
  _optimalHugsAmount: BigNumber;
  _optimalDaiAmount: BigNumber;
  _optimalUsdcAmount: BigNumber;
}

export default function PoolFarming({ chainID, provider, address }: FarmingProps) {
  const [stakingInfo, setStakingInfo] = useState<StakingInfo>();
  const [quantity, setQuantity] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function getStakingInfo() {
    setIsLoading(true);
    const farmingContract = new ethers.Contract(
      addresses[chainID].FARMING_AGGREGATOR_ADDRESS as string,
      farmingAggregatorAbi,
      provider,
    );
    setStakingInfo(await farmingContract.getStakingInfo(address, BigNumber.from(quantity || 0).mul(BigInt(1e18))));
    setIsLoading(false);
  }

  useEffect(() => {
    if (chainID && provider && address) {
      getStakingInfo();
    }
  }, [chainID, provider, address]);
  console.log(stakingInfo);
  return (
    <>
      {stakingInfo && (
        <div className="pool-farming">
          <div className="MuiPaper-root hec-card">
            <div>{(+ethers.utils.formatUnits(stakingInfo._apr, "mwei")).toFixed(2)}%</div>
            <div>${(+ethers.utils.formatEther(stakingInfo._tvl)).toFixed(2)}</div>
            <div>{new Date(+stakingInfo._begin * 1000).toString()}</div>
            <div>{new Date(+stakingInfo._finish * 1000).toString()}</div>
          </div>
          <div className="MuiPaper-root hec-card">
            <div className="title">Investment plan estimation</div>
            <FormControl fullWidth variant="outlined">
              <InputLabel htmlFor="outlined-adornment-amount">Amount</InputLabel>
              <OutlinedInput
                id="outlined-adornment-amount"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                startAdornment={<InputAdornment position="start">$</InputAdornment>}
                labelWidth={60}
              />
            </FormControl>

            <Button
              className="stake-button"
              variant="contained"
              color="primary"
              disabled={isLoading}
              onClick={() => getStakingInfo()}
            >
              Calculate
            </Button>
            <div>Optimal Hugs: {(+ethers.utils.formatEther(stakingInfo._optimalHugsAmount)).toFixed(2)}</div>
            <div>Optimal DAI: {(+ethers.utils.formatEther(stakingInfo._optimalDaiAmount)).toFixed(2)}</div>
            <div>Optimal USDC: {(+ethers.utils.formatEther(stakingInfo._optimalUsdcAmount)).toFixed(2)}</div>
          </div>
          <div className="MuiPaper-root hec-card">
            <div>Withdraw to Hugs: {(+ethers.utils.formatEther(stakingInfo._hugsWithdrawAmount)).toFixed(2)}</div>
            <div>Withdraw to DAI: {(+ethers.utils.formatEther(stakingInfo._daiWithdrawAmount)).toFixed(2)}</div>
            <div>
              Withdraw to USDC: {(+ethers.utils.formatUnits(stakingInfo._usdcWithdrawAmount, "mwei")).toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
