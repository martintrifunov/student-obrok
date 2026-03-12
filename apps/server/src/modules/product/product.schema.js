import { z } from "zod";
import { zodObjectId } from "../../shared/utils/zodObjectId.js";
import { paginationSchema } from "../../shared/utils/paginationSchema.js";

export const productQuerySchema = paginationSchema.extend({
  title: z.string().optional(),
  vendorId: zodObjectId.optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
});

export const createProductSchema = z.object({
  title: z
    .string({
      required_error: "Product title is required.",
      invalid_type_error: "Product title is required.",
    })
    .min(1, "Product title cannot be empty."),
  description: z
    .string({
      required_error: "Description is required.",
      invalid_type_error: "Description is required.",
    })
    .min(1, "Description cannot be empty."),
  price: z
    .number({
      required_error: "Price is required.",
      invalid_type_error: "Price must be a valid number.",
    })
    .positive("Price must be greater than 0."),
  vendor: zodObjectId,
  image: zodObjectId.optional(),
});

export const updateProductSchema = z.object({
  id: zodObjectId,
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  image: zodObjectId.optional(),
  vendor: z
    .never({ errorMap: () => ({ message: "Vendor can't be changed." }) })
    .optional(),
});

export const deleteProductSchema = z.object({
  id: zodObjectId,
});

export const productParamsSchema = z.object({
  id: zodObjectId,
});
