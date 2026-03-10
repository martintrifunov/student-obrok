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
  Button,
  styled,
  Paper,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useDebounce from "../hooks/useDebounce";
import DashboardImageModal from "./DashboardImageModal";
import { BASE_URL } from "../api/consts";

const VendorsList = ({ searchTerm }) => {
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
    data: vendors = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["vendors", debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: 0 });
      if (debouncedSearch) params.append("name", debouncedSearch);
      const response = await axiosPrivate.get(`/vendors?${params}`);
      return response.data.data;
    },
    onError: () =>
      navigate("/login", { state: { from: location }, replace: true }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axiosPrivate.delete("/vendors", { data: { id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const handleRemoveVendor = async (vendorId) => {
    if (
      window.confirm(
        "Are you sure you want to remove this vendor?\nThis WILL REMOVE all of the products that are by this vendor.",
      )
    ) {
      deleteMutation.mutate(vendorId);
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
            ? vendors.slice(page * 5, page * 5 + 5).map((vendor) => (
                <Card
                  key={vendor._id}
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
                          {vendor.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Location:</strong>{" "}
                          {vendor.location.join(", ")}
                        </Typography>
                      </Box>
                      <Box display="flex" gap={0.5} ml={1}>
                        <IconButton
                          size="small"
                          color="inherit"
                          onClick={() =>
                            navigate(`/dashboard/vendor/${vendor._id}`)
                          }
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="inherit"
                          onClick={() => handleRemoveVendor(vendor._id)}
                          disabled={deleteMutation.isPending}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box display="flex" gap={2} mt={2}>
                      <Box sx={{ flex: 1 }}>
                        <DashboardImageModal
                          variant="outlined"
                          image={`${BASE_URL}${vendor?.image?.url}`}
                          imageTitle={vendor?.image?.title}
                        />
                      </Box>
                      <Button
                        sx={{ flex: 1 }}
                        variant="contained"
                        color="primary"
                        disableElevation
                        onClick={() =>
                          navigate(`/dashboard/products/${vendor._id}`)
                        }
                        disabled={
                          !vendor.products || vendor.products.length === 0
                        }
                        startIcon={<LocalOfferIcon />}
                      >
                        Products
                      </Button>
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
        <VendorsTableContainer>
          <Table sx={{ minWidth: 600 }}>
            <TableHead
              sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}
            >
              <TableRow>
                <TableCell sx={{ color: "text.secondary", fontWeight: "bold" }}>
                  #
                </TableCell>
                <TableCell sx={{ color: "text.secondary", fontWeight: "bold" }}>
                  Name
                </TableCell>
                <TableCell sx={{ color: "text.secondary", fontWeight: "bold" }}>
                  Location
                </TableCell>
                <TableCell sx={{ color: "text.secondary", fontWeight: "bold" }}>
                  Image
                </TableCell>
                <TableCell sx={{ color: "text.secondary", fontWeight: "bold" }}>
                  Products
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
                ? vendors.slice(page * 5, page * 5 + 5).map((vendor, index) => (
                    <TableRow key={vendor._id}>
                      <TableCell>{index + 1 + page * 5}</TableCell>
                      <TableCell>{vendor.name}</TableCell>
                      <TableCell>{vendor.location.join(", ")}</TableCell>
                      <TableCell>
                        <DashboardImageModal
                          imageTitle={vendor?.image?.title}
                          image={`${BASE_URL}${vendor?.image?.url}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          disabled={
                            !vendor.products || vendor.products.length === 0
                          }
                          color="inherit"
                          sx={{ textTransform: "none" }}
                          onClick={() =>
                            navigate(`/dashboard/products/${vendor._id}`)
                          }
                        >
                          <LocalOfferIcon sx={{ marginRight: 1 }} /> View
                        </Button>
                      </TableCell>
                      <TableCell style={{ textAlign: "right" }}>
                        <IconButton
                          color="inherit"
                          onClick={() =>
                            navigate(`/dashboard/vendor/${vendor._id}`)
                          }
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="inherit"
                          onClick={() => handleRemoveVendor(vendor._id)}
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
            count={vendors.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={5}
            rowsPerPageOptions={[]}
          />
        </VendorsTableContainer>
      )}
    </>
  );
};

const VendorsTableContainer = styled(TableContainer)(({ theme }) => ({
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

export default VendorsList;
