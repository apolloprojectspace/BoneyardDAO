import "./pool-farming.scss"
import TabPanel from "../../components/TabPanel";
import { useCallback, useState } from "react";
import {
    Typography,
    OutlinedInput,
    InputAdornment,
    Tabs,
    Tab,
    Button,
    FormControl,
    InputLabel
} from "@material-ui/core";

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function PoolFarming() {
    // Change Tabs
    const [tabValue, setTabValue] = useState(0)
    const changeTab = (event: any, newTabValue: number) => {
        setTabValue(newTabValue);
    }

    return (
        <div className="pool-farming">
            {/* <div className="hero-metrics"> */}
            <div className="MuiPaper-root hec-card">
                <div className="pool-stats">
                    <div className="metric">
                        <Typography className="center-text" variant="h6" color="textSecondary">
                            TVL
                        </Typography>
                        <Typography className="center-text" variant="h5">
                            $123,456,789
                        </Typography>
                    </div>
                    <div className="metric">
                        <Typography className="center-text" variant="h6" color="textSecondary">
                            Begin Time
                        </Typography>
                        <Typography className="center-text" variant="h5">
                            Fri Jan 14 2022 12:32:16 GMT-0500 (EST)
                        </Typography>
                    </div>
                    <div className="metric">
                        <Typography className="center-text" variant="h6" color="textSecondary">
                            APR
                        </Typography>
                        <Typography className="center-text" variant="h5">
                            1234.56%
                        </Typography>
                    </div>
                    <div className="metric">
                        <Typography className="center-text" variant="h6" color="textSecondary">
                            End Time
                        </Typography>
                        <Typography className="center-text" variant="h5">
                            Fri Jan 21 2022 12:32:16 GMT-0500 (EST)
                        </Typography>
                    </div>

                </div>
            </div>
            {/* </div> */}

            <div className="MuiPaper-root hec-card">
                <div className="card-header header">
                    <Typography variant="h5">Investment Optimization</Typography>
                </div>
                <div className="invest-opt">
                    <div className="invest-opt-coins-row">
                        <div className="metric metric-box">
                            <Typography className="center-text" variant="h6" color="textSecondary">
                                HUGS
                            </Typography>
                            <Typography className="center-text" variant="h5">
                                $123,456
                            </Typography>
                        </div>
                        <div className="metric metric-box">
                            <Typography className="center-text" variant="h6" color="textSecondary">
                                DAI
                            </Typography>
                            <Typography className="center-text" variant="h5">
                                $123,456,789
                            </Typography>
                        </div>
                        <div className="metric metric-box">
                            <Typography className="center-text" variant="h6" color="textSecondary">
                                USDC
                            </Typography>
                            <Typography className="center-text" variant="h5">
                                $123
                            </Typography>
                        </div>
                    </div>
                    <div className="invest-opt-input-row">
                        <Typography className="center-text" variant="h6">Initial Investment ($)</Typography>
                        <OutlinedInput
                            type="number"
                            placeholder="Amount"
                            className="invest-opt-input"
                            value="0"
                            // onChange={e => setsHecAmount(e.target.value)}
                            labelWidth={0}
                        />
                    </div>
                </div>
            </div>
            <div className="MuiPaper-root hec-card box-1">
                <div className="card-header header">
                    <Typography variant="h5">Your Investment</Typography>
                </div>
                <div className="your-invest">
                    <div className="your-invest-coins-row">
                        <div className="metric metric-box">
                            <Typography className="center-text" variant="h6" color="textSecondary">
                                HUGS
                            </Typography>
                            <Typography className="center-text" variant="h5">
                                $123,456
                            </Typography>
                        </div>
                        <div className="metric metric-box">
                            <Typography className="center-text" variant="h6" color="textSecondary">
                                DAI
                            </Typography>
                            <Typography className="center-text" variant="h5">
                                $123,456,789
                            </Typography>
                        </div>
                        <div className="metric metric-box">
                            <Typography className="center-text" variant="h6" color="textSecondary">
                                USDC
                            </Typography>
                            <Typography className="center-text" variant="h5">
                                $123
                            </Typography>
                        </div>
                    </div>
                    <div className="your-invest-tabs-row">
                        <Tabs
                            centered
                            textColor="primary"
                            indicatorColor="primary"
                            className="stake-tab-buttons"
                            value={tabValue}
                            onChange={changeTab}
                            aria-label="your investment tabs"
                        >
                            <Tab label="Stake" {...a11yProps(0)} />
                            <Tab label="Unstake" {...a11yProps(1)} />
                            {/* <Tab label="Claim" {...a11yProps(2)} /> */}
                        </Tabs>
                        <TabPanel value={tabValue} index={0}>
                            <div className="invest-action-row">
                                <FormControl className="hec-input" variant="outlined" color="primary">
                                    <InputLabel htmlFor="amount-input"></InputLabel>
                                    <OutlinedInput
                                        id="stake-lp-input"
                                        type="number"
                                        placeholder="Enter an amount"
                                        className=""
                                        value={"0"}
                                        // onChange={e => setOldQuantity(e.target.value)}
                                        labelWidth={0}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <Button variant="text" color="inherit">
                                                    Max
                                                </Button>
                                            </InputAdornment>
                                        }
                                    />
                                </FormControl>
                                <Button
                                    className=""
                                    variant="contained"
                                    color="primary"
                                >Stake LP Token</Button>
                            </div>
                        </TabPanel>
                        <TabPanel value={tabValue} index={1}>
                            <div className="invest-action-row">
                                <FormControl className="hec-input" variant="outlined" color="primary">
                                    <InputLabel htmlFor="amount-input"></InputLabel>
                                    <OutlinedInput
                                        id="unstake-lp-input"
                                        type="number"
                                        placeholder="Enter an amount"
                                        className=""
                                        value={"0"}
                                        // onChange={e => setOldQuantity(e.target.value)}
                                        labelWidth={0}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <Button variant="text" color="inherit">
                                                    Max
                                                </Button>
                                            </InputAdornment>
                                        }
                                    />
                                </FormControl>
                                <Button
                                    className=""
                                    variant="contained"
                                    color="primary"
                                >Unstake LP Token</Button>
                            </div>
                        </TabPanel>
                    </div>
                    <div className="your-invest-data-row">
                        <div className="data-row">
                            <Typography variant="body1">LP Token Balance</Typography>
                            <Typography variant="body1">123</Typography>
                        </div>
                        <div className="data-row">
                            <Typography variant="body1">Staked LP Token</Typography>
                            <Typography variant="body1">456</Typography>
                        </div>
                        <div className="data-row">
                            <Typography variant="body1">Investment Value</Typography>
                            <Typography variant="body1">$456,789</Typography>
                        </div>
                        <div className="data-row">
                            <Typography variant="body1">Earned Rewards</Typography>
                            <Typography variant="body1">123.456 FTM ($123.456)</Typography>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}