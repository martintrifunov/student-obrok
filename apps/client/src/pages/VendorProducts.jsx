import React, { useState } from "react";
import {
  ThemeProvider,
  createTheme,
  Grid,
  useMediaQuery,
  styled,
} from "@mui/material";
import VendorProductsList from "../components/VendorProductsList";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "../api/axios";
import GlobalLoadingProgress from "../components/GlobalLoadingProgress";
import DashboardHeader from "../components/DashboardHeader";
import ProductSearchBar from "../components/ProductSearchBar";

const VendorProducts = () => {
  const theme = createTheme();
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [productSearchTerm, setProductSearchTerm] = useState("");

  const { data: vendor, isLoading } = useQuery({
    queryKey: ["vendor", params.vendorId],
    queryFn: async () => {
      const response = await axios.get(`/vendors/${params.vendorId}`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      return response.data;
    },
    onError: () =>
      navigate("/login", { state: { from: location }, replace: true }),
  });

  return (
    <>
      {isLoading ? (
        <GlobalLoadingProgress />
      ) : (
        <ThemeProvider theme={theme}>
          <DashboardHeader theme={theme} />
          <ToolbarGrid>
            <ProductSearchBar
              theme={theme}
              handleSearchChange={(e) => setProductSearchTerm(e.target.value)}
              placeholder="Search products..."
            />
          </ToolbarGrid>

          <VendorProductsList
            theme={theme}
            vendor={vendor}
            products={vendor?.products || []}
            searchTerm={productSearchTerm}
          />
        </ThemeProvider>
      )}
    </>
  );
};

const ToolbarGrid = styled(Grid)(({ theme }) => ({
  display: "flex",
  marginRight: "1vw",
  justifyContent: useMediaQuery(theme.breakpoints.down("sm"))
    ? "center"
    : "space-between",
  marginTop: !useMediaQuery(theme.breakpoints.down("sm")) && "10vh",
}));

export default VendorProducts;
