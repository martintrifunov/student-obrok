import { DealModel } from "../models/Deals.js";
import mongoose from "mongoose";
import { VendorModel } from "../models/Vendors.js";

const getAllDeals = async (req, res) => {
  try {
    const deals = await DealModel.find().populate("vendor");

    if (!deals) return res.status(404).json({ message: "No deals found." });

    res.status(200).json(deals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const createNewDeal = async (req, res) => {
  if (!req?.body?.title) {
    return res.status(400).json({ message: "Title is required!" });
  }

  if (!req?.body?.description) {
    return res.status(400).json({ message: "Description is required!" });
  }

  if (!req?.body?.price) {
    return res.status(400).json({ message: "Price is required!" });
  }

  if (!req?.body?.vendor) {
    return res.status(400).json({ message: "Vendor is required!" });
  }

  if (!mongoose.Types.ObjectId.isValid(req.body.vendor)) {
    return res.status(400).json({ message: "Invalid Vendor ID format." });
  }

  const vendor = await VendorModel.findOne({ _id: req.body.vendor }).exec();

  if (!vendor) return res.status(404).json({ message: "No vendor found." });

  try {
    const result = await DealModel.create({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      image: req?.body?.image ? req?.body?.image : null,
      imageTitle: req?.body?.imageTitle ? req?.body?.imageTitle : null,
      vendor: req.body.vendor,
    });

    // Initialize the deals array if it's null
    if (!vendor.deals) {
      vendor.deals = [];
    }

    // Push the new deal ID to the deals array of the vendor
    vendor.deals.push(result._id);

    // Save the updated vendor document
    await vendor.save();

    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const updateDeal = async (req, res) => {
  if (!req?.body?.id) {
    return res.status(400).json({ message: "ID is required." });
  }

  if (!mongoose.Types.ObjectId.isValid(req.body.id)) {
    return res.status(400).json({ message: "Invalid ID format." });
  }

  try {
    const deal = await DealModel.findOne({ _id: req.body.id }).exec();

    if (!deal) {
      return res
        .status(404)
        .json({ message: `No deal matches ID ${req.body.id}.` });
    }

    if (req.body?.title) deal.title = req.body.title;
    if (req.body?.description) deal.description = req.body.description;
    if (req.body?.price) deal.price = req.body.price;
    if (req.body?.image) deal.image = req.body.image;
    if (req.body?.imageTitle) deal.imageTitle = req.body.imageTitle;
    if (req.body?.vendor) {
      return res.status(400).json({ message: "Vendor can't be changed." });
    }

    const result = await deal.save();
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const deleteDeal = async (req, res) => {
  if (!req?.body?.id)
    return res.status(400).json({ message: "ID is required." });

  if (!mongoose.Types.ObjectId.isValid(req.body.id)) {
    return res.status(400).json({ message: "Invalid ID format." });
  }

  try {
    const deal = await DealModel.findOne({ _id: req.body.id }).exec();

    if (!deal) {
      return res
        .status(404)
        .json({ message: `No deal matches ID ${req.body.id}.` });
    }

    const vendorToUpdate = await VendorModel.findOne({
      _id: deal.vendor,
    }).exec();

    if (!vendorToUpdate) {
      return res.status(404).json({ message: "Vendor not found." });
    }

    // Remove the deal ID from the deals array of the vendor
    vendorToUpdate.deals = vendorToUpdate.deals.filter(
      (dealId) => dealId.toString() !== req.body.id
    );

    if (vendorToUpdate.deals.length === 0) {
      vendorToUpdate.deals = null;
    }

    // Save the updated vendor document
    await vendorToUpdate.save();

    const result = await deal.deleteOne();
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getDeal = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "ID parameter is required." });

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID format." });
  }

  try {
    const deal = await DealModel.findOne({ _id: req.params.id })
      .populate("vendor")
      .exec();

    if (!deal) {
      return res
        .status(404)
        .json({ message: `No deal matches ID ${req.params.id}.` });
    }

    res.status(200).json(deal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const dealsController = {
  getAllDeals,
  createNewDeal,
  updateDeal,
  deleteDeal,
  getDeal,
};

export default dealsController;
