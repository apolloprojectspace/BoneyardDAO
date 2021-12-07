import { Backdrop, Grid, Fade, Paper } from "@material-ui/core";
import { useEffect, useState } from "react";
import { USDPricedFuseAsset } from "../../../fuse-sdk/helpers/fetchFusePoolData";
import { Mode } from "../../../fuse-sdk/helpers/fetchMaxAmount";
import { AmountSelect } from "./AmountSelect";

interface Props {
  isOpen: boolean;
  onClose: () => any;
  defaultMode: Mode;
  index: number;
  assets: USDPricedFuseAsset[];
  comptrollerAddress: string;
}
export function PoolModal(props: Props) {
  const [mode, setMode] = useState(props.defaultMode);

  useEffect(() => {
    setMode(props.defaultMode);
  }, [props.isOpen, props.defaultMode]);

  return props.isOpen ? (
    <Fade in mountOnEnter unmountOnExit>
      <div id="bond-view">
        <Backdrop open={props.isOpen} className="pool-modal">
          <Fade in>
            <Paper className="hec-card hec-modal">
              <AmountSelect
                comptrollerAddress={props.comptrollerAddress}
                onClose={props.onClose}
                assets={props.assets}
                index={props.index}
                mode={mode}
                setMode={setMode}
              />
            </Paper>
          </Fade>
        </Backdrop>
      </div>
    </Fade>
  ) : null;
}
