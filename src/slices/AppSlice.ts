import { ethers } from "ethers";
import { addresses } from "../constants";
import { abi as HectorStakingv2 } from "../abi/HectorStakingv2.json";
import { abi as ierc20Abi } from "../abi/IERC20.json";
import { abi as sHECv2 } from "../abi/sHecv2.json";
import { setAll, getTokenPrice, getMarketPrice } from "../helpers";
import apollo from "../lib/apolloClient.js";
import { createSlice, createSelector, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "src/store";
import { IBaseAsyncThunk } from "./interfaces";
import axios from 'axios';
import { AllInvestments } from 'src/types/investments.model';

const circulatingSupply = {
  name: "circulatingSupply",
  outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  stateMutability: "view",
  type: "function",
};
export const loadAppDetails = createAsyncThunk(
  "app/loadAppDetails",
  async ({ networkID, provider }: IBaseAsyncThunk, { dispatch }) => {
    const protocolMetricsQuery = `
  query {
    _meta {
      block {
        number
      }
    }
    protocolMetrics(first: 1, orderBy: timestamp, orderDirection: desc) {
      timestamp
      hecCirculatingSupply
      sHecCirculatingSupply
      totalSupply
      hecPrice
      marketCap
      totalValueLocked
      treasuryMarketValue
      nextEpochRebase
      nextDistributedHec
      treasuryInvestments
    }
  }
  `;

    const graphData = await apollo(protocolMetricsQuery);
    if (!graphData) {
      console.error("Returned a null response when querying TheGraph");
      return;
    }

    const stakingContract = new ethers.Contract(
      addresses[networkID].STAKING_ADDRESS as string,
      HectorStakingv2,
      provider,
    );
    const old_stakingContract = new ethers.Contract(
      addresses[networkID].OLD_STAKING_ADDRESS as string,
      HectorStakingv2,
      provider,
    );
    // NOTE (appleseed): marketPrice from Graph was delayed, so get CoinGecko price
    let marketPrice;
    try {
      const originalPromiseResult = await dispatch(
        loadMarketPrice({ networkID: networkID, provider: provider }),
      ).unwrap();
      marketPrice = originalPromiseResult?.marketPrice;
    } catch (rejectedValueOrSerializedError) {
      // handle error here
      console.error("Returned a null response from dispatch(loadMarketPrice)");
      return;
    }
    const sHecMainContract = new ethers.Contract(addresses[networkID].SHEC_ADDRESS as string, sHECv2, provider);
    const hecContract = new ethers.Contract(addresses[networkID].HEC_ADDRESS as string, ierc20Abi, provider);
    const oldsHecContract = new ethers.Contract(
      addresses[networkID].OLD_SHEC_ADDRESS as string,
      [circulatingSupply],
      provider,
    );
    const old_circ = await oldsHecContract.circulatingSupply();
    const treasuryMarketValue = graphData.data.protocolMetrics[0].treasuryMarketValue;
    const stakingTVL = parseFloat(graphData.data.protocolMetrics[0].totalValueLocked);
    const circ = await sHecMainContract.circulatingSupply();
    const circSupply = parseFloat(graphData.data.protocolMetrics[0].hecCirculatingSupply);
    const total = await hecContract.totalSupply();
    const totalSupply = total / 1000000000;
    const marketCap = marketPrice * circSupply;
    const marketPriceString = marketPrice ? "$" + marketPrice.toFixed(2) : "";
    const investments = parseFloat(graphData.data.protocolMetrics[0].treasuryInvestments);
    document.title = `HectorDAO - ${marketPriceString}`;
    if (!provider) {
      console.error("failed to connect to provider, please connect your wallet");
      return {
        stakingTVL,
        treasuryMarketValue,
        marketPrice,
        marketCap,
        circSupply,
        totalSupply,
      };
    }
    const currentBlock = await provider.getBlockNumber();

    // Calculating staking
    const epoch = await stakingContract.epoch();
    const old_epoch = await old_stakingContract.epoch();
    const stakingReward = epoch.distribute;
    const old_stakingReward = old_epoch.distribute;
    const stakingRebase = stakingReward / circ;
    const old_stakingRebase = old_stakingReward / old_circ;
    const fiveDayRate = Math.pow(1 + stakingRebase, 5 * 3) - 1;
    const old_fiveDayRate = Math.pow(1 + old_stakingRebase, 5 * 3) - 1;
    const stakingAPY = Math.pow(1 + stakingRebase, 365 * 3) - 1;
    // Current index
    const currentIndex = await stakingContract.index();
    const endBlock = epoch.endBlock;
    const epochNumber = epoch.number;

    return {
      currentIndex: ethers.utils.formatUnits(currentIndex, "gwei"),
      currentBlock,
      fiveDayRate,
      old_fiveDayRate,
      stakingAPY,
      stakingTVL,
      treasuryMarketValue,
      stakingRebase,
      old_stakingRebase,
      marketCap,
      marketPrice,
      circSupply,
      totalSupply,
      endBlock,
      investments,
      epochNumber
    } as IAppData;
  },
);

/**
 * checks if app.slice has marketPrice already
 * if yes then simply load that state
 * if no then fetches via `loadMarketPrice`
 *
 * `usage`:
 * ```
 * const originalPromiseResult = await dispatch(
 *    findOrLoadMarketPrice({ networkID: networkID, provider: provider }),
 *  ).unwrap();
 * originalPromiseResult?.whateverValue;
 * ```
 */
export const findOrLoadMarketPrice = createAsyncThunk(
  "app/findOrLoadMarketPrice",
  async ({ networkID, provider }: IBaseAsyncThunk, { dispatch, getState }) => {
    const state: any = getState();
    let marketPrice;
    // check if we already have loaded market price
    if (state.app.loadingMarketPrice === false && state.app.marketPrice) {
      // go get marketPrice from app.state
      marketPrice = state.app.marketPrice;
    } else {
      // we don't have marketPrice in app.state, so go get it
      try {
        const originalPromiseResult = await dispatch(
          loadMarketPrice({ networkID: networkID, provider: provider }),
        ).unwrap();
        marketPrice = originalPromiseResult?.marketPrice;
      } catch (rejectedValueOrSerializedError) {
        // handle error here
        console.error("Returned a null response from dispatch(loadMarketPrice)");
        return;
      }
    }
    return { marketPrice };
  },
);

/**
 * - fetches the HEC price from CoinGecko (via getTokenPrice)
 * - falls back to fetch marketPrice from hec-dai contract
 * - updates the App.slice when it runs
 */
const loadMarketPrice = createAsyncThunk("app/loadMarketPrice", async ({ networkID, provider }: IBaseAsyncThunk) => {
  let marketPrice: number;
  try {
    marketPrice = await getMarketPrice({ networkID, provider });
    marketPrice = marketPrice / Math.pow(10, 9);
  } catch (e) {
    marketPrice = await getTokenPrice("hector");
  }
  return { marketPrice };
});

export const loadTreasuryInvestments = createAsyncThunk("app/loadTreasuryInvestments", async () => await (await axios.get('https://api.jsonbin.io/b/61e18d66ba87c130e3e84624/6')).data);

interface IAppData {
  readonly circSupply: number;
  readonly currentIndex?: string;
  readonly currentBlock?: number;
  readonly fiveDayRate?: number;
  readonly old_fiveDayRate?: number;
  readonly marketCap: number;
  readonly marketPrice: number;
  readonly treasuryMarketValue: number;
  readonly allInvestments: AllInvestments;
  readonly stakingAPY?: number;
  readonly stakingRebase?: number;
  readonly old_stakingRebase?: number;
  readonly stakingTVL: number;
  readonly totalSupply: number;
  readonly treasuryBalance?: number;
  readonly endBlock?: number;
  readonly investments?: number;
  readonly epochNumber?: number;
}

const initialState: IAppSlice = {
  loading: false,
  loadingMarketPrice: false,
  treasuryMarketValue: 0,
  allInvestments: { transactions: [], assetsUM: undefined },
  isLoadingInvestments: false
};

interface IAppSlice {
  loading: boolean;
  loadingMarketPrice: boolean;
  isLoadingInvestments: boolean;
  treasuryMarketValue: number;
  allInvestments: AllInvestments
}

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    fetchAppSuccess(state, action) {
      setAll(state, action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadAppDetails.pending, state => {
        state.loading = true;
      })
      .addCase(loadAppDetails.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(loadAppDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.error(error.name, error.message, error.stack);
      })
      .addCase(loadMarketPrice.pending, (state, action) => {
        state.loadingMarketPrice = true;
      })
      .addCase(loadMarketPrice.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loadingMarketPrice = false;
      })
      .addCase(loadMarketPrice.rejected, (state, { error }) => {
        state.loadingMarketPrice = false;
        console.error(error.name, error.message, error.stack);
      })
      .addCase(loadTreasuryInvestments.pending, (state, action) => {
        state.isLoadingInvestments = true;
      })
      .addCase(loadTreasuryInvestments.fulfilled, (state, action) => {
        state.isLoadingInvestments = false;
        state.allInvestments = action.payload;
      })
      .addCase(loadTreasuryInvestments.rejected, (state, { error }) => {
        state.isLoadingInvestments = false;
        console.error(error.name, error.message, error.stack);
      });
  },
});

const baseInfo = (state: RootState) => state.app;

export default appSlice.reducer;

export const { fetchAppSuccess } = appSlice.actions;

export const getAppState = createSelector(baseInfo, app => app);
