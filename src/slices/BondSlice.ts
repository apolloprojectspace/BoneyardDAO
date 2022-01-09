import { ethers, BigNumber } from "ethers";
import { contractForRedeemHelper } from "../helpers";
import { calculateUserBondDetails, loadAccountDetails } from "./AccountSlice";
import { findOrLoadMarketPrice } from "./AppSlice";
import { error, info, success } from "./MessagesSlice";
import { clearPendingTxn, fetchPendingTxns } from "./PendingTxnsSlice";
import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { getBondCalculator, getBondCalculator1, getgOHMBondCalculator } from "src/helpers/BondCalculator";
import { RootState } from "src/store";
import {
  IApproveBondAsyncThunk,
  IBondAssetAsyncThunk,
  ICalcBondDetailsAsyncThunk,
  IJsonRPCError,
  IRedeemAllBondsAsyncThunk,
  IRedeemBondAsyncThunk,
  IBaseAsyncThunk,
} from "./interfaces";
import { messages } from "src/constants";
import { sleep } from "src/helpers/Sleep";
import { metamaskErrorWrap } from "src/helpers/MetamaskErrorWrap";
import { getAllBondDetails, GlobalBondData } from 'src/helpers/bond-details.helper';

export const getGlobalBondData = createAsyncThunk(
  'bonding/getGlobalBondData',
  async ({ networkID, provider }: IBaseAsyncThunk) => {
    return await getAllBondDetails(networkID, provider);
  }
);

export const changeApproval = createAsyncThunk(
  "bonding/changeApproval",
  async ({ address, bond, provider, networkID }: IApproveBondAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const reserveContract = bond.getContractForReserve(networkID, signer);
    const bondAddr = bond.getAddressForBond(networkID);

    let approveTx;
    let bondAllowance = await reserveContract.allowance(address, bondAddr);

    // return early if approval already exists
    if (bondAllowance.gt(BigNumber.from("0"))) {
      dispatch(info("Approval completed."));
      dispatch(calculateUserBondDetails({ address, bond, networkID, provider }));
      return;
    }

    try {
      approveTx = await reserveContract.approve(bondAddr, ethers.utils.parseUnits("1000000000", "ether").toString());
      dispatch(
        fetchPendingTxns({
          txnHash: approveTx.hash,
          text: "Approving " + bond.displayName,
          type: "approve_" + bond.name,
        }),
      );
      await approveTx.wait();
      dispatch(success(messages.tx_successfully_send));
    } catch (e: any) {
      return metamaskErrorWrap(e, dispatch);
    } finally {
      if (approveTx) {
        await dispatch(clearPendingTxn(approveTx.hash));
        await dispatch(calculateUserBondDetails({ address, bond, networkID, provider }));
      }
    }
  },
);

