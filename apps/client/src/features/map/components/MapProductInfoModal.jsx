import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Card,
  CardContent,
  useTheme,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import ImageIcon from "@mui/icons-material/Image";
import { BASE_URL } from "@/api/consts";

const stripHtmlAndDecode = (html) => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

const MapProductInfoModal = ({ products = [] }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  return (
    <>
      <Button
        variant="outlined"
        color="inherit"
        fullWidth
        onClick={(e) => {
          setOpen(true);
          e.currentTarget.blur();
        }}
        startIcon={<InfoIcon />}
        sx={{ textTransform: "none", borderRadius: 2, py: 1 }}
      >
        Понуди
      </Button>

      <Dialog
        open={open}
        onClose={(e) => {
          e.stopPropagation();
          setOpen(false);
        }}
        fullWidth
        maxWidth="sm"
        scroll="paper"
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: "80vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            pb: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" component="span" fontWeight="bold">
            Понуди ({products.length})
          </Typography>
          <IconButton
            onClick={() => setOpen(false)}
            sx={{ color: "text.secondary" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            p: 2,
            backgroundColor:
              theme.palette.mode === "dark" ? "background.default" : "grey.50",
          }}
        >
          {products.length === 0 ? (
            <Typography textAlign="center" color="text.secondary" py={4}>
              Овој локал моментално нема активни понуди.
            </Typography>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {products.map((product) => (
                <Card
                  key={product._id}
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: "0px 2px 10px rgba(0,0,0,0.03)",
                  }}
                >
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      flexShrink: 0,
                      backgroundColor:
                        theme.palette.mode === "dark" ? "grey.900" : "grey.100",
                      borderRight: `1px solid ${theme.palette.divider}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {product.image ? (
                      <Box
                        component="img"
                        src={`${BASE_URL}${product.image.url}`}
                        alt={product.title}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <ImageIcon
                        sx={{ fontSize: 40, color: theme.palette.grey[400] }}
                      />
                    )}
                  </Box>

                  <CardContent
                    sx={{ flexGrow: 1, p: 2, "&:last-child": { pb: 2 } }}
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        lineHeight={1.2}
                      >
                        {product.title}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        color="primary.main"
                        fontWeight="bold"
                        whiteSpace="nowrap"
                        ml={1}
                      >
                        {product.price} ден.
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 1,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        overflowWrap: "anywhere",
                        lineHeight: 1.4,
                      }}
                    >
                      {stripHtmlAndDecode(product.description)}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MapProductInfoModal;
