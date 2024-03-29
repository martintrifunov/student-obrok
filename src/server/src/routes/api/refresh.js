import express from "express";
import { refreshTokenController } from "../../controllers/refreshTokenController.js";

const router = express.Router();

router.get("/refresh", refreshTokenController.handleRefreshToken);

export { router as refreshTokenRouter };
