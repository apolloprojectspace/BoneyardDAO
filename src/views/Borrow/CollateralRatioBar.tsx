import { Grid, LinearProgress, Tooltip, Typography, Paper } from "@material-ui/core";
import React, { useEffect } from "react";
import { makeStyles, createStyles, withStyles, Theme } from "@material-ui/core/styles";

import { formatCurrency } from "../../helpers";
import { Asset } from "./Borrow";
import { useBorrowLimit } from "../../fuse-sdk/hooks/useBorrowLimit";
import { USDPricedFuseAsset } from "../../fuse-sdk/helpers/fetchFusePoolData";

interface Props {
  assets: USDPricedFuseAsset[];
  borrowUSD: number;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: 16,
  },
  green: {
    backgroundColor: theme.palette.success.main,
  },
  yellow: {
    backgroundColor: theme.palette.warning.light,
  },
  orange: {
    backgroundColor: theme.palette.warning.dark,
  },
  red: {
    backgroundColor: theme.palette.error.main,
  },
}));

export function CollateralRatioBar({ assets, borrowUSD }: Props) {
  const maxBorrow = useBorrowLimit(assets);

  const ratio = (borrowUSD / maxBorrow) * 100;
  const classes = useStyles();

  return (
    <Grid item container spacing={2} alignItems="center" className="collateralRatioBar">
      <Grid item>
        <Tooltip title={"Keep this bar from filling up to avoid being liquidated!"}>
          <Typography variant="h6">Borrow Limit</Typography>
        </Tooltip>
      </Grid>
      <Grid item>
        <Tooltip title={"This is how much you have borrowed."}>
          <Typography variant="h5">{formatCurrency(borrowUSD, 2)}</Typography>
        </Tooltip>
      </Grid>
      <Grid item className="progress">
        <Tooltip title={`You're using ${ratio.toFixed(1)}% of your ${formatCurrency(maxBorrow, 2)} borrow limit.`}>
          <LinearProgress
            value={ratio}
            classes={{
              root: classes.root,
              barColorPrimary:
                ratio <= 40 ? classes.green : ratio <= 60 ? classes.yellow : ratio <= 80 ? classes.orange : classes.red,
            }}
            variant="determinate"
          />
        </Tooltip>
      </Grid>
      <Grid item>
        <Tooltip title={"If your borrow amount reaches this value, you will be liquidated."}>
          <Typography variant="h5">{formatCurrency(maxBorrow, 2)}</Typography>
        </Tooltip>
      </Grid>
    </Grid>
  );
}
