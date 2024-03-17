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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { API_ROOT } from "../../../server/conifg";

const DealsList = ({ theme }) => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);

  const dealsDataFixture = [
    {
      id: 1,
      title: "Deal 1",
      locationName: "Silbo",
      location: [182, 182],
      description: "aa",
      price: 50,
      image: "3",
    },
    {
      id: 2,
      title: "Deal 2",
      locationName: "Ramstore",
      location: [182, 182],
      description: "aa",
      price: 50,
      image: "3",
    },
    {
      id: 3,
      title: "Deal 3",
      locationName: "7ca",
      location: [182, 182],
      description: "bbbbbbb",
      price: 50,
      image: "3",
    },
    {
      id: 4,
      title: "Deal 4",
      locationName: "Kaj tomi vo shupata",
      location: [182, 182],
      description:
        "aaaaaa sad asjdsa dsad msald asmdslmsdksa mdasmdsa dmasmd sakckspa djaskd saduadjaspkd osaodnasjd jsiadj ksaojdfhdfnjdoas djhashfjasd jsdsdi[jas nidasj",
      price: 50,
      image: "3",
    },
    {
      id: 5,
      title: "Deal 5",
      locationName: "Dominos",
      location: [182, 182],
      description: "aa",
      price: 50,
      image: "3",
    },
    {
      id: 6,
      title: "Deal 6",
      locationName: "Silbo",
      location: [182, 182],
      description: "aa",
      price: 50,
      image: "3",
    },
    {
      id: 7,
      title: "Deal 6",
      locationName: "Silbo",
      location: [182, 182],
      description: "aa",
      price: 50,
      image: "3",
    },
    {
      id: 8,
      title: "Deal 6",
      locationName: "Silbo",
      location: [182, 182],
      description: "aa",
      price: 50,
      image: "3",
    },
    {
      id: 9,
      title: "Deal 6",
      locationName: "Silbo",
      location: [182, 182],
      description: "aa",
      price: 50,
      image: "3",
    },
    {
      id: 10,
      title: "Deal 6",
      locationName: "Silbo",
      location: [182, 182],
      description: "aa",
      price: 50,
      image: "3",
    },
    {
      id: 11,
      title: "Deal 6",
      locationName: "Silbo",
      location: [182, 182],
      description: "aa",
      price: 50,
      image: "3",
    },
  ];
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleEditDeal = (dealId) => {
    navigate("/");
  };

  const handleRemoveDeal = async (dealId) => {
    let confirmed = confirm("Are you sure you want to remove this deal?");

    if (!confirmed) {
      return;
    }

    try {
      const response = await axios.delete(`${API_ROOT}/dashboard/${dealId}`);
      console.log(response);
      navigate("/dashboard");
    } catch (error) {
      setError(error.response.data.message);
    }
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
            {dealsDataFixture
              .slice(page * 5, page * 5 + 5)
              .map((deal, index) => (
                <TableRow key={deal.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{deal.title}</TableCell>
                  <TableCell>{deal.locationName}</TableCell>
                  <TableCell>{deal.location.join(", ")}</TableCell>
                  <TableCell style={tldrStyle}>{deal.description}</TableCell>
                  <TableCell>{deal.price}</TableCell>
                  <TableCell>{deal.image}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditDeal(deal.id)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleRemoveDeal(deal.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={dealsDataFixture.length}
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
