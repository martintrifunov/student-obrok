import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import FolderIcon from "@mui/icons-material/Folder";
import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import ProductsList from "@/features/products/components/ProductsList";
import VendorsList from "@/features/vendors/components/VendorsList";
import ProductSearchBar from "../../../components/ProductSearchBar";
import VendorSearchBar from "../../../components/VendorSearchBar";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

const Dashboard = () => {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");
  const [generating, setIsGenerating] = useState(false);
  const [errorBag, setErrorBag] = useState("");

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const response = await axiosPrivate.get("/vendors/report", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "VendorsReport.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setErrorBag(
        error.response?.data?.message || "Failed to generate report.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
        Vendors Management
      </Typography>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", md: "center" },
          gap: 2,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: { md: "400px" } }}>
          <VendorSearchBar
            handleSearchChange={(e) => setVendorSearchTerm(e.target.value)}
          />
        </Box>
        <Stack
          direction="row"
          spacing={2}
          sx={{ width: { xs: "100%", md: "auto" } }}
        >
          <Button
            sx={{ flex: { xs: 1, md: "initial" } }}
            variant="outlined"
            color="inherit"
            onClick={handleGenerateReport}
            disabled={generating}
            startIcon={generating ? <SettingsIcon /> : <FolderIcon />}
          >
            {isMobile ? "Report" : "Generate Report"}
          </Button>
          <Button
            sx={{ flex: { xs: 1, md: "initial" } }}
            variant="contained"
            onClick={() => navigate("/dashboard/vendor")}
            startIcon={<AddIcon />}
          >
            {isMobile ? "Vendor" : "Register Vendor"}
          </Button>
        </Stack>
      </Box>
      <VendorsList searchTerm={vendorSearchTerm} />
      <Typography variant="h5" sx={{ fontWeight: "bold", mt: 6, mb: 2 }}>
        Products Overview
      </Typography>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", md: "center" },
          gap: 2,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: { md: "400px" } }}>
          <ProductSearchBar
            handleSearchChange={(e) => setProductSearchTerm(e.target.value)}
          />
        </Box>
        <Button
          sx={{ width: { xs: "100%", md: "auto" } }}
          variant="contained"
          onClick={() => navigate("/dashboard/product")}
          startIcon={<AddIcon />}
        >
          Add Product
        </Button>
      </Box>

      <ProductsList searchTerm={productSearchTerm} />
    </Box>
  );
};

export default Dashboard;
