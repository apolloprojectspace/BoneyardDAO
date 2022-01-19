import "./pool-farming.scss";
import { useCallback, useEffect, useState } from "react";
import { abi as farmingAggregatorAbi } from "../../abi/farmingAggregatorContract.json";
import { abi as hugsPoolAbi } from "../../abi/farmingHugsPoolContract.json";
import { abi as stakingRewardsAbi } from "../../abi/farmingStakingRewardsContract.json";
import { BigNumber, ethers, utils } from "ethers";
import { addresses, messages } from "src/constants";
import { Button, FormControl, InputAdornment, InputLabel, Link, OutlinedInput, SvgIcon } from "@material-ui/core";
import { useWeb3Context } from "src/hooks/web3Context";
import { useDispatch } from "react-redux";
import { error, info, success } from "src/slices/MessagesSlice";
import { sleep } from "src/helpers/Sleep";
import useTheme from "src/hooks/useTheme";
import ProjectionLineChart from "src/components/pool-farming/line-chart/line-chart";
import { ReactComponent as wshecTokenImg } from "../../assets/tokens/wsHEC.svg";

interface StakingRewardsInfo {
  balance: number;
  originalBalance: BigNumber;
}

interface HugsPoolInfo {
  balance: number;
  allowance: number;
  virtualPrice: number;
  originalBalance: BigNumber;
}

interface HugsPoolContract {
  balanceOf: (address: string) => BigNumber;
  allowance: (address1: string, address2: string) => BigNumber;
  approve: (spender: string, value: string) => any;
  get_virtual_price: () => BigNumber;
}

