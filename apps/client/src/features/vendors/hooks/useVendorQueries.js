import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

export const vendorKeys = {
  all: ["vendors"],
  list: (filters) => [...vendorKeys.all, "list", filters],
  detail: (id) => [...vendorKeys.all, "detail", id],
};

export function useVendors({ searchTerm, page = 1, limit = 5 } = {}) {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: [...vendorKeys.all, "list", searchTerm, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append("page", page);
      if (limit !== undefined) params.append("limit", limit);
      if (searchTerm) params.append("name", searchTerm);

      const response = await axiosPrivate.get(`/vendors?${params}`);
      return response.data;
    },
  });
}

export function useVendor(id) {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: vendorKeys.detail(id),
    queryFn: async () => {
      const res = await axiosPrivate.get(`/vendors/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useDeleteVendor() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await axiosPrivate.delete("/vendors", { data: { id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useSaveVendor(isEditMode, vendorId) {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendorData) => {
      if (isEditMode) return axiosPrivate.put("/vendors", vendorData);
      return axiosPrivate.post("/vendors", vendorData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      if (isEditMode) {
        queryClient.invalidateQueries({
          queryKey: vendorKeys.detail(vendorId),
        });
      }
    },
  });
}

export function useVendorsDropdown() {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: [...vendorKeys.all, "dropdown"],
    queryFn: async () => {
      const res = await axiosPrivate.get("/vendors?limit=0");
      return res.data.data;
    },
  });
}
