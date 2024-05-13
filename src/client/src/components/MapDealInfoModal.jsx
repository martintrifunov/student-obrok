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
import Pagination from "@mui/material/Pagination";

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

  const dealsPerPage = 2;
  const totalPages =
    deals !== null ? Math.ceil(deals.length / dealsPerPage) : 0;

  const handleChange = (event, value) => {
    setPage(value);
  };

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

  const coverImgStyle = {
    width: "100%",
    maxHeight: "230px",
    objectFit: "cover",
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
            <Box sx={style}>
              {deals
                ?.slice((page - 1) * dealsPerPage, page * dealsPerPage)
                .map((deal, index) => (
                  <div key={index}>
                    <Typography
                      id={`deal-title-${index}`}
                      variant={isSmallScreen ? "h5" : "h4"}
                      component="h2"
                      textAlign="center"
                    >
                      {deal.title}
                    </Typography>
                    {deal?.image && (
                      <img
                        src={deal.image}
                        alt="coverImage"
                        style={coverImgStyle}
                      />
                    )}

                    <Typography
                      id={`deal-description-${index}`}
                      variant="p"
                      sx={{ mt: 2, fontSize: isSmallScreen && "14px" }}
                      textAlign="left"
                    >
                      {deal.description}
                    </Typography>
                    <Typography
                      id={`deal-price-${index}`}
                      variant="h6"
                      textAlign="center"
                      sx={{ mt: 2 }}
                    >
                      {deal.price} ден.
                    </Typography>
                  </div>
                ))}
              <Box
                sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}
              >
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handleChange}
                />
              </Box>
            </Box>
          </Fade>
        </Modal>
      </div>
    </ThemeProvider>
  );
};

export default MapDealInfoModal;
