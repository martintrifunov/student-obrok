import { AppError } from "../../../shared/errors/AppError.js";

const verifyAdminUser = (req, res, next) => {
  const adminUsername = process.env.ADMIN_USERNAME;

  if (!adminUsername) {
    throw new AppError("Admin configuration is missing.", 500);
  }

  if (req.user !== adminUsername) {
    throw new AppError("Forbidden.", 403);
  }

  next();
};

export default verifyAdminUser;
