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
