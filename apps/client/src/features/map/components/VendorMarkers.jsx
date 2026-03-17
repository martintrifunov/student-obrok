import React, { useState, useMemo, useRef, useEffect } from "react";
import { Marker, Popup } from "react-map-gl/maplibre";
import { Button, Typography, Box, styled, useTheme } from "@mui/material";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import ImageIcon from "@mui/icons-material/Image";
import useSupercluster from "use-supercluster";
import { useMap } from "react-map-gl/maplibre";
import useMapPitch from "@/features/map/hooks/useMapPitch";
import { BASE_URL } from "@/api/consts";
import MapProductInfoModal from "@/features/map/components/MapProductInfoModal";
import { useMarketsForMap } from "@/features/markets/hooks/useMarketQueries";
import VENDOR_MARKER_COLORS from "@/features/map/config/vendorMarkerColors";

const VENDOR_MARKER_PATH =
  "m438-441.001 184.153-184.153-42.768-42.768L438-526.537l-56-56-42.768 42.768L438-441.001Zm42 341.384Q329.001-230.463 253.539-343.154q-75.461-112.692-75.461-206.923 0-138.46 89.577-224.191Q357.231-859.999 480-859.999t212.345 85.731q89.577 85.731 89.577 224.191 0 94.231-75.461 206.923Q630.999-230.463 480-99.617Z";

const getVendorMarkerColor = (vendorName = "") => {
  const normalizedName = vendorName.trim().toLowerCase();

  return (
    Object.entries(VENDOR_MARKER_COLORS).find(([vendorKey]) =>
      normalizedName.includes(vendorKey),
    )?.[1] ?? VENDOR_MARKER_COLORS.vero
  );
};

const VendorMarkers = ({ onVendorLocation, isDisabledRoutingButton }) => {
  const theme = useTheme();
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [bounds, setBounds] = useState(null);
  const [zoom, setZoom] = useState(16);
  const pitch = useMapPitch();
  const { current: map } = useMap();
  const updateTimeoutRef = useRef(null);
  const verticalOffset = useMemo(() => pitch * 0.8, [pitch]);

  const { data: markets = [], isLoading } = useMarketsForMap();

  useEffect(() => {
    if (!map) return;
    const updateBoundsAndZoom = () => {
      setBounds(map.getBounds().toArray().flat());
      setZoom(map.getZoom());
    };
    const throttledBoundsUpdate = () => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = setTimeout(updateBoundsAndZoom, 150);
    };
    updateBoundsAndZoom();
    map.on("moveend", throttledBoundsUpdate);
    map.on("zoomend", updateBoundsAndZoom);
    return () => {
      map.off("moveend", throttledBoundsUpdate);
      map.off("zoomend", updateBoundsAndZoom);
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    };
  }, [map]);

  const points = useMemo(
    () =>
      markets.map((market, index) => ({
        type: "Feature",
        properties: {
          cluster: false,
          marketIndex: index,
          market: market,
        },
        geometry: {
          type: "Point",
          coordinates: [market.location[1], market.location[0]],
        },
      })),
    [markets],
  );

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom,
    options: { radius: 50, maxZoom: 15, minZoom: 0, extent: 512, nodeSize: 64 },
  });

  return (
    <>
      {!isLoading &&
        clusters.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count: pointCount } =
            cluster.properties;

          if (isCluster) {
            return (
              <Marker
                key={`cluster-${cluster.id}`}
                longitude={longitude}
                latitude={latitude}
                anchor="center"
              >
                <ClusterMarker
                  onClick={() => {
                    const expansionZoom = Math.min(
                      supercluster.getClusterExpansionZoom(cluster.id),
                      20,
                    );
                    map?.flyTo({
                      center: [longitude, latitude],
                      zoom: expansionZoom,
                      duration: 300,
                    });
                  }}
                  pointCount={pointCount}
                >
                  {pointCount}
                </ClusterMarker>
              </Marker>
            );
          }

          const market = cluster.properties.market;
          const vendorName = market.vendor?.name || market.name;
          return (
            <React.Fragment key={`market-${cluster.properties.marketIndex}`}>
              <Marker
                longitude={longitude}
                latitude={latitude}
                anchor="bottom"
                onClick={() => setSelectedMarket(market)}
              >
                <VendorMarkerIcon
                  viewBox="0 -960 960 960"
                  aria-label={`${market.name} marker`}
                  $verticalOffset={verticalOffset}
                  $markerColor={getVendorMarkerColor(vendorName)}
                >
                  <path d={VENDOR_MARKER_PATH} />
                </VendorMarkerIcon>
              </Marker>

              {selectedMarket === market && (
                <Popup
                  longitude={longitude}
                  latitude={latitude}
                  anchor="bottom"
                  onClose={() => setSelectedMarket(null)}
                  closeOnClick={false}
                  offset={[0, -95 + verticalOffset * 1.5]}
                  maxWidth="260px"
                >
                  <VendorPopup>
                    <Box
                      sx={{
                        p: 2,
                        pb: 1.5,
                        pr: 5,
                        width: "100%",
                        backgroundColor: "background.paper",
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold" noWrap>
                        {market.name}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: "100%",
                        height: "140px",
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? theme.palette.background.default
                            : theme.palette.grey[100],
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderTop: `1px solid ${theme.palette.divider}`,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      {market.vendor?.image ? (
                        <Box
                          component="img"
                          src={`${BASE_URL}${market.vendor.image.url}`}
                          alt={market.name}
                          sx={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                            p: 1,
                          }}
                        />
                      ) : (
                        <ImageIcon
                          sx={{
                            fontSize: 48,
                            color: theme.palette.text.disabled,
                          }}
                        />
                      )}
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        pt: 1.5,
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        backgroundColor: "background.paper",
                      }}
                    >
                      <MapProductInfoModal marketId={market._id} />
                      <Button
                        disabled={isDisabledRoutingButton}
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={() => onVendorLocation([longitude, latitude])}
                        sx={{ textTransform: "none", borderRadius: 2, py: 1 }}
                      >
                        Добиј насоки
                        <ArrowRightAltIcon sx={{ marginLeft: 0.5 }} />
                      </Button>
                    </Box>
                  </VendorPopup>
                </Popup>
              )}
            </React.Fragment>
          );
        })}
    </>
  );
};

