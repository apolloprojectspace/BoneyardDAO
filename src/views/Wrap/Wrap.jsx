import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  Link,
  OutlinedInput,
  Paper,
  Tab,
  Tabs,
  Typography,
  Zoom,
  SvgIcon,
  makeStyles,
} from "@material-ui/core";
import TabPanel from "../../components/TabPanel";
import InfoTooltip from "../../components/InfoTooltip/InfoTooltip.jsx";
import { ReactComponent as InfoIcon } from "../../assets/icons/info-fill.svg";
import { trim, formatCurrency } from "../../helpers";
import { changeApproval, changeWrap } from "../../slices/WrapThunk";
import "../Stake/stake.scss";
import { useWeb3Context } from "src/hooks/web3Context";
import { isPendingTxn, txnButtonText } from "src/slices/PendingTxnsSlice";
import { Skeleton } from "@material-ui/lab";
import { error } from "../../slices/MessagesSlice";
import { ethers } from "ethers";
import "./wrap.scss";

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const useStyles = makeStyles(theme => ({
  textHighlight: {
    color: theme.palette.highlight,
  },
}));

function Wrap() {
  const dispatch = useDispatch();
  const { provider, address, connected, connect, chainID } = useWeb3Context();

  const [zoomed, setZoomed] = useState(false);
  const [view, setView] = useState(0);
  const [quantity, setQuantity] = useState("");
  const classes = useStyles();

  const isAppLoading = useSelector(state => state.app.loading);
  const currentIndex = useSelector(state => {
    return state.app.currentIndex;
  });

  const sHECPrice = useSelector(state => {
    return state.app.marketPrice;
  });

  const wsHECPrice = useSelector(state => {
    return state.app.marketPrice * state.app.currentIndex;
  });

  const sHecBalance = useSelector(state => {
    return state.account.balances && state.account.balances.shec;
  });
  const wsHecBalance = useSelector(state => {
    return state.account.balances && state.account.balances.wshec;
  });
  const wrapAllowance = useSelector(state => {
    return state.account.wrapping && state.account.wrapping.hecWrap;
  });
  const unwrapAllowance = useSelector(state => {
    return state.account.wrapping && state.account.wrapping.hecUnwrap;
  });

  const pendingTransactions = useSelector(state => {
    return state.pendingTransactions;
  });

  const setMax = () => {
    if (view === 0) {
      setQuantity(sHecBalance);
    } else {
      setQuantity(wsHecBalance);
    }
  };

  const onSeekApproval = async token => {
    await dispatch(changeApproval({ address, token, provider, networkID: chainID }));
  };

  const onChangeWrap = async action => {
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(quantity) || Number(quantity) === 0 || quantity === "") {
      // eslint-disable-next-line no-alert
      return dispatch(error("Please enter a value!"));
    }

    // 1st catch if quantity > balance
    if (
      action === "wrap" &&
      ethers.utils.parseUnits(quantity, "gwei").gt(ethers.utils.parseUnits(sHecBalance, "gwei"))
    ) {
      return dispatch(error("You cannot wrap more than your sHEC balance."));
    }

    if (
      action === "unwrap" &&
      ethers.utils.parseUnits(quantity, "ether").gt(ethers.utils.parseUnits(wsHecBalance, "ether"))
    ) {
      return dispatch(error("You cannot unwrap more than your wsHEC balance."));
    }

    await dispatch(changeWrap({ address, action, value: quantity.toString(), provider, networkID: chainID }));
  };

  const hasAllowance = useCallback(
    token => {
      if (token === "sHEC") return wrapAllowance > 0;
      if (token === "wsHEC") return wrapAllowance > 0;
      return 0;
    },
    [wrapAllowance, unwrapAllowance],
  );

  const isAllowanceDataLoading = (wrapAllowance == null && view === 0) || (unwrapAllowance == null && view === 1);

  const isUnwrap = view === 1;
  const convertedQuantity = isUnwrap ? (quantity * wsHECPrice) / sHECPrice : (quantity * sHECPrice) / wsHECPrice;

  let modalButton = [];

  modalButton.push(
    <Button variant="contained" color="primary" className="connect-button" onClick={connect} key={1}>
      Connect Wallet
    </Button>,
  );

  const changeView = (event, newView) => {
    setView(newView);
  };

  return (
    <div id="stake-view">
      <Zoom in={true} onEntered={() => setZoomed(true)}>
        <Paper className={`hec-card`}>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <div className="card-header">
                <Typography variant="h5">Wrap / Unwrap</Typography>
                {/* <Link
                  className="migrate-sHEC-button"
                  style={{ textDecoration: "none" }}
                  href="https://docs.olympusdao.finance/main/contracts/tokens#wsHEC"
                  aria-label="wsHec-wut"
                  target="_blank"
                > */}
                <Typography>wsHEC</Typography>
                {/* <SvgIcon component={InfoIcon} color="primary" /> */}
                {/* </Link> */}
              </div>
            </Grid>

            <Grid item>
              <div className="stake-top-metrics">
                <Grid container spacing={2} alignItems="flex-end">
                  <Grid item xs={12} sm={4} md={4} lg={4}>
                    <div className="wrap-sHEC">
                      <Typography variant="h5" color="textSecondary">
                        sHEC Price
                      </Typography>
                      <Typography variant="h4">
                        {sHECPrice ? formatCurrency(sHECPrice, 2) : <Skeleton width="150px" />}
                      </Typography>
                    </div>
                  </Grid>
                  <Grid item xs={12} sm={4} md={4} lg={4}>
                    <div className="wrap-index">
                      <Typography variant="h5" color="textSecondary">
                        Current Index
                      </Typography>
                      <Typography variant="h4">
                        {currentIndex ? <>{trim(currentIndex, 2)} HEC</> : <Skeleton width="150px" />}
                      </Typography>
                    </div>
                  </Grid>
                  <Grid item xs={12} sm={4} md={4} lg={4}>
                    <div className="wrap-wsHEC">
                      <Typography variant="h5" color="textSecondary">
                        wsHEC Price
                        <InfoTooltip
                          message={
                            "wsHEC = sHEC * index\n\nThe price of wsHEC is equal to the price of HEC multiplied by the current index"
                          }
                        />
                      </Typography>
                      <Typography variant="h4">
                        {wsHECPrice ? formatCurrency(wsHECPrice, 2) : <Skeleton width="150px" />}
                      </Typography>
                    </div>
                  </Grid>
                </Grid>
              </div>
            </Grid>

            <div className="staking-area">
              {!address ? (
                <div className="stake-wallet-notification">
                  <div className="wallet-menu" id="wallet-menu">
                    {modalButton}
                  </div>
                  <Typography variant="h6">Connect your wallet to wrap sHEC</Typography>
                </div>
              ) : (
                <>
                  <Box className="stake-action-area">
                    <Tabs
                      key={String(zoomed)}
                      centered
                      value={view}
                      textColor="primary"
                      indicatorColor="primary"
                      className="stake-tab-buttons"
                      onChange={changeView}
                      aria-label="stake tabs"
                    >
                      <Tab label="Wrap" {...a11yProps(0)} />
                      <Tab label="Unwrap" {...a11yProps(1)} />
                    </Tabs>
                    <Box className="stake-action-row " display="flex" alignItems="center" style={{ paddingBottom: 0 }}>
                      {address && !isAllowanceDataLoading ? (
                        !hasAllowance("sHEC") && view === 0 ? (
                          <Box className="help-text">
                            <Typography variant="body1" className="stake-note" color="textSecondary">
                              {view === 0 && (
                                <>
                                  First time wrapping <b>sHEC</b>?
                                  <br />
                                  Please approve Hector Dao to use your <b>sHEC</b> for wrapping.
                                </>
                              )}
                            </Typography>
                          </Box>
                        ) : (
                          <FormControl className="HEC-input" variant="outlined" color="primary">
                            <InputLabel htmlFor="amount-input"></InputLabel>
                            <OutlinedInput
                              id="amount-input"
                              type="number"
                              placeholder="Enter an amount"
                              className="stake-input"
                              value={quantity}
                              onChange={e => setQuantity(e.target.value)}
                              labelWidth={0}
                              endAdornment={
                                <InputAdornment position="end">
                                  <Button variant="text" onClick={setMax} color="inherit">
                                    Max
                                  </Button>
                                </InputAdornment>
                              }
                            />
                          </FormControl>
                        )
                      ) : (
                        <Skeleton width="150px" />
                      )}

                      <TabPanel value={view} index={0} className="stake-tab-panel">
                        {address && hasAllowance("sHEC") ? (
                          <Button
                            className="stake-button"
                            variant="contained"
                            color="primary"
                            disabled={isPendingTxn(pendingTransactions, "wrapping")}
                            onClick={() => {
                              onChangeWrap("wrap");
                            }}
                          >
                            {txnButtonText(pendingTransactions, "wrapping", "Wrap sHEC")}
                          </Button>
                        ) : (
                          <Button
                            className="stake-button"
                            variant="contained"
                            color="primary"
                            disabled={isPendingTxn(pendingTransactions, "approve_wrapping")}
                            onClick={() => {
                              onSeekApproval("shec");
                            }}
                          >
                            {txnButtonText(pendingTransactions, "approve_wrapping", "Approve")}
                          </Button>
                        )}
                      </TabPanel>

                      <TabPanel value={view} index={1} className="stake-tab-panel">
                        <Button
                          className="stake-button"
                          variant="contained"
                          color="primary"
                          disabled={isPendingTxn(pendingTransactions, "unwrapping")}
                          onClick={() => {
                            onChangeWrap("unwrap");
                          }}
                        >
                          {txnButtonText(pendingTransactions, "unwrapping", "Unwrap sHEC")}
                        </Button>
                      </TabPanel>
                    </Box>

                    {quantity && (
                      <Box padding={1}>
                        <Typography variant="body2" className={classes.textHighlight}>
                          {isUnwrap
                            ? `Unwrapping ${quantity} wsHEC will result in ${trim(convertedQuantity, 4)} sHEC`
                            : `Wrapping ${quantity} sHEC will result in ${trim(convertedQuantity, 4)} wsHEC`}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <div className={`stake-user-data`}>
                    <div className="data-row">
                      <Typography variant="body1">Wrappable Balance</Typography>
                      <Typography variant="body1">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{trim(sHecBalance, 4)} sHEC</>}
                      </Typography>
                    </div>
                    <div className="data-row">
                      <Typography variant="body1">Unwrappable Balance</Typography>
                      <Typography variant="body1">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{trim(wsHecBalance, 4)} wsHEC</>}
                      </Typography>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Grid>
        </Paper>
      </Zoom>
    </div>
  );
}

export default Wrap;
