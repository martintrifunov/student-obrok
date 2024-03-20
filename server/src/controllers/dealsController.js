import { DealModel } from "../models/Deals.js";

const getAllDeals = async (req, res) => {
  const deals = await DealModel.find();

  if (!deals) return res.status(204).json({ message: "No deals found." });
  
  res.json(deals);
};

const createNewDeal = async (req, res) => {
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

  if (!req?.body?.image) {
    return res.status(400).json({ message: "Cover image is required!" });
  }

  try {
    const result = await DealModel.create({
      locationName: req.body.locationName,
      location: req.body.location,
      description: req.body.description,
      price: req.body.price,
      image: req.body.image,
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

  const deal = await DealModel.findOne({ _id: req.body.id }).exec();

  if (!deal) {
    return res
      .status(204)
      .json({ message: `No deal matches ID ${req.body.id}.` });
  }

  if (req.body?.locationName) deal.locationName = req.body.locationName;
  if (req.body?.location) deal.location = req.body.location;
  if (req.body?.description) deal.description = req.body.description;
  if (req.body?.price) deal.price = req.body.price;
  if (req.body?.image) deal.image = req.body.image;

  const result = await deal.save();
  res.json(result);
};

const deleteDeal = async (req, res) => {
  if (!req?.body?.id)
    return res.status(400).json({ message: "ID is required." });

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
