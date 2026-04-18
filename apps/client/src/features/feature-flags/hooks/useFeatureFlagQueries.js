import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPrivate } from "@/api/fetch";
import { useFeatureFlagStore } from "@/store/featureFlagStore";

export const flagKeys = {
  all: ["featureFlags"],
  list: () => [...flagKeys.all, "list"],
};

export function useFeatureFlags() {
  return useQuery({
    queryKey: flagKeys.list(),
    queryFn: () => fetchPrivate("/flags/admin"),
  });
}

export function useToggleFeatureFlag() {
  const queryClient = useQueryClient();
  const refetchFlags = useFeatureFlagStore((s) => s.refetchFlags);

  return useMutation({
    mutationFn: ({ key, enabled }) =>
      fetchPrivate("/flags", {
        method: "PUT",
        body: JSON.stringify({ key, enabled }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: flagKeys.all });
      refetchFlags();
    },
  });
}
