import { Router } from "express";
import { vendorController } from "../../container.js";
import verifyJWT from "../../middleware/verifyJWT.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import {
  createVendorSchema,
  updateVendorSchema,
  deleteVendorSchema,
  vendorParamsSchema,
} from "./vendor.schema.js";
import { paginationSchema } from "../../shared/utils/paginationSchema.js";

const router = Router();

router.get("/report", verifyJWT, vendorController.generateReport);
router.get(
  "/",
  validateRequest(paginationSchema, "query"),
  vendorController.getAll,
);
router.get(
  "/:id",
  validateRequest(vendorParamsSchema, "params"),
  vendorController.getById,
);
router.post(
  "/",
  verifyJWT,
  validateRequest(createVendorSchema),
  vendorController.create,
);
router.put(
  "/",
  verifyJWT,
  validateRequest(updateVendorSchema),
  vendorController.update,
);
router.delete(
  "/",
  verifyJWT,
  validateRequest(deleteVendorSchema),
  vendorController.delete,
);

export { router as vendorRouter };
