import { Router } from "express";
import { authController } from "../../container.js";
import { loginLimiter } from "../../shared/middleware/rateLimiter.js";
import { validateRequest } from "../../shared/middleware/validateRequest.js";
import { loginSchema } from "./auth.schema.js";

const router = Router();

router.post(
  "/login",
  loginLimiter,
  validateRequest(loginSchema),
  authController.login,
);
router.get("/logout", authController.logout);
router.get("/refresh", authController.refresh);

export { router as authRouter };