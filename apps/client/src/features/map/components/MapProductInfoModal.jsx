import React, { useState } from "react";
import { Button } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import SharedVendorProductsModal from "@/components/ui/SharedVendorProductsModal";

const MapProductInfoModal = ({ vendorId }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = (e) => {
    e.stopPropagation();
    if (!vendorId) {
      console.error("🚨 MapProductInfoModal: vendorId is undefined!");
    }
    setOpen(true);
  };

  return (
    <>
      <Button
        variant="outlined"
        color="inherit"
        fullWidth
        onClick={handleOpen}
        startIcon={<InfoIcon />}
        sx={{ textTransform: "none", borderRadius: 2, py: 1 }}
      >
        Продукти
      </Button>

      <SharedVendorProductsModal
        open={open}
        onClose={(e) => {
          if (e) e.stopPropagation();
          setOpen(false);
        }}
        vendorId={vendorId}
        title="Продукти"
      />
    </>
  );
};

export default MapProductInfoModal;
