import React from "react";
import { TextField, InputAdornment, useMediaQuery } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const DealSearchBar = ({ theme, handleSearchChange }) => {
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <TextField
      hiddenLabel
      placeholder="Search deals..."
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
        width: isMediumScreen ? "50%" : "15%",
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
