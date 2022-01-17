import { Alert } from "@material-ui/lab";
import "./banner.scss";

interface Props {
  isSmallScreen: boolean;
  isSmallerScreen: boolean;
}

export function Banner({ isSmallScreen, isSmallerScreen }: Props) {
  return (
    <Alert
      style={isSmallScreen || isSmallerScreen ? {} : { marginLeft: "300px" }}
      className="banner"
      variant="filled"
      severity="warning"
    >
      Experiencing network problems due to FTM congestion.
    </Alert>
  );
}
