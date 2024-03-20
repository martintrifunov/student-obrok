import { UserModel } from "../models/Users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const handleLogin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res
      .status(400)
      .json({ message: "Username and password are required." });

  const foundUser = await UserModel.findOne({ username }).exec();
  if (!foundUser) return res.sendStatus(401); //Unauthorized
  // evaluate password
  const match = await bcrypt.compare(password, foundUser.password);
  if (match) {
    // create JWTs
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "40s" }
    );
    const refreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    // Saving refreshToken with current user
    foundUser.refreshToken = refreshToken;
    await foundUser.save();

    // Creates Secure Cookie with refresh token
    // REMINDER CHANGE secure: true when deploying
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Send access token to user
    res.json({ accessToken });
  } else {
    res.sendStatus(401);
  }
};

const authController = {
  handleLogin,
};

export default authController;
