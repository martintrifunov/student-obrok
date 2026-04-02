import { z } from "zod";

export const analyticsHeartbeatSchema = z.object({
  path: z.string().trim().max(2048).optional().nullable(),
  isPageView: z.boolean().optional(),
});

export const analyticsSummaryQuerySchema = z.object({
  days: z.coerce.number().int().min(7).max(365).optional(),
});

export const analyticsFeatureTrendQuerySchema = z.object({
  days: z.coerce.number().int().min(7).max(365).optional(),
});

export const analyticsExportQuerySchema = z.object({
  days: z.coerce.number().int().min(7).max(365).optional(),
});
