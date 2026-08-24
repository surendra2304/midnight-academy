import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import type { Session } from "@supabase/supabase-js";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { authStore, type AppRole, type PendingOAuth, type User } from "@/lib/auth-store";

export type AuthState = {
  session: { user: User } | null;
  user: User | null;
  role: AppRole | null;
  loading: boolean;
  /** First-time Google identity that still needs to finish registration. */
  pendingOAuth: PendingOAuth | null;
  clearPendingOAuth: () => void;
  signOut: () => Promise<void>;
  login: (credentials: {
    email: string;
    password: string;
  }) => Promise<{ user: User; session: Session | null }>;
  register: (params: {
    email: string;
    password: string;
    fullName?: string;
  }) => Promise<{ user: User; session: Session | null }>;
  signInWithGoogle: () => Promise<{ provider: string; url: string | null }>;
};

const AuthContext = createContext<AuthState>({
  session: null,
  user: null,
  role: null,
  loading: true,
  pendingOAuth: null,
  clearPendingOAuth: () => {},
  signOut: async () => {},
  login: async () => ({
    user: { id: "", email: "", fullName: null, role: "STUDENT" },
    session: null,
  }),
  register: async () => ({
    user: { id: "", email: "", fullName: null, role: "STUDENT" },
    session: null,
  }),
  signInWithGoogle: async () => ({ provider: "google", url: null }),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const storeState = useSyncExternalStore(
    authStore.subscribe,
    authStore.getSnapshot,
    authStore.getServerSnapshot,
  );
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    // Initiate session restoration as early as possible in React lifecycle
    authStore.getRestorePromise();
  }, []);

  // When a brand-new Google identity signs in, steer them straight to the
  // signup continuation details regardless of where Supabase landed the browser
  useEffect(() => {
    if (!storeState.pendingOAuth) return;
    // Don't fight auth.callback while it's still running its own check
    if (pathname === "/auth/callback") return;
    navigate({
      to: "/auth",
      search: {
        flow: "google-new",
        email: storeState.pendingOAuth.email ?? undefined,
        name: storeState.pendingOAuth.fullName ?? undefined,
      },
    });
  }, [storeState.pendingOAuth, pathname, navigate]);

  const value = useMemo<AuthState>(
    () => ({
      session: storeState.user ? { user: storeState.user } : null,
      user: storeState.user,
      role: storeState.user?.role ?? null,
      loading: storeState.loading,
      pendingOAuth: storeState.pendingOAuth,
      clearPendingOAuth: authStore.clearPendingOAuth,
      signOut: authStore.signOut,
      login: authStore.login,
      register: authStore.register,
      signInWithGoogle: authStore.signInWithGoogle,
    }),
    [storeState],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
