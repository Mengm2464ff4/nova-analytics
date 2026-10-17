import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TimeRange = "24h" | "7d" | "30d" | "90d";

interface DashboardState {
  // Time range for analytics
  range: TimeRange;
  setRange: (range: TimeRange) => void;

  // Desktop sidebar collapse
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Mobile menu
  mobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      // Time range
      range: "24h",
      setRange: (range) => set({ range }),

      // Desktop sidebar
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      // Mobile menu
      mobileMenuOpen: false,
      toggleMobileMenu: () =>
        set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
      closeMobileMenu: () => set({ mobileMenuOpen: false }),
    }),
    {
      name: "dashboard-ui",
      partialize: (state) => ({
        range: state.range,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);