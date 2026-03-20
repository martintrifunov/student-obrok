import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  Container,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { useNavigate, useParams } from "react-router-dom";
import GlobalLoadingProgress from "@/components/ui/GlobalLoadingProgress";
import {
  useMarket,
  useSaveMarket,
} from "@/features/markets/hooks/useMarketQueries";
import { useVendorsDropdown } from "@/features/vendors/hooks/useVendorQueries";

const AddOrEditMarketForm = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const params = useParams();

  const isEditMode = !!params.marketId;

  const [market, setMarket] = useState({});
  const [errors, setErrors] = useState({});
  const [selectedVendorId, setSelectedVendorId] = useState("");

  const { data: fetchedMarket, isLoading: isFetchingMarket } = useMarket(
    params.marketId,
  );
  const { data: vendors = [] } = useVendorsDropdown();

  const saveMutation = useSaveMarket(isEditMode, params.marketId);

  useEffect(() => {
    if (fetchedMarket) {
      setMarket(fetchedMarket);
      if (fetchedMarket.vendor) {
        setSelectedVendorId(
          fetchedMarket.vendor._id || fetchedMarket.vendor,
        );
      }
    }
  }, [fetchedMarket]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    if (name === "vendor") {
      setSelectedVendorId(value);
    } else if (name === "longitude") {
      setMarket((prev) => ({
        ...prev,
        location: [prev?.location?.[0] || "", value],
      }));
    } else if (name === "latitude") {
      setMarket((prev) => ({
        ...prev,
        location: [value, prev?.location?.[1] || ""],
      }));
    } else {
      setMarket((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrors({});

    const marketData = {};
    if (isEditMode) marketData.id = params.marketId;

    marketData.name = market.name;

    if (market.location) {
      marketData.location = [
        market.location[0] ? parseFloat(market.location[0]) : null,
        market.location[1] ? parseFloat(market.location[1]) : null,
      ];
    } else {
      marketData.location = [null, null];
    }

    if (selectedVendorId) marketData.vendor = selectedVendorId;

    saveMutation.mutate(marketData, {
      onSuccess: () => navigate("/dashboard"),
      onError: (error) => {
        setErrors(error.response?.data || { message: "Error saving market" });
      },
    });
  };

  if (isFetchingMarket || saveMutation.isPending) {
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
          {isEditMode ? "Edit Market" : "Register Market"}
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
              label="Market Name"
              variant="outlined"
              fullWidth
              value={market?.name || ""}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
            />

            <FormControl fullWidth error={!!errors.vendor}>
              <InputLabel id="vendor-select-label">Vendor</InputLabel>
              <Select
                labelId="vendor-select-label"
                name="vendor"
                value={selectedVendorId || ""}
                label="Vendor"
                onChange={handleChange}
              >
                {vendors.map((vendor) => (
                  <MenuItem key={vendor._id} value={vendor._id}>
                    {vendor.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.vendor && (
                <FormHelperText>{errors.vendor}</FormHelperText>
              )}
            </FormControl>

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
                value={market?.location?.[0] ?? ""}
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
                value={market?.location?.[1] ?? ""}
                onChange={handleChange}
                error={!!errors.location || !!errors["location.1"]}
                helperText={errors.location || errors["location.1"]}
              />
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
    </Container>
  );
};

export default AddOrEditMarketForm;
