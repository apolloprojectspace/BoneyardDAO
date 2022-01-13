import apollo from "../../lib/apolloClient";

// TODO: add paramaterization
export const treasuryDataQuery = `
query {
  protocolMetrics(first: 1000, orderBy: timestamp, orderDirection: desc) {
    id
    timestamp
    hecCirculatingSupply
    sHecCirculatingSupply
    totalSupply
    hecPrice
    marketCap
    totalValueLocked
    treasuryRiskFreeValue
    treasuryMarketValue
    nextEpochRebase
    nextDistributedHec
    treasuryDaiMarketValue
    treasuryDaiRiskFreeValue
    treasuryUsdcMarketValue
    treasuryUsdcRiskFreeValue
    treasuryWFTMMarketValue
    treasuryWFTMRiskFreeValue
    treasuryMIMRiskFreeValue
    treasuryMIMMarketValue
    treasuryFRAXRiskFreeValue
    treasuryFRAXMarketValue
    treasuryGOHMRiskFreeValue
    treasuryGOHMMarketValue
    treasuryBOOMarketValue
    treasuryBOORiskFreeValue
    treasuryCRVRiskFreeValue
    treasuryCRVMarketValue
    currentAPY
    runwayCurrent
    treasuryHecDaiPOL
  }
}
`;

export const rebasesV1DataQuery = `
query {
  rebases(where: {contract: "0x9ae7972BA46933B3B20aaE7Acbf6C311847aCA40"}, orderBy: timestamp, first: 1000, orderDirection: desc) {
    percentage
    timestamp
  }
}
`;

export const rebasesV2DataQuery = `
query {
  rebases(where: {contract: "0xD12930C8deeDafD788F437879cbA1Ad1E3908Cc5"}, orderBy: timestamp, first: 1000, orderDirection: desc) {
    percentage
    timestamp
  }
}
`;

export const treasuryData = () => apollo(treasuryDataQuery).then(r => r.data.protocolMetrics);

// export default treasuryData;
export const bulletpoints = {
  tvl: [
    {
      right: 20,
      top: -12,
      background: "linear-gradient(180deg, #768299 -10%, #98B3E9 100%)",
    },
  ],
  coin: [
    {
      right: 15,
      top: -12,
      background: "linear-gradient(180deg, #F5AC37 -10%, #EA9276 100%)",
    },
    {
      right: 25,
      top: -12,
      background: "linear-gradient(180deg, #768299 -10%, #98B3E9 100%)",
    },
    {
      right: 29,
      top: -12,
      background: "linear-gradient(180deg, #8351ff -10%, #b151ff 100%)",
    },
    {
      right: 29,
      top: -12,
      background: "linear-gradient(180deg, #c6c6c6 -10%, #545454 100%)",
    },
    {
      right: 29,
      top: -12,
      background: "linear-gradient(180deg, #ffffff -10%, #d5d5d5 100%)",
    },
    {
      right: 29,
      top: -12,
      background: "linear-gradient(180deg, #22d5e7 -10%, #18919d 100%)",
    },
    {
      right: 29,
      top: -12,
      background: "linear-gradient(180deg, #DBE722 -10%, #9D9D18 100%)",
    },
    {
      right: 29,
      top: -12,
      background: "linear-gradient(180deg, #E73722 -10%, #9D3018 100%)",
    },
  ],
  holder: [
    {
      right: 40,
      top: -12,
      background: "#A3A3A3",
    },
  ],
  apy: [
    {
      right: 20,
      top: -12,
      background: "#49A1F2",
    },
  ],
  runway: [
    {
      right: 45,
      top: -12,
      background: "#FFFFFF",
    },
    {
      right: 48,
      top: -12,
      background: "#2EC608",
    },
    {
      right: 48,
      top: -12,
      background: "#49A1F2",
    },
  ],
  staked: [
    {
      right: 45,
      top: -11,
      background: "linear-gradient(180deg, #55EBC7 -10%, rgba(71, 172, 235, 0) 100%)",
    },
    {
      right: 68,
      top: -12,
      background: "rgba(151, 196, 224, 0.2)",
      border: "1px solid rgba(54, 56, 64, 0.5)",
    },
  ],
  pol: [
    {
      right: 15,
      top: -12,
      background: "linear-gradient(180deg, rgba(56, 223, 63, 1) -10%, rgba(182, 233, 152, 1) 100%)",
    },
    {
      right: 25,
      top: -12,
      background: "rgba(219, 242, 170, 1)",
      border: "1px solid rgba(118, 130, 153, 1)",
    },
  ],
};

export const tooltipItems = {
  tvl: ["Total Value Deposited"],
  coin: ["DAI", "USDC", "MiM", "FRAX", "gOHM", "WFTM", "BOO", "CRV"],
  apy: ["APY"],
  runway: ["Days"],
  pol: ["SLP Treasury", "Market SLP"],
};

export const tooltipInfoMessages = {
  tvl: "Total Value Deposited, is the dollar amount of all HEC staked in the protocol. This metric is often used as growth or health indicator in DeFi projects.",
  mvt: "Market Value of Treasury Assets, is the sum of the value (in dollars) of all assets held by the treasury.",
  rfv: "Risk Free Value, is the amount of funds the treasury guarantees to use for backing HEC.",
  pol: "Protocol Owned Liquidity, is the amount of LP the treasury owns and controls. The more POL the better for the protocol and its users.",
  staked: "HEC Staked, is the ratio of sHEC to HEC (staked vs unstaked)",
  apy: "Annual Percentage Yield, is the normalized representation of an interest rate, based on a compounding period over one year. Note that APYs provided are rather ballpark level indicators and not so much precise future results.",
  runway: "Runway, is the number of days sHEC emissions can be sustained at a given rate. Lower APY = longer runway",
};

export const itemType = {
  dollar: "$",
  percentage: "%",
};
