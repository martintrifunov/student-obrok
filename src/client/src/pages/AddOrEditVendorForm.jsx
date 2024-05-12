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

const AddOrEditVendorForm = () => {
  const axiosPrivate = useAxiosPrivate();
  const theme = createTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const navigate = useNavigate();
  const params = useParams();
  const [vendor, setVendor] = useState({});
  const [errorBag, setErrorBag] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "longitude") {
      setVendor({
        ...vendor,
        location: [vendor?.location?.[0] || "", value],
      });
    } else if (name === "latitude") {
      setVendor({
        ...vendor,
        location: [value, vendor?.location?.[1] || ""],
      });
    } else {
      setVendor({
        ...vendor,
        [name]: value,
      });
    }
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchVendor = async () => {
      try {
        const response = await axiosPrivate(`/vendors/${params.vendorId}`, {
          signal: controller.signal,
        });
        isMounted && setVendor(response.data);
      } catch (error) {
        console.error(error);
        navigate("/login", { state: { from: location }, replace: true });
      }
    };

    if (params?.vendorId) {
      fetchVendor();
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const handleCancel = () => {
    navigate("/dashboard");
  };

  const transformVendorData = () => {
    let vendorData = {};

    if (params?.vendorId) vendorData.id = params.vendorId;
    if (vendor.name) vendorData.name = vendor.name;
    if (vendor.location) vendorData.location = vendor.location;
    if (vendor.image) vendorData.image = vendor.image;
    if (vendor.imageTitle) vendorData.imageTitle = vendor.imageTitle;

    return vendorData;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const transformedData = transformVendorData();

    if (params?.vendorId) {
      try {
        await axiosPrivate.put("/vendors", transformedData);
        return navigate("/dashboard");
      } catch (error) {
        return console.error(error);
      }
    }

    try {
      await axiosPrivate.post("/vendors", transformedData);
      return navigate("/dashboard");
    } catch (error) {
      setErrorBag(error.response.data.message);
    }
  };

  const onSelectFileHandler = async (e) => {
    const file = e.target.files[0];
    const fileName = file.name;
    const convertedImage = await convertToBase64(file);

    setVendor({ ...vendor, image: convertedImage, imageTitle: fileName });
  };

  const onDeleteFileHandler = () => {
    setVendor({ ...vendor, image: "", imageTitle: "" });
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

  const addVendorButtonStyle = {
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
            Add Vendor
          </Typography>
          <form autoComplete="off" onSubmit={handleSubmit}>
            <Paper
              elevation={5}
              sx={{ padding: isSmallScreen ? 5 : 10, marginBottom: 2 }}
            >
              <Grid container spacing={3} justify="center">
                <Grid item xs={12}>
                  {errorBag === "Name is required!" && (
                    <Typography sx={{ color: "crimson" }}>
                      {errorBag}
                    </Typography>
                  )}
                  <TextField
                    id="name"
                    name="name"
                    label="Name"
                    variant="outlined"
                    fullWidth
                    value={vendor?.name || ""}
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
                  {errorBag === "Location coordinates are required!" && (
                    <Typography sx={{ color: "crimson", whiteSpace: "nowrap" }}>
                      {errorBag}
                    </Typography>
                  )}
                  <TextField
                    id="latitude"
                    name="latitude"
                    label="Latitude"
                    variant="outlined"
                    type="number"
                    fullWidth
                    value={vendor?.location?.[0] || ""}
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
                  {errorBag === "Location coordinates are required!" && (
                    <Box mt={3}></Box>
                  )}
                  <TextField
                    id="longitude"
                    name="longitude"
                    label="Longitude"
                    variant="outlined"
                    type="number"
                    value={vendor?.location?.[1] || ""}
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
                    onChange={handleChange}
                  />
                </Grid>
                {vendor?.imageTitle && (
                  <Grid item xs={12}>
                    <TextField
                      id="image"
                      label="Cover Image"
                      variant="outlined"
                      type="text"
                      value={vendor?.imageTitle || ""}
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
                  {errorBag === "Cover image is required!" && (
                    <Typography sx={{ color: "crimson" }}>
                      {errorBag}
                    </Typography>
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
                style={addVendorButtonStyle}
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

export default AddOrEditVendorForm;
