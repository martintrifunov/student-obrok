import { Router } from "express";
import { marketController } from "../../container.js";
import verifyJWT from "../auth/middleware/verifyJWT.js";
import { validateRequest } from "../../shared/middleware/validateRequest.js";
import {
  marketQuerySchema,
  createMarketSchema,
  updateMarketSchema,
  deleteMarketSchema,
  marketParamsSchema,
} from "./market.schema.js";

const router = Router();

router.get(
  "/",
  validateRequest(marketQuerySchema, "query"),
  marketController.getAll,
);
router.get(
  "/:id",
  validateRequest(marketParamsSchema, "params"),
  marketController.getById,
);
router.post(
  "/",
  verifyJWT,
  validateRequest(createMarketSchema),
  marketController.create,
);
router.put(
  "/",
  verifyJWT,
  validateRequest(updateMarketSchema),
  marketController.update,
);
router.delete(
  "/",
  verifyJWT,
  validateRequest(deleteMarketSchema),
  marketController.delete,
);

export { router as marketRouter };
