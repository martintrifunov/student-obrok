import { Router } from "express";
import { vendorController } from "./index.js";
import verifyJWT from "../../middleware/verifyJWT.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import {
  createVendorSchema,
  updateVendorSchema,
  deleteVendorSchema,
  vendorParamsSchema,
} from "./vendor.schema.js";

const router = Router();

router.get("/report", verifyJWT, vendorController.generateReport);
router.get("/", vendorController.getAll);
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
