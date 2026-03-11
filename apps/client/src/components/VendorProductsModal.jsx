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
  Button,
  useTheme,
  Skeleton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import ProductSearchBar from "./ProductSearchBar";
import { BASE_URL } from "../api/consts";

const stripHtmlAndDecode = (html) => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

const VendorProductsModal = ({ open, onClose, vendorId, vendorName }) => {
  const theme = useTheme();
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const INITIAL_COUNT = 8;
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (open) {
      setVisibleCount(INITIAL_COUNT);
      setSearchTerm("");
    }
  }, [open, vendorId]);

  useEffect(() => {
    setVisibleCount(INITIAL_COUNT);
  }, [searchTerm]);

  const { data: vendor, isLoading } = useQuery({
    queryKey: ["vendor", vendorId],
    queryFn: async () => {
      const res = await axiosPrivate.get(`/vendors/${vendorId}`);
      return res.data;
    },
    enabled: !!vendorId && open,
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId) => {
      await axiosPrivate.delete("/products", { data: { id: productId } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor", vendorId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });

  const handleRemoveProduct = async (productId) => {
    if (window.confirm("Are you sure you want to remove this product?")) {
      deleteMutation.mutate(productId);
    }
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 8);
  };

  const products = vendor?.products || [];
  const filteredProducts = products.filter(
    (product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.price.toString().includes(searchTerm),
  );

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "85vh",
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
        <Typography variant="h6" fontWeight="bold">
          {vendorName} Products
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "text.secondary" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box
        sx={{
          px: 3,
          pt: 1,
          pb: 2,
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <ProductSearchBar
          handleSearchChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      <DialogContent
        sx={{
          p: 3,
          backgroundColor:
            theme.palette.mode === "dark"
              ? theme.palette.background.default
              : theme.palette.grey[50],
        }}
      >
        {isLoading ? (
          <Box
            display="grid"
            gridTemplateColumns="repeat(auto-fill, minmax(260px, 1fr))"
            gap={3}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton
                key={i}
                variant="rounded"
                height={280}
                sx={{ borderRadius: 2 }}
              />
            ))}
          </Box>
        ) : filteredProducts.length === 0 ? (
          <Typography textAlign="center" color="text.secondary" py={5}>
            {products.length === 0
              ? "This vendor has no products yet."
              : "No products match your search."}
          </Typography>
        ) : (
          <Box
            display="grid"
            gridTemplateColumns="repeat(auto-fill, minmax(260px, 1fr))"
            gap={3}
          >
            {visibleProducts.map((product) => (
              <Card
                key={product._id}
                sx={{
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.02)",
                  height: "100%",
                }}
              >
                {product.image ? (
                  <Box
                    sx={{
                      width: "100%",
                      height: 200,
                      backgroundColor: theme.palette.background.default,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      component="img"
                      src={`${BASE_URL}${product.image.url}`}
                      alt={product.title}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      height: 200,
                      backgroundColor: theme.palette.background.default,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <ImageIcon
                      sx={{ fontSize: 64, color: theme.palette.divider }}
                    />
                  </Box>
                )}

                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    pb: "16px !important",
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={1}
                  >
                    <Box sx={{ width: "70%" }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        lineHeight={1.2}
                        mb={0.5}
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {product.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight="bold"
                      >
                        Price: {product.price}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={0.5} ml={1} mt={-0.5} mr={-1}>
                      <IconButton
                        size="small"
                        onClick={() =>
                          navigate(`/dashboard/product/${product._id}`)
                        }
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveProduct(product._id)}
                        disabled={deleteMutation.isPending}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
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

        {hasMore && (
          <Box display="flex" justifyContent="center" mt={5} mb={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleLoadMore}
              sx={{
                borderRadius: 5,
                px: 4,
                py: 1,
                textTransform: "none",
                boxShadow: "0px 4px 10px rgba(0,0,0,0.05)",
              }}
            >
              Load More Products
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VendorProductsModal;
