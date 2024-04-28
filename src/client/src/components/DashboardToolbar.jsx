import React from "react";
import { Button, Grid, Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import DealSearchBar from "./DealSearchBar";

const DashboardToolbar = ({ theme, handleSearchChange }) => {
  const navigate = useNavigate();

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
      <DealSearchBar theme={theme} handleSearchChange={handleSearchChange} />
      <Box>
        <Button
          variant="contained"
          style={{ ...buttonStyle, marginRight: 10 }}
          onClick={() => handleRegisterVendor()}
        >
          <AddIcon />
          Register Vendor
        </Button>
        <Button
          variant="contained"
          style={buttonStyle}
          onClick={() => handleAddDeal()}
        >
          <AddIcon />
          Add Deal
        </Button>
      </Box>
    </Grid>
  );
};

export default DashboardToolbar;
