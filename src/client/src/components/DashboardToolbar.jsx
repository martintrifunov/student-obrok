import React from "react";
import { Button, Grid, Box, useMediaQuery, styled } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import VendorSearchBar from "./VendorSearchBar";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import StoreIcon from "@mui/icons-material/Store";

const DashboardToolbar = ({ theme, handleSearchChange }) => {
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleAddDeal = () => {
    navigate("/dashboard/deal");
  };

  const handleRegisterVendor = () => {
    navigate("/dashboard/vendor");
  };

  return (
    <ToolbarGrid>
      <VendorSearchBar theme={theme} handleSearchChange={handleSearchChange} />
      <ToolbarBox>
        <RegisterVendorButton
          variant="contained"
          onClick={() => handleRegisterVendor()}
        >
          {!isSmallScreen ? (
            <>
              <AddIcon />
              Register Vendor
            </>
          ) : (
            <StoreIcon />
          )}
        </RegisterVendorButton>
        <AddDealButton variant="contained" onClick={() => handleAddDeal()}>
          {!isSmallScreen ? (
            <>
              <AddIcon />
              Add Deal
            </>
          ) : (
            <LocalOfferIcon />
          )}
        </AddDealButton>
      </ToolbarBox>
    </ToolbarGrid>
  );
};

const ToolbarGrid = styled(Grid)(({ theme }) => ({
  display: "flex",
  marginLeft: "1vw",
  marginRight: "1vw",
  justifyContent: "space-between",
  marginTop: useMediaQuery(theme.breakpoints.down("sm")) ? "5vh" : "10vh",
}));

const ToolbarBox = styled(Box)(({ theme }) => ({
  // Galaxy Fold
  [`@media (min-width: 280px) and (max-width: 280px) and 
    (min-height: 653px) and (max-height: 653px)`]: {
      display: "flex",
      justifyContent: "center",
      marginLeft: 20
  },
}));

const RegisterVendorButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  backgroundColor: "black",
  marginRight: 10,

  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
}));

const AddDealButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  backgroundColor: "black",

  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
}));

export default DashboardToolbar;
