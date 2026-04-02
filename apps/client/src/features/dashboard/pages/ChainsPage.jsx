import React, { useState } from "react";
import { Box, Button, Stack, useTheme, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import FolderIcon from "@mui/icons-material/Folder";
import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import ChainsList from "@/features/chains/components/ChainsList";
import ChainSearchBar from "@/features/chains/components/ChainSearchBar";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

const ChainsPage = () => {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [searchTerm, setSearchTerm] = useState("");
  const [generating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const response = await axiosPrivate.get("/chains/report", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "ChainsReport.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      /* report download failed – silent */
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Box>
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
          <ChainSearchBar
            handleSearchChange={(e) => setSearchTerm(e.target.value)}
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
            onClick={() => navigate("/dashboard/chain")}
            startIcon={<AddIcon />}
          >
            {isMobile ? "Chain" : "Register Chain"}
          </Button>
        </Stack>
      </Box>
      <ChainsList searchTerm={searchTerm} />
    </Box>
  );
};

export default ChainsPage;
