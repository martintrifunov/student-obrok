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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { API_ROOT } from "../../../server/conifg";

const DealsList = ({ theme }) => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

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
      locationName: "Silbo",
      location: [182, 182],
      description: "aa",
      price: 50,
      image: "3",
    },
    {
      id: 3,
      title: "Deal 3",
      locationName: "Silbo",
      location: [182, 182],
      description: "aa",
      price: 50,
      image: "3",
    },
  ];
  const tableStyle = {
    marginTop: 20,
  };
  const errorStyle = {
    color: "crimson",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
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
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>No.</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Location Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dealsDataFixture.map((deal, index) => (
              <TableRow key={deal.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{deal.title}</TableCell>
                <TableCell>{deal.locationName}</TableCell>
                <TableCell>{deal.location.join(", ")}</TableCell>
                <TableCell>{deal.description}</TableCell>
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
      </TableContainer>
    </>
  );
};

export default DealsList;
