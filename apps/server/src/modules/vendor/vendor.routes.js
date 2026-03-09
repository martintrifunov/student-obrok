import { Router } from "express";
import { vendorController } from "./index.js";
import verifyJWT from "../../middleware/verifyJWT.js";

const router = Router();

router.get("/report", verifyJWT, vendorController.generateReport);
router.get("/", vendorController.getAll);
router.get("/:id", vendorController.getById);
router.post("/", verifyJWT, vendorController.create);
router.put("/", verifyJWT, vendorController.update);
router.delete("/", verifyJWT, vendorController.delete);

export { router as vendorRouter };
