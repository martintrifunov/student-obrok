import { z } from "zod";
import { zodObjectId } from "../../shared/utils/zodObjectId.js";

export const deleteImageSchema = z.object({
  id: zodObjectId,
});

export const imageParamsSchema = z.object({
  id: zodObjectId,
});
