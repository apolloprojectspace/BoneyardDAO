import { Paper, Typography, Select, Grid, useMediaQuery } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React, { useState } from "react";
import { Asset, shortUsdFormatter } from "./Borrow";
import CaptionedStat from "./CaptionedStat";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { USDPricedFuseAsset } from "../../fuse-sdk/helpers/fetchFusePoolData";
import { useTokenData, useTokensData } from "../../fuse-sdk/hooks/useTokenData";

export function AssetAndOtherInfo({ assets }: { assets: USDPricedFuseAsset[] }) {
  const [selectedAsset, setSelectedAsset] = useState(assets.length > 3 ? assets[2] : assets[0]);
  const selectedTokenData = useTokenData(selectedAsset.underlyingToken);
  // const selectedTokenData = selectedAsset.tokenData; //useTokenData(selectedAsset.underlyingToken);
  //   const { data } = useQuery(selectedAsset.cToken + " curves", async () => {
  //     const interestRateModel = await fuse.getInterestRateModel(selectedAsset.cToken);

  //     if (interestRateModel === null) {
  //       return { borrowerRates: null, supplierRates: null };
  //     }

  //     return convertIRMtoCurve(interestRateModel, fuse);
  //   });
  const data = {};
  const isSmallScreen = useMediaQuery("(max-width: 600px)");
  const chartData = [
    {
      name: "Page A",
      uv: 4000,
      pv: 2400,
      amt: 2400,
    },
    {
      name: "Page B",
      uv: 3000,
      pv: 1398,
      amt: 2210,
    },
    {
      name: "Page C",
      uv: 2000,
      pv: 9800,
      amt: 2290,
    },
    {
      name: "Page D",
      uv: 2780,
      pv: 3908,
      amt: 2000,
    },
    {
      name: "Page E",
      uv: 1890,
      pv: 4800,
      amt: 2181,
    },
    {
      name: "Page F",
      uv: 2390,
      pv: 3800,
      amt: 2500,
    },
    {
      name: "Page G",
      uv: 3490,
      pv: 4300,
      amt: 2100,
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 15 }}>
        <Grid container justifyContent="space-between">
          <Grid item>
            <Typography variant="h3">Stats</Typography>
          </Grid>
          <Grid item>
            <Select
              native
              style={{ width: "130px" }}
              onChange={event => setSelectedAsset(assets.find(asset => asset.cToken === event.target.value)!)}
              value={selectedAsset.cToken}
            >
              {assets.map(asset => (
                <AssetOption asset={asset} key={asset.cToken} />
              ))}
            </Select>
          </Grid>
        </Grid>
      </div>
      {data ? (
        <Grid container spacing={2} direction="column">
          <Grid item>
            {/* <ResponsiveContainer width="100%" height="100%"> */}
            <LineChart
              width={500}
              height={300}
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
            </LineChart>
            {/* </ResponsiveContainer> */}
          </Grid>
          <Grid item>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <CaptionedStat
                  stat={(selectedAsset.collateralFactor / 1e16).toFixed(0) + "%"}
                  caption={"Collateral Factor"}
                />
              </Grid>
              <Grid item xs={6}>
                <CaptionedStat
                  stat={(selectedAsset.reserveFactor / 1e16).toFixed(0) + "%"}
                  caption={"Reserve Factor"}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Grid container spacing={3}>
              <Grid item xs={4}>
                <CaptionedStat stat={shortUsdFormatter(selectedAsset.totalSupplyUSD)} caption={"Total Supplied"} />
              </Grid>

              {!isSmallScreen && (
                <Grid item xs={4}>
                  <CaptionedStat
                    stat={
                      selectedAsset.totalSupplyUSD.toString() === "0"
                        ? "0%"
                        : ((selectedAsset.totalBorrowUSD / selectedAsset.totalSupplyUSD) * 100).toFixed(0) + "%"
                    }
                    caption={"Utilization"}
                  />
                </Grid>
              )}
              <Grid item xs={4}>
                <CaptionedStat stat={shortUsdFormatter(selectedAsset.totalBorrowUSD)} caption={"Total Borrowed"} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      ) : (
        <h4>No graph is available for this asset's interest curves.</h4>
      )}
    </>
  );
}

function AssetOption({ asset }: { asset: USDPricedFuseAsset }) {
  const tokenData = useTokenData(asset.underlyingToken);
  return (
    <option value={asset.cToken} key={asset.cToken}>
      {tokenData?.symbol ?? asset.underlyingSymbol}
    </option>
  );
}
