import React, { useState } from "react";
import {
  Button,
  Grid,
  TextField,
  Box,
  Paper,
  Typography,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import { Container } from "@mui/system";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import DashboardHeader from "../components/DashboardHeader";
import { useNavigate } from "react-router-dom";
import FileUploader from "../components/FileUploader";

const AddOrEditForm = () => {
  const theme = createTheme();
  const navigate = useNavigate();

  const addDealButtonStyle = {
    textTransform: "none",
    backgroundColor: "black",
  };
  const cancelButtonStyle = {
    color: "black",
    textTransform: "none",
    marginRight: "1vw",
  };
  const dealHeadingStyle = {
    marginBottom: 10,
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    alert("WAH");
  };

  const onSelectFileHandler = (e) => {
    console.log(e.target.files[0]);
  };

  const onDeleteFileHandler = () => {};
  return (
    <ThemeProvider theme={theme}>
      <DashboardHeader theme={theme} />

      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        height="85vh"
      >
        <Container maxWidth="md">
          <Typography variant="h4" style={dealHeadingStyle}>
            Add Deal
          </Typography>
          <form noValidate autoComplete="off" onSubmit={handleSubmit}>
            <Paper elevation={5} sx={{ padding: 10, marginBottom: 2 }}>
              <Grid container spacing={3} justify="center">
                <Grid item xs={12}>
                  <TextField
                    id="title"
                    label="Title"
                    variant="outlined"
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor: "black",
                        },
                      },
                      "& label.Mui-focused": {
                        color: "black",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="locationName"
                    label="Location Name"
                    variant="outlined"
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor: "black",
                        },
                      },
                      "& label.Mui-focused": {
                        color: "black",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="latitude"
                    label="Latitude"
                    variant="outlined"
                    type="number"
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor: "black",
                        },
                      },
                      "& label.Mui-focused": {
                        color: "black",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="longitude"
                    label="Longitude"
                    variant="outlined"
                    type="number"
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor: "black",
                        },
                      },
                      "& label.Mui-focused": {
                        color: "black",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="description"
                    label="Description"
                    variant="outlined"
                    fullWidth
                    multiline
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor: "black",
                        },
                      },
                      "& label.Mui-focused": {
                        color: "black",
                      },
                    }}
                    inputProps={{ style: { resize: "none" } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="price"
                    label="Price"
                    variant="outlined"
                    type="number"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor: "black",
                        },
                      },
                      "& label.Mui-focused": {
                        color: "black",
                      },
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <FileUploader
                    onSelectFile={onSelectFileHandler}
                    onDeleteFile={onDeleteFileHandler}
                    accept={"image/*"}
                  />
                </Grid>
              </Grid>
            </Paper>
            <Grid item xs={12} container justifyContent="flex-end">
              <Button
                variant="text"
                style={cancelButtonStyle}
                onClick={() => handleCancel()}
              >
                <CloseIcon sx={{ marginRight: "5px" }} /> Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                style={addDealButtonStyle}
                type="submit"
              >
                <SaveIcon sx={{ marginRight: "5px" }} /> Submit
              </Button>
            </Grid>
          </form>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default AddOrEditForm;
