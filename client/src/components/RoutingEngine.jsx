import React, { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

const RoutingEngine = ({ start, end }) => {
  const map = useMap();

  useEffect(() => {
    if (start && end) {
      L.Routing.control({
        waypoints: [L.latLng(start), L.latLng(end)],
        lineOptions: {
          styles: [{ color: "#6FA1EC", weight: 5 }],
        },
        createMarker: function() { return null; },
        createControl: function() { return null; },
        show: false,
        routeWhileDragging: true,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
        collapsible: false
      }).addTo(map);
    }
  }, [map, start, end]);

  return null;
};

export default RoutingEngine;
