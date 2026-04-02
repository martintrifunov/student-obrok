import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

export const insightsKeys = {
  all: ["insights"],
  summary: (days) => [...insightsKeys.all, "summary", days],
  featureTrends: (days) => [...insightsKeys.all, "feature-trends", days],
};

export function useInsightsSummary(days = 30) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery({
    queryKey: insightsKeys.summary(days),
    queryFn: async () => {
      const res = await axiosPrivate.get(`/analytics/summary?days=${days}`);
      return res.data;
    },
    enabled: !!days,
  });
}

export function useInsightsFeatureTrends(days = 30) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery({
    queryKey: insightsKeys.featureTrends(days),
    queryFn: async () => {
      const res = await axiosPrivate.get(`/analytics/feature-trends?days=${days}`);
      return res.data;
    },
    enabled: !!days,
  });
}

export async function downloadInsightsCsv(axiosPrivate, days = 30) {
  const res = await axiosPrivate.get(`/analytics/export?days=${days}`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `insights-${days}d.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
