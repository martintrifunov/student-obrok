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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "../api/axios";
import DashboardImageModal from "./DashboardImageModal";

const VendorDealsList = ({ theme, searchTerm, deals, setDeals }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();

  const handleRemoveDeal = async (dealId) => {
    let confirmed = window.confirm(
      "Are you sure you want to remove this deal?"
    );

    if (!confirmed) {
      return;
    }

    setIsLoading(true);

    try {
      await axiosPrivate.delete("/deals", {
        data: JSON.stringify({
          id: dealId,
        }),
      });

      const dealsResponse = await axios.get(`/vendors/${params.vendorId}`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      setDeals(dealsResponse.data.deals);
      setIsLoading(false);
    } catch (error) {
      setError(error.response.data.message);
      navigate("/login", { state: { from: location }, replace: true });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleEditDeal = (dealId) => {
    navigate(`/dashboard/deal/${dealId}`);
  };

  const searchTermInDeal = (deal, term) => {
    return Object.values(deal).some((value) =>
      value?.toString().toLowerCase().includes(term.toLowerCase())
    );
  };

  const filteredDeals = deals.filter((deal) =>
    searchTermInDeal(deal, searchTerm)
  );

  const tableStyle = {
    width: "98vw",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 20,
    borderRadius: 10,
  };
  const errorStyle = {
    color: "crimson",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
  };

  const tableHeaderCellStyle = {
    color: "gray",
  };

  const editButtonStyle = {
    backgroundColor: "black",
    marginLeft: "3vw",
    textTransform: "none",
  };

  const removeButtonStyle = {
    marginLeft: "3vw",
    textTransform: "none",
  };

  return (
    <>
      {isSmallScreen ? (
        <Grid container spacing={2}>
          {!isLoading
            ? filteredDeals.slice(page * 5, page * 5 + 5).map((deal, index) => (
                <Grid item xs={12} key={deal._id}>
                  <Card sx={{ marginTop: 2 }}>
                    <CardContent>
                      <Box display="flex" justifyContent="center">
                        <Typography variant="h6" style={{ fontWeight: "bold" }}>
                          {deal.title}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="center">
                        <Typography variant="body2">
                          <strong>Price:</strong>
                          {deal.price}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="center" marginTop={2}>
                        <DashboardImageModal
                          variant={"contained"}
                          image={deal.image}
                          imageTitle={deal.imageTitle}
                        />
                        <Button
                          variant="contained"
                          onClick={() => handleEditDeal(deal._id)}
                          style={editButtonStyle}
                        >
                          <EditIcon />
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          color="inherit"
                          onClick={() => handleRemoveDeal(deal._id)}
                          style={removeButtonStyle}
                        >
                          <DeleteIcon />
                          Remove
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            : Array(Math.min(5, filteredDeals.length))
                .fill()
                .map((_, index) => (
                  <Grid item xs={12} key={index}>
                    <Skeleton
                      animation="wave"
                      height={250}
                      width="100%"
                      sx={{ marginTop: -5, marginBottom: -2, padding: 0 }}
                    />
                  </Grid>
                ))}
        </Grid>
      ) : (
        <>
          {error && (
            <Typography variant="p" style={errorStyle}>
              {error}
            </Typography>
          )}
          <TableContainer style={tableStyle}>
            <Table
              sx={{
                "& thead th": {
                  backgroundColor: "#f2f2f2",
                },
                "& tbody tr:nth-of-type(even)": {
                  backgroundColor: "#f2f2f2",
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell style={tableHeaderCellStyle}>#</TableCell>
                  <TableCell style={tableHeaderCellStyle}>Title</TableCell>
                  <TableCell style={tableHeaderCellStyle}>Price</TableCell>
                  <TableCell style={tableHeaderCellStyle}>Image</TableCell>
                  <TableCell
                    style={{ ...tableHeaderCellStyle, textAlign: "right" }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!isLoading ? (
                  <>
                    {filteredDeals
                      .slice(page * 5, page * 5 + 5)
                      .map((deal, index) => (
                        <TableRow key={deal._id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{deal.title}</TableCell>
                          <TableCell>{deal.price}</TableCell>
                          <TableCell>
                            <DashboardImageModal
                              imageTitle={deal.imageTitle}
                              image={deal.image}
                            />
                          </TableCell>
                          <TableCell style={{ textAlign: "right" }}>
                            <IconButton
                              color="inherit"
                              onClick={() => handleEditDeal(deal._id)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="inherit"
                              onClick={() => handleRemoveDeal(deal._id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                  </>
                ) : (
                  Array(Math.min(5, filteredDeals.length))
                    .fill()
                    .map((_, index) => (
                      <TableRow key={index}>
                        {Array(6)
                          .fill()
                          .map((_, index) => (
                            <TableCell key={index}>
                              <Skeleton
                                animation="wave"
                                height={40}
                                width="100%"
                              />
                            </TableCell>
                          ))}
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={deals.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={5}
              rowsPerPageOptions={[]}
            />
          </TableContainer>
        </>
      )}
    </>
  );
};

export default VendorDealsList;
