import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../assets/map.css";

const Map = () => {
  const position = [42.00430265307896, 21.409471852749466]; // Specify your desired center coordinates

  return (
    <div className="map-container">
      <MapContainer center={position} minZoom={10} zoom={16} maxZoom={18} scrollWheelZoom={true}>
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>STINKI</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default Map;
