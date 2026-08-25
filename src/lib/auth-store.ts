import { supabase } from "@/integrations/supabase/client";

export type AppRole = "ADMIN" | "STUDENT";

export type User = {
  id: string;
  email: string;
  fullName: string | null;
  role: AppRole;
};

/** A Google identity that just signed in but has not finished registration. */
export type PendingOAuth = {
  email: string | null;
  fullName: string | null;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  pendingOAuth: PendingOAuth | null;
};

// SSR-safe initial state: on the server there is never an active client session
const SERVER_SNAPSHOT: AuthState = { user: null, loading: false, pendingOAuth: null };

const CACHED_USER_KEY = "ma_cached_user";

function loadCachedUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHED_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.id === "string" && (parsed.role === "ADMIN" || parsed.role === "STUDENT")) {
      return parsed as User;
    }
  } catch {
    // Ignore invalid cache
  }
  return null;
}

function saveCachedUser(user: User | null) {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      localStorage.setItem(CACHED_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CACHED_USER_KEY);
    }
  } catch {
    // Ignore storage issues
  }
}

// Initial state: On client, start with cached user (if present) so page refreshes never bounce to /auth
const initialCachedUser = typeof window !== "undefined" ? loadCachedUser() : null;

let state: AuthState = {
  user: initialCachedUser,
  loading: initialCachedUser ? false : true,
  pendingOAuth: null,
};
let listeners: (() => void)[] = [];
let restorePromise: Promise<void> | null = null;
let isInitialized = false;

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

function updateState(newState: Partial<AuthState>) {
  state = { ...state, ...newState };
  if ("user" in newState) {
    saveCachedUser(newState.user ?? null);
  }
  notify();
}

/**
 * Resolves user profile and role from Supabase DB using the authenticated user id.
 */
async function fetchUserProfileAndRole(userId: string, email: string): Promise<User> {
  const [{ data: profile, error: profileError }, { data: roleRows, error: roleError }] =
    await Promise.all([
      supabase.from("profiles").select("full_name, email").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);

  if (roleError) {
    throw new Error(`Failed to resolve user roles: ${roleError.message}`);
  }

  const hasAdminRole = (roleRows ?? []).some((r) => r.role === "admin");
  const hasStudentRole = (roleRows ?? []).some((r) => r.role === "student");

  if (!hasAdminRole && !hasStudentRole) {
    throw new Error(
      "No authorized role assigned to this account. Please contact an administrator.",
    );
  }

  const resolvedRole: AppRole = hasAdminRole ? "ADMIN" : "STUDENT";

  return {
    id: userId,
    email: profile?.email || email,
    fullName: profile?.full_name || null,
    role: resolvedRole,
  };
}

async function doRestoreSession(): Promise<void> {
  if (typeof window === "undefined") {
    updateState({ user: null, loading: false });
    return;
  }

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error || !session?.user) {
      // If we had a cached user, let's also check getUser() in case getSession() was temporarily out of sync
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const user = await fetchUserProfileAndRole(userData.user.id, userData.user.email ?? "");
        updateState({ user, loading: false, pendingOAuth: null });
        return;
      }
      updateState({ user: null, loading: false });
      return;
    }

    const user = await fetchUserProfileAndRole(session.user.id, session.user.email ?? "");
    updateState({ user, loading: false, pendingOAuth: null });
  } catch (err) {
    // If fetching profile fails (e.g. offline/network glitch on refresh), keep cached user rather than logging out
    if (state.user) {
      updateState({ loading: false });
    } else {
      updateState({ user: null, loading: false });
    }
  }
}

