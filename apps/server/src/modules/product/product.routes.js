import { Router } from "express";
import { productController } from "./index.js";
import verifyJWT from "../../middleware/verifyJWT.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import {
  createProductSchema,
  updateProductSchema,
  deleteProductSchema,
  productParamsSchema,
} from "./product.schema.js";

const router = Router();

router.get("/", productController.getAll);
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
