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
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import DashboardImageModal from "./DashboardImageModal";
import { BASE_URL } from "../api/consts";

const VendorProductsList = ({ theme, searchTerm, products }) => {
  const navigate = useNavigate();
  const params = useParams();
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const deleteMutation = useMutation({
    mutationFn: async (productId) => {
      await axiosPrivate.delete("/products", { data: { id: productId } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor", params.vendorId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const handleRemoveProduct = async (productId) => {
    if (window.confirm("Are you sure you want to remove this product?")) {
      deleteMutation.mutate(productId);
    }
  };

  const filteredProducts = products.filter((product) =>
    Object.values(product).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  return (
    <TableWrapper>
      {isSmallScreen ? (
        <Grid container spacing={2}>
          {filteredProducts.slice(page * 5, page * 5 + 5).map((product) => (
            <Grid item xs={12} key={product._id}>
              <Card sx={{ marginTop: 2 }}>
                <CardContent>
                  <Box display="flex" justifyContent="center">
                    <Typography variant="h6" style={{ fontWeight: "bold" }}>
                      {product.title}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="center">
                    <Typography variant="body2">
                      <strong>Price: </strong>
                      {product.price}
                    </Typography>
                  </Box>
                  <Box
                    display="flex"
                    justifyContent="center"
                    marginTop={2}
                    gap={2}
                  >
                    <DashboardImageModal
                      variant={"contained"}
                      image={
                        product.image ? `${BASE_URL}${product.image.url}` : ""
                      }
                      imageTitle={product.image?.title || "Product Image"}
                    />
                    <EditButton
                      variant="contained"
                      onClick={() =>
                        navigate(`/dashboard/product/${product._id}`)
                      }
                    >
                      <EditIcon />
                    </EditButton>
                    <RemoveButton
                      variant="outlined"
                      color="inherit"
                      onClick={() => handleRemoveProduct(product._id)}
                      disabled={deleteMutation.isPending}
                    >
                      <DeleteIcon />
                    </RemoveButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Table
          sx={{
            "& thead th": { backgroundColor: "#f2f2f2" },
            "& tbody tr:nth-of-type(even)": { backgroundColor: "#f2f2f2" },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "gray" }}>#</TableCell>
              <TableCell sx={{ color: "gray" }}>Title</TableCell>
              <TableCell sx={{ color: "gray" }}>Price</TableCell>
              <TableCell sx={{ color: "gray" }}>Image</TableCell>
              <TableCell sx={{ color: "gray", textAlign: "right" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts
              .slice(page * 5, page * 5 + 5)
              .map((product, index) => (
                <TableRow key={product._id}>
                  <TableCell>{index + 1 + page * 5}</TableCell>
                  <TableCell>{product.title}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>
                    <DashboardImageModal
                      imageTitle={product.image?.title || "Product Image"}
                      image={
                        product.image ? `${BASE_URL}${product.image.url}` : ""
                      }
                    />
                  </TableCell>
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
              ))}
          </TableBody>
        </Table>
      )}
      <TablePagination
        component="div"
        count={filteredProducts.length}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={5}
        rowsPerPageOptions={[]}
      />
    </TableWrapper>
  );
};

const TableWrapper = styled(TableContainer)(() => ({
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
const EditButton = styled(Button)(() => ({
  backgroundColor: "black",
  textTransform: "none",
  color: "white",
}));
const RemoveButton = styled(Button)(() => ({ textTransform: "none" }));

export default VendorProductsList;