interface StakingRewardsContract {
  balanceOf: (address: string) => BigNumber;
  stake: (amount: BigNumber) => any;
  withdraw: (amount: any) => any;
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

export default function PoolFarming({ theme }: any) {
  const [assetPrice, setAssetPrice] = useState<BigNumber>();
  const [stakingRewardsInfo, setStakingRewardsInfo] = useState<StakingRewardsInfo>();
  const [hugsPoolInfo, sethugsPoolInfo] = useState<HugsPoolInfo>();
  const [stakingInfo, setStakingInfo] = useState<StakingInfo>();
  const [quantity, setQuantity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  console.log(theme);

  const { provider, chainID, address } = useWeb3Context();

  const stakingGateway = new ethers.Contract(
    addresses[chainID].FARMING_AGGREGATOR_ADDRESS as string,
    farmingAggregatorAbi,
    provider,
  );

  const stakingRewardsContract = (new ethers.Contract(
    addresses[chainID].FARMINNG_STAKING_REWARDS_ADDRESS as string,
    stakingRewardsAbi,
    provider.getSigner(address),
  ) as unknown) as StakingRewardsContract;

  const hugsPoolContract = (new ethers.Contract(
    addresses[chainID].HUGS_POOL_ADDRESS as string,
    hugsPoolAbi,
    provider,
  ) as unknown) as HugsPoolContract;

  const hasAllowance = useCallback(() => {
    return hugsPoolInfo?.allowance < hugsPoolInfo?.balance;
  }, [hugsPoolInfo]);

  const hasLpBalance = useCallback(() => hugsPoolInfo?.balance > 0, [hugsPoolInfo]);

  const hasLoadedInfo = useCallback(() => stakingInfo && assetPrice?.toNumber(), [stakingInfo, assetPrice]);

  function getEarnedFTM(): string {
    const rewards = (+ethers.utils.formatEther(stakingInfo?._earnedRewardAmount)).toFixed(4);
    return rewards;
  }

  function getEarnedUsd(): string {
    const earnedUSD = +ethers.utils.formatEther(stakingInfo?._earnedRewardAmount);
    const assetPriceUSD = assetPrice.toNumber() / 1e8;
    return (earnedUSD * assetPriceUSD).toFixed(2);
  }

  const withDrawStaked = async (): Promise<void> => {
    try {
      setIsLoading(true);

      const withdrawTrans = await stakingRewardsContract.withdraw(stakingRewardsInfo?.originalBalance);
      await withdrawTrans.wait();
      dispatch(success(messages.tx_successfully_send));
      await sleep(10);
      dispatch(info(messages.account_update));
      await sleep(10);
      getAllData();
    } catch (e) {
      dispatch(error("Failed to withdraw"));
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const approve = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const approveTrans = await hugsPoolContract.approve(
        addresses[chainID].FARMINNG_STAKING_REWARDS_ADDRESS as string,
        "1000000000000000000000000",
      );
      await approveTrans.wait();
      dispatch(success(messages.tx_successfully_send));
      await sleep(10);
      dispatch(info(messages.account_update));
      await sleep(10);
      getAllData();
    } catch (e) {
      dispatch(error("Failed to approve"));
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  const stake = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const stakeTrans = await stakingRewardsContract.stake(hugsPoolInfo.originalBalance);
      await stakeTrans.wait();
      dispatch(success(messages.tx_successfully_send));
      await sleep(10);
      dispatch(info(messages.account_update));
      await sleep(10);
      getAllData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  async function getAssetPrice(): Promise<void> {
    try {
      const assetPrice = (await stakingGateway.assetPrice()) as BigNumber;

      setAssetPrice(assetPrice);
    } catch (e) {
      console.error(e);
    }
  }

  async function getStakingRewardsInfo(): Promise<void> {
    try {
      const originalBalance = await stakingRewardsContract.balanceOf(address);
      const balance = +ethers.utils.formatEther(originalBalance);
      setStakingRewardsInfo({ balance, originalBalance });
    } catch (e) {
      console.error(e);
    }
  }

  async function getHugsPoolInfo(): Promise<void> {
    try {
      const originalBalance = await hugsPoolContract.balanceOf(address);
      let balance = +ethers.utils.formatEther(originalBalance);

      let allowance = +(await hugsPoolContract.allowance(
        address,
        addresses[chainID].FARMINNG_STAKING_REWARDS_ADDRESS as string,
      ));
      let virtualPrice = +ethers.utils.formatEther(await hugsPoolContract.get_virtual_price());

      sethugsPoolInfo({ balance, allowance, virtualPrice, originalBalance });
    } catch (e) {
      console.error(e);
    }
  }

  async function getStakingInfo(): Promise<void> {
    try {
      const farmingContract = new ethers.Contract(
        addresses[chainID].FARMING_AGGREGATOR_ADDRESS as string,
        farmingAggregatorAbi,
        provider,
      );

      const amt = BigInt(quantity === "" ? 0 : +quantity) * BigInt(1e18);
      const stakingInfo = await farmingContract.getStakingInfo(address, amt);
      setStakingInfo(stakingInfo);
    } catch (e) {
      console.error(e);
    }
  }

  function getAllData() {
    setIsLoading(true);

    getAssetPrice();
    getStakingInfo();
    getStakingRewardsInfo();
    getHugsPoolInfo();
    setIsLoading(false);
  }

  useEffect(() => {
    if (chainID && provider && address) {
      getAllData();
    }
  }, [chainID, provider, address]);
  return (
    <>
      {stakingInfo && address && provider && (
        <div className="pool-farming">
          <div className="farming-account">
            <div className="MuiPaper-root hec-card farming">
              <div className="farming-stats">
                <div className="header">
                  <div className="d-grid">
                    <div className="title">TOR Farming</div>
                    <Link target="_blank" href="https://ftm.curve.fi/factory/50/deposit">
                      Get LP Tokens
                    </Link>
                  </div>
                  <SvgIcon component={wshecTokenImg} viewBox="0 0 100 100" style={{ height: "50px", width: "50px" }} />
                </div>
                <div className="info">
                  <div className="title">Apr:</div>
                  <div className={theme.palette.text?.gold + " data"}>
                    {(+ethers.utils.formatUnits(stakingInfo._apr, "mwei")).toFixed(2)}%
                  </div>
                  <div className="title">TVL:</div>
                  <div className="data">${(+ethers.utils.formatEther(stakingInfo._tvl)).toFixed(2)}</div>
                  <div className="title">Cycle Beginning:</div>
                  <div className="data">{new Date(+stakingInfo._begin * 1000).toString()}</div>
                  <div className="title">Cycle End:</div>
                  <div className="data">{new Date(+stakingInfo._finish * 1000).toString()}</div>
                </div>
              </div>
            </div>
            <div className="MuiPaper-root hec-card account">
              <div className="title">Earned Rewards</div>
              <div className="balance">
                {hasLoadedInfo() && (
                  <>
                    {hugsPoolInfo && <div className="data">Your LP Tokens: {hugsPoolInfo.balance.toFixed(2)}</div>}
                    <div className="data">
                      Investment Value: {(stakingRewardsInfo?.balance * hugsPoolInfo?.virtualPrice).toFixed(2)}
                    </div>
                    <div className="data">(FTM): {getEarnedFTM()}</div>
                    <div className="data">(USD): ${getEarnedUsd()}</div>
                    <div className="data">Staked LP Tokens: {stakingRewardsInfo?.balance.toFixed(2)}</div>
                  </>
                )}
              </div>
              <div className="actions">
                {hasLpBalance() && (
                  <Button
                    className="stake-button"
                    variant="contained"
                    color="primary"
                    disabled={isLoading}
                    onClick={() => stake()}
                  >
                    Stake
                  </Button>
                )}
                {hasAllowance() && (
                  <Button
                    className="stake-button"
                    variant="contained"
                    color="primary"
                    disabled={isLoading}
                    onClick={() => approve()}
                  >
                    Approve
                  </Button>
                )}
                {stakingRewardsInfo?.balance > 0 && (
                  <>
                    <Button
                      className="stake-button"
                      variant="contained"
                      color="primary"
                      disabled={isLoading}
                      onClick={() => withDrawStaked()}
                    >
                      Withdraw
                    </Button>
                  </>
                )}

                <div className="withdraw-amounts">
                  <div>Withdraw to Hugs: {(+ethers.utils.formatEther(stakingInfo._hugsWithdrawAmount)).toFixed(2)}</div>
                  <div>Withdraw to DAI: {(+ethers.utils.formatEther(stakingInfo._daiWithdrawAmount)).toFixed(2)}</div>
                  <div>
                    Withdraw to USDC: {(+ethers.utils.formatUnits(stakingInfo._usdcWithdrawAmount, "mwei")).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="MuiPaper-root hec-card projection">
            <div className="investment-plan">
              <div className="title">Investment Estimation Plan</div>
              <div className="calculate">
                <FormControl fullWidth variant="outlined">
                  <InputLabel htmlFor="outlined-adornment-amount">Amount</InputLabel>
                  <OutlinedInput
                    id="outlined-adornment-amount"
                    type="number"
                    value={quantity}
                    onKeyPress={event => {
                      if (!/[0-9]/.test(event.key)) {
                        event.preventDefault();
                      }
                    }}
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
              </div>
              <div className="optimal-amount">
                <div className="title">Optimal Amounts</div>
                <div>Hugs: {(+ethers.utils.formatEther(stakingInfo._optimalHugsAmount)).toFixed(2)}</div>
                <div>DAI: {(+ethers.utils.formatEther(stakingInfo._optimalDaiAmount)).toFixed(2)}</div>
                <div>USDC: {(+ethers.utils.formatEther(stakingInfo._optimalUsdcAmount)).toFixed(2)}</div>
              </div>
            </div>
            <ProjectionLineChart />
          </div>
        </div>
      )}
    </>
  );
}
