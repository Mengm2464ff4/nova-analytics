"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthUIState {
  /** Has the user dismissed the "verify your email" banner? */
  emailBannerDismissed: boolean;
  /** Last provider used — lets us pre-select on the login page. */
  lastProvider: "credentials" | "google" | null;
  /** Redirect target captured when middleware bounced a user to /login. */
  postLoginRedirect: string | null;

  dismissEmailBanner: () => void;
  resetEmailBanner: () => void;
  setLastProvider: (p: AuthUIState["lastProvider"]) => void;
  setPostLoginRedirect: (url: string | null) => void;
}

export const useAuthStore = create<AuthUIState>()(
  persist(
    (set) => ({
      emailBannerDismissed: false,
      lastProvider: null,
      postLoginRedirect: null,

      dismissEmailBanner: () => set({ emailBannerDismissed: true }),
      resetEmailBanner: () => set({ emailBannerDismissed: false }),
      setLastProvider: (lastProvider) => set({ lastProvider }),
      setPostLoginRedirect: (postLoginRedirect) => set({ postLoginRedirect }),
    }),
    {
      name: "nova-auth-ui",
      storage: createJSONStorage(() => localStorage),
    }
  )
);