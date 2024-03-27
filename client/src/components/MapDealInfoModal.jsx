import React, { useState } from "react";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import InfoIcon from "@mui/icons-material/Info";
import { ThemeProvider } from "@emotion/react";
import { createTheme, useMediaQuery } from "@mui/material";

const MapDealInfoModal = ({ deal }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const theme = createTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const style = {
    display: "flex",
    flexDirection: "column",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isSmallScreen ? "90%" : "40%",
    height: isSmallScreen ? "85%" : "80%",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    justifyContent: "space-between",
  };

  const infoButtonStyle = {
    textTransform: "none",
    width: 200,
  };
  
  const imageStyle = {
    maxWidth: "50%",
    height: "auto",
    display: "block",
    margin: "0 auto",
  };

  return (
    <ThemeProvider theme={theme}>
      <div>
        <Button
          color="inherit"
          fullWidth
          variant="outlined"
          style={infoButtonStyle}
          onClick={handleOpen}
        >
          <InfoIcon /> Deal info
        </Button>
        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          open={open}
          onClose={handleClose}
          closeAfterTransition
          slots={{ backdrop: Backdrop }}
          slotProps={{
            backdrop: {
              timeout: 500,
            },
          }}
        >
          <Fade in={open}>
            <Box sx={style}>
              <Typography
                id="transition-modal-title"
                variant="h4"
                component="h2"
                textAlign="center"
              >
                Deal Title
              </Typography>
              <img src={deal.image} style={imageStyle} alt="coverImage" />
              <Typography
                id="transition-modal-description"
                variant="p"
                sx={{ mt: 2, fontSize: isSmallScreen && "14px" }}
                textAlign="left"
              >
                {deal.description}
              </Typography>
              <Box>
                <Typography
                  id="transition-modal-description"
                  variant="h6"
                  sx={{ mt: 2 }}
                  textAlign="center"
                >
                  {deal.locationName}
                </Typography>
                <Typography
                  id="transition-modal-description"
                  variant="h6"
                  textAlign="center"
                  sx={{ mt: 2 }}
                >
                  {deal.price} ден.
                </Typography>
              </Box>
            </Box>
          </Fade>
        </Modal>
      </div>
    </ThemeProvider>
  );
};

export default MapDealInfoModal;
