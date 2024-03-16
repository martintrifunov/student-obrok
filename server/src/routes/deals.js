import { DealModel } from "../models/Deals.js";
import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/dashboard", async (req, res) => {
  try {
    const response = await DealModel.find({});
    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting deals", error: error.message });
  }
});

router.get("/dashboard/:id", async (req, res) => {
  const dealId = req.params.id;
  try {
    const getDeal = await DealModel.findById(dealId);

    if (!getDeal) {
      return res.status(404).json({ message: "Deal not found!" });
    }

    res.status(200).json(getDeal);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting deal", error: error.message });
  }
});

router.post("/dashboard", async (req, res) => {
  const deal = new DealModel(req.body);
  try {
    const response = await deal.save();
    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering deal", error: error.message });
  }
});

router.put("/dashboard/:id", async (req, res) => {
  const dealId = req.params.id;
  try {
    const updatedDeal = await DealModel.findByIdAndUpdate(dealId, req.body, {
      new: true,
    });

    if (!updatedDeal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    res.status(200).json(updatedDeal);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating deal", error: error.message });
  }
});

router.delete("/dashboard/:id", async (req, res) => {
  const dealId = req.params.id;
  try {
    const deletedDeal = await DealModel.findByIdAndDelete(dealId);

    if (!deletedDeal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    res.status(200).json({ message: "Deal deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting deal", error: error.message });
  }
});

export { router as dealsRouter };
