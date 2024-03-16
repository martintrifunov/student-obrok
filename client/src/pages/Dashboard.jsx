import { Grid } from "@mui/material";
import React from "react";
import DashboardHeader from "../components/DashboardHeader";
import DealsToolbar from "../components/DealsToolbar";
import { createTheme, ThemeProvider } from "@mui/material";
import DealsList from "../components/DealsList";

const Dashboard = () => {
  const theme = createTheme();

  return (
    <ThemeProvider theme={theme}>
      <Grid>
        <DashboardHeader theme={theme} />
        <DealsToolbar theme={theme} />
        <DealsList theme={theme} />
      </Grid>
    </ThemeProvider>
  );
};

export default Dashboard;
