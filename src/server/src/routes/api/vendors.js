import express from "express";
import vendorsController from "../../controllers/vendorsController.js";
import verifyJWT from "../../middleware/verifyJWT.js";

const router = express.Router();

router
  .route("/vendors")
  .get(vendorsController.getAllVendors)
  .post(verifyJWT, vendorsController.createNewVendor)
  .put(verifyJWT, vendorsController.updateVendor)
  .delete(verifyJWT, vendorsController.deleteVendor);

router
  .route("/vendors/report")
  .get(verifyJWT, vendorsController.generateReport);

router.route("/vendors/:id").get(vendorsController.getVendor);

export { router as vendorsRouter };
