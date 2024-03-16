import { Button, Grid } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import React from "react";
import { useNavigate } from "react-router-dom";

const DealsToolbar = ({ theme }) => {
  const navigate = useNavigate();

  const gridStyle = {
    display: "flex",
    width: "99vw",
    justifyContent: "flex-end",
    marginTop: "10vh",
  };

  const buttonStyle = {
    textTransform: "none",
  };

  const handleAddDeal = () => {
    navigate("/dashboard/deal");
  };
  return (
    <Grid style={gridStyle}>
      <Button
        variant="contained"
        style={buttonStyle}
        onClick={() => handleAddDeal()}
      >
        <AddIcon />
        Add Deal
      </Button>
    </Grid>
  );
};

export default DealsToolbar;
