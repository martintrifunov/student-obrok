import React from "react";
import { Marker, Popup } from "react-leaflet";
import { Typography, Box } from "@mui/material";
import L from "leaflet";
import creditLocationMarker from "../assets/icons/credit_location_marker.svg";
import creditPopupIcon from "../assets/icons/credit_popup.svg";

const CreditMarker = () => {
  const position = [42.00430265307896, 21.409471852749466];

  const creditIcon = L.icon({
    iconUrl: creditLocationMarker,
    iconSize: [38, 95],
  });

  const popupStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    flexDirection: "column",
    width: 200,
    height: 450,
  };

  const imageStyle = {
    width: 100,
    height: 100,
  };

  return (
    <Marker position={position} icon={creditIcon}>
      <Popup>
        <Box style={popupStyle}>
          <Typography variant="h5" textAlign="center">
            Студентски Оброк
          </Typography>
          <img src={creditPopupIcon} style={imageStyle} alt="creditIcon" />
          <Typography variant="p" textAlign="left">
            <strong>Студентски Оброк</strong>, развиен од{" "}
            <strong>Мартин Трифунов</strong>, е веб апликација дизајнирана да
            помогне на студентите во наоѓањето на економични оброци за ручек на
            удобен начин. Со нудење на корисен интерфејс, ја упрости процедурата
            за наоѓање на блиски ресторани со попусти, во соодветство со
            потребите на студентите со ограничен буџет.
          </Typography>
        </Box>
      </Popup>
    </Marker>
  );
};

export default CreditMarker;
