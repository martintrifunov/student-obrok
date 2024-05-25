import React, { useRef, useState } from "react";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { ThemeProvider } from "@emotion/react";
import { createTheme, styled } from "@mui/material";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";

const DashboardImageModal = ({ imageTitle, image, variant }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const theme = createTheme();
  const imageRef = useRef(null);

  return (
    <ThemeProvider theme={theme}>
      <Box>
        <Button
          color="inherit"
          variant={variant || ""}
          sx={{ textTransform: "none" }}
          onClick={handleOpen}
          disabled={imageTitle === null}
        >
          <RemoveRedEyeIcon sx={{ marginRight: 1 }} /> View
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
            <ModalContent>
              <Typography
                id="transition-modal-title"
                variant="h6"
                textAlign="center"
                component="h2"
                className="tldr"
              >
                {imageTitle}
              </Typography>
              <Box className="box">
                <img
                  src={image}
                  ref={imageRef}
                  className="image"
                  alt="coverImage"
                />
              </Box>
            </ModalContent>
          </Fade>
        </Modal>
      </Box>
    </ThemeProvider>
  );
};

const ModalContent = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "white",
  boxShadow: 24,
  padding: 40,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",

  "& .box": {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "auto",
    height: "auto",
    maxWidth: "90vw",
    maxHeight: "90vh",
  },

  "& .image": {
    maxWidth: "100%",
    height: "auto",
    display: "block",
    border: "5px solid white",
  },

  "& .tldr": {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
}));

export default DashboardImageModal;
