import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      auth: {},
      persist: false,
      setAuth: (auth) => set({ auth }),
      setPersist: (val) => set({ persist: val }),
      logout: () => set({ auth: {}, persist: false }),
    }),
    {
      name: "maco-auth",
      partialize: (state) => ({ persist: state.persist }),
    },
  ),
);
