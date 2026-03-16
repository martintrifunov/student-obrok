import { Router } from "express";
import { productController } from "../../container.js";
import verifyJWT from "../auth/middleware/verifyJWT.js";
import { validateRequest } from "../../shared/middleware/validateRequest.js";
import {
  productQuerySchema,
  createProductSchema,
  updateProductSchema,
  deleteProductSchema,
  productParamsSchema,
} from "./product.schema.js";

const router = Router();

router.get(
  "/",
  validateRequest(productQuerySchema, "query"),
  productController.getAll,
);
router.get("/categories", verifyJWT, productController.getCategories);
router.get(
  "/:id",
  validateRequest(productParamsSchema, "params"),
  productController.getById,
);
router.post(
  "/",
  verifyJWT,
  validateRequest(createProductSchema),
  productController.create,
);
router.put(
  "/",
  verifyJWT,
  validateRequest(updateProductSchema),
  productController.update,
);
router.delete(
  "/",
  verifyJWT,
  validateRequest(deleteProductSchema),
  productController.delete,
);

export { router as productRouter };
