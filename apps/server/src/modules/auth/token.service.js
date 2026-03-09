import jwt from "jsonwebtoken";

export class TokenService {
  generateAccessToken(username) {
    return jwt.sign(
      { UserInfo: { username } },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15min" },
    );
  }

  generateRefreshToken(username) {
    return jwt.sign({ username }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "1d",
    });
  }

  verifyRefreshToken(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });
  }

  setRefreshTokenCookie(res, token) {
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });
  }

  clearRefreshTokenCookie(res) {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
  }
}
