export class AuthController {
  constructor(authService, tokenService) {
    this.authService = authService;
    this.tokenService = tokenService;
  }

  login = async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const existingRefreshToken = req.cookies?.jwt;

      if (existingRefreshToken) {
        this.tokenService.clearRefreshTokenCookie(res);
      }

      const { accessToken, newRefreshToken } = await this.authService.login(
        username,
        password,
        existingRefreshToken,
      );

      this.tokenService.setRefreshTokenCookie(res, newRefreshToken);
      res.status(200).json({ accessToken });
    } catch (err) {
      next(err);
    }
  };

  logout = async (req, res, next) => {
    try {
      const refreshToken = req.cookies?.jwt;

      this.tokenService.clearRefreshTokenCookie(res);
      await this.authService.logout(refreshToken);

      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  };

  refresh = async (req, res, next) => {
    try {
      const existingRefreshToken = req.cookies?.jwt;

      this.tokenService.clearRefreshTokenCookie(res);

      const { accessToken, newRefreshToken } =
        await this.authService.refresh(existingRefreshToken);

      this.tokenService.setRefreshTokenCookie(res, newRefreshToken);
      res.status(200).json({ accessToken });
    } catch (err) {
      next(err);
    }
  };
}
