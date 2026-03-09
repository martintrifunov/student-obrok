import { Router } from "express";
import { authController } from "./index.js";
import { loginLimiter } from "../../middleware/limiters.js";

const router = Router();

router.post("/login", loginLimiter, authController.login);
router.get("/logout", authController.logout);
router.get("/refresh", authController.refresh);

export { router as authRouter };
