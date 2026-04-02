import React from "react";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const HolidaySearchBar = ({ handleSearchChange }) => {
  return (
    <TextField
      hiddenLabel
      placeholder="Search holidays..."
      variant="outlined"
      onChange={handleSearchChange}
      fullWidth
      size="small"
      sx={{
        backgroundColor: "background.paper",
        "& .MuiOutlinedInput-root": {
          "&.Mui-focused fieldset": {
            borderColor: "primary.main",
          },
        },
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default HolidaySearchBar;
