import React from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import DealMarkers from "../components/DealMarkers";
import "leaflet/dist/leaflet.css";
import "../assets/map.css";
import FlyMapTo from "../components/FlyMapTo";

const Map = () => {
  const position = [42.00430265307896, 21.409471852749466];
        
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
        <DealMarkers />
        <FlyMapTo position={[41.9981, 21.4254]}/>
      </MapContainer>
    </div>
  );
};

export default Map;
