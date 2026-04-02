import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

export const holidayKeys = {
  all: ["public-holidays"],
  list: (filters) => [...holidayKeys.all, "list", filters],
  detail: (id) => [...holidayKeys.all, "detail", id],
};

export function useHolidays({ searchTerm, page = 1, limit = 5 } = {}) {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: [...holidayKeys.all, "list", searchTerm, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append("page", page);
      if (limit !== undefined) params.append("limit", limit);
      if (searchTerm) params.append("name", searchTerm);

      const response = await axiosPrivate.get(`/public-holidays?${params}`);
      return response.data;
    },
  });
}

export function useHoliday(id) {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: holidayKeys.detail(id),
    queryFn: async () => {
      const res = await axiosPrivate.get(`/public-holidays/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useDeleteHoliday() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await axiosPrivate.delete("/public-holidays", { data: { id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: holidayKeys.all });
    },
  });
}

export function useSaveHoliday(isEditMode, holidayId) {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (holidayData) => {
      if (isEditMode)
        return axiosPrivate.put("/public-holidays", holidayData);
      return axiosPrivate.post("/public-holidays", holidayData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: holidayKeys.all });
      if (isEditMode) {
        queryClient.invalidateQueries({
          queryKey: holidayKeys.detail(holidayId),
        });
      }
    },
  });
}
