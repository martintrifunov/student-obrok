import React, { useState } from "react";
import { Button, Grid, Box, useMediaQuery, styled } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import VendorSearchBar from "./VendorSearchBar";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import StoreIcon from "@mui/icons-material/Store";
import FolderIcon from "@mui/icons-material/Folder";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import SettingsIcon from "@mui/icons-material/Settings";

const DashboardToolbar = ({ theme, handleSearchChange }) => {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [errorBag, setErrorBag] = useState("");
  const [generating, setIsGenerating] = useState(false);

  const handleAddDeal = () => {
    navigate("/dashboard/deal");
  };

  const handleRegisterVendor = () => {
    navigate("/dashboard/vendor");
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);

    try {
      const response = await axiosPrivate.get("/vendors/report", {
        responseType: "blob", // Important: Tell Axios to expect a binary response
      });

      // Create a URL for the blob data
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "VendorsReport.csv"); // Set the filename
      document.body.appendChild(link);
      link.click(); // Trigger the download
      document.body.removeChild(link); // Clean up

      setIsGenerating(false);
    } catch (error) {
      setIsGenerating(false);
      setErrorBag(error.response.data.message);
    }
  };

  return (
    <ToolbarGrid>
      <VendorSearchBar theme={theme} handleSearchChange={handleSearchChange} />
      <ToolbarBox>
        <RegisterVendorButton
          variant="contained"
          onClick={() => handleRegisterVendor()}
        >
          {!isSmallScreen ? (
            <>
              <AddIcon sx={{ marginRight: 0.5 }} />
              Register Vendor
            </>
          ) : (
            <StoreIcon />
          )}
        </RegisterVendorButton>
        <AddDealButton variant="contained" onClick={() => handleAddDeal()}>
          {!isSmallScreen ? (
            <>
              <AddIcon sx={{ marginRight: 0.5 }} />
              Add Deal
            </>
          ) : (
            <LocalOfferIcon />
          )}
        </AddDealButton>
        <GenerateReportButton
          variant="contained"
          onClick={() => handleGenerateReport()}
          disabled={generating}
        >
          {!isSmallScreen ? (
            <>
              {generating ? (
                <SettingsIcon sx={{ marginRight: 0.5 }} />
              ) : (
                <FolderIcon sx={{ marginRight: 0.5 }} />
              )}
              Generate Report
            </>
          ) : (
            <>
              {generating ? (
                <SettingsIcon sx={{ marginRight: 0.5 }} />
              ) : (
                <FolderIcon sx={{ marginRight: 0.5 }} />
              )}
            </>
          )}
        </GenerateReportButton>
      </ToolbarBox>
    </ToolbarGrid>
  );
};

const ToolbarGrid = styled(Grid)(({ theme }) => ({
  display: "flex",
  marginLeft: "1vw",
  marginRight: "1vw",
  justifyContent: "space-between",
  flexDirection: useMediaQuery(theme.breakpoints.down("sm")) && "column",
  alignItems: useMediaQuery(theme.breakpoints.down("sm")) && "center",
  marginTop: useMediaQuery(theme.breakpoints.down("sm")) ? "5vh" : "10vh",
}));

const ToolbarBox = styled(Box)(({ theme }) => ({
  marginTop: 20,
}));

const RegisterVendorButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  backgroundColor: "black",
  marginRight: 10,

  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
}));

const AddDealButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  backgroundColor: "black",
  marginRight: 10,

  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
}));

const GenerateReportButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  backgroundColor: "black",

  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
}));

export default DashboardToolbar;
