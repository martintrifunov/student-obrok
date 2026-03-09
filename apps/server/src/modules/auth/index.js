import { AuthRepository } from "./auth.repository.js";
import { AuthService } from "./auth.service.js";
import { AuthController } from "./auth.controller.js";
import { TokenService } from "./token.service.js";

const authRepository = new AuthRepository();
const tokenService = new TokenService();
const authService = new AuthService(authRepository, tokenService);

export const authController = new AuthController(authService, tokenService);
