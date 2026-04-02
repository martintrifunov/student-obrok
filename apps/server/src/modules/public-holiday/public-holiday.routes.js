import { Router } from "express";
import { publicHolidayController } from "../../container.js";
import verifyJWT from "../auth/middleware/verifyJWT.js";
import { validateRequest } from "../../shared/middleware/validateRequest.js";
import {
  publicHolidayQuerySchema,
  createPublicHolidaySchema,
  updatePublicHolidaySchema,
  deletePublicHolidaySchema,
} from "./public-holiday.schema.js";

const router = Router();

router.get(
  "/",
  validateRequest(publicHolidayQuerySchema, "query"),
  publicHolidayController.getAll,
);
router.get("/:id", publicHolidayController.getById);
router.post(
  "/",
  verifyJWT,
  validateRequest(createPublicHolidaySchema),
  publicHolidayController.create,
);
router.put(
  "/",
  verifyJWT,
  validateRequest(updatePublicHolidaySchema),
  publicHolidayController.update,
);
router.delete(
  "/",
  verifyJWT,
  validateRequest(deletePublicHolidaySchema),
  publicHolidayController.delete,
);

export { router as publicHolidayRouter };
