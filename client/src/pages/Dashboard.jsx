import { Grid } from "@mui/material";
import React, { useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import DealsToolbar from "../components/DealsToolbar";
import { createTheme, ThemeProvider } from "@mui/material";
import DealsList from "../components/DealsList";

const Dashboard = () => {
  const theme = createTheme();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid>
        <DashboardHeader theme={theme} />
        <DealsToolbar theme={theme} handleSearchChange={handleSearchChange} />
        <DealsList theme={theme} searchTerm={searchTerm} />
      </Grid>
    </ThemeProvider>
  );
};

export default Dashboard;
