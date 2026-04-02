import { z } from "zod";
import { zodObjectId } from "../../shared/schemas/zodObjectId.js";

export const createReportSchema = z
  .object({
    chainId: zodObjectId.optional(),
    marketId: zodObjectId.optional(),
    from: z.coerce.date({ required_error: "From date is required.", invalid_type_error: "From date is invalid." }),
    to: z.coerce.date({ required_error: "To date is required.", invalid_type_error: "To date is invalid." }),
  })
  .refine((data) => data.from <= data.to, {
    message: "From date must be before or equal to To date.",
    path: ["from"],
  });

export const reportJobIdSchema = z.object({
  jobId: zodObjectId,
});
