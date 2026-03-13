import React from "react";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const VendorSearchBar = ({ handleSearchChange }) => {
  return (
    <TextField
      hiddenLabel
      placeholder="Search vendors..."
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

export default VendorSearchBar;
