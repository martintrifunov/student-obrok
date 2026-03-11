import React, { useState, useRef, useCallback, useContext } from "react";
import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Box,
  Button,
  styled,
  Stack,
  useTheme,
  Collapse,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useNavigate } from "react-router-dom";
import GlobalLoadingProgress from "../components/GlobalLoadingProgress";
import LocateUser from "../components/LocateUser";
import VendorMarkers from "../components/VendorMarkers";
import CreditMarker from "../components/CreditMarker";
import RoutingEngine from "../components/RoutingEngine";
import useAuth from "../hooks/useAuth";
import useLogout from "../hooks/useLogout";
import { ThemeModeContext } from "../context/ThemeModeProvider";
import "../assets/map.css";

const INITIAL_VIEW_STATE = {
  longitude: 21.409471852749466,
  latitude: 42.00430265307896,
  zoom: 16,
  pitch: 0,
  bearing: 0,
};

const Home = () => {
  const theme = useTheme();
  const { mode, toggleColorMode } = useContext(ThemeModeContext);
  const logout = useLogout();
  const navigate = useNavigate();
  const { auth } = useAuth();

  const [userLocation, setUserLocation] = useState(null);
  const [routeStart, setRouteStart] = useState(null);
  const [routeEnd, setRouteEnd] = useState(null);
  const [routingMode, setRoutingMode] = useState("walking");
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabledRoutingButton, setIsDisabledRoutingButton] = useState(false);
  const [menuExpanded, setMenuExpanded] = useState(false);

  const mapRef = useRef(null);

  const handleUserLocation = useCallback((location) => {
    setUserLocation(location);
  }, []);

  const handleVendorLocation = useCallback(
    (location) => {
      if (!userLocation) return;
      setRouteStart([userLocation[0], userLocation[1]]);
      setRouteEnd([location[0], location[1]]);
      setIsDisabledRoutingButton(true);
    },
    [userLocation],
  );

  const handleCancelRoute = useCallback(() => {
    setRouteStart(null);
    setRouteEnd(null);
    setRoutingMode("walking");
    setIsDisabledRoutingButton(false);
  }, []);

  const handleDashboardClick = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  const handleLoginClick = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  const handleLogoutClick = async () => {
    await logout();
    navigate("/login");
  };

  const disableRouting = useCallback(() => {
    setIsDisabledRoutingButton(true);
  }, []);

  const enableRouting = useCallback(() => {
    setIsDisabledRoutingButton(false);
  }, []);

  const handleSetIsLoading = useCallback((val) => {
    setIsLoading(val);
  }, []);

  const onMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    if (!map.getLayer("3d-buildings")) {
      map.addLayer({
        id: "3d-buildings",
        source: "openmaptiles",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 15,
        paint: {
          "fill-extrusion-color": "#aaa",
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            15,
            0,
            15.05,
            ["get", "height"],
          ],
          "fill-extrusion-base": [
            "interpolate",
            ["linear"],
            ["zoom"],
            15,
            0,
            15.05,
            ["get", "min_height"],
          ],
          "fill-extrusion-opacity": 0.6,
        },
      });
    }

    map.setPitch(45);
  }, []);

  const hasRoute = routeStart !== null && routeEnd !== null;
  const isDark = theme.palette.mode === "dark";
  const isLoggedIn = !!auth?.accessToken;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        position: "relative",
        "& .maplibregl-popup-content": {
          backgroundColor: "background.paper",
          color: "text.primary",
          borderRadius: 3,
          boxShadow: theme.shadows[6],
          padding: 0,
          border: `1px solid ${theme.palette.divider}`,
          overflow: "hidden",
        },
        "& .maplibregl-popup-tip": {
          borderTopColor: theme.palette.divider,
          borderBottomColor: theme.palette.divider,
        },
        "& .maplibregl-popup-close-button": {
          color: `${theme.palette.text.secondary} !important`,
          fontSize: "20px",
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          top: "8px",
          right: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "transparent !important",
          border: "none",
          outline: "none",
          transition: "all 0.2s ease",
        },
        "& .maplibregl-popup-close-button:hover": {
          backgroundColor: `${theme.palette.action.hover} !important`,
          color: `${theme.palette.text.primary} !important`,
        },
        "& .maplibregl-ctrl-attrib": {
          backgroundColor: "rgba(255, 255, 255, 0.8) !important",
          color: "rgba(0, 0, 0, 0.8) !important",
        },
        "& .maplibregl-ctrl-attrib a": {
          color: "rgba(0, 0, 0, 0.8) !important",
        },
      }}
    >
      {isLoading && <GlobalLoadingProgress />}
      <Map
        ref={mapRef}
        initialViewState={INITIAL_VIEW_STATE}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        onLoad={onMapLoad}
        minZoom={10}
        maxZoom={18}
      >
        <LocateUser
          onUserLocation={handleUserLocation}
          setIsLoading={handleSetIsLoading}
          disableRouting={disableRouting}
          enableRouting={enableRouting}
          followUser={!hasRoute}
        />
        <CreditMarker />
        <VendorMarkers
          onVendorLocation={handleVendorLocation}
          isDisabledRoutingButton={isDisabledRoutingButton || hasRoute}
        />
        {hasRoute && (
          <RoutingEngine
            startLng={routeStart[0]}
            startLat={routeStart[1]}
            endLng={routeEnd[0]}
            endLat={routeEnd[1]}
            mode={routingMode}
          />
        )}
      </Map>
      {hasRoute && (
        <>
          <ModeSelectorContainer direction="row" spacing={1}>
            <ModeButton
              active={routingMode === "walking"}
              onClick={() => setRoutingMode("walking")}
              disabled={routingMode === "walking"}
            >
              <DirectionsWalkIcon />
            </ModeButton>
            <ModeButton
              active={routingMode === "car"}
              onClick={() => setRoutingMode("car")}
              disabled={routingMode === "car"}
            >
              <DirectionsCarIcon />
            </ModeButton>
            <ModeButton
              active={routingMode === "cycling"}
              onClick={() => setRoutingMode("cycling")}
              disabled={routingMode === "cycling"}
            >
              <DirectionsBikeIcon />
            </ModeButton>
          </ModeSelectorContainer>

          <CancelRouteButton variant="contained" onClick={handleCancelRoute}>
            <CloseIcon sx={{ marginRight: "5px" }} /> Откажи ја рутата
          </CancelRouteButton>
        </>
      )}
      {!isLoading && (
        <Box
          sx={{
            position: "absolute",
            bottom: "30px",
            left: "20px",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <MenuToggleButton
            onClick={() => setMenuExpanded(!menuExpanded)}
            $expanded={menuExpanded}
            $isDark={isDark}
          >
            <SettingsIcon
              sx={{
                fontSize: 28,
                transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                transform: menuExpanded ? "rotate(90deg)" : "rotate(0deg)",
              }}
            />
          </MenuToggleButton>

          <Collapse in={menuExpanded} orientation="horizontal" timeout={350}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                padding: "10px 16px",
                borderRadius: "30px",
                boxShadow: theme.shadows[6],
                border: `1px solid ${isDark ? "#334155" : theme.palette.divider}`,
              }}
            >
              {isLoggedIn ? (
                <>
                  <IconButton
                    onClick={handleDashboardClick}
                    color="primary"
                    sx={{
                      backgroundColor: isDark
                        ? "#0f172a"
                        : theme.palette.action.hover,
                    }}
                  >
                    <HomeIcon />
                  </IconButton>
                  <IconButton
                    onClick={toggleColorMode}
                    sx={{
                      color: theme.palette.text.primary,
                      backgroundColor: isDark
                        ? "#0f172a"
                        : theme.palette.action.hover,
                    }}
                  >
                    {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
                  </IconButton>
                  <IconButton
                    onClick={handleLogoutClick}
                    color="error"
                    sx={{
                      backgroundColor: isDark
                        ? "#0f172a"
                        : theme.palette.action.hover,
                    }}
                  >
                    <LogoutIcon />
                  </IconButton>
                </>
              ) : (
                <>
                  <IconButton
                    onClick={toggleColorMode}
                    sx={{
                      color: theme.palette.text.primary,
                      backgroundColor: isDark
                        ? "#0f172a"
                        : theme.palette.action.hover,
                    }}
                  >
                    {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
                  </IconButton>
                  <IconButton
                    onClick={handleLoginClick}
                    color="primary"
                    sx={{
                      backgroundColor: isDark
                        ? "#0f172a"
                        : theme.palette.action.hover,
                    }}
                  >
                    <LoginIcon />
                  </IconButton>
                </>
              )}
            </Box>
          </Collapse>
        </Box>
      )}
    </Box>
  );
};

