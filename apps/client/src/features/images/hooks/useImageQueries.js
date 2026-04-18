import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPrivate } from "@/api/fetch";

export const imageKeys = {
  all: ["images"],
};

export function useImages() {
  return useQuery({
    queryKey: imageKeys.all,
    queryFn: async () => {
      const data = await fetchPrivate("/images?limit=0");
      return data.data;
    },
    enabled: false,
  });
}

export function useUploadImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append("image", file);
      return fetchPrivate("/images", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imageKeys.all });
    },
  });
}
