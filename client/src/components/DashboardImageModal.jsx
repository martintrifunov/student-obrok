import React, { useState } from "react";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  height: "80%",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const imageStyle = {
  maxWidth: "50%",
  height: "auto",
  display: "block",
  margin: "0 auto",
};

const DashboardImageModal = ({ imageTitle, image, variant }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button
        color="inherit"
        variant={variant || ""}
        sx={{ textTransform: "none" }}
        onClick={handleOpen}
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
          <Box sx={style}>
            <Typography
              id="transition-modal-title"
              variant="h6"
              textAlign="center"
              component="h2"
            >
              {imageTitle}
            </Typography>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              width="100%"
              height="100%"
            >
              <img src={image} style={imageStyle} alt="coverImage" />
            </Box>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
};

export default DashboardImageModal;
