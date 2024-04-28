import React from "react";
import { Button, Grid, Box, useMediaQuery } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import VendorSearchBar from "./VendorSearchBar";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import StoreIcon from '@mui/icons-material/Store';

const DashboardToolbar = ({ theme, handleSearchChange }) => {
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleAddDeal = () => {
    navigate("/dashboard/deal");
  };

  const handleRegisterVendor = () => {
    navigate("/dashboard/vendor");
  };

  const gridStyle = {
    display: "flex",
    marginLeft: "1vw",
    marginRight: "1vw",
    justifyContent: "space-between",
    marginTop: "10vh",
  };

  const buttonStyle = {
    textTransform: "none",
    backgroundColor: "black",
  };

  return (
    <Grid style={gridStyle}>
      <VendorSearchBar theme={theme} handleSearchChange={handleSearchChange} />
      <Box>
        <Button
          variant="contained"
          style={{ ...buttonStyle, marginRight: 10 }}
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
        </Button>
        <Button
          variant="contained"
          style={buttonStyle}
          onClick={() => handleAddDeal()}
        >
          {!isSmallScreen ? (
            <>
              <AddIcon />
              Add Deal
            </>
          ) : (
            <LocalOfferIcon />
          )}
        </Button>
      </Box>
    </Grid>
  );
};

export default DashboardToolbar;
