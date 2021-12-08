import {
  Avatar,
  DialogContent,
  Grid,
  Typography,
  useMediaQuery,
  CircularProgress,
  Switch,
  DialogActions,
  withStyles,
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Box,
  Link,
  SvgIcon,
} from "@material-ui/core";
import { BigNumber } from "ethers";
import { useState } from "react";
import { USDPricedFuseAsset } from "../../../fuse-sdk/helpers/fetchFusePoolData";
import { useRari } from "../../../fuse-sdk/helpers/RariContext";
import { useTokenData } from "../../../fuse-sdk/hooks/useTokenData";
import { fetchMaxAmount, Mode } from "../../../fuse-sdk/helpers/fetchMaxAmount";
import { TabBar } from "./TabBar";
import { TokenNameAndMaxButton } from "./TokenNameAndMaxButton";
import { StatsColumn } from "./StatsColumn";
import { DialogTitle } from "./DialogTitle";
import { useQuery } from "react-query";
import { useWeb3Context } from "src/hooks";
import { ReactComponent as ArrowUp } from "../../../assets/icons/arrow-up.svg";

enum UserAction {
  NO_ACTION,
  WAITING_FOR_TRANSACTIONS,
}

export enum CTokenErrorCodes {
  NO_ERROR,
  UNAUTHORIZED,
  BAD_INPUT,
  COMPTROLLER_REJECTION,
  COMPTROLLER_CALCULATION_ERROR,
  INTEREST_RATE_MODEL_ERROR,
  INVALID_ACCOUNT_PAIR,
  INVALID_CLOSE_AMOUNT_REQUESTED,
  INVALID_COLLATERAL_FACTOR,
  MATH_ERROR,
  MARKET_NOT_FRESH,
  MARKET_NOT_LISTED,
  TOKEN_INSUFFICIENT_ALLOWANCE,
  TOKEN_INSUFFICIENT_BALANCE,
  TOKEN_INSUFFICIENT_CASH,
  TOKEN_TRANSFER_IN_FAILED,
  TOKEN_TRANSFER_OUT_FAILED,
  UTILIZATION_ABOVE_MAX,
}

// export async function testForCTokenErrorAndSend(txObject: any, caller: string, failMessage: string) {
//   let response = await txObject.call({ from: caller });

//   // For some reason `response` will be `["0"]` if no error but otherwise it will return a string of a number.
//   if (response[0] !== "0") {
//     response = parseInt(response);

//     let err;

//     if (response >= 1000) {
//       const comptrollerResponse = response - 1000;

//       let msg = ComptrollerErrorCodes[comptrollerResponse];

//       if (msg === "BORROW_BELOW_MIN") {
//         msg = "As part of our guarded launch, you cannot borrow less than 0.05 ETH worth of tokens at the moment.";
//       }

//       // This is a comptroller error:
//       err = new Error(failMessage + " Comptroller Error: " + msg);
//     } else {
//       // This is a standard token error:
//       err = new Error(failMessage + " CToken Code: " + CTokenErrorCodes[response]);
//     }

//     LogRocket.captureException(err);
//     throw err;
//   }

//   return txObject.send({ from: caller });
// }

// const fetchGasForCall = async (call: any, amountBN: BN, fuse: Fuse, address: string) => {
//   const estimatedGas = fuse.web3.utils.toBN(
//     (
//       (await call.estimateGas({
//         from: address,
//         // Cut amountBN in half in case it screws up the gas estimation by causing a fail in the event that it accounts for gasPrice > 0 which means there will not be enough ETH (after paying gas)
//         value: amountBN.div(fuse.web3.utils.toBN(2)),
//       })) *
//       // 50% more gas for limit:
//       1.5
//     ).toFixed(0),
//   );

//   // Ex: 100 (in GWEI)
//   const { standard } = await fetch("https://gasprice.poa.network").then(res => res.json());

//   const gasPrice = fuse.web3.utils.toBN(
//     // @ts-ignore For some reason it's returning a string not a BN
//     fuse.web3.utils.toWei(standard.toString(), "gwei"),
//   );

//   const gasWEI = estimatedGas.mul(gasPrice);

