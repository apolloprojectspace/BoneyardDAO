import { ethers } from "ethers";
import { addresses } from "../constants";
import { abi as ierc20Abi } from "../abi/IERC20.json";
import { abi as sHECv2 } from "../abi/sHecv2.json";
import { abi as wsHEC } from "../abi/wsHec.json";
import { abi as HectorStakingv2 } from "../abi/HectorStakingv2.json";
import { setAll } from "../helpers";

import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { RootState } from "src/store";
import { IBaseAddressAsyncThunk, ICalcUserBondDetailsAsyncThunk } from "./interfaces";
import { getUserBondDetails, GetUserBondDetails } from 'src/helpers/bond-details.helper';

export const getBalances = createAsyncThunk(
  "account/getBalances",
  async ({ address, networkID, provider }: IBaseAddressAsyncThunk) => {
    const hecContract = new ethers.Contract(addresses[networkID].HEC_ADDRESS as string, ierc20Abi, provider);
    const hecBalance = await hecContract.balanceOf(address);
    const shecContract = new ethers.Contract(addresses[networkID].SHEC_ADDRESS as string, ierc20Abi, provider);
    const shecBalance = await shecContract.balanceOf(address);
    const wshecContract = new ethers.Contract(addresses[networkID].WSOHM_ADDRESS as string, wsHEC, provider);
    const wshecBalance = await wshecContract.balanceOf(address);
    const wshecAsShec = await wshecContract.wsHECTosHEC(wshecBalance);
    return {
      balances: {
        hec: ethers.utils.formatUnits(hecBalance, "gwei"),
        shec: ethers.utils.formatUnits(shecBalance, "gwei"),
        wshec: ethers.utils.formatEther(wshecBalance),
        wshecAsShec: ethers.utils.formatUnits(wshecAsShec, "gwei"),
      },
    };
  },
);

export const getUserBondData = createAsyncThunk(
  "account/getUserBondData",
  async ({ address, networkID, provider }: IBaseAddressAsyncThunk) => {
    return await getUserBondDetails(networkID, provider, address);
  },
);

export const loadAccountDetails = createAsyncThunk(
  "account/loadAccountDetails",
  async ({ networkID, provider, address }: IBaseAddressAsyncThunk, { dispatch }) => {
    let hecBalance = 0;
    let shecBalance = 0;
    let oldshecBalance = 0;
    let stakeAllowance = 0;
    let unstakeAllowance = 0;
    let oldunstakeAllowance = 0;
    let daiBondAllowance = 0;
    let depositAmount = 0;
    let warmUpAmount = 0;
    let expiry = 0;

    const daiContract = new ethers.Contract(addresses[networkID].DAI_ADDRESS as string, ierc20Abi, provider);
    const daiBalance = await daiContract.balanceOf(address);

    const hecContract = new ethers.Contract(addresses[networkID].HEC_ADDRESS as string, ierc20Abi, provider);
    hecBalance = await hecContract.balanceOf(address);
    stakeAllowance = await hecContract.allowance(address, addresses[networkID].STAKING_HELPER_ADDRESS);

    const shecContract = new ethers.Contract(addresses[networkID].SHEC_ADDRESS as string, sHECv2, provider);
    shecBalance = await shecContract.balanceOf(address);
    unstakeAllowance = await shecContract.allowance(address, addresses[networkID].STAKING_ADDRESS);
    const wrapAllowance = await shecContract.allowance(address, addresses[networkID].WSHEC_ADDRESS);

    const oldshecContract = new ethers.Contract(addresses[networkID].OLD_SHEC_ADDRESS as string, sHECv2, provider);
    oldshecBalance = await oldshecContract.balanceOf(address);
    oldunstakeAllowance = await oldshecContract.allowance(address, addresses[networkID].OLD_STAKING_ADDRESS);

    const wshecContract = new ethers.Contract(addresses[networkID].WSHEC_ADDRESS as string, wsHEC, provider);
    const unwrapAllowance = await wshecContract.allowance(address, addresses[networkID].WSHEC_ADDRESS);
    const wshecBalance = await wshecContract.balanceOf(address);

    const stakingContract = new ethers.Contract(addresses[networkID].STAKING_ADDRESS as string, HectorStakingv2, provider,);
    const warmupInfo = await stakingContract.warmupInfo(address);
    const balance = await shecContract.balanceForGons(warmupInfo.gons);
    depositAmount = warmupInfo.deposit;
    warmUpAmount = +ethers.utils.formatUnits(balance, "gwei");
    expiry = warmupInfo.expiry;

    return {
      balances: {
        dai: ethers.utils.formatEther(daiBalance),
        hec: ethers.utils.formatUnits(hecBalance, "gwei"),
        shec: ethers.utils.formatUnits(shecBalance, "gwei"),
        oldshec: ethers.utils.formatUnits(oldshecBalance, "gwei"),
        wshec: ethers.utils.formatEther(wshecBalance),
      },
      staking: {
        hecStake: +stakeAllowance,
        hecUnstake: +unstakeAllowance,
        oldhecUnstake: +oldunstakeAllowance,
      },
      wrapping: {
        hecWrap: +wrapAllowance,
        hecUnwrap: +unwrapAllowance,
      },
      warmup: {
        depositAmount: +ethers.utils.formatUnits(depositAmount, "gwei"),
        warmUpAmount,
        expiryBlock: expiry,
      },
      bonding: {
        daiAllowance: daiBondAllowance,
      },
    };
  },
);

