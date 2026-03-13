import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

export const imageKeys = {
  all: ["images"],
};

export function useImages() {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: imageKeys.all,
    queryFn: async () => {
      const res = await axiosPrivate.get("/images?limit=0");
      return res.data.data;
    },
    enabled: false,
  });
}

export function useUploadImage() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await axiosPrivate.post("/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imageKeys.all });
    },
  });
}
