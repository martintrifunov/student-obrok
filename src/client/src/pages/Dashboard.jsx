import { Grid, styled, useMediaQuery } from "@mui/material";
import React, { useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import { createTheme, ThemeProvider } from "@mui/material";
import DealsList from "../components/DealsList";
import VendorstList from "../components/VendorList";
import DashboardToolbar from "../components/DashboardToolbar";
import DealSearchBar from "../components/DealSearchBar";

const Dashboard = () => {
  const theme = createTheme();
  const [dealSearchTerm, setDealSearchTerm] = useState("");
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");
  const [deals, setDeals] = useState([]);
  const [vendors, setVendors] = useState([]);

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
          handleSearchChange={handleVendorSearchChange}
        />
        <VendorstList
          theme={theme}
          searchTerm={vendorSearchTerm}
          setDeals={setDeals}
          vendors={vendors}
          setVendors={setVendors}
        />
        <DealsToolbarGrid>
          <DealSearchBar
            theme={theme}
            handleSearchChange={handleDealSearchChange}
          />
        </DealsToolbarGrid>
        <DealsList
          theme={theme}
          searchTerm={dealSearchTerm}
          deals={deals}
          setDeals={setDeals}
        />
      </Grid>
    </ThemeProvider>
  );
};

const DealsToolbarGrid = styled(Grid)(({ theme }) => ({
  display: "flex",
  justifyContent: useMediaQuery(theme.breakpoints.down("sm"))
    ? "center"
    : "space-between",
  alignItems: useMediaQuery(theme.breakpoints.down("sm")) && "center",
}));

export default Dashboard;
