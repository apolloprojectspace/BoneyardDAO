import { ethers, BigNumber } from "ethers";
import { addresses, messages } from "../constants";
import { abi as ierc20Abi } from "../abi/IERC20.json";
import { abi as HectorStaking } from "../abi/HectorStakingv2.json";
import { abi as StakingHelper } from "../abi/StakingHelper.json";
import { clearPendingTxn, fetchPendingTxns, getStakingTypeText } from "./PendingTxnsSlice";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchAccountSuccess, loadAccountDetails } from "./AccountSlice";
import { error, info, success } from "./MessagesSlice";
import { IActionValueAsyncThunk, IChangeApprovalAsyncThunk, IJsonRPCError } from "./interfaces";
import { metamaskErrorWrap } from "src/helpers/MetamaskErrorWrap";
import { sleep } from "../helpers/Sleep"
import { setAll } from 'src/helpers';

interface IUAData {
  address: string;
  value: string;
  approved: boolean;
  txHash: string | null;
  type: string | null;
}

function alreadyApprovedToken(token: string, stakeAllowance: BigNumber, unstakeAllowance: BigNumber) {
  // set defaults
  let bigZero = BigNumber.from("0");
  let applicableAllowance = bigZero;

  // determine which allowance to check
  if (token === "hec") {
    applicableAllowance = stakeAllowance;
  } else if (token === "shec") {
    applicableAllowance = unstakeAllowance;
  }

  // check if allowance exists
  if (applicableAllowance.gt(bigZero)) return true;

  return false;
}

export const changeApproval = createAsyncThunk(
  "stake/changeApproval",
  async ({ token, provider, address, networkID }: IChangeApprovalAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const hecContract = new ethers.Contract(addresses[networkID].HEC_ADDRESS as string, ierc20Abi, signer);
    const shecContract = new ethers.Contract(addresses[networkID].SHEC_ADDRESS as string, ierc20Abi, signer);
    const oldshecContract = new ethers.Contract(addresses[networkID].OLD_SHEC_ADDRESS as string, ierc20Abi, signer);
    let approveTx;
    let stakeAllowance = await hecContract.allowance(address, addresses[networkID].STAKING_HELPER_ADDRESS);
    let unstakeAllowance = await shecContract.allowance(address, addresses[networkID].STAKING_ADDRESS);
    let oldunstakeAllowance = await oldshecContract.allowance(address, addresses[networkID].OLD_STAKING_ADDRESS);

    // return early if approval has already happened
    if (alreadyApprovedToken(token, stakeAllowance, unstakeAllowance)) {
      dispatch(info("Approval completed."));
      return dispatch(
        fetchAccountSuccess({
          staking: {
            hecStake: +stakeAllowance,
            hecUnstake: +unstakeAllowance,
            oldhecUnstake: +oldunstakeAllowance,
          },
        }),
      );
    }

    try {
      if (token === "hec") {
        // won't run if stakeAllowance > 0
        approveTx = await hecContract.approve(
          addresses[networkID].STAKING_HELPER_ADDRESS,
          ethers.utils.parseUnits("1000000000", "gwei").toString(),
        );
      } else if (token === "shec") {
        approveTx = await shecContract.approve(
          addresses[networkID].STAKING_ADDRESS,
          ethers.utils.parseUnits("1000000000", "gwei").toString(),
        );
      } else if (token === "oldshec") {
        approveTx = await oldshecContract.approve(
          addresses[networkID].OLD_STAKING_ADDRESS,
          ethers.utils.parseUnits("1000000000", "gwei").toString(),
        );
      }

      const text = "Approve " + (token === "hec" ? "Staking" : "Unstaking");
      const pendingTxnType = token === "hec" ? "approve_staking" : "approve_unstaking";
      dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text, type: pendingTxnType }));

      await approveTx.wait();
      dispatch(success(messages.tx_successfully_send));
      await sleep(10);
    } catch (e: any) {
      ``
      // dispatch(error((e as IJsonRPCError).message));
      return metamaskErrorWrap(e, dispatch);
    } finally {
      if (approveTx) {
        dispatch(info(messages.account_update));
        await sleep(10);

        // go get fresh allowances
        stakeAllowance = await hecContract.allowance(address, addresses[networkID].STAKING_HELPER_ADDRESS);
        unstakeAllowance = await shecContract.allowance(address, addresses[networkID].STAKING_ADDRESS);
        oldunstakeAllowance = await shecContract.allowance(address, addresses[networkID].OLD_STAKING_ADDRESS);

        dispatch(clearPendingTxn(approveTx.hash));
        return dispatch(
          fetchAccountSuccess({
            staking: {
              hecStake: +stakeAllowance,
              hecUnstake: +unstakeAllowance,
              oldhecUnstake: +oldunstakeAllowance,
            },
          }),
        );
      }
    }
  },
);

