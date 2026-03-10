import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Box,
  Paper,
  Typography,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Alert,
  Container
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import CheckIcon from "@mui/icons-material/Check";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import FileUploader from "../components/FileUploader";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import GlobalLoadingProgress from "../components/GlobalLoadingProgress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const AddOrEditVendorForm = () => {
  const theme = useTheme();
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const isEditMode = !!params.vendorId;

  const [vendor, setVendor] = useState({});
  const [errorBag, setErrorBag] = useState("");
  const [selectedImageId, setSelectedImageId] = useState("");
  const [selectedImageTitle, setSelectedImageTitle] = useState("");
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  // 1. Fetch Vendor Data
  const { data: fetchedVendor, isLoading: isFetchingVendor } = useQuery({
    queryKey: ["vendor", params.vendorId],
    queryFn: async () => {
      const res = await axiosPrivate.get(`/vendors/${params.vendorId}`);
      return res.data;
    },
    enabled: isEditMode,
  });

  // 2. Sync fetched data to local state (Fixes the missing data bug!)
  useEffect(() => {
    if (fetchedVendor) {
      setVendor(fetchedVendor);
      if (fetchedVendor.image) {
        setSelectedImageId(fetchedVendor.image._id);
        setSelectedImageTitle(fetchedVendor.image.title);
      }
    }
  }, [fetchedVendor]);

  // 3. Fetch Images for Dialog
  const { data: images = [], refetch: fetchImages } = useQuery({
    queryKey: ["images"],
    queryFn: async () => {
      const res = await axiosPrivate.get("/images?limit=0");
      return res.data.data;
    },
    enabled: false,
  });

  // 4. Save Mutation
  const saveMutation = useMutation({
    mutationFn: async (vendorData) => {
      if (isEditMode) {
        return axiosPrivate.put("/vendors", vendorData);
      }
      return axiosPrivate.post("/vendors", vendorData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      navigate("/dashboard");
    },
    onError: (error) => {
      setErrorBag(error.response?.data?.message || "Error saving vendor");
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "longitude") {
      setVendor((prev) => ({ ...prev, location: [prev?.location?.[0] || "", value] }));
    } else if (name === "latitude") {
      setVendor((prev) => ({ ...prev, location: [value, prev?.location?.[1] || ""] }));
    } else {
      setVendor((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleOpenImageDialog = () => {
    fetchImages();
    setImageDialogOpen(true);
  };

  const onSelectFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await axiosPrivate.post("/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSelectedImageId(res.data._id);
      setSelectedImageTitle(res.data.title);
    } catch (err) {
      setErrorBag("Failed to upload image.");
    }
  };

  const onDeleteFileHandler = () => {
    setSelectedImageId("");
    setSelectedImageTitle("");
  };

  const handleSelectImage = (image) => {
    setSelectedImageId(image._id);
    setSelectedImageTitle(image.title);
    setImageDialogOpen(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorBag(""); // Clear previous errors

    const vendorData = {};
    if (isEditMode) vendorData.id = params.vendorId;
    if (vendor.name) vendorData.name = vendor.name;

    if (vendor.location && vendor.location[0] !== "" && vendor.location[1] !== "") {
      vendorData.location = [
        parseFloat(vendor.location[0]),
        parseFloat(vendor.location[1]),
      ];
    }

    if (selectedImageId) vendorData.image = selectedImageId;

    saveMutation.mutate(vendorData);
  };

  if (isFetchingVendor || saveMutation.isPending) {
    return <GlobalLoadingProgress />;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          {isEditMode ? "Edit Vendor" : "Register Vendor"}
        </Typography>
      </Box>

      <form autoComplete="off" onSubmit={handleSubmit}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            mb: 3,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Box display="flex" flexDirection="column" gap={3}>
            
            {/* Standardized Error Display */}
            {errorBag && (
              <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
                {errorBag}
              </Alert>
            )}

            <TextField
              name="name"
              label="Vendor Name"
              variant="outlined"
              fullWidth
              value={vendor?.name || ""}
              onChange={handleChange}
            />

            <Box display="flex" gap={3} sx={{ flexDirection: { xs: "column", sm: "row" } }}>
              <TextField
                name="latitude"
                label="Latitude"
                variant="outlined"
                type="number"
                fullWidth
                value={vendor?.location?.[0] ?? ""}
                onChange={handleChange}
              />
              <TextField
                name="longitude"
                label="Longitude"
                variant="outlined"
                type="number"
                fullWidth
                value={vendor?.location?.[1] ?? ""}
                onChange={handleChange}
              />
            </Box>

            {selectedImageTitle && (
              <TextField
                label="Selected Image"
                variant="outlined"
                value={selectedImageTitle}
                fullWidth
                disabled
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <ImageIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}

            <Box>
              <FileUploader
                onSelectFile={onSelectFileHandler}
                onDeleteFile={onDeleteFileHandler}
                accept=".jpeg, .jpg, .png, .webp"
              />
              <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" mt={2}>
                <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                  or select an existing one:
                </Typography>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={handleOpenImageDialog}
                  startIcon={<PhotoLibraryIcon />}
                  sx={{ textTransform: "none" }}
                >
                  Browse Gallery
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>

        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="text"
            color="inherit"
            onClick={() => navigate("/dashboard")}
            sx={{ textTransform: "none" }}
            startIcon={<CloseIcon />}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            sx={{ textTransform: "none" }}
            startIcon={<SaveIcon />}
          >
            {isEditMode ? "Save Changes" : "Register"}
          </Button>
        </Box>
      </form>

      {/* Image Selection Modal */}
      <Dialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Select from Gallery</DialogTitle>
        <DialogContent dividers>
          {images.length === 0 ? (
            <Typography color="text.secondary">
              No images available in gallery. Please upload a new one.
            </Typography>
          ) : (
            <List>
              {images.map((img) => (
                <ListItemButton
                  key={img._id}
                  selected={selectedImageId === img._id}
                  onClick={() => handleSelectImage(img)}
                  sx={{ borderRadius: 1, mb: 0.5 }}
                >
                  <ListItemIcon>
                    {selectedImageId === img._id ? <CheckIcon color="primary" /> : <ImageIcon />}
                  </ListItemIcon>
                  <ListItemText primary={img.title} secondary={img.mimeType} />
                </ListItemButton>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setImageDialogOpen(false)}
            color="inherit"
            sx={{ textTransform: "none" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AddOrEditVendorForm;