import React, { useState, useEffect } from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TablePagination,
  Skeleton,
  Stack,
  Card,
  CardContent,
  useMediaQuery,
  Box,
  styled,
  Paper,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useDebounce from "../hooks/useDebounce";
import DashboardImageModal from "./DashboardImageModal";
import { BASE_URL } from "../api/consts";

const ProductsList = ({ searchTerm }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [page, setPage] = useState(0);

  const debouncedSearch = useDebounce(searchTerm);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  const {
    data: products = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products", debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: 0 });
      if (debouncedSearch) params.append("title", debouncedSearch);
      const response = await axiosPrivate.get(`/products?${params}`);
      return response.data.data;
    },
    onError: () =>
      navigate("/login", { state: { from: location }, replace: true }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axiosPrivate.delete("/products", { data: { id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });

  const handleRemoveProduct = async (productId) => {
    if (window.confirm("Are you sure you want to remove this product?")) {
      deleteMutation.mutate(productId);
    }
  };

  return (
    <>
      {isError && (
        <Error variant="p">{error?.response?.data?.message || "Error"}</Error>
      )}
      {isSmallScreen ? (
        <Stack spacing={2} sx={{ width: "100%" }}>
          {!isLoading
            ? products.slice(page * 5, page * 5 + 5).map((product) => (
                <Card
                  key={product._id}
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: "none",
                    width: "100%",
                  }}
                >
                  <CardContent sx={{ pb: "16px !important" }}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: "bold", lineHeight: 1.2, mb: 0.5 }}
                        >
                          {product.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Price: </strong> {product.price}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Vendor: </strong>{" "}
                          {product.vendor?.name || "N/A"}
                        </Typography>
                      </Box>
                      <Box display="flex" gap={0.5} ml={1}>
                        <IconButton
                          size="small"
                          color="inherit"
                          onClick={() =>
                            navigate(`/dashboard/product/${product._id}`)
                          }
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="inherit"
                          onClick={() => handleRemoveProduct(product._id)}
                          disabled={deleteMutation.isPending}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box display="flex" mt={2}>
                      <DashboardImageModal
                        variant="outlined"
                        image={
                          product.image ? `${BASE_URL}${product.image.url}` : ""
                        }
                        imageTitle={product.image?.title || "Product Image"}
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))
            : Array(5)
                .fill()
                .map((_, i) => (
                  <Skeleton
                    key={i}
                    animation="wave"
                    height={160}
                    width="100%"
                    sx={{ borderRadius: 2 }}
                  />
                ))}
        </Stack>
      ) : (
        <TableWrapper>
          <Table sx={{ minWidth: 600 }}>
            <TableHead
              sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}
            >
              <TableRow>
                <TableCell sx={{ color: "text.secondary", fontWeight: "bold" }}>
                  #
                </TableCell>
                <TableCell sx={{ color: "text.secondary", fontWeight: "bold" }}>
                  Title
                </TableCell>
                <TableCell sx={{ color: "text.secondary", fontWeight: "bold" }}>
                  Price
                </TableCell>
                <TableCell sx={{ color: "text.secondary", fontWeight: "bold" }}>
                  Image
                </TableCell>
                <TableCell sx={{ color: "text.secondary", fontWeight: "bold" }}>
                  Vendor
                </TableCell>
                <TableCell
                  sx={{
                    color: "text.secondary",
                    fontWeight: "bold",
                    textAlign: "right",
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!isLoading
                ? products
                    .slice(page * 5, page * 5 + 5)
                    .map((product, index) => (
                      <TableRow key={product._id}>
                        <TableCell>{index + 1 + page * 5}</TableCell>
                        <TableCell>{product.title}</TableCell>
                        <TableCell>{product.price}</TableCell>
                        <TableCell>
                          <DashboardImageModal
                            imageTitle={product.image?.title}
                            image={
                              product.image
                                ? `${BASE_URL}${product.image.url}`
                                : ""
                            }
                          />
                        </TableCell>
                        <TableCell>{product.vendor?.name || "N/A"}</TableCell>
                        <TableCell style={{ textAlign: "right" }}>
                          <IconButton
                            color="inherit"
                            onClick={() =>
                              navigate(`/dashboard/product/${product._id}`)
                            }
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="inherit"
                            onClick={() => handleRemoveProduct(product._id)}
                            disabled={deleteMutation.isPending}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                : Array(5)
                    .fill()
                    .map((_, i) => (
                      <TableRow key={i}>
                        {Array(6)
                          .fill()
                          .map((_, idx) => (
                            <TableCell key={idx}>
                              <Skeleton animation="wave" height={40} />
                            </TableCell>
                          ))}
                      </TableRow>
                    ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={products.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={5}
            rowsPerPageOptions={[]}
          />
        </TableWrapper>
      )}
    </>
  );
};

const TableWrapper = styled(TableContainer)(({ theme }) => ({
  width: "100%",
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.02)",
  backgroundColor: theme.palette.background.paper,
}));

const Error = styled(Typography)(() => ({
  color: "crimson",
  width: "100%",
  display: "flex",
  justifyContent: "center",
}));

export default ProductsList;
