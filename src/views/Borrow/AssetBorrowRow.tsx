import React, { useCallback, useState } from "react";
import { Grid, Typography, TableRow, TableCell, Avatar, Tooltip, IconButton, Switch } from "@material-ui/core";

import useMediaQuery from "@material-ui/core/useMediaQuery";
import "./borrow.scss";
import { AssetSupplyRow } from "./AssetSupplyRow";
import { shortUsdFormatter } from "./Borrow";
import { formatCurrency } from "../../helpers";
import { USDPricedFuseAsset } from "../../fuse-sdk/helpers/fetchFusePoolData";
import { useTokenData } from "../../fuse-sdk/hooks/useTokenData";
import { convertMantissaToAPY } from "../../fuse-sdk/helpers/apyUtils";
import { Mode } from "../../fuse-sdk/helpers/fetchMaxAmount";
import { PoolModal } from "./Modal/PoolModal";

export function AssetBorrowRow({
  comptrollerAddress,
  asset,
  onClick,
}: {
  asset: USDPricedFuseAsset;
  comptrollerAddress: string;
  onClick: (asset: USDPricedFuseAsset) => void;
}) {
  const tokenData = useTokenData(asset.underlyingToken);
  const borrowAPR = convertMantissaToAPY(asset.borrowRatePerBlock, 365);
  return (
    <TableRow hover onClick={() => onClick(asset)}>
      <TableCell>
        <Grid spacing={1} container alignItems="center">
          <Grid item>
            <Avatar
              className={"avatar-medium"}
              src={
                tokenData?.logoURL ??
                "https://raw.githubusercontent.com/feathericons/feather/master/icons/help-circle.svg"
              }
            />
          </Grid>
          <Grid item>
            <Typography variant="body1">{tokenData?.symbol ?? asset.underlyingSymbol}</Typography>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell align={"right"}>
        <Typography variant="body1">{borrowAPR.toFixed(3)}%</Typography>
        <Tooltip
          arrow
          title="Total Value Lent (TVL) measures how much of this asset has been supplied in total. TVL does not account for how much of the lent assets have been borrowed, use 'liquidity' to determine the total unborrowed assets lent."
        >
          <Typography variant="body2" component="span">{`${shortUsdFormatter(asset.totalSupplyUSD)} TVL`}</Typography>
        </Tooltip>
      </TableCell>
      <TableCell align="right">
        <Typography variant="body1">{formatCurrency(asset.borrowBalanceUSD, 2)}</Typography>
        <Typography variant="body2" component="span">
          {formatCurrency(asset.borrowBalance / 10 ** asset.underlyingDecimals, 2).replace("$", "")}{" "}
          {tokenData?.extraData?.shortName ?? tokenData?.symbol ?? asset.underlyingSymbol}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Tooltip
          title="Liquidity is the amount of this asset that is available to borrow (unborrowed). To see how much has been supplied and borrowed in total, navigate to the Pool Info tab."
          arrow
        >
          <>
            <Typography variant="body1">{shortUsdFormatter(asset.liquidityUSD)}</Typography>

            <Typography variant="body2" component="span">
              {shortUsdFormatter(asset.liquidity / 10 ** asset.underlyingDecimals).replace("$", "")} {tokenData?.symbol}
            </Typography>
          </>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
