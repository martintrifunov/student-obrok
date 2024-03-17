import React from "react";
import { Paper, useMediaQuery, Button, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

const DashboardHeader = ({ theme }) => {
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [_, setCookies] = useCookies(["access_token"]);

  const navStyle = {
    height: isSmallScreen ? "15vh" : "7vh",
    display: "flex",
    justifyContent: isSmallScreen ? "space-around" : "center",
    alignItems: "center",
  };

  const mapButtonStyle = {
    backgroundColor: "black",
    padding: isSmallScreen && "13px 33px",
    textTransform: "none",
  };

  const logoutButtonStyle = {
    marginLeft: isSmallScreen ? "0vw" : "2vw",
    padding: isSmallScreen && "13px 33px",
    textTransform: "none",
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
    <Paper elevation={5} style={navStyle}>
      <Button
        style={mapButtonStyle}
        variant="contained"
        onClick={handleMapNavigation}
      >
        Map
      </Button>
      <Button
        style={logoutButtonStyle}
        variant="outlined"
        color="inherit"
        onClick={handleLogout}
      >
        Logout
      </Button>
    </Paper>
  );
};

export default DashboardHeader;
