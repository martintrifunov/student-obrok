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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useNavigate, useLocation } from "react-router-dom";

const DealsList = ({ theme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [deals, setDeals] = useState([]);
  const [isRemoving, setIsRemoving] = useState("");

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchDeal = async () => {
      try {
        const response = await axiosPrivate.get("/deals", {
          signal: controller.signal,
        });
        isMounted && setDeals(response.data);
      } catch (error) {
        setError(error.response.data.message);
        navigate("/login", { state: { from: location }, replace: true });
      }
    };

    fetchDeal();

    return () => {
      isMounted = false;
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

      const removeDeal = async (dealId) => {
        try {
          await axiosPrivate.delete("/deals", {
            data: JSON.stringify({
              id: dealId,
            }),
            signal: controller.signal,
          });
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
        } catch (error) {
          setError(error.response.data.message);
        }
      };

      removeDeal(isRemoving).then(fetchDeal);
    }

    return () => {
      isMounted = false;
      controller.abort();
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
    maxWidth: "100px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const tableHeaderCellStyle = {
    color: "gray",
  };

  return (
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
              <TableCell style={tableHeaderCellStyle}>Location Name</TableCell>
              <TableCell style={tableHeaderCellStyle}>Location</TableCell>
              <TableCell style={tableHeaderCellStyle}>Description</TableCell>
              <TableCell style={tableHeaderCellStyle}>Price</TableCell>
              <TableCell style={tableHeaderCellStyle}>Image</TableCell>
              <TableCell style={tableHeaderCellStyle}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deals.slice(page * 5, page * 5 + 5).map((deal, index) => (
              <TableRow key={deal._id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{deal.title}</TableCell>
                <TableCell>{deal.locationName}</TableCell>
                <TableCell>{deal.location.join(", ")}</TableCell>
                <TableCell style={tldrStyle}>{deal.description}</TableCell>
                <TableCell>{deal.price}</TableCell>
                <TableCell>{deal.image}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditDeal(deal._id)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => setIsRemoving(deal._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
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
  );
};

export default DealsList;
