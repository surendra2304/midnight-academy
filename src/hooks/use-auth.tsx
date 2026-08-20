import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { authStore, type AppRole, type User } from "@/lib/auth-store";

type AuthState = {
  session: { user: User } | null;
  user: User | null;
  role: AppRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
  login: (data: any) => Promise<any>;
  register: (data: any) => Promise<any>;
};

const AuthContext = createContext<AuthState>({
  session: null,
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
  login: async () => {},
  register: async () => {},
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
    }),
    [storeState],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
