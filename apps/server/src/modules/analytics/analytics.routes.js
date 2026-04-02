import { Router } from "express";
import { analyticsController } from "../../container.js";
import verifyJWT from "../auth/middleware/verifyJWT.js";
import optionalVerifyJWT from "../auth/middleware/optionalVerifyJWT.js";
import verifyAdminUser from "../auth/middleware/verifyAdminUser.js";
import { validateRequest } from "../../shared/middleware/validateRequest.js";
import {
  analyticsHeartbeatSchema,
  analyticsSummaryQuerySchema,
  analyticsFeatureTrendQuerySchema,
  analyticsExportQuerySchema,
} from "./analytics.schema.js";

const router = Router();

router.post(
  "/heartbeat",
  optionalVerifyJWT,
  validateRequest(analyticsHeartbeatSchema),
  analyticsController.heartbeat,
);

router.get(
  "/summary",
  verifyJWT,
  validateRequest(analyticsSummaryQuerySchema, "query"),
  analyticsController.summary,
);

router.get(
  "/feature-trends",
  verifyJWT,
  validateRequest(analyticsFeatureTrendQuerySchema, "query"),
  analyticsController.featureTrends,
);

router.get(
  "/export",
  verifyJWT,
  verifyAdminUser,
  validateRequest(analyticsExportQuerySchema, "query"),
  analyticsController.exportCsv,
);

export { router as analyticsRouter };
