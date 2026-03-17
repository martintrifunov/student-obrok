import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

export const productKeys = {
  all: ["products"],
  list: (filters) => [...productKeys.all, "list", filters],
  detail: (id) => [...productKeys.all, "detail", id],
};

export function useProduct(id) {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const res = await axiosPrivate.get(`/products/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useSaveProduct(isEditMode, productId) {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData) => {
      if (isEditMode) return axiosPrivate.put("/products", productData);
      return axiosPrivate.post("/products", productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      queryClient.invalidateQueries({ queryKey: ["vendor"] });
      if (isEditMode) {
        queryClient.invalidateQueries({
          queryKey: productKeys.detail(productId),
        });
      }
    },
  });
}

export function useProducts(searchTerm) {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: productKeys.list(searchTerm),
    queryFn: async () => {
      const params = new URLSearchParams({ limit: 0 });
      if (searchTerm) params.append("title", searchTerm);
      const response = await axiosPrivate.get(`/products?${params}`);
      return response.data.data;
    },
  });
}

export function useDeleteProduct() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await axiosPrivate.delete("/products", { data: { id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });
}

export function useVendorProducts(vendorId, params = {}, options = {}) {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: [...productKeys.all, "vendor", vendorId, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append("page", params.page);
      if (params.limit) searchParams.append("limit", params.limit);
      if (params.title) searchParams.append("title", params.title);
      if (params.category) searchParams.append("category", params.category);

      if (vendorId) {
        searchParams.append("vendorId", vendorId);
      }

      const response = await axiosPrivate.get(
        `/products?${searchParams.toString()}`,
      );
      return response.data;
    },
    enabled: !!vendorId && (options.enabled ?? true),
  });
}

export function useCategories(vendorId) {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: [...productKeys.all, "categories", vendorId],
    queryFn: async () => {
      const url = vendorId
        ? `/products/categories?vendorId=${vendorId}`
        : `/products/categories`;
      const response = await axiosPrivate.get(url);
      return response.data;
    },
  });
}