//   return { gasWEI, gasPrice, estimatedGas };
// };

export function AmountSelect({
  onClose,
  asset,
  mode,
  setMode,
  borrowLimit,
  comptrollerAddress,
}: {
  onClose: () => any;
  asset: USDPricedFuseAsset;
  mode: Mode;
  setMode: (mode: Mode) => any;
  borrowLimit: number;
  comptrollerAddress: string;
}) {
  const { fuse } = useRari();
  const { scanner, address } = useWeb3Context();

  //   const toast = useToast();

  const tokenData = useTokenData(asset.underlyingToken);

  const [userAction, setUserAction] = useState(UserAction.NO_ACTION);

  const [userEnteredAmount, _setUserEnteredAmount] = useState("");

  const [amount, _setAmount] = useState<BigNumber | null>(() => BigNumber.from(0));

  const showEnableAsCollateral = !asset.membership && mode === Mode.SUPPLY;
  const [enableAsCollateral, setEnableAsCollateral] = useState(showEnableAsCollateral);

  //   const { t } = useTranslation();
  const updateAmount = (newAmount: string) => {
    if (newAmount.startsWith("-")) {
      return;
    }

    _setUserEnteredAmount(newAmount);

    try {
      // Try to set the amount to BigNumber(newAmount):
      const bigAmount = BigNumber.from(newAmount);
      //_setAmount(bigAmount.multipliedBy(10 ** asset.underlyingDecimals));
      _setAmount(bigAmount.mul(10 ** asset.underlyingDecimals));
    } catch (e) {
      // If the number was invalid, set the amount to null to disable confirming:
      _setAmount(null);
    }

    setUserAction(UserAction.NO_ACTION);
  };

  const { data: amountIsValid } = useQuery((amount?.toString() ?? "null") + " " + mode + " isValid", async () => {
    console.log(amount, amount?.isZero());

    if (amount === null || amount.isZero()) {
      return false;
    }

    try {
      const max = await fetchMaxAmount(mode, fuse, address, asset);

      return amount.lte(max!.toString());
    } catch (e) {
      return false;
    }
  });

  let depositOrWithdrawAlert = null;

  if (amount === null || amount.isZero()) {
    if (mode === Mode.SUPPLY) {
      depositOrWithdrawAlert = "Enter a valid amount to supply.";
    } else if (mode === Mode.BORROW) {
      depositOrWithdrawAlert = "Enter a valid amount to borrow.";
    } else if (mode === Mode.WITHDRAW) {
      depositOrWithdrawAlert = "Enter a valid amount to withdraw.";
    } else {
      depositOrWithdrawAlert = "Enter a valid amount to repay.";
    }
  } else if (amountIsValid === undefined) {
    depositOrWithdrawAlert = `Loading your balance of ${asset.underlyingSymbol}...`;
  } else if (!amountIsValid) {
    if (mode === Mode.SUPPLY) {
      depositOrWithdrawAlert = `You don't have enough ${asset.underlyingSymbol}!`;
    } else if (mode === Mode.REPAY) {
      depositOrWithdrawAlert = `You don't have enough ${asset.underlyingSymbol} or are over-repaying!`;
    } else if (mode === Mode.WITHDRAW) {
      depositOrWithdrawAlert = "You cannot withdraw this much!";
    } else if (mode === Mode.BORROW) {
      depositOrWithdrawAlert = "You cannot borrow this much!";
    }
  } else {
    depositOrWithdrawAlert = null;
  }

  const isSmallScreen = useMediaQuery("(max-width: 600px)");

  const length = depositOrWithdrawAlert?.length ?? 0;

  const onConfirm = () => {};
  // const onConfirm = async () => {
  //   try {
  //     setUserAction(UserAction.WAITING_FOR_TRANSACTIONS);

  //     const isETH = asset.underlyingToken === ETH_TOKEN_DATA.address;
  //     const isRepayingMax = amount!.eq(asset.borrowBalance) && !isETH && mode === Mode.REPAY;

  //     isRepayingMax && console.log("Using max repay!");

  //     const max = BigNumber.from(2).pow(256).minus(1).toFixed(0);

  // const amountBN = fuse.web3.utils.toBN(amount!.toFixed(0));

  //     const cToken = new fuse.web3.eth.Contract(
  //       isETH
  //         ? JSON.parse(fuse.compoundContracts["contracts/CEtherDelegate.sol:CEtherDelegate"].abi)
  //         : JSON.parse(fuse.compoundContracts["contracts/CErc20Delegate.sol:CErc20Delegate"].abi),
  //       asset.cToken,
  //     );

  //     if (mode === Mode.SUPPLY || mode === Mode.REPAY) {
  //       if (!isETH) {
  //         const token = new fuse.web3.eth.Contract(
  //           JSON.parse(fuse.compoundContracts["contracts/EIP20Interface.sol:EIP20Interface"].abi),
  //           asset.underlyingToken,
  //         );

  //         const hasApprovedEnough = fuse.web3.utils
  //           .toBN(await token.methods.allowance(address, cToken.options.address).call())
  //           .gte(amountBN);

  //         if (!hasApprovedEnough) {
  //           await token.methods.approve(cToken.options.address, max).send({ from: address });
  //         }

  //         LogRocket.track("Fuse-Approve");
  //       }

  //       if (mode === Mode.SUPPLY) {
  //         // If they want to enable as collateral now, enter the market:
  //         if (enableAsCollateral) {
  //           const comptroller = createComptroller(comptrollerAddress, fuse);
  //           // Don't await this, we don't care if it gets executed first!
  //           comptroller.methods.enterMarkets([asset.cToken]).send({ from: address });

  //           LogRocket.track("Fuse-ToggleCollateral");
  //         }

  //         if (isETH) {
  //           const call = cToken.methods.mint();

  //           if (
  //             // If they are supplying their whole balance:
  //             amountBN.toString() === (await fuse.web3.eth.getBalance(address))
  //           ) {
  //             // Subtract gas for max ETH

  //             const { gasWEI, gasPrice, estimatedGas } = await fetchGasForCall(call, amountBN, fuse, address);

  //             await call.send({
  //               from: address,
  //               value: amountBN.sub(gasWEI),

  //               gasPrice,
  //               gas: estimatedGas,
  //             });
  //           } else {
  //             await call.send({
  //               from: address,
  //               value: amountBN,
  //             });
  //           }
  //         } else {
  //           await testForCTokenErrorAndSend(
  //             cToken.methods.mint(amountBN),
  //             address,
  //             "Cannot deposit this amount right now!",
  //           );
  //         }

  //         LogRocket.track("Fuse-Supply");
  //       } else if (mode === Mode.REPAY) {
  //         if (isETH) {
  //           const call = cToken.methods.repayBorrow();

  //           if (
  //             // If they are repaying their whole balance:
  //             amountBN.toString() === (await fuse.web3.eth.getBalance(address))
  //           ) {
  //             // Subtract gas for max ETH

  //             const { gasWEI, gasPrice, estimatedGas } = await fetchGasForCall(call, amountBN, fuse, address);

  //             await call.send({
  //               from: address,
  //               value: amountBN.sub(gasWEI),

  //               gasPrice,
  //               gas: estimatedGas,
  //             });
  //           } else {
  //             await call.send({
  //               from: address,
  //               value: amountBN,
  //             });
  //           }
  //         } else {
  //           await testForCTokenErrorAndSend(
  //             cToken.methods.repayBorrow(isRepayingMax ? max : amountBN),
  //             address,
  //             "Cannot repay this amount right now!",
  //           );
  //         }

  //         LogRocket.track("Fuse-Repay");
  //       }
  //     } else if (mode === Mode.BORROW) {
  //       await testForCTokenErrorAndSend(
  //         cToken.methods.borrow(amountBN),
  //         address,
  //         "Cannot borrow this amount right now!",
  //       );

  //       LogRocket.track("Fuse-Borrow");
  //     } else if (mode === Mode.WITHDRAW) {
  //       await testForCTokenErrorAndSend(
  //         cToken.methods.redeemUnderlying(amountBN),
  //         address,
  //         "Cannot withdraw this amount right now!",
  //       );

  //       LogRocket.track("Fuse-Withdraw");
  //     }

  //     queryClient.refetchQueries();

  //     // Wait 2 seconds for refetch and then close modal.
  //     // We do this instead of waiting the refetch because some refetches take a while or error out and we want to close now.
  //     await new Promise(resolve => setTimeout(resolve, 2000));

  //     onClose();
  //   } catch (e) {
  //     handleGenericError(e, toast);
  //     setUserAction(UserAction.NO_ACTION);
  //   }
  // };

  return userAction === UserAction.WAITING_FOR_TRANSACTIONS ? (
    <>
      <DialogTitle onClose={onClose}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <CircularProgress size={40} />
          </Grid>
          <Grid item>
            <Typography variant="h5">{"Check your wallet to submit the transactions"}</Typography>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Typography variant="h5">{"Do not close this tab until you submit all transactions!"}</Typography>
      </DialogContent>
    </>
  ) : (
    <>
      <DialogTitle onClose={onClose}>
        <Grid container alignItems="center" spacing={1} justifyContent="center">
          <Grid item>
            <Avatar
              className={"avatar-medium"}
              component="span"
              src={
                tokenData?.logoURL ??
                "https://raw.githubusercontent.com/feathericons/feather/master/icons/help-circle.svg"
              }
            />
          </Grid>
          <Grid item>
            <Typography variant="h5" component="span">
              {!isSmallScreen && asset.underlyingName.length < 25 ? asset.underlyingName : asset.underlyingSymbol}
            </Typography>
            <Link href={`${scanner}/token/${asset.underlyingToken}`} target="_blank">
              <Typography variant="body2">
                View contract <SvgIcon className={"view-contract-icon"} component={ArrowUp} />
              </Typography>
            </Link>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent className="pool-modal-content">
        <Grid container spacing={3} direction="column" justifyContent="space-around">
          <Grid item>
            <TabBar mode={mode} setMode={setMode} />
          </Grid>
          <Grid item>
            <FormControl variant="outlined" color="primary" fullWidth>
              <InputLabel htmlFor="outlined-adornment-amount">Amount</InputLabel>
              <OutlinedInput
                id="outlined-adornment-amount"
                type="number"
                fullWidth
                value={userEnteredAmount}
                onChange={e => updateAmount(e.target.value)}
                // startAdornment={<InputAdornment position="start">$</InputAdornment>}
                labelWidth={55}
                endAdornment={
                  <InputAdornment position="end">
                    <TokenNameAndMaxButton mode={mode} asset={asset} updateAmount={updateAmount} />
                  </InputAdornment>
                }
              />
            </FormControl>
          </Grid>

          <StatsColumn
            symbol={tokenData?.symbol ?? asset.underlyingSymbol}
            amount={amount ? parseInt(amount.toNumber().toFixed(0)) : 0}
            asset={asset}
            mode={mode}
            enableAsCollateral={enableAsCollateral}
            borrowLimit={borrowLimit}
          />

          {showEnableAsCollateral ? (
            <Grid item>
              <Box display="flex" alignItems="baseline" justifyContent="space-between">
                <Typography>Enable As Collateral</Typography>
                <OrangeSwitch
                  checked={enableAsCollateral}
                  onChange={() => {
                    setEnableAsCollateral(past => !past);
                  }}
                />
              </Box>
            </Grid>
          ) : null}
        </Grid>
      </DialogContent>
      <DialogActions disableSpacing>
        <Button
          variant="contained"
          color="primary"
          className={`connect-button ${!amountIsValid ? "claim-disable" : ""}`}
          onClick={onConfirm}
          disabled={!amountIsValid}
        >
          {depositOrWithdrawAlert || "Confirm"}
        </Button>
      </DialogActions>
    </>
  );
}

const OrangeSwitch = withStyles({
  switchBase: {
    color: "#ff9900",
    "&$checked": {
      color: "#ff9900",
    },
    "&$checked + $track": {
      backgroundColor: "#ff9900",
    },
  },
  checked: {},
  track: {},
})(Switch);
