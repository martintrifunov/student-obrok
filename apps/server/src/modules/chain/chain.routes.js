import { Router } from "express";
import { chainController } from "../../container.js";
import verifyJWT from "../auth/middleware/verifyJWT.js";
import { validateRequest } from "../../shared/middleware/validateRequest.js";
import {
  chainQuerySchema,
  createChainSchema,
  updateChainSchema,
  deleteChainSchema,
  chainParamsSchema,
} from "./chain.schema.js";

const router = Router();

router.get("/report", verifyJWT, chainController.generateReport);
router.get(
  "/",
  validateRequest(chainQuerySchema, "query"),
  chainController.getAll,
);
router.get(
  "/:id",
  validateRequest(chainParamsSchema, "params"),
  chainController.getById,
);
router.post(
  "/",
  verifyJWT,
  validateRequest(createChainSchema),
  chainController.create,
);
router.put(
  "/",
  verifyJWT,
  validateRequest(updateChainSchema),
  chainController.update,
);
router.delete(
  "/",
  verifyJWT,
  validateRequest(deleteChainSchema),
  chainController.delete,
);

export { router as chainRouter };
