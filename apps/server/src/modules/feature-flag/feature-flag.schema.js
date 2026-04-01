import { z } from "zod";

export const updateFeatureFlagSchema = z.object({
  key: z.string().min(1, "Key is required."),
  enabled: z.boolean({ required_error: "Enabled is required." }),
  description: z.string().optional(),
});
