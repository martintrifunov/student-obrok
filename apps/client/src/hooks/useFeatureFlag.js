import { useFeatureFlagStore } from "@/store/featureFlagStore";

const useFeatureFlag = (key) => {
  return useFeatureFlagStore((state) => !!state.flags[key]);
};

export default useFeatureFlag;
