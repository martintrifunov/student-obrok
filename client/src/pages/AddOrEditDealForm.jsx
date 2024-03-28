import React, { useEffect, useState } from "react";
import {
  Button,
  Grid,
  TextField,
  Box,
  Paper,
  Typography,
  createTheme,
  ThemeProvider,
  InputAdornment,
  useMediaQuery,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import { Container } from "@mui/system";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import DashboardHeader from "../components/DashboardHeader";
import { useNavigate, useParams } from "react-router-dom";
import FileUploader from "../components/FileUploader";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const AddOrEditDealForm = () => {
  const axiosPrivate = useAxiosPrivate();
  const theme = createTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const navigate = useNavigate();
  const params = useParams();
  const [deal, setDeal] = useState({});
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "longitude") {
      setDeal({
        ...deal,
        location: [deal?.location?.[0] || "", value],
      });
    } else if (name === "latitude") {
      setDeal({
        ...deal,
        location: [value, deal?.location?.[1] || ""],
      });
    } else {
      setDeal({
        ...deal,
        [name]: value,
      });
    }
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchDeal = async () => {
      try {
        const response = await axiosPrivate(`/deals/${params.dealId}`, {
          signal: controller.signal,
        });
        isMounted && setDeal(response.data);
      } catch (error) {
        console.error(error);
        navigate("/login", { state: { from: location }, replace: true });
      }
    };

    if (params?.dealId) {
      fetchDeal();
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const handleCancel = () => {
    navigate("/dashboard");
  };

  const transformDealData = () => {
    let dealData = {};

    if (params?.dealId) dealData.id = params.dealId;
    if (deal.title) dealData.title = deal.title;
    if (deal.location) dealData.location = deal.location;
    if (deal.locationName) dealData.locationName = deal.locationName;
    if (deal.description) dealData.description = deal.description;
    if (deal.price) dealData.price = deal.price;
    if (deal.image) dealData.image = deal.image;
    if (deal.imageTitle) dealData.imageTitle = deal.imageTitle;

    return dealData;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const transformedData = transformDealData();

    if (params?.dealId) {
      try {
        await axiosPrivate.put("/deals", transformedData);
        return navigate("/dashboard");
      } catch (error) {
        return console.error(error);
      }
    }

    try {
      await axiosPrivate.post("/deals", transformedData);
      return navigate("/dashboard");
    } catch (error) {
      return setError("This field is required!");
    }
  };

  const onSelectFileHandler = async (e) => {
    const file = e.target.files[0];
    const fileName = file.name;
    const convertedImage = await convertToBase64(file);

    setDeal({ ...deal, image: convertedImage, imageTitle: fileName });
  };

  const onDeleteFileHandler = () => {
    setDeal({ ...deal, image: "", imageTitle: "" });
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const addDealButtonStyle = {
    textTransform: "none",
    backgroundColor: "black",
    marginBottom: 20,
  };

  const cancelButtonStyle = {
    color: "black",
    textTransform: "none",
    marginRight: "1vw",
    marginBottom: 20,
  };

  const dealHeadingStyle = {
    marginBottom: 10,
  };

  return (
    <ThemeProvider theme={theme}>
      <DashboardHeader theme={theme} />
      <Box
        display="flex"
        flexDirection="column"
        justifyContent={isSmallScreen ? "flex-start" : "center"}
        alignItems="center"
        height={isSmallScreen ? "65vh" : "85vh"}
        marginTop={isSmallScreen && 5}
        marginBottom={isSmallScreen && 5}
      >
        <Container maxWidth="md" sx={{ maxHeight: "90%" }}>
          <Typography variant="h4" style={dealHeadingStyle}>
            Add Deal
          </Typography>
          <form autoComplete="off" onSubmit={handleSubmit}>
            <Paper
              elevation={5}
              sx={{ padding: isSmallScreen ? 5 : 10, marginBottom: 2 }}
            >
              <Grid container spacing={3} justify="center">
                <Grid item xs={12}>
                  <TextField
                    id="title"
                    name="title"
                    label="Title"
                    variant="outlined"
                    fullWidth
                    required
                    value={deal?.title || ""}
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
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="locationName"
                    name="locationName"
                    label="Location Name"
                    variant="outlined"
                    fullWidth
                    required
                    value={deal?.locationName || ""}
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
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="latitude"
                    name="latitude"
                    label="Latitude"
                    variant="outlined"
                    type="number"
                    fullWidth
                    required
                    value={deal?.location?.[0] || ""}
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
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="longitude"
                    name="longitude"
                    label="Longitude"
                    variant="outlined"
                    type="number"
                    value={deal?.location?.[1] || ""}
                    fullWidth
                    required
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
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="description"
                    name="description"
                    label="Description"
                    variant="outlined"
                    fullWidth
                    value={deal?.description || ""}
                    multiline
                    required
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
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="price"
                    name="price"
                    label="Price"
                    variant="outlined"
                    type="number"
                    value={deal?.price || ""}
                    required
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
                    onChange={handleChange}
                  />
                </Grid>
                {deal?.imageTitle && (
                  <Grid item xs={12}>
                    <TextField
                      id="image"
                      label="Cover Image"
                      variant="outlined"
                      type="text"
                      value={deal?.imageTitle || ""}
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
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <ImageIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  {error && (
                    <Typography sx={{ color: "crimson" }}>{error}</Typography>
                  )}
                  <FileUploader
                    onSelectFile={onSelectFileHandler}
                    onDeleteFile={onDeleteFileHandler}
                    accept={".jpeg, .jpg, .png, .webp"}
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

export default AddOrEditDealForm;
