import React, { useState, useEffect, useCallback } from "react";
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
  TextField,
  Pagination,
  CircularProgress,
  Chip,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { BASE_URL } from "@/api/consts";
import getCategoryIcon from "@/components/ui/categoryIcons";
import { useAISearch } from "@/features/products/hooks/useProductQueries";

const GlobalAISearchDialog = ({ open, onClose, onNavigateToMarket }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!open) {
      setSearchInput("");
      setDebouncedQuery("");
      setPage(1);
    }
  }, [open]);

  const { data, isLoading } = useAISearch(
    { q: debouncedQuery, page, limit: 10 },
    { enabled: open && !!debouncedQuery },
  );

  const results = data?.data || [];
  const pagination = data?.pagination;

  const handleResultClick = useCallback(
    (result) => {
      const market = result.marketProducts?.[0]?.market;
      if (market?.location && onNavigateToMarket) {
        onNavigateToMarket({
          longitude: market.location.longitude,
          latitude: market.location.latitude,
          marketName: market.name,
        });
        onClose();
      }
    },
    [onNavigateToMarket, onClose],
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      fullScreen={isMobile}
      maxWidth="md"
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          height: isMobile ? "100%" : "80vh",
        },
      }}
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AutoAwesomeIcon color="primary" />
          <Typography variant="h6" component="span" fontWeight="bold">
            AI Пребарување
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "text.secondary" }}>
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
          }}
        >
          <TextField
            size="small"
            fullWidth
            autoFocus
            placeholder="Пребарувај низ сите маркети..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{
              startAdornment: (
                <AutoAwesomeIcon color="primary" sx={{ mr: 1 }} />
              ),
            }}
          />
        </Box>

        <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
          {!debouncedQuery ? (
            <Typography
              textAlign="center"
              color="text.secondary"
              py={4}
              variant="body2"
            >
              Внесете термин за пребарување низ сите маркети.
            </Typography>
          ) : isLoading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <CircularProgress />
            </Box>
          ) : results.length === 0 ? (
            <Typography textAlign="center" color="text.secondary" py={4}>
              Нема резултати за "{debouncedQuery}".
            </Typography>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {results.map((item) => {
                const p = item.product;
                const CategoryIcon = getCategoryIcon(p?.category);

                return (
                  <Card
                    key={p?._id}
                    sx={{
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      boxShadow: "0px 2px 10px rgba(0,0,0,0.03)",
                      overflow: "hidden",
                      cursor: item.marketProducts?.length ? "pointer" : "default",
                      "&:hover": item.marketProducts?.length
                        ? { boxShadow: theme.shadows[4] }
                        : {},
                    }}
                    onClick={() => handleResultClick(item)}
                  >
                    <Box
                      sx={{
                        width: isMobile ? "100%" : 120,
                        height: isMobile ? 120 : 120,
                        flexShrink: 0,
                        position: "relative",
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "grey.900"
                            : "grey.100",
                        borderRight: isMobile
                          ? "none"
                          : `1px solid ${theme.palette.divider}`,
                        borderBottom: isMobile
                          ? `1px solid ${theme.palette.divider}`
                          : "none",
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
                        <CategoryIcon
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
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        lineHeight={1.2}
                      >
                        {p?.title || "No Title"}
                      </Typography>

                      {p?.category && (
                        <Chip
                          label={p.category}
                          size="small"
                          variant="outlined"
                          sx={{ mt: 0.5, borderRadius: 1 }}
                        />
                      )}

                      {item.marketProducts?.length > 0 && (
                        <Box
                          sx={{
                            mt: 1,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1,
                          }}
                        >
                          {item.marketProducts.map((mp, idx) => (
                            <Chip
                              key={idx}
                              icon={<StorefrontIcon />}
                              label={`${mp.market?.name || "Маркет"} — ${mp.price} ден.`}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ borderRadius: 1 }}
                            />
                          ))}
                        </Box>
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
              size={isMobile ? "small" : "medium"}
              siblingCount={isMobile ? 0 : 1}
            />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GlobalAISearchDialog;
