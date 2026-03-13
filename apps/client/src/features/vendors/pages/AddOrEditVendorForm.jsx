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
  Container,
  Avatar,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import CheckIcon from "@mui/icons-material/Check";
import { useNavigate, useParams } from "react-router-dom";
import FileUploader from "@/components/FileUploader";
import GlobalLoadingProgress from "@/components/GlobalLoadingProgress";
import { BASE_URL } from "@/api/consts";
import { useVendor, useSaveVendor } from "../hooks/useVendorQueries";
import {
  useImages,
  useUploadImage,
} from "@/features/images/hooks/useImageQueries";

const AddOrEditVendorForm = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const params = useParams();

  const isEditMode = !!params.vendorId;

  const [vendor, setVendor] = useState({});
  const [errors, setErrors] = useState({});
  const [selectedImageId, setSelectedImageId] = useState("");
  const [selectedImageTitle, setSelectedImageTitle] = useState("");
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const { data: fetchedVendor, isLoading: isFetchingVendor } = useVendor(
    params.vendorId,
  );
  const { data: images = [], refetch: fetchImages } = useImages();

  const saveMutation = useSaveVendor(isEditMode, params.vendorId);
  const uploadImageMutation = useUploadImage();

  useEffect(() => {
    if (fetchedVendor) {
      setVendor(fetchedVendor);
      if (fetchedVendor.image) {
        setSelectedImageId(fetchedVendor.image._id);
        setSelectedImageTitle(fetchedVendor.image.title);
      }
    }
  }, [fetchedVendor]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (
      errors[name] ||
      errors["location"] ||
      errors["location.0"] ||
      errors["location.1"]
    ) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
        location: undefined,
        "location.0": undefined,
        "location.1": undefined,
      }));
    }

    if (name === "longitude") {
      setVendor((prev) => ({
        ...prev,
        location: [prev?.location?.[0] || "", value],
      }));
    } else if (name === "latitude") {
      setVendor((prev) => ({
        ...prev,
        location: [value, prev?.location?.[1] || ""],
      }));
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

    uploadImageMutation.mutate(file, {
      onSuccess: (data) => {
        setSelectedImageId(data._id);
        setSelectedImageTitle(data.title);
        setErrors((prev) => ({ ...prev, image: undefined }));
      },
      onError: () => {
        setErrors({ message: "Failed to upload image." });
      },
    });
  };

  const onDeleteFileHandler = () => {
    setSelectedImageId("");
    setSelectedImageTitle("");
  };

  const handleSelectImage = (image) => {
    setSelectedImageId(image._id);
    setSelectedImageTitle(image.title);
    setErrors((prev) => ({ ...prev, image: undefined }));
    setImageDialogOpen(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrors({});

    const vendorData = {};
    if (isEditMode) vendorData.id = params.vendorId;

    vendorData.name = vendor.name;

    if (vendor.location) {
      vendorData.location = [
        vendor.location[0] ? parseFloat(vendor.location[0]) : null,
        vendor.location[1] ? parseFloat(vendor.location[1]) : null,
      ];
    } else {
      vendorData.location = [null, null];
    }

    if (selectedImageId) vendorData.image = selectedImageId;

    saveMutation.mutate(vendorData, {
      onSuccess: () => navigate("/dashboard"),
      onError: (error) => {
        setErrors(error.response?.data || { message: "Error saving vendor" });
      },
    });
  };

  if (
    isFetchingVendor ||
    saveMutation.isPending ||
    uploadImageMutation.isPending
  ) {
    return <GlobalLoadingProgress />;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
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
            {errors.message && (
              <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
                {errors.message}
              </Alert>
            )}

            <TextField
              name="name"
              label="Vendor Name"
              variant="outlined"
              fullWidth
              value={vendor?.name || ""}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
            />

            <Box
              display="flex"
              gap={3}
              sx={{ flexDirection: { xs: "column", sm: "row" } }}
            >
              <TextField
                name="latitude"
                label="Latitude"
                variant="outlined"
                type="number"
                fullWidth
                value={vendor?.location?.[0] ?? ""}
                onChange={handleChange}
                error={!!errors.location || !!errors["location.0"]}
                helperText={errors.location || errors["location.0"]}
              />
              <TextField
                name="longitude"
                label="Longitude"
                variant="outlined"
                type="number"
                fullWidth
                value={vendor?.location?.[1] ?? ""}
                onChange={handleChange}
                error={!!errors.location || !!errors["location.1"]}
                helperText={errors.location || errors["location.1"]}
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
              <Box
                display="flex"
                gap={2}
                alignItems="center"
                flexWrap="wrap"
                mt={2}
              >
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
              {errors.image && (
                <Typography
                  color="error"
                  variant="caption"
                  sx={{ mt: 1, display: "block", ml: 2 }}
                >
                  {errors.image}
                </Typography>
              )}
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

      <Dialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          Select from Gallery
        </DialogTitle>
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
                    <Avatar
                      src={img.url ? `${BASE_URL}${img.url}` : undefined}
                      variant="rounded"
                      sx={{ width: 32, height: 32, bgcolor: "grey.100" }}
                    >
                      <ImageIcon sx={{ color: "grey.400" }} />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText primary={img.title} secondary={img.mimeType} />
                  {selectedImageId === img._id && <CheckIcon color="primary" />}
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
