import React from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Typography,
  Container,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import useLogout from "@/features/auth/hooks/useLogout";
import MapIcon from "@mui/icons-material/Map";
import LogoutIcon from "@mui/icons-material/Logout";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import TuneIcon from "@mui/icons-material/Tune";
import { useThemeStore } from "@/store/themeStore";

const DashboardHeader = () => {
  const navigate = useNavigate();
  const logout = useLogout();

  const mode = useThemeStore((state) => state.mode);
  const toggleColorMode = useThemeStore((state) => state.toggleColorMode);

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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: "bold",
                cursor: "pointer",
                letterSpacing: "-0.5px",
              }}
              onClick={() => navigate("/dashboard")}
            >
              Obrok
            </Typography>

            <IconButton onClick={toggleColorMode} color="inherit" size="small">
              {mode === "dark" ? (
                <LightModeIcon fontSize="small" />
              ) : (
                <DarkModeIcon fontSize="small" />
              )}
            </IconButton>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: { xs: 1, md: 2 },
              alignItems: "center",
            }}
          >
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate("/dashboard/features")}
              startIcon={<TuneIcon />}
            >
              Features
            </Button>
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
