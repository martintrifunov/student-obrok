import React, { useState } from "react";
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
  Grid,
  Card,
  CardContent,
  useMediaQuery,
  Box,
  Button,
  styled,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import DashboardImageModal from "./DashboardImageModal";
import { BASE_URL } from "../api/consts";

const VendorsList = ({ theme, searchTerm }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [page, setPage] = useState(0);

  const {
    data: vendors = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/vendors?limit=0");
      return response.data.data;
    },
    onError: (err) =>
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

  const filteredVendors = vendors.filter((vendor) =>
    Object.values(vendor).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  return (
    <>
      {isError && (
        <Error variant="p">{error?.response?.data?.message || "Error"}</Error>
      )}
      {isSmallScreen ? (
        <Grid container spacing={2}>
          {!isLoading
            ? filteredVendors.slice(page * 5, page * 5 + 5).map((vendor) => (
                <Grid item xs={12} key={vendor._id}>
                  <Card sx={{ marginTop: 2 }}>
                    <CardContent>
                      <Box display="flex" justifyContent="center">
                        <Typography variant="h6" style={{ fontWeight: "bold" }}>
                          {vendor.name}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="center">
                        <Typography variant="body2">
                          <strong>Location:</strong>{" "}
                          {vendor.location.join(", ")}
                        </Typography>
                      </Box>
                      <VendorButtonsGrid>
                        <DashboardImageModal
                          variant={"contained"}
                          image={`${BASE_URL}${vendor?.image?.url}`}
                          imageTitle={vendor?.image?.title}
                        />
                        <ViewVendorButton
                          variant="contained"
                          onClick={() =>
                            navigate(`/dashboard/products/${vendor._id}`)
                          }
                          disabled={
                            !vendor.products || vendor.products.length === 0
                          }
                        >
                          <LocalOfferIcon sx={{ marginRight: 1 }} /> View
                        </ViewVendorButton>
                        <EditVendorButton
                          variant="contained"
                          onClick={() =>
                            navigate(`/dashboard/vendor/${vendor._id}`)
                          }
                        >
                          <EditIcon />
                        </EditVendorButton>
                        <RemoveVendorButton
                          variant="outlined"
                          color="inherit"
                          onClick={() => handleRemoveVendor(vendor._id)}
                          disabled={deleteMutation.isPending}
                        >
                          <DeleteIcon />
                        </RemoveVendorButton>
                      </VendorButtonsGrid>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            : Array(5)
                .fill()
                .map((_, i) => (
                  <Grid item xs={12} key={i}>
                    <Skeleton
                      animation="wave"
                      height={250}
                      width="100%"
                      sx={{ marginTop: -5, padding: 0 }}
                    />
                  </Grid>
                ))}
        </Grid>
      ) : (
        <VendorsTableContainer>
          <Table
            sx={{
              "& thead th": { backgroundColor: "#f2f2f2" },
              "& tbody tr:nth-of-type(even)": { backgroundColor: "#f2f2f2" },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "gray" }}>#</TableCell>
                <TableCell sx={{ color: "gray" }}>Name</TableCell>
                <TableCell sx={{ color: "gray" }}>Location</TableCell>
                <TableCell sx={{ color: "gray" }}>Image</TableCell>
                <TableCell sx={{ color: "gray" }}>Products</TableCell>
                <TableCell sx={{ color: "gray", textAlign: "right" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!isLoading
                ? filteredVendors
                    .slice(page * 5, page * 5 + 5)
                    .map((vendor, index) => (
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
            count={filteredVendors.length}
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

const VendorsTableContainer = styled(TableContainer)(() => ({
  width: "98vw",
  marginLeft: "auto",
  marginRight: "auto",
  marginTop: 20,
  borderRadius: 10,
}));
const Error = styled(Typography)(() => ({
  color: "crimson",
  width: "100%",
  display: "flex",
  justifyContent: "center",
}));
const VendorButtonsGrid = styled(Box)(() => ({
  display: "flex",
  justifyContent: "center",
  marginTop: 5,
  flexWrap: "wrap",
  gap: 8,
}));
const EditVendorButton = styled(Button)(() => ({
  backgroundColor: "black",
  textTransform: "none",
  color: "white",
}));
const ViewVendorButton = styled(Button)(() => ({
  backgroundColor: "black",
  textTransform: "none",
  color: "white",
}));
const RemoveVendorButton = styled(Button)(() => ({ textTransform: "none" }));

export default VendorsList;
