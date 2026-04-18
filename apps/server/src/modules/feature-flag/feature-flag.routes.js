import { Router } from "express";
import { featureFlagController } from "../../container.js";
import verifyJWT from "../auth/middleware/verifyJWT.js";
import verifyAdmin from "../auth/middleware/verifyAdmin.js";
import { validateRequest } from "../../shared/middleware/validateRequest.js";
import { updateFeatureFlagSchema } from "./feature-flag.schema.js";

const router = Router();

router.get("/", featureFlagController.getAll);
router.get("/admin", verifyJWT, verifyAdmin, featureFlagController.getList);
router.put("/", verifyJWT, verifyAdmin, validateRequest(updateFeatureFlagSchema), featureFlagController.update);

export { router as featureFlagRouter };
