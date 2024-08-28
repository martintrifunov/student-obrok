import React, { useState } from "react";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import InfoIcon from "@mui/icons-material/Info";
import { ThemeProvider } from "@emotion/react";
import { createTheme, styled, useMediaQuery } from "@mui/material";
import Pagination from "@mui/material/Pagination";
import parse from "html-react-parser";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";

const MapDealInfoModal = ({ deals }) => {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setPage(1);
  };
  const theme = createTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const dealsPerPage = 1;
  const totalPages =
    deals !== null ? Math.ceil(deals.length / dealsPerPage) : 0;

  const handleChange = (event, value) => {
    setPage(value);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box>
        <Button
          color="inherit"
          fullWidth
          variant="outlined"
          sx={{ textTransform: "none", width: 200 }}
          onClick={handleOpen}
          disabled={deals === null}
        >
          <InfoIcon sx={{ marginRight: 0.5 }} /> Понуди
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
              {deals
                ?.slice((page - 1) * dealsPerPage, page * dealsPerPage)
                .map((deal, index) => (
                  <Box key={index} className="modal">
                    <IconButton
                      aria-label="close"
                      onClick={handleClose}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                    <Box className="top-section">
                      <Typography
                        className="title"
                        id={`deal-title-${index}`}
                        variant={isSmallScreen ? "h5" : "h4"}
                        component="h2"
                        textAlign="center"
                        sx={{ marginBottom: 3 }}
                      >
                        {deal.title}
                      </Typography>
                      <Box className="image-container">
                        {deal?.image ? (
                          <img
                            src={deal.image}
                            alt="coverImage"
                            className="image"
                          />
                        ) : (
                          <ImageIcon className="image-icon" />
                        )}
                      </Box>
                    </Box>
                    <Box className="middle-section">
                      <Typography
                        id={`deal-description-${index}`}
                        variant="p"
                        sx={{ fontSize: "14px" }}
                        textAlign="left"
                      >
                        {parse(deal.description)}
                      </Typography>
                    </Box>
                    <Box className="bottom-section">
                      <Typography
                        id={`deal-price-${index}`}
                        variant="h6"
                        textAlign="center"
                        sx={{
                          marginTop: 2,
                          marginBottom: 2,
                          fontWeight: "bold",
                        }}
                      >
                        {deal.price} ден.
                      </Typography>
                      <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handleChange}
                        className="pagination"
                      />
                    </Box>
                  </Box>
                ))}
            </ModalContent>
          </Fade>
        </Modal>
      </Box>
    </ThemeProvider>
  );
};

const ModalContent = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: useMediaQuery(theme.breakpoints.down("md")) ? "90%" : "40%",
  height: useMediaQuery(theme.breakpoints.down("md")) ? "85%" : "80%",
  backgroundColor: "white",
  boxShadow: 24,
  padding: 40,
  borderRadius: 20,
  "& .modal": {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
  },
  "& .top-section": {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  "& .image-container": {
    marginBottom: theme.spacing(2),
  },
  "& .image": {
    width: "100%",
    maxHeight: useMediaQuery(theme.breakpoints.down("sm")) ? "150px" : "250px",
    objectFit: "cover",
  },
  "& .image-icon": {
    width: "100%",
    height: useMediaQuery(theme.breakpoints.down("sm")) ? "150px" : "250px",
  },
  "& .title": {
    marginBottom: theme.spacing(2),
  },
  "& .middle-section": {
    overflowY: "auto",
    height: "100%",
  },
  "& .bottom-section": {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  "& .pagination": {
    display: "flex",
    width: "100vw",
    alignItems: "center",
    justifyContent: "center",
  },

  // iPhone SE
  [`@media (min-width: 375px) and (max-width: 375px) and 
    (min-height: 667px) and (max-height: 667px)`]: {
    width: "93vw",
  },

  // Galaxy S8+
  [`@media (min-width: 360px) and (max-width: 360px) and 
    (min-height: 740px) and (max-height: 740px)`]: {
    width: "97vw",
  },

  // iPad Mini
  [`@media (min-width: 768px) and (max-width: 768px) and 
    (min-height: 1024px) and (max-height: 1024px)`]: {
    width: "85vw",
  },

  // Surface Pro 7
  [`@media (min-width: 912px) and (max-width: 912px) and 
    (min-height: 1368px) and (max-height: 1368px)`]: {
    width: "80vw",
  },

  // Galaxy Fold
  [`@media (min-width: 280px) and (max-width: 280px) and 
    (min-height: 653px) and (max-height: 653px)`]: {
    width: "95vw",

    "& .pagination": {
      display: "flex",
      width: "70vw",
      alignItems: "center",
      justifyContent: "center",
    },
  },

  // Nest Hub
  [`@media (min-width: 1024px) and (max-width: 1024px) and 
    (min-height: 600px) and (max-height: 600px)`]: {
    width: "40vw",
    height: "90vh",

    "& .image": {
      width: "100%",
      maxHeight: "150px",
      objectFit: "cover",
    },
    "& .image-icon": {
      width: "100%",
      height: "150px",
    },
  },
}));

export default MapDealInfoModal;
