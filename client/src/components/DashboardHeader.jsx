import React, { useContext } from "react";
import { Paper, useMediaQuery, Button, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthProvider";

const DashboardHeader = ({ theme }) => {
  const { setAuth } = useContext(AuthContext);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

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
    setAuth({});
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
