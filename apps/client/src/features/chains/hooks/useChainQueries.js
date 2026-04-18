import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPrivate } from "@/api/fetch";

export const chainKeys = {
  all: ["chains"],
  list: (filters) => [...chainKeys.all, "list", filters],
  detail: (id) => [...chainKeys.all, "detail", id],
};

export function useChains({ searchTerm, page = 1, limit = 5 } = {}) {
  return useQuery({
    queryKey: [...chainKeys.all, "list", searchTerm, page, limit],
    queryFn: () => {
      const params = new URLSearchParams();
      if (page) params.append("page", page);
      if (limit !== undefined) params.append("limit", limit);
      if (searchTerm) params.append("name", searchTerm);
      return fetchPrivate(`/chains?${params}`);
    },
  });
}

export function useChain(id) {
  return useQuery({
    queryKey: chainKeys.detail(id),
    queryFn: () => fetchPrivate(`/chains/${id}`),
    enabled: !!id,
  });
}

export function useDeleteChain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      fetchPrivate("/chains", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chainKeys.all });
      queryClient.invalidateQueries({ queryKey: ["markets"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useSaveChain(isEditMode, chainId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chainData) =>
      fetchPrivate("/chains", {
        method: isEditMode ? "PUT" : "POST",
        body: JSON.stringify(chainData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chainKeys.all });
      queryClient.invalidateQueries({ queryKey: ["markets"] });
      if (isEditMode) {
        queryClient.invalidateQueries({
          queryKey: chainKeys.detail(chainId),
        });
      }
    },
  });
}

export function useChainsDropdown() {
  return useQuery({
    queryKey: [...chainKeys.all, "dropdown"],
    queryFn: async () => {
      const data = await fetchPrivate("/chains?limit=0");
      return data.data;
    },
  });
}
