import React, { useState } from "react";
import { Grid, styled, useMediaQuery } from "@mui/material";
import DashboardHeader from "../components/DashboardHeader";
import { createTheme, ThemeProvider } from "@mui/material";
import ProductsList from "../components/ProductsList";
import VendorsList from "../components/VendorsList";
import DashboardToolbar from "../components/DashboardToolbar";
import ProductSearchBar from "../components/ProductSearchBar";

const Dashboard = () => {
  const theme = createTheme();
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");

  return (
    <ThemeProvider theme={theme}>
      <Grid>
        <DashboardHeader theme={theme} />
        <DashboardToolbar
          theme={theme}
          handleSearchChange={(e) => setVendorSearchTerm(e.target.value)}
        />
        <VendorsList theme={theme} searchTerm={vendorSearchTerm} />

        <ToolbarGrid>
          <ProductSearchBar
            theme={theme}
            handleSearchChange={(e) => setProductSearchTerm(e.target.value)}
            placeholder="Search products..."
          />
        </ToolbarGrid>
        <ProductsList theme={theme} searchTerm={productSearchTerm} />
      </Grid>
    </ThemeProvider>
  );
};

const ToolbarGrid = styled(Grid)(({ theme }) => ({
  display: "flex",
  justifyContent: useMediaQuery(theme.breakpoints.down("sm"))
    ? "center"
    : "space-between",
  alignItems: useMediaQuery(theme.breakpoints.down("sm")) && "center",
}));

export default Dashboard;
