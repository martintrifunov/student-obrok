import { VendorModel } from "../models/Vendors.js";
import mongoose from "mongoose";

const getAllVendors = async (req, res) => {
  const vendors = await VendorModel.find().populate("deals");

  if (!vendors) return res.status(204).json({ message: "No vendors found." });

  res.json(vendors);
};

const createNewVendor = async (req, res) => {
  if (!req?.body?.name) {
    return res.status(400).json({ message: "Name is required!" });
  }

  if (
    !req?.body?.location ||
    req?.body?.location[0] === "" ||
    req?.body?.location[1] === ""
  ) {
    return res
      .status(400)
      .json({ message: "Location coordinates are required!" });
  }

  if (!req?.body?.image || !req?.body?.imageTitle) {
    return res.status(400).json({ message: "Cover image is required!" });
  }

  if (req?.body?.deals) {
    req.body.deals.forEach((deal) => {
      if (!mongoose.Types.ObjectId.isValid(deal.id)) {
        return res.status(400).json({ message: "Invalid Deal ID format." });
      }
    });
  }

  try {
    const result = await VendorModel.create({
      name: req.body.name,
      location: req.body.location,
      image: req.body.image,
      imageTitle: req.body.imageTitle,
      deals: req.body.deals,
    });

    res.status(201).json(result);
  } catch (err) {
    console.error(err);
  }
};

const updateVendor = async (req, res) => {
  if (!req?.body?.id) {
    return res.status(400).json({ message: "ID is required." });
  }

  if (!mongoose.Types.ObjectId.isValid(req.body.id)) {
    return res.status(400).json({ message: "Invalid ID format." });
  }

  const vendor = await VendorModel.findOne({ _id: req.body.id }).exec();

  if (!vendor) {
    return res
      .status(204)
      .json({ message: `No vendor matches ID ${req.body.id}.` });
  }

  if (req.body?.name) vendor.name = req.body.name;
  if (req.body?.location) vendor.location = req.body.location;
  if (req.body?.image) vendor.image = req.body.image;
  if (req.body?.imageTitle) vendor.imageTitle = req.body.imageTitle;
  if (req.body?.deals) {
    req.body.deals.forEach((deal) => {
      if (!mongoose.Types.ObjectId.isValid(deal.id)) {
        return res.status(400).json({ message: "Invalid Deal ID format." });
      }
    });

    vendor.deals = req.body.deals;
  }

  const result = await vendor.save();
  res.json(result);
};

const deleteVendor = async (req, res) => {
  if (!req?.body?.id)
    return res.status(400).json({ message: "ID is required." });

  if (!mongoose.Types.ObjectId.isValid(req.body.id)) {
    return res.status(400).json({ message: "Invalid ID format." });
  }

  const vendor = await VendorModel.findOne({ _id: req.body.id }).exec();

  if (!vendor) {
    return res
      .status(204)
      .json({ message: `No vendor matches ID ${req.body.id}.` });
  }
  const result = await vendor.deleteOne();
  res.json(result);
};

const getVendor = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "ID parameter is required." });

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID format." });
  }

  const vendor = await VendorModel.findOne({ _id: req.params.id })
    .populate("deals")
    .exec();

  if (!vendor) {
    return res
      .status(204)
      .json({ message: `No vendor matches ID ${req.params.id}.` });
  }

  res.json(vendor);
};

const vendorsController = {
  getAllVendors,
  createNewVendor,
  updateVendor,
  deleteVendor,
  getVendor,
};

export default vendorsController;
