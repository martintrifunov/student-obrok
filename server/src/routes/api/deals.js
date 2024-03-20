import express from "express";
import dealsController from "../../controllers/dealsController.js";

const router = express.Router();

router
  .route("/deals")
  .get(dealsController.getAllDeals)
  .post(dealsController.createNewDeal)
  .put(dealsController.updateDeal)
  .delete(dealsController.deleteDeal);

router.route("/deals/:id").get(dealsController.getDeal);

export { router as dealsRouter };