// Subscribe to Supabase auth state changes on client
if (typeof window !== "undefined" && !isInitialized) {
  isInitialized = true;
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_OUT" || !session?.user) {
      updateState({ user: null, loading: false, pendingOAuth: null });
    } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
      try {
        const user = await fetchUserProfileAndRole(session.user.id, session.user.email ?? "");
        updateState({ user, loading: false, pendingOAuth: null });
      } catch (err) {
        const isGoogleNoRole =
          event === "SIGNED_IN" &&
          err instanceof Error &&
          /no authorized role/i.test(err.message) &&
          ((session.user.app_metadata?.["providers"] as string[] | undefined) ?? []).includes(
            "google",
          );
        if (isGoogleNoRole) {
          const meta = (session.user.user_metadata ?? {}) as Record<string, unknown>;
          updateState({
            user: null,
            loading: false,
            pendingOAuth: {
              email: session.user.email ?? null,
              fullName: typeof meta["full_name"] === "string" ? meta["full_name"] : null,
            },
          });
        } else if (state.user) {
          // If we already had an active valid user, do NOT wipe them out on background token refresh or network jitter
          updateState({ loading: false });
        } else {
          updateState({ user: null, loading: false });
        }
      }
    }
  });
}

export const authStore = {
  subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  /** True while a session/profile/role resolution is still in flight. */
  isLoading() {
    return state.loading;
  },

  // Client snapshot — returns live mutable state
  getSnapshot() {
    return state;
  },

  // Server snapshot — SSR always renders as unauthenticated/not-loading
  getServerSnapshot() {
    return SERVER_SNAPSHOT;
  },

  getUser() {
    return state.user;
  },

  getRole() {
    return state.user?.role ?? null;
  },

  getPendingOAuth() {
    return state.pendingOAuth;
  },

  /** Drop the unfinished-Google-signup continuation (user chose to leave it). */
  clearPendingOAuth() {
    updateState({ pendingOAuth: null });
  },

  getRestorePromise() {
    if (typeof window === "undefined") return Promise.resolve();
    if (!restorePromise) {
      restorePromise = doRestoreSession();
    }
    return restorePromise;
  },

  /**
   * Resolves once no auth resolution is in flight. Unlike getRestorePromise,
   * this also waits for newer onAuthStateChange resolutions that started after
   * the initial restore, so guards never act on a momentary null user.
   */
  whenSettled(timeoutMs = 8000): Promise<void> {
    // Server snapshots are static (no auth events fire during SSR)
    if (!state.loading || typeof window === "undefined") return Promise.resolve();
    return new Promise((resolve) => {
      const startedAt = Date.now();
      const timer = setInterval(() => {
        if (!state.loading || Date.now() - startedAt >= timeoutMs) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  },

  async restoreSession(): Promise<void> {
    restorePromise = doRestoreSession();
    return restorePromise;
  },

  async login(credentials: { email: string; password: string }) {
    updateState({ loading: true });
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      updateState({ loading: false });
      throw error;
    }

    if (!data.user) {
      updateState({ loading: false });
      throw new Error("Login failed: no user returned");
    }

    const user = await fetchUserProfileAndRole(data.user.id, data.user.email ?? credentials.email);
    updateState({ user, loading: false, pendingOAuth: null });
    return { user, session: data.session };
  },

  async register(params: { email: string; password: string; fullName?: string }) {
    updateState({ loading: true });
    const { data, error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: {
          full_name: params.fullName || params.email.split("@")[0] || "Student",
          role: "student",
        },
      },
    });

    if (error) {
      updateState({ loading: false });
      throw error;
    }

    if (!data.user) {
      updateState({ loading: false });
      throw new Error("Registration failed: no user returned");
    }

    // Explicitly ensure profile / user_roles exist if triggers or email confirmations apply
    try {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email: data.user.email ?? params.email,
        full_name: params.fullName || params.email.split("@")[0] || "Student",
      });
      await supabase.from("user_roles").upsert({
        user_id: data.user.id,
        role: "student",
      });
    } catch {
      // Ignored if already handled by database trigger
    }

    const user = await fetchUserProfileAndRole(data.user.id, data.user.email ?? params.email);
    updateState({ user, loading: false, pendingOAuth: null });
    return { user, session: data.session };
  },

  async signInWithGoogle() {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    updateState({ loading: true });
    try {
      await supabase.auth.signOut();
    } finally {
      updateState({ user: null, loading: false });
    }
  },
};
