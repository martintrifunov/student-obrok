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

    const accessToken = this.tokenService.generateAccessToken(user.username, user.role);
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
          await this.authRepository.clearRefreshTokens(hackedUser._id);
        }
      } catch {
        // Invalid token — no further action needed
      }

      throw new UnauthorizedError();
    }

    try {
      const decoded =
        await this.tokenService.verifyRefreshToken(existingRefreshToken);

      // Token valid but username mismatch — tampered token
      if (user.username !== decoded.username) {
        throw new UnauthorizedError();
      }

      const accessToken = this.tokenService.generateAccessToken(
        decoded.username,
        user.role,
      );
      const newRefreshToken = this.tokenService.generateRefreshToken(
        user.username,
      );

      // Atomic swap: pull old token + push new token in one operation.
      // If a concurrent request already consumed this token, updated is null.
      const updated = await this.authRepository.rotateRefreshToken(
        user._id,
        existingRefreshToken,
        newRefreshToken,
      );
      if (!updated) throw new UnauthorizedError();

      return { accessToken, newRefreshToken };
    } catch (err) {
      // Token expired or tampered — remove old token atomically and reject
      await this.authRepository.removeRefreshToken(
        user._id,
        existingRefreshToken,
      );
      throw err instanceof UnauthorizedError ? err : new UnauthorizedError();
    }
  }
}
