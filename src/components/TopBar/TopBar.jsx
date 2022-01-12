import { AppBar, Toolbar, Box, Button, SvgIcon } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { ReactComponent as MenuIcon } from "../../assets/icons/hamburger.svg";
import HecMenu from "./HecMenu.jsx";
import ThemeSwitcher from "./ThemeSwitch.jsx";
import ConnectMenu from "./ConnectMenu.jsx";
import "./topbar.scss";

const useStyles = makeStyles(theme => ({
  appBar: {
    gridArea: "header",
    background: "transparent",
    backdropFilter: "none",
    zIndex: 10,
    paddingLeft: 10,
    paddingRight: 10,
    [theme.breakpoints.down(400)]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
    [theme.breakpoints.up(100)]: {
      minHeight: "initial",
    },
  },
  topBar: {
    justifyItems: "end",
    [theme.breakpoints.down("981")]: {
      justifyItems: "initial",
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("981")]: {
      display: "none",
    },
  },
}));

function TopBar({ theme, toggleTheme, handleDrawerToggle }) {
  const classes = useStyles();
  const isVerySmallScreen = useMediaQuery("(max-width: 355px)");

  return (
    <AppBar position="sticky" className={classes.appBar + " header"} elevation={0}>
      <Toolbar className={classes.topBar + " dapp-topbar"} disableGutters>
        <Button
          id="hamburger"
          aria-label="open drawer"
          edge="start"
          size="large"
          variant="contained"
          color="secondary"
          onClick={handleDrawerToggle}
          className={classes.menuButton}
        >
          <SvgIcon component={MenuIcon} />
        </Button>

        <Box display="flex">
          {!isVerySmallScreen && <HecMenu />}

          <ConnectMenu theme={theme} />

          <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
