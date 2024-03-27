import React, { useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import DealMarkers from "../components/DealMarkers";
import "leaflet/dist/leaflet.css";
import "../assets/map.css";
import FlyMapTo from "../components/FlyMapTo";
import LocateUser from "../components/LocateUser";
import RoutingEngine from "../components/RoutingEngine";
import { Button } from "@mui/material";

const Map = () => {
  const position = [42.00430265307896, 21.409471852749466];
  const [userLocation, setUserLocation] = useState(null);
  const [dealLocation, setDealLocation] = useState(null);
  const [isDisabledRoutingButton, changeIsDisabledRoutingButton] =
    useState(false);
  const [route, setRoute] = useState(null);

  const handleUserLocation = (location) => {
    setUserLocation(location);
  };

  const handleDealLocation = (location) => {
    setRoute({ start: userLocation, end: location });
    setDealLocation(location);
    changeIsDisabledRoutingButton(true);
  };

  return (
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
        <LocateUser onUserLocation={handleUserLocation} />
        {route && <RoutingEngine start={route.start} end={route.end} />}
      </MapContainer>
    </div>
  );
};

export default Map;
