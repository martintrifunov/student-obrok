import mongoose from "mongoose";

const PublicHolidaySchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true, unique: true },
});

export const PublicHolidayModel = mongoose.model("PublicHoliday", PublicHolidaySchema, "public_holidays");