const ClusterMarker = styled("div")(({ theme, pointCount }) => ({
  height: "2rem",
  width: "2rem",
  borderRadius: "50%",
  backgroundColor: theme.palette.error.main,
  color: "#ffffff",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontWeight: 900,
  fontSize: "1rem",
  cursor: "pointer",
  border: `2px solid ${theme.palette.background.paper}`,
  boxShadow: `0 0 10px ${theme.palette.error.main}80`,
  transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
  animation: "clusterPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
  "&:hover": {
    transform: "scale(1.15)",
    boxShadow: `0 0 20px ${theme.palette.error.main}, 0 0 30px ${theme.palette.error.main}60`,
  },
  "&:active": {
    transform: "scale(0.95)",
  },
  ...(pointCount > 10 && {
    height: "2.5rem",
    width: "2.5rem",
    fontSize: "1.1rem",
  }),
  ...(pointCount > 50 && { height: "3rem", width: "3rem", fontSize: "1.2rem" }),
  "@keyframes clusterPop": {
    "0%": { opacity: 0, transform: "scale(0)" },
    "50%": { transform: "scale(1.1)" },
    "100%": { opacity: 1, transform: "scale(1)" },
  },
}));

const VendorMarkerIcon = styled("svg", {
  shouldForwardProp: (prop) =>
    prop !== "$verticalOffset" && prop !== "$markerColor",
})(({ $verticalOffset = 0, $markerColor }) => ({
  width: 38,
  height: 95,
  display: "block",
  cursor: "pointer",
  color: $markerColor,
  fill: "currentColor",
  transform: `translateY(${$verticalOffset}px)`,
  transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
  animation: "markerDrop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
  "&:hover": {
    transform: `translateY(${$verticalOffset}px) scale(1.1)`,
    filter: `drop-shadow(0 0 10px ${$markerColor})`,
  },
  "&:active": {
    transform: `translateY(${$verticalOffset}px) scale(0.95)`,
  },
  "@keyframes markerDrop": {
    "0%": {
      opacity: 0,
      transform: `translateY(${$verticalOffset - 50}px) scale(0.3)`,
    },
    "50%": { transform: `translateY(${$verticalOffset + 5}px) scale(1.05)` },
    "100%": {
      opacity: 1,
      transform: `translateY(${$verticalOffset}px) scale(1)`,
    },
  },
}));

const VendorPopup = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  flexDirection: "column",
  width: "100%",
}));

export default VendorMarkers;
