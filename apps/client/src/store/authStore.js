import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      auth: {},
      persist: false,
      setAuth: (valOrUpdater) =>
        set((state) => ({
          auth:
            typeof valOrUpdater === "function"
              ? valOrUpdater(state.auth)
              : valOrUpdater,
        })),
      setPersist: (valOrUpdater) =>
        set((state) => ({
          persist:
            typeof valOrUpdater === "function"
              ? valOrUpdater(state.persist)
              : valOrUpdater,
        })),
      logout: () => set({ auth: {}, persist: false }),
    }),
    {
      name: "maco-auth",
      partialize: (state) => ({ persist: state.persist }),
    },
  ),
);
