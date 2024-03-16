import { Button, Grid } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import React from "react";

const DealsToolbar = ({ theme }) => {
  const gridStyle = {
    display: "flex",
    width: "99vw",
    justifyContent: "flex-end",
    marginTop: "10vh",
  };
  const buttonStyle = {
    textTransform: "none",
  };
  return (
    <Grid style={gridStyle}>
      <Button variant="contained" style={buttonStyle}>
        <AddIcon />
        Add Deal
      </Button>
    </Grid>
  );
};

export default DealsToolbar;
