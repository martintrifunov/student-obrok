import express from "express";
import dealsController from "../../controllers/dealsController.js";
import verifyJWT from "../../middleware/verifyJWT.js";

const router = express.Router();

router
  .route("/deals")
  .get(dealsController.getAllDeals)
  .post(verifyJWT, dealsController.createNewDeal)
  .put(verifyJWT, dealsController.updateDeal)
  .delete(verifyJWT, dealsController.deleteDeal);

router.route("/deals/:id").get(dealsController.getDeal);

export { router as dealsRouter };
