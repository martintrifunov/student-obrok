import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill-new";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  styled,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import { Container } from "@mui/system";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import DashboardHeader from "../components/DashboardHeader";
import { useNavigate, useParams } from "react-router-dom";
import FileUploader from "../components/FileUploader";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import axios from "../api/axios";
import GlobalLoadingProgress from "../components/GlobalLoadingProgress";
import "../assets/quill.css";
import "react-quill-new/dist/quill.snow.css";

const AddOrEditDealForm = () => {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const theme = createTheme();
  const params = useParams();
  const [deal, setDeal] = useState({});
  const [vendors, setVendors] = useState([]);
  const [errorBag, setErrorBag] = useState("");
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link"],
      ["clean"],
    ],
  };

  const handleChange = (event) => {
    if (event.target === undefined) {
      return setDeal({
        ...deal,
        description: `${event}`,
      });
    }

    const { name, value } = event.target;

    if (name === "vendor") {
      setSelectedVendorId(value);
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
        isMounted && setIsEditing(true);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        navigate("/login", { state: { from: location }, replace: true });
      }
    };

    const fetchVendors = async () => {
      try {
        const response = await axios.get("/vendors", {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });
        isMounted && setVendors(response.data);
      } catch (error) {
        console.error(error);
        navigate("/login", { state: { from: location }, replace: true });
      }
    };

    fetchVendors();

    if (params?.dealId) {
      setIsLoading(true);
      fetchDeal();
    }

    return () => {
      isMounted = false;
      controller.abort();
      setIsLoading(false);
    };
  }, []);

  const handleCancel = () => {
    navigate("/dashboard");
  };

  const transformDealData = () => {
    let dealData = {};

    if (params?.dealId) dealData.id = params.dealId;
    if (deal.title) dealData.title = deal.title;
    if (deal.description) dealData.description = deal.description;
    if (deal.price) dealData.price = deal.price;
    if (deal?.image) dealData.image = deal.image;
    if (deal?.imageTitle) dealData.imageTitle = deal.imageTitle;

    return dealData;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const transformedData = transformDealData();

    if (selectedVendorId) {
      transformedData.vendor = selectedVendorId;
    }

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
      setErrorBag(error.response.data.message);
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

  return (
    <>
      {isLoading ? (
        <GlobalLoadingProgress />
      ) : (
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
            <Container maxWidth="md" sx={{ maxHeight: "90%", marginTop: 10 }}>
              <form autoComplete="off" onSubmit={handleSubmit}>
                <Paper
                  elevation={5}
                  sx={{ padding: isSmallScreen ? 5 : 10, marginBottom: 2 }}
                >
                  <Grid container spacing={3} justify="center">
                    <Grid item xs={12}>
                      {errorBag === "Title is required!" && (
                        <Typography sx={{ color: "crimson" }}>
                          {errorBag}
                        </Typography>
                      )}
                      <TextField
                        id="title"
                        name="title"
                        label="Title"
                        variant="outlined"
                        fullWidth
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
                      {errorBag === "Price is required!" && (
                        <Typography sx={{ color: "crimson" }}>
                          {errorBag}
                        </Typography>
                      )}
                      <TextField
                        id="price"
                        name="price"
                        label="Price"
                        variant="outlined"
                        type="number"
                        value={deal?.price || ""}
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
                    <Grid item xs={12}>
                      {errorBag ===
                        ("Vendor is required!" ||
                          "Vendor can't be changed.") && (
                        <Typography sx={{ color: "crimson" }}>
                          {errorBag}
                        </Typography>
                      )}
                      <FormControl fullWidth>
                        <InputLabel
                          id="vendor-select-label"
                          sx={{
                            "&.Mui-focused": {
                              color: "black",
                            },
                            marginTop: !!selectedVendorId && "-8px",
                          }}
                          shrink={!!selectedVendorId}
                        >
                          Vendor
                        </InputLabel>
                        <Select
                          labelId="vendor-select-label"
                          id="vendor-select"
                          name="vendor"
                          value={selectedVendorId || ""}
                          onChange={handleChange}
                          disabled={isEditing}
                          sx={{
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: !isEditing && "black",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "black",
                            },
                            "&:hover .Mui-disabled": {
                              cursor: "not-allowed",
                            },
                          }}
                        >
                          {vendors.map((vendor) => (
                            <MenuItem key={vendor._id} value={vendor._id}>
                              {vendor.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
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
                    <Grid item xs={12}>
                      {errorBag === "Description is required!" && (
                        <Typography sx={{ color: "crimson" }}>
                          {errorBag}
                        </Typography>
                      )}
                      <div className="editor">
                        <ReactQuill
                          id="description"
                          value={deal?.description || ""}
                          onChange={(event) => handleChange(event)}
                          name="description"
                          theme="snow"
                          className="editor-input"
                          modules={modules}
                        />
                      </div>
                    </Grid>
                  </Grid>
                </Paper>
                <Grid item xs={12} container justifyContent="flex-end">
                  <CancelButton variant="text" onClick={() => handleCancel()}>
                    <CloseIcon sx={{ marginRight: "5px" }} /> Cancel
                  </CancelButton>
                  <AddDealButton
                    variant="contained"
                    color="primary"
                    type="submit"
                  >
                    <SaveIcon sx={{ marginRight: "5px" }} /> Submit
                  </AddDealButton>
                </Grid>
              </form>
            </Container>
          </Box>
        </ThemeProvider>
      )}
    </>
  );
};

const AddDealButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  backgroundColor: "black",
  marginBottom: 20,

  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
}));

const CancelButton = styled(Button)(({ theme }) => ({
  color: "black",
  textTransform: "none",
  marginRight: "1vw",
  marginBottom: 20,
}));

export default AddOrEditDealForm;