export interface IBondDetails {
  bond: string;
  bondDiscount: number;
  debtRatio: number;
  bondQuote: number;
  purchased: number;
  vestingTerm: number;
  maxBondPrice: number;
  bondPrice: number;
  marketPrice: number;
  isSoldOut?: boolean;
}
export const calcBondDetails = createAsyncThunk(
  "bonding/calcBondDetails",
  async ({ bond, value, provider, networkID }: ICalcBondDetailsAsyncThunk, { dispatch, getState }): Promise<IBondDetails> => {
    const { globalBondData } = (getState() as RootState).bonding;
    if (!value) {
      value = "0";
    }
    const amountInWei = ethers.utils.parseEther(value);
    let bondPrice = 0,
      bondDiscount = 0,
      valuation = 0,
      bondQuote = 0;

    const bondData = globalBondData!.find(globalBond => bond.networkAddrs[networkID].bondAddress.toLowerCase() === globalBond.Contract.toLowerCase());

    // const bondCalcContract = getBondCalculator(networkID, provider);
    let bondCalcContract;
    if (bond.name == "dailp_v1") {
      bondCalcContract = getBondCalculator(networkID, provider);
    } else {
      bondCalcContract = getBondCalculator1(networkID, provider);
    }
    if (bond.name == "gohmlp" || bond.name == "gohmlp4" || bond.name == "gohmlp4_v2") {
      bondCalcContract = getgOHMBondCalculator(networkID, provider);
    }

    const terms = bondData!.BondTerms;
    const maxBondPrice = +bondData!.MaxPayout;
    const debtRatio = +bondData!.StandardizedDebtRatio / Math.pow(10, 9);
    const totalDebt = bondData!.TotalDebt;
    const maxDebt = terms.maxDebt;
    const vestingTerm = Number(terms.vestingTerm);
    let isSoldOut = false;
    if (Number(totalDebt) >= Number(maxDebt)) {
      isSoldOut = true;
    }

    let marketPrice: number = 0;
    try {
      const originalPromiseResult = await dispatch(
        findOrLoadMarketPrice({ networkID: networkID, provider: provider }),
      ).unwrap();
      marketPrice = originalPromiseResult?.marketPrice;
    } catch (rejectedValueOrSerializedError) {
      // handle error here
      console.error("Returned a null response from dispatch(loadMarketPrice)");
    }

    try {
      bondPrice = +bondData!.BondPriceInUSD;
      bondDiscount = (marketPrice * Math.pow(10, 18) - bondPrice) / bondPrice; // 1 - bondPrice / (bondPrice * Math.pow(10, 9));
    } catch (e) {
      console.log("error getting bondPriceInUSD", e);
    }


    if (Number(value) === 0) {
      // if inputValue is 0 avoid the bondQuote calls
      bondQuote = 0;
    } else if (bond.isLP) {
      const bondContract = bond.getContractForBond(networkID, provider);
      valuation = await bondCalcContract.valuation(bond.getAddressForReserve(networkID), amountInWei);
      bondQuote = await bondContract.payoutFor(valuation);
      if (!amountInWei.isZero() && bondQuote < 100000) {
        bondQuote = 0;
        const errorString = "Amount is too small!";
        dispatch(error(errorString));
      } else {
        bondQuote = bondQuote / Math.pow(10, 9);
      }
    } else {
      // RFV = DAI
      const bondContract = bond.getContractForBond(networkID, provider);
      bondQuote = await bondContract.payoutFor(amountInWei);

      if (!amountInWei.isZero() && bondQuote < 100000000000000) {
        bondQuote = 0;
        const errorString = "Amount is too small!";
        dispatch(error(errorString));
      } else {
        bondQuote = bondQuote / Math.pow(10, 18);
      }
    }

    // Display error if user tries to exceed maximum.
    if (!!value && parseFloat(bondQuote.toString()) > maxBondPrice / Math.pow(10, 9)) {
      const errorString =
        "You're trying to bond more than the maximum payout available! The maximum bond payout is " +
        (maxBondPrice / Math.pow(10, 9)).toFixed(2).toString() +
        " HEC.";
      dispatch(error(errorString));
    }

    // Calculate bonds purchased
    let purchased = await bond.getTreasuryBalance(networkID, provider);
    if (bond.decimals) {
      bondPrice = bondPrice / Math.pow(10, 6);
      bondDiscount = bondDiscount / Math.pow(10, 12) - 1;
    } else {
      bondPrice = bondPrice / Math.pow(10, 18);
    }
    if (isSoldOut) {
      bondDiscount = -0.1;
    }

    return {
      bond: bond.name,
      bondDiscount,
      debtRatio,
      bondQuote,
      purchased,
      vestingTerm,
      maxBondPrice: maxBondPrice / Math.pow(10, 9),
      bondPrice: bondPrice,
      marketPrice: marketPrice,
      isSoldOut: isSoldOut,
    };
  },
);

export const bondAsset = createAsyncThunk(
  "bonding/bondAsset",
  async ({ value, address, bond, networkID, provider, slippage }: IBondAssetAsyncThunk, { dispatch }) => {
    const depositorAddress = address;
    const acceptedSlippage = slippage / 100 || 0.005; // 0.5% as default
    // parseUnits takes String => BigNumber
    let valueInWei = ethers.utils.parseUnits(value.toString(), "ether");
    if (bond.decimals && !bond.isLP) {
      valueInWei = valueInWei.div(Math.pow(10, 12));
    }
    let balance;
    // Calculate maxPremium based on premium and slippage.
    // const calculatePremium = await bonding.calculatePremium();
    const signer = provider.getSigner();
    const bondContract = bond.getContractForBond(networkID, signer);
    const calculatePremium = await bondContract.bondPrice();
    const maxPremium = Math.round(calculatePremium * (1 + acceptedSlippage));

    // Deposit the bond
    let bondTx;
    let uaData = {
      address: address,
      value: value,
      type: "Bond",
      bondName: bond.displayName,
      approved: true,
      txHash: null,
    };
    try {
      bondTx = await bondContract.deposit(valueInWei, maxPremium, depositorAddress);

      dispatch(
        fetchPendingTxns({ txnHash: bondTx.hash, text: "Bonding " + bond.displayName, type: "bond_" + bond.name }),
      );
      uaData.txHash = bondTx.hash;
      await bondTx.wait();
      dispatch(success(messages.tx_successfully_send));
      await sleep(10);
      dispatch(info(messages.your_balance_update_soon));
      // TODO: it may make more sense to only have it in the finally.
      // UX preference (show pending after txn complete or after balance updated)
      await sleep(10);
      await dispatch(calculateUserBondDetails({ address, bond, networkID, provider }));
      dispatch(info(messages.your_balance_updated));
    } catch (e: any) {
      return metamaskErrorWrap(e, dispatch);
    } finally {
      if (bondTx) {
        // segmentUA(uaData);
        dispatch(clearPendingTxn(bondTx.hash));
      }
    }
  },
);

