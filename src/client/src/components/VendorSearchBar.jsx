import React from "react";
import {
  Button,
  Grid,
  TextField,
  InputAdornment,
  useMediaQuery,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const VendorSearchBar = ({ theme, handleSearchChange }) => {
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

  const gridStyle = {
    display: "flex",
    marginLeft: "1vw",
    marginRight: "1vw",
    justifyContent: "space-between",
    marginTop: "10vh",
  };

  return (
    <Grid style={gridStyle}>
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
    </Grid>
  );
};

export default VendorSearchBar;
