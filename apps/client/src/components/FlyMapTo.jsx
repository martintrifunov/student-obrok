import { useEffect } from "react";
import { useMap } from "react-leaflet";

const FlyMapTo = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    map.flyTo(position);
  }, [position]);

  return null;
};

export default FlyMapTo;
