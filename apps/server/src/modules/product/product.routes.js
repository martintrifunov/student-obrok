import { Router } from "express";
import { productController } from "./index.js";
import verifyJWT from "../../middleware/verifyJWT.js";

const router = Router();

router.get("/", productController.getAll);
router.get("/:id", productController.getById);
router.post("/", verifyJWT, productController.create);
router.put("/", verifyJWT, productController.update);
router.delete("/", verifyJWT, productController.delete);

export { router as productRouter };