// UI STYLING
const ModeSelectorContainer = styled(Stack)(({ theme }) => ({
  position: "absolute",
  top: "20px",
  left: "20px",
  zIndex: 1000,
  backgroundColor: theme.palette.background.paper,
  padding: "6px",
  borderRadius: "14px",
  boxShadow: theme.shadows[4],
  border: `1px solid ${theme.palette.divider}`,
}));

const ModeButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "active",
})(({ theme, active }) => ({
  minWidth: "45px",
  height: "45px",
  borderRadius: "10px",
  color: active
    ? theme.palette.mode === "dark"
      ? "#000"
      : "#fff"
    : theme.palette.text.secondary,
  backgroundColor: active ? theme.palette.primary.main : "transparent",
  border: "none",
  "&:disabled": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.mode === "dark" ? "#000" : "#fff",
    opacity: 1,
  },
  "&:hover": {
    backgroundColor: active
      ? theme.palette.primary.main
      : theme.palette.action.hover,
  },
}));

const CancelRouteButton = styled(Button)(({ theme }) => ({
  position: "absolute",
  top: "20px",
  right: "20px",
  zIndex: 1000,
  backgroundColor: theme.palette.error.main,
  color: "#fff",
  borderRadius: "12px",
  padding: "10px 20px",
  textTransform: "none",
  fontWeight: "bold",
  boxShadow: theme.shadows[4],
  "&:hover": {
    backgroundColor: theme.palette.error.dark,
  },
}));

const MenuToggleButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== "$expanded" && prop !== "$isDark",
})(({ theme, $expanded, $isDark }) => ({
  backgroundColor: $expanded
    ? theme.palette.primary.main
    : $isDark
      ? "#1e293b"
      : "#ffffff",
  color: $expanded
    ? $isDark
      ? "#000"
      : "#fff"
    : $isDark
      ? "#f8fafc"
      : theme.palette.text.primary,
  borderRadius: "50%",
  width: "60px",
  height: "60px",
  boxShadow: theme.shadows[6],
  border: `1px solid ${$expanded ? "transparent" : $isDark ? "#334155" : theme.palette.divider}`,
  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
  "&:hover": {
    backgroundColor: $expanded
      ? theme.palette.primary.dark
      : $isDark
        ? "#334155"
        : theme.palette.grey[100],
    transform: "scale(1.05)",
  },
}));

export default Home;
