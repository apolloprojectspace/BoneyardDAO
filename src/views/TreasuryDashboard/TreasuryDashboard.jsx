import { useEffect, useState } from "react";
import { Paper, Grid, Typography, Box, Zoom, Container, useMediaQuery } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { useSelector } from "react-redux";
import Chart from "../../components/Chart/Chart.jsx";
import { trim, formatCurrency } from "../../helpers";
import {
  treasuryDataQuery,
  rebasesV1DataQuery,
  rebasesV2DataQuery,
  bulletpoints,
  tooltipItems,
  tooltipInfoMessages,
  itemType,
} from "./treasuryData.js";
import { useTheme } from "@material-ui/core/styles";
import "./treasury-dashboard.scss";
import apollo from "../../lib/apolloClient";
import InfoTooltip from "src/components/InfoTooltip/InfoTooltip.jsx";
import { allBondsMap } from "src/helpers/all-bonds/AllBonds";

function TreasuryDashboard() {
  const [data, setData] = useState(null);
  const [apy, setApy] = useState([]);
  const [runway, setRunway] = useState(null);
  const [staked, setStaked] = useState(null);
  const theme = useTheme();
  const smallerScreen = useMediaQuery("(max-width: 650px)");
  const verySmallScreen = useMediaQuery("(max-width: 379px)");

  const marketPrice = useSelector(state => {
    return state.app.marketPrice;
  });
  const circSupply = useSelector(state => {
    return state.app.circSupply;
  });
  const totalSupply = useSelector(state => {
    return state.app.totalSupply;
  });
  const marketCap = useSelector(state => {
    return state.app.marketCap;
  });
  const currentIndex = useSelector(state => {
    return state.app.currentIndex;
  });
  const rebase = useSelector(state => {
    return state.app.stakingRebase;
  });
  const backingPerHec = useSelector(state => {
    if (state.bonding.loading === false) {
      let tokenBalances = state.app.investments ?? 0;
      for (const bond in allBondsMap) {
        if (state.bonding[bond] && !allBondsMap[bond].isOld) {
          tokenBalances += state.bonding[bond].purchased;
        }
      }
      return tokenBalances / state.app.circSupply;
    }
  });

  const wsHecPrice = useSelector(state => {
    return state.app.marketPrice * state.app.currentIndex;
  });

  useEffect(() => {
    apollo(treasuryDataQuery).then(r => {
      let metrics = r?.data?.protocolMetrics.map(entry =>
        Object.entries(entry).reduce((obj, [key, value]) => ((obj[key] = parseFloat(value)), obj), {}),
      );
      let staked = r?.data?.protocolMetrics.map(entry => ({
        staked: (parseFloat(entry.sHecCirculatingSupply) / parseFloat(entry.hecCirculatingSupply)) * 100,
        timestamp: entry.timestamp,
      }));

      if (staked) {
        staked = staked.filter(pm => pm.staked < 100);
        setStaked(staked);
      }

      if (metrics) {
        metrics = metrics.filter(pm => pm.treasuryMarketValue > 0);
        setData(metrics);
        const runway = metrics.filter(pm => pm.runwayCurrent > 5);
        setRunway(runway);
      }
    });

    apollo(rebasesV1DataQuery).then(r => {
      let apy = r?.data?.rebases.map(entry => ({
        apy: Math.pow(parseFloat(entry.percentage) + 1, 365 * 3) * 100,
        timestamp: entry.timestamp - (entry.timestamp % (3600 * 4)),
      }));
      if (apy) {
        apy = apy.filter(pm => pm.apy < 5000000);
        setApy(apy);
      }
    });
  }, []);

  return (
    <div id="treasury-dashboard-view" className={`${smallerScreen && "smaller"} ${verySmallScreen && "very-small"}`}>
      <Container
        style={{
          paddingLeft: smallerScreen || verySmallScreen ? "0" : "3.3rem",
          paddingRight: smallerScreen || verySmallScreen ? "0" : "3.3rem",
        }}
      >
        <Box className={`hero-metrics`}>
          <Paper className="hec-card">
            <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="center">
              <Box className="metric market">
                <Typography variant="h6" color="textSecondary">
                  Market Cap
                </Typography>
                <Typography variant="h5">
                  {marketCap && formatCurrency(marketCap, 0)}
                  {!marketCap && <Skeleton type="text" />}
                </Typography>
              </Box>

              <Box className="metric price">
                <Typography variant="h6" color="textSecondary">
                  HEC Price
                </Typography>
                <Typography variant="h5">
                  {/* appleseed-fix */}
                  {marketPrice ? formatCurrency(marketPrice, 2) : <Skeleton type="text" />}
                </Typography>
              </Box>

              <Box className="metric wsoprice">
                <Typography variant="h6" color="textSecondary">
                  wsHEC Price
                  <InfoTooltip
                    message={
                      "wsHEC = sHEC * index\n\nThe price of wsHEC is equal to the price of HEC multiplied by the current index"
                    }
                  />
                </Typography>

                <Typography variant="h5">
                  {wsHecPrice ? formatCurrency(wsHecPrice, 2) : <Skeleton type="text" />}
                </Typography>
              </Box>

              <Box className="metric circ">
                <Typography variant="h6" color="textSecondary">
                  Circulating Supply (total)
                </Typography>
                <Typography variant="h5">
                  {circSupply && totalSupply ? (
                    parseInt(circSupply) + " / " + parseInt(totalSupply)
                  ) : (
                    <Skeleton type="text" />
                  )}
                </Typography>
              </Box>

              <Box className="metric bpo">
                <Typography variant="h6" color="textSecondary">
                  Backing per HEC
                </Typography>
                <Typography variant="h5">
                  {backingPerHec ? formatCurrency(backingPerHec, 2) : <Skeleton type="text" />}
                </Typography>
              </Box>

              <Box className="metric index">
                <Typography variant="h6" color="textSecondary">
                  Current Index
                  <InfoTooltip
                    message={
                      "The current index tracks the amount of sHEC accumulated since the beginning of staking. Basically, how much sHEC one would have if they staked and held a single HEC from day 1."
                    }
                  />
                </Typography>
                <Typography variant="h5">
                  {currentIndex ? trim(currentIndex, 2) + " sHEC" : <Skeleton type="text" />}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        <Zoom in={true}>
          <Grid container spacing={2} className="data-grid">
            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Paper className="hec-card hec-chart-card">
                <Chart
                  type="area"
                  data={data}
                  dataKey={["totalValueLocked"]}
                  stopColor={[["#768299", "#98B3E9"]]}
                  headerText="Total Value Deposited"
                  headerSubText={`${data && formatCurrency(data[0].totalValueLocked)}`}
                  bulletpointColors={bulletpoints.tvl}
                  itemNames={tooltipItems.tvl}
                  itemType={itemType.dollar}
                  infoTooltipMessage={tooltipInfoMessages.tvl}
                  expandedGraphStrokeColor={theme.palette.graphStrokeColor}
                />
              </Paper>
            </Grid>

            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Paper className="hec-card hec-chart-card">
                <Chart
                  type="stack"
                  data={data}
                  dataKey={[
                    "treasuryDaiMarketValue",
                    "treasuryUsdcMarketValue",
                    "treasuryMIMMarketValue",
                    "treasuryFRAXMarketValue",
                    "treasuryGOHMMarketValue",
                    "treasuryWFTMMarketValue",
                    "treasuryBOOMarketValue"
                  ]}
                  stopColor={[
                    ["#F5AC37", "#EA9276"],
                    ["#768299", "#98B3E9"],
                    ["#8351ff", "#b151ff"],
                    ["#c6c6c6", "#545454"],
                    ["#ffffff", "#d5d5d5"],
                    ["#22d5e7", "#18919d"],
                    ["#DBE722", "#9D9D18"],
                  ]}
                  headerText="Market Value of Treasury Assets"
                  headerSubText={`${data && formatCurrency(data[0].treasuryMarketValue)}`}
                  bulletpointColors={bulletpoints.coin}
                  itemNames={tooltipItems.coin}
                  itemType={itemType.dollar}
                  infoTooltipMessage={tooltipInfoMessages.mvt}
                  expandedGraphStrokeColor={theme.palette.graphStrokeColor}
                />
              </Paper>
            </Grid>

            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Paper className="hec-card hec-chart-card">
                <Chart
                  type="stack"
                  data={data}
                  format="currency"
                  dataKey={[
                    "treasuryDaiRiskFreeValue",
                    "treasuryUsdcRiskFreeValue",
                    "treasuryMIMRiskFreeValue",
                    "treasuryFRAXRiskFreeValue",
                    "treasuryGOHMRiskFreeValue",
                    "treasuryWFTMRiskFreeValue",
                    "treasuryBOORiskFreeValue"
                  ]}
                  stopColor={[
                    ["#F5AC37", "#EA9276"],
                    ["#768299", "#98B3E9"],
                    ["#8351ff", "#b151ff"],
                    ["#c6c6c6", "#545454"],
                    ["#ffffff", "#d5d5d5"],
                    ["#22d5e7", "#18919d"],
                    ["#DBE722", "#9D9D18"],
                  ]}
                  headerText="Risk Free Value of Treasury Assets"
                  headerSubText={`${data && formatCurrency(data[0].treasuryRiskFreeValue)}`}
                  bulletpointColors={bulletpoints.coin}
                  itemNames={tooltipItems.coin}
                  itemType={itemType.dollar}
                  infoTooltipMessage={tooltipInfoMessages.rfv}
                  expandedGraphStrokeColor={theme.palette.graphStrokeColor}
                />
              </Paper>
            </Grid>

            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Paper className="hec-card hec-chart-card">
                <Chart
                  type="area"
                  data={data}
                  dataKey={["treasuryHecDaiPOL"]}
                  stopColor={[["rgba(128, 204, 131, 1)", "rgba(128, 204, 131, 0)"]]}
                  headerText="Protocol Owned Liquidity HEC-DAI"
                  headerSubText={`${data && trim(data[0].treasuryHecDaiPOL, 2)}% `}
                  dataFormat="percent"
                  bulletpointColors={bulletpoints.pol}
                  itemNames={tooltipItems.pol}
                  itemType={itemType.percentage}
                  infoTooltipMessage={tooltipInfoMessages.pol}
                  expandedGraphStrokeColor={theme.palette.graphStrokeColor}
                  isPOL={true}
                />
              </Paper>
            </Grid>

            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Paper className="hec-card hec-chart-card">
                <Chart
                  type="area"
                  data={staked}
                  dataKey={["staked"]}
                  stopColor={[["#55EBC7", "#47ACEB"]]}
                  headerText="HEC Staked"
                  dataFormat="percent"
                  headerSubText={`${staked && trim(staked[0].staked, 2)}% `}
                  isStaked={true}
                  bulletpointColors={bulletpoints.staked}
                  infoTooltipMessage={tooltipInfoMessages.staked}
                  expandedGraphStrokeColor={theme.palette.graphStrokeColor}
                />
              </Paper>
            </Grid>

            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Paper className="hec-card hec-chart-card">
                <Chart
                  type="line"
                  data={runway}
                  dataKey={["runwayCurrent"]}
                  color={theme.palette.text.primary}
                  stroke={[theme.palette.text.primary]}
                  headerText="Runway Available"
                  headerSubText={`${data && trim(data[0].runwayCurrent, 1)} Days`}
                  dataFormat="days"
                  bulletpointColors={bulletpoints.runway}
                  itemNames={tooltipItems.runway}
                  itemType={""}
                  infoTooltipMessage={tooltipInfoMessages.runway}
                  expandedGraphStrokeColor={theme.palette.graphStrokeColor}
                />
              </Paper>
            </Grid>
          </Grid>
        </Zoom>
      </Container>
    </div>
  );
}

export default TreasuryDashboard;
