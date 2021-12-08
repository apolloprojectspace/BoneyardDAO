import { Grid, Typography, CircularProgress } from "@material-ui/core";
import { USDPricedFuseAsset } from "../../../fuse-sdk/helpers/fetchFusePoolData";
import { formatCurrency } from "../../../helpers";
import { Mode } from "../../../fuse-sdk/helpers/fetchMaxAmount";
import { convertMantissaToAPR, convertMantissaToAPY } from "../../../fuse-sdk/helpers/apyUtils";
import { useBorrowLimit } from "../../../fuse-sdk/hooks/useBorrowLimit";

export const StatsColumn = ({
  mode,
  asset,
  amount,
  symbol,
  enableAsCollateral,
  borrowLimit,
}: {
  mode: Mode;
  asset: USDPricedFuseAsset;
  amount: number;
  symbol: string;
  enableAsCollateral: boolean;
  borrowLimit: number;
}) => {
  //const { rari, fuse } = useRari();
  // TODO
  let updatedAssets = assets; // undefined;

  // const { data: updatedAssets }: UseQueryResult<USDPricedFuseAsset[]> = useQuery(
  //   mode + " " + index + " " + JSON.stringify(assets) + " " + amount,
  //   async () => {
  //     const ethPrice: number = fuse.web3.utils.fromWei(await rari.getEthUsdPriceBN()) as any;

  //     const assetToBeUpdated = assets[index];

  //     const interestRateModel = await fuse.getInterestRateModel(assetToBeUpdated.cToken);

  //     if (mode === Mode.SUPPLY) {
  //       const supplyBalance = parseInt(assetToBeUpdated.supplyBalance as any) + amount;

  //       const totalSupply = parseInt(assetToBeUpdated.totalSupply as any) + amount;

  //       updatedAsset = {
  //         ...assetToBeUpdated,

  //         supplyBalance,
  //         supplyBalanceUSD: ((supplyBalance * assetToBeUpdated.underlyingPrice) / 1e36) * ethPrice,

  //         totalSupply,
  //         supplyRatePerBlock: interestRateModel.getSupplyRate(
  //           fuse.web3.utils.toBN(
  //             totalSupply > 0
  //               ? new BigNumber(assetToBeUpdated.totalBorrow)
  //                   .dividedBy(totalSupply.toString())
  //                   .multipliedBy(1e18)
  //                   .toFixed(0)
  //               : 0,
  //           ),
  //         ),
  //       };
  //     } else if (mode === Mode.WITHDRAW) {
  //       const supplyBalance = parseInt(assetToBeUpdated.supplyBalance as any) - amount;

  //       const totalSupply = parseInt(assetToBeUpdated.totalSupply as any) - amount;

  //       updatedAsset = {
  //         ...assetToBeUpdated,

  //         supplyBalance,
  //         supplyBalanceUSD: ((supplyBalance * assetToBeUpdated.underlyingPrice) / 1e36) * ethPrice,

  //         totalSupply,
  //         supplyRatePerBlock: interestRateModel.getSupplyRate(
  //           fuse.web3.utils.toBN(
  //             totalSupply > 0
  //               ? new BigNumber(assetToBeUpdated.totalBorrow)
  //                   .dividedBy(totalSupply.toString())
  //                   .multipliedBy(1e18)
  //                   .toFixed(0)
  //               : 0,
  //           ),
  //         ),
  //       };
  //     } else if (mode === Mode.BORROW) {
  //       const borrowBalance = parseInt(assetToBeUpdated.borrowBalance as any) + amount;

  //       const totalBorrow = parseInt(assetToBeUpdated.totalBorrow as any) + amount;

  //       updatedAsset = {
  //         ...assetToBeUpdated,

  //         borrowBalance,
  //         borrowBalanceUSD: ((borrowBalance * assetToBeUpdated.underlyingPrice) / 1e36) * ethPrice,

  //         totalBorrow,
  //         borrowRatePerBlock: interestRateModel.getBorrowRate(
  //           fuse.web3.utils.toBN(
  //             assetToBeUpdated.totalSupply > 0
  //               ? new BigNumber(totalBorrow.toString())
  //                   .dividedBy(assetToBeUpdated.totalSupply)
  //                   .multipliedBy(1e18)
  //                   .toFixed(0)
  //               : 0,
  //           ),
  //         ),
  //       };
  //     } else if (mode === Mode.REPAY) {
  //       const borrowBalance = parseInt(assetToBeUpdated.borrowBalance as any) - amount;

  //       const totalBorrow = parseInt(assetToBeUpdated.totalBorrow as any) - amount;

  //       updatedAsset = {
  //         ...assetToBeUpdated,

  //         borrowBalance,
  //         borrowBalanceUSD: ((borrowBalance * assetToBeUpdated.underlyingPrice) / 1e36) * ethPrice,

  //         totalBorrow,
  //         borrowRatePerBlock: interestRateModel.getBorrowRate(
  //           fuse.web3.utils.toBN(
  //             assetToBeUpdated.totalSupply > 0
  //               ? new BigNumber(totalBorrow.toString())
  //                   .dividedBy(assetToBeUpdated.totalSupply)
  //                   .multipliedBy(1e18)
  //                   .toFixed(0)
  //               : 0,
  //           ),
  //         ),
  //       };
  //     }

  //     return assets.map((value, _index) => {
  //       if (_index === index) {
  //         return updatedAsset;
  //       } else {
  //         return value;
  //       }
  //     });
  //   },
  // );

  const updatedAsset = updatedAssets ? updatedAssets[index] : null;

  const updatedBorrowLimit = useBorrowLimit(
    updatedAssets ?? [],
    enableAsCollateral
      ? {
          ignoreIsEnabledCheckFor: asset.cToken,
        }
      : undefined,
  );

  const isSupplyingOrWithdrawing = mode === Mode.SUPPLY || mode === Mode.WITHDRAW;

  const supplyAPY = convertMantissaToAPY(asset.supplyRatePerBlock, 365);
  const borrowAPR = convertMantissaToAPR(asset.borrowRatePerBlock);

  const updatedSupplyAPY = convertMantissaToAPY(updatedAsset?.supplyRatePerBlock ?? 0, 365);
  const updatedBorrowAPR = convertMantissaToAPR(updatedAsset?.borrowRatePerBlock ?? 0);

  // If the difference is greater than a 0.1 percentage point change, alert the user
  const updatedAPYDiffIsLarge = isSupplyingOrWithdrawing
    ? Math.abs(updatedSupplyAPY - supplyAPY) > 0.1
    : Math.abs(updatedBorrowAPR - borrowAPR) > 0.1;

  // const propertyText = useColorModeValue("black", "gray.300");

  return (
    <Grid item>
      {updatedAsset ? (
        <Grid container direction="column" spacing={2}>
          <StatsColumnRow
            left="Supply Balance"
            right={
              <>
                {formatCurrency(asset.supplyBalance / 10 ** asset.underlyingDecimals, 2).replace("$", "")}
                {isSupplyingOrWithdrawing ? (
                  <>
                    {" → "}
                    {formatCurrency(updatedAsset!.supplyBalance / 10 ** updatedAsset!.underlyingDecimals, 2).replace(
                      "$",
                      "",
                    )}
                  </>
                ) : null}{" "}
                {symbol}
              </>
            }
          />

          <StatsColumnRow
            left={isSupplyingOrWithdrawing ? "Supply APY" : "Borrow APR"}
            right={
              <>
                {isSupplyingOrWithdrawing ? supplyAPY.toFixed(2) : borrowAPR.toFixed(2)}%
                {updatedAPYDiffIsLarge ? (
                  <>
                    {" → "}
                    {isSupplyingOrWithdrawing ? updatedSupplyAPY.toFixed(2) : updatedBorrowAPR.toFixed(2)}%
                  </>
                ) : null}
              </>
            }
          />
          <StatsColumnRow
            left="Borrow Limit"
            right={
              <>
                {formatCurrency(borrowLimit, 2)}
                {isSupplyingOrWithdrawing ? (
                  <>
                    {" → "} {formatCurrency(updatedBorrowLimit, 2)}
                  </>
                ) : null}{" "}
              </>
            }
          />
          <StatsColumnRow
            left="Debt Balance"
            right={
              <>
                {formatCurrency(asset.borrowBalanceUSD, 2)}
                {!isSupplyingOrWithdrawing ? (
                  <>
                    {" → "}
                    {formatCurrency(updatedAsset.borrowBalanceUSD, 2)}
                  </>
                ) : null}
              </>
            }
          />
        </Grid>
      ) : (
        <CircularProgress />
      )}
    </Grid>
  );
};

const StatsColumnRow = ({ left, right }: { left: string; right: React.ReactNode }) => {
  return (
    <Grid item container justifyContent="space-between" alignItems="baseline">
      <Grid item>
        <Typography>{left}:</Typography>
      </Grid>
      <Grid item>
        <Typography>{right}</Typography>
      </Grid>
    </Grid>
  );
};
