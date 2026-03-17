import React, { useState, useMemo, useRef, useEffect } from "react";
import { Marker, Popup } from "react-map-gl/maplibre";
import { useQuery } from "@tanstack/react-query";
import axios from "@/api/axios";
import { Button, Typography, Box, styled, useTheme } from "@mui/material";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import vendorlocationMarker from "@/assets/icons/vendor_location_marker.svg";
import ImageIcon from "@mui/icons-material/Image";
import useSupercluster from "use-supercluster";
import { useMap } from "react-map-gl/maplibre";
import useMapPitch from "@/features/map/hooks/useMapPitch";
import { BASE_URL } from "@/api/consts";
import MapProductInfoModal from "@/features/map/components/MapProductInfoModal";

const VendorMarkers = ({ onVendorLocation, isDisabledRoutingButton }) => {
  const theme = useTheme();
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [bounds, setBounds] = useState(null);
  const [zoom, setZoom] = useState(16);
  const pitch = useMapPitch();
  const { current: map } = useMap();
  const updateTimeoutRef = useRef(null);
  const verticalOffset = useMemo(() => pitch * 0.8, [pitch]);

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ["vendors", "map"],
    queryFn: async () => {
      const response = await axios.get("/vendors?limit=0", {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      return response.data.data;
    },
  });

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
      vendors.map((vendor, index) => ({
        type: "Feature",
        properties: {
          cluster: false,
          vendorId: index,
          vendor: vendor,
        },
        geometry: {
          type: "Point",
          coordinates: [vendor.location[1], vendor.location[0]],
        },
      })),
    [vendors],
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

          const vendor = cluster.properties.vendor;
          return (
            <React.Fragment key={`vendor-${cluster.properties.vendorId}`}>
              <Marker
                longitude={longitude}
                latitude={latitude}
                anchor="bottom"
                onClick={() => setSelectedVendor(vendor)}
              >
                <VendorMarkerImage
                  src={vendorlocationMarker}
                  alt="vendor marker"
                  $verticalOffset={verticalOffset}
                />
              </Marker>

              {selectedVendor === vendor && (
                <Popup
                  longitude={longitude}
                  latitude={latitude}
                  anchor="bottom"
                  onClose={() => setSelectedVendor(null)}
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
                        {vendor.name}
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
                      {vendor?.image ? (
                        <Box
                          component="img"
                          src={`${BASE_URL}${vendor.image.url}`}
                          alt={vendor.name}
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
                      <MapProductInfoModal vendorId={vendor._id} />
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

const VendorMarkerImage = styled("img")(({ theme, $verticalOffset = 0 }) => ({
  width: 38,
  height: 95,
  display: "block",
  cursor: "pointer",
  transform: `translateY(${$verticalOffset}px)`,
  transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
  animation: "markerDrop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
  "&:hover": {
    transform: `translateY(${$verticalOffset}px) scale(1.1)`,
    filter: `drop-shadow(0 0 10px ${theme.palette.error.main})`,
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
