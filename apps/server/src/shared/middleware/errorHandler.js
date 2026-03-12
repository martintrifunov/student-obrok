import { AppError } from "../errors/AppError.js";
import { ValidationError } from "../errors/ValidationError.js";

export const errorHandler = (err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json(err.errors);
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  console.error(err);
  res.status(500).json({ message: "Internal server error." });
};
