import React, { useEffect, useState } from "react";
import { Marker, Popup } from "react-leaflet";
import axios from "../api/axios";

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

  console.log(deals);
  return (
    <>
      {!isLoading &&
        deals.map((deal, index) => (
          <Marker key={index} position={deal.location}>
            <Popup>{deal.locationName}</Popup>
          </Marker>
        ))}
    </>
  );
};

export default DealMarkers;
