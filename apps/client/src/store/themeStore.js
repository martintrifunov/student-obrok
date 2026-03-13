import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
  persist(
    (set, get) => ({
      mode: "light",
      toggleColorMode: () =>
        set({ mode: get().mode === "light" ? "dark" : "light" }),
    }),
    {
      name: "themeMode",
    },
  ),
);
