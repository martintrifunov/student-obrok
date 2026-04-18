import { create } from "zustand";
import { fetchPublic } from "@/api/fetch";

export const useFeatureFlagStore = create((set, get) => ({
  flags: {},
  loaded: false,
  fetchFlags: async () => {
    if (get().loaded) return;
    try {
      const data = await fetchPublic("/flags");
      set({ flags: data, loaded: true });
    } catch {
      set({ loaded: true });
    }
  },
  refetchFlags: async () => {
    try {
      const data = await fetchPublic("/flags");
      set({ flags: data, loaded: true });
    } catch {
      /* keep existing state */
    }
  },
}));
