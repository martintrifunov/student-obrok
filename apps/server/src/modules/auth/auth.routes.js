import { Router } from "express";
import { authController } from "./index.js";

const router = Router();

router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.get("/refresh", authController.refresh);

export { router as authRouter };
