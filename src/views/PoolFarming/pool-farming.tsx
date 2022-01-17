import "./pool-farming.scss";
import { useEffect, useState } from "react";
import { abi as farmingAggregatorAbi } from "../../abi/farmingAggregatorContract.json";
import { abi as hugsPoolAbi } from "../../abi/farmingHugsPoolContract.json";
import { abi as stakingRewardsAbi } from "../../abi/farmingStakingRewardsContract.json";
import { BigNumber, ethers, utils } from "ethers";
import { addresses } from "src/constants";
import { JsonRpcProvider, JsonRpcSigner } from "@ethersproject/providers";
import { Button, FormControl, InputAdornment, InputLabel, OutlinedInput } from "@material-ui/core";
import { useWeb3Context } from "src/hooks/web3Context";

interface StakingRewardsInfo {
  balance: BigNumber;
}

interface HugsPoolInfo {
  balance: BigNumber;
  allowance: BigNumber;
  virtualPrice: BigNumber;
}

interface HugsPoolContract {
  balanceOf: (address: string) => BigNumber;
  allowance: (address1: string, address2: string) => BigNumber;
  approve: (spender: string, value: BigNumber) => void;
  get_virtual_price: () => BigNumber;
}

interface StakingRewardsContract {
  balanceOf: (address: string) => BigNumber;
  stake: (amount: BigNumber) => void;
  withdraw: (amount: BigNumber) => void;
  getReward: () => void;
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
  _earnedRewardAmount: BigNumber;
}

export default function PoolFarming() {
  const [assetPrice, setAssetPrice] = useState<BigNumber>();
  const [stakingRewardsInfo, setStakingRewardsInfo] = useState<StakingRewardsInfo>();
  const [hugsPoolInfo, sethugsPoolInfo] = useState<HugsPoolInfo>();
  const [stakingInfo, setStakingInfo] = useState<StakingInfo>();
  const [quantity, setQuantity] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { provider, chainID, address } = useWeb3Context();

  const stakingGateway = new ethers.Contract(
    addresses[chainID].FARMING_AGGREGATOR_ADDRESS as string,
    farmingAggregatorAbi,
    provider
  );

  const stakingRewardsContract = new ethers.Contract(
    addresses[chainID].FARMINNG_STAKING_REWARDS_ADDRESS as string,
    stakingRewardsAbi,
    provider.getSigner(address)
  ) as unknown as StakingRewardsContract;

  function getInvestmentValue(): string {
    const virtualPrice = hugsPoolInfo!.virtualPrice;
    const balance = stakingRewardsInfo!.balance;
    console.log("balance: ", balance.toString());
    const value = (+ethers.utils.formatEther(virtualPrice.mul(balance).div(BigInt(1e18)))).toFixed(2);
    return value;
  }

  function getEarnedFTM(): string {
    const rewards = (+ethers.utils.formatEther(stakingInfo!._earnedRewardAmount)).toFixed(4);
    return rewards
  }

  function getEarnedUsd(): string {
    const earned = (+ethers.utils.formatUnits(stakingInfo!._earnedRewardAmount.mul(assetPrice!).div(BigInt(1e8)), "ether")).toFixed(2);
    return earned;
  }

  async function getAssetPrice(): Promise<void> {
    const assetPrice = await stakingGateway.assetPrice();
    setAssetPrice(assetPrice);
  }

  async function getStakingRewardsInfo(): Promise<void> {
    const balance = await stakingRewardsContract.balanceOf(address);
    setStakingRewardsInfo({ balance });
  }
  // console.log(stakingRewardsInfo);

  async function getHugsPoolInfo(): Promise<void> {
    const hugsPoolContract = new ethers.Contract(
      addresses[chainID].HUGS_POOL_ADDRESS as string,
      hugsPoolAbi,
      provider,
    ) as unknown as HugsPoolContract;
    let balance = await hugsPoolContract.balanceOf(address);
    let allowance = await hugsPoolContract.allowance(address, addresses[chainID].FARMINNG_STAKING_REWARDS_ADDRESS as string);
    let virtualPrice = await hugsPoolContract.get_virtual_price();
    sethugsPoolInfo({ balance, allowance, virtualPrice });
  }

  async function withdrawStaked(amount: BigNumber): Promise<void> {
    console.log("withdraw amount: ", amount);
    await stakingRewardsContract.withdraw(amount);
  }



  // console.log(hugsPoolInfo)

  async function getStakingInfo(): Promise<void> {
    setIsLoading(true);
    const farmingContract = new ethers.Contract(
      addresses[chainID].FARMING_AGGREGATOR_ADDRESS as string,
      farmingAggregatorAbi,
      provider,
    );
    console.log(provider);
    // let quant = BigNumber.from(quantity || 0).mul(BigInt(1e18));
    // let amt=BigInt(+quantity)*BigInt(1e18);
    let amt=BigInt(quantity === "" ? 0 : +quantity)*BigInt(1e18);
    console.log("quant: ", amt);
    setStakingInfo(await farmingContract.getStakingInfo(address, amt));
    setIsLoading(false);
  }

  useEffect(() => {
    if (chainID && provider && address) {
      console.log("address: ", address);
      getStakingInfo();
      getStakingRewardsInfo();
      getHugsPoolInfo();
      getAssetPrice();
    }
  }, [chainID, provider, address]);
  // console.log(stakingInfo);
  return (
    <>
      {stakingInfo && address && provider && (
        <div className="pool-farming">
          <div className="MuiPaper-root hec-card">
            <div>{(+ethers.utils.formatUnits(stakingInfo._apr, "mwei")).toFixed(2)}%</div>
            <div>${(+ethers.utils.formatEther(stakingInfo._tvl)).toFixed(2)}</div>
            <div>{new Date(+stakingInfo._begin * 1000).toString()}</div>
            <div>{new Date(+stakingInfo._finish * 1000).toString()}</div>
          </div>
          <div className="MuiPaper-root hec-card">
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
            <div> Withdraw to USDC: {(+ethers.utils.formatUnits(stakingInfo._usdcWithdrawAmount, "mwei")).toFixed(2)}</div>
            {hugsPoolInfo && stakingRewardsInfo ? (<>
              <div>Your LP Tokens: {(+ethers.utils.formatEther(hugsPoolInfo.balance)).toFixed(2)}</div>
              <div>
                Staked LP Tokens: {(+ethers.utils.formatEther(stakingRewardsInfo!.balance)).toFixed(2)}
                <Button
                  className="stake-button"
                  variant="contained"
                  color="primary"
                  disabled={isLoading}
                  onClick={() => withdrawStaked(stakingRewardsInfo!.balance)}
                >
                  Withdraw
                </Button>
              </div>
              <div>Investment Value: {getInvestmentValue()}</div>
              <div>Earned Rewards (FTM): {getEarnedFTM()}</div>
              <div>Earned Rewards (USD): {getEarnedUsd()}</div>
            </>) : (<></>)
            }
          </div>
        </div>
      )}
    </>
  );
}
