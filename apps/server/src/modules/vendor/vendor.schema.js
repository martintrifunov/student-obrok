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
  image: zodObjectId,
});

export const updateVendorSchema = z.object({
  id: zodObjectId,
  name: z.string().min(1).optional(),
  image: zodObjectId.optional(),
});

export const deleteVendorSchema = z.object({
  id: zodObjectId,
});

export const vendorParamsSchema = z.object({
  id: zodObjectId,
});
