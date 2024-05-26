import React from "react";
import { TextField, InputAdornment, useMediaQuery } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const DealSearchBar = ({ theme, handleSearchChange }) => {
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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
        width: isSmallScreen ? "50%" : "20%",
        marginTop: isSmallScreen && "5vh",
        marginLeft: "1vw",
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
