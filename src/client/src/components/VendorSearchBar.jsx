import React from "react";
import { TextField, InputAdornment, useMediaQuery } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const DealSearchBar = ({ theme, handleSearchChange }) => {
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));


  return (
    <TextField
      hiddenLabel
      placeholder="Search vendors..."
      variant="outlined"
      onChange={handleSearchChange}
      sx={{
        "& .MuiOutlinedInput-root": {
          "&.Mui-focused fieldset": {
            borderColor: "black",
          },
        },
        "& label.Mui-focused": {
          color: "black",
        },
        width: isSmallScreen ? "50%" : "20%",
      }}
      size="small"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default DealSearchBar;
