import React from "react";
import { Outlet } from "react-router-dom";
import { Box, Container } from "@mui/material";
import DashboardHeader from "./DashboardHeader";

const DashboardLayout = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <DashboardHeader />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: { xs: 3, md: 5 },
        }}
      >
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
