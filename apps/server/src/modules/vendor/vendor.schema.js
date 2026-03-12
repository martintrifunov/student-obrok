import { z } from "zod";
import { zodObjectId } from "../../shared/schemas/zodObjectId.js";
import { paginationSchema } from "../../shared/schemas/paginationSchema.js";

export const vendorQuerySchema = paginationSchema.extend({
  name: z.string().optional(),
});

export const createVendorSchema = z.object({
  name: z
    .string({
      required_error: "Vendor name is required.",
      invalid_type_error: "Vendor name is required.",
    })
    .min(1, "Vendor name cannot be empty."),
  location: z
    .array(
      z.number({
        required_error: "Coordinate is required.",
        invalid_type_error: "Coordinate must be a number.",
      }),
      {
        required_error: "Location coordinates are required.",
        invalid_type_error: "Location coordinates are required.",
      },
    )
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
