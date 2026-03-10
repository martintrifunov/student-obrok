import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "./auth.service.js";
import { UnauthorizedError } from "../../shared/errors/UnauthorizedError.js";
import bcrypt from "bcrypt";

vi.mock("bcrypt");

const mockAuthRepository = {
  findByUsername: vi.fn(),
  findByRefreshToken: vi.fn(),
  save: vi.fn(),
};

const mockTokenService = {
  generateAccessToken: vi.fn(() => "access-token"),
  generateRefreshToken: vi.fn(() => "refresh-token"),
  verifyRefreshToken: vi.fn(),
};

const makeSut = () => new AuthService(mockAuthRepository, mockTokenService);

beforeEach(() => vi.clearAllMocks());

describe("AuthService", () => {
  describe("login", () => {
    it("throws UnauthorizedError if user not found", async () => {
      mockAuthRepository.findByUsername.mockResolvedValue(null);
      const sut = makeSut();
      await expect(sut.login("maco", "123", null)).rejects.toThrow(
        UnauthorizedError,
      );
    });

    it("throws UnauthorizedError if password does not match", async () => {
      mockAuthRepository.findByUsername.mockResolvedValue({
        username: "maco",
        password: "hashed",
        refreshToken: [],
      });
      bcrypt.compare.mockResolvedValue(false);
      const sut = makeSut();
      await expect(sut.login("maco", "wrong", null)).rejects.toThrow(
        UnauthorizedError,
      );
    });

    it("returns tokens on successful login", async () => {
      const user = {
        username: "maco",
        password: "hashed",
        refreshToken: [],
      };
      mockAuthRepository.findByUsername.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      mockAuthRepository.save.mockResolvedValue(null);
      const sut = makeSut();
      const result = await sut.login("maco", "123", null);
      expect(result).toEqual({
        accessToken: "access-token",
        newRefreshToken: "refresh-token",
      });
      expect(mockAuthRepository.save).toHaveBeenCalled();
    });

    it("filters out existing refresh token on reuse", async () => {
      const user = {
        username: "maco",
        password: "hashed",
        refreshToken: ["old-token"],
      };
      mockAuthRepository.findByUsername.mockResolvedValue(user);
      mockAuthRepository.findByRefreshToken.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      mockAuthRepository.save.mockResolvedValue(null);
      const sut = makeSut();
      await sut.login("maco", "123", "old-token");
      expect(user.refreshToken).not.toContain("old-token");
    });
  });

  describe("logout", () => {
    it("does nothing if no refresh token provided", async () => {
      const sut = makeSut();
      await sut.logout(undefined);
      expect(mockAuthRepository.findByRefreshToken).not.toHaveBeenCalled();
    });

    it("does nothing if user not found for refresh token", async () => {
      mockAuthRepository.findByRefreshToken.mockResolvedValue(null);
      const sut = makeSut();
      await sut.logout("some-token");
      expect(mockAuthRepository.save).not.toHaveBeenCalled();
    });

    it("removes refresh token from user and saves", async () => {
      const user = { refreshToken: ["token-abc"] };
      mockAuthRepository.findByRefreshToken.mockResolvedValue(user);
      mockAuthRepository.save.mockResolvedValue(null);
      const sut = makeSut();
      await sut.logout("token-abc");
      expect(user.refreshToken).not.toContain("token-abc");
      expect(mockAuthRepository.save).toHaveBeenCalledWith(user);
    });
  });

  describe("refresh", () => {
    it("throws UnauthorizedError if no token provided", async () => {
      const sut = makeSut();
      await expect(sut.refresh(undefined)).rejects.toThrow(UnauthorizedError);
    });

    it("throws UnauthorizedError if token not in db and clears hacked user tokens", async () => {
      mockAuthRepository.findByRefreshToken.mockResolvedValue(null);
      mockTokenService.verifyRefreshToken.mockResolvedValue({
        username: "maco",
      });
      const hackedUser = { refreshToken: ["token-abc"] };
      mockAuthRepository.findByUsername.mockResolvedValue(hackedUser);
      mockAuthRepository.save.mockResolvedValue(null);
      const sut = makeSut();
      await expect(sut.refresh("token-abc")).rejects.toThrow(UnauthorizedError);
      expect(hackedUser.refreshToken).toEqual([]);
    });

    it("returns new tokens on valid refresh", async () => {
      const user = { username: "maco", refreshToken: ["token-abc"] };
      mockAuthRepository.findByRefreshToken.mockResolvedValue(user);
      mockTokenService.verifyRefreshToken.mockResolvedValue({
        username: "maco",
      });
      mockAuthRepository.save.mockResolvedValue(null);
      const sut = makeSut();
      const result = await sut.refresh("token-abc");
      expect(result).toEqual({
        accessToken: "access-token",
        newRefreshToken: "refresh-token",
      });
    });
  });
});
