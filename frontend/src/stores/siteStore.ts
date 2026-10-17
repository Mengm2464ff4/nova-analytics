"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type SiteSort = "name" | "createdAt" | "visitors";

interface SiteState {
  /** Currently selected site ID (used by dashboard widgets that don't live under /sites/[id]). */
  selectedSiteId: string | null;
  /** Sort order for the sites list. */
  sort: SiteSort;
  /** "desc" | "asc" */
  sortDir: "asc" | "desc";
  /** Search input in the sites list. */
  search: string;

  setSelectedSite: (id: string | null) => void;
  setSort: (sort: SiteSort) => void;
  setSortDir: (dir: "asc" | "desc") => void;
  setSearch: (q: string) => void;
  resetSiteUI: () => void;
}

export const useSiteStore = create<SiteState>()(
  persist(
    (set) => ({
      selectedSiteId: null,
      sort: "createdAt",
      sortDir: "desc",
      search: "",

      setSelectedSite: (selectedSiteId) => set({ selectedSiteId }),
      setSort: (sort) => set({ sort }),
      setSortDir: (sortDir) => set({ sortDir }),
      setSearch: (search) => set({ search }),
      resetSiteUI: () =>
        set({ selectedSiteId: null, sort: "createdAt", sortDir: "desc", search: "" }),
    }),
    {
      name: "nova-site-ui",
      storage: createJSONStorage(() => localStorage),
      // Don't persist `search` — it should reset on reload.
      partialize: (state) => ({
        selectedSiteId: state.selectedSiteId,
        sort: state.sort,
        sortDir: state.sortDir,
      }),
    }
  )
);