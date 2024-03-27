import { DealModel } from "../models/Deals.js";
import mongoose from "mongoose";

const getAllDeals = async (req, res) => {
  const deals = await DealModel.find();

  if (!deals) return res.status(204).json({ message: "No deals found." });

  res.json(deals);
};

const createNewDeal = async (req, res) => {
  if (!req?.body?.title) {
    return res.status(400).json({ message: "Title is required!" });
  }

  if (!req?.body?.locationName) {
    return res.status(400).json({ message: "Location name is required!" });
  }

  if (!req?.body?.location) {
    return res
      .status(400)
      .json({ message: "Location coordinates are required!" });
  }

  if (!req?.body?.description) {
    return res.status(400).json({ message: "Description is required!" });
  }

  if (!req?.body?.price) {
    return res.status(400).json({ message: "Price is required!" });
  }

  if (!req?.body?.image || !req?.body?.imageTitle) {
    return res.status(400).json({ message: "Cover image is required!" });
  }

  try {
    const result = await DealModel.create({
      title: req.body.title,
      locationName: req.body.locationName,
      location: req.body.location,
      description: req.body.description,
      price: req.body.price,
      image: req.body.image,
      imageTitle: req.body.imageTitle,
    });

    res.status(201).json(result);
  } catch (err) {
    console.error(err);
  }
};

const updateDeal = async (req, res) => {
  if (!req?.body?.id) {
    return res.status(400).json({ message: "ID is required." });
  }

  if (!mongoose.Types.ObjectId.isValid(req.body.id)) {
    return res.status(400).json({ message: "Invalid ID format." });
  }

  const deal = await DealModel.findOne({ _id: req.body.id }).exec();

  if (!deal) {
    return res
      .status(204)
      .json({ message: `No deal matches ID ${req.body.id}.` });
  }

  if (req.body?.title) deal.title = req.body.title;
  if (req.body?.locationName) deal.locationName = req.body.locationName;
  if (req.body?.location) deal.location = req.body.location;
  if (req.body?.description) deal.description = req.body.description;
  if (req.body?.price) deal.price = req.body.price;
  if (req.body?.image) deal.image = req.body.image;
  if (req.body?.imageTitle) deal.imageTitle = req.body.imageTitle;

  const result = await deal.save();
  res.json(result);
};

const deleteDeal = async (req, res) => {
  if (!req?.body?.id)
    return res.status(400).json({ message: "ID is required." });

  if (!mongoose.Types.ObjectId.isValid(req.body.id)) {
    return res.status(400).json({ message: "Invalid ID format." });
  }

  const deal = await DealModel.findOne({ _id: req.body.id }).exec();

  if (!deal) {
    return res
      .status(204)
      .json({ message: `No deal matches ID ${req.body.id}.` });
  }
  const result = await deal.deleteOne();
  res.json(result);
};

const getDeal = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "ID parameter is required." });

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID format." });
  }

  const deal = await DealModel.findOne({ _id: req.params.id }).exec();

  if (!deal) {
    return res
      .status(204)
      .json({ message: `No deal matches ID ${req.params.id}.` });
  }

  res.json(deal);
};

const dealsController = {
  getAllDeals,
  createNewDeal,
  updateDeal,
  deleteDeal,
  getDeal,
};

export default dealsController;
