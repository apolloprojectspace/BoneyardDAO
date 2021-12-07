import React, { useEffect, useState, useCallback } from "react";
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
import { FusePoolData, USDPricedFuseAsset } from "../../fuse-sdk/helpers/fetchFusePoolData";
import { useDispatch, useSelector } from "react-redux";
import { StaticJsonRpcProvider } from "@ethersproject/providers";
import Fuse from "../../fuse-sdk";
import { initFuseWithProviders } from "../../fuse-sdk/helpers/web3Providers";
import { useWeb3Context } from "../../hooks";
import { RootState } from "../../store";
import { PoolModal } from "./Modal/PoolModal";
import { Mode } from "../../fuse-sdk/helpers/fetchMaxAmount";
import { useBorrowLimit } from "src/fuse-sdk/hooks/useBorrowLimit";

export default function Borrow({ poolId }: { poolId: number }) {
  const data = useFusePoolData(poolId);
  const {
    totalSuppliedUSD,
    totalBorrowedUSD,
    totalLiquidityUSD,
    totalSupplyBalanceUSD,
    totalBorrowBalanceUSD,
    comptroller: comptrollerAddress,
    assets = [],
  } = data ?? {};
  const suppliedAssets = assets.filter(asset => asset.supplyBalanceUSD > 1);
  const nonSuppliedAssets = assets.filter(asset => asset.supplyBalanceUSD < 1);

  const borrowedAssets = assets.filter(asset => asset.borrowBalanceUSD > 1);
  const nonBorrowedAssets = assets.filter(asset => asset.borrowBalanceUSD < 1);

  const maxBorrow = useBorrowLimit(assets);

  const utilization =
    (totalSuppliedUSD ?? 0).toString() === "0"
      ? "0%"
      : (((totalBorrowedUSD ?? 0) / totalSuppliedUSD) * 100).toFixed(2) + "%";

  const [openWithIndex, setOpenWithIndex] = useState<number | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<USDPricedFuseAsset[]>([]);
  const handleOpen = useCallback((index, assets) => {
    setOpenWithIndex(index);
    setSelectedAssets(assets);
  }, []);
  const handleClose = useCallback(() => {
    setOpenWithIndex(null);
    setSelectedAssets([]);
  }, []);

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
              <CollateralRatioBar maxBorrow={maxBorrow} borrowUSD={totalBorrowBalanceUSD} />
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
                  onClick={handleOpen}
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
                  onClick={handleOpen}
                />
              ) : (
                <Skeleton variant="rect" height={300} />
              )}
            </Paper>
          </Grid>
        </Grid>
        <Grid item>
          <Paper className="hec-card">
            {assets.length > 0 ? <AssetAndOtherInfo assets={assets} /> : <Skeleton variant="rect" height={300} />}
          </Paper>
        </Grid>
      </Grid>
      <PoolModal
        defaultMode={Mode.SUPPLY}
        comptrollerAddress={comptrollerAddress}
        assets={selectedAssets}
        index={openWithIndex !== null ? openWithIndex : 0}
        isOpen={openWithIndex !== null}
        onClose={handleClose}
      />
    </div>
  );
}

function SupplyList({
  comptrollerAddress,
  totalSupplyBalanceUSD,
  suppliedAssets,
  nonSuppliedAssets,
  onClick,
}: {
  comptrollerAddress: string;
  totalSupplyBalanceUSD: number;
  suppliedAssets: USDPricedFuseAsset[];
  nonSuppliedAssets: USDPricedFuseAsset[];
  onClick: (index: number, assets: USDPricedFuseAsset[]) => void;
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
              <AssetSupplyRow
                comptrollerAddress={comptrollerAddress}
                key={asset.underlyingToken}
                assets={suppliedAssets}
                index={index}
                onClick={() => onClick(index, suppliedAssets)}
              />
            ))}

            {nonSuppliedAssets.map((asset, index) => (
              <AssetSupplyRow
                comptrollerAddress={comptrollerAddress}
                key={asset.underlyingToken}
                assets={nonSuppliedAssets}
                index={index}
                onClick={() => onClick(index, nonSuppliedAssets)}
              />
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
  onClick,
}: {
  comptrollerAddress: string;
  borrowedAssets: USDPricedFuseAsset[];
  nonBorrowedAssets: USDPricedFuseAsset[];
  totalBorrowBalanceUSD: number;
  onClick: (index: number, assets: USDPricedFuseAsset[]) => void;
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
              <AssetBorrowRow
                comptrollerAddress={comptrollerAddress}
                key={asset.underlyingToken}
                assets={borrowedAssets}
                index={index}
                onClick={() => onClick(index, borrowedAssets)}
              />
            ))}

            {nonBorrowedAssets.map((asset, index) =>
              asset.isPaused ? null : (
                <AssetBorrowRow
                  comptrollerAddress={comptrollerAddress}
                  key={asset.underlyingToken}
                  assets={nonBorrowedAssets}
                  index={index}
                  onClick={() => onClick(index, nonBorrowedAssets)}
                />
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
