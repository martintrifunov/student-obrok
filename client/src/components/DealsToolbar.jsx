import React from "react";
import {
  Button,
  Grid,
  TextField,
  InputAdornment,
  useMediaQuery,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";

const DealsToolbar = ({ theme, handleSearchChange }) => {
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const gridStyle = {
    display: "flex",
    marginLeft: "1vw",
    marginRight: "1vw",
    justifyContent: "space-between",
    marginTop: "10vh",
  };

  const buttonStyle = {
    textTransform: "none",
    backgroundColor: "black",
  };

  const handleAddDeal = () => {
    navigate("/dashboard/deal");
  };
  return (
    <Grid style={gridStyle}>
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
      <Button
        variant="contained"
        style={buttonStyle}
        onClick={() => handleAddDeal()}
      >
        <AddIcon />
        Add Deal
      </Button>
    </Grid>
  );
};

export default DealsToolbar;
