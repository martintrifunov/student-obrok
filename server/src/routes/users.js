import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { UserModel } from "../models/Users.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const user = await UserModel.findOne({ username });

  if (user) {
    return res.status(409).json({ message: "User already exists!" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new UserModel({ username, password: hashedPassword });
  await newUser.save();

  res.status(200).json({ message: "User Registered Successfully!" });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await UserModel.findOne({ username });

  if (!user) {
    return res.status(409).json({ message: "User does not exists!" });
  }

  const passwordValidator = await bcrypt.compare(password, user.password);

  if (!passwordValidator) {
    return res.status(401).json({ message: "Wrong password!" });
  }

  //TODO MAKE SECRET ENV VAR
  const token = jwt.sign({ id: user._id }, "secret");

  res.status(200).json({ token, uerId: user._id });
});

export { router as userRouter };
