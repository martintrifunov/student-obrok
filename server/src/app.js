import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { userRouter } from "./routes/users.js";

const app = express();

//Middlewares
app.use(express.json());
app.use(cors());

//Routes
app.use("/api", userRouter);

// MongoDB connection
mongoose
  .connect("mongodb://localhost:6969/db")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("Error connecting to MongoDB: ", err));

app.listen(8080, () => console.log("Server Init"));