export interface IUserBondDetails {
  allowance: number;
  interestDue: number;
  bondMaturationBlock: number;
  pendingPayout: string; //Payout formatted in gwei.
}
export const calculateUserBondDetails = createAsyncThunk(
  "account/calculateUserBondDetails",
  async ({ address, bond, networkID, provider }: ICalcUserBondDetailsAsyncThunk, { getState }) => {
    const { userBondData } = (getState() as RootState).account;
    if (!address) {
      return {
        bond: "",
        displayName: "",
        bondIconSvg: "",
        isLP: false,
        isFour: false,
        isOld: undefined,
        allowance: 0,
        balance: "0",
        interestDue: 0,
        bondMaturationBlock: 0,
        pendingPayout: "",
      };
    }
    // dispatch(fetchBondInProgress());

    // Calculate bond details.
    const bondData = userBondData!.find(userBond => bond.networkAddrs[networkID].bondAddress.toLowerCase() === userBond.Contract.toLowerCase());
    if (!bondData) {
      return;
    }
    const reserveContract = bond.getContractForReserve(networkID, provider);

    let interestDue, pendingPayout, bondMaturationBlock;

    const bondDetails = bondData!.Info;
    interestDue = +bondDetails.Payout / Math.pow(10, 9);
    bondMaturationBlock = +bondDetails.Vesting + +bondDetails.LastBlock;
    pendingPayout = bondData!.PendingPayout;

    let allowance,
      balance = 0;
    allowance = await reserveContract.allowance(address, bond.getAddressForBond(networkID));
    balance = await reserveContract.balanceOf(address);
    let balanceVal;
    balanceVal = ethers.utils.formatEther(balance);
    if (bond.decimals) {
      balanceVal = ethers.utils.formatUnits(balance, "mwei");
    }
    if (bond.isLP) {
      balanceVal = ethers.utils.formatEther(balance);
    }
    return {
      bond: bond.name,
      displayName: bond.displayName,
      bondIconSvg: bond.bondIconSvg,
      isLP: bond.isLP,
      isFour: bond.isFour,
      isOld: bond.isOld,
      allowance: Number(allowance),
      balance: balanceVal.toString(),
      interestDue,
      bondMaturationBlock,
      pendingPayout: ethers.utils.formatUnits(pendingPayout, "gwei"),
    };
  },
);

export interface IAccountSlice {
  bonds: { [key: string]: IUserBondDetails };
  userBondData: GetUserBondDetails[];
  balances: {
    hec: string;
    shec: string;
    dai: string;
    oldshec: string;
    wshec: string;
    wshecAsShec: string;
  };
  wrapping: {
    shecWrap: number;
    wshecUnwrap: number;
  };
  loading: boolean;
}
const initialState: IAccountSlice = {
  loading: false,
  bonds: {},
  userBondData: [],
  balances: { hec: "", shec: "", dai: "", oldshec: "", wshec: "", wshecAsShec: "" },
  wrapping: { shecWrap: 0, wshecUnwrap: 0 },
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    fetchAccountSuccess(state, action) {
      setAll(state, action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadAccountDetails.pending, state => {
        state.loading = true;
      })
      .addCase(loadAccountDetails.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(loadAccountDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      })
      .addCase(getBalances.pending, state => {
        state.loading = true;
      })
      .addCase(getBalances.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(getBalances.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      })
      .addCase(calculateUserBondDetails.pending, state => {
        state.loading = true;
      })
      .addCase(calculateUserBondDetails.fulfilled, (state, action) => {
        if (!action.payload) return;
        const bond = action.payload.bond;
        state.bonds[bond] = action.payload;
        state.loading = false;
      })
      .addCase(calculateUserBondDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      })
      .addCase(getUserBondData.pending, state => {
        state.loading = true;
      })
      .addCase(getUserBondData.fulfilled, (state, action) => {
        if (!action.payload) return;
        state.userBondData = action.payload;
        state.loading = false;
      })
      .addCase(getUserBondData.rejected, (state, { error }) => {
        state.loading = false;
        console.error(error);
      });
  },
});

export default accountSlice.reducer;

export const { fetchAccountSuccess } = accountSlice.actions;

const baseInfo = (state: RootState) => state.account;

export const getAccountState = createSelector(baseInfo, account => account);
