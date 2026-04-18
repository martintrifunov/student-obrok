import { Router } from "express";
import { reportController } from "../../container.js";
import verifyJWT from "../auth/middleware/verifyJWT.js";
import verifyAdmin from "../auth/middleware/verifyAdmin.js";
import { validateRequest } from "../../shared/middleware/validateRequest.js";
import { createReportSchema, reportJobIdSchema } from "./report.schema.js";

const router = Router();

router.post(
  "/",
  verifyJWT,
  verifyAdmin,
  validateRequest(createReportSchema),
  reportController.create,
);

router.get(
  "/:jobId",
  verifyJWT,
  verifyAdmin,
  validateRequest(reportJobIdSchema, "params"),
  reportController.getStatus,
);

router.post(
  "/:jobId/cancel",
  verifyJWT,
  verifyAdmin,
  validateRequest(reportJobIdSchema, "params"),
  reportController.cancel,
);

router.get(
  "/:jobId/download",
  verifyJWT,
  verifyAdmin,
  validateRequest(reportJobIdSchema, "params"),
  reportController.download,
);

export { router as reportRouter };
