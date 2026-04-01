import { create } from "zustand";
import { axiosPublic } from "@/api/axios";

export const useFeatureFlagStore = create((set, get) => ({
  flags: {},
  loaded: false,
  fetchFlags: async () => {
    if (get().loaded) return;
    try {
      const res = await axiosPublic.get("/flags");
      set({ flags: res.data, loaded: true });
    } catch {
      set({ loaded: true });
    }
  },
}));
