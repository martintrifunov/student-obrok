import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPrivate } from "@/api/fetch";

export const holidayKeys = {
  all: ["public-holidays"],
  list: (filters) => [...holidayKeys.all, "list", filters],
  detail: (id) => [...holidayKeys.all, "detail", id],
};

export function useHolidays({ searchTerm, page = 1, limit = 5 } = {}) {
  return useQuery({
    queryKey: [...holidayKeys.all, "list", searchTerm, page, limit],
    queryFn: () => {
      const params = new URLSearchParams();
      if (page) params.append("page", page);
      if (limit !== undefined) params.append("limit", limit);
      if (searchTerm) params.append("name", searchTerm);
      return fetchPrivate(`/public-holidays?${params}`);
    },
  });
}

export function useHoliday(id) {
  return useQuery({
    queryKey: holidayKeys.detail(id),
    queryFn: () => fetchPrivate(`/public-holidays/${id}`),
    enabled: !!id,
  });
}

export function useDeleteHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      fetchPrivate("/public-holidays", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: holidayKeys.all });
    },
  });
}

export function useSaveHoliday(isEditMode, holidayId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (holidayData) =>
      fetchPrivate("/public-holidays", {
        method: isEditMode ? "PUT" : "POST",
        body: JSON.stringify(holidayData),
      }),
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
