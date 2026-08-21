import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import type { Session } from "@supabase/supabase-js";
import { authStore, type AppRole, type User } from "@/lib/auth-store";

export type AuthState = {
  session: { user: User } | null;
  user: User | null;
  role: AppRole | null;
  loading: boolean;
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

  useEffect(() => {
    // Initiate session restoration as early as possible in React lifecycle
    authStore.getRestorePromise();
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      session: storeState.user ? { user: storeState.user } : null,
      user: storeState.user,
      role: storeState.user?.role ?? null,
      loading: storeState.loading,
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
