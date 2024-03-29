import React from "react";
import { Box, LinearProgress, Typography } from "@mui/material";

const GlobalLoadingProgress = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      zIndex="1001"
    >
      <Typography variant="h6">Студентски Оброк</Typography>
      <Box width="15%" marginTop="10px">
        <LinearProgress color="inherit" />
      </Box>
    </Box>
  );
};

export default GlobalLoadingProgress;
