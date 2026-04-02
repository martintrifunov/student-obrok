import { Router } from "express";
import { smartSearchController } from "../../container.js";
import { validateRequest } from "../../shared/middleware/validateRequest.js";
import optionalVerifyJWT from "../auth/middleware/optionalVerifyJWT.js";
import {
  smartSearchQuerySchema,
  smartSearchBudgetQuerySchema,
} from "./smart-search.schema.js";

const router = Router();

router.get(
  "/budget",
  optionalVerifyJWT,
  validateRequest(smartSearchBudgetQuerySchema, "query"),
  smartSearchController.getBudget,
);

router.get(
  "/",
  optionalVerifyJWT,
  validateRequest(smartSearchQuerySchema, "query"),
  smartSearchController.search,
);

export { router as smartSearchRouter };