export const changeStake = createAsyncThunk(
  "stake/changeStake",
  async ({ action, value, provider, address, networkID, callback, isOld }: IActionValueAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    let staking, stakingHelper;
    if (isOld) {
      staking = new ethers.Contract(addresses[networkID].OLD_STAKING_ADDRESS as string, HectorStaking, signer);
      stakingHelper = new ethers.Contract(
        addresses[networkID].OLD_STAKING_HELPER_ADDRESS as string,
        StakingHelper,
        signer,
      );
    } else {
      staking = new ethers.Contract(addresses[networkID].STAKING_ADDRESS as string, HectorStaking, signer);
      stakingHelper = new ethers.Contract(addresses[networkID].STAKING_HELPER_ADDRESS as string, StakingHelper, signer);
    }

    let stakeTx;
    let uaData: IUAData = {
      address: address,
      value: value,
      approved: true,
      txHash: null,
      type: null,
    };

    try {
      if (action === "stake") {
        uaData.type = "stake";
        stakeTx = await stakingHelper.stake(ethers.utils.parseUnits(value, "gwei"), address);
      } else {
        uaData.type = "unstake";
        stakeTx = await staking.unstake(ethers.utils.parseUnits(value, "gwei"), true);
      }
      const pendingTxnType = action === "stake" ? "staking" : "unstaking";
      uaData.txHash = stakeTx.hash;
      dispatch(fetchPendingTxns({ txnHash: stakeTx.hash, text: getStakingTypeText(action), type: pendingTxnType }));
      callback?.();
      await stakeTx.wait();
      dispatch(success(messages.tx_successfully_send));
      await sleep(10);
    } catch (e: any) {
      return metamaskErrorWrap(e, dispatch);
    } finally {
      if (stakeTx) {
        dispatch(info(messages.your_balance_update_soon));
        await sleep(10);
        await dispatch(loadAccountDetails({ address, networkID, provider }));
        dispatch(clearPendingTxn(stakeTx.hash));
        dispatch(info(messages.your_balance_updated));
        return;
      }
    }
  },
);

export const changeForfeit = createAsyncThunk(
  "stake/forfeit",
  async ({ provider, address, networkID }: IActionValueAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const staking = new ethers.Contract(addresses[networkID].STAKING_ADDRESS as string, HectorStaking, signer);
    let forfeitTx;

    try {
      forfeitTx = await staking.forfeit();
      const text = "Forfeiting";
      const pendingTxnType = "forfeiting";
      dispatch(fetchPendingTxns({ txnHash: forfeitTx.hash, text, type: pendingTxnType }));
      await forfeitTx.wait();
      dispatch(success(messages.tx_successfully_send));
      await sleep(10);
    } catch (e: any) {
      return metamaskErrorWrap(e, dispatch);
    } finally {
      if (forfeitTx) {
        dispatch(info(messages.your_balance_update_soon));
        await sleep(10);
        await dispatch(loadAccountDetails({ address, networkID, provider }));
        dispatch(clearPendingTxn(forfeitTx.hash));
        dispatch(info(messages.your_balance_updated));
        return;
      }
    }
  },
);

export const changeClaim = createAsyncThunk(
  "stake/changeClaim",
  async ({ provider, address, networkID }: IActionValueAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const staking = new ethers.Contract(addresses[networkID].STAKING_ADDRESS as string, HectorStaking, signer);
    let claimTx;

    try {
      claimTx = await staking.claim(address);
      const text = "Claiming";
      const pendingTxnType = "claiming";
      dispatch(fetchPendingTxns({ txnHash: claimTx.hash, text, type: pendingTxnType }));
      await claimTx.wait();
      dispatch(success(messages.tx_successfully_send));
      await sleep(10);
    } catch (e: any) {
      return metamaskErrorWrap(e, dispatch);
    } finally {
      if (claimTx) {
        dispatch(info(messages.your_balance_update_soon));
        await sleep(15);
        await dispatch(loadAccountDetails({ address, networkID, provider }));
        dispatch(clearPendingTxn(claimTx.hash));
        dispatch(info(messages.your_balance_updated));
        return;
      }
    }
  },
);

export interface IStakeSlice {
  loading: boolean;
}

const initialState: IStakeSlice = {
  loading: false
}

const stakeSlice = createSlice({
  name: 'stake',
  initialState,
  reducers: {
    fetchStakeSuccess(state, action) {
      setAll(state, action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(changeStake.pending, state => {
        state.loading = true;
      })
      .addCase(changeStake.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(changeStake.rejected, (state, { error }) => {
        state.loading = false;
        console.error(error.message);
      })
      .addCase(changeApproval.pending, state => {
        state.loading = true;
      })
      .addCase(changeApproval.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(changeApproval.rejected, (state, { error }) => {
        state.loading = false;
        console.error(error.message);
      })
      .addCase(changeForfeit.pending, state => {
        state.loading = true;
      })
      .addCase(changeForfeit.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(changeForfeit.rejected, (state, { error }) => {
        state.loading = false;
        console.error(error.message);
      })
      .addCase(changeClaim.pending, state => {
        state.loading = true;
      })
      .addCase(changeClaim.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(changeClaim.rejected, (state, { error }) => {
        state.loading = false;
        console.error(error.message);
      })
  }
});

export default stakeSlice.reducer;

export const { fetchStakeSuccess } = stakeSlice.actions;

