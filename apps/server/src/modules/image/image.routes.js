import { Router } from "express";
import { imageController } from "./index.js";
import verifyJWT from "../../middleware/verifyJWT.js";
import upload from "../../config/multerConfig.js";

const router = Router();

router.get("/", verifyJWT, imageController.getAll);
router.get("/:id", imageController.getById);
router.post(
  "/",
  verifyJWT,
  upload.single("image"),
  imageController.upload,
);
router.delete("/", verifyJWT, imageController.delete);

export { router as imageRouter };