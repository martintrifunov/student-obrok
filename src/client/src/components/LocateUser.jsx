import React, { useEffect, useState, useRef } from "react";
import { Marker, useMap } from "react-leaflet";
import L from "leaflet";
import myLocationMarker from "../assets/icons/my_location_marker.svg";

const LocateUser = ({ onUserLocation, setIsLoading }) => {
  const map = useMap();
  const [position, setPosition] = useState(null);
  const firstFlyBy = useRef(true);

  useEffect(() => {
    firstFlyBy.current && setIsLoading(true);
    const intervalId = setInterval(() => {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setPosition([latitude, longitude]);
        onUserLocation([latitude, longitude]);
        setIsLoading(false);
        if (firstFlyBy.current) {
          map.flyTo([latitude, longitude], map.getZoom());
          firstFlyBy.current = false;
        }
      });
    }, 5000); // update every 5 seconds

    return () => clearInterval(intervalId); // cleanup on unmount
  }, [map]);

  const userIcon = L.icon({
    iconUrl: myLocationMarker,
    iconSize: [38, 95],
  });

  return position === null ? null : (
    <Marker position={position} icon={userIcon} />
  );
};

export default LocateUser;
