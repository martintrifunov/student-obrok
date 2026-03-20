import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

export const marketKeys = {
  all: ["markets"],
  list: (filters) => [...marketKeys.all, "list", filters],
  detail: (id) => [...marketKeys.all, "detail", id],
};

export function useMarkets({ searchTerm, page = 1, limit = 5 } = {}) {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: [...marketKeys.all, "list", searchTerm, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append("page", page);
      if (limit !== undefined) params.append("limit", limit);
      if (searchTerm) params.append("name", searchTerm);

      const response = await axiosPrivate.get(`/markets?${params}`);
      return response.data;
    },
  });
}

export function useMarket(id) {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: marketKeys.detail(id),
    queryFn: async () => {
      const res = await axiosPrivate.get(`/markets/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useDeleteMarket() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await axiosPrivate.delete("/markets", { data: { id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketKeys.all });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });
}

export function useSaveMarket(isEditMode, marketId) {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (marketData) => {
      if (isEditMode) return axiosPrivate.put("/markets", marketData);
      return axiosPrivate.post("/markets", marketData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketKeys.all });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      if (isEditMode) {
        queryClient.invalidateQueries({
          queryKey: marketKeys.detail(marketId),
        });
      }
    },
  });
}

export function useMarketsDropdown() {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: [...marketKeys.all, "dropdown"],
    queryFn: async () => {
      const res = await axiosPrivate.get("/markets?limit=0");
      return res.data.data;
    },
  });
}

export function useMarketsForMap() {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: [...marketKeys.all, "map"],
    queryFn: async () => {
      const res = await axiosPrivate.get("/markets?limit=0");
      return res.data.data;
    },
  });
}
