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

const DealsList = ({ theme, searchTerm }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [deals, setDeals] = useState([]);
  const [isRemoving, setIsRemoving] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    setIsLoading(true);

    const fetchDeal = async () => {
      try {
        const response = await axiosPrivate.get("/deals", {
          signal: controller.signal,
        });
        isMounted && setDeals(response.data);
        setIsLoading(false);
      } catch (error) {
        setError(error.response.data.message);
        navigate("/login", { state: { from: location }, replace: true });
      }
    };

    fetchDeal();

    return () => {
      isMounted = false;
      setIsLoading(false);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    if (isRemoving) {
      let confirmed = confirm("Are you sure you want to remove this deal?");

      if (!confirmed) {
        return;
      }

      setIsLoading(true);

      const removeDeal = async (dealId) => {
        try {
          await axiosPrivate.delete("/deals", {
            data: JSON.stringify({
              id: dealId,
            }),
            signal: controller.signal,
          });
          setIsLoading(false);
        } catch (error) {
          setError(error.response.data.message);
          navigate("/login", { state: { from: location }, replace: true });
        }
      };

      const fetchDeal = async () => {
        try {
          const response = await axiosPrivate.get("/deals", {
            signal: controller.signal,
          });
          isMounted && setDeals(response.data);
          setIsLoading(false);
        } catch (error) {
          setError(error.response.data.message);
        }
      };

      removeDeal(isRemoving).then(fetchDeal);
    }

    return () => {
      isMounted = false;
      controller.abort();
      setIsLoading(false);
    };
  }, [isRemoving]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleEditDeal = (dealId) => {
    navigate(`/dashboard/deal/${dealId}`);
  };

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

  const tldrStyle = {
    maxWidth: isSmallScreen ? "200px" : "100px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const tableHeaderCellStyle = {
    color: "gray",
  };

  const editButtonStyle = {
    backgroundColor: "black",
    textTransform: "none",
  };

  const removeButtonStyle = {
    marginLeft: "3vw",
    textTransform: "none",
  };

  const searchTermInDeal = (deal, term) => {
    return Object.values(deal).some((value) =>
      value.toString().toLowerCase().includes(term.toLowerCase())
    );
  };

  const filteredDeals = deals.filter((deal) =>
    searchTermInDeal(deal, searchTerm)
  );

  return (
    <>
      {isSmallScreen ? (
        <Grid container spacing={2}>
          {!isLoading
            ? filteredDeals.slice(page * 5, page * 5 + 5).map((deal, index) => (
                <Grid item xs={12} key={deal._id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" justifyContent="center">
                        <Typography variant="h6" style={{ fontWeight: "bold" }}>
                          {deal.locationName}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="center">
                        <Typography variant="body2">
                          Location: {deal.location.join(", ")}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="center">
                        <Typography variant="body2" style={tldrStyle}>
                          Description: {deal.description}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="center">
                        <Typography variant="body2">
                          Price: {deal.price}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="center" marginTop={2}>
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
                          onClick={() => setIsRemoving(deal._id)}
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
                  <TableCell style={tableHeaderCellStyle}>
                    Location Name
                  </TableCell>
                  <TableCell style={tableHeaderCellStyle}>Location</TableCell>
                  <TableCell style={tableHeaderCellStyle}>
                    Description
                  </TableCell>
                  <TableCell style={tableHeaderCellStyle}>Price</TableCell>
                  <TableCell style={tableHeaderCellStyle}>Image</TableCell>
                  <TableCell style={tableHeaderCellStyle}>Actions</TableCell>
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
                          <TableCell>{deal.locationName}</TableCell>
                          <TableCell>{deal.location.join(", ")}</TableCell>
                          <TableCell style={tldrStyle}>
                            {deal.description}
                          </TableCell>
                          <TableCell>{deal.price}</TableCell>
                          <TableCell style={tldrStyle}>
                            {deal.imageTitle}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() => handleEditDeal(deal._id)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => setIsRemoving(deal._id)}>
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
                        {Array(7)
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

export default DealsList;
