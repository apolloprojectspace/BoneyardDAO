import { Alert } from "@material-ui/lab";
import "./banner.scss";

export function Banner() {
  return (
    <Alert className="banner" variant="filled" severity="warning">
      We are currently experiencing network issues, this will be fixed shortly.
    </Alert>
  );
}
