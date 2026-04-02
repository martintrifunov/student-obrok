import { useQuery, useMutation } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

export const reportKeys = {
  all: ["reports"],
  job: (jobId) => [...reportKeys.all, "job", jobId],
};

export function useCreateReport() {
  const axiosPrivate = useAxiosPrivate();
  return useMutation({
    mutationFn: async (filters) => {
      const res = await axiosPrivate.post("/reports", filters);
      return res.data;
    },
  });
}

export function useReportStatus(jobId) {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: reportKeys.job(jobId),
    queryFn: async () => {
      const res = await axiosPrivate.get(`/reports/${jobId}`);
      return res.data;
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "PENDING" || status === "PROCESSING") return 2000;
      return false;
    },
  });
}

export function useCancelReport() {
  const axiosPrivate = useAxiosPrivate();
  return useMutation({
    mutationFn: async (jobId) => {
      const res = await axiosPrivate.post(`/reports/${jobId}/cancel`);
      return res.data;
    },
  });
}

export function useDownloadReport() {
  const axiosPrivate = useAxiosPrivate();

  return useMutation({
    mutationFn: async (jobId) => {
      const res = await axiosPrivate.get(`/reports/${jobId}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
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
