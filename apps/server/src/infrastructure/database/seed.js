import bcrypt from "bcrypt";
import { UserModel } from "../../models/User.model.js";

export const seedAdminUser = async () => {
  const existing = await UserModel.findOne({
    username: process.env.ADMIN_USERNAME,
  }).exec();

  if (!existing) {
    const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    await UserModel.create({
      username: process.env.ADMIN_USERNAME,
      password: hashed,
    });
    console.log("Admin user seeded.");
  }
};