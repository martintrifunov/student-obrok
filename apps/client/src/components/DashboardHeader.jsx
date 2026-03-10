import React from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Typography,
  Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import useLogout from "../hooks/useLogout";
import MapIcon from "@mui/icons-material/Map";
import LogoutIcon from "@mui/icons-material/Logout";

const DashboardHeader = () => {
  const navigate = useNavigate();
  const logout = useLogout();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        color: "text.primary",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
          {/* Logo / Branding Placeholder */}
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: "bold", cursor: "pointer" }}
            onClick={() => navigate("/dashboard")}
          >
            Obrok
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/")}
              startIcon={<MapIcon />}
            >
              Map
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default DashboardHeader;
