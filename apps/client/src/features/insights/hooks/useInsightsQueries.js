import { useQuery } from "@tanstack/react-query";
import { fetchPrivate } from "@/api/fetch";

export const insightsKeys = {
  all: ["insights"],
  summary: (days) => [...insightsKeys.all, "summary", days],
  featureTrends: (days) => [...insightsKeys.all, "feature-trends", days],
};

export function useInsightsSummary(days = 30) {
  return useQuery({
    queryKey: insightsKeys.summary(days),
    queryFn: () => fetchPrivate(`/analytics/summary?days=${days}`),
    enabled: !!days,
  });
}

export function useInsightsFeatureTrends(days = 30) {
  return useQuery({
    queryKey: insightsKeys.featureTrends(days),
    queryFn: () => fetchPrivate(`/analytics/feature-trends?days=${days}`),
    enabled: !!days,
  });
}

export async function downloadInsightsCsv(days = 30) {
  const res = await fetchPrivate(`/analytics/export?days=${days}`, { raw: true });
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `insights-${days}d.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
