import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPrivate } from "@/api/fetch";

export const marketKeys = {
  all: ["markets"],
  list: (filters) => [...marketKeys.all, "list", filters],
  detail: (id) => [...marketKeys.all, "detail", id],
};

export function useMarkets({ searchTerm, page = 1, limit = 5 } = {}) {
  return useQuery({
    queryKey: [...marketKeys.all, "list", searchTerm, page, limit],
    queryFn: () => {
      const params = new URLSearchParams();
      if (page) params.append("page", page);
      if (limit !== undefined) params.append("limit", limit);
      if (searchTerm) params.append("name", searchTerm);
      return fetchPrivate(`/markets?${params}`);
    },
  });
}

export function useMarket(id) {
  return useQuery({
    queryKey: marketKeys.detail(id),
    queryFn: () => fetchPrivate(`/markets/${id}`),
    enabled: !!id,
  });
}

export function useDeleteMarket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      fetchPrivate("/markets", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketKeys.all });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["chains"] });
    },
  });
}

export function useSaveMarket(isEditMode, marketId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (marketData) =>
      fetchPrivate("/markets", {
        method: isEditMode ? "PUT" : "POST",
        body: JSON.stringify(marketData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketKeys.all });
      queryClient.invalidateQueries({ queryKey: ["chains"] });
      if (isEditMode) {
        queryClient.invalidateQueries({
          queryKey: marketKeys.detail(marketId),
        });
      }
    },
  });
}

export function useMarketsDropdown() {
  return useQuery({
    queryKey: [...marketKeys.all, "dropdown"],
    queryFn: async () => {
      const data = await fetchPrivate("/markets?limit=0");
      return data.data;
    },
  });
}

export function useMarketsForMap() {
  return useQuery({
    queryKey: [...marketKeys.all, "map"],
    queryFn: async () => {
      const data = await fetchPrivate("/markets?limit=0");
      return data.data;
    },
  });
}
