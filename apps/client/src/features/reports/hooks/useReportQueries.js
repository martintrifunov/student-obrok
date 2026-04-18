import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchPrivate } from "@/api/fetch";

export const reportKeys = {
  all: ["reports"],
  job: (jobId) => [...reportKeys.all, "job", jobId],
};

export function useCreateReport() {
  return useMutation({
    mutationFn: (filters) =>
      fetchPrivate("/reports", {
        method: "POST",
        body: JSON.stringify(filters),
      }),
  });
}

export function useReportStatus(jobId) {
  return useQuery({
    queryKey: reportKeys.job(jobId),
    queryFn: () => fetchPrivate(`/reports/${jobId}`),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "PENDING" || status === "PROCESSING") return 2000;
      return false;
    },
  });
}

export function useCancelReport() {
  return useMutation({
    mutationFn: (jobId) =>
      fetchPrivate(`/reports/${jobId}/cancel`, { method: "POST" }),
  });
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: async (jobId) => {
      const res = await fetchPrivate(`/reports/${jobId}/download`, { raw: true });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}
