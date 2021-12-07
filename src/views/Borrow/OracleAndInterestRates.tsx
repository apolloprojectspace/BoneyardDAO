import { Typography, Paper, Grid } from "@material-ui/core";
import React, { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { shortUsdFormatter } from "./Borrow";
import { USDPricedFuseAsset } from "../../fuse-sdk/helpers/fetchFusePoolData";
import { useExtraPoolInfo } from "../../fuse-sdk/hooks/useExtraPoolInfo";

interface Props {
  assets: USDPricedFuseAsset[];
  // name: string;
  totalSuppliedUSD?: number;
  totalBorrowedUSD?: number;
  totalLiquidityUSD?: number;
  utilization: string;
  comptrollerAddress: string;
  oracleModel?: string;
}
export function OracleAndInterestRates({
  assets,
  //   name,
  totalSuppliedUSD,
  totalBorrowedUSD,
  totalLiquidityUSD,
  utilization,
  comptrollerAddress,
  oracleModel,
}: Props) {
  const data = useExtraPoolInfo(comptrollerAddress);
  const [hasCopied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    setCopied(true);
    navigator.clipboard.writeText(data?.admin);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  }, [data?.admin]);

  return (
    <>
      <Typography variant="h3" style={{ marginBottom: 15 }}>
        Info
      </Typography>
      <StatRow
        statATitle={"Total Supplied"}
        statA={totalSuppliedUSD ? shortUsdFormatter(totalSuppliedUSD) : "-"}
        statBTitle={"Total Borrowed"}
        statB={totalBorrowedUSD ? shortUsdFormatter(totalBorrowedUSD) : "-"}
      />
      <StatRow
        statATitle={"Available Liquidity"}
        statA={totalLiquidityUSD ? shortUsdFormatter(totalLiquidityUSD) : "-"}
        statBTitle={"Pool Utilization"}
        statB={utilization}
      />

      <StatRow
        statATitle={"Upgradeable"}
        statA={data ? (data.upgradeable ? "Yes" : "No") : "?"}
        statBTitle={hasCopied ? "Admin (copied!)" : "Admin (click to copy)"}
        statB={data?.admin ? shortAddress(data.admin) : "?"}
        onClick={handleCopy}
      />

      <StatRow
        statATitle={"Platform Fee"}
        statA={assets.length > 0 ? (assets[0].fuseFee / 1e16).toPrecision(2) + "%" : "10%"}
        statBTitle={"Average Admin Fee"}
        statB={assets.reduce((a, b, _, { length }) => a + b.adminFee / 1e16 / length, 0).toFixed(1) + "%"}
      />
      <StatRow
        statATitle={"Close Factor"}
        statA={data && data.closeFactor ? (data.closeFactor || 0) / 1e16 + "%" : "?%"}
        statBTitle={"Liquidation Incentive"}
        statB={data?.liquidationIncentive ? (data.liquidationIncentive || 0) / 1e16 - 100 + "%" : "?%"}
      />

      <StatRow
        statATitle={"Oracle"}
        statA={data ? oracleModel ?? "Unrecognized Oracle" : "?"}
        statBTitle={"Whitelist"}
        statB={data ? (data.enforceWhitelist ? "Yes" : "No") : "?"}
      />
    </>
  );
}

export function shortAddress(address: string) {
  return address.substring(0, 4) + "..." + address.substring(address.length - 2, address.length);
}

function StatRow({
  statATitle,
  statA,
  statBTitle,
  statB,
  onClick,
}: {
  statATitle: string;
  statA: string;
  statBTitle: string;
  statB: string;
  [key: string]: any;
}) {
  return (
    <Grid spacing={2} container>
      <Grid item xs={12} sm={6}>
        <Typography variant="subtitle2" align="center">
          {statATitle}: <b>{statA}</b>
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6} onClick={onClick}>
        <Typography variant="subtitle2" align="center">
          {statBTitle}: <b>{statB}</b>
        </Typography>
      </Grid>
    </Grid>
  );
}
