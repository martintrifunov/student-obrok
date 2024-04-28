import { Grid } from "@mui/material";
import React, { useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import { createTheme, ThemeProvider } from "@mui/material";
import DealsList from "../components/DealsList";
import VendorstList from "../components/VendorList";
import VendorSearchBar from "../components/VendorSearchBar";
import DashboardToolbar from "../components/DashboardToolbar";

const Dashboard = () => {
  const theme = createTheme();
  const [dealSearchTerm, setDealSearchTerm] = useState("");
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");

  const handleDealSearchChange = (event) => {
    setDealSearchTerm(event.target.value);
  };

  const handleVendorSearchChange = (event) => {
    setVendorSearchTerm(event.target.value);
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid>
        <DashboardHeader theme={theme} />
        <DashboardToolbar
          theme={theme}
          handleSearchChange={handleDealSearchChange}
        />
        <DealsList theme={theme} searchTerm={dealSearchTerm} />
        <VendorSearchBar
          theme={theme}
          handleSearchChange={handleVendorSearchChange}
        />
        <VendorstList theme={theme} searchTerm={vendorSearchTerm} />
      </Grid>
    </ThemeProvider>
  );
};

export default Dashboard;
