import React, { useEffect, useState } from "react";
import { Marker, Popup } from "react-leaflet";
import axios from "../api/axios";
import { Button, Typography, Box, styled } from "@mui/material";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import MapDealInfoModal from "./MapDealInfoModal";
import L from "leaflet";
import vendorlocationMarker from "../assets/icons/vendor_location_marker.svg";
import MarkerClusterGroup from "react-leaflet-cluster";

const VendorMarkers = ({ onVendorLocation, isDisabledRoutingButton }) => {
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [_, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    setIsLoading(true);

    const fetchVendors = async () => {
      try {
        const response = await axios.get(
          "/vendors",
          {
            signal: controller.signal,
          },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        isMounted && setVendors(response.data);
        setIsLoading(false);
      } catch (error) {
        setError(error.response.data.message);
        navigate("/login", { state: { from: location }, replace: true });
      }
    };

    fetchVendors();

    return () => {
      isMounted = false;
      setIsLoading(false);
      controller.abort();
    };
  }, []);

  const vendorIcon = L.icon({
    iconUrl: vendorlocationMarker,
    iconSize: [38, 95],
  });

  const clusterIcon = (cluster) => {
    return L.divIcon({
      html: `<div style="height: 2rem; width: 2rem; border-radius: 50%; background-color: crimson; color: white; transform: translate(-25%, -25%); display: flex; justify-content: center; align-items: center; font-weight: 900; font-size: 1rem">${cluster.getChildCount()}</div>`,
      className: "marker-cluster",
      iconSize: L.point(33, 33, true),
    });
  };

  return (
    <>
      {!isLoading && (
        <MarkerClusterGroup chunkedLoading iconCreateFunction={clusterIcon}>
          {vendors.map((vendor, index) => (
            <Marker key={index} position={vendor.location} icon={vendorIcon}>
              <Popup>
                <VendorPopup>
                  <Typography variant="h5" textAlign="center">
                    {vendor.name}
                  </Typography>
                  <img
                    src={vendor.image}
                    alt="coverImage"
                    className="vendor-cover-image"
                  />
                  <Box>
                    <MapDealInfoModal deals={vendor.deals} />
                    <GetDirectionsButton
                      disabled={isDisabledRoutingButton}
                      fullWidth
                      variant="contained"
                      onClick={() => onVendorLocation(vendor.location)}
                    >
                      Get Directions
                      <ArrowRightAltIcon sx={{ marginLeft: 0.5 }} />
                    </GetDirectionsButton>
                  </Box>
                </VendorPopup>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      )}
    </>
  );
};

const VendorPopup = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexDirection: "column",
  width: 200,
  height: 350,

  "& .vendor-cover-image": {
    width: "100%",
    maxHeight: "230px",
    objectFit: "cover",
  },
}));

const GetDirectionsButton = styled(Button)(({ theme }) => ({
  backgroundColor: "black",
  textTransform: "none",
  color: "white",
  marginTop: 15,

  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
}));

export default VendorMarkers;
