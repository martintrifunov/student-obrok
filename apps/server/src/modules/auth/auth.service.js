import bcrypt from "bcrypt";
import { UnauthorizedError } from "../../shared/errors/UnauthorizedError.js";

export class AuthService {
  constructor(authRepository, tokenService) {
    this.authRepository = authRepository;
    this.tokenService = tokenService;
  }

  async login(username, password, existingRefreshToken) {
    const user = await this.authRepository.findByUsername(username);
    if (!user) throw new UnauthorizedError();

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedError();

    // Build new refresh token array — drop the old cookie token if present
    let refreshTokenArray = !existingRefreshToken
      ? user.refreshToken
      : user.refreshToken.filter((rt) => rt !== existingRefreshToken);

    // If cookie token exists but isn't in DB it was already used —
    // possible reuse attack, wipe all tokens for this user
    if (existingRefreshToken) {
      const tokenInDb =
        await this.authRepository.findByRefreshToken(existingRefreshToken);
      if (!tokenInDb) refreshTokenArray = [];
    }

    const accessToken = this.tokenService.generateAccessToken(user.username);
    const newRefreshToken = this.tokenService.generateRefreshToken(
      user.username,
    );

    user.refreshToken = [...refreshTokenArray, newRefreshToken];
    await this.authRepository.save(user);

    return { accessToken, newRefreshToken };
  }

  async logout(refreshToken) {
    if (!refreshToken) return;

    const user = await this.authRepository.findByRefreshToken(refreshToken);

    // Token not in DB — still clear the cookie on the controller side
    if (!user) return;

    user.refreshToken = user.refreshToken.filter((rt) => rt !== refreshToken);
    await this.authRepository.save(user);
  }

  async refresh(existingRefreshToken) {
    if (!existingRefreshToken) throw new UnauthorizedError();

    const user =
      await this.authRepository.findByRefreshToken(existingRefreshToken);

    // Refresh token reuse detected
    if (!user) {
      try {
        const decoded =
          await this.tokenService.verifyRefreshToken(existingRefreshToken);

        // Token was valid but not in DB — wipe the hacked user's tokens
        const hackedUser = await this.authRepository.findByUsername(
          decoded.username,
        );

        if (hackedUser) {
          hackedUser.refreshToken = [];
          await this.authRepository.save(hackedUser);
        }
      } catch {
        // Invalid token — no further action needed
      }

      throw new UnauthorizedError();
    }

    const newRefreshTokenArray = user.refreshToken.filter(
      (rt) => rt !== existingRefreshToken,
    );

    try {
      const decoded =
        await this.tokenService.verifyRefreshToken(existingRefreshToken);

      // Token valid but username mismatch — tampered token
      if (user.username !== decoded.username) {
        throw new UnauthorizedError();
      }

      const accessToken = this.tokenService.generateAccessToken(
        decoded.username,
      );
      const newRefreshToken = this.tokenService.generateRefreshToken(
        user.username,
      );

      user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
      await this.authRepository.save(user);

      return { accessToken, newRefreshToken };
    } catch (err) {
      // Token expired — save cleaned array and reject
      user.refreshToken = [...newRefreshTokenArray];
      await this.authRepository.save(user);
      throw new UnauthorizedError();
    }
  }
}
