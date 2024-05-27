import React from "react";
import { TextField, InputAdornment, useMediaQuery } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const DealSearchBar = ({ theme, handleSearchChange }) => {
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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
        width: isSmallScreen ? "212px" : "20%",
        justifyContent: "end",
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
