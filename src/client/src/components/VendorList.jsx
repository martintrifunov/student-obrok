import React, { useEffect, useState } from "react";
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
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../api/axios";
import DashboardImageModal from "./DashboardImageModal";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

const VendorstList = ({ theme, searchTerm, setDeals, vendors, setVendors }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleRemoveVendor = async (vendorId) => {
    let confirmed = window.confirm(
      "Are you sure you want to remove this vendor?\nThis WILL REMOVE all of the deals that are by this vendor."
    );

    if (!confirmed) {
      return;
    }

    setIsLoading(true);

    try {
      await axiosPrivate.delete("/vendors", {
        data: JSON.stringify({
          id: vendorId,
        }),
      });

      const vendorsResponse = await axios.get("/vendors", {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      const dealsResponse = await axios.get("/deals", {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      setDeals(dealsResponse.data);
      setVendors(vendorsResponse.data);
      setIsLoading(false);
    } catch (error) {
      setError(error.response.data.message);
      navigate("/login", { state: { from: location }, replace: true });
    }
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    setIsLoading(true);

    const fetchVendors = async () => {
      try {
        const response = await axios.get(
          "/vendors",
          {
            signal: controller.signal,
          },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        isMounted && setVendors(response.data);
        setIsLoading(false);
      } catch (error) {
        setError(error.response.data.message);
        navigate("/login", { state: { from: location }, replace: true });
      }
    };

    fetchVendors();

    return () => {
      isMounted = false;
      setIsLoading(false);
      controller.abort();
    };
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleEditVendor = (vendorId) => {
    navigate(`/dashboard/vendor/${vendorId}`);
  };

  const handleNavigateToDeals = (vendorId) => {
    navigate(`/dashboard/deals/${vendorId}`);
  };

  const searchTermInVendor = (deal, term) => {
    return Object.values(deal).some((value) =>
      value?.toString().toLowerCase().includes(term.toLowerCase())
    );
  };

  const filteredVendors = vendors.filter((deal) =>
    searchTermInVendor(deal, searchTerm)
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
            ? filteredVendors
                .slice(page * 5, page * 5 + 5)
                .map((vendor, index) => (
                  <Grid item xs={12} key={vendor._id}>
                    <Card sx={{ marginTop: 2 }}>
                      <CardContent>
                        <Box display="flex" justifyContent="center">
                          <Typography
                            variant="h6"
                            style={{ fontWeight: "bold" }}
                          >
                            {vendor.name}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="center">
                          <Typography variant="body2">
                            <strong>Location:</strong>{" "}
                            {vendor.location.join(", ")}
                          </Typography>
                        </Box>
                        <Box
                          display="flex"
                          justifyContent="center"
                          marginTop={2}
                        >
                          <DashboardImageModal
                            variant={"contained"}
                            image={vendor.image}
                            imageTitle={vendor.imageTitle}
                          />
                          <Button
                            variant="contained"
                            onClick={() => handleEditVendor(vendor._id)}
                            style={editButtonStyle}
                          >
                            <EditIcon />
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            color="inherit"
                            onClick={() => handleRemoveVendor(vendor._id)}
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
            : Array(Math.min(5, filteredVendors.length))
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
                  <TableCell style={tableHeaderCellStyle}>Name</TableCell>
                  <TableCell style={tableHeaderCellStyle}>Location</TableCell>
                  <TableCell style={tableHeaderCellStyle}>Image</TableCell>
                  <TableCell style={tableHeaderCellStyle}>Deals</TableCell>
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
                    {filteredVendors
                      .slice(page * 5, page * 5 + 5)
                      .map((vendor, index) => (
                        <TableRow key={vendor._id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{vendor.name}</TableCell>
                          <TableCell>{vendor.location.join(", ")}</TableCell>
                          <TableCell>
                            <DashboardImageModal
                              imageTitle={vendor.imageTitle}
                              image={vendor.image}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              disabled={!vendor.deals}
                              color="inherit"
                              sx={{ textTransform: "none" }}
                              onClick={() => handleNavigateToDeals(vendor._id)}
                            >
                              <LocalOfferIcon sx={{ marginRight: 1 }} />
                              View
                            </Button>
                          </TableCell>
                          <TableCell style={{ textAlign: "right" }}>
                            <IconButton
                              color="inherit"
                              onClick={() => handleEditVendor(vendor._id)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="inherit"
                              onClick={() => handleRemoveVendor(vendor._id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                  </>
                ) : (
                  Array(Math.min(5, filteredVendors.length))
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
              count={vendors.length}
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

export default VendorstList;
