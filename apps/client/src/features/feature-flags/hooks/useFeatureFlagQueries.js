import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useFeatureFlagStore } from "@/store/featureFlagStore";

export const flagKeys = {
  all: ["featureFlags"],
  list: () => [...flagKeys.all, "list"],
};

export function useFeatureFlags() {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: flagKeys.list(),
    queryFn: async () => {
      const res = await axiosPrivate.get("/flags/admin");
      return res.data;
    },
  });
}

export function useToggleFeatureFlag() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const refetchFlags = useFeatureFlagStore((s) => s.refetchFlags);

  return useMutation({
    mutationFn: async ({ key, enabled }) => {
      const res = await axiosPrivate.put("/flags", { key, enabled });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: flagKeys.all });
      refetchFlags();
    },
  });
}
