import React from "react";
import {
  Grid,
  Paper,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";

import useMediaQuery from "@material-ui/core/useMediaQuery";
import "./borrow.scss";
import { AssetSupplyRow } from "./AssetSupplyRow";
import { formatCurrency } from "../../helpers";
import { AssetBorrowRow } from "./AssetBorrowRow";
import { OracleAndInterestRates } from "./OracleAndInterestRates";
import { AssetAndOtherInfo } from "./AssetAndOtherInfo";
import { useFusePoolData } from "../../fuse-sdk/hooks/useFusePoolData";
import { CollateralRatioBar } from "./CollateralRatioBar";
import { USDPricedFuseAsset } from "../../fuse-sdk/helpers/fetchFusePoolData";

export interface Asset {
  supplyBalanceUSD: number;
  borrowBalanceUSD: number;
  borrowBalance: number;
  isSupplyPaused?: boolean;
  underlyingSymbol: string;
  collateralFactor: number;
  reserveFactor: number;
  underlyingToken: string;
  supplyBalance: number;
  underlyingDecimals: number;
  isPause?: boolean;
  fuseFee: number;
  adminFee: number;
  totalSupplyUSD: number;
  totalBorrowUSD: number;
  membership?: boolean;
  liquidityUSD: number;
  liquidity: number;
  cToken: string;

  tokenData: {
    logoURL?: string;
    symbol?: string;
    extraData?: {
      partnerURL?: string;
      hasAPY?: boolean;
      apy: number;
      shortName?: string;
    };
    color?: string;
  };
}
export default function Borrow({ poolId }: { poolId: number }) {
  const data = useFusePoolData(poolId);
  const {
    totalSuppliedUSD,
    totalBorrowedUSD,
    totalLiquidityUSD,
    totalSupplyBalanceUSD,
    totalBorrowBalanceUSD,
    comptroller: comptrollerAddress,
    oracleModel,
    assets = [],
  } = data ?? {};
  const suppliedAssets = assets.filter(asset => asset.supplyBalanceUSD > 1);
  const nonSuppliedAssets = assets.filter(asset => asset.supplyBalanceUSD < 1);

  const borrowedAssets = assets.filter(asset => asset.borrowBalanceUSD > 1);
  const nonBorrowedAssets = assets.filter(asset => asset.borrowBalanceUSD < 1);

  const utilization =
    (totalSuppliedUSD ?? 0).toString() === "0"
      ? "0%"
      : (((totalBorrowedUSD ?? 0) / totalSuppliedUSD) * 100).toFixed(2) + "%";

  return (
    <div id="borrow-view">
      <Grid container spacing={2} direction="column">
        <Grid item>
          <Typography variant="h2">Hector Bank</Typography>
        </Grid>
        <Grid item container>
          <Paper className="hec-card">
            <Grid container spacing={1} className="hero-metrics" justifyContent="center">
              <Grid item xs={6} sm={3}>
                <TotalCard title="Total Supply" value={totalSuppliedUSD} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TotalCard title="Total Borrow" value={totalBorrowedUSD} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TotalCard title="Liquidity" value={totalLiquidityUSD} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TotalCard title="Supply Utilization" value={utilization} />
              </Grid>
            </Grid>
            {assets.some(asset => asset.membership) ? (
              <CollateralRatioBar assets={assets} borrowUSD={totalBorrowBalanceUSD} />
            ) : null}
          </Paper>
        </Grid>

        <Grid item container spacing={1}>
          <Grid item xs={12} sm={6}>
            <Paper className="hec-card hec-card-table">
              {assets.length ? (
                <SupplyList
                  comptrollerAddress={comptrollerAddress}
                  totalSupplyBalanceUSD={totalSupplyBalanceUSD}
                  suppliedAssets={suppliedAssets}
                  nonSuppliedAssets={nonSuppliedAssets}
                />
              ) : (
                <Skeleton variant="rect" height={300} />
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper className="hec-card hec-card-table">
              {assets.length ? (
                <BorrowList
                  comptrollerAddress={comptrollerAddress}
                  borrowedAssets={borrowedAssets}
                  nonBorrowedAssets={nonBorrowedAssets}
                  totalBorrowBalanceUSD={totalBorrowBalanceUSD}
                />
              ) : (
                <Skeleton variant="rect" height={300} />
              )}
            </Paper>
          </Grid>
        </Grid>
        <Grid item container spacing={1}>
          <Grid item xs={12} sm={6}>
            <Paper className="hec-card">
              {data ? (
                <OracleAndInterestRates
                  assets={assets}
                  totalSuppliedUSD={totalSuppliedUSD}
                  totalBorrowedUSD={totalBorrowedUSD}
                  totalLiquidityUSD={totalLiquidityUSD}
                  utilization={utilization}
                  comptrollerAddress={comptrollerAddress}
                  oracleModel={oracleModel}
                />
              ) : (
                <Skeleton variant="rect" height={300} />
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper className="hec-card">
              {assets.length > 0 ? <AssetAndOtherInfo assets={assets} /> : <Skeleton variant="rect" height={300} />}
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

function SupplyList({
  comptrollerAddress,
  totalSupplyBalanceUSD,
  suppliedAssets,
  nonSuppliedAssets,
}: {
  comptrollerAddress: string;
  totalSupplyBalanceUSD: number;
  suppliedAssets: USDPricedFuseAsset[];
  nonSuppliedAssets: USDPricedFuseAsset[];
}) {
  return (
    <>
      <Typography variant="h5">Your Supply Balance: {formatCurrency(totalSupplyBalanceUSD, 2)}</Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Asset</TableCell>
              <TableCell align="right">APY/LTV</TableCell>
              <TableCell align="right">Balance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliedAssets.map((asset, index) => (
              <AssetSupplyRow comptrollerAddress={comptrollerAddress} key={asset.underlyingToken} asset={asset} />
            ))}

            {/*{suppliedAssets.length > 0 ? <ModalDivider my={2} /> : null}*/}

            {nonSuppliedAssets.map((asset, index) => (
              <AssetSupplyRow comptrollerAddress={comptrollerAddress} key={asset.underlyingToken} asset={asset} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

function BorrowList({
  comptrollerAddress,
  borrowedAssets,
  nonBorrowedAssets,
  totalBorrowBalanceUSD,
}: {
  comptrollerAddress: string;
  borrowedAssets: USDPricedFuseAsset[];
  nonBorrowedAssets: USDPricedFuseAsset[];
  totalBorrowBalanceUSD: number;
}) {
  const isSmallScreen = useMediaQuery("(max-width: 600px)");

  return (
    <>
      <Typography variant="h5"> Your Borrow Balance: {formatCurrency(totalBorrowBalanceUSD, 2)}</Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Asset</TableCell>
              <TableCell align="right">APR/TVL</TableCell>
              <TableCell align="right">Balance</TableCell>
              <TableCell align="right">Liquidity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {borrowedAssets.map((asset, index) => (
              <AssetBorrowRow comptrollerAddress={comptrollerAddress} key={asset.underlyingToken} asset={asset} />
            ))}

            {/* {borrowedAssets.length > 0 ? <ModalDivider my={2} /> : null} */}

            {nonBorrowedAssets.map((asset, index) =>
              asset.isPaused ? null : (
                <AssetBorrowRow comptrollerAddress={comptrollerAddress} key={asset.underlyingToken} asset={asset} />
              ),
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

function TotalCard({ title, value }: { title: string; value?: number | string | null }) {
  return (
    <>
      <Typography variant="h6">{title}</Typography>
      <Typography variant="h5">
        {value ? (
          typeof value === "string" ? (
            value
          ) : (
            new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 2,
              notation: "compact",
            }).format(value)
          )
        ) : (
          <Skeleton width="150px"></Skeleton>
        )}
      </Typography>
    </>
  );
}

export function shortUsdFormatter(num: number) {
  return `$${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(num)}`;
}
