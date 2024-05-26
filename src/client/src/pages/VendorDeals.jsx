import { ThemeProvider } from "@emotion/react";
import { Grid, createTheme, styled, useMediaQuery } from "@mui/material";
import React, { useEffect, useState } from "react";
import VendorDealsList from "../components/VendorDealsList";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import GlobalLoadingProgress from "../components/GlobalLoadingProgress";
import DealSearchBar from "../components/DealSearchBar";
import DashboardHeader from "../components/DashboardHeader";

const VendorDeals = () => {
  const theme = createTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [vendor, setVendor] = useState([]);
  const [_, setError] = useState("");
  const [deals, setDeals] = useState([]);
  const params = useParams();
  const [dealSearchTerm, setDealSearchTerm] = useState("");

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    setIsLoading(true);

    const fetchVendor = async () => {
      try {
        const vendorResponse = await axios.get(
          `/vendors/${params.vendorId}`,
          {
            signal: controller.signal,
          },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        isMounted && setVendor(vendorResponse.data);
        isMounted && setDeals(vendorResponse.data.deals);
        setIsLoading(false);
      } catch (error) {
        setError(error.response.data.message);
        navigate("/login", { state: { from: location }, replace: true });
      }
    };

    fetchVendor();

    return () => {
      isMounted = false;
      setIsLoading(false);
      controller.abort();
    };
  }, []);

  const handleDealSearchChange = (event) => {
    setDealSearchTerm(event.target.value);
  };

  return (
    <>
      {isLoading ? (
        <GlobalLoadingProgress />
      ) : (
        <ThemeProvider theme={theme}>
          <DashboardHeader theme={theme} />
          <DealsToolbarGrid>
            <DealSearchBar
              theme={theme}
              handleSearchChange={handleDealSearchChange}
            />
          </DealsToolbarGrid>

          <VendorDealsList
            theme={theme}
            vendor={vendor}
            setVendor={setVendor}
            deals={deals}
            searchTerm={dealSearchTerm}
            setDeals={setDeals}
          />
        </ThemeProvider>
      )}
    </>
  );
};

const DealsToolbarGrid = styled(Grid)(({ theme }) => ({
  display: "flex",
  marginRight: "1vw",
  justifyContent: useMediaQuery(theme.breakpoints.down("sm")) ? "center" : "space-between",
  marginTop: !useMediaQuery(theme.breakpoints.down("sm")) && "10vh",
}));

export default VendorDeals;
