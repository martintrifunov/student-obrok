import { z } from "zod";

export const zodObjectId = z
  .string({
    required_error: "This field is required.",
    invalid_type_error: "This field is required.",
  })
  .refine((val) => /^[a-f\d]{24}$/i.test(val), {
    message: "Invalid ID format.",
  });
