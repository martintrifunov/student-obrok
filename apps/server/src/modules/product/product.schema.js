import { z } from "zod";
import { zodObjectId } from "../../shared/utils/zodObjectId.js";

export const createProductSchema = z.object({
  title: z
    .string({ required_error: "Title is required." })
    .min(1, "Title is required."),
  description: z
    .string({ required_error: "Description is required." })
    .min(1, "Description is required."),
  price: z.number({ required_error: "Price is required." }).positive(),
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
