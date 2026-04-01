import { z } from "zod";
import { zodObjectId } from "../../shared/schemas/zodObjectId.js";
import { paginationSchema } from "../../shared/schemas/paginationSchema.js";

export const searchQuerySchema = paginationSchema.extend({
  q: z.string().min(1, "Search query is required."),
  marketId: zodObjectId.optional(),
});
