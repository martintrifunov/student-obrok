import { z } from "zod";
import { zodObjectId } from "../../shared/schemas/zodObjectId.js";
import { paginationSchema } from "../../shared/schemas/paginationSchema.js";

export const publicHolidayQuerySchema = paginationSchema.extend({
  name: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const createPublicHolidaySchema = z.object({
  name: z
    .string({ required_error: "Holiday name is required." })
    .min(1, "Holiday name cannot be empty."),
  date: z.coerce.date({ required_error: "Holiday date is required." }),
});

export const updatePublicHolidaySchema = z.object({
  id: zodObjectId,
  name: z.string().min(1).optional(),
  date: z.coerce.date().optional(),
});

export const deletePublicHolidaySchema = z.object({
  id: zodObjectId,
});
