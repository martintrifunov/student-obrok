import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import { OSRM_URL } from "../api/consts";

const RoutingEngine = ({ start, end }) => {
  const map = useMap();
  const routingControl = useRef(null);

  useEffect(() => {
    if (start && end) {
      routingControl.current = L.Routing.control({
        waypoints: [L.latLng(start), L.latLng(end)],
        lineOptions: {
          styles: [{ color: "#6FA1EC", weight: 5 }],
        },
        router: L.Routing.osrmv1({
          serviceUrl: OSRM_URL
        }),
        createMarker: function () {
          return null;
        },
        createControl: function () {
          return null;
        },
        show: false,
        routeWhileDragging: true,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
        collapsible: false,
      }).addTo(map);
    }

    return () => {
      if (routingControl.current) {
        map.removeControl(routingControl.current);
      }
    };
  }, [map, start, end]);

  return null;
};

export default RoutingEngine;
