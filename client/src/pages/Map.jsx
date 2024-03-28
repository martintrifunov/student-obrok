import React, { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import DealMarkers from "../components/DealMarkers";
import "leaflet/dist/leaflet.css";
import "../assets/map.css";
import LocateUser from "../components/LocateUser";
import RoutingEngine from "../components/RoutingEngine";
import { Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GlobalLoadingProgress from "../components/GlobalLoadingProgress";
import CreditMarker from "../components/CreditMarker";

const Map = () => {
  const position = [42.00430265307896, 21.409471852749466];
  const [userLocation, setUserLocation] = useState(null);
  const [dealLocation, setDealLocation] = useState(null);
  const [isDisabledRoutingButton, changeIsDisabledRoutingButton] =
    useState(false);
  const [route, setRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUserLocation = (location) => {
    setUserLocation(location);
  };

  const handleDealLocation = (location) => {
    setRoute({ start: userLocation, end: location });
    setDealLocation(location);
    changeIsDisabledRoutingButton(true);
  };

  const handleCancelRoute = () => {
    setRoute(null);
    setDealLocation(null);
    changeIsDisabledRoutingButton(false);
  };

  const cancelRouteButtonStyle = {
    position: "absolute",
    top: "10px",
    right: "10px",
    zIndex: 1000,
    backgroundColor: "crimson",
    textTransform: "none",
    color: "white",
  };

  return (
    <>
      {isLoading && <GlobalLoadingProgress />}
      <div className="map-container">
        <MapContainer
          center={position}
          minZoom={10}
          zoom={16}
          maxZoom={18}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DealMarkers
            onDealLocation={handleDealLocation}
            isDisabledRoutingButton={isDisabledRoutingButton}
          />
          <CreditMarker />
          <LocateUser
            onUserLocation={handleUserLocation}
            setIsLoading={setIsLoading}
          />
          {route && (
            <>
              <Button
                variant="contained"
                style={cancelRouteButtonStyle}
                onClick={handleCancelRoute}
              >
                <CloseIcon sx={{ marginRight: "5px" }} /> Cancel Route
              </Button>
              <RoutingEngine start={route?.start} end={route?.end} />
            </>
          )}
        </MapContainer>
      </div>
    </>
  );
};

export default Map;
