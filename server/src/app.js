import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { authRouter } from "./routes/api/auth.js";
import { dealsRouter } from "./routes/api/deals.js";
import connectDB from "./config/connectDB.js";
import credentials from "./middleware/credentials.js";
import corsOptions from "./config/corsOptions.js";
import cookieParser from "cookie-parser";
import verifyJWT from "./middleware/verifyJWT.js";
const PORT = process.env.PORT || 8080;

const app = express();

connectDB();

//Middlewares

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleware for json
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

//Routes
app.use("/api", authRouter);
app.use(verifyJWT);
app.use("/api", dealsRouter);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
