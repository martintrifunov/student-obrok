import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

export const chainKeys = {
  all: ["chains"],
  list: (filters) => [...chainKeys.all, "list", filters],
  detail: (id) => [...chainKeys.all, "detail", id],
};

export function useChains({ searchTerm, page = 1, limit = 5 } = {}) {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: [...chainKeys.all, "list", searchTerm, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append("page", page);
      if (limit !== undefined) params.append("limit", limit);
      if (searchTerm) params.append("name", searchTerm);

      const response = await axiosPrivate.get(`/chains?${params}`);
      return response.data;
    },
  });
}

export function useChain(id) {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: chainKeys.detail(id),
    queryFn: async () => {
      const res = await axiosPrivate.get(`/chains/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useDeleteChain() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await axiosPrivate.delete("/chains", { data: { id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chainKeys.all });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useSaveChain(isEditMode, chainId) {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chainData) => {
      if (isEditMode) return axiosPrivate.put("/chains", chainData);
      return axiosPrivate.post("/chains", chainData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chainKeys.all });
      if (isEditMode) {
        queryClient.invalidateQueries({
          queryKey: chainKeys.detail(chainId),
        });
      }
    },
  });
}

export function useChainsDropdown() {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: [...chainKeys.all, "dropdown"],
    queryFn: async () => {
      const res = await axiosPrivate.get("/chains?limit=0");
      return res.data.data;
    },
  });
}
