import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1, "Page must be at least 1.").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(0, "Limit must be 0 or greater.")
    .default(10),
});
