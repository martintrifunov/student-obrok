import express from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";

import credentials from "./middleware/credentials.js";
import corsOptions from "./config/corsOptions.js";
import { errorHandler } from "./middleware/errorHandler.js";

import { authRouter } from "./modules/auth/auth.routes.js";
import { vendorRouter } from "./modules/vendor/vendor.routes.js";
import { productRouter } from "./modules/product/product.routes.js";
import { imageRouter } from "./modules/image/image.routes.js";

const app = express();

app.use(credentials);
app.use(cors(corsOptions));
app.use(express.urlencoded({ limit: "10mb", extended: false }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use("/uploads", express.static(path.resolve("src/uploads")));

app.use("/api", authRouter);
app.use("/api/vendors", vendorRouter);
app.use("/api/products", productRouter);
app.use("/api/images", imageRouter);

app.use(errorHandler);

export default app;
