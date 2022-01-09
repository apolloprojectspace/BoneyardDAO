import { Button, Tooltip, Typography } from "@material-ui/core";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { trim } from "src/helpers";
import { isPendingTxn, txnButtonText } from "src/slices/PendingTxnsSlice";
import "./warm-up.scss";
import RebaseTimer from "../RebaseTimer/RebaseTimer";

const useStyles = makeStyles(theme =>
  createStyles({
    customWidth: {
      maxWidth: 250,
      fontSize: theme.typography.pxToRem(14),
      backgroundColor: theme.palette.common.black,
    },
  }),
);

interface Props {
  depositAmount: number;
  trimmedWarmUpAmount: number;
  warmupRebaseTime: number;
  pendingTransactions: any;
  onClaim: () => void;
  onFofeit: () => void;
}
export default function WarmUp({
  depositAmount,
  trimmedWarmUpAmount,
  warmupRebaseTime,
  pendingTransactions,
  onClaim,
  onFofeit,
}: Props) {
  const classes = useStyles();

  return (
    <div className={"warm-up MuiPaper-root hec-card "}>
      <>
        <div className="card-header header">
          <div className="title">
            <Typography variant="h5">Warm Up Details</Typography>
            <RebaseTimer />
          </div>

          <Tooltip
            arrow
            title="Choosing to Forfeit will return your original HEC amount without any of the accumulated rewards for the first 3 rebases."
            classes={{ tooltip: classes.customWidth }}
          >
            <HelpOutlineIcon />
          </Tooltip>
        </div>
        <div className={"details "}>
          <div className={"initial-amount"}>
            <div className="MuiTypography-body1">Inital Amount</div>
            <div className="MuiTypography-body1">{trim(depositAmount, 4)}</div>
          </div>
          <div className={"rewards-gained"}>
            <div className="MuiTypography-body1">Rewards Gained</div>
            <div className="MuiTypography-body1">
              {trimmedWarmUpAmount ? trim(trimmedWarmUpAmount - depositAmount, 4) : 0}
            </div>
          </div>
          <div className={"remaining-rebases"}>
            <div className="MuiTypography-body1">Rebase(s) left</div>
            <div className="MuiTypography-body1">
              {warmupRebaseTime <= 0 ? "finished" : <div>{warmupRebaseTime}</div>}
            </div>
          </div>
          <div className={"claim-forfeit"}>
            {warmupRebaseTime >= 1 ? (
              <>
                <Button
                  className="exit-button claim-disable"
                  variant="outlined"
                  color="primary"
                  disabled={true}
                  onClick={onClaim}
                >
                  {txnButtonText(pendingTransactions, "claiming", "Claim")}
                </Button>
                <Button
                  className="exit-button"
                  variant="outlined"
                  color="primary"
                  disabled={isPendingTxn(pendingTransactions, "forfeiting")}
                  onClick={onFofeit}
                >
                  {txnButtonText(pendingTransactions, "forfeiting", "Forfeit")}
                </Button>
              </>
            ) : (
              <Button
                className="stake-button"
                variant="outlined"
                color="primary"
                disabled={isPendingTxn(pendingTransactions, "claiming")}
                onClick={() => {
                  onClaim();
                }}
              >
                {txnButtonText(pendingTransactions, "claiming", "Claim")}
              </Button>
            )}
          </div>
        </div>
      </>
    </div>
  );
}
