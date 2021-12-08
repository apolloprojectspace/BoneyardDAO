import React, { useCallback, useState } from "react";
import {
  Grid,
  Typography,
  TableRow,
  TableCell,
  Avatar,
  Tooltip,
  IconButton,
  Switch,
  Link,
  SvgIcon,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";

import HelpOutlineIcon from "@material-ui/icons/HelpOutline";

import LinkIcon from "@material-ui/icons/Link";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import "./borrow.scss";
import { formatCurrency } from "../../helpers";
import { USDPricedFuseAsset } from "../../fuse-sdk/helpers/fetchFusePoolData";
import { useTokenData } from "../../fuse-sdk/hooks/useTokenData";
import { convertMantissaToAPY } from "../../fuse-sdk/helpers/apyUtils";
import { ReactComponent as ArrowUp } from "../../assets/icons/arrow-up.svg";
import { Mode } from "../../fuse-sdk/helpers/fetchMaxAmount";
import { PoolModal } from "./Modal/PoolModal";
import { useWeb3Context } from "src/hooks";

export function AssetSupplyRow({
  comptrollerAddress,
  asset,
  onClick,
}: {
  asset: USDPricedFuseAsset;
  comptrollerAddress: string;
  onClick: (asset: USDPricedFuseAsset) => void;
}) {
  const tokenData = useTokenData(asset.underlyingToken);
  const { scanner } = useWeb3Context();
  const isStakedHEC =
    asset.underlyingToken.toLowerCase() === "0x04F2694C8fcee23e8Fd0dfEA1d4f5Bb8c352111F".toLowerCase();
  const stakedHECApyData = { supplyApy: 72.63090497083556, supplyWpy: 0.08594200630075033 }; // TODO Get HEC APY
  const supplyAPY = convertMantissaToAPY(asset.supplyRatePerBlock, 365);

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
            <Typography>{tokenData?.symbol ?? asset.underlyingSymbol}</Typography>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell align={"right"}>
        <>
          <Typography>
            {isStakedHEC
              ? stakedHECApyData
                ? (stakedHECApyData.supplyApy * 100).toFixed(3)
                : "?"
              : supplyAPY.toFixed(2)}
            %
          </Typography>

          <Tooltip
            arrow
            title={
              <Typography variant="h6">
                The Collateral Factor (CF) ratio defines the maximum amount of tokens in the pool that can be borrowed
                with a specific collateral. It’s expressed in percentage: if in a pool ETH has 75% LTV, for every 1 ETH
                worth of collateral, borrowers will be able to borrow 0.75 ETH worth of other tokens in the pool.
              </Typography>
            }
          >
            <Typography variant="body2" component="span">
              {asset.collateralFactor / 1e16}% LTV
            </Typography>
          </Tooltip>
        </>
      </TableCell>
      <TableCell align="right">
        <Typography variant="body1">{formatCurrency(asset.supplyBalanceUSD, 2)}</Typography>
        <Typography variant="body2" component="span">
          {formatCurrency(asset.supplyBalance / 10 ** asset.underlyingDecimals, 2).replace("$", "")}{" "}
          {tokenData?.extraData?.shortName ?? tokenData?.symbol ?? asset.underlyingSymbol}
        </Typography>
      </TableCell>
    </TableRow>
  );
}