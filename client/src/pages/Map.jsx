import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../assets/map.css";

const Map = () => {
  const position = [51.505, -0.09]; // Specify your desired center coordinates

  return (
    <div className="map-container">
      <MapContainer center={position} zoom={13} scrollWheelZoom={true}>
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>Lets go dude!</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default Map;