export const redeemBond = createAsyncThunk(
  "bonding/redeemBond",
  async ({ address, bond, networkID, provider, autostake }: IRedeemBondAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const bondContract = bond.getContractForBond(networkID, signer);

    let redeemTx;
    let uaData = {
      address: address,
      type: "Redeem",
      bondName: bond.displayName,
      autoStake: autostake,
      approved: true,
      txHash: null,
    };
    try {
      redeemTx = await bondContract.redeem(address, autostake === true);
      const pendingTxnType = "redeem_bond_" + bond + (autostake === true ? "_autostake" : "");
      uaData.txHash = redeemTx.hash;
      dispatch(
        fetchPendingTxns({ txnHash: redeemTx.hash, text: "Redeeming " + bond.displayName, type: pendingTxnType }),
      );

      await redeemTx.wait();
      dispatch(success(messages.tx_successfully_send));
      await sleep(10);
      dispatch(info(messages.your_balance_update_soon))
      await sleep(10);
      await dispatch(calculateUserBondDetails({ address, bond, networkID, provider }));
      await dispatch(loadAccountDetails({ address, networkID, provider }));
      dispatch(info(messages.your_balance_updated));
    } catch (e: any) {
      return metamaskErrorWrap(e, dispatch);
    } finally {
      if (redeemTx) {
        // segmentUA(uaData);
        dispatch(clearPendingTxn(redeemTx.hash));
        dispatch(loadAccountDetails({ networkID, address, provider }));
      }
    }
  },
);

export const redeemAllBonds = createAsyncThunk(
  "bonding/redeemAllBonds",
  async ({ bonds, address, networkID, provider, autostake }: IRedeemAllBondsAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const redeemHelperContract = contractForRedeemHelper({ networkID, provider: signer });

    let redeemAllTx;

    try {
      redeemAllTx = await redeemHelperContract.redeemAll(address, autostake);
      const pendingTxnType = "redeem_all_bonds" + (autostake === true ? "_autostake" : "");

      await dispatch(
        fetchPendingTxns({ txnHash: redeemAllTx.hash, text: "Redeeming All Bonds", type: pendingTxnType }),
      );

      await redeemAllTx.wait();

      await Promise.all(
        bonds && bonds.map(bond => dispatch(calculateUserBondDetails({ address, bond, networkID, provider }))),
      );

      dispatch(loadAccountDetails({ address, networkID, provider }));
    } catch (e: unknown) {
      dispatch(error((e as IJsonRPCError).message));
    } finally {
      if (redeemAllTx) {
        dispatch(clearPendingTxn(redeemAllTx.hash));
        dispatch(loadAccountDetails({ networkID, address, provider }));
      }
    }
  },
);

// Note(zx): this is a barebones interface for the state. Update to be more accurate
interface IBondSlice {
  status: string;
  globalBondData: GlobalBondData[];
  [key: string]: any;
}

const setBondState = (state: IBondSlice, payload: any) => {
  const bond = payload.bond;
  const newState = { ...state[bond], ...payload };
  state[bond] = newState;
  state.loading = false;
};

const initialState: IBondSlice = {
  status: "idle",
  globalBondData: []
};

const bondingSlice = createSlice({
  name: "bonding",
  initialState,
  reducers: {
    fetchBondSuccess(state, action) {
      state[action.payload.bond] = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(calcBondDetails.pending, state => {
        state.loading = true;
      })
      .addCase(calcBondDetails.fulfilled, (state, action) => {
        setBondState(state, action.payload);
        state.loading = false;
      })
      .addCase(calcBondDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.error(error.message);
      })
      .addCase(getGlobalBondData.pending, state => {
        state.loading = true;
      })
      .addCase(getGlobalBondData.fulfilled, (state, action) => {
        state.globalBondData = action.payload
        state.loading = false;
      })
      .addCase(getGlobalBondData.rejected, (state, { error }) => {
        state.loading = false;
        console.error(error.message);
      });
  },
});

export default bondingSlice.reducer;

export const { fetchBondSuccess } = bondingSlice.actions;

const baseInfo = (state: RootState) => state.bonding;

export const getBondingState = createSelector(baseInfo, bonding => bonding);
