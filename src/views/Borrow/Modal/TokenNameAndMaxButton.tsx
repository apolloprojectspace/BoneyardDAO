import { Button, CircularProgress } from "@material-ui/core";
import { BigNumber } from "ethers";
import { useState } from "react";
import { USDPricedFuseAsset } from "../../../fuse-sdk/helpers/fetchFusePoolData";
import { useRari } from "../../../fuse-sdk/helpers/RariContext";
import { fetchMaxAmount, Mode } from "../../../fuse-sdk/helpers/fetchMaxAmount";

export const TokenNameAndMaxButton = ({
  updateAmount,
  asset,
  mode,
}: {
  asset: USDPricedFuseAsset;
  mode: Mode;
  updateAmount: (newAmount: string) => any;
}) => {
  const { fuse, address } = useRari();

  const [isMaxLoading, setIsMaxLoading] = useState(false);

  const setToMax = async () => {
    setIsMaxLoading(true);

    try {
      const maxBN = await fetchMaxAmount(mode, fuse, address, asset);

      if (!maxBN || maxBN.isNegative() || maxBN.isZero()) {
        updateAmount("");
      } else {
        const str = (maxBN.toNumber() / (10 ** asset.underlyingDecimals))
          .toFixed(18)
          // Remove trailing zeroes
          .replace(/\.?0+$/, "");

        updateAmount(str);
      }

      setIsMaxLoading(false);
    } catch (e) {
      console.log(e)
      // TODO toast
      // handleGenericError(e, toast);
    }
  };

  return isMaxLoading ? <CircularProgress size={20} /> : <Button onClick={setToMax}>{"MAX"}</Button>;
};
