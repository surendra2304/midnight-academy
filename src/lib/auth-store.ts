import { apiClient, setAccessToken } from "./api-client";

export type AppRole = "ADMIN" | "STUDENT";

export type User = {
  id: string;
  email: string;
  fullName: string | null;
  role: AppRole;
};

type AuthState = {
  user: User | null;
  loading: boolean;
};

// SSR-safe initial state: on the server there is never a session
const SERVER_SNAPSHOT: AuthState = { user: null, loading: false };

let state: AuthState = { user: null, loading: true };
let listeners: (() => void)[] = [];
let restorePromise: Promise<void> | null = null;

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

function updateState(newState: Partial<AuthState>) {
  state = { ...state, ...newState };
  notify();
}

function safeLocalStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

async function doRestoreSession(): Promise<void> {
  const ls = safeLocalStorage();
  const refreshToken = ls?.getItem("refreshToken");
  if (!refreshToken) {
    updateState({ user: null, loading: false });
    return;
  }

  try {
    const response = await fetch(`${import.meta.env['VITE_API_URL'] || "http://localhost:3000"}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      setAccessToken(data.accessToken);
      ls?.setItem("refreshToken", data.refreshToken);

      const user = await apiClient("/auth/me");
      updateState({ user, loading: false });
    } else {
      ls?.removeItem("refreshToken");
      updateState({ user: null, loading: false });
    }
  } catch (error) {
    ls?.removeItem("refreshToken");
    updateState({ user: null, loading: false });
  }
}

export const authStore = {
  subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  // Client snapshot — returns live mutable state
  getSnapshot() {
    return state;
  },

  // Server snapshot — SSR always renders as unauthenticated/not-loading
  // (session restore runs client-side only via getRestorePromise)
  getServerSnapshot() {
    return SERVER_SNAPSHOT;
  },

  getUser() {
    return state.user;
  },

  getRole() {
    return state.user?.role ?? null;
  },

  getRestorePromise() {
    // Only run on the client — server has no localStorage
    if (typeof window === "undefined") return Promise.resolve();
    if (!restorePromise) {
      restorePromise = doRestoreSession();
    }
    return restorePromise;
  },

  async login(data: any) {
    const res = await apiClient("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setAccessToken(res.accessToken);
    safeLocalStorage()?.setItem("refreshToken", res.refreshToken);
    updateState({ user: res.user });
    return res;
  },

  async register(data: any) {
    const res = await apiClient("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setAccessToken(res.accessToken);
    safeLocalStorage()?.setItem("refreshToken", res.refreshToken);
    updateState({ user: res.user });
    return res;
  },

  async signOut() {
    const ls = safeLocalStorage();
    const refreshToken = ls?.getItem("refreshToken");
    if (refreshToken) {
      try {
        await apiClient("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        // Ignore failure on logout
      }
    }
    setAccessToken(null);
    ls?.removeItem("refreshToken");
    updateState({ user: null });
  },
};
