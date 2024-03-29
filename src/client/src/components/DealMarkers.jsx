import React, { useEffect, useState } from "react";
import { Marker, Popup } from "react-leaflet";
import axios from "../api/axios";
import { Button, Typography, Box } from "@mui/material";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import MapDealInfoModal from "./MapDealInfoModal";
import L from "leaflet";
import dealLocationMarker from "../assets/icons/deal_location_marker.svg";
import MarkerClusterGroup from "react-leaflet-cluster";

const DealMarkers = ({ onDealLocation, isDisabledRoutingButton }) => {
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    setIsLoading(true);

    const fetchDeals = async () => {
      try {
        const response = await axios.get(
          "/deals",
          {
            signal: controller.signal,
          },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        isMounted && setDeals(response.data);
        setIsLoading(false);
      } catch (error) {
        setError(error.response.data.message);
        navigate("/login", { state: { from: location }, replace: true });
      }
    };

    fetchDeals();

    return () => {
      isMounted = false;
      setIsLoading(false);
      controller.abort();
    };
  }, []);

  const dealIcon = L.icon({
    iconUrl: dealLocationMarker,
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
          {deals.map((deal, index) => (
            <Marker key={index} position={deal.location} icon={dealIcon}>
              <Popup>
                <Box style={popupStyle}>
                  <Typography variant="h5" textAlign="center">
                    {deal.title}
                  </Typography>
                  <img
                    src={deal.image}
                    alt="coverImage"
                    style={coverImgStyle}
                  />
                  <Typography variant="h5" textAlign="center">
                    {deal.locationName}
                  </Typography>
                  <Typography variant="h6" textAlign="center">
                    <strong>{deal.price}</strong> ден.
                  </Typography>
                  <Box>
                    <MapDealInfoModal deal={deal} />
                    <Button
                      disabled={isDisabledRoutingButton}
                      fullWidth
                      variant="contained"
                      style={
                        isDisabledRoutingButton
                          ? getDisabledDirectionButtonStyle
                          : getDirectionButtonStyle
                      }
                      onClick={() => onDealLocation(deal.location)}
                    >
                      Get Directions <ArrowRightAltIcon />
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

export default DealMarkers;
