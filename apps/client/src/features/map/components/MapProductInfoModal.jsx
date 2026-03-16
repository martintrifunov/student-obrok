import React, { useState, useEffect } from "react";
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
  TextField,
  Pagination,
  CircularProgress,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import ImageIcon from "@mui/icons-material/Image";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import { BASE_URL } from "@/api/consts";
import { useVendorProducts } from "@/features/products/hooks/useProductQueries";

const stripHtmlAndDecode = (html) => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

const MapProductInfoModal = ({ vendorId }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const [page, setPage] = useState(1);
  const [titleInput, setTitleInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");

  const [debouncedTitle, setDebouncedTitle] = useState("");
  const [debouncedCategory, setDebouncedCategory] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTitle(titleInput);
      setDebouncedCategory(categoryInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [titleInput, categoryInput]);

  const { data, isLoading } = useVendorProducts(
    vendorId,
    { page, limit: 10, title: debouncedTitle, category: debouncedCategory },
    { enabled: open && !!vendorId },
  );

  const products = data?.data || [];
  const pagination = data?.pagination;

  const handleOpen = (e) => {
    e.stopPropagation();
    setOpen(true);
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setOpen(false);
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
        Понуди
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        scroll="paper"
        PaperProps={{ sx: { borderRadius: 3, height: "85vh" } }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" component="span" fontWeight="bold">
            Понуди {pagination?.total ? `(${pagination.total})` : ""}
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: "text.secondary" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            p: 0,
            display: "flex",
            flexDirection: "column",
            backgroundColor:
              theme.palette.mode === "dark" ? "background.default" : "grey.50",
          }}
        >
          <Box
            sx={{
              p: 2,
              backgroundColor: "background.paper",
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: "flex",
              gap: 2,
            }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder="Пребарај по име..."
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
            <TextField
              size="small"
              fullWidth
              placeholder="Филтрирај по категорија..."
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              InputProps={{
                startAdornment: (
                  <FilterListIcon color="action" sx={{ mr: 1 }} />
                ),
              }}
            />
          </Box>

          <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
            {isLoading ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
              >
                <CircularProgress />
              </Box>
            ) : products.length === 0 ? (
              <Typography textAlign="center" color="text.secondary" py={4}>
                Овој локал моментално нема активни понуди за ова пребарување.
              </Typography>
            ) : (
              <Box display="flex" flexDirection="column" gap={2}>
                {products.map((item) => {
                  const p = item.product || item;
                  const price = item.price || p.price || "N/A";

                  return (
                    <Card
                      key={item._id}
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
                          width: 140,
                          height: 140,
                          flexShrink: 0,
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "grey.900"
                              : "grey.100",
                          borderRight: `1px solid ${theme.palette.divider}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {p?.image ? (
                          <Box
                            component="img"
                            src={`${BASE_URL}${p.image.url}`}
                            alt={p.title}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <ImageIcon
                            sx={{
                              fontSize: 40,
                              color: theme.palette.grey[400],
                            }}
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
                          <Box>
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              lineHeight={1.2}
                            >
                              {p?.title || "Без наслов"}
                            </Typography>
                            {p?.category && (
                              <Chip
                                label={p.category}
                                size="small"
                                variant="outlined"
                                sx={{ mt: 1, borderRadius: 1 }}
                              />
                            )}
                          </Box>
                          <Typography
                            variant="subtitle1"
                            color="primary.main"
                            fontWeight="bold"
                            whiteSpace="nowrap"
                            ml={1}
                          >
                            {price} ден.
                          </Typography>
                        </Box>
                        {p?.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mt: 1.5,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {stripHtmlAndDecode(p.description)}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            )}
          </Box>

          {!isLoading && pagination?.totalPages > 1 && (
            <Box
              sx={{
                p: 2,
                borderTop: `1px solid ${theme.palette.divider}`,
                backgroundColor: "background.paper",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Pagination
                count={pagination.totalPages}
                page={page}
                onChange={(e, val) => setPage(val)}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export { MapProductInfoModal };

export default MapProductInfoModal;
