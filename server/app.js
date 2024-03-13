import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

//Middlewares
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose
  .connect("mongodb://localhost:6969/db")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

app.listen(8080, () => console.log("Server Init"));
