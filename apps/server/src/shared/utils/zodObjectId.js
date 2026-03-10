import { z } from "zod";

export const zodObjectId = z
  .string({ required_error: "ID is required." })
  .refine((val) => /^[a-f\d]{24}$/i.test(val), {
    message: "Invalid ID format.",
  });
