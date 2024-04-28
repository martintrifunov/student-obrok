import React, { useEffect, useState } from "react";
import { Marker, Popup } from "react-leaflet";
import axios from "../api/axios";
import { Button, Typography, Box } from "@mui/material";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import MapDealInfoModal from "./MapDealInfoModal";
import L from "leaflet";
import vendorlocationMarker from "../assets/icons/vendor_location_marker.svg";
import MarkerClusterGroup from "react-leaflet-cluster";

const VendorMarkers = ({ onVendorLocation, isDisabledRoutingButton }) => {
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

  const dealIcon = L.icon({
    iconUrl: vendorlocationMarker,
    iconSize: [38, 95],
  });

  const coverImgStyle = {
    width: "100%",
    maxHeight: "230px",
    objectFit: "cover",
  };

  const popupStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "column",
    width: 200,
    height: 450,
  };

  const getDirectionButtonStyle = {
    backgroundColor: "black",
    textTransform: "none",
    color: "white",
    marginTop: 15,
  };

  const getDisabledDirectionButtonStyle = {
    backgroundColor: "#424242",
    textTransform: "none",
    color: "white",
    marginTop: 15,
  };

  const clusterIcon = (cluster) => {
    return L.divIcon({
      html: `<div style="height: 2rem; width: 2rem; border-radius: 50%; background-color: crimson; color: white; transform: translate(-25%, -25%); display: flex; justify-content: center; align-items: center; font-weight: 900; font-size: 1rem">${cluster.getChildCount()}</div>`,
      className: "marker-cluster", // optional, define a class for the divIcon if you want to style it via CSS
      iconSize: L.point(33, 33, true), // size of the icon
    });
  };

  return (
    <>
      {!isLoading && (
        <MarkerClusterGroup chunkedLoading iconCreateFunction={clusterIcon}>
          {vendors.map((vendor, index) => (
            <Marker key={index} position={vendor.location} icon={dealIcon}>
              <Popup>
                <Box style={popupStyle}>
                  <Typography variant="h5" textAlign="center">
                    {vendor.name}
                  </Typography>
                  <img
                    src={vendor.image}
                    alt="coverImage"
                    style={coverImgStyle}
                  />
                  <Box>
                    <MapDealInfoModal deals={vendor.deals} />
                    <Button
                      disabled={isDisabledRoutingButton}
                      fullWidth
                      variant="contained"
                      style={
                        isDisabledRoutingButton
                          ? getDisabledDirectionButtonStyle
                          : getDirectionButtonStyle
                      }
                      onClick={() => onVendorLocation(vendor.location)}
                    >
                      Get Directions
                      <ArrowRightAltIcon sx={{ marginLeft: 0.5 }} />
                    </Button>
                  </Box>
                </Box>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      )}
    </>
  );
};

export default VendorMarkers;
