import React from "react";
import {
  Paper,
  useMediaQuery,
  ThemeProvider,
  createTheme,
  Button,
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

const DashboardHeader = () => {
  const theme = createTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [_, setCookies] = useCookies(["access_token"]);

  const navStyle = {
    height: isSmallScreen ? "15vh" : "7vh",
    display: "flex",
    justifyContent: isSmallScreen ? "space-around" : "center",
    alignItems: "center",
  };

  const buttonStyle = {
    backgroundColor: "black",
    padding: isSmallScreen && "13px 33px",
  };

  const handleMapNavigation = () => {
    navigate("/");
  };

  const handleLogout = () => {
    window.localStorage.removeItem("userId");
    setCookies("access_token", "");
    navigate("/login");
  };

  return (
    <ThemeProvider theme={theme}>
      <Paper elevation={5} style={navStyle}>
        <Button
          style={buttonStyle}
          variant="contained"
          onClick={handleMapNavigation}
        >
          Map
        </Button>
        <Link
          onClick={handleLogout}
          color="inherit"
          variant={isSmallScreen ? "h5" : "h6"}
          underline="none"
          sx={{
            marginLeft: isSmallScreen ? "0vw" : "3vw",
            "&:hover": {
              cursor: "pointer",
              color: "#665d5d",
            },
          }}
        >
          Logout
        </Link>
      </Paper>
    </ThemeProvider>
  );
};

export default DashboardHeader;
