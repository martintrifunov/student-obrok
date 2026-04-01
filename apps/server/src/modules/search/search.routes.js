import { Router } from "express";
import { searchController } from "../../container.js";
import { validateRequest } from "../../shared/middleware/validateRequest.js";
import { searchQuerySchema } from "./search.schema.js";

const router = Router();

router.get(
  "/",
  validateRequest(searchQuerySchema, "query"),
  searchController.search,
);

export { router as searchRouter };
