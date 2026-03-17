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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { useNavigate, useLocation } from "react-router-dom";
import useDebounce from "@/hooks/useDebounce";
import ImagePreviewModal from "@/components/ui/ImagePreviewModal";
import SharedVendorProductsModal from "@/components/ui/SharedVendorProductsModal";
import { BASE_URL } from "@/api/consts";
import {
  useVendors,
  useDeleteVendor,
} from "@/features/vendors/hooks/useVendorQueries";

const VendorsList = ({ searchTerm }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [page, setPage] = useState(0);
  const rowsPerPage = 5;
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState({ id: null, name: "" });

  const debouncedSearch = useDebounce(searchTerm);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  const {
    data: responseData,
    isLoading,
    isError,
    error,
  } = useVendors({
    searchTerm: debouncedSearch,
    page: page + 1,
    limit: rowsPerPage,
  });

  const vendors = responseData?.data || [];
  const totalVendors = responseData?.pagination?.total || 0;

  const deleteMutation = useDeleteVendor();

  useEffect(() => {
    if (isError && error?.response?.status === 401) {
      navigate("/login", { state: { from: location }, replace: true });
    }
  }, [isError, error, navigate, location]);

  const handleRemoveVendor = async (vendorId) => {
    if (
      window.confirm(
        "Are you sure you want to remove this vendor?\nThis WILL REMOVE all of its price listings as well.",
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
            ? vendors.map((vendor) => (
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
                        <ImagePreviewModal
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
                        onClick={() => {
                          setSelectedVendor({
                            id: vendor._id,
                            name: vendor.name,
                          });
                          setModalOpen(true);
                        }}
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
              sx={{
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? theme.palette.background.default
                    : theme.palette.grey[100],
              }}
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
                ? vendors.map((vendor, index) => (
                    <TableRow key={vendor._id}>
                      <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
                      <TableCell>{vendor.name}</TableCell>
                      <TableCell>{vendor.location.join(", ")}</TableCell>
                      <TableCell>
                        <ImagePreviewModal
                          imageTitle={vendor?.image?.title}
                          image={`${BASE_URL}${vendor?.image?.url}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          color="inherit"
                          sx={{ textTransform: "none" }}
                          onClick={() => {
                            setSelectedVendor({
                              id: vendor._id,
                              name: vendor.name,
                            });
                            setModalOpen(true);
                          }}
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
            count={totalVendors}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]}
          />
        </VendorsTableContainer>
      )}

      <SharedVendorProductsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        vendorId={selectedVendor.id}
        title={`${selectedVendor.name} Products`}
      />
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
