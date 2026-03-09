import { z } from "zod";
import { zodObjectId } from "../../shared/utils/zodObjectId.js";

export const createVendorSchema = z.object({
  name: z
    .string({ required_error: "Name is required." })
    .min(1, "Name is required."),
  location: z
    .array(z.number())
    .length(2, "Location must contain exactly 2 coordinates."),
  image: zodObjectId,
  products: z
    .undefined({
      errorMap: () => ({
        message: "Can't attach products when creating a vendor.",
      }),
    })
    .optional(),
});

export const updateVendorSchema = z.object({
  id: zodObjectId,
  name: z.string().min(1).optional(),
  location: z.array(z.number()).length(2).optional(),
  image: zodObjectId.optional(),
});

export const deleteVendorSchema = z.object({
  id: zodObjectId,
});

export const vendorParamsSchema = z.object({
  id: zodObjectId,
});
