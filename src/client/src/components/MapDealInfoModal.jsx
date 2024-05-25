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
          <InfoIcon sx={{ marginRight: 0.5 }} /> View Deals
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
  width: useMediaQuery(theme.breakpoints.down("sm")) ? "90%" : "40%",
  height: useMediaQuery(theme.breakpoints.down("sm")) ? "85%" : "80%",
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
    maxHeight: "250px",
    objectFit: "cover",
  },
  "& .image-icon": {
    width: "100%",
    height: "250px",
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
}));

export default MapDealInfoModal;
