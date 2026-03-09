import { Router } from "express";
import { imageController } from "./index.js";
import verifyJWT from "../../middleware/verifyJWT.js";
import upload from "../../config/multerConfig.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { deleteImageSchema, imageParamsSchema } from "./image.schema.js";

const router = Router();

router.get("/", verifyJWT, imageController.getAll);
router.get(
  "/:id",
  validateRequest(imageParamsSchema, "params"),
  imageController.getById,
);
router.post("/", verifyJWT, upload.single("image"), imageController.upload);
router.delete(
  "/",
  verifyJWT,
  validateRequest(deleteImageSchema),
  imageController.delete,
);

export { router as imageRouter };
