import React, { useEffect, useState } from "react";
import { Marker, Popup } from "react-leaflet";
import axios from "../api/axios";
import { Button, Typography, Box } from "@mui/material";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import MapDealInfoModal from "./MapDealInfoModal";

const DealMarkers = () => {
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const position = [42.00430265307896, 21.409471852749466];

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

  const coverImgStyle = {
    width: "100%",
    height: 250,
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
  };

  return (
    <>
      {!isLoading &&
        deals.map((deal, index) => (
          <Marker key={index} position={deal.location}>
            <Popup>
              <Box style={popupStyle}>
                <Typography variant="h5" textAlign="center">
                  {deal.locationName}
                </Typography>
                <img src={deal.image} alt="coverImage" style={coverImgStyle} />

                <Typography variant="p" textAlign="center">
                  {deal.price} ден.
                </Typography>
                <MapDealInfoModal deal={deal} />
                <Button
                  fullWidth
                  variant="contained"
                  style={getDirectionButtonStyle}
                >
                  Get Directions <ArrowRightAltIcon />
                </Button>
              </Box>
            </Popup>
          </Marker>
        ))}
    </>
  );
};

export default DealMarkers;
