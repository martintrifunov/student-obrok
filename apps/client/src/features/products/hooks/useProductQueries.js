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
      queryClient.invalidateQueries({ queryKey: ["chains"] });
      queryClient.invalidateQueries({ queryKey: ["markets"] });
      if (isEditMode) {
        queryClient.invalidateQueries({
          queryKey: productKeys.detail(productId),
        });
      }
    },
  });
}

export function useProducts({ searchTerm, page = 1, limit = 5 } = {}) {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: [...productKeys.all, "list", searchTerm, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append("page", page);
      if (limit !== undefined) params.append("limit", limit);
      if (searchTerm) params.append("title", searchTerm);

      const response = await axiosPrivate.get(`/products?${params}`);
      return response.data;
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
      queryClient.invalidateQueries({ queryKey: ["chains"] });
      queryClient.invalidateQueries({ queryKey: ["markets"] });
    },
  });
}

export function useMarketProducts(marketId, params = {}, options = {}) {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: [...productKeys.all, "market", marketId, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append("page", params.page);
      if (params.limit) searchParams.append("limit", params.limit);
      if (params.title) searchParams.append("title", params.title);
      if (params.category) searchParams.append("category", params.category);

      if (marketId) {
        searchParams.append("marketId", marketId);
      }

      const response = await axiosPrivate.get(
        `/products?${searchParams.toString()}`,
      );
      return response.data;
    },
    enabled: !!marketId && (options.enabled ?? true),
  });
}

export function useCategories(marketId) {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: [...productKeys.all, "categories", marketId],
    queryFn: async () => {
      const url = marketId
        ? `/products/categories?marketId=${marketId}`
        : `/products/categories`;
      const response = await axiosPrivate.get(url);
      return response.data;
    },
  });
}

export const searchKeys = {
  all: ["search"],
  query: (params) => [...searchKeys.all, params],
};

export function useAISearch({ q, marketId, page = 1, limit = 10 }, options = {}) {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: searchKeys.query({ q, marketId, page, limit }),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("q", q);
      if (marketId) params.append("marketId", marketId);
      params.append("page", page);
      params.append("limit", limit);
      const response = await axiosPrivate.get(`/search?${params.toString()}`);
      return response.data;
    },
    enabled: !!q && (options.enabled ?? true),
  });
}

export const smartSearchKeys = {
  all: ["smart-search"],
  query: (params) => [...smartSearchKeys.all, params],
};

export function useSmartSearch({ q, lat, lon }, options = {}) {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: smartSearchKeys.query({ q, lat, lon }),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("q", q);
      if (lat != null) params.append("lat", lat);
      if (lon != null) params.append("lon", lon);
      const response = await axiosPrivate.get(`/smart-search?${params.toString()}`);
      return response.data;
    },
    enabled: !!q && (options.enabled ?? true),
  });
}
