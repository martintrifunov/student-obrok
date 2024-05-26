import React from "react";
import { Paper, useMediaQuery, Button, styled } from "@mui/material";
import { useNavigate } from "react-router-dom";
import useLogout from "../hooks/useLogout";

const DashboardHeader = ({ theme }) => {
  const navigate = useNavigate();
  const logout = useLogout();

  const handleMapNavigation = () => {
    navigate("/");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Navigation elevation={5}>
      <MapButton
        variant="contained"
        onClick={handleMapNavigation}
      >
        Map
      </MapButton>
      <LogoutButton
        variant="outlined"
        color="inherit"
        onClick={handleLogout}
      >
        Logout
      </LogoutButton>
    </Navigation>
  );
};

const Navigation = styled(Paper)(({ theme }) => ({
  height: useMediaQuery(theme.breakpoints.down("sm")) ? "15vh" : "7vh",
  display: "flex",
  justifyContent: useMediaQuery(theme.breakpoints.down("sm")) ? "space-around" : "center",
  alignItems: "center",
}));

const LogoutButton = styled(Button)(({ theme }) => ({
  marginLeft: useMediaQuery(theme.breakpoints.down("sm")) ? "0vw" : "2vw",
  padding: useMediaQuery(theme.breakpoints.down("sm")) && "13px 33px",
  textTransform: "none",
}));

const MapButton = styled(Button)(({ theme }) => ({
  backgroundColor: "black",
  padding: useMediaQuery(theme.breakpoints.down("sm")) && "13px 33px",
  textTransform: "none",

  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
}));

export default DashboardHeader;
