import React from "react";
import { Button, Grid, TextField } from "@mui/material";
import DashboardHeader from "../components/DashboardHeader";
import { Container } from "@mui/system";

const AddOrEditForm = () => {
  const gridStyle = {};
  return (
    <Container maxWidth="md">
      <form noValidate autoComplete="off">
        <Grid container spacing={3} justify="center">
          <Grid item xs={12}>
            <TextField id="title" label="Title" variant="outlined" fullWidth />
          </Grid>
          <Grid item xs={12}>
            <TextField
              id="locationName"
              label="Location Name"
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              id="locationX"
              label="Location X"
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              id="locationY"
              label="Location Y"
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              id="description"
              label="Description"
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField id="price" label="Price" variant="outlined" fullWidth />
          </Grid>
          <Grid item xs={12}>
            <TextField id="image" label="Image" variant="outlined" fullWidth />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary">
              Add Deal
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default AddOrEditForm;